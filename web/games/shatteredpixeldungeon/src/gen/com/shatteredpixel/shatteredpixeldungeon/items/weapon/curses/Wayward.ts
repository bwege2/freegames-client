// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Wayward.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from '../../../actors/buffs/FlavourBuff.ts';

let Buff, Buff$buffType, ItemSprite$Glowing, BuffIndicator, Random;

export class Wayward extends Weapon$Enchantment {
  static BLACK: ItemSprite$Glowing = null;
  _Wayward(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let procChance = Math.fround(Math.fround(1 / 4) * this.procChanceMultiplier(attacker));
    if (attacker.buff($J.cls(Wayward$WaywardBuff)) != null) {
      Buff.detach(attacker, $J.cls(Wayward$WaywardBuff));
    } else if (Random.Float$() < procChance) {
      Buff.prolong(attacker, $J.cls(Wayward$WaywardBuff), Wayward$WaywardBuff.DURATION);
    }
    return damage;
  }
  curse(): boolean {
    return true;
  }
  glowing(): ItemSprite$Glowing {
    return Wayward.BLACK;
  }
  static $clinit() {
    Wayward.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

export class Wayward$WaywardBuff extends FlavourBuff {
  static readonly DURATION: number = 10;
  _Wayward$WaywardBuff(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  icon(): number {
    return BuffIndicator.WEAKNESS;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 1, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Wayward$WaywardBuff.DURATION - this.visualcooldown())) / Wayward$WaywardBuff.DURATION));
  }
}

$J.define(Wayward, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Wayward', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Wayward' }, clinit: true, lazy: ['BLACK'] });
$J.define(Wayward$WaywardBuff, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Wayward$WaywardBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Wayward$WaywardBuff' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Random = $J.load('com.watabou.utils.Random');
});
