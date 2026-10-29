// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Graphics.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, JString, NullPointerException } from '../../../jre/index.ts';

/**
 * The {@code Graphics} class is the abstract base class for
 * all graphics contexts that allow an application to draw onto
 * components that are realized on various devices, as well as
 * onto off-screen images.
 * <p>
 * A {@code Graphics} object encapsulates state information needed
 * for the basic rendering operations that Java supports.  This
 * state information includes the following properties:
 *
 * <ul>
 * <li>The {@code Component} object on which to draw.
 * <li>A translation origin for rendering and clipping coordinates.
 * <li>The current clip.
 * <li>The current color.
 * <li>The current font.
 * <li>The current logical pixel operation function (XOR or Paint).
 * <li>The current XOR alternation color
 *     (see {@link Graphics#setXORMode}).
 * </ul>
 * <p>
 * Coordinates are infinitely thin and lie between the pixels of the
 * output device.
 * Operations that draw the outline of a figure operate by traversing
 * an infinitely thin path between pixels with a pixel-sized pen that hangs
 * down and to the right of the anchor point on the path.
 * Operations that fill a figure operate by filling the interior
 * of that infinitely thin path.
 * Operations that render horizontal text render the ascending
 * portion of character glyphs entirely above the baseline coordinate.
 * <p>
 * The graphics pen hangs down and to the right from the path it traverses.
 * This has the following implications:
 * <ul>
 * <li>If you draw a figure that covers a given rectangle, that
 * figure occupies one extra row of pixels on the right and bottom edges
 * as compared to filling a figure that is bounded by that same rectangle.
 * <li>If you draw a horizontal line along the same <i>y</i> coordinate as
 * the baseline of a line of text, that line is drawn entirely below
 * the text, except for any descenders.
 * </ul><p>
 * All coordinates that appear as arguments to the methods of this
 * {@code Graphics} object are considered relative to the
 * translation origin of this {@code Graphics} object prior to
 * the invocation of the method.
 * <p>
 * All rendering operations modify only pixels which lie within the
 * area bounded by the current clip, which is specified by a {@link Shape}
 * in user space and is controlled by the program using the
 * {@code Graphics} object.  This <i>user clip</i>
 * is transformed into device space and combined with the
 * <i>device clip</i>, which is defined by the visibility of windows and
 * device extents.  The combination of the user clip and device clip
 * defines the <i>composite clip</i>, which determines the final clipping
 * region.  The user clip cannot be modified by the rendering
 * system to reflect the resulting composite clip. The user clip can only
 * be changed through the {@code setClip} or {@code clipRect}
 * methods.
 * All drawing or writing is done in the current color,
 * using the current paint mode, and in the current font.
 *
 * @author      Sami Shaio
 * @author      Arthur van Hoff
 * @see     java.awt.Component
 * @see     java.awt.Graphics#clipRect(int, int, int, int)
 * @see     java.awt.Graphics#setColor(java.awt.Color)
 * @see     java.awt.Graphics#setPaintMode()
 * @see     java.awt.Graphics#setXORMode(java.awt.Color)
 * @see     java.awt.Graphics#setFont(java.awt.Font)
 * @since       1.0
 */
export class Graphics extends JObject {
  /**
   * Constructs a new {@code Graphics} object.
   * This constructor is the default constructor for a graphics
   * context.
   * <p>
   * Since {@code Graphics} is an abstract class, applications
   * cannot call this constructor directly. Graphics contexts are
   * obtained from other graphics contexts or are created by calling
   * {@code getGraphics} on a component.
   * @see        java.awt.Graphics#create()
   * @see        java.awt.Component#getGraphics
   */
  _Graphics(): this {
    return this;
  }
  /**
   * Creates a new {@code Graphics} object based on this
   * {@code Graphics} object, but with a new translation and clip area.
   * The new {@code Graphics} object has its origin
   * translated to the specified point (<i>x</i>,&nbsp;<i>y</i>).
   * Its clip area is determined by the intersection of the original
   * clip area with the specified rectangle.  The arguments are all
   * interpreted in the coordinate system of the original
   * {@code Graphics} object. The new graphics context is
   * identical to the original, except in two respects:
   *
   * <ul>
   * <li>
   * The new graphics context is translated by (<i>x</i>,&nbsp;<i>y</i>).
   * That is to say, the point ({@code 0},&nbsp;{@code 0}) in the
   * new graphics context is the same as (<i>x</i>,&nbsp;<i>y</i>) in
   * the original graphics context.
   * <li>
   * The new graphics context has an additional clipping rectangle, in
   * addition to whatever (translated) clipping rectangle it inherited
   * from the original graphics context. The origin of the new clipping
   * rectangle is at ({@code 0},&nbsp;{@code 0}), and its size
   * is specified by the {@code width} and {@code height}
   * arguments.
   * </ul>
   *
   * @param      x   the <i>x</i> coordinate.
   * @param      y   the <i>y</i> coordinate.
   * @param      width   the width of the clipping rectangle.
   * @param      height   the height of the clipping rectangle.
   * @return     a new graphics context.
   * @see        java.awt.Graphics#translate
   * @see        java.awt.Graphics#clipRect
   */
  create$int$int$int$int(x: number, y: number, width: number, height: number): Graphics {
    let g = this.create$();
    if (g == null) {
      return null;
    }
    g.translate$int$int(x, y);
    g.clipRect(0, 0, width, height);
    return g;
  }
  /**
   * Gets the font metrics of the current font.
   * @return    the font metrics of this graphics
   *                    context's current font.
   * @see       java.awt.Graphics#getFont
   * @see       java.awt.FontMetrics
   * @see       java.awt.Graphics#getFontMetrics(Font)
   */
  getFontMetrics$(): FontMetrics {
    return this.getFontMetrics$Font(this.getFont());
  }
  /**
   * Draws the outline of the specified rectangle.
   * The left and right edges of the rectangle are at
   * {@code x} and <code>x&nbsp;+&nbsp;width</code>.
   * The top and bottom edges are at
   * {@code y} and <code>y&nbsp;+&nbsp;height</code>.
   * The rectangle is drawn using the graphics context's current color.
   * @param         x   the <i>x</i> coordinate
   *                         of the rectangle to be drawn.
   * @param         y   the <i>y</i> coordinate
   *                         of the rectangle to be drawn.
   * @param         width   the width of the rectangle to be drawn.
   * @param         height   the height of the rectangle to be drawn.
   * @see          java.awt.Graphics#fillRect
   * @see          java.awt.Graphics#clearRect
   */
  drawRect(x: number, y: number, width: number, height: number): void {
    if ((width < 0) || (height < 0)) {
      return;
    }
    if (height === 0 || width === 0) {
      this.drawLine(x, y, (x + width) | 0, (y + height) | 0);
    } else {
      this.drawLine(x, y, (x + width - 1) | 0, y);
      this.drawLine((x + width) | 0, y, (x + width) | 0, (y + height - 1) | 0);
      this.drawLine((x + width) | 0, (y + height) | 0, (x + 1) | 0, (y + height) | 0);
      this.drawLine(x, (y + height) | 0, x, (y + 1) | 0);
    }
  }
  /**
   * Draws a 3-D highlighted outline of the specified rectangle.
   * The edges of the rectangle are highlighted so that they
   * appear to be beveled and lit from the upper left corner.
   * <p>
   * The colors used for the highlighting effect are determined
   * based on the current color.
   * The resulting rectangle covers an area that is
   * <code>width&nbsp;+&nbsp;1</code> pixels wide
   * by <code>height&nbsp;+&nbsp;1</code> pixels tall.
   * @param       x the <i>x</i> coordinate of the rectangle to be drawn.
   * @param       y the <i>y</i> coordinate of the rectangle to be drawn.
   * @param       width the width of the rectangle to be drawn.
   * @param       height the height of the rectangle to be drawn.
   * @param       raised a boolean that determines whether the rectangle
   *                      appears to be raised above the surface
   *                      or sunk into the surface.
   * @see         java.awt.Graphics#fill3DRect
   */
  draw3DRect(x: number, y: number, width: number, height: number, raised: boolean): void {
    let c = this.getColor();
    let brighter = c.brighter();
    let darker = c.darker();
    this.setColor(raised ? brighter : darker);
    this.drawLine(x, y, x, (y + height) | 0);
    this.drawLine((x + 1) | 0, y, (x + width - 1) | 0, y);
    this.setColor(raised ? darker : brighter);
    this.drawLine((x + 1) | 0, (y + height) | 0, (x + width) | 0, (y + height) | 0);
    this.drawLine((x + width) | 0, y, (x + width) | 0, (y + height - 1) | 0);
    this.setColor(c);
  }
  /**
   * Paints a 3-D highlighted rectangle filled with the current color.
   * The edges of the rectangle will be highlighted so that it appears
   * as if the edges were beveled and lit from the upper left corner.
   * The colors used for the highlighting effect will be determined from
   * the current color.
   * @param       x the <i>x</i> coordinate of the rectangle to be filled.
   * @param       y the <i>y</i> coordinate of the rectangle to be filled.
   * @param       width the width of the rectangle to be filled.
   * @param       height the height of the rectangle to be filled.
   * @param       raised a boolean value that determines whether the
   *                      rectangle appears to be raised above the surface
   *                      or etched into the surface.
   * @see         java.awt.Graphics#draw3DRect
   */
  fill3DRect(x: number, y: number, width: number, height: number, raised: boolean): void {
    let c = this.getColor();
    let brighter = c.brighter();
    let darker = c.darker();
    if (!raised) {
      this.setColor(darker);
    }
    this.fillRect((x + 1) | 0, (y + 1) | 0, (width - 2) | 0, (height - 2) | 0);
    this.setColor(raised ? brighter : darker);
    this.drawLine(x, y, x, (y + height - 1) | 0);
    this.drawLine((x + 1) | 0, y, (x + width - 2) | 0, y);
    this.setColor(raised ? darker : brighter);
    this.drawLine((x + 1) | 0, (y + height - 1) | 0, (x + width - 1) | 0, (y + height - 1) | 0);
    this.drawLine((x + width - 1) | 0, y, (x + width - 1) | 0, (y + height - 2) | 0);
    this.setColor(c);
  }
  /**
   * Draws the outline of a polygon defined by the specified
   * {@code Polygon} object.
   * @param        p the polygon to draw.
   * @see          java.awt.Graphics#fillPolygon
   * @see          java.awt.Graphics#drawPolyline
   */
  drawPolygon$Polygon(p: Polygon): void {
    this.drawPolygon$intArr$intArr$int(p.xpoints, p.ypoints, p.npoints);
  }
  /**
   * Fills the polygon defined by the specified Polygon object with
   * the graphics context's current color.
   * <p>
   * The area inside the polygon is defined using an
   * even-odd fill rule, also known as the alternating rule.
   * @param        p the polygon to fill.
   * @see          java.awt.Graphics#drawPolygon(int[], int[], int)
   */
  fillPolygon$Polygon(p: Polygon): void {
    this.fillPolygon$intArr$intArr$int(p.xpoints, p.ypoints, p.npoints);
  }
  /**
   * Draws the text given by the specified character array, using this
   * graphics context's current font and color. The baseline of the
   * first character is at position (<i>x</i>,&nbsp;<i>y</i>) in this
   * graphics context's coordinate system.
   * @param data the array of characters to be drawn
   * @param offset the start offset in the data
   * @param length the number of characters to be drawn
   * @param x the <i>x</i> coordinate of the baseline of the text
   * @param y the <i>y</i> coordinate of the baseline of the text
   * @throws NullPointerException if {@code data} is {@code null}.
   * @throws IndexOutOfBoundsException if {@code offset} or
   * {@code length} is less than zero, or
   * {@code offset+length} is greater than the length of the
   * {@code data} array.
   * @see         java.awt.Graphics#drawBytes
   * @see         java.awt.Graphics#drawString
   */
  drawChars(data: number[], offset: number, length: number, x: number, y: number): void {
    this.drawString$String$int$int(JString.newString(data, offset, length), x, y);
  }
  /**
   * Draws the text given by the specified byte array, using this
   * graphics context's current font and color. The baseline of the
   * first character is at position (<i>x</i>,&nbsp;<i>y</i>) in this
   * graphics context's coordinate system.
   * <p>
   * Use of this method is not recommended as each byte is interpreted
   * as a Unicode code point in the range 0 to 255, and so can only be
   * used to draw Latin characters in that range.
   * @param data the data to be drawn
   * @param offset the start offset in the data
   * @param length the number of bytes that are drawn
   * @param x the <i>x</i> coordinate of the baseline of the text
   * @param y the <i>y</i> coordinate of the baseline of the text
   * @throws NullPointerException if {@code data} is {@code null}.
   * @throws IndexOutOfBoundsException if {@code offset} or
   * {@code length} is less than zero, or {@code offset+length}
   * is greater than the length of the {@code data} array.
   * @see         java.awt.Graphics#drawChars
   * @see         java.awt.Graphics#drawString
   */
  drawBytes(data: number[], offset: number, length: number, x: number, y: number): void {
    this.drawString$String$int$int(JString.newString(data, 0, offset, length), x, y);
  }
  /**
   * Disposes of this graphics context once it is no longer referenced.
   *
   * @deprecated Finalization has been deprecated for removal.  See
   * {@link java.lang.Object#finalize} for background information and details
   * about migration options.
   *
   * @see #dispose
   */
  finalize(): void {
    this.dispose();
  }
  /**
   * Returns a {@code String} object representing this
   *                        {@code Graphics} object's value.
   * @return       a string representation of this graphics context.
   */
  toString(): string {
    return $J.getClass(this).getName() + '[font=' + $J.str(this.getFont()) + ',color=' + $J.str(this.getColor()) + ']';
  }
  /**
   * Returns the bounding rectangle of the current clipping area.
   * @return      the bounding rectangle of the current clipping area
   *              or {@code null} if no clip is set.
   * @deprecated As of JDK version 1.1,
   * replaced by {@code getClipBounds()}.
   */
  getClipRect(): Rectangle {
    return this.getClipBounds$();
  }
  /**
   * Returns true if the specified rectangular area might intersect
   * the current clipping area.
   * The coordinates of the specified rectangular area are in the
   * user coordinate space and are relative to the coordinate
   * system origin of this graphics context.
   * This method may use an algorithm that calculates a result quickly
   * but which sometimes might return true even if the specified
   * rectangular area does not intersect the clipping area.
   * The specific algorithm employed may thus trade off accuracy for
   * speed, but it will never return false unless it can guarantee
   * that the specified rectangular area does not intersect the
   * current clipping area.
   * The clipping area used by this method can represent the
   * intersection of the user clip as specified through the clip
   * methods of this graphics context as well as the clipping
   * associated with the device or image bounds and window visibility.
   *
   * @param x the x coordinate of the rectangle to test against the clip
   * @param y the y coordinate of the rectangle to test against the clip
   * @param width the width of the rectangle to test against the clip
   * @param height the height of the rectangle to test against the clip
   * @return {@code true} if the specified rectangle intersects
   *         the bounds of the current clip; {@code false}
   *         otherwise.
   */
  hitClip(x: number, y: number, width: number, height: number): boolean {
    let clipRect = this.getClipBounds$();
    if (clipRect == null) {
      return true;
    }
    return clipRect.intersects$double$double$double$double(x, y, width, height);
  }
  /**
   * Returns the bounding rectangle of the current clipping area.
   * The coordinates in the rectangle are relative to the coordinate
   * system origin of this graphics context.  This method differs
   * from {@link #getClipBounds() getClipBounds} in that an existing
   * rectangle is used instead of allocating a new one.
   * This method refers to the user clip, which is independent of the
   * clipping associated with device bounds and window visibility.
   *  If no clip has previously been set, or if the clip has been
   * cleared using {@code setClip(null)}, this method returns the
   * specified {@code Rectangle}.
   * @param  r    the rectangle where the current clipping area is
   *              copied to.  Any current values in this rectangle are
   *              overwritten.
   * @return      the bounding rectangle of the current clipping area.
   */
  getClipBounds$Rectangle(r: Rectangle): Rectangle {
    let clipRect = this.getClipBounds$();
    if (clipRect != null) {
      r.x_ = clipRect.x_;
      r.y_ = clipRect.y_;
      r.width_ = clipRect.width_;
      r.height_ = clipRect.height_;
    } else if (r == null) {
      throw new NullPointerException('null rectangle parameter');
    }
    return r;
  }
}

$J.define(Graphics, 'java.awt.Graphics', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Graphics' }, meths: { 'getClipBounds(java.awt.Rectangle)': 'getClipBounds$Rectangle', 'drawImage(java.awt.Image,int,int,int,int,int,int,int,int,java.awt.Color,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$int$int$int$int$int$int$Color$ImageObserver', 'drawImage(java.awt.Image,int,int,int,int,int,int,int,int,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver', 'drawImage(java.awt.Image,int,int,int,int,java.awt.Color,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$int$int$Color$ImageObserver', 'drawImage(java.awt.Image,int,int,java.awt.Color,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$Color$ImageObserver', 'drawImage(java.awt.Image,int,int,int,int,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$int$int$ImageObserver', 'drawImage(java.awt.Image,int,int,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$ImageObserver', 'drawString(java.text.AttributedCharacterIterator,int,int)': 'drawString$AttributedCharacterIterator$int$int', 'drawString(java.lang.String,int,int)': 'drawString$String$int$int', 'fillPolygon(java.awt.Polygon)': 'fillPolygon$Polygon', 'fillPolygon(int[],int[],int)': 'fillPolygon$intArr$intArr$int', 'drawPolygon(java.awt.Polygon)': 'drawPolygon$Polygon', 'drawPolygon(int[],int[],int)': 'drawPolygon$intArr$intArr$int', 'setClip(java.awt.Shape)': 'setClip$Shape', 'setClip(int,int,int,int)': 'setClip$int$int$int$int', 'getClipBounds()': 'getClipBounds$', 'getFontMetrics(java.awt.Font)': 'getFontMetrics$Font', 'getFontMetrics()': 'getFontMetrics$', 'translate(int,int)': 'translate$int$int', 'create(int,int,int,int)': 'create$int$int$int$int', 'create()': 'create$' } });
