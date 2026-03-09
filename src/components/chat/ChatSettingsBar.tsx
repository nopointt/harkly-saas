"use client";

import { useChatState } from "./useChatState";
import { useAgents } from "@/components/agents/useAgents";
import { ChatPanelPosition } from "@/types/chat";

export function ChatSettingsBar() {
  const { position, setPosition } = useChatState();
  const { configs, activeAgentId } = useAgents();
  const activeAgent = configs.find((c) => c.id === activeAgentId) ?? configs[0];

  const handleLeft = () => {
    if (position === "center") setPosition("left" as ChatPanelPosition);
    if (position === "right") setPosition("center" as ChatPanelPosition);
  };

  const handleRight = () => {
    if (position === "center") setPosition("right" as ChatPanelPosition);
    if (position === "left") setPosition("center" as ChatPanelPosition);
  };

  const showLeft = position === "center" || position === "right";
  const showRight = position === "center" || position === "left";

  return (
    <div className="flex items-center gap-3 px-3 h-9 bg-white border-t border-gray-100 text-xs text-gray-400">
      {/* Position controls */}
      {showLeft && (
        <button
          onClick={handleLeft}
          className="hover:text-black transition-colors"
          aria-label="Move left"
        >
          ←
        </button>
      )}
      {showRight && (
        <button
          onClick={handleRight}
          className="hover:text-black transition-colors"
          aria-label="Move right"
        >
          →
        </button>
      )}

      {(showLeft || showRight) && (
        <span className="w-px h-3 bg-gray-100 flex-shrink-0" />
      )}

      {/* Attachment */}
      <button
        className="hover:text-black transition-colors"
        aria-label="Attach file"
      >
        ⊕
      </button>

      {/* Model selector */}
      <button className="hover:text-black transition-colors whitespace-nowrap">
        {activeAgent?.name ?? "No agent"}
      </button>

      {/* Right group */}
      <div className="ml-auto flex items-center gap-3">
        <button className="hover:text-black transition-colors">Modes</button>
        <button className="hover:text-black transition-colors">Scripts</button>
        <button className="hover:text-black transition-colors">MCP</button>
        <span className="w-px h-3 bg-gray-100 flex-shrink-0" />
        <button className="hover:text-black transition-colors tabular-nums">
          50K/128K
        </button>
      </div>
    </div>
  );
}
