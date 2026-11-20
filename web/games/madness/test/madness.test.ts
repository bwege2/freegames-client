// Madness Interactive Reloaded's port against MIR 0.51.1 itself: re/madness/oracle/ runs the original C# code (MIR.dll
// built from the reference source, with its Walgelijk packages) headless and wrote test/golden/oracle.json: noise,
// Walgelijk's maths, every animation file parsed and sampled, the stats, armour, floor lines, damage formulas, the
// melee interaction table, the animation results and hand poses of characters, System.Random and the incident
// director's draws. The port must compute the same.
// The last tests run levels with a bot (the port's systems together; there is no deterministic original to
// compare a whole fight with: MIR uses System.Random and a variable time step).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { noiseFractal, noisePerlin, noiseSimplex, noiseValue } from '../src/engine/noise.ts';
import { DotNetRandom } from '../src/engine/dotnet-random.ts';
import { createIncident } from '../src/game/incident.ts';
import {
  deltaAngle, Easings, evalCurve, lerp, lerpAngle, lerpV, rng, rotatePoint, smoothAngleApproach, smoothApproach, snap, v2, vectorToAngle,
} from '../src/engine/util.ts';
import { floorLevelAt, isFlatAt, parseArmour, parseStats, parseLevel } from '../src/data/registry.ts';
import { ActiveAnimation } from '../src/data/animation.ts';
import { buildCharacter } from '../src/game/character.ts';
import { internals } from '../src/game/positioning.ts';
import { getDamageAtDistance, interactionResponse } from '../src/game/combat.ts';
import { fsSource, haveAssets, input, makeScene, reg, textureSize } from './harness.ts';

const golden = JSON.parse(readFileSync(join(import.meta.dirname, 'golden', 'oracle.json'), 'utf8'));
const close = (a: number | null, b: number | null, tol: number, what: string): void => {
  if (a === null || b === null) { assert.equal(a, b, what); return; }
  assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${what}: port ${a}, original ${b}`);
};
const closeV = (a: { x: number; y: number }, b: [number, number], tol: number, what: string): void => {
  close(a.x, b[0], tol, `${what}.x`);
  close(a.y, b[1], tol, `${what}.y`);
};

test('noise: Walgelijk Noise.GetValue, GetSimplex, GetFractal (FastNoise Lite)', () => {
  for (const [x, y, z, val, simplex, fractal] of golden.noise) {
    close(noiseValue(x, y, z), val, 1e-6, `GetValue(${x}, ${y}, ${z})`);
    close(noiseSimplex(x, y, z), simplex, 1e-6, `GetSimplex(${x}, ${y}, ${z})`);
    close(noiseFractal(x, y, z, 3), fractal, 1e-6, `GetFractal(${x}, ${y}, ${z})`);
  }
});

test('Walgelijk Utilities and Easings', () => {
  for (const r of golden.utilities) {
    const [a, b, t, sp, dt] = r;
    close(deltaAngle(a, b), r[5], 1e-4, 'DeltaAngle');
    close(lerpAngle(a, b, t), r[6], 1e-4, 'LerpAngle');
    close(smoothApproach(a, b, sp, dt), r[7], 1e-4, 'SmoothApproach');
    close(smoothAngleApproach(a, b, sp, dt), r[8], 1e-4, 'SmoothAngleApproach');
    closeV(rotatePoint(v2(a, b), b, v2(t * 10, -t)), r[9], 1e-4, 'RotatePoint');
    close(vectorToAngle(v2(a, b)), r[10], 1e-4, 'VectorToAngle');
    close(Easings.quadInOut(t), r[11], 1e-5, 'Quad.InOut');
    close(Easings.cubicInOut(t), r[12], 1e-5, 'Cubic.InOut');
    close(Easings.circInOut(t), r[13], 1e-5, 'Circ.InOut');
    close(Easings.circOut(t), r[14], 1e-5, 'Circ.Out');
    close(snap(a, 180), r[15], 1e-4, 'Snap');
  }
});

test('every animation file is read as AnimationDeserialiser reads it, and its curves evaluate the same', { skip: !haveAssets }, () => {
  const anims = reg().animations;
  assert.equal(anims.size, Object.keys(golden.animations).length, 'number of animations');
  for (const [name, g] of Object.entries(golden.animations) as [string, any][]) {
    const a = anims.get(name);
    assert.ok(a, `animation ${name}`);
    assert.equal(a.group, g.group, `${name} group`);
    close(a.totalDuration, g.total, 1e-5, `${name} total duration`);
    assert.equal(a.relativeHandPosition, g.relative, `${name} relative`);
    assert.deepEqual(a.constraints.map((c) => [Math.fround(c.time), c.constraints >>> 0]), g.constraints.map((c: [number, number]) => [Math.fround(c[0]), c[1]]), `${name} constraints`);
    const limb = (l: typeof a.head, gl: any, what: string): void => {
      if (!gl) { assert.equal(l, null, what); return; }
      assert.ok(l, what);
      close(l.duration, gl.duration, 1e-5, `${what} duration`);
      assert.equal(l.adjustForAim, gl.aim, `${what} aim`);
      for (const s of gl.samples) {
        const t = s[0];
        if (s[1]) closeV(evalCurve(l.translation!, t, lerpV, v2()), s[1], 1e-4, `${what} translation(${t})`); else assert.equal(l.translation, null);
        if (s[2] !== null) close(evalCurve(l.rotation!, t, lerp, 0), s[2], 1e-4, `${what} rotation(${t})`); else assert.equal(l.rotation, null);
        if (s[3]) closeV(evalCurve(l.scale!, t, lerpV, v2(1, 1)), s[3], 1e-4, `${what} scale(${t})`); else assert.equal(l.scale, null);
        if (s.length > 4) assert.equal(l.handLookFor(t), s[4], `${what} hand look(${t})`);
      }
    };
    limb(a.head, g.head, `${name} head`);
    limb(a.body, g.body, `${name} body`);
    assert.equal(a.hands?.length ?? 0, g.hands.length, `${name} hands`);
    g.hands.forEach((h: any, i: number) => limb(a.hands![i], h, `${name} hand ${i}`));
  }
});

test('character stats (CharacterStatsDeserialiser)', { skip: !haveAssets }, () => {
  for (const [key, g] of Object.entries(golden.stats) as [string, any[]][]) {
    const s = parseStats(fsSource.text(`data/stats/${key}.stats`));
    const got = [s.name, s.scale, s.aimingRandomness, s.aimingSpeed, s.shootingTimeout, s.recoilHandlingAbility, s.accurateShotChance, s.dodgeAbility,
      s.jumpDodgeDuration, s.walkHopDuration, s.agilitySkillLevel, s.panicIntensity, s.meleeSkill, s.meleeKnockback, s.canDeflect, s.dodgeOversaturate,
      s.headHealth, s.bodyHealth, s.unarmedSeq.join(' '), s.walkAnimation ?? ''];
    got.forEach((v, i) => (typeof v === 'number' ? close(v, g[i], 1e-6, `${key}[${i}]`) : assert.equal(v, g[i], `${key}[${i}]`)));
  }
});

test('armour pieces (ArmourDeserialiser)', { skip: !haveAssets }, () => {
  const files = fsSource.list('data/armour').filter((p) => p.endsWith('.armor'));
  for (const [key, g] of Object.entries(golden.armour) as [string, any[]][]) {
    const f = files.find((p) => p.endsWith(`/${key}.armor`));
    assert.ok(f, key);
    const p = parseArmour(fsSource.text(f));
    assert.equal(p.type, g[0], `${key} type`);
    close(p.textureScale, g[1], 1e-6, `${key} scale`);
    close(p.deflectChance, g[2], 1e-6, `${key} deflect`);
    closeV(p.offsetLeft, g[3], 1e-6, `${key} offset left`);
    closeV(p.offsetRight, g[4], 1e-6, `${key} offset right`);
    assert.equal(p.detachable, g[5], `${key} detach`);
    assert.equal(p.brokenKeys?.length ?? 0, g[6], `${key} broken`);
  }
});

test('floor lines (Level.GetFloorLevelAt, IsFlatAt) of the ported levels', { skip: !haveAssets }, () => {
  let n = 0;
  for (const [id, samples] of Object.entries(golden.floors) as [string, [number, number, boolean][]][]) {
    if (!fsSource.has(`data/levels/${id}.json`)) continue;
    const level = parseLevel(fsSource.text(`data/levels/${id}.json`), id);
    for (const [x, y, flat] of samples) {
      close(floorLevelAt(level, x), y, 1e-4, `${id} floor at ${x}`);
      assert.equal(isFlatAt(level, x), flat, `${id} flat at ${x}`);
    }
    n++;
  }
  assert.ok(n >= 11, 'all ported levels');
});

test('damage over distance, bullet hole size, melee interaction table', () => {
  for (const [d, dist, dmg] of golden.weapons.damage) close(getDamageAtDistance(d, dist), dmg, 1e-5, `GetDamageAtDistance(${d}, ${dist})`);
  // MeleeUtils.GetInteractionResponse, through the combat module's block response
  assert.equal(golden.weapons.melee.length, 4 * 3 * 4 * 3);
  for (const [at, as, vt, vs, want] of golden.weapons.melee) {
    const w = (t: string, sz: string) => ({ weaponType: 'Melee' as const, specialMelee: false, meleeDamageType: t as 'Blade', meleeSize: sz as 'Small' });
    assert.equal(interactionResponse(w(at, as), w(vt, vs)), want, `${at} ${as} against ${vt} ${vs}`);
  }
});

test('animation results and fist poses of characters (CalculateAnimationResult, HandPosingFunctions.FistFight)', { skip: !haveAssets }, () => {
  const r = reg();
  for (const g of golden.characters) {
    const bottom = v2(100, 50);
    const c = buildCharacter({ name: 't', bottom, faction: r.faction('aahw'), look: r.looks.get('grunt')!, stats: r.stats.get('grunt')!, scaleOverride: g.scale, textureSize });
    const pos = c.positioning;
    pos.isFlipped = g.flipped;
    c.aimTargetPosition = v2(g.aim[0], g.aim[1]);
    c.aimOrigin = { ...pos.globalCenter };
    pos.head.globalRotation = g.headRot;
    pos.meleeBlockProgress = g.block;
    internals.fistFight(c);
    const what = `${g.anim} flipped=${g.flipped} scale=${g.scale} t=${g.timer}`;
    closeV(pos.hands[0].posePosition, g.poses[0], 1e-4, `${what} hand 0 pose`);
    close(pos.hands[0].poseRotation, g.poses[1], 1e-4, `${what} hand 0 pose rotation`);
    closeV(pos.hands[1].posePosition, g.poses[2], 1e-4, `${what} hand 1 pose`);
    close(pos.hands[1].poseRotation, g.poses[3], 1e-4, `${what} hand 1 pose rotation`);
    const a = new ActiveAnimation(r.anim(g.anim), 1);
    a.unscaledTimer = g.timer;
    c.animations.push(a);
    const res = internals.animationResult(c, 0);
    const exp = g.r;
    closeV(res.bodyPosition, exp[0], 1e-3, `${what} body position`);
    close(res.bodyRotation, exp[1], 1e-3, `${what} body rotation`);
    closeV(res.bodyScale, exp[2], 1e-4, `${what} body scale`);
    closeV(res.headPosition, exp[3], 1e-3, `${what} head position`);
    close(res.headRotation, exp[4], 1e-3, `${what} head rotation`);
    closeV(res.headScale, exp[5], 1e-4, `${what} head scale`);
    closeV(res.hand1Position, exp[6], 1e-3, `${what} hand 1 position`);
    close(res.hand1Rotation, exp[7], 1e-3, `${what} hand 1 rotation`);
    closeV(res.hand1Scale, exp[8], 1e-4, `${what} hand 1 scale`);
    closeV(res.hand2Position, exp[9], 1e-3, `${what} hand 2 position`);
    close(res.hand2Rotation, exp[10], 1e-3, `${what} hand 2 rotation`);
    closeV(res.hand2Scale, exp[11], 1e-4, `${what} hand 2 scale`);
    assert.equal(res.hand1Look, exp[12], `${what} hand 1 look`);
    assert.equal(res.hand2Look, exp[13], `${what} hand 2 look`);
    assert.equal(c.getAnimationConstraints(), g.constraints, `${what} constraints`);
  }
});

test('System.Random with a seed (Next, NextSingle, GetItems, Shuffle) and Noise.GetPerlin', () => {
  for (const g of golden.random) {
    const r = new DotNetRandom(g.seed);
    assert.deepEqual(g.next.map((_: number, i: number) => r.next(0, 100 + i * 37)), g.next, `Next, seed ${g.seed}`);
    for (const v of g.single) close(r.nextSingle(), v, 0, `NextSingle, seed ${g.seed}`);
    assert.deepEqual(r.getItems([0, 1, 2, 3, 4, 5, 6], 9), g.items, `GetItems, seed ${g.seed}`);
    const a = Array.from({ length: 20 }, (_, i) => i);
    r.shuffle(a);
    assert.deepEqual(a, g.shuffle, `Shuffle, seed ${g.seed}`);
  }
  for (const [x, y, z, want] of golden.perlin) close(noisePerlin(x, y, z), want, 1e-6, `GetPerlin(${x}, ${y}, ${z})`);
});

test('incident mode: IncidentConfig.CreateCampaign draws the same levels, kill targets, music and spawning', { skip: !haveAssets }, () => {
  for (const g of golden.incident) {
    const inc = createIncident(reg(), g.seed, g.kills);
    const what = `seed ${g.seed}`;
    assert.deepEqual(inc.levels.map((l) => l.id), g.levels, `${what} levels`);
    assert.equal(inc.music, g.music, `${what} music`);
    assert.deepEqual(inc.levels.map((l) => l.bodyCountToWin), g.body, `${what} body counts`);
    assert.equal(inc.killTarget, g.sum, `${what} kill target`);
    g.mid.forEach((m: { maxEnemies: number; maxAttacking: number; weapons: string[]; interval: number; spawns: number } | null, k: number) => {
      const l = inc.levels[k + 1];
      if (!m) return;
      assert.equal(l.maxEnemyCount, m.maxEnemies, `${what} level ${k + 1} max enemies`);
      assert.equal(l.maxSimultaneousAttackingEnemies, m.maxAttacking, `${what} level ${k + 1} attacking`);
      assert.deepEqual(l.weapons, m.weapons, `${what} level ${k + 1} weapons`);
      close(l.enemySpawnInterval, m.interval, 1e-6, `${what} level ${k + 1} spawn interval`);
      assert.equal(l.enemySpawnInstructions.length, m.spawns, `${what} level ${k + 1} spawn instructions`);
    });
  }
});

/** a bot aims at the nearest living enemy and fires */
function botRun(id: string, seconds: number): void {
  rng.seed(1234);
  const sounds: string[] = [];
  const s = makeScene(id, sounds);
  const level = reg().level(id);
  const p = s.player;
  const npcs = level.objects.filter((o) => o.$type === 'NPC').length;
  if (p && level.levelType !== 'Experiment') assert.ok(s.characters.length >= 1 + npcs, `${id}: player and NPCs`);
  for (let f = 0; f < 60 * seconds; f++) {
    const enemy = s.characters.find((c) => c !== p && c.isAlive && c.ai);
    const target = enemy ? enemy.positioning.head.globalPosition : p ? v2(p.positioning.globalCenter.x + 1000, p.positioning.globalCenter.y) : v2();
    const pressed = new Set<'attack'>();
    if (f % 15 === 0) pressed.add('attack');
    s.update(1 / 60, input({ worldMouse: target, attack: true, pressed }));
    for (const c of s.characters) {
      assert.ok(Number.isFinite(c.positioning.globalCenter.x) && Number.isFinite(c.positioning.globalCenter.y), `${id}: positions stay finite`);
    }
  }
  if (id === 'lvl_opening' || id === 'lvl_hallway' || id === 'lvl_two_stairs') {
    assert.ok(s.progress.bodyCount.current + s.characters.filter((c) => !c.isAlive).length > 0 || !p!.isAlive, 'someone died');
    assert.ok(sounds.length > 0, 'sounds were played');
  }
}

// every level of every campaign (the tutorial, Employee of the Month and the hidden mag campaign), the incident
// levels and the experiment levels
const allLevels = haveAssets ? [...reg().levelFiles.keys()].filter((k) => !/^(dbg_|test$|face$|fun$|greenscreen$)/.test(k)).sort() : [];
for (const c of haveAssets ? reg().campaigns.values() : []) {
  test(`campaign ${c.id}: every level is built and a bot fights in it for 10 seconds`, () => {
    for (const id of c.levels) botRun(id, id === 'lvl_opening' || id === 'lvl_hallway' || id === 'lvl_two_stairs' ? 30 : 10);
  });
}
test('incident and experiment levels: built, and a bot fights in each for 5 seconds', { skip: !haveAssets }, () => {
  const campaignLevels = new Set([...reg().campaigns.values()].flatMap((c) => c.levels));
  for (const id of allLevels) if (!campaignLevels.has(id)) botRun(id, 5);
});

test("base: asset references (the hidden mag campaign uses them) resolve to the port's asset keys", { skip: !haveAssets }, () => {
  const level = reg().level('lvl_mag_continuation');
  assert.equal(level.backgroundMusic, 'sounds/music/Lothyde/living_on_the_edge_(feat_monocronic).ogg');
  assert.equal((level.objects.find((o) => o.$type === 'Background') as unknown as { TexturePath: string }).TexturePath, 'textures/backgrounds/mag_campaign/background_mag_continuation.qoi');
  assert.equal((level.objects.find((o) => o.$type === 'Door') as unknown as { Properties: { Texture: string } }).Properties.Texture, 'textures/doors/door_horizontal_1.png');
  for (const l of reg().levelFiles.keys()) {
    const lv = reg().level(l);
    assert.ok(!lv.backgroundMusic?.includes('base:'), `${l} music`);
    const seen: unknown[] = [];
    const scan = (v: unknown): void => { if (typeof v === 'string') assert.ok(!v.includes('base:'), `${l} ${v}`); else if (v && typeof v === 'object') for (const x of Object.values(v)) scan(x); };
    for (const o of lv.objects) { if (!seen.includes(o)) { seen.push(o); scan(o); } }
  }
});

test('an incident plays copies of the levels and its kill target is the sum of their body counts', { skip: !haveAssets }, () => {
  rng.seed(99);
  const inc = createIncident(reg(), 7, 60);
  assert.equal(inc.levels.length, 7);
  assert.equal(inc.levels.reduce((a, l) => a + l.bodyCountToWin, 0), inc.killTarget);
  // the registry's own levels stay as they are
  for (const l of inc.levels) assert.notEqual(l, reg().level(l.id));
});
