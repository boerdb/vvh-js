import { redirect } from "next/navigation";

export default async function TeamResultatenRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const team = String(code || "").toUpperCase();
  redirect(team ? `/teams?team=${encodeURIComponent(team)}` : "/teams");
}
