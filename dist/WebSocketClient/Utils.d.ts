import { LogLevel, Terminated, Timeout } from "@zwa73/utils";
import { WebSocket } from "ws";
/**等待一个事件发生
 * @param emitter  - EventEmmiter
 */
export declare function raceEvent<LIST extends {
    event: string;
    result: any;
}[]>(emitter: NodeJS.EventEmitter, list: LIST): Promise<LIST[number]['result']>;
/**等待一次消息
 * @param ws        - 用以等待消息的ws
 * @param timeoutMs - 如果在规定时间内没有接收到消息 则返回 Timeout
 * @param filter    - 若返回非undefined将完成等待并返回 否则忽视消息
 */
export declare function waitForMessage<T extends (data: Buffer) => any | undefined>(ws: WebSocket, timeoutMs: number, filter: T): Promise<Exclude<ReturnType<T>, undefined> | Timeout>;
/**以2为底的指数重试
 * 第一次无延迟
 */
export declare const expRepeatify: <T extends () => Promise<any>>(logFlag: string, logLevel: LogLevel, maxCount: number, procfn: T, verfyfn: ((arg: Awaited<ReturnType<T>>) => boolean | Promise<boolean>)) => Promise<ReturnType<T> | Terminated>;
/**以数组中的时间作为延迟
 * 第一次尝试前将会等待timeseq[0]秒
 */
export declare const seqRepeatify: <T extends () => Promise<any>>(logFlag: string, logLevel: LogLevel, timeseq: number[], procfn: T, verfyfn: ((arg: Awaited<ReturnType<T>>) => boolean | Promise<boolean>)) => Promise<ReturnType<T> | Terminated>;
