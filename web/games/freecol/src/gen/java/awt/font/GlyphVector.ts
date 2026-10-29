// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/font/GlyphVector.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2020, Oracle and/or its affiliates. All rights reserved.
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
 * A {@code GlyphVector} object is a collection of glyphs
 * containing geometric information for the placement of each glyph
 * in a transformed coordinate space which corresponds to the
 * device on which the {@code GlyphVector} is ultimately
 * displayed.
 * <p>
 * The {@code GlyphVector} does not attempt any interpretation of
 * the sequence of glyphs it contains.  Relationships between adjacent
 * glyphs in sequence are solely used to determine the placement of
 * the glyphs in the visual coordinate space.
 * <p>
 * Instances of {@code GlyphVector} are created by a {@link Font}.
 * <p>
 * In a text processing application that can cache intermediate
 * representations of text, creation and subsequent caching of a
 * {@code GlyphVector} for use during rendering is the fastest
 * method to present the visual representation of characters to a user.
 * <p>
 * A {@code GlyphVector} is associated with exactly one
 * {@code Font}, and can provide data useful only in relation to
 * this {@code Font}.  In addition, metrics obtained from a
 * {@code GlyphVector} are not generally geometrically scalable
 * since the pixelization and spacing are dependent on grid-fitting
 * algorithms within a {@code Font}.  To facilitate accurate
 * measurement of a {@code GlyphVector} and its component
 * glyphs, you must specify a scaling transform, anti-alias mode, and
 * fractional metrics mode when creating the {@code GlyphVector}.
 * These characteristics can be derived from the destination device.
 * <p>
 * For each glyph in the {@code GlyphVector}, you can obtain:
 * <ul>
 * <li>the position of the glyph
 * <li>the transform associated with the glyph
 * <li>the metrics of the glyph in the context of the
 *   {@code GlyphVector}.  The metrics of the glyph may be
 *   different under different transforms, application specified
 *   rendering hints, and the specific instance of the glyph within
 *   the {@code GlyphVector}.
 * </ul>
 * <p>
 * Altering the data used to create the {@code GlyphVector} does not
 * alter the state of the {@code GlyphVector}.
 * <p>
 * Methods are provided to adjust the positions of the glyphs
 * within the {@code GlyphVector}.  These methods are most
 * appropriate for applications that are performing justification
 * operations for the presentation of the glyphs.
 * <p>
 * Methods are provided to transform individual glyphs within the
 * {@code GlyphVector}.  These methods are primarily useful for
 * special effects.
 * <p>
 * Methods are provided to return both the visual, logical, and pixel bounds
 * of the entire {@code GlyphVector} or of individual glyphs within
 * the {@code GlyphVector}.
 * <p>
 * Methods are provided to return a {@link Shape} for the
 * {@code GlyphVector}, and for individual glyphs within the
 * {@code GlyphVector}.
 * @see Font
 * @see GlyphMetrics
 * @see TextLayout
 * @author Charlton Innovations, Inc.
 */
export class GlyphVector extends JObject {
  /**
   * A flag used with getLayoutFlags that indicates that this {@code GlyphVector} has
   * per-glyph transforms.
   * @since 1.4
   */
  static readonly FLAG_HAS_TRANSFORMS: number = 1;
  /**
   * A flag used with getLayoutFlags that indicates that this {@code GlyphVector} has
   * position adjustments.  When this is true, the glyph positions don't match the
   * accumulated default advances of the glyphs (for example, if kerning has been done).
   * @since 1.4
   */
  static readonly FLAG_HAS_POSITION_ADJUSTMENTS: number = 2;
  /**
   * A flag used with getLayoutFlags that indicates that this {@code GlyphVector} has
   * a right-to-left run direction.  This refers to the glyph-to-char mapping and does
   * not imply that the visual locations of the glyphs are necessarily in this order,
   * although generally they will be.
   * @since 1.4
   */
  static readonly FLAG_RUN_RTL: number = 4;
  /**
   * A flag used with getLayoutFlags that indicates that this {@code GlyphVector} has
   * a complex glyph-to-char mapping (one that does not map glyphs to chars one-to-one in
   * strictly ascending or descending order matching the run direction).
   * @since 1.4
   */
  static readonly FLAG_COMPLEX_GLYPHS: number = 8;
  /**
   * A mask for supported flags from getLayoutFlags.  Only bits covered by the mask
   * should be tested.
   * @since 1.4
   */
  static readonly FLAG_MASK: number = 15;
}

$J.define(GlyphVector, 'java.awt.font.GlyphVector', { kind: 'class', ifaces: ['java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { '': '_GlyphVector' }, meths: { 'equals(java.awt.font.GlyphVector)': 'equals$GlyphVector', 'getGlyphOutline(int,float,float)': 'getGlyphOutline$int$float$float', 'getGlyphOutline(int)': 'getGlyphOutline$int', 'getOutline(float,float)': 'getOutline$float$float', 'getOutline()': 'getOutline$' } });
