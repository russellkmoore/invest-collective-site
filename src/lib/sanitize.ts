/**
 * Sanitize AI-generated or user-supplied HTML before storage or rendering.
 * Strips dangerous tags (script, iframe, object, etc.), event handlers, and
 * data attributes while preserving common semantic markup.
 *
 * Uses a simple allowlist approach compatible with Cloudflare Workers
 * (no DOM/jsdom dependency).
 */

const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'a', 'ul', 'ol', 'li',
  'strong', 'em', 'code', 'pre', 'blockquote',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'br', 'hr', 'img', 'span', 'div',
  'sup', 'sub', 'article',
]);

const ALLOWED_ATTRS = new Set([
  'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
]);

/**
 * Strip disallowed HTML tags and attributes using regex-based allowlists.
 * Not a full DOM parser, but sufficient for sanitizing AI-generated content
 * and admin input in a Workers environment.
 */
export function sanitizeHtml(dirty: string): string {
  // Remove script/style tags and their content entirely
  let clean = dirty.replace(/<(script|style|iframe|object|embed|form|input|textarea|button|select|option)\b[^]*?<\/\1\s*>/gi, '');
  // Also remove self-closing or unclosed versions of dangerous tags
  clean = clean.replace(/<(script|style|iframe|object|embed|form|input|textarea|button|select|option)\b[^>]*\/?>/gi, '');

  // Remove event handler attributes (on*)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');

  // Remove javascript: and data: URLs in attributes
  clean = clean.replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""');
  clean = clean.replace(/(href|src)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, '$1=""');

  // Strip disallowed tags but keep their content
  clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tagName) => {
    const lower = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) {
      return '';
    }

    // For closing tags, just return the clean closing tag
    if (match.startsWith('</')) {
      return `</${lower}>`;
    }

    // For opening tags, filter attributes
    const selfClosing = match.trimEnd().endsWith('/>') || lower === 'br' || lower === 'hr' || lower === 'img';
    const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    const attrs: string[] = [];
    let attrMatch;
    while ((attrMatch = attrRegex.exec(match)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
      if (ALLOWED_ATTRS.has(attrName)) {
        attrs.push(`${attrName}="${attrValue}"`);
      }
    }

    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
    return selfClosing ? `<${lower}${attrStr} />` : `<${lower}${attrStr}>`;
  });

  return clean;
}
