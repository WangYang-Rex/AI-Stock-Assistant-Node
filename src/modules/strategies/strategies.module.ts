import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloseAuctionModule } from './close-auction/close-auction.module';
import { RuleTrendModule } from './rule-trend/rule-trend.module';
import { StrategyAggregateService } from './strategies.service';
import { StrategyBacktestService } from './backtest.service';
import { StrategiesController } from './strategies.controller';
import { Strategy } from '../../entities/strategy.entity';
import { StrategyParams } from '../../entities/strategy-params.entity';
import { StrategyMetrics } from '../../entities/strategy-metrics.entity';
import { StrategyEquityCurve } from '../../entities/strategy-equity-curve.entity';
import { StrategySignal } from '../../entities/strategy-signal.entity';
import { StrategyResult } from '../../entities/strategy-result.entity';
import { Kline } from '../../entities/kline.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Strategy,
      StrategyParams,
      StrategyMetrics,
      StrategyEquityCurve,
      StrategySignal,
      StrategyResult,
      Kline,
    ]),
    CloseAuctionModule,
    RuleTrendModule,
  ],
  providers: [StrategyAggregateService, StrategyBacktestService],
  controllers: [StrategiesController],
  exports: [StrategyAggregateService, StrategyBacktestService],
})
export class StrategyModule {}
