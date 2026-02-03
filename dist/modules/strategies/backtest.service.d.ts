import { Repository } from 'typeorm';
import { StrategySignal } from '../../entities/strategy-signal.entity';
import { StrategyResult } from '../../entities/strategy-result.entity';
import { Kline } from '../../entities/kline.entity';
export declare class StrategyBacktestService {
    private readonly signalRepo;
    private readonly resultRepo;
    private readonly klineRepo;
    private readonly logger;
    constructor(signalRepo: Repository<StrategySignal>, resultRepo: Repository<StrategyResult>, klineRepo: Repository<Kline>);
    settleRecentSignals(): Promise<void>;
}
