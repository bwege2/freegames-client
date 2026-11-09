// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/RunicBlade.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { MeleeWeapon } from './MeleeWeapon.ts';
import { FlavourBuff } from '../../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Buff, Invisibility, Messages, ItemSpriteSheet, AttackIndicator, GLog, Sample;

export class RunicBlade extends MeleeWeapon {
  _RunicBlade(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.RUNIC_BLADE;
    this.hitSound_ = Assets$Sounds.HIT_SLASH;
    this.hitSoundPitch = 1;
    this.tier_ = 4;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(5, (this.tier_)) + $J.roundf(Math.fround(Math.imul(lvl, ((this.tier_ + 2) | 0))))) | 0;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    let enemy = Actor.findChar(target);
    if (enemy == null || enemy === hero || hero.isCharmedBy(enemy) || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_no_target', []), []);
      return;
    }
    let tracker = Buff.affect$Char$Class(hero, $J.cls(RunicBlade$RunicSlashTracker));
    tracker.boost_ = Math.fround(3 + Math.fround(0.5 * this.buffedLvl()));
    hero.belongings.abilityWeapon = this;
    if (!hero.canAttack(enemy)) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_target_range', []), []);
      tracker.detach();
      hero.belongings.abilityWeapon = null;
      return;
    }
    hero.belongings.abilityWeapon = null;
    hero.sprite_.attack$int$Callback(enemy.pos, new (RunicBlade$1())().$o(this).$c(hero, enemy, tracker));
  }
  abilityInfo(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [(300 + Math.imul(50, this.buffedLvl())) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [300]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return '+' + ((300 + Math.imul(50, level)) | 0) + '%';
  }
}

export class RunicBlade$RunicSlashTracker extends FlavourBuff {
  boost_: number = 0;
  _RunicBlade$RunicSlashTracker(): this {
    this._FlavourBuff();
    this.boost_ = 2;
    return this;
  }
}

let $RunicBlade$1: any = null;
/** An anonymous class (RunicBlade.java:87). */
function RunicBlade$1(): any {
  return $RunicBlade$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.beforeAbilityUsed(this.$cv_hero, this.$cv_enemy);
      AttackIndicator.target(this.$cv_enemy);
      if (this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, 1, 0, Math.fround(Char.INFINITE_ACCURACY))) {
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
        if (!this.$cv_enemy.isAlive()) {
          MeleeWeapon.onAbilityKill(this.$cv_hero, this.$cv_enemy);
        }
      }
      this.$cv_tracker.detach();
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      this.$outer.afterAbilityUsed(this.$cv_hero);
    }
    $c($hero, $enemy, $tracker): this {
      this.$cv_hero = $hero; this.$cv_enemy = $enemy; this.$cv_tracker = $tracker;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RunicBlade$1', ['com.watabou.utils.Callback']);
}

$J.define(RunicBlade, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RunicBlade', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_RunicBlade' }, meths: { 'max(int)': 'max$int' } });
$J.define(RunicBlade$RunicSlashTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RunicBlade$RunicSlashTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_RunicBlade$RunicSlashTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
