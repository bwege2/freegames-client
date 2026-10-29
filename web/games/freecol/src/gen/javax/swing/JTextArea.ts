// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JTextArea.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException } from '../../../jre/index.ts';
import { JTextComponent } from './text/JTextComponent.ts';
import { JTextComponent$AccessibleJTextComponent } from './text/JTextComponent.ts';

let Dimension, JComponent, LookAndFeel, SwingConstants, BadLocationException, PlainDocument;

/**
 * A <code>JTextArea</code> is a multi-line area that displays plain text.
 * It is intended to be a lightweight component that provides source
 * compatibility with the <code>java.awt.TextArea</code> class where it can
 * reasonably do so.
 * You can find information and examples of using all the text components in
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/text.html">Using Text Components</a>,
 * a section in <em>The Java Tutorial.</em>
 *
 * <p>
 * This component has capabilities not found in the
 * <code>java.awt.TextArea</code> class.  The superclass should be
 * consulted for additional capabilities.
 * Alternative multi-line text classes with
 * more capabilities are <code>JTextPane</code> and <code>JEditorPane</code>.
 * <p>
 * The <code>java.awt.TextArea</code> internally handles scrolling.
 * <code>JTextArea</code> is different in that it doesn't manage scrolling,
 * but implements the swing <code>Scrollable</code> interface.  This allows it
 * to be placed inside a <code>JScrollPane</code> if scrolling
 * behavior is desired, and used directly if scrolling is not desired.
 * <p>
 * The <code>java.awt.TextArea</code> has the ability to do line wrapping.
 * This was controlled by the horizontal scrolling policy.  Since
 * scrolling is not done by <code>JTextArea</code> directly, backward
 * compatibility must be provided another way.  <code>JTextArea</code> has
 * a bound property for line wrapping that controls whether or
 * not it will wrap lines.  By default, the line wrapping property
 * is set to false (not wrapped).
 * <p>
 * <code>java.awt.TextArea</code> has two properties <code>rows</code>
 * and <code>columns</code> that are used to determine the preferred size.
 * <code>JTextArea</code> uses these properties to indicate the
 * preferred size of the viewport when placed inside a <code>JScrollPane</code>
 * to match the functionality provided by <code>java.awt.TextArea</code>.
 * <code>JTextArea</code> has a preferred size of what is needed to
 * display all of the text, so that it functions properly inside of
 * a <code>JScrollPane</code>.  If the value for <code>rows</code>
 * or <code>columns</code> is equal to zero,
 * the preferred size along that axis is used for
 * the viewport preferred size along the same axis.
 * <p>
 * The <code>java.awt.TextArea</code> could be monitored for changes by adding
 * a <code>TextListener</code> for <code>TextEvent</code>s.
 * In the <code>JTextComponent</code> based
 * components, changes are broadcasted from the model via a
 * <code>DocumentEvent</code> to <code>DocumentListeners</code>.
 * The <code>DocumentEvent</code> gives
 * the location of the change and the kind of change if desired.
 * The code fragment might look something like:
 * <pre>
 *    DocumentListener myListener = ??;
 *    JTextArea myArea = ??;
 *    myArea.getDocument().addDocumentListener(myListener);
 * </pre>
 *
 * <dl>
 * <dt><b>Newlines</b>
 * <dd>
 * For a discussion on how newlines are handled, see
 * <a href="text/DefaultEditorKit.html">DefaultEditorKit</a>.
 * </dl>
 *
 * <p>
 * <strong>Warning:</strong> Swing is not thread safe. For more
 * information see <a
 * href="package-summary.html#threading">Swing's Threading
 * Policy</a>.
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
 * @see JTextPane
 * @see JEditorPane
 * @since 1.2
 */
export class JTextArea extends JTextComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'TextAreaUI';
  rows: number = 0;
  columns: number = 0;
  columnWidth: number = 0;
  rowHeight: number = 0;
  wrap_: boolean = false;
  word: boolean = false;
  /**
   * Constructs a new TextArea.  A default model is set, the initial string
   * is null, and rows/columns are set to 0.
   */
  _JTextArea$(): this {
    this._JTextArea$Document$String$int$int(null, null, 0, 0);
    return this;
  }
  /**
   * Constructs a new TextArea with the specified text displayed.
   * A default model is created and rows/columns are set to 0.
   *
   * @param text the text to be displayed, or null
   */
  _JTextArea$String(text: string): this {
    this._JTextArea$Document$String$int$int(null, text, 0, 0);
    return this;
  }
  /**
   * Constructs a new empty TextArea with the specified number of
   * rows and columns.  A default model is created, and the initial
   * string is null.
   *
   * @param rows the number of rows &gt;= 0
   * @param columns the number of columns &gt;= 0
   * @throws IllegalArgumentException if the rows or columns
   *  arguments are negative.
   */
  _JTextArea$int$int(rows: number, columns: number): this {
    this._JTextArea$Document$String$int$int(null, null, rows, columns);
    return this;
  }
  /**
   * Constructs a new JTextArea with the specified number of rows
   * and columns, and the given model.  All of the constructors
   * feed through this constructor.
   *
   * @param doc the model to use, or create a default one if null
   * @param text the text to be displayed, null if none
   * @param rows the number of rows &gt;= 0
   * @param columns the number of columns &gt;= 0
   * @throws IllegalArgumentException if the rows or columns
   *  arguments are negative.
   */
  _JTextArea$Document$String$int$int(doc: Document, text: string, rows: number, columns: number): this {
    this._JTextComponent();
    this.rows = rows;
    this.columns = columns;
    if (doc == null) {
      doc = this.createDefaultModel();
    }
    this.setDocument(doc);
    if (text != null) {
      this.setText(text);
      this.select(0, 0);
    }
    if (rows < 0) {
      throw new IllegalArgumentException('rows: ' + rows);
    }
    if (columns < 0) {
      throw new IllegalArgumentException('columns: ' + columns);
    }
    LookAndFeel.installProperty(this, 'focusTraversalKeysForward', JComponent.getManagingFocusForwardTraversalKeys());
    LookAndFeel.installProperty(this, 'focusTraversalKeysBackward', JComponent.getManagingFocusBackwardTraversalKeys());
    return this;
  }
  /**
   * Returns the class ID for the UI.
   *
   * @return the string "TextAreaUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JTextArea.uiClassID;
  }
  /**
   * Creates the default implementation of the model
   * to be used at construction if one isn't explicitly
   * given.  A new instance of PlainDocument is returned.
   *
   * @return the default document model
   */
  createDefaultModel(): Document {
    return new PlainDocument()._PlainDocument$();
  }
  /**
   * Sets the line-wrapping policy of the text area.  If set
   * to true the lines will be wrapped if they are too long
   * to fit within the allocated width.  If set to false,
   * the lines will always be unwrapped.  A <code>PropertyChange</code>
   * event ("lineWrap") is fired when the policy is changed.
   * By default this property is false.
   *
   * @param wrap indicates if lines should be wrapped
   * @see #getLineWrap
   */
  setLineWrap(wrap: boolean): void {
    let old = this.wrap_;
    this.wrap_ = wrap;
    this.firePropertyChange$String$boolean$boolean('lineWrap', old, wrap);
  }
  /**
   * Gets the line-wrapping policy of the text area.  If set
   * to true the lines will be wrapped if they are too long
   * to fit within the allocated width.  If set to false,
   * the lines will always be unwrapped.
   *
   * @return if lines will be wrapped
   */
  getLineWrap(): boolean {
    return this.wrap_;
  }
  /**
   * Sets the style of wrapping used if the text area is wrapping
   * lines.  If set to true the lines will be wrapped at word
   * boundaries (whitespace) if they are too long
   * to fit within the allocated width.  If set to false,
   * the lines will be wrapped at character boundaries.
   * By default this property is false.
   *
   * @param word indicates if word boundaries should be used
   *   for line wrapping
   * @see #getWrapStyleWord
   */
  setWrapStyleWord(word: boolean): void {
    let old = this.word;
    this.word = word;
    this.firePropertyChange$String$boolean$boolean('wrapStyleWord', old, word);
  }
  /**
   * Gets the style of wrapping used if the text area is wrapping
   * lines.  If set to true the lines will be wrapped at word
   * boundaries (ie whitespace) if they are too long
   * to fit within the allocated width.  If set to false,
   * the lines will be wrapped at character boundaries.
   *
   * @return if the wrap style should be word boundaries
   *  instead of character boundaries
   * @see #setWrapStyleWord
   */
  getWrapStyleWord(): boolean {
    return this.word;
  }
  /**
   * Inserts the specified text at the specified position.  Does nothing
   * if the model is null or if the text is null or empty.
   *
   * @param str the text to insert
   * @param pos the position at which to insert &gt;= 0
   * @throws IllegalArgumentException  if pos is an
   *  invalid position in the model
   * @see TextComponent#setText
   * @see #replaceRange
   */
  insert(str: string, pos: number): void {
    let doc = this.getDocument();
    if (doc != null) {
      try {
        doc.insertString(pos, str, null);
      } catch ($e0) {
        if ($J.isa($e0, BadLocationException)) {
          let e = $J.exc($e0);
          throw new IllegalArgumentException(e.getMessage());
        } else {
          throw $e0;
        }
      }
    }
  }
  /**
   * Appends the given text to the end of the document.  Does nothing if
   * the model is null or the string is null or empty.
   *
   * @param str the text to insert
   * @see #insert
   */
  append(str: string): void {
    let doc = this.getDocument();
    if (doc != null) {
      try {
        doc.insertString(doc.getLength(), str, null);
      } catch ($e1) {
        if ($J.isa($e1, BadLocationException)) {
          let e = $J.exc($e1);
        } else {
          throw $e1;
        }
      }
    }
  }
  /**
   * Defines the meaning of the height of a row.  This defaults to
   * the height of the font.
   *
   * @return the height &gt;= 1
   */
  getRowHeight(): number {
    if (this.rowHeight === 0) {
      let metrics = this.getFontMetrics(this.getFont());
      this.rowHeight = metrics.getHeight();
    }
    return this.rowHeight;
  }
  /**
   * Returns the number of columns in the TextArea.
   *
   * @return number of columns &gt;= 0
   */
  getColumns(): number {
    return this.columns;
  }
  /**
   * Sets the number of columns for this TextArea.  Does an invalidate()
   * after setting the new value.
   *
   * @param columns the number of columns &gt;= 0
   * @throws IllegalArgumentException if columns is less than 0
   * @see #getColumns
   */
  setColumns(columns: number): void {
    let oldVal = this.columns;
    if (columns < 0) {
      throw new IllegalArgumentException('columns less than zero.');
    }
    if (columns !== oldVal) {
      this.columns = columns;
      this.invalidate();
    }
  }
  /**
   * Gets column width.
   * The meaning of what a column is can be considered a fairly weak
   * notion for some fonts.  This method is used to define the width
   * of a column.  By default this is defined to be the width of the
   * character <em>m</em> for the font used.  This method can be
   * redefined to be some alternative amount.
   *
   * @return the column width &gt;= 1
   */
  getColumnWidth(): number {
    if (this.columnWidth === 0) {
      let metrics = this.getFontMetrics(this.getFont());
      this.columnWidth = metrics.charWidth$char(109 /* 'm' */);
    }
    return this.columnWidth;
  }
  /**
   * Returns the preferred size of the TextArea.  This is the
   * maximum of the size needed to display the text and the
   * size requested for the viewport.
   *
   * @return the size
   */
  getPreferredSize$(): Dimension {
    let d = super.getPreferredSize$();
    d = (d == null) ? new Dimension()._Dimension$int$int(400, 400) : d;
    let insets = this.getInsets$();
    if (this.columns !== 0) {
      d.width_ = Math.max(d.width_, (Math.imul(this.columns, this.getColumnWidth()) + insets.left + insets.right) | 0);
    }
    if (this.rows !== 0) {
      d.height_ = Math.max(d.height_, (Math.imul(this.rows, this.getRowHeight()) + insets.top + insets.bottom) | 0);
    }
    return d;
  }
  /**
   * Sets the current font.  This removes cached row height and column
   * width so the new font will be reflected, and calls revalidate().
   *
   * @param f the font to use as the current font
   */
  setFont(f: Font): void {
    super.setFont(f);
    this.rowHeight = 0;
    this.columnWidth = 0;
  }
  /**
   * Returns a string representation of this JTextArea. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this JTextArea.
   */
  paramString(): string {
    let wrapString = (this.wrap_ ? 'true' : 'false');
    let wordString = (this.word ? 'true' : 'false');
    return super.paramString() + ',columns=' + this.columns + ',columWidth=' + this.columnWidth + ',rows=' + this.rows + ',rowHeight=' + this.rowHeight + ',word=' + wordString + ',wrap=' + wrapString;
  }
  /**
   * Returns true if a viewport should always force the width of this
   * Scrollable to match the width of the viewport.  This is implemented
   * to return true if the line wrapping policy is true, and false
   * if lines are not being wrapped.
   *
   * @return true if a viewport should force the Scrollables width
   * to match its own.
   */
  getScrollableTracksViewportWidth(): boolean {
    return (this.wrap_) ? true : super.getScrollableTracksViewportWidth();
  }
  /**
   * Returns the preferred size of the viewport if this component
   * is embedded in a JScrollPane.  This uses the desired column
   * and row settings if they have been set, otherwise the superclass
   * behavior is used.
   *
   * @return The preferredSize of a JViewport whose view is this Scrollable.
   * @see JViewport#getPreferredSize
   */
  getPreferredScrollableViewportSize(): Dimension {
    let size = super.getPreferredScrollableViewportSize();
    size = (size == null) ? new Dimension()._Dimension$int$int(400, 400) : size;
    let insets = this.getInsets$();
    size.width_ = (this.columns === 0) ? size.width_ : (Math.imul(this.columns, this.getColumnWidth()) + insets.left + insets.right) | 0;
    size.height_ = (this.rows === 0) ? size.height_ : (Math.imul(this.rows, this.getRowHeight()) + insets.top + insets.bottom) | 0;
    return size;
  }
  /**
   * Components that display logical rows or columns should compute
   * the scroll increment that will completely expose one new row
   * or column, depending on the value of orientation.  This is implemented
   * to use the values returned by the <code>getRowHeight</code> and
   * <code>getColumnWidth</code> methods.
   * <p>
   * Scrolling containers, like JScrollPane, will use this method
   * each time the user requests a unit scroll.
   *
   * @param visibleRect the view area visible within the viewport
   * @param orientation Either SwingConstants.VERTICAL or
   *   SwingConstants.HORIZONTAL.
   * @param direction Less than zero to scroll up/left,
   *   greater than zero for down/right.
   * @return The "unit" increment for scrolling in the specified direction
   * @throws IllegalArgumentException for an invalid orientation
   * @see JScrollBar#setUnitIncrement
   * @see #getRowHeight
   * @see #getColumnWidth
   */
  getScrollableUnitIncrement(visibleRect: Rectangle, orientation: number, direction: number): number {
    switch (orientation) {
      case SwingConstants.VERTICAL:
        return this.getRowHeight();
      case SwingConstants.HORIZONTAL:
        return this.getColumnWidth();
      default:
        throw new IllegalArgumentException('Invalid orientation: ' + orientation);
    }
  }
  /**
   * Gets the AccessibleContext associated with this JTextArea.
   * For JTextAreas, the AccessibleContext takes the form of an
   * AccessibleJTextArea.
   * A new AccessibleJTextArea instance is created if necessary.
   *
   * @return an AccessibleJTextArea that serves as the
   *         AccessibleContext of this JTextArea
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JTextArea$AccessibleJTextArea().$o(this)._JTextArea$AccessibleJTextArea();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JTextArea</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to text area user-interface
 * elements.
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
export class JTextArea$AccessibleJTextArea extends JTextComponent$AccessibleJTextComponent {
  /**
   * Constructs an {@code AccessibleJTextArea}.
   */
  _JTextArea$AccessibleJTextArea(): this {
    this._JTextComponent$AccessibleJTextComponent();
    return this;
  }
}

$J.define(JTextArea, 'javax.swing.JTextArea', { kind: 'class', sup: 'javax.swing.text.JTextComponent', ctors: { 'javax.swing.text.Document,java.lang.String,int,int': '_JTextArea$Document$String$int$int', 'javax.swing.text.Document': '_JTextArea$Document', 'java.lang.String,int,int': '_JTextArea$String$int$int', 'int,int': '_JTextArea$int$int', 'java.lang.String': '_JTextArea$String', '': '_JTextArea$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JTextArea', 'getPreferredSize()': 'getPreferredSize$' } });
$J.define(JTextArea$AccessibleJTextArea, 'javax.swing.JTextArea$AccessibleJTextArea', { kind: 'class', sup: 'javax.swing.text.JTextComponent$AccessibleJTextComponent', ctors: { '': '_JTextArea$AccessibleJTextArea' }, meths: { 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  JComponent = $J.load('javax.swing.JComponent');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  PlainDocument = $J.load('javax.swing.text.PlainDocument');
});
