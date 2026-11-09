// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/MagicalFireRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { SpecialRoom } from './SpecialRoom.ts';
import { Blob } from '../../../actors/blobs/Blob.ts';

let Dungeon, Actor, Blizzard, Fire, Freezing, Buff, Burning, ElmoParticle, Generator, Generator$Category, Honeypot, PotionOfFrost, Terrain, Painter, Room$Door$Type, EmptyRoom, Messages, GameScene, PathFinder, Random;

export class MagicalFireRoom extends SpecialRoom {
  _MagicalFireRoom(): this {
    this._SpecialRoom();
    return this;
  }
  minWidth(): number {
    return 7;
  }
  minHeight(): number {
    return 7;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let door = this.entrance();
    door.set$Type(Room$Door$Type.REGULAR);
    let firePos = this.center();
    let behindFire = new EmptyRoom()._EmptyRoom();
    if (door.x === this.left_ || door.x === this.right_) {
      firePos.y = (this.top_ + 1) | 0;
      while (firePos.y !== this.bottom_) {
        Blob.seed$int$int$Class$Level(level.pointToCell(firePos), 1, $J.cls(MagicalFireRoom$EternalFire), level);
        Painter.set$Level$Point$int(level, firePos, Terrain.EMPTY_SP);
        firePos.y++;
      }
      if (door.x === this.left_) {
        behindFire.set$int$int$int$int((firePos.x + 1) | 0, (this.top_ + 1) | 0, (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
      } else {
        behindFire.set$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0, (firePos.x - 1) | 0, (this.bottom_ - 1) | 0);
      }
    } else {
      firePos.x = (this.left_ + 1) | 0;
      while (firePos.x !== this.right_) {
        Blob.seed$int$int$Class$Level(level.pointToCell(firePos), 1, $J.cls(MagicalFireRoom$EternalFire), level);
        Painter.set$Level$Point$int(level, firePos, Terrain.EMPTY_SP);
        firePos.x++;
      }
      if (door.y === this.top_) {
        behindFire.set$int$int$int$int((this.left_ + 1) | 0, (firePos.y + 1) | 0, (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
      } else {
        behindFire.set$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.right_ - 1) | 0, (firePos.y - 1) | 0);
      }
    }
    Painter.fill$Level$Rect$int(level, behindFire, Terrain.EMPTY_SP);
    let honeyPot = Random.Int$int(2) === 0;
    let n = Random.IntRange(3, 4);
    for (let i = 0; i < n; i++) {
      let pos: number;
      do {
        pos = level.pointToCell(behindFire.random$int(0));
      } while (level.heaps.get(pos) != null);
      if (honeyPot) {
        level.drop(new Honeypot()._Honeypot(), pos);
        honeyPot = false;
      } else {
        level.drop(MagicalFireRoom.prize(level), pos);
      }
    }
    level.addItemToSpawn(new PotionOfFrost()._PotionOfFrost());
  }
  static prize(level: Level): Item {
    if (Random.Int$int(3) !== 0) {
      let prize = level.findPrizeItem$();
      if (prize != null) {
        return prize;
      }
    }
    return Generator.random$Category(Random.oneOf([Generator$Category.POTION, Generator$Category.SCROLL, Generator$Category.FOOD, Generator$Category.GOLD]));
  }
  canPlaceGrass(p: Point): boolean {
    return false;
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    let fire = l.blobs.get($J.cls(MagicalFireRoom$EternalFire));
    if (fire != null && fire.volume_ > 0) {
      let cell = l.pointToCell(p);
      if (l.map_[cell] === Terrain.EMPTY_SP) {
        return false;
      }
      if (fire.cur[cell] > 0) {
        return false;
      }
      for (let i of PathFinder.NEIGHBOURS4) {
        if ((fire.cur[(cell + i) | 0]) > 0) {
          return false;
        }
      }
    }
    return super.canPlaceCharacter(p, l);
  }
}

export class MagicalFireRoom$EternalFire extends Blob {
  _MagicalFireRoom$EternalFire(): this {
    this._Blob();
    return this;
  }
  evolve(): void {
    let cell: number;
    let freeze = Dungeon.level.blobs.get($J.cls(Freezing));
    let bliz = Dungeon.level.blobs.get($J.cls(Blizzard));
    let fire = Dungeon.level.blobs.get($J.cls(Fire));
    let clearAll = false;
    let l = Dungeon.level;
    for (let i = (this.area.left_ - 1) | 0; i <= this.area.right_; i++) {
      for (let j = (this.area.top_ - 1) | 0; j <= this.area.bottom_; j++) {
        cell = (i + Math.imul(j, l.width())) | 0;
        if (this.cur[cell] > 0) {
          if (l.water[cell]) {
            this.cur[cell] = 0;
            clearAll = true;
          }
          if (fire != null && fire.volume_ > 0 && fire.cur[cell] > 0) {
            fire.clear(cell);
          }
          for (let k of PathFinder.NEIGHBOURS9) {
            if (freeze != null && freeze.volume_ > 0 && (freeze.cur[(cell + k) | 0]) > 0) {
              freeze.clear(cell);
              this.cur[cell] = 0;
              clearAll = true;
            }
            if (bliz != null && bliz.volume_ > 0 && (bliz.cur[(cell + k) | 0]) > 0) {
              bliz.clear(cell);
              this.cur[cell] = 0;
              clearAll = true;
            }
          }
        }
        if (this.cur[cell] > 0 || (this.cur[(cell - 1) | 0]) > 0 || (this.cur[(cell + 1) | 0]) > 0 || (this.cur[(cell - Dungeon.level.width()) | 0]) > 0 || (this.cur[(cell + Dungeon.level.width()) | 0]) > 0) {
          if (Dungeon.level.flamable[cell] && (fire == null || fire.volume_ === 0 || fire.cur[cell] === 0)) {
            GameScene.add$Blob(Blob.seed$int$int$Class(cell, 4, $J.cls(Fire)));
          }
          let ch = Actor.findChar(cell);
          if (ch != null && !ch.isImmune($J.getClass(this))) {
            Buff.affect$Char$Class(ch, $J.cls(Burning)).reignite$Char$float(ch, 4);
          }
          if (Dungeon.level.heaps.get(cell) != null && Dungeon.level.map_[cell] !== Terrain.EMPTY_SP && Dungeon.level.map_[cell] !== Terrain.WATER) {
            Dungeon.level.heaps.get(cell).burn();
          }
        }
        this.off[cell] = this.cur[cell];
        this.volume_ = (this.volume_ + this.off[cell]) | 0;
      }
    }
    if (clearAll) {
      this.fullyClear();
    }
  }
  seed(level: Level, cell: number, amount: number): void {
    super.seed(level, cell, amount);
    level.updateCellFlags(cell);
  }
  clear(cell: number): void {
    if (this.volume_ > 0 && this.cur[cell] > 0) {
      this.fullyClear();
    }
  }
  fullyClear(): void {
    super.fullyClear();
    Dungeon.level.buildFlagMaps();
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(ElmoParticle.FACTORY, Math.fround(0.02));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  onBuildFlagMaps(l: Level): void {
    if (this.volume_ > 0) {
      for (let i = 0; i < l.length(); i++) {
        this.onUpdateCellFlags(l, i);
      }
    }
  }
  onUpdateCellFlags(l: Level, cell: number): void {
    if (this.volume_ > 0 && this.cur[cell] > 0) {
      l.passable[cell] = false;
      l.avoid[cell] = false;
    }
  }
}

$J.define(MagicalFireRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicalFireRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_MagicalFireRoom' } });
$J.define(MagicalFireRoom$EternalFire, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicalFireRoom$EternalFire', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_MagicalFireRoom$EternalFire' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blizzard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blizzard');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Honeypot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot');
  PotionOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfFrost');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  EmptyRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.EmptyRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
