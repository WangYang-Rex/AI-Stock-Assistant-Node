export interface ApiResponse<T = any> {
    data: T;
    message: string;
    result: number;
    success: boolean;
}
export declare class SuccessResponse<T = any> implements ApiResponse<T> {
    data: T;
    message: string;
    result: number;
    success: boolean;
    constructor(data: T, message?: string);
}
export declare class ErrorResponse implements ApiResponse<null> {
    data: null;
    message: string;
    result: number;
    success: boolean;
    constructor(message: string, result?: number);
}
export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class PaginatedResponse<T> extends SuccessResponse<PaginatedData<T>> {
    constructor(items: T[], total: number, page: number, limit: number, message?: string);
}
