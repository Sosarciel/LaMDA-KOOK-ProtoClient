import { ConnectStatus } from "./Interface";
import { WsConnectManager } from "./WsConnectManager";
export declare function ProcConnectGateway(client: WsConnectManager): Promise<ConnectStatus>;
export declare function ProcReconnect(client: WsConnectManager): Promise<ConnectStatus>;
