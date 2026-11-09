// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/Kunai.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Momentum, Hero, Talent, Mob, ItemSpriteSheet;

export class Kunai extends MissileWeapon {
  _Kunai(): this {
    this._MissileWeapon();
    this.image_ = ItemSpriteSheet.KUNAI;
    this.hitSound_ = Assets$Sounds.HIT_STAB;
    this.hitSoundPitch = Math.fround(1.1);
    this.tier_ = 3;
    this.baseUses = 8;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(4, this.tier_) + Math.imul(this.tier_, lvl)) | 0;
  }
  damageRoll(owner: Char): number {
    if (owner instanceof Hero) {
      let hero = owner;
      let enemy = hero.attackTarget();
      if (enemy instanceof Mob && (enemy).surprisedBy$Char(hero)) {
        let diff = (this.max$() - this.min$()) | 0;
        let damage = this.augment.damageFactor$int(Hero.heroDamageIntRange((this.min$() + $J.roundf(Math.fround(diff * Math.fround(0.6)))) | 0, this.max$()));
        let exStr = (hero.STR() - this.STRReq$()) | 0;
        if (exStr > 0) {
          damage = (damage + Hero.heroDamageIntRange(0, exStr)) | 0;
        }
        if (owner.buff($J.cls(Momentum)) != null && owner.buff($J.cls(Momentum)).freerunning()) {
          damage = $J.roundf(Math.fround(damage * (Math.fround(1 + Math.fround(Math.fround(0.15) * (owner).pointsInTalent(Talent.PROJECTILE_MOMENTUM))))));
        }
        return damage;
      }
    }
    return super.damageRoll(owner);
  }
}

$J.define(Kunai, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Kunai', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', ctors: { '': '_Kunai' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Momentum = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Momentum');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
