// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/border/CompoundBorder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { AbstractBorder } from './AbstractBorder.ts';

/**
 * A composite Border class used to compose two Border objects
 * into a single border by nesting an inside Border object within
 * the insets of an outside Border object.
 *
 * For example, this class may be used to add blank margin space
 * to a component with an existing decorative border:
 *
 * <pre>
 *    Border border = comp.getBorder();
 *    Border margin = new EmptyBorder(10,10,10,10);
 *    comp.setBorder(new CompoundBorder(border, margin));
 * </pre>
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
export class CompoundBorder extends AbstractBorder {
  /**
   * The outside border.
   */
  outsideBorder: Border = null;
  /**
   * The inside border.
   */
  insideBorder: Border = null;
  /**
   * Creates a compound border with the specified outside and
   * inside borders.  Either border may be null.
   * @param outsideBorder the outside border
   * @param insideBorder the inside border to be nested
   */
  _CompoundBorder$Border$Border(outsideBorder: Border, insideBorder: Border): this {
    this._AbstractBorder();
    this.outsideBorder = outsideBorder;
    this.insideBorder = insideBorder;
    return this;
  }
  /**
   * Paints the compound border by painting the outside border
   * with the specified position and size and then painting the
   * inside border at the specified position and size offset by
   * the insets of the outside border.
   * @param c the component for which this border is being painted
   * @param g the paint graphics
   * @param x the x position of the painted border
   * @param y the y position of the painted border
   * @param width the width of the painted border
   * @param height the height of the painted border
   */
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    let nextInsets: Insets;
    let px: number;
    let py: number;
    let pw: number;
    let ph: number;
    px = x;
    py = y;
    pw = width;
    ph = height;
    if (this.outsideBorder != null) {
      this.outsideBorder.paintBorder(c, g, px, py, pw, ph);
      nextInsets = this.outsideBorder.getBorderInsets$Component(c);
      px = (px + nextInsets.left) | 0;
      py = (py + nextInsets.top) | 0;
      pw = (pw - nextInsets.right - nextInsets.left) | 0;
      ph = (ph - nextInsets.bottom - nextInsets.top) | 0;
    }
    if (this.insideBorder != null) {
      this.insideBorder.paintBorder(c, g, px, py, pw, ph);
    }
  }
  /**
   * Reinitialize the insets parameter with this Border's current Insets.
   * @param c the component for which this border insets value applies
   * @param insets the object to be reinitialized
   * @throws NullPointerException if the specified {@code insets}
   *         is {@code null}
   */
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    let nextInsets: Insets;
    insets.top = insets.left = insets.right = insets.bottom = 0;
    if (this.outsideBorder != null) {
      nextInsets = this.outsideBorder.getBorderInsets$Component(c);
      insets.top = (insets.top + nextInsets.top) | 0;
      insets.left = (insets.left + nextInsets.left) | 0;
      insets.right = (insets.right + nextInsets.right) | 0;
      insets.bottom = (insets.bottom + nextInsets.bottom) | 0;
    }
    if (this.insideBorder != null) {
      nextInsets = this.insideBorder.getBorderInsets$Component(c);
      insets.top = (insets.top + nextInsets.top) | 0;
      insets.left = (insets.left + nextInsets.left) | 0;
      insets.right = (insets.right + nextInsets.right) | 0;
      insets.bottom = (insets.bottom + nextInsets.bottom) | 0;
    }
    return insets;
  }
  /**
   * Returns the outside border object.
   *
   * @return the outside {@code Border} object
   */
  getOutsideBorder(): Border {
    return this.outsideBorder;
  }
  /**
   * Returns the inside border object.
   *
   * @return the inside {@code Border} object
   */
  getInsideBorder(): Border {
    return this.insideBorder;
  }
}

$J.define(CompoundBorder, 'javax.swing.border.CompoundBorder', { kind: 'class', sup: 'javax.swing.border.AbstractBorder', ctors: { 'javax.swing.border.Border,javax.swing.border.Border': '_CompoundBorder$Border$Border', '': '_CompoundBorder$' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
