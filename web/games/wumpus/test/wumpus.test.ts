// The port against the original: the Creative Computing listing (re/wumpus/wumpus.basic) runs in a
// small HP 2000 BASIC interpreter (hpbasic.ts); the port (src/game.ts) runs with the same random
// numbers and the same typed lines. Their transcripts must be identical, character for character.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { wumpus, num, parseNumber } from '../src/game.ts';
import { runBasic } from './hpbasic.ts';

const LISTING = readFileSync(join(import.meta.dirname, '..', '..', '..', '..', 're', 'wumpus', 'wumpus.basic'), 'utf8');

/** mulberry32: the same sequence for both runs */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class EndOfScript extends Error {}

type Chooser = (transcript: string) => string | null;

/** Runs a program to the end of its input; `choose` picks each typed line from what was printed. */
async function run(program: 'basic' | 'port', seed: number, choose: Chooser): Promise<{ transcript: string; typed: string[] }> {
  let transcript = '';
  const typed: string[] = [];
  const io = {
    print: (s: string) => { transcript += s; },
    input: async () => {
      const line = choose(transcript);
      if (line === null) throw new EndOfScript();
      typed.push(line);
      transcript += `${line}\n`; // the teletype's echo and carriage return
      return line;
    },
    rnd: rng(seed),
  };
  try {
    if (program === 'basic') await runBasic(LISTING, io);
    else await wumpus(io);
  } catch (e) {
    if (!(e instanceof EndOfScript)) throw e;
  }
  return { transcript, typed };
}

/** The original's transcript with inputs chosen live, then the port replayed with exactly those lines. */
async function compare(seed: number, choose: Chooser): Promise<string> {
  const original = await run('basic', seed, choose);
  const lines = [...original.typed];
  const port = await run('port', seed, () => lines.shift() ?? null);
  assert.equal(port.transcript, original.transcript, `seed ${seed}`);
  return original.transcript;
}

const scripted = (lines: string[]): Chooser => { const l = [...lines]; return () => l.shift() ?? null; };

test('number formatting and input as HP BASIC', () => {
  // the 1975 sample run: 'YOU ARE IN ROOM  2', 'TUNNELS LEAD TO  1     3     10'
  assert.equal(num(5), ' 5    ');
  assert.equal(num(10), ' 10   ');
  assert.equal(num(-3), '-3    ');
  assert.equal(`TUNNELS LEAD TO ${num(1)}${num(3)}${num(10)}`.trimEnd(), 'TUNNELS LEAD TO  1     3     10');
  assert.equal(parseNumber(' 12 '), 12);
  assert.equal(parseNumber('2.5'), 2.5);
  assert.equal(parseNumber('3,4'), 3);
  assert.equal(parseNumber('X'), null);
  assert.equal(parseNumber(''), null);
});

test('the opening: instructions, announcement, first room', async () => {
  const t = await compare(1, scripted(['Y']));
  assert.match(t, /^INSTRUCTIONS \(Y-N\)\?Y\nWELCOME TO 'HUNT THE WUMPUS'\n/);
  assert.match(t, /ATTENTION ALL WUMPUS LOVERS!!!\n     THERE ARE NOW TWO ADDITIONS TO THE WUMPUS FAMILY OF PROGRAMS\.\n/);
  assert.match(t, /HUNT THE WUMPUS\n\n(.*\n)*YOU ARE IN ROOM  \d+ +\nTUNNELS LEAD TO  \d+ +\d+ +\d+ +\n\nSHOOT OR MOVE \(S-M\)\?$/);
});

test('a scripted game: invalid answers, a crooked arrow, moves', async () => {
  await compare(7, scripted(['N', 'X', 'M', '0', '25', 'A', '1', '2', '3', 'S', '7', '3', '1', '2', '1', '4', '5', 'S', '1', '9', 'M', '5', 'N', 'Y']));
});

/** Plays sensibly most of the time (tunnels from the last "TUNNELS LEAD TO"), sometimes not. */
function player(seed: number, budget: number): Chooser {
  const r = rng(seed ^ 0x5eed);
  let left = budget;
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)];
  return (t) => {
    if (left-- <= 0) return null;
    const prompt = t.slice(t.lastIndexOf('\n') + 1);
    const tunnels = [...t.matchAll(/TUNNELS LEAD TO +(\d+) +(\d+) +(\d+)/g)].pop()?.slice(1) ?? ['1'];
    const silly = r() < 0.08;
    if (silly) return pick(['', 'X', '0', '21', '2.5', ' 3 ', '-1', 'YES', '7,8', 'MOVE']);
    if (prompt.startsWith('INSTRUCTIONS')) return pick(['Y', 'N']);
    if (prompt.includes('SAME SET-UP')) return pick(['Y', 'N']);
    if (prompt.includes('SHOOT OR MOVE')) return r() < 0.35 ? 'S' : 'M';
    if (prompt.includes('NO. OF ROOMS')) return String(1 + Math.floor(r() * 5));
    if (prompt.includes('ROOM #')) return r() < 0.7 ? pick(tunnels) : String(1 + Math.floor(r() * 20));
    if (prompt.includes('WHERE TO')) return r() < 0.9 ? pick(tunnels) : String(1 + Math.floor(r() * 20));
    return pick(['Y', 'N', 'S', 'M', '1']);
  };
}

test('500 games against the listing', async () => {
  const seen = new Set<string>();
  const events = ['AHA! YOU GOT THE WUMPUS!', 'OUCH! ARROW GOT YOU!', 'MISSED', 'TSK TSK TSK- WUMPUS GOT YOU!',
    '... OOPS! BUMPED A WUMPUS!', 'YYYIIIIEEEE . . . FELL IN PIT', 'ZAP--SUPER BAT SNATCH!', 'NOT POSSIBLE -',
    "ARROWS AREN'T THAT CROOKED", 'I SMELL A WUMPUS!', 'I FEEL A DRAFT', 'BATS NEARBY!', 'HEE HEE HEE', 'HA HA HA - YOU LOSE!',
    'SAME SET-UP (Y-N)?Y', 'SAME SET-UP (Y-N)?N'];
  for (let seed = 1; seed <= 500; seed++) {
    const t = await compare(seed * 7919, player(seed, 120));
    for (const e of events) if (t.includes(e)) seen.add(e);
  }
  assert.deepEqual(events.filter((e) => !seen.has(e)), [], 'every event of the listing happened at least once');
});
