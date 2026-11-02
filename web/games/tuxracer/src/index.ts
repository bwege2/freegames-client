// Tux Racer on the website. The game's start screen, menus, cup and practice races are in game.ts;
// the race itself in race.ts/physics.ts; the 3D scene in render.ts. The original is Tux Racer 0.61
// (Jasmin F. Patry, GPL-2.0-or-later); re/tuxracer/ has the reference and its oracle notes.
import type { StartGame } from '../../../src/sdk/index.ts';
import { TuxRacerGame } from './game.ts';

export const start: StartGame = async (host, ctx) => {
  const game = new TuxRacerGame(host, ctx);
  await game.init();
  return {
    async stop() { await game.stop(); },
  };
};
