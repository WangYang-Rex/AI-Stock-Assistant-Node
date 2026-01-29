import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { StockModule } from '../market/stock/stock.module';
import { TrendsModule } from '../market/trends/trends.module';
import { CloseAuctionModule } from '../strategies/close-auction/close-auction.module';

@Module({
  imports: [StockModule, TrendsModule, CloseAuctionModule],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
