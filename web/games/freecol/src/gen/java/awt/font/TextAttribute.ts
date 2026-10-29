// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/font/TextAttribute.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AttributedCharacterIterator_Attribute, HashMap, InvalidObjectException, SharedSecrets } from '../../../../jre/index.ts';

let JavaAWTFontAccessImpl;

/**
 * The {@code TextAttribute} class defines attribute keys and
 * attribute values used for text rendering.
 * <p>
 * {@code TextAttribute} instances are used as attribute keys to
 * identify attributes in
 * {@link java.awt.Font Font},
 * {@link java.awt.font.TextLayout TextLayout},
 * {@link java.text.AttributedCharacterIterator AttributedCharacterIterator},
 * and other classes handling text attributes. Other constants defined
 * in this class can be used as attribute values.
 * <p>
 * For each text attribute, the documentation provides:
 * <UL>
 *   <LI>the type of its value,
 *   <LI>the relevant predefined constants, if any
 *   <LI>the default effect if the attribute is absent
 *   <LI>the valid values if there are limitations
 *   <LI>a description of the effect.
 * </UL>
 *
 * <H2>Values</H2>
 * <UL>
 *   <LI>The values of attributes must always be immutable.
 *   <LI>Where value limitations are given, any value outside of that
 *   set is reserved for future use; the value will be treated as
 *   the default.
 *   <LI>The value {@code null} is treated the same as the
 *   default value and results in the default behavior.
 *   <li>If the value is not of the proper type, the attribute
 *   will be ignored.
 *   <li>The identity of the value does not matter, only the actual
 *   value.  For example, {@code TextAttribute.WEIGHT_BOLD} and
 *   {@code Float.valueOf(2.0f)}
 *   indicate the same {@code WEIGHT}.
 *   <li>Attribute values of type {@code Number} (used for
 *   {@code WEIGHT}, {@code WIDTH}, {@code POSTURE},
 *   {@code SIZE}, {@code JUSTIFICATION}, and
 *   {@code TRACKING}) can vary along their natural range and are
 *   not restricted to the predefined constants.
 *   {@code Number.floatValue()} is used to get the actual value
 *   from the {@code Number}.
 *   <li>The values for {@code WEIGHT}, {@code WIDTH}, and
 *   {@code POSTURE} are interpolated by the system, which
 *   can select the 'nearest available' font or use other techniques to
 *   approximate the user's request.
 *
 * </UL>
 *
 * <h3>Summary of attributes</h3>
 *
 * <table style="width:95%;margin: 0px auto" class="striped">
 * <caption>Key, value type, principal constants, and default value behavior of
 * all TextAttributes</caption>
 * <thead>
 *   <tr>
 *     <th scope="col">Key
 *     <th scope="col">Value Type
 *     <th scope="col">Principal Constants
 *     <th scope="col">Default Value
 * </thead>
 * <tbody>
 *   <tr>
 *     <th scope="row">{@link #FAMILY}
 *     <td>String
 *     <td>See Font {@link java.awt.Font#DIALOG DIALOG},
 *     {@link java.awt.Font#DIALOG_INPUT DIALOG_INPUT},
 *     <br>
 *     {@link java.awt.Font#SERIF SERIF},
 *     {@link java.awt.Font#SANS_SERIF SANS_SERIF}, and
 *     {@link java.awt.Font#MONOSPACED MONOSPACED}.
 *     <td>"Default" (use platform default)
 *   <tr>
 *     <th scope="row">{@link #WEIGHT}
 *     <td>Number
 *     <td>WEIGHT_REGULAR, WEIGHT_BOLD
 *     <td>WEIGHT_REGULAR
 *   <tr>
 *     <th scope="row">{@link #WIDTH}
 *     <td>Number
 *     <td>WIDTH_CONDENSED, WIDTH_REGULAR,<br>WIDTH_EXTENDED
 *     <td>WIDTH_REGULAR
 *   <tr>
 *     <th scope="row">{@link #POSTURE}
 *     <td>Number
 *     <td>POSTURE_REGULAR, POSTURE_OBLIQUE
 *     <td>POSTURE_REGULAR
 *   <tr>
 *     <th scope="row">{@link #SIZE}
 *     <td>Number
 *     <td>none
 *     <td>12.0
 *   <tr>
 *     <th scope="row">{@link #TRANSFORM}
 *     <td>{@link TransformAttribute}
 *     <td>See TransformAttribute {@link TransformAttribute#IDENTITY IDENTITY}
 *     <td>TransformAttribute.IDENTITY
 *   <tr>
 *     <th scope="row">{@link #SUPERSCRIPT}
 *     <td>Integer
 *     <td>SUPERSCRIPT_SUPER, SUPERSCRIPT_SUB
 *     <td>0 (use the standard glyphs and metrics)
 *   <tr>
 *     <th scope="row">{@link #FONT}
 *     <td>{@link java.awt.Font}
 *     <td>none
 *     <td>null (do not override font resolution)
 *   <tr>
 *     <th scope="row">{@link #CHAR_REPLACEMENT}
 *     <td>{@link GraphicAttribute}
 *     <td>none
 *     <td>null (draw text using font glyphs)
 *   <tr>
 *     <th scope="row">{@link #FOREGROUND}
 *     <td>{@link java.awt.Paint}
 *     <td>none
 *     <td>null (use current graphics paint)
 *   <tr>
 *     <th scope="row">{@link #BACKGROUND}
 *     <td>{@link java.awt.Paint}
 *     <td>none
 *     <td>null (do not render background)
 *   <tr>
 *     <th scope="row">{@link #UNDERLINE}
 *     <td>Integer
 *     <td>UNDERLINE_ON
 *     <td>-1 (do not render underline)
 *   <tr>
 *     <th scope="row">{@link #STRIKETHROUGH}
 *     <td>Boolean
 *     <td>STRIKETHROUGH_ON
 *     <td>false (do not render strikethrough)
 *   <tr>
 *     <th scope="row">{@link #RUN_DIRECTION}
 *     <td>Boolean
 *     <td>RUN_DIRECTION_LTR<br>RUN_DIRECTION_RTL
 *     <td>null (use {@link java.text.Bidi} standard default)
 *   <tr>
 *     <th scope="row">{@link #BIDI_EMBEDDING}
 *     <td>Integer
 *     <td>none
 *     <td>0 (use base line direction)
 *   <tr>
 *     <th scope="row">{@link #JUSTIFICATION}
 *     <td>Number
 *     <td>JUSTIFICATION_FULL
 *     <td>JUSTIFICATION_FULL
 *   <tr>
 *     <th scope="row">{@link #INPUT_METHOD_HIGHLIGHT}
 *     <td>{@link java.awt.im.InputMethodHighlight},
 *     <br>
 *     {@link java.text.Annotation}
 *     <td>(see class)
 *     <td>null (do not apply input highlighting)
 *   <tr>
 *     <th scope="row">{@link #INPUT_METHOD_UNDERLINE}
 *     <td>Integer
 *     <td>UNDERLINE_LOW_ONE_PIXEL,<br>UNDERLINE_LOW_TWO_PIXEL
 *     <td>-1 (do not render underline)
 *   <tr>
 *     <th scope="row">{@link #SWAP_COLORS}
 *     <td>Boolean
 *     <td>SWAP_COLORS_ON
 *     <td>false (do not swap colors)
 *   <tr>
 *     <th scope="row">{@link #NUMERIC_SHAPING}
 *     <td>{@link java.awt.font.NumericShaper}
 *     <td>none
 *     <td>null (do not shape digits)
 *   <tr>
 *     <th scope="row">{@link #KERNING}
 *     <td>Integer
 *     <td>KERNING_ON
 *     <td>0 (do not request kerning)
 *   <tr>
 *     <th scope="row">{@link #LIGATURES}
 *     <td>Integer
 *     <td>LIGATURES_ON
 *     <td>0 (do not form optional ligatures)
 *   <tr>
 *     <th scope="row">{@link #TRACKING}
 *     <td>Number
 *     <td>TRACKING_LOOSE, TRACKING_TIGHT
 *     <td>0 (do not add tracking)
 *   </tr>
 * </tbody>
 * </table>
 *
 * @see java.awt.Font
 * @see java.awt.font.TextLayout
 * @see java.text.AttributedCharacterIterator
 */
export class TextAttribute extends AttributedCharacterIterator_Attribute {
  static instanceMap: JMap<string, TextAttribute> = null;
  /**
   * Attribute key for the font name.  Values are instances of
   * <b>{@code String}</b>.  The default value is
   * {@code "Default"}, which causes the platform default font
   * family to be used.
   *
   * <p> The {@code Font} class defines constants for the logical
   * font names
   * {@link java.awt.Font#DIALOG DIALOG},
   * {@link java.awt.Font#DIALOG_INPUT DIALOG_INPUT},
   * {@link java.awt.Font#SANS_SERIF SANS_SERIF},
   * {@link java.awt.Font#SERIF SERIF}, and
   * {@link java.awt.Font#MONOSPACED MONOSPACED}.
   *
   * <p>This defines the value passed as {@code name} to the
   * {@code Font} constructor.  Both logical and physical
   * font names are allowed. If a font with the requested name
   * is not found, the default font is used.
   *
   * <p><em>Note:</em> This attribute is unfortunately misnamed, as
   * it specifies the face name and not just the family.  Thus
   * values such as "Lucida Sans Bold" will select that face if it
   * exists.  Note, though, that if the requested face does not
   * exist, the default will be used with <em>regular</em> weight.
   * The "Bold" in the name is part of the face name, not a separate
   * request that the font's weight be bold.</p>
   */
  static FAMILY: TextAttribute = null;
  /**
   * Attribute key for the weight of a font.  Values are instances
   * of <b>{@code Number}</b>.  The default value is
   * {@code WEIGHT_REGULAR}.
   *
   * <p>Several constant values are provided, see {@link
   * #WEIGHT_EXTRA_LIGHT}, {@link #WEIGHT_LIGHT}, {@link
   * #WEIGHT_DEMILIGHT}, {@link #WEIGHT_REGULAR}, {@link
   * #WEIGHT_SEMIBOLD}, {@link #WEIGHT_MEDIUM}, {@link
   * #WEIGHT_DEMIBOLD}, {@link #WEIGHT_BOLD}, {@link #WEIGHT_HEAVY},
   * {@link #WEIGHT_EXTRABOLD}, and {@link #WEIGHT_ULTRABOLD}.  The
   * value {@code WEIGHT_BOLD} corresponds to the
   * style value {@code Font.BOLD} as passed to the
   * {@code Font} constructor.
   *
   * <p>The value is roughly the ratio of the stem width to that of
   * the regular weight.
   *
   * <p>The system can interpolate the provided value.
   */
  static WEIGHT: TextAttribute = null;
  /**
   * The lightest predefined weight.
   * @see #WEIGHT
   */
  static WEIGHT_EXTRA_LIGHT: number = null;
  /**
   * The standard light weight.
   * @see #WEIGHT
   */
  static WEIGHT_LIGHT: number = null;
  /**
   * An intermediate weight between {@code WEIGHT_LIGHT} and
   * {@code WEIGHT_STANDARD}.
   * @see #WEIGHT
   */
  static WEIGHT_DEMILIGHT: number = null;
  /**
   * The standard weight. This is the default value for {@code WEIGHT}.
   * @see #WEIGHT
   */
  static WEIGHT_REGULAR: number = null;
  /**
   * A moderately heavier weight than {@code WEIGHT_REGULAR}.
   * @see #WEIGHT
   */
  static WEIGHT_SEMIBOLD: number = null;
  /**
   * An intermediate weight between {@code WEIGHT_REGULAR} and
   * {@code WEIGHT_BOLD}.
   * @see #WEIGHT
   */
  static WEIGHT_MEDIUM: number = null;
  /**
   * A moderately lighter weight than {@code WEIGHT_BOLD}.
   * @see #WEIGHT
   */
  static WEIGHT_DEMIBOLD: number = null;
  /**
   * The standard bold weight.
   * @see #WEIGHT
   */
  static WEIGHT_BOLD: number = null;
  /**
   * A moderately heavier weight than {@code WEIGHT_BOLD}.
   * @see #WEIGHT
   */
  static WEIGHT_HEAVY: number = null;
  /**
   * An extra heavy weight.
   * @see #WEIGHT
   */
  static WEIGHT_EXTRABOLD: number = null;
  /**
   * The heaviest predefined weight.
   * @see #WEIGHT
   */
  static WEIGHT_ULTRABOLD: number = null;
  /**
   * Attribute key for the width of a font.  Values are instances of
   * <b>{@code Number}</b>.  The default value is
   * {@code WIDTH_REGULAR}.
   *
   * <p>Several constant values are provided, see {@link
   * #WIDTH_CONDENSED}, {@link #WIDTH_SEMI_CONDENSED}, {@link
   * #WIDTH_REGULAR}, {@link #WIDTH_SEMI_EXTENDED}, {@link
   * #WIDTH_EXTENDED}.
   *
   * <p>The value is roughly the ratio of the advance width to that
   * of the regular width.
   *
   * <p>The system can interpolate the provided value.
   */
  static WIDTH: TextAttribute = null;
  /**
   * The most condensed predefined width.
   * @see #WIDTH
   */
  static WIDTH_CONDENSED: number = null;
  /**
   * A moderately condensed width.
   * @see #WIDTH
   */
  static WIDTH_SEMI_CONDENSED: number = null;
  /**
   * The standard width. This is the default value for
   * {@code WIDTH}.
   * @see #WIDTH
   */
  static WIDTH_REGULAR: number = null;
  /**
   * A moderately extended width.
   * @see #WIDTH
   */
  static WIDTH_SEMI_EXTENDED: number = null;
  /**
   * The most extended predefined width.
   * @see #WIDTH
   */
  static WIDTH_EXTENDED: number = null;
  /**
   * Attribute key for the posture of a font.  Values are instances
   * of <b>{@code Number}</b>. The default value is
   * {@code POSTURE_REGULAR}.
   *
   * <p>Two constant values are provided, {@link #POSTURE_REGULAR}
   * and {@link #POSTURE_OBLIQUE}. The value
   * {@code POSTURE_OBLIQUE} corresponds to the style value
   * {@code Font.ITALIC} as passed to the {@code Font}
   * constructor.
   *
   * <p>The value is roughly the slope of the stems of the font,
   * expressed as the run over the rise.  Positive values lean right.
   *
   * <p>The system can interpolate the provided value.
   *
   * <p>This will affect the font's italic angle as returned by
   * {@code Font.getItalicAngle}.
   *
   * @see java.awt.Font#getItalicAngle()
   */
  static POSTURE: TextAttribute = null;
  /**
   * The standard posture, upright.  This is the default value for
   * {@code POSTURE}.
   * @see #POSTURE
   */
  static POSTURE_REGULAR: number = null;
  /**
   * The standard italic posture.
   * @see #POSTURE
   */
  static POSTURE_OBLIQUE: number = null;
  /**
   * Attribute key for the font size.  Values are instances of
   * <b>{@code Number}</b>.  The default value is 12pt.
   *
   * <p>This corresponds to the {@code size} parameter to the
   * {@code Font} constructor.
   *
   * <p>Very large or small sizes will impact rendering performance,
   * and the rendering system might not render text at these sizes.
   * Negative sizes are illegal and result in the default size.
   *
   * <p>Note that the appearance and metrics of a 12pt font with a
   * 2x transform might be different than that of a 24 point font
   * with no transform.
   */
  static SIZE: TextAttribute = null;
  /**
   * Attribute key for the transform of a font.  Values are
   * instances of <b>{@code TransformAttribute}</b>.  The
   * default value is {@code TransformAttribute.IDENTITY}.
   *
   * <p>The {@code TransformAttribute} class defines the
   * constant {@link TransformAttribute#IDENTITY IDENTITY}.
   *
   * <p>This corresponds to the transform passed to
   * {@code Font.deriveFont(AffineTransform)}.  Since that
   * transform is mutable and {@code TextAttribute} values must
   * not be, the {@code TransformAttribute} wrapper class is
   * used.
   *
   * <p>The primary intent is to support scaling and skewing, though
   * other effects are possible.</p>
   *
   * <p>Some transforms will cause the baseline to be rotated and/or
   * shifted.  The text and the baseline are transformed together so
   * that the text follows the new baseline.  For example, with text
   * on a horizontal baseline, the new baseline follows the
   * direction of the unit x vector passed through the
   * transform. Text metrics are measured against this new baseline.
   * So, for example, with other things being equal, text rendered
   * with a rotated TRANSFORM and an unrotated TRANSFORM will measure as
   * having the same ascent, descent, and advance.</p>
   *
   * <p>In styled text, the baselines for each such run are aligned
   * one after the other to potentially create a non-linear baseline
   * for the entire run of text. For more information, see {@link
   * TextLayout#getLayoutPath}.</p>
   *
   * @see TransformAttribute
   * @see java.awt.geom.AffineTransform
   */
  static TRANSFORM: TextAttribute = null;
  /**
   * Attribute key for superscripting and subscripting.  Values are
   * instances of <b>{@code Integer}</b>.  The default value is
   * 0, which means that no superscript or subscript is used.
   *
   * <p>Two constant values are provided, see {@link
   * #SUPERSCRIPT_SUPER} and {@link #SUPERSCRIPT_SUB}.  These have
   * the values 1 and -1 respectively.  Values of
   * greater magnitude define greater levels of superscript or
   * subscripting, for example, 2 corresponds to super-superscript,
   * 3 to super-super-superscript, and similarly for negative values
   * and subscript, up to a level of 7 (or -7).  Values beyond this
   * range are reserved; behavior is platform-dependent.
   *
   * <p>{@code SUPERSCRIPT} can
   * impact the ascent and descent of a font.  The ascent
   * and descent can never become negative, however.
   */
  static SUPERSCRIPT: TextAttribute = null;
  /**
   * Standard superscript.
   * @see #SUPERSCRIPT
   */
  static SUPERSCRIPT_SUPER: number = null;
  /**
   * Standard subscript.
   * @see #SUPERSCRIPT
   */
  static SUPERSCRIPT_SUB: number = null;
  /**
   * Attribute key used to provide the font to use to render text.
   * Values are instances of {@link java.awt.Font}.  The default
   * value is null, indicating that normal resolution of a
   * {@code Font} from attributes should be performed.
   *
   * <p>{@code TextLayout} and
   * {@code AttributedCharacterIterator} work in terms of
   * {@code Maps} of {@code TextAttributes}.  Normally,
   * all the attributes are examined and used to select and
   * configure a {@code Font} instance.  If a {@code FONT}
   * attribute is present, though, its associated {@code Font}
   * will be used.  This provides a way for users to override the
   * resolution of font attributes into a {@code Font}, or
   * force use of a particular {@code Font} instance.  This
   * also allows users to specify subclasses of {@code Font} in
   * cases where a {@code Font} can be subclassed.
   *
   * <p>{@code FONT} is used for special situations where
   * clients already have a {@code Font} instance but still
   * need to use {@code Map}-based APIs.  Typically, there will
   * be no other attributes in the {@code Map} except the
   * {@code FONT} attribute.  With {@code Map}-based APIs
   * the common case is to specify all attributes individually, so
   * {@code FONT} is not needed or desirable.
   *
   * <p>However, if both {@code FONT} and other attributes are
   * present in the {@code Map}, the rendering system will
   * merge the attributes defined in the {@code Font} with the
   * additional attributes.  This merging process classifies
   * {@code TextAttributes} into two groups.  One group, the
   * 'primary' group, is considered fundamental to the selection and
   * metric behavior of a font.  These attributes are
   * {@code FAMILY}, {@code WEIGHT}, {@code WIDTH},
   * {@code POSTURE}, {@code SIZE},
   * {@code TRANSFORM}, {@code SUPERSCRIPT}, and
   * {@code TRACKING}. The other group, the 'secondary' group,
   * consists of all other defined attributes, with the exception of
   * {@code FONT} itself.
   *
   * <p>To generate the new {@code Map}, first the
   * {@code Font} is obtained from the {@code FONT}
   * attribute, and <em>all</em> of its attributes extracted into a
   * new {@code Map}.  Then only the <em>secondary</em>
   * attributes from the original {@code Map} are added to
   * those in the new {@code Map}.  Thus the values of primary
   * attributes come solely from the {@code Font}, and the
   * values of secondary attributes originate with the
   * {@code Font} but can be overridden by other values in the
   * {@code Map}.
   *
   * <p><em>Note:</em>{@code Font's Map}-based
   * constructor and {@code deriveFont} methods do not process
   * the {@code FONT} attribute, as these are used to create
   * new {@code Font} objects.  Instead, {@link
   * java.awt.Font#getFont(Map) Font.getFont(Map)} should be used to
   * handle the {@code FONT} attribute.
   *
   * @see java.awt.Font
   */
  static FONT: TextAttribute = null;
  /**
   * Attribute key for a user-defined glyph to display in lieu
   * of the font's standard glyph for a character.  Values are
   * instances of GraphicAttribute.  The default value is null,
   * indicating that the standard glyphs provided by the font
   * should be used.
   *
   * <p>This attribute is used to reserve space for a graphic or
   * other component embedded in a line of text.  It is required for
   * correct positioning of 'inline' components within a line when
   * bidirectional reordering (see {@link java.text.Bidi}) is
   * performed.  Each character (Unicode code point) will be
   * rendered using the provided GraphicAttribute. Typically, the
   * characters to which this attribute is applied should be
   * <code>&#92;uFFFC</code>.
   *
   * <p>The GraphicAttribute determines the logical and visual
   * bounds of the text; the actual Font values are ignored.
   *
   * @see GraphicAttribute
   */
  static CHAR_REPLACEMENT: TextAttribute = null;
  /**
   * Attribute key for the paint used to render the text.  Values are
   * instances of <b>{@code Paint}</b>.  The default value is
   * null, indicating that the {@code Paint} set on the
   * {@code Graphics2D} at the time of rendering is used.
   *
   * <p>Glyphs will be rendered using this
   * {@code Paint} regardless of the {@code Paint} value
   * set on the {@code Graphics} (but see {@link #SWAP_COLORS}).
   *
   * @see java.awt.Paint
   * @see #SWAP_COLORS
   */
  static FOREGROUND: TextAttribute = null;
  /**
   * Attribute key for the paint used to render the background of
   * the text.  Values are instances of <b>{@code Paint}</b>.
   * The default value is null, indicating that the background
   * should not be rendered.
   *
   * <p>The logical bounds of the text will be filled using this
   * {@code Paint}, and then the text will be rendered on top
   * of it (but see {@link #SWAP_COLORS}).
   *
   * <p>The visual bounds of the text is extended to include the
   * logical bounds, if necessary.  The outline is not affected.
   *
   * @see java.awt.Paint
   * @see #SWAP_COLORS
   */
  static BACKGROUND: TextAttribute = null;
  /**
   * Attribute key for underline.  Values are instances of
   * <b>{@code Integer}</b>.  The default value is -1, which
   * means no underline.
   *
   * <p>The constant value {@link #UNDERLINE_ON} is provided.
   *
   * <p>The underline affects both the visual bounds and the outline
   * of the text.
   */
  static UNDERLINE: TextAttribute = null;
  /**
   * Standard underline.
   *
   * @see #UNDERLINE
   */
  static UNDERLINE_ON: number = null;
  /**
   * Attribute key for strikethrough.  Values are instances of
   * <b>{@code Boolean}</b>.  The default value is
   * {@code false}, which means no strikethrough.
   *
   * <p>The constant value {@link #STRIKETHROUGH_ON} is provided.
   *
   * <p>The strikethrough affects both the visual bounds and the
   * outline of the text.
   */
  static STRIKETHROUGH: TextAttribute = null;
  /**
   * A single strikethrough.
   *
   * @see #STRIKETHROUGH
   */
  static STRIKETHROUGH_ON: boolean = null;
  /**
   * Attribute key for the run direction of the line.  Values are
   * instances of <b>{@code Boolean}</b>.  The default value is
   * null, which indicates that the standard Bidi algorithm for
   * determining run direction should be used with the value {@link
   * java.text.Bidi#DIRECTION_DEFAULT_LEFT_TO_RIGHT}.
   *
   * <p>The constants {@link #RUN_DIRECTION_RTL} and {@link
   * #RUN_DIRECTION_LTR} are provided.
   *
   * <p>This determines the value passed to the {@link
   * java.text.Bidi} constructor to select the primary direction of
   * the text in the paragraph.
   *
   * <p><em>Note:</em> This attribute should have the same value for
   * all the text in a paragraph, otherwise the behavior is
   * undetermined.
   *
   * @see java.text.Bidi
   */
  static RUN_DIRECTION: TextAttribute = null;
  /**
   * Left-to-right run direction.
   * @see #RUN_DIRECTION
   */
  static RUN_DIRECTION_LTR: boolean = null;
  /**
   * Right-to-left run direction.
   * @see #RUN_DIRECTION
   */
  static RUN_DIRECTION_RTL: boolean = null;
  /**
   * Attribute key for the embedding level of the text.  Values are
   * instances of <b>{@code Integer}</b>.  The default value is
   * {@code null}, indicating that the Bidirectional
   * algorithm should run without explicit embeddings.
   *
   * <p>Positive values 1 through 61 are <em>embedding</em> levels,
   * negative values -1 through -61 are <em>override</em> levels.
   * The value 0 means that the base line direction is used.  These
   * levels are passed in the embedding levels array to the {@link
   * java.text.Bidi} constructor.
   *
   * <p><em>Note:</em> When this attribute is present anywhere in
   * a paragraph, then any Unicode bidi control characters (RLO,
   * LRO, RLE, LRE, and PDF) in the paragraph are
   * disregarded, and runs of text where this attribute is not
   * present are treated as though it were present and had the value
   * 0.
   *
   * @see java.text.Bidi
   */
  static BIDI_EMBEDDING: TextAttribute = null;
  /**
   * Attribute key for the justification of a paragraph.  Values are
   * instances of <b>{@code Number}</b>.  The default value is
   * 1, indicating that justification should use the full width
   * provided.  Values are pinned to the range [0..1].
   *
   * <p>The constants {@link #JUSTIFICATION_FULL} and {@link
   * #JUSTIFICATION_NONE} are provided.
   *
   * <p>Specifies the fraction of the extra space to use when
   * justification is requested on a {@code TextLayout}. For
   * example, if the line is 50 points wide and it is requested to
   * justify to 70 points, a value of 0.75 will pad to use
   * three-quarters of the remaining space, or 15 points, so that
   * the resulting line will be 65 points in length.
   *
   * <p><em>Note:</em> This should have the same value for all the
   * text in a paragraph, otherwise the behavior is undetermined.
   *
   * @see TextLayout#getJustifiedLayout
   */
  static JUSTIFICATION: TextAttribute = null;
  /**
   * Justify the line to the full requested width.  This is the
   * default value for {@code JUSTIFICATION}.
   * @see #JUSTIFICATION
   */
  static JUSTIFICATION_FULL: number = null;
  /**
   * Do not allow the line to be justified.
   * @see #JUSTIFICATION
   */
  static JUSTIFICATION_NONE: number = null;
  /**
   * Attribute key for input method highlight styles.
   *
   * <p>Values are instances of {@link
   * java.awt.im.InputMethodHighlight} or {@link
   * java.text.Annotation}.  The default value is {@code null},
   * which means that input method styles should not be applied
   * before rendering.
   *
   * <p>If adjacent runs of text with the same
   * {@code InputMethodHighlight} need to be rendered
   * separately, the {@code InputMethodHighlights} should be
   * wrapped in {@code Annotation} instances.
   *
   * <p>Input method highlights are used while text is being
   * composed by an input method. Text editing components should
   * retain them even if they generally only deal with unstyled
   * text, and make them available to the drawing routines.
   *
   * @see java.awt.Font
   * @see java.awt.im.InputMethodHighlight
   * @see java.text.Annotation
   */
  static INPUT_METHOD_HIGHLIGHT: TextAttribute = null;
  /**
   * Attribute key for input method underlines.  Values
   * are instances of <b>{@code Integer}</b>.  The default
   * value is {@code -1}, which means no underline.
   *
   * <p>Several constant values are provided, see {@link
   * #UNDERLINE_LOW_ONE_PIXEL}, {@link #UNDERLINE_LOW_TWO_PIXEL},
   * {@link #UNDERLINE_LOW_DOTTED}, {@link #UNDERLINE_LOW_GRAY}, and
   * {@link #UNDERLINE_LOW_DASHED}.
   *
   * <p>This may be used in conjunction with {@link #UNDERLINE} if
   * desired.  The primary purpose is for use by input methods.
   * Other use of these underlines for simple ornamentation might
   * confuse users.
   *
   * <p>The input method underline affects both the visual bounds and
   * the outline of the text.
   *
   * @since 1.3
   */
  static INPUT_METHOD_UNDERLINE: TextAttribute = null;
  /**
   * Single pixel solid low underline.
   * @see #INPUT_METHOD_UNDERLINE
   * @since 1.3
   */
  static UNDERLINE_LOW_ONE_PIXEL: number = null;
  /**
   * Double pixel solid low underline.
   * @see #INPUT_METHOD_UNDERLINE
   * @since 1.3
   */
  static UNDERLINE_LOW_TWO_PIXEL: number = null;
  /**
   * Single pixel dotted low underline.
   * @see #INPUT_METHOD_UNDERLINE
   * @since 1.3
   */
  static UNDERLINE_LOW_DOTTED: number = null;
  /**
   * Double pixel gray low underline.
   * @see #INPUT_METHOD_UNDERLINE
   * @since 1.3
   */
  static UNDERLINE_LOW_GRAY: number = null;
  /**
   * Single pixel dashed low underline.
   * @see #INPUT_METHOD_UNDERLINE
   * @since 1.3
   */
  static UNDERLINE_LOW_DASHED: number = null;
  /**
   * Attribute key for swapping foreground and background
   * {@code Paints}.  Values are instances of
   * <b>{@code Boolean}</b>.  The default value is
   * {@code false}, which means do not swap colors.
   *
   * <p>The constant value {@link #SWAP_COLORS_ON} is defined.
   *
   * <p>If the {@link #FOREGROUND} attribute is set, its
   * {@code Paint} will be used as the background, otherwise
   * the {@code Paint} currently on the {@code Graphics}
   * will be used.  If the {@link #BACKGROUND} attribute is set, its
   * {@code Paint} will be used as the foreground, otherwise
   * the system will find a contrasting color to the
   * (resolved) background so that the text will be visible.
   *
   * @see #FOREGROUND
   * @see #BACKGROUND
   */
  static SWAP_COLORS: TextAttribute = null;
  /**
   * Swap foreground and background.
   * @see #SWAP_COLORS
   * @since 1.3
   */
  static SWAP_COLORS_ON: boolean = null;
  /**
   * Attribute key for converting ASCII decimal digits to other
   * decimal ranges.  Values are instances of {@link NumericShaper}.
   * The default is {@code null}, which means do not perform
   * numeric shaping.
   *
   * <p>When a numeric shaper is defined, the text is first
   * processed by the shaper before any other analysis of the text
   * is performed.
   *
   * <p><em>Note:</em> This should have the same value for all the
   * text in the paragraph, otherwise the behavior is undetermined.
   *
   * @see NumericShaper
   * @since 1.4
   */
  static NUMERIC_SHAPING: TextAttribute = null;
  /**
   * Attribute key to request kerning. Values are instances of
   * <b>{@code Integer}</b>.  The default value is
   * {@code 0}, which does not request kerning.
   *
   * <p>The constant value {@link #KERNING_ON} is provided.
   *
   * <p>The default advances of single characters are not
   * appropriate for some character sequences, for example "To" or
   * "AWAY".  Without kerning the adjacent characters appear to be
   * separated by too much space.  Kerning causes selected sequences
   * of characters to be spaced differently for a more pleasing
   * visual appearance.
   *
   * @since 1.6
   */
  static KERNING: TextAttribute = null;
  /**
   * Request standard kerning.
   * @see #KERNING
   * @since 1.6
   */
  static KERNING_ON: number = null;
  /**
   * Attribute key for enabling optional ligatures. Values are
   * instances of <b>{@code Integer}</b>.  The default value is
   * {@code 0}, which means do not use optional ligatures.
   *
   * <p>The constant value {@link #LIGATURES_ON} is defined.
   *
   * <p>Ligatures required by the writing system are always enabled.
   *
   * @since 1.6
   */
  static LIGATURES: TextAttribute = null;
  /**
   * Request standard optional ligatures.
   * @see #LIGATURES
   * @since 1.6
   */
  static LIGATURES_ON: number = null;
  /**
   * Attribute key to control tracking.  Values are instances of
   * <b>{@code Number}</b>.  The default value is
   * {@code 0}, which means no additional tracking.
   *
   * <p>The constant values {@link #TRACKING_TIGHT} and {@link
   * #TRACKING_LOOSE} are provided.
   *
   * <p>The tracking value is multiplied by the font point size and
   * passed through the font transform to determine an additional
   * amount to add to the advance of each glyph cluster.  Positive
   * tracking values will inhibit formation of optional ligatures.
   * Tracking values are typically between {@code -0.1} and
   * {@code 0.3}; values outside this range are generally not
   * desirable.
   *
   * @since 1.6
   */
  static TRACKING: TextAttribute = null;
  /**
   * Perform tight tracking.
   * @see #TRACKING
   * @since 1.6
   */
  static TRACKING_TIGHT: number = null;
  /**
   * Perform loose tracking.
   * @see #TRACKING
   * @since 1.6
   */
  static TRACKING_LOOSE: number = null;
  /**
   * Constructs a {@code TextAttribute} with the specified name.
   * @param name the attribute name to assign to this
   * {@code TextAttribute}
   */
  _TextAttribute(name: string): this {
    this._AttributedCharacterIterator_Attribute(name);
    if (this.getClass() === $J.cls(TextAttribute)) {
      TextAttribute.instanceMap.put(name, this);
    }
    return this;
  }
  /**
   * Resolves instances being deserialized to the predefined constants.
   */
  readResolve(): any {
    if (this.getClass() !== $J.cls(TextAttribute)) {
      throw new InvalidObjectException('subclass didn\'t correctly implement readResolve');
    }
    let instance = TextAttribute.instanceMap.get(this.getName());
    if (instance != null) {
      return instance;
    } else {
      throw new InvalidObjectException('unknown attribute name');
    }
  }
  static $clinit() {
    TextAttribute.instanceMap = new HashMap(29);
    if (SharedSecrets.getJavaAWTFontAccess() == null) {
      SharedSecrets.setJavaAWTFontAccess(new JavaAWTFontAccessImpl()._JavaAWTFontAccessImpl());
    }
    TextAttribute.FAMILY = new TextAttribute()._TextAttribute('family');
    TextAttribute.WEIGHT = new TextAttribute()._TextAttribute('weight');
    TextAttribute.WEIGHT_EXTRA_LIGHT = $J.boxF($J.boxF(0.5));
    TextAttribute.WEIGHT_LIGHT = $J.boxF($J.boxF(0.75));
    TextAttribute.WEIGHT_DEMILIGHT = $J.boxF($J.boxF(0.875));
    TextAttribute.WEIGHT_REGULAR = $J.boxF($J.boxF(1));
    TextAttribute.WEIGHT_SEMIBOLD = $J.boxF($J.boxF(1.25));
    TextAttribute.WEIGHT_MEDIUM = $J.boxF($J.boxF(1.5));
    TextAttribute.WEIGHT_DEMIBOLD = $J.boxF($J.boxF(1.75));
    TextAttribute.WEIGHT_BOLD = $J.boxF($J.boxF(2));
    TextAttribute.WEIGHT_HEAVY = $J.boxF($J.boxF(2.25));
    TextAttribute.WEIGHT_EXTRABOLD = $J.boxF($J.boxF(2.5));
    TextAttribute.WEIGHT_ULTRABOLD = $J.boxF($J.boxF(2.75));
    TextAttribute.WIDTH = new TextAttribute()._TextAttribute('width');
    TextAttribute.WIDTH_CONDENSED = $J.boxF($J.boxF(0.75));
    TextAttribute.WIDTH_SEMI_CONDENSED = $J.boxF($J.boxF(0.875));
    TextAttribute.WIDTH_REGULAR = $J.boxF($J.boxF(1));
    TextAttribute.WIDTH_SEMI_EXTENDED = $J.boxF($J.boxF(1.25));
    TextAttribute.WIDTH_EXTENDED = $J.boxF($J.boxF(1.5));
    TextAttribute.POSTURE = new TextAttribute()._TextAttribute('posture');
    TextAttribute.POSTURE_REGULAR = $J.boxF($J.boxF(0));
    TextAttribute.POSTURE_OBLIQUE = $J.boxF($J.boxF(Math.fround(0.2)));
    TextAttribute.SIZE = new TextAttribute()._TextAttribute('size');
    TextAttribute.TRANSFORM = new TextAttribute()._TextAttribute('transform');
    TextAttribute.SUPERSCRIPT = new TextAttribute()._TextAttribute('superscript');
    TextAttribute.SUPERSCRIPT_SUPER = 1;
    TextAttribute.SUPERSCRIPT_SUB = -1;
    TextAttribute.FONT = new TextAttribute()._TextAttribute('font');
    TextAttribute.CHAR_REPLACEMENT = new TextAttribute()._TextAttribute('char_replacement');
    TextAttribute.FOREGROUND = new TextAttribute()._TextAttribute('foreground');
    TextAttribute.BACKGROUND = new TextAttribute()._TextAttribute('background');
    TextAttribute.UNDERLINE = new TextAttribute()._TextAttribute('underline');
    TextAttribute.UNDERLINE_ON = 0;
    TextAttribute.STRIKETHROUGH = new TextAttribute()._TextAttribute('strikethrough');
    TextAttribute.STRIKETHROUGH_ON = true;
    TextAttribute.RUN_DIRECTION = new TextAttribute()._TextAttribute('run_direction');
    TextAttribute.RUN_DIRECTION_LTR = false;
    TextAttribute.RUN_DIRECTION_RTL = true;
    TextAttribute.BIDI_EMBEDDING = new TextAttribute()._TextAttribute('bidi_embedding');
    TextAttribute.JUSTIFICATION = new TextAttribute()._TextAttribute('justification');
    TextAttribute.JUSTIFICATION_FULL = $J.boxF($J.boxF(1));
    TextAttribute.JUSTIFICATION_NONE = $J.boxF($J.boxF(0));
    TextAttribute.INPUT_METHOD_HIGHLIGHT = new TextAttribute()._TextAttribute('input method highlight');
    TextAttribute.INPUT_METHOD_UNDERLINE = new TextAttribute()._TextAttribute('input method underline');
    TextAttribute.UNDERLINE_LOW_ONE_PIXEL = 1;
    TextAttribute.UNDERLINE_LOW_TWO_PIXEL = 2;
    TextAttribute.UNDERLINE_LOW_DOTTED = 3;
    TextAttribute.UNDERLINE_LOW_GRAY = 4;
    TextAttribute.UNDERLINE_LOW_DASHED = 5;
    TextAttribute.SWAP_COLORS = new TextAttribute()._TextAttribute('swap_colors');
    TextAttribute.SWAP_COLORS_ON = true;
    TextAttribute.NUMERIC_SHAPING = new TextAttribute()._TextAttribute('numeric_shaping');
    TextAttribute.KERNING = new TextAttribute()._TextAttribute('kerning');
    TextAttribute.KERNING_ON = 1;
    TextAttribute.LIGATURES = new TextAttribute()._TextAttribute('ligatures');
    TextAttribute.LIGATURES_ON = 1;
    TextAttribute.TRACKING = new TextAttribute()._TextAttribute('tracking');
    TextAttribute.TRACKING_TIGHT = $J.boxF($J.boxF(Math.fround(-Math.fround(0.04))));
    TextAttribute.TRACKING_LOOSE = $J.boxF($J.boxF(Math.fround(0.04)));
  }
}

$J.define(TextAttribute, 'java.awt.font.TextAttribute', { kind: 'class', sup: 'java.text.AttributedCharacterIterator$Attribute', ctors: { 'java.lang.String': '_TextAttribute' }, clinit: true, lazy: ['instanceMap', 'FAMILY', 'WEIGHT', 'WEIGHT_EXTRA_LIGHT', 'WEIGHT_LIGHT', 'WEIGHT_DEMILIGHT', 'WEIGHT_REGULAR', 'WEIGHT_SEMIBOLD', 'WEIGHT_MEDIUM', 'WEIGHT_DEMIBOLD', 'WEIGHT_BOLD', 'WEIGHT_HEAVY', 'WEIGHT_EXTRABOLD', 'WEIGHT_ULTRABOLD', 'WIDTH', 'WIDTH_CONDENSED', 'WIDTH_SEMI_CONDENSED', 'WIDTH_REGULAR', 'WIDTH_SEMI_EXTENDED', 'WIDTH_EXTENDED', 'POSTURE', 'POSTURE_REGULAR', 'POSTURE_OBLIQUE', 'SIZE', 'TRANSFORM', 'SUPERSCRIPT', 'SUPERSCRIPT_SUPER', 'SUPERSCRIPT_SUB', 'FONT', 'CHAR_REPLACEMENT', 'FOREGROUND', 'BACKGROUND', 'UNDERLINE', 'UNDERLINE_ON', 'STRIKETHROUGH', 'STRIKETHROUGH_ON', 'RUN_DIRECTION', 'RUN_DIRECTION_LTR', 'RUN_DIRECTION_RTL', 'BIDI_EMBEDDING', 'JUSTIFICATION', 'JUSTIFICATION_FULL', 'JUSTIFICATION_NONE', 'INPUT_METHOD_HIGHLIGHT', 'INPUT_METHOD_UNDERLINE', 'UNDERLINE_LOW_ONE_PIXEL', 'UNDERLINE_LOW_TWO_PIXEL', 'UNDERLINE_LOW_DOTTED', 'UNDERLINE_LOW_GRAY', 'UNDERLINE_LOW_DASHED', 'SWAP_COLORS', 'SWAP_COLORS_ON', 'NUMERIC_SHAPING', 'KERNING', 'KERNING_ON', 'LIGATURES', 'LIGATURES_ON', 'TRACKING', 'TRACKING_TIGHT', 'TRACKING_LOOSE'] });
$J.module(() => {
  JavaAWTFontAccessImpl = $J.load('java.awt.font.JavaAWTFontAccessImpl');
});
