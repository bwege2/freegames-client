// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/RipperDemon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';
import { Mob } from './Mob.ts';
import { Mob$Hunting } from './Mob.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Property, Bleeding, Buff, Light, Pushing, Ballistica, Messages, GameScene, CharSprite, RipperSprite, GLog, Sample, GameMath, PathFinder, Random;

export class RipperDemon extends Mob {
  static readonly LAST_ENEMY_POS: string = 'last_enemy_pos';
  static readonly LEAP_POS: string = 'leap_pos';
  static readonly LEAP_CD: string = 'leap_cd';
  lastEnemyPos: number = 0;
  leapPos: number = 0;
  leapCooldown: number = 0;
  _RipperDemon(): this {
    this._Mob();
    this.spriteClass = $J.cls(RipperSprite);
    this.HP = this.HT = 60;
    this.defenseSkill_ = 22;
    this.viewDistance = Light.DISTANCE;
    this.EXP = 9;
    this.maxLvl = -2;
    this.HUNTING = new RipperDemon$Hunting().$o(this)._RipperDemon$Hunting();
    this.baseSpeed = 1;
    this.properties_.add(Char$Property.DEMONIC);
    this.properties_.add(Char$Property.UNDEAD);
    this.lastEnemyPos = -1;
    this.leapPos = -1;
    this.leapCooldown = 0;
    return this;
  }
  spawningWeight(): number {
    return 0;
  }
  damageRoll(): number {
    return Random.NormalIntRange(15, 25);
  }
  attackSkill(target: Char): number {
    return 30;
  }
  attackDelay(): number {
    return Math.fround(super.attackDelay() * 0.5);
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 4)) | 0;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(RipperDemon.LAST_ENEMY_POS, this.lastEnemyPos);
    bundle.put$String$int(RipperDemon.LEAP_POS, this.leapPos);
    bundle.put$String$float(RipperDemon.LEAP_CD, this.leapCooldown);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.lastEnemyPos = bundle.getInt(RipperDemon.LAST_ENEMY_POS);
    this.leapPos = bundle.getInt(RipperDemon.LEAP_POS);
    this.leapCooldown = bundle.getFloat(RipperDemon.LEAP_CD);
  }
  act(): boolean {
    if (this.state_ === this.WANDERING) {
      this.leapPos = -1;
    }
    let lastState = this.state_;
    let result = super.act();
    if (this.paralysed <= 0) {
      this.leapCooldown--;
    }
    if (!(lastState === this.WANDERING && this.state_ === this.HUNTING)) {
      if (this.enemy != null) {
        this.lastEnemyPos = this.enemy.pos;
      } else {
        this.lastEnemyPos = Dungeon.hero.pos;
      }
    }
    return result;
  }
}

export class RipperDemon$Hunting extends Mob$Hunting {
  _RipperDemon$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (this.$outer.leapPos !== -1) {
      this.$outer.leapCooldown = Math.fround(Random.NormalIntRange(2, 4));
      if (this.$outer.rooted) {
        this.$outer.leapPos = -1;
        return true;
      }
      let b = new Ballistica()._Ballistica(this.$outer.pos, this.$outer.leapPos, Ballistica.STOP_TARGET | Ballistica.STOP_SOLID);
      this.$outer.leapPos = b.collisionPos;
      let leapVictim = Actor.findChar(this.$outer.leapPos);
      let endPos: number;
      if (leapVictim != null) {
        let bouncepos = -1;
        for (let i of PathFinder.NEIGHBOURS8) {
          if ((bouncepos === -1 || Dungeon.level.trueDistance(this.$outer.pos, (this.$outer.leapPos + i) | 0) < Dungeon.level.trueDistance(this.$outer.pos, bouncepos)) && (Actor.findChar((this.$outer.leapPos + i) | 0)) == null && Dungeon.level.passable[(this.$outer.leapPos + i) | 0]) {
            bouncepos = (this.$outer.leapPos + i) | 0;
          }
        }
        if (bouncepos === -1) {
          for (let i of PathFinder.NEIGHBOURS8) {
            if ((bouncepos === -1 || Dungeon.level.trueDistance(this.$outer.pos, (this.$outer.leapPos + i) | 0) < Dungeon.level.trueDistance(this.$outer.pos, bouncepos)) && (Actor.findChar((this.$outer.leapPos + i) | 0)) == null && !(Dungeon.level.solid[(this.$outer.leapPos + i) | 0])) {
              bouncepos = (this.$outer.leapPos + i) | 0;
            }
          }
        }
        if (bouncepos === -1) {
          this.$outer.leapPos = -1;
          return true;
        } else {
          endPos = bouncepos;
        }
      } else {
        endPos = this.$outer.leapPos;
      }
      this.$outer.sprite_.visible_ = Dungeon.level.heroFOV[this.$outer.pos] || Dungeon.level.heroFOV[this.$outer.leapPos] || Dungeon.level.heroFOV[endPos];
      this.$outer.sprite_.jump$int$int$Callback(this.$outer.pos, this.$outer.leapPos, new (RipperDemon$Hunting$1())().$o(this).$c(leapVictim, endPos));
      return false;
    }
    this.$outer.enemySeen = enemyInFOV;
    if (enemyInFOV && !this.$outer.isCharmedBy(this.$outer.enemy) && this.$outer.canAttack(this.$outer.enemy)) {
      this.$outer.recentlyAttackedBy.clear();
      this.$outer.target = this.$outer.enemy.pos;
      return this.$outer.doAttack(this.$outer.enemy);
    } else {
      if (enemyInFOV) {
        this.$outer.target = this.$outer.enemy.pos;
      } else if (this.$outer.enemy == null) {
        this.$outer.state_ = this.$outer.WANDERING;
        this.$outer.target = Dungeon.level.randomDestination(this.$outer);
        return true;
      }
      if (this.$outer.leapCooldown <= Math.fround(0) && enemyInFOV && !this.$outer.rooted && Dungeon.level.distance(this.$outer.pos, this.$outer.enemy.pos) >= 3) {
        let targetPos = this.$outer.enemy.pos;
        if (this.$outer.lastEnemyPos !== this.$outer.enemy.pos) {
          let closestIdx = 0;
          for (let i = 1; i < PathFinder.CIRCLE8.length; i++) {
            if (Dungeon.level.trueDistance(this.$outer.lastEnemyPos, (this.$outer.enemy.pos + PathFinder.CIRCLE8[i]) | 0) < Dungeon.level.trueDistance(this.$outer.lastEnemyPos, (this.$outer.enemy.pos + PathFinder.CIRCLE8[closestIdx]) | 0)) {
              closestIdx = i;
            }
          }
          targetPos = (this.$outer.enemy.pos + PathFinder.CIRCLE8[((closestIdx + 4) | 0) % 8]) | 0;
        }
        let b = new Ballistica()._Ballistica(this.$outer.pos, targetPos, Ballistica.STOP_TARGET | Ballistica.STOP_SOLID);
        if (b.collisionPos !== targetPos && targetPos !== this.$outer.enemy.pos) {
          targetPos = this.$outer.enemy.pos;
          b = new Ballistica()._Ballistica(this.$outer.pos, targetPos, Ballistica.STOP_TARGET | Ballistica.STOP_SOLID);
        }
        if (b.collisionPos === targetPos) {
          this.$outer.leapPos = targetPos;
          let delay = GameMath.gate(this.$outer.attackDelay(), Math.fround($J.d2i(Math.ceil(this.$outer.enemy.cooldown()))), Math.fround(3 * this.$outer.attackDelay()));
          this.$outer.spend(delay);
          if (Dungeon.level.heroFOV[this.$outer.pos] || Dungeon.level.heroFOV[this.$outer.leapPos]) {
            GLog.w(Messages.get$Object$String$ObjectArr(this.$outer, 'leap', []), []);
            GameScene.targetedCell$int$float(this.$outer.leapPos, delay);
            (this.$outer.sprite_).leapPrep(this.$outer.leapPos);
            Dungeon.hero.interrupt();
          }
          return true;
        }
      }
      let oldPos = this.$outer.pos;
      if (this.$outer.target !== -1 && this.$outer.getCloser(this.$outer.target)) {
        this.$outer.spend(Math.fround(1 / this.$outer.speed()));
        return this.$outer.moveSprite(oldPos, this.$outer.pos);
      } else {
        this.$outer.spend(Actor.TICK);
        if (!enemyInFOV) {
          this.$outer.sprite_.showLost();
          this.$outer.state_ = this.$outer.WANDERING;
          this.$outer.target = Dungeon.level.randomDestination(this.$outer);
        }
        return true;
      }
    }
  }
}

let $RipperDemon$Hunting$1: any = null;
/** An anonymous class (RipperDemon.java:190). */
function RipperDemon$Hunting$1(): any {
  return $RipperDemon$Hunting$1 ??= $J.local(class extends JObject {
    call(): void {
      if (this.$cv_leapVictim != null && this.$outer.$outer.alignment !== this.$cv_leapVictim.alignment) {
        if (Char.hit$Char$Char$float$boolean(this.$outer.$outer, this.$cv_leapVictim, Math.fround(Char.INFINITE_ACCURACY), false)) {
          Buff.affect$Char$Class(this.$cv_leapVictim, $J.cls(Bleeding)).set$float(Math.fround(0.75 * this.$outer.$outer.damageRoll()));
          this.$cv_leapVictim.sprite_.flash();
          Sample.INSTANCE.play$Object(Assets$Sounds.HIT);
        } else {
          this.$cv_leapVictim.sprite_.showStatus(CharSprite.NEUTRAL, this.$cv_leapVictim.defenseVerb(), []);
          Sample.INSTANCE.play$Object(Assets$Sounds.MISS);
        }
      }
      if (this.$cv_endPos !== this.$outer.$outer.leapPos) {
        Actor.add$Actor(new Pushing()._Pushing$Char$int$int(this.$outer.$outer, this.$outer.$outer.leapPos, this.$cv_endPos));
      }
      this.$outer.$outer.pos = this.$cv_endPos;
      this.$outer.$outer.leapPos = -1;
      this.$outer.$outer.sprite_.idle();
      Dungeon.level.occupyCell(this.$outer.$outer);
      this.$outer.$outer.next();
    }
    $c($leapVictim, $endPos): this {
      this.$cv_leapVictim = $leapVictim; this.$cv_endPos = $endPos;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RipperDemon$Hunting$1', ['com.watabou.utils.Callback']);
}

$J.define(RipperDemon, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RipperDemon', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_RipperDemon' } });
$J.define(RipperDemon$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RipperDemon$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_RipperDemon$Hunting' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Light = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  RipperSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.RipperSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
