import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import ExtractPage from "@/components/extract/ExtractPage";

export default async function ExtractPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const project = await prisma.researchProject.findFirst({
    where: { id, user_id: session.user.id },
    select: { id: true, title: true, corpus_finalized: true },
  });

  if (!project) redirect("/app/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ExtractPage
          projectId={project.id}
          corpusFinalized={project.corpus_finalized}
          projectTitle={project.title}
        />
      </div>
    </div>
  );
}
