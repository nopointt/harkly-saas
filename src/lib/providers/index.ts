// Provider dispatch — routes to the correct provider based on AgentConfig

import { AgentConfig, AgentMessage } from "@/types/agent";
import { StreamCallbacks, streamAnthropicChat } from "./anthropic";
import { streamOpenAIChat } from "./openai";
import { streamOllamaChat } from "./ollama";

export type { StreamCallbacks };

export async function streamChat(
  config: AgentConfig,
  messages: AgentMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  switch (config.provider) {
    case "anthropic":
      return streamAnthropicChat(config, messages, callbacks);
    case "openai":
    case "custom":
      return streamOpenAIChat(config, messages, callbacks);
    case "ollama":
      return streamOllamaChat(config, messages, callbacks);
    default: {
      const exhaustive: never = config.provider;
      callbacks.onError(new Error(`Unknown provider: ${exhaustive}`));
    }
  }
}
