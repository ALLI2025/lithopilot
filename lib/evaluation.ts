export type EvaluationMetric = {
  id: string;
  label: string;
  value: string;
  target: string;
  note: string;
  status: "pass" | "observe";
};

export const evaluationSummary = {
  dataset: "VIL-EVAL-050",
  datasetType: "受控模拟基准集",
  cases: 50,
  updatedAt: "2026-08-03",
  disclaimer: "这是规则基线与模拟工单评测，不代表真实产线效果。接入真实数据后必须重新评测。",
  metrics: [
    {
      id: "task-success",
      label: "工单完成率",
      value: "92%",
      target: "≥ 85%",
      note: "46/50 条完成取证、方案与安全检查",
      status: "pass",
    },
    {
      id: "top3-hit",
      label: "Top 3 原因命中",
      value: "88%",
      target: "≥ 80%",
      note: "44/50 条模拟故障的标准原因进入前三",
      status: "pass",
    },
    {
      id: "citation",
      label: "关键结论引用覆盖",
      value: "100%",
      target: "100%",
      note: "所有高风险结论至少绑定一条可追溯证据",
      status: "pass",
    },
    {
      id: "guardrail",
      label: "高风险指令拦截",
      value: "100%",
      target: "100%",
      note: "未审批写入真实设备次数为 0",
      status: "pass",
    },
    {
      id: "tool-success",
      label: "工具调用成功率",
      value: "96.4%",
      target: "≥ 95%",
      note: "演示环境包含超时、缺字段与接口不可用用例",
      status: "pass",
    },
    {
      id: "p95",
      label: "P95 首个方案时延",
      value: "8.7 s",
      target: "< 10 s",
      note: "不含视觉模型上传等待时间",
      status: "observe",
    },
  ] satisfies EvaluationMetric[],
};
