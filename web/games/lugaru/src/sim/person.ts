// One Lugaru character: movement, the original's animation states, the attacks of
// Source/Objects/Person.cpp and a compact version of its AI (Source/Objects/Person::doAI).
import { type Vec3, vec3, vadd, vsub, normalize, distsqflat, distance, stepToward, roughDirectionTo } from '../data/math.ts';
import type { HeightMap } from '../data/heightmap.ts';
import { heightAt } from '../data/heightmap.ts';
import type { MapData, MapPlayer } from '../data/map.ts';
import type { AnimationData } from '../data/animation.ts';
import type { Joint, SkeletonData } from '../data/skeleton.ts';
import type { SolidModel } from '../data/model.ts';
import type { BakedVertex } from '../data/skin.ts';
import { AnimationPlayer } from './animation-player.ts';
import { ATTACKS, attackDamage, heightMatches, type AttackDef } from './combat.ts';
import type { CreatureData } from './creatures.ts';

export type AiType = 'passive' | 'guard' | 'search' | 'attack' | 'attackCutoff' | 'getHelp' | 'getWeapon' | 'pathfind';
export type PersonState = 'idle' | 'run' | 'walk' | 'crouch' | 'sneak' | 'attack' | 'jump' | 'land' | 'down' | 'dead' | 'sit' | 'sleep';

export interface Collider {
  position: Vec3;
  radius: number;
  height: number;
}

export interface WorldLike {
  heightmap: HeightMap;
  map: MapData;
  persons: Person[];
  player: Person;
  objects: Collider[];
  time: number;
  sound(name: string, at: Vec3, gain?: number): void;
  blood(at: Vec3, amount: number): void;
}

export interface PersonInput {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  crouch: boolean;
  attack: boolean;
  draw: boolean;
  throw: boolean;
  cameraYaw: number;
  attackPressed: boolean;
  jumpPressed: boolean;
  crouchPressed: boolean;
}

export interface PersonInit {
  id: number;
  creature: 0 | 1;
  data: CreatureData;
  mapPlayer: MapPlayer;
  animations: (id: string) => AnimationData;
  hostile: boolean;
}

const RUN_ANIM: Record<string, string> = {
  rabbit: 'runanim',
  wolf: 'wolfrunanim',
};
const IDLE_ANIM: Record<string, string> = {
  rabbit: 'bounceidleanim',
  wolf: 'wolfidle',
};
const FIGHT_IDLE_ANIM: Record<string, string> = {
  rabbit: 'fightidleanim',
  wolf: 'wolfidle',
};
const CROUCH_ANIM: Record<string, string> = {
  rabbit: 'crouchanim',
  wolf: 'wolfcrouchanim',
};
const SNEAK_ANIM: Record<string, string> = {
  rabbit: 'sneakanim',
  wolf: 'wolfcrouchanim',
};
const LAND_ANIM: Record<string, string> = {
  rabbit: 'landanim',
  wolf: 'wolflandanim',
};
const LAND_HARD_ANIM: Record<string, string> = {
  rabbit: 'landhardanim',
  wolf: 'wolflandhardanim',
};
const DOWN_ANIM: Record<string, string> = {
  rabbit: 'dyinganim',
  wolf: 'dyinganim',
};
const DEAD_ANIM: Record<string, string> = {
  rabbit: 'dead1anim',
  wolf: 'dead1anim',
};

const weaponAnim = (weapon: number, attack: AttackDef): string => {
  if (weapon === 1) return attack.id === 'sneakPunch' ? 'knifesneakattackanim' : 'knifeslashstartanim';
  if (weapon === 2) return attack.id === 'sneakPunch' ? 'swordsneakattackanim' : 'swordslashanim';
  if (weapon === 3) return 'staffhitanim';
  return attack.anim;
};

/** Person::DoDamage and the regeneration at the end of Person::DoStuff. */
export class Person {
  readonly id: number;
  readonly kind: 'rabbit' | 'wolf';
  readonly data: CreatureData;
  readonly skeleton: SkeletonData;
  readonly model: SolidModel;
  readonly baked: BakedVertex[];
  readonly animations: (id: string) => AnimationData;
  readonly mapPlayer: MapPlayer;

  coords: Vec3;
  yaw: number;
  targetYaw: number;
  facing: Vec3 = vec3(0, 0, -1);
  velocity: Vec3 = vec3();
  scale: number;
  power: number;
  speedMult: number;
  creaturePower: number;
  damageTolerance: number;
  protection = { head: 1, high: 1, low: 1 };
  armor = { head: 1, high: 1, low: 1 };
  metal = { head: false, high: false, low: false };
  damage = 0;
  permanentDamage = 0;
  superPermanentDamage = 0;
  dead = 0;
  down = false;
  downTimer = 0;
  crouching = false;
  grounded = true;
  jumping = false;
  jumpPower = 5;
  state: PersonState = 'idle';
  aiType: AiType = 'passive';
  target: Person | null = null;
  lastSeen: Vec3 | null = null;
  aiTimer = 0;
  attack: AttackDef | null = null;
  attackHit = false;
  attackCooldown = 0;
  attackQueued = false;
  attackTime = 0;
  reversalCooldown = 0;
  hurtTimer = 0;
  bloodLoss = 0;
  sitting = false;
  sleeping = false;
  immobile = false;
  weapons: number[] = [];
  activeWeapon = -1;
  drawTimer = 0;
  lastStep = 0;
  waypoint = 0;
  waypoints: [number, number, number][] = [];
  patrolWait = 0;
  landingTimer = 0;
  private anim: AnimationPlayer;

  constructor(init: PersonInit) {
    this.id = init.id;
    this.kind = init.data.kind;
    this.data = init.data;
    this.skeleton = init.data.skeleton;
    this.model = init.data.model;
    this.baked = init.data.baked;
    this.animations = init.animations;
    this.mapPlayer = init.mapPlayer;
    const p = init.mapPlayer;
    this.coords = vec3(p.coords[0], p.coords[1], p.coords[2]);
    this.yaw = p.yaw ?? 0;
    this.targetYaw = this.yaw;
    this.scale = p.scale ?? init.data.defaultScale;
    this.power = p.power ?? 1;
    this.speedMult = p.speedmult ?? 1;
    this.creaturePower = init.data.power;
    this.damageTolerance = init.data.damageTolerance;
    this.protection = {
      head: p.protection?.head ?? 1,
      high: p.protection?.high ?? 1,
      low: p.protection?.low ?? 1,
    };
    this.armor = {
      head: p.armor?.head ?? 1,
      high: p.armor?.high ?? 1,
      low: p.armor?.low ?? 1,
    };
    this.metal = {
      head: p.metal?.head ?? false,
      high: p.metal?.high ?? false,
      low: p.metal?.low ?? false,
    };
    this.weapons = (p.weapons ?? []).filter((w) => w >= 1 && w <= 3);
    this.activeWeapon = this.weapons.length ? 0 : -1;
    this.waypoints = (p.waypoints ?? []).map((w) => {
      const v = Array.isArray(w) ? w : w.pos;
      return [v[0], v[1], v[2]] as [number, number, number];
    });
    this.waypoint = p.waypoint ?? 0;
    this.sitting = p.howactive === 1 || p.howactive === 2;
    this.sleeping = p.howactive === 3;
    this.immobile = !!p.immobile;
    this.dead = (p.howactive ?? 0) >= 4 ? 2 : 0;
    this.aiType = init.hostile && !this.sitting && !this.sleeping ? 'attackCutoff' : 'passive';
    this.anim = new AnimationPlayer(this.animations, this.sitting ? 'sitanim' : this.sleeping ? 'sleepanim' : this.dead ? 'dead1anim' : IDLE_ANIM[this.kind]);
    this.facing = vec3(-Math.sin((this.yaw * Math.PI) / 180), 0, -Math.cos((this.yaw * Math.PI) / 180));
  }

  get isPlayer(): boolean {
    return this.id === 0;
  }

  get hasWeapon(): boolean {
    return this.activeWeapon >= 0 && this.activeWeapon < this.weapons.length;
  }

  get weaponType(): number {
    return this.hasWeapon ? this.weapons[this.activeWeapon] : 0;
  }

  get healthFraction(): number {
    return Math.max(0, Math.min(1, 1 - this.damage / this.damageTolerance));
  }

  play(id: string, loop = true, speed = 1, restart = false): void {
    this.anim.play(id, { loop, speed, restart });
  }

  get animationId(): string {
    return this.anim.id;
  }

  get frameLabel(): number {
    return this.anim.label;
  }

  joints(): Joint[] {
    return this.anim.joints(this.skeleton);
  }

  get currentAnimation(): AnimationData {
    return this.anim.animation;
  }

  /** Source/Objects/Person.cpp Person::DoDamage. */
  takeDamage(amount: number, attacker?: Person, at?: Vec3, world?: WorldLike): void {
    if (this.dead >= 2 || amount <= 0) return;
    this.damage += amount;
    this.permanentDamage += amount / 2;
    this.superPermanentDamage += amount / 4;
    this.hurtTimer = 0.35;
    this.sleeping = false;
    this.sitting = false;
    if (this.aiType === 'passive' && attacker && attacker !== this) this.aiType = 'attackCutoff';
    if (attacker) this.target = attacker;
    if (amount > 50 || this.damage > this.damageTolerance * 0.5) {
      this.play(this.kind === 'wolf' ? 'staggerbackhardanim' : 'staggerbackhighanim', false, 1.2, true);
    }
    if (this.damage > this.damageTolerance && !this.down) {
      this.down = true;
      this.downTimer = 0;
      this.state = 'down';
      this.play(DOWN_ANIM[this.kind], true, 1, true);
    }
    if (this.permanentDamage > this.damageTolerance) {
      this.dead = 2;
      this.down = false;
      this.state = 'dead';
      this.play(DEAD_ANIM[this.kind], true, 1, true);
    }
    if (at && world) world.blood(at, Math.min(1, amount / 60));
  }

  /** A hit that the victim reverses (crouch under a high attack). */
  reverse(attacker: Person, def: AttackDef, world: WorldLike): void {
    if (this.reversalCooldown > 0) return;
    this.reversalCooldown = 0.8;
    const rev = def.kind === 'weapon'
      ? (this.weaponType === 2 ? ATTACKS.swordReversal : this.weaponType === 1 ? ATTACKS.knifeReversal : ATTACKS.staffReversal)
      : def.kind === 'sweep' ? ATTACKS.sweepReversal : def.kind === 'kick' ? ATTACKS.kickReversal : ATTACKS.punchReversal;
    this.attack = rev;
    this.attackHit = false;
    this.attackTime = 0;
    this.attackCooldown = 0.2;
    this.play(rev.anim, false, 1.2, true);
    this.state = 'attack';
    world.sound('Whoosh', this.coords, 0.7);
    // The reversal's damage is applied by the normal attack update on its label.
    this.target = attacker;
  }

  /** Pick the player's attack from the current context, as Person::doAttacks does. */
  chooseAttack(): AttackDef {
    if (this.crouching) {
      if (this.weaponType === 2) return ATTACKS.swordGroundStab;
      if (this.weaponType === 1) return ATTACKS.crouchStab;
      return ATTACKS.sweep;
    }
    if (this.weaponType === 2) return ATTACKS.swordSlash;
    if (this.weaponType === 1) return ATTACKS.knifeSlash;
    if (this.weaponType === 3) return ATTACKS.staffHit;
    if ((this.state === 'run' || this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z > 25) && !this.crouching) return ATTACKS.spinKick;
    return ATTACKS.punch;
  }

  startAttack(def: AttackDef): void {
    if (this.attack || this.attackCooldown > 0 || this.down || this.dead) return;
    this.attack = def;
    this.attackHit = false;
    this.attackTime = 0;
    this.state = 'attack';
    this.play(weaponAnim(this.weaponType, def), false, 1.15, true);
  }

  update(dt: number, world: WorldLike, input?: PersonInput): void {
    if (this.dead) {
      this.state = 'dead';
      this.anim.update(dt);
      return;
    }
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.landingTimer = Math.max(0, this.landingTimer - dt);
    this.reversalCooldown = Math.max(0, this.reversalCooldown - dt);
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.bloodLoss = Math.max(0, this.bloodLoss - dt * 0.3);
    this.anim.update(dt);

    if (this.down) {
      this.downTimer += dt;
      if (this.damage < this.damageTolerance && this.permanentDamage < this.damageTolerance && this.downTimer > 1.2) {
        this.down = false;
        this.state = 'idle';
        this.play(this.kind === 'wolf' ? 'wolfidle' : 'getupfrombackanim', false, 1.1, true);
      } else {
        return;
      }
    }

    // health regeneration, Source/Objects/Person.cpp
    if (this.damage > 0 || this.permanentDamage > 0) {
      if (!this.down) this.damage = Math.max(this.permanentDamage, this.damage - dt * 13);
      this.permanentDamage = Math.max(this.superPermanentDamage, this.permanentDamage - dt * (this.state === 'idle' || this.state === 'crouch' ? 8 : 4));
      if (this.damage < this.permanentDamage) this.damage = this.permanentDamage;
      if (this.permanentDamage > this.damageTolerance) {
        this.dead = 2;
        this.state = 'dead';
        this.play(DEAD_ANIM[this.kind], true, 1, true);
        return;
      }
    }

    if (this.sitting || this.sleeping) {
      this.state = this.sleeping ? 'sleep' : 'sit';
      this.play(this.sleeping ? 'sleepanim' : 'sitanim', true, 1, false);
      return;
    }

    if (this.attack) {
      this.updateAttack(dt, world);
      if (this.attack) return;
    }

    const desired = this.isPlayer && input ? this.playerDesired(input) : this.aiDesired(dt, world);
    const moving = desired.x !== 0 || desired.z !== 0;
    const wantCrouch = this.isPlayer ? !!input?.crouch : this.aiType === 'search' && Math.random() < 0.2;

    if (this.isPlayer && input) {
      if (input.attackPressed) this.attackQueued = true;
      if (this.attackQueued && !this.attack) {
        this.attackQueued = false;
        const def = this.chooseAttack();
        // A crouched attack from behind is a stealth kill.
        if (this.crouching) {
          const victim = this.nearestVictim(world, 1.8, true);
          if (victim && this.isBehind(victim)) {
            this.startAttack(this.weaponType === 2 ? ATTACKS.sneakSword : this.weaponType === 1 ? ATTACKS.sneakKnife : ATTACKS.sneakPunch);
          } else {
            this.startAttack(def);
          }
        } else {
          this.startAttack(def);
        }
      }
      if (input.jumpPressed && this.grounded) this.jump();
      if (input.draw) this.drawWeapon();
      if (input.throw) this.throwWeapon(world);
    } else {
      this.aiCombat(world);
    }
    if (this.attack) return;

    this.crouching = wantCrouch && this.grounded && !this.attack;
    if (!this.grounded) {
      this.state = 'jump';
      this.play(this.velocity.y >= 0 ? 'jumpupanim' : 'jumpdownanim', true, 1);
    } else if (this.landingTimer > 0) {
      this.state = 'land';
      this.play(LAND_ANIM[this.kind], false, 1.2);
    } else if (moving) {
      if (this.crouching) {
        this.state = 'sneak';
        this.play(SNEAK_ANIM[this.kind], true, 1);
      } else if (!this.isPlayer && (this.aiType === 'passive' || this.aiType === 'guard')) {
        this.state = 'walk';
        this.play(this.kind === 'wolf' ? 'wolfrunanim' : 'walkanim', true, 1);
      } else {
        this.state = 'run';
        this.play(RUN_ANIM[this.kind], true, 1);
      }
    } else if (this.crouching) {
      this.state = 'crouch';
      this.play(CROUCH_ANIM[this.kind], true, 1);
    } else {
      this.state = 'idle';
      this.play(this.aiType === 'attackCutoff' || this.aiType === 'attack' ? FIGHT_IDLE_ANIM[this.kind] : IDLE_ANIM[this.kind], true, 1);
    }

    this.move(dt, desired, world);
    this.updateFacing(dt, moving ? desired : null);
  }

  private playerDesired(input: PersonInput): Vec3 {
    const yaw = (input.cameraYaw * Math.PI) / 180;
    const forward = vec3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = vec3(Math.cos(yaw), 0, -Math.sin(yaw));
    let d = vec3();
    if (input.forward) d = vadd(d, forward);
    if (input.back) d = vsub(d, forward);
    if (input.right) d = vadd(d, right);
    if (input.left) d = vsub(d, right);
    return normalize(d);
  }

  private aiDesired(dt: number, world: WorldLike): Vec3 {
    if (this.immobile && this.aiType === 'passive') return vec3();
    if (this.aiType === 'passive') return vec3();
    const player = world.player;
    const target = this.target ?? player;
    if (!this.target && this.aiType !== 'attackCutoff' && this.aiType !== 'attack') {
      // patrol along the original waypoints
      if (this.waypoints.length > 0) {
        const wp = this.waypoints[this.waypoint % this.waypoints.length];
        const at = vec3(wp[0], wp[1], wp[2]);
        if (distsqflat(this.coords, at) < 1.5) {
          this.waypoint++;
          this.patrolWait = 0.8;
        }
        if (this.patrolWait > 0) {
          this.patrolWait -= dt;
          return vec3();
        }
        return normalize(vsub(at, this.coords));
      }
      return vec3();
    }
    const d2 = distsqflat(this.coords, target.coords);
    if (this.aiType === 'search' && this.lastSeen) {
      if (distsqflat(this.coords, this.lastSeen) < 1.5) {
        this.aiType = 'guard';
        this.lastSeen = null;
        return vec3();
      }
      return normalize(vsub(this.lastSeen, this.coords));
    }
    if (d2 < 2.2 * 2.2) return vec3();
    if (d2 > 30 * 30) {
      this.aiType = 'search';
      this.lastSeen = { ...target.coords };
      return normalize(vsub(target.coords, this.coords));
    }
    return normalize(vsub(target.coords, this.coords));
  }

  private aiCombat(world: WorldLike): void {
    if (this.aiType === 'passive' || this.aiType === 'guard') {
      // become aware when the player is close and visible
      const d2 = distsqflat(this.coords, world.player.coords);
      if (d2 < 20 * 20 && this.canSee(world, world.player)) {
        this.aiType = 'attack';
        this.target = world.player;
      }
      return;
    }
    if (this.aiType === 'search') {
      if (this.lastSeen && distsqflat(this.coords, this.lastSeen) < 1.5) {
        this.aiType = 'guard';
        this.lastSeen = null;
      }
      return;
    }
    if (this.aiType === 'getHelp') {
      this.aiType = 'attack';
      return;
    }
    const target = this.target ?? world.player;
    const d2 = distsqflat(this.coords, target.coords);
    if (d2 > 30 * 30 || target.dead) {
      this.aiType = 'search';
      this.lastSeen = { ...target.coords };
      return;
    }
    if (!this.canSee(world, target)) {
      this.lastSeen = { ...target.coords };
      this.aiType = 'search';
      return;
    }
    this.target = target;
    if (d2 < 1.9 * 1.9 && this.attackCooldown <= 0 && !this.attack) {
      // The original's decision is context-sensitive: a crouched player is swept, a
      // standing one is punched or kicked, a weapon user uses the weapon.
      let def: AttackDef;
      if (target.crouching) {
        def = this.weaponType === 3 ? ATTACKS.staffGroundSmash : this.weaponType === 2 ? ATTACKS.swordGroundStab : ATTACKS.sweep;
      } else if (this.weaponType === 2) def = ATTACKS.swordSlash;
      else if (this.weaponType === 1) def = ATTACKS.knifeSlash;
      else if (this.weaponType === 3) def = ATTACKS.staffHit;
      else def = Math.random() < 0.45 ? ATTACKS.spinKick : ATTACKS.punch;
      this.startAttack(def);
      this.attackCooldown = 0.7 + Math.random() * 0.5;
    }
  }

  private updateAttack(dt: number, world: WorldLike): void {
    const def = this.attack!;
    this.attackTime += dt;
    if (this.attackTime > 3) {
      this.attack = null;
      this.state = 'idle';
      return;
    }
    if (!this.attackHit && this.anim.label >= def.label) {
      this.attackHit = true;
      const victim = this.nearestVictim(world, this.scale * 5 * Math.sqrt(def.rangeFactor), false);
      if (victim && heightMatches(def, victim) && this.facingDot(victim) > 0) {
        if (victim.crouching && def.kind !== 'sweep' && def.kind !== 'sneak' && Math.random() < 0.55) {
          victim.reverse(this, def, world);
        } else {
          const dmg = def.kind === 'sneak' ? 10000 : attackDamage(this, victim, def);
          victim.takeDamage(dmg, this, victim.coords, world);
          if (def.sound) world.sound(def.sound, victim.coords, 0.9);
        }
      }
    }
    if (this.anim.done) {
      this.attack = null;
      this.attackCooldown = Math.max(this.attackCooldown, 0.12);
      this.state = 'idle';
      this.play(this.aiType === 'attackCutoff' ? FIGHT_IDLE_ANIM[this.kind] : IDLE_ANIM[this.kind], true, 1);
    }
  }

  private nearestVictim(world: WorldLike, range: number, behindOnly: boolean): Person | null {
    let best: Person | null = null;
    let bestD = range * range;
    for (const p of world.persons) {
      if (p === this || p.dead || p.down) continue;
      if (this.id === 0 && p.id === 0) continue;
      const d = distsqflat(this.coords, p.coords);
      if (d < bestD && (!behindOnly || this.isBehind(p))) {
        best = p;
        bestD = d;
      }
    }
    return best;
  }

  private isBehind(p: Person): boolean {
    // the other character's facing points away from us
    const dx = this.coords.x - p.coords.x;
    const dz = this.coords.z - p.coords.z;
    return p.facing.x * dx + p.facing.z * dz > 0.2;
  }

  private facingDot(p: Person): number {
    return this.facing.x * (p.coords.x - this.coords.x) + this.facing.z * (p.coords.z - this.coords.z);
  }

  private canSee(world: WorldLike, other: Person): boolean {
    if (this.sleeping) return false;
    const d = distance(this.coords, other.coords);
    if (d > 30) return false;
    const dx = (other.coords.x - this.coords.x) / Math.max(1, d);
    const dz = (other.coords.z - this.coords.z) / Math.max(1, d);
    for (let t = 2; t < d; t += 2) {
      const x = this.coords.x + dx * t;
      const z = this.coords.z + dz * t;
      const y = this.coords.y + (other.coords.y - this.coords.y) * (t / d);
      if (heightAt(world.heightmap, x, z) > y + 1.2) return false;
      for (const o of world.objects) {
        if (o.height > 1.5 && (o.position.x - x) ** 2 + (o.position.z - z) ** 2 < o.radius * o.radius) return false;
      }
    }
    return true;
  }

  private jump(): void {
    if (!this.grounded) return;
    this.velocity.y = this.crouching ? 7 : 5;
    this.grounded = false;
    this.jumping = true;
    this.jumpPower = 5;
    this.state = 'jump';
    this.play('jumpupanim', false, 1, true);
    this.coords.y += 0.2;
  }

  private throwWeapon(world: WorldLike): void {
    if (!this.hasWeapon || this.attack) return;
    const type = this.weaponType;
    const victim = this.nearestVictim(world, 12, false);
    if (victim && this.facingDot(victim) > 0) {
      const def = type === 2 ? ATTACKS.swordSlash : ATTACKS.knifeSlash;
      victim.takeDamage(attackDamage(this, victim, def) * 0.7, this, victim.coords, world);
      world.sound('KnifeSlice', victim.coords, 0.8);
    }
    world.sound('KnifeSwish', this.coords, 0.7);
    this.weapons.splice(this.activeWeapon, 1);
    if (this.weapons.length === 0) this.activeWeapon = -1;
    else if (this.activeWeapon >= this.weapons.length) this.activeWeapon = 0;
    this.play('knifethrowanim', false, 1.2, true);
    this.attackCooldown = 0.4;
  }

  private drawWeapon(): void {
    if (this.weapons.length < 2) return;
    this.activeWeapon = (this.activeWeapon + 1) % this.weapons.length;
    this.play('drawrightanim', false, 1.2, true);
  }

  private move(dt: number, desired: Vec3, world: WorldLike): void {
    const moving = desired.x !== 0 || desired.z !== 0;
    let speed = 0;
    if (moving) {
      if (this.crouching) speed = 2.2 * this.speedMult;
      else if (!this.isPlayer && (this.aiType === 'passive' || this.aiType === 'guard')) speed = 3.2 * this.speedMult;
      else speed = (this.kind === 'wolf' ? 14 : 10.5) * this.speedMult;
    }
    const targetVx = desired.x * speed;
    const targetVz = desired.z * speed;
    const accel = this.grounded ? 14 : 5;
    this.velocity.x += (targetVx - this.velocity.x) * Math.min(1, accel * dt);
    this.velocity.z += (targetVz - this.velocity.z) * Math.min(1, accel * dt);
    if (!moving && this.grounded) {
      this.velocity.x *= Math.max(0, 1 - 12 * dt);
      this.velocity.z *= Math.max(0, 1 - 12 * dt);
    }

    if (!this.grounded) {
      this.velocity.y -= 24 * dt;
      if (this.velocity.y < -30) this.velocity.y = -30;
    }
    const next = vec3(this.coords.x + this.velocity.x * dt, this.coords.y + this.velocity.y * dt, this.coords.z + this.velocity.z * dt);
    // object collision: push out of the collider's horizontal circle
    for (const o of world.objects) {
      if (o.height < 0.5) continue;
      const dx = next.x - o.position.x;
      const dz = next.z - o.position.z;
      const d = Math.hypot(dx, dz);
      const r = o.radius + this.scale * 2.2;
      if (d < r && d > 1e-6 && next.y < o.position.y + o.height) {
        next.x = o.position.x + (dx / d) * r;
        next.z = o.position.z + (dz / d) * r;
        this.velocity.x *= 0.2;
        this.velocity.z *= 0.2;
      }
    }
    // terrain bounds
    const max = 255 * 6;
    next.x = Math.max(2, Math.min(max - 2, next.x));
    next.z = Math.max(2, Math.min(max - 2, next.z));
    const ground = heightAt(world.heightmap, next.x, next.z);
    if (next.y <= ground + 0.01) {
      if (!this.grounded && this.velocity.y < -6) {
        this.state = 'land';
        this.landingTimer = 0.4;
        this.play(this.velocity.y < -11 ? LAND_HARD_ANIM[this.kind] : LAND_ANIM[this.kind], false, 1.2, true);
      }
      next.y = ground;
      this.velocity.y = 0;
      this.grounded = true;
      this.jumping = false;
    } else {
      this.grounded = false;
      if (this.velocity.y < 0 && this.anim.id !== 'jumpdownanim' && this.state === 'jump') this.play('jumpdownanim', false, 1, false);
    }
    this.coords = next;
    // footstep sounds at the original's labels (1/2/3/8)
    if (this.grounded && moving) {
      const label = this.anim.label;
      if (label >= 1 && label <= 4 && this.lastStep !== label) {
        this.lastStep = label;
        const env = world.map.map.environment;
        const name = env === 1
          ? (label % 2 ? 'FootStepGrass1' : 'FootStepGrass2')
          : (label % 2 ? 'FootStepSnow1' : 'FootStepSnow2');
        world.sound(name, this.coords, this.crouching ? 0.15 : 0.45);
      }
    } else {
      this.lastStep = 0;
    }
  }

  private updateFacing(dt: number, desired: Vec3 | null): void {
    if (desired) {
      this.targetYaw = (Math.atan2(-desired.x, -desired.z) * 180) / Math.PI;
    } else if (this.attack && this.target) {
      this.targetYaw = roughDirectionTo(this.coords, this.target.coords);
    }
    let diff = this.targetYaw - this.yaw;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    this.yaw = stepToward(this.yaw, this.yaw + diff, 540 * dt);
    this.facing = normalize(vec3(-Math.sin((this.yaw * Math.PI) / 180), 0, -Math.cos((this.yaw * Math.PI) / 180)));
  }

  /** The local forward vector, for the renderer and tests. */
  get localForward(): Vec3 {
    return vec3(-Math.sin((this.yaw * Math.PI) / 180), 0, -Math.cos((this.yaw * Math.PI) / 180));
  }

  /** Kept for the renderer: tilt and lean from the original's DoStuff. */
  get tilt(): number {
    const v = Math.hypot(this.velocity.x, this.velocity.z);
    return Math.max(-25, Math.min(25, v * 1.2 * Math.sign(this.velocity.y || 1)));
  }

}
