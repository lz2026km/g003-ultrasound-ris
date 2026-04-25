// ============================================================
// Hermes Agent 版本历史（基于 Git 提交记录）
// ============================================================
export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.11.0",
    date: "2026.04.23",
    changes: [
      "修复德州扑克/桥牌 AI 逻辑（定时器 stale closure 问题）",
      "新增游戏独立部署，游戏代码与主系统分离",
      "Skills 系统批量更新",
      "Gateway DeepSeek reasoning 模型支持",
      "API Server 不完整快照持久化修复",
      "Auth 损坏时 auth.json 保留而非静默重置",
      "Env 命令支持 ~/ 子路径引号转义",
    ],
  },
  {
    version: "0.10.0",
    date: "2026.03.15",
    changes: [
      "新增 hermes cron 定时任务管理",
      "新增 hermes doctor 自检命令",
      "新增 hermes pair 配对命令",
      "Gateway 启动失败状态改进",
      "Memory 外部 provider 同步中断处理",
      "支持 MCP (Model Context Protocol) 协议",
    ],
  },
  {
    version: "0.9.0",
    date: "2026.02.01",
    changes: [
      "新增 hermes setup 交互式配置向导",
      "新增 hermes backup 备份命令",
      "新增 hermes voice 语音交互",
      "支持 DeepSeek 模型",
      "Gateway 多平台消息路由改进",
    ],
  },
  {
    version: "0.8.0",
    date: "2025.12.10",
    changes: [
      "新增 hermes plugins 插件管理",
      "开放 Skills Hub 插件市场",
      "支持 Claude / GPT-4 / Gemini 多模型",
      "新增 hermes compress 上下文压缩",
      "iMessage 推送体验改进",
    ],
  },
  {
    version: "0.7.0",
    date: "2025.10.20",
    changes: [
      "新增 hermes chat TUI 界面",
      "新增 hermes gateway 服务管理",
      "新增 hermes status 状态查看",
      "新增 hermes env 密钥管理",
      "Session 快照持久化",
    ],
  },
  {
    version: "0.6.0",
    date: "2025.08.05",
    changes: [
      "新增 hermes models 模型切换",
      "支持 OpenAI / Anthropic / Google / Azure",
      "新增 hermes dump 会话导出",
      "新增 hermes tips 提示系统",
    ],
  },
  {
    version: "0.5.0",
    date: "2025.06.01",
    changes: [
      "首个公开版本发布",
      "基础 CLI 接口",
      "Session 会话管理",
      "Memory 持久化记忆",
      "基础 Gateway 消息路由",
    ],
  },
];
