// Madness Interactive Reloaded port (GPL-3.0). The training program's level systems,
// Level/Systems/Tutorial/TeachMoveSystem.cs (TeachMove, TeachPickupShoot, TeachDodge, TeachMelee and TeachSystem's
// instruction boxes); the app draws the instructions.
import type { Character } from './character.ts';
import { v2 } from '../engine/util.ts';
import type { Scene } from './scene.ts';

export type Target = 'Right' | 'Left' | 'Top' | 'Player' | 'Weapon' | 'NPC';
export interface Instruction { key: string; args: string[]; target: Target }

/** the default controls' names, as Walgelijk prints them */
const KEYS = { left: 'A', right: 'D', jump: 'Space', interact: 'E', attack: 'Left mouse button', block: 'Right mouse button', throw: 'F' };

export class Tutorial {
  instructions: Instruction[] = [];
  counter: string | null = null;
  private jumpsDodged = 0;
  private timeMeleeBattle = 0;
  private lastParried: Character | null = null;
  readonly kind: string;
  constructor(kind: string) { this.kind = kind; }

  update(s: Scene, dt: number): void {
    this.instructions = [];
    this.counter = null;
    const p = s.player;
    if (!p || !p.isAlive) return;
    const say = (key: string, target: Target, ...args: string[]): void => { this.instructions.push({ key, args, target }); };
    switch (this.kind) {
      case 'TeachMoveSystem':
        say('tut-move', 'Player', KEYS.left, KEYS.right);
        say('tut-proceed', 'Right');
        break;
      case 'TeachPickupShootSystem':
        if (!p.hasWeaponEquipped) say('tut-pickup', 'Weapon', KEYS.interact); else say('tut-aim-shoot', 'NPC', KEYS.block, KEYS.attack);
        for (const w of s.weapons) w.infiniteAmmo = true;
        break;
      case 'TeachDodgeSystem': this.dodge(s, p, say); break;
      case 'TeachMeleeSystem': this.melee(s, p, dt, say); break;
    }
  }

  private dodge(s: Scene, p: Character, say: (k: string, t: Target, ...a: string[]) => void): void {
    const needed = 2;
    if (s.progress.goalReached) {
      for (const pr of [...s.props]) if (pr.tag === 9005) s.props.splice(s.props.indexOf(pr), 1);
      for (const b of [...s.physics.bodies]) if ((b.owner as { tag?: number })?.tag === 9005) s.physics.remove(b);
      for (const w of s.weapons) if (w.data.weaponType !== 'Melee') { w.infiniteAmmo = false; w.remainingRounds = 0; }
    } else if (this.jumpsDodged >= needed) {
      if (!p.hasWeaponEquipped && s.reg.weapons.has('baseball_bat')) s.equipWeapon(p, s.createWeapon(v2(), s.reg.weapons.get('baseball_bat')!));
      say('tut-perfect-deflect', 'Top', KEYS.block);
      for (const c of s.characters) {
        if (!c.ai) continue;
        c.allowWalking = false;
        if (s.clock.time - s.lastAccurateShotTime > 10) { c.ai.wants.accurateShot.prev = false; c.ai.wants.accurateShot.value = true; }
        if (!c.isAlive) s.forceReachGoal();
      }
    } else {
      if (p.hasWeaponEquipped) { const w = p.equipped!; s.dropWeapon(p); w.removed = true; s.weapons.splice(s.weapons.indexOf(w), 1); }
      say('tut-perfect-shot', 'Top');
      if (this.jumpsDodged === 0) say('tut-jump-dodge', 'Player', KEYS.jump);
      for (const w of s.weapons) { w.remainingRounds = 2000; w.infiniteAmmo = true; }
      // a jump dodge that lasted through a finished accurate shot
      const dodging = !!p.jumpDodge;
      if (dodging && s.accurateShotFinished && p.isAlive && !p.player!.isDoingDyingSequence) { this.jumpsDodged++; s.accurateShotFinished = false; }
      const timePassed = s.clock.sinceSceneChange > 5;
      for (const c of s.characters) {
        if (!c.ai) continue;
        c.allowWalking = false;
        if (c.stats.accurateShotChance < 100) { c.stats = Object.assign(Object.create(Object.getPrototypeOf(c.stats)), c.stats, { accurateShotChance: 200 }); }
        if (s.clock.time - s.lastAccurateShotTime > 5) { c.ai.wants.accurateShot.prev = false; c.ai.wants.accurateShot.value = timePassed; }
      }
      this.counter = `${this.jumpsDodged} / ${needed}`;
    }
  }

  private melee(s: Scene, _p: Character, dt: number, say: (k: string, t: Target, ...a: string[]) => void): void {
    if (s.progress.goalReached) say('tut-finish', 'Top');
    else if (s.progress.bodyCount.current === 0) {
      for (const c of s.characters) {
        if (!c.ai || c.name !== 'victim') continue;
        c.ai.isDocile = true;
        c.allowWalking = false;
        c.positioning.head.health = 0.0001;
        c.positioning.body.health = 0.0001;
      }
      if (!s.weapons.some((w) => w.isAttachedToWall) && s.reg.weapons.has('baseball_bat')) {
        const w = s.createWeapon(v2(-1450, -282), s.reg.weapons.get('baseball_bat')!);
        w.isAttachedToWall = true;
        w.transform.rotation = -11;
        w.transform.recalc();
      }
      say('tut-throw-1', 'Top');
      say('tut-throw-2', 'NPC', KEYS.throw);
    } else {
      this.timeMeleeBattle += dt;
      s.spawner.enabled = this.timeMeleeBattle > 5;
      say('tut-melee', 'Top', KEYS.attack, KEYS.block);
      say('tut-parry', 'NPC', KEYS.attack, KEYS.block);
      for (const c of s.characters) {
        if (!c.ai) continue;
        if (c.animations.some((a) => a.animation.name.includes('melee_stun_sword'))) this.lastParried = c;
        else if (c === this.lastParried) this.lastParried = null;
        if (c === this.lastParried && !c.isAlive) s.forceReachGoal();
      }
    }
  }
}
