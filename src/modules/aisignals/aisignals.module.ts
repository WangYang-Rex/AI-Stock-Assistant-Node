import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiSignal } from '../../entities/aisignal.entity';
import { AiSignalsController } from './aisignals.controller';
import { AiSignalsService } from './aisignals.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([AiSignal]), CommonModule],
  controllers: [AiSignalsController],
  providers: [AiSignalsService],
  exports: [AiSignalsService],
})
export class AiSignalsModule {}
