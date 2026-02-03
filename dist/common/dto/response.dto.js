"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedResponse = exports.ErrorResponse = exports.SuccessResponse = void 0;
class SuccessResponse {
    constructor(data, message = '操作成功') {
        this.result = 100;
        this.success = true;
        this.data = data;
        this.message = message;
    }
}
exports.SuccessResponse = SuccessResponse;
class ErrorResponse {
    constructor(message, result = 500) {
        this.data = null;
        this.success = false;
        this.message = message;
        this.result = result;
    }
}
exports.ErrorResponse = ErrorResponse;
class PaginatedResponse extends SuccessResponse {
    constructor(items, total, page, limit, message = '查询成功') {
        const totalPages = Math.ceil(total / limit);
        const paginatedData = {
            items,
            total,
            page,
            limit,
            totalPages,
        };
        super(paginatedData, message);
    }
}
exports.PaginatedResponse = PaginatedResponse;
//# sourceMappingURL=response.dto.js.map