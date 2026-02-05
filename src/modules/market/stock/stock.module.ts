import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { Stock } from '../../../entities/stock.entity';
import { EtfConstituent } from '../../../entities/etf-constituent.entity';
import { EtfConstituentsService } from './etf-constituents.service';

import { CommonModule } from '../../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Stock, EtfConstituent]), CommonModule],
  controllers: [StockController],
  providers: [StockService, EtfConstituentsService],
  exports: [StockService, EtfConstituentsService],
})
export class StockModule {}
