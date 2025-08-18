/**一个卡片消息最多5段, 总模块数量不超过50 */
export type CardMessage = CardMessageSegment[];

type CardTheme = "primary"|"success"|"danger"|"warning"|"info"|"secondary"|"none";
type CardMessageSegment = {
    type: "card";
    /**主题
     * 可选的值为：primary, success, danger, warning, info, secondary, none
     * 默认为 primary，为 none 时不显示侧边框
     * 
     * theme 支持了invisible，在该主题下，不会有卡片的边框。由于兼容适配问题，选择该主题时，当前只能使用如下module:
     * context,action-group,divider,header,container,section
     * section中不允许有accessory,file,audio,video
     */
    theme?: CardTheme|"invisible";
    /**大小，可选值为：xs, sm, md, lg
     * 一般默认为 lg
     */
    size?: "xs"|"sm"|"md"|"lg";
    /**16 进制色值  
     * 代表卡片边框具体颜色，如果填了，则使用该 color，如果未填，则使用 theme 来渲染卡片颜色
     */
    color?:`#${string}`;
    modules?: CardMessageModule[];
};

/**模块 */
type CardMessageModule = HeaderModule|ContentModule|ImageGroupModule|ContainerModule|ActionGroupModule|ContextModule|DividerModule|InviteModule|CountdownModule|FileModule;

/**标题模块  
 * 作用说明： 标题模块只能支持展示标准文本（text），突出标题样式。
 * text 为文字元素且 content 不能超过 100 个字
 */
type HeaderModule = {
    type: "header";
    text: TextElement;
};

/**内容模块  
 * 作用说明： 结构化的内容，显示文本+其它元素。
 * text 可以为 plain-text, kmarkdown 或者 paragraph
 * accessory 可以为 image 或者 button
 * button 不能放置在左侧
 * mode 代表 accessory 是放置在左侧还是在右侧
 */
type ContentModule = {
    type: "section";
    mode: "left" | "right";
    text: TextElement | KMarkdownElement | ParagraphElement;
    accessory: ImageElement|ButtonElement;
};

/**图片组模块
 * 作用说明： 1 到多张图片的组合
 * elements 只能有 image 元素，只能有 1-9 张图片
 */
type ImageGroupModule = {
    type : "image-group";
    elements: ImageElement[];
}

/**容器模块
 * 作用说明： 1 到多张图片的组合，与图片组模块不同，图片并不会裁切为正方形。多张图片会纵向排列。
 * elements 只能有 image 元素，只能有 1-9 张图片
 */
type ContainerModule = {
    type : "container";
    elements: ImageElement[];
}


/**交互模块
 * 作用说明： 交互模块中包含交互控件元素，目前支持的交互控件为按钮（button）
 * elements 中只能为 button
 * elements 最多只能有 4 个
 */
type ActionGroupModule = {
    type: "action-group";
    elements: ButtonElement[];
}

/**备注模块
 * 作用说明： 展示图文混合的内容。
 * elements 中可以为：plain-text, kmarkdown, image
 * elements 最多可包含 10 个元素
 */
type ContextModule = {
    type: "context",
    elements: [],
}

/**割线模块
 * 作用说明： 展示分割线。
 */
type DividerModule = {
    type: "divider";
}

/**文件模块
 * 作用说明： 展示文件，目前有三种，文件，视频和音频。
 */
type FileModule = {
    "type"  : "file"|"audio"|"video";
    "src"   : string; //文件|音频|视频地址
    "title"?: string;
    "cover"?: string;//封面图
}

/**倒计时模块
 * 作用说明： 展示倒计时。
 * mode 主要是倒计时的样式，目前支持三种样式。
 * startTime 和 endTime 为毫秒时间戳，startTime 和 endTime 不能小于服务器当前时间戳。
 */
type CountdownModule = {
    type      : "countdown",
    /**到期的毫秒时间戳 */
    endTime   : number;
    /**起始的毫秒时间戳，仅当mode为second才有这个字段 */
    startTime : number;
    /**倒计时样式, 按天显示，按小时显示或者按秒显示 */
    mode      : "day"|"hour"|"second";
}

/**邀请模块
 * 作用说明： 提供服务器邀请/语音频道邀请 主要结构：
 */
type InviteModule = {
    type: "invite";
    /**邀请链接或者邀请码 */
    code: string;
}



/**普通文本
 * 作用说明： 显示文字。
 * emoji 为布尔型，默认为 true。如果为 true,会把 emoji 的 shortcut 转为 emoji
 * 为了方便书写，所有 plain-text 的使用处可以简单的用字符串代替。
 * 最大 2000 个字
 */
type TextElement = {
    type    : "plain-text",
    content : string,
    emoji  ?: true|false,
};

/**kmarkdown
 * 作用说明： 显示文字。
 * 最大 5000 个字
 */
type KMarkdownElement = {
    type    : "kmarkdown",
    content : "**hello**",
}

/**图片
 * 作用说明： 显示图片。
 * 图片类型（MimeType）限制说明：目前仅支持image/jpeg, image/gif, image/png这 3 种
 * 图片的 size 默认为 lg
 * 当使用外链时，src的地址可能会转存失败，如果希望不报错，可以填入fallbackUrl。
 * 请务必保证fallbackUrl是你之前在KOOK上传或者转存过的图片地址，否则依然可能失败。
 */
type ImageElement = {
    type        : "image";
    src         : string;
    alt        ?: string;
    size       ?: "sm"|"lg"; // size只用在图文混排  图片组大小固定
    circle     ?: true|false;
    fallbackUrl?: string;
}

/**按钮
 * 作用说明： 提供交互的功能
 * value 只能为 string
 * text 可以为 plain-text, kmarkdown
 * click 代表用户点击的事件,默认为""，代表无任何事件。
 * 当为 link 时，会跳转到 value 代表的链接;
 * 当为 return-val 时，系统会通过系统消息将消息 id,点击用户 id 和 value 发回给发送者，发送者可以根据自己的需求进行处理,消息事件参见button 点击事件。私聊和频道内均可使用按钮点击事件。
 */
type ButtonElement = {
    type: "button";
    theme?: CardTheme; //按钮的主题颜色
    click?: ""|"click"|"return-val"; //click时的事件类型，为 return-val 时将通过事件返回value值
    text: "plain-text"|"kmarkdown";
    value: string, //要传递的value，为string
}

/**结构体
 * 区域文本
 * 作用说明： 支持分栏结构，将模块分为左右两栏，根据顺序自动排列，支持更自由的文字排版模式，提高可维护性
 * cols 是 int,可以的取值为 1-3
 * fields 可以的元素为 text 或 kmarkdown
 * paragraph 最多有 50 个元素
 */
type ParagraphElement = {
    type: "paragraph",
    cols: 1|2|3, //移动端忽略该参数
    fields : (TextElement|KMarkdownElement)[],
}