// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/AbstractDocument.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AccessController, ArrayList, Bidi, BidiUtils, Hashtable, IllegalStateException, InterruptedException, JBoolean, JError, JObject, JString, OutputStreamWriter, PrintWriter, Thread, UnsupportedEncodingException, Vector } from '../../../../jre/index.ts';
import { CompoundEdit } from '../undo/CompoundEdit.ts';
import { AbstractUndoableEdit } from '../undo/AbstractUndoableEdit.ts';
import { DocumentFilter$FilterBypass } from './DocumentFilter.ts';

let TextAttribute, DocumentEvent$ElementChange, DocumentEvent$EventType, DocumentListener, EventListenerList, UndoableEditEvent, UndoableEditListener, BadLocationException, SegmentCache, SimpleAttributeSet, StateInvariantError, StyleConstants, StyleContext, Utilities, SwingUtilities2;

/**
 * An implementation of the document interface to serve as a
 * basis for implementing various kinds of documents.  At this
 * level there is very little policy, so there is a corresponding
 * increase in difficulty of use.
 * <p>
 * This class implements a locking mechanism for the document.  It
 * allows multiple readers or one writer, and writers must wait until
 * all observers of the document have been notified of a previous
 * change before beginning another mutation to the document.  The
 * read lock is acquired and released using the <code>render</code>
 * method.  A write lock is acquired by the methods that mutate the
 * document, and are held for the duration of the method call.
 * Notification is done on the thread that produced the mutation,
 * and the thread has full read access to the document for the
 * duration of the notification, but other readers are kept out
 * until the notification has finished.  The notification is a
 * beans event notification which does not allow any further
 * mutations until all listeners have been notified.
 * <p>
 * Any models subclassed from this class and used in conjunction
 * with a text component that has a look and feel implementation
 * that is derived from BasicTextUI may be safely updated
 * asynchronously, because all access to the View hierarchy
 * is serialized by BasicTextUI if the document is of type
 * <code>AbstractDocument</code>.  The locking assumes that an
 * independent thread will access the View hierarchy only from
 * the DocumentListener methods, and that there will be only
 * one event thread active at a time.
 * <p>
 * If concurrency support is desired, there are the following
 * additional implications.  The code path for any DocumentListener
 * implementation and any UndoListener implementation must be threadsafe,
 * and not access the component lock if trying to be safe from deadlocks.
 * The <code>repaint</code> and <code>revalidate</code> methods
 * on JComponent are safe.
 * <p>
 * AbstractDocument models an implied break at the end of the document.
 * Among other things this allows you to position the caret after the last
 * character. As a result of this, <code>getLength</code> returns one less
 * than the length of the Content. If you create your own Content, be
 * sure and initialize it to have an additional character. Refer to
 * StringContent and GapContent for examples of this. Another implication
 * of this is that Elements that model the implied end character will have
 * an endOffset == (getLength() + 1). For example, in DefaultStyledDocument
 * <code>getParagraphElement(getLength()).getEndOffset() == getLength() + 1
 * </code>.
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
 */
export class AbstractDocument extends JObject {
  numReaders: number = 0;
  currWriter: Thread = null;
  /**
   * The number of writers, all obtained from <code>currWriter</code>.
   */
  numWriters: number = 0;
  /**
   * True will notifying listeners.
   */
  notifyingListeners: boolean = false;
  static defaultI18NProperty: boolean = null;
  /**
   * Storage for document-wide properties.
   */
  documentProperties: Dictionary<any, any> = null;
  /**
   * The event listener list for the document.
   */
  listenerList: EventListenerList = null;
  /**
   * Where the text is actually stored, and a set of marks
   * that track change as the document is edited are managed.
   */
  data: AbstractDocument$Content = null;
  /**
   * Factory for the attributes.  This is the strategy for
   * attribute compression and control of the lifetime of
   * a set of attributes as a collection.  This may be shared
   * with other documents.
   */
  context: AbstractDocument$AttributeContext = null;
  /**
   * The root of the bidirectional structure for this document.  Its children
   * represent character runs with the same Unicode bidi level.
   */
  bidiRoot: AbstractDocument$BranchElement = null;
  /**
   * Filter for inserting/removing of text.
   */
  documentFilter: DocumentFilter = null;
  /**
   * Used by DocumentFilter to do actual insert/remove.
   */
  filterBypass: DocumentFilter$FilterBypass = null;
  static readonly BAD_LOCK_STATE: string = 'document lock failure';
  /**
   * Error message to indicate a bad location.
   */
  static readonly BAD_LOCATION: string = 'document location failure';
  /**
   * Name of elements used to represent paragraphs
   */
  static readonly ParagraphElementName: string = 'paragraph';
  /**
   * Name of elements used to represent content
   */
  static readonly ContentElementName: string = 'content';
  /**
   * Name of elements used to hold sections (lines/paragraphs).
   */
  static readonly SectionElementName: string = 'section';
  /**
   * Name of elements used to hold a unidirectional run
   */
  static readonly BidiElementName: string = 'bidi level';
  /**
   * Name of the attribute used to specify element
   * names.
   */
  static readonly ElementNameAttribute: string = '$ename';
  /**
   * Document property that indicates whether internationalization
   * functions such as text reordering or reshaping should be
   * performed. This property should not be publicly exposed,
   * since it is used for implementation convenience only.  As a
   * side effect, copies of this property may be in its subclasses
   * that live in different packages (e.g. HTMLDocument as of now),
   * so those copies should also be taken care of when this property
   * needs to be modified.
   */
  static readonly I18NProperty: string = 'i18n';
  /**
   * Document property that indicates if a character has been inserted
   * into the document that is more than one byte long.  GlyphView uses
   * this to determine if it should use BreakIterator.
   */
  static MultiByteProperty: any = null;
  /**
   * Document property that indicates asynchronous loading is
   * desired, with the thread priority given as the value.
   */
  static readonly AsyncLoadPriority: string = 'load priority';
  $init_AbstractDocument() {
    this.documentProperties = null;
    this.listenerList = new EventListenerList()._EventListenerList();
  }
  /**
   * Constructs a new <code>AbstractDocument</code>, wrapped around some
   * specified content storage mechanism.
   *
   * @param data the content
   */
  _AbstractDocument$Content(data: AbstractDocument$Content): this {
    this._AbstractDocument$Content$AttributeContext(data, StyleContext.getDefaultStyleContext());
    return this;
  }
  /**
   * Constructs a new <code>AbstractDocument</code>, wrapped around some
   * specified content storage mechanism.
   *
   * @param data the content
   * @param context the attribute context
   */
  _AbstractDocument$Content$AttributeContext(data: AbstractDocument$Content, context: AbstractDocument$AttributeContext): this {
    this.$init_AbstractDocument();
    this.data = data;
    this.context = context;
    this.bidiRoot = new AbstractDocument$BidiRootElement().$o(this)._AbstractDocument$BidiRootElement();
    if (AbstractDocument.defaultI18NProperty == null) {
      let o = AccessController.doPrivileged(new (AbstractDocument$1())().$o(this));
      if (o != null) {
        AbstractDocument.defaultI18NProperty = $J.parseBoolean(o);
      } else {
        AbstractDocument.defaultI18NProperty = false;
      }
    }
    this.putProperty(AbstractDocument.I18NProperty, AbstractDocument.defaultI18NProperty);
    this.writeLock();
    try {
      let p = $J.newArray(1, null);
      p[0] = new AbstractDocument$BidiElement().$o(this)._AbstractDocument$BidiElement(this.bidiRoot, 0, 1, 0);
      this.bidiRoot.replace(0, 0, p);
    } finally {
      this.writeUnlock();
    }
    return this;
  }
  /**
   * Supports managing a set of properties. Callers
   * can use the <code>documentProperties</code> dictionary
   * to annotate the document with document-wide properties.
   *
   * @return a non-<code>null</code> <code>Dictionary</code>
   * @see #setDocumentProperties
   */
  getDocumentProperties(): Dictionary<any, any> {
    if (this.documentProperties == null) {
      this.documentProperties = new Hashtable(2);
    }
    return this.documentProperties;
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   *
   * @param e the event
   * @see EventListenerList
   */
  fireInsertUpdate(e: DocumentEvent): void {
    this.notifyingListeners = true;
    try {
      let listeners = this.listenerList.getListenerList();
      for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
        if (listeners[i] === $J.cls(DocumentListener)) {
          (listeners[(i + 1) | 0]).insertUpdate(e);
        }
      }
    } finally {
      this.notifyingListeners = false;
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   *
   * @param e the event
   * @see EventListenerList
   */
  fireChangedUpdate$DocumentEvent(e: DocumentEvent): void {
    this.notifyingListeners = true;
    try {
      let listeners = this.listenerList.getListenerList();
      for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
        if (listeners[i] === $J.cls(DocumentListener)) {
          (listeners[(i + 1) | 0]).changedUpdate(e);
        }
      }
    } finally {
      this.notifyingListeners = false;
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   *
   * @param e the event
   * @see EventListenerList
   */
  fireRemoveUpdate(e: DocumentEvent): void {
    this.notifyingListeners = true;
    try {
      let listeners = this.listenerList.getListenerList();
      for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
        if (listeners[i] === $J.cls(DocumentListener)) {
          (listeners[(i + 1) | 0]).removeUpdate(e);
        }
      }
    } finally {
      this.notifyingListeners = false;
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   *
   * @param e the event
   * @see EventListenerList
   */
  fireUndoableEditUpdate$UndoableEditEvent(e: UndoableEditEvent): void {
    if (e.getEdit() instanceof AbstractDocument$DefaultDocumentEvent) {
      e = new UndoableEditEvent()._UndoableEditEvent(e.getSource(), new AbstractDocument$DefaultDocumentEventUndoableWrapper().$o(this)._AbstractDocument$DefaultDocumentEventUndoableWrapper(e.getEdit()));
    }
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(UndoableEditListener)) {
        (listeners[(i + 1) | 0]).undoableEditHappened(e);
      }
    }
  }
  /**
   * Sets the asynchronous loading priority.
   * @param p the new asynchronous loading priority; a value
   *   less than zero indicates that the document should not be
   *   loaded asynchronously
   */
  setAsynchronousLoadPriority(p: number): void {
    let loadPriority = (p >= 0) ? p : null;
    this.putProperty(AbstractDocument.AsyncLoadPriority, loadPriority);
  }
  /**
   * Sets the <code>DocumentFilter</code>. The <code>DocumentFilter</code>
   * is passed <code>insert</code> and <code>remove</code> to conditionally
   * allow inserting/deleting of the text.  A <code>null</code> value
   * indicates that no filtering will occur.
   *
   * @param filter the <code>DocumentFilter</code> used to constrain text
   * @see #getDocumentFilter
   * @since 1.4
   */
  setDocumentFilter(filter: DocumentFilter): void {
    this.documentFilter = filter;
  }
  /**
   * Returns the <code>DocumentFilter</code> that is responsible for
   * filtering of insertion/removal. A <code>null</code> return value
   * implies no filtering is to occur.
   *
   * @since 1.4
   * @see #setDocumentFilter
   * @return the DocumentFilter
   */
  getDocumentFilter(): DocumentFilter {
    return this.documentFilter;
  }
  /**
   * Returns the length of the data.  This is the number of
   * characters of content that represents the users data.
   *
   * @return the length &gt;= 0
   * @see Document#getLength
   */
  getLength(): number {
    return (this.data.length() - 1) | 0;
  }
  /**
   * Adds a document listener for notification of any changes.
   *
   * @param listener the <code>DocumentListener</code> to add
   * @see Document#addDocumentListener
   */
  addDocumentListener(listener: DocumentListener): void {
    this.listenerList.add($J.cls(DocumentListener), listener);
  }
  /**
   * Removes a document listener.
   *
   * @param listener the <code>DocumentListener</code> to remove
   * @see Document#removeDocumentListener
   */
  removeDocumentListener(listener: DocumentListener): void {
    this.listenerList.remove($J.cls(DocumentListener), listener);
  }
  /**
   * A convenience method for looking up a property value. It is
   * equivalent to:
   * <pre>
   * getDocumentProperties().get(key);
   * </pre>
   *
   * @param key the non-<code>null</code> property key
   * @return the value of this property or <code>null</code>
   * @see #getDocumentProperties
   */
  getProperty(key: any): any {
    return this.getDocumentProperties().get(key);
  }
  /**
   * A convenience method for storing up a property value.  It is
   * equivalent to:
   * <pre>
   * getDocumentProperties().put(key, value);
   * </pre>
   * If <code>value</code> is <code>null</code> this method will
   * remove the property.
   *
   * @param key the non-<code>null</code> key
   * @param value the property value
   * @see #getDocumentProperties
   */
  putProperty(key: any, value: any): void {
    if (value != null) {
      this.getDocumentProperties().put(key, value);
    } else {
      this.getDocumentProperties().remove(key);
    }
    if (key === TextAttribute.RUN_DIRECTION && $J.equals(true, this.getProperty(AbstractDocument.I18NProperty))) {
      this.writeLock();
      try {
        let e = new AbstractDocument$DefaultDocumentEvent().$o(this)._AbstractDocument$DefaultDocumentEvent(0, this.getLength(), DocumentEvent$EventType.INSERT);
        this.updateBidi(e);
      } finally {
        this.writeUnlock();
      }
    }
  }
  /**
   * Removes some content from the document.
   * Removing content causes a write lock to be held while the
   * actual changes are taking place.  Observers are notified
   * of the change on the thread that called this method.
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   *
   * @param offs the starting offset &gt;= 0
   * @param len the number of characters to remove &gt;= 0
   * @throws BadLocationException  the given remove position is not a valid
   *   position within the document
   * @see Document#remove
   */
  remove(offs: number, len: number): void {
    let filter = this.getDocumentFilter();
    this.writeLock();
    try {
      if (filter != null) {
        filter.remove(this.getFilterBypass(), offs, len);
      } else {
        this.handleRemove(offs, len);
      }
    } finally {
      this.writeUnlock();
    }
  }
  /**
   * Performs the actual work of the remove. It is assumed the caller
   * will have obtained a <code>writeLock</code> before invoking this.
   */
  handleRemove(offs: number, len: number): void {
    if (len > 0) {
      if (offs < 0 || ((offs + len) | 0) > this.getLength()) {
        throw new BadLocationException()._BadLocationException('Invalid remove', (this.getLength() + 1) | 0);
      }
      let chng = new AbstractDocument$DefaultDocumentEvent().$o(this)._AbstractDocument$DefaultDocumentEvent(offs, len, DocumentEvent$EventType.REMOVE);
      let isComposedTextElement: boolean;
      isComposedTextElement = Utilities.isComposedTextElement$Document$int(this, offs);
      this.removeUpdate(chng);
      let u = this.data.remove(offs, len);
      if (u != null) {
        chng.addEdit(u);
      }
      this.postRemoveUpdate(chng);
      chng.end();
      this.fireRemoveUpdate(chng);
      if ((u != null) && !isComposedTextElement) {
        this.fireUndoableEditUpdate$UndoableEditEvent(new UndoableEditEvent()._UndoableEditEvent(this, chng));
      }
    }
  }
  /**
   * Deletes the region of text from <code>offset</code> to
   * <code>offset + length</code>, and replaces it with <code>text</code>.
   * It is up to the implementation as to how this is implemented, some
   * implementations may treat this as two distinct operations: a remove
   * followed by an insert, others may treat the replace as one atomic
   * operation.
   *
   * @param offset index of child element
   * @param length length of text to delete, may be 0 indicating don't
   *               delete anything
   * @param text text to insert, <code>null</code> indicates no text to insert
   * @param attrs AttributeSet indicating attributes of inserted text,
   *              <code>null</code>
   *              is legal, and typically treated as an empty attributeset,
   *              but exact interpretation is left to the subclass
   * @throws BadLocationException the given position is not a valid
   *            position within the document
   * @since 1.4
   */
  replace(offset: number, length: number, text: string, attrs: AttributeSet): void {
    if (length === 0 && (text == null || text.length === 0)) {
      return;
    }
    let filter = this.getDocumentFilter();
    this.writeLock();
    try {
      if (filter != null) {
        filter.replace(this.getFilterBypass(), offset, length, text, attrs);
      } else {
        if (length > 0) {
          this.remove(offset, length);
        }
        if (text != null && text.length > 0) {
          this.insertString(offset, text, attrs);
        }
      }
    } finally {
      this.writeUnlock();
    }
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
    if ((str == null) || (str.length === 0)) {
      return;
    }
    if (offs > this.getLength()) {
      throw new BadLocationException()._BadLocationException('Invalid insert', this.getLength());
    }
    let filter = this.getDocumentFilter();
    this.writeLock();
    try {
      if (filter != null) {
        filter.insertString(this.getFilterBypass(), offs, str, a);
      } else {
        this.handleInsertString(offs, str, a);
      }
    } finally {
      this.writeUnlock();
    }
  }
  /**
   * Performs the actual work of inserting the text; it is assumed the
   * caller has obtained a write lock before invoking this.
   */
  handleInsertString(offs: number, str: string, a: AttributeSet): void {
    if ((str == null) || (str.length === 0)) {
      return;
    }
    let u = this.data.insertString(offs, str);
    let e = new AbstractDocument$DefaultDocumentEvent().$o(this)._AbstractDocument$DefaultDocumentEvent(offs, str.length, DocumentEvent$EventType.INSERT);
    if (u != null) {
      e.addEdit(u);
    }
    if ($J.equals(this.getProperty(AbstractDocument.I18NProperty), false)) {
      let d = this.getProperty(TextAttribute.RUN_DIRECTION);
      if ((d != null) && ($J.equals(d, TextAttribute.RUN_DIRECTION_RTL))) {
        this.putProperty(AbstractDocument.I18NProperty, true);
      } else {
        let chars = JString.toCharArray(str);
        if (SwingUtilities2.isComplexLayout(chars, 0, chars.length)) {
          this.putProperty(AbstractDocument.I18NProperty, true);
        }
      }
    }
    this.insertUpdate$DefaultDocumentEvent$AttributeSet(e, a);
    e.end();
    this.fireInsertUpdate(e);
    if (u != null && (a == null || !a.isDefined(StyleConstants.ComposedTextAttribute))) {
      this.fireUndoableEditUpdate$UndoableEditEvent(new UndoableEditEvent()._UndoableEditEvent(this, e));
    }
  }
  /**
   * Gets a sequence of text from the document.
   *
   * @param offset the starting offset &gt;= 0
   * @param length the number of characters to retrieve &gt;= 0
   * @return the text
   * @throws BadLocationException  the range given includes a position
   *   that is not a valid position within the document
   * @see Document#getText
   */
  getText$int$int(offset: number, length: number): string {
    if (length < 0) {
      throw new BadLocationException()._BadLocationException('Length must be positive', length);
    }
    let str = this.data.getString(offset, length);
    return str;
  }
  /**
   * Fetches the text contained within the given portion
   * of the document.
   * <p>
   * If the partialReturn property on the txt parameter is false, the
   * data returned in the Segment will be the entire length requested and
   * may or may not be a copy depending upon how the data was stored.
   * If the partialReturn property is true, only the amount of text that
   * can be returned without creating a copy is returned.  Using partial
   * returns will give better performance for situations where large
   * parts of the document are being scanned.  The following is an example
   * of using the partial return to access the entire document:
   *
   * <pre>
   * &nbsp; int nleft = doc.getDocumentLength();
   * &nbsp; Segment text = new Segment();
   * &nbsp; int offs = 0;
   * &nbsp; text.setPartialReturn(true);
   * &nbsp; while (nleft &gt; 0) {
   * &nbsp;     doc.getText(offs, nleft, text);
   * &nbsp;     // do something with text
   * &nbsp;     nleft -= text.count;
   * &nbsp;     offs += text.count;
   * &nbsp; }
   * </pre>
   *
   * @param offset the starting offset &gt;= 0
   * @param length the number of characters to retrieve &gt;= 0
   * @param txt the Segment object to retrieve the text into
   * @throws BadLocationException  the range given includes a position
   *   that is not a valid position within the document
   */
  getText$int$int$Segment(offset: number, length: number, txt: Segment): void {
    if (length < 0) {
      throw new BadLocationException()._BadLocationException('Length must be positive', length);
    }
    this.data.getChars(offset, length, txt);
  }
  /**
   * Returns a position that will track change as the document
   * is altered.
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   *
   * @param offs the position in the model &gt;= 0
   * @return the position
   * @throws BadLocationException  if the given position does not
   *   represent a valid location in the associated document
   * @see Document#createPosition
   */
  createPosition(offs: number): Position {
    return this.data.createPosition(offs);
  }
  /**
   * Returns the <code>FilterBypass</code>. This will create one if one
   * does not yet exist.
   */
  getFilterBypass(): DocumentFilter$FilterBypass {
    if (this.filterBypass == null) {
      this.filterBypass = new AbstractDocument$DefaultFilterBypass().$o(this)._AbstractDocument$DefaultFilterBypass();
    }
    return this.filterBypass;
  }
  /**
   * Returns the root element of the bidirectional structure for this
   * document.  Its children represent character runs with a given
   * Unicode bidi level.
   * @return the root element of the bidirectional structure for this
   * document
   */
  getBidiRootElement(): Element {
    return this.bidiRoot;
  }
  /**
   * Returns true if the text in the range <code>p0</code> to
   * <code>p1</code> is left to right.
   */
  static isLeftToRight(doc: Document, p0: number, p1: number): boolean {
    if ($J.equals(true, doc.getProperty(AbstractDocument.I18NProperty))) {
      if (doc instanceof AbstractDocument) {
        let adoc = doc;
        let bidiRoot = adoc.getBidiRootElement();
        let index = bidiRoot.getElementIndex(p0);
        let bidiElem = bidiRoot.getElement(index);
        if (bidiElem.getEndOffset() >= p1) {
          let bidiAttrs = bidiElem.getAttributes();
          return ((StyleConstants.getBidiLevel(bidiAttrs) % 2) === 0);
        }
      }
    }
    return true;
  }
  /**
   * Fetches the context for managing attributes.  This
   * method effectively establishes the strategy used
   * for compressing AttributeSet information.
   *
   * @return the context
   */
  getAttributeContext(): AbstractDocument$AttributeContext {
    return this.context;
  }
  /**
   * Updates document structure as a result of text insertion.  This
   * will happen within a write lock.  If a subclass of
   * this class reimplements this method, it should delegate to the
   * superclass as well.
   *
   * @param chng a description of the change
   * @param attr the attributes for the change
   */
  insertUpdate$DefaultDocumentEvent$AttributeSet(chng: AbstractDocument$DefaultDocumentEvent, attr: AttributeSet): void {
    if ($J.equals(this.getProperty(AbstractDocument.I18NProperty), true)) {
      this.updateBidi(chng);
    }
    if (chng.type === DocumentEvent$EventType.INSERT && chng.getLength() > 0 && !$J.equals(true, this.getProperty(AbstractDocument.MultiByteProperty))) {
      let segment = SegmentCache.getSharedSegment();
      try {
        this.getText$int$int$Segment(chng.getOffset(), chng.getLength(), segment);
        segment.first();
        do {
          if (segment.current() > 255) {
            this.putProperty(AbstractDocument.MultiByteProperty, true);
            break;
          }
        } while (segment.next() !== 65535 /* \uffff */);
      } catch ($e0) {
        if ($J.isa($e0, BadLocationException)) {
          let ble = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
      SegmentCache.releaseSharedSegment(segment);
    }
  }
  /**
   * Updates any document structure as a result of text removal.  This
   * method is called before the text is actually removed from the Content.
   * This will happen within a write lock. If a subclass
   * of this class reimplements this method, it should delegate to the
   * superclass as well.
   *
   * @param chng a description of the change
   */
  removeUpdate(chng: AbstractDocument$DefaultDocumentEvent): void {
  }
  /**
   * Updates any document structure as a result of text removal.  This
   * method is called after the text has been removed from the Content.
   * This will happen within a write lock. If a subclass
   * of this class reimplements this method, it should delegate to the
   * superclass as well.
   *
   * @param chng a description of the change
   */
  postRemoveUpdate(chng: AbstractDocument$DefaultDocumentEvent): void {
    if ($J.equals(this.getProperty(AbstractDocument.I18NProperty), true)) {
      this.updateBidi(chng);
    }
  }
  /**
   * Update the bidi element structure as a result of the given change
   * to the document.  The given change will be updated to reflect the
   * changes made to the bidi structure.
   *
   * This method assumes that every offset in the model is contained in
   * exactly one paragraph.  This method also assumes that it is called
   * after the change is made to the default element structure.
   */
  updateBidi(chng: AbstractDocument$DefaultDocumentEvent): void {
    let firstPStart: number;
    let lastPEnd: number;
    if (chng.type === DocumentEvent$EventType.INSERT || chng.type === DocumentEvent$EventType.CHANGE) {
      let chngStart = chng.getOffset();
      let chngEnd = (chngStart + chng.getLength()) | 0;
      firstPStart = this.getParagraphElement(chngStart).getStartOffset();
      lastPEnd = this.getParagraphElement(chngEnd).getEndOffset();
    } else if (chng.type === DocumentEvent$EventType.REMOVE) {
      let paragraph = this.getParagraphElement(chng.getOffset());
      firstPStart = paragraph.getStartOffset();
      lastPEnd = paragraph.getEndOffset();
    } else {
      throw new JError('Internal error: unknown event type.');
    }
    let levels = this.calculateBidiLevels(firstPStart, lastPEnd);
    let newElements = new ArrayList();
    let firstSpanStart = firstPStart;
    let removeFromIndex = 0;
    if (firstSpanStart > 0) {
      let prevElemIndex = this.bidiRoot.getElementIndex((firstPStart - 1) | 0);
      removeFromIndex = prevElemIndex;
      let prevElem = this.bidiRoot.getElement(prevElemIndex);
      let prevLevel = StyleConstants.getBidiLevel(prevElem.getAttributes());
      if (prevLevel === levels[0]) {
        firstSpanStart = prevElem.getStartOffset();
      } else if (prevElem.getEndOffset() > firstPStart) {
        newElements.add(new AbstractDocument$BidiElement().$o(this)._AbstractDocument$BidiElement(this.bidiRoot, prevElem.getStartOffset(), firstPStart, prevLevel));
      } else {
        removeFromIndex++;
      }
    }
    let firstSpanEnd = 0;
    while ((firstSpanEnd < levels.length) && (levels[firstSpanEnd] === levels[0])) {
      firstSpanEnd++;
    }
    let lastSpanEnd = lastPEnd;
    let newNextElem = null;
    let removeToIndex = (this.bidiRoot.getElementCount() - 1) | 0;
    if (lastSpanEnd <= this.getLength()) {
      let nextElemIndex = this.bidiRoot.getElementIndex(lastPEnd);
      removeToIndex = nextElemIndex;
      let nextElem = this.bidiRoot.getElement(nextElemIndex);
      let nextLevel = StyleConstants.getBidiLevel(nextElem.getAttributes());
      if (nextLevel === (levels[(levels.length - 1) | 0])) {
        lastSpanEnd = nextElem.getEndOffset();
      } else if (nextElem.getStartOffset() < lastPEnd) {
        newNextElem = new AbstractDocument$BidiElement().$o(this)._AbstractDocument$BidiElement(this.bidiRoot, lastPEnd, nextElem.getEndOffset(), nextLevel);
      } else {
        removeToIndex--;
      }
    }
    let lastSpanStart = levels.length;
    while ((lastSpanStart > firstSpanEnd) && ((levels[(lastSpanStart - 1) | 0]) === (levels[(levels.length - 1) | 0]))) {
      lastSpanStart--;
    }
    if ((firstSpanEnd === lastSpanStart) && (levels[0] === (levels[(levels.length - 1) | 0]))) {
      newElements.add(new AbstractDocument$BidiElement().$o(this)._AbstractDocument$BidiElement(this.bidiRoot, firstSpanStart, lastSpanEnd, levels[0]));
    } else {
      newElements.add(new AbstractDocument$BidiElement().$o(this)._AbstractDocument$BidiElement(this.bidiRoot, firstSpanStart, (firstSpanEnd + firstPStart) | 0, levels[0]));
      for (let i = firstSpanEnd; i < lastSpanStart; ) {
        let j: number;
        for (j = i; (j < levels.length) && (levels[j] === levels[i]); j++) {
        }
        newElements.add(new AbstractDocument$BidiElement().$o(this)._AbstractDocument$BidiElement(this.bidiRoot, (firstPStart + i) | 0, (firstPStart + j) | 0, levels[i]));
        i = j;
      }
      newElements.add(new AbstractDocument$BidiElement().$o(this)._AbstractDocument$BidiElement(this.bidiRoot, (lastSpanStart + firstPStart) | 0, lastSpanEnd, levels[(levels.length - 1) | 0]));
    }
    if (newNextElem != null) {
      newElements.add(newNextElem);
    }
    let removedElemCount = 0;
    if (this.bidiRoot.getElementCount() > 0) {
      removedElemCount = (removeToIndex - removeFromIndex + 1) | 0;
    }
    let removedElems = $J.newArray(removedElemCount, null);
    for (let i = 0; i < removedElemCount; i++) {
      removedElems[i] = this.bidiRoot.getElement((removeFromIndex + i) | 0);
    }
    let addedElems = $J.toArrayInto(newElements.toArray(), $J.newArray(0, null));
    let ee = new AbstractDocument$ElementEdit()._AbstractDocument$ElementEdit(this.bidiRoot, removeFromIndex, removedElems, addedElems);
    chng.addEdit(ee);
    this.bidiRoot.replace(removeFromIndex, removedElems.length, addedElems);
  }
  /**
   * Calculate the levels array for a range of paragraphs.
   */
  calculateBidiLevels(firstPStart: number, lastPEnd: number): number[] {
    let levels = $J.newArray((lastPEnd - firstPStart) | 0, 0);
    let levelsEnd = 0;
    let defaultDirection = null;
    let d = this.getProperty(TextAttribute.RUN_DIRECTION);
    if ($J.isa(d, JBoolean)) {
      defaultDirection = d;
    }
    for (let o = firstPStart; o < lastPEnd; ) {
      let p = this.getParagraphElement(o);
      let pStart = p.getStartOffset();
      let pEnd = p.getEndOffset();
      let direction = defaultDirection;
      d = p.getAttributes().getAttribute(TextAttribute.RUN_DIRECTION);
      if ($J.isa(d, JBoolean)) {
        direction = d;
      }
      let seg = SegmentCache.getSharedSegment();
      try {
        this.getText$int$int$Segment(pStart, (pEnd - pStart) | 0, seg);
      } catch ($e1) {
        if ($J.isa($e1, BadLocationException)) {
          let e = $J.exc($e1);
          throw new JError('Internal error: ' + e.toString());
        } else {
          throw $e1;
        }
      }
      let bidiAnalyzer: Bidi;
      let bidiflag = -2;
      if (direction != null) {
        if ($J.equals(TextAttribute.RUN_DIRECTION_LTR, direction)) {
          bidiflag = 0;
        } else {
          bidiflag = 1;
        }
      }
      bidiAnalyzer = new Bidi(seg.array, seg.offset, null, 0, seg.count_, bidiflag);
      BidiUtils.getLevels(bidiAnalyzer, levels, levelsEnd);
      levelsEnd = (levelsEnd + bidiAnalyzer.getLength()) | 0;
      o = p.getEndOffset();
      SegmentCache.releaseSharedSegment(seg);
    }
    if (levelsEnd !== levels.length) {
      throw new JError('levelsEnd assertion failed.');
    }
    return levels;
  }
  /**
   * Gives a diagnostic dump.
   *
   * @param out the output stream
   */
  dump(out: PrintStream): void {
    let root = this.getDefaultRootElement();
    if (root instanceof AbstractDocument$AbstractElement) {
      (root).dump(out, 0);
    }
    this.bidiRoot.dump(out, 0);
  }
  /**
   * Gets the content for the document.
   *
   * @return the content
   */
  getContent(): AbstractDocument$Content {
    return this.data;
  }
  /**
   * Creates a document leaf element.
   * Hook through which elements are created to represent the
   * document structure.  Because this implementation keeps
   * structure and content separate, elements grow automatically
   * when content is extended so splits of existing elements
   * follow.  The document itself gets to decide how to generate
   * elements to give flexibility in the type of elements used.
   *
   * @param parent the parent element
   * @param a the attributes for the element
   * @param p0 the beginning of the range &gt;= 0
   * @param p1 the end of the range &gt;= p0
   * @return the new element
   */
  createLeafElement$Element$AttributeSet$int$int(parent: Element, a: AttributeSet, p0: number, p1: number): Element {
    return new AbstractDocument$LeafElement().$o(this)._AbstractDocument$LeafElement(parent, a, p0, p1);
  }
  /**
   * Creates a document branch element, that can contain other elements.
   *
   * @param parent the parent element
   * @param a the attributes
   * @return the element
   */
  createBranchElement$Element$AttributeSet(parent: Element, a: AttributeSet): Element {
    return new AbstractDocument$BranchElement().$o(this)._AbstractDocument$BranchElement(parent, a);
  }
  /**
   * Fetches the current writing thread if there is one.
   * This can be used to distinguish whether a method is
   * being called as part of an existing modification or
   * if a lock needs to be acquired and a new transaction
   * started.
   *
   * @return the thread actively modifying the document
   *  or <code>null</code> if there are no modifications in progress
   */
  getCurrentWriter(): Thread {
    return this.currWriter;
  }
  /**
   * Acquires a lock to begin mutating the document this lock
   * protects.  There can be no writing, notification of changes, or
   * reading going on in order to gain the lock.  Additionally a thread is
   * allowed to gain more than one <code>writeLock</code>,
   * as long as it doesn't attempt to gain additional <code>writeLock</code>s
   * from within document notification.  Attempting to gain a
   * <code>writeLock</code> from within a DocumentListener notification will
   * result in an <code>IllegalStateException</code>.  The ability
   * to obtain more than one <code>writeLock</code> per thread allows
   * subclasses to gain a writeLock, perform a number of operations, then
   * release the lock.
   * <p>
   * Calls to <code>writeLock</code>
   * must be balanced with calls to <code>writeUnlock</code>, else the
   * <code>Document</code> will be left in a locked state so that no
   * reading or writing can be done.
   *
   * @throws IllegalStateException thrown on illegal lock
   *  attempt.  If the document is implemented properly, this can
   *  only happen if a document listener attempts to mutate the
   *  document.  This situation violates the bean event model
   *  where order of delivery is not guaranteed and all listeners
   *  should be notified before further mutations are allowed.
   */
  writeLock(): void {
    try {
      while ((this.numReaders > 0) || (this.currWriter != null)) {
        if (Thread.currentThread() === this.currWriter) {
          if (this.notifyingListeners) {
            throw new IllegalStateException('Attempt to mutate in notification');
          }
          this.numWriters++;
          return;
        }
        $J.monitorWait(this);
      }
      this.currWriter = Thread.currentThread();
      this.numWriters = 1;
    } catch ($e2) {
      if ($J.isa($e2, InterruptedException)) {
        let e = $J.exc($e2);
        throw new JError('Interrupted attempt to acquire write lock');
      } else {
        throw $e2;
      }
    }
  }
  /**
   * Releases a write lock previously obtained via <code>writeLock</code>.
   * After decrementing the lock count if there are no outstanding locks
   * this will allow a new writer, or readers.
   *
   * @see #writeLock
   */
  writeUnlock(): void {
    if (--this.numWriters <= 0) {
      this.numWriters = 0;
      this.currWriter = null;
      $J.monitorNotify(this, true);
    }
  }
  /**
   * Acquires a lock to begin reading some state from the
   * document.  There can be multiple readers at the same time.
   * Writing blocks the readers until notification of the change
   * to the listeners has been completed.  This method should
   * be used very carefully to avoid unintended compromise
   * of the document.  It should always be balanced with a
   * <code>readUnlock</code>.
   *
   * @see #readUnlock
   */
  readLock(): void {
    try {
      while (this.currWriter != null) {
        if (this.currWriter === Thread.currentThread()) {
          return;
        }
        $J.monitorWait(this);
      }
      this.numReaders = (this.numReaders + 1) | 0;
    } catch ($e3) {
      if ($J.isa($e3, InterruptedException)) {
        let e = $J.exc($e3);
        throw new JError('Interrupted attempt to acquire read lock');
      } else {
        throw $e3;
      }
    }
  }
  /**
   * Does a read unlock.  This signals that one
   * of the readers is done.  If there are no more readers
   * then writing can begin again.  This should be balanced
   * with a readLock, and should occur in a finally statement
   * so that the balance is guaranteed.  The following is an
   * example.
   * <pre><code>
   * &nbsp;   readLock();
   * &nbsp;   try {
   * &nbsp;       // do something
   * &nbsp;   } finally {
   * &nbsp;       readUnlock();
   * &nbsp;   }
   * </code></pre>
   *
   * @see #readLock
   */
  readUnlock(): void {
    if (this.currWriter === Thread.currentThread()) {
      return;
    }
    if (this.numReaders <= 0) {
      throw new StateInvariantError()._StateInvariantError(AbstractDocument.BAD_LOCK_STATE);
    }
    this.numReaders = (this.numReaders - 1) | 0;
    $J.monitorNotify(this, false);
  }
  static $clinit() {
    AbstractDocument.MultiByteProperty = 'multiByte';
  }
}

/**
 * Interface to describe a sequence of character content that
 * can be edited.  Implementations may or may not support a
 * history mechanism which will be reflected by whether or not
 * mutations return an UndoableEdit implementation.
 * @see AbstractDocument
 */
export class AbstractDocument$Content {
}

/**
 * An interface that can be used to allow MutableAttributeSet
 * implementations to use pluggable attribute compression
 * techniques.  Each mutation of the attribute set can be
 * used to exchange a previous AttributeSet instance with
 * another, preserving the possibility of the AttributeSet
 * remaining immutable.  An implementation is provided by
 * the StyleContext class.
 *
 * The Element implementations provided by this class use
 * this interface to provide their MutableAttributeSet
 * implementations, so that different AttributeSet compression
 * techniques can be employed.  The method
 * <code>getAttributeContext</code> should be implemented to
 * return the object responsible for implementing the desired
 * compression technique.
 *
 * @see StyleContext
 */
export class AbstractDocument$AttributeContext {
}

/**
 * Implements the abstract part of an element.  By default elements
 * support attributes by having a field that represents the immutable
 * part of the current attribute set for the element.  The element itself
 * implements MutableAttributeSet which can be used to modify the set
 * by fetching a new immutable set.  The immutable sets are provided
 * by the AttributeContext associated with the document.
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
export class AbstractDocument$AbstractElement extends JObject {
  parent: Element = null;
  attributes: AttributeSet = null;
  /**
   * Creates a new AbstractElement.
   *
   * @param parent the parent element
   * @param a the attributes for the element
   * @since 1.4
   */
  _AbstractDocument$AbstractElement(parent: Element, a: AttributeSet): this {
    this.parent = parent;
    this.attributes = this.$outer.getAttributeContext().getEmptySet();
    if (a != null) {
      this.addAttributes(a);
    }
    return this;
  }
  indent(out: PrintWriter, n: number): void {
    for (let i = 0; i < n; i++) {
      out.print('  ');
    }
  }
  /**
   * Dumps a debugging representation of the element hierarchy.
   *
   * @param psOut the output stream
   * @param indentAmount the indentation level &gt;= 0
   */
  dump(psOut: PrintStream, indentAmount: number): void {
    let out: PrintWriter;
    try {
      out = new PrintWriter(new OutputStreamWriter(psOut, 'JavaEsc'), true);
    } catch ($e4) {
      if ($J.isa($e4, UnsupportedEncodingException)) {
        let e = $J.exc($e4);
        out = new PrintWriter(psOut, true);
      } else {
        throw $e4;
      }
    }
    this.indent(out, indentAmount);
    if (this.getName() == null) {
      out.print('<??');
    } else {
      out.print('<' + this.getName());
    }
    if (this.getAttributeCount() > 0) {
      out.println('');
      let names = this.attributes.getAttributeNames();
      while (names.hasMoreElements()) {
        let name = names.nextElement();
        this.indent(out, (indentAmount + 1) | 0);
        out.println($J.str(name) + '=' + $J.str(this.getAttribute(name)));
      }
      this.indent(out, indentAmount);
    }
    out.println('>');
    if (this.isLeaf()) {
      this.indent(out, (indentAmount + 1) | 0);
      out.print('[' + this.getStartOffset() + ',' + this.getEndOffset() + ']');
      let c = this.$outer.getContent();
      try {
        let contentStr = c.getString(this.getStartOffset(), (this.getEndOffset() - this.getStartOffset()) | 0);
        if (contentStr.length > 40) {
          contentStr = contentStr.substring(0, 40) + '...';
        }
        out.println('[' + contentStr + ']');
      } catch ($e5) {
        if ($J.isa($e5, BadLocationException)) {
          let e = $J.exc($e5);
        } else {
          throw $e5;
        }
      }
    } else {
      let n = this.getElementCount();
      for (let i = 0; i < n; i++) {
        let e = this.getElement(i);
        e.dump(psOut, (indentAmount + 1) | 0);
      }
    }
  }
  /**
   * Gets the number of attributes that are defined.
   *
   * @return the number of attributes &gt;= 0
   * @see AttributeSet#getAttributeCount
   */
  getAttributeCount(): number {
    return this.attributes.getAttributeCount();
  }
  /**
   * Checks whether a given attribute is defined.
   *
   * @param attrName the non-null attribute name
   * @return true if the attribute is defined
   * @see AttributeSet#isDefined
   */
  isDefined(attrName: any): boolean {
    return this.attributes.isDefined(attrName);
  }
  /**
   * Checks whether two attribute sets are equal.
   *
   * @param attr the attribute set to check against
   * @return true if the same
   * @see AttributeSet#isEqual
   */
  isEqual(attr: AttributeSet): boolean {
    return this.attributes.isEqual(attr);
  }
  /**
   * Copies a set of attributes.
   *
   * @return the copy
   * @see AttributeSet#copyAttributes
   */
  copyAttributes(): AttributeSet {
    return this.attributes.copyAttributes();
  }
  /**
   * Gets the value of an attribute.
   *
   * @param attrName the non-null attribute name
   * @return the attribute value
   * @see AttributeSet#getAttribute
   */
  getAttribute(attrName: any): any {
    let value = this.attributes.getAttribute(attrName);
    if (value == null) {
      let a = (this.parent != null) ? this.parent.getAttributes() : null;
      if (a != null) {
        value = a.getAttribute(attrName);
      }
    }
    return value;
  }
  /**
   * Gets the names of all attributes.
   *
   * @return the attribute names as an enumeration
   * @see AttributeSet#getAttributeNames
   */
  getAttributeNames(): Enumeration<any> {
    return this.attributes.getAttributeNames();
  }
  /**
   * Gets the resolving parent.
   * If not overridden, the resolving parent defaults to
   * the parent element.
   *
   * @return the attributes from the parent, <code>null</code> if none
   * @see AttributeSet#getResolveParent
   */
  getResolveParent(): AttributeSet {
    let a = this.attributes.getResolveParent();
    if ((a == null) && (this.parent != null)) {
      a = this.parent.getAttributes();
    }
    return a;
  }
  /**
   * Adds an attribute to the element.
   *
   * @param name the non-null attribute name
   * @param value the attribute value
   * @see MutableAttributeSet#addAttribute
   */
  addAttribute(name: any, value: any): void {
    this.checkForIllegalCast();
    let context = this.$outer.getAttributeContext();
    this.attributes = context.addAttribute(this.attributes, name, value);
  }
  /**
   * Adds a set of attributes to the element.
   *
   * @param attr the attributes to add
   * @see MutableAttributeSet#addAttribute
   */
  addAttributes(attr: AttributeSet): void {
    this.checkForIllegalCast();
    let context = this.$outer.getAttributeContext();
    this.attributes = context.addAttributes(this.attributes, attr);
  }
  /**
   * Removes an attribute from the set.
   *
   * @param name the non-null attribute name
   * @see MutableAttributeSet#removeAttribute
   */
  removeAttribute(name: any): void {
    this.checkForIllegalCast();
    let context = this.$outer.getAttributeContext();
    this.attributes = context.removeAttribute(this.attributes, name);
  }
  /**
   * Removes a set of attributes for the element.
   *
   * @param attrs the attributes
   * @see MutableAttributeSet#removeAttributes
   */
  removeAttributes$AttributeSet(attrs: AttributeSet): void {
    this.checkForIllegalCast();
    let context = this.$outer.getAttributeContext();
    if (attrs === this) {
      this.attributes = context.getEmptySet();
    } else {
      this.attributes = context.removeAttributes(this.attributes, attrs);
    }
  }
  /**
   * Sets the resolving parent.
   *
   * @param parent the parent, null if none
   * @see MutableAttributeSet#setResolveParent
   */
  setResolveParent(parent: AttributeSet): void {
    this.checkForIllegalCast();
    let context = this.$outer.getAttributeContext();
    if (parent != null) {
      this.attributes = context.addAttribute(this.attributes, StyleConstants.ResolveAttribute, parent);
    } else {
      this.attributes = context.removeAttribute(this.attributes, StyleConstants.ResolveAttribute);
    }
  }
  checkForIllegalCast(): void {
    let t = this.$outer.getCurrentWriter();
    if ((t == null) || (t !== Thread.currentThread())) {
      throw new StateInvariantError()._StateInvariantError('Illegal cast to MutableAttributeSet');
    }
  }
  /**
   * Retrieves the underlying model.
   *
   * @return the model
   */
  getDocument(): Document {
    return this.$outer;
  }
  /**
   * Gets the parent of the element.
   *
   * @return the parent
   */
  getParentElement(): Element {
    return this.parent;
  }
  /**
   * Gets the attributes for the element.
   *
   * @return the attribute set
   */
  getAttributes(): AttributeSet {
    return this;
  }
  /**
   * Gets the name of the element.
   *
   * @return the name, null if none
   */
  getName(): string {
    if (this.attributes.isDefined(AbstractDocument.ElementNameAttribute)) {
      return this.attributes.getAttribute(AbstractDocument.ElementNameAttribute);
    }
    return null;
  }
  /**
   * Returns the child <code>TreeNode</code> at index
   * <code>childIndex</code>.
   */
  getChildAt(childIndex: number): TreeNode {
    return this.getElement(childIndex);
  }
  /**
   * Returns the number of children <code>TreeNode</code>'s
   * receiver contains.
   * @return the number of children <code>TreeNodews</code>'s
   * receiver contains
   */
  getChildCount(): number {
    return this.getElementCount();
  }
  /**
   * Returns the parent <code>TreeNode</code> of the receiver.
   * @return the parent <code>TreeNode</code> of the receiver
   */
  getParent(): TreeNode {
    return this.getParentElement();
  }
  /**
   * Returns the index of <code>node</code> in the receivers children.
   * If the receiver does not contain <code>node</code>, -1 will be
   * returned.
   * @param node the location of interest
   * @return the index of <code>node</code> in the receiver's
   * children, or -1 if absent
   */
  getIndex(node: TreeNode): number {
    for (let counter = (this.getChildCount() - 1) | 0; counter >= 0; counter--) {
      if (this.getChildAt(counter) === node) {
        return counter;
      }
    }
    return -1;
  }
}

/**
 * Implements a composite element that contains other elements.
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
export class AbstractDocument$BranchElement extends AbstractDocument$AbstractElement {
  children_: AbstractDocument$AbstractElement[] = null;
  nchildren: number = 0;
  lastIndex: number = 0;
  /**
   * Constructs a composite element that initially contains
   * no children.
   *
   * @param parent  The parent element
   * @param a the attributes for the element
   * @since 1.4
   */
  _AbstractDocument$BranchElement(parent: Element, a: AttributeSet): this {
    this._AbstractDocument$AbstractElement(parent, a);
    this.children_ = $J.newArray(1, null);
    this.nchildren = 0;
    this.lastIndex = -1;
    return this;
  }
  /**
   * Replaces content with a new set of elements.
   *
   * @param offset the starting offset &gt;= 0
   * @param length the length to replace &gt;= 0
   * @param elems the new elements
   */
  replace(offset: number, length: number, elems: Element[]): void {
    let delta = (elems.length - length) | 0;
    let src = (offset + length) | 0;
    let nmove = (this.nchildren - src) | 0;
    let dest = (src + delta) | 0;
    if (((this.nchildren + delta) | 0) >= this.children_.length) {
      let newLength = Math.max(Math.imul(2, this.children_.length), (this.nchildren + delta) | 0);
      let newChildren = $J.newArray(newLength, null);
      $J.system_arraycopy(this.children_, 0, newChildren, 0, offset);
      $J.system_arraycopy(elems, 0, newChildren, offset, elems.length);
      $J.system_arraycopy(this.children_, src, newChildren, dest, nmove);
      this.children_ = newChildren;
    } else {
      $J.system_arraycopy(this.children_, src, this.children_, dest, nmove);
      $J.system_arraycopy(elems, 0, this.children_, offset, elems.length);
    }
    this.nchildren = (this.nchildren + delta) | 0;
  }
  /**
   * Converts the element to a string.
   *
   * @return the string
   */
  toString(): string {
    return 'BranchElement(' + this.getName() + ') ' + this.getStartOffset() + ',' + this.getEndOffset() + '\n';
  }
  /**
   * Gets the element name.
   *
   * @return the element name
   */
  getName(): string {
    let nm = super.getName();
    if (nm == null) {
      nm = AbstractDocument.ParagraphElementName;
    }
    return nm;
  }
  /**
   * Gets the starting offset in the model for the element.
   *
   * @return the offset &gt;= 0
   */
  getStartOffset(): number {
    return this.children_[0].getStartOffset();
  }
  /**
   * Gets the ending offset in the model for the element.
   * @throws NullPointerException if this element has no children
   *
   * @return the offset &gt;= 0
   */
  getEndOffset(): number {
    let child = (this.nchildren > 0) ? this.children_[(this.nchildren - 1) | 0] : this.children_[0];
    return child.getEndOffset();
  }
  /**
   * Gets a child element.
   *
   * @param index the child index, &gt;= 0 &amp;&amp; &lt; getElementCount()
   * @return the child element, null if none
   */
  getElement(index: number): Element {
    if (index < this.nchildren) {
      return this.children_[index];
    }
    return null;
  }
  /**
   * Gets the number of children for the element.
   *
   * @return the number of children &gt;= 0
   */
  getElementCount(): number {
    return this.nchildren;
  }
  /**
   * Gets the child element index closest to the given model offset.
   *
   * @param offset the offset &gt;= 0
   * @return the element index &gt;= 0
   */
  getElementIndex(offset: number): number {
    let index: number;
    let lower = 0;
    let upper = (this.nchildren - 1) | 0;
    let mid = 0;
    let p0 = this.getStartOffset();
    let p1: number;
    if (this.nchildren === 0) {
      return 0;
    }
    if (offset >= this.getEndOffset()) {
      return (this.nchildren - 1) | 0;
    }
    if ((this.lastIndex >= lower) && (this.lastIndex <= upper)) {
      let lastHit = this.children_[this.lastIndex];
      p0 = lastHit.getStartOffset();
      p1 = lastHit.getEndOffset();
      if ((offset >= p0) && (offset < p1)) {
        return this.lastIndex;
      }
      if (offset < p0) {
        upper = this.lastIndex;
      } else {
        lower = this.lastIndex;
      }
    }
    while (lower <= upper) {
      mid = (lower + ($J.idiv(((upper - lower) | 0), 2))) | 0;
      let elem = this.children_[mid];
      p0 = elem.getStartOffset();
      p1 = elem.getEndOffset();
      if ((offset >= p0) && (offset < p1)) {
        index = mid;
        this.lastIndex = index;
        return index;
      } else if (offset < p0) {
        upper = (mid - 1) | 0;
      } else {
        lower = (mid + 1) | 0;
      }
    }
    if (offset < p0) {
      index = mid;
    } else {
      index = (mid + 1) | 0;
    }
    this.lastIndex = index;
    return index;
  }
  /**
   * Checks whether the element is a leaf.
   *
   * @return true if a leaf
   */
  isLeaf(): boolean {
    return false;
  }
  /**
   * Returns true if the receiver allows children.
   * @return true if the receiver allows children, otherwise false
   */
  getAllowsChildren(): boolean {
    return true;
  }
  /**
   * Returns the children of the receiver as an
   * <code>Enumeration</code>.
   * @return the children of the receiver
   */
  children(): Enumeration<TreeNode> {
    if (this.nchildren === 0) {
      return null;
    }
    let tempVector = new Vector(this.nchildren);
    for (let counter = 0; counter < this.nchildren; counter++) {
      tempVector.addElement(this.children_[counter]);
    }
    return tempVector.elements();
  }
}

/**
 * Implements an element that directly represents content of
 * some kind.
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
 * @see     Element
 */
export class AbstractDocument$LeafElement extends AbstractDocument$AbstractElement {
  p0: Position = null;
  p1: Position = null;
  /**
   * Constructs an element that represents content within the
   * document (has no children).
   *
   * @param parent  The parent element
   * @param a       The element attributes
   * @param offs0   The start offset &gt;= 0
   * @param offs1   The end offset &gt;= offs0
   * @since 1.4
   */
  _AbstractDocument$LeafElement(parent: Element, a: AttributeSet, offs0: number, offs1: number): this {
    this._AbstractDocument$AbstractElement(parent, a);
    try {
      this.p0 = this.$outer.createPosition(offs0);
      this.p1 = this.$outer.createPosition(offs1);
    } catch ($e6) {
      if ($J.isa($e6, BadLocationException)) {
        let e = $J.exc($e6);
        this.p0 = null;
        this.p1 = null;
        throw new StateInvariantError()._StateInvariantError('Can\'t create Position references');
      } else {
        throw $e6;
      }
    }
    return this;
  }
  /**
   * Converts the element to a string.
   *
   * @return the string
   */
  toString(): string {
    return 'LeafElement(' + this.getName() + ') ' + $J.str(this.p0) + ',' + $J.str(this.p1) + '\n';
  }
  /**
   * Gets the starting offset in the model for the element.
   *
   * @return the offset &gt;= 0
   */
  getStartOffset(): number {
    return this.p0.getOffset();
  }
  /**
   * Gets the ending offset in the model for the element.
   *
   * @return the offset &gt;= 0
   */
  getEndOffset(): number {
    return this.p1.getOffset();
  }
  /**
   * Gets the element name.
   *
   * @return the name
   */
  getName(): string {
    let nm = super.getName();
    if (nm == null) {
      nm = AbstractDocument.ContentElementName;
    }
    return nm;
  }
  /**
   * Gets the child element index closest to the given model offset.
   *
   * @param pos the offset &gt;= 0
   * @return the element index &gt;= 0
   */
  getElementIndex(pos: number): number {
    return -1;
  }
  /**
   * Gets a child element.
   *
   * @param index the child index, &gt;= 0 &amp;&amp; &lt; getElementCount()
   * @return the child element
   */
  getElement(index: number): Element {
    return null;
  }
  /**
   * Returns the number of child elements.
   *
   * @return the number of children &gt;= 0
   */
  getElementCount(): number {
    return 0;
  }
  /**
   * Checks whether the element is a leaf.
   *
   * @return true if a leaf
   */
  isLeaf(): boolean {
    return true;
  }
  /**
   * Returns true if the receiver allows children.
   * @return true if the receiver allows children, otherwise false
   */
  getAllowsChildren(): boolean {
    return false;
  }
  /**
   * Returns the children of the receiver as an
   * <code>Enumeration</code>.
   * @return the children of the receiver
   */
  children(): Enumeration<TreeNode> {
    return null;
  }
}

/**
 * Represents the root element of the bidirectional element structure.
 * The root element is the only element in the bidi element structure
 * which contains children.
 */
export class AbstractDocument$BidiRootElement extends AbstractDocument$BranchElement {
  _AbstractDocument$BidiRootElement(): this {
    this._AbstractDocument$BranchElement(null, null);
    return this;
  }
  /**
   * Gets the name of the element.
   * @return the name
   */
  getName(): string {
    return 'bidi root';
  }
}

/**
 * Represents an element of the bidirectional element structure.
 */
export class AbstractDocument$BidiElement extends AbstractDocument$LeafElement {
  /**
   * Creates a new BidiElement.
   */
  _AbstractDocument$BidiElement(parent: Element, start: number, end: number, level: number): this {
    this._AbstractDocument$LeafElement(parent, new SimpleAttributeSet()._SimpleAttributeSet$(), start, end);
    this.addAttribute(StyleConstants.BidiLevel, level);
    return this;
  }
  /**
   * Gets the name of the element.
   * @return the name
   */
  getName(): string {
    return AbstractDocument.BidiElementName;
  }
}

/**
 * Stores document changes as the document is being
 * modified.  Can subsequently be used for change notification
 * when done with the document modification transaction.
 * This is used by the AbstractDocument class and its extensions
 * for broadcasting change information to the document listeners.
 */
export class AbstractDocument$DefaultDocumentEvent extends CompoundEdit {
  offset: number = 0;
  length_: number = 0;
  changeLookup: Hashtable<Element, DocumentEvent$ElementChange> = null;
  type: DocumentEvent$EventType = null;
  /**
   * Constructs a change record.
   *
   * @param offs the offset into the document of the change &gt;= 0
   * @param len  the length of the change &gt;= 0
   * @param type the type of event (DocumentEvent.EventType)
   * @since 1.4
   */
  _AbstractDocument$DefaultDocumentEvent(offs: number, len: number, type$: DocumentEvent$EventType): this {
    this._CompoundEdit();
    this.offset = offs;
    this.length_ = len;
    this.type = type$;
    return this;
  }
  /**
   * Returns a string description of the change event.
   *
   * @return a string
   */
  toString(): string {
    return this.edits.toString();
  }
  /**
   * Adds a document edit.  If the number of edits crosses
   * a threshold, this switches on a hashtable lookup for
   * ElementChange implementations since access of these
   * needs to be relatively quick.
   *
   * @param anEdit a document edit record
   * @return true if the edit was added
   */
  addEdit(anEdit: UndoableEdit): boolean {
    if ((this.changeLookup == null) && (this.edits.size() > 10)) {
      this.changeLookup = new Hashtable();
      let n = this.edits.size();
      for (let i = 0; i < n; i++) {
        let o = this.edits.elementAt(i);
        if ($J.isa(o, DocumentEvent$ElementChange)) {
          let ec = o;
          this.changeLookup.put(ec.getElement(), ec);
        }
      }
    }
    if ((this.changeLookup != null) && ($J.isa(anEdit, DocumentEvent$ElementChange))) {
      let ec = anEdit;
      this.changeLookup.put(ec.getElement(), ec);
    }
    return super.addEdit(anEdit);
  }
  /**
   * Returns the type of event.
   *
   * @return the event type as a DocumentEvent.EventType
   * @see DocumentEvent#getType
   */
  getType(): DocumentEvent$EventType {
    return this.type;
  }
  /**
   * Returns the offset within the document of the start of the change.
   *
   * @return the offset &gt;= 0
   * @see DocumentEvent#getOffset
   */
  getOffset(): number {
    return this.offset;
  }
  /**
   * Returns the length of the change.
   *
   * @return the length &gt;= 0
   * @see DocumentEvent#getLength
   */
  getLength(): number {
    return this.length_;
  }
  /**
   * Gets the document that sourced the change event.
   *
   * @return the document
   * @see DocumentEvent#getDocument
   */
  getDocument(): Document {
    return this.$outer;
  }
  /**
   * Gets the changes for an element.
   *
   * @param elem the element
   * @return the changes
   */
  getChange(elem: Element): DocumentEvent$ElementChange {
    if (this.changeLookup != null) {
      return this.changeLookup.get(elem);
    }
    let n = this.edits.size();
    for (let i = 0; i < n; i++) {
      let o = this.edits.elementAt(i);
      if ($J.isa(o, DocumentEvent$ElementChange)) {
        let c = o;
        if (elem.equals(c.getElement())) {
          return c;
        }
      }
    }
    return null;
  }
}

export class AbstractDocument$DefaultDocumentEventUndoableWrapper extends AbstractDocument$DefaultDocumentEvent {
  dde: AbstractDocument$DefaultDocumentEvent = null;
  _AbstractDocument$DefaultDocumentEventUndoableWrapper(dde: AbstractDocument$DefaultDocumentEvent): this {
    this._AbstractDocument$DefaultDocumentEvent(dde.getOffset(), dde.getLength(), dde.type);
    this.dde = dde;
    return this;
  }
  addEdit(anEdit: UndoableEdit): boolean {
    return this.dde.addEdit(anEdit);
  }
  replaceEdit(anEdit: UndoableEdit): boolean {
    return this.dde.replaceEdit(anEdit);
  }
}

/**
 * This event used when firing document changes while Undo/Redo
 * operations. It just wraps DefaultDocumentEvent and delegates
 * all calls to it except getType() which depends on operation
 * (Undo or Redo).
 */
export class AbstractDocument$UndoRedoDocumentEvent extends JObject {
  src: AbstractDocument$DefaultDocumentEvent = null;
  type: DocumentEvent$EventType = null;
}

/**
 * An implementation of ElementChange that can be added to the document
 * event.
 */
export class AbstractDocument$ElementEdit extends AbstractUndoableEdit {
  e: Element = null;
  index_: number = 0;
  removed: Element[] = null;
  added: Element[] = null;
  /**
   * Constructs an edit record.  This does not modify the element
   * so it can safely be used to <em>catch up</em> a view to the
   * current model state for views that just attached to a model.
   *
   * @param e the element
   * @param index the index into the model &gt;= 0
   * @param removed a set of elements that were removed
   * @param added a set of elements that were added
   */
  _AbstractDocument$ElementEdit(e: Element, index: number, removed: Element[], added: Element[]): this {
    this._AbstractUndoableEdit();
    this.e = e;
    this.index_ = index;
    this.removed = removed;
    this.added = added;
    return this;
  }
  /**
   * Returns the underlying element.
   *
   * @return the element
   */
  getElement(): Element {
    return this.e;
  }
  /**
   * Returns the index into the list of elements.
   *
   * @return the index &gt;= 0
   */
  getIndex(): number {
    return this.index_;
  }
  /**
   * Gets a list of children that were removed.
   *
   * @return the list
   */
  getChildrenRemoved(): Element[] {
    return this.removed;
  }
  /**
   * Gets a list of children that were added.
   *
   * @return the list
   */
  getChildrenAdded(): Element[] {
    return this.added;
  }
}

export class AbstractDocument$DefaultFilterBypass extends DocumentFilter$FilterBypass {
  _AbstractDocument$DefaultFilterBypass(): this {
    this._DocumentFilter$FilterBypass();
    return this;
  }
  getDocument(): Document {
    return this.$outer;
  }
  remove(offset: number, length: number): void {
    this.$outer.handleRemove(offset, length);
  }
  insertString(offset: number, string$: string, attr: AttributeSet): void {
    this.$outer.handleInsertString(offset, string$, attr);
  }
  replace(offset: number, length: number, text: string, attrs: AttributeSet): void {
    this.$outer.handleRemove(offset, length);
    this.$outer.handleInsertString(offset, text, attrs);
  }
}

let $AbstractDocument$1: any = null;
/** An anonymous class (AbstractDocument.java:152). */
function AbstractDocument$1(): any {
  return $AbstractDocument$1 ??= $J.local(class extends JObject {
    run(): string {
      return $J.system_getProperty(AbstractDocument.I18NProperty);
    }
  }, 'javax.swing.text.AbstractDocument$1', ['java.security.PrivilegedAction']);
}

$J.define(AbstractDocument, 'javax.swing.text.AbstractDocument', { kind: 'class', ifaces: ['javax.swing.text.Document', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'javax.swing.text.AbstractDocument$Content,javax.swing.text.AbstractDocument$AttributeContext': '_AbstractDocument$Content$AttributeContext', 'javax.swing.text.AbstractDocument$Content': '_AbstractDocument$Content' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$AbstractDocument', 'createBranchElement(javax.swing.text.Element,javax.swing.text.AttributeSet)': 'createBranchElement$Element$AttributeSet', 'createLeafElement(javax.swing.text.Element,javax.swing.text.AttributeSet,int,int)': 'createLeafElement$Element$AttributeSet$int$int', 'insertUpdate(javax.swing.text.AbstractDocument$DefaultDocumentEvent,javax.swing.text.AttributeSet)': 'insertUpdate$DefaultDocumentEvent$AttributeSet', 'getText(int,int,javax.swing.text.Segment)': 'getText$int$int$Segment', 'getText(int,int)': 'getText$int$int', 'fireUndoableEditUpdate(javax.swing.event.UndoableEditEvent)': 'fireUndoableEditUpdate$UndoableEditEvent', 'fireChangedUpdate(javax.swing.event.DocumentEvent)': 'fireChangedUpdate$DocumentEvent' }, clinit: true, lazy: ['defaultI18NProperty', 'MultiByteProperty'] });
$J.define(AbstractDocument$Content, 'javax.swing.text.AbstractDocument$Content', { kind: 'interface' });
$J.define(AbstractDocument$AttributeContext, 'javax.swing.text.AbstractDocument$AttributeContext', { kind: 'interface', meths: { 'removeAttributes(javax.swing.text.AttributeSet,javax.swing.text.AttributeSet)': 'removeAttributes$AttributeSet$AttributeSet', 'removeAttributes(javax.swing.text.AttributeSet,java.util.Enumeration)': 'removeAttributes$AttributeSet$Enumeration' } });
$J.define(AbstractDocument$AbstractElement, 'javax.swing.text.AbstractDocument$AbstractElement', { kind: 'class', ifaces: ['javax.swing.text.Element', 'javax.swing.text.MutableAttributeSet', 'java.io.Serializable', 'javax.swing.tree.TreeNode'], sup: 'java.lang.Object', ctors: { 'javax.swing.text.Element,javax.swing.text.AttributeSet': '_AbstractDocument$AbstractElement' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$AbstractDocument_AbstractElement', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$AbstractDocument_AbstractElement', 'removeAttributes(javax.swing.text.AttributeSet)': 'removeAttributes$AttributeSet', 'removeAttributes(java.util.Enumeration)': 'removeAttributes$Enumeration' }, inner: true });
$J.define(AbstractDocument$BranchElement, 'javax.swing.text.AbstractDocument$BranchElement', { kind: 'class', sup: 'javax.swing.text.AbstractDocument$AbstractElement', ctors: { 'javax.swing.text.Element,javax.swing.text.AttributeSet': '_AbstractDocument$BranchElement' }, inner: true });
$J.define(AbstractDocument$LeafElement, 'javax.swing.text.AbstractDocument$LeafElement', { kind: 'class', sup: 'javax.swing.text.AbstractDocument$AbstractElement', ctors: { 'javax.swing.text.Element,javax.swing.text.AttributeSet,int,int': '_AbstractDocument$LeafElement' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$AbstractDocument_LeafElement', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$AbstractDocument_LeafElement' }, inner: true });
$J.define(AbstractDocument$BidiRootElement, 'javax.swing.text.AbstractDocument$BidiRootElement', { kind: 'class', sup: 'javax.swing.text.AbstractDocument$BranchElement', ctors: { '': '_AbstractDocument$BidiRootElement' }, inner: true });
$J.define(AbstractDocument$BidiElement, 'javax.swing.text.AbstractDocument$BidiElement', { kind: 'class', sup: 'javax.swing.text.AbstractDocument$LeafElement', ctors: { 'javax.swing.text.Element,int,int,int': '_AbstractDocument$BidiElement' }, inner: true });
$J.define(AbstractDocument$DefaultDocumentEvent, 'javax.swing.text.AbstractDocument$DefaultDocumentEvent', { kind: 'class', ifaces: ['javax.swing.event.DocumentEvent'], sup: 'javax.swing.undo.CompoundEdit', ctors: { 'int,int,javax.swing.event.DocumentEvent$EventType': '_AbstractDocument$DefaultDocumentEvent' }, inner: true });
$J.define(AbstractDocument$DefaultDocumentEventUndoableWrapper, 'javax.swing.text.AbstractDocument$DefaultDocumentEventUndoableWrapper', { kind: 'class', ifaces: ['javax.swing.undo.UndoableEdit', 'sun.swing.text.UndoableEditLockSupport'], sup: 'javax.swing.text.AbstractDocument$DefaultDocumentEvent', ctors: { 'javax.swing.text.AbstractDocument$DefaultDocumentEvent': '_AbstractDocument$DefaultDocumentEventUndoableWrapper' }, inner: true });
$J.define(AbstractDocument$UndoRedoDocumentEvent, 'javax.swing.text.AbstractDocument$UndoRedoDocumentEvent', { kind: 'class', ifaces: ['javax.swing.event.DocumentEvent'], sup: 'java.lang.Object', ctors: { 'javax.swing.text.AbstractDocument$DefaultDocumentEvent,boolean': '_AbstractDocument$UndoRedoDocumentEvent' }, inner: true });
$J.define(AbstractDocument$ElementEdit, 'javax.swing.text.AbstractDocument$ElementEdit', { kind: 'class', ifaces: ['javax.swing.event.DocumentEvent$ElementChange'], sup: 'javax.swing.undo.AbstractUndoableEdit', ctors: { 'javax.swing.text.Element,int,javax.swing.text.Element[],javax.swing.text.Element[]': '_AbstractDocument$ElementEdit' } });
$J.define(AbstractDocument$DefaultFilterBypass, 'javax.swing.text.AbstractDocument$DefaultFilterBypass', { kind: 'class', sup: 'javax.swing.text.DocumentFilter$FilterBypass', ctors: { '': '_AbstractDocument$DefaultFilterBypass' }, inner: true });
$J.module(() => {
  TextAttribute = $J.load('java.awt.font.TextAttribute');
  DocumentEvent$ElementChange = $J.load('javax.swing.event.DocumentEvent$ElementChange');
  DocumentEvent$EventType = $J.load('javax.swing.event.DocumentEvent$EventType');
  DocumentListener = $J.load('javax.swing.event.DocumentListener');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  UndoableEditEvent = $J.load('javax.swing.event.UndoableEditEvent');
  UndoableEditListener = $J.load('javax.swing.event.UndoableEditListener');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  SegmentCache = $J.load('javax.swing.text.SegmentCache');
  SimpleAttributeSet = $J.load('javax.swing.text.SimpleAttributeSet');
  StateInvariantError = $J.load('javax.swing.text.StateInvariantError');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  StyleContext = $J.load('javax.swing.text.StyleContext');
  Utilities = $J.load('javax.swing.text.Utilities');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
