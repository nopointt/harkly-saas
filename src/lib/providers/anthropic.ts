// Anthropic provider — direct browser → Anthropic API (no server proxy)

import { AgentConfig, AgentMessage } from "@/types/agent";

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (usage?: { inputTokens: number; outputTokens: number }) => void;
  onError: (error: Error) => void;
}

export async function streamAnthropicChat(
  config: AgentConfig,
  messages: AgentMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  if (!config.apiKey) {
    callbacks.onError(new Error("Anthropic API key is not set"));
    return;
  }

  const formatted = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens ?? 4096,
        temperature: config.temperature ?? 0.7,
        system: config.systemPrompt,
        messages: formatted,
        stream: true,
      }),
    });
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    return;
  }

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => res.statusText);
    callbacks.onError(new Error(`Anthropic API error ${res.status}: ${text}`));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;

        try {
          const event = JSON.parse(data);
          if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
            callbacks.onToken(event.delta.text ?? "");
          }
          if (event.type === "message_delta" && event.usage) {
            outputTokens = event.usage.output_tokens ?? 0;
          }
          if (event.type === "message_start" && event.message?.usage) {
            inputTokens = event.message.usage.input_tokens ?? 0;
          }
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  callbacks.onDone({ inputTokens, outputTokens });
}
