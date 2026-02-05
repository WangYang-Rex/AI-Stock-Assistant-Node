import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMinuteBar } from '../../../entities/stock-minute-bar.entity';
import { DBMinuteProvider } from './db-minute.provider';
import { CachedMinuteProvider } from './cached-minute.provider';
import { MinuteBarService } from './minute-bar.service';
import { MinuteBarController } from './minute-bar.controller';

import { StockModule } from '../stock/stock.module';

@Module({
  imports: [TypeOrmModule.forFeature([StockMinuteBar]), StockModule],
  controllers: [MinuteBarController],
  providers: [
    MinuteBarService,
    DBMinuteProvider,
    {
      provide: 'ConstituentsMinuteProvider',
      useFactory: (dbProvider: DBMinuteProvider) => {
        return new CachedMinuteProvider(dbProvider);
      },
      inject: [DBMinuteProvider],
    },
  ],
  exports: ['ConstituentsMinuteProvider', MinuteBarService, TypeOrmModule],
})
export class MinuteBarModule {}
