// Anonymous plays (GameClient.count, the Presence message) against the real server: a play is counted
// without an account token; reading files without a token neither connects nor makes one; connect()
// makes the same connection an account one, still counted once. Needs the server jar; skipped without it.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { GameClient, hasAccountToken } from '../src/sdk/net/client.ts';
import { Storage } from '../src/sdk/storage.ts';
import { startServer, JAR, type RunningServer } from './server.ts';

let server: RunningServer | null = null;
before(async () => { server = await startServer(); });
after(async () => { await server?.stop(); });

/** the players now of a game in /stats, once they equal `want` (published every 100 ms) */
async function players(game: string, want: number): Promise<number> {
  let got = -1;
  for (let i = 0; i < 60; i++) {
    const body = await (await fetch(`http://127.0.0.1:${server!.port}/stats`)).json() as { games?: Record<string, { playing: number }> };
    got = body.games?.[game]?.playing ?? -1;
    if (got === want) return got;
    await new Promise((r) => setTimeout(r, 50));
  }
  return got;
}

test('an anonymous play counts, makes no token, and becomes an account play when it needs one', async (t) => {
  if (!server) return t.skip(`no ${JAR}`);
  // this file's own module state: no token in this "browser" yet (node has no localStorage; the client keeps it in memory)
  assert.equal(hasAccountToken(), false);
  const net = new GameClient('wumpus', { url: server.url, transport: 'ws' });
  await net.count();
  assert.equal(await players('wumpus', 1), 1, 'counted');
  assert.equal(net.online, false, 'no account connection');
  assert.equal(hasAccountToken(), false, 'no token made');
  // a game that looks for saves at its start: no token, so no files and nothing made
  const files = new Storage(net);
  assert.deepEqual(await files.list(), []);
  assert.equal(await files.get('save'), null);
  assert.equal(hasAccountToken(), false, 'still no token');
  // saving needs an account: the token is made now, on the same connection
  await files.put('save', new Uint8Array([1, 2, 3]));
  assert.equal(hasAccountToken(), true, 'the token exists once the player saved');
  assert.equal(net.online, true);
  assert.equal(await players('wumpus', 1), 1, 'still one play');
  assert.deepEqual([...(await files.get('save'))!], [1, 2, 3]);
  net.close();
  assert.equal(await players('wumpus', 0), 0, 'gone');
});
