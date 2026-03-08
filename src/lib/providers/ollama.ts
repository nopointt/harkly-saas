// Ollama provider — local inference (default: http://localhost:11434)

import { AgentConfig, AgentMessage } from "@/types/agent";
import { StreamCallbacks } from "./anthropic";

export async function streamOllamaChat(
  config: AgentConfig,
  messages: AgentMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  const baseUrl = config.baseUrl ?? "http://localhost:11434";
  const formatted = messages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  if (config.systemPrompt && formatted[0]?.role !== "system") {
    formatted.unshift({ role: "system", content: config.systemPrompt });
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        messages: formatted,
        stream: true,
        options: {
          temperature: config.temperature ?? 0.7,
          num_predict: config.maxTokens ?? 4096,
        },
      }),
    });
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    return;
  }

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => res.statusText);
    callbacks.onError(new Error(`Ollama API error ${res.status}: ${text}`));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value, { stream: true }).split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          if (event.message?.content) callbacks.onToken(event.message.content);
          if (event.done) {
            callbacks.onDone();
            return;
          }
        } catch {
          // Skip malformed lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  callbacks.onDone();
}
