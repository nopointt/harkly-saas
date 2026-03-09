"use client";

import { useAgents } from "./useAgents";

interface AgentStatusBarProps {
  onAgentsClick?: () => void;
}

function PauseIcon() {
  return (
    <span className="flex items-center gap-[2px]">
      <span className="w-[2px] h-[7px] bg-gray-400 rounded-[1px] inline-block" />
      <span className="w-[2px] h-[7px] bg-gray-400 rounded-[1px] inline-block" />
    </span>
  );
}

function PlayIcon() {
  return (
    <span
      className="inline-block w-0 h-0"
      style={{
        borderTop: "3px solid transparent",
        borderBottom: "3px solid transparent",
        borderLeft: "5px solid #9ca3af",
      }}
    />
  );
}

export function AgentStatusBar({ onAgentsClick }: AgentStatusBarProps) {
  const { configs, sessions } = useAgents();

  return (
    <div className="flex items-center gap-2 px-3 h-9 bg-white border-t border-gray-100">
      {configs.map((agent) => {
        const status = sessions[agent.id]?.status ?? "idle";
        const isActive = status === "running";

        if (isActive) {
          return (
            <span
              key={agent.id}
              className="flex items-center gap-1 text-xs italic text-gray-500"
            >
              <PauseIcon />
              {agent.name}...
            </span>
          );
        }

        return (
          <span key={agent.id} className="flex items-center gap-1">
            <PlayIcon />
          </span>
        );
      })}

      <span
        className="ml-auto text-xs text-gray-400 hover:text-black transition-colors cursor-pointer"
        onClick={onAgentsClick}
      >
        Agents
      </span>
    </div>
  );
}
