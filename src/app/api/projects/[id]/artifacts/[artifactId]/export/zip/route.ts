import { NextRequest, NextResponse } from 'next/server'
import { strToU8, zipSync } from 'fflate'
import { prisma } from '@/lib/prisma'
import { verifyProjectAuth } from '@/lib/api-auth'
import { artifactToMarkdown } from '@/lib/artifacts/export'
import { ArtifactType, ArtifactContent } from '@/types/artifacts'

type RouteParams = { params: Promise<{ id: string; artifactId: string }> }

// ---------------------------------------------------------------------------
// GET /api/projects/[id]/artifacts/[artifactId]/export/zip
// Auth required. Bundles all GENERATED artifacts for the project into a ZIP.
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const project = await prisma.researchProject.findUnique({ where: { id } })
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const artifacts = await prisma.artifact.findMany({
    where: { project_id: id, status: 'GENERATED' },
  })

  const files: Record<string, Uint8Array> = {}

  for (const artifact of artifacts) {
    if (!artifact.content) continue

    const markdownContent = artifactToMarkdown(
      artifact.artifact_type as ArtifactType,
      artifact.content as unknown as ArtifactContent,
      project.title
    )

    const typeSlug = artifact.artifact_type.toLowerCase().replace(/_/g, '-')
    files[`${typeSlug}.md`] = strToU8(markdownContent)
  }

  const zipped = zipSync(files)
  const buffer = zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength) as ArrayBuffer

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="harkly-export.zip"`,
    },
  })
}
