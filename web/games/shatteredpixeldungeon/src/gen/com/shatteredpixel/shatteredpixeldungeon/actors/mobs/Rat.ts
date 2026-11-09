// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Rat.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Char$Alignment, Ratmogrify, RatSprite, Random;

export class Rat extends Mob {
  static readonly RAT_ALLY: string = 'rat_ally';
  _Rat(): this {
    this._Mob();
    this.spriteClass = $J.cls(RatSprite);
    this.HP = this.HT = 8;
    this.defenseSkill_ = 2;
    this.maxLvl = 5;
    return this;
  }
  act(): boolean {
    if (this.alignment !== Char$Alignment.ALLY && Dungeon.level.heroFOV[this.pos] && Dungeon.hero.armorAbility instanceof Ratmogrify) {
      this.alignment = Char$Alignment.NEUTRAL;
      if (this.enemy === Dungeon.hero) {
        this.enemy = null;
      }
      if (this.state_ === this.SLEEPING) {
        this.state_ = this.WANDERING;
      }
    }
    return super.act();
  }
  damageRoll(): number {
    return Random.NormalIntRange(1, 4);
  }
  attackSkill(target: Char): number {
    return 8;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 1)) | 0;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (this.alignment === Char$Alignment.ALLY) {
      bundle.put$String$boolean(Rat.RAT_ALLY, true);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(Rat.RAT_ALLY)) {
      this.alignment = Char$Alignment.ALLY;
    }
  }
}

$J.define(Rat, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Rat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Rat' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Ratmogrify = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify');
  RatSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.RatSprite');
  Random = $J.load('com.watabou.utils.Random');
});
