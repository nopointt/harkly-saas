"use client"

import { useState, useEffect, useRef } from "react"
import { Note } from "@/types/notebook"

export function useRelatedNotes(
  contextText: string | null,
  projectId: string
): Note[] {
  const [relatedNotes, setRelatedNotes] = useState<Note[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!contextText || contextText.trim().length < 10) {
      setRelatedNotes([])
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const res = await fetch(
        `/api/projects/${projectId}/notes/related?context_text=${encodeURIComponent(contextText)}`
      )
      if (res.ok) {
        const data = (await res.json()) as { notes?: Note[] }
        setRelatedNotes(data.notes ?? [])
      }
    }, 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [contextText, projectId])

  return relatedNotes
}
