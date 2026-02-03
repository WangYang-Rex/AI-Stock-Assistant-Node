"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const response_dto_1 = require("../dto/response.dto");
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data &&
                typeof data === 'object' &&
                'success' in data &&
                'result' in data) {
                return data;
            }
            return new response_dto_1.SuccessResponse(data, '操作成功');
        }), (0, operators_1.catchError)((error) => {
            let message = '服务器内部错误';
            let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            if (error instanceof common_1.HttpException) {
                message = error.message;
                status = error.getStatus();
            }
            else if (error instanceof Error) {
                message = error.message;
            }
            const errorResponse = new response_dto_1.ErrorResponse(message, status);
            return (0, rxjs_1.throwError)(() => errorResponse);
        }));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map