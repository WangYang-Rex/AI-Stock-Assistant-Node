"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseService = void 0;
const common_1 = require("@nestjs/common");
const response_dto_1 = require("../dto/response.dto");
let ResponseService = class ResponseService {
    success(data, message = '操作成功') {
        return new response_dto_1.SuccessResponse(data, message);
    }
    error(message, result = 500) {
        return new response_dto_1.ErrorResponse(message, result);
    }
    paginated(items, total, page, limit, message = '查询成功') {
        return new response_dto_1.PaginatedResponse(items, total, page, limit, message);
    }
    async handleAsync(operation, successMessage = '操作成功', errorMessage = '操作失败') {
        try {
            const data = await operation();
            return this.success(data, successMessage);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : errorMessage;
            return this.error(message);
        }
    }
};
exports.ResponseService = ResponseService;
exports.ResponseService = ResponseService = __decorate([
    (0, common_1.Injectable)()
], ResponseService);
//# sourceMappingURL=response.service.js.map