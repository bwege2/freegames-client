// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/FontUIResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { Font } from '../../../java/awt/Font.ts';

/**
 * A subclass of java.awt.Font that implements UIResource.
 * UI classes which set default font properties should use
 * this class.
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
export class FontUIResource extends Font {
  /**
   * Constructs a {@code FontUIResource}.
   * @param name the font name
   * @param style the style constant for the font
   * @param size the point size of the font
   */
  _FontUIResource$String$int$int(name: string, style: number, size: number): this {
    this._Font$String$int$int(name, style, size);
    return this;
  }
  /**
   * Constructs a {@code FontUIResource}.
   * @param font the font
   */
  _FontUIResource$Font(font: Font): this {
    this._Font$Font(font);
    return this;
  }
}

$J.define(FontUIResource, 'javax.swing.plaf.FontUIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'java.awt.Font', ctors: { 'java.awt.Font': '_FontUIResource$Font', 'java.lang.String,int,int': '_FontUIResource$String$int$int' } });
