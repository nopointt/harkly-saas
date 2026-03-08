import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyProjectAuth } from '@/lib/api-auth';

const VALID_STATUSES = ["PENDING", "INCLUDED", "EXCLUDED", "MAYBE", "FLAGGED"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await verifyProjectAuth(id);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as {
    document_ids: string[];
    screening_status: string;
  };

  if (!VALID_STATUSES.includes(body.screening_status)) {
    return NextResponse.json(
      { error: "Invalid screening_status" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.document.updateMany({
      where: {
        id: { in: body.document_ids },
        project_id: id,
      },
      data: {
        screening_status: body.screening_status as
          | "PENDING"
          | "INCLUDED"
          | "EXCLUDED"
          | "MAYBE"
          | "FLAGGED",
      },
    });

    return NextResponse.json({ updated: result.count });
  } catch (err) {
    console.error('[documents/batch-screen] DB error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
