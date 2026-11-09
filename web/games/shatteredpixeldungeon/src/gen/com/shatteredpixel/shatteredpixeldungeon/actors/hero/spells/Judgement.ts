// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Judgement.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';
import { ClericSpell } from './ClericSpell.ts';

let Assets$Sounds, Dungeon, Actor, Buff, Hero, HeroSubClass, Talent, AscendedForm$AscendBuff, GuidingLight$Illuminated, Messages, GameScene, HeroIcon, Sample;

export class Judgement extends ClericSpell {
  static INSTANCE: Judgement = null;
  _Judgement(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.JUDGEMENT;
  }
  chargeUse(hero: Hero): number {
    return 3;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.JUDGEMENT) && hero.buff($J.cls(AscendedForm$AscendBuff)) != null;
  }
  onCast(tome: HolyTome, hero: Hero): void {
    hero.sprite_.attack$int$Callback(hero.pos, new (Judgement$1())().$o(this).$c(hero, tome));
    hero.busy();
  }
  desc(): string {
    let baseDmg = (5 + Math.imul(5, Dungeon.hero.pointsInTalent(Talent.JUDGEMENT))) | 0;
    let totalBaseDmg = baseDmg;
    if (Dungeon.hero.buff($J.cls(AscendedForm$AscendBuff)) != null) {
      totalBaseDmg = (totalBaseDmg + $J.roundf(Math.fround(Math.imul(baseDmg, Dungeon.hero.buff($J.cls(AscendedForm$AscendBuff)).spellCasts) / 3))) | 0;
    }
    return Messages.get$Object$String$ObjectArr(this, 'desc', [baseDmg, Math.imul(2, baseDmg), totalBaseDmg, Math.imul(2, totalBaseDmg)]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  static $clinit() {
    Judgement.INSTANCE = new Judgement()._Judgement();
  }
}

let $Judgement$1: any = null;
/** An anonymous class (Judgement.java:65). */
function Judgement$1(): any {
  return $Judgement$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.flash$int(-2130706433);
      Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
      let damageBase = (5 + Math.imul(5, this.$cv_hero.pointsInTalent(Talent.JUDGEMENT))) | 0;
      damageBase = (damageBase + $J.roundf(Math.fround(Math.imul(damageBase, this.$cv_hero.buff($J.cls(AscendedForm$AscendBuff)).spellCasts) / 3))) | 0;
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        if (ch.alignment !== this.$cv_hero.alignment && Dungeon.level.heroFOV[ch.pos]) {
          ch.damage(Hero.heroDamageIntRange(damageBase, Math.imul(2, damageBase)), this.$outer);
          if (this.$cv_hero.subClass === HeroSubClass.PRIEST) {
            Buff.affect$Char$Class(ch, $J.cls(GuidingLight$Illuminated));
          }
        }
      }
      this.$cv_hero.spendAndNext(1);
      this.$outer.onSpellCast(this.$cv_tome, this.$cv_hero);
      this.$cv_hero.buff($J.cls(AscendedForm$AscendBuff)).spellCasts = 0;
    }
    $c($hero, $tome): this {
      this.$cv_hero = $hero; this.$cv_tome = $tome;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Judgement$1', ['com.watabou.utils.Callback']);
}

$J.define(Judgement, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Judgement', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_Judgement' }, clinit: true, lazy: ['INSTANCE'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  AscendedForm$AscendBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.AscendedForm$AscendBuff');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
