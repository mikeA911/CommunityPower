import { notFound } from "next/navigation";
import { isDemoRole } from "@/lib/demo";
import { Workspace } from "@/components/workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Workspace preview" };
export default async function DemoPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!isDemoRole(role)) notFound();
  return <Workspace key={role} role={role} />;
}
