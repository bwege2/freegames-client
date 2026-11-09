// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Lucky.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from '../../../actors/buffs/Buff.ts';

let RingOfWealth, ItemSprite$Glowing, Random;

export class Lucky extends Weapon$Enchantment {
  static GREEN: ItemSprite$Glowing = null;
  _Lucky(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, weapon.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 4)) / (Math.fround(level + 40))) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      Buff.affect$Char$Class(defender, $J.cls(Lucky$LuckProc)).ringLevel = (-10 + $J.roundf(Math.fround(5 * powerMulti))) | 0;
    } else {
      if (defender.buff($J.cls(Lucky$LuckProc)) != null) {
        defender.buff($J.cls(Lucky$LuckProc)).detach();
      }
    }
    return damage;
  }
  static genLoot(): Item {
    return RingOfWealth.genConsumableDrop(-5);
  }
  static showFlare(vis: Visual): void {
    RingOfWealth.showFlareForBonusDrop(vis);
  }
  glowing(): ItemSprite$Glowing {
    return Lucky.GREEN;
  }
  static $clinit() {
    Lucky.GREEN = new ItemSprite$Glowing()._ItemSprite$Glowing$int(65280);
  }
}

export class Lucky$LuckProc extends Buff {
  ringLevel: number = 0;
  _Lucky$LuckProc(): this {
    this._Buff();
    this.ringLevel = -5;
    return this;
  }
  act(): boolean {
    this.detach();
    return true;
  }
  genLoot(): Item {
    this.detach();
    return RingOfWealth.genConsumableDrop(this.ringLevel);
  }
}

$J.define(Lucky, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Lucky', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Lucky' }, clinit: true, lazy: ['GREEN'] });
$J.define(Lucky$LuckProc, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Lucky$LuckProc', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Lucky$LuckProc' } });
$J.module(() => {
  RingOfWealth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfWealth');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
