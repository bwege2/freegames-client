// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/DefaultStyledDocument.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, HashMap, JObject, ReferenceQueue, Stack, Vector, WeakReference } from '../../../../jre/index.ts';
import { AbstractDocument } from './AbstractDocument.ts';
import { AbstractDocument$BranchElement } from './AbstractDocument.ts';
import { AbstractUndoableEdit } from '../undo/AbstractUndoableEdit.ts';

let TextAttribute, SwingUtilities, DocumentEvent$EventType, DocumentListener, UndoableEditEvent, AbstractDocument$AbstractElement, AbstractDocument$DefaultDocumentEvent, AbstractDocument$ElementEdit, AbstractDocument$LeafElement, BadLocationException, GapContent, Segment, SimpleAttributeSet, StateInvariantError, Style, StyleConstants, StyleContext, Utilities, SwingUtilities2;

/**
 * A document that can be marked up with character and paragraph
 * styles in a manner similar to the Rich Text Format.  The element
 * structure for this document represents style crossings for
 * style runs.  These style runs are mapped into a paragraph element
 * structure (which may reside in some other structure).  The
 * style runs break at paragraph boundaries since logical styles are
 * assigned to paragraph boundaries.
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
export class DefaultStyledDocument extends AbstractDocument {
  /**
   * The default size of the initial content buffer.
   */
  static readonly BUFFER_SIZE_DEFAULT: number = 4096;
  /**
   * The element buffer.
   */
  buffer: DefaultStyledDocument$ElementBuffer = null;
  /**
   * Styles listening to.
   */
  listeningStyles: Vector<Style> = null;
  /**
   * Listens to Styles.
   */
  styleChangeListener: ChangeListener = null;
  /**
   * Listens to Styles.
   */
  styleContextChangeListener: ChangeListener = null;
  /**
   * Run to create a change event for the document
   */
  updateRunnable: DefaultStyledDocument$ChangeUpdateRunnable = null;
  /**
   * Constructs a styled document.
   *
   * @param c  the container for the content
   * @param styles resources and style definitions which may
   *  be shared across documents
   */
  _DefaultStyledDocument$Content$StyleContext(c: AbstractDocument$Content, styles: StyleContext): this {
    this._AbstractDocument$Content$AttributeContext(c, styles);
    this.listeningStyles = new Vector();
    this.buffer = new DefaultStyledDocument$ElementBuffer().$o(this)._DefaultStyledDocument$ElementBuffer(this.createDefaultRoot$());
    let defaultStyle = styles.getStyle(StyleContext.DEFAULT_STYLE);
    this.setLogicalStyle(0, defaultStyle);
    return this;
  }
  /**
   * Constructs a styled document with the default content
   * storage implementation and a shared set of styles.
   *
   * @param styles the styles
   */
  _DefaultStyledDocument$StyleContext(styles: StyleContext): this {
    this._DefaultStyledDocument$Content$StyleContext(new GapContent()._GapContent$int(DefaultStyledDocument.BUFFER_SIZE_DEFAULT), styles);
    return this;
  }
  /**
   * Constructs a default styled document.  This buffers
   * input content by a size of <em>BUFFER_SIZE_DEFAULT</em>
   * and has a style context that is scoped by the lifetime
   * of the document and is not shared with other documents.
   */
  _DefaultStyledDocument$(): this {
    this._DefaultStyledDocument$Content$StyleContext(new GapContent()._GapContent$int(DefaultStyledDocument.BUFFER_SIZE_DEFAULT), new StyleContext()._StyleContext());
    return this;
  }
  /**
   * Gets the default root element.
   *
   * @return the root
   * @see Document#getDefaultRootElement
   */
  getDefaultRootElement(): Element {
    return this.buffer.getRootElement();
  }
  /**
   * Fetches a named style previously added.
   *
   * @param nm  the name of the style
   * @return the style
   */
  getStyle(nm: string): Style {
    let styles = this.getAttributeContext();
    return styles.getStyle(nm);
  }
  /**
   * Sets the logical style to use for the paragraph at the
   * given position.  If attributes aren't explicitly set
   * for character and paragraph attributes they will resolve
   * through the logical style assigned to the paragraph, which
   * in turn may resolve through some hierarchy completely
   * independent of the element hierarchy in the document.
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   *
   * @param pos the offset from the start of the document &gt;= 0
   * @param s  the logical style to assign to the paragraph, null if none
   */
  setLogicalStyle(pos: number, s: Style): void {
    let paragraph = this.getParagraphElement(pos);
    var abstractElement;
    if ((abstractElement = paragraph) instanceof AbstractDocument$AbstractElement) {
      try {
        this.writeLock();
        let edit = new DefaultStyledDocument$StyleChangeUndoableEdit()._DefaultStyledDocument$StyleChangeUndoableEdit(abstractElement, s);
        abstractElement.setResolveParent(s);
        let p0 = paragraph.getStartOffset();
        let p1 = paragraph.getEndOffset();
        let e = new AbstractDocument$DefaultDocumentEvent().$o(this)._AbstractDocument$DefaultDocumentEvent(p0, (p1 - p0) | 0, DocumentEvent$EventType.CHANGE);
        e.addEdit(edit);
        e.end();
        this.fireChangedUpdate$DocumentEvent(e);
        this.fireUndoableEditUpdate$UndoableEditEvent(new UndoableEditEvent()._UndoableEditEvent(this, e));
      } finally {
        this.writeUnlock();
      }
    }
  }
  /**
   * Sets attributes for some part of the document.
   * A write lock is held by this operation while changes
   * are being made, and a DocumentEvent is sent to the listeners
   * after the change has been successfully completed.
   *
   * <p>
   * {@code offset} and {@code length} define the range of the text
   * over which the attributes are set.
   * If the length is &lt;= 0, then no action is taken  and the method
   * just returns.
   * If the offset is &lt;=0 or &gt; the length of the text then no
   * action is taken, and the method just returns.
   * Otherwise if {@code offset + length} will exceed the length of
   * the  text then the affected range is truncated.
   * </p>
   *
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   *
   * @param offset the offset in the document &gt;= 0
   * @param length the length &gt; 0
   * @param s the attributes
   * @param replace true if the previous attributes should be replaced
   *  before setting the new attributes
   */
  setCharacterAttributes(offset: number, length: number, s: AttributeSet, replace: boolean): void {
    if (length <= 0) {
      return;
    }
    try {
      this.writeLock();
      let changes = new AbstractDocument$DefaultDocumentEvent().$o(this)._AbstractDocument$DefaultDocumentEvent(offset, length, DocumentEvent$EventType.CHANGE);
      this.buffer.change(offset, length, changes);
      let sCopy = s.copyAttributes();
      let lastEnd: number;
      for (let pos = offset; pos < ((offset + length) | 0); pos = lastEnd) {
        let run = this.getCharacterElement(pos);
        lastEnd = run.getEndOffset();
        if (pos === lastEnd) {
          break;
        }
        let attr = run.getAttributes();
        changes.addEdit(new DefaultStyledDocument$AttributeUndoableEdit()._DefaultStyledDocument$AttributeUndoableEdit(run, sCopy, replace));
        if (replace) {
          attr.removeAttributes$AttributeSet(attr);
        }
        attr.addAttributes(s);
      }
      changes.end();
      this.fireChangedUpdate$DocumentEvent(changes);
      this.fireUndoableEditUpdate$UndoableEditEvent(new UndoableEditEvent()._UndoableEditEvent(this, changes));
    } finally {
      this.writeUnlock();
    }
  }
  /**
   * Sets attributes for a paragraph.
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   *
   * @param offset the offset into the paragraph &gt;= 0
   * @param length the number of characters affected &gt;= 0
   * @param s the attributes
   * @param replace whether to replace existing attributes, or merge them
   */
  setParagraphAttributes(offset: number, length: number, s: AttributeSet, replace: boolean): void {
    try {
      this.writeLock();
      let changes = new AbstractDocument$DefaultDocumentEvent().$o(this)._AbstractDocument$DefaultDocumentEvent(offset, length, DocumentEvent$EventType.CHANGE);
      let sCopy = s.copyAttributes();
      let section = this.getDefaultRootElement();
      let index0 = section.getElementIndex(offset);
      let index1 = section.getElementIndex((offset + ((length > 0) ? (length - 1) | 0 : 0)) | 0);
      let isI18N = $J.equals(true, this.getProperty(AbstractDocument.I18NProperty));
      let hasRuns = false;
      for (let i = index0; i <= index1; i++) {
        let paragraph = section.getElement(i);
        let attr = paragraph.getAttributes();
        changes.addEdit(new DefaultStyledDocument$AttributeUndoableEdit()._DefaultStyledDocument$AttributeUndoableEdit(paragraph, sCopy, replace));
        if (replace) {
          attr.removeAttributes$AttributeSet(attr);
        }
        attr.addAttributes(s);
        if (isI18N && !hasRuns) {
          hasRuns = (attr.getAttribute(TextAttribute.RUN_DIRECTION) != null);
        }
      }
      if (hasRuns) {
        this.updateBidi(changes);
      }
      changes.end();
      this.fireChangedUpdate$DocumentEvent(changes);
      this.fireUndoableEditUpdate$UndoableEditEvent(new UndoableEditEvent()._UndoableEditEvent(this, changes));
    } finally {
      this.writeUnlock();
    }
  }
  /**
   * Gets the paragraph element at the offset <code>pos</code>.
   * A paragraph consists of at least one child Element, which is usually
   * a leaf.
   *
   * @param pos the starting offset &gt;= 0
   * @return the element
   */
  getParagraphElement(pos: number): Element {
    let e: Element;
    for (e = this.getDefaultRootElement(); !e.isLeaf(); ) {
      let index = e.getElementIndex(pos);
      e = e.getElement(index);
    }
    if (e != null) {
      return e.getParentElement();
    }
    return e;
  }
  /**
   * Gets a character element based on a position.
   *
   * @param pos the position in the document &gt;= 0
   * @return the element
   */
  getCharacterElement(pos: number): Element {
    let e: Element;
    for (e = this.getDefaultRootElement(); !e.isLeaf(); ) {
      let index = e.getElementIndex(pos);
      e = e.getElement(index);
    }
    return e;
  }
  /**
   * Updates document structure as a result of text insertion.  This
   * will happen within a write lock.  This implementation simply
   * parses the inserted content for line breaks and builds up a set
   * of instructions for the element buffer.
   *
   * @param chng a description of the document change
   * @param attr the attributes
   */
  insertUpdate$DefaultDocumentEvent$AttributeSet(chng: AbstractDocument$DefaultDocumentEvent, attr: AttributeSet): void {
    let offset = chng.getOffset();
    let length = chng.getLength();
    if (attr == null) {
      attr = SimpleAttributeSet.EMPTY;
    }
    let paragraph = this.getParagraphElement((offset + length) | 0);
    let pattr = paragraph.getAttributes();
    let pParagraph = this.getParagraphElement(offset);
    let run = pParagraph.getElement(pParagraph.getElementIndex(offset));
    let endOffset = (offset + length) | 0;
    let insertingAtBoundry = (run.getEndOffset() === endOffset);
    let cattr = run.getAttributes();
    try {
      let s = new Segment()._Segment$();
      let parseBuffer = new Vector();
      let lastStartSpec = null;
      let insertingAfterNewline = false;
      let lastStartDirection = DefaultStyledDocument$ElementSpec.OriginateDirection;
      if (offset > 0) {
        this.getText$int$int$Segment((offset - 1) | 0, 1, s);
        if (s.array[s.offset] === 10 /* \u000a */) {
          insertingAfterNewline = true;
          lastStartDirection = this.createSpecsForInsertAfterNewline(paragraph, pParagraph, pattr, parseBuffer, offset, endOffset);
          for (let counter = (parseBuffer.size() - 1) | 0; counter >= 0; counter--) {
            let spec = parseBuffer.elementAt(counter);
            if (spec.getType() === DefaultStyledDocument$ElementSpec.StartTagType) {
              lastStartSpec = spec;
              break;
            }
          }
        }
      }
      if (!insertingAfterNewline) {
        pattr = pParagraph.getAttributes();
      }
      this.getText$int$int$Segment(offset, length, s);
      let txt = s.array;
      let n = (s.offset + s.count_) | 0;
      let lastOffset = s.offset;
      for (let i = s.offset; i < n; i++) {
        if (txt[i] === 10 /* \u000a */) {
          let breakOffset = (i + 1) | 0;
          parseBuffer.addElement(new DefaultStyledDocument$ElementSpec()._DefaultStyledDocument$ElementSpec$AttributeSet$short$int(attr, DefaultStyledDocument$ElementSpec.ContentType, (breakOffset - lastOffset) | 0));
          parseBuffer.addElement(new DefaultStyledDocument$ElementSpec()._DefaultStyledDocument$ElementSpec$AttributeSet$short(null, DefaultStyledDocument$ElementSpec.EndTagType));
          lastStartSpec = new DefaultStyledDocument$ElementSpec()._DefaultStyledDocument$ElementSpec$AttributeSet$short(pattr, DefaultStyledDocument$ElementSpec.StartTagType);
          parseBuffer.addElement(lastStartSpec);
          lastOffset = breakOffset;
        }
      }
      if (lastOffset < n) {
        parseBuffer.addElement(new DefaultStyledDocument$ElementSpec()._DefaultStyledDocument$ElementSpec$AttributeSet$short$int(attr, DefaultStyledDocument$ElementSpec.ContentType, (n - lastOffset) | 0));
      }
      let first = parseBuffer.firstElement();
      let docLength = this.getLength();
      if (first.getType() === DefaultStyledDocument$ElementSpec.ContentType && cattr.isEqual(attr)) {
        first.setDirection(DefaultStyledDocument$ElementSpec.JoinPreviousDirection);
      }
      if (lastStartSpec != null) {
        if (insertingAfterNewline) {
          lastStartSpec.setDirection(lastStartDirection);
        } else if (pParagraph.getEndOffset() !== endOffset) {
          lastStartSpec.setDirection(DefaultStyledDocument$ElementSpec.JoinFractureDirection);
        } else {
          let parent = pParagraph.getParentElement();
          let pParagraphIndex = parent.getElementIndex(offset);
          if (((pParagraphIndex + 1) | 0) < parent.getElementCount() && !parent.getElement((pParagraphIndex + 1) | 0).isLeaf()) {
            lastStartSpec.setDirection(DefaultStyledDocument$ElementSpec.JoinNextDirection);
          }
        }
      }
      if (insertingAtBoundry && endOffset < docLength) {
        let last = parseBuffer.lastElement();
        if (last.getType() === DefaultStyledDocument$ElementSpec.ContentType && last.getDirection() !== DefaultStyledDocument$ElementSpec.JoinPreviousDirection && ((lastStartSpec == null && (paragraph === pParagraph || insertingAfterNewline)) || (lastStartSpec != null && lastStartSpec.getDirection() !== DefaultStyledDocument$ElementSpec.OriginateDirection))) {
          let nextRun = paragraph.getElement(paragraph.getElementIndex(endOffset));
          if (nextRun.isLeaf() && attr.isEqual(nextRun.getAttributes())) {
            last.setDirection(DefaultStyledDocument$ElementSpec.JoinNextDirection);
          }
        }
      } else if (!insertingAtBoundry && lastStartSpec != null && lastStartSpec.getDirection() === DefaultStyledDocument$ElementSpec.JoinFractureDirection) {
        let last = parseBuffer.lastElement();
        if (last.getType() === DefaultStyledDocument$ElementSpec.ContentType && last.getDirection() !== DefaultStyledDocument$ElementSpec.JoinPreviousDirection && attr.isEqual(cattr)) {
          last.setDirection(DefaultStyledDocument$ElementSpec.JoinNextDirection);
        }
      }
      if (Utilities.isComposedTextAttributeDefined(attr)) {
        let mattr = attr;
        mattr.addAttributes(cattr);
        mattr.addAttribute(AbstractDocument.ElementNameAttribute, AbstractDocument.ContentElementName);
        mattr.addAttribute(StyleConstants.NameAttribute, AbstractDocument.ContentElementName);
        if (mattr.isDefined(SwingUtilities2.IMPLIED_CR)) {
          mattr.removeAttribute(SwingUtilities2.IMPLIED_CR);
        }
      }
      let spec = $J.newArray(parseBuffer.size(), null);
      parseBuffer.copyInto(spec);
      this.buffer.insert(offset, length, spec, chng);
    } catch ($e0) {
      if ($J.isa($e0, BadLocationException)) {
        let bl = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
    super.insertUpdate$DefaultDocumentEvent$AttributeSet(chng, attr);
  }
  /**
   * This is called by insertUpdate when inserting after a new line.
   * It generates, in <code>parseBuffer</code>, ElementSpecs that will
   * position the stack in <code>paragraph</code>.<p>
   * It returns the direction the last StartSpec should have (this don't
   * necessarily create the last start spec).
   */
  createSpecsForInsertAfterNewline(paragraph: Element, pParagraph: Element, pattr: AttributeSet, parseBuffer: Vector<DefaultStyledDocument$ElementSpec>, offset: number, endOffset: number): number {
    if (paragraph.getParentElement() === pParagraph.getParentElement()) {
      let spec = new DefaultStyledDocument$ElementSpec()._DefaultStyledDocument$ElementSpec$AttributeSet$short(pattr, DefaultStyledDocument$ElementSpec.EndTagType);
      parseBuffer.addElement(spec);
      spec = new DefaultStyledDocument$ElementSpec()._DefaultStyledDocument$ElementSpec$AttributeSet$short(pattr, DefaultStyledDocument$ElementSpec.StartTagType);
      parseBuffer.addElement(spec);
      if (pParagraph.getEndOffset() !== endOffset) {
        return DefaultStyledDocument$ElementSpec.JoinFractureDirection;
      }
      let parent = pParagraph.getParentElement();
      if (((parent.getElementIndex(offset) + 1) | 0) < parent.getElementCount()) {
        return DefaultStyledDocument$ElementSpec.JoinNextDirection;
      }
    } else {
      let leftParents = new ArrayList();
      let rightParents = new ArrayList();
      let e = pParagraph;
      while (e != null) {
        leftParents.add(e);
        e = e.getParentElement();
      }
      e = paragraph;
      let leftIndex = -1;
      while (e != null && (leftIndex = leftParents.indexOf(e)) === -1) {
        rightParents.add(e);
        e = e.getParentElement();
      }
      if (e != null) {
        for (let counter = 0; counter < leftIndex; counter++) {
          parseBuffer.addElement(new DefaultStyledDocument$ElementSpec()._DefaultStyledDocument$ElementSpec$AttributeSet$short(null, DefaultStyledDocument$ElementSpec.EndTagType));
        }
        let spec: DefaultStyledDocument$ElementSpec;
        for (let counter = (rightParents.size() - 1) | 0; counter >= 0; counter--) {
          spec = new DefaultStyledDocument$ElementSpec()._DefaultStyledDocument$ElementSpec$AttributeSet$short(rightParents.get(counter).getAttributes(), DefaultStyledDocument$ElementSpec.StartTagType);
          if (counter > 0) {
            spec.setDirection(DefaultStyledDocument$ElementSpec.JoinNextDirection);
          }
          parseBuffer.addElement(spec);
        }
        if (rightParents.size() > 0) {
          return DefaultStyledDocument$ElementSpec.JoinNextDirection;
        }
        return DefaultStyledDocument$ElementSpec.JoinFractureDirection;
      }
    }
    return DefaultStyledDocument$ElementSpec.OriginateDirection;
  }
  /**
   * Updates document structure as a result of text removal.
   *
   * @param chng a description of the document change
   */
  removeUpdate(chng: AbstractDocument$DefaultDocumentEvent): void {
    super.removeUpdate(chng);
    this.buffer.remove(chng.getOffset(), chng.getLength(), chng);
  }
  /**
   * Creates the root element to be used to represent the
   * default document structure.
   *
   * @return the element base
   */
  createDefaultRoot$(): AbstractDocument$AbstractElement {
    this.writeLock();
    let section = new DefaultStyledDocument$SectionElement().$o(this)._DefaultStyledDocument$SectionElement();
    let paragraph = new AbstractDocument$BranchElement().$o(this)._AbstractDocument$BranchElement(section, null);
    let brk = new AbstractDocument$LeafElement().$o(this)._AbstractDocument$LeafElement(paragraph, null, 0, 1);
    let buff = $J.newArray(1, null);
    buff[0] = brk;
    paragraph.replace(0, 0, buff);
    buff[0] = paragraph;
    section.replace(0, 0, buff);
    this.writeUnlock();
    return section;
  }
  /**
   * Gets the foreground color from an attribute set.
   *
   * @param attr the attribute set
   * @return the color
   */
  getForeground(attr: AttributeSet): Color {
    let styles = this.getAttributeContext();
    return styles.getForeground$AttributeSet(attr);
  }
  /**
   * Gets the background color from an attribute set.
   *
   * @param attr the attribute set
   * @return the color
   */
  getBackground(attr: AttributeSet): Color {
    let styles = this.getAttributeContext();
    return styles.getBackground$AttributeSet(attr);
  }
  /**
   * Gets the font from an attribute set.
   *
   * @param attr the attribute set
   * @return the font
   */
  getFont(attr: AttributeSet): Font {
    let styles = this.getAttributeContext();
    return styles.getFont$AttributeSet(attr);
  }
  /**
   * Called when any of this document's styles have changed.
   * Subclasses may wish to be intelligent about what gets damaged.
   *
   * @param style The Style that has changed.
   */
  styleChanged(style: Style): void {
    if (this.getLength() !== 0) {
      if (this.updateRunnable == null) {
        this.updateRunnable = new DefaultStyledDocument$ChangeUpdateRunnable().$o(this)._DefaultStyledDocument$ChangeUpdateRunnable();
      }
      {
        if (!this.updateRunnable.isPending) {
          SwingUtilities.invokeLater($J.fn(this.updateRunnable, 'run'));
          this.updateRunnable.isPending = true;
        }
      }
    }
  }
  /**
   * Adds a document listener for notification of any changes.
   *
   * @param listener the listener
   * @see Document#addDocumentListener
   */
  addDocumentListener(listener: DocumentListener): void {
    {
      let oldDLCount = this.listenerList.getListenerCount$Class($J.cls(DocumentListener));
      super.addDocumentListener(listener);
      if (oldDLCount === 0) {
        if (this.styleContextChangeListener == null) {
          this.styleContextChangeListener = this.createStyleContextChangeListener();
        }
        if (this.styleContextChangeListener != null) {
          let styles = this.getAttributeContext();
          let staleListeners = DefaultStyledDocument$AbstractChangeHandler.getStaleListeners(this.styleContextChangeListener);
          for (const $it1 = staleListeners.iterator(); $it1.hasNext(); ) {
            let l = $it1.next();
            styles.removeChangeListener(l);
          }
          styles.addChangeListener(this.styleContextChangeListener);
        }
        this.updateStylesListeningTo();
      }
    }
  }
  /**
   * Removes a document listener.
   *
   * @param listener the listener
   * @see Document#removeDocumentListener
   */
  removeDocumentListener(listener: DocumentListener): void {
    {
      super.removeDocumentListener(listener);
      if (this.listenerList.getListenerCount$Class($J.cls(DocumentListener)) === 0) {
        for (let counter = (this.listeningStyles.size() - 1) | 0; counter >= 0; counter--) {
          this.listeningStyles.elementAt(counter).removeChangeListener(this.styleChangeListener);
        }
        this.listeningStyles.removeAllElements();
        if (this.styleContextChangeListener != null) {
          let styles = this.getAttributeContext();
          styles.removeChangeListener(this.styleContextChangeListener);
        }
      }
    }
  }
  /**
   * Returns a new instance of StyleChangeHandler.
   */
  createStyleChangeListener(): ChangeListener {
    return $J.fn(new DefaultStyledDocument$StyleChangeHandler()._DefaultStyledDocument$StyleChangeHandler(this), 'stateChanged');
  }
  /**
   * Returns a new instance of StyleContextChangeHandler.
   */
  createStyleContextChangeListener(): ChangeListener {
    return $J.fn(new DefaultStyledDocument$StyleContextChangeHandler()._DefaultStyledDocument$StyleContextChangeHandler(this), 'stateChanged');
  }
  /**
   * Adds a ChangeListener to new styles, and removes ChangeListener from
   * old styles.
   */
  updateStylesListeningTo(): void {
    {
      let styles = this.getAttributeContext();
      if (this.styleChangeListener == null) {
        this.styleChangeListener = this.createStyleChangeListener();
      }
      if (this.styleChangeListener != null && styles != null) {
        let styleNames = styles.getStyleNames();
        let v = this.listeningStyles.clone();
        this.listeningStyles.removeAllElements();
        let staleListeners = DefaultStyledDocument$AbstractChangeHandler.getStaleListeners(this.styleChangeListener);
        while (styleNames.hasMoreElements()) {
          let name = styleNames.nextElement();
          let aStyle = styles.getStyle(name);
          let index = v.indexOf(aStyle);
          this.listeningStyles.addElement(aStyle);
          if (index === -1) {
            for (const $it2 = staleListeners.iterator(); $it2.hasNext(); ) {
              let l = $it2.next();
              aStyle.removeChangeListener(l);
            }
            aStyle.addChangeListener(this.styleChangeListener);
          } else {
            v.removeElementAt(index);
          }
        }
        for (let counter = (v.size() - 1) | 0; counter >= 0; counter--) {
          let aStyle = v.elementAt(counter);
          aStyle.removeChangeListener(this.styleChangeListener);
        }
        if (this.listeningStyles.size() === 0) {
          this.styleChangeListener = null;
        }
      }
    }
  }
}

/**
 * Default root element for a document... maps out the
 * paragraphs/lines contained.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class DefaultStyledDocument$SectionElement extends AbstractDocument$BranchElement {
  /**
   * Creates a new SectionElement.
   */
  _DefaultStyledDocument$SectionElement(): this {
    this._AbstractDocument$BranchElement(null, null);
    return this;
  }
  /**
   * Gets the name of the element.
   *
   * @return the name
   */
  getName(): string {
    return AbstractDocument.SectionElementName;
  }
}

/**
 * Specification for building elements.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class DefaultStyledDocument$ElementSpec extends JObject {
  /**
   * A possible value for getType.  This specifies
   * that this record type is a start tag and
   * represents markup that specifies the start
   * of an element.
   */
  static readonly StartTagType: number = 1;
  /**
   * A possible value for getType.  This specifies
   * that this record type is a end tag and
   * represents markup that specifies the end
   * of an element.
   */
  static readonly EndTagType: number = 2;
  /**
   * A possible value for getType.  This specifies
   * that this record type represents content.
   */
  static readonly ContentType: number = 3;
  /**
   * A possible value for getDirection.  This specifies
   * that the data associated with this record should
   * be joined to what precedes it.
   */
  static readonly JoinPreviousDirection: number = 4;
  /**
   * A possible value for getDirection.  This specifies
   * that the data associated with this record should
   * be joined to what follows it.
   */
  static readonly JoinNextDirection: number = 5;
  /**
   * A possible value for getDirection.  This specifies
   * that the data associated with this record should
   * be used to originate a new element.  This would be
   * the normal value.
   */
  static readonly OriginateDirection: number = 6;
  /**
   * A possible value for getDirection.  This specifies
   * that the data associated with this record should
   * be joined to the fractured element.
   */
  static readonly JoinFractureDirection: number = 7;
  attr: AttributeSet = null;
  len: number = 0;
  type: number = 0;
  direction: number = 0;
  offs: number = 0;
  data: number[] = null;
  /**
   * Constructor useful for markup when the markup will not
   * be stored in the document.
   *
   * @param a the attributes for the element
   * @param type the type of the element (StartTagType, EndTagType,
   *  ContentType)
   */
  _DefaultStyledDocument$ElementSpec$AttributeSet$short(a: AttributeSet, type$: number): this {
    this._DefaultStyledDocument$ElementSpec$AttributeSet$short$charArr$int$int(a, type$, null, 0, 0);
    return this;
  }
  /**
   * Constructor for parsing inside the document when
   * the data has already been added, but len information
   * is needed.
   *
   * @param a the attributes for the element
   * @param type the type of the element (StartTagType, EndTagType,
   *  ContentType)
   * @param len the length &gt;= 0
   */
  _DefaultStyledDocument$ElementSpec$AttributeSet$short$int(a: AttributeSet, type$: number, len: number): this {
    this._DefaultStyledDocument$ElementSpec$AttributeSet$short$charArr$int$int(a, type$, null, 0, len);
    return this;
  }
  /**
   * Constructor for creating a spec externally for batch
   * input of content and markup into the document.
   *
   * @param a the attributes for the element
   * @param type the type of the element (StartTagType, EndTagType,
   *  ContentType)
   * @param txt the text for the element
   * @param offs the offset into the text &gt;= 0
   * @param len the length of the text &gt;= 0
   */
  _DefaultStyledDocument$ElementSpec$AttributeSet$short$charArr$int$int(a: AttributeSet, type$: number, txt: number[], offs: number, len: number): this {
    this.attr = a;
    this.type = type$;
    this.data = txt == null ? null : Arrays.copyOf(txt, txt.length);
    this.offs = offs;
    this.len = len;
    this.direction = DefaultStyledDocument$ElementSpec.OriginateDirection;
    return this;
  }
  /**
   * Gets the element type.
   *
   * @return  the type of the element (StartTagType, EndTagType,
   *  ContentType)
   */
  getType(): number {
    return this.type;
  }
  /**
   * Sets the direction.
   *
   * @param direction the direction (JoinPreviousDirection,
   *   JoinNextDirection)
   */
  setDirection(direction: number): void {
    this.direction = direction;
  }
  /**
   * Gets the direction.
   *
   * @return the direction (JoinPreviousDirection, JoinNextDirection)
   */
  getDirection(): number {
    return this.direction;
  }
  /**
   * Gets the element attributes.
   *
   * @return the attribute set
   */
  getAttributes(): AttributeSet {
    return this.attr;
  }
  /**
   * Gets the length.
   *
   * @return the length &gt;= 0
   */
  getLength(): number {
    return this.len;
  }
  /**
   * Converts the element to a string.
   *
   * @return the string
   */
  toString(): string {
    let tlbl = '??';
    let plbl = '??';
    switch (this.type) {
      case DefaultStyledDocument$ElementSpec.StartTagType:
        tlbl = 'StartTag';
        break;
      case DefaultStyledDocument$ElementSpec.ContentType:
        tlbl = 'Content';
        break;
      case DefaultStyledDocument$ElementSpec.EndTagType:
        tlbl = 'EndTag';
        break;
    }
    switch (this.direction) {
      case DefaultStyledDocument$ElementSpec.JoinPreviousDirection:
        plbl = 'JoinPrevious';
        break;
      case DefaultStyledDocument$ElementSpec.JoinNextDirection:
        plbl = 'JoinNext';
        break;
      case DefaultStyledDocument$ElementSpec.OriginateDirection:
        plbl = 'Originate';
        break;
      case DefaultStyledDocument$ElementSpec.JoinFractureDirection:
        plbl = 'Fracture';
        break;
    }
    return tlbl + ':' + plbl + ':' + this.getLength();
  }
}

/**
 * Class to manage changes to the element
 * hierarchy.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class DefaultStyledDocument$ElementBuffer extends JObject {
  root: Element = null;
  pos: number = 0;
  offset: number = 0;
  length_: number = 0;
  endOffset: number = 0;
  changes: Vector<DefaultStyledDocument$ElementBuffer$ElemChanges> = null;
  path: Stack<DefaultStyledDocument$ElementBuffer$ElemChanges> = null;
  insertOp: boolean = false;
  recreateLeafs: boolean = false;
  /**
   * For insert, path to inserted elements.
   */
  insertPath: DefaultStyledDocument$ElementBuffer$ElemChanges[] = null;
  /**
   * Only for insert, set to true when the fracture has been created.
   */
  createdFracture: boolean = false;
  /**
   * Parent that contains the fractured child.
   */
  fracturedParent: Element = null;
  /**
   * Fractured child.
   */
  fracturedChild: Element = null;
  /**
   * Used to indicate when fracturing that the last leaf should be
   * skipped.
   */
  offsetLastIndex: boolean = false;
  /**
   * Used to indicate that the parent of the deepest leaf should
   * offset the index by 1 when adding/removing elements in an
   * insert.
   */
  offsetLastIndexOnReplace: boolean = false;
  /**
   * Creates a new ElementBuffer.
   *
   * @param root the root element
   * @since 1.4
   */
  _DefaultStyledDocument$ElementBuffer(root: Element): this {
    this.root = root;
    this.changes = new Vector();
    this.path = new Stack();
    return this;
  }
  /**
   * Gets the root element.
   *
   * @return the root element
   */
  getRootElement(): Element {
    return this.root;
  }
  /**
   * Inserts new content.
   *
   * @param offset the starting offset &gt;= 0
   * @param length the length &gt;= 0
   * @param data the data to insert
   * @param de the event capturing this edit
   */
  insert(offset: number, length: number, data: DefaultStyledDocument$ElementSpec[], de: AbstractDocument$DefaultDocumentEvent): void {
    if (length === 0) {
      return;
    }
    this.insertOp = true;
    this.beginEdits(offset, length);
    this.insertUpdate(data);
    this.endEdits(de);
    this.insertOp = false;
  }
  /**
   * Removes content.
   *
   * @param offset the starting offset &gt;= 0
   * @param length the length &gt;= 0
   * @param de the event capturing this edit
   */
  remove(offset: number, length: number, de: AbstractDocument$DefaultDocumentEvent): void {
    this.beginEdits(offset, length);
    this.removeUpdate();
    this.endEdits(de);
  }
  /**
   * Changes content.
   *
   * @param offset the starting offset &gt;= 0
   * @param length the length &gt;= 0
   * @param de the event capturing this edit
   */
  change(offset: number, length: number, de: AbstractDocument$DefaultDocumentEvent): void {
    this.beginEdits(offset, length);
    this.changeUpdate();
    this.endEdits(de);
  }
  /**
   * Inserts an update into the document.
   *
   * @param data the elements to insert
   */
  insertUpdate(data: DefaultStyledDocument$ElementSpec[]): void {
    let elem = this.root;
    let index = elem.getElementIndex(this.offset);
    while (!elem.isLeaf()) {
      let child = elem.getElement(index);
      this.push$Element$int(elem, (child.isLeaf() ? index : (index + 1) | 0));
      elem = child;
      index = elem.getElementIndex(this.offset);
    }
    this.insertPath = $J.newArray(this.path.size(), null);
    this.path.copyInto(this.insertPath);
    this.createdFracture = false;
    let i: number;
    this.recreateLeafs = false;
    if (data[0].getType() === DefaultStyledDocument$ElementSpec.ContentType) {
      this.insertFirstContent(data);
      this.pos = (this.pos + data[0].getLength()) | 0;
      i = 1;
    } else {
      this.fractureDeepestLeaf(data);
      i = 0;
    }
    let n = data.length;
    for (; i < n; i++) {
      this.insertElement(data[i]);
    }
    if (!this.createdFracture) {
      this.fracture(-1);
    }
    while (this.path.size() !== 0) {
      this.pop();
    }
    if (this.offsetLastIndex && this.offsetLastIndexOnReplace) {
      (this.insertPath[(this.insertPath.length - 1) | 0]).index_++;
    }
    for (let counter = (this.insertPath.length - 1) | 0; counter >= 0; counter--) {
      let change = this.insertPath[counter];
      if (change.parent === this.fracturedParent) {
        change.added.addElement(this.fracturedChild);
      }
      if ((change.added.size() > 0 || change.removed.size() > 0) && !this.changes.contains(change)) {
        this.changes.addElement(change);
      }
    }
    if (this.offset === 0 && this.fracturedParent != null && data[0].getType() === DefaultStyledDocument$ElementSpec.EndTagType) {
      let counter = 0;
      while (counter < data.length && data[counter].getType() === DefaultStyledDocument$ElementSpec.EndTagType) {
        counter++;
      }
      let change = this.insertPath[(this.insertPath.length - counter - 1) | 0];
      change.removed.insertElementAt(change.parent.getElement(--change.index_), 0);
    }
  }
  /**
   * Updates the element structure in response to a removal from the
   * associated sequence in the document.  Any elements consumed by the
   * span of the removal are removed.
   */
  removeUpdate(): void {
    this.removeElements(this.root, this.offset, (this.offset + this.length_) | 0);
  }
  /**
   * Updates the element structure in response to a change in the
   * document.
   */
  changeUpdate(): void {
    let didEnd = this.split(this.offset, this.length_);
    if (!didEnd) {
      while (this.path.size() !== 0) {
        this.pop();
      }
      this.split((this.offset + this.length_) | 0, 0);
    }
    while (this.path.size() !== 0) {
      this.pop();
    }
  }
  split(offs: number, len: number): boolean {
    let splitEnd = false;
    let e = this.root;
    let index = e.getElementIndex(offs);
    while (!e.isLeaf()) {
      this.push$Element$int(e, index);
      e = e.getElement(index);
      index = e.getElementIndex(offs);
    }
    let ec = this.path.peek();
    let child = ec.parent.getElement(ec.index_);
    if (child.getStartOffset() < offs && offs < child.getEndOffset()) {
      let index0 = ec.index_;
      let index1 = index0;
      if ((((offs + len) | 0) < ec.parent.getEndOffset()) && (len !== 0)) {
        index1 = ec.parent.getElementIndex((offs + len) | 0);
        if (index1 === index0) {
          ec.removed.addElement(child);
          e = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, child.getAttributes(), child.getStartOffset(), offs);
          ec.added.addElement(e);
          e = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, child.getAttributes(), offs, (offs + len) | 0);
          ec.added.addElement(e);
          e = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, child.getAttributes(), (offs + len) | 0, child.getEndOffset());
          ec.added.addElement(e);
          return true;
        } else {
          child = ec.parent.getElement(index1);
          if (((offs + len) | 0) === child.getStartOffset()) {
            index1 = index0;
          }
        }
        splitEnd = true;
      }
      this.pos = offs;
      child = ec.parent.getElement(index0);
      ec.removed.addElement(child);
      e = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, child.getAttributes(), child.getStartOffset(), this.pos);
      ec.added.addElement(e);
      e = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, child.getAttributes(), this.pos, child.getEndOffset());
      ec.added.addElement(e);
      for (let i = (index0 + 1) | 0; i < index1; i++) {
        child = ec.parent.getElement(i);
        ec.removed.addElement(child);
        ec.added.addElement(child);
      }
      if (index1 !== index0) {
        child = ec.parent.getElement(index1);
        this.pos = (offs + len) | 0;
        ec.removed.addElement(child);
        e = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, child.getAttributes(), child.getStartOffset(), this.pos);
        ec.added.addElement(e);
        e = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, child.getAttributes(), this.pos, child.getEndOffset());
        ec.added.addElement(e);
      }
    }
    return splitEnd;
  }
  /**
   * Creates the UndoableEdit record for the edits made
   * in the buffer.
   */
  endEdits(de: AbstractDocument$DefaultDocumentEvent): void {
    let n = this.changes.size();
    for (let i = 0; i < n; i++) {
      let ec = this.changes.elementAt(i);
      let removed = $J.newArray(ec.removed.size(), null);
      ec.removed.copyInto(removed);
      let added = $J.newArray(ec.added.size(), null);
      ec.added.copyInto(added);
      let index = ec.index_;
      (ec.parent).replace(index, removed.length, added);
      let ee = new AbstractDocument$ElementEdit()._AbstractDocument$ElementEdit(ec.parent, index, removed, added);
      de.addEdit(ee);
    }
    this.changes.removeAllElements();
    this.path.removeAllElements();
  }
  /**
   * Initialize the buffer
   */
  beginEdits(offset: number, length: number): void {
    this.offset = offset;
    this.length_ = length;
    this.endOffset = (offset + length) | 0;
    this.pos = offset;
    if (this.changes == null) {
      this.changes = new Vector();
    } else {
      this.changes.removeAllElements();
    }
    if (this.path == null) {
      this.path = new Stack();
    } else {
      this.path.removeAllElements();
    }
    this.fracturedParent = null;
    this.fracturedChild = null;
    this.offsetLastIndex = this.offsetLastIndexOnReplace = false;
  }
  /**
   * Pushes a new element onto the stack that represents
   * the current path.
   * @param isFracture true if pushing on an element that was created
   * as the result of a fracture.
   */
  push$Element$int$boolean(e: Element, index: number, isFracture: boolean): void {
    let ec = new DefaultStyledDocument$ElementBuffer$ElemChanges().$o(this)._DefaultStyledDocument$ElementBuffer$ElemChanges(e, index, isFracture);
    this.path.push(ec);
  }
  push$Element$int(e: Element, index: number): void {
    this.push$Element$int$boolean(e, index, false);
  }
  pop(): void {
    let ec = this.path.peek();
    this.path.pop();
    if ((ec.added.size() > 0) || (ec.removed.size() > 0)) {
      this.changes.addElement(ec);
    } else if (!this.path.isEmpty()) {
      let e = ec.parent;
      if (e.getElementCount() === 0) {
        ec = this.path.peek();
        ec.added.removeElement(e);
      }
    }
  }
  insertElement(es: DefaultStyledDocument$ElementSpec): void {
    let ec = this.path.peek();
    {
      let len: number;
      switch (es.getType()) {
        case DefaultStyledDocument$ElementSpec.StartTagType:
          {
            let parent: Element, belem: Element;
            switch (es.getDirection()) {
              case DefaultStyledDocument$ElementSpec.JoinNextDirection:
                parent = ec.parent.getElement(ec.index_);
                if (parent.isLeaf()) {
                  if (((ec.index_ + 1) | 0) < ec.parent.getElementCount()) {
                    parent = ec.parent.getElement((ec.index_ + 1) | 0);
                  } else {
                    throw new StateInvariantError()._StateInvariantError('Join next to leaf');
                  }
                }
                this.push$Element$int$boolean(parent, 0, true);
                break;
              case DefaultStyledDocument$ElementSpec.JoinFractureDirection:
                if (!this.createdFracture) {
                  this.fracture((this.path.size() - 1) | 0);
                }
                if (!ec.isFracture) {
                  this.push$Element$int$boolean(this.fracturedChild, 0, true);
                } else {
                  this.push$Element$int$boolean(ec.parent.getElement(0), 0, true);
                }
                break;
              default:
                belem = this.$outer.createBranchElement$Element$AttributeSet(ec.parent, es.getAttributes());
                ec.added.addElement(belem);
                this.push$Element$int(belem, 0);
                break;
            }
          }
          break;
        case DefaultStyledDocument$ElementSpec.EndTagType:
          this.pop();
          break;
        case DefaultStyledDocument$ElementSpec.ContentType:
          len = es.getLength();
          if (es.getDirection() !== DefaultStyledDocument$ElementSpec.JoinNextDirection) {
            let leaf = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, es.getAttributes(), this.pos, (this.pos + len) | 0);
            ec.added.addElement(leaf);
          } else {
            if (!ec.isFracture) {
              let first = null;
              if (this.insertPath != null) {
                for (let counter = (this.insertPath.length - 1) | 0; counter >= 0; counter--) {
                  if (this.insertPath[counter] === ec) {
                    if (counter !== ((this.insertPath.length - 1) | 0)) {
                      first = ec.parent.getElement(ec.index_);
                    }
                    break;
                  }
                }
              }
              if (first == null) {
                first = ec.parent.getElement((ec.index_ + 1) | 0);
              }
              let leaf = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, first.getAttributes(), this.pos, first.getEndOffset());
              ec.added.addElement(leaf);
              ec.removed.addElement(first);
            } else {
              let first = ec.parent.getElement(0);
              let leaf = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, first.getAttributes(), this.pos, first.getEndOffset());
              ec.added.addElement(leaf);
              ec.removed.addElement(first);
            }
          }
          this.pos = (this.pos + len) | 0;
          break;
      }
    }
  }
  /**
   * Remove the elements from <code>elem</code> in range
   * <code>rmOffs0</code>, <code>rmOffs1</code>. This uses
   * <code>canJoin</code> and <code>join</code> to handle joining
   * the endpoints of the insertion.
   *
   * @return true if elem will no longer have any elements.
   */
  removeElements(elem: Element, rmOffs0: number, rmOffs1: number): boolean {
    if (!elem.isLeaf()) {
      let index0 = elem.getElementIndex(rmOffs0);
      let index1 = elem.getElementIndex(rmOffs1);
      this.push$Element$int(elem, index0);
      let ec = this.path.peek();
      if (index0 === index1) {
        let child0 = elem.getElement(index0);
        if (rmOffs0 <= child0.getStartOffset() && rmOffs1 >= child0.getEndOffset()) {
          ec.removed.addElement(child0);
        } else if (this.removeElements(child0, rmOffs0, rmOffs1)) {
          ec.removed.addElement(child0);
        }
      } else {
        let child0 = elem.getElement(index0);
        let child1 = elem.getElement(index1);
        let containsOffs1 = (rmOffs1 < elem.getEndOffset());
        if (containsOffs1 && this.canJoin(child0, child1)) {
          for (let i = index0; i <= index1; i++) {
            ec.removed.addElement(elem.getElement(i));
          }
          let e = this.join(elem, child0, child1, rmOffs0, rmOffs1);
          ec.added.addElement(e);
        } else {
          let rmIndex0 = (index0 + 1) | 0;
          let rmIndex1 = (index1 - 1) | 0;
          if (child0.getStartOffset() === rmOffs0 || (index0 === 0 && child0.getStartOffset() > rmOffs0 && child0.getEndOffset() <= rmOffs1)) {
            child0 = null;
            rmIndex0 = index0;
          }
          if (!containsOffs1) {
            child1 = null;
            rmIndex1++;
          } else if (child1.getStartOffset() === rmOffs1) {
            child1 = null;
          }
          if (rmIndex0 <= rmIndex1) {
            ec.index_ = rmIndex0;
          }
          for (let i = rmIndex0; i <= rmIndex1; i++) {
            ec.removed.addElement(elem.getElement(i));
          }
          if (child0 != null) {
            if (this.removeElements(child0, rmOffs0, rmOffs1)) {
              ec.removed.insertElementAt(child0, 0);
              ec.index_ = index0;
            }
          }
          if (child1 != null) {
            if (this.removeElements(child1, rmOffs0, rmOffs1)) {
              ec.removed.addElement(child1);
            }
          }
        }
      }
      this.pop();
      if (elem.getElementCount() === ((ec.removed.size() - ec.added.size()) | 0)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Can the two given elements be coelesced together
   * into one element?
   */
  canJoin(e0: Element, e1: Element): boolean {
    if ((e0 == null) || (e1 == null)) {
      return false;
    }
    let leaf0 = e0.isLeaf();
    let leaf1 = e1.isLeaf();
    if (leaf0 !== leaf1) {
      return false;
    }
    if (leaf0) {
      return e0.getAttributes().isEqual(e1.getAttributes());
    }
    let name0 = e0.getName();
    let name1 = e1.getName();
    if (name0 != null) {
      return $J.equals(name0, name1);
    }
    if (name1 != null) {
      return $J.equals(name1, name0);
    }
    return true;
  }
  /**
   * Joins the two elements carving out a hole for the
   * given removed range.
   */
  join(p: Element, left: Element, right: Element, rmOffs0: number, rmOffs1: number): Element {
    if (left.isLeaf() && right.isLeaf()) {
      return this.$outer.createLeafElement$Element$AttributeSet$int$int(p, left.getAttributes(), left.getStartOffset(), right.getEndOffset());
    } else if ((!left.isLeaf()) && (!right.isLeaf())) {
      let to = this.$outer.createBranchElement$Element$AttributeSet(p, left.getAttributes());
      let ljIndex = left.getElementIndex(rmOffs0);
      let rjIndex = right.getElementIndex(rmOffs1);
      let lj = left.getElement(ljIndex);
      if (lj.getStartOffset() >= rmOffs0) {
        lj = null;
      }
      let rj = right.getElement(rjIndex);
      if (rj.getStartOffset() === rmOffs1) {
        rj = null;
      }
      let children = new ArrayList();
      for (let i = 0; i < ljIndex; i++) {
        children.add(this.clone$Element$Element(to, left.getElement(i)));
      }
      if (this.canJoin(lj, rj)) {
        let e = this.join(to, lj, rj, rmOffs0, rmOffs1);
        children.add(e);
      } else {
        if (lj != null) {
          children.add(this.cloneAsNecessary(to, lj, rmOffs0, rmOffs1));
        }
        if (rj != null) {
          children.add(this.cloneAsNecessary(to, rj, rmOffs0, rmOffs1));
        }
      }
      let n = right.getElementCount();
      for (let i = (rj == null) ? rjIndex : (rjIndex + 1) | 0; i < n; i++) {
        children.add(this.clone$Element$Element(to, right.getElement(i)));
      }
      let c = $J.toArrayInto(children.toArray(), $J.newArray(0, null));
      (to).replace(0, 0, c);
      return to;
    } else {
      throw new StateInvariantError()._StateInvariantError('No support to join leaf element with non-leaf element');
    }
  }
  /**
   * Creates a copy of this element, with a different
   * parent.
   *
   * @param parent the parent element
   * @param clonee the element to be cloned
   * @return the copy
   */
  clone$Element$Element(parent: Element, clonee: Element): Element {
    if (clonee.isLeaf()) {
      return this.$outer.createLeafElement$Element$AttributeSet$int$int(parent, clonee.getAttributes(), clonee.getStartOffset(), clonee.getEndOffset());
    }
    let e = this.$outer.createBranchElement$Element$AttributeSet(parent, clonee.getAttributes());
    let n = clonee.getElementCount();
    let children = $J.newArray(n, null);
    for (let i = 0; i < n; i++) {
      children[i] = this.clone$Element$Element(e, clonee.getElement(i));
    }
    (e).replace(0, 0, children);
    return e;
  }
  /**
   * Creates a copy of this element, with a different
   * parent. Children of this element included in the
   * removal range will be discarded.
   */
  cloneAsNecessary(parent: Element, clonee: Element, rmOffs0: number, rmOffs1: number): Element {
    if (clonee.isLeaf()) {
      return this.$outer.createLeafElement$Element$AttributeSet$int$int(parent, clonee.getAttributes(), clonee.getStartOffset(), clonee.getEndOffset());
    }
    let e = this.$outer.createBranchElement$Element$AttributeSet(parent, clonee.getAttributes());
    let n = clonee.getElementCount();
    let childrenList = new ArrayList(n);
    for (let i = 0; i < n; i++) {
      let elem = clonee.getElement(i);
      if (elem.getStartOffset() < rmOffs0 || elem.getEndOffset() > rmOffs1) {
        childrenList.add(this.cloneAsNecessary(e, elem, rmOffs0, rmOffs1));
      }
    }
    let children = $J.newArray(childrenList.size(), null);
    children = $J.toArrayInto(childrenList.toArray(), children);
    (e).replace(0, 0, children);
    return e;
  }
  /**
   * Determines if a fracture needs to be performed. A fracture
   * can be thought of as moving the right part of a tree to a
   * new location, where the right part is determined by what has
   * been inserted. <code>depth</code> is used to indicate a
   * JoinToFracture is needed to an element at a depth
   * of <code>depth</code>. Where the root is 0, 1 is the children
   * of the root...
   * <p>This will invoke <code>fractureFrom</code> if it is determined
   * a fracture needs to happen.
   */
  fracture(depth: number): void {
    let cLength = this.insertPath.length;
    let lastIndex = -1;
    let needRecreate = this.recreateLeafs;
    let lastChange = this.insertPath[(cLength - 1) | 0];
    let childAltered = (((lastChange.index_ + 1) | 0) < lastChange.parent.getElementCount());
    let deepestAlteredIndex = (needRecreate) ? cLength : -1;
    let lastAlteredIndex = (cLength - 1) | 0;
    this.createdFracture = true;
    for (let counter = (cLength - 2) | 0; counter >= 0; counter--) {
      let change = this.insertPath[counter];
      if (change.added.size() > 0 || counter === depth) {
        lastIndex = counter;
        if (!needRecreate && childAltered) {
          needRecreate = true;
          if (deepestAlteredIndex === -1) {
            deepestAlteredIndex = (lastAlteredIndex + 1) | 0;
          }
        }
      }
      if (!childAltered && change.index_ < change.parent.getElementCount()) {
        childAltered = true;
        lastAlteredIndex = counter;
      }
    }
    if (needRecreate) {
      if (lastIndex === -1) {
        lastIndex = (cLength - 1) | 0;
      }
      this.fractureFrom(this.insertPath, lastIndex, deepestAlteredIndex);
    }
  }
  /**
   * Recreates the elements to the right of the insertion point.
   * This starts at <code>startIndex</code> in <code>changed</code>,
   * and calls duplicate to duplicate existing elements.
   * This will also duplicate the elements along the insertion
   * point, until a depth of <code>endFractureIndex</code> is
   * reached, at which point only the elements to the right of
   * the insertion point are duplicated.
   */
  fractureFrom(changed: DefaultStyledDocument$ElementBuffer$ElemChanges[], startIndex: number, endFractureIndex: number): void {
    let change = changed[startIndex];
    let child: Element;
    let newChild: Element;
    let changeLength = changed.length;
    if (((startIndex + 1) | 0) === changeLength) {
      child = change.parent.getElement(change.index_);
    } else {
      child = change.parent.getElement((change.index_ - 1) | 0);
    }
    if (child.isLeaf()) {
      newChild = this.$outer.createLeafElement$Element$AttributeSet$int$int(change.parent, child.getAttributes(), Math.max(this.endOffset, child.getStartOffset()), child.getEndOffset());
    } else {
      newChild = this.$outer.createBranchElement$Element$AttributeSet(change.parent, child.getAttributes());
    }
    this.fracturedParent = change.parent;
    this.fracturedChild = newChild;
    let parent = newChild;
    while (++startIndex < endFractureIndex) {
      let isEnd = (((startIndex + 1) | 0) === endFractureIndex);
      let isEndLeaf = (((startIndex + 1) | 0) === changeLength);
      change = changed[startIndex];
      if (isEnd) {
        if (this.offsetLastIndex || !isEndLeaf) {
          child = null;
        } else {
          child = change.parent.getElement(change.index_);
        }
      } else {
        child = change.parent.getElement((change.index_ - 1) | 0);
      }
      if (child != null) {
        if (child.isLeaf()) {
          newChild = this.$outer.createLeafElement$Element$AttributeSet$int$int(parent, child.getAttributes(), Math.max(this.endOffset, child.getStartOffset()), child.getEndOffset());
        } else {
          newChild = this.$outer.createBranchElement$Element$AttributeSet(parent, child.getAttributes());
        }
      } else {
        newChild = null;
      }
      let kidsToMove = (change.parent.getElementCount() - change.index_) | 0;
      let kids: Element[];
      let moveStartIndex: number;
      let kidStartIndex = 1;
      if (newChild == null) {
        if (isEndLeaf) {
          kidsToMove--;
          moveStartIndex = (change.index_ + 1) | 0;
        } else {
          moveStartIndex = change.index_;
        }
        kidStartIndex = 0;
        kids = $J.newArray(kidsToMove, null);
      } else {
        if (!isEnd) {
          kidsToMove++;
          moveStartIndex = change.index_;
        } else {
          moveStartIndex = (change.index_ + 1) | 0;
        }
        kids = $J.newArray(kidsToMove, null);
        kids[0] = newChild;
      }
      for (let counter = kidStartIndex; counter < kidsToMove; counter++) {
        let toMove = change.parent.getElement(moveStartIndex++);
        kids[counter] = this.recreateFracturedElement(parent, toMove);
        change.removed.addElement(toMove);
      }
      (parent).replace(0, 0, kids);
      parent = newChild;
    }
  }
  /**
   * Recreates <code>toDuplicate</code>. This is called when an
   * element needs to be created as the result of an insertion. This
   * will recurse and create all the children. This is similar to
   * <code>clone</code>, but deteremines the offsets differently.
   */
  recreateFracturedElement(parent: Element, toDuplicate: Element): Element {
    if (toDuplicate.isLeaf()) {
      return this.$outer.createLeafElement$Element$AttributeSet$int$int(parent, toDuplicate.getAttributes(), Math.max(toDuplicate.getStartOffset(), this.endOffset), toDuplicate.getEndOffset());
    }
    let newParent = this.$outer.createBranchElement$Element$AttributeSet(parent, toDuplicate.getAttributes());
    let childCount = toDuplicate.getElementCount();
    let newKids = $J.newArray(childCount, null);
    for (let counter = 0; counter < childCount; counter++) {
      newKids[counter] = this.recreateFracturedElement(newParent, toDuplicate.getElement(counter));
    }
    (newParent).replace(0, 0, newKids);
    return newParent;
  }
  /**
   * Splits the bottommost leaf in <code>path</code>.
   * This is called from insert when the first element is NOT content.
   */
  fractureDeepestLeaf(specs: DefaultStyledDocument$ElementSpec[]): void {
    let ec = this.path.peek();
    let child = ec.parent.getElement(ec.index_);
    if (this.offset !== 0) {
      let newChild = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, child.getAttributes(), child.getStartOffset(), this.offset);
      ec.added.addElement(newChild);
    }
    ec.removed.addElement(child);
    if (child.getEndOffset() !== this.endOffset) {
      this.recreateLeafs = true;
    } else {
      this.offsetLastIndex = true;
    }
  }
  /**
   * Inserts the first content. This needs to be separate to handle
   * joining.
   */
  insertFirstContent(specs: DefaultStyledDocument$ElementSpec[]): void {
    let firstSpec = specs[0];
    let ec = this.path.peek();
    let child = ec.parent.getElement(ec.index_);
    let firstEndOffset = (this.offset + firstSpec.getLength()) | 0;
    let isOnlyContent = (specs.length === 1);
    {
      let newE: Element;
      switch (firstSpec.getDirection()) {
        case DefaultStyledDocument$ElementSpec.JoinPreviousDirection:
          if (child.getEndOffset() !== firstEndOffset && !isOnlyContent) {
            let newE = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, child.getAttributes(), child.getStartOffset(), firstEndOffset);
            ec.added.addElement(newE);
            ec.removed.addElement(child);
            if (child.getEndOffset() !== this.endOffset) {
              this.recreateLeafs = true;
            } else {
              this.offsetLastIndex = true;
            }
          } else {
            this.offsetLastIndex = true;
            this.offsetLastIndexOnReplace = true;
          }
          break;
        case DefaultStyledDocument$ElementSpec.JoinNextDirection:
          if (this.offset !== 0) {
            let newE = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, child.getAttributes(), child.getStartOffset(), this.offset);
            ec.added.addElement(newE);
            let nextChild = ec.parent.getElement((ec.index_ + 1) | 0);
            if (isOnlyContent) {
              newE = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, nextChild.getAttributes(), this.offset, nextChild.getEndOffset());
            } else {
              newE = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, nextChild.getAttributes(), this.offset, firstEndOffset);
            }
            ec.added.addElement(newE);
            ec.removed.addElement(child);
            ec.removed.addElement(nextChild);
          }
          break;
        default:
          if (child.getStartOffset() !== this.offset) {
            let newE = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, child.getAttributes(), child.getStartOffset(), this.offset);
            ec.added.addElement(newE);
          }
          ec.removed.addElement(child);
          newE = this.$outer.createLeafElement$Element$AttributeSet$int$int(ec.parent, firstSpec.getAttributes(), this.offset, firstEndOffset);
          ec.added.addElement(newE);
          if (child.getEndOffset() !== this.endOffset) {
            this.recreateLeafs = true;
          } else {
            this.offsetLastIndex = true;
          }
          break;
      }
    }
  }
}

export class DefaultStyledDocument$ElementBuffer$ElemChanges extends JObject {
  parent: Element = null;
  index_: number = 0;
  added: Vector<Element> = null;
  removed: Vector<Element> = null;
  isFracture: boolean = false;
  _DefaultStyledDocument$ElementBuffer$ElemChanges(parent: Element, index: number, isFracture: boolean): this {
    this.parent = parent;
    this.index_ = index;
    this.isFracture = isFracture;
    this.added = new Vector();
    this.removed = new Vector();
    return this;
  }
  toString(): string {
    return 'added: ' + $J.str(this.added) + '\nremoved: ' + $J.str(this.removed) + '\n';
  }
}

/**
 * An UndoableEdit used to remember AttributeSet changes to an
 * Element.
 */
export class DefaultStyledDocument$AttributeUndoableEdit extends AbstractUndoableEdit {
  /**
   * AttributeSet containing additional entries, must be non-mutable!
   */
  newAttributes: AttributeSet = null;
  /**
   * Copy of the AttributeSet the Element contained.
   */
  copy_: AttributeSet = null;
  /**
   * true if all the attributes in the element were removed first.
   */
  isReplacing: boolean = false;
  /**
   * Affected Element.
   */
  element: Element = null;
  /**
   * Constructs an {@code AttributeUndoableEdit}.
   * @param element the element
   * @param newAttributes the new attributes
   * @param isReplacing true if all the attributes in the element were removed first.
   */
  _DefaultStyledDocument$AttributeUndoableEdit(element: Element, newAttributes: AttributeSet, isReplacing: boolean): this {
    this._AbstractUndoableEdit();
    this.element = element;
    this.newAttributes = newAttributes;
    this.isReplacing = isReplacing;
    this.copy_ = element.getAttributes().copyAttributes();
    return this;
  }
}

/**
 * UndoableEdit for changing the resolve parent of an Element.
 */
export class DefaultStyledDocument$StyleChangeUndoableEdit extends AbstractUndoableEdit {
  /**
   * Element to change resolve parent of.
   */
  element: AbstractDocument$AbstractElement = null;
  /**
   * New style.
   */
  newStyle: Style = null;
  /**
   * Old style, before setting newStyle.
   */
  oldStyle: AttributeSet = null;
  _DefaultStyledDocument$StyleChangeUndoableEdit(element: AbstractDocument$AbstractElement, newStyle: Style): this {
    this._AbstractUndoableEdit();
    this.element = element;
    this.newStyle = newStyle;
    this.oldStyle = element.getResolveParent();
    return this;
  }
}

/**
 * Base class for style change handlers with support for stale objects detection.
 */
export class DefaultStyledDocument$AbstractChangeHandler extends JObject {
  /**
   * Class-specific reference queues.
   */
  static queueMap: JMap<JClass<any>, ReferenceQueue<DefaultStyledDocument>> = null;
  /**
   * A weak reference to the document object.
   */
  doc: DefaultStyledDocument$AbstractChangeHandler$DocReference = null;
  _DefaultStyledDocument$AbstractChangeHandler(d: DefaultStyledDocument): this {
    let c = $J.getClass(this);
    let q: ReferenceQueue<DefaultStyledDocument>;
    {
      q = DefaultStyledDocument$AbstractChangeHandler.queueMap.get(c);
      if (q == null) {
        q = new ReferenceQueue();
        DefaultStyledDocument$AbstractChangeHandler.queueMap.put(c, q);
      }
    }
    this.doc = new DefaultStyledDocument$AbstractChangeHandler$DocReference().$o(this)._DefaultStyledDocument$AbstractChangeHandler$DocReference(d, q);
    return this;
  }
  /**
   * Return a list of stale change listeners.
   *
   * A change listener becomes "stale" when its document is cleaned by GC.
   */
  static getStaleListeners(l: ChangeListener): List<ChangeListener> {
    let staleListeners = new ArrayList();
    let q = DefaultStyledDocument$AbstractChangeHandler.queueMap.get(l.getClass());
    if (q != null) {
      let r: DefaultStyledDocument$AbstractChangeHandler$DocReference;
      {
        while ((r = q.poll()) != null) {
          staleListeners.add(r.getListener());
        }
      }
    }
    return staleListeners;
  }
  /**
   * The ChangeListener wrapper which guards against dead documents.
   */
  stateChanged(e: ChangeEvent): void {
    let d = this.doc.get();
    if (d != null) {
      this.fireStateChanged(d, e);
    }
  }
  static $clinit() {
    DefaultStyledDocument$AbstractChangeHandler.queueMap = new HashMap();
  }
}

export class DefaultStyledDocument$AbstractChangeHandler$DocReference extends WeakReference {
  _DefaultStyledDocument$AbstractChangeHandler$DocReference(d: DefaultStyledDocument, q: ReferenceQueue<DefaultStyledDocument>): this {
    this._WeakReference(d, q);
    return this;
  }
  /**
   * Return a reference to the style change handler object.
   */
  getListener(): ChangeListener {
    return $J.fn(this.$outer, 'stateChanged');
  }
}

/**
 * Added to all the Styles. When instances of this receive a
 * stateChanged method, styleChanged is invoked.
 */
export class DefaultStyledDocument$StyleChangeHandler extends DefaultStyledDocument$AbstractChangeHandler {
  _DefaultStyledDocument$StyleChangeHandler(d: DefaultStyledDocument): this {
    this._DefaultStyledDocument$AbstractChangeHandler(d);
    return this;
  }
  fireStateChanged(d: DefaultStyledDocument, e: ChangeEvent): void {
    let source = e.getSource();
    if ($J.isa(source, Style)) {
      d.styleChanged(source);
    } else {
      d.styleChanged(null);
    }
  }
}

/**
 * Added to the StyleContext. When the StyleContext changes, this invokes
 * <code>updateStylesListeningTo</code>.
 */
export class DefaultStyledDocument$StyleContextChangeHandler extends DefaultStyledDocument$AbstractChangeHandler {
  _DefaultStyledDocument$StyleContextChangeHandler(d: DefaultStyledDocument): this {
    this._DefaultStyledDocument$AbstractChangeHandler(d);
    return this;
  }
  fireStateChanged(d: DefaultStyledDocument, e: ChangeEvent): void {
    d.updateStylesListeningTo();
  }
}

/**
 * When run this creates a change event for the complete document
 * and fires it.
 */
export class DefaultStyledDocument$ChangeUpdateRunnable extends JObject {
  isPending: boolean = false;
  _DefaultStyledDocument$ChangeUpdateRunnable(): this {
    this.isPending = false;
    return this;
  }
  run(): void {
    {
      this.isPending = false;
    }
    try {
      this.$outer.writeLock();
      let dde = new AbstractDocument$DefaultDocumentEvent().$o(this.$outer)._AbstractDocument$DefaultDocumentEvent(0, this.$outer.getLength(), DocumentEvent$EventType.CHANGE);
      dde.end();
      this.$outer.fireChangedUpdate$DocumentEvent(dde);
    } finally {
      this.$outer.writeUnlock();
    }
  }
}

$J.define(DefaultStyledDocument, 'javax.swing.text.DefaultStyledDocument', { kind: 'class', ifaces: ['javax.swing.text.StyledDocument'], sup: 'javax.swing.text.AbstractDocument', ctors: { '': '_DefaultStyledDocument$', 'javax.swing.text.StyleContext': '_DefaultStyledDocument$StyleContext', 'javax.swing.text.AbstractDocument$Content,javax.swing.text.StyleContext': '_DefaultStyledDocument$Content$StyleContext' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$DefaultStyledDocument', 'createDefaultRoot()': 'createDefaultRoot$', 'insertUpdate(javax.swing.text.AbstractDocument$DefaultDocumentEvent,javax.swing.text.AttributeSet)': 'insertUpdate$DefaultDocumentEvent$AttributeSet', 'insert(int,javax.swing.text.DefaultStyledDocument.ElementSpec[])': 'insert$int$ElementSpecArr', 'create(javax.swing.text.DefaultStyledDocument.ElementSpec[])': 'create$ElementSpecArr' } });
$J.define(DefaultStyledDocument$SectionElement, 'javax.swing.text.DefaultStyledDocument$SectionElement', { kind: 'class', sup: 'javax.swing.text.AbstractDocument$BranchElement', ctors: { '': '_DefaultStyledDocument$SectionElement' }, inner: true });
$J.define(DefaultStyledDocument$ElementSpec, 'javax.swing.text.DefaultStyledDocument$ElementSpec', { kind: 'class', sup: 'java.lang.Object', ctors: { 'javax.swing.text.AttributeSet,short,char[],int,int': '_DefaultStyledDocument$ElementSpec$AttributeSet$short$charArr$int$int', 'javax.swing.text.AttributeSet,short,int': '_DefaultStyledDocument$ElementSpec$AttributeSet$short$int', 'javax.swing.text.AttributeSet,short': '_DefaultStyledDocument$ElementSpec$AttributeSet$short' } });
$J.define(DefaultStyledDocument$ElementBuffer, 'javax.swing.text.DefaultStyledDocument$ElementBuffer', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'javax.swing.text.Element': '_DefaultStyledDocument$ElementBuffer' }, meths: { 'clone(javax.swing.text.Element,javax.swing.text.Element)': 'clone$Element$Element', 'push(javax.swing.text.Element,int)': 'push$Element$int', 'push(javax.swing.text.Element,int,boolean)': 'push$Element$int$boolean' }, inner: true });
$J.define(DefaultStyledDocument$ElementBuffer$ElemChanges, 'javax.swing.text.DefaultStyledDocument$ElementBuffer$ElemChanges', { kind: 'class', sup: 'java.lang.Object', ctors: { 'javax.swing.text.Element,int,boolean': '_DefaultStyledDocument$ElementBuffer$ElemChanges' }, inner: true });
$J.define(DefaultStyledDocument$AttributeUndoableEdit, 'javax.swing.text.DefaultStyledDocument$AttributeUndoableEdit', { kind: 'class', sup: 'javax.swing.undo.AbstractUndoableEdit', ctors: { 'javax.swing.text.Element,javax.swing.text.AttributeSet,boolean': '_DefaultStyledDocument$AttributeUndoableEdit' } });
$J.define(DefaultStyledDocument$StyleChangeUndoableEdit, 'javax.swing.text.DefaultStyledDocument$StyleChangeUndoableEdit', { kind: 'class', sup: 'javax.swing.undo.AbstractUndoableEdit', ctors: { 'javax.swing.text.AbstractDocument$AbstractElement,javax.swing.text.Style': '_DefaultStyledDocument$StyleChangeUndoableEdit' } });
$J.define(DefaultStyledDocument$AbstractChangeHandler, 'javax.swing.text.DefaultStyledDocument$AbstractChangeHandler', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener'], sup: 'java.lang.Object', ctors: { 'javax.swing.text.DefaultStyledDocument': '_DefaultStyledDocument$AbstractChangeHandler' }, clinit: true, lazy: ['queueMap'] });
$J.define(DefaultStyledDocument$AbstractChangeHandler$DocReference, 'javax.swing.text.DefaultStyledDocument$AbstractChangeHandler$DocReference', { kind: 'class', sup: 'java.lang.ref.WeakReference', ctors: { 'javax.swing.text.DefaultStyledDocument,java.lang.ref.ReferenceQueue': '_DefaultStyledDocument$AbstractChangeHandler$DocReference' }, inner: true });
$J.define(DefaultStyledDocument$StyleChangeHandler, 'javax.swing.text.DefaultStyledDocument$StyleChangeHandler', { kind: 'class', sup: 'javax.swing.text.DefaultStyledDocument$AbstractChangeHandler', ctors: { 'javax.swing.text.DefaultStyledDocument': '_DefaultStyledDocument$StyleChangeHandler' } });
$J.define(DefaultStyledDocument$StyleContextChangeHandler, 'javax.swing.text.DefaultStyledDocument$StyleContextChangeHandler', { kind: 'class', sup: 'javax.swing.text.DefaultStyledDocument$AbstractChangeHandler', ctors: { 'javax.swing.text.DefaultStyledDocument': '_DefaultStyledDocument$StyleContextChangeHandler' } });
$J.define(DefaultStyledDocument$ChangeUpdateRunnable, 'javax.swing.text.DefaultStyledDocument$ChangeUpdateRunnable', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { '': '_DefaultStyledDocument$ChangeUpdateRunnable' }, inner: true });
$J.module(() => {
  TextAttribute = $J.load('java.awt.font.TextAttribute');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  DocumentEvent$EventType = $J.load('javax.swing.event.DocumentEvent$EventType');
  DocumentListener = $J.load('javax.swing.event.DocumentListener');
  UndoableEditEvent = $J.load('javax.swing.event.UndoableEditEvent');
  AbstractDocument$AbstractElement = $J.load('javax.swing.text.AbstractDocument$AbstractElement');
  AbstractDocument$DefaultDocumentEvent = $J.load('javax.swing.text.AbstractDocument$DefaultDocumentEvent');
  AbstractDocument$ElementEdit = $J.load('javax.swing.text.AbstractDocument$ElementEdit');
  AbstractDocument$LeafElement = $J.load('javax.swing.text.AbstractDocument$LeafElement');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  GapContent = $J.load('javax.swing.text.GapContent');
  Segment = $J.load('javax.swing.text.Segment');
  SimpleAttributeSet = $J.load('javax.swing.text.SimpleAttributeSet');
  StateInvariantError = $J.load('javax.swing.text.StateInvariantError');
  Style = $J.load('javax.swing.text.Style');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  StyleContext = $J.load('javax.swing.text.StyleContext');
  Utilities = $J.load('javax.swing.text.Utilities');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
