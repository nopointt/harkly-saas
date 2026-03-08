"use client";

import { CANVAS_DEFAULTS } from "@/types/canvas";

interface CanvasGridProps {
  panX: number;
  panY: number;
  zoom: number;
}

/**
 * Infinite dot-grid background.
 * Uses CSS background-image with radial-gradient for performance.
 */
export function CanvasGrid({ panX, panY, zoom }: CanvasGridProps) {
  const gridSize = CANVAS_DEFAULTS.GRID_SIZE * zoom;
  const dotSize = Math.max(1, zoom * 1.5);
  const offsetX = ((panX * zoom) % gridSize + gridSize) % gridSize;
  const offsetY = ((panY * zoom) % gridSize + gridSize) % gridSize;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundColor: CANVAS_DEFAULTS.BACKGROUND_COLOR,
        backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.12) ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
      }}
    />
  );
}
