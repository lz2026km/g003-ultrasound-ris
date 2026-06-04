---
name: push-progress
description: 把当前进展打包推送给主公审阅
allowed-tools: Bash(ls:*), Bash(cat:*), Bash(cd:*), Bash(cp:*), Bash(rm:*), Bash(mkdir:*)
---

# 进展推送命令

执行此命令时，把当前的开发进展打包为：
1. `progress-{version}-{module}-{date}.md` - 进展报告
2. 相关代码文件
3. 测试结果

然后通过 QQ 发送文件给主公。

**严格遵循 MEMORY.md 中的"报告发送方式"规则**。

## 使用方法

```bash
/push-progress
/push-progress v0.8.0 ai-stream
/push-progress v0.8.0 ai-stream 2026-06-04
```

## 参数说明

- `$1` = 版本号 (v0.8.0)
- `$2` = 模块名 (ai-stream, ai-imaging, plane-recognition)
- `$3` = 日期 (YYYY-MM-DD)

## 推送文件位置

`~/.openclaw/media/qqbot/`
