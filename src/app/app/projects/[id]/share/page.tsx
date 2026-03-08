"use client"

import { useState, useEffect, useCallback, use } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShareLinkDialog } from "@/components/share/ShareLinkDialog"
import { copyToClipboard } from "@/utils/clipboard"
import { Artifact, ArtifactType } from "@/types/artifacts"
import { ResearchProjectSummary, FrameType } from "@/types/framing"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FRAME_LABELS: Record<FrameType, string> = {
  PICO: "PICO",
  HMW: "HMW",
  ISSUE_TREE: "Issue Tree",
  FREE_FORM: "Free-form",
}

const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  FACT_PACK: "Fact Pack",
  EVIDENCE_MAP: "Evidence Map",
  EMPATHY_MAP: "Empathy Map",
}

const ARTIFACT_TYPES: ArtifactType[] = ["FACT_PACK", "EVIDENCE_MAP", "EMPATHY_MAP"]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// ---------------------------------------------------------------------------
// Artifact Card
// ---------------------------------------------------------------------------

interface ArtifactCardProps {
  projectId: string
  artifactType: ArtifactType
  artifact: Artifact | undefined
}

function ArtifactCard({ projectId, artifactType, artifact }: ArtifactCardProps) {
  const [copying, setCopying] = useState(false)

  const handleDownloadMarkdown = () => {
    if (!artifact) return
    window.open(
      `/api/projects/${projectId}/artifacts/${artifact.id}/export?format=markdown`,
      "_blank"
    )
  }

  const handleDownloadPdf = () => {
    if (!artifact) return
    window.open(
      `/api/projects/${projectId}/artifacts/${artifact.id}/export?format=pdf`,
      "_blank"
    )
  }

  const handleCopyMarkdown = async () => {
    if (!artifact) return
    setCopying(true)
    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${artifact.id}/export?format=markdown`
      )
      if (!res.ok) {
        toast.error("Failed to fetch markdown")
        return
      }
      const text = await res.text()
      const success = await copyToClipboard(text)
      if (success) {
        toast.success("Copied to clipboard!")
      } else {
        toast.error("Failed to copy")
      }
    } catch {
      toast.error("Failed to copy")
    } finally {
      setCopying(false)
    }
  }

  const isGenerated = artifact && artifact.status === "GENERATED"
  const isGenerating = artifact?.status === "GENERATING"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{ARTIFACT_LABELS[artifactType]}</Badge>
            {isGenerating && (
              <span className="text-xs text-yellow-600 animate-pulse">Generating...</span>
            )}
            {isGenerated && artifact.updated_at && (
              <span className="text-xs text-green-600">
                Generated {formatDate(artifact.updated_at)}
              </span>
            )}
            {!isGenerated && !isGenerating && (
              <span className="text-xs text-gray-400">Not generated</span>
            )}
          </div>
        </div>
        <CardTitle>{ARTIFACT_LABELS[artifactType]}</CardTitle>
      </CardHeader>
      <CardContent>
        {isGenerated ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadMarkdown}
            >
              Download Markdown
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMarkdown}
              disabled={copying}
            >
              {copying ? "Copying..." : "Copy to clipboard"}
            </Button>
            <ShareLinkDialog
              artifactId={artifact.id}
              projectId={projectId}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">
              This artifact has not been generated yet.
            </p>
            <Link
              href={`/app/projects/${projectId}/canvas`}
              className="text-xs text-gray-900 underline underline-offset-2 hover:text-gray-600"
            >
              Generate in Canvas →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface SharePageProps {
  params: Promise<{ id: string }>
}

export default function SharePage({ params }: SharePageProps) {
  const { id } = use(params)
  const [project, setProject] = useState<ResearchProjectSummary | null>(null)
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [sourceCount, setSourceCount] = useState(0)
  const [extractionCount, setExtractionCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [projectRes, artifactsRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/artifacts`),
      ])

      if (projectRes.ok) {
        const data = (await projectRes.json()) as { project: ResearchProjectSummary & { extraction_total?: number; _count?: { sources?: number } } }
        setProject(data.project ?? null)
        setExtractionCount(data.project?.extraction_total ?? 0)
      }

      if (artifactsRes.ok) {
        const data = (await artifactsRes.json()) as { artifacts: Artifact[] }
        setArtifacts(data.artifacts ?? [])
      }

      // Fetch corpus sources count
      const sourcesRes = await fetch(`/api/projects/${id}/sources?limit=1`)
      if (sourcesRes.ok) {
        const data = (await sourcesRes.json()) as { total?: number; sources?: unknown[] }
        setSourceCount(data.total ?? data.sources?.length ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getArtifact = (type: ArtifactType): Artifact | undefined =>
    artifacts.find((a) => a.artifact_type === type)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f0] flex items-center justify-center">
        <div className="text-sm text-gray-400 animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f0] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-black/[0.06] px-6 py-3 flex items-center gap-3">
        <Link
          href="/app/dashboard"
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ← Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <Link
          href={`/app/projects/${id}`}
          className="text-xs text-gray-400 hover:text-gray-600 truncate max-w-[200px]"
        >
          {project?.title ?? "Project"}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-xs font-medium text-gray-700">Share</span>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 w-full flex flex-col gap-6">
        {/* Project summary card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg">
                  {project?.title ?? "Untitled Project"}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {project?.frame_type && (
                    <Badge variant="outline">
                      {FRAME_LABELS[project.frame_type]}
                    </Badge>
                  )}
                  {project?.created_at && (
                    <span className="text-xs text-gray-400">
                      Created {formatDate(project.created_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Corpus:{" "}
              <strong>{sourceCount}</strong> sources &nbsp;|&nbsp;{" "}
              <strong>{extractionCount}</strong> extractions
            </div>
          </CardContent>
        </Card>

        {/* Artifact cards */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-700">Research Artifacts</h2>
          {ARTIFACT_TYPES.map((type) => (
            <ArtifactCard
              key={type}
              projectId={id}
              artifactType={type}
              artifact={getArtifact(type)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
