// The game core (game/gamecore.cpp, collision.cpp) in TypeScript against the core oracle (re/teeworlds/oracle
// core.cpp: the original's CCharacterCore, CCollision and map loader, linked natively): for seeded random input
// with much hooking and player collisions on official maps, every character's state is the original's, bit for
// bit (positions, velocities and the hook as their float bit patterns), tick by tick. And glibc's powf and atan2f
// on every input the oracle saw them get.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { CDataFileReader } from '../src/engine/shared/datafile.ts';
import { CLayers } from '../src/game/layers.ts';
import { CCollision } from '../src/game/collision.ts';
import { CCharacterCore, CWorldCore } from '../src/game/gamecore.ts';
import { vec2, round_to_int, idiv, atan2f } from '../src/base/vmath.ts';
import { powf } from '../src/base/powf.ts';

const golden = fileURLToPath(new URL('../../../../re/teeworlds/golden/core/', import.meta.url));
const maps = fileURLToPath(new URL('../assets/maps/', import.meta.url));

const buf = new ArrayBuffer(4);
const f32 = new Float32Array(buf);
const u32 = new Uint32Array(buf);
const bits = (x: number): string => {
  f32[0] = x;
  return u32[0].toString(16).padStart(8, '0');
};
const fromBits = (h: string): number => {
  u32[0] = parseInt(h, 16);
  return f32[0];
};

function lines(file: string): unknown[] {
  return gunzipSync(readFileSync(file)).toString('utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

const runs = existsSync(golden) ? readdirSync(golden).filter((f) => f.endsWith('.jsonl.gz') && f !== 'libm.jsonl.gz') : [];

test('glibc powf and atan2f: the port gives the original\'s result for every call the core oracle made', { skip: existsSync(golden + 'libm.jsonl.gz') ? false : 'no core golden (re/teeworlds/oracle/build.sh core)' }, () => {
  const rows = lines(golden + 'libm.jsonl.gz') as [string, string, string, string][];
  let n = 0;
  for (const [fn, a, b, r] of rows) {
    const got = fn === 'powf' ? powf(fromBits(a), fromBits(b)) : atan2f(fromBits(a), fromBits(b));
    if (bits(got) !== r) assert.fail(`${fn}(${a}, ${b}) = ${bits(got)}, the original ${r}`);
    n++;
  }
  assert.ok(n > 1000);
});

for (const name of runs) {
  test(`game core ${name}: every character's state is the original's, tick by tick`, async () => {
    const rows = lines(golden + name) as Record<string, unknown>[];
    const head = rows[0] as { map: string; chars: number; tuning: number[]; spawns: [string, string][] };
    const df = await CDataFileReader.open(new Uint8Array(readFileSync(maps + head.map + '.map')));
    assert.ok(df && df.loadMap(), 'the map loads');
    const layers = new CLayers();
    layers.Init(df!);
    const col = new CCollision();
    col.Init(layers);
    const world = new CWorldCore();
    assert.deepEqual(Array.from(world.m_Tuning.v), head.tuning, 'the default tuning');
    const N = head.chars;
    const cores: CCharacterCore[] = [];
    const spawn = head.spawns.map(([x, y]) => new vec2(fromBits(x), fromBits(y)));
    for (let i = 0; i < N; i++) {
      const c = new CCharacterCore();
      c.Reset();
      c.Init(world, col);
      c.m_Pos = spawn[i];
      world.m_apCharacters[i] = c;
      cores.push(c);
    }
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] as { t: number; in: number[][]; c: (string | number)[][]; respawn: number[][] };
      for (let i = 0; i < N; i++) {
        const v = row.in[i];
        const inp = { m_Direction: v[0], m_TargetX: v[1], m_TargetY: v[2], m_Jump: v[3], m_Fire: v[4], m_Hook: v[5], m_PlayerFlags: v[6], m_WantedWeapon: v[7], m_NextWeapon: v[8], m_PrevWeapon: v[9] };
        if (inp.m_TargetX === 0 && inp.m_TargetY === 0) inp.m_TargetY = -1;
        cores[i].m_Input = inp;
        cores[i].Tick(true);
      }
      for (let i = 0; i < N; i++) {
        cores[i].Move();
        cores[i].Quantize();
      }
      const respawn: number[][] = [];
      for (let i = 0; i < N; i++) {
        const c = cores[i];
        const rx = idiv(round_to_int(c.m_Pos.x), 32), ry = idiv(round_to_int(c.m_Pos.y), 32);
        const clipped = rx < -200 || rx >= col.GetWidth() + 200 || ry < -200 || ry >= col.GetHeight() + 200;
        if (c.m_Death || clipped) {
          respawn.push([i, clipped ? 1 : 0]);
          c.Reset();
          c.m_Pos = spawn[i];
        }
      }
      for (let i = 0; i < N; i++) {
        const c = cores[i];
        const got = [bits(c.m_Pos.x), bits(c.m_Pos.y), bits(c.m_Vel.x), bits(c.m_Vel.y), bits(c.m_HookPos.x), bits(c.m_HookPos.y),
          bits(c.m_HookDir.x), bits(c.m_HookDir.y), c.m_HookTick, c.m_HookState, c.m_HookedPlayer, c.m_Jumped, c.m_Direction, c.m_Angle,
          c.m_Death ? 1 : 0, c.m_TriggeredEvents];
        if (JSON.stringify(got) !== JSON.stringify(row.c[i])) assert.fail(`tick ${row.t} character ${i}: ${JSON.stringify(got)}\n  the original: ${JSON.stringify(row.c[i])}`);
      }
      assert.deepEqual(respawn, row.respawn, `tick ${row.t}: respawns`);
    }
  });
}
