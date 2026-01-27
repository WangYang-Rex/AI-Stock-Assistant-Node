/**
 * 测试 Kline 实体的 marketCode 字段功能
 * 
 * 此脚本用于验证：
 * 1. marketCode 字段是否正确从 secid 中提取
 * 2. 数据同步时是否正确处理 marketCode
 * 3. 查询功能是否支持 marketCode
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { KlineService } from '../src/kline/kline.service';

async function testMarketCode() {
  console.log('🚀 开始测试 marketCode 字段功能...\n');

  // 创建应用实例
  const app = await NestFactory.createApplicationContext(AppModule);
  const klineService = app.get(KlineService);

  try {
    // 测试1: 上交所股票 (600519 - 贵州茅台)
    console.log('📊 测试1: 获取上交所股票K线数据 (600519)');
    const shKlines = await klineService.fetchKlineFromApi({
      code: '600519',
      period: 'daily',
      limit: 5,
      saveToDb: false,
    });

    if (shKlines.length > 0) {
      const firstKline = shKlines[0];
      console.log('✅ 成功获取数据:');
      console.log(`   - 股票代码: ${firstKline.code}`);
      console.log(`   - 股票名称: ${firstKline.name}`);
      console.log(`   - 市场类型: ${firstKline.market}`);
      console.log(`   - 市场代码: ${firstKline.marketCode} (期望值: 1)`);
      console.log(`   - 日期: ${firstKline.date}`);
      console.log(`   - 收盘价: ${firstKline.close}`);
      
      if (firstKline.marketCode === 1 && firstKline.market === 'SH') {
        console.log('✅ 上交所 marketCode 验证通过!\n');
      } else {
        console.log('❌ 上交所 marketCode 验证失败!\n');
      }
    } else {
      console.log('❌ 未获取到数据\n');
    }

    // 测试2: 深交所股票 (000001 - 平安银行)
    console.log('📊 测试2: 获取深交所股票K线数据 (000001)');
    const szKlines = await klineService.fetchKlineFromApi({
      code: '000001',
      period: 'daily',
      limit: 5,
      saveToDb: false,
    });

    if (szKlines.length > 0) {
      const firstKline = szKlines[0];
      console.log('✅ 成功获取数据:');
      console.log(`   - 股票代码: ${firstKline.code}`);
      console.log(`   - 股票名称: ${firstKline.name}`);
      console.log(`   - 市场类型: ${firstKline.market}`);
      console.log(`   - 市场代码: ${firstKline.marketCode} (期望值: 0)`);
      console.log(`   - 日期: ${firstKline.date}`);
      console.log(`   - 收盘价: ${firstKline.close}`);
      
      if (firstKline.marketCode === 0 && firstKline.market === 'SZ') {
        console.log('✅ 深交所 marketCode 验证通过!\n');
      } else {
        console.log('❌ 深交所 marketCode 验证失败!\n');
      }
    } else {
      console.log('❌ 未获取到数据\n');
    }

    // 测试3: 同步数据到数据库
    console.log('📊 测试3: 同步K线数据到数据库');
    const syncResult = await klineService.syncKlineData({
      code: '600519',
      period: 'daily',
      limit: 10,
    });

    console.log('✅ 同步完成:');
    console.log(`   - 总数据量: ${syncResult.total}`);
    console.log(`   - 同步成功: ${syncResult.synced}`);
    
    if (syncResult.synced === syncResult.total) {
      console.log('✅ 数据同步验证通过!\n');
    } else {
      console.log('⚠️  部分数据同步失败\n');
    }

    // 测试4: 查询数据库中的数据
    console.log('📊 测试4: 从数据库查询K线数据');
    const dbKlines = await klineService.findByCode('600519', 101);
    
    if (dbKlines.length > 0) {
      const firstDbKline = dbKlines[0];
      console.log('✅ 成功查询数据:');
      console.log(`   - 记录数量: ${dbKlines.length}`);
      console.log(`   - 股票代码: ${firstDbKline.code}`);
      console.log(`   - 市场代码: ${firstDbKline.marketCode}`);
      console.log(`   - 市场类型: ${firstDbKline.market}`);
      
      if (firstDbKline.marketCode === 1) {
        console.log('✅ 数据库查询验证通过!\n');
      } else {
        console.log('❌ 数据库查询验证失败!\n');
      }
    } else {
      console.log('⚠️  数据库中暂无数据\n');
    }

    console.log('🎉 所有测试完成!');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  } finally {
    await app.close();
  }
}

// 运行测试
testMarketCode().catch(console.error);
