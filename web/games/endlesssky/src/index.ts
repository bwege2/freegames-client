// Endless Sky on the website: the browser port's entry point.
import type { StartGame } from '../../../src/sdk/index.ts';
import { App } from './app.ts';

export const start: StartGame = async (host, ctx) => {
  const app = new App(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
