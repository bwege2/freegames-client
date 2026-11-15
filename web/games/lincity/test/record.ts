// node games/lincity/test/record.ts: plays every session with the original (the oracle must be built:
// re/lincity/fetch.sh, then re/lincity/oracle/build.sh) and writes its digests to sessions/expected.json,
// which oracle.test.ts holds the port to.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EXPECTED, digest, haveOracle, runOracle, sessionNames, type Digest } from './sessions.ts';

if (!haveOracle()) throw new Error('the oracle is not built (re/lincity/fetch.sh, then re/lincity/oracle/build.sh)');
const dir = mkdtempSync(join(tmpdir(), 'lincity-record-'));
const all: Record<string, Digest> = {};
try {
  for (const name of sessionNames()) {
    const r = runOracle(name, join(dir, name));
    all[name] = digest(r.dumps, r.home);
    console.log(`${name}: ${Object.keys(all[name].dumps).length} dumps, ${Object.keys(all[name].home).length} files`);
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
writeFileSync(EXPECTED, `${JSON.stringify(all, null, 1)}\n`);
