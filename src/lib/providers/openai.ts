// OpenAI provider — direct browser → OpenAI API (no server proxy)

import { AgentConfig, AgentMessage } from "@/types/agent";
import { StreamCallbacks } from "./anthropic";

export async function streamOpenAIChat(
  config: AgentConfig,
  messages: AgentMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  if (!config.apiKey) {
    callbacks.onError(new Error("OpenAI API key is not set"));
    return;
  }

  const baseUrl = config.baseUrl ?? "https://api.openai.com/v1";
  const formatted = messages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  // Prepend system prompt if configured
  if (config.systemPrompt && formatted[0]?.role !== "system") {
    formatted.unshift({ role: "system", content: config.systemPrompt });
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: formatted,
        max_tokens: config.maxTokens ?? 4096,
        temperature: config.temperature ?? 0.7,
        stream: true,
        stream_options: { include_usage: true },
      }),
    });
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    return;
  }

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => res.statusText);
    callbacks.onError(new Error(`OpenAI API error ${res.status}: ${text}`));
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
          const delta = event.choices?.[0]?.delta?.content;
          if (typeof delta === "string") callbacks.onToken(delta);

          if (event.usage) {
            inputTokens = event.usage.prompt_tokens ?? 0;
            outputTokens = event.usage.completion_tokens ?? 0;
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
