export interface IcsEvent {
  uid: string;
  title: string;
  start: Date;
  durationMinutes?: number;
  location?: string;
  url?: string;
}

const DEFAULT_DURATION_MINUTES = 120;

function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/([,;])/g, "\\$1");
}

/** RFC 5545: regels van max. 75 octets, vervolgregels beginnen met een spatie. */
function foldLine(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    const limit = parts.length === 0 ? 75 : 74;
    if (currentBytes + size > limit) {
      parts.push(current);
      current = "";
      currentBytes = 0;
    }
    current += char;
    currentBytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function buildIcs(events: IcsEvent[], calendarName: string): string {
  const stamp = icsDate(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VVH Harlingen//App//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    "X-WR-TIMEZONE:Europe/Amsterdam",
  ];
  for (const event of events) {
    const end = new Date(
      event.start.getTime() +
        (event.durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60_000
    );
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(event.start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${escapeText(event.title)}`
    );
    if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
    if (event.url) lines.push(`URL:${event.url}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
