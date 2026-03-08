import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["PENDING", "INCLUDED", "EXCLUDED", "MAYBE", "FLAGGED"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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
}
