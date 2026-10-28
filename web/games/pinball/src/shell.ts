// BOOT2.S and SWAP.S: what the original's disk loads and when. The boot reads the bitmap tables and
// CDRAW.S ($0800-$1EFF), the starting table ($4000) and the title picture, waits a little, then reads
// the construction set (bitmaps, RUN.S, PPAK.S, EDIT.S: $7000-$A8FF) and starts it. The wiring kit
// and the disk menu come in over EDIT.S at $9500 and the construction set is read again after them;
// the game (RUN2.S) comes in over $8500.
//
// The port has the pieces in src/image.ts; "reading" one is loading its image. The disk swaps
// themselves (PCSINSERTED asking for the PCS disk) have nothing to do in a browser.
import { DISK, DiskQuit, ONLINEGAME, dosMessages } from './disk.ts';
import { loadBitmaps, loadTitle, startBytes } from './bitmaps.ts';
import { EDITOR } from './edit.ts';
import { WAIT, keyboard, button, load, m, reset, strobe, type Wait } from './machine.ts';
import { MAKETABLES, Reload } from './run2.ts';
import { START as WIRESTART } from './wire.ts';

/** the construction set's piece: bitmaps, RUN.S, PPAK.S, EDIT.S (SWAPSECTORS 0) */
export function loadEditor(): void {
  loadBitmaps();
  load('RUN');
  load('PPAK');
  load('EDIT');
}

/** SWAPWIRE: the wiring kit in, run, the construction set back */
export function* SWAPWIRE(): Wait {
  load('WIRE');
  yield* WIRESTART();
  loadEditor();
}

/** SWAPDISK: the disk menu in, run (until Quit, or RELOAD after a game), the construction set back */
export function* SWAPDISK(): Wait {
  load('DISK');
  try {
    yield* DISK();
  } catch (e) {
    if (e instanceof Reload) {
      // RELOAD: the cursor to the top left
      m[0x82] = 0;
      m[0x83] = 0;
      m[0x84] = 0;
    } else if (!(e instanceof DiskQuit)) throw e;
  }
  loadEditor();
}

/**
 * The starting table (BOOT2.S reads it from the disk to $4000, one sector). The Apple disk is not
 * published; the Atari 800 version's starting table is (TST.O, in assets.ts with the Apple's
 * colours, test/gen-assets.ts): the outline and a wall, world settings 5, 3, 3, 3. The rest of the
 * sector is taken as zeros.
 */
export function startTable(ram: Uint8Array = m): void {
  ram.fill(0, 0x4000, 0x4100);
  ram.set(startBytes(), 0x4000);
}

/** BOOT2.S: the tables and CDRAW.S, the starting table, the title (a key or a button ends it) */
export function* BOOT(): Wait {
  reset();
  MAKETABLES();
  load('CDRAW');
  load('SWAP');
  dosMessages();
  startTable();
  // the title picture (PCSA2.PIC) into hi-res page 1; graphics, full screen, page 1, hi-res
  loadTitle();
  strobe();
  // TIME: 21 WAIT(0)s, or a key or button
  for (let t = 20; t >= 0; t--) {
    if ((keyboard() | button(0) | button(1)) & 0x80) break;
    WAIT(0);
    yield;
  }
  // SWAPEDIT
  loadEditor();
  yield* EDITOR('START');
}

/**
 * Online play: the machine as it is in the disk menu after the boot (the tables, CDRAW.S, SWAP.S, the
 * construction set, DISK.S over it), the room's table loaded and its game played (disk.ts ONLINEGAME).
 * Every client starts from the same RAM, so the same inputs give the same game.
 */
export function* ONLINE(file: Uint8Array, players: number): Wait {
  reset();
  MAKETABLES();
  load('CDRAW');
  load('SWAP');
  dosMessages();
  startTable();
  loadEditor();
  load('DISK');
  yield* ONLINEGAME(file, players);
}
