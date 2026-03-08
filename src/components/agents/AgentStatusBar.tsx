"use client";

import { useAgents } from "./useAgents";
import { AgentStatus } from "@/types/agent";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: "bg-gray-300",
  running: "bg-blue-400 animate-pulse",
  done: "bg-green-400",
  error: "bg-red-400",
};

export function AgentStatusBar() {
  const { configs, sessions, activeAgentId, setActiveAgent } = useAgents();

  if (configs.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-black/10 rounded-full px-3 py-1.5 shadow-sm">
      {configs.map((agent) => {
        const status = sessions[agent.id]?.status ?? "idle";
        return (
          <button
            key={agent.id}
            className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs transition-colors",
              activeAgentId === agent.id
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => setActiveAgent(agent.id)}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_COLORS[status])} />
            {agent.name}
          </button>
        );
      })}
    </div>
  );
}
