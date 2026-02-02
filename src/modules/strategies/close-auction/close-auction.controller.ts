import { Controller, Post, Body } from '@nestjs/common';
import { CloseAuctionService } from './close-auction.service';
import { EvaluateBySymbolDto } from './dto/evaluate-by-symbol.dto';

@Controller('strategies/close-auction')
export class CloseAuctionController {
  constructor(private readonly service: CloseAuctionService) {}

  @Post('evaluate')
  async evaluate(@Body() dto: EvaluateBySymbolDto) {
    return this.service.evaluateBySymbol(dto.symbol, dto.market ?? 1);
  }
}
