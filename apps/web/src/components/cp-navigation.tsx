"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
type Answer = { text: string; source: string; version: number; links?: { label: string; href: string }[] };
export function CPNavigation() {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function ask(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/demo/cp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question }) });
      if (!response.ok) throw new Error();
      setAnswer(await response.json());
    } catch { setError("CP help is unavailable. Open the preview guide or use the direct controls."); }
    finally { setBusy(false); }
  }
  return <details className="bill-card"><summary>Ask CP about features and navigation</summary><p><Link className="text-link" href="/conversations">Open saved CP conversations</Link> for private history, deletion and recall controls.</p><p>This quick help is session-only. Ask where to find a feature or how it works. CP does not read your bills here. Do not enter personal information.</p>
    <form onSubmit={ask}><label>Ask CP<input value={question} onChange={e => setQuestion(e.target.value)} maxLength={500} required placeholder="Where is my bill history?" /></label><button className="button button-blue" disabled={busy}>{busy ? "Opening guide…" : "Ask CP"}</button></form>
    {error && <p role="alert">{error}</p>}{answer && <div role="log" aria-live="polite"><p style={{ whiteSpace: "pre-line" }}>{answer.text}</p><nav aria-label="CP suggested navigation">{answer.links?.map(link => <p key={link.label}><Link className="text-link" href={link.href}>{link.label}</Link></p>)}</nav><Link className="text-link" href={answer.source}>Preview wiki · v{answer.version}</Link></div>}
  </details>;
}
