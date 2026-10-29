// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/border/MatteBorder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { EmptyBorder } from './EmptyBorder.ts';

let Color;

/**
 * A class which provides a matte-like border of either a solid color
 * or a tiled icon.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author Amy Fowler
 */
export class MatteBorder extends EmptyBorder {
  /**
   * The color rendered for the border.
   */
  color: Color = null;
  /**
   * The icon to be used for tiling the border.
   */
  tileIcon: Icon = null;
  /**
   * Creates a matte border with the specified insets and color.
   * @param top the top inset of the border
   * @param left the left inset of the border
   * @param bottom the bottom inset of the border
   * @param right the right inset of the border
   * @param matteColor the color rendered for the border
   */
  _MatteBorder$int$int$int$int$Color(top: number, left: number, bottom: number, right: number, matteColor: Color): this {
    this._EmptyBorder$int$int$int$int(top, left, bottom, right);
    this.color = matteColor;
    return this;
  }
  /**
   * Creates a matte border with the specified insets and tile icon.
   * @param top the top inset of the border
   * @param left the left inset of the border
   * @param bottom the bottom inset of the border
   * @param right the right inset of the border
   * @param tileIcon the icon to be used for tiling the border
   */
  _MatteBorder$int$int$int$int$Icon(top: number, left: number, bottom: number, right: number, tileIcon: Icon): this {
    this._EmptyBorder$int$int$int$int(top, left, bottom, right);
    this.tileIcon = tileIcon;
    return this;
  }
  /**
   * Paints the matte border.
   */
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    let insets = this.getBorderInsets$Component(c);
    let oldColor = g.getColor();
    g.translate$int$int(x, y);
    if (this.tileIcon != null) {
      this.color = (this.tileIcon.getIconWidth() === -1) ? Color.gray : null;
    }
    if (this.color != null) {
      g.setColor(this.color);
      g.fillRect(0, 0, (width - insets.right) | 0, insets.top);
      g.fillRect(0, insets.top, insets.left, (height - insets.top) | 0);
      g.fillRect(insets.left, (height - insets.bottom) | 0, (width - insets.left) | 0, insets.bottom);
      g.fillRect((width - insets.right) | 0, 0, insets.right, (height - insets.bottom) | 0);
    } else if (this.tileIcon != null) {
      let tileW = this.tileIcon.getIconWidth();
      let tileH = this.tileIcon.getIconHeight();
      this.paintEdge(c, g, 0, 0, (width - insets.right) | 0, insets.top, tileW, tileH);
      this.paintEdge(c, g, 0, insets.top, insets.left, (height - insets.top) | 0, tileW, tileH);
      this.paintEdge(c, g, insets.left, (height - insets.bottom) | 0, (width - insets.left) | 0, insets.bottom, tileW, tileH);
      this.paintEdge(c, g, (width - insets.right) | 0, 0, insets.right, (height - insets.bottom) | 0, tileW, tileH);
    }
    g.translate$int$int(-x, -y);
    g.setColor(oldColor);
  }
  paintEdge(c: Component, g: Graphics, x: number, y: number, width: number, height: number, tileW: number, tileH: number): void {
    g = g.create$int$int$int$int(x, y, width, height);
    let sY = -(y % tileH);
    for (x = -(x % tileW); x < width; x = (x + tileW) | 0) {
      for (y = sY; y < height; y = (y + tileH) | 0) {
        this.tileIcon.paintIcon(c, g, x, y);
      }
    }
    g.dispose();
  }
  /**
   * Reinitialize the insets parameter with this Border's current Insets.
   * @param c the component for which this border insets value applies
   * @param insets the object to be reinitialized
   * @throws NullPointerException if the specified {@code insets}
   *         is {@code null}
   * @since 1.3
   */
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    return this.computeInsets(insets);
  }
  computeInsets(insets: Insets): Insets {
    if (this.tileIcon != null && this.top === -1 && this.bottom === -1 && this.left === -1 && this.right === -1) {
      let w = this.tileIcon.getIconWidth();
      let h = this.tileIcon.getIconHeight();
      insets.top = h;
      insets.right = w;
      insets.bottom = h;
      insets.left = w;
    } else {
      insets.left = this.left;
      insets.top = this.top;
      insets.right = this.right;
      insets.bottom = this.bottom;
    }
    return insets;
  }
}

$J.define(MatteBorder, 'javax.swing.border.MatteBorder', { kind: 'class', sup: 'javax.swing.border.EmptyBorder', ctors: { 'javax.swing.Icon': '_MatteBorder$Icon', 'java.awt.Insets,javax.swing.Icon': '_MatteBorder$Insets$Icon', 'int,int,int,int,javax.swing.Icon': '_MatteBorder$int$int$int$int$Icon', 'java.awt.Insets,java.awt.Color': '_MatteBorder$Insets$Color', 'int,int,int,int,java.awt.Color': '_MatteBorder$int$int$int$int$Color' }, meths: { 'getBorderInsets()': 'getBorderInsets$', 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
});
