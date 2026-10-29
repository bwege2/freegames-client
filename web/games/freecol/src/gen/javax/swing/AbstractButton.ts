// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/AbstractButton.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, InterruptedException, JBoolean, JObject, JString, Thread } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { ActionPropertyChangeListener } from './ActionPropertyChangeListener.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let Component, Rectangle, ActionEvent, ActionListener, ItemEvent, ItemListener, AccessibleContext, AccessibleRelation, AccessibleState, AbstractAction, Action, DefaultButtonModel, OverlayLayout, SwingConstants, SwingUtilities, UIManager, ChangeEvent, ChangeListener, UIResource;

/**
 * Defines common behaviors for buttons and menu items.
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
 * For further information see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/button.html">How to Use Buttons, Check Boxes, and Radio Buttons</a>,
 * a section in <em>The Java Tutorial</em>.
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
 * @author Jeff Dinkins
 * @since 1.2
 */
export class AbstractButton extends JComponent {
  /**
   * Identifies a change in the button model.
   */
  static readonly MODEL_CHANGED_PROPERTY: string = 'model';
  /**
   * Identifies a change in the button's text.
   */
  static readonly TEXT_CHANGED_PROPERTY: string = 'text';
  /**
   * Identifies a change to the button's mnemonic.
   */
  static readonly MNEMONIC_CHANGED_PROPERTY: string = 'mnemonic';
  /**
   * Identifies a change in the button's margins.
   */
  static readonly MARGIN_CHANGED_PROPERTY: string = 'margin';
  /**
   * Identifies a change in the button's vertical alignment.
   */
  static readonly VERTICAL_ALIGNMENT_CHANGED_PROPERTY: string = 'verticalAlignment';
  /**
   * Identifies a change in the button's horizontal alignment.
   */
  static readonly HORIZONTAL_ALIGNMENT_CHANGED_PROPERTY: string = 'horizontalAlignment';
  /**
   * Identifies a change in the button's vertical text position.
   */
  static readonly VERTICAL_TEXT_POSITION_CHANGED_PROPERTY: string = 'verticalTextPosition';
  /**
   * Identifies a change in the button's horizontal text position.
   */
  static readonly HORIZONTAL_TEXT_POSITION_CHANGED_PROPERTY: string = 'horizontalTextPosition';
  /**
   * Identifies a change to having the border drawn,
   * or having it not drawn.
   */
  static readonly BORDER_PAINTED_CHANGED_PROPERTY: string = 'borderPainted';
  /**
   * Identifies a change to having the border highlighted when focused,
   * or not.
   */
  static readonly FOCUS_PAINTED_CHANGED_PROPERTY: string = 'focusPainted';
  /**
   * Identifies a change from rollover enabled to disabled or back
   * to enabled.
   */
  static readonly ROLLOVER_ENABLED_CHANGED_PROPERTY: string = 'rolloverEnabled';
  /**
   * Identifies a change to having the button paint the content area.
   */
  static readonly CONTENT_AREA_FILLED_CHANGED_PROPERTY: string = 'contentAreaFilled';
  /**
   * Identifies a change to the icon that represents the button.
   */
  static readonly ICON_CHANGED_PROPERTY: string = 'icon';
  /**
   * Identifies a change to the icon used when the button has been
   * pressed.
   */
  static readonly PRESSED_ICON_CHANGED_PROPERTY: string = 'pressedIcon';
  /**
   * Identifies a change to the icon used when the button has
   * been selected.
   */
  static readonly SELECTED_ICON_CHANGED_PROPERTY: string = 'selectedIcon';
  /**
   * Identifies a change to the icon used when the cursor is over
   * the button.
   */
  static readonly ROLLOVER_ICON_CHANGED_PROPERTY: string = 'rolloverIcon';
  /**
   * Identifies a change to the icon used when the cursor is
   * over the button and it has been selected.
   */
  static readonly ROLLOVER_SELECTED_ICON_CHANGED_PROPERTY: string = 'rolloverSelectedIcon';
  /**
   * Identifies a change to the icon used when the button has
   * been disabled.
   */
  static readonly DISABLED_ICON_CHANGED_PROPERTY: string = 'disabledIcon';
  /**
   * Identifies a change to the icon used when the button has been
   * disabled and selected.
   */
  static readonly DISABLED_SELECTED_ICON_CHANGED_PROPERTY: string = 'disabledSelectedIcon';
  /**
   * The data model that determines the button's state.
   */
  model: ButtonModel = null;
  text_: string = null;
  margin: Insets = null;
  defaultMargin: Insets = null;
  defaultIcon: Icon = null;
  pressedIcon: Icon = null;
  disabledIcon: Icon = null;
  selectedIcon: Icon = null;
  disabledSelectedIcon: Icon = null;
  rolloverIcon: Icon = null;
  rolloverSelectedIcon: Icon = null;
  paintBorder_: boolean = false;
  paintFocus_: boolean = false;
  rolloverEnabled: boolean = false;
  contentAreaFilled: boolean = false;
  verticalAlignment: number = 0;
  horizontalAlignment: number = 0;
  verticalTextPosition: number = 0;
  horizontalTextPosition: number = 0;
  iconTextGap: number = 0;
  mnemonic: number = 0;
  mnemonicIndex: number = 0;
  multiClickThreshhold: number = 0;
  borderPaintedSet: boolean = false;
  rolloverEnabledSet: boolean = false;
  iconTextGapSet: boolean = false;
  contentAreaFilledSet: boolean = false;
  setLayout_: boolean = false;
  defaultCapable: boolean = false;
  /**
   * Combined listeners: ActionListener, ChangeListener, ItemListener.
   */
  handler: AbstractButton$Handler = null;
  /**
   * The button model's <code>changeListener</code>.
   */
  changeListener: ChangeListener = null;
  /**
   * The button model's <code>ActionListener</code>.
   */
  actionListener: ActionListener = null;
  /**
   * The button model's <code>ItemListener</code>.
   */
  itemListener: ItemListener = null;
  /**
   * Only one <code>ChangeEvent</code> is needed per button
   * instance since the
   * event's only state is the source property.  The source of events
   * generated is always "this".
   */
  changeEvent: ChangeEvent = null;
  hideActionText: boolean = false;
  action_: Action = null;
  actionPropertyChangeListener: PropertyChangeListener = null;
  /**
   * Constructor for subclasses to call.
   */
  _AbstractButton(): this {
    this._JComponent();
    this.model = null;
    this.text_ = '';
    this.margin = null;
    this.defaultMargin = null;
    this.defaultIcon = null;
    this.pressedIcon = null;
    this.disabledIcon = null;
    this.selectedIcon = null;
    this.disabledSelectedIcon = null;
    this.rolloverIcon = null;
    this.rolloverSelectedIcon = null;
    this.paintBorder_ = true;
    this.paintFocus_ = true;
    this.rolloverEnabled = false;
    this.contentAreaFilled = true;
    this.verticalAlignment = SwingConstants.CENTER;
    this.horizontalAlignment = SwingConstants.CENTER;
    this.verticalTextPosition = SwingConstants.CENTER;
    this.horizontalTextPosition = SwingConstants.TRAILING;
    this.iconTextGap = 4;
    this.mnemonicIndex = -1;
    this.multiClickThreshhold = 0;
    this.borderPaintedSet = false;
    this.rolloverEnabledSet = false;
    this.iconTextGapSet = false;
    this.contentAreaFilledSet = false;
    this.setLayout_ = false;
    this.defaultCapable = true;
    this.changeListener = null;
    this.actionListener = null;
    this.itemListener = null;
    this.hideActionText = false;
    return this;
  }
  /**
   * Sets the <code>hideActionText</code> property, which determines
   * whether the button displays text from the <code>Action</code>.
   * This is useful only if an <code>Action</code> has been
   * installed on the button.
   *
   * @param hideActionText <code>true</code> if the button's
   *                       <code>text</code> property should not reflect
   *                       that of the <code>Action</code>; the default is
   *                       <code>false</code>
   * @see <a href="Action.html#buttonActions">Swing Components Supporting
   *      <code>Action</code></a>
   * @since 1.6
   */
  setHideActionText(hideActionText: boolean): void {
    if (hideActionText !== this.hideActionText) {
      this.hideActionText = hideActionText;
      if (this.getAction() != null) {
        this.setTextFromAction(this.getAction(), false);
      }
      this.firePropertyChange$String$boolean$boolean('hideActionText', !hideActionText, hideActionText);
    }
  }
  /**
   * Returns the value of the <code>hideActionText</code> property, which
   * determines whether the button displays text from the
   * <code>Action</code>.  This is useful only if an <code>Action</code>
   * has been installed on the button.
   *
   * @return <code>true</code> if the button's <code>text</code>
   *         property should not reflect that of the
   *         <code>Action</code>; the default is <code>false</code>
   * @since 1.6
   */
  getHideActionText(): boolean {
    return this.hideActionText;
  }
  /**
   * Returns the button's text.
   * @return the buttons text
   * @see #setText
   */
  getText(): string {
    return this.text_;
  }
  /**
   * Sets the button's text.
   * @param text the string used to set the text
   * @see #getText
   */
  setText(text: string): void {
    let oldValue = this.text_;
    this.text_ = text;
    this.firePropertyChange$String$Object$Object(AbstractButton.TEXT_CHANGED_PROPERTY, oldValue, text);
    this.updateDisplayedMnemonicIndex(text, this.getMnemonic());
    if (this.accessibleContext != null) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, oldValue, text);
    }
    if (text == null || oldValue == null || !$J.equals(text, oldValue)) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Returns the state of the button. True if the
   * toggle button is selected, false if it's not.
   * @return true if the toggle button is selected, otherwise false
   */
  isSelected(): boolean {
    return this.model.isSelected();
  }
  /**
   * Sets the state of the button. Note that this method does not
   * trigger an <code>actionEvent</code>.
   * Call <code>doClick</code> to perform a programmatic action change.
   *
   * @param b  true if the button is selected, otherwise false
   */
  setSelected(b: boolean): void {
    let oldValue = this.isSelected();
    this.model.setSelected(b);
  }
  /**
   * Programmatically perform a "click". This does the same
   * thing as if the user had pressed and released the button.
   */
  doClick$(): void {
    this.doClick$int(68);
  }
  /**
   * Programmatically perform a "click". This does the same
   * thing as if the user had pressed and released the button.
   * The button stays visually "pressed" for <code>pressTime</code>
   *  milliseconds.
   *
   * @param pressTime the time to "hold down" the button, in milliseconds
   */
  doClick$int(pressTime: number): void {
    let size = this.getSize$();
    this.model.setArmed(true);
    this.model.setPressed(true);
    this.paintImmediately$Rectangle(new Rectangle()._Rectangle$int$int$int$int(0, 0, size.width_, size.height_));
    try {
      Thread.sleep(pressTime);
    } catch ($e0) {
      if ($J.isa($e0, InterruptedException)) {
        let ie = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
    this.model.setPressed(false);
    this.model.setArmed(false);
  }
  /**
   * Sets space for margin between the button's border and
   * the label. Setting to <code>null</code> will cause the button to
   * use the default margin.  The button's default <code>Border</code>
   * object will use this value to create the proper margin.
   * However, if a non-default border is set on the button,
   * it is that <code>Border</code> object's responsibility to create the
   * appropriate margin space (else this property will
   * effectively be ignored).
   *
   * @param m the space between the border and the label
   */
  setMargin(m: Insets): void {
    if ($J.isa(m, UIResource)) {
      this.defaultMargin = m;
    } else if ($J.isa(this.margin, UIResource)) {
      this.defaultMargin = this.margin;
    }
    if (m == null && this.defaultMargin != null) {
      m = this.defaultMargin;
    }
    let old = this.margin;
    this.margin = m;
    this.firePropertyChange$String$Object$Object(AbstractButton.MARGIN_CHANGED_PROPERTY, old, m);
    if (old == null || !old.equals(m)) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Returns the margin between the button's border and
   * the label.
   *
   * @return an <code>Insets</code> object specifying the margin
   *          between the botton's border and the label
   * @see #setMargin
   */
  getMargin(): Insets {
    return (this.margin == null) ? null : this.margin.clone();
  }
  /**
   * Returns the default icon.
   * @return the default <code>Icon</code>
   * @see #setIcon
   */
  getIcon(): Icon {
    return this.defaultIcon;
  }
  /**
   * Sets the button's default icon. This icon is
   * also used as the "pressed" and "disabled" icon if
   * there is no explicitly set pressed icon.
   *
   * @param defaultIcon the icon used as the default image
   * @see #getIcon
   * @see #setPressedIcon
   */
  setIcon(defaultIcon: Icon): void {
    let oldValue = this.defaultIcon;
    this.defaultIcon = defaultIcon;
    if (defaultIcon !== oldValue && ($J.isa(this.disabledIcon, UIResource))) {
      this.disabledIcon = null;
    }
    this.firePropertyChange$String$Object$Object(AbstractButton.ICON_CHANGED_PROPERTY, oldValue, defaultIcon);
    if (this.accessibleContext != null) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, oldValue, defaultIcon);
    }
    if (defaultIcon !== oldValue) {
      if (defaultIcon == null || oldValue == null || defaultIcon.getIconWidth() !== oldValue.getIconWidth() || defaultIcon.getIconHeight() !== oldValue.getIconHeight()) {
        this.revalidate();
      }
      this.repaint$();
    }
  }
  /**
   * Returns the pressed icon for the button.
   * @return the <code>pressedIcon</code> property
   * @see #setPressedIcon
   */
  getPressedIcon(): Icon {
    return this.pressedIcon;
  }
  /**
   * Sets the pressed icon for the button.
   * @param pressedIcon the icon used as the "pressed" image
   * @see #getPressedIcon
   */
  setPressedIcon(pressedIcon: Icon): void {
    let oldValue = this.pressedIcon;
    this.pressedIcon = pressedIcon;
    this.firePropertyChange$String$Object$Object(AbstractButton.PRESSED_ICON_CHANGED_PROPERTY, oldValue, pressedIcon);
    if (this.accessibleContext != null) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, oldValue, pressedIcon);
    }
    if (pressedIcon !== oldValue) {
      if (this.getModel().isPressed()) {
        this.repaint$();
      }
    }
  }
  /**
   * Returns the selected icon for the button.
   * @return the <code>selectedIcon</code> property
   * @see #setSelectedIcon
   */
  getSelectedIcon(): Icon {
    return this.selectedIcon;
  }
  /**
   * Returns the rollover icon for the button.
   * @return the <code>rolloverIcon</code> property
   * @see #setRolloverIcon
   */
  getRolloverIcon(): Icon {
    return this.rolloverIcon;
  }
  /**
   * Sets the rollover icon for the button.
   * @param rolloverIcon the icon used as the "rollover" image
   * @see #getRolloverIcon
   */
  setRolloverIcon(rolloverIcon: Icon): void {
    let oldValue = this.rolloverIcon;
    this.rolloverIcon = rolloverIcon;
    this.firePropertyChange$String$Object$Object(AbstractButton.ROLLOVER_ICON_CHANGED_PROPERTY, oldValue, rolloverIcon);
    if (this.accessibleContext != null) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, oldValue, rolloverIcon);
    }
    this.setRolloverEnabled(true);
    if (rolloverIcon !== oldValue) {
      this.repaint$();
    }
  }
  /**
   * Returns the rollover selection icon for the button.
   * @return the <code>rolloverSelectedIcon</code> property
   * @see #setRolloverSelectedIcon
   */
  getRolloverSelectedIcon(): Icon {
    return this.rolloverSelectedIcon;
  }
  /**
   * Returns the icon used by the button when it's disabled.
   * If no disabled icon has been set this will forward the call to
   * the look and feel to construct an appropriate disabled Icon.
   * <p>
   * Some look and feels might not render the disabled Icon, in which
   * case they will ignore this.
   *
   * @return the <code>disabledIcon</code> property
   * @see #getPressedIcon
   * @see #setDisabledIcon
   * @see javax.swing.LookAndFeel#getDisabledIcon
   */
  getDisabledIcon(): Icon {
    if (this.disabledIcon == null) {
      this.disabledIcon = UIManager.getLookAndFeel().getDisabledIcon(this, this.getIcon());
      if (this.disabledIcon != null) {
        this.firePropertyChange$String$Object$Object(AbstractButton.DISABLED_ICON_CHANGED_PROPERTY, null, this.disabledIcon);
      }
    }
    return this.disabledIcon;
  }
  /**
   * Sets the disabled icon for the button.
   * @param disabledIcon the icon used as the disabled image
   * @see #getDisabledIcon
   */
  setDisabledIcon(disabledIcon: Icon): void {
    let oldValue = this.disabledIcon;
    this.disabledIcon = disabledIcon;
    this.firePropertyChange$String$Object$Object(AbstractButton.DISABLED_ICON_CHANGED_PROPERTY, oldValue, disabledIcon);
    if (this.accessibleContext != null) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, oldValue, disabledIcon);
    }
    if (disabledIcon !== oldValue) {
      if (!this.isEnabled()) {
        this.repaint$();
      }
    }
  }
  /**
   * Returns the icon used by the button when it's disabled and selected.
   * If no disabled selection icon has been set, this will forward
   * the call to the LookAndFeel to construct an appropriate disabled
   * Icon from the selection icon if it has been set and to
   * <code>getDisabledIcon()</code> otherwise.
   * <p>
   * Some look and feels might not render the disabled selected Icon, in
   * which case they will ignore this.
   *
   * @return the <code>disabledSelectedIcon</code> property
   * @see #getDisabledIcon
   * @see #setDisabledSelectedIcon
   * @see javax.swing.LookAndFeel#getDisabledSelectedIcon
   */
  getDisabledSelectedIcon(): Icon {
    if (this.disabledSelectedIcon == null) {
      if (this.selectedIcon != null) {
        this.disabledSelectedIcon = UIManager.getLookAndFeel().getDisabledSelectedIcon(this, this.getSelectedIcon());
      } else {
        return this.getDisabledIcon();
      }
    }
    return this.disabledSelectedIcon;
  }
  /**
   * Sets the disabled selection icon for the button.
   * @param disabledSelectedIcon the icon used as the disabled
   *          selection image
   * @see #getDisabledSelectedIcon
   */
  setDisabledSelectedIcon(disabledSelectedIcon: Icon): void {
    let oldValue = this.disabledSelectedIcon;
    this.disabledSelectedIcon = disabledSelectedIcon;
    this.firePropertyChange$String$Object$Object(AbstractButton.DISABLED_SELECTED_ICON_CHANGED_PROPERTY, oldValue, disabledSelectedIcon);
    if (this.accessibleContext != null) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, oldValue, disabledSelectedIcon);
    }
    if (disabledSelectedIcon !== oldValue) {
      if (disabledSelectedIcon == null || oldValue == null || disabledSelectedIcon.getIconWidth() !== oldValue.getIconWidth() || disabledSelectedIcon.getIconHeight() !== oldValue.getIconHeight()) {
        this.revalidate();
      }
      if (!this.isEnabled() && this.isSelected()) {
        this.repaint$();
      }
    }
  }
  /**
   * Returns the vertical alignment of the text and icon.
   *
   * @return the <code>verticalAlignment</code> property, one of the
   *          following values:
   * <ul>
   * <li>{@code SwingConstants.CENTER} (the default)
   * <li>{@code SwingConstants.TOP}
   * <li>{@code SwingConstants.BOTTOM}
   * </ul>
   */
  getVerticalAlignment(): number {
    return this.verticalAlignment;
  }
  /**
   * Returns the horizontal alignment of the icon and text.
   * {@code AbstractButton}'s default is {@code SwingConstants.CENTER},
   * but subclasses such as {@code JCheckBox} may use a different default.
   *
   * @return the <code>horizontalAlignment</code> property,
   *             one of the following values:
   * <ul>
   *   <li>{@code SwingConstants.RIGHT}
   *   <li>{@code SwingConstants.LEFT}
   *   <li>{@code SwingConstants.CENTER}
   *   <li>{@code SwingConstants.LEADING}
   *   <li>{@code SwingConstants.TRAILING}
   * </ul>
   */
  getHorizontalAlignment(): number {
    return this.horizontalAlignment;
  }
  /**
   * Sets the horizontal alignment of the icon and text.
   * {@code AbstractButton}'s default is {@code SwingConstants.CENTER},
   * but subclasses such as {@code JCheckBox} may use a different default.
   *
   * @param alignment the alignment value, one of the following values:
   * <ul>
   *   <li>{@code SwingConstants.RIGHT}
   *   <li>{@code SwingConstants.LEFT}
   *   <li>{@code SwingConstants.CENTER}
   *   <li>{@code SwingConstants.LEADING}
   *   <li>{@code SwingConstants.TRAILING}
   * </ul>
   * @throws IllegalArgumentException if the alignment is not one of the
   *         valid values
   */
  setHorizontalAlignment(alignment: number): void {
    if (alignment === this.horizontalAlignment) {
      return;
    }
    let oldValue = this.horizontalAlignment;
    this.horizontalAlignment = this.checkHorizontalKey(alignment, 'horizontalAlignment');
    this.firePropertyChange$String$int$int(AbstractButton.HORIZONTAL_ALIGNMENT_CHANGED_PROPERTY, oldValue, this.horizontalAlignment);
    this.repaint$();
  }
  /**
   * Returns the vertical position of the text relative to the icon.
   * @return the <code>verticalTextPosition</code> property,
   *          one of the following values:
   * <ul>
   * <li>{@code SwingConstants.CENTER} (the default)
   * <li>{@code SwingConstants.TOP}
   * <li>{@code SwingConstants.BOTTOM}
   * </ul>
   */
  getVerticalTextPosition(): number {
    return this.verticalTextPosition;
  }
  /**
   * Sets the vertical position of the text relative to the icon.
   * @param textPosition  one of the following values:
   * <ul>
   * <li>{@code SwingConstants.CENTER} (the default)
   * <li>{@code SwingConstants.TOP}
   * <li>{@code SwingConstants.BOTTOM}
   * </ul>
   */
  setVerticalTextPosition(textPosition: number): void {
    if (textPosition === this.verticalTextPosition) {
      return;
    }
    let oldValue = this.verticalTextPosition;
    this.verticalTextPosition = this.checkVerticalKey(textPosition, 'verticalTextPosition');
    this.firePropertyChange$String$int$int(AbstractButton.VERTICAL_TEXT_POSITION_CHANGED_PROPERTY, oldValue, this.verticalTextPosition);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Returns the horizontal position of the text relative to the icon.
   * @return the <code>horizontalTextPosition</code> property,
   *          one of the following values:
   * <ul>
   * <li>{@code SwingConstants.RIGHT}
   * <li>{@code SwingConstants.LEFT}
   * <li>{@code SwingConstants.CENTER}
   * <li>{@code SwingConstants.LEADING}
   * <li>{@code SwingConstants.TRAILING} (the default)
   * </ul>
   */
  getHorizontalTextPosition(): number {
    return this.horizontalTextPosition;
  }
  /**
   * Sets the horizontal position of the text relative to the icon.
   * @param textPosition one of the following values:
   * <ul>
   * <li>{@code SwingConstants.RIGHT}
   * <li>{@code SwingConstants.LEFT}
   * <li>{@code SwingConstants.CENTER}
   * <li>{@code SwingConstants.LEADING}
   * <li>{@code SwingConstants.TRAILING} (the default)
   * </ul>
   * @throws IllegalArgumentException if <code>textPosition</code>
   *          is not one of the legal values listed above
   */
  setHorizontalTextPosition(textPosition: number): void {
    if (textPosition === this.horizontalTextPosition) {
      return;
    }
    let oldValue = this.horizontalTextPosition;
    this.horizontalTextPosition = this.checkHorizontalKey(textPosition, 'horizontalTextPosition');
    this.firePropertyChange$String$int$int(AbstractButton.HORIZONTAL_TEXT_POSITION_CHANGED_PROPERTY, oldValue, this.horizontalTextPosition);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Returns the amount of space between the text and the icon
   * displayed in this button.
   *
   * @return an int equal to the number of pixels between the text
   *         and the icon.
   * @since 1.4
   * @see #setIconTextGap
   */
  getIconTextGap(): number {
    return this.iconTextGap;
  }
  /**
   * If both the icon and text properties are set, this property
   * defines the space between them.
   * <p>
   * The default value of this property is 4 pixels.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param iconTextGap the space between icon and text if these properties are set.
   * @since 1.4
   * @see #getIconTextGap
   */
  setIconTextGap(iconTextGap: number): void {
    let oldValue = this.iconTextGap;
    this.iconTextGap = iconTextGap;
    this.iconTextGapSet = true;
    this.firePropertyChange$String$int$int('iconTextGap', oldValue, iconTextGap);
    if (iconTextGap !== oldValue) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Verify that the {@code key} argument is a legal value for the
   * {@code horizontalAlignment} and {@code horizontalTextPosition}
   * properties. Valid values are:
   * <ul>
   *   <li>{@code SwingConstants.RIGHT}
   *   <li>{@code SwingConstants.LEFT}
   *   <li>{@code SwingConstants.CENTER}
   *   <li>{@code SwingConstants.LEADING}
   *   <li>{@code SwingConstants.TRAILING}
   * </ul>
   *
   * @param key the property value to check
   * @param exception the message to use in the
   *        {@code IllegalArgumentException} that is thrown for an invalid
   *        value
   * @return the {@code key} argument
   * @throws IllegalArgumentException if key is not one of the legal
   *            values listed above
   * @see #setHorizontalTextPosition
   * @see #setHorizontalAlignment
   */
  checkHorizontalKey(key: number, exception: string): number {
    if ((key === SwingConstants.LEFT) || (key === SwingConstants.CENTER) || (key === SwingConstants.RIGHT) || (key === SwingConstants.LEADING) || (key === SwingConstants.TRAILING)) {
      return key;
    } else {
      throw new IllegalArgumentException(exception);
    }
  }
  /**
   * Verify that the {@code key} argument is a legal value for the
   * vertical properties. Valid values are:
   * <ul>
   *   <li>{@code SwingConstants.CENTER}
   *   <li>{@code SwingConstants.TOP}
   *   <li>{@code SwingConstants.BOTTOM}
   * </ul>
   *
   * @param key the property value to check
   * @param exception the message to use in the
   *        {@code IllegalArgumentException} that is thrown for an invalid
   *        value
   * @return the {@code key} argument
   * @throws IllegalArgumentException if key is not one of the legal
   *            values listed above
   */
  checkVerticalKey(key: number, exception: string): number {
    if ((key === SwingConstants.TOP) || (key === SwingConstants.CENTER) || (key === SwingConstants.BOTTOM)) {
      return key;
    } else {
      throw new IllegalArgumentException(exception);
    }
  }
  /**
   * {@inheritDoc}
   *
   * @since 1.6
   */
  removeNotify(): void {
    super.removeNotify();
    if (this.isRolloverEnabled()) {
      this.getModel().setRollover(false);
    }
  }
  /**
   * Sets the action command for this button.
   * @param actionCommand the action command for this button
   */
  setActionCommand(actionCommand: string): void {
    this.getModel().setActionCommand(actionCommand);
  }
  /**
   * Returns the action command for this button.
   * @return the action command for this button
   */
  getActionCommand(): string {
    let ac = this.getModel().getActionCommand();
    if (ac == null) {
      ac = this.getText();
    }
    return ac;
  }
  /**
   * Sets the <code>Action</code>.
   * The new <code>Action</code> replaces any previously set
   * <code>Action</code> but does not affect <code>ActionListeners</code>
   * independently added with <code>addActionListener</code>.
   * If the <code>Action</code> is already a registered
   * <code>ActionListener</code> for the button, it is not re-registered.
   * <p>
   * Setting the <code>Action</code> results in immediately changing
   * all the properties described in <a href="Action.html#buttonActions">
   * Swing Components Supporting <code>Action</code></a>.
   * Subsequently, the button's properties are automatically updated
   * as the <code>Action</code>'s properties change.
   * <p>
   * This method uses three other methods to set
   * and help track the <code>Action</code>'s property values.
   * It uses the <code>configurePropertiesFromAction</code> method
   * to immediately change the button's properties.
   * To track changes in the <code>Action</code>'s property values,
   * this method registers the <code>PropertyChangeListener</code>
   * returned by <code>createActionPropertyChangeListener</code>. The
   * default {@code PropertyChangeListener} invokes the
   * {@code actionPropertyChanged} method when a property in the
   * {@code Action} changes.
   *
   * @param a the <code>Action</code> for the <code>AbstractButton</code>,
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
   * @return the <code>Action</code> for this <code>ActionEvent</code>
   *          source, or <code>null</code>
   * @since 1.3
   * @see Action
   * @see #setAction
   */
  getAction(): Action {
    return this.action_;
  }
  /**
   * Sets the properties on this button to match those in the specified
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
    this.setMnemonicFromAction(a);
    this.setTextFromAction(a, false);
    AbstractAction.setToolTipTextFromAction(this, a);
    this.setIconFromAction(a);
    this.setActionCommandFromAction(a);
    AbstractAction.setEnabledFromAction(this, a);
    if (AbstractAction.hasSelectedKey(a) && this.shouldUpdateSelectedStateFromAction()) {
      this.setSelectedFromAction(a);
    }
    this.setDisplayedMnemonicIndexFromAction(a, false);
  }
  clientPropertyChanged(key: any, oldValue: any, newValue: any): void {
    if (key === 'hideActionText') {
      let current = ($J.isa(newValue, JBoolean)) ? newValue : false;
      if (this.getHideActionText() !== current) {
        this.setHideActionText(current);
      }
    }
  }
  /**
   * Button subclasses that support mirroring the selected state from
   * the action should override this to return true.  AbstractButton's
   * implementation returns false.
   */
  shouldUpdateSelectedStateFromAction(): boolean {
    return false;
  }
  /**
   * Updates the button's state in response to property changes in the
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
   * @param action the <code>Action</code> associated with this button
   * @param propertyName the name of the property that changed
   * @since 1.6
   * @see Action
   * @see #configurePropertiesFromAction
   */
  actionPropertyChanged(action: Action, propertyName: string): void {
    if (propertyName === Action.NAME) {
      this.setTextFromAction(action, true);
    } else if (propertyName === 'enabled') {
      AbstractAction.setEnabledFromAction(this, action);
    } else if (propertyName === Action.SHORT_DESCRIPTION) {
      AbstractAction.setToolTipTextFromAction(this, action);
    } else if (propertyName === Action.SMALL_ICON) {
      this.smallIconChanged(action);
    } else if (propertyName === Action.MNEMONIC_KEY) {
      this.setMnemonicFromAction(action);
    } else if (propertyName === Action.ACTION_COMMAND_KEY) {
      this.setActionCommandFromAction(action);
    } else if (propertyName === Action.SELECTED_KEY && AbstractAction.hasSelectedKey(action) && this.shouldUpdateSelectedStateFromAction()) {
      this.setSelectedFromAction(action);
    } else if (propertyName === Action.DISPLAYED_MNEMONIC_INDEX_KEY) {
      this.setDisplayedMnemonicIndexFromAction(action, true);
    } else if (propertyName === Action.LARGE_ICON_KEY) {
      this.largeIconChanged(action);
    }
  }
  setDisplayedMnemonicIndexFromAction(a: Action, fromPropertyChange: boolean): void {
    let iValue = (a == null) ? null : a.getValue$String(Action.DISPLAYED_MNEMONIC_INDEX_KEY);
    if (fromPropertyChange || iValue != null) {
      let value: number;
      if (iValue == null) {
        value = -1;
      } else {
        value = iValue;
        let text = this.getText();
        if (text == null || value >= text.length) {
          value = -1;
        }
      }
      this.setDisplayedMnemonicIndex(value);
    }
  }
  setMnemonicFromAction(a: Action): void {
    let n = (a == null) ? null : a.getValue$String(Action.MNEMONIC_KEY);
    this.setMnemonic$int((n == null) ? 0 /* \u0000 */ : n);
  }
  setTextFromAction(a: Action, propertyChange: boolean): void {
    let hideText = this.getHideActionText();
    if (!propertyChange) {
      this.setText((a != null && !hideText) ? a.getValue$String(Action.NAME) : null);
    } else if (!hideText) {
      this.setText(a.getValue$String(Action.NAME));
    }
  }
  setIconFromAction(a: Action): void {
    let icon = null;
    if (a != null) {
      icon = a.getValue$String(Action.LARGE_ICON_KEY);
      if (icon == null) {
        icon = a.getValue$String(Action.SMALL_ICON);
      }
    }
    this.setIcon(icon);
  }
  smallIconChanged(a: Action): void {
    if (a.getValue$String(Action.LARGE_ICON_KEY) == null) {
      this.setIconFromAction(a);
    }
  }
  largeIconChanged(a: Action): void {
    this.setIconFromAction(a);
  }
  setActionCommandFromAction(a: Action): void {
    this.setActionCommand((a != null) ? a.getValue$String(Action.ACTION_COMMAND_KEY) : null);
  }
  /**
   * Sets the selected state of the button from the action.  This is defined
   * here, but not wired up.  Subclasses like JToggleButton and
   * JCheckBoxMenuItem make use of it.
   *
   * @param a the Action
   */
  setSelectedFromAction(a: Action): void {
    let selected = false;
    if (a != null) {
      selected = AbstractAction.isSelected(a);
    }
    if (selected !== this.isSelected()) {
      this.setSelected(selected);
      if (!selected && this.isSelected()) {
        if (this.getModel() instanceof DefaultButtonModel) {
          let group = (this.getModel()).getGroup();
          if (group != null) {
            group.clearSelection();
          }
        }
      }
    }
  }
  /**
   * Creates and returns a <code>PropertyChangeListener</code> that is
   * responsible for listening for changes from the specified
   * <code>Action</code> and updating the appropriate properties.
   * <p>
   * <b>Warning:</b> If you subclass this do not create an anonymous
   * inner class.  If you do the lifetime of the button will be tied to
   * that of the <code>Action</code>.
   *
   * @param a the button's action
   * @return the {@code PropertyChangeListener}
   * @since 1.3
   * @see Action
   * @see #setAction
   */
  createActionPropertyChangeListener(a: Action): PropertyChangeListener {
    return this.createActionPropertyChangeListener0(a);
  }
  createActionPropertyChangeListener0(a: Action): PropertyChangeListener {
    return $J.fn(new AbstractButton$ButtonActionPropertyChangeListener()._AbstractButton$ButtonActionPropertyChangeListener(this, a), 'propertyChange');
  }
  /**
   * Gets the <code>borderPainted</code> property.
   *
   * @return the value of the <code>borderPainted</code> property
   * @see #setBorderPainted
   */
  isBorderPainted(): boolean {
    return this.paintBorder_;
  }
  /**
   * Sets the <code>borderPainted</code> property.
   * If <code>true</code> and the button has a border,
   * the border is painted. The default value for the
   * <code>borderPainted</code> property is <code>true</code>.
   * <p>
   * Some look and feels might not support
   * the <code>borderPainted</code> property,
   * in which case they ignore this.
   *
   * @param b if true and border property is not <code>null</code>,
   *          the border is painted
   * @see #isBorderPainted
   */
  setBorderPainted(b: boolean): void {
    let oldValue = this.paintBorder_;
    this.paintBorder_ = b;
    this.borderPaintedSet = true;
    this.firePropertyChange$String$boolean$boolean(AbstractButton.BORDER_PAINTED_CHANGED_PROPERTY, oldValue, this.paintBorder_);
    if (b !== oldValue) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Paint the button's border if <code>BorderPainted</code>
   * property is true and the button has a border.
   * @param g the <code>Graphics</code> context in which to paint
   *
   * @see #paint
   * @see #setBorder
   */
  paintBorder(g: Graphics): void {
    if (this.isBorderPainted()) {
      super.paintBorder(g);
    }
  }
  /**
   * Gets the <code>paintFocus</code> property.
   *
   * @return the <code>paintFocus</code> property
   * @see #setFocusPainted
   */
  isFocusPainted(): boolean {
    return this.paintFocus_;
  }
  /**
   * Sets the <code>paintFocus</code> property, which must
   * be <code>true</code> for the focus state to be painted.
   * The default value for the <code>paintFocus</code> property
   * is <code>true</code>.
   * Some look and feels might not paint focus state;
   * they will ignore this property.
   *
   * @param b if <code>true</code>, the focus state should be painted
   * @see #isFocusPainted
   */
  setFocusPainted(b: boolean): void {
    let oldValue = this.paintFocus_;
    this.paintFocus_ = b;
    this.firePropertyChange$String$boolean$boolean(AbstractButton.FOCUS_PAINTED_CHANGED_PROPERTY, oldValue, this.paintFocus_);
    if (b !== oldValue && this.isFocusOwner()) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Gets the <code>contentAreaFilled</code> property.
   *
   * @return the <code>contentAreaFilled</code> property
   * @see #setContentAreaFilled
   */
  isContentAreaFilled(): boolean {
    return this.contentAreaFilled;
  }
  /**
   * Sets the <code>contentAreaFilled</code> property.
   * If <code>true</code> the button will paint the content
   * area.  If you wish to have a transparent button, such as
   * an icon only button, for example, then you should set
   * this to <code>false</code>. Do not call <code>setOpaque(false)</code>.
   * The default value for the <code>contentAreaFilled</code>
   * property is <code>true</code>.
   * <p>
   * This function may cause the component's opaque property to change.
   * <p>
   * The exact behavior of calling this function varies on a
   * component-by-component and L&amp;F-by-L&amp;F basis.
   *
   * @param b if true, the content should be filled; if false
   *          the content area is not filled
   * @see #isContentAreaFilled
   * @see #setOpaque
   */
  setContentAreaFilled(b: boolean): void {
    let oldValue = this.contentAreaFilled;
    this.contentAreaFilled = b;
    this.contentAreaFilledSet = true;
    this.firePropertyChange$String$boolean$boolean(AbstractButton.CONTENT_AREA_FILLED_CHANGED_PROPERTY, oldValue, this.contentAreaFilled);
    if (b !== oldValue) {
      this.repaint$();
    }
  }
  /**
   * Gets the <code>rolloverEnabled</code> property.
   *
   * @return the value of the <code>rolloverEnabled</code> property
   * @see #setRolloverEnabled
   */
  isRolloverEnabled(): boolean {
    return this.rolloverEnabled;
  }
  /**
   * Sets the <code>rolloverEnabled</code> property, which
   * must be <code>true</code> for rollover effects to occur.
   * The default value for the <code>rolloverEnabled</code>
   * property is <code>false</code>.
   * Some look and feels might not implement rollover effects;
   * they will ignore this property.
   *
   * @param b if <code>true</code>, rollover effects should be painted
   * @see #isRolloverEnabled
   */
  setRolloverEnabled(b: boolean): void {
    let oldValue = this.rolloverEnabled;
    this.rolloverEnabled = b;
    this.rolloverEnabledSet = true;
    this.firePropertyChange$String$boolean$boolean(AbstractButton.ROLLOVER_ENABLED_CHANGED_PROPERTY, oldValue, this.rolloverEnabled);
    if (b !== oldValue) {
      this.repaint$();
    }
  }
  /**
   * Returns the keyboard mnemonic from the current model.
   * @return the keyboard mnemonic from the model
   */
  getMnemonic(): number {
    return this.mnemonic;
  }
  /**
   * Sets the keyboard mnemonic on the current model.
   * The mnemonic is the key which when combined with the look and feel's
   * mouseless modifier (usually Alt) will activate this button
   * if focus is contained somewhere within this button's ancestor
   * window.
   * <p>
   * A mnemonic must correspond to a single key on the keyboard
   * and should be specified using one of the <code>VK_XXX</code>
   * keycodes defined in <code>java.awt.event.KeyEvent</code>.
   * These codes and the wider array of codes for international
   * keyboards may be obtained through
   * <code>java.awt.event.KeyEvent.getExtendedKeyCodeForChar</code>.
   * Mnemonics are case-insensitive, therefore a key event
   * with the corresponding keycode would cause the button to be
   * activated whether or not the Shift modifier was pressed.
   * <p>
   * If the character defined by the mnemonic is found within
   * the button's label string, the first occurrence of it
   * will be underlined to indicate the mnemonic to the user.
   *
   * @param mnemonic the key code which represents the mnemonic
   * @see     java.awt.event.KeyEvent
   * @see     #setDisplayedMnemonicIndex
   */
  setMnemonic$int(mnemonic: number): void {
    let oldValue = this.getMnemonic();
    this.model.setMnemonic(mnemonic);
    this.updateMnemonicProperties();
  }
  /**
   * This method is now obsolete, please use <code>setMnemonic(int)</code>
   * to set the mnemonic for a button.  This method is only designed
   * to handle character values which fall between 'a' and 'z' or
   * 'A' and 'Z'.
   *
   * @param mnemonic  a char specifying the mnemonic value
   * @see #setMnemonic(int)
   */
  setMnemonic$char(mnemonic: number): void {
    let vk = mnemonic;
    if (vk >= 97 /* 'a' */ && vk <= 122 /* 'z' */) {
      vk = (vk - (97 /* 'a' */ - 65 /* 'A' */)) | 0;
    }
    this.setMnemonic$int(vk);
  }
  /**
   * Provides a hint to the look and feel as to which character in the
   * text should be decorated to represent the mnemonic. Not all look and
   * feels may support this. A value of -1 indicates either there is no
   * mnemonic, the mnemonic character is not contained in the string, or
   * the developer does not wish the mnemonic to be displayed.
   * <p>
   * The value of this is updated as the properties relating to the
   * mnemonic change (such as the mnemonic itself, the text...).
   * You should only ever have to call this if
   * you do not wish the default character to be underlined. For example, if
   * the text was 'Save As', with a mnemonic of 'a', and you wanted the 'A'
   * to be decorated, as 'Save <u>A</u>s', you would have to invoke
   * <code>setDisplayedMnemonicIndex(5)</code> after invoking
   * <code>setMnemonic(KeyEvent.VK_A)</code>.
   *
   * @since 1.4
   * @param index Index into the String to underline
   * @throws IllegalArgumentException will be thrown if <code>index</code>
   *            is &gt;= length of the text, or &lt; -1
   * @see #getDisplayedMnemonicIndex
   */
  setDisplayedMnemonicIndex(index: number): void {
    let oldValue = this.mnemonicIndex;
    if (index === -1) {
      this.mnemonicIndex = -1;
    } else {
      let text = this.getText();
      let textLength = (text == null) ? 0 : text.length;
      if (index < -1 || index >= textLength) {
        throw new IllegalArgumentException('index == ' + index);
      }
    }
    this.mnemonicIndex = index;
    this.firePropertyChange$String$int$int('displayedMnemonicIndex', oldValue, index);
    if (index !== oldValue) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Returns the character, as an index, that the look and feel should
   * provide decoration for as representing the mnemonic character.
   *
   * @since 1.4
   * @return index representing mnemonic character
   * @see #setDisplayedMnemonicIndex
   */
  getDisplayedMnemonicIndex(): number {
    return this.mnemonicIndex;
  }
  /**
   * Update the displayedMnemonicIndex property. This method
   * is called when either text or mnemonic changes. The new
   * value of the displayedMnemonicIndex property is the index
   * of the first occurrence of mnemonic in text.
   */
  updateDisplayedMnemonicIndex(text: string, mnemonic: number): void {
    this.setDisplayedMnemonicIndex(SwingUtilities.findDisplayedMnemonicIndex(text, mnemonic));
  }
  /**
   * Brings the mnemonic property in accordance with model's mnemonic.
   * This is called when model's mnemonic changes. Also updates the
   * displayedMnemonicIndex property.
   */
  updateMnemonicProperties(): void {
    let newMnemonic = this.model.getMnemonic();
    if (this.mnemonic !== newMnemonic) {
      let oldValue = this.mnemonic;
      this.mnemonic = newMnemonic;
      this.firePropertyChange$String$int$int(AbstractButton.MNEMONIC_CHANGED_PROPERTY, oldValue, this.mnemonic);
      this.updateDisplayedMnemonicIndex(this.getText(), this.mnemonic);
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Sets the amount of time (in milliseconds) required between
   * mouse press events for the button to generate the corresponding
   * action events.  After the initial mouse press occurs (and action
   * event generated) any subsequent mouse press events which occur
   * on intervals less than the threshold will be ignored and no
   * corresponding action event generated.  By default the threshold is 0,
   * which means that for each mouse press, an action event will be
   * fired, no matter how quickly the mouse clicks occur.  In buttons
   * where this behavior is not desirable (for example, the "OK" button
   * in a dialog), this threshold should be set to an appropriate
   * positive value.
   *
   * @see #getMultiClickThreshhold
   * @param threshold the amount of time required between mouse
   *        press events to generate corresponding action events
   * @throws   IllegalArgumentException if threshold &lt; 0
   * @since 1.4
   */
  setMultiClickThreshhold(threshold: number): void {
    if (threshold < 0) {
      throw new IllegalArgumentException('threshold must be >= 0');
    }
    this.multiClickThreshhold = threshold;
  }
  /**
   * Gets the amount of time (in milliseconds) required between
   * mouse press events for the button to generate the corresponding
   * action events.
   *
   * @see #setMultiClickThreshhold
   * @return the amount of time required between mouse press events
   *         to generate corresponding action events
   * @since 1.4
   */
  getMultiClickThreshhold(): number {
    return this.multiClickThreshhold;
  }
  /**
   * Returns the model that this button represents.
   * @return the <code>model</code> property
   * @see #setModel
   */
  getModel(): ButtonModel {
    return this.model;
  }
  /**
   * Sets the model that this button represents.
   * @param newModel the new <code>ButtonModel</code>
   * @see #getModel
   */
  setModel(newModel: ButtonModel): void {
    let oldModel = this.getModel();
    if (oldModel != null) {
      oldModel.removeChangeListener(this.changeListener);
      oldModel.removeActionListener(this.actionListener);
      oldModel.removeItemListener(this.itemListener);
      this.changeListener = null;
      this.actionListener = null;
      this.itemListener = null;
    }
    this.model = newModel;
    if (newModel != null) {
      this.changeListener = this.createChangeListener();
      this.actionListener = this.createActionListener();
      this.itemListener = this.createItemListener();
      newModel.addChangeListener(this.changeListener);
      newModel.addActionListener(this.actionListener);
      newModel.addItemListener(this.itemListener);
      this.updateMnemonicProperties();
      super.setEnabled(newModel.isEnabled());
    } else {
      this.mnemonic = 0 /* \u0000 */;
    }
    this.updateDisplayedMnemonicIndex(this.getText(), this.mnemonic);
    this.firePropertyChange$String$Object$Object(AbstractButton.MODEL_CHANGED_PROPERTY, oldModel, newModel);
    if (newModel !== oldModel) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Returns the L&amp;F object that renders this component.
   * @return the ButtonUI object
   * @see #setUI
   */
  getUI(): ButtonUI {
    return this.ui;
  }
  /**
   * Sets the L&amp;F object that renders this component.
   * @param ui the <code>ButtonUI</code> L&amp;F object
   * @see #getUI
   */
  setUI$ButtonUI(ui: ButtonUI): void {
    super.setUI$ComponentUI(ui);
    if ($J.isa(this.disabledIcon, UIResource)) {
      this.setDisabledIcon(null);
    }
    if ($J.isa(this.disabledSelectedIcon, UIResource)) {
      this.setDisabledSelectedIcon(null);
    }
  }
  /**
   * Adds the specified component to this container at the specified
   * index, refer to
   * {@link java.awt.Container#addImpl(Component, Object, int)}
   * for a complete description of this method.
   *
   * @param     comp the component to be added
   * @param     constraints an object expressing layout constraints
   *                 for this component
   * @param     index the position in the container's list at which to
   *                 insert the component, where <code>-1</code>
   *                 means append to the end
   * @throws IllegalArgumentException if <code>index</code> is invalid
   * @throws IllegalArgumentException if adding the container's parent
   *                  to itself
   * @throws IllegalArgumentException if adding a window to a container
   * @since 1.5
   */
  addImpl(comp: Component, constraints: any, index: number): void {
    if (!this.setLayout_) {
      this.setLayout(new OverlayLayout()._OverlayLayout(this));
    }
    super.addImpl(comp, constraints, index);
  }
  /**
   * Sets the layout manager for this container, refer to
   * {@link java.awt.Container#setLayout(LayoutManager)}
   * for a complete description of this method.
   *
   * @param mgr the specified layout manager
   * @since 1.5
   */
  setLayout(mgr: LayoutManager): void {
    this.setLayout_ = true;
    super.setLayout(mgr);
  }
  /**
   * Adds a <code>ChangeListener</code> to the button.
   * @param l the listener to be added
   */
  addChangeListener(l: ChangeListener): void {
    this.listenerList.add($J.cls(ChangeListener), l);
  }
  /**
   * Removes a ChangeListener from the button.
   * @param l the listener to be removed
   */
  removeChangeListener(l: ChangeListener): void {
    this.listenerList.remove($J.cls(ChangeListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created.
   * @see EventListenerList
   */
  fireStateChanged(): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ChangeListener)) {
        if (this.changeEvent == null) {
          this.changeEvent = new ChangeEvent()._ChangeEvent(this);
        }
        $J.fn((listeners[(i + 1) | 0]), 'stateChanged')(this.changeEvent);
      }
    }
  }
  /**
   * Adds an <code>ActionListener</code> to the button.
   * @param l the <code>ActionListener</code> to be added
   */
  addActionListener(l: ActionListener): void {
    this.listenerList.add($J.cls(ActionListener), l);
  }
  /**
   * Removes an <code>ActionListener</code> from the button.
   * If the listener is the currently set <code>Action</code>
   * for the button, then the <code>Action</code>
   * is set to <code>null</code>.
   *
   * @param l the listener to be removed
   */
  removeActionListener(l: ActionListener): void {
    if ((l != null) && (this.getAction() === l)) {
      this.setAction(null);
    } else {
      this.listenerList.remove($J.cls(ActionListener), l);
    }
  }
  /**
   * Subclasses that want to handle <code>ChangeEvents</code> differently
   * can override this to return another <code>ChangeListener</code>
   * implementation.
   *
   * @return the new <code>ChangeListener</code>
   */
  createChangeListener(): ChangeListener {
    return $J.fn(this.getHandler(), 'stateChanged');
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the <code>event</code>
   * parameter.
   *
   * @param event  the <code>ActionEvent</code> object
   * @see EventListenerList
   */
  fireActionPerformed(event: ActionEvent): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ActionListener)) {
        if (e == null) {
          let actionCommand = event.getActionCommand();
          if (actionCommand == null) {
            actionCommand = this.getActionCommand();
          }
          e = new ActionEvent()._ActionEvent$Object$int$String$long$int(this, ActionEvent.ACTION_PERFORMED, actionCommand, event.getWhen(), event.getModifiers());
        }
        $J.fn((listeners[(i + 1) | 0]), 'actionPerformed')(e);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the <code>event</code> parameter.
   *
   * @param event  the <code>ItemEvent</code> object
   * @see EventListenerList
   */
  fireItemStateChanged(event: ItemEvent): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ItemListener)) {
        if (e == null) {
          e = new ItemEvent()._ItemEvent(this, ItemEvent.ITEM_STATE_CHANGED, this, event.getStateChange());
        }
        $J.fn((listeners[(i + 1) | 0]), 'itemStateChanged')(e);
      }
    }
    if (this.accessibleContext != null) {
      if (event.getStateChange() === ItemEvent.SELECTED) {
        this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.SELECTED);
        this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VALUE_PROPERTY, 0, 1);
      } else {
        this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.SELECTED, null);
        this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VALUE_PROPERTY, 1, 0);
      }
    }
  }
  /**
   * Returns {@code ActionListener} that is added to model.
   *
   * @return the {@code ActionListener}
   */
  createActionListener(): ActionListener {
    return $J.fn(this.getHandler(), 'actionPerformed');
  }
  /**
   * Returns {@code ItemListener} that is added to model.
   *
   * @return the {@code ItemListener}
   */
  createItemListener(): ItemListener {
    return $J.fn(this.getHandler(), 'itemStateChanged');
  }
  /**
   * Enables (or disables) the button.
   * @param b  true to enable the button, otherwise false
   */
  setEnabled(b: boolean): void {
    if (!b && this.model.isRollover()) {
      this.model.setRollover(false);
    }
    super.setEnabled(b);
    this.model.setEnabled(b);
  }
  /**
   * Adds an <code>ItemListener</code> to the <code>checkbox</code>.
   * @param l  the <code>ItemListener</code> to be added
   */
  addItemListener(l: ItemListener): void {
    this.listenerList.add($J.cls(ItemListener), l);
  }
  /**
   * Initialization of the {@code AbstractButton}.
   *
   * @param text  the text of the button
   * @param icon  the Icon image to display on the button
   */
  init(text: string, icon: Icon): void {
    if (text != null) {
      this.setText(text);
    }
    if (icon != null) {
      this.setIcon(icon);
    }
    this.updateUI();
    this.setAlignmentX(Component.LEFT_ALIGNMENT);
    this.setAlignmentY(Component.CENTER_ALIGNMENT);
  }
  setUIProperty(propertyName: string, value: any): void {
    if (propertyName === 'borderPainted') {
      if (!this.borderPaintedSet) {
        this.setBorderPainted((value));
        this.borderPaintedSet = false;
      }
    } else if (propertyName === 'rolloverEnabled') {
      if (!this.rolloverEnabledSet) {
        this.setRolloverEnabled((value));
        this.rolloverEnabledSet = false;
      }
    } else if (propertyName === 'iconTextGap') {
      if (!this.iconTextGapSet) {
        this.setIconTextGap($J.d2i(+(value)));
        this.iconTextGapSet = false;
      }
    } else if (propertyName === 'contentAreaFilled') {
      if (!this.contentAreaFilledSet) {
        this.setContentAreaFilled((value));
        this.contentAreaFilledSet = false;
      }
    } else {
      super.setUIProperty(propertyName, value);
    }
  }
  /**
   * Returns a string representation of this <code>AbstractButton</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   * <P>
   * Overriding <code>paramString</code> to provide information about the
   * specific new aspects of the JFC components.
   *
   * @return  a string representation of this <code>AbstractButton</code>
   */
  paramString(): string {
    let defaultIconString = ((this.defaultIcon != null) && (this.defaultIcon !== this) ? this.defaultIcon.toString() : '');
    let pressedIconString = ((this.pressedIcon != null) && (this.pressedIcon !== this) ? this.pressedIcon.toString() : '');
    let disabledIconString = ((this.disabledIcon != null) && (this.disabledIcon !== this) ? this.disabledIcon.toString() : '');
    let selectedIconString = ((this.selectedIcon != null) && (this.selectedIcon !== this) ? this.selectedIcon.toString() : '');
    let disabledSelectedIconString = ((this.disabledSelectedIcon != null) && (this.disabledSelectedIcon !== this) ? this.disabledSelectedIcon.toString() : '');
    let rolloverIconString = ((this.rolloverIcon != null) && (this.rolloverIcon !== this) ? this.rolloverIcon.toString() : '');
    let rolloverSelectedIconString = ((this.rolloverSelectedIcon != null) && (this.rolloverSelectedIcon !== this) ? this.rolloverSelectedIcon.toString() : '');
    let paintBorderString = (this.paintBorder_ ? 'true' : 'false');
    let paintFocusString = (this.paintFocus_ ? 'true' : 'false');
    let rolloverEnabledString = (this.rolloverEnabled ? 'true' : 'false');
    return super.paramString() + ',defaultIcon=' + defaultIconString + ',disabledIcon=' + disabledIconString + ',disabledSelectedIcon=' + disabledSelectedIconString + ',margin=' + $J.str(this.margin) + ',paintBorder=' + paintBorderString + ',paintFocus=' + paintFocusString + ',pressedIcon=' + pressedIconString + ',rolloverEnabled=' + rolloverEnabledString + ',rolloverIcon=' + rolloverIconString + ',rolloverSelectedIcon=' + rolloverSelectedIconString + ',selectedIcon=' + selectedIconString + ',text=' + this.text_;
  }
  getHandler(): AbstractButton$Handler {
    if (this.handler == null) {
      this.handler = new AbstractButton$Handler().$o(this)._AbstractButton$Handler();
    }
    return this.handler;
  }
}

export class AbstractButton$ButtonActionPropertyChangeListener extends ActionPropertyChangeListener {
  _AbstractButton$ButtonActionPropertyChangeListener(b: AbstractButton, a: Action): this {
    this._ActionPropertyChangeListener(b, a);
    return this;
  }
  actionPropertyChanged(button: AbstractButton, action: Action, e: PropertyChangeEvent): void {
    if (AbstractAction.shouldReconfigure(e)) {
      button.configurePropertiesFromAction(action);
    } else {
      button.actionPropertyChanged(action, e.getPropertyName());
    }
  }
}

export class AbstractButton$Handler extends JObject {
  _AbstractButton$Handler(): this {
    return this;
  }
  stateChanged(e: ChangeEvent): void {
    let source = e.getSource();
    this.$outer.updateMnemonicProperties();
    if (this.$outer.isEnabled() !== this.$outer.model.isEnabled()) {
      this.$outer.setEnabled(this.$outer.model.isEnabled());
    }
    this.$outer.fireStateChanged();
    this.$outer.repaint$();
  }
  actionPerformed(event: ActionEvent): void {
    this.$outer.fireActionPerformed(event);
  }
  itemStateChanged(event: ItemEvent): void {
    this.$outer.fireItemStateChanged(event);
    if (this.$outer.shouldUpdateSelectedStateFromAction()) {
      let action = this.$outer.getAction();
      if (action != null && AbstractAction.hasSelectedKey(action)) {
        let selected = this.$outer.isSelected();
        let isActionSelected = AbstractAction.isSelected(action);
        if (isActionSelected !== selected) {
          action.putValue(Action.SELECTED_KEY, selected);
        }
      }
    }
  }
}

/**
 * This class implements accessibility support for the
 * <code>AbstractButton</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to button and menu item
 * user-interface elements.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 * @since 1.4
 */
export class AbstractButton$AccessibleAbstractButton extends JComponent$AccessibleJComponent {
  /**
   * Constructor for subclasses to call.
   */
  _AbstractButton$AccessibleAbstractButton(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
  /**
   * Returns the accessible name of this object.
   *
   * @return the localized name of the object -- can be
   *              <code>null</code> if this
   *              object does not have a name
   */
  getAccessibleName(): string {
    let name = this.accessibleName;
    if (name == null) {
      name = this.$outer.getClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY);
    }
    if (name == null) {
      name = this.$outer.getText();
    }
    if (name == null) {
      name = super.getAccessibleName();
    }
    return name;
  }
  /**
   * Get the AccessibleRelationSet associated with this object if one
   * exists.  Otherwise return null.
   * @see AccessibleRelation
   * @since 1.3
   */
  getAccessibleRelationSet(): AccessibleRelationSet {
    let relationSet = super.getAccessibleRelationSet();
    var defaultModel;
    if (!relationSet.contains(AccessibleRelation.MEMBER_OF)) {
      let model = this.$outer.getModel();
      var defaultModel;
      if ((defaultModel = model) instanceof DefaultButtonModel) {
        let group = defaultModel.getGroup();
        if (group != null) {
          let len = group.getButtonCount();
          let target = $J.newArray(len, null);
          let elem = group.getElements();
          for (let i = 0; i < len; i++) {
            if (elem.hasMoreElements()) {
              target[i] = elem.nextElement();
            }
          }
          let relation = new AccessibleRelation()._AccessibleRelation$String(AccessibleRelation.MEMBER_OF);
          relation.setTarget$ObjectArr(target);
          relationSet.add(relation);
        }
      }
    }
    return relationSet;
  }
  /**
   * Returns the tool tip text
   *
   * @return the tool tip text, if supported, of the object;
   * otherwise, null
   * @since 1.4
   */
  getToolTipText(): string {
    return this.$outer.getToolTipText$();
  }
}

$J.define(AbstractButton, 'javax.swing.AbstractButton', { kind: 'class', ifaces: ['java.awt.ItemSelectable', 'javax.swing.SwingConstants'], sup: 'javax.swing.JComponent', ctors: { '': '_AbstractButton' }, meths: { 'setUI(javax.swing.plaf.ButtonUI)': 'setUI$ButtonUI', 'setMnemonic(char)': 'setMnemonic$char', 'setMnemonic(int)': 'setMnemonic$int', 'doClick(int)': 'doClick$int', 'doClick()': 'doClick$' } });
$J.define(AbstractButton$ButtonActionPropertyChangeListener, 'javax.swing.AbstractButton$ButtonActionPropertyChangeListener', { kind: 'class', sup: 'javax.swing.ActionPropertyChangeListener', ctors: { 'javax.swing.AbstractButton,javax.swing.Action': '_AbstractButton$ButtonActionPropertyChangeListener' } });
$J.define(AbstractButton$Handler, 'javax.swing.AbstractButton$Handler', { kind: 'class', ifaces: ['java.awt.event.ActionListener', 'javax.swing.event.ChangeListener', 'java.awt.event.ItemListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_AbstractButton$Handler' }, inner: true });
$J.define(AbstractButton$AccessibleAbstractButton, 'javax.swing.AbstractButton$AccessibleAbstractButton', { kind: 'class', ifaces: ['javax.accessibility.AccessibleAction', 'javax.accessibility.AccessibleValue', 'javax.accessibility.AccessibleText', 'javax.accessibility.AccessibleExtendedComponent'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_AbstractButton$AccessibleAbstractButton' }, meths: { 'getAtIndex(int,int)': 'getAtIndex$int$int', 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  Rectangle = $J.load('java.awt.Rectangle');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  ActionListener = $J.load('java.awt.event.ActionListener');
  ItemEvent = $J.load('java.awt.event.ItemEvent');
  ItemListener = $J.load('java.awt.event.ItemListener');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  AccessibleRelation = $J.load('javax.accessibility.AccessibleRelation');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  Action = $J.load('javax.swing.Action');
  DefaultButtonModel = $J.load('javax.swing.DefaultButtonModel');
  OverlayLayout = $J.load('javax.swing.OverlayLayout');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
  UIResource = $J.load('javax.swing.plaf.UIResource');
});
