import { Failed, LogLevel, sleep, Success, Terminated, Timeout, UtilFT, UtilFunc } from "@zwa73/utils";
import { WebSocket } from "ws";
import { LogPrefix } from "../Constant";
import { EXP_MAX_TIME, TIMEOUT_TIME } from "./WsConnectManager/Interface";



/**等待一个事件发生
 * @param emitter  - EventEmmiter
 */
export function raceEvent<LIST extends {event:string,result:any}[]>(
    emitter: NodeJS.EventEmitter,
    list:LIST,
): Promise<LIST[number]['result']> {
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
export function waitForMessage<T extends (data:Buffer)=>any|undefined>(
    ws: WebSocket,
    timeoutMs:number,
    filter: T,
): Promise<Exclude<ReturnType<T>,undefined>|Timeout> {
    return new Promise((resolve) => {
        const onMessage = (data: Buffer) => {
            const result = filter(data);
            if (result !== undefined) {
                cleanup();
                resolve(result);
            }
        };

        const onTimeout = () => {
            cleanup();
            resolve(Timeout);
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
export const expRepeatify = async <T extends ()=>Promise<any>> (
    logFlag:string,
    logLevel:LogLevel,
    maxCount:number,
    procfn:T,
    verfyfn:((arg:Awaited<ReturnType<T>>)=>boolean|Promise<boolean>),
):Promise<ReturnType<T>|Terminated>=>{
    const result = await UtilFunc.retryPromise<Awaited<ReturnType<T>>>(
        procfn, v=>verfyfn(v) ? Success : Failed,{
            tryDelay: 2000,
            logFlag:`${LogPrefix}${logFlag}`,
            logLevel,
            expBackoff: true,
            count: maxCount,
            expBackoffMax: EXP_MAX_TIME,
            tryInterval: TIMEOUT_TIME
    });
    if(result.completed!=undefined)
        return result.completed;
    return Terminated;
}

/**以数组中的时间作为延迟  
 * 第一次尝试前将会等待timeseq[0]秒
 */
export const seqRepeatify = async <T extends ()=>Promise<any>> (
    logFlag:string,
    logLevel:LogLevel,
    timeseq:number[],
    procfn:T,
    verfyfn:((arg:Awaited<ReturnType<T>>)=>boolean|Promise<boolean>),
):Promise<ReturnType<T>|Terminated>=>{
    const [fst,...rest] = timeseq.map(v=>v*1000);
    await sleep(fst);
    const result = await UtilFunc.retryPromise<Awaited<ReturnType<T>>>(
        procfn, v=>verfyfn(v) ? Success : Failed,{
            tryDelay: rest,
            logFlag:`${LogPrefix}${logFlag}`,
            logLevel,
            count: timeseq.length,
            tryInterval: TIMEOUT_TIME,
    });
    if(result.completed!=undefined)
        return result.completed;
    return Terminated;
}