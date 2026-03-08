"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Artifact, EmpathyMapContent, EmpathyItem } from "@/types/artifacts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EmpathyQuadrant = "say" | "think" | "do" | "feel";

interface EmpathyMapTabProps {
  artifact: Artifact | null;
  projectId: string;
  onGenerate: () => void;
  onSave: (content: EmpathyMapContent) => Promise<void>;
  isGenerating: boolean;
}

interface QuadrantConfig {
  key: EmpathyQuadrant;
  icon: string;
  label: string;
  headerCls: string;
  borderCls: string;
}

type EmpathyMapItem = EmpathyItem | Omit<EmpathyItem, 'is_quote'>

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUADRANTS: QuadrantConfig[] = [
  {
    key: "say",
    icon: "💬",
    label: "SAY",
    headerCls: "bg-blue-50 border-blue-100",
    borderCls: "border-blue-100",
  },
  {
    key: "think",
    icon: "💭",
    label: "THINK",
    headerCls: "bg-purple-50 border-purple-100",
    borderCls: "border-purple-100",
  },
  {
    key: "do",
    icon: "🎯",
    label: "DO",
    headerCls: "bg-orange-50 border-orange-100",
    borderCls: "border-orange-100",
  },
  {
    key: "feel",
    icon: "❤️",
    label: "FEEL",
    headerCls: "bg-pink-50 border-pink-100",
    borderCls: "border-pink-100",
  },
];

// ---------------------------------------------------------------------------
// Sub-component: QuadrantCard
// ---------------------------------------------------------------------------

interface QuadrantCardProps {
  config: QuadrantConfig;
  items: EmpathyMapItem[];
  editMode: boolean;
  onDelete: (idx: number) => void;
  onAdd: (text: string) => void;
  onEdit: (idx: number, text: string) => void;
}

function QuadrantCard({
  config,
  items,
  editMode,
  onDelete,
  onAdd,
  onEdit,
}: QuadrantCardProps) {
  const [addText, setAddText] = useState("");
  const [editValues, setEditValues] = useState<Record<number, string>>({});

  const handleAdd = () => {
    const trimmed = addText.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setAddText("");
  };

  const handleEditChange = (idx: number, value: string) => {
    setEditValues((prev) => ({ ...prev, [idx]: value }));
  };

  const handleEditBlur = (idx: number) => {
    const value = editValues[idx];
    if (value !== undefined) {
      onEdit(idx, value);
      setEditValues((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border ${config.borderCls} flex flex-col overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 border-b ${config.headerCls} flex items-center gap-2`}
      >
        <span className="text-base">{config.icon}</span>
        <span className="font-semibold text-sm text-gray-800">
          {config.label}
        </span>
        <span className="text-xs text-gray-400 ml-auto">
          {items.length} items
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-2 min-h-[120px] max-h-[280px] overflow-y-auto">
        {items.length === 0 && (
          <p className="text-xs text-gray-300 text-center py-4">No items yet</p>
        )}
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 group rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              {editMode ? (
                <Textarea
                  value={
                    editValues[idx] !== undefined ? editValues[idx] : item.text
                  }
                  onChange={(e) => handleEditChange(idx, e.target.value)}
                  onBlur={() => handleEditBlur(idx)}
                  className="text-xs resize-none min-h-[60px]"
                  rows={2}
                />
              ) : (
                <p className="text-xs text-gray-700 leading-relaxed">
                  {config.key === "say" && (item as EmpathyItem).is_quote
                    ? `"${item.text}"`
                    : item.text}
                </p>
              )}
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                {item.source_title}
              </p>
            </div>
            <button
              onClick={() => onDelete(idx)}
              className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 mt-0.5 text-sm"
              title="Delete item"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add item */}
      <div className="px-4 py-3 border-t border-black/[0.04] flex gap-2">
        <Input
          value={addText}
          onChange={(e) => setAddText(e.target.value)}
          placeholder="Add item..."
          className="text-xs h-7 flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          className="h-7 px-2 text-xs"
        >
          Add
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EmpathyMapTab({
  artifact,
  projectId,
  onGenerate,
  onSave,
  isGenerating,
}: EmpathyMapTabProps) {
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState<EmpathyMapContent | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const rawContent =
    artifact?.status === "GENERATED" && artifact.content
      ? (artifact.content as EmpathyMapContent)
      : null;

  const content = localContent ?? rawContent;

  const handleExportMarkdown = () => {
    if (!artifact) return;
    window.open(
      `/api/projects/${projectId}/artifacts/${artifact.id}/export?format=markdown`
    );
  };

  const updateContent = (
    quadrant: EmpathyQuadrant,
    updater: (items: EmpathyMapItem[]) => EmpathyMapItem[]
  ) => {
    if (!content) return;
    const base: EmpathyMapContent = localContent ?? rawContent!;
    setLocalContent({
      ...base,
      [quadrant]: updater(base[quadrant] as EmpathyMapItem[]),
    });
  };

  const handleDelete = (quadrant: EmpathyQuadrant, idx: number) => {
    updateContent(quadrant, (items) => items.filter((_, i) => i !== idx));
  };

  const handleAdd = (quadrant: EmpathyQuadrant, text: string) => {
    updateContent(quadrant, (items) => [
      ...items,
      {
        text,
        source_document_id: "",
        source_title: "Manual entry",
        ...(quadrant === "say" ? { is_quote: false } : {}),
      },
    ]);
  };

  const handleEdit = (quadrant: EmpathyQuadrant, idx: number, text: string) => {
    updateContent(quadrant, (items) =>
      items.map((item, i) => (i === idx ? { ...item, text } : item))
    );
  };

  const handleSave = async () => {
    if (!localContent) return;
    setSaving(true);
    try {
      await onSave(localContent);
      setLocalContent(null);
    } finally {
      setSaving(false);
    }
  };

  // --- Empty states ---
  if (!artifact || artifact.status === "NOT_GENERATED") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-gray-400 text-sm">No Empathy Map generated yet.</p>
        <Button onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Empathy Map"}
        </Button>
      </div>
    );
  }

  if (artifact.status === "GENERATING" || isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Generating Empathy Map...</p>
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            About:{" "}
            <span className="font-medium text-gray-800">{content.subject}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {localContent && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="h-8 text-xs"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditMode((v) => !v)}
            className="h-8 text-xs"
          >
            {editMode ? "Exit edit mode" : "Edit mode"}
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
            disabled={isGenerating}
            className="h-8 text-xs"
          >
            Regenerate
          </Button>
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 grid-rows-2 gap-4">
        {QUADRANTS.map((config) => {
          const items = (content[config.key] as EmpathyMapItem[]) ?? [];
          return (
            <QuadrantCard
              key={config.key}
              config={config}
              items={items}
              editMode={editMode}
              onDelete={(idx) => handleDelete(config.key, idx)}
              onAdd={(text) => handleAdd(config.key, text)}
              onEdit={(idx, text) => handleEdit(config.key, idx, text)}
            />
          );
        })}
      </div>
    </div>
  );
}
