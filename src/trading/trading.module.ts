import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trading } from '../entities/trading.entity';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Trading])],
  controllers: [TradingController],
  providers: [TradingService],
  exports: [TradingService],
})
export class TradingModule {}
