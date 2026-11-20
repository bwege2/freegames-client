// Madness Interactive Reloaded 0.51.1 (Studio Minus, GPL-3.0) on the website; this browser port is GPL-3.0
// too (LICENSE.md). The game logic is a line-by-line translation of MIR's C# in game/ and data/; app.ts is the
// game around the levels, render/ draws with WebGL 2.
import type { StartGame } from '../../../src/sdk/index.ts';
import { MadnessApp } from './app.ts';

export const start: StartGame = (host, ctx) => {
  const app = new MadnessApp(host, ctx);
  void app.start().catch((e) => { if (!ctx.signal.aborted) console.error(e); });
  return { stop: () => app.destroy() };
};
