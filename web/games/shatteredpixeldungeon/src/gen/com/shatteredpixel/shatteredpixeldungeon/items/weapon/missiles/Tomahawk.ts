// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/Tomahawk.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Bleeding, Buff, RingOfSharpshooting, Messages, ItemSpriteSheet, Random;

export class Tomahawk extends MissileWeapon {
  _Tomahawk(): this {
    this._MissileWeapon();
    this.image_ = ItemSpriteSheet.TOMAHAWK;
    this.hitSound_ = Assets$Sounds.HIT_SLASH;
    this.hitSoundPitch = Math.fround(0.9);
    this.tier_ = 4;
    this.baseUses = 5;
    return this;
  }
  min$int(lvl: number): number {
    return ($J.roundf(Math.fround(1.5 * this.tier_)) + lvl) | 0;
  }
  max$int(lvl: number): number {
    return ($J.roundf(Math.fround(4 * this.tier_)) + Math.imul(((this.tier_ - 1) | 0), lvl)) | 0;
  }
  minBleed$(): number {
    return this.minBleed$int((this.buffedLvl() + RingOfSharpshooting.levelDamageBonus(Dungeon.hero)) | 0);
  }
  minBleed$int(lvl: number): number {
    return Math.fround(3 + Math.fround(lvl / 2));
  }
  maxBleed$(): number {
    return this.maxBleed$int((this.buffedLvl() + RingOfSharpshooting.levelDamageBonus(Dungeon.hero)) | 0);
  }
  maxBleed$int(lvl: number): number {
    return Math.fround((6 + lvl) | 0);
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    Buff.affect$Char$Class(defender, $J.cls(Bleeding)).set$float(this.augment.damageFactor$float(Random.NormalFloat(this.minBleed$(), this.maxBleed$())));
    return super.proc(attacker, defender, damage);
  }
  statsInfo(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [$J.roundf(this.augment.damageFactor$float(this.minBleed$())), $J.roundf(this.augment.damageFactor$float(this.maxBleed$()))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [$J.roundf(this.augment.damageFactor$float(this.minBleed$int(0))), $J.roundf(this.augment.damageFactor$float(this.maxBleed$int(0)))]);
    }
  }
}

$J.define(Tomahawk, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Tomahawk', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', ctors: { '': '_Tomahawk' }, meths: { 'maxBleed(int)': 'maxBleed$int', 'maxBleed()': 'maxBleed$', 'minBleed(int)': 'minBleed$int', 'minBleed()': 'minBleed$', 'max(int)': 'max$int', 'min(int)': 'min$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  RingOfSharpshooting = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfSharpshooting');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Random = $J.load('com.watabou.utils.Random');
});
