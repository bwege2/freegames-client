// node games/abuse/test/make-save.ts <session> <frame> <x> <y> <out.spe> [endgame]: runs the port on a
// session and, at that frame, puts player 0 at x,y and saves the game as the save consoles do
// (save_game, level::save with every object); the file is a save game of the original's format, which
// the oracle sessions then load ("# home file"). With "endgame", the level's END_GAME pipe is also set
// to its last step (aistate 8) and the object it is linked to switched on, so that the end sequence
// starts. Used to make test/sessions/files/*.spe.
import { writeFileSync } from 'node:fs';
import { runPort } from './harness.ts';
import { platform } from '../src/rt/platform.ts';
import { G } from '../src/globals.ts';
import { L } from '../src/lglobals.ts';
import { vfsGet } from '../src/rt/vfs.ts';
import { object_names } from '../src/chars.ts';

const [session, frame, x, y, out, what] = process.argv.slice(2);
let n = 0;
const p = runPort(session, 1);
const pl = platform();
const present = pl.present.bind(pl);
pl.present = (a, b, c) => {
  if (c && ++n === +frame) {
    const o = L.player_list!.focus!;
    o.x = +x;
    o.y = +y;
    if (what === 'endgame') {
      for (let e = G.current_level.first_object(); e; e = e.next) {
        if (object_names[e.otype] !== 'END_GAME') continue;
        e.set_aistate(8);
        if (e.total_objects()) e.get_object(0).set_aistate(1);
      }
    }
    G.current_level.save('save0001.spe', 1);
    writeFileSync(out, vfsGet('/save/save0001.spe')!);
    console.log(`saved ${out}`);
  }
  present(a, b, c);
};
await p;
