// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Momentum.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Buff$buffType, Talent, Speck, SpellSprite, Messages, PixelScene, CharSprite, ActionIndicator, BuffIndicator, HeroIcon, BitmapText, Sample, GameMath;

export class Momentum extends Buff {
  momentumStacks: number = 0;
  freerunTurns: number = 0;
  freerunCooldown: number = 0;
  movedLastTurn: boolean = false;
  static readonly STACKS: string = 'stacks';
  static readonly FREERUN_TURNS: string = 'freerun_turns';
  static readonly FREERUN_CD: string = 'freerun_CD';
  _Momentum(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.actPriority = (Actor.HERO_PRIO + 1) | 0;
    this.momentumStacks = 0;
    this.freerunTurns = 0;
    this.freerunCooldown = 0;
    this.movedLastTurn = true;
    return this;
  }
  detach(): void {
    super.detach();
    ActionIndicator.clearAction$Action(this);
  }
  act(): boolean {
    if (this.freerunCooldown > 0) {
      this.freerunCooldown--;
    }
    if (this.freerunCooldown === 0 && !this.freerunning() && this.target.invisible > 0 && Dungeon.hero.pointsInTalent(Talent.SPEEDY_STEALTH) >= 1) {
      this.momentumStacks = Math.min((this.momentumStacks + 2) | 0, 10);
      this.movedLastTurn = true;
      ActionIndicator.setAction(this);
      BuffIndicator.refreshHero();
    }
    if (this.freerunTurns > 0) {
      if (this.target.invisible === 0 || Dungeon.hero.pointsInTalent(Talent.SPEEDY_STEALTH) < 2) {
        this.freerunTurns--;
      }
    } else if (!this.movedLastTurn) {
      this.momentumStacks = $J.d2i(GameMath.gate(0, Math.fround((this.momentumStacks - 1) | 0), Math.fround($J.roundf(Math.fround(this.momentumStacks * Math.fround(0.667))))));
      if (this.momentumStacks <= 0) {
        ActionIndicator.clearAction$Action(this);
        BuffIndicator.refreshHero();
      } else {
        ActionIndicator.refresh();
      }
    }
    this.movedLastTurn = false;
    this.spend(Actor.TICK);
    return true;
  }
  gainStack(): void {
    this.movedLastTurn = true;
    if (this.freerunCooldown <= 0 && !this.freerunning()) {
      this.postpone(Math.fround(this.target.cooldown() + (Math.fround(1 / this.target.speed()))));
      this.momentumStacks = Math.min((this.momentumStacks + 1) | 0, 10);
      ActionIndicator.setAction(this);
      BuffIndicator.refreshHero();
    }
  }
  freerunning(): boolean {
    return this.freerunTurns > 0;
  }
  speedMultiplier(): number {
    if (this.freerunning()) {
      return 2;
    } else if (this.target.invisible > 0 && Dungeon.hero.pointsInTalent(Talent.SPEEDY_STEALTH) === 3) {
      return 2;
    } else {
      return 1;
    }
  }
  evasionBonus(heroLvl: number, excessArmorStr: number): number {
    if (this.freerunTurns > 0) {
      return ($J.idiv(heroLvl, 2) + Math.imul(excessArmorStr, Dungeon.hero.pointsInTalent(Talent.EVASIVE_ARMOR))) | 0;
    } else {
      return 0;
    }
  }
  icon(): number {
    if (this.momentumStacks > 0 || this.freerunCooldown > 0) {
      return BuffIndicator.MOMENTUM;
    } else {
      return BuffIndicator.NONE;
    }
  }
  tintIcon(icon: Image): void {
    if (this.freerunCooldown === 0 || this.freerunTurns > 0) {
      icon.hardlight$float$float$float(1, 1, 0);
    } else {
      icon.hardlight$float$float$float(0.5, 0.5, 1);
    }
  }
  iconFadePercent(): number {
    if (this.freerunTurns > 0) {
      return Math.fround(((20 - this.freerunTurns) | 0) / 20);
    } else if (this.freerunCooldown > 0) {
      return Math.fround((this.freerunCooldown) / 30);
    } else {
      return 0;
    }
  }
  iconTextDisplay(): string {
    if (this.freerunTurns > 0) {
      return String(this.freerunTurns);
    } else if (this.freerunCooldown > 0) {
      return String(this.freerunCooldown);
    } else {
      return '';
    }
  }
  name(): string {
    if (this.freerunTurns > 0) {
      return Messages.get$Object$String$ObjectArr(this, 'running', []);
    } else if (this.freerunCooldown > 0) {
      return Messages.get$Object$String$ObjectArr(this, 'resting', []);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'momentum', []);
    }
  }
  desc(): string {
    if (this.freerunTurns > 0) {
      return Messages.get$Object$String$ObjectArr(this, 'running_desc', [this.freerunTurns]);
    } else if (this.freerunCooldown > 0) {
      return Messages.get$Object$String$ObjectArr(this, 'resting_desc', [this.freerunCooldown]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'momentum_desc', [this.momentumStacks]);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Momentum.STACKS, this.momentumStacks);
    bundle.put$String$int(Momentum.FREERUN_TURNS, this.freerunTurns);
    bundle.put$String$int(Momentum.FREERUN_CD, this.freerunCooldown);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.momentumStacks = bundle.getInt(Momentum.STACKS);
    this.freerunTurns = bundle.getInt(Momentum.FREERUN_TURNS);
    this.freerunCooldown = bundle.getInt(Momentum.FREERUN_CD);
    if (this.momentumStacks > 0 && this.freerunTurns <= 0) {
      ActionIndicator.setAction(this);
    }
    this.movedLastTurn = false;
  }
  actionName(): string {
    return Messages.get$Object$String$ObjectArr(this, 'action_name', []);
  }
  actionIcon(): number {
    return HeroIcon.MOMENTUM;
  }
  secondaryVisual(): Visual {
    let txt = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    txt.text$String(String(this.momentumStacks));
    txt.hardlight$int(CharSprite.POSITIVE);
    txt.measure();
    return txt;
  }
  indicatorColor(): number {
    return 4473924;
  }
  doAction(): void {
    this.freerunTurns = Math.imul(2, this.momentumStacks);
    this.freerunCooldown = (10 + Math.imul(4, this.momentumStacks)) | 0;
    Sample.INSTANCE.play$Object$float$float(Assets$Sounds.MISS, 1, Math.fround(0.8));
    this.target.sprite_.emitter().burst(Speck.factory$int(Speck.JET), (5 + this.momentumStacks) | 0);
    SpellSprite.show$Char$int$float$float$float(this.target, SpellSprite.HASTE, 1, 1, 0);
    this.momentumStacks = 0;
    BuffIndicator.refreshHero();
    ActionIndicator.clearAction$Action(this);
  }
}

$J.define(Momentum, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Momentum', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator$Action'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Momentum' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
