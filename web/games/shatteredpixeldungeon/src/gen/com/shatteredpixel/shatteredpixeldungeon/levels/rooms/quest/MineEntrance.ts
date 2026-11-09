// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MineEntrance.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { CaveRoom } from '../standard/CaveRoom.ts';
import { CustomTilemap } from '../../../tiles/CustomTilemap.ts';

let Assets$Environment, Dungeon, Blacksmith$Quest, Terrain, LevelTransition, LevelTransition$Type, Painter, Room$Door$Type, SecretRoom, Messages, GameMath, PathFinder, Point, Random;

export class MineEntrance extends CaveRoom {
  _MineEntrance(): this {
    this._CaveRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [1, 0, 0];
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 7);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 7);
  }
  isEntrance(): boolean {
    return true;
  }
  paint(level: Level): void {
    super.paint(level);
    let entrance: number;
    let valid: boolean;
    do {
      valid = false;
      entrance = level.pointToCell(this.random$int(3));
      for (let i of PathFinder.NEIGHBOURS9) {
        if ((level.map_[(entrance + i) | 0]) !== Terrain.WALL) {
          valid = true;
        }
      }
      if (this.height() === 7 && this.width() === 7) {
        valid = true;
      }
    } while (level.findMob(entrance) != null || !valid);
    Painter.set$Level$int$int(level, entrance, Terrain.ENTRANCE_SP);
    for (let i of PathFinder.NEIGHBOURS8) {
      Painter.set$Level$int$int(level, (entrance + i) | 0, Terrain.EMPTY_SP);
    }
    let vis = new MineEntrance$QuestExit()._MineEntrance$QuestExit();
    let e = level.cellToPoint(entrance);
    vis.pos$int$int((e.x - 1) | 0, (e.y - 1) | 0);
    level.customTiles.add(vis);
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type$int$int$Type(level, entrance, LevelTransition$Type.BRANCH_ENTRANCE, Dungeon.depth, 0, LevelTransition$Type.BRANCH_EXIT));
    if (Blacksmith$Quest.Type() === Blacksmith$Quest.CRYSTAL) {
      for (let i = 0; i < $J.idiv(Math.imul(this.width(), this.height()), 2); i++) {
        let r = this.random$int(1);
        if (level.distance(level.pointToCell(r), entrance) > 1 && level.map_[level.pointToCell(r)] !== Terrain.WALL) {
          Painter.set$Level$Point$int(level, r, Terrain.MINE_CRYSTAL);
        }
      }
    } else if (Blacksmith$Quest.Type() === Blacksmith$Quest.GNOLL) {
      for (const $it0 = this.connected_.keySet().iterator(); $it0.hasNext(); ) {
        let n = $it0.next();
        if (!(n instanceof SecretRoom) && this.connected_.get(n).type_ === Room$Door$Type.REGULAR) {
          if (Random.Int$int(10) === 0) {
            this.connected_.get(n).set$Type(Room$Door$Type.EMPTY);
          } else {
            this.connected_.get(n).set$Type(Room$Door$Type.WALL);
          }
          this.connected_.get(n).lockTypeChanges(true);
        }
      }
      let doors = new ArrayList();
      for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
        let d = $it1.next();
        if (d.type_ === Room$Door$Type.WALL) {
          doors.add(d);
        }
      }
      for (const $it2 = this.getPoints().iterator(); $it2.hasNext(); ) {
        let p = $it2.next();
        let cell = level.pointToCell(p);
        if (level.distance(cell, entrance) > 1 && level.map_[cell] === Terrain.EMPTY) {
          let dist = 1000;
          for (const $it3 = doors.iterator(); $it3.hasNext(); ) {
            let d = $it3.next();
            dist = Math.min(dist, Point.distance(p, d));
          }
          dist = GameMath.gate(1, Math.fround(dist - 0.5), 5);
          let val = Random.Float$float(Math.fround($J.pow(dist, 2)));
          if (val <= 0.75 || dist <= Math.fround(1)) {
            Painter.set$Level$int$int(level, cell, Terrain.MINE_BOULDER);
          } else if (val <= 5 && dist <= Math.fround(3)) {
            Painter.set$Level$int$int(level, cell, Terrain.EMPTY_DECO);
          }
        }
      }
    }
  }
}

export class MineEntrance$QuestExit extends CustomTilemap {
  TEX_WIDTH: number = 0;
  _MineEntrance$QuestExit(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CAVES_QUEST;
    this.tileW = this.tileH = 3;
    this.TEX_WIDTH = 64;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map(this.mapSimpleImage(0, 1, this.TEX_WIDTH), 3);
    return v;
  }
  name(tileX: number, tileY: number): string {
    if (tileX === 1 && tileY === 1) {
      return Messages.get$Object$String$ObjectArr(this, 'name', []);
    }
    return super.name(tileX, tileY);
  }
  desc(tileX: number, tileY: number): string {
    if (tileX === 1 && tileY === 1) {
      return Messages.get$Object$String$ObjectArr(this, 'desc', []);
    }
    return super.desc(tileX, tileY);
  }
  image(tileX: number, tileY: number): Image {
    if (tileX === 1 && tileY === 1) {
      return super.image(tileX, tileY);
    }
    return null;
  }
}

$J.define(MineEntrance, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineEntrance', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CaveRoom', ctors: { '': '_MineEntrance' } });
$J.define(MineEntrance$QuestExit, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineEntrance$QuestExit', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_MineEntrance$QuestExit' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  SecretRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
