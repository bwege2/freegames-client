// X-Moto 0.6.3 on the website: the bike physics (ODE QuickStep), the levels and their Lua scripts, the
// replays and the menus. app.ts runs it, scene.ts is a level being played, render.ts draws it.
import type { StartGame } from '../../../src/sdk/index.ts';
import { XMotoApp } from './app.ts';

export const start: StartGame = async (host, ctx) => {
  const app = new XMotoApp(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
