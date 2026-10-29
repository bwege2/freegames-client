// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicToggleButtonUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2019, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, JObject, JString } from '../../../../../jre/index.ts';
import { BasicButtonUI } from './BasicButtonUI.ts';

let Rectangle, SwingUtilities, BasicHTML;

/**
 * BasicToggleButton implementation
 *
 * @author Jeff Dinkins
 */
export class BasicToggleButtonUI extends BasicButtonUI {
  static BASIC_TOGGLE_BUTTON_UI_KEY: any = null;
  static readonly propertyPrefix: string = 'ToggleButton.';
  /**
   * Constructs a {@code BasicToggleButtonUI}.
   */
  _BasicToggleButtonUI(): this {
    this._BasicButtonUI();
    return this;
  }
  /**
   * Returns an instance of {@code BasicToggleButtonUI}.
   *
   * @param b a component
   * @return an instance of {@code BasicToggleButtonUI}
   */
  static createUI(b: JComponent): ComponentUI {
    let appContext = AppContext.getAppContext();
    let toggleButtonUI = appContext.get(BasicToggleButtonUI.BASIC_TOGGLE_BUTTON_UI_KEY);
    if (toggleButtonUI == null) {
      toggleButtonUI = new BasicToggleButtonUI()._BasicToggleButtonUI();
      appContext.put(BasicToggleButtonUI.BASIC_TOGGLE_BUTTON_UI_KEY, toggleButtonUI);
    }
    return toggleButtonUI;
  }
  getPropertyPrefix(): string {
    return BasicToggleButtonUI.propertyPrefix;
  }
  paint(g: Graphics, c: JComponent): void {
    let b = c;
    let model = b.getModel();
    let size = b.getSize$();
    let fm = g.getFontMetrics$();
    let i = c.getInsets$();
    let viewRect = new Rectangle()._Rectangle$Dimension(size);
    viewRect.x_ = (viewRect.x_ + i.left) | 0;
    viewRect.y_ = (viewRect.y_ + i.top) | 0;
    viewRect.width_ = (viewRect.width_ - (i.right + viewRect.x_)) | 0;
    viewRect.height_ = (viewRect.height_ - (i.bottom + viewRect.y_)) | 0;
    let iconRect = new Rectangle()._Rectangle$();
    let textRect = new Rectangle()._Rectangle$();
    let f = c.getFont();
    g.setFont(f);
    let text = SwingUtilities.layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(c, fm, b.getText(), b.getIcon(), b.getVerticalAlignment(), b.getHorizontalAlignment(), b.getVerticalTextPosition(), b.getHorizontalTextPosition(), viewRect, iconRect, textRect, b.getText() == null ? 0 : b.getIconTextGap());
    g.setColor(b.getBackground());
    if (model.isArmed() && model.isPressed() || model.isSelected()) {
      this.paintButtonPressed(g, b);
    }
    if (b.getIcon() != null) {
      this.paintIcon$Graphics$AbstractButton$Rectangle(g, b, iconRect);
    }
    if (text != null && !(text.length === 0)) {
      let v = c.getClientProperty(BasicHTML.propertyKey);
      if (v != null) {
        v.paint(g, textRect);
      } else {
        this.paintText$Graphics$AbstractButton$Rectangle$String(g, b, textRect, text);
      }
    }
    if (b.isFocusPainted() && b.hasFocus()) {
      this.paintFocus$Graphics$AbstractButton$Rectangle$Rectangle$Rectangle(g, b, viewRect, textRect, iconRect);
    }
  }
  /**
   * Paints an icon in the specified location.
   *
   * @param g an instance of {@code Graphics}
   * @param b an instance of {@code Button}
   * @param iconRect bounds of an icon
   */
  paintIcon$Graphics$AbstractButton$Rectangle(g: Graphics, b: AbstractButton, iconRect: Rectangle): void {
    let model = b.getModel();
    let icon = null;
    if (!model.isEnabled()) {
      if (model.isSelected()) {
        icon = b.getDisabledSelectedIcon();
      } else {
        icon = b.getDisabledIcon();
      }
    } else if (model.isPressed() && model.isArmed()) {
      icon = b.getPressedIcon();
      if (icon == null) {
        icon = b.getSelectedIcon();
      }
    } else if (model.isSelected()) {
      if (b.isRolloverEnabled() && model.isRollover()) {
        icon = b.getRolloverSelectedIcon();
        if (icon == null) {
          icon = b.getSelectedIcon();
        }
      } else {
        icon = b.getSelectedIcon();
      }
    } else if (b.isRolloverEnabled() && model.isRollover()) {
      icon = b.getRolloverIcon();
    }
    if (icon == null) {
      icon = b.getIcon();
    }
    icon.paintIcon(b, g, iconRect.x_, iconRect.y_);
  }
  /**
   * Overridden so that the text will not be rendered as shifted for
   * Toggle buttons and subclasses.
   */
  getTextShiftOffset(): number {
    return 0;
  }
  static $clinit() {
    BasicToggleButtonUI.BASIC_TOGGLE_BUTTON_UI_KEY = new JObject();
  }
}

$J.define(BasicToggleButtonUI, 'javax.swing.plaf.basic.BasicToggleButtonUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicButtonUI', ctors: { '': '_BasicToggleButtonUI' }, meths: { 'paintIcon(java.awt.Graphics,javax.swing.AbstractButton,java.awt.Rectangle)': 'paintIcon$Graphics$AbstractButton$Rectangle' }, clinit: true, lazy: ['BASIC_TOGGLE_BUTTON_UI_KEY'] });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
});
