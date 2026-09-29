"use client";
import { useState } from "react";
import { ArrowUpRight, Copy } from "lucide-react";
import { brand } from "@/lib/brand";
export function ProjectBrief() {
  const [message, setMessage] = useState("");
  const [brief, setBrief] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = `Hi Edgar,\n\n${data.get("message")}\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nProject: ${data.get("service")}\nTimeline: ${data.get("timeline") || "To discuss"}`;
    setBrief(body);
    window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent("A project worth going all in on")}&body=${encodeURIComponent(body)}`;
    setMessage(
      "Your brief is ready in your email app. Send it there to start the conversation. If it didn’t open, copy your brief below and email it to contact@edgaracosta.com.",
    );
  }
  return (
    <form className="project-brief" onSubmit={submit}>
      <label>
        Your name
        <input
          name="name"
          required
          autoComplete="name"
          maxLength={100}
          placeholder="Name"
        />
      </label>
      <label>
        Your email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          maxLength={200}
          placeholder="you@company.com"
        />
      </label>
      <label>
        What are we making?
        <select name="service">
          <option>Brand strategy & direction</option>
          <option>Art direction & campaign</option>
          <option>Website & digital experience</option>
          <option>Design & visual identity</option>
          <option>Copywriting</option>
          <option>Something else entirely</option>
        </select>
      </label>
      <label>
        When are you thinking?
        <input
          name="timeline"
          maxLength={120}
          placeholder="A date, a season, or let’s talk"
        />
      </label>
      <label className="brief-wide">
        Tell me what’s at stake
        <textarea
          name="message"
          required
          rows={5}
          maxLength={3000}
          placeholder="The idea. The challenge. What you want people to feel."
        />
      </label>
      <div className="brief-wide brief-footer">
        <p>
          You work directly with me. Share a little about your ambition and I’ll
          get back to you personally. This opens your email app.
        </p>
        <button className="studio-button" type="submit">
          Let’s get into it <ArrowUpRight size={18} />
        </button>
      </div>
      {message && (
        <div className="brief-wide" role="status">
          <p>{message}</p>
          <button
            type="button"
            className="studio-text-link"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(brief);
                setMessage(
                  "Brief copied. Paste it into an email to contact@edgaracosta.com.",
                );
              } catch {
                setMessage(
                  "Copy the brief below and email it to contact@edgaracosta.com.",
                );
              }
            }}
          >
            <Copy size={15} /> Copy your brief
          </button>
          <details>
            <summary>Read your brief</summary>
            <pre style={{ whiteSpace: "pre-wrap", font: "inherit" }}>
              {brief}
            </pre>
          </details>
        </div>
      )}
    </form>
  );
}
