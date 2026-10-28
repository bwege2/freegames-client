// The port as the website runs it (src/index.ts: browser_host on a terminal that echoes like the SDK's
// Teletype, files in account storage) against interactive sessions of the original on a terminal
// (test/fixtures/session-N.txt, recorded on a pseudo-terminal by re/adventure/pty-sessions.py). The
// regression suite pipes its input and so never shows the prompts and echo a player sees; these do.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser_host, storage_name } from '../src/index.ts';
import { Exit, set_host } from '../src/advent.ts';
import { main } from '../src/main.ts';

const fixtures = join(import.meta.dirname, 'fixtures');

/** The lines typed in each session (as in re/adventure/pty-sessions.py) */
const SESSIONS = [
  ['n', 'seed 1', 'in', 'take lamp', 'save', 'y', 'lamp.adv'],
  ['no', 'resume', 'nothere.adv', 'lamp.adv', 'inventory', 'score', 'quit', 'y'],
  ['Y', 'seed 7', 'Go North', 'frobnicate', 'get lamp now', 'w', 'west', 'SAVE', 'n', 'resume', 'n', 'quit', 'yes'],
];

/** One play on the website: the screen's text, with `files` as the player's account storage. */
async function play(lines: string[], files: Map<string, Uint8Array>): Promise<string> {
  let screen = '';
  const typed = [...lines];
  const term = {
    write: (s: string) => { screen += s; },
    // the Teletype prints the typed line and its newline when Enter is pressed
    readLine: async () => {
      const l = typed.shift();
      if (l === undefined) throw new Error('the session typed everything it has');
      screen += `${l}\n`;
      return l;
    },
  };
  const storage = {
    get: async (name: string) => files.get(name) ?? null,
    put: async (name: string, data: Uint8Array) => { files.set(name, data.slice()); return { name, size: data.length, modified: 0 }; },
  };
  set_host(browser_host(term, storage, new AbortController().signal));
  try {
    await main([]);
  } catch (e) {
    if (!(e instanceof Exit)) throw e;
  }
  assert.deepEqual(typed, [], 'every line was read');
  return screen;
}

test('the website shows what the original shows on a terminal', async () => {
  const files = new Map<string, Uint8Array>();
  for (const [i, lines] of SESSIONS.entries()) {
    const screen = await play(lines, files);
    assert.equal(screen, readFileSync(join(fixtures, `session-${i + 1}.txt`), 'latin1'), `session ${i + 1}`);
  }
  // the save file in account storage is the one the original wrote in its directory
  assert.deepEqual(Buffer.from(files.get('lamp.adv')!), readFileSync(join(fixtures, 'session-lamp.adv')));
});

test('file names: the ones account storage keeps; others cannot be opened', () => {
  for (const ok of ['lamp.adv', 'saveresume_win.adv', 'A-1', 'x'.repeat(64), '...']) assert.equal(storage_name(ok), ok, ok);
  for (const bad of ['', '/', '../main.o', 'a/b', 'my game', '.', '..', 'scratch.tmp', 'x'.repeat(65), 'ä']) {
    assert.equal(storage_name(bad), null, bad);
  }
});

test('typed text is UTF-8 for the program, and its output UTF-8 on the screen', async () => {
  const files = new Map<string, Uint8Array>();
  const screen = await play(['n', 'größer', 'quit', 'y'], files);
  assert.match(screen, /> größer\n\nSorry, I don't know the word "größer"\.\n/);
});
