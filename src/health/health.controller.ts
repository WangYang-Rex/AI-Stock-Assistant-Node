import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Get()
  async checkHealth() {
    try {
      // 测试数据库连接
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
