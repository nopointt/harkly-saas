"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Artifact,
  ArtifactType,
  FactPackContent,
  EmpathyMapContent,
} from "@/types/artifacts";
import FactPackTab from "./FactPackTab";
import EvidenceMapTab from "./EvidenceMapTab";
import EmpathyMapTab from "./EmpathyMapTab";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function tabStatusBadge(artifact: Artifact | undefined): {
  label: string;
  cls: string;
} {
  if (!artifact || artifact.status === "NOT_GENERATED") {
    return { label: "Not generated", cls: "text-gray-400" };
  }
  if (artifact.status === "GENERATING") {
    return { label: "Generating...", cls: "text-yellow-600 animate-pulse" };
  }
  if (artifact.status === "FAILED") {
    return { label: "Failed", cls: "text-red-500" };
  }
  return {
    label: `Generated ${formatDate(artifact.updated_at)}`,
    cls: "text-green-600",
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Project {
  id: string;
  title: string;
}

interface InsightCanvasPageProps {
  projectId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InsightCanvasPage({ projectId }: InsightCanvasPageProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<ArtifactType>("FACT_PACK");
  const [generating, setGenerating] = useState<ArtifactType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchArtifacts = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/artifacts`);
    if (res.ok) {
      const data = (await res.json()) as { artifacts: Artifact[] };
      setArtifacts(data.artifacts);
    }
  }, [projectId]);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      const data = (await res.json()) as { project: Project };
      setProject(data.project ?? null);
    }
  }, [projectId]);

  useEffect(() => {
    Promise.all([fetchArtifacts(), fetchProject()]).finally(() =>
      setLoading(false)
    );
  }, [fetchArtifacts, fetchProject]);

  // Poll while any artifact is generating
  useEffect(() => {
    const anyGenerating = artifacts.some((a) => a.status === "GENERATING");
    if (!anyGenerating) return;
    const timer = setInterval(fetchArtifacts, 3000);
    return () => clearInterval(timer);
  }, [artifacts, fetchArtifacts]);

  const handleGenerate = async (type: ArtifactType) => {
    setGenerating(type);
    try {
      await fetch(`/api/projects/${projectId}/artifacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artifact_type: type }),
      });
      await fetchArtifacts();
    } finally {
      setGenerating(null);
    }
  };

  const handleSaveFactPack = async (content: FactPackContent) => {
    const artifact = artifacts.find((a) => a.artifact_type === "FACT_PACK");
    if (!artifact) return;
    await fetch(`/api/projects/${projectId}/artifacts/${artifact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    await fetchArtifacts();
  };

  const handleSaveEmpathyMap = async (content: EmpathyMapContent) => {
    const artifact = artifacts.find((a) => a.artifact_type === "EMPATHY_MAP");
    if (!artifact) return;
    await fetch(`/api/projects/${projectId}/artifacts/${artifact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    await fetchArtifacts();
  };

  const getArtifact = (type: ArtifactType): Artifact | undefined =>
    artifacts.find((a) => a.artifact_type === type);

  const TABS: { key: ArtifactType; label: string }[] = [
    { key: "FACT_PACK", label: "Fact Pack" },
    { key: "EVIDENCE_MAP", label: "Evidence Map" },
    { key: "EMPATHY_MAP", label: "Empathy Map" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f0] flex items-center justify-center">
        <div className="text-sm text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f0] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-black/[0.06] px-6 py-4 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-900">
          {project?.title ?? "Insight Canvas"}
        </span>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-500">Insight Canvas</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 max-w-7xl w-full mx-auto">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ArtifactType)}
        >
          <TabsList className="mb-6 h-auto">
            {TABS.map(({ key, label }) => {
              const artifact = getArtifact(key);
              const badge = tabStatusBadge(artifact);
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex flex-col items-start gap-0.5 px-4 py-2 h-auto"
                >
                  <span className="text-sm font-medium">{label}</span>
                  <span className={`text-[10px] font-normal ${badge.cls}`}>
                    {badge.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="FACT_PACK">
            <FactPackTab
              artifact={getArtifact("FACT_PACK") ?? null}
              projectId={projectId}
              onGenerate={() => handleGenerate("FACT_PACK")}
              onSave={handleSaveFactPack}
              isGenerating={generating === "FACT_PACK"}
            />
          </TabsContent>

          <TabsContent value="EVIDENCE_MAP">
            <EvidenceMapTab
              artifact={getArtifact("EVIDENCE_MAP") ?? null}
              projectId={projectId}
              onGenerate={() => handleGenerate("EVIDENCE_MAP")}
              isGenerating={generating === "EVIDENCE_MAP"}
            />
          </TabsContent>

          <TabsContent value="EMPATHY_MAP">
            <EmpathyMapTab
              artifact={getArtifact("EMPATHY_MAP") ?? null}
              projectId={projectId}
              onGenerate={() => handleGenerate("EMPATHY_MAP")}
              onSave={handleSaveEmpathyMap}
              isGenerating={generating === "EMPATHY_MAP"}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
