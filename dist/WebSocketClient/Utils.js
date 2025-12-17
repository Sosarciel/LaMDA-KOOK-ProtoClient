"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seqRepeatify = exports.expRepeatify = void 0;
exports.raceEvent = raceEvent;
exports.waitForMessage = waitForMessage;
const utils_1 = require("@zwa73/utils");
const Constant_1 = require("../Constant");
const Interface_1 = require("./WsConnectManager/Interface");
/**等待一个事件发生
 * @param emitter  - EventEmmiter
 */
function raceEvent(emitter, list) {
    return new Promise(resolve => {
        const cleanup = () => {
            for (const { event, handler } of handlers)
                emitter.off(event, handler);
        };
        const handlers = list.map(({ event, result }) => {
            const handler = () => {
                cleanup();
                resolve(result);
            };
            emitter.once(event, handler);
            return { event, handler };
        });
    });
}
/**等待一次消息
 * @param ws        - 用以等待消息的ws
 * @param timeoutMs - 如果在规定时间内没有接收到消息 则返回 Timeout
 * @param filter    - 若返回非undefined将完成等待并返回 否则忽视消息
 */
function waitForMessage(ws, timeoutMs, filter) {
    return new Promise((resolve) => {
        const onMessage = (data) => {
            const result = filter(data);
            if (result !== undefined) {
                cleanup();
                resolve(result);
            }
        };
        const onTimeout = () => {
            cleanup();
            resolve(utils_1.Timeout);
        };
        const cleanup = () => {
            ws.off("message", onMessage);
        };
        ws.on("message", onMessage);
        setTimeout(onTimeout, timeoutMs);
    });
}
/**以2为底的指数重试
 * 第一次无延迟
 */
const expRepeatify = async (logFlag, logLevel, maxCount, procfn, verfyfn) => {
    const result = await utils_1.UtilFunc.retryPromise(procfn, v => verfyfn(v) ? utils_1.Success : utils_1.Failed, {
        tryDelay: 2000,
        logFlag: `${Constant_1.LogPrefix}${logFlag}`,
        logLevel,
        expBackoff: true,
        count: maxCount,
        expBackoffMax: Interface_1.EXP_MAX_TIME,
        tryInterval: Interface_1.TIMEOUT_TIME
    });
    if (result.completed != undefined)
        return result.completed;
    return utils_1.Terminated;
};
exports.expRepeatify = expRepeatify;
/**以数组中的时间作为延迟
 * 第一次尝试前将会等待timeseq[0]秒
 */
const seqRepeatify = async (logFlag, logLevel, timeseq, procfn, verfyfn) => {
    const [fst, ...rest] = timeseq.map(v => v * 1000);
    await (0, utils_1.sleep)(fst);
    const result = await utils_1.UtilFunc.retryPromise(procfn, v => verfyfn(v) ? utils_1.Success : utils_1.Failed, {
        tryDelay: rest,
        logFlag: `${Constant_1.LogPrefix}${logFlag}`,
        logLevel,
        count: timeseq.length,
        tryInterval: Interface_1.TIMEOUT_TIME,
    });
    if (result.completed != undefined)
        return result.completed;
    return utils_1.Terminated;
};
exports.seqRepeatify = seqRepeatify;
