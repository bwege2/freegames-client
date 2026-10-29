// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/StyleConstants.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2013, Oracle and/or its affiliates. All rights reserved.
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

let Color, AbstractDocument;

/**
 * <p>
 * A collection of <em>well known</em> or common attribute keys
 * and methods to apply to an AttributeSet or MutableAttributeSet
 * to get/set the properties in a typesafe manner.
 * <p>
 * The paragraph attributes form the definition of a paragraph to be rendered.
 * All sizes are specified in points (such as found in postscript), a
 * device independent measure.
 * </p>
 * <p style="text-align:center"><img src="doc-files/paragraph.gif"
 * alt="Diagram shows SpaceAbove, FirstLineIndent, LeftIndent, RightIndent,
 *      and SpaceBelow a paragraph."></p>
 *
 * @author  Timothy Prinzing
 * @sealedGraph
 */
export class StyleConstants extends JObject {
  /**
   * Name of elements used to represent components.
   */
  static readonly ComponentElementName: string = 'component';
  /**
   * Name of elements used to represent icons.
   */
  static readonly IconElementName: string = 'icon';
  /**
   * Attribute name used to name the collection of
   * attributes.
   */
  static NameAttribute: any = null;
  /**
   * Attribute name used to identify the resolving parent
   * set of attributes, if one is defined.
   */
  static ResolveAttribute: any = null;
  /**
   * Attribute used to identify the model for embedded
   * objects that have a model view separation.
   */
  static ModelAttribute: any = null;
  /**
   * Bidirectional level of a character as assigned by the Unicode bidi
   * algorithm.
   */
  static BidiLevel: any = null;
  /**
   * Name of the font family.
   */
  static FontFamily: any = null;
  /**
   * Name of the font family.
   *
   * @since 1.5
   */
  static Family: any = null;
  /**
   * Name of the font size.
   */
  static FontSize: any = null;
  /**
   * Name of the font size.
   *
   * @since 1.5
   */
  static Size: any = null;
  /**
   * Name of the bold attribute.
   */
  static Bold: any = null;
  /**
   * Name of the italic attribute.
   */
  static Italic: any = null;
  /**
   * Name of the underline attribute.
   */
  static Underline: any = null;
  /**
   * Name of the Strikethrough attribute.
   */
  static StrikeThrough: any = null;
  /**
   * Name of the Superscript attribute.
   */
  static Superscript: any = null;
  /**
   * Name of the Subscript attribute.
   */
  static Subscript: any = null;
  /**
   * Name of the foreground color attribute.
   */
  static Foreground: any = null;
  /**
   * Name of the background color attribute.
   */
  static Background: any = null;
  /**
   * Name of the component attribute.
   */
  static ComponentAttribute: any = null;
  /**
   * Name of the icon attribute.
   */
  static IconAttribute: any = null;
  /**
   * Name of the input method composed text attribute. The value of
   * this attribute is an instance of AttributedString which represents
   * the composed text.
   */
  static ComposedTextAttribute: any = null;
  /**
   * The amount of space to indent the first
   * line of the paragraph.  This value may be negative
   * to offset in the reverse direction.  The type
   * is Float and specifies the size of the space
   * in points.
   */
  static FirstLineIndent: any = null;
  /**
   * The amount to indent the left side
   * of the paragraph.
   * Type is float and specifies the size in points.
   */
  static LeftIndent: any = null;
  /**
   * The amount to indent the right side
   * of the paragraph.
   * Type is float and specifies the size in points.
   */
  static RightIndent: any = null;
  /**
   * The amount of space between lines
   * of the paragraph.
   * Type is float and specifies the size as a factor of the line height
   */
  static LineSpacing: any = null;
  /**
   * The amount of space above the paragraph.
   * Type is float and specifies the size in points.
   */
  static SpaceAbove: any = null;
  /**
   * The amount of space below the paragraph.
   * Type is float and specifies the size in points.
   */
  static SpaceBelow: any = null;
  /**
   * Alignment for the paragraph.  The type is
   * Integer.  Valid values are:
   * <ul>
   * <li>ALIGN_LEFT
   * <li>ALIGN_RIGHT
   * <li>ALIGN_CENTER
   * <li>ALIGN_JUSTIFED
   * </ul>
   */
  static Alignment: any = null;
  /**
   * TabSet for the paragraph, type is a TabSet containing
   * TabStops.
   */
  static TabSet: any = null;
  /**
   * Orientation for a paragraph.
   */
  static Orientation: any = null;
  /**
   * A possible value for paragraph alignment.  This
   * specifies that the text is aligned to the left
   * indent and extra whitespace should be placed on
   * the right.
   */
  static readonly ALIGN_LEFT: number = 0;
  /**
   * A possible value for paragraph alignment.  This
   * specifies that the text is aligned to the center
   * and extra whitespace should be placed equally on
   * the left and right.
   */
  static readonly ALIGN_CENTER: number = 1;
  /**
   * A possible value for paragraph alignment.  This
   * specifies that the text is aligned to the right
   * indent and extra whitespace should be placed on
   * the left.
   */
  static readonly ALIGN_RIGHT: number = 2;
  /**
   * A possible value for paragraph alignment.  This
   * specifies that extra whitespace should be spread
   * out through the rows of the paragraph with the
   * text lined up with the left and right indent
   * except on the last line which should be aligned
   * to the left.
   */
  static readonly ALIGN_JUSTIFIED: number = 3;
  static keys: any[] = null;
  representation: string = null;
  _StyleConstants(representation: string): this {
    this.representation = representation;
    return this;
  }
  /**
   * Returns the string representation.
   *
   * @return the string
   */
  toString(): string {
    return this.representation;
  }
  /**
   * Gets the BidiLevel setting.
   *
   * @param a the attribute set
   * @return the value
   */
  static getBidiLevel(a: AttributeSet): number {
    let o = a.getAttribute(StyleConstants.BidiLevel);
    if (o != null) {
      return (+o);
    }
    return 0;
  }
  /**
   * Gets the component setting from the attribute list.
   *
   * @param a the attribute set
   * @return the component, null if none
   */
  static getComponent(a: AttributeSet): Component {
    return a.getAttribute(StyleConstants.ComponentAttribute);
  }
  /**
   * Sets the component attribute.
   *
   * @param a the attribute set
   * @param c the component
   */
  static setComponent(a: MutableAttributeSet, c: Component): void {
    a.addAttribute(AbstractDocument.ElementNameAttribute, StyleConstants.ComponentElementName);
    a.addAttribute(StyleConstants.ComponentAttribute, c);
  }
  /**
   * Gets the icon setting from the attribute list.
   *
   * @param a the attribute set
   * @return the icon, null if none
   */
  static getIcon(a: AttributeSet): Icon {
    return a.getAttribute(StyleConstants.IconAttribute);
  }
  /**
   * Gets the font family setting from the attribute list.
   *
   * @param a the attribute set
   * @return the font family, "Monospaced" as the default
   */
  static getFontFamily(a: AttributeSet): string {
    let family = a.getAttribute(StyleConstants.FontFamily);
    if (family == null) {
      family = 'Monospaced';
    }
    return family;
  }
  /**
   * Sets the font attribute.
   *
   * @param a the attribute set
   * @param fam the font
   */
  static setFontFamily(a: MutableAttributeSet, fam: string): void {
    a.addAttribute(StyleConstants.FontFamily, fam);
  }
  /**
   * Gets the font size setting from the attribute list.
   *
   * @param a the attribute set
   * @return the font size, 12 as the default
   */
  static getFontSize(a: AttributeSet): number {
    let size = a.getAttribute(StyleConstants.FontSize);
    if (size != null) {
      return (+size);
    }
    return 12;
  }
  /**
   * Sets the font size attribute.
   *
   * @param a the attribute set
   * @param s the font size
   */
  static setFontSize(a: MutableAttributeSet, s: number): void {
    a.addAttribute(StyleConstants.FontSize, s);
  }
  /**
   * Checks whether the bold attribute is set.
   *
   * @param a the attribute set
   * @return true if set else false
   */
  static isBold(a: AttributeSet): boolean {
    let bold = a.getAttribute(StyleConstants.Bold);
    if (bold != null) {
      return bold;
    }
    return false;
  }
  /**
   * Sets the bold attribute.
   *
   * @param a the attribute set
   * @param b specifies true/false for setting the attribute
   */
  static setBold(a: MutableAttributeSet, b: boolean): void {
    a.addAttribute(StyleConstants.Bold, b);
  }
  /**
   * Checks whether the italic attribute is set.
   *
   * @param a the attribute set
   * @return true if set else false
   */
  static isItalic(a: AttributeSet): boolean {
    let italic = a.getAttribute(StyleConstants.Italic);
    if (italic != null) {
      return italic;
    }
    return false;
  }
  /**
   * Sets the italic attribute.
   *
   * @param a the attribute set
   * @param b specifies true/false for setting the attribute
   */
  static setItalic(a: MutableAttributeSet, b: boolean): void {
    a.addAttribute(StyleConstants.Italic, b);
  }
  /**
   * Checks whether the underline attribute is set.
   *
   * @param a the attribute set
   * @return true if set else false
   */
  static isUnderline(a: AttributeSet): boolean {
    let underline = a.getAttribute(StyleConstants.Underline);
    if (underline != null) {
      return underline;
    }
    return false;
  }
  /**
   * Checks whether the strikethrough attribute is set.
   *
   * @param a the attribute set
   * @return true if set else false
   */
  static isStrikeThrough(a: AttributeSet): boolean {
    let strike = a.getAttribute(StyleConstants.StrikeThrough);
    if (strike != null) {
      return strike;
    }
    return false;
  }
  /**
   * Checks whether the superscript attribute is set.
   *
   * @param a the attribute set
   * @return true if set else false
   */
  static isSuperscript(a: AttributeSet): boolean {
    let superscript = a.getAttribute(StyleConstants.Superscript);
    if (superscript != null) {
      return superscript;
    }
    return false;
  }
  /**
   * Checks whether the subscript attribute is set.
   *
   * @param a the attribute set
   * @return true if set else false
   */
  static isSubscript(a: AttributeSet): boolean {
    let subscript = a.getAttribute(StyleConstants.Subscript);
    if (subscript != null) {
      return subscript;
    }
    return false;
  }
  /**
   * Sets the underline attribute.
   *
   * @param a the attribute set
   * @param b specifies true/false for setting the attribute
   */
  static setUnderline(a: MutableAttributeSet, b: boolean): void {
    a.addAttribute(StyleConstants.Underline, b);
  }
  /**
   * Gets the foreground color setting from the attribute list.
   *
   * @param a the attribute set
   * @return the color, Color.black as the default
   */
  static getForeground(a: AttributeSet): Color {
    let fg = a.getAttribute(StyleConstants.Foreground);
    if (fg == null) {
      fg = Color.black;
    }
    return fg;
  }
  /**
   * Sets the foreground color.
   *
   * @param a the attribute set
   * @param fg the color
   */
  static setForeground(a: MutableAttributeSet, fg: Color): void {
    a.addAttribute(StyleConstants.Foreground, fg);
  }
  /**
   * Gets the background color setting from the attribute list.
   *
   * @param a the attribute set
   * @return the color, Color.black as the default
   */
  static getBackground(a: AttributeSet): Color {
    let fg = a.getAttribute(StyleConstants.Background);
    if (fg == null) {
      fg = Color.black;
    }
    return fg;
  }
  /**
   * Gets the first line indent setting.
   *
   * @param a the attribute set
   * @return the value, 0 if not set
   */
  static getFirstLineIndent(a: AttributeSet): number {
    let indent = a.getAttribute(StyleConstants.FirstLineIndent);
    if (indent != null) {
      return Math.fround(+indent);
    }
    return 0;
  }
  /**
   * Gets the right indent setting.
   *
   * @param a the attribute set
   * @return the value, 0 if not set
   */
  static getRightIndent(a: AttributeSet): number {
    let indent = a.getAttribute(StyleConstants.RightIndent);
    if (indent != null) {
      return Math.fround(+indent);
    }
    return 0;
  }
  /**
   * Gets the left indent setting.
   *
   * @param a the attribute set
   * @return the value, 0 if not set
   */
  static getLeftIndent(a: AttributeSet): number {
    let indent = a.getAttribute(StyleConstants.LeftIndent);
    if (indent != null) {
      return Math.fround(+indent);
    }
    return 0;
  }
  /**
   * Gets the line spacing setting.
   *
   * @param a the attribute set
   * @return the value, 0 if not set
   */
  static getLineSpacing(a: AttributeSet): number {
    let space = a.getAttribute(StyleConstants.LineSpacing);
    if (space != null) {
      return Math.fround(+space);
    }
    return 0;
  }
  /**
   * Gets the space above setting.
   *
   * @param a the attribute set
   * @return the value, 0 if not set
   */
  static getSpaceAbove(a: AttributeSet): number {
    let space = a.getAttribute(StyleConstants.SpaceAbove);
    if (space != null) {
      return Math.fround(+space);
    }
    return 0;
  }
  /**
   * Gets the space below setting.
   *
   * @param a the attribute set
   * @return the value, 0 if not set
   */
  static getSpaceBelow(a: AttributeSet): number {
    let space = a.getAttribute(StyleConstants.SpaceBelow);
    if (space != null) {
      return Math.fround(+space);
    }
    return 0;
  }
  /**
   * Sets alignment.
   *
   * @param a the attribute set
   * @param align the alignment value
   */
  static setAlignment(a: MutableAttributeSet, align: number): void {
    a.addAttribute(StyleConstants.Alignment, align);
  }
  /**
   * Gets the TabSet.
   *
   * @param a the attribute set
   * @return the <code>TabSet</code>
   */
  static getTabSet(a: AttributeSet): TabSet {
    let tabs = a.getAttribute(StyleConstants.TabSet);
    return tabs;
  }
  static $clinit() {
    StyleConstants.NameAttribute = new StyleConstants()._StyleConstants('name');
    StyleConstants.ResolveAttribute = new StyleConstants()._StyleConstants('resolver');
    StyleConstants.ModelAttribute = new StyleConstants()._StyleConstants('model');
    StyleConstants.BidiLevel = new StyleConstants$CharacterConstants()._StyleConstants$CharacterConstants('bidiLevel');
    StyleConstants.FontFamily = new StyleConstants$FontConstants()._StyleConstants$FontConstants('family');
    StyleConstants.Family = StyleConstants.FontFamily;
    StyleConstants.FontSize = new StyleConstants$FontConstants()._StyleConstants$FontConstants('size');
    StyleConstants.Size = StyleConstants.FontSize;
    StyleConstants.Bold = new StyleConstants$FontConstants()._StyleConstants$FontConstants('bold');
    StyleConstants.Italic = new StyleConstants$FontConstants()._StyleConstants$FontConstants('italic');
    StyleConstants.Underline = new StyleConstants$CharacterConstants()._StyleConstants$CharacterConstants('underline');
    StyleConstants.StrikeThrough = new StyleConstants$CharacterConstants()._StyleConstants$CharacterConstants('strikethrough');
    StyleConstants.Superscript = new StyleConstants$CharacterConstants()._StyleConstants$CharacterConstants('superscript');
    StyleConstants.Subscript = new StyleConstants$CharacterConstants()._StyleConstants$CharacterConstants('subscript');
    StyleConstants.Foreground = new StyleConstants$ColorConstants()._StyleConstants$ColorConstants('foreground');
    StyleConstants.Background = new StyleConstants$ColorConstants()._StyleConstants$ColorConstants('background');
    StyleConstants.ComponentAttribute = new StyleConstants$CharacterConstants()._StyleConstants$CharacterConstants('component');
    StyleConstants.IconAttribute = new StyleConstants$CharacterConstants()._StyleConstants$CharacterConstants('icon');
    StyleConstants.ComposedTextAttribute = new StyleConstants()._StyleConstants('composed text');
    StyleConstants.FirstLineIndent = new StyleConstants$ParagraphConstants()._StyleConstants$ParagraphConstants('FirstLineIndent');
    StyleConstants.LeftIndent = new StyleConstants$ParagraphConstants()._StyleConstants$ParagraphConstants('LeftIndent');
    StyleConstants.RightIndent = new StyleConstants$ParagraphConstants()._StyleConstants$ParagraphConstants('RightIndent');
    StyleConstants.LineSpacing = new StyleConstants$ParagraphConstants()._StyleConstants$ParagraphConstants('LineSpacing');
    StyleConstants.SpaceAbove = new StyleConstants$ParagraphConstants()._StyleConstants$ParagraphConstants('SpaceAbove');
    StyleConstants.SpaceBelow = new StyleConstants$ParagraphConstants()._StyleConstants$ParagraphConstants('SpaceBelow');
    StyleConstants.Alignment = new StyleConstants$ParagraphConstants()._StyleConstants$ParagraphConstants('Alignment');
    StyleConstants.TabSet = new StyleConstants$ParagraphConstants()._StyleConstants$ParagraphConstants('TabSet');
    StyleConstants.Orientation = new StyleConstants$ParagraphConstants()._StyleConstants$ParagraphConstants('Orientation');
    StyleConstants.keys = [StyleConstants.NameAttribute, StyleConstants.ResolveAttribute, StyleConstants.BidiLevel, StyleConstants.FontFamily, StyleConstants.FontSize, StyleConstants.Bold, StyleConstants.Italic, StyleConstants.Underline, StyleConstants.StrikeThrough, StyleConstants.Superscript, StyleConstants.Subscript, StyleConstants.Foreground, StyleConstants.Background, StyleConstants.ComponentAttribute, StyleConstants.IconAttribute, StyleConstants.FirstLineIndent, StyleConstants.LeftIndent, StyleConstants.RightIndent, StyleConstants.LineSpacing, StyleConstants.SpaceAbove, StyleConstants.SpaceBelow, StyleConstants.Alignment, StyleConstants.TabSet, StyleConstants.Orientation, StyleConstants.ModelAttribute, StyleConstants.ComposedTextAttribute];
  }
}

/**
 * This is a typesafe enumeration of the <em>well-known</em>
 * attributes that contribute to a paragraph style.  These are
 * aliased by the outer class for general presentation.
 */
export class StyleConstants$ParagraphConstants extends StyleConstants {
  _StyleConstants$ParagraphConstants(representation: string): this {
    this._StyleConstants(representation);
    return this;
  }
}

/**
 * This is a typesafe enumeration of the <em>well-known</em>
 * attributes that contribute to a character style.  These are
 * aliased by the outer class for general presentation.
 */
export class StyleConstants$CharacterConstants extends StyleConstants {
  _StyleConstants$CharacterConstants(representation: string): this {
    this._StyleConstants(representation);
    return this;
  }
}

/**
 * This is a typesafe enumeration of the <em>well-known</em>
 * attributes that contribute to a color.  These are aliased
 * by the outer class for general presentation.
 */
export class StyleConstants$ColorConstants extends StyleConstants {
  _StyleConstants$ColorConstants(representation: string): this {
    this._StyleConstants(representation);
    return this;
  }
}

/**
 * This is a typesafe enumeration of the <em>well-known</em>
 * attributes that contribute to a font.  These are aliased
 * by the outer class for general presentation.
 */
export class StyleConstants$FontConstants extends StyleConstants {
  _StyleConstants$FontConstants(representation: string): this {
    this._StyleConstants(representation);
    return this;
  }
}

$J.define(StyleConstants, 'javax.swing.text.StyleConstants', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String': '_StyleConstants' }, clinit: true, lazy: ['NameAttribute', 'ResolveAttribute', 'ModelAttribute', 'BidiLevel', 'FontFamily', 'Family', 'FontSize', 'Size', 'Bold', 'Italic', 'Underline', 'StrikeThrough', 'Superscript', 'Subscript', 'Foreground', 'Background', 'ComponentAttribute', 'IconAttribute', 'ComposedTextAttribute', 'FirstLineIndent', 'LeftIndent', 'RightIndent', 'LineSpacing', 'SpaceAbove', 'SpaceBelow', 'Alignment', 'TabSet', 'Orientation', 'keys'] });
$J.define(StyleConstants$ParagraphConstants, 'javax.swing.text.StyleConstants$ParagraphConstants', { kind: 'class', ifaces: ['javax.swing.text.AttributeSet$ParagraphAttribute'], sup: 'javax.swing.text.StyleConstants', ctors: { 'java.lang.String': '_StyleConstants$ParagraphConstants' } });
$J.define(StyleConstants$CharacterConstants, 'javax.swing.text.StyleConstants$CharacterConstants', { kind: 'class', ifaces: ['javax.swing.text.AttributeSet$CharacterAttribute'], sup: 'javax.swing.text.StyleConstants', ctors: { 'java.lang.String': '_StyleConstants$CharacterConstants' } });
$J.define(StyleConstants$ColorConstants, 'javax.swing.text.StyleConstants$ColorConstants', { kind: 'class', ifaces: ['javax.swing.text.AttributeSet$ColorAttribute', 'javax.swing.text.AttributeSet$CharacterAttribute'], sup: 'javax.swing.text.StyleConstants', ctors: { 'java.lang.String': '_StyleConstants$ColorConstants' } });
$J.define(StyleConstants$FontConstants, 'javax.swing.text.StyleConstants$FontConstants', { kind: 'class', ifaces: ['javax.swing.text.AttributeSet$FontAttribute', 'javax.swing.text.AttributeSet$CharacterAttribute'], sup: 'javax.swing.text.StyleConstants', ctors: { 'java.lang.String': '_StyleConstants$FontConstants' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
});
