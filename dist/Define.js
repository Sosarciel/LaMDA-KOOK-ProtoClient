"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Endpoint = exports.EndpointBuilder = exports.KookBaseUrl = exports.getAuthorization = void 0;
/**获取授权头
 * @param type   - 机器人为 Bot OAuth为Bearer
 * @param token  - 机器人token或用户token
 */
const getAuthorization = (type, token) => `${type} ${token}`;
exports.getAuthorization = getAuthorization;
exports.KookBaseUrl = "www.kookapp.cn";
const formatBuilder = (pre) => (pth) => `${pre}/${pth}`;
class EndpointBuilder {
    version;
    constructor(version) {
        this.version = version;
    }
    buildEndpoint() {
        const f = (basepath) => `/api/v${this.version}/${basepath}`;
        return {
            /**获取网关 */
            Gateway: f('gateway/index'),
            /**上传媒体文件 */
            UploadMedia: f('asset/create'),
            PrivateMessage: this.buildPrivateMessage(f('direct-message')),
            GroupMessage: this.buildGroupMessage(f('message')),
            User: this.buildUser(f('user')),
        };
    }
    buildPrivateMessage(pre) {
        const f = formatBuilder(pre);
        return {
            Create: f('create'),
        };
    }
    buildGroupMessage(pre) {
        const f = formatBuilder(pre);
        return {
            Create: f('create'),
        };
    }
    buildUser(pre) {
        const f = formatBuilder(pre);
        return {
            Me: f('me'),
        };
    }
}
exports.EndpointBuilder = EndpointBuilder;
exports.Endpoint = new EndpointBuilder(3).buildEndpoint();
