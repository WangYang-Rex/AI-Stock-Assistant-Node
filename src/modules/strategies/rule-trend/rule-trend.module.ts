import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuleTrendService } from './rule-trend.service';
import { RuleTrendController } from './rule-trend.controller';
import { StrategySignal } from '../../../entities/strategy-signal.entity';
import { TrendSignal } from '../../../entities/trend-signal.entity';
import { TrendRisk } from '../../../entities/trend-risk.entity';
import { Trading } from '../../../entities/trading.entity';
import { KlineModule } from '../../market/kline/kline.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StrategySignal, TrendSignal, TrendRisk, Trading]),
    KlineModule, // 需要获取K线数据
  ],
  providers: [RuleTrendService],
  controllers: [RuleTrendController],
  exports: [RuleTrendService],
})
export class RuleTrendModule {}
