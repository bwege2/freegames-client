// Debugging aid (not a test): runs the port on an events file and puts one frame's screen next to the
// oracle's (console.c's $BROGUE_SCREENS file, written with $BROGUE_SCREENS_FROM): the rows of text of both
// and the cells that differ.
//   node test/compare.ts <events file> <oracle screens file> <frame> -- <command line>
import { readFileSync } from 'node:fs';
import { parseEvents, runSession } from './harness.ts';

const [evFile, screensFile, frameArg, dash, ...args] = process.argv.slice(2);
if (dash !== '--') throw new Error('usage: compare.ts <events> <screens> <frame> -- <args>');
const frame = Number(frameArg);
const events = parseEvents(readFileSync(evFile, 'utf8')).slice(0, frame + 1);
const r = await runSession(args, events, new Map(), { keepScreens: true });
const mine = r.screens![frame];
if (!mine) throw new Error(`the port has no frame ${frame} (it has ${r.frames.length})`);

const lines = readFileSync(screensFile, 'utf8').split('\n');
const at = lines.indexOf(`F ${frame}`);
if (at < 0) throw new Error(`no frame ${frame} in ${screensFile}`);
const theirs: number[][] = [];
for (let y = 0; y < 34; y++) {
  const cells = lines[at + 1 + y].trim().split(' ');
  for (let x = 0; x < 100; x++) {
    const [g, f, b] = cells[x].split('/');
    theirs[y * 100 + x] = [parseInt(g, 16), ...f.split(',').map(Number), ...b.split(',').map(Number)];
  }
}
const ch = (g: number) => (g >= 32 && g < 127 ? String.fromCharCode(g) : g === 0 ? ' ' : '?');
let diffs = 0;
for (let y = 0; y < 34; y++) {
  let a = '', b = '';
  for (let x = 0; x < 100; x++) {
    a += ch(theirs[y * 100 + x][0]);
    b += ch(mine[(y * 100 + x) * 7]);
  }
  console.log(`${String(y).padStart(2)} O ${a.trimEnd()}`);
  if (a !== b) console.log(`${String(y).padStart(2)} P ${b.trimEnd()}`);
}
for (let i = 0; i < 3400; i++) {
  const o = theirs[i], p = Array.from(mine.subarray(i * 7, i * 7 + 7));
  if (o.some((v, k) => v !== p[k])) {
    if (diffs++ < 20) console.log(`cell ${i % 100},${Math.floor(i / 100)}: oracle ${o.join(',')} port ${p.join(',')}`);
  }
}
console.log(`${diffs} cells differ`);
