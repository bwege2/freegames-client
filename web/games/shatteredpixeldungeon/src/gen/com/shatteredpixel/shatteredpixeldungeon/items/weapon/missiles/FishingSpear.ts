// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/FishingSpear.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Piranha, ItemSpriteSheet;

export class FishingSpear extends MissileWeapon {
  _FishingSpear(): this {
    this._MissileWeapon();
    this.image_ = ItemSpriteSheet.FISHING_SPEAR;
    this.hitSound_ = Assets$Sounds.HIT_STAB;
    this.hitSoundPitch = Math.fround(1.1);
    this.tier_ = 2;
    return this;
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (defender instanceof Piranha) {
      damage = Math.max(damage, $J.idiv(defender.HP, 2));
    }
    return super.proc(attacker, defender, damage);
  }
}

$J.define(FishingSpear, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.FishingSpear', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', ctors: { '': '_FishingSpear' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Piranha = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
