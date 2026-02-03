"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseAuctionController = void 0;
const common_1 = require("@nestjs/common");
const close_auction_service_1 = require("./close-auction.service");
const evaluate_by_symbol_dto_1 = require("./dto/evaluate-by-symbol.dto");
let CloseAuctionController = class CloseAuctionController {
    constructor(service) {
        this.service = service;
    }
    async evaluate(dto) {
        return this.service.evaluateBySymbol(dto.symbol, dto.market ?? 1);
    }
};
exports.CloseAuctionController = CloseAuctionController;
__decorate([
    (0, common_1.Post)('evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [evaluate_by_symbol_dto_1.EvaluateBySymbolDto]),
    __metadata("design:returntype", Promise)
], CloseAuctionController.prototype, "evaluate", null);
exports.CloseAuctionController = CloseAuctionController = __decorate([
    (0, common_1.Controller)('strategies/close-auction'),
    __metadata("design:paramtypes", [close_auction_service_1.CloseAuctionService])
], CloseAuctionController);
//# sourceMappingURL=close-auction.controller.js.map