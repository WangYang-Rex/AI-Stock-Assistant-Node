import { Controller, Post, Body } from '@nestjs/common';
import { RuleTrendService } from './rule-trend.service';
import { ResponseService } from '../../../common/services/response.service';
import {
  EvaluateRuleTrendDto,
  EvaluateRuleTrendBatchDto,
} from './dto/evaluate-rule-trend.dto';

@Controller('strategies/rule-trend')
export class RuleTrendController {
  constructor(
    private readonly ruleTrendService: RuleTrendService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('evaluate')
  async evaluate(@Body() body: EvaluateRuleTrendDto) {
    return this.responseService.handleAsync(
      () => this.ruleTrendService.evaluateTrend(body.code),
      '趋势评估成功',
    );
  }

  @Post('batch-evaluate')
  async evaluateBatch(@Body() body: EvaluateRuleTrendBatchDto) {
    return this.responseService.handleAsync(
      () => this.ruleTrendService.evaluateAll(body.codes),
      '批量趋势评估成功',
    );
  }
}
