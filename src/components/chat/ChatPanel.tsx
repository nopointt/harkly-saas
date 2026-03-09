"use client";

import { CSSProperties, useRef, useState, useCallback, FormEvent } from "react";
import { useChatState } from "./useChatState";
import { useAgents } from "@/components/agents/useAgents";
import { streamChat } from "@/lib/providers";
import { AgentMessage } from "@/types/agent";
import { ChatPanelPosition, ChatPanelSize } from "@/types/chat";
import { AgentStatusBar } from "@/components/agents/AgentStatusBar";
import { ChatSettingsBar } from "./ChatSettingsBar";

const POSITION_STYLES: Record<ChatPanelPosition, CSSProperties> = {
  left:   { left: 0 },
  center: { left: "50%", transform: "translateX(-50%)" },
  right:  { right: 0 },
};

// Panel anchors to bottom; height varies by size
const PANEL_STYLES: Record<ChatPanelSize, CSSProperties> = {
  max:    { top: 0, bottom: 0 },
  half:   { bottom: 0, height: "50vh" },
  hidden: { bottom: 0, height: "15px" },
};

export function ChatPanel() {
  const { position, size, width, cycleSize } = useChatState();
  const { configs, sessions, activeAgentId, appendMessage, updateLastMessage, setSessionStatus } = useAgents();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamedContentRef = useRef("");

  const activeAgent = configs.find((c) => c.id === activeAgentId) ?? configs[0];
  const session = activeAgent ? sessions[activeAgent.id] : null;
  const messages = session?.messages ?? [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!input.trim() || sending || !activeAgent) return;

      const userMsg: AgentMessage = {
        id: crypto.randomUUID(),
        agentId: activeAgent.id,
        role: "user",
        content: input.trim(),
        timestamp: Date.now(),
      };

      appendMessage(activeAgent.id, userMsg);
      setInput("");
      setSending(true);
      setSessionStatus(activeAgent.id, "running");
      scrollToBottom();

      appendMessage(activeAgent.id, {
        id: crypto.randomUUID(),
        agentId: activeAgent.id,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        streaming: true,
      });
      streamedContentRef.current = "";

      await streamChat(activeAgent, [...messages, userMsg], {
        onToken: (token) => {
          streamedContentRef.current += token;
          updateLastMessage(activeAgent.id, { content: streamedContentRef.current, streaming: true });
          scrollToBottom();
        },
        onDone: () => {
          updateLastMessage(activeAgent.id, { streaming: false });
          setSessionStatus(activeAgent.id, "done");
          setSending(false);
        },
        onError: (err) => {
          updateLastMessage(activeAgent.id, { content: `[Error: ${err.message}]`, streaming: false });
          setSessionStatus(activeAgent.id, "error", err.message);
          setSending(false);
        },
      });
    },
    [input, sending, activeAgent, messages, appendMessage, updateLastMessage, setSessionStatus, scrollToBottom]
  );

  return (
    // Outer: full viewport height, positioned horizontally only
    <div
      className="absolute z-50 top-0 bottom-0"
      style={{ ...POSITION_STYLES[position], width }}
    >
      {/* Panel: anchors to bottom, height driven by size */}
      <div
        className="absolute left-0 right-0 flex flex-col bg-white border border-gray-100 overflow-hidden transition-all duration-200"
        style={PANEL_STYLES[size]}
      >
        {/* Tab handle — always at top center, inside panel */}
        <button
          onClick={cycleSize}
          className="flex-shrink-0 flex justify-center items-center h-4 w-full hover:bg-black/5 transition-colors"
          aria-label="Cycle chat size"
        >
          <span className="w-8 h-1 bg-gray-200 rounded-full block" />
        </button>

        {/* Content — hidden when size === "hidden" */}
        {size !== "hidden" && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
              {messages.length === 0 && (
                <p className="text-xs text-gray-300 text-center mt-8 select-none">
                  Ask anything about your research
                </p>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user" ? "bg-black text-white" : "bg-gray-50 text-black"
                    }`}
                  >
                    {msg.content}
                    {msg.streaming && <span className="inline-block w-1 h-3 ml-0.5 bg-current animate-pulse" />}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Agent status bar */}
            <AgentStatusBar onAgentsClick={() => {}} />

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100">
              <input
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-300"
                placeholder={activeAgent?.apiKey ? "Message..." : "Set API key in settings"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending || !activeAgent?.apiKey}
              />
              <button
                type="submit"
                disabled={sending || !input.trim() || !activeAgent?.apiKey}
                className="w-6 h-6 bg-black text-white text-xs flex items-center justify-center rounded-full disabled:opacity-30 hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                ↑
              </button>
            </form>

            {/* Settings bar */}
            <ChatSettingsBar />
          </>
        )}
      </div>
    </div>
  );
}
