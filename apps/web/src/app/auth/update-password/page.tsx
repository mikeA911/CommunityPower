import { UpdatePasswordForm } from "@/components/update-password-form";

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ realm?: string }> }) {
  const { realm } = await searchParams;
  return <UpdatePasswordForm realm={realm === "control" ? "control" : "community"} />;
}
