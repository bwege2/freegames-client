// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/LayOnHands.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Barrier, Buff, Talent, PowerOfMany, LifeLinkSpell$LifeLinkSpellBuff, FloatingText, Messages, CharSprite, HeroIcon, GLog, Sample;

export class LayOnHands extends TargetedClericSpell {
  static INSTANCE: LayOnHands = null;
  _LayOnHands(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.LAY_ON_HANDS;
  }
  desc(): string {
    return (Messages.get$Object$String$ObjectArr(this, 'desc', [(10 + Math.imul(5, Dungeon.hero.pointsInTalent(Talent.LAY_ON_HANDS))) | 0])) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  targetingFlags(): number {
    return -1;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.LAY_ON_HANDS);
  }
  onTargetSelected(tome: HolyTome, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    if (Dungeon.level.distance(hero.pos, target) > 1) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'invalid_target', []), []);
      return;
    }
    let ch = Actor.findChar(target);
    if (ch == null) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_target', []), []);
      return;
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    this.affectChar(hero, ch);
    if (ch === hero) {
      hero.sprite_.operate$int(ch.pos);
      hero.next();
    } else {
      hero.sprite_.zap$int(ch.pos);
      hero.next();
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
    let totalHeal = (10 + Math.imul(5, hero.pointsInTalent(Talent.LAY_ON_HANDS))) | 0;
    let totalBarrier = 0;
    if (ch === hero) {
      let barrier = Buff.affect$Char$Class(ch, $J.cls(Barrier));
      totalBarrier = totalHeal;
      totalBarrier = Math.min((Math.imul(3, totalHeal) - barrier.shielding()) | 0, totalBarrier);
      totalBarrier = Math.max(0, totalBarrier);
      Buff.affect$Char$Class(ch, $J.cls(Barrier)).incShield$int(totalBarrier);
      ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(totalBarrier), FloatingText.SHIELDING, []);
    } else {
      if (((ch.HT - ch.HP) | 0) < totalHeal) {
        totalBarrier = (totalHeal - (ch.HT - ch.HP)) | 0;
        if (ch.HP !== ch.HT) {
          ch.HP = ch.HT;
          ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String((totalHeal - totalBarrier) | 0), FloatingText.HEALING, []);
        }
        if (totalBarrier > 0) {
          let barrier = Buff.affect$Char$Class(ch, $J.cls(Barrier));
          totalBarrier = Math.min((Math.imul(3, totalHeal) - barrier.shielding()) | 0, totalBarrier);
          totalBarrier = Math.max(0, totalBarrier);
          if (totalBarrier > 0) {
            barrier.incShield$int(totalBarrier);
            ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(totalBarrier), FloatingText.SHIELDING, []);
          }
        }
      } else {
        ch.HP = (ch.HP + totalHeal) | 0;
        ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(totalHeal), FloatingText.HEALING, []);
      }
    }
  }
  static $clinit() {
    LayOnHands.INSTANCE = new LayOnHands()._LayOnHands();
  }
}

$J.define(LayOnHands, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LayOnHands', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_LayOnHands' }, clinit: true, lazy: ['INSTANCE'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  LifeLinkSpell$LifeLinkSpellBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
