// ─── Agent Types ──────────────────────────────────────────────────────────────

export type AgentProvider = "anthropic" | "openai" | "ollama" | "custom";

export type AgentStatus = "idle" | "running" | "error" | "done";

export interface AgentConfig {
  id: string;
  name: string;
  provider: AgentProvider;
  model: string;
  /** Stored in localStorage only — never sent to Harkly server */
  apiKey: string;
  /** For Ollama or custom providers */
  baseUrl?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentMessage {
  id: string;
  agentId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  /** Set when streaming is in progress */
  streaming?: boolean;
}

export interface AgentSession {
  agentId: string;
  messages: AgentMessage[];
  status: AgentStatus;
  error?: string;
  /** Token usage for the current session */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export type AgentStore = {
  configs: AgentConfig[];
  sessions: Record<string, AgentSession>;
  activeAgentId: string | null;

  // Config actions
  addAgent: (config: AgentConfig) => void;
  updateAgent: (id: string, patch: Partial<AgentConfig>) => void;
  removeAgent: (id: string) => void;
  setActiveAgent: (id: string | null) => void;

  // Session actions
  startSession: (agentId: string) => void;
  appendMessage: (agentId: string, message: AgentMessage) => void;
  updateLastMessage: (agentId: string, patch: Partial<AgentMessage>) => void;
  setSessionStatus: (agentId: string, status: AgentStatus, error?: string) => void;
  clearSession: (agentId: string) => void;
};
