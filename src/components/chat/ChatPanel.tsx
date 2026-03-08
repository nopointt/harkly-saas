"use client";

import { useRef, useState, useCallback, FormEvent } from "react";
import { useChatState } from "./useChatState";
import { useAgents } from "@/components/agents/useAgents";
import { streamChat } from "@/lib/providers";
import { AgentMessage } from "@/types/agent";
import { cn } from "@/lib/utils";
import { CHAT_DEFAULTS, ChatPanelPosition } from "@/types/chat";

const POSITION_CLASSES: Record<ChatPanelPosition, string> = {
  left: "left-0 top-0 bottom-0",
  center: "left-1/2 -translate-x-1/2 top-0 bottom-0",
  right: "right-0 top-0 bottom-0",
};

export function ChatPanel() {
  const { position, collapsed, width, setPosition, toggleCollapsed } = useChatState();
  const { configs, sessions, activeAgentId, setActiveAgent, appendMessage, updateLastMessage, setSessionStatus } =
    useAgents();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Accumulates streamed tokens without stale closure
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

      const assistantMsgId = crypto.randomUUID();
      const assistantMsg: AgentMessage = {
        id: assistantMsgId,
        agentId: activeAgent.id,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        streaming: true,
      };
      appendMessage(activeAgent.id, assistantMsg);
      streamedContentRef.current = "";

      await streamChat(activeAgent, [...messages, userMsg], {
        onToken: (token) => {
          streamedContentRef.current += token;
          updateLastMessage(activeAgent.id, {
            content: streamedContentRef.current,
            streaming: true,
          });
          scrollToBottom();
        },
        onDone: (usage) => {
          updateLastMessage(activeAgent.id, { streaming: false });
          setSessionStatus(activeAgent.id, "done");
          setSending(false);
        },
        onError: (err) => {
          updateLastMessage(activeAgent.id, {
            content: `[Error: ${err.message}]`,
            streaming: false,
          });
          setSessionStatus(activeAgent.id, "error", err.message);
          setSending(false);
        },
      });
    },
    [input, sending, activeAgent, messages, appendMessage, updateLastMessage, setSessionStatus, scrollToBottom, streamedContentRef]
  );

  if (collapsed) {
    return (
      <button
        className={cn(
          "absolute z-50 flex items-center justify-center w-8 h-16 bg-white/90 border border-black/10 shadow-md rounded-l-lg",
          position === "right" ? "right-0 top-1/2 -translate-y-1/2 rounded-r-none" : "left-0 top-1/2 -translate-y-1/2 rounded-l-none"
        )}
        onClick={toggleCollapsed}
        aria-label="Expand chat"
      >
        <span className="text-xs text-gray-500">{position === "right" ? "←" : "→"}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "absolute z-50 flex flex-col bg-white/95 backdrop-blur-sm border-l border-black/10 shadow-xl",
        POSITION_CLASSES[position]
      )}
      style={{ width }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/[0.06] bg-white/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">Chat</span>
          {activeAgent && (
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {activeAgent.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Position switcher */}
          {(["left", "center", "right"] as ChatPanelPosition[]).map((pos) => (
            <button
              key={pos}
              className={cn(
                "w-5 h-5 rounded text-[10px]",
                position === pos ? "bg-gray-200 text-gray-700" : "text-gray-400 hover:text-gray-600"
              )}
              onClick={() => setPosition(pos)}
              aria-label={`Move to ${pos}`}
            >
              {pos === "left" ? "⬅" : pos === "center" ? "⬛" : "➡"}
            </button>
          ))}
          <button
            className="ml-1 w-5 h-5 rounded text-gray-400 hover:text-gray-600 text-xs"
            onClick={toggleCollapsed}
            aria-label="Collapse"
          >
            ×
          </button>
        </div>
      </div>

      {/* Agent selector */}
      {configs.length > 1 && (
        <div className="px-3 py-1.5 border-b border-black/[0.04]">
          <select
            className="w-full text-xs bg-transparent text-gray-600 outline-none"
            value={activeAgent?.id ?? ""}
            onChange={(e) => setActiveAgent(e.target.value)}
          >
            {configs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.model})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-xs text-gray-400 text-center mt-8">
            Ask anything about your research
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                msg.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-800"
              )}
            >
              {msg.content}
              {msg.streaming && (
                <span className="inline-block w-1 h-3 ml-0.5 bg-current animate-pulse" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-3 py-3 border-t border-black/[0.06]">
        <div className="flex gap-2">
          <input
            className="flex-1 text-xs bg-gray-50 border border-black/10 rounded-lg px-3 py-2 outline-none focus:border-gray-400 placeholder:text-gray-400"
            placeholder={activeAgent?.apiKey ? "Message..." : "Set API key in agent settings"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending || !activeAgent?.apiKey}
          />
          <button
            type="submit"
            disabled={sending || !input.trim() || !activeAgent?.apiKey}
            className="px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-gray-700 transition-colors"
          >
            {sending ? "..." : "↑"}
          </button>
        </div>
      </form>
    </div>
  );
}
