"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const response_service_1 = require("./services/response.service");
const response_interceptor_1 = require("./interceptors/response.interceptor");
const global_exception_filter_1 = require("./filters/global-exception.filter");
const dingtalk_service_1 = require("./services/dingtalk.service");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        providers: [
            response_service_1.ResponseService,
            response_interceptor_1.ResponseInterceptor,
            global_exception_filter_1.GlobalExceptionFilter,
            dingtalk_service_1.DingtalkService,
        ],
        exports: [
            response_service_1.ResponseService,
            response_interceptor_1.ResponseInterceptor,
            global_exception_filter_1.GlobalExceptionFilter,
            dingtalk_service_1.DingtalkService,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map