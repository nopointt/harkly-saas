"use client";

import { useCanvasState } from "./useCanvasState";
import { FrameModuleType, CANVAS_DEFAULTS } from "@/types/canvas";
import { cn } from "@/lib/utils";

const MODULES: { type: FrameModuleType; label: string; shortLabel: string }[] = [
  { type: "framing-studio", label: "Framing Studio", shortLabel: "Frame" },
  { type: "corpus-triage", label: "Corpus Triage", shortLabel: "Corpus" },
  { type: "evidence-extractor", label: "Evidence Extractor", shortLabel: "Extract" },
  { type: "insight-canvas", label: "Insight Canvas", shortLabel: "Insight" },
  { type: "research-notebook", label: "Research Notebook", shortLabel: "Notebook" },
];

export function CanvasToolbar() {
  const { addFrame, resetViewport, zoomTo, viewport } = useCanvasState();

  const spawnFrame = (module: FrameModuleType, label: string) => {
    const m = MODULES.find((m) => m.type === module);
    addFrame({
      module,
      title: label,
      x: 80 + Math.random() * 120,
      y: 80 + Math.random() * 80,
      width: CANVAS_DEFAULTS.DEFAULT_FRAME_WIDTH,
      height: CANVAS_DEFAULTS.DEFAULT_FRAME_HEIGHT,
      minimized: false,
    });
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-black/10 rounded-xl px-2 py-1.5 shadow-md">
      {MODULES.map(({ type, label, shortLabel }) => (
        <button
          key={type}
          className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => spawnFrame(type, label)}
          title={`Open ${label}`}
        >
          {shortLabel}
        </button>
      ))}

      <div className="w-px h-4 bg-gray-200 mx-1" />

      <button
        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={() => zoomTo(viewport.zoom * 1.25)}
        title="Zoom in"
      >
        +
      </button>
      <button
        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={() => zoomTo(viewport.zoom * 0.8)}
        title="Zoom out"
      >
        −
      </button>
      <button
        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={resetViewport}
        title="Reset view"
      >
        ⌂
      </button>
    </div>
  );
}
