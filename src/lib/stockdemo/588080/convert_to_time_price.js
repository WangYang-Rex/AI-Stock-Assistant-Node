const fs = require('fs');
const path = require('path');

// 读取源文件
const sourceFile = path.join(__dirname, '20251107.json');
const data = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
const date = '2025-11-06';

// 转换为 Array<{time:string,latestPrice:number}>
const timePriceArray = data.data.trends.map(trend => ({
  time: `${date}T${trend.time}`,
  latestPrice: parseFloat(trend.price)
}));

// 保存结果
const outputFile = path.join(__dirname, 'time_price_20251107.json');
fs.writeFileSync(outputFile, JSON.stringify(timePriceArray, null, 2), 'utf-8');

console.log(`✅ 转换完成！`);
console.log(`📁 输出文件: ${outputFile}`);
console.log(`📊 共转换 ${timePriceArray.length} 条记录`);
console.log(`\n前5条记录示例:`);
console.log(JSON.stringify(timePriceArray.slice(0, 5), null, 2));

