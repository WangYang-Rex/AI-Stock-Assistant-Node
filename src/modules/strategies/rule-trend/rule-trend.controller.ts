import { Controller, Post, Body } from '@nestjs/common';
import { RuleTrendService } from './rule-trend.service';

@Controller('strategies/rule-trend')
export class RuleTrendController {
  constructor(private readonly ruleTrendService: RuleTrendService) {}

  @Post('evaluate')
  async evaluate(@Body() body: { code: string }) {
    return await this.ruleTrendService.evaluateTrend(body.code);
  }

  @Post('evaluate/batch')
  async evaluateBatch(@Body() body: { codes: string[] }) {
    return await this.ruleTrendService.evaluateAll(body.codes);
  }
}
