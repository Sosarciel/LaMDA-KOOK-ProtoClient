"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcGetGateway = ProcGetGateway;
const Utils_1 = require("../Utils");
const utils_1 = require("@zwa73/utils");
const Constant_1 = require("../../Constant");
async function ProcGetGateway(client) {
    const result = await (0, Utils_1.expRepeatify)(`获取网关`, "info", Infinity, () => getGateway(client), v => typeof v == 'string');
    if (result == utils_1.Terminated) {
        utils_1.SLogger.error(`${Constant_1.LogPrefix}获取网关失败 重试到极限 客户端被放弃`);
        return "Terminate";
    }
    client.gatewayUrl = result;
    utils_1.SLogger.verbose(`${Constant_1.LogPrefix}获取网关成功:`);
    return "ConnectGateway";
}
async function getGateway(client) {
    await (0, utils_1.sleep)(1000);
    utils_1.SLogger.verbose(`${Constant_1.LogPrefix}正在获取网关`);
    const result = await client.sender.getGateway();
    return result?.data.url;
}
