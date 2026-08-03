type ModelContext = {
  incidentTitle: string;
  evidence: Array<{ title: string; value: string; citation?: string }>;
  deterministicSummary: string;
};

/**
 * Optional OpenAI-compatible adapter. It only improves the user-facing summary;
 * tool results, safety gates and approval decisions remain deterministic.
 */
export async function createModelSummary(context: ModelContext) {
  const endpoint = process.env.LITHOPILOT_LLM_ENDPOINT;
  const apiKey = process.env.LITHOPILOT_LLM_API_KEY;
  const model = process.env.LITHOPILOT_LLM_MODEL;

  if (!endpoint || !apiKey || !model) {
    return { text: context.deterministicSummary, mode: "deterministic-demo" as const };
  }

  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "你是光刻产线异常处置助手。只能基于给定证据总结，不得新增参数、原因或操作；必须提醒写操作需要人工审批。输出100字以内中文。",
          },
          {
            role: "user",
            content: JSON.stringify(context),
          },
        ],
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) throw new Error(`MODEL_HTTP_${response.status}`);
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("MODEL_EMPTY_RESPONSE");
    return { text, mode: "model-assisted" as const };
  } catch {
    return { text: context.deterministicSummary, mode: "deterministic-fallback" as const };
  }
}
