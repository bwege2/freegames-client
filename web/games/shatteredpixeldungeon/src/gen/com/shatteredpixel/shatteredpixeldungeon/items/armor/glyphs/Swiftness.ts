// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Swiftness.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Armor$Glyph } from '../Armor.ts';

let Dungeon, Actor, Char$Alignment, Speck, ItemSprite$Glowing, PathFinder, Random;

export class Swiftness extends Armor$Glyph {
  static YELLOW: ItemSprite$Glowing = null;
  _Swiftness(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    return damage;
  }
  static speedBoost(owner: Char, level: number): number {
    if (level === -1) {
      return 1;
    }
    let enemyNear = false;
    PathFinder.buildDistanceMap$int$booleanArr$int(owner.pos, Dungeon.level.passable, 3);
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch.alignment === Char$Alignment.ENEMY && PathFinder.distance[ch.pos] !== 2147483647) {
        enemyNear = true;
      }
    }
    if (enemyNear) {
      return 1;
    } else {
      if (owner.sprite_ != null && owner.sprite_.visible_) {
        let particles = (1 + $J.d2i(Random.Float$float(Math.fround(1 + Math.fround(level / 5))))) | 0;
        owner.sprite_.emitter().startDelayed(Speck.factory$int(Speck.YELLOW_LIGHT), Math.fround(0.02), particles, Math.fround(0.05));
      }
      return Math.fround((Math.fround(Math.fround(1.2) + Math.fround(Math.fround(0.04) * level))) * Armor$Glyph.genericProcChanceMultiplier(owner));
    }
  }
  glowing(): ItemSprite$Glowing {
    return Swiftness.YELLOW;
  }
  static $clinit() {
    Swiftness.YELLOW = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16776960);
  }
}

$J.define(Swiftness, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Swiftness', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Swiftness' }, clinit: true, lazy: ['YELLOW'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
