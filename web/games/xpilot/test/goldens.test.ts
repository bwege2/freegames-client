// The XPilot oracle goldens (re/xpilot/oracle/) are whole and consistent, and readable by the ports:
// every file as listed in goldens.txt; the per-tick hashes in frames.txt are those of the world and
// packet lines; every line is written exactly as golden.ts writes the values it holds (so a port can
// hash its own state); the raw stream and the decoded packets are the same datagrams; the draw
// index hashes are those of the committed frames; every packet is transport or maps onto its schema
// message (SCHEMA_MAP); randomMT and rfrac are reproduced, and the agreement
// of JS Math with glibc's libm is reported.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  CLIENT_GOLDENS, DERIVED, MAP_DATA_FIELDS, RELIABLE_ALIAS, RandomMT, SCHEMA_MAP, SERVER_GOLDENS, SETUP_FIELDS, SchemaMapper,
  TRANSPORT, doubleToBits, encodeMapData, fnv64, fnvHex, fnvInit, fnvUpdate, formatValue, packMsg, readDraw, readDrawIndex,
  readFrames, readGz, readMath, readPackets, readSchema, readScenario, readStream, readWorld, scenarioNames, unpackMsg, type Pkt,
} from './golden.ts';

function listed(dir: string): void {
  const entries = readFileSync(join(dir, 'goldens.txt'), 'utf8').trim().split('\n').map((l) => l.split(' '));
  const seen = new Set<string>();
  for (const [rel, size, sha] of entries) {
    const p = join(dir, rel);
    assert.ok(existsSync(p), `${rel} exists`);
    assert.equal(statSync(p).size, Number(size), `${rel} size`);
    const content = rel.endsWith('.gz') ? readGz(p) : readFileSync(p);
    assert.equal(createHash('sha256').update(content).digest('hex'), sha, `${rel} sha256`);
    seen.add(rel);
  }
  const walk = (d: string, pre: string): string[] =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name), `${pre}${e.name}/`) : [`${pre}${e.name}`]));
  for (const f of walk(dir, '')) if (f !== 'goldens.txt' && !f.endsWith('.gitattributes')) assert.ok(seen.has(f), `${f} is listed in goldens.txt`);
}

test('server goldens: every file as listed in goldens.txt', () => listed(SERVER_GOLDENS));
test('client goldens: every file as listed in goldens.txt', () => listed(CLIENT_GOLDENS));

const names = scenarioNames();
test('the scenarios', () => {
  for (const n of ['asteroids', 'ball', 'cannons', 'duel', 'race', 'robots', 'set', 'targets', 'wormholes']) assert.ok(names.includes(n), n);
});

const KNOWN = /^(PKT_[A-Z_]+|SETUP|ENTER_QUEUE_pack|ENTER_GAME_pack|CONTACT_pack|REPORT_STATUS_pack|contact_reply|contact_request)$/;

// A Frame keeps the order within each kind, not across kinds. Every recorded frame is in Frame's
// field order, but within Frame_shots (object by object) and Frame_ships (player by player). There
// the client's handlers (client.c Handle_*) each append to their own kind's array only (Handle_ship
// also sets the eyes and adds a radar blip, which no other kind of its group touches), so a client
// that handles Frame's members in field order ends up as the original's did.
const FRAME_ORDER = readSchema().get('Frame')!.map((f) => f.name);
const INDEPENDENT = [
  ['wreckages', 'asteroids', 'missiles', 'balls', 'mines', 'items', 'lasers'],
  ['ecms', 'trans', 'connectors', 'paused', 'appearing', 'ships', 'refuels'],
];

for (const name of names) {
  const scn = readScenario(name);
  const frames = readFrames(name);

  test(`${name}: frames.txt has one line per tick`, () => {
    assert.equal(frames.length, scn.frames);
    frames.forEach((f, i) => {
      assert.equal(f.tick, i + 1);
      assert.equal(f.clients.length, scn.clients.length);
    });
  });

  test(`${name}: world dumps hash to frames.txt and are written as golden.ts writes them`, () => {
    const world = readWorld(name);
    const last = scn.frames;
    for (let t = 1; t <= last; t++) assert.equal(world.has(t), t <= 250 || t % 25 === 0 || t === last, `tick ${t} dumped`);
    for (const [t, ls] of world) {
      let h = fnvInit();
      for (const l of ls) {
        h = fnvUpdate(h, l);
        const r = JSON.parse(l.toString('latin1'));
        assert.equal(formatValue(r) + '\n', l.toString('latin1'), `tick ${t}: written back`);
      }
      assert.equal(fnvHex(h), frames[t - 1].world, `tick ${t} hash`);
      const tick = JSON.parse(ls[0].toString('latin1'));
      assert.equal(tick.k, 'tick');
      assert.equal(tick.ObjCount, frames[t - 1].objCount);
      assert.equal(tick.rng, frames[t - 1].rng);
      assert.equal(ls.filter((l) => l.includes('"k":"pl"')).length, tick.NumPlayers + tick.NumSpectators);
    }
  });

  test(`${name}: packet lines hash to frames.txt, decode fully, and match the raw stream`, () => {
    const packets = readPackets(name);
    const stream = readStream(name);
    assert.equal(stream.length, packets.length, 'one decoded line per datagram');
    const hashes = new Map<string, ReturnType<typeof fnvInit>>();
    packets.forEach(({ raw, d }, i) => {
      assert.equal(formatValue(d) + '\n', raw.toString('latin1'), `line ${i + 1} written back`);
      const s = stream[i];
      assert.equal(s.tick, d.t);
      assert.equal(s.dir, d.dir === 's2c' ? 0 : d.dir === 'c2s' ? 1 : 2);
      assert.equal(s.data.length, d.len);
      if (d.dir === 'meta') return;
      const nick = (d.dir === 's2c' ? d.to : d.from)!;
      assert.equal(s.client, scn.clients.indexOf(nick));
      const key = `${d.t} ${nick}`;
      hashes.set(key, fnvUpdate(hashes.get(key) ?? fnvInit(), raw));
      for (const p of [...(d.pkts ?? []), ...(d.rel ?? [])] as Pkt[]) {
        assert.match(p.pkt, KNOWN, `line ${i + 1}: ${p.pkt}`);
        assert.ok(!('unparsed' in p) && !('truncated' in p), `line ${i + 1}: ${p.pkt} decoded`);
      }
    });
    for (const f of frames)
      scn.clients.forEach((nick, k) => {
        const h = hashes.get(`${f.tick} ${nick}`);
        assert.equal(h ? fnvHex(h) : 'cbf29ce484222325', f.clients[k], `tick ${f.tick} ${nick}`);
      });
  });

  // Each recorded packet is either transport or becomes its schema message: the message is built
  // with the generated bindings (a field the schema does not have throws), packed, unpacked and read
  // back field by field, and must come back equal (so it fills every field the schema has, with
  // values in the field's range).
  test(`${name}: every recorded packet maps onto protocol/games/xpilot.capnp or is transport`, () => {
    const mappers = new Map<string, SchemaMapper>();
    let n = 0;
    for (const { d } of readPackets(name)) {
      const nick = d.dir === 'meta' ? '' : (d.dir === 's2c' ? d.to : d.from)!;
      const pk = (d.pkts ?? []).filter((p) => p.pkt !== 'PKT_RELIABLE');
      if (d.dir === 's2c' && pk[0]?.pkt === 'PKT_START')
        for (let i = 1; i < pk.length; i++) {
          const a = SCHEMA_MAP[pk[i - 1].pkt].member, b = SCHEMA_MAP[pk[i].pkt].member;
          if (FRAME_ORDER.indexOf(b) < FRAME_ORDER.indexOf(a))
            assert.ok(INDEPENDENT.some((g) => g.includes(a) && g.includes(b)), `tick ${d.t} ${nick}: ${a} before ${b}`);
        }
      if (!mappers.has(nick)) mappers.set(nick, new SchemaMapper());
      for (const m of mappers.get(nick)!.messages(d)) {
        assert.deepEqual(unpackMsg(packMsg(m)), m, `${name} tick ${d.t} ${d.dir} ${nick}`);
        if (m.which === 'setup')
          assert.equal(encodeMapData(m.setup), d.rel!.find((p) => p.pkt === 'SETUP')!.map_data, 'the map data, parsed and written back');
        n++;
      }
    }
    assert.ok(n > 0);
    for (const mp of mappers.values()) for (const k of mp.transport.keys()) assert.ok(k in TRANSPORT, k);
  });
  for (const nick of scn.drawing) {
    test(`${name}: ${nick}'s draw index hashes are those of the committed frames`, () => {
      const index = readDrawIndex(name, nick);
      const draw = readDraw(name, nick);
      assert.ok(index.length > 0);
      assert.deepEqual([...draw.keys()], index.filter((i) => i.committed).map((i) => i.section), 'committed sections');
      for (const i of index) {
        if (!i.committed) continue;
        const calls = draw.get(i.section)!.filter((l) => l[0] !== 0x23);
        let n = 0;
        let h = fnvInit();
        for (const l of calls) {
          h = fnvUpdate(h, l);
          const fold = /^XDrawPoint\* n=(\d+) /.exec(l.toString('latin1'));
          n += fold ? Number(fold[1]) : 1;
        }
        assert.equal(fnvHex(h), i.committed, `${i.section} hash`);
        assert.equal(n, i.calls, `${i.section} calls`);
        if (n === calls.length) assert.equal(i.committed, i.hash, `${i.section}: nothing folded`);
      }
    });
  }
}

// The mapping itself: every member of Frame, ClientPacket and Reliable has one recorded packet, which
// fills all of its struct's fields; Setup is the setup header and its map data; and the recorded field
// names are those re/xpilot/oracle/server/decode.c writes (also for packets no scenario has).
test('SCHEMA_MAP covers protocol/games/xpilot.capnp', (t) => {
  const s = readSchema();
  const unionOf = { frame: 'Frame', client: 'ClientPacket', reliable: 'Reliable' } as const;
  const targets = new Set<string>();
  for (const [pkt, m] of Object.entries(SCHEMA_MAP)) {
    const union = unionOf[m.to];
    const f = s.get(union)!.find((g) => g.name === m.member);
    assert.ok(f, `${pkt}: ${union}.${m.member} exists`);
    assert.ok(!targets.has(`${union}.${m.member}`), `${union}.${m.member}: one packet`);
    targets.add(`${union}.${m.member}`);
    const list = /^List\((\w+)\)$/.exec(f.type);
    assert.equal(m.to === 'frame' && m.list, !!list, `${pkt}: list or single`);
    assert.equal(list ? list[1] : f.type, m.struct ?? 'Void', `${pkt}: struct`);
    if (!m.struct) continue;
    assert.deepEqual([...m.schema].sort(), s.get(m.struct)!.map((g) => g.name).sort(), `${pkt}: all of ${m.struct}`);
    for (const to of Object.values(m.fields)) for (const x of to.split(',')) assert.ok(m.schema.includes(x), `${pkt}: ${x}`);
  }
  for (const u of Object.values(unionOf))
    for (const g of s.get(u)!) if (`${u}.${g.name}` !== 'Frame.packetSize') assert.ok(targets.has(`${u}.${g.name}`), `${u}.${g.name} has a packet`);
  assert.deepEqual([...Object.values(SETUP_FIELDS), ...MAP_DATA_FIELDS].sort(), s.get('Setup')!.map((g) => g.name).sort(), 'Setup');

  const src = readFileSync(join(import.meta.dirname, '..', '..', '..', '..', 're', 'xpilot', 'oracle', 'server', 'decode.c'), 'utf8');
  let checked = 0;
  for (const fn of ['s2c_fmt', 'rel_fmt', 'c2s_fmt']) {
    const at = src.indexOf(`*${fn}(`);
    const body = src.slice(at, src.indexOf('\n}\n', at));
    for (const c of body.matchAll(/((?:case\s+PKT_\w+\s*:\s*)+)return\s+([^;]*);/g)) {
      const lit = /^(?:\([^)]*\)\s*\?\s*)?((?:"[^"]*"\s*)+)/.exec(c[2]);
      assert.ok(lit, c[0]);
      const names = [...lit[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]).join('').split(' ').filter(Boolean).map((x) => x.split(':')[0]);
      for (const label of c[1].match(/PKT_\w+/g)!) {
        const key = fn === 'c2s_fmt' ? label : (RELIABLE_ALIAS[label] ?? label);
        if (key in TRANSPORT) continue;
        const m = SCHEMA_MAP[key];
        assert.ok(m, `${fn} ${label} is mapped`);
        assert.deepEqual([...Object.keys(m.fields), ...(DERIVED[key] ?? [])].sort(), names.sort(), `${fn} ${label}: recorded fields`);
        checked++;
      }
    }
  }
  t.diagnostic(`${checked} packet formats of decode.c checked against SCHEMA_MAP`);
  assert.ok(checked > 60);
});

test('randomMT and rfrac as the original', () => {
  const { mt, rfrac } = readMath();
  for (const [seed, values] of mt) {
    const g = new RandomMT();
    if (seed !== '-') g.seed(Number(seed));
    const max = Math.max(...values.keys());
    for (let i = 0; i <= max; i++) {
      const v = g.random();
      if (values.has(i)) assert.equal(v, values.get(i), `seed ${seed} #${i}`);
    }
  }
  assert.deepEqual([...mt.get('2')!.entries()], [...mt.get('3')!.entries()], 'seedMT(n) = seedMT(n | 1)');
  const g = new RandomMT();
  rfrac.forEach((r, i) => assert.equal(doubleToBits(g.rfrac()), doubleToBits(r), `rfrac #${i}`));
});

// JS Math against glibc (the oracles' libm). Reported, not required: the ports use the recorded
// tables or exact formulations where these differ (see re/xpilot/oracle/README.md).
test('JS Math against the libm values the original uses', (t) => {
  const { tblSin, tblCos, fns } = readMath();
  const rint = (x: number) => {
    const f = Math.floor(x), d = x - f;
    const r = d < 0.5 ? f : d > 0.5 ? f + 1 : f % 2 === 0 ? f : f + 1;
    return r === 0 && (x < 0 || Object.is(x, -0)) ? -0 : r; // rint keeps the sign of zero
  };
  const findDir = (x: number, y: number) => {
    let a = x !== 0 || y !== 0 ? Math.atan2(y, x) / (2 * Math.PI) : 0;
    if (a < 0) a++;
    return a * 128;
  };
  const js: Record<string, (a: number[]) => number> = {
    sin: ([x]) => Math.sin(x), cos: ([x]) => Math.cos(x), atan2: ([y, x]) => Math.atan2(y, x), pow: ([x, y]) => Math.pow(x, y),
    hypot: ([x, y]) => Math.hypot(x, y), sqrt: ([x]) => Math.sqrt(x), floor: ([x]) => Math.floor(x), rint: ([x]) => rint(x),
    findDir: ([x, y]) => findDir(x, y),
  };
  const report = (fn: string, pairs: [number, number][]) => {
    const off = pairs.filter(([a, b]) => doubleToBits(a) !== doubleToBits(b)).length;
    t.diagnostic(`${fn}: ${pairs.length - off}/${pairs.length} equal`);
    return off;
  };
  report('tbl_sin = Math.sin(i * (2 * PI / 128))', tblSin.map((v, i) => [v, Math.sin(i * ((2.0 * Math.PI) / 128))]));
  report('tbl_cos = Math.cos(i * (2 * PI / 128))', tblCos.map((v, i) => [v, Math.cos(i * ((2.0 * Math.PI) / 128))]));
  const by = new Map<string, [number, number][]>();
  for (const f of fns) {
    if (!by.has(f.fn)) by.set(f.fn, []);
    by.get(f.fn)!.push([f.result, js[f.fn](f.args)]);
  }
  for (const [fn, pairs] of by) {
    const off = report(fn, pairs);
    if (fn === 'sqrt' || fn === 'floor' || fn === 'rint') assert.equal(off, 0, `${fn} is exact in IEEE arithmetic`);
  }
  assert.equal(fnv64(Buffer.from('a')), 'af63dc4c8601ec8c', 'FNV-1a 64 of "a"');
});
