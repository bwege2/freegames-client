// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/LayeredHighlighter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2021, Oracle and/or its affiliates. All rights reserved.
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
 * Implementation of {@code Highlighter} interface to mark up the
 * background of leaf views with colored areas.
 *
 * @author  Scott Violet
 * @author  Timothy Prinzing
 * @see     Highlighter
 */
export class LayeredHighlighter extends JObject {
  /**
   * Constructor for subclasses to call.
   */
  _LayeredHighlighter(): this {
    return this;
  }
}

/**
 * Layered highlight renderer.
 */
export class LayeredHighlighter$LayerPainter extends JObject {
  /**
   * Constructor for subclasses to call.
   */
  _LayeredHighlighter$LayerPainter(): this {
    return this;
  }
}

$J.define(LayeredHighlighter, 'javax.swing.text.LayeredHighlighter', { kind: 'class', ifaces: ['javax.swing.text.Highlighter'], sup: 'java.lang.Object', ctors: { '': '_LayeredHighlighter' } });
$J.define(LayeredHighlighter$LayerPainter, 'javax.swing.text.LayeredHighlighter$LayerPainter', { kind: 'class', ifaces: ['javax.swing.text.Highlighter$HighlightPainter'], sup: 'java.lang.Object', ctors: { '': '_LayeredHighlighter$LayerPainter' } });
