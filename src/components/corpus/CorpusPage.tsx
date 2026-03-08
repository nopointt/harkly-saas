"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { CorpusSource, CorpusDocument, CorpusStats, FilterTab, ScreeningStatus } from "@/types/corpus";
import { AddSourcesPanel } from "./AddSourcesPanel";
import { DocumentPreview } from "./DocumentPreview";
import { FinalizationModal } from "./FinalizationModal";
import { cn } from "@/lib/utils";

type FlatDoc = { doc: CorpusDocument; source: CorpusSource };

function flatDocs(sources: CorpusSource[]): FlatDoc[] {
  return sources.flatMap((s) => s.documents.map((d) => ({ doc: d, source: s })));
}

function getRelevanceTier(score: number | null): "high" | "medium" | "low" | null {
  if (score === null) return null;
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

const RELEVANCE_CLS: Record<string, string> = {
  high: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-500",
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "included", label: "Included" },
  { key: "excluded", label: "Excluded" },
  { key: "maybe", label: "Maybe" },
];

const SCREEN_ACTIONS: { status: ScreeningStatus; label: string; cls: string; activeCls: string }[] = [
  { status: "INCLUDED", label: "Include", cls: "text-green-600 border-green-200 hover:bg-green-50", activeCls: "bg-green-600 text-white border-green-600" },
  { status: "MAYBE", label: "Maybe", cls: "text-yellow-600 border-yellow-200 hover:bg-yellow-50", activeCls: "bg-yellow-500 text-white border-yellow-500" },
  { status: "EXCLUDED", label: "Exclude", cls: "text-red-500 border-red-200 hover:bg-red-50", activeCls: "bg-red-500 text-white border-red-500" },
];

interface Props {
  projectId: string;
  corpusFinalized: boolean;
}

export function CorpusPage({ projectId, corpusFinalized: initialFinalized }: Props) {
  const [sources, setSources] = useState<CorpusSource[]>([]);
  const [stats, setStats] = useState<CorpusStats>({ total: 0, included: 0, excluded: 0, maybe: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [showFinalize, setShowFinalize] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [finalized, setFinalized] = useState(initialFinalized);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allDocs = flatDocs(sources);
  const anyProcessing = sources.some((s) => s.status === "PROCESSING" || s.status === "PENDING");
  const filteredDocs = allDocs.filter(({ doc }) =>
    filter === "all" ? true : doc.screening_status.toLowerCase() === filter
  );
  const selectedDoc = selectedDocId ? allDocs.find(({ doc }) => doc.id === selectedDocId) ?? null : null;

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/sources`);
      if (!res.ok) return;
      const data = await res.json() as { sources: CorpusSource[]; stats: CorpusStats };
      setSources(data.sources);
      setStats(data.stats);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll while any source is processing
  useEffect(() => {
    if (anyProcessing) {
      pollingRef.current = setInterval(fetchData, 3000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [anyProcessing, fetchData]);

  const handleScreen = useCallback(async (docId: string, status: ScreeningStatus) => {
    setSources((prev) => prev.map((s) => ({
      ...s,
      documents: s.documents.map((d) => d.id === docId ? { ...d, screening_status: status } : d),
    })));
    try {
      await fetch(`/api/projects/${projectId}/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screening_status: status }),
      });
      await fetchData();
    } catch {
      toast.error('Failed to save changes');
      fetchData();
    }
  }, [projectId, fetchData]);

  // Keyboard shortcuts I / E / M
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selectedDocId) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const map: Record<string, ScreeningStatus> = { i: "INCLUDED", e: "EXCLUDED", m: "MAYBE" };
      const status = map[e.key.toLowerCase()];
      if (status) handleScreen(selectedDocId, status);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedDocId, handleScreen]);

  async function handleBatchScreen(status: ScreeningStatus) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setSources((prev) => prev.map((s) => ({
      ...s,
      documents: s.documents.map((d) => selectedIds.has(d.id) ? { ...d, screening_status: status } : d),
    })));
    setSelectedIds(new Set());
    try {
      await fetch(`/api/projects/${projectId}/documents/batch-screen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_ids: ids, screening_status: status }),
      });
      await fetchData();
    } catch {
      toast.error('Failed to save changes');
      fetchData();
    }
  }

  async function handleFinalize() {
    setFinalizing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/corpus/finalize`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setFinalized(true);
      setShowFinalize(false);
      toast.success('Corpus finalized! Ready for extraction.');
    } catch {
      toast.error('Failed to finalize corpus');
    } finally {
      setFinalizing(false);
    }
  }

  function toggleSelect(docId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId); else next.add(docId);
      return next;
    });
  }

  function handleSelectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(filteredDocs.map(({ doc }) => doc.id)) : new Set());
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Stats bar */}
      <div className="bg-white border-b border-black/[0.06] px-5 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex gap-3 text-xs text-gray-500">
          <span><strong className="text-gray-900">{stats.total}</strong> total</span>
          <span>·</span>
          <span className="text-green-600"><strong>{stats.included}</strong> included</span>
          <span>·</span>
          <span className="text-red-500"><strong>{stats.excluded}</strong> excluded</span>
          <span>·</span>
          <span className="text-yellow-600"><strong>{stats.maybe}</strong> maybe</span>
          <span>·</span>
          <span><strong>{stats.pending}</strong> pending</span>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            + Add sources
          </button>
          {finalized ? (
            <span className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg border border-green-200">
              ✓ Corpus finalized →{" "}
              <a href={`/app/projects/${projectId}/extract`} className="underline font-medium">Extract insights</a>
            </span>
          ) : (
            <button
              onClick={() => setShowFinalize(true)}
              disabled={stats.included === 0}
              className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              Finalize corpus
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-black/[0.06] px-5 flex overflow-x-auto">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2",
              filter === key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={cn("flex-1 flex overflow-hidden", selectedDocId ? "divide-x divide-black/[0.06]" : "")}>
        {/* Document list */}
        <div className={cn("flex flex-col overflow-hidden", selectedDocId ? "w-[40%]" : "flex-1")}>
          {/* Batch bar */}
          {selectedIds.size > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-b border-black/[0.06] flex items-center gap-2 text-xs">
              <span className="text-gray-600">{selectedIds.size} selected</span>
              {SCREEN_ACTIONS.map(({ status, label }) => (
                <button key={status} onClick={() => handleBatchScreen(status)}
                  className="px-2 py-1 border border-gray-200 rounded text-gray-600 hover:bg-white transition-colors">
                  {label} all
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              {filter === "all" ? (
                <>
                  <p className="text-sm text-gray-500 mb-3">No sources yet. Add your first source to get started.</p>
                  <button onClick={() => setShowAdd(true)}
                    className="px-4 py-2 text-sm bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors">
                    + Add sources
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-400">No {filter} documents</p>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {/* Select all header */}
              <div className="px-4 py-2 border-b border-black/[0.04] flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filteredDocs.length > 0 && filteredDocs.every(({ doc }) => selectedIds.has(doc.id))}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-gray-400">{filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""}</span>
              </div>

              {filteredDocs.map(({ doc, source }) => {
                const tier = getRelevanceTier(doc.relevance_score);
                const isActive = doc.id === selectedDocId;
                const isProcessing = source.status === "PROCESSING" || source.status === "PENDING";

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(isActive ? null : doc.id)}
                    className={cn(
                      "px-4 py-3 border-b border-black/[0.04] cursor-pointer transition-colors flex items-start gap-3",
                      isActive ? "bg-gray-50" : "hover:bg-gray-50/60"
                    )}
                  >
                    <input type="checkbox" checked={selectedIds.has(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 rounded shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {doc.title ?? source.url ?? "Untitled"}
                        </span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">{source.type}</span>
                        {isProcessing ? (
                          <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded animate-pulse shrink-0">Processing…</span>
                        ) : tier ? (
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0", RELEVANCE_CLS[tier])}>
                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </span>
                        ) : null}
                      </div>
                      {doc.word_count !== null && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{doc.word_count} words</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {SCREEN_ACTIONS.map(({ status, label, cls, activeCls }) => (
                        <button key={status} onClick={() => handleScreen(doc.id, status)}
                          className={cn(
                            "px-2 py-0.5 text-[10px] border rounded transition-colors",
                            doc.screening_status === status ? activeCls : cls
                          )}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview panel */}
        {selectedDoc && (
          <div className="w-[60%] overflow-hidden">
            <DocumentPreview
              doc={selectedDoc.doc}
              source={selectedDoc.source}
              onScreen={handleScreen}
              onClose={() => setSelectedDocId(null)}
            />
          </div>
        )}
      </div>

      {showAdd && (
        <AddSourcesPanel
          projectId={projectId}
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); fetchData(); }}
        />
      )}

      {showFinalize && (
        <FinalizationModal
          includedCount={stats.included}
          pendingCount={stats.pending}
          onConfirm={handleFinalize}
          onCancel={() => setShowFinalize(false)}
          loading={finalizing}
        />
      )}
    </div>
  );
}
