import {
  ArtifactType,
  ArtifactContent,
  FactPackContent,
  FactItem,
  EvidenceMapContent,
  EvidenceCell,
  EvidenceStrength,
  EmpathyMapContent,
} from '@/types/artifacts'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'

// ---------------------------------------------------------------------------
// Types for internal extraction shape
// ---------------------------------------------------------------------------

interface ExtractionRow {
  id: string
  extraction_type: string
  content: string
  confidence: number | null
  metadata: Prisma.JsonValue
  document: {
    id: string
    title: string | null
    source: {
      url: string | null
    }
  }
}

// ---------------------------------------------------------------------------
// FACT PACK
// ---------------------------------------------------------------------------

function buildFactPack(
  extractions: ExtractionRow[],
  _frameData: Prisma.JsonValue
): FactPackContent {
  const factExtractions = extractions.filter(
    (e) => e.extraction_type === 'FACT' || e.extraction_type === 'METRIC'
  )

  const contradictionTexts = new Set<string>()
  for (const e of extractions) {
    if (e.extraction_type === 'CONTRADICTION') {
      const meta = e.metadata as Record<string, unknown> | null
      if (meta) {
        if (typeof meta.claim_a === 'string') contradictionTexts.add(meta.claim_a)
        if (typeof meta.claim_b === 'string') contradictionTexts.add(meta.claim_b)
      }
    }
  }

  // Group facts by source document as a simple theme proxy
  const bySource = new Map<string, ExtractionRow[]>()
  for (const e of factExtractions) {
    const key = e.document.title ?? e.document.id
    if (!bySource.has(key)) bySource.set(key, [])
    bySource.get(key)!.push(e)
  }

  const themeEntries = Array.from(bySource.entries()).slice(0, 7)

  const themes = themeEntries.map(([sourceName, rows]) => {
    const facts: FactItem[] = rows
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
      .slice(0, 4)
      .map((e) => ({
        text: e.content,
        source_document_id: e.document.id,
        source_title: e.document.title ?? 'Unknown',
        confidence: e.confidence ?? 0,
        is_metric: e.extraction_type === 'METRIC',
        contradicted: contradictionTexts.has(e.content),
      }))

    // Derive a short theme name from the source title
    const words = sourceName.split(/\s+/).slice(0, 4).join(' ')
    return { name: words, facts }
  })

  return {
    themes,
    generated_at: new Date().toISOString(),
    extraction_count: factExtractions.length,
  }
}

// ---------------------------------------------------------------------------
// EVIDENCE MAP
// ---------------------------------------------------------------------------

function strengthFromCount(count: number, minConfidence: number): EvidenceStrength {
  if (count === 0) return 'gap'
  if (count >= 3 && minConfidence >= 0.7) return 'strong'
  if (count >= 1 && minConfidence >= 0.6) return 'moderate'
  return 'weak'
}

function buildEvidenceMap(
  extractions: ExtractionRow[],
  frameData: Prisma.JsonValue
): EvidenceMapContent {
  const factExtractions = extractions.filter(
    (e) => e.extraction_type === 'FACT' || e.extraction_type === 'METRIC'
  )

  // Derive frame components from frame_data keys (e.g. PICO → p, i, c, o)
  const frameComponents: string[] = []
  if (frameData && typeof frameData === 'object' && !Array.isArray(frameData)) {
    const keys = Object.keys(frameData as Record<string, unknown>)
    for (const k of keys) {
      frameComponents.push(k.toUpperCase())
    }
  }
  if (frameComponents.length === 0) {
    frameComponents.push('Population', 'Intervention', 'Comparison', 'Outcome')
  }

  // Collect unique source titles as themes
  const themeSet = new Set<string>()
  for (const e of factExtractions) {
    themeSet.add(e.document.title ?? 'General')
  }
  const themes = Array.from(themeSet).slice(0, 5)

  const matrix = themes.map((theme) => {
    const themeExtractions = factExtractions.filter(
      (e) => (e.document.title ?? 'General') === theme
    )

    const components: EvidenceCell[] = frameComponents.map((component, idx) => {
      // Distribute extractions across components deterministically
      const relevant = themeExtractions.filter((_, i) => i % frameComponents.length === idx)
      const minConf = relevant.reduce(
        (min, e) => Math.min(min, e.confidence ?? 0),
        relevant.length > 0 ? 1 : 0
      )
      return {
        component,
        strength: strengthFromCount(relevant.length, minConf),
        fact_count: relevant.length,
      }
    })

    return { theme, components }
  })

  return {
    frame_components: frameComponents,
    themes,
    matrix,
    generated_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// EMPATHY MAP
// ---------------------------------------------------------------------------

function buildEmpathyMap(
  extractions: ExtractionRow[],
  frameData: Prisma.JsonValue
): EmpathyMapContent {
  // Determine subject from P component of frame
  let subject = 'E-commerce customers'
  if (frameData && typeof frameData === 'object' && !Array.isArray(frameData)) {
    const fd = frameData as Record<string, unknown>
    if (typeof fd.p === 'string') subject = fd.p
    else if (typeof fd.user === 'string') subject = fd.user
  }

  const quotes = extractions.filter((e) => e.extraction_type === 'QUOTE')
  const facts = extractions.filter((e) => e.extraction_type === 'FACT')

  // SAY: verbatim QUOTE extractions
  const say = quotes.slice(0, 6).map((e) => ({
    text: e.content,
    source_document_id: e.document.id,
    source_title: e.document.title ?? 'Unknown',
    is_quote: true,
  }))

  // THINK: FACTs about cognition/beliefs (filter by keywords)
  const thinkKeywords = /think|believe|feel|perceiv|concern|worry|trust|doubt|expect/i
  const think = facts
    .filter((e) => thinkKeywords.test(e.content))
    .slice(0, 6)
    .map((e) => ({
      text: e.content,
      source_document_id: e.document.id,
      source_title: e.document.title ?? 'Unknown',
    }))

  // DO: behavioral FACTs (filter by action keywords)
  const doKeywords = /abandon|complet|click|use|implement|reduc|increas|buy|purchas|submit/i
  const doItems = facts
    .filter((e) => doKeywords.test(e.content) && !thinkKeywords.test(e.content))
    .slice(0, 6)
    .map((e) => ({
      text: e.content,
      source_document_id: e.document.id,
      source_title: e.document.title ?? 'Unknown',
    }))

  // FEEL: sentiment-bearing FACTs (frustration, satisfaction, anxiety, etc.)
  const feelKeywords = /frustrat|satisf|anxiet|comfort|confus|delight|annoy|overwhelm|relief/i
  const feel = facts
    .filter((e) => feelKeywords.test(e.content))
    .slice(0, 6)
    .map((e) => ({
      text: e.content,
      source_document_id: e.document.id,
      source_title: e.document.title ?? 'Unknown',
    }))

  return {
    say,
    think,
    do: doItems,
    feel,
    subject,
    generated_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export async function generateArtifactContent(
  projectId: string,
  artifactType: ArtifactType
): Promise<ArtifactContent> {
  const [project, extractionRows] = await Promise.all([
    prisma.researchProject.findUnique({ where: { id: projectId } }),
    prisma.extraction.findMany({
      where: { project_id: projectId, rejected: false },
      include: {
        document: {
          include: { source: { select: { url: true } } },
        },
      },
      orderBy: { confidence: 'desc' },
    }),
  ])

  const frameData = project?.frame_data ?? null

  const extractions: ExtractionRow[] = extractionRows.map((e) => ({
    id: e.id,
    extraction_type: e.extraction_type,
    content: e.content,
    confidence: e.confidence,
    metadata: e.metadata,
    document: {
      id: e.document.id,
      title: e.document.title,
      source: { url: e.document.source.url },
    },
  }))

  switch (artifactType) {
    case 'FACT_PACK':
      return buildFactPack(extractions, frameData)
    case 'EVIDENCE_MAP':
      return buildEvidenceMap(extractions, frameData)
    case 'EMPATHY_MAP':
      return buildEmpathyMap(extractions, frameData)
  }
}
