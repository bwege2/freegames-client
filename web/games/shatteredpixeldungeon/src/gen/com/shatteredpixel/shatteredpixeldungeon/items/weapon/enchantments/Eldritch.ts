// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Eldritch.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Weapon$Enchantment } from '../Weapon.ts';

let Dungeon, Actor, Buff, Terror, Vertigo, Flare, ItemSprite$Glowing, Random;

export class Eldritch extends Weapon$Enchantment {
  static GREY: ItemSprite$Glowing = null;
  _Eldritch(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, weapon.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 1)) / (Math.fround(level + 4))) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        if (ch === attacker || ch === defender || ch.alignment === attacker.alignment) {
          continue;
        }
        if (ch.fieldOfView != null && (ch.fieldOfView[attacker.pos] || ch.fieldOfView[defender.pos])) {
          if (ch === Dungeon.hero) {
            Buff.affect$Char$Class$float(defender, $J.cls(Vertigo), 5);
          } else {
            Buff.affect$Char$Class$float(ch, $J.cls(Terror), Math.fround(powerMulti * 5)).object = attacker.id();
          }
        }
      }
      new Flare()._Flare(5, 24).color$int$boolean(16711680, true).show$Visual$float(attacker.sprite_, 1);
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Eldritch.GREY;
  }
  static $clinit() {
    Eldritch.GREY = new ItemSprite$Glowing()._ItemSprite$Glowing$int(2236962);
  }
}

$J.define(Eldritch, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Eldritch', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Eldritch' }, clinit: true, lazy: ['GREY'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Vertigo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vertigo');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
