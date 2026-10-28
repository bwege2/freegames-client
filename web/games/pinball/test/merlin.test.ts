// The test assembler (merlin.ts) against what the listings say about each other: every address one
// file states for another file's routine (`PLAYSTART EQU $8854`, `SETMODE EQU HI+$10F`, the parts
// library's offsets, RUN2.S's patches into RUN.S, SWAP.S's entries) must be what that file assembles
// to. And src/image.ts must be what the listings assemble to. (Needs re/pinball/orig.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ORIG, loadAll } from './apple2.ts';
import { render } from './gen-image.ts';
import { assemble, evaluate } from './merlin.ts';

const live = existsSync(ORIG);

test('Merlin expressions and the DA forms', () => {
  const s = new Map([['A', 0x1234]]);
  assert.equal(evaluate('A+2-$10', 0x100, s, true), 0x1226);
  assert.equal(evaluate('*+4', 0x8000, s, true), 0x8004);
  const a = assemble(' ORG $300\nX DA $1234\n DA <X\n DA >X\n LDA #<X\n LDA #>X+1\n', 't');
  assert.deepEqual(Array.from(a.mem.subarray(0x300, 0x30a)), [0x34, 0x12, 0x00, 0x03, 0xa9, 0x00, 0xa9, 0x03, 0, 0]);
});

test('every cross-file address in the listings', { skip: !live && 'no re/pinball/orig' }, () => {
  const A = loadAll();
  const sym = (f: keyof typeof A, n: string) => {
    const v = A[f].symbols.get(n);
    assert.notEqual(v, undefined, `${f} ${n}`);
    return v!;
  };
  const pairs: [keyof typeof A, string, keyof typeof A, string][] = [
    ['RUN2', 'DRAWBALL', 'RUN', 'DRAWBALL'], ['RUN2', 'INITBALL', 'RUN', 'INITB2'], ['RUN2', 'ADVANCE', 'RUN', 'ADVANCE'],
    ['RUN2', 'WMOD2', 'RUN', 'WMOD2'], ['RUN2', 'WMOD3', 'RUN', 'WMOD3'], ['RUN2', 'WMOD4', 'RUN', 'WMOD4'],
    ['EDIT', 'PLAYSTART', 'RUN', 'PLAY'], ['EDIT', 'MGNT', 'RUN', 'MAG1'], ['EDIT', 'LFLIP2', 'RUN', 'LFLIPPER2'],
    ['EDIT', 'RFLIP2', 'RUN', 'RFLIPPER2'], ['EDIT', 'SPIN', 'RUN', 'SPIN1'],
    ['RUN', 'GETNOBJ', 'PPAK', 'GETNEXTOBJ'], ['RUN', 'CHAR', 'CDRAW', 'CHARBITS'], ['SWAP', 'CHAR', 'CDRAW', 'CHARBITS'],
    ['DISK', 'GAMESTART', 'RUN2', 'MAIN'], ['DISK', 'PLAYGAME', 'RUN2', 'DISKPLAY'],
  ];
  for (const n of ['POLY', 'LAUNCHER', 'LEFTFLIPPER', 'RIGHTFLIPPER', 'BALL', 'BMP1', 'BMP2', 'BMP3', 'BMP4', 'BMP5', 'BMP6', 'LKICK', 'RKICK', 'KICK1', 'KICK2', 'ROLL1', 'ROLL2', 'ROLL3', 'TARG1', 'TARG2', 'TARG3', 'TARG4', 'TARG5', 'TARG6', 'POLY1', 'POLY2', 'POLY3', 'POLY4', 'LANE1', 'LANE2', 'LANE3', 'GATE1', 'GATE2', 'GATE3', 'GATE4', 'DROP1', 'DROP2', 'CATCH1', 'CATCH2']) {
    pairs.push(['EDIT', n, 'RUN', n]);
  }
  for (const n of ['DRAWDISPLAY', 'GETOBJ', 'GETNEXTOBJ', 'DRAWOBJ', 'SETCOLOR', 'SCANPOLY', 'ALIGNPOLY', 'GETSCAN', 'MAKEHOLE', 'SELECTPOLY', 'POLYPOINTS', 'REMOVEPOLY', 'GETBOUNDS']) {
    pairs.push(['EDIT', n, 'PPAK', n], ['WIRE', n, 'PPAK', n], ['DISK', n, 'PPAK', n]);
  }
  pairs.push(['RUN', 'GETOBJ', 'PPAK', 'GETOBJ'], ['RUN', 'MAKEHOLE', 'PPAK', 'MAKEHOLE']);
  for (const n of ['SETMODE', 'DRAWBITS', 'XOFFDRAW', 'GETRECT', 'MASKS', 'HLINE', 'VLINE', 'FRAMERECT', 'DRAWRECT', 'INRECT', 'GETBUTNS', 'INITCRSR', 'XDRAWCRSR', 'UPDATECRSR', 'DOCRSRX', 'GETCURSORX', 'DOCRSRY', 'JSCTRL', 'CRSRINRECT', 'DOMENU', 'SELECT', 'INIT', 'MOVEUP', 'MOVEDOWN', 'ADDIYX', 'ADDYX', 'SUBIYX', 'SUBYX', 'CMPYX', 'CHARTO', 'PRCHAR', 'PRINT']) {
    pairs.push(['SWAP', n, 'CDRAW', n], ['WIRE', n, 'CDRAW', n], ['DISK', n, 'CDRAW', n]);
  }
  for (const n of ['SETMODE', 'XOFFDRAW', 'CHARTO', 'PRCHAR', 'PRINT']) pairs.push(['RUN', n, 'CDRAW', n], ['RUN2', n, 'CDRAW', n]);
  for (const n of ['INIT', 'DRAWR', 'FRAMER', 'XOFFDRAW', 'SETMODE', 'MOVEUP', 'MOVEDOWN', 'ADDIYX', 'SUBIYX', 'PRINT']) {
    if (A.EDIT.symbols.has(n)) pairs.push(['EDIT', n, 'CDRAW', n === 'DRAWR' ? 'DRAWRECT' : n === 'FRAMER' ? 'FRAMERECT' : n]);
  }
  for (const n of ['SWAPWIRE', 'SWAPDISK']) pairs.push(['EDIT', n, 'SWAP', n]);
  for (const n of ['SWAPUSER', 'RELOAD']) pairs.push(['DISK', n, 'SWAP', n]);
  pairs.push(['RUN2', 'RELOAD', 'SWAP', 'RELOAD']);
  for (const n of ['READSECTORS', 'SECTORCOUNT', 'BOOTSLOT', 'SLOT', 'DRIVE', 'VOLUME', 'READBUFLO']) pairs.push(['SWAP', n, 'BOOT2', n]);
  for (const [f1, n1, f2, n2] of pairs) assert.equal(sym(f1, n1), sym(f2, n2), `${f1} ${n1} = ${f2} ${n2}`);
  // GETINFO: GETOBJ3 past its first three instructions (LDA SCANMODE; AND #$80; STA SCANMODE)
  assert.equal(sym('EDIT', 'GETINFO'), sym('PPAK', 'GETOBJ3') + 6);
  // SWAP.S jumps into EDIT.S at $9500 (START), $9510 (SAVELOGO after the disk) and $9513 (DRAWKIT)
  assert.equal(sym('EDIT', 'START'), 0x9500);
  assert.equal(sym('EDIT', 'DRAWKIT'), 0x9513);
  // the pieces fit where SWAP.S reads them: editor $7000-$A8FF, wiring $9500-$9EFF, disk $9500-$9CFF,
  // game $8500-$8EFF; the bitmaps end below RUN.S
  assert.ok(A.EDIT.end <= 0xa900 && A.WIRE.end <= 0x9f00 && A.DISK.end <= 0x9d00 && A.RUN2.end <= 0x8f00);
  assert.ok(sym('RUN', 'BALLB') + 5 <= 0x7700);
});

test('src/image.ts is what the listings assemble to', { skip: !live && 'no re/pinball/orig' }, () => {
  assert.equal(readFileSync(join(import.meta.dirname, '../src/image.ts'), 'utf8'), render());
});
