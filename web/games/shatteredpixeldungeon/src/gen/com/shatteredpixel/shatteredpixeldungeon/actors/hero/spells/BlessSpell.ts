// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/BlessSpell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Barrier, Bless, Buff, HeroSubClass, Talent, PowerOfMany, GuidingLight$Illuminated, LifeLinkSpell$LifeLinkSpellBuff, Flare, FloatingText, Messages, CharSprite, HeroIcon, GLog, Sample;

export class BlessSpell extends TargetedClericSpell {
  static INSTANCE: BlessSpell = null;
  _BlessSpell(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.BLESS;
  }
  targetingFlags(): number {
    return -1;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.BLESS);
  }
  onTargetSelected(tome: HolyTome, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    let ch = Actor.findChar(target);
    if (ch == null || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_target', []), []);
      return;
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    this.affectChar(hero, ch);
    if (ch === hero) {
      hero.busy();
      hero.sprite_.operate$int(ch.pos);
      hero.spend(1);
    } else {
      hero.sprite_.zap$int(ch.pos);
      hero.spendAndNext(1);
    }
    let ally = PowerOfMany.getPoweredAlly();
    if (ally != null && ally.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null) {
      if (ch === hero) {
        this.affectChar(hero, ally);
      } else if (ally === ch) {
        this.affectChar(hero, hero);
      }
    }
    this.onSpellCast(tome, hero);
  }
  affectChar(hero: Hero, ch: Char): void {
    new Flare()._Flare(6, 32).color$int$boolean(16776960, true).show$Visual$float(ch.sprite_, 2);
    if (ch === hero) {
      Buff.prolong(ch, $J.cls(Bless), Math.fround(2 + Math.imul(4, hero.pointsInTalent(Talent.BLESS))));
      Buff.affect$Char$Class(ch, $J.cls(Barrier)).setShield((5 + Math.imul(5, hero.pointsInTalent(Talent.BLESS))) | 0);
      ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String((5 + Math.imul(5, hero.pointsInTalent(Talent.BLESS))) | 0), FloatingText.SHIELDING, []);
    } else {
      Buff.prolong(ch, $J.cls(Bless), Math.fround(5 + Math.imul(5, hero.pointsInTalent(Talent.BLESS))));
      let totalHeal = (5 + Math.imul(5, hero.pointsInTalent(Talent.BLESS))) | 0;
      if (((ch.HT - ch.HP) | 0) < totalHeal) {
        let barrier = (totalHeal - (ch.HT - ch.HP)) | 0;
        barrier = Math.max(barrier, 0);
        if (ch.HP !== ch.HT) {
          ch.HP = ch.HT;
          ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String((totalHeal - barrier) | 0), FloatingText.HEALING, []);
        }
        if (barrier > 0) {
          Buff.affect$Char$Class(ch, $J.cls(Barrier)).setShield(barrier);
          ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(barrier), FloatingText.SHIELDING, []);
        }
      } else {
        ch.HP = (ch.HP + totalHeal) | 0;
        ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(totalHeal), FloatingText.HEALING, []);
      }
    }
    if (ch.alignment !== Char$Alignment.ALLY && hero.subClass === HeroSubClass.PRIEST) {
      Buff.affect$Char$Class(ch, $J.cls(GuidingLight$Illuminated));
    }
  }
  desc(): string {
    let talentLvl = Dungeon.hero.pointsInTalent(Talent.BLESS);
    return (Messages.get$Object$String$ObjectArr(this, 'desc', [(2 + Math.imul(4, talentLvl)) | 0, (5 + Math.imul(5, talentLvl)) | 0, (5 + Math.imul(5, talentLvl)) | 0, (5 + Math.imul(5, talentLvl)) | 0])) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  static $clinit() {
    BlessSpell.INSTANCE = new BlessSpell()._BlessSpell();
  }
}

$J.define(BlessSpell, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BlessSpell', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_BlessSpell' }, clinit: true, lazy: ['INSTANCE'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Bless = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bless');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  LifeLinkSpell$LifeLinkSpellBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
