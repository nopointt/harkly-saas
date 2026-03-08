"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ResearchProjectSummary, FrameType } from "@/types/framing";
import { FramingStudio } from "@/components/framing/FramingStudio";
import { Omnibar } from "@/components/omnibar/Omnibar";
import { cn } from "@/lib/utils";

const FRAME_LABELS: Record<FrameType, string> = {
  PICO: "PICO",
  HMW: "HMW",
  ISSUE_TREE: "Issue Tree",
  FREE_FORM: "Free-form",
};

const FRAME_COLORS: Record<FrameType, string> = {
  PICO: "bg-blue-50 text-blue-700",
  HMW: "bg-purple-50 text-purple-700",
  ISSUE_TREE: "bg-orange-50 text-orange-700",
  FREE_FORM: "bg-gray-100 text-gray-600",
};

const STATUS_COLORS = {
  NOT_STARTED: "bg-gray-100 text-gray-500",
  RUNNING: "bg-yellow-50 text-yellow-700",
  COMPLETED: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-600",
};

// Hardcoded demo workspace — in production this comes from session
const DEMO_WORKSPACE_ID = "demo";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ResearchProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/projects?workspace_id=${DEMO_WORKSPACE_ID}`)
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const handleArchive = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#faf8f0]">
      <Omnibar workspaceId={DEMO_WORKSPACE_ID} />

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Your Research</h1>
            <p className="text-sm text-gray-500 mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
              {" · "}
              <kbd className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded font-mono">⌘K</kbd> to start new
            </p>
          </div>
          <button
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
            onClick={() => setNewProjectOpen(true)}
          >
            + New Research
          </button>
        </div>
      </div>

      {/* Projects grid */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-white/70 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">✦</div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">Start your first research</h2>
            <p className="text-sm text-gray-400 mb-6">Frame a question, gather sources, extract insights</p>
            <button
              className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-700 transition-colors"
              onClick={() => setNewProjectOpen(true)}
            >
              New Research
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.06] cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => router.push(`/app/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    {project.frame_type && (
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", FRAME_COLORS[project.frame_type])}>
                        {FRAME_LABELS[project.frame_type]}
                      </span>
                    )}
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full", STATUS_COLORS[project.extraction_status])}>
                      {project.extraction_status.replace("_", " ")}
                    </span>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 text-xs transition-all"
                    onClick={(e) => { e.stopPropagation(); handleArchive(project.id); }}
                    title="Delete project"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{project.title}</h3>
                <p className="text-[11px] text-gray-400">
                  {new Date(project.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New project dialog */}
      {newProjectOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setNewProjectOpen(false); }}
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <FramingStudio
              workspaceId={DEMO_WORKSPACE_ID}
              onClose={() => setNewProjectOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
