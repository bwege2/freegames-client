// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Lightning.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Arrays } from '../../../../../jre/index.ts';
import { Group } from '../../../watabou/noosa/Group.ts';

let Effects, Effects$Type, DungeonTilemap, Blending, Game, Image, Random;

export class Lightning extends Group {
  static readonly DURATION: number = Math.fround(0.3);
  life: number = 0;
  arcs: List<Lightning$Arc> = null;
  callback: Callback = null;
  static readonly A: number = 57.29577951308232;
  _Lightning$int$int$Callback(from: number, to: number, callback: Callback): this {
    this._Lightning$List$Callback(Arrays.asList(new Lightning$Arc()._Lightning$Arc$int$int(from, to)), callback);
    return this;
  }
  _Lightning$PointF$int$Callback(from: PointF, to: number, callback: Callback): this {
    this._Lightning$List$Callback(Arrays.asList(new Lightning$Arc()._Lightning$Arc$PointF$int(from, to)), callback);
    return this;
  }
  _Lightning$int$PointF$Callback(from: number, to: PointF, callback: Callback): this {
    this._Lightning$List$Callback(Arrays.asList(new Lightning$Arc()._Lightning$Arc$int$PointF(from, to)), callback);
    return this;
  }
  _Lightning$PointF$PointF$Callback(from: PointF, to: PointF, callback: Callback): this {
    this._Lightning$List$Callback(Arrays.asList(new Lightning$Arc()._Lightning$Arc$PointF$PointF(from, to)), callback);
    return this;
  }
  _Lightning$List$Callback(arcs: List<Lightning$Arc>, callback: Callback): this {
    this._Group();
    this.arcs = arcs;
    for (const $it0 = this.arcs.iterator(); $it0.hasNext(); ) {
      let arc = $it0.next();
      this.add$Gizmo(arc);
    }
    this.callback = callback;
    this.life = Lightning.DURATION;
    return this;
  }
  update(): void {
    if ((this.life = Math.fround(this.life - Game.elapsed)) < Math.fround(0)) {
      this.killAndErase();
      if (this.callback != null) {
        this.callback.call();
      }
    } else {
      let alpha = Math.fround(this.life / Lightning.DURATION);
      for (const $it1 = this.arcs.iterator(); $it1.hasNext(); ) {
        let arc = $it1.next();
        arc.alpha(alpha);
      }
      super.update();
    }
  }
  draw(): void {
    Blending.setLightMode();
    super.draw();
    Blending.setNormalMode();
  }
}

export class Lightning$Arc extends Group {
  arc1: Image = null;
  arc2: Image = null;
  start_: PointF = null;
  end_: PointF = null;
  _Lightning$Arc$int$int(from: number, to: number): this {
    this._Lightning$Arc$PointF$PointF(DungeonTilemap.tileCenterToWorld(from), DungeonTilemap.tileCenterToWorld(to));
    return this;
  }
  _Lightning$Arc$PointF$int(from: PointF, to: number): this {
    this._Lightning$Arc$PointF$PointF(from, DungeonTilemap.tileCenterToWorld(to));
    return this;
  }
  _Lightning$Arc$int$PointF(from: number, to: PointF): this {
    this._Lightning$Arc$PointF$PointF(DungeonTilemap.tileCenterToWorld(from), to);
    return this;
  }
  _Lightning$Arc$PointF$PointF(from: PointF, to: PointF): this {
    this._Group();
    this.start_ = from;
    this.end_ = to;
    this.arc1 = new Image()._Image$Image(Effects.get(Effects$Type.LIGHTNING));
    this.arc1.x = Math.fround(this.start_.x - this.arc1.origin.x);
    this.arc1.y = Math.fround(this.start_.y - this.arc1.origin.y);
    this.arc1.origin.set$float$float(0, Math.fround(this.arc1.height() / 2));
    this.add$Gizmo(this.arc1);
    this.arc2 = new Image()._Image$Image(Effects.get(Effects$Type.LIGHTNING));
    this.arc2.origin.set$float$float(0, Math.fround(this.arc2.height() / 2));
    this.add$Gizmo(this.arc2);
    this.update();
    return this;
  }
  alpha(alpha: number): void {
    this.arc1.am = this.arc2.am = alpha;
  }
  update(): void {
    let x2 = Math.fround(Math.fround((Math.fround(this.start_.x + this.end_.x)) / 2) + Random.Float$float$float(-4, Math.fround(+4)));
    let y2 = Math.fround(Math.fround((Math.fround(this.start_.y + this.end_.y)) / 2) + Random.Float$float$float(-4, Math.fround(+4)));
    let dx = Math.fround(x2 - this.start_.x);
    let dy = Math.fround(y2 - this.start_.y);
    this.arc1.angle = Math.fround((Math.atan2(dy, dx) * Lightning.A));
    this.arc1.scale_.x = Math.fround(Math.fround(Math.sqrt(Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy)))) / this.arc1.width_);
    dx = Math.fround(this.end_.x - x2);
    dy = Math.fround(this.end_.y - y2);
    this.arc2.angle = Math.fround((Math.atan2(dy, dx) * Lightning.A));
    this.arc2.scale_.x = Math.fround(Math.fround(Math.sqrt(Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy)))) / this.arc2.width_);
    this.arc2.x = Math.fround(x2 - this.arc2.origin.x);
    this.arc2.y = Math.fround(y2 - this.arc2.origin.x);
  }
}

$J.define(Lightning, 'com.shatteredpixel.shatteredpixeldungeon.effects.Lightning', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { 'java.util.List,com.watabou.utils.Callback': '_Lightning$List$Callback', 'com.watabou.utils.PointF,com.watabou.utils.PointF,com.watabou.utils.Callback': '_Lightning$PointF$PointF$Callback', 'int,com.watabou.utils.PointF,com.watabou.utils.Callback': '_Lightning$int$PointF$Callback', 'com.watabou.utils.PointF,int,com.watabou.utils.Callback': '_Lightning$PointF$int$Callback', 'int,int,com.watabou.utils.Callback': '_Lightning$int$int$Callback' } });
$J.define(Lightning$Arc, 'com.shatteredpixel.shatteredpixeldungeon.effects.Lightning$Arc', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { 'com.watabou.utils.PointF,com.watabou.utils.PointF': '_Lightning$Arc$PointF$PointF', 'int,com.watabou.utils.PointF': '_Lightning$Arc$int$PointF', 'com.watabou.utils.PointF,int': '_Lightning$Arc$PointF$int', 'int,int': '_Lightning$Arc$int$int' } });
$J.module(() => {
  Effects = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects');
  Effects$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Blending = $J.load('com.watabou.glwrap.Blending');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Random = $J.load('com.watabou.utils.Random');
});
