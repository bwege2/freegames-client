// Tux, of Math Command 2.0.3 on the website: the title screen and menus in game.ts, the arcade
// game in arcade.ts, the original lessons/math cards in math.ts. The data is the original's.
import type { StartGame } from '../../../src/sdk/index.ts';
import { TuxMathGame } from './game.ts';

export const start: StartGame = async (host, ctx) => {
  const game = new TuxMathGame(host, ctx);
  await game.start();
  return { stop: () => game.stop() };
};
