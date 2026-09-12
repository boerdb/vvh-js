import { redirect } from "next/navigation";

export default async function TeamStandenRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const team = String(code || "").toUpperCase();
  redirect(team ? `/standen?team=${encodeURIComponent(team)}` : "/standen");
}
