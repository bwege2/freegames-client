// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Swiftthistle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { Plant } from './Plant.ts';
import { Plant$Seed } from './Plant.ts';
import { Buff } from '../actors/buffs/Buff.ts';

let Dungeon, Actor, Buff$buffType, Haste, Hero, HeroSubClass, Messages, Rotberry, CharSprite$State, ItemSpriteSheet, BuffIndicator, Emitter;

export class Swiftthistle extends Plant {
  _Swiftthistle(): this {
    this._Plant();
    this.image_ = 2;
    this.seedClass = $J.cls(Swiftthistle$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch != null) {
      Buff.affect$Char$Class(ch, $J.cls(Swiftthistle$TimeBubble)).reset$();
      if (ch instanceof Hero && (ch).subClass === HeroSubClass.WARDEN) {
        Buff.affect$Char$Class$float(ch, $J.cls(Haste), 1);
      }
    }
  }
}

export class Swiftthistle$Seed extends Plant$Seed {
  _Swiftthistle$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_SWIFTTHISTLE;
    this.plantClass = $J.cls(Swiftthistle);
    return this;
  }
}

export class Swiftthistle$TimeBubble extends Buff {
  left_: number = 0;
  presses: ArrayList<number> = null;
  static readonly PRESSES: string = 'presses';
  static readonly LEFT: string = 'left';
  _Swiftthistle$TimeBubble(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    this.presses = new ArrayList();
    return this;
  }
  icon(): number {
    return BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 1, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(6 - this.left_)) / 6));
  }
  iconTextDisplay(): string {
    return String($J.d2i((Math.fround(this.left_ + Math.fround(0.001)))));
  }
  reset$(): void {
    this.reset$int(6);
  }
  reset$int(turns: number): void {
    this.left_ = Math.fround((turns + 1) | 0);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$float(Math.max(0, this.left_))]);
  }
  processTime(time: number): void {
    this.left_ = Math.fround(this.left_ - time);
    if (this.left_ < Math.fround(-Math.fround(0.001))) {
      this.detach();
    }
  }
  setDelayedPress(cell: number): void {
    if (!this.presses.contains(cell)) {
      this.presses.add(cell);
    }
  }
  triggerPresses(): void {
    let toTrigger = this.presses;
    this.presses = new ArrayList();
    Actor.add$Actor(new (Swiftthistle$TimeBubble$1())().$o(this).$c(toTrigger)._Actor().$init_anon());
  }
  disarmPresses(): void {
    for (const $it1 = this.presses.iterator(); $it1.hasNext(); ) {
      let cell = $it1.next();
      let p = Dungeon.level.plants.get(cell);
      if (p != null && !(p instanceof Rotberry)) {
        Dungeon.level.uproot(cell);
      }
      let t = Dungeon.level.traps.get(cell);
      if (t != null && t.disarmedByActivation) {
        t.disarm();
      }
    }
    this.presses = new ArrayList();
  }
  detach(): void {
    super.detach();
    this.triggerPresses();
    this.target.next();
  }
  fx(on: boolean): void {
    if (!(this.target instanceof Hero)) {
      return;
    }
    Emitter.freezeEmitters = on;
    if (on) {
      for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
        if (mob.sprite_ != null) {
          mob.sprite_.add(CharSprite$State.PARALYSED);
        }
      }
    } else {
      for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
        if (mob.paralysed <= 0) {
          mob.sprite_.remove$State(CharSprite$State.PARALYSED);
        }
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    let values = $J.newArray(this.presses.size(), 0);
    for (let i = 0; i < values.length; i++) {
      values[i] = this.presses.get(i);
    }
    bundle.put$String$intArr(Swiftthistle$TimeBubble.PRESSES, values);
    bundle.put$String$float(Swiftthistle$TimeBubble.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    let values = bundle.getIntArray(Swiftthistle$TimeBubble.PRESSES);
    for (let value of values) {
      this.presses.add(value);
    }
    this.left_ = bundle.getFloat(Swiftthistle$TimeBubble.LEFT);
  }
}

let $Swiftthistle$TimeBubble$1: any = null;
/** An anonymous class (Swiftthistle.java:132). */
function Swiftthistle$TimeBubble$1(): any {
  return $Swiftthistle$TimeBubble$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      for (const $it0 = this.$cv_toTrigger.iterator(); $it0.hasNext(); ) {
        let cell = $it0.next();
        let p = Dungeon.level.plants.get(cell);
        if (p != null) {
          p.trigger();
        }
        let t = Dungeon.level.traps.get(cell);
        if (t != null) {
          t.trigger();
        }
      }
      Actor.remove(this);
      return true;
    }
    $c($toTrigger): this {
      this.$cv_toTrigger = $toTrigger;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$TimeBubble$1', []);
}

$J.define(Swiftthistle, 'com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Swiftthistle' } });
$J.define(Swiftthistle$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Swiftthistle$Seed' } });
$J.define(Swiftthistle$TimeBubble, 'com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$TimeBubble', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Swiftthistle$TimeBubble' }, meths: { 'reset(int)': 'reset$int', 'reset()': 'reset$' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Haste = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Haste');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Rotberry = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
});
