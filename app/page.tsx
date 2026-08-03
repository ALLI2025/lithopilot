"use client";

import { useMemo, useState } from "react";
import { assumptionNotice, demoIncident, processStages } from "@/lib/process-config";
import { evaluationSummary } from "@/lib/evaluation";
import type { AnalysisResult, Evidence, SimulationResult } from "@/lib/types";

type View = "command" | "evaluation" | "architecture";
type Phase = "idle" | "analyzing" | "ready" | "simulating" | "complete";

const navItems: Array<{ id: View; label: string; meta: string }> = [
  { id: "command", label: "产线驾驶舱", meta: "LIVE" },
  { id: "evaluation", label: "Agent 评测", meta: "50" },
  { id: "architecture", label: "产品边界", meta: "DOC" },
];

export default function Home() {
  const [view, setView] = useState<View>("command");
  const [phase, setPhase] = useState<Phase>("idle");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");

  const completion = simulation ? 74 : analysis ? 63 : 58;
  const incidentLabel = simulation ? "已验证 · 待人工放行" : analysis ? "P1 · 等待审批" : "P1 · 待诊断";

  async function runAnalysis() {
    setError("");
    setPhase("analyzing");
    try {
      const response = await fetch("/api/incidents/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(demoIncident),
      });
      if (!response.ok) throw new Error("诊断接口暂时不可用");
      setAnalysis((await response.json()) as AnalysisResult);
      setPhase("ready");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "未知错误");
      setPhase("idle");
    }
  }

  async function approveSimulation() {
    setError("");
    setPhase("simulating");
    try {
      const response = await fetch("/api/incidents/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          approved: true,
          approvalId: `APR-${new Date().getTime().toString().slice(-8)}`,
        }),
      });
      if (!response.ok) throw new Error("审批记录无效，模拟已阻止");
      setSimulation((await response.json()) as SimulationResult);
      setPhase("complete");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "未知错误");
      setPhase("ready");
    }
  }

  function downloadReport() {
    if (!simulation) return;
    const blob = new Blob([simulation.reportMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "LithoPilot-异常处置报告.md";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <div>
            <strong>LithoPilot</strong>
            <span>VACUUM LITHOGRAPHY OS</span>
          </div>
        </div>

        <div className="environment-chip"><span /> 受控模拟环境</div>

        <nav className="nav-list" aria-label="主导航">
          <p>WORKSPACE</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? "active" : ""}
              onClick={() => setView(item.id)}
            >
              <span>{item.label}</span><small>{item.meta}</small>
            </button>
          ))}
        </nav>

        <div className="sidebar-meta">
          <div><span>产线配置</span><b>VIL-DEMO-01</b></div>
          <div><span>控制权限</span><b>SIMULATOR ONLY</b></div>
          <div><span>审计日志</span><b>ENABLED</b></div>
        </div>
        <p className="sidebar-note">真实设备保持只读。任何写操作必须通过角色权限、参数校验和人工审批。</p>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ZHENGZHOU · SENSE LAB · DEMONSTRATION</p>
            <h1>{view === "command" ? "真空互联光刻产线" : view === "evaluation" ? "Agent 评测中心" : "系统边界与安全设计"}</h1>
          </div>
          <div className="topbar-actions">
            <span className="clock">2026.08.03&nbsp;&nbsp;14:38:26 CST</span>
            <button type="button" className="icon-button" aria-label="系统状态"><span className="pulse" /></button>
          </div>
        </header>

        {view === "command" && (
          <CommandView
            phase={phase}
            completion={completion}
            incidentLabel={incidentLabel}
            analysis={analysis}
            simulation={simulation}
            error={error}
            onAnalyze={runAnalysis}
            onApprove={approveSimulation}
            onDownload={downloadReport}
          />
        )}
        {view === "evaluation" && <EvaluationView />}
        {view === "architecture" && <ArchitectureView />}
      </section>
    </main>
  );
}

function CommandView({
  phase,
  completion,
  incidentLabel,
  analysis,
  simulation,
  error,
  onAnalyze,
  onApprove,
  onDownload,
}: {
  phase: Phase;
  completion: number;
  incidentLabel: string;
  analysis: AnalysisResult | null;
  simulation: SimulationResult | null;
  error: string;
  onAnalyze: () => void;
  onApprove: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="content-stack">
      <section className="notice-bar"><span>ASSUMPTION</span><p>{assumptionNotice}</p></section>

      <section className="metric-grid" aria-label="产线概览">
        <Metric label="当前批次" value="VIL-260803-A17" note="第 18 / 24 片" />
        <Metric label="流程进度" value={`${completion}%`} note="曝光后异常保持" progress={completion} />
        <Metric label="预计良率" value={simulation ? "97.9%" : "93.2%"} note={simulation ? "模拟验证后" : "当前模拟估计"} tone={simulation ? "green" : "amber"} />
        <Metric label="活跃异常" value="01" note={incidentLabel} tone="red" />
      </section>

      <section className="panel process-panel">
        <div className="section-heading">
          <div><p className="section-index">01 / PROCESS GRAPH</p><h2>批次工艺状态</h2></div>
          <div className="legend"><span className="ok" /> 完成 <span className="live" /> 运行 <span className="warn" /> 异常 <span className="off" /> 等待</div>
        </div>
        <div className="process-flow">
          {processStages.map((stage, index) => (
            <div className={`process-node ${stage.status}`} key={stage.id}>
              <div className="node-top"><span>{stage.index}</span><small>{stage.chamber}</small></div>
              <strong>{stage.shortName}</strong>
              <p>{stage.metric}</p><b>{simulation && stage.id === "align-expose" ? "6.2×10⁻⁴ Pa" : stage.value}</b>
              {index < processStages.length - 1 && <i className="connector" />}
            </div>
          ))}
        </div>
      </section>

      <section className="incident-layout">
        <article className="panel incident-card">
          <div className="incident-title-row">
            <div><p className="section-index">02 / ACTIVE INCIDENT</p><h2>{demoIncident.title}</h2></div>
            <span className="severity">P1 · QUALITY RISK</span>
          </div>
          <div className="incident-meta">
            <span>工单 <b>{demoIncident.incidentId}</b></span>
            <span>晶圆 <b>{demoIncident.waferId}</b></span>
            <span>模块 <b>EXP-01</b></span>
            <span>发现时间 <b>14:32:08</b></span>
          </div>
          <div className="incident-visual-row">
            <WaferMap resolved={Boolean(simulation)} />
            <div className="incident-description">
              <p>{demoIncident.symptom}</p>
              <div className="signal-list">
                <span><i className="signal red" />曝光腔压力超出演示阈值</span>
                <span><i className="signal amber" />隔离阀关闭确认延迟</span>
                <span><i className="signal blue" />AOI 边缘缺陷分布聚集</span>
              </div>
              {!analysis && (
                <button type="button" className="primary-button" onClick={onAnalyze} disabled={phase === "analyzing"}>
                  {phase === "analyzing" ? "正在调用工具并组织证据…" : "运行 Agent 诊断"}<Arrow />
                </button>
              )}
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
        </article>

        <article className="panel agent-trace">
          <div className="section-heading compact">
            <div><p className="section-index">AGENT TRACE</p><h2>执行轨迹</h2></div>
            <span className={`runtime-status ${analysis ? "online" : ""}`}>{analysis ? "6/7" : "READY"}</span>
          </div>
          {!analysis ? (
            <div className="trace-empty">
              <div className="trace-ring"><span>AI</span></div>
              <p>等待工单启动</p><small>系统将依次调用视觉、MES、设备日志与知识库工具。</small>
            </div>
          ) : (
            <div className="trace-list">
              {[...analysis.events, ...(simulation?.events ?? [])].map((event) => (
                <div className={`trace-event ${event.status}`} key={event.id}>
                  <i /><div><b>{event.label}</b><p>{event.detail}</p><code>{event.tool}</code></div>
                  {event.durationMs !== undefined && <span>{event.durationMs}ms</span>}
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      {analysis && (
        <>
          <section className="panel evidence-panel">
            <div className="section-heading">
              <div><p className="section-index">03 / EVIDENCE FIRST</p><h2>多源证据</h2></div>
              <span className="evidence-count">{analysis.evidence.length} 条证据 · 引用覆盖 100%</span>
            </div>
            <div className="evidence-grid">
              {analysis.evidence.map((item) => <EvidenceCard item={item} key={item.id} />)}
            </div>
          </section>

          <section className="decision-layout">
            <article className="panel hypotheses-panel">
              <div className="section-heading compact">
                <div><p className="section-index">04 / ROOT CAUSE</p><h2>根因假设</h2></div>
                <span>Top 3</span>
              </div>
              <div className="hypothesis-list">
                {analysis.hypotheses.map((item, index) => (
                  <div className="hypothesis" key={item.id}>
                    <div className="rank">0{index + 1}</div>
                    <div className="hypothesis-copy">
                      <div className="hypothesis-head"><h3>{item.title}</h3><b>{Math.round(item.confidence * 100)}%</b></div>
                      <div className="confidence-bar"><i style={{ width: `${item.confidence * 100}%` }} /></div>
                      <p><span>支持</span>{item.support.join("；")}</p>
                      <p><span>反证</span>{item.counterEvidence.join("；")}</p>
                      <p><span>待补</span>{item.missing.join("；")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel approval-panel">
              <div className="approval-stripe"><Shield /> HUMAN-IN-THE-LOOP</div>
              <p className="section-index">05 / CONTROL GATE</p>
              <h2>{simulation ? "模拟验证已完成" : "需要设备工程师审批"}</h2>
              <p className="approval-summary">{simulation ? simulation.outcome : analysis.summary}</p>

              {!simulation ? (
                <>
                  <div className="change-card">
                    <div><span>目标</span><b>数字产线模拟器</b></div>
                    <div><span>动作</span><b>分段保压 + 阀门循环</b></div>
                    <div><span>真实设备</span><b className="safe-text">保持只读</b></div>
                  </div>
                  <button type="button" className="approval-button" onClick={onApprove} disabled={phase === "simulating"}>
                    {phase === "simulating" ? "正在执行受控模拟…" : "批准并运行模拟验证"}<Arrow />
                  </button>
                  <small className="approval-note">批准操作会生成唯一审批号并写入审计时间线。</small>
                </>
              ) : (
                <>
                  <BeforeAfter before={simulation.before} after={simulation.after} />
                  <button type="button" className="approval-button completed" onClick={onDownload}>下载处置报告 <Download /></button>
                </>
              )}
            </article>
          </section>
        </>
      )}

      <footer className="workspace-footer"><span>LithoPilot MVP · controlled simulation</span><span>所有工艺参数与结果均为演示数据</span></footer>
    </div>
  );
}

function EvaluationView() {
  return (
    <div className="content-stack evaluation-view">
      <section className="evaluation-hero">
        <div><p className="eyebrow">EVALUATION BEFORE AUTOMATION</p><h2>先证明可信，再提高自动化等级</h2><p>{evaluationSummary.disclaimer}</p></div>
        <div className="dataset-stamp"><span>DATASET</span><strong>{evaluationSummary.dataset}</strong><small>{evaluationSummary.cases} 条 · {evaluationSummary.datasetType}</small></div>
      </section>
      <section className="evaluation-grid">
        {evaluationSummary.metrics.map((metric, index) => (
          <article className="metric-card" key={metric.id}>
            <div className="metric-card-top"><span>0{index + 1}</span><i className={metric.status} /></div>
            <strong>{metric.value}</strong><h3>{metric.label}</h3>
            <div className="target-row"><span>目标</span><b>{metric.target}</b></div>
            <p>{metric.note}</p>
          </article>
        ))}
      </section>
      <section className="panel eval-method">
        <div className="section-heading"><div><p className="section-index">METHOD / V0.1</p><h2>受控评测设计</h2></div><span className="tag">NOT PRODUCTION CLAIMS</span></div>
        <div className="method-grid">
          <div><b>01</b><h3>正常与异常工单</h3><p>覆盖真空漂移、阀门时序、Recipe冲突、传输异常和视觉缺陷；保留信息不足样本。</p></div>
          <div><b>02</b><h3>证据与标准答案</h3><p>每条工单绑定标准原因、必要证据、允许动作、审批角色与预期验证信号。</p></div>
          <div><b>03</b><h3>故障注入</h3><p>模拟接口超时、字段缺失、重复指令与越权请求，验证重试、拒答和幂等保护。</p></div>
          <div><b>04</b><h3>版本对比</h3><p>后续对比无检索、单轮回答与受控工作流，记录正确率、时延、成本和人工修改率。</p></div>
        </div>
      </section>
    </div>
  );
}

function ArchitectureView() {
  const layers = [
    { id: "L4", title: "LithoPilot 产品层", text: "批次编排、证据聚合、Agent诊断、审批、验证、报告与产品分析", accent: true },
    { id: "L3", title: "白名单工具层", text: "MES、知识库、视觉模型、时序查询、设备模拟器和审计日志" },
    { id: "L2", title: "设备控制层", text: "PLC、LabVIEW、运动控制、真空控制与设备原生软件" },
    { id: "L1", title: "硬件安全层", text: "舱门、真空、紫外、高压、温控和运动互锁；Agent不可绕过" },
  ];
  return (
    <div className="content-stack architecture-view">
      <section className="architecture-hero">
        <p className="eyebrow">CONTROL BOUNDARY</p>
        <h2>Agent负责组织证据与推动闭环，<br />不替代实时控制与硬件互锁</h2>
        <p>这是产品可信度的核心：建议可以智能生成，权限、校验、审批和安全停机必须确定执行。</p>
      </section>
      <section className="layer-stack">
        {layers.map((layer) => (
          <article key={layer.id} className={layer.accent ? "accent" : ""}>
            <span>{layer.id}</span><div><h3>{layer.title}</h3><p>{layer.text}</p></div>
          </article>
        ))}
      </section>
      <section className="boundary-grid">
        <article className="panel"><p className="section-index">AGENT CAN</p><h3>允许能力</h3><ul><li>读取批次、设备、日志和视觉结果</li><li>检索SOP并给出带出处的假设</li><li>在模拟器验证恢复方案</li><li>发起审批并生成审计报告</li></ul></article>
        <article className="panel danger"><p className="section-index">AGENT CANNOT</p><h3>禁止能力</h3><ul><li>绕过任何硬件或软件互锁</li><li>未经批准修改工艺参数</li><li>用模拟结果冒充真实产线数据</li><li>在证据不足时强行给出根因</li></ul></article>
      </section>
    </div>
  );
}

function Metric({ label, value, note, tone, progress }: { label: string; value: string; note: string; tone?: string; progress?: number }) {
  return <article className={`overview-metric ${tone ?? ""}`}><span>{label}</span><strong>{value}</strong><p>{note}</p>{progress !== undefined && <i><b style={{ width: `${progress}%` }} /></i>}</article>;
}

function WaferMap({ resolved }: { resolved: boolean }) {
  const defects = useMemo(() => [
    [19, 32], [15, 48], [21, 67], [28, 77], [72, 18], [82, 31], [87, 49], [79, 72], [69, 84], [46, 88],
  ], []);
  return <div className={`wafer-shell ${resolved ? "resolved" : ""}`}><div className="wafer"><div className="wafer-grid" />{defects.map(([x, y], i) => <i key={i} style={{ left: `${x}%`, top: `${y}%` }} />)}<span className="scan-line" /></div><div className="wafer-caption"><span>TEXWDS / AOI-01</span><b>{resolved ? "2.1%" : "6.8%"} DEFECT</b></div></div>;
}

function EvidenceCard({ item }: { item: Evidence }) {
  const labels = { vision: "VISION", mes: "MES", equipment: "EQUIPMENT", knowledge: "KNOWLEDGE" };
  return <article className={`evidence-card ${item.severity}`}><div><span>{labels[item.source]}</span><i /></div><h3>{item.title}</h3><strong>{item.value}</strong><p>{item.detail}</p><code>{item.citation}</code></article>;
}

function BeforeAfter({ before, after }: { before: Record<string, string>; after: Record<string, string> }) {
  return <div className="before-after"><div><span>指标</span><b>模拟前</b><b>模拟后</b></div><div><span>曝光腔压</span><b>{before.pressure}</b><b>{after.pressure}</b></div><div><span>缺陷率</span><b>{before.defectRate}</b><b>{after.defectRate}</b></div><div><span>预计良率</span><b>{before.estimatedYield}</b><b>{after.estimatedYield}</b></div></div>;
}

function Arrow() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" /></svg>; }
function Shield() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5 16 5v4.5c0 3.8-2.4 6.5-6 8-3.6-1.5-6-4.2-6-8V5l6-2.5Z" /><path d="m7.2 10 1.8 1.8 3.8-4" /></svg>; }
function Download() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v9m-4-4 4 4 4-4M4 15.5h12" /></svg>; }
