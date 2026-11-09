// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/Corrosion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Actor, Buff, Ooze, Splash, ItemSprite$Glowing, PathFinder, Random;

export class Corrosion extends Armor$Glyph {
  static BLACK: ItemSprite$Glowing = null;
  _Corrosion(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    let procChance = Math.fround(Math.fround(1 / 10) * this.procChanceMultiplier(defender));
    if (Random.Float$() < procChance) {
      let pos = defender.pos;
      for (let i of PathFinder.NEIGHBOURS9) {
        Splash.at$int$int$int((pos + i) | 0, 0, 5);
        if ((Actor.findChar((pos + i) | 0)) != null) {
          Buff.affect$Char$Class(Actor.findChar((pos + i) | 0), $J.cls(Ooze)).set(Math.fround(Ooze.DURATION / 2));
        }
      }
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Corrosion.BLACK;
  }
  curse(): boolean {
    return true;
  }
  static $clinit() {
    Corrosion.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

$J.define(Corrosion, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Corrosion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Corrosion' }, clinit: true, lazy: ['BLACK'] });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
