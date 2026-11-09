// Saves against the original, in two processes as a player's game is saved and continued later: a run of
// test/scripts/save.txt ends with q (Dungeon.saveAll as the game menu's "Main menu" saves, the saved files of
// slot 1 printed as "file NAME BASE64"); a new process gets those files and test/scripts/load.txt (C: the
// title's "Continue", InterlevelScene's CONTINUE mode, Dungeon.loadGame and loadLevel) and plays on. Goldens:
// test/oracle/save-*.txt.gz and load-*.txt.gz (re/shatteredpixeldungeon/oracle/goldens.sh, the JVM oracle).
// Checked: the port's save run and its files (their JSON; the gzip bytes are fflate's, not zlib's, see
// NOTES.md), the port continuing from the original's files, and the port continuing from its own files.
// (Quitting to the title and continuing in one process is the r command of play-*-resume, play.test.ts.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { assetsDir, golden, goldenDir, normalizePlay } from './harness.ts';

const here = path.dirname(new URL(import.meta.url).pathname);
const has = fs.existsSync(path.join(goldenDir, 'save-12345-0.txt.gz')) && fs.existsSync(path.join(goldenDir, 'load-12345-0.txt.gz'));
const skip = !assetsDir() ? "no assets (the game's assets/)" : !has ? 'no save goldens (re/shatteredpixeldungeon/oracle/goldens.sh)' : false;

/** The port's play output for a script file (a new process). */
function play(meta: Record<string, string>, scriptFile: string, mutation = ''): string {
  return execFileSync(process.execPath, ['--max-old-space-size=1500', path.join(here, 'run-play.ts'), meta.seed, meta.class, '@' + scriptFile, meta.clock],
    { env: { ...process.env, SPD_MUTATE: mutation }, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] });
}
const fileLines = (s: string) => s.split('\n').filter((l) => l.startsWith('file '));
const withoutFiles = (s: string) => normalizePlay(s.split('\n').filter((l) => !l.startsWith('file ')).join('\n'));
/** A saved file's JSON (gunzipped), without the save time. */
const json = (line: string) => zlib.gunzipSync(Buffer.from(line.split(' ')[2], 'base64')).toString('utf8').replace(/"last_played":\d+/g, '"last_played":0');

/** The first differing line of two outputs. */
function lineDiff(a: string, b: string): string | null {
  if (a === b) return null;
  const x = a.split('\n'), y = b.split('\n');
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if (x[i] !== y[i]) return `line ${i + 1}:\n  port:     ${(x[i] ?? '<missing>').substring(0, 200)}\n  original: ${(y[i] ?? '<missing>').substring(0, 200)}`;
  }
  return 'they differ in length only';
}

/** A load script: the saved files' lines, then load.txt. */
function loadScript(files: string[]): string {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'spd-load-')), 'load.txt');
  fs.writeFileSync(f, files.join('\n') + '\n' + fs.readFileSync(path.join(here, 'scripts/load.txt'), 'utf8'));
  return f;
}

let portSave: string | null = null;

test('a game saved as the original saves it (q: the transcript and the saved files)', { skip, timeout: 600000 }, () => {
  const g = golden('save-12345-0');
  portSave = play(g.meta, path.join(here, 'scripts/save.txt'));
  const d = lineDiff(withoutFiles(portSave), withoutFiles(g.text));
  if (d) assert.fail('the save run differs at ' + d);
  const mine = fileLines(portSave), theirs = fileLines(g.text);
  assert.deepEqual(mine.map((l) => l.split(' ')[1]), theirs.map((l) => l.split(' ')[1]), 'the same files');
  for (let i = 0; i < theirs.length; i++) {
    const name = theirs[i].split(' ')[1];
    assert.equal(json(mine[i]), json(theirs[i]), `${name}: the saved JSON`);
    // the compressed bytes: the same gzip framing, other deflate data (fflate, not zlib)
    const a = Buffer.from(mine[i].split(' ')[2], 'base64'), b = Buffer.from(theirs[i].split(' ')[2], 'base64');
    assert.deepEqual(a.subarray(0, 10), b.subarray(0, 10), `${name}: Java's gzip header`);
  }
});

test("the original's saved game continued in a new process", { skip, timeout: 600000 }, () => {
  const s = golden('save-12345-0'), l = golden('load-12345-0');
  const mine = play(l.meta, loadScript(fileLines(s.text)));
  const d = lineDiff(normalizePlay(mine), normalizePlay(l.text));
  if (d) assert.fail('continuing differs at ' + d);
});

test("the port's saved game continued in a new process", { skip, timeout: 600000 }, () => {
  const s = golden('save-12345-0'), l = golden('load-12345-0');
  const saved = portSave ?? play(s.meta, path.join(here, 'scripts/save.txt'));
  const mine = play(l.meta, loadScript(fileLines(saved)));
  const d = lineDiff(normalizePlay(mine), normalizePlay(l.text));
  if (d) assert.fail('continuing from the port\'s files differs at ' + d);
});

test('mutation check: a hero saved with 1 HP less is seen', { skip, timeout: 600000 }, () => {
  const s = golden('save-12345-0'), l = golden('load-12345-0');
  const saved = play(s.meta, path.join(here, 'scripts/save.txt'), 'save-hp');
  const mine = play(l.meta, loadScript(fileLines(saved)));
  assert.ok(lineDiff(normalizePlay(mine), normalizePlay(l.text)), 'continuing from a wrong save must differ');
});
