// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JComboBox.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject, JString, RuntimeException } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { ActionPropertyChangeListener } from './ActionPropertyChangeListener.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let Component, EventQueue, ActionEvent, ActionListener, InputEvent, ItemEvent, ItemListener, KeyEvent, PropertyChangeEvent, Accessible, AccessibleContext, AccessibleState, AbstractAction, Action, DefaultComboBoxModel, JPopupMenu, MutableComboBoxModel, SwingUtilities, UIManager, PopupMenuEvent, PopupMenuListener, ComboPopup;

/**
 * A component that combines a button or editable field and a drop-down list.
 * The user can select a value from the drop-down list, which appears at the
 * user's request. If you make the combo box editable, then the combo box
 * includes an editable field into which the user can type a value.
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
 * <p>
 * See <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/combobox.html">How to Use Combo Boxes</a>
 * in <a href="https://docs.oracle.com/javase/tutorial/"><em>The Java Tutorial</em></a>
 * for further information.
 *
 * @see ComboBoxModel
 * @see DefaultComboBoxModel
 *
 * @param <E> the type of the elements of this combo box
 *
 * @author Arnaud Weber
 * @author Mark Davidson
 * @since 1.2
 */
export class JComboBox<E> extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'ComboBoxUI';
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor methods instead.
   *
   * @see #getModel
   * @see #setModel
   */
  dataModel: ComboBoxModel<E> = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor methods instead.
   *
   * @see #getRenderer
   * @see #setRenderer
   */
  renderer: ListCellRenderer<any> = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor methods instead.
   *
   * @see #getEditor
   * @see #setEditor
   */
  editor: ComboBoxEditor = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor methods instead.
   *
   * @see #getMaximumRowCount
   * @see #setMaximumRowCount
   */
  maximumRowCount: number = 0;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor methods instead.
   *
   * @see #isEditable()
   * @see #setEditable
   */
  isEditable_: boolean = false;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor methods instead.
   *
   * @see #setKeySelectionManager
   * @see #getKeySelectionManager
   */
  keySelectionManager: JComboBox$KeySelectionManager = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor methods instead.
   *
   * @see #setActionCommand
   * @see #getActionCommand
   */
  actionCommand: string = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor methods instead.
   *
   * @see #setLightWeightPopupEnabled
   * @see #isLightWeightPopupEnabled
   */
  lightWeightPopupEnabled: boolean = false;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override.
   */
  selectedItemReminder: any = null;
  prototypeDisplayValue: E = null;
  firingActionEvent: boolean = false;
  selectingItem: boolean = false;
  updateInProgress: boolean = false;
  action_: Action = null;
  actionPropertyChangeListener: PropertyChangeListener = null;
  $init_JComboBox() {
    this.maximumRowCount = 8;
    this.isEditable_ = false;
    this.keySelectionManager = null;
    this.actionCommand = 'comboBoxChanged';
    this.lightWeightPopupEnabled = JPopupMenu.getDefaultLightWeightPopupEnabled();
    this.selectedItemReminder = null;
    this.firingActionEvent = false;
    this.selectingItem = false;
  }
  /**
   * Creates a <code>JComboBox</code> that takes its items from an
   * existing <code>ComboBoxModel</code>.  Since the
   * <code>ComboBoxModel</code> is provided, a combo box created using
   * this constructor does not create a default combo box model and
   * may impact how the insert, remove and add methods behave.
   *
   * @param aModel the <code>ComboBoxModel</code> that provides the
   *          displayed list of items
   * @see DefaultComboBoxModel
   */
  _JComboBox$ComboBoxModel(aModel: ComboBoxModel<E>): this {
    this._JComponent();
    this.$init_JComboBox();
    this.setModel(aModel);
    this.init();
    return this;
  }
  /**
   * Creates a <code>JComboBox</code> that contains the elements
   * in the specified array.  By default the first item in the array
   * (and therefore the data model) becomes selected.
   *
   * @param items  an array of objects to insert into the combo box
   * @see DefaultComboBoxModel
   */
  _JComboBox$ObjectArr(items: E[]): this {
    this._JComponent();
    this.$init_JComboBox();
    this.setModel(new DefaultComboBoxModel()._DefaultComboBoxModel$ObjectArr(items));
    this.init();
    return this;
  }
  /**
   * Creates a <code>JComboBox</code> that contains the elements
   * in the specified Vector.  By default the first item in the vector
   * (and therefore the data model) becomes selected.
   *
   * @param items  an array of vectors to insert into the combo box
   * @see DefaultComboBoxModel
   */
  _JComboBox$Vector(items: Vector<E>): this {
    this._JComponent();
    this.$init_JComboBox();
    this.setModel(new DefaultComboBoxModel()._DefaultComboBoxModel$Vector(items));
    this.init();
    return this;
  }
  /**
   * Creates a <code>JComboBox</code> with a default data model.
   * The default data model is an empty list of objects.
   * Use <code>addItem</code> to add items.  By default the first item
   * in the data model becomes selected.
   *
   * @see DefaultComboBoxModel
   */
  _JComboBox$(): this {
    this._JComponent();
    this.$init_JComboBox();
    this.setModel(new DefaultComboBoxModel()._DefaultComboBoxModel$());
    this.init();
    return this;
  }
  init(): void {
    this.installAncestorListener();
    this.setUIProperty('opaque', true);
    this.updateUI();
  }
  /**
   * Registers ancestor listener so that it will receive
   * {@code AncestorEvents} when it or any of its ancestors
   * move or are made visible or invisible.
   * Events are also sent when the component or its ancestors are added
   * or removed from the containment hierarchy.
   */
  installAncestorListener(): void {
    this.addAncestorListener(new (JComboBox$1())().$o(this));
  }
  /**
   * Sets the L&amp;F object that renders this component.
   *
   * @param ui  the <code>ComboBoxUI</code> L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$ComboBoxUI(ui: ComboBoxUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Resets the UI property to a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    if (!this.updateInProgress) {
      this.updateInProgress = true;
      try {
        this.setUI$ComboBoxUI(UIManager.getUI(this));
        let renderer = this.getRenderer();
        if (renderer instanceof Component) {
          SwingUtilities.updateComponentTreeUI(renderer);
        }
      } finally {
        this.updateInProgress = false;
      }
    }
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "ComboBoxUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JComboBox.uiClassID;
  }
  /**
   * Returns the L&amp;F object that renders this component.
   *
   * @return the ComboBoxUI object that renders this component
   */
  getUI(): ComboBoxUI {
    return this.ui;
  }
  /**
   * Sets the data model that the <code>JComboBox</code> uses to obtain
   * the list of items.
   *
   * @param aModel the <code>ComboBoxModel</code> that provides the
   *  displayed list of items
   */
  setModel(aModel: ComboBoxModel<E>): void {
    let oldModel = this.dataModel;
    if (oldModel != null) {
      oldModel.removeListDataListener(this);
    }
    this.dataModel = aModel;
    this.dataModel.addListDataListener(this);
    this.selectedItemReminder = this.dataModel.getSelectedItem();
    this.firePropertyChange$String$Object$Object('model', oldModel, this.dataModel);
  }
  /**
   * Returns the data model currently used by the <code>JComboBox</code>.
   *
   * @return the <code>ComboBoxModel</code> that provides the displayed
   *                  list of items
   */
  getModel(): ComboBoxModel<E> {
    return this.dataModel;
  }
  /**
   * Gets the value of the <code>lightWeightPopupEnabled</code>
   * property.
   *
   * @return the value of the <code>lightWeightPopupEnabled</code>
   *    property
   * @see #setLightWeightPopupEnabled
   */
  isLightWeightPopupEnabled(): boolean {
    return this.lightWeightPopupEnabled;
  }
  /**
   * Determines whether the <code>JComboBox</code> field is editable.
   * An editable <code>JComboBox</code> allows the user to type into the
   * field or selected an item from the list to initialize the field,
   * after which it can be edited. (The editing affects only the field,
   * the list item remains intact.) A non editable <code>JComboBox</code>
   * displays the selected item in the field,
   * but the selection cannot be modified.
   *
   * @param aFlag a boolean value, where true indicates that the
   *                  field is editable
   */
  setEditable(aFlag: boolean): void {
    let oldFlag = this.isEditable_;
    this.isEditable_ = aFlag;
    this.firePropertyChange$String$boolean$boolean('editable', oldFlag, this.isEditable_);
  }
  /**
   * Returns true if the <code>JComboBox</code> is editable.
   * By default, a combo box is not editable.
   *
   * @return true if the <code>JComboBox</code> is editable, else false
   */
  isEditable(): boolean {
    return this.isEditable_;
  }
  /**
   * Sets the maximum number of rows the <code>JComboBox</code> displays.
   * If the number of objects in the model is greater than count,
   * the combo box uses a scrollbar.
   *
   * @param count an integer specifying the maximum number of items to
   *              display in the list before using a scrollbar
   */
  setMaximumRowCount(count: number): void {
    let oldCount = this.maximumRowCount;
    this.maximumRowCount = count;
    this.firePropertyChange$String$int$int('maximumRowCount', oldCount, this.maximumRowCount);
  }
  /**
   * Returns the maximum number of items the combo box can display
   * without a scrollbar
   *
   * @return an integer specifying the maximum number of items that are
   *         displayed in the list before using a scrollbar
   */
  getMaximumRowCount(): number {
    return this.maximumRowCount;
  }
  /**
   * Sets the renderer that paints the list items and the item selected from the list in
   * the JComboBox field. The renderer is used if the JComboBox is not
   * editable. If it is editable, the editor is used to render and edit
   * the selected item.
   * <p>
   * The default renderer displays a string or an icon.
   * Other renderers can handle graphic images and composite items.
   * <p>
   * To display the selected item,
   * <code>aRenderer.getListCellRendererComponent</code>
   * is called, passing the list object and an index of -1.
   *
   * @param aRenderer  the <code>ListCellRenderer</code> that
   *                  displays the selected item
   * @see #setEditor
   */
  setRenderer(aRenderer: ListCellRenderer<any>): void {
    let oldRenderer = this.renderer;
    this.renderer = aRenderer;
    this.firePropertyChange$String$Object$Object('renderer', oldRenderer, this.renderer);
    this.invalidate();
  }
  /**
   * Returns the renderer used to display the selected item in the
   * <code>JComboBox</code> field.
   *
   * @return  the <code>ListCellRenderer</code> that displays
   *                  the selected item.
   */
  getRenderer(): ListCellRenderer<any> {
    return this.renderer;
  }
  /**
   * Sets the editor used to paint and edit the selected item in the
   * <code>JComboBox</code> field.  The editor is used only if the
   * receiving <code>JComboBox</code> is editable. If not editable,
   * the combo box uses the renderer to paint the selected item.
   *
   * @param anEditor  the <code>ComboBoxEditor</code> that
   *                  displays the selected item
   * @see #setRenderer
   */
  setEditor(anEditor: ComboBoxEditor): void {
    let oldEditor = this.editor;
    if (this.editor != null) {
      this.editor.removeActionListener($J.fn(this, 'actionPerformed'));
    }
    this.editor = anEditor;
    if (this.editor != null) {
      this.editor.addActionListener($J.fn(this, 'actionPerformed'));
    }
    this.firePropertyChange$String$Object$Object('editor', oldEditor, this.editor);
  }
  /**
   * Returns the editor used to paint and edit the selected item in the
   * <code>JComboBox</code> field.
   *
   * @return the <code>ComboBoxEditor</code> that displays the selected item
   */
  getEditor(): ComboBoxEditor {
    return this.editor;
  }
  /**
   * Sets the selected item in the combo box display area to the object in
   * the argument.
   * If <code>anObject</code> is in the list, the display area shows
   * <code>anObject</code> selected.
   * <p>
   * If <code>anObject</code> is <i>not</i> in the list and the combo box is
   * uneditable, it will not change the current selection. For editable
   * combo boxes, the selection will change to <code>anObject</code>.
   * <p>
   * If this constitutes a change in the selected item,
   * <code>ItemListener</code>s added to the combo box will be notified with
   * one or two <code>ItemEvent</code>s.
   * If there is a current selected item, an <code>ItemEvent</code> will be
   * fired and the state change will be <code>ItemEvent.DESELECTED</code>.
   * If <code>anObject</code> is in the list and is not currently selected
   * then an <code>ItemEvent</code> will be fired and the state change will
   * be <code>ItemEvent.SELECTED</code>.
   * <p>
   * <code>ActionListener</code>s added to the combo box will be notified
   * with an <code>ActionEvent</code> when this method is called.
   *
   * @param anObject  the list object to select; use <code>null</code> to
   *                        clear the selection
   */
  setSelectedItem(anObject: any): void {
    let oldSelection = this.selectedItemReminder;
    let objectToSelect = anObject;
    if (oldSelection == null || !$J.equals(oldSelection, anObject)) {
      if (anObject != null && !this.isEditable()) {
        let found = false;
        for (let i = 0; i < this.dataModel.getSize(); i++) {
          let element = this.dataModel.getElementAt(i);
          if ($J.equals(anObject, element)) {
            found = true;
            objectToSelect = element;
            break;
          }
        }
        if (!found) {
          return;
        }
        this.getEditor().setItem(anObject);
      }
      this.selectingItem = true;
      this.dataModel.setSelectedItem(objectToSelect);
      this.selectingItem = false;
      if (this.selectedItemReminder !== this.dataModel.getSelectedItem()) {
        this.selectedItemChanged();
      }
    }
    this.fireActionEvent();
  }
  /**
   * Returns the current selected item.
   * <p>
   * If the combo box is editable, then this value may not have been added
   * to the combo box with <code>addItem</code>, <code>insertItemAt</code>
   * or the data constructors.
   *
   * @return the current selected Object
   * @see #setSelectedItem
   */
  getSelectedItem(): any {
    return this.dataModel.getSelectedItem();
  }
  /**
   * Selects the item at index <code>anIndex</code>.
   *
   * @param anIndex an integer specifying the list item to select,
   *                  where 0 specifies the first item in the list and -1 indicates no selection
   * @throws IllegalArgumentException if <code>anIndex</code> &lt; -1 or
   *                  <code>anIndex</code> is greater than or equal to size
   */
  setSelectedIndex(anIndex: number): void {
    let size = this.dataModel.getSize();
    if (anIndex === -1) {
      this.setSelectedItem(null);
    } else if (anIndex < -1 || anIndex >= size) {
      throw new IllegalArgumentException('setSelectedIndex: ' + anIndex + ' out of bounds');
    } else {
      this.setSelectedItem(this.dataModel.getElementAt(anIndex));
    }
  }
  /**
   * Returns the first item in the list that matches the given item.
   * The result is not always defined if the <code>JComboBox</code>
   * allows selected items that are not in the list.
   * Returns -1 if there is no selected item or if the user specified
   * an item which is not in the list.
   *
   * @return an integer specifying the currently selected list item,
   *                  where 0 specifies
   *                  the first item in the list;
   *                  or -1 if no item is selected or if
   *                  the currently selected item is not in the list
   */
  getSelectedIndex(): number {
    let sObject = this.dataModel.getSelectedItem();
    let i: number;
    let c: number;
    let obj: E;
    for (i = 0, c = this.dataModel.getSize(); i < c; i++) {
      obj = this.dataModel.getElementAt(i);
      if (obj != null && $J.equals(obj, sObject)) {
        return i;
      }
    }
    return -1;
  }
  /**
   * Returns the "prototypical display" value - an Object used
   * for the calculation of the display height and width.
   *
   * @return the value of the <code>prototypeDisplayValue</code> property
   * @see #setPrototypeDisplayValue
   * @since 1.4
   */
  getPrototypeDisplayValue(): E {
    return this.prototypeDisplayValue;
  }
  /**
   * Adds an item to the item list.
   * This method works only if the <code>JComboBox</code> uses a
   * mutable data model.
   * <p>
   * <strong>Warning:</strong>
   * Focus and keyboard navigation problems may arise if you add duplicate
   * String objects. A workaround is to add new objects instead of String
   * objects and make sure that the toString() method is defined.
   * For example:
   * <pre>
   *   comboBox.addItem(makeObj("Item 1"));
   *   comboBox.addItem(makeObj("Item 1"));
   *   ...
   *   private Object makeObj(final String item)  {
   *     return new Object() { public String toString() { return item; } };
   *   }
   * </pre>
   *
   * @param item the item to add to the list
   * @see MutableComboBoxModel
   */
  addItem(item: E): void {
    this.checkMutableComboBoxModel();
    (this.dataModel).addElement(item);
  }
  /**
   * Removes all items from the item list.
   */
  removeAllItems(): void {
    this.checkMutableComboBoxModel();
    let model = this.dataModel;
    let size = model.getSize();
    if (model instanceof DefaultComboBoxModel) {
      (model).removeAllElements();
    } else {
      for (let i = 0; i < size; ++i) {
        let element = model.getElementAt(0);
        model.removeElement(element);
      }
    }
    this.selectedItemReminder = null;
    if (this.isEditable()) {
      this.editor.setItem(null);
    }
  }
  /**
   * Checks that the <code>dataModel</code> is an instance of
   * <code>MutableComboBoxModel</code>.  If not, it throws an exception.
   * @throws RuntimeException if <code>dataModel</code> is not an
   *          instance of <code>MutableComboBoxModel</code>.
   */
  checkMutableComboBoxModel(): void {
    if (!($J.isa(this.dataModel, MutableComboBoxModel))) {
      throw new RuntimeException('Cannot use this method with a non-Mutable data model.');
    }
  }
  /**
   * Causes the combo box to close its popup window.
   * @see #setPopupVisible
   */
  hidePopup(): void {
    this.setPopupVisible(false);
  }
  /**
   * Sets the visibility of the popup.
   *
   * @param v if {@code true} shows the popup, otherwise, hides the popup.
   */
  setPopupVisible(v: boolean): void {
    this.getUI().setPopupVisible(this, v);
  }
  /**
   * Determines the visibility of the popup.
   *
   * @return true if the popup is visible, otherwise returns false
   */
  isPopupVisible(): boolean {
    return this.getUI().isPopupVisible(this);
  }
  /**
   * Adds an <code>ItemListener</code>.
   * <p>
   * <code>aListener</code> will receive one or two <code>ItemEvent</code>s when
   * the selected item changes.
   *
   * @param aListener the <code>ItemListener</code> that is to be notified
   * @see #setSelectedItem
   */
  addItemListener(aListener: ItemListener): void {
    this.listenerList.add($J.cls(ItemListener), aListener);
  }
  /**
   * Removes an <code>ItemListener</code>.
   *
   * @param aListener  the <code>ItemListener</code> to remove
   */
  removeItemListener(aListener: ItemListener): void {
    this.listenerList.remove($J.cls(ItemListener), aListener);
  }
  /**
   * Adds an <code>ActionListener</code>.
   * <p>
   * The <code>ActionListener</code> will receive an <code>ActionEvent</code>
   * when a selection has been made. If the combo box is editable, then
   * an <code>ActionEvent</code> will be fired when editing has stopped.
   *
   * @param l  the <code>ActionListener</code> that is to be notified
   * @see #setSelectedItem
   */
  addActionListener(l: ActionListener): void {
    this.listenerList.add($J.cls(ActionListener), l);
  }
  /**
   * Removes an <code>ActionListener</code>.
   *
   * @param l  the <code>ActionListener</code> to remove
   */
  removeActionListener(l: ActionListener): void {
    if ((l != null) && (this.getAction() === l)) {
      this.setAction(null);
    } else {
      this.listenerList.remove($J.cls(ActionListener), l);
    }
  }
  /**
   * Returns an array of all the <code>ActionListener</code>s added
   * to this JComboBox with addActionListener().
   *
   * @return all of the <code>ActionListener</code>s added or an empty
   *         array if no listeners have been added
   * @since 1.4
   */
  getActionListeners(): ActionListener[] {
    return this.listenerList.getListeners($J.cls(ActionListener));
  }
  /**
   * Adds a <code>PopupMenu</code> listener which will listen to notification
   * messages from the popup portion of the combo box.
   * <p>
   * For all standard look and feels shipped with Java, the popup list
   * portion of combo box is implemented as a <code>JPopupMenu</code>.
   * A custom look and feel may not implement it this way and will
   * therefore not receive the notification.
   *
   * @param l  the <code>PopupMenuListener</code> to add
   * @since 1.4
   */
  addPopupMenuListener(l: PopupMenuListener): void {
    this.listenerList.add($J.cls(PopupMenuListener), l);
  }
  /**
   * Notifies <code>PopupMenuListener</code>s that the popup portion of the
   * combo box will become visible.
   * <p>
   * This method is public but should not be called by anything other than
   * the UI delegate.
   * @see #addPopupMenuListener
   * @since 1.4
   */
  firePopupMenuWillBecomeVisible(): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(PopupMenuListener)) {
        if (e == null) {
          e = new PopupMenuEvent()._PopupMenuEvent(this);
        }
        (listeners[(i + 1) | 0]).popupMenuWillBecomeVisible(e);
      }
    }
  }
  /**
   * Notifies <code>PopupMenuListener</code>s that the popup portion of the
   * combo box has become invisible.
   * <p>
   * This method is public but should not be called by anything other than
   * the UI delegate.
   * @see #addPopupMenuListener
   * @since 1.4
   */
  firePopupMenuWillBecomeInvisible(): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(PopupMenuListener)) {
        if (e == null) {
          e = new PopupMenuEvent()._PopupMenuEvent(this);
        }
        (listeners[(i + 1) | 0]).popupMenuWillBecomeInvisible(e);
      }
    }
  }
  /**
   * Notifies <code>PopupMenuListener</code>s that the popup portion of the
   * combo box has been canceled.
   * <p>
   * This method is public but should not be called by anything other than
   * the UI delegate.
   * @see #addPopupMenuListener
   * @since 1.4
   */
  firePopupMenuCanceled(): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(PopupMenuListener)) {
        if (e == null) {
          e = new PopupMenuEvent()._PopupMenuEvent(this);
        }
        (listeners[(i + 1) | 0]).popupMenuCanceled(e);
      }
    }
  }
  /**
   * Sets the action command that should be included in the event
   * sent to action listeners.
   *
   * @param aCommand  a string containing the "command" that is sent
   *                  to action listeners; the same listener can then
   *                  do different things depending on the command it
   *                  receives
   */
  setActionCommand(aCommand: string): void {
    this.actionCommand = aCommand;
  }
  /**
   * Returns the action command that is included in the event sent to
   * action listeners.
   *
   * @return  the string containing the "command" that is sent
   *          to action listeners.
   */
  getActionCommand(): string {
    return this.actionCommand;
  }
  /**
   * Sets the <code>Action</code> for the <code>ActionEvent</code> source.
   * The new <code>Action</code> replaces any previously set
   * <code>Action</code> but does not affect <code>ActionListeners</code>
   * independently added with <code>addActionListener</code>.
   * If the <code>Action</code> is already a registered
   * <code>ActionListener</code> for the <code>ActionEvent</code> source,
   * it is not re-registered.
   * <p>
   * Setting the <code>Action</code> results in immediately changing
   * all the properties described in <a href="Action.html#buttonActions">
   * Swing Components Supporting <code>Action</code></a>.
   * Subsequently, the combobox's properties are automatically updated
   * as the <code>Action</code>'s properties change.
   * <p>
   * This method uses three other methods to set
   * and help track the <code>Action</code>'s property values.
   * It uses the <code>configurePropertiesFromAction</code> method
   * to immediately change the combobox's properties.
   * To track changes in the <code>Action</code>'s property values,
   * this method registers the <code>PropertyChangeListener</code>
   * returned by <code>createActionPropertyChangeListener</code>. The
   * default {@code PropertyChangeListener} invokes the
   * {@code actionPropertyChanged} method when a property in the
   * {@code Action} changes.
   *
   * @param a the <code>Action</code> for the <code>JComboBox</code>,
   *                  or <code>null</code>.
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
   * <code>ActionEvent</code> source, or <code>null</code> if no
   * <code>Action</code> is set.
   *
   * @return the <code>Action</code> for this <code>ActionEvent</code>
   *          source; or <code>null</code>
   * @since 1.3
   * @see Action
   * @see #setAction
   */
  getAction(): Action {
    return this.action_;
  }
  /**
   * Sets the properties on this combobox to match those in the specified
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
   * Creates and returns a <code>PropertyChangeListener</code> that is
   * responsible for listening for changes from the specified
   * <code>Action</code> and updating the appropriate properties.
   * <p>
   * <b>Warning:</b> If you subclass this do not create an anonymous
   * inner class.  If you do the lifetime of the combobox will be tied to
   * that of the <code>Action</code>.
   *
   * @param a the combobox's action
   * @return the {@code PropertyChangeListener}
   * @since 1.3
   * @see Action
   * @see #setAction
   */
  createActionPropertyChangeListener(a: Action): PropertyChangeListener {
    return $J.fn(new JComboBox$ComboBoxActionPropertyChangeListener()._JComboBox$ComboBoxActionPropertyChangeListener(this, a), 'propertyChange');
  }
  /**
   * Updates the combobox's state in response to property changes in
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
   * @param action the <code>Action</code> associated with this combobox
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
    } else if (Action.SHORT_DESCRIPTION === propertyName) {
      AbstractAction.setToolTipTextFromAction(this, action);
    }
  }
  setActionCommandFromAction(a: Action): void {
    this.setActionCommand((a != null) ? a.getValue$String(Action.ACTION_COMMAND_KEY) : null);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   * @param e  the event of interest
   *
   * @see EventListenerList
   */
  fireItemStateChanged(e: ItemEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ItemListener)) {
        $J.fn((listeners[(i + 1) | 0]), 'itemStateChanged')(e);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   *
   * @see EventListenerList
   */
  fireActionEvent(): void {
    if (!this.firingActionEvent) {
      this.firingActionEvent = true;
      let e = null;
      let listeners = this.listenerList.getListenerList();
      let mostRecentEventTime = EventQueue.getMostRecentEventTime();
      let modifiers = 0;
      let currentEvent = EventQueue.getCurrentEvent();
      if (currentEvent instanceof InputEvent) {
        modifiers = (currentEvent).getModifiers();
      } else if (currentEvent instanceof ActionEvent) {
        modifiers = (currentEvent).getModifiers();
      }
      try {
        for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
          if (listeners[i] === $J.cls(ActionListener)) {
            if (e == null) {
              e = new ActionEvent()._ActionEvent$Object$int$String$long$int(this, ActionEvent.ACTION_PERFORMED, this.getActionCommand(), mostRecentEventTime, modifiers);
            }
            $J.fn((listeners[(i + 1) | 0]), 'actionPerformed')(e);
          }
        }
      } finally {
        this.firingActionEvent = false;
      }
    }
  }
  /**
   * This protected method is implementation specific. Do not access directly
   * or override.
   */
  selectedItemChanged(): void {
    if (this.selectedItemReminder != null) {
      this.fireItemStateChanged(new ItemEvent()._ItemEvent(this, ItemEvent.ITEM_STATE_CHANGED, this.selectedItemReminder, ItemEvent.DESELECTED));
    }
    this.selectedItemReminder = this.dataModel.getSelectedItem();
    if (this.selectedItemReminder != null) {
      this.fireItemStateChanged(new ItemEvent()._ItemEvent(this, ItemEvent.ITEM_STATE_CHANGED, this.selectedItemReminder, ItemEvent.SELECTED));
    }
  }
  /**
   * This method is public as an implementation side effect.
   * do not call or override.
   */
  actionPerformed(e: ActionEvent): void {
    this.setPopupVisible(false);
    this.getModel().setSelectedItem(this.getEditor().getItem());
    let oldCommand = this.getActionCommand();
    this.setActionCommand('comboBoxEdited');
    this.fireActionEvent();
    this.setActionCommand(oldCommand);
  }
  /**
   * This method is public as an implementation side effect.
   * do not call or override.
   */
  contentsChanged(e: ListDataEvent): void {
    let oldSelection = this.selectedItemReminder;
    let newSelection = this.dataModel.getSelectedItem();
    if (oldSelection == null || !$J.equals(oldSelection, newSelection)) {
      this.selectedItemChanged();
      if (!this.selectingItem) {
        this.fireActionEvent();
      }
    }
  }
  /**
   * This method is public as an implementation side effect.
   * do not call or override.
   */
  intervalAdded(e: ListDataEvent): void {
    if (this.selectedItemReminder !== this.dataModel.getSelectedItem()) {
      this.selectedItemChanged();
    }
  }
  /**
   * This method is public as an implementation side effect.
   * do not call or override.
   */
  intervalRemoved(e: ListDataEvent): void {
    this.contentsChanged(e);
  }
  /**
   * Selects the list item that corresponds to the specified keyboard
   * character and returns true, if there is an item corresponding
   * to that character.  Otherwise, returns false.
   *
   * @param keyChar a char, typically this is a keyboard key
   *                  typed by the user
   * @return {@code true} if there is an item corresponding to that character.
   *         Otherwise, returns {@code false}.
   */
  selectWithKeyChar(keyChar: number): boolean {
    let index: number;
    if (this.keySelectionManager == null) {
      this.keySelectionManager = this.createDefaultKeySelectionManager();
    }
    index = this.keySelectionManager.selectionForKey(keyChar, this.getModel());
    if (index !== -1) {
      this.setSelectedIndex(index);
      return true;
    } else {
      return false;
    }
  }
  /**
   * Enables the combo box so that items can be selected. When the
   * combo box is disabled, items cannot be selected and values
   * cannot be typed into its field (if it is editable).
   *
   * @param b a boolean value, where true enables the component and
   *          false disables it
   */
  setEnabled(b: boolean): void {
    super.setEnabled(b);
    this.firePropertyChange$String$boolean$boolean('enabled', !this.isEnabled(), this.isEnabled());
  }
  /**
   * Initializes the editor with the specified item.
   *
   * @param anEditor the <code>ComboBoxEditor</code> that displays
   *                  the list item in the
   *                  combo box field and allows it to be edited
   * @param anItem   the object to display and edit in the field
   */
  configureEditor(anEditor: ComboBoxEditor, anItem: any): void {
    anEditor.setItem(anItem);
  }
  /**
   * Handles <code>KeyEvent</code>s, looking for the Tab key.
   * If the Tab key is found, the popup window is closed.
   *
   * @param e  the <code>KeyEvent</code> containing the keyboard
   *          key that was pressed
   */
  processKeyEvent$KeyEvent(e: KeyEvent): void {
    if (e.getKeyCode() === KeyEvent.VK_TAB) {
      this.hidePopup();
    }
    super.processKeyEvent$KeyEvent(e);
  }
  /**
   * {@inheritDoc}
   */
  processKeyBinding(ks: KeyStroke, e: KeyEvent, condition: number, pressed: boolean): boolean {
    if (super.processKeyBinding(ks, e, condition, pressed)) {
      return true;
    }
    if (!this.isEditable() || condition !== JComponent.WHEN_FOCUSED || this.getEditor() == null || !$J.equals(true, this.getClientProperty('JComboBox.isTableCellEditor'))) {
      return false;
    }
    let editorComponent = this.getEditor().getEditorComponent();
    if (editorComponent instanceof JComponent) {
      let component = editorComponent;
      return component.processKeyBinding(ks, e, JComponent.WHEN_FOCUSED, pressed);
    }
    return false;
  }
  /**
   * Sets the object that translates a keyboard character into a list
   * selection. Typically, the first selection with a matching first
   * character becomes the selected item.
   *
   * @param aManager a key selection manager
   */
  setKeySelectionManager(aManager: JComboBox$KeySelectionManager): void {
    this.keySelectionManager = aManager;
  }
  /**
   * Returns the number of items in the list.
   *
   * @return an integer equal to the number of items in the list
   */
  getItemCount(): number {
    return this.dataModel.getSize();
  }
  /**
   * Returns the list item at the specified index.  If <code>index</code>
   * is out of range (less than zero or greater than or equal to size)
   * it will return <code>null</code>.
   *
   * @param index  an integer indicating the list position, where the first
   *               item starts at zero
   * @return the item at that list position; or
   *                  <code>null</code> if out of range
   */
  getItemAt(index: number): E {
    return this.dataModel.getElementAt(index);
  }
  /**
   * Returns an instance of the default key-selection manager.
   *
   * @return the <code>KeySelectionManager</code> currently used by the list
   * @see #setKeySelectionManager
   */
  createDefaultKeySelectionManager(): JComboBox$KeySelectionManager {
    return new JComboBox$DefaultKeySelectionManager()._JComboBox$DefaultKeySelectionManager();
  }
  /**
   * Returns a string representation of this <code>JComboBox</code>.
   * This method is intended to be used only for debugging purposes,
   * and the content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JComboBox</code>
   */
  paramString(): string {
    let selectedItemReminderString = (this.selectedItemReminder != null ? $J.str(this.selectedItemReminder) : '');
    let isEditableString = (this.isEditable_ ? 'true' : 'false');
    let lightWeightPopupEnabledString = (this.lightWeightPopupEnabled ? 'true' : 'false');
    return super.paramString() + ',isEditable=' + isEditableString + ',lightWeightPopupEnabled=' + lightWeightPopupEnabledString + ',maximumRowCount=' + this.maximumRowCount + ',selectedItemReminder=' + selectedItemReminderString;
  }
  /**
   * Gets the AccessibleContext associated with this JComboBox.
   * For combo boxes, the AccessibleContext takes the form of an
   * AccessibleJComboBox.
   * A new AccessibleJComboBox instance is created if necessary.
   *
   * @return an AccessibleJComboBox that serves as the
   *         AccessibleContext of this JComboBox
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JComboBox$AccessibleJComboBox().$o(this)._JComboBox$AccessibleJComboBox();
    }
    return this.accessibleContext;
  }
}

export class JComboBox$ComboBoxActionPropertyChangeListener extends ActionPropertyChangeListener {
  _JComboBox$ComboBoxActionPropertyChangeListener(b: JComboBox<any>, a: Action): this {
    this._ActionPropertyChangeListener(b, a);
    return this;
  }
  actionPropertyChanged(cb: JComboBox<any>, action: Action, e: PropertyChangeEvent): void {
    if (AbstractAction.shouldReconfigure(e)) {
      cb.configurePropertiesFromAction(action);
    } else {
      cb.actionPropertyChanged(action, e.getPropertyName());
    }
  }
}

/**
 * The interface that defines a <code>KeySelectionManager</code>.
 * To qualify as a <code>KeySelectionManager</code>,
 * the class needs to implement the method
 * that identifies the list index given a character and the
 * combo box data model.
 */
export class JComboBox$KeySelectionManager {
}

export class JComboBox$DefaultKeySelectionManager extends JObject {
  _JComboBox$DefaultKeySelectionManager(): this {
    return this;
  }
  selectionForKey(aKey: number, aModel: ComboBoxModel<any>): number {
    let i: number;
    let c: number;
    let currentSelection = -1;
    let selectedItem = aModel.getSelectedItem();
    let v: string;
    let pattern: string;
    if (selectedItem != null) {
      for (i = 0, c = aModel.getSize(); i < c; i++) {
        if (selectedItem === aModel.getElementAt(i)) {
          currentSelection = i;
          break;
        }
      }
    }
    pattern = ('' + String.fromCharCode(aKey)).toLowerCase();
    aKey = pattern.charCodeAt(0);
    for (i = ++currentSelection, c = aModel.getSize(); i < c; i++) {
      let elem = aModel.getElementAt(i);
      if (elem != null && $J.str(elem) != null) {
        v = $J.str(elem).toLowerCase();
        if (v.length > 0 && v.charCodeAt(0) === aKey) {
          return i;
        }
      }
    }
    for (i = 0; i < currentSelection; i++) {
      let elem = aModel.getElementAt(i);
      if (elem != null && $J.str(elem) != null) {
        v = $J.str(elem).toLowerCase();
        if (v.length > 0 && v.charCodeAt(0) === aKey) {
          return i;
        }
      }
    }
    return -1;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JComboBox</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to Combo Box user-interface elements.
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
export class JComboBox$AccessibleJComboBox extends JComponent$AccessibleJComponent {
  popupList: JList<any> = null;
  previousSelectedAccessible: Accessible = null;
  editorAccessibleContext: JComboBox$AccessibleJComboBox$EditorAccessibleContext = null;
  /**
   * Returns an AccessibleJComboBox instance
   * @since 1.4
   */
  _JComboBox$AccessibleJComboBox(): this {
    this._JComponent$AccessibleJComponent();
    this.previousSelectedAccessible = null;
    this.editorAccessibleContext = null;
    this.$outer.addPropertyChangeListener$PropertyChangeListener($J.fn(new JComboBox$AccessibleJComboBox$AccessibleJComboBoxPropertyChangeListener().$o(this)._JComboBox$AccessibleJComboBox$AccessibleJComboBoxPropertyChangeListener(), 'propertyChange'));
    this.setEditorNameAndDescription();
    let a = this.$outer.getUI().getAccessibleChild(this.$outer, 0);
    if ($J.isa(a, ComboPopup)) {
      this.popupList = (a).getList();
      this.popupList.addListSelectionListener($J.fn(new JComboBox$AccessibleJComboBox$AccessibleJComboBoxListSelectionListener().$o(this)._JComboBox$AccessibleJComboBox$AccessibleJComboBoxListSelectionListener(), 'valueChanged'));
    }
    this.$outer.addPopupMenuListener(new JComboBox$AccessibleJComboBox$AccessibleJComboBoxPopupMenuListener().$o(this)._JComboBox$AccessibleJComboBox$AccessibleJComboBoxPopupMenuListener());
    return this;
  }
  setEditorNameAndDescription(): void {
    let editor = this.$outer.getEditor();
    if (editor != null) {
      let comp = editor.getEditorComponent();
      if ($J.isa(comp, Accessible)) {
        let ac = comp.getAccessibleContext();
        if (ac != null) {
          ac.setAccessibleName(this.getAccessibleName());
          ac.setAccessibleDescription(this.getAccessibleDescription());
        }
      }
    }
  }
  /**
   * Returns the number of accessible children in the object.  If all
   * of the children of this object implement Accessible, than this
   * method should return the number of children of this object.
   *
   * @return the number of accessible children in the object.
   */
  getAccessibleChildrenCount(): number {
    if (this.$outer.ui != null) {
      return this.$outer.ui.getAccessibleChildrenCount(this.$outer);
    } else {
      return super.getAccessibleChildrenCount();
    }
  }
  /**
   * Returns the nth Accessible child of the object.
   * The child at index zero represents the popup.
   * If the combo box is editable, the child at index one
   * represents the editor.
   *
   * @param i zero-based index of child
   * @return the nth Accessible child of the object
   */
  getAccessibleChild(i: number): Accessible {
    if (this.$outer.ui != null) {
      return this.$outer.ui.getAccessibleChild(this.$outer, i);
    } else {
      return super.getAccessibleChild(i);
    }
  }
  /**
   * Get the AccessibleSelection associated with this object.  In the
   * implementation of the Java Accessibility API for this class,
   * return this object, which is responsible for implementing the
   * AccessibleSelection interface on behalf of itself.
   *
   * @return this object
   */
  getAccessibleSelection$(): AccessibleSelection {
    return this;
  }
  /**
   * Returns an Accessible representing the specified selected child
   * in the popup.  If there isn't a selection, or there are
   * fewer children selected than the integer passed in, the return
   * value will be null.
   * <p>Note that the index represents the i-th selected child, which
   * is different from the i-th child.
   *
   * @param i the zero-based index of selected children
   * @return the i-th selected child
   * @see #getAccessibleSelectionCount
   * @since 1.3
   */
  getAccessibleSelection$int(i: number): Accessible {
    let a = this.$outer.getUI().getAccessibleChild(this.$outer, 0);
    var popup;
    if ($J.isa((popup = a), ComboPopup)) {
      let list = popup.getList();
      let ac = list.getAccessibleContext();
      if (ac != null) {
        let as$ = ac.getAccessibleSelection$();
        if (as$ != null) {
          return as$.getAccessibleSelection$int(i);
        }
      }
    }
    return null;
  }
  /**
   * Determines if the current child of this object is selected.
   *
   * @return true if the current child of this object is selected;
   *              else false
   * @param i the zero-based index of the child in this Accessible
   * object.
   * @see AccessibleContext#getAccessibleChild
   * @since 1.3
   */
  isAccessibleChildSelected(i: number): boolean {
    return this.$outer.getSelectedIndex() === i;
  }
}

export class JComboBox$AccessibleJComboBox$AccessibleJComboBoxPropertyChangeListener extends JObject {
  _JComboBox$AccessibleJComboBox$AccessibleJComboBoxPropertyChangeListener(): this {
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    if (e.getPropertyName() === 'editor') {
      this.$outer.setEditorNameAndDescription();
    }
  }
}

export class JComboBox$AccessibleJComboBox$AccessibleJComboBoxPopupMenuListener extends JObject {
  _JComboBox$AccessibleJComboBox$AccessibleJComboBoxPopupMenuListener(): this {
    return this;
  }
  /**
   * This method is called before the popup menu becomes visible
   */
  popupMenuWillBecomeVisible(e: PopupMenuEvent): void {
    if (this.$outer.popupList == null) {
      return;
    }
    let selectedIndex = this.$outer.popupList.getSelectedIndex();
    if (selectedIndex < 0) {
      return;
    }
    this.$outer.previousSelectedAccessible = this.$outer.popupList.getAccessibleContext().getAccessibleChild(selectedIndex);
  }
  /**
   * This method is called before the popup menu becomes invisible
   * Note that a JPopupMenu can become invisible any time
   */
  popupMenuWillBecomeInvisible(e: PopupMenuEvent): void {
  }
  /**
   * This method is called when the popup menu is canceled
   */
  popupMenuCanceled(e: PopupMenuEvent): void {
  }
}

export class JComboBox$AccessibleJComboBox$AccessibleJComboBoxListSelectionListener extends JObject {
  _JComboBox$AccessibleJComboBox$AccessibleJComboBoxListSelectionListener(): this {
    return this;
  }
  valueChanged(e: ListSelectionEvent): void {
    if (this.$outer.popupList == null) {
      return;
    }
    let selectedIndex = this.$outer.popupList.getSelectedIndex();
    if (selectedIndex < 0) {
      return;
    }
    let selectedAccessible = this.$outer.popupList.getAccessibleContext().getAccessibleChild(selectedIndex);
    if (selectedAccessible == null) {
      return;
    }
    let pce: PropertyChangeEvent;
    if (this.$outer.previousSelectedAccessible != null) {
      pce = new PropertyChangeEvent()._PropertyChangeEvent(this.$outer.previousSelectedAccessible, AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.FOCUSED, null);
      this.$outer.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, pce);
    }
    pce = new PropertyChangeEvent()._PropertyChangeEvent(selectedAccessible, AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.FOCUSED);
    this.$outer.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, pce);
    this.$outer.firePropertyChange(AccessibleContext.ACCESSIBLE_ACTIVE_DESCENDANT_PROPERTY, this.$outer.previousSelectedAccessible, selectedAccessible);
    this.$outer.previousSelectedAccessible = selectedAccessible;
  }
}

let $JComboBox$1: any = null;
/** An anonymous class (JComboBox.java:277). */
function JComboBox$1(): any {
  return $JComboBox$1 ??= $J.local(class extends JObject {
    ancestorAdded(event: AncestorEvent): void {
      this.$outer.hidePopup();
    }
    ancestorRemoved(event: AncestorEvent): void {
      this.$outer.hidePopup();
    }
    ancestorMoved(event: AncestorEvent): void {
      if (event.getSource() !== this.$outer) {
        this.$outer.hidePopup();
      }
    }
  }, 'javax.swing.JComboBox$1', ['javax.swing.event.AncestorListener']);
}

$J.define(JComboBox, 'javax.swing.JComboBox', { kind: 'class', ifaces: ['java.awt.ItemSelectable', 'javax.swing.event.ListDataListener', 'java.awt.event.ActionListener', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { '': '_JComboBox$', 'java.util.Vector': '_JComboBox$Vector', 'java.lang.Object[]': '_JComboBox$ObjectArr', 'javax.swing.ComboBoxModel': '_JComboBox$ComboBoxModel' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JComboBox', 'processKeyEvent(java.awt.event.KeyEvent)': 'processKeyEvent$KeyEvent', 'setUI(javax.swing.plaf.ComboBoxUI)': 'setUI$ComboBoxUI' } });
$J.define(JComboBox$ComboBoxActionPropertyChangeListener, 'javax.swing.JComboBox$ComboBoxActionPropertyChangeListener', { kind: 'class', sup: 'javax.swing.ActionPropertyChangeListener', ctors: { 'javax.swing.JComboBox,javax.swing.Action': '_JComboBox$ComboBoxActionPropertyChangeListener' } });
$J.define(JComboBox$KeySelectionManager, 'javax.swing.JComboBox$KeySelectionManager', { kind: 'interface' });
$J.define(JComboBox$DefaultKeySelectionManager, 'javax.swing.JComboBox$DefaultKeySelectionManager', { kind: 'class', ifaces: ['javax.swing.JComboBox$KeySelectionManager', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JComboBox$DefaultKeySelectionManager' } });
$J.define(JComboBox$AccessibleJComboBox, 'javax.swing.JComboBox$AccessibleJComboBox', { kind: 'class', ifaces: ['javax.accessibility.AccessibleAction', 'javax.accessibility.AccessibleSelection'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JComboBox$AccessibleJComboBox' }, meths: { 'getAccessibleSelection(int)': 'getAccessibleSelection$int', 'getAccessibleSelection()': 'getAccessibleSelection$', 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.define(JComboBox$AccessibleJComboBox$AccessibleJComboBoxPropertyChangeListener, 'javax.swing.JComboBox$AccessibleJComboBox$AccessibleJComboBoxPropertyChangeListener', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_JComboBox$AccessibleJComboBox$AccessibleJComboBoxPropertyChangeListener' }, inner: true });
$J.define(JComboBox$AccessibleJComboBox$AccessibleJComboBoxPopupMenuListener, 'javax.swing.JComboBox$AccessibleJComboBox$AccessibleJComboBoxPopupMenuListener', { kind: 'class', ifaces: ['javax.swing.event.PopupMenuListener'], sup: 'java.lang.Object', ctors: { '': '_JComboBox$AccessibleJComboBox$AccessibleJComboBoxPopupMenuListener' }, inner: true });
$J.define(JComboBox$AccessibleJComboBox$AccessibleJComboBoxListSelectionListener, 'javax.swing.JComboBox$AccessibleJComboBox$AccessibleJComboBoxListSelectionListener', { kind: 'class', ifaces: ['javax.swing.event.ListSelectionListener'], sup: 'java.lang.Object', ctors: { '': '_JComboBox$AccessibleJComboBox$AccessibleJComboBoxListSelectionListener' }, inner: true });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  EventQueue = $J.load('java.awt.EventQueue');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  ActionListener = $J.load('java.awt.event.ActionListener');
  InputEvent = $J.load('java.awt.event.InputEvent');
  ItemEvent = $J.load('java.awt.event.ItemEvent');
  ItemListener = $J.load('java.awt.event.ItemListener');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  PropertyChangeEvent = $J.load('java.beans.PropertyChangeEvent');
  Accessible = $J.load('javax.accessibility.Accessible');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  Action = $J.load('javax.swing.Action');
  DefaultComboBoxModel = $J.load('javax.swing.DefaultComboBoxModel');
  JPopupMenu = $J.load('javax.swing.JPopupMenu');
  MutableComboBoxModel = $J.load('javax.swing.MutableComboBoxModel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  PopupMenuEvent = $J.load('javax.swing.event.PopupMenuEvent');
  PopupMenuListener = $J.load('javax.swing.event.PopupMenuListener');
  ComboPopup = $J.load('javax.swing.plaf.basic.ComboPopup');
});
