import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import matter from "gray-matter";

export async function readPreviewGuide() {
  const raw = await readFile(resolve(process.cwd(), "../../wiki/previews/first-look.md"), "utf8");
  const { data, content } = matter(raw);
  if (data.id !== "first-look" || data.release_ids?.[0] !== "preview-0.2.0") throw new Error("Preview guide mismatch");
  return { content, version: Number(data.version) };
}

export type NavigationFeature = { id: string; label: string; href: string | null; state: string; instructions: string };
export async function readPreviewNavigation(): Promise<NavigationFeature[]> {
  const catalog = JSON.parse(await readFile(resolve(process.cwd(), "../../wiki/previews/navigation.json"), "utf8"));
  if (catalog.release !== "preview-0.2.0" || catalog.status !== "draft-preview-only") throw new Error("Navigation catalog mismatch");
  return catalog.features;
}
export function navigationAnswer(message: string, features: NavigationFeature[]) {
  const all = /navigation|navigate|features|what can|where.*go|menu|find.*way/i.test(message);
  let ids: string[] = [];
  if (all) ids = features.map(f => f.id);
  else if (/tavily|internet research|web research|search.*web|integration check/i.test(message)) ids = ["web-research"];
  else if (/food|grocer|laundry|water delivery|maintenance|future service|service request|add.*service|power\s?wall|solar|battery/i.test(message)) ids = ["future-services","service-manager"];
  else if (/conversation|chat history|remember|recall|memory|\brag\b/i.test(message)) ids = ["private-memory"];
  else if (/delete|deletion|export|withdraw|consent/i.test(message)) ids = ["privacy"];
  else if (/ownership|authority|belong|landlord|tenant/i.test(message)) ids = ["authority","bills"];
  else if (/history|dashboard|multiple|two houses|my bills/i.test(message)) ids = ["bills"];
  else if (/board|post|reply|moderation/i.test(message)) ids = ["board","support"];
  else if (/about|website|home page/i.test(message)) ids = ["home","about"];
  else if (/member|roster|invite|import|csv/i.test(message)) ids = ["members"];
  else if (/paid|upgrade|subscription|checkout/i.test(message)) ids = ["upgrades"];
  else if (/support|report|complaint/i.test(message)) ids = ["support"];
  else if (/install|offline|pwa/i.test(message)) ids = ["pwa"];
  else if (/offer|referral|comparison/i.test(message)) ids = ["offers"];
  if (!ids.length) return null;
  const selected = features.filter(f => ids.includes(f.id));
  return {
    text: selected.map(f => `${f.label} (${f.state}): ${f.instructions}`).join("\n\n"),
    source: "/help/preview#feature-navigation",
    links: selected.filter(f => f.href).map(f => ({ label: f.label, href: f.href! })),
  };
}

export function headingId(text: string) { return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

/** Explicit synthetic preview only; not the production wiki authorization engine. */
export function answerFromPreview(message: string, content: string): { text: string; source: string } {
  let heading: string | null = null;
  if (/key|provider|settings|configure/i.test(message)) heading = "AI settings";
  else if (/log.?in|sign.?in|password|forgot|reset|account access/i.test(message)) heading = "Login and password reset";
  else if (/sav(e|ed|ing).*data|data.*sav|privacy|stored|storage|reset/i.test(message)) heading = "Privacy and storage";
  else if (/sav(e|ing)|eligib|qualif|guarantee/i.test(message)) heading = "Savings and eligibility";
  else if (/scan|bill|receipt|upload|kwh/i.test(message)) heading = "Bills and AI";
  else if (/invit|import|email|csv/i.test(message)) heading = "Demo invitations";
  else if (/wiki|knowledge|ai|script|answer/i.test(message)) heading = "CP and the wiki";
  else if (/next|connect|supabase/i.test(message)) heading = "What comes next";
  else if (/try|hello|\bhi\b|start|help|role|demo|preview/i.test(message)) heading = "Try the preview";
  if (!heading) return { text: "I don’t have a supported answer to that in this scripted preview. The preview guide explains what you can try and what is still being built.", source: "/help/preview" };
  const section = content.split(`## ${heading}\n`)[1]?.split("\n## ")[0]?.trim();
  if (!section) return { text: "That section of the preview guide is unavailable. Please open the guide directly.", source: "/help/preview" };
  return { text: section, source: `/help/preview#${headingId(heading)}` };
}
