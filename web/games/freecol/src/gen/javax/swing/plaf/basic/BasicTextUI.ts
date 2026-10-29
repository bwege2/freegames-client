// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicTextUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2025, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, ClassNotFoundException, DataFlavor, HashSet, Hashtable, IOException, InputStream, JBoolean, JError, JNumber, JObject, JString, Reader, StringBufferInputStream, StringBuilder, StringReader, StringWriter, SynthUI, UnsupportedFlavorException } from '../../../../../jre/index.ts';
import { TextUI } from '../TextUI.ts';
import { DefaultCaret } from '../../text/DefaultCaret.ts';
import { DefaultHighlighter } from '../../text/DefaultHighlighter.ts';
import { Cursor } from '../../../../java/awt/Cursor.ts';
import { View } from '../../text/View.ts';
import { TextAction } from '../../text/TextAction.ts';
import { AbstractAction } from '../../AbstractAction.ts';
import { MouseInputAdapter } from '../../event/MouseInputAdapter.ts';
import { TransferHandler } from '../../TransferHandler.ts';
import { BasicTransferable } from './BasicTransferable.ts';

let ComponentOrientation, Dimension, KeyboardFocusManager, Point, Rectangle, InputEvent, KeyEvent, Action, DropMode, JComponent, JEditorPane, JPasswordField, JTextArea, KeyStroke, LookAndFeel, SwingUtilities, UIManager, ActionMapUIResource, ComponentInputMapUIResource, InputMapUIResource, UIResource, BasicLookAndFeel, DragRecognitionSupport, AbstractDocument, BadLocationException, DefaultEditorKit, DefaultEditorKit$InsertBreakAction, Document, JTextComponent, Position$Bias, DefaultLookup, SwingUtilities2;

/**
 * <p>
 * Basis of a text components look-and-feel.  This provides the
 * basic editor view and controller services that may be useful
 * when creating a look-and-feel for an extension of
 * <code>JTextComponent</code>.
 * <p>
 * Most state is held in the associated <code>JTextComponent</code>
 * as bound properties, and the UI installs default values for the
 * various properties.  This default will install something for
 * all of the properties.  Typically, a LAF implementation will
 * do more however.  At a minimum, a LAF would generally install
 * key bindings.
 * <p>
 * This class also provides some concurrency support if the
 * <code>Document</code> associated with the JTextComponent is a subclass of
 * <code>AbstractDocument</code>.  Access to the View (or View hierarchy) is
 * serialized between any thread mutating the model and the Swing
 * event thread (which is expected to render, do model/view coordinate
 * translation, etc).  <em>Any access to the root view should first
 * acquire a read-lock on the AbstractDocument and release that lock
 * in a finally block.</em>
 * <p>
 * An important method to define is the {@link #getPropertyPrefix} method
 * which is used as the basis of the keys used to fetch defaults
 * from the UIManager.  The string should reflect the type of
 * TextUI (eg. TextField, TextArea, etc) without the particular
 * LAF part of the name (eg Metal, Motif, etc).
 * <p>
 * To build a view of the model, one of the following strategies
 * can be employed.
 * <ol>
 * <li>
 * One strategy is to simply redefine the
 * ViewFactory interface in the UI.  By default, this UI itself acts
 * as the factory for View implementations.  This is useful
 * for simple factories.  To do this reimplement the
 * {@link #create} method.
 * <li>
 * A common strategy for creating more complex types of documents
 * is to have the EditorKit implementation return a factory.  Since
 * the EditorKit ties all of the pieces necessary to maintain a type
 * of document, the factory is typically an important part of that
 * and should be produced by the EditorKit implementation.
 * </ol>
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
 * @author Timothy Prinzing
 * @author Shannon Hickey (drag and drop)
 */
export class BasicTextUI extends TextUI {
  static readonly DEFAULT_CARET_MARGIN: number = 1;
  static textCursor: BasicTextUI$BasicCursor = null;
  static defaultKit: EditorKit = null;
  editor: JTextComponent = null;
  painted: boolean = false;
  rootView: BasicTextUI$RootView = null;
  updateHandler_: BasicTextUI$UpdateHandler = null;
  static defaultTransferHandler: TransferHandler = null;
  dragListener: BasicTextUI$DragListener = null;
  static discardBias: Position$Bias[] = null;
  dropCaret: DefaultCaret = null;
  caretMargin: number = 0;
  /**
   * Creates a new UI.
   */
  _BasicTextUI(): this {
    this._TextUI();
    this.rootView = new BasicTextUI$RootView().$o(this)._BasicTextUI$RootView();
    this.updateHandler_ = new BasicTextUI$UpdateHandler().$o(this)._BasicTextUI$UpdateHandler();
    this.dragListener = BasicTextUI.getDragListener();
    this.painted = false;
    return this;
  }
  /**
   * Creates the object to use for a caret.  By default an
   * instance of BasicCaret is created.  This method
   * can be redefined to provide something else that implements
   * the InputPosition interface or a subclass of JCaret.
   *
   * @return the caret object
   */
  createCaret(): Caret {
    return new BasicTextUI$BasicCaret()._BasicTextUI$BasicCaret();
  }
  /**
   * Creates the object to use for adding highlights.  By default
   * an instance of BasicHighlighter is created.  This method
   * can be redefined to provide something else that implements
   * the Highlighter interface or a subclass of DefaultHighlighter.
   *
   * @return the highlighter
   */
  createHighlighter(): Highlighter {
    return new BasicTextUI$BasicHighlighter()._BasicTextUI$BasicHighlighter();
  }
  /**
   * Fetches the name of the keymap that will be installed/used
   * by default for this UI. This is implemented to create a
   * name based upon the classname.  The name is the name
   * of the class with the package prefix removed.
   *
   * @return the name
   */
  getKeymapName(): string {
    let nm = $J.getClass(this).getName();
    let index = nm.lastIndexOf(String.fromCharCode(46 /* '.' */));
    if (index >= 0) {
      nm = nm.substring((index + 1) | 0);
    }
    return nm;
  }
  /**
   * Creates the keymap to use for the text component, and installs
   * any necessary bindings into it.  By default, the keymap is
   * shared between all instances of this type of TextUI. The
   * keymap has the name defined by the getKeymapName method.  If the
   * keymap is not found, then DEFAULT_KEYMAP from JTextComponent is used.
   * <p>
   * The set of bindings used to create the keymap is fetched
   * from the UIManager using a key formed by combining the
   * {@link #getPropertyPrefix} method
   * and the string <code>.keyBindings</code>.  The type is expected
   * to be <code>JTextComponent.KeyBinding[]</code>.
   *
   * @return the keymap
   * @see #getKeymapName
   * @see javax.swing.text.JTextComponent
   */
  createKeymap(): Keymap {
    let nm = this.getKeymapName();
    let map = JTextComponent.getKeymap(nm);
    var bindings;
    if (map == null) {
      let parent = JTextComponent.getKeymap(JTextComponent.DEFAULT_KEYMAP);
      map = JTextComponent.addKeymap(nm, parent);
      let prefix = this.getPropertyPrefix();
      let o = DefaultLookup.get(this.editor, this, prefix + '.keyBindings');
      var bindings;
      if (Array.isArray((bindings = o))) {
        JTextComponent.loadKeymap(map, bindings, this.getComponent().getActions());
      }
    }
    return map;
  }
  /**
   * This method gets called when a bound property is changed
   * on the associated JTextComponent.  This is a hook
   * which UI implementations may change to reflect how the
   * UI displays bound properties of JTextComponent subclasses.
   * This is implemented to do nothing (i.e. the response to
   * properties in JTextComponent itself are handled prior
   * to calling this method).
   *
   * This implementation updates the background of the text
   * component if the editable and/or enabled state changes.
   *
   * @param evt the property change event
   */
  propertyChange(evt: PropertyChangeEvent): void {
    if ($J.equals(evt.getPropertyName(), 'editable') || $J.equals(evt.getPropertyName(), 'enabled')) {
      this.updateBackground(evt.getSource());
    } else if ($J.equals(evt.getPropertyName(), 'caretWidth')) {
      let value = evt.getNewValue();
      if ($J.isa(value, JNumber)) {
        let width = $J.d2i(+(value));
        if (width >= 0) {
          this.caretMargin = width;
        }
      }
    }
  }
  /**
   * Updates the background of the text component based on whether the
   * text component is editable and/or enabled.
   *
   * @param c the JTextComponent that needs its background color updated
   */
  updateBackground(c: JTextComponent): void {
    if ($J.isa(this, SynthUI) || (c instanceof JTextArea)) {
      return;
    }
    let background = c.getBackground();
    if ($J.isa(background, UIResource)) {
      let prefix = this.getPropertyPrefix();
      let disabledBG = DefaultLookup.getColor$JComponent$ComponentUI$String$Color(c, this, prefix + '.disabledBackground', null);
      let inactiveBG = DefaultLookup.getColor$JComponent$ComponentUI$String$Color(c, this, prefix + '.inactiveBackground', null);
      let bg = DefaultLookup.getColor$JComponent$ComponentUI$String$Color(c, this, prefix + '.background', null);
      if ((c instanceof JTextArea || c instanceof JEditorPane) && background !== disabledBG && background !== inactiveBG && background !== bg) {
        return;
      }
      let newColor = null;
      if (!c.isEnabled()) {
        newColor = disabledBG;
      }
      if (newColor == null && !c.isEditable()) {
        newColor = inactiveBG;
      }
      if (newColor == null) {
        newColor = bg;
      }
      if (newColor != null && newColor !== background) {
        c.setBackground(newColor);
      }
    }
  }
  /**
   * Initializes component properties, such as font, foreground,
   * background, caret color, selection color, selected text color,
   * disabled text color, border, and margin. Each property is set
   * if its current value is either null or a UIResource.
   *
   * @see #uninstallDefaults
   * @see #installUI
   */
  installDefaults(): void {
    let prefix = this.getPropertyPrefix();
    let f = this.editor.getFont();
    if ((f == null) || ($J.isa(f, UIResource))) {
      this.editor.setFont(UIManager.getFont$Object(prefix + '.font'));
    }
    let bg = this.editor.getBackground();
    if ((bg == null) || ($J.isa(bg, UIResource))) {
      this.editor.setBackground(UIManager.getColor$Object(prefix + '.background'));
    }
    let fg = this.editor.getForeground();
    if ((fg == null) || ($J.isa(fg, UIResource))) {
      this.editor.setForeground(UIManager.getColor$Object(prefix + '.foreground'));
    }
    let color = this.editor.getCaretColor();
    if ((color == null) || ($J.isa(color, UIResource))) {
      this.editor.setCaretColor(UIManager.getColor$Object(prefix + '.caretForeground'));
    }
    let s = this.editor.getSelectionColor();
    if ((s == null) || ($J.isa(s, UIResource))) {
      this.editor.setSelectionColor(UIManager.getColor$Object(prefix + '.selectionBackground'));
    }
    let sfg = this.editor.getSelectedTextColor();
    if ((sfg == null) || ($J.isa(sfg, UIResource))) {
      this.editor.setSelectedTextColor(UIManager.getColor$Object(prefix + '.selectionForeground'));
    }
    let dfg = this.editor.getDisabledTextColor();
    if ((dfg == null) || ($J.isa(dfg, UIResource))) {
      this.editor.setDisabledTextColor(UIManager.getColor$Object(prefix + '.inactiveForeground'));
    }
    let b = this.editor.getBorder();
    if ((b == null) || ($J.isa(b, UIResource))) {
      this.editor.setBorder(UIManager.getBorder$Object(prefix + '.border'));
    }
    let margin = this.editor.getMargin();
    if (margin == null || $J.isa(margin, UIResource)) {
      this.editor.setMargin(UIManager.getInsets$Object(prefix + '.margin'));
    }
    this.updateCursor();
  }
  installDefaults2(): void {
    this.editor.addMouseListener(this.dragListener);
    this.editor.addMouseMotionListener(this.dragListener);
    let prefix = this.getPropertyPrefix();
    let caret = this.editor.getCaret();
    if (caret == null || $J.isa(caret, UIResource)) {
      caret = this.createCaret();
      this.editor.setCaret(caret);
      let rate = DefaultLookup.getInt$JComponent$ComponentUI$String$int(this.getComponent(), this, prefix + '.caretBlinkRate', 500);
      caret.setBlinkRate(rate);
    }
    let highlighter = this.editor.getHighlighter();
    if (highlighter == null || $J.isa(highlighter, UIResource)) {
      this.editor.setHighlighter(this.createHighlighter());
    }
    let th = this.editor.getTransferHandler();
    if (th == null || $J.isa(th, UIResource)) {
      this.editor.setTransferHandler(this.getTransferHandler());
    }
  }
  /**
   * Sets the component properties that have not been explicitly overridden
   * to {@code null}.  A property is considered overridden if its current
   * value is not a {@code UIResource}.
   *
   * @see #installDefaults
   * @see #uninstallUI
   */
  uninstallDefaults(): void {
    this.editor.removeMouseListener(this.dragListener);
    this.editor.removeMouseMotionListener(this.dragListener);
    if ($J.isa(this.editor.getCaretColor(), UIResource)) {
      this.editor.setCaretColor(null);
    }
    if ($J.isa(this.editor.getSelectionColor(), UIResource)) {
      this.editor.setSelectionColor(null);
    }
    if ($J.isa(this.editor.getDisabledTextColor(), UIResource)) {
      this.editor.setDisabledTextColor(null);
    }
    if ($J.isa(this.editor.getSelectedTextColor(), UIResource)) {
      this.editor.setSelectedTextColor(null);
    }
    if ($J.isa(this.editor.getBorder(), UIResource)) {
      this.editor.setBorder(null);
    }
    if ($J.isa(this.editor.getMargin(), UIResource)) {
      this.editor.setMargin(null);
    }
    if ($J.isa(this.editor.getCaret(), UIResource)) {
      this.editor.setCaret(null);
    }
    if ($J.isa(this.editor.getHighlighter(), UIResource)) {
      this.editor.setHighlighter(null);
    }
    if ($J.isa(this.editor.getTransferHandler(), UIResource)) {
      this.editor.setTransferHandler(null);
    }
    if ($J.isa(this.editor.getCursor(), UIResource)) {
      this.editor.setCursor$Cursor(null);
    }
  }
  /**
   * Installs listeners for the UI.
   */
  installListeners(): void {
  }
  /**
   * Uninstalls listeners for the UI.
   */
  uninstallListeners(): void {
  }
  /**
   * Registers keyboard actions.
   */
  installKeyboardActions(): void {
    this.editor.setKeymap(this.createKeymap());
    let km = this.getInputMap();
    if (km != null) {
      SwingUtilities.replaceUIInputMap(this.editor, JComponent.WHEN_FOCUSED, km);
    }
    let map = this.getActionMap();
    if (map != null) {
      SwingUtilities.replaceUIActionMap(this.editor, map);
    }
    this.updateFocusAcceleratorBinding(false);
  }
  /**
   * Get the InputMap to use for the UI.
   */
  getInputMap(): InputMap {
    let map = new InputMapUIResource()._InputMapUIResource();
    let shared = DefaultLookup.get(this.editor, this, this.getPropertyPrefix() + '.focusInputMap');
    if (shared != null) {
      map.setParent(shared);
    }
    return map;
  }
  /**
   * Invoked when the focus accelerator changes, this will update the
   * key bindings as necessary.
   */
  updateFocusAcceleratorBinding(changed: boolean): void {
    let accelerator = this.editor.getFocusAccelerator();
    if (changed || accelerator !== 0 /* \u0000 */) {
      let km = SwingUtilities.getUIInputMap(this.editor, JComponent.WHEN_IN_FOCUSED_WINDOW);
      if (km == null && accelerator !== 0 /* \u0000 */) {
        km = new ComponentInputMapUIResource()._ComponentInputMapUIResource(this.editor);
        SwingUtilities.replaceUIInputMap(this.editor, JComponent.WHEN_IN_FOCUSED_WINDOW, km);
        let am = this.getActionMap();
        SwingUtilities.replaceUIActionMap(this.editor, am);
      }
      if (km != null) {
        km.clear();
        if (accelerator !== 0 /* \u0000 */) {
          km.put(KeyStroke.getKeyStroke$int$int(accelerator, BasicLookAndFeel.getFocusAcceleratorKeyMask()), 'requestFocus');
          km.put(KeyStroke.getKeyStroke$int$int(accelerator, SwingUtilities2.setAltGraphMask(BasicLookAndFeel.getFocusAcceleratorKeyMask())), 'requestFocus');
        }
      }
    }
  }
  /**
   * Invoked when editable property is changed.
   *
   * removing 'TAB' and 'SHIFT-TAB' from traversalKeysSet in case
   * editor is editable
   * adding 'TAB' and 'SHIFT-TAB' to traversalKeysSet in case
   * editor is non editable
   */
  updateFocusTraversalKeys(): void {
    let editorKit = this.getEditorKit(this.editor);
    if (editorKit instanceof DefaultEditorKit) {
      let storedForwardTraversalKeys = this.editor.getFocusTraversalKeys(KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS);
      let storedBackwardTraversalKeys = this.editor.getFocusTraversalKeys(KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS);
      let forwardTraversalKeys = new HashSet(storedForwardTraversalKeys);
      let backwardTraversalKeys = new HashSet(storedBackwardTraversalKeys);
      if (this.editor.isEditable()) {
        forwardTraversalKeys.remove(KeyStroke.getKeyStroke$int$int(KeyEvent.VK_TAB, 0));
        backwardTraversalKeys.remove(KeyStroke.getKeyStroke$int$int(KeyEvent.VK_TAB, InputEvent.SHIFT_MASK));
      } else {
        forwardTraversalKeys.add(KeyStroke.getKeyStroke$int$int(KeyEvent.VK_TAB, 0));
        backwardTraversalKeys.add(KeyStroke.getKeyStroke$int$int(KeyEvent.VK_TAB, InputEvent.SHIFT_MASK));
      }
      LookAndFeel.installProperty(this.editor, 'focusTraversalKeysForward', forwardTraversalKeys);
      LookAndFeel.installProperty(this.editor, 'focusTraversalKeysBackward', backwardTraversalKeys);
    }
  }
  /**
   * As needed updates cursor for the target editor.
   */
  updateCursor(): void {
    if ((!this.editor.isCursorSet()) || $J.isa(this.editor.getCursor(), UIResource)) {
      let cursor = (this.editor.isEditable()) ? BasicTextUI.textCursor : null;
      this.editor.setCursor$Cursor(cursor);
    }
  }
  /**
   * Returns the <code>TransferHandler</code> that will be installed if
   * their isn't one installed on the <code>JTextComponent</code>.
   */
  getTransferHandler(): TransferHandler {
    return BasicTextUI.defaultTransferHandler;
  }
  /**
   * Fetch an action map to use.
   */
  getActionMap(): ActionMap {
    let mapName = this.getPropertyPrefix() + '.actionMap';
    let map = UIManager.get$Object(mapName);
    if (map == null) {
      map = this.createActionMap();
      if (map != null) {
        UIManager.getLookAndFeelDefaults().put(mapName, map);
      }
    }
    let componentMap = new ActionMapUIResource()._ActionMapUIResource();
    componentMap.put$Object$Action('requestFocus', new BasicTextUI$FocusAction().$o(this)._BasicTextUI$FocusAction());
    var breakAction;
    if (this.getEditorKit(this.editor) instanceof DefaultEditorKit) {
      var breakAction;
      if (map != null) {
        let obj = map.get(DefaultEditorKit.insertBreakAction);
        var breakAction;
        if ((breakAction = obj) instanceof DefaultEditorKit$InsertBreakAction) {
          let action = new BasicTextUI$TextActionWrapper().$o(this)._BasicTextUI$TextActionWrapper(breakAction);
          componentMap.put$Object$Action(action.getValue$String(Action.NAME), action);
        }
      }
    }
    if (map != null) {
      componentMap.setParent(map);
    }
    return componentMap;
  }
  /**
   * Create a default action map.  This is basically the
   * set of actions found exported by the component.
   */
  createActionMap(): ActionMap {
    let map = new ActionMapUIResource()._ActionMapUIResource();
    let actions = this.editor.getActions();
    let n = actions.length;
    for (let i = 0; i < n; i++) {
      let a = actions[i];
      map.put$Object$Action(a.getValue$String(Action.NAME), a);
    }
    map.put$Object$Action(TransferHandler.getCutAction().getValue$String(Action.NAME), TransferHandler.getCutAction());
    map.put$Object$Action(TransferHandler.getCopyAction().getValue$String(Action.NAME), TransferHandler.getCopyAction());
    map.put$Object$Action(TransferHandler.getPasteAction().getValue$String(Action.NAME), TransferHandler.getPasteAction());
    if (this.getComponent() instanceof JPasswordField) {
      if (map.get(DefaultEditorKit.selectWordAction) != null) {
        map.remove(DefaultEditorKit.selectWordAction);
        let a = map.get(DefaultEditorKit.selectLineAction);
        if (a != null) {
          map.put$Object$Action(DefaultEditorKit.selectWordAction, a);
        }
      }
    }
    return map;
  }
  /**
   * Unregisters keyboard actions.
   */
  uninstallKeyboardActions(): void {
    this.editor.setKeymap(null);
    SwingUtilities.replaceUIInputMap(this.editor, JComponent.WHEN_IN_FOCUSED_WINDOW, null);
    SwingUtilities.replaceUIActionMap(this.editor, null);
  }
  /**
   * Paints a background for the view.  This will only be
   * called if isOpaque() on the associated component is
   * true.  The default is to paint the background color
   * of the component.
   *
   * @param g the graphics context
   */
  paintBackground(g: Graphics): void {
    g.setColor(this.editor.getBackground());
    g.fillRect(0, 0, this.editor.getWidth(), this.editor.getHeight());
  }
  /**
   * Fetches the text component associated with this
   * UI implementation.  This will be null until
   * the ui has been installed.
   *
   * @return the editor component
   */
  getComponent(): JTextComponent {
    return this.editor;
  }
  /**
   * Flags model changes.
   * This is called whenever the model has changed.
   * It is implemented to rebuild the view hierarchy
   * to represent the default root element of the
   * associated model.
   */
  modelChanged(): void {
    let f = this.rootView.getViewFactory();
    let doc = this.editor.getDocument();
    let elem = doc.getDefaultRootElement();
    this.setView(f.create(elem));
  }
  /**
   * Sets the current root of the view hierarchy and calls invalidate().
   * If there were any child components, they will be removed (i.e.
   * there are assumed to have come from components embedded in views).
   *
   * @param v the root view
   */
  setView(v: View): void {
    this.rootView.setView(v);
    this.painted = false;
    this.editor.revalidate();
    this.editor.repaint$();
  }
  /**
   * Paints the interface safely with a guarantee that
   * the model won't change from the view of this thread.
   * This does the following things, rendering from
   * back to front.
   * <ol>
   * <li>
   * If the component is marked as opaque, the background
   * is painted in the current background color of the
   * component.
   * <li>
   * The highlights (if any) are painted.
   * <li>
   * The view hierarchy is painted.
   * <li>
   * The caret is painted.
   * </ol>
   *
   * @param g the graphics context
   */
  paintSafely(g: Graphics): void {
    this.painted = true;
    let highlighter = this.editor.getHighlighter();
    let caret = this.editor.getCaret();
    if (this.editor.isOpaque()) {
      this.paintBackground(g);
    }
    if (highlighter != null) {
      highlighter.paint(g);
    }
    let alloc = this.getVisibleEditorRect();
    if (alloc != null) {
      this.rootView.paint(g, alloc);
    }
    if (caret != null) {
      caret.paint(g);
    }
    if (this.dropCaret != null) {
      this.dropCaret.paint(g);
    }
  }
  /**
   * Installs the UI for a component.  This does the following
   * things.
   * <ol>
   * <li>
   * Sets the associated component to opaque if the opaque property
   * has not already been set by the client program. This will cause the
   * component's background color to be painted.
   * <li>
   * Installs the default caret and highlighter into the
   * associated component. These properties are only set if their
   * current value is either {@code null} or an instance of
   * {@link UIResource}.
   * <li>
   * Attaches to the editor and model.  If there is no
   * model, a default one is created.
   * <li>
   * Creates the view factory and the view hierarchy used
   * to represent the model.
   * </ol>
   *
   * @param c the editor component
   * @see ComponentUI#installUI
   */
  installUI(c: JComponent): void {
    if (c instanceof JTextComponent) {
      this.editor = c;
      LookAndFeel.installProperty(this.editor, 'opaque', true);
      LookAndFeel.installProperty(this.editor, 'autoscrolls', true);
      this.installDefaults();
      this.installDefaults2();
      this.caretMargin = -1;
      let property = UIManager.get$Object('Caret.width');
      if ($J.isa(property, JNumber)) {
        this.caretMargin = $J.d2i(+(property));
      }
      property = c.getClientProperty('caretWidth');
      if ($J.isa(property, JNumber)) {
        this.caretMargin = $J.d2i(+(property));
      }
      if (this.caretMargin < 0) {
        this.caretMargin = BasicTextUI.DEFAULT_CARET_MARGIN;
      }
      this.editor.addPropertyChangeListener$PropertyChangeListener($J.fn(this.updateHandler_, 'propertyChange'));
      let doc = this.editor.getDocument();
      if (doc == null) {
        this.editor.setDocument(this.getEditorKit(this.editor).createDefaultDocument$());
      } else {
        doc.addDocumentListener(this.updateHandler_);
        this.modelChanged();
      }
      this.installListeners();
      this.installKeyboardActions();
      let oldLayout = this.editor.getLayout();
      if ((oldLayout == null) || ($J.isa(oldLayout, UIResource))) {
        this.editor.setLayout(this.updateHandler_);
      }
      this.updateBackground(this.editor);
    } else {
      throw new JError('TextUI needs JTextComponent');
    }
  }
  /**
   * Deinstalls the UI for a component.  This removes the listeners,
   * uninstalls the highlighter, removes views, and nulls out the keymap.
   *
   * @param c the editor component
   * @see ComponentUI#uninstallUI
   */
  uninstallUI(c: JComponent): void {
    this.editor.removePropertyChangeListener$PropertyChangeListener($J.fn(this.updateHandler_, 'propertyChange'));
    this.editor.getDocument().removeDocumentListener(this.updateHandler_);
    this.painted = false;
    this.uninstallDefaults();
    this.rootView.setView(null);
    c.removeAll();
    let lm = c.getLayout();
    if ($J.isa(lm, UIResource)) {
      c.setLayout(null);
    }
    this.uninstallKeyboardActions();
    this.uninstallListeners();
    this.editor = null;
  }
  /**
   * Superclass paints background in an uncontrollable way
   * (i.e. one might want an image tiled into the background).
   * To prevent this from happening twice, this method is
   * reimplemented to simply paint.
   * <p>
   * <em>NOTE:</em> Superclass is also not thread-safe in its
   * rendering of the background, although that is not an issue with the
   * default rendering.
   */
  update(g: Graphics, c: JComponent): void {
    this.paint(g, c);
  }
  /**
   * Paints the interface.  This is routed to the
   * paintSafely method under the guarantee that
   * the model won't change from the view of this thread
   * while it's rendering (if the associated model is
   * derived from AbstractDocument).  This enables the
   * model to potentially be updated asynchronously.
   *
   * @param g the graphics context
   * @param c the editor component
   */
  paint(g: Graphics, c: JComponent): void {
    if ((this.rootView.getViewCount() > 0) && (this.rootView.getView(0) != null)) {
      let doc = this.editor.getDocument();
      if (doc instanceof AbstractDocument) {
        (doc).readLock();
      }
      try {
        this.paintSafely(g);
      } finally {
        if (doc instanceof AbstractDocument) {
          (doc).readUnlock();
        }
      }
    }
  }
  /**
   * Gets the preferred size for the editor component.  If the component
   * has been given a size prior to receiving this request, it will
   * set the size of the view hierarchy to reflect the size of the component
   * before requesting the preferred size of the view hierarchy.  This
   * allows formatted views to format to the current component size before
   * answering the request.  Other views don't care about currently formatted
   * size and give the same answer either way.
   *
   * @param c the editor component
   * @return the size
   */
  getPreferredSize$JComponent(c: JComponent): Dimension {
    let doc = this.editor.getDocument();
    let i = c.getInsets$();
    let d = c.getSize$();
    if (doc instanceof AbstractDocument) {
      (doc).readLock();
    }
    try {
      if ((d.width_ > ((i.left + i.right + this.caretMargin) | 0)) && (d.height_ > ((i.top + i.bottom) | 0))) {
        this.rootView.setSize(Math.fround((d.width_ - i.left - i.right - this.caretMargin) | 0), Math.fround((d.height_ - i.top - i.bottom) | 0));
      } else if (d.width_ === 0 && d.height_ === 0) {
        this.rootView.setSize(Math.fround(2147483647), Math.fround(2147483647));
      }
      d.width_ = (Math.min($J.d2l(this.rootView.getPreferredSpan(View.X_AXIS)) + i.left + i.right + this.caretMargin, 2147483647)) | 0;
      d.height_ = (Math.min($J.d2l(this.rootView.getPreferredSpan(View.Y_AXIS)) + i.top + i.bottom, 2147483647)) | 0;
    } finally {
      if (doc instanceof AbstractDocument) {
        (doc).readUnlock();
      }
    }
    return d;
  }
  /**
   * Gets the minimum size for the editor component.
   *
   * @param c the editor component
   * @return the size
   */
  getMinimumSize(c: JComponent): Dimension {
    let doc = this.editor.getDocument();
    let i = c.getInsets$();
    let d = new Dimension()._Dimension$();
    if (doc instanceof AbstractDocument) {
      (doc).readLock();
    }
    try {
      d.width_ = ($J.d2i(this.rootView.getMinimumSpan(View.X_AXIS)) + i.left + i.right + this.caretMargin) | 0;
      d.height_ = ($J.d2i(this.rootView.getMinimumSpan(View.Y_AXIS)) + i.top + i.bottom) | 0;
    } finally {
      if (doc instanceof AbstractDocument) {
        (doc).readUnlock();
      }
    }
    return d;
  }
  /**
   * Gets the maximum size for the editor component.
   *
   * @param c the editor component
   * @return the size
   */
  getMaximumSize(c: JComponent): Dimension {
    let doc = this.editor.getDocument();
    let i = c.getInsets$();
    let d = new Dimension()._Dimension$();
    if (doc instanceof AbstractDocument) {
      (doc).readLock();
    }
    try {
      d.width_ = (Math.min($J.d2l(this.rootView.getMaximumSpan(View.X_AXIS)) + i.left + i.right + this.caretMargin, 2147483647)) | 0;
      d.height_ = (Math.min($J.d2l(this.rootView.getMaximumSpan(View.Y_AXIS)) + i.top + i.bottom, 2147483647)) | 0;
    } finally {
      if (doc instanceof AbstractDocument) {
        (doc).readUnlock();
      }
    }
    return d;
  }
  /**
   * Gets the allocation to give the root View.  Due
   * to an unfortunate set of historical events this
   * method is inappropriately named.  The Rectangle
   * returned has nothing to do with visibility.
   * The component must have a non-zero positive size for
   * this translation to be computed.
   *
   * @return the bounding box for the root view
   */
  getVisibleEditorRect(): Rectangle {
    let alloc = this.editor.getBounds$();
    if ((alloc.width_ > 0) && (alloc.height_ > 0)) {
      alloc.x_ = alloc.y_ = 0;
      let insets = this.editor.getInsets$();
      alloc.x_ = (alloc.x_ + insets.left) | 0;
      alloc.y_ = (alloc.y_ + insets.top) | 0;
      alloc.width_ = (alloc.width_ - (insets.left + insets.right + this.caretMargin)) | 0;
      alloc.height_ = (alloc.height_ - (insets.top + insets.bottom)) | 0;
      return alloc;
    }
    return null;
  }
  /**
   * Converts the given location in the model to a place in
   * the view coordinate system.
   * The component must have a non-zero positive size for
   * this translation to be computed.
   *
   * @param tc the text component for which this UI is installed
   * @param pos the local location in the model to translate &gt;= 0
   * @return the coordinates as a rectangle, null if the model is not painted
   * @throws BadLocationException  if the given position does not
   *   represent a valid location in the associated document
   * @see TextUI#modelToView
   *
   * @deprecated replaced by
   *     {@link #modelToView2D(JTextComponent, int, Position.Bias)}
   */
  modelToView$JTextComponent$int(tc: JTextComponent, pos: number): Rectangle {
    return this.modelToView$JTextComponent$int$Bias(tc, pos, Position$Bias.Forward);
  }
  /**
   * Converts the given location in the model to a place in
   * the view coordinate system.
   * The component must have a non-zero positive size for
   * this translation to be computed.
   *
   * @param tc the text component for which this UI is installed
   * @param pos the local location in the model to translate &gt;= 0
   * @return the coordinates as a rectangle, null if the model is not painted
   * @throws BadLocationException  if the given position does not
   *   represent a valid location in the associated document
   * @see TextUI#modelToView
   *
   * @deprecated replaced by
   *     {@link #modelToView2D(JTextComponent, int, Position.Bias)}
   */
  modelToView$JTextComponent$int$Bias(tc: JTextComponent, pos: number, bias: Position$Bias): Rectangle {
    return this.modelToView$JTextComponent$int$Bias$boolean$BasicTextUI(tc, pos, bias, false);
  }
  modelToView2D(tc: JTextComponent, pos: number, bias: Position$Bias): Rectangle2D {
    return this.modelToView$JTextComponent$int$Bias$boolean$BasicTextUI(tc, pos, bias, true);
  }
  modelToView$JTextComponent$int$Bias$boolean$BasicTextUI(tc: JTextComponent, pos: number, bias: Position$Bias, useFPAPI: boolean): Rectangle2D {
    let doc = this.editor.getDocument();
    if (doc instanceof AbstractDocument) {
      (doc).readLock();
    }
    try {
      let alloc = this.getVisibleEditorRect();
      if (alloc != null) {
        this.rootView.setSize(Math.fround(alloc.width_), Math.fround(alloc.height_));
        let s = this.rootView.modelToView$int$Shape$Bias(pos, alloc, bias);
        if (s != null) {
          return useFPAPI ? s.getBounds2D() : s.getBounds();
        }
      }
    } finally {
      if (doc instanceof AbstractDocument) {
        (doc).readUnlock();
      }
    }
    return null;
  }
  /**
   * Converts the given place in the view coordinate system
   * to the nearest representative location in the model.
   * The component must have a non-zero positive size for
   * this translation to be computed.
   *
   * @param tc the text component for which this UI is installed
   * @param pt the location in the view to translate.  This
   *  should be in the same coordinate system as the mouse events.
   * @return the offset from the start of the document &gt;= 0,
   *   -1 if not painted
   * @see TextUI#viewToModel
   *
   * @deprecated replaced by
   *     {@link #viewToModel2D(JTextComponent, Point2D, Position.Bias[])}
   */
  viewToModel$JTextComponent$Point(tc: JTextComponent, pt: Point): number {
    return this.viewToModel$JTextComponent$Point$BiasArr(tc, pt, BasicTextUI.discardBias);
  }
  /**
   * Converts the given place in the view coordinate system
   * to the nearest representative location in the model.
   * The component must have a non-zero positive size for
   * this translation to be computed.
   *
   * @param tc the text component for which this UI is installed
   * @param pt the location in the view to translate.  This
   *  should be in the same coordinate system as the mouse events.
   * @return the offset from the start of the document &gt;= 0,
   *   -1 if the component doesn't yet have a positive size.
   * @see TextUI#viewToModel
   *
   * @deprecated replaced by
   *     {@link #viewToModel2D(JTextComponent, Point2D, Position.Bias[])}
   */
  viewToModel$JTextComponent$Point$BiasArr(tc: JTextComponent, pt: Point, biasReturn: Position$Bias[]): number {
    return this.viewToModel$JTextComponent$float$float$BiasArr$BasicTextUI(tc, Math.fround(pt.x_), Math.fround(pt.y_), biasReturn);
  }
  viewToModel$JTextComponent$float$float$BiasArr$BasicTextUI(tc: JTextComponent, x: number, y: number, biasReturn: Position$Bias[]): number {
    let offs = -1;
    let doc = this.editor.getDocument();
    if (doc instanceof AbstractDocument) {
      (doc).readLock();
    }
    try {
      let alloc = this.getVisibleEditorRect();
      if (alloc != null) {
        this.rootView.setSize(Math.fround(alloc.width_), Math.fround(alloc.height_));
        offs = this.rootView.viewToModel$float$float$Shape$BiasArr(x, y, alloc, biasReturn);
      }
    } finally {
      if (doc instanceof AbstractDocument) {
        (doc).readUnlock();
      }
    }
    return offs;
  }
  /**
   * {@inheritDoc}
   */
  getNextVisualPositionFrom(t: JTextComponent, pos: number, b: Position$Bias, direction: number, biasRet: Position$Bias[]): number {
    let doc = this.editor.getDocument();
    if (pos < -1 || pos > doc.getLength()) {
      throw new BadLocationException()._BadLocationException('Invalid position', pos);
    }
    if (doc instanceof AbstractDocument) {
      (doc).readLock();
    }
    try {
      if (this.painted) {
        let alloc = this.getVisibleEditorRect();
        if (alloc != null) {
          this.rootView.setSize(Math.fround(alloc.width_), Math.fround(alloc.height_));
        }
        return this.rootView.getNextVisualPositionFrom(pos, b, alloc, direction, biasRet);
      }
    } finally {
      if (doc instanceof AbstractDocument) {
        (doc).readUnlock();
      }
    }
    return -1;
  }
  /**
   * Causes the portion of the view responsible for the
   * given part of the model to be repainted.  Does nothing if
   * the view is not currently painted.
   *
   * @param tc the text component for which this UI is installed
   * @param p0 the beginning of the range &gt;= 0
   * @param p1 the end of the range &gt;= p0
   * @see TextUI#damageRange
   */
  damageRange$JTextComponent$int$int(tc: JTextComponent, p0: number, p1: number): void {
    this.damageRange$JTextComponent$int$int$Bias$Bias(tc, p0, p1, Position$Bias.Forward, Position$Bias.Backward);
  }
  /**
   * Causes the portion of the view responsible for the
   * given part of the model to be repainted.
   *
   * @param p0 the beginning of the range &gt;= 0
   * @param p1 the end of the range &gt;= p0
   */
  damageRange$JTextComponent$int$int$Bias$Bias(t: JTextComponent, p0: number, p1: number, p0Bias: Position$Bias, p1Bias: Position$Bias): void {
    if (this.painted) {
      let alloc = this.getVisibleEditorRect();
      if (alloc != null) {
        let doc = t.getDocument();
        if (doc instanceof AbstractDocument) {
          (doc).readLock();
        }
        try {
          this.rootView.setSize(Math.fround(alloc.width_), Math.fround(alloc.height_));
          let toDamage = this.rootView.modelToView$int$Bias$int$Bias$Shape(p0, p0Bias, p1, p1Bias, alloc);
          let rect = (toDamage instanceof Rectangle) ? toDamage : toDamage.getBounds();
          this.editor.repaint$int$int$int$int(rect.x_, rect.y_, rect.width_, rect.height_);
        } catch ($e0) {
          if ($J.isa($e0, BadLocationException)) {
            let e = $J.exc($e0);
          } else {
            throw $e0;
          }
        } finally {
          if (doc instanceof AbstractDocument) {
            (doc).readUnlock();
          }
        }
      }
    }
  }
  /**
   * Fetches the EditorKit for the UI.
   *
   * @param tc the text component for which this UI is installed
   * @return the editor capabilities
   * @see TextUI#getEditorKit
   */
  getEditorKit(tc: JTextComponent): EditorKit {
    return BasicTextUI.defaultKit;
  }
  /**
   * Fetches a View with the allocation of the associated
   * text component (i.e. the root of the hierarchy) that
   * can be traversed to determine how the model is being
   * represented spatially.
   * <p>
   * <strong>Warning:</strong> The View hierarchy can
   * be traversed from the root view, and other things
   * can be done as well.  Things done in this way cannot
   * be protected like simple method calls through the TextUI.
   * Therefore, proper operation in the presence of concurrency
   * must be arranged by any logic that calls this method!
   *
   * @param tc the text component for which this UI is installed
   * @return the view
   * @see TextUI#getRootView
   */
  getRootView(tc: JTextComponent): View {
    return this.rootView;
  }
  /**
   * Returns the string to be used as the tooltip at the passed in location.
   * This forwards the method onto the root View.
   *
   * @see javax.swing.text.JTextComponent#getToolTipText
   * @see javax.swing.text.View#getToolTipText
   * @since 1.4
   */
  getToolTipText(t: JTextComponent, pt: Point): string {
    if (!this.painted) {
      return null;
    }
    let doc = this.editor.getDocument();
    let tt = null;
    let alloc = this.getVisibleEditorRect();
    if (alloc != null) {
      if (doc instanceof AbstractDocument) {
        (doc).readLock();
      }
      try {
        tt = this.rootView.getToolTipText(Math.fround(pt.x_), Math.fround(pt.y_), alloc);
      } finally {
        if (doc instanceof AbstractDocument) {
          (doc).readUnlock();
        }
      }
    }
    return tt;
  }
  /**
   * Creates a view for an element.
   * If a subclass wishes to directly implement the factory
   * producing the view(s), it should reimplement this
   * method.  By default it simply returns null indicating
   * it is unable to represent the element.
   *
   * @param elem the element
   * @return the view
   */
  create(elem: Element): View {
    return null;
  }
  static getDragListener(): BasicTextUI$DragListener {
    {
      let listener = AppContext.getAppContext().get($J.cls(BasicTextUI$DragListener));
      if (listener == null) {
        listener = new BasicTextUI$DragListener()._BasicTextUI$DragListener();
        AppContext.getAppContext().put($J.cls(BasicTextUI$DragListener), listener);
      }
      return listener;
    }
  }
  static $clinit() {
    BasicTextUI.textCursor = new BasicTextUI$BasicCursor()._BasicTextUI$BasicCursor$int(Cursor.TEXT_CURSOR);
    BasicTextUI.defaultKit = new DefaultEditorKit()._DefaultEditorKit();
    BasicTextUI.defaultTransferHandler = new BasicTextUI$TextTransferHandler()._BasicTextUI$TextTransferHandler();
    BasicTextUI.discardBias = $J.newArray(1, null);
  }
}

/**
 * Default implementation of the interface {@code Caret}.
 */
export class BasicTextUI$BasicCaret extends DefaultCaret {
  /**
   * Constructs a {@code BasicCaret}.
   */
  _BasicTextUI$BasicCaret(): this {
    this._DefaultCaret();
    return this;
  }
}

/**
 * Default implementation of the interface {@code Highlighter}.
 */
export class BasicTextUI$BasicHighlighter extends DefaultHighlighter {
  /**
   * Constructs a {@code BasicHighlighter}.
   */
  _BasicTextUI$BasicHighlighter(): this {
    this._DefaultHighlighter();
    return this;
  }
}

export class BasicTextUI$BasicCursor extends Cursor {
  _BasicTextUI$BasicCursor$int(type$: number): this {
    this._Cursor$int(type$);
    return this;
  }
}

/**
 * Root view that acts as a gateway between the component
 * and the View hierarchy.
 */
export class BasicTextUI$RootView extends View {
  view: View = null;
  _BasicTextUI$RootView(): this {
    this._View(null);
    return this;
  }
  setView(v: View): void {
    let oldView = this.view;
    this.view = null;
    if (oldView != null) {
      oldView.setParent(null);
    }
    if (v != null) {
      v.setParent(this);
    }
    this.view = v;
  }
  /**
   * Fetches the attributes to use when rendering.  At the root
   * level there are no attributes.  If an attribute is resolved
   * up the view hierarchy this is the end of the line.
   */
  getAttributes(): AttributeSet {
    return null;
  }
  /**
   * Determines the preferred span for this view along an axis.
   *
   * @param axis may be either X_AXIS or Y_AXIS
   * @return the span the view would like to be rendered into.
   *         Typically the view is told to render into the span
   *         that is returned, although there is no guarantee.
   *         The parent may choose to resize or break the view.
   */
  getPreferredSpan(axis: number): number {
    if (this.view != null) {
      return this.view.getPreferredSpan(axis);
    }
    return 10;
  }
  /**
   * Determines the minimum span for this view along an axis.
   *
   * @param axis may be either X_AXIS or Y_AXIS
   * @return the span the view would like to be rendered into.
   *         Typically the view is told to render into the span
   *         that is returned, although there is no guarantee.
   *         The parent may choose to resize or break the view.
   */
  getMinimumSpan(axis: number): number {
    if (this.view != null) {
      return this.view.getMinimumSpan(axis);
    }
    return 10;
  }
  /**
   * Determines the maximum span for this view along an axis.
   *
   * @param axis may be either X_AXIS or Y_AXIS
   * @return the span the view would like to be rendered into.
   *         Typically the view is told to render into the span
   *         that is returned, although there is no guarantee.
   *         The parent may choose to resize or break the view.
   */
  getMaximumSpan(axis: number): number {
    return Math.fround(2147483647);
  }
  /**
   * Specifies that a preference has changed.
   * Child views can call this on the parent to indicate that
   * the preference has changed.  The root view routes this to
   * invalidate on the hosting component.
   * <p>
   * This can be called on a different thread from the
   * event dispatching thread and is basically unsafe to
   * propagate into the component.  To make this safe,
   * the operation is transferred over to the event dispatching
   * thread for completion.  It is a design goal that all view
   * methods be safe to call without concern for concurrency,
   * and this behavior helps make that true.
   *
   * @param child the child view
   * @param width true if the width preference has changed
   * @param height true if the height preference has changed
   */
  preferenceChanged(child: View, width: boolean, height: boolean): void {
    this.$outer.editor.revalidate();
  }
  /**
   * Determines the desired alignment for this view along an axis.
   *
   * @param axis may be either X_AXIS or Y_AXIS
   * @return the desired alignment, where 0.0 indicates the origin
   *     and 1.0 the full span away from the origin
   */
  getAlignment(axis: number): number {
    if (this.view != null) {
      return this.view.getAlignment(axis);
    }
    return 0;
  }
  /**
   * Renders the view.
   *
   * @param g the graphics context
   * @param allocation the region to render into
   */
  paint(g: Graphics, allocation: Shape): void {
    if (this.view != null) {
      let alloc = (allocation instanceof Rectangle) ? allocation : allocation.getBounds();
      this.setSize(Math.fround(alloc.width_), Math.fround(alloc.height_));
      this.view.paint(g, allocation);
    }
  }
  /**
   * Sets the view parent.
   *
   * @param parent the parent view
   */
  setParent(parent: View): void {
    throw new JError('Can\'t set parent on root view');
  }
  /**
   * Returns the number of views in this view.  Since
   * this view simply wraps the root of the view hierarchy
   * it has exactly one child.
   *
   * @return the number of views
   * @see #getView
   */
  getViewCount(): number {
    return 1;
  }
  /**
   * Gets the n-th view in this container.
   *
   * @param n the number of the view to get
   * @return the view
   */
  getView(n: number): View {
    return this.view;
  }
  /**
   * Returns the child view index representing the given position in
   * the model.  This is implemented to return the index of the only
   * child.
   *
   * @param pos the position &gt;= 0
   * @return  index of the view representing the given position, or
   *   -1 if no view represents that position
   * @since 1.3
   */
  getViewIndex$int$Bias(pos: number, b: Position$Bias): number {
    return 0;
  }
  /**
   * Fetches the allocation for the given child view.
   * This enables finding out where various views
   * are located, without assuming the views store
   * their location.  This returns the given allocation
   * since this view simply acts as a gateway between
   * the view hierarchy and the associated component.
   *
   * @param index the index of the child
   * @param a  the allocation to this view.
   * @return the allocation to the child
   */
  getChildAllocation(index: number, a: Shape): Shape {
    return a;
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.
   *
   * @param pos the position to convert
   * @param a the allocated region to render into
   * @return the bounding box of the given position
   */
  modelToView$int$Shape$Bias(pos: number, a: Shape, b: Position$Bias): Shape {
    if (this.view != null) {
      return this.view.modelToView$int$Shape$Bias(pos, a, b);
    }
    return null;
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.
   *
   * @param p0 the position to convert &gt;= 0
   * @param b0 the bias toward the previous character or the
   *  next character represented by p0, in case the
   *  position is a boundary of two views.
   * @param p1 the position to convert &gt;= 0
   * @param b1 the bias toward the previous character or the
   *  next character represented by p1, in case the
   *  position is a boundary of two views.
   * @param a the allocated region to render into
   * @return the bounding box of the given position is returned
   * @throws BadLocationException  if the given position does
   *   not represent a valid location in the associated document
   * @throws IllegalArgumentException for an invalid bias argument
   * @see View#viewToModel
   */
  modelToView$int$Bias$int$Bias$Shape(p0: number, b0: Position$Bias, p1: number, b1: Position$Bias, a: Shape): Shape {
    if (this.view != null) {
      return this.view.modelToView$int$Bias$int$Bias$Shape(p0, b0, p1, b1, a);
    }
    return null;
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param x x coordinate of the view location to convert
   * @param y y coordinate of the view location to convert
   * @param a the allocated region to render into
   * @return the location within the model that best represents the
   *    given point in the view
   */
  viewToModel$float$float$Shape$BiasArr(x: number, y: number, a: Shape, bias: Position$Bias[]): number {
    if (this.view != null) {
      let retValue = this.view.viewToModel$float$float$Shape$BiasArr(x, y, a, bias);
      return retValue;
    }
    return -1;
  }
  /**
   * Provides a way to determine the next visually represented model
   * location that one might place a caret.  Some views may not be visible,
   * they might not be in the same order found in the model, or they just
   * might not allow access to some of the locations in the model.
   * This method enables specifying a position to convert
   * within the range of &gt;=0.  If the value is -1, a position
   * will be calculated automatically.  If the value &lt; -1,
   * the {@code BadLocationException} will be thrown.
   *
   * @param pos the position to convert &gt;= 0
   * @param a the allocated region to render into
   * @param direction the direction from the current position that can
   *  be thought of as the arrow keys typically found on a keyboard.
   *  This may be SwingConstants.WEST, SwingConstants.EAST,
   *  SwingConstants.NORTH, or SwingConstants.SOUTH.
   * @return the location within the model that best represents the next
   *  location visual position.
   * @throws BadLocationException the given position is not a valid
   *                                 position within the document
   * @throws IllegalArgumentException for an invalid direction
   */
  getNextVisualPositionFrom(pos: number, b: Position$Bias, a: Shape, direction: number, biasRet: Position$Bias[]): number {
    if (pos < -1 || pos > this.getDocument().getLength()) {
      throw new BadLocationException()._BadLocationException('invalid position', pos);
    }
    if (this.view != null) {
      let nextPos = this.view.getNextVisualPositionFrom(pos, b, a, direction, biasRet);
      if (nextPos !== -1) {
        pos = nextPos;
      } else {
        biasRet[0] = b;
      }
    }
    return pos;
  }
  /**
   * Gives notification that something was inserted into the document
   * in a location that this view is responsible for.
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   */
  insertUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    if (this.view != null) {
      this.view.insertUpdate(e, a, f);
    }
  }
  /**
   * Gives notification that something was removed from the document
   * in a location that this view is responsible for.
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   */
  removeUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    if (this.view != null) {
      this.view.removeUpdate(e, a, f);
    }
  }
  /**
   * Gives notification from the document that attributes were changed
   * in a location that this view is responsible for.
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   */
  changedUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    if (this.view != null) {
      this.view.changedUpdate(e, a, f);
    }
  }
  /**
   * Returns the document model underlying the view.
   *
   * @return the model
   */
  getDocument(): Document {
    return this.$outer.editor.getDocument();
  }
  /**
   * Returns the starting offset into the model for this view.
   *
   * @return the starting offset
   */
  getStartOffset(): number {
    if (this.view != null) {
      return this.view.getStartOffset();
    }
    return this.getElement().getStartOffset();
  }
  /**
   * Returns the ending offset into the model for this view.
   *
   * @return the ending offset
   */
  getEndOffset(): number {
    if (this.view != null) {
      return this.view.getEndOffset();
    }
    return this.getElement().getEndOffset();
  }
  /**
   * Gets the element that this view is mapped to.
   *
   * @return the view
   */
  getElement(): Element {
    if (this.view != null) {
      return this.view.getElement();
    }
    return this.$outer.editor.getDocument().getDefaultRootElement();
  }
  /**
   * Determines the resizability of the view along the
   * given axis.  A value of 0 or less is not resizable.
   *
   * @param axis may be either X_AXIS or Y_AXIS
   * @return the weight
   */
  getResizeWeight(axis: number): number {
    if (this.view != null) {
      return this.view.getResizeWeight(axis);
    }
    return 0;
  }
  /**
   * Sets the view size.
   *
   * @param width the width
   * @param height the height
   */
  setSize(width: number, height: number): void {
    if (this.view != null) {
      this.view.setSize(width, height);
    }
  }
  /**
   * Fetches the container hosting the view.  This is useful for
   * things like scheduling a repaint, finding out the host
   * components font, etc.  The default implementation
   * of this is to forward the query to the parent view.
   *
   * @return the container
   */
  getContainer(): Container {
    return this.$outer.editor;
  }
  /**
   * Fetches the factory to be used for building the
   * various view fragments that make up the view that
   * represents the model.  This is what determines
   * how the model will be represented.  This is implemented
   * to fetch the factory provided by the associated
   * EditorKit unless that is null, in which case this
   * simply returns the BasicTextUI itself which allows
   * subclasses to implement a simple factory directly without
   * creating extra objects.
   *
   * @return the factory
   */
  getViewFactory(): ViewFactory {
    let kit = this.$outer.getEditorKit(this.$outer.editor);
    let f = kit.getViewFactory();
    if (f != null) {
      return f;
    }
    return this.$outer;
  }
}

/**
 * Handles updates from various places.  If the model is changed,
 * this class unregisters as a listener to the old model and
 * registers with the new model.  If the document model changes,
 * the change is forwarded to the root view.  If the focus
 * accelerator changes, a new keystroke is registered to request
 * focus.
 */
export class BasicTextUI$UpdateHandler extends JObject {
  /**
   * The "layout constraints" for the LayoutManager2 implementation.
   * These are View objects for those components that are represented
   * by a View in the View tree.
   */
  constraints: Hashtable<Component, any> = null;
  i18nView: boolean = false;
  _BasicTextUI$UpdateHandler(): this {
    this.i18nView = false;
    return this;
  }
  /**
   * This method gets called when a bound property is changed.
   * We are looking for document changes on the editor.
   */
  propertyChange(evt: PropertyChangeEvent): void {
    let oldValue = evt.getOldValue();
    let newValue = evt.getNewValue();
    let propertyName = evt.getPropertyName();
    if (($J.isa(oldValue, Document)) || ($J.isa(newValue, Document))) {
      if (oldValue != null) {
        (oldValue).removeDocumentListener(this);
        this.i18nView = false;
      }
      if (newValue != null) {
        (newValue).addDocumentListener(this);
        if ('document' === propertyName) {
          this.$outer.setView(null);
          this.$outer.propertyChange(evt);
          this.$outer.modelChanged();
          return;
        }
      }
      this.$outer.modelChanged();
    }
    if ('focusAccelerator' === propertyName) {
      this.$outer.updateFocusAcceleratorBinding(true);
    } else if ('componentOrientation' === propertyName) {
      let document = this.$outer.editor.getDocument();
      let I18NProperty = 'i18n';
      if (ComponentOrientation.RIGHT_TO_LEFT === newValue && !$J.equals(true, document.getProperty(I18NProperty))) {
        document.putProperty(I18NProperty, true);
      }
      this.$outer.modelChanged();
    } else if ('font' === propertyName) {
      this.$outer.modelChanged();
    } else if ('dropLocation' === propertyName) {
      this.dropIndexChanged();
    } else if ('editable' === propertyName) {
      this.$outer.updateCursor();
      this.$outer.modelChanged();
    }
    this.$outer.propertyChange(evt);
  }
  dropIndexChanged(): void {
    if (this.$outer.editor.getDropMode() === DropMode.USE_SELECTION) {
      return;
    }
    let dropLocation = this.$outer.editor.getDropLocation();
    if (dropLocation == null) {
      if (this.$outer.dropCaret != null) {
        this.$outer.dropCaret.deinstall(this.$outer.editor);
        this.$outer.editor.repaint$Rectangle(this.$outer.dropCaret);
        this.$outer.dropCaret = null;
      }
    } else {
      if (this.$outer.dropCaret == null) {
        this.$outer.dropCaret = new BasicTextUI$BasicCaret()._BasicTextUI$BasicCaret();
        this.$outer.dropCaret.install(this.$outer.editor);
        this.$outer.dropCaret.setVisible(true);
      }
      this.$outer.dropCaret.setDot$int$Bias(dropLocation.getIndex(), dropLocation.getBias());
    }
  }
  /**
   * The insert notification.  Gets sent to the root of the view structure
   * that represents the portion of the model being represented by the
   * editor.  The factory is added as an argument to the update so that
   * the views can update themselves in a dynamic (not hardcoded) way.
   *
   * @param e  The change notification from the currently associated
   *  document.
   * @see DocumentListener#insertUpdate
   */
  insertUpdate(e: DocumentEvent): void {
    let doc = e.getDocument();
    let o = doc.getProperty('i18n');
    if ($J.isa(o, JBoolean)) {
      let i18nFlag = o;
      if (i18nFlag !== this.i18nView) {
        this.i18nView = i18nFlag;
        this.$outer.modelChanged();
        return;
      }
    }
    let alloc = (this.$outer.painted) ? this.$outer.getVisibleEditorRect() : null;
    this.$outer.rootView.insertUpdate(e, alloc, this.$outer.rootView.getViewFactory());
  }
  /**
   * The remove notification.  Gets sent to the root of the view structure
   * that represents the portion of the model being represented by the
   * editor.  The factory is added as an argument to the update so that
   * the views can update themselves in a dynamic (not hardcoded) way.
   *
   * @param e  The change notification from the currently associated
   *  document.
   * @see DocumentListener#removeUpdate
   */
  removeUpdate(e: DocumentEvent): void {
    let alloc = (this.$outer.painted) ? this.$outer.getVisibleEditorRect() : null;
    this.$outer.rootView.removeUpdate(e, alloc, this.$outer.rootView.getViewFactory());
  }
  /**
   * The change notification.  Gets sent to the root of the view structure
   * that represents the portion of the model being represented by the
   * editor.  The factory is added as an argument to the update so that
   * the views can update themselves in a dynamic (not hardcoded) way.
   *
   * @param e  The change notification from the currently associated
   *  document.
   * @see DocumentListener#changedUpdate(DocumentEvent)
   */
  changedUpdate(e: DocumentEvent): void {
    let alloc = (this.$outer.painted) ? this.$outer.getVisibleEditorRect() : null;
    this.$outer.rootView.changedUpdate(e, alloc, this.$outer.rootView.getViewFactory());
  }
  /**
   * Adds the specified component with the specified name to
   * the layout.
   * @param name the component name
   * @param comp the component to be added
   */
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  /**
   * Removes the specified component from the layout.
   * @param comp the component to be removed
   */
  removeLayoutComponent(comp: Component): void {
    if (this.constraints != null) {
      this.constraints.remove(comp);
    }
  }
  /**
   * Calculates the preferred size dimensions for the specified
   * panel given the components in the specified parent container.
   * @param parent the component to be laid out
   *
   * @see #minimumLayoutSize
   */
  preferredLayoutSize(parent: Container): Dimension {
    return null;
  }
  /**
   * Calculates the minimum size dimensions for the specified
   * panel given the components in the specified parent container.
   * @param parent the component to be laid out
   * @see #preferredLayoutSize
   */
  minimumLayoutSize(parent: Container): Dimension {
    return null;
  }
  /**
   * Lays out the container in the specified panel.  This is
   * implemented to position all components that were added
   * with a View object as a constraint.  The current allocation
   * of the associated View is used as the location of the
   * component.
   * <p>
   * A read-lock is acquired on the document to prevent the
   * view tree from being modified while the layout process
   * is active.
   *
   * @param parent the component which needs to be laid out
   */
  layoutContainer$Container(parent: Container): void {
    if ((this.constraints != null) && (!this.constraints.isEmpty())) {
      let alloc = this.$outer.getVisibleEditorRect();
      if (alloc != null) {
        let doc = this.$outer.editor.getDocument();
        if (doc instanceof AbstractDocument) {
          (doc).readLock();
        }
        try {
          this.$outer.rootView.setSize(Math.fround(alloc.width_), Math.fround(alloc.height_));
          let components = this.constraints.keys();
          while (components.hasMoreElements()) {
            let comp = components.nextElement();
            let v = this.constraints.get(comp);
            let ca = this.calculateViewPosition(alloc, v);
            if (ca != null) {
              let compAlloc = (ca instanceof Rectangle) ? ca : ca.getBounds();
              comp.setBounds$Rectangle(compAlloc);
            }
          }
        } finally {
          if (doc instanceof AbstractDocument) {
            (doc).readUnlock();
          }
        }
      }
    }
  }
  /**
   * Find the Shape representing the given view.
   */
  calculateViewPosition(alloc: Shape, v: View): Shape {
    let pos = v.getStartOffset();
    let child = null;
    for (let parent = this.$outer.rootView; (parent != null) && (parent !== v); parent = child) {
      let index = parent.getViewIndex$int$Bias(pos, Position$Bias.Forward);
      alloc = parent.getChildAllocation(index, alloc);
      child = parent.getView(index);
    }
    return (child != null) ? alloc : null;
  }
  /**
   * Adds the specified component to the layout, using the specified
   * constraint object.  We only store those components that were added
   * with a constraint that is of type View.
   *
   * @param comp the component to be added
   * @param constraint  where/how the component is added to the layout.
   */
  addLayoutComponent$Component$Object(comp: Component, constraint: any): void {
    if (constraint instanceof View) {
      if (this.constraints == null) {
        this.constraints = new Hashtable(7);
      }
      this.constraints.put(comp, constraint);
    }
  }
  /**
   * Returns the maximum size of this component.
   * @see java.awt.Component#getMinimumSize()
   * @see java.awt.Component#getPreferredSize()
   * @see LayoutManager
   */
  maximumLayoutSize(target: Container): Dimension {
    return null;
  }
  /**
   * Returns the alignment along the x axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   */
  getLayoutAlignmentX(target: Container): number {
    return 0.5;
  }
  /**
   * Returns the alignment along the y axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   */
  getLayoutAlignmentY(target: Container): number {
    return 0.5;
  }
  /**
   * Invalidates the layout, indicating that if the layout manager
   * has cached information it should be discarded.
   */
  invalidateLayout(target: Container): void {
  }
}

/**
 * Wrapper for text actions to return isEnabled false in case editor is non editable
 */
export class BasicTextUI$TextActionWrapper extends TextAction {
  action_: TextAction = null;
  _BasicTextUI$TextActionWrapper(action: TextAction): this {
    this._TextAction(action.getValue$String(Action.NAME));
    this.action_ = null;
    this.action_ = action;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    this.action_.actionPerformed(e);
  }
  isEnabled(): boolean {
    return (this.$outer.editor == null || this.$outer.editor.isEditable()) ? this.action_.isEnabled() : false;
  }
}

/**
 * Registered in the ActionMap.
 */
export class BasicTextUI$FocusAction extends AbstractAction {
  _BasicTextUI$FocusAction(): this {
    this._AbstractAction$();
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    this.$outer.editor.requestFocus$();
  }
  isEnabled(): boolean {
    return this.$outer.editor.isEditable();
  }
}

/**
 * Listens for mouse events for the purposes of detecting drag gestures.
 * BasicTextUI will maintain one of these per AppContext.
 */
export class BasicTextUI$DragListener extends MouseInputAdapter {
  dragStarted: boolean = false;
  _BasicTextUI$DragListener(): this {
    this._MouseInputAdapter();
    return this;
  }
  dragStarting(me: MouseEvent): void {
    this.dragStarted = true;
  }
  mousePressed(e: MouseEvent): void {
    let c = e.getSource();
    if (c.getDragEnabled()) {
      this.dragStarted = false;
      if (this.isDragPossible(e) && DragRecognitionSupport.mousePressed(e)) {
        e.consume();
      }
    }
  }
  mouseReleased(e: MouseEvent): void {
    let c = e.getSource();
    if (c.getDragEnabled()) {
      if (this.dragStarted) {
        e.consume();
      }
      DragRecognitionSupport.mouseReleased(e);
    }
  }
  mouseDragged(e: MouseEvent): void {
    let c = e.getSource();
    if (c.getDragEnabled()) {
      if (this.dragStarted || DragRecognitionSupport.mouseDragged(e, this)) {
        e.consume();
      }
    }
  }
  /**
   * Determines if the following are true:
   * <ul>
   * <li>the component is enabled
   * <li>the press event is located over a selection
   * </ul>
   */
  isDragPossible(e: MouseEvent): boolean {
    let c = e.getSource();
    if (c.isEnabled()) {
      let caret = c.getCaret();
      let dot = caret.getDot();
      let mark = caret.getMark();
      if (dot !== mark) {
        let p = new Point()._Point$int$int(e.getX(), e.getY());
        let pos = c.viewToModel(p);
        let p0 = Math.min(dot, mark);
        let p1 = Math.max(dot, mark);
        if ((pos >= p0) && (pos < p1)) {
          return true;
        }
      }
    }
    return false;
  }
}

export class BasicTextUI$TextTransferHandler extends TransferHandler {
  exportComp: JTextComponent = null;
  shouldRemove: boolean = false;
  p0: number = 0;
  p1: number = 0;
  /**
   * Whether or not this is a drop using
   * <code>DropMode.INSERT</code>.
   */
  modeBetween: boolean = false;
  /**
   * Whether or not this is a drop.
   */
  isDrop_: boolean = false;
  /**
   * The drop action.
   */
  dropAction: number = 0;
  /**
   * The drop bias.
   */
  dropBias: Position$Bias = null;
  _BasicTextUI$TextTransferHandler(): this {
    this._TransferHandler$();
    this.modeBetween = false;
    this.isDrop_ = false;
    this.dropAction = TransferHandler.MOVE;
    return this;
  }
  /**
   * Try to find a flavor that can be used to import a Transferable.
   * The set of usable flavors are tried in the following order:
   * <ol>
   *     <li>First, an attempt is made to find a flavor matching the content type
   *         of the EditorKit for the component.
   *     <li>Second, an attempt to find a text/plain flavor is made.
   *     <li>Third, an attempt to find a flavor representing a String reference
   *         in the same VM is made.
   *     <li>Lastly, DataFlavor.stringFlavor is searched for.
   * </ol>
   */
  getImportFlavor(flavors: DataFlavor[], c: JTextComponent): DataFlavor {
    let plainFlavor = null;
    let refFlavor = null;
    let stringFlavor = null;
    if (c instanceof JEditorPane) {
      for (let i = 0; i < flavors.length; i++) {
        let mime = flavors[i].getMimeType();
        if (mime.startsWith((c).getEditorKit().getContentType$())) {
          return flavors[i];
        } else if (plainFlavor == null && mime.startsWith('text/plain')) {
          plainFlavor = flavors[i];
        } else if (refFlavor == null && mime.startsWith('application/x-java-jvm-local-objectref') && flavors[i].getRepresentationClass() === $J.cls(JString)) {
          refFlavor = flavors[i];
        } else if (stringFlavor == null && flavors[i].equals(DataFlavor.stringFlavor)) {
          stringFlavor = flavors[i];
        }
      }
      if (plainFlavor != null) {
        return plainFlavor;
      } else if (refFlavor != null) {
        return refFlavor;
      } else if (stringFlavor != null) {
        return stringFlavor;
      }
      return null;
    }
    for (let i = 0; i < flavors.length; i++) {
      let mime = flavors[i].getMimeType();
      if (mime.startsWith('text/plain')) {
        return flavors[i];
      } else if (refFlavor == null && mime.startsWith('application/x-java-jvm-local-objectref') && flavors[i].getRepresentationClass() === $J.cls(JString)) {
        refFlavor = flavors[i];
      } else if (stringFlavor == null && flavors[i].equals(DataFlavor.stringFlavor)) {
        stringFlavor = flavors[i];
      }
    }
    if (refFlavor != null) {
      return refFlavor;
    } else if (stringFlavor != null) {
      return stringFlavor;
    }
    return null;
  }
  /**
   * Import the given stream data into the text component.
   */
  handleReaderImport(in$: Reader, c: JTextComponent, useRead: boolean): void {
    if (useRead) {
      let startPosition = c.getSelectionStart();
      let endPosition = c.getSelectionEnd();
      let length = (endPosition - startPosition) | 0;
      let kit = c.getUI().getEditorKit(c);
      let doc = c.getDocument();
      if (length > 0) {
        doc.remove(startPosition, length);
      }
      kit.read$Reader$Document$int(in$, doc, startPosition);
    } else {
      let buff = $J.newArray(1024, 0);
      let nch: number;
      let lastWasCR = false;
      let last: number;
      let sbuff = null;
      while ((nch = in$.read(buff, 0, buff.length)) !== -1) {
        if (sbuff == null) {
          sbuff = new StringBuilder(nch);
        }
        last = 0;
        for (let counter = 0; counter < nch; counter++) {
          switch (buff[counter]) {
            case 13 /* \u000d */:
              if (lastWasCR) {
                if (counter === 0) {
                  sbuff.append(String.fromCharCode(10 /* \u000a */));
                } else {
                  (buff[(counter - 1) | 0]) = 10 /* \u000a */;
                }
              } else {
                lastWasCR = true;
              }
              break;
            case 10 /* \u000a */:
              if (lastWasCR) {
                if (counter > ((last + 1) | 0)) {
                  sbuff.append(buff, last, (counter - last - 1) | 0);
                }
                lastWasCR = false;
                last = counter;
              }
              break;
            default:
              if (lastWasCR) {
                if (counter === 0) {
                  sbuff.append(String.fromCharCode(10 /* \u000a */));
                } else {
                  (buff[(counter - 1) | 0]) = 10 /* \u000a */;
                }
                lastWasCR = false;
              }
              break;
          }
        }
        if (last < nch) {
          if (lastWasCR) {
            if (last < ((nch - 1) | 0)) {
              sbuff.append(buff, last, (nch - last - 1) | 0);
            }
          } else {
            sbuff.append(buff, last, (nch - last) | 0);
          }
        }
      }
      if (lastWasCR) {
        sbuff.append(String.fromCharCode(10 /* \u000a */));
      }
      c.replaceSelection$String(sbuff != null ? sbuff.toString() : '');
    }
  }
  /**
   * This is the type of transfer actions supported by the source.  Some models are
   * not mutable, so a transfer operation of COPY only should
   * be advertised in that case.
   *
   * @param c  The component holding the data to be transferred.  This
   *  argument is provided to enable sharing of TransferHandlers by
   *  multiple components.
   * @return  This is implemented to return NONE if the component is a JPasswordField
   *  since exporting data via user gestures is not allowed.  If the text component is
   *  editable, COPY_OR_MOVE is returned, otherwise just COPY is allowed.
   */
  getSourceActions(c: JComponent): number {
    if (c instanceof JPasswordField && c.getClientProperty('JPasswordField.cutCopyAllowed') !== true) {
      return TransferHandler.NONE;
    }
    return (c).isEditable() ? TransferHandler.COPY_OR_MOVE : TransferHandler.COPY;
  }
  /**
   * Create a Transferable to use as the source for a data transfer.
   *
   * @param comp  The component holding the data to be transferred.  This
   *  argument is provided to enable sharing of TransferHandlers by
   *  multiple components.
   * @return  The representation of the data to be transferred.
   */
  createTransferable(comp: JComponent): Transferable {
    this.exportComp = comp;
    this.shouldRemove = true;
    this.p0 = this.exportComp.getSelectionStart();
    this.p1 = this.exportComp.getSelectionEnd();
    return (this.p0 !== this.p1) ? (new BasicTextUI$TextTransferHandler$TextTransferable()._BasicTextUI$TextTransferHandler$TextTransferable(this.exportComp, this.p0, this.p1)) : null;
  }
  /**
   * This method is called after data has been exported.  This method should remove
   * the data that was transferred if the action was MOVE.
   *
   * @param source The component that was the source of the data.
   * @param data   The data that was transferred or possibly null
   *               if the action is <code>NONE</code>.
   * @param action The actual action that was performed.
   */
  exportDone(source: JComponent, data: Transferable, action: number): void {
    if (this.shouldRemove && action === TransferHandler.MOVE) {
      let t = data;
      t.removeText();
    }
    this.exportComp = null;
  }
  importData$TransferSupport(support: TransferHandler$TransferSupport): boolean {
    this.isDrop_ = support.isDrop();
    if (this.isDrop_) {
      this.modeBetween = (support.getComponent()).getDropMode() === DropMode.INSERT;
      this.dropBias = (support.getDropLocation()).getBias();
      this.dropAction = support.getDropAction();
    }
    try {
      return super.importData$TransferSupport(support);
    } finally {
      this.isDrop_ = false;
      this.modeBetween = false;
      this.dropBias = null;
      this.dropAction = TransferHandler.MOVE;
    }
  }
  /**
   * This method causes a transfer to a component from a clipboard or a
   * DND drop operation.  The Transferable represents the data to be
   * imported into the component.
   *
   * @param comp  The component to receive the transfer.  This
   *  argument is provided to enable sharing of TransferHandlers by
   *  multiple components.
   * @param t     The data to import
   * @return  true if the data was inserted into the component, false otherwise.
   */
  importData$JComponent$Transferable(comp: JComponent, t: Transferable): boolean {
    let c = comp;
    let pos = this.modeBetween ? c.getDropLocation().getIndex() : c.getCaretPosition();
    if (this.dropAction === TransferHandler.MOVE && c === this.exportComp && pos >= this.p0 && pos <= this.p1) {
      this.shouldRemove = false;
      return true;
    }
    let imported = false;
    let importFlavor = this.getImportFlavor(t.getTransferDataFlavors(), c);
    if (importFlavor != null) {
      try {
        let useRead = false;
        if (comp instanceof JEditorPane) {
          let ep = comp;
          if (!ep.getContentType().startsWith('text/plain') && importFlavor.getMimeType().startsWith(ep.getContentType())) {
            useRead = true;
          }
        }
        let ic = c.getInputContext();
        if (ic != null) {
          ic.endComposition();
        }
        let r = importFlavor.getReaderForText(t);
        if (this.modeBetween) {
          let caret = c.getCaret();
          if (caret instanceof DefaultCaret) {
            (caret).setDot$int$Bias(pos, this.dropBias);
          } else {
            c.setCaretPosition(pos);
          }
        }
        this.handleReaderImport(r, c, useRead);
        if (this.isDrop_) {
          c.requestFocus$();
          let caret = c.getCaret();
          if (caret instanceof DefaultCaret) {
            let newPos = caret.getDot();
            let newBias = (caret).getDotBias();
            (caret).setDot$int$Bias(pos, this.dropBias);
            (caret).moveDot$int$Bias(newPos, newBias);
          } else {
            c.select(pos, c.getCaretPosition());
          }
        }
        imported = true;
      } catch ($e1) {
        if ($J.isa($e1, UnsupportedFlavorException) || $J.isa($e1, IOException) || $J.isa($e1, BadLocationException)) {
          let ex = $J.exc($e1);
        } else {
          throw $e1;
        }
      }
    }
    return imported;
  }
}

/**
 * A possible implementation of the Transferable interface
 * for text components.  For a JEditorPane with a rich set
 * of EditorKit implementations, conversions could be made
 * giving a wider set of formats.  This is implemented to
 * offer up only the active content type and text/plain
 * (if that is not the active format) since that can be
 * extracted from other formats.
 */
export class BasicTextUI$TextTransferHandler$TextTransferable extends BasicTransferable {
  p0: Position = null;
  p1: Position = null;
  mimeType: string = null;
  richText: string = null;
  c: JTextComponent = null;
  _BasicTextUI$TextTransferHandler$TextTransferable(c: JTextComponent, start: number, end: number): this {
    this._BasicTransferable(null, null);
    this.c = c;
    let doc = c.getDocument();
    try {
      this.p0 = doc.createPosition(start);
      this.p1 = doc.createPosition(end);
      this.plainData = c.getSelectedText();
      if (c instanceof JEditorPane) {
        let ep = c;
        this.mimeType = ep.getContentType();
        if (this.mimeType.startsWith('text/plain')) {
          return this;
        }
        let sw = new StringWriter((this.p1.getOffset() - this.p0.getOffset()) | 0);
        ep.getEditorKit().write$Writer$Document$int$int(sw, doc, this.p0.getOffset(), (this.p1.getOffset() - this.p0.getOffset()) | 0);
        if (this.mimeType.startsWith('text/html')) {
          this.htmlData = sw.toString();
        } else {
          this.richText = sw.toString();
        }
      }
    } catch ($e2) {
      if ($J.isa($e2, BadLocationException) || $J.isa($e2, IOException)) {
        let ex = $J.exc($e2);
      } else {
        throw $e2;
      }
    }
    return this;
  }
  removeText(): void {
    if ((this.p0 != null) && (this.p1 != null) && (this.p0.getOffset() !== this.p1.getOffset())) {
      try {
        let doc = this.c.getDocument();
        doc.remove(this.p0.getOffset(), (this.p1.getOffset() - this.p0.getOffset()) | 0);
      } catch ($e3) {
        if ($J.isa($e3, BadLocationException)) {
          let e = $J.exc($e3);
        } else {
          throw $e3;
        }
      }
    }
  }
  /**
   * If the EditorKit is not for text/plain or text/html, that format
   * is supported through the "richer flavors" part of BasicTransferable.
   */
  getRicherFlavors(): DataFlavor[] {
    if (this.richText == null) {
      return null;
    }
    try {
      let flavors = $J.newArray(3, null);
      flavors[0] = new DataFlavor(this.mimeType + ';class=java.lang.String');
      flavors[1] = new DataFlavor(this.mimeType + ';class=java.io.Reader');
      flavors[2] = new DataFlavor(this.mimeType + ';class=java.io.InputStream;charset=unicode');
      return flavors;
    } catch ($e4) {
      if ($J.isa($e4, ClassNotFoundException)) {
        let cle = $J.exc($e4);
      } else {
        throw $e4;
      }
    }
    return null;
  }
  /**
   * The only richer format supported is the file list flavor
   */
  getRicherData(flavor: DataFlavor): any {
    if (this.richText == null) {
      return null;
    }
    if ($J.equals($J.cls(JString), flavor.getRepresentationClass())) {
      return this.richText;
    } else if ($J.equals($J.cls(Reader), flavor.getRepresentationClass())) {
      return new StringReader(this.richText);
    } else if ($J.equals($J.cls(InputStream), flavor.getRepresentationClass())) {
      return new StringBufferInputStream(this.richText);
    }
    throw new UnsupportedFlavorException(flavor);
  }
}

$J.define(BasicTextUI, 'javax.swing.plaf.basic.BasicTextUI', { kind: 'class', ifaces: ['javax.swing.text.ViewFactory'], sup: 'javax.swing.plaf.TextUI', ctors: { '': '_BasicTextUI' }, meths: { 'create(javax.swing.text.Element,int,int)': 'create$Element$int$int', 'damageRange(javax.swing.text.JTextComponent,int,int,javax.swing.text.Position$Bias,javax.swing.text.Position$Bias)': 'damageRange$JTextComponent$int$int$Bias$Bias', 'damageRange(javax.swing.text.JTextComponent,int,int)': 'damageRange$JTextComponent$int$int', 'viewToModel(javax.swing.text.JTextComponent,float,float,javax.swing.text.Position.Bias[])': 'viewToModel$JTextComponent$float$float$BiasArr$BasicTextUI', 'viewToModel(javax.swing.text.JTextComponent,java.awt.Point,javax.swing.text.Position.Bias[])': 'viewToModel$JTextComponent$Point$BiasArr', 'viewToModel(javax.swing.text.JTextComponent,java.awt.Point)': 'viewToModel$JTextComponent$Point', 'modelToView(javax.swing.text.JTextComponent,int,javax.swing.text.Position$Bias,boolean)': 'modelToView$JTextComponent$int$Bias$boolean$BasicTextUI', 'modelToView(javax.swing.text.JTextComponent,int,javax.swing.text.Position$Bias)': 'modelToView$JTextComponent$int$Bias', 'modelToView(javax.swing.text.JTextComponent,int)': 'modelToView$JTextComponent$int', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' }, clinit: true, lazy: ['textCursor', 'defaultKit', 'defaultTransferHandler', 'discardBias'] });
$J.define(BasicTextUI$BasicCaret, 'javax.swing.plaf.basic.BasicTextUI$BasicCaret', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.text.DefaultCaret', ctors: { '': '_BasicTextUI$BasicCaret' } });
$J.define(BasicTextUI$BasicHighlighter, 'javax.swing.plaf.basic.BasicTextUI$BasicHighlighter', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.text.DefaultHighlighter', ctors: { '': '_BasicTextUI$BasicHighlighter' } });
$J.define(BasicTextUI$BasicCursor, 'javax.swing.plaf.basic.BasicTextUI$BasicCursor', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'java.awt.Cursor', ctors: { 'java.lang.String': '_BasicTextUI$BasicCursor$String', 'int': '_BasicTextUI$BasicCursor$int' } });
$J.define(BasicTextUI$RootView, 'javax.swing.plaf.basic.BasicTextUI$RootView', { kind: 'class', sup: 'javax.swing.text.View', ctors: { '': '_BasicTextUI$RootView' }, meths: { 'breakView(int,float,java.awt.Shape)': 'breakView$int$float$Shape', 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,javax.swing.text.Position$Bias,int,javax.swing.text.Position$Bias,java.awt.Shape)': 'modelToView$int$Bias$int$Bias$Shape', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias', 'getViewIndex(int,javax.swing.text.Position$Bias)': 'getViewIndex$int$Bias' }, inner: true });
$J.define(BasicTextUI$UpdateHandler, 'javax.swing.plaf.basic.BasicTextUI$UpdateHandler', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener', 'javax.swing.event.DocumentListener', 'java.awt.LayoutManager2', 'javax.swing.plaf.UIResource'], sup: 'java.lang.Object', ctors: { '': '_BasicTextUI$UpdateHandler' }, meths: { 'addLayoutComponent(java.awt.Component,java.lang.Object)': 'addLayoutComponent$Component$Object', 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' }, inner: true });
$J.define(BasicTextUI$TextActionWrapper, 'javax.swing.plaf.basic.BasicTextUI$TextActionWrapper', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'javax.swing.text.TextAction': '_BasicTextUI$TextActionWrapper' }, inner: true });
$J.define(BasicTextUI$FocusAction, 'javax.swing.plaf.basic.BasicTextUI$FocusAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicTextUI$FocusAction' }, inner: true });
$J.define(BasicTextUI$DragListener, 'javax.swing.plaf.basic.BasicTextUI$DragListener', { kind: 'class', ifaces: ['javax.swing.plaf.basic.DragRecognitionSupport$BeforeDrag'], sup: 'javax.swing.event.MouseInputAdapter', ctors: { '': '_BasicTextUI$DragListener' } });
$J.define(BasicTextUI$TextTransferHandler, 'javax.swing.plaf.basic.BasicTextUI$TextTransferHandler', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.TransferHandler', ctors: { '': '_BasicTextUI$TextTransferHandler' }, meths: { 'canImport(javax.swing.JComponent,java.awt.datatransfer.DataFlavor[])': 'canImport$JComponent$DataFlavorArr', 'importData(javax.swing.JComponent,java.awt.datatransfer.Transferable)': 'importData$JComponent$Transferable', 'importData(javax.swing.TransferHandler$TransferSupport)': 'importData$TransferSupport' } });
$J.define(BasicTextUI$TextTransferHandler$TextTransferable, 'javax.swing.plaf.basic.BasicTextUI$TextTransferHandler$TextTransferable', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTransferable', ctors: { 'javax.swing.text.JTextComponent,int,int': '_BasicTextUI$TextTransferHandler$TextTransferable' } });
$J.module(() => {
  ComponentOrientation = $J.load('java.awt.ComponentOrientation');
  Dimension = $J.load('java.awt.Dimension');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  InputEvent = $J.load('java.awt.event.InputEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  Action = $J.load('javax.swing.Action');
  DropMode = $J.load('javax.swing.DropMode');
  JComponent = $J.load('javax.swing.JComponent');
  JEditorPane = $J.load('javax.swing.JEditorPane');
  JPasswordField = $J.load('javax.swing.JPasswordField');
  JTextArea = $J.load('javax.swing.JTextArea');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  ActionMapUIResource = $J.load('javax.swing.plaf.ActionMapUIResource');
  ComponentInputMapUIResource = $J.load('javax.swing.plaf.ComponentInputMapUIResource');
  InputMapUIResource = $J.load('javax.swing.plaf.InputMapUIResource');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  DragRecognitionSupport = $J.load('javax.swing.plaf.basic.DragRecognitionSupport');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  DefaultEditorKit = $J.load('javax.swing.text.DefaultEditorKit');
  DefaultEditorKit$InsertBreakAction = $J.load('javax.swing.text.DefaultEditorKit$InsertBreakAction');
  Document = $J.load('javax.swing.text.Document');
  JTextComponent = $J.load('javax.swing.text.JTextComponent');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
