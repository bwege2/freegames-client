// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/LifeLinkSpell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Buff, Buff$buffType, LifeLink, Talent, PowerOfMany, Stasis, Beam$HealthRay, Messages, DungeonTilemap, BuffIndicator, HeroIcon, Sample;

export class LifeLinkSpell extends ClericSpell {
  static INSTANCE: LifeLinkSpell = null;
  _LifeLinkSpell(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.LIFE_LINK;
  }
  desc(): string {
    return (Messages.get$Object$String$ObjectArr(this, 'desc', [(4 + Math.imul(2, Dungeon.hero.pointsInTalent(Talent.LIFE_LINK))) | 0, (30 + Math.imul(5, Dungeon.hero.pointsInTalent(Talent.LIFE_LINK))) | 0])) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.LIFE_LINK) && (PowerOfMany.getPoweredAlly() != null || Stasis.getStasisAlly() != null);
  }
  chargeUse(hero: Hero): number {
    return 2;
  }
  onCast(tome: HolyTome, hero: Hero): void {
    let duration = $J.roundf(Math.fround(Math.fround(6.67) + Math.fround(Math.fround(3.33) * Dungeon.hero.pointsInTalent(Talent.LIFE_LINK))));
    let ally = PowerOfMany.getPoweredAlly();
    if (ally != null) {
      hero.sprite_.zap$int(ally.pos);
      hero.sprite_.parent.add$Gizmo(new Beam$HealthRay()._Beam$HealthRay(hero.sprite_.center$(), ally.sprite_.center$()));
      Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
      Buff.prolong(hero, $J.cls(LifeLink), Math.fround(duration)).object = ally.id();
    } else {
      ally = Stasis.getStasisAlly();
      hero.sprite_.operate$int(hero.pos);
      hero.sprite_.parent.add$Gizmo(new Beam$HealthRay()._Beam$HealthRay(DungeonTilemap.tileCenterToWorld(hero.pos), hero.sprite_.center$()));
      Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
    }
    Buff.prolong(ally, $J.cls(LifeLink), Math.fround(duration)).object = hero.id();
    Buff.prolong(ally, $J.cls(LifeLinkSpell$LifeLinkSpellBuff), Math.fround(duration));
    if (ally === Stasis.getStasisAlly()) {
      ally.buff($J.cls(LifeLink)).clearTime();
      ally.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)).clearTime();
    }
    hero.spendAndNext(Actor.TICK);
    this.onSpellCast(tome, hero);
  }
  static $clinit() {
    LifeLinkSpell.INSTANCE = new LifeLinkSpell()._LifeLinkSpell();
  }
}

export class LifeLinkSpell$LifeLinkSpellBuff extends FlavourBuff {
  _LifeLinkSpell$LifeLinkSpellBuff(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.HOLY_ARMOR;
  }
  iconFadePercent(): number {
    let duration = $J.roundf(Math.fround(Math.fround(6.67) + Math.fround(Math.fround(3.33) * Dungeon.hero.pointsInTalent(Talent.LIFE_LINK))));
    return Math.max(0, Math.fround((Math.fround(duration - this.visualcooldown())) / duration));
  }
}

$J.define(LifeLinkSpell, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_LifeLinkSpell' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(LifeLinkSpell$LifeLinkSpellBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_LifeLinkSpell$LifeLinkSpellBuff' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  LifeLink = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LifeLink');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  Stasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis');
  Beam$HealthRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$HealthRay');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
