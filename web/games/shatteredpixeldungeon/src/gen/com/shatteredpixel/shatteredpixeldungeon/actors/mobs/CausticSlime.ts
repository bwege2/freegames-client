// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/CausticSlime.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Slime } from './Slime.ts';

let Dungeon, Char$Property, Buff, Ooze, GooBlob, CausticSlimeSprite, PathFinder, Random;

export class CausticSlime extends Slime {
  _CausticSlime(): this {
    this._Slime();
    this.spriteClass = $J.cls(CausticSlimeSprite);
    this.properties_.add(Char$Property.ACIDIC);
    return this;
  }
  attackProc(enemy: Char, damage: number): number {
    if (Random.Int$int(2) === 0) {
      Buff.affect$Char$Class(enemy, $J.cls(Ooze)).set(Ooze.DURATION);
      enemy.sprite_.burst(0, 5);
    }
    return super.attackProc(enemy, damage);
  }
  rollToDropLoot(): void {
    if (Dungeon.hero.lvl > ((this.maxLvl + 2) | 0)) {
      return;
    }
    super.rollToDropLoot();
    let ofs: number;
    do {
      ofs = PathFinder.NEIGHBOURS8[Random.Int$int(8)];
    } while (Dungeon.level.solid[(this.pos + ofs) | 0] && !(Dungeon.level.passable[(this.pos + ofs) | 0]));
    Dungeon.level.drop(new GooBlob()._GooBlob(), (this.pos + ofs) | 0).sprite_.drop$int(this.pos);
  }
}

$J.define(CausticSlime, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CausticSlime', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Slime', ctors: { '': '_CausticSlime' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  GooBlob = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.GooBlob');
  CausticSlimeSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CausticSlimeSprite');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
