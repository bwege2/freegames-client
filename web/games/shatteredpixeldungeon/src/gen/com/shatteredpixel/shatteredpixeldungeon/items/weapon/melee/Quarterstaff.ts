// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Quarterstaff.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from '../../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Buff, Buff$buffType, Messages, ItemSpriteSheet, BuffIndicator;

export class Quarterstaff extends MeleeWeapon {
  _Quarterstaff(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.QUARTERSTAFF;
    this.hitSound_ = Assets$Sounds.HIT_CRUSH;
    this.hitSoundPitch = 1;
    this.tier_ = 2;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(4, ((this.tier_ + 1) | 0)) + Math.imul(lvl, ((this.tier_ + 1) | 0))) | 0;
  }
  defenseFactor(owner: Char): number {
    return 2;
  }
  duelistAbility(hero: Hero, target: number): void {
    this.beforeAbilityUsed(hero, null);
    Buff.prolong(hero, $J.cls(Quarterstaff$DefensiveStance), Math.fround((3 + this.buffedLvl()) | 0));
    hero.sprite_.operate$int(hero.pos);
    hero.next();
    this.afterAbilityUsed(hero);
  }
  abilityInfo(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [(4 + this.buffedLvl()) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [4]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return String((4 + level) | 0);
  }
}

export class Quarterstaff$DefensiveStance extends FlavourBuff {
  _Quarterstaff$DefensiveStance(): this {
    this._FlavourBuff();
    this.announced = true;
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.DUEL_EVASIVE;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(4 - this.visualcooldown())) / 4));
  }
}

$J.define(Quarterstaff, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Quarterstaff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Quarterstaff' }, meths: { 'max(int)': 'max$int' } });
$J.define(Quarterstaff$DefensiveStance, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Quarterstaff$DefensiveStance', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Quarterstaff$DefensiveStance' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
