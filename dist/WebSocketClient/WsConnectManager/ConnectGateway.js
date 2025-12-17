"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcConnectGateway = ProcConnectGateway;
exports.ProcReconnect = ProcReconnect;
const Utils_1 = require("../Utils");
const utils_1 = require("@zwa73/utils");
const ws_1 = require("ws");
const querystring_1 = __importDefault(require("querystring"));
const Constant_1 = require("../../Constant");
async function ProcConnectGateway(client) {
    const { gatewayUrl } = client;
    if (gatewayUrl == null)
        return "GetGateway";
    await client.cce.onreset();
    await client.cce.onclose();
    client.ws = new ws_1.WebSocket(gatewayUrl);
    const result = await (0, Utils_1.expRepeatify)(`连接网关`, "info", 2, () => tryConnect(client.ws), v => v == utils_1.Success);
    return (0, utils_1.match)(result, {
        [utils_1.Terminated]() {
            utils_1.SLogger.warn(`${Constant_1.LogPrefix}连接网关失败 重试到极限 回退至 GetGateway`);
            return "GetGateway";
        },
        async [utils_1.Success]() {
            utils_1.SLogger.verbose(`${Constant_1.LogPrefix}连接网关成功`);
            return await ProcAwaitHello(client);
        },
        [utils_1.Failed]() {
            utils_1.SLogger.warn(`${Constant_1.LogPrefix}连接网关失败 重试到极限 回退至 GetGateway`);
            return "GetGateway";
        },
    });
}
async function ProcReconnect(client) {
    const { gatewayUrl, session_id, queue } = client;
    if (gatewayUrl == null)
        return "GetGateway";
    if (session_id == null)
        return "GetGateway";
    const reconnectUrl = `${gatewayUrl}&${querystring_1.default.stringify({
        resume: 1, session_id, sn: queue.getLastIdx(),
    })}`;
    await client.cce.onclose();
    client.ws = new ws_1.WebSocket(reconnectUrl);
    const result = await (0, Utils_1.seqRepeatify)(`重连网关`, "info", [8, 16], () => tryConnect(client.ws), v => v == utils_1.Success);
    return (0, utils_1.match)(result, {
        [utils_1.Terminated]() {
            utils_1.SLogger.warn(`${Constant_1.LogPrefix}重连失败 重试到极限 回退至 GetGateway`);
            return "GetGateway";
        },
        async [utils_1.Success]() {
            utils_1.SLogger.verbose(`${Constant_1.LogPrefix}重连成功`);
            return await ProcAwaitHello(client);
        },
        [utils_1.Failed]() {
            utils_1.SLogger.warn(`${Constant_1.LogPrefix}重连失败 重试到极限 回退至 GetGateway`);
            return "GetGateway";
        },
    });
}
async function tryConnect(ws) {
    utils_1.SLogger.verbose(`${Constant_1.LogPrefix}正在连接网关`);
    if (ws == null) {
        utils_1.SLogger.error(`${Constant_1.LogPrefix}tryConnect 错误 ws不存在`);
        return utils_1.Failed;
    }
    return await (0, Utils_1.raceEvent)(ws, [
        { event: "open", result: utils_1.Success },
        { event: "error", result: utils_1.Failed },
    ]);
}
async function ProcAwaitHello(client) {
    const result = await awaitHello(client);
    return (0, utils_1.match)(result, {
        [utils_1.Timeout]() {
            utils_1.SLogger.warn(`${Constant_1.LogPrefix}等待hello包失败 超时 回退至 GetGateway`);
            return "GetGateway";
        },
        [utils_1.Success]() {
            utils_1.SLogger.verbose(`${Constant_1.LogPrefix}等待hello包成功`);
            return "Heartbeat";
        },
        [utils_1.Failed]() {
            utils_1.SLogger.warn(`${Constant_1.LogPrefix}等待hello包成功 出现错误 回退至 GetGateway`);
            return "GetGateway";
        },
    });
}
async function awaitHello(client) {
    const ws = client.ws;
    if (ws == null)
        return utils_1.Failed;
    return await (0, Utils_1.waitForMessage)(ws, 6000, (data) => {
        const strdata = data.toString();
        try {
            const jsonData = JSON.parse(strdata);
            if (jsonData == null)
                return utils_1.Failed;
            if (jsonData.s == 1) {
                if (jsonData.d.code == 0) {
                    client.session_id = jsonData.d.session_id;
                    return utils_1.Success;
                }
                else {
                    utils_1.SLogger.warn(`${Constant_1.LogPrefix}SignalingHello 错误:${jsonData.d.code}`, `rawdata:${strdata}`);
                    return utils_1.Failed;
                }
            }
        }
        catch (error) {
            console.log(error);
            utils_1.SLogger.warn(`${Constant_1.LogPrefix}SignalingHello 错误`, error, `rawdata:${strdata}`); // 添加错误处理逻辑
        }
    });
}
