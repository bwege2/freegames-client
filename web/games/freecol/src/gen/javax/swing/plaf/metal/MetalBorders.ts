// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalBorders.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Integer, JObject, Region } from '../../../../../jre/index.ts';
import { AbstractBorder } from '../../border/AbstractBorder.ts';
import { EmptyBorder } from '../../border/EmptyBorder.ts';

let SwingUtilities3, BasicStroke, Dialog, Frame, Graphics2D, Insets, AbstractButton, JButton, JInternalFrame, JMenu, JMenuBar, JMenuItem, JOptionPane, JScrollPane, JToolBar, SwingConstants, SwingUtilities, UIManager, CompoundBorder, LineBorder, MatteBorder, BorderUIResource$CompoundBorderUIResource, UIResource, BasicBorders$MarginBorder, MetalBumps, MetalLookAndFeel, MetalToolBarUI, MetalUtils, JTextComponent, StringUIClientPropertyKey, SwingUtilities2;

/**
 * Factory object that can vend Borders appropriate for the metal L &amp; F.
 * @author Steve Wilson
 */
export class MetalBorders extends JObject {
  /**
   * Client property indicating the button shouldn't provide a rollover
   * indicator. Only used with the Ocean theme.
   */
  static NO_BUTTON_ROLLOVER: any = null;
  static buttonBorder: Border = null;
  static textBorder: Border = null;
  static textFieldBorder: Border = null;
  static toggleButtonBorder: Border = null;
  /**
   * Returns a border instance for a {@code JButton}.
   *
   * @return a border instance for a {@code JButton}
   * @since 1.3
   */
  static getButtonBorder(): Border {
    if (MetalBorders.buttonBorder == null) {
      MetalBorders.buttonBorder = new BorderUIResource$CompoundBorderUIResource()._BorderUIResource$CompoundBorderUIResource(new MetalBorders$ButtonBorder()._MetalBorders$ButtonBorder(), new BasicBorders$MarginBorder()._BasicBorders$MarginBorder());
    }
    return MetalBorders.buttonBorder;
  }
  /**
   * Returns a border instance for a {@code JTextField}.
   *
   * @return a border instance for a {@code JTextField}
   * @since 1.3
   */
  static getTextFieldBorder(): Border {
    if (MetalBorders.textFieldBorder == null) {
      MetalBorders.textFieldBorder = new BorderUIResource$CompoundBorderUIResource()._BorderUIResource$CompoundBorderUIResource(new MetalBorders$TextFieldBorder()._MetalBorders$TextFieldBorder(), new BasicBorders$MarginBorder()._BasicBorders$MarginBorder());
    }
    return MetalBorders.textFieldBorder;
  }
  /**
   * Returns a border instance for a {@code JToggleButton}.
   *
   * @return a border instance for a {@code JToggleButton}
   * @since 1.3
   */
  static getToggleButtonBorder(): Border {
    if (MetalBorders.toggleButtonBorder == null) {
      MetalBorders.toggleButtonBorder = new BorderUIResource$CompoundBorderUIResource()._BorderUIResource$CompoundBorderUIResource(new MetalBorders$ToggleButtonBorder()._MetalBorders$ToggleButtonBorder(), new BasicBorders$MarginBorder()._BasicBorders$MarginBorder());
    }
    return MetalBorders.toggleButtonBorder;
  }
  /**
   * Returns a border instance for a Desktop Icon.
   *
   * @return a border instance for a Desktop Icon
   * @since 1.3
   */
  static getDesktopIconBorder(): Border {
    return new BorderUIResource$CompoundBorderUIResource()._BorderUIResource$CompoundBorderUIResource(new LineBorder()._LineBorder$Color$int(MetalLookAndFeel.getControlDarkShadow(), 1), new MatteBorder()._MatteBorder$int$int$int$int$Color(2, 2, 1, 2, MetalLookAndFeel.getControl()));
  }
  static getToolBarRolloverBorder(): Border {
    if (MetalLookAndFeel.usingOcean()) {
      return new CompoundBorder()._CompoundBorder$Border$Border(new MetalBorders$ButtonBorder()._MetalBorders$ButtonBorder(), new MetalBorders$RolloverMarginBorder()._MetalBorders$RolloverMarginBorder());
    }
    return new CompoundBorder()._CompoundBorder$Border$Border(new MetalBorders$RolloverButtonBorder()._MetalBorders$RolloverButtonBorder(), new MetalBorders$RolloverMarginBorder()._MetalBorders$RolloverMarginBorder());
  }
  static getToolBarNonrolloverBorder(): Border {
    if (MetalLookAndFeel.usingOcean()) {
      new CompoundBorder()._CompoundBorder$Border$Border(new MetalBorders$ButtonBorder()._MetalBorders$ButtonBorder(), new MetalBorders$RolloverMarginBorder()._MetalBorders$RolloverMarginBorder());
    }
    return new CompoundBorder()._CompoundBorder$Border$Border(new MetalBorders$ButtonBorder()._MetalBorders$ButtonBorder(), new MetalBorders$RolloverMarginBorder()._MetalBorders$RolloverMarginBorder());
  }
  static $clinit() {
    MetalBorders.NO_BUTTON_ROLLOVER = new StringUIClientPropertyKey()._StringUIClientPropertyKey('NoButtonRollover');
  }
}

/**
 * The class represents the 3D border.
 */
export class MetalBorders$Flush3DBorder extends AbstractBorder {
  /**
   * Constructs a {@code Flush3DBorder}.
   */
  _MetalBorders$Flush3DBorder(): this {
    this._AbstractBorder();
    return this;
  }
  getBorderInsets$Component$Insets(c: Component, newInsets: Insets): Insets {
    newInsets.set(2, 2, 2, 2);
    return newInsets;
  }
}

/**
 * The class represents the border of a {@code JButton}.
 */
export class MetalBorders$ButtonBorder extends AbstractBorder {
  /**
   * The border insets.
   */
  static borderInsets: Insets = null;
  /**
   * Constructs a {@code ButtonBorder}.
   */
  _MetalBorders$ButtonBorder(): this {
    this._AbstractBorder();
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    if (!(c instanceof AbstractButton)) {
      return;
    }
    if (MetalLookAndFeel.usingOcean()) {
      this.paintOceanBorder(c, g, x, y, w, h);
      return;
    }
    let button = c;
    let model = button.getModel();
    if (model.isEnabled()) {
      let isPressed = model.isPressed() && model.isArmed();
      let isDefault = (button instanceof JButton && (button).isDefaultButton());
      if (isPressed && isDefault) {
        MetalUtils.drawDefaultButtonPressedBorder(g, x, y, w, h);
      } else if (isPressed) {
        MetalUtils.drawPressed3DBorder$Graphics$int$int$int$int(g, x, y, w, h);
      } else if (isDefault) {
        MetalUtils.drawDefaultButtonBorder(g, x, y, w, h, false);
      } else {
        MetalUtils.drawButtonBorder(g, x, y, w, h, false);
      }
    } else {
      MetalUtils.drawDisabledBorder(g, x, y, (w - 1) | 0, (h - 1) | 0);
    }
  }
  paintOceanBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    let button = c;
    let model = (c).getModel();
    g.translate$int$int(x, y);
    if (MetalUtils.isToolBarButton(button)) {
      if (model.isEnabled()) {
        if (model.isPressed()) {
          g.setColor(MetalLookAndFeel.getWhite());
          g.fillRect(1, (h - 1) | 0, (w - 1) | 0, 1);
          g.fillRect((w - 1) | 0, 1, 1, (h - 1) | 0);
          g.setColor(MetalLookAndFeel.getControlDarkShadow());
          g.drawRect(0, 0, (w - 2) | 0, (h - 2) | 0);
          g.fillRect(1, 1, (w - 3) | 0, 1);
        } else if (model.isSelected() || model.isRollover()) {
          g.setColor(MetalLookAndFeel.getWhite());
          g.fillRect(1, (h - 1) | 0, (w - 1) | 0, 1);
          g.fillRect((w - 1) | 0, 1, 1, (h - 1) | 0);
          g.setColor(MetalLookAndFeel.getControlDarkShadow());
          g.drawRect(0, 0, (w - 2) | 0, (h - 2) | 0);
        } else {
          g.setColor(MetalLookAndFeel.getWhite());
          g.drawRect(1, 1, (w - 2) | 0, (h - 2) | 0);
          g.setColor(UIManager.getColor$Object('Button.toolBarBorderBackground'));
          g.drawRect(0, 0, (w - 2) | 0, (h - 2) | 0);
        }
      } else {
        g.setColor(UIManager.getColor$Object('Button.disabledToolBarBorderBackground'));
        g.drawRect(0, 0, (w - 2) | 0, (h - 2) | 0);
      }
    } else if (model.isEnabled()) {
      let pressed = model.isPressed();
      let armed = model.isArmed();
      if ((c instanceof JButton) && (c).isDefaultButton()) {
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
        g.drawRect(1, 1, (w - 3) | 0, (h - 3) | 0);
      } else if (pressed) {
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.fillRect(0, 0, w, 2);
        g.fillRect(0, 2, 2, (h - 2) | 0);
        g.fillRect((w - 1) | 0, 1, 1, (h - 1) | 0);
        g.fillRect(1, (h - 1) | 0, (w - 2) | 0, 1);
      } else if (model.isRollover() && button.getClientProperty(MetalBorders.NO_BUTTON_ROLLOVER) == null) {
        g.setColor(MetalLookAndFeel.getPrimaryControl());
        g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
        g.drawRect(2, 2, (w - 5) | 0, (h - 5) | 0);
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.drawRect(1, 1, (w - 3) | 0, (h - 3) | 0);
      } else {
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
      }
    } else {
      g.setColor(MetalLookAndFeel.getInactiveControlTextColor());
      g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
      if ((c instanceof JButton) && (c).isDefaultButton()) {
        g.drawRect(1, 1, (w - 3) | 0, (h - 3) | 0);
      }
    }
  }
  getBorderInsets$Component$Insets(c: Component, newInsets: Insets): Insets {
    newInsets.set(3, 3, 3, 3);
    return newInsets;
  }
  static $clinit() {
    MetalBorders$ButtonBorder.borderInsets = new Insets()._Insets(3, 3, 3, 3);
  }
}

export class MetalBorders$AbstractMetalWindowBorder extends AbstractBorder {
  background: Color = null;
  highlight: Color = null;
  shadow: Color = null;
  static readonly CORNER: number = 14;
  _MetalBorders$AbstractMetalWindowBorder(): this {
    this._AbstractBorder();
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    SwingUtilities3.paintBorder(c, g, x, y, w, h, ($p0, $p1, $p2, $p3, $p4) => this.paintUnscaledBorder($p0, $p1, $p2, $p3, $p4));
  }
  updateColors(c: Component): void {
    if (this.isActive(c)) {
      this.background = MetalLookAndFeel.getPrimaryControlDarkShadow();
      this.highlight = MetalLookAndFeel.getPrimaryControlShadow();
      this.shadow = MetalLookAndFeel.getPrimaryControlInfo();
    } else {
      this.background = MetalLookAndFeel.getControlDarkShadow();
      this.highlight = MetalLookAndFeel.getControlShadow();
      this.shadow = MetalLookAndFeel.getControlInfo();
    }
  }
  paintUnscaledBorder(c: Component, g: Graphics, width: number, height: number, scaleFactor: number): void {
    this.updateColors(c);
    let thickness = $J.d2i(Math.ceil(4 * scaleFactor));
    g.setColor(this.background);
    for (let i = 0; i <= thickness; i++) {
      g.drawRect(i, i, (width - (Math.imul(i, 2))) | 0, (height - (Math.imul(i, 2))) | 0);
    }
    if (this.isResizable(c)) {
      let midPoint = $J.idiv(thickness, 2);
      let strokeWidth = Region.clipRound(scaleFactor);
      let offset = (((scaleFactor - strokeWidth) >= 0) && ((strokeWidth % 2) !== 0)) ? 1 : 0;
      let loc1 = (thickness % 2 === 0) ? (midPoint + $J.idiv(strokeWidth, 2) - strokeWidth) | 0 : midPoint;
      let loc2 = (thickness % 2 === 0) ? (midPoint + $J.idiv(strokeWidth, 2)) | 0 : (midPoint + strokeWidth) | 0;
      let corner = ($J.round(MetalBorders$AbstractMetalWindowBorder.CORNER * scaleFactor)) | 0;
      if (g instanceof Graphics2D) {
        (g).setStroke(new BasicStroke()._BasicStroke$float(Math.fround(strokeWidth)));
      }
      g.setColor(this.highlight);
      g.drawLine((corner + 1) | 0, loc2, (width - corner) | 0, loc2);
      g.drawLine(loc2, (corner + 1) | 0, loc2, (height - corner) | 0);
      g.drawLine((width - offset - loc1) | 0, (corner + 1) | 0, (width - offset - loc1) | 0, (height - corner) | 0);
      g.drawLine((corner + 1) | 0, (height - offset - loc1) | 0, (width - corner) | 0, (height - offset - loc1) | 0);
      g.setColor(this.shadow);
      g.drawLine(corner, loc1, (width - corner - 1) | 0, loc1);
      g.drawLine(loc1, corner, loc1, (height - corner - 1) | 0);
      g.drawLine((width - offset - loc2) | 0, corner, (width - offset - loc2) | 0, (height - corner - 1) | 0);
      g.drawLine(corner, (height - offset - loc2) | 0, (width - corner - 1) | 0, (height - offset - loc2) | 0);
    }
  }
  getBorderInsets$Component$Insets(c: Component, newInsets: Insets): Insets {
    newInsets.set(4, 4, 4, 4);
    return newInsets;
  }
}

export class MetalBorders$InternalFrameBorderImpl extends MetalBorders$AbstractMetalWindowBorder {
  _MetalBorders$InternalFrameBorderImpl(): this {
    this._MetalBorders$AbstractMetalWindowBorder();
    return this;
  }
  isActive(c: Component): boolean {
    return (c instanceof JInternalFrame && (c).isSelected());
  }
  isResizable(c: Component): boolean {
    return ((c instanceof JInternalFrame && (c).isResizable()));
  }
}

/**
 * The class represents the border of a {@code JInternalFrame}.
 */
export class MetalBorders$InternalFrameBorder extends AbstractBorder {
  border: MetalBorders$InternalFrameBorderImpl = null;
  /**
   * Constructs a {@code InternalFrameBorder}.
   */
  _MetalBorders$InternalFrameBorder(): this {
    this._AbstractBorder();
    this.border = new MetalBorders$InternalFrameBorderImpl()._MetalBorders$InternalFrameBorderImpl();
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    this.border.paintBorder(c, g, x, y, w, h);
  }
  getBorderInsets$Component$Insets(c: Component, newInsets: Insets): Insets {
    return this.border.getBorderInsets$Component$Insets(c, newInsets);
  }
}

/**
 * Border for a Frame.
 * @since 1.4
 */
export class MetalBorders$FrameBorder extends MetalBorders$AbstractMetalWindowBorder {
  _MetalBorders$FrameBorder(): this {
    this._MetalBorders$AbstractMetalWindowBorder();
    return this;
  }
  isActive(c: Component): boolean {
    let window = SwingUtilities.getWindowAncestor(c);
    return (window != null && window.isActive());
  }
  isResizable(c: Component): boolean {
    let window = SwingUtilities.getWindowAncestor(c);
    return ((window instanceof Frame) && (window).isResizable());
  }
}

/**
 * Border for a Frame.
 * @since 1.4
 */
export class MetalBorders$DialogBorder extends MetalBorders$AbstractMetalWindowBorder {
  _MetalBorders$DialogBorder(): this {
    this._MetalBorders$AbstractMetalWindowBorder();
    return this;
  }
  getActiveBackground(): Color {
    return MetalLookAndFeel.getPrimaryControlDarkShadow();
  }
  getActiveHighlight(): Color {
    return MetalLookAndFeel.getPrimaryControlShadow();
  }
  getActiveShadow(): Color {
    return MetalLookAndFeel.getPrimaryControlInfo();
  }
  getInactiveBackground(): Color {
    return MetalLookAndFeel.getControlDarkShadow();
  }
  getInactiveHighlight(): Color {
    return MetalLookAndFeel.getControlShadow();
  }
  getInactiveShadow(): Color {
    return MetalLookAndFeel.getControlInfo();
  }
  updateColors(c: Component): void {
    if (this.isActive(c)) {
      this.background = this.getActiveBackground();
      this.highlight = this.getActiveHighlight();
      this.shadow = this.getActiveShadow();
    } else {
      this.background = this.getInactiveBackground();
      this.highlight = this.getInactiveHighlight();
      this.shadow = this.getInactiveShadow();
    }
  }
  isActive(c: Component): boolean {
    let window = SwingUtilities.getWindowAncestor(c);
    return (window != null && window.isActive());
  }
  isResizable(c: Component): boolean {
    let window = SwingUtilities.getWindowAncestor(c);
    return ((window instanceof Dialog) && (window).isResizable());
  }
}

/**
 * Border for an Error Dialog.
 * @since 1.4
 */
export class MetalBorders$ErrorDialogBorder extends MetalBorders$DialogBorder {
  _MetalBorders$ErrorDialogBorder(): this {
    this._MetalBorders$DialogBorder();
    return this;
  }
  getActiveBackground(): Color {
    return UIManager.getColor$Object('OptionPane.errorDialog.border.background');
  }
}

/**
 * Border for a QuestionDialog.  Also used for a JFileChooser and a
 * JColorChooser..
 * @since 1.4
 */
export class MetalBorders$QuestionDialogBorder extends MetalBorders$DialogBorder {
  _MetalBorders$QuestionDialogBorder(): this {
    this._MetalBorders$DialogBorder();
    return this;
  }
  getActiveBackground(): Color {
    return UIManager.getColor$Object('OptionPane.questionDialog.border.background');
  }
}

/**
 * Border for a Warning Dialog.
 * @since 1.4
 */
export class MetalBorders$WarningDialogBorder extends MetalBorders$DialogBorder {
  _MetalBorders$WarningDialogBorder(): this {
    this._MetalBorders$DialogBorder();
    return this;
  }
  getActiveBackground(): Color {
    return UIManager.getColor$Object('OptionPane.warningDialog.border.background');
  }
}

/**
 * Border for a Palette.
 * @since 1.3
 */
export class MetalBorders$PaletteBorder extends AbstractBorder {
  titleHeight: number = 0;
  /**
   * Constructs a {@code PaletteBorder}.
   */
  _MetalBorders$PaletteBorder(): this {
    this._AbstractBorder();
    this.titleHeight = 0;
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
    g.drawLine(0, 1, 0, (h - 2) | 0);
    g.drawLine(1, (h - 1) | 0, (w - 2) | 0, (h - 1) | 0);
    g.drawLine((w - 1) | 0, 1, (w - 1) | 0, (h - 2) | 0);
    g.drawLine(1, 0, (w - 2) | 0, 0);
    g.drawRect(1, 1, (w - 3) | 0, (h - 3) | 0);
    g.translate$int$int(-x, -y);
  }
  getBorderInsets$Component$Insets(c: Component, newInsets: Insets): Insets {
    newInsets.set(1, 1, 1, 1);
    return newInsets;
  }
}

/**
 * The class represents the border of an option dialog.
 */
export class MetalBorders$OptionDialogBorder extends AbstractBorder {
  titleHeight: number = 0;
  /**
   * Constructs a {@code OptionDialogBorder}.
   */
  _MetalBorders$OptionDialogBorder(): this {
    this._AbstractBorder();
    this.titleHeight = 0;
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    g.translate$int$int(x, y);
    let messageType = JOptionPane.PLAIN_MESSAGE;
    if (c instanceof JInternalFrame) {
      let obj = (c).getClientProperty('JInternalFrame.messageType');
      if ($J.isa(obj, Integer)) {
        messageType = obj;
      }
    }
    let borderColor: Color;
    switch (messageType) {
      case (JOptionPane.ERROR_MESSAGE):
        borderColor = UIManager.getColor$Object('OptionPane.errorDialog.border.background');
        break;
      case (JOptionPane.QUESTION_MESSAGE):
        borderColor = UIManager.getColor$Object('OptionPane.questionDialog.border.background');
        break;
      case (JOptionPane.WARNING_MESSAGE):
        borderColor = UIManager.getColor$Object('OptionPane.warningDialog.border.background');
        break;
      case (JOptionPane.INFORMATION_MESSAGE):
      case (JOptionPane.PLAIN_MESSAGE):
      default:
        borderColor = MetalLookAndFeel.getPrimaryControlDarkShadow();
        break;
    }
    g.setColor(borderColor);
    g.drawLine(1, 0, (w - 2) | 0, 0);
    g.drawLine(0, 1, 0, (h - 2) | 0);
    g.drawLine((w - 1) | 0, 1, (w - 1) | 0, (h - 2) | 0);
    g.drawLine(1, (h - 1) | 0, (w - 2) | 0, (h - 1) | 0);
    for (let i = 1; i < 3; i++) {
      g.drawRect(i, i, (w - (Math.imul(i, 2)) - 1) | 0, (h - (Math.imul(i, 2)) - 1) | 0);
    }
    g.translate$int$int(-x, -y);
  }
  getBorderInsets$Component$Insets(c: Component, newInsets: Insets): Insets {
    newInsets.set(3, 3, 3, 3);
    return newInsets;
  }
}

/**
 * The class represents the border of a {@code JMenuBar}.
 */
export class MetalBorders$MenuBarBorder extends AbstractBorder {
  /**
   * The border insets.
   */
  static borderInsets: Insets = null;
  /**
   * Constructs a {@code MenuBarBorder}.
   */
  _MetalBorders$MenuBarBorder(): this {
    this._AbstractBorder();
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    g.translate$int$int(x, y);
    if (MetalLookAndFeel.usingOcean()) {
      if (c instanceof JMenuBar && !MetalToolBarUI.doesMenuBarBorderToolBar(c)) {
        g.setColor(MetalLookAndFeel.getControl());
        SwingUtilities2.drawHLine(g, 0, (w - 1) | 0, (h - 2) | 0);
        g.setColor(UIManager.getColor$Object('MenuBar.borderColor'));
        SwingUtilities2.drawHLine(g, 0, (w - 1) | 0, (h - 1) | 0);
      }
    } else {
      g.setColor(MetalLookAndFeel.getControlShadow());
      SwingUtilities2.drawHLine(g, 0, (w - 1) | 0, (h - 1) | 0);
    }
    g.translate$int$int(-x, -y);
  }
  getBorderInsets$Component$Insets(c: Component, newInsets: Insets): Insets {
    if (MetalLookAndFeel.usingOcean()) {
      newInsets.set(0, 0, 2, 0);
    } else {
      newInsets.set(1, 0, 1, 0);
    }
    return newInsets;
  }
  static $clinit() {
    MetalBorders$MenuBarBorder.borderInsets = new Insets()._Insets(1, 0, 1, 0);
  }
}

/**
 * The class represents the border of a {@code JMenuItem}.
 */
export class MetalBorders$MenuItemBorder extends AbstractBorder {
  /**
   * The border insets.
   */
  static borderInsets: Insets = null;
  /**
   * Constructs a {@code MenuItemBorder}.
   */
  _MetalBorders$MenuItemBorder(): this {
    this._AbstractBorder();
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    if (!(c instanceof JMenuItem)) {
      return;
    }
    let b = c;
    let model = b.getModel();
    g.translate$int$int(x, y);
    if (c.getParent() instanceof JMenuBar) {
      if (model.isArmed() || model.isSelected()) {
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.drawLine(0, 0, (w - 2) | 0, 0);
        g.drawLine(0, 0, 0, (h - 1) | 0);
        g.drawLine((w - 2) | 0, 2, (w - 2) | 0, (h - 1) | 0);
        g.setColor(MetalLookAndFeel.getPrimaryControlHighlight());
        g.drawLine((w - 1) | 0, 1, (w - 1) | 0, (h - 1) | 0);
        g.setColor(MetalLookAndFeel.getMenuBackground());
        g.drawLine((w - 1) | 0, 0, (w - 1) | 0, 0);
      }
    } else {
      if (model.isArmed() || (c instanceof JMenu && model.isSelected())) {
        g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
        g.drawLine(0, 0, (w - 1) | 0, 0);
        g.setColor(MetalLookAndFeel.getPrimaryControlHighlight());
        g.drawLine(0, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
      } else {
        g.setColor(MetalLookAndFeel.getPrimaryControlHighlight());
        g.drawLine(0, 0, 0, (h - 1) | 0);
      }
    }
    g.translate$int$int(-x, -y);
  }
  getBorderInsets$Component$Insets(c: Component, newInsets: Insets): Insets {
    newInsets.set(2, 2, 2, 2);
    return newInsets;
  }
  static $clinit() {
    MetalBorders$MenuItemBorder.borderInsets = new Insets()._Insets(2, 2, 2, 2);
  }
}

/**
 * The class represents the border of a {@code JPopupMenu}.
 */
export class MetalBorders$PopupMenuBorder extends AbstractBorder {
  /**
   * The border insets.
   */
  static borderInsets: Insets = null;
  /**
   * Constructs a {@code PopupMenuBorder}.
   */
  _MetalBorders$PopupMenuBorder(): this {
    this._AbstractBorder();
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
    g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
    g.setColor(MetalLookAndFeel.getPrimaryControlHighlight());
    g.drawLine(1, 1, (w - 2) | 0, 1);
    g.drawLine(1, 2, 1, 2);
    g.drawLine(1, (h - 2) | 0, 1, (h - 2) | 0);
    g.translate$int$int(-x, -y);
  }
  getBorderInsets$Component$Insets(c: Component, newInsets: Insets): Insets {
    newInsets.set(3, 1, 2, 1);
    return newInsets;
  }
  static $clinit() {
    MetalBorders$PopupMenuBorder.borderInsets = new Insets()._Insets(3, 1, 2, 1);
  }
}

/**
 * The class represents the border of a rollover {@code Button}.
 */
export class MetalBorders$RolloverButtonBorder extends MetalBorders$ButtonBorder {
  /**
   * Constructs a {@code RolloverButtonBorder}.
   */
  _MetalBorders$RolloverButtonBorder(): this {
    this._MetalBorders$ButtonBorder();
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    let b = c;
    let model = b.getModel();
    if (model.isRollover() && !(model.isPressed() && !model.isArmed())) {
      super.paintBorder(c, g, x, y, w, h);
    }
  }
}

/**
 * A border which is like a Margin border but it will only honor the margin
 * if the margin has been explicitly set by the developer.
 *
 * Note: This is identical to the package private class
 * BasicBorders.RolloverMarginBorder and should probably be consolidated.
 */
export class MetalBorders$RolloverMarginBorder extends EmptyBorder {
  _MetalBorders$RolloverMarginBorder(): this {
    this._EmptyBorder$int$int$int$int(3, 3, 3, 3);
    return this;
  }
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    let margin = null;
    if (c instanceof AbstractButton) {
      margin = (c).getMargin();
    }
    if (margin == null || $J.isa(margin, UIResource)) {
      insets.left = this.left;
      insets.top = this.top;
      insets.right = this.right;
      insets.bottom = this.bottom;
    } else {
      insets.left = margin.left;
      insets.top = margin.top;
      insets.right = margin.right;
      insets.bottom = margin.bottom;
    }
    return insets;
  }
}

/**
 * The class represents the border of a {@code JToolBar}.
 */
export class MetalBorders$ToolBarBorder extends AbstractBorder {
  /**
   * The instance of {@code MetalBumps}.
   */
  bumps: MetalBumps = null;
  /**
   * Constructs a {@code ToolBarBorder}.
   */
  _MetalBorders$ToolBarBorder(): this {
    this._AbstractBorder();
    this.bumps = new MetalBumps()._MetalBumps(10, 10, MetalLookAndFeel.getControlHighlight(), MetalLookAndFeel.getControlDarkShadow(), UIManager.getColor$Object('ToolBar.background'));
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    if (!(c instanceof JToolBar)) {
      return;
    }
    g.translate$int$int(x, y);
    if ((c).isFloatable()) {
      if ((c).getOrientation() === SwingConstants.HORIZONTAL) {
        let shift = MetalLookAndFeel.usingOcean() ? -1 : 0;
        this.bumps.setBumpArea$int$int(10, (h - 4) | 0);
        if (MetalUtils.isLeftToRight(c)) {
          this.bumps.paintIcon(c, g, 2, (2 + shift) | 0);
        } else {
          this.bumps.paintIcon(c, g, (w - 12) | 0, (2 + shift) | 0);
        }
      } else {
        this.bumps.setBumpArea$int$int((w - 4) | 0, 10);
        this.bumps.paintIcon(c, g, 2, 2);
      }
    }
    if ((c).getOrientation() === SwingConstants.HORIZONTAL && MetalLookAndFeel.usingOcean()) {
      g.setColor(MetalLookAndFeel.getControl());
      g.drawLine(0, (h - 2) | 0, w, (h - 2) | 0);
      g.setColor(UIManager.getColor$Object('ToolBar.borderColor'));
      g.drawLine(0, (h - 1) | 0, w, (h - 1) | 0);
    }
    g.translate$int$int(-x, -y);
  }
  getBorderInsets$Component$Insets(c: Component, newInsets: Insets): Insets {
    if (MetalLookAndFeel.usingOcean()) {
      newInsets.set(1, 2, 3, 2);
    } else {
      newInsets.top = newInsets.left = newInsets.bottom = newInsets.right = 2;
    }
    if (!(c instanceof JToolBar)) {
      return newInsets;
    }
    if ((c).isFloatable()) {
      if ((c).getOrientation() === SwingConstants.HORIZONTAL) {
        if (c.getComponentOrientation().isLeftToRight()) {
          newInsets.left = 16;
        } else {
          newInsets.right = 16;
        }
      } else {
        newInsets.top = 16;
      }
    }
    let margin = (c).getMargin();
    if (margin != null) {
      newInsets.left = (newInsets.left + margin.left) | 0;
      newInsets.top = (newInsets.top + margin.top) | 0;
      newInsets.right = (newInsets.right + margin.right) | 0;
      newInsets.bottom = (newInsets.bottom + margin.bottom) | 0;
    }
    return newInsets;
  }
}

/**
 * Border for a {@code JTextField}.
 */
export class MetalBorders$TextFieldBorder extends MetalBorders$Flush3DBorder {
  /**
   * Constructs a {@code TextFieldBorder}.
   */
  _MetalBorders$TextFieldBorder(): this {
    this._MetalBorders$Flush3DBorder();
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    if (!(c instanceof JTextComponent)) {
      if (c.isEnabled()) {
        MetalUtils.drawFlush3DBorder$Graphics$int$int$int$int(g, x, y, w, h);
      } else {
        MetalUtils.drawDisabledBorder(g, x, y, w, h);
      }
      return;
    }
    if (c.isEnabled() && (c).isEditable()) {
      MetalUtils.drawFlush3DBorder$Graphics$int$int$int$int(g, x, y, w, h);
    } else {
      MetalUtils.drawDisabledBorder(g, x, y, w, h);
    }
  }
}

/**
 * The class represents the border of a {@code JScrollPane}.
 */
export class MetalBorders$ScrollPaneBorder extends AbstractBorder {
  /**
   * Constructs a {@code ScrollPaneBorder}.
   */
  _MetalBorders$ScrollPaneBorder(): this {
    this._AbstractBorder();
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    if (!(c instanceof JScrollPane)) {
      return;
    }
    let scroll = c;
    let colHeader = scroll.getColumnHeader();
    let colHeaderHeight = 0;
    if (colHeader != null) {
      colHeaderHeight = colHeader.getHeight();
    }
    let rowHeader = scroll.getRowHeader();
    let rowHeaderWidth = 0;
    if (rowHeader != null) {
      rowHeaderWidth = rowHeader.getWidth();
    }
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getControlDarkShadow());
    g.drawRect(0, 0, (w - 2) | 0, (h - 2) | 0);
    g.setColor(MetalLookAndFeel.getControlHighlight());
    g.drawLine((w - 1) | 0, 1, (w - 1) | 0, (h - 1) | 0);
    g.drawLine(1, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
    g.setColor(MetalLookAndFeel.getControl());
    g.drawLine((w - 2) | 0, (2 + colHeaderHeight) | 0, (w - 2) | 0, (2 + colHeaderHeight) | 0);
    g.drawLine((1 + rowHeaderWidth) | 0, (h - 2) | 0, (1 + rowHeaderWidth) | 0, (h - 2) | 0);
    g.translate$int$int(-x, -y);
  }
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    insets.set(1, 1, 2, 2);
    return insets;
  }
}

/**
 * Border for a {@code JToggleButton}.
 *
 * @since 1.3
 */
export class MetalBorders$ToggleButtonBorder extends MetalBorders$ButtonBorder {
  /**
   * Constructs a {@code ToggleButtonBorder}.
   */
  _MetalBorders$ToggleButtonBorder(): this {
    this._MetalBorders$ButtonBorder();
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    let button = c;
    let model = button.getModel();
    if (MetalLookAndFeel.usingOcean()) {
      if (model.isArmed() || !button.isEnabled()) {
        super.paintBorder(c, g, x, y, w, h);
      } else {
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
      }
      return;
    }
    if (!c.isEnabled()) {
      MetalUtils.drawDisabledBorder(g, x, y, (w - 1) | 0, (h - 1) | 0);
    } else {
      if (model.isPressed() && model.isArmed()) {
        MetalUtils.drawPressed3DBorder$Graphics$int$int$int$int(g, x, y, w, h);
      } else if (model.isSelected()) {
        MetalUtils.drawDark3DBorder$Graphics$int$int$int$int(g, x, y, w, h);
      } else {
        MetalUtils.drawFlush3DBorder$Graphics$int$int$int$int(g, x, y, w, h);
      }
    }
  }
}

/**
 * Border for a Table Header
 * @since 1.3
 */
export class MetalBorders$TableHeaderBorder extends AbstractBorder {
  /**
   * The border insets.
   */
  editorBorderInsets: Insets = null;
  /**
   * Constructs a {@code TableHeaderBorder}.
   */
  _MetalBorders$TableHeaderBorder(): this {
    this._AbstractBorder();
    this.editorBorderInsets = new Insets()._Insets(2, 2, 2, 0);
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getControlDarkShadow());
    g.drawLine((w - 1) | 0, 0, (w - 1) | 0, (h - 1) | 0);
    g.drawLine(1, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
    g.setColor(MetalLookAndFeel.getControlHighlight());
    g.drawLine(0, 0, (w - 2) | 0, 0);
    g.drawLine(0, 0, 0, (h - 2) | 0);
    g.translate$int$int(-x, -y);
  }
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    insets.set(2, 2, 2, 0);
    return insets;
  }
}

$J.define(MetalBorders, 'javax.swing.plaf.metal.MetalBorders', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MetalBorders' }, clinit: true, lazy: ['NO_BUTTON_ROLLOVER', 'buttonBorder', 'textBorder', 'textFieldBorder', 'toggleButtonBorder'] });
$J.define(MetalBorders$Flush3DBorder, 'javax.swing.plaf.metal.MetalBorders$Flush3DBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$Flush3DBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(MetalBorders$ButtonBorder, 'javax.swing.plaf.metal.MetalBorders$ButtonBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$ButtonBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' }, clinit: true, lazy: ['borderInsets'] });
$J.define(MetalBorders$AbstractMetalWindowBorder, 'javax.swing.plaf.metal.MetalBorders$AbstractMetalWindowBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$AbstractMetalWindowBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(MetalBorders$InternalFrameBorderImpl, 'javax.swing.plaf.metal.MetalBorders$InternalFrameBorderImpl', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalBorders$AbstractMetalWindowBorder', ctors: { '': '_MetalBorders$InternalFrameBorderImpl' } });
$J.define(MetalBorders$InternalFrameBorder, 'javax.swing.plaf.metal.MetalBorders$InternalFrameBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$InternalFrameBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(MetalBorders$FrameBorder, 'javax.swing.plaf.metal.MetalBorders$FrameBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.plaf.metal.MetalBorders$AbstractMetalWindowBorder', ctors: { '': '_MetalBorders$FrameBorder' } });
$J.define(MetalBorders$DialogBorder, 'javax.swing.plaf.metal.MetalBorders$DialogBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.plaf.metal.MetalBorders$AbstractMetalWindowBorder', ctors: { '': '_MetalBorders$DialogBorder' } });
$J.define(MetalBorders$ErrorDialogBorder, 'javax.swing.plaf.metal.MetalBorders$ErrorDialogBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.plaf.metal.MetalBorders$DialogBorder', ctors: { '': '_MetalBorders$ErrorDialogBorder' } });
$J.define(MetalBorders$QuestionDialogBorder, 'javax.swing.plaf.metal.MetalBorders$QuestionDialogBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.plaf.metal.MetalBorders$DialogBorder', ctors: { '': '_MetalBorders$QuestionDialogBorder' } });
$J.define(MetalBorders$WarningDialogBorder, 'javax.swing.plaf.metal.MetalBorders$WarningDialogBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.plaf.metal.MetalBorders$DialogBorder', ctors: { '': '_MetalBorders$WarningDialogBorder' } });
$J.define(MetalBorders$PaletteBorder, 'javax.swing.plaf.metal.MetalBorders$PaletteBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$PaletteBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(MetalBorders$OptionDialogBorder, 'javax.swing.plaf.metal.MetalBorders$OptionDialogBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$OptionDialogBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(MetalBorders$MenuBarBorder, 'javax.swing.plaf.metal.MetalBorders$MenuBarBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$MenuBarBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' }, clinit: true, lazy: ['borderInsets'] });
$J.define(MetalBorders$MenuItemBorder, 'javax.swing.plaf.metal.MetalBorders$MenuItemBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$MenuItemBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' }, clinit: true, lazy: ['borderInsets'] });
$J.define(MetalBorders$PopupMenuBorder, 'javax.swing.plaf.metal.MetalBorders$PopupMenuBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$PopupMenuBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' }, clinit: true, lazy: ['borderInsets'] });
$J.define(MetalBorders$RolloverButtonBorder, 'javax.swing.plaf.metal.MetalBorders$RolloverButtonBorder', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalBorders$ButtonBorder', ctors: { '': '_MetalBorders$RolloverButtonBorder' } });
$J.define(MetalBorders$RolloverMarginBorder, 'javax.swing.plaf.metal.MetalBorders$RolloverMarginBorder', { kind: 'class', sup: 'javax.swing.border.EmptyBorder', ctors: { '': '_MetalBorders$RolloverMarginBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(MetalBorders$ToolBarBorder, 'javax.swing.plaf.metal.MetalBorders$ToolBarBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource', 'javax.swing.SwingConstants'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$ToolBarBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(MetalBorders$TextFieldBorder, 'javax.swing.plaf.metal.MetalBorders$TextFieldBorder', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalBorders$Flush3DBorder', ctors: { '': '_MetalBorders$TextFieldBorder' } });
$J.define(MetalBorders$ScrollPaneBorder, 'javax.swing.plaf.metal.MetalBorders$ScrollPaneBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$ScrollPaneBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(MetalBorders$ToggleButtonBorder, 'javax.swing.plaf.metal.MetalBorders$ToggleButtonBorder', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalBorders$ButtonBorder', ctors: { '': '_MetalBorders$ToggleButtonBorder' } });
$J.define(MetalBorders$TableHeaderBorder, 'javax.swing.plaf.metal.MetalBorders$TableHeaderBorder', { kind: 'class', sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalBorders$TableHeaderBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.module(() => {
  SwingUtilities3 = $J.load('com.sun.java.swing.SwingUtilities3');
  BasicStroke = $J.load('java.awt.BasicStroke');
  Dialog = $J.load('java.awt.Dialog');
  Frame = $J.load('java.awt.Frame');
  Graphics2D = $J.load('java.awt.Graphics2D');
  Insets = $J.load('java.awt.Insets');
  AbstractButton = $J.load('javax.swing.AbstractButton');
  JButton = $J.load('javax.swing.JButton');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  JMenu = $J.load('javax.swing.JMenu');
  JMenuBar = $J.load('javax.swing.JMenuBar');
  JMenuItem = $J.load('javax.swing.JMenuItem');
  JOptionPane = $J.load('javax.swing.JOptionPane');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JToolBar = $J.load('javax.swing.JToolBar');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  CompoundBorder = $J.load('javax.swing.border.CompoundBorder');
  LineBorder = $J.load('javax.swing.border.LineBorder');
  MatteBorder = $J.load('javax.swing.border.MatteBorder');
  BorderUIResource$CompoundBorderUIResource = $J.load('javax.swing.plaf.BorderUIResource$CompoundBorderUIResource');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicBorders$MarginBorder = $J.load('javax.swing.plaf.basic.BasicBorders$MarginBorder');
  MetalBumps = $J.load('javax.swing.plaf.metal.MetalBumps');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalToolBarUI = $J.load('javax.swing.plaf.metal.MetalToolBarUI');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
  JTextComponent = $J.load('javax.swing.text.JTextComponent');
  StringUIClientPropertyKey = $J.load('sun.swing.StringUIClientPropertyKey');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
