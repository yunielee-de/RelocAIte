"use client";

import { Bot, ExternalLink, Send, Sparkles, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type { JourneyProfile } from "@/lib/journey-profile";
import { fieldValue, salaryLabel } from "@/lib/journey-profile";

type Message = {
  role: "assistant" | "user";
  text: string;
  link?: { label: string; url: string };
};
const housingGuide =
  "https://willkommenszentrum.berlin.de/wohnen/wohnungssuche";
const anmeldungGuide = "https://service.berlin.de/dienstleistung/120686/";
const scamGuide =
  "https://www.verbraucherzentrale-berlin.de/wissen/vertraege-reklamation/abzocke/fakewohnungen-im-internet-so-erkennen-sie-falsche-immobilienanzeigen-27576";

function answer(question: string, profile: JourneyProfile): Message {
  const q = question.toLowerCase();
  if (/wohnung|apartment|flat|housing|rent|landlord/.test(q) && !/scam|fraud|fake|safe|legit|deposit/.test(q))
    return {
      role: "assistant",
      text: "For a housing search, prepare your ID, proof of income, employment contract and—if requested—SCHUFA information. Never transfer a deposit before verifying the property and landlord, and confirm that registration at the address is permitted.",
      link: { label: "Berlin housing guidance", url: housingGuide },
    };
  if (/scam|fraud|fake|safe|legit|deposit/.test(q))
    return {
      role: "assistant",
      text: "Warning signs include unusually low rent, pressure to pay before a viewing, a landlord who cannot meet or arrange a video viewing, requests to leave the rental platform, and missing address or contract details. Verify independently before sharing money or sensitive documents.",
      link: { label: "Rental-scam guidance", url: scamGuide },
    };
  if (/anmeldung|register|registration|bürgeramt|address/.test(q))
    return {
      role: "assistant",
      text: "After moving in, check the registration process for your municipality. In Berlin, registration is generally required within 14 days. Prepare your identity document, signed registration form and Wohnungsgeberbestätigung; additional documents can depend on your situation.",
      link: { label: "Official Berlin Anmeldung service", url: anmeldungGuide },
    };
  if (/visa|blue card|residence/.test(q))
    return {
      role: "assistant",
      text: "Your potential visa route depends on nationality, qualification, role, salary and other conditions. Use RelocAIte’s visa preparation step to review your confirmed facts, then verify the current requirements with the responsible German mission.",
    };
  if (/salary|income|pay/.test(q))
    return {
      role: "assistant",
      text: `Your profile currently shows ${salaryLabel(profile)}. RelocAIte carries confirmed base pay forward for preparation, but landlords and authorities may still request original payslips, contracts or employer evidence.`,
    };
  if (/contract|job offer|employer/.test(q)) {
    const employer = fieldValue(profile.employment.employer);
    return {
      role: "assistant",
      text: `${employer ? `Your profile lists ${employer}. ` : ""}Review the role, salary, working location, hours, probation period and notice terms before signing. Ask the employer to clarify anything missing or inconsistent.`,
    };
  }
  if (/document|upload|passport|schufa/.test(q))
    return {
      role: "assistant",
      text: "Use the Document Vault to track which records are available. Files selected for preview remain on your device; only their filename and readiness status are saved in the browser.",
    };
  return {
    role: "assistant",
    text: "I can help with housing searches, rental-scam warning signs, Anmeldung, documents, contracts, salary and visa preparation. Tell me which step you are working on and what is unclear.",
  };
}

export function JourneyAssistant({ profile }: { profile: JourneyProfile }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! Ask me anything about your move to Germany. I can help you understand housing, Anmeldung, documents, contracts and visa-preparation steps.",
    },
  ]);
  function submit(event: FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      answer(question, profile),
    ]);
    setInput("");
  }
  return (
    <div className="chat-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR RELOCATION ASSISTANT</p>
          <h1>How can I help?</h1>
          <p>Ask a question about your next step.</p>
        </div>
        <span className="pill blue">
          <Sparkles /> Interactive preview
        </span>
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
            />
          </label>
          <Button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send question"
          >
            <Send />
          </Button>
        </form>
        <p className="chat-disclaimer">
          This demo uses curated guidance and does not send your question to an
          external AI provider.
        </p>
      </section>
    </div>
  );
}
