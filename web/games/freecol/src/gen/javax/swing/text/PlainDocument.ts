// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/PlainDocument.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JBoolean, JError, JString, StringBuilder, Vector } from '../../../../jre/index.ts';
import { AbstractDocument } from './AbstractDocument.ts';

let AbstractDocument$ElementEdit, BadLocationException, GapContent, Segment, Utilities;

/**
 * A plain document that maintains no character attributes.  The
 * default element structure for this document is a map of the lines in
 * the text.  The Element returned by getDefaultRootElement is
 * a map of the lines, and each child element represents a line.
 * This model does not maintain any character level attributes,
 * but each line can be tagged with an arbitrary set of attributes.
 * Line to offset, and offset to line translations can be quickly
 * performed using the default root element.  The structure information
 * of the DocumentEvent's fired by edits will indicate the line
 * structure changes.
 * <p>
 * The default content storage management is performed by a
 * gapped buffer implementation (GapContent).  It supports
 * editing reasonably large documents with good efficiency when
 * the edits are contiguous or clustered, as is typical.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author  Timothy Prinzing
 * @see     Document
 * @see     AbstractDocument
 */
export class PlainDocument extends AbstractDocument {
  /**
   * Name of the attribute that specifies the tab
   * size for tabs contained in the content.  The
   * type for the value is Integer.
   */
  static readonly tabSizeAttribute: string = 'tabSize';
  /**
   * Name of the attribute that specifies the maximum
   * length of a line, if there is a maximum length.
   * The type for the value is Integer.
   */
  static readonly lineLimitAttribute: string = 'lineLimit';
  defaultRoot: AbstractDocument$AbstractElement = null;
  added: Vector<Element> = null;
  removed: Vector<Element> = null;
  s: Segment = null;
  $init_PlainDocument() {
    this.added = new Vector();
    this.removed = new Vector();
  }
  /**
   * Constructs a plain text document.  A default model using
   * <code>GapContent</code> is constructed and set.
   */
  _PlainDocument$(): this {
    this._PlainDocument$Content(new GapContent()._GapContent$());
    return this;
  }
  /**
   * Constructs a plain text document.  A default root element is created,
   * and the tab size set to 8.
   *
   * @param c  the container for the content
   */
  _PlainDocument$Content(c: AbstractDocument$Content): this {
    this._AbstractDocument$Content(c);
    this.$init_PlainDocument();
    this.putProperty(PlainDocument.tabSizeAttribute, 8);
    this.defaultRoot = this.createDefaultRoot();
    return this;
  }
  /**
   * Inserts some content into the document.
   * Inserting content causes a write lock to be held while the
   * actual changes are taking place, followed by notification
   * to the observers on the thread that grabbed the write lock.
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   *
   * @param offs the starting offset &gt;= 0
   * @param str the string to insert; does nothing with null/empty strings
   * @param a the attributes for the inserted content
   * @throws BadLocationException  the given insert position is not a valid
   *   position within the document
   * @see Document#insertString
   */
  insertString(offs: number, str: string, a: AttributeSet): void {
    let filterNewlines = this.getProperty('filterNewlines');
    if (($J.isa(filterNewlines, JBoolean)) && $J.equals(filterNewlines, true)) {
      if ((str != null) && (str.indexOf(String.fromCharCode(10 /* \u000a */)) >= 0)) {
        let filtered = new StringBuilder(str);
        let n = filtered.length();
        for (let i = 0; i < n; i++) {
          if (filtered.charAt(i) === 10 /* \u000a */) {
            filtered.setCharAt(i, 32 /* ' ' */);
          }
        }
        str = filtered.toString();
      }
    }
    super.insertString(offs, str, a);
  }
  /**
   * Gets the default root element for the document model.
   *
   * @return the root
   * @see Document#getDefaultRootElement
   */
  getDefaultRootElement(): Element {
    return this.defaultRoot;
  }
  /**
   * Creates the root element to be used to represent the
   * default document structure.
   *
   * @return the element base
   */
  createDefaultRoot(): AbstractDocument$AbstractElement {
    let map = this.createBranchElement$Element$AttributeSet(null, null);
    let line = this.createLeafElement$Element$AttributeSet$int$int(map, null, 0, 1);
    let lines = $J.newArray(1, null);
    lines[0] = line;
    map.replace(0, 0, lines);
    return map;
  }
  /**
   * Get the paragraph element containing the given position.  Since this
   * document only models lines, it returns the line instead.
   */
  getParagraphElement(pos: number): Element {
    let lineMap = this.getDefaultRootElement();
    return lineMap.getElement(lineMap.getElementIndex(pos));
  }
  /**
   * Updates document structure as a result of text insertion.  This
   * will happen within a write lock.  Since this document simply
   * maps out lines, we refresh the line map.
   *
   * @param chng the change event describing the dit
   * @param attr the set of attributes for the inserted text
   */
  insertUpdate$DefaultDocumentEvent$AttributeSet(chng: AbstractDocument$DefaultDocumentEvent, attr: AttributeSet): void {
    this.removed.removeAllElements();
    this.added.removeAllElements();
    let lineMap = this.getDefaultRootElement();
    let offset = chng.getOffset();
    let length = chng.getLength();
    if (offset > 0) {
      offset = (offset - 1) | 0;
      length = (length + 1) | 0;
    }
    let index = lineMap.getElementIndex(offset);
    let rmCandidate = lineMap.getElement(index);
    let rmOffs0 = rmCandidate.getStartOffset();
    let rmOffs1 = rmCandidate.getEndOffset();
    let lastOffset = rmOffs0;
    try {
      if (this.s == null) {
        this.s = new Segment()._Segment$();
      }
      this.getContent().getChars(offset, length, this.s);
      let hasBreaks = false;
      for (let i = 0; i < length; i++) {
        let c = this.s.array[(this.s.offset + i) | 0];
        if (c === 10 /* \u000a */) {
          let breakOffset = (offset + i + 1) | 0;
          this.added.addElement(this.createLeafElement$Element$AttributeSet$int$int(lineMap, null, lastOffset, breakOffset));
          lastOffset = breakOffset;
          hasBreaks = true;
        }
      }
      if (hasBreaks) {
        this.removed.addElement(rmCandidate);
        if ((((offset + length) | 0) === rmOffs1) && (lastOffset !== rmOffs1) && (((index + 1) | 0) < lineMap.getElementCount())) {
          let e = lineMap.getElement((index + 1) | 0);
          this.removed.addElement(e);
          rmOffs1 = e.getEndOffset();
        }
        if (lastOffset < rmOffs1) {
          this.added.addElement(this.createLeafElement$Element$AttributeSet$int$int(lineMap, null, lastOffset, rmOffs1));
        }
        let aelems = $J.newArray(this.added.size(), null);
        this.added.copyInto(aelems);
        let relems = $J.newArray(this.removed.size(), null);
        this.removed.copyInto(relems);
        let ee = new AbstractDocument$ElementEdit()._AbstractDocument$ElementEdit(lineMap, index, relems, aelems);
        chng.addEdit(ee);
        lineMap.replace(index, relems.length, aelems);
      }
      if (Utilities.isComposedTextAttributeDefined(attr)) {
        this.insertComposedTextUpdate(chng, attr);
      }
    } catch ($e0) {
      if ($J.isa($e0, BadLocationException)) {
        let e = $J.exc($e0);
        throw new JError('Internal error: ' + e.toString());
      } else {
        throw $e0;
      }
    }
    super.insertUpdate$DefaultDocumentEvent$AttributeSet(chng, attr);
  }
  /**
   * Updates any document structure as a result of text removal.
   * This will happen within a write lock. Since the structure
   * represents a line map, this just checks to see if the
   * removal spans lines.  If it does, the two lines outside
   * of the removal area are joined together.
   *
   * @param chng the change event describing the edit
   */
  removeUpdate(chng: AbstractDocument$DefaultDocumentEvent): void {
    this.removed.removeAllElements();
    let map = this.getDefaultRootElement();
    let offset = chng.getOffset();
    let length = chng.getLength();
    let line0 = map.getElementIndex(offset);
    let line1 = map.getElementIndex((offset + length) | 0);
    if (line0 !== line1) {
      for (let i = line0; i <= line1; i++) {
        this.removed.addElement(map.getElement(i));
      }
      let p0 = map.getElement(line0).getStartOffset();
      let p1 = map.getElement(line1).getEndOffset();
      let aelems = $J.newArray(1, null);
      aelems[0] = this.createLeafElement$Element$AttributeSet$int$int(map, null, p0, p1);
      let relems = $J.newArray(this.removed.size(), null);
      this.removed.copyInto(relems);
      let ee = new AbstractDocument$ElementEdit()._AbstractDocument$ElementEdit(map, line0, relems, aelems);
      chng.addEdit(ee);
      map.replace(line0, relems.length, aelems);
    } else {
      let line = map.getElement(line0);
      if (!line.isLeaf()) {
        let leaf = line.getElement(line.getElementIndex(offset));
        if (Utilities.isComposedTextElement$Element(leaf)) {
          let aelem = $J.newArray(1, null);
          aelem[0] = this.createLeafElement$Element$AttributeSet$int$int(map, null, line.getStartOffset(), line.getEndOffset());
          let relem = $J.newArray(1, null);
          relem[0] = line;
          let ee = new AbstractDocument$ElementEdit()._AbstractDocument$ElementEdit(map, line0, relem, aelem);
          chng.addEdit(ee);
          map.replace(line0, 1, aelem);
        }
      }
    }
    super.removeUpdate(chng);
  }
  insertComposedTextUpdate(chng: AbstractDocument$DefaultDocumentEvent, attr: AttributeSet): void {
    this.added.removeAllElements();
    let lineMap = this.getDefaultRootElement();
    let offset = chng.getOffset();
    let length = chng.getLength();
    let index = lineMap.getElementIndex(offset);
    let elem = lineMap.getElement(index);
    let elemStart = elem.getStartOffset();
    let elemEnd = elem.getEndOffset();
    let abelem = $J.newArray(1, null);
    abelem[0] = this.createBranchElement$Element$AttributeSet(lineMap, null);
    let relem = $J.newArray(1, null);
    relem[0] = elem;
    if (elemStart !== offset) {
      this.added.addElement(this.createLeafElement$Element$AttributeSet$int$int(abelem[0], null, elemStart, offset));
    }
    this.added.addElement(this.createLeafElement$Element$AttributeSet$int$int(abelem[0], attr, offset, (offset + length) | 0));
    if (elemEnd !== ((offset + length) | 0)) {
      this.added.addElement(this.createLeafElement$Element$AttributeSet$int$int(abelem[0], null, (offset + length) | 0, elemEnd));
    }
    let alelem = $J.newArray(this.added.size(), null);
    this.added.copyInto(alelem);
    let ee = new AbstractDocument$ElementEdit()._AbstractDocument$ElementEdit(lineMap, index, relem, abelem);
    chng.addEdit(ee);
    abelem[0].replace(0, 0, alelem);
    lineMap.replace(index, 1, abelem);
  }
}

$J.define(PlainDocument, 'javax.swing.text.PlainDocument', { kind: 'class', sup: 'javax.swing.text.AbstractDocument', ctors: { 'javax.swing.text.AbstractDocument$Content': '_PlainDocument$Content', '': '_PlainDocument$' }, meths: { 'insertUpdate(javax.swing.text.AbstractDocument$DefaultDocumentEvent,javax.swing.text.AttributeSet)': 'insertUpdate$DefaultDocumentEvent$AttributeSet' } });
$J.module(() => {
  AbstractDocument$ElementEdit = $J.load('javax.swing.text.AbstractDocument$ElementEdit');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  GapContent = $J.load('javax.swing.text.GapContent');
  Segment = $J.load('javax.swing.text.Segment');
  Utilities = $J.load('javax.swing.text.Utilities');
});
