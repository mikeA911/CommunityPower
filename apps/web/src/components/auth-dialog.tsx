"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, KeyRound, LockKeyhole, Mail, ShieldCheck, UserPlus, X } from "lucide-react";

type View = "login" | "signup" | "forgot";
type Realm = "community" | "control";

type ApiResult = {
  message?: string;
  redirectTo?: string;
};

export function AuthDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const emailField = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<View>("login");
  const [realm, setRealm] = useState<Realm>("community");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const current = dialog.current;
    if (!current) return;
    const close = () => {
      setFeedback(null);
      setBusy(false);
      setView("login");
    };
    current.addEventListener("close", close);
    return () => current.removeEventListener("close", close);
  }, []);

  function open() {
    dialog.current?.showModal();
    window.setTimeout(() => emailField.current?.focus(), 0);
  }

  function changeView(next: View) {
    setFeedback(null);
    setView(next);
    window.setTimeout(() => emailField.current?.focus(), 0);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setBusy(true);
    setFeedback(null);
    try {
      const endpoint = view === "forgot" ? "/api/auth/reset-password" : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, realm }),
      });
      const result = await response.json() as ApiResult;
      if (!response.ok) throw new Error(result.message || "We could not complete that request.");
      if (result.redirectTo) {
        window.location.assign(result.redirectTo);
        return;
      }
      setFeedback({ kind: "success", text: result.message || "Check your email for the next step." });
    } catch (error) {
      setFeedback({ kind: "error", text: error instanceof Error ? error.message : "We could not complete that request." });
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button className="button button-ghost auth-launcher" type="button" onClick={open}><LockKeyhole size={16} /> Sign up / Log in</button>
    <dialog ref={dialog} className="auth-dialog" onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="auth-dialog-top">
        <span className="auth-icon"><KeyRound size={22} /></span>
        <button className="icon-button" type="button" aria-label="Close sign in" onClick={() => dialog.current?.close()}><X size={20} /></button>
      </div>
      <span className="eyebrow blue">COMMUNITY POWER ACCESS</span>
      <h2>{view === "login" ? "Welcome back." : view === "forgot" ? "Reset your password." : "Join your community."}</h2>
      <p className="auth-intro">{view === "login" ? "Choose your workspace and sign in with your invited account." : view === "forgot" ? "We’ll send recovery instructions if an account matches this email and workspace." : "Community Power is invitation-only during the pilot. This keeps each community and its data boundary clear."}</p>

      {view !== "signup" && <form className="auth-form" onSubmit={submit}>
        <fieldset className="realm-picker">
          <legend>Where are you signing in?</legend>
          <label className={realm === "community" ? "selected" : ""}><input type="radio" name="realm" value="community" checked={realm === "community"} onChange={() => setRealm("community")} /><span><strong>My community</strong><small>Consumers and community admins</small></span></label>
          <label className={realm === "control" ? "selected" : ""}><input type="radio" name="realm" value="control" checked={realm === "control"} onChange={() => setRealm("control")} /><span><strong>Sandz platform</strong><small>Support and maintenance admins</small></span></label>
        </fieldset>
        <label className="auth-field"><span>Email address</span><span className="auth-input"><Mail size={17} /><input ref={emailField} name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></span></label>
        {view === "login" && <label className="auth-field"><span>Password</span><span className="auth-input"><LockKeyhole size={17} /><input name="password" type="password" autoComplete="current-password" minLength={8} required /></span></label>}
        {feedback && <p className={`auth-feedback ${feedback.kind}`} role="status">{feedback.kind === "success" && <Check size={16} />}{feedback.text}</p>}
        <button className="button button-blue auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : view === "forgot" ? "Send reset link" : "Log in"}<ArrowRight size={17} /></button>
        {view === "login" ? <button className="text-link auth-text-button" type="button" onClick={() => changeView("forgot")}>Forgot password?</button> : <button className="text-link auth-text-button" type="button" onClick={() => changeView("login")}>Back to log in</button>}
      </form>}

      {view === "signup" && <div className="signup-panel">
        <ShieldCheck size={25} />
        <div><strong>Access starts with an invitation</strong><p>Community admins invite consumers. Sandz platform admins create the first community-admin account, then the invited person sets their password using the secure email link.</p></div>
        <button className="button button-blue" type="button" onClick={() => changeView("login")}>I already have access <ArrowRight size={16} /></button>
      </div>}

      <div className="auth-switch">{view === "signup" ? <>Already invited? <button type="button" onClick={() => changeView("login")}>Log in</button></> : <>New to Community Power? <button type="button" onClick={() => changeView("signup")}><UserPlus size={14} /> How sign-up works</button></>}</div>
    </dialog>
  </>;
}
