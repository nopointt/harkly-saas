import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyProjectAuth } from '@/lib/api-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await verifyProjectAuth(id);
  if (!auth.ok) return auth.response;

  const body = await request.json() as { frame_type?: string; frame_data?: object };
  const { frame_type, frame_data } = body;

  const project = await prisma.researchProject.update({
    where: { id },
    data: { frame_type: frame_type as never, frame_data },
  });
  return NextResponse.json({ project });
}
