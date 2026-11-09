// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Cudgel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { MeleeWeapon } from './MeleeWeapon.ts';

let Assets$Sounds, Mace, Messages, ItemSpriteSheet;

export class Cudgel extends MeleeWeapon {
  _Cudgel(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.CUDGEL;
    this.hitSound_ = Assets$Sounds.HIT_CRUSH;
    this.hitSoundPitch = Math.fround(1.2);
    this.tier_ = 1;
    this.ACC = Math.fround(1.4);
    this.bones = false;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(4, ((this.tier_ + 1) | 0)) + Math.imul(lvl, ((this.tier_ + 1) | 0))) | 0;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    let dmgBoost = this.augment.damageFactor$int((3 + $J.roundf(Math.fround(1.5 * this.buffedLvl()))) | 0);
    Mace.heavyBlowAbility(hero, target, 1, dmgBoost, this);
  }
  abilityInfo(): string {
    let dmgBoost = this.levelKnown ? (3 + $J.roundf(Math.fround(1.5 * this.buffedLvl()))) | 0 : 3;
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int((this.min$() + dmgBoost) | 0), this.augment.damageFactor$int((this.max$() + dmgBoost) | 0)]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [(this.min$int(0) + dmgBoost) | 0, (this.max$int(0) + dmgBoost) | 0]);
    }
  }
  upgradeAbilityStat(level: number): string {
    let dmgBoost = (3 + $J.roundf(Math.fround(1.5 * level))) | 0;
    return this.augment.damageFactor$int((this.min$int(level) + dmgBoost) | 0) + '-' + this.augment.damageFactor$int((this.max$int(level) + dmgBoost) | 0);
  }
}

$J.define(Cudgel, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Cudgel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Cudgel' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Mace = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Mace');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
