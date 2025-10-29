import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { StockModule } from './stock/stock.module';
import { TradingModule } from './trading/trading.module';
import { AiSignalsModule } from './aisignals/aisignals.module';
import { QuotesModule } from './quotes/quotes.module';
import { CommonModule } from './common/common.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    StockModule,
    TradingModule,
    AiSignalsModule,
    QuotesModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
