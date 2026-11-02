import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { db } from "@/db/client";
import {
  MAX_OUTPUT_TOKENS,
  MAX_QUESTION_LENGTH,
  TOP_K,
  lastUserText,
  toSources,
  type ChatMetadata,
} from "@/lib/chat";
import { embedTexts } from "@/lib/embed";
import { buildSystemPrompt } from "@/lib/prompt";
import { createSqliteVectorStore } from "@/lib/vector-store.sqlite";

const CHAT_MODEL = "claude-sonnet-5";

// TODO(H5): pick the store from VECTOR_STORE_DRIVER once the postgres one exists.
const vectorStore = createSqliteVectorStore(db);

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const messages =
    body && typeof body === "object" && "messages" in body && Array.isArray(body.messages)
      ? (body.messages as UIMessage[])
      : null;

  const question = messages ? lastUserText(messages) : null;
  if (!messages || !question) {
    return Response.json({ error: "Invia almeno un messaggio." }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return Response.json({ error: "Il messaggio è troppo lungo." }, { status: 413 });
  }

  // Embedding of the query uses OpenAI (Anthropic has no embeddings API).
  const [queryEmbedding] = await embedTexts([question]);
  const results = await vectorStore.query(queryEmbedding, TOP_K);

  const result = streamText({
    model: anthropic(CHAT_MODEL),
    system: buildSystemPrompt(results),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });

  const metadata: ChatMetadata = { sources: toSources(results) };
  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => (part.type === "start" ? metadata : undefined),
  });
}
