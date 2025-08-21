import { JObject, QueryRequestData, UtilHttp } from "@zwa73/utils";
import { Endpoint, getAuthorization, KookBaseUrl } from "../Define";
import { GatewayResp, SendGroupMessageReqData, SendGroupMessageRespData, SendPrivateMessageReqData, SendPrivateMessageRespData, UploadMediaRespData } from "./Interface";

export class KookAPISender{
    constructor(private token:string){}

    private async postapi(url:string,obj?:JObject){
        return UtilHttp.httpsPostJson().option({
            logLevel:'verbose',
            hostname:KookBaseUrl,
            port:443,
            path:url,
            headers:{
                "Content-Type":"application/json",
                "Authorization":getAuthorization('Bot',this.token),
            }
        }).once({json:obj});
    }
    private async getapi(url:string,obj?:QueryRequestData){
        return UtilHttp.httpsGetJson().sendQuery().option({
            logLevel:'verbose',
            hostname:KookBaseUrl,
            path:url,
            port:443,
            headers:{
                "Content-Type":"application/json",
                "Authorization":getAuthorization('Bot',this.token),
            }
        }).once({query:obj??{}});
    }

    /**上传媒体文件 */
    async uploadMedia(filepath:string){
        const res =  await UtilHttp.httpsPostJson()
        .option({
            logLevel:'verbose',
            hostname:KookBaseUrl,
            path:Endpoint.UploadMedia,
            port:443,
            headers:{
                "Authorization":getAuthorization('Bot',this.token),
            }
        })
        .sendFile()
        .once({filepath,filename:"file"});

        return res?.data as UploadMediaRespData|undefined;
    }

    /**发送私聊消息 */
    async sendPrivateMsg(data:SendPrivateMessageReqData){
        const res = await this.postapi(Endpoint.PrivateMessage.Create,data);
        return res?.data as SendPrivateMessageRespData|undefined;
    }

    /**发送频道消息 */
    async sendChannelMsg(data:SendGroupMessageReqData){
        const res = await this.postapi(Endpoint.GroupMessage.Create,data);
        return res?.data as SendGroupMessageRespData|undefined;
    }

    /**获取自身数据 */
    async getSelfData(){
        const res = await this.getapi(Endpoint.User.Me);
        return res?.data as JObject|undefined;
    }

    /**获取网关 */
    async getGateway(){
        const res = await this.getapi(Endpoint.Gateway,{
            compress:0,
        });
        return res?.data as GatewayResp|undefined;
    }
}