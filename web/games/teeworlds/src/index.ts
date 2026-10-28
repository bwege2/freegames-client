// The game's entry (docs/GAME-INTEGRATION.md): the original client in the browser (client/host.ts).
import type { StartGame } from '../../../src/sdk/index.ts';
import { startTeeworlds } from './client/host.ts';

export const start: StartGame = (host, ctx) => startTeeworlds(host, ctx);
