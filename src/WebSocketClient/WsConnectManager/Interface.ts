


export const EXP_MAX_TIME = 60_000;
export const TIMEOUT_TIME = 6000;

export const ConnectStatus = [
    "GetGateway",
    "ConnectGateway",
    "Heartbeat",
    "Terminate",
    "Reconnect",
] as const;
export type ConnectStatus = typeof ConnectStatus[number];