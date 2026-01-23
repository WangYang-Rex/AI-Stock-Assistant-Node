import { Controller, Post, Body } from '@nestjs/common';
import { AiSignalsService } from './aisignals.service';
import { AiSignal } from '../../entities/aisignal.entity';
import { ResponseService } from '../../common/services/response.service';
import { ApiResponse } from '../../common/dto/response.dto';

@Controller('aisignals')
export class AiSignalsController {
  constructor(
    private readonly aiSignalsService: AiSignalsService,
    private readonly responseService: ResponseService,
  ) {}

  // 创建AI信号记录
  @Post('create')
  async createAiSignal(@Body() aiSignalData: Partial<AiSignal>) {
    return await this.aiSignalsService.createAiSignal(aiSignalData);
  }

  // 批量创建AI信号记录
  @Post('create-batch')
  async createMultipleAiSignals(
    @Body() body: { aiSignalDataList: Partial<AiSignal>[] },
  ) {
    return await this.aiSignalsService.createMultipleAiSignals(
      body.aiSignalDataList,
    );
  }

  // 获取所有AI信号记录
  @Post('list')
  async getAllAiSignals() {
    return await this.aiSignalsService.findAll();
  }

  // 根据股票代码获取AI信号记录
  @Post('get-by-symbol')
  async getAiSignalsBySymbol(@Body() body: { symbol: string }) {
    return await this.aiSignalsService.findBySymbol(body.symbol);
  }

  // 根据信号类型获取AI信号记录
  @Post('get-by-signal-type')
  async getAiSignalsBySignalType(
    @Body() body: { signalType: 'buy' | 'sell' | 'hold' },
  ) {
    return await this.aiSignalsService.findBySignalType(body.signalType);
  }

  // 根据模型版本获取AI信号记录
  @Post('get-by-model-version')
  async getAiSignalsByModelVersion(@Body() body: { modelVersion: string }) {
    return await this.aiSignalsService.findByModelVersion(body.modelVersion);
  }

  // 根据股票代码和时间范围获取AI信号记录
  @Post('get-by-symbol-and-time-range')
  async getAiSignalsBySymbolAndTimeRange(
    @Body()
    body: {
      symbol: string;
      startTime: string;
      endTime: string;
    },
  ) {
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);
    return await this.aiSignalsService.findBySymbolAndTimeRange(
      body.symbol,
      startTime,
      endTime,
    );
  }

  // 根据置信度范围获取AI信号记录
  @Post('get-by-confidence-range')
  async getAiSignalsByConfidenceRange(
    @Body()
    body: {
      minConfidence: number;
      maxConfidence: number;
    },
  ) {
    return await this.aiSignalsService.findByConfidenceRange(
      body.minConfidence,
      body.maxConfidence,
    );
  }

  // 获取最新AI信号记录
  @Post('get-latest')
  async getLatestAiSignals(
    @Body()
    body: {
      symbol?: string;
      limit?: number;
    },
  ) {
    return await this.aiSignalsService.findLatest(
      body.symbol,
      body.limit || 100,
    );
  }

  // 根据股票代码和信号类型获取记录
  @Post('get-by-symbol-and-type')
  async getAiSignalsBySymbolAndType(
    @Body()
    body: {
      symbol: string;
      signalType: 'buy' | 'sell' | 'hold';
    },
  ) {
    return await this.aiSignalsService.getSignalsBySymbolAndType(
      body.symbol,
      body.signalType,
    );
  }

  // 获取高置信度信号
  @Post('get-high-confidence')
  async getHighConfidenceSignals(
    @Body()
    body: {
      minConfidence?: number;
      limit?: number;
    },
  ) {
    return await this.aiSignalsService.getHighConfidenceSignals(
      body.minConfidence || 80,
      body.limit || 50,
    );
  }

  // 获取AI信号统计信息
  @Post('stats')
  async getAiSignalStats(
    @Body()
    body: {
      symbol?: string;
      startTime?: string;
      endTime?: string;
    },
  ) {
    const startTime = body.startTime ? new Date(body.startTime) : undefined;
    const endTime = body.endTime ? new Date(body.endTime) : undefined;
    return await this.aiSignalsService.getAiSignalStats(
      body.symbol,
      startTime,
      endTime,
    );
  }

  // 更新AI信号记录
  @Post('update')
  async updateAiSignal(
    @Body()
    body: {
      id: number;
      updateData: Partial<AiSignal>;
    },
  ) {
    return await this.aiSignalsService.updateAiSignal(body.id, body.updateData);
  }

  // 删除AI信号记录
  @Post('delete')
  async deleteAiSignal(@Body() body: { id: number }) {
    const success = await this.aiSignalsService.deleteAiSignal(body.id);
    return { success };
  }

  // 清理过期数据
  @Post('clean-old-data')
  async cleanOldData(@Body() body: { daysToKeep?: number }) {
    const deletedCount = await this.aiSignalsService.cleanOldData(
      body.daysToKeep || 30,
    );
    return { deletedCount, message: `已清理 ${deletedCount} 条过期数据` };
  }
}
