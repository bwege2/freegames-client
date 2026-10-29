// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/ColorModelHSV.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

export class ColorModelHSV extends ColorModel {
  _ColorModelHSV(): this {
    this._ColorModel$String$StringArr('hsv', ['Hue', 'Saturation', 'Value', 'Transparency']);
    return this;
  }
  setColor(color: number, space: number[]): void {
    super.setColor(color, space);
    ColorModelHSV.RGBtoHSV(space, space);
    space[3] = Math.fround(1 - space[3]);
  }
  getColor(space: number[]): number {
    space[3] = Math.fround(1 - space[3]);
    ColorModelHSV.HSVtoRGB(space, space);
    return super.getColor(space);
  }
  getMaximum(index: number): number {
    return (index === 0) ? 360 : 100;
  }
  getDefault(index: number): number {
    return (index === 0) ? Math.fround(-1) : 1;
  }
  /**
   * Converts HSV components of a color to a set of RGB components.
   *
   * @param hsv  a float array with length equal to
   *             the number of HSV components
   * @param rgb  a float array with length of at least 3
   *             that contains RGB components of a color
   * @return a float array that contains RGB components
   */
  static HSVtoRGB(hsv: number[], rgb: number[]): number[] {
    if (rgb == null) {
      rgb = $J.newArray(3, 0);
    }
    let hue = hsv[0];
    let saturation = hsv[1];
    let value = hsv[2];
    rgb[0] = value;
    rgb[1] = value;
    rgb[2] = value;
    if (saturation > 0) {
      hue = (hue < 1) ? Math.fround(hue * 6) : 0;
      let integer = $J.d2i(hue);
      let f = Math.fround(hue - Math.fround(integer));
      switch (integer) {
        case 0:
          rgb[1] = Math.fround(rgb[1] * Math.fround(1 - Math.fround(saturation * (Math.fround(1 - f)))));
          rgb[2] = Math.fround(rgb[2] * Math.fround(1 - saturation));
          break;
        case 1:
          rgb[0] = Math.fround(rgb[0] * Math.fround(1 - Math.fround(saturation * f)));
          rgb[2] = Math.fround(rgb[2] * Math.fround(1 - saturation));
          break;
        case 2:
          rgb[0] = Math.fround(rgb[0] * Math.fround(1 - saturation));
          rgb[2] = Math.fround(rgb[2] * Math.fround(1 - Math.fround(saturation * (Math.fround(1 - f)))));
          break;
        case 3:
          rgb[0] = Math.fround(rgb[0] * Math.fround(1 - saturation));
          rgb[1] = Math.fround(rgb[1] * Math.fround(1 - Math.fround(saturation * f)));
          break;
        case 4:
          rgb[0] = Math.fround(rgb[0] * Math.fround(1 - Math.fround(saturation * (Math.fround(1 - f)))));
          rgb[1] = Math.fround(rgb[1] * Math.fround(1 - saturation));
          break;
        case 5:
          rgb[1] = Math.fround(rgb[1] * Math.fround(1 - saturation));
          rgb[2] = Math.fround(rgb[2] * Math.fround(1 - Math.fround(saturation * f)));
          break;
      }
    }
    return rgb;
  }
  /**
   * Converts RGB components of a color to a set of HSV components.
   *
   * @param rgb  a float array with length of at least 3
   *             that contains RGB components of a color
   * @param hsv  a float array with length equal to
   *             the number of HSV components
   * @return a float array that contains HSV components
   */
  static RGBtoHSV(rgb: number[], hsv: number[]): number[] {
    if (hsv == null) {
      hsv = $J.newArray(3, 0);
    }
    let max = ColorModelHSL.max(rgb[0], rgb[1], rgb[2]);
    let min = ColorModelHSL.min(rgb[0], rgb[1], rgb[2]);
    let saturation = Math.fround(max - min);
    if (saturation > 0) {
      saturation = Math.fround(saturation / max);
    }
    hsv[0] = ColorModelHSL.getHue(rgb[0], rgb[1], rgb[2], max, min);
    hsv[1] = saturation;
    hsv[2] = max;
    return hsv;
  }
}

$J.define(ColorModelHSV, 'javax.swing.colorchooser.ColorModelHSV', { kind: 'class', sup: 'javax.swing.colorchooser.ColorModel', ctors: { '': '_ColorModelHSV' } });
$J.module(() => {
  ColorModelHSL = $J.load('javax.swing.colorchooser.ColorModelHSL');
});
