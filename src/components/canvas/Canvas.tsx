"use client";

import { useRef, useCallback } from "react";
import { useDrag, useWheel } from "@use-gesture/react";
import { useCanvasState } from "./useCanvasState";
import { CanvasGrid } from "./CanvasGrid";
import { CanvasFrame } from "./CanvasFrame";
import { CANVAS_DEFAULTS } from "@/types/canvas";

/**
 * Infinite canvas container.
 * - Background pan: drag on empty canvas
 * - Zoom: scroll wheel (ctrl+scroll or trackpad pinch)
 * - Frames rendered via CSS transform (translate + scale)
 */
export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, frames, setViewport, zoomTo, selectFrame } = useCanvasState();

  // Pan handler — drag on the canvas background
  const bindPan = useDrag(
    ({ delta: [dx, dy], target }) => {
      // Only pan when dragging the background (not a frame)
      if ((target as HTMLElement).closest("[data-canvas-frame]")) return;
      setViewport({
        panX: viewport.panX + dx / viewport.zoom,
        panY: viewport.panY + dy / viewport.zoom,
      });
    },
    { pointer: { buttons: 1 } }
  );

  // Zoom handler — scroll wheel
  const bindWheel = useWheel(
    ({ delta: [, dy], event }) => {
      event.preventDefault();
      const factor = dy > 0 ? 0.95 : 1.05;
      const rect = containerRef.current?.getBoundingClientRect();
      const cx = rect ? (event as WheelEvent).clientX - rect.left : 0;
      const cy = rect ? (event as WheelEvent).clientY - rect.top : 0;
      zoomTo(viewport.zoom * factor, cx, cy);
    },
    { target: containerRef, eventOptions: { passive: false } }
  );

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).dataset.canvasBackground !== undefined) {
        selectFrame(null);
      }
    },
    [selectFrame]
  );

  const transform = `translate(${viewport.panX * viewport.zoom}px, ${viewport.panY * viewport.zoom}px) scale(${viewport.zoom})`;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden"
      {...bindPan()}
      onClick={handleBackgroundClick}
      data-canvas-background
    >
      {/* Grid background */}
      <CanvasGrid panX={viewport.panX} panY={viewport.panY} zoom={viewport.zoom} />

      {/* Frames layer — transformed by pan+zoom */}
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform, willChange: "transform" }}
      >
        {frames.map((frame) => (
          <div key={frame.id} data-canvas-frame>
            <CanvasFrame frame={frame} />
          </div>
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded select-none pointer-events-none">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
}
