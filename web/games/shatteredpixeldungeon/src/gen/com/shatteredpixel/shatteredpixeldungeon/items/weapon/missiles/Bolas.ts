// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/Bolas.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Buff, Cripple, ItemSpriteSheet;

export class Bolas extends MissileWeapon {
  _Bolas(): this {
    this._MissileWeapon();
    this.image_ = ItemSpriteSheet.BOLAS;
    this.hitSound_ = Assets$Sounds.HIT;
    this.hitSoundPitch = 1;
    this.tier_ = 3;
    this.baseUses = 5;
    return this;
  }
  min$int(lvl: number): number {
    return (Math.imul(2, ((this.tier_ - 1) | 0)) + Math.imul(0, lvl)) | 0;
  }
  max$int(lvl: number): number {
    return (Math.imul(3, this.tier_) + Math.imul(((this.tier_ - 1) | 0), lvl)) | 0;
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    Buff.prolong(defender, $J.cls(Cripple), Math.fround(Cripple.DURATION / 2));
    return super.proc(attacker, defender, damage);
  }
}

$J.define(Bolas, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Bolas', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', ctors: { '': '_Bolas' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
