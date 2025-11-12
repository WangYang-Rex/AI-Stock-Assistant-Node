const fs = require('fs');
const path = require('path');

// 读取源文件
const sourceFile = path.join(__dirname, '20251107.json');
const data = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));

// 从文件名提取日期 (2025-11-10)
const date = '2025-11-07';

// 股票信息
const stockCode = '588080';
const stockName = '科创50ETF';
const marketCode = '1';
const preClose = data.data.preClose;

// 转换数据
const quotes = data.data.trends.map(trend => {
  // 构建快照时间: 2025-11-10T09:15:00
  const snapshotTime = `${date}T${trend.time}`;
  
  // 转换数据类型
  const latestPrice = parseFloat(trend.price);
  const changePercent = parseFloat(trend.change);
  const volume = parseInt(trend.volume) || 0;
  // amount 单位可能是万元，需要转换为元
  // 根据数据格式，amount看起来是"0.00"格式，需要确认单位
  // 从示例文件看，volumeAmount应该是实际成交额(元)，这里假设amount单位是元
  const volumeAmount = parseFloat(trend.amount) || 0;

  const quote = {
    code: stockCode,
    name: stockName,
    marketCode: marketCode,
    previousClosePrice: preClose,
    snapshotTime: snapshotTime,
    snapshotDate: date
  };

  // 添加数值字段（如果有效）
  if (!isNaN(latestPrice)) {
    quote.latestPrice = latestPrice;
  }
  if (!isNaN(changePercent)) {
    quote.changePercent = changePercent;
  }
  // volume 和 volumeAmount 始终包含，即使为 0（与示例文件保持一致）
  quote.volume = volume;
  quote.volumeAmount = volumeAmount;

  return quote;
});

// 保存结果
const outputFile = path.join(__dirname, 'batch_add_request_20251107.json');
fs.writeFileSync(outputFile, JSON.stringify(quotes, null, 2), 'utf-8');

console.log(`✅ 转换完成！`);
console.log(`📁 输出文件: ${outputFile}`);
console.log(`📊 共转换 ${quotes.length} 条记录`);
console.log(`\n前3条记录示例:`);
console.log(JSON.stringify(quotes.slice(0, 3), null, 2));

