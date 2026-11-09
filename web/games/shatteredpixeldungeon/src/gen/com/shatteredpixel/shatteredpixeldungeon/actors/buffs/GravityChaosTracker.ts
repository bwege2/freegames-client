// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/GravityChaosTracker.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Actor, Char, Char$Alignment, Char$Property, Hero, Mob, CursedWand, WandOfBlastWave, Ballistica, Messages, BuffIndicator, GLog, Sample, PathFinder, Random;

export class GravityChaosTracker extends Buff {
  left_: number = 0;
  positiveOnly: boolean = false;
  idx: number = 0;
  blocked: ArrayList<Char> = null;
  static readonly LEFT: string = 'left';
  static readonly POSITIVE_ONLY: string = 'positive_only';
  _GravityChaosTracker(): this {
    this._Buff();
    this.actPriority = (Actor.BUFF_PRIO - 10) | 0;
    this.left_ = Random.NormalIntRange(30, 70);
    this.blocked = new ArrayList();
    return this;
  }
  icon(): number {
    return BuffIndicator.VERTIGO;
  }
  tintIcon(icon: Image): void {
    if (this.positiveOnly) {
      icon.hardlight$float$float$float(0, 1, 0);
    } else {
      icon.hardlight$float$float$float(1, 0, 0);
    }
  }
  act(): boolean {
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch.sprite_.isMoving) {
        Actor.waitForSprite(ch.sprite_);
        return false;
      }
    }
    if (!this.blocked.isEmpty()) {
      let blockedremoved = false;
      for (let ch of $J.toArrayInto(this.blocked.toArray(), $J.newArray(0, null))) {
        let path = new Ballistica()._Ballistica(ch.pos, (ch.pos + PathFinder.NEIGHBOURS8[this.idx]) | 0, Ballistica.MAGIC_BOLT);
        if (!(path.dist === 1 && Actor.findChar(path.collisionPos) != null)) {
          if (ch instanceof Hero) {
            (ch).interrupt();
          }
          WandOfBlastWave.throwChar(ch, path, 3, false, false, this);
          this.blocked.remove(ch);
          blockedremoved = true;
        }
      }
      if (!blockedremoved || this.blocked.isEmpty()) {
        this.blocked.clear();
        this.left_--;
        if (this.left_ <= 0) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'gravity_end', []), []);
          Sample.INSTANCE.play$Object(Assets$Sounds.DEGRADE);
          this.detach();
        } else {
          this.spend(Math.fround(Random.IntRange(1, 3)));
        }
        return true;
      } else {
        return true;
      }
    }
    this.idx = Random.Int$int(PathFinder.NEIGHBOURS8.length);
    for (const $it1 = Actor.chars().iterator(); $it1.hasNext(); ) {
      let ch = $it1.next();
      if (Char.hasProp(ch, Char$Property.IMMOVABLE) || (this.positiveOnly && ch.alignment === Char$Alignment.ALLY)) {
        continue;
      } else {
        if (ch instanceof Mob && (ch).state_ === (ch).SLEEPING) {
          (ch).state_ = (ch).WANDERING;
        }
        let path = new Ballistica()._Ballistica(ch.pos, (ch.pos + PathFinder.NEIGHBOURS8[this.idx]) | 0, Ballistica.MAGIC_BOLT);
        if (path.dist === 1 && Actor.findChar(path.collisionPos) != null) {
          this.blocked.add(ch);
        } else {
          if (ch instanceof Hero) {
            (ch).interrupt();
          }
          WandOfBlastWave.throwChar(ch, path, 3, false, false, this);
        }
      }
    }
    if (this.blocked.isEmpty()) {
      this.left_--;
      if (this.left_ <= 0) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'gravity_end', []), []);
        Sample.INSTANCE.play$Object(Assets$Sounds.DEGRADE);
        this.detach();
      } else {
        this.spend(Math.fround(Random.IntRange(1, 3)));
      }
    }
    return true;
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc_intro', []);
    if (this.positiveOnly) {
      desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'desc_positive', []);
    }
    desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_duration', []);
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(GravityChaosTracker.LEFT, this.left_);
    bundle.put$String$boolean(GravityChaosTracker.POSITIVE_ONLY, this.positiveOnly);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getInt(GravityChaosTracker.LEFT);
    this.positiveOnly = bundle.getBoolean(GravityChaosTracker.POSITIVE_ONLY);
  }
}

$J.define(GravityChaosTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.GravityChaosTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_GravityChaosTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CursedWand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
