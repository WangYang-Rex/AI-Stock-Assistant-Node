import { Injectable } from '@nestjs/common';
import {
  SuccessResponse,
  ErrorResponse,
  PaginatedResponse,
  ApiResponse,
} from '../dto/response.dto';

@Injectable()
export class ResponseService {
  /**
   * 创建成功响应
   */
  success<T>(data: T, message: string = '操作成功'): ApiResponse<T> {
    return new SuccessResponse(data, message);
  }

  /**
   * 创建错误响应
   */
  error(message: string, result: number = 500): ApiResponse<null> {
    return new ErrorResponse(message, result);
  }

  /**
   * 创建分页响应
   */
  paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message: string = '查询成功',
  ): ApiResponse<any> {
    return new PaginatedResponse(items, total, page, limit, message);
  }

  /**
   * 处理异步操作的结果
   */
  async handleAsync<T>(
    operation: () => Promise<T>,
    successMessage: string = '操作成功',
    errorMessage: string = '操作失败',
  ): Promise<ApiResponse<T>> {
    try {
      const data = await operation();
      return this.success(data, successMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage;
      return this.error(message) as ApiResponse<T>;
    }
  }
}
