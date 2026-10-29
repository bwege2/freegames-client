// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicComboBoxUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, JObject, JString, StringBuffer } from '../../../../../jre/index.ts';
import { ComboBoxUI } from '../ComboBoxUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let Component$BaselineResizeBehavior, Dimension, EventQueue, Rectangle, ActionEvent, KeyEvent, Accessible, CellRendererPane, DefaultListCellRenderer, JComponent, JLabel, JPanel, KeyStroke, LookAndFeel, SwingConstants, SwingUtilities, UIManager, UIResource, BasicArrowButton, BasicComboBoxEditor$UIResource, BasicComboBoxRenderer$UIResource, BasicComboPopup, BasicGraphicsUtils, BasicLookAndFeel, LazyActionMap, Position$Bias, DefaultLookup, SwingUtilities2;

/**
 * Basic UI implementation for JComboBox.
 * <p>
 * The combo box is a compound component which means that it is an aggregate of
 * many simpler components. This class creates and manages the listeners
 * on the combo box and the combo box model. These listeners update the user
 * interface in response to changes in the properties and state of the combo box.
 * <p>
 * All event handling is handled by listener classes created with the
 * <code>createxxxListener()</code> methods and internal classes.
 * You can change the behavior of this class by overriding the
 * <code>createxxxListener()</code> methods and supplying your own
 * event listeners or subclassing from the ones supplied in this class.
 * <p>
 * For adding specific actions,
 * override <code>installKeyboardActions</code> to add actions in response to
 * KeyStroke bindings. See the article <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/keybinding.html">How to Use Key Bindings</a>
 *
 * @author Arnaud Weber
 * @author Tom Santos
 * @author Mark Davidson
 */
export class BasicComboBoxUI extends ComboBoxUI {
  /**
   * The instance of {@code JComboBox}.
   */
  comboBox: JComboBox<any> = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override.
   */
  hasFocus_: boolean = false;
  isTableCellEditor_: boolean = false;
  static readonly IS_TABLE_CELL_EDITOR: string = 'JComboBox.isTableCellEditor';
  /**
   * This list is for drawing the current item in the combo box.
   */
  listBox: JList<any> = null;
  /**
   * Used to render the currently selected item in the combo box.
   * It doesn't have anything to do with the popup's rendering.
   */
  currentValuePane: CellRendererPane = null;
  /**
   * The implementation of {@code ComboPopup} that is used to show the popup.
   */
  popup: ComboPopup = null;
  /**
   * The Component that the {@code ComboBoxEditor} uses for editing.
   */
  editor: Component = null;
  /**
   * The arrow button that invokes the popup.
   */
  arrowButton: JButton = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Override the listener construction method instead.
   *
   * @see #createKeyListener
   */
  keyListener: KeyListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Override the listener construction method instead.
   *
   * @see #createFocusListener
   */
  focusListener: FocusListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Override the listener construction method instead.
   *
   * @see #createPropertyChangeListener
   */
  propertyChangeListener: PropertyChangeListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Override the listener construction method instead.
   *
   * @see #createItemListener
   */
  itemListener: ItemListener = null;
  /**
   * The {@code MouseListener} listens to events.
   */
  popupMouseListener: MouseListener = null;
  /**
   * The {@code MouseMotionListener} listens to events.
   */
  popupMouseMotionListener: MouseMotionListener = null;
  /**
   * The {@code KeyListener} listens to events.
   */
  popupKeyListener: KeyListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Override the listener construction method instead.
   *
   * @see #createListDataListener
   */
  listDataListener: ListDataListener = null;
  /**
   * Implements all the Listeners needed by this class, all existing
   * listeners redirect to it.
   */
  handler: BasicComboBoxUI$Handler = null;
  /**
   * The time factor to treat the series of typed alphanumeric key
   * as prefix for first letter navigation.
   */
  timeFactor: number = 0;
  /**
   * This is tricky, this variables is needed for DefaultKeySelectionManager
   * to take into account time factor.
   */
  lastTime: number = 0;
  time: number = 0;
  /**
   * The default key selection manager
   */
  keySelectionManager: JComboBox$KeySelectionManager = null;
  /**
   * The flag for recalculating the minimum preferred size.
   */
  isMinimumSizeDirty: boolean = false;
  /**
   * The cached minimum preferred size.
   */
  cachedMinimumSize: Dimension = null;
  isDisplaySizeDirty: boolean = false;
  cachedDisplaySize: Dimension = null;
  static COMBO_UI_LIST_CELL_RENDERER_KEY: any = null;
  static HIDE_POPUP_KEY: StringBuffer = null;
  /**
   * Whether or not all cells have the same baseline.
   */
  sameBaseline: boolean = false;
  /**
   * Indicates whether or not the combo box button should be square.
   * If square, then the width and height are equal, and are both set to
   * the height of the combo minus appropriate insets.
   *
   * @since 1.7
   */
  squareButton: boolean = false;
  /**
   * If specified, these insets act as padding around the cell renderer when
   * laying out and painting the "selected" item in the combo box. These
   * insets add to those specified by the cell renderer.
   *
   * @since 1.7
   */
  padding: Insets = null;
  /**
   * Constructs a {@code BasicComboBoxUI}.
   */
  _BasicComboBoxUI(): this {
    this._ComboBoxUI();
    this.hasFocus_ = false;
    this.isTableCellEditor_ = false;
    this.currentValuePane = new CellRendererPane()._CellRendererPane();
    this.timeFactor = 1000;
    this.lastTime = 0;
    this.time = 0;
    this.isMinimumSizeDirty = true;
    this.cachedMinimumSize = new Dimension()._Dimension$int$int(0, 0);
    this.isDisplaySizeDirty = true;
    this.cachedDisplaySize = new Dimension()._Dimension$int$int(0, 0);
    this.squareButton = true;
    return this;
  }
  static getDefaultListCellRenderer(): ListCellRenderer<any> {
    let renderer = AppContext.getAppContext().get(BasicComboBoxUI.COMBO_UI_LIST_CELL_RENDERER_KEY);
    if (renderer == null) {
      renderer = new DefaultListCellRenderer()._DefaultListCellRenderer();
      AppContext.getAppContext().put(BasicComboBoxUI.COMBO_UI_LIST_CELL_RENDERER_KEY, new DefaultListCellRenderer()._DefaultListCellRenderer());
    }
    return renderer;
  }
  /**
   * Populates ComboBox's actions.
   */
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.HIDE));
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.PAGE_DOWN));
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.PAGE_UP));
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.HOME));
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.END));
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.DOWN));
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.DOWN_2));
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.TOGGLE));
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.TOGGLE_2));
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.UP));
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.UP_2));
    map.put$Action(new BasicComboBoxUI$Actions()._BasicComboBoxUI$Actions(BasicComboBoxUI$Actions.ENTER));
  }
  /**
   * Constructs a new instance of {@code BasicComboBoxUI}.
   *
   * @param c a component
   * @return a new instance of {@code BasicComboBoxUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicComboBoxUI()._BasicComboBoxUI();
  }
  installUI(c: JComponent): void {
    this.isMinimumSizeDirty = true;
    let tmp = c;
    this.comboBox = tmp;
    this.installDefaults();
    this.popup = this.createPopup();
    this.listBox = this.popup.getList();
    let inTable = c.getClientProperty(BasicComboBoxUI.IS_TABLE_CELL_EDITOR);
    if (inTable != null) {
      this.isTableCellEditor_ = $J.equals(inTable, true) ? true : false;
    }
    if (this.comboBox.getRenderer() == null || $J.isa(this.comboBox.getRenderer(), UIResource)) {
      this.comboBox.setRenderer(this.createRenderer());
    }
    if (this.comboBox.getEditor() == null || $J.isa(this.comboBox.getEditor(), UIResource)) {
      this.comboBox.setEditor(this.createEditor());
    }
    this.installListeners();
    this.installComponents();
    this.comboBox.setLayout(this.createLayoutManager());
    this.comboBox.setRequestFocusEnabled(true);
    this.installKeyboardActions();
    this.comboBox.putClientProperty('doNotCancelPopup', BasicComboBoxUI.HIDE_POPUP_KEY);
    if (this.keySelectionManager == null || $J.isa(this.keySelectionManager, UIResource)) {
      this.keySelectionManager = new BasicComboBoxUI$DefaultKeySelectionManager().$o(this)._BasicComboBoxUI$DefaultKeySelectionManager();
    }
    this.comboBox.setKeySelectionManager(this.keySelectionManager);
  }
  uninstallUI(c: JComponent): void {
    this.setPopupVisible(this.comboBox, false);
    this.popup.uninstallingUI();
    this.uninstallKeyboardActions();
    this.comboBox.setLayout(null);
    this.uninstallComponents();
    this.uninstallListeners();
    this.uninstallDefaults();
    if (this.comboBox.getRenderer() == null || $J.isa(this.comboBox.getRenderer(), UIResource)) {
      this.comboBox.setRenderer(null);
    }
    let comboBoxEditor = this.comboBox.getEditor();
    if ($J.isa(comboBoxEditor, UIResource)) {
      if (comboBoxEditor.getEditorComponent().hasFocus()) {
        this.comboBox.requestFocusInWindow$();
      }
      this.comboBox.setEditor(null);
    }
    if ($J.isa(this.keySelectionManager, UIResource)) {
      this.comboBox.setKeySelectionManager(null);
    }
    this.handler = null;
    this.keyListener = null;
    this.focusListener = null;
    this.listDataListener = null;
    this.propertyChangeListener = null;
    this.popup = null;
    this.listBox = null;
    this.comboBox = null;
  }
  /**
   * Installs the default colors, default font, default renderer, and default
   * editor into the JComboBox.
   */
  installDefaults(): void {
    LookAndFeel.installColorsAndFont(this.comboBox, 'ComboBox.background', 'ComboBox.foreground', 'ComboBox.font');
    LookAndFeel.installBorder(this.comboBox, 'ComboBox.border');
    LookAndFeel.installProperty(this.comboBox, 'opaque', true);
    let l = UIManager.get$Object('ComboBox.timeFactor');
    this.timeFactor = l == null ? 1000 : (+l);
    let b = UIManager.get$Object('ComboBox.squareButton');
    this.squareButton = b == null ? true : b;
    this.padding = UIManager.getInsets$Object('ComboBox.padding');
  }
  /**
   * Creates and installs listeners for the combo box and its model.
   * This method is called when the UI is installed.
   */
  installListeners(): void {
    if ((this.itemListener = this.createItemListener()) != null) {
      this.comboBox.addItemListener(this.itemListener);
    }
    if ((this.propertyChangeListener = this.createPropertyChangeListener()) != null) {
      this.comboBox.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
    if ((this.keyListener = this.createKeyListener()) != null) {
      this.comboBox.addKeyListener(this.keyListener);
    }
    if ((this.focusListener = this.createFocusListener()) != null) {
      this.comboBox.addFocusListener(this.focusListener);
    }
    if ((this.popupMouseListener = this.popup.getMouseListener()) != null) {
      this.comboBox.addMouseListener(this.popupMouseListener);
    }
    if ((this.popupMouseMotionListener = this.popup.getMouseMotionListener()) != null) {
      this.comboBox.addMouseMotionListener(this.popupMouseMotionListener);
    }
    if ((this.popupKeyListener = this.popup.getKeyListener()) != null) {
      this.comboBox.addKeyListener(this.popupKeyListener);
    }
    if (this.comboBox.getModel() != null) {
      if ((this.listDataListener = this.createListDataListener()) != null) {
        this.comboBox.getModel().addListDataListener(this.listDataListener);
      }
    }
  }
  /**
   * Uninstalls the default colors, default font, default renderer,
   * and default editor from the combo box.
   */
  uninstallDefaults(): void {
    LookAndFeel.installColorsAndFont(this.comboBox, 'ComboBox.background', 'ComboBox.foreground', 'ComboBox.font');
    LookAndFeel.uninstallBorder(this.comboBox);
  }
  /**
   * Removes the installed listeners from the combo box and its model.
   * The number and types of listeners removed and in this method should be
   * the same that was added in <code>installListeners</code>
   */
  uninstallListeners(): void {
    if (this.keyListener != null) {
      this.comboBox.removeKeyListener(this.keyListener);
    }
    if (this.itemListener != null) {
      this.comboBox.removeItemListener(this.itemListener);
    }
    if (this.propertyChangeListener != null) {
      this.comboBox.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
    if (this.focusListener != null) {
      this.comboBox.removeFocusListener(this.focusListener);
    }
    if (this.popupMouseListener != null) {
      this.comboBox.removeMouseListener(this.popupMouseListener);
    }
    if (this.popupMouseMotionListener != null) {
      this.comboBox.removeMouseMotionListener(this.popupMouseMotionListener);
    }
    if (this.popupKeyListener != null) {
      this.comboBox.removeKeyListener(this.popupKeyListener);
    }
    if (this.comboBox.getModel() != null) {
      if (this.listDataListener != null) {
        this.comboBox.getModel().removeListDataListener(this.listDataListener);
      }
    }
  }
  /**
   * Creates the popup portion of the combo box.
   *
   * @return an instance of <code>ComboPopup</code>
   * @see ComboPopup
   */
  createPopup(): ComboPopup {
    return new BasicComboPopup()._BasicComboPopup(this.comboBox);
  }
  /**
   * Creates a <code>KeyListener</code> which will be added to the
   * combo box. If this method returns null then it will not be added
   * to the combo box.
   *
   * @return an instance <code>KeyListener</code> or null
   */
  createKeyListener(): KeyListener {
    return this.getHandler();
  }
  /**
   * Creates a <code>FocusListener</code> which will be added to the combo box.
   * If this method returns null then it will not be added to the combo box.
   *
   * @return an instance of a <code>FocusListener</code> or null
   */
  createFocusListener(): FocusListener {
    return this.getHandler();
  }
  /**
   * Creates a list data listener which will be added to the
   * <code>ComboBoxModel</code>. If this method returns null then
   * it will not be added to the combo box model.
   *
   * @return an instance of a <code>ListDataListener</code> or null
   */
  createListDataListener(): ListDataListener {
    return this.getHandler();
  }
  /**
   * Creates an <code>ItemListener</code> which will be added to the
   * combo box. If this method returns null then it will not
   * be added to the combo box.
   * <p>
   * Subclasses may override this method to return instances of their own
   * ItemEvent handlers.
   *
   * @return an instance of an <code>ItemListener</code> or null
   */
  createItemListener(): ItemListener {
    return null;
  }
  /**
   * Creates a <code>PropertyChangeListener</code> which will be added to
   * the combo box. If this method returns null then it will not
   * be added to the combo box.
   *
   * @return an instance of a <code>PropertyChangeListener</code> or null
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  /**
   * Creates a layout manager for managing the components which make up the
   * combo box.
   *
   * @return an instance of a layout manager
   */
  createLayoutManager(): LayoutManager {
    return this.getHandler();
  }
  /**
   * Creates the default renderer that will be used in a non-editiable combo
   * box. A default renderer will used only if a renderer has not been
   * explicitly set with <code>setRenderer</code>.
   *
   * @return a <code>ListCellRender</code> used for the combo box
   * @see javax.swing.JComboBox#setRenderer
   */
  createRenderer(): ListCellRenderer<any> {
    return new BasicComboBoxRenderer$UIResource()._BasicComboBoxRenderer$UIResource();
  }
  /**
   * Creates the default editor that will be used in editable combo boxes.
   * A default editor will be used only if an editor has not been
   * explicitly set with <code>setEditor</code>.
   *
   * @return a <code>ComboBoxEditor</code> used for the combo box
   * @see javax.swing.JComboBox#setEditor
   */
  createEditor(): ComboBoxEditor {
    return new BasicComboBoxEditor$UIResource()._BasicComboBoxEditor$UIResource();
  }
  /**
   * Returns the shared listener.
   */
  getHandler(): BasicComboBoxUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicComboBoxUI$Handler().$o(this)._BasicComboBoxUI$Handler();
    }
    return this.handler;
  }
  updateToolTipTextForChildren(): void {
    let children = this.comboBox.getComponents();
    for (let i = 0; i < children.length; ++i) {
      if (children[i] instanceof JComponent) {
        (children[i]).setToolTipText(this.comboBox.getToolTipText$());
      }
    }
  }
  /**
   * Creates and initializes the components which make up the
   * aggregate combo box. This method is called as part of the UI
   * installation process.
   */
  installComponents(): void {
    this.arrowButton = this.createArrowButton();
    if (this.arrowButton != null) {
      this.comboBox.add$Component(this.arrowButton);
      this.configureArrowButton();
    }
    if (this.comboBox.isEditable()) {
      this.addEditor();
    }
    this.comboBox.add$Component(this.currentValuePane);
  }
  /**
   * The aggregate components which comprise the combo box are
   * unregistered and uninitialized. This method is called as part of the
   * UI uninstallation process.
   */
  uninstallComponents(): void {
    if (this.arrowButton != null) {
      this.unconfigureArrowButton();
    }
    if (this.editor != null) {
      this.unconfigureEditor();
    }
    this.comboBox.removeAll();
    this.arrowButton = null;
  }
  /**
   * This public method is implementation specific and should be private.
   * do not call or override. To implement a specific editor create a
   * custom <code>ComboBoxEditor</code>
   *
   * @see #createEditor
   * @see javax.swing.JComboBox#setEditor
   * @see javax.swing.ComboBoxEditor
   */
  addEditor(): void {
    this.removeEditor();
    this.editor = this.comboBox.getEditor().getEditorComponent();
    if (this.editor != null) {
      this.configureEditor();
      this.comboBox.add$Component(this.editor);
      if (this.comboBox.isFocusOwner()) {
        this.editor.requestFocusInWindow$();
      }
    }
  }
  /**
   * This public method is implementation specific and should be private.
   * do not call or override.
   *
   * @see #addEditor
   */
  removeEditor(): void {
    if (this.editor != null) {
      this.unconfigureEditor();
      this.comboBox.remove$Component(this.editor);
      this.editor = null;
    }
  }
  /**
   * This protected method is implementation specific and should be private.
   * do not call or override.
   *
   * @see #addEditor
   */
  configureEditor(): void {
    this.editor.setEnabled(this.comboBox.isEnabled());
    this.editor.setFocusable(this.comboBox.isFocusable());
    this.editor.setFont(this.comboBox.getFont());
    if (this.focusListener != null) {
      this.editor.addFocusListener(this.focusListener);
    }
    this.editor.addFocusListener(this.getHandler());
    this.comboBox.getEditor().addActionListener($J.fn(this.getHandler(), 'actionPerformed'));
    if (this.editor instanceof JComponent) {
      (this.editor).putClientProperty('doNotCancelPopup', BasicComboBoxUI.HIDE_POPUP_KEY);
      (this.editor).setInheritsPopupMenu(true);
    }
    this.comboBox.configureEditor(this.comboBox.getEditor(), this.comboBox.getSelectedItem());
    this.editor.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
  }
  /**
   * This protected method is implementation specific and should be private.
   * Do not call or override.
   *
   * @see #addEditor
   */
  unconfigureEditor(): void {
    if (this.focusListener != null) {
      this.editor.removeFocusListener(this.focusListener);
    }
    this.editor.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.editor.removeFocusListener(this.getHandler());
    this.comboBox.getEditor().removeActionListener($J.fn(this.getHandler(), 'actionPerformed'));
  }
  /**
   * This public method is implementation specific and should be private. Do
   * not call or override.
   *
   * @see #createArrowButton
   */
  configureArrowButton(): void {
    if (this.arrowButton != null) {
      this.arrowButton.setEnabled(this.comboBox.isEnabled());
      this.arrowButton.setFocusable(this.comboBox.isFocusable());
      this.arrowButton.setRequestFocusEnabled(false);
      this.arrowButton.addMouseListener(this.popup.getMouseListener());
      this.arrowButton.addMouseMotionListener(this.popup.getMouseMotionListener());
      this.arrowButton.resetKeyboardActions();
      this.arrowButton.putClientProperty('doNotCancelPopup', BasicComboBoxUI.HIDE_POPUP_KEY);
      this.arrowButton.setInheritsPopupMenu(true);
    }
  }
  /**
   * This public method is implementation specific and should be private. Do
   * not call or override.
   *
   * @see #createArrowButton
   */
  unconfigureArrowButton(): void {
    if (this.arrowButton != null) {
      this.arrowButton.removeMouseListener(this.popup.getMouseListener());
      this.arrowButton.removeMouseMotionListener(this.popup.getMouseMotionListener());
    }
  }
  /**
   * Creates a button which will be used as the control to show or hide
   * the popup portion of the combo box.
   *
   * @return a button which represents the popup control
   */
  createArrowButton(): JButton {
    let button = new BasicArrowButton()._BasicArrowButton$int$Color$Color$Color$Color(SwingConstants.SOUTH, UIManager.getColor$Object('ComboBox.buttonBackground'), UIManager.getColor$Object('ComboBox.buttonShadow'), UIManager.getColor$Object('ComboBox.buttonDarkShadow'), UIManager.getColor$Object('ComboBox.buttonHighlight'));
    button.setName('ComboBox.arrowButton');
    return button;
  }
  /**
   * Tells if the popup is visible or not.
   */
  isPopupVisible(c: JComboBox<any>): boolean {
    return this.popup != null && this.popup.isVisible$();
  }
  /**
   * Hides the popup.
   */
  setPopupVisible(c: JComboBox<any>, v: boolean): void {
    if (this.popup != null) {
      if (v) {
        this.popup.show$();
      } else {
        this.popup.hide();
      }
    }
  }
  /**
   * Determines if the JComboBox is focus traversable.  If the JComboBox is editable
   * this returns false, otherwise it returns true.
   */
  isFocusTraversable(c: JComboBox<any>): boolean {
    return !this.comboBox.isEditable();
  }
  paint(g: Graphics, c: JComponent): void {
    this.hasFocus_ = this.comboBox.hasFocus();
    if (!this.comboBox.isEditable()) {
      let r = this.rectangleForCurrentValue();
      this.paintCurrentValueBackground(g, r, this.hasFocus_);
      this.paintCurrentValue(g, r, this.hasFocus_);
    }
    this.currentValuePane.removeAll();
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    return this.getMinimumSize(c);
  }
  /**
   * The minimum size is the size of the display area plus insets plus the button.
   */
  getMinimumSize(c: JComponent): Dimension {
    if (!this.isMinimumSizeDirty) {
      return new Dimension()._Dimension$Dimension(this.cachedMinimumSize);
    }
    let size = this.getDisplaySize();
    let insets = this.getInsets();
    let buttonHeight = size.height_;
    let buttonWidth = this.squareButton ? buttonHeight : this.arrowButton.getPreferredSize$().width_;
    size.height_ = (size.height_ + (insets.top + insets.bottom)) | 0;
    size.width_ = (size.width_ + (insets.left + insets.right + buttonWidth)) | 0;
    this.cachedMinimumSize.setSize$int$int(size.width_, size.height_);
    this.isMinimumSizeDirty = false;
    return new Dimension()._Dimension$Dimension(size);
  }
  getMaximumSize(c: JComponent): Dimension {
    return new Dimension()._Dimension$int$int(32767, 32767);
  }
  /**
   * Returns the baseline.
   *
   * @throws NullPointerException {@inheritDoc}
   * @throws IllegalArgumentException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaseline$JComponent$int$int(c: JComponent, width: number, height: number): number {
    super.getBaseline$JComponent$int$int(c, width, height);
    let baseline = -1;
    this.getDisplaySize();
    if (this.sameBaseline) {
      let insets = c.getInsets$();
      height = Math.max((height - insets.top - insets.bottom) | 0, 0);
      if (!this.comboBox.isEditable()) {
        let renderer = this.comboBox.getRenderer();
        if (renderer == null) {
          renderer = new DefaultListCellRenderer()._DefaultListCellRenderer();
        }
        let value = null;
        let prototypeValue = this.comboBox.getPrototypeDisplayValue();
        if (prototypeValue != null) {
          value = prototypeValue;
        } else if (this.comboBox.getModel().getSize() > 0) {
          value = this.comboBox.getModel().getElementAt(0);
        }
        let component = renderer.getListCellRendererComponent(this.listBox, value, -1, false, false);
        if (component instanceof JLabel) {
          let label = component;
          let text = label.getText();
          if ((text == null) || (text.length === 0)) {
            label.setText(' ');
          }
        }
        if (component instanceof JComponent) {
          component.setFont(this.comboBox.getFont());
        }
        baseline = component.getBaseline(width, height);
      } else {
        baseline = this.editor.getBaseline(width, height);
      }
      if (baseline > 0) {
        baseline = (baseline + insets.top) | 0;
      }
    }
    return baseline;
  }
  /**
   * Returns an enum indicating how the baseline of the component
   * changes as the size changes.
   *
   * @throws NullPointerException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(c: JComponent): Component$BaselineResizeBehavior {
    super.getBaselineResizeBehavior(c);
    this.getDisplaySize();
    if (this.comboBox.isEditable()) {
      return this.editor.getBaselineResizeBehavior();
    } else if (this.sameBaseline) {
      let renderer = this.comboBox.getRenderer();
      if (renderer == null) {
        renderer = new DefaultListCellRenderer()._DefaultListCellRenderer();
      }
      let value = null;
      let prototypeValue = this.comboBox.getPrototypeDisplayValue();
      if (prototypeValue != null) {
        value = prototypeValue;
      } else if (this.comboBox.getModel().getSize() > 0) {
        value = this.comboBox.getModel().getElementAt(0);
      }
      if (value != null) {
        let component = renderer.getListCellRendererComponent(this.listBox, value, -1, false, false);
        return component.getBaselineResizeBehavior();
      }
    }
    return Component$BaselineResizeBehavior.OTHER;
  }
  getAccessibleChildrenCount(c: JComponent): number {
    if (this.comboBox.isEditable()) {
      return 2;
    } else {
      return 1;
    }
  }
  getAccessibleChild(c: JComponent, i: number): Accessible {
    switch (i) {
      case 0:
        if ($J.isa(this.popup, Accessible)) {
          let ac = (this.popup).getAccessibleContext();
          ac.setAccessibleParent(this.comboBox);
          return this.popup;
        }
        break;
      case 1:
        if (this.comboBox.isEditable() && ($J.isa(this.editor, Accessible))) {
          let ac = (this.editor).getAccessibleContext();
          ac.setAccessibleParent(this.comboBox);
          return this.editor;
        }
        break;
    }
    return null;
  }
  isNavigationKey$int$int$BasicComboBoxUI(keyCode: number, modifiers: number): boolean {
    let inputMap = this.comboBox.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    let key = KeyStroke.getKeyStroke$int$int(keyCode, modifiers);
    if (inputMap != null && inputMap.get(key) != null) {
      return true;
    }
    return false;
  }
  /**
   * Selects the next item in the list.  It won't change the selection if the
   * currently selected item is already the last item.
   */
  selectNextPossibleValue(): void {
    let si: number;
    if (this.comboBox.isPopupVisible()) {
      si = this.listBox.getSelectedIndex();
    } else {
      si = this.comboBox.getSelectedIndex();
    }
    if (si < ((this.comboBox.getModel().getSize() - 1) | 0)) {
      this.listBox.setSelectedIndex((si + 1) | 0);
      this.listBox.ensureIndexIsVisible((si + 1) | 0);
      if (!this.isTableCellEditor_) {
        if (!(UIManager.getBoolean$Object('ComboBox.noActionOnKeyNavigation') && this.comboBox.isPopupVisible())) {
          this.comboBox.setSelectedIndex((si + 1) | 0);
        }
      }
      this.comboBox.repaint$();
    }
  }
  /**
   * Selects the previous item in the list.  It won't change the selection if the
   * currently selected item is already the first item.
   */
  selectPreviousPossibleValue(): void {
    let si: number;
    if (this.comboBox.isPopupVisible()) {
      si = this.listBox.getSelectedIndex();
    } else {
      si = this.comboBox.getSelectedIndex();
    }
    if (si > 0) {
      this.listBox.setSelectedIndex((si - 1) | 0);
      this.listBox.ensureIndexIsVisible((si - 1) | 0);
      if (!this.isTableCellEditor_) {
        if (!(UIManager.getBoolean$Object('ComboBox.noActionOnKeyNavigation') && this.comboBox.isPopupVisible())) {
          this.comboBox.setSelectedIndex((si - 1) | 0);
        }
      }
      this.comboBox.repaint$();
    }
  }
  /**
   * Returns the area that is reserved for drawing the currently selected item.
   *
   * @return the area that is reserved for drawing the currently selected item
   */
  rectangleForCurrentValue(): Rectangle {
    let width = this.comboBox.getWidth();
    let height = this.comboBox.getHeight();
    let insets = this.getInsets();
    let buttonSize = (height - (insets.top + insets.bottom)) | 0;
    if (this.arrowButton != null) {
      buttonSize = this.arrowButton.getWidth();
    }
    if (BasicGraphicsUtils.isLeftToRight(this.comboBox)) {
      return new Rectangle()._Rectangle$int$int$int$int(insets.left, insets.top, (width - (insets.left + insets.right + buttonSize)) | 0, (height - (insets.top + insets.bottom)) | 0);
    } else {
      return new Rectangle()._Rectangle$int$int$int$int((insets.left + buttonSize) | 0, insets.top, (width - (insets.left + insets.right + buttonSize)) | 0, (height - (insets.top + insets.bottom)) | 0);
    }
  }
  /**
   * Gets the insets from the JComboBox.
   *
   * @return the insets
   */
  getInsets(): Insets {
    return this.comboBox.getInsets$();
  }
  /**
   * Paints the currently selected item.
   *
   * @param g an instance of {@code Graphics}
   * @param bounds a bounding rectangle to render to
   * @param hasFocus is focused
   */
  paintCurrentValue(g: Graphics, bounds: Rectangle, hasFocus: boolean): void {
    let renderer = this.comboBox.getRenderer();
    let c: Component;
    if (hasFocus && !this.isPopupVisible(this.comboBox)) {
      c = renderer.getListCellRendererComponent(this.listBox, this.comboBox.getSelectedItem(), -1, true, false);
    } else {
      c = renderer.getListCellRendererComponent(this.listBox, this.comboBox.getSelectedItem(), -1, false, false);
      c.setBackground(UIManager.getColor$Object('ComboBox.background'));
    }
    c.setFont(this.comboBox.getFont());
    if (hasFocus && !this.isPopupVisible(this.comboBox)) {
      c.setForeground(this.listBox.getSelectionForeground());
      c.setBackground(this.listBox.getSelectionBackground());
    } else {
      if (this.comboBox.isEnabled()) {
        c.setForeground(this.comboBox.getForeground());
        c.setBackground(this.comboBox.getBackground());
      } else {
        c.setForeground(DefaultLookup.getColor$JComponent$ComponentUI$String$Color(this.comboBox, this, 'ComboBox.disabledForeground', null));
        c.setBackground(DefaultLookup.getColor$JComponent$ComponentUI$String$Color(this.comboBox, this, 'ComboBox.disabledBackground', null));
      }
    }
    let shouldValidate = false;
    if (c instanceof JPanel) {
      shouldValidate = true;
    }
    let x = bounds.x_;
    let y = bounds.y_;
    let w = bounds.width_;
    let h = bounds.height_;
    if (this.padding != null) {
      x = (bounds.x_ + this.padding.left) | 0;
      y = (bounds.y_ + this.padding.top) | 0;
      w = (bounds.width_ - (this.padding.left + this.padding.right)) | 0;
      h = (bounds.height_ - (this.padding.top + this.padding.bottom)) | 0;
    }
    this.currentValuePane.paintComponent$Graphics$Component$Container$int$int$int$int$boolean(g, c, this.comboBox, x, y, w, h, shouldValidate);
  }
  /**
   * Paints the background of the currently selected item.
   *
   * @param g an instance of {@code Graphics}
   * @param bounds a bounding rectangle to render to
   * @param hasFocus is focused
   */
  paintCurrentValueBackground(g: Graphics, bounds: Rectangle, hasFocus: boolean): void {
    let t = g.getColor();
    if (this.comboBox.isEnabled()) {
      g.setColor(DefaultLookup.getColor$JComponent$ComponentUI$String$Color(this.comboBox, this, 'ComboBox.background', null));
    } else {
      g.setColor(DefaultLookup.getColor$JComponent$ComponentUI$String$Color(this.comboBox, this, 'ComboBox.disabledBackground', null));
    }
    g.fillRect(bounds.x_, bounds.y_, bounds.width_, bounds.height_);
    g.setColor(t);
  }
  /**
   * Return the default size of an empty display area of the combo box using
   * the current renderer and font.
   *
   * @return the size of an empty display area
   * @see #getDisplaySize
   */
  getDefaultSize(): Dimension {
    let d = this.getSizeForComponent(BasicComboBoxUI.getDefaultListCellRenderer().getListCellRendererComponent(this.listBox, ' ', -1, false, false));
    return new Dimension()._Dimension$int$int(d.width_, d.height_);
  }
  /**
   * Returns the calculated size of the display area. The display area is the
   * portion of the combo box in which the selected item is displayed. This
   * method will use the prototype display value if it has been set.
   * <p>
   * For combo boxes with a non trivial number of items, it is recommended to
   * use a prototype display value to significantly speed up the display
   * size calculation.
   *
   * @return the size of the display area calculated from the combo box items
   * @see javax.swing.JComboBox#setPrototypeDisplayValue
   */
  getDisplaySize(): Dimension {
    if (!this.isDisplaySizeDirty) {
      return new Dimension()._Dimension$Dimension(this.cachedDisplaySize);
    }
    let result = new Dimension()._Dimension$();
    let renderer = this.comboBox.getRenderer();
    if (renderer == null) {
      renderer = new DefaultListCellRenderer()._DefaultListCellRenderer();
    }
    this.sameBaseline = true;
    let prototypeValue = this.comboBox.getPrototypeDisplayValue();
    if (prototypeValue != null) {
      result = this.getSizeForComponent(renderer.getListCellRendererComponent(this.listBox, prototypeValue, -1, false, false));
    } else {
      let model = this.comboBox.getModel();
      let modelSize = model.getSize();
      let baseline = -1;
      let d: Dimension;
      let cpn: Component;
      if (modelSize > 0) {
        for (let i = 0; i < modelSize; i++) {
          let value = model.getElementAt(i);
          let c = renderer.getListCellRendererComponent(this.listBox, value, -1, false, false);
          d = this.getSizeForComponent(c);
          if (this.sameBaseline && value != null && (!($J.isa(value, JString)) || !$J.equals('', value))) {
            let newBaseline = c.getBaseline(d.width_, d.height_);
            if (newBaseline === -1) {
              this.sameBaseline = false;
            } else if (baseline === -1) {
              baseline = newBaseline;
            } else if (baseline !== newBaseline) {
              this.sameBaseline = false;
            }
          }
          result.width_ = Math.max(result.width_, d.width_);
          result.height_ = Math.max(result.height_, d.height_);
        }
      } else {
        result = this.getDefaultSize();
        if (this.comboBox.isEditable()) {
          result.width_ = 100;
        }
      }
    }
    if (this.comboBox.isEditable()) {
      let d = this.editor.getPreferredSize$();
      result.width_ = Math.max(result.width_, d.width_);
      result.height_ = Math.max(result.height_, d.height_);
    }
    if (this.padding != null) {
      result.width_ = (result.width_ + (this.padding.left + this.padding.right)) | 0;
      result.height_ = (result.height_ + (this.padding.top + this.padding.bottom)) | 0;
    }
    this.cachedDisplaySize.setSize$int$int(result.width_, result.height_);
    this.isDisplaySizeDirty = false;
    return result;
  }
  /**
   * Returns the size a component would have if used as a cell renderer.
   *
   * @param comp a {@code Component} to check
   * @return size of the component
   * @since 1.7
   */
  getSizeForComponent(comp: Component): Dimension {
    this.currentValuePane.add$Component(comp);
    comp.setFont(this.comboBox.getFont());
    let d = comp.getPreferredSize$();
    this.currentValuePane.remove$Component(comp);
    return d;
  }
  /**
   * Adds keyboard actions to the JComboBox.  Actions on enter and esc are already
   * supplied.  Add more actions as you need them.
   */
  installKeyboardActions(): void {
    let km = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    SwingUtilities.replaceUIInputMap(this.comboBox, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, km);
    LazyActionMap.installLazyActionMap(this.comboBox, $J.cls(BasicComboBoxUI), 'ComboBox.actionMap');
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      return DefaultLookup.get(this.comboBox, this, 'ComboBox.ancestorInputMap');
    }
    return null;
  }
  isTableCellEditor(): boolean {
    return this.isTableCellEditor_;
  }
  /**
   * Removes the focus InputMap and ActionMap.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIInputMap(this.comboBox, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, null);
    SwingUtilities.replaceUIActionMap(this.comboBox, null);
  }
  static $clinit() {
    BasicComboBoxUI.COMBO_UI_LIST_CELL_RENDERER_KEY = new StringBuffer('DefaultListCellRendererKey');
    BasicComboBoxUI.HIDE_POPUP_KEY = new StringBuffer('HidePopupKey');
  }
}

/**
 * This listener watches for bound properties that have changed in the
 * combo box.
 * <p>
 * Subclasses which wish to listen to combo box property changes should
 * call the superclass methods to ensure that the combo box ui correctly
 * handles property changes.
 * <p>
 * This public inner class should be treated as protected.
 * Instantiate it only within subclasses of
 * <code>BasicComboBoxUI</code>.
 *
 * @see #createPropertyChangeListener
 */
export class BasicComboBoxUI$PropertyChangeHandler extends JObject {
  /**
   * Constructs a {@code PropertyChangeHandler}.
   */
  _BasicComboBoxUI$PropertyChangeHandler(): this {
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    this.$outer.getHandler().propertyChange(e);
  }
}

/**
 * This layout manager handles the 'standard' layout of combo boxes.  It puts
 * the arrow button to the right and the editor to the left.  If there is no
 * editor it still keeps the arrow button to the right.
 *
 * This public inner class should be treated as protected.
 * Instantiate it only within subclasses of
 * <code>BasicComboBoxUI</code>.
 */
export class BasicComboBoxUI$ComboBoxLayoutManager extends JObject {
  /**
   * Constructs a {@code ComboBoxLayoutManager}.
   */
  _BasicComboBoxUI$ComboBoxLayoutManager(): this {
    return this;
  }
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  removeLayoutComponent(comp: Component): void {
  }
  preferredLayoutSize(parent: Container): Dimension {
    return this.$outer.getHandler().preferredLayoutSize(parent);
  }
  minimumLayoutSize(parent: Container): Dimension {
    return this.$outer.getHandler().minimumLayoutSize(parent);
  }
  layoutContainer$Container(parent: Container): void {
    this.$outer.getHandler().layoutContainer$Container(parent);
  }
}

export class BasicComboBoxUI$Actions extends UIAction {
  static readonly HIDE: string = 'hidePopup';
  static readonly DOWN: string = 'selectNext';
  static readonly DOWN_2: string = 'selectNext2';
  static readonly TOGGLE: string = 'togglePopup';
  static readonly TOGGLE_2: string = 'spacePopup';
  static readonly UP: string = 'selectPrevious';
  static readonly UP_2: string = 'selectPrevious2';
  static readonly ENTER: string = 'enterPressed';
  static readonly PAGE_DOWN: string = 'pageDownPassThrough';
  static readonly PAGE_UP: string = 'pageUpPassThrough';
  static readonly HOME: string = 'homePassThrough';
  static readonly END: string = 'endPassThrough';
  _BasicComboBoxUI$Actions(name: string): this {
    this._UIAction(name);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let key = this.getName();
    let comboBox = e.getSource();
    let ui = BasicLookAndFeel.getUIOfType(comboBox.getUI(), $J.cls(BasicComboBoxUI));
    if (key === BasicComboBoxUI$Actions.HIDE) {
      comboBox.firePopupMenuCanceled();
      comboBox.setPopupVisible(false);
    } else if (key === BasicComboBoxUI$Actions.PAGE_DOWN || key === BasicComboBoxUI$Actions.PAGE_UP || key === BasicComboBoxUI$Actions.HOME || key === BasicComboBoxUI$Actions.END) {
      let index = this.getNextIndex(comboBox, key);
      if (index >= 0 && index < comboBox.getItemCount()) {
        if (UIManager.getBoolean$Object('ComboBox.noActionOnKeyNavigation') && comboBox.isPopupVisible()) {
          ui.listBox.setSelectedIndex(index);
          ui.listBox.ensureIndexIsVisible(index);
          comboBox.repaint$();
        } else {
          comboBox.setSelectedIndex(index);
        }
      }
    } else if (key === BasicComboBoxUI$Actions.DOWN) {
      if (comboBox.isShowing()) {
        if (comboBox.isPopupVisible()) {
          if (ui != null) {
            ui.selectNextPossibleValue();
          }
        } else {
          comboBox.setPopupVisible(true);
        }
      }
    } else if (key === BasicComboBoxUI$Actions.DOWN_2) {
      if (comboBox.isShowing()) {
        if ((comboBox.isEditable() || (ui != null && ui.isTableCellEditor())) && !comboBox.isPopupVisible()) {
          comboBox.setPopupVisible(true);
        } else {
          if (ui != null) {
            ui.selectNextPossibleValue();
          }
        }
      }
    } else if (key === BasicComboBoxUI$Actions.TOGGLE || key === BasicComboBoxUI$Actions.TOGGLE_2) {
      if (ui != null && (key === BasicComboBoxUI$Actions.TOGGLE || !comboBox.isEditable())) {
        if (ui.isTableCellEditor()) {
          comboBox.setSelectedIndex(ui.popup.getList().getSelectedIndex());
        } else {
          comboBox.setPopupVisible(!comboBox.isPopupVisible());
        }
      }
    } else if (key === BasicComboBoxUI$Actions.UP) {
      if (ui != null) {
        if (ui.isPopupVisible(comboBox)) {
          ui.selectPreviousPossibleValue();
        } else if (DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(comboBox, ui, 'ComboBox.showPopupOnNavigation', false)) {
          ui.setPopupVisible(comboBox, true);
        }
      }
    } else if (key === BasicComboBoxUI$Actions.UP_2) {
      if (comboBox.isShowing() && ui != null) {
        if (comboBox.isEditable() && !comboBox.isPopupVisible()) {
          comboBox.setPopupVisible(true);
        } else {
          ui.selectPreviousPossibleValue();
        }
      }
    } else if (key === BasicComboBoxUI$Actions.ENTER) {
      if (comboBox.isPopupVisible()) {
        if (UIManager.getBoolean$Object('ComboBox.noActionOnKeyNavigation')) {
          let listItem = ui.popup.getList().getSelectedValue();
          if (listItem != null) {
            comboBox.getEditor().setItem(listItem);
            comboBox.setSelectedItem(listItem);
          }
          comboBox.setPopupVisible(false);
        } else {
          let isEnterSelectablePopup = UIManager.getBoolean$Object('ComboBox.isEnterSelectablePopup');
          if (!comboBox.isEditable() || isEnterSelectablePopup || ui.isTableCellEditor_) {
            let listItem = ui.popup.getList().getSelectedValue();
            if (listItem != null) {
              comboBox.getEditor().setItem(listItem);
              comboBox.setSelectedItem(listItem);
            }
          }
          comboBox.setPopupVisible(false);
        }
      } else {
        if (ui.isTableCellEditor_ && !comboBox.isEditable()) {
          comboBox.setSelectedItem(comboBox.getSelectedItem());
        }
        let root = SwingUtilities.getRootPane(comboBox);
        if (root != null) {
          let im = root.getInputMap$int(JComponent.WHEN_IN_FOCUSED_WINDOW);
          let am = root.getActionMap$();
          if (im != null && am != null) {
            let obj = im.get(KeyStroke.getKeyStroke$int$int(KeyEvent.VK_ENTER, 0));
            if (obj != null) {
              let action = am.get(obj);
              if (action != null) {
                action.actionPerformed(new ActionEvent()._ActionEvent$Object$int$String$long$int(root, e.getID(), e.getActionCommand(), e.getWhen(), e.getModifiers()));
              }
            }
          }
        }
      }
    }
  }
  getNextIndex(comboBox: JComboBox<any>, key: string): number {
    let listHeight = comboBox.getMaximumRowCount();
    let selectedIndex = comboBox.getSelectedIndex();
    if (UIManager.getBoolean$Object('ComboBox.noActionOnKeyNavigation') && (comboBox.getUI() instanceof BasicComboBoxUI)) {
      selectedIndex = (comboBox.getUI()).listBox.getSelectedIndex();
    }
    if (key === BasicComboBoxUI$Actions.PAGE_UP) {
      let index = (selectedIndex - listHeight) | 0;
      return (index < 0 ? 0 : index);
    } else if (key === BasicComboBoxUI$Actions.PAGE_DOWN) {
      let index = (selectedIndex + listHeight) | 0;
      let max = comboBox.getItemCount();
      return (index < max ? index : (max - 1) | 0);
    } else if (key === BasicComboBoxUI$Actions.HOME) {
      return 0;
    } else if (key === BasicComboBoxUI$Actions.END) {
      return (comboBox.getItemCount() - 1) | 0;
    }
    return comboBox.getSelectedIndex();
  }
  accept(c: any): boolean {
    if (this.getName() === BasicComboBoxUI$Actions.HIDE) {
      return (c != null && (c).isPopupVisible());
    } else if (this.getName() === BasicComboBoxUI$Actions.ENTER) {
      let root = SwingUtilities.getRootPane(c);
      if (root != null && (c != null && !(c).isPopupVisible())) {
        let im = root.getInputMap$int(JComponent.WHEN_IN_FOCUSED_WINDOW);
        let am = root.getActionMap$();
        if (im != null && am != null) {
          let obj = im.get(KeyStroke.getKeyStroke$int$int(KeyEvent.VK_ENTER, 0));
          if (obj == null) {
            return false;
          }
        }
      }
    }
    return true;
  }
}

export class BasicComboBoxUI$Handler extends JObject {
  _BasicComboBoxUI$Handler(): this {
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    let propertyName = e.getPropertyName();
    if (e.getSource() === this.$outer.editor) {
      if ($J.equals('border', propertyName)) {
        this.$outer.isMinimumSizeDirty = true;
        this.$outer.isDisplaySizeDirty = true;
        this.$outer.comboBox.revalidate();
      }
    } else {
      let comboBox = e.getSource();
      if (propertyName === 'model') {
        let newModel = e.getNewValue();
        let oldModel = e.getOldValue();
        if (oldModel != null && this.$outer.listDataListener != null) {
          oldModel.removeListDataListener(this.$outer.listDataListener);
        }
        if (newModel != null && this.$outer.listDataListener != null) {
          newModel.addListDataListener(this.$outer.listDataListener);
        }
        if (this.$outer.editor != null) {
          comboBox.configureEditor(comboBox.getEditor(), comboBox.getSelectedItem());
        }
        this.$outer.isMinimumSizeDirty = true;
        this.$outer.isDisplaySizeDirty = true;
        comboBox.revalidate();
        comboBox.repaint$();
      } else if (propertyName === 'editor' && comboBox.isEditable()) {
        this.$outer.addEditor();
        comboBox.revalidate();
      } else if (propertyName === 'editable') {
        if (comboBox.isEditable()) {
          comboBox.setRequestFocusEnabled(false);
          this.$outer.addEditor();
        } else {
          comboBox.setRequestFocusEnabled(true);
          this.$outer.removeEditor();
        }
        this.$outer.updateToolTipTextForChildren();
        comboBox.revalidate();
      } else if (propertyName === 'enabled') {
        let enabled = comboBox.isEnabled();
        if (this.$outer.editor != null) {
          this.$outer.editor.setEnabled(enabled);
        }
        if (this.$outer.arrowButton != null) {
          this.$outer.arrowButton.setEnabled(enabled);
        }
        comboBox.repaint$();
      } else if (propertyName === 'focusable') {
        let focusable = comboBox.isFocusable();
        if (this.$outer.editor != null) {
          this.$outer.editor.setFocusable(focusable);
        }
        if (this.$outer.arrowButton != null) {
          this.$outer.arrowButton.setFocusable(focusable);
        }
        comboBox.repaint$();
      } else if (propertyName === 'maximumRowCount') {
        if (this.$outer.isPopupVisible(comboBox)) {
          this.$outer.setPopupVisible(comboBox, false);
          this.$outer.setPopupVisible(comboBox, true);
        }
      } else if (propertyName === 'font') {
        this.$outer.listBox.setFont(comboBox.getFont());
        if (this.$outer.editor != null) {
          this.$outer.editor.setFont(comboBox.getFont());
        }
        this.$outer.isMinimumSizeDirty = true;
        this.$outer.isDisplaySizeDirty = true;
        comboBox.validate();
      } else if (SwingUtilities2.isScaleChanged$PropertyChangeEvent(e)) {
        this.$outer.isMinimumSizeDirty = true;
        this.$outer.isDisplaySizeDirty = true;
        comboBox.validate();
      } else if (propertyName === JComponent.TOOL_TIP_TEXT_KEY) {
        this.$outer.updateToolTipTextForChildren();
      } else if (propertyName === BasicComboBoxUI.IS_TABLE_CELL_EDITOR) {
        let inTable = e.getNewValue();
        this.$outer.isTableCellEditor_ = $J.equals(inTable, true) ? true : false;
      } else if (propertyName === 'prototypeDisplayValue') {
        this.$outer.isMinimumSizeDirty = true;
        this.$outer.isDisplaySizeDirty = true;
        comboBox.revalidate();
      } else if (propertyName === 'renderer') {
        this.$outer.isMinimumSizeDirty = true;
        this.$outer.isDisplaySizeDirty = true;
        comboBox.revalidate();
      }
    }
  }
  keyPressed(e: KeyEvent): void {
    if (this.$outer.isNavigationKey$int$int$BasicComboBoxUI(e.getKeyCode(), e.getModifiers())) {
      this.$outer.lastTime = 0;
    } else if (this.$outer.comboBox.isEnabled() && this.$outer.comboBox.getModel().getSize() !== 0 && this.isTypeAheadKey(e) && e.getKeyChar() !== KeyEvent.CHAR_UNDEFINED) {
      this.$outer.time = e.getWhen();
      if (this.$outer.comboBox.selectWithKeyChar(e.getKeyChar())) {
        e.consume();
      }
    }
  }
  keyTyped(e: KeyEvent): void {
  }
  keyReleased(e: KeyEvent): void {
  }
  isTypeAheadKey(e: KeyEvent): boolean {
    return !e.isAltDown() && !BasicGraphicsUtils.isMenuShortcutKeyDown(e);
  }
  focusGained(e: FocusEvent): void {
    let comboBoxEditor = this.$outer.comboBox.getEditor();
    if ((comboBoxEditor != null) && (e.getSource() === comboBoxEditor.getEditorComponent())) {
      return;
    }
    this.$outer.hasFocus_ = true;
    this.$outer.comboBox.repaint$();
    if (this.$outer.comboBox.isEditable() && this.$outer.editor != null) {
      this.$outer.editor.requestFocus$();
    }
  }
  focusLost(e: FocusEvent): void {
    let editor = this.$outer.comboBox.getEditor();
    if ((editor != null) && (e.getSource() === editor.getEditorComponent())) {
      let item = editor.getItem();
      let selectedItem = this.$outer.comboBox.getSelectedItem();
      if (!e.isTemporary() && item != null && !$J.equals(item, (selectedItem == null) ? '' : selectedItem)) {
        this.$outer.comboBox.actionPerformed(new ActionEvent()._ActionEvent$Object$int$String$long$int(editor, 0, '', EventQueue.getMostRecentEventTime(), 0));
      }
    }
    this.$outer.hasFocus_ = false;
    if (!e.isTemporary()) {
      this.$outer.setPopupVisible(this.$outer.comboBox, false);
    }
    this.$outer.comboBox.repaint$();
  }
  contentsChanged(e: ListDataEvent): void {
    if (!(e.getIndex0() === -1 && e.getIndex1() === -1)) {
      this.$outer.isMinimumSizeDirty = true;
      this.$outer.comboBox.revalidate();
    }
    if (this.$outer.comboBox.isEditable() && this.$outer.editor != null) {
      this.$outer.comboBox.configureEditor(this.$outer.comboBox.getEditor(), this.$outer.comboBox.getSelectedItem());
    }
    this.$outer.isDisplaySizeDirty = true;
    this.$outer.comboBox.repaint$();
  }
  intervalAdded(e: ListDataEvent): void {
    this.contentsChanged(e);
  }
  intervalRemoved(e: ListDataEvent): void {
    this.contentsChanged(e);
  }
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  removeLayoutComponent(comp: Component): void {
  }
  preferredLayoutSize(parent: Container): Dimension {
    return parent.getPreferredSize$();
  }
  minimumLayoutSize(parent: Container): Dimension {
    return parent.getMinimumSize$();
  }
  layoutContainer$Container(parent: Container): void {
    let cb = parent;
    let width = cb.getWidth();
    let height = cb.getHeight();
    let insets = this.$outer.getInsets();
    let buttonHeight = (height - (insets.top + insets.bottom)) | 0;
    let buttonWidth = buttonHeight;
    if (this.$outer.arrowButton != null) {
      let arrowInsets = this.$outer.arrowButton.getInsets$();
      buttonWidth = this.$outer.squareButton ? buttonHeight : (this.$outer.arrowButton.getPreferredSize$().width_ + arrowInsets.left + arrowInsets.right) | 0;
    }
    let cvb: Rectangle;
    if (this.$outer.arrowButton != null) {
      if (BasicGraphicsUtils.isLeftToRight(cb)) {
        this.$outer.arrowButton.setBounds$int$int$int$int((width - (insets.right + buttonWidth)) | 0, insets.top, buttonWidth, buttonHeight);
      } else {
        this.$outer.arrowButton.setBounds$int$int$int$int(insets.left, insets.top, buttonWidth, buttonHeight);
      }
    }
    if (this.$outer.editor != null) {
      cvb = this.$outer.rectangleForCurrentValue();
      this.$outer.editor.setBounds$Rectangle(cvb);
    }
  }
  actionPerformed(evt: ActionEvent): void {
    let item = this.$outer.comboBox.getEditor().getItem();
    if (item != null) {
      if (!this.$outer.comboBox.isPopupVisible() && !$J.equals(item, this.$outer.comboBox.getSelectedItem())) {
        this.$outer.comboBox.setSelectedItem(this.$outer.comboBox.getEditor().getItem());
      }
      let am = this.$outer.comboBox.getActionMap$();
      if (am != null) {
        let action = am.get('enterPressed');
        if (action != null) {
          action.actionPerformed(new ActionEvent()._ActionEvent$Object$int$String$int(this.$outer.comboBox, evt.getID(), evt.getActionCommand(), evt.getModifiers()));
        }
      }
    }
  }
}

export class BasicComboBoxUI$DefaultKeySelectionManager extends JObject {
  prefix: string = null;
  typedString: string = null;
  _BasicComboBoxUI$DefaultKeySelectionManager(): this {
    this.prefix = '';
    this.typedString = '';
    return this;
  }
  selectionForKey(aKey: number, aModel: ComboBoxModel<any>): number {
    if (this.$outer.lastTime === 0) {
      this.prefix = '';
      this.typedString = '';
    }
    let startingFromSelection = true;
    let startIndex = this.$outer.comboBox.getSelectedIndex();
    if (this.$outer.time - this.$outer.lastTime < this.$outer.timeFactor) {
      this.typedString += String.fromCharCode(aKey);
      if ((this.prefix.length === 1) && (aKey === this.prefix.charCodeAt(0))) {
        startIndex++;
      } else {
        this.prefix = this.typedString;
      }
    } else {
      startIndex++;
      this.typedString = '' + String.fromCharCode(aKey);
      this.prefix = this.typedString;
    }
    this.$outer.lastTime = this.$outer.time;
    if (startIndex < 0 || startIndex >= aModel.getSize()) {
      startingFromSelection = false;
      startIndex = 0;
    }
    let index = this.$outer.listBox.getNextMatch(this.prefix, startIndex, Position$Bias.Forward);
    if (index < 0 && startingFromSelection) {
      index = this.$outer.listBox.getNextMatch(this.prefix, 0, Position$Bias.Forward);
    }
    return index;
  }
}

$J.define(BasicComboBoxUI, 'javax.swing.plaf.basic.BasicComboBoxUI', { kind: 'class', sup: 'javax.swing.plaf.ComboBoxUI', ctors: { '': '_BasicComboBoxUI' }, meths: { 'isNavigationKey(int,int)': 'isNavigationKey$int$int$BasicComboBoxUI', 'isNavigationKey(int)': 'isNavigationKey$int', 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' }, clinit: true, lazy: ['COMBO_UI_LIST_CELL_RENDERER_KEY', 'HIDE_POPUP_KEY'] });
$J.define(BasicComboBoxUI$PropertyChangeHandler, 'javax.swing.plaf.basic.BasicComboBoxUI$PropertyChangeHandler', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicComboBoxUI$PropertyChangeHandler' }, inner: true });
$J.define(BasicComboBoxUI$ComboBoxLayoutManager, 'javax.swing.plaf.basic.BasicComboBoxUI$ComboBoxLayoutManager', { kind: 'class', ifaces: ['java.awt.LayoutManager'], sup: 'java.lang.Object', ctors: { '': '_BasicComboBoxUI$ComboBoxLayoutManager' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' }, inner: true });
$J.define(BasicComboBoxUI$Actions, 'javax.swing.plaf.basic.BasicComboBoxUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicComboBoxUI$Actions' } });
$J.define(BasicComboBoxUI$Handler, 'javax.swing.plaf.basic.BasicComboBoxUI$Handler', { kind: 'class', ifaces: ['java.awt.event.ActionListener', 'java.awt.event.FocusListener', 'java.awt.event.KeyListener', 'java.awt.LayoutManager', 'javax.swing.event.ListDataListener', 'java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicComboBoxUI$Handler' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' }, inner: true });
$J.define(BasicComboBoxUI$DefaultKeySelectionManager, 'javax.swing.plaf.basic.BasicComboBoxUI$DefaultKeySelectionManager', { kind: 'class', ifaces: ['javax.swing.JComboBox$KeySelectionManager', 'javax.swing.plaf.UIResource'], sup: 'java.lang.Object', ctors: { '': '_BasicComboBoxUI$DefaultKeySelectionManager' }, inner: true });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Dimension = $J.load('java.awt.Dimension');
  EventQueue = $J.load('java.awt.EventQueue');
  Rectangle = $J.load('java.awt.Rectangle');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  Accessible = $J.load('javax.accessibility.Accessible');
  CellRendererPane = $J.load('javax.swing.CellRendererPane');
  DefaultListCellRenderer = $J.load('javax.swing.DefaultListCellRenderer');
  JComponent = $J.load('javax.swing.JComponent');
  JLabel = $J.load('javax.swing.JLabel');
  JPanel = $J.load('javax.swing.JPanel');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicArrowButton = $J.load('javax.swing.plaf.basic.BasicArrowButton');
  BasicComboBoxEditor$UIResource = $J.load('javax.swing.plaf.basic.BasicComboBoxEditor$UIResource');
  BasicComboBoxRenderer$UIResource = $J.load('javax.swing.plaf.basic.BasicComboBoxRenderer$UIResource');
  BasicComboPopup = $J.load('javax.swing.plaf.basic.BasicComboPopup');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
