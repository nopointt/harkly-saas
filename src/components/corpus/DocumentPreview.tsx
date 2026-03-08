"use client";

import { CorpusDocument, CorpusSource, ScreeningStatus } from "@/types/corpus";
import { cn } from "@/lib/utils";

const RELEVANCE_BADGE: Record<string, { label: string; cls: string }> = {
  high: { label: "High", cls: "bg-green-100 text-green-700" },
  medium: { label: "Medium", cls: "bg-yellow-100 text-yellow-700" },
  low: { label: "Low", cls: "bg-gray-100 text-gray-500" },
};

function getRelevanceTier(score: number | null): "high" | "medium" | "low" | null {
  if (score === null) return null;
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

const SCREEN_BUTTONS: { status: ScreeningStatus; label: string; cls: string; activeCls: string }[] = [
  { status: "INCLUDED", label: "Include (I)", cls: "border-green-200 text-green-600 hover:bg-green-50", activeCls: "bg-green-600 text-white border-green-600" },
  { status: "MAYBE", label: "Maybe (M)", cls: "border-yellow-200 text-yellow-600 hover:bg-yellow-50", activeCls: "bg-yellow-500 text-white border-yellow-500" },
  { status: "EXCLUDED", label: "Exclude (E)", cls: "border-red-200 text-red-500 hover:bg-red-50", activeCls: "bg-red-500 text-white border-red-500" },
];

interface Props {
  doc: CorpusDocument;
  source: CorpusSource;
  onScreen: (docId: string, status: ScreeningStatus) => void;
  onClose: () => void;
}

export function DocumentPreview({ doc, source, onScreen, onClose }: Props) {
  const tier = getRelevanceTier(doc.relevance_score);
  const badge = tier ? RELEVANCE_BADGE[tier] : null;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-black/[0.06] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 truncate">{doc.title ?? "Untitled"}</h2>
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline truncate block mt-0.5"
            >
              {source.url}
            </a>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0 text-xl leading-none">
          ×
        </button>
      </div>

      {/* Meta */}
      <div className="px-5 py-3 border-b border-black/[0.06] flex flex-wrap gap-2 items-center">
        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
          {source.type}
        </span>
        {doc.word_count !== null && (
          <span className="text-xs text-gray-400">{doc.word_count} words</span>
        )}
        {badge && doc.relevance_score !== null && (
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", badge.cls)}>
            {badge.label} · {Math.round(doc.relevance_score * 100)}%
          </span>
        )}
        {!badge && <span className="text-xs text-gray-400">Unscored</span>}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{doc.content}</p>
      </div>

      {/* Screening */}
      <div className="px-5 py-4 border-t border-black/[0.06] flex gap-2">
        {SCREEN_BUTTONS.map(({ status, label, cls, activeCls }) => (
          <button
            key={status}
            onClick={() => onScreen(doc.id, status)}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-medium border rounded-lg transition-colors",
              doc.screening_status === status ? activeCls : cls
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
