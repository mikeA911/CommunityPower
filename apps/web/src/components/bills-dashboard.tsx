"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { CPNavigation } from "./cp-navigation";
import { billTextFields, billNumberFields, type BillFields, type BillRecord } from "@/lib/bills";

const labels: Record<keyof BillFields, string> = { supplier: "Supplier", accountNumber: "Account number", accountName: "Name on bill", address: "Service address", periodStart: "Period start", periodEnd: "Period end", dueDate: "Due date", currency: "Currency (PHP, KHR…)", kwh: "Usage (kWh)", subtotal: "Subtotal", amountDue: "Final payable amount" };
async function fetchBills(): Promise<BillRecord[]> {
  const response = await fetch("/api/bills", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result.bills;
}
export function BillsDashboard() {
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Loading your private bills…");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<BillRecord | null>(null);
  const [account, setAccount] = useState("");
  async function load() {
    setBills(await fetchBills()); setReady(true);
  }
  useEffect(() => {
    let active = true;
    fetchBills().then(rows => { if (active) { setBills(rows); setReady(true); setMessage(""); } }).catch(e => { if (active) setMessage(e.message || "Could not load bills."); });
    return () => { active = false; };
  }, []);
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget;
    const files = (form.elements.namedItem("bills") as HTMLInputElement).files;
    if (!files?.length || files.length > 10) { setMessage("Select between 1 and 10 images."); return; }
    setBusy(true);
    const results: string[] = [];
    for (let i = 0; i < files.length; i++) {
      setMessage(`Reading bill ${i + 1} of ${files.length}…`);
      const data = new FormData(); data.set("bill", files[i]); data.set("consent", "yes");
      try {
        const response = await fetch("/api/bills", { method: "POST", body: data });
        const result = await response.json();
        results.push(`Bill ${i + 1}: ${response.ok ? "saved as a draft for review" : result.message}`);
      } catch { results.push(`Bill ${i + 1}: connection interrupted. Reload history before retrying.`); }
    }
    try { await load(); } catch { results.push("Could not refresh history. Reload to check saved bills."); }
    setMessage(results.join(" · ")); setBusy(false); form.reset();
  }
  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    const form = new FormData(event.currentTarget);
    const fields = Object.fromEntries([...billTextFields.map(k => [k, String(form.get(k) || "").trim() || null]), ...billNumberFields.map(k => [k, form.get(k) === "" ? null : Number(form.get(k))])]);
    setBusy(true);
    try {
      const response = await fetch("/api/bills", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, fields, authorized: form.get("authorized") === "on", claim: { name: form.get("claimName"), account: form.get("claimAccount"), address: form.get("claimAddress") } }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setEditing(null); await load(); setMessage(result.message);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not save bill."); } finally { setBusy(false); }
  }
  const key = (f: BillFields) => `${f.supplier} / ${f.accountNumber} / ${f.currency}`;
  const confirmed = bills.filter(b => b.status === "confirmed" && b.reviewed);
  const accounts = [...new Set(confirmed.map(b => key(b.reviewed!)))];
  const selected = account || accounts[0];
  const history = confirmed.filter(b => key(b.reviewed!) === selected).sort((a,b) => a.reviewed!.periodEnd!.localeCompare(b.reviewed!.periodEnd!));
  return <main id="main-content" className="bills-page">
    <Link className="text-link" href="/">Community Power · Home / Log in</Link>
    <span className="eyebrow blue">YOUR ENERGY HISTORY</span><h1>Start with your electricity bill.</h1>
    <p>Add recent and older bills to see how your usage changes. Keep each house’s account separate.</p>
    <Link className="button button-blue" href="/services">Explore future services</Link>
    <CPNavigation />
    <p role="status" aria-live="polite">{message}</p>
    {ready && <>
      <section className="bill-card"><h2>1. Upload your bills</h2><p>JPEG or PNG, up to 3 MB each. Select up to 10 bills; each image should contain one complete bill. English and Filipino (Tagalog) are initial target languages; always review the reading.</p>
        <form onSubmit={upload}><label>Bill images<input name="bills" type="file" accept="image/jpeg,image/png" multiple required disabled={busy} /></label>
          <label className="bill-check"><input type="checkbox" required disabled={busy} />I agree to send these bills to OpenAI for extraction and store the images and fields privately in Community Power.</label>
          <button className="button button-blue" disabled={busy}>Read and save drafts</button>
        </form>
      </section>
      <section className="bill-card"><h2>2. Review your bills</h2><p>Your confirmation records your declaration. It does not verify ownership or bill authenticity. No bill here authorizes switching service or sharing with suppliers.</p>
        {!bills.length && <p>No bills yet. Upload your first bill above.</p>}
        {bills.map(b => <div className="bill-row" key={b.id}><span>{(b.reviewed || b.extraction).supplier || "Unread supplier"} · {(b.reviewed || b.extraction).accountNumber || "Unknown account"} · {(b.reviewed || b.extraction).periodEnd || "Unknown period"}<small>{b.status === "draft" ? "Needs your review" : "Confirmed by you"} · Ownership unverified</small></span><button className="button button-ghost" disabled={busy} onClick={() => setEditing(b)}>Review bill</button></div>)}
        {editing && <form key={editing.id} onSubmit={confirm} className="bill-review"><h3>Check against your original bill</h3><a className="text-link" href={`/api/bills?image=${editing.id}`} target="_blank" rel="noreferrer">Open saved original image</a><p>Leave unreadable optional fields blank. Keep currency and final payable amount as printed, including credits.</p><div className="bill-fields">
          {[...billTextFields, ...billNumberFields].map(k => <label key={k}>{labels[k]}<input name={k} defaultValue={(editing.reviewed || editing.extraction)[k] ?? ""} type={billNumberFields.includes(k as typeof billNumberFields[number]) ? "number" : ["periodStart","periodEnd","dueDate"].includes(k) ? "date" : "text"} step="any" maxLength={300} /></label>)}
        </div><h3>Account authority check</h3><p>Enter your details independently. We compare them with the original extraction. A match is not proof of ownership; differences need independent review. If the bill is in a landlord’s or relative’s name, do not claim to be that person.</p>
          <label>Your full name<input name="claimName" required maxLength={300} /></label><label>Your service account number<input name="claimAccount" required maxLength={300} /></label><label>Your service address<input name="claimAddress" required maxLength={300} /></label>
          <label className="bill-check"><input name="authorized" type="checkbox" required />I am the account holder or have permission to manage this account, and have checked these fields.</label>
          <button className="button button-blue" disabled={busy}>Confirm and add to history</button> <button type="button" className="button button-ghost" disabled={busy} onClick={() => setEditing(null)}>Cancel</button>
        </form>}
      </section>
      <section className="bill-card"><h2>3. Your bill history</h2><p>Consumer-confirmed records; ownership unverified. Different accounts and currencies are never combined. Up to 500 most recently uploaded bills are shown.</p>
        {!accounts.length ? <p>Confirm a bill to begin your history. Add several periods to compare usage.</p> : <><label>House / electricity account<select value={selected} onChange={e => setAccount(e.target.value)}>{accounts.map(a => <option key={a}>{a}</option>)}</select></label>
          <div className="bill-table"><table><caption>Billing-period history · {selected}</caption><thead><tr><th>Period</th><th>Usage (kWh)</th><th>Payable</th><th>Due</th></tr></thead><tbody>{history.map(b => <tr key={b.id}><td>{b.reviewed!.periodStart} – {b.reviewed!.periodEnd}</td><td>{b.reviewed!.kwh ?? "Unknown"}</td><td>{b.reviewed!.amountDue} {b.reviewed!.currency}</td><td>{b.reviewed!.dueDate || "Unknown"}</td></tr>)}</tbody></table></div>
          <p>Compare periods of similar length. Payable amounts can include arrears or credits and are not a direct measure of savings.</p></>}
      </section>
    </>}
  </main>;
}
