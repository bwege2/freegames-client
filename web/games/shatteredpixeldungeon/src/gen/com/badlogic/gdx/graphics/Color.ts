// @ts-nocheck
// Color.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*******************************************************************************
 * Copyright 2011 See AUTHORS file.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
import { $J, JObject, JString } from '../../../../../jre/index.ts';

let NumberUtils;

/**
 * A color class, holding the r, g, b and alpha component as floats in the range [0,1]. All methods perform clamping on the
 * internal values after execution.
 *
 * @author mzechner
 */
export class Color extends JObject {
  static WHITE: Color = null;
  static LIGHT_GRAY: Color = null;
  static GRAY: Color = null;
  static DARK_GRAY: Color = null;
  static BLACK: Color = null;
  /**
   * Convenience for frequently used <code>WHITE.toFloatBits()</code>
   */
  static WHITE_FLOAT_BITS: number = 0;
  static CLEAR: Color = null;
  static CLEAR_WHITE: Color = null;
  static BLUE: Color = null;
  static NAVY: Color = null;
  static ROYAL: Color = null;
  static SLATE: Color = null;
  static SKY: Color = null;
  static CYAN: Color = null;
  static TEAL: Color = null;
  static GREEN: Color = null;
  static CHARTREUSE: Color = null;
  static LIME: Color = null;
  static FOREST: Color = null;
  static OLIVE: Color = null;
  static YELLOW: Color = null;
  static GOLD: Color = null;
  static GOLDENROD: Color = null;
  static ORANGE: Color = null;
  static BROWN: Color = null;
  static TAN: Color = null;
  static FIREBRICK: Color = null;
  static RED: Color = null;
  static SCARLET: Color = null;
  static CORAL: Color = null;
  static SALMON: Color = null;
  static PINK: Color = null;
  static MAGENTA: Color = null;
  static PURPLE: Color = null;
  static VIOLET: Color = null;
  static MAROON: Color = null;
  /**
   * the red, green, blue and alpha components
   */
  r: number = 0;
  /**
   * the red, green, blue and alpha components
   */
  g: number = 0;
  /**
   * the red, green, blue and alpha components
   */
  b: number = 0;
  /**
   * the red, green, blue and alpha components
   */
  a: number = 0;
  /**
   * Constructs a new Color with all components set to 0.
   */
  _Color$(): this {
    return this;
  }
  /**
   * @see #rgba8888ToColor(Color, int)
   */
  _Color$int(rgba8888: number): this {
    Color.rgba8888ToColor(this, rgba8888);
    return this;
  }
  /**
   * Constructor, sets the components of the color
   *
   * @param r the red component
   * @param g the green component
   * @param b the blue component
   * @param a the alpha component
   */
  _Color$float$float$float$float(r: number, g: number, b: number, a: number): this {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.clamp();
    return this;
  }
  /**
   * Sets this color to the given color.
   *
   * @param color the Color
   * @return this color.
   */
  set$Color(color: Color): Color {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
    return this;
  }
  /**
   * Clamps this Color's components to a valid range [0 - 1]
   * @return this Color for chaining
   */
  clamp(): Color {
    if (this.r < Math.fround(0)) {
      this.r = 0;
    } else if (this.r > Math.fround(1)) {
      this.r = 1;
    }
    if (this.g < Math.fround(0)) {
      this.g = 0;
    } else if (this.g > Math.fround(1)) {
      this.g = 1;
    }
    if (this.b < Math.fround(0)) {
      this.b = 0;
    } else if (this.b > Math.fround(1)) {
      this.b = 1;
    }
    if (this.a < Math.fround(0)) {
      this.a = 0;
    } else if (this.a > Math.fround(1)) {
      this.a = 1;
    }
    return this;
  }
  /**
   * Sets this color's component values through an integer representation.
   *
   * @return this Color for chaining
   * @see #rgba8888ToColor(Color, int)
   */
  set$int(rgba: number): Color {
    Color.rgba8888ToColor(this, rgba);
    return this;
  }
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o == null || $J.getClass(this) !== $J.getClass(o)) {
      return false;
    }
    let color = o;
    return this.toIntBits() === color.toIntBits();
  }
  hashCode(): number {
    let result = (this.r !== +0 ? NumberUtils.floatToIntBits(this.r) : 0);
    result = (Math.imul(31, result) + (this.g !== +0 ? NumberUtils.floatToIntBits(this.g) : 0)) | 0;
    result = (Math.imul(31, result) + (this.b !== +0 ? NumberUtils.floatToIntBits(this.b) : 0)) | 0;
    result = (Math.imul(31, result) + (this.a !== +0 ? NumberUtils.floatToIntBits(this.a) : 0)) | 0;
    return result;
  }
  /**
   * Packs the color components into a 32-bit integer with the format ABGR and then converts it to a float. Alpha is compressed
   * from 0-255 to use only even numbers between 0-254 to avoid using float bits in the NaN range (see
   * {@link NumberUtils#intToFloatColor(int)}). Converting a color to a float and back can be lossy for alpha.
   * @return the packed color as a 32-bit float
   */
  toFloatBits(): number {
    let color = ($J.d2i((Math.fround(255 * this.a))) << 24) | ($J.d2i((Math.fround(255 * this.b))) << 16) | ($J.d2i((Math.fround(255 * this.g))) << 8) | ($J.d2i((Math.fround(255 * this.r))));
    return NumberUtils.intToFloatColor(color);
  }
  /**
   * Packs the color components into a 32-bit integer with the format ABGR.
   * @return the packed color as a 32-bit int.
   */
  toIntBits(): number {
    return ($J.d2i((Math.fround(255 * this.a))) << 24) | ($J.d2i((Math.fround(255 * this.b))) << 16) | ($J.d2i((Math.fround(255 * this.g))) << 8) | ($J.d2i((Math.fround(255 * this.r))));
  }
  /**
   * Returns the color encoded as hex string with the format RRGGBBAA.
   */
  toString(): string {
    let value = $J.Integer_toHexString(($J.d2i((Math.fround(255 * this.r))) << 24) | ($J.d2i((Math.fround(255 * this.g))) << 16) | ($J.d2i((Math.fround(255 * this.b))) << 8) | ($J.d2i((Math.fround(255 * this.a)))));
    while (value.length < 8) {
      value = '0' + value;
    }
    return value;
  }
  static rgba8888$Color(color: Color): number {
    return ($J.d2i((Math.fround(color.r * 255))) << 24) | ($J.d2i((Math.fround(color.g * 255))) << 16) | ($J.d2i((Math.fround(color.b * 255))) << 8) | $J.d2i((Math.fround(color.a * 255)));
  }
  /**
   * Sets the Color components using the specified integer value in the format RGBA8888. This is inverse to the rgba8888(r, g,
   * b, a) method.
   *
   * @param color The Color to be modified.
   * @param value An integer color value in RGBA8888 format.
   */
  static rgba8888ToColor(color: Color, value: number): void {
    color.r = Math.fround(((value & -16777216) >>> 24) / 255);
    color.g = Math.fround(((value & 16711680) >>> 16) / 255);
    color.b = Math.fround(((value & 65280) >>> 8) / 255);
    color.a = Math.fround(((value & 255)) / 255);
  }
  static $clinit() {
    Color.WHITE = new Color()._Color$float$float$float$float(1, 1, 1, 1);
    Color.LIGHT_GRAY = new Color()._Color$int(-1077952513);
    Color.GRAY = new Color()._Color$int(2139062271);
    Color.DARK_GRAY = new Color()._Color$int(1061109759);
    Color.BLACK = new Color()._Color$float$float$float$float(0, 0, 0, 1);
    Color.WHITE_FLOAT_BITS = Color.WHITE.toFloatBits();
    Color.CLEAR = new Color()._Color$float$float$float$float(0, 0, 0, 0);
    Color.CLEAR_WHITE = new Color()._Color$float$float$float$float(1, 1, 1, 0);
    Color.BLUE = new Color()._Color$float$float$float$float(0, 0, 1, 1);
    Color.NAVY = new Color()._Color$float$float$float$float(0, 0, 0.5, 1);
    Color.ROYAL = new Color()._Color$int(1097458175);
    Color.SLATE = new Color()._Color$int(1887473919);
    Color.SKY = new Color()._Color$int(-2016482305);
    Color.CYAN = new Color()._Color$float$float$float$float(0, 1, 1, 1);
    Color.TEAL = new Color()._Color$float$float$float$float(0, 0.5, 0.5, 1);
    Color.GREEN = new Color()._Color$int(16711935);
    Color.CHARTREUSE = new Color()._Color$int(2147418367);
    Color.LIME = new Color()._Color$int(852308735);
    Color.FOREST = new Color()._Color$int(579543807);
    Color.OLIVE = new Color()._Color$int(1804477439);
    Color.YELLOW = new Color()._Color$int(-65281);
    Color.GOLD = new Color()._Color$int(-2686721);
    Color.GOLDENROD = new Color()._Color$int(-626712321);
    Color.ORANGE = new Color()._Color$int(-5963521);
    Color.BROWN = new Color()._Color$int(-1958407169);
    Color.TAN = new Color()._Color$int(-759919361);
    Color.FIREBRICK = new Color()._Color$int(-1306385665);
    Color.RED = new Color()._Color$int(-16776961);
    Color.SCARLET = new Color()._Color$int(-13361921);
    Color.CORAL = new Color()._Color$int(-8433409);
    Color.SALMON = new Color()._Color$int(-92245249);
    Color.PINK = new Color()._Color$int(-9849601);
    Color.MAGENTA = new Color()._Color$float$float$float$float(1, 0, 1, 1);
    Color.PURPLE = new Color()._Color$int(-1608453889);
    Color.VIOLET = new Color()._Color$int(-293409025);
    Color.MAROON = new Color()._Color$int(-1339006721);
  }
}

$J.define(Color, 'com.badlogic.gdx.graphics.Color', { kind: 'class', sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.graphics.Color': '_Color$Color', 'float,float,float,float': '_Color$float$float$float$float', 'int': '_Color$int', '': '_Color$' }, meths: { 'fromHsv(float[])': 'fromHsv$floatArr', 'fromHsv(float,float,float)': 'fromHsv$float$float$float', 'abgr8888ToColor(com.badlogic.gdx.graphics.Color,float)': 'abgr8888ToColor$Color$float', 'abgr8888ToColor(com.badlogic.gdx.graphics.Color,int)': 'abgr8888ToColor$Color$int', 'argb8888(com.badlogic.gdx.graphics.Color)': 'argb8888$Color', 'rgba8888(com.badlogic.gdx.graphics.Color)': 'rgba8888$Color', 'rgb888(com.badlogic.gdx.graphics.Color)': 'rgb888$Color', 'rgba4444(com.badlogic.gdx.graphics.Color)': 'rgba4444$Color', 'rgb565(com.badlogic.gdx.graphics.Color)': 'rgb565$Color', 'argb8888(float,float,float,float)': 'argb8888$float$float$float$float', 'rgba8888(float,float,float,float)': 'rgba8888$float$float$float$float', 'rgb888(float,float,float)': 'rgb888$float$float$float', 'rgba4444(float,float,float,float)': 'rgba4444$float$float$float$float', 'rgb565(float,float,float)': 'rgb565$float$float$float', 'toFloatBits(float,float,float,float)': 'toFloatBits$float$float$float$float', 'toFloatBits(int,int,int,int)': 'toFloatBits$int$int$int$int', 'valueOf(java.lang.String,com.badlogic.gdx.graphics.Color)': 'valueOf$String$Color', 'valueOf(java.lang.String)': 'valueOf$String', 'lerp(float,float,float,float,float)': 'lerp$float$float$float$float$float', 'lerp(com.badlogic.gdx.graphics.Color,float)': 'lerp$Color$float', 'mul(float,float,float,float)': 'mul$float$float$float$float', 'sub(float,float,float,float)': 'sub$float$float$float$float', 'add(float,float,float,float)': 'add$float$float$float$float', 'set(int)': 'set$int', 'set(float,float,float,float)': 'set$float$float$float$float', 'sub(com.badlogic.gdx.graphics.Color)': 'sub$Color', 'add(com.badlogic.gdx.graphics.Color)': 'add$Color', 'mul(float)': 'mul$float', 'mul(com.badlogic.gdx.graphics.Color)': 'mul$Color', 'set(com.badlogic.gdx.graphics.Color,float)': 'set$Color$float', 'set(com.badlogic.gdx.graphics.Color)': 'set$Color' }, clinit: true, lazy: ['WHITE', 'LIGHT_GRAY', 'GRAY', 'DARK_GRAY', 'BLACK', 'WHITE_FLOAT_BITS', 'CLEAR', 'CLEAR_WHITE', 'BLUE', 'NAVY', 'ROYAL', 'SLATE', 'SKY', 'CYAN', 'TEAL', 'GREEN', 'CHARTREUSE', 'LIME', 'FOREST', 'OLIVE', 'YELLOW', 'GOLD', 'GOLDENROD', 'ORANGE', 'BROWN', 'TAN', 'FIREBRICK', 'RED', 'SCARLET', 'CORAL', 'SALMON', 'PINK', 'MAGENTA', 'PURPLE', 'VIOLET', 'MAROON'] });
$J.module(() => {
  NumberUtils = $J.load('com.badlogic.gdx.utils.NumberUtils');
});
