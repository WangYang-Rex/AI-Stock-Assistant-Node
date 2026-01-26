import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { StockModule } from '../stock/stock.module';
import { TrendsModule } from '../trends/trends.module';

@Module({
  imports: [StockModule, TrendsModule],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
