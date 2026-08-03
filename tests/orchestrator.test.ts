import assert from "node:assert/strict";
import test from "node:test";
import { analyzeIncident, simulateApprovedPlan } from "../lib/orchestrator.ts";
import { demoIncident } from "../lib/process-config.ts";

test("diagnosis keeps evidence, hypotheses and actions traceable", () => {
  const result = analyzeIncident(demoIncident);
  assert.equal(result.incident.mode, "controlled-simulation");
  assert.ok(result.evidence.length >= 6);
  assert.equal(result.hypotheses.length, 3);
  assert.ok(result.evidence.every((item) => Boolean(item.citation)));
  assert.ok(result.plan.some((step) => step.requiresApproval));
  assert.equal(result.guardrail.allowedTarget, "simulator-only");
});

test("write-like simulation is blocked without an approval token", () => {
  assert.throws(() => simulateApprovedPlan(), /APPROVAL_REQUIRED/);
});

test("approved simulation produces an auditable report", () => {
  const result = simulateApprovedPlan("APR-TEST-001");
  assert.equal(result.approved, true);
  assert.equal(result.approvalId, "APR-TEST-001");
  assert.match(result.reportMarkdown, /受控模拟器/);
  assert.match(result.reportMarkdown, /APR-TEST-001/);
  assert.equal(result.events.at(-1)?.label, "归档报告");
});
