// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/BlacksmithRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Arrays } from '../../../../../../../jre/index.ts';
import { StandardRoom } from '../standard/StandardRoom.ts';
import { CustomTilemap } from '../../../tiles/CustomTilemap.ts';

let Assets$Environment, Dungeon, Blacksmith, Generator, Generator$Category, Terrain, LevelTransition, LevelTransition$Type, Painter, Room, Room$Door$Type, Messages, Random;

export class BlacksmithRoom extends StandardRoom {
  _BlacksmithRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 8);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 8);
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY_SP);
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 2) | 0, (this.top_ + 1) | 0, (this.width() - 4) | 0, 1, Terrain.REGION_DECO_ALT);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
      Painter.drawInside(level, this, door, 1, Terrain.EMPTY);
    }
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY_SP);
    let npc = new Blacksmith()._Blacksmith();
    npc.pos = (this.left_ + 3 + (Math.imul(level.width(), ((this.top_ + 3) | 0)))) | 0;
    level.mobs.add(npc);
    Painter.set$Level$int$int(level, (npc.pos + 1) | 0, Terrain.CUSTOM_DECO_WTR);
    Painter.set$Level$int$int(level, (npc.pos + 1 - level.width()) | 0, Terrain.CUSTOM_DECO);
    Painter.set$Level$int$int(level, (npc.pos - level.width()) | 0, Terrain.CUSTOM_DECO);
    Painter.set$Level$int$int(level, (npc.pos - 1 - level.width()) | 0, Terrain.CUSTOM_DECO);
    let equipPos = (this.right_ - 3 + Math.imul(((this.bottom_ - 3) | 0), level.width())) | 0;
    if (this.height() === 8) {
      equipPos = (equipPos + level.width()) | 0;
    }
    for (let i = 0; i < 2; i++) {
      level.drop(Generator.random$Category(Random.oneOf([Generator$Category.ARMOR, Generator$Category.WEAPON, Generator$Category.MISSILE])), equipPos);
      Painter.set$Level$int$int(level, equipPos, Terrain.PEDESTAL);
      equipPos--;
    }
    let entranceOnLeft = Random.Int$int(2) === 0;
    for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
      let d = $it1.next();
      if (d.y <= ((this.top_ + 2) | 0)) {
        if (d.x <= ((this.left_ + 1) | 0)) {
          entranceOnLeft = false;
        } else if (d.x >= ((this.right_ - 1) | 0)) {
          entranceOnLeft = true;
        }
      }
    }
    let entrancePos = (Math.imul(((this.top_ + 1) | 0), level.width()) + (entranceOnLeft ? (this.left_ + 1) | 0 : (this.right_ - 1) | 0)) | 0;
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type$int$int$Type(level, entrancePos, LevelTransition$Type.BRANCH_EXIT, Dungeon.depth, (Dungeon.branch + 1) | 0, LevelTransition$Type.BRANCH_ENTRANCE));
    Painter.set$Level$int$int(level, entrancePos, Terrain.EXIT);
    let vis = new BlacksmithRoom$QuestEntrance()._BlacksmithRoom$QuestEntrance();
    vis.pos$int$Level(entrancePos, level);
    level.customTiles.add(vis);
    vis = new BlacksmithRoom$SmithyVisuals()._BlacksmithRoom$SmithyVisuals();
    vis.setRect$int$int$int$int((this.left_ + 2) | 0, (this.top_ + 2) | 0, (this.width() - 4) | 0, (this.height() - 4) | 0);
    level.customTiles.add(vis);
    let furnace = new BlacksmithRoom$FurnaceOverhang()._BlacksmithRoom$FurnaceOverhang();
    let p = level.cellToPoint(npc.pos);
    furnace.setRect$int$int$int$int((p.x - 1) | 0, (p.y - 2) | 0, 1, 1);
    level.customWalls.add(furnace);
  }
  canConnect$Room(r: Room): boolean {
    if (r.isExit()) {
      return false;
    }
    return super.canConnect$Room(r);
  }
  maxConnections(direction: number): number {
    if (direction === Room.TOP) {
      return 1;
    } else {
      return super.maxConnections(direction);
    }
  }
  canConnect$Point(p: Point): boolean {
    if (p.y === this.top_ && p.x !== ((this.left_ + 1) | 0) && p.x !== ((this.right_ - 1) | 0)) {
      return false;
    } else if (p.y === ((this.top_ + 1) | 0)) {
      return false;
    }
    return super.canConnect$Point(p);
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return false;
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return l.map_[l.pointToCell(p)] === Terrain.EMPTY;
  }
  canPlaceGrass(p: Point): boolean {
    return false;
  }
  canPlaceTrap(p: Point): boolean {
    return false;
  }
  canPlaceWater(p: Point): boolean {
    return false;
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    return false;
  }
}

export class BlacksmithRoom$QuestEntrance extends CustomTilemap {
  _BlacksmithRoom$QuestEntrance(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CAVES_QUEST;
    this.tileW = this.tileH = 1;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map([0], 1);
    return v;
  }
  name(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  desc(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

export class BlacksmithRoom$SmithyVisuals extends CustomTilemap {
  _BlacksmithRoom$SmithyVisuals(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CAVES_QUEST;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        data[i] = 7;
      } else if (i === 1) {
        data[i] = 16;
      } else if (i === 2) {
        data[i] = 17;
      } else if ($J.idiv(i, this.tileW) === 1 && i % this.tileW === 2) {
        data[i] = 18;
      } else {
        let cell = (this.tileX + i % this.tileW) | 0;
        cell = (cell + Math.imul(((this.tileY + $J.idiv(i, this.tileW)) | 0), Dungeon.level.width())) | 0;
        if (Dungeon.level.map_[cell] === Terrain.EMPTY_SP) {
          if (i >= ((data.length - this.tileW) | 0)) {
            if (i % this.tileW === 0) {
              data[i] = 12;
            } else if (i % this.tileW === ((this.tileW - 1) | 0)) {
              data[i] = 14;
            } else {
              data[i] = 13;
            }
          } else {
            if (i % this.tileW === 0) {
              data[i] = 8;
            } else if (i % this.tileW === ((this.tileW - 1) | 0)) {
              data[i] = 10;
            } else {
              data[i] = -1;
            }
          }
        } else if (Dungeon.level.map_[cell] === Terrain.PEDESTAL) {
          if (i >= ((data.length - this.tileW) | 0)) {
            data[i] = 20;
          } else {
            data[i] = 21;
          }
        } else {
          data[i] = -1;
        }
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  name(tileX: number, tileY: number): string {
    let cell = (this.tileX + tileX + Math.imul(((this.tileY + tileY) | 0), Dungeon.level.width())) | 0;
    if (Dungeon.level.map_[cell] === Terrain.CUSTOM_DECO || Dungeon.level.map_[cell] === Terrain.CUSTOM_DECO_WTR) {
      return Messages.get$Object$String$ObjectArr(this, 'name', []);
    }
    return super.name(tileX, tileY);
  }
  desc(tileX: number, tileY: number): string {
    let cell = (this.tileX + tileX + Math.imul(((this.tileY + tileY) | 0), Dungeon.level.width())) | 0;
    if (Dungeon.level.map_[cell] === Terrain.CUSTOM_DECO || Dungeon.level.map_[cell] === Terrain.CUSTOM_DECO_WTR) {
      return Messages.get$Object$String$ObjectArr(this, 'desc', []);
    }
    return super.desc(tileX, tileY);
  }
}

export class BlacksmithRoom$FurnaceOverhang extends CustomTilemap {
  _BlacksmithRoom$FurnaceOverhang(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CAVES_QUEST;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    Arrays.fill(data, 3);
    v.map(data, this.tileW);
    return v;
  }
}

$J.define(BlacksmithRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.BlacksmithRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_BlacksmithRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point', 'canConnect(com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room)': 'canConnect$Room' } });
$J.define(BlacksmithRoom$QuestEntrance, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.BlacksmithRoom$QuestEntrance', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_BlacksmithRoom$QuestEntrance' } });
$J.define(BlacksmithRoom$SmithyVisuals, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.BlacksmithRoom$SmithyVisuals', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_BlacksmithRoom$SmithyVisuals' } });
$J.define(BlacksmithRoom$FurnaceOverhang, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.BlacksmithRoom$FurnaceOverhang', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_BlacksmithRoom$FurnaceOverhang' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blacksmith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Random = $J.load('com.watabou.utils.Random');
});
