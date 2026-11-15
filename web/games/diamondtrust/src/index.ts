// Diamond Trust of London on the website: local hot-seat and online rooms.
import type { StartGame } from '../../../src/sdk/index.ts';
import { DiamondTrustApp } from './app.ts';

export const start: StartGame = async (host, ctx) => {
  const app = new DiamondTrustApp(host, ctx);
  await app.start();
  return { stop: () => { app['root'].remove(); } };
};
