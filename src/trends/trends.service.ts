import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { Trend } from '../entities/trend.entity';

export interface CreateTrendDto {
  code: string;
  name: string;
  datetime: string;
  price?: number;
  avgPrice?: number;
  volume?: number;
  amount?: number;
  pct?: number;
}

export interface UpdateTrendDto {
  name?: string;
  datetime?: string;
  price?: number;
  avgPrice?: number;
  volume?: number;
  amount?: number;
  pct?: number;
}

export interface TrendQueryDto {
  code?: string;
  startDatetime?: string;
  endDatetime?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TrendsService {
  private readonly logger = new Logger(TrendsService.name);

  constructor(
    @InjectRepository(Trend)
    private readonly trendRepository: Repository<Trend>,
  ) {}

  /**
   * 创建趋势数据
   */
  async createTrend(createTrendDto: CreateTrendDto): Promise<Trend> {
    const trend = this.trendRepository.create(createTrendDto);
    return await this.trendRepository.save(trend);
  }

  /**
   * 批量创建趋势数据
   */
  async createTrends(createTrendDtos: CreateTrendDto[]): Promise<Trend[]> {
    const trends = this.trendRepository.create(createTrendDtos);
    return await this.trendRepository.save(trends);
  }

  /**
   * 获取所有趋势数据
   */
  async findAllTrends(
    queryDto: TrendQueryDto = {},
  ): Promise<{ trends: Trend[]; total: number }> {
    const {
      code,
      startDatetime,
      endDatetime,
      page = 1,
      limit = 10,
    } = queryDto;

    const where: Record<string, any> = {};

    if (code) {
      where.code = code;
    }

    if (startDatetime && endDatetime) {
      where.datetime = Between(startDatetime, endDatetime);
    }

    const options: FindManyOptions<Trend> = {
      where,
      order: { datetime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [trends, total] = await this.trendRepository.findAndCount(options);

    return { trends, total };
  }

  /**
   * 根据ID获取趋势数据
   */
  async findOneTrend(id: number): Promise<Trend | null> {
    return await this.trendRepository.findOne({ where: { id } });
  }

  /**
   * 更新趋势数据
   */
  async updateTrend(
    id: number,
    updateTrendDto: UpdateTrendDto,
  ): Promise<Trend | null> {
    await this.trendRepository.update(id, updateTrendDto);
    return await this.findOneTrend(id);
  }

  /**
   * 删除趋势数据
   */
  async removeTrend(id: number): Promise<void> {
    await this.trendRepository.delete(id);
  }

  /**
   * 根据代码和日期范围删除趋势数据
   */
  async removeTrendsByRange(
    code: string,
    startDatetime: string,
    endDatetime: string,
  ): Promise<void> {
    await this.trendRepository.delete({
      code,
      datetime: Between(startDatetime, endDatetime),
    });
  }
}
