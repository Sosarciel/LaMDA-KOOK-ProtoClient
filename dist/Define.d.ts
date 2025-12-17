/**获取授权头
 * @param type   - 机器人为 Bot OAuth为Bearer
 * @param token  - 机器人token或用户token
 */
export declare const getAuthorization: (type: "Bot" | "Bearer", token: string) => string;
export declare const KookBaseUrl: "www.kookapp.cn";
export declare class EndpointBuilder<T extends 3> {
    private version;
    constructor(version: T);
    buildEndpoint(): {
        /**获取网关 */
        Gateway: `/api/v${T}/gateway/index`;
        /**上传媒体文件 */
        UploadMedia: `/api/v${T}/asset/create`;
        PrivateMessage: {
            Create: `/api/v${T}/direct-message/create`;
        };
        GroupMessage: {
            Create: `/api/v${T}/message/create`;
        };
        User: {
            Me: `/api/v${T}/user/me`;
        };
    };
    private buildPrivateMessage;
    private buildGroupMessage;
    private buildUser;
}
export declare const Endpoint: {
    /**获取网关 */
    Gateway: "/api/v3/gateway/index";
    /**上传媒体文件 */
    UploadMedia: "/api/v3/asset/create";
    PrivateMessage: {
        Create: "/api/v3/direct-message/create";
    };
    GroupMessage: {
        Create: "/api/v3/message/create";
    };
    User: {
        Me: "/api/v3/user/me";
    };
};
