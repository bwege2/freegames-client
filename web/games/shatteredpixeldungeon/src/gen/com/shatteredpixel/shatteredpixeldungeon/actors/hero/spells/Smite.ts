// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Smite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { TargetedClericSpell } from './TargetedClericSpell.ts';
import { FlavourBuff } from '../../buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Property, Buff, Invisibility, Hero, HeroSubClass, Weapon, Ballistica, Messages, AttackIndicator, HeroIcon, GLog, Sample;

export class Smite extends TargetedClericSpell {
  static INSTANCE: Smite = null;
  _Smite(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.SMITE;
  }
  targetingFlags(): number {
    return Ballistica.STOP_TARGET;
  }
  desc(): string {
    let min = (5 + $J.idiv(Dungeon.hero.lvl, 2)) | 0;
    let max = (10 + Dungeon.hero.lvl) | 0;
    return Messages.get$Object$String$ObjectArr(this, 'desc', [min, max]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  chargeUse(hero: Hero): number {
    return 2;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.subClass === HeroSubClass.PALADIN;
  }
  onTargetSelected(tome: HolyTome, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    let enemy = Actor.findChar(target);
    if (enemy == null || enemy === hero) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_target', []), []);
      return;
    }
    let tracker = Buff.affect$Char$Class(hero, $J.cls(Smite$SmiteTracker));
    if (hero.isCharmedBy(enemy) || !Dungeon.level.heroFOV[target] || !hero.canAttack(enemy)) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'invalid_enemy', []), []);
      tracker.detach();
      return;
    }
    hero.sprite_.attack$int$Callback(enemy.pos, new (Smite$1())().$o(this).$c(enemy, hero, tracker, tome));
  }
  static bonusDmg(attacker: Hero, defender: Char): number {
    let min = (5 + $J.idiv(attacker.lvl, 2)) | 0;
    let max = (10 + attacker.lvl) | 0;
    if (Char.hasProp(defender, Char$Property.UNDEAD) || Char.hasProp(defender, Char$Property.DEMONIC)) {
      return max;
    } else {
      return Hero.heroDamageIntRange(min, max);
    }
  }
  static $clinit() {
    Smite.INSTANCE = new Smite()._Smite();
  }
}

export class Smite$SmiteTracker extends FlavourBuff {
  _Smite$SmiteTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

let $Smite$1: any = null;
/** An anonymous class (Smite.java:95). */
function Smite$1(): any {
  return $Smite$1 ??= $J.local(class extends JObject {
    call(): void {
      AttackIndicator.target(this.$cv_enemy);
      let accMult = 1;
      if (!(this.$cv_hero.belongings.attackingWeapon() instanceof Weapon) || (this.$cv_hero.belongings.attackingWeapon()).STRReq$() <= this.$cv_hero.STR()) {
        accMult = Math.fround(Char.INFINITE_ACCURACY);
      }
      if (this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, 1, 0, accMult)) {
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
        this.$cv_enemy.sprite_.burst(-1, 10);
      }
      this.$cv_tracker.detach();
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      this.$outer.onSpellCast(this.$cv_tome, this.$cv_hero);
    }
    $c($enemy, $hero, $tracker, $tome): this {
      this.$cv_enemy = $enemy; this.$cv_hero = $hero; this.$cv_tracker = $tracker; this.$cv_tome = $tome;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Smite$1', ['com.watabou.utils.Callback']);
}

$J.define(Smite, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Smite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_Smite' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(Smite$SmiteTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Smite$SmiteTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Smite$SmiteTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
