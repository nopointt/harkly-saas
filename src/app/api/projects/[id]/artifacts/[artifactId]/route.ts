import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyProjectAuth } from '@/lib/api-auth'
import { ArtifactContent } from '@/types/artifacts'
import { Prisma } from '@/generated/prisma/client'

type RouteParams = { params: Promise<{ id: string; artifactId: string }> }

// ---------------------------------------------------------------------------
// GET /api/projects/[id]/artifacts/[artifactId]
// Returns artifact + all versions
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id, artifactId } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const artifact = await prisma.artifact.findUnique({
    where: { id: artifactId },
    include: {
      versions: { orderBy: { version: 'asc' } },
    },
  })

  if (!artifact || artifact.project_id !== id) {
    return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
  }

  const { versions, ...artifactData } = artifact
  return NextResponse.json({ artifact: artifactData, versions })
}

// ---------------------------------------------------------------------------
// PATCH /api/projects/[id]/artifacts/[artifactId]
// Body: { content: ArtifactContent }
// Creates new version and bumps current_version
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id, artifactId } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const existing = await prisma.artifact.findUnique({ where: { id: artifactId } })
  if (!existing || existing.project_id !== id) {
    return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { content } = (body as Record<string, unknown>) ?? {}
  if (!content || typeof content !== 'object') {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  const typedContent = content as ArtifactContent

  const artifact = await prisma.$transaction(async (tx) => {
    const nextVersion = existing.current_version + 1

    await tx.artifactVersion.create({
      data: {
        artifact_id: artifactId,
        version: nextVersion,
        content: typedContent as unknown as Prisma.InputJsonValue,
      },
    })

    return tx.artifact.update({
      where: { id: artifactId },
      data: {
        current_version: nextVersion,
        content: typedContent as unknown as Prisma.InputJsonValue,
      },
    })
  })

  return NextResponse.json({ artifact })
}
