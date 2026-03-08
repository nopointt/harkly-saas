import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyProjectAuth } from '@/lib/api-auth'
import { artifactToMarkdown } from '@/lib/artifacts/export'
import { ArtifactType, ArtifactContent } from '@/types/artifacts'

type RouteParams = { params: Promise<{ id: string; artifactId: string }> }

const VALID_FORMATS = new Set(['markdown', 'pdf'])

// ---------------------------------------------------------------------------
// GET /api/projects/[id]/artifacts/[artifactId]/export?format=markdown|pdf
// Returns file download
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id, artifactId } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const format = request.nextUrl.searchParams.get('format') ?? 'markdown'
  if (!VALID_FORMATS.has(format)) {
    return NextResponse.json({ error: 'format must be markdown or pdf' }, { status: 400 })
  }

  const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } })
  if (!artifact || artifact.project_id !== id) {
    return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
  }

  if (!artifact.content) {
    return NextResponse.json({ error: 'Artifact has no content to export' }, { status: 422 })
  }

  const project = await prisma.researchProject.findUnique({ where: { id } })
  const projectTitle = project?.title ?? 'Research Project'

  const markdownContent = artifactToMarkdown(
    artifact.artifact_type as ArtifactType,
    artifact.content as unknown as ArtifactContent,
    projectTitle
  )

  const typeSlug = artifact.artifact_type.toLowerCase().replace('_', '-')
  const dateSlug = new Date().toISOString().slice(0, 10)

  if (format === 'markdown') {
    const filename = `${typeSlug}-${dateSlug}.md`
    return new NextResponse(markdownContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  // PDF stub: return markdown content with pdf Content-Disposition
  // Real PDF generation (puppeteer / @react-pdf/renderer) deferred to E6
  const filename = `${typeSlug}-${dateSlug}.pdf`
  return new NextResponse(markdownContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
