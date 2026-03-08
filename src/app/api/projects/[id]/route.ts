import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyProjectAuth } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await verifyProjectAuth(id);
  if (!auth.ok) return auth.response;

  const project = await prisma.researchProject.findUnique({
    where: { id },
  });

  return NextResponse.json({ project });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await verifyProjectAuth(id);
  if (!auth.ok) return auth.response;

  await prisma.researchProject.delete({
    where: { id },
  });

  return NextResponse.json({ message: 'Project deleted' });
}
