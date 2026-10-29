// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicBorders.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { AbstractBorder } from '../../border/AbstractBorder.ts';
import { EmptyBorder } from '../../border/EmptyBorder.ts';

let Color, Insets, AbstractButton, BorderFactory, JButton, JSplitPane, JToolBar, UIManager, BevelBorder, BorderUIResource$CompoundBorderUIResource, BorderUIResource$LineBorderUIResource, UIResource, BasicGraphicsUtils, BasicSplitPaneDivider, JTextComponent, SwingUtilities2;

/**
 * Factory object that can vend Borders appropriate for the basic L &amp; F.
 * @author Georges Saab
 * @author Amy Fowler
 */
export class BasicBorders extends JObject {
  /**
   * Returns a border instance for a {@code JButton}.
   *
   * @return a border instance for a {@code JButton}
   */
  static getButtonBorder(): Border {
    let table = UIManager.getLookAndFeelDefaults();
    let buttonBorder = new BorderUIResource$CompoundBorderUIResource()._BorderUIResource$CompoundBorderUIResource(new BasicBorders$ButtonBorder()._BasicBorders$ButtonBorder(table.getColor$Object('Button.shadow'), table.getColor$Object('Button.darkShadow'), table.getColor$Object('Button.light'), table.getColor$Object('Button.highlight')), new BasicBorders$MarginBorder()._BasicBorders$MarginBorder());
    return buttonBorder;
  }
  /**
   * Returns a border instance for a {@code JRadioButton}.
   *
   * @return a border instance for a {@code JRadioButton}
   */
  static getRadioButtonBorder(): Border {
    let table = UIManager.getLookAndFeelDefaults();
    let radioButtonBorder = new BorderUIResource$CompoundBorderUIResource()._BorderUIResource$CompoundBorderUIResource(new BasicBorders$RadioButtonBorder()._BasicBorders$RadioButtonBorder(table.getColor$Object('RadioButton.shadow'), table.getColor$Object('RadioButton.darkShadow'), table.getColor$Object('RadioButton.light'), table.getColor$Object('RadioButton.highlight')), new BasicBorders$MarginBorder()._BasicBorders$MarginBorder());
    return radioButtonBorder;
  }
  /**
   * Returns a border instance for a {@code JToggleButton}.
   *
   * @return a border instance for a {@code JToggleButton}
   */
  static getToggleButtonBorder(): Border {
    let table = UIManager.getLookAndFeelDefaults();
    let toggleButtonBorder = new BorderUIResource$CompoundBorderUIResource()._BorderUIResource$CompoundBorderUIResource(new BasicBorders$ToggleButtonBorder()._BasicBorders$ToggleButtonBorder(table.getColor$Object('ToggleButton.shadow'), table.getColor$Object('ToggleButton.darkShadow'), table.getColor$Object('ToggleButton.light'), table.getColor$Object('ToggleButton.highlight')), new BasicBorders$MarginBorder()._BasicBorders$MarginBorder());
    return toggleButtonBorder;
  }
  /**
   * Returns a border instance for a {@code JMenuBar}.
   *
   * @return a border instance for a {@code JMenuBar}
   */
  static getMenuBarBorder(): Border {
    let table = UIManager.getLookAndFeelDefaults();
    let menuBarBorder = new BasicBorders$MenuBarBorder()._BasicBorders$MenuBarBorder(table.getColor$Object('MenuBar.shadow'), table.getColor$Object('MenuBar.highlight'));
    return menuBarBorder;
  }
  /**
   * Returns a border instance for a {@code JSplitPane}.
   *
   * @return a border instance for a {@code JSplitPane}
   */
  static getSplitPaneBorder(): Border {
    let table = UIManager.getLookAndFeelDefaults();
    let splitPaneBorder = new BasicBorders$SplitPaneBorder()._BasicBorders$SplitPaneBorder(table.getColor$Object('SplitPane.highlight'), table.getColor$Object('SplitPane.darkShadow'));
    return splitPaneBorder;
  }
  /**
   * Returns a border instance for a {@code JSplitPane} divider.
   *
   * @return a border instance for a {@code JSplitPane} divider
   * @since 1.3
   */
  static getSplitPaneDividerBorder(): Border {
    let table = UIManager.getLookAndFeelDefaults();
    let splitPaneBorder = new BasicBorders$SplitPaneDividerBorder()._BasicBorders$SplitPaneDividerBorder(table.getColor$Object('SplitPane.highlight'), table.getColor$Object('SplitPane.darkShadow'));
    return splitPaneBorder;
  }
  /**
   * Returns a border instance for a {@code JTextField}.
   *
   * @return a border instance for a {@code JTextField}
   */
  static getTextFieldBorder(): Border {
    let table = UIManager.getLookAndFeelDefaults();
    let textFieldBorder = new BasicBorders$FieldBorder()._BasicBorders$FieldBorder(table.getColor$Object('TextField.shadow'), table.getColor$Object('TextField.darkShadow'), table.getColor$Object('TextField.light'), table.getColor$Object('TextField.highlight'));
    return textFieldBorder;
  }
  /**
   * Returns a border instance for a {@code JProgressBar}.
   *
   * @return a border instance for a {@code JProgressBar}
   */
  static getProgressBarBorder(): Border {
    let table = UIManager.getLookAndFeelDefaults();
    let progressBarBorder = new BorderUIResource$LineBorderUIResource()._BorderUIResource$LineBorderUIResource$Color$int(Color.green, 2);
    return progressBarBorder;
  }
  /**
   * Returns a border instance for a {@code JInternalFrame}.
   *
   * @return a border instance for a {@code JInternalFrame}
   */
  static getInternalFrameBorder(): Border {
    let table = UIManager.getLookAndFeelDefaults();
    let internalFrameBorder = new BorderUIResource$CompoundBorderUIResource()._BorderUIResource$CompoundBorderUIResource(new BevelBorder()._BevelBorder$int$Color$Color$Color$Color(BevelBorder.RAISED, table.getColor$Object('InternalFrame.borderLight'), table.getColor$Object('InternalFrame.borderHighlight'), table.getColor$Object('InternalFrame.borderDarkShadow'), table.getColor$Object('InternalFrame.borderShadow')), BorderFactory.createLineBorder$Color$int(table.getColor$Object('InternalFrame.borderColor'), 1));
    return internalFrameBorder;
  }
}

/**
 * Draws a border around a button.
 */
export class BasicBorders$ButtonBorder extends AbstractBorder {
  /**
   * The color of shadow.
   */
  shadow: Color = null;
  /**
   * The color of dark shadow.
   */
  darkShadow: Color = null;
  /**
   * The color of highlight.
   */
  highlight: Color = null;
  /**
   * The color of light highlight.
   */
  lightHighlight: Color = null;
  /**
   * Constructs a new instance of a {@code ButtonBorder}.
   *
   * @param shadow a color of shadow
   * @param darkShadow a color of dark shadow
   * @param highlight a color of highlight
   * @param lightHighlight a color of light highlight
   */
  _BasicBorders$ButtonBorder(shadow: Color, darkShadow: Color, highlight: Color, lightHighlight: Color): this {
    this._AbstractBorder();
    this.shadow = shadow;
    this.darkShadow = darkShadow;
    this.highlight = highlight;
    this.lightHighlight = lightHighlight;
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    let isPressed = false;
    let isDefault = false;
    if (c instanceof AbstractButton) {
      let b = c;
      let model = b.getModel();
      isPressed = model.isPressed() && model.isArmed();
      if (c instanceof JButton) {
        isDefault = (c).isDefaultButton();
      }
    }
    BasicGraphicsUtils.drawBezel(g, x, y, width, height, isPressed, isDefault, this.shadow, this.darkShadow, this.highlight, this.lightHighlight);
  }
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    insets.set(2, 3, 3, 3);
    return insets;
  }
}

/**
 * Special thin border for rollover toolbar buttons.
 * @since 1.4
 */
export class BasicBorders$RolloverButtonBorder extends BasicBorders$ButtonBorder {
  /**
   * Constructs a new instance of a {@code RolloverButtonBorder}.
   *
   * @param shadow a color of shadow
   * @param darkShadow a color of dark shadow
   * @param highlight a color of highlight
   * @param lightHighlight a color of light highlight
   */
  _BasicBorders$RolloverButtonBorder(shadow: Color, darkShadow: Color, highlight: Color, lightHighlight: Color): this {
    this._BasicBorders$ButtonBorder(shadow, darkShadow, highlight, lightHighlight);
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    let b = c;
    let model = b.getModel();
    let shade = this.shadow;
    let p = b.getParent();
    if (p != null && p.getBackground().equals(this.shadow)) {
      shade = this.darkShadow;
    }
    if ((model.isRollover() && !(model.isPressed() && !model.isArmed())) || model.isSelected()) {
      let oldColor = g.getColor();
      g.translate$int$int(x, y);
      if (model.isPressed() && model.isArmed() || model.isSelected()) {
        g.setColor(shade);
        g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
        g.setColor(this.lightHighlight);
        g.drawLine((w - 1) | 0, 0, (w - 1) | 0, (h - 1) | 0);
        g.drawLine(0, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
      } else {
        g.setColor(this.lightHighlight);
        g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
        g.setColor(shade);
        g.drawLine((w - 1) | 0, 0, (w - 1) | 0, (h - 1) | 0);
        g.drawLine(0, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
      }
      g.translate$int$int(-x, -y);
      g.setColor(oldColor);
    }
  }
}

/**
 * A border which is like a Margin border but it will only honor the margin
 * if the margin has been explicitly set by the developer.
 *
 * Note: This is identical to the package private class
 * MetalBorders.RolloverMarginBorder and should probably be consolidated.
 */
export class BasicBorders$RolloverMarginBorder extends EmptyBorder {
  _BasicBorders$RolloverMarginBorder(): this {
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
 * Draws the border around a toggle button.
 */
export class BasicBorders$ToggleButtonBorder extends BasicBorders$ButtonBorder {
  /**
   * Constructs a new instance of a {@code ToggleButtonBorder}.
   *
   * @param shadow a color of shadow
   * @param darkShadow a color of dark shadow
   * @param highlight a color of highlight
   * @param lightHighlight a color of light highlight
   */
  _BasicBorders$ToggleButtonBorder(shadow: Color, darkShadow: Color, highlight: Color, lightHighlight: Color): this {
    this._BasicBorders$ButtonBorder(shadow, darkShadow, highlight, lightHighlight);
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    BasicGraphicsUtils.drawBezel(g, x, y, width, height, false, false, this.shadow, this.darkShadow, this.highlight, this.lightHighlight);
  }
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    insets.set(2, 2, 2, 2);
    return insets;
  }
}

/**
 * Draws the border around a radio button.
 */
export class BasicBorders$RadioButtonBorder extends BasicBorders$ButtonBorder {
  /**
   * Constructs a new instance of a {@code RadioButtonBorder}.
   *
   * @param shadow a color of shadow
   * @param darkShadow a color of dark shadow
   * @param highlight a color of highlight
   * @param lightHighlight a color of light highlight
   */
  _BasicBorders$RadioButtonBorder(shadow: Color, darkShadow: Color, highlight: Color, lightHighlight: Color): this {
    this._BasicBorders$ButtonBorder(shadow, darkShadow, highlight, lightHighlight);
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    if (c instanceof AbstractButton) {
      let b = c;
      let model = b.getModel();
      if (model.isArmed() && model.isPressed() || model.isSelected()) {
        BasicGraphicsUtils.drawLoweredBezel(g, x, y, width, height, this.shadow, this.darkShadow, this.highlight, this.lightHighlight);
      } else {
        BasicGraphicsUtils.drawBezel(g, x, y, width, height, false, b.isFocusPainted() && b.hasFocus(), this.shadow, this.darkShadow, this.highlight, this.lightHighlight);
      }
    } else {
      BasicGraphicsUtils.drawBezel(g, x, y, width, height, false, false, this.shadow, this.darkShadow, this.highlight, this.lightHighlight);
    }
  }
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    insets.set(2, 2, 2, 2);
    return insets;
  }
}

/**
 * Draws the border around a menu bar.
 */
export class BasicBorders$MenuBarBorder extends AbstractBorder {
  /**
   * The color of shadow.
   */
  shadow: Color = null;
  /**
   * The color of highlight.
   */
  highlight: Color = null;
  /**
   * Constructs a new instance of a {@code MenuBarBorder}.
   *
   * @param shadow a color of shadow
   * @param highlight a color of highlight
   */
  _BasicBorders$MenuBarBorder(shadow: Color, highlight: Color): this {
    this._AbstractBorder();
    this.shadow = shadow;
    this.highlight = highlight;
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    let oldColor = g.getColor();
    g.translate$int$int(x, y);
    g.setColor(this.shadow);
    SwingUtilities2.drawHLine(g, 0, (width - 1) | 0, (height - 2) | 0);
    g.setColor(this.highlight);
    SwingUtilities2.drawHLine(g, 0, (width - 1) | 0, (height - 1) | 0);
    g.translate$int$int(-x, -y);
    g.setColor(oldColor);
  }
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    insets.set(0, 0, 2, 0);
    return insets;
  }
}

/**
 * Draws the border around components which support margins.
 */
export class BasicBorders$MarginBorder extends AbstractBorder {
  /**
   * Constructs a {@code MarginBorder}.
   */
  _BasicBorders$MarginBorder(): this {
    this._AbstractBorder();
    return this;
  }
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    let margin = null;
    if (c instanceof AbstractButton) {
      let b = c;
      margin = b.getMargin();
    } else if (c instanceof JToolBar) {
      let t = c;
      margin = t.getMargin();
    } else if (c instanceof JTextComponent) {
      let t = c;
      margin = t.getMargin();
    }
    insets.top = margin != null ? margin.top : 0;
    insets.left = margin != null ? margin.left : 0;
    insets.bottom = margin != null ? margin.bottom : 0;
    insets.right = margin != null ? margin.right : 0;
    return insets;
  }
}

/**
 * Draws the border around a field.
 */
export class BasicBorders$FieldBorder extends AbstractBorder {
  /**
   * The color of shadow.
   */
  shadow: Color = null;
  /**
   * The color of dark shadow.
   */
  darkShadow: Color = null;
  /**
   * The color of highlight.
   */
  highlight: Color = null;
  /**
   * The color of light highlight.
   */
  lightHighlight: Color = null;
  /**
   * Constructs a new instance of a {@code FieldBorder}.
   *
   * @param shadow a color of shadow
   * @param darkShadow a color of dark shadow
   * @param highlight a color of highlight
   * @param lightHighlight a color of light highlight
   */
  _BasicBorders$FieldBorder(shadow: Color, darkShadow: Color, highlight: Color, lightHighlight: Color): this {
    this._AbstractBorder();
    this.shadow = shadow;
    this.highlight = highlight;
    this.darkShadow = darkShadow;
    this.lightHighlight = lightHighlight;
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    BasicGraphicsUtils.drawEtchedRect(g, x, y, width, height, this.shadow, this.darkShadow, this.highlight, this.lightHighlight);
  }
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    let margin = null;
    if (c instanceof JTextComponent) {
      margin = (c).getMargin();
    }
    insets.top = margin != null ? (2 + margin.top) | 0 : 2;
    insets.left = margin != null ? (2 + margin.left) | 0 : 2;
    insets.bottom = margin != null ? (2 + margin.bottom) | 0 : 2;
    insets.right = margin != null ? (2 + margin.right) | 0 : 2;
    return insets;
  }
}

/**
 * Draws the border around the divider in a splitpane
 * (when BasicSplitPaneUI is used). To get the appropriate effect, this
 * needs to be used with a SplitPaneBorder.
 */
export class BasicBorders$SplitPaneDividerBorder extends JObject {
  highlight: Color = null;
  shadow: Color = null;
  _BasicBorders$SplitPaneDividerBorder(highlight: Color, shadow: Color): this {
    this.highlight = highlight;
    this.shadow = shadow;
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    if (!(c instanceof BasicSplitPaneDivider)) {
      return;
    }
    let child: Component;
    let cBounds: Rectangle;
    let splitPane = (c).getBasicSplitPaneUI().getSplitPane();
    let size = c.getSize$();
    child = splitPane.getLeftComponent();
    g.setColor(c.getBackground());
    g.drawRect(x, y, (width - 1) | 0, (height - 1) | 0);
    if (splitPane.getOrientation() === JSplitPane.HORIZONTAL_SPLIT) {
      if (child != null) {
        g.setColor(this.highlight);
        g.drawLine(0, 0, 0, size.height_);
      }
      child = splitPane.getRightComponent();
      if (child != null) {
        g.setColor(this.shadow);
        g.drawLine((size.width_ - 1) | 0, 0, (size.width_ - 1) | 0, size.height_);
      }
    } else {
      if (child != null) {
        g.setColor(this.highlight);
        g.drawLine(0, 0, size.width_, 0);
      }
      child = splitPane.getRightComponent();
      if (child != null) {
        g.setColor(this.shadow);
        g.drawLine(0, (size.height_ - 1) | 0, size.width_, (size.height_ - 1) | 0);
      }
    }
  }
  getBorderInsets$Component(c: Component): Insets {
    let insets = new Insets()._Insets(0, 0, 0, 0);
    if (c instanceof BasicSplitPaneDivider) {
      let bspui = (c).getBasicSplitPaneUI();
      if (bspui != null) {
        let splitPane = bspui.getSplitPane();
        if (splitPane != null) {
          if (splitPane.getOrientation() === JSplitPane.HORIZONTAL_SPLIT) {
            insets.top = insets.bottom = 0;
            insets.left = insets.right = 1;
            return insets;
          }
          insets.top = insets.bottom = 1;
          insets.left = insets.right = 0;
          return insets;
        }
      }
    }
    insets.top = insets.bottom = insets.left = insets.right = 1;
    return insets;
  }
}

/**
 * Draws the border around the splitpane. To work correctly you should
 * also install a border on the divider (property SplitPaneDivider.border).
 */
export class BasicBorders$SplitPaneBorder extends JObject {
  /**
   * The color of highlight
   */
  highlight: Color = null;
  /**
   * The color of shadow
   */
  shadow: Color = null;
  /**
   * Constructs a new instance of a {@code SplitPaneBorder}.
   *
   * @param highlight a color of highlight
   * @param shadow a color of shadow
   */
  _BasicBorders$SplitPaneBorder(highlight: Color, shadow: Color): this {
    this.highlight = highlight;
    this.shadow = shadow;
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    if (!(c instanceof JSplitPane)) {
      return;
    }
    let child: Component;
    let cBounds: Rectangle;
    let splitPane = c;
    child = splitPane.getLeftComponent();
    g.setColor(c.getBackground());
    g.drawRect(x, y, (width - 1) | 0, (height - 1) | 0);
    if (splitPane.getOrientation() === JSplitPane.HORIZONTAL_SPLIT) {
      if (child != null) {
        cBounds = child.getBounds$();
        g.setColor(this.shadow);
        g.drawLine(0, 0, (cBounds.width_ + 1) | 0, 0);
        g.drawLine(0, 1, 0, (cBounds.height_ + 1) | 0);
        g.setColor(this.highlight);
        g.drawLine(0, (cBounds.height_ + 1) | 0, (cBounds.width_ + 1) | 0, (cBounds.height_ + 1) | 0);
      }
      child = splitPane.getRightComponent();
      if (child != null) {
        cBounds = child.getBounds$();
        let maxX = (cBounds.x_ + cBounds.width_) | 0;
        let maxY = (cBounds.y_ + cBounds.height_) | 0;
        g.setColor(this.shadow);
        g.drawLine((cBounds.x_ - 1) | 0, 0, maxX, 0);
        g.setColor(this.highlight);
        g.drawLine((cBounds.x_ - 1) | 0, maxY, maxX, maxY);
        g.drawLine(maxX, 0, maxX, (maxY + 1) | 0);
      }
    } else {
      if (child != null) {
        cBounds = child.getBounds$();
        g.setColor(this.shadow);
        g.drawLine(0, 0, (cBounds.width_ + 1) | 0, 0);
        g.drawLine(0, 1, 0, cBounds.height_);
        g.setColor(this.highlight);
        g.drawLine((1 + cBounds.width_) | 0, 0, (1 + cBounds.width_) | 0, (cBounds.height_ + 1) | 0);
        g.drawLine(0, (cBounds.height_ + 1) | 0, 0, (cBounds.height_ + 1) | 0);
      }
      child = splitPane.getRightComponent();
      if (child != null) {
        cBounds = child.getBounds$();
        let maxX = (cBounds.x_ + cBounds.width_) | 0;
        let maxY = (cBounds.y_ + cBounds.height_) | 0;
        g.setColor(this.shadow);
        g.drawLine(0, (cBounds.y_ - 1) | 0, 0, maxY);
        g.drawLine(maxX, (cBounds.y_ - 1) | 0, maxX, (cBounds.y_ - 1) | 0);
        g.setColor(this.highlight);
        g.drawLine(0, maxY, (cBounds.width_ + 1) | 0, maxY);
        g.drawLine(maxX, cBounds.y_, maxX, maxY);
      }
    }
  }
  getBorderInsets$Component(c: Component): Insets {
    return new Insets()._Insets(1, 1, 1, 1);
  }
}

$J.define(BasicBorders, 'javax.swing.plaf.basic.BasicBorders', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_BasicBorders' } });
$J.define(BasicBorders$ButtonBorder, 'javax.swing.plaf.basic.BasicBorders$ButtonBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { 'java.awt.Color,java.awt.Color,java.awt.Color,java.awt.Color': '_BasicBorders$ButtonBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(BasicBorders$RolloverButtonBorder, 'javax.swing.plaf.basic.BasicBorders$RolloverButtonBorder', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicBorders$ButtonBorder', ctors: { 'java.awt.Color,java.awt.Color,java.awt.Color,java.awt.Color': '_BasicBorders$RolloverButtonBorder' } });
$J.define(BasicBorders$RolloverMarginBorder, 'javax.swing.plaf.basic.BasicBorders$RolloverMarginBorder', { kind: 'class', sup: 'javax.swing.border.EmptyBorder', ctors: { '': '_BasicBorders$RolloverMarginBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(BasicBorders$ToggleButtonBorder, 'javax.swing.plaf.basic.BasicBorders$ToggleButtonBorder', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicBorders$ButtonBorder', ctors: { 'java.awt.Color,java.awt.Color,java.awt.Color,java.awt.Color': '_BasicBorders$ToggleButtonBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(BasicBorders$RadioButtonBorder, 'javax.swing.plaf.basic.BasicBorders$RadioButtonBorder', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicBorders$ButtonBorder', ctors: { 'java.awt.Color,java.awt.Color,java.awt.Color,java.awt.Color': '_BasicBorders$RadioButtonBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(BasicBorders$MenuBarBorder, 'javax.swing.plaf.basic.BasicBorders$MenuBarBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { 'java.awt.Color,java.awt.Color': '_BasicBorders$MenuBarBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(BasicBorders$MarginBorder, 'javax.swing.plaf.basic.BasicBorders$MarginBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_BasicBorders$MarginBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(BasicBorders$FieldBorder, 'javax.swing.plaf.basic.BasicBorders$FieldBorder', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.AbstractBorder', ctors: { 'java.awt.Color,java.awt.Color,java.awt.Color,java.awt.Color': '_BasicBorders$FieldBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(BasicBorders$SplitPaneDividerBorder, 'javax.swing.plaf.basic.BasicBorders$SplitPaneDividerBorder', { kind: 'class', ifaces: ['javax.swing.border.Border', 'javax.swing.plaf.UIResource'], sup: 'java.lang.Object', ctors: { 'java.awt.Color,java.awt.Color': '_BasicBorders$SplitPaneDividerBorder' }, meths: { 'getBorderInsets(java.awt.Component)': 'getBorderInsets$Component' } });
$J.define(BasicBorders$SplitPaneBorder, 'javax.swing.plaf.basic.BasicBorders$SplitPaneBorder', { kind: 'class', ifaces: ['javax.swing.border.Border', 'javax.swing.plaf.UIResource'], sup: 'java.lang.Object', ctors: { 'java.awt.Color,java.awt.Color': '_BasicBorders$SplitPaneBorder' }, meths: { 'getBorderInsets(java.awt.Component)': 'getBorderInsets$Component' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Insets = $J.load('java.awt.Insets');
  AbstractButton = $J.load('javax.swing.AbstractButton');
  BorderFactory = $J.load('javax.swing.BorderFactory');
  JButton = $J.load('javax.swing.JButton');
  JSplitPane = $J.load('javax.swing.JSplitPane');
  JToolBar = $J.load('javax.swing.JToolBar');
  UIManager = $J.load('javax.swing.UIManager');
  BevelBorder = $J.load('javax.swing.border.BevelBorder');
  BorderUIResource$CompoundBorderUIResource = $J.load('javax.swing.plaf.BorderUIResource$CompoundBorderUIResource');
  BorderUIResource$LineBorderUIResource = $J.load('javax.swing.plaf.BorderUIResource$LineBorderUIResource');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  BasicSplitPaneDivider = $J.load('javax.swing.plaf.basic.BasicSplitPaneDivider');
  JTextComponent = $J.load('javax.swing.text.JTextComponent');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
