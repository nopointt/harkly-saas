import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyProjectAuth } from '@/lib/api-auth'

// ---------------------------------------------------------------------------
// GET /api/projects/[id]/notes
// Query params: search?: string, tag?: string
// Returns notes for the authenticated user ordered by created_at DESC
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? undefined
  const tag = searchParams.get('tag') ?? undefined

  const notes = await prisma.note.findMany({
    where: {
      project_id: id,
      user_id: auth.userId,
      ...(search
        ? { content: { contains: search, mode: 'insensitive' } }
        : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json({ notes })
}

// ---------------------------------------------------------------------------
// POST /api/projects/[id]/notes
// Body: { content: string, tags?: string[], linked_doc_ids?: string[] }
// Creates a new note; returns 201 with the created note
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { content, tags, linked_doc_ids } = (body as Record<string, unknown>) ?? {}

  if (typeof content !== 'string' || content.trim() === '') {
    return NextResponse.json(
      { error: 'content must be a non-empty string' },
      { status: 400 }
    )
  }

  const resolvedTags: string[] =
    Array.isArray(tags) && tags.every((t) => typeof t === 'string')
      ? (tags as string[])
      : []

  const resolvedLinkedDocIds: string[] =
    Array.isArray(linked_doc_ids) &&
    linked_doc_ids.every((d) => typeof d === 'string')
      ? (linked_doc_ids as string[])
      : []

  try {
    const note = await prisma.note.create({
      data: {
        project_id: id,
        user_id: auth.userId,
        content,
        tags: resolvedTags,
        linked_doc_ids: resolvedLinkedDocIds,
      },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (err) {
    console.error('[notes] DB error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
