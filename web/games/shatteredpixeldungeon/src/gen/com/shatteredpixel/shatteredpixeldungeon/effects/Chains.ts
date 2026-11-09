// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Chains.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Group } from '../../../watabou/noosa/Group.ts';

let Effects, DungeonTilemap, Game, Image, PointF;

export class Chains extends Group {
  static readonly A: number = 57.29577951308232;
  spent: number = 0;
  duration: number = 0;
  callback: Callback = null;
  chains: Image[] = null;
  numChains: number = 0;
  distance_: number = 0;
  rotation: number = 0;
  from: PointF = null;
  to: PointF = null;
  $init_Chains() {
    this.spent = 0;
    this.rotation = 0;
  }
  _Chains$int$int$Type$Callback(from: number, to: number, type$: Effects$Type, callback: Callback): this {
    this._Chains$PointF$PointF$Type$Callback(DungeonTilemap.tileCenterToWorld(from), DungeonTilemap.tileCenterToWorld(to), type$, callback);
    return this;
  }
  _Chains$PointF$PointF$Type$Callback(from: PointF, to: PointF, type$: Effects$Type, callback: Callback): this {
    this._Group();
    this.$init_Chains();
    this.callback = callback;
    this.from = from;
    this.to = to;
    let dx = Math.fround(to.x - from.x);
    let dy = Math.fround(to.y - from.y);
    this.distance_ = Math.fround(Math.hypot(dx, dy));
    this.duration = Math.fround(Math.fround(this.distance_ / 320) + Math.fround(0.2));
    this.rotation = Math.fround(Math.fround((Math.atan2(dy, dx) * Chains.A)) + 90);
    this.numChains = ($J.roundf(Math.fround(this.distance_ / 6)) + 1) | 0;
    this.chains = $J.newArray(this.numChains, null);
    for (let i = 0; i < this.chains.length; i++) {
      this.chains[i] = new Image()._Image$Image(Effects.get(type$));
      this.chains[i].angle = this.rotation;
      this.chains[i].origin.set$float$float(Math.fround(this.chains[i].width() / 2), this.chains[i].height());
      this.add$Gizmo(this.chains[i]);
    }
    return this;
  }
  update(): void {
    if ((this.spent = Math.fround(this.spent + Game.elapsed)) > this.duration) {
      this.killAndErase();
      if (this.callback != null) {
        this.callback.call();
      }
    } else {
      let dx = Math.fround(this.to.x - this.from.x);
      let dy = Math.fround(this.to.y - this.from.y);
      for (let i = 0; i < this.chains.length; i++) {
        this.chains[i].center$PointF(new PointF()._PointF$float$float(Math.fround(this.from.x + (Math.fround((Math.fround(dx * (Math.fround(i / Math.fround(this.chains.length))))) * (Math.fround(this.spent / this.duration))))), Math.fround(this.from.y + (Math.fround((Math.fround(dy * (Math.fround(i / Math.fround(this.chains.length))))) * (Math.fround(this.spent / this.duration)))))));
      }
    }
  }
}

$J.define(Chains, 'com.shatteredpixel.shatteredpixeldungeon.effects.Chains', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { 'com.watabou.utils.PointF,com.watabou.utils.PointF,com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type,com.watabou.utils.Callback': '_Chains$PointF$PointF$Type$Callback', 'int,int,com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type,com.watabou.utils.Callback': '_Chains$int$int$Type$Callback' } });
$J.module(() => {
  Effects = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  PointF = $J.load('com.watabou.utils.PointF');
});
