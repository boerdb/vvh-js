import DOMPurify from "isomorphic-dompurify";

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
