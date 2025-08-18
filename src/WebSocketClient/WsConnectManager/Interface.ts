


export const EXP_MAX_TIME = 60;

export const ConnectStatus = [
    "GetGateway",
    "ConnectGateway",
    "Heartbeat",
    "Terminate",
    "Reconnect",
] as const;
export type ConnectStatus = typeof ConnectStatus[number];