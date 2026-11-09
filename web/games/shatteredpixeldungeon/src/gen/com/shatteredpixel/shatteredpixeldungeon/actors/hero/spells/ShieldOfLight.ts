// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/ShieldOfLight.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { TargetedClericSpell } from './TargetedClericSpell.ts';
import { FlavourBuff } from '../../buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Buff, Buff$buffType, HeroSubClass, Talent, PowerOfMany, GuidingLight$Illuminated, LifeLinkSpell$LifeLinkSpellBuff, Speck, Ballistica, Messages, BuffIndicator, HeroIcon, QuickSlotButton, GLog, Sample;

export class ShieldOfLight extends TargetedClericSpell {
  static INSTANCE: ShieldOfLight = null;
  _ShieldOfLight(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.SHIELD_OF_LIGHT;
  }
  targetingFlags(): number {
    return Ballistica.STOP_TARGET;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.SHIELD_OF_LIGHT);
  }
  onTargetSelected(tome: HolyTome, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    let ch = Actor.findChar(target);
    if (ch == null || ch.alignment === Char$Alignment.ALLY || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_target', []), []);
      return;
    }
    QuickSlotButton.target(ch);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    hero.sprite_.operate$int(hero.pos);
    Buff.prolong(hero, $J.cls(ShieldOfLight$ShieldOfLightTracker), 4).object = ch.id();
    if (hero.subClass === HeroSubClass.PRIEST) {
      Buff.affect$Char$Class(ch, $J.cls(GuidingLight$Illuminated));
    }
    hero.busy();
    hero.sprite_.operate$int(hero.pos);
    hero.sprite_.emitter().start(Speck.factory$int(Speck.LIGHT), Math.fround(0.15), 6);
    let ally = PowerOfMany.getPoweredAlly();
    if (ally != null && ally.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null) {
      Buff.prolong(ally, $J.cls(ShieldOfLight$ShieldOfLightTracker), 3).object = ch.id();
      ally.sprite_.emitter().start(Speck.factory$int(Speck.LIGHT), Math.fround(0.15), 6);
    }
    this.onSpellCast(tome, hero);
  }
  desc(): string {
    let min = (1 + Dungeon.hero.pointsInTalent(Talent.SHIELD_OF_LIGHT)) | 0;
    let max = Math.imul(2, min);
    return Messages.get$Object$String$ObjectArr(this, 'desc', [min, max]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  static $clinit() {
    ShieldOfLight.INSTANCE = new ShieldOfLight()._ShieldOfLight();
  }
}

export class ShieldOfLight$ShieldOfLightTracker extends FlavourBuff {
  object: number = 0;
  static readonly DURATION: number = 5;
  static readonly OBJECT: string = 'object';
  _ShieldOfLight$ShieldOfLightTracker(): this {
    this._FlavourBuff();
    this.object = 0;
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.LIGHT_SHIELD;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(ShieldOfLight$ShieldOfLightTracker.DURATION - this.visualcooldown())) / ShieldOfLight$ShieldOfLightTracker.DURATION));
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(ShieldOfLight$ShieldOfLightTracker.OBJECT, this.object);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.object = bundle.getInt(ShieldOfLight$ShieldOfLightTracker.OBJECT);
  }
}

$J.define(ShieldOfLight, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ShieldOfLight', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_ShieldOfLight' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(ShieldOfLight$ShieldOfLightTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ShieldOfLight$ShieldOfLightTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_ShieldOfLight$ShieldOfLightTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  LifeLinkSpell$LifeLinkSpellBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
