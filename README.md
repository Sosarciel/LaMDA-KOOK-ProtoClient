# KOOK-ProtoClient
typescript 实现的 KOOK 机器人协议客户端  

消息编辑器: https://www.kookapp.cn/tools/message-builder.html#/card  
官方文档: https://developer.kookapp.cn/doc/intro  

example:
```typescript
import { SLogger } from '@zwa73/utils';
import { WebsocketClient, CardMessage } from '../dist';
import path from 'pathe';

const token = "1/xxxxxxxx=/xxxxxxxxxxxxxxxxxxxxxxxx=="; // ← 替换为你的真实 token
const selfid = "123456789"; // ← 替换为你的机器人 ID
const testPng = path.join(__dirname, 'test.png');
const testWav = path.join(__dirname, 'test.wav');

void (async () => {
    SLogger.createLogger("default", "debug");

    const client = new WebsocketClient(token);

    client.registerEvent("PrivateMessage", {
        handler: async e => {
            if (e.author_id === selfid) return;

            client.apiSender.sendPrivateMsg({
                target_id: e.author_id,
                content: `私聊消息的反馈 ${e.content}`,
            });

            if (e.content === "image") {
                const data = await client.apiSender.uploadMedia(testPng);
                client.apiSender.sendPrivateMsg({
                    target_id: e.author_id,
                    type: 2,
                    content: data?.data.url,
                });
            }

            if (e.content === "voice") {
                const data = await client.apiSender.uploadMedia(testWav);
                const card: CardMessage = [{
                    type: 'card',
                    modules: [{
                        type: 'audio',
                        src: data?.data.url!,
                    }]
                }];
                client.apiSender.sendPrivateMsg({
                    target_id: e.author_id,
                    type: 10,
                    content: JSON.stringify(card),
                });
            }
        }
    });

    client.registerEvent("GroupMessage", {
        handler: e => {
            if (e.author_id === selfid) return;

            client.apiSender.sendChannelMsg({
                target_id: e.author_id,
                content: `组聊消息的反馈 ${e.content}`,
            });
        }
    });

    client.start();
})();
```