// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/DivineSense.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Buff, Buff$buffType, Talent, PowerOfMany, LifeLinkSpell$LifeLinkSpellBuff, SpellSprite, Messages, GameScene, BuffIndicator, HeroIcon, Sample;

export class DivineSense extends ClericSpell {
  static INSTANCE: DivineSense = null;
  _DivineSense(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.DIVINE_SENSE;
  }
  chargeUse(hero: Hero): number {
    return 2;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.DIVINE_SENSE);
  }
  onCast(tome: HolyTome, hero: Hero): void {
    Buff.prolong(hero, $J.cls(DivineSense$DivineSenseTracker), DivineSense$DivineSenseTracker.DURATION);
    Dungeon.observe$();
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    SpellSprite.show$Char$int(hero, SpellSprite.VISION);
    hero.sprite_.operate$int(hero.pos);
    hero.next();
    let ally = PowerOfMany.getPoweredAlly();
    if (ally != null && ally.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null) {
      Buff.prolong(ally, $J.cls(DivineSense$DivineSenseTracker), DivineSense$DivineSenseTracker.DURATION);
      SpellSprite.show$Char$int(ally, SpellSprite.VISION);
    }
    this.onSpellCast(tome, hero);
  }
  desc(): string {
    return (Messages.get$Object$String$ObjectArr(this, 'desc', [(4 + Math.imul(4, Dungeon.hero.pointsInTalent(Talent.DIVINE_SENSE))) | 0])) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  static $clinit() {
    DivineSense.INSTANCE = new DivineSense()._DivineSense();
  }
}

export class DivineSense$DivineSenseTracker extends FlavourBuff {
  static readonly DURATION: number = 50;
  _DivineSense$DivineSenseTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.HOLY_SIGHT;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(DivineSense$DivineSenseTracker.DURATION - this.visualcooldown())) / DivineSense$DivineSenseTracker.DURATION));
  }
  detach(): void {
    super.detach();
    Dungeon.observe$();
    GameScene.updateFog$();
  }
}

$J.define(DivineSense, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineSense', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_DivineSense' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(DivineSense$DivineSenseTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineSense$DivineSenseTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_DivineSense$DivineSenseTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  LifeLinkSpell$LifeLinkSpellBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
