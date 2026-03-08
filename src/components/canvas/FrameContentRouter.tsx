"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CanvasFrame } from "@/types/canvas";
import { FrameType, FrameData, ResearchProjectSummary } from "@/types/framing";
import { useCanvasState } from "./useCanvasState";
import { ProjectPicker } from "./ProjectPicker";
import { FramingStudio } from "@/components/framing/FramingStudio";
import { CorpusPage } from "@/components/corpus/CorpusPage";
import ExtractPage from "@/components/extract/ExtractPage";

// FrameType values supported by FramingStudio (subset of Prisma enum)
const FRAMING_STUDIO_TYPES = new Set<string>(["PICO", "HMW", "ISSUE_TREE", "FREE_FORM"]);

interface FrameContentRouterProps {
  frame: CanvasFrame;
}

export function FrameContentRouter({ frame }: FrameContentRouterProps) {
  const params = useParams();
  const workspaceId = (params?.workspaceId as string | undefined) ?? "";
  const removeFrame = useCanvasState((s) => s.removeFrame);
  const [project, setProject] = useState<ResearchProjectSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!frame.projectId) return;
    setLoading(true);
    fetch(`/api/projects/${frame.projectId}`)
      .then((r) => r.json())
      .then((d) => setProject(d.project ?? null))
      .finally(() => setLoading(false));
  }, [frame.projectId]);

  // No project selected yet — show picker
  if (!frame.projectId) {
    return <ProjectPicker frameId={frame.id} />;
  }

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-400">
        Loading...
      </div>
    );
  }

  const frameType = project.frame_type && FRAMING_STUDIO_TYPES.has(project.frame_type)
    ? (project.frame_type as FrameType)
    : undefined;

  switch (frame.module) {
    case "framing-studio":
      return (
        <FramingStudio
          workspaceId={workspaceId}
          projectId={frame.projectId}
          initialFrameType={frameType}
          initialFrameData={project.frame_data as FrameData | undefined}
          onClose={() => removeFrame(frame.id)}
        />
      );

    case "corpus-triage":
      return (
        <CorpusPage
          projectId={frame.projectId}
          corpusFinalized={project.corpus_finalized}
        />
      );

    case "evidence-extractor":
      return (
        <ExtractPage
          projectId={frame.projectId}
          corpusFinalized={project.corpus_finalized}
          projectTitle={project.title}
        />
      );

    case "insight-canvas":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-6">
          <span className="text-2xl">🗺</span>
          <p className="text-sm font-medium text-gray-700">Insight Canvas</p>
          <p className="text-xs text-gray-400">Coming in E4</p>
        </div>
      );

    case "research-notebook":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-6">
          <span className="text-2xl">📓</span>
          <p className="text-sm font-medium text-gray-700">Research Notebook</p>
          <p className="text-xs text-gray-400">Coming in E5</p>
        </div>
      );

    default:
      return null;
  }
}
