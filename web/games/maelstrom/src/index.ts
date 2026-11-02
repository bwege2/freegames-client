// Maelstrom 4.0.2 on the website: the 640x480 arcade game, original sprites
// and sounds, title/high-score/controls screens and account high scores.
import type { StartGame } from '../../../src/sdk/index.ts';
import { MaelstromApp } from './app.ts';

export const start: StartGame = async (host, ctx) => {
  const app = new MaelstromApp(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
