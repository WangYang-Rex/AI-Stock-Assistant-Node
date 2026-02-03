import { ApiResponse } from '../dto/response.dto';
export declare class ResponseService {
    success<T>(data: T, message?: string): ApiResponse<T>;
    error(message: string, result?: number): ApiResponse<null>;
    paginated<T>(items: T[], total: number, page: number, limit: number, message?: string): ApiResponse<any>;
    handleAsync<T>(operation: () => Promise<T>, successMessage?: string, errorMessage?: string): Promise<ApiResponse<T>>;
}
