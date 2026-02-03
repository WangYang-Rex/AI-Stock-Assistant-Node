export interface DingtalkButton {
    title: string;
    actionURL: string;
}
export interface DingtalkActionCard {
    title?: string;
    text: string;
    btnOrientation?: '0' | '1';
    btns?: DingtalkButton[];
    singleTitle?: string;
    singleURL?: string;
}
export interface DingtalkResponse {
    errcode: number;
    errmsg: string;
}
export declare class DingtalkService {
    private readonly logger;
    private readonly baseUrl;
    sendActionCard(actionCard: DingtalkActionCard, accessToken?: string): Promise<DingtalkResponse>;
    sendText(content: string, atMobies?: string[], isAtAll?: boolean, accessToken?: string): Promise<DingtalkResponse>;
    private send;
}
