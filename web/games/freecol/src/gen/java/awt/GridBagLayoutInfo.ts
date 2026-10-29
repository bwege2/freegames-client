// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/GridBagLayoutInfo.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2006, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

let Component$BaselineResizeBehavior;

/**
 * The {@code GridBagLayoutInfo} is an utility class for
 * {@code GridBagLayout} layout manager.
 * It stores align, size and baseline parameters for every component within a container.
 *
 * @see       java.awt.GridBagLayout
 * @see       java.awt.GridBagConstraints
 * @since 1.6
 */
export class GridBagLayoutInfo extends JObject {
  /**
   * The number of cells: horizontal and vertical.
   */
  width_: number = 0;
  /**
   * The number of cells: horizontal and vertical.
   */
  height_: number = 0;
  /**
   * The starting point for layout.
   */
  startx: number = 0;
  /**
   * The starting point for layout.
   */
  starty: number = 0;
  /**
   * The largest minWidth in each column.
   */
  minWidth_: number[] = null;
  /**
   * The largest minHeight in each row.
   */
  minHeight_: number[] = null;
  /**
   * The largest weight in each column.
   */
  weightX: number[] = null;
  /**
   * The largest weight in each row.
   */
  weightY: number[] = null;
  /**
   * Whether or not baseline layout has been requested and one of the
   * components has a valid baseline.
   */
  hasBaseline_: boolean = false;
  /**
   * The type of baseline for a particular row. A mix of the
   * BaselineResizeBehavior constants {@code (1 << ordinal())}
   */
  baselineType: number[] = null;
  /**
   * Max ascent (baseline).
   */
  maxAscent: number[] = null;
  /**
   * Max descent (height - baseline)
   */
  maxDescent: number[] = null;
  /**
   * Creates an instance of GridBagLayoutInfo representing {@code GridBagLayout}
   * grid cells with it's own parameters.
   * @param width the columns
   * @param height the rows
   * @since 1.6
   */
  _GridBagLayoutInfo(width: number, height: number): this {
    this.width_ = width;
    this.height_ = height;
    return this;
  }
  /**
   * Returns true if the specified row has any component aligned on the
   * baseline with a baseline resize behavior of CONSTANT_DESCENT.
   */
  hasConstantDescent(row: number): boolean {
    return ((this.baselineType[row] & (1 << Component$BaselineResizeBehavior.CONSTANT_DESCENT.ordinal())) !== 0);
  }
  /**
   * Returns true if there is a baseline for the specified row.
   */
  hasBaseline(row: number): boolean {
    return (this.hasBaseline_ && this.baselineType[row] !== 0);
  }
}

$J.define(GridBagLayoutInfo, 'java.awt.GridBagLayoutInfo', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int,int': '_GridBagLayoutInfo' } });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
});
