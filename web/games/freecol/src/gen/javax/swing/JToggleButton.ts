// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JToggleButton.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../jre/index.ts';
import { AbstractButton } from './AbstractButton.ts';
import { DefaultButtonModel } from './DefaultButtonModel.ts';
import { AbstractButton$AccessibleAbstractButton } from './AbstractButton.ts';

let EventQueue, ActionEvent, FocusEvent$Cause, InputEvent, ItemEvent, AccessibleContext, AccessibleState, UIManager;

/**
 * An implementation of a two-state button.
 * The <code>JRadioButton</code> and <code>JCheckBox</code> classes
 * are subclasses of this class.
 * For information on using them see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/button.html">How to Use Buttons, Check Boxes, and Radio Buttons</a>,
 * a section in <em>The Java Tutorial</em>.
 * <p>
 * Buttons can be configured, and to some degree controlled, by
 * <code><a href="Action.html">Action</a></code>s.  Using an
 * <code>Action</code> with a button has many benefits beyond directly
 * configuring a button.  Refer to <a href="Action.html#buttonActions">
 * Swing Components Supporting <code>Action</code></a> for more
 * details, and you can find more information in <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/misc/action.html">How
 * to Use Actions</a>, a section in <em>The Java Tutorial</em>.
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
 * @see JRadioButton
 * @see JCheckBox
 * @author Jeff Dinkins
 * @since 1.2
 */
export class JToggleButton extends AbstractButton {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'ToggleButtonUI';
  /**
   * Creates an initially unselected toggle button
   * without setting the text or image.
   */
  _JToggleButton$(): this {
    this._JToggleButton$String$Icon$boolean(null, null, false);
    return this;
  }
  /**
   * Creates an initially unselected toggle button
   * with the specified image but no text.
   *
   * @param icon  the image that the button should display
   */
  _JToggleButton$Icon(icon: Icon): this {
    this._JToggleButton$String$Icon$boolean(null, icon, false);
    return this;
  }
  /**
   * Creates a toggle button with the specified image
   * and selection state, but no text.
   *
   * @param icon  the image that the button should display
   * @param selected  if true, the button is initially selected;
   *                  otherwise, the button is initially unselected
   */
  _JToggleButton$Icon$boolean(icon: Icon, selected: boolean): this {
    this._JToggleButton$String$Icon$boolean(null, icon, selected);
    return this;
  }
  /**
   * Creates an unselected toggle button with the specified text.
   *
   * @param text  the string displayed on the toggle button
   */
  _JToggleButton$String(text: string): this {
    this._JToggleButton$String$Icon$boolean(text, null, false);
    return this;
  }
  /**
   * Creates a toggle button with the specified text
   * and selection state.
   *
   * @param text  the string displayed on the toggle button
   * @param selected  if true, the button is initially selected;
   *                  otherwise, the button is initially unselected
   */
  _JToggleButton$String$boolean(text: string, selected: boolean): this {
    this._JToggleButton$String$Icon$boolean(text, null, selected);
    return this;
  }
  /**
   * Creates a toggle button where properties are taken from the
   * Action supplied.
   *
   * @param a an instance of an {@code Action}
   * @since 1.3
   */
  _JToggleButton$Action(a: Action): this {
    this._JToggleButton$();
    this.setAction(a);
    return this;
  }
  /**
   * Creates a toggle button that has the specified text and image,
   * and that is initially unselected.
   *
   * @param text the string displayed on the button
   * @param icon  the image that the button should display
   */
  _JToggleButton$String$Icon(text: string, icon: Icon): this {
    this._JToggleButton$String$Icon$boolean(text, icon, false);
    return this;
  }
  /**
   * Creates a toggle button with the specified text, image, and
   * selection state.
   *
   * @param text the text of the toggle button
   * @param icon  the image that the button should display
   * @param selected  if true, the button is initially selected;
   *                  otherwise, the button is initially unselected
   */
  _JToggleButton$String$Icon$boolean(text: string, icon: Icon, selected: boolean): this {
    this._AbstractButton();
    this.setModel(new JToggleButton$ToggleButtonModel()._JToggleButton$ToggleButtonModel());
    this.model.setSelected(selected);
    this.init(text, icon);
    return this;
  }
  /**
   * Resets the UI property to a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$ButtonUI(UIManager.getUI(this));
  }
  /**
   * Returns a string that specifies the name of the l&amp;f class
   * that renders this component.
   *
   * @return the string "ToggleButtonUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JToggleButton.uiClassID;
  }
  /**
   * Overridden to return true, JToggleButton supports
   * the selected state.
   */
  shouldUpdateSelectedStateFromAction(): boolean {
    return true;
  }
  getGroupSelection(cause: FocusEvent$Cause): JToggleButton {
    {
      let model: ButtonModel, selection: JToggleButton;
      switch (cause) {
        case FocusEvent$Cause.ACTIVATION:
        case FocusEvent$Cause.TRAVERSAL:
        case FocusEvent$Cause.TRAVERSAL_UP:
        case FocusEvent$Cause.TRAVERSAL_DOWN:
        case FocusEvent$Cause.TRAVERSAL_FORWARD:
        case FocusEvent$Cause.TRAVERSAL_BACKWARD:
          model = this.getModel();
          selection = this;
          if (model != null) {
            let group = model.getGroup();
            if (group != null && group.getSelection() != null && !group.isSelected(model)) {
              let iterator = group.getElements().asIterator();
              while (iterator.hasNext()) {
                let member = iterator.next();
                if (group.isSelected(member.getModel())) {
                  if (member instanceof JToggleButton && member.isVisible$() && member.isDisplayable() && member.isEnabled() && member.isFocusable()) {
                    selection = member;
                  }
                  break;
                }
              }
            }
          }
          return selection;
        default:
          return this;
      }
    }
  }
  /**
   * If this toggle button is a member of the {@link ButtonGroup} which has
   * another toggle button which is selected and can be the focus owner,
   * and the focus cause argument denotes window activation or focus
   * traversal action of any direction the result of the method execution
   * is the same as calling
   * {@link Component#requestFocus(FocusEvent.Cause)} on the toggle button
   * selected in the group.
   * In all other cases the result of the method is the same as calling
   * {@link Component#requestFocus(FocusEvent.Cause)} on this toggle button.
   *
   * @param  cause the cause why the focus is requested
   * @see ButtonGroup
   * @see Component#requestFocus(FocusEvent.Cause)
   * @see FocusEvent.Cause
   *
   * @since 9
   */
  requestFocus$Cause(cause: FocusEvent$Cause): void {
    this.getGroupSelection(cause).requestFocusUnconditionally(cause);
  }
  requestFocusUnconditionally(cause: FocusEvent$Cause): void {
    super.requestFocus$Cause(cause);
  }
  /**
   * If this toggle button is a member of the {@link ButtonGroup} which has
   * another toggle button which is selected and can be the focus owner,
   * and the focus cause argument denotes window activation or focus
   * traversal action of any direction the result of the method execution
   * is the same as calling
   * {@link Component#requestFocusInWindow(FocusEvent.Cause)} on the toggle
   * button selected in the group.
   * In all other cases the result of the method is the same as calling
   * {@link Component#requestFocusInWindow(FocusEvent.Cause)} on this toggle
   * button.
   *
   * @param  cause the cause why the focus is requested
   * @see ButtonGroup
   * @see Component#requestFocusInWindow(FocusEvent.Cause)
   * @see FocusEvent.Cause
   *
   * @since 9
   */
  requestFocusInWindow$Cause(cause: FocusEvent$Cause): boolean {
    return this.getGroupSelection(cause).requestFocusInWindowUnconditionally(cause);
  }
  requestFocusInWindowUnconditionally(cause: FocusEvent$Cause): boolean {
    return super.requestFocusInWindow$Cause(cause);
  }
  /**
   * Returns a string representation of this JToggleButton. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this JToggleButton.
   */
  paramString(): string {
    return super.paramString();
  }
  /**
   * Gets the AccessibleContext associated with this JToggleButton.
   * For toggle buttons, the AccessibleContext takes the form of an
   * AccessibleJToggleButton.
   * A new AccessibleJToggleButton instance is created if necessary.
   *
   * @return an AccessibleJToggleButton that serves as the
   *         AccessibleContext of this JToggleButton
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JToggleButton$AccessibleJToggleButton().$o(this)._JToggleButton$AccessibleJToggleButton();
    }
    return this.accessibleContext;
  }
}

/**
 * The ToggleButton model
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
export class JToggleButton$ToggleButtonModel extends DefaultButtonModel {
  /**
   * Creates a new ToggleButton Model
   */
  _JToggleButton$ToggleButtonModel(): this {
    this._DefaultButtonModel();
    return this;
  }
  /**
   * Checks if the button is selected.
   */
  isSelected(): boolean {
    return (this.stateMask & DefaultButtonModel.SELECTED) !== 0;
  }
  /**
   * Sets the selected state of the button.
   * @param b true selects the toggle button,
   *          false deselects the toggle button.
   */
  setSelected(b: boolean): void {
    let group = this.getGroup();
    if (group != null) {
      group.setSelected(this, b);
      b = group.isSelected(this);
    }
    if (this.isSelected() === b) {
      return;
    }
    if (b) {
      this.stateMask |= DefaultButtonModel.SELECTED;
    } else {
      this.stateMask &= ~DefaultButtonModel.SELECTED;
    }
    this.fireStateChanged();
    this.fireItemStateChanged(new ItemEvent()._ItemEvent(this, ItemEvent.ITEM_STATE_CHANGED, this, this.isSelected() ? ItemEvent.SELECTED : ItemEvent.DESELECTED));
  }
  /**
   * Sets the pressed state of the toggle button.
   */
  setPressed(b: boolean): void {
    if ((this.isPressed() === b) || !this.isEnabled()) {
      return;
    }
    if (b === false && this.isArmed()) {
      this.setSelected(!this.isSelected());
    }
    if (b) {
      this.stateMask |= DefaultButtonModel.PRESSED;
    } else {
      this.stateMask &= ~DefaultButtonModel.PRESSED;
    }
    this.fireStateChanged();
    if (!this.isPressed() && this.isArmed()) {
      let modifiers = 0;
      let currentEvent = EventQueue.getCurrentEvent();
      if (currentEvent instanceof InputEvent) {
        modifiers = (currentEvent).getModifiers();
      } else if (currentEvent instanceof ActionEvent) {
        modifiers = (currentEvent).getModifiers();
      }
      this.fireActionPerformed(new ActionEvent()._ActionEvent$Object$int$String$long$int(this, ActionEvent.ACTION_PERFORMED, this.getActionCommand(), EventQueue.getMostRecentEventTime(), modifiers));
    }
  }
}

/**
 * This class implements accessibility support for the
 * <code>JToggleButton</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to toggle button user-interface
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
export class JToggleButton$AccessibleJToggleButton extends AbstractButton$AccessibleAbstractButton {
  /**
   * Constructs {@code AccessibleJToggleButton}
   */
  _JToggleButton$AccessibleJToggleButton(): this {
    this._AbstractButton$AccessibleAbstractButton();
    this.$outer.addItemListener($J.fn(this, 'itemStateChanged'));
    return this;
  }
  /**
   * Fire accessible property change events when the state of the
   * toggle button changes.
   */
  itemStateChanged(e: ItemEvent): void {
    let tb = e.getSource();
    if (this.$outer.accessibleContext != null) {
      if (tb.isSelected()) {
        this.$outer.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.CHECKED);
      } else {
        this.$outer.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.CHECKED, null);
      }
    }
  }
}

$J.define(JToggleButton, 'javax.swing.JToggleButton', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.AbstractButton', ctors: { 'java.lang.String,javax.swing.Icon,boolean': '_JToggleButton$String$Icon$boolean', 'java.lang.String,javax.swing.Icon': '_JToggleButton$String$Icon', 'javax.swing.Action': '_JToggleButton$Action', 'java.lang.String,boolean': '_JToggleButton$String$boolean', 'java.lang.String': '_JToggleButton$String', 'javax.swing.Icon,boolean': '_JToggleButton$Icon$boolean', 'javax.swing.Icon': '_JToggleButton$Icon', '': '_JToggleButton$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JToggleButton', 'requestFocusInWindow(java.awt.event.FocusEvent$Cause)': 'requestFocusInWindow$Cause', 'requestFocus(java.awt.event.FocusEvent$Cause)': 'requestFocus$Cause' } });
$J.define(JToggleButton$ToggleButtonModel, 'javax.swing.JToggleButton$ToggleButtonModel', { kind: 'class', sup: 'javax.swing.DefaultButtonModel', ctors: { '': '_JToggleButton$ToggleButtonModel' } });
$J.define(JToggleButton$AccessibleJToggleButton, 'javax.swing.JToggleButton$AccessibleJToggleButton', { kind: 'class', ifaces: ['java.awt.event.ItemListener'], sup: 'javax.swing.AbstractButton$AccessibleAbstractButton', ctors: { '': '_JToggleButton$AccessibleJToggleButton' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  EventQueue = $J.load('java.awt.EventQueue');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  InputEvent = $J.load('java.awt.event.InputEvent');
  ItemEvent = $J.load('java.awt.event.ItemEvent');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  UIManager = $J.load('javax.swing.UIManager');
});
