// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/AuraOfProtection.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from '../../buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Buff, Buff$buffType, Talent, Speck, Messages, BuffIndicator, HeroIcon, Sample;

export class AuraOfProtection extends ClericSpell {
  static INSTANCE: AuraOfProtection = null;
  _AuraOfProtection(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.AURA_OF_PROTECTION;
  }
  desc(): string {
    let dmgReduction = (10 + Math.imul(10, Dungeon.hero.pointsInTalent(Talent.AURA_OF_PROTECTION))) | 0;
    let glyphPow = (25 + Math.imul(25, Dungeon.hero.pointsInTalent(Talent.AURA_OF_PROTECTION))) | 0;
    return Messages.get$Object$String$ObjectArr(this, 'desc', [dmgReduction, glyphPow]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  chargeUse(hero: Hero): number {
    return 2;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.AURA_OF_PROTECTION);
  }
  onCast(tome: HolyTome, hero: Hero): void {
    Buff.affect$Char$Class$float(hero, $J.cls(AuraOfProtection$AuraBuff), AuraOfProtection$AuraBuff.DURATION);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    hero.spend(1);
    hero.busy();
    hero.sprite_.operate$int(hero.pos);
    this.onSpellCast(tome, hero);
  }
  static $clinit() {
    AuraOfProtection.INSTANCE = new AuraOfProtection()._AuraOfProtection();
  }
}

export class AuraOfProtection$AuraBuff extends FlavourBuff {
  static DURATION: number = 0;
  particles: Emitter = null;
  _AuraOfProtection$AuraBuff(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.PROT_AURA;
  }
  fx(on: boolean): void {
    if (on && (this.particles == null || this.particles.parent == null)) {
      this.particles = this.target.sprite_.emitter();
      this.particles.pos$Visual$float$float$float$float(this.target.sprite_, -32, -32, 80, 80);
      this.particles.fillTarget = false;
      this.particles.pour(Speck.factory$int(Speck.LIGHT), Math.fround(0.02));
    } else if (!on && this.particles != null) {
      this.particles.on = false;
    }
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(AuraOfProtection$AuraBuff.DURATION - this.visualcooldown())) / AuraOfProtection$AuraBuff.DURATION));
  }
  static $clinit() {
    AuraOfProtection$AuraBuff.DURATION = 20;
  }
}

$J.define(AuraOfProtection, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.AuraOfProtection', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_AuraOfProtection' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(AuraOfProtection$AuraBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.AuraOfProtection$AuraBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_AuraOfProtection$AuraBuff' }, clinit: true, lazy: ['DURATION'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
