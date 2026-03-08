import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyProjectAuth } from '@/lib/api-auth'

// ---------------------------------------------------------------------------
// PATCH /api/projects/[id]/notes/[noteId]
// Body: { content?: string, tags?: string[], linked_doc_ids?: string[] }
// Partial update — only provided fields are written
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const { id, noteId } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const existing = await prisma.note.findUnique({ where: { id: noteId } })
  if (!existing || existing.project_id !== id) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  if (existing.user_id !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const raw = (body as Record<string, unknown>) ?? {}

  const updateData: {
    content?: string
    tags?: string[]
    linked_doc_ids?: string[]
  } = {}

  if ('content' in raw) {
    if (typeof raw.content !== 'string' || (raw.content as string).trim() === '') {
      return NextResponse.json(
        { error: 'content must be a non-empty string' },
        { status: 400 }
      )
    }
    updateData.content = raw.content as string
  }

  if ('tags' in raw) {
    const t = raw.tags
    if (!Array.isArray(t) || !t.every((x) => typeof x === 'string')) {
      return NextResponse.json({ error: 'tags must be an array of strings' }, { status: 400 })
    }
    updateData.tags = t as string[]
  }

  if ('linked_doc_ids' in raw) {
    const d = raw.linked_doc_ids
    if (!Array.isArray(d) || !d.every((x) => typeof x === 'string')) {
      return NextResponse.json(
        { error: 'linked_doc_ids must be an array of strings' },
        { status: 400 }
      )
    }
    updateData.linked_doc_ids = d as string[]
  }

  const note = await prisma.note.update({
    where: { id: noteId },
    data: updateData,
  })

  return NextResponse.json({ note })
}

// ---------------------------------------------------------------------------
// DELETE /api/projects/[id]/notes/[noteId]
// Verifies ownership then hard-deletes the note
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const { id, noteId } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const existing = await prisma.note.findUnique({ where: { id: noteId } })
  if (!existing || existing.project_id !== id) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  if (existing.user_id !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.note.delete({ where: { id: noteId } })

  return NextResponse.json({ success: true })
}
