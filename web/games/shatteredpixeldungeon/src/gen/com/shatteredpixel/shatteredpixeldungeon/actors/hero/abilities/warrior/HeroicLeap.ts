// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/warrior/HeroicLeap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from '../../../buffs/FlavourBuff.ts';

let Dungeon, Actor, Char$Alignment, Buff, Invisibility, Vulnerable, Hero, Talent, Item, WandOfBlastWave, WandOfBlastWave$BlastWave, Ballistica, Messages, GameScene, PixelScene, HeroIcon, PathFinder, Random;

export class HeroicLeap extends ArmorAbility {
  _HeroicLeap(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 35;
    return this;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  chargeUse(hero: Hero): number {
    let chargeUse = super.chargeUse(hero);
    if (hero.buff($J.cls(HeroicLeap$DoubleJumpTracker)) != null) {
      chargeUse = Math.fround(chargeUse * $J.pow(0.84, hero.pointsInTalent(Talent.DOUBLE_JUMP)));
    }
    return chargeUse;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (target != null) {
      if (hero.rooted) {
        PixelScene.shake(1, 1);
        return;
      }
      let route = new Ballistica()._Ballistica(hero.pos, target, Ballistica.STOP_TARGET | Ballistica.STOP_SOLID);
      let cell = route.collisionPos;
      let backTrace = (route.dist - 1) | 0;
      while (Actor.findChar(cell) != null && cell !== hero.pos) {
        cell = route.path.get(backTrace);
        backTrace--;
      }
      armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
      Item.updateQuickslot();
      let dest = cell;
      hero.busy();
      hero.sprite_.jump$int$int$Callback(hero.pos, cell, new (HeroicLeap$1())().$o(this).$c(hero, dest));
    }
  }
  icon(): number {
    return HeroIcon.HEROIC_LEAP;
  }
  talents(): Talent[] {
    return [Talent.BODY_SLAM, Talent.IMPACT_WAVE, Talent.DOUBLE_JUMP, Talent.HEROIC_ENERGY];
  }
}

export class HeroicLeap$DoubleJumpTracker extends FlavourBuff {
  _HeroicLeap$DoubleJumpTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

let $HeroicLeap$1: any = null;
/** An anonymous class (HeroicLeap.java:90). */
function HeroicLeap$1(): any {
  return $HeroicLeap$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_hero.move$int(this.$cv_dest);
      Dungeon.level.occupyCell(this.$cv_hero);
      Dungeon.observe$();
      GameScene.updateFog$();
      for (let i of PathFinder.NEIGHBOURS8) {
        let mob = Actor.findChar((this.$cv_hero.pos + i) | 0);
        if (mob != null && mob !== this.$cv_hero && mob.alignment !== Char$Alignment.ALLY) {
          if (this.$cv_hero.hasTalent(Talent.BODY_SLAM)) {
            let damage = Hero.heroDamageIntRange(this.$cv_hero.pointsInTalent(Talent.BODY_SLAM), Math.imul(4, this.$cv_hero.pointsInTalent(Talent.BODY_SLAM)));
            damage = (damage + $J.roundf(Math.fround(Math.fround(this.$cv_hero.drRoll() * 0.25) * this.$cv_hero.pointsInTalent(Talent.BODY_SLAM)))) | 0;
            damage = (damage - mob.drRoll()) | 0;
            mob.damage(damage, this.$cv_hero);
          }
          if (mob.pos === ((this.$cv_hero.pos + i) | 0) && this.$cv_hero.hasTalent(Talent.IMPACT_WAVE)) {
            let trajectory = new Ballistica()._Ballistica(mob.pos, (mob.pos + i) | 0, Ballistica.MAGIC_BOLT);
            let strength = (1 + this.$cv_hero.pointsInTalent(Talent.IMPACT_WAVE)) | 0;
            WandOfBlastWave.throwChar(mob, trajectory, strength, true, true, this.$outer);
            if (Random.Int$int(4) < this.$cv_hero.pointsInTalent(Talent.IMPACT_WAVE)) {
              Buff.prolong(mob, $J.cls(Vulnerable), 5);
            }
          }
        }
      }
      WandOfBlastWave$BlastWave.blast$int(this.$cv_dest);
      PixelScene.shake(2, 0.5);
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(Actor.TICK);
      if (this.$cv_hero.buff($J.cls(HeroicLeap$DoubleJumpTracker)) != null) {
        this.$cv_hero.buff($J.cls(HeroicLeap$DoubleJumpTracker)).detach();
      } else {
        if (this.$cv_hero.hasTalent(Talent.DOUBLE_JUMP)) {
          Buff.affect$Char$Class$float(this.$cv_hero, $J.cls(HeroicLeap$DoubleJumpTracker), 3);
        }
      }
    }
    $c($hero, $dest): this {
      this.$cv_hero = $hero; this.$cv_dest = $dest;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.HeroicLeap$1', ['com.watabou.utils.Callback']);
}

$J.define(HeroicLeap, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.HeroicLeap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_HeroicLeap' } });
$J.define(HeroicLeap$DoubleJumpTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.HeroicLeap$DoubleJumpTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_HeroicLeap$DoubleJumpTracker' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Vulnerable = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vulnerable');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  WandOfBlastWave$BlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave$BlastWave');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
