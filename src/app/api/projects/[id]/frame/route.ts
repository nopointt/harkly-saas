import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as { frame_type?: string; frame_data?: object };
  const { frame_type, frame_data } = body;

  const project = await prisma.researchProject.update({
    where: { id },
    data: { frame_type: frame_type as never, frame_data },
  });
  return NextResponse.json({ project });
}
