/**
 * 统一响应数据格式
 */
export interface ApiResponse<T = any> {
  data: T; // 返回的数据
  message: string; // 操作成功/报错信息
  result: number; // 100表示接口正常，其他数字表示错误码
  success: boolean; // true表示请求成功 false表示接口报错
}

/**
 * 成功响应
 */
export class SuccessResponse<T = any> implements ApiResponse<T> {
  data: T;
  message: string;
  result: number = 100;
  success: boolean = true;

  constructor(data: T, message: string = '操作成功') {
    this.data = data;
    this.message = message;
  }
}

/**
 * 错误响应
 */
export class ErrorResponse implements ApiResponse<null> {
  data: null = null;
  message: string;
  result: number;
  success: boolean = false;

  constructor(message: string, result: number = 500) {
    this.message = message;
    this.result = result;
  }
}

/**
 * 分页响应数据
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 分页成功响应
 */
export class PaginatedResponse<T> extends SuccessResponse<PaginatedData<T>> {
  constructor(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message: string = '查询成功',
  ) {
    const totalPages = Math.ceil(total / limit);
    const paginatedData: PaginatedData<T> = {
      items,
      total,
      page,
      limit,
      totalPages,
    };
    super(paginatedData, message);
  }
}
