"use client";

import { useRef } from "react";
import { useDrag } from "@use-gesture/react";
import { CanvasFrame as TCanvasFrame, CANVAS_DEFAULTS } from "@/types/canvas";
import { useCanvasState } from "./useCanvasState";
import { cn } from "@/lib/utils";

interface CanvasFrameProps {
  frame: TCanvasFrame;
  children?: React.ReactNode;
}

/**
 * Draggable + resizable frame container on the infinite canvas.
 * Position is in canvas coordinates (pre-zoom/pan transform applied by Canvas).
 */
export function CanvasFrame({ frame, children }: CanvasFrameProps) {
  const updateFrame = useCanvasState((s) => s.updateFrame);
  const bringToFront = useCanvasState((s) => s.bringToFront);
  const selectFrame = useCanvasState((s) => s.selectFrame);
  const removeFrame = useCanvasState((s) => s.removeFrame);
  const minimizeFrame = useCanvasState((s) => s.minimizeFrame);
  const selectedFrameId = useCanvasState((s) => s.selectedFrameId);

  const isSelected = selectedFrameId === frame.id;
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag handler for the title bar
  const bindDrag = useDrag(
    ({ offset: [ox, oy], first }) => {
      if (first) bringToFront(frame.id);
      updateFrame(frame.id, { x: ox, y: oy });
    },
    {
      from: () => [frame.x, frame.y],
      filterTaps: true,
    }
  );

  // Resize handler (bottom-right handle)
  const bindResize = useDrag(
    ({ offset: [ox, oy] }) => {
      updateFrame(frame.id, {
        width: Math.max(CANVAS_DEFAULTS.FRAME_MIN_WIDTH, ox),
        height: Math.max(CANVAS_DEFAULTS.FRAME_MIN_HEIGHT, oy),
      });
    },
    {
      from: () => [frame.width, frame.height],
    }
  );

  if (frame.minimized) {
    return (
      <div
        style={{
          position: "absolute",
          left: frame.x,
          top: frame.y,
          zIndex: frame.zIndex,
          width: 200,
        }}
        onClick={() => { bringToFront(frame.id); selectFrame(frame.id); }}
      >
        <div
          {...bindDrag()}
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/90 shadow-md border border-black/10 cursor-grab active:cursor-grabbing select-none"
        >
          <span className="text-xs font-medium text-gray-700 truncate">{frame.title}</span>
          <div className="flex gap-1 ml-2">
            <button
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600"
              onClick={(e) => { e.stopPropagation(); minimizeFrame(frame.id); }}
              aria-label="Expand"
            />
            <button
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
              onClick={(e) => { e.stopPropagation(); removeFrame(frame.id); }}
              aria-label="Close"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        zIndex: frame.zIndex,
      }}
      className={cn(
        "rounded-xl overflow-hidden shadow-lg bg-white border",
        isSelected ? "border-blue-500/60 shadow-blue-500/10" : "border-black/10"
      )}
      onMouseDown={() => { bringToFront(frame.id); selectFrame(frame.id); }}
    >
      {/* Title bar */}
      <div
        {...bindDrag()}
        className="flex items-center justify-between px-3 py-2 bg-white border-b border-black/[0.06] cursor-grab active:cursor-grabbing select-none"
      >
        <span className="text-xs font-medium text-gray-600 truncate">{frame.title}</span>
        <div className="flex gap-1.5 ml-2">
          {/* macOS-style traffic lights */}
          <button
            className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500"
            onClick={(e) => { e.stopPropagation(); minimizeFrame(frame.id); }}
            aria-label="Minimize"
          />
          <button
            className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500"
            onClick={(e) => { e.stopPropagation(); removeFrame(frame.id); }}
            aria-label="Close"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto" style={{ height: frame.height - 36 }}>
        {children ?? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            {frame.title}
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div
        {...bindResize()}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.25) 1px, transparent 1px)",
          backgroundSize: "4px 4px",
          backgroundPosition: "bottom right",
        }}
        aria-label="Resize"
      />
    </div>
  );
}
