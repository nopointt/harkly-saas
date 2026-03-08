"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Artifact, ArtifactVersion } from "@/types/artifacts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VersionHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  artifactId: string;
  projectId: string;
  onRestore: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function contentPreview(content: ArtifactVersion["content"]): string {
  return JSON.stringify(content, null, 2);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VersionHistoryDrawer({
  open,
  onClose,
  artifactId,
  projectId,
  onRestore,
}: VersionHistoryDrawerProps) {
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [versions, setVersions] = useState<ArtifactVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${artifactId}`
      );
      if (res.ok) {
        const data = (await res.json()) as {
          artifact: Artifact;
          versions: ArtifactVersion[];
        };
        setArtifact(data.artifact);
        const sorted = [...(data.versions ?? [])].sort(
          (a, b) => b.version - a.version
        );
        setVersions(sorted);
        if (sorted.length > 0 && selectedVersion === null) {
          setSelectedVersion(sorted[0].version);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, artifactId, selectedVersion]);

  useEffect(() => {
    if (open) {
      setSelectedVersion(null);
      fetchVersions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleRestore = async () => {
    if (selectedVersion === null) return;
    setRestoring(true);
    try {
      await fetch(
        `/api/projects/${projectId}/artifacts/${artifactId}/restore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ version: selectedVersion }),
        }
      );
      onRestore();
      onClose();
    } finally {
      setRestoring(false);
    }
  };

  const selectedVersionData = versions.find(
    (v) => v.version === selectedVersion
  );

  const isCurrentVersion = selectedVersion === artifact?.current_version;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        className="max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col gap-0 p-0"
        showCloseButton
      >
        <DialogHeader className="px-6 py-4 border-b border-black/[0.06]">
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Version list */}
          <div className="w-56 border-r border-black/[0.06] overflow-y-auto flex-shrink-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            ) : versions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                No versions found
              </p>
            ) : (
              <ul className="py-2">
                {versions.map((v) => (
                  <li key={v.id}>
                    <button
                      onClick={() => setSelectedVersion(v.version)}
                      className={`w-full text-left px-4 py-3 text-xs transition-colors hover:bg-gray-50 ${
                        selectedVersion === v.version
                          ? "bg-gray-100 font-medium text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Version {v.version}</span>
                        {v.version === artifact?.current_version && (
                          <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium bg-green-100 text-green-700">
                            current
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {formatDate(v.created_at)}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Preview panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedVersionData ? (
              <>
                <div className="px-6 py-3 border-b border-black/[0.06] flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Version {selectedVersionData.version} —{" "}
                    {formatDate(selectedVersionData.created_at)}
                  </span>
                  {!isCurrentVersion && (
                    <Button
                      size="sm"
                      onClick={handleRestore}
                      disabled={restoring}
                      className="h-7 text-xs"
                    >
                      {restoring ? "Restoring..." : "Restore this version"}
                    </Button>
                  )}
                  {isCurrentVersion && (
                    <span className="text-xs text-gray-400">
                      Current version
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <pre className="text-[10px] text-gray-600 bg-gray-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-words font-mono leading-relaxed">
                    {contentPreview(selectedVersionData.content)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-gray-400">
                  Select a version to preview
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
