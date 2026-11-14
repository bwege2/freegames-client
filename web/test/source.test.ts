// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// What goes to the public source repository (web/scripts/source-paths.mjs): the website and the games, never the server.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NEVER, closedGames, closedPaths, sourceFiles } from '../scripts/source-paths.mjs';

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

test('a closed game (game.json "closed": true) stays out: its folder, schema, icons and server module', () => {
  // a made-up repository: two games, one of them closed
  const tree = ['web/package.json', 'web/src/site/main.ts', 'web/games/open/game.json', 'web/games/open/src/index.ts', 'web/games/shut/game.json',
    'web/games/shut/src/index.ts', 'web/games/shut/assets/music/song.mp3', 'web/games/shut/test/x.test.ts', 'web/games/shut/src/proto/shut.ts',
    'protocol/freegames.capnp', 'protocol/games/open.capnp', 'protocol/games/shut.capnp', 'web/icons/open.png', 'web/icons/shut.png',
    'web/icons/shut-180.png', 'web/icons/shutter.png'];
  const fake = (...a: string[]): string => {
    if (a[0] === 'show') return a[1].endsWith('web/games/shut/game.json') ? '{"id": "shut", "closed": true}' : '{"id": "open"}';
    return `${tree.join('\n')}\n`;
  };
  assert.deepEqual(closedGames(fake, 'HEAD'), ['shut']);
  const files = sourceFiles(fake, 'HEAD');
  assert.deepEqual(files, ['web/package.json', 'web/src/site/main.ts', 'web/games/open/game.json', 'web/games/open/src/index.ts', 'protocol/freegames.capnp',
    'protocol/games/open.capnp', 'web/icons/open.png', 'web/icons/shutter.png']);
  for (const f of ['server/src/main/java/net/slop/freegames/games/shut/ShutModule.java', 'server/src/test/java/net/slop/freegames/games/shut/ShutModuleTest.java']) {
    assert.ok(closedPaths('shut').some((r) => r.test(f)), f);
  }
  // this repository: Tekk No is closed, and nothing of it is in the list
  assert.ok(closedGames(git, 'HEAD').includes('tekkno'));
  const real = sourceFiles(git, 'HEAD');
  assert.deepEqual(real.filter((f) => /tekkno/i.test(f)), [], 'no file of Tekk No');
  assert.ok(real.some((f) => f.startsWith('web/games/nethack/')), 'the open games are there');
});
