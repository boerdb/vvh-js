export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  const parsed = new Date(String(value));
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function getLocatieLabel(title: string): "Thuis" | "Uit" {
  const teams = (title || "").split(" - ").map((part) => part.trim());
  const first = teams[0] || "";
  return /V\.?V\.?H\.?/i.test(first) ? "Thuis" : "Uit";
}
