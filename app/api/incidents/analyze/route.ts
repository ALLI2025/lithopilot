import { NextResponse } from "next/server";
import { analyzeIncident } from "@/lib/orchestrator";
import { demoIncident } from "@/lib/process-config";
import { createModelSummary } from "@/lib/model-adapter";
import type { IncidentInput } from "@/lib/types";

export async function POST(request: Request) {
  let input: IncidentInput = demoIncident;

  try {
    const payload = (await request.json()) as Partial<IncidentInput>;
    input = { ...demoIncident, ...payload };
  } catch {
    // The demo incident is intentionally used when no request body is supplied.
  }

  const result = analyzeIncident(input);
  const modelSummary = await createModelSummary({
    incidentTitle: result.incident.title,
    evidence: result.evidence.map(({ title, value, citation }) => ({ title, value, citation })),
    deterministicSummary: result.summary,
  });

  return NextResponse.json({
    ...result,
    summary: modelSummary.text,
    runtime: {
      mode: modelSummary.mode,
      writeTarget: "simulator-only",
      generatedAt: new Date().toISOString(),
    },
  });
}
