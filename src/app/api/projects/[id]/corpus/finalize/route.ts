import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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
}
