"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCanvasState } from "./useCanvasState";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  corpus_finalized: boolean;
}

interface ProjectPickerProps {
  frameId: string;
}

export function ProjectPicker({ frameId }: ProjectPickerProps) {
  const params = useParams();
  const workspaceId = params?.workspaceId as string | undefined;
  const updateFrame = useCanvasState((s) => s.updateFrame);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/projects?workspace_id=${workspaceId}`)
      .then((r) => r.json())
      .then((d) => setProjects(d.projects ?? []))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const selectProject = (projectId: string) => {
    updateFrame(frameId, { projectId });
  };

  const createAndSelect = async () => {
    if (!newTitle.trim() || !workspaceId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId, title: newTitle.trim() }),
      });
      const data = await res.json();
      if (data.project) {
        updateFrame(frameId, { projectId: data.project.id });
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto">
      <p className="text-xs text-gray-500 font-medium">Select a research project</p>

      {loading && (
        <div className="text-xs text-gray-400">Loading projects...</div>
      )}

      {!loading && projects.length === 0 && (
        <div className="text-xs text-gray-400">No projects yet. Create one below.</div>
      )}

      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => selectProject(p.id)}
          className={cn(
            "text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors",
            "border-black/10 hover:border-blue-400 hover:bg-blue-50 text-gray-700"
          )}
        >
          {p.title}
        </button>
      ))}

      <div className="mt-2 border-t border-black/[0.06] pt-3">
        <p className="text-xs text-gray-400 mb-2">Or create new</p>
        <div className="flex gap-2">
          <input
            className="flex-1 text-xs border border-black/10 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400 placeholder:text-gray-400"
            placeholder="Project title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createAndSelect()}
          />
          <button
            onClick={createAndSelect}
            disabled={creating || !newTitle.trim()}
            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium disabled:opacity-40"
          >
            {creating ? "..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
