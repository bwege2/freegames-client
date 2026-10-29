// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/ColorModelCMYK.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2008, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J } from '../../../../jre/index.ts';
import { ColorModel } from './ColorModel.ts';

let ColorModelHSL;

export class ColorModelCMYK extends ColorModel {
  _ColorModelCMYK(): this {
    this._ColorModel$String$StringArr('cmyk', ['Cyan', 'Magenta', 'Yellow', 'Black', 'Alpha']);
    return this;
  }
  setColor(color: number, space: number[]): void {
    super.setColor(color, space);
    space[4] = space[3];
    ColorModelCMYK.RGBtoCMYK(space, space);
  }
  getColor(space: number[]): number {
    ColorModelCMYK.CMYKtoRGB(space, space);
    space[3] = space[4];
    return super.getColor(space);
  }
  /**
   * Converts CMYK components of a color to a set of RGB components.
   *
   * @param cmyk  a float array with length equal to
   *              the number of CMYK components
   * @param rgb   a float array with length of at least 3
   *              that contains RGB components of a color
   * @return a float array that contains RGB components
   */
  static CMYKtoRGB(cmyk: number[], rgb: number[]): number[] {
    if (rgb == null) {
      rgb = $J.newArray(3, 0);
    }
    rgb[0] = Math.fround(Math.fround(Math.fround(1 + Math.fround(cmyk[0] * cmyk[3])) - cmyk[3]) - cmyk[0]);
    rgb[1] = Math.fround(Math.fround(Math.fround(1 + Math.fround(cmyk[1] * cmyk[3])) - cmyk[3]) - cmyk[1]);
    rgb[2] = Math.fround(Math.fround(Math.fround(1 + Math.fround(cmyk[2] * cmyk[3])) - cmyk[3]) - cmyk[2]);
    return rgb;
  }
  /**
   * Converts RGB components of a color to a set of CMYK components.
   *
   * @param rgb   a float array with length of at least 3
   *              that contains RGB components of a color
   * @param cmyk  a float array with length equal to
   *              the number of CMYK components
   * @return a float array that contains CMYK components
   */
  static RGBtoCMYK(rgb: number[], cmyk: number[]): number[] {
    if (cmyk == null) {
      cmyk = $J.newArray(4, 0);
    }
    let max = ColorModelHSL.max(rgb[0], rgb[1], rgb[2]);
    if (max > 0) {
      cmyk[0] = Math.fround(1 - Math.fround(rgb[0] / max));
      cmyk[1] = Math.fround(1 - Math.fround(rgb[1] / max));
      cmyk[2] = Math.fround(1 - Math.fround(rgb[2] / max));
    } else {
      cmyk[0] = 0;
      cmyk[1] = 0;
      cmyk[2] = 0;
    }
    cmyk[3] = Math.fround(1 - max);
    return cmyk;
  }
}

$J.define(ColorModelCMYK, 'javax.swing.colorchooser.ColorModelCMYK', { kind: 'class', sup: 'javax.swing.colorchooser.ColorModel', ctors: { '': '_ColorModelCMYK' } });
$J.module(() => {
  ColorModelHSL = $J.load('javax.swing.colorchooser.ColorModelHSL');
});
