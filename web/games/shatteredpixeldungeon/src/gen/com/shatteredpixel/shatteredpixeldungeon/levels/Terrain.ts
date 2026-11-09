// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/Terrain.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';

export class Terrain extends JObject {
  static readonly CHASM: number = 0;
  static readonly EMPTY: number = 1;
  static readonly GRASS: number = 2;
  static readonly EMPTY_WELL: number = 3;
  static readonly WALL: number = 4;
  static readonly DOOR: number = 5;
  static readonly OPEN_DOOR: number = 6;
  static readonly ENTRANCE: number = 7;
  static readonly ENTRANCE_SP: number = 37;
  static readonly EXIT: number = 8;
  static readonly EMBERS: number = 9;
  static readonly LOCKED_DOOR: number = 10;
  static readonly HERO_LKD_DR: number = 38;
  static readonly CRYSTAL_DOOR: number = 31;
  static readonly PEDESTAL: number = 11;
  static readonly WALL_DECO: number = 12;
  static readonly BARRICADE: number = 13;
  static readonly EMPTY_SP: number = 14;
  static readonly HIGH_GRASS: number = 15;
  static readonly FURROWED_GRASS: number = 30;
  static readonly SECRET_DOOR: number = 16;
  static readonly SECRET_TRAP: number = 17;
  static readonly TRAP: number = 18;
  static readonly INACTIVE_TRAP: number = 19;
  static readonly EMPTY_DECO: number = 20;
  static readonly LOCKED_EXIT: number = 21;
  static readonly UNLOCKED_EXIT: number = 22;
  static readonly WELL: number = 24;
  static readonly BOOKSHELF: number = 27;
  static readonly ALCHEMY: number = 28;
  static readonly CUSTOM_DECO_EMPTY: number = 32;
  static readonly CUSTOM_DECO: number = 23;
  static readonly CUSTOM_DECO_WTR: number = 39;
  static readonly STATUE: number = 25;
  static readonly STATUE_SP: number = 26;
  static readonly REGION_DECO: number = 33;
  static readonly REGION_DECO_ALT: number = 34;
  static readonly MINE_CRYSTAL: number = 35;
  static readonly MINE_BOULDER: number = 36;
  static readonly WATER: number = 29;
  static readonly PASSABLE: number = 1;
  static readonly LOS_BLOCKING: number = 2;
  static readonly FLAMABLE: number = 4;
  static readonly SECRET: number = 8;
  static readonly SOLID: number = 16;
  static readonly AVOID: number = 32;
  static readonly LIQUID: number = 64;
  static readonly PIT: number = 128;
  static flags: number[] = null;
  _Terrain(): this {
    return this;
  }
  static discover(terr: number): number {
    switch (terr) {
      case Terrain.SECRET_DOOR:
        return Terrain.DOOR;
      case Terrain.SECRET_TRAP:
        return Terrain.TRAP;
      default:
        return terr;
    }
  }
  static $clinit() {
    Terrain.flags = $J.newArray(256, 0);
    Terrain.flags[Terrain.CHASM] = Terrain.AVOID | Terrain.PIT;
    Terrain.flags[Terrain.EMPTY] = Terrain.PASSABLE;
    Terrain.flags[Terrain.GRASS] = Terrain.PASSABLE | Terrain.FLAMABLE;
    Terrain.flags[Terrain.EMPTY_WELL] = Terrain.PASSABLE;
    Terrain.flags[Terrain.WATER] = Terrain.PASSABLE | Terrain.LIQUID;
    Terrain.flags[Terrain.WALL] = Terrain.LOS_BLOCKING | Terrain.SOLID;
    Terrain.flags[Terrain.DOOR] = Terrain.PASSABLE | Terrain.LOS_BLOCKING | Terrain.FLAMABLE | Terrain.SOLID;
    Terrain.flags[Terrain.OPEN_DOOR] = Terrain.PASSABLE | Terrain.FLAMABLE;
    Terrain.flags[Terrain.ENTRANCE] = Terrain.PASSABLE;
    Terrain.flags[Terrain.ENTRANCE_SP] = Terrain.flags[Terrain.ENTRANCE];
    Terrain.flags[Terrain.EXIT] = Terrain.PASSABLE;
    Terrain.flags[Terrain.EMBERS] = Terrain.PASSABLE;
    Terrain.flags[Terrain.LOCKED_DOOR] = Terrain.LOS_BLOCKING | Terrain.SOLID;
    Terrain.flags[Terrain.HERO_LKD_DR] = Terrain.flags[Terrain.LOCKED_DOOR];
    Terrain.flags[Terrain.CRYSTAL_DOOR] = Terrain.SOLID;
    Terrain.flags[Terrain.PEDESTAL] = Terrain.PASSABLE;
    Terrain.flags[Terrain.WALL_DECO] = Terrain.flags[Terrain.WALL];
    Terrain.flags[Terrain.BARRICADE] = Terrain.FLAMABLE | Terrain.SOLID | Terrain.LOS_BLOCKING;
    Terrain.flags[Terrain.EMPTY_SP] = Terrain.flags[Terrain.EMPTY];
    Terrain.flags[Terrain.HIGH_GRASS] = Terrain.PASSABLE | Terrain.LOS_BLOCKING | Terrain.FLAMABLE;
    Terrain.flags[Terrain.FURROWED_GRASS] = Terrain.flags[Terrain.HIGH_GRASS];
    Terrain.flags[Terrain.SECRET_DOOR] = Terrain.flags[Terrain.WALL] | Terrain.SECRET;
    Terrain.flags[Terrain.SECRET_TRAP] = Terrain.flags[Terrain.EMPTY] | Terrain.SECRET;
    Terrain.flags[Terrain.TRAP] = Terrain.AVOID;
    Terrain.flags[Terrain.INACTIVE_TRAP] = Terrain.flags[Terrain.EMPTY];
    Terrain.flags[Terrain.EMPTY_DECO] = Terrain.flags[Terrain.EMPTY];
    Terrain.flags[Terrain.LOCKED_EXIT] = Terrain.SOLID;
    Terrain.flags[Terrain.UNLOCKED_EXIT] = Terrain.PASSABLE;
    Terrain.flags[Terrain.WELL] = Terrain.AVOID;
    Terrain.flags[Terrain.BOOKSHELF] = Terrain.flags[Terrain.BARRICADE];
    Terrain.flags[Terrain.ALCHEMY] = Terrain.SOLID;
    Terrain.flags[Terrain.CUSTOM_DECO_EMPTY] = Terrain.flags[Terrain.EMPTY];
    Terrain.flags[Terrain.CUSTOM_DECO] = Terrain.SOLID;
    Terrain.flags[Terrain.CUSTOM_DECO_WTR] = Terrain.SOLID;
    Terrain.flags[Terrain.STATUE] = Terrain.SOLID;
    Terrain.flags[Terrain.STATUE_SP] = Terrain.flags[Terrain.STATUE];
    Terrain.flags[Terrain.REGION_DECO] = Terrain.flags[Terrain.STATUE];
    Terrain.flags[Terrain.REGION_DECO_ALT] = Terrain.flags[Terrain.STATUE_SP];
    Terrain.flags[Terrain.MINE_CRYSTAL] = Terrain.SOLID;
    Terrain.flags[Terrain.MINE_BOULDER] = Terrain.SOLID;
  }
}

$J.define(Terrain, 'com.shatteredpixel.shatteredpixeldungeon.levels.Terrain', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Terrain' }, clinit: true, lazy: ['flags'] });
