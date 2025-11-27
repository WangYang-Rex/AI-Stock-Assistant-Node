module.exports = {
  apps: [
    {
      name: 'nestjs-app',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // 错误日志
      error_file: './logs/pm2-error.log',
      // 输出日志
      out_file: './logs/pm2-out.log',
      // 合并日志
      merge_logs: true,
      // 日志日期格式
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 自动重启
      autorestart: true,
      // 监听文件变化（生产环境建议关闭）
      watch: false,
      // 最大内存限制（超过后重启）
      max_memory_restart: '500M',
      // 启动延迟（毫秒）
      wait_ready: true,
      listen_timeout: 10000,
      // 优雅关闭超时时间
      kill_timeout: 5000,
      // 重启间隔（应用至少运行这个时间才认为是稳定启动）
      min_uptime: '30s',
      // 最大重启次数（在 min_uptime 时间窗口内）
      max_restarts: 5,
      // 重启延迟（毫秒）
      restart_delay: 4000,
    },
  ],
};

