// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/border/EmptyBorder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * A class which provides an empty, transparent border which
 * takes up space but does no drawing.
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
export class EmptyBorder extends AbstractBorder {
  /**
   * The left inset of the border.
   */
  left: number = 0;
  /**
   * The right inset of the border.
   */
  right: number = 0;
  /**
   * The top inset of the border.
   */
  top: number = 0;
  /**
   * The bottom inset of the border.
   */
  bottom: number = 0;
  /**
   * Creates an empty border with the specified insets.
   * @param top the top inset of the border
   * @param left the left inset of the border
   * @param bottom the bottom inset of the border
   * @param right the right inset of the border
   */
  _EmptyBorder$int$int$int$int(top: number, left: number, bottom: number, right: number): this {
    this._AbstractBorder();
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
    return this;
  }
  /**
   * Creates an empty border with the specified insets.
   * @param borderInsets the insets of the border
   * @throws NullPointerException if the specified {@code borderInsets}
   *         is {@code null}
   */
  _EmptyBorder$Insets(borderInsets: Insets): this {
    this._AbstractBorder();
    this.top = borderInsets.top;
    this.right = borderInsets.right;
    this.bottom = borderInsets.bottom;
    this.left = borderInsets.left;
    return this;
  }
  /**
   * Does no drawing by default.
   */
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
  }
  /**
   * Reinitialize the insets parameter with this Border's current Insets.
   * @param c the component for which this border insets value applies
   * @param insets the object to be reinitialized
   * @throws NullPointerException if the specified {@code insets}
   *         is {@code null}
   */
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    insets.left = this.left;
    insets.top = this.top;
    insets.right = this.right;
    insets.bottom = this.bottom;
    return insets;
  }
}

$J.define(EmptyBorder, 'javax.swing.border.EmptyBorder', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'javax.swing.border.AbstractBorder', ctors: { 'java.awt.Insets': '_EmptyBorder$Insets', 'int,int,int,int': '_EmptyBorder$int$int$int$int' }, meths: { 'getBorderInsets()': 'getBorderInsets$', 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
