// The SDK's choice of server: a `?server=` link may not send the account token to a foreign server.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serverOverride } from '../src/sdk/net/client.ts';

const site = { hostname: 'freegames.stream', host: 'freegames.stream' };
const dev = { hostname: 'localhost', host: 'localhost:5173' };

test('?server= on the site: only its own host, never a foreign one', () => {
  assert.equal(serverOverride('', site), null);
  assert.equal(serverOverride('?server=wss://evil.example/ws', site), null, 'a foreign server');
  assert.equal(serverOverride('?server=wss://freegames.stream.evil.example/ws', site), null, 'a look-alike');
  assert.equal(serverOverride('?server=wss://evil.example/ws?x=freegames.stream', site), null);
  assert.equal(serverOverride('?server=ws://localhost:8790/ws', site), null, 'localhost from the site');
  assert.equal(serverOverride('?server=wss://freegames.stream/ws', site), 'wss://freegames.stream/ws', 'its own host');
  assert.equal(serverOverride('?server=wss://freegames.stream:8443/ws', site), null, 'its name on another port');
});

test('?server= on a development page: any ws(s) server; nothing that is not one', () => {
  assert.equal(serverOverride('?server=ws://localhost:8790/ws', dev), 'ws://localhost:8790/ws');
  assert.equal(serverOverride('?server=wss://test.example/ws', { hostname: '127.0.0.1', host: '127.0.0.1:4173' }), 'wss://test.example/ws');
  for (const bad of ['javascript:alert(1)', 'https://freegames.stream/ws', 'not a url', '//evil.example/ws']) {
    assert.equal(serverOverride(`?server=${encodeURIComponent(bad)}`, dev), null, bad);
  }
});
