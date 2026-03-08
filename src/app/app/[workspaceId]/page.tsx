"use client";

import { Canvas } from "@/components/canvas/Canvas";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { AgentStatusBar } from "@/components/agents/AgentStatusBar";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default function WorkspacePage(_props: WorkspacePageProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#faf8f0] flex">
      {/* Infinite canvas */}
      <Canvas />

      {/* Module spawner toolbar */}
      <CanvasToolbar />

      {/* Floating chat panel */}
      <ChatPanel />

      {/* Agent status bar */}
      <AgentStatusBar />
    </div>
  );
}
