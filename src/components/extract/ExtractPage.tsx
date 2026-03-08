"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ExtractionStatus = "NOT_STARTED" | "RUNNING" | "COMPLETED" | "FAILED";
type ExtractionType = "FACT" | "METRIC" | "QUOTE" | "THEME" | "CONTRADICTION";

interface ExtractionWithDocument {
  id: string;
  extraction_type: ExtractionType;
  content: string;
  confidence: number | null;
  verified: boolean;
  rejected: boolean;
  annotation: string | null;
  metadata: Record<string, unknown> | null;
  document: {
    id: string;
    title: string | null;
    source: { url: string | null } | null;
  };
}

interface ExtractPageProps {
  projectId: string;
  corpusFinalized: boolean;
  projectTitle: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_TABS: { key: "all" | ExtractionType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "FACT", label: "Facts" },
  { key: "METRIC", label: "Metrics" },
  { key: "QUOTE", label: "Quotes" },
  { key: "THEME", label: "Themes" },
  { key: "CONTRADICTION", label: "Contradictions" },
];

const TYPE_BADGE_CLS: Record<ExtractionType, string> = {
  FACT: "bg-blue-100 text-blue-700 border-blue-200",
  METRIC: "bg-purple-100 text-purple-700 border-purple-200",
  QUOTE: "bg-amber-100 text-amber-700 border-amber-200",
  THEME: "bg-teal-100 text-teal-700 border-teal-200",
  CONTRADICTION: "bg-orange-100 text-orange-700 border-orange-200",
};

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function confidenceBadge(confidence: number | null): { label: string; cls: string } {
  if (confidence === null) return { label: "?", cls: "bg-gray-100 text-gray-500" };
  if (confidence >= 0.8) return { label: "High", cls: "bg-green-100 text-green-700" };
  if (confidence >= 0.6) return { label: "Med", cls: "bg-yellow-100 text-yellow-700" };
  return { label: "Low", cls: "bg-gray-100 text-gray-500" };
}

function statusBadge(verified: boolean, rejected: boolean): { label: string; cls: string } {
  if (verified) return { label: "Verified", cls: "bg-green-100 text-green-700" };
  if (rejected) return { label: "Rejected", cls: "bg-red-100 text-red-600" };
  return { label: "Pending", cls: "bg-gray-100 text-gray-500" };
}

function extractionContent(ex: ExtractionWithDocument): string {
  if (ex.extraction_type === "CONTRADICTION" && ex.metadata) {
    const a = typeof ex.metadata.claim_a === "string" ? ex.metadata.claim_a : "";
    const b = typeof ex.metadata.claim_b === "string" ? ex.metadata.claim_b : "";
    if (a || b) return truncate(`${a} ↔ ${b}`, 120);
  }
  return truncate(ex.content, 120);
}

function countByType(extractions: ExtractionWithDocument[], type: ExtractionType): number {
  return extractions.filter((e) => e.extraction_type === type).length;
}

// ---------------------------------------------------------------------------
// Sub-component: ExtractionRow
// ---------------------------------------------------------------------------

interface ExtractionRowProps {
  extraction: ExtractionWithDocument;
  annotatingId: string | null;
  annotationText: string;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  onAnnotateOpen: (id: string) => void;
  onAnnotationTextChange: (text: string) => void;
  onAnnotateSave: (id: string) => void;
  onAnnotateCancel: () => void;
}

function ExtractionRow({
  extraction: ex,
  annotatingId,
  annotationText,
  onVerify,
  onReject,
  onAnnotateOpen,
  onAnnotationTextChange,
  onAnnotateSave,
  onAnnotateCancel,
}: ExtractionRowProps) {
  const isAnnotating = annotatingId === ex.id;
  const conf = confidenceBadge(ex.confidence);
  const stat = statusBadge(ex.verified, ex.rejected);
  const content = extractionContent(ex);
  const isContradiction = ex.extraction_type === "CONTRADICTION";

  return (
    <>
      <tr className={isContradiction ? "bg-orange-50 dark:bg-orange-950/20" : undefined}>
        <td className="px-3 py-2 whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${TYPE_BADGE_CLS[ex.extraction_type]}`}>
            {ex.extraction_type}
          </span>
        </td>
        <td className="px-3 py-2 max-w-xs">
          <span className="text-sm text-gray-800 dark:text-gray-200" title={ex.content}>
            {content}
          </span>
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
          <span className="text-xs text-gray-500" title={ex.document.source?.url ?? undefined}>
            {truncate(ex.document.title ?? "Untitled", 40)}
          </span>
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${conf.cls}`}>
            {conf.label}
          </span>
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${stat.cls}`}>
            {stat.label}
          </span>
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={ex.verified}
              onClick={() => onVerify(ex.id)}
              className="h-7 px-2 text-xs"
              title="Verify"
            >
              ✓
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={ex.rejected}
              onClick={() => onReject(ex.id)}
              className="h-7 px-2 text-xs"
              title="Reject"
            >
              ✗
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAnnotateOpen(ex.id)}
              className="h-7 px-2 text-xs"
              title="Annotate"
            >
              ✏
            </Button>
          </div>
        </td>
      </tr>
      {isAnnotating && (
        <tr>
          <td colSpan={6} className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col gap-2 max-w-lg">
              <Textarea
                value={annotationText}
                onChange={(e) => onAnnotationTextChange(e.target.value)}
                placeholder="Add annotation…"
                className="text-sm resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onAnnotateSave(ex.id)} className="h-7 text-xs">
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={onAnnotateCancel} className="h-7 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ExtractPage({ projectId, corpusFinalized, projectTitle }: ExtractPageProps) {
  const [status, setStatus] = useState<ExtractionStatus>("NOT_STARTED");
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [extractions, setExtractions] = useState<ExtractionWithDocument[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | ExtractionType>("all");
  const [annotatingId, setAnnotatingId] = useState<string | null>(null);
  const [annotationText, setAnnotationText] = useState("");
  const [includedCount, setIncludedCount] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStatusRef = useRef<ExtractionStatus>("NOT_STARTED");

  const fetchIncludedCount = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/sources`);
    if (res.ok) {
      const data = (await res.json()) as { stats: { included: number } };
      setIncludedCount(data.stats?.included ?? 0);
    }
  }, [projectId]);

  const fetchExtractions = useCallback(async () => {
    const params = activeTab !== "all" ? `?type=${activeTab}` : "";
    const res = await fetch(`/api/projects/${projectId}/extractions${params}`);
    if (res.ok) {
      const data = (await res.json()) as { extractions: ExtractionWithDocument[] };
      setExtractions(data.extractions);
    }
  }, [projectId, activeTab]);

  const fetchStatus = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/extraction-status`);
    if (res.ok) {
      const data = (await res.json()) as { status: ExtractionStatus; done: number; total: number };
      setStatus((prev) => {
        prevStatusRef.current = prev;
        return data.status;
      });
      setDone(data.done);
      setTotal(data.total);
    }
  }, [projectId]);

  // Initial load
  useEffect(() => {
    fetchStatus();
    fetchExtractions();
    fetchIncludedCount();
  }, [fetchStatus, fetchExtractions, fetchIncludedCount]);

  // Re-fetch extractions when tab changes
  useEffect(() => {
    fetchExtractions();
  }, [fetchExtractions]);

  // Polling while RUNNING; fetch extractions when transitioning to COMPLETED
  useEffect(() => {
    if (status === "RUNNING") {
      pollingRef.current = setInterval(fetchStatus, 3000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (prevStatusRef.current === "RUNNING" && status === "COMPLETED") {
        fetchExtractions();
      }
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [status, fetchStatus, fetchExtractions]);

  const handleRunExtraction = async () => {
    setStatus("RUNNING");
    try {
      await fetch(`/api/projects/${projectId}/extraction/run`, { method: "POST" });
      toast.success('Extraction started. This may take a few minutes.');
      fetchStatus();
    } catch {
      toast.error('Failed to run extraction');
      setStatus("NOT_STARTED");
    }
  };

  const handleVerify = async (extractionId: string) => {
    try {
      await fetch(`/api/projects/${projectId}/extractions/${extractionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: true }),
      });
      fetchExtractions();
    } catch {
      toast.error('Failed to save changes');
    }
  };

  const handleReject = async (extractionId: string) => {
    try {
      await fetch(`/api/projects/${projectId}/extractions/${extractionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejected: true }),
      });
      fetchExtractions();
    } catch {
      toast.error('Failed to save changes');
    }
  };

  const handleAnnotate = async (extractionId: string) => {
    try {
      await fetch(`/api/projects/${projectId}/extractions/${extractionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annotation: annotationText }),
      });
      setAnnotatingId(null);
      setAnnotationText("");
      fetchExtractions();
    } catch {
      toast.error('Failed to save changes');
    }
  };

  const handleDetectContradictions = async () => {
    try {
      await fetch(`/api/projects/${projectId}/extraction/detect-contradictions`, { method: "POST" });
      fetchExtractions();
    } catch {
      toast.error('Failed to generate artifact');
    }
  };

  const handleAnnotateOpen = (id: string) => {
    const existing = extractions.find((e) => e.id === id);
    setAnnotationText(existing?.annotation ?? "");
    setAnnotatingId(id);
  };

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const EXTRACTION_TYPES: ExtractionType[] = ["FACT", "METRIC", "QUOTE", "THEME", "CONTRADICTION"];

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="text-sm text-gray-500">
          <span>Projects</span>
          <span className="mx-1">/</span>
          <span className="text-gray-700">{projectTitle}</span>
          <span className="mx-1">/</span>
          <span className="text-gray-900 font-medium">Extract</span>
        </div>

        {/* Buttons area */}
        <div className="flex items-center gap-3 flex-wrap">
          {!corpusFinalized && (
            <div className="flex items-center gap-2">
              <Button disabled>Run extraction</Button>
              <Link href={`/app/projects/${projectId}/corpus`} className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
                Finalize corpus first
              </Link>
            </div>
          )}

          {corpusFinalized && status === "NOT_STARTED" && (
            <Button onClick={handleRunExtraction} disabled={includedCount === 0}>
              {includedCount === 0 ? 'No included documents' : 'Run extraction'}
            </Button>
          )}

          {status === "RUNNING" && (
            <div className="flex items-center gap-3 min-w-[220px]">
              <div className="flex-1">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Extracting {done} / {total} documents…
              </span>
            </div>
          )}

          {status === "COMPLETED" && (
            <>
              <Button variant="outline" onClick={handleRunExtraction}>
                Re-run extraction
              </Button>
              <Button onClick={handleDetectContradictions}>Detect contradictions</Button>
            </>
          )}

          {status === "FAILED" && (
            <Button onClick={handleRunExtraction}>Retry extraction</Button>
          )}
        </div>
      </div>

      {/* Coverage panel */}
      {extractions.length > 0 && (
        <div className="max-w-md border border-border rounded-lg p-4 bg-card">
          <p className="text-sm font-medium text-card-foreground mb-3">Extraction coverage</p>
          <div className="grid grid-cols-5 gap-2">
            {EXTRACTION_TYPES.map((type) => (
              <div key={type} className="flex flex-col items-center gap-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${TYPE_BADGE_CLS[type]}`}>
                  {countByType(extractions, type)}
                </span>
                <span className="text-[10px] text-gray-400">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs + table */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | ExtractionType)}>
        <TabsList>
          {TYPE_TABS.map(({ key, label }) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TYPE_TABS.map(({ key }) => (
          <TabsContent key={key} value={key} className="mt-4">
            {extractions.length === 0 && status !== "RUNNING" ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                {!corpusFinalized ? (
                  <p className="text-sm">
                    <Link href={`/app/projects/${projectId}/corpus`} className="text-gray-600 hover:text-gray-900 hover:underline">
                      Finalize your corpus
                    </Link> first, then run extraction.
                  </p>
                ) : status === "NOT_STARTED" ? (
                  <p className="text-sm">Click &apos;Run extraction&apos; to analyze your corpus documents.</p>
                ) : (
                  <p className="text-sm">No extractions found.</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap">Type</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Content</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap">Source</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap">Confidence</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap">Status</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {extractions.map((ex) => (
                      <ExtractionRow
                        key={ex.id}
                        extraction={ex}
                        annotatingId={annotatingId}
                        annotationText={annotationText}
                        onVerify={handleVerify}
                        onReject={handleReject}
                        onAnnotateOpen={handleAnnotateOpen}
                        onAnnotationTextChange={setAnnotationText}
                        onAnnotateSave={handleAnnotate}
                        onAnnotateCancel={() => { setAnnotatingId(null); setAnnotationText(""); }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
