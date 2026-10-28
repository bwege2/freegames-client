// The whole program against the original: every session of re/nethack/oracle/sessions/ that the natively
// built NetHack 3.6.7 ran (re/nethack/oracle: the seed, the clock and the login fixed, the keys typed one
// at a time) is run through the port the same way (harness.ts). Every frame, that is everything the
// program wrote to the terminal before it read a key, must be the original's byte for byte, and the
// number of draws from the random generators so far the original's; so must how each run ended. The
// runs of a session follow each other with the files the run before left (save file, record, bones).
//
// The goldens are re/nethack/oracle/goldens.sh's (the sessions made by its bot, bot.py, are in
// sessions/bots.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadGolden, replay } from './golden.ts';

const dir = join(import.meta.dirname, 'golden');
const files = readdirSync(dir).filter((f) => f.endsWith('.json.gz')).sort();

test('the goldens are there', () => {
  for (const name of ['create', 'commands', 'save', 'valkyrie', 'samurai', 'wizard', 'healer', 'barbarian', 'tourist', 'tour', 'tour2', 'tour3', 'bones', 'shop', 'help', 'explore']) {
    assert.ok(files.includes(`${name}.json.gz`), name);
  }
});

for (const f of files) {
  const name = f.replace(/\.json\.gz$/, '');
  test(`session ${name}`, async () => {
    const g = loadGolden(join(dir, f));
    const diff = await replay(g);
    assert.equal(diff, null, diff ?? '');
  });
}
