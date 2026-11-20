// Madness Interactive Reloaded port (GPL-3.0). The level objects and level systems beyond walls, NPCs and
// doors: Level editor/LevelObjects/TrainMovingBackground.cs, AnimationTrigger.cs, CutscenePlayer.cs, Turret.cs, Disk.cs,
// LevelScript.cs (the three scripts of the campaign, translated), Level/Systems/TrainShakeSystem.cs,
// PassingTrainSystem.cs, MachinistLevelSystem.cs, DebarkationLevelSystem.cs, ElevatorLevelSystem.cs, TurretSystem.cs,
// AnimationTriggerSystem.cs, CutscenePlayerSystem.cs, Level editor/Systems/UnlockDiskSystem.cs and the prefabs they use
// (fire, train and turret explosions, engine bullet holes).
import type { LevelObject } from '../data/registry.ts';
import { floorLevelAt } from '../data/registry.ts';
import { rotation, mmul, translation, scaling, type Mat } from '../engine/matrix.ts';
import { noisePerlin } from '../engine/noise.ts';
import { Layers } from '../engine/physics.ts';
import {
  add, clamp, dist, distSq, Easings, lerp, mapRange, mul, normalize, pickRandom, randomFloat, randomPointInCircle, rect, sub, v2, vectorToAngle, len,
  type Rect, type Vec2,
} from '../engine/util.ts';
import { Layer, type Character, hasRoundsLeft } from './character.ts';
import { castBulletRay } from './combat.ts';
import type { Scene } from './scene.ts';

export const BackgroundSizeRatio = 3 / (1080 / 800);

/** something the scene draws this frame (Draw.* calls of the systems) */
export interface DrawItem {
  tex: string | null; m: Mat; color: [number, number, number, number]; mode: number; layer: number; order: number;
  uv?: [number, number, number, number]; p?: [number, number, number, number];
}
export const rectM = (cx: number, cy: number, w: number, h: number): Mat => [w, 0, 0, h, cx, cy];

export interface HitEvent { point: Vec2; normal: Vec2; direction: Vec2; damage: number; isCosmetic: boolean; weapon: import('./character.ts').Weapon | null }

interface Trigger { rect: Rect; animation: string; levelComplete: boolean; target: number; position: Vec2; flipped: boolean; look: string | null; stats: string | null; faction: string; expired: boolean }
interface Turret {
  position: Vec2; angleRange: Vec2; layer: number; order: number; faction: string; angle: number; health: number; exploded: boolean; target: Character | null;
  lifespan: number; findClock: number; shootClock: number; node: Vec2; next: Vec2; vel: Vec2; force: Vec2; aim: number; renderedAim: number;
}

const VUURTJES = [{ tex: 'textures/vuurtje1_1x31.png', cols: 31 }, { tex: 'textures/vuurtje2_1x31.png', cols: 31 }];

/** the extras of one level, made from its objects and GameSystem names */
export class LevelExtras {
  trainBackgrounds: { rect: Rect; speed: number }[] = [];
  triggers: Trigger[] = [];
  cutscenePlayers: { key: string; position: Vec2; progress: boolean }[] = [];
  turrets: Turret[] = [];
  disks: { id: string; position: Vec2; angle: number; texture: string; layer: number; order: number }[] = [];
  systems = new Set<string>();
  fires: { pos: Vec2; i: number }[] = [];
  engine: { health: number; exploded: boolean; holes: { pos: Vec2; normal: Vec2 }[] } | null = null;
  machinistOverlay = false;
  passingTrain = { time: 0, speed: 0.5 };
  debarkation = 0;
  elevator = { verticalOffset: 0, time: 0, startDelay: 3, dtMultiplier: 0, details: [] as { tex: string; x: number; right: boolean; pos: number; visible: boolean }[], startedSound: false };
  scriptAcc = 0;
  private fixedAcc = 0;

  readonly s: Scene;
  constructor(s: Scene) { this.s = s; }

  /** a level object this module knows; false if it is not one */
  spawn(o: LevelObject): boolean {
    const r = (q: { MinX: number; MinY: number; MaxX: number; MaxY: number }): Rect => rect(q.MinX, q.MinY, q.MaxX, q.MaxY);
    switch (o.$type) {
      case 'TrainMovingBackground': this.trainBackgrounds.push({ rect: r(o.Rectangle), speed: o.Speed ?? 0 }); return true;
      case 'GameSystem': this.systems.add(String(o.SystemTypeName ?? '').split(',')[0].split('.').pop()!); return true;
      case 'AnimationTrigger': {
        const c = o.Component;
        this.triggers.push({ rect: r(o.Rectangle), animation: c.Animation, levelComplete: c.StartEvent === 1 || c.StartEvent === 'LevelComplete',
          target: typeof c.Target === 'number' ? c.Target : ['Nearest', 'Player', 'CreateNew'].indexOf(c.Target), position: v2(c.TargetPosition.X, c.TargetPosition.Y),
          flipped: !!c.TargetFlipped, look: c.CreateNewLook ?? null, stats: c.CreateNewStats ?? null, faction: c.CreateNewFaction ?? 'aahw', expired: false });
        return true;
      }
      case 'CutscenePlayer': this.cutscenePlayers.push({ key: o.CutsceneKey, position: v2(o.Position.X, o.Position.Y), progress: !!o.ProgressLevelOnEnd }); return true;
      case 'Turret': {
        const deg = (x: number): number => x * Math.PI / 180;
        const t: Turret = {
          position: v2(o.Position.X, o.Position.Y), angleRange: v2(deg((o.MinAngle ?? -80) - o.Angle), deg((o.MaxAngle ?? 80) - o.Angle)),
          layer: o.RenderOrder?.Layer ?? Layer.BackgroundInFront, order: o.RenderOrder?.OrderInLayer ?? 0, faction: o.Faction ?? 'aahw', angle: deg(o.Angle),
          health: 2, exploded: false, target: null, lifespan: randomFloat(0, 1), findClock: 0, shootClock: 0, node: v2(), next: v2(), vel: v2(), force: v2(), aim: 0, renderedAim: 0,
        };
        this.turrets.push(t);
        this.s.physics.add({ owner: { onShot: (e: HitEvent) => { if (!e.isCosmetic) { t.health -= e.damage; this.s.effects.deflectionSpark(e.point, vectorToAngle(add(mul(e.direction, -1), mul(randomPointInCircle(), 0.5))), randomFloat(0.5, 1)); } } },
          filterBits: Layers.BlockBullets, collider: { kind: 'aabb', minX: t.position.x - 150, minY: t.position.y - 150, maxX: t.position.x + 150, maxY: t.position.y + 150 } });
        return true;
      }
      case 'Disk': {
        if (!o.DiskId || !o.Texture) return true;
        this.disks.push({ id: o.DiskId, position: v2(o.Position.X, o.Position.Y), angle: o.Angle * Math.PI / 180, texture: o.Texture,
          layer: o.RenderOrder?.Layer ?? -100, order: o.RenderOrder?.OrderInLayer ?? 0 });
        return true;
      }
      case 'LevelScript': return true; // translated by level below
      default: return false;
    }
  }

  /** MachinistLevelSystem.Initialise: the engine is the wall tagged TrainEngine (13) */
  init(): void {
    if (this.systems.has('MachinistLevelSystem')) {
      const body = this.s.physics.bodies.find((b) => (b.owner as { tag?: number })?.tag === 13);
      if (body) {
        this.engine = { health: 4, exploded: false, holes: [] };
        (body.owner as { onShot?: (e: HitEvent) => void }).onShot = (e) => this.engineHit(e);
      }
    }
    if (this.systems.has('PassingTrainSystem')) {
      this.s.delay(0.5, () => { this.s.audio.play('sounds/train_whistle.wav'); this.s.music.loop('sounds/train_loop.ogg'); });
    }
    if (this.systems.has('DebarkationLevelSystem')) { this.debarkation = 0; this.s.music.loop('sounds/train_emergency_halt.ogg', false); }
    // LevelScript of lvl_destination: one time in forty, the doors tagged 900 are portals
    if (this.s.level.id === 'lvl_destination' && randomFloat() <= 0.025) for (const d of this.s.doors) if (d.tag === 900) d.isPortal = true;
    // LevelScript "music thing" of lvl_cutscene_bossbattle: Lothyde's strenuous.ogg from second 93
    if (this.s.level.id === 'lvl_cutscene_bossbattle') this.s.hooks.music('sounds/music/Lothyde/strenuous.ogg', true, 93);
  }

  private engineHit(e: HitEvent): void {
    const eng = this.engine!;
    if (eng.exploded) return;
    if (e.weapon && e.weapon.data.weaponType === 'Firearm' && hasRoundsLeft(e.weapon)) {
      eng.holes.push({ pos: add(e.point, v2(randomFloat(-5, 24), 0)), normal: e.normal });
      this.s.audio.play(pickRandom([1, 2, 3, 4].map((i) => `sounds/bullet_impact/metal_0${i}.wav`)), randomFloat(0.8, 2), randomFloat(0.85, 1.1));
      eng.health -= 1;
      if (this.s.disks.has('infinite_ammo') && eng.health <= 0) this.explode();
    } else this.explode();
  }
  private explode(): void {
    const eng = this.engine!;
    eng.exploded = true;
    this.s.shake(100);
    this.s.audio.play('sounds/train_explosion.ogg', 1);
    const sz = this.s.textureSize('textures/explosion_1x15.png');
    this.s.fx.push({ texture: 'textures/explosion_1x15.png', columns: 15, rows: 1, pos: v2(883.6808, -100.45358), rot: 0,
      size: v2(sz.w / 15 * 4 * BackgroundSizeRatio, sz.h * 4 * BackgroundSizeRatio), time: 0, duration: 0.625, tint: null, layer: Layer.Effects, order: 0 });
    this.machinistOverlay = true;
    this.fires.push({ pos: v2(1088, -43), i: 0 }, { pos: v2(775, -380), i: 1 });
    eng.holes = [];
    this.s.delay(2, () => { this.s.forceReachGoal(); this.s.transitionToNextLevel(); });
  }

  update(dt: number): void {
    const s = this.s;
    const time = s.clock.time;
    if (this.systems.has('TrainShakeSystem')) s.shake(dt * 200 * noisePerlin(time, 0, 2318.232));
    if (this.systems.has('PassingTrainSystem')) this.passingTrain.time += dt * this.passingTrain.speed;
    if (this.systems.has('MachinistLevelSystem')) this.machinist();
    if (this.systems.has('DebarkationLevelSystem')) {
      const progress = Easings.cubicOut(clamp(this.debarkation));
      if (dt < 0.1) this.debarkation += dt * 0.1;
      s.shake(dt * 100 * Math.sqrt(1 - progress));
    }
    if (this.systems.has('ElevatorLevelSystem')) this.elevatorUpdate(dt);
    this.animationTriggers();
    this.cutscenes();
    // LevelScript "guard" of lvl_incident_begin_1: the first AI found is docile
    if (s.level.id === 'lvl_incident_begin_1') { const a = s.characters.find((c) => c.ai); if (a) a.ai!.isDocile = true; }
    // LevelScript of lvl_roof_1: the giant's footsteps in the last five seconds
    if (s.level.id === 'lvl_roof_1' && s.progress.timed >= 93 - 5) {
      this.scriptAcc += dt;
      if (this.scriptAcc > 0.8) { this.scriptAcc = 0; s.shake(120); s.audio.play(pickRandom(s.soundFolder('sounds/mag_footstep'))); }
    }
    this.fixedAcc += dt;
    while (this.fixedAcc >= 1 / 60) {
      this.fixedAcc -= 1 / 60;
      if (this.turrets.length) for (const t of this.turrets) this.turretStep(t, 1 / 60);
      if (this.systems.has('ElevatorLevelSystem')) this.elevatorFixed();
    }
    this.diskPickup();
  }

  /** MachinistLevelSystem.Update: the hostages cower, the player always has a gun */
  private machinist(): void {
    const s = this.s;
    const p = s.player;
    if (!p) return;
    if (this.engine && !this.engine.exploded) {
      const onGround = s.weapons.some((w) => w.data.weaponType === 'Firearm' && hasRoundsLeft(w));
      let need = false;
      if (!onGround) {
        if (p.hasWeaponEquipped) need = (p.equipped!.data.weaponType === 'Firearm' && !hasRoundsLeft(p.equipped!)) || p.equipped!.data.weaponType === 'Melee';
        else need = true;
      }
      if (need && s.reg.weapons.has('micro_uzi')) s.createWeapon({ ...p.positioning.globalCenter }, s.reg.weapons.get('micro_uzi')!);
    }
    const scared1 = s.reg.anim('scared_1');
    const scared2 = s.reg.anim('scared_2');
    for (const c of s.characters) {
      if (!c.ai) continue;
      c.allowWalking = false;
      c.ai.isDocile = true;
      c.positioning.isFlipped = true;
      c.ai.aimingPosition = v2(-500, 0);
      c.positioning.head.direction = v2(1, 0);
      c.positioning.head.globalRotation = 0;
      let threatened = false;
      if (p.hasWeaponEquipped && p.isIronSighting) {
        const w = p.equipped!;
        const m = w.transform.localToWorld;
        const barrel = v2(w.barrelEndPoint.x * m[0] + w.barrelEndPoint.y * m[2] + m[4], w.barrelEndPoint.x * m[1] + w.barrelEndPoint.y * m[3] + m[5]);
        const hit = s.physics.raycast(barrel, v2(m[0], m[1]), Number.MAX_VALUE, p.faction.attackHitLayerComposite, p.attackIgnore);
        const owner = hit?.body.owner as { character?: Character } | undefined;
        if (owner?.character?.ai) {
          if (!c.animations.some((a) => a.animation === scared2)) c.playAnimation(scared2);
          threatened = true;
        }
      }
      if (c.isAlive && !c.isPlayingAnimationGroup('deaths') && (!c.mainAnimation || c.mainAnimation.isAlmostOver(0.85)))
        c.playAnimation(threatened ? scared2 : scared1);
    }
  }

  /** ElevatorLevelSystem.Update */
  private elevatorUpdate(dt: number): void {
    const s = this.s;
    const e = this.elevator;
    e.dtMultiplier = clamp(e.dtMultiplier + dt / 60, 0, 6);
    e.time += dt * (1 + e.dtMultiplier);
    const speed = Easings.cubicIn(clamp((e.time - e.startDelay) / 5)) * 1500 * (1 + e.dtMultiplier);
    if (e.time > e.startDelay) {
      if (e.verticalOffset <= 1.401298464324817e-45) { s.shake(5); s.audio.play('sounds/elevator_start.ogg'); }
      e.verticalOffset += dt * speed;
      if (e.time > e.startDelay + 3 && !s.spawner.enabled) s.spawner.enabled = true;
    } else s.spawner.enabled = s.levelAttempts > 1;
    const lamp = s.props.find((p) => p.tag === 9020);
    if (lamp) lamp.pos = v2(lamp.pos.x, lamp.pos.y - dt * speed);
    for (const d of e.details) if (d.visible) d.pos += dt * speed;
  }
  private elevatorFixed(): void {
    const e = this.elevator;
    if (e.time <= e.startDelay) return;
    this.s.shake(0.1);
    if (e.time > e.startDelay * 2 && e.details.filter((d) => d.visible).length < 1 && randomFloat() > 0.99) {
      const DETAILS: [number, number, boolean][] = [[1, 0, false], [2, 18, false], [3, 22, false], [4, 0, true], [5, 435, false], [6, 11, false], [7, 12, true], [8, 15, true], [9, 320, true]];
      const [n, x, right] = pickRandom(DETAILS);
      e.details = [{ tex: `textures/elevator_details/background_elevtator_detail_${n}.png`, x, right, pos: 0, visible: true }];
    }
  }

  /** AnimationTriggerSystem.Update */
  private animationTriggers(): void {
    const s = this.s;
    const p = s.player;
    if (!p || p.player!.isDoingDyingSequence || !p.isAlive || p.positioning.isFlying || p.isPlayingAnimation) return;
    const b = p.boundingBox();
    for (const t of this.triggers) {
      if (t.levelComplete && !s.progress.goalReached) continue;
      const r = t.rect;
      if (t.expired || !(r.minX <= b.maxX && r.maxX >= b.minX && r.minY <= b.maxY && r.maxY >= b.minY)) continue;
      if (t.target === 0) {
        const center = v2((r.minX + r.maxX) / 2, (r.minY + r.maxY) / 2);
        let near: Character | null = null;
        let min = Number.MAX_VALUE;
        for (const c of s.characters) { const d = distSq(c.positioning.globalCenter, center); if (d < min) { min = d; near = c; } }
        if (near) this.playFor(t, near);
      } else if (t.target === 1) this.playFor(t, p);
      else {
        const looks = [...s.reg.looks.keys()];
        const stats = [...s.reg.stats.keys()];
        const enemy = s.reg.faction(t.faction).isEnemiesWith(p.faction);
        const c = enemy
          ? s.createEnemy(t.position, t.stats || pickRandom(stats), t.look || pickRandom(looks), t.faction)
          : s.createCharacter('Spawn of the Animation Trigger', t.position, t.faction, t.look || pickRandom(looks), t.stats || pickRandom(stats));
        this.playFor(t, c);
      }
    }
  }
  private playFor(t: Trigger, c: Character): void {
    t.expired = true;
    const floor = floorLevelAt(this.s.level, t.position.x);
    c.positioning.globalTarget = v2(t.position.x, t.position.y - floor);
    c.positioning.isFlipped = t.flipped;
    c.positioning.feet[0].offset = v2();
    c.positioning.feet[1].offset = v2();
    c.needsLookUpdate = true;
    if (this.s.reg.animations.has(t.animation)) c.playAnimation(this.s.reg.anim(t.animation));
  }

  /** CutscenePlayerSystem.Update */
  private cutscenes(): void {
    const s = this.s;
    const p = s.player;
    if (!p || s.cutscene) return;
    for (const c of this.cutscenePlayers) {
      // the original measures from GlobalCenter; the port also takes the player's feet, so that the trigger of
      // lvl_cutscene_begin, placed on the spawn point, fires (re/madness/NOTES.md)
      const feet = v2(p.positioning.globalCenter.x, floorLevelAt(s.level, p.positioning.globalCenter.x));
      if (dist(c.position, p.positioning.globalCenter) < 64 || dist(c.position, feet) < 64) {
        this.cutscenePlayers.splice(this.cutscenePlayers.indexOf(c), 1);
        s.startCutscene(c.key, c.progress);
        return;
      }
    }
  }

  /** TurretSystem.FixedUpdate */
  private turretStep(t: Turret, fixed: number): void {
    const s = this.s;
    const faction = s.reg.factions.get(t.faction);
    if (!faction) return;
    const rest = 420;
    const dt = fixed * 35;
    if (t.node.x * t.node.x + t.node.y * t.node.y < 1) t.next = t.node = mul(v2(Math.cos(-t.angle), Math.sin(-t.angle)), rest);
    t.vel = add(t.vel, mul(t.force, dt));
    t.force = v2();
    t.next = add(t.node, mul(t.vel, dt));
    if (!t.exploded) {
      if (t.health <= 0) {
        t.exploded = true;
        s.shake(100);
        s.audio.play('sounds/turret_death.wav', 1);
        const sz = s.textureSize('textures/explosion_20_5x4.png');
        s.fx.push({ texture: 'textures/explosion_20_5x4.png', columns: 5, rows: 4, pos: sub(t.position, v2(0, 90)), rot: 0,
          size: v2(sz.w / 5 * BackgroundSizeRatio * 2.4, sz.h / 4 * BackgroundSizeRatio * 2.4), time: 0, duration: 0.833, tint: null, layer: Layer.Effects + 101, order: 0 });
      } else if (t.target && !t.target.removed && t.target.isAlive) {
        const d = mul(normalize(sub(t.target.positioning.head.globalPosition, t.position)), len(t.node));
        t.force = add(t.force, mul(sub(d, t.node), 0.07));
        t.shootClock += fixed;
        if (t.shootClock > 0.2 && t.findClock > 1) {
          t.shootClock = 0;
          const dir = normalize(t.node);
          const origin = add(t.position, mul(v2(Math.cos(-t.angle), Math.sin(-t.angle)), 80));
          t.force = add(t.force, mul(randomVector2(), 30));
          s.effects.muzzleFlash(add(origin, mul(dir, 420 + 250)), vectorToAngle(dir), 2.5);
          castBulletRay(s, { origin: add(origin, mul(dir, 420)), direction: add(dir, mul(randomVector2(), 0.01)), isCosmetic: false, clusterSize: 1, damage: 0.8,
            enemyCollisionLayer: faction.attackHitLayerComposite, ignore: new Set(), canBeDeflected: true, canBeAutoDodged: true, originCharacter: null, originWeapon: null }, 0, 0);
          s.audio.play(pickRandom([1, 2, 3].map((i) => `sounds/firearms/cqb_${i}.wav`)), 1, randomFloat(0.7, 0.75));
        }
      } else {
        if (t.findClock > 1) {
          t.findClock = 0;
          for (const c of s.characters) {
            if (randomFloat() > 0.5) continue;
            if (c.isAlive && faction.isEnemiesWith(c.faction)) t.target = c;
          }
        }
        let tt = (t.lifespan * 0.5) % 2;
        tt = tt > 1 ? 1 - tt % 1 : tt;
        tt = clamp(mapRange(0.2, 0.8, 0, 1, tt));
        const th = mapRange(0, 1, t.angleRange.x, t.angleRange.y, tt);
        t.next = add(t.next, mul(sub(mul(v2(Math.cos(th), Math.sin(th)), len(t.node)), t.node), 0.1));
      }
    } else t.force = add(t.force, v2(0, -10));
    {
      const mn = Math.min(t.angleRange.x, t.angleRange.y), mx = Math.max(t.angleRange.x, t.angleRange.y), mid = (mn + mx) / 2;
      const l = len(t.node);
      const midP = mul(v2(Math.cos(mid), Math.sin(mid)), l);
      const minP = mul(v2(Math.cos(mn), Math.sin(mn)), l);
      const maxD = dist(midP, minP);
      const dMid = dist(t.node, midP);
      if (dMid > maxD) t.next = add(t.next, mul(normalize(sub(midP, t.node)), Math.abs(maxD - dMid)));
    }
    t.next = add(t.next, mul(mul(normalize(t.node), rest - len(t.node)), 0.9));
    t.vel = mul(sub(t.next, t.node), 1 / dt);
    t.node = t.next;
    t.vel = mul(t.vel, t.exploded ? 0.95 : 0.8);
    t.lifespan += fixed;
    t.findClock += fixed;
    t.renderedAim = t.aim;
    t.aim = Math.atan2(t.node.y, t.node.x);
  }

  /** UnlockDiskSystem: click a disk to unlock it */
  private diskPickup(): void {
    const s = this.s;
    for (const d of [...this.disks]) {
      if (s.disks.isUnlocked(d.id) || !s.disks.known(d.id)) { this.disks.splice(this.disks.indexOf(d), 1); continue; }
      const sz = s.textureSize(d.texture);
      const m = s.mouseWorld;
      // the rectangle, rotated by -angle around the position
      const c = Math.cos(d.angle), sn = Math.sin(d.angle);
      const lx = (m.x - d.position.x) * c - (m.y - d.position.y) * sn;
      const ly = (m.x - d.position.x) * sn + (m.y - d.position.y) * c;
      if (s.mouseClicked && s.player?.isAlive && Math.abs(lx) <= sz.w / 2 && Math.abs(ly) <= sz.h / 2) {
        s.disks.unlock(d.id);
        s.audio.play('sounds/unlock_disk.wav');
        s.notice = { text: s.disks.name(d.id), time: 0 };
        this.disks.splice(this.disks.indexOf(d), 1);
      }
    }
  }

  draw(out: DrawItem[]): void {
    const s = this.s;
    const time = s.clock.time;
    const white: [number, number, number, number] = [1, 1, 1, 1];
    for (const t of this.trainBackgrounds) {
      const r = t.rect;
      out.push({ tex: 'textures/moving_view.png', m: rectM((r.minX + r.maxX) / 2, (r.minY + r.maxY) / 2, r.maxX - r.minX, r.maxY - r.minY), color: white, mode: 7, layer: Layer.BackgroundBehind, order: -10, p: [time * 2.5, 0, 0, 0] });
    }
    for (const f of this.fires) {
      const v = VUURTJES[f.i];
      const sz = s.textureSize(v.tex);
      const frame = Math.floor((time % 1) * v.cols);
      out.push({ tex: v.tex, m: rectM(f.pos.x, f.pos.y, sz.w / v.cols * 2, sz.h * 2), color: white, mode: 4, layer: Layer.BackgroundBehind, order: 2, uv: [frame / v.cols, 0, (frame + 1) / v.cols, 1] });
    }
    if (this.machinistOverlay) {
      const tex = 'textures/backgrounds/background_train_machinist_b.qoi';
      const sz = s.textureSize(tex);
      out.push({ tex, m: rectM(-40, -632, sz.w * BackgroundSizeRatio, sz.h * BackgroundSizeRatio), color: white, mode: 0, layer: Layer.BackgroundBehind, order: 1 });
    }
    if (this.engine) {
      for (const h of this.engine.holes) {
        const size = mul(v2(140, 100), randomFloat(0.8, 1.2));
        const c = add(h.pos, mul(h.normal, size.x / 6));
        out.push({ tex: `textures/engine_spark/spark_${1 + Math.floor(randomFloat(0, 5))}.png`, m: rectM(c.x, c.y, size.x, size.y), color: white, mode: 0, layer: Layer.BackgroundBehind, order: 2 });
      }
      if (!this.engine.exploded) {
        const tex = 'textures/engine_overlay.png';
        const sz = s.textureSize(tex);
        const w = sz.w * BackgroundSizeRatio, h = sz.h * BackgroundSizeRatio;
        // Draw.Quad(topLeft, size): y down from the top left corner
        out.push({ tex, m: rectM(375 * BackgroundSizeRatio + w / 2, 110 * BackgroundSizeRatio - h / 2, w, h), color: [1, 0, 0, 0.5 * clamp(1 - ((time * 2) % 1))], mode: 0, layer: Layer.BackgroundBehind, order: 2 });
      }
    }
    if (this.systems.has('PassingTrainSystem')) this.drawPassingTrain(out);
    if (this.systems.has('DebarkationLevelSystem')) this.drawDebarkation(out);
    if (this.systems.has('ElevatorLevelSystem')) this.drawElevator(out);
    for (const t of this.turrets) {
      const body = 'textures/turrets/default/body.png';
      const head = t.exploded ? 'textures/turrets/default/head_damaged.png' : 'textures/turrets/default/head.png';
      const bs = s.textureSize(body), hs = s.textureSize(head);
      // Draw.TransformMatrix = translate(position) * rotate(-angle around position); quads in that space (y up)
      const base = mmul(translation(t.position.x, t.position.y), rotation(-t.angle, t.position));
      out.push({ tex: body, m: mmul(rectM(0, 0, bs.w, bs.h), base), color: white, mode: 0, layer: t.layer, order: t.order });
      const th = t.renderedAim + (t.aim - t.renderedAim);
      const hm = mmul(mmul(rotation(th + t.angle), translation(bs.w * 0.5, -6)), base);
      out.push({ tex: head, m: mmul(rectM(hs.w * 0.5 - 85, -3, hs.w, hs.h), hm), color: white, mode: 0, layer: t.layer, order: t.order - 1 });
    }
    for (const d of this.disks) {
      const sz = s.textureSize(d.texture);
      out.push({ tex: d.texture, m: mmul(rectM(d.position.x, d.position.y, sz.w, sz.h), rotation(-d.angle, d.position)), color: white, mode: 0, layer: d.layer, order: d.order });
    }
  }

  private drawPassingTrain(out: DrawItem[]): void {
    const s = this.s;
    const lb = s.level.levelBounds;
    const car = s.textureSize('textures/transportation_wagon.qoi');
    const ratio = BackgroundSizeRatio;
    const area = rect(lb.minX - car.w * ratio, lb.minY, lb.maxX + car.w * ratio, lb.minY + (car.h - 236) * ratio);
    const w = area.maxX - area.minX;
    const left = v2(area.minX, (area.maxY + area.minY) / 2);
    const offset = this.passingTrain.time * w - w;
    const carW = w / 5;
    for (let i = 0; i < 5; i++) {
      const x = left.x + ((offset - i * carW) % w);
      out.push({ tex: 'textures/transportation_wagon.qoi', m: rectM(x, left.y, car.w * ratio, car.h * ratio), color: [1, 1, 1, 1], mode: 0, layer: 0, order: 0 });
    }
    if (offset < w) out.push({ tex: 'textures/transportation_locomotive.qoi', m: rectM(left.x + offset + carW, left.y, car.w * ratio, car.h * ratio), color: [1, 1, 1, 1], mode: 0, layer: 0, order: 0 });
  }

  private drawDebarkation(out: DrawItem[]): void {
    const s = this.s;
    const scale = 1.5 * BackgroundSizeRatio;
    const b = s.level.levelBounds;
    const progress = Easings.cubicOut(clamp(this.debarkation));
    const p = mapRange(0, 1, 0, (b.maxX - b.minX) * 3, progress);
    const loco = s.textureSize('textures/transportation_locomotive.qoi');
    const wag = s.textureSize('textures/transportation_wagon.qoi');
    const lw = loco.w * scale, lh = loco.h * scale, ww = wag.w * scale, wh = wag.h * scale;
    const off = p + b.minX - lw * 0.5;
    const lc = v2(off, b.minY + lh * 0.5 - 500);
    const wc = v2(off - lw + 185, b.minY + wh * 0.5 - 500);
    const L = Layer.BackgroundInFront;
    out.push({ tex: 'textures/transportation_locomotive.qoi', m: rectM(lc.x, lc.y, lw, lh), color: [1, 1, 1, 1], mode: 0, layer: L, order: 100 });
    for (let i = 0; i < 3; i++) out.push({ tex: 'textures/transportation_wagon.qoi', m: rectM(wc.x - ww * i, wc.y, ww, wh), color: [1, 1, 1, 1], mode: 0, layer: L, order: 100 });
    const fire = s.props.find((q) => q.tag === 5002);
    if (fire) fire.pos = add(lc, v2(-650, 1015));
  }

  private drawElevator(out: DrawItem[]): void {
    const s = this.s;
    const e = this.elevator;
    const scale = BackgroundSizeRatio;
    const magic = 107;
    const vo = Math.max(e.verticalOffset, 0);
    const gf = 'textures/backgrounds/background_elevator.qoi';
    const pl = 'textures/backgrounds/background_elevator_platform.qoi';
    const lp = 'textures/backgrounds/background_elevator_looping.qoi';
    const g = s.textureSize(gf), ps = s.textureSize(pl), ls = s.textureSize(lp);
    const W = [1, 1, 1, 1] as [number, number, number, number];
    const BB = Layer.BackgroundBehind, BF = Layer.BackgroundInFront;
    out.push({ tex: gf, m: rectM(magic, 2332 - vo, g.w * scale, g.h * scale), color: W, mode: 1, layer: BB, order: 1 });
    out.push({ tex: gf, m: rectM(magic, 2332 - vo, g.w * scale, g.h * scale), color: W, mode: 2, layer: BF, order: 1 });
    const bounds = s.level.levelBounds.maxY - s.level.levelBounds.minY;
    const ay = 2332 - ((vo + g.h * scale) % bounds);
    const lw = ls.w * scale, lh = ls.h * scale + 4;
    if (vo > g.h * scale) out.push({ tex: lp, m: rectM(magic, ay + 2, lw, lh), color: W, mode: 0, layer: BB, order: 1 });
    out.push({ tex: lp, m: rectM(magic, ay + 2 + ls.h * scale, lw, lh), color: W, mode: 0, layer: BB, order: 1 });
    for (const d of e.details) {
      if (!d.visible) continue;
      const ds = s.textureSize(d.tex);
      const sx = ds.w * scale, sy = ds.h * scale;
      const x = d.right ? (ls.w / 2 - d.x) * scale - sx : (-ls.w / 2 + d.x) * scale;
      const vv = d.pos - g.h * scale - sy;
      if (vv > bounds + sy) d.visible = false;
      // Rect(0,0,s) translated: min corner at (x + magic, lh/2 + sy - vv)
      const minX = x + magic, minY = ls.h / 2 * scale + sy - vv;
      out.push({ tex: d.tex, m: rectM(minX + sx / 2, minY + sy / 2, sx, sy), color: W, mode: 0, layer: BB, order: 1 });
    }
    out.push({ tex: pl, m: rectM(107, 1358, ps.w * scale, ps.h * scale), color: W, mode: 1, layer: BB, order: 2 });
    out.push({ tex: pl, m: rectM(107, 1358, ps.w * scale, ps.h * scale), color: W, mode: 2, layer: BF, order: 2 });
  }
}

/** Utilities.RandomVector2: a random direction */
export function randomVector2(): Vec2 { return v2(randomFloat(-1, 1), randomFloat(-1, 1)); }
export { scaling, lerp };
