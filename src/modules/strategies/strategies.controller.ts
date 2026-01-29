import { Body, Controller, ParseIntPipe, Post } from '@nestjs/common';
import { StrategyAggregateService } from './strategies.service';
import { StrategyDetailDto } from './dto/strategy-detail.dto';
import { QuerySignalDto, SignalListResponseDto } from './dto/query-signal.dto';
import { LatestSignalDto } from './dto/latest-signal.dto';

@Controller('strategies')
export class StrategiesController {
  constructor(private readonly aggregateService: StrategyAggregateService) {}

  @Post('detail')
  async getDetail(
    @Body('id', ParseIntPipe) id: number,
  ): Promise<StrategyDetailDto> {
    return this.aggregateService.getStrategyDetail(id);
  }

  @Post('signals/query')
  async querySignals(
    @Body() query: QuerySignalDto,
  ): Promise<SignalListResponseDto> {
    return this.aggregateService.querySignals(query);
  }

  @Post('signals/latest')
  async getLatestSignals(@Body() dto: LatestSignalDto) {
    return this.aggregateService.getLatestSignals(dto);
  }

  @Post('signals/detail')
  async getSignalById(@Body('id', ParseIntPipe) id: number) {
    return this.aggregateService.getSignalById(id);
  }
}
