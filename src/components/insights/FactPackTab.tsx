"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Artifact,
  FactPackContent,
  FactItem,
} from "@/types/artifacts";
import VersionHistoryDrawer from "./VersionHistoryDrawer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FactPackTabProps {
  artifact: Artifact | null;
  projectId: string;
  onGenerate: () => void;
  onSave: (content: FactPackContent) => Promise<void>;
  isGenerating: boolean;
}

interface EditingFact {
  themeIdx: number;
  factIdx: number;
}

// ---------------------------------------------------------------------------
// Sub-component: FactRow
// ---------------------------------------------------------------------------

interface FactRowProps {
  fact: FactItem;
  themeIdx: number;
  factIdx: number;
  editing: EditingFact | null;
  onEditStart: (themeIdx: number, factIdx: number) => void;
  onEditChange: (text: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  editText: string;
}

function FactRow({
  fact,
  themeIdx,
  factIdx,
  editing,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  editText,
}: FactRowProps) {
  const isEditing =
    editing?.themeIdx === themeIdx && editing?.factIdx === factIdx;

  const confidencePct = Math.round(fact.confidence * 100);
  const confCls =
    fact.confidence >= 0.8
      ? "bg-green-100 text-green-700"
      : fact.confidence >= 0.6
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-500";

  return (
    <div className="flex items-start gap-2 py-2 border-b border-black/[0.04] last:border-0">
      {/* Decorative checkbox */}
      <div className="mt-0.5 w-4 h-4 rounded border border-gray-300 flex-shrink-0" />

      {/* Fact text / edit area */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Textarea
              value={editText}
              onChange={(e) => onEditChange(e.target.value)}
              className="text-sm resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onEditSave} className="h-7 text-xs">
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEditCancel}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <span
            className={`text-sm cursor-pointer hover:bg-gray-50 rounded px-1 -ml-1 transition-colors ${
              fact.contradicted ? "line-through text-gray-400" : "text-gray-800"
            }`}
            onClick={() => onEditStart(themeIdx, factIdx)}
            title="Click to edit"
          >
            {fact.text}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
        <span className="text-xs text-gray-400 max-w-[120px] truncate">
          {fact.source_title}
        </span>
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${confCls}`}
        >
          {confidencePct}%
        </span>
        {fact.is_metric && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
            metric
          </span>
        )}
        {fact.contradicted && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700">
            ⚠ contradicted
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FactPackTab({
  artifact,
  projectId,
  onGenerate,
  onSave,
  isGenerating,
}: FactPackTabProps) {
  const [editingFact, setEditingFact] = useState<EditingFact | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const content =
    artifact?.status === "GENERATED" && artifact.content
      ? (artifact.content as FactPackContent)
      : null;

  const handleEditStart = (themeIdx: number, factIdx: number) => {
    if (!content) return;
    setEditText(content.themes[themeIdx].facts[factIdx].text);
    setEditingFact({ themeIdx, factIdx });
  };

  const handleEditSave = async () => {
    if (!content || !editingFact) return;
    const { themeIdx, factIdx } = editingFact;
    const updatedContent: FactPackContent = {
      ...content,
      themes: content.themes.map((theme, ti) =>
        ti !== themeIdx
          ? theme
          : {
              ...theme,
              facts: theme.facts.map((fact, fi) =>
                fi !== factIdx ? fact : { ...fact, text: editText }
              ),
            }
      ),
    };
    setSaving(true);
    try {
      await onSave(updatedContent);
    } finally {
      setSaving(false);
      setEditingFact(null);
      setEditText("");
    }
  };

  const handleEditCancel = () => {
    setEditingFact(null);
    setEditText("");
  };

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
        <p className="text-gray-400 text-sm">No Fact Pack generated yet.</p>
        <Button onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Fact Pack"}
        </Button>
      </div>
    );
  }

  if (artifact.status === "GENERATING" || isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Generating Fact Pack...</p>
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
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {content.extraction_count} extractions
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {content.themes.reduce((acc, t) => acc + t.facts.length, 0)} facts
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setHistoryOpen(true)}
            className="h-8 text-xs"
          >
            History
          </Button>
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
            disabled={isGenerating || saving}
            className="h-8 text-xs"
          >
            Regenerate
          </Button>
        </div>
      </div>

      {/* Themes as collapsible sections */}
      <div className="flex flex-col gap-3">
        {content.themes.map((theme, themeIdx) => (
          <div
            key={themeIdx}
            className="bg-white rounded-2xl shadow-sm border border-black/[0.06] overflow-hidden"
          >
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm text-gray-900">
                    {theme.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {theme.facts.length} facts
                  </span>
                </div>
                <span className="text-gray-400 text-xs">▾</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-3">
                  {theme.facts.map((fact, factIdx) => (
                    <FactRow
                      key={factIdx}
                      fact={fact}
                      themeIdx={themeIdx}
                      factIdx={factIdx}
                      editing={editingFact}
                      editText={editText}
                      onEditStart={handleEditStart}
                      onEditChange={setEditText}
                      onEditSave={handleEditSave}
                      onEditCancel={handleEditCancel}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>

      {/* Version History Drawer */}
      {artifact && (
        <VersionHistoryDrawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          artifactId={artifact.id}
          projectId={projectId}
          onRestore={async () => {
            await Promise.resolve();
            setHistoryOpen(false);
          }}
        />
      )}
    </div>
  );
}
