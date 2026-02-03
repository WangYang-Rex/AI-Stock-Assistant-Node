"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var DingtalkService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DingtalkService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const accessToken_abc = 'ea5ccfcb034b28e19eb12a8920525a79333175a815cd01db0cdae5dbc0200eef';
let DingtalkService = DingtalkService_1 = class DingtalkService {
    constructor() {
        this.logger = new common_1.Logger(DingtalkService_1.name);
        this.baseUrl = 'https://oapi.dingtalk.com/robot/send';
    }
    async sendActionCard(actionCard, accessToken = accessToken_abc) {
        const payload = {
            msgtype: 'actionCard',
            actionCard: {
                title: actionCard.title || '通知消息',
                text: actionCard.text,
                btnOrientation: actionCard.btnOrientation || '1',
                btns: actionCard.btns,
                singleTitle: actionCard.singleTitle,
                singleURL: actionCard.singleURL,
            },
        };
        return this.send(payload, accessToken);
    }
    async sendText(content, atMobies = [], isAtAll = false, accessToken = accessToken_abc) {
        const payload = {
            msgtype: 'text',
            text: {
                content,
            },
            at: {
                atMobiles: atMobies,
                isAtAll,
            },
        };
        return this.send(payload, accessToken);
    }
    async send(payload, accessToken = accessToken_abc) {
        const url = `${this.baseUrl}?access_token=${accessToken}`;
        try {
            this.logger.debug(`正在发送钉钉消息，Node 版本: ${process.version}, 适配器: http`);
            const response = await axios_1.default.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                adapter: 'http',
            });
            const result = response.data;
            if (result.errcode !== 0) {
                this.logger.error(`钉钉机器人发送失败: ${JSON.stringify(result)}`);
            }
            else {
                this.logger.log('钉钉机器人消息发送成功');
            }
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('请求钉钉机器人接口出错', errorMessage);
            if (error && typeof error === 'object' && 'response' in error) {
                this.logger.error('响应数据:', JSON.stringify(error.response?.data));
            }
            throw error;
        }
    }
};
exports.DingtalkService = DingtalkService;
exports.DingtalkService = DingtalkService = DingtalkService_1 = __decorate([
    (0, common_1.Injectable)()
], DingtalkService);
//# sourceMappingURL=dingtalk.service.js.map