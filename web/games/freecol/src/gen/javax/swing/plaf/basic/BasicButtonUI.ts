// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicButtonUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, HashSet, JObject, JString } from '../../../../../jre/index.ts';
import { ButtonUI } from '../ButtonUI.ts';
import { AbstractAction } from '../../AbstractAction.ts';

let AWTKeyStroke, Component$BaselineResizeBehavior, KeyboardFocusManager, Rectangle, DefaultButtonModel, JComponent, JRadioButton, JToggleButton, KeyStroke, LookAndFeel, SwingConstants, SwingUtilities, UIManager, UIResource, BasicButtonListener, BasicGraphicsUtils, BasicHTML, View, SwingUtilities2;

/**
 * BasicButton implementation
 *
 * @author Jeff Dinkins
 */
export class BasicButtonUI extends ButtonUI {
  /**
   * The default gap between a text and an icon.
   */
  defaultTextIconGap: number = 0;
  shiftOffset: number = 0;
  /**
   * The default offset of a text.
   */
  defaultTextShiftOffset: number = 0;
  static readonly propertyPrefix: string = 'Button.';
  static BASIC_BUTTON_UI_KEY: any = null;
  keyListener: KeyListener = null;
  static viewRect: Rectangle = null;
  static textRect: Rectangle = null;
  static iconRect: Rectangle = null;
  /**
   * Constructs a {@code BasicButtonUI}.
   */
  _BasicButtonUI(): this {
    this._ButtonUI();
    this.shiftOffset = 0;
    this.keyListener = null;
    return this;
  }
  /**
   * Returns an instance of {@code BasicButtonUI}.
   *
   * @param c a component
   * @return an instance of {@code BasicButtonUI}
   */
  static createUI(c: JComponent): ComponentUI {
    let appContext = AppContext.getAppContext();
    let buttonUI = appContext.get(BasicButtonUI.BASIC_BUTTON_UI_KEY);
    if (buttonUI == null) {
      buttonUI = new BasicButtonUI()._BasicButtonUI();
      appContext.put(BasicButtonUI.BASIC_BUTTON_UI_KEY, buttonUI);
    }
    return buttonUI;
  }
  /**
   * Returns the property prefix.
   *
   * @return the property prefix
   */
  getPropertyPrefix(): string {
    return BasicButtonUI.propertyPrefix;
  }
  installUI(c: JComponent): void {
    this.installDefaults(c);
    this.installListeners(c);
    this.installKeyboardActions(c);
    BasicHTML.updateRenderer(c, (c).getText());
  }
  /**
   * Installs default properties.
   *
   * @param b an abstract button
   */
  installDefaults(b: AbstractButton): void {
    let pp = this.getPropertyPrefix();
    this.defaultTextShiftOffset = UIManager.getInt$Object(pp + 'textShiftOffset');
    if (b.isContentAreaFilled()) {
      LookAndFeel.installProperty(b, 'opaque', true);
    } else {
      LookAndFeel.installProperty(b, 'opaque', false);
    }
    if (b.getMargin() == null || ($J.isa(b.getMargin(), UIResource))) {
      b.setMargin(UIManager.getInsets$Object(pp + 'margin'));
    }
    LookAndFeel.installColorsAndFont(b, pp + 'background', pp + 'foreground', pp + 'font');
    LookAndFeel.installBorder(b, pp + 'border');
    let rollover = UIManager.get$Object(pp + 'rollover');
    if (rollover != null) {
      LookAndFeel.installProperty(b, 'rolloverEnabled', rollover);
    }
    LookAndFeel.installProperty(b, 'iconTextGap', 4);
  }
  /**
   * Registers listeners.
   *
   * @param b an abstract button
   */
  installListeners(b: AbstractButton): void {
    let listener = this.createButtonListener(b);
    if (listener != null) {
      b.addMouseListener(listener);
      b.addMouseMotionListener(listener);
      b.addFocusListener(listener);
      b.addPropertyChangeListener$PropertyChangeListener($J.fn(listener, 'propertyChange'));
      b.addChangeListener($J.fn(listener, 'stateChanged'));
    }
    if (b instanceof JToggleButton) {
      this.keyListener = this.createKeyListener();
      b.addKeyListener(this.keyListener);
      b.setFocusTraversalKeysEnabled(false);
      b.getActionMap$().put$Object$Action('Previous', new BasicButtonUI$SelectPreviousBtn().$o(this)._BasicButtonUI$SelectPreviousBtn());
      b.getActionMap$().put$Object$Action('Next', new BasicButtonUI$SelectNextBtn().$o(this)._BasicButtonUI$SelectNextBtn());
      b.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).put(KeyStroke.getKeyStroke$String('UP'), 'Previous');
      b.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).put(KeyStroke.getKeyStroke$String('DOWN'), 'Next');
      b.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).put(KeyStroke.getKeyStroke$String('LEFT'), 'Previous');
      b.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).put(KeyStroke.getKeyStroke$String('RIGHT'), 'Next');
    }
  }
  /**
   * Registers keyboard actions.
   *
   * @param b an abstract button
   */
  installKeyboardActions(b: AbstractButton): void {
    let listener = this.getButtonListener(b);
    if (listener != null) {
      listener.installKeyboardActions(b);
    }
  }
  uninstallUI(c: JComponent): void {
    this.uninstallKeyboardActions(c);
    this.uninstallListeners(c);
    this.uninstallDefaults(c);
    BasicHTML.updateRenderer(c, '');
  }
  /**
   * Unregisters keyboard actions.
   *
   * @param b an abstract button
   */
  uninstallKeyboardActions(b: AbstractButton): void {
    let listener = this.getButtonListener(b);
    if (listener != null) {
      listener.uninstallKeyboardActions(b);
    }
  }
  /**
   * Unregisters listeners.
   *
   * @param b an abstract button
   */
  uninstallListeners(b: AbstractButton): void {
    let listener = this.getButtonListener(b);
    if (listener != null) {
      b.removeMouseListener(listener);
      b.removeMouseMotionListener(listener);
      b.removeFocusListener(listener);
      b.removeChangeListener($J.fn(listener, 'stateChanged'));
      b.removePropertyChangeListener$PropertyChangeListener($J.fn(listener, 'propertyChange'));
    }
    if (b instanceof JToggleButton) {
      b.getActionMap$().remove('Previous');
      b.getActionMap$().remove('Next');
      b.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).remove(KeyStroke.getKeyStroke$String('UP'));
      b.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).remove(KeyStroke.getKeyStroke$String('DOWN'));
      b.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).remove(KeyStroke.getKeyStroke$String('LEFT'));
      b.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).remove(KeyStroke.getKeyStroke$String('RIGHT'));
      if (this.keyListener != null) {
        b.removeKeyListener(this.keyListener);
        this.keyListener = null;
      }
    }
  }
  /**
   * Uninstalls default properties.
   *
   * @param b an abstract button
   */
  uninstallDefaults(b: AbstractButton): void {
    LookAndFeel.uninstallBorder(b);
  }
  /**
   * Returns a new instance of {@code BasicButtonListener}.
   *
   * @param b an abstract button
   * @return a new instance of {@code BasicButtonListener}
   */
  createButtonListener(b: AbstractButton): BasicButtonListener {
    return new BasicButtonListener()._BasicButtonListener(b);
  }
  paint(g: Graphics, c: JComponent): void {
    let b = c;
    let model = b.getModel();
    let text = this.layout(b, SwingUtilities2.getFontMetrics$JComponent$Graphics(b, g), b.getWidth(), b.getHeight());
    this.clearTextShiftOffset();
    if (model.isArmed() && model.isPressed()) {
      this.paintButtonPressed(g, b);
    }
    if (b.getIcon() != null) {
      this.paintIcon$Graphics$JComponent$Rectangle(g, c, BasicButtonUI.iconRect);
    }
    if (text != null && !(text.length === 0)) {
      let v = c.getClientProperty(BasicHTML.propertyKey);
      if (v != null) {
        v.paint(g, BasicButtonUI.textRect);
      } else {
        this.paintText$Graphics$AbstractButton$Rectangle$String(g, b, BasicButtonUI.textRect, text);
      }
    }
    if (b.isFocusPainted() && b.hasFocus()) {
      this.paintFocus$Graphics$AbstractButton$Rectangle$Rectangle$Rectangle(g, b, BasicButtonUI.viewRect, BasicButtonUI.textRect, BasicButtonUI.iconRect);
    }
  }
  /**
   * Paints an icon of the current button.
   *
   * @param g an instance of {@code Graphics}
   * @param c a component
   * @param iconRect a bounding rectangle to render the icon
   */
  paintIcon$Graphics$JComponent$Rectangle(g: Graphics, c: JComponent, iconRect: Rectangle): void {
    let b = c;
    let model = b.getModel();
    let icon = b.getIcon();
    let tmpIcon = null;
    if (icon == null) {
      return;
    }
    let selectedIcon = null;
    if (model.isSelected()) {
      selectedIcon = b.getSelectedIcon();
      if (selectedIcon != null) {
        icon = selectedIcon;
      }
    }
    if (!model.isEnabled()) {
      if (model.isSelected()) {
        tmpIcon = b.getDisabledSelectedIcon();
        if (tmpIcon == null) {
          tmpIcon = selectedIcon;
        }
      }
      if (tmpIcon == null) {
        tmpIcon = b.getDisabledIcon();
      }
    } else if (model.isPressed() && model.isArmed()) {
      tmpIcon = b.getPressedIcon();
      if (tmpIcon != null) {
        this.clearTextShiftOffset();
      }
    } else if (b.isRolloverEnabled() && model.isRollover()) {
      if (model.isSelected()) {
        tmpIcon = b.getRolloverSelectedIcon();
        if (tmpIcon == null) {
          tmpIcon = selectedIcon;
        }
      }
      if (tmpIcon == null) {
        tmpIcon = b.getRolloverIcon();
      }
    }
    if (tmpIcon != null) {
      icon = tmpIcon;
    }
    if (model.isPressed() && model.isArmed()) {
      icon.paintIcon(c, g, (iconRect.x_ + this.getTextShiftOffset()) | 0, (iconRect.y_ + this.getTextShiftOffset()) | 0);
    } else {
      icon.paintIcon(c, g, iconRect.x_, iconRect.y_);
    }
  }
  /**
   * Method which renders the text of the current button.
   *
   * As of Java 2 platform v 1.4 this method should not be used or overridden.
   * Use the paintText method which takes the AbstractButton argument.
   *
   * @param g an instance of {@code Graphics}
   * @param c a component
   * @param textRect a bounding rectangle to render the text
   * @param text a string to render
   */
  paintText$Graphics$JComponent$Rectangle$String(g: Graphics, c: JComponent, textRect: Rectangle, text: string): void {
    let b = c;
    let model = b.getModel();
    let fm = SwingUtilities2.getFontMetrics$JComponent$Graphics(c, g);
    let mnemonicIndex = b.getDisplayedMnemonicIndex();
    if (model.isEnabled()) {
      g.setColor(b.getForeground());
      SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(c, g, text, mnemonicIndex, (textRect.x_ + this.getTextShiftOffset()) | 0, (textRect.y_ + fm.getAscent() + this.getTextShiftOffset()) | 0);
    } else {
      g.setColor(b.getBackground().brighter());
      SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(c, g, text, mnemonicIndex, textRect.x_, (textRect.y_ + fm.getAscent()) | 0);
      g.setColor(b.getBackground().darker());
      SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(c, g, text, mnemonicIndex, (textRect.x_ - 1) | 0, (textRect.y_ + fm.getAscent() - 1) | 0);
    }
  }
  /**
   * Method which renders the text of the current button.
   *
   * @param g Graphics context
   * @param b Current button to render
   * @param textRect Bounding rectangle to render the text
   * @param text String to render
   * @since 1.4
   */
  paintText$Graphics$AbstractButton$Rectangle$String(g: Graphics, b: AbstractButton, textRect: Rectangle, text: string): void {
    this.paintText$Graphics$JComponent$Rectangle$String(g, b, textRect, text);
  }
  /**
   * Paints a focused button.
   *
   * @param g an instance of {@code Graphics}
   * @param b an abstract button
   * @param viewRect a bounding rectangle to render the button
   * @param textRect a bounding rectangle to render the text
   * @param iconRect a bounding rectangle to render the icon
   */
  paintFocus$Graphics$AbstractButton$Rectangle$Rectangle$Rectangle(g: Graphics, b: AbstractButton, viewRect: Rectangle, textRect: Rectangle, iconRect: Rectangle): void {
  }
  /**
   * Paints a pressed button.
   *
   * @param g an instance of {@code Graphics}
   * @param b an abstract button
   */
  paintButtonPressed(g: Graphics, b: AbstractButton): void {
  }
  /**
   * Clears the offset of the text.
   */
  clearTextShiftOffset(): void {
    this.shiftOffset = 0;
  }
  /**
   * Returns the offset of the text.
   *
   * @return the offset of the text
   */
  getTextShiftOffset(): number {
    return this.shiftOffset;
  }
  getMinimumSize(c: JComponent): Dimension {
    let d = this.getPreferredSize$JComponent(c);
    let v = c.getClientProperty(BasicHTML.propertyKey);
    if (v != null) {
      d.width_ = $J.d2i(Math.fround(d.width_ - Math.fround(v.getPreferredSpan(View.X_AXIS) - v.getMinimumSpan(View.X_AXIS))));
    }
    return d;
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    let b = c;
    return BasicGraphicsUtils.getPreferredButtonSize(b, b.getIconTextGap());
  }
  getMaximumSize(c: JComponent): Dimension {
    let d = this.getPreferredSize$JComponent(c);
    let v = c.getClientProperty(BasicHTML.propertyKey);
    if (v != null) {
      d.width_ = $J.d2i(Math.fround(d.width_ + Math.fround(v.getMaximumSpan(View.X_AXIS) - v.getPreferredSpan(View.X_AXIS))));
    }
    return d;
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
    let b = c;
    let text = b.getText();
    if (text == null || (text.length === 0)) {
      return -1;
    }
    let fm = b.getFontMetrics(b.getFont());
    this.layout(b, fm, width, height);
    return BasicHTML.getBaseline$JComponent$int$int$int$int(b, BasicButtonUI.textRect.y_, fm.getAscent(), BasicButtonUI.textRect.width_, BasicButtonUI.textRect.height_);
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
    if (c.getClientProperty(BasicHTML.propertyKey) != null) {
      return Component$BaselineResizeBehavior.OTHER;
    }
    switch ((c).getVerticalAlignment()) {
      case SwingConstants.TOP:
        return Component$BaselineResizeBehavior.CONSTANT_ASCENT;
      case SwingConstants.BOTTOM:
        return Component$BaselineResizeBehavior.CONSTANT_DESCENT;
      case SwingConstants.CENTER:
        return Component$BaselineResizeBehavior.CENTER_OFFSET;
    }
    return Component$BaselineResizeBehavior.OTHER;
  }
  layout(b: AbstractButton, fm: FontMetrics, width: number, height: number): string {
    let i = b.getInsets$();
    BasicButtonUI.viewRect.x_ = i.left;
    BasicButtonUI.viewRect.y_ = i.top;
    BasicButtonUI.viewRect.width_ = (width - (i.right + BasicButtonUI.viewRect.x_)) | 0;
    BasicButtonUI.viewRect.height_ = (height - (i.bottom + BasicButtonUI.viewRect.y_)) | 0;
    BasicButtonUI.textRect.x_ = BasicButtonUI.textRect.y_ = BasicButtonUI.textRect.width_ = BasicButtonUI.textRect.height_ = 0;
    BasicButtonUI.iconRect.x_ = BasicButtonUI.iconRect.y_ = BasicButtonUI.iconRect.width_ = BasicButtonUI.iconRect.height_ = 0;
    return SwingUtilities.layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(b, fm, b.getText(), b.getIcon(), b.getVerticalAlignment(), b.getHorizontalAlignment(), b.getVerticalTextPosition(), b.getHorizontalTextPosition(), BasicButtonUI.viewRect, BasicButtonUI.iconRect, BasicButtonUI.textRect, b.getText() == null ? 0 : b.getIconTextGap());
  }
  /**
   * Returns the ButtonListener for the passed in Button, or null if one
   * could not be found.
   */
  getButtonListener(b: AbstractButton): BasicButtonListener {
    let listeners = b.getMouseMotionListeners();
    if (listeners != null) {
      for (let listener of listeners) {
        if (listener instanceof BasicButtonListener) {
          return listener;
        }
      }
    }
    return null;
  }
  /**
   * Creates the key listener to handle tab navigation in JToggleButton Group.
   */
  createKeyListener(): KeyListener {
    if (this.keyListener == null) {
      this.keyListener = new BasicButtonUI$KeyHandler().$o(this)._BasicButtonUI$KeyHandler();
    }
    return this.keyListener;
  }
  isValidToggleButtonObj(obj: any): boolean {
    return ((obj instanceof JToggleButton) && (obj).isVisible$() && (obj).isEnabled());
  }
  /**
   * Select toggle button based on "Previous" or "Next" operation
   *
   * @param event, the event object.
   * @param next, indicate if it's next one
   */
  selectToggleButton(event: ActionEvent, next: boolean): void {
    let eventSrc = event.getSource();
    if (!this.isValidToggleButtonObj(eventSrc)) {
      return;
    }
    let btnGroupInfo = new BasicButtonUI$ButtonGroupInfo().$o(this)._BasicButtonUI$ButtonGroupInfo(eventSrc);
    btnGroupInfo.selectNewButton(next);
  }
  static $clinit() {
    BasicButtonUI.BASIC_BUTTON_UI_KEY = new JObject();
    BasicButtonUI.viewRect = new Rectangle()._Rectangle$();
    BasicButtonUI.textRect = new Rectangle()._Rectangle$();
    BasicButtonUI.iconRect = new Rectangle()._Rectangle$();
  }
}

export class BasicButtonUI$SelectPreviousBtn extends AbstractAction {
  _BasicButtonUI$SelectPreviousBtn(): this {
    this._AbstractAction$String('Previous');
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    this.$outer.selectToggleButton(e, false);
  }
}

export class BasicButtonUI$SelectNextBtn extends AbstractAction {
  _BasicButtonUI$SelectNextBtn(): this {
    this._AbstractAction$String('Next');
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    this.$outer.selectToggleButton(e, true);
  }
}

/**
 * ButtonGroupInfo, used to get related info in button group
 * for given toggle button
 */
export class BasicButtonUI$ButtonGroupInfo extends JObject {
  activeBtn: JToggleButton = null;
  firstBtn: JToggleButton = null;
  lastBtn: JToggleButton = null;
  previousBtn: JToggleButton = null;
  nextBtn: JToggleButton = null;
  btnsInGroup: HashSet<JToggleButton> = null;
  srcFound: boolean = false;
  _BasicButtonUI$ButtonGroupInfo(btn: JToggleButton): this {
    this.activeBtn = null;
    this.firstBtn = null;
    this.lastBtn = null;
    this.previousBtn = null;
    this.nextBtn = null;
    this.btnsInGroup = null;
    this.srcFound = false;
    this.activeBtn = btn;
    this.btnsInGroup = new HashSet();
    return this;
  }
  getFocusTransferBaseComponent(next: boolean): Component {
    return this.firstBtn;
  }
  getButtonGroupInfo(): boolean {
    if (this.activeBtn == null) {
      return false;
    }
    this.btnsInGroup.clear();
    let model = this.activeBtn.getModel();
    if (!(model instanceof DefaultButtonModel)) {
      return false;
    }
    let bm = model;
    let group = bm.getGroup();
    if (group == null) {
      return false;
    }
    let e = group.getElements();
    if (e == null) {
      return false;
    }
    while (e.hasMoreElements()) {
      let curElement = e.nextElement();
      if (!this.$outer.isValidToggleButtonObj(curElement)) {
        continue;
      }
      this.btnsInGroup.add(curElement);
      if (null == this.firstBtn) {
        this.firstBtn = curElement;
      }
      if (this.activeBtn === curElement) {
        this.srcFound = true;
      } else if (!this.srcFound) {
        this.previousBtn = curElement;
      } else if (this.nextBtn == null) {
        this.nextBtn = curElement;
      }
      this.lastBtn = curElement;
    }
    return true;
  }
  /**
   * Find the new toggle/radio button that focus needs to be
   * moved to in the group, select the button
   * In case of radio button, setPressed and setArmed is called
   * on the button model, so that Action set on button is performed
   * on selecting the button
   *
   * @param next, indicate if it's arrow up/left or down/right
   */
  selectNewButton(next: boolean): void {
    if (!this.getButtonGroupInfo()) {
      return;
    }
    if (this.srcFound) {
      let newSelectedBtn = null;
      if (next) {
        newSelectedBtn = (null == this.nextBtn) ? this.firstBtn : this.nextBtn;
      } else {
        newSelectedBtn = (null == this.previousBtn) ? this.lastBtn : this.previousBtn;
      }
      if (newSelectedBtn != null && (newSelectedBtn !== this.activeBtn)) {
        let btnModel = newSelectedBtn.getModel();
        if (newSelectedBtn instanceof JRadioButton) {
          btnModel.setPressed(true);
          btnModel.setArmed(true);
        }
        newSelectedBtn.requestFocusInWindow$();
        newSelectedBtn.setSelected(true);
        if (newSelectedBtn instanceof JRadioButton) {
          btnModel.setPressed(false);
          btnModel.setArmed(false);
        }
      }
    }
  }
  /**
   * Find the button group the passed in JToggleButton belongs to, and
   * move focus to next component of the last button in the group
   * or previous component of first button
   *
   * @param next, indicate if jump to next component or previous
   */
  jumpToNextComponent(next: boolean): void {
    if (!this.getButtonGroupInfo()) {
      if (this.activeBtn != null) {
        this.lastBtn = this.activeBtn;
        this.firstBtn = this.activeBtn;
      } else {
        return;
      }
    }
    let compTransferFocusFrom = this.activeBtn;
    let focusBase = this.getFocusTransferBaseComponent(next);
    if (focusBase != null) {
      if (next) {
        KeyboardFocusManager.getCurrentKeyboardFocusManager$().focusNextComponent$Component(focusBase);
      } else {
        KeyboardFocusManager.getCurrentKeyboardFocusManager$().focusPreviousComponent$Component(focusBase);
      }
    }
  }
}

/**
 * Togglebutton KeyListener
 */
export class BasicButtonUI$KeyHandler extends JObject {
  _BasicButtonUI$KeyHandler(): this {
    return this;
  }
  keyPressed(e: KeyEvent): void {
    let stroke = AWTKeyStroke.getAWTKeyStrokeForEvent(e);
    if (stroke != null && e.getSource() instanceof JToggleButton) {
      let source = e.getSource();
      let next = this.isFocusTraversalKey(source, KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS, stroke);
      if (next || this.isFocusTraversalKey(source, KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS, stroke)) {
        e.consume();
        let btnGroupInfo = new BasicButtonUI$ButtonGroupInfo().$o(this.$outer)._BasicButtonUI$ButtonGroupInfo(source);
        btnGroupInfo.jumpToNextComponent(next);
      }
    }
  }
  isFocusTraversalKey(c: JComponent, id: number, stroke: AWTKeyStroke): boolean {
    let keys = c.getFocusTraversalKeys(id);
    return keys != null && keys.contains(stroke);
  }
  keyReleased(e: KeyEvent): void {
  }
  keyTyped(e: KeyEvent): void {
  }
}

$J.define(BasicButtonUI, 'javax.swing.plaf.basic.BasicButtonUI', { kind: 'class', sup: 'javax.swing.plaf.ButtonUI', ctors: { '': '_BasicButtonUI' }, meths: { 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent', 'paintFocus(java.awt.Graphics,javax.swing.AbstractButton,java.awt.Rectangle,java.awt.Rectangle,java.awt.Rectangle)': 'paintFocus$Graphics$AbstractButton$Rectangle$Rectangle$Rectangle', 'paintText(java.awt.Graphics,javax.swing.AbstractButton,java.awt.Rectangle,java.lang.String)': 'paintText$Graphics$AbstractButton$Rectangle$String', 'paintText(java.awt.Graphics,javax.swing.JComponent,java.awt.Rectangle,java.lang.String)': 'paintText$Graphics$JComponent$Rectangle$String', 'paintIcon(java.awt.Graphics,javax.swing.JComponent,java.awt.Rectangle)': 'paintIcon$Graphics$JComponent$Rectangle' }, clinit: true, lazy: ['BASIC_BUTTON_UI_KEY', 'viewRect', 'textRect', 'iconRect'] });
$J.define(BasicButtonUI$SelectPreviousBtn, 'javax.swing.plaf.basic.BasicButtonUI$SelectPreviousBtn', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicButtonUI$SelectPreviousBtn' }, inner: true });
$J.define(BasicButtonUI$SelectNextBtn, 'javax.swing.plaf.basic.BasicButtonUI$SelectNextBtn', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicButtonUI$SelectNextBtn' }, inner: true });
$J.define(BasicButtonUI$ButtonGroupInfo, 'javax.swing.plaf.basic.BasicButtonUI$ButtonGroupInfo', { kind: 'class', sup: 'java.lang.Object', ctors: { 'javax.swing.JToggleButton': '_BasicButtonUI$ButtonGroupInfo' }, inner: true });
$J.define(BasicButtonUI$KeyHandler, 'javax.swing.plaf.basic.BasicButtonUI$KeyHandler', { kind: 'class', ifaces: ['java.awt.event.KeyListener'], sup: 'java.lang.Object', ctors: { '': '_BasicButtonUI$KeyHandler' }, inner: true });
$J.module(() => {
  AWTKeyStroke = $J.load('java.awt.AWTKeyStroke');
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Rectangle = $J.load('java.awt.Rectangle');
  DefaultButtonModel = $J.load('javax.swing.DefaultButtonModel');
  JComponent = $J.load('javax.swing.JComponent');
  JRadioButton = $J.load('javax.swing.JRadioButton');
  JToggleButton = $J.load('javax.swing.JToggleButton');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicButtonListener = $J.load('javax.swing.plaf.basic.BasicButtonListener');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  View = $J.load('javax.swing.text.View');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
