"use client";

import { useChatState } from "@/components/chat/useChatState";
import { cn } from "@/lib/utils";

interface FloorBadgeProps {
  floorNumber?: number;
}

/**
 * Floor indicator — shows current floor number, coordinates placeholder, and avatar.
 * Mirrors the chat panel position: right side when chat is left/center, left side when chat is right.
 */
export function FloorBadge({ floorNumber = 3 }: FloorBadgeProps) {
  const { position } = useChatState();
  const isRight = position === "right";

  return (
    <div
      className={cn(
        "absolute top-6 z-40 flex items-center gap-2.5 pointer-events-none select-none",
        isRight ? "left-6" : "right-6"
      )}
    >
      {/* Floor number */}
      <span className="text-sm font-medium text-black tracking-tight">
        {floorNumber}
      </span>

      {/* Coordinates pill */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full">
        <span className="text-xs text-gray-400 tabular-nums leading-none">0, 0</span>
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-white leading-none">N</span>
      </div>
    </div>
  );
}
