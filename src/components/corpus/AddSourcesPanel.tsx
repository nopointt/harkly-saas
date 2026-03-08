"use client";

import { useState, useRef } from "react";

const VALID_EXTS = [".pdf", ".docx", ".txt", ".csv"];
const VALID_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
];

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function acceptsFile(f: File): boolean {
  return VALID_MIME.includes(f.type) || VALID_EXTS.some((ext) => f.name.toLowerCase().endsWith(ext));
}

interface Props {
  projectId: string;
  onClose: () => void;
  onAdded: () => void;
}

export function AddSourcesPanel({ projectId, onClose, onAdded }: Props) {
  const [tab, setTab] = useState<"urls" | "files">("urls");
  const [urlsText, setUrlsText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const urlLines = urlsText.split("\n").map((s) => s.trim()).filter(Boolean);
  const validUrls = urlLines.filter(isValidUrl);
  const invalidUrls = urlLines.filter((u) => !isValidUrl(u));

  function handleFileInput(list: FileList | null) {
    if (!list) return;
    const accepted = Array.from(list).filter(acceptsFile);
    setFiles((prev) => [...prev, ...accepted]);
  }

  async function submitUrls() {
    if (validUrls.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "url", urls: validUrls }),
      });
      if (!res.ok) throw new Error("Failed to add URLs");
      onAdded();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function submitFiles() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    const filePaths: string[] = [];
    const fileNames: string[] = [];
    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} exceeds 10 MB limit`);
          setLoading(false);
          return;
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error(`Upload failed: ${file.name}`);
        const data = await res.json() as { file_path: string; file_name: string };
        filePaths.push(data.file_path);
        fileNames.push(data.file_name);
      }
      const res = await fetch(`/api/projects/${projectId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "file", file_paths: filePaths, file_names: fileNames }),
      });
      if (!res.ok) throw new Error("Failed to add files");
      onAdded();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-black/[0.06] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Add sources</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/[0.06]">
          {(["urls", "files"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                tab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {t === "urls" ? "URLs" : "Files"}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "urls" ? (
            <>
              <textarea
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
                placeholder={"Paste URLs, one per line\nhttps://example.com/article\nhttps://another.com/paper"}
                className="w-full h-36 text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-gray-300 font-mono"
              />
              {invalidUrls.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {invalidUrls.map((u) => (
                    <p key={u} className="text-xs text-red-500 truncate">✗ {u}</p>
                  ))}
                </div>
              )}
              {validUrls.length > 0 && (
                <p className="text-xs text-green-600 mt-2">✓ {validUrls.length} valid URL{validUrls.length !== 1 ? "s" : ""}</p>
              )}
              <button
                onClick={submitUrls}
                disabled={loading || validUrls.length === 0}
                className="mt-4 w-full py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                {loading ? "Adding..." : `Add ${validUrls.length > 0 ? validUrls.length : ""} URL${validUrls.length !== 1 ? "s" : ""}`}
              </button>
            </>
          ) : (
            <>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragging ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFileInput(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, CSV · max 10 MB each</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.csv"
                  className="hidden"
                  onChange={(e) => handleFileInput(e.target.files)}
                />
              </div>
              {files.length > 0 && (
                <ul className="mt-3 space-y-1 max-h-36 overflow-y-auto">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <span className="truncate mr-2">{f.name}</span>
                      <button
                        onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="text-gray-400 hover:text-red-500 shrink-0"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={submitFiles}
                disabled={loading || files.length === 0}
                className="mt-4 w-full py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                {loading ? "Uploading..." : `Upload ${files.length > 0 ? files.length : ""} file${files.length !== 1 ? "s" : ""}`}
              </button>
            </>
          )}
          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
