"use client";

import { useState, useEffect, useCallback } from "react";
import { FramingStudio } from "@/components/framing/FramingStudio";

interface OmnibarProps {
  workspaceId: string;
}

export function Omnibar({ workspaceId }: OmnibarProps) {
  const [open, setOpen] = useState(false);
  const [framingOpen, setFramingOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setFramingOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    setFramingOpen(true);
  }, [query]);

  if (!open && !framingOpen) return null;

  // Framing Studio dialog
  if (framingOpen) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) { setFramingOpen(false); setQuery(""); } }}
      >
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <FramingStudio
            initialQuestion={query}
            workspaceId={workspaceId}
            onClose={() => { setFramingOpen(false); setQuery(""); }}
          />
        </div>
      </div>
    );
  }

  // Omnibar dialog
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <span className="text-gray-400 text-sm">✦</span>
            <input
              autoFocus
              className="flex-1 text-sm outline-none placeholder:text-gray-400"
              placeholder="Ask a research question or search projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">ESC</kbd>
          </div>
          {query.trim() && (
            <div className="px-4 py-3">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left group"
              >
                <span className="text-lg">+</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Start new research</p>
                  <p className="text-xs text-gray-400 truncate">&ldquo;{query}&rdquo;</p>
                </div>
                <span className="ml-auto text-[10px] text-gray-400 opacity-0 group-hover:opacity-100">↵ Enter</span>
              </button>
            </div>
          )}
          {!query.trim() && (
            <div className="px-4 py-4 text-xs text-gray-400 text-center">
              Type a research question to start
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
