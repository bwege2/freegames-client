// protocol/games/xpilot.capnp through the generated TypeScript: a frame with several object kinds, a
// setup, a client datagram and the reliable data survive packing, and the key bitmap has the
// original's bit layout (KEYBOARD_SIZE bytes, key k at byte k/8, bit k%8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as $ from 'capnp-es';
import { packGame, unpackGame } from '../../../src/sdk/index.ts';
import { ClientPacket, ClientPacket_Which, Msg, Msg_Which, Reliable, Reliable_Which } from '../src/proto/xpilot.ts';

const KEY_SHIELD = 5;
const KEY_THRUST = 30;
const NUM_KEYS = 72;

test('a frame keeps its packets and their order within each kind', () => {
  const data = packGame(Msg, (m) => {
    const f = m._initFrame();
    const start = f._initStart();
    start.frameLoops = 1234;
    start.lastKeyChange = 17;
    const self = f._initSelf();
    self.x = 2922;
    self.y = 192;
    self.vx = -3;
    self.vy = 5;
    self.dir = 32;
    self.power = 55;
    self.lockId = -1;
    self.fuelSum = 650;
    self.fuelMax = 2600;
    self.viewWidth = 766;
    self.viewHeight = 768;
    self.debrisColors = 4;
    self.status = 1;
    const items = f._initSelfItems();
    items.itemMask = (1 << 3) | (1 << 14);
    const counts = items._initCounts(2);
    counts.set(0, 2);
    counts.set(1, 1);
    f._initModifiers().mods = 'NC V2';
    const ships = f._initShips(2);
    ships.get(0).x = 2922;
    ships.get(0).id = 1;
    ships.get(0).dir = 32;
    ships.get(0).flags = 1;
    ships.get(1).x = 100;
    ships.get(1).id = 2;
    ships.get(1).flags = 8 | 16;
    const shots = f._initFastshots(1);
    shots.get(0).type = 13;
    const xy = shots.get(0)._initXy(3);
    for (let i = 0; i < 3; i++) {
      xy.get(i).x = 127 + i;
      xy.get(i).y = 255 - i;
    }
    f._initDebris(1).get(0).type = 31;
    const blips = f._initFastradar(1);
    blips.get(0).x = 170;
    blips.get(0).y = 1023;
    blips.get(0).size = 3 | 0x80;
    const ast = f._initAsteroids(1);
    ast.get(0).typeSize = (2 << 4) | 3;
    f._initAudio(1).get(0).type = 82;
    f._initEnd().frameLoops = 1234;
    f.packetSize = 4096;
  });
  const m = unpackGame(Msg, data);
  assert.equal(m.which(), Msg_Which.FRAME);
  const f = m.frame;
  assert.equal(f.start.frameLoops, 1234);
  assert.equal(f.start.lastKeyChange, 17);
  assert.equal(f.self.vx, -3);
  assert.equal(f.self.lockId, -1);
  assert.equal(f.self.viewWidth, 766);
  assert.equal(f.selfItems.itemMask, 0x4008);
  assert.deepEqual([...f.selfItems.counts], [2, 1]);
  assert.equal(f.modifiers.mods, 'NC V2');
  assert.deepEqual([...f.ships].map((s) => [s.x, s.id, s.flags]), [[2922, 1, 1], [100, 2, 24]]);
  assert.deepEqual([...f.fastshots.get(0).xy].map((p) => [p.x, p.y]), [[127, 255], [128, 254], [129, 253]]);
  assert.equal(f.debris.get(0).type, 31);
  assert.deepEqual([f.fastradar.get(0).x, f.fastradar.get(0).y, f.fastradar.get(0).size], [170, 1023, 0x83]);
  assert.equal(f.asteroids.get(0).typeSize, 0x23);
  assert.equal(f.audio.get(0).type, 82);
  assert.equal(f.end.frameLoops, 1234);
  assert.equal(f.packetSize, 4096);
  // packets the original did not send this frame are absent
  assert.equal(f._hasDamaged(), false);
  assert.equal(f._hasTimeLeft(), false);
  assert.equal(f.missiles.length, 0);
});

test('the setup carries the polygon map', () => {
  const data = packGame(Msg, (m) => {
    const s = m._initSetup();
    s.mode = 781;
    s.lives = 3;
    s.width = 3500;
    s.height = 3500;
    s.framesPerSecond = 50;
    s.name = "Polygon Blood's Music v9";
    s.author = 'lots of people';
    s.dataUrl = 'http://xpilot.sourceforge.net/maps/polybloods.xpd';
    const ps = s._initPstyles(1).get(0);
    ps.color = 0x0033aa;
    ps.defedgeId = 0;
    ps.flags = 1;
    const es = s._initEstyles(1).get(0);
    es.width = -1;
    es.color = 0x2244ee;
    s._initBstyles(1).get(0).filename = 'rock4.ppm';
    const poly = s._initPolygons(1).get(0);
    poly.style = 0;
    poly.x = 100;
    poly.y = 3400;
    const edges = poly._initEdges(3);
    [[35, 0], [0, -35], [-20, 10]].forEach(([dx, dy], i) => {
      edges.get(i).dx = dx;
      edges.get(i).dy = dy;
    });
    const ch = poly._initEstyles(1).get(0);
    ch.point = 2;
    ch.style = 0;
    const base = s._initBases(1).get(0);
    base.team = 2;
    base.x = 2922;
    base.y = 192;
    base.dir = 32;
    s._initFuels(1).get(0).x = 17;
    s._initChecks(0);
  });
  const s = unpackGame(Msg, data).setup;
  assert.equal(s.mode, 781);
  assert.equal(s.width, 3500);
  assert.equal(s.framesPerSecond, 50);
  assert.equal(s.dataUrl, 'http://xpilot.sourceforge.net/maps/polybloods.xpd');
  assert.equal(s.pstyles.get(0).color, 0x0033aa);
  assert.equal(s.estyles.get(0).width, -1);
  assert.equal(s.bstyles.get(0).filename, 'rock4.ppm');
  const poly = s.polygons.get(0);
  assert.deepEqual([poly.x, poly.y], [100, 3400]);
  assert.deepEqual([...poly.edges].map((e) => [e.dx, e.dy]), [[35, 0], [0, -35], [-20, 10]]);
  assert.equal(poly.estyles.get(0).point, 2);
  assert.deepEqual([s.bases.get(0).team, s.bases.get(0).dir], [2, 32]);
  assert.equal(s.fuels.get(0).x, 17);
  assert.equal(s.checks.length, 0);
});

test('a setup as large as the largest bundled map fits one message', () => {
  // tourmination.xp2: 1459 polygons, 7240 offsets (at most 344 in one polygon)
  const data = packGame(Msg, (m) => {
    const polys = m._initSetup()._initPolygons(1459);
    for (let i = 0; i < 1459; i++) {
      const p = polys.get(i);
      p.x = (i * 37) % 2800;
      p.y = (i * 91) % 2800;
      const n = i === 0 ? 344 : 5;
      const e = p._initEdges(n);
      for (let j = 0; j < n; j++) {
        e.get(j).dx = 1000 - ((j * 613) % 2000);
        e.get(j).dy = ((j * 271) % 2000) - 1000;
      }
    }
  });
  assert.ok(data.length < 1 << 20, `${data.length} bytes, the transport takes at most 1 MiB`);
});

test('a client datagram: keyboard, pointer, talk and play', () => {
  const data = packGame(Msg, (m) => {
    const list = m._initClient(4);
    const kb = list.get(0)._initKeyboard();
    kb.change = 42;
    const keyv = kb._initKeyv(NUM_KEYS);
    keyv.set(KEY_SHIELD, true);
    keyv.set(KEY_THRUST, true);
    list.get(1)._initPointerMove().movement = -1200;
    const talk = list.get(2)._initTalk();
    talk.seq = 3;
    talk.str = '/team 2';
    list.get(3).play = true;
  });
  const list = unpackGame(Msg, data).client;
  assert.deepEqual([...list].map((p: ClientPacket) => p.which()), [
    ClientPacket_Which.KEYBOARD,
    ClientPacket_Which.POINTER_MOVE,
    ClientPacket_Which.TALK,
    ClientPacket_Which.PLAY,
  ]);
  const kb = list.get(0).keyboard;
  assert.equal(kb.change, 42);
  assert.equal(kb.keyv.length, NUM_KEYS);
  assert.deepEqual([...kb.keyv].flatMap((on, k) => (on ? [k] : [])), [KEY_SHIELD, KEY_THRUST]);
  assert.equal(list.get(1).pointerMove.movement, -1200);
  assert.equal(list.get(2).talk.str, '/team 2');
});

test('the key bitmap is the original bit vector', () => {
  const m = new $.Message();
  const keyv = m.initRoot(Msg)._initClient(1).get(0)._initKeyboard()._initKeyv(NUM_KEYS);
  keyv.set(KEY_SHIELD, true);
  keyv.set(KEY_THRUST, true);
  // netclient.c Send_keyboard sends these 9 bytes for KEY_SHIELD and KEY_THRUST (bit.h BITV_SET)
  const bitv = [0x20, 0, 0, 0x40, 0, 0, 0, 0, 0];
  const raw = [...new Uint8Array(m.toArrayBuffer())];
  const at = raw.findIndex((_, i) => bitv.every((b, j) => raw[i + j] === b));
  assert.ok(at >= 0, 'the list holds the bytes of the original keyboard vector');
});

test('reliable data: reply, player, score, message', () => {
  const data = packGame(Msg, (m) => {
    const list = m._initReliable(4);
    const reply = list.get(0)._initReply();
    reply.replyto = 3;
    reply.result = 102;
    const pl = list.get(1)._initPlayer();
    pl.id = 1;
    pl.team = 2;
    pl.mychar = 32;
    pl.name = 'Alice';
    pl.shape = '(SH:)(EN: -8,0)(MG: 14,0)(LL: -8,8)(RL: -8,-8)(MR: 14,0)';
    pl.himself = 1;
    const sc = list.get(2)._initScore();
    sc.id = 1;
    sc.score = -1250;
    sc.life = 3;
    sc.alliance = 32;
    list.get(3)._initMessage().msg = 'Welcome to "Polygon Blood\'s Music v9", made by "lots of people".';
  });
  const list = unpackGame(Msg, data).reliable;
  assert.deepEqual([...list].map((r: Reliable) => r.which()), [
    Reliable_Which.REPLY,
    Reliable_Which.PLAYER,
    Reliable_Which.SCORE,
    Reliable_Which.MESSAGE,
  ]);
  assert.deepEqual([list.get(0).reply.replyto, list.get(0).reply.result], [3, 102]);
  assert.equal(list.get(1).player.name, 'Alice');
  assert.equal(list.get(1).player.himself, 1);
  assert.equal(list.get(2).score.score, -1250);
  assert.match(list.get(3).message.msg, /^Welcome to/);
});
