"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ResearchProjectSummary } from "@/types/framing";
import { CorpusPage as CorpusContent } from "@/components/corpus/CorpusPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default function CorpusPage({ params }: Props) {
  const { id } = use(params);
  const [project, setProject] = useState<ResearchProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data: { project: ResearchProjectSummary }) => setProject(data.project ?? null))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f0] flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading corpus...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f0] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-black/[0.06] px-6 py-3 flex items-center gap-3">
        <Link href="/app/dashboard" className="text-xs text-gray-400 hover:text-gray-600">
          ← Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <Link
          href={`/app/projects/${id}`}
          className="text-xs text-gray-400 hover:text-gray-600 truncate max-w-[160px]"
        >
          {project?.title ?? "Project"}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-xs font-medium text-gray-700">Corpus</span>
        <div className="ml-auto flex items-center gap-3">
          <Link href={`/app/projects/${id}/frame`} className="text-xs text-gray-400 hover:text-gray-600">
            ← Frame
          </Link>
          <Link href={`/app/projects/${id}/extract`} className="text-xs text-gray-400 hover:text-gray-600">
            Extract →
          </Link>
        </div>
      </div>

      {project ? (
        <CorpusContent
          projectId={id}
          corpusFinalized={project.corpus_finalized}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Project not found
        </div>
      )}
    </div>
  );
}
