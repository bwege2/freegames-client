// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/IceBlock.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Gizmo } from '../../../watabou/noosa/Gizmo.ts';

let Assets$Sounds, Splash, Game, Sample;

export class IceBlock extends Gizmo {
  phase: number = 0;
  target: CharSprite = null;
  _IceBlock(target: CharSprite): this {
    this._Gizmo();
    this.target = target;
    this.phase = 0;
    return this;
  }
  update(): void {
    super.update();
    if ((this.phase = Math.fround(this.phase + Math.fround(Game.elapsed * 2))) < Math.fround(1)) {
      this.target.tint$float$float$float$float(Math.fround(0.83), Math.fround(1.17), Math.fround(1.33), Math.fround(this.phase * Math.fround(0.6)));
    } else {
      this.target.tint$float$float$float$float(Math.fround(0.83), Math.fround(1.17), Math.fround(1.33), Math.fround(0.6));
    }
  }
  melt(): void {
    this.target.resetColor();
    this.killAndErase();
    if (this.visible_) {
      Splash.at$PointF$int$int(this.target.center$(), -5056769, 5);
      Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
    }
  }
  static freeze(sprite: CharSprite): IceBlock {
    let iceBlock = new IceBlock()._IceBlock(sprite);
    if (sprite.parent != null) {
      sprite.parent.add$Gizmo(iceBlock);
    }
    return iceBlock;
  }
}

$J.define(IceBlock, 'com.shatteredpixel.shatteredpixeldungeon.effects.IceBlock', { kind: 'class', sup: 'com.watabou.noosa.Gizmo', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite': '_IceBlock' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
