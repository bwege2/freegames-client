// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Vorpal.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Actor, Bleeding, ItemSprite$Glowing, Random;

export class Vorpal extends Weapon$Enchantment {
  static RED: ItemSprite$Glowing = null;
  _Vorpal(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    if (defender.isImmune($J.cls(Bleeding))) {
      return damage;
    }
    let procChance = Math.fround(Math.fround(1 / 4) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      Buff.affect$Char$Class(attacker, $J.cls(Vorpal$VorpalTracker)).powerMulti = powerMulti;
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Vorpal.RED;
  }
  static $clinit() {
    Vorpal.RED = new ItemSprite$Glowing()._ItemSprite$Glowing$int(11167334);
  }
}

export class Vorpal$VorpalTracker extends Buff {
  powerMulti: number = 0;
  _Vorpal$VorpalTracker(): this {
    this._Buff();
    this.actPriority = Actor.VFX_PRIO;
    return this;
  }
  act(): boolean {
    this.detach();
    return true;
  }
}

$J.define(Vorpal, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vorpal', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Vorpal' }, clinit: true, lazy: ['RED'] });
$J.define(Vorpal$VorpalTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vorpal$VorpalTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Vorpal$VorpalTracker' } });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
