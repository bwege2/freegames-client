// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Burning.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Buff } from './Buff.ts';

let Badges, Dungeon, Actor, Blob, Fire, Barrier, Buff$buffType, Chill, TimeStasis, Hero, Thief, ElmoParticle, Heap, Armor$Glyph, Brimstone, TimekeepersHourglass$timeStasis, ChargrilledMeat, FrozenCarpaccio, MysteryMeat, Scroll, VaultLevel, Messages, GameScene, CharSprite$State, BuffIndicator, GLog, Random;

export class Burning extends Buff {
  static readonly DURATION: number = 8;
  left_: number = 0;
  acted: boolean = false;
  burnIncrement: number = 0;
  nextHit: number = 0;
  static readonly LEFT: string = 'left';
  static readonly ACTED: string = 'acted';
  static readonly BURN: string = 'burnIncrement';
  static readonly NEXT_DMG: string = 'next_dmg';
  _Burning(): this {
    this._Buff();
    this.acted = false;
    this.burnIncrement = 0;
    this.nextHit = 0;
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Burning.LEFT, this.left_);
    bundle.put$String$boolean(Burning.ACTED, this.acted);
    bundle.put$String$int(Burning.BURN, this.burnIncrement);
    bundle.put$String$int(Burning.NEXT_DMG, this.nextHit);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getFloat(Burning.LEFT);
    this.acted = bundle.getBoolean(Burning.ACTED);
    this.burnIncrement = bundle.getInt(Burning.BURN);
    this.nextHit = bundle.getInt(Burning.NEXT_DMG);
  }
  attachTo(target: Char): boolean {
    Buff.detach(target, $J.cls(Chill));
    return super.attachTo(target);
  }
  act(): boolean {
    if (this.acted && Dungeon.level.water[this.target.pos] && !this.target.flying) {
      this.detach();
    } else if (this.target.isAlive() && !this.target.isImmune($J.getClass(this))) {
      this.acted = true;
      if (this.nextHit === 0) {
        this.nextHit = Random.NormalIntRange(1, (3 + $J.idiv(Dungeon.scalingDepth(), 4)) | 0);
      }
      let damage = this.nextHit;
      this.nextHit = Random.NormalIntRange(1, (3 + $J.idiv(Dungeon.scalingDepth(), 4)) | 0);
      Buff.detach(this.target, $J.cls(Chill));
      if (this.target instanceof Hero && this.target.buff($J.cls(TimekeepersHourglass$timeStasis)) == null && this.target.buff($J.cls(TimeStasis)) == null) {
        let hero = this.target;
        hero.damage(damage, this);
        this.burnIncrement++;
        if (Random.Int$int(3) < ((this.burnIncrement - 3) | 0) && !(Dungeon.level instanceof VaultLevel)) {
          this.burnIncrement = 0;
          let burnable = new ArrayList();
          if (!hero.belongings.lostInventory$()) {
            for (const $it0 = hero.belongings.backpack.items_.iterator(); $it0.hasNext(); ) {
              let i = $it0.next();
              if (!i.unique && (i instanceof Scroll || i instanceof MysteryMeat || i instanceof FrozenCarpaccio)) {
                burnable.add(i);
              }
            }
          }
          if (!burnable.isEmpty()) {
            let toBurn = Random.element$Collection(burnable).detach(hero.belongings.backpack);
            GLog.w(Messages.capitalize(Messages.get$Object$String$ObjectArr(this, 'burnsup', [toBurn.title()])), []);
            if (toBurn instanceof MysteryMeat || toBurn instanceof FrozenCarpaccio) {
              let steak = new ChargrilledMeat()._ChargrilledMeat();
              if (!steak.collect$Bag(hero.belongings.backpack)) {
                Dungeon.level.drop(steak, hero.pos).sprite_.drop$();
              }
            }
            Heap.burnFX(hero.pos);
          }
        }
      } else {
        this.target.damage(damage, this);
      }
      if (this.target instanceof Thief && (this.target).item_ != null) {
        let item = (this.target).item_;
        if (!item.unique && item instanceof Scroll) {
          this.target.sprite_.emitter().burst(ElmoParticle.FACTORY, 6);
          (this.target).item_ = null;
        } else if (item instanceof MysteryMeat) {
          this.target.sprite_.emitter().burst(ElmoParticle.FACTORY, 6);
          (this.target).item_ = new ChargrilledMeat()._ChargrilledMeat();
        }
      }
    } else {
      this.detach();
    }
    if (Dungeon.level.flamable[this.target.pos] && Blob.volumeAt(this.target.pos, $J.cls(Fire)) === 0) {
      GameScene.add$Blob(Blob.seed$int$int$Class(this.target.pos, 4, $J.cls(Fire)));
    }
    this.spend(Actor.TICK);
    this.left_ = Math.fround(this.left_ - Actor.TICK);
    if (this.left_ <= Math.fround(0) || (Dungeon.level.water[this.target.pos] && !this.target.flying)) {
      this.detach();
    }
    this.target.needsIncomingDOTUpdate = true;
    return true;
  }
  detach(): void {
    this.target.needsIncomingDOTUpdate = true;
    super.detach();
  }
  reignite$Char(ch: Char): void {
    this.reignite$Char$float(ch, Burning.DURATION);
  }
  reignite$Char$float(ch: Char, duration: number): void {
    if (ch.isImmune($J.cls(Burning))) {
      if (ch.glyphLevel($J.cls(Brimstone)) >= 0) {
        let shieldChance = Math.fround(2 * (Math.fround(Armor$Glyph.genericProcChanceMultiplier(ch) - 1)));
        let shieldCap = $J.roundf(Math.fround(shieldChance * 4));
        let shieldGain = $J.d2i(shieldChance);
        if (Random.Float$() < Math.fround(shieldChance % 1)) {
          shieldGain++;
        }
        if (shieldCap > 0 && shieldGain > 0) {
          let barrier = Buff.affect$Char$Class(ch, $J.cls(Barrier));
          if (barrier.shielding() < shieldCap) {
            barrier.incShield$int(Math.min(shieldGain, (shieldCap - barrier.shielding()) | 0));
          }
        }
      }
    }
    if (this.left_ < duration) {
      this.left_ = duration;
      ch.needsIncomingDOTUpdate = true;
    }
    this.acted = false;
  }
  extend(duration: number): void {
    this.left_ = Math.fround(this.left_ + duration);
    if (this.target != null) {
      this.target.needsIncomingDOTUpdate = true;
    }
  }
  icon(): number {
    return BuffIndicator.FIRE;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Burning.DURATION - this.left_)) / Burning.DURATION));
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.left_));
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.BURNING);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.BURNING);
    }
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$float(this.left_)]);
  }
  onDeath(): void {
    Badges.validateDeathFromFire();
    Dungeon.fail(this);
    GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
  }
  totalIncomingDMG(): number {
    if (this.nextHit === 0) {
      this.nextHit = Random.NormalIntRange(1, (3 + $J.idiv(Dungeon.scalingDepth(), 4)) | 0);
    }
    let avgDmg = Math.fround(2 + Math.fround(Dungeon.scalingDepth() / 8));
    return $J.l2i($J.lround(this.nextHit + Math.ceil(Math.fround(this.left_ - 1)) * avgDmg));
  }
}

$J.define(Burning, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$Doom', 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$DOTbuff'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Burning' }, meths: { 'reignite(com.shatteredpixel.shatteredpixeldungeon.actors.Char,float)': 'reignite$Char$float', 'reignite(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'reignite$Char' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  TimeStasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.TimeStasis');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Thief = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Thief');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  Heap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  Brimstone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Brimstone');
  TimekeepersHourglass$timeStasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$timeStasis');
  ChargrilledMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.ChargrilledMeat');
  FrozenCarpaccio = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.FrozenCarpaccio');
  MysteryMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  VaultLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
