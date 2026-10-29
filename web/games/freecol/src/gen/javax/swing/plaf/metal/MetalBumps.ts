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
import { $J, AppContext, ArrayList, JObject } from '../../../../../jre/index.ts';

let Color, Graphics2D, BumpBuffer;

/**
 * Implements the bumps used throughout the Metal Look and Feel.
 *
 * @author Tom Santos
 * @author Steve Wilson
 */
export class MetalBumps extends JObject {
  static ALPHA: Color = null;
  xBumps: number = 0;
  yBumps: number = 0;
  topColor: Color = null;
  shadowColor: Color = null;
  backColor: Color = null;
  static METAL_BUMPS: any = null;
  buffer: BumpBuffer = null;
  /**
   * Creates MetalBumps of the specified size with the specified colors.
   * If <code>newBackColor</code> is null, the background will be
   * transparent.
   */
  _MetalBumps(width: number, height: number, newTopColor: Color, newShadowColor: Color, newBackColor: Color): this {
    this.setBumpArea$int$int(width, height);
    this.setBumpColors(newTopColor, newShadowColor, newBackColor);
    return this;
  }
  static createBuffer(gc: GraphicsConfiguration, topColor: Color, shadowColor: Color, backColor: Color): BumpBuffer {
    let context = AppContext.getAppContext();
    let buffers = context.get(MetalBumps.METAL_BUMPS);
    if (buffers == null) {
      buffers = new ArrayList();
      context.put(MetalBumps.METAL_BUMPS, buffers);
    }
    for (const $it0 = buffers.iterator(); $it0.hasNext(); ) {
      let buffer = $it0.next();
      if (buffer.hasSameConfiguration(gc, topColor, shadowColor, backColor)) {
        return buffer;
      }
    }
    let buffer = new BumpBuffer()._BumpBuffer(gc, topColor, shadowColor, backColor);
    buffers.add(buffer);
    return buffer;
  }
  setBumpArea$Dimension(bumpArea: Dimension): void {
    this.setBumpArea$int$int(bumpArea.width_, bumpArea.height_);
  }
  setBumpArea$int$int(width: number, height: number): void {
    this.xBumps = $J.idiv(width, 2);
    this.yBumps = $J.idiv(height, 2);
  }
  setBumpColors(newTopColor: Color, newShadowColor: Color, newBackColor: Color): void {
    this.topColor = newTopColor;
    this.shadowColor = newShadowColor;
    if (newBackColor == null) {
      this.backColor = MetalBumps.ALPHA;
    } else {
      this.backColor = newBackColor;
    }
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let gc = (g instanceof Graphics2D) ? (g).getDeviceConfiguration() : null;
    if ((this.buffer == null) || !this.buffer.hasSameConfiguration(gc, this.topColor, this.shadowColor, this.backColor)) {
      this.buffer = MetalBumps.createBuffer(gc, this.topColor, this.shadowColor, this.backColor);
    }
    let bufferWidth = BumpBuffer.IMAGE_SIZE;
    let bufferHeight = BumpBuffer.IMAGE_SIZE;
    let iconWidth = this.getIconWidth();
    let iconHeight = this.getIconHeight();
    let x2 = (x + iconWidth) | 0;
    let y2 = (y + iconHeight) | 0;
    let savex = x;
    while (y < y2) {
      let h = Math.min((y2 - y) | 0, bufferHeight);
      for (x = savex; x < x2; x = (x + bufferWidth) | 0) {
        let w = Math.min((x2 - x) | 0, bufferWidth);
        g.drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(this.buffer.getImage(), x, y, (x + w) | 0, (y + h) | 0, 0, 0, w, h, null);
      }
      y = (y + bufferHeight) | 0;
    }
  }
  getIconWidth(): number {
    return Math.imul(this.xBumps, 2);
  }
  getIconHeight(): number {
    return Math.imul(this.yBumps, 2);
  }
  static $clinit() {
    MetalBumps.ALPHA = new Color()._Color$int$int$int$int(0, 0, 0, 0);
    MetalBumps.METAL_BUMPS = new JObject();
  }
}

$J.define(MetalBumps, 'javax.swing.plaf.metal.MetalBumps', { kind: 'class', ifaces: ['javax.swing.Icon'], sup: 'java.lang.Object', ctors: { 'int,int,java.awt.Color,java.awt.Color,java.awt.Color': '_MetalBumps' }, meths: { 'setBumpArea(int,int)': 'setBumpArea$int$int', 'setBumpArea(java.awt.Dimension)': 'setBumpArea$Dimension' }, clinit: true, lazy: ['ALPHA', 'METAL_BUMPS'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Graphics2D = $J.load('java.awt.Graphics2D');
  BumpBuffer = $J.load('javax.swing.plaf.metal.BumpBuffer');
});
