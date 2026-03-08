"use client";

import { useState, useEffect, use } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ResearchProjectSummary, FrameType } from "@/types/framing";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "frame", label: "Frame", href: (id: string) => `/app/projects/${id}/frame` },
  { key: "corpus", label: "Corpus", href: (id: string) => `/app/projects/${id}/corpus` },
  { key: "extract", label: "Extract", href: (id: string) => `/app/projects/${id}/extract` },
  { key: "canvas", label: "Insight Canvas", href: (id: string) => `/app/projects/${id}/canvas` },
  { key: "notebook", label: "Notebook", href: (id: string) => `/app/projects/${id}/notebook` },
  { key: "share", label: "Share", href: (id: string) => `/app/projects/${id}/share` },
];

const FRAME_LABELS: Record<FrameType, string> = {
  PICO: "PICO",
  HMW: "HMW",
  ISSUE_TREE: "Issue Tree",
  FREE_FORM: "Free-form",
};

interface ProjectLayoutProps {
  params: Promise<{ id: string }>;
  children?: React.ReactNode;
}

export default function ProjectPage({ params }: ProjectLayoutProps) {
  const { id } = use(params);
  const pathname = usePathname();
  const [project, setProject] = useState<ResearchProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => setProject(data.project ?? null))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f0] flex items-center justify-center">
        <div className="text-sm text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#faf8f0] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Project not found</p>
        <Link href="/app/dashboard" className="text-sm text-gray-900 underline">Back to dashboard</Link>
      </div>
    );
  }

  const activeSection = pathname.split("/").pop() ?? "frame";

  return (
    <div className="min-h-screen bg-[#faf8f0] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-black/[0.06] px-6 py-3 flex items-center gap-3">
        <Link href="/app/dashboard" className="text-xs text-gray-400 hover:text-gray-600">← Dashboard</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{project.title}</span>
        {project.frame_type && (
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {FRAME_LABELS[project.frame_type]}
          </span>
        )}
      </div>

      <div className="flex flex-1">
        {/* Left sidebar */}
        <div className="w-48 bg-white border-r border-black/[0.06] pt-6 flex flex-col">
          <nav className="flex flex-col gap-0.5 px-2">
            {NAV_ITEMS.map(({ key, label, href }) => (
              <Link
                key={key}
                href={href(id)}
                className={cn(
                  "px-3 py-2 text-xs rounded-lg transition-colors",
                  activeSection === key
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content: redirect to /frame by default */}
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          <div className="text-center">
            <p className="mb-3">Select a section from the sidebar</p>
            <Link href={`/app/projects/${id}/frame`} className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg">
              View Frame →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
