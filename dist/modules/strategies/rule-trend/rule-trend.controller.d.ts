import { RuleTrendService } from './rule-trend.service';
import { EvaluateRuleTrendDto, EvaluateRuleTrendBatchDto } from './dto/evaluate-rule-trend.dto';
export declare class RuleTrendController {
    private readonly ruleTrendService;
    constructor(ruleTrendService: RuleTrendService);
    evaluate(body: EvaluateRuleTrendDto): Promise<import("./rule-trend.service").EvaluationResult>;
    evaluateBatch(body: EvaluateRuleTrendBatchDto): Promise<import("./rule-trend.service").EvaluationResult[]>;
}
