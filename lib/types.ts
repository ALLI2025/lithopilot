export type StageStatus = "completed" | "active" | "warning" | "pending";

export type ProcessStage = {
  id: string;
  index: string;
  name: string;
  shortName: string;
  chamber: string;
  status: StageStatus;
  metric: string;
  value: string;
};

export type Evidence = {
  id: string;
  source: "vision" | "mes" | "equipment" | "knowledge";
  title: string;
  value: string;
  detail: string;
  citation?: string;
  severity: "normal" | "notice" | "critical";
};

export type Hypothesis = {
  id: string;
  title: string;
  confidence: number;
  support: string[];
  counterEvidence: string[];
  missing: string[];
};

export type PlanStep = {
  id: string;
  title: string;
  description: string;
  tool: string;
  risk: "low" | "medium" | "high";
  requiresApproval: boolean;
};

export type AgentEvent = {
  id: string;
  label: string;
  detail: string;
  tool?: string;
  status: "done" | "waiting" | "blocked";
  durationMs?: number;
};

export type IncidentInput = {
  incidentId: string;
  batchId: string;
  waferId: string;
  title: string;
  processStage: string;
  symptom: string;
};

export type AnalysisResult = {
  incident: IncidentInput & {
    severity: "P1" | "P2" | "P3";
    mode: "controlled-simulation";
  };
  evidence: Evidence[];
  hypotheses: Hypothesis[];
  plan: PlanStep[];
  events: AgentEvent[];
  guardrail: {
    decision: "approval-required" | "read-only";
    reason: string;
    allowedTarget: "simulator-only";
  };
  summary: string;
};

export type SimulationResult = {
  approved: boolean;
  approvalId: string;
  events: AgentEvent[];
  before: Record<string, string>;
  after: Record<string, string>;
  outcome: string;
  reportMarkdown: string;
};
