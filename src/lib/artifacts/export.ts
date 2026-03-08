import {
  ArtifactContent,
  ArtifactType,
  FactPackContent,
  EvidenceMapContent,
  EmpathyMapContent,
} from '@/types/artifacts'

// ---------------------------------------------------------------------------
// Strength symbol helpers
// ---------------------------------------------------------------------------

const STRENGTH_SYMBOLS: Record<string, string> = {
  strong: '🟢 Strong',
  moderate: '🟡 Moderate',
  weak: '🟡 Weak',
  gap: '🔴 Gap',
}

// ---------------------------------------------------------------------------
// Fact Pack → Markdown
// ---------------------------------------------------------------------------

function factPackToMarkdown(content: FactPackContent, projectTitle: string): string {
  const lines: string[] = [
    `# Fact Pack: ${projectTitle}`,
    `**Generated:** ${content.generated_at} | **Extractions:** ${content.extraction_count}`,
    '',
    '---',
    '',
  ]

  for (const theme of content.themes) {
    lines.push(`## ${theme.name}`, '')
    lines.push('| Fact | Source | Confidence |')
    lines.push('|------|--------|------------|')

    for (const fact of theme.facts) {
      let factText = fact.text
      if (fact.is_metric) factText = `**${factText}** *(metric)*`
      if (fact.contradicted) factText = `~~${factText}~~ ⚠ contradicted`

      const confidence = `${Math.round(fact.confidence * 100)}%`
      lines.push(`| ${factText} | ${fact.source_title} | ${confidence} |`)
    }

    lines.push('')
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Evidence Map → Markdown
// ---------------------------------------------------------------------------

function evidenceMapToMarkdown(content: EvidenceMapContent, projectTitle: string): string {
  const lines: string[] = [
    `# Evidence Map: ${projectTitle}`,
    `**Generated:** ${content.generated_at}`,
    '',
    '---',
    '',
  ]

  const header = ['Theme', ...content.frame_components].join(' | ')
  const separator = ['-'.repeat(8), ...content.frame_components.map(() => '-'.repeat(12))].join(' | ')
  lines.push(`| ${header} |`)
  lines.push(`| ${separator} |`)

  for (const row of content.matrix) {
    const cells = row.components.map((c) => STRENGTH_SYMBOLS[c.strength] ?? c.strength)
    lines.push(`| ${row.theme} | ${cells.join(' | ')} |`)
  }

  lines.push('')
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Empathy Map → Markdown
// ---------------------------------------------------------------------------

function empathyMapToMarkdown(content: EmpathyMapContent, projectTitle: string): string {
  const lines: string[] = [
    `# Empathy Map: ${projectTitle}`,
    `**Subject:** ${content.subject}`,
    `**Generated:** ${content.generated_at}`,
    '',
    '---',
    '',
    '## 💬 SAY',
  ]

  for (const item of content.say) {
    const text = item.is_quote ? `"${item.text}"` : item.text
    lines.push(`- ${text} — *${item.source_title}*`)
  }

  lines.push('', '## 💭 THINK')
  for (const item of content.think) {
    lines.push(`- ${item.text} — *${item.source_title}*`)
  }

  lines.push('', '## 🎯 DO')
  for (const item of content.do) {
    lines.push(`- ${item.text} — *${item.source_title}*`)
  }

  lines.push('', '## ❤️ FEEL')
  for (const item of content.feel) {
    lines.push(`- ${item.text} — *${item.source_title}*`)
  }

  lines.push('')
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function artifactToMarkdown(
  artifactType: ArtifactType,
  content: ArtifactContent,
  projectTitle: string
): string {
  switch (artifactType) {
    case 'FACT_PACK':
      return factPackToMarkdown(content as FactPackContent, projectTitle)
    case 'EVIDENCE_MAP':
      return evidenceMapToMarkdown(content as EvidenceMapContent, projectTitle)
    case 'EMPATHY_MAP':
      return empathyMapToMarkdown(content as EmpathyMapContent, projectTitle)
  }
}
