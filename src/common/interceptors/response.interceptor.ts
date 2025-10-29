import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
} from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果数据已经是 ApiResponse 格式，直接返回
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'result' in data
        ) {
          return data;
        }

        // 否则包装成成功响应
        return new SuccessResponse(data, '操作成功');
      }),
      catchError((error) => {
        let message = '服务器内部错误';
        let status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (error instanceof HttpException) {
          message = error.message;
          status = error.getStatus();
        } else if (error instanceof Error) {
          message = error.message;
        }

        const errorResponse = new ErrorResponse(message, status);
        return throwError(() => errorResponse);
      }),
    );
  }
}
