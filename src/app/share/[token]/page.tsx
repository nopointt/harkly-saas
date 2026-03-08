import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  ArtifactType,
  FactPackContent,
  EvidenceMapContent,
  EmpathyMapContent,
  ArtifactContent,
} from "@/types/artifacts"

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ token: string }>
}

const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  FACT_PACK: "Fact Pack",
  EVIDENCE_MAP: "Evidence Map",
  EMPATHY_MAP: "Empathy Map",
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params

  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: { artifact: true },
  })

  if (!shareLink) {
    return { title: "Not found — Harkly" }
  }

  const artifactLabel = ARTIFACT_LABELS[shareLink.artifact.artifact_type as ArtifactType]

  return {
    title: `${artifactLabel} — Shared via Harkly`,
    description: "Research artifact shared from Harkly desk research automation",
    openGraph: {
      title: `${artifactLabel} — Shared via Harkly`,
      description: "Research artifact shared from Harkly desk research automation",
      type: "article",
    },
  }
}

// ---------------------------------------------------------------------------
// Render helpers (read-only)
// ---------------------------------------------------------------------------

function FactPackView({ content }: { content: FactPackContent }) {
  return (
    <div className="flex flex-col gap-6">
      {content.themes.map((theme) => (
        <div key={theme.name}>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">{theme.name}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600 w-1/2">
                    Fact
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                    Source
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600 w-20">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {theme.facts.map((fact, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2 text-gray-800">
                      {fact.is_metric ? (
                        <strong>{fact.text}</strong>
                      ) : fact.contradicted ? (
                        <span className="line-through text-gray-400">{fact.text}</span>
                      ) : (
                        fact.text
                      )}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">
                      {fact.source_title}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-500">
                      {Math.round(fact.confidence * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

const STRENGTH_COLORS: Record<string, string> = {
  strong: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  weak: "bg-orange-100 text-orange-800",
  gap: "bg-red-100 text-red-700",
}

function EvidenceMapView({ content }: { content: EvidenceMapContent }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
              Theme
            </th>
            {content.frame_components.map((comp) => (
              <th
                key={comp}
                className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600"
              >
                {comp}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.matrix.map((row) => (
            <tr key={row.theme} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-3 py-2 font-medium text-gray-800">
                {row.theme}
              </td>
              {row.components.map((cell, i) => (
                <td key={i} className="border border-gray-200 px-3 py-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${STRENGTH_COLORS[cell.strength] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {cell.strength}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmpathyMapView({ content }: { content: EmpathyMapContent }) {
  const quadrants = [
    {
      key: "say",
      label: "SAY",
      items: content.say.map((i) => ({ text: i.text, source: i.source_title })),
      color: "border-blue-200 bg-blue-50",
      headerColor: "bg-blue-100 text-blue-800",
    },
    {
      key: "think",
      label: "THINK",
      items: content.think.map((i) => ({ text: i.text, source: i.source_title })),
      color: "border-purple-200 bg-purple-50",
      headerColor: "bg-purple-100 text-purple-800",
    },
    {
      key: "do",
      label: "DO",
      items: content.do.map((i) => ({ text: i.text, source: i.source_title })),
      color: "border-green-200 bg-green-50",
      headerColor: "bg-green-100 text-green-800",
    },
    {
      key: "feel",
      label: "FEEL",
      items: content.feel.map((i) => ({ text: i.text, source: i.source_title })),
      color: "border-orange-200 bg-orange-50",
      headerColor: "bg-orange-100 text-orange-800",
    },
  ]

  return (
    <div>
      {content.subject && (
        <p className="text-sm text-gray-500 mb-4">
          Subject: <strong className="text-gray-800">{content.subject}</strong>
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        {quadrants.map((q) => (
          <div
            key={q.key}
            className={`border rounded-xl overflow-hidden ${q.color}`}
          >
            <div className={`px-3 py-2 text-xs font-bold ${q.headerColor}`}>
              {q.label}
            </div>
            <ul className="px-3 py-2 flex flex-col gap-1">
              {q.items.length === 0 ? (
                <li className="text-xs text-gray-400 italic">No items</li>
              ) : (
                q.items.map((item, i) => (
                  <li key={i} className="text-xs text-gray-700">
                    {item.text}
                    {item.source && (
                      <span className="text-gray-400"> — {item.source}</span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function ArtifactReadOnly({
  artifactType,
  content,
}: {
  artifactType: ArtifactType
  content: ArtifactContent
}) {
  if (artifactType === "FACT_PACK") {
    return <FactPackView content={content as FactPackContent} />
  }
  if (artifactType === "EVIDENCE_MAP") {
    return <EvidenceMapView content={content as EvidenceMapContent} />
  }
  if (artifactType === "EMPATHY_MAP") {
    return <EmpathyMapView content={content as EmpathyMapContent} />
  }
  return null
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PublicSharePage({ params }: PageProps) {
  const { token } = await params

  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      artifact: {
        include: {
          project: true,
        },
      },
    },
  })

  if (!shareLink) {
    notFound()
  }

  const { artifact } = shareLink
  const { project } = artifact
  const artifactType = artifact.artifact_type as ArtifactType
  const artifactLabel = ARTIFACT_LABELS[artifactType]

  return (
    <div className="min-h-screen bg-[#faf8f0] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-black/[0.06] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">Harkly</span>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">Shared Research Artifact</span>
            <Badge variant="secondary">{artifactLabel}</Badge>
          </div>
          <Link
            href="/auth/register"
            className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sign up free →
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 w-full flex flex-col gap-6 flex-1">
        {/* Project title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{project.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {artifactLabel} · shared via Harkly
          </p>
        </div>

        {/* Artifact content */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm">
          {artifact.content ? (
            <ArtifactReadOnly
              artifactType={artifactType}
              content={artifact.content as unknown as ArtifactContent}
            />
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">
              This artifact has no content to display.
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>Created with Harkly · desk research automation</span>
          <Link
            href="/auth/register"
            className="text-gray-900 font-medium underline underline-offset-2 hover:text-gray-600"
          >
            Sign up →
          </Link>
        </div>
      </footer>
    </div>
  )
}
