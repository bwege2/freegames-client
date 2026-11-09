// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/cleric/AscendedForm.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ShieldBuff } from '../../../buffs/ShieldBuff.ts';

let Assets$Sounds, Actor, Buff, Buff$buffType, Invisibility, Talent, DivineIntervention$DivineShield, Flare, Item, Messages, CharSprite$State, BuffIndicator, HeroIcon, Sample;

export class AscendedForm extends ArmorAbility {
  _AscendedForm(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 50;
    return this;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    Buff.affect$Char$Class(hero, $J.cls(AscendedForm$AscendBuff)).reset();
    hero.sprite_.operate$int(hero.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
    new Flare()._Flare(6, 48).color$int$boolean(16776960, true).show$Visual$float(hero.sprite_, 2);
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
    Invisibility.dispel$();
    hero.spendAndNext(Actor.TICK);
  }
  icon(): number {
    return HeroIcon.ASCENDED_FORM;
  }
  talents(): Talent[] {
    return [Talent.DIVINE_INTERVENTION, Talent.JUDGEMENT, Talent.FLASH, Talent.HEROIC_ENERGY];
  }
}

export class AscendedForm$AscendBuff extends ShieldBuff {
  static DURATION: number = 0;
  left_: number = 0;
  spellCasts: number = 0;
  flashCasts: number = 0;
  divineInverventionCast: boolean = false;
  static readonly LEFT: string = 'left';
  static readonly SPELL_CASTS: string = 'spell_casts';
  static readonly FLASH_CASTS: string = 'flash_casts';
  static readonly DIVINE_INTERVENTION_CAST: string = 'divine_intervention_cast';
  _AscendedForm$AscendBuff(): this {
    this._ShieldBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.detachesAtZero = false;
    this.shieldUsePriority = 1;
    this.left_ = 10;
    this.spellCasts = 0;
    this.flashCasts = 0;
    this.divineInverventionCast = false;
    return this;
  }
  icon(): number {
    return BuffIndicator.ASCEND;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(AscendedForm$AscendBuff.DURATION - this.left_)) / AscendedForm$AscendBuff.DURATION));
  }
  iconTextDisplay(): string {
    return String(this.left_);
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.GLOWING);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.GLOWING);
    }
  }
  reset(): void {
    this.setShield(30);
    this.left_ = $J.d2i(AscendedForm$AscendBuff.DURATION);
  }
  extend(amt: number): void {
    this.left_ = (this.left_ + amt) | 0;
  }
  act(): boolean {
    this.left_--;
    if (this.left_ <= 0) {
      this.detach();
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        if (ch.buff($J.cls(DivineIntervention$DivineShield)) != null) {
          ch.buff($J.cls(DivineIntervention$DivineShield)).detach();
        }
      }
      return true;
    }
    this.spend(Actor.TICK);
    return true;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.shielding(), this.left_]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(AscendedForm$AscendBuff.LEFT, this.left_);
    bundle.put$String$int(AscendedForm$AscendBuff.SPELL_CASTS, this.spellCasts);
    bundle.put$String$int(AscendedForm$AscendBuff.FLASH_CASTS, this.flashCasts);
    bundle.put$String$boolean(AscendedForm$AscendBuff.DIVINE_INTERVENTION_CAST, this.divineInverventionCast);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getInt(AscendedForm$AscendBuff.LEFT);
    this.spellCasts = bundle.getInt(AscendedForm$AscendBuff.SPELL_CASTS);
    this.flashCasts = bundle.getInt(AscendedForm$AscendBuff.FLASH_CASTS);
    this.divineInverventionCast = bundle.getBoolean(AscendedForm$AscendBuff.DIVINE_INTERVENTION_CAST);
  }
  static $clinit() {
    AscendedForm$AscendBuff.DURATION = 10;
  }
}

$J.define(AscendedForm, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.AscendedForm', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_AscendedForm' } });
$J.define(AscendedForm$AscendBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.AscendedForm$AscendBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff', ctors: { '': '_AscendedForm$AscendBuff' }, clinit: true, lazy: ['DURATION'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  DivineIntervention$DivineShield = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineIntervention$DivineShield');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
