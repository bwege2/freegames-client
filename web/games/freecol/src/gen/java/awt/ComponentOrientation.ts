// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/ComponentOrientation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../jre/index.ts';

/**
 * The ComponentOrientation class encapsulates the language-sensitive
 * orientation that is to be used to order the elements of a component
 * or of text. It is used to reflect the differences in this ordering
 * between Western alphabets, Middle Eastern (such as Hebrew), and Far
 * Eastern (such as Japanese).
 * <p>
 * Fundamentally, this governs items (such as characters) which are laid out
 * in lines, with the lines then laid out in a block. This also applies
 * to items in a widget: for example, in a check box where the box is
 * positioned relative to the text.
 * <p>
 * There are four different orientations used in modern languages
 * as in the following table.<br>
 * <pre>
 * LT          RT          TL          TR
 * A B C       C B A       A D G       G D A
 * D E F       F E D       B E H       H E B
 * G H I       I H G       C F I       I F C
 * </pre><br>
 * (In the header, the two-letter abbreviation represents the item direction
 * in the first letter, and the line direction in the second. For example,
 * LT means "items left-to-right, lines top-to-bottom",
 * TL means "items top-to-bottom, lines left-to-right", and so on.)
 * <p>
 * The orientations are:
 * <ul>
 * <li>LT - Western Europe (optional for Japanese, Chinese, Korean)
 * <li>RT - Middle East (Arabic, Hebrew)
 * <li>TR - Japanese, Chinese, Korean
 * <li>TL - Mongolian
 * </ul>
 * Components whose view and controller code depends on orientation
 * should use the {@code isLeftToRight()} and
 * {@code isHorizontal()} methods to
 * determine their behavior. They should not include switch-like
 * code that keys off of the constants, such as:
 * <pre>
 * if (orientation == LEFT_TO_RIGHT) {
 *   ...
 * } else if (orientation == RIGHT_TO_LEFT) {
 *   ...
 * } else {
 *   // Oops
 * }
 * </pre>
 * This is unsafe, since more constants may be added in the future and
 * since it is not guaranteed that orientation objects will be unique.
 */
export class ComponentOrientation extends JObject {
  static readonly UNK_BIT: number = 1;
  static readonly HORIZ_BIT: number = 2;
  static readonly LTR_BIT: number = 4;
  /**
   * Items run left to right and lines flow top to bottom
   * Examples: English, French.
   */
  static LEFT_TO_RIGHT: ComponentOrientation = null;
  /**
   * Items run right to left and lines flow top to bottom
   * Examples: Arabic, Hebrew.
   */
  static RIGHT_TO_LEFT: ComponentOrientation = null;
  /**
   * Indicates that a component's orientation has not been set.
   * To preserve the behavior of existing applications,
   * isLeftToRight will return true for this value.
   */
  static UNKNOWN: ComponentOrientation = null;
  /**
   * The bitwise-ored combination of flags.
   */
  orientation: number = 0;
  _ComponentOrientation(value: number): this {
    this.orientation = value;
    return this;
  }
  /**
   * Are lines horizontal?
   * This will return true for horizontal, left-to-right writing
   * systems such as Roman.
   *
   * @return {@code true} if this orientation has horizontal lines
   */
  isHorizontal(): boolean {
    return (this.orientation & ComponentOrientation.HORIZ_BIT) !== 0;
  }
  /**
   * HorizontalLines: Do items run left-to-right?<br>
   * Vertical Lines:  Do lines run left-to-right?<br>
   * This will return true for horizontal, left-to-right writing
   * systems such as Roman.
   *
   * @return {@code true} if this orientation is left-to-right
   */
  isLeftToRight(): boolean {
    return (this.orientation & ComponentOrientation.LTR_BIT) !== 0;
  }
  static $clinit() {
    ComponentOrientation.LEFT_TO_RIGHT = new ComponentOrientation()._ComponentOrientation(ComponentOrientation.HORIZ_BIT | ComponentOrientation.LTR_BIT);
    ComponentOrientation.RIGHT_TO_LEFT = new ComponentOrientation()._ComponentOrientation(ComponentOrientation.HORIZ_BIT);
    ComponentOrientation.UNKNOWN = new ComponentOrientation()._ComponentOrientation(ComponentOrientation.HORIZ_BIT | ComponentOrientation.LTR_BIT | ComponentOrientation.UNK_BIT);
  }
}

$J.define(ComponentOrientation, 'java.awt.ComponentOrientation', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int': '_ComponentOrientation' }, meths: { 'getOrientation(java.util.ResourceBundle)': 'getOrientation$ResourceBundle', 'getOrientation(java.util.Locale)': 'getOrientation$Locale' }, clinit: true, lazy: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT', 'UNKNOWN'] });
