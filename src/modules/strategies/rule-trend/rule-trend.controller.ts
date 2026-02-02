import { Controller, Post, Body } from '@nestjs/common';
import { RuleTrendService } from './rule-trend.service';
import {
  EvaluateRuleTrendDto,
  EvaluateRuleTrendBatchDto,
} from './dto/evaluate-rule-trend.dto';

@Controller('strategies/rule-trend')
export class RuleTrendController {
  constructor(private readonly ruleTrendService: RuleTrendService) {}

  @Post('evaluate')
  async evaluate(@Body() body: EvaluateRuleTrendDto) {
    return await this.ruleTrendService.evaluateTrend(body.code);
  }

  @Post('batch-evaluate')
  async evaluateBatch(@Body() body: EvaluateRuleTrendBatchDto) {
    return await this.ruleTrendService.evaluateAll(body.codes);
  }
}
