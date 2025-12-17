import { SequenceQueue } from "@zwa73/utils";
import { WebSocket } from "ws";
import { ConnectStatus } from "./Interface";
import { KookAPISender } from "../../RESTApi";
import { AnySignaling } from "../../Event";
type ClientConnectEvent = {
    /**接收消息时的事件 */
    onmessage: (data: AnySignaling) => void | Promise<void>;
    /**链接重置 / 触发sn清空 时的事件
     * 将会自动重置内部sn
     */
    onreset: (() => void | Promise<void>);
    /**ws被销毁时的事件 */
    onclose: (() => void | Promise<void>);
};
export declare class WsConnectManager {
    sender: KookAPISender;
    cce: ClientConnectEvent;
    queue: SequenceQueue<AnySignaling>;
    constructor(sender: KookAPISender, clientConnectEvent?: Partial<ClientConnectEvent>);
    /** 当前链接状态 */
    currStatus: ConnectStatus;
    /** 当前ws客户端 */
    ws?: WebSocket;
    /** 主动心跳包事件 */
    heartbeatEvent?: NodeJS.Timeout;
    /** 获取到的url */
    gatewayUrl?: string;
    /** 用于重连的会话id */
    session_id?: string;
    start(): Promise<void>;
}
export {};
