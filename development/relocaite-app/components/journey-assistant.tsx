"use client";

import { Bot, ExternalLink, Send, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type { JourneyProfile } from "@/lib/journey-profile";
import { curatedAnswer } from "@/lib/relocation-assistant";

type Message = {
  role: "assistant" | "user";
  text: string;
  link?: { label: string; url: string };
};
export function JourneyAssistant({ profile }: { profile: JourneyProfile }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! Ask me anything about your move to Germany. I can help you understand housing, Anmeldung, documents, contracts and visa-preparation steps.",
    },
  ]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, profile }),
      });
      if (!response.ok) throw new Error("Assistant request failed");
      const data = (await response.json()) as { text?: unknown; link?: Message["link"]; mode?: unknown };
      if (typeof data.text !== "string" || !data.text.trim()) throw new Error("Assistant returned no answer");
      const answerText = data.text;
      setMessages((current) => [...current, { role: "assistant", text: answerText, ...(data.link ? { link: data.link } : {}) }]);
      if (data.mode === "curated") setNotice("Using built-in guidance while live AI is unavailable.");
    } catch {
      const fallback = curatedAnswer(question, profile);
      setMessages((current) => [...current, { role: "assistant", ...fallback }]);
      setNotice("Using built-in guidance while live AI is unavailable.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="chat-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR RELOCATION ASSISTANT</p>
          <h1>How can I help?</h1>
          <p>Ask a question about your next step.</p>
        </div>
      </div>
      <section className="panel chat-panel">
        <header>
          <span>
            <Bot />
          </span>
          <div>
            <h2>RelocAIte Assistant</h2>
            <p>Contextual preparation guidance · not legal advice</p>
          </div>
        </header>
        <div className="chat-messages" aria-live="polite">
          {messages.map((message, index) => (
            <article
              className={`chat-message ${message.role}`}
              key={`${message.role}-${index}`}
            >
              <span>
                {message.role === "assistant" ? <Bot /> : <UserRound />}
              </span>
              <div>
                <p>{message.text}</p>
                {message.link && (
                  <a href={message.link.url} target="_blank" rel="noreferrer">
                    {message.link.label}
                    <ExternalLink />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
        <form className="chat-composer" onSubmit={submit}>
          <label>
            <span className="sr-only">Ask RelocAIte Assistant</span>
            <textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Ask about renting, Anmeldung, documents, visas…"
              maxLength={500}
              disabled={busy}
            />
          </label>
          <Button
            type="submit"
            disabled={!input.trim() || busy}
            aria-label="Send question"
          >
            <Send />
          </Button>
        </form>
        {busy && <p className="chat-disclaimer">Preparing a short answer…</p>}
        {notice && <p className="chat-disclaimer">{notice}</p>}
        <p className="chat-disclaimer">
          Questions and confirmed session facts may be sent transiently to OpenAI when configured. Responses are preparation guidance, not legal or tax advice.
        </p>
      </section>
    </div>
  );
}
