// Online play in lockstep (src/port/server/lockstep.ts, protocol/games/freecol.capnp): two browsers (each a
// client worker and a server worker, as on the page) and, in place of the site's server module
// (server/.../games/freecol/FreecolModule.java), one that does what it does for the game: it puts every
// browser's commands in one order, with salts, and sends them to everyone. Both players join, start the game
// from FreeCol's start panel and end their turns; both browsers' games report the same turns and hashes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startWorkers, waitFor, click, type TwoWorkers, type TreeNode } from './workers.ts';
import type { Entry, Out } from '../src/port/server/lockstep.ts';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class FakeModule {
  entries: Entry[] = [];
  browsers: TwoWorkers[] = [];
  reports = new Map<number, { index: number; turn: number; current: number; hash: bigint }[]>();
  over: { seat: number; index: number; winner: number }[] = [];
  command(seat: number, m: Out) {
    if (m.t === 'command') {
      const e: Entry = { index: this.entries.length, seat, salt: (Math.random() * 2 ** 32) >>> 0, kind: m.kind, line: m.line ?? null };
      this.entries.push(e);
      for (const b of this.browsers) b.toServer({ t: 'entry', e });
    } else if (m.t === 'report') {
      if (!this.reports.has(seat)) this.reports.set(seat, []);
      this.reports.get(seat)!.push({ index: m.index, turn: m.turn, current: m.current, hash: m.hash });
    } else {
      this.over.push({ seat, index: m.index, winner: m.winner });
    }
  }
}

test('two browsers join a game, start it and end their turns in lockstep', { timeout: 600000 }, async () => {
  const module = new FakeModule();
  const seed = '-4242424242424242';
  const browsers: TwoWorkers[] = [];
  // both browsers start at once, as the round starts them; each gets every entry, also those made before it was there
  await Promise.all(([[0, 'Ann'], [1, 'Bob']] as const).map(async ([seat, name]) => {
    const w = await startWorkers(1280, 800, 'en_US', [], {
      server: { seat, seed, rules: 'freecol', difficulty: 'medium', port: 3541 },
      client: { port: 3541, name },
      out: (m) => module.command(seat, m),
    });
    browsers[seat] = w;
    module.browsers.push(w);
    for (const e of module.entries) w.toServer({ t: 'entry', e });
  }));
  const [a, b] = browsers;
  const press = async (w: TwoWorkers, pred: (n: TreeNode) => boolean, ms = 120000) => {
    click(w, (await waitFor(w, pred, ms)).node);
    await sleep(1000);
  };
  try {
    // both in FreeCol's start panel; whoever logged in first is its admin
    await waitFor(a, (n) => n.cls === 'net.sf.freecol.client.gui.panel.StartGamePanel', 180000);
    await waitFor(b, (n) => n.cls === 'net.sf.freecol.client.gui.panel.StartGamePanel', 180000);
    await press(b, (n) => n.text === "I'm Ready");
    await press(a, (n) => n.text === "I'm Ready");
    // Start Game counts only once both readies have reached Ann's server (as in the original): press it again
    // until the game is on
    // the admin, who alone can start, is whoever logged in first (as in the original): the first login entry
    const loginSeat = module.entries.find((e) => e.kind === 'line' && e.line && new TextDecoder().decode(e.line).includes('<login'))?.seat ?? 0;
    const admin = loginSeat === 1 ? b : a;
    let started = false;
    for (let i = 0; i < 6 && !started; i++) {
      await press(admin, (n) => n.text === 'Start Game');
      started = await waitFor(admin, (n) => n.cls === 'net.sf.freecol.client.gui.panel.InfoPanel', 30000).then(() => true, () => false);
    }
    if (!started) {
      // what went through the module, and what both start panels show, for the diagnosis
      const tail = module.entries.slice(-25).map((e) => `${e.index}:${e.seat}:${e.kind}:${(e.line ?? '').slice(0, 70)}`).join('\n');
      const players = async (w: TwoWorkers) => (await w.tree()).split('\n').filter((l) => /PlayersTable|JCheckBox|ready|Ready|JTable/.test(l)).join('\n');
      console.log(`ENTRIES\n${tail}\nANN\n${await players(a)}\nBOB\n${await players(b)}`);
    }
    assert.ok(started, 'the game started');
    // the game: each player's turn in order; each ends it (Enter, then OK in the end turn dialog)
    for (const w of [a, b]) {
      await waitFor(w, (n) => n.cls === 'net.sf.freecol.client.gui.panel.InfoPanel', 180000);
    }
    for (const w of [a, b, a]) {
      await press(w, (n) => n.text === 'OK' && n.cls.endsWith('FreeColButton'), 120000).catch(() => {});
      w.key(10, '\n');
      await press(w, (n) => n.text === 'OK' && n.cls === 'javax.swing.JButton', 60000);
      await sleep(3000);
    }
    for (let i = 0; i < 120 && (module.reports.get(1)?.length ?? 0) < (module.reports.get(0)?.length ?? 0); i++) await sleep(500);
    const ra = module.reports.get(0) ?? [], rb = module.reports.get(1) ?? [];
    assert.ok(ra.some((r) => r.turn >= 2), 'the game reached turn 2: ' + JSON.stringify(ra, (_k, v) => (typeof v === 'bigint' ? String(v) : v)));
    assert.deepEqual(rb, ra, 'both browsers report the same turns, players on turn and hashes');
    assert.ok(ra.some((r) => r.current === 0) && ra.some((r) => r.current === 1), 'both players had a turn');
    assert.deepEqual(a.errors, []);
    assert.deepEqual(b.errors, []);

    // Bob's browser reloads: the module drops his connection and sends the round so far (History); the new
    // browser replays it without its client (liveFrom), then its client logs in again and plays on
    // the panel that names his nation (one of the eight European nations of the rules) may still be on its way:
    // look for up to ten seconds
    let adjective: string | undefined;
    for (let i = 0; i < 50 && !adjective; i++) {
      adjective = /\((Dutch|English|French|Spanish|Portuguese|Swedish|Danish|Russian) /.exec(await b.tree())?.[1];
      if (!adjective) await new Promise((r) => setTimeout(r, 200));
    }
    const nation = ({ Dutch: 'Netherlands', English: 'England', French: 'France', Spanish: 'Spain', Portuguese: 'Portugal', Swedish: 'Sweden', Danish: 'Denmark', Russian: 'Russia' } as Record<string, string>)[adjective ?? ''];
    assert.ok(nation, "Bob's nation");
    await b.stop();
    module.browsers = [a];
    module.entries.push({ index: module.entries.length, seat: 1, salt: 99, kind: 'drop', line: null });
    a.toServer({ t: 'entry', e: module.entries[module.entries.length - 1] });
    module.reports.delete(1);
    const b2 = await startWorkers(1280, 800, 'en_US', [], {
      server: { seat: 1, seed, rules: 'freecol', difficulty: 'medium', port: 3541 },
      client: { port: 3541, name: 'Bob' },
      out: (m) => module.command(1, m),
    });
    browsers.push(b2);
    b2.toServer({ t: 'liveFrom', index: module.entries.length });
    for (const e of module.entries) b2.toServer({ t: 'entry', e });
    module.browsers = [a, b2];
    // as in the original, a player joining a running game picks a nation that has no player: his own
    await press(b2, (n) => n.text === nation && n.cls === 'javax.swing.JButton', 180000);
    await waitFor(b2, (n) => n.cls === 'net.sf.freecol.client.gui.panel.InfoPanel', 180000);
    await press(b2, (n) => n.text === 'OK' && n.cls.endsWith('FreeColButton'), 30000).catch(() => {});
    b2.key(10, '\n');
    await press(b2, (n) => n.text === 'OK' && n.cls === 'javax.swing.JButton', 60000);
    const third = (seat: number) => module.reports.get(seat)?.find((r) => r.turn === 3);
    for (let i = 0; i < 240 && !(third(0) && third(1)); i++) await sleep(500);
    assert.ok(third(0), 'turn 3 came');
    assert.deepEqual(third(1), third(0), 'the browser that came back has the same game');
    assert.deepEqual(b2.errors, []);
  } finally {
    for (const w of browsers) await w.stop();
  }
});
