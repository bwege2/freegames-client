// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicRadioButtonUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AppContext, JObject } from '../../../../../jre/index.ts';
import { BasicToggleButtonUI } from './BasicToggleButtonUI.ts';

let Dimension, Insets, Rectangle, SwingUtilities, UIManager, BasicHTML, SwingUtilities2;

/**
 * RadioButtonUI implementation for BasicRadioButtonUI
 *
 * @author Jeff Dinkins
 */
export class BasicRadioButtonUI extends BasicToggleButtonUI {
  static BASIC_RADIO_BUTTON_UI_KEY: any = null;
  /**
   * The icon.
   */
  icon: Icon = null;
  defaults_initialized: boolean = false;
  static readonly propertyPrefix: string = 'RadioButton.';
  static size: Dimension = null;
  static viewRect: Rectangle = null;
  static iconRect: Rectangle = null;
  static textRect: Rectangle = null;
  static prefViewRect: Rectangle = null;
  static prefIconRect: Rectangle = null;
  static prefTextRect: Rectangle = null;
  static prefInsets: Insets = null;
  /**
   * Constructs a {@code BasicRadioButtonUI}.
   */
  _BasicRadioButtonUI(): this {
    this._BasicToggleButtonUI();
    this.defaults_initialized = false;
    return this;
  }
  /**
   * Returns an instance of {@code BasicRadioButtonUI}.
   *
   * @param b a component
   * @return an instance of {@code BasicRadioButtonUI}
   */
  static createUI(b: JComponent): ComponentUI {
    let appContext = AppContext.getAppContext();
    let radioButtonUI = appContext.get(BasicRadioButtonUI.BASIC_RADIO_BUTTON_UI_KEY);
    if (radioButtonUI == null) {
      radioButtonUI = new BasicRadioButtonUI()._BasicRadioButtonUI();
      appContext.put(BasicRadioButtonUI.BASIC_RADIO_BUTTON_UI_KEY, radioButtonUI);
    }
    return radioButtonUI;
  }
  getPropertyPrefix(): string {
    return BasicRadioButtonUI.propertyPrefix;
  }
  installDefaults(b: AbstractButton): void {
    super.installDefaults(b);
    if (!this.defaults_initialized) {
      this.icon = UIManager.getIcon$Object(this.getPropertyPrefix() + 'icon');
      this.defaults_initialized = true;
    }
  }
  uninstallDefaults(b: AbstractButton): void {
    super.uninstallDefaults(b);
    this.defaults_initialized = false;
  }
  /**
   * Returns the default icon.
   *
   * @return the default icon
   */
  getDefaultIcon(): Icon {
    return this.icon;
  }
  /**
   * paint the radio button
   */
  paint(g: Graphics, c: JComponent): void {
    let b = c;
    let model = b.getModel();
    let f = c.getFont();
    g.setFont(f);
    let fm = SwingUtilities2.getFontMetrics$JComponent$Graphics$Font(c, g, f);
    let i = c.getInsets$();
    BasicRadioButtonUI.size = b.getSize$Dimension(BasicRadioButtonUI.size);
    BasicRadioButtonUI.viewRect.x_ = i.left;
    BasicRadioButtonUI.viewRect.y_ = i.top;
    BasicRadioButtonUI.viewRect.width_ = (BasicRadioButtonUI.size.width_ - (i.right + BasicRadioButtonUI.viewRect.x_)) | 0;
    BasicRadioButtonUI.viewRect.height_ = (BasicRadioButtonUI.size.height_ - (i.bottom + BasicRadioButtonUI.viewRect.y_)) | 0;
    BasicRadioButtonUI.iconRect.x_ = BasicRadioButtonUI.iconRect.y_ = BasicRadioButtonUI.iconRect.width_ = BasicRadioButtonUI.iconRect.height_ = 0;
    BasicRadioButtonUI.textRect.x_ = BasicRadioButtonUI.textRect.y_ = BasicRadioButtonUI.textRect.width_ = BasicRadioButtonUI.textRect.height_ = 0;
    let altIcon = b.getIcon();
    let selectedIcon = null;
    let disabledIcon = null;
    let text = SwingUtilities.layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(c, fm, b.getText(), altIcon != null ? altIcon : this.getDefaultIcon(), b.getVerticalAlignment(), b.getHorizontalAlignment(), b.getVerticalTextPosition(), b.getHorizontalTextPosition(), BasicRadioButtonUI.viewRect, BasicRadioButtonUI.iconRect, BasicRadioButtonUI.textRect, b.getText() == null ? 0 : b.getIconTextGap());
    if (c.isOpaque()) {
      g.setColor(b.getBackground());
      g.fillRect(0, 0, BasicRadioButtonUI.size.width_, BasicRadioButtonUI.size.height_);
    }
    if (altIcon != null) {
      if (!model.isEnabled()) {
        if (model.isSelected()) {
          altIcon = b.getDisabledSelectedIcon();
        } else {
          altIcon = b.getDisabledIcon();
        }
      } else if (model.isPressed() && model.isArmed()) {
        altIcon = b.getPressedIcon();
        if (altIcon == null) {
          altIcon = b.getSelectedIcon();
        }
      } else if (model.isSelected()) {
        if (b.isRolloverEnabled() && model.isRollover()) {
          altIcon = b.getRolloverSelectedIcon();
          if (altIcon == null) {
            altIcon = b.getSelectedIcon();
          }
        } else {
          altIcon = b.getSelectedIcon();
        }
      } else if (b.isRolloverEnabled() && model.isRollover()) {
        altIcon = b.getRolloverIcon();
      }
      if (altIcon == null) {
        altIcon = b.getIcon();
      }
      altIcon.paintIcon(c, g, BasicRadioButtonUI.iconRect.x_, BasicRadioButtonUI.iconRect.y_);
    } else {
      this.getDefaultIcon().paintIcon(c, g, BasicRadioButtonUI.iconRect.x_, BasicRadioButtonUI.iconRect.y_);
    }
    if (text != null) {
      let v = c.getClientProperty(BasicHTML.propertyKey);
      if (v != null) {
        v.paint(g, BasicRadioButtonUI.textRect);
      } else {
        this.paintText$Graphics$AbstractButton$Rectangle$String(g, b, BasicRadioButtonUI.textRect, text);
      }
      if (b.hasFocus() && b.isFocusPainted() && BasicRadioButtonUI.textRect.width_ > 0 && BasicRadioButtonUI.textRect.height_ > 0) {
        this.paintFocus$Graphics$Rectangle$Dimension(g, BasicRadioButtonUI.textRect, BasicRadioButtonUI.size);
      }
    }
  }
  /**
   * Paints focused radio button.
   *
   * @param g an instance of {@code Graphics}
   * @param textRect bounds
   * @param size the size of radio button
   */
  paintFocus$Graphics$Rectangle$Dimension(g: Graphics, textRect: Rectangle, size: Dimension): void {
  }
  /**
   * The preferred size of the radio button
   */
  getPreferredSize$JComponent(c: JComponent): Dimension {
    if (c.getComponentCount() > 0) {
      return null;
    }
    let b = c;
    let text = b.getText();
    let buttonIcon = b.getIcon();
    if (buttonIcon == null) {
      buttonIcon = this.getDefaultIcon();
    }
    let font = b.getFont();
    let fm = b.getFontMetrics(font);
    BasicRadioButtonUI.prefViewRect.x_ = BasicRadioButtonUI.prefViewRect.y_ = 0;
    BasicRadioButtonUI.prefViewRect.width_ = 32767;
    BasicRadioButtonUI.prefViewRect.height_ = 32767;
    BasicRadioButtonUI.prefIconRect.x_ = BasicRadioButtonUI.prefIconRect.y_ = BasicRadioButtonUI.prefIconRect.width_ = BasicRadioButtonUI.prefIconRect.height_ = 0;
    BasicRadioButtonUI.prefTextRect.x_ = BasicRadioButtonUI.prefTextRect.y_ = BasicRadioButtonUI.prefTextRect.width_ = BasicRadioButtonUI.prefTextRect.height_ = 0;
    SwingUtilities.layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(c, fm, text, buttonIcon, b.getVerticalAlignment(), b.getHorizontalAlignment(), b.getVerticalTextPosition(), b.getHorizontalTextPosition(), BasicRadioButtonUI.prefViewRect, BasicRadioButtonUI.prefIconRect, BasicRadioButtonUI.prefTextRect, text == null ? 0 : b.getIconTextGap());
    let x1 = Math.min(BasicRadioButtonUI.prefIconRect.x_, BasicRadioButtonUI.prefTextRect.x_);
    let x2 = Math.max((BasicRadioButtonUI.prefIconRect.x_ + BasicRadioButtonUI.prefIconRect.width_) | 0, (BasicRadioButtonUI.prefTextRect.x_ + BasicRadioButtonUI.prefTextRect.width_) | 0);
    let y1 = Math.min(BasicRadioButtonUI.prefIconRect.y_, BasicRadioButtonUI.prefTextRect.y_);
    let y2 = Math.max((BasicRadioButtonUI.prefIconRect.y_ + BasicRadioButtonUI.prefIconRect.height_) | 0, (BasicRadioButtonUI.prefTextRect.y_ + BasicRadioButtonUI.prefTextRect.height_) | 0);
    let width = (x2 - x1) | 0;
    let height = (y2 - y1) | 0;
    BasicRadioButtonUI.prefInsets = b.getInsets$Insets(BasicRadioButtonUI.prefInsets);
    width = (width + (BasicRadioButtonUI.prefInsets.left + BasicRadioButtonUI.prefInsets.right)) | 0;
    height = (height + (BasicRadioButtonUI.prefInsets.top + BasicRadioButtonUI.prefInsets.bottom)) | 0;
    return new Dimension()._Dimension$int$int(width, height);
  }
  static $clinit() {
    BasicRadioButtonUI.BASIC_RADIO_BUTTON_UI_KEY = new JObject();
    BasicRadioButtonUI.size = new Dimension()._Dimension$();
    BasicRadioButtonUI.viewRect = new Rectangle()._Rectangle$();
    BasicRadioButtonUI.iconRect = new Rectangle()._Rectangle$();
    BasicRadioButtonUI.textRect = new Rectangle()._Rectangle$();
    BasicRadioButtonUI.prefViewRect = new Rectangle()._Rectangle$();
    BasicRadioButtonUI.prefIconRect = new Rectangle()._Rectangle$();
    BasicRadioButtonUI.prefTextRect = new Rectangle()._Rectangle$();
    BasicRadioButtonUI.prefInsets = new Insets()._Insets(0, 0, 0, 0);
  }
}

$J.define(BasicRadioButtonUI, 'javax.swing.plaf.basic.BasicRadioButtonUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicToggleButtonUI', ctors: { '': '_BasicRadioButtonUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent', 'paintFocus(java.awt.Graphics,java.awt.Rectangle,java.awt.Dimension)': 'paintFocus$Graphics$Rectangle$Dimension' }, clinit: true, lazy: ['BASIC_RADIO_BUTTON_UI_KEY', 'size', 'viewRect', 'iconRect', 'textRect', 'prefViewRect', 'prefIconRect', 'prefTextRect', 'prefInsets'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Insets = $J.load('java.awt.Insets');
  Rectangle = $J.load('java.awt.Rectangle');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
