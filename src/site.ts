/**
 * Internal links, prefixed with the base path.
 *
 * One of the two sites is served from a subdirectory on GitHub Pages, so a
 * hand-written href="/en" works in `astro dev` and 404s in production.
 * Everything internal goes through here instead, which makes this file correct
 * on both sites and identical in both repositories.
 *
 * Anchors (#how), mailto: and absolute URLs are returned untouched.
 */
export function url(path: string): string {
  if (path.startsWith('#') || path.startsWith('mailto:') || path.startsWith('http')) {
    return path;
  }
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const rest = path.startsWith('/') ? path : `/${path}`;
  return `${base}${rest}` || '/';
}
