"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FrameType,
  FrameData,
  EMPTY_FRAMES,
  isFrameComplete,
  PICOFrame,
  HMWFrame,
  IssueTreeFrame,
  FreeFormFrame,
} from "@/types/framing";
import { PICOFields, HMWFields, IssueTreeFields, FreeFormFields } from "./FrameFields";
import { cn } from "@/lib/utils";

const TABS: { type: FrameType; label: string }[] = [
  { type: "PICO", label: "PICO" },
  { type: "HMW", label: "HMW" },
  { type: "ISSUE_TREE", label: "Issue Tree" },
  { type: "FREE_FORM", label: "Free-form" },
];

interface FramingStudioProps {
  initialQuestion?: string;
  workspaceId: string;
  projectId?: string;   // set when editing existing project
  initialFrameType?: FrameType;
  initialFrameData?: FrameData;
  onClose: () => void;
}

export function FramingStudio({
  initialQuestion = "",
  workspaceId,
  projectId,
  initialFrameType = "PICO",
  initialFrameData,
  onClose,
}: FramingStudioProps) {
  const router = useRouter();
  const [question, setQuestion] = useState(initialQuestion);
  const [activeTab, setActiveTab] = useState<FrameType>(initialFrameType);
  const [frames, setFrames] = useState<Record<FrameType, FrameData>>({
    PICO: initialFrameData && initialFrameType === "PICO" ? initialFrameData : { ...EMPTY_FRAMES.PICO },
    HMW: initialFrameData && initialFrameType === "HMW" ? initialFrameData : { ...EMPTY_FRAMES.HMW },
    ISSUE_TREE: initialFrameData && initialFrameType === "ISSUE_TREE" ? initialFrameData : { ...EMPTY_FRAMES.ISSUE_TREE },
    FREE_FORM: initialFrameData && initialFrameType === "FREE_FORM" ? initialFrameData : { ...EMPTY_FRAMES.FREE_FORM },
  });
  const [suggesting, setSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentFrame = frames[activeTab];
  const canConfirm = isFrameComplete(activeTab, currentFrame);

  const updateCurrentFrame = useCallback((data: FrameData) => {
    setFrames((prev) => ({ ...prev, [activeTab]: data }));
  }, [activeTab]);

  const handleSuggest = useCallback(async () => {
    if (!question.trim()) return;
    setSuggesting(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/frame-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), frame_type: activeTab }),
      });
      if (!res.ok) throw new Error("AI suggestion failed");
      const { suggestion } = await res.json();
      setFrames((prev) => ({ ...prev, [activeTab]: suggestion }));
    } catch {
      setError("AI suggestion unavailable. Fill in the fields manually.");
    } finally {
      setSuggesting(false);
    }
  }, [question, activeTab]);

  const handleConfirm = useCallback(async () => {
    if (!canConfirm) return;
    setSaving(true);
    setError(null);
    try {
      if (projectId) {
        // Edit mode: update existing project
        const res = await fetch(`/api/projects/${projectId}/frame`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frame_type: activeTab, frame_data: currentFrame }),
        });
        if (!res.ok) throw new Error("Failed to save frame");
        router.push(`/app/projects/${projectId}/frame`);
        router.refresh();
        onClose();
      } else {
        // New project
        const createRes = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspace_id: workspaceId, title: question.trim() || "Untitled Research" }),
        });
        if (!createRes.ok) throw new Error("Failed to create project");
        const { project } = await createRes.json();

        const frameRes = await fetch(`/api/projects/${project.id}/frame`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frame_type: activeTab, frame_data: currentFrame }),
        });
        if (!frameRes.ok) throw new Error("Failed to save frame");

        router.push(`/app/projects/${project.id}/frame`);
        router.refresh();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [canConfirm, projectId, workspaceId, activeTab, currentFrame, question, router, onClose]);

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {projectId ? "Edit Frame" : "Frame your research"}
        </h2>
        <div className="flex gap-2">
          <input
            className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
            placeholder="What are you researching? (e.g. Why do users abandon checkout?)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            className="px-3 py-2 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors whitespace-nowrap"
            onClick={handleSuggest}
            disabled={suggesting || !question.trim()}
          >
            {suggesting ? "Thinking..." : "✦ AI suggest"}
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-gray-100 px-6">
        {TABS.map(({ type, label }) => (
          <button
            key={type}
            className={cn(
              "px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors",
              activeTab === type
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
            onClick={() => setActiveTab(type)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Frame fields */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {suggesting ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === "PICO" && (
              <PICOFields data={currentFrame as PICOFrame} onChange={updateCurrentFrame} />
            )}
            {activeTab === "HMW" && (
              <HMWFields data={currentFrame as HMWFrame} onChange={updateCurrentFrame} />
            )}
            {activeTab === "ISSUE_TREE" && (
              <IssueTreeFields data={currentFrame as IssueTreeFrame} onChange={updateCurrentFrame} />
            )}
            {activeTab === "FREE_FORM" && (
              <FreeFormFields data={currentFrame as FreeFormFrame} onChange={updateCurrentFrame} />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        {error && <p className="text-xs text-red-500">{error}</p>}
        {!error && <span className="text-xs text-gray-400">Fill required fields (*) to confirm</span>}
        <div className="flex gap-2 ml-auto">
          <button
            className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
            onClick={handleConfirm}
            disabled={!canConfirm || saving}
          >
            {saving ? "Saving..." : "Confirm Frame →"}
          </button>
        </div>
      </div>
    </div>
  );
}
