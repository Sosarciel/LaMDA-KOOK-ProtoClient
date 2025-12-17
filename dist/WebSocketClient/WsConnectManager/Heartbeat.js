"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcHeartbeat = ProcHeartbeat;
const Utils_1 = require("../Utils");
const utils_1 = require("@zwa73/utils");
const Constant_1 = require("../../Constant");
async function ProcHeartbeat(client) {
    const { ws } = client;
    if (ws == null) {
        utils_1.SLogger.warn(`${Constant_1.LogPrefix}ProcHeartbeat 错误 ws 不存在, 回退至 GetGateway`);
        return "GetGateway";
    }
    const result = await heartbeat(client);
    return (0, utils_1.match)(result, {
        [utils_1.Timeout]() {
            utils_1.SLogger.warn(`${Constant_1.LogPrefix}心跳超时 回退至 Reconnect`);
            return "Reconnect";
        },
        [utils_1.Terminated]() {
            utils_1.SLogger.verbose(`${Constant_1.LogPrefix}心跳中接收到重置信号 回退至 GetGateway`);
            return "GetGateway";
        },
        [utils_1.Failed]() {
            utils_1.SLogger.warn(`${Constant_1.LogPrefix}心跳失败 回退至 Reconnect`);
            return "Reconnect";
        },
    });
}
async function heartbeat(client) {
    utils_1.SLogger.verbose(`${Constant_1.LogPrefix}正在维持心跳`);
    let breakIdle = null;
    const idlePromise = new Promise((resolve, reject) => breakIdle = resolve);
    client.heartbeatEvent = setInterval(async () => {
        const result = await (0, Utils_1.expRepeatify)(`检查心跳`, "verbose", 2, () => checkHeartbeat(client), v => v == utils_1.Success);
        (0, utils_1.match)(result, {
            [utils_1.Timeout]() {
                utils_1.SLogger.warn(`${Constant_1.LogPrefix}检查心跳失败 超时`);
                if (breakIdle)
                    breakIdle(utils_1.Timeout);
            },
            [utils_1.Success]() {
                utils_1.SLogger.verbose(`${Constant_1.LogPrefix}检查心跳完成`);
            },
            [utils_1.Failed]() {
                utils_1.SLogger.warn(`${Constant_1.LogPrefix}检查心跳失败`);
                if (breakIdle)
                    breakIdle(utils_1.Terminated);
            },
            [utils_1.Terminated]() {
                utils_1.SLogger.warn(`${Constant_1.LogPrefix}检查心跳失败 重试到极限`);
                if (breakIdle)
                    breakIdle(utils_1.Failed);
            }
        });
    }, 30_000);
    const idle = async (data) => {
        try {
            const strdata = data.toString();
            const jsonData = JSON.parse(strdata);
            if ('sn' in jsonData && typeof jsonData.sn == "number")
                client.queue.enqueue(jsonData.sn, jsonData); //有序消息入队
            else
                await client.cce.onmessage(jsonData); //无序消息直接调用
            //重连则打断idle状态
            if (jsonData.s == 5) {
                utils_1.SLogger.warn(`${Constant_1.LogPrefix}触发重连 code:${jsonData.d.code}`);
                if (breakIdle)
                    breakIdle(utils_1.Terminated);
            }
        }
        catch (err) {
            utils_1.SLogger.warn(`${Constant_1.LogPrefix}heartbeat.idle 错误,已略过 err:`, err);
        }
    };
    client.ws?.on('message', idle);
    //一直等待直到出错
    const result = await idlePromise;
    clearInterval(client.heartbeatEvent);
    client.ws?.off('message', idle);
    client.heartbeatEvent = undefined;
    return result;
}
async function checkHeartbeat(client) {
    const csn = client.queue.getLastIdx();
    utils_1.SLogger.verbose(`${Constant_1.LogPrefix}尝试检查心跳 ${csn}`);
    const ws = client.ws;
    if (ws == null) {
        utils_1.SLogger.warn(`${Constant_1.LogPrefix}checkHeartbeat 错误 ws 不存在`); // 添加错误处理逻辑
        return utils_1.Failed;
    }
    const hb = {
        s: 2,
        sn: csn,
    };
    ws.send(JSON.stringify(hb));
    return await (0, Utils_1.waitForMessage)(ws, 6000, (data) => {
        const strdata = data.toString();
        try {
            const jsonData = JSON.parse(strdata);
            if (jsonData.s == 3)
                return utils_1.Success;
        }
        catch (err) {
            utils_1.SLogger.warn(`${Constant_1.LogPrefix}checkHeartbeat 错误`, err, `rawdata:${strdata}`); // 添加错误处理逻辑
            return utils_1.Failed;
        }
    });
}
