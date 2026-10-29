// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Font.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, ArrayIndexOutOfBoundsException, Character, CompositeFont, CoreMetrics, CreatedFontTracker, File, FileOutputStream, FilePermission, Files, FontAccess, FontDesignMetrics, FontLineMetrics, FontManagerFactory, FontUtilities, GlyphLayout, IOException, IllegalArgumentException, IndexOutOfBoundsException, InterruptedException, JObject, JString, Locale, NullPointerException, NumberFormatException, SecurityException, SoftReference, StandardGlyphVector, TextLayout, Throwable, Toolkit } from '../../../jre/index.ts';

let FontFormatException, RenderingHints, TextAttribute, AffineTransform, Point2D$Float, Rectangle2D$Float, ComponentFactory, AttributeMap, AttributeValues, EAttribute;

/**
 * The {@code Font} class represents fonts, which are used to
 * render text in a visible way.
 * A font provides the information needed to map sequences of
 * <em>characters</em> to sequences of <em>glyphs</em>
 * and to render sequences of glyphs on {@code Graphics} and
 * {@code Component} objects.
 *
 * <h2>Characters and Glyphs</h2>
 *
 * A <em>character</em> is a symbol that represents an item such as a letter,
 * a digit, or punctuation in an abstract way. For example, {@code 'g'},
 * LATIN SMALL LETTER G, is a character.
 * <p>
 * A <em>glyph</em> is a shape used to render a character or a sequence of
 * characters. In simple writing systems, such as Latin, typically one glyph
 * represents one character. In general, however, characters and glyphs do not
 * have one-to-one correspondence. For example, the character '&aacute;'
 * LATIN SMALL LETTER A WITH ACUTE, can be represented by
 * two glyphs: one for 'a' and one for '&acute;'. On the other hand, the
 * two-character string "fi" can be represented by a single glyph, an
 * "fi" ligature. In complex writing systems, such as Arabic or the South
 * and South-East Asian writing systems, the relationship between characters
 * and glyphs can be more complicated and involve context-dependent selection
 * of glyphs as well as glyph reordering.
 *
 * A font encapsulates the collection of glyphs needed to render a selected set
 * of characters as well as the tables needed to map sequences of characters to
 * corresponding sequences of glyphs.
 *
 * <h2>Physical and Logical Fonts</h2>
 *
 * The Java Platform distinguishes between two kinds of fonts:
 * <em>physical</em> fonts and <em>logical</em> fonts.
 * <p>
 * <em>Physical</em> fonts are the actual font libraries containing glyph data
 * and tables to map from character sequences to glyph sequences, using a font
 * technology such as TrueType or PostScript Type 1.
 * All implementations of the Java Platform must support TrueType fonts;
 * support for other font technologies is implementation dependent.
 * Physical fonts may use names such as Helvetica, Palatino, HonMincho, or
 * any number of other font names.
 * Typically, each physical font supports only a limited set of writing
 * systems, for example, only Latin characters or only Japanese and Basic
 * Latin.
 * The set of available physical fonts varies between configurations.
 * Applications that require specific fonts can bundle them and instantiate
 * them using the {@link #createFont createFont} method.
 * <p>
 * <em>Logical</em> fonts are the five font families defined by the Java
 * platform which must be supported by any Java runtime environment:
 * Serif, SansSerif, Monospaced, Dialog, and DialogInput.
 * These logical fonts are not actual font libraries. Instead, the logical
 * font names are mapped to physical fonts by the Java runtime environment.
 * The mapping is implementation and usually locale dependent, so the look
 * and the metrics provided by them vary.
 * Typically, each logical font name maps to several physical fonts in order to
 * cover a large range of characters.
 * <p>
 * Peered AWT components, such as {@link Label Label} and
 * {@link TextField TextField}, can only use logical fonts.
 * <p>
 * For a discussion of the relative advantages and disadvantages of using
 * physical or logical fonts, see the
 * <a href="https://docs.oracle.com/javase/tutorial/2d/text/fonts.html#advantages-and-disadvantages">
 *    Physical and Logical Fonts</a>
 * in <a href="https://docs.oracle.com/javase/tutorial/index.html">The Java Tutorials</a>
 * document.
 *
 * <h2>Font Faces and Names</h2>
 *
 * A {@code Font}
 * can have many faces, such as heavy, medium, oblique, gothic and
 * regular. All of these faces have similar typographic design.
 * <p>
 * There are three different names that you can get from a
 * {@code Font} object.  The <em>logical font name</em> is simply the
 * name that was used to construct the font.
 * The <em>font face name</em>, or just <em>font name</em> for
 * short, is the name of a particular font face, like Helvetica Bold. The
 * <em>family name</em> is the name of the font family that determines the
 * typographic design across several faces, like Helvetica.
 * <p>
 * The {@code Font} class represents an instance of a font face from
 * a collection of  font faces that are present in the system resources
 * of the host system.  As examples, Arial Bold and Courier Bold Italic
 * are font faces.  There can be several {@code Font} objects
 * associated with a font face, each differing in size, style, transform
 * and font features.
 * <p>
 * Glyphs may not always be rendered with the requested properties (e.g, font
 * and style) due to platform limitations such as the absence of suitable
 * platform fonts to implement a logical font.
 * <p>
 * The {@link GraphicsEnvironment#getAllFonts() getAllFonts} method
 * of the {@code GraphicsEnvironment} class returns an
 * array of all font faces available in the system. These font faces are
 * returned as {@code Font} objects with a size of 1, identity
 * transform and default font features. These
 * base fonts can then be used to derive new {@code Font} objects
 * with varying sizes, styles, transforms and font features via the
 * {@code deriveFont} methods in this class.
 *
 * <h2>Font and TextAttribute</h2>
 *
 * <p>{@code Font} supports most
 * {@code TextAttribute}s.  This makes some operations, such as
 * rendering underlined text, convenient since it is not
 * necessary to explicitly construct a {@code TextLayout} object.
 * Attributes can be set on a Font by constructing or deriving it
 * using a {@code Map} of {@code TextAttribute} values.
 *
 * <p>The values of some {@code TextAttributes} are not
 * serializable, and therefore attempting to serialize an instance of
 * {@code Font} that has such values will not serialize them.
 * This means a Font deserialized from such a stream will not compare
 * equal to the original Font that contained the non-serializable
 * attributes.  This should very rarely pose a problem
 * since these attributes are typically used only in special
 * circumstances and are unlikely to be serialized.
 *
 * <ul>
 * <li>{@code FOREGROUND} and {@code BACKGROUND} use
 * {@code Paint} values. The subclass {@code Color} is
 * serializable, while {@code GradientPaint} and
 * {@code TexturePaint} are not.</li>
 * <li>{@code CHAR_REPLACEMENT} uses
 * {@code GraphicAttribute} values.  The subclasses
 * {@code ShapeGraphicAttribute} and
 * {@code ImageGraphicAttribute} are not serializable.</li>
 * <li>{@code INPUT_METHOD_HIGHLIGHT} uses
 * {@code InputMethodHighlight} values, which are
 * not serializable.  See {@link java.awt.im.InputMethodHighlight}.</li>
 * </ul>
 *
 * <p>Clients who create custom subclasses of {@code Paint} and
 * {@code GraphicAttribute} can make them serializable and
 * avoid this problem.  Clients who use input method highlights can
 * convert these to the platform-specific attributes for that
 * highlight on the current platform and set them on the Font as
 * a workaround.
 *
 * <p>The {@code Map}-based constructor and
 * {@code deriveFont} APIs ignore the FONT attribute, and it is
 * not retained by the Font; the static {@link #getFont} method should
 * be used if the FONT attribute might be present.  See {@link
 * java.awt.font.TextAttribute#FONT} for more information.</p>
 *
 * <p>Several attributes will cause additional rendering overhead
 * and potentially invoke layout.  If a {@code Font} has such
 * attributes, the <code>{@link #hasLayoutAttributes()}</code> method
 * will return true.</p>
 *
 * <p>Note: Font rotations can cause text baselines to be rotated.  In
 * order to account for this (rare) possibility, font APIs are
 * specified to return metrics and take parameters 'in
 * baseline-relative coordinates'.  This maps the 'x' coordinate to
 * the advance along the baseline, (positive x is forward along the
 * baseline), and the 'y' coordinate to a distance along the
 * perpendicular to the baseline at 'x' (positive y is 90 degrees
 * clockwise from the baseline vector).  APIs for which this is
 * especially important are called out as having 'baseline-relative
 * coordinates.'
 */
export class Font extends JObject {
  /**
   * This is now only used during serialization.  Typically
   * it is null.
   *
   * @serial
   * @see #getAttributes()
   */
  fRequestedAttributes: Hashtable<any, any> = null;
  /**
   * A String constant for the canonical family name of the
   * logical font "Dialog". It is useful in Font construction
   * to provide compile-time verification of the name.
   * @since 1.6
   */
  static readonly DIALOG: string = 'Dialog';
  /**
   * A String constant for the canonical family name of the
   * logical font "DialogInput". It is useful in Font construction
   * to provide compile-time verification of the name.
   * @since 1.6
   */
  static readonly DIALOG_INPUT: string = 'DialogInput';
  /**
   * A String constant for the canonical family name of the
   * logical font "SansSerif". It is useful in Font construction
   * to provide compile-time verification of the name.
   * @since 1.6
   */
  static readonly SANS_SERIF: string = 'SansSerif';
  /**
   * A String constant for the canonical family name of the
   * logical font "Serif". It is useful in Font construction
   * to provide compile-time verification of the name.
   * @since 1.6
   */
  static readonly SERIF: string = 'Serif';
  /**
   * A String constant for the canonical family name of the
   * logical font "Monospaced". It is useful in Font construction
   * to provide compile-time verification of the name.
   * @since 1.6
   */
  static readonly MONOSPACED: string = 'Monospaced';
  /**
   * The plain style constant.
   */
  static readonly PLAIN: number = 0;
  /**
   * The bold style constant.  This can be combined with the other style
   * constants (except PLAIN) for mixed styles.
   */
  static readonly BOLD: number = 1;
  /**
   * The italicized style constant.  This can be combined with the other
   * style constants (except PLAIN) for mixed styles.
   */
  static readonly ITALIC: number = 2;
  /**
   * The baseline used in most Roman scripts when laying out text.
   */
  static readonly ROMAN_BASELINE: number = 0;
  /**
   * The baseline used in ideographic scripts like Chinese, Japanese,
   * and Korean when laying out text.
   */
  static readonly CENTER_BASELINE: number = 1;
  /**
   * The baseline used in Devanagari and similar scripts when laying
   * out text.
   */
  static readonly HANGING_BASELINE: number = 2;
  /**
   * Identify a font resource of type TRUETYPE.
   * Used to specify a TrueType font resource to the
   * {@link #createFont} method.
   * The TrueType format was extended to become the OpenType
   * format, which adds support for fonts with Postscript outlines,
   * this tag therefore references these fonts, as well as those
   * with TrueType outlines.
   * @since 1.3
   */
  static readonly TRUETYPE_FONT: number = 0;
  /**
   * Identify a font resource of type TYPE1.
   * Used to specify a Type1 font resource to the
   * {@link #createFont} method.
   * @since 1.5
   */
  static readonly TYPE1_FONT: number = 1;
  /**
   * The logical name of this {@code Font}, as passed to the
   * constructor.
   * @since 1.0
   *
   * @serial
   * @see #getName
   */
  name: string = null;
  /**
   * The style of this {@code Font}, as passed to the constructor.
   * This style can be PLAIN, BOLD, ITALIC, or BOLD+ITALIC.
   * @since 1.0
   *
   * @serial
   * @see #getStyle()
   */
  style: number = 0;
  /**
   * The point size of this {@code Font}, rounded to integer.
   * @since 1.0
   *
   * @serial
   * @see #getSize()
   */
  size_: number = 0;
  /**
   * The point size of this {@code Font} in {@code float}.
   *
   * @serial
   * @see #getSize()
   * @see #getSize2D()
   */
  pointSize: number = 0;
  /**
   * The platform specific font information.
   */
  peer: FontPeer = null;
  pData: number = 0;
  font2DHandle: Font2DHandle = null;
  values_: AttributeValues = null;
  hasLayoutAttributes_: boolean = false;
  createdFont: boolean = false;
  nonIdentityTx: boolean = false;
  static identityTx: AffineTransform = null;
  /**
   * Font recognizes all attributes except FONT.
   */
  static RECOGNIZED_MASK: number = 0;
  /**
   * These attributes are considered primary by the FONT attribute.
   */
  static PRIMARY_MASK: number = 0;
  /**
   * These attributes are considered secondary by the FONT attribute.
   */
  static SECONDARY_MASK: number = 0;
  /**
   * These attributes are handled by layout.
   */
  static LAYOUT_MASK: number = 0;
  static EXTRA_MASK: number = 0;
  static ssinfo: number[] = null;
  hash: number = 0;
  /**
   * The {@code Font} Serializable Data Form.
   *
   * @serial
   */
  fontSerializedDataVersion: number = 0;
  flmref: SoftReference<FontLineMetrics> = null;
  /**
   * A flag to layoutGlyphVector indicating that text is left-to-right as
   * determined by Bidi analysis.
   */
  static readonly LAYOUT_LEFT_TO_RIGHT: number = 0;
  /**
   * A flag to layoutGlyphVector indicating that text is right-to-left as
   * determined by Bidi analysis.
   */
  static readonly LAYOUT_RIGHT_TO_LEFT: number = 1;
  /**
   * A flag to layoutGlyphVector indicating that text in the char array
   * before the indicated start should not be examined.
   */
  static readonly LAYOUT_NO_START_CONTEXT: number = 2;
  /**
   * A flag to layoutGlyphVector indicating that text in the char array
   * after the indicated limit should not be examined.
   */
  static readonly LAYOUT_NO_LIMIT_CONTEXT: number = 4;
  $init_Font() {
    this.createdFont = false;
    this.fontSerializedDataVersion = 1;
  }
  /**
   * Creates a new {@code Font} from the specified name, style and
   * point size.
   * <p>
   * The font name can be a font face name or a font family name.
   * It is used together with the style to find an appropriate font face.
   * When a font family name is specified, the style argument is used to
   * select the most appropriate face from the family. When a font face
   * name is specified, the face's style and the style argument are
   * merged to locate the best matching font from the same family.
   * For example if face name "Arial Bold" is specified with style
   * {@code Font.ITALIC}, the font system looks for a face in the
   * "Arial" family that is bold and italic, and may associate the font
   * instance with the physical font face "Arial Bold Italic".
   * The style argument is merged with the specified face's style, not
   * added or subtracted.
   * This means, specifying a bold face and a bold style does not
   * double-embolden the font, and specifying a bold face and a plain
   * style does not lighten the font.
   * <p>
   * If no face for the requested style can be found, the font system
   * may apply algorithmic styling to achieve the desired style.
   * For example, if {@code ITALIC} is requested, but no italic
   * face is available, glyphs from the plain face may be algorithmically
   * obliqued (slanted).
   * <p>
   * Font name lookup is case insensitive, using the case folding
   * rules of the US locale.
   * <p>
   * If the {@code name} parameter represents something other than a
   * logical font, i.e. is interpreted as a physical font face or family, and
   * this cannot be mapped by the implementation to a physical font or a
   * compatible alternative, then the font system will map the Font
   * instance to "Dialog", such that for example, the family as reported
   * by {@link #getFamily() getFamily} will be "Dialog".
   *
   * @param name the font name.  This can be a font face name or a font
   * family name, and may represent either a logical font or a physical
   * font found in this {@code GraphicsEnvironment}.
   * The family names for logical fonts are: Dialog, DialogInput,
   * Monospaced, Serif, or SansSerif. Pre-defined String constants exist
   * for all of these names, for example, {@code DIALOG}. If {@code name} is
   * {@code null}, the <em>logical font name</em> of the new
   * {@code Font} as returned by {@code getName()} is set to
   * the name "Default".
   * @param style the style constant for the {@code Font}
   * The style argument is an integer bitmask that may
   * be {@code PLAIN}, or a bitwise union of {@code BOLD} and/or
   * {@code ITALIC} (for example, {@code ITALIC} or {@code BOLD|ITALIC}).
   * If the style argument does not conform to one of the expected
   * integer bitmasks then the style is set to {@code PLAIN}.
   * @param size the point size of the {@code Font}
   * @see GraphicsEnvironment#getAllFonts
   * @see GraphicsEnvironment#getAvailableFontFamilyNames
   * @since 1.0
   */
  _Font$String$int$int(name: string, style: number, size: number): this {
    this.$init_Font();
    this.name = (name != null) ? name : 'Default';
    this.style = (style & ~3) === 0 ? style : 0;
    this.size_ = size;
    this.pointSize = Math.fround(size);
    return this;
  }
  _Font$String$int$float(name: string, style: number, sizePts: number): this {
    this.$init_Font();
    this.name = (name != null) ? name : 'Default';
    this.style = (style & ~3) === 0 ? style : 0;
    this.size_ = $J.d2i((sizePts + 0.5));
    this.pointSize = sizePts;
    return this;
  }
  _Font$String$int$float$boolean$Font2DHandle(name: string, style: number, sizePts: number, created: boolean, handle: Font2DHandle): this {
    this._Font$String$int$float(name, style, sizePts);
    this.createdFont = created;
    if (created) {
      if ($J.isa(handle.font2D, CompositeFont) && handle.font2D.getStyle() !== style) {
        let fm = FontManagerFactory.getInstance();
        this.font2DHandle = fm.getNewComposite(null, style, handle);
      } else {
        this.font2DHandle = handle;
      }
    }
    return this;
  }
  _Font$File$int$boolean$CreatedFontTracker(fontFile: File, fontFormat: number, isCopy: boolean, tracker: CreatedFontTracker): this {
    this.$init_Font();
    this.createdFont = true;
    let fm = FontManagerFactory.getInstance();
    let fonts = fm.createFont2D(fontFile, fontFormat, false, isCopy, tracker);
    this.font2DHandle = fonts[0].handle;
    this.name = this.font2DHandle.font2D.getFontName(Locale.getDefault());
    this.style = Font.PLAIN;
    this.size_ = 1;
    this.pointSize = 1;
    return this;
  }
  _Font$AttributeValues$String$int$boolean$Font2DHandle(values: AttributeValues, oldName: string, oldStyle: number, created: boolean, handle: Font2DHandle): this {
    this.$init_Font();
    this.createdFont = created;
    if (created) {
      this.font2DHandle = handle;
      let newName = null;
      if (oldName != null) {
        newName = values.getFamily();
        if ($J.equals(oldName, newName)) {
          newName = null;
        }
      }
      let newStyle = 0;
      if (oldStyle === -1) {
        newStyle = -1;
      } else {
        if (values.getWeight() >= 2) {
          newStyle = Font.BOLD;
        }
        if (values.getPosture() >= Math.fround(0.2)) {
          newStyle |= Font.ITALIC;
        }
        if (oldStyle === newStyle) {
          newStyle = -1;
        }
      }
      if ($J.isa(handle.font2D, CompositeFont)) {
        if (newStyle !== -1 || newName != null) {
          let fm = FontManagerFactory.getInstance();
          this.font2DHandle = fm.getNewComposite(newName, newStyle, handle);
        }
      } else if (newName != null) {
        this.createdFont = false;
        this.font2DHandle = null;
      }
    }
    this.initFromValues(values);
    return this;
  }
  /**
   * Creates a new {@code Font} with the specified attributes.
   * Only keys defined in {@link java.awt.font.TextAttribute TextAttribute}
   * are recognized.  In addition the FONT attribute is
   *  not recognized by this constructor
   * (see {@link #getAvailableAttributes}). Only attributes that have
   * values of valid types will affect the new {@code Font}.
   * <p>
   * If {@code attributes} is {@code null}, a new
   * {@code Font} is initialized with default values.
   * @see java.awt.font.TextAttribute
   * @param attributes the attributes to assign to the new
   *          {@code Font}, or {@code null}
   */
  _Font$Map(attributes: JMap<AttributedCharacterIterator_Attribute, any>): this {
    this.$init_Font();
    this.initFromValues(AttributeValues.fromMap$Map$int(attributes, Font.RECOGNIZED_MASK));
    return this;
  }
  /**
   * Creates a new {@code Font} from the specified {@code font}.
   * This constructor is intended for use by subclasses.
   * @param font from which to create this {@code Font}.
   * @throws NullPointerException if {@code font} is null
   * @since 1.6
   */
  _Font$Font(font: Font): this {
    this.$init_Font();
    if (font.values_ != null) {
      this.initFromValues(font.getAttributeValues().clone());
    } else {
      this.name = font.name;
      this.style = font.style;
      this.size_ = font.size_;
      this.pointSize = font.pointSize;
    }
    this.font2DHandle = font.font2DHandle;
    this.createdFont = font.createdFont;
    return this;
  }
  _Font$Font2D(font2D: Font2D): this {
    this.$init_Font();
    this.createdFont = true;
    this.font2DHandle = font2D.handle;
    this.name = font2D.getFontName(Locale.getDefault());
    this.style = Font.PLAIN;
    this.size_ = 1;
    this.pointSize = 1;
    return this;
  }
  /**
   * Gets the peer of this {@code Font}.
   *
   * @return the peer of the {@code Font}.
   */
  getFontPeer(): FontPeer {
    if (this.peer == null) {
      let tk = Toolkit.getDefaultToolkit();
      if ($J.isa(tk, ComponentFactory)) {
        this.peer = (tk).getFontPeer(this.name, this.style);
      }
    }
    return this.peer;
  }
  /**
   * Return the AttributeValues object associated with this
   * font.  Most of the time, the internal object is null.
   * If required, it will be created from the 'standard'
   * state on the font.  Only non-default values will be
   * set in the AttributeValues object.
   *
   * <p>Since the AttributeValues object is mutable, and it
   * is cached in the font, care must be taken to ensure that
   * it is not mutated.
   */
  getAttributeValues(): AttributeValues {
    if (this.values_ == null) {
      let valuesTmp = new AttributeValues()._AttributeValues();
      valuesTmp.setFamily(this.name);
      valuesTmp.setSize(this.pointSize);
      if ((this.style & Font.BOLD) !== 0) {
        valuesTmp.setWeight(2);
      }
      if ((this.style & Font.ITALIC) !== 0) {
        valuesTmp.setPosture(Math.fround(0.2));
      }
      valuesTmp.defineAll(Font.PRIMARY_MASK);
      this.values_ = valuesTmp;
    }
    return this.values_;
  }
  getFont2D(): Font2D {
    let fm = FontManagerFactory.getInstance();
    if (this.font2DHandle == null) {
      this.font2DHandle = fm.findFont2D(this.name, this.style, 2).handle;
    }
    return this.font2DHandle.font2D;
  }
  /**
   * Initialize the standard Font fields from the values object.
   */
  initFromValues(values: AttributeValues): void {
    this.values_ = values;
    values.defineAll(Font.PRIMARY_MASK);
    this.name = values.getFamily();
    this.pointSize = values.getSize();
    this.size_ = $J.d2i((values.getSize() + 0.5));
    if (values.getWeight() >= 2) {
      this.style |= Font.BOLD;
    }
    if (values.getPosture() >= Math.fround(0.2)) {
      this.style |= Font.ITALIC;
    }
    this.nonIdentityTx = values.anyNonDefault(Font.EXTRA_MASK);
    this.hasLayoutAttributes_ = values.anyNonDefault(Font.LAYOUT_MASK);
  }
  /**
   * Returns true if any part of the specified text is from a
   * complex script for which the implementation will need to invoke
   * layout processing in order to render correctly when using
   * {@link Graphics#drawString(String,int,int) drawString(String,int,int)}
   * and other text rendering methods. Measurement of the text
   * may similarly need the same extra processing.
   * The {@code start} and {@code end} indices are provided so that
   * the application can request only a subset of the text be considered.
   * The last char index examined is at {@code "end-1"},
   * i.e a request to examine the entire array would be
   * <pre>
   * {@code Font.textRequiresLayout(chars, 0, chars.length);}
   * </pre>
   * An application may find this information helpful in
   * performance sensitive code.
   * <p>
   * Note that even if this method returns {@code false}, layout processing
   * may still be invoked when used with any {@code Font}
   * for which {@link #hasLayoutAttributes()} returns {@code true},
   * so that method will need to be consulted for the specific font,
   * in order to obtain an answer which accounts for such font attributes.
   *
   * @param chars the text.
   * @param start the index of the first char to examine.
   * @param end the ending index, exclusive.
   * @return {@code true} if the specified text will need special layout.
   * @throws NullPointerException if {@code chars} is null.
   * @throws ArrayIndexOutOfBoundsException if {@code start} is negative or
   * {@code end} is greater than the length of the {@code chars} array.
   * @since 9
   */
  static textRequiresLayout(chars: number[], start: number, end: number): boolean {
    if (chars == null) {
      throw new NullPointerException('null char array');
    }
    if (start < 0 || end > chars.length) {
      throw new ArrayIndexOutOfBoundsException('start < 0 or end > len');
    }
    return FontUtilities.isComplexScript(chars, start, end);
  }
  /**
   * Returns a {@code Font} appropriate to the attributes.
   * If {@code attributes} contains a {@code FONT} attribute
   * with a valid {@code Font} as its value, it will be
   * merged with any remaining attributes.  See
   * {@link java.awt.font.TextAttribute#FONT} for more
   * information.
   *
   * @param attributes the attributes to assign to the new
   *          {@code Font}
   * @return a new {@code Font} created with the specified
   *          attributes
   * @throws NullPointerException if {@code attributes} is null.
   * @since 1.2
   * @see java.awt.font.TextAttribute
   */
  static getFont$Map(attributes: JMap<AttributedCharacterIterator_Attribute, any>): Font {
    if (attributes instanceof AttributeMap && (attributes).getValues() != null) {
      let values = (attributes).getValues();
      if (values.isNonDefault(EAttribute.EFONT)) {
        let font = values.getFont();
        if (!values.anyDefined(Font.SECONDARY_MASK)) {
          return font;
        }
        values = font.getAttributeValues().clone();
        values.merge$Map$int(attributes, Font.SECONDARY_MASK);
        return new Font()._Font$AttributeValues$String$int$boolean$Font2DHandle(values, font.name, font.style, font.createdFont, font.font2DHandle);
      }
      return new Font()._Font$Map(attributes);
    }
    let font = attributes.get(TextAttribute.FONT);
    if (font != null) {
      if (attributes.size() > 1) {
        let values = font.getAttributeValues().clone();
        values.merge$Map$int(attributes, Font.SECONDARY_MASK);
        return new Font()._Font$AttributeValues$String$int$boolean$Font2DHandle(values, font.name, font.style, font.createdFont, font.font2DHandle);
      }
      return font;
    }
    return new Font()._Font$Map(attributes);
  }
  /**
   * Used with the byte count tracker for fonts created from streams.
   * If a thread can create temp files anyway, no point in counting
   * font bytes.
   */
  static hasTempPermission(): boolean {
    if ($J.system_getSecurityManager() == null) {
      return true;
    }
    let f = null;
    let hasPerm = false;
    try {
      f = Files.createTempFile('+~JT', '.tmp').toFile();
      f.delete();
      f = null;
      hasPerm = true;
    } catch ($e0) {
      {
        let t = $J.exc($e0);
      }
    }
    return hasPerm;
  }
  /**
   * Returns a new array of {@code Font} decoded from the specified stream.
   * The returned {@code Font[]} will have at least one element.
   * <p>
   * The explicit purpose of this variation on the
   * {@code createFont(int, InputStream)} method is to support font
   * sources which represent a TrueType/OpenType font collection and
   * be able to return all individual fonts in that collection.
   * Consequently this method will throw {@code FontFormatException}
   * if the data source does not contain at least one TrueType/OpenType
   * font. The same exception will also be thrown if any of the fonts in
   * the collection does not contain the required font tables.
   * <p>
   * The condition "at least one", allows for the stream to represent
   * a single OpenType/TrueType font. That is, it does not have to be
   * a collection.
   * Each {@code Font} element of the returned array is
   * created with a point size of 1 and style {@link #PLAIN PLAIN}.
   * This base font can then be used with the {@code deriveFont}
   * methods in this class to derive new {@code Font} objects with
   * varying sizes, styles, transforms and font features.
   * <p>This method does not close the {@link InputStream}.
   * <p>
   * To make each {@code Font} available to Font constructors it
   * must be registered in the {@code GraphicsEnvironment} by calling
   * {@link GraphicsEnvironment#registerFont(Font) registerFont(Font)}.
   * @param fontStream an {@code InputStream} object representing the
   * input data for the font or font collection.
   * @return a new {@code Font[]}.
   * @throws FontFormatException if the {@code fontStream} data does
   *     not contain the required font tables for any of the elements of
   *     the collection, or if it contains no fonts at all.
   * @throws IOException if the {@code fontStream} cannot be completely read.
   * @see GraphicsEnvironment#registerFont(Font)
   * @since 9
   */
  static createFonts$InputStream(fontStream: InputStream): Font[] {
    let fontFormat = Font.TRUETYPE_FONT;
    if (Font.hasTempPermission()) {
      return Font.createFont0(fontFormat, fontStream, true, null);
    }
    let tracker = CreatedFontTracker.getTracker();
    let acquired = false;
    try {
      acquired = tracker.acquirePermit();
      if (!acquired) {
        throw new IOException('Timed out waiting for resources.');
      }
      return Font.createFont0(fontFormat, fontStream, true, tracker);
    } catch ($e1) {
      if ($J.isa($e1, InterruptedException)) {
        let e = $J.exc($e1);
        throw new IOException('Problem reading font data.');
      } else {
        throw $e1;
      }
    } finally {
      if (acquired) {
        tracker.releasePermit();
      }
    }
  }
  /**
   * Returns a new array of {@code Font} decoded from the specified file.
   * The returned {@code Font[]} will have at least one element.
   * <p>
   * The explicit purpose of this variation on the
   * {@code createFont(int, File)} method is to support font
   * sources which represent a TrueType/OpenType font collection and
   * be able to return all individual fonts in that collection.
   * Consequently this method will throw {@code FontFormatException}
   * if the data source does not contain at least one TrueType/OpenType
   * font. The same exception will also be thrown if any of the fonts in
   * the collection does not contain the required font tables.
   * <p>
   * The condition "at least one", allows for the stream to represent
   * a single OpenType/TrueType font. That is, it does not have to be
   * a collection.
   * Each {@code Font} element of the returned array is
   * created with a point size of 1 and style {@link #PLAIN PLAIN}.
   * This base font can then be used with the {@code deriveFont}
   * methods in this class to derive new {@code Font} objects with
   * varying sizes, styles, transforms and font features.
   * <p>
   * To make each {@code Font} available to Font constructors it
   * must be registered in the {@code GraphicsEnvironment} by calling
   * {@link GraphicsEnvironment#registerFont(Font) registerFont(Font)}.
   * @param fontFile a {@code File} object containing the
   * input data for the font or font collection.
   * @return a new {@code Font[]}.
   * @throws FontFormatException if the {@code File} does
   *     not contain the required font tables for any of the elements of
   *     the collection, or if it contains no fonts at all.
   * @throws IOException if the {@code fontFile} cannot be read.
   * @see GraphicsEnvironment#registerFont(Font)
   * @since 9
   */
  static createFonts$File(fontFile: File): Font[] {
    let fontFormat = Font.TRUETYPE_FONT;
    fontFile = Font.checkFontFile(fontFormat, fontFile);
    let fm = FontManagerFactory.getInstance();
    let font2DArr = fm.createFont2D(fontFile, fontFormat, true, false, null);
    let num = font2DArr.length;
    let fonts = $J.newArray(num, null);
    for (let i = 0; i < num; i++) {
      fonts[i] = new Font()._Font$Font2D(font2DArr[i]);
    }
    return fonts;
  }
  /**
   * Returns a new {@code Font} using the specified font type
   * and input data.  The new {@code Font} is
   * created with a point size of 1 and style {@link #PLAIN PLAIN}.
   * This base font can then be used with the {@code deriveFont}
   * methods in this class to derive new {@code Font} objects with
   * varying sizes, styles, transforms and font features.  This
   * method does not close the {@link InputStream}.
   * <p>
   * To make the {@code Font} available to Font constructors the
   * returned {@code Font} must be registered in the
   * {@code GraphicsEnvironment} by calling
   * {@link GraphicsEnvironment#registerFont(Font) registerFont(Font)}.
   * @param fontFormat the type of the {@code Font}, which is
   * {@link #TRUETYPE_FONT TRUETYPE_FONT} if a TrueType resource is specified.
   * or {@link #TYPE1_FONT TYPE1_FONT} if a Type 1 resource is specified.
   * @param fontStream an {@code InputStream} object representing the
   * input data for the font.
   * @return a new {@code Font} created with the specified font type.
   * @throws IllegalArgumentException if {@code fontFormat} is not
   *     {@code TRUETYPE_FONT} or {@code TYPE1_FONT}.
   * @throws FontFormatException if the {@code fontStream} data does
   *     not contain the required font tables for the specified format.
   * @throws IOException if the {@code fontStream}
   *     cannot be completely read.
   * @see GraphicsEnvironment#registerFont(Font)
   * @since 1.3
   */
  static createFont$int$InputStream(fontFormat: number, fontStream: InputStream): Font {
    if (Font.hasTempPermission()) {
      return Font.createFont0(fontFormat, fontStream, false, null)[0];
    }
    let tracker = CreatedFontTracker.getTracker();
    let acquired = false;
    try {
      acquired = tracker.acquirePermit();
      if (!acquired) {
        throw new IOException('Timed out waiting for resources.');
      }
      return Font.createFont0(fontFormat, fontStream, false, tracker)[0];
    } catch ($e2) {
      if ($J.isa($e2, InterruptedException)) {
        let e = $J.exc($e2);
        throw new IOException('Problem reading font data.');
      } else {
        throw $e2;
      }
    } finally {
      if (acquired) {
        tracker.releasePermit();
      }
    }
  }
  static createFont0(fontFormat: number, fontStream: InputStream, allFonts: boolean, tracker: CreatedFontTracker): Font[] {
    if (fontFormat !== Font.TRUETYPE_FONT && fontFormat !== Font.TYPE1_FONT) {
      throw new IllegalArgumentException('font format not recognized');
    }
    let copiedFontData = false;
    try {
      let tFile = AccessController.doPrivileged(new (Font$1())());
      if (tracker != null) {
        tracker.add(tFile);
      }
      let totalSize = 0;
      try {
        let outStream = AccessController.doPrivileged(new (Font$2())().$c(tFile));
        if (tracker != null) {
          tracker.set(tFile, outStream);
        }
        {
          const $res3 = outStream;
          try {
            let buf = $J.newArray(8192, 0);
            for (; ; ) {
              let bytesRead = fontStream.read(buf);
              if (bytesRead < 0) {
                break;
              }
              if (tracker != null) {
                if (((totalSize + bytesRead) | 0) > 33554432) {
                  throw new IOException('File too big.');
                }
                if (((totalSize + tracker.getNumBytes()) | 0) > 335544320) {
                  throw new IOException('Total files too big.');
                }
                totalSize = (totalSize + bytesRead) | 0;
                tracker.addBytes(bytesRead);
              }
              outStream.write(buf, 0, bytesRead);
            }
          } finally {
            if ($res3 != null) $res3.close();
          }
        }
        copiedFontData = true;
        let fm = FontManagerFactory.getInstance();
        let font2DArr = fm.createFont2D(tFile, fontFormat, allFonts, true, tracker);
        let num = font2DArr.length;
        let fonts = $J.newArray(num, null);
        for (let i = 0; i < num; i++) {
          fonts[i] = new Font()._Font$Font2D(font2DArr[i]);
        }
        return fonts;
      } finally {
        if (tracker != null) {
          tracker.remove(tFile);
        }
        if (!copiedFontData) {
          if (tracker != null) {
            tracker.subBytes(totalSize);
          }
          AccessController.doPrivileged(new (Font$3())().$c(tFile));
        }
      }
    } catch ($e4) {
      {
        let t = $J.exc($e4);
        if (t instanceof FontFormatException) {
          throw t;
        }
        if ($J.isa(t, IOException)) {
          throw t;
        }
        let cause = t.getCause();
        if (cause instanceof FontFormatException) {
          throw cause;
        }
        throw new IOException('Problem reading font data.');
      }
    }
  }
  /**
   * Returns a new {@code Font} using the specified font type
   * and the specified font file.  The new {@code Font} is
   * created with a point size of 1 and style {@link #PLAIN PLAIN}.
   * This base font can then be used with the {@code deriveFont}
   * methods in this class to derive new {@code Font} objects with
   * varying sizes, styles, transforms and font features.
   * @param fontFormat the type of the {@code Font}, which is
   * {@link #TRUETYPE_FONT TRUETYPE_FONT} if a TrueType resource is
   * specified or {@link #TYPE1_FONT TYPE1_FONT} if a Type 1 resource is
   * specified.
   * So long as the returned font, or its derived fonts are referenced
   * the implementation may continue to access {@code fontFile}
   * to retrieve font data. Thus the results are undefined if the file
   * is changed, or becomes inaccessible.
   * <p>
   * To make the {@code Font} available to Font constructors the
   * returned {@code Font} must be registered in the
   * {@code GraphicsEnvironment} by calling
   * {@link GraphicsEnvironment#registerFont(Font) registerFont(Font)}.
   * @param fontFile a {@code File} object representing the
   * input data for the font.
   * @return a new {@code Font} created with the specified font type.
   * @throws IllegalArgumentException if {@code fontFormat} is not
   *     {@code TRUETYPE_FONT} or {@code TYPE1_FONT}.
   * @throws NullPointerException if {@code fontFile} is null.
   * @throws IOException if the {@code fontFile} cannot be read.
   * @throws FontFormatException if {@code fontFile} does
   *     not contain the required font tables for the specified format.
   * @throws SecurityException if the executing code does not have
   * permission to read from the file.
   * @see GraphicsEnvironment#registerFont(Font)
   * @since 1.5
   */
  static createFont$int$File(fontFormat: number, fontFile: File): Font {
    fontFile = Font.checkFontFile(fontFormat, fontFile);
    return new Font()._Font$File$int$boolean$CreatedFontTracker(fontFile, fontFormat, false, null);
  }
  static checkFontFile(fontFormat: number, fontFile: File): File {
    fontFile = new File(fontFile.getPath());
    if (fontFormat !== Font.TRUETYPE_FONT && fontFormat !== Font.TYPE1_FONT) {
      throw new IllegalArgumentException('font format not recognized');
    }
    let sm = $J.system_getSecurityManager();
    if (sm != null) {
      let filePermission = new FilePermission(fontFile.getPath(), 'read');
      sm.checkPermission(filePermission);
    }
    if (!fontFile.canRead()) {
      throw new IOException('Can\'t read ' + $J.str(fontFile));
    }
    return fontFile;
  }
  /**
   * Returns a copy of the transform associated with this
   * {@code Font}.  This transform is not necessarily the one
   * used to construct the font.  If the font has algorithmic
   * superscripting or width adjustment, this will be incorporated
   * into the returned {@code AffineTransform}.
   * <p>
   * Typically, fonts will not be transformed.  Clients generally
   * should call {@link #isTransformed} first, and only call this
   * method if {@code isTransformed} returns true.
   *
   * @return an {@link AffineTransform} object representing the
   *          transform attribute of this {@code Font} object.
   */
  getTransform(): AffineTransform {
    if (this.nonIdentityTx) {
      let values = this.getAttributeValues();
      let at = values.isNonDefault(EAttribute.ETRANSFORM) ? new AffineTransform()._AffineTransform$AffineTransform(values.getTransform()) : new AffineTransform()._AffineTransform$();
      if (values.getSuperscript() !== 0) {
        let superscript = values.getSuperscript();
        let trans = 0;
        let n = 0;
        let up = superscript > 0;
        let sign = up ? -1 : 1;
        let ss = up ? superscript : -superscript;
        while ((ss & 7) > n) {
          let newn = ss & 7;
          trans += Math.fround(sign * (Math.fround(Font.ssinfo[newn] - Font.ssinfo[n])));
          ss >>= 3;
          sign = -sign;
          n = newn;
        }
        trans *= this.pointSize;
        let scale = $J.pow(2 / 3, n);
        at.preConcatenate(AffineTransform.getTranslateInstance(0, trans));
        at.scale(scale, scale);
      }
      if (values.isNonDefault(EAttribute.EWIDTH)) {
        at.scale(values.getWidth(), 1);
      }
      return at;
    }
    return new AffineTransform()._AffineTransform$();
  }
  /**
   * Returns the family name of this {@code Font}.
   *
   * <p>The family name of a font is font specific. Two fonts such as
   * Helvetica Italic and Helvetica Bold have the same family name,
   * <i>Helvetica</i>, whereas their font face names are
   * <i>Helvetica Bold</i> and <i>Helvetica Italic</i>. The list of
   * available family names may be obtained by using the
   * {@link GraphicsEnvironment#getAvailableFontFamilyNames()} method.
   *
   * <p>Use {@code getName} to get the logical name of the font.
   * Use {@code getFontName} to get the font face name of the font.
   * @return a {@code String} that is the family name of this
   *          {@code Font}.
   *
   * @see #getName
   * @see #getFontName
   * @since 1.1
   */
  getFamily$(): string {
    return this.getFamily_NoClientCode();
  }
  getFamily_NoClientCode(): string {
    return this.getFamily$Locale(Locale.getDefault());
  }
  /**
   * Returns the family name of this {@code Font}, localized for
   * the specified locale.
   *
   * <p>The family name of a font is font specific. Two fonts such as
   * Helvetica Italic and Helvetica Bold have the same family name,
   * <i>Helvetica</i>, whereas their font face names are
   * <i>Helvetica Bold</i> and <i>Helvetica Italic</i>. The list of
   * available family names may be obtained by using the
   * {@link GraphicsEnvironment#getAvailableFontFamilyNames()} method.
   *
   * <p>Use {@code getFontName} to get the font face name of the font.
   * @param l locale for which to get the family name
   * @return a {@code String} representing the family name of the
   *          font, localized for the specified locale.
   * @see #getFontName
   * @see java.util.Locale
   * @since 1.2
   */
  getFamily$Locale(l: Locale): string {
    if (l == null) {
      throw new NullPointerException('null locale doesn\'t mean default');
    }
    return this.getFont2D().getFamilyName(l);
  }
  /**
   * Returns the postscript name of this {@code Font}.
   * Use {@code getFamily} to get the family name of the font.
   * Use {@code getFontName} to get the font face name of the font.
   * @return a {@code String} representing the postscript name of
   *          this {@code Font}.
   * @since 1.2
   */
  getPSName(): string {
    return this.getFont2D().getPostscriptName();
  }
  /**
   * Returns the logical name of this {@code Font}.
   * Use {@code getFamily} to get the family name of the font.
   * Use {@code getFontName} to get the font face name of the font.
   * @return a {@code String} representing the logical name of
   *          this {@code Font}.
   * @see #getFamily
   * @see #getFontName
   * @since 1.0
   */
  getName(): string {
    return this.name;
  }
  /**
   * Returns the font face name of this {@code Font}.  For example,
   * Helvetica Bold could be returned as a font face name.
   * Use {@code getFamily} to get the family name of the font.
   * Use {@code getName} to get the logical name of the font.
   * @return a {@code String} representing the font face name of
   *          this {@code Font}.
   * @see #getFamily
   * @see #getName
   * @since 1.2
   */
  getFontName$(): string {
    return this.getFontName$Locale(Locale.getDefault());
  }
  /**
   * Returns the font face name of the {@code Font}, localized
   * for the specified locale. For example, Helvetica Fett could be
   * returned as the font face name.
   * Use {@code getFamily} to get the family name of the font.
   * @param l a locale for which to get the font face name
   * @return a {@code String} representing the font face name,
   *          localized for the specified locale.
   * @see #getFamily
   * @see java.util.Locale
   */
  getFontName$Locale(l: Locale): string {
    if (l == null) {
      throw new NullPointerException('null locale doesn\'t mean default');
    }
    return this.getFont2D().getFontName(l);
  }
  /**
   * Returns the style of this {@code Font}.  The style can be
   * PLAIN, BOLD, ITALIC, or BOLD+ITALIC.
   * @return the style of this {@code Font}
   * @see #isPlain
   * @see #isBold
   * @see #isItalic
   * @since 1.0
   */
  getStyle(): number {
    return this.style;
  }
  /**
   * Returns the point size of this {@code Font}, rounded to
   * an integer.
   * Most users are familiar with the idea of using <i>point size</i> to
   * specify the size of glyphs in a font. This point size defines a
   * measurement between the baseline of one line to the baseline of the
   * following line in a single spaced text document. The point size is
   * based on <i>typographic points</i>, approximately 1/72 of an inch.
   * <p>
   * The Java(tm)2D API adopts the convention that one point is
   * equivalent to one unit in user coordinates.  When using a
   * normalized transform for converting user space coordinates to
   * device space coordinates 72 user
   * space units equal 1 inch in device space.  In this case one point
   * is 1/72 of an inch.
   * @return the point size of this {@code Font} in 1/72 of an
   *          inch units.
   * @see #getSize2D
   * @see GraphicsConfiguration#getDefaultTransform
   * @see GraphicsConfiguration#getNormalizingTransform
   * @since 1.0
   */
  getSize(): number {
    return this.size_;
  }
  /**
   * Returns the point size of this {@code Font} in
   * {@code float} value.
   * @return the point size of this {@code Font} as a
   * {@code float} value.
   * @see #getSize
   * @since 1.2
   */
  getSize2D(): number {
    return this.pointSize;
  }
  /**
   * Indicates whether or not this {@code Font} object's style is
   * PLAIN.
   * @return    {@code true} if this {@code Font} has a
   *            PLAIN style;
   *            {@code false} otherwise.
   * @see       java.awt.Font#getStyle
   * @since     1.0
   */
  isPlain(): boolean {
    return this.style === 0;
  }
  /**
   * Indicates whether or not this {@code Font} object's style is
   * BOLD.
   * @return    {@code true} if this {@code Font} object's
   *            style is BOLD;
   *            {@code false} otherwise.
   * @see       java.awt.Font#getStyle
   * @since     1.0
   */
  isBold(): boolean {
    return (this.style & Font.BOLD) !== 0;
  }
  /**
   * Indicates whether or not this {@code Font} object's style is
   * ITALIC.
   * @return    {@code true} if this {@code Font} object's
   *            style is ITALIC;
   *            {@code false} otherwise.
   * @see       java.awt.Font#getStyle
   * @since     1.0
   */
  isItalic(): boolean {
    return (this.style & Font.ITALIC) !== 0;
  }
  /**
   * Indicates whether or not this {@code Font} object has a
   * transform that affects its size in addition to the Size
   * attribute.
   * @return  {@code true} if this {@code Font} object
   *          has a non-identity AffineTransform attribute.
   *          {@code false} otherwise.
   * @see     java.awt.Font#getTransform
   * @since   1.4
   */
  isTransformed(): boolean {
    return this.nonIdentityTx;
  }
  /**
   * Return true if this Font contains attributes that require extra
   * layout processing.
   * @return true if the font has layout attributes
   * @since 1.6
   */
  hasLayoutAttributes(): boolean {
    return this.hasLayoutAttributes_;
  }
  /**
   * Returns a {@code Font} object from the system properties list.
   * {@code nm} is treated as the name of a system property to be
   * obtained.  The {@code String} value of this property is then
   * interpreted as a {@code Font} object according to the
   * specification of {@code Font.decode(String)}
   * If the specified property is not found, or the executing code does
   * not have permission to read the property, null is returned instead.
   *
   * @param nm the property name
   * @return a {@code Font} object that the property name
   *          describes, or null if no such property exists.
   * @throws NullPointerException if nm is null.
   * @since 1.2
   * @see #decode(String)
   */
  static getFont$String(nm: string): Font {
    return Font.getFont$String$Font(nm, null);
  }
  /**
   * Returns the {@code Font} that the {@code str}
   * argument describes.
   * To ensure that this method returns the desired Font,
   * format the {@code str} parameter in
   * one of these ways
   *
   * <ul>
   * <li><em>fontname-style-pointsize</em>
   * <li><em>fontname-pointsize</em>
   * <li><em>fontname-style</em>
   * <li><em>fontname</em>
   * <li><em>fontname style pointsize</em>
   * <li><em>fontname pointsize</em>
   * <li><em>fontname style</em>
   * <li><em>fontname</em>
   * </ul>
   * in which <i>style</i> is one of the four
   * case-insensitive strings:
   * {@code "PLAIN"}, {@code "BOLD"}, {@code "BOLDITALIC"}, or
   * {@code "ITALIC"}, and pointsize is a positive decimal integer
   * representation of the point size.
   * For example, if you want a font that is Arial, bold, with
   * a point size of 18, you would call this method with:
   * "Arial-BOLD-18".
   * This is equivalent to calling the Font constructor :
   * {@code new Font("Arial", Font.BOLD, 18);}
   * and the values are interpreted as specified by that constructor.
   * <p>
   * A valid trailing decimal field is always interpreted as the pointsize.
   * Therefore a fontname containing a trailing decimal value should not
   * be used in the fontname only form.
   * <p>
   * If a style name field is not one of the valid style strings, it is
   * interpreted as part of the font name, and the default style is used.
   * <p>
   * Only one of ' ' or '-' may be used to separate fields in the input.
   * The identified separator is the one closest to the end of the string
   * which separates a valid pointsize, or a valid style name from
   * the rest of the string.
   * Null (empty) pointsize and style fields are treated
   * as valid fields with the default value for that field.
   * <p>
   * Some font names may include the separator characters ' ' or '-'.
   * If {@code str} is not formed with 3 components, e.g. such that
   * {@code style} or {@code pointsize} fields are not present in
   * {@code str}, and {@code fontname} also contains a
   * character determined to be the separator character
   * then these characters where they appear as intended to be part of
   * {@code fontname} may instead be interpreted as separators
   * so the font name may not be properly recognised.
   *
   * <p>
   * The default size is 12 and the default style is PLAIN.
   * If {@code str} does not specify a valid size, the returned
   * {@code Font} has a size of 12.  If {@code str} does not
   * specify a valid style, the returned Font has a style of PLAIN.
   * If you do not specify a valid font name in
   * the {@code str} argument, this method will return
   * a font with the family name "Dialog".
   * To determine what font family names are available on
   * your system, use the
   * {@link GraphicsEnvironment#getAvailableFontFamilyNames()} method.
   * If {@code str} is {@code null}, a new {@code Font}
   * is returned with the family name "Dialog", a size of 12 and a
   * PLAIN style.
   * @param str the name of the font, or {@code null}
   * @return the {@code Font} object that {@code str}
   *          describes, or a new default {@code Font} if
   *          {@code str} is {@code null}.
   * @see #getFamily
   * @since 1.1
   */
  static decode(str: string): Font {
    let fontName = str;
    let styleName = '';
    let fontSize = 12;
    let fontStyle = Font.PLAIN;
    if (str == null) {
      return new Font()._Font$String$int$int(Font.DIALOG, fontStyle, fontSize);
    }
    let lastHyphen = str.lastIndexOf(String.fromCharCode(45 /* '-' */));
    let lastSpace = str.lastIndexOf(String.fromCharCode(32 /* ' ' */));
    let sepChar = (lastHyphen > lastSpace) ? 45 /* '-' */ : 32 /* ' ' */;
    let sizeIndex = str.lastIndexOf(String.fromCharCode(sepChar));
    let styleIndex = str.lastIndexOf(String.fromCharCode(sepChar), (sizeIndex - 1) | 0);
    let strlen = str.length;
    if (sizeIndex > 0 && ((sizeIndex + 1) | 0) < strlen) {
      try {
        fontSize = $J.parseInt(str.substring((sizeIndex + 1) | 0));
        if (fontSize <= 0) {
          fontSize = 12;
        }
      } catch ($e5) {
        if ($J.isa($e5, NumberFormatException)) {
          let e = $J.exc($e5);
          styleIndex = sizeIndex;
          sizeIndex = strlen;
          if (str.charCodeAt((sizeIndex - 1) | 0) === sepChar) {
            sizeIndex--;
          }
        } else {
          throw $e5;
        }
      }
    }
    if (styleIndex >= 0 && ((styleIndex + 1) | 0) < strlen) {
      styleName = str.substring((styleIndex + 1) | 0, sizeIndex);
      styleName = styleName.toLowerCase();
      if ($J.equals(styleName, 'bolditalic')) {
        fontStyle = Font.BOLD | Font.ITALIC;
      } else if ($J.equals(styleName, 'italic')) {
        fontStyle = Font.ITALIC;
      } else if ($J.equals(styleName, 'bold')) {
        fontStyle = Font.BOLD;
      } else if ($J.equals(styleName, 'plain')) {
        fontStyle = Font.PLAIN;
      } else {
        styleIndex = sizeIndex;
        if (str.charCodeAt((styleIndex - 1) | 0) === sepChar) {
          styleIndex--;
        }
      }
      fontName = str.substring(0, styleIndex);
    } else {
      let fontEnd = strlen;
      if (styleIndex > 0) {
        fontEnd = styleIndex;
      } else if (sizeIndex > 0) {
        fontEnd = sizeIndex;
      }
      if (fontEnd > 0 && str.charCodeAt((fontEnd - 1) | 0) === sepChar) {
        fontEnd--;
      }
      fontName = str.substring(0, fontEnd);
    }
    return new Font()._Font$String$int$int(fontName, fontStyle, fontSize);
  }
  /**
   * Gets the specified {@code Font} from the system properties
   * list.  As in the {@code getProperty} method of
   * {@code System}, the first
   * argument is treated as the name of a system property to be
   * obtained.  The {@code String} value of this property is then
   * interpreted as a {@code Font} object.
   * <p>
   * The property value should be one of the forms accepted by
   * {@code Font.decode(String)}
   * If the specified property is not found, or the executing code does not
   * have permission to read the property, the {@code font}
   * argument is returned instead.
   * @param nm the case-insensitive property name
   * @param font a default {@code Font} to return if property
   *          {@code nm} is not defined
   * @return    the {@code Font} value of the property.
   * @throws NullPointerException if nm is null.
   * @see #decode(String)
   */
  static getFont$String$Font(nm: string, font: Font): Font {
    let str = null;
    try {
      str = $J.system_getProperty(nm);
    } catch ($e6) {
      if ($J.isa($e6, SecurityException)) {
        let e = $J.exc($e6);
      } else {
        throw $e6;
      }
    }
    if (str == null) {
      return font;
    }
    return Font.decode(str);
  }
  /**
   * Returns a hashcode for this {@code Font}.
   * @return     a hashcode value for this {@code Font}.
   * @since      1.0
   */
  hashCode(): number {
    if (this.hash === 0) {
      this.hash = $J.hashCode(this.name) ^ this.style ^ this.size_;
      if (this.nonIdentityTx && this.values_ != null && this.values_.getTransform() != null) {
        this.hash ^= this.values_.getTransform().hashCode();
      }
    }
    return this.hash;
  }
  /**
   * Compares this {@code Font} object to the specified
   * {@code Object}.
   * @param obj the {@code Object} to compare
   * @return {@code true} if the objects are the same
   *          or if the argument is a {@code Font} object
   *          describing the same font as this object;
   *          {@code false} otherwise.
   * @since 1.0
   */
  equals(obj: any): boolean {
    if (obj === this) {
      return true;
    }
    if (obj instanceof Font) {
      let font = obj;
      if (this.size_ === font.size_ && this.style === font.style && this.nonIdentityTx === font.nonIdentityTx && this.hasLayoutAttributes_ === font.hasLayoutAttributes_ && this.pointSize === font.pointSize && $J.equals(this.name, font.name)) {
        if (this.values_ == null) {
          if (font.values_ == null) {
            return true;
          } else {
            return this.getAttributeValues().equals$AttributeValues(font.values_);
          }
        } else {
          return this.values_.equals$AttributeValues(font.getAttributeValues());
        }
      }
    }
    return false;
  }
  /**
   * Converts this {@code Font} object to a {@code String}
   * representation.
   * @return     a {@code String} representation of this
   *          {@code Font} object.
   * @since      1.0
   */
  toString(): string {
    let strStyle: string;
    if (this.isBold()) {
      strStyle = this.isItalic() ? 'bolditalic' : 'bold';
    } else {
      strStyle = this.isItalic() ? 'italic' : 'plain';
    }
    return $J.getClass(this).getName() + '[family=' + this.getFamily$() + ',name=' + this.name + ',style=' + strStyle + ',size=' + this.size_ + ']';
  }
  /**
   * Writes default serializable fields to a stream.
   *
   * @param  s the {@code ObjectOutputStream} to write
   * @throws IOException if an I/O error occurs
   * @see AWTEventMulticaster#save(ObjectOutputStream, String, EventListener)
   * @see #readObject(java.io.ObjectInputStream)
   */
  writeObject(s: ObjectOutputStream): void {
    if (this.values_ != null) {
      {
        this.fRequestedAttributes = this.values_.toSerializableHashtable();
        s.defaultWriteObject();
        this.fRequestedAttributes = null;
      }
    } else {
      s.defaultWriteObject();
    }
  }
  /**
   * Reads the {@code ObjectInputStream}.
   * Unrecognized keys or values will be ignored.
   *
   * @param  s the {@code ObjectInputStream} to read
   * @throws ClassNotFoundException if the class of a serialized object could
   *         not be found
   * @throws IOException if an I/O error occurs
   *
   * @see #writeObject(java.io.ObjectOutputStream)
   */
  readObject(s: ObjectInputStream): void {
    s.defaultReadObject();
    if (this.pointSize === Math.fround(0)) {
      this.pointSize = Math.fround(this.size_);
    }
    if (this.fRequestedAttributes != null) {
      try {
        this.values_ = this.getAttributeValues();
        let extras = AttributeValues.fromSerializableHashtable(this.fRequestedAttributes);
        if (!AttributeValues.is16Hashtable(this.fRequestedAttributes)) {
          extras.unsetDefault();
        }
        this.values_ = this.getAttributeValues().merge$AttributeValues(extras);
        this.nonIdentityTx = this.values_.anyNonDefault(Font.EXTRA_MASK);
        this.hasLayoutAttributes_ = this.values_.anyNonDefault(Font.LAYOUT_MASK);
      } catch ($e7) {
        {
          let t = $J.exc($e7);
          throw new IOException(t);
        }
      } finally {
        this.fRequestedAttributes = null;
      }
    }
  }
  /**
   * Returns the number of glyphs in this {@code Font}. Glyph codes
   * for this {@code Font} range from 0 to
   * {@code getNumGlyphs()} - 1.
   * @return the number of glyphs in this {@code Font}.
   * @since 1.2
   */
  getNumGlyphs(): number {
    return this.getFont2D().getNumGlyphs();
  }
  /**
   * Returns the glyphCode which is used when this {@code Font}
   * does not have a glyph for a specified unicode code point.
   * @return the glyphCode of this {@code Font}.
   * @since 1.2
   */
  getMissingGlyphCode(): number {
    return this.getFont2D().getMissingGlyphCode();
  }
  /**
   * Returns the baseline appropriate for displaying this character.
   * <p>
   * Large fonts can support different writing systems, and each system can
   * use a different baseline.
   * The character argument determines the writing system to use. Clients
   * should not assume all characters use the same baseline.
   *
   * @param c a character used to identify the writing system
   * @return the baseline appropriate for the specified character.
   * @see LineMetrics#getBaselineOffsets
   * @see #ROMAN_BASELINE
   * @see #CENTER_BASELINE
   * @see #HANGING_BASELINE
   * @since 1.2
   */
  getBaselineFor(c: number): number {
    return this.getFont2D().getBaselineFor(c);
  }
  /**
   * Returns a map of font attributes available in this
   * {@code Font}.  Attributes include things like ligatures and
   * glyph substitution.
   * @return the attributes map of this {@code Font}.
   */
  getAttributes(): JMap<TextAttribute, any> {
    return new AttributeMap()._AttributeMap(this.getAttributeValues());
  }
  /**
   * Returns the keys of all the attributes supported by this
   * {@code Font}.  These attributes can be used to derive other
   * fonts.
   * @return an array containing the keys of all the attributes
   *          supported by this {@code Font}.
   * @since 1.2
   */
  getAvailableAttributes(): AttributedCharacterIterator_Attribute[] {
    let attributes = [TextAttribute.FAMILY, TextAttribute.WEIGHT, TextAttribute.WIDTH, TextAttribute.POSTURE, TextAttribute.SIZE, TextAttribute.TRANSFORM, TextAttribute.SUPERSCRIPT, TextAttribute.CHAR_REPLACEMENT, TextAttribute.FOREGROUND, TextAttribute.BACKGROUND, TextAttribute.UNDERLINE, TextAttribute.STRIKETHROUGH, TextAttribute.RUN_DIRECTION, TextAttribute.BIDI_EMBEDDING, TextAttribute.JUSTIFICATION, TextAttribute.INPUT_METHOD_HIGHLIGHT, TextAttribute.INPUT_METHOD_UNDERLINE, TextAttribute.SWAP_COLORS, TextAttribute.NUMERIC_SHAPING, TextAttribute.KERNING, TextAttribute.LIGATURES, TextAttribute.TRACKING];
    return attributes;
  }
  /**
   * Creates a new {@code Font} object by replicating this
   * {@code Font} object and applying a new style and size.
   * @param style the style for the new {@code Font}
   * @param size the size for the new {@code Font}
   * @return a new {@code Font} object.
   * @since 1.2
   */
  deriveFont$int$float(style: number, size: number): Font {
    if (this.values_ == null) {
      return new Font()._Font$String$int$float$boolean$Font2DHandle(this.name, style, size, this.createdFont, this.font2DHandle);
    }
    let newValues = this.getAttributeValues().clone();
    let oldStyle = (this.style !== style) ? this.style : -1;
    Font.applyStyle(style, newValues);
    newValues.setSize(size);
    return new Font()._Font$AttributeValues$String$int$boolean$Font2DHandle(newValues, null, oldStyle, this.createdFont, this.font2DHandle);
  }
  /**
   * Creates a new {@code Font} object by replicating this
   * {@code Font} object and applying a new style and transform.
   * @param style the style for the new {@code Font}
   * @param trans the {@code AffineTransform} associated with the
   * new {@code Font}
   * @return a new {@code Font} object.
   * @throws IllegalArgumentException if {@code trans} is
   *         {@code null}
   * @since 1.2
   */
  deriveFont$int$AffineTransform(style: number, trans: AffineTransform): Font {
    let newValues = this.getAttributeValues().clone();
    let oldStyle = (this.style !== style) ? this.style : -1;
    Font.applyStyle(style, newValues);
    Font.applyTransform(trans, newValues);
    return new Font()._Font$AttributeValues$String$int$boolean$Font2DHandle(newValues, null, oldStyle, this.createdFont, this.font2DHandle);
  }
  /**
   * Creates a new {@code Font} object by replicating the current
   * {@code Font} object and applying a new size to it.
   * @param size the size for the new {@code Font}.
   * @return a new {@code Font} object.
   * @since 1.2
   */
  deriveFont$float(size: number): Font {
    if (this.values_ == null) {
      return new Font()._Font$String$int$float$boolean$Font2DHandle(this.name, this.style, size, this.createdFont, this.font2DHandle);
    }
    let newValues = this.getAttributeValues().clone();
    newValues.setSize(size);
    return new Font()._Font$AttributeValues$String$int$boolean$Font2DHandle(newValues, null, -1, this.createdFont, this.font2DHandle);
  }
  /**
   * Creates a new {@code Font} object by replicating the current
   * {@code Font} object and applying a new transform to it.
   * @param trans the {@code AffineTransform} associated with the
   * new {@code Font}
   * @return a new {@code Font} object.
   * @throws IllegalArgumentException if {@code trans} is
   *         {@code null}
   * @since 1.2
   */
  deriveFont$AffineTransform(trans: AffineTransform): Font {
    let newValues = this.getAttributeValues().clone();
    Font.applyTransform(trans, newValues);
    return new Font()._Font$AttributeValues$String$int$boolean$Font2DHandle(newValues, null, -1, this.createdFont, this.font2DHandle);
  }
  /**
   * Creates a new {@code Font} object by replicating the current
   * {@code Font} object and applying a new style to it.
   * @param style the style for the new {@code Font}
   * @return a new {@code Font} object.
   * @since 1.2
   */
  deriveFont$int(style: number): Font {
    if (this.values_ == null) {
      return new Font()._Font$String$int$float$boolean$Font2DHandle(this.name, style, Math.fround(this.size_), this.createdFont, this.font2DHandle);
    }
    let newValues = this.getAttributeValues().clone();
    let oldStyle = (this.style !== style) ? this.style : -1;
    Font.applyStyle(style, newValues);
    return new Font()._Font$AttributeValues$String$int$boolean$Font2DHandle(newValues, null, oldStyle, this.createdFont, this.font2DHandle);
  }
  /**
   * Creates a new {@code Font} object by replicating the current
   * {@code Font} object and applying a new set of font attributes
   * to it.
   *
   * @param attributes a map of attributes enabled for the new
   * {@code Font}
   * @return a new {@code Font} object.
   * @since 1.2
   */
  deriveFont$Map(attributes: JMap<AttributedCharacterIterator_Attribute, any>): Font {
    if (attributes == null) {
      return this;
    }
    let newValues = this.getAttributeValues().clone();
    newValues.merge$Map$int(attributes, Font.RECOGNIZED_MASK);
    return new Font()._Font$AttributeValues$String$int$boolean$Font2DHandle(newValues, this.name, this.style, this.createdFont, this.font2DHandle);
  }
  /**
   * Checks if this {@code Font} has a glyph for the specified
   * character.
   *
   * <p> <b>Note:</b> This method cannot handle
   * <a href="../../../java.base/java/lang/Character.html#supplementary">
   * supplementary characters</a>.
   * To support all Unicode characters, including
   * supplementary characters, use the {@link #canDisplay(int)}
   * method or {@code canDisplayUpTo} methods.
   *
   * @param c the character for which a glyph is needed
   * @return {@code true} if this {@code Font} has a glyph for this
   *          character; {@code false} otherwise.
   * @since 1.2
   */
  canDisplay$char(c: number): boolean {
    return this.getFont2D().canDisplay(c);
  }
  /**
   * Checks if this {@code Font} has a glyph for the specified
   * character.
   *
   * @param codePoint the character (Unicode code point) for which a glyph
   *        is needed.
   * @return {@code true} if this {@code Font} has a glyph for the
   *          character; {@code false} otherwise.
   * @throws IllegalArgumentException if the code point is not a valid Unicode
   *          code point.
   * @see Character#isValidCodePoint(int)
   * @since 1.5
   */
  canDisplay$int(codePoint: number): boolean {
    if (!Character.isValidCodePoint(codePoint)) {
      throw new IllegalArgumentException('invalid code point: ' + $J.Integer_toHexString(codePoint));
    }
    return this.getFont2D().canDisplay(codePoint);
  }
  /**
   * Indicates whether or not this {@code Font} can display a
   * specified {@code String}.  For strings with Unicode encoding,
   * it is important to know if a particular font can display the
   * string. This method returns an offset into the {@code String}
   * {@code str} which is the first character this
   * {@code Font} cannot display without using the missing glyph
   * code. If the {@code Font} can display all characters, -1 is
   * returned.
   * @param str a {@code String} object
   * @return an offset into {@code str} that points
   *          to the first character in {@code str} that this
   *          {@code Font} cannot display; or {@code -1} if
   *          this {@code Font} can display all characters in
   *          {@code str}.
   * @since 1.2
   */
  canDisplayUpTo$String(str: string): number {
    let font2d = this.getFont2D();
    let len = str.length;
    for (let i = 0; i < len; i++) {
      let c = str.charCodeAt(i);
      if (font2d.canDisplay(c)) {
        continue;
      }
      if (!Character.isHighSurrogate(c)) {
        return i;
      }
      if (!font2d.canDisplay(JString.codePointAt(str, i))) {
        return i;
      }
      i++;
    }
    return -1;
  }
  /**
   * Indicates whether or not this {@code Font} can display
   * the characters in the specified {@code text}
   * starting at {@code start} and ending at
   * {@code limit}.  This method is a convenience overload.
   * @param text the specified array of {@code char} values
   * @param start the specified starting offset (in
   *              {@code char}s) into the specified array of
   *              {@code char} values
   * @param limit the specified ending offset (in
   *              {@code char}s) into the specified array of
   *              {@code char} values
   * @return an offset into {@code text} that points
   *          to the first character in {@code text} that this
   *          {@code Font} cannot display; or {@code -1} if
   *          this {@code Font} can display all characters in
   *          {@code text}.
   * @since 1.2
   */
  canDisplayUpTo$charArr$int$int(text: number[], start: number, limit: number): number {
    let font2d = this.getFont2D();
    for (let i = start; i < limit; i++) {
      let c = text[i];
      if (font2d.canDisplay(c)) {
        continue;
      }
      if (!Character.isHighSurrogate(c)) {
        return i;
      }
      if (!font2d.canDisplay(Character.codePointAt(text, i, limit))) {
        return i;
      }
      i++;
    }
    return -1;
  }
  /**
   * Indicates whether or not this {@code Font} can display the
   * text specified by the {@code iter} starting at
   * {@code start} and ending at {@code limit}.
   *
   * @param iter  a {@link CharacterIterator} object
   * @param start the specified starting offset into the specified
   *              {@code CharacterIterator}.
   * @param limit the specified ending offset into the specified
   *              {@code CharacterIterator}.
   * @return an offset into {@code iter} that points
   *          to the first character in {@code iter} that this
   *          {@code Font} cannot display; or {@code -1} if
   *          this {@code Font} can display all characters in
   *          {@code iter}.
   * @since 1.2
   */
  canDisplayUpTo$CharacterIterator$int$int(iter: CharacterIterator, start: number, limit: number): number {
    let font2d = this.getFont2D();
    let c = iter.setIndex(start);
    for (let i = start; i < limit; i++, c = iter.next()) {
      if (font2d.canDisplay(c)) {
        continue;
      }
      if (!Character.isHighSurrogate(c)) {
        return i;
      }
      let c2 = iter.next();
      if (!Character.isLowSurrogate(c2)) {
        return i;
      }
      if (!font2d.canDisplay(Character.toCodePoint(c, c2))) {
        return i;
      }
      i++;
    }
    return -1;
  }
  /**
   * Returns the italic angle of this {@code Font}.  The italic angle
   * is the inverse slope of the caret which best matches the posture of this
   * {@code Font}.
   * @see TextAttribute#POSTURE
   * @return the angle of the ITALIC style of this {@code Font}.
   */
  getItalicAngle$(): number {
    return this.getItalicAngle$FontRenderContext$Font(null);
  }
  getItalicAngle$FontRenderContext$Font(frc: FontRenderContext): number {
    let aa: any;
    let fm: any;
    if (frc == null) {
      aa = RenderingHints.VALUE_TEXT_ANTIALIAS_OFF;
      fm = RenderingHints.VALUE_FRACTIONALMETRICS_OFF;
    } else {
      aa = frc.getAntiAliasingHint();
      fm = frc.getFractionalMetricsHint();
    }
    return this.getFont2D().getItalicAngle(this, Font.identityTx, aa, fm);
  }
  /**
   * Checks whether or not this {@code Font} has uniform
   * line metrics.  A logical {@code Font} might be a
   * composite font, which means that it is composed of different
   * physical fonts to cover different code ranges.  Each of these
   * fonts might have different {@code LineMetrics}.  If the
   * logical {@code Font} is a single
   * font then the metrics would be uniform.
   * @return {@code true} if this {@code Font} has
   * uniform line metrics; {@code false} otherwise.
   */
  hasUniformLineMetrics(): boolean {
    return false;
  }
  defaultLineMetrics(frc: FontRenderContext): FontLineMetrics {
    let flm = null;
    if (this.flmref == null || (flm = this.flmref.get()) == null || !flm.frc.equals$FontRenderContext(frc)) {
      let metrics = $J.newArray(8, 0);
      this.getFont2D().getFontMetrics(this, Font.identityTx, frc.getAntiAliasingHint(), frc.getFractionalMetricsHint(), metrics);
      let ascent = metrics[0];
      let descent = metrics[1];
      let leading = metrics[2];
      let ssOffset = 0;
      if (this.values_ != null && this.values_.getSuperscript() !== 0) {
        ssOffset = Math.fround(this.getTransform().getTranslateY());
        ascent = Math.fround(ascent - ssOffset);
        descent = Math.fround(descent + ssOffset);
      }
      let height = Math.fround(Math.fround(ascent + descent) + leading);
      let baselineIndex = 0;
      let baselineOffsets = [0, Math.fround((Math.fround(Math.fround(descent / 2) - ascent)) / 2), Math.fround(-ascent)];
      let strikethroughOffset = metrics[4];
      let strikethroughThickness = metrics[5];
      let underlineOffset = metrics[6];
      let underlineThickness = metrics[7];
      let italicAngle = this.getItalicAngle$FontRenderContext$Font(frc);
      if (this.isTransformed()) {
        let ctx = this.values_.getCharTransform();
        if (ctx != null) {
          let pt = new Point2D$Float()._Point2D$Float$();
          pt.setLocation$float$float(0, strikethroughOffset);
          ctx.deltaTransform$Point2D$Point2D(pt, pt);
          strikethroughOffset = pt.y_;
          pt.setLocation$float$float(0, strikethroughThickness);
          ctx.deltaTransform$Point2D$Point2D(pt, pt);
          strikethroughThickness = pt.y_;
          pt.setLocation$float$float(0, underlineOffset);
          ctx.deltaTransform$Point2D$Point2D(pt, pt);
          underlineOffset = pt.y_;
          pt.setLocation$float$float(0, underlineThickness);
          ctx.deltaTransform$Point2D$Point2D(pt, pt);
          underlineThickness = pt.y_;
        }
      }
      strikethroughOffset = Math.fround(strikethroughOffset + ssOffset);
      underlineOffset = Math.fround(underlineOffset + ssOffset);
      let cm = new CoreMetrics(ascent, descent, leading, height, baselineIndex, baselineOffsets, strikethroughOffset, strikethroughThickness, underlineOffset, underlineThickness, ssOffset, italicAngle);
      flm = new FontLineMetrics(0, cm, frc);
      this.flmref = new SoftReference(flm);
    }
    return flm.clone();
  }
  /**
   * Returns a {@link LineMetrics} object created with the specified
   * {@code String} and {@link FontRenderContext}.
   * @param str the specified {@code String}
   * @param frc the specified {@code FontRenderContext}
   * @return a {@code LineMetrics} object created with the
   * specified {@code String} and {@link FontRenderContext}.
   */
  getLineMetrics$String$FontRenderContext(str: string, frc: FontRenderContext): LineMetrics {
    let flm = this.defaultLineMetrics(frc);
    flm.numchars = str.length;
    return flm;
  }
  /**
   * Returns a {@code LineMetrics} object created with the
   * specified arguments.
   * @param str the specified {@code String}
   * @param beginIndex the initial offset of {@code str}
   * @param limit the end offset of {@code str}
   * @param frc the specified {@code FontRenderContext}
   * @return a {@code LineMetrics} object created with the
   * specified arguments.
   */
  getLineMetrics$String$int$int$FontRenderContext(str: string, beginIndex: number, limit: number, frc: FontRenderContext): LineMetrics {
    let flm = this.defaultLineMetrics(frc);
    let numChars = (limit - beginIndex) | 0;
    flm.numchars = (numChars < 0) ? 0 : numChars;
    return flm;
  }
  /**
   * Returns a {@code LineMetrics} object created with the
   * specified arguments.
   * @param chars an array of characters
   * @param beginIndex the initial offset of {@code chars}
   * @param limit the end offset of {@code chars}
   * @param frc the specified {@code FontRenderContext}
   * @return a {@code LineMetrics} object created with the
   * specified arguments.
   */
  getLineMetrics$charArr$int$int$FontRenderContext(chars: number[], beginIndex: number, limit: number, frc: FontRenderContext): LineMetrics {
    let flm = this.defaultLineMetrics(frc);
    let numChars = (limit - beginIndex) | 0;
    flm.numchars = (numChars < 0) ? 0 : numChars;
    return flm;
  }
  /**
   * Returns a {@code LineMetrics} object created with the
   * specified arguments.
   * @param ci the specified {@code CharacterIterator}
   * @param beginIndex the initial offset in {@code ci}
   * @param limit the end offset of {@code ci}
   * @param frc the specified {@code FontRenderContext}
   * @return a {@code LineMetrics} object created with the
   * specified arguments.
   */
  getLineMetrics$CharacterIterator$int$int$FontRenderContext(ci: CharacterIterator, beginIndex: number, limit: number, frc: FontRenderContext): LineMetrics {
    let flm = this.defaultLineMetrics(frc);
    let numChars = (limit - beginIndex) | 0;
    flm.numchars = (numChars < 0) ? 0 : numChars;
    return flm;
  }
  /**
   * Returns the logical bounds of the specified {@code String} in
   * the specified {@code FontRenderContext}.  The logical bounds
   * contains the origin, ascent, advance, and height, which includes
   * the leading.  The logical bounds does not always enclose all the
   * text.  For example, in some languages and in some fonts, accent
   * marks can be positioned above the ascent or below the descent.
   * To obtain a visual bounding box, which encloses all the text,
   * use the {@link TextLayout#getBounds() getBounds} method of
   * {@code TextLayout}.
   * <p>Note: The returned bounds is in baseline-relative coordinates
   * (see {@link java.awt.Font class notes}).
   * @param str the specified {@code String}
   * @param frc the specified {@code FontRenderContext}
   * @return a {@link Rectangle2D} that is the bounding box of the
   * specified {@code String} in the specified
   * {@code FontRenderContext}.
   * @see FontRenderContext
   * @see Font#createGlyphVector
   * @since 1.2
   */
  getStringBounds$String$FontRenderContext(str: string, frc: FontRenderContext): Rectangle2D {
    let array = JString.toCharArray(str);
    return this.getStringBounds$charArr$int$int$FontRenderContext(array, 0, array.length, frc);
  }
  /**
   * Returns the logical bounds of the specified {@code String} in
   * the specified {@code FontRenderContext}.  The logical bounds
   * contains the origin, ascent, advance, and height, which includes
   * the leading.  The logical bounds does not always enclose all the
   * text.  For example, in some languages and in some fonts, accent
   * marks can be positioned above the ascent or below the descent.
   * To obtain a visual bounding box, which encloses all the text,
   * use the {@link TextLayout#getBounds() getBounds} method of
   * {@code TextLayout}.
   * <p>Note: The returned bounds is in baseline-relative coordinates
   * (see {@link java.awt.Font class notes}).
   * @param str the specified {@code String}
   * @param beginIndex the initial offset of {@code str}
   * @param limit the end offset of {@code str}
   * @param frc the specified {@code FontRenderContext}
   * @return a {@code Rectangle2D} that is the bounding box of the
   * specified {@code String} in the specified
   * {@code FontRenderContext}.
   * @throws IndexOutOfBoundsException if {@code beginIndex} is
   *         less than zero, or {@code limit} is greater than the
   *         length of {@code str}, or {@code beginIndex}
   *         is greater than {@code limit}.
   * @see FontRenderContext
   * @see Font#createGlyphVector
   * @since 1.2
   */
  getStringBounds$String$int$int$FontRenderContext(str: string, beginIndex: number, limit: number, frc: FontRenderContext): Rectangle2D {
    let substr = str.substring(beginIndex, limit);
    return this.getStringBounds$String$FontRenderContext(substr, frc);
  }
  /**
   * Returns the logical bounds of the specified array of characters
   * in the specified {@code FontRenderContext}.  The logical
   * bounds contains the origin, ascent, advance, and height, which
   * includes the leading.  The logical bounds does not always enclose
   * all the text.  For example, in some languages and in some fonts,
   * accent marks can be positioned above the ascent or below the
   * descent.  To obtain a visual bounding box, which encloses all the
   * text, use the {@link TextLayout#getBounds() getBounds} method of
   * {@code TextLayout}.
   * <p>Note: The returned bounds is in baseline-relative coordinates
   * (see {@link java.awt.Font class notes}).
   * @param chars an array of characters
   * @param beginIndex the initial offset in the array of
   * characters
   * @param limit the end offset in the array of characters
   * @param frc the specified {@code FontRenderContext}
   * @return a {@code Rectangle2D} that is the bounding box of the
   * specified array of characters in the specified
   * {@code FontRenderContext}.
   * @throws IndexOutOfBoundsException if {@code beginIndex} is
   *         less than zero, or {@code limit} is greater than the
   *         length of {@code chars}, or {@code beginIndex}
   *         is greater than {@code limit}.
   * @see FontRenderContext
   * @see Font#createGlyphVector
   * @since 1.2
   */
  getStringBounds$charArr$int$int$FontRenderContext(chars: number[], beginIndex: number, limit: number, frc: FontRenderContext): Rectangle2D {
    if (beginIndex < 0) {
      throw new IndexOutOfBoundsException('beginIndex: ' + beginIndex);
    }
    if (limit > chars.length) {
      throw new IndexOutOfBoundsException('limit: ' + limit);
    }
    if (beginIndex > limit) {
      throw new IndexOutOfBoundsException('range length: ' + ((limit - beginIndex) | 0));
    }
    let simple = this.values_ == null || (this.values_.getKerning() === 0 && this.values_.getLigatures() === 0 && this.values_.getTracking() === Math.fround(0) && this.values_.getBaselineTransform() == null);
    if (simple) {
      simple = !FontUtilities.isComplexText(chars, beginIndex, limit);
    }
    if (simple || (((limit - beginIndex) | 0) === 0)) {
      let metrics = FontDesignMetrics.getMetrics(this, frc);
      return metrics.getSimpleBounds(chars, beginIndex, (limit - beginIndex) | 0);
    } else {
      let str = JString.newString(chars, beginIndex, (limit - beginIndex) | 0);
      let tl = new TextLayout(str, this, frc);
      return new Rectangle2D$Float()._Rectangle2D$Float$float$float$float$float(0, Math.fround(-tl.getAscent()), tl.getAdvance(), Math.fround(Math.fround(tl.getAscent() + tl.getDescent()) + tl.getLeading()));
    }
  }
  /**
   * Returns the logical bounds of the characters indexed in the
   * specified {@link CharacterIterator} in the
   * specified {@code FontRenderContext}.  The logical bounds
   * contains the origin, ascent, advance, and height, which includes
   * the leading.  The logical bounds does not always enclose all the
   * text.  For example, in some languages and in some fonts, accent
   * marks can be positioned above the ascent or below the descent.
   * To obtain a visual bounding box, which encloses all the text,
   * use the {@link TextLayout#getBounds() getBounds} method of
   * {@code TextLayout}.
   * <p>Note: The returned bounds is in baseline-relative coordinates
   * (see {@link java.awt.Font class notes}).
   * @param ci the specified {@code CharacterIterator}
   * @param beginIndex the initial offset in {@code ci}
   * @param limit the end offset in {@code ci}
   * @param frc the specified {@code FontRenderContext}
   * @return a {@code Rectangle2D} that is the bounding box of the
   * characters indexed in the specified {@code CharacterIterator}
   * in the specified {@code FontRenderContext}.
   * @see FontRenderContext
   * @see Font#createGlyphVector
   * @since 1.2
   * @throws IndexOutOfBoundsException if {@code beginIndex} is
   *         less than the start index of {@code ci}, or
   *         {@code limit} is greater than the end index of
   *         {@code ci}, or {@code beginIndex} is greater
   *         than {@code limit}
   */
  getStringBounds$CharacterIterator$int$int$FontRenderContext(ci: CharacterIterator, beginIndex: number, limit: number, frc: FontRenderContext): Rectangle2D {
    let start = ci.getBeginIndex();
    let end = ci.getEndIndex();
    if (beginIndex < start) {
      throw new IndexOutOfBoundsException('beginIndex: ' + beginIndex);
    }
    if (limit > end) {
      throw new IndexOutOfBoundsException('limit: ' + limit);
    }
    if (beginIndex > limit) {
      throw new IndexOutOfBoundsException('range length: ' + ((limit - beginIndex) | 0));
    }
    let arr = $J.newArray((limit - beginIndex) | 0, 0);
    ci.setIndex(beginIndex);
    for (let idx = 0; idx < arr.length; idx++) {
      arr[idx] = ci.current();
      ci.next();
    }
    return this.getStringBounds$charArr$int$int$FontRenderContext(arr, 0, arr.length, frc);
  }
  /**
   * Returns the bounds for the character with the maximum
   * bounds as defined in the specified {@code FontRenderContext}.
   * <p>Note: The returned bounds is in baseline-relative coordinates
   * (see {@link java.awt.Font class notes}).
   * @param frc the specified {@code FontRenderContext}
   * @return a {@code Rectangle2D} that is the bounding box
   * for the character with the maximum bounds.
   */
  getMaxCharBounds(frc: FontRenderContext): Rectangle2D {
    let metrics = $J.newArray(4, 0);
    this.getFont2D().getFontMetrics(this, frc, metrics);
    return new Rectangle2D$Float()._Rectangle2D$Float$float$float$float$float(0, Math.fround(-metrics[0]), metrics[3], Math.fround(Math.fround(metrics[0] + metrics[1]) + metrics[2]));
  }
  /**
   * Creates a {@link java.awt.font.GlyphVector GlyphVector} by
   * mapping characters to glyphs one-to-one based on the
   * Unicode cmap in this {@code Font}.  This method does no other
   * processing besides the mapping of glyphs to characters.  This
   * means that this method is not useful for some scripts, such
   * as Arabic, Hebrew, Thai, and Indic, that require reordering,
   * shaping, or ligature substitution.
   * @param frc the specified {@code FontRenderContext}
   * @param str the specified {@code String}
   * @return a new {@code GlyphVector} created with the
   * specified {@code String} and the specified
   * {@code FontRenderContext}.
   */
  createGlyphVector$FontRenderContext$String(frc: FontRenderContext, str: string): GlyphVector {
    return new StandardGlyphVector(this, str, frc);
  }
  /**
   * Creates a {@link java.awt.font.GlyphVector GlyphVector} by
   * mapping characters to glyphs one-to-one based on the
   * Unicode cmap in this {@code Font}.  This method does no other
   * processing besides the mapping of glyphs to characters.  This
   * means that this method is not useful for some scripts, such
   * as Arabic, Hebrew, Thai, and Indic, that require reordering,
   * shaping, or ligature substitution.
   * @param frc the specified {@code FontRenderContext}
   * @param chars the specified array of characters
   * @return a new {@code GlyphVector} created with the
   * specified array of characters and the specified
   * {@code FontRenderContext}.
   */
  createGlyphVector$FontRenderContext$charArr(frc: FontRenderContext, chars: number[]): GlyphVector {
    return new StandardGlyphVector(this, chars, frc);
  }
  /**
   * Creates a {@link java.awt.font.GlyphVector GlyphVector} by
   * mapping the specified characters to glyphs one-to-one based on the
   * Unicode cmap in this {@code Font}.  This method does no other
   * processing besides the mapping of glyphs to characters.  This
   * means that this method is not useful for some scripts, such
   * as Arabic, Hebrew, Thai, and Indic, that require reordering,
   * shaping, or ligature substitution.
   * @param frc the specified {@code FontRenderContext}
   * @param ci the specified {@code CharacterIterator}
   * @return a new {@code GlyphVector} created with the
   * specified {@code CharacterIterator} and the specified
   * {@code FontRenderContext}.
   */
  createGlyphVector$FontRenderContext$CharacterIterator(frc: FontRenderContext, ci: CharacterIterator): GlyphVector {
    return new StandardGlyphVector(this, ci, frc);
  }
  /**
   * Creates a {@link java.awt.font.GlyphVector GlyphVector} by
   * mapping characters to glyphs one-to-one based on the
   * Unicode cmap in this {@code Font}.  This method does no other
   * processing besides the mapping of glyphs to characters.  This
   * means that this method is not useful for some scripts, such
   * as Arabic, Hebrew, Thai, and Indic, that require reordering,
   * shaping, or ligature substitution.
   * @param frc the specified {@code FontRenderContext}
   * @param glyphCodes the specified integer array
   * @return a new {@code GlyphVector} created with the
   * specified integer array and the specified
   * {@code FontRenderContext}.
   */
  createGlyphVector$FontRenderContext$intArr(frc: FontRenderContext, glyphCodes: number[]): GlyphVector {
    return new StandardGlyphVector(this, glyphCodes, frc);
  }
  /**
   * Returns a new {@code GlyphVector} object, performing full
   * layout of the text if possible.  Full layout is required for
   * complex text, such as Arabic or Hindi.  Support for different
   * scripts depends on the font and implementation.
   * <p>
   * Layout requires bidi analysis, as performed by
   * {@code Bidi}, and should only be performed on text that
   * has a uniform direction.  The direction is indicated in the
   * flags parameter,by using LAYOUT_RIGHT_TO_LEFT to indicate a
   * right-to-left (Arabic and Hebrew) run direction, or
   * LAYOUT_LEFT_TO_RIGHT to indicate a left-to-right (English)
   * run direction.
   * <p>
   * In addition, some operations, such as Arabic shaping, require
   * context, so that the characters at the start and limit can have
   * the proper shapes.  Sometimes the data in the buffer outside
   * the provided range does not have valid data.  The values
   * LAYOUT_NO_START_CONTEXT and LAYOUT_NO_LIMIT_CONTEXT can be
   * added to the flags parameter to indicate that the text before
   * start, or after limit, respectively, should not be examined
   * for context.
   * <p>
   * All other values for the flags parameter are reserved.
   *
   * @param frc the specified {@code FontRenderContext}
   * @param text the text to layout
   * @param start the start of the text to use for the {@code GlyphVector}
   * @param limit the limit of the text to use for the {@code GlyphVector}
   * @param flags control flags as described above
   * @return a new {@code GlyphVector} representing the text between
   * start and limit, with glyphs chosen and positioned so as to best represent
   * the text
   * @throws ArrayIndexOutOfBoundsException if start or limit is
   * out of bounds
   * @see java.text.Bidi
   * @see #LAYOUT_LEFT_TO_RIGHT
   * @see #LAYOUT_RIGHT_TO_LEFT
   * @see #LAYOUT_NO_START_CONTEXT
   * @see #LAYOUT_NO_LIMIT_CONTEXT
   * @since 1.4
   */
  layoutGlyphVector(frc: FontRenderContext, text: number[], start: number, limit: number, flags: number): GlyphVector {
    let gl = GlyphLayout.get(null);
    let gv = gl.layout(this, frc, text, start, (limit - start) | 0, flags, null);
    GlyphLayout.done(gl);
    return gv;
  }
  static applyTransform(trans: AffineTransform, values: AttributeValues): void {
    if (trans == null) {
      throw new IllegalArgumentException('transform must not be null');
    }
    values.setTransform$AffineTransform(trans);
  }
  static applyStyle(style: number, values: AttributeValues): void {
    values.setWeight((style & Font.BOLD) !== 0 ? 2 : 1);
    values.setPosture((style & Font.ITALIC) !== 0 ? Math.fround(0.2) : 0);
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Font', 'initIDs', this, $a);
  }
  static $clinit() {
    Toolkit.loadLibraries();
    Font.initIDs();
    FontAccess.setFontAccess(new Font$FontAccessImpl()._Font$FontAccessImpl());
    Font.identityTx = new AffineTransform()._AffineTransform$();
    Font.RECOGNIZED_MASK = AttributeValues.MASK_ALL & ~AttributeValues.getMask$EAttribute(EAttribute.EFONT);
    Font.PRIMARY_MASK = AttributeValues.getMask$EAttributeArr([EAttribute.EFAMILY, EAttribute.EWEIGHT, EAttribute.EWIDTH, EAttribute.EPOSTURE, EAttribute.ESIZE, EAttribute.ETRANSFORM, EAttribute.ESUPERSCRIPT, EAttribute.ETRACKING]);
    Font.SECONDARY_MASK = Font.RECOGNIZED_MASK & ~Font.PRIMARY_MASK;
    Font.LAYOUT_MASK = AttributeValues.getMask$EAttributeArr([EAttribute.ECHAR_REPLACEMENT, EAttribute.EFOREGROUND, EAttribute.EBACKGROUND, EAttribute.EUNDERLINE, EAttribute.ESTRIKETHROUGH, EAttribute.ERUN_DIRECTION, EAttribute.EBIDI_EMBEDDING, EAttribute.EJUSTIFICATION, EAttribute.EINPUT_METHOD_HIGHLIGHT, EAttribute.EINPUT_METHOD_UNDERLINE, EAttribute.ESWAP_COLORS, EAttribute.ENUMERIC_SHAPING, EAttribute.EKERNING, EAttribute.ELIGATURES, EAttribute.ETRACKING, EAttribute.ESUPERSCRIPT]);
    Font.EXTRA_MASK = AttributeValues.getMask$EAttributeArr([EAttribute.ETRANSFORM, EAttribute.ESUPERSCRIPT, EAttribute.EWIDTH]);
    Font.ssinfo = [0, 0.375, 0.625, Math.fround(0.7916667), Math.fround(0.9027778), Math.fround(0.9768519), Math.fround(1.0262346), Math.fround(1.0591564)];
  }
}

export class Font$FontAccessImpl extends FontAccess {
  _Font$FontAccessImpl(): this {
    this._FontAccess();
    return this;
  }
  getFont2D(font: Font): Font2D {
    return font.getFont2D();
  }
  setFont2D(font: Font, handle: Font2DHandle): void {
    font.font2DHandle = handle;
  }
  setCreatedFont(font: Font): void {
    font.createdFont = true;
  }
  isCreatedFont(font: Font): boolean {
    return font.createdFont;
  }
  getFontPeer(font: Font): FontPeer {
    return font.getFontPeer();
  }
}

let $Font$1: any = null;
/** An anonymous class (Font.java:1111). */
function Font$1(): any {
  return $Font$1 ??= $J.local(class extends JObject {
    run(): File {
      return Files.createTempFile('+~JF', '.tmp').toFile();
    }
  }, 'java.awt.Font$1', ['java.security.PrivilegedExceptionAction']);
}

let $Font$2: any = null;
/** An anonymous class (Font.java:1125). */
function Font$2(): any {
  return $Font$2 ??= $J.local(class extends JObject {
    run(): OutputStream {
      return new FileOutputStream(this.$cv_tFile);
    }
    $c($tFile): this {
      this.$cv_tFile = $tFile;
      return this;
    }
  }, 'java.awt.Font$2', ['java.security.PrivilegedExceptionAction']);
}

let $Font$3: any = null;
/** An anonymous class (Font.java:1185). */
function Font$3(): any {
  return $Font$3 ??= $J.local(class extends JObject {
    run(): Void {
      this.$cv_tFile.delete();
      return null;
    }
    $c($tFile): this {
      this.$cv_tFile = $tFile;
      return this;
    }
  }, 'java.awt.Font$3', ['java.security.PrivilegedExceptionAction']);
}

$J.define(Font, 'java.awt.Font', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'sun.font.Font2D': '_Font$Font2D', 'java.awt.Font': '_Font$Font', 'java.util.Map': '_Font$Map', 'sun.font.AttributeValues,java.lang.String,int,boolean,sun.font.Font2DHandle': '_Font$AttributeValues$String$int$boolean$Font2DHandle', 'java.io.File,int,boolean,sun.font.CreatedFontTracker': '_Font$File$int$boolean$CreatedFontTracker', 'java.lang.String,int,float,boolean,sun.font.Font2DHandle': '_Font$String$int$float$boolean$Font2DHandle', 'java.lang.String,int,float': '_Font$String$int$float', 'java.lang.String,int,int': '_Font$String$int$int' }, meths: { 'createGlyphVector(java.awt.font.FontRenderContext,int[])': 'createGlyphVector$FontRenderContext$intArr', 'createGlyphVector(java.awt.font.FontRenderContext,java.text.CharacterIterator)': 'createGlyphVector$FontRenderContext$CharacterIterator', 'createGlyphVector(java.awt.font.FontRenderContext,char[])': 'createGlyphVector$FontRenderContext$charArr', 'createGlyphVector(java.awt.font.FontRenderContext,java.lang.String)': 'createGlyphVector$FontRenderContext$String', 'getStringBounds(java.text.CharacterIterator,int,int,java.awt.font.FontRenderContext)': 'getStringBounds$CharacterIterator$int$int$FontRenderContext', 'getStringBounds(char[],int,int,java.awt.font.FontRenderContext)': 'getStringBounds$charArr$int$int$FontRenderContext', 'getStringBounds(java.lang.String,int,int,java.awt.font.FontRenderContext)': 'getStringBounds$String$int$int$FontRenderContext', 'getStringBounds(java.lang.String,java.awt.font.FontRenderContext)': 'getStringBounds$String$FontRenderContext', 'getLineMetrics(java.text.CharacterIterator,int,int,java.awt.font.FontRenderContext)': 'getLineMetrics$CharacterIterator$int$int$FontRenderContext', 'getLineMetrics(char[],int,int,java.awt.font.FontRenderContext)': 'getLineMetrics$charArr$int$int$FontRenderContext', 'getLineMetrics(java.lang.String,int,int,java.awt.font.FontRenderContext)': 'getLineMetrics$String$int$int$FontRenderContext', 'getLineMetrics(java.lang.String,java.awt.font.FontRenderContext)': 'getLineMetrics$String$FontRenderContext', 'getItalicAngle(java.awt.font.FontRenderContext)': 'getItalicAngle$FontRenderContext$Font', 'getItalicAngle()': 'getItalicAngle$', 'canDisplayUpTo(java.text.CharacterIterator,int,int)': 'canDisplayUpTo$CharacterIterator$int$int', 'canDisplayUpTo(char[],int,int)': 'canDisplayUpTo$charArr$int$int', 'canDisplayUpTo(java.lang.String)': 'canDisplayUpTo$String', 'canDisplay(int)': 'canDisplay$int', 'canDisplay(char)': 'canDisplay$char', 'deriveFont(java.util.Map)': 'deriveFont$Map', 'deriveFont(int)': 'deriveFont$int', 'deriveFont(java.awt.geom.AffineTransform)': 'deriveFont$AffineTransform', 'deriveFont(float)': 'deriveFont$float', 'deriveFont(int,java.awt.geom.AffineTransform)': 'deriveFont$int$AffineTransform', 'deriveFont(int,float)': 'deriveFont$int$float', 'getFont(java.lang.String,java.awt.Font)': 'getFont$String$Font', 'getFont(java.lang.String)': 'getFont$String', 'getFontName(java.util.Locale)': 'getFontName$Locale', 'getFontName()': 'getFontName$', 'getFamily(java.util.Locale)': 'getFamily$Locale', 'getFamily()': 'getFamily$', 'createFont(int,java.io.File)': 'createFont$int$File', 'createFont(int,java.io.InputStream)': 'createFont$int$InputStream', 'createFonts(java.io.File)': 'createFonts$File', 'createFonts(java.io.InputStream)': 'createFonts$InputStream', 'getFont(java.util.Map)': 'getFont$Map' }, clinit: true, lazy: ['identityTx', 'RECOGNIZED_MASK', 'PRIMARY_MASK', 'SECONDARY_MASK', 'LAYOUT_MASK', 'EXTRA_MASK', 'ssinfo'] });
$J.define(Font$FontAccessImpl, 'java.awt.Font$FontAccessImpl', { kind: 'class', sup: 'sun.font.FontAccess', ctors: { '': '_Font$FontAccessImpl' } });
$J.module(() => {
  FontFormatException = $J.load('java.awt.FontFormatException');
  RenderingHints = $J.load('java.awt.RenderingHints');
  TextAttribute = $J.load('java.awt.font.TextAttribute');
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
  Point2D$Float = $J.load('java.awt.geom.Point2D$Float');
  Rectangle2D$Float = $J.load('java.awt.geom.Rectangle2D$Float');
  ComponentFactory = $J.load('sun.awt.ComponentFactory');
  AttributeMap = $J.load('sun.font.AttributeMap');
  AttributeValues = $J.load('sun.font.AttributeValues');
  EAttribute = $J.load('sun.font.EAttribute');
});
