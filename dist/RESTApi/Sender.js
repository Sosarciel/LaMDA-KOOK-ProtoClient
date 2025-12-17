"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KookAPISender = void 0;
const utils_1 = require("@zwa73/utils");
const Define_1 = require("../Define");
class KookAPISender {
    token;
    constructor(token) {
        this.token = token;
    }
    async postapi(url, obj) {
        return utils_1.UtilHttp.httpsPostJson().option({
            logLevel: 'verbose',
            hostname: Define_1.KookBaseUrl,
            port: 443,
            path: url,
            headers: {
                "Content-Type": "application/json",
                "Authorization": (0, Define_1.getAuthorization)('Bot', this.token),
            }
        }).once({ json: obj });
    }
    async getapi(url, obj) {
        return utils_1.UtilHttp.httpsGetJson().sendQuery().option({
            logLevel: 'verbose',
            hostname: Define_1.KookBaseUrl,
            path: url,
            port: 443,
            headers: {
                "Content-Type": "application/json",
                "Authorization": (0, Define_1.getAuthorization)('Bot', this.token),
            }
        }).once({ query: obj ?? {} });
    }
    /**上传媒体文件 */
    async uploadMedia(filepath) {
        const res = await utils_1.UtilHttp.httpsPostJson()
            .option({
            logLevel: 'verbose',
            hostname: Define_1.KookBaseUrl,
            path: Define_1.Endpoint.UploadMedia,
            port: 443,
            headers: {
                "Authorization": (0, Define_1.getAuthorization)('Bot', this.token),
            }
        })
            .sendFile()
            .once({ filepath, filename: "file" });
        return res?.data;
    }
    /**发送私聊消息 */
    async sendPrivateMsg(data) {
        const res = await this.postapi(Define_1.Endpoint.PrivateMessage.Create, data);
        return res?.data;
    }
    /**发送频道消息 */
    async sendChannelMsg(data) {
        const res = await this.postapi(Define_1.Endpoint.GroupMessage.Create, data);
        return res?.data;
    }
    /**获取自身数据 */
    async getSelfData() {
        const res = await this.getapi(Define_1.Endpoint.User.Me);
        return res?.data;
    }
    /**获取网关 */
    async getGateway() {
        const res = await this.getapi(Define_1.Endpoint.Gateway, {
            compress: 0,
        });
        return res?.data;
    }
}
exports.KookAPISender = KookAPISender;
