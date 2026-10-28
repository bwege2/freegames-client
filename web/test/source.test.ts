// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// What goes to the public source repository (web/scripts/source-paths.mjs): the website and the games, never the server.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NEVER, sourceFiles } from '../scripts/source-paths.mjs';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const git = (...args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 1 << 28 });

test('the public source holds the website and the games, nothing of the game server', () => {
  const files = sourceFiles(git, 'HEAD');
  for (const f of ['web/package.json', 'web/src/site/main.ts', 'web/LICENSE.md', 'web/SOURCE.md', 'protocol/freegames.capnp']) assert.ok(files.includes(f), f);
  assert.ok(files.some((f) => f.startsWith('web/games/nethack/')));
  assert.deepEqual(files.filter((f) => /^(server\/(?!src\/main\/resources\/xpilot\/lib\/maps\/)|slipstream\/|pom\.xml$|tools\/deploy)/.test(f)), []);
});

test('a server file in the list stops the publication', () => {
  const fake = (..._: string[]) => 'web/package.json\nweb/src/site/main.ts\nserver/src/main/java/net/slop/freegames/server/Main.java\n';
  assert.throws(() => sourceFiles(fake, 'HEAD'), /must not/);
  for (const f of ['slipstream/pom.xml', 'tools/deploy.sh', 'docs/DEPLOY.md', 'pom.xml', 're/somegame/x']) assert.ok(NEVER.some((r) => r.test(f)), f);
  assert.ok(!NEVER.some((r) => r.test('server/src/main/resources/xpilot/lib/maps/tourmination.xp')));
});
