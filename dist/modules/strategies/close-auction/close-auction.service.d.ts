import { Repository } from 'typeorm';
import { EvaluateCloseAuctionDto } from './dto/evaluate-close-auction.dto';
import { StrategySignal } from '../../../entities/strategy-signal.entity';
import { TrendsService } from '../../market/trends/trends.service';
import { DingtalkService } from '../../../common/services/dingtalk.service';
import { StrategySignalDto } from './dto/strategy-signal.dto';
export declare class CloseAuctionService {
    private readonly signalRepo;
    private readonly trendsService;
    private readonly dingtalkService;
    constructor(signalRepo: Repository<StrategySignal>, trendsService: TrendsService, dingtalkService: DingtalkService);
    evaluateBySymbol(symbol: string, market?: number): Promise<StrategySignalDto>;
    evaluate(input: EvaluateCloseAuctionDto): Promise<StrategySignalDto>;
    private sendSignalActionCard;
}
