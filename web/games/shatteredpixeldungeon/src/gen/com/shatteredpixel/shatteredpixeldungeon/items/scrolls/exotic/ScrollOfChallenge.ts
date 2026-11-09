// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfChallenge.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { ExoticScroll } from './ExoticScroll.ts';
import { Buff } from '../../../actors/buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Buff$buffType, CellEmitter, Speck, ChallengeParticle, Item, ShadowCaster, Messages, ItemSpriteSheet$Icons, BuffIndicator, Sample, BArray, PathFinder;

export class ScrollOfChallenge extends ExoticScroll {
  _ScrollOfChallenge(): this {
    this._ExoticScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_CHALLENGE;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      mob.beckon(Item.curUser.pos);
    }
    Buff.affect$Char$Class(Item.curUser, $J.cls(ScrollOfChallenge$ChallengeArena)).setup(Item.curUser.pos);
    this.identify$();
    Item.curUser.sprite_.centerEmitter().start(Speck.factory$int(Speck.SCREAM), Math.fround(0.3), 3);
    Sample.INSTANCE.play$Object(Assets$Sounds.CHALLENGE);
    this.readAnimation();
  }
}

export class ScrollOfChallenge$ChallengeArena extends Buff {
  arenaPositions: ArrayList<number> = null;
  arenaEmitters: ArrayList<Emitter> = null;
  static readonly DURATION: number = 100;
  left_: number = 0;
  static readonly ARENA_POSITIONS: string = 'arena_positions';
  static readonly LEFT: string = 'left';
  _ScrollOfChallenge$ChallengeArena(): this {
    this._Buff();
    this.arenaPositions = new ArrayList();
    this.arenaEmitters = new ArrayList();
    this.left_ = 0;
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.ARMOR;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(ScrollOfChallenge$ChallengeArena.DURATION - this.left_)) / ScrollOfChallenge$ChallengeArena.DURATION));
  }
  iconTextDisplay(): string {
    return String(this.left_);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.left_]);
  }
  setup(pos: number): void {
    let dist: number;
    if (Dungeon.depth === 5 || Dungeon.depth === 10 || Dungeon.depth === 20) {
      dist = 1;
    } else {
      let visibleCells = $J.newArray(Dungeon.level.length(), false);
      let c = Dungeon.level.cellToPoint(pos);
      ShadowCaster.castShadow(c.x, c.y, Dungeon.level.width(), visibleCells, Dungeon.level.losBlocking, 8);
      let count = 0;
      for (let b of visibleCells) {
        if (b) {
          count++;
        }
      }
      if (count < 30) {
        dist = 1;
      } else if (count >= 100) {
        dist = 3;
      } else {
        dist = 2;
      }
    }
    PathFinder.buildDistanceMap$int$booleanArr$int(pos, BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null), dist);
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647 && !this.arenaPositions.contains(i)) {
        this.arenaPositions.add(i);
      }
    }
    if (this.target != null) {
      this.fx(false);
      this.fx(true);
    }
    this.left_ = $J.d2i(ScrollOfChallenge$ChallengeArena.DURATION);
  }
  extend(duration: number): void {
    this.left_ = $J.d2i(Math.fround(this.left_ + duration));
  }
  act(): boolean {
    if (!this.arenaPositions.contains(this.target.pos)) {
      this.detach();
    }
    this.left_--;
    BuffIndicator.refreshHero();
    if (this.left_ <= 0) {
      this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }
  fx(on: boolean): void {
    if (on) {
      for (const $it0 = this.arenaPositions.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        let e = CellEmitter.get(i);
        e.pour(ChallengeParticle.FACTORY, Math.fround(0.05));
        this.arenaEmitters.add(e);
      }
    } else {
      for (const $it1 = this.arenaEmitters.iterator(); $it1.hasNext(); ) {
        let e = $it1.next();
        e.on = false;
      }
      this.arenaEmitters.clear();
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    let values = $J.newArray(this.arenaPositions.size(), 0);
    for (let i = 0; i < values.length; i++) {
      values[i] = this.arenaPositions.get(i);
    }
    bundle.put$String$intArr(ScrollOfChallenge$ChallengeArena.ARENA_POSITIONS, values);
    bundle.put$String$int(ScrollOfChallenge$ChallengeArena.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    let values = bundle.getIntArray(ScrollOfChallenge$ChallengeArena.ARENA_POSITIONS);
    for (let value of values) {
      this.arenaPositions.add(value);
    }
    this.left_ = bundle.getInt(ScrollOfChallenge$ChallengeArena.LEFT);
  }
}

$J.define(ScrollOfChallenge, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfChallenge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll', ctors: { '': '_ScrollOfChallenge' } });
$J.define(ScrollOfChallenge$ChallengeArena, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfChallenge$ChallengeArena', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ScrollOfChallenge$ChallengeArena' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ChallengeParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ChallengeParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ShadowCaster = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ShadowCaster');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
