// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/SewerBossExitRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ExitRoom } from '../standard/exit/ExitRoom.ts';
import { CustomTilemap } from '../../../tiles/CustomTilemap.ts';

let Assets$Environment, Terrain, LevelTransition, LevelTransition$Type, Painter, Room$Door$Type;

export class SewerBossExitRoom extends ExitRoom {
  _SewerBossExitRoom(): this {
    this._ExitRoom();
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
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    let c = this.center();
    Painter.fill$Level$int$int$int$int$int(level, (c.x - 1) | 0, (c.y - 1) | 0, 3, 2, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(level, (c.x - 1) | 0, (c.y + 1) | 0, 3, 1, Terrain.EMPTY_SP);
    let exitCell = level.pointToCell(c);
    Painter.set$Level$int$int(level, exitCell, Terrain.LOCKED_EXIT);
    let exit = new LevelTransition()._LevelTransition$Level$int$Type(level, exitCell, LevelTransition$Type.REGULAR_EXIT);
    exit.top_--;
    exit.left_--;
    exit.right_++;
    level.transitions.add(exit);
    let vis = new SewerBossExitRoom$SewerExit()._SewerBossExitRoom$SewerExit();
    vis.pos$int$int((c.x - 1) | 0, c.y);
    level.customTiles.add(vis);
    vis = new SewerBossExitRoom$SewerExitOverhang()._SewerBossExitRoom$SewerExitOverhang();
    vis.pos$int$int((c.x - 1) | 0, (c.y - 2) | 0);
    level.customWalls.add(vis);
  }
}

export class SewerBossExitRoom$SewerExit extends CustomTilemap {
  static layout: number[] = null;
  _SewerBossExitRoom$SewerExit(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.SEWER_BOSS;
    this.tileW = 3;
    this.tileH = 3;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map(SewerBossExitRoom$SewerExit.layout, 3);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    if ((tileX === 1 && tileY === 0) || tileY === 2) {
      return null;
    }
    return super.image(tileX, tileY);
  }
  static $clinit() {
    SewerBossExitRoom$SewerExit.layout = [21, -1, 22, 23, 23, 23, 24, 24, 24];
  }
}

export class SewerBossExitRoom$SewerExitOverhang extends CustomTilemap {
  static layout: number[] = null;
  _SewerBossExitRoom$SewerExitOverhang(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.SEWER_BOSS;
    this.tileW = 3;
    this.tileH = 2;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map(SewerBossExitRoom$SewerExitOverhang.layout, 3);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    return null;
  }
  static $clinit() {
    SewerBossExitRoom$SewerExitOverhang.layout = [16, 17, 18, 19, -1, 20];
  }
}

$J.define(SewerBossExitRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.SewerBossExitRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.ExitRoom', ctors: { '': '_SewerBossExitRoom' } });
$J.define(SewerBossExitRoom$SewerExit, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.SewerBossExitRoom$SewerExit', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_SewerBossExitRoom$SewerExit' }, clinit: true, lazy: ['layout'] });
$J.define(SewerBossExitRoom$SewerExitOverhang, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.SewerBossExitRoom$SewerExitOverhang', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_SewerBossExitRoom$SewerExitOverhang' }, clinit: true, lazy: ['layout'] });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
