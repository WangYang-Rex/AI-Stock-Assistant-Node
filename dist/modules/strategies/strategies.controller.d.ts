import { StrategyAggregateService } from './strategies.service';
import { StrategyDetailDto } from './dto/strategy-detail.dto';
import { QuerySignalDto, SignalListResponseDto } from './dto/query-signal.dto';
import { LatestSignalDto } from './dto/latest-signal.dto';
export declare class StrategiesController {
    private readonly aggregateService;
    constructor(aggregateService: StrategyAggregateService);
    getDetail(id: number): Promise<StrategyDetailDto>;
    querySignals(query: QuerySignalDto): Promise<SignalListResponseDto>;
    getLatestSignals(dto: LatestSignalDto): Promise<import("../../entities/strategy-signal.entity").StrategySignal[]>;
    getSignalById(id: number): Promise<import("../../entities/strategy-signal.entity").StrategySignal>;
}
