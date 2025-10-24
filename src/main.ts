import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './logging/logging.interceptor';
import { LoggingService } from './logging/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 获取日志服务实例
  const loggingService = app.get(LoggingService);

  // 全局日志拦截器
  app.useGlobalInterceptors(new LoggingInterceptor(loggingService));

  // 记录应用启动日志
  loggingService.log('AI股票助手应用启动', 'Bootstrap');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  loggingService.log(`应用已启动，监听端口: ${port}`, 'Bootstrap');
}
void bootstrap();
