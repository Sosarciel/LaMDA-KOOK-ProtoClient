import { match, SequenceQueue, sleep, SLogger } from "@zwa73/utils";
import { WebSocket } from "ws";
import { ConnectStatus } from "./Interface";
import { ProcGetGateway } from "./GetGateway";
import { ProcConnectGateway, ProcReconnect } from "./ConnectGateway";
import { ProcHeartbeat } from "./Heartbeat";
import { KookAPISender } from "@/src/RESTApi";
import { AnySignaling } from "@/src/Event";
import { LogPrefix } from "@/src/Constant";


type ClientConnectEvent = {
    /**接收消息时的事件 */
    onmessage:(data:AnySignaling)=>void|Promise<void>;
    /**链接重置 / 触发sn清空 时的事件  
     * 将会自动重置内部sn
     */
    onreset:(()=>void|Promise<void>);
    /**ws被销毁时的事件 */
    onclose:(()=>void|Promise<void>);
}

export class WsConnectManager{
    cce  :ClientConnectEvent;
    queue:SequenceQueue<AnySignaling>;
    constructor(
        public sender: KookAPISender,
        clientConnectEvent?:Partial<ClientConnectEvent>,
    ) {
        clientConnectEvent ??= {};
        const client = this;
        this.cce = {
            async onmessage (data){
                if(clientConnectEvent.onmessage)
                    await clientConnectEvent.onmessage(data);
            },
            async onreset(){
                if(clientConnectEvent.onreset)
                    await clientConnectEvent.onreset();
                client.queue.reset();
            },
            async onclose(){
                if(clientConnectEvent.onclose)
                    await clientConnectEvent.onclose();
                client.ws?.close();
            }
        };
        this.queue = new SequenceQueue({emit:this.cce.onmessage});
    }

    /** 当前链接状态 */
    currStatus:ConnectStatus = "GetGateway";
    /** 当前ws客户端 */
    ws?:WebSocket;
    /** 主动心跳包事件 */
    heartbeatEvent?:NodeJS.Timeout;
    /** 获取到的url */
    gatewayUrl?:string;
    /** 用于重连的会话id */
    session_id?:string;

    async start(){
        while(true){
            //打断微队列
            await sleep(0);
            try{
                if(this.currStatus == "Terminate") break;
                this.currStatus = await match(this.currStatus,{
                    GetGateway      :()=>ProcGetGateway(this),
                    ConnectGateway  :()=>ProcConnectGateway(this),
                    Reconnect       :()=>ProcReconnect(this),
                    Heartbeat       :()=>ProcHeartbeat(this),
                    Terminate       :()=>"Terminate" as const,
                });
            }catch(e){
                SLogger.error(`${LogPrefix}WsConnectManager.start 处理状态时发生错误 ${e}`,'重置为 GetGateway');
                this.currStatus = "GetGateway";
            }
        }
    }
    getSn(){
        const sn = this.queue.getLastIdx();
        return sn == -1 ? 0 : sn;
    }
}