import { NextResponse } from "next/server";
import { evaluationSummary } from "@/lib/evaluation";

export function GET() {
  return NextResponse.json(evaluationSummary);
}
