// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/CellEmitter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let GameScene, DungeonTilemap;

export class CellEmitter extends JObject {
  _CellEmitter(): this {
    return this;
  }
  static floor(cell: number): Emitter {
    let p = DungeonTilemap.tileToWorld(cell);
    let emitter = GameScene.floorEmitter();
    emitter.pos$float$float$float$float(p.x, p.y, Math.fround(DungeonTilemap.SIZE), Math.fround(DungeonTilemap.SIZE));
    return emitter;
  }
  static get(cell: number): Emitter {
    let p = DungeonTilemap.tileToWorld(cell);
    let emitter = GameScene.emitter();
    emitter.pos$float$float$float$float(p.x, p.y, Math.fround(DungeonTilemap.SIZE), Math.fround(DungeonTilemap.SIZE));
    return emitter;
  }
  static center(cell: number): Emitter {
    let p = DungeonTilemap.tileToWorld(cell);
    let emitter = GameScene.emitter();
    emitter.pos$float$float(Math.fround(p.x + $J.idiv(DungeonTilemap.SIZE, 2)), Math.fround(p.y + $J.idiv(DungeonTilemap.SIZE, 2)));
    return emitter;
  }
  static bottom(cell: number): Emitter {
    let p = DungeonTilemap.tileToWorld(cell);
    let emitter = GameScene.emitter();
    emitter.pos$float$float$float$float(p.x, Math.fround(p.y + DungeonTilemap.SIZE), Math.fround(DungeonTilemap.SIZE), 0);
    return emitter;
  }
}

$J.define(CellEmitter, 'com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_CellEmitter' } });
$J.module(() => {
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
});
