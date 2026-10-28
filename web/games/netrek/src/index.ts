// The game's entry (docs/GAME-INTEGRATION.md): the COW client in the browser (host.ts).
import type { StartGame } from '../../../src/sdk/index.ts';
import { startNetrek } from './host.ts';

export const start: StartGame = (host, ctx) => startNetrek(host, ctx);
