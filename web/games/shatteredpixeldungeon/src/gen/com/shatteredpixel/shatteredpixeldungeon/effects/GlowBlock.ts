// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/GlowBlock.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Game;

export class GlowBlock extends Gizmo {
  target: CharSprite = null;
  _GlowBlock(target: CharSprite): this {
    this._Gizmo();
    this.target = target;
    return this;
  }
  update(): void {
    super.update();
    this.target.tint$float$float$float$float(Math.fround(1.33), Math.fround(1.33), Math.fround(0.83), Math.fround(0.5 + Math.fround(Math.fround(0.1) * Math.fround(Math.cos(3.141592653589793 * 2 * Game.timeTotal)))));
  }
  darken(): void {
    this.target.resetColor();
    this.killAndErase();
  }
  static lighten(sprite: CharSprite): GlowBlock {
    let glowBlock = new GlowBlock()._GlowBlock(sprite);
    if (sprite.parent != null) {
      sprite.parent.add$Gizmo(glowBlock);
    }
    return glowBlock;
  }
}

$J.define(GlowBlock, 'com.shatteredpixel.shatteredpixeldungeon.effects.GlowBlock', { kind: 'class', sup: 'com.watabou.noosa.Gizmo', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite': '_GlowBlock' } });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
