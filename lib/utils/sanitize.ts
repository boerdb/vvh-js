import DOMPurify from "isomorphic-dompurify";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201D",
  ldquo: "\u201C",
};

/** Decode numeric and common named HTML entities (e.g. &#8230; → …). */
export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code =
        entity[1].toLowerCase() === "x"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      if (!Number.isFinite(code)) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/** Strip tags and decode HTML entities for plain-text fields. */
export function htmlToPlainText(html: string): string {
  if (!html) return "";
  const stripped = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  return decodeHtmlEntities(stripped).trim();
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  const withoutScripts = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  return DOMPurify.sanitize(withoutScripts, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "ul",
      "ol",
      "li",
      "a",
      "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    FORBID_TAGS: [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "form",
      "link",
      "meta",
      "noscript",
      "template",
    ],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onfocus",
      "onblur",
    ],
  });
}
