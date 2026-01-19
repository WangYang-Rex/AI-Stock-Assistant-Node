import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrendsController } from './trends.controller';
import { TrendsService } from './trends.service';
import { Trend } from '../entities/trend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trend])],
  controllers: [TrendsController],
  providers: [TrendsService],
  exports: [TrendsService],
})
export class TrendsModule {}
