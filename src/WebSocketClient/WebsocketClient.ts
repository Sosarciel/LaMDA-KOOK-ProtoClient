import { EventSystem, SLogger } from '@zwa73/utils';
import { WsConnectManager } from './WsConnectManager/WsConnectManager';
import { AnySignaling, EventMap } from '../Event';
import { KookAPISender } from '../RESTApi';

/**websocket客户端 */
export class WebsocketClient extends EventSystem<EventMap> {
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
        SLogger.verbose('routeEvent:',data);
        if(data.s != 0) return;
        const eventdata = data.d;
        switch(eventdata.channel_type){
            case "BROADCAST":{
                this.invokeEvent('BroadcastMessage',eventdata);
                break;
            }
            case "GROUP":{
                this.invokeEvent('GroupMessage',eventdata);
                break;
            }
            case "PERSON":{
                this.invokeEvent('PrivateMessage',eventdata);
                break;
            }
            default:{
                SLogger.warn(`WebsocketClient.routeEvent 错误 未知的channel_type:${(eventdata as any).channel_type}`);
                break;
            }
        }
    }
}



