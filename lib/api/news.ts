import { proxyUrlWithEncodedTarget, fetchJson } from "@/lib/api/client";
import type { NewsItem, WordPressPost } from "@/lib/types/models";

const NEWS_URL =
  "https://www.vvh-harlingen.nl/wp-json/wp/v2/posts?_embed&per_page=5";

export async function getNews(): Promise<NewsItem[]> {
  const posts = await fetchJson<WordPressPost[]>(
    proxyUrlWithEncodedTarget(NEWS_URL)
  );

  return posts.map(
    (post): NewsItem => ({
      titel: post.title?.rendered ?? "Geen titel",
      datum: post.date ?? "",
      omschrijving: post.excerpt?.rendered ?? "",
      link: post.link ?? "",
      image:
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        "/default-news.svg",
    })
  );
}
