"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KlineModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const kline_controller_1 = require("./kline.controller");
const kline_service_1 = require("./kline.service");
const kline_entity_1 = require("../../../entities/kline.entity");
const common_module_1 = require("../../../common/common.module");
const stock_module_1 = require("../stock/stock.module");
let KlineModule = class KlineModule {
};
exports.KlineModule = KlineModule;
exports.KlineModule = KlineModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([kline_entity_1.Kline]),
            common_module_1.CommonModule,
            stock_module_1.StockModule,
        ],
        controllers: [kline_controller_1.KlineController],
        providers: [kline_service_1.KlineService],
        exports: [kline_service_1.KlineService],
    })
], KlineModule);
//# sourceMappingURL=kline.module.js.map