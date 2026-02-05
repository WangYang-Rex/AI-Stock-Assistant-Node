import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloseAuctionService } from './close-auction.service';
import { CloseAuctionController } from './close-auction.controller';
import { StrategySignal } from '../../../entities/strategy-signal.entity';
import { StrategyResult } from '../../../entities/strategy-result.entity';
import { Strategy } from '../../../entities/strategy.entity';
import { StrategyParams } from '../../../entities/strategy-params.entity';
import { StrategyMetrics } from '../../../entities/strategy-metrics.entity';
import { StrategyEquityCurve } from '../../../entities/strategy-equity-curve.entity';
import { TrendsModule } from '../../market/trends/trends.module';
import { StockModule } from '../../market/stock/stock.module';
import { CommonModule } from '../../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StrategySignal,
      StrategyResult,
      Strategy,
      StrategyParams,
      StrategyMetrics,
      StrategyEquityCurve,
    ]),
    TrendsModule,
    StockModule,
    CommonModule,
  ],
  providers: [CloseAuctionService],
  controllers: [CloseAuctionController],
  exports: [CloseAuctionService],
})
export class CloseAuctionModule {}
