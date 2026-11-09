// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/Archs.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Assets$Interfaces, TextureCache, Blending, Game, Image, NoosaScriptNoLighting, SkinnedBlock;

export class Archs extends Component {
  static readonly SCROLL_SPEED: number = 20;
  arcsBg: SkinnedBlock = null;
  arcsFg: SkinnedBlock = null;
  darkness: Image = null;
  static offsB: number = 0;
  static offsF: number = 0;
  reversed: boolean = false;
  _Archs(): this {
    this._Component();
    this.reversed = false;
    return this;
  }
  createChildren(): void {
    this.arcsBg = new (Archs$1())().$o(this)._SkinnedBlock(1, 1, Assets$Interfaces.ARCS_BG);
    this.arcsBg.autoAdjust = true;
    this.arcsBg.offsetTo(0, Archs.offsB);
    this.add$Gizmo(this.arcsBg);
    this.arcsFg = new (Archs$2())().$o(this)._SkinnedBlock(1, 1, Assets$Interfaces.ARCS_FG);
    this.arcsFg.autoAdjust = true;
    this.arcsFg.offsetTo(0, Archs.offsF);
    this.add$Gizmo(this.arcsFg);
    this.darkness = new Image()._Image$Object(TextureCache.createGradient([0, 570425344, 1426063360, -1728053248, -301989888]));
    this.darkness.angle = 90;
    this.add$Gizmo(this.darkness);
  }
  layout(): void {
    this.arcsBg.size(this.width_, this.height_);
    this.arcsBg.offset(Math.fround($J.idiv(this.arcsBg.texture_.width_, 4) - Math.fround((Math.fround(this.width_ % this.arcsBg.texture_.width_)) / 2)), 0);
    this.arcsFg.size(this.width_, this.height_);
    this.arcsFg.offset(Math.fround($J.idiv(this.arcsFg.texture_.width_, 4) - Math.fround((Math.fround(this.width_ % this.arcsFg.texture_.width_)) / 2)), 0);
    this.darkness.x = this.width_;
    this.darkness.scale_.x = Math.fround(this.height_ / 5);
    this.darkness.scale_.y = this.width_;
  }
  update(): void {
    super.update();
    let shift = Math.fround(Game.elapsed * Archs.SCROLL_SPEED);
    if (this.reversed) {
      shift = Math.fround(-shift);
    }
    this.arcsBg.offset(0, shift);
    this.arcsFg.offset(0, Math.fround(shift * 2));
    Archs.offsB = this.arcsBg.offsetY();
    Archs.offsF = this.arcsFg.offsetY();
  }
  static $clinit() {
    Archs.offsB = 0;
    Archs.offsF = 0;
  }
}

let $Archs$1: any = null;
/** An anonymous class (Archs.java:49). */
function Archs$1(): any {
  return $Archs$1 ??= $J.local(class extends SkinnedBlock {
    script(): NoosaScript {
      return NoosaScriptNoLighting.get();
    }
    draw(): void {
      Blending.disable();
      super.draw();
      Blending.enable();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Archs$1', []);
}

let $Archs$2: any = null;
/** An anonymous class (Archs.java:67). */
function Archs$2(): any {
  return $Archs$2 ??= $J.local(class extends SkinnedBlock {
    script(): NoosaScript {
      return NoosaScriptNoLighting.get();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Archs$2', []);
}

$J.define(Archs, 'com.shatteredpixel.shatteredpixeldungeon.ui.Archs', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_Archs' }, clinit: true, lazy: ['offsB', 'offsF'] });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Blending = $J.load('com.watabou.glwrap.Blending');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  NoosaScriptNoLighting = $J.load('com.watabou.noosa.NoosaScriptNoLighting');
  SkinnedBlock = $J.load('com.watabou.noosa.SkinnedBlock');
});
