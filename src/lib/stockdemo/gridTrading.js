const fs = require('fs');
const path = require('path');

// 网格交易参数设置
const stock = "588080";
const previousClosePrice = 1.43;
const gridGap = 0.015;
const holdingQuantity = 1000000; // 初始持仓数量
const holdingCost = 1.347; // 初始持仓成本
const transactionFee = 5; // 手续费（元）
const sellQuantity = 3000; // 每次卖出数量（股）

// 读取价格数据
const quotesFilePath = path.join(__dirname, 'quotes_time_price.json');
const quotesData = JSON.parse(fs.readFileSync(quotesFilePath, 'utf-8'));

// 交易状态
let currentPrice = previousClosePrice; // 操作初始价格
let nextBuyPrice = currentPrice * (1 - gridGap); // 下一买入价格
let nextSellPrice = currentPrice * (1 + gridGap); // 下一卖出价格
let totalHolding = holdingQuantity; // 总持仓数量
let totalCost = holdingQuantity * holdingCost; // 总成本
let totalCash = 0; // 总现金（卖出收入 - 买入支出）
let transactions = []; // 交易记录

console.log('='.repeat(60));
console.log('网格交易策略模拟');
console.log('='.repeat(60));
console.log(`股票代码: ${stock}`);
console.log(`昨收价格: ${previousClosePrice}`);
console.log(`网格交易幅度: ${gridGap * 100}%`);
console.log(`初始持仓: ${holdingQuantity}股`);
console.log(`初始持仓成本: ${holdingCost}元/股`);
console.log(`操作初始价格: ${currentPrice}`);
console.log(`下一买入价格: ${nextBuyPrice.toFixed(4)}`);
console.log(`下一卖出价格: ${nextSellPrice.toFixed(4)}`);
console.log('='.repeat(60));
console.log('开始模拟交易...\n');

// 遍历价格数据
for (let i = 0; i < quotesData.length; i++) {
  const { time, latestPrice } = quotesData[i];
  
  // 检查是否触发买入条件（价格下跌到买入价格）
  if (latestPrice <= nextBuyPrice) {
    const buyPrice = latestPrice;
    const buyAmount = sellQuantity * buyPrice; // 买入金额
    const totalBuyCost = buyAmount + transactionFee; // 买入总成本（含手续费）
    
    // 执行买入
    totalHolding += sellQuantity;
    totalCost += totalBuyCost;
    totalCash -= totalBuyCost;
    
    // 记录交易
    const transaction = {
      type: '买入',
      time: time,
      price: buyPrice,
      quantity: sellQuantity,
      amount: buyAmount,
      fee: transactionFee,
      totalCost: totalBuyCost,
      holding: totalHolding,
      cash: totalCash
    };
    transactions.push(transaction);
    
    // 更新操作初始价格和网格价格
    currentPrice = buyPrice;
    nextBuyPrice = currentPrice * (1 - gridGap);
    nextSellPrice = currentPrice * (1 + gridGap);
    
    console.log(`[${time}] ${transaction.type} | 价格: ${buyPrice.toFixed(4)} | 数量: ${sellQuantity}股 | 金额: ${buyAmount.toFixed(2)}元 | 手续费: ${transactionFee}元 | 持仓: ${totalHolding}股 | 累计现金: ${totalCash.toFixed(2)}元`);
    console.log(`  更新操作价格: ${currentPrice.toFixed(4)} | 下一买入: ${nextBuyPrice.toFixed(4)} | 下一卖出: ${nextSellPrice.toFixed(4)}`);
  }
  // 检查是否触发卖出条件（价格上涨到卖出价格）
  else if (latestPrice >= nextSellPrice && totalHolding >= sellQuantity) {
    const sellPrice = latestPrice;
    const sellAmount = sellQuantity * sellPrice; // 卖出金额
    const netSellAmount = sellAmount - transactionFee; // 卖出净收入（扣除手续费）
    
    // 执行卖出
    totalHolding -= sellQuantity;
    totalCost -= (totalCost / (totalHolding + sellQuantity)) * sellQuantity; // 按比例减少成本
    totalCash += netSellAmount;
    
    // 记录交易
    const transaction = {
      type: '卖出',
      time: time,
      price: sellPrice,
      quantity: sellQuantity,
      amount: sellAmount,
      fee: transactionFee,
      netAmount: netSellAmount,
      holding: totalHolding,
      cash: totalCash
    };
    transactions.push(transaction);
    
    // 更新操作初始价格和网格价格
    currentPrice = sellPrice;
    nextBuyPrice = currentPrice * (1 - gridGap);
    nextSellPrice = currentPrice * (1 + gridGap);
    
    console.log(`[${time}] ${transaction.type} | 价格: ${sellPrice.toFixed(4)} | 数量: ${sellQuantity}股 | 金额: ${sellAmount.toFixed(2)}元 | 手续费: ${transactionFee}元 | 持仓: ${totalHolding}股 | 累计现金: ${totalCash.toFixed(2)}元`);
    console.log(`  更新操作价格: ${currentPrice.toFixed(4)} | 下一买入: ${nextBuyPrice.toFixed(4)} | 下一卖出: ${nextSellPrice.toFixed(4)}`);
  }
}

// 计算最终收益
const finalPrice = quotesData[quotesData.length - 1].latestPrice;
const finalMarketValue = totalHolding * finalPrice; // 当前持仓市值
const totalValue = finalMarketValue + totalCash; // 总资产（持仓市值 + 现金）
const initialValue = holdingQuantity * previousClosePrice; // 初始资产价值（按昨收价格计算）
const profit = totalValue - initialValue; // 收益
const profitRate = (profit / initialValue) * 100; // 收益率

// 输出结果
console.log('\n' + '='.repeat(60));
console.log('交易汇总');
console.log('='.repeat(60));
console.log(`总交易笔数: ${transactions.length}笔`);
console.log(`买入次数: ${transactions.filter(t => t.type === '买入').length}次`);
console.log(`卖出次数: ${transactions.filter(t => t.type === '卖出').length}次`);
console.log('\n' + '='.repeat(60));
console.log('最终收益计算');
console.log('='.repeat(60));
console.log(`最终价格: ${finalPrice.toFixed(4)}元`);
console.log(`最终持仓: ${totalHolding}股`);
console.log(`持仓市值: ${finalMarketValue.toFixed(2)}元`);
console.log(`累计现金: ${totalCash.toFixed(2)}元`);
console.log(`总资产: ${totalValue.toFixed(2)}元`);
console.log(`初始资产价值（按昨收价）: ${initialValue.toFixed(2)}元`);
console.log(`总收益: ${profit.toFixed(2)}元`);
console.log(`收益率: ${profitRate.toFixed(2)}%`);
console.log('='.repeat(60));

// 输出所有交易记录
console.log('\n详细交易记录:');
console.log('='.repeat(60));
transactions.forEach((t, index) => {
  console.log(`${index + 1}. [${t.time}] ${t.type} ${t.quantity}股 @ ${t.price.toFixed(4)}元 | 金额: ${t.amount.toFixed(2)}元 | 手续费: ${t.fee}元 | 持仓: ${t.holding}股 | 现金: ${t.cash.toFixed(2)}元`);
});
console.log('='.repeat(60));
