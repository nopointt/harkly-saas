import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type FrameType = "PICO" | "HMW" | "ISSUE_TREE" | "FREE_FORM";

const MOCK: Record<FrameType, object> = {
  PICO: { p: "Target product users", i: "The change or factor being studied", c: "Current baseline behavior", o: "Key metric to measure", t: "Over 3-6 months" },
  HMW: { hmw: "How might we improve the experience?", user: "Product users", context: "During typical usage", goal: "Complete task efficiently", constraint: "Limited time and attention" },
  ISSUE_TREE: { core_question: "The main question", branch_1: "First key hypothesis", branch_2: "Second key hypothesis", branch_3: "", key_metrics: "User satisfaction, conversion rate" },
  FREE_FORM: { research_question: "The research question", scope: "Primary user flows", success_criteria: "Clear actionable insights" },
};

const PROMPTS: Record<FrameType, string> = {
  PICO: 'Decompose into PICO. Return ONLY JSON: {"p":"...","i":"...","c":"...","o":"...","t":"..."}',
  HMW: 'Reframe as HMW. Return ONLY JSON: {"hmw":"How might we...","user":"...","context":"...","goal":"...","constraint":"..."}',
  ISSUE_TREE: 'Decompose into issue tree. Return ONLY JSON: {"core_question":"...","branch_1":"...","branch_2":"...","branch_3":"","key_metrics":"..."}',
  FREE_FORM: 'Structure as research. Return ONLY JSON: {"research_question":"...","scope":"...","success_criteria":"..."}',
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { question?: string; frame_type?: FrameType };
  const { question, frame_type } = body;

  if (!question?.trim() || !frame_type) {
    return NextResponse.json({ error: "question and frame_type required" }, { status: 400 });
  }

  // Return mock when no API key configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ suggestion: MOCK[frame_type] ?? MOCK.FREE_FORM });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{ role: "user", content: `${PROMPTS[frame_type]}\n\nQuestion: ${question}` }],
      }),
    });

    const data = await res.json() as { content?: { text: string }[] };
    const text = data.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    const suggestion = match ? JSON.parse(match[0]) : MOCK[frame_type];
    return NextResponse.json({ suggestion });
  } catch {
    return NextResponse.json({ suggestion: MOCK[frame_type] });
  }
}
