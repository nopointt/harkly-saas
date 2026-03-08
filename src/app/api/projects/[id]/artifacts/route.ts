import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyProjectAuth } from '@/lib/api-auth'
import { generateArtifactContent } from '@/lib/artifacts/generate'
import { ArtifactType } from '@/types/artifacts'
import { Prisma } from '@/generated/prisma/client'

const VALID_ARTIFACT_TYPES: Set<string> = new Set(['FACT_PACK', 'EVIDENCE_MAP', 'EMPATHY_MAP'])

// ---------------------------------------------------------------------------
// GET /api/projects/[id]/artifacts
// Returns latest artifact per type for the project
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const artifacts = await prisma.artifact.findMany({
    where: { project_id: id },
    orderBy: { artifact_type: 'asc' },
  })

  return NextResponse.json({ artifacts })
}

// ---------------------------------------------------------------------------
// POST /api/projects/[id]/artifacts
// Body: { artifact_type: ArtifactType }
// Validates extraction_status === COMPLETED, generates mock content, persists.
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const project = await prisma.researchProject.findUnique({ where: { id } })
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Guard: extractions must be completed
  if (project.extraction_status !== 'COMPLETED') {
    return NextResponse.json(
      { error: 'Extractions must be COMPLETED before generating artifacts' },
      { status: 422 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { artifact_type } =
    (body as Record<string, unknown>) ?? {}

  if (typeof artifact_type !== 'string' || !VALID_ARTIFACT_TYPES.has(artifact_type)) {
    return NextResponse.json(
      { error: 'artifact_type must be FACT_PACK | EVIDENCE_MAP | EMPATHY_MAP' },
      { status: 400 }
    )
  }

  const validType = artifact_type as ArtifactType

  // Generate content synchronously (mock — no real LLM)
  const content = await generateArtifactContent(id, validType)

  // Upsert artifact record and create a new version atomically
  const artifact = await prisma.$transaction(async (tx) => {
    // Find or create artifact
    const existing = await tx.artifact.findUnique({
      where: { project_id_artifact_type: { project_id: id, artifact_type: validType } },
    })

    const nextVersion = existing ? existing.current_version + 1 : 1

    const upserted = await tx.artifact.upsert({
      where: { project_id_artifact_type: { project_id: id, artifact_type: validType } },
      create: {
        project_id: id,
        artifact_type: validType,
        status: 'GENERATED',
        current_version: 1,
        content: content as unknown as Prisma.InputJsonValue,
      },
      update: {
        status: 'GENERATED',
        current_version: nextVersion,
        content: content as unknown as Prisma.InputJsonValue,
      },
    })

    await tx.artifactVersion.create({
      data: {
        artifact_id: upserted.id,
        version: nextVersion,
        content: content as unknown as Prisma.InputJsonValue,
      },
    })

    return upserted
  })

  return NextResponse.json({ artifact }, { status: 202 })
}
