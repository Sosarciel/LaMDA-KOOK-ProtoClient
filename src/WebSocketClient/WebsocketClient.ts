import { EventSystem, extractOutcome, Keyable, match, Outcome, outcome, SLogger, UtilFunc } from '@zwa73/utils';
import { WsConnectManager } from './WsConnectManager/WsConnectManager';
import { AnySignaling, EventMap } from '../Event';
import { KookAPISender } from '../RESTApi';

/**websocket客户端 */
export class KOOKWebsocketClient extends EventSystem<EventMap> {
    connectManager:WsConnectManager;
    apiSender:KookAPISender;
    constructor(private token: string) {
        super();
        const client = this;
        this.apiSender = new KookAPISender(token);
        this.connectManager = new WsConnectManager(this.apiSender, {
            onmessage: (data) => {
                void client.routeEvent(data);
            },
            onreset: () => { },
            onclose: () => { },
        });
    }
    start(){
        this.connectManager.start();
    }

    async routeEvent(data:AnySignaling){
        SLogger.verbose('KOOK-ProtoClient routeEvent:',data);
        if(data.s != 0) return;
        const ed = extractOutcome(data.d,'channel_type');
        match(ed,{
            GROUP    :({result})=>this.invokeEvent('GroupMessage',result),
            BROADCAST:({result})=>this.invokeEvent('BroadcastMessage',result),
            PERSON   :({result})=>this.invokeEvent('PrivateMessage',result),
        },v=>SLogger.warn(`KOOK-ProtoClient WebsocketClient.routeEvent 错误 未知的 channel_type\neventdata:`,ed));
    }
}



