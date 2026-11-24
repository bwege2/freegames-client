import type { StartGame } from '../../../src/sdk/index.ts';
import { GameApp } from './game.ts';

export const start: StartGame = async (host, ctx) => {
  const app = new GameApp(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
