"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Note } from "@/types/notebook"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface NoteDetailProps {
  note: Note
  projectId: string
  onUpdate: (updated: Note) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function TagBadge({
  tag,
  onRemove,
}: {
  tag: string
  onRemove?: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
      {tag}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove tag ${tag}`}
          className="hover:text-red-500 transition-colors leading-none"
        >
          ×
        </button>
      )}
    </span>
  )
}

function TagInput({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault()
      const newTag = input.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag])
      }
      setInput("")
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center border border-black/[0.08] rounded-lg px-2 py-1.5 min-h-[36px]">
      {tags.map((tag) => (
        <TagBadge
          key={tag}
          tag={tag}
          onRemove={() => onChange(tags.filter((t) => t !== tag))}
        />
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tag..."
        className="text-xs outline-none flex-1 min-w-[80px] bg-transparent"
      />
    </div>
  )
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function NoteDetail({
  note,
  projectId,
  onUpdate,
  onDelete,
  onClose,
}: NoteDetailProps) {
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState(note.content)
  const [editTags, setEditTags] = useState<string[]>(note.tags)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(
        `/api/projects/${projectId}/notes/${note.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent, tags: editTags }),
        }
      )
      if (res.ok) {
        const data = (await res.json()) as { note: Note }
        onUpdate(data.note)
        setEditMode(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm("Delete this note?")) {
      onDelete(note.id)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
        <h2 className="text-sm font-medium text-gray-900">Note</h2>
        <div className="flex items-center gap-2">
          {!editMode && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditContent(note.content)
                  setEditTags(note.tags)
                  setEditMode(true)
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {editMode ? (
          <div className="flex flex-col gap-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[240px] text-sm resize-y"
              placeholder="Note content..."
            />
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Tags</label>
              <TagInput tags={editTags} onChange={setEditTags} />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditMode(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Markdown content */}
            <div className="prose prose-sm max-w-none text-gray-800 [&>p]:text-sm [&>p]:leading-relaxed [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>ul]:text-sm [&>ol]:text-sm">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
            )}

            {/* Linked docs */}
            {note.linked_doc_ids.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Linked Documents</p>
                <div className="flex flex-col gap-1">
                  {note.linked_doc_ids.map((docId) => (
                    <span
                      key={docId}
                      className="text-xs text-blue-600 hover:underline cursor-pointer"
                    >
                      Doc ID: {docId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-2 border-t border-black/[0.06]">
              <p className="text-[11px] text-gray-400">
                Created {formatDateTime(note.created_at)}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Updated {formatDateTime(note.updated_at)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
