export interface FeedItem {
  titel: string;
  datum: string | Date | null;
  omschrijving: string;
  link: string;
}

export interface NewsItem extends FeedItem {
  image: string;
}

export interface StandingRow {
  rank: string;
  team: string;
  wedstrijden: string;
  punten: string;
  sets: string;
  isVVH: boolean;
  isDivider?: false;
}

export interface StandingDividerRow {
  isDivider: true;
  titel: string;
}

export type StandingEntry = StandingRow | StandingDividerRow;

export interface StandenResult {
  standen: StandingEntry[];
  poule: string;
}

export interface WordPressPost {
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  date?: string;
  link?: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
  };
}
