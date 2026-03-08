"use client"

import { useState } from "react"
import { Note } from "@/types/notebook"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface NewNoteFormProps {
  projectId: string
  onSave: (note: Note) => void
  onCancel: () => void
}

export default function NewNoteForm({
  projectId,
  onSave,
  onCancel,
}: NewNoteFormProps) {
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [saving, setSaving] = useState(false)

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), tags }),
      })
      if (res.ok) {
        const data = (await res.json()) as { note: Note }
        onSave(data.note)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 border border-black/[0.08] rounded-lg p-3 bg-gray-50">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a note..."
        className="min-h-[80px] text-xs resize-none bg-white"
        autoFocus
      />

      {/* Tag input */}
      <div className="flex flex-wrap gap-1 items-center border border-black/[0.08] rounded-lg px-2 py-1 min-h-[30px] bg-white">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-0.5 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 leading-none"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add tag + Enter"
          className="text-[10px] outline-none flex-1 min-w-[90px] bg-transparent"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <Button size="xs" onClick={handleSave} disabled={saving || !content.trim()}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button size="xs" variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
