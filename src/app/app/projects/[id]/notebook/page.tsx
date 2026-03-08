"use client"

import { useState, useEffect, useCallback, use } from "react"
import { Note } from "@/types/notebook"
import NoteCard from "@/components/notebook/NoteCard"
import NoteDetail from "@/components/notebook/NoteDetail"
import NewNoteForm from "@/components/notebook/NewNoteForm"
import { cn } from "@/lib/utils"

type FilterType = "all" | "linked" | "tagged"

interface NotebookPageProps {
  params: Promise<{ id: string }>
}

export default function NotebookPage({ params }: NotebookPageProps) {
  const { id } = use(params)

  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [showNewNote, setShowNewNote] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchNotes = useCallback(
    async (query?: string) => {
      try {
        const url = query
          ? `/api/projects/${id}/notes?search=${encodeURIComponent(query)}`
          : `/api/projects/${id}/notes`
        const res = await fetch(url)
        if (res.ok) {
          const data = (await res.json()) as { notes: Note[] }
          setNotes(data.notes ?? [])
        }
      } finally {
        setLoading(false)
      }
    },
    [id]
  )

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      fetchNotes(search || undefined)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, fetchNotes])

  const applyFilter = (notesList: Note[]): Note[] => {
    if (filter === "linked") return notesList.filter((n) => n.linked_doc_ids.length > 0)
    if (filter === "tagged") return notesList.filter((n) => n.tags.length > 0)
    return notesList
  }

  const filteredNotes = applyFilter(notes)

  const handleNewNote = (note: Note) => {
    setNotes((prev) => [note, ...prev])
    setShowNewNote(false)
    setSelectedNote(note)
  }

  const handleUpdate = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    setSelectedNote(updated)
  }

  const handleDelete = async (noteId: string) => {
    const res = await fetch(`/api/projects/${id}/notes/${noteId}`, {
      method: "DELETE",
    })
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      if (selectedNote?.id === noteId) setSelectedNote(null)
    }
  }

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "linked", label: "Linked" },
    { key: "tagged", label: "Tagged" },
  ]

  return (
    <div className="min-h-screen bg-[#faf8f0] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-black/[0.06] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">📓 Notebook</span>
          <span className="text-[11px] text-gray-400">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={() => {
            setShowNewNote((v) => !v)
            setSelectedNote(null)
          }}
          className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          + New Note
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — notes list */}
        <div className="w-1/3 border-r border-black/[0.06] bg-white flex flex-col">
          {/* Search + filter */}
          <div className="px-4 py-3 border-b border-black/[0.06] flex flex-col gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full text-xs border border-black/[0.08] rounded-lg px-3 py-1.5 outline-none focus:border-gray-400 bg-gray-50 transition-colors"
            />
            <div className="flex items-center gap-1.5">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    "text-[11px] px-2.5 py-0.5 rounded-full border transition-colors",
                    filter === key
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-black/[0.12] hover:border-gray-400"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* New note form inline */}
          {showNewNote && (
            <div className="px-4 py-3 border-b border-black/[0.06]">
              <NewNoteForm
                projectId={id}
                onSave={handleNewNote}
                onCancel={() => setShowNewNote(false)}
              />
            </div>
          )}

          {/* Notes */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
            {loading && (
              <p className="text-xs text-gray-400 text-center py-6 animate-pulse">
                Loading...
              </p>
            )}

            {!loading && filteredNotes.length === 0 && (
              <div className="text-center py-10">
                <p className="text-xs text-gray-400">No notes found</p>
                <button
                  onClick={() => setShowNewNote(true)}
                  className="text-xs text-gray-600 underline mt-1"
                >
                  Create your first note
                </button>
              </div>
            )}

            {!loading &&
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note)
                    setShowNewNote(false)
                  }}
                  className={cn(
                    "cursor-pointer",
                    selectedNote?.id === note.id && "ring-2 ring-gray-900 rounded-lg"
                  )}
                >
                  <NoteCard
                    note={note}
                    onEdit={(n) => {
                      setSelectedNote(n)
                      setShowNewNote(false)
                    }}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Right panel — note detail */}
        <div className="flex-1 bg-[#faf8f0] flex flex-col">
          {selectedNote ? (
            <div className="h-full bg-white">
              <NoteDetail
                note={selectedNote}
                projectId={id}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onClose={() => setSelectedNote(null)}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl mb-2">📓</p>
                <p className="text-sm text-gray-400">Select a note to view</p>
                <button
                  onClick={() => setShowNewNote(true)}
                  className="mt-3 text-xs text-gray-600 underline"
                >
                  or create a new one
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
