import Link from "next/link";
import Markdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { headingId, readPreviewGuide, readPreviewNavigation } from "@/lib/preview-help";

export const metadata = { title: "Preview guide" };
export const dynamic = "force-dynamic";
export default async function PreviewHelp() {
  const guide = await readPreviewGuide();
  const features = await readPreviewNavigation();
  return <div className="public-shell"><header className="public-header"><Brand /><Link className="text-link" href="/demo/consumer"><ArrowLeft size={15} /> Back to preview</Link></header><main id="main" className="editorial-page wiki-page"><div className="wiki-banner">Development guide · draft v{guide.version} · preview-0.2.0 · synthetic dashboard data</div><article className="markdown"><Markdown components={{ h2: ({ children }) => <h2 id={headingId(String(children))}>{children}</h2> }}>{guide.content}</Markdown><h2>Feature directory</h2>{features.map(feature => <section key={feature.id}><h3>{feature.href ? <Link href={feature.href}>{feature.label}</Link> : feature.label}</h3><p><strong>{feature.state}</strong> — {feature.instructions}</p></section>)}</article><p className="wiki-meta">Sources: wiki/previews/first-look.md and navigation.json · Maintained with the code · Not published production help</p></main></div>;
}
