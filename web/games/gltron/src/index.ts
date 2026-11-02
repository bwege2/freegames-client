// GLtron 0.70 on the website: the original lightcycle arena, AI, menus and sounds. The simulation
// is in sim.ts, the three.js scene in render.ts, and game.ts runs one fresh match per Play.
import type { StartGame } from '../../../src/sdk/index.ts';
import { GltronApp } from './game.ts';

export const start: StartGame = async (host, ctx) => {
  const app = new GltronApp(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
