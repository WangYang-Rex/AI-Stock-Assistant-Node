import { Module } from '@nestjs/common';
import { StockModule } from './stock/stock.module';
import { QuotesModule } from './quotes/quotes.module';
import { KlineModule } from './kline/kline.module';
import { TrendsModule } from './trends/trends.module';
import { TradingModule } from './trading/trading.module';
import { MinuteBarModule } from './minute-bar/minute-bar.module';

@Module({
  imports: [
    StockModule,
    QuotesModule,
    KlineModule,
    TrendsModule,
    TradingModule,
    MinuteBarModule,
  ],
  exports: [
    StockModule,
    QuotesModule,
    KlineModule,
    TrendsModule,
    TradingModule,
    MinuteBarModule,
  ],
})
export class MarketModule {}
