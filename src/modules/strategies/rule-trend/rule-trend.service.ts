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
    const { data: klines } = await this.klineService.findKlines({
      code,
      period: 101, // 日线
      limit: 100,
      orderBy: 'ASC', // 升序排列计算指标
    });

    if (klines.length < 60) {
      this.logger.warn(`⚠️ 股票 ${code} K线数据不足 (当前: ${klines.length})`);
      return { success: false, message: '数据不足' };
    }

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

    // 4. 保存评估结果到各表
    const latestKline = klines[klines.length - 1];

    // --- 4.1 保存到了统一的策略信号表 (strategy_signal) ---
    const signal = new StrategySignal();
    signal.strategyCode = this.STRATEGY_CODE;
    signal.symbol = code;
    signal.tradeDate = latestKline.date;
    signal.allow = position.suggestedRatio > 0 ? 1 : 0;
    signal.confidence = Math.abs(result.score);
    signal.reasons = [
      ...result.reasons,
      risk.reason,
      position.message,
      decision.reason,
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
    };

    // --- 4.2 保存详细趋势快照 (trend_signals) ---
    const tSignal = new TrendSignal();
    tSignal.code = code;
    tSignal.tradeDate = latestKline.date;
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
    tRisk.tradeDate = latestKline.date;
    tRisk.stopTriggered = risk.shouldStop;
    tRisk.stopPrice = risk.stopPrice;
    tRisk.stopReason = risk.reason;

    if (risk.snapshot) {
      tRisk.atr14 = risk.snapshot.atr14;
      tRisk.ma10 = risk.snapshot.ma10;
      tRisk.ma20 = risk.snapshot.ma20;
    }

    try {
      // 批量 UPSERT 保存
      await Promise.all([
        this.signalRepo.upsert(signal, {
          conflictPaths: ['strategyCode', 'symbol', 'tradeDate'],
          skipUpdateIfNoValuesChanged: true,
        }),
        this.trendSignalRepo.upsert(tSignal, {
          conflictPaths: ['code', 'tradeDate'],
        }),
        this.trendRiskRepo.upsert(tRisk, {
          conflictPaths: ['code', 'tradeDate'],
        }),
      ]);

      this.logger.log(
        `✅ 股票 ${code} 评估完成: ${result.trend} | 建议操作: ${decision.action} (${decision.percent}%) | ${decision.reason}`,
      );
      return { success: true, result, risk, position, decision };
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
