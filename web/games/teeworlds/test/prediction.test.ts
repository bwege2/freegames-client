// The client's prediction (CGameClient::OnPredict: the local tee from the snapshot of tick T, moved on with the
// inputs the client sent for T+1..T+k) against the server oracle: for every scenario and every client, every
// snapshot T of the client's own tee (Sv_ClientInfo m_Local of its connection) and every later snapshot T+k
// (k <= 10) of the same life, the predicted tee must be the tee of the server's snapshot of T+k (both evolved to
// their tick as the client does it, CGameClient::EvolveCharacter), every field of CNetObj_CharacterCore.
//
// The rule (when the original's prediction is exact): the server moved the tee with the same inputs and nothing
// but the map acted on it. A pair (T, T+k) is compared when
//   * the input in force at every tick of T+1..T+k (the newest the client sent for that tick or before, as
//     CClient::GetInput picks it and as the server's tee keeps its last input) reached the server before its
//     tick (CServer moves a late input to the next tick: the server's tee then ran with another input),
//   * that input does not aim at 0,0 (CCharacter::OnPredictedInput: "it is not allowed to aim in the center",
//     the server's tee aims at 0,-1; the client's prediction does not do that),
//   * the tee was not just spawned (its snapshot at T has no reckoning tick: it runs without input until the
//     next input),
//   * no other tee was within 500 units of it at T or T+k (others are predicted without their input: their
//     hooks, which reach 380 units, and the tee collisions are guesses),
//   * its health and armor are unchanged, no explosion or hammer hit happened within 500 units in T+1..T+k
//     and the client did not change its fire button (the server's weapons push tees; the client does not
//     predict them),
//   * the game was not paused, over or counting down (OnPredict takes the snapshot's tee as it is when paused
//     or over; in the countdown the server's world stands still).
// Each map is apart (a map change starts the server's ticks anew; a client's connection starts with one).
// Mutation checks: the test below feeds the inputs one tick late (GetInput(Tick - 1)) and needs at least a tenth
// of the predictions to differ; removing the Quantize() of OnPredict makes 50-75% of them differ in every
// scenario (checked by hand).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadScenario, scenarios, hex, officialMaps } from './golden.ts';
import { NET_PACKETFLAG_CONTROL, NET_PACKETFLAG_COMPRESSION, CNetChunkHeader } from '../src/engine/shared/network.ts';
import { huffman } from '../src/engine/shared/huffman.ts';
import { CUnpacker } from '../src/engine/shared/packer.ts';
import { NETMSG_INPUT } from '../src/engine/shared/protocol.ts';
import * as P from '../src/generated/protocol.ts';
import { defaultConfig } from '../src/generated/config.ts';
import { CMapStore } from '../src/client/engine/map.ts';
import { CGameClient, type CEngineParts } from '../src/client/game/gameclient.ts';
import { CConsole } from '../src/client/engine/console.ts';

const NETOBJTYPE_CHARACTER = 10, NETOBJTYPE_SPECTATORINFO = 12, NETOBJTYPE_GAMEDATA = 6, NETOBJTYPE_EXPLOSION = 17, NETOBJTYPE_HAMMERHIT = 19;
const K_MAX = 10, NEAR = 500;

/** the chunks of a datagram (either way), each as an unpacker at its message id */
function chunksOf(d: Uint8Array): CUnpacker[] {
  const flags = (d[0] & 0xfc) >> 2;
  if (flags & NET_PACKETFLAG_CONTROL) return [];
  let data = d.subarray(7);
  if (flags & NET_PACKETFLAG_COMPRESSION) {
    const out = new Uint8Array(2048);
    const n = huffman.Decompress(d, 7, d.length - 7, out, out.length);
    data = out.subarray(0, n);
  }
  const res: CUnpacker[] = [];
  const h = new CNetChunkHeader();
  let p = 0;
  for (let i = 0; i < d[2] && p < data.length; i++) {
    p = h.Unpack(data, p);
    const u = new CUnpacker();
    u.Reset(data, p, h.m_Size);
    res.push(u);
    p += h.m_Size;
  }
  return res;
}

/** the inputs (NETMSG_INPUT) in a client's datagram: the tick each is meant for and its ints */
function inputsOf(d: Uint8Array): { tick: number; data: Int32Array }[] {
  const res: { tick: number; data: Int32Array }[] = [];
  for (const u of chunksOf(d)) {
    const Msg = u.GetInt();
    if (!(Msg & 1) || Msg >> 1 !== NETMSG_INPUT) continue;
    u.GetInt(); // ack
    const tick = u.GetInt(), size = u.GetInt();
    const ints = new Int32Array(size / 4);
    for (let j = 0; j < ints.length; j++) ints[j] = u.GetInt();
    if (!u.Error()) res.push({ tick, data: ints });
  }
  return res;
}

/** the client id the server tells a client is its own (Sv_ClientInfo with m_Local) */
function localIdOf(d: Uint8Array): number {
  const h = new P.CNetObjHandler();
  for (const u of chunksOf(d)) {
    const Msg = u.GetInt();
    if (Msg & 1 || Msg >> 1 !== P.NETMSGTYPE_SV_CLIENTINFO) continue;
    const m = h.SecureUnpackMsg(P.NETMSGTYPE_SV_CLIENTINFO, u) as P.CNetMsg_Sv_ClientInfo | null;
    if (m && m.m_Local) return m.m_ClientID;
  }
  return -1;
}

interface Snap { tick: number; items: [number, number, number[]][] }

const maps = officialMaps();

/** a game client without a window: only what OnPredict and EvolveCharacter use */
function headless(map: Awaited<ReturnType<CMapStore['load']>>, inputs: Map<number, Int32Array>, ticks: { game: number; pred: number }, late: boolean): CGameClient {
  const config = defaultConfig();
  const client = {
    GameTick: () => ticks.game,
    PredGameTick: () => ticks.pred,
    GetInput: (Tick: number) => {
      // CClient::GetInput: the newest input meant for this tick or before
      let best = -1;
      for (const t of inputs.keys()) if (t <= (late ? Tick - 1 : Tick) && t > best) best = t;
      return best >= 0 ? inputs.get(best)! : null;
    },
  };
  const gc = new CGameClient({ client, config, console: new CConsole(0, config) } as unknown as CEngineParts);
  gc.Layers().Init(map!);
  gc.Collision().Init(gc.Layers());
  // events of the predicted tee are effects and sounds: none here
  (gc as unknown as { ProcessTriggeredEvents: () => void }).ProcessTriggeredEvents = () => {};
  return gc;
}

function evolve(gc: CGameClient, c: P.CNetObj_Character, Tick: number): P.CNetObj_Character {
  const o = { ...c };
  if (o.m_Tick) (gc as unknown as { EvolveCharacter(c: P.CNetObj_Character, t: number): void }).EvolveCharacter(o, Tick);
  return o;
}

const CORE_FIELDS = ['m_X', 'm_Y', 'm_VelX', 'm_VelY', 'm_Angle', 'm_Direction', 'm_Jumped', 'm_HookedPlayer', 'm_HookState', 'm_HookTick', 'm_HookX', 'm_HookY', 'm_HookDx', 'm_HookDy'] as const;

async function run(name: string, late: boolean): Promise<{ compared: number; differ: number; firstDiff: string }> {
  const sc = loadScenario(name);
  let compared = 0, differ = 0, firstDiff = '';
  for (const k of sc.clients) {
    // the client's inputs and when the server got them (iteration numbers keep the maps apart: a new map
    // starts the server's ticks again)
    const sent: { it: number; tick: number; data: Int32Array; at: number }[] = [];
    for (const it of sc.iterations)
      for (const [c, h] of it.c2s) if (c === k) for (const inp of inputsOf(hex(h))) sent.push({ it: it.it, tick: inp.tick, data: inp.data, at: it.tick });
    const locals: { it: number; id: number }[] = [];
    for (const it of sc.iterations)
      for (const [c, h] of it.s2c) {
        if (c !== k) continue;
        const id = localIdOf(hex(h));
        if (id >= 0) locals.push({ it: it.it, id });
      }
    // the client's snapshots, per map
    let store: CMapStore | null = null, mapName = '', mapCrc = 0, fromIt = 0;
    const snaps: Snap[] = [];
    const flush = async (toIt: number): Promise<void> => {
      if (!snaps.length || !mapName) return;
      const inputs = new Map<number, Int32Array>();
      const arrival = new Map<number, number>();
      for (const x of sent) {
        if (x.it < fromIt || x.it >= toIt) continue;
        inputs.set(x.tick, x.data);
        if (!arrival.has(x.tick)) arrival.set(x.tick, x.at);
      }
      const sorted = [...inputs.keys()].sort((a, b) => a - b);
      const effective = (t: number): number => {
        let lo = 0, hi = sorted.length - 1, r = -1;
        while (lo <= hi) {
          const m = (lo + hi) >> 1;
          if (sorted[m] <= t) { r = sorted[m]; lo = m + 1; } else hi = m - 1;
        }
        return r;
      };
      store ??= new CMapStore();
      for (const m of maps) if (m.name === mapName) await store.add(m.name, m.bytes);
      const map = store.load(mapName, mapCrc);
      assert.ok(map, `map ${mapName}`);
      const ticks = { game: 0, pred: 0 };
      const gc = headless(map, inputs, ticks, late);
      const byTick = new Map(snaps.map((s) => [s.tick, s]));
      // the client's own tee (the last Sv_ClientInfo with m_Local of this connection)
      const ownId = locals.filter((x) => x.it >= fromIt && x.it < toIt).at(-1)?.id ?? -1;
      for (const s of snaps) {
        const own = s.items.filter((i) => i[0] === NETOBJTYPE_CHARACTER && i[2][15] > 0);
        // spectating (SpectatorInfo) or watching another tee: no own tee to predict
        if (own.length !== 1 || own[0][1] !== ownId || s.items.some((i) => i[0] === NETOBJTYPE_SPECTATORINFO)) continue;
        const id = ownId;
        const chars = (sn: Snap) => sn.items.filter((i) => i[0] === NETOBJTYPE_CHARACTER).map((i) => ({ id: i[1], c: P.read_CNetObj_Character(Int32Array.from(i[2])) }));
        const paused = (sn: Snap) => sn.items.some((i) => i[0] === NETOBJTYPE_GAMEDATA && i[2][1] & (P.GAMESTATEFLAG_PAUSED | P.GAMESTATEFLAG_ROUNDOVER | P.GAMESTATEFLAG_GAMEOVER | P.GAMESTATEFLAG_STARTCOUNTDOWN));
        const cs0 = chars(s).map((x) => ({ id: x.id, c: evolve(gc, x.c, s.tick) }));
        const me0 = cs0.find((x) => x.id === id)!.c;
        for (let kk = 1; kk <= K_MAX; kk++) {
          const s1 = byTick.get(s.tick + kk);
          if (!s1) continue;
          const cs1 = chars(s1).map((x) => ({ id: x.id, c: evolve(gc, x.c, s1.tick) }));
          const me1 = cs1.find((x) => x.id === id)?.c;
          if (!me1 || me1.m_Health <= 0) break;
          // the rule
          let clean = me0.m_Tick !== 0 && !paused(s) && !paused(s1) && me1.m_Health === me0.m_Health && me1.m_Armor === me0.m_Armor;
          for (let t = s.tick + 1; t <= s1.tick && clean; t++) {
            // the input in force at t: the newest meant for t or before, which must have come in time
            const e = effective(t), e0 = effective(t - 1);
            if (e < 0 || arrival.get(e)! >= e) clean = false;
            // CCharacter::OnPredictedInput: "it is not allowed to aim in the center" (the server's tee aims at 0,-1)
            else if (inputs.get(e)![1] === 0 && inputs.get(e)![2] === 0) clean = false;
            // a tee spawned in T..T+k runs without input until the next input comes
            else if (e0 >= 0 && inputs.get(e)![4] !== inputs.get(e0)![4]) clean = false; // m_Fire
          }
          const near = (cs: { id: number; c: P.CNetObj_Character }[], me: P.CNetObj_Character) => cs.some((x) => x.id !== id && Math.hypot(x.c.m_X - me.m_X, x.c.m_Y - me.m_Y) < NEAR);
          if (near(cs0, me0) || near(cs1, me1)) clean = false;
          for (let t = s.tick + 1; t <= s1.tick && clean; t++) {
            const sn = byTick.get(t);
            if (sn?.items.some((i) => (i[0] === NETOBJTYPE_EXPLOSION || i[0] === NETOBJTYPE_HAMMERHIT) && Math.hypot(i[2][0] - me1.m_X, i[2][1] - me1.m_Y) < NEAR)) clean = false;
          }
          if (!clean) continue;
          // CGameClient::OnPredict from the snapshot of T
          ticks.game = s.tick;
          ticks.pred = s1.tick;
          gc.m_LocalClientID = id;
          const S = gc.m_Snap;
          for (let i = 0; i < S.m_aCharacters.length; i++) S.m_aCharacters[i].m_Active = false;
          for (const x of cs0) {
            S.m_aCharacters[x.id].m_Active = true;
            S.m_aCharacters[x.id].m_Cur = { ...x.c };
          }
          S.m_pGameData = null;
          gc.OnPredict();
          const got: Record<string, number> = {};
          gc.m_PredictedChar.Write(got as unknown as P.CNetObj_CharacterCore);
          compared++;
          const bad = CORE_FIELDS.filter((f) => got[f] !== me1[f]);
          if (bad.length) {
            differ++;
            if (!firstDiff) firstDiff = `client ${k} tee ${id} ticks ${s.tick}->${s1.tick}: ${bad.map((f) => `${f} ${got[f]} != ${me1[f]}`).join(', ')}`;
          }
        }
      }
    };
    for (const r of sc.snaps) {
      if (r.c !== k) continue;
      if (r.sys === 'map_change') {
        await flush(r.it as number);
        snaps.length = 0;
        fromIt = r.it as number;
        mapName = r.map as string;
        mapCrc = r.crc as number;
      } else if (typeof r.snap === 'number') snaps.push({ tick: r.snap, items: r.items as Snap['items'] });
    }
    await flush(Infinity);
  }
  return { compared, differ, firstDiff };
}

for (const name of scenarios()) {
  test(`${name}: the client's prediction of its tee is the server's tee, k ticks later`, async (t) => {
    const r = await run(name, false);
    t.diagnostic(`${r.compared} predictions compared`);
    assert.ok(r.compared >= 200, `only ${r.compared} pairs fit the rule`);
    assert.equal(r.differ, 0, `${r.differ} of ${r.compared} predictions differ; first: ${r.firstDiff}`);
  });
}

test('mutation: inputs fed one tick late make the prediction differ', async (t) => {
  const name = scenarios().includes('dm') ? 'dm' : scenarios()[0];
  if (!name) return;
  const r = await run(name, true);
  t.diagnostic(`${name}: ${r.differ} of ${r.compared} predictions differ`);
  assert.ok(r.differ >= r.compared / 10, `only ${r.differ} of ${r.compared} differ`);
});
