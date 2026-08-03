import type { Evidence, IncidentInput } from "./types.ts";

export function inspectWaferDefect(input: IncidentInput): Evidence {
  return {
    id: "EV-VISION-01",
    source: "vision",
    title: "TexWDS 缺陷检测",
    value: "边缘缺陷簇 · 置信度 0.91",
    detail: `${input.waferId} 在晶圆外缘出现连续缺陷分布，推理时延 48 ms（演示结果）。`,
    citation: "VISION-RUN-260803-018",
    severity: "critical",
  };
}

export function queryMes(input: IncidentInput): Evidence {
  return {
    id: "EV-MES-01",
    source: "mes",
    title: "MES 批次上下文",
    value: `${input.batchId} · 第 18/24 片`,
    detail: "同配方前 17 片通过；第 16 片起边缘缺陷呈上升趋势，未发生配方版本变更。",
    citation: "MES-BATCH-VIL-260803-A17",
    severity: "notice",
  };
}

export function queryEquipmentLogs(): Evidence[] {
  return [
    {
      id: "EV-LOG-01",
      source: "equipment",
      title: "曝光腔压力",
      value: "1.7×10⁻³ Pa",
      detail: "连续 6 个采样窗口高于演示上限 8.0×10⁻⁴ Pa，抽空时间较基线增加 34%。",
      citation: "EXP-01/PRESSURE/14:32-14:38",
      severity: "critical",
    },
    {
      id: "EV-LOG-02",
      source: "equipment",
      title: "传输阀动作",
      value: "关闭延迟 +180 ms",
      detail: "VT-01 → EXP-01 的隔离阀关闭确认晚于基线，仍处在设备联锁允许区间内。",
      citation: "VT-01/VALVE-CLOSE/14:31:52",
      severity: "notice",
    },
  ];
}

export function retrieveKnowledge(): Evidence[] {
  return [
    {
      id: "EV-KB-01",
      source: "knowledge",
      title: "真空异常处置 SOP",
      value: "先隔离、后检漏、再验证",
      detail: "压力持续超限时应进入安全保持，禁止直接修改正式配方；完成隔离检查后才可运行验证片。",
      citation: "SOP-VAC-04 §3.2",
      severity: "normal",
    },
    {
      id: "EV-KB-02",
      source: "knowledge",
      title: "历史案例",
      value: "密封面颗粒污染",
      detail: "相似案例中，隔离阀密封面污染同时造成抽空时间增加与晶圆边缘异常。",
      citation: "CASE-VAC-011",
      severity: "notice",
    },
  ];
}

export function runParameterSimulation(approvalId?: string) {
  if (!approvalId) {
    throw new Error("SIMULATION_BLOCKED_APPROVAL_REQUIRED");
  }

  return {
    before: {
      pressure: "1.7×10⁻³ Pa",
      pumpDown: "42.6 s",
      defectRate: "6.8%",
      estimatedYield: "93.2%",
    },
    after: {
      pressure: "6.2×10⁻⁴ Pa",
      pumpDown: "31.1 s",
      defectRate: "2.1%",
      estimatedYield: "97.9%",
    },
  };
}
