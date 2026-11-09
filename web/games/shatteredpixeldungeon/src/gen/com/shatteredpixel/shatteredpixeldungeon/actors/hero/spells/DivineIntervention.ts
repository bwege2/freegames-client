// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/DivineIntervention.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ClericSpell } from './ClericSpell.ts';
import { ShieldBuff } from '../../buffs/ShieldBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Buff, Talent, AscendedForm$AscendBuff, Flare, Messages, CharSprite$State, HeroIcon, Sample;

export class DivineIntervention extends ClericSpell {
  static INSTANCE: DivineIntervention = null;
  _DivineIntervention(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.DIVINE_INTERVENTION;
  }
  chargeUse(hero: Hero): number {
    return 5;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.DIVINE_INTERVENTION) && hero.buff($J.cls(AscendedForm$AscendBuff)) != null && !hero.buff($J.cls(AscendedForm$AscendBuff)).divineInverventionCast;
  }
  onCast(tome: HolyTome, hero: Hero): void {
    Sample.INSTANCE.play$Object$float$float(Assets$Sounds.CHARGEUP, 1, Math.fround(1.2));
    hero.sprite_.operate$int(hero.pos);
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch.alignment === Char$Alignment.ALLY && ch !== hero) {
        Buff.affect$Char$Class(ch, $J.cls(DivineIntervention$DivineShield)).setShield((100 + Math.imul(50, hero.pointsInTalent(Talent.DIVINE_INTERVENTION))) | 0);
        new Flare()._Flare(6, 32).color$int$boolean(16776960, true).show$Visual$float(ch.sprite_, 2);
      }
    }
    hero.spendAndNext(1);
    this.onSpellCast(tome, hero);
    hero.buff($J.cls(AscendedForm$AscendBuff)).setShield((100 + Math.imul(50, hero.pointsInTalent(Talent.DIVINE_INTERVENTION))) | 0);
    new Flare()._Flare(6, 32).color$int$boolean(16776960, true).show$Visual$float(hero.sprite_, 2);
    hero.buff($J.cls(AscendedForm$AscendBuff)).divineInverventionCast = true;
    hero.buff($J.cls(AscendedForm$AscendBuff)).extend((2 + hero.pointsInTalent(Talent.DIVINE_INTERVENTION)) | 0);
  }
  desc(): string {
    let shield = (100 + Math.imul(50, Dungeon.hero.pointsInTalent(Talent.DIVINE_INTERVENTION))) | 0;
    let leftBonus = (2 + Dungeon.hero.pointsInTalent(Talent.DIVINE_INTERVENTION)) | 0;
    return Messages.get$Object$String$ObjectArr(this, 'desc', [shield, leftBonus]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  static $clinit() {
    DivineIntervention.INSTANCE = new DivineIntervention()._DivineIntervention();
  }
}

export class DivineIntervention$DivineShield extends ShieldBuff {
  _DivineIntervention$DivineShield(): this {
    this._ShieldBuff();
    this.shieldUsePriority = 1;
    return this;
  }
  act(): boolean {
    if (Dungeon.hero == null || Dungeon.hero.buff($J.cls(AscendedForm$AscendBuff)) == null) {
      this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }
  shielding(): number {
    if (Dungeon.hero == null || Dungeon.hero.buff($J.cls(AscendedForm$AscendBuff)) == null) {
      return 0;
    }
    return super.shielding();
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.SHIELDED);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.SHIELDED);
    }
  }
}

$J.define(DivineIntervention, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineIntervention', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_DivineIntervention' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(DivineIntervention$DivineShield, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineIntervention$DivineShield', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff', ctors: { '': '_DivineIntervention$DivineShield' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  AscendedForm$AscendBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.AscendedForm$AscendBuff');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
