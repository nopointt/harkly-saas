"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Artifact,
  EvidenceMapContent,
  EvidenceCell,
  EvidenceStrength,
} from "@/types/artifacts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EvidenceMapTabProps {
  artifact: Artifact | null;
  projectId: string;
  onGenerate: () => void;
  isGenerating: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function strengthStyles(strength: EvidenceStrength): {
  cell: string;
  label: string;
} {
  switch (strength) {
    case "strong":
      return {
        cell: "bg-green-100 text-green-800",
        label: "Strong",
      };
    case "moderate":
      return {
        cell: "bg-yellow-100 text-yellow-700",
        label: "Moderate",
      };
    case "weak":
      return {
        cell: "border border-yellow-400 text-yellow-600 bg-white",
        label: "Weak",
      };
    case "gap":
      return {
        cell: "border border-dashed border-red-400 text-red-500 bg-white",
        label: "Gap",
      };
  }
}

// ---------------------------------------------------------------------------
// Sub-component: EvidenceCell display
// ---------------------------------------------------------------------------

interface EvidenceCellDisplayProps {
  cell: EvidenceCell;
}

function EvidenceCellDisplay({ cell }: EvidenceCellDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { cell: cls, label } = strengthStyles(cell.strength);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-default select-none ${cls}`}
      >
        <span>{label}</span>
        {cell.fact_count > 0 && (
          <span className="opacity-70">({cell.fact_count})</span>
        )}
      </div>

      {/* Custom tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap shadow-lg">
          {cell.fact_count === 0
            ? "No facts support this"
            : `${cell.fact_count} fact${cell.fact_count === 1 ? "" : "s"} support this`}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EvidenceMapTab({
  artifact,
  projectId,
  onGenerate,
  isGenerating,
}: EvidenceMapTabProps) {
  const content =
    artifact?.status === "GENERATED" && artifact.content
      ? (artifact.content as EvidenceMapContent)
      : null;

  const handleExportMarkdown = () => {
    if (!artifact) return;
    window.open(
      `/api/projects/${projectId}/artifacts/${artifact.id}/export?format=markdown`
    );
  };

  // --- Empty states ---
  if (!artifact || artifact.status === "NOT_GENERATED") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-gray-400 text-sm">No Evidence Map generated yet.</p>
        <Button onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Evidence Map"}
        </Button>
      </div>
    );
  }

  if (artifact.status === "GENERATING" || isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Generating Evidence Map...</p>
      </div>
    );
  }

  if (artifact.status === "FAILED") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-500 text-sm">Generation failed.</p>
        <Button variant="outline" onClick={onGenerate} disabled={isGenerating}>
          Retry
        </Button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-gray-400 text-sm">No content available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {content.themes.length} themes &times; {content.frame_components.length}{" "}
          components
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportMarkdown}
            className="h-8 text-xs"
          >
            Export Markdown
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onGenerate}
            disabled={isGenerating}
            className="h-8 text-xs"
          >
            Regenerate
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/[0.06] overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-black/[0.06]">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 min-w-[140px]">
                Theme
              </th>
              {content.frame_components.map((comp) => (
                <th
                  key={comp}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap"
                >
                  {comp}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {content.matrix.map((row) => (
              <tr key={row.theme} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 text-sm whitespace-nowrap">
                  {row.theme}
                </td>
                {content.frame_components.map((comp) => {
                  const cell = row.components.find(
                    (c) => c.component === comp
                  );
                  if (!cell) {
                    return (
                      <td key={comp} className="px-4 py-3 text-center">
                        <span className="text-xs text-gray-300">—</span>
                      </td>
                    );
                  }
                  return (
                    <td key={comp} className="px-4 py-3">
                      <EvidenceCellDisplay cell={cell} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
        <span className="font-medium">Legend:</span>
        {(["strong", "moderate", "weak", "gap"] as EvidenceStrength[]).map(
          (s) => {
            const { cell: cls, label } = strengthStyles(s);
            return (
              <span
                key={s}
                className={`inline-flex items-center px-2 py-0.5 rounded ${cls}`}
              >
                {label}
              </span>
            );
          }
        )}
      </div>
    </div>
  );
}
