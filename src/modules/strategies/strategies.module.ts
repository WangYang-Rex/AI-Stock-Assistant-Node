import { Module } from '@nestjs/common';
import { CloseAuctionModule } from './close-auction/close-auction.module';

@Module({
  imports: [CloseAuctionModule],
  exports: [CloseAuctionModule],
})
export class StrategyModule {}
