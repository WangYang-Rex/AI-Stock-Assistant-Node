import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { AiSignal } from '../entities/aisignal.entity';

@Injectable()
export class AiSignalsService {
  constructor(
    @InjectRepository(AiSignal)
    private readonly aiSignalRepository: Repository<AiSignal>,
  ) {}

  // 创建AI信号记录
  async createAiSignal(aiSignalData: Partial<AiSignal>): Promise<AiSignal> {
    const aiSignal = this.aiSignalRepository.create(aiSignalData);
    return await this.aiSignalRepository.save(aiSignal);
  }

  // 批量创建AI信号记录
  async createMultipleAiSignals(
    aiSignalDataList: Partial<AiSignal>[],
  ): Promise<AiSignal[]> {
    const aiSignals = this.aiSignalRepository.create(aiSignalDataList);
    return await this.aiSignalRepository.save(aiSignals);
  }

  // 获取所有AI信号记录
  async findAll(): Promise<AiSignal[]> {
    return await this.aiSignalRepository.find({
      order: { signalTime: 'DESC' },
    });
  }

  // 根据股票代码获取AI信号记录
  async findBySymbol(symbol: string): Promise<AiSignal[]> {
    return await this.aiSignalRepository.find({
      where: { symbol },
      order: { signalTime: 'DESC' },
    });
  }

  // 根据信号类型获取AI信号记录
  async findBySignalType(
    signalType: 'buy' | 'sell' | 'hold',
  ): Promise<AiSignal[]> {
    return await this.aiSignalRepository.find({
      where: { signalType },
      order: { signalTime: 'DESC' },
    });
  }

  // 根据模型版本获取AI信号记录
  async findByModelVersion(modelVersion: string): Promise<AiSignal[]> {
    return await this.aiSignalRepository.find({
      where: { modelVersion },
      order: { signalTime: 'DESC' },
    });
  }

  // 根据股票代码和时间范围获取AI信号记录
  async findBySymbolAndTimeRange(
    symbol: string,
    startTime: Date,
    endTime: Date,
  ): Promise<AiSignal[]> {
    return await this.aiSignalRepository.find({
      where: {
        symbol,
        signalTime: Between(startTime, endTime),
      },
      order: { signalTime: 'ASC' },
    });
  }

  // 根据置信度范围获取AI信号记录
  async findByConfidenceRange(
    minConfidence: number,
    maxConfidence: number,
  ): Promise<AiSignal[]> {
    return await this.aiSignalRepository.find({
      where: {
        confidence: Between(minConfidence, maxConfidence),
      },
      order: { signalTime: 'DESC' },
    });
  }

  // 获取最新AI信号记录
  async findLatest(symbol?: string, limit: number = 100): Promise<AiSignal[]> {
    const queryBuilder = this.aiSignalRepository.createQueryBuilder('aiSignal');

    if (symbol) {
      queryBuilder.where('aiSignal.symbol = :symbol', { symbol });
    }

    return await queryBuilder
      .orderBy('aiSignal.signalTime', 'DESC')
      .limit(limit)
      .getMany();
  }

  // 根据股票代码和信号类型获取记录
  async getSignalsBySymbolAndType(
    symbol: string,
    signalType: 'buy' | 'sell' | 'hold',
  ): Promise<AiSignal[]> {
    return await this.aiSignalRepository.find({
      where: { symbol, signalType },
      order: { signalTime: 'DESC' },
    });
  }

  // 获取高置信度信号
  async getHighConfidenceSignals(
    minConfidence: number = 80,
    limit: number = 50,
  ): Promise<AiSignal[]> {
    return await this.aiSignalRepository.find({
      where: {
        confidence: MoreThan(minConfidence),
      },
      order: { confidence: 'DESC', signalTime: 'DESC' },
      take: limit,
    });
  }

  // 获取AI信号统计信息
  async getAiSignalStats(
    symbol?: string,
    startTime?: Date,
    endTime?: Date,
  ): Promise<{
    totalSignals: number;
    buySignals: number;
    sellSignals: number;
    holdSignals: number;
    avgConfidence: number;
    highConfidenceSignals: number;
    byModelVersion: { modelVersion: string; count: number }[];
    bySymbol: { symbol: string; count: number }[];
  }> {
    const queryBuilder = this.aiSignalRepository.createQueryBuilder('aiSignal');

    if (symbol) {
      queryBuilder.where('aiSignal.symbol = :symbol', { symbol });
    }

    if (startTime && endTime) {
      queryBuilder.andWhere(
        'aiSignal.signalTime BETWEEN :startTime AND :endTime',
        {
          startTime,
          endTime,
        },
      );
    }

    const signals = await queryBuilder.getMany();

    const totalSignals = signals.length;
    const buySignals = signals.filter((s) => s.signalType === 'buy').length;
    const sellSignals = signals.filter((s) => s.signalType === 'sell').length;
    const holdSignals = signals.filter((s) => s.signalType === 'hold').length;

    const avgConfidence =
      signals.length > 0
        ? signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
        : 0;

    const highConfidenceSignals = signals.filter(
      (s) => s.confidence >= 80,
    ).length;

    // 按模型版本统计
    const modelVersionMap = new Map<string, number>();
    signals.forEach((signal) => {
      const count = modelVersionMap.get(signal.modelVersion) || 0;
      modelVersionMap.set(signal.modelVersion, count + 1);
    });
    const byModelVersion = Array.from(modelVersionMap.entries()).map(
      ([modelVersion, count]) => ({
        modelVersion,
        count,
      }),
    );

    // 按股票代码统计
    const symbolMap = new Map<string, number>();
    signals.forEach((signal) => {
      const count = symbolMap.get(signal.symbol) || 0;
      symbolMap.set(signal.symbol, count + 1);
    });
    const bySymbol = Array.from(symbolMap.entries()).map(([symbol, count]) => ({
      symbol,
      count,
    }));

    return {
      totalSignals,
      buySignals,
      sellSignals,
      holdSignals,
      avgConfidence,
      highConfidenceSignals,
      byModelVersion,
      bySymbol,
    };
  }

  // 更新AI信号记录
  async updateAiSignal(
    id: number,
    updateData: Partial<AiSignal>,
  ): Promise<AiSignal | null> {
    await this.aiSignalRepository.update(id, updateData);
    return await this.aiSignalRepository.findOne({ where: { id } });
  }

  // 删除AI信号记录
  async deleteAiSignal(id: number): Promise<boolean> {
    const result = await this.aiSignalRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // 清理过期数据（保留最近N天的数据）
  async cleanOldData(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.aiSignalRepository.delete({
      signalTime: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }
}
