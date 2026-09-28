"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
type Conversation = { id: string; title: string; memory_enabled: boolean; created_at: string };
type Message = { id: string; role: "user" | "assistant"; content: string; created_at: string };
async function api(path: string, method = "GET", body?: unknown) {
  const response = await fetch(`/api/conversations${path}`, { method, cache: "no-store", ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Conversation service is unavailable.");
  return result;
}
export function SavedConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [moreChats, setMoreChats] = useState(false);
  const [moreMessages, setMoreMessages] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [title, setTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pending = useRef<{ conversation: string; message: string; requestId: string } | null>(null);
  const newId = useRef<string | null>(null);
  useEffect(() => {
    let active = true;
    api("").then(result => { if (active) { setConversations(result.conversations); setMoreChats(result.hasMore); setReady(true); } }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true); setError("");
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : "Could not complete that action."); }
    finally { setBusy(false); }
  }
  async function open(conversation: Conversation) {
    // Clear prior content before fetching so a failed request never shows another chat's messages.
    setSelected(null); setMessages([]); setConfirmDelete(false); setQuestion(""); pending.current = null;
    const result = await api(`/messages?conversation=${conversation.id}`);
    setSelected(result.conversation); setTitle(result.conversation.title); setMessages(result.messages); setMoreMessages(result.hasMore);
  }
  async function create() {
    newId.current ??= crypto.randomUUID();
    const result = await api("", "POST", { id: newId.current });
    newId.current = null;
    setConversations(rows => [result.conversation, ...rows.filter(c => c.id !== result.conversation.id)]);
    await open(result.conversation);
  }
  async function update(change: { title?: string; memory_enabled?: boolean }) {
    if (!selected) return;
    const result = await api("", "PATCH", { id: selected.id, ...change });
    setSelected(result.conversation); setTitle(result.conversation.title);
    setConversations(rows => rows.map(c => c.id === selected.id ? result.conversation : c));
  }
  async function send(event: FormEvent) {
    event.preventDefault(); if (!selected || !question.trim()) return;
    await run(async () => {
      if (!pending.current || pending.current.conversation !== selected.id || pending.current.message !== question.trim()) pending.current = { conversation: selected.id, message: question.trim(), requestId: crypto.randomUUID() };
      await api("/messages", "POST", pending.current);
      pending.current = null; setQuestion("");
      const result = await api(`/messages?conversation=${selected.id}`);
      setMessages(result.messages); setMoreMessages(result.hasMore);
    });
  }
  return <main className="bills-page saved-chats">
    <nav aria-label="Conversation navigation"><Link className="text-link" href="/">Home / sign in</Link> · <Link className="text-link" href="/dashboard">My bills</Link> · <Link className="text-link" href="/help/preview">Preview guide</Link></nav>
    <h1>Conversations with CP</h1>
    <p>Signed-in community accounts can save and reopen private conversations here. CP provides scripted preview help, not AI answers or access to your bills. Public demo chats are not saved.</p>
    <p>Messages are stored in your community account until you delete them. Keep passwords, API keys and sensitive documents out of chat. Recall is optional and off for new conversations.</p>
    {error && <p role="alert">{error}</p>}
    {!ready && !error && <p role="status">Loading conversations…</p>}
    {!ready && error && <button className="button" onClick={() => window.location.reload()}>Retry loading</button>}
    {ready && <div className="saved-chat-layout"><aside className="bill-card" aria-label="Saved conversation history">
      <h2>Your history</h2><button className="button button-blue" disabled={busy} onClick={() => void run(create)}>New conversation</button>
      {!conversations.length && <p>No saved conversations yet.</p>}
      <ul>{conversations.map(c => <li key={c.id}><button className="text-link" aria-current={selected?.id === c.id ? "true" : undefined} disabled={busy} onClick={() => void run(() => open(c))}>{c.title}</button><small>{new Date(c.created_at).toLocaleDateString()}</small></li>)}</ul>
      {moreChats && <button className="button" disabled={busy} onClick={() => void run(async () => { const result = await api(`?offset=${conversations.length}`); setConversations(rows => [...rows, ...result.conversations.filter((c: Conversation) => !rows.some(r => r.id === c.id))]); setMoreChats(result.hasMore); })}>More conversations</button>}
    </aside><section className="bill-card" aria-label="Selected conversation">
      {!selected ? <p>Choose a conversation or start a new one.</p> : <>
        <form onSubmit={e => { e.preventDefault(); void run(() => update({ title })); }}><label>Conversation title<input required maxLength={150} value={title} disabled={busy} onChange={e => setTitle(e.target.value)} /></label><button className="button" disabled={busy || !title.trim()}>Save title</button></form>
        <label className="bill-check"><input type="checkbox" checked={selected.memory_enabled} disabled={busy} onChange={e => void run(() => update({ memory_enabled: e.target.checked }))} />Allow recall for this conversation</label>
        <p className="recall-note">Recall is not processing yet. Enabling it queues existing and future messages for later indexing. Turning it off removes this conversation’s recall vectors and queued work, but keeps your saved messages. You can delete those below.</p>
        <button className="button" disabled={busy} onClick={() => setConfirmDelete(true)}>Delete conversation</button>
        {confirmDelete && <div role="group" aria-label="Confirm conversation deletion"><p>Delete this conversation, all its messages and any recall data? This cannot be undone in the app.</p><button className="button" disabled={busy} onClick={() => void run(async () => { await api("", "DELETE", { id: selected.id }); setConversations(rows => rows.filter(c => c.id !== selected.id)); setSelected(null); setMessages([]); setConfirmDelete(false); pending.current = null; })}>Delete permanently</button><button className="button" disabled={busy} onClick={() => setConfirmDelete(false)}>Cancel</button></div>}
        {moreMessages && <button className="button" disabled={busy} onClick={() => void run(async () => { const result = await api(`/messages?conversation=${selected.id}&offset=${messages.length}`); setMessages(rows => [...result.messages.filter((m: Message) => !rows.some(r => r.id === m.id)), ...rows]); setMoreMessages(result.hasMore); })}>Older messages</button>}
        <div className="saved-messages" role="log" aria-label="Saved messages" aria-live="polite">{messages.map(m => <article key={m.id} className={`saved-message ${m.role}`}><strong>{m.role === "user" ? "You" : "CP · scripted help"}</strong><p>{m.content}</p></article>)}{!messages.length && <p>Ask CP about features or navigation to begin.</p>}</div>
        <form onSubmit={send}><label>Message to CP<textarea required maxLength={500} rows={3} disabled={busy} value={question} onChange={e => setQuestion(e.target.value)} /></label><button className="button button-blue" disabled={busy || !question.trim()}>{busy ? "Working…" : "Send and save"}</button></form>
        <p><Link className="text-link" href="/help/preview#feature-navigation">Open current feature guidance</Link>. Older replies are historical and may no longer describe current features.</p>
      </>}
    </section></div>}
  </main>;
}
