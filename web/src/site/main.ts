// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// The website: #/ (all games; #/?q=… searched, filtered, sorted) → #/<id> (a game's page) →
// #/<id>/play (the game, same window). At freegames.stream a game's page is its own host instead (hosts.ts).
import './style.css';
import { game } from './catalog.ts';
import { gameHref, hostGame, playHref, siteHref } from './hosts.ts';
import { listView } from './list.ts';
import { pageView } from './page.ts';
import { play, primeAudio, stats, type Playing } from './player.ts';
import { reportView } from './live.ts';

const app = document.getElementById('app')!;
let playing: Playing | null = null;
/** true when #/<id>/play was reached from the game's page (Back then goes back in history) */
let fromPage = false;
/** ends what the current view listens to (the players now) when the route moves on */
let view = new AbortController();

async function route(): Promise<void> {
  const hash = location.hash.replace(/^#\/?/, '');
  const q = hash.indexOf('?');
  const [id, action] = (q < 0 ? hash : hash.slice(0, q)).split('/');
  view.abort();
  view = new AbortController();
  if (playing) {
    const p = playing;
    playing = null;
    await p.stop();
  }
  // at a game's own host (hosts.ts) the website shows that game's page; Play and every other view are the site's
  const own = hostGame();
  if (own) {
    const g = game(own);
    if (!g || g.manifest.listed === false || (hash && hash !== own)) {
      location.replace(siteHref(g && g.manifest.listed !== false ? `#/${hash}` : '#/'));
      return;
    }
    reportView(`game:${own}`);
    document.title = `${g.manifest.title}: play free in your browser · freegames`;
    app.replaceChildren(pageView(g, () => location.assign(playHref(g.manifest)), view.signal));
    return;
  }
  // the game's page at /<id>/ where there are no game hosts (localhost, an IP address): the site's #/<id>
  const at = /^\/([a-z0-9-]{1,40})\/(index\.html)?$/.exec(location.pathname)?.[1];
  if (at && game(at)) {
    location.replace(`/#/${at}${action === 'play' ? '/play' : ''}`);
    return;
  }
  const g = id ? game(id) : undefined;
  // a game's page is at its own host (hosts.ts): the old links (#/<id>) lead there; Play stays here
  const page = g ? gameHref(g.manifest) : '';
  if (g && action !== 'play' && !page.startsWith('#')) {
    location.replace(page);
    return;
  }
  // the usage statistics' views: which kind of page, nothing about the visitor
  reportView(g && action === 'play' && g.load ? `play:${g.manifest.id}` : g ? `game:${g.manifest.id}` : 'list');
  if (g && action === 'play' && g.load) {
    document.title = `${g.manifest.title} · freegames`;
    const wasFromPage = fromPage;
    fromPage = false;
    playing = play(app, g, () => {
      if (wasFromPage) history.back();
      // from the game's page at its own host (a link there): back to it in history, else to it
      else if (!page.startsWith('#') && document.referrer === page && history.length > 1) history.back();
      else location.replace(page);
    });
    return;
  }
  if (g) {
    document.title = `${g.manifest.title} · freegames`;
    app.replaceChildren(pageView(g, () => {
      primeAudio();
      fromPage = true;
      location.hash = `#/${g.manifest.id}/play`;
    }, view.signal));
  } else {
    document.title = 'freegames: free classic games in your browser';
    app.replaceChildren(listView(q < 0 ? '' : hash.slice(q + 1), view.signal));
  }
  window.scrollTo(0, 0);
}

let queue = Promise.resolve();
const go = () => { queue = queue.then(route).catch((e) => console.error('route', e)); };
window.addEventListener('hashchange', go);
go();

(window as unknown as { __freegames: unknown }).__freegames = { stats };
