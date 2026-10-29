// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/ColorUIResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { Color } from '../../../java/awt/Color.ts';

/**
 * A subclass of Color that implements UIResource.  UI
 * classes that create colors should use this class.
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
 * @see javax.swing.plaf.UIResource
 * @author Hans Muller
 */
export class ColorUIResource extends Color {
  /**
   * Constructs a {@code ColorUIResource}.
   * @param r the red component
   * @param g the green component
   * @param b the blue component
   */
  _ColorUIResource$int$int$int(r: number, g: number, b: number): this {
    this._Color$int$int$int(r, g, b);
    return this;
  }
  /**
   * Constructs a {@code ColorUIResource}.
   * @param rgb the combined RGB components
   */
  _ColorUIResource$int(rgb: number): this {
    this._Color$int(rgb);
    return this;
  }
  /**
   * Constructs a {@code ColorUIResource}.
   * @param c the color
   */
  _ColorUIResource$Color(c: Color): this {
    this._Color$int$boolean(c.getRGB(), (c.getRGB() & -16777216) !== -16777216);
    return this;
  }
}

$J.define(ColorUIResource, 'javax.swing.plaf.ColorUIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'java.awt.Color', ctors: { 'java.awt.Color': '_ColorUIResource$Color', 'float,float,float': '_ColorUIResource$float$float$float', 'int': '_ColorUIResource$int', 'int,int,int': '_ColorUIResource$int$int$int' } });
