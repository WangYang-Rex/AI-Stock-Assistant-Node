import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KlineController } from './kline.controller';
import { KlineService } from './kline.service';
import { Kline } from '../entities/kline.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kline]), // 注册Kline实体
    CommonModule, // 导入公共模块（ResponseService等）
  ],
  controllers: [KlineController],
  providers: [KlineService],
  exports: [KlineService], // 导出Service供其他模块使用
})
export class KlineModule { }
