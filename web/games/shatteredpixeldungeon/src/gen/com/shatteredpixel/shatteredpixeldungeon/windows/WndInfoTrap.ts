// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { WndTitledMessage } from './WndTitledMessage.ts';

let Dungeon, Messages, TerrainFeaturesTilemap;

export class WndInfoTrap extends WndTitledMessage {
  _WndInfoTrap(trap: Trap): this {
    this._WndTitledMessage$Image$String$String(TerrainFeaturesTilemap.tile(trap.pos, Dungeon.level.map_[trap.pos]), Messages.titleCase(trap.name()), trap.desc());
    return this;
  }
}

$J.define(WndInfoTrap, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap': '_WndInfoTrap' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  TerrainFeaturesTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.TerrainFeaturesTilemap');
});
