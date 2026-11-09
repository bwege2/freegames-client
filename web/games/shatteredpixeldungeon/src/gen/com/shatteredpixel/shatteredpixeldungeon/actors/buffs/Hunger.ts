// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Hunger.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Buff } from './Buff.ts';

let Badges, Dungeon, SPDSettings, Actor, Shadows, WellFed, Hero, ScrollOfChallenge$ChallengeArena, SaltCube, Document, Messages, GameScene, BuffIndicator, GLog;

export class Hunger extends Buff {
  static readonly HUNGRY: number = 300;
  static readonly STARVING: number = 450;
  level_: number = 0;
  partialDamage: number = 0;
  static readonly LEVEL: string = 'level';
  static readonly PARTIALDAMAGE: string = 'partialDamage';
  _Hunger(): this {
    this._Buff();
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Hunger.LEVEL, this.level_);
    bundle.put$String$float(Hunger.PARTIALDAMAGE, this.partialDamage);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.level_ = bundle.getFloat(Hunger.LEVEL);
    this.partialDamage = bundle.getFloat(Hunger.PARTIALDAMAGE);
  }
  act(): boolean {
    if (Dungeon.level.locked || this.target.buff($J.cls(WellFed)) != null || SPDSettings.intro$() || this.target.buff($J.cls(ScrollOfChallenge$ChallengeArena)) != null) {
      this.spend(Actor.TICK);
      return true;
    }
    if (this.target.isAlive() && this.target instanceof Hero) {
      let hero = this.target;
      if (this.isStarving()) {
        this.partialDamage = Math.fround(this.partialDamage + Math.fround(this.target.HT / 1000));
        if (this.partialDamage > Math.fround(1)) {
          this.target.damage($J.d2i(this.partialDamage), this);
          this.partialDamage = Math.fround(this.partialDamage - $J.d2i(this.partialDamage));
        }
      } else {
        let hungerDelay = 1;
        if (this.target.buff($J.cls(Shadows)) != null) {
          hungerDelay = Math.fround(hungerDelay * 1.5);
        }
        hungerDelay = Math.fround(hungerDelay / SaltCube.hungerGainMultiplier$());
        let newLevel = Math.fround(this.level_ + (Math.fround(1 / hungerDelay)));
        if (newLevel >= Hunger.STARVING) {
          GLog.n(Messages.get$Object$String$ObjectArr(this, 'onstarving', []), []);
          hero.damage(1, this);
          hero.interrupt();
          newLevel = Hunger.STARVING;
        } else if (newLevel >= Hunger.HUNGRY && this.level_ < Hunger.HUNGRY) {
          GLog.w(Messages.get$Object$String$ObjectArr(this, 'onhungry', []), []);
          if (!Document.ADVENTURERS_GUIDE.isPageRead$String(Document.GUIDE_FOOD)) {
            GameScene.flashForDocument(Document.ADVENTURERS_GUIDE, Document.GUIDE_FOOD);
          }
        }
        this.level_ = newLevel;
      }
      this.spend(Actor.TICK);
    } else {
      this.diactivate();
    }
    return true;
  }
  satisfy(energy: number): void {
    this.affectHunger$float$boolean(energy, false);
  }
  affectHunger$float(energy: number): void {
    this.affectHunger$float$boolean(energy, false);
  }
  affectHunger$float$boolean(energy: number, overrideLimits: boolean): void {
    if (energy < Math.fround(0) && this.target.buff($J.cls(WellFed)) != null) {
      this.target.buff($J.cls(WellFed)).left_ = $J.d2i(Math.fround(this.target.buff($J.cls(WellFed)).left_ + energy));
      BuffIndicator.refreshHero();
      return;
    }
    let oldLevel = this.level_;
    this.level_ = Math.fround(this.level_ - energy);
    if (this.level_ < Math.fround(0) && !overrideLimits) {
      this.level_ = 0;
    } else if (this.level_ > Hunger.STARVING) {
      let excess = Math.fround(this.level_ - Hunger.STARVING);
      this.level_ = Hunger.STARVING;
      this.partialDamage = Math.fround(this.partialDamage + Math.fround(excess * (Math.fround(this.target.HT / 1000))));
      if (this.partialDamage > 1) {
        this.target.damage($J.d2i(this.partialDamage), this);
        this.partialDamage = Math.fround(this.partialDamage - $J.d2i(this.partialDamage));
      }
    }
    if (oldLevel < Hunger.HUNGRY && this.level_ >= Hunger.HUNGRY) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'onhungry', []), []);
    } else if (oldLevel < Hunger.STARVING && this.level_ >= Hunger.STARVING) {
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'onstarving', []), []);
      this.target.damage(1, this);
    }
    BuffIndicator.refreshHero();
  }
  isStarving(): boolean {
    return this.level_ >= Hunger.STARVING;
  }
  hunger(): number {
    return $J.d2i(Math.ceil(this.level_));
  }
  icon(): number {
    if (this.level_ < Hunger.HUNGRY) {
      return BuffIndicator.NONE;
    } else if (this.level_ < Hunger.STARVING) {
      return BuffIndicator.HUNGER;
    } else {
      return BuffIndicator.STARVATION;
    }
  }
  name(): string {
    if (this.level_ < Hunger.STARVING) {
      return Messages.get$Object$String$ObjectArr(this, 'hungry', []);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'starving', []);
    }
  }
  desc(): string {
    let result: string;
    if (this.level_ < Hunger.STARVING) {
      result = Messages.get$Object$String$ObjectArr(this, 'desc_intro_hungry', []);
    } else {
      result = Messages.get$Object$String$ObjectArr(this, 'desc_intro_starving', []);
    }
    result += Messages.get$Object$String$ObjectArr(this, 'desc', []);
    return result;
  }
  onDeath(): void {
    Badges.validateDeathFromHunger();
    Dungeon.fail(this);
    GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
  }
}

$J.define(Hunger, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$Doom'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Hunger' }, meths: { 'affectHunger(float,boolean)': 'affectHunger$float$boolean', 'affectHunger(float)': 'affectHunger$float' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Shadows = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Shadows');
  WellFed = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.WellFed');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  ScrollOfChallenge$ChallengeArena = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfChallenge$ChallengeArena');
  SaltCube = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.SaltCube');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
