/**
 * API auth helpers — shared across all project-scoped routes.
 * Verifies session + project ownership in one call.
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export type AuthResult =
  | { ok: true; userId: string; projectId: string }
  | { ok: false; response: NextResponse }

/**
 * Verify that the current session owns the given project.
 * Returns { ok: true, userId, projectId } on success.
 * Returns { ok: false, response } with a 401 or 404 NextResponse on failure.
 */
export async function verifyProjectAuth(projectId: string): Promise<AuthResult> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const project = await prisma.researchProject.findUnique({
    where: { id: projectId, user_id: session.user.id },
  })

  if (!project) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Project not found' }, { status: 404 }),
    }
  }

  return { ok: true, userId: session.user.id, projectId }
}

/**
 * Verify session only (no project ownership check).
 * Used by /api/projects (list/create) where there is no project ID yet.
 */
export async function verifyAuth(): Promise<{ ok: true; userId: string } | { ok: false; response: NextResponse }> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { ok: true, userId: session.user.id }
}
