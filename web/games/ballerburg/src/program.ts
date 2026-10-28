// One run of the program: every module's globals and statics as at the start of main(), then main().
import { sdlReset } from './sdl.ts';
import { gfxReset } from './sdlgfx.ts';
import { sdlguiReset } from './sdlgui.ts';
import { screenReset } from './screen.ts';
import { baller1Reset, main } from './baller1.ts';
import { baller2Reset } from './baller2.ts';
import { marketReset } from './market.ts';
import { cannoneerReset } from './cannoneer.ts';
import { settingsReset } from './settings.ts';
import { alertReset } from './dlgAlert.ts';
import { guiReset } from './ballergui.ts';
import { psgReset } from './psg.ts';
import { musicReset } from './music.ts';
import { setMoves } from './moves.ts';
import { srand } from './random.ts';

export function resetProgram(): void {
  sdlReset();
  gfxReset();
  sdlguiReset();
  screenReset();
  baller1Reset();
  baller2Reset();
  marketReset();
  cannoneerReset();
  settingsReset();
  alertReset();
  guiReset();
  psgReset();
  musicReset();
  setMoves(null);
  srand(1);
}

/** a fresh program: main() until the player quits */
export async function runProgram(): Promise<number> {
  resetProgram();
  return main();
}
