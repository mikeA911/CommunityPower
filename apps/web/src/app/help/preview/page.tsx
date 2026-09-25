import Link from "next/link";
import Markdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { headingId, readPreviewGuide } from "@/lib/preview-help";

export const metadata = { title: "Preview guide" };
export const dynamic = "force-dynamic";
export default async function PreviewHelp() {
  const guide = await readPreviewGuide();
  return <div className="public-shell"><header className="public-header"><Brand /><Link className="text-link" href="/demo/consumer"><ArrowLeft size={15} /> Back to preview</Link></header><main id="main" className="editorial-page wiki-page"><div className="wiki-banner">Development guide · draft v{guide.version} · preview-0.2.0 · synthetic dashboard data</div><article className="markdown"><Markdown components={{ h2: ({ children }) => <h2 id={headingId(String(children))}>{children}</h2> }}>{guide.content}</Markdown></article><p className="wiki-meta">Source: wiki/previews/first-look.md · Maintained with the code · Not a published production help article</p></main></div>;
}
