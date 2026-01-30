import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

// 钉钉群abc的access_token
const accessToken_abc =
  'ea5ccfcb034b28e19eb12a8920525a79333175a815cd01db0cdae5dbc0200eef';
/**
 * 钉钉机器人按钮接口
 */
export interface DingtalkButton {
  title: string;
  actionURL: string;
}

/**
 * 钉钉 ActionCard 消息数据
 */
export interface DingtalkActionCard {
  title?: string;
  text: string;
  btnOrientation?: '0' | '1'; // 0-按钮竖直排列，1-按钮横向排列
  btns?: DingtalkButton[];
  singleTitle?: string;
  singleURL?: string;
}

/**
 * 钉钉机器人响应接口
 */
export interface DingtalkResponse {
  errcode: number;
  errmsg: string;
}

@Injectable()
export class DingtalkService {
  private readonly logger = new Logger(DingtalkService.name);
  private readonly baseUrl = 'https://oapi.dingtalk.com/robot/send';

  /**
   * 发送 ActionCard 类型消息
   * @param accessToken 机器人的 access_token
   * @param actionCard 卡片内容
   */
  async sendActionCard(
    actionCard: DingtalkActionCard,
    accessToken: string = accessToken_abc,
  ): Promise<DingtalkResponse> {
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

  /**
   * 发送纯文本消息
   * @param accessToken 机器人的 access_token
   * @param content 文本内容
   * @param atMobies 被@人的手机号
   * @param isAtAll 是否@所有人
   */
  async sendText(
    content: string,
    atMobies: string[] = [],
    isAtAll = false,
    accessToken: string = accessToken_abc,
  ): Promise<DingtalkResponse> {
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

  /**
   * 核心发送逻辑
   * @param accessToken 机器人的 access_token
   * @param payload 发送的 JSON 载荷
   */
  private async send(
    payload: any,
    accessToken: string = accessToken_abc,
  ): Promise<DingtalkResponse> {
    const url = `${this.baseUrl}?access_token=${accessToken}`;

    try {
      const response = await axios.post<DingtalkResponse>(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;

      if (result.errcode !== 0) {
        this.logger.error(`钉钉机器人发送失败: ${JSON.stringify(result)}`);
      } else {
        this.logger.log('钉钉机器人消息发送成功');
      }

      return result;
    } catch (error: any) {
      this.logger.error('请求钉钉机器人接口出错', error.message);
      if (error.response) {
        this.logger.error('响应数据:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }
}
