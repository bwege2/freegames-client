// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Where a game's page is (web/src/site/hosts.ts): its own host at freegames.stream, #/<id> anywhere else; Play
// always on the site itself.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameHosts, gameHref, hostGame, playHref, siteHref } from '../src/site/hosts.ts';

const page = (url: string) => {
  const u = new URL(url);
  return { hostname: u.hostname, protocol: u.protocol, port: u.port };
};

test('at freegames.stream a listed game links to its own host', () => {
  assert.equal(gameHosts(page('https://freegames.stream/')), true);
  assert.equal(gameHref({ id: 'ballerburg' }, page('https://freegames.stream/#/?q=x')), 'https://ballerburg.freegames.stream/');
  assert.equal(gameHref({ id: 'ballerburg', listed: true }, page('http://freegames.stream:8790/')), 'http://ballerburg.freegames.stream:8790/',
    'a test that maps the names to this machine keeps its scheme and port');
  assert.equal(gameHref({ id: 'wumpus' }, page('https://ballerburg.freegames.stream/')), 'https://wumpus.freegames.stream/', 'from one game to another');
});

test("at a game's own host the site's pages and Play are the site's", () => {
  const at = page('https://ballerburg.freegames.stream/');
  assert.equal(hostGame(at), 'ballerburg');
  assert.equal(playHref({ id: 'ballerburg' }, at), 'https://freegames.stream/#/ballerburg/play');
  assert.equal(siteHref('impressum.html', at), 'https://freegames.stream/impressum.html');
  assert.equal(siteHref('#/?q=chess', page('http://ballerburg.freegames.stream:8790/')), 'http://freegames.stream:8790/#/?q=chess');
  assert.equal(gameHref({ id: 'example', listed: false }, at), 'https://freegames.stream/#/example');
  assert.equal(hostGame(page('https://a.b.freegames.stream/')), null);
  assert.equal(hostGame(page('https://freegames.stream/')), null);
  assert.equal(hostGame(page('https://ballerburg.freegames.stream.example/')), null);
});

test('unlisted games and other names stay inside the site', () => {
  assert.equal(gameHref({ id: 'example', listed: false }, page('https://freegames.stream/')), '#/example');
  for (const url of ['http://localhost:5290/', 'http://127.0.0.1:8790/', 'https://www.example.org/', 'http://185.253.154.170/']) {
    assert.equal(gameHosts(page(url)), false, url);
    assert.equal(gameHref({ id: 'ballerburg' }, page(url)), '#/ballerburg', url);
    assert.equal(playHref({ id: 'ballerburg' }, page(url)), '#/ballerburg/play', url);
    assert.equal(siteHref('impressum.html', page(url)), 'impressum.html', url);
  }
});
