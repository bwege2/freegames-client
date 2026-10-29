// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/font/GraphicAttribute.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2006, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../jre/index.ts';

/**
 * This class is used with the CHAR_REPLACEMENT attribute.
 * <p>
 * The {@code GraphicAttribute} class represents a graphic embedded
 * in text. Clients subclass this class to implement their own char
 * replacement graphics.  Clients wishing to embed shapes and images in
 * text need not subclass this class.  Instead, clients can use the
 * {@link ShapeGraphicAttribute} and {@link ImageGraphicAttribute}
 * classes.
 * <p>
 * Subclasses must ensure that their objects are immutable once they
 * are constructed.  Mutating a {@code GraphicAttribute} that
 * is used in a {@link TextLayout} results in undefined behavior from the
 * {@code TextLayout}.
 */
export class GraphicAttribute extends JObject {
  fAlignment: number = 0;
  /**
   * Aligns top of graphic to top of line.
   */
  static readonly TOP_ALIGNMENT: number = -1;
  /**
   * Aligns bottom of graphic to bottom of line.
   */
  static readonly BOTTOM_ALIGNMENT: number = -2;
  /**
   * Aligns origin of graphic to roman baseline of line.
   */
  static readonly ROMAN_BASELINE: number = 0;
  /**
   * Aligns origin of graphic to center baseline of line.
   */
  static readonly CENTER_BASELINE: number = 1;
  /**
   * Aligns origin of graphic to hanging baseline of line.
   */
  static readonly HANGING_BASELINE: number = 2;
}

$J.define(GraphicAttribute, 'java.awt.font.GraphicAttribute', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_GraphicAttribute' } });
