"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ResearchProjectSummary, FrameType, PICOFrame, HMWFrame, IssueTreeFrame, FreeFormFrame, FrameData } from "@/types/framing";
import { FramingStudio } from "@/components/framing/FramingStudio";
import { cn } from "@/lib/utils";

const FRAME_LABELS: Record<FrameType, string> = {
  PICO: "PICO",
  HMW: "HMW",
  ISSUE_TREE: "Issue Tree",
  FREE_FORM: "Free-form",
};

function FrameSummary({ type, data }: { type: FrameType; data: FrameData }) {
  const entries = Object.entries(data as unknown as Record<string, string>).filter(([, v]) => v?.trim());

  const keyLabels: Record<string, string> = {
    p: "Population", i: "Intervention", c: "Comparison", o: "Outcome", t: "Time",
    hmw: "How Might We", user: "User", context: "Context", goal: "Goal", constraint: "Constraint",
    core_question: "Core Question", branch_1: "Branch 1", branch_2: "Branch 2", branch_3: "Branch 3", key_metrics: "Key Metrics",
    research_question: "Research Question", scope: "Scope", success_criteria: "Success Criteria",
  };

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{keyLabels[key] ?? key}</p>
          <p className="text-sm text-gray-800 mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );
}

interface FramePageProps {
  params: Promise<{ id: string }>;
}

export default function FramePage({ params }: FramePageProps) {
  const { id } = use(params);
  const [project, setProject] = useState<ResearchProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => setProject(data.project ?? null))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const DEMO_WORKSPACE_ID = "demo";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f0] flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading frame...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f0] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-black/[0.06] px-6 py-3 flex items-center gap-3">
        <Link href="/app/dashboard" className="text-xs text-gray-400 hover:text-gray-600">← Dashboard</Link>
        <span className="text-gray-300">/</span>
        <Link href={`/app/projects/${id}`} className="text-xs text-gray-400 hover:text-gray-600 truncate max-w-[200px]">
          {project?.title ?? "Project"}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-xs font-medium text-gray-700">Frame</span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 w-full">
        {/* Frame header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{project?.title}</h1>
            {project?.frame_type && (
              <span className="text-xs text-gray-500 mt-1 block">
                Framework: <strong>{FRAME_LABELS[project.frame_type]}</strong>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setEditOpen(true)}
            >
              Edit Frame
            </button>
            <Link
              href={`/app/projects/${id}/corpus`}
              className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Start gathering →
            </Link>
          </div>
        </div>

        {/* Frame content */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm">
          {project?.frame_data ? (
            <FrameSummary type={project.frame_type!} data={project.frame_data} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-4">No frame confirmed yet</p>
              <button
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-xl hover:bg-gray-700"
                onClick={() => setEditOpen(true)}
              >
                Set Frame
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Frame dialog */}
      {editOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <FramingStudio
              workspaceId={DEMO_WORKSPACE_ID}
              projectId={id}
              initialFrameType={project?.frame_type ?? "PICO"}
              initialFrameData={project?.frame_data ?? undefined}
              initialQuestion={project?.title ?? ""}
              onClose={() => { setEditOpen(false); load(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
