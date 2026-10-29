// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Color.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ColorSpace, IllegalArgumentException, JObject, Toolkit } from '../../../jre/index.ts';

let ColorPaintContext, GraphicsEnvironment, Transparency;

/**
 * The {@code Color} class is used to encapsulate colors in the default
 * sRGB color space or colors in arbitrary color spaces identified by a
 * {@link ColorSpace}.  Every color has an implicit alpha value of 1.0 or
 * an explicit one provided in the constructor.  The alpha value
 * defines the transparency of a color and can be represented by
 * a float value in the range 0.0&nbsp;-&nbsp;1.0 or 0&nbsp;-&nbsp;255.
 * An alpha value of 1.0 or 255 means that the color is completely
 * opaque and an alpha value of 0 or 0.0 means that the color is
 * completely transparent.
 * When constructing a {@code Color} with an explicit alpha or
 * getting the color/alpha components of a {@code Color}, the color
 * components are never premultiplied by the alpha component.
 * <p>
 * The default color space for the Java 2D(tm) API is sRGB, a proposed
 * standard RGB color space.  For further information on sRGB,
 * see <A href="http://www.w3.org/pub/WWW/Graphics/Color/sRGB.html">
 * http://www.w3.org/pub/WWW/Graphics/Color/sRGB.html
 * </A>.
 *
 * @version     10 Feb 1997
 * @author      Sami Shaio
 * @author      Arthur van Hoff
 * @see         ColorSpace
 * @see         AlphaComposite
 */
export class Color extends JObject {
  /**
   * The color white.  In the default sRGB space.
   */
  static white: Color = null;
  /**
   * The color white.  In the default sRGB space.
   * @since 1.4
   */
  static WHITE: Color = null;
  /**
   * The color light gray.  In the default sRGB space.
   */
  static lightGray: Color = null;
  /**
   * The color light gray.  In the default sRGB space.
   * @since 1.4
   */
  static LIGHT_GRAY: Color = null;
  /**
   * The color gray.  In the default sRGB space.
   */
  static gray: Color = null;
  /**
   * The color gray.  In the default sRGB space.
   * @since 1.4
   */
  static GRAY: Color = null;
  /**
   * The color dark gray.  In the default sRGB space.
   */
  static darkGray: Color = null;
  /**
   * The color dark gray.  In the default sRGB space.
   * @since 1.4
   */
  static DARK_GRAY: Color = null;
  /**
   * The color black.  In the default sRGB space.
   */
  static black: Color = null;
  /**
   * The color black.  In the default sRGB space.
   * @since 1.4
   */
  static BLACK: Color = null;
  /**
   * The color red.  In the default sRGB space.
   */
  static red: Color = null;
  /**
   * The color red.  In the default sRGB space.
   * @since 1.4
   */
  static RED: Color = null;
  /**
   * The color pink.  In the default sRGB space.
   */
  static pink: Color = null;
  /**
   * The color pink.  In the default sRGB space.
   * @since 1.4
   */
  static PINK: Color = null;
  /**
   * The color orange.  In the default sRGB space.
   */
  static orange: Color = null;
  /**
   * The color orange.  In the default sRGB space.
   * @since 1.4
   */
  static ORANGE: Color = null;
  /**
   * The color yellow.  In the default sRGB space.
   */
  static yellow: Color = null;
  /**
   * The color yellow.  In the default sRGB space.
   * @since 1.4
   */
  static YELLOW: Color = null;
  /**
   * The color green.  In the default sRGB space.
   */
  static green: Color = null;
  /**
   * The color green.  In the default sRGB space.
   * @since 1.4
   */
  static GREEN: Color = null;
  /**
   * The color magenta.  In the default sRGB space.
   */
  static magenta: Color = null;
  /**
   * The color magenta.  In the default sRGB space.
   * @since 1.4
   */
  static MAGENTA: Color = null;
  /**
   * The color cyan.  In the default sRGB space.
   */
  static cyan: Color = null;
  /**
   * The color cyan.  In the default sRGB space.
   * @since 1.4
   */
  static CYAN: Color = null;
  /**
   * The color blue.  In the default sRGB space.
   */
  static blue: Color = null;
  /**
   * The color blue.  In the default sRGB space.
   * @since 1.4
   */
  static BLUE: Color = null;
  /**
   * The color value.
   * @serial
   * @see #getRGB
   */
  value_: number = 0;
  /**
   * The color value in the default sRGB {@code ColorSpace} as
   * {@code float} components (no alpha).
   * If {@code null} after object construction, this must be an
   * sRGB color constructed with 8-bit precision, so compute from the
   * {@code int} color value.
   * @serial
   * @see #getRGBColorComponents
   * @see #getRGBComponents
   */
  frgbvalue: number[] = null;
  /**
   * The color value in the native {@code ColorSpace} as
   * {@code float} components (no alpha).
   * If {@code null} after object construction, this must be an
   * sRGB color constructed with 8-bit precision, so compute from the
   * {@code int} color value.
   * @serial
   * @see #getRGBColorComponents
   * @see #getRGBComponents
   */
  fvalue: number[] = null;
  /**
   * The alpha value as a {@code float} component.
   * If {@code frgbvalue} is {@code null}, this is not valid
   * data, so compute from the {@code int} color value.
   * @serial
   * @see #getRGBComponents
   * @see #getComponents
   */
  falpha: number = 0;
  /**
   * The {@code ColorSpace}.  If {@code null}, then it's
   * default is sRGB.
   * @serial
   * @see #getColor
   * @see #getColorSpace
   * @see #getColorComponents
   */
  cs: ColorSpace = null;
  static readonly FACTOR: number = 0.7;
  $init_Color() {
    this.frgbvalue = null;
    this.fvalue = null;
    this.falpha = 0;
    this.cs = null;
  }
  /**
   * Creates an opaque sRGB color with the specified red, green,
   * and blue values in the range (0 - 255).
   * The actual color used in rendering depends
   * on finding the best match given the color space
   * available for a given output device.
   * Alpha is defaulted to 255.
   *
   * @throws IllegalArgumentException if {@code r}, {@code g}
   *        or {@code b} are outside of the range
   *        0 to 255, inclusive
   * @param r the red component
   * @param g the green component
   * @param b the blue component
   * @see #getRed
   * @see #getGreen
   * @see #getBlue
   * @see #getRGB
   */
  _Color$int$int$int(r: number, g: number, b: number): this {
    this._Color$int$int$int$int(r, g, b, 255);
    return this;
  }
  /**
   * Creates an sRGB color with the specified red, green, blue, and alpha
   * values in the range (0 - 255).
   *
   * @throws IllegalArgumentException if {@code r}, {@code g},
   *        {@code b} or {@code a} are outside of the range
   *        0 to 255, inclusive
   * @param r the red component
   * @param g the green component
   * @param b the blue component
   * @param a the alpha component
   * @see #getRed
   * @see #getGreen
   * @see #getBlue
   * @see #getAlpha
   * @see #getRGB
   */
  _Color$int$int$int$int(r: number, g: number, b: number, a: number): this {
    this.$init_Color();
    this.value_ = ((a & 255) << 24) | ((r & 255) << 16) | ((g & 255) << 8) | ((b & 255) << 0);
    Color.testColorValueRange$int$int$int$int(r, g, b, a);
    return this;
  }
  /**
   * Creates an opaque sRGB color with the specified combined RGB value
   * consisting of the red component in bits 16-23, the green component
   * in bits 8-15, and the blue component in bits 0-7.  The actual color
   * used in rendering depends on finding the best match given the
   * color space available for a particular output device.  Alpha is
   * defaulted to 255.
   *
   * @param rgb the combined RGB components
   * @see java.awt.image.ColorModel#getRGBdefault
   * @see #getRed
   * @see #getGreen
   * @see #getBlue
   * @see #getRGB
   */
  _Color$int(rgb: number): this {
    this.$init_Color();
    this.value_ = -16777216 | rgb;
    return this;
  }
  /**
   * Creates an sRGB color with the specified combined RGBA value consisting
   * of the alpha component in bits 24-31, the red component in bits 16-23,
   * the green component in bits 8-15, and the blue component in bits 0-7.
   * If the {@code hasalpha} argument is {@code false}, alpha
   * is defaulted to 255.
   *
   * @param rgba the combined RGBA components
   * @param hasalpha {@code true} if the alpha bits are valid;
   *        {@code false} otherwise
   * @see java.awt.image.ColorModel#getRGBdefault
   * @see #getRed
   * @see #getGreen
   * @see #getBlue
   * @see #getAlpha
   * @see #getRGB
   */
  _Color$int$boolean(rgba: number, hasalpha: boolean): this {
    this.$init_Color();
    if (hasalpha) {
      this.value_ = rgba;
    } else {
      this.value_ = -16777216 | rgba;
    }
    return this;
  }
  /**
   * Creates an opaque sRGB color with the specified red, green, and blue
   * values in the range (0.0 - 1.0).  Alpha is defaulted to 1.0.  The
   * actual color used in rendering depends on finding the best
   * match given the color space available for a particular output
   * device.
   *
   * @throws IllegalArgumentException if {@code r}, {@code g}
   *        or {@code b} are outside of the range
   *        0.0 to 1.0, inclusive
   * @param r the red component
   * @param g the green component
   * @param b the blue component
   * @see #getRed
   * @see #getGreen
   * @see #getBlue
   * @see #getRGB
   */
  _Color$float$float$float(r: number, g: number, b: number): this {
    this._Color$int$int$int($J.d2i((Math.fround(r * 255) + 0.5)), $J.d2i((Math.fround(g * 255) + 0.5)), $J.d2i((Math.fround(b * 255) + 0.5)));
    Color.testColorValueRange$float$float$float$float(r, g, b, 1);
    this.frgbvalue = $J.newArray(3, 0);
    this.frgbvalue[0] = r;
    this.frgbvalue[1] = g;
    this.frgbvalue[2] = b;
    this.falpha = 1;
    this.fvalue = this.frgbvalue;
    return this;
  }
  /**
   * Creates an sRGB color with the specified red, green, blue, and
   * alpha values in the range (0.0 - 1.0).  The actual color
   * used in rendering depends on finding the best match given the
   * color space available for a particular output device.
   * @throws IllegalArgumentException if {@code r}, {@code g}
   *        {@code b} or {@code a} are outside of the range
   *        0.0 to 1.0, inclusive
   * @param r the red component
   * @param g the green component
   * @param b the blue component
   * @param a the alpha component
   * @see #getRed
   * @see #getGreen
   * @see #getBlue
   * @see #getAlpha
   * @see #getRGB
   */
  _Color$float$float$float$float(r: number, g: number, b: number, a: number): this {
    this._Color$int$int$int$int($J.d2i((Math.fround(r * 255) + 0.5)), $J.d2i((Math.fround(g * 255) + 0.5)), $J.d2i((Math.fround(b * 255) + 0.5)), $J.d2i((Math.fround(a * 255) + 0.5)));
    this.frgbvalue = $J.newArray(3, 0);
    this.frgbvalue[0] = r;
    this.frgbvalue[1] = g;
    this.frgbvalue[2] = b;
    this.falpha = a;
    this.fvalue = this.frgbvalue;
    return this;
  }
  /**
   * Creates a color in the specified {@code ColorSpace}
   * with the color components specified in the {@code float}
   * array and the specified alpha.  The number of components is
   * determined by the type of the {@code ColorSpace}.  For
   * example, RGB requires 3 components, but CMYK requires 4
   * components.
   * @param cspace the {@code ColorSpace} to be used to
   *                  interpret the components
   * @param components an arbitrary number of color components
   *                      that is compatible with the {@code ColorSpace}
   * @param alpha alpha value
   * @throws IllegalArgumentException if any of the values in the
   *         {@code components} array or {@code alpha} is
   *         outside of the range 0.0 to 1.0
   * @see #getComponents
   * @see #getColorComponents
   */
  _Color$ColorSpace$floatArr$float(cspace: ColorSpace, components: number[], alpha: number): this {
    this.$init_Color();
    let rangeError = false;
    let badComponentString = '';
    let n = cspace.getNumComponents();
    this.fvalue = $J.newArray(n, 0);
    for (let i = 0; i < n; i++) {
      if (components[i] < 0 || components[i] > 1) {
        rangeError = true;
        badComponentString = badComponentString + 'Component ' + i + ' ';
      } else {
        this.fvalue[i] = components[i];
      }
    }
    if (alpha < 0 || alpha > 1) {
      rangeError = true;
      badComponentString = badComponentString + 'Alpha';
    } else {
      this.falpha = alpha;
    }
    if (rangeError) {
      throw new IllegalArgumentException('Color parameter outside of expected range: ' + badComponentString);
    }
    this.frgbvalue = cspace.toRGB(this.fvalue);
    this.cs = cspace;
    this.value_ = ((($J.d2i((Math.fround(this.falpha * 255)))) & 255) << 24) | ((($J.d2i((Math.fround(this.frgbvalue[0] * 255)))) & 255) << 16) | ((($J.d2i((Math.fround(this.frgbvalue[1] * 255)))) & 255) << 8) | ((($J.d2i((Math.fround(this.frgbvalue[2] * 255)))) & 255) << 0);
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Color', 'initIDs', this, $a);
  }
  /**
   * Checks the color integer components supplied for validity.
   * Throws an {@link IllegalArgumentException} if the value is out of
   * range.
   * @param r the Red component
   * @param g the Green component
   * @param b the Blue component
   */
  static testColorValueRange$int$int$int$int(r: number, g: number, b: number, a: number): void {
    let rangeError = false;
    let badComponentString = '';
    if (a < 0 || a > 255) {
      rangeError = true;
      badComponentString = badComponentString + ' Alpha';
    }
    if (r < 0 || r > 255) {
      rangeError = true;
      badComponentString = badComponentString + ' Red';
    }
    if (g < 0 || g > 255) {
      rangeError = true;
      badComponentString = badComponentString + ' Green';
    }
    if (b < 0 || b > 255) {
      rangeError = true;
      badComponentString = badComponentString + ' Blue';
    }
    if (rangeError === true) {
      throw new IllegalArgumentException('Color parameter outside of expected range:' + badComponentString);
    }
  }
  /**
   * Checks the color {@code float} components supplied for
   * validity.
   * Throws an {@code IllegalArgumentException} if the value is out
   * of range.
   * @param r the Red component
   * @param g the Green component
   * @param b the Blue component
   */
  static testColorValueRange$float$float$float$float(r: number, g: number, b: number, a: number): void {
    let rangeError = false;
    let badComponentString = '';
    if (a < 0 || a > 1) {
      rangeError = true;
      badComponentString = badComponentString + ' Alpha';
    }
    if (r < 0 || r > 1) {
      rangeError = true;
      badComponentString = badComponentString + ' Red';
    }
    if (g < 0 || g > 1) {
      rangeError = true;
      badComponentString = badComponentString + ' Green';
    }
    if (b < 0 || b > 1) {
      rangeError = true;
      badComponentString = badComponentString + ' Blue';
    }
    if (rangeError === true) {
      throw new IllegalArgumentException('Color parameter outside of expected range:' + badComponentString);
    }
  }
  /**
   * Returns the red component in the range 0-255 in the default sRGB
   * space.
   * @return the red component.
   * @see #getRGB
   */
  getRed(): number {
    return (this.getRGB() >> 16) & 255;
  }
  /**
   * Returns the green component in the range 0-255 in the default sRGB
   * space.
   * @return the green component.
   * @see #getRGB
   */
  getGreen(): number {
    return (this.getRGB() >> 8) & 255;
  }
  /**
   * Returns the blue component in the range 0-255 in the default sRGB
   * space.
   * @return the blue component.
   * @see #getRGB
   */
  getBlue(): number {
    return (this.getRGB() >> 0) & 255;
  }
  /**
   * Returns the alpha component in the range 0-255.
   * @return the alpha component.
   * @see #getRGB
   */
  getAlpha(): number {
    return (this.getRGB() >> 24) & 255;
  }
  /**
   * Returns the RGB value representing the color in the default sRGB
   * {@link ColorModel}.
   * (Bits 24-31 are alpha, 16-23 are red, 8-15 are green, 0-7 are
   * blue).
   * @return the RGB value of the color in the default sRGB
   *         {@code ColorModel}.
   * @see java.awt.image.ColorModel#getRGBdefault
   * @see #getRed
   * @see #getGreen
   * @see #getBlue
   * @since 1.0
   */
  getRGB(): number {
    return this.value_;
  }
  /**
   * Creates a new {@code Color} that is a brighter version of this
   * {@code Color}.
   * <p>
   * This method applies an arbitrary scale factor to each of the three RGB
   * components of this {@code Color} to create a brighter version
   * of this {@code Color}.
   * The {@code alpha} value is preserved.
   * Although {@code brighter} and
   * {@code darker} are inverse operations, the results of a
   * series of invocations of these two methods might be inconsistent
   * because of rounding errors.
   * @return     a new {@code Color} object that is
   *                 a brighter version of this {@code Color}
   *                 with the same {@code alpha} value.
   * @see        java.awt.Color#darker
   * @since      1.0
   */
  brighter(): Color {
    let r = this.getRed();
    let g = this.getGreen();
    let b = this.getBlue();
    let alpha = this.getAlpha();
    let i = $J.d2i((1 / (1 - Color.FACTOR)));
    if (r === 0 && g === 0 && b === 0) {
      return new Color()._Color$int$int$int$int(i, i, i, alpha);
    }
    if (r > 0 && r < i) {
      r = i;
    }
    if (g > 0 && g < i) {
      g = i;
    }
    if (b > 0 && b < i) {
      b = i;
    }
    return new Color()._Color$int$int$int$int(Math.min($J.d2i((r / Color.FACTOR)), 255), Math.min($J.d2i((g / Color.FACTOR)), 255), Math.min($J.d2i((b / Color.FACTOR)), 255), alpha);
  }
  /**
   * Creates a new {@code Color} that is a darker version of this
   * {@code Color}.
   * <p>
   * This method applies an arbitrary scale factor to each of the three RGB
   * components of this {@code Color} to create a darker version of
   * this {@code Color}.
   * The {@code alpha} value is preserved.
   * Although {@code brighter} and
   * {@code darker} are inverse operations, the results of a series
   * of invocations of these two methods might be inconsistent because
   * of rounding errors.
   * @return  a new {@code Color} object that is
   *                    a darker version of this {@code Color}
   *                    with the same {@code alpha} value.
   * @see        java.awt.Color#brighter
   * @since      1.0
   */
  darker(): Color {
    return new Color()._Color$int$int$int$int(Math.max($J.d2i((this.getRed() * Color.FACTOR)), 0), Math.max($J.d2i((this.getGreen() * Color.FACTOR)), 0), Math.max($J.d2i((this.getBlue() * Color.FACTOR)), 0), this.getAlpha());
  }
  /**
   * Computes the hash code for this {@code Color}.
   * @return     a hash code value for this object.
   * @since      1.0
   */
  hashCode(): number {
    return this.value_;
  }
  /**
   * Determines whether another object is equal to this
   * {@code Color}.
   * <p>
   * The result is {@code true} if and only if the argument is not
   * {@code null} and is a {@code Color} object that has the same
   * red, green, blue, and alpha values as this object.
   * @param       obj   the object to test for equality with this
   *                          {@code Color}
   * @return      {@code true} if the objects are the same;
   *                             {@code false} otherwise.
   * @since   1.0
   */
  equals(obj: any): boolean {
    return obj instanceof Color && (obj).getRGB() === this.getRGB();
  }
  /**
   * Returns a string representation of this {@code Color}. This
   * method is intended to be used only for debugging purposes.  The
   * content and format of the returned string might vary between
   * implementations. The returned string might be empty but cannot
   * be {@code null}.
   *
   * @return  a string representation of this {@code Color}.
   */
  toString(): string {
    return $J.getClass(this).getName() + '[r=' + this.getRed() + ',g=' + this.getGreen() + ',b=' + this.getBlue() + ']';
  }
  /**
   * Converts a {@code String} to an integer and returns the
   * specified opaque {@code Color}. This method handles string
   * formats that are used to represent octal and hexadecimal numbers.
   * @param      nm a {@code String} that represents
   *                            an opaque color as a 24-bit integer
   * @return     the new {@code Color} object.
   * @see        java.lang.Integer#decode
   * @throws  NumberFormatException  if the specified string cannot
   *                      be interpreted as a decimal,
   *                      octal, or hexadecimal integer.
   * @since      1.1
   */
  static decode(nm: string): Color {
    let intval = $J.Integer_decode(nm);
    let i = (+intval);
    return new Color()._Color$int$int$int((i >> 16) & 255, (i >> 8) & 255, i & 255);
  }
  /**
   * Finds a color in the system properties.
   * <p>
   * The argument is treated as the name of a system property to
   * be obtained. The string value of this property is then interpreted
   * as an integer which is then converted to a {@code Color}
   * object.
   * <p>
   * If the specified property is not found or could not be parsed as
   * an integer then {@code null} is returned.
   * @param    nm the name of the color property
   * @return   the {@code Color} converted from the system
   *          property.
   * @see      java.lang.System#getProperty(java.lang.String)
   * @see      java.lang.Integer#getInteger(java.lang.String)
   * @see      java.awt.Color#Color(int)
   * @since    1.0
   */
  static getColor$String(nm: string): Color {
    return Color.getColor$String$Color(nm, null);
  }
  /**
   * Finds a color in the system properties.
   * <p>
   * The first argument is treated as the name of a system property to
   * be obtained. The string value of this property is then interpreted
   * as an integer which is then converted to a {@code Color}
   * object.
   * <p>
   * If the specified property is not found or cannot be parsed as
   * an integer then the {@code Color} specified by the second
   * argument is returned instead.
   * @param    nm the name of the color property
   * @param    v    the default {@code Color}
   * @return   the {@code Color} converted from the system
   *          property, or the specified {@code Color}.
   * @see      java.lang.System#getProperty(java.lang.String)
   * @see      java.lang.Integer#getInteger(java.lang.String)
   * @see      java.awt.Color#Color(int)
   * @since    1.0
   */
  static getColor$String$Color(nm: string, v: Color): Color {
    let intval = $J.Integer_getInteger(nm);
    if (intval == null) {
      return v;
    }
    let i = (+intval);
    return new Color()._Color$int$int$int((i >> 16) & 255, (i >> 8) & 255, i & 255);
  }
  /**
   * Finds a color in the system properties.
   * <p>
   * The first argument is treated as the name of a system property to
   * be obtained. The string value of this property is then interpreted
   * as an integer which is then converted to a {@code Color}
   * object.
   * <p>
   * If the specified property is not found or could not be parsed as
   * an integer then the integer value {@code v} is used instead,
   * and is converted to a {@code Color} object.
   * @param    nm  the name of the color property
   * @param    v   the default color value, as an integer
   * @return   the {@code Color} converted from the system
   *          property or the {@code Color} converted from
   *          the specified integer.
   * @see      java.lang.System#getProperty(java.lang.String)
   * @see      java.lang.Integer#getInteger(java.lang.String)
   * @see      java.awt.Color#Color(int)
   * @since    1.0
   */
  static getColor$String$int(nm: string, v: number): Color {
    let intval = $J.Integer_getInteger(nm);
    let i = (intval != null) ? (+intval) : v;
    return new Color()._Color$int$int$int((i >> 16) & 255, (i >> 8) & 255, (i >> 0) & 255);
  }
  /**
   * Converts the components of a color, as specified by the HSB
   * model, to an equivalent set of values for the default RGB model.
   * <p>
   * The {@code saturation} and {@code brightness} components
   * should be floating-point values between zero and one
   * (numbers in the range 0.0-1.0).  The {@code hue} component
   * can be any floating-point number.  The floor of this number is
   * subtracted from it to create a fraction between 0 and 1.  This
   * fractional number is then multiplied by 360 to produce the hue
   * angle in the HSB color model.
   * <p>
   * The integer that is returned by {@code HSBtoRGB} encodes the
   * value of a color in bits 0-23 of an integer value that is the same
   * format used by the method {@link #getRGB() getRGB}.
   * This integer can be supplied as an argument to the
   * {@code Color} constructor that takes a single integer argument.
   * @param     hue   the hue component of the color
   * @param     saturation   the saturation of the color
   * @param     brightness   the brightness of the color
   * @return    the RGB value of the color with the indicated hue,
   *                            saturation, and brightness.
   * @see       java.awt.Color#getRGB()
   * @see       java.awt.Color#Color(int)
   * @see       java.awt.image.ColorModel#getRGBdefault()
   * @since     1.0
   */
  static HSBtoRGB(hue: number, saturation: number, brightness: number): number {
    let r = 0;
    let g = 0;
    let b = 0;
    if (saturation === Math.fround(0)) {
      r = g = b = $J.d2i((Math.fround(Math.fround(brightness * 255) + 0.5)));
    } else {
      let h = Math.fround((Math.fround(hue - Math.fround(Math.floor(hue)))) * 6);
      let f = Math.fround(h - Math.fround(Math.floor(h)));
      let p = Math.fround(brightness * (Math.fround(1 - saturation)));
      let q = Math.fround(brightness * (Math.fround(1 - Math.fround(saturation * f))));
      let t = Math.fround(brightness * (Math.fround(1 - (Math.fround(saturation * (Math.fround(1 - f)))))));
      switch ($J.d2i(h)) {
        case 0:
          r = $J.d2i((Math.fround(Math.fround(brightness * 255) + 0.5)));
          g = $J.d2i((Math.fround(Math.fround(t * 255) + 0.5)));
          b = $J.d2i((Math.fround(Math.fround(p * 255) + 0.5)));
          break;
        case 1:
          r = $J.d2i((Math.fround(Math.fround(q * 255) + 0.5)));
          g = $J.d2i((Math.fround(Math.fround(brightness * 255) + 0.5)));
          b = $J.d2i((Math.fround(Math.fround(p * 255) + 0.5)));
          break;
        case 2:
          r = $J.d2i((Math.fround(Math.fround(p * 255) + 0.5)));
          g = $J.d2i((Math.fround(Math.fround(brightness * 255) + 0.5)));
          b = $J.d2i((Math.fround(Math.fround(t * 255) + 0.5)));
          break;
        case 3:
          r = $J.d2i((Math.fround(Math.fround(p * 255) + 0.5)));
          g = $J.d2i((Math.fround(Math.fround(q * 255) + 0.5)));
          b = $J.d2i((Math.fround(Math.fround(brightness * 255) + 0.5)));
          break;
        case 4:
          r = $J.d2i((Math.fround(Math.fround(t * 255) + 0.5)));
          g = $J.d2i((Math.fround(Math.fround(p * 255) + 0.5)));
          b = $J.d2i((Math.fround(Math.fround(brightness * 255) + 0.5)));
          break;
        case 5:
          r = $J.d2i((Math.fround(Math.fround(brightness * 255) + 0.5)));
          g = $J.d2i((Math.fround(Math.fround(p * 255) + 0.5)));
          b = $J.d2i((Math.fround(Math.fround(q * 255) + 0.5)));
          break;
      }
    }
    return -16777216 | (r << 16) | (g << 8) | (b << 0);
  }
  /**
   * Converts the components of a color, as specified by the default RGB
   * model, to an equivalent set of values for hue, saturation, and
   * brightness that are the three components of the HSB model.
   * <p>
   * If the {@code hsbvals} argument is {@code null}, then a
   * new array is allocated to return the result. Otherwise, the method
   * returns the array {@code hsbvals}, with the values put into
   * that array.
   * @param     r   the red component of the color
   * @param     g   the green component of the color
   * @param     b   the blue component of the color
   * @param     hsbvals  the array used to return the
   *                     three HSB values, or {@code null}
   * @return    an array of three elements containing the hue, saturation,
   *                     and brightness (in that order), of the color with
   *                     the indicated red, green, and blue components.
   * @see       java.awt.Color#getRGB()
   * @see       java.awt.Color#Color(int)
   * @see       java.awt.image.ColorModel#getRGBdefault()
   * @since     1.0
   */
  static RGBtoHSB(r: number, g: number, b: number, hsbvals: number[]): number[] {
    let hue: number;
    let saturation: number;
    let brightness: number;
    if (hsbvals == null) {
      hsbvals = $J.newArray(3, 0);
    }
    let cmax = (r > g) ? r : g;
    if (b > cmax) {
      cmax = b;
    }
    let cmin = (r < g) ? r : g;
    if (b < cmin) {
      cmin = b;
    }
    brightness = Math.fround((Math.fround(cmax)) / 255);
    if (cmax !== 0) {
      saturation = Math.fround((Math.fround(((cmax - cmin) | 0))) / (Math.fround(cmax)));
    } else {
      saturation = 0;
    }
    if (saturation === Math.fround(0)) {
      hue = 0;
    } else {
      let redc = Math.fround((Math.fround(((cmax - r) | 0))) / (Math.fround(((cmax - cmin) | 0))));
      let greenc = Math.fround((Math.fround(((cmax - g) | 0))) / (Math.fround(((cmax - cmin) | 0))));
      let bluec = Math.fround((Math.fround(((cmax - b) | 0))) / (Math.fround(((cmax - cmin) | 0))));
      if (r === cmax) {
        hue = Math.fround(bluec - greenc);
      } else if (g === cmax) {
        hue = Math.fround(Math.fround(2 + redc) - bluec);
      } else {
        hue = Math.fround(Math.fround(4 + greenc) - redc);
      }
      hue = Math.fround(hue / 6);
      if (hue < Math.fround(0)) {
        hue = Math.fround(hue + 1);
      }
    }
    hsbvals[0] = hue;
    hsbvals[1] = saturation;
    hsbvals[2] = brightness;
    return hsbvals;
  }
  /**
   * Creates a {@code Color} object based on the specified values
   * for the HSB color model.
   * <p>
   * The {@code s} and {@code b} components should be
   * floating-point values between zero and one
   * (numbers in the range 0.0-1.0).  The {@code h} component
   * can be any floating-point number.  The floor of this number is
   * subtracted from it to create a fraction between 0 and 1.  This
   * fractional number is then multiplied by 360 to produce the hue
   * angle in the HSB color model.
   * @param  h   the hue component
   * @param  s   the saturation of the color
   * @param  b   the brightness of the color
   * @return  a {@code Color} object with the specified hue,
   *                                 saturation, and brightness.
   * @since   1.0
   */
  static getHSBColor(h: number, s: number, b: number): Color {
    return new Color()._Color$int(Color.HSBtoRGB(h, s, b));
  }
  /**
   * Returns a {@code float} array containing the color and alpha
   * components of the {@code Color}, as represented in the default
   * sRGB color space.
   * If {@code compArray} is {@code null}, an array of length
   * 4 is created for the return value.  Otherwise,
   * {@code compArray} must have length 4 or greater,
   * and it is filled in with the components and returned.
   * @param compArray an array that this method fills with
   *                  color and alpha components and returns
   * @return the RGBA components in a {@code float} array.
   */
  getRGBComponents(compArray: number[]): number[] {
    let f: number[];
    if (compArray == null) {
      f = $J.newArray(4, 0);
    } else {
      f = compArray;
    }
    if (this.frgbvalue == null) {
      f[0] = Math.fround((Math.fround(this.getRed())) / 255);
      f[1] = Math.fround((Math.fround(this.getGreen())) / 255);
      f[2] = Math.fround((Math.fround(this.getBlue())) / 255);
      f[3] = Math.fround((Math.fround(this.getAlpha())) / 255);
    } else {
      f[0] = this.frgbvalue[0];
      f[1] = this.frgbvalue[1];
      f[2] = this.frgbvalue[2];
      f[3] = this.falpha;
    }
    return f;
  }
  /**
   * Returns a {@code float} array containing only the color
   * components of the {@code Color}, in the default sRGB color
   * space.  If {@code compArray} is {@code null}, an array of
   * length 3 is created for the return value.  Otherwise,
   * {@code compArray} must have length 3 or greater, and it is
   * filled in with the components and returned.
   * @param compArray an array that this method fills with color
   *          components and returns
   * @return the RGB components in a {@code float} array.
   */
  getRGBColorComponents(compArray: number[]): number[] {
    let f: number[];
    if (compArray == null) {
      f = $J.newArray(3, 0);
    } else {
      f = compArray;
    }
    if (this.frgbvalue == null) {
      f[0] = Math.fround((Math.fround(this.getRed())) / 255);
      f[1] = Math.fround((Math.fround(this.getGreen())) / 255);
      f[2] = Math.fround((Math.fround(this.getBlue())) / 255);
    } else {
      f[0] = this.frgbvalue[0];
      f[1] = this.frgbvalue[1];
      f[2] = this.frgbvalue[2];
    }
    return f;
  }
  /**
   * Returns a {@code float} array containing the color and alpha
   * components of the {@code Color}, in the
   * {@code ColorSpace} of the {@code Color}.
   * If {@code compArray} is {@code null}, an array with
   * length equal to the number of components in the associated
   * {@code ColorSpace} plus one is created for
   * the return value.  Otherwise, {@code compArray} must have at
   * least this length and it is filled in with the components and
   * returned.
   * @param compArray an array that this method fills with the color and
   *          alpha components of this {@code Color} in its
   *          {@code ColorSpace} and returns
   * @return the color and alpha components in a {@code float}
   *          array.
   */
  getComponents$floatArr(compArray: number[]): number[] {
    if (this.fvalue == null) {
      return this.getRGBComponents(compArray);
    }
    let f: number[];
    let n = this.fvalue.length;
    if (compArray == null) {
      f = $J.newArray((n + 1) | 0, 0);
    } else {
      f = compArray;
    }
    for (let i = 0; i < n; i++) {
      f[i] = this.fvalue[i];
    }
    f[n] = this.falpha;
    return f;
  }
  /**
   * Returns a {@code float} array containing only the color
   * components of the {@code Color}, in the
   * {@code ColorSpace} of the {@code Color}.
   * If {@code compArray} is {@code null}, an array with
   * length equal to the number of components in the associated
   * {@code ColorSpace} is created for
   * the return value.  Otherwise, {@code compArray} must have at
   * least this length and it is filled in with the components and
   * returned.
   * @param compArray an array that this method fills with the color
   *          components of this {@code Color} in its
   *          {@code ColorSpace} and returns
   * @return the color components in a {@code float} array.
   */
  getColorComponents$floatArr(compArray: number[]): number[] {
    if (this.fvalue == null) {
      return this.getRGBColorComponents(compArray);
    }
    let f: number[];
    let n = this.fvalue.length;
    if (compArray == null) {
      f = $J.newArray(n, 0);
    } else {
      f = compArray;
    }
    for (let i = 0; i < n; i++) {
      f[i] = this.fvalue[i];
    }
    return f;
  }
  /**
   * Returns a {@code float} array containing the color and alpha
   * components of the {@code Color}, in the
   * {@code ColorSpace} specified by the {@code cspace}
   * parameter.  If {@code compArray} is {@code null}, an
   * array with length equal to the number of components in
   * {@code cspace} plus one is created for the return value.
   * Otherwise, {@code compArray} must have at least this
   * length, and it is filled in with the components and returned.
   * @param cspace a specified {@code ColorSpace}
   * @param compArray an array that this method fills with the
   *          color and alpha components of this {@code Color} in
   *          the specified {@code ColorSpace} and returns
   * @return the color and alpha components in a {@code float}
   *          array.
   */
  getComponents$ColorSpace$floatArr(cspace: ColorSpace, compArray: number[]): number[] {
    if (this.cs == null) {
      this.cs = ColorSpace.getInstance(1000);
    }
    let f: number[];
    if (this.fvalue == null) {
      f = $J.newArray(3, 0);
      f[0] = Math.fround((Math.fround(this.getRed())) / 255);
      f[1] = Math.fround((Math.fround(this.getGreen())) / 255);
      f[2] = Math.fround((Math.fround(this.getBlue())) / 255);
    } else {
      f = this.fvalue;
    }
    let tmp = this.cs.toCIEXYZ(f);
    let tmpout = cspace.fromCIEXYZ(tmp);
    if (compArray == null) {
      compArray = $J.newArray((tmpout.length + 1) | 0, 0);
    }
    for (let i = 0; i < tmpout.length; i++) {
      compArray[i] = tmpout[i];
    }
    if (this.fvalue == null) {
      compArray[tmpout.length] = Math.fround((Math.fround(this.getAlpha())) / 255);
    } else {
      compArray[tmpout.length] = this.falpha;
    }
    return compArray;
  }
  /**
   * Returns a {@code float} array containing only the color
   * components of the {@code Color} in the
   * {@code ColorSpace} specified by the {@code cspace}
   * parameter. If {@code compArray} is {@code null}, an array
   * with length equal to the number of components in
   * {@code cspace} is created for the return value.  Otherwise,
   * {@code compArray} must have at least this length, and it is
   * filled in with the components and returned.
   * @param cspace a specified {@code ColorSpace}
   * @param compArray an array that this method fills with the color
   *          components of this {@code Color} in the specified
   *          {@code ColorSpace}
   * @return the color components in a {@code float} array.
   */
  getColorComponents$ColorSpace$floatArr(cspace: ColorSpace, compArray: number[]): number[] {
    if (this.cs == null) {
      this.cs = ColorSpace.getInstance(1000);
    }
    let f: number[];
    if (this.fvalue == null) {
      f = $J.newArray(3, 0);
      f[0] = Math.fround((Math.fround(this.getRed())) / 255);
      f[1] = Math.fround((Math.fround(this.getGreen())) / 255);
      f[2] = Math.fround((Math.fround(this.getBlue())) / 255);
    } else {
      f = this.fvalue;
    }
    let tmp = this.cs.toCIEXYZ(f);
    let tmpout = cspace.fromCIEXYZ(tmp);
    if (compArray == null) {
      return tmpout;
    }
    for (let i = 0; i < tmpout.length; i++) {
      compArray[i] = tmpout[i];
    }
    return compArray;
  }
  /**
   * Returns the {@code ColorSpace} of this {@code Color}.
   * @return this {@code Color} object's {@code ColorSpace}.
   */
  getColorSpace(): ColorSpace {
    if (this.cs == null) {
      this.cs = ColorSpace.getInstance(1000);
    }
    return this.cs;
  }
  /**
   * Creates and returns a {@link PaintContext} used to
   * generate a solid color field pattern.
   * See the {@link Paint#createContext specification} of the
   * method in the {@link Paint} interface for information
   * on null parameter handling.
   *
   * @param cm the preferred {@link ColorModel} which represents the most convenient
   *           format for the caller to receive the pixel data, or {@code null}
   *           if there is no preference.
   * @param r the device space bounding box
   *                     of the graphics primitive being rendered.
   * @param r2d the user space bounding box
   *                   of the graphics primitive being rendered.
   * @param xform the {@link AffineTransform} from user
   *              space into device space.
   * @param hints the set of hints that the context object can use to
   *              choose between rendering alternatives.
   * @return the {@code PaintContext} for
   *         generating color patterns.
   * @see Paint
   * @see PaintContext
   * @see ColorModel
   * @see Rectangle
   * @see Rectangle2D
   * @see AffineTransform
   * @see RenderingHints
   */
  createContext(cm: ColorModel, r: Rectangle, r2d: Rectangle2D, xform: AffineTransform, hints: RenderingHints): PaintContext {
    return new ColorPaintContext()._ColorPaintContext(this.getRGB(), cm);
  }
  /**
   * Returns the transparency mode for this {@code Color}.  This is
   * required to implement the {@code Paint} interface.
   * @return this {@code Color} object's transparency mode.
   * @see Paint
   * @see Transparency
   * @see #createContext
   */
  getTransparency(): number {
    let alpha = this.getAlpha();
    if (alpha === 255) {
      return Transparency.OPAQUE;
    } else if (alpha === 0) {
      return Transparency.BITMASK;
    } else {
      return Transparency.TRANSLUCENT;
    }
  }
  static $clinit() {
    Color.white = new Color()._Color$int$int$int(255, 255, 255);
    Color.WHITE = Color.white;
    Color.lightGray = new Color()._Color$int$int$int(192, 192, 192);
    Color.LIGHT_GRAY = Color.lightGray;
    Color.gray = new Color()._Color$int$int$int(128, 128, 128);
    Color.GRAY = Color.gray;
    Color.darkGray = new Color()._Color$int$int$int(64, 64, 64);
    Color.DARK_GRAY = Color.darkGray;
    Color.black = new Color()._Color$int$int$int(0, 0, 0);
    Color.BLACK = Color.black;
    Color.red = new Color()._Color$int$int$int(255, 0, 0);
    Color.RED = Color.red;
    Color.pink = new Color()._Color$int$int$int(255, 175, 175);
    Color.PINK = Color.pink;
    Color.orange = new Color()._Color$int$int$int(255, 200, 0);
    Color.ORANGE = Color.orange;
    Color.yellow = new Color()._Color$int$int$int(255, 255, 0);
    Color.YELLOW = Color.yellow;
    Color.green = new Color()._Color$int$int$int(0, 255, 0);
    Color.GREEN = Color.green;
    Color.magenta = new Color()._Color$int$int$int(255, 0, 255);
    Color.MAGENTA = Color.magenta;
    Color.cyan = new Color()._Color$int$int$int(0, 255, 255);
    Color.CYAN = Color.cyan;
    Color.blue = new Color()._Color$int$int$int(0, 0, 255);
    Color.BLUE = Color.blue;
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      Color.initIDs();
    }
  }
}

$J.define(Color, 'java.awt.Color', { kind: 'class', ifaces: ['java.awt.Paint', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.color.ColorSpace,float[],float': '_Color$ColorSpace$floatArr$float', 'float,float,float,float': '_Color$float$float$float$float', 'float,float,float': '_Color$float$float$float', 'int,boolean': '_Color$int$boolean', 'int': '_Color$int', 'int,int,int,int': '_Color$int$int$int$int', 'int,int,int': '_Color$int$int$int' }, meths: { 'getColorComponents(java.awt.color.ColorSpace,float[])': 'getColorComponents$ColorSpace$floatArr', 'getComponents(java.awt.color.ColorSpace,float[])': 'getComponents$ColorSpace$floatArr', 'getColorComponents(float[])': 'getColorComponents$floatArr', 'getComponents(float[])': 'getComponents$floatArr', 'getColor(java.lang.String,int)': 'getColor$String$int', 'getColor(java.lang.String,java.awt.Color)': 'getColor$String$Color', 'getColor(java.lang.String)': 'getColor$String', 'testColorValueRange(float,float,float,float)': 'testColorValueRange$float$float$float$float', 'testColorValueRange(int,int,int,int)': 'testColorValueRange$int$int$int$int' }, clinit: true, lazy: ['white', 'WHITE', 'lightGray', 'LIGHT_GRAY', 'gray', 'GRAY', 'darkGray', 'DARK_GRAY', 'black', 'BLACK', 'red', 'RED', 'pink', 'PINK', 'orange', 'ORANGE', 'yellow', 'YELLOW', 'green', 'GREEN', 'magenta', 'MAGENTA', 'cyan', 'CYAN', 'blue', 'BLUE'] });
$J.module(() => {
  ColorPaintContext = $J.load('java.awt.ColorPaintContext');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Transparency = $J.load('java.awt.Transparency');
});
