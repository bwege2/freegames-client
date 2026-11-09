// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoCell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Dungeon, Terrain, Messages, PixelScene, DungeonTerrainTilemap, DungeonTilemap, IconTitle, Image;

export class WndInfoCell extends Window {
  static readonly GAP: number = 2;
  static readonly WIDTH: number = 120;
  _WndInfoCell(cell: number): this {
    this._Window$();
    let customTile = null;
    let x = cell % Dungeon.level.width();
    let y = $J.idiv(cell, Dungeon.level.width());
    for (const $it0 = Dungeon.level.customTiles.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if ((x >= i.tileX && x < ((i.tileX + i.tileW) | 0)) && (y >= i.tileY && y < ((i.tileY + i.tileH) | 0))) {
        if (i.image((x - i.tileX) | 0, (y - i.tileY) | 0) != null) {
          customTile = i;
        }
      }
    }
    if (customTile == null) {
      for (const $it1 = Dungeon.level.customTerrain.iterator(); $it1.hasNext(); ) {
        let i = $it1.next();
        if ((x >= i.tileX && x < ((i.tileX + i.tileW) | 0)) && (y >= i.tileY && y < ((i.tileY + i.tileH) | 0))) {
          if (i.image((x - i.tileX) | 0, (y - i.tileY) | 0) != null) {
            customTile = i;
          }
        }
      }
    }
    if (customTile != null) {
      x = (x - customTile.tileX) | 0;
      y = (y - customTile.tileY) | 0;
    }
    let desc = '';
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(WndInfoCell.cellImage(cell));
    titlebar.label$String(WndInfoCell.cellName(cell));
    if (customTile != null) {
      let customDesc = customTile.desc(x, y);
      if (customDesc != null) {
        desc += customDesc;
      } else {
        desc += Dungeon.level.tileDesc(Dungeon.level.map_[cell]);
      }
    } else {
      desc += Dungeon.level.tileDesc(Dungeon.level.map_[cell]);
    }
    titlebar.setRect(0, 0, Math.fround(WndInfoCell.WIDTH), 0);
    this.add$Gizmo(titlebar);
    let info = PixelScene.renderTextBlock$int(6);
    this.add$Gizmo(info);
    for (const $it2 = Dungeon.level.blobs.values().iterator(); $it2.hasNext(); ) {
      let blob = $it2.next();
      if ((Dungeon.level.heroFOV[cell] || blob.alwaysVisible) && blob.volume_ > 0 && blob.cur[cell] > 0 && blob.tileDesc() != null) {
        if (desc.length > 0) {
          desc += '\n\n';
        }
        desc += blob.tileDesc();
      }
    }
    info.text$String(desc.length === 0 ? Messages.get$Object$String$ObjectArr(this, 'nothing', []) : desc);
    info.maxWidth$int(WndInfoCell.WIDTH);
    info.setPos(titlebar.left(), Math.fround(titlebar.bottom() + Math.fround(2 * WndInfoCell.GAP)));
    this.resize(WndInfoCell.WIDTH, ($J.d2i(info.bottom()) + 2) | 0);
    return this;
  }
  static cellImage(cell: number): Image {
    let tile = Dungeon.level.map_[cell];
    if (Dungeon.level.water[cell]) {
      tile = Terrain.WATER;
    } else if (Dungeon.level.pit[cell]) {
      tile = Terrain.CHASM;
    }
    let customImage = null;
    let x = cell % Dungeon.level.width();
    let y = $J.idiv(cell, Dungeon.level.width());
    for (const $it3 = Dungeon.level.customTiles.iterator(); $it3.hasNext(); ) {
      let i = $it3.next();
      if ((x >= i.tileX && x < ((i.tileX + i.tileW) | 0)) && (y >= i.tileY && y < ((i.tileY + i.tileH) | 0))) {
        if (i.image((x - i.tileX) | 0, (y - i.tileY) | 0) != null) {
          customImage = i.image((x - i.tileX) | 0, (y - i.tileY) | 0);
        }
      }
    }
    if (customImage == null) {
      for (const $it4 = Dungeon.level.customTerrain.iterator(); $it4.hasNext(); ) {
        let i = $it4.next();
        if ((x >= i.tileX && x < ((i.tileX + i.tileW) | 0)) && (y >= i.tileY && y < ((i.tileY + i.tileH) | 0))) {
          if (i.image((x - i.tileX) | 0, (y - i.tileY) | 0) != null) {
            customImage = i.image((x - i.tileX) | 0, (y - i.tileY) | 0);
          }
        }
      }
    }
    if (customImage != null) {
      return customImage;
    } else {
      if (tile === Terrain.WATER) {
        let water = new Image()._Image$Object(Dungeon.level.waterTex());
        water.frame$int$int$int$int(0, 0, DungeonTilemap.SIZE, DungeonTilemap.SIZE);
        return water;
      } else {
        return DungeonTerrainTilemap.tile(cell, tile);
      }
    }
  }
  static cellName(cell: number): string {
    let customTile = null;
    let x = cell % Dungeon.level.width();
    let y = $J.idiv(cell, Dungeon.level.width());
    for (const $it5 = Dungeon.level.customTiles.iterator(); $it5.hasNext(); ) {
      let i = $it5.next();
      if ((x >= i.tileX && x < ((i.tileX + i.tileW) | 0)) && (y >= i.tileY && y < ((i.tileY + i.tileH) | 0))) {
        if (i.image((x - i.tileX) | 0, (y - i.tileY) | 0) != null) {
          customTile = i;
        }
      }
    }
    if (customTile == null) {
      for (const $it6 = Dungeon.level.customTerrain.iterator(); $it6.hasNext(); ) {
        let i = $it6.next();
        if ((x >= i.tileX && x < ((i.tileX + i.tileW) | 0)) && (y >= i.tileY && y < ((i.tileY + i.tileH) | 0))) {
          if (i.image((x - i.tileX) | 0, (y - i.tileY) | 0) != null) {
            customTile = i;
          }
        }
      }
    }
    if (customTile != null) {
      x = (x - customTile.tileX) | 0;
      y = (y - customTile.tileY) | 0;
    }
    if (customTile != null && customTile.name(x, y) != null) {
      return customTile.name(x, y);
    } else {
      return Dungeon.level.tileName(Dungeon.level.map_[cell]);
    }
  }
}

$J.define(WndInfoCell, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoCell', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'int': '_WndInfoCell' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  DungeonTerrainTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTerrainTilemap');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  Image = $J.load('com.watabou.noosa.Image');
});
