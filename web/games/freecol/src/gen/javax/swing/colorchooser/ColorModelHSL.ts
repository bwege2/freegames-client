// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/ColorModelHSL.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

export class ColorModelHSL extends ColorModel {
  _ColorModelHSL(): this {
    this._ColorModel$String$StringArr('hsl', ['Hue', 'Saturation', 'Lightness', 'Transparency']);
    return this;
  }
  setColor(color: number, space: number[]): void {
    super.setColor(color, space);
    ColorModelHSL.RGBtoHSL(space, space);
    space[3] = Math.fround(1 - space[3]);
  }
  getColor(space: number[]): number {
    space[3] = Math.fround(1 - space[3]);
    ColorModelHSL.HSLtoRGB(space, space);
    return super.getColor(space);
  }
  getMaximum(index: number): number {
    return (index === 0) ? 360 : 100;
  }
  getDefault(index: number): number {
    return (index === 0) ? Math.fround(-1) : (index === 2) ? 0.5 : 1;
  }
  /**
   * Converts HSL components of a color to a set of RGB components.
   *
   * @param hsl  a float array with length equal to
   *             the number of HSL components
   * @param rgb  a float array with length of at least 3
   *             that contains RGB components of a color
   * @return a float array that contains RGB components
   */
  static HSLtoRGB(hsl: number[], rgb: number[]): number[] {
    if (rgb == null) {
      rgb = $J.newArray(3, 0);
    }
    let hue = hsl[0];
    let saturation = hsl[1];
    let lightness = hsl[2];
    if (saturation > 0) {
      hue = (hue < 1) ? Math.fround(hue * 6) : 0;
      let q = Math.fround(lightness + Math.fround(saturation * ((lightness > 0.5) ? Math.fround(1 - lightness) : lightness)));
      let p = Math.fround(Math.fround(2 * lightness) - q);
      rgb[0] = ColorModelHSL.normalize(q, p, (hue < 4) ? (Math.fround(hue + 2)) : (Math.fround(hue - 4)));
      rgb[1] = ColorModelHSL.normalize(q, p, hue);
      rgb[2] = ColorModelHSL.normalize(q, p, (hue < 2) ? (Math.fround(hue + 4)) : (Math.fround(hue - 2)));
    } else {
      rgb[0] = lightness;
      rgb[1] = lightness;
      rgb[2] = lightness;
    }
    return rgb;
  }
  /**
   * Converts RGB components of a color to a set of HSL components.
   *
   * @param rgb  a float array with length of at least 3
   *             that contains RGB components of a color
   * @param hsl  a float array with length equal to
   *             the number of HSL components
   * @return a float array that contains HSL components
   */
  static RGBtoHSL(rgb: number[], hsl: number[]): number[] {
    if (hsl == null) {
      hsl = $J.newArray(3, 0);
    }
    let max = ColorModelHSL.max(rgb[0], rgb[1], rgb[2]);
    let min = ColorModelHSL.min(rgb[0], rgb[1], rgb[2]);
    let summa = Math.fround(max + min);
    let saturation = Math.fround(max - min);
    if (saturation > 0) {
      saturation = Math.fround(saturation / ((summa > 1) ? Math.fround(2 - summa) : summa));
    }
    hsl[0] = ColorModelHSL.getHue(rgb[0], rgb[1], rgb[2], max, min);
    hsl[1] = saturation;
    hsl[2] = Math.fround(summa / 2);
    return hsl;
  }
  /**
   * Returns the smaller of three color components.
   *
   * @param red    the red component of the color
   * @param green  the green component of the color
   * @param blue   the blue component of the color
   * @return the smaller of {@code red}, {@code green} and {@code blue}
   */
  static min(red: number, green: number, blue: number): number {
    let min = (red < green) ? red : green;
    return (min < blue) ? min : blue;
  }
  /**
   * Returns the larger of three color components.
   *
   * @param red    the red component of the color
   * @param green  the green component of the color
   * @param blue   the blue component of the color
   * @return the larger of {@code red}, {@code green} and {@code blue}
   */
  static max(red: number, green: number, blue: number): number {
    let max = (red > green) ? red : green;
    return (max > blue) ? max : blue;
  }
  /**
   * Calculates the hue component for HSL and HSV color spaces.
   *
   * @param red    the red component of the color
   * @param green  the green component of the color
   * @param blue   the blue component of the color
   * @param max    the larger of {@code red}, {@code green} and {@code blue}
   * @param min    the smaller of {@code red}, {@code green} and {@code blue}
   * @return the hue component
   */
  static getHue(red: number, green: number, blue: number, max: number, min: number): number {
    let hue = Math.fround(max - min);
    if (hue > 0) {
      if (max === red) {
        hue = Math.fround((Math.fround(green - blue)) / hue);
        if (hue < 0) {
          hue = Math.fround(hue + 6);
        }
      } else if (max === green) {
        hue = Math.fround(2 + Math.fround((Math.fround(blue - red)) / hue));
      } else {
        hue = Math.fround(4 + Math.fround((Math.fround(red - green)) / hue));
      }
      hue = Math.fround(hue / 6);
    }
    return hue;
  }
  static normalize(q: number, p: number, color: number): number {
    if (color < 1) {
      return Math.fround(p + Math.fround((Math.fround(q - p)) * color));
    }
    if (color < 3) {
      return q;
    }
    if (color < 4) {
      return Math.fround(p + Math.fround((Math.fround(q - p)) * (Math.fround(4 - color))));
    }
    return p;
  }
}

$J.define(ColorModelHSL, 'javax.swing.colorchooser.ColorModelHSL', { kind: 'class', sup: 'javax.swing.colorchooser.ColorModel', ctors: { '': '_ColorModelHSL' } });
