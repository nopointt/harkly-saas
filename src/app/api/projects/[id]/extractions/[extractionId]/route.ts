import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Prisma } from "@/generated/prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; extractionId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, extractionId } = await params;

  const body = (await request.json()) as {
    verified?: boolean;
    rejected?: boolean;
  };

  const data: Prisma.ExtractionUpdateInput = {};

  if (body.verified === true) {
    data.verified = true;
    data.rejected = false;
  } else if (body.rejected === true) {
    data.rejected = true;
    data.verified = false;
  }

  const extraction = await prisma.extraction.update({
    where: { id: extractionId, project_id: id },
    data,
  });

  return NextResponse.json({ extraction });
}
