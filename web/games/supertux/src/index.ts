// SuperTux 0.6.3 on freegames.stream: the game's Play entry point (docs/GAME-INTEGRATION.md).
import './assets.ts';
import type { StartGame } from '../../../src/sdk/index.ts';
import { start as run } from './game.ts';

export const start: StartGame = run;
