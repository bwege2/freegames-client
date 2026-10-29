// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalBumps.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, BufferedImage, JObject } from '../../../../../jre/index.ts';

let Transparency, DataBuffer, IndexColorModel, MetalBumps;

export class BumpBuffer extends JObject {
  static readonly IMAGE_SIZE: number = 64;
  image: Image = null;
  topColor: Color = null;
  shadowColor: Color = null;
  backColor: Color = null;
  gc: GraphicsConfiguration = null;
  _BumpBuffer(gc: GraphicsConfiguration, aTopColor: Color, aShadowColor: Color, aBackColor: Color): this {
    this.gc = gc;
    this.topColor = aTopColor;
    this.shadowColor = aShadowColor;
    this.backColor = aBackColor;
    this.createImage();
    this.fillBumpBuffer();
    return this;
  }
  hasSameConfiguration(gc: GraphicsConfiguration, aTopColor: Color, aShadowColor: Color, aBackColor: Color): boolean {
    if (this.gc != null) {
      if (!this.gc.equals(gc)) {
        return false;
      }
    } else if (gc != null) {
      return false;
    }
    return this.topColor.equals(aTopColor) && this.shadowColor.equals(aShadowColor) && this.backColor.equals(aBackColor);
  }
  /**
   * Returns the Image containing the bumps appropriate for the passed in
   * <code>GraphicsConfiguration</code>.
   */
  getImage(): Image {
    return this.image;
  }
  /**
   * Paints the bumps into the current image.
   */
  fillBumpBuffer(): void {
    let g = this.image.getGraphics();
    g.setColor(this.backColor);
    g.fillRect(0, 0, BumpBuffer.IMAGE_SIZE, BumpBuffer.IMAGE_SIZE);
    g.setColor(this.topColor);
    for (let x = 0; x < BumpBuffer.IMAGE_SIZE; x = (x + 4) | 0) {
      for (let y = 0; y < BumpBuffer.IMAGE_SIZE; y = (y + 4) | 0) {
        g.drawLine(x, y, x, y);
        g.drawLine((x + 2) | 0, (y + 2) | 0, (x + 2) | 0, (y + 2) | 0);
      }
    }
    g.setColor(this.shadowColor);
    for (let x = 0; x < BumpBuffer.IMAGE_SIZE; x = (x + 4) | 0) {
      for (let y = 0; y < BumpBuffer.IMAGE_SIZE; y = (y + 4) | 0) {
        g.drawLine((x + 1) | 0, (y + 1) | 0, (x + 1) | 0, (y + 1) | 0);
        g.drawLine((x + 3) | 0, (y + 3) | 0, (x + 3) | 0, (y + 3) | 0);
      }
    }
    g.dispose();
  }
  /**
   * Creates the image appropriate for the passed in
   * <code>GraphicsConfiguration</code>, which may be null.
   */
  createImage(): void {
    if (this.gc != null) {
      this.image = this.gc.createCompatibleImage$int$int$int(BumpBuffer.IMAGE_SIZE, BumpBuffer.IMAGE_SIZE, (this.backColor !== MetalBumps.ALPHA) ? Transparency.OPAQUE : Transparency.BITMASK);
    } else {
      let cmap = [this.backColor.getRGB(), this.topColor.getRGB(), this.shadowColor.getRGB()];
      let icm = new IndexColorModel()._IndexColorModel$int$int$intArr$int$boolean$int$int(8, 3, cmap, 0, false, (this.backColor === MetalBumps.ALPHA) ? 0 : -1, DataBuffer.TYPE_BYTE);
      this.image = new BufferedImage(BumpBuffer.IMAGE_SIZE, BumpBuffer.IMAGE_SIZE, 13, icm);
    }
  }
}

$J.define(BumpBuffer, 'javax.swing.plaf.metal.BumpBuffer', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.GraphicsConfiguration,java.awt.Color,java.awt.Color,java.awt.Color': '_BumpBuffer' } });
$J.module(() => {
  Transparency = $J.load('java.awt.Transparency');
  DataBuffer = $J.load('java.awt.image.DataBuffer');
  IndexColorModel = $J.load('java.awt.image.IndexColorModel');
  MetalBumps = $J.load('javax.swing.plaf.metal.MetalBumps');
});
