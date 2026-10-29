// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/FontMetrics.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Character, JObject, JString, Toolkit } from '../../../jre/index.ts';

let Graphics2D, GraphicsEnvironment, FontRenderContext;

/**
 * The {@code FontMetrics} class defines a font metrics object, which
 * encapsulates information about the rendering of a particular font on a
 * particular screen.
 * <p>
 * <b>Note to subclassers</b>: Since many of these methods form closed,
 * mutually recursive loops, you must take care that you implement
 * at least one of the methods in each such loop to prevent
 * infinite recursion when your subclass is used.
 * In particular, the following is the minimal suggested set of methods
 * to override in order to ensure correctness and prevent infinite
 * recursion (though other subsets are equally feasible):
 * <ul>
 * <li>{@link #getAscent()}
 * <li>{@link #getLeading()}
 * <li>{@link #getMaxAdvance()}
 * <li>{@link #charWidth(char)}
 * <li>{@link #charsWidth(char[], int, int)}
 * </ul>
 * <p>
 * <img src="doc-files/FontMetrics-1.gif" alt="The letter 'p' showing its 'reference point'"
 * style="border:15px; float:right; margin: 7px 10px;">
 * Note that the implementations of these methods are
 * inefficient, so they are usually overridden with more efficient
 * toolkit-specific implementations.
 * <p>
 * When an application asks to place a character at the position
 * (<i>x</i>,&nbsp;<i>y</i>), the character is placed so that its
 * reference point (shown as the dot in the accompanying image) is
 * put at that position. The reference point specifies a horizontal
 * line called the <i>baseline</i> of the character. In normal
 * printing, the baselines of characters should align.
 * <p>
 * In addition, every character in a font has an <i>ascent</i>, a
 * <i>descent</i>, and an <i>advance width</i>. The ascent is the
 * amount by which the character ascends above the baseline. The
 * descent is the amount by which the character descends below the
 * baseline. The advance width indicates the position at which AWT
 * should place the next character.
 * <p>
 * An array of characters or a string can also have an ascent, a
 * descent, and an advance width. The ascent of the array is the
 * maximum ascent of any character in the array. The descent is the
 * maximum descent of any character in the array. The advance width
 * is the sum of the advance widths of each of the characters in the
 * character array.  The advance of a {@code String} is the
 * distance along the baseline of the {@code String}.  This
 * distance is the width that should be used for centering or
 * right-aligning the {@code String}.
 * <p>Note that the advance of a {@code String} is not necessarily
 * the sum of the advances of its characters measured in isolation
 * because the width of a character can vary depending on its context.
 * For example, in Arabic text, the shape of a character can change
 * in order to connect to other characters.  Also, in some scripts,
 * certain character sequences can be represented by a single shape,
 * called a <em>ligature</em>.  Measuring characters individually does
 * not account for these transformations.
 * <p>Font metrics are baseline-relative, meaning that they are
 * generally independent of the rotation applied to the font (modulo
 * possible grid hinting effects).  See {@link java.awt.Font Font}.
 *
 * @author      Jim Graham
 * @see         java.awt.Font
 * @since       1.0
 */
export class FontMetrics extends JObject {
  static DEFAULT_FRC: FontRenderContext = null;
  /**
   * The actual {@link Font} from which the font metrics are
   * created.
   * This cannot be null.
   *
   * @serial
   * @see #getFont()
   */
  font: Font = null;
  /**
   * Creates a new {@code FontMetrics} object for finding out
   * height and width information about the specified {@code Font}
   * and specific character glyphs in that {@code Font}.
   * @param     font the {@code Font}
   * @see       java.awt.Font
   */
  _FontMetrics(font: Font): this {
    this.font = font;
    return this;
  }
  /**
   * Gets the {@code Font} described by this
   * {@code FontMetrics} object.
   * @return    the {@code Font} described by this
   * {@code FontMetrics} object.
   */
  getFont(): Font {
    return this.font;
  }
  /**
   * Gets the {@code FontRenderContext} used by this
   * {@code FontMetrics} object to measure text.
   * <p>
   * Note that methods in this class which take a {@code Graphics}
   * parameter measure text using the {@code FontRenderContext}
   * of that {@code Graphics} object, and not this
   * {@code FontRenderContext}
   * @return    the {@code FontRenderContext} used by this
   * {@code FontMetrics} object.
   * @since 1.6
   */
  getFontRenderContext(): FontRenderContext {
    return FontMetrics.DEFAULT_FRC;
  }
  /**
   * Determines the <em>standard leading</em> of the
   * {@code Font} described by this {@code FontMetrics}
   * object.  The standard leading, or
   * interline spacing, is the logical amount of space to be reserved
   * between the descent of one line of text and the ascent of the next
   * line. The height metric is calculated to include this extra space.
   * @return    the standard leading of the {@code Font}.
   * @see   #getHeight()
   * @see   #getAscent()
   * @see   #getDescent()
   */
  getLeading(): number {
    return 0;
  }
  /**
   * Determines the <em>font ascent</em> of the {@code Font}
   * described by this {@code FontMetrics} object. The font ascent
   * is the distance from the font's baseline to the top of most
   * alphanumeric characters. Some characters in the {@code Font}
   * might extend above the font ascent line.
   * @return     the font ascent of the {@code Font}.
   * @see        #getMaxAscent()
   */
  getAscent(): number {
    return this.font.getSize();
  }
  /**
   * Determines the <em>font descent</em> of the {@code Font}
   * described by this
   * {@code FontMetrics} object. The font descent is the distance
   * from the font's baseline to the bottom of most alphanumeric
   * characters with descenders. Some characters in the
   * {@code Font} might extend
   * below the font descent line.
   * @return     the font descent of the {@code Font}.
   * @see        #getMaxDescent()
   */
  getDescent(): number {
    return 0;
  }
  /**
   * Gets the standard height of a line of text in this font.  This
   * is the distance between the baseline of adjacent lines of text.
   * It is the sum of the leading + ascent + descent. Due to rounding
   * this may not be the same as getAscent() + getDescent() + getLeading().
   * There is no guarantee that lines of text spaced at this distance are
   * disjoint; such lines may overlap if some characters overshoot
   * either the standard ascent or the standard descent metric.
   * @return    the standard height of the font.
   * @see       #getLeading()
   * @see       #getAscent()
   * @see       #getDescent()
   */
  getHeight(): number {
    return (this.getLeading() + this.getAscent() + this.getDescent()) | 0;
  }
  /**
   * Determines the maximum ascent of the {@code Font}
   * described by this {@code FontMetrics} object.  No character
   * extends further above the font's baseline than this height.
   * @return    the maximum ascent of any character in the
   * {@code Font}.
   * @see       #getAscent()
   */
  getMaxAscent(): number {
    return this.getAscent();
  }
  /**
   * Determines the maximum descent of the {@code Font}
   * described by this {@code FontMetrics} object.  No character
   * extends further below the font's baseline than this height.
   * @return    the maximum descent of any character in the
   * {@code Font}.
   * @see       #getDescent()
   */
  getMaxDescent(): number {
    return this.getDescent();
  }
  /**
   * For backward compatibility only.
   * @return    the maximum descent of any character in the
   * {@code Font}.
   * @see #getMaxDescent()
   * @deprecated As of JDK version 1.1.1,
   * replaced by {@code getMaxDescent()}.
   */
  getMaxDecent(): number {
    return this.getMaxDescent();
  }
  /**
   * Returns an estimate of the maximum advance width of any character
   * in the {@code Font} described by this {@code FontMetrics} object,
   * with important caveats, enumerated below.
   * <p>
   * The advance is the distance from the leftmost point used to position
   * the character to the rightmost point along the baseline.
   * This is not the same thing as the visible width of the glyph image
   * representing the character.
   * <p>
   * The advance of a {@code String} is not necessarily the sum of the
   * advances of its characters. It may differ substantially if
   * complex text layout is required for proper rendering.
   * <p>
   * Some of the caveats of the reported value include
   * <ul>
   * <li> The returned value is relying upon information from some
   * underlying system font, and the correctness of that information
   * is outside of AWT's control.
   * <li> When specific characters are mapped into glyphs
   * in some rendering context, instructions in the font itself
   * together with the rasterization process may cause some glyph
   * to have a wider advance than reported.
   * <li> When a font is requested in some style, eg {@code Font.BOLD},
   * for which no exact match is available, then techniques to satisfy
   * the requested rendering may similarly result in glyphs that are
   * wider than the reported maximum.
   * <li> Depending on the implementation, an AWT logical font or
   * physical font may need to locate some characters from one or more
   * "fall back" fonts, when the primary underlying physical font does not
   * support the character. These fonts may not all be known or considered
   * in the calculation of the reported maximum advance. It is common
   * for the design center of such fall back fonts to be for a different
   * script than the design center of the primary font, so their
   * advances can be quite different. This can also lead to the
   * unexpected result that a font such as {@code Font.MONOSPACED} can
   * render glyphs that are not all the same width.
   * </ul>
   * None of these caveats are exposed as they are all implementation details,
   * and there is no practical way to determine when these are in effect.
   * An application which needs a better estimate of the maximum advance,
   * and knows the subset of characters it expects to display can query
   * the advance of each such character to find the widest, however,
   * as discussed above, since the displayed width of a {@code String}
   * is not necessarily the sum of the advances the value still needs
   * to be used with caution.
   * <p>
   * In summary, this method makes no absolute guarantee, nor can
   * it even make a guarantee to be correct within some margin of error.
   * So it should be used at most only for estimating the total space
   * sufficient to display some number of as yet unknown characters from
   * the font. And that might be either an overestimate, or an
   * underestimate depending on the specific text and rendering context.
   * @return    an estimate of the maximum advance width of any character
   *            in the {@code Font}, or {@code -1} if the
   *            maximum advance width is not known.
   */
  getMaxAdvance(): number {
    return -1;
  }
  /**
   * Returns the advance width of the specified character in this
   * {@code Font}.  The advance is the
   * distance from the leftmost point to the rightmost point on the
   * character's baseline.  Note that the advance of a
   * {@code String} is not necessarily the sum of the advances
   * of its characters.
   *
   * <p>This method doesn't validate the specified character to be a
   * valid Unicode code point. The caller must validate the
   * character value using {@link
   * java.lang.Character#isValidCodePoint(int)
   * Character.isValidCodePoint} if necessary.
   *
   * @param codePoint the character (Unicode code point) to be measured
   * @return    the advance width of the specified character
   *            in the {@code Font} described by this
   *            {@code FontMetrics} object.
   * @see   #charsWidth(char[], int, int)
   * @see   #stringWidth(String)
   */
  charWidth$int(codePoint: number): number {
    if (!Character.isValidCodePoint(codePoint)) {
      codePoint = 65535;
    }
    if (codePoint < 256) {
      return this.getWidths()[codePoint];
    } else {
      let buffer = $J.newArray(2, 0);
      let len = Character.toChars(codePoint, buffer, 0);
      return this.charsWidth(buffer, 0, len);
    }
  }
  /**
   * Returns the advance width of the specified character in this
   * {@code Font}.  The advance is the
   * distance from the leftmost point to the rightmost point on the
   * character's baseline.  Note that the advance of a
   * {@code String} is not necessarily the sum of the advances
   * of its characters.
   *
   * <p><b>Note:</b> This method cannot handle <a
   * href="../../../java.base/java/lang/Character.html#supplementary">
   * supplementary characters</a>.
   * To support all Unicode characters, including
   * supplementary characters, use the {@link #charWidth(int)} method.
   *
   * @param ch the character to be measured
   * @return     the advance width of the specified character
   *                  in the {@code Font} described by this
   *                  {@code FontMetrics} object.
   * @see        #charsWidth(char[], int, int)
   * @see        #stringWidth(String)
   */
  charWidth$char(ch: number): number {
    if (ch < 256) {
      return this.getWidths()[ch];
    }
    let data = [ch];
    return this.charsWidth(data, 0, 1);
  }
  /**
   * Returns the total advance width for showing the specified
   * {@code String} in this {@code Font}.  The advance
   * is the distance from the leftmost point to the rightmost point
   * on the string's baseline.
   * <p>
   * Note that the advance of a {@code String} is
   * not necessarily the sum of the advances of its characters.
   * @param str the {@code String} to be measured
   * @return    the advance width of the specified {@code String}
   *                  in the {@code Font} described by this
   *                  {@code FontMetrics}.
   * @throws NullPointerException if str is null.
   * @see       #bytesWidth(byte[], int, int)
   * @see       #charsWidth(char[], int, int)
   * @see       #getStringBounds(String, Graphics)
   */
  stringWidth(str: string): number {
    let len = str.length;
    let data = $J.newArray(len, 0);
    JString.getChars(str, 0, len, data, 0);
    return this.charsWidth(data, 0, len);
  }
  /**
   * Returns the total advance width for showing the specified array
   * of characters in this {@code Font}.  The advance is the
   * distance from the leftmost point to the rightmost point on the
   * string's baseline.  The advance of a {@code String}
   * is not necessarily the sum of the advances of its characters.
   * This is equivalent to measuring a {@code String} of the
   * characters in the specified range.
   * @param data the array of characters to be measured
   * @param off the start offset of the characters in the array
   * @param len the number of characters to be measured from the array
   * @return    the advance width of the subarray of the specified
   *               {@code char} array in the font described by
   *               this {@code FontMetrics} object.
   * @throws    NullPointerException if {@code data} is null.
   * @throws    IndexOutOfBoundsException if the {@code off}
   *            and {@code len} arguments index characters outside
   *            the bounds of the {@code data} array.
   * @see       #charWidth(int)
   * @see       #charWidth(char)
   * @see       #bytesWidth(byte[], int, int)
   * @see       #stringWidth(String)
   */
  charsWidth(data: number[], off: number, len: number): number {
    return this.stringWidth(JString.newString(data, off, len));
  }
  /**
   * Returns the total advance width for showing the specified array
   * of bytes in this {@code Font}.  The advance is the
   * distance from the leftmost point to the rightmost point on the
   * string's baseline.  The advance of a {@code String}
   * is not necessarily the sum of the advances of its characters.
   * This is equivalent to measuring a {@code String} of the
   * characters in the specified range.
   * @param data the array of bytes to be measured
   * @param off the start offset of the bytes in the array
   * @param len the number of bytes to be measured from the array
   * @return    the advance width of the subarray of the specified
   *               {@code byte} array in the {@code Font}
   *                  described by
   *               this {@code FontMetrics} object.
   * @throws    NullPointerException if {@code data} is null.
   * @throws    IndexOutOfBoundsException if the {@code off}
   *            and {@code len} arguments index bytes outside
   *            the bounds of the {@code data} array.
   * @see       #charsWidth(char[], int, int)
   * @see       #stringWidth(String)
   */
  bytesWidth(data: number[], off: number, len: number): number {
    return this.stringWidth(JString.newString(data, 0, off, len));
  }
  /**
   * Gets the advance widths of the first 256 characters in the
   * {@code Font}.  The advance is the
   * distance from the leftmost point to the rightmost point on the
   * character's baseline.  Note that the advance of a
   * {@code String} is not necessarily the sum of the advances
   * of its characters.
   * @return    an array storing the advance widths of the
   *                 characters in the {@code Font}
   *                 described by this {@code FontMetrics} object.
   */
  getWidths(): number[] {
    let widths = $J.newArray(256, 0);
    for (let ch = 0; ch < 256; ch++) {
      widths[ch] = this.charWidth$char(ch);
    }
    return widths;
  }
  /**
   * Checks to see if the {@code Font} has uniform line metrics.  A
   * composite font may consist of several different fonts to cover
   * various character sets.  In such cases, the
   * {@code FontLineMetrics} objects are not uniform.
   * Different fonts may have a different ascent, descent, metrics and
   * so on.  This information is sometimes necessary for line
   * measuring and line breaking.
   * @return {@code true} if the font has uniform line metrics;
   * {@code false} otherwise.
   * @see java.awt.Font#hasUniformLineMetrics()
   */
  hasUniformLineMetrics(): boolean {
    return this.font.hasUniformLineMetrics();
  }
  /**
   * Returns the {@link LineMetrics} object for the specified
   * {@code String} in the specified {@link Graphics} context.
   * @param str the specified {@code String}
   * @param context the specified {@code Graphics} context
   * @return a {@code LineMetrics} object created with the
   * specified {@code String} and {@code Graphics} context.
   * @see java.awt.Font#getLineMetrics(String, FontRenderContext)
   */
  getLineMetrics$String$Graphics(str: string, context: Graphics): LineMetrics {
    return this.font.getLineMetrics$String$FontRenderContext(str, this.myFRC(context));
  }
  /**
   * Returns the {@link LineMetrics} object for the specified
   * {@code String} in the specified {@link Graphics} context.
   * @param str the specified {@code String}
   * @param beginIndex the initial offset of {@code str}
   * @param limit the end offset of {@code str}
   * @param context the specified {@code Graphics} context
   * @return a {@code LineMetrics} object created with the
   * specified {@code String} and {@code Graphics} context.
   * @see java.awt.Font#getLineMetrics(String, int, int, FontRenderContext)
   */
  getLineMetrics$String$int$int$Graphics(str: string, beginIndex: number, limit: number, context: Graphics): LineMetrics {
    return this.font.getLineMetrics$String$int$int$FontRenderContext(str, beginIndex, limit, this.myFRC(context));
  }
  /**
   * Returns the {@link LineMetrics} object for the specified
   * character array in the specified {@link Graphics} context.
   * @param chars the specified character array
   * @param beginIndex the initial offset of {@code chars}
   * @param limit the end offset of {@code chars}
   * @param context the specified {@code Graphics} context
   * @return a {@code LineMetrics} object created with the
   * specified character array and {@code Graphics} context.
   * @see java.awt.Font#getLineMetrics(char[], int, int, FontRenderContext)
   */
  getLineMetrics$charArr$int$int$Graphics(chars: number[], beginIndex: number, limit: number, context: Graphics): LineMetrics {
    return this.font.getLineMetrics$charArr$int$int$FontRenderContext(chars, beginIndex, limit, this.myFRC(context));
  }
  /**
   * Returns the {@link LineMetrics} object for the specified
   * {@link CharacterIterator} in the specified {@link Graphics}
   * context.
   * @param ci the specified {@code CharacterIterator}
   * @param beginIndex the initial offset in {@code ci}
   * @param limit the end index of {@code ci}
   * @param context the specified {@code Graphics} context
   * @return a {@code LineMetrics} object created with the
   * specified arguments.
   * @see java.awt.Font#getLineMetrics(CharacterIterator, int, int, FontRenderContext)
   */
  getLineMetrics$CharacterIterator$int$int$Graphics(ci: CharacterIterator, beginIndex: number, limit: number, context: Graphics): LineMetrics {
    return this.font.getLineMetrics$CharacterIterator$int$int$FontRenderContext(ci, beginIndex, limit, this.myFRC(context));
  }
  /**
   * Returns the bounds of the specified {@code String} in the
   * specified {@code Graphics} context.  The bounds is used
   * to layout the {@code String}.
   * <p>Note: The returned bounds is in baseline-relative coordinates
   * (see {@link java.awt.FontMetrics class notes}).
   * @param str the specified {@code String}
   * @param context the specified {@code Graphics} context
   * @return a {@link Rectangle2D} that is the bounding box of the
   * specified {@code String} in the specified
   * {@code Graphics} context.
   * @see java.awt.Font#getStringBounds(String, FontRenderContext)
   */
  getStringBounds$String$Graphics(str: string, context: Graphics): Rectangle2D {
    return this.font.getStringBounds$String$FontRenderContext(str, this.myFRC(context));
  }
  /**
   * Returns the bounds of the specified {@code String} in the
   * specified {@code Graphics} context.  The bounds is used
   * to layout the {@code String}.
   * <p>Note: The returned bounds is in baseline-relative coordinates
   * (see {@link java.awt.FontMetrics class notes}).
   * @param str the specified {@code String}
   * @param beginIndex the offset of the beginning of {@code str}
   * @param limit the end offset of {@code str}
   * @param context the specified {@code Graphics} context
   * @return a {@code Rectangle2D} that is the bounding box of the
   * specified {@code String} in the specified
   * {@code Graphics} context.
   * @see java.awt.Font#getStringBounds(String, int, int, FontRenderContext)
   */
  getStringBounds$String$int$int$Graphics(str: string, beginIndex: number, limit: number, context: Graphics): Rectangle2D {
    return this.font.getStringBounds$String$int$int$FontRenderContext(str, beginIndex, limit, this.myFRC(context));
  }
  /**
   * Returns the bounds of the specified array of characters
   * in the specified {@code Graphics} context.
   * The bounds is used to layout the {@code String}
   * created with the specified array of characters,
   * {@code beginIndex} and {@code limit}.
   * <p>Note: The returned bounds is in baseline-relative coordinates
   * (see {@link java.awt.FontMetrics class notes}).
   * @param chars an array of characters
   * @param beginIndex the initial offset of the array of
   * characters
   * @param limit the end offset of the array of characters
   * @param context the specified {@code Graphics} context
   * @return a {@code Rectangle2D} that is the bounding box of the
   * specified character array in the specified
   * {@code Graphics} context.
   * @see java.awt.Font#getStringBounds(char[], int, int, FontRenderContext)
   */
  getStringBounds$charArr$int$int$Graphics(chars: number[], beginIndex: number, limit: number, context: Graphics): Rectangle2D {
    return this.font.getStringBounds$charArr$int$int$FontRenderContext(chars, beginIndex, limit, this.myFRC(context));
  }
  /**
   * Returns the bounds of the characters indexed in the specified
   * {@code CharacterIterator} in the
   * specified {@code Graphics} context.
   * <p>Note: The returned bounds is in baseline-relative coordinates
   * (see {@link java.awt.FontMetrics class notes}).
   * @param ci the specified {@code CharacterIterator}
   * @param beginIndex the initial offset in {@code ci}
   * @param limit the end index of {@code ci}
   * @param context the specified {@code Graphics} context
   * @return a {@code Rectangle2D} that is the bounding box of the
   * characters indexed in the specified {@code CharacterIterator}
   * in the specified {@code Graphics} context.
   * @see java.awt.Font#getStringBounds(CharacterIterator, int, int, FontRenderContext)
   */
  getStringBounds$CharacterIterator$int$int$Graphics(ci: CharacterIterator, beginIndex: number, limit: number, context: Graphics): Rectangle2D {
    return this.font.getStringBounds$CharacterIterator$int$int$FontRenderContext(ci, beginIndex, limit, this.myFRC(context));
  }
  /**
   * Returns the bounds for the character with the maximum bounds
   * in the specified {@code Graphics} context.
   * @param context the specified {@code Graphics} context
   * @return a {@code Rectangle2D} that is the
   * bounding box for the character with the maximum bounds.
   * @see java.awt.Font#getMaxCharBounds(FontRenderContext)
   */
  getMaxCharBounds(context: Graphics): Rectangle2D {
    return this.font.getMaxCharBounds(this.myFRC(context));
  }
  myFRC(context: Graphics): FontRenderContext {
    if (context instanceof Graphics2D) {
      return (context).getFontRenderContext();
    }
    return FontMetrics.DEFAULT_FRC;
  }
  /**
   * Returns a representation of this {@code FontMetrics}
   * object's values as a {@code String}.
   * @return    a {@code String} representation of this
   * {@code FontMetrics} object.
   */
  toString(): string {
    return $J.getClass(this).getName() + '[font=' + $J.str(this.getFont()) + 'ascent=' + this.getAscent() + ', descent=' + this.getDescent() + ', height=' + this.getHeight() + ']';
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.FontMetrics', 'initIDs', this, $a);
  }
  static $clinit() {
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      FontMetrics.initIDs();
    }
    FontMetrics.DEFAULT_FRC = new FontRenderContext()._FontRenderContext$AffineTransform$boolean$boolean(null, false, false);
  }
}

$J.define(FontMetrics, 'java.awt.FontMetrics', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.Font': '_FontMetrics' }, meths: { 'getStringBounds(java.text.CharacterIterator,int,int,java.awt.Graphics)': 'getStringBounds$CharacterIterator$int$int$Graphics', 'getStringBounds(char[],int,int,java.awt.Graphics)': 'getStringBounds$charArr$int$int$Graphics', 'getStringBounds(java.lang.String,int,int,java.awt.Graphics)': 'getStringBounds$String$int$int$Graphics', 'getStringBounds(java.lang.String,java.awt.Graphics)': 'getStringBounds$String$Graphics', 'getLineMetrics(java.text.CharacterIterator,int,int,java.awt.Graphics)': 'getLineMetrics$CharacterIterator$int$int$Graphics', 'getLineMetrics(char[],int,int,java.awt.Graphics)': 'getLineMetrics$charArr$int$int$Graphics', 'getLineMetrics(java.lang.String,int,int,java.awt.Graphics)': 'getLineMetrics$String$int$int$Graphics', 'getLineMetrics(java.lang.String,java.awt.Graphics)': 'getLineMetrics$String$Graphics', 'charWidth(char)': 'charWidth$char', 'charWidth(int)': 'charWidth$int' }, clinit: true, lazy: ['DEFAULT_FRC'] });
$J.module(() => {
  Graphics2D = $J.load('java.awt.Graphics2D');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  FontRenderContext = $J.load('java.awt.font.FontRenderContext');
});
