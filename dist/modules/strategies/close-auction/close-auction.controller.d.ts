import { CloseAuctionService } from './close-auction.service';
import { EvaluateBySymbolDto } from './dto/evaluate-by-symbol.dto';
export declare class CloseAuctionController {
    private readonly service;
    constructor(service: CloseAuctionService);
    evaluate(dto: EvaluateBySymbolDto): Promise<import("./dto/strategy-signal.dto").StrategySignalDto>;
}
