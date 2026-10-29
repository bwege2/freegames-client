// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JTextField.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject } from '../../../jre/index.ts';
import { JTextComponent } from './text/JTextComponent.ts';
import { ActionPropertyChangeListener } from './ActionPropertyChangeListener.ts';
import { TextAction } from './text/TextAction.ts';
import { JTextComponent$AccessibleJTextComponent } from './text/JTextComponent.ts';

let EventQueue, ActionEvent, ActionListener, InputEvent, AbstractAction, Action, DefaultBoundedRangeModel, JViewport, SwingConstants, SwingUtilities, PlainDocument;

/**
 * <code>JTextField</code> is a lightweight component that allows the editing
 * of a single line of text.
 * For information on and examples of using text fields,
 * see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/textfield.html">How to Use Text Fields</a>
 * in <em>The Java Tutorial.</em>
 *
 * <p>
 * <code>JTextField</code> is intended to be source-compatible
 * with <code>java.awt.TextField</code> where it is reasonable to do so.  This
 * component has capabilities not found in the <code>java.awt.TextField</code>
 * class.  The superclass should be consulted for additional capabilities.
 * <p>
 * <code>JTextField</code> has a method to establish the string used as the
 * command string for the action event that gets fired.  The
 * <code>java.awt.TextField</code> used the text of the field as the command
 * string for the <code>ActionEvent</code>.
 * <code>JTextField</code> will use the command
 * string set with the <code>setActionCommand</code> method if not <code>null</code>,
 * otherwise it will use the text of the field as a compatibility with
 * <code>java.awt.TextField</code>.
 * <p>
 * The method <code>setEchoChar</code> and <code>getEchoChar</code>
 * are not provided directly to avoid a new implementation of a
 * pluggable look-and-feel inadvertently exposing password characters.
 * To provide password-like services a separate class <code>JPasswordField</code>
 * extends <code>JTextField</code> to provide this service with an independently
 * pluggable look-and-feel.
 * <p>
 * The <code>java.awt.TextField</code> could be monitored for changes by adding
 * a <code>TextListener</code> for <code>TextEvent</code>'s.
 * In the <code>JTextComponent</code> based
 * components, changes are broadcasted from the model via a
 * <code>DocumentEvent</code> to <code>DocumentListeners</code>.
 * The <code>DocumentEvent</code> gives
 * the location of the change and the kind of change if desired.
 * The code fragment might look something like:
 * <pre><code>
 * &nbsp;   DocumentListener myListener = ??;
 * &nbsp;   JTextField myArea = ??;
 * &nbsp;   myArea.getDocument().addDocumentListener(myListener);
 * </code></pre>
 * <p>
 * The horizontal alignment of <code>JTextField</code> can be set to be left
 * justified, leading justified, centered, right justified or trailing justified.
 * Right/trailing justification is useful if the required size
 * of the field text is smaller than the size allocated to it.
 * This is determined by the <code>setHorizontalAlignment</code>
 * and <code>getHorizontalAlignment</code> methods.  The default
 * is to be leading justified.
 * <p>
 * How the text field consumes VK_ENTER events depends
 * on whether the text field has any action listeners.
 * If so, then VK_ENTER results in the listeners
 * getting an ActionEvent,
 * and the VK_ENTER event is consumed.
 * This is compatible with how AWT text fields handle VK_ENTER events.
 * If the text field has no action listeners, then as of v 1.3 the VK_ENTER
 * event is not consumed.  Instead, the bindings of ancestor components
 * are processed, which enables the default button feature of
 * JFC/Swing to work.
 * <p>
 * Customized fields can easily be created by extending the model and
 * changing the default model provided.  For example, the following piece
 * of code will create a field that holds only upper case characters.  It
 * will work even if text is pasted into from the clipboard or it is altered via
 * programmatic changes.
 * <pre><code>
 *
 * &nbsp;public class UpperCaseField extends JTextField {
 * &nbsp;
 * &nbsp;    public UpperCaseField(int cols) {
 * &nbsp;        super(cols);
 * &nbsp;    }
 * &nbsp;
 * &nbsp;    protected Document createDefaultModel() {
 * &nbsp;        return new UpperCaseDocument();
 * &nbsp;    }
 * &nbsp;
 * &nbsp;    static class UpperCaseDocument extends PlainDocument {
 * &nbsp;
 * &nbsp;        public void insertString(int offs, String str, AttributeSet a)
 * &nbsp;            throws BadLocationException {
 * &nbsp;
 * &nbsp;            if (str == null) {
 * &nbsp;                return;
 * &nbsp;            }
 * &nbsp;            char[] upper = str.toCharArray();
 * &nbsp;            for (int i = 0; i &lt; upper.length; i++) {
 * &nbsp;                upper[i] = Character.toUpperCase(upper[i]);
 * &nbsp;            }
 * &nbsp;            super.insertString(offs, new String(upper), a);
 * &nbsp;        }
 * &nbsp;    }
 * &nbsp;}
 *
 * </code></pre>
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
 * @see #setActionCommand
 * @see JPasswordField
 * @see #addActionListener
 * @since 1.2
 */
export class JTextField extends JTextComponent {
  action_: Action = null;
  actionPropertyChangeListener: PropertyChangeListener = null;
  /**
   * Name of the action to send notification that the
   * contents of the field have been accepted.  Typically
   * this is bound to a carriage-return.
   */
  static readonly notifyAction: string = 'notify-field-accept';
  visibility: BoundedRangeModel = null;
  horizontalAlignment: number = 0;
  columns: number = 0;
  columnWidth: number = 0;
  command: string = null;
  static defaultActions: Action[] = null;
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'TextFieldUI';
  $init_JTextField() {
    this.horizontalAlignment = SwingConstants.LEADING;
  }
  /**
   * Constructs a new <code>TextField</code>.  A default model is created,
   * the initial string is <code>null</code>,
   * and the number of columns is set to 0.
   */
  _JTextField$(): this {
    this._JTextField$Document$String$int(null, null, 0);
    return this;
  }
  /**
   * Constructs a new <code>TextField</code> initialized with the
   * specified text. A default model is created and the number of
   * columns is 0.
   *
   * @param text the text to be displayed, or <code>null</code>
   */
  _JTextField$String(text: string): this {
    this._JTextField$Document$String$int(null, text, 0);
    return this;
  }
  /**
   * Constructs a new empty <code>TextField</code> with the specified
   * number of columns.
   * A default model is created and the initial string is set to
   * <code>null</code>.
   *
   * @param columns  the number of columns to use to calculate
   *   the preferred width; if columns is set to zero, the
   *   preferred width will be whatever naturally results from
   *   the component implementation
   */
  _JTextField$int(columns: number): this {
    this._JTextField$Document$String$int(null, null, columns);
    return this;
  }
  /**
   * Constructs a new <code>TextField</code> initialized with the
   * specified text and columns.  A default model is created.
   *
   * @param text the text to be displayed, or <code>null</code>
   * @param columns  the number of columns to use to calculate
   *   the preferred width; if columns is set to zero, the
   *   preferred width will be whatever naturally results from
   *   the component implementation
   */
  _JTextField$String$int(text: string, columns: number): this {
    this._JTextField$Document$String$int(null, text, columns);
    return this;
  }
  /**
   * Constructs a new <code>JTextField</code> that uses the given text
   * storage model and the given number of columns.
   * This is the constructor through which the other constructors feed.
   * If the document is <code>null</code>, a default model is created.
   *
   * @param doc  the text storage to use; if this is <code>null</code>,
   *          a default will be provided by calling the
   *          <code>createDefaultModel</code> method
   * @param text  the initial string to display, or <code>null</code>
   * @param columns  the number of columns to use to calculate
   *   the preferred width &gt;= 0; if <code>columns</code>
   *   is set to zero, the preferred width will be whatever
   *   naturally results from the component implementation
   * @throws IllegalArgumentException if <code>columns</code> &lt; 0
   */
  _JTextField$Document$String$int(doc: Document, text: string, columns: number): this {
    this._JTextComponent();
    this.$init_JTextField();
    if (columns < 0) {
      throw new IllegalArgumentException('columns less than zero.');
    }
    this.visibility = new DefaultBoundedRangeModel()._DefaultBoundedRangeModel$();
    this.visibility.addChangeListener($J.fn(new JTextField$ScrollRepainter().$o(this)._JTextField$ScrollRepainter(), 'stateChanged'));
    this.columns = columns;
    if (doc == null) {
      doc = this.createDefaultModel();
    }
    this.setDocument(doc);
    if (text != null) {
      this.setText(text);
    }
    return this;
  }
  /**
   * Gets the class ID for a UI.
   *
   * @return the string "TextFieldUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JTextField.uiClassID;
  }
  /**
   * Associates the editor with a text document.
   * The currently registered factory is used to build a view for
   * the document, which gets displayed by the editor after revalidation.
   * A PropertyChange event ("document") is propagated to each listener.
   *
   * @param doc  the document to display/edit
   * @see #getDocument
   */
  setDocument(doc: Document): void {
    if (doc != null) {
      doc.putProperty('filterNewlines', true);
    }
    super.setDocument(doc);
  }
  /**
   * Calls to <code>revalidate</code> that come from within the
   * textfield itself will
   * be handled by validating the textfield, unless the textfield
   * is contained within a <code>JViewport</code>,
   * in which case this returns false.
   *
   * @return if the parent of this textfield is a <code>JViewPort</code>
   *          return false, otherwise return true
   *
   * @see JComponent#revalidate
   * @see JComponent#isValidateRoot
   * @see java.awt.Container#isValidateRoot
   */
  isValidateRoot$(): boolean {
    return !(SwingUtilities.getUnwrappedParent(this) instanceof JViewport);
  }
  /**
   * Returns the horizontal alignment of the text.
   * Valid keys are:
   * <ul>
   * <li><code>JTextField.LEFT</code>
   * <li><code>JTextField.CENTER</code>
   * <li><code>JTextField.RIGHT</code>
   * <li><code>JTextField.LEADING</code>
   * <li><code>JTextField.TRAILING</code>
   * </ul>
   *
   * @return the horizontal alignment
   */
  getHorizontalAlignment(): number {
    return this.horizontalAlignment;
  }
  /**
   * Sets the horizontal alignment of the text.
   * Valid keys are:
   * <ul>
   * <li><code>JTextField.LEFT</code>
   * <li><code>JTextField.CENTER</code>
   * <li><code>JTextField.RIGHT</code>
   * <li><code>JTextField.LEADING</code>
   * <li><code>JTextField.TRAILING</code>
   * </ul>
   * <code>invalidate</code> and <code>repaint</code> are called when the
   * alignment is set,
   * and a <code>PropertyChange</code> event ("horizontalAlignment") is fired.
   *
   * @param alignment the alignment
   * @throws IllegalArgumentException if <code>alignment</code>
   *  is not a valid key
   */
  setHorizontalAlignment(alignment: number): void {
    if (alignment === this.horizontalAlignment) {
      return;
    }
    let oldValue = this.horizontalAlignment;
    if ((alignment === SwingConstants.LEFT) || (alignment === SwingConstants.CENTER) || (alignment === SwingConstants.RIGHT) || (alignment === SwingConstants.LEADING) || (alignment === SwingConstants.TRAILING)) {
      this.horizontalAlignment = alignment;
    } else {
      throw new IllegalArgumentException('horizontalAlignment');
    }
    this.firePropertyChange$String$int$int('horizontalAlignment', oldValue, this.horizontalAlignment);
    this.invalidate();
    this.repaint$();
  }
  /**
   * Creates the default implementation of the model
   * to be used at construction if one isn't explicitly
   * given.  An instance of <code>PlainDocument</code> is returned.
   *
   * @return the default model implementation
   */
  createDefaultModel(): Document {
    return new PlainDocument()._PlainDocument$();
  }
  /**
   * Sets the number of columns in this <code>TextField</code>,
   * and then invalidate the layout.
   *
   * @param columns the number of columns &gt;= 0
   * @throws IllegalArgumentException if <code>columns</code>
   *          is less than 0
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
   * Returns the column width.
   * The meaning of what a column is can be considered a fairly weak
   * notion for some fonts.  This method is used to define the width
   * of a column.  By default this is defined to be the width of the
   * character <em>m</em> for the font used.  This method can be
   * redefined to be some alternative amount
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
   * Returns the preferred size <code>Dimensions</code> needed for this
   * <code>TextField</code>.  If a non-zero number of columns has been
   * set, the width is set to the columns multiplied by
   * the column width.
   *
   * @return the dimension of this textfield
   */
  getPreferredSize$(): Dimension {
    let size = super.getPreferredSize$();
    if (this.columns !== 0) {
      let insets = this.getInsets$();
      size.width_ = (Math.imul(this.columns, this.getColumnWidth()) + insets.left + insets.right) | 0;
    }
    return size;
  }
  /**
   * Sets the current font.  This removes cached row height and column
   * width so the new font will be reflected.
   * <code>revalidate</code> is called after setting the font.
   *
   * @param f the new font
   */
  setFont(f: Font): void {
    super.setFont(f);
    this.columnWidth = 0;
  }
  /**
   * Adds the specified action listener to receive
   * action events from this textfield.
   *
   * @param l the action listener to be added
   */
  addActionListener(l: ActionListener): void {
    this.listenerList.add($J.cls(ActionListener), l);
  }
  /**
   * Removes the specified action listener so that it no longer
   * receives action events from this textfield.
   *
   * @param l the action listener to be removed
   */
  removeActionListener(l: ActionListener): void {
    if ((l != null) && (this.getAction() === l)) {
      this.setAction(null);
    } else {
      this.listenerList.remove($J.cls(ActionListener), l);
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created.
   * The listener list is processed in last to
   * first order.
   * @see EventListenerList
   */
  fireActionPerformed(): void {
    let listeners = this.listenerList.getListenerList();
    let modifiers = 0;
    let currentEvent = EventQueue.getCurrentEvent();
    if (currentEvent instanceof InputEvent) {
      modifiers = (currentEvent).getModifiers();
    } else if (currentEvent instanceof ActionEvent) {
      modifiers = (currentEvent).getModifiers();
    }
    let e = new ActionEvent()._ActionEvent$Object$int$String$long$int(this, ActionEvent.ACTION_PERFORMED, (this.command != null) ? this.command : this.getText$(), EventQueue.getMostRecentEventTime(), modifiers);
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ActionListener)) {
        $J.fn((listeners[(i + 1) | 0]), 'actionPerformed')(e);
      }
    }
  }
  /**
   * Sets the command string used for action events.
   *
   * @param command the command string
   */
  setActionCommand(command: string): void {
    this.command = command;
  }
  /**
   * Sets the <code>Action</code> for the <code>ActionEvent</code> source.
   * The new <code>Action</code> replaces
   * any previously set <code>Action</code> but does not affect
   * <code>ActionListeners</code> independently
   * added with <code>addActionListener</code>.
   * If the <code>Action</code> is already a registered
   * <code>ActionListener</code>
   * for the <code>ActionEvent</code> source, it is not re-registered.
   * <p>
   * Setting the <code>Action</code> results in immediately changing
   * all the properties described in <a href="Action.html#buttonActions">
   * Swing Components Supporting <code>Action</code></a>.
   * Subsequently, the textfield's properties are automatically updated
   * as the <code>Action</code>'s properties change.
   * <p>
   * This method uses three other methods to set
   * and help track the <code>Action</code>'s property values.
   * It uses the <code>configurePropertiesFromAction</code> method
   * to immediately change the textfield's properties.
   * To track changes in the <code>Action</code>'s property values,
   * this method registers the <code>PropertyChangeListener</code>
   * returned by <code>createActionPropertyChangeListener</code>. The
   * default {@code PropertyChangeListener} invokes the
   * {@code actionPropertyChanged} method when a property in the
   * {@code Action} changes.
   *
   * @param a the <code>Action</code> for the <code>JTextField</code>,
   *          or <code>null</code>
   * @since 1.3
   * @see Action
   * @see #getAction
   * @see #configurePropertiesFromAction
   * @see #createActionPropertyChangeListener
   * @see #actionPropertyChanged
   */
  setAction(a: Action): void {
    let oldValue = this.getAction();
    if (this.action_ == null || !this.action_.equals(a)) {
      this.action_ = a;
      if (oldValue != null) {
        this.removeActionListener($J.fn(oldValue, 'actionPerformed'));
        oldValue.removePropertyChangeListener(this.actionPropertyChangeListener);
        this.actionPropertyChangeListener = null;
      }
      this.configurePropertiesFromAction(this.action_);
      if (this.action_ != null) {
        if (!this.isListener($J.cls(ActionListener), $J.fn(this.action_, 'actionPerformed'))) {
          this.addActionListener($J.fn(this.action_, 'actionPerformed'));
        }
        this.actionPropertyChangeListener = this.createActionPropertyChangeListener(this.action_);
        this.action_.addPropertyChangeListener(this.actionPropertyChangeListener);
      }
      this.firePropertyChange$String$Object$Object('action', oldValue, this.action_);
    }
  }
  isListener(c: JClass<any>, a: ActionListener): boolean {
    let isListener = false;
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === c && (listeners[(i + 1) | 0]) === a) {
        isListener = true;
      }
    }
    return isListener;
  }
  /**
   * Returns the currently set <code>Action</code> for this
   * <code>ActionEvent</code> source, or <code>null</code>
   * if no <code>Action</code> is set.
   *
   * @return the <code>Action</code> for this <code>ActionEvent</code> source,
   *          or <code>null</code>
   * @since 1.3
   * @see Action
   * @see #setAction
   */
  getAction(): Action {
    return this.action_;
  }
  /**
   * Sets the properties on this textfield to match those in the specified
   * <code>Action</code>.  Refer to <a href="Action.html#buttonActions">
   * Swing Components Supporting <code>Action</code></a> for more
   * details as to which properties this sets.
   *
   * @param a the <code>Action</code> from which to get the properties,
   *          or <code>null</code>
   * @since 1.3
   * @see Action
   * @see #setAction
   */
  configurePropertiesFromAction(a: Action): void {
    AbstractAction.setEnabledFromAction(this, a);
    AbstractAction.setToolTipTextFromAction(this, a);
    this.setActionCommandFromAction(a);
  }
  /**
   * Updates the textfield's state in response to property changes in
   * associated action. This method is invoked from the
   * {@code PropertyChangeListener} returned from
   * {@code createActionPropertyChangeListener}. Subclasses do not normally
   * need to invoke this. Subclasses that support additional {@code Action}
   * properties should override this and
   * {@code configurePropertiesFromAction}.
   * <p>
   * Refer to the table at <a href="Action.html#buttonActions">
   * Swing Components Supporting <code>Action</code></a> for a list of
   * the properties this method sets.
   *
   * @param action the <code>Action</code> associated with this textfield
   * @param propertyName the name of the property that changed
   * @since 1.6
   * @see Action
   * @see #configurePropertiesFromAction
   */
  actionPropertyChanged(action: Action, propertyName: string): void {
    if (propertyName === Action.ACTION_COMMAND_KEY) {
      this.setActionCommandFromAction(action);
    } else if (propertyName === 'enabled') {
      AbstractAction.setEnabledFromAction(this, action);
    } else if (propertyName === Action.SHORT_DESCRIPTION) {
      AbstractAction.setToolTipTextFromAction(this, action);
    }
  }
  setActionCommandFromAction(action: Action): void {
    this.setActionCommand((action == null) ? null : action.getValue$String(Action.ACTION_COMMAND_KEY));
  }
  /**
   * Creates and returns a <code>PropertyChangeListener</code> that is
   * responsible for listening for changes from the specified
   * <code>Action</code> and updating the appropriate properties.
   * <p>
   * <b>Warning:</b> If you subclass this do not create an anonymous
   * inner class.  If you do the lifetime of the textfield will be tied to
   * that of the <code>Action</code>.
   *
   * @param a the textfield's action
   * @return a {@code PropertyChangeListener} that is responsible for
   *         listening for changes from the specified {@code Action} and
   *         updating the appropriate properties
   * @since 1.3
   * @see Action
   * @see #setAction
   */
  createActionPropertyChangeListener(a: Action): PropertyChangeListener {
    return $J.fn(new JTextField$TextFieldActionPropertyChangeListener()._JTextField$TextFieldActionPropertyChangeListener(this, a), 'propertyChange');
  }
  /**
   * Fetches the command list for the editor.  This is
   * the list of commands supported by the plugged-in UI
   * augmented by the collection of commands that the
   * editor itself supports.  These are useful for binding
   * to events, such as in a keymap.
   *
   * @return the command list
   */
  getActions(): Action[] {
    return TextAction.augmentList(super.getActions(), JTextField.defaultActions);
  }
  /**
   * Processes action events occurring on this textfield by
   * dispatching them to any registered <code>ActionListener</code> objects.
   * This is normally called by the controller registered with
   * textfield.
   */
  postActionEvent(): void {
    this.fireActionPerformed();
  }
  /**
   * Gets the visibility of the text field.  This can
   * be adjusted to change the location of the visible
   * area if the size of the field is greater than
   * the area that was allocated to the field.
   *
   * <p>
   * The fields look-and-feel implementation manages
   * the values of the minimum, maximum, and extent
   * properties on the <code>BoundedRangeModel</code>.
   *
   * @return the visibility
   * @see BoundedRangeModel
   */
  getHorizontalVisibility(): BoundedRangeModel {
    return this.visibility;
  }
  /**
   * Scrolls the field left or right.
   *
   * @param r the region to scroll
   */
  scrollRectToVisible(r: Rectangle): void {
    let i = this.getInsets$();
    let x0 = (r.x_ + this.visibility.getValue() - i.left) | 0;
    let x1 = (x0 + r.width_) | 0;
    if (x0 < this.visibility.getValue()) {
      this.visibility.setValue(x0);
    } else if (x1 > ((this.visibility.getValue() + this.visibility.getExtent()) | 0)) {
      this.visibility.setValue((x1 - this.visibility.getExtent()) | 0);
    }
  }
  /**
   * Returns true if the receiver has an <code>ActionListener</code>
   * installed.
   */
  hasActionListener(): boolean {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ActionListener)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Returns a string representation of this <code>JTextField</code>.
   * This method is intended to be used only for debugging purposes,
   * and the content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JTextField</code>
   */
  paramString(): string {
    let horizontalAlignmentString: string;
    if (this.horizontalAlignment === SwingConstants.LEFT) {
      horizontalAlignmentString = 'LEFT';
    } else if (this.horizontalAlignment === SwingConstants.CENTER) {
      horizontalAlignmentString = 'CENTER';
    } else if (this.horizontalAlignment === SwingConstants.RIGHT) {
      horizontalAlignmentString = 'RIGHT';
    } else if (this.horizontalAlignment === SwingConstants.LEADING) {
      horizontalAlignmentString = 'LEADING';
    } else if (this.horizontalAlignment === SwingConstants.TRAILING) {
      horizontalAlignmentString = 'TRAILING';
    } else {
      horizontalAlignmentString = '';
    }
    let commandString = (this.command != null ? this.command : '');
    return super.paramString() + ',columns=' + this.columns + ',columnWidth=' + this.columnWidth + ',command=' + commandString + ',horizontalAlignment=' + horizontalAlignmentString;
  }
  /**
   * Gets the <code>AccessibleContext</code> associated with this
   * <code>JTextField</code>. For <code>JTextFields</code>,
   * the <code>AccessibleContext</code> takes the form of an
   * <code>AccessibleJTextField</code>.
   * A new <code>AccessibleJTextField</code> instance is created
   * if necessary.
   *
   * @return an <code>AccessibleJTextField</code> that serves as the
   *         <code>AccessibleContext</code> of this <code>JTextField</code>
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JTextField$AccessibleJTextField().$o(this)._JTextField$AccessibleJTextField();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    JTextField.defaultActions = [new JTextField$NotifyAction()._JTextField$NotifyAction()];
  }
}

export class JTextField$TextFieldActionPropertyChangeListener extends ActionPropertyChangeListener {
  _JTextField$TextFieldActionPropertyChangeListener(tf: JTextField, a: Action): this {
    this._ActionPropertyChangeListener(tf, a);
    return this;
  }
  actionPropertyChanged(textField: JTextField, action: Action, e: PropertyChangeEvent): void {
    if (AbstractAction.shouldReconfigure(e)) {
      textField.configurePropertiesFromAction(action);
    } else {
      textField.actionPropertyChanged(action, e.getPropertyName());
    }
  }
}

export class JTextField$NotifyAction extends TextAction {
  _JTextField$NotifyAction(): this {
    this._TextAction(JTextField.notifyAction);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let target = this.getFocusedComponent();
    if (target instanceof JTextField) {
      let field = target;
      field.postActionEvent();
    }
  }
  isEnabled(): boolean {
    let target = this.getFocusedComponent();
    if (target instanceof JTextField) {
      return (target).hasActionListener();
    }
    return false;
  }
}

export class JTextField$ScrollRepainter extends JObject {
  _JTextField$ScrollRepainter(): this {
    return this;
  }
  stateChanged(e: ChangeEvent): void {
    this.$outer.repaint$();
  }
}

/**
 * This class implements accessibility support for the
 * <code>JTextField</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to text field user-interface
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
export class JTextField$AccessibleJTextField extends JTextComponent$AccessibleJTextComponent {
  /**
   * Constructs an {@code AccessibleJTextField}.
   */
  _JTextField$AccessibleJTextField(): this {
    this._JTextComponent$AccessibleJTextComponent();
    return this;
  }
}

$J.define(JTextField, 'javax.swing.JTextField', { kind: 'class', ifaces: ['javax.swing.SwingConstants'], sup: 'javax.swing.text.JTextComponent', ctors: { 'javax.swing.text.Document,java.lang.String,int': '_JTextField$Document$String$int', 'java.lang.String,int': '_JTextField$String$int', 'int': '_JTextField$int', 'java.lang.String': '_JTextField$String', '': '_JTextField$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JTextField', 'getPreferredSize()': 'getPreferredSize$', 'isValidateRoot()': 'isValidateRoot$' }, clinit: true, lazy: ['defaultActions'] });
$J.define(JTextField$TextFieldActionPropertyChangeListener, 'javax.swing.JTextField$TextFieldActionPropertyChangeListener', { kind: 'class', sup: 'javax.swing.ActionPropertyChangeListener', ctors: { 'javax.swing.JTextField,javax.swing.Action': '_JTextField$TextFieldActionPropertyChangeListener' } });
$J.define(JTextField$NotifyAction, 'javax.swing.JTextField$NotifyAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_JTextField$NotifyAction' } });
$J.define(JTextField$ScrollRepainter, 'javax.swing.JTextField$ScrollRepainter', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JTextField$ScrollRepainter' }, inner: true });
$J.define(JTextField$AccessibleJTextField, 'javax.swing.JTextField$AccessibleJTextField', { kind: 'class', sup: 'javax.swing.text.JTextComponent$AccessibleJTextComponent', ctors: { '': '_JTextField$AccessibleJTextField' }, meths: { 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
$J.module(() => {
  EventQueue = $J.load('java.awt.EventQueue');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  ActionListener = $J.load('java.awt.event.ActionListener');
  InputEvent = $J.load('java.awt.event.InputEvent');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  Action = $J.load('javax.swing.Action');
  DefaultBoundedRangeModel = $J.load('javax.swing.DefaultBoundedRangeModel');
  JViewport = $J.load('javax.swing.JViewport');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  PlainDocument = $J.load('javax.swing.text.PlainDocument');
});
