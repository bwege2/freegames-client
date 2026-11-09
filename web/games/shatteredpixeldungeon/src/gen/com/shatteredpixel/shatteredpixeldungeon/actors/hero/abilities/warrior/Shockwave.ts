// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/warrior/Shockwave.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';

let Assets$Sounds, Actor, Char$Alignment, Buff, Combo, Cripple, Invisibility, Paralysis, Hero, HeroSubClass, Talent, Talent$StrikingWaveTracker, Mimic, MagicMissile, Item, Ballistica, ConeAOE, Messages, PixelScene, HeroIcon, GLog, Sample, Random;

export class Shockwave extends ArmorAbility {
  _Shockwave(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 35;
    return this;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  targetedPos(user: Char, dst: number): number {
    return (new Ballistica()._Ballistica(user.pos, dst, Ballistica.STOP_SOLID | Ballistica.STOP_TARGET)).collisionPos;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    if (target === hero.pos) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'self_target', []), []);
      return;
    }
    hero.busy();
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
    let aim = new Ballistica()._Ballistica(hero.pos, target, Ballistica.WONT_STOP);
    let maxDist = (5 + hero.pointsInTalent(Talent.EXPANDING_WAVE)) | 0;
    let dist = Math.min(aim.dist, maxDist);
    let cone = new ConeAOE()._ConeAOE$Ballistica$float$float$int(aim, Math.fround(dist), Math.fround((60 + Math.imul(15, hero.pointsInTalent(Talent.EXPANDING_WAVE))) | 0), Ballistica.STOP_SOLID | Ballistica.STOP_TARGET);
    for (const $it0 = cone.outerRays.iterator(); $it0.hasNext(); ) {
      let ray = $it0.next();
      (hero.sprite_.parent.recycle($J.cls(MagicMissile))).reset$int$Visual$int$Callback(MagicMissile.FORCE_CONE, hero.sprite_, ray.path.get(ray.dist), null);
    }
    hero.sprite_.zap$int(target);
    Sample.INSTANCE.play$Object$float$float(Assets$Sounds.BLAST, 1, 0.5);
    PixelScene.shake(2, 0.5);
    MagicMissile.boltFromChar(hero.sprite_.parent, MagicMissile.FORCE_CONE, hero.sprite_, cone.coreRay.path.get($J.idiv(Math.imul(dist, 2), 3)), new (Shockwave$1())().$o(this).$c(cone, hero));
  }
  icon(): number {
    return HeroIcon.SHOCKWAVE;
  }
  talents(): Talent[] {
    return [Talent.EXPANDING_WAVE, Talent.STRIKING_WAVE, Talent.SHOCK_FORCE, Talent.HEROIC_ENERGY];
  }
}

let $Shockwave$1: any = null;
/** An anonymous class (Shockwave.java:108). */
function Shockwave$1(): any {
  return $Shockwave$1 ??= $J.local(class extends JObject {
    call(): void {
      for (const $it1 = this.$cv_cone.cells.iterator(); $it1.hasNext(); ) {
        let cell = $it1.next();
        let ch = Actor.findChar(cell);
        if (ch != null && ch.alignment !== this.$cv_hero.alignment) {
          let scalingStr = (this.$cv_hero.STR() - 10) | 0;
          let damage = Hero.heroDamageIntRange((5 + scalingStr) | 0, (10 + Math.imul(2, scalingStr)) | 0);
          damage = $J.roundf(Math.fround(damage * (Math.fround(1 + Math.fround(Math.fround(0.2) * this.$cv_hero.pointsInTalent(Talent.SHOCK_FORCE))))));
          damage = (damage - ch.drRoll()) | 0;
          if (this.$cv_hero.pointsInTalent(Talent.STRIKING_WAVE) === 4) {
            Buff.affect$Char$Class$float(this.$cv_hero, $J.cls(Talent$StrikingWaveTracker), 0);
          }
          if (Random.Int$int(10) < Math.imul(3, this.$cv_hero.pointsInTalent(Talent.STRIKING_WAVE))) {
            let wasEnemy = ch.alignment === Char$Alignment.ENEMY || (ch instanceof Mimic && ch.alignment === Char$Alignment.NEUTRAL);
            damage = this.$cv_hero.attackProc(ch, damage);
            ch.damage(damage, this.$cv_hero);
            if (this.$cv_hero.subClass === HeroSubClass.GLADIATOR && wasEnemy) {
              Buff.affect$Char$Class(this.$cv_hero, $J.cls(Combo)).hit(ch);
            }
          } else {
            ch.damage(damage, this.$cv_hero);
          }
          if (ch.isAlive()) {
            if (Random.Int$int(4) < this.$cv_hero.pointsInTalent(Talent.SHOCK_FORCE)) {
              Buff.affect$Char$Class$float(ch, $J.cls(Paralysis), 5);
            } else {
              Buff.affect$Char$Class$float(ch, $J.cls(Cripple), 5);
            }
          }
        }
      }
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(Actor.TICK);
    }
    $c($cone, $hero): this {
      this.$cv_cone = $cone; this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.Shockwave$1', ['com.watabou.utils.Callback']);
}

$J.define(Shockwave, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.Shockwave', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_Shockwave' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Combo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$StrikingWaveTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$StrikingWaveTracker');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
