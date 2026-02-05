import { Controller, Post, Body } from '@nestjs/common';
import { CloseAuctionService } from './close-auction.service';
import { EvaluateBySymbolDto } from './dto/evaluate-by-symbol.dto';
import { ResonanceBacktestService } from './resonance-backtest.service';

@Controller('strategies/close-auction')
export class CloseAuctionController {
  constructor(
    private readonly service: CloseAuctionService,
    private readonly backtestService: ResonanceBacktestService,
  ) {}

  @Post('evaluate')
  async evaluate(@Body() dto: EvaluateBySymbolDto) {
    return this.service.evaluateBySymbol(dto.symbol, dto.market ?? 1);
  }

  @Post('backtest')
  async backtest(@Body() dto: { etfCode: string; dates: string[] }) {
    return this.backtestService.backtest(dto.etfCode, dto.dates);
  }
}
