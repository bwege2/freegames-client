// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Gloves.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Sai, Messages, ItemSpriteSheet;

export class Gloves extends MeleeWeapon {
  _Gloves(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.GLOVES;
    this.hitSound_ = Assets$Sounds.HIT;
    this.hitSoundPitch = Math.fround(1.3);
    this.tier_ = 1;
    this.DLY = 0.5;
    this.bones = false;
    return this;
  }
  max$int(lvl: number): number {
    return ($J.roundf(Math.fround(2.5 * ((this.tier_ + 1) | 0))) + Math.imul(lvl, $J.roundf(Math.fround(0.5 * ((this.tier_ + 1) | 0))))) | 0;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    let dmgBoost = this.augment.damageFactor$int((3 + this.buffedLvl()) | 0);
    Sai.comboStrikeAbility(hero, target, 0, dmgBoost, this);
  }
  abilityInfo(): string {
    let dmgBoost = this.levelKnown ? (3 + this.buffedLvl()) | 0 : 3;
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int(dmgBoost)]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [this.augment.damageFactor$int(dmgBoost)]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return '+' + this.augment.damageFactor$int((3 + level) | 0);
  }
}

$J.define(Gloves, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Gloves', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Gloves' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Sai = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sai');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
