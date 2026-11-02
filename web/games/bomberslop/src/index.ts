// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// Bomberslop on the website: a bomber game on ClanBomber 2's rules, all of it made by an AI.
import type { StartGame } from '../../../src/sdk/index.ts';
import { App } from './app.ts';

export const start: StartGame = async (host, ctx) => {
  const app = new App(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
