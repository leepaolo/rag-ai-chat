"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useState, type SyntheticEvent } from "react";

import type { ChatMetadata } from "@/lib/chat";

export function Chat() {
  const { messages, sendMessage, status, error } = useChat<UIMessage<ChatMetadata>>();
  const [input, setInput] = useState("");

  const busy = status === "submitted" || status === "streaming";

  function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    void sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ul className="flex flex-1 flex-col gap-4">
        {messages.map((message) => (
          <li
            key={message.id}
            className={
              message.role === "user"
                ? "self-end rounded-xl bg-subtle px-4 py-2 text-subtle-ink"
                : "self-start rounded-xl border border-border bg-surface-raised px-4 py-2 text-ink"
            }
          >
            {message.parts.map((part, index) =>
              part.type === "text" ? (
                <p key={index} className="whitespace-pre-wrap">
                  {part.text}
                </p>
              ) : null,
            )}
          </li>
        ))}
        {status === "submitted" && <li className="text-label text-ink-muted">Sto cercando…</li>}
      </ul>

      {error && (
        <p role="alert" className="text-label text-danger">
          Si è verificato un errore. Riprova tra poco.
        </p>
      )}

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Scrivi una domanda…"
          aria-label="Domanda"
          maxLength={1000}
          className="flex-1 rounded-md border border-input-border bg-surface px-3 py-2 text-ink outline-ring"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-button text-primary-ink disabled:opacity-50"
        >
          Invia
        </button>
      </form>
    </div>
  );
}
