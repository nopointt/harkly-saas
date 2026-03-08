import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyProjectAuth } from '@/lib/api-auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await verifyProjectAuth(id);
  if (!auth.ok) return auth.response;

  const project = await prisma.researchProject.findFirst({
    where: { id },
    select: { extraction_status: true, extraction_done: true, extraction_total: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: project.extraction_status,
    done: project.extraction_done,
    total: project.extraction_total,
  });
}
