import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type SourceWithDocuments = {
  id: string;
  project_id: string;
  url: string | null;
  title: string | null;
  type: string;
  status: string;
  metadata: unknown;
  created_at: Date;
  updated_at: Date;
  documents: {
    id: string;
    title: string | null;
    content: string;
    word_count: number | null;
    relevance_score: number | null;
    screening_status: string;
    screening_reason: string | null;
    created_at: Date;
    updated_at: Date;
  }[];
};

const MOCK_CONTENT =
  "This document examines checkout abandonment patterns and user behavior during the payment process. Research indicates that 70% of shoppers abandon carts at checkout. Key friction points include unexpected shipping costs, mandatory account creation, and complex payment forms. Mobile users show 85% higher abandonment rates. Solutions studied include guest checkout, progress indicators, and one-click payment options.";

function getDomainOrFilename(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

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

  const body = (await request.json()) as
    | { type: "url"; urls: string[] }
    | { type: "file"; file_paths: string[]; file_names: string[] };

  const createdSources = [];

  if (body.type === "url") {
    for (const url of body.urls) {
      const source = await prisma.source.create({
        data: {
          project_id: id,
          url,
          title: getDomainOrFilename(url),
          type: "URL",
          status: "PROCESSING",
        },
      });

      await prisma.document.create({
        data: {
          project_id: id,
          source_id: source.id,
          title: getDomainOrFilename(url),
          content: MOCK_CONTENT,
          word_count: 72,
          relevance_score: Math.random() * 0.6 + 0.3,
          screening_status: "PENDING",
        },
      });

      const updated = await prisma.source.update({
        where: { id: source.id },
        data: { status: "PROCESSED" },
      });

      createdSources.push(updated);
    }
  } else {
    for (let i = 0; i < body.file_paths.length; i++) {
      const filePath = body.file_paths[i];
      const fileName = body.file_names[i];
      const ext = fileName.split(".").pop()?.toUpperCase() ?? "TXT";
      const sourceType = ["PDF", "DOCX", "TXT", "CSV"].includes(ext)
        ? (ext as "PDF" | "DOCX" | "TXT" | "CSV")
        : "TXT";

      const source = await prisma.source.create({
        data: {
          project_id: id,
          url: filePath,
          title: fileName,
          type: sourceType,
          status: "PROCESSING",
        },
      });

      await prisma.document.create({
        data: {
          project_id: id,
          source_id: source.id,
          title: fileName,
          content: MOCK_CONTENT,
          word_count: 72,
          relevance_score: Math.random() * 0.6 + 0.3,
          screening_status: "PENDING",
        },
      });

      const updated = await prisma.source.update({
        where: { id: source.id },
        data: { status: "PROCESSED" },
      });

      createdSources.push(updated);
    }
  }

  return NextResponse.json(
    { sources: createdSources, queued: createdSources.length },
    { status: 201 }
  );
}

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

  const sources = await prisma.source.findMany({
    where: { project_id: id },
    include: {
      documents: {
        select: {
          id: true,
          title: true,
          content: true,
          word_count: true,
          relevance_score: true,
          screening_status: true,
          screening_reason: true,
          created_at: true,
          updated_at: true,
        },
      },
    },
  });

  const typedSources: SourceWithDocuments[] = sources.map((s) => ({
    id: s.id,
    project_id: s.project_id,
    url: s.url,
    title: s.title,
    type: s.type,
    status: s.status,
    metadata: s.metadata,
    created_at: s.created_at,
    updated_at: s.updated_at,
    documents: s.documents,
  }));

  const allDocs = typedSources.flatMap((s) => s.documents);

  const stats = {
    total: allDocs.length,
    included: allDocs.filter((d) => d.screening_status === "INCLUDED").length,
    excluded: allDocs.filter((d) => d.screening_status === "EXCLUDED").length,
    maybe: allDocs.filter((d) => d.screening_status === "MAYBE").length,
    pending: allDocs.filter((d) => d.screening_status === "PENDING").length,
  };

  return NextResponse.json({ sources: typedSources, stats });
}
