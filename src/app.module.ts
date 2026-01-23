import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { StockModule } from './modules/stock/stock.module';
import { TradingModule } from './modules/trading/trading.module';
import { AiSignalsModule } from './modules/aisignals/aisignals.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { CommonModule } from './common/common.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { KlineModule } from './modules/kline/kline.module';
import { TrendsModule } from './modules/trends/trends.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    HealthModule,
    StockModule,
    TradingModule,
    AiSignalsModule,
    QuotesModule,
    CommonModule,
    SchedulerModule,
    KlineModule,
    TrendsModule,
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
export class AppModule { }
