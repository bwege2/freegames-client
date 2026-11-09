// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/TargetedCell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Actor, DungeonTilemap, Icons, Game, SparseArray;

export class TargetedCell extends Image {
  pos: number = 0;
  time: number = 0;
  alpha_: number = 0;
  static cells: SparseArray<TargetedCell> = null;
  static readonly POS: string = 'pos';
  static readonly COLOR: string = 'color';
  static readonly TIME: string = 'time';
  _TargetedCell(): this {
    this._Image$();
    return this;
  }
  reset(pos: number, time: number): void {
    this.copy(Icons.get$Icons(Icons.TARGET));
    this.origin.set$float(Math.fround(this.width_ / 2));
    this.camera_ = null;
    this.pos = pos;
    this.point$PointF(DungeonTilemap.tileToWorld(pos));
    this.hardlight$int(16711680);
    this.alpha_ = 1;
    this.time = time;
    this.alpha$float(1);
    this.scale_.set$float(1);
    {
      TargetedCell.cells.put(pos, this);
    }
  }
  update(): void {
    this.alpha_ = Math.fround(this.alpha_ - Game.elapsed);
    if (this.time >= Actor.now()) {
      this.alpha_ = Math.max(this.alpha_, Math.fround(0.6));
    }
    if (this.alpha_ > Math.fround(0)) {
      this.alpha$float(this.alpha_);
      this.scale_.set$float(Math.fround($J.pow(this.alpha_, Math.fround(0.33))));
    } else {
      this.time = 0;
      {
        TargetedCell.cells.remove(this.pos);
      }
      this.killAndErase();
    }
  }
  static fixTime(min: number): void {
    {
      for (const $it0 = TargetedCell.cells.valueList().iterator(); $it0.hasNext(); ) {
        let c = $it0.next();
        c.time = Math.fround(c.time - min);
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int(TargetedCell.POS, this.pos);
    bundle.put$String$float(TargetedCell.TIME, this.time);
  }
  restoreFromBundle(bundle: Bundle): void {
    this.pos = bundle.getInt(TargetedCell.POS);
    this.time = Math.fround(bundle.getInt(TargetedCell.TIME));
  }
  static $clinit() {
    TargetedCell.cells = new SparseArray()._SparseArray();
  }
}

$J.define(TargetedCell, 'com.shatteredpixel.shatteredpixeldungeon.effects.TargetedCell', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'com.watabou.noosa.Image', ctors: { '': '_TargetedCell' }, clinit: true, lazy: ['cells'] });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  Game = $J.load('com.watabou.noosa.Game');
  SparseArray = $J.load('com.watabou.utils.SparseArray');
});
