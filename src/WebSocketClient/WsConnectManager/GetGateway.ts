import { expRepeatify } from "../Utils";
import { ConnectStatus } from "./Interface";
import { sleep, SLogger, Terminated } from "@zwa73/utils";
import { WsConnectManager } from "./WsConnectManager";
import { LogPrefix } from "@/src/Constant";



export async function ProcGetGateway(client:WsConnectManager):Promise<ConnectStatus>{
    const result = await expRepeatify(
        `获取网关`,"info",Infinity,
        ()=>getGateway(client),
        v=>typeof v == 'string');
    if(result == Terminated){
        SLogger.error(`${LogPrefix}获取网关失败 重试到极限 客户端被放弃`);
        return "Terminate"
    }
    client.gatewayUrl = result;
    SLogger.verbose(`${LogPrefix}获取网关成功:`);
    return "ConnectGateway";
}

async function getGateway(client:WsConnectManager) {
    await sleep(1000);
    SLogger.verbose(`${LogPrefix}正在获取网关`);
    const result = await client.sender.getGateway();
    return result?.data.url!;
}