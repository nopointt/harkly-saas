// ─── Framing Types ────────────────────────────────────────────────────────────

export type FrameType = "PICO" | "HMW" | "ISSUE_TREE" | "FREE_FORM";

export interface PICOFrame {
  p: string; // Population
  i: string; // Intervention
  c: string; // Comparison
  o: string; // Outcome
  t: string; // Time
}

export interface HMWFrame {
  hmw: string;      // How Might We statement
  user: string;     // Who we're designing for
  context: string;  // When/where
  goal: string;     // What they're trying to achieve
  constraint: string; // What makes this hard
}

export interface IssueTreeFrame {
  core_question: string;
  branch_1: string;
  branch_2: string;
  branch_3: string; // optional
  key_metrics: string;
}

export interface FreeFormFrame {
  research_question: string;
  scope: string;
  success_criteria: string;
}

export type FrameData = PICOFrame | HMWFrame | IssueTreeFrame | FreeFormFrame;

export interface ResearchProjectSummary {
  id: string;
  title: string;
  frame_type: FrameType | null;
  frame_data: FrameData | null;
  extraction_status: "NOT_STARTED" | "RUNNING" | "COMPLETED" | "FAILED";
  corpus_finalized: boolean;
  corpus_finalized_at: string | null;
  created_at: string;
  updated_at: string;
  workspace_id: string;
  user_id: string;
}

// Empty frame defaults per type
export const EMPTY_FRAMES: Record<FrameType, FrameData> = {
  PICO: { p: "", i: "", c: "", o: "", t: "" },
  HMW: { hmw: "", user: "", context: "", goal: "", constraint: "" },
  ISSUE_TREE: { core_question: "", branch_1: "", branch_2: "", branch_3: "", key_metrics: "" },
  FREE_FORM: { research_question: "", scope: "", success_criteria: "" },
};

// Required fields per frame type (for "Confirm Frame" button enabling)
export const REQUIRED_FIELDS: Record<FrameType, string[]> = {
  PICO: ["p", "i", "o"],
  HMW: ["hmw", "user"],
  ISSUE_TREE: ["core_question", "branch_1"],
  FREE_FORM: ["research_question"],
};

export function isFrameComplete(type: FrameType, data: FrameData): boolean {
  const required = REQUIRED_FIELDS[type];
  return required.every((key) => {
    const val = (data as unknown as Record<string, string>)[key];
    return typeof val === "string" && val.trim().length > 0;
  });
}
