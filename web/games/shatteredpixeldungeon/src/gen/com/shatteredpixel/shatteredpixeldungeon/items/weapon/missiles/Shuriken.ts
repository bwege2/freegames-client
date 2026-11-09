// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/Shuriken.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { MissileWeapon } from './MissileWeapon.ts';
import { FlavourBuff } from '../../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Buff, Item, ItemSpriteSheet, BuffIndicator;

export class Shuriken extends MissileWeapon {
  _Shuriken(): this {
    this._MissileWeapon();
    this.image_ = ItemSpriteSheet.SHURIKEN;
    this.hitSound_ = Assets$Sounds.HIT_STAB;
    this.hitSoundPitch = Math.fround(1.2);
    this.tier_ = 2;
    this.baseUses = 5;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(4, this.tier_) + (this.tier_ === 1 ? Math.imul(2, lvl) : Math.imul(this.tier_, lvl))) | 0;
  }
  onThrow(cell: number): void {
    super.onThrow(cell);
    if (Item.curUser.buff($J.cls(Shuriken$ShurikenInstantTracker)) == null) {
      Buff.affect$Char$Class$float(Item.curUser, $J.cls(Shuriken$ShurikenInstantTracker), Math.fround((Shuriken$ShurikenInstantTracker.DURATION - 1) | 0));
    }
  }
  castDelay(user: Char, cell: number): number {
    return user.buff($J.cls(Shuriken$ShurikenInstantTracker)) != null ? super.castDelay(user, cell) : 0;
  }
}

export class Shuriken$ShurikenInstantTracker extends FlavourBuff {
  static DURATION: number = 0;
  _Shuriken$ShurikenInstantTracker(): this {
    this._FlavourBuff();
    return this;
  }
  icon(): number {
    return BuffIndicator.THROWN_WEP;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(0.6), Math.fround(0.6), Math.fround(0.6));
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Shuriken$ShurikenInstantTracker.DURATION - this.visualcooldown())) / Shuriken$ShurikenInstantTracker.DURATION));
  }
  static $clinit() {
    Shuriken$ShurikenInstantTracker.DURATION = 20;
  }
}

$J.define(Shuriken, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Shuriken', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', ctors: { '': '_Shuriken' }, meths: { 'max(int)': 'max$int' } });
$J.define(Shuriken$ShurikenInstantTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Shuriken$ShurikenInstantTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Shuriken$ShurikenInstantTracker' }, clinit: true, lazy: ['DURATION'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
