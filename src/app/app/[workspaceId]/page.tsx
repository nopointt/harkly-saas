"use client";

import { use } from "react";
import { Canvas } from "@/components/canvas/Canvas";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { Omnibar } from "@/components/omnibar/Omnibar";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default function WorkspacePage(props: WorkspacePageProps) {
  const { workspaceId } = use(props.params);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex" style={{ backgroundColor: "#FFF8E7" }}>
      <Canvas />
      <CanvasToolbar />
      <ChatPanel />
      <Omnibar workspaceId={workspaceId} />
    </div>
  );
}
