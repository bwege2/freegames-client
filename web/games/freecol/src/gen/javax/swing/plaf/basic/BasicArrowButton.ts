// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicArrowButton.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../../jre/index.ts';
import { JButton } from '../../JButton.ts';

let Dimension, AffineTransform, Path2D$Double, SwingConstants, UIManager, UIResource, SwingUtilities2;

/**
 * JButton object that draws a scaled Arrow in one of the cardinal directions.
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
 * @author David Kloba
 */
export class BasicArrowButton extends JButton {
  /**
   * The direction of the arrow. One of
   * {@code SwingConstants.NORTH}, {@code SwingConstants.SOUTH},
   * {@code SwingConstants.EAST} or {@code SwingConstants.WEST}.
   */
  direction: number = 0;
  shadow: Color = null;
  darkShadow: Color = null;
  highlight: Color = null;
  /**
   * Creates a {@code BasicArrowButton} whose arrow
   * is drawn in the specified direction and with the specified
   * colors.
   *
   * @param direction the direction of the arrow; one of
   *        {@code SwingConstants.NORTH}, {@code SwingConstants.SOUTH},
   *        {@code SwingConstants.EAST} or {@code SwingConstants.WEST}
   * @param background the background color of the button
   * @param shadow the color of the shadow
   * @param darkShadow the color of the dark shadow
   * @param highlight the color of the highlight
   * @since 1.4
   */
  _BasicArrowButton$int$Color$Color$Color$Color(direction: number, background: Color, shadow: Color, darkShadow: Color, highlight: Color): this {
    this._JButton$();
    this.setRequestFocusEnabled(false);
    this.setDirection(direction);
    this.setBackground(background);
    this.shadow = shadow;
    this.darkShadow = darkShadow;
    this.highlight = highlight;
    return this;
  }
  /**
   * Creates a {@code BasicArrowButton} whose arrow
   * is drawn in the specified direction.
   *
   * @param direction the direction of the arrow; one of
   *        {@code SwingConstants.NORTH}, {@code SwingConstants.SOUTH},
   *        {@code SwingConstants.EAST} or {@code SwingConstants.WEST}
   */
  _BasicArrowButton$int(direction: number): this {
    this._BasicArrowButton$int$Color$Color$Color$Color(direction, UIManager.getColor$Object('control'), UIManager.getColor$Object('controlShadow'), UIManager.getColor$Object('controlDkShadow'), UIManager.getColor$Object('controlLtHighlight'));
    return this;
  }
  /**
   * Returns the direction of the arrow.
   *
   * @return the direction of the arrow
   */
  getDirection(): number {
    return this.direction;
  }
  /**
   * Sets the direction of the arrow.
   *
   * @param direction the direction of the arrow; one of
   *        of {@code SwingConstants.NORTH},
   *        {@code SwingConstants.SOUTH},
   *        {@code SwingConstants.EAST} or {@code SwingConstants.WEST}
   */
  setDirection(direction: number): void {
    this.direction = direction;
  }
  paint(g: Graphics): void {
    let origColor: Color;
    let isPressed: boolean;
    let isEnabled: boolean;
    let w: number;
    let h: number;
    let size: number;
    w = this.getSize$().width_;
    h = this.getSize$().height_;
    origColor = g.getColor();
    isPressed = this.getModel().isPressed();
    isEnabled = this.isEnabled();
    g.setColor(this.getBackground());
    g.fillRect(1, 1, (w - 2) | 0, (h - 2) | 0);
    if (this.getBorder() != null && !($J.isa(this.getBorder(), UIResource))) {
      this.paintBorder(g);
    } else if (isPressed) {
      g.setColor(this.shadow);
      g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
    } else {
      g.drawLine(0, 0, 0, (h - 1) | 0);
      g.drawLine(1, 0, (w - 2) | 0, 0);
      g.setColor(this.highlight);
      g.drawLine(1, 1, 1, (h - 3) | 0);
      g.drawLine(2, 1, (w - 3) | 0, 1);
      g.setColor(this.shadow);
      g.drawLine(1, (h - 2) | 0, (w - 2) | 0, (h - 2) | 0);
      g.drawLine((w - 2) | 0, 1, (w - 2) | 0, (h - 3) | 0);
      g.setColor(this.darkShadow);
      g.drawLine(0, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
      g.drawLine((w - 1) | 0, (h - 1) | 0, (w - 1) | 0, 0);
    }
    if (h < 5 || w < 5) {
      g.setColor(origColor);
      return;
    }
    if (isPressed) {
      g.translate$int$int(1, 1);
    }
    size = Math.min($J.idiv(((h - 4) | 0), 3), $J.idiv(((w - 4) | 0), 3));
    size = Math.max(size, 2);
    this.paintTriangle(g, $J.idiv(((w - size) | 0), 2), $J.idiv(((h - size) | 0), 2), size, this.direction, isEnabled);
    if (isPressed) {
      g.translate$int$int(-1, -1);
    }
    g.setColor(origColor);
  }
  /**
   * Returns the preferred size of the {@code BasicArrowButton}.
   *
   * @return the preferred size
   */
  getPreferredSize$(): Dimension {
    return new Dimension()._Dimension$int$int(16, 16);
  }
  /**
   * Returns the minimum size of the {@code BasicArrowButton}.
   *
   * @return the minimum size
   */
  getMinimumSize$(): Dimension {
    return new Dimension()._Dimension$int$int(5, 5);
  }
  /**
   * Returns the maximum size of the {@code BasicArrowButton}.
   *
   * @return the maximum size
   */
  getMaximumSize(): Dimension {
    return new Dimension()._Dimension$int$int(2147483647, 2147483647);
  }
  /**
   * Returns whether the arrow button should get the focus.
   * {@code BasicArrowButton}s are used as a child component of
   * composite components such as {@code JScrollBar} and
   * {@code JComboBox}. Since the composite component typically gets the
   * focus, this method is overridden to return {@code false}.
   *
   * @return {@code false}
   */
  isFocusTraversable(): boolean {
    return false;
  }
  /**
   * Paints a triangle.
   *
   * @param g the {@code Graphics} to draw to
   * @param x the x coordinate
   * @param y the y coordinate
   * @param size the size of the triangle to draw
   * @param direction the direction in which to draw the arrow;
   *        one of {@code SwingConstants.NORTH},
   *        {@code SwingConstants.SOUTH}, {@code SwingConstants.EAST} or
   *        {@code SwingConstants.WEST}
   * @param isEnabled whether or not the arrow is drawn enabled
   */
  paintTriangle(g: Graphics, x: number, y: number, size: number, direction: number, isEnabled: boolean): void {
    if (SwingUtilities2.isScaledGraphics(g)) {
      this.paintScaledTriangle(g, x, y, size, direction, isEnabled);
    } else {
      this.paintUnscaledTriangle(g, x, y, size, direction, isEnabled);
    }
  }
  paintUnscaledTriangle(g: Graphics, x: number, y: number, size: number, direction: number, isEnabled: boolean): void {
    let oldColor = g.getColor();
    let mid: number;
    let i: number;
    let j: number;
    j = 0;
    size = Math.max(size, 2);
    mid = (($J.idiv(size, 2)) - 1) | 0;
    g.translate$int$int(x, y);
    if (isEnabled) {
      g.setColor(this.darkShadow);
    } else {
      g.setColor(this.shadow);
    }
    switch (direction) {
      case SwingConstants.NORTH:
        for (i = 0; i < size; i++) {
          g.drawLine((mid - i) | 0, i, (mid + i) | 0, i);
        }
        if (!isEnabled) {
          g.setColor(this.highlight);
          g.drawLine((mid - i + 2) | 0, i, (mid + i) | 0, i);
        }
        break;
      case SwingConstants.SOUTH:
        if (!isEnabled) {
          g.translate$int$int(1, 1);
          g.setColor(this.highlight);
          for (i = (size - 1) | 0; i >= 0; i--) {
            g.drawLine((mid - i) | 0, j, (mid + i) | 0, j);
            j++;
          }
          g.translate$int$int(-1, -1);
          g.setColor(this.shadow);
        }
        j = 0;
        for (i = (size - 1) | 0; i >= 0; i--) {
          g.drawLine((mid - i) | 0, j, (mid + i) | 0, j);
          j++;
        }
        break;
      case SwingConstants.WEST:
        for (i = 0; i < size; i++) {
          g.drawLine(i, (mid - i) | 0, i, (mid + i) | 0);
        }
        if (!isEnabled) {
          g.setColor(this.highlight);
          g.drawLine(i, (mid - i + 2) | 0, i, (mid + i) | 0);
        }
        break;
      case SwingConstants.EAST:
        if (!isEnabled) {
          g.translate$int$int(1, 1);
          g.setColor(this.highlight);
          for (i = (size - 1) | 0; i >= 0; i--) {
            g.drawLine(j, (mid - i) | 0, j, (mid + i) | 0);
            j++;
          }
          g.translate$int$int(-1, -1);
          g.setColor(this.shadow);
        }
        j = 0;
        for (i = (size - 1) | 0; i >= 0; i--) {
          g.drawLine(j, (mid - i) | 0, j, (mid + i) | 0);
          j++;
        }
        break;
    }
    g.translate$int$int(-x, -y);
    g.setColor(oldColor);
  }
  paintScaledTriangle(g: Graphics, x: number, y: number, size: number, direction: number, isEnabled: boolean): void {
    size = Math.max(size, 2);
    let path = new Path2D$Double()._Path2D$Double$();
    path.moveTo$double$double(-size, size / 2);
    path.lineTo$double$double(size, size / 2);
    path.lineTo$double$double(0, -size / 2);
    path.closePath();
    let affineTransform = new AffineTransform()._AffineTransform$();
    affineTransform.rotate$double(3.141592653589793 * ((direction - 1) | 0) / 4);
    path.transform(affineTransform);
    let g2d = g;
    let tx = x + size / 2;
    let ty = y + size / 2;
    g2d.translate$double$double(tx, ty);
    let oldColor = g.getColor();
    if (!isEnabled) {
      g2d.translate$int$int(1, 0);
      g2d.setColor(this.highlight);
      g2d.fill(path);
      g2d.translate$int$int(-1, 0);
    }
    g2d.setColor(isEnabled ? this.darkShadow : this.shadow);
    g2d.fill(path);
    g2d.translate$double$double(-tx, -ty);
    g2d.setColor(oldColor);
  }
}

$J.define(BasicArrowButton, 'javax.swing.plaf.basic.BasicArrowButton', { kind: 'class', ifaces: ['javax.swing.SwingConstants'], sup: 'javax.swing.JButton', ctors: { 'int': '_BasicArrowButton$int', 'int,java.awt.Color,java.awt.Color,java.awt.Color,java.awt.Color': '_BasicArrowButton$int$Color$Color$Color$Color' }, meths: { 'getMinimumSize()': 'getMinimumSize$', 'getPreferredSize()': 'getPreferredSize$' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
  Path2D$Double = $J.load('java.awt.geom.Path2D$Double');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
