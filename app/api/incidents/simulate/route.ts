import { NextResponse } from "next/server";
import { simulateApprovedPlan } from "@/lib/orchestrator";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    approved?: boolean;
    approvalId?: string;
  };

  if (!payload.approved || !payload.approvalId) {
    return NextResponse.json(
      {
        error: "APPROVAL_REQUIRED",
        message: "模拟写操作需要人工审批记录。",
      },
      { status: 403 },
    );
  }

  return NextResponse.json(simulateApprovedPlan(payload.approvalId));
}
