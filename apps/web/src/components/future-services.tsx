"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bike, ShoppingBasket, Droplets, Wrench, Shirt, BatteryCharging, Sparkles, X } from "lucide-react";

type Service = { id: string; name: string; description: string };
type Interest = { id: string; service: string; note: string; member: string };
const initialServices: Service[] = [
  { id: "food", name: "Food delivery", description: "Explore coordinated meal deliveries from local kitchens, with convenient community collection points." },
  { id: "groceries", name: "Grocery delivery", description: "Explore shared grocery drop-offs for everyday essentials and household supplies." },
  { id: "water", name: "Water delivery", description: "Explore scheduled drinking-water deliveries and refill collection for your community." },
  { id: "repairs", name: "Home maintenance", description: "Explore a convenient way to request help with routine household repairs and maintenance." },
  { id: "laundry", name: "Laundry pickup", description: "Explore coordinated laundry pickup and return times for community households." },
  { id: "solar-battery", name: "Solar-charged home battery", description: "Explore buying a Powerwall-style home battery to store solar energy. Solar compatibility, sizing, installation and costs would need assessment. No supplier or savings are confirmed." },
];
const initialRequests: Interest[] = [
  { id: "sample-food", service: "Food delivery", member: "Sample household A", note: "Example: an evening delivery window would be useful." },
  { id: "sample-water", service: "Water delivery", member: "Sample household B", note: "Example: could we have a weekly refill collection?" },
];
const storageKey = "cp-future-services-preview-v1";
function PreviewModal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = ref.current; element?.showModal(); return () => element?.close(); }, []);
  return <dialog ref={ref} className="dialog services-dialog" aria-labelledby="services-dialog-title" onCancel={close}>
    <div className="dialog-header"><h2 id="services-dialog-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={close}><X size={20} /></button></div>{children}
  </dialog>;
}
export function FutureServices({ manager = false }: { manager?: boolean }) {
  const [services, setServices] = useState(initialServices);
  const [requests, setRequests] = useState(initialRequests);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    // Hydrate browser-only examples after the first paint; cancel if navigation unmounts us.
    const frame = requestAnimationFrame(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const validServices = Array.isArray(parsed.services) && parsed.services.length <= 30 && parsed.services.every((s: Service) => typeof s.id === "string" && typeof s.name === "string" && s.name.length <= 60 && typeof s.description === "string" && s.description.length <= 300);
        const validRequests = Array.isArray(parsed.requests) && parsed.requests.length <= 100 && parsed.requests.every((r: Interest) => typeof r.id === "string" && typeof r.service === "string" && typeof r.note === "string" && r.note.length <= 500 && typeof r.member === "string");
        if (validServices && validRequests) { setServices([...initialServices, ...parsed.services.filter((s: Service) => !initialServices.some(initial => initial.id === s.id))]); setRequests(parsed.requests); }
      }
    } catch { /* Invalid/unavailable storage falls back to synthetic examples. */ }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  function save(nextServices: Service[], nextRequests: Interest[]) {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ services: nextServices, requests: nextRequests })); }
    catch { setNotice("Browser storage is unavailable. This preview cannot save your changes."); return false; }
    setServices(nextServices); setRequests(nextRequests); return true;
  }
  function requestService(event: FormEvent) {
    event.preventDefault(); if (!selected || requests.length >= 100) return;
    const request = { id: crypto.randomUUID(), service: selected.name, note: note.trim() || "No comment added.", member: "You · preview household" };
    if (save(services, [request, ...requests])) { setSelected(null); setNote(""); setNotice("Example request added to the manager preview in this browser tab. No message was sent to a community manager."); }
  }
  function addService(event: FormEvent) {
    event.preventDefault(); if (!name.trim() || !description.trim() || services.length >= 30) return;
    if (services.some(s => s.name.toLowerCase() === name.trim().toLowerCase())) { setNotice("A service with that name is already in this preview."); return; }
    if (save([...services, { id: crypto.randomUUID(), name: name.trim(), description: description.trim() }], requests)) { setAdding(false); setName(""); setDescription(""); setNotice("Example service added to the catalog as a future service. It is not available to order."); }
  }
  const icons = [Bike, ShoppingBasket, Droplets, Wrench, Shirt, BatteryCharging];
  return <main className="bills-page services-page">
    <nav aria-label="Services navigation"><Link className="text-link" href={manager ? "/demo/community-admin" : "/dashboard"}>{manager ? "Community manager dashboard" : "Consumer dashboard"}</Link><Link className="text-link" href={manager ? "/services" : "/services/manage"}>{manager ? "Consumer services preview" : "View manager example"}</Link></nav>
    <span className="eyebrow blue">COMMUNITY POSSIBILITIES</span><h1>{manager ? "Shape your community’s services." : "More possibilities, closer to home."}</h1>
    <p>{manager ? "See example household requests and try adding a future service to the preview catalog." : "What would make everyday life easier? Explore future services and try requesting one for your community."}</p>
    <div className="notice"><strong>Example only.</strong> Services are not available yet. Requests and added cards stay in this browser tab until it closes or you reset the preview. Use made-up comments; nothing is sent to a manager or provider.</div>
    {notice && <p role="status">{notice}</p>}
    {!ready ? <p>Loading examples…</p> : <>
      <div className="services-actions">{manager && <button className="button button-blue" disabled={services.length >= 30} onClick={() => { setNotice(""); setAdding(true); }}>Add service example</button>}<button className="button button-ghost" onClick={() => { if (save(initialServices, initialRequests)) setNotice("Preview reset to the original examples."); }}>Reset examples</button></div>
      {manager && <section className="bill-card" aria-labelledby="service-requests"><h2 id="service-requests">Consumer requests <span className="subtle-pill">{requests.length} EXAMPLES</span></h2><p>Sample requests plus any you added in the consumer preview in this tab.</p><div className="service-requests">{requests.map(r => <article key={r.id}><span className="subtle-pill">EXAMPLE REQUEST</span><h3>{r.service}</h3><small>{r.member}</small><p>{r.note}</p></article>)}</div></section>}
      <section aria-label="Future services catalog" className="services-grid">{services.map((service, index) => { const Icon = icons[index] || Sparkles; return <article className="service-card" key={service.id}><div className="service-card-top"><Icon size={28} /><span className="subtle-pill">Future service</span></div><h2>{service.name}</h2><p>{service.description}</p>{!manager && <button className="button button-blue" disabled={requests.length >= 100} onClick={() => { setSelected(service); setNote(""); setNotice(""); }}>Request {service.name.toLowerCase()}</button>}{manager && <small>Preview listing · no provider connected</small>}</article>; })}</section>
      {requests.length >= 100 && <p>Preview request limit reached. Reset examples to try again.</p>}
    </>}
    {selected && <PreviewModal title={`Request ${selected.name.toLowerCase()}`} close={() => setSelected(null)}><p>Try a request to your community manager. This example is not sent; use a made-up note.</p><form onSubmit={requestService}><label>Note to community manager (optional)<textarea rows={4} maxLength={500} value={note} onChange={e => setNote(e.target.value)} placeholder="Example: weekday evenings would suit us." /></label><div className="dialog-actions"><button type="button" className="button" onClick={() => setSelected(null)}>Cancel</button><button className="button button-blue">Add example request</button></div></form></PreviewModal>}
    {adding && <PreviewModal title="Add a service example" close={() => setAdding(false)}><p>Describe a potential service. Every new card is marked Future service; adding it does not launch a service.</p><form onSubmit={addService}><label>Service name<input required maxLength={60} value={name} onChange={e => setName(e.target.value)} /></label><label>Brief description<textarea required rows={3} maxLength={300} value={description} onChange={e => setDescription(e.target.value)} /></label>{notice && <p role="status">{notice}</p>}<div className="dialog-actions"><button type="button" className="button" onClick={() => setAdding(false)}>Cancel</button><button className="button button-blue" disabled={!name.trim() || !description.trim()}>Add future service</button></div></form></PreviewModal>}
  </main>;
}
