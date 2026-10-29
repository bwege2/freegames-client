// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/border/AbstractBorder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, JObject, NullPointerException } from '../../../../jre/index.ts';

let Component$BaselineResizeBehavior, Insets;

/**
 * A class that implements an empty border with no size.
 * This provides a convenient base class from which other border
 * classes can be easily derived.
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
export class AbstractBorder extends JObject {
  /**
   * Constructor for subclasses to call.
   */
  _AbstractBorder(): this {
    return this;
  }
  /**
   * This default implementation does no painting.
   * @param c the component for which this border is being painted
   * @param g the paint graphics
   * @param x the x position of the painted border
   * @param y the y position of the painted border
   * @param width the width of the painted border
   * @param height the height of the painted border
   */
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
  }
  /**
   * This default implementation returns a new {@link Insets} object
   * that is initialized by the {@link #getBorderInsets(Component,Insets)}
   * method.
   * By default the {@code top}, {@code left}, {@code bottom},
   * and {@code right} fields are set to {@code 0}.
   *
   * @param c  the component for which this border insets value applies
   * @return a new {@link Insets} object
   */
  getBorderInsets$Component(c: Component): Insets {
    return this.getBorderInsets$Component$Insets(c, new Insets()._Insets(0, 0, 0, 0));
  }
  /**
   * Returns the baseline.  A return value less than 0 indicates the border
   * does not have a reasonable baseline.
   * <p>
   * The default implementation returns -1.  Subclasses that support
   * baseline should override appropriately.  If a value &gt;= 0 is
   * returned, then the component has a valid baseline for any
   * size &gt;= the minimum size and <code>getBaselineResizeBehavior</code>
   * can be used to determine how the baseline changes with size.
   *
   * @param c <code>Component</code> baseline is being requested for
   * @param width the width to get the baseline for
   * @param height the height to get the baseline for
   * @return the baseline or &lt; 0 indicating there is no reasonable
   *         baseline
   * @throws IllegalArgumentException if width or height is &lt; 0
   * @see java.awt.Component#getBaseline(int,int)
   * @see java.awt.Component#getBaselineResizeBehavior()
   * @since 1.6
   */
  getBaseline(c: Component, width: number, height: number): number {
    if (width < 0 || height < 0) {
      throw new IllegalArgumentException('Width and height must be >= 0');
    }
    return -1;
  }
  /**
   * Returns an enum indicating how the baseline of a component
   * changes as the size changes.  This method is primarily meant for
   * layout managers and GUI builders.
   * <p>
   * The default implementation returns
   * <code>BaselineResizeBehavior.OTHER</code>, subclasses that support
   * baseline should override appropriately.  Subclasses should
   * never return <code>null</code>; if the baseline can not be
   * calculated return <code>BaselineResizeBehavior.OTHER</code>.  Callers
   * should first ask for the baseline using
   * <code>getBaseline</code> and if a value &gt;= 0 is returned use
   * this method.  It is acceptable for this method to return a
   * value other than <code>BaselineResizeBehavior.OTHER</code> even if
   * <code>getBaseline</code> returns a value less than 0.
   *
   * @param c <code>Component</code> to return baseline resize behavior for
   * @return an enum indicating how the baseline changes as the border is
   *         resized
   * @throws NullPointerException if {@code Component} is {@code null}
   * @see java.awt.Component#getBaseline(int,int)
   * @see java.awt.Component#getBaselineResizeBehavior()
   * @since 1.6
   */
  getBaselineResizeBehavior(c: Component): Component$BaselineResizeBehavior {
    if (c == null) {
      throw new NullPointerException('Component must be non-null');
    }
    return Component$BaselineResizeBehavior.OTHER;
  }
}

$J.define(AbstractBorder, 'javax.swing.border.AbstractBorder', { kind: 'class', ifaces: ['javax.swing.border.Border', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_AbstractBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets', 'getBorderInsets(java.awt.Component)': 'getBorderInsets$Component' } });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Insets = $J.load('java.awt.Insets');
});
