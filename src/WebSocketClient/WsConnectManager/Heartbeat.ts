import { expRepeatify, waitForMessage } from "../Utils";
import { ConnectStatus } from "./Interface";
import { Failed, match, SLogger, Success, Terminated, Timeout } from "@zwa73/utils";
import { WsConnectManager } from "./WsConnectManager";
import { AnySignaling, SignalingPing } from "@/src/Event";
import { LogPrefix } from "@/src/Constant";



export async function ProcHeartbeat(client:WsConnectManager):Promise<ConnectStatus>{
    const { ws } = client;
    if(ws==null){
        SLogger.warn(`${LogPrefix}ProcHeartbeat 错误 ws 不存在, 回退至 GetGateway`);
        return "GetGateway";
    }
    const result = await heartbeat(client);
    return match(result, {
        [Timeout]():ConnectStatus{
            SLogger.warn(`${LogPrefix}心跳超时 回退至 Reconnect`);
            return "Reconnect";
        },
        [Terminated]():ConnectStatus{
            SLogger.verbose(`${LogPrefix}心跳中接收到重置信号 回退至 GetGateway`);
            return "GetGateway";
        },
        [Failed]():ConnectStatus{
            SLogger.warn(`${LogPrefix}心跳失败 回退至 Reconnect`);
            return "Reconnect";
        },
    });
}
async function heartbeat(client:WsConnectManager){
    type Rtn = Failed|Timeout|Terminated;
    SLogger.verbose(`${LogPrefix}正在维持心跳`);
    let breakIdle:((v:Rtn)=>void)|null= null;
    const idlePromise = new Promise<Rtn>((resolve,reject)=>breakIdle = resolve);
    client.heartbeatEvent = setInterval(async ()=>{
        const result = await expRepeatify(
            `检查心跳`,"verbose", 2,
            ()=>checkHeartbeat(client),
            v=>v==Success
        );
        match(result,{
            [Timeout](){
                SLogger.warn(`${LogPrefix}检查心跳失败 超时`);
                if(breakIdle) breakIdle(Timeout);
            },
            [Success](){
                SLogger.verbose(`${LogPrefix}检查心跳完成`);
            },
            [Failed](){
                SLogger.warn(`${LogPrefix}检查心跳失败`);
                if(breakIdle) breakIdle(Terminated);
            },
            [Terminated](){
                SLogger.warn(`${LogPrefix}检查心跳失败 重试到极限`);
                if(breakIdle) breakIdle(Failed);
            }
        })
    },30_000);
    const idle = async (data:Buffer)=>{
        try{
            const strdata = data.toString();
            const jsonData = JSON.parse(strdata) as AnySignaling;
            if('sn' in jsonData && typeof jsonData.sn == "number")
                client.queue.enqueue(jsonData.sn,jsonData);//有序消息入队
            else await client.cce.onmessage(jsonData);     //无序消息直接调用
            //重连则打断idle状态
            if(jsonData.s==5){
                SLogger.warn(`${LogPrefix}触发重连 code:${jsonData.d.code}`);
                if(breakIdle) breakIdle(Terminated);
            }
        }catch(err){
            SLogger.warn(`${LogPrefix}heartbeat.idle 错误,已略过 err:`,err);
        }
    }
    client.ws?.on('message',idle);

    //一直等待直到出错
    const result = await idlePromise;
    clearInterval(client.heartbeatEvent);
    client.ws?.off('message',idle);
    client.heartbeatEvent = undefined;
    return result;
}
async function checkHeartbeat(client:WsConnectManager){
    const csn = client.queue.getLastIdx();
    SLogger.verbose(`${LogPrefix}尝试检查心跳 ${csn}`);
    const ws = client.ws;
    if(ws==null) {
        SLogger.warn(`${LogPrefix}checkHeartbeat 错误 ws 不存在`); // 添加错误处理逻辑
        return Failed;
    }
    const hb:SignalingPing = {
        s : 2,
        sn: csn,
    }
    ws.send(JSON.stringify(hb));

    return await waitForMessage(ws,6000,(data:Buffer)=>{
        const strdata = data.toString();
        try{
            const jsonData = JSON.parse(strdata) as AnySignaling;
            if(jsonData.s==3) return Success;
        }catch(err){
            SLogger.warn(`${LogPrefix}checkHeartbeat 错误`,err,`rawdata:${strdata}`); // 添加错误处理逻辑
            return Failed;
        }
    });
}