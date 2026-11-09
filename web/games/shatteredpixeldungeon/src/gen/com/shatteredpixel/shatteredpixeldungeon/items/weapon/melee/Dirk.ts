// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Dirk.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Hero, Mob, Dagger, Messages, ItemSpriteSheet;

export class Dirk extends MeleeWeapon {
  _Dirk(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.DIRK;
    this.hitSound_ = Assets$Sounds.HIT_STAB;
    this.hitSoundPitch = 1;
    this.tier_ = 2;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(4, ((this.tier_ + 1) | 0)) + Math.imul(lvl, ((this.tier_ + 1) | 0))) | 0;
  }
  damageRoll(owner: Char): number {
    if (owner instanceof Hero) {
      let hero = owner;
      let enemy = hero.attackTarget();
      if (enemy instanceof Mob && (enemy).surprisedBy$Char(hero)) {
        let diff = (this.max$() - this.min$()) | 0;
        let damage = this.augment.damageFactor$int(Hero.heroDamageIntRange((this.min$() + $J.roundf(Math.fround(diff * Math.fround(0.67)))) | 0, this.max$()));
        let exStr = (hero.STR() - this.STRReq$()) | 0;
        if (exStr > 0) {
          damage = (damage + Hero.heroDamageIntRange(0, exStr)) | 0;
        }
        return damage;
      }
    }
    return super.damageRoll(owner);
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  useTargeting(): boolean {
    return false;
  }
  duelistAbility(hero: Hero, target: number): void {
    Dagger.sneakAbility(hero, target, 4, (2 + this.buffedLvl()) | 0, this);
  }
  abilityInfo(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [(2 + this.buffedLvl()) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [2]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return String((2 + level) | 0);
  }
}

$J.define(Dirk, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Dirk', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Dirk' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Dagger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Dagger');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
