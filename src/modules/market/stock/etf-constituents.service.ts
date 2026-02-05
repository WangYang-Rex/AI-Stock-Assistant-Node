import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull, MoreThan } from 'typeorm';
import { EtfConstituent } from '../../../entities/etf-constituent.entity';

@Injectable()
export class EtfConstituentsService {
  constructor(
    @InjectRepository(EtfConstituent)
    private readonly repo: Repository<EtfConstituent>,
  ) {}

  /**
   * 获取ETF在特定日期的前N大成分股
   * @param etfCode ETF代码 (如 588080)
   * @param date 日期 (YYYY-MM-DD)
   * @param topN 前几名
   */
  async getTopConstituents(etfCode: string, date: string, topN = 10) {
    return this.repo.find({
      where: [
        {
          etfCode,
          effectiveDate: LessThanOrEqual(date),
          expireDate: IsNull(),
          rank: LessThanOrEqual(topN),
        },
        {
          etfCode,
          effectiveDate: LessThanOrEqual(date),
          expireDate: MoreThan(date),
          rank: LessThanOrEqual(topN),
        },
      ],
      order: { rank: 'ASC' },
    });
  }

  /**
   * 获取所有ETF成分股数据
   */
  async findAll(query: { etfCode?: string; stockCode?: string }) {
    const where: { etfCode?: string; stockCode?: string } = {};
    if (query.etfCode) where.etfCode = query.etfCode;
    if (query.stockCode) where.stockCode = query.stockCode;
    return this.repo.find({ where, order: { etfCode: 'ASC', rank: 'ASC' } });
  }

  /**
   * 根据ID查询
   */
  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * 创建单一记录
   */
  async create(data: Partial<EtfConstituent>) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  /**
   * 更新记录
   */
  async update(id: number, data: Partial<EtfConstituent>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  /**
   * 删除记录
   */
  async delete(id: number) {
    const result = await this.repo.delete(id);
    return result.affected > 0;
  }

  /**
   * 批量协议更新 (旧有的 sync 逻辑保留并优化)
   * @param data 成分股列表
   */
  async syncConstituents(data: Partial<EtfConstituent>[]) {
    for (const item of data) {
      if (!item.etfCode || !item.stockCode || !item.effectiveDate) continue;

      const existing = await this.repo.findOne({
        where: {
          etfCode: item.etfCode,
          stockCode: item.stockCode,
          effectiveDate: item.effectiveDate,
        },
      });

      if (existing) {
        await this.repo.update(existing.id, item);
      } else {
        await this.repo.save(this.repo.create(item));
      }
    }
  }
}
