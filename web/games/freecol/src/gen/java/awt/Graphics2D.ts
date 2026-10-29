// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Graphics2D.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../jre/index.ts';
import { Graphics } from './Graphics.ts';

/**
 * This {@code Graphics2D} class extends the
 * {@link Graphics} class to provide more sophisticated
 * control over geometry, coordinate transformations, color management,
 * and text layout.  This is the fundamental class for rendering
 * 2-dimensional shapes, text and images on the  Java(tm) platform.
 *
 * <h2>Coordinate Spaces</h2>
 * All coordinates passed to a {@code Graphics2D} object are specified
 * in a device-independent coordinate system called User Space, which is
 * used by applications.  The {@code Graphics2D} object contains
 * an {@link AffineTransform} object as part of its rendering state
 * that defines how to convert coordinates from user space to
 * device-dependent coordinates in Device Space.
 * <p>
 * Coordinates in device space usually refer to individual device pixels
 * and are aligned on the infinitely thin gaps between these pixels.
 * Some {@code Graphics2D} objects can be used to capture rendering
 * operations for storage into a graphics metafile for playback on a
 * concrete device of unknown physical resolution at a later time.  Since
 * the resolution might not be known when the rendering operations are
 * captured, the {@code Graphics2D Transform} is set up
 * to transform user coordinates to a virtual device space that
 * approximates the expected resolution of the target device. Further
 * transformations might need to be applied at playback time if the
 * estimate is incorrect.
 * <p>
 * Some of the operations performed by the rendering attribute objects
 * occur in the device space, but all {@code Graphics2D} methods take
 * user space coordinates.
 * <p>
 * Every {@code Graphics2D} object is associated with a target that
 * defines where rendering takes place. A
 * {@link GraphicsConfiguration} object defines the characteristics
 * of the rendering target, such as pixel format and resolution.
 * The same rendering target is used throughout the life of a
 * {@code Graphics2D} object.
 * <p>
 * When creating a {@code Graphics2D} object,  the
 * {@code GraphicsConfiguration}
 * specifies the <a id="deftransform">default transform</a> for
 * the target of the {@code Graphics2D} (a
 * {@link Component} or {@link Image}).  This default transform maps the
 * user space coordinate system to screen and printer device coordinates
 * such that the origin maps to the upper left hand corner of the
 * target region of the device with increasing X coordinates extending
 * to the right and increasing Y coordinates extending downward.
 * The scaling of the default transform is set to identity for those devices
 * that are close to 72 dpi, such as screen devices.
 * The scaling of the default transform is set to approximately 72 user
 * space coordinates per square inch for high resolution devices, such as
 * printers.  For image buffers, the default transform is the
 * {@code Identity} transform.
 *
 * <h2>Rendering Process</h2>
 * The Rendering Process can be broken down into four phases that are
 * controlled by the {@code Graphics2D} rendering attributes.
 * The renderer can optimize many of these steps, either by caching the
 * results for future calls, by collapsing multiple virtual steps into
 * a single operation, or by recognizing various attributes as common
 * simple cases that can be eliminated by modifying other parts of the
 * operation.
 * <p>
 * The steps in the rendering process are:
 * <ol>
 * <li>
 * Determine what to render.
 * <li>
 * Constrain the rendering operation to the current {@code Clip}.
 * The {@code Clip} is specified by a {@link Shape} in user
 * space and is controlled by the program using the various clip
 * manipulation methods of {@code Graphics} and
 * {@code Graphics2D}.  This <i>user clip</i>
 * is transformed into device space by the current
 * {@code Transform} and combined with the
 * <i>device clip</i>, which is defined by the visibility of windows and
 * device extents.  The combination of the user clip and device clip
 * defines the <i>composite clip</i>, which determines the final clipping
 * region.  The user clip is not modified by the rendering
 * system to reflect the resulting composite clip.
 * <li>
 * Determine what colors to render.
 * <li>
 * Apply the colors to the destination drawing surface using the current
 * {@link Composite} attribute in the {@code Graphics2D} context.
 * </ol>
 * <br>
 * The three types of rendering operations, along with details of each
 * of their particular rendering processes are:
 * <ol>
 * <li>
 * <b><a id="rendershape">{@code Shape} operations</a></b>
 * <ol>
 * <li>
 * If the operation is a {@code draw(Shape)} operation, then
 * the  {@link Stroke#createStrokedShape(Shape) createStrokedShape}
 * method on the current {@link Stroke} attribute in the
 * {@code Graphics2D} context is used to construct a new
 * {@code Shape} object that contains the outline of the specified
 * {@code Shape}.
 * <li>
 * The {@code Shape} is transformed from user space to device space
 * using the current {@code Transform}
 * in the {@code Graphics2D} context.
 * <li>
 * The outline of the {@code Shape} is extracted using the
 * {@link Shape#getPathIterator(AffineTransform) getPathIterator} method of
 * {@code Shape}, which returns a
 * {@link java.awt.geom.PathIterator PathIterator}
 * object that iterates along the boundary of the {@code Shape}.
 * <li>
 * If the {@code Graphics2D} object cannot handle the curved segments
 * that the {@code PathIterator} object returns then it can call the
 * alternate
 * {@link Shape#getPathIterator(AffineTransform, double) getPathIterator}
 * method of {@code Shape}, which flattens the {@code Shape}.
 * <li>
 * The current {@link Paint} in the {@code Graphics2D} context
 * is queried for a {@link PaintContext}, which specifies the
 * colors to render in device space.
 * </ol>
 * <li>
 * <b><a id=rendertext>Text operations</a></b>
 * <ol>
 * <li>
 * The following steps are used to determine the set of glyphs required
 * to render the indicated {@code String}:
 * <ol>
 * <li>
 * If the argument is a {@code String}, then the current
 * {@code Font} in the {@code Graphics2D} context is asked to
 * convert the Unicode characters in the {@code String} into a set of
 * glyphs for presentation with whatever basic layout and shaping
 * algorithms the font implements.
 * <li>
 * If the argument is an
 * {@link AttributedCharacterIterator},
 * the iterator is asked to convert itself to a
 * {@link java.awt.font.TextLayout TextLayout}
 * using its embedded font attributes. The {@code TextLayout}
 * implements more sophisticated glyph layout algorithms that
 * perform Unicode bi-directional layout adjustments automatically
 * for multiple fonts of differing writing directions.
 * <li>
 * If the argument is a
 * {@link GlyphVector}, then the
 * {@code GlyphVector} object already contains the appropriate
 * font-specific glyph codes with explicit coordinates for the position of
 * each glyph.
 * </ol>
 * <li>
 * The current {@code Font} is queried to obtain outlines for the
 * indicated glyphs.  These outlines are treated as shapes in user space
 * relative to the position of each glyph that was determined in step 1.
 * <li>
 * The character outlines are filled as indicated above
 * under <a href="#rendershape">{@code Shape} operations</a>.
 * <li>
 * The current {@code Paint} is queried for a
 * {@code PaintContext}, which specifies
 * the colors to render in device space.
 * </ol>
 * <li>
 * <b><a id= renderingimage>{@code Image} Operations</a></b>
 * <ol>
 * <li>
 * The region of interest is defined by the bounding box of the source
 * {@code Image}.
 * This bounding box is specified in Image Space, which is the
 * {@code Image} object's local coordinate system.
 * <li>
 * If an {@code AffineTransform} is passed to
 * {@link #drawImage(java.awt.Image, java.awt.geom.AffineTransform, java.awt.image.ImageObserver) drawImage(Image, AffineTransform, ImageObserver)},
 * the {@code AffineTransform} is used to transform the bounding
 * box from image space to user space. If no {@code AffineTransform}
 * is supplied, the bounding box is treated as if it is already in user space.
 * <li>
 * The bounding box of the source {@code Image} is transformed from user
 * space into device space using the current {@code Transform}.
 * Note that the result of transforming the bounding box does not
 * necessarily result in a rectangular region in device space.
 * <li>
 * The {@code Image} object determines what colors to render,
 * sampled according to the source to destination
 * coordinate mapping specified by the current {@code Transform} and the
 * optional image transform.
 * </ol>
 * </ol>
 *
 * <h2>Default Rendering Attributes</h2>
 * The default values for the {@code Graphics2D} rendering attributes are:
 * <dl>
 * <dt><i>{@code Paint}</i>
 * <dd>The color of the {@code Component}.
 * <dt><i>{@code Font}</i>
 * <dd>The {@code Font} of the {@code Component}.
 * <dt><i>{@code Stroke}</i>
 * <dd>A square pen with a linewidth of 1, no dashing, miter segment joins
 * and square end caps.
 * <dt><i>{@code Transform}</i>
 * <dd>The
 * {@link GraphicsConfiguration#getDefaultTransform() getDefaultTransform}
 * for the {@code GraphicsConfiguration} of the {@code Component}.
 * <dt><i>{@code Composite}</i>
 * <dd>The {@link AlphaComposite#SRC_OVER} rule.
 * <dt><i>{@code Clip}</i>
 * <dd>No rendering {@code Clip}, the output is clipped to the
 * {@code Component}.
 * </dl>
 *
 * <h2>Rendering Compatibility Issues</h2>
 * The JDK(tm) 1.1 rendering model is based on a pixelization model
 * that specifies that coordinates
 * are infinitely thin, lying between the pixels.  Drawing operations are
 * performed using a one-pixel wide pen that fills the
 * pixel below and to the right of the anchor point on the path.
 * The JDK 1.1 rendering model is consistent with the
 * capabilities of most of the existing class of platform
 * renderers that need  to resolve integer coordinates to a
 * discrete pen that must fall completely on a specified number of pixels.
 * <p>
 * The Java 2D(tm) (Java(tm) 2 platform) API supports antialiasing renderers.
 * A pen with a width of one pixel does not need to fall
 * completely on pixel N as opposed to pixel N+1.  The pen can fall
 * partially on both pixels. It is not necessary to choose a bias
 * direction for a wide pen since the blending that occurs along the
 * pen traversal edges makes the sub-pixel position of the pen
 * visible to the user.  On the other hand, when antialiasing is
 * turned off by setting the
 * {@link RenderingHints#KEY_ANTIALIASING KEY_ANTIALIASING} hint key
 * to the
 * {@link RenderingHints#VALUE_ANTIALIAS_OFF VALUE_ANTIALIAS_OFF}
 * hint value, the renderer might need
 * to apply a bias to determine which pixel to modify when the pen
 * is straddling a pixel boundary, such as when it is drawn
 * along an integer coordinate in device space.  While the capabilities
 * of an antialiasing renderer make it no longer necessary for the
 * rendering model to specify a bias for the pen, it is desirable for the
 * antialiasing and non-antialiasing renderers to perform similarly for
 * the common cases of drawing one-pixel wide horizontal and vertical
 * lines on the screen.  To ensure that turning on antialiasing by
 * setting the
 * {@link RenderingHints#KEY_ANTIALIASING KEY_ANTIALIASING} hint
 * key to
 * {@link RenderingHints#VALUE_ANTIALIAS_ON VALUE_ANTIALIAS_ON}
 * does not cause such lines to suddenly become twice as wide and half
 * as opaque, it is desirable to have the model specify a path for such
 * lines so that they completely cover a particular set of pixels to help
 * increase their crispness.
 * <p>
 * Java 2D API maintains compatibility with JDK 1.1 rendering
 * behavior, such that legacy operations and existing renderer
 * behavior is unchanged under Java 2D API.  Legacy
 * methods that map onto general {@code draw} and
 * {@code fill} methods are defined, which clearly indicates
 * how {@code Graphics2D} extends {@code Graphics} based
 * on settings of {@code Stroke} and {@code Transform}
 * attributes and rendering hints.  The definition
 * performs identically under default attribute settings.
 * For example, the default {@code Stroke} is a
 * {@code BasicStroke} with a width of 1 and no dashing and the
 * default Transform for screen drawing is an Identity transform.
 * <p>
 * The following two rules provide predictable rendering behavior whether
 * aliasing or antialiasing is being used.
 * <ul>
 * <li> Device coordinates are defined to be between device pixels which
 * avoids any inconsistent results between aliased and antialiased
 * rendering.  If coordinates were defined to be at a pixel's center, some
 * of the pixels covered by a shape, such as a rectangle, would only be
 * half covered.
 * With aliased rendering, the half covered pixels would either be
 * rendered inside the shape or outside the shape.  With anti-aliased
 * rendering, the pixels on the entire edge of the shape would be half
 * covered.  On the other hand, since coordinates are defined to be
 * between pixels, a shape like a rectangle would have no half covered
 * pixels, whether or not it is rendered using antialiasing.
 * <li> Lines and paths stroked using the {@code BasicStroke}
 * object may be "normalized" to provide consistent rendering of the
 * outlines when positioned at various points on the drawable and
 * whether drawn with aliased or antialiased rendering.  This
 * normalization process is controlled by the
 * {@link RenderingHints#KEY_STROKE_CONTROL KEY_STROKE_CONTROL} hint.
 * The exact normalization algorithm is not specified, but the goals
 * of this normalization are to ensure that lines are rendered with
 * consistent visual appearance regardless of how they fall on the
 * pixel grid and to promote more solid horizontal and vertical
 * lines in antialiased mode so that they resemble their non-antialiased
 * counterparts more closely.  A typical normalization step might
 * promote antialiased line endpoints to pixel centers to reduce the
 * amount of blending or adjust the subpixel positioning of
 * non-antialiased lines so that the floating point line widths
 * round to even or odd pixel counts with equal likelihood.  This
 * process can move endpoints by up to half a pixel (usually towards
 * positive infinity along both axes) to promote these consistent
 * results.
 * </ul>
 * <p>
 * The following definitions of general legacy methods
 * perform identically to previously specified behavior under default
 * attribute settings:
 * <ul>
 * <li>
 * For {@code fill} operations, including {@code fillRect},
 * {@code fillRoundRect}, {@code fillOval},
 * {@code fillArc}, {@code fillPolygon}, and
 * {@code clearRect}, {@link #fill(Shape) fill} can now be called
 * with the desired {@code Shape}.  For example, when filling a
 * rectangle:
 * <pre>
 * fill(new Rectangle(x, y, w, h));
 * </pre>
 * is called.
 *
 * <li>
 * Similarly, for draw operations, including {@code drawLine},
 * {@code drawRect}, {@code drawRoundRect},
 * {@code drawOval}, {@code drawArc}, {@code drawPolyline},
 * and {@code drawPolygon}, {@link #draw(Shape) draw} can now be
 * called with the desired {@code Shape}.  For example, when drawing a
 * rectangle:
 * <pre>
 * draw(new Rectangle(x, y, w, h));
 * </pre>
 * is called.
 *
 * <li>
 * The {@code draw3DRect} and {@code fill3DRect} methods were
 * implemented in terms of the {@code drawLine} and
 * {@code fillRect} methods in the {@code Graphics} class which
 * would predicate their behavior upon the current {@code Stroke}
 * and {@code Paint} objects in a {@code Graphics2D} context.
 * This class overrides those implementations with versions that use
 * the current {@code Color} exclusively, overriding the current
 * {@code Paint} and which uses {@code fillRect} to describe
 * the exact same behavior as the preexisting methods regardless of the
 * setting of the current {@code Stroke}.
 * </ul>
 * The {@code Graphics} class defines only the {@code setColor}
 * method to control the color to be painted.  Since the Java 2D API extends
 * the {@code Color} object to implement the new {@code Paint}
 * interface, the existing
 * {@code setColor} method is now a convenience method for setting the
 * current {@code Paint} attribute to a {@code Color} object.
 * {@code setColor(c)} is equivalent to {@code setPaint(c)}.
 * <p>
 * The {@code Graphics} class defines two methods for controlling
 * how colors are applied to the destination.
 * <ol>
 * <li>
 * The {@code setPaintMode} method is implemented as a convenience
 * method to set the default {@code Composite}, equivalent to
 * {@code setComposite(new AlphaComposite.SrcOver)}.
 * <li>
 * The {@code setXORMode(Color xorcolor)} method is implemented
 * as a convenience method to set a special {@code Composite} object that
 * ignores the {@code Alpha} components of source colors and sets the
 * destination color to the value:
 * <pre>
 * dstpixel = (PixelOf(srccolor) ^ PixelOf(xorcolor) ^ dstpixel);
 * </pre>
 * </ol>
 *
 * @author Jim Graham
 * @see java.awt.RenderingHints
 */
export class Graphics2D extends Graphics {
  /**
   * Constructs a new {@code Graphics2D} object.  Since
   * {@code Graphics2D} is an abstract class, and since it must be
   * customized by subclasses for different output devices,
   * {@code Graphics2D} objects cannot be created directly.
   * Instead, {@code Graphics2D} objects must be obtained from another
   * {@code Graphics2D} object, created by a
   * {@code Component}, or obtained from images such as
   * {@link BufferedImage} objects.
   * @see java.awt.Component#getGraphics
   * @see java.awt.Graphics#create
   */
  _Graphics2D(): this {
    this._Graphics();
    return this;
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
   * by <code>height&nbsp;+&nbsp;1</code> pixels tall.  This method
   * uses the current {@code Color} exclusively and ignores
   * the current {@code Paint}.
   * @param x the x coordinate of the rectangle to be drawn.
   * @param y the y coordinate of the rectangle to be drawn.
   * @param width the width of the rectangle to be drawn.
   * @param height the height of the rectangle to be drawn.
   * @param raised a boolean that determines whether the rectangle
   *                      appears to be raised above the surface
   *                      or sunk into the surface.
   * @see         java.awt.Graphics#fill3DRect
   */
  draw3DRect(x: number, y: number, width: number, height: number, raised: boolean): void {
    let p = this.getPaint();
    let c = this.getColor();
    let brighter = c.brighter();
    let darker = c.darker();
    this.setColor(raised ? brighter : darker);
    this.fillRect(x, y, 1, (height + 1) | 0);
    this.fillRect((x + 1) | 0, y, (width - 1) | 0, 1);
    this.setColor(raised ? darker : brighter);
    this.fillRect((x + 1) | 0, (y + height) | 0, width, 1);
    this.fillRect((x + width) | 0, y, 1, height);
    this.setPaint(p);
  }
  /**
   * Paints a 3-D highlighted rectangle filled with the current color.
   * The edges of the rectangle are highlighted so that it appears
   * as if the edges were beveled and lit from the upper left corner.
   * The colors used for the highlighting effect and for filling are
   * determined from the current {@code Color}.  This method uses
   * the current {@code Color} exclusively and ignores the current
   * {@code Paint}.
   * @param x the x coordinate of the rectangle to be filled.
   * @param y the y coordinate of the rectangle to be filled.
   * @param       width the width of the rectangle to be filled.
   * @param       height the height of the rectangle to be filled.
   * @param       raised a boolean value that determines whether the
   *                      rectangle appears to be raised above the surface
   *                      or etched into the surface.
   * @see         java.awt.Graphics#draw3DRect
   */
  fill3DRect(x: number, y: number, width: number, height: number, raised: boolean): void {
    let p = this.getPaint();
    let c = this.getColor();
    let brighter = c.brighter();
    let darker = c.darker();
    if (!raised) {
      this.setColor(darker);
    } else if (p !== c) {
      this.setColor(c);
    }
    this.fillRect((x + 1) | 0, (y + 1) | 0, (width - 2) | 0, (height - 2) | 0);
    this.setColor(raised ? brighter : darker);
    this.fillRect(x, y, 1, height);
    this.fillRect((x + 1) | 0, y, (width - 2) | 0, 1);
    this.setColor(raised ? darker : brighter);
    this.fillRect((x + 1) | 0, (y + height - 1) | 0, (width - 1) | 0, 1);
    this.fillRect((x + width - 1) | 0, y, 1, (height - 1) | 0);
    this.setPaint(p);
  }
}

$J.define(Graphics2D, 'java.awt.Graphics2D', { kind: 'class', sup: 'java.awt.Graphics', ctors: { '': '_Graphics2D' }, meths: { 'rotate(double,double,double)': 'rotate$double$double$double', 'rotate(double)': 'rotate$double', 'translate(double,double)': 'translate$double$double', 'translate(int,int)': 'translate$int$int', 'drawString(java.text.AttributedCharacterIterator,float,float)': 'drawString$AttributedCharacterIterator$float$float', 'drawString(java.text.AttributedCharacterIterator,int,int)': 'drawString$AttributedCharacterIterator$int$int', 'drawString(java.lang.String,float,float)': 'drawString$String$float$float', 'drawString(java.lang.String,int,int)': 'drawString$String$int$int', 'drawImage(java.awt.image.BufferedImage,java.awt.image.BufferedImageOp,int,int)': 'drawImage$BufferedImage$BufferedImageOp$int$int', 'drawImage(java.awt.Image,java.awt.geom.AffineTransform,java.awt.image.ImageObserver)': 'drawImage$Image$AffineTransform$ImageObserver' } });
