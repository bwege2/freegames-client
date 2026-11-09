// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/rogue/DeathMark.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';
import { FlavourBuff } from '../../../buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Barrier, Buff, Buff$buffType, Cripple, Terror, Talent, FloatingText, Item, Messages, CharSprite, BuffIndicator, HeroIcon, GLog, Sample, BArray, PathFinder;

export class DeathMark extends ArmorAbility {
  _DeathMark(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 25;
    return this;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  targetedPos(user: Char, dst: number): number {
    return dst;
  }
  chargeUse(hero: Hero): number {
    let chargeUse = super.chargeUse(hero);
    if (hero.buff($J.cls(DeathMark$DoubleMarkTracker)) != null) {
      chargeUse = Math.fround(chargeUse * $J.pow(0.707, hero.pointsInTalent(Talent.DOUBLE_MARK)));
    }
    return chargeUse;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    let ch = Actor.findChar(target);
    if (ch == null || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_target', []), []);
      return;
    } else if (ch.alignment !== Char$Alignment.ENEMY) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ally_target', []), []);
      return;
    }
    if (ch != null) {
      Buff.affect$Char$Class$float(ch, $J.cls(DeathMark$DeathMarkTracker), DeathMark$DeathMarkTracker.DURATION).setInitialHP(ch.HP);
    }
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
    hero.sprite_.zap$int(target);
    hero.next();
    if (hero.buff($J.cls(DeathMark$DoubleMarkTracker)) != null) {
      hero.buff($J.cls(DeathMark$DoubleMarkTracker)).detach();
    } else if (hero.hasTalent(Talent.DOUBLE_MARK)) {
      Buff.affect$Char$Class$float(hero, $J.cls(DeathMark$DoubleMarkTracker), Math.fround(0.01));
    }
  }
  static processFearTheReaper(ch: Char): void {
    if (ch.HP > 0 || ch.buff($J.cls(DeathMark$DeathMarkTracker)) == null) {
      return;
    }
    if (Dungeon.hero.hasTalent(Talent.FEAR_THE_REAPER)) {
      if (Dungeon.hero.pointsInTalent(Talent.FEAR_THE_REAPER) >= 2) {
        Buff.prolong(ch, $J.cls(Terror), 5).object = Dungeon.hero.id();
      }
      Buff.prolong(ch, $J.cls(Cripple), 5);
      if (Dungeon.hero.pointsInTalent(Talent.FEAR_THE_REAPER) >= 3) {
        let passable = BArray.not(Dungeon.level.solid, null);
        PathFinder.buildDistanceMap$int$booleanArr$int(ch.pos, passable, 3);
        for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
          let near = $it0.next();
          if (near !== ch && near.alignment === Char$Alignment.ENEMY && PathFinder.distance[near.pos] !== 2147483647) {
            if (Dungeon.hero.pointsInTalent(Talent.FEAR_THE_REAPER) === 4) {
              Buff.prolong(near, $J.cls(Terror), 5).object = Dungeon.hero.id();
            }
            Buff.prolong(near, $J.cls(Cripple), 5);
          }
        }
      }
    }
  }
  icon(): number {
    return HeroIcon.DEATH_MARK;
  }
  talents(): Talent[] {
    return [Talent.FEAR_THE_REAPER, Talent.DEATHLY_DURABILITY, Talent.DOUBLE_MARK, Talent.HEROIC_ENERGY];
  }
}

export class DeathMark$DoubleMarkTracker extends FlavourBuff {
  _DeathMark$DoubleMarkTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class DeathMark$DeathMarkTracker extends FlavourBuff {
  static DURATION: number = 0;
  initialHP: number = 0;
  static INITIAL_HP: string = null;
  _DeathMark$DeathMarkTracker(): this {
    this._FlavourBuff();
    this.initialHP = 0;
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  icon(): number {
    return BuffIndicator.INVERT_MARK;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, Math.fround(0.2), Math.fround(0.2));
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(DeathMark$DeathMarkTracker.DURATION - this.visualcooldown())) / DeathMark$DeathMarkTracker.DURATION));
  }
  setInitialHP(hp: number): void {
    if (this.initialHP < hp) {
      this.initialHP = hp;
    }
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.deathMarked = true;
      return true;
    } else {
      return false;
    }
  }
  detach(): void {
    super.detach();
    this.target.deathMarked = false;
    if (!this.target.isAlive()) {
      this.target.sprite_.flash();
      this.target.sprite_.bloodBurstA(this.target.sprite_.center$(), Math.imul(this.target.HT, 2));
      Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STAB);
      Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
      this.target.die(this);
      let shld = $J.roundf(Math.fround(this.initialHP * (Math.fround(0.125 * Dungeon.hero.pointsInTalent(Talent.DEATHLY_DURABILITY)))));
      if (shld > 0 && this.target.alignment !== Char$Alignment.ALLY) {
        Dungeon.hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shld), FloatingText.SHIELDING, []);
        Buff.affect$Char$Class(Dungeon.hero, $J.cls(Barrier)).setShield(shld);
      }
    }
  }
  detachOnDeath(): void {
    super.detach();
    this.target.deathMarked = false;
    if (!this.target.isAlive()) {
      this.target.sprite_.flash();
      this.target.sprite_.bloodBurstA(this.target.sprite_.center$(), Math.imul(this.target.HT, 2));
      Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STAB);
      Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
      let shld = $J.roundf(Math.fround(this.initialHP * (Math.fround(0.125 * Dungeon.hero.pointsInTalent(Talent.DEATHLY_DURABILITY)))));
      if (shld > 0 && this.target.alignment !== Char$Alignment.ALLY) {
        Dungeon.hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shld), FloatingText.SHIELDING, []);
        Buff.affect$Char$Class(Dungeon.hero, $J.cls(Barrier)).setShield(shld);
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(DeathMark$DeathMarkTracker.INITIAL_HP, this.initialHP);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.initialHP = bundle.getInt(DeathMark$DeathMarkTracker.INITIAL_HP);
  }
  static $clinit() {
    DeathMark$DeathMarkTracker.DURATION = 5;
    DeathMark$DeathMarkTracker.INITIAL_HP = 'initial_hp';
  }
}

$J.define(DeathMark, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.DeathMark', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_DeathMark' } });
$J.define(DeathMark$DoubleMarkTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.DeathMark$DoubleMarkTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_DeathMark$DoubleMarkTracker' } });
$J.define(DeathMark$DeathMarkTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.DeathMark$DeathMarkTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_DeathMark$DeathMarkTracker' }, clinit: true, lazy: ['DURATION', 'INITIAL_HP'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
