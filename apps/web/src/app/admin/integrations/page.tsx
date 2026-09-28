"use client";
import Link from "next/link";
import { useState } from "react";
export default function IntegrationChecks() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function check() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/tavily-check", { method: "POST", cache: "no-store" });
      const result = await response.json();
      setMessage(result.message || "The check could not complete.");
    } catch { setMessage("Could not reach the check. Please try again later."); }
    finally { setBusy(false); }
  }
  return <main className="bills-page"><Link className="text-link" href="/">Home / sign in</Link><h1>Integration checks</h1>
    <section className="bill-card"><h2>Tavily connection</h2><p>Sign in with an active community administrator account, then run this server-side check. No key needs to be entered here.</p>
    <p>The check sends one fixed public query: “Tavily Search API documentation”. It uses your Tavily account’s search allowance. No bills, chat history or personal notes are sent.</p>
    <button className="button button-blue" disabled={busy} onClick={() => void check()}>{busy ? "Checking Tavily…" : "Test Tavily connection"}</button>
    {message && <p role="status">{message}</p>}<p>This tests connectivity only. CP’s conversational web research is not connected yet.</p></section></main>;
}
