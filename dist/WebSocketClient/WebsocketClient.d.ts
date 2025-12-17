import { EventSystem } from '@zwa73/utils';
import { WsConnectManager } from './WsConnectManager/WsConnectManager';
import { AnySignaling, EventMap } from '../Event';
import { KookAPISender } from '../RESTApi';
/**websocket客户端 */
export declare class KOOKWebsocketClient extends EventSystem<EventMap> {
    private token;
    connectManager: WsConnectManager;
    apiSender: KookAPISender;
    constructor(token: string);
    start(): void;
    routeEvent(data: AnySignaling): Promise<void>;
}
