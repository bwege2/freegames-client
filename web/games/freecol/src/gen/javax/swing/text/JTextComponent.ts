// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/JTextComponent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, AttributedString, Cache, Cache_Kind, DataFlavor, HashMap, Hashtable, IOException, IllegalArgumentException, JObject, JString, NoSuchMethodException, StringBuilder, StringSelection, UnsupportedFlavorException } from '../../../../jre/index.ts';
import { JComponent } from '../JComponent.ts';
import { JComponent$AccessibleJComponent } from '../JComponent.ts';
import { TransferHandler$DropLocation } from '../TransferHandler.ts';
import { TransferHandler } from '../TransferHandler.ts';
import { InputMap } from '../InputMap.ts';
import { ActionMap } from '../ActionMap.ts';
import { CaretEvent } from '../event/CaretEvent.ts';
import { DefaultCaret } from './DefaultCaret.ts';

let AWTEvent, EventQueue, GraphicsEnvironment, HeadlessException, IllegalComponentStateException, Point, ActionEvent, ComponentAdapter, InputEvent, InputMethodEvent, KeyEvent, TextAttribute, AccessibleContext, Action, DropMode, JViewport, KeyStroke, SwingConstants, SwingUtilities, UIManager, CaretListener, AbstractDocument, BadLocationException, DefaultEditorKit$DefaultKeyTypedAction, Position$Bias, SimpleAttributeSet, StyleConstants, StyledDocument, SwingAccessor;

/**
 * <code>JTextComponent</code> is the base class for swing text
 * components.  It tries to be compatible with the
 * <code>java.awt.TextComponent</code> class
 * where it can reasonably do so.  Also provided are other services
 * for additional flexibility (beyond the pluggable UI and bean
 * support).
 * You can find information on how to use the functionality
 * this class provides in
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/generaltext.html">General Rules for Using Text Components</a>,
 * a section in <em>The Java Tutorial.</em>
 *
 * <dl>
 * <dt><b>Caret Changes</b>
 * <dd>
 * The caret is a pluggable object in swing text components.
 * Notification of changes to the caret position and the selection
 * are sent to implementations of the <code>CaretListener</code>
 * interface that have been registered with the text component.
 * The UI will install a default caret unless a customized caret
 * has been set. <br>
 * By default the caret tracks all the document changes
 * performed on the Event Dispatching Thread and updates it's position
 * accordingly if an insertion occurs before or at the caret position
 * or a removal occurs before the caret position. <code>DefaultCaret</code>
 * tries to make itself visible which may lead to scrolling
 * of a text component within <code>JScrollPane</code>. The default caret
 * behavior can be changed by the {@link DefaultCaret#setUpdatePolicy} method.
 * <br>
 * <b>Note</b>: Non-editable text components also have a caret though
 * it may not be painted.
 *
 * <dt><b>Commands</b>
 * <dd>
 * Text components provide a number of commands that can be used
 * to manipulate the component.  This is essentially the way that
 * the component expresses its capabilities.  These are expressed
 * in terms of the swing <code>Action</code> interface,
 * using the <code>TextAction</code> implementation.
 * The set of commands supported by the text component can be
 * found with the {@link #getActions} method.  These actions
 * can be bound to key events, fired from buttons, etc.
 *
 * <dt><b>Text Input</b>
 * <dd>
 * The text components support flexible and internationalized text input, using
 * keymaps and the input method framework, while maintaining compatibility with
 * the AWT listener model.
 * <p>
 * A {@link javax.swing.text.Keymap} lets an application bind key
 * strokes to actions.
 * In order to allow keymaps to be shared across multiple text components, they
 * can use actions that extend <code>TextAction</code>.
 * <code>TextAction</code> can determine which <code>JTextComponent</code>
 * most recently has or had focus and therefore is the subject of
 * the action (In the case that the <code>ActionEvent</code>
 * sent to the action doesn't contain the target text component as its source).
 * <p>
 * The {@extLink imf_overview Input Method Framework}
 * lets text components interact with input methods, separate software
 * components that preprocess events to let users enter thousands of
 * different characters using keyboards with far fewer keys.
 * <code>JTextComponent</code> is an <em>active client</em> of
 * the framework, so it implements the preferred user interface for interacting
 * with input methods. As a consequence, some key events do not reach the text
 * component because they are handled by an input method, and some text input
 * reaches the text component as committed text within an {@link
 * java.awt.event.InputMethodEvent} instead of as a key event.
 * The complete text input is the combination of the characters in
 * <code>keyTyped</code> key events and committed text in input method events.
 * <p>
 * The AWT listener model lets applications attach event listeners to
 * components in order to bind events to actions. Swing encourages the
 * use of keymaps instead of listeners, but maintains compatibility
 * with listeners by giving the listeners a chance to steal an event
 * by consuming it.
 * <p>
 * Keyboard event and input method events are handled in the following stages,
 * with each stage capable of consuming the event:
 *
 * <table class="striped">
 * <caption>Stages of keyboard and input method event handling</caption>
 * <thead>
 *   <tr>
 *     <th scope="col">Stage
 *     <th scope="col">KeyEvent
 *     <th scope="col">InputMethodEvent
 * </thead>
 * <tbody>
 *   <tr>
 *     <th scope="row">1.
 *     <td>input methods
 *     <td>(generated here)
 *   <tr>
 *     <th scope="row">2.
 *     <td>focus manager
 *     <td>
 *   </tr>
 *   <tr>
 *     <th scope="row">3.
 *     <td>registered key listeners
 *     <td>registered input method listeners
 *   <tr>
 *     <th scope="row">4.
 *     <td>
 *     <td>input method handling in JTextComponent
 *   <tr>
 *     <th scope="row">5.
 *     <td colspan=2>keymap handling using the current keymap
 *   <tr>
 *     <th scope="row">6.
 *     <td>keyboard handling in JComponent (e.g. accelerators, component
 *     navigation, etc.)
 *     <td>
 * </tbody>
 * </table>
 * <p>
 * To maintain compatibility with applications that listen to key
 * events but are not aware of input method events, the input
 * method handling in stage 4 provides a compatibility mode for
 * components that do not process input method events. For these
 * components, the committed text is converted to keyTyped key events
 * and processed in the key event pipeline starting at stage 3
 * instead of in the input method event pipeline.
 * <p>
 * By default the component will create a keymap (named <b>DEFAULT_KEYMAP</b>)
 * that is shared by all JTextComponent instances as the default keymap.
 * Typically a look-and-feel implementation will install a different keymap
 * that resolves to the default keymap for those bindings not found in the
 * different keymap. The minimal bindings include:
 * <ul>
 * <li>inserting content into the editor for the
 *  printable keys.
 * <li>removing content with the backspace and del
 *  keys.
 * <li>caret movement forward and backward
 * </ul>
 *
 * <dt><b>Model/View Split</b>
 * <dd>
 * The text components have a model-view split.  A text component pulls
 * together the objects used to represent the model, view, and controller.
 * The text document model may be shared by other views which act as observers
 * of the model (e.g. a document may be shared by multiple components).
 *
 * <p style="text-align:center"><img src="doc-files/editor.gif" alt="Diagram showing interaction between Controller, Document, events, and ViewFactory"
 *                  HEIGHT=358 WIDTH=587></p>
 *
 * <p>
 * The model is defined by the {@link Document} interface.
 * This is intended to provide a flexible text storage mechanism
 * that tracks change during edits and can be extended to more sophisticated
 * models.  The model interfaces are meant to capture the capabilities of
 * expression given by SGML, a system used to express a wide variety of
 * content.
 * Each modification to the document causes notification of the
 * details of the change to be sent to all observers in the form of a
 * {@link DocumentEvent} which allows the views to stay up to date with the model.
 * This event is sent to observers that have implemented the
 * {@link DocumentListener}
 * interface and registered interest with the model being observed.
 *
 * <dt><b>Location Information</b>
 * <dd>
 * The capability of determining the location of text in
 * the view is provided.  There are two methods, {@link #modelToView}
 * and {@link #viewToModel} for determining this information.
 *
 * <dt><b>Undo/Redo support</b>
 * <dd>
 * Support for an edit history mechanism is provided to allow
 * undo/redo operations.  The text component does not itself
 * provide the history buffer by default, but does provide
 * the <code>UndoableEdit</code> records that can be used in conjunction
 * with a history buffer to provide the undo/redo support.
 * The support is provided by the Document model, which allows
 * one to attach UndoableEditListener implementations.
 *
 * <dt><b>Thread Safety</b>
 * <dd>
 * The swing text components provide some support of thread
 * safe operations.  Because of the high level of configurability
 * of the text components, it is possible to circumvent the
 * protection provided.  The protection primarily comes from
 * the model, so the documentation of <code>AbstractDocument</code>
 * describes the assumptions of the protection provided.
 * The methods that are safe to call asynchronously are marked
 * with comments.
 *
 * <dt><b>Newlines</b>
 * <dd>
 * For a discussion on how newlines are handled, see
 * <a href="DefaultEditorKit.html">DefaultEditorKit</a>.
 *
 *
 * <dt><b>Printing support</b>
 * <dd>
 * Several {@link #print print} methods are provided for basic
 * document printing.  If more advanced printing is needed, use the
 * {@link #getPrintable} method.
 * </dl>
 *
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
 * @author Igor Kushnirskiy (printing support)
 * @see Document
 * @see DocumentEvent
 * @see DocumentListener
 * @see Caret
 * @see CaretEvent
 * @see CaretListener
 * @see TextUI
 * @see View
 * @see ViewFactory
 */
export class JTextComponent extends JComponent {
  /**
   * The bound property name for the focus accelerator.
   */
  static readonly FOCUS_ACCELERATOR_KEY: string = 'focusAcceleratorKey';
  /**
   * The document model.
   */
  model: Document = null;
  /**
   * The caret used to display the insert position
   * and navigate throughout the document.
   *
   * PENDING(prinz)
   * This should be serializable, default installed
   * by UI.
   */
  caret: Caret = null;
  /**
   * Object responsible for restricting the cursor navigation.
   */
  navigationFilter: NavigationFilter = null;
  /**
   * The object responsible for managing highlights.
   *
   * PENDING(prinz)
   * This should be serializable, default installed
   * by UI.
   */
  highlighter: Highlighter = null;
  /**
   * The current key bindings in effect.
   *
   * PENDING(prinz)
   * This should be serializable, default installed
   * by UI.
   */
  keymap: Keymap = null;
  caretEvent: JTextComponent$MutableCaretEvent = null;
  caretColor: Color = null;
  selectionColor: Color = null;
  selectedTextColor: Color = null;
  disabledTextColor: Color = null;
  editable: boolean = false;
  margin: Insets = null;
  focusAccelerator: number = 0;
  dragEnabled: boolean = false;
  /**
   * The drop mode for this component.
   */
  dropMode: DropMode = null;
  /**
   * The drop location.
   */
  dropLocation: JTextComponent$DropLocation = null;
  /**
   * TransferHandler used if one hasn't been supplied by the UI.
   */
  static defaultTransferHandler: JTextComponent$DefaultTransferHandler = null;
  /**
   * Maps from class name to Boolean indicating if
   * <code>processInputMethodEvent</code> has been overridden.
   */
  static METHOD_OVERRIDDEN: Cache<JClass<any>, boolean> = null;
  static KEYMAP_TABLE: any = null;
  inputMethodRequestsHandler: InputMethodRequests = null;
  composedTextAttribute: SimpleAttributeSet = null;
  composedTextContent: string = null;
  composedTextStart: Position = null;
  composedTextEnd: Position = null;
  latestCommittedTextStart: Position = null;
  latestCommittedTextEnd: Position = null;
  composedTextCaret: JTextComponent$ComposedTextCaret = null;
  originalCaret: Caret = null;
  /**
   * Set to true after the check for the override of processInputMethodEvent
   * has been checked.
   */
  checkedInputOverride: boolean = false;
  needToSendKeyTypedEvent: boolean = false;
  static FOCUSED_COMPONENT: any = null;
  /**
   * The default keymap that will be shared by all
   * <code>JTextComponent</code> instances unless they
   * have had a different keymap set.
   */
  static readonly DEFAULT_KEYMAP: string = 'default';
  /**
   * Creates a new <code>JTextComponent</code>.
   * Listeners for caret events are established, and the pluggable
   * UI installed.  The component is marked as editable.  No layout manager
   * is used, because layout is managed by the view subsystem of text.
   * The document model is set to <code>null</code>.
   */
  _JTextComponent(): this {
    this._JComponent();
    this.dropMode = DropMode.USE_SELECTION;
    this.enableEvents($J.lor(AWTEvent.KEY_EVENT_MASK, AWTEvent.INPUT_METHOD_EVENT_MASK));
    this.caretEvent = new JTextComponent$MutableCaretEvent()._JTextComponent$MutableCaretEvent(this);
    this.addMouseListener(this.caretEvent);
    this.addFocusListener(this.caretEvent);
    this.setEditable(true);
    this.setDragEnabled(false);
    this.setLayout(null);
    this.updateUI();
    return this;
  }
  /**
   * Fetches the user-interface factory for this text-oriented editor.
   *
   * @return the factory
   */
  getUI(): TextUI {
    return this.ui;
  }
  /**
   * Sets the user-interface factory for this text-oriented editor.
   *
   * @param ui the factory
   */
  setUI$TextUI(ui: TextUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Reloads the pluggable UI.  The key used to fetch the
   * new interface is <code>getUIClassID()</code>.  The type of
   * the UI is <code>TextUI</code>.  <code>invalidate</code>
   * is called after setting the UI.
   */
  updateUI(): void {
    this.setUI$TextUI(UIManager.getUI(this));
    this.invalidate();
  }
  /**
   * Adds a caret listener for notification of any changes
   * to the caret.
   *
   * @param listener the listener to be added
   * @see javax.swing.event.CaretEvent
   */
  addCaretListener(listener: CaretListener): void {
    this.listenerList.add($J.cls(CaretListener), listener);
  }
  /**
   * Removes a caret listener.
   *
   * @param listener the listener to be removed
   * @see javax.swing.event.CaretEvent
   */
  removeCaretListener(listener: CaretListener): void {
    this.listenerList.remove($J.cls(CaretListener), listener);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.  The listener list is processed in a
   * last-to-first manner.
   *
   * @param e the event
   * @see EventListenerList
   */
  fireCaretUpdate(e: CaretEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(CaretListener)) {
        (listeners[(i + 1) | 0]).caretUpdate(e);
      }
    }
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
    let old = this.model;
    try {
      if (old instanceof AbstractDocument) {
        (old).readLock();
      }
      if (this.accessibleContext != null) {
        this.model.removeDocumentListener((this.accessibleContext));
      }
      if (this.inputMethodRequestsHandler != null) {
        this.model.removeDocumentListener(this.inputMethodRequestsHandler);
      }
      this.model = doc;
      let runDir = this.getComponentOrientation().isLeftToRight() ? TextAttribute.RUN_DIRECTION_LTR : TextAttribute.RUN_DIRECTION_RTL;
      if (runDir !== doc.getProperty(TextAttribute.RUN_DIRECTION)) {
        doc.putProperty(TextAttribute.RUN_DIRECTION, runDir);
      }
      this.firePropertyChange$String$Object$Object('document', old, doc);
    } finally {
      if (old instanceof AbstractDocument) {
        (old).readUnlock();
      }
    }
    this.revalidate();
    this.repaint$();
    if (this.accessibleContext != null) {
      this.model.addDocumentListener((this.accessibleContext));
    }
    if (this.inputMethodRequestsHandler != null) {
      this.model.addDocumentListener(this.inputMethodRequestsHandler);
    }
  }
  /**
   * Fetches the model associated with the editor.  This is
   * primarily for the UI to get at the minimal amount of
   * state required to be a text editor.  Subclasses will
   * return the actual type of the model which will typically
   * be something that extends Document.
   *
   * @return the model
   */
  getDocument(): Document {
    return this.model;
  }
  setComponentOrientation(o: ComponentOrientation): void {
    let doc = this.getDocument();
    if (doc != null) {
      let runDir = o.isLeftToRight() ? TextAttribute.RUN_DIRECTION_LTR : TextAttribute.RUN_DIRECTION_RTL;
      doc.putProperty(TextAttribute.RUN_DIRECTION, runDir);
    }
    super.setComponentOrientation(o);
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
    return this.getUI().getEditorKit(this).getActions$();
  }
  /**
   * Sets margin space between the text component's border
   * and its text.  The text component's default <code>Border</code>
   * object will use this value to create the proper margin.
   * However, if a non-default border is set on the text component,
   * it is that <code>Border</code> object's responsibility to create the
   * appropriate margin space (else this property will effectively
   * be ignored).  This causes a redraw of the component.
   * A PropertyChange event ("margin") is sent to all listeners.
   *
   * @param m the space between the border and the text
   */
  setMargin(m: Insets): void {
    let old = this.margin;
    this.margin = m;
    this.firePropertyChange$String$Object$Object('margin', old, m);
    this.invalidate();
  }
  /**
   * Returns the margin between the text component's border and
   * its text.
   *
   * @return the margin
   */
  getMargin(): Insets {
    return this.margin;
  }
  /**
   * Sets the <code>NavigationFilter</code>. <code>NavigationFilter</code>
   * is used by <code>DefaultCaret</code> and the default cursor movement
   * actions as a way to restrict the cursor movement.
   * @param filter the filter
   *
   * @since 1.4
   */
  setNavigationFilter(filter: NavigationFilter): void {
    this.navigationFilter = filter;
  }
  /**
   * Returns the <code>NavigationFilter</code>. <code>NavigationFilter</code>
   * is used by <code>DefaultCaret</code> and the default cursor movement
   * actions as a way to restrict the cursor movement. A null return value
   * implies the cursor movement and selection should not be restricted.
   *
   * @since 1.4
   * @return the NavigationFilter
   */
  getNavigationFilter(): NavigationFilter {
    return this.navigationFilter;
  }
  /**
   * Fetches the caret that allows text-oriented navigation over
   * the view.
   *
   * @return the caret
   */
  getCaret(): Caret {
    return this.caret;
  }
  /**
   * Sets the caret to be used.  By default this will be set
   * by the UI that gets installed.  This can be changed to
   * a custom caret if desired.  Setting the caret results in a
   * PropertyChange event ("caret") being fired.
   *
   * @param c the caret
   * @see #getCaret
   */
  setCaret(c: Caret): void {
    if (this.caret != null) {
      this.caret.removeChangeListener($J.fn(this.caretEvent, 'stateChanged'));
      this.caret.deinstall(this);
    }
    let old = this.caret;
    this.caret = c;
    if (this.caret != null) {
      this.caret.install(this);
      this.caret.addChangeListener($J.fn(this.caretEvent, 'stateChanged'));
    }
    this.firePropertyChange$String$Object$Object('caret', old, this.caret);
  }
  /**
   * Fetches the object responsible for making highlights.
   *
   * @return the highlighter
   */
  getHighlighter(): Highlighter {
    return this.highlighter;
  }
  /**
   * Sets the highlighter to be used.  By default this will be set
   * by the UI that gets installed.  This can be changed to
   * a custom highlighter if desired.  The highlighter can be set to
   * <code>null</code> to disable it.
   * A PropertyChange event ("highlighter") is fired
   * when a new highlighter is installed.
   *
   * @param h the highlighter
   * @see #getHighlighter
   */
  setHighlighter(h: Highlighter): void {
    if (this.highlighter != null) {
      this.highlighter.deinstall(this);
    }
    let old = this.highlighter;
    this.highlighter = h;
    if (this.highlighter != null) {
      this.highlighter.install(this);
    }
    this.firePropertyChange$String$Object$Object('highlighter', old, h);
  }
  /**
   * Sets the keymap to use for binding events to
   * actions.  Setting to <code>null</code> effectively disables
   * keyboard input.
   * A PropertyChange event ("keymap") is fired when a new keymap
   * is installed.
   *
   * @param map the keymap
   * @see #getKeymap
   */
  setKeymap(map: Keymap): void {
    let old = this.keymap;
    this.keymap = map;
    this.firePropertyChange$String$Object$Object('keymap', old, this.keymap);
    this.updateInputMap(old, map);
  }
  /**
   * Turns on or off automatic drag handling. In order to enable automatic
   * drag handling, this property should be set to {@code true}, and the
   * component's {@code TransferHandler} needs to be {@code non-null}.
   * The default value of the {@code dragEnabled} property is {@code false}.
   * <p>
   * The job of honoring this property, and recognizing a user drag gesture,
   * lies with the look and feel implementation, and in particular, the component's
   * {@code TextUI}. When automatic drag handling is enabled, most look and
   * feels (including those that subclass {@code BasicLookAndFeel}) begin a
   * drag and drop operation whenever the user presses the mouse button over
   * a selection and then moves the mouse a few pixels. Setting this property to
   * {@code true} can therefore have a subtle effect on how selections behave.
   * <p>
   * If a look and feel is used that ignores this property, you can still
   * begin a drag and drop operation by calling {@code exportAsDrag} on the
   * component's {@code TransferHandler}.
   *
   * @param b whether or not to enable automatic drag handling
   * @throws HeadlessException if
   *            <code>b</code> is <code>true</code> and
   *            <code>GraphicsEnvironment.isHeadless()</code>
   *            returns <code>true</code>
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see #getDragEnabled
   * @see #setTransferHandler
   * @see TransferHandler
   * @since 1.4
   */
  setDragEnabled(b: boolean): void {
    JTextComponent.checkDragEnabled(b);
    this.dragEnabled = b;
  }
  static checkDragEnabled(b: boolean): void {
    if (b && GraphicsEnvironment.isHeadless()) {
      throw new HeadlessException()._HeadlessException$();
    }
  }
  /**
   * Returns whether or not automatic drag handling is enabled.
   *
   * @return the value of the {@code dragEnabled} property
   * @see #setDragEnabled
   * @since 1.4
   */
  getDragEnabled(): boolean {
    return this.dragEnabled;
  }
  static checkDropMode(dropMode: DropMode): void {
    if (dropMode != null) {
      switch (dropMode) {
        case DropMode.USE_SELECTION:
        case DropMode.INSERT:
          return;
      }
    }
    throw new IllegalArgumentException($J.str(dropMode) + ': Unsupported drop mode for text');
  }
  /**
   * Returns the drop mode for this component.
   *
   * @return the drop mode for this component
   * @see #setDropMode
   * @since 1.6
   */
  getDropMode(): DropMode {
    return this.dropMode;
  }
  /**
   * Calculates a drop location in this component, representing where a
   * drop at the given point should insert data.
   * <p>
   * Note: This method is meant to override
   * <code>JComponent.dropLocationForPoint()</code>, which is package-private
   * in javax.swing. <code>TransferHandler</code> will detect text components
   * and call this method instead via reflection. It's name should therefore
   * not be changed.
   *
   * @param p the point to calculate a drop location for
   * @return the drop location, or <code>null</code>
   */
  dropLocationForPoint$Point(p: Point): JTextComponent$DropLocation {
    let bias = $J.newArray(1, null);
    let index = this.getUI().viewToModel$JTextComponent$Point$BiasArr(this, p, bias);
    if (bias[0] == null) {
      bias[0] = Position$Bias.Forward;
    }
    return new JTextComponent$DropLocation()._JTextComponent$DropLocation(p, index, bias[0]);
  }
  /**
   * Called to set or clear the drop location during a DnD operation.
   * In some cases, the component may need to use it's internal selection
   * temporarily to indicate the drop location. To help facilitate this,
   * this method returns and accepts as a parameter a state object.
   * This state object can be used to store, and later restore, the selection
   * state. Whatever this method returns will be passed back to it in
   * future calls, as the state parameter. If it wants the DnD system to
   * continue storing the same state, it must pass it back every time.
   * Here's how this is used:
   * <p>
   * Let's say that on the first call to this method the component decides
   * to save some state (because it is about to use the selection to show
   * a drop index). It can return a state object to the caller encapsulating
   * any saved selection state. On a second call, let's say the drop location
   * is being changed to something else. The component doesn't need to
   * restore anything yet, so it simply passes back the same state object
   * to have the DnD system continue storing it. Finally, let's say this
   * method is messaged with <code>null</code>. This means DnD
   * is finished with this component for now, meaning it should restore
   * state. At this point, it can use the state parameter to restore
   * said state, and of course return <code>null</code> since there's
   * no longer anything to store.
   * <p>
   * Note: This method is meant to override
   * <code>JComponent.setDropLocation()</code>, which is package-private
   * in javax.swing. <code>TransferHandler</code> will detect text components
   * and call this method instead via reflection. It's name should therefore
   * not be changed.
   *
   * @param location the drop location (as calculated by
   *        <code>dropLocationForPoint</code>) or <code>null</code>
   *        if there's no longer a valid drop location
   * @param state the state object saved earlier for this component,
   *        or <code>null</code>
   * @param forDrop whether or not the method is being called because an
   *        actual drop occurred
   * @return any saved state for this component, or <code>null</code> if none
   */
  setDropLocation$DropLocation$Object$boolean(location: TransferHandler$DropLocation, state: any, forDrop: boolean): any {
    let retVal = null;
    let textLocation = location;
    if (this.dropMode === DropMode.USE_SELECTION) {
      if (textLocation == null) {
        if (state != null) {
          let vals = state;
          if (!forDrop) {
            if (this.caret instanceof DefaultCaret) {
              (this.caret).setDot$int$Bias((+(vals[0])), vals[3]);
              (this.caret).moveDot$int$Bias((+(vals[1])), vals[4]);
            } else {
              this.caret.setDot$int((+(vals[0])));
              this.caret.moveDot$int((+(vals[1])));
            }
          }
          this.caret.setVisible((vals[2]));
        }
      } else {
        if (this.dropLocation == null) {
          let visible: boolean;
          if (this.caret instanceof DefaultCaret) {
            let dc = this.caret;
            visible = dc.isActive();
            retVal = [dc.getMark(), dc.getDot(), visible, dc.getMarkBias(), dc.getDotBias()];
          } else {
            visible = this.caret.isVisible();
            retVal = [this.caret.getMark(), this.caret.getDot(), visible];
          }
          this.caret.setVisible(true);
        } else {
          retVal = state;
        }
        if (this.caret instanceof DefaultCaret) {
          (this.caret).setDot$int$Bias(textLocation.getIndex(), textLocation.getBias());
        } else {
          this.caret.setDot$int(textLocation.getIndex());
        }
      }
    } else {
      if (textLocation == null) {
        if (state != null) {
          this.caret.setVisible((state));
        }
      } else {
        if (this.dropLocation == null) {
          let visible = this.caret instanceof DefaultCaret ? (this.caret).isActive() : this.caret.isVisible();
          retVal = visible;
          this.caret.setVisible(false);
        } else {
          retVal = state;
        }
      }
    }
    let old = this.dropLocation;
    this.dropLocation = textLocation;
    this.firePropertyChange$String$Object$Object('dropLocation', old, this.dropLocation);
    return retVal;
  }
  /**
   * Returns the location that this component should visually indicate
   * as the drop location during a DnD operation over the component,
   * or {@code null} if no location is to currently be shown.
   * <p>
   * This method is not meant for querying the drop location
   * from a {@code TransferHandler}, as the drop location is only
   * set after the {@code TransferHandler}'s <code>canImport</code>
   * has returned and has allowed for the location to be shown.
   * <p>
   * When this property changes, a property change event with
   * name "dropLocation" is fired by the component.
   *
   * @return the drop location
   * @see #setDropMode
   * @see TransferHandler#canImport(TransferHandler.TransferSupport)
   * @since 1.6
   */
  getDropLocation(): JTextComponent$DropLocation {
    return this.dropLocation;
  }
  /**
   * Updates the <code>InputMap</code>s in response to a
   * <code>Keymap</code> change.
   * @param oldKm  the old <code>Keymap</code>
   * @param newKm  the new <code>Keymap</code>
   */
  updateInputMap(oldKm: Keymap, newKm: Keymap): void {
    let km = this.getInputMap$int(JComponent.WHEN_FOCUSED);
    let last = km;
    while (km != null && !(km instanceof JTextComponent$KeymapWrapper)) {
      last = km;
      km = km.getParent();
    }
    if (km != null) {
      if (newKm == null) {
        if (last !== km) {
          last.setParent(km.getParent());
        } else {
          last.setParent(null);
        }
      } else {
        let newKM = new JTextComponent$KeymapWrapper()._JTextComponent$KeymapWrapper(newKm);
        last.setParent(newKM);
        if (last !== km) {
          newKM.setParent(km.getParent());
        }
      }
    } else if (newKm != null) {
      km = this.getInputMap$int(JComponent.WHEN_FOCUSED);
      if (km != null) {
        let newKM = new JTextComponent$KeymapWrapper()._JTextComponent$KeymapWrapper(newKm);
        newKM.setParent(km.getParent());
        km.setParent(newKM);
      }
    }
    let am = this.getActionMap$();
    let lastAM = am;
    while (am != null && !(am instanceof JTextComponent$KeymapActionMap)) {
      lastAM = am;
      am = am.getParent();
    }
    if (am != null) {
      if (newKm == null) {
        if (lastAM !== am) {
          lastAM.setParent(am.getParent());
        } else {
          lastAM.setParent(null);
        }
      } else {
        let newAM = new JTextComponent$KeymapActionMap()._JTextComponent$KeymapActionMap(newKm);
        lastAM.setParent(newAM);
        if (lastAM !== am) {
          newAM.setParent(am.getParent());
        }
      }
    } else if (newKm != null) {
      am = this.getActionMap$();
      if (am != null) {
        let newAM = new JTextComponent$KeymapActionMap()._JTextComponent$KeymapActionMap(newKm);
        newAM.setParent(am.getParent());
        am.setParent(newAM);
      }
    }
  }
  /**
   * Fetches the keymap currently active in this text
   * component.
   *
   * @return the keymap
   */
  getKeymap(): Keymap {
    return this.keymap;
  }
  /**
   * Adds a new keymap into the keymap hierarchy.  Keymap bindings
   * resolve from bottom up so an attribute specified in a child
   * will override an attribute specified in the parent.
   *
   * @param nm   the name of the keymap (must be unique within the
   *   collection of named keymaps in the document); the name may
   *   be <code>null</code> if the keymap is unnamed,
   *   but the caller is responsible for managing the reference
   *   returned as an unnamed keymap can't
   *   be fetched by name
   * @param parent the parent keymap; this may be <code>null</code> if
   *   unspecified bindings need not be resolved in some other keymap
   * @return the keymap
   */
  static addKeymap(nm: string, parent: Keymap): Keymap {
    let map = new JTextComponent$DefaultKeymap()._JTextComponent$DefaultKeymap(nm, parent);
    if (nm != null) {
      JTextComponent.getKeymapTable().put(nm, map);
    }
    return map;
  }
  /**
   * Removes a named keymap previously added to the document.  Keymaps
   * with <code>null</code> names may not be removed in this way.
   *
   * @param nm  the name of the keymap to remove
   * @return the keymap that was removed
   */
  static removeKeymap(nm: string): Keymap {
    return JTextComponent.getKeymapTable().remove(nm);
  }
  /**
   * Fetches a named keymap previously added to the document.
   * This does not work with <code>null</code>-named keymaps.
   *
   * @param nm  the name of the keymap
   * @return the keymap
   */
  static getKeymap(nm: string): Keymap {
    return JTextComponent.getKeymapTable().get(nm);
  }
  static getKeymapTable(): HashMap<string, Keymap> {
    {
      let appContext = AppContext.getAppContext();
      let keymapTable = appContext.get(JTextComponent.KEYMAP_TABLE);
      if (keymapTable == null) {
        keymapTable = new HashMap(17);
        appContext.put(JTextComponent.KEYMAP_TABLE, keymapTable);
        let binding = JTextComponent.addKeymap(JTextComponent.DEFAULT_KEYMAP, null);
        binding.setDefaultAction(new DefaultEditorKit$DefaultKeyTypedAction()._DefaultEditorKit$DefaultKeyTypedAction());
      }
      return keymapTable;
    }
  }
  /**
   * <p>
   * Loads a keymap with a bunch of
   * bindings.  This can be used to take a static table of
   * definitions and load them into some keymap.  The following
   * example illustrates an example of binding some keys to
   * the cut, copy, and paste actions associated with a
   * JTextComponent.  A code fragment to accomplish
   * this might look as follows:
   * <pre><code>
   *
   *   static final JTextComponent.KeyBinding[] defaultBindings = {
   *     new JTextComponent.KeyBinding(
   *       KeyStroke.getKeyStroke(KeyEvent.VK_C, InputEvent.CTRL_MASK),
   *       DefaultEditorKit.copyAction),
   *     new JTextComponent.KeyBinding(
   *       KeyStroke.getKeyStroke(KeyEvent.VK_V, InputEvent.CTRL_MASK),
   *       DefaultEditorKit.pasteAction),
   *     new JTextComponent.KeyBinding(
   *       KeyStroke.getKeyStroke(KeyEvent.VK_X, InputEvent.CTRL_MASK),
   *       DefaultEditorKit.cutAction),
   *   };
   *
   *   JTextComponent c = new JTextPane();
   *   Keymap k = c.getKeymap();
   *   JTextComponent.loadKeymap(k, defaultBindings, c.getActions());
   *
   * </code></pre>
   * The sets of bindings and actions may be empty but must be
   * non-<code>null</code>.
   *
   * @param map the keymap
   * @param bindings the bindings
   * @param actions the set of actions
   */
  static loadKeymap(map: Keymap, bindings: JTextComponent$KeyBinding[], actions: Action[]): void {
    let h = new Hashtable();
    for (let a of actions) {
      let value = a.getValue$String(Action.NAME);
      h.put((value != null ? value : ''), a);
    }
    for (let binding of bindings) {
      let a = h.get(binding.actionName);
      if (a != null) {
        map.addActionForKeyStroke(binding.key, a);
      }
    }
  }
  /**
   * Fetches the current color used to render the
   * caret.
   *
   * @return the color
   */
  getCaretColor(): Color {
    return this.caretColor;
  }
  /**
   * Sets the current color used to render the caret.
   * Setting to <code>null</code> effectively restores the default color.
   * Setting the color results in a PropertyChange event ("caretColor")
   * being fired.
   *
   * @param c the color
   * @see #getCaretColor
   */
  setCaretColor(c: Color): void {
    let old = this.caretColor;
    this.caretColor = c;
    this.firePropertyChange$String$Object$Object('caretColor', old, this.caretColor);
  }
  /**
   * Fetches the current color used to render the
   * selection.
   *
   * @return the color
   */
  getSelectionColor(): Color {
    return this.selectionColor;
  }
  /**
   * Sets the current color used to render the selection.
   * Setting the color to <code>null</code> is the same as setting
   * <code>Color.white</code>.  Setting the color results in a
   * PropertyChange event ("selectionColor").
   *
   * @param c the color
   * @see #getSelectionColor
   */
  setSelectionColor(c: Color): void {
    let old = this.selectionColor;
    this.selectionColor = c;
    this.firePropertyChange$String$Object$Object('selectionColor', old, this.selectionColor);
  }
  /**
   * Fetches the current color used to render the
   * selected text.
   *
   * @return the color
   */
  getSelectedTextColor(): Color {
    return this.selectedTextColor;
  }
  /**
   * Sets the current color used to render the selected text.
   * Setting the color to <code>null</code> is the same as
   * <code>Color.black</code>. Setting the color results in a
   * PropertyChange event ("selectedTextColor") being fired.
   *
   * @param c the color
   * @see #getSelectedTextColor
   */
  setSelectedTextColor(c: Color): void {
    let old = this.selectedTextColor;
    this.selectedTextColor = c;
    this.firePropertyChange$String$Object$Object('selectedTextColor', old, this.selectedTextColor);
  }
  /**
   * Fetches the current color used to render the
   * disabled text.
   *
   * @return the color
   */
  getDisabledTextColor(): Color {
    return this.disabledTextColor;
  }
  /**
   * Sets the current color used to render the
   * disabled text.  Setting the color fires off a
   * PropertyChange event ("disabledTextColor").
   *
   * @param c the color
   * @see #getDisabledTextColor
   */
  setDisabledTextColor(c: Color): void {
    let old = this.disabledTextColor;
    this.disabledTextColor = c;
    this.firePropertyChange$String$Object$Object('disabledTextColor', old, this.disabledTextColor);
  }
  /**
   * Replaces the currently selected content with new content
   * represented by the given string.  If there is no selection
   * this amounts to an insert of the given text.  If there
   * is no replacement text this amounts to a removal of the
   * current selection.
   * <p>
   * This is the method that is used by the default implementation
   * of the action for inserting content that gets bound to the
   * keymap actions.
   *
   * @param content  the content to replace the selection with
   */
  replaceSelection$String(content: string): void {
    let doc = this.getDocument();
    if (doc != null) {
      try {
        let composedTextSaved = this.saveComposedText(this.caret.getDot());
        let p0 = Math.min(this.caret.getDot(), this.caret.getMark());
        let p1 = Math.max(this.caret.getDot(), this.caret.getMark());
        if (doc instanceof AbstractDocument) {
          (doc).replace(p0, (p1 - p0) | 0, content, null);
        } else {
          if (p0 !== p1) {
            doc.remove(p0, (p1 - p0) | 0);
          }
          if (content != null && content.length > 0) {
            doc.insertString(p0, content, null);
          }
        }
        if (composedTextSaved) {
          this.restoreComposedText();
        }
      } catch ($e0) {
        if ($J.isa($e0, BadLocationException)) {
          let e = $J.exc($e0);
          UIManager.getLookAndFeel().provideErrorFeedback(this);
        } else {
          throw $e0;
        }
      }
    }
  }
  /**
   * Converts the given location in the model to a place in
   * the view coordinate system.
   * The component must have a positive size for
   * this translation to be computed (i.e. layout cannot
   * be computed until the component has been sized).  The
   * component does not have to be visible or painted.
   *
   * @param pos the position &ge; 0
   * @return the coordinates as a rectangle, with (r.x, r.y) as the location
   *   in the coordinate system, or null if the component does
   *   not yet have a positive size.
   * @throws BadLocationException if the given position does not
   *   represent a valid location in the associated document
   * @see TextUI#modelToView
   *
   * @deprecated replaced by
   *     {@link #modelToView2D(int)}
   */
  modelToView(pos: number): Rectangle {
    return this.getUI().modelToView$JTextComponent$int(this, pos);
  }
  /**
   * Converts the given location in the model to a place in
   * the view coordinate system.
   * The component must have a positive size for
   * this translation to be computed (i.e. layout cannot
   * be computed until the component has been sized).  The
   * component does not have to be visible or painted.
   *
   * @param pos the position {@code >= 0}
   * @return the coordinates as a rectangle, with (r.x, r.y) as the location
   *   in the coordinate system, or null if the component does
   *   not yet have a positive size.
   * @throws BadLocationException if the given position does not
   *   represent a valid location in the associated document
   * @see TextUI#modelToView2D
   *
   * @since 9
   */
  modelToView2D(pos: number): Rectangle2D {
    return this.getUI().modelToView2D(this, pos, Position$Bias.Forward);
  }
  /**
   * Converts the given place in the view coordinate system
   * to the nearest representative location in the model.
   * The component must have a positive size for
   * this translation to be computed (i.e. layout cannot
   * be computed until the component has been sized).  The
   * component does not have to be visible or painted.
   *
   * @param pt the location in the view to translate
   * @return the offset &ge; 0 from the start of the document,
   *   or -1 if the component does not yet have a positive
   *   size.
   * @see TextUI#viewToModel
   *
   * @deprecated replaced by
   *     {@link #viewToModel2D(Point2D)}
   */
  viewToModel(pt: Point): number {
    return this.getUI().viewToModel$JTextComponent$Point(this, pt);
  }
  /**
   * Transfers the currently selected range in the associated
   * text model to the system clipboard, removing the contents
   * from the model.  The current selection is reset.  Does nothing
   * for <code>null</code> selections.
   *
   * @see java.awt.Toolkit#getSystemClipboard
   * @see java.awt.datatransfer.Clipboard
   */
  cut(): void {
    if (this.isEditable() && this.isEnabled()) {
      this.invokeAction('cut', TransferHandler.getCutAction());
    }
  }
  /**
   * Transfers the currently selected range in the associated
   * text model to the system clipboard, leaving the contents
   * in the text model.  The current selection remains intact.
   * Does nothing for <code>null</code> selections.
   *
   * @see java.awt.Toolkit#getSystemClipboard
   * @see java.awt.datatransfer.Clipboard
   */
  copy(): void {
    this.invokeAction('copy', TransferHandler.getCopyAction());
  }
  /**
   * Transfers the contents of the system clipboard into the
   * associated text model.  If there is a selection in the
   * associated view, it is replaced with the contents of the
   * clipboard.  If there is no selection, the clipboard contents
   * are inserted in front of the current insert position in
   * the associated view.  If the clipboard is empty, does nothing.
   *
   * @see #replaceSelection
   * @see java.awt.Toolkit#getSystemClipboard
   * @see java.awt.datatransfer.Clipboard
   */
  paste(): void {
    if (this.isEditable() && this.isEnabled()) {
      this.invokeAction('paste', TransferHandler.getPasteAction());
    }
  }
  /**
   * This is a convenience method that is only useful for
   * <code>cut</code>, <code>copy</code> and <code>paste</code>.  If
   * an <code>Action</code> with the name <code>name</code> does not
   * exist in the <code>ActionMap</code>, this will attempt to install a
   * <code>TransferHandler</code> and then use <code>altAction</code>.
   */
  invokeAction(name: string, altAction: Action): void {
    let map = this.getActionMap$();
    let action = null;
    if (map != null) {
      action = map.get(name);
    }
    if (action == null) {
      this.installDefaultTransferHandlerIfNecessary();
      action = altAction;
    }
    action.actionPerformed(new ActionEvent()._ActionEvent$Object$int$String$long$int(this, ActionEvent.ACTION_PERFORMED, action.getValue$String(Action.NAME), EventQueue.getMostRecentEventTime(), this.getCurrentEventModifiers()));
  }
  /**
   * If the current <code>TransferHandler</code> is null, this will
   * install a new one.
   */
  installDefaultTransferHandlerIfNecessary(): void {
    if (this.getTransferHandler() == null) {
      if (JTextComponent.defaultTransferHandler == null) {
        JTextComponent.defaultTransferHandler = new JTextComponent$DefaultTransferHandler()._JTextComponent$DefaultTransferHandler();
      }
      this.setTransferHandler(JTextComponent.defaultTransferHandler);
    }
  }
  /**
   * Moves the caret to a new position, leaving behind a mark
   * defined by the last time <code>setCaretPosition</code> was
   * called.  This forms a selection.
   * If the document is <code>null</code>, does nothing. The position
   * must be between 0 and the length of the component's text or else
   * an exception is thrown.
   *
   * @param pos the position
   * @throws    IllegalArgumentException if the value supplied
   *               for <code>position</code> is less than zero or greater
   *               than the component's text length
   * @see #setCaretPosition
   */
  moveCaretPosition(pos: number): void {
    let doc = this.getDocument();
    if (doc != null) {
      if (pos > doc.getLength() || pos < 0) {
        throw new IllegalArgumentException('bad position: ' + pos);
      }
      this.caret.moveDot$int(pos);
    }
  }
  /**
   * Returns the key accelerator that will cause the receiving
   * text component to get the focus.  Return '\0' if no focus
   * accelerator has been set.
   *
   * @return the key
   */
  getFocusAccelerator(): number {
    return this.focusAccelerator;
  }
  /**
   * Stores the contents of the model into the given
   * stream.  By default this will store the model as plain
   * text.
   *
   * @param out the output stream
   * @throws IOException on any I/O error
   */
  write(out: Writer): void {
    let doc = this.getDocument();
    try {
      this.getUI().getEditorKit(this).write$Writer$Document$int$int(out, doc, 0, doc.getLength());
    } catch ($e1) {
      if ($J.isa($e1, BadLocationException)) {
        let e = $J.exc($e1);
        throw new IOException(e.getMessage());
      } else {
        throw $e1;
      }
    }
  }
  removeNotify(): void {
    super.removeNotify();
    if (JTextComponent.getFocusedComponent() === this) {
      AppContext.getAppContext().remove(JTextComponent.FOCUSED_COMPONENT);
    }
  }
  /**
   * Sets the position of the text insertion caret for the
   * <code>TextComponent</code>.  Note that the caret tracks change,
   * so this may move if the underlying text of the component is changed.
   * If the document is <code>null</code>, does nothing. The position
   * must be between 0 and the length of the component's text or else
   * an exception is thrown.
   *
   * @param position the position
   * @throws    IllegalArgumentException if the value supplied
   *               for <code>position</code> is less than zero or greater
   *               than the component's text length
   */
  setCaretPosition(position: number): void {
    let doc = this.getDocument();
    if (doc != null) {
      if (position > doc.getLength() || position < 0) {
        throw new IllegalArgumentException('bad position: ' + position);
      }
      this.caret.setDot$int(position);
    }
  }
  /**
   * Returns the position of the text insertion caret for the
   * text component.
   *
   * @return the position of the text insertion caret for the
   *  text component &ge; 0
   */
  getCaretPosition(): number {
    return this.caret.getDot();
  }
  /**
   * Sets the text of this <code>TextComponent</code>
   * to the specified text.  If the text is <code>null</code>
   * or empty, has the effect of simply deleting the old text.
   * When text has been inserted, the resulting caret location
   * is determined by the implementation of the caret class.
   *
   * <p>
   * Note that text is not a bound property, so no <code>PropertyChangeEvent
   * </code> is fired when it changes. To listen for changes to the text,
   * use <code>DocumentListener</code>.
   *
   * @param t the new text to be set
   * @see #getText
   * @see DefaultCaret
   */
  setText(t: string): void {
    try {
      let doc = this.getDocument();
      if (doc instanceof AbstractDocument) {
        (doc).replace(0, doc.getLength(), t, null);
      } else {
        doc.remove(0, doc.getLength());
        doc.insertString(0, t, null);
      }
    } catch ($e2) {
      if ($J.isa($e2, BadLocationException)) {
        let e = $J.exc($e2);
        UIManager.getLookAndFeel().provideErrorFeedback(this);
      } else {
        throw $e2;
      }
    }
  }
  /**
   * Returns the text contained in this <code>TextComponent</code>.
   * If the underlying document is <code>null</code>,
   * will give a <code>NullPointerException</code>.
   *
   * Note that text is not a bound property, so no <code>PropertyChangeEvent
   * </code> is fired when it changes. To listen for changes to the text,
   * use <code>DocumentListener</code>.
   *
   * @return the text
   * @throws NullPointerException if the document is <code>null</code>
   * @see #setText
   */
  getText$(): string {
    let doc = this.getDocument();
    let txt: string;
    try {
      txt = doc.getText$int$int(0, doc.getLength());
    } catch ($e3) {
      if ($J.isa($e3, BadLocationException)) {
        let e = $J.exc($e3);
        txt = null;
      } else {
        throw $e3;
      }
    }
    return txt;
  }
  /**
   * Returns the selected text contained in this
   * <code>TextComponent</code>.  If the selection is
   * <code>null</code> or the document empty, returns <code>null</code>.
   *
   * @return the text
   * @throws IllegalArgumentException if the selection doesn't
   *  have a valid mapping into the document for some reason
   * @see #setText
   */
  getSelectedText(): string {
    let txt = null;
    let p0 = Math.min(this.caret.getDot(), this.caret.getMark());
    let p1 = Math.max(this.caret.getDot(), this.caret.getMark());
    if (p0 !== p1) {
      try {
        let doc = this.getDocument();
        txt = doc.getText$int$int(p0, (p1 - p0) | 0);
      } catch ($e4) {
        if ($J.isa($e4, BadLocationException)) {
          let e = $J.exc($e4);
          throw new IllegalArgumentException(e.getMessage());
        } else {
          throw $e4;
        }
      }
    }
    return txt;
  }
  /**
   * Returns the boolean indicating whether this
   * <code>TextComponent</code> is editable or not.
   *
   * @return the boolean value
   * @see #setEditable
   */
  isEditable(): boolean {
    return this.editable;
  }
  /**
   * Sets the specified boolean to indicate whether or not this
   * <code>TextComponent</code> should be editable.
   * A PropertyChange event ("editable") is fired when the
   * state is changed.
   *
   * @param b the boolean to be set
   * @see #isEditable
   */
  setEditable(b: boolean): void {
    if (b !== this.editable) {
      let oldVal = this.editable;
      this.editable = b;
      this.enableInputMethods(this.editable);
      this.firePropertyChange$String$Object$Object('editable', oldVal, this.editable);
      this.repaint$();
    }
  }
  /**
   * Returns the selected text's start position.  Return 0 for an
   * empty document, or the value of dot if no selection.
   *
   * @return the start position &ge; 0
   */
  getSelectionStart(): number {
    let start = Math.min(this.caret.getDot(), this.caret.getMark());
    return start;
  }
  /**
   * Sets the selection start to the specified position.  The new
   * starting point is constrained to be before or at the current
   * selection end.
   * <p>
   * This is available for backward compatibility to code
   * that called this method on <code>java.awt.TextComponent</code>.
   * This is implemented to forward to the <code>Caret</code>
   * implementation which is where the actual selection is maintained.
   *
   * @param selectionStart the start position of the text &ge; 0
   */
  setSelectionStart(selectionStart: number): void {
    this.select(selectionStart, this.getSelectionEnd());
  }
  /**
   * Returns the selected text's end position.  Return 0 if the document
   * is empty, or the value of dot if there is no selection.
   *
   * @return the end position &ge; 0
   */
  getSelectionEnd(): number {
    let end = Math.max(this.caret.getDot(), this.caret.getMark());
    return end;
  }
  /**
   * Sets the selection end to the specified position.  The new
   * end point is constrained to be at or after the current
   * selection start.
   * <p>
   * This is available for backward compatibility to code
   * that called this method on <code>java.awt.TextComponent</code>.
   * This is implemented to forward to the <code>Caret</code>
   * implementation which is where the actual selection is maintained.
   *
   * @param selectionEnd the end position of the text &ge; 0
   */
  setSelectionEnd(selectionEnd: number): void {
    this.select(this.getSelectionStart(), selectionEnd);
  }
  /**
   * Selects the text between the specified start and end positions.
   * <p>
   * This method sets the start and end positions of the
   * selected text, enforcing the restriction that the start position
   * must be greater than or equal to zero.  The end position must be
   * greater than or equal to the start position, and less than or
   * equal to the length of the text component's text.
   * <p>
   * If the caller supplies values that are inconsistent or out of
   * bounds, the method enforces these constraints silently, and
   * without failure. Specifically, if the start position or end
   * position is greater than the length of the text, it is reset to
   * equal the text length. If the start position is less than zero,
   * it is reset to zero, and if the end position is less than the
   * start position, it is reset to the start position.
   * <p>
   * This call is provided for backward compatibility.
   * It is routed to a call to <code>setCaretPosition</code>
   * followed by a call to <code>moveCaretPosition</code>.
   * The preferred way to manage selection is by calling
   * those methods directly.
   *
   * @param selectionStart the start position of the text
   * @param selectionEnd the end position of the text
   * @see #setCaretPosition
   * @see #moveCaretPosition
   */
  select(selectionStart: number, selectionEnd: number): void {
    let docLength = this.getDocument().getLength();
    if (selectionStart < 0) {
      selectionStart = 0;
    }
    if (selectionStart > docLength) {
      selectionStart = docLength;
    }
    if (selectionEnd > docLength) {
      selectionEnd = docLength;
    }
    if (selectionEnd < selectionStart) {
      selectionEnd = selectionStart;
    }
    this.setCaretPosition(selectionStart);
    this.moveCaretPosition(selectionEnd);
  }
  /**
   * Selects all the text in the <code>TextComponent</code>.
   * Does nothing on a <code>null</code> or empty document.
   */
  selectAll(): void {
    let doc = this.getDocument();
    if (doc != null) {
      this.setCaretPosition(0);
      this.moveCaretPosition(doc.getLength());
    }
  }
  /**
   * Returns the string to be used as the tooltip for <code>event</code>.
   * This will return one of:
   * <ol>
   *  <li>If <code>setToolTipText</code> has been invoked with a
   *      non-<code>null</code>
   *      value, it will be returned, otherwise
   *  <li>The value from invoking <code>getToolTipText</code> on
   *      the UI will be returned.
   * </ol>
   * By default <code>JTextComponent</code> does not register
   * itself with the <code>ToolTipManager</code>.
   * This means that tooltips will NOT be shown from the
   * <code>TextUI</code> unless <code>registerComponent</code> has
   * been invoked on the <code>ToolTipManager</code>.
   *
   * @param event the event in question
   * @return the string to be used as the tooltip for <code>event</code>
   * @see javax.swing.JComponent#setToolTipText
   * @see javax.swing.plaf.TextUI#getToolTipText
   * @see javax.swing.ToolTipManager#registerComponent
   */
  getToolTipText$MouseEvent(event: MouseEvent): string {
    let retValue = super.getToolTipText$MouseEvent(event);
    if (retValue == null) {
      let ui = this.getUI();
      if (ui != null) {
        retValue = ui.getToolTipText(this, new Point()._Point$int$int(event.getX(), event.getY()));
      }
    }
    return retValue;
  }
  /**
   * Returns the preferred size of the viewport for a view component.
   * This is implemented to do the default behavior of returning
   * the preferred size of the component.
   *
   * @return the <code>preferredSize</code> of a <code>JViewport</code>
   * whose view is this <code>Scrollable</code>
   */
  getPreferredScrollableViewportSize(): Dimension {
    return this.getPreferredSize$();
  }
  /**
   * Components that display logical rows or columns should compute
   * the scroll increment that will completely expose one new row
   * or column, depending on the value of orientation.  Ideally,
   * components should handle a partially exposed row or column by
   * returning the distance required to completely expose the item.
   * <p>
   * The default implementation of this is to simply return 10% of
   * the visible area.  Subclasses are likely to be able to provide
   * a much more reasonable value.
   *
   * @param visibleRect the view area visible within the viewport
   * @param orientation either <code>SwingConstants.VERTICAL</code> or
   *   <code>SwingConstants.HORIZONTAL</code>
   * @param direction less than zero to scroll up/left, greater than
   *   zero for down/right
   * @return the "unit" increment for scrolling in the specified direction
   * @throws IllegalArgumentException for an invalid orientation
   * @see JScrollBar#setUnitIncrement
   */
  getScrollableUnitIncrement(visibleRect: Rectangle, orientation: number, direction: number): number {
    switch (orientation) {
      case SwingConstants.VERTICAL:
        return $J.idiv(visibleRect.height_, 10);
      case SwingConstants.HORIZONTAL:
        return $J.idiv(visibleRect.width_, 10);
      default:
        throw new IllegalArgumentException('Invalid orientation: ' + orientation);
    }
  }
  /**
   * Components that display logical rows or columns should compute
   * the scroll increment that will completely expose one block
   * of rows or columns, depending on the value of orientation.
   * <p>
   * The default implementation of this is to simply return the visible
   * area.  Subclasses will likely be able to provide a much more
   * reasonable value.
   *
   * @param visibleRect the view area visible within the viewport
   * @param orientation either <code>SwingConstants.VERTICAL</code> or
   *   <code>SwingConstants.HORIZONTAL</code>
   * @param direction less than zero to scroll up/left, greater than zero
   *  for down/right
   * @return the "block" increment for scrolling in the specified direction
   * @throws IllegalArgumentException for an invalid orientation
   * @see JScrollBar#setBlockIncrement
   */
  getScrollableBlockIncrement(visibleRect: Rectangle, orientation: number, direction: number): number {
    switch (orientation) {
      case SwingConstants.VERTICAL:
        return visibleRect.height_;
      case SwingConstants.HORIZONTAL:
        return visibleRect.width_;
      default:
        throw new IllegalArgumentException('Invalid orientation: ' + orientation);
    }
  }
  /**
   * Returns true if a viewport should always force the width of this
   * <code>Scrollable</code> to match the width of the viewport.
   * For example a normal text view that supported line wrapping
   * would return true here, since it would be undesirable for
   * wrapped lines to disappear beyond the right
   * edge of the viewport.  Note that returning true for a
   * <code>Scrollable</code> whose ancestor is a <code>JScrollPane</code>
   * effectively disables horizontal scrolling.
   * <p>
   * Scrolling containers, like <code>JViewport</code>,
   * will use this method each time they are validated.
   *
   * @return true if a viewport should force the <code>Scrollable</code>s
   *   width to match its own
   */
  getScrollableTracksViewportWidth(): boolean {
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      return parent.getWidth() > this.getPreferredSize$().width_;
    }
    return false;
  }
  /**
   * Returns true if a viewport should always force the height of this
   * <code>Scrollable</code> to match the height of the viewport.
   * For example a columnar text view that flowed text in left to
   * right columns could effectively disable vertical scrolling by
   * returning true here.
   * <p>
   * Scrolling containers, like <code>JViewport</code>,
   * will use this method each time they are validated.
   *
   * @return true if a viewport should force the Scrollables height
   *   to match its own
   */
  getScrollableTracksViewportHeight(): boolean {
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      return parent.getHeight() > this.getPreferredSize$().height_;
    }
    return false;
  }
  /**
   * Gets the <code>AccessibleContext</code> associated with this
   * <code>JTextComponent</code>. For text components,
   * the <code>AccessibleContext</code> takes the form of an
   * <code>AccessibleJTextComponent</code>.
   * A new <code>AccessibleJTextComponent</code> instance
   * is created if necessary.
   *
   * @return an <code>AccessibleJTextComponent</code> that serves as the
   *         <code>AccessibleContext</code> of this
   *         <code>JTextComponent</code>
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JTextComponent$AccessibleJTextComponent().$o(this)._JTextComponent$AccessibleJTextComponent();
    }
    return this.accessibleContext;
  }
  /**
   * Returns a string representation of this <code>JTextComponent</code>.
   * This method is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   * <P>
   * Overriding <code>paramString</code> to provide information about the
   * specific new aspects of the JFC components.
   *
   * @return  a string representation of this <code>JTextComponent</code>
   */
  paramString(): string {
    let editableString = (this.editable ? 'true' : 'false');
    let caretColorString = (this.caretColor != null ? this.caretColor.toString() : '');
    let selectionColorString = (this.selectionColor != null ? this.selectionColor.toString() : '');
    let selectedTextColorString = (this.selectedTextColor != null ? this.selectedTextColor.toString() : '');
    let disabledTextColorString = (this.disabledTextColor != null ? this.disabledTextColor.toString() : '');
    let marginString = (this.margin != null ? this.margin.toString() : '');
    return super.paramString() + ',caretColor=' + caretColorString + ',disabledTextColor=' + disabledTextColorString + ',editable=' + editableString + ',margin=' + marginString + ',selectedTextColor=' + selectedTextColorString + ',selectionColor=' + selectionColorString;
  }
  /**
   * Returns the JTextComponent that most recently had focus. The returned
   * value may currently have focus.
   */
  static getFocusedComponent(): JTextComponent {
    return AppContext.getAppContext().get(JTextComponent.FOCUSED_COMPONENT);
  }
  getCurrentEventModifiers(): number {
    let modifiers = 0;
    let currentEvent = EventQueue.getCurrentEvent();
    if (currentEvent instanceof InputEvent) {
      modifiers = (currentEvent).getModifiers();
    } else if (currentEvent instanceof ActionEvent) {
      modifiers = (currentEvent).getModifiers();
    }
    return modifiers;
  }
  processInputMethodEvent(e: InputMethodEvent): void {
    super.processInputMethodEvent(e);
    if (!e.isConsumed()) {
      if (!this.isEditable()) {
        return;
      } else {
        switch (e.getID()) {
          case InputMethodEvent.INPUT_METHOD_TEXT_CHANGED:
            this.replaceInputMethodText(e);
          case InputMethodEvent.CARET_POSITION_CHANGED:
            this.setInputMethodCaretPosition(e);
            break;
        }
      }
      e.consume();
    }
  }
  replaceInputMethodText(e: InputMethodEvent): void {
    let commitCount = e.getCommittedCharacterCount();
    let text = e.getText();
    let composedTextIndex: number;
    let doc = this.getDocument();
    if (this.composedTextExists()) {
      try {
        doc.remove(this.composedTextStart.getOffset(), (this.composedTextEnd.getOffset() - this.composedTextStart.getOffset()) | 0);
      } catch ($e5) {
        if ($J.isa($e5, BadLocationException)) {
          let ble = $J.exc($e5);
        } else {
          throw $e5;
        }
      }
      this.composedTextStart = this.composedTextEnd = null;
      this.composedTextAttribute = null;
      this.composedTextContent = null;
    }
    if (text != null) {
      text.first();
      let committedTextStartIndex = 0;
      let committedTextEndIndex = 0;
      if (commitCount > 0) {
        committedTextStartIndex = this.caret.getDot();
        if (this.shouldSynthensizeKeyEvents()) {
          for (let c = text.current(); commitCount > 0; c = text.next(), commitCount--) {
            let ke = new KeyEvent()._KeyEvent$Component$int$long$int$int$char(this, KeyEvent.KEY_TYPED, EventQueue.getMostRecentEventTime(), 0, KeyEvent.VK_UNDEFINED, c);
            this.processKeyEvent$KeyEvent(ke);
          }
        } else {
          let strBuf = new StringBuilder();
          for (let c = text.current(); commitCount > 0; c = text.next(), commitCount--) {
            strBuf.append(String.fromCharCode(c));
          }
          this.mapCommittedTextToAction(strBuf.toString());
        }
        committedTextEndIndex = this.caret.getDot();
      }
      composedTextIndex = text.getIndex();
      if (composedTextIndex < text.getEndIndex()) {
        this.createComposedTextAttribute(composedTextIndex, text);
        try {
          this.replaceSelection$String(null);
          doc.insertString(this.caret.getDot(), this.composedTextContent, this.composedTextAttribute);
          this.composedTextStart = doc.createPosition((this.caret.getDot() - this.composedTextContent.length) | 0);
          this.composedTextEnd = doc.createPosition(this.caret.getDot());
        } catch ($e6) {
          if ($J.isa($e6, BadLocationException)) {
            let ble = $J.exc($e6);
            this.composedTextStart = this.composedTextEnd = null;
            this.composedTextAttribute = null;
            this.composedTextContent = null;
          } else {
            throw $e6;
          }
        }
      }
      if (committedTextStartIndex !== committedTextEndIndex) {
        try {
          this.latestCommittedTextStart = doc.createPosition(committedTextStartIndex);
          this.latestCommittedTextEnd = doc.createPosition(committedTextEndIndex);
        } catch ($e7) {
          if ($J.isa($e7, BadLocationException)) {
            let ble = $J.exc($e7);
            this.latestCommittedTextStart = this.latestCommittedTextEnd = null;
          } else {
            throw $e7;
          }
        }
      } else {
        this.latestCommittedTextStart = this.latestCommittedTextEnd = null;
      }
    }
  }
  createComposedTextAttribute(composedIndex: number, text: AttributedCharacterIterator): void {
    let doc = this.getDocument();
    let strBuf = new StringBuilder();
    for (let c = text.setIndex(composedIndex); c !== 65535 /* \uffff */; c = text.next()) {
      strBuf.append(String.fromCharCode(c));
    }
    this.composedTextContent = strBuf.toString();
    this.composedTextAttribute = new SimpleAttributeSet()._SimpleAttributeSet$();
    this.composedTextAttribute.addAttribute(StyleConstants.ComposedTextAttribute, new AttributedString(text, composedIndex, text.getEndIndex()));
  }
  /**
   * Saves composed text around the specified position.
   *
   * The composed text (if any) around the specified position is saved
   * in a backing store and removed from the document.
   *
   * @param pos  document position to identify the composed text location
   * @return  {@code true} if the composed text exists and is saved,
   *          {@code false} otherwise
   * @see #restoreComposedText
   * @since 1.7
   */
  saveComposedText(pos: number): boolean {
    if (this.composedTextExists()) {
      let start = this.composedTextStart.getOffset();
      let len = (this.composedTextEnd.getOffset() - this.composedTextStart.getOffset()) | 0;
      if (pos >= start && pos <= ((start + len) | 0)) {
        try {
          this.getDocument().remove(start, len);
          return true;
        } catch ($e8) {
          if ($J.isa($e8, BadLocationException)) {
            let ble = $J.exc($e8);
          } else {
            throw $e8;
          }
        }
      }
    }
    return false;
  }
  /**
   * Restores composed text previously saved by {@code saveComposedText}.
   *
   * The saved composed text is inserted back into the document. This method
   * should be invoked only if {@code saveComposedText} returns {@code true}.
   *
   * @see #saveComposedText
   * @since 1.7
   */
  restoreComposedText(): void {
    let doc = this.getDocument();
    try {
      doc.insertString(this.caret.getDot(), this.composedTextContent, this.composedTextAttribute);
      this.composedTextStart = doc.createPosition((this.caret.getDot() - this.composedTextContent.length) | 0);
      this.composedTextEnd = doc.createPosition(this.caret.getDot());
    } catch ($e9) {
      if ($J.isa($e9, BadLocationException)) {
        let ble = $J.exc($e9);
      } else {
        throw $e9;
      }
    }
  }
  mapCommittedTextToAction(committedText: string): void {
    let binding = this.getKeymap();
    if (binding != null) {
      let a = null;
      if (committedText.length === 1) {
        let k = KeyStroke.getKeyStroke$char(committedText.charCodeAt(0));
        a = binding.getAction(k);
      }
      if (a == null) {
        a = binding.getDefaultAction();
      }
      if (a != null) {
        let ae = new ActionEvent()._ActionEvent$Object$int$String$long$int(this, ActionEvent.ACTION_PERFORMED, committedText, EventQueue.getMostRecentEventTime(), this.getCurrentEventModifiers());
        a.actionPerformed(ae);
      }
    }
  }
  setInputMethodCaretPosition(e: InputMethodEvent): void {
    let dot: number;
    if (this.composedTextExists()) {
      dot = this.composedTextStart.getOffset();
      if (!(this.caret instanceof JTextComponent$ComposedTextCaret)) {
        if (this.composedTextCaret == null) {
          this.composedTextCaret = new JTextComponent$ComposedTextCaret().$o(this)._JTextComponent$ComposedTextCaret();
        }
        this.originalCaret = this.caret;
        this.exchangeCaret(this.originalCaret, this.composedTextCaret);
      }
      let caretPos = e.getCaret();
      if (caretPos != null) {
        let index = caretPos.getInsertionIndex();
        dot = (dot + index) | 0;
        if (index === 0) {
          try {
            let d = this.modelToView(dot);
            let end = this.modelToView(this.composedTextEnd.getOffset());
            let b = this.getBounds$();
            d.x_ = (d.x_ + Math.min((end.x_ - d.x_) | 0, b.width_)) | 0;
            this.scrollRectToVisible(d);
          } catch ($e10) {
            if ($J.isa($e10, BadLocationException)) {
              let ble = $J.exc($e10);
            } else {
              throw $e10;
            }
          }
        }
      }
      this.caret.setDot$int(dot);
    } else if (this.caret instanceof JTextComponent$ComposedTextCaret) {
      dot = this.caret.getDot();
      this.exchangeCaret(this.caret, this.originalCaret);
      this.caret.setDot$int(dot);
    }
  }
  exchangeCaret(oldCaret: Caret, newCaret: Caret): void {
    let blinkRate = oldCaret.getBlinkRate();
    this.setCaret(newCaret);
    this.caret.setBlinkRate(blinkRate);
    this.caret.setVisible(this.hasFocus());
  }
  /**
   * Returns true if KeyEvents should be synthesized from an InputEvent.
   */
  shouldSynthensizeKeyEvents(): boolean {
    if (!this.checkedInputOverride) {
      this.needToSendKeyTypedEvent = !JTextComponent.METHOD_OVERRIDDEN.get($J.getClass(this));
      this.checkedInputOverride = true;
    }
    return this.needToSendKeyTypedEvent;
  }
  composedTextExists(): boolean {
    return (this.composedTextStart != null);
  }
  static $clinit() {
    SwingAccessor.setJTextComponentAccessor(new (JTextComponent$1())());
    JTextComponent.METHOD_OVERRIDDEN = new (JTextComponent$4())()._Cache(Cache_Kind.WEAK, Cache_Kind.STRONG);
    JTextComponent.KEYMAP_TABLE = new StringBuilder('JTextComponent_KeymapTable');
    JTextComponent.FOCUSED_COMPONENT = new StringBuilder('JTextComponent_FocusedComponent');
  }
}

/**
 * Binding record for creating key bindings.
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
export class JTextComponent$KeyBinding extends JObject {
  /**
   * The key.
   */
  key: KeyStroke = null;
  /**
   * The name of the action for the key.
   */
  actionName: string = null;
}

/**
 * This class implements accessibility support for the
 * <code>JTextComponent</code> class.  It provides an implementation of
 * the Java Accessibility API appropriate to menu user-interface elements.
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
export class JTextComponent$AccessibleJTextComponent extends JComponent$AccessibleJComponent {
  caretPos: number = 0;
  oldLocationOnScreen: Point = null;
  /**
   * Constructs an AccessibleJTextComponent.  Adds a listener to track
   * caret change.
   */
  _JTextComponent$AccessibleJTextComponent(): this {
    this._JComponent$AccessibleJComponent();
    let doc = this.$outer.getDocument();
    if (doc != null) {
      doc.addDocumentListener(this);
    }
    this.$outer.addCaretListener(this);
    this.caretPos = this.getCaretPosition();
    try {
      this.oldLocationOnScreen = this.getLocationOnScreen();
    } catch ($e12) {
      if ($J.isa($e12, IllegalComponentStateException)) {
        let iae = $J.exc($e12);
      } else {
        throw $e12;
      }
    }
    this.$outer.addComponentListener(new (JTextComponent$AccessibleJTextComponent$1())().$o(this)._ComponentAdapter());
    return this;
  }
  /**
   * Handles caret updates (fire appropriate property change event,
   * which are AccessibleContext.ACCESSIBLE_CARET_PROPERTY and
   * AccessibleContext.ACCESSIBLE_SELECTION_PROPERTY).
   * This keeps track of the dot position internally.  When the caret
   * moves, the internal position is updated after firing the event.
   *
   * @param e the CaretEvent
   */
  caretUpdate(e: CaretEvent): void {
    let dot = e.getDot();
    let mark = e.getMark();
    if (this.caretPos !== dot) {
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_CARET_PROPERTY, this.caretPos, dot);
      this.caretPos = dot;
      try {
        this.oldLocationOnScreen = this.getLocationOnScreen();
      } catch ($e14) {
        if ($J.isa($e14, IllegalComponentStateException)) {
          let iae = $J.exc($e14);
        } else {
          throw $e14;
        }
      }
    }
    if (mark !== dot) {
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_SELECTION_PROPERTY, null, this.getSelectedText());
    }
  }
  /**
   * Handles document insert (fire appropriate property change event
   * which is AccessibleContext.ACCESSIBLE_TEXT_PROPERTY).
   * This tracks the changed offset via the event.
   *
   * @param e the DocumentEvent
   */
  insertUpdate(e: DocumentEvent): void {
    let pos = e.getOffset();
    if (SwingUtilities.isEventDispatchThread()) {
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_TEXT_PROPERTY, null, pos);
    } else {
      let doFire = () => {
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_TEXT_PROPERTY, null, pos);
      };
      SwingUtilities.invokeLater(doFire);
    }
  }
  /**
   * Handles document remove (fire appropriate property change event,
   * which is AccessibleContext.ACCESSIBLE_TEXT_PROPERTY).
   * This tracks the changed offset via the event.
   *
   * @param e the DocumentEvent
   */
  removeUpdate(e: DocumentEvent): void {
    let pos = e.getOffset();
    if (SwingUtilities.isEventDispatchThread()) {
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_TEXT_PROPERTY, null, pos);
    } else {
      let doFire = () => {
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_TEXT_PROPERTY, null, pos);
      };
      SwingUtilities.invokeLater(doFire);
    }
  }
  /**
   * Handles document remove (fire appropriate property change event,
   * which is AccessibleContext.ACCESSIBLE_TEXT_PROPERTY).
   * This tracks the changed offset via the event.
   *
   * @param e the DocumentEvent
   */
  changedUpdate(e: DocumentEvent): void {
    let pos = e.getOffset();
    if (SwingUtilities.isEventDispatchThread()) {
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_TEXT_PROPERTY, null, pos);
    } else {
      let doFire = () => {
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_TEXT_PROPERTY, null, pos);
      };
      SwingUtilities.invokeLater(doFire);
    }
  }
  /**
   * Returns the zero-based offset of the caret.
   *
   * Note: The character to the right of the caret will have the
   * same index value as the offset (the caret is between
   * two characters).
   *
   * @return the zero-based offset of the caret.
   */
  getCaretPosition(): number {
    return this.$outer.getCaretPosition();
  }
  /**
   * Returns the portion of the text that is selected.
   *
   * @return the text, null if no selection
   */
  getSelectedText(): string {
    return this.$outer.getSelectedText();
  }
}

/**
 * Represents a drop location for <code>JTextComponent</code>s.
 *
 * @see #getDropLocation
 * @since 1.6
 */
export class JTextComponent$DropLocation extends TransferHandler$DropLocation {
  index_: number = 0;
  bias: Position$Bias = null;
  _JTextComponent$DropLocation(p: Point, index: number, bias: Position$Bias): this {
    this._TransferHandler$DropLocation(p);
    this.index_ = index;
    this.bias = bias;
    return this;
  }
  /**
   * Returns the index where dropped data should be inserted into the
   * associated component. This index represents a position between
   * characters, as would be interpreted by a caret.
   *
   * @return the drop index
   */
  getIndex(): number {
    return this.index_;
  }
  /**
   * Returns the bias for the drop index.
   *
   * @return the drop bias
   */
  getBias(): Position$Bias {
    return this.bias;
  }
  /**
   * Returns a string representation of this drop location.
   * This method is intended to be used for debugging purposes,
   * and the content and format of the returned string may vary
   * between implementations.
   *
   * @return a string representation of this drop location
   */
  toString(): string {
    return $J.getClass(this).getName() + '[dropPoint=' + $J.str(this.getDropPoint()) + ',index=' + this.index_ + ',bias=' + $J.str(this.bias) + ']';
  }
}

/**
 * A Simple TransferHandler that exports the data as a String, and
 * imports the data from the String clipboard.  This is only used
 * if the UI hasn't supplied one, which would only happen if someone
 * hasn't subclassed Basic.
 */
export class JTextComponent$DefaultTransferHandler extends TransferHandler {
  _JTextComponent$DefaultTransferHandler(): this {
    this._TransferHandler$();
    return this;
  }
  exportToClipboard(comp: JComponent, clipboard: Clipboard, action: number): void {
    if (comp instanceof JTextComponent) {
      let text = comp;
      let p0 = text.getSelectionStart();
      let p1 = text.getSelectionEnd();
      if (p0 !== p1) {
        try {
          let doc = text.getDocument();
          let srcData = doc.getText$int$int(p0, (p1 - p0) | 0);
          let contents = new StringSelection(srcData);
          clipboard.setContents(contents, null);
          if (action === TransferHandler.MOVE) {
            doc.remove(p0, (p1 - p0) | 0);
          }
        } catch ($e15) {
          if ($J.isa($e15, BadLocationException)) {
            let ble = $J.exc($e15);
          } else {
            throw $e15;
          }
        }
      }
    }
  }
  importData$JComponent$Transferable(comp: JComponent, t: Transferable): boolean {
    if (comp instanceof JTextComponent) {
      let flavor = this.getFlavor(t.getTransferDataFlavors());
      if (flavor != null) {
        let ic = comp.getInputContext();
        if (ic != null) {
          ic.endComposition();
        }
        try {
          let data = t.getTransferData(flavor);
          (comp).replaceSelection$String(data);
          return true;
        } catch ($e16) {
          if ($J.isa($e16, UnsupportedFlavorException) || $J.isa($e16, IOException)) {
            let e = $J.exc($e16);
          } else {
            throw $e16;
          }
        }
      }
    }
    return false;
  }
  getSourceActions(c: JComponent): number {
    return TransferHandler.NONE;
  }
  getFlavor(flavors: DataFlavor[]): DataFlavor {
    if (flavors != null) {
      for (let flavor of flavors) {
        if (flavor.equals(DataFlavor.stringFlavor)) {
          return flavor;
        }
      }
    }
    return null;
  }
}

export class JTextComponent$DefaultKeymap extends JObject {
  nm: string = null;
  parent: Keymap = null;
  bindings: Hashtable<KeyStroke, Action> = null;
  defaultAction: Action = null;
  _JTextComponent$DefaultKeymap(nm: string, parent: Keymap): this {
    this.nm = nm;
    this.parent = parent;
    this.bindings = new Hashtable();
    return this;
  }
  /**
   * Fetch the default action to fire if a
   * key is typed (ie a KEY_TYPED KeyEvent is received)
   * and there is no binding for it.  Typically this
   * would be some action that inserts text so that
   * the keymap doesn't require an action for each
   * possible key.
   */
  getDefaultAction(): Action {
    if (this.defaultAction != null) {
      return this.defaultAction;
    }
    return (this.parent != null) ? this.parent.getDefaultAction() : null;
  }
  /**
   * Set the default action to fire if a key is typed.
   */
  setDefaultAction(a: Action): void {
    this.defaultAction = a;
  }
  getAction(key: KeyStroke): Action {
    let a = this.bindings.get(key);
    if ((a == null) && (this.parent != null)) {
      a = this.parent.getAction(key);
    }
    return a;
  }
  getBoundKeyStrokes(): KeyStroke[] {
    let keys = $J.newArray(this.bindings.size(), null);
    let i = 0;
    for (let e = this.bindings.keys(); e.hasMoreElements(); ) {
      keys[i++] = e.nextElement();
    }
    return keys;
  }
  addActionForKeyStroke(key: KeyStroke, a: Action): void {
    this.bindings.put(key, a);
  }
  /**
   * String representation of the keymap... potentially
   * a very long string.
   */
  toString(): string {
    return 'Keymap[' + this.nm + ']' + $J.str(this.bindings);
  }
}

/**
 * KeymapWrapper wraps a Keymap inside an InputMap. For KeymapWrapper
 * to be useful it must be used with a KeymapActionMap.
 * KeymapWrapper for the most part, is an InputMap with two parents.
 * The first parent visited is ALWAYS the Keymap, with the second
 * parent being the parent inherited from InputMap. If
 * <code>keymap.getAction</code> returns null, implying the Keymap
 * does not have a binding for the KeyStroke,
 * the parent is then visited. If the Keymap has a binding, the
 * Action is returned, if not and the KeyStroke represents a
 * KeyTyped event and the Keymap has a defaultAction,
 * <code>DefaultActionKey</code> is returned.
 * <p>KeymapActionMap is then able to transate the object passed in
 * to either message the Keymap, or message its default implementation.
 */
export class JTextComponent$KeymapWrapper extends InputMap {
  static DefaultActionKey: any = null;
  keymap: Keymap = null;
  _JTextComponent$KeymapWrapper(keymap: Keymap): this {
    this._InputMap();
    this.keymap = keymap;
    return this;
  }
  keys(): KeyStroke[] {
    let sKeys = super.keys();
    let keymapKeys = this.keymap.getBoundKeyStrokes();
    let sCount = (sKeys == null) ? 0 : sKeys.length;
    let keymapCount = (keymapKeys == null) ? 0 : keymapKeys.length;
    if (sCount === 0) {
      return keymapKeys;
    }
    if (keymapCount === 0) {
      return sKeys;
    }
    let retValue = $J.newArray((sCount + keymapCount) | 0, null);
    $J.system_arraycopy(sKeys, 0, retValue, 0, sCount);
    $J.system_arraycopy(keymapKeys, 0, retValue, sCount, keymapCount);
    return retValue;
  }
  size(): number {
    let keymapStrokes = this.keymap.getBoundKeyStrokes();
    let keymapCount = (keymapStrokes == null) ? 0 : keymapStrokes.length;
    return (super.size() + keymapCount) | 0;
  }
  get(keyStroke: KeyStroke): any {
    let retValue = this.keymap.getAction(keyStroke);
    if (retValue == null) {
      retValue = super.get(keyStroke);
      if (retValue == null && keyStroke.getKeyChar() !== KeyEvent.CHAR_UNDEFINED && this.keymap.getDefaultAction() != null) {
        retValue = JTextComponent$KeymapWrapper.DefaultActionKey;
      }
    }
    return retValue;
  }
  static $clinit() {
    JTextComponent$KeymapWrapper.DefaultActionKey = new JObject();
  }
}

/**
 * Wraps a Keymap inside an ActionMap. This is used with
 * a KeymapWrapper. If <code>get</code> is passed in
 * <code>KeymapWrapper.DefaultActionKey</code>, the default action is
 * returned, otherwise if the key is an Action, it is returned.
 */
export class JTextComponent$KeymapActionMap extends ActionMap {
  keymap: Keymap = null;
  _JTextComponent$KeymapActionMap(keymap: Keymap): this {
    this._ActionMap();
    this.keymap = keymap;
    return this;
  }
  get(key: any): Action {
    let retValue = super.get(key);
    if (retValue == null) {
      if (key === JTextComponent$KeymapWrapper.DefaultActionKey) {
        retValue = this.keymap.getDefaultAction();
      } else if ($J.isa(key, Action)) {
        retValue = key;
      }
    }
    return retValue;
  }
}

/**
 * Event to use when firing a notification of change to caret
 * position.  This is mutable so that the event can be reused
 * since caret events can be fairly high in bandwidth.
 */
export class JTextComponent$MutableCaretEvent extends CaretEvent {
  dragActive: boolean = false;
  dot: number = 0;
  mark_: number = 0;
  _JTextComponent$MutableCaretEvent(c: JTextComponent): this {
    this._CaretEvent(c);
    return this;
  }
  fire(): void {
    let c = this.getSource();
    if (c != null) {
      let caret = c.getCaret();
      this.dot = caret.getDot();
      this.mark_ = caret.getMark();
      c.fireCaretUpdate(this);
    }
  }
  toString(): string {
    return 'dot=' + this.dot + ',mark=' + this.mark_;
  }
  getDot(): number {
    return this.dot;
  }
  getMark(): number {
    return this.mark_;
  }
  stateChanged(e: ChangeEvent): void {
    if (!this.dragActive) {
      this.fire();
    }
  }
  focusGained(fe: FocusEvent): void {
    AppContext.getAppContext().put(JTextComponent.FOCUSED_COMPONENT, fe.getSource());
  }
  focusLost(fe: FocusEvent): void {
  }
  /**
   * Requests focus on the associated
   * text component, and try to set the cursor position.
   *
   * @param e the mouse event
   * @see MouseListener#mousePressed
   */
  mousePressed(e: MouseEvent): void {
    this.dragActive = true;
  }
  /**
   * Called when the mouse is released.
   *
   * @param e the mouse event
   * @see MouseListener#mouseReleased
   */
  mouseReleased(e: MouseEvent): void {
    this.dragActive = false;
    this.fire();
  }
  mouseClicked(e: MouseEvent): void {
  }
  mouseEntered(e: MouseEvent): void {
  }
  mouseExited(e: MouseEvent): void {
  }
}

export class JTextComponent$ComposedTextCaret extends DefaultCaret {
  bg: Color = null;
  _JTextComponent$ComposedTextCaret(): this {
    this._DefaultCaret();
    return this;
  }
  install(c: JTextComponent): void {
    super.install(c);
    let doc = c.getDocument();
    if ($J.isa(doc, StyledDocument)) {
      let sDoc = doc;
      let elem = sDoc.getCharacterElement(c.composedTextStart.getOffset());
      let attr = elem.getAttributes();
      this.bg = sDoc.getBackground(attr);
    }
    if (this.bg == null) {
      this.bg = c.getBackground();
    }
  }
  paint(g: Graphics): void {
    if (this.isVisible()) {
      try {
        let r = this.component.modelToView(this.getDot());
        g.setXORMode(this.bg);
        g.drawLine(r.x_, r.y_, r.x_, (r.y_ + r.height_ - 1) | 0);
        g.setPaintMode();
      } catch ($e17) {
        if ($J.isa($e17, BadLocationException)) {
          let e = $J.exc($e17);
        } else {
          throw $e17;
        }
      }
    }
  }
  positionCaret(me: MouseEvent): void {
    let host = this.component;
    let pt = new Point()._Point$int$int(me.getX(), me.getY());
    let offset = host.viewToModel(pt);
    let composedStartIndex = host.composedTextStart.getOffset();
    if ((offset < composedStartIndex) || (offset > this.$outer.composedTextEnd.getOffset())) {
      try {
        let newPos = host.getDocument().createPosition(offset);
        host.getInputContext().endComposition();
        EventQueue.invokeLater($J.fn(new JTextComponent$DoSetCaretPosition()._JTextComponent$DoSetCaretPosition(host, newPos), 'run'));
      } catch ($e18) {
        if ($J.isa($e18, BadLocationException)) {
          let ble = $J.exc($e18);
          $J.err.println($J.str(ble));
        } else {
          throw $e18;
        }
      }
    } else {
      super.positionCaret(me);
    }
  }
}

export class JTextComponent$DoSetCaretPosition extends JObject {
  host: JTextComponent = null;
  newPos: Position = null;
  _JTextComponent$DoSetCaretPosition(host: JTextComponent, newPos: Position): this {
    this.host = host;
    this.newPos = newPos;
    return this;
  }
  run(): void {
    this.host.setCaretPosition(this.newPos.getOffset());
  }
}

let $JTextComponent$1: any = null;
/** An anonymous class (JTextComponent.java:765). */
function JTextComponent$1(): any {
  return $JTextComponent$1 ??= $J.local(class extends JObject {
    dropLocationForPoint(textComp: JTextComponent, p: Point): TransferHandler$DropLocation {
      return textComp.dropLocationForPoint$Point(p);
    }
    setDropLocation(textComp: JTextComponent, location: TransferHandler$DropLocation, state: any, forDrop: boolean): any {
      return textComp.setDropLocation$DropLocation$Object$boolean(location, state, forDrop);
    }
  }, 'javax.swing.text.JTextComponent$1', ['sun.swing.SwingAccessor$JTextComponentAccessor']);
}

let $JTextComponent$4$1: any = null;
/** An anonymous class (JTextComponent.java:3979). */
function JTextComponent$4$1(): any {
  return $JTextComponent$4$1 ??= $J.local(class extends JObject {
    run(): boolean {
      try {
        this.$cv_type.getDeclaredMethod('processInputMethodEvent', $J.cls(InputMethodEvent));
        return true;
      } catch ($e11) {
        if ($J.isa($e11, NoSuchMethodException)) {
          let exception = $J.exc($e11);
          return false;
        } else {
          throw $e11;
        }
      }
    }
    $c($type): this {
      this.$cv_type = $type;
      return this;
    }
  }, 'javax.swing.text.JTextComponent$4$1', ['java.security.PrivilegedAction']);
}

let $JTextComponent$4: any = null;
/** An anonymous class (JTextComponent.java:3965). */
function JTextComponent$4(): any {
  return $JTextComponent$4 ??= $J.local(class extends Cache {
    /**
     * Returns {@code true} if the specified {@code type} extends {@link JTextComponent}
     * and the {@link JTextComponent#processInputMethodEvent} method is overridden.
     */
    create(type$: JClass<any>): boolean {
      if ($J.cls(JTextComponent) === type$) {
        return false;
      }
      if (this.get(type$.getSuperclass())) {
        return true;
      }
      return AccessController.doPrivileged(new (JTextComponent$4$1())().$o(this).$c(type$));
    }
  }, 'javax.swing.text.JTextComponent$4', []);
}

let $JTextComponent$AccessibleJTextComponent$1: any = null;
/** An anonymous class (JTextComponent.java:2587). */
function JTextComponent$AccessibleJTextComponent$1(): any {
  return $JTextComponent$AccessibleJTextComponent$1 ??= $J.local(class extends ComponentAdapter {
    componentMoved(e: ComponentEvent): void {
      try {
        let newLocationOnScreen = this.$outer.getLocationOnScreen();
        this.$outer.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, this.$outer.oldLocationOnScreen, newLocationOnScreen);
        this.$outer.oldLocationOnScreen = newLocationOnScreen;
      } catch ($e13) {
        if ($J.isa($e13, IllegalComponentStateException)) {
          let iae = $J.exc($e13);
        } else {
          throw $e13;
        }
      }
    }
  }, 'javax.swing.text.JTextComponent$AccessibleJTextComponent$1', []);
}

$J.define(JTextComponent, 'javax.swing.text.JTextComponent', { kind: 'class', ifaces: ['javax.swing.Scrollable', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { '': '_JTextComponent' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JTextComponent', 'print(java.text.MessageFormat,java.text.MessageFormat,boolean,javax.print.PrintService,javax.print.attribute.PrintRequestAttributeSet,boolean)': 'print$MessageFormat$MessageFormat$boolean$PrintService$PrintRequestAttributeSet$boolean', 'print(java.text.MessageFormat,java.text.MessageFormat)': 'print$MessageFormat$MessageFormat', 'print()': 'print$', 'getToolTipText(java.awt.event.MouseEvent)': 'getToolTipText$MouseEvent', 'getText()': 'getText$', 'read(java.io.Reader,java.lang.Object)': 'read$Reader$Object', 'getText(int,int)': 'getText$int$int', 'replaceSelection(java.lang.String)': 'replaceSelection$String', 'setDropLocation(javax.swing.TransferHandler$DropLocation,java.lang.Object,boolean)': 'setDropLocation$DropLocation$Object$boolean', 'dropLocationForPoint(java.awt.Point)': 'dropLocationForPoint$Point', 'setUI(javax.swing.plaf.TextUI)': 'setUI$TextUI' }, clinit: true, lazy: ['defaultTransferHandler', 'METHOD_OVERRIDDEN', 'KEYMAP_TABLE', 'FOCUSED_COMPONENT'] });
$J.define(JTextComponent$KeyBinding, 'javax.swing.text.JTextComponent$KeyBinding', { kind: 'class', sup: 'java.lang.Object', ctors: { 'javax.swing.KeyStroke,java.lang.String': '_JTextComponent$KeyBinding' } });
$J.define(JTextComponent$AccessibleJTextComponent, 'javax.swing.text.JTextComponent$AccessibleJTextComponent', { kind: 'class', ifaces: ['javax.accessibility.AccessibleText', 'javax.swing.event.CaretListener', 'javax.swing.event.DocumentListener', 'javax.accessibility.AccessibleAction', 'javax.accessibility.AccessibleEditableText', 'javax.accessibility.AccessibleExtendedText'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JTextComponent$AccessibleJTextComponent' }, meths: { 'getAtIndex(int,int,int)': 'getAtIndex$int$int$int$JTextComponent_AccessibleJTextComponent', 'getAtIndex(int,int)': 'getAtIndex$int$int', 'getAccessibleRole()': 'getAccessibleRole$', 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
$J.define(JTextComponent$DropLocation, 'javax.swing.text.JTextComponent$DropLocation', { kind: 'class', sup: 'javax.swing.TransferHandler$DropLocation', ctors: { 'java.awt.Point,int,javax.swing.text.Position$Bias': '_JTextComponent$DropLocation' } });
$J.define(JTextComponent$DefaultTransferHandler, 'javax.swing.text.JTextComponent$DefaultTransferHandler', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.TransferHandler', ctors: { '': '_JTextComponent$DefaultTransferHandler' }, meths: { 'canImport(javax.swing.JComponent,java.awt.datatransfer.DataFlavor[])': 'canImport$JComponent$DataFlavorArr', 'importData(javax.swing.JComponent,java.awt.datatransfer.Transferable)': 'importData$JComponent$Transferable' } });
$J.define(JTextComponent$DefaultKeymap, 'javax.swing.text.JTextComponent$DefaultKeymap', { kind: 'class', ifaces: ['javax.swing.text.Keymap'], sup: 'java.lang.Object', ctors: { 'java.lang.String,javax.swing.text.Keymap': '_JTextComponent$DefaultKeymap' } });
$J.define(JTextComponent$KeymapWrapper, 'javax.swing.text.JTextComponent$KeymapWrapper', { kind: 'class', sup: 'javax.swing.InputMap', ctors: { 'javax.swing.text.Keymap': '_JTextComponent$KeymapWrapper' }, clinit: true, lazy: ['DefaultActionKey'] });
$J.define(JTextComponent$KeymapActionMap, 'javax.swing.text.JTextComponent$KeymapActionMap', { kind: 'class', sup: 'javax.swing.ActionMap', ctors: { 'javax.swing.text.Keymap': '_JTextComponent$KeymapActionMap' } });
$J.define(JTextComponent$MutableCaretEvent, 'javax.swing.text.JTextComponent$MutableCaretEvent', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.awt.event.FocusListener', 'java.awt.event.MouseListener'], sup: 'javax.swing.event.CaretEvent', ctors: { 'javax.swing.text.JTextComponent': '_JTextComponent$MutableCaretEvent' } });
$J.define(JTextComponent$ComposedTextCaret, 'javax.swing.text.JTextComponent$ComposedTextCaret', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'javax.swing.text.DefaultCaret', ctors: { '': '_JTextComponent$ComposedTextCaret' }, inner: true });
$J.define(JTextComponent$DoSetCaretPosition, 'javax.swing.text.JTextComponent$DoSetCaretPosition', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { 'javax.swing.text.JTextComponent,javax.swing.text.Position': '_JTextComponent$DoSetCaretPosition' } });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  EventQueue = $J.load('java.awt.EventQueue');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  HeadlessException = $J.load('java.awt.HeadlessException');
  IllegalComponentStateException = $J.load('java.awt.IllegalComponentStateException');
  Point = $J.load('java.awt.Point');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  ComponentAdapter = $J.load('java.awt.event.ComponentAdapter');
  InputEvent = $J.load('java.awt.event.InputEvent');
  InputMethodEvent = $J.load('java.awt.event.InputMethodEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  TextAttribute = $J.load('java.awt.font.TextAttribute');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  Action = $J.load('javax.swing.Action');
  DropMode = $J.load('javax.swing.DropMode');
  JViewport = $J.load('javax.swing.JViewport');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  CaretListener = $J.load('javax.swing.event.CaretListener');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  DefaultEditorKit$DefaultKeyTypedAction = $J.load('javax.swing.text.DefaultEditorKit$DefaultKeyTypedAction');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  SimpleAttributeSet = $J.load('javax.swing.text.SimpleAttributeSet');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  StyledDocument = $J.load('javax.swing.text.StyledDocument');
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
});
