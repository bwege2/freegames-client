// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/LabelView.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../jre/index.ts';
import { GlyphView } from './GlyphView.ts';

let StateInvariantError, StyleConstants, StyledDocument;

/**
 * A <code>LabelView</code> is a styled chunk of text
 * that represents a view mapped over an element in the
 * text model.  It caches the character level attributes
 * used for rendering.
 *
 * @author Timothy Prinzing
 */
export class LabelView extends GlyphView {
  font: Font = null;
  fg: Color = null;
  bg: Color = null;
  underline: boolean = false;
  strike: boolean = false;
  superscript: boolean = false;
  subscript: boolean = false;
  /**
   * Constructs a new view wrapped on an element.
   *
   * @param elem the element
   */
  _LabelView(elem: Element): this {
    this._GlyphView(elem);
    return this;
  }
  /**
   * Synchronize the view's cached values with the model.
   * This causes the font, metrics, color, etc to be
   * re-cached if the cache has been invalidated.
   */
  sync(): void {
    if (this.font == null) {
      this.setPropertiesFromAttributes();
    }
  }
  /**
   * Sets whether or not the view is underlined.
   * Note that this setter is protected and is really
   * only meant if you need to update some additional
   * state when set.
   *
   * @param u true if the view is underlined, otherwise
   *          false
   * @see #isUnderline
   */
  setUnderline(u: boolean): void {
    this.underline = u;
  }
  /**
   * Sets whether or not the view has a strike/line
   * through it.
   * Note that this setter is protected and is really
   * only meant if you need to update some additional
   * state when set.
   *
   * @param s true if the view has a strike/line
   *          through it, otherwise false
   * @see #isStrikeThrough
   */
  setStrikeThrough(s: boolean): void {
    this.strike = s;
  }
  /**
   * Sets whether or not the view represents a
   * superscript.
   * Note that this setter is protected and is really
   * only meant if you need to update some additional
   * state when set.
   *
   * @param s true if the view represents a
   *          superscript, otherwise false
   * @see #isSuperscript
   */
  setSuperscript(s: boolean): void {
    this.superscript = s;
  }
  /**
   * Sets whether or not the view represents a
   * subscript.
   * Note that this setter is protected and is really
   * only meant if you need to update some additional
   * state when set.
   *
   * @param s true if the view represents a
   *          subscript, otherwise false
   * @see #isSubscript
   */
  setSubscript(s: boolean): void {
    this.subscript = s;
  }
  /**
   * Sets the cached properties from the attributes.
   */
  setPropertiesFromAttributes(): void {
    let attr = this.getAttributes();
    if (attr != null) {
      let d = this.getDocument();
      if ($J.isa(d, StyledDocument)) {
        let doc = d;
        this.font = doc.getFont(attr);
        this.fg = doc.getForeground(attr);
        if (attr.isDefined(StyleConstants.Background)) {
          this.bg = doc.getBackground(attr);
        } else {
          this.bg = null;
        }
        this.setUnderline(StyleConstants.isUnderline(attr));
        this.setStrikeThrough(StyleConstants.isStrikeThrough(attr));
        this.setSuperscript(StyleConstants.isSuperscript(attr));
        this.setSubscript(StyleConstants.isSubscript(attr));
      } else {
        throw new StateInvariantError()._StateInvariantError('LabelView needs StyledDocument');
      }
    }
  }
  /**
   * Fetches the background color to use to render the glyphs.
   * This is implemented to return a cached background color,
   * which defaults to <code>null</code>.
   *
   * @return the cached background color
   * @since 1.3
   */
  getBackground(): Color {
    this.sync();
    return this.bg;
  }
  /**
   * Fetches the foreground color to use to render the glyphs.
   * This is implemented to return a cached foreground color,
   * which defaults to <code>null</code>.
   *
   * @return the cached foreground color
   * @since 1.3
   */
  getForeground(): Color {
    this.sync();
    return this.fg;
  }
  /**
   * Fetches the font that the glyphs should be based upon.
   * This is implemented to return a cached font.
   *
   * @return the cached font
   */
  getFont(): Font {
    this.sync();
    return this.font;
  }
  /**
   * Determines if the glyphs should be underlined.  If true,
   * an underline should be drawn through the baseline.  This
   * is implemented to return the cached underline property.
   *
   * <p>When you request this property, <code>LabelView</code>
   * re-syncs its state with the properties of the
   * <code>Element</code>'s <code>AttributeSet</code>.
   * If <code>Element</code>'s <code>AttributeSet</code>
   * does not have this property set, it will revert to false.
   *
   * @return the value of the cached
   *     <code>underline</code> property
   * @since 1.3
   */
  isUnderline(): boolean {
    this.sync();
    return this.underline;
  }
  /**
   * Determines if the glyphs should have a strikethrough
   * line.  If true, a line should be drawn through the center
   * of the glyphs.  This is implemented to return the
   * cached <code>strikeThrough</code> property.
   *
   * <p>When you request this property, <code>LabelView</code>
   * re-syncs its state with the properties of the
   * <code>Element</code>'s <code>AttributeSet</code>.
   * If <code>Element</code>'s <code>AttributeSet</code>
   * does not have this property set, it will revert to false.
   *
   * @return the value of the cached
   *     <code>strikeThrough</code> property
   * @since 1.3
   */
  isStrikeThrough(): boolean {
    this.sync();
    return this.strike;
  }
  /**
   * Determines if the glyphs should be rendered as superscript.
   *
   * <p>When you request this property, <code>LabelView</code>
   * re-syncs its state with the properties of the
   * <code>Element</code>'s <code>AttributeSet</code>.
   * If <code>Element</code>'s <code>AttributeSet</code>
   * does not have this property set, it will revert to false.
   *
   * @return the value of the cached
   *     <code>subscript</code> property
   * @since 1.3
   */
  isSubscript(): boolean {
    this.sync();
    return this.subscript;
  }
  /**
   * Determines if the glyphs should be rendered as subscript.
   *
   * <p>When you request this property, <code>LabelView</code>
   * re-syncs its state with the properties of the
   * <code>Element</code>'s <code>AttributeSet</code>.
   * If <code>Element</code>'s <code>AttributeSet</code>
   * does not have this property set, it will revert to false.
   *
   * @return the value of the cached
   *     <code>superscript</code> property
   * @since 1.3
   */
  isSuperscript(): boolean {
    this.sync();
    return this.superscript;
  }
  /**
   * Gives notification from the document that attributes were changed
   * in a location that this view is responsible for.
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#changedUpdate
   */
  changedUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.font = null;
    super.changedUpdate(e, a, f);
  }
}

$J.define(LabelView, 'javax.swing.text.LabelView', { kind: 'class', ifaces: ['javax.swing.text.TabableView'], sup: 'javax.swing.text.GlyphView', ctors: { 'javax.swing.text.Element': '_LabelView' } });
$J.module(() => {
  StateInvariantError = $J.load('javax.swing.text.StateInvariantError');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  StyledDocument = $J.load('javax.swing.text.StyledDocument');
});
