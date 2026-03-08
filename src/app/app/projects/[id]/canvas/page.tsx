import InsightCanvasPage from '@/components/insights/InsightCanvasPage'

export default function CanvasPage({ params }: { params: { id: string } }) {
  return <InsightCanvasPage projectId={params.id} />
}
