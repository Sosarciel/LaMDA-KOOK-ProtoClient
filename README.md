# KOOK-ProtoClient

KOOK 平台协议客户端实现，用于连接 KOOK 语音社区平台。

---

## 📋 实施计划

- [[plan/README|查看所有计划]]

---

## 功能概述

- **WebSocket 连接**：支持 Gateway 连接与心跳保活
- **事件处理**：消息事件、信令事件等事件类型
- **REST API**：封装 KOOK HTTP API 接口
- **卡片消息**：支持 KOOK 卡片消息构建

## 目录结构

```
src/
├── WebSocketClient/   # WebSocket 客户端
│   └── WsConnectManager/  # 连接管理器
├── RESTApi/           # REST API 封装
│   ├── CardMessage.ts # 卡片消息
│   └── Sender.ts      # 消息发送器
└── Event/             # 事件类型定义
```

---

*最后更新: 2026-03-25*
