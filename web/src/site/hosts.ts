// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Every listed game's page has its own host: https://<id>.freegames.stream/ (scripts/seo.mjs writes it, the
// server's GameHosts serves it, and the website runs there showing that game's page). Play stays on the site's own
// host (https://freegames.stream/#/<id>/play), where the player's account is kept. Only at the site's names: on
// localhost, an IP address or another name the games' pages stay inside the site (#/<id>), as before.
import type { GameManifest } from '../sdk/game.ts';

export const SITE_HOST = 'freegames.stream';

type Page = { hostname: string; protocol: string; port: string };

const portOf = (page: Page) => (page.port ? `:${page.port}` : '');

/** the game whose own host this page is at (`ballerburg` at ballerburg.freegames.stream), or null */
export function hostGame(page: { hostname: string } = location): string | null {
  if (!page.hostname.endsWith(`.${SITE_HOST}`)) return null;
  const label = page.hostname.slice(0, -SITE_HOST.length - 1);
  return /^[a-z0-9-]{1,40}$/.test(label) ? label : null;
}

/** whether this page is at the site's names, whose games have hosts of their own */
export function gameHosts(page: { hostname: string } = location): boolean {
  return page.hostname === SITE_HOST || hostGame(page) !== null;
}

/** a path of the site itself ("#/…", "impressum.html"): as it is on the site's host, absolute on a game's host */
export function siteHref(path: string, page: Page = location): string {
  if (!hostGame(page)) return path;
  return `${page.protocol}//${SITE_HOST}${portOf(page)}/${path.replace(/^\//, '')}`;
}

/** where a game's page is: its own host (same scheme and port as this page), or #/<id> inside the site */
export function gameHref(m: Pick<GameManifest, 'id' | 'listed'>, page: Page = location): string {
  if (!gameHosts(page) || m.listed === false) return siteHref(`#/${m.id}`, page);
  return `${page.protocol}//${m.id}.${SITE_HOST}${portOf(page)}/`;
}

/** where a game is played: always the site itself */
export function playHref(m: Pick<GameManifest, 'id'>, page: Page = location): string {
  return siteHref(`#/${m.id}/play`, page);
}
