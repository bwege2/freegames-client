// OpenCity on the website. The original is OpenCity 0.0.6.5stable (Duong Khang Nguyen, Frédéric Rodrigo
// and contributors, GPL-2.0-or-later); re/opencity/ has the reference, its license check and the oracle.
// The game's logic is in city.ts (checked against the original by test/), the 3D view in render.ts, the
// user interface in game.ts and gui.ts.
import type { StartGame } from '../../../src/sdk/index.ts';
import { OpenCityGame } from './game.ts';

export const start: StartGame = async (host, ctx) => {
  const game = new OpenCityGame(host, ctx);
  await game.init();
  return { stop: () => game.stop() };
};
