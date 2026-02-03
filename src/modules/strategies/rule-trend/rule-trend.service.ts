import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KlineService } from '../../market/kline/kline.service';
import { StrategySignal } from '../../../entities/strategy-signal.entity';
import { TrendSignal } from '../../../entities/trend-signal.entity';
import { TrendRisk } from '../../../entities/trend-risk.entity';
import { Trading } from '../../../entities/trading.entity';
import {
  calcTrend,
  checkRisk,
  calcPosition,
  calcPositionAction,
  Kline as ModelKline,
  TrendResult,
  RiskResult,
  PositionResult,
  PositionDecision,
  ExecSignal,
  intradayExecute,
} from '../../../lib/stock/ruleTrendModel';

/**
 * 趋势评估结果接口
 */
export interface EvaluationResult {
  code?: string; // 股票代码
  success: boolean;
  result?: TrendResult;
  risk?: RiskResult;
  position?: PositionResult;
  decision?: PositionDecision;
  exec?: ExecSignal;
  message?: string;
  error?: string;
}

@Injectable()
export class RuleTrendService {
  private readonly logger = new Logger(RuleTrendService.name);
  private readonly STRATEGY_CODE = 'RULE_TREND_V1';

  constructor(
    private readonly klineService: KlineService,
    @InjectRepository(StrategySignal)
    private readonly signalRepo: Repository<StrategySignal>,
    @InjectRepository(TrendSignal)
    private readonly trendSignalRepo: Repository<TrendSignal>,
    @InjectRepository(TrendRisk)
    private readonly trendRiskRepo: Repository<TrendRisk>,
    @InjectRepository(Trading)
    private readonly tradingRepo: Repository<Trading>,
  ) {}

  /**
   * 评估指定股票的趋势和风险
   * @param code 股票代码
   */
  async evaluateTrend(code: string): Promise<EvaluationResult> {
    this.logger.log(`🔍 正在评估股票 ${code} 的趋势与风险...`);

    // 1. 获取最近 100 条日线数据
    // 1. 获取最近 100 条日线数据 (使用 DESC 获取最新 100 条，随后反转以符合指标计算顺序)
    const { data: klinesRaw } = await this.klineService.findKlines({
      code,
      period: 101, // 日线
      limit: 1000,
      orderBy: 'DESC',
    });

    if (klinesRaw.length < 60) {
      this.logger.warn(
        `⚠️ 股票 ${code} K线数据不足 (当前: ${klinesRaw.length})`,
      );
      return { success: false, message: '数据不足' };
    }

    // 重要：反转为升序 (ASC) 以进行趋势指标计算
    const klines = klinesRaw.reverse();

    // 2. 转换为计算模型所需的格式
    const modelKlines: ModelKline[] = klines.map((k) => ({
      date: k.date,
      open: Number(k.open),
      high: Number(k.high),
      low: Number(k.low),
      close: Number(k.close),
      volume: Number(k.volume),
    }));

    // 3. 调用核心计算模型
    const result = calcTrend(modelKlines);
    const risk = checkRisk(modelKlines);
    const position = calcPosition(result, risk);

    // --- 获取当前持仓情况 (基于 trading_records 表) ---
    const openRecords = await this.tradingRepo.find({
      where: { code, sell_date: null },
    });
    // 简化逻辑：如果有持仓记录，认为当前仓位为 建议仓位的一个参考值，或者假设每个记录代表 40%(首仓)
    // 这里为了演示 calcPositionAction，假设如果有持仓则为 40，否则为 0
    const currentPos = openRecords.length > 0 ? 40 : 0;
    const decision = calcPositionAction(result, risk, modelKlines, currentPos);

    // --- 3.5 执行层：获取分时数据并进行日内执行决策 ---
    let execResult: ExecSignal | undefined;
    if (
      result.trend === 'UP' &&
      result.strength !== 'WEAK' &&
      !risk.shouldStop
    ) {
      try {
        const klines5m = await this.klineService.fetchKlineFromApi({
          code,
          period: '5min',
          limit: 100, // 足够涵盖当天
        });

        if (klines5m && klines5m.length > 0) {
          const modelKlines5m: ModelKline[] = klines5m.map((k) => ({
            date: k.date,
            open: Number(k.open),
            high: Number(k.high),
            low: Number(k.low),
            close: Number(k.close),
            volume: Number(k.volume),
          }));

          execResult = intradayExecute(result, risk, {
            klines5m: modelKlines5m,
          });
        }
      } catch (err) {
        this.logger.error(
          `获取分时数据失败 [${code}]:`,
          (err as Error).message,
        );
      }
    }

    // 4. 保存评估结果到各表
    const latestKline = klines[klines.length - 1];
    // 确保 tradeDate 格式为 YYYY-MM-DD，特别是存入 StrategySignal 的 DATE 字段
    const tradeDate = latestKline.date.substring(0, 10);

    // --- 4.1 保存到了统一的策略信号表 (strategy_signal) ---
    const signal = new StrategySignal();
    signal.strategyCode = this.STRATEGY_CODE;
    signal.symbol = code;
    signal.tradeDate = tradeDate;
    signal.allow = position.suggestedRatio > 0 ? 1 : 0;
    signal.confidence = Math.abs(result.score);
    signal.reasons = [
      ...result.reasons,
      risk.reason,
      position.message,
      decision.reason,
      execResult?.reason || '无需分时执行',
    ];
    signal.evalTime = new Date();
    signal.price = latestKline.close;
    signal.volume = latestKline.volume;
    signal.extra = {
      trend: result.trend,
      strength: result.strength,
      score: result.score,
      risk: {
        shouldStop: risk.shouldStop,
        stopPrice: risk.stopPrice,
        reason: risk.reason,
      },
      position: {
        ratio: position.suggestedRatio,
        action: position.action,
        message: position.message,
      },
      decision: {
        action: decision.action,
        percent: decision.percent,
        reason: decision.reason,
      },
      exec: execResult,
    };

    // --- 4.2 保存详细趋势快照 (trend_signals) ---
    const tSignal = new TrendSignal();
    tSignal.code = code;
    tSignal.tradeDate = tradeDate;
    tSignal.trend = result.trend;
    tSignal.score = result.score;
    tSignal.strength = result.strength;
    tSignal.reasons = result.reasons;

    if (result.snapshot) {
      tSignal.ma5 = result.snapshot.ma5;
      tSignal.ma10 = result.snapshot.ma10;
      tSignal.ma20 = result.snapshot.ma20;
      tSignal.ma60 = result.snapshot.ma60;
      tSignal.ema20 = result.snapshot.ema20;
      tSignal.ema20Slope = result.snapshot.ema20Slope;
      tSignal.macdDif = result.snapshot.macd.dif;
      tSignal.macdDea = result.snapshot.macd.dea;
      tSignal.macdHist = result.snapshot.macd.hist;
      tSignal.rsi14 = result.snapshot.rsi;
      tSignal.price = result.snapshot.price;
      tSignal.volumeRatio = result.snapshot.volumeRatio;
    }

    // --- 4.3 保存风控快照 (trend_risks) ---
    const tRisk = new TrendRisk();
    tRisk.code = code;
    tRisk.tradeDate = tradeDate;
    tRisk.stopTriggered = risk.shouldStop;
    tRisk.stopPrice = risk.stopPrice;
    tRisk.stopReason = risk.reason;

    if (risk.snapshot) {
      tRisk.atr14 = risk.snapshot.atr14;
      tRisk.ma10 = risk.snapshot.ma10;
      tRisk.ma20 = risk.snapshot.ma20;
    } else {
      // 补充缺失的必填字段
      tRisk.atr14 = 0;
      tRisk.ma10 = 0;
      tRisk.ma20 = 0;
    }

    try {
      // 批量 UPSERT 保存 (使用 QueryBuilder 以避免 Upsert 方法在某些 TypeORM 版本中的 ID 问题)
      await Promise.all([
        // 1. 保存到了统一的策略信号表 (strategy_signal)
        this.signalRepo
          .createQueryBuilder()
          .insert()
          .into(StrategySignal)
          .values({
            strategyCode: signal.strategyCode,
            symbol: signal.symbol,
            tradeDate: signal.tradeDate,
            allow: signal.allow,
            confidence: signal.confidence,
            reasons: signal.reasons,
            evalTime: signal.evalTime,
            price: signal.price,
            volume: signal.volume,
            extra: signal.extra as Record<string, any>,
          })
          .orUpdate(
            [
              'allow',
              'confidence',
              'reasons',
              'eval_time',
              'price',
              'volume',
              'extra',
            ],
            ['strategy_code', 'symbol', 'trade_date'],
          )
          .updateEntity(false)
          .execute(),

        // 2. 保存详细趋势快照 (trend_signals)
        this.trendSignalRepo
          .createQueryBuilder()
          .insert()
          .into(TrendSignal)
          .values({
            code: tSignal.code,
            tradeDate: tSignal.tradeDate,
            trend: tSignal.trend,
            score: tSignal.score,
            strength: tSignal.strength,
            ma5: tSignal.ma5,
            ma10: tSignal.ma10,
            ma20: tSignal.ma20,
            ma60: tSignal.ma60,
            ema20: tSignal.ema20,
            ema20Slope: tSignal.ema20Slope,
            macdDif: tSignal.macdDif,
            macdDea: tSignal.macdDea,
            macdHist: tSignal.macdHist,
            rsi14: tSignal.rsi14,
            price: tSignal.price,
            volumeRatio: tSignal.volumeRatio,
            reasons: tSignal.reasons,
          })
          .orUpdate(
            [
              'trend',
              'score',
              'strength',
              'ma5',
              'ma10',
              'ma20',
              'ma60',
              'ema20',
              'ema20Slope',
              'macdDif',
              'macdDea',
              'macdHist',
              'rsi14',
              'price',
              'volumeRatio',
              'reasons',
            ],
            ['code', 'trade_date'],
          )
          .updateEntity(false)
          .execute(),

        // 3. 保存风控快照 (trend_risks)
        this.trendRiskRepo
          .createQueryBuilder()
          .insert()
          .into(TrendRisk)
          .values({
            code: tRisk.code,
            tradeDate: tRisk.tradeDate,
            atr14: tRisk.atr14,
            stopPrice: tRisk.stopPrice,
            ma10: tRisk.ma10,
            ma20: tRisk.ma20,
            stopTriggered: tRisk.stopTriggered,
            stopReason: tRisk.stopReason,
          })
          .orUpdate(
            [
              'atr14',
              'stopPrice',
              'ma10',
              'ma20',
              'stop_triggered',
              'stop_reason',
            ],
            ['code', 'trade_date'],
          )
          .updateEntity(false)
          .execute(),
      ]);

      this.logger.log(
        `✅ 股票 ${code} 评估完成: ${result.trend} | 建议操作: ${decision.action} (${decision.percent}%) | 执行建议: ${execResult?.action || 'HOLD'} | ${decision.reason}`,
      );
      return {
        success: true,
        result,
        risk,
        position,
        decision,
        exec: execResult,
      };
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(`❌ 保存股票 ${code} 策略数据失败:`, error.stack);
      return { success: false, message: '数据存库失败', error: error.message };
    }
  }

  /**
   * 批量评估所有股票
   */
  async evaluateAll(codes: string[]): Promise<EvaluationResult[]> {
    this.logger.log(`🚀 开始批量评估 ${codes.length} 只股票...`);
    const results: EvaluationResult[] = [];
    for (const code of codes) {
      const res = await this.evaluateTrend(code);
      results.push({ code, ...res });
    }
    return results;
  }
}
