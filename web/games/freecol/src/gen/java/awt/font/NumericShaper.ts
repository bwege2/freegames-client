// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/font/NumericShaper.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2021, Oracle and/or its affiliates. All rights reserved.
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

let NumericShaper$Range;

/**
 * The {@code NumericShaper} class is used to convert Latin-1 (European)
 * digits to other Unicode decimal digits.  Users of this class will
 * primarily be people who wish to present data using
 * national digit shapes, but find it more convenient to represent the
 * data internally using Latin-1 (European) digits.  This does not
 * interpret the deprecated numeric shape selector character (U+206E).
 * <p>
 * Instances of {@code NumericShaper} are typically applied
 * as attributes to text with the
 * {@link TextAttribute#NUMERIC_SHAPING NUMERIC_SHAPING} attribute
 * of the {@code TextAttribute} class.
 * For example, this code snippet causes a {@code TextLayout} to
 * shape European digits to Arabic in an Arabic context:<br>
 * <blockquote><pre>
 * Map map = new HashMap();
 * map.put(TextAttribute.NUMERIC_SHAPING,
 *     NumericShaper.getContextualShaper(NumericShaper.ARABIC));
 * FontRenderContext frc = ...;
 * TextLayout layout = new TextLayout(text, map, frc);
 * layout.draw(g2d, x, y);
 * </pre></blockquote>
 * <br>
 * It is also possible to perform numeric shaping explicitly using instances
 * of {@code NumericShaper}, as this code snippet demonstrates:<br>
 * <blockquote><pre>
 * char[] text = ...;
 * // shape all EUROPEAN digits (except zero) to ARABIC digits
 * NumericShaper shaper = NumericShaper.getShaper(NumericShaper.ARABIC);
 * shaper.shape(text, start, count);
 *
 * // shape European digits to ARABIC digits if preceding text is Arabic, or
 * // shape European digits to TAMIL digits if preceding text is Tamil, or
 * // leave European digits alone if there is no preceding text, or
 * // preceding text is neither Arabic nor Tamil
 * NumericShaper shaper =
 *     NumericShaper.getContextualShaper(NumericShaper.ARABIC |
 *                                         NumericShaper.TAMIL,
 *                                       NumericShaper.EUROPEAN);
 * shaper.shape(text, start, count);
 * </pre></blockquote>
 *
 * <p><b>Bit mask- and enum-based Unicode ranges</b></p>
 *
 * <p>This class supports two different programming interfaces to
 * represent Unicode ranges for script-specific digits: bit
 * mask-based ones, such as {@link #ARABIC NumericShaper.ARABIC}, and
 * enum-based ones, such as {@link NumericShaper.Range#ARABIC}.
 * Multiple ranges can be specified by ORing bit mask-based constants,
 * such as:
 * <blockquote><pre>
 * NumericShaper.ARABIC | NumericShaper.TAMIL
 * </pre></blockquote>
 * or creating a {@code Set} with the {@link NumericShaper.Range}
 * constants, such as:
 * <blockquote><pre>
 * EnumSet.of(NumericShaper.Range.ARABIC, NumericShaper.Range.TAMIL)
 * </pre></blockquote>
 * The enum-based ranges are a super set of the bit mask-based ones.
 *
 * <p>If the two interfaces are mixed (including serialization),
 * Unicode range values are mapped to their counterparts where such
 * mapping is possible, such as {@code NumericShaper.Range.ARABIC}
 * from/to {@code NumericShaper.ARABIC}.  If any unmappable range
 * values are specified, such as {@code NumericShaper.Range.BALINESE},
 * those ranges are ignored.
 *
 * <p><b>Decimal Digits Precedence</b></p>
 *
 * <p>A Unicode range may have more than one set of decimal digits. If
 * multiple decimal digits sets are specified for the same Unicode
 * range, one of the sets will take precedence as follows.
 *
 * <table class="plain">
 * <caption>NumericShaper constants precedence</caption>
 * <thead>
 *   <tr>
 *     <th scope="col">Unicode Range
 *     <th scope="col">{@code NumericShaper} Constants
 *     <th scope="col">Precedence
 * </thead>
 * <tbody>
 *   <tr>
 *     <th scope="rowgroup" rowspan="2">Arabic
 *     <th scope="row">{@link NumericShaper#ARABIC NumericShaper.ARABIC}
 *     <br>
 *     {@link NumericShaper#EASTERN_ARABIC NumericShaper.EASTERN_ARABIC}
 *     <td>{@link NumericShaper#EASTERN_ARABIC NumericShaper.EASTERN_ARABIC}
 *   <tr>
 *     <th scope="row">{@link NumericShaper.Range#ARABIC}
 *     <br>
 *     {@link NumericShaper.Range#EASTERN_ARABIC}
 *     <td>{@link NumericShaper.Range#EASTERN_ARABIC}
 * </tbody>
 * <tbody>
 *   <tr>
 *     <th scope="rowgroup">Tai Tham
 *     <th scope="row">{@link NumericShaper.Range#TAI_THAM_HORA}
 *     <br>
 *     {@link NumericShaper.Range#TAI_THAM_THAM}
 *     <td>{@link NumericShaper.Range#TAI_THAM_THAM}
 * </tbody>
 * </table>
 *
 * @since 1.4
 */
export class NumericShaper extends JObject {
  /**
   * index of context for contextual shaping - values range from 0 to 18
   */
  key: number = 0;
  /**
   * flag indicating whether to shape contextually (high bit) and which
   *  digit ranges to shape (bits 0-18)
   */
  mask: number = 0;
  /**
   * The context {@code Range} for contextual shaping or the {@code
   * Range} for non-contextual shaping. {@code null} for the bit
   * mask-based API.
   *
   * @since 1.7
   */
  shapingRange: NumericShaper$Range = null;
  /**
   * {@code Set<Range>} indicating which Unicode ranges to
   * shape. {@code null} for the bit mask-based API.
   */
  rangeSet: JSet<NumericShaper$Range> = null;
  /**
   * rangeSet.toArray() value. Sorted by Range.base when the number
   * of elements is greater than BSEARCH_THRESHOLD.
   */
  rangeArray: NumericShaper$Range[] = null;
  /**
   * If more than BSEARCH_THRESHOLD ranges are specified, binary search is used.
   */
  static readonly BSEARCH_THRESHOLD: number = 3;
  /**
   * Identifies the Latin-1 (European) and extended range, and
   *  Latin-1 (European) decimal base.
   */
  static readonly EUROPEAN: number = 1;
  /**
   * Identifies the ARABIC range and decimal base.
   */
  static readonly ARABIC: number = 2;
  /**
   * Identifies the ARABIC range and ARABIC_EXTENDED decimal base.
   */
  static readonly EASTERN_ARABIC: number = 4;
  /**
   * Identifies the DEVANAGARI range and decimal base.
   */
  static readonly DEVANAGARI: number = 8;
  /**
   * Identifies the BENGALI range and decimal base.
   */
  static readonly BENGALI: number = 16;
  /**
   * Identifies the GURMUKHI range and decimal base.
   */
  static readonly GURMUKHI: number = 32;
  /**
   * Identifies the GUJARATI range and decimal base.
   */
  static readonly GUJARATI: number = 64;
  /**
   * Identifies the ORIYA range and decimal base.
   */
  static readonly ORIYA: number = 128;
  /**
   * Identifies the TAMIL range and decimal base.
   */
  static readonly TAMIL: number = 256;
  /**
   * Identifies the TELUGU range and decimal base.
   */
  static readonly TELUGU: number = 512;
  /**
   * Identifies the KANNADA range and decimal base.
   */
  static readonly KANNADA: number = 1024;
  /**
   * Identifies the MALAYALAM range and decimal base.
   */
  static readonly MALAYALAM: number = 2048;
  /**
   * Identifies the THAI range and decimal base.
   */
  static readonly THAI: number = 4096;
  /**
   * Identifies the LAO range and decimal base.
   */
  static readonly LAO: number = 8192;
  /**
   * Identifies the TIBETAN range and decimal base.
   */
  static readonly TIBETAN: number = 16384;
  /**
   * Identifies the MYANMAR range and decimal base.
   */
  static readonly MYANMAR: number = 32768;
  /**
   * Identifies the ETHIOPIC range and decimal base.
   */
  static readonly ETHIOPIC: number = 65536;
  /**
   * Identifies the KHMER range and decimal base.
   */
  static readonly KHMER: number = 131072;
  /**
   * Identifies the MONGOLIAN range and decimal base.
   */
  static readonly MONGOLIAN: number = 262144;
  /**
   * Identifies all ranges, for full contextual shaping.
   *
   * <p>This constant specifies all of the bit mask-based
   * ranges. Use {@code EnumSet.allOf(NumericShaper.Range.class)} to
   * specify all of the enum-based ranges.
   */
  static readonly ALL_RANGES: number = 524287;
  static readonly EUROPEAN_KEY: number = 0;
  static readonly ARABIC_KEY: number = 1;
  static readonly EASTERN_ARABIC_KEY: number = 2;
  static readonly DEVANAGARI_KEY: number = 3;
  static readonly BENGALI_KEY: number = 4;
  static readonly GURMUKHI_KEY: number = 5;
  static readonly GUJARATI_KEY: number = 6;
  static readonly ORIYA_KEY: number = 7;
  static readonly TAMIL_KEY: number = 8;
  static readonly TELUGU_KEY: number = 9;
  static readonly KANNADA_KEY: number = 10;
  static readonly MALAYALAM_KEY: number = 11;
  static readonly THAI_KEY: number = 12;
  static readonly LAO_KEY: number = 13;
  static readonly TIBETAN_KEY: number = 14;
  static readonly MYANMAR_KEY: number = 15;
  static readonly ETHIOPIC_KEY: number = 16;
  static readonly KHMER_KEY: number = 17;
  static readonly MONGOLIAN_KEY: number = 18;
  static readonly NUM_KEYS: number = 19;
  static readonly CONTEXTUAL_MASK: number = -2147483648;
  static bases: number[] = null;
  static contexts: number[] = null;
  static ctCache: number = 0;
  static ctCacheLimit: number = 0;
  currentRange: NumericShaper$Range = null;
  static strongTable: number[] = null;
  stCache: number = 0;
  $init_NumericShaper() {
    this.currentRange = NumericShaper$Range.EUROPEAN;
  }
}

$J.define(NumericShaper, 'java.awt.font.NumericShaper', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.font.NumericShaper$Range,java.util.Set': '_NumericShaper$Range$Set', 'int,int': '_NumericShaper$int$int' }, meths: { 'shapeContextually(char[],int,int,java.awt.font.NumericShaper$Range)': 'shapeContextually$charArr$int$int$Range$NumericShaper', 'shapeContextually(char[],int,int,int)': 'shapeContextually$charArr$int$int$int$NumericShaper', 'shape(char[],int,int,java.awt.font.NumericShaper$Range)': 'shape$charArr$int$int$Range', 'shape(char[],int,int,int)': 'shape$charArr$int$int$int', 'shape(char[],int,int)': 'shape$charArr$int$int', 'getContextualShaper(java.util.Set,java.awt.font.NumericShaper$Range)': 'getContextualShaper$Set$Range', 'getContextualShaper(int,int)': 'getContextualShaper$int$int', 'getContextualShaper(java.util.Set)': 'getContextualShaper$Set', 'getContextualShaper(int)': 'getContextualShaper$int', 'getShaper(java.awt.font.NumericShaper$Range)': 'getShaper$Range', 'getShaper(int)': 'getShaper$int' } });
$J.module(() => {
  NumericShaper$Range = $J.load('java.awt.font.NumericShaper$Range');
});
