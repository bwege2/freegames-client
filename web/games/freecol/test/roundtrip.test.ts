// Loading and saving against the original: games played by the original (its AI for every nation,
// re/freecol/oracle/Oracle.java, both rule sets) are loaded by the original server and saved again
// (RoundTrip.java); the port loads the same saves and writes the same savegame.xml, byte for byte.
// The mutation check then breaks the port in three places (float printing, Java's string hashes,
// one attribute of the translated model) and the comparison must catch each.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { bootPort, firstDiff, oracleMissing, oracleOutput, runOracle, savegameXml } from './harness.ts';

const games = [
  { key: 'game-freecol-1', seed: 1, turns: 40, rules: 'freecol', check: [1, 2, 10, 25, 40] },
  { key: 'game-classic-2', seed: 2, turns: 40, rules: 'classic', check: [1, 20, 40] },
  { key: 'game-freecol-7', seed: 7, turns: 150, rules: 'freecol', check: [100, 150] },
];
const fsg = (t: number) => `turn${String(t).padStart(3, '0')}.fsg`;
const missing = oracleMissing();

async function portRoundTrip(fc: any, file: string): Promise<string> {
  const { File } = await import('../src/jre/index.ts');
  const name = path.basename(file);
  fc.vfs.write('/in/' + name, new Uint8Array(fs.readFileSync(file)));
  const saveFile = fc.jnew('net.sf.freecol.common.io.FreeColSavegameFile', 'java.io.File', new File('/in/' + name));
  const server = fc.jnew('net.sf.freecol.server.FreeColServer',
    'net.sf.freecol.common.io.FreeColSavegameFile,net.sf.freecol.common.model.Specification,java.net.InetAddress,int,java.lang.String',
    saveFile, null, null, 0, 'oracle');
  server[fc.jmethod('net.sf.freecol.server.FreeColServer', 'saveGame(java.io.File,net.sf.freecol.common.option.OptionGroup,net.sf.freecol.common.model.Unit)')](new File('/out/' + name), null, null);
  server.shutdown();
  return savegameXml(fc.vfs.read('/out/' + name));
}

function oracleGames() {
  const saves: { game: string; turn: number; input: string; expected: string }[] = [];
  for (const g of games) {
    const dir = oracleOutput(g.key, [fsg(g.turns)], (d) => runOracle(['Oracle', String(g.seed), String(g.turns), d, g.rules]));
    const rt = oracleOutput(g.key + '-roundtrip', g.check.map(fsg), (d) => runOracle(['RoundTrip', d, ...g.check.map((t) => path.join(dir, fsg(t)))]));
    for (const t of g.check) saves.push({ game: g.key, turn: t, input: path.join(dir, fsg(t)), expected: path.join(rt, fsg(t)) });
  }
  return saves;
}

test('games saved by the original load and save again byte for byte', { skip: missing ? `the oracle is missing: ${missing}` : false, timeout: 1800000 }, async () => {
  const saves = oracleGames();
  const fc = await bootPort();
  for (const s of saves) {
    const mine = await portRoundTrip(fc, s.input);
    const theirs = savegameXml(s.expected);
    if (mine !== theirs) assert.fail(`${s.game} turn ${s.turn}: savegame.xml differs ${firstDiff(mine, theirs)}`);
  }
});

test('mutation check: the round trip catches a changed port', { skip: missing ? `the oracle is missing: ${missing}` : false, timeout: 1800000 }, async () => {
  const saves = oracleGames();
  const s = saves.find((x) => x.game === 'game-freecol-7')!;
  const fc = await bootPort();
  const theirs = savegameXml(s.expected);
  const XW = fc.java('net.sf.freecol.common.io.FreeColXMLWriter');
  const intAttr = fc.jmethod('net.sf.freecol.common.io.FreeColXMLWriter', 'writeAttribute(java.lang.String,int)');
  const mutations: [string, () => () => void][] = [
    ['float printing (JavaScript instead of Java)', () => {
      const orig = fc.$J.fstr;
      fc.$J.fstr = (f: number) => String(f);
      return () => { fc.$J.fstr = orig; };
    }],
    ['string hashes (Java\'s plus one)', () => {
      const orig = fc.$J.hashCode;
      fc.$J.hashCode = (x: any) => (typeof x === 'string' ? (orig(x) + 1) | 0 : orig(x));
      return () => { fc.$J.hashCode = orig; };
    }],
    ['a unit\'s moves left written one higher', () => {
      const orig = XW.prototype[intAttr];
      XW.prototype[intAttr] = function (name: string, v: number) { return orig.call(this, name, name === 'movesLeft' ? v + 1 : v); };
      return () => { XW.prototype[intAttr] = orig; };
    }],
  ];
  for (const [what, apply] of mutations) {
    const undo = apply();
    let mine: string | null = null;
    try {
      mine = await portRoundTrip(fc, s.input);
    } catch {
      mine = null; // a mutation may also break loading: also caught
    } finally {
      undo();
    }
    assert.notEqual(mine, theirs, `the mutation "${what}" went unnoticed`);
  }
  assert.equal(await portRoundTrip(fc, s.input), theirs, 'the port is whole again');
});
