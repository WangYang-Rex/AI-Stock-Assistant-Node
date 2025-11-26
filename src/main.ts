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
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}
void bootstrap();
