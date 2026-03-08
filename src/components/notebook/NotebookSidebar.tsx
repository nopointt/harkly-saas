"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Note } from "@/types/notebook"
import { useRelatedNotes } from "@/hooks/useRelatedNotes"
import NoteCard from "./NoteCard"
import NoteDetail from "./NoteDetail"
import NewNoteForm from "./NewNoteForm"
import { cn } from "@/lib/utils"

type FilterType = "all" | "linked" | "tagged"

interface NotebookSidebarProps {
  projectId: string
  contextText?: string | null
}

export function NotebookSidebar({
  projectId,
  contextText = null,
}: NotebookSidebarProps) {
  const storageKey = `notebook-open-${projectId}`

  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(storageKey) === "true"
  })
  const [notes, setNotes] = useState<Note[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [showNewNote, setShowNewNote] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(false)

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const relatedNotes = useRelatedNotes(contextText, projectId)

  // Persist open state
  useEffect(() => {
    localStorage.setItem(storageKey, open ? "true" : "false")
  }, [open, storageKey])

  // Keyboard shortcut Cmd+Shift+N
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "N") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  const fetchNotes = useCallback(
    async (query?: string) => {
      setLoading(true)
      try {
        const url = query
          ? `/api/projects/${projectId}/notes?search=${encodeURIComponent(query)}`
          : `/api/projects/${projectId}/notes`
        const res = await fetch(url)
        if (res.ok) {
          const data = (await res.json()) as { notes: Note[] }
          setNotes(data.notes ?? [])
        }
      } finally {
        setLoading(false)
      }
    },
    [projectId]
  )

  // Initial fetch
  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      fetchNotes(search || undefined)
    }, 300)
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [search, fetchNotes])

  const applyFilter = (notesList: Note[]): Note[] => {
    if (filter === "linked") return notesList.filter((n) => n.linked_doc_ids.length > 0)
    if (filter === "tagged") return notesList.filter((n) => n.tags.length > 0)
    return notesList
  }

  const filteredNotes = applyFilter(notes)

  const relatedNoteIds = new Set(relatedNotes.map((n) => n.id))
  const relatedFiltered = relatedNotes.filter((n) =>
    filteredNotes.some((fn) => fn.id === n.id)
  )
  const nonRelatedNotes = filteredNotes.filter((n) => !relatedNoteIds.has(n.id))

  const handleNewNote = (note: Note) => {
    setNotes((prev) => [note, ...prev])
    setShowNewNote(false)
  }

  const handleEdit = (note: Note) => {
    setSelectedNote(note)
    setShowNewNote(false)
  }

  const handleUpdate = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    setSelectedNote(updated)
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/projects/${projectId}/notes/${id}`, {
      method: "DELETE",
    })
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id))
      if (selectedNote?.id === id) setSelectedNote(null)
    }
  }

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "linked", label: "Linked" },
    { key: "tagged", label: "Tagged" },
  ]

  return (
    <>
      {/* Toggle button when closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open notebook"
          title="Open Notebook (Ctrl+Shift+N)"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-black/[0.08] border-r-0 rounded-l-lg px-2 py-3 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <span className="text-base">📓</span>
        </button>
      )}

      {/* Sidebar panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen w-80 bg-white border-l border-black/[0.06] shadow-xl z-40 flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* If a note is selected, show detail view */}
        {selectedNote ? (
          <NoteDetail
            note={selectedNote}
            projectId={projectId}
            onUpdate={handleUpdate}
            onDelete={(id) => {
              handleDelete(id)
            }}
            onClose={() => setSelectedNote(null)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
              <span className="text-sm font-semibold text-gray-900">📓 Notebook</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowNewNote((v) => !v)}
                  aria-label="New note"
                  className="text-xs bg-gray-900 text-white px-2 py-1 rounded-md hover:bg-gray-700 transition-colors"
                >
                  + New
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close notebook"
                  className="p-1 text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* New note form */}
            {showNewNote && (
              <div className="px-3 py-2 border-b border-black/[0.06]">
                <NewNoteForm
                  projectId={projectId}
                  onSave={handleNewNote}
                  onCancel={() => setShowNewNote(false)}
                />
              </div>
            )}

            {/* Search */}
            <div className="px-3 py-2 border-b border-black/[0.06]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full text-xs border border-black/[0.08] rounded-lg px-3 py-1.5 outline-none focus:border-gray-400 bg-gray-50 transition-colors"
              />
            </div>

            {/* Filter chips */}
            <div className="px-3 py-2 flex items-center gap-1.5 border-b border-black/[0.06]">
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

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
              {loading && (
                <p className="text-xs text-gray-400 text-center py-4 animate-pulse">
                  Loading...
                </p>
              )}

              {!loading && relatedFiltered.length > 0 && (
                <>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-1">
                    Related to context
                  </p>
                  {relatedFiltered.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isRelated
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                  {nonRelatedNotes.length > 0 && (
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-1 mt-1">
                      All Notes
                    </p>
                  )}
                </>
              )}

              {!loading &&
                nonRelatedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isRelated={false}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}

              {!loading && filteredNotes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-400">No notes yet</p>
                  <button
                    onClick={() => setShowNewNote(true)}
                    className="text-xs text-gray-600 underline mt-1"
                  >
                    Create your first note
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
