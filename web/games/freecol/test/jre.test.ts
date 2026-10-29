// The runtime against the JVM: re/freecol/oracle/probe/.../JreProbe.java exercises what the translated
// code relies on from the Java library (HashMap orders with list and tree bins, Random, float and double
// printing, string hashes, integer arithmetic, sorting, shuffling, PriorityQueue, streams) and prints it.
// The JVM's text and the text of the same file translated by j2ts (test/gen) must be equal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { oracleMissing, oracleOutput, runOracle } from './harness.ts';

const missing = oracleMissing();

test('the Java library as the port runs it is the JVM\'s', { skip: missing ? `the oracle is missing: ${missing}` : false, timeout: 300000 }, async () => {
  const dir = oracleOutput('jreprobe', ['probe.txt'], (d) => fs.writeFileSync(path.join(d, 'probe.txt'), runOracle(['JreProbe'])));
  const theirs = fs.readFileSync(path.join(dir, 'probe.txt'), 'utf8').split('\n');
  await import('../src/freecol.ts');
  await import('./gen/index.ts');
  const { $J } = await import('../src/jre/index.ts');
  const mine = String($J.classByName('freegames.probe.JreProbe').run()).split('\n');
  for (let i = 0; i < Math.max(mine.length, theirs.length); i++) {
    if (mine[i] !== theirs[i]) {
      const a = mine[i] ?? '(none)', b = theirs[i] ?? '(none)';
      let k = 0;
      while (k < a.length && a[k] === b[k]) k++;
      assert.fail(`line ${i + 1} differs at ${k}:\n  port: ${a.substring(Math.max(0, k - 80), k + 120)}\n  JVM:  ${b.substring(Math.max(0, k - 80), k + 120)}`);
    }
  }
});
