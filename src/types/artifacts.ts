export type ArtifactType = 'FACT_PACK' | 'EVIDENCE_MAP' | 'EMPATHY_MAP'

export type EvidenceStrength = 'strong' | 'moderate' | 'weak' | 'gap'

export interface FactItem {
  text: string
  source_document_id: string
  source_title: string
  confidence: number
  is_metric: boolean
  contradicted: boolean
}

export interface FactPackContent {
  themes: { name: string; facts: FactItem[] }[]
  generated_at: string
  extraction_count: number
}

export interface EvidenceCell {
  component: string
  strength: EvidenceStrength
  fact_count: number
}

export interface EvidenceMapContent {
  frame_components: string[]
  themes: string[]
  matrix: { theme: string; components: EvidenceCell[] }[]
  generated_at: string
}

export interface EmpathyItem {
  text: string
  source_document_id: string
  source_title: string
  is_quote: boolean
}

export interface EmpathyMapContent {
  say: EmpathyItem[]
  think: Omit<EmpathyItem, 'is_quote'>[]
  do: Omit<EmpathyItem, 'is_quote'>[]
  feel: Omit<EmpathyItem, 'is_quote'>[]
  subject: string
  generated_at: string
}

export type ArtifactContent = FactPackContent | EvidenceMapContent | EmpathyMapContent

export interface ArtifactVersion {
  id: string
  artifact_id: string
  version: number
  content: ArtifactContent
  created_at: string
}

export interface Artifact {
  id: string
  project_id: string
  artifact_type: ArtifactType
  status: 'NOT_GENERATED' | 'GENERATING' | 'GENERATED' | 'FAILED'
  current_version: number
  content: ArtifactContent | null
  versions?: ArtifactVersion[]
  created_at: string
  updated_at: string
}
