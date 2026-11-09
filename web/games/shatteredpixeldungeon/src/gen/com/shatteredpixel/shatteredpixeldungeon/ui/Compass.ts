// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/Compass.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Image } from '../../../watabou/noosa/Image.ts';

let Dungeon, DungeonTilemap, Icons, Camera, PointF;

export class Compass extends Image {
  static readonly RAD_2_G: number = Math.fround(57.295784);
  static readonly RADIUS: number = 12;
  cell_: number = 0;
  cellCenter: PointF = null;
  lastScroll: PointF = null;
  _Compass(cell: number): this {
    this._Image$();
    this.lastScroll = new PointF()._PointF$();
    this.copy(Icons.COMPASS.get());
    this.origin.set$float$float(Math.fround(this.width_ / 2), Compass.RADIUS);
    this.cell_ = cell;
    this.cellCenter = DungeonTilemap.tileCenterToWorld(cell);
    this.visible_ = false;
    return this;
  }
  update(): void {
    super.update();
    if (this.cell_ < 0 || this.cell_ >= Dungeon.level.length()) {
      this.visible_ = false;
      return;
    }
    this.visible_ = Dungeon.level.visited[this.cell_] || Dungeon.level.mapped[this.cell_];
    if (this.visible_) {
      let scroll = Camera.main.scroll_;
      if (!scroll.equals(this.lastScroll)) {
        this.lastScroll.set$PointF(scroll);
        let center = Camera.main.center().offset$PointF(scroll);
        this.angle = Math.fround(Math.fround(Math.atan2(Math.fround(this.cellCenter.x - center.x), Math.fround(center.y - this.cellCenter.y))) * Compass.RAD_2_G);
      }
    }
  }
}

$J.define(Compass, 'com.shatteredpixel.shatteredpixeldungeon.ui.Compass', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'int': '_Compass' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  Camera = $J.load('com.watabou.noosa.Camera');
  PointF = $J.load('com.watabou.utils.PointF');
});
