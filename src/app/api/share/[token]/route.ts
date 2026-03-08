import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteParams = { params: Promise<{ token: string }> }

// ---------------------------------------------------------------------------
// GET /api/share/[token]
// Public endpoint — no auth required.
// Returns artifact + project info for a given share token.
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, { params }: RouteParams) {
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
    return NextResponse.json({ error: 'Link not found or expired' }, { status: 404 })
  }

  const { artifact } = shareLink
  const { project } = artifact

  return NextResponse.json({
    artifact: {
      id: artifact.id,
      artifact_type: artifact.artifact_type,
      content: artifact.content,
      current_version: artifact.current_version,
      status: artifact.status,
    },
    project: {
      title: project.title,
      frame_type: project.frame_type,
    },
  })
}
