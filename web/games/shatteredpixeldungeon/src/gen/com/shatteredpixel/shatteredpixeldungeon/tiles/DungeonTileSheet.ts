// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/DungeonTileSheet.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Arrays, HashSet, JObject } from '../../../../../jre/index.ts';

let Dungeon, Blacksmith$Quest, MiningLevel, Terrain, Random, SparseArray;

export class DungeonTileSheet extends JObject {
  static readonly WIDTH: number = 16;
  static readonly NULL_TILE: number = -1;
  /**
   * Floor Tiles
   */
  static GROUND: number = 0;
  static FLOOR: number = 0;
  static FLOOR_DECO: number = 0;
  static GRASS: number = 0;
  static EMBERS: number = 0;
  static FLOOR_SP: number = 0;
  static MINE_FLOOR_DECO_HEAVY: number = 0;
  static FLOOR_ALT_1: number = 0;
  static FLOOR_DECO_ALT: number = 0;
  static GRASS_ALT: number = 0;
  static EMBERS_ALT: number = 0;
  static FLOOR_SP_ALT: number = 0;
  static MINE_FLOOR_DECO_HEAVY_ALT: number = 0;
  static FLOOR_ALT_2: number = 0;
  static ENTRANCE: number = 0;
  static EXIT: number = 0;
  static WELL: number = 0;
  static EMPTY_WELL: number = 0;
  static PEDESTAL: number = 0;
  static ENTRANCE_SP: number = 0;
  static CHASM: number = 0;
  static CHASM_FLOOR: number = 0;
  static CHASM_FLOOR_SP: number = 0;
  static CHASM_WALL: number = 0;
  static CHASM_WATER: number = 0;
  static chasmStitcheable: SparseArray<number> = null;
  /**
   * Water Tiles
   */
  static WATER: number = 0;
  static waterStitcheable_: HashSet<number> = null;
  /**
   * Flat Tiles
   */
  static FLAT_WALLS: number = 0;
  static FLAT_WALL: number = 0;
  static FLAT_WALL_DECO: number = 0;
  static FLAT_BOOKSHELF: number = 0;
  static FLAT_WALL_ALT: number = 0;
  static FLAT_WALL_DECO_ALT: number = 0;
  static FLAT_BOOKSHELF_ALT: number = 0;
  static FLAT_DOOR: number = 0;
  static FLAT_DOOR_OPEN: number = 0;
  static FLAT_DOOR_LOCKED: number = 0;
  static FLAT_DOOR_CRYSTAL: number = 0;
  static UNLOCKED_EXIT: number = 0;
  static LOCKED_EXIT: number = 0;
  static FLAT_OTHER: number = 0;
  static FLAT_ALCHEMY_POT: number = 0;
  static FLAT_BARRICADE: number = 0;
  static FLAT_HIGH_GRASS: number = 0;
  static FLAT_FURROWED_GRASS: number = 0;
  static FLAT_HIGH_GRASS_ALT: number = 0;
  static FLAT_FURROWED_ALT: number = 0;
  static FLAT_STATUE: number = 0;
  static FLAT_STATUE_SP: number = 0;
  static FLAT_REGION_DECO: number = 0;
  static FLAT_REGION_DECO_ALT: number = 0;
  static FLAT_MINE_CRYSTAL: number = 0;
  static FLAT_MINE_CRYSTAL_ALT: number = 0;
  static FLAT_MINE_CRYSTAL_ALT_2: number = 0;
  static FLAT_MINE_BOULDER: number = 0;
  static FLAT_MINE_BOULDER_ALT: number = 0;
  static FLAT_MINE_BOULDER_ALT_2: number = 0;
  /**
   * Raised Tiles, Lower Layer
   */
  static RAISED_WALLS: number = 0;
  static RAISED_WALL: number = 0;
  static RAISED_WALL_DECO: number = 0;
  static RAISED_WALL_DOOR: number = 0;
  static RAISED_WALL_BOOKSHELF: number = 0;
  static RAISED_WALL_ALT: number = 0;
  static RAISED_WALL_DECO_ALT: number = 0;
  static RAISED_WALL_BOOKSHELF_ALT: number = 0;
  static wallStitcheable_: number[] = null;
  static RAISED_DOORS: number = 0;
  static RAISED_DOOR: number = 0;
  static RAISED_DOOR_OPEN: number = 0;
  static RAISED_DOOR_LOCKED: number = 0;
  static RAISED_DOOR_CRYSTAL: number = 0;
  static RAISED_DOOR_SIDEWAYS: number = 0;
  static doorTiles: number[] = null;
  static RAISED_OTHER: number = 0;
  static RAISED_ALCHEMY_POT: number = 0;
  static RAISED_BARRICADE: number = 0;
  static RAISED_HIGH_GRASS: number = 0;
  static RAISED_FURROWED_GRASS: number = 0;
  static RAISED_HIGH_GRASS_ALT: number = 0;
  static RAISED_FURROWED_ALT: number = 0;
  static RAISED_STATUE: number = 0;
  static RAISED_STATUE_SP: number = 0;
  static RAISED_REGION_DECO: number = 0;
  static RAISED_REGION_DECO_ALT: number = 0;
  static RAISED_MINE_CRYSTAL_BLUE_1: number = 0;
  static RAISED_MINE_CRYSTAL_BLUE_2: number = 0;
  static RAISED_MINE_CRYSTAL_GREEN_1: number = 0;
  static RAISED_MINE_CRYSTAL_GREEN_2: number = 0;
  static RAISED_MINE_CRYSTAL_RED_1: number = 0;
  static RAISED_MINE_CRYSTAL_RED_2: number = 0;
  static RAISED_MINE_BOULDER: number = 0;
  static RAISED_MINE_BOULDER_ALT: number = 0;
  static RAISED_MINE_BOULDER_ALT_2: number = 0;
  /**
   * Raised Tiles, Upper Layer
   */
  static WALLS_INTERNAL: number = 0;
  static WALL_INTERNAL: number = 0;
  static WALL_INTERNAL_DECO: number = 0;
  static WALL_INTERNAL_WOODEN: number = 0;
  static WALLS_OVERHANG: number = 0;
  static WALL_OVERHANG: number = 0;
  static WALL_OVERHANG_DECO: number = 0;
  static WALL_OVERHANG_WOODEN: number = 0;
  static DOOR_SIDEWAYS_OVERHANG: number = 0;
  static DOOR_SIDEWAYS_OVERHANG_CLOSED: number = 0;
  static DOOR_SIDEWAYS_OVERHANG_LOCKED: number = 0;
  static DOOR_SIDEWAYS_OVERHANG_CRYSTAL: number = 0;
  static DOOR_OVERHANG: number = 0;
  static DOOR_OVERHANG_OPEN: number = 0;
  static DOOR_OVERHANG_CRYSTAL: number = 0;
  static DOOR_SIDEWAYS: number = 0;
  static DOOR_SIDEWAYS_LOCKED: number = 0;
  static DOOR_SIDEWAYS_CRYSTAL: number = 0;
  static EXIT_UNDERHANG: number = 0;
  static OTHER_OVERHANG: number = 0;
  static ALCHEMY_POT_OVERHANG: number = 0;
  static BARRICADE_OVERHANG: number = 0;
  static HIGH_GRASS_OVERHANG: number = 0;
  static FURROWED_OVERHANG: number = 0;
  static HIGH_GRASS_OVERHANG_ALT: number = 0;
  static FURROWED_OVERHANG_ALT: number = 0;
  static STATUE_OVERHANG: number = 0;
  static STATUE_SP_OVERHANG: number = 0;
  static REGION_DECO_OVERHANG: number = 0;
  static REGION_DECO_ALT_OVERHANG: number = 0;
  static MINE_CRYSTAL_OVERHANG_BLUE: number = 0;
  static MINE_CRYSTAL_OVERHANG_GREEN: number = 0;
  static MINE_CRYSTAL_OVERHANG_RED: number = 0;
  static MINE_BOULDER_OVERHANG: number = 0;
  static MINE_BOULDER_OVERHANG_ALT: number = 0;
  static MINE_BOULDER_OVERHANG_ALT_2: number = 0;
  /**
   * Logic for the selection of tile visuals
   */
  static directVisuals: SparseArray<number> = null;
  static directFlatVisuals: SparseArray<number> = null;
  /**
   * Logic for the selection of alternate tile visuals
   */
  static tileVariance: number[] = null;
  static tileAltVisuals: SparseArray<DungeonTileSheet$tileAlt> = null;
  _DungeonTileSheet(): this {
    return this;
  }
  static xy(x: number, y: number): number {
    x = (x - 1) | 0;
    y = (y - 1) | 0;
    return (x + Math.imul(DungeonTileSheet.WIDTH, y)) | 0;
  }
  static stitchChasmTile(above: number): number {
    if (above === Terrain.REGION_DECO_ALT) {
      if (Dungeon.depth <= 5) {
        return DungeonTileSheet.CHASM_FLOOR_SP;
      }
      if (Dungeon.depth <= 10) {
        return DungeonTileSheet.CHASM;
      }
      if (Dungeon.depth <= 20) {
        return DungeonTileSheet.CHASM_FLOOR_SP;
      } else {
        return DungeonTileSheet.CHASM_FLOOR;
      }
    }
    return DungeonTileSheet.chasmStitcheable.get(above, DungeonTileSheet.CHASM);
  }
  static waterStitcheable(tile: number): boolean {
    if (tile === Terrain.REGION_DECO_ALT) {
      if (Dungeon.depth <= 20) {
        return false;
      } else {
        return true;
      }
    }
    return DungeonTileSheet.waterStitcheable_.contains(tile);
  }
  static stitchWaterTile(top: number, right: number, bottom: number, left: number): number {
    let result = DungeonTileSheet.WATER;
    if (DungeonTileSheet.waterStitcheable(top)) {
      result = (result + 1) | 0;
    }
    if (DungeonTileSheet.waterStitcheable(right)) {
      result = (result + 2) | 0;
    }
    if (DungeonTileSheet.waterStitcheable(bottom)) {
      result = (result + 4) | 0;
    }
    if (DungeonTileSheet.waterStitcheable(left)) {
      result = (result + 8) | 0;
    }
    return result;
  }
  static floorTile(tile: number): boolean {
    return tile === Terrain.WATER || DungeonTileSheet.directVisuals.get(tile, DungeonTileSheet.CHASM) < DungeonTileSheet.CHASM;
  }
  static wallStitcheable(tile: number): boolean {
    for (let i of DungeonTileSheet.wallStitcheable_) {
      if (tile === i) {
        return true;
      }
    }
    return false;
  }
  static getRaisedWallTile(tile: number, pos: number, right: number, below: number, left: number): number {
    let result: number;
    if (below === -1 || DungeonTileSheet.wallStitcheable(below)) {
      return -1;
    } else if (DungeonTileSheet.doorTile(below)) {
      result = DungeonTileSheet.RAISED_WALL_DOOR;
    } else if (tile === Terrain.WALL || tile === Terrain.SECRET_DOOR) {
      result = DungeonTileSheet.RAISED_WALL;
    } else if (tile === Terrain.WALL_DECO) {
      result = DungeonTileSheet.RAISED_WALL_DECO;
    } else if (tile === Terrain.BOOKSHELF) {
      result = DungeonTileSheet.RAISED_WALL_BOOKSHELF;
    } else {
      return -1;
    }
    result = DungeonTileSheet.getVisualWithAlts(result, pos);
    if (!DungeonTileSheet.wallStitcheable(right)) {
      result = (result + 1) | 0;
    }
    if (!DungeonTileSheet.wallStitcheable(left)) {
      result = (result + 2) | 0;
    }
    return result;
  }
  static getRaisedDoorTile(tile: number, below: number): number {
    if (DungeonTileSheet.wallStitcheable(below)) {
      return DungeonTileSheet.RAISED_DOOR_SIDEWAYS;
    } else if (tile === Terrain.DOOR) {
      return DungeonTileSheet.RAISED_DOOR;
    } else if (tile === Terrain.OPEN_DOOR) {
      return DungeonTileSheet.RAISED_DOOR_OPEN;
    } else if (tile === Terrain.LOCKED_DOOR) {
      return DungeonTileSheet.RAISED_DOOR_LOCKED;
    } else if (tile === Terrain.HERO_LKD_DR) {
      return DungeonTileSheet.RAISED_DOOR_LOCKED;
    } else if (tile === Terrain.CRYSTAL_DOOR) {
      return DungeonTileSheet.RAISED_DOOR_CRYSTAL;
    } else {
      return -1;
    }
  }
  static doorTile(tile: number): boolean {
    for (let i of DungeonTileSheet.doorTiles) {
      if (tile === i) {
        return true;
      }
    }
    return false;
  }
  static stitchInternalWallTile(tile: number, right: number, rightBelow: number, below: number, leftBelow: number, left: number): number {
    let result: number;
    if (tile === Terrain.BOOKSHELF || below === Terrain.BOOKSHELF) {
      result = DungeonTileSheet.WALL_INTERNAL_WOODEN;
    } else if (Dungeon.branch === 1 && tile === Terrain.WALL_DECO) {
      result = DungeonTileSheet.WALL_INTERNAL_DECO;
    } else {
      result = DungeonTileSheet.WALL_INTERNAL;
    }
    if (!DungeonTileSheet.wallStitcheable(right)) {
      result = (result + 1) | 0;
    }
    if (!DungeonTileSheet.wallStitcheable(rightBelow)) {
      result = (result + 2) | 0;
    }
    if (!DungeonTileSheet.wallStitcheable(leftBelow)) {
      result = (result + 4) | 0;
    }
    if (!DungeonTileSheet.wallStitcheable(left)) {
      result = (result + 8) | 0;
    }
    return result;
  }
  static stitchWallOverhangTile(tile: number, rightBelow: number, below: number, leftBelow: number): number {
    let visual: number;
    if (tile === Terrain.OPEN_DOOR) {
      visual = DungeonTileSheet.DOOR_SIDEWAYS_OVERHANG;
    } else if (tile === Terrain.DOOR) {
      visual = DungeonTileSheet.DOOR_SIDEWAYS_OVERHANG_CLOSED;
    } else if (tile === Terrain.LOCKED_DOOR) {
      visual = DungeonTileSheet.DOOR_SIDEWAYS_OVERHANG_LOCKED;
    } else if (tile === Terrain.HERO_LKD_DR) {
      visual = DungeonTileSheet.DOOR_SIDEWAYS_OVERHANG_LOCKED;
    } else if (tile === Terrain.CRYSTAL_DOOR) {
      visual = DungeonTileSheet.DOOR_SIDEWAYS_OVERHANG_CRYSTAL;
    } else if (Dungeon.branch === 1 && below === Terrain.WALL_DECO) {
      visual = DungeonTileSheet.WALL_OVERHANG_DECO;
    } else if (below === Terrain.BOOKSHELF) {
      visual = DungeonTileSheet.WALL_OVERHANG_WOODEN;
    } else {
      visual = DungeonTileSheet.WALL_OVERHANG;
    }
    if (!DungeonTileSheet.wallStitcheable(rightBelow)) {
      visual = (visual + 1) | 0;
    }
    if (!DungeonTileSheet.wallStitcheable(leftBelow)) {
      visual = (visual + 2) | 0;
    }
    return visual;
  }
  static setupVariance(size: number, seed: bigint): void {
    Random.pushGenerator$long(seed);
    DungeonTileSheet.tileVariance = $J.newArray(size, 0);
    for (let i = 0; i < DungeonTileSheet.tileVariance.length; i++) {
      DungeonTileSheet.tileVariance[i] = ((Random.Int$int(100)) << 24) >> 24;
    }
    Random.popGenerator();
    DungeonTileSheet.updateAltVariants();
  }
  static updateAltVariants(): void {
    if (Dungeon.level instanceof MiningLevel) {
      if (Blacksmith$Quest.Type() === Blacksmith$Quest.CRYSTAL) {
        DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.FLAT_MINE_CRYSTAL, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([Math.fround(66.7), Math.fround(33.3)], [DungeonTileSheet.FLAT_MINE_CRYSTAL_ALT, DungeonTileSheet.FLAT_MINE_CRYSTAL_ALT_2]));
        DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.RAISED_MINE_CRYSTAL_BLUE_1, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([Math.fround(83.3), Math.fround(66.7), 50, Math.fround(33.3), Math.fround(16.7)], [DungeonTileSheet.RAISED_MINE_CRYSTAL_BLUE_2, DungeonTileSheet.RAISED_MINE_CRYSTAL_GREEN_1, DungeonTileSheet.RAISED_MINE_CRYSTAL_GREEN_2, DungeonTileSheet.RAISED_MINE_CRYSTAL_RED_1, DungeonTileSheet.RAISED_MINE_CRYSTAL_RED_2]));
        DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.MINE_CRYSTAL_OVERHANG_BLUE, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([Math.fround(66.7), Math.fround(33.3)], [DungeonTileSheet.MINE_CRYSTAL_OVERHANG_GREEN, DungeonTileSheet.MINE_CRYSTAL_OVERHANG_RED]));
      } else if (Blacksmith$Quest.Type() === Blacksmith$Quest.GNOLL) {
        DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.MINE_FLOOR_DECO_HEAVY, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.MINE_FLOOR_DECO_HEAVY_ALT]));
        DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.FLAT_MINE_BOULDER, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([Math.fround(66.7), Math.fround(33.3)], [DungeonTileSheet.FLAT_MINE_BOULDER_ALT, DungeonTileSheet.FLAT_MINE_BOULDER_ALT_2]));
        DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.RAISED_MINE_BOULDER, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([Math.fround(66.7), Math.fround(33.3)], [DungeonTileSheet.RAISED_MINE_BOULDER_ALT, DungeonTileSheet.RAISED_MINE_BOULDER_ALT_2]));
        DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.MINE_BOULDER_OVERHANG, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([Math.fround(66.7), Math.fround(33.3)], [DungeonTileSheet.MINE_BOULDER_OVERHANG_ALT, DungeonTileSheet.MINE_BOULDER_OVERHANG_ALT_2]));
      }
    }
  }
  static getVisualWithAlts(visual: number, pos: number): number {
    if (DungeonTileSheet.tileAltVisuals.containsKey(visual)) {
      let alts = DungeonTileSheet.tileAltVisuals.get(visual);
      for (let i = 0; i < alts.chances.length; i++) {
        if (Math.fround(DungeonTileSheet.tileVariance[pos]) < alts.chances[i]) {
          visual = alts.alts[i];
        }
      }
    }
    return visual;
  }
  static $clinit() {
    DungeonTileSheet.GROUND = DungeonTileSheet.xy(1, 1);
    DungeonTileSheet.FLOOR = (DungeonTileSheet.GROUND + 0) | 0;
    DungeonTileSheet.FLOOR_DECO = (DungeonTileSheet.GROUND + 1) | 0;
    DungeonTileSheet.GRASS = (DungeonTileSheet.GROUND + 2) | 0;
    DungeonTileSheet.EMBERS = (DungeonTileSheet.GROUND + 3) | 0;
    DungeonTileSheet.FLOOR_SP = (DungeonTileSheet.GROUND + 4) | 0;
    DungeonTileSheet.MINE_FLOOR_DECO_HEAVY = (DungeonTileSheet.GROUND + 5) | 0;
    DungeonTileSheet.FLOOR_ALT_1 = (DungeonTileSheet.GROUND + 6) | 0;
    DungeonTileSheet.FLOOR_DECO_ALT = (DungeonTileSheet.GROUND + 7) | 0;
    DungeonTileSheet.GRASS_ALT = (DungeonTileSheet.GROUND + 8) | 0;
    DungeonTileSheet.EMBERS_ALT = (DungeonTileSheet.GROUND + 9) | 0;
    DungeonTileSheet.FLOOR_SP_ALT = (DungeonTileSheet.GROUND + 10) | 0;
    DungeonTileSheet.MINE_FLOOR_DECO_HEAVY_ALT = (DungeonTileSheet.GROUND + 11) | 0;
    DungeonTileSheet.FLOOR_ALT_2 = (DungeonTileSheet.GROUND + 12) | 0;
    DungeonTileSheet.ENTRANCE = (DungeonTileSheet.GROUND + 16) | 0;
    DungeonTileSheet.EXIT = (DungeonTileSheet.GROUND + 17) | 0;
    DungeonTileSheet.WELL = (DungeonTileSheet.GROUND + 18) | 0;
    DungeonTileSheet.EMPTY_WELL = (DungeonTileSheet.GROUND + 19) | 0;
    DungeonTileSheet.PEDESTAL = (DungeonTileSheet.GROUND + 20) | 0;
    DungeonTileSheet.ENTRANCE_SP = (DungeonTileSheet.GROUND + 22) | 0;
    DungeonTileSheet.CHASM = DungeonTileSheet.xy(9, 2);
    DungeonTileSheet.CHASM_FLOOR = (DungeonTileSheet.CHASM + 1) | 0;
    DungeonTileSheet.CHASM_FLOOR_SP = (DungeonTileSheet.CHASM + 2) | 0;
    DungeonTileSheet.CHASM_WALL = (DungeonTileSheet.CHASM + 3) | 0;
    DungeonTileSheet.CHASM_WATER = (DungeonTileSheet.CHASM + 4) | 0;
    DungeonTileSheet.chasmStitcheable = new SparseArray()._SparseArray();
    DungeonTileSheet.chasmStitcheable.put(Terrain.EMPTY, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.GRASS, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.EMBERS, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.EMPTY_WELL, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.HIGH_GRASS, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.FURROWED_GRASS, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.EMPTY_DECO, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.CUSTOM_DECO, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.EMPTY_WELL, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.WELL, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.STATUE, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.REGION_DECO, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.SECRET_TRAP, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.INACTIVE_TRAP, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.TRAP, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.BOOKSHELF, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.BARRICADE, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.PEDESTAL, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.CUSTOM_DECO_EMPTY, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.MINE_BOULDER, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.MINE_CRYSTAL, DungeonTileSheet.CHASM_FLOOR);
    DungeonTileSheet.chasmStitcheable.put(Terrain.EMPTY_SP, DungeonTileSheet.CHASM_FLOOR_SP);
    DungeonTileSheet.chasmStitcheable.put(Terrain.STATUE_SP, DungeonTileSheet.CHASM_FLOOR_SP);
    DungeonTileSheet.chasmStitcheable.put(Terrain.WALL, DungeonTileSheet.CHASM_WALL);
    DungeonTileSheet.chasmStitcheable.put(Terrain.DOOR, DungeonTileSheet.CHASM_WALL);
    DungeonTileSheet.chasmStitcheable.put(Terrain.OPEN_DOOR, DungeonTileSheet.CHASM_WALL);
    DungeonTileSheet.chasmStitcheable.put(Terrain.LOCKED_DOOR, DungeonTileSheet.CHASM_WALL);
    DungeonTileSheet.chasmStitcheable.put(Terrain.HERO_LKD_DR, DungeonTileSheet.CHASM_WALL);
    DungeonTileSheet.chasmStitcheable.put(Terrain.SECRET_DOOR, DungeonTileSheet.CHASM_WALL);
    DungeonTileSheet.chasmStitcheable.put(Terrain.WALL_DECO, DungeonTileSheet.CHASM_WALL);
    DungeonTileSheet.chasmStitcheable.put(Terrain.WATER, DungeonTileSheet.CHASM_WATER);
    DungeonTileSheet.WATER = DungeonTileSheet.xy(1, 3);
    DungeonTileSheet.waterStitcheable_ = new HashSet(Arrays.asList(Terrain.EMPTY, Terrain.GRASS, Terrain.EMPTY_WELL, Terrain.ENTRANCE, Terrain.EXIT, Terrain.EMBERS, Terrain.BARRICADE, Terrain.HIGH_GRASS, Terrain.FURROWED_GRASS, Terrain.SECRET_TRAP, Terrain.TRAP, Terrain.INACTIVE_TRAP, Terrain.EMPTY_DECO, Terrain.CUSTOM_DECO, Terrain.WELL, Terrain.STATUE, Terrain.REGION_DECO, Terrain.ALCHEMY, Terrain.CUSTOM_DECO_EMPTY, Terrain.MINE_CRYSTAL, Terrain.MINE_BOULDER, Terrain.DOOR, Terrain.OPEN_DOOR, Terrain.LOCKED_DOOR, Terrain.HERO_LKD_DR, Terrain.CRYSTAL_DOOR));
    DungeonTileSheet.FLAT_WALLS = DungeonTileSheet.xy(1, 4);
    DungeonTileSheet.FLAT_WALL = (DungeonTileSheet.FLAT_WALLS + 0) | 0;
    DungeonTileSheet.FLAT_WALL_DECO = (DungeonTileSheet.FLAT_WALLS + 1) | 0;
    DungeonTileSheet.FLAT_BOOKSHELF = (DungeonTileSheet.FLAT_WALLS + 2) | 0;
    DungeonTileSheet.FLAT_WALL_ALT = (DungeonTileSheet.FLAT_WALLS + 4) | 0;
    DungeonTileSheet.FLAT_WALL_DECO_ALT = (DungeonTileSheet.FLAT_WALLS + 5) | 0;
    DungeonTileSheet.FLAT_BOOKSHELF_ALT = (DungeonTileSheet.FLAT_WALLS + 6) | 0;
    DungeonTileSheet.FLAT_DOOR = (DungeonTileSheet.FLAT_WALLS + 8) | 0;
    DungeonTileSheet.FLAT_DOOR_OPEN = (DungeonTileSheet.FLAT_WALLS + 9) | 0;
    DungeonTileSheet.FLAT_DOOR_LOCKED = (DungeonTileSheet.FLAT_WALLS + 10) | 0;
    DungeonTileSheet.FLAT_DOOR_CRYSTAL = (DungeonTileSheet.FLAT_WALLS + 11) | 0;
    DungeonTileSheet.UNLOCKED_EXIT = (DungeonTileSheet.FLAT_WALLS + 12) | 0;
    DungeonTileSheet.LOCKED_EXIT = (DungeonTileSheet.FLAT_WALLS + 13) | 0;
    DungeonTileSheet.FLAT_OTHER = DungeonTileSheet.xy(1, 5);
    DungeonTileSheet.FLAT_ALCHEMY_POT = (DungeonTileSheet.FLAT_OTHER + 0) | 0;
    DungeonTileSheet.FLAT_BARRICADE = (DungeonTileSheet.FLAT_OTHER + 1) | 0;
    DungeonTileSheet.FLAT_HIGH_GRASS = (DungeonTileSheet.FLAT_OTHER + 2) | 0;
    DungeonTileSheet.FLAT_FURROWED_GRASS = (DungeonTileSheet.FLAT_OTHER + 3) | 0;
    DungeonTileSheet.FLAT_HIGH_GRASS_ALT = (DungeonTileSheet.FLAT_OTHER + 5) | 0;
    DungeonTileSheet.FLAT_FURROWED_ALT = (DungeonTileSheet.FLAT_OTHER + 6) | 0;
    DungeonTileSheet.FLAT_STATUE = (DungeonTileSheet.FLAT_OTHER + 8) | 0;
    DungeonTileSheet.FLAT_STATUE_SP = (DungeonTileSheet.FLAT_OTHER + 9) | 0;
    DungeonTileSheet.FLAT_REGION_DECO = (DungeonTileSheet.FLAT_OTHER + 10) | 0;
    DungeonTileSheet.FLAT_REGION_DECO_ALT = (DungeonTileSheet.FLAT_OTHER + 11) | 0;
    DungeonTileSheet.FLAT_MINE_CRYSTAL = (DungeonTileSheet.FLAT_OTHER + 12) | 0;
    DungeonTileSheet.FLAT_MINE_CRYSTAL_ALT = (DungeonTileSheet.FLAT_OTHER + 13) | 0;
    DungeonTileSheet.FLAT_MINE_CRYSTAL_ALT_2 = (DungeonTileSheet.FLAT_OTHER + 14) | 0;
    DungeonTileSheet.FLAT_MINE_BOULDER = (DungeonTileSheet.FLAT_OTHER + 12) | 0;
    DungeonTileSheet.FLAT_MINE_BOULDER_ALT = (DungeonTileSheet.FLAT_OTHER + 13) | 0;
    DungeonTileSheet.FLAT_MINE_BOULDER_ALT_2 = (DungeonTileSheet.FLAT_OTHER + 14) | 0;
    DungeonTileSheet.RAISED_WALLS = DungeonTileSheet.xy(1, 6);
    DungeonTileSheet.RAISED_WALL = (DungeonTileSheet.RAISED_WALLS + 0) | 0;
    DungeonTileSheet.RAISED_WALL_DECO = (DungeonTileSheet.RAISED_WALLS + 4) | 0;
    DungeonTileSheet.RAISED_WALL_DOOR = (DungeonTileSheet.RAISED_WALLS + 8) | 0;
    DungeonTileSheet.RAISED_WALL_BOOKSHELF = (DungeonTileSheet.RAISED_WALLS + 12) | 0;
    DungeonTileSheet.RAISED_WALL_ALT = (DungeonTileSheet.RAISED_WALLS + 16) | 0;
    DungeonTileSheet.RAISED_WALL_DECO_ALT = (DungeonTileSheet.RAISED_WALLS + 20) | 0;
    DungeonTileSheet.RAISED_WALL_BOOKSHELF_ALT = (DungeonTileSheet.RAISED_WALLS + 28) | 0;
    DungeonTileSheet.wallStitcheable_ = [Terrain.WALL, Terrain.WALL_DECO, Terrain.SECRET_DOOR, Terrain.LOCKED_EXIT, Terrain.UNLOCKED_EXIT, Terrain.BOOKSHELF, DungeonTileSheet.NULL_TILE];
    DungeonTileSheet.RAISED_DOORS = DungeonTileSheet.xy(1, 8);
    DungeonTileSheet.RAISED_DOOR = (DungeonTileSheet.RAISED_DOORS + 0) | 0;
    DungeonTileSheet.RAISED_DOOR_OPEN = (DungeonTileSheet.RAISED_DOORS + 1) | 0;
    DungeonTileSheet.RAISED_DOOR_LOCKED = (DungeonTileSheet.RAISED_DOORS + 2) | 0;
    DungeonTileSheet.RAISED_DOOR_CRYSTAL = (DungeonTileSheet.RAISED_DOORS + 3) | 0;
    DungeonTileSheet.RAISED_DOOR_SIDEWAYS = (DungeonTileSheet.RAISED_DOORS + 4) | 0;
    DungeonTileSheet.doorTiles = [Terrain.DOOR, Terrain.LOCKED_DOOR, Terrain.HERO_LKD_DR, Terrain.CRYSTAL_DOOR, Terrain.OPEN_DOOR];
    DungeonTileSheet.RAISED_OTHER = DungeonTileSheet.xy(9, 8);
    DungeonTileSheet.RAISED_ALCHEMY_POT = (DungeonTileSheet.RAISED_OTHER + 0) | 0;
    DungeonTileSheet.RAISED_BARRICADE = (DungeonTileSheet.RAISED_OTHER + 1) | 0;
    DungeonTileSheet.RAISED_HIGH_GRASS = (DungeonTileSheet.RAISED_OTHER + 2) | 0;
    DungeonTileSheet.RAISED_FURROWED_GRASS = (DungeonTileSheet.RAISED_OTHER + 3) | 0;
    DungeonTileSheet.RAISED_HIGH_GRASS_ALT = (DungeonTileSheet.RAISED_OTHER + 5) | 0;
    DungeonTileSheet.RAISED_FURROWED_ALT = (DungeonTileSheet.RAISED_OTHER + 6) | 0;
    DungeonTileSheet.RAISED_STATUE = (DungeonTileSheet.RAISED_OTHER + 8) | 0;
    DungeonTileSheet.RAISED_STATUE_SP = (DungeonTileSheet.RAISED_OTHER + 9) | 0;
    DungeonTileSheet.RAISED_REGION_DECO = (DungeonTileSheet.RAISED_OTHER + 10) | 0;
    DungeonTileSheet.RAISED_REGION_DECO_ALT = (DungeonTileSheet.RAISED_OTHER + 11) | 0;
    DungeonTileSheet.RAISED_MINE_CRYSTAL_BLUE_1 = (DungeonTileSheet.RAISED_OTHER + 12) | 0;
    DungeonTileSheet.RAISED_MINE_CRYSTAL_BLUE_2 = (DungeonTileSheet.RAISED_OTHER + 13) | 0;
    DungeonTileSheet.RAISED_MINE_CRYSTAL_GREEN_1 = (DungeonTileSheet.RAISED_OTHER + 14) | 0;
    DungeonTileSheet.RAISED_MINE_CRYSTAL_GREEN_2 = (DungeonTileSheet.RAISED_OTHER + 15) | 0;
    DungeonTileSheet.RAISED_MINE_CRYSTAL_RED_1 = (DungeonTileSheet.RAISED_OTHER + 16) | 0;
    DungeonTileSheet.RAISED_MINE_CRYSTAL_RED_2 = (DungeonTileSheet.RAISED_OTHER + 17) | 0;
    DungeonTileSheet.RAISED_MINE_BOULDER = (DungeonTileSheet.RAISED_OTHER + 12) | 0;
    DungeonTileSheet.RAISED_MINE_BOULDER_ALT = (DungeonTileSheet.RAISED_OTHER + 13) | 0;
    DungeonTileSheet.RAISED_MINE_BOULDER_ALT_2 = (DungeonTileSheet.RAISED_OTHER + 14) | 0;
    DungeonTileSheet.WALLS_INTERNAL = DungeonTileSheet.xy(1, 10);
    DungeonTileSheet.WALL_INTERNAL = (DungeonTileSheet.WALLS_INTERNAL + 0) | 0;
    DungeonTileSheet.WALL_INTERNAL_DECO = (DungeonTileSheet.WALLS_INTERNAL + 16) | 0;
    DungeonTileSheet.WALL_INTERNAL_WOODEN = (DungeonTileSheet.WALLS_INTERNAL + 32) | 0;
    DungeonTileSheet.WALLS_OVERHANG = DungeonTileSheet.xy(1, 13);
    DungeonTileSheet.WALL_OVERHANG = (DungeonTileSheet.WALLS_OVERHANG + 0) | 0;
    DungeonTileSheet.WALL_OVERHANG_DECO = (DungeonTileSheet.WALLS_OVERHANG + 4) | 0;
    DungeonTileSheet.WALL_OVERHANG_WOODEN = (DungeonTileSheet.WALLS_OVERHANG + 8) | 0;
    DungeonTileSheet.DOOR_SIDEWAYS_OVERHANG = (DungeonTileSheet.WALLS_OVERHANG + 16) | 0;
    DungeonTileSheet.DOOR_SIDEWAYS_OVERHANG_CLOSED = (DungeonTileSheet.WALLS_OVERHANG + 20) | 0;
    DungeonTileSheet.DOOR_SIDEWAYS_OVERHANG_LOCKED = (DungeonTileSheet.WALLS_OVERHANG + 24) | 0;
    DungeonTileSheet.DOOR_SIDEWAYS_OVERHANG_CRYSTAL = (DungeonTileSheet.WALLS_OVERHANG + 28) | 0;
    DungeonTileSheet.DOOR_OVERHANG = DungeonTileSheet.xy(1, 15);
    DungeonTileSheet.DOOR_OVERHANG_OPEN = (DungeonTileSheet.DOOR_OVERHANG + 1) | 0;
    DungeonTileSheet.DOOR_OVERHANG_CRYSTAL = (DungeonTileSheet.DOOR_OVERHANG + 2) | 0;
    DungeonTileSheet.DOOR_SIDEWAYS = (DungeonTileSheet.DOOR_OVERHANG + 3) | 0;
    DungeonTileSheet.DOOR_SIDEWAYS_LOCKED = (DungeonTileSheet.DOOR_OVERHANG + 4) | 0;
    DungeonTileSheet.DOOR_SIDEWAYS_CRYSTAL = (DungeonTileSheet.DOOR_OVERHANG + 5) | 0;
    DungeonTileSheet.EXIT_UNDERHANG = (DungeonTileSheet.DOOR_OVERHANG + 6) | 0;
    DungeonTileSheet.OTHER_OVERHANG = DungeonTileSheet.xy(9, 15);
    DungeonTileSheet.ALCHEMY_POT_OVERHANG = (DungeonTileSheet.OTHER_OVERHANG + 0) | 0;
    DungeonTileSheet.BARRICADE_OVERHANG = (DungeonTileSheet.OTHER_OVERHANG + 1) | 0;
    DungeonTileSheet.HIGH_GRASS_OVERHANG = (DungeonTileSheet.OTHER_OVERHANG + 2) | 0;
    DungeonTileSheet.FURROWED_OVERHANG = (DungeonTileSheet.OTHER_OVERHANG + 3) | 0;
    DungeonTileSheet.HIGH_GRASS_OVERHANG_ALT = (DungeonTileSheet.OTHER_OVERHANG + 5) | 0;
    DungeonTileSheet.FURROWED_OVERHANG_ALT = (DungeonTileSheet.OTHER_OVERHANG + 6) | 0;
    DungeonTileSheet.STATUE_OVERHANG = (DungeonTileSheet.OTHER_OVERHANG + 8) | 0;
    DungeonTileSheet.STATUE_SP_OVERHANG = (DungeonTileSheet.OTHER_OVERHANG + 9) | 0;
    DungeonTileSheet.REGION_DECO_OVERHANG = (DungeonTileSheet.OTHER_OVERHANG + 10) | 0;
    DungeonTileSheet.REGION_DECO_ALT_OVERHANG = (DungeonTileSheet.OTHER_OVERHANG + 11) | 0;
    DungeonTileSheet.MINE_CRYSTAL_OVERHANG_BLUE = (DungeonTileSheet.OTHER_OVERHANG + 12) | 0;
    DungeonTileSheet.MINE_CRYSTAL_OVERHANG_GREEN = (DungeonTileSheet.OTHER_OVERHANG + 13) | 0;
    DungeonTileSheet.MINE_CRYSTAL_OVERHANG_RED = (DungeonTileSheet.OTHER_OVERHANG + 14) | 0;
    DungeonTileSheet.MINE_BOULDER_OVERHANG = (DungeonTileSheet.OTHER_OVERHANG + 12) | 0;
    DungeonTileSheet.MINE_BOULDER_OVERHANG_ALT = (DungeonTileSheet.OTHER_OVERHANG + 13) | 0;
    DungeonTileSheet.MINE_BOULDER_OVERHANG_ALT_2 = (DungeonTileSheet.OTHER_OVERHANG + 14) | 0;
    DungeonTileSheet.directVisuals = new SparseArray()._SparseArray();
    DungeonTileSheet.directVisuals.put(Terrain.EMPTY, DungeonTileSheet.FLOOR);
    DungeonTileSheet.directVisuals.put(Terrain.GRASS, DungeonTileSheet.GRASS);
    DungeonTileSheet.directVisuals.put(Terrain.EMPTY_WELL, DungeonTileSheet.EMPTY_WELL);
    DungeonTileSheet.directVisuals.put(Terrain.ENTRANCE, DungeonTileSheet.ENTRANCE);
    DungeonTileSheet.directVisuals.put(Terrain.EXIT, DungeonTileSheet.EXIT);
    DungeonTileSheet.directVisuals.put(Terrain.EMBERS, DungeonTileSheet.EMBERS);
    DungeonTileSheet.directVisuals.put(Terrain.PEDESTAL, DungeonTileSheet.PEDESTAL);
    DungeonTileSheet.directVisuals.put(Terrain.EMPTY_SP, DungeonTileSheet.FLOOR_SP);
    DungeonTileSheet.directVisuals.put(Terrain.ENTRANCE_SP, DungeonTileSheet.ENTRANCE_SP);
    DungeonTileSheet.directVisuals.put(Terrain.SECRET_TRAP, DungeonTileSheet.directVisuals.get(Terrain.EMPTY));
    DungeonTileSheet.directVisuals.put(Terrain.TRAP, DungeonTileSheet.directVisuals.get(Terrain.EMPTY));
    DungeonTileSheet.directVisuals.put(Terrain.INACTIVE_TRAP, DungeonTileSheet.directVisuals.get(Terrain.EMPTY));
    DungeonTileSheet.directVisuals.put(Terrain.CUSTOM_DECO, DungeonTileSheet.directVisuals.get(Terrain.EMPTY));
    DungeonTileSheet.directVisuals.put(Terrain.CUSTOM_DECO_EMPTY, DungeonTileSheet.directVisuals.get(Terrain.EMPTY));
    DungeonTileSheet.directVisuals.put(Terrain.CUSTOM_DECO_WTR, DungeonTileSheet.WATER);
    DungeonTileSheet.directVisuals.put(Terrain.EMPTY_DECO, DungeonTileSheet.FLOOR_DECO);
    DungeonTileSheet.directVisuals.put(Terrain.EMPTY_DECO, DungeonTileSheet.FLOOR_DECO);
    DungeonTileSheet.directVisuals.put(Terrain.LOCKED_EXIT, DungeonTileSheet.LOCKED_EXIT);
    DungeonTileSheet.directVisuals.put(Terrain.UNLOCKED_EXIT, DungeonTileSheet.UNLOCKED_EXIT);
    DungeonTileSheet.directVisuals.put(Terrain.WELL, DungeonTileSheet.WELL);
    DungeonTileSheet.directFlatVisuals = new SparseArray()._SparseArray();
    DungeonTileSheet.directFlatVisuals.put(Terrain.WALL, DungeonTileSheet.FLAT_WALL);
    DungeonTileSheet.directFlatVisuals.put(Terrain.DOOR, DungeonTileSheet.FLAT_DOOR);
    DungeonTileSheet.directFlatVisuals.put(Terrain.OPEN_DOOR, DungeonTileSheet.FLAT_DOOR_OPEN);
    DungeonTileSheet.directFlatVisuals.put(Terrain.LOCKED_DOOR, DungeonTileSheet.FLAT_DOOR_LOCKED);
    DungeonTileSheet.directFlatVisuals.put(Terrain.HERO_LKD_DR, DungeonTileSheet.FLAT_DOOR_LOCKED);
    DungeonTileSheet.directFlatVisuals.put(Terrain.CRYSTAL_DOOR, DungeonTileSheet.FLAT_DOOR_CRYSTAL);
    DungeonTileSheet.directFlatVisuals.put(Terrain.WALL_DECO, DungeonTileSheet.FLAT_WALL_DECO);
    DungeonTileSheet.directFlatVisuals.put(Terrain.BOOKSHELF, DungeonTileSheet.FLAT_BOOKSHELF);
    DungeonTileSheet.directFlatVisuals.put(Terrain.ALCHEMY, DungeonTileSheet.FLAT_ALCHEMY_POT);
    DungeonTileSheet.directFlatVisuals.put(Terrain.BARRICADE, DungeonTileSheet.FLAT_BARRICADE);
    DungeonTileSheet.directFlatVisuals.put(Terrain.HIGH_GRASS, DungeonTileSheet.FLAT_HIGH_GRASS);
    DungeonTileSheet.directFlatVisuals.put(Terrain.FURROWED_GRASS, DungeonTileSheet.FLAT_FURROWED_GRASS);
    DungeonTileSheet.directFlatVisuals.put(Terrain.STATUE, DungeonTileSheet.FLAT_STATUE);
    DungeonTileSheet.directFlatVisuals.put(Terrain.STATUE_SP, DungeonTileSheet.FLAT_STATUE_SP);
    DungeonTileSheet.directFlatVisuals.put(Terrain.REGION_DECO, DungeonTileSheet.FLAT_REGION_DECO);
    DungeonTileSheet.directFlatVisuals.put(Terrain.REGION_DECO_ALT, DungeonTileSheet.FLAT_REGION_DECO_ALT);
    DungeonTileSheet.directFlatVisuals.put(Terrain.MINE_CRYSTAL, DungeonTileSheet.FLAT_MINE_CRYSTAL);
    DungeonTileSheet.directFlatVisuals.put(Terrain.MINE_BOULDER, DungeonTileSheet.FLAT_MINE_BOULDER);
    DungeonTileSheet.directFlatVisuals.put(Terrain.SECRET_DOOR, DungeonTileSheet.directFlatVisuals.get(Terrain.WALL));
    DungeonTileSheet.tileAltVisuals = new SparseArray()._SparseArray();
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.FLOOR, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([52.5, 5], [DungeonTileSheet.FLOOR_ALT_1, DungeonTileSheet.FLOOR_ALT_2]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.GRASS, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.GRASS_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.FLAT_WALL, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.FLAT_WALL_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.EMBERS, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.EMBERS_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.FLAT_WALL_DECO, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.FLAT_WALL_DECO_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.FLOOR_SP, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.FLOOR_SP_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.FLOOR_DECO, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.FLOOR_DECO_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.GRASS, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.GRASS_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.FLAT_BOOKSHELF, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.FLAT_BOOKSHELF_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.FLAT_HIGH_GRASS, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.FLAT_HIGH_GRASS_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.FLAT_FURROWED_GRASS, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.FLAT_FURROWED_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.RAISED_WALL, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.RAISED_WALL_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.RAISED_WALL_DECO, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.RAISED_WALL_DECO_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.RAISED_WALL_BOOKSHELF, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.RAISED_WALL_BOOKSHELF_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.RAISED_HIGH_GRASS, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.RAISED_HIGH_GRASS_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.RAISED_FURROWED_GRASS, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.RAISED_FURROWED_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.HIGH_GRASS_OVERHANG, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.HIGH_GRASS_OVERHANG_ALT]));
    DungeonTileSheet.tileAltVisuals.put(DungeonTileSheet.FURROWED_OVERHANG, new DungeonTileSheet$tileAlt()._DungeonTileSheet$tileAlt([50], [DungeonTileSheet.FURROWED_OVERHANG_ALT]));
  }
}

export class DungeonTileSheet$tileAlt extends JObject {
  chances: number[] = null;
  alts: number[] = null;
  _DungeonTileSheet$tileAlt(chances: number[], alts: number[]): this {
    this.chances = chances;
    this.alts = alts;
    return this;
  }
}

$J.define(DungeonTileSheet, 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DungeonTileSheet' }, clinit: true, lazy: ['GROUND', 'FLOOR', 'FLOOR_DECO', 'GRASS', 'EMBERS', 'FLOOR_SP', 'MINE_FLOOR_DECO_HEAVY', 'FLOOR_ALT_1', 'FLOOR_DECO_ALT', 'GRASS_ALT', 'EMBERS_ALT', 'FLOOR_SP_ALT', 'MINE_FLOOR_DECO_HEAVY_ALT', 'FLOOR_ALT_2', 'ENTRANCE', 'EXIT', 'WELL', 'EMPTY_WELL', 'PEDESTAL', 'ENTRANCE_SP', 'CHASM', 'CHASM_FLOOR', 'CHASM_FLOOR_SP', 'CHASM_WALL', 'CHASM_WATER', 'chasmStitcheable', 'WATER', 'waterStitcheable_', 'FLAT_WALLS', 'FLAT_WALL', 'FLAT_WALL_DECO', 'FLAT_BOOKSHELF', 'FLAT_WALL_ALT', 'FLAT_WALL_DECO_ALT', 'FLAT_BOOKSHELF_ALT', 'FLAT_DOOR', 'FLAT_DOOR_OPEN', 'FLAT_DOOR_LOCKED', 'FLAT_DOOR_CRYSTAL', 'UNLOCKED_EXIT', 'LOCKED_EXIT', 'FLAT_OTHER', 'FLAT_ALCHEMY_POT', 'FLAT_BARRICADE', 'FLAT_HIGH_GRASS', 'FLAT_FURROWED_GRASS', 'FLAT_HIGH_GRASS_ALT', 'FLAT_FURROWED_ALT', 'FLAT_STATUE', 'FLAT_STATUE_SP', 'FLAT_REGION_DECO', 'FLAT_REGION_DECO_ALT', 'FLAT_MINE_CRYSTAL', 'FLAT_MINE_CRYSTAL_ALT', 'FLAT_MINE_CRYSTAL_ALT_2', 'FLAT_MINE_BOULDER', 'FLAT_MINE_BOULDER_ALT', 'FLAT_MINE_BOULDER_ALT_2', 'RAISED_WALLS', 'RAISED_WALL', 'RAISED_WALL_DECO', 'RAISED_WALL_DOOR', 'RAISED_WALL_BOOKSHELF', 'RAISED_WALL_ALT', 'RAISED_WALL_DECO_ALT', 'RAISED_WALL_BOOKSHELF_ALT', 'wallStitcheable_', 'RAISED_DOORS', 'RAISED_DOOR', 'RAISED_DOOR_OPEN', 'RAISED_DOOR_LOCKED', 'RAISED_DOOR_CRYSTAL', 'RAISED_DOOR_SIDEWAYS', 'doorTiles', 'RAISED_OTHER', 'RAISED_ALCHEMY_POT', 'RAISED_BARRICADE', 'RAISED_HIGH_GRASS', 'RAISED_FURROWED_GRASS', 'RAISED_HIGH_GRASS_ALT', 'RAISED_FURROWED_ALT', 'RAISED_STATUE', 'RAISED_STATUE_SP', 'RAISED_REGION_DECO', 'RAISED_REGION_DECO_ALT', 'RAISED_MINE_CRYSTAL_BLUE_1', 'RAISED_MINE_CRYSTAL_BLUE_2', 'RAISED_MINE_CRYSTAL_GREEN_1', 'RAISED_MINE_CRYSTAL_GREEN_2', 'RAISED_MINE_CRYSTAL_RED_1', 'RAISED_MINE_CRYSTAL_RED_2', 'RAISED_MINE_BOULDER', 'RAISED_MINE_BOULDER_ALT', 'RAISED_MINE_BOULDER_ALT_2', 'WALLS_INTERNAL', 'WALL_INTERNAL', 'WALL_INTERNAL_DECO', 'WALL_INTERNAL_WOODEN', 'WALLS_OVERHANG', 'WALL_OVERHANG', 'WALL_OVERHANG_DECO', 'WALL_OVERHANG_WOODEN', 'DOOR_SIDEWAYS_OVERHANG', 'DOOR_SIDEWAYS_OVERHANG_CLOSED', 'DOOR_SIDEWAYS_OVERHANG_LOCKED', 'DOOR_SIDEWAYS_OVERHANG_CRYSTAL', 'DOOR_OVERHANG', 'DOOR_OVERHANG_OPEN', 'DOOR_OVERHANG_CRYSTAL', 'DOOR_SIDEWAYS', 'DOOR_SIDEWAYS_LOCKED', 'DOOR_SIDEWAYS_CRYSTAL', 'EXIT_UNDERHANG', 'OTHER_OVERHANG', 'ALCHEMY_POT_OVERHANG', 'BARRICADE_OVERHANG', 'HIGH_GRASS_OVERHANG', 'FURROWED_OVERHANG', 'HIGH_GRASS_OVERHANG_ALT', 'FURROWED_OVERHANG_ALT', 'STATUE_OVERHANG', 'STATUE_SP_OVERHANG', 'REGION_DECO_OVERHANG', 'REGION_DECO_ALT_OVERHANG', 'MINE_CRYSTAL_OVERHANG_BLUE', 'MINE_CRYSTAL_OVERHANG_GREEN', 'MINE_CRYSTAL_OVERHANG_RED', 'MINE_BOULDER_OVERHANG', 'MINE_BOULDER_OVERHANG_ALT', 'MINE_BOULDER_OVERHANG_ALT_2', 'directVisuals', 'directFlatVisuals', 'tileVariance', 'tileAltVisuals'] });
$J.define(DungeonTileSheet$tileAlt, 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet$tileAlt', { kind: 'class', sup: 'java.lang.Object', ctors: { 'float[],int[]': '_DungeonTileSheet$tileAlt' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  MiningLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Random = $J.load('com.watabou.utils.Random');
  SparseArray = $J.load('com.watabou.utils.SparseArray');
});
