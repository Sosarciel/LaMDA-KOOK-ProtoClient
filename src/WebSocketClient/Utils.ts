import { sleep, Terminated, Timeout } from "@zwa73/utils";
import { WebSocket } from "ws";



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
    maxTime:number,
    maxCount:number,
    procfn:T,
    verfyfn:((arg:Awaited<ReturnType<T>>)=>boolean|Promise<boolean>),
):Promise<ReturnType<T>|Terminated>=>{
    for(let count = 0;count<maxCount;count++){
        if(count!=0)
            await sleep(Math.min(maxTime,Math.pow(2,count))*1000);
        const result = await procfn();
        if(verfyfn(result)) return result;
    }
    return Terminated;
}

/**以数组中的时间作为延迟  
 * 第一次使用[0]
 */
export const seqRepeatify = async <T extends ()=>Promise<any>> (
    timeseq:number[],
    procfn:T,
    verfyfn:((arg:Awaited<ReturnType<T>>)=>boolean|Promise<boolean>),
):Promise<ReturnType<T>|Terminated>=>{
    for (const time of timeseq) {
        await sleep(time*1000);
        const result = await procfn();
        if(verfyfn(result)) return result;
    }
    return Terminated;
}