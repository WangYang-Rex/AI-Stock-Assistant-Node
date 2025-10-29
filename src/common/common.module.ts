import { Module } from '@nestjs/common';
import { ResponseService } from './services/response.service';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

@Module({
  providers: [ResponseService, ResponseInterceptor, GlobalExceptionFilter],
  exports: [ResponseService, ResponseInterceptor, GlobalExceptionFilter],
})
export class CommonModule {}
