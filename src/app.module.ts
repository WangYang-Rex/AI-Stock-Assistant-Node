import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { StockModule } from './stock/stock.module';
import { TradingModule } from './trading/trading.module';
import { QuotesModule } from './quotes/quotes.module';
import { HoldingsModule } from './holdings/holdings.module';
import { AiSignalsModule } from './aisignals/aisignals.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    StockModule,
    TradingModule,
    QuotesModule,
    HoldingsModule,
    AiSignalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
