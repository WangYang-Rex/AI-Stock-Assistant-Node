// gridTrading_advanced.js
// 改进后的网格交易回测模拟器（无收益曲线输出）

const fs = require('fs');
const path = require('path');

/*********************** 参数配置 ***************************/
const stock = '588080';
const quotesFile = path.join(__dirname, 'quotes_time_price.json');
const outputTransactionsFile = path.join(__dirname, 'transactions_advanced.json');

const holdingQuantity = 1000000;
const holdingCost = 1.347;
let totalHolding = holdingQuantity;
let totalCost = holdingQuantity * holdingCost;
let totalCash = 0;

// ✅ 优化参数
const anchorPrice = 1.43;
const gridGap = 0.025;
const gridLevels = 6;
const sizePerOrder = 10000;
const maxPosition = 1600000;
const allowMultipleLevelsAtSameTick = true;
const slippagePct = 0.000;
const fixedFeePerOrder = 5;
const feeRate = 0.0003;

/*********************** 初始化网格 ***************************/
function buildGrids(anchor, gap, levels) {
  const buys = [], sells = [];
  for (let i = 1; i <= levels; i++) {
    buys.push({ price: anchor * (1 - gap * i), qty: sizePerOrder });
    sells.push({ price: anchor * (1 + gap * i), qty: sizePerOrder });
  }
  return { buys, sells };
}

const { buys: baseBuys, sells: baseSells } = buildGrids(anchorPrice, gridGap, gridLevels);
const quotesData = JSON.parse(fs.readFileSync(quotesFile, 'utf-8'));

/*********************** 回测引擎 ***************************/
let transactions = [];
let avgCost = totalCost / totalHolding;
let peakNetValue = totalHolding * anchorPrice + totalCash;
let maxDrawdown = 0;

function applySlippage(price, isBuy) {
  return isBuy ? price * (1 + slippagePct) : price * (1 - slippagePct);
}

function calcFee(amount) {
  return fixedFeePerOrder + amount * feeRate;
}

function executeBuy(time, price, qty) {
  const execPrice = applySlippage(price, true);
  const allowedQty = Math.min(qty, Math.max(0, maxPosition - totalHolding));
  if (allowedQty <= 0) return;
  const amount = execPrice * allowedQty;
  const fee = calcFee(amount);
  totalCost += amount + fee;
  totalHolding += allowedQty;
  avgCost = totalCost / totalHolding;
  totalCash -= (amount + fee);
  transactions.push({ type: 'BUY', time, price: execPrice, qty: allowedQty, holding: totalHolding, avgCost, cash: totalCash });
}

function executeSell(time, price, qty) {
  const execPrice = applySlippage(price, false);
  const actualQty = Math.min(qty, totalHolding);
  if (actualQty <= 0) return;
  const amount = execPrice * actualQty;
  const fee = calcFee(amount);
  totalHolding -= actualQty;
  totalCost -= avgCost * actualQty;
  totalCash += (amount - fee);
  avgCost = totalHolding > 0 ? totalCost / totalHolding : 0;
  transactions.push({ type: 'SELL', time, price: execPrice, qty: actualQty, holding: totalHolding, avgCost, cash: totalCash });
}

for (let { time, latestPrice } of quotesData) {
  if (allowMultipleLevelsAtSameTick) {
    baseSells.forEach(s => latestPrice >= s.price && executeSell(time, s.price, s.qty));
    baseBuys.forEach(b => latestPrice <= b.price && executeBuy(time, b.price, b.qty));
  } else {
    const s = baseSells.find(s => latestPrice >= s.price);
    if (s) executeSell(time, s.price, s.qty);
    const b = baseBuys.slice().reverse().find(b => latestPrice <= b.price);
    if (b) executeBuy(time, b.price, b.qty);
  }

  const netValue = totalHolding * latestPrice + totalCash;
  if (netValue > peakNetValue) peakNetValue = netValue;
  const drawdown = (peakNetValue - netValue) / peakNetValue;
  if (drawdown > maxDrawdown) maxDrawdown = drawdown;
}

/*********************** 回测结果 ***************************/
const finalPrice = quotesData[quotesData.length - 1].latestPrice;
const finalValue = totalHolding * finalPrice + totalCash;
const initialValue = holdingQuantity * anchorPrice;
const profit = finalValue - initialValue;
const profitRate = (profit / initialValue) * 100;

const summary = {
  stock,
  anchorPrice,
  gridGap,
  gridLevels,
  sizePerOrder,
  initialHolding: holdingQuantity,
  finalHolding: totalHolding,
  avgCost,
  finalPrice,
  totalCash,
  finalValue,
  profit,
  profitRate,
  totalTrades: transactions.length,
  buys: transactions.filter(t => t.type === 'BUY').length,
  sells: transactions.filter(t => t.type === 'SELL').length,
  maxDrawdown
};

fs.writeFileSync(outputTransactionsFile, JSON.stringify({ summary, transactions }, null, 2));

console.log('='.repeat(60));
console.log('改进后的网格交易回测结果（无收益曲线）');
console.table(summary);
console.log('交易记录已保存至 transactions_advanced.json');
console.log('='.repeat(60));
