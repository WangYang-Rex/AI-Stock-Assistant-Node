const mysql = require('mysql2/promise');
const fs = require('fs');

async function createTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'rm-bp1da276967f735384o.mysql.rds.aliyuncs.com',
      port: 3306,
      user: 'wangyang',
      password: 'Sxwy_10110013228',
      database: 'ai_stock_assistant'
    });

    console.log('数据库连接成功！');

    // 读取SQL文件
    const sql = fs.readFileSync('./create-all-tables.sql', 'utf8');
    
    // 执行SQL
    await connection.execute(sql);
    console.log('stocks表创建成功！');

    // 验证表是否创建成功
    const [tables] = await connection.execute("SHOW TABLES LIKE 'stocks'");
    console.log('stocks表存在:', tables.length > 0);

    if (tables.length > 0) {
      const [columns] = await connection.execute("DESCRIBE stocks");
      console.log(`stocks表包含 ${columns.length} 个字段:`);
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type}`);
      });
    }

    await connection.end();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('操作失败:', error.message);
  }
}

createTable();
