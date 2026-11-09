// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/WarScythe.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Sickle, Messages, ItemSpriteSheet;

export class WarScythe extends MeleeWeapon {
  _WarScythe(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.WAR_SCYTHE;
    this.hitSound_ = Assets$Sounds.HIT_SLASH;
    this.hitSoundPitch = Math.fround(0.9);
    this.tier_ = 5;
    this.ACC = Math.fround(0.8);
    return this;
  }
  max$int(lvl: number): number {
    return ($J.roundf(Math.fround(Math.fround(6.67) * ((this.tier_ + 1) | 0))) + Math.imul(lvl, ((this.tier_ + 1) | 0))) | 0;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    let bleedAmt = this.augment.damageFactor$int($J.roundf(Math.fround(30 + Math.fround(4.5 * this.buffedLvl()))));
    Sickle.harvestAbility(hero, target, 0, bleedAmt, this);
  }
  abilityInfo(): string {
    let bleedAmt = this.levelKnown ? $J.roundf(Math.fround(30 + Math.fround(4.5 * this.buffedLvl()))) : 30;
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int(bleedAmt)]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [bleedAmt]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return String(this.augment.damageFactor$int($J.roundf(Math.fround(30 + Math.fround(4.5 * level)))));
  }
}

$J.define(WarScythe, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.WarScythe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_WarScythe' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Sickle = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sickle');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
