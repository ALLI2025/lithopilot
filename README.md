# LithoPilot

真空互联全自动光刻产线智能编排与异常闭环工作台。

## 当前版本

v0.1是一个可运行的受控模拟MVP，重点展示：

- 可配置光刻工艺状态
- 多源证据聚合
- Agent工具调用时间线
- 根因假设、反证和缺失信息
- 人工审批和设备模拟器
- 前后验证与Markdown报告导出
- Agent评测看板与产品安全边界

所有参数、阈值、设备日志和评测结果均为演示数据，不代表真实产线效果。

## 技术结构

- Next.js 16 + React 19 + TypeScript
- Next.js Route Handlers作为MVP API
- 显式状态机与白名单工具
- 可选OpenAI兼容模型适配层
- 无模型配置时使用可复现的确定性演示模式

## 本地运行

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:3000`。

## 测试

```bash
pnpm test
pnpm build
```

## 可选模型配置

复制 `.env.example` 为 `.env.local`，配置：

- `LITHOPILOT_LLM_ENDPOINT`
- `LITHOPILOT_LLM_API_KEY`
- `LITHOPILOT_LLM_MODEL`

模型只用于压缩和润色基于证据的摘要。工具输出、安全门和审批判断保持确定性，不交给模型决定。

## 目录

- `app/`：工作台与API
- `lib/process-config.ts`：可替换工艺配置
- `lib/tools.ts`：只读工具与模拟写工具
- `lib/orchestrator.ts`：异常闭环状态机
- `lib/evaluation.ts`：受控基准集摘要
- `docs/PRD.md`：MVP产品需求文档
- `tests/`：安全门与可追溯性测试

## 安全原则

LithoPilot不替代PLC、设备原生控制软件和硬件互锁。MVP所有写操作只允许进入模拟器，且必须带人工审批号。
