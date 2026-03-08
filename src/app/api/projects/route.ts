import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { ResearchProject } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const workspace_id = searchParams.get('workspace_id');

  if (!workspace_id) {
    return NextResponse.json({ error: 'workspace_id is required' }, { status: 400 });
  }

  const projects = await prisma.researchProject.findMany({
    where: {
      workspace_id,
    },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { workspace_id, title } = body;

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  if (!workspace_id) {
    return NextResponse.json({ error: 'workspace_id is required' }, { status: 400 });
  }

  const project = await prisma.researchProject.create({
    data: {
      workspace_id,
      user_id: session.user.id,
      title,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
