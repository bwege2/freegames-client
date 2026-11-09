// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/ThrowingClub.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, ItemSpriteSheet;

export class ThrowingClub extends MissileWeapon {
  _ThrowingClub(): this {
    this._MissileWeapon();
    this.image_ = ItemSpriteSheet.THROWING_CLUB;
    this.hitSound_ = Assets$Sounds.HIT_CRUSH;
    this.hitSoundPitch = Math.fround(1.1);
    this.tier_ = 2;
    this.baseUses = 12;
    this.sticky = false;
    return this;
  }
  pickupDelay(): number {
    return 0;
  }
  max$int(lvl: number): number {
    return (Math.imul(4, this.tier_) + Math.imul((this.tier_), lvl)) | 0;
  }
}

$J.define(ThrowingClub, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingClub', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', ctors: { '': '_ThrowingClub' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
