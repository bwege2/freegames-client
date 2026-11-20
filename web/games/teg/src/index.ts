// The freegames entry point: `start` is called when the player clicks Play.
import type { StartGame } from '../../../src/sdk/index.ts';
import { TegApp } from './ui/app.ts';

export const start: StartGame = (host, ctx) => {
  const app = new TegApp(host, ctx);
  return { stop: () => app.destroy() };
};
