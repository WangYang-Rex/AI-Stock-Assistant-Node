import { Module } from '@nestjs/common';
import { StockModule } from './stock/stock.module';
import { QuotesModule } from './quotes/quotes.module';
import { KlineModule } from './kline/kline.module';
import { TrendsModule } from './trends/trends.module';
import { TradingModule } from './trading/trading.module';

@Module({
  imports: [
    StockModule,
    QuotesModule,
    KlineModule,
    TrendsModule,
    TradingModule,
  ],
  exports: [
    StockModule,
    QuotesModule,
    KlineModule,
    TrendsModule,
    TradingModule,
  ],
})
export class MarketModule {}
