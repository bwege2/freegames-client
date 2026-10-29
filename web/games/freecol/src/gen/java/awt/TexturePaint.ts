// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/TexturePaint.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2008, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

let TexturePaintContext, AffineTransform, Rectangle2D$Double;

/**
 * The {@code TexturePaint} class provides a way to fill a
 * {@link Shape} with a texture that is specified as
 * a {@link BufferedImage}. The size of the {@code BufferedImage}
 * object should be small because the {@code BufferedImage} data
 * is copied by the {@code TexturePaint} object.
 * At construction time, the texture is anchored to the upper
 * left corner of a {@link Rectangle2D} that is
 * specified in user space.  Texture is computed for
 * locations in the device space by conceptually replicating the
 * specified {@code Rectangle2D} infinitely in all directions
 * in user space and mapping the {@code BufferedImage} to each
 * replicated {@code Rectangle2D}.
 * @see Paint
 * @see Graphics2D#setPaint
 * @version 1.48, 06/05/07
 */
export class TexturePaint extends JObject {
  bufImg: BufferedImage = null;
  tx: number = 0;
  ty: number = 0;
  sx: number = 0;
  sy: number = 0;
  /**
   * Constructs a {@code TexturePaint} object.
   * @param txtr the {@code BufferedImage} object with the texture
   * used for painting
   * @param anchor the {@code Rectangle2D} in user space used to
   * anchor and replicate the texture
   */
  _TexturePaint(txtr: BufferedImage, anchor: Rectangle2D): this {
    this.bufImg = txtr;
    this.tx = anchor.getX();
    this.ty = anchor.getY();
    this.sx = anchor.getWidth() / this.bufImg.getWidth();
    this.sy = anchor.getHeight() / this.bufImg.getHeight();
    return this;
  }
  /**
   * Returns the {@code BufferedImage} texture used to
   * fill the shapes.
   * @return a {@code BufferedImage}.
   */
  getImage(): BufferedImage {
    return this.bufImg;
  }
  /**
   * Returns a copy of the anchor rectangle which positions and
   * sizes the textured image.
   * @return the {@code Rectangle2D} used to anchor and
   * size this {@code TexturePaint}.
   */
  getAnchorRect(): Rectangle2D {
    return new Rectangle2D$Double()._Rectangle2D$Double$double$double$double$double(this.tx, this.ty, this.sx * this.bufImg.getWidth(), this.sy * this.bufImg.getHeight());
  }
  /**
   * Creates and returns a {@link PaintContext} used to
   * generate a tiled image pattern.
   * See the {@link Paint#createContext specification} of the
   * method in the {@link Paint} interface for information
   * on null parameter handling.
   *
   * @param cm the preferred {@link ColorModel} which represents the most convenient
   *           format for the caller to receive the pixel data, or {@code null}
   *           if there is no preference.
   * @param deviceBounds the device space bounding box
   *                     of the graphics primitive being rendered.
   * @param userBounds the user space bounding box
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
  createContext(cm: ColorModel, deviceBounds: Rectangle, userBounds: Rectangle2D, xform: AffineTransform, hints: RenderingHints): PaintContext {
    if (xform == null) {
      xform = new AffineTransform()._AffineTransform$();
    } else {
      xform = xform.clone();
    }
    xform.translate(this.tx, this.ty);
    xform.scale(this.sx, this.sy);
    return TexturePaintContext.getContext(this.bufImg, xform, hints, deviceBounds);
  }
  /**
   * Returns the transparency mode for this {@code TexturePaint}.
   * @return the transparency mode for this {@code TexturePaint}
   * as an integer value.
   * @see Transparency
   */
  getTransparency(): number {
    return (this.bufImg.getColorModel()).getTransparency();
  }
}

$J.define(TexturePaint, 'java.awt.TexturePaint', { kind: 'class', ifaces: ['java.awt.Paint'], sup: 'java.lang.Object', ctors: { 'java.awt.image.BufferedImage,java.awt.geom.Rectangle2D': '_TexturePaint' } });
$J.module(() => {
  TexturePaintContext = $J.load('java.awt.TexturePaintContext');
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
  Rectangle2D$Double = $J.load('java.awt.geom.Rectangle2D$Double');
});
