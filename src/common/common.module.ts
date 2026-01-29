import { Module } from '@nestjs/common';
import { ResponseService } from './services/response.service';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { DingtalkService } from './services/dingtalk.service';

@Module({
  providers: [
    ResponseService,
    ResponseInterceptor,
    GlobalExceptionFilter,
    DingtalkService,
  ],
  exports: [
    ResponseService,
    ResponseInterceptor,
    GlobalExceptionFilter,
    DingtalkService,
  ],
})
export class CommonModule {}
