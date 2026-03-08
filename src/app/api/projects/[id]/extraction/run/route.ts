import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ExtractionType } from "@/generated/prisma/enums";

const MOCK_EXTRACTIONS: { type: ExtractionType; content: string }[] = [
  { type: "FACT", content: "Guest checkout reduces cart abandonment by up to 45% in controlled studies" },
  { type: "METRIC", content: "73% of mobile users abandon carts due to complex checkout flows" },
  { type: "QUOTE", content: "The checkout process felt too complicated and time-consuming" },
  { type: "THEME", content: "Payment friction" },
  { type: "FACT", content: "Unexpected shipping costs cited by 55% of abandoning shoppers" },
  { type: "METRIC", content: "One-click checkout increases conversion by 29% on average" },
  { type: "QUOTE", content: "I gave up when I saw the total with shipping" },
  { type: "THEME", content: "Trust and security concerns" },
  { type: "FACT", content: "Progress indicators reduce perceived checkout effort" },
  { type: "METRIC", content: "Mobile abandonment is 85% higher compared to desktop" },
];

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
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!project.corpus_finalized) {
    return NextResponse.json(
      { error: "Corpus must be finalized before extraction" },
      { status: 422 }
    );
  }

  const docs = await prisma.document.findMany({
    where: { project_id: id, screening_status: "INCLUDED" },
  });

  if (docs.length === 0) {
    return NextResponse.json(
      { error: "No included documents found for extraction" },
      { status: 422 }
    );
  }

  await prisma.researchProject.update({
    where: { id },
    data: { extraction_status: "RUNNING", extraction_total: docs.length, extraction_done: 0 },
  });

  let mockIndex = 0;
  let totalExtractions = 0;

  for (const doc of docs) {
    const count = 2 + (mockIndex % 3 === 0 ? 2 : mockIndex % 2);
    const extractionsForDoc: {
      project_id: string;
      document_id: string;
      extraction_type: ExtractionType;
      content: string;
      confidence: number;
      metadata: { position_hint: string };
    }[] = [];

    for (let i = 0; i < count; i++) {
      const mock = MOCK_EXTRACTIONS[mockIndex % MOCK_EXTRACTIONS.length];
      const confidence =
        Math.round((0.6 + Math.random() * 0.35) * 100) / 100;

      extractionsForDoc.push({
        project_id: id,
        document_id: doc.id,
        extraction_type: mock.type,
        content: mock.content,
        confidence,
        metadata: { position_hint: "main content" },
      });

      mockIndex++;
    }

    await prisma.extraction.createMany({ data: extractionsForDoc });
    await prisma.document.update({ where: { id: doc.id }, data: { extraction_processed: true } });
    totalExtractions += extractionsForDoc.length;
  }

  await prisma.researchProject.update({
    where: { id },
    data: { extraction_status: "COMPLETED", extraction_done: docs.length },
  });

  return NextResponse.json(
    { total: docs.length, created: totalExtractions },
    { status: 202 }
  );
}
