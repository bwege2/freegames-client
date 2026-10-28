// The game's entry (docs/GAME-INTEGRATION.md): the X11 client port's start (src/xpilot.ts).
import type { StartGame } from '../../../src/sdk/index.ts';
import { start as startClient } from './xpilot.ts';

export const start: StartGame = (host, ctx) => startClient(host, ctx);
