// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Grim.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Actor, Hero, ItemSprite$Glowing;

export class Grim extends Weapon$Enchantment {
  static BLACK: ItemSprite$Glowing = null;
  _Grim(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    if (defender.isImmune($J.cls(Grim))) {
      return damage;
    }
    let level = Math.max(0, weapon.buffedLvl());
    let maxChance = Math.fround(0.5 + Math.fround(Math.fround(0.05) * level));
    maxChance = Math.fround(maxChance * this.procChanceMultiplier(attacker));
    Buff.affect$Char$Class(attacker, $J.cls(Grim$GrimTracker)).maxChance = maxChance;
    if (attacker.buff($J.cls(Grim$GrimTracker)) != null && attacker instanceof Hero && weapon.hasEnchant($J.cls(Grim), attacker)) {
      attacker.buff($J.cls(Grim$GrimTracker)).qualifiesForBadge = true;
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Grim.BLACK;
  }
  static $clinit() {
    Grim.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

export class Grim$GrimTracker extends Buff {
  maxChance: number = 0;
  qualifiesForBadge: boolean = false;
  _Grim$GrimTracker(): this {
    this._Buff();
    this.actPriority = Actor.VFX_PRIO;
    return this;
  }
  act(): boolean {
    this.detach();
    return true;
  }
}

$J.define(Grim, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Grim', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Grim' }, clinit: true, lazy: ['BLACK'] });
$J.define(Grim$GrimTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Grim$GrimTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Grim$GrimTracker' } });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
});
