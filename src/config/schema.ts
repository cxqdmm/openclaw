import { CHANNEL_IDS } from "../channels/registry.js";
import { VERSION } from "../version.js";
import { OpenClawSchema } from "./zod-schema.js";

export type ConfigUiHint = {
  label?: string;
  help?: string;
  group?: string;
  order?: number;
  advanced?: boolean;
  sensitive?: boolean;
  placeholder?: string;
  itemTemplate?: unknown;
};

export type ConfigUiHints = Record<string, ConfigUiHint>;

export type ConfigSchema = ReturnType<typeof OpenClawSchema.toJSONSchema>;

type JsonSchemaNode = Record<string, unknown>;

export type ConfigSchemaResponse = {
  schema: ConfigSchema;
  uiHints: ConfigUiHints;
  version: string;
  generatedAt: string;
};

export type PluginUiMetadata = {
  id: string;
  name?: string;
  description?: string;
  configUiHints?: Record<
    string,
    Pick<ConfigUiHint, "label" | "help" | "advanced" | "sensitive" | "placeholder">
  >;
  configSchema?: JsonSchemaNode;
};

export type ChannelUiMetadata = {
  id: string;
  label?: string;
  description?: string;
  configSchema?: JsonSchemaNode;
  configUiHints?: Record<string, ConfigUiHint>;
};

const GROUP_LABELS: Record<string, string> = {
  wizard: "设置向导",
  update: "更新",
  diagnostics: "诊断",
  logging: "日志",
  gateway: "网关",
  nodeHost: "节点主机",
  agents: "代理",
  tools: "工具",
  bindings: "绑定",
  audio: "音频",
  models: "模型",
  messages: "消息",
  commands: "命令",
  session: "会话",
  cron: "定时任务",
  hooks: "钩子",
  ui: "界面",
  browser: "浏览器",
  talk: "语音",
  channels: "消息渠道",
  skills: "技能",
  plugins: "插件",
  discovery: "发现",
  presence: "存在状态",
  voicewake: "语音唤醒",
};

const GROUP_ORDER: Record<string, number> = {
  wizard: 20,
  update: 25,
  diagnostics: 27,
  gateway: 30,
  nodeHost: 35,
  agents: 40,
  tools: 50,
  bindings: 55,
  audio: 60,
  models: 70,
  messages: 80,
  commands: 85,
  session: 90,
  cron: 100,
  hooks: 110,
  ui: 120,
  browser: 130,
  talk: 140,
  channels: 150,
  skills: 200,
  plugins: 205,
  discovery: 210,
  presence: 220,
  voicewake: 230,
  logging: 900,
};

const FIELD_LABELS: Record<string, string> = {
  "meta.lastTouchedVersion": "配置最后修改版本",
  "meta.lastTouchedAt": "配置最后修改时间",
  "update.channel": "更新渠道",
  "update.checkOnStart": "启动时检查更新",
  "diagnostics.enabled": "启用诊断",
  "diagnostics.flags": "诊断标志",
  "diagnostics.otel.enabled": "启用 OpenTelemetry",
  "diagnostics.otel.endpoint": "OpenTelemetry 端点",
  "diagnostics.otel.protocol": "OpenTelemetry 协议",
  "diagnostics.otel.headers": "OpenTelemetry 请求头",
  "diagnostics.otel.serviceName": "OpenTelemetry 服务名",
  "diagnostics.otel.traces": "启用 OpenTelemetry 追踪",
  "diagnostics.otel.metrics": "启用 OpenTelemetry 指标",
  "diagnostics.otel.logs": "启用 OpenTelemetry 日志",
  "diagnostics.otel.sampleRate": "OpenTelemetry 追踪采样率",
  "diagnostics.otel.flushIntervalMs": "OpenTelemetry 刷新间隔 (毫秒)",
  "diagnostics.cacheTrace.enabled": "启用缓存追踪",
  "diagnostics.cacheTrace.filePath": "缓存追踪文件路径",
  "diagnostics.cacheTrace.includeMessages": "缓存追踪包含消息",
  "diagnostics.cacheTrace.includePrompt": "缓存追踪包含提示词",
  "diagnostics.cacheTrace.includeSystem": "缓存追踪包含系统提示",
  "agents.list.*.identity.avatar": "身份头像",
  "agents.list.*.skills": "Agent Skill Filter",
  "gateway.remote.url": "远程网关 URL",
  "gateway.remote.sshTarget": "远程网关 SSH 目标",
  "gateway.remote.sshIdentity": "远程网关 SSH 身份",
  "gateway.remote.token": "远程网关令牌",
  "gateway.remote.password": "远程网关密码",
  "gateway.remote.tlsFingerprint": "远程网关 TLS 指纹",
  "gateway.auth.token": "网关令牌",
  "gateway.auth.password": "网关密码",
  "tools.media.image.enabled": "启用图像理解",
  "tools.media.image.maxBytes": "图像理解最大字节数",
  "tools.media.image.maxChars": "图像理解最大字符数",
  "tools.media.image.prompt": "图像理解提示词",
  "tools.media.image.timeoutSeconds": "图像理解超时 (秒)",
  "tools.media.image.attachments": "图像理解附件策略",
  "tools.media.image.models": "图像理解模型",
  "tools.media.image.scope": "图像理解范围",
  "tools.media.models": "媒体理解共享模型",
  "tools.media.concurrency": "媒体理解并发数",
  "tools.media.audio.enabled": "启用音频理解",
  "tools.media.audio.maxBytes": "音频理解最大字节数",
  "tools.media.audio.maxChars": "音频理解最大字符数",
  "tools.media.audio.prompt": "音频理解提示词",
  "tools.media.audio.timeoutSeconds": "音频理解超时 (秒)",
  "tools.media.audio.language": "音频理解语言",
  "tools.media.audio.attachments": "音频理解附件策略",
  "tools.media.audio.models": "音频理解模型",
  "tools.media.audio.scope": "音频理解范围",
  "tools.media.video.enabled": "启用视频理解",
  "tools.media.video.maxBytes": "视频理解最大字节数",
  "tools.media.video.maxChars": "视频理解最大字符数",
  "tools.media.video.prompt": "视频理解提示词",
  "tools.media.video.timeoutSeconds": "视频理解超时 (秒)",
  "tools.media.video.attachments": "视频理解附件策略",
  "tools.media.video.models": "视频理解模型",
  "tools.media.video.scope": "视频理解范围",
  "tools.links.enabled": "启用链接理解",
  "tools.links.maxLinks": "链接理解最大链接数",
  "tools.links.timeoutSeconds": "链接理解超时 (秒)",
  "tools.links.models": "链接理解模型",
  "tools.links.scope": "链接理解范围",
  "tools.profile": "工具配置",
  "tools.alsoAllow": "工具白名单附加项",
  "agents.list[].tools.profile": "代理工具配置",
  "agents.list[].tools.alsoAllow": "代理工具白名单附加项",
  "tools.byProvider": "按提供商的工具策略",
  "agents.list[].tools.byProvider": "代理按提供商的工具策略",
  "tools.exec.applyPatch.enabled": "启用 apply_patch",
  "tools.exec.applyPatch.allowModels": "apply_patch 模型白名单",
  "tools.exec.notifyOnExit": "执行退出时通知",
  "tools.exec.approvalRunningNoticeMs": "执行审批运行通知 (毫秒)",
  "tools.exec.host": "执行主机",
  "tools.exec.security": "执行安全",
  "tools.exec.ask": "执行询问",
  "tools.exec.node": "执行节点绑定",
  "tools.exec.pathPrepend": "执行 PATH 前置",
  "tools.exec.safeBins": "执行安全二进制",
  "tools.message.allowCrossContextSend": "允许跨上下文消息",
  "tools.message.crossContext.allowWithinProvider": "允许跨上下文 (同提供商)",
  "tools.message.crossContext.allowAcrossProviders": "允许跨上下文 (跨提供商)",
  "tools.message.crossContext.marker.enabled": "跨上下文标记",
  "tools.message.crossContext.marker.prefix": "跨上下文标记前缀",
  "tools.message.crossContext.marker.suffix": "跨上下文标记后缀",
  "tools.message.broadcast.enabled": "启用消息广播",
  "tools.web.search.enabled": "启用网页搜索工具",
  "tools.web.search.provider": "网页搜索提供商",
  "tools.web.search.apiKey": "Brave 搜索 API 密钥",
  "tools.web.search.maxResults": "网页搜索最大结果数",
  "tools.web.search.timeoutSeconds": "网页搜索超时 (秒)",
  "tools.web.search.cacheTtlMinutes": "网页搜索缓存 TTL (分钟)",
  "tools.web.fetch.enabled": "启用网页获取工具",
  "tools.web.fetch.maxChars": "网页获取最大字符数",
  "tools.web.fetch.timeoutSeconds": "网页获取超时 (秒)",
  "tools.web.fetch.cacheTtlMinutes": "网页获取缓存 TTL (分钟)",
  "tools.web.fetch.maxRedirects": "网页获取最大重定向次数",
  "tools.web.fetch.userAgent": "网页获取 User-Agent",
  "gateway.controlUi.basePath": "控制台 UI 基础路径",
  "gateway.controlUi.root": "Control UI Assets Root",
  "gateway.controlUi.allowedOrigins": "Control UI Allowed Origins",
  "gateway.controlUi.allowInsecureAuth": "允许不安全的控制台认证",
  "gateway.controlUi.dangerouslyDisableDeviceAuth": "危险: 禁用控制台设备认证",
  "gateway.http.endpoints.chatCompletions.enabled": "OpenAI 聊天补全端点",
  "gateway.reload.mode": "配置重载模式",
  "gateway.reload.debounceMs": "配置重载防抖 (毫秒)",
  "gateway.nodes.browser.mode": "网关节点浏览器模式",
  "gateway.nodes.browser.node": "网关节点浏览器绑定",
  "gateway.nodes.allowCommands": "网关节点白名单 (额外命令)",
  "gateway.nodes.denyCommands": "网关节点黑名单",
  "nodeHost.browserProxy.enabled": "启用节点浏览器代理",
  "nodeHost.browserProxy.allowProfiles": "节点浏览器代理允许的配置",
  "skills.load.watch": "监视技能",
  "skills.load.watchDebounceMs": "技能监视防抖 (毫秒)",
  "agents.defaults.workspace": "工作空间",
  "agents.defaults.repoRoot": "仓库根目录",
  "agents.defaults.bootstrapMaxChars": "引导最大字符数",
  "agents.defaults.envelopeTimezone": "信封时区",
  "agents.defaults.envelopeTimestamp": "信封时间戳",
  "agents.defaults.envelopeElapsed": "信封已过时间",
  "agents.defaults.memorySearch": "记忆搜索",
  "agents.defaults.memorySearch.enabled": "启用记忆搜索",
  "agents.defaults.memorySearch.sources": "记忆搜索来源",
  "agents.defaults.memorySearch.extraPaths": "额外记忆路径",
  "agents.defaults.memorySearch.experimental.sessionMemory":
    "记忆搜索会话索引 (实验性)",
  "agents.defaults.memorySearch.provider": "记忆搜索提供商",
  "agents.defaults.memorySearch.remote.baseUrl": "远程嵌入基础 URL",
  "agents.defaults.memorySearch.remote.apiKey": "远程嵌入 API 密钥",
  "agents.defaults.memorySearch.remote.headers": "远程嵌入请求头",
  "agents.defaults.memorySearch.remote.batch.concurrency": "远程批处理并发数",
  "agents.defaults.memorySearch.model": "记忆搜索模型",
  "agents.defaults.memorySearch.fallback": "记忆搜索备选",
  "agents.defaults.memorySearch.local.modelPath": "本地嵌入模型路径",
  "agents.defaults.memorySearch.store.path": "记忆搜索索引路径",
  "agents.defaults.memorySearch.store.vector.enabled": "记忆搜索向量索引",
  "agents.defaults.memorySearch.store.vector.extensionPath": "记忆搜索向量扩展路径",
  "agents.defaults.memorySearch.chunking.tokens": "记忆块令牌数",
  "agents.defaults.memorySearch.chunking.overlap": "记忆块重叠令牌数",
  "agents.defaults.memorySearch.sync.onSessionStart": "会话开始时索引",
  "agents.defaults.memorySearch.sync.onSearch": "搜索时索引 (懒加载)",
  "agents.defaults.memorySearch.sync.watch": "监视记忆文件",
  "agents.defaults.memorySearch.sync.watchDebounceMs": "记忆监视防抖 (毫秒)",
  "agents.defaults.memorySearch.sync.sessions.deltaBytes": "会话增量字节",
  "agents.defaults.memorySearch.sync.sessions.deltaMessages": "会话增量消息",
  "agents.defaults.memorySearch.query.maxResults": "记忆搜索最大结果数",
  "agents.defaults.memorySearch.query.minScore": "记忆搜索最小分数",
  "agents.defaults.memorySearch.query.hybrid.enabled": "记忆搜索混合模式",
  "agents.defaults.memorySearch.query.hybrid.vectorWeight": "记忆搜索向量权重",
  "agents.defaults.memorySearch.query.hybrid.textWeight": "记忆搜索文本权重",
  "agents.defaults.memorySearch.query.hybrid.candidateMultiplier":
    "记忆搜索混合候选乘数",
  "agents.defaults.memorySearch.cache.enabled": "记忆搜索嵌入缓存",
  "agents.defaults.memorySearch.cache.maxEntries": "记忆搜索嵌入缓存最大条目",
  memory: "Memory",
  "memory.backend": "Memory Backend",
  "memory.citations": "Memory Citations Mode",
  "memory.qmd.command": "QMD Binary",
  "memory.qmd.includeDefaultMemory": "QMD Include Default Memory",
  "memory.qmd.paths": "QMD Extra Paths",
  "memory.qmd.paths.path": "QMD Path",
  "memory.qmd.paths.pattern": "QMD Path Pattern",
  "memory.qmd.paths.name": "QMD Path Name",
  "memory.qmd.sessions.enabled": "QMD Session Indexing",
  "memory.qmd.sessions.exportDir": "QMD Session Export Directory",
  "memory.qmd.sessions.retentionDays": "QMD Session Retention (days)",
  "memory.qmd.update.interval": "QMD Update Interval",
  "memory.qmd.update.debounceMs": "QMD Update Debounce (ms)",
  "memory.qmd.update.onBoot": "QMD Update on Startup",
  "memory.qmd.update.waitForBootSync": "QMD Wait for Boot Sync",
  "memory.qmd.update.embedInterval": "QMD Embed Interval",
  "memory.qmd.update.commandTimeoutMs": "QMD Command Timeout (ms)",
  "memory.qmd.update.updateTimeoutMs": "QMD Update Timeout (ms)",
  "memory.qmd.update.embedTimeoutMs": "QMD Embed Timeout (ms)",
  "memory.qmd.limits.maxResults": "QMD Max Results",
  "memory.qmd.limits.maxSnippetChars": "QMD Max Snippet Chars",
  "memory.qmd.limits.maxInjectedChars": "QMD Max Injected Chars",
  "memory.qmd.limits.timeoutMs": "QMD Search Timeout (ms)",
  "memory.qmd.scope": "QMD Surface Scope",
  "auth.profiles": "认证配置",
  "auth.order": "认证配置顺序",
  "auth.cooldowns.billingBackoffHours": "计费退避 (小时)",
  "auth.cooldowns.billingBackoffHoursByProvider": "计费退避覆盖",
  "auth.cooldowns.billingMaxHours": "计费退避上限 (小时)",
  "auth.cooldowns.failureWindowHours": "故障转移窗口 (小时)",
  "agents.defaults.models": "模型",
  "agents.defaults.model.primary": "主模型",
  "agents.defaults.model.fallbacks": "备选模型",
  "agents.defaults.imageModel.primary": "图像模型",
  "agents.defaults.imageModel.fallbacks": "备选图像模型",
  "agents.defaults.humanDelay.mode": "人性化延迟模式",
  "agents.defaults.humanDelay.minMs": "人性化延迟最小值 (毫秒)",
  "agents.defaults.humanDelay.maxMs": "人性化延迟最大值 (毫秒)",
  "agents.defaults.cliBackends": "CLI 后端",
  "commands.native": "原生命令",
  "commands.nativeSkills": "原生技能命令",
  "commands.text": "文本命令",
  "commands.bash": "允许 Bash 聊天命令",
  "commands.bashForegroundMs": "Bash 前台窗口 (毫秒)",
  "commands.config": "允许 /config",
  "commands.debug": "允许 /debug",
  "commands.restart": "允许重启",
  "commands.useAccessGroups": "使用访问组",
  "commands.ownerAllowFrom": "Command Owners",
  "commands.allowFrom": "Command Access Allowlist",
  "ui.seamColor": "强调色",
  "ui.assistant.name": "助手名称",
  "ui.assistant.avatar": "助手头像",
  "browser.evaluateEnabled": "启用浏览器执行",
  "browser.snapshotDefaults": "浏览器快照默认值",
  "browser.snapshotDefaults.mode": "浏览器快照模式",
  "browser.remoteCdpTimeoutMs": "远程 CDP 超时 (毫秒)",
  "browser.remoteCdpHandshakeTimeoutMs": "远程 CDP 握手超时 (毫秒)",
  "session.dmScope": "私信会话范围",
  "session.agentToAgent.maxPingPongTurns": "代理间乒乓轮次",
  "messages.ackReaction": "确认反应表情",
  "messages.ackReactionScope": "确认反应范围",
  "messages.inbound.debounceMs": "入站消息防抖 (毫秒)",
  "talk.apiKey": "语音 API 密钥",
  "channels.whatsapp": "WhatsApp",
  "channels.telegram": "Telegram",
  "channels.telegram.customCommands": "Telegram 自定义命令",
  "channels.discord": "Discord",
  "channels.slack": "Slack",
  "channels.mattermost": "Mattermost",
  "channels.signal": "Signal",
  "channels.imessage": "iMessage",
  "channels.bluebubbles": "BlueBubbles",
  "channels.msteams": "MS Teams",
  "channels.telegram.botToken": "Telegram 机器人令牌",
  "channels.telegram.dmPolicy": "Telegram 私信策略",
  "channels.telegram.streamMode": "Telegram 草稿流模式",
  "channels.telegram.draftChunk.minChars": "Telegram 草稿块最小字符",
  "channels.telegram.draftChunk.maxChars": "Telegram 草稿块最大字符",
  "channels.telegram.draftChunk.breakPreference": "Telegram 草稿块断行偏好",
  "channels.telegram.retry.attempts": "Telegram 重试次数",
  "channels.telegram.retry.minDelayMs": "Telegram 重试最小延迟 (毫秒)",
  "channels.telegram.retry.maxDelayMs": "Telegram 重试最大延迟 (毫秒)",
  "channels.telegram.retry.jitter": "Telegram 重试抖动",
  "channels.telegram.network.autoSelectFamily": "Telegram 自动选择协议族",
  "channels.telegram.timeoutSeconds": "Telegram API 超时 (秒)",
  "channels.telegram.capabilities.inlineButtons": "Telegram 内联按钮",
  "channels.whatsapp.dmPolicy": "WhatsApp 私信策略",
  "channels.whatsapp.selfChatMode": "WhatsApp 自聊模式",
  "channels.whatsapp.debounceMs": "WhatsApp 消息防抖 (毫秒)",
  "channels.signal.dmPolicy": "Signal 私信策略",
  "channels.imessage.dmPolicy": "iMessage 私信策略",
  "channels.bluebubbles.dmPolicy": "BlueBubbles 私信策略",
  "channels.discord.dm.policy": "Discord 私信策略",
  "channels.discord.retry.attempts": "Discord 重试次数",
  "channels.discord.retry.minDelayMs": "Discord 重试最小延迟 (毫秒)",
  "channels.discord.retry.maxDelayMs": "Discord 重试最大延迟 (毫秒)",
  "channels.discord.retry.jitter": "Discord 重试抖动",
  "channels.discord.maxLinesPerMessage": "Discord 每条消息最大行数",
  "channels.discord.intents.presence": "Discord 状态意图",
  "channels.discord.intents.guildMembers": "Discord 成员意图",
  "channels.discord.pluralkit.enabled": "Discord PluralKit Enabled",
  "channels.discord.pluralkit.token": "Discord PluralKit Token",
  "channels.slack.dm.policy": "Slack 私信策略",
  "channels.slack.allowBots": "Slack 允许机器人消息",
  "channels.discord.token": "Discord 机器人令牌",
  "channels.slack.botToken": "Slack 机器人令牌",
  "channels.slack.appToken": "Slack 应用令牌",
  "channels.slack.userToken": "Slack 用户令牌",
  "channels.slack.userTokenReadOnly": "Slack 用户令牌只读",
  "channels.slack.thread.historyScope": "Slack 线程历史范围",
  "channels.slack.thread.inheritParent": "Slack 线程继承父级",
  "channels.mattermost.botToken": "Mattermost 机器人令牌",
  "channels.mattermost.baseUrl": "Mattermost 基础 URL",
  "channels.mattermost.chatmode": "Mattermost 聊天模式",
  "channels.mattermost.oncharPrefixes": "Mattermost 触发字符前缀",
  "channels.mattermost.requireMention": "Mattermost 需要提及",
  "channels.signal.account": "Signal 账户",
  "channels.imessage.cliPath": "iMessage CLI 路径",
  "agents.list[].skills": "Agent Skill Filter",
  "agents.list[].identity.avatar": "代理头像",
  "discovery.mdns.mode": "mDNS 发现模式",
  "plugins.enabled": "启用插件",
  "plugins.allow": "插件白名单",
  "plugins.deny": "插件黑名单",
  "plugins.load.paths": "插件加载路径",
  "plugins.slots": "插件槽位",
  "plugins.slots.memory": "记忆插件",
  "plugins.entries": "插件条目",
  "plugins.entries.*.enabled": "插件已启用",
  "plugins.entries.*.config": "插件配置",
  "plugins.installs": "插件安装记录",
  "plugins.installs.*.source": "插件安装来源",
  "plugins.installs.*.spec": "插件安装规格",
  "plugins.installs.*.sourcePath": "插件安装源路径",
  "plugins.installs.*.installPath": "插件安装路径",
  "plugins.installs.*.version": "插件安装版本",
  "plugins.installs.*.installedAt": "插件安装时间",
};

const FIELD_HELP: Record<string, string> = {
  "meta.lastTouchedVersion": "OpenClaw 写入配置时自动设置。",
  "meta.lastTouchedAt": "上次配置写入的 ISO 时间戳 (自动设置)。",
  "update.channel": 'git + npm 安装的更新渠道 ("stable"、"beta" 或 "dev")。',
  "update.checkOnStart": "网关启动时检查 npm 更新 (默认: true)。",
  "gateway.remote.url": "远程网关 WebSocket URL (ws:// 或 wss://)。",
  "gateway.remote.tlsFingerprint":
    "远程网关的预期 sha256 TLS 指纹 (固定以避免中间人攻击)。",
  "gateway.remote.sshTarget":
    "通过 SSH 的远程网关 (将网关端口隧道到本地)。格式: user@host 或 user@host:port。",
  "gateway.remote.sshIdentity": "可选的 SSH 身份文件路径 (传递给 ssh -i)。",
  "agents.list.*.skills":
    "Optional allowlist of skills for this agent (omit = all skills; empty = no skills).",
  "agents.list[].skills":
    "Optional allowlist of skills for this agent (omit = all skills; empty = no skills).",
  "agents.list[].identity.avatar":
    "Avatar image path (relative to the agent workspace only) or a remote URL/data URL.",
  "discovery.mdns.mode":
    'mDNS 广播模式 ("minimal" 默认, "full" 包含 cliPath/sshPort, "off" 禁用 mDNS)。',
  "gateway.auth.token":
    "网关访问默认需要 (除非使用 Tailscale Serve 身份); 非本地回环绑定必需。",
  "gateway.auth.password": "Tailscale funnel 必需。",
  "gateway.controlUi.basePath":
    "控制台 UI 服务的可选 URL 前缀 (例如 /openclaw)。",
  "gateway.controlUi.root":
    "Optional filesystem root for Control UI assets (defaults to dist/control-ui).",
  "gateway.controlUi.allowedOrigins":
    "Allowed browser origins for Control UI/WebChat websocket connections (full origins only, e.g. https://control.example.com).",
  "gateway.controlUi.allowInsecureAuth":
    "允许通过不安全的 HTTP 进行控制台认证 (仅令牌; 不推荐)。",
  "gateway.controlUi.dangerouslyDisableDeviceAuth":
    "危险。禁用控制台设备身份检查 (仅令牌/密码)。",
  "gateway.http.endpoints.chatCompletions.enabled":
    "启用兼容 OpenAI 的 `POST /v1/chat/completions` 端点 (默认: false)。",
  "gateway.reload.mode": '配置更改的热重载策略 (推荐 "hybrid")。',
  "gateway.reload.debounceMs": "应用配置更改前的防抖窗口 (毫秒)。",
  "gateway.nodes.browser.mode":
    '节点浏览器路由 ("auto" = 选择单个连接的浏览器节点, "manual" = 需要节点参数, "off" = 禁用)。',
  "gateway.nodes.browser.node": "将浏览器路由固定到特定节点 ID 或名称 (可选)。",
  "gateway.nodes.allowCommands":
    "Extra node.invoke commands to allow beyond the gateway defaults (array of command strings).",
  "gateway.nodes.denyCommands":
    "Commands to block even if present in node claims or default allowlist.",
  "nodeHost.browserProxy.enabled": "通过节点代理公开本地浏览器控制服务器。",
  "nodeHost.browserProxy.allowProfiles":
    "通过节点代理公开的可选浏览器配置名白名单。",
  "diagnostics.flags":
    'Enable targeted diagnostics logs by flag (e.g. ["telegram.http"]). Supports wildcards like "telegram.*" or "*".',
  "diagnostics.cacheTrace.enabled":
    "记录嵌入式代理运行的缓存追踪快照 (默认: false)。",
  "diagnostics.cacheTrace.filePath":
    "缓存追踪日志的 JSONL 输出路径 (默认: $OPENCLAW_STATE_DIR/logs/cache-trace.jsonl)。",
  "diagnostics.cacheTrace.includeMessages":
    "在追踪输出中包含完整消息负载 (默认: true)。",
  "diagnostics.cacheTrace.includePrompt": "在追踪输出中包含提示词文本 (默认: true)。",
  "diagnostics.cacheTrace.includeSystem": "在追踪输出中包含系统提示词 (默认: true)。",
  "tools.exec.applyPatch.enabled":
    "实验性。在工具策略允许时为 OpenAI 模型启用 apply_patch。",
  "tools.exec.applyPatch.allowModels":
    'Optional allowlist of model ids (e.g. "gpt-5.2" or "openai/gpt-5.2").',
  "tools.exec.notifyOnExit":
    "为 true 时 (默认)，后台执行会话在退出时排队系统事件并请求心跳。",
  "tools.exec.pathPrepend": "执行运行时预置到 PATH 的目录 (网关/沙箱)。",
  "tools.exec.safeBins":
    "允许仅标准输入的安全二进制在没有显式白名单条目的情况下运行。",
  "tools.message.allowCrossContextSend":
    "旧版覆盖: 允许跨所有提供商的跨上下文发送。",
  "tools.message.crossContext.allowWithinProvider":
    "允许在同一提供商内向其他渠道发送 (默认: true)。",
  "tools.message.crossContext.allowAcrossProviders":
    "允许跨不同提供商发送 (默认: false)。",
  "tools.message.crossContext.marker.enabled":
    "跨上下文发送时添加可见的来源标记 (默认: true)。",
  "tools.message.crossContext.marker.prefix":
    '跨上下文标记的文本前缀 (支持 "{channel}")。',
  "tools.message.crossContext.marker.suffix":
    '跨上下文标记的文本后缀 (支持 "{channel}")。',
  "tools.message.broadcast.enabled": "启用广播操作 (默认: true)。",
  "tools.web.search.enabled": "启用 web_search 工具 (需要提供商 API 密钥)。",
  "tools.web.search.provider": '搜索提供商 ("brave" 或 "perplexity")。',
  "tools.web.search.apiKey": "Brave 搜索 API 密钥 (备选: BRAVE_API_KEY 环境变量)。",
  "tools.web.search.maxResults": "返回的默认结果数 (1-10)。",
  "tools.web.search.timeoutSeconds": "web_search 请求的超时秒数。",
  "tools.web.search.cacheTtlMinutes": "web_search 结果的缓存 TTL (分钟)。",
  "tools.web.search.perplexity.apiKey":
    "Perplexity 或 OpenRouter API 密钥 (备选: PERPLEXITY_API_KEY 或 OPENROUTER_API_KEY 环境变量)。",
  "tools.web.search.perplexity.baseUrl":
    "Perplexity 基础 URL 覆盖 (默认: https://openrouter.ai/api/v1 或 https://api.perplexity.ai)。",
  "tools.web.search.perplexity.model":
    'Perplexity 模型覆盖 (默认: "perplexity/sonar-pro")。',
  "tools.web.fetch.enabled": "启用 web_fetch 工具 (轻量级 HTTP 获取)。",
  "tools.web.fetch.maxChars": "web_fetch 返回的最大字符数 (截断)。",
  "tools.web.fetch.maxCharsCap":
    "Hard cap for web_fetch maxChars (applies to config and tool calls).",
  "tools.web.fetch.timeoutSeconds": "web_fetch 请求的超时秒数。",
  "tools.web.fetch.cacheTtlMinutes": "web_fetch 结果的缓存 TTL (分钟)。",
  "tools.web.fetch.maxRedirects": "web_fetch 允许的最大重定向次数 (默认: 3)。",
  "tools.web.fetch.userAgent": "覆盖 web_fetch 请求的 User-Agent 请求头。",
  "tools.web.fetch.readability":
    "Use Readability to extract main content from HTML (fallbacks to basic HTML cleanup).",
  "tools.web.fetch.firecrawl.enabled": "Enable Firecrawl fallback for web_fetch (if configured).",
  "tools.web.fetch.firecrawl.apiKey": "Firecrawl API key (fallback: FIRECRAWL_API_KEY env var).",
  "tools.web.fetch.firecrawl.baseUrl":
    "Firecrawl base URL (e.g. https://api.firecrawl.dev or custom endpoint).",
  "tools.web.fetch.firecrawl.onlyMainContent":
    "When true, Firecrawl returns only the main content (default: true).",
  "tools.web.fetch.firecrawl.maxAgeMs":
    "Firecrawl maxAge (ms) for cached results when supported by the API.",
  "tools.web.fetch.firecrawl.timeoutSeconds": "Timeout in seconds for Firecrawl requests.",
  "channels.slack.allowBots":
    "允许机器人消息触发 Slack 回复 (默认: false)。",
  "channels.slack.thread.historyScope":
    'Scope for Slack thread history context ("thread" isolates per thread; "channel" reuses channel history).',
  "channels.slack.thread.inheritParent":
    "如果为 true，Slack 线程会话继承父频道记录 (默认: false)。",
  "channels.mattermost.botToken":
    "Bot token from Mattermost System Console -> Integrations -> Bot Accounts.",
  "channels.mattermost.baseUrl":
    "Base URL for your Mattermost server (e.g., https://chat.example.com).",
  "channels.mattermost.chatmode":
    'Reply to channel messages on mention ("oncall"), on trigger chars (">" or "!") ("onchar"), or on every message ("onmessage").',
  "channels.mattermost.oncharPrefixes": 'Trigger prefixes for onchar mode (default: [">", "!"]).',
  "channels.mattermost.requireMention":
    "Require @mention in channels before responding (default: true).",
  "auth.profiles": "命名认证配置 (提供商 + 模式 + 可选邮箱)。",
  "auth.order": "每个提供商的有序认证配置 ID (用于自动故障转移)。",
  "auth.cooldowns.billingBackoffHours":
    "配置因计费/余额不足失败时的基础退避 (小时) (默认: 5)。",
  "auth.cooldowns.billingBackoffHoursByProvider":
    "Optional per-provider overrides for billing backoff (hours).",
  "auth.cooldowns.billingMaxHours": "计费退避上限 (小时) (默认: 24)。",
  "auth.cooldowns.failureWindowHours": "退避计数器的故障窗口 (小时) (默认: 24)。",
  "agents.defaults.bootstrapMaxChars":
    "注入系统提示词的每个工作空间引导文件的最大字符数，超出则截断 (默认: 20000)。",
  "agents.defaults.repoRoot":
    "系统提示词运行时行中显示的可选仓库根目录 (覆盖自动检测)。",
  "agents.defaults.envelopeTimezone":
    '消息信封的时区 ("utc"、"local"、"user" 或 IANA 时区字符串)。',
  "agents.defaults.envelopeTimestamp":
    '在消息信封中包含绝对时间戳 ("on" 或 "off")。',
  "agents.defaults.envelopeElapsed": '在消息信封中包含已过时间 ("on" 或 "off")。',
  "agents.defaults.models": "配置的模型目录 (键是完整的提供商/模型 ID)。",
  "agents.defaults.memorySearch":
    "Vector search over MEMORY.md and memory/*.md (per-agent overrides supported).",
  "agents.defaults.memorySearch.sources":
    'Sources to index for memory search (default: ["memory"]; add "sessions" to include session transcripts).',
  "agents.defaults.memorySearch.extraPaths":
    "Extra paths to include in memory search (directories or .md files; relative paths resolved from workspace).",
  "agents.defaults.memorySearch.experimental.sessionMemory":
    "启用记忆搜索的实验性会话记录索引 (默认: false)。",
  "agents.defaults.memorySearch.provider":
    '嵌入提供商 ("openai"、"gemini"、"voyage" 或 "local")。',
  "agents.defaults.memorySearch.remote.baseUrl":
    "远程嵌入的自定义基础 URL (OpenAI 兼容代理或 Gemini 覆盖)。",
  "agents.defaults.memorySearch.remote.apiKey": "远程嵌入提供商的自定义 API 密钥。",
  "agents.defaults.memorySearch.remote.headers":
    "Extra headers for remote embeddings (merged; remote overrides OpenAI headers).",
  "agents.defaults.memorySearch.remote.batch.enabled":
    "Enable batch API for memory embeddings (OpenAI/Gemini/Voyage; default: false).",
  "agents.defaults.memorySearch.remote.batch.wait":
    "索引时等待批处理完成 (默认: true)。",
  "agents.defaults.memorySearch.remote.batch.concurrency":
    "记忆索引的最大并发嵌入批处理作业数 (默认: 2)。",
  "agents.defaults.memorySearch.remote.batch.pollIntervalMs":
    "批处理状态的轮询间隔毫秒数 (默认: 2000)。",
  "agents.defaults.memorySearch.remote.batch.timeoutMinutes":
    "批处理索引的超时分钟数 (默认: 60)。",
  "agents.defaults.memorySearch.local.modelPath":
    "本地 GGUF 模型路径或 hf: URI (node-llama-cpp)。",
  "agents.defaults.memorySearch.fallback":
    '嵌入失败时的备选提供商 ("openai"、"gemini"、"local" 或 "none")。',
  "agents.defaults.memorySearch.store.path":
    "SQLite 索引路径 (默认: ~/.openclaw/memory/{agentId}.sqlite)。",
  "agents.defaults.memorySearch.store.vector.enabled":
    "启用向量搜索的 sqlite-vec 扩展 (默认: true)。",
  "agents.defaults.memorySearch.store.vector.extensionPath":
    "sqlite-vec 扩展库的可选覆盖路径 (.dylib/.so/.dll)。",
  "agents.defaults.memorySearch.query.hybrid.enabled":
    "启用记忆的混合 BM25 + 向量搜索 (默认: true)。",
  "agents.defaults.memorySearch.query.hybrid.vectorWeight":
    "合并结果时向量相似度的权重 (0-1)。",
  "agents.defaults.memorySearch.query.hybrid.textWeight":
    "合并结果时 BM25 文本相关性的权重 (0-1)。",
  "agents.defaults.memorySearch.query.hybrid.candidateMultiplier":
    "候选池大小乘数 (默认: 4)。",
  "agents.defaults.memorySearch.cache.enabled":
    "在 SQLite 中缓存块嵌入以加速重新索引和频繁更新 (默认: true)。",
  memory: "Memory backend configuration (global).",
  "memory.backend": 'Memory backend ("builtin" for OpenClaw embeddings, "qmd" for QMD sidecar).',
  "memory.citations": 'Default citation behavior ("auto", "on", or "off").',
  "memory.qmd.command": "Path to the qmd binary (default: resolves from PATH).",
  "memory.qmd.includeDefaultMemory":
    "Whether to automatically index MEMORY.md + memory/**/*.md (default: true).",
  "memory.qmd.paths":
    "Additional directories/files to index with QMD (path + optional glob pattern).",
  "memory.qmd.paths.path": "Absolute or ~-relative path to index via QMD.",
  "memory.qmd.paths.pattern": "Glob pattern relative to the path root (default: **/*.md).",
  "memory.qmd.paths.name":
    "Optional stable name for the QMD collection (default derived from path).",
  "memory.qmd.sessions.enabled":
    "Enable QMD session transcript indexing (experimental, default: false).",
  "memory.qmd.sessions.exportDir":
    "Override directory for sanitized session exports before indexing.",
  "memory.qmd.sessions.retentionDays":
    "Retention window for exported sessions before pruning (default: unlimited).",
  "memory.qmd.update.interval":
    "How often the QMD sidecar refreshes indexes (duration string, default: 5m).",
  "memory.qmd.update.debounceMs":
    "Minimum delay between successive QMD refresh runs (default: 15000).",
  "memory.qmd.update.onBoot": "Run QMD update once on gateway startup (default: true).",
  "memory.qmd.update.waitForBootSync":
    "Block startup until the boot QMD refresh finishes (default: false).",
  "memory.qmd.update.embedInterval":
    "How often QMD embeddings are refreshed (duration string, default: 60m). Set to 0 to disable periodic embed.",
  "memory.qmd.update.commandTimeoutMs":
    "Timeout for QMD maintenance commands like collection list/add (default: 30000).",
  "memory.qmd.update.updateTimeoutMs": "Timeout for `qmd update` runs (default: 120000).",
  "memory.qmd.update.embedTimeoutMs": "Timeout for `qmd embed` runs (default: 120000).",
  "memory.qmd.limits.maxResults": "Max QMD results returned to the agent loop (default: 6).",
  "memory.qmd.limits.maxSnippetChars": "Max characters per snippet pulled from QMD (default: 700).",
  "memory.qmd.limits.maxInjectedChars": "Max total characters injected from QMD hits per turn.",
  "memory.qmd.limits.timeoutMs": "Per-query timeout for QMD searches (default: 4000).",
  "memory.qmd.scope":
    "Session/channel scope for QMD recall (same syntax as session.sendPolicy; default: direct-only).",
  "agents.defaults.memorySearch.cache.maxEntries":
    "缓存嵌入的可选上限 (尽力而为)。",
  "agents.defaults.memorySearch.sync.onSearch":
    "懒加载同步: 在更改后的搜索时计划重新索引。",
  "agents.defaults.memorySearch.sync.watch": "监视记忆文件的更改 (chokidar)。",
  "agents.defaults.memorySearch.sync.sessions.deltaBytes":
    "会话记录触发重新索引前的最小追加字节数 (默认: 100000)。",
  "agents.defaults.memorySearch.sync.sessions.deltaMessages":
    "会话记录触发重新索引前的最小追加 JSONL 行数 (默认: 50)。",
  "plugins.enabled": "启用插件/扩展加载 (默认: true)。",
  "plugins.allow": "可选的插件 ID 白名单; 设置后，仅加载列出的插件。",
  "plugins.deny": "可选的插件 ID 黑名单; 黑名单优先于白名单。",
  "plugins.load.paths": "要加载的附加插件文件或目录。",
  "plugins.slots": "选择哪些插件拥有独占槽位 (记忆等)。",
  "plugins.slots.memory":
    '按 ID 选择活动记忆插件，或 "none" 禁用记忆插件。',
  "plugins.entries": "按插件 ID 键入的每个插件设置 (启用/禁用 + 配置负载)。",
  "plugins.entries.*.enabled": "覆盖此条目的插件启用/禁用 (需要重启)。",
  "plugins.entries.*.config": "插件定义的配置负载 (schema 由插件提供)。",
  "plugins.installs":
    "CLI-managed install metadata (used by `openclaw plugins update` to locate install sources).",
  "plugins.installs.*.source": 'Install source ("npm", "archive", or "path").',
  "plugins.installs.*.spec": "Original npm spec used for install (if source is npm).",
  "plugins.installs.*.sourcePath": "Original archive/path used for install (if any).",
  "plugins.installs.*.installPath":
    "Resolved install directory (usually ~/.openclaw/extensions/<id>).",
  "plugins.installs.*.version": "安装时记录的版本 (如果可用)。",
  "plugins.installs.*.installedAt": "上次安装/更新的 ISO 时间戳。",
  "agents.list.*.identity.avatar":
    "Agent avatar (workspace-relative path, http(s) URL, or data URI).",
  "agents.defaults.model.primary": "主模型 (提供商/模型)。",
  "agents.defaults.model.fallbacks":
    "有序备选模型 (提供商/模型)。主模型失败时使用。",
  "agents.defaults.imageModel.primary":
    "可选图像模型 (提供商/模型)，当主模型缺乏图像输入时使用。",
  "agents.defaults.imageModel.fallbacks": "有序备选图像模型 (提供商/模型)。",
  "agents.defaults.cliBackends": "可选 CLI 后端用于纯文本备选 (claude-cli 等)。",
  "agents.defaults.humanDelay.mode": '块回复的延迟风格 ("off"、"natural"、"custom")。',
  "agents.defaults.humanDelay.minMs": "自定义人性化延迟的最小延迟毫秒数 (默认: 800)。",
  "agents.defaults.humanDelay.maxMs": "自定义人性化延迟的最大延迟毫秒数 (默认: 2500)。",
  "commands.native":
    "向支持的渠道注册原生命令 (Discord/Slack/Telegram)。",
  "commands.nativeSkills":
    "向支持的渠道注册原生技能命令 (用户可调用技能)。",
  "commands.text": "允许文本命令解析 (仅斜杠命令)。",
  "commands.bash":
    "允许 bash 聊天命令 (`!`; `/bash` 别名) 运行主机 shell 命令 (默认: false; 需要 tools.elevated)。",
  "commands.bashForegroundMs":
    "bash 后台执行前等待时间 (默认: 2000; 0 立即后台)。",
  "commands.config": "允许 /config 聊天命令读写磁盘配置 (默认: false)。",
  "commands.debug": "允许 /debug 聊天命令进行仅运行时覆盖 (默认: false)。",
  "commands.restart": "允许 /restart 和网关重启工具操作 (默认: false)。",
  "commands.useAccessGroups": "对命令强制执行访问组白名单/策略。",
  "commands.ownerAllowFrom":
    "Explicit owner allowlist for owner-only tools/commands. Use channel-native IDs (optionally prefixed like \"whatsapp:+15551234567\"). '*' is ignored.",
  "commands.allowFrom":
    'Per-provider allowlist restricting who can use slash commands. If set, overrides the channel\'s allowFrom for command authorization. Use \'*\' key for global default; provider-specific keys (e.g. \'discord\') override the global. Example: { "*": ["user1"], "discord": ["user:123"] }.',
  "session.dmScope":
    '私信会话范围: "main" 保持连续性; "per-peer"、"per-channel-peer" 或 "per-account-channel-peer" 隔离私信历史 (推荐用于共享收件箱/多账户)。',
  "session.identityLinks":
    "Map canonical identities to provider-prefixed peer IDs for DM session linking (example: telegram:123456).",
  "channels.telegram.configWrites":
    "Allow Telegram to write config in response to channel events/commands (default: true).",
  "channels.slack.configWrites":
    "Allow Slack to write config in response to channel events/commands (default: true).",
  "channels.mattermost.configWrites":
    "Allow Mattermost to write config in response to channel events/commands (default: true).",
  "channels.discord.configWrites":
    "Allow Discord to write config in response to channel events/commands (default: true).",
  "channels.whatsapp.configWrites":
    "Allow WhatsApp to write config in response to channel events/commands (default: true).",
  "channels.signal.configWrites":
    "Allow Signal to write config in response to channel events/commands (default: true).",
  "channels.imessage.configWrites":
    "Allow iMessage to write config in response to channel events/commands (default: true).",
  "channels.msteams.configWrites":
    "Allow Microsoft Teams to write config in response to channel events/commands (default: true).",
  "channels.discord.commands.native": 'Override native commands for Discord (bool or "auto").',
  "channels.discord.commands.nativeSkills":
    'Override native skill commands for Discord (bool or "auto").',
  "channels.telegram.commands.native": 'Override native commands for Telegram (bool or "auto").',
  "channels.telegram.commands.nativeSkills":
    'Override native skill commands for Telegram (bool or "auto").',
  "channels.slack.commands.native": 'Override native commands for Slack (bool or "auto").',
  "channels.slack.commands.nativeSkills":
    'Override native skill commands for Slack (bool or "auto").',
  "session.agentToAgent.maxPingPongTurns":
    "请求者和目标之间的最大回复轮次 (0-5)。",
  "channels.telegram.customCommands":
    "Additional Telegram bot menu commands (merged with native; conflicts ignored).",
  "messages.ackReaction": "用于确认入站消息的表情反应 (空则禁用)。",
  "messages.ackReactionScope":
    '发送确认反应的时机 ("group-mentions"、"group-all"、"direct"、"all")。',
  "messages.inbound.debounceMs":
    "批处理来自同一发送者的快速入站消息的防抖窗口 (毫秒) (0 禁用)。",
  "channels.telegram.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.telegram.allowFrom=["*"].',
  "channels.telegram.streamMode":
    "Draft streaming mode for Telegram replies (off | partial | block). Separate from block streaming; requires private topics + sendMessageDraft.",
  "channels.telegram.draftChunk.minChars":
    'Minimum chars before emitting a Telegram draft update when channels.telegram.streamMode="block" (default: 200).',
  "channels.telegram.draftChunk.maxChars":
    'Target max size for a Telegram draft update chunk when channels.telegram.streamMode="block" (default: 800; clamped to channels.telegram.textChunkLimit).',
  "channels.telegram.draftChunk.breakPreference":
    "Preferred breakpoints for Telegram draft chunks (paragraph | newline | sentence). Default: paragraph.",
  "channels.telegram.retry.attempts":
    "Max retry attempts for outbound Telegram API calls (default: 3).",
  "channels.telegram.retry.minDelayMs": "Minimum retry delay in ms for Telegram outbound calls.",
  "channels.telegram.retry.maxDelayMs":
    "Maximum retry delay cap in ms for Telegram outbound calls.",
  "channels.telegram.retry.jitter": "Jitter factor (0-1) applied to Telegram retry delays.",
  "channels.telegram.network.autoSelectFamily":
    "Override Node autoSelectFamily for Telegram (true=enable, false=disable).",
  "channels.telegram.timeoutSeconds":
    "Max seconds before Telegram API requests are aborted (default: 500 per grammY).",
  "channels.whatsapp.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.whatsapp.allowFrom=["*"].',
  "channels.whatsapp.selfChatMode": "Same-phone setup (bot uses your personal WhatsApp number).",
  "channels.whatsapp.debounceMs":
    "Debounce window (ms) for batching rapid consecutive messages from the same sender (0 to disable).",
  "channels.signal.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.signal.allowFrom=["*"].',
  "channels.imessage.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.imessage.allowFrom=["*"].',
  "channels.bluebubbles.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.bluebubbles.allowFrom=["*"].',
  "channels.discord.dm.policy":
    'Direct message access control ("pairing" recommended). "open" requires channels.discord.dm.allowFrom=["*"].',
  "channels.discord.retry.attempts":
    "Max retry attempts for outbound Discord API calls (default: 3).",
  "channels.discord.retry.minDelayMs": "Minimum retry delay in ms for Discord outbound calls.",
  "channels.discord.retry.maxDelayMs": "Maximum retry delay cap in ms for Discord outbound calls.",
  "channels.discord.retry.jitter": "Jitter factor (0-1) applied to Discord retry delays.",
  "channels.discord.maxLinesPerMessage": "Soft max line count per Discord message (default: 17).",
  "channels.discord.intents.presence":
    "Enable the Guild Presences privileged intent. Must also be enabled in the Discord Developer Portal. Allows tracking user activities (e.g. Spotify). Default: false.",
  "channels.discord.intents.guildMembers":
    "Enable the Guild Members privileged intent. Must also be enabled in the Discord Developer Portal. Default: false.",
  "channels.discord.pluralkit.enabled":
    "Resolve PluralKit proxied messages and treat system members as distinct senders.",
  "channels.discord.pluralkit.token":
    "Optional PluralKit token for resolving private systems or members.",
  "channels.slack.dm.policy":
    'Direct message access control ("pairing" recommended). "open" requires channels.slack.dm.allowFrom=["*"].',
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  "gateway.remote.url": "ws://host:18789",
  "gateway.remote.tlsFingerprint": "sha256:ab12cd34…",
  "gateway.remote.sshTarget": "user@host",
  "gateway.controlUi.basePath": "/openclaw",
  "gateway.controlUi.root": "dist/control-ui",
  "gateway.controlUi.allowedOrigins": "https://control.example.com",
  "channels.mattermost.baseUrl": "https://chat.example.com",
  "agents.list[].identity.avatar": "avatars/openclaw.png",
};

const SENSITIVE_PATTERNS = [/token/i, /password/i, /secret/i, /api.?key/i];

function isSensitivePath(path: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(path));
}

type JsonSchemaObject = JsonSchemaNode & {
  type?: string | string[];
  properties?: Record<string, JsonSchemaObject>;
  required?: string[];
  additionalProperties?: JsonSchemaObject | boolean;
};

function cloneSchema<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function asSchemaObject(value: unknown): JsonSchemaObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as JsonSchemaObject;
}

function isObjectSchema(schema: JsonSchemaObject): boolean {
  const type = schema.type;
  if (type === "object") {
    return true;
  }
  if (Array.isArray(type) && type.includes("object")) {
    return true;
  }
  return Boolean(schema.properties || schema.additionalProperties);
}

function mergeObjectSchema(base: JsonSchemaObject, extension: JsonSchemaObject): JsonSchemaObject {
  const mergedRequired = new Set<string>([...(base.required ?? []), ...(extension.required ?? [])]);
  const merged: JsonSchemaObject = {
    ...base,
    ...extension,
    properties: {
      ...base.properties,
      ...extension.properties,
    },
  };
  if (mergedRequired.size > 0) {
    merged.required = Array.from(mergedRequired);
  }
  const additional = extension.additionalProperties ?? base.additionalProperties;
  if (additional !== undefined) {
    merged.additionalProperties = additional;
  }
  return merged;
}

function buildBaseHints(): ConfigUiHints {
  const hints: ConfigUiHints = {};
  for (const [group, label] of Object.entries(GROUP_LABELS)) {
    hints[group] = {
      label,
      group: label,
      order: GROUP_ORDER[group],
    };
  }
  for (const [path, label] of Object.entries(FIELD_LABELS)) {
    const current = hints[path];
    hints[path] = current ? { ...current, label } : { label };
  }
  for (const [path, help] of Object.entries(FIELD_HELP)) {
    const current = hints[path];
    hints[path] = current ? { ...current, help } : { help };
  }
  for (const [path, placeholder] of Object.entries(FIELD_PLACEHOLDERS)) {
    const current = hints[path];
    hints[path] = current ? { ...current, placeholder } : { placeholder };
  }
  return hints;
}

function applySensitiveHints(hints: ConfigUiHints): ConfigUiHints {
  const next = { ...hints };
  for (const key of Object.keys(next)) {
    if (isSensitivePath(key)) {
      next[key] = { ...next[key], sensitive: true };
    }
  }
  return next;
}

function applyPluginHints(hints: ConfigUiHints, plugins: PluginUiMetadata[]): ConfigUiHints {
  const next: ConfigUiHints = { ...hints };
  for (const plugin of plugins) {
    const id = plugin.id.trim();
    if (!id) {
      continue;
    }
    const name = (plugin.name ?? id).trim() || id;
    const basePath = `plugins.entries.${id}`;

    next[basePath] = {
      ...next[basePath],
      label: name,
      help: plugin.description
        ? `${plugin.description} (plugin: ${id})`
        : `Plugin entry for ${id}.`,
    };
    next[`${basePath}.enabled`] = {
      ...next[`${basePath}.enabled`],
      label: `Enable ${name}`,
    };
    next[`${basePath}.config`] = {
      ...next[`${basePath}.config`],
      label: `${name} Config`,
      help: `Plugin-defined config payload for ${id}.`,
    };

    const uiHints = plugin.configUiHints ?? {};
    for (const [relPathRaw, hint] of Object.entries(uiHints)) {
      const relPath = relPathRaw.trim().replace(/^\./, "");
      if (!relPath) {
        continue;
      }
      const key = `${basePath}.config.${relPath}`;
      next[key] = {
        ...next[key],
        ...hint,
      };
    }
  }
  return next;
}

function applyChannelHints(hints: ConfigUiHints, channels: ChannelUiMetadata[]): ConfigUiHints {
  const next: ConfigUiHints = { ...hints };
  for (const channel of channels) {
    const id = channel.id.trim();
    if (!id) {
      continue;
    }
    const basePath = `channels.${id}`;
    const current = next[basePath] ?? {};
    const label = channel.label?.trim();
    const help = channel.description?.trim();
    next[basePath] = {
      ...current,
      ...(label ? { label } : {}),
      ...(help ? { help } : {}),
    };

    const uiHints = channel.configUiHints ?? {};
    for (const [relPathRaw, hint] of Object.entries(uiHints)) {
      const relPath = relPathRaw.trim().replace(/^\./, "");
      if (!relPath) {
        continue;
      }
      const key = `${basePath}.${relPath}`;
      next[key] = {
        ...next[key],
        ...hint,
      };
    }
  }
  return next;
}

function listHeartbeatTargetChannels(channels: ChannelUiMetadata[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const id of CHANNEL_IDS) {
    const normalized = id.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    ordered.push(normalized);
  }
  for (const channel of channels) {
    const normalized = channel.id.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    ordered.push(normalized);
  }
  return ordered;
}

function applyHeartbeatTargetHints(
  hints: ConfigUiHints,
  channels: ChannelUiMetadata[],
): ConfigUiHints {
  const next: ConfigUiHints = { ...hints };
  const channelList = listHeartbeatTargetChannels(channels);
  const channelHelp = channelList.length ? ` Known channels: ${channelList.join(", ")}.` : "";
  const help = `投递目标 ("last"、"none" 或渠道 ID)。${channelHelp}`;
  const paths = ["agents.defaults.heartbeat.target", "agents.list.*.heartbeat.target"];
  for (const path of paths) {
    const current = next[path] ?? {};
    next[path] = {
      ...current,
      help: current.help ?? help,
      placeholder: current.placeholder ?? "last",
    };
  }
  return next;
}

function applyPluginSchemas(schema: ConfigSchema, plugins: PluginUiMetadata[]): ConfigSchema {
  const next = cloneSchema(schema);
  const root = asSchemaObject(next);
  const pluginsNode = asSchemaObject(root?.properties?.plugins);
  const entriesNode = asSchemaObject(pluginsNode?.properties?.entries);
  if (!entriesNode) {
    return next;
  }

  const entryBase = asSchemaObject(entriesNode.additionalProperties);
  const entryProperties = entriesNode.properties ?? {};
  entriesNode.properties = entryProperties;

  for (const plugin of plugins) {
    if (!plugin.configSchema) {
      continue;
    }
    const entrySchema = entryBase
      ? cloneSchema(entryBase)
      : ({ type: "object" } as JsonSchemaObject);
    const entryObject = asSchemaObject(entrySchema) ?? ({ type: "object" } as JsonSchemaObject);
    const baseConfigSchema = asSchemaObject(entryObject.properties?.config);
    const pluginSchema = asSchemaObject(plugin.configSchema);
    const nextConfigSchema =
      baseConfigSchema &&
      pluginSchema &&
      isObjectSchema(baseConfigSchema) &&
      isObjectSchema(pluginSchema)
        ? mergeObjectSchema(baseConfigSchema, pluginSchema)
        : cloneSchema(plugin.configSchema);

    entryObject.properties = {
      ...entryObject.properties,
      config: nextConfigSchema,
    };
    entryProperties[plugin.id] = entryObject;
  }

  return next;
}

function applyChannelSchemas(schema: ConfigSchema, channels: ChannelUiMetadata[]): ConfigSchema {
  const next = cloneSchema(schema);
  const root = asSchemaObject(next);
  const channelsNode = asSchemaObject(root?.properties?.channels);
  if (!channelsNode) {
    return next;
  }
  const channelProps = channelsNode.properties ?? {};
  channelsNode.properties = channelProps;

  for (const channel of channels) {
    if (!channel.configSchema) {
      continue;
    }
    const existing = asSchemaObject(channelProps[channel.id]);
    const incoming = asSchemaObject(channel.configSchema);
    if (existing && incoming && isObjectSchema(existing) && isObjectSchema(incoming)) {
      channelProps[channel.id] = mergeObjectSchema(existing, incoming);
    } else {
      channelProps[channel.id] = cloneSchema(channel.configSchema);
    }
  }

  return next;
}

let cachedBase: ConfigSchemaResponse | null = null;

function stripChannelSchema(schema: ConfigSchema): ConfigSchema {
  const next = cloneSchema(schema);
  const root = asSchemaObject(next);
  if (!root || !root.properties) {
    return next;
  }
  const channelsNode = asSchemaObject(root.properties.channels);
  if (channelsNode) {
    channelsNode.properties = {};
    channelsNode.required = [];
    channelsNode.additionalProperties = true;
  }
  return next;
}

function buildBaseConfigSchema(): ConfigSchemaResponse {
  if (cachedBase) {
    return cachedBase;
  }
  const schema = OpenClawSchema.toJSONSchema({
    target: "draft-07",
    unrepresentable: "any",
  });
  schema.title = "OpenClawConfig";
  const hints = applySensitiveHints(buildBaseHints());
  const next = {
    schema: stripChannelSchema(schema),
    uiHints: hints,
    version: VERSION,
    generatedAt: new Date().toISOString(),
  };
  cachedBase = next;
  return next;
}

export function buildConfigSchema(params?: {
  plugins?: PluginUiMetadata[];
  channels?: ChannelUiMetadata[];
}): ConfigSchemaResponse {
  const base = buildBaseConfigSchema();
  const plugins = params?.plugins ?? [];
  const channels = params?.channels ?? [];
  if (plugins.length === 0 && channels.length === 0) {
    return base;
  }
  const mergedHints = applySensitiveHints(
    applyHeartbeatTargetHints(
      applyChannelHints(applyPluginHints(base.uiHints, plugins), channels),
      channels,
    ),
  );
  const mergedSchema = applyChannelSchemas(applyPluginSchemas(base.schema, plugins), channels);
  return {
    ...base,
    schema: mergedSchema,
    uiHints: mergedHints,
  };
}
