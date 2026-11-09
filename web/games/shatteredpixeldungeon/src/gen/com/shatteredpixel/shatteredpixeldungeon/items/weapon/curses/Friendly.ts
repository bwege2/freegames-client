// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Friendly.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff, Charm, Speck, ItemSprite$Glowing, Random;

export class Friendly extends Weapon$Enchantment {
  static BLACK: ItemSprite$Glowing = null;
  _Friendly(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    if (attacker.buff($J.cls(Charm)) != null && attacker.buff($J.cls(Charm)).object === defender.id()) {
      damage = 0;
    }
    let procChance = Math.fround(Math.fround(1 / 10) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      Buff.affect$Char$Class$float(attacker, $J.cls(Charm), Charm.DURATION).object = defender.id();
      attacker.sprite_.centerEmitter().start(Speck.factory$int(Speck.HEART), Math.fround(0.2), 5);
      let c = Buff.affect$Char$Class$float(defender, $J.cls(Charm), Math.fround(Charm.DURATION / 2));
      c.ignoreNextHit = true;
      c.object = attacker.id();
      defender.sprite_.centerEmitter().start(Speck.factory$int(Speck.HEART), Math.fround(0.2), 5);
    }
    return damage;
  }
  curse(): boolean {
    return true;
  }
  glowing(): ItemSprite$Glowing {
    return Friendly.BLACK;
  }
  static $clinit() {
    Friendly.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

$J.define(Friendly, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Friendly', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Friendly' }, clinit: true, lazy: ['BLACK'] });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
