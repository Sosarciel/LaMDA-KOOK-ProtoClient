import { TextChannelsEventData } from "./EventData";




/**私聊消息事件数据 */
export type PrivateMessageEventData = TextChannelsEventData<'PERSON'>;
/**私聊消息事件 */
export type PrivateMessageEvent = (data:PrivateMessageEventData)=>void;

/**群组消息事件数据 */
export type GroupMessageEventData = TextChannelsEventData<'GROUP'>
/**群组消息事件 */
export type GroupMessageEvent = (data:GroupMessageEventData)=>void;

/**广播消息事件数据 */
export type BroadcastMessageEventData = TextChannelsEventData<'BROADCAST'>;
/**广播消息事件 */
export type BroadcastMessageEvent = (data:BroadcastMessageEventData)=>void;

/**消息事件数据 */
export type MessageEventData = PrivateMessageEventData|GroupMessageEventData|BroadcastMessageEventData;
/**消息事件 */
export type MessageEvent = PrivateMessageEvent&GroupMessageEvent&BroadcastMessageEvent;