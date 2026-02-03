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
export declare class StrategyAggregateService {
    private readonly strategyRepo;
    private readonly paramsRepo;
    private readonly metricsRepo;
    private readonly equityRepo;
    private readonly signalRepo;
    private readonly klineRepo;
    constructor(strategyRepo: Repository<Strategy>, paramsRepo: Repository<StrategyParams>, metricsRepo: Repository<StrategyMetrics>, equityRepo: Repository<StrategyEquityCurve>, signalRepo: Repository<StrategySignal>, klineRepo: Repository<Kline>);
    getStrategyDetail(id: number): Promise<StrategyDetailDto>;
    querySignals(query: QuerySignalDto): Promise<SignalListResponseDto>;
    getLatestSignals(dto: LatestSignalDto): Promise<StrategySignal[]>;
    getSignalById(id: number): Promise<StrategySignal>;
    getSignalSummary(date?: string): Promise<any>;
}
