// Lugaru on the website: the original's campaign, characters, combat and data; three.js renders
// the terrain, models and animations. See README.md for the parts that are simplified.
import type { StartGame } from '../../../src/sdk/index.ts';
import { LugaruApp } from './game.ts';

export const start: StartGame = async (host, ctx) => {
  const app = new LugaruApp(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
