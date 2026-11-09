// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Shadows.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Invisibility } from './Invisibility.ts';

let Assets$Sounds, Dungeon, Actor, Buff$buffType, Messages, BuffIndicator, Sample;

export class Shadows extends Invisibility {
  left_: number = 0;
  static readonly LEFT: string = 'left';
  _Shadows(): this {
    this._Invisibility();
    this.announced = false;
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Shadows.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getFloat(Shadows.LEFT);
  }
  attachTo(target: Char): boolean {
    if (Dungeon.level != null) {
      for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
        let m = $it0.next();
        if (Dungeon.level.adjacent(m.pos, target.pos) && m.alignment !== target.alignment) {
          return false;
        }
      }
    }
    if (super.attachTo(target)) {
      if (Dungeon.level != null) {
        Sample.INSTANCE.play$Object(Assets$Sounds.MELD);
        Dungeon.observe$();
      }
      return true;
    } else {
      return false;
    }
  }
  detach(): void {
    super.detach();
    Dungeon.observe$();
  }
  act(): boolean {
    if (this.target.isAlive()) {
      this.spend(Actor.TICK);
      if (--this.left_ <= Math.fround(0)) {
        this.detach();
        return true;
      }
      for (const $it1 = Dungeon.level.mobs.iterator(); $it1.hasNext(); ) {
        let m = $it1.next();
        if (Dungeon.level.adjacent(m.pos, this.target.pos) && m.alignment !== this.target.alignment) {
          this.detach();
          return true;
        }
      }
    } else {
      this.detach();
    }
    return true;
  }
  prolong(): void {
    this.left_ = 2;
  }
  icon(): number {
    return BuffIndicator.SHADOWS;
  }
  iconFadePercent(): number {
    return 0;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(Shadows, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Shadows', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility', ctors: { '': '_Shadows' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
