import { Controller, Post, Body } from '@nestjs/common';
import { CloseAuctionService } from './close-auction.service';
@Controller('strategies/close-auction')
export class CloseAuctionController {
  constructor(private readonly service: CloseAuctionService) {}

  @Post('evaluate-by-symbol')
  async evaluateBySymbol(@Body() dto: { symbol: string; market?: number }) {
    return this.service.evaluateBySymbol(dto.symbol, dto.market ?? 1);
  }
}
