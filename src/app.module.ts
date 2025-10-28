import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { StockModule } from './stock/stock.module';
import { TradingModule } from './trading/trading.module';
import { AiSignalsModule } from './aisignals/aisignals.module';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    StockModule,
    TradingModule,
    AiSignalsModule,
    QuotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
