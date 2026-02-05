import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloseAuctionService } from './close-auction.service';
import { CloseAuctionController } from './close-auction.controller';
import { ResonanceBacktestService } from './resonance-backtest.service';
import { StrategySignal } from '../../../entities/strategy-signal.entity';
import { StrategyResult } from '../../../entities/strategy-result.entity';
import { Strategy } from '../../../entities/strategy.entity';
import { StrategyParams } from '../../../entities/strategy-params.entity';
import { StrategyMetrics } from '../../../entities/strategy-metrics.entity';
import { StrategyEquityCurve } from '../../../entities/strategy-equity-curve.entity';
import { TrendsModule } from '../../market/trends/trends.module';
import { StockModule } from '../../market/stock/stock.module';
import { CommonModule } from '../../../common/common.module';
import { MinuteBarModule } from '../../market/minute-bar/minute-bar.module';
import { KlineModule } from '../../market/kline/kline.module';

import { ResonanceIndicatorService } from './resonance-indicator.service';

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
    MinuteBarModule,
    KlineModule,
  ],
  providers: [
    CloseAuctionService,
    ResonanceIndicatorService,
    ResonanceBacktestService,
  ],
  controllers: [CloseAuctionController],
  exports: [
    CloseAuctionService,
    ResonanceIndicatorService,
    ResonanceBacktestService,
  ],
})
export class CloseAuctionModule {}
