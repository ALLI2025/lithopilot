import { demoIncident } from "./process-config.ts";
import {
  inspectWaferDefect,
  queryEquipmentLogs,
  queryMes,
  retrieveKnowledge,
  runParameterSimulation,
} from "./tools.ts";
import type {
  AgentEvent,
  AnalysisResult,
  IncidentInput,
  SimulationResult,
} from "./types.ts";

export function analyzeIncident(
  input: IncidentInput = demoIncident,
): AnalysisResult {
  const evidence = [
    inspectWaferDefect(input),
    queryMes(input),
    ...queryEquipmentLogs(),
    ...retrieveKnowledge(),
  ];

  return {
    incident: { ...input, severity: "P1", mode: "controlled-simulation" },
    evidence,
    hypotheses: [
      {
        id: "H-01",
        title: "曝光腔或隔离阀存在缓慢漏气 / 密封污染",
        confidence: 0.86,
        support: ["曝光腔压力连续超限", "抽空时间增加 34%", "历史案例具有相同信号组合"],
        counterEvidence: ["其他真空腔体保持稳定"],
        missing: ["隔离后的分段保压数据", "密封面视觉检查结果"],
      },
      {
        id: "H-02",
        title: "真空传输隔离阀时序偏移",
        confidence: 0.64,
        support: ["阀门关闭确认较基线延迟 180 ms"],
        counterEvidence: ["延迟仍处于现有联锁允许区间"],
        missing: ["连续 20 次阀门循环测试"],
      },
      {
        id: "H-03",
        title: "光刻胶边缘均匀性下降",
        confidence: 0.42,
        support: ["缺陷集中在晶圆边缘"],
        counterEvidence: ["同配方前 15 片未出现显著异常", "压力漂移与缺陷同时出现"],
        missing: ["涂胶模块膜厚分布数据"],
      },
    ],
    plan: [
      {
        id: "P-01",
        title: "保持批次并隔离曝光腔",
        description: "暂停后续传输，保持当前晶圆和配方版本，避免扩大影响范围。",
        tool: "set_safe_hold",
        risk: "low",
        requiresApproval: false,
      },
      {
        id: "P-02",
        title: "运行分段保压与阀门循环模拟",
        description: "在数字产线模拟器中比较腔体、管路与隔离阀的压力响应。",
        tool: "run_parameter_simulation",
        risk: "medium",
        requiresApproval: true,
      },
      {
        id: "P-03",
        title: "使用验证片复检",
        description: "模拟执行恢复方案后再次调用 TexWDS，核对缺陷率与边缘分布。",
        tool: "detect_defect",
        risk: "medium",
        requiresApproval: true,
      },
    ],
    events: [
      event("E-01", "受理异常", "工单已结构化并锁定批次上下文", "intake_incident", 82),
      event("E-02", "视觉取证", "TexWDS 返回边缘缺陷簇与置信度", "detect_defect", 48),
      event("E-03", "查询生产上下文", "MES 与设备日志已关联", "query_mes + query_device_logs", 126),
      event("E-04", "检索处置依据", "命中 1 条 SOP 与 1 条历史案例", "retrieve_sop", 94),
      event("E-05", "生成假设与方案", "形成 3 个候选原因并完成证据校验", "rank_hypotheses", 208),
      {
        id: "E-06",
        label: "等待人工审批",
        detail: "写操作被安全门阻断，仅允许进入设备模拟器",
        tool: "request_human_approval",
        status: "waiting",
      },
    ],
    guardrail: {
      decision: "approval-required",
      reason: "方案包含设备参数与阀门时序验证；任何写操作都必须经人工审批。",
      allowedTarget: "simulator-only",
    },
    summary:
      "证据优先指向曝光腔或隔离阀的真空保持异常。建议先保持批次，完成分段保压与阀门循环模拟，再用验证片复检；当前证据不足以对真实设备执行自动参数修改。",
  };
}

export function simulateApprovedPlan(approvalId?: string): SimulationResult {
  const values = runParameterSimulation(approvalId);
  const events: AgentEvent[] = [
    event("S-01", "审批通过", `审批记录 ${approvalId}`, "request_human_approval", 0),
    event("S-02", "执行模拟", "完成隔离阀清洁与时序复位的受控模拟", "run_parameter_simulation", 680),
    event("S-03", "验证片复检", "重新调用视觉检测工具并对比缺陷分布", "detect_defect", 51),
    event("S-04", "归档报告", "操作、证据与验证结果已写入演示工单", "generate_incident_report", 74),
  ];

  const reportMarkdown = `# LithoPilot 异常处置报告\n\n- 工单：LP-INC-260803-017\n- 审批：${approvalId}\n- 环境：受控模拟器，未连接真实设备\n- 主要假设：曝光腔或隔离阀密封异常\n- 模拟前腔压：${values.before.pressure}\n- 模拟后腔压：${values.after.pressure}\n- 模拟前缺陷率：${values.before.defectRate}\n- 模拟后缺陷率：${values.after.defectRate}\n\n> 所有参数与结果均为产品演示数据，不可直接用于真实工艺决策。\n`;

  return {
    approved: true,
    approvalId: approvalId!,
    events,
    before: values.before,
    after: values.after,
    outcome: "受控模拟通过：压力回到演示阈值内，验证片缺陷率下降。真实设备仍保持只读。",
    reportMarkdown,
  };
}

function event(
  id: string,
  label: string,
  detail: string,
  tool: string,
  durationMs: number,
): AgentEvent {
  return { id, label, detail, tool, durationMs, status: "done" };
}
