// import compression from 'compression';
// 确保 crypto 全局对象可用（解决 @nestjs/typeorm 中的 crypto 未定义问题）
import * as nodeCrypto from 'crypto';
if (typeof globalThis.crypto === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  globalThis.crypto = nodeCrypto as any;
}
// (global as any).crypto = nodeCrypto;

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // 启用 gzip 压缩
    // app.use(compression());

    // 配置 CORS 跨域请求
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
    });

    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    Logger.log(
      `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
  } catch (error) {
    Logger.error('❌ Failed to start application:', error);
    console.error('Error details:', error);
    process.exit(1);
  }
}
bootstrap().catch((error) => {
  Logger.error('❌ Unhandled error during bootstrap:', error);
  console.error('Unhandled error:', error);
  process.exit(1);
});
