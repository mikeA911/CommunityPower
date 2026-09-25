import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText, Users, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Brand, CPMark } from "@/components/brand";
import { AuthDialog } from "@/components/auth-dialog";

export default function Home() {
  return <div className="public-shell">
    <header className="public-header"><Brand /><nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><Link href="/about">About us</Link><Link href="/help/preview">Help</Link></nav><div className="public-actions"><AuthDialog /><Link className="button button-blue header-demo" href="/demo/consumer">Explore the demo <ArrowUpRight size={16} /></Link></div></header>
    <main id="main">
      <section className="landing-hero">
        <div className="hero-copy"><span className="eyebrow"><span className="status-dot" /> COMMUNITY FIRST. POSSIBILITY POWERED.</span><h1>Good energy.<br /><span>Better together.</span></h1><p>Understand your energy. Connect with your community. Make your next move with a little help from CP.</p><div className="hero-buttons"><Link className="button button-yellow" href="/demo/consumer">Meet your community <ArrowRight size={18} /></Link><a className="text-link light" href="#how-it-works">See how it works <span>↓</span></a></div><div className="hero-footnote"><ShieldCheck size={17} /> Supplier-neutral. Community-led. Built for clarity.</div></div>
        <div className="hero-orbit"><div className="orbit-ring orbit-one" /><div className="orbit-ring orbit-two" /><span className="orbit-label orbit-label-top"><span className="status-dot" /> YOUR COMMUNITY, CONNECTED</span><CPMark size={300} priority /><div className="orbit-caption"><Sparkles size={18} /><span>Hi, I’m CP.<small>Your energy questions, made simpler.</small></span></div><span className="orbit-coordinate">CP / HUMAN CONNECTION × SMART TECHNOLOGY</span></div>
      </section>
      <div className="preview-strip"><span className="label-chip">DEVELOPMENT PREVIEW</span><p>Pilot community login and recovery are connected. Dashboard records and CP answers remain synthetic.</p><Link href="/help/preview">What works today <ArrowUpRight size={14} /></Link></div>
      <section className="how-section" id="how-it-works"><div className="section-heading"><div><span className="eyebrow blue">A CLEARER WAY FORWARD</span><h2>Small steps. Shared possibilities.</h2></div><p>One simple place to get informed,<br />get connected, and take part.</p></div><div className="feature-grid">{[
        { icon: FileText, number: "01", title: "Understand your bill", body: "Bring the numbers into focus. Explore a sample bill and see how guided review could work." },
        { icon: Sparkles, number: "02", title: "Ask CP", body: "A friendly starting point for your questions. Try the scripted guide while our AI experience takes shape." },
        { icon: Users, number: "03", title: "Connect your community", body: "Share updates, ask questions, and explore opportunities together. Participation stays voluntary." },
      ].map(({ icon: Icon, ...item }) => <article className="feature-card" key={item.number}><div className="feature-top"><span className="icon-tile"><Icon size={23} /></span><span className="feature-number">{item.number}</span></div><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
      <section className="landing-cta"><div><Zap size={26} /><h2>A stronger community starts with a conversation.</h2></div><Link className="button button-blue" href="/demo/consumer">Say hello to CP <ArrowRight size={17} /></Link></section>
    </main><footer className="public-footer"><Brand /><p>Better informed. Better connected.</p><span>Built with care · Supported by Sandz</span></footer>
  </div>;
}
