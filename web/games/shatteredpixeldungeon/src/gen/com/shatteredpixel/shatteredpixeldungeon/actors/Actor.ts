// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/Actor.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashSet, JObject } from '../../../../../jre/index.ts';

let Dungeon, Statistics, Char, TargetedCell, Game, SparseArray;

export class Actor extends JObject {
  static readonly TICK: number = 1;
  time: number = 0;
  id_: number = 0;
  static readonly VFX_PRIO: number = 100;
  static readonly HERO_PRIO: number = 0;
  static readonly BLOB_PRIO: number = -10;
  static readonly MOB_PRIO: number = -20;
  static readonly BUFF_PRIO: number = -30;
  static readonly DEFAULT: number = -100;
  actPriority: number = 0;
  static readonly TIME: string = 'time';
  static readonly ID: string = 'id';
  static all_: HashSet<Actor> = null;
  static chars_: HashSet<Char> = null;
  static current: Actor = null;
  static ids: SparseArray<Actor> = null;
  static nextID: number = 0;
  static now_: number = 0;
  static readonly NEXTID: string = 'nextid';
  static keepActorThreadAlive: boolean = false;
  static waitingActor: Actor = null;
  static waitingSprite: CharSprite = null;
  _Actor(): this {
    this.id_ = 0;
    this.actPriority = Actor.DEFAULT;
    return this;
  }
  spendConstant(time: number): void {
    this.time = Math.fround(this.time + time);
    let ex = Math.fround(Math.abs(Math.fround(this.time % 1)));
    if (ex < Math.fround(0.001)) {
      this.time = Math.fround($J.roundf(this.time));
    }
  }
  spend(time: number): void {
    this.spendConstant(time);
  }
  spendToWhole(): void {
    this.time = Math.fround(Math.ceil(this.time));
  }
  postpone(time: number): void {
    if (this.time < Math.fround(Actor.now_ + time)) {
      this.time = Math.fround(Actor.now_ + time);
      let ex = Math.fround(Math.abs(Math.fround(this.time % 1)));
      if (ex < Math.fround(0.001)) {
        this.time = Math.fround($J.roundf(this.time));
      }
    }
  }
  cooldown(): number {
    return Math.fround(this.time - Actor.now_);
  }
  clearTime(): void {
    this.spendConstant(Math.fround(-Actor.now()));
    if (this instanceof Char) {
      for (const $it0 = (this).buffs$().iterator(); $it0.hasNext(); ) {
        let b = $it0.next();
        b.spendConstant(Math.fround(-Actor.now()));
      }
    }
  }
  timeToNow(): void {
    this.time = Actor.now_;
  }
  fixTime(decrement: number): void {
    this.time = Math.fround(this.time - decrement);
  }
  diactivate(): void {
    this.time = Math.fround(3.4028235E38);
  }
  onAdd(): void {
  }
  onRemove(): void {
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$float(Actor.TIME, this.time);
    bundle.put$String$int(Actor.ID, this.id_);
  }
  restoreFromBundle(bundle: Bundle): void {
    this.time = bundle.getFloat(Actor.TIME);
    let incomingID = bundle.getInt(Actor.ID);
    if (Actor.findById(incomingID) == null) {
      this.id_ = incomingID;
    } else {
      this.id_ = Actor.nextID++;
    }
  }
  id(): number {
    if (this.id_ > 0) {
      return this.id_;
    } else {
      return (this.id_ = Actor.nextID++);
    }
  }
  static now(): number {
    return Actor.now_;
  }
  static clear(): void {
    Actor.now_ = 0;
    Actor.all_.clear();
    Actor.chars_.clear();
    Actor.ids.clear();
  }
  static fixTime(): void {
    if (Actor.all_.isEmpty()) {
      return;
    }
    let min = Math.fround(3.4028235E38);
    for (const $it1 = Actor.all_.iterator(); $it1.hasNext(); ) {
      let a = $it1.next();
      if (a.time < min) {
        min = a.time;
      }
    }
    min = Math.fround($J.d2i(min));
    for (const $it2 = Actor.all_.iterator(); $it2.hasNext(); ) {
      let a = $it2.next();
      a.fixTime(min);
    }
    TargetedCell.fixTime(min);
    if (Dungeon.hero != null && Actor.all_.contains(Dungeon.hero)) {
      Statistics.duration = Math.fround(Statistics.duration + min);
    }
    Actor.now_ = Math.fround(Actor.now_ - min);
  }
  static init(): void {
    Actor.add$Actor(Dungeon.hero);
    for (const $it3 = Dungeon.level.mobs.iterator(); $it3.hasNext(); ) {
      let mob = $it3.next();
      Actor.add$Actor(mob);
    }
    for (const $it4 = Dungeon.level.mobs.iterator(); $it4.hasNext(); ) {
      let mob = $it4.next();
      mob.restoreEnemy();
    }
    for (const $it5 = Dungeon.level.blobs.values().iterator(); $it5.hasNext(); ) {
      let blob = $it5.next();
      Actor.add$Actor(blob);
    }
    Actor.current = null;
  }
  static storeNextID(bundle: Bundle): void {
    bundle.put$String$int(Actor.NEXTID, Actor.nextID);
  }
  static restoreNextID(bundle: Bundle): void {
    Actor.nextID = bundle.getInt(Actor.NEXTID);
  }
  static resetNextID(): void {
    Actor.nextID = 1;
  }
  next(): void {
    if (Actor.current === this) {
      Actor.current = null;
    }
  }
  static processing(): boolean {
    return Actor.current != null;
  }
  static curActorPriority(): number {
    return Actor.current != null ? Actor.current.actPriority : Actor.HERO_PRIO;
  }
  static resumable(): boolean {
    return Actor.waitingActor != null && (Actor.waitingSprite == null || !Actor.waitingSprite.isMoving);
  }
  static interruptProcessing(): void {
    Actor.waitingActor = null;
    Actor.waitingSprite = null;
    Actor.current = null;
  }
  static waitForSprite(sprite: CharSprite): void {
    Actor.waitingSprite = sprite;
  }
  static process(): void {
    let doNext: boolean;
    do {
      let acting: Actor;
      if (Actor.waitingActor != null) {
        if (Actor.waitingSprite != null && Actor.waitingSprite.isMoving) {
          return;
        }
        acting = Actor.waitingActor;
        Actor.waitingActor = null;
        Actor.waitingSprite = null;
        Actor.current = acting;
      } else {
        acting = Actor.select();
        if (acting == null) {
          return;
        }
        if (acting instanceof Char && (acting).sprite_ != null && (acting).sprite_.isMoving) {
          Actor.waitingActor = acting;
          Actor.waitingSprite = (acting).sprite_;
          return;
        }
      }
      doNext = acting.act();
      if (Actor.waitingSprite != null) {
        Actor.waitingActor = acting;
        return;
      }
      if (doNext && (Dungeon.hero == null || !Dungeon.hero.isAlive())) {
        doNext = false;
        Actor.current = null;
      }
    } while (doNext);
  }
  static select(): Actor {
    let interrupted = false;
    {
      Actor.current = null;
      if (!interrupted && !Game.switchingScene()) {
        let earliest = Math.fround(3.4028235E38);
        {
          for (const $it6 = Actor.all_.iterator(); $it6.hasNext(); ) {
            let actor = $it6.next();
            if (actor.time < earliest || actor.time === earliest && (Actor.current == null || actor.actPriority > Actor.current.actPriority)) {
              earliest = actor.time;
              Actor.current = actor;
            }
          }
        }
      }
      if (Actor.current != null) {
        Actor.now_ = Actor.current.time;
      }
      return Actor.current;
    }
  }
  static add$Actor(actor: Actor): void {
    Actor.add$Actor$float(actor, Actor.now_);
  }
  static addDelayed(actor: Actor, delay: number): void {
    Actor.add$Actor$float(actor, Math.fround(Actor.now_ + Math.max(delay, 0)));
  }
  static add$Actor$float(actor: Actor, time: number): void {
    if (Actor.all_.contains(actor)) {
      return;
    }
    Actor.ids.put(actor.id(), actor);
    Actor.all_.add(actor);
    actor.time = Math.fround(actor.time + time);
    actor.onAdd();
    if (actor instanceof Char) {
      let ch = actor;
      Actor.chars_.add(ch);
      for (const $it7 = ch.buffs$().iterator(); $it7.hasNext(); ) {
        let buff = $it7.next();
        Actor.add$Actor(buff);
      }
    }
  }
  static remove(actor: Actor): void {
    if (actor != null) {
      Actor.all_.remove(actor);
      Actor.chars_.remove(actor);
      actor.onRemove();
      if (actor.id_ > 0) {
        Actor.ids.remove(actor.id_);
      }
    }
  }
  static delayChar(ch: Char, time: number): void {
    ch.spendConstant(time);
    for (const $it8 = ch.buffs$().iterator(); $it8.hasNext(); ) {
      let b = $it8.next();
      b.spendConstant(time);
    }
  }
  static findChar(pos: number): Char {
    for (const $it9 = Actor.chars_.iterator(); $it9.hasNext(); ) {
      let ch = $it9.next();
      if (ch.pos === pos) {
        return ch;
      }
    }
    return null;
  }
  static findById(id: number): Actor {
    return Actor.ids.get(id);
  }
  static all(): HashSet<Actor> {
    return new HashSet(Actor.all_);
  }
  static chars(): HashSet<Char> {
    return new HashSet(Actor.chars_);
  }
  static $clinit() {
    Actor.all_ = new HashSet();
    Actor.chars_ = new HashSet();
    Actor.ids = new SparseArray()._SparseArray();
    Actor.nextID = 1;
    Actor.now_ = 0;
    Actor.keepActorThreadAlive = true;
    Actor.waitingActor = null;
    Actor.waitingSprite = null;
  }
}

$J.define(Actor, 'com.shatteredpixel.shatteredpixeldungeon.actors.Actor', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_Actor' }, meths: { 'add(com.shatteredpixel.shatteredpixeldungeon.actors.Actor,float)': 'add$Actor$float', 'add(com.shatteredpixel.shatteredpixeldungeon.actors.Actor)': 'add$Actor' }, clinit: true, lazy: ['all_', 'chars_', 'current', 'ids', 'nextID', 'now_', 'keepActorThreadAlive', 'waitingActor', 'waitingSprite'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  TargetedCell = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.TargetedCell');
  Game = $J.load('com.watabou.noosa.Game');
  SparseArray = $J.load('com.watabou.utils.SparseArray');
});
