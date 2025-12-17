import { JObject } from "@zwa73/utils";
import { GatewayResp, SendGroupMessageReqData, SendGroupMessageRespData, SendPrivateMessageReqData, SendPrivateMessageRespData, UploadMediaRespData } from "./Interface";
export declare class KookAPISender {
    private token;
    constructor(token: string);
    private postapi;
    private getapi;
    /**上传媒体文件 */
    uploadMedia(filepath: string): Promise<UploadMediaRespData | undefined>;
    /**发送私聊消息 */
    sendPrivateMsg(data: SendPrivateMessageReqData): Promise<SendPrivateMessageRespData | undefined>;
    /**发送频道消息 */
    sendChannelMsg(data: SendGroupMessageReqData): Promise<SendGroupMessageRespData | undefined>;
    /**获取自身数据 */
    getSelfData(): Promise<JObject | undefined>;
    /**获取网关 */
    getGateway(): Promise<GatewayResp | undefined>;
}
