import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holding } from '../entities/holding.entity';
import { HoldingsController } from './holdings.controller';
import { HoldingsService } from './holdings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Holding])],
  controllers: [HoldingsController],
  providers: [HoldingsService],
  exports: [HoldingsService],
})
export class HoldingsModule {}
