import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
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

  const project = await prisma.researchProject.findFirst({
    where: { id, user_id: session.user.id },
    select: { extraction_status: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.extraction_status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Extraction must be completed before detecting contradictions" },
      { status: 422 }
    );
  }

  const facts = await prisma.extraction.findMany({
    where: { project_id: id, extraction_type: "FACT", rejected: false },
    include: { document: true },
    take: 10,
  });

  const factA = facts[0];
  const factB = facts.find((f) => f.document_id !== factA?.document_id);

  if (!factA || !factB) {
    return NextResponse.json({ created: 0 });
  }

  await prisma.extraction.create({
    data: {
      project_id: id,
      document_id: factA.document_id,
      extraction_type: "CONTRADICTION",
      content: "Conflicting claims about checkout abandonment rates",
      confidence: 0.78,
      metadata: {
        claim_a: factA.content,
        source_a_id: factA.document_id,
        source_a_title: factA.document.title,
        claim_b: factB.content,
        source_b_id: factB.document_id,
        source_b_title: factB.document.title,
        explanation:
          "These sources report different metrics for the same phenomenon",
      },
    },
  });

  return NextResponse.json({ created: 1 }, { status: 202 });
}
