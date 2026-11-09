// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/warrior/Endure.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Buff, Buff$buffType, Combo, Invisibility, Talent, Speck, SpellSprite, Item, Messages, BuffIndicator, HeroIcon, Sample;

export class Endure extends ArmorAbility {
  _Endure(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 50;
    return this;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (hero.buff($J.cls(Endure$EndureTracker)) != null) {
      hero.buff($J.cls(Endure$EndureTracker)).detach();
    }
    Buff.prolong(hero, $J.cls(Endure$EndureTracker), 12);
    let combo = hero.buff($J.cls(Combo));
    if (combo != null) {
      combo.addTime(3);
    }
    hero.sprite_.operate$int(hero.pos);
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
    Invisibility.dispel$();
    hero.spendAndNext(3);
  }
  icon(): number {
    return HeroIcon.ENDURE;
  }
  talents(): Talent[] {
    return [Talent.SUSTAINED_RETRIBUTION, Talent.SHRUG_IT_OFF, Talent.EVEN_THE_ODDS, Talent.HEROIC_ENERGY];
  }
}

export class Endure$EndureTracker extends FlavourBuff {
  enduring: boolean = false;
  damageBonus_: number = 0;
  hitsLeft: number = 0;
  static ENDURING: string = null;
  static DAMAGE_BONUS: string = null;
  static HITS_LEFT: string = null;
  _Endure$EndureTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.enduring = true;
    this.damageBonus_ = 0;
    this.hitsLeft = 0;
    return this;
  }
  icon(): number {
    return this.enduring ? BuffIndicator.NONE : BuffIndicator.ARMOR;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(10 - this.visualcooldown())) / 10));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.damageBonus_, this.hitsLeft]);
  }
  adjustDamageTaken(damage: number): number {
    if (this.enduring) {
      this.damageBonus_ = $J.d2i(Math.fround(this.damageBonus_ + Math.fround(damage / 2)));
      let damageMulti = 0.5;
      if (Dungeon.hero.hasTalent(Talent.SHRUG_IT_OFF)) {
        damageMulti = Math.fround(damageMulti * $J.pow(Math.fround(0.8), Dungeon.hero.pointsInTalent(Talent.SHRUG_IT_OFF)));
      }
      return Math.fround(damage * damageMulti);
    }
    return damage;
  }
  endEnduring(): void {
    if (!this.enduring) {
      return;
    }
    this.enduring = false;
    this.damageBonus_ = $J.d2i(Math.fround(this.damageBonus_ * Math.fround(1 + Math.fround(Math.fround(0.15) * Dungeon.hero.pointsInTalent(Talent.SUSTAINED_RETRIBUTION)))));
    let nearby = 0;
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch.alignment === Char$Alignment.ENEMY && Dungeon.level.distance(this.target.pos, ch.pos) <= 2) {
        nearby++;
      }
    }
    this.damageBonus_ = $J.d2i(Math.fround(this.damageBonus_ * Math.fround(1 + (Math.fround(Math.fround(nearby * Math.fround(0.05)) * Dungeon.hero.pointsInTalent(Talent.EVEN_THE_ODDS))))));
    this.hitsLeft = (1 + Dungeon.hero.pointsInTalent(Talent.SUSTAINED_RETRIBUTION)) | 0;
    this.damageBonus_ = $J.idiv(this.damageBonus_, this.hitsLeft);
    if (this.damageBonus_ > 0) {
      this.target.sprite_.centerEmitter().start(Speck.factory$int(Speck.SCREAM), Math.fround(0.3), 3);
      Sample.INSTANCE.play$Object(Assets$Sounds.CHALLENGE);
      SpellSprite.show$Char$int(this.target, SpellSprite.BERSERK);
    } else {
      this.detach();
    }
  }
  damageFactor(damage: number): number {
    if (this.enduring) {
      return damage;
    } else {
      let bonusDamage = this.damageBonus_;
      this.hitsLeft--;
      if (this.hitsLeft <= 0) {
        this.detach();
      }
      return Math.fround(damage + bonusDamage);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(Endure$EndureTracker.ENDURING, this.enduring);
    bundle.put$String$int(Endure$EndureTracker.DAMAGE_BONUS, this.damageBonus_);
    bundle.put$String$int(Endure$EndureTracker.HITS_LEFT, this.hitsLeft);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.enduring = bundle.getBoolean(Endure$EndureTracker.ENDURING);
    this.damageBonus_ = bundle.getInt(Endure$EndureTracker.DAMAGE_BONUS);
    this.hitsLeft = bundle.getInt(Endure$EndureTracker.HITS_LEFT);
  }
  static $clinit() {
    Endure$EndureTracker.ENDURING = 'enduring';
    Endure$EndureTracker.DAMAGE_BONUS = 'damage_bonus';
    Endure$EndureTracker.HITS_LEFT = 'hits_left';
  }
}

$J.define(Endure, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.Endure', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_Endure' } });
$J.define(Endure$EndureTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.Endure$EndureTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Endure$EndureTracker' }, clinit: true, lazy: ['ENDURING', 'DAMAGE_BONUS', 'HITS_LEFT'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Combo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
