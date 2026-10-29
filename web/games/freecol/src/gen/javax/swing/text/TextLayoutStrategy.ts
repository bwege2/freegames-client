// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/TextLayoutStrategy.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AttributedCharacterIterator_Attribute, BidiUtils, BreakIterator, HashSet, Hashtable, IllegalArgumentException, JSet, LineBreakMeasurer } from '../../../../jre/index.ts';
import { FlowView$FlowStrategy } from './FlowView.ts';
import { Segment } from './Segment.ts';

let TextAttribute, JComponent, AbstractDocument, BadLocationException, GlyphPainter2, GlyphView, Position$Bias, StyleConstants, SwingUtilities2;

/**
 * A flow strategy that uses java.awt.font.LineBreakMeasurer to
 * produce java.awt.font.TextLayout for i18n capable rendering.
 * If the child view being placed into the flow is of type
 * GlyphView and can be rendered by TextLayout, a GlyphPainter
 * that uses TextLayout is plugged into the GlyphView.
 *
 * @author  Timothy Prinzing
 */
export class TextLayoutStrategy extends FlowView$FlowStrategy {
  measurer: LineBreakMeasurer = null;
  text_: TextLayoutStrategy$AttributedSegment = null;
  /**
   * Constructs a layout strategy for paragraphs based
   * upon java.awt.font.LineBreakMeasurer.
   */
  _TextLayoutStrategy(): this {
    this._FlowView$FlowStrategy();
    this.text_ = new TextLayoutStrategy$AttributedSegment()._TextLayoutStrategy$AttributedSegment();
    return this;
  }
  /**
   * Gives notification that something was inserted into the document
   * in a location that the given flow view is responsible for.  The
   * strategy should update the appropriate changed region (which
   * depends upon the strategy used for repair).
   *
   * @param e the change information from the associated document
   * @param alloc the current allocation of the view inside of the insets.
   *   This value will be null if the view has not yet been displayed.
   * @see View#insertUpdate
   */
  insertUpdate(fv: FlowView, e: DocumentEvent, alloc: Rectangle): void {
    this.sync(fv);
    super.insertUpdate(fv, e, alloc);
  }
  /**
   * Gives notification that something was removed from the document
   * in a location that the given flow view is responsible for.
   *
   * @param e the change information from the associated document
   * @param alloc the current allocation of the view inside of the insets.
   * @see View#removeUpdate
   */
  removeUpdate(fv: FlowView, e: DocumentEvent, alloc: Rectangle): void {
    this.sync(fv);
    super.removeUpdate(fv, e, alloc);
  }
  /**
   * Gives notification from the document that attributes were changed
   * in a location that this view is responsible for.
   *
   * @param e the change information from the associated document
   * @param alloc the current allocation of the view inside of the insets.
   * @see View#changedUpdate
   */
  changedUpdate(fv: FlowView, e: DocumentEvent, alloc: Rectangle): void {
    this.sync(fv);
    super.changedUpdate(fv, e, alloc);
  }
  /**
   * Does a full layout on the given View.  This causes all of
   * the rows (child views) to be rebuilt to match the given
   * constraints for each row.  This is called by FlowView.layout
   * to update the child views in the flow.
   *
   * @param fv the view to reflow
   */
  layout(fv: FlowView): void {
    super.layout(fv);
  }
  /**
   * Creates a row of views that will fit within the
   * layout span of the row.  This is implemented to execute the
   * superclass functionality (which fills the row with child
   * views or view fragments) and follow that with bidi reordering
   * of the unidirectional view fragments.
   *
   * @param rowIndex the row to fill in with views.  This is assumed
   *   to be empty on entry.
   * @param p0  The current position in the children of
   *   this view element from which to start.
   * @return the position to start the next row
   */
  layoutRow(fv: FlowView, rowIndex: number, p0: number): number {
    let p1 = super.layoutRow(fv, rowIndex, p0);
    let row = fv.getView(rowIndex);
    let doc = fv.getDocument();
    let i18nFlag = doc.getProperty(AbstractDocument.I18NProperty);
    if ((i18nFlag != null) && $J.equals(i18nFlag, true)) {
      let n = row.getViewCount();
      if (n > 1) {
        let d = fv.getDocument();
        let bidiRoot = d.getBidiRootElement();
        let levels = $J.newArray(n, 0);
        let reorder = $J.newArray(n, null);
        for (let i = 0; i < n; i++) {
          let v = row.getView(i);
          let bidiIndex = bidiRoot.getElementIndex(v.getStartOffset());
          let bidiElem = bidiRoot.getElement(bidiIndex);
          levels[i] = ((StyleConstants.getBidiLevel(bidiElem.getAttributes())) << 24) >> 24;
          reorder[i] = v;
        }
        BidiUtils.reorderVisually(levels, reorder);
        row.replace(0, n, reorder);
      }
    }
    return p1;
  }
  /**
   * Creates a unidirectional view that can be used to represent the
   * current chunk.  This can be either an entire view from the
   * logical view, or a fragment of the view.
   *
   * @param fv the view holding the flow
   * @param startOffset the start location for the view being created
   * @param spanLeft the amount of span left to fill in the row
   * @param rowIndex the row the view will be placed into
   */
  createView(fv: FlowView, startOffset: number, spanLeft: number, rowIndex: number): View {
    let lv = this.getLogicalView(fv);
    let row = fv.getView(rowIndex);
    let requireNextWord = (this.viewBuffer.size() === 0) ? false : true;
    let childIndex = lv.getViewIndex$int$Bias(startOffset, Position$Bias.Forward);
    let v = lv.getView(childIndex);
    let endOffset = this.getLimitingOffset(v, startOffset, spanLeft, requireNextWord);
    if (endOffset === startOffset) {
      return null;
    }
    let frag: View;
    if ((startOffset === v.getStartOffset()) && (endOffset === v.getEndOffset())) {
      frag = v;
    } else {
      frag = v.createFragment(startOffset, endOffset);
    }
    if ((frag instanceof GlyphView) && (this.measurer != null)) {
      let isTab = false;
      let p0 = frag.getStartOffset();
      let p1 = frag.getEndOffset();
      if (((p1 - p0) | 0) === 1) {
        let s = (frag).getText(p0, p1);
        let ch = s.first();
        if (ch === 9 /* \u0009 */) {
          isTab = true;
        }
      }
      let tl = (isTab) ? null : this.measurer.nextLayout(Math.fround(spanLeft), this.text_.toIteratorIndex(endOffset), requireNextWord);
      if (tl != null) {
        (frag).setGlyphPainter(new GlyphPainter2()._GlyphPainter2(tl));
      }
    }
    return frag;
  }
  /**
   * Calculate the limiting offset for the next view fragment.
   * At most this would be the entire view (i.e. the limiting
   * offset would be the end offset in that case).  If the range
   * contains a tab or a direction change, that will limit the
   * offset to something less.  This value is then fed to the
   * LineBreakMeasurer as a limit to consider in addition to the
   * remaining span.
   *
   * @param v the logical view representing the starting offset.
   * @param startOffset the model location to start at.
   */
  getLimitingOffset(v: View, startOffset: number, spanLeft: number, requireNextWord: boolean): number {
    let endOffset = v.getEndOffset();
    let doc = v.getDocument();
    if (doc instanceof AbstractDocument) {
      let d = doc;
      let bidiRoot = d.getBidiRootElement();
      if (bidiRoot.getElementCount() > 1) {
        let bidiIndex = bidiRoot.getElementIndex(startOffset);
        let bidiElem = bidiRoot.getElement(bidiIndex);
        endOffset = Math.min(bidiElem.getEndOffset(), endOffset);
      }
    }
    if (v instanceof GlyphView) {
      let s = (v).getText(startOffset, endOffset);
      let ch = s.first();
      if (ch === 9 /* \u0009 */) {
        endOffset = (startOffset + 1) | 0;
      } else {
        for (ch = s.next(); ch !== 65535 /* \uffff */; ch = s.next()) {
          if (ch === 9 /* \u0009 */) {
            endOffset = (startOffset + s.getIndex() - s.getBeginIndex()) | 0;
            break;
          }
        }
      }
    }
    let limitIndex = this.text_.toIteratorIndex(endOffset);
    if (this.measurer != null) {
      let index = this.text_.toIteratorIndex(startOffset);
      if (this.measurer.getPosition() !== index) {
        this.measurer.setPosition(index);
      }
      limitIndex = this.measurer.nextOffset(Math.fround(spanLeft), limitIndex, requireNextWord);
    }
    let pos = this.text_.toModelPosition(limitIndex);
    return pos;
  }
  /**
   * Synchronize the strategy with its FlowView.  Allows the strategy
   * to update its state to account for changes in that portion of the
   * model represented by the FlowView.  Also allows the strategy
   * to update the FlowView in response to these changes.
   */
  sync(fv: FlowView): void {
    let lv = this.getLogicalView(fv);
    this.text_.setView(lv);
    let container = fv.getContainer();
    let frc = SwingUtilities2.getFontRenderContext$Component(container);
    let iter: BreakIterator;
    let c = fv.getContainer();
    if (c != null) {
      iter = BreakIterator.getLineInstance(c.getLocale$());
    } else {
      iter = BreakIterator.getLineInstance();
    }
    let shaper = null;
    if (c instanceof JComponent) {
      shaper = (c).getClientProperty(TextAttribute.NUMERIC_SHAPING);
    }
    this.text_.setShaper(shaper);
    this.measurer = new LineBreakMeasurer(this.text_, iter, frc);
    let n = lv.getViewCount();
    for (let i = 0; i < n; i++) {
      let child = lv.getView(i);
      if (child instanceof GlyphView) {
        let p0 = child.getStartOffset();
        let p1 = child.getEndOffset();
        this.measurer.setPosition(this.text_.toIteratorIndex(p0));
        let layout = this.measurer.nextLayout(Math.fround(3.4028235E38), this.text_.toIteratorIndex(p1), false);
        (child).setGlyphPainter(new GlyphPainter2()._GlyphPainter2(layout));
      }
    }
    this.measurer.setPosition(this.text_.getBeginIndex());
  }
}

/**
 * Implementation of AttributedCharacterIterator that supports
 * the GlyphView attributes for rendering the glyphs through a
 * TextLayout.
 */
export class TextLayoutStrategy$AttributedSegment extends Segment {
  v: View = null;
  static keys: JSet<AttributedCharacterIterator_Attribute> = null;
  shaper: any = null;
  _TextLayoutStrategy$AttributedSegment(): this {
    this._Segment$();
    this.shaper = null;
    return this;
  }
  setView(v: View): void {
    this.v = v;
    let doc = v.getDocument();
    let p0 = v.getStartOffset();
    let p1 = v.getEndOffset();
    try {
      doc.getText$int$int$Segment(p0, (p1 - p0) | 0, this);
    } catch ($e0) {
      if ($J.isa($e0, BadLocationException)) {
        let bl = $J.exc($e0);
        throw new IllegalArgumentException('Invalid view');
      } else {
        throw $e0;
      }
    }
    this.first();
  }
  /**
   * Get a boundary position for the font.
   * This is implemented to assume that two fonts are
   * equal if their references are equal (i.e. that the
   * font came from a cache).
   *
   * @return the location in model coordinates.  This is
   *  not the same as the Segment coordinates.
   */
  getFontBoundary(childIndex: number, dir: number): number {
    let child = this.v.getView(childIndex);
    let f = this.getFont(childIndex);
    for (childIndex = (childIndex + dir) | 0; (childIndex >= 0) && (childIndex < this.v.getViewCount()); childIndex = (childIndex + dir) | 0) {
      let next = this.getFont(childIndex);
      if (next !== f) {
        break;
      }
      child = this.v.getView(childIndex);
    }
    return (dir < 0) ? child.getStartOffset() : child.getEndOffset();
  }
  /**
   * Get the font at the given child index.
   */
  getFont(childIndex: number): Font {
    let child = this.v.getView(childIndex);
    if (child instanceof GlyphView) {
      return (child).getFont();
    }
    return null;
  }
  toModelPosition(index: number): number {
    return (this.v.getStartOffset() + (index - this.getBeginIndex())) | 0;
  }
  toIteratorIndex(pos: number): number {
    return (pos - this.v.getStartOffset() + this.getBeginIndex()) | 0;
  }
  setShaper(shaper: any): void {
    this.shaper = shaper;
  }
  /**
   * Returns the index of the first character of the run
   * with respect to all attributes containing the current character.
   */
  getRunStart$(): number {
    let pos = this.toModelPosition(this.getIndex());
    let i = this.v.getViewIndex$int$Bias(pos, Position$Bias.Forward);
    let child = this.v.getView(i);
    return this.toIteratorIndex(child.getStartOffset());
  }
  /**
   * Returns the index of the first character of the run
   * with respect to the given attribute containing the current character.
   */
  getRunStart$Attribute(attribute: AttributedCharacterIterator_Attribute): number {
    if (attribute instanceof TextAttribute) {
      let pos = this.toModelPosition(this.getIndex());
      let i = this.v.getViewIndex$int$Bias(pos, Position$Bias.Forward);
      if (attribute === TextAttribute.FONT) {
        return this.toIteratorIndex(this.getFontBoundary(i, -1));
      }
    }
    return this.getBeginIndex();
  }
  /**
   * Returns the index of the first character of the run
   * with respect to the given attributes containing the current character.
   */
  getRunStart$Set(attributes: JSet<AttributedCharacterIterator_Attribute>): number {
    let index = this.getBeginIndex();
    let a = attributes.toArray();
    for (let i = 0; i < a.length; i++) {
      let attr = a[i];
      index = Math.max(this.getRunStart(attr), index);
    }
    return Math.min(this.getIndex(), index);
  }
  /**
   * Returns the index of the first character following the run
   * with respect to all attributes containing the current character.
   */
  getRunLimit$(): number {
    let pos = this.toModelPosition(this.getIndex());
    let i = this.v.getViewIndex$int$Bias(pos, Position$Bias.Forward);
    let child = this.v.getView(i);
    return this.toIteratorIndex(child.getEndOffset());
  }
  /**
   * Returns the index of the first character following the run
   * with respect to the given attribute containing the current character.
   */
  getRunLimit$Attribute(attribute: AttributedCharacterIterator_Attribute): number {
    if (attribute instanceof TextAttribute) {
      let pos = this.toModelPosition(this.getIndex());
      let i = this.v.getViewIndex$int$Bias(pos, Position$Bias.Forward);
      if (attribute === TextAttribute.FONT) {
        return this.toIteratorIndex(this.getFontBoundary(i, 1));
      }
    }
    return this.getEndIndex();
  }
  /**
   * Returns the index of the first character following the run
   * with respect to the given attributes containing the current character.
   */
  getRunLimit$Set(attributes: JSet<AttributedCharacterIterator_Attribute>): number {
    let index = this.getEndIndex();
    let a = attributes.toArray();
    for (let i = 0; i < a.length; i++) {
      let attr = a[i];
      index = Math.min(this.getRunLimit(attr), index);
    }
    return Math.max(this.getIndex(), index);
  }
  /**
   * Returns a map with the attributes defined on the current
   * character.
   */
  getAttributes(): JMap<AttributedCharacterIterator_Attribute, any> {
    let ka = TextLayoutStrategy$AttributedSegment.keys.toArray();
    let h = new Hashtable();
    for (let i = 0; i < ka.length; i++) {
      let a = ka[i];
      let value = this.getAttribute(a);
      if (value != null) {
        h.put(a, value);
      }
    }
    return h;
  }
  /**
   * Returns the value of the named attribute for the current character.
   * Returns null if the attribute is not defined.
   * @param attribute the key of the attribute whose value is requested.
   */
  getAttribute(attribute: AttributedCharacterIterator_Attribute): any {
    let pos = this.toModelPosition(this.getIndex());
    let childIndex = this.v.getViewIndex$int$Bias(pos, Position$Bias.Forward);
    if (attribute === TextAttribute.FONT) {
      return this.getFont(childIndex);
    } else if (attribute === TextAttribute.RUN_DIRECTION) {
      return this.v.getDocument().getProperty(TextAttribute.RUN_DIRECTION);
    } else if (attribute === TextAttribute.NUMERIC_SHAPING) {
      return this.shaper;
    }
    return null;
  }
  /**
   * Returns the keys of all attributes defined on the
   * iterator's text range. The set is empty if no
   * attributes are defined.
   */
  getAllAttributeKeys(): JSet<AttributedCharacterIterator_Attribute> {
    return TextLayoutStrategy$AttributedSegment.keys;
  }
  getRunLimit(...a: any[]): any {
    if (a.length === 0) return this.getRunLimit$(...a);
    if (a.length === 1 && (a[0] == null || $J.isa(a[0], JSet))) return this.getRunLimit$Set(...a);
    if (a.length === 1 && (a[0] == null || $J.isa(a[0], AttributedCharacterIterator_Attribute))) return this.getRunLimit$Attribute(...a);
    throw new Error('no overload of getRunLimit for these arguments');
  }
  getRunStart(...a: any[]): any {
    if (a.length === 0) return this.getRunStart$(...a);
    if (a.length === 1 && (a[0] == null || $J.isa(a[0], JSet))) return this.getRunStart$Set(...a);
    if (a.length === 1 && (a[0] == null || $J.isa(a[0], AttributedCharacterIterator_Attribute))) return this.getRunStart$Attribute(...a);
    throw new Error('no overload of getRunStart for these arguments');
  }
  static $clinit() {
    TextLayoutStrategy$AttributedSegment.keys = new HashSet();
    TextLayoutStrategy$AttributedSegment.keys.add(TextAttribute.FONT);
    TextLayoutStrategy$AttributedSegment.keys.add(TextAttribute.RUN_DIRECTION);
    TextLayoutStrategy$AttributedSegment.keys.add(TextAttribute.NUMERIC_SHAPING);
  }
}

$J.define(TextLayoutStrategy, 'javax.swing.text.TextLayoutStrategy', { kind: 'class', sup: 'javax.swing.text.FlowView$FlowStrategy', ctors: { '': '_TextLayoutStrategy' } });
$J.define(TextLayoutStrategy$AttributedSegment, 'javax.swing.text.TextLayoutStrategy$AttributedSegment', { kind: 'class', ifaces: ['java.text.AttributedCharacterIterator'], sup: 'javax.swing.text.Segment', ctors: { '': '_TextLayoutStrategy$AttributedSegment' }, meths: { 'getRunLimit(java.util.Set)': 'getRunLimit$Set', 'getRunLimit(java.text.AttributedCharacterIterator$Attribute)': 'getRunLimit$Attribute', 'getRunLimit()': 'getRunLimit$', 'getRunStart(java.util.Set)': 'getRunStart$Set', 'getRunStart(java.text.AttributedCharacterIterator$Attribute)': 'getRunStart$Attribute', 'getRunStart()': 'getRunStart$' }, clinit: true, lazy: ['keys'] });
$J.module(() => {
  TextAttribute = $J.load('java.awt.font.TextAttribute');
  JComponent = $J.load('javax.swing.JComponent');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  GlyphPainter2 = $J.load('javax.swing.text.GlyphPainter2');
  GlyphView = $J.load('javax.swing.text.GlyphView');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
