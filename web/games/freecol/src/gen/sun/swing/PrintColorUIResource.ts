// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/PrintColorUIResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2004, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../jre/index.ts';
import { ColorUIResource } from '../../javax/swing/plaf/ColorUIResource.ts';

/**
 * A subclass of ColorUIResource that wraps an alternate color
 * for use during printing. Useful to replace color values that
 * may look poor in printed output.
 *
 * @author Shannon Hickey
 */
export class PrintColorUIResource extends ColorUIResource {
  /**
   * The color to use during printing
   */
  printColor: Color = null;
  /**
   * Construct an instance for the given RGB value and
   * alternate color to use during printing.
   *
   * @param rgb the color rgb value
   * @param printColor the alternate color for printing
   */
  _PrintColorUIResource(rgb: number, printColor: Color): this {
    this._ColorUIResource$int(rgb);
    this.printColor = printColor;
    return this;
  }
  /**
   * Return the color to use during printing. If no alternate
   * color was specified on construction, this method will
   * return <code>this</code>.
   *
   * @return the color to use during printing
   */
  getPrintColor(): Color {
    return ((this.printColor != null) ? this.printColor : this);
  }
}

$J.define(PrintColorUIResource, 'sun.swing.PrintColorUIResource', { kind: 'class', sup: 'javax.swing.plaf.ColorUIResource', ctors: { 'int,java.awt.Color': '_PrintColorUIResource' } });
