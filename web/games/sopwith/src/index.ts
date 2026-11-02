// Sopwith 2.9.0 on the website: the 320x200 original, single player, local two-player and online
// two-player lockstep. The simulation is in sim.ts, the app/menu in app.ts.
import type { StartGame } from '../../../src/sdk/index.ts';
import { SopwithApp } from './app.ts';

export const start: StartGame = async (host, ctx) => {
  const app = new SopwithApp(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
