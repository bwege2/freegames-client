// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/DarkBlock.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class DarkBlock extends Gizmo {
  target: CharSprite = null;
  _DarkBlock(target: CharSprite): this {
    this._Gizmo();
    this.target = target;
    return this;
  }
  update(): void {
    super.update();
    this.target.brightness(Math.fround(0.4));
  }
  lighten(): void {
    this.target.resetColor();
    this.killAndErase();
  }
  static darken(sprite: CharSprite): DarkBlock {
    let darkBlock = new DarkBlock()._DarkBlock(sprite);
    if (sprite.parent != null) {
      sprite.parent.add$Gizmo(darkBlock);
    }
    return darkBlock;
  }
}

$J.define(DarkBlock, 'com.shatteredpixel.shatteredpixeldungeon.effects.DarkBlock', { kind: 'class', sup: 'com.watabou.noosa.Gizmo', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite': '_DarkBlock' } });
