// The translated script engine (C4Script: parser, compiler, interpreter, engine functions) against the
// original's c4script (re/openclonk/oracle/build-headless.sh): every program of aul-corpus.c, and every
// script of the game content (planet/**/*.c), must log the same, errors and warnings included.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { re, planet } from './oracle.ts';
import { runScript } from './aul.ts';

const c4script = path.join(re, 'work/headless/c4script');
const missing = !fs.existsSync(c4script) ? 'no c4script (run re/openclonk/oracle/build-headless.sh)' : null;
const skip = missing ? `the oracle is missing: ${missing}` : false;

function original(script: string): string {
  const r = spawnSync(c4script, ['-e', script], { encoding: 'latin1', maxBuffer: 1 << 26 });
  return Buffer.from((r.stdout ?? '') + (r.stderr ?? ''), 'latin1').toString('utf8');
}

function port(script: string): string {
  try {
    return runScript(script).out;
  } catch (e) {
    return `CRASH ${(e as Error).stack}`;
  }
}

/** the first line that differs */
function firstDiff(a: string, b: string): string {
  const x = a.split('\n'), y = b.split('\n');
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if (x[i] !== y[i]) return `line ${i + 1}:\n  original: ${(x[i] ?? '(none)').slice(0, 300)}\n  port:     ${(y[i] ?? '(none)').slice(0, 600)}`;
  }
  return '';
}

export function programs(): string[] {
  const text = fs.readFileSync(path.join(import.meta.dirname, 'aul-corpus.c'), 'utf8');
  return text.split(/^\/\/ ----\n/m).slice(1);
}

test('C4Script programs run as in the original', { skip }, () => {
  const bad: string[] = [];
  programs().forEach((p, i) => {
    const a = original(p), b = port(p);
    if (a !== b) bad.push(`program ${i + 1}: ${firstDiff(a, b)}`);
  });
  assert.deepEqual(bad.slice(0, 3), []);
});

/** a copy of src/ and this harness with one change in one translated module */
async function mutant(file: string, find: RegExp, replace: string): Promise<typeof runScript> {
  const src = path.resolve(import.meta.dirname, '../src');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openclonk-mutant-'));
  // the copied modules import web dependencies (fflate); make the project's node_modules visible
  fs.symlinkSync(path.join(import.meta.dirname, '../../../node_modules'), path.join(dir, 'node_modules'), 'dir');
  for (const sub of ['aul', 'rt']) fs.cpSync(path.join(src, sub), path.join(dir, 'src', sub), { recursive: true });
  fs.mkdirSync(path.join(dir, 'test'));
  fs.copyFileSync(path.join(import.meta.dirname, 'aul.ts'), path.join(dir, 'test/aul.ts'));
  const f = path.join(dir, 'src/aul', file);
  const text = fs.readFileSync(f, 'utf8');
  assert.match(text, find, 'the code to change is in the translation');
  fs.writeFileSync(f, text.replace(find, replace));
  return (await import(path.join(dir, 'test/aul.ts'))).runScript;
}

for (const [what, file, find, replace] of [
  ['the priority of binary +', 'script/C4AulParse.ts', /Priority = 12, \$o\.Identifier = S\("\+"\)/, 'Priority = 14, $o.Identifier = S("+")'],
  ['the multiplication of the interpreter', 'script/C4AulExec.ts', /pPar1\.SetInt\(Math\.imul\(pPar1\._getInt\(\), pPar2\._getInt\(\)\)\);/,
    'pPar1.SetInt(Math.imul(pPar1._getInt(), pPar2._getInt()) + 1 | 0);'],
] as const) {
  test(`mutation check: changing ${what} fails the comparison`, { skip }, async () => {
    const run = await mutant(file, find, replace);
    const differ = programs().filter((p) => {
      let b: string;
      try { b = run(p).out; } catch (e) { b = `CRASH ${(e as Error).stack}`; }
      return b !== original(p);
    });
    assert.ok(differ.length > 0, 'the mutant must log other things than the original');
  });
}

test('the game\'s scripts compile with the same messages', { skip, timeout: 600000 }, () => {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name.endsWith('.c')) files.push(p);
    }
  };
  walk(planet);
  files.sort();
  const bad: string[] = [];
  for (const f of files) {
    // load only (no Main): what the parser and compiler say
    const src = fs.readFileSync(f, 'utf8').replace(/^\s*func\s+Main\s*\(/m, 'func Main_(');
    if (src.length > 100000) continue;
    const a = original(src), b = port(src);
    if (a !== b) bad.push(`${path.relative(planet, f)}:\n--- original\n${a.slice(0, 800)}\n--- port\n${b.slice(0, 800)}`);
  }
  assert.deepEqual(bad.slice(0, 3), [], `${bad.length} of ${files.length} scripts differ`);
});
