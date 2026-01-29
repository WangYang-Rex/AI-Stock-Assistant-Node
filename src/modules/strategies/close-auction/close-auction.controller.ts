import { Controller, Post, Body } from '@nestjs/common';
import { CloseAuctionService } from './close-auction.service';
import type { EvaluateCloseAuctionDto } from './dto/evaluate-close-auction.dto';

@Controller('strategies/close-auction')
export class CloseAuctionController {
  constructor(private readonly service: CloseAuctionService) {}

  @Post('evaluate')
  async evaluate(@Body() dto: EvaluateCloseAuctionDto) {
    return this.service.evaluate(dto);
  }

  @Post('evaluate-by-symbol')
  async evaluateBySymbol(@Body() dto: { symbol: string; market?: number }) {
    return this.service.evaluateBySymbol(dto.symbol, dto.market ?? 1);
  }
}
