// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// A typing duel in five modes with a rating per keyboard layout, a course for every layout and a
// trainer for switching between two layouts. A game of freegames.stream's own (README.md).
import type { StartGame } from '../../../src/sdk/index.ts';
import { App } from './app.ts';

export const start: StartGame = (host, ctx) => {
  host.style.position = 'relative';
  new App(host, ctx);
  // listeners, frames, the connection and the sounds end with ctx.signal; the host is emptied
  return { stop: () => { /* nothing of its own to end */ } };
};
