"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AgentConfig, AgentMessage, AgentSession, AgentStatus, AgentStore } from "@/types/agent";

const DEFAULT_AGENT: AgentConfig = {
  id: "default",
  name: "Assistant",
  provider: "anthropic",
  model: "claude-sonnet-4-6",
  apiKey: "",
  systemPrompt: "You are a research assistant helping with desk research and analysis.",
  temperature: 0.7,
  maxTokens: 4096,
};

export const useAgents = create<AgentStore>()(
  persist(
    (set, get) => ({
      configs: [DEFAULT_AGENT],
      sessions: {},
      activeAgentId: "default",

      addAgent: (config) =>
        set((state) => ({ configs: [...state.configs, config] })),

      updateAgent: (id, patch) =>
        set((state) => ({
          configs: state.configs.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      removeAgent: (id) =>
        set((state) => ({
          configs: state.configs.filter((c) => c.id !== id),
          activeAgentId: state.activeAgentId === id ? null : state.activeAgentId,
        })),

      setActiveAgent: (id) => set({ activeAgentId: id }),

      startSession: (agentId) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [agentId]: {
              agentId,
              messages: [],
              status: "idle",
            },
          },
        })),

      appendMessage: (agentId, message) =>
        set((state) => {
          const session = state.sessions[agentId] ?? {
            agentId,
            messages: [],
            status: "idle" as AgentStatus,
          };
          return {
            sessions: {
              ...state.sessions,
              [agentId]: {
                ...session,
                messages: [...session.messages, message],
              },
            },
          };
        }),

      updateLastMessage: (agentId, patch) =>
        set((state) => {
          const session = state.sessions[agentId];
          if (!session || session.messages.length === 0) return state;
          const messages = [...session.messages];
          messages[messages.length - 1] = { ...messages[messages.length - 1], ...patch };
          return {
            sessions: {
              ...state.sessions,
              [agentId]: { ...session, messages },
            },
          };
        }),

      setSessionStatus: (agentId, status, error) =>
        set((state) => {
          const session = state.sessions[agentId] ?? {
            agentId,
            messages: [],
            status,
          };
          return {
            sessions: {
              ...state.sessions,
              [agentId]: { ...session, status, error },
            },
          };
        }),

      clearSession: (agentId) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [agentId]: { agentId, messages: [], status: "idle" },
          },
        })),
    }),
    {
      name: "harkly-agents",
      storage: createJSONStorage(() => localStorage),
      // Don't persist session messages — only persist configs
      partialize: (state) => ({
        configs: state.configs,
        activeAgentId: state.activeAgentId,
      }),
    }
  )
);
