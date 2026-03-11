import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize AI-generated or user-supplied HTML before storage or rendering.
 * Strips dangerous tags (script, iframe, object, etc.), event handlers, and
 * data attributes while preserving common semantic markup.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'a', 'ul', 'ol', 'li',
      'strong', 'em', 'code', 'pre', 'blockquote',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'br', 'hr', 'img', 'span', 'div',
      'sup', 'sub',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}
