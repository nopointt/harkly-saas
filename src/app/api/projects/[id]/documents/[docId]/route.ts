import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["PENDING", "INCLUDED", "EXCLUDED", "MAYBE", "FLAGGED"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, docId } = await params;

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
}
