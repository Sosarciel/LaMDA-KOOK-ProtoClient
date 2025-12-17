"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectStatus = exports.TIMEOUT_TIME = exports.EXP_MAX_TIME = void 0;
exports.EXP_MAX_TIME = 60_000;
exports.TIMEOUT_TIME = 6000;
exports.ConnectStatus = [
    "GetGateway",
    "ConnectGateway",
    "Heartbeat",
    "Terminate",
    "Reconnect",
];
