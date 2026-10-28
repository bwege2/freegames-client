// The port against Open Adventure 1.22's own regression suite: every tests/*.log (test/regress/, copied
// from the release archive by re/adventure/make-fixtures.sh) is piped into the port with the options of
// its "#options:" line, as tests/Makefile does it, and stdout must equal tests/*.chk byte for byte.
// The tests run in the Makefile's order (sorted names) in one shared directory, because some resume
// what an earlier one saved (saveresume.1 → .2, .3 → .4, saveresumeopt). The save files the suite
// makes with the original's cheat tool are test/fixtures/, made by the original (re/adventure/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { advent, bstr } from './host.ts';
import { glibc_srand_rand } from '../src/init.ts';

const regress = join(import.meta.dirname, 'regress');
const fixtures = join(import.meta.dirname, 'fixtures');
const read = (path: string) => bstr(readFileSync(path));

/** The suite's working directory, tests/: the generated save files, and ../main.o (an object file). */
const dir = new Map<string, Uint8Array>();
for (const f of ['cheat_numdie.adv', 'cheat_numdie1000.adv', 'cheat_savetamper.adv', 'resume_badversion.adv']) {
  dir.set(f, readFileSync(join(fixtures, f)));
}
// badmagic.log resumes "../main.o": any file that is not a save file (here: the start of an ELF object)
dir.set('../main.o', Uint8Array.from([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1, 0, ...new Array(4088).fill(0)]));

const logs = readdirSync(regress).filter((f) => f.endsWith('.log')).sort();

test('the regression suite is complete (107 logs, 108 check files)', () => {
  assert.equal(logs.length, 107);
  assert.equal(readdirSync(regress).filter((f) => f.endsWith('.chk')).length, 108);
});

for (const log of logs) {
  const name = log.slice(0, -'.log'.length);
  const script = read(join(regress, log));
  const legend = /^## (.*)$/m.exec(script)?.[1] ?? '(no description)';
  test(`${name}: ${legend}`, async () => {
    const opts = /#options:(.*)/.exec(script)?.[1].trim().split(/\s+/).filter(Boolean) ?? [];
    const run = await advent(opts, script, dir);
    assert.equal(run.stdout, read(join(regress, `${name}.chk`)));
    assert.equal(run.stderr, '');
    assert.equal(run.status, 0);
  });
}

test('multifile: multiple-file test (echo "inven" | advent issue36.log /dev/stdin)', async () => {
  const files = new Map([['issue36.log', readFileSync(join(regress, 'issue36.log'))], ['/dev/stdin', new TextEncoder().encode('inven\n')]]);
  const run = await advent(['issue36.log', '/dev/stdin'], '', files);
  assert.equal(run.stdout, read(join(regress, 'multifile.chk')));
});

test('the port writes the save files the original writes, byte for byte', () => {
  // saveresume.1.log and saveresume.3.log saved these above; the fixtures are the original's files
  for (const f of ['saveresume.adv', 'saveresume_win.adv']) {
    const port = dir.get(f);
    assert.ok(port, `${f} was saved`);
    assert.deepEqual(Buffer.from(port), readFileSync(join(fixtures, f)), f);
  }
});

test("the first seed: glibc's srand(time(NULL)); rand()", () => {
  // what glibc's rand() returned after srand(seed), from a C program linked against glibc
  const glibc: [number, number][] = [[0, 1804289383], [1, 1804289383], [42, 71876166], [1761390000, 1347380285],
    [1793000000, 1737912111], [2147483647, 1065668062], [2147483648, 1336741213], [4000000000, 1111130805], [4294967295, 254925627]];
  for (const [seed, r] of glibc) assert.equal(glibc_srand_rand(seed), r, `srand(${seed})`);
});
