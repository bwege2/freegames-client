// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/Metabolism.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff, Hunger, Hero, FloatingText, CharSprite, ItemSprite$Glowing, Random;

export class Metabolism extends Armor$Glyph {
  static BLACK: ItemSprite$Glowing = null;
  _Metabolism(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    let procChance = Math.fround(Math.fround(1 / 6) * this.procChanceMultiplier(defender));
    if (Random.Float$() < procChance && defender instanceof Hero) {
      let healing = Math.min($J.idiv($J.d2i(Hunger.STARVING), 100), (defender.HT - defender.HP) | 0);
      if (healing > 0) {
        let hunger = Buff.affect$Char$Class(defender, $J.cls(Hunger));
        if (!hunger.isStarving()) {
          hunger.affectHunger$float(Math.fround(Math.imul(healing, -10)));
          defender.HP = (defender.HP + healing) | 0;
          defender.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(healing), FloatingText.HEALING, []);
        }
      }
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Metabolism.BLACK;
  }
  curse(): boolean {
    return true;
  }
  static $clinit() {
    Metabolism.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

$J.define(Metabolism, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Metabolism', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Metabolism' }, clinit: true, lazy: ['BLACK'] });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
