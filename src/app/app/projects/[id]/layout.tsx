import { NotebookSidebar } from "@/components/notebook/NotebookSidebar"

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { id } = await params

  return (
    <div className="relative min-h-screen">
      {children}
      <NotebookSidebar projectId={id} />
    </div>
  )
}
