// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Plays a game in the same window: a slim bar (back, title, players now, full screen) above the game's
// host element. Every play connects to the server anonymously (GameClient.count), so that it counts among
// the game's players now, even when the game itself never needs the server. Stopping ends the game, its connection, its audio and
// every loop the SDK started.
import { createSession } from '../sdk/context.ts';
import type { GameInstance } from '../sdk/game.ts';
import type { Game } from './catalog.ts';
import { el } from './dom.ts';
import { liveText, onLive, playersOf, refreshLive } from './live.ts';

/** Debug counters for tests (scripts/e2e.mjs): plays started and plays still running. */
export const stats = { started: 0, running: 0 };

let audioFromClick: AudioContext | null = null;

/** Call inside the Play click: browsers let audio start only from a user gesture. */
export function primeAudio(): void {
  try {
    audioFromClick = new AudioContext();
    void audioFromClick.resume();
  } catch {
    audioFromClick = null;
  }
}

export interface Playing {
  stop(): Promise<void>;
}

export function play(app: HTMLElement, g: Game, back: () => void): Playing {
  const m = g.manifest;
  const host = el('div', { className: 'player-host', tabIndex: 0 });
  const full = el('button', { className: 'bar-button', type: 'button', textContent: '⛶ Full screen', title: 'Full screen (hold Esc to leave)' });
  full.addEventListener('click', () => void fullscreen(host));
  const backButton = el('button', { className: 'bar-button', type: 'button', textContent: '← Back' });
  // Back and the game's exit leave once: a second history.back() would leave the site. A game may call
  // exit while it is being stopped (its frames run until its stop() returns), and Back may be clicked twice.
  let left = false, stopped = false;
  const leave = () => {
    if (left || stopped) return;
    left = true;
    back();
  };
  backButton.addEventListener('click', leave);
  const live = el('span', { className: 'player-live' });
  // the legal notice stays one click away while playing, in a new tab so that the game goes on
  const legal = el('a', { className: 'player-legal', href: 'impressum.html', target: '_blank', rel: 'noopener', textContent: 'Impressum' });
  const view = el('div', { className: 'player' },
    el('div', { className: 'player-bar' }, backButton, el('span', { className: 'player-title', textContent: m.title }), live, legal, full),
    host);
  const listening = new AbortController();
  onLive((l) => { live.textContent = l ? liveText(playersOf(l, m.id)) : ''; }, listening.signal);
  app.replaceChildren(view);
  document.body.classList.add('playing');

  const audio = audioFromClick ?? undefined;
  audioFromClick = null;
  const session = createSession(m, { audio, exit: leave });
  // counted among the players now, anonymously (no token, nothing stored): even a game that never needs the
  // server; when it does (saves, scores, rooms) the same connection becomes an account one. No server: the
  // game runs without
  void session.ctx.net.count().then(refreshLive);
  stats.started++;
  stats.running++;
  let instance: GameInstance | null = null;
  const ready = (async () => {
    try {
      const start = await g.load!();
      if (stopped) return;
      instance = await start(host, session.ctx);
      if (stopped) await instance.stop();
    } catch (e) {
      console.error(`${m.id} failed to start`, e);
      if (!stopped) host.replaceChildren(el('p', { className: 'player-error', textContent: `${m.title} could not start: ${(e as Error).message ?? e}` }));
    }
  })();
  host.focus();

  return {
    async stop() {
      if (stopped) return;
      stopped = true;
      listening.abort();
      await ready;
      try { await instance?.stop(); } catch (e) { console.error(`${m.id} stop`, e); }
      session.dispose();
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => { /* not ours */ });
      host.replaceChildren();
      view.remove();
      document.body.classList.remove('playing');
      stats.running--;
      refreshLive();
    },
  };
}

async function fullscreen(host: HTMLElement): Promise<void> {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  await host.requestFullscreen();
  // games use Esc (Moria, menus): where the browser allows it, Esc goes to the game and holding it leaves
  const kb = (navigator as Navigator & { keyboard?: { lock?: (keys: string[]) => Promise<void> } }).keyboard;
  await kb?.lock?.(['Escape']).catch(() => { /* not supported */ });
  host.focus();
}
