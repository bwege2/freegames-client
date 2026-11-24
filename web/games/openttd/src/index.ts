// OpenTTD 15.3, stage 2: the generated landscape with the original graphics.
// Later stages add towns, industries, stations, vehicles and the game itself.
import type { StartGame } from '../../../src/sdk/index.ts';
import { OpenTTDGame } from './game.ts';

export const start: StartGame = async (host, ctx) => {
  const game = new OpenTTDGame(host, ctx);
  await game.init();
  return { stop: () => game.destroy() };
};
