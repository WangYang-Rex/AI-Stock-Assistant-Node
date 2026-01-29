import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trading } from '../../../entities/trading.entity';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { CommonModule } from '../../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trading]), CommonModule],
  controllers: [TradingController],
  providers: [TradingService],
  exports: [TradingService],
})
export class TradingModule {}
