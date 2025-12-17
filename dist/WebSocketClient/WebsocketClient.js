"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KOOKWebsocketClient = void 0;
const utils_1 = require("@zwa73/utils");
const WsConnectManager_1 = require("./WsConnectManager/WsConnectManager");
const RESTApi_1 = require("../RESTApi");
const Constant_1 = require("../Constant");
/**websocket客户端 */
class KOOKWebsocketClient extends utils_1.EventSystem {
    token;
    connectManager;
    apiSender;
    constructor(token) {
        super();
        this.token = token;
        const client = this;
        this.apiSender = new RESTApi_1.KookAPISender(token);
        this.connectManager = new WsConnectManager_1.WsConnectManager(this.apiSender, {
            onmessage: (data) => {
                void client.routeEvent(data);
            },
            onreset: () => { },
            onclose: () => { },
        });
    }
    start() {
        this.connectManager.start();
    }
    async routeEvent(data) {
        utils_1.SLogger.verbose(`${Constant_1.LogPrefix}routeEvent:`, data);
        if (data.s != 0)
            return;
        const ed = (0, utils_1.extractOutcome)(data.d, 'channel_type');
        (0, utils_1.match)(ed, {
            GROUP: ({ result }) => this.invokeEvent('GroupMessage', result),
            BROADCAST: ({ result }) => this.invokeEvent('BroadcastMessage', result),
            PERSON: ({ result }) => this.invokeEvent('PrivateMessage', result),
        }, v => utils_1.SLogger.warn(`${Constant_1.LogPrefix}WebsocketClient.routeEvent 错误 未知的 channel_type\neventdata:`, ed));
    }
}
exports.KOOKWebsocketClient = KOOKWebsocketClient;
