import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyProjectAuth } from '@/lib/api-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await verifyProjectAuth(id);
  if (!auth.ok) return auth.response;

  try {
    const includedCount = await prisma.document.count({
      where: {
        project_id: id,
        screening_status: "INCLUDED",
      },
    });

    if (includedCount === 0) {
      return NextResponse.json(
        {
          error:
            "No included documents. Include at least one document before finalizing.",
        },
        { status: 422 }
      );
    }

    const project = await prisma.researchProject.update({
      where: { id },
      data: {
        corpus_finalized: true,
        corpus_finalized_at: new Date(),
      },
    });

    return NextResponse.json({ project, included_count: includedCount });
  } catch (err) {
    console.error('[corpus/finalize] DB error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
