import { expRepeatify, seqRepeatify, raceEvent, waitForMessage } from "../Utils";
import { EXP_MAX_TIME, ConnectStatus } from "./Interface";
import { Failed, match, SLogger, Success, Terminated, Timeout } from "@zwa73/utils";
import { WsConnectManager } from "./WsConnectManager";
import { WebSocket } from "ws";
import qs from 'querystring';
import { AnySignaling } from "@/src/Event";


export async function ProcConnectGateway(client:WsConnectManager):Promise<ConnectStatus>{
    const {gatewayUrl} = client;
    if(gatewayUrl==null) return "GetGateway";
    await client.cce.onreset();
    await client.cce.onclose();
    client.ws = new WebSocket(gatewayUrl);
    const result = await expRepeatify(EXP_MAX_TIME,2,
        ()=>tryConnect(client.ws),
        (v)=>v==Success,
    );

    return match(result, {
        [Terminated]():ConnectStatus{
            SLogger.warn(`连接网关失败 重试到极限 回退至 GetGateway`);
            return "GetGateway";
        },
        async [Success]():Promise<ConnectStatus>{
            SLogger.info(`连接网关成功`);
            return await ProcAwaitHello(client);
        },
        [Failed]():ConnectStatus{
            SLogger.warn(`连接网关失败 重试到极限 回退至 GetGateway`);
            return "GetGateway";
        },
    });
}


export async function ProcReconnect(client:WsConnectManager):Promise<ConnectStatus>{
    const {gatewayUrl,session_id, queue} = client;
    if(gatewayUrl==null) return "GetGateway";
    if(session_id==null) return "GetGateway";
    const reconnectUrl = `${gatewayUrl}&${qs.stringify({
        resume:1, session_id, sn:queue.getLastIdx(),
    })}`;
    await client.cce.onclose();
    client.ws = new WebSocket(reconnectUrl);
    const result = await seqRepeatify([8,16],
        ()=>tryConnect(client.ws),
        v=>v==Success,
    );

    return match(result, {
        [Terminated]():ConnectStatus{
            SLogger.warn(`重连失败 重试到极限 回退至 GetGateway`);
            return "GetGateway";
        },
        async [Success]():Promise<ConnectStatus>{
            SLogger.info(`重连成功`);
            return await ProcAwaitHello(client);
        },
        [Failed]():ConnectStatus{
            SLogger.warn(`重连失败 重试到极限 回退至 GetGateway`);
            return "GetGateway";
        },
    });
}


async function tryConnect(ws?:WebSocket){
    SLogger.info(`正在连接网关`);
    if(ws==null){
        SLogger.error(`tryConnect 错误 ws不存在`);
        return Failed;
    }
    return await raceEvent(ws, [
        {event:"open" , result:Success} as const,
        {event:"error", result:Failed } as const,
    ]);
}

async function ProcAwaitHello(client:WsConnectManager):Promise<ConnectStatus>{
    const result = await awaitHello(client);
    return match(result, {
        [Timeout]():ConnectStatus{
            SLogger.warn(`等待hello包失败 超时 回退至 GetGateway`);
            return "GetGateway";
        },
        [Success]():ConnectStatus{
            SLogger.info(`等待hello包成功`);
            return "Heartbeat";
        },
        [Failed]():ConnectStatus{
            SLogger.warn(`等待hello包成功 出现错误 回退至 GetGateway`);
            return "GetGateway";
        },
    });
}

async function awaitHello(client:WsConnectManager){
    const ws = client.ws;
    if(ws==null) return Failed;

    return await waitForMessage(ws,6000,(data:Buffer) => {
        const strdata = data.toString();
        try {
            const jsonData = JSON.parse(strdata) as AnySignaling;
            if(jsonData==null) return Failed;
            if(jsonData.s==1){
                if(jsonData.d.code==0){
                    client.session_id = jsonData.d.session_id;
                    return Success;
                }
                else {
                    SLogger.warn(`SignalingHello 错误:${jsonData.d.code}`,`rawdata:${strdata}`);
                    return Failed;
                }
            }
        } catch (error) {
            console.log(error);
            SLogger.warn('SignalingHello 错误',error,`rawdata:${strdata}`); // 添加错误处理逻辑
        }
    })
}