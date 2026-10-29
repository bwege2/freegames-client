// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/SwingConstants.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2000, Oracle and/or its affiliates. All rights reserved.
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

/**
 * A collection of constants generally used for positioning and orienting
 * components on the screen.
 *
 * @author Jeff Dinkins
 * @author Ralph Kar (orientation support)
 * @since 1.2
 */
export class SwingConstants {
  /**
   * The central position in an area. Used for
   * both compass-direction constants (NORTH, etc.)
   * and box-orientation constants (TOP, etc.).
   */
  static readonly CENTER: number = 0;
  /**
   * Box-orientation constant used to specify the top of a box.
   */
  static readonly TOP: number = 1;
  /**
   * Box-orientation constant used to specify the left side of a box.
   */
  static readonly LEFT: number = 2;
  /**
   * Box-orientation constant used to specify the bottom of a box.
   */
  static readonly BOTTOM: number = 3;
  /**
   * Box-orientation constant used to specify the right side of a box.
   */
  static readonly RIGHT: number = 4;
  /**
   * Compass-direction North (up).
   */
  static readonly NORTH: number = 1;
  /**
   * Compass-direction north-east (upper right).
   */
  static readonly NORTH_EAST: number = 2;
  /**
   * Compass-direction east (right).
   */
  static readonly EAST: number = 3;
  /**
   * Compass-direction south-east (lower right).
   */
  static readonly SOUTH_EAST: number = 4;
  /**
   * Compass-direction south (down).
   */
  static readonly SOUTH: number = 5;
  /**
   * Compass-direction south-west (lower left).
   */
  static readonly SOUTH_WEST: number = 6;
  /**
   * Compass-direction west (left).
   */
  static readonly WEST: number = 7;
  /**
   * Compass-direction north west (upper left).
   */
  static readonly NORTH_WEST: number = 8;
  /**
   * Horizontal orientation. Used for scrollbars and sliders.
   */
  static readonly HORIZONTAL: number = 0;
  /**
   * Vertical orientation. Used for scrollbars and sliders.
   */
  static readonly VERTICAL: number = 1;
  /**
   * Identifies the leading edge of text for use with left-to-right
   * and right-to-left languages. Used by buttons and labels.
   */
  static readonly LEADING: number = 10;
  /**
   * Identifies the trailing edge of text for use with left-to-right
   * and right-to-left languages. Used by buttons and labels.
   */
  static readonly TRAILING: number = 11;
  /**
   * Identifies the next direction in a sequence.
   *
   * @since 1.4
   */
  static readonly NEXT: number = 12;
  /**
   * Identifies the previous direction in a sequence.
   *
   * @since 1.4
   */
  static readonly PREVIOUS: number = 13;
}

$J.define(SwingConstants, 'javax.swing.SwingConstants', { kind: 'interface' });
