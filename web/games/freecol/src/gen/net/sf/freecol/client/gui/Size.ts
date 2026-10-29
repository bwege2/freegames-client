// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/Size.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, JEnum } from '../../../../../../jre/index.ts';

/**
 * Standard sizes.
 */
export class Size extends JEnum {
  /**
   * The scaling value to use for images.
   */
  image: number = 0;
  /**
   * The value to use for font point sizes.
   */
  font: number = 0;
  static TINY: Size = null;
  static SMALLER: Size = null;
  static SMALL: Size = null;
  static NORMAL: Size = null;
  static LARGE: Size = null;
  static BIG: Size = null;
  static HUGE: Size = null;
  static MAX: Size = null;
  static $VALUES: Size[] = null;
  _Size($name: string, $ordinal: number, image: number, font: number): this {
    this._JEnum($name, $ordinal);
    this.image = image;
    this.font = font;
    return this;
  }
  forImage(): number {
    return this.image;
  }
  forFont(): number {
    return this.font;
  }
  scaled(f: number): Size {
    let val = (this.ordinal() + $J.roundf(Math.fround(4 * (Math.fround(f - 1))))) | 0;
    return (val < 0 || val >= Size.MAX.ordinal()) ? null : Size.values()[val];
  }
  up(): Size {
    return (this === Size.MAX) ? Size.MAX : Size.values()[(this.ordinal() + 1) | 0];
  }
  down(): Size {
    return (this === Size.TINY) ? Size.TINY : Size.values()[(this.ordinal() - 1) | 0];
  }
  static values(): Size[] { return Size.$VALUES.slice(); }
  static valueOf(name: string): Size { return $J.enumValueOf(Size, name); }
  static $clinit() {
    Size.TINY = new Size()._Size('TINY', 0, 0.25, 12);
    Size.SMALLER = new Size()._Size('SMALLER', 1, 0.5, 14);
    Size.SMALL = new Size()._Size('SMALL', 2, 0.75, 16);
    Size.NORMAL = new Size()._Size('NORMAL', 3, 1, 18);
    Size.LARGE = new Size()._Size('LARGE', 4, 1.25, 20);
    Size.BIG = new Size()._Size('BIG', 5, 1.5, 24);
    Size.HUGE = new Size()._Size('HUGE', 6, 1.75, 32);
    Size.MAX = new Size()._Size('MAX', 7, 2, 40);
    Size.$VALUES = [Size.TINY, Size.SMALLER, Size.SMALL, Size.NORMAL, Size.LARGE, Size.BIG, Size.HUGE, Size.MAX];
  }
}

$J.define(Size, 'net.sf.freecol.client.gui.Size', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'float,float': '_Size' }, clinit: true, lazy: ['$VALUES', 'TINY', 'SMALLER', 'SMALL', 'NORMAL', 'LARGE', 'BIG', 'HUGE', 'MAX'] });
