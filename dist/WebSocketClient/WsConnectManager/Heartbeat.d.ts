import { ConnectStatus } from "./Interface";
import { WsConnectManager } from "./WsConnectManager";
export declare function ProcHeartbeat(client: WsConnectManager): Promise<ConnectStatus>;
