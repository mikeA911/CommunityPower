"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Check, KeyRound, LockKeyhole } from "lucide-react";

export function UpdatePasswordForm({ realm }: { realm: "community" | "control" }) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password !== confirm) {
      setFeedback({ kind: "error", text: "The passwords do not match." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, realm }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "We could not update your password.");
      setFeedback({ kind: "success", text: result.message || "Your password has been updated." });
      event.currentTarget.reset();
    } catch (error) {
      setFeedback({ kind: "error", text: error instanceof Error ? error.message : "We could not update your password." });
    } finally { setBusy(false); }
  }

  return <main className="auth-page">
    <section className="auth-page-card">
      <span className="auth-icon"><KeyRound size={24} /></span>
      <span className="eyebrow blue">SECURE ACCOUNT RECOVERY</span>
      <h1>Choose a new password.</h1>
      <p>Your recovery link opened the {realm === "control" ? "Sandz platform" : "community"} workspace.</p>
      <form className="auth-form" onSubmit={submit}>
        <label className="auth-field"><span>New password</span><span className="auth-input"><LockKeyhole size={17} /><input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></span></label>
        <label className="auth-field"><span>Confirm new password</span><span className="auth-input"><LockKeyhole size={17} /><input name="confirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></span></label>
        <p className="password-hint">Use at least 12 characters. A password manager can create and store a unique password for you.</p>
        {feedback && <p className={`auth-feedback ${feedback.kind}`} role="status">{feedback.kind === "success" && <Check size={16} />}{feedback.text}</p>}
        <button className="button button-blue auth-submit" type="submit" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
      </form>
      <Link className="text-link" href="/"><ArrowLeft size={16} /> Back home</Link>
    </section>
  </main>;
}
