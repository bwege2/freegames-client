// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/LastLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays } from '../../../../../jre/index.ts';
import { Level } from './Level.ts';
import { CustomTilemap } from '../tiles/CustomTilemap.ts';

let Assets$Environment, Assets$Music, Dungeon, Statistics, Actor, Char, Char$Property, Amulet, HallsLevel, Level$Feeling, Terrain, LevelTransition, LevelTransition$Type, Painter, Messages, DungeonTileSheet, Music, PathFinder, Random;

export class LastLevel extends Level {
  static readonly ROOM_TOP: number = 10;
  static readonly WIDTH: number = 16;
  static readonly MID: number = 8;
  static AMULET_POS: number = 0;
  _LastLevel(): this {
    this._Level();
    this.color1 = 8393984;
    this.color2 = 10913057;
    this.viewDistance = Math.min(4, this.viewDistance);
    return this;
  }
  playLevelMusic(): void {
    if (Statistics.amuletObtained) {
      Music.INSTANCE.end();
    } else {
      Music.INSTANCE.play$String$boolean(Assets$Music.THEME_FINALE, true);
    }
  }
  tilesTex(): string {
    return Assets$Environment.TILES_HALLS;
  }
  waterTex(): string {
    return Assets$Environment.WATER_HALLS;
  }
  buildFlagMaps(): void {
    super.buildFlagMaps();
    for (let i = 0; i < this.length(); i++) {
      if (this.pit[i] || i > Math.imul(((this.height_ - LastLevel.ROOM_TOP + 2) | 0), this.width_)) {
        this.passable[i] = this.avoid[i] = false;
        this.solid[i] = true;
      }
    }
  }
  cleanWalls(): void {
    super.cleanWalls();
    for (let i = Math.imul(((this.height_ - LastLevel.ROOM_TOP + 2) | 0), this.width_); i < this.length_; i++) {
      if (i % this.width_ < 4 || i % this.width_ > 12 || i >= ((this.length_ - this.width_) | 0)) {
        this.discoverable[i] = false;
      } else {
        this.visited[i] = true;
      }
    }
  }
  updateCellFlags(cell: number): void {
    super.updateCellFlags(cell);
    if (this.pit[cell] || cell > Math.imul(((this.height_ - LastLevel.ROOM_TOP + 2) | 0), this.width_)) {
      this.passable[cell] = this.avoid[cell] = false;
      this.solid[cell] = true;
    }
    if (cell > Math.imul(((this.height_ - LastLevel.ROOM_TOP + 1) | 0), this.width_)) {
      if (cell % this.width_ < 4 || cell % this.width_ > 12 || cell >= ((this.length_ - this.width_) | 0)) {
        this.discoverable[cell] = false;
      } else {
        this.visited[cell] = true;
      }
    }
  }
  build(): boolean {
    this.setSize(16, 64);
    Arrays.fill(this.map_, Terrain.CHASM);
    let MID = $J.idiv(this.width_, 2);
    Painter.fill$Level$int$int$int$int$int(this, 0, (this.height_ - 1) | 0, this.width_, 1, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(this, (MID - 1) | 0, 10, 3, ((this.height_ - 11) | 0), Terrain.EMPTY);
    Painter.fill$Level$int$int$int$int$int(this, (MID - 2) | 0, (this.height_ - 3) | 0, 5, 1, Terrain.EMPTY);
    Painter.fill$Level$int$int$int$int$int(this, (MID - 3) | 0, (this.height_ - 2) | 0, 7, 1, Terrain.EMPTY);
    let entrance = (Math.imul(((this.height_ - LastLevel.ROOM_TOP) | 0), this.width()) + MID) | 0;
    Painter.fill$Level$int$int$int$int$int(this, 0, (this.height_ - LastLevel.ROOM_TOP) | 0, this.width_, 2, Terrain.WALL);
    this.map_[entrance] = Terrain.ENTRANCE;
    (this.map_[(entrance + this.width_) | 0]) = Terrain.ENTRANCE;
    let entry = new LevelTransition()._LevelTransition$Level$int$Type(this, entrance, LevelTransition$Type.REGULAR_ENTRANCE);
    entry.left_--;
    entry.right_++;
    entry.bottom_ = (entry.bottom_ + 2) | 0;
    this.transitions.add(entry);
    Painter.fill$Level$int$int$int$int$int(this, 0, (this.height_ - LastLevel.ROOM_TOP + 2) | 0, this.width_, 8, Terrain.EMPTY);
    Painter.fill$Level$int$int$int$int$int(this, (MID - 1) | 0, (this.height_ - LastLevel.ROOM_TOP + 2) | 0, 3, 1, Terrain.ENTRANCE);
    for (let i = 0; i < this.length(); i++) {
      if (this.map_[i] === Terrain.EMPTY && Random.Int$int(5) === 0) {
        this.map_[i] = Terrain.EMPTY_DECO;
      }
    }
    Painter.fill$Level$int$int$int$int$int(this, (MID - 2) | 0, 9, 5, 7, Terrain.EMPTY);
    Painter.fill$Level$int$int$int$int$int(this, (MID - 3) | 0, 10, 7, 5, Terrain.EMPTY);
    this.feeling = Level$Feeling.NONE;
    this.viewDistance = 4;
    let vis = new LastLevel$CustomFloor()._LastLevel$CustomFloor();
    vis.setRect$int$int$int$int(5, 0, 7, (this.height_ - LastLevel.ROOM_TOP) | 0);
    this.customTiles.add(vis);
    vis = new LastLevel$CenterPieceVisuals()._LastLevel$CenterPieceVisuals();
    vis.pos$int$int(0, (this.height_ - LastLevel.ROOM_TOP) | 0);
    this.customTiles.add(vis);
    vis = new LastLevel$CenterPieceWalls()._LastLevel$CenterPieceWalls();
    vis.pos$int$int(0, (this.height_ - LastLevel.ROOM_TOP - 1) | 0);
    this.customWalls.add(vis);
    return true;
  }
  createMob(): Mob {
    return null;
  }
  createMobs(): void {
  }
  addRespawner(): Actor {
    return null;
  }
  createItems(): void {
    this.drop(new Amulet()._Amulet(), LastLevel.AMULET_POS);
  }
  randomRespawnCell(ch: Char): number {
    let candidates = new ArrayList();
    for (let i of PathFinder.NEIGHBOURS8) {
      let cell = (this.entrance() + i) | 0;
      if (this.passable[cell] && Actor.findChar(cell) == null && (!Char.hasProp(ch, Char$Property.LARGE) || this.openSpace[cell])) {
        candidates.add(cell);
      }
    }
    if (candidates.isEmpty()) {
      return -1;
    } else {
      return Random.element$Collection(candidates);
    }
  }
  tileName(tile: number): string {
    switch (tile) {
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'water_name', []);
      case Terrain.GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'grass_name', []);
      case Terrain.HIGH_GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'high_grass_name', []);
      case Terrain.STATUE:
      case Terrain.STATUE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'statue_name', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'region_deco_name', []);
      default:
        return super.tileName(tile);
    }
  }
  tileDesc(tile: number): string {
    switch (tile) {
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'water_desc', []);
      case Terrain.STATUE:
      case Terrain.STATUE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'statue_desc', []);
      case Terrain.BOOKSHELF:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'bookshelf_desc', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'region_deco_desc', []);
      default:
        return super.tileDesc(tile);
    }
  }
  addVisuals(): Group {
    super.addVisuals();
    HallsLevel.addHallsVisuals(this, this.visuals);
    return this.visuals;
  }
  static $clinit() {
    LastLevel.AMULET_POS = (Math.imul(12, LastLevel.WIDTH) + LastLevel.MID) | 0;
  }
}

export class LastLevel$CustomFloor extends CustomTilemap {
  static CANDLES: number[] = null;
  _LastLevel$CustomFloor(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.HALLS_SP;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let candlesStart = (LastLevel.AMULET_POS - 3 - Math.imul(3, Dungeon.level.width())) | 0;
    let cell = (this.tileX + Math.imul(this.tileY, Dungeon.level.width())) | 0;
    let map = Dungeon.level.map_;
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    for (let i = 0; i < data.length; i++) {
      if (i % this.tileW === 0) {
        cell = (this.tileX + Math.imul(((this.tileY + $J.idiv(i, this.tileW)) | 0), Dungeon.level.width())) | 0;
      }
      if (cell === candlesStart) {
        for (let candle of LastLevel$CustomFloor.CANDLES) {
          if (data[i] === 0) {
            data[i] = candle;
          }
          if (data[i] === 46 && DungeonTileSheet.tileVariance[cell] >= 50) {
            data[i]++;
          }
          if (Statistics.amuletObtained && data[i] > 40) {
            data[i] = (data[i] + 8) | 0;
          }
          if (map[cell] !== Terrain.CHASM && (map[(cell + Dungeon.level.width_) | 0]) === Terrain.CHASM) {
            (data[(i + this.tileW) | 0]) = 6;
          }
          i++;
          cell++;
          if (i % this.tileW === 0) {
            cell = (this.tileX + Math.imul(((this.tileY + $J.idiv(i, this.tileW)) | 0), Dungeon.level.width())) | 0;
          }
        }
      }
      if (map[cell] === Terrain.EMPTY_DECO) {
        if (Statistics.amuletObtained) {
          data[i] = 31;
        } else {
          data[i] = 27;
        }
      } else if (map[cell] === Terrain.EMPTY) {
        data[i] = 19;
      } else if (data[i] === 0) {
        data[i] = -1;
      }
      cell++;
    }
    v.map(data, this.tileW);
    return v;
  }
  static $clinit() {
    LastLevel$CustomFloor.CANDLES = [-1, 42, 46, 46, 46, 43, -1, 42, 46, 46, 46, 46, 46, 43, 46, 46, 45, 19, 44, 46, 46, 46, 46, 19, 19, 19, 46, 46, 46, 46, 43, 19, 42, 46, 46, 44, 46, 46, 19, 46, 46, 45, -1, 44, 45, 19, 44, 45, -1];
  }
}

export class LastLevel$CenterPieceVisuals extends CustomTilemap {
  static map: number[] = null;
  _LastLevel$CenterPieceVisuals(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.HALLS_SP;
    this.tileW = 16;
    this.tileH = 10;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map(LastLevel$CenterPieceVisuals.map, this.tileW);
    return v;
  }
  static $clinit() {
    LastLevel$CenterPieceVisuals.map = [-1, -1, -1, -1, -1, -1, -1, -1, 19, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 8, 9, 10, 11, 19, 11, 12, 13, 14, 0, 0, 0, 0, 0, 0, 0, 16, 17, 18, 31, 19, 31, 20, 21, 22, 0, 0, 0, 0, 0, 0, 0, 24, 25, 26, 19, 19, 19, 28, 29, 30, 0, 0, 0, 0, 0, 0, 0, 24, 25, 26, 19, 19, 19, 28, 29, 30, 0, 0, 0, 0, 0, 0, 0, 24, 25, 26, 19, 19, 19, 28, 29, 30, 0, 0, 0, 0, 0, 0, 0, 24, 25, 34, 35, 35, 35, 34, 29, 30, 0, 0, 0, 0, 0, 0, 0, 40, 41, 36, 36, 36, 36, 36, 40, 41, 0, 0, 0, 0, 0, 0, 0, 48, 49, 36, 36, 36, 36, 36, 48, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
}

export class LastLevel$CenterPieceWalls extends CustomTilemap {
  static map: number[] = null;
  _LastLevel$CenterPieceWalls(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.HALLS_SP;
    this.tileW = 16;
    this.tileH = 9;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map(LastLevel$CenterPieceWalls.map, this.tileW);
    return v;
  }
  static $clinit() {
    LastLevel$CenterPieceWalls.map = [4, 4, 4, 4, 4, 4, 4, 5, 7, 3, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 1, 15, 2, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, 23, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 32, 33, -1, -1, -1, -1, -1, 32, 33, -1, -1, -1, -1, -1, -1, -1, 40, 41, -1, -1, -1, -1, -1, 40, 41, -1, -1, -1];
  }
}

$J.define(LastLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.LastLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.Level', ctors: { '': '_LastLevel' }, clinit: true, lazy: ['AMULET_POS'] });
$J.define(LastLevel$CustomFloor, 'com.shatteredpixel.shatteredpixeldungeon.levels.LastLevel$CustomFloor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_LastLevel$CustomFloor' }, clinit: true, lazy: ['CANDLES'] });
$J.define(LastLevel$CenterPieceVisuals, 'com.shatteredpixel.shatteredpixeldungeon.levels.LastLevel$CenterPieceVisuals', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_LastLevel$CenterPieceVisuals' }, clinit: true, lazy: ['map'] });
$J.define(LastLevel$CenterPieceWalls, 'com.shatteredpixel.shatteredpixeldungeon.levels.LastLevel$CenterPieceWalls', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_LastLevel$CenterPieceWalls' }, clinit: true, lazy: ['map'] });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Amulet = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Amulet');
  HallsLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.HallsLevel');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
  Music = $J.load('com.watabou.noosa.audio.Music');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
