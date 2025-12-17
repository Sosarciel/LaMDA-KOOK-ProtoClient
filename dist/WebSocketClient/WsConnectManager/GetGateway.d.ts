import { ConnectStatus } from "./Interface";
import { WsConnectManager } from "./WsConnectManager";
export declare function ProcGetGateway(client: WsConnectManager): Promise<ConnectStatus>;
