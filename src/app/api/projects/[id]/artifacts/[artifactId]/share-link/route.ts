import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyProjectAuth } from '@/lib/api-auth'

type RouteParams = { params: Promise<{ id: string; artifactId: string }> }

const BASE_URL = 'https://harkly-saas.vercel.app'

// ---------------------------------------------------------------------------
// POST /api/projects/[id]/artifacts/[artifactId]/share-link
// Creates a ShareLink for the artifact. Returns 201 { share_link, url }.
// ---------------------------------------------------------------------------

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id, artifactId } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } })
  if (!artifact || artifact.project_id !== id) {
    return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
  }

  const shareLink = await prisma.shareLink.create({
    data: { artifact_id: artifactId },
  })

  const url = `${BASE_URL}/share/${shareLink.token}`

  return NextResponse.json({ share_link: shareLink, url }, { status: 201 })
}

// ---------------------------------------------------------------------------
// DELETE /api/projects/[id]/artifacts/[artifactId]/share-link
// Deletes all ShareLink records for this artifact. Returns 200 { success: true }.
// ---------------------------------------------------------------------------

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id, artifactId } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } })
  if (!artifact || artifact.project_id !== id) {
    return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
  }

  await prisma.shareLink.deleteMany({ where: { artifact_id: artifactId } })

  return NextResponse.json({ success: true })
}
