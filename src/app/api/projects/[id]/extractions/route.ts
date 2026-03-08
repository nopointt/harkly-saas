import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ExtractionType } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";

const VALID_EXTRACTION_TYPES = new Set<string>([
  "FACT",
  "METRIC",
  "QUOTE",
  "THEME",
  "CONTRADICTION",
]);

export async function GET(
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

  const searchParams = request.nextUrl.searchParams;
  const typeParam = searchParams.get("type");
  const statusParam = searchParams.get("status");

  const where: Prisma.ExtractionWhereInput = { project_id: id };

  if (typeParam && VALID_EXTRACTION_TYPES.has(typeParam)) {
    where.extraction_type = typeParam as ExtractionType;
  }

  if (statusParam === "verified") {
    where.verified = true;
  } else if (statusParam === "rejected") {
    where.rejected = true;
  } else if (statusParam === "pending") {
    where.verified = false;
    where.rejected = false;
  }

  const extractions = await prisma.extraction.findMany({
    where,
    include: { document: { include: { source: true } } },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ extractions });
}
