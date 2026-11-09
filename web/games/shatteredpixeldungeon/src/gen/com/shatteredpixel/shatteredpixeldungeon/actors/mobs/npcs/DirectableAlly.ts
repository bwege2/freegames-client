// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/DirectableAlly.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { NPC } from './NPC.ts';
import { Mob$Wandering } from '../Mob.ts';
import { Mob$Hunting } from '../Mob.ts';

let Dungeon, Actor, Char$Alignment;

export class DirectableAlly extends NPC {
  attacksAutomatically: boolean = false;
  defendingPos: number = 0;
  movingToDefendPos: boolean = false;
  static readonly DEFEND_POS: string = 'defend_pos';
  static readonly MOVING_TO_DEFEND: string = 'moving_to_defend';
  _DirectableAlly(): this {
    this._NPC();
    this.alignment = Char$Alignment.ALLY;
    this.intelligentAlly = true;
    this.WANDERING = new DirectableAlly$Wandering().$o(this)._DirectableAlly$Wandering();
    this.HUNTING = new DirectableAlly$Hunting().$o(this)._DirectableAlly$Hunting();
    this.state_ = this.WANDERING;
    this.actPriority = (Actor.MOB_PRIO + 1) | 0;
    this.attacksAutomatically = true;
    this.defendingPos = -1;
    this.movingToDefendPos = false;
    return this;
  }
  defendPos(cell: number): void {
    this.defendingPos = cell;
    this.movingToDefendPos = true;
    this.aggro(null);
    this.state_ = this.WANDERING;
  }
  clearDefensingPos(): void {
    this.defendingPos = -1;
    this.movingToDefendPos = false;
  }
  followHero(): void {
    this.defendingPos = -1;
    this.movingToDefendPos = false;
    this.aggro(null);
    this.state_ = this.WANDERING;
  }
  targetChar(ch: Char): void {
    this.defendingPos = -1;
    this.movingToDefendPos = false;
    this.aggro(ch);
    this.target = ch.pos;
  }
  aggro(ch: Char): void {
    this.enemy = ch;
    if (!this.movingToDefendPos && this.state_ !== this.PASSIVE) {
      this.state_ = this.HUNTING;
    }
  }
  directTocell(cell: number): void {
    if (!Dungeon.level.heroFOV[cell] || Actor.findChar(cell) == null || (Actor.findChar(cell) !== Dungeon.hero && Actor.findChar(cell).alignment !== Char$Alignment.ENEMY)) {
      this.defendPos(cell);
      return;
    }
    if (Actor.findChar(cell) === Dungeon.hero) {
      this.followHero();
    } else if (Actor.findChar(cell).alignment === Char$Alignment.ENEMY) {
      this.targetChar(Actor.findChar(cell));
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(DirectableAlly.DEFEND_POS, this.defendingPos);
    bundle.put$String$boolean(DirectableAlly.MOVING_TO_DEFEND, this.movingToDefendPos);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(DirectableAlly.DEFEND_POS)) {
      this.defendingPos = bundle.getInt(DirectableAlly.DEFEND_POS);
    }
    this.movingToDefendPos = bundle.getBoolean(DirectableAlly.MOVING_TO_DEFEND);
  }
}

export class DirectableAlly$Wandering extends Mob$Wandering {
  _DirectableAlly$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (enemyInFOV && this.$outer.attacksAutomatically && !this.$outer.movingToDefendPos && (this.$outer.defendingPos === -1 || !Dungeon.level.heroFOV[this.$outer.defendingPos] || this.$outer.canAttack(this.$outer.enemy))) {
      this.$outer.enemySeen = true;
      this.$outer.notice();
      this.$outer.alerted = true;
      this.$outer.state_ = this.$outer.HUNTING;
      this.$outer.target = this.$outer.enemy.pos;
    } else {
      this.$outer.enemySeen = false;
      let oldPos = this.$outer.pos;
      this.$outer.target = this.$outer.defendingPos !== -1 ? this.$outer.defendingPos : Dungeon.hero.pos;
      if (this.$outer.getCloser(this.$outer.target)) {
        this.$outer.spend(Math.fround(1 / this.$outer.speed()));
        if (this.$outer.pos === this.$outer.defendingPos) {
          this.$outer.movingToDefendPos = false;
        }
        return this.$outer.moveSprite(oldPos, this.$outer.pos);
      } else {
        if (this.$outer.movingToDefendPos) {
          this.$outer.defendingPos = this.$outer.pos;
          this.$outer.movingToDefendPos = false;
        }
        this.$outer.spend(Actor.TICK);
      }
    }
    return true;
  }
}

export class DirectableAlly$Hunting extends Mob$Hunting {
  _DirectableAlly$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (enemyInFOV && this.$outer.defendingPos !== -1 && Dungeon.level.heroFOV[this.$outer.defendingPos] && !this.$outer.canAttack(this.$outer.enemy)) {
      this.$outer.target = this.$outer.defendingPos;
      this.$outer.state_ = this.$outer.WANDERING;
      return true;
    }
    return super.act(enemyInFOV, justAlerted);
  }
}

$J.define(DirectableAlly, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.DirectableAlly', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_DirectableAlly' } });
$J.define(DirectableAlly$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.DirectableAlly$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_DirectableAlly$Wandering' }, inner: true });
$J.define(DirectableAlly$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.DirectableAlly$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_DirectableAlly$Hunting' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
});
