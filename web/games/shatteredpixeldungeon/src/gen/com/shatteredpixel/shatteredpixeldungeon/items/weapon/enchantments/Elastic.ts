// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Elastic.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let WandOfBlastWave, SpiritBow, MissileWeapon, Ballistica, ItemSprite$Glowing, Random;

export class Elastic extends Weapon$Enchantment {
  static PINK: ItemSprite$Glowing = null;
  _Elastic(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, weapon.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 1)) / (Math.fround(level + 5))) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      let trajectory = new Ballistica()._Ballistica(attacker.pos, defender.pos, Ballistica.STOP_TARGET);
      trajectory = new Ballistica()._Ballistica(trajectory.collisionPos, trajectory.path.get((trajectory.path.size() - 1) | 0), Ballistica.PROJECTILE);
      WandOfBlastWave.throwChar(defender, trajectory, $J.roundf(Math.fround(2 * powerMulti)), !(weapon instanceof MissileWeapon || weapon instanceof SpiritBow), true, this);
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Elastic.PINK;
  }
  static $clinit() {
    Elastic.PINK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16711935);
  }
}

$J.define(Elastic, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Elastic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Elastic' }, clinit: true, lazy: ['PINK'] });
$J.module(() => {
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  SpiritBow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
