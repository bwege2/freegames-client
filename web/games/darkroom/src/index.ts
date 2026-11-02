// A Dark Room 1.4 on the website: the original room/outside/world/path/ship/space game. The
// original's own HTML/CSS controller is translated in legacy.ts, and game.ts runs one fresh copy
// per Play, with the save in account storage.
import type { StartGame } from '../../../src/sdk/index.ts';
import { DarkRoomGame } from './game.ts';

export const start: StartGame = async (host, ctx) => {
  const game = new DarkRoomGame(host, ctx);
  await game.start();
  return { stop: () => game.stop() };
};
