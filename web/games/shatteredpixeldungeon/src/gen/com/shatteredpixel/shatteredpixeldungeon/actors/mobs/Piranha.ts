// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Piranha.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J } from '../../../../../../jre/index.ts';
import { Mob } from './Mob.ts';
import { Mob$Sleeping } from './Mob.ts';
import { Mob$Wandering } from './Mob.ts';
import { Mob$Hunting } from './Mob.ts';

let Badges, Dungeon, Statistics, Electricity, Freezing, BlobImmunity, Burning, Levitation, PhantomPiranha, Speck, MysteryMeat, RatSkull, PiranhaSprite, BArray, PathFinder, Random;

export class Piranha extends Mob {
  _Piranha(): this {
    this._Mob();
    this.spriteClass = $J.cls(PiranhaSprite);
    this.baseSpeed = 2;
    this.EXP = 0;
    this.loot = $J.cls(MysteryMeat);
    this.lootChance_ = 1;
    this.SLEEPING = new Piranha$Sleeping().$o(this)._Piranha$Sleeping();
    this.WANDERING = new Piranha$Wandering().$o(this)._Piranha$Wandering();
    this.HUNTING = new Piranha$Hunting().$o(this)._Piranha$Hunting();
    this.state_ = this.SLEEPING;
    for (const $it0 = new BlobImmunity()._BlobImmunity().immunities().iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      if (c !== $J.cls(Electricity) && c !== $J.cls(Freezing)) {
        this.immunities_.add(c);
      }
    }
    this.immunities_.add($J.cls(Burning));
    this.HP = this.HT = (10 + Math.imul(Dungeon.depth, 5)) | 0;
    this.defenseSkill_ = (10 + Math.imul(Dungeon.depth, 2)) | 0;
    return this;
  }
  act(): boolean {
    if (!Dungeon.level.water[this.pos] || this.flying) {
      if (this.sprite_ != null && this.buff($J.cls(Levitation)) != null) {
        this.sprite_.emitter().burst(Speck.factory$int(Speck.JET), 10);
      }
      this.dieOnLand();
      return true;
    } else {
      return super.act();
    }
  }
  damageRoll(): number {
    return Random.NormalIntRange(Dungeon.depth, (4 + Math.imul(Dungeon.depth, 2)) | 0);
  }
  attackSkill(target: Char): number {
    return (20 + Math.imul(Dungeon.depth, 2)) | 0;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, Dungeon.depth)) | 0;
  }
  surprisedBy$Char$boolean(enemy: Char, attacking: boolean): boolean {
    if (enemy === Dungeon.hero && (!attacking || (enemy).canSurpriseAttack())) {
      if (this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length()) {
        this.fieldOfView = $J.newArray(Dungeon.level.length(), false);
        Dungeon.level.updateFieldOfView(this, this.fieldOfView);
      }
      return this.state_ === this.SLEEPING || !this.fieldOfView[enemy.pos] || enemy.invisible > 0;
    }
    return super.surprisedBy$Char$boolean(enemy, attacking);
  }
  dieOnLand(): void {
    this.die(null);
  }
  die(cause: any): void {
    super.die(cause);
    Statistics.piranhasKilled++;
    Badges.validatePiranhasKilled();
  }
  spawningWeight(): number {
    return 0;
  }
  reset(): boolean {
    return true;
  }
  getCloser(target: number): boolean {
    if (this.rooted) {
      return false;
    }
    let step = Dungeon.findStep(this, target, BArray.and(Dungeon.level.water, Dungeon.level.passable, null), this.fieldOfView, true);
    if (step !== -1) {
      this.move$int(step);
      return true;
    } else {
      return false;
    }
  }
  getFurther(target: number): boolean {
    let step = Dungeon.flee(this, target, BArray.and(Dungeon.level.water, Dungeon.level.passable, null), this.fieldOfView, true);
    if (step !== -1) {
      this.move$int(step);
      return true;
    } else {
      return false;
    }
  }
  static random(): Piranha {
    let altChance = Math.fround(Math.fround(1 / 50) * RatSkull.exoticChanceMultiplier$());
    if (Random.Float$() < altChance) {
      return new PhantomPiranha()._PhantomPiranha();
    } else {
      return new Piranha()._Piranha();
    }
  }
}

export class Piranha$Sleeping extends Mob$Sleeping {
  _Piranha$Sleeping(): this {
    this._Mob$Sleeping();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (enemyInFOV) {
      PathFinder.buildDistanceMap$int$booleanArr$int(this.$outer.enemy.pos, Dungeon.level.water, this.$outer.viewDistance);
      enemyInFOV = PathFinder.distance[this.$outer.pos] !== 2147483647;
    }
    return super.act(enemyInFOV, justAlerted);
  }
}

export class Piranha$Wandering extends Mob$Wandering {
  _Piranha$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (enemyInFOV) {
      PathFinder.buildDistanceMap$int$booleanArr$int(this.$outer.enemy.pos, Dungeon.level.water, this.$outer.viewDistance);
      enemyInFOV = PathFinder.distance[this.$outer.pos] !== 2147483647;
    }
    return super.act(enemyInFOV, justAlerted);
  }
}

export class Piranha$Hunting extends Mob$Hunting {
  _Piranha$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (enemyInFOV) {
      PathFinder.buildDistanceMap$int$booleanArr$int(this.$outer.enemy.pos, Dungeon.level.water, this.$outer.viewDistance);
      enemyInFOV = PathFinder.distance[this.$outer.pos] !== 2147483647;
    }
    return super.act(enemyInFOV, justAlerted);
  }
}

$J.define(Piranha, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Piranha' }, meths: { 'surprisedBy(com.shatteredpixel.shatteredpixeldungeon.actors.Char,boolean)': 'surprisedBy$Char$boolean' } });
$J.define(Piranha$Sleeping, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha$Sleeping', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Sleeping', ctors: { '': '_Piranha$Sleeping' }, inner: true });
$J.define(Piranha$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_Piranha$Wandering' }, inner: true });
$J.define(Piranha$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_Piranha$Hunting' }, inner: true });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  BlobImmunity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.BlobImmunity');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Levitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Levitation');
  PhantomPiranha = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.PhantomPiranha');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  MysteryMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat');
  RatSkull = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.RatSkull');
  PiranhaSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.PiranhaSprite');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
