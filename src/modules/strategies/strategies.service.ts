import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Strategy } from '../../entities/strategy.entity';
import { StrategyParams } from '../../entities/strategy-params.entity';
import { StrategyMetrics } from '../../entities/strategy-metrics.entity';
import { StrategyEquityCurve } from '../../entities/strategy-equity-curve.entity';
import { StrategySignal } from '../../entities/strategy-signal.entity';
import { StrategyDetailDto } from './dto/strategy-detail.dto';
import { QuerySignalDto, SignalListResponseDto } from './dto/query-signal.dto';
import { LatestSignalDto } from './dto/latest-signal.dto';
import { Kline } from '../../entities/kline.entity';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

@Injectable()
export class StrategyAggregateService {
  constructor(
    @InjectRepository(Strategy)
    private readonly strategyRepo: Repository<Strategy>,
    @InjectRepository(StrategyParams)
    private readonly paramsRepo: Repository<StrategyParams>,
    @InjectRepository(StrategyMetrics)
    private readonly metricsRepo: Repository<StrategyMetrics>,
    @InjectRepository(StrategyEquityCurve)
    private readonly equityRepo: Repository<StrategyEquityCurve>,
    @InjectRepository(StrategySignal)
    private readonly signalRepo: Repository<StrategySignal>,
    @InjectRepository(Kline)
    private readonly klineRepo: Repository<Kline>,
  ) {}

  /**
   * 聚合获取策略详情的所有数据，供前端一次性渲染
   */
  async getStrategyDetail(id: number): Promise<StrategyDetailDto> {
    const strategy = await this.strategyRepo.findOne({ where: { id } });
    if (!strategy) {
      throw new NotFoundException(`策略 ID ${id} 未找到`);
    }

    const [params, metrics, equityCurve, signals, klines] = await Promise.all([
      this.paramsRepo.findOne({ where: { strategyId: id } }),
      this.metricsRepo.findOne({ where: { strategyId: id } }),
      this.equityRepo.find({
        where: { strategyId: id },
        order: { date: 'ASC' },
      }),
      this.signalRepo.find({
        where: { strategyCode: strategy.code, symbol: strategy.symbol },
        order: { tradeDate: 'ASC' },
      }),
      this.klineRepo.find({
        where: { code: strategy.symbol },
        order: { date: 'ASC' },
        take: 100, // 示例取最近100条
      }),
    ]);

    return {
      strategy: {
        id: strategy.id,
        name: strategy.name,
        code: strategy.code,
        symbol: strategy.symbol,
        status: strategy.status,
        params: params?.params || {},
      },
      metrics: {
        totalReturn: Number(metrics?.totalReturn || 0),
        annualReturn: Number(metrics?.annualReturn || 0),
        maxDrawdown: Number(metrics?.maxDrawdown || 0),
        winRate: Number(metrics?.winRate || 0),
        tradeCount: metrics?.tradeCount || 0,
      },
      priceSeries: klines.map((k) => ({
        date: k.date,
        close: Number(k.close),
      })),
      trades: signals.map((s) => ({
        date: s.tradeDate,
        price: Number(s.price),
        side: 'BUY', // 尾盘策略目前默认为买入信号
        allow: s.allow === 1,
      })),
      equityCurve: equityCurve.map((e) => ({
        date: e.date,
        equity: Number(e.equity),
      })),
    };
  }

  /**
   * 分页查询策略信号
   */
  async querySignals(query: QuerySignalDto): Promise<SignalListResponseDto> {
    const {
      strategyCode,
      symbol,
      startDate,
      endDate,
      allowOnly,
      minConfidence,
      page,
      pageSize,
    } = query;

    const queryBuilder = this.signalRepo.createQueryBuilder('signal');

    if (strategyCode) {
      queryBuilder.andWhere('signal.strategyCode = :strategyCode', {
        strategyCode,
      });
    }
    if (symbol) {
      queryBuilder.andWhere('signal.symbol = :symbol', { symbol });
    }
    if (startDate && endDate) {
      queryBuilder.andWhere('signal.tradeDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('signal.tradeDate >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('signal.tradeDate <= :endDate', { endDate });
    }

    if (allowOnly) {
      queryBuilder.andWhere('signal.allow = 1');
    }
    if (minConfidence) {
      queryBuilder.andWhere('signal.confidence >= :minConfidence', {
        minConfidence,
      });
    }

    const [list, total] = await queryBuilder
      .orderBy('signal.tradeDate', 'DESC')
      .addOrderBy('signal.evalTime', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /**
   * 获取最新信号
   */
  async getLatestSignals(dto: LatestSignalDto): Promise<StrategySignal[]> {
    const { limit = 10, strategyCode, symbol, allowOnly } = dto;
    const where: any = {};

    if (strategyCode) where.strategyCode = strategyCode;
    if (symbol) where.symbol = symbol;
    if (allowOnly) where.allow = 1;

    return this.signalRepo.find({
      where,
      order: { tradeDate: 'DESC', evalTime: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取信号详情
   */
  async getSignalById(id: number): Promise<StrategySignal> {
    const signal = await this.signalRepo.findOne({ where: { id } });
    if (!signal) {
      throw new NotFoundException(`信号 ID ${id} 未找到`);
    }
    return signal;
  }

  /**
   * 获取信号统计摘要 (今日)
   */
  async getSignalSummary(date?: string): Promise<any> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const signals = await this.signalRepo.find({
      where: { tradeDate: targetDate },
    });

    return {
      date: targetDate,
      total: signals.length,
      allowed: signals.filter((s) => s.allow === 1).length,
      denied: signals.filter((s) => s.allow === 0).length,
      avgConfidence:
        signals.length > 0
          ? signals.reduce((acc, s) => acc + s.confidence, 0) / signals.length
          : 0,
    };
  }
}
