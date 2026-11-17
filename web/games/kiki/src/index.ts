// kiki the nano bot on the website. The original is kiki 1.0.2 (2006) by Thorsten Kohnhorst ("monsterkodi"),
// public domain; re/kiki/ has the reference, the level translator and the oracle of its game logic.
// engine/ is the C++ half (actions, world, objects, bots, text and menus), pyworld.ts the Python half
// (levels, menus, highscore, configuration), render/ the OpenGL drawing on three.js.
import type { StartGame } from '../../../src/sdk/index.ts';
import { KikiBrowserGame } from './game.ts';

export const start: StartGame = async (host, ctx) => {
  const game = new KikiBrowserGame(host, ctx);
  await game.init();
  return {
    async stop() { await game.stop(); },
  };
};
