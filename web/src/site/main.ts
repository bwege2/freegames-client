// The website: #/ (all games; #/?q=… searched, filtered, sorted) → #/<id> (a game's page) →
// #/<id>/play (the game, same window).
import './style.css';
import { game } from './catalog.ts';
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
  const g = id ? game(id) : undefined;
  // the usage statistics' views: which kind of page, nothing about the visitor
  reportView(g && action === 'play' && g.load ? `play:${g.manifest.id}` : g ? `game:${g.manifest.id}` : 'list');
  if (g && action === 'play' && g.load) {
    document.title = `${g.manifest.title} · freegames`;
    const wasFromPage = fromPage;
    fromPage = false;
    playing = play(app, g, () => {
      if (wasFromPage) history.back();
      else location.replace(`#/${g.manifest.id}`);
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
    document.title = 'freegames';
    app.replaceChildren(listView(q < 0 ? '' : hash.slice(q + 1), view.signal));
  }
  window.scrollTo(0, 0);
}

let queue = Promise.resolve();
const go = () => { queue = queue.then(route).catch((e) => console.error('route', e)); };
window.addEventListener('hashchange', go);
go();

(window as unknown as { __freegames: unknown }).__freegames = { stats };
