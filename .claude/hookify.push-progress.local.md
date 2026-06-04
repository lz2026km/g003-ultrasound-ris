---
name: push-progress-required
enabled: true
event: file_change
pattern: src/(ai-stream|ai-imaging|plane-recognition)/.*\.(ts|tsx|js|jsx)$
action: warn
---

⚠️ **检测到核心模块代码变更！**

按主公指示"每完成一步，严格按照推送"，
请立即生成进展报告并通过QQ推送给主公审阅。

**报告内容要求**：
1. 本次完成的功能点
2. 关键代码文件
3. 测试结果
4. 下一步计划

**推送命令**：
```bash
/push-progress v0.8.0 <module-name>
```
