// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Unstable.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Blazing, Blocking, Blooming, Chilling, Corrupting, Elastic, Eldritch, Grim, Kinetic, Kinetic$ConservedDamage, Lucky, Shocking, Vampiric, Venomous, Vorpal, ItemSprite$Glowing, Random, Reflection;

export class Unstable extends Weapon$Enchantment {
  static GREY: ItemSprite$Glowing = null;
  static randomEnchants: JClass<Weapon$Enchantment>[] = null;
  _Unstable(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let conservedDamage = 0;
    if (attacker.buff($J.cls(Kinetic$ConservedDamage)) != null) {
      conservedDamage = attacker.buff($J.cls(Kinetic$ConservedDamage)).damageBonus();
      attacker.buff($J.cls(Kinetic$ConservedDamage)).detach();
    }
    damage = Reflection.newInstance(Random.oneOf(Unstable.randomEnchants)).proc(weapon, attacker, defender, damage);
    return (damage + conservedDamage) | 0;
  }
  glowing(): ItemSprite$Glowing {
    return Unstable.GREY;
  }
  static $clinit() {
    Unstable.GREY = new ItemSprite$Glowing()._ItemSprite$Glowing$int(10066329);
    Unstable.randomEnchants = [$J.cls(Blazing), $J.cls(Blocking), $J.cls(Blooming), $J.cls(Chilling), $J.cls(Kinetic), $J.cls(Corrupting), $J.cls(Elastic), $J.cls(Grim), $J.cls(Lucky), $J.cls(Shocking), $J.cls(Vampiric), $J.cls(Venomous), $J.cls(Vorpal), $J.cls(Eldritch)];
  }
}

$J.define(Unstable, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Unstable', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Unstable' }, clinit: true, lazy: ['GREY', 'randomEnchants'] });
$J.module(() => {
  Blazing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blazing');
  Blocking = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blocking');
  Blooming = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blooming');
  Chilling = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Chilling');
  Corrupting = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Corrupting');
  Elastic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Elastic');
  Eldritch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Eldritch');
  Grim = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Grim');
  Kinetic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic');
  Kinetic$ConservedDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic$ConservedDamage');
  Lucky = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Lucky');
  Shocking = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Shocking');
  Vampiric = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vampiric');
  Venomous = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Venomous');
  Vorpal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vorpal');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
