// The ninja's dash in the client's prediction (not the original's netcode: game/ninja.ts, the server's FireNinja and
// its snapshot item NETOBJTYPE_FG_NINJA), against what this repository's server sent: the fixture ninja.fixture.json
// is a client's view of a room in which its tee had the ninja, dashed twice and pressed fire once in the reload
// (written by the server's NinjaTest.java: every input the client sent, every snapshot it got, one a tick). For every
// snapshot T and every later snapshot T+k (k <= 10) the client's OnPredict from T, with the inputs it sent, must give
// the tee of the server's snapshot of T+k, every field of CNetObj_CharacterCore; without the ninja item (the
// original's prediction, which knows no dash) the dash ticks differ, by up to the whole dash.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as P from '../src/generated/protocol.ts';
import { defaultConfig } from '../src/generated/config.ts';
import { CDataFileReader } from '../src/engine/shared/datafile.ts';
import { CGameClient, type CEngineParts } from '../src/client/game/gameclient.ts';
import { CConsole } from '../src/client/engine/console.ts';
import { CNinja, NETOBJTYPE_FG_NINJA } from '../src/game/ninja.ts';

const FIXTURE = JSON.parse(readFileSync(fileURLToPath(new URL('./ninja.fixture.json', import.meta.url)), 'utf8')) as {
  map: string; own: number; inputs: number[][]; snaps: [number, [number, number, number[]][]][];
};
const MAP = fileURLToPath(new URL(`../assets/maps/${FIXTURE.map}.map`, import.meta.url));
const CORE_FIELDS = ['m_X', 'm_Y', 'm_VelX', 'm_VelY', 'm_Angle', 'm_Direction', 'm_Jumped', 'm_HookedPlayer', 'm_HookState', 'm_HookTick', 'm_HookX', 'm_HookY', 'm_HookDx', 'm_HookDy'] as const;
const K_MAX = 10;

async function client(ticks: { game: number; pred: number }, inputs: Map<number, Int32Array>): Promise<CGameClient> {
  const config = defaultConfig();
  const cl = {
    GameTick: () => ticks.game,
    PredGameTick: () => ticks.pred,
    // CClient::GetInput: the newest input meant for this tick or before
    GetInput: (Tick: number) => {
      let best = -1;
      for (const t of inputs.keys()) if (t <= Tick && t > best) best = t;
      return best >= 0 ? inputs.get(best)! : null;
    },
  };
  const gc = new CGameClient({ client: cl, config, console: new CConsole(0, config) } as unknown as CEngineParts);
  const df = await CDataFileReader.open(new Uint8Array(readFileSync(MAP)));
  assert.ok(df && df.loadMap(), 'the map loads');
  gc.Layers().Init(df!);
  gc.Collision().Init(gc.Layers());
  (gc as unknown as { ProcessTriggeredEvents: () => void }).ProcessTriggeredEvents = () => {};
  return gc;
}

function evolve(gc: CGameClient, c: P.CNetObj_Character, Tick: number): P.CNetObj_Character {
  const o = { ...c };
  if (o.m_Tick) (gc as unknown as { EvolveCharacter(c: P.CNetObj_Character, t: number): void }).EvolveCharacter(o, Tick);
  return o;
}

async function run(withNinja: boolean): Promise<{ compared: number; differ: number; worst: number; dash: number; first: string }> {
  const inputs = new Map<number, Int32Array>();
  for (const r of FIXTURE.inputs) {
    // every input came in before its tick (the room's clients send two ticks ahead)
    assert.ok(r[1] < r[0]);
    inputs.set(r[0], Int32Array.from(r.slice(2)));
  }
  const ticks = { game: 0, pred: 0 };
  const gc = await client(ticks, inputs);
  const own = FIXTURE.own;
  const byTick = new Map(FIXTURE.snaps.map((s) => [s[0], s[1]]));
  const me = (items: [number, number, number[]][], tick: number) => {
    const c = items.find((i) => i[0] === P.NETOBJTYPE_CHARACTER && i[1] === own);
    return c ? evolve(gc, P.read_CNetObj_Character(Int32Array.from(c[2])), tick) : null;
  };
  let compared = 0, differ = 0, worst = 0, dash = 0, first = '';
  for (const [tick, items] of FIXTURE.snaps) {
    const me0 = me(items, tick);
    if (!me0) continue;
    const ninja = items.find((i) => i[0] === NETOBJTYPE_FG_NINJA && i[1] === own);
    for (let k = 1; k <= K_MAX; k++) {
      const s1 = byTick.get(tick + k);
      if (!s1) continue;
      const me1 = me(s1, tick + k);
      if (!me1) break;
      dash = Math.max(dash, Math.hypot(me1.m_X - me0.m_X, me1.m_Y - me0.m_Y));
      ticks.game = tick;
      ticks.pred = tick + k;
      gc.m_LocalClientID = own;
      const S = gc.m_Snap;
      for (const c of S.m_aCharacters) c.m_Active = false;
      S.m_aCharacters[own].m_Active = true;
      S.m_aCharacters[own].m_Cur = { ...me0 };
      S.m_pGameData = null;
      S.m_pLocalNinja = withNinja && ninja ? CNinja.read(Int32Array.from(ninja[2])) : null;
      gc.OnPredict();
      const got: Record<string, number> = {};
      gc.m_PredictedChar.Write(got as unknown as P.CNetObj_CharacterCore);
      compared++;
      const bad = CORE_FIELDS.filter((f) => got[f] !== me1[f]);
      if (bad.length) {
        differ++;
        worst = Math.max(worst, Math.hypot(got.m_X - me1.m_X, got.m_Y - me1.m_Y));
        if (!first) first = `ticks ${tick}->${tick + k}: ${bad.map((f) => `${f} ${got[f]} != ${me1[f]}`).join(', ')}`;
      }
    }
  }
  return { compared, differ, worst, dash, first };
}

test('the ninja\'s dash: the client\'s prediction of its tee is the server\'s tee, k ticks later, through two dashes and a press in the reload', async (t) => {
  const r = await run(true);
  t.diagnostic(`${r.compared} predictions compared (k up to ${K_MAX}); the tee moved up to ${r.dash.toFixed(0)} units in ${K_MAX} ticks`);
  assert.ok(r.compared >= 1000, `${r.compared} pairs`);
  assert.ok(r.dash >= 300, `the tee dashed: ${r.dash.toFixed(0)} units`);
  assert.equal(r.differ, 0, `${r.differ} of ${r.compared} predictions differ; first: ${r.first}`);
});

test('without the ninja\'s state (the original\'s prediction, which knows no dash) the dash is mispredicted', async (t) => {
  const r = await run(false);
  t.diagnostic(`${r.differ} of ${r.compared} predictions differ, by up to ${r.worst.toFixed(0)} units: the jump the tee made on the screen`);
  assert.ok(r.differ >= r.compared / 10 && r.worst >= 200, `${r.differ} of ${r.compared}, ${r.worst.toFixed(0)} units`);
});
