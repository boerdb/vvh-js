import { differenceInCalendarDays, format } from "date-fns";
import { nl } from "date-fns/locale";

/** "Vandaag", "Morgen", "Over 3 dagen" of "za 31 okt" (vanaf een week), plus tijd. */
export function relativeDayLabel(date: Date, now: Date = new Date()): string {
  const days = differenceInCalendarDays(date, now);
  const time = format(date, "HH:mm");
  if (days < 0) return `${format(date, "EEEEEE d MMM", { locale: nl })} ${time}`;
  if (days === 0) return `Vandaag ${time}`;
  if (days === 1) return `Morgen ${time}`;
  if (days === 2) return `Overmorgen ${time}`;
  if (days < 7) return `Over ${days} dagen, ${time}`;
  return `${format(date, "EEEEEE d MMM", { locale: nl })} ${time}`;
}
