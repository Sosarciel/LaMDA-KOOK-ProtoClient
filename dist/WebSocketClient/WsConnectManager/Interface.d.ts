export declare const EXP_MAX_TIME = 60000;
export declare const TIMEOUT_TIME = 6000;
export declare const ConnectStatus: readonly ["GetGateway", "ConnectGateway", "Heartbeat", "Terminate", "Reconnect"];
export type ConnectStatus = typeof ConnectStatus[number];
