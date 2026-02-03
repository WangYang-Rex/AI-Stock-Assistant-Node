import { Repository } from 'typeorm';
import { KlineService } from '../../market/kline/kline.service';
import { StrategySignal } from '../../../entities/strategy-signal.entity';
import { TrendSignal } from '../../../entities/trend-signal.entity';
import { TrendRisk } from '../../../entities/trend-risk.entity';
import { Trading } from '../../../entities/trading.entity';
import { TrendResult, RiskResult, PositionResult, PositionDecision, ExecSignal } from '../../../lib/stock/ruleTrendModel';
export interface EvaluationResult {
    code?: string;
    success: boolean;
    result?: TrendResult;
    risk?: RiskResult;
    position?: PositionResult;
    decision?: PositionDecision;
    exec?: ExecSignal;
    message?: string;
    error?: string;
}
export declare class RuleTrendService {
    private readonly klineService;
    private readonly signalRepo;
    private readonly trendSignalRepo;
    private readonly trendRiskRepo;
    private readonly tradingRepo;
    private readonly logger;
    private readonly STRATEGY_CODE;
    constructor(klineService: KlineService, signalRepo: Repository<StrategySignal>, trendSignalRepo: Repository<TrendSignal>, trendRiskRepo: Repository<TrendRisk>, tradingRepo: Repository<Trading>);
    evaluateTrend(code: string): Promise<EvaluationResult>;
    evaluateAll(codes: string[]): Promise<EvaluationResult[]>;
}
