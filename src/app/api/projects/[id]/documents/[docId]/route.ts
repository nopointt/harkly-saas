import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyProjectAuth } from '@/lib/api-auth';

const VALID_STATUSES = ["PENDING", "INCLUDED", "EXCLUDED", "MAYBE", "FLAGGED"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await params;
  const auth = await verifyProjectAuth(id);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as {
    screening_status: string;
    screening_reason?: string;
  };

  if (!VALID_STATUSES.includes(body.screening_status)) {
    return NextResponse.json(
      { error: "Invalid screening_status" },
      { status: 400 }
    );
  }

  try {
    const document = await prisma.document.update({
      where: { id: docId, project_id: id },
      data: {
        screening_status: body.screening_status as
          | "PENDING"
          | "INCLUDED"
          | "EXCLUDED"
          | "MAYBE"
          | "FLAGGED",
        screening_reason: body.screening_reason ?? null,
      },
    });

    return NextResponse.json({ document });
  } catch (err) {
    console.error('[documents/[docId]] DB error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
