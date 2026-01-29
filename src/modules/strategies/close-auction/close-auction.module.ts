import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloseAuctionService } from './close-auction.service';
import { CloseAuctionController } from './close-auction.controller';
import { StrategySignal } from '../../../entities/strategy-signal.entity';
import { StrategyResult } from '../../../entities/strategy-result.entity';
import { TrendsModule } from '../../market/trends/trends.module';
import { CommonModule } from '../../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StrategySignal, StrategyResult]),
    TrendsModule,
    CommonModule,
  ],
  providers: [CloseAuctionService],
  controllers: [CloseAuctionController],
  exports: [CloseAuctionService],
})
export class CloseAuctionModule {}
