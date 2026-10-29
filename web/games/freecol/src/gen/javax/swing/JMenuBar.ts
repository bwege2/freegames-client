// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JMenuBar.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, SunToolkit, Toolkit } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let Accessible, DefaultSingleSelectionModel, JMenu, JPopupMenu, KeyboardManager, MenuElement, UIManager;

/**
 * An implementation of a menu bar. You add <code>JMenu</code> objects to the
 * menu bar to construct a menu. When the user selects a <code>JMenu</code>
 * object, its associated <code>JPopupMenu</code> is displayed, allowing the
 * user to select one of the <code>JMenuItems</code> on it.
 * <p>
 * For information and examples of using menu bars see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/menu.html">How to Use Menus</a>,
 * a section in <em>The Java Tutorial.</em>
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
 * <p>
 * <strong>Warning:</strong>
 * By default, pressing the Tab key does not transfer focus from a <code>
 * JMenuBar</code> which is added to a container together with other Swing
 * components, because the <code>focusTraversalKeysEnabled</code> property
 * of <code>JMenuBar</code> is set to <code>false</code>. To resolve this,
 * you should call the <code>JMenuBar.setFocusTraversalKeysEnabled(true)</code>
 * method.
 *
 * @author Georges Saab
 * @author David Karlton
 * @author Arnaud Weber
 * @see JMenu
 * @see JPopupMenu
 * @see JMenuItem
 * @since 1.2
 */
export class JMenuBar extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'MenuBarUI';
  selectionModel: SingleSelectionModel = null;
  paintBorder_: boolean = false;
  margin: Insets = null;
  static readonly TRACE: boolean = false;
  static readonly VERBOSE: boolean = false;
  static readonly DEBUG: boolean = false;
  /**
   * Creates a new menu bar.
   */
  _JMenuBar(): this {
    this._JComponent();
    this.paintBorder_ = true;
    this.margin = null;
    this.setFocusTraversalKeysEnabled(false);
    this.setSelectionModel(new DefaultSingleSelectionModel()._DefaultSingleSelectionModel());
    this.updateUI();
    return this;
  }
  /**
   * Sets the L&amp;F object that renders this component.
   *
   * @param ui the new MenuBarUI L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$MenuBarUI(ui: MenuBarUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Resets the UI property with a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    let tk = Toolkit.getDefaultToolkit();
    if ($J.isa(tk, SunToolkit)) {
      (tk).updateScreenMenuBarUI();
    }
    this.setUI$MenuBarUI(UIManager.getUI(this));
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "MenuBarUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JMenuBar.uiClassID;
  }
  /**
   * Returns the model object that handles single selections.
   *
   * @return the <code>SingleSelectionModel</code> property
   * @see SingleSelectionModel
   */
  getSelectionModel(): SingleSelectionModel {
    return this.selectionModel;
  }
  /**
   * Sets the model object to handle single selections.
   *
   * @param model the <code>SingleSelectionModel</code> to use
   * @see SingleSelectionModel
   */
  setSelectionModel(model: SingleSelectionModel): void {
    let oldValue = this.selectionModel;
    this.selectionModel = model;
    this.firePropertyChange$String$Object$Object('selectionModel', oldValue, this.selectionModel);
  }
  /**
   * Appends the specified menu to the end of the menu bar.
   *
   * @param c the <code>JMenu</code> component to add
   * @return the menu component
   */
  add$JMenu(c: JMenu): JMenu {
    super.add$Component(c);
    return c;
  }
  /**
   * Returns the menu at the specified position in the menu bar.
   *
   * @param index  an integer giving the position in the menu bar, where
   *               0 is the first position
   * @return the <code>JMenu</code> at that position, or <code>null</code> if
   *          if there is no <code>JMenu</code> at that position (ie. if
   *          it is a <code>JMenuItem</code>)
   */
  getMenu(index: number): JMenu {
    let c = this.getComponentAtIndex(index);
    if (c instanceof JMenu) {
      return c;
    }
    return null;
  }
  /**
   * Returns the number of items in the menu bar.
   *
   * @return the number of items in the menu bar
   */
  getMenuCount(): number {
    return this.getComponentCount();
  }
  /**
   * Returns the component at the specified index.
   *
   * @param i an integer specifying the position, where 0 is first
   * @return the <code>Component</code> at the position,
   *          or <code>null</code> for an invalid index
   * @deprecated replaced by <code>getComponent(int i)</code>
   */
  getComponentAtIndex(i: number): Component {
    if (i < 0 || i >= this.getComponentCount()) {
      return null;
    }
    return this.getComponent$int(i);
  }
  /**
   * Returns true if the menu bar currently has a component selected.
   *
   * @return true if a selection has been made, else false
   */
  isSelected(): boolean {
    return this.selectionModel.isSelected();
  }
  /**
   * Returns true if the menu bars border should be painted.
   *
   * @return  true if the border should be painted, else false
   */
  isBorderPainted(): boolean {
    return this.paintBorder_;
  }
  /**
   * Sets whether the border should be painted.
   *
   * @param b if true and border property is not <code>null</code>,
   *          the border is painted.
   * @see #isBorderPainted
   */
  setBorderPainted(b: boolean): void {
    let oldValue = this.paintBorder_;
    this.paintBorder_ = b;
    this.firePropertyChange$String$boolean$boolean('borderPainted', oldValue, this.paintBorder_);
    if (b !== oldValue) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Paints the menubar's border if <code>BorderPainted</code>
   * property is true.
   *
   * @param g the <code>Graphics</code> context to use for painting
   * @see JComponent#paint
   * @see JComponent#setBorder
   */
  paintBorder(g: Graphics): void {
    if (this.isBorderPainted()) {
      super.paintBorder(g);
    }
  }
  /**
   * Implemented to be a <code>MenuElement</code> -- does nothing.
   *
   * @see #getSubElements
   */
  processMouseEvent$MouseEvent$MenuElementArr$MenuSelectionManager(event: MouseEvent, path: MenuElement[], manager: MenuSelectionManager): void {
  }
  /**
   * Implemented to be a <code>MenuElement</code> -- does nothing.
   *
   * @see #getSubElements
   */
  processKeyEvent$KeyEvent$MenuElementArr$MenuSelectionManager(e: KeyEvent, path: MenuElement[], manager: MenuSelectionManager): void {
  }
  /**
   * Implemented to be a <code>MenuElement</code> -- does nothing.
   *
   * @see #getSubElements
   */
  menuSelectionChanged(isIncluded: boolean): void {
  }
  /**
   * Implemented to be a <code>MenuElement</code> -- returns the
   * menus in this menu bar.
   * This is the reason for implementing the <code>MenuElement</code>
   * interface -- so that the menu bar can be treated the same as
   * other menu elements.
   * @return an array of menu items in the menu bar.
   */
  getSubElements(): MenuElement[] {
    let result: MenuElement[];
    let tmp = new ArrayList();
    let c = this.getComponentCount();
    let i: number;
    let m: Component;
    for (i = 0; i < c; i++) {
      m = this.getComponent$int(i);
      if ($J.isa(m, MenuElement)) {
        tmp.add(m);
      }
    }
    result = $J.newArray(tmp.size(), null);
    for (i = 0, c = tmp.size(); i < c; i++) {
      result[i] = tmp.get(i);
    }
    return result;
  }
  /**
   * Implemented to be a <code>MenuElement</code>. Returns this object.
   *
   * @return the current <code>Component</code> (this)
   * @see #getSubElements
   */
  getComponent$(): Component {
    return this;
  }
  /**
   * Returns a string representation of this <code>JMenuBar</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JMenuBar</code>
   */
  paramString(): string {
    let paintBorderString = (this.paintBorder_ ? 'true' : 'false');
    let marginString = (this.margin != null ? this.margin.toString() : '');
    return super.paramString() + ',margin=' + marginString + ',paintBorder=' + paintBorderString;
  }
  /**
   * Gets the AccessibleContext associated with this JMenuBar.
   * For JMenuBars, the AccessibleContext takes the form of an
   * AccessibleJMenuBar.
   * A new AccessibleJMenuBar instance is created if necessary.
   *
   * @return an AccessibleJMenuBar that serves as the
   *         AccessibleContext of this JMenuBar
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JMenuBar$AccessibleJMenuBar().$o(this)._JMenuBar$AccessibleJMenuBar();
    }
    return this.accessibleContext;
  }
  /**
   * Subclassed to check all the child menus.
   * @since 1.3
   */
  processKeyBinding(ks: KeyStroke, e: KeyEvent, condition: number, pressed: boolean): boolean {
    let retValue = super.processKeyBinding(ks, e, condition, pressed);
    if (!retValue) {
      let subElements = this.getSubElements();
      for (let subElement of subElements) {
        if (JMenuBar.processBindingForKeyStrokeRecursive(subElement, ks, e, condition, pressed)) {
          return true;
        }
      }
    }
    return retValue;
  }
  static processBindingForKeyStrokeRecursive(elem: MenuElement, ks: KeyStroke, e: KeyEvent, condition: number, pressed: boolean): boolean {
    if (elem == null) {
      return false;
    }
    let c = elem.getComponent$();
    if (!(c.isVisible$() || (c instanceof JPopupMenu)) || !c.isEnabled()) {
      return false;
    }
    var jc;
    if ((jc = c) instanceof JComponent && jc.processKeyBinding(ks, e, condition, pressed)) {
      return true;
    }
    let subElements = elem.getSubElements();
    for (let subElement of subElements) {
      if (JMenuBar.processBindingForKeyStrokeRecursive(subElement, ks, e, condition, pressed)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Overrides <code>JComponent.addNotify</code> to register this
   * menu bar with the current keyboard manager.
   */
  addNotify(): void {
    super.addNotify();
    KeyboardManager.getCurrentManager().registerMenuBar(this);
  }
  /**
   * Overrides <code>JComponent.removeNotify</code> to unregister this
   * menu bar with the current keyboard manager.
   */
  removeNotify(): void {
    super.removeNotify();
    KeyboardManager.getCurrentManager().unregisterMenuBar(this);
  }
}

/**
 * This class implements accessibility support for the
 * <code>JMenuBar</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to menu bar user-interface
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
export class JMenuBar$AccessibleJMenuBar extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJMenuBar}.
   */
  _JMenuBar$AccessibleJMenuBar(): this {
    this._JComponent$AccessibleJComponent();
    return this;
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
   * Returns the currently selected menu if one is selected,
   * otherwise null.
   */
  getAccessibleSelection$int(i: number): Accessible {
    if (this.$outer.isSelected()) {
      if (i !== 0) {
        return null;
      }
      let j = this.$outer.getSelectionModel().getSelectedIndex();
      if ($J.isa(this.$outer.getComponentAtIndex(j), Accessible)) {
        return this.$outer.getComponentAtIndex(j);
      }
    }
    return null;
  }
  /**
   * Returns true if the current child of this object is selected.
   *
   * @param i the zero-based index of the child in this Accessible
   * object.
   * @see AccessibleContext#getAccessibleChild
   */
  isAccessibleChildSelected(i: number): boolean {
    return (i === this.$outer.getSelectionModel().getSelectedIndex());
  }
}

$J.define(JMenuBar, 'javax.swing.JMenuBar', { kind: 'class', ifaces: ['javax.accessibility.Accessible', 'javax.swing.MenuElement'], sup: 'javax.swing.JComponent', ctors: { '': '_JMenuBar' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JMenuBar', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JMenuBar', 'getComponent()': 'getComponent$', 'processKeyEvent(java.awt.event.KeyEvent,javax.swing.MenuElement[],javax.swing.MenuSelectionManager)': 'processKeyEvent$KeyEvent$MenuElementArr$MenuSelectionManager', 'processMouseEvent(java.awt.event.MouseEvent,javax.swing.MenuElement[],javax.swing.MenuSelectionManager)': 'processMouseEvent$MouseEvent$MenuElementArr$MenuSelectionManager', 'add(javax.swing.JMenu)': 'add$JMenu', 'setUI(javax.swing.plaf.MenuBarUI)': 'setUI$MenuBarUI' } });
$J.define(JMenuBar$AccessibleJMenuBar, 'javax.swing.JMenuBar$AccessibleJMenuBar', { kind: 'class', ifaces: ['javax.accessibility.AccessibleSelection'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JMenuBar$AccessibleJMenuBar' }, meths: { 'getAccessibleSelection(int)': 'getAccessibleSelection$int', 'getAccessibleSelection()': 'getAccessibleSelection$', 'getAccessibleRole()': 'getAccessibleRole$', 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
$J.module(() => {
  Accessible = $J.load('javax.accessibility.Accessible');
  DefaultSingleSelectionModel = $J.load('javax.swing.DefaultSingleSelectionModel');
  JMenu = $J.load('javax.swing.JMenu');
  JPopupMenu = $J.load('javax.swing.JPopupMenu');
  KeyboardManager = $J.load('javax.swing.KeyboardManager');
  MenuElement = $J.load('javax.swing.MenuElement');
  UIManager = $J.load('javax.swing.UIManager');
});
