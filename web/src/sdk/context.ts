// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Builds the GameContext for one play of one game, and tears everything down when it ends: the
// signal aborts, the connection closes, the audio context closes, frame loops stop.
import { GameClient, type ClientOptions } from './net/client.ts';
import { Rooms } from './rooms.ts';
import { Storage } from './storage.ts';
import { Scores } from './scores.ts';
import { openLobby } from './lobby.ts';
import type { GameContext, GameManifest } from './game.ts';

export interface Session {
  ctx: GameContext;
  /** ends the play: abort, disconnect, close audio (idempotent) */
  dispose(): void;
}

export function createSession(manifest: GameManifest, o: { audio?: AudioContext; exit: () => void; net?: ClientOptions }): Session {
  const abort = new AbortController();
  const signal = abort.signal;
  const net = new GameClient(manifest.id, o.net);
  const audio = o.audio ?? new AudioContext();
  // a deep link (no click yet): sound starts with the first key or click
  if (audio.state === 'suspended') {
    const resume = () => { void audio.resume(); };
    for (const t of ['pointerdown', 'keydown'] as const) window.addEventListener(t, resume, { signal, once: true, capture: true });
  }
  const rooms = new Rooms(net);
  const ctx: GameContext = {
    manifest,
    signal,
    audio,
    net,
    rooms,
    storage: new Storage(net),
    scores: new Scores(net),
    lobby: (host, options) => openLobby(host, rooms, options, signal),
    frame(cb, own) {
      const stopped = () => signal.aborted || !!own?.aborted;
      let last = performance.now();
      let id = 0;
      const step = (t: number) => {
        if (stopped()) return;
        const dt = t - last;
        last = t;
        try { cb(t, dt); } finally { if (!stopped()) id = requestAnimationFrame(step); }
      };
      id = requestAnimationFrame(step);
      const cancel = () => cancelAnimationFrame(id);
      signal.addEventListener('abort', cancel, { once: true });
      own?.addEventListener('abort', cancel, { once: true });
    },
    exit: () => o.exit(),
  };
  let disposed = false;
  return {
    ctx,
    dispose() {
      if (disposed) return;
      disposed = true;
      abort.abort();
      rooms.leave();
      net.close();
      if (audio.state !== 'closed') void audio.close().catch(() => { /* already closing */ });
    },
  };
}
