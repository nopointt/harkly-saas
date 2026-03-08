"use client"

import { useState } from "react"
import { Note } from "@/types/notebook"
import { cn } from "@/lib/utils"

interface NoteCardProps {
  note: Note
  isRelated?: boolean
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function NoteCard({
  note,
  isRelated,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={cn(
        "relative group bg-white rounded-lg border border-black/[0.06] px-3 py-2.5 cursor-pointer transition-shadow hover:shadow-sm"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onEdit(note)}
    >
      {/* Action buttons on hover */}
      {hovered && (
        <div
          className="absolute top-2 right-2 flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            aria-label="Edit note"
            onClick={() => onEdit(note)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            aria-label="Delete note"
            onClick={() => onDelete(note.id)}
            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Content preview */}
      <p className="text-xs text-gray-800 line-clamp-2 pr-12 leading-relaxed">
        {note.content}
      </p>

      {/* Tags and badges */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {isRelated && (
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
            Related
          </span>
        )}
        {note.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
        {note.tags.length > 3 && (
          <span className="text-[10px] text-gray-400">
            +{note.tags.length - 3}
          </span>
        )}
      </div>

      {/* Date */}
      <p className="mt-1.5 text-[10px] text-gray-400">
        {formatDate(note.updated_at)}
      </p>
    </div>
  )
}
