// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/LastShopLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { RegularLevel } from './RegularLevel.ts';

let Assets$Environment, Bones, Actor, Char, Char$Property, Heap$Type, CityLevel, Level$Feeling, Terrain, LineBuilder, CityPainter, ImpShopRoom, EntranceRoom, ExitRoom, Messages, Random;

export class LastShopLevel extends RegularLevel {
  _LastShopLevel(): this {
    this._RegularLevel();
    this.color1 = 4941366;
    this.color2 = 15921906;
    return this;
  }
  tilesTex(): string {
    return Assets$Environment.TILES_CITY;
  }
  waterTex(): string {
    return Assets$Environment.WATER_CITY;
  }
  build(): boolean {
    this.feeling = Level$Feeling.CHASM;
    if (super.build()) {
      for (let i = 0; i < this.length(); i++) {
        if (this.map_[i] === Terrain.SECRET_DOOR) {
          this.map_[i] = Terrain.DOOR;
        }
      }
      return true;
    } else {
      return false;
    }
  }
  initRooms(): ArrayList<Room> {
    let rooms = new ArrayList();
    rooms.add(this.roomEntrance = new EntranceRoom()._EntranceRoom());
    rooms.add(new ImpShopRoom()._ImpShopRoom());
    rooms.add(this.roomExit = new ExitRoom()._ExitRoom());
    return rooms;
  }
  builder(): Builder {
    return new LineBuilder()._LineBuilder().setPathVariance(0).setPathLength(1, [1]).setTunnelLength([0, 0, 1], [1]);
  }
  painter(): Painter {
    return new CityPainter()._CityPainter().setWater(Math.fround(0.1), 4).setGrass(Math.fround(0.1), 3);
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
    Random.pushGenerator$long(Random.Long$());
    let bonesItems = Bones.get();
    if (bonesItems != null) {
      let pos: number;
      do {
        pos = this.pointToCell(this.roomEntrance.random$());
      } while (pos === this.entrance());
      for (const $it0 = bonesItems.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        this.drop(i, pos).setHauntedIfCursed().type_ = Heap$Type.REMAINS;
      }
    }
    Random.popGenerator();
  }
  randomRespawnCell(ch: Char): number {
    let candidates = new ArrayList();
    for (const $it1 = this.roomEntrance.getPoints().iterator(); $it1.hasNext(); ) {
      let p = $it1.next();
      let cell = this.pointToCell(p);
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
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'water_name', []);
      case Terrain.HIGH_GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'high_grass_name', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'region_deco_name', []);
      default:
        return super.tileName(tile);
    }
  }
  tileDesc(tile: number): string {
    switch (tile) {
      case Terrain.ENTRANCE:
      case Terrain.ENTRANCE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'entrance_desc', []);
      case Terrain.EXIT:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'exit_desc', []);
      case Terrain.WALL_DECO:
      case Terrain.EMPTY_DECO:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'deco_desc', []);
      case Terrain.STATUE:
      case Terrain.STATUE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'statue_desc', []);
      case Terrain.BOOKSHELF:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'bookshelf_desc', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'region_deco_desc', []);
      default:
        return super.tileDesc(tile);
    }
  }
  addVisuals(): Group {
    super.addVisuals();
    CityLevel.addCityVisuals(this, this.visuals);
    return this.visuals;
  }
  addWallVisuals(): Group {
    super.addWallVisuals();
    CityLevel.addCityWallVisuals(this, this.wallVisuals);
    return this.wallVisuals;
  }
}

$J.define(LastShopLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.LastShopLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel', ctors: { '': '_LastShopLevel' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Bones = $J.load('com.shatteredpixel.shatteredpixeldungeon.Bones');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  CityLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LineBuilder = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.builders.LineBuilder');
  CityPainter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.CityPainter');
  ImpShopRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.ImpShopRoom');
  EntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.EntranceRoom');
  ExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.ExitRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Random = $J.load('com.watabou.utils.Random');
});
