// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/huntress/NaturesPower.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';
import { FlavourBuff } from '../../../buffs/FlavourBuff.ts';

let Assets$Sounds, Actor, Buff, Buff$buffType, Invisibility, Talent, LeafParticle, Item, BuffIndicator, HeroIcon, Sample;

export class NaturesPower extends ArmorAbility {
  _NaturesPower(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 35;
    return this;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    Buff.prolong(hero, $J.cls(NaturesPower$naturesPowerTracker), NaturesPower$naturesPowerTracker.DURATION);
    hero.buff($J.cls(NaturesPower$naturesPowerTracker)).extensionsLeft = 2;
    hero.sprite_.operate$int(hero.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
    hero.sprite_.emitter().burst(LeafParticle.GENERAL, 10);
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
    Invisibility.dispel$();
    hero.spendAndNext(Actor.TICK);
  }
  icon(): number {
    return HeroIcon.NATURES_POWER;
  }
  talents(): Talent[] {
    return [Talent.GROWING_POWER, Talent.NATURES_WRATH, Talent.WILD_MOMENTUM, Talent.HEROIC_ENERGY];
  }
}

export class NaturesPower$naturesPowerTracker extends FlavourBuff {
  static readonly DURATION: number = 8;
  extensionsLeft: number = 0;
  _NaturesPower$naturesPowerTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.extensionsLeft = 2;
    return this;
  }
  extend(turns: number): void {
    if (this.extensionsLeft > 0 && turns > 0) {
      this.spend(Math.fround(turns));
      this.extensionsLeft--;
    }
  }
  icon(): number {
    return BuffIndicator.NATURE_POWER;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(NaturesPower$naturesPowerTracker.DURATION - this.visualcooldown())) / NaturesPower$naturesPowerTracker.DURATION));
  }
}

$J.define(NaturesPower, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.NaturesPower', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_NaturesPower' } });
$J.define(NaturesPower$naturesPowerTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.NaturesPower$naturesPowerTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_NaturesPower$naturesPowerTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
