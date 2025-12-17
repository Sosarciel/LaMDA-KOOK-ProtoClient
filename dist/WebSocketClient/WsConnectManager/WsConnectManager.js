"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsConnectManager = void 0;
const utils_1 = require("@zwa73/utils");
const GetGateway_1 = require("./GetGateway");
const ConnectGateway_1 = require("./ConnectGateway");
const Heartbeat_1 = require("./Heartbeat");
const Constant_1 = require("../../Constant");
class WsConnectManager {
    sender;
    cce;
    queue;
    constructor(sender, clientConnectEvent) {
        this.sender = sender;
        clientConnectEvent ??= {};
        const client = this;
        this.cce = {
            async onmessage(data) {
                if (clientConnectEvent.onmessage)
                    await clientConnectEvent.onmessage(data);
            },
            async onreset() {
                if (clientConnectEvent.onreset)
                    await clientConnectEvent.onreset();
                client.queue.reset();
            },
            async onclose() {
                if (clientConnectEvent.onclose)
                    await clientConnectEvent.onclose();
                client.ws?.close();
            }
        };
        this.queue = new utils_1.SequenceQueue({ emit: this.cce.onmessage });
    }
    /** 当前链接状态 */
    currStatus = "GetGateway";
    /** 当前ws客户端 */
    ws;
    /** 主动心跳包事件 */
    heartbeatEvent;
    /** 获取到的url */
    gatewayUrl;
    /** 用于重连的会话id */
    session_id;
    async start() {
        while (true) {
            //打断微队列
            await (0, utils_1.sleep)(0);
            try {
                if (this.currStatus == "Terminate")
                    break;
                this.currStatus = await (0, utils_1.match)(this.currStatus, {
                    GetGateway: () => (0, GetGateway_1.ProcGetGateway)(this),
                    ConnectGateway: () => (0, ConnectGateway_1.ProcConnectGateway)(this),
                    Reconnect: () => (0, ConnectGateway_1.ProcReconnect)(this),
                    Heartbeat: () => (0, Heartbeat_1.ProcHeartbeat)(this),
                    Terminate: () => "Terminate",
                });
            }
            catch (e) {
                utils_1.SLogger.error(`${Constant_1.LogPrefix}WsConnectManager.start 处理状态时发生错误 ${e}`, '重置为 GetGateway');
                this.currStatus = "GetGateway";
            }
        }
    }
}
exports.WsConnectManager = WsConnectManager;
