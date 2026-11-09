// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GreatCrab.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Crab } from './Crab.ts';
import { Mob$Wandering } from './Mob.ts';

let Assets$Sounds, Dungeon, Statistics, Char, Char$Property, ClericSpell, Ghost$Quest, MysteryMeat, Wand, Messages, CharSprite, GreatCrabSprite, GLog, Sample, PathFinder, Random;

export class GreatCrab extends Crab {
  moving: number = 0;
  _GreatCrab(): this {
    this._Crab();
    this.spriteClass = $J.cls(GreatCrabSprite);
    this.HP = this.HT = 25;
    this.defenseSkill_ = 0;
    this.baseSpeed = 1;
    this.EXP = 6;
    this.WANDERING = new GreatCrab$Wandering().$o(this)._GreatCrab$Wandering();
    this.state_ = this.WANDERING;
    this.loot = new MysteryMeat()._MysteryMeat().quantity$int(2);
    this.lootChance_ = 1;
    this.properties_.add(Char$Property.MINIBOSS);
    this.moving = 0;
    return this;
  }
  getCloser(target: number): boolean {
    this.moving++;
    if (this.moving < 3) {
      return super.getCloser(target);
    } else {
      this.moving = 0;
      return true;
    }
  }
  damage(dmg: number, src: any): void {
    if (this.enemySeen && this.state_ !== this.SLEEPING && this.paralysed === 0 && (src instanceof Wand || src instanceof ClericSpell) && this.enemy === Dungeon.hero && this.enemy.invisible === 0) {
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'noticed', []), []);
      this.sprite_.showStatus(CharSprite.NEUTRAL, Messages.get$Object$String$ObjectArr(this, 'def_verb', []), []);
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_PARRY, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
      Statistics.questScores[0] = (Statistics.questScores[0] - 50) | 0;
    } else {
      super.damage(dmg, src);
    }
  }
  defenseSkill(enemy: Char): number {
    if (this.enemySeen && this.state_ !== this.SLEEPING && this.paralysed === 0 && enemy === this.enemy && enemy.invisible === 0) {
      if (this.sprite_ != null && this.sprite_.visible_) {
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_PARRY, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'noticed', []), []);
      }
      if (enemy === Dungeon.hero) {
        Statistics.questScores[0] = (Statistics.questScores[0] - 50) | 0;
      }
      return Char.INFINITE_EVASION;
    }
    return super.defenseSkill(enemy);
  }
  die(cause: any): void {
    super.die(cause);
    Ghost$Quest.process();
  }
}

export class GreatCrab$Wandering extends Mob$Wandering {
  _GreatCrab$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  randomDestination(): number {
    let pos1 = super.randomDestination();
    let pos2 = super.randomDestination();
    PathFinder.buildDistanceMap$int$booleanArr(Dungeon.hero.pos, Dungeon.level.passable);
    if (PathFinder.distance[pos2] < PathFinder.distance[pos1]) {
      return pos2;
    } else {
      return pos1;
    }
  }
}

$J.define(GreatCrab, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GreatCrab', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Crab', ctors: { '': '_GreatCrab' } });
$J.define(GreatCrab$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GreatCrab$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_GreatCrab$Wandering' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  ClericSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell');
  Ghost$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Quest');
  MysteryMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  GreatCrabSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GreatCrabSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
