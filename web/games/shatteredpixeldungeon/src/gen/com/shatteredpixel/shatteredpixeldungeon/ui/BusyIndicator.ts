// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/BusyIndicator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Icons;

export class BusyIndicator extends Image {
  _BusyIndicator(): this {
    this._Image$();
    this.copy(Icons.BUSY.get());
    this.origin.set$float$float(Math.fround(this.width_ / 2), Math.fround(this.height_ / 2));
    this.angularSpeed = 720;
    return this;
  }
  update(): void {
    super.update();
    this.visible_ = Dungeon.hero.isAlive() && !Dungeon.hero.ready_;
  }
}

$J.define(BusyIndicator, 'com.shatteredpixel.shatteredpixeldungeon.ui.BusyIndicator', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { '': '_BusyIndicator' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
});
