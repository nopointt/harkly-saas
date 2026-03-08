import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyProjectAuth } from '@/lib/api-auth'
import { Prisma } from '@/generated/prisma/client'

type RouteParams = { params: Promise<{ id: string; artifactId: string }> }

// ---------------------------------------------------------------------------
// POST /api/projects/[id]/artifacts/[artifactId]/restore
// Body: { version: number }
// Restores artifact to a previous version by creating a new version with that content
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest, { params }: RouteParams) {
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

  const { version } = (body as Record<string, unknown>) ?? {}
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    return NextResponse.json({ error: 'version must be a positive integer' }, { status: 400 })
  }

  const targetVersion = await prisma.artifactVersion.findUnique({
    where: { artifact_id_version: { artifact_id: artifactId, version } },
  })

  if (!targetVersion) {
    return NextResponse.json(
      { error: `Version ${version} not found for this artifact` },
      { status: 404 }
    )
  }

  const artifact = await prisma.$transaction(async (tx) => {
    const nextVersion = existing.current_version + 1

    await tx.artifactVersion.create({
      data: {
        artifact_id: artifactId,
        version: nextVersion,
        content: targetVersion.content as Prisma.InputJsonValue,
      },
    })

    return tx.artifact.update({
      where: { id: artifactId },
      data: {
        current_version: nextVersion,
        content: targetVersion.content as Prisma.InputJsonValue,
      },
    })
  })

  return NextResponse.json({ artifact })
}
