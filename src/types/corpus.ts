export type SourceType = "URL" | "PDF" | "DOCX" | "CSV" | "TXT";
export type SourceStatus = "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED";
export type ScreeningStatus = "PENDING" | "INCLUDED" | "EXCLUDED" | "MAYBE" | "FLAGGED";
export type FilterTab = "all" | "pending" | "included" | "excluded" | "maybe";

export interface CorpusDocument {
  id: string;
  project_id: string;
  source_id: string;
  title: string | null;
  content: string;
  word_count: number | null;
  language: string | null;
  relevance_score: number | null;
  screening_status: ScreeningStatus;
  screening_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CorpusSource {
  id: string;
  project_id: string;
  url: string | null;
  title: string | null;
  type: SourceType;
  status: SourceStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  documents: CorpusDocument[];
}

export interface CorpusStats {
  total: number;
  included: number;
  excluded: number;
  maybe: number;
  pending: number;
}
