import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyProjectAuth } from '@/lib/api-auth'

// ---------------------------------------------------------------------------
// Keyword overlap scoring — shared tokens longer than 3 chars / min token set
// ---------------------------------------------------------------------------

function scoreOverlap(a: string, b: string): number {
  const tokenize = (s: string) =>
    s.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  const tokensA = new Set(tokenize(a))
  const tokensB = new Set(tokenize(b))
  const shared = [...tokensA].filter((t) => tokensB.has(t)).length
  return shared / Math.max(Math.min(tokensA.size, tokensB.size), 1)
}

// ---------------------------------------------------------------------------
// GET /api/projects/[id]/notes/related
// Query param: context_text (required)
// Returns top 3 notes by keyword overlap score, score must be > 0
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await verifyProjectAuth(id)
  if (!auth.ok) return auth.response

  const contextText = request.nextUrl.searchParams.get('context_text')

  if (!contextText || contextText.trim() === '') {
    return NextResponse.json(
      { error: 'context_text query parameter is required' },
      { status: 400 }
    )
  }

  const allNotes = await prisma.note.findMany({
    where: { project_id: id, user_id: auth.userId },
  })

  const scored = allNotes
    .map((note) => ({ note, score: scoreOverlap(contextText, note.content) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ note }) => note)

  return NextResponse.json({ notes: scored })
}
