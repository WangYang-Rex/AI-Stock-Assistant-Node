import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          // 记录HTTP请求日志
          this.loggingService.api(method, url, statusCode, duration, 'HTTP');

          // 根据状态码记录不同级别的日志
          if (statusCode >= 400) {
            this.loggingService.warn(
              `HTTP ${method} ${url} - ${statusCode}`,
              'HTTP',
              {
                ip,
                userAgent,
                duration,
                statusCode,
              },
            );
          } else {
            this.loggingService.log(
              `HTTP ${method} ${url} - ${statusCode}`,
              'HTTP',
              {
                ip,
                userAgent,
                duration,
                statusCode,
              },
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.loggingService.error(
            `HTTP ${method} ${url} - ${statusCode}`,
            error.stack,
            'HTTP',
            {
              ip,
              userAgent,
              duration,
              statusCode,
              error: error.message,
            },
          );
        },
      }),
    );
  }
}
