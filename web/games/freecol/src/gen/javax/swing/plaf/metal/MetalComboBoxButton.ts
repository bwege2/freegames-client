// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalComboBoxButton.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../../jre/index.ts';
import { JButton } from '../../JButton.ts';

let Dimension, DefaultButtonModel, JPanel, UIManager, MetalLookAndFeel, MetalUtils;

/**
 * JButton subclass to help out MetalComboBoxUI
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
 * @see MetalComboBoxButton
 * @author Tom Santos
 */
export class MetalComboBoxButton extends JButton {
  /**
   * The instance of {@code JComboBox}.
   */
  comboBox: JComboBox<any> = null;
  /**
   * The instance of {@code JList}.
   */
  listBox: JList<any> = null;
  /**
   * The instance of {@code CellRendererPane}.
   */
  rendererPane: CellRendererPane = null;
  /**
   * The icon.
   */
  comboIcon: Icon = null;
  /**
   * The {@code iconOnly} value.
   */
  iconOnly: boolean = false;
  $init_MetalComboBoxButton() {
    this.iconOnly = false;
  }
  _MetalComboBoxButton$(): this {
    this._JButton$String('');
    this.$init_MetalComboBoxButton();
    let model = new (MetalComboBoxButton$1())().$o(this)._DefaultButtonModel();
    this.setModel(model);
    return this;
  }
  /**
   * Constructs a new instance of {@code MetalComboBoxButton}.
   *
   * @param cb an instance of {@code JComboBox}
   * @param i an icon
   * @param pane an instance of {@code CellRendererPane}
   * @param list an instance of {@code JList}
   */
  _MetalComboBoxButton$JComboBox$Icon$CellRendererPane$JList(cb: JComboBox<any>, i: Icon, pane: CellRendererPane, list: JList<any>): this {
    this._MetalComboBoxButton$();
    this.comboBox = cb;
    this.comboIcon = i;
    this.rendererPane = pane;
    this.listBox = list;
    this.setEnabled(this.comboBox.isEnabled());
    return this;
  }
  /**
   * Constructs a new instance of {@code MetalComboBoxButton}.
   *
   * @param cb an instance of {@code JComboBox}
   * @param i an icon
   * @param onlyIcon if {@code true} only icon is painted
   * @param pane an instance of {@code CellRendererPane}
   * @param list an instance of {@code JList}
   */
  _MetalComboBoxButton$JComboBox$Icon$boolean$CellRendererPane$JList(cb: JComboBox<any>, i: Icon, onlyIcon: boolean, pane: CellRendererPane, list: JList<any>): this {
    this._MetalComboBoxButton$JComboBox$Icon$CellRendererPane$JList(cb, i, pane, list);
    this.iconOnly = onlyIcon;
    return this;
  }
  /**
   * Returns the icon of the {@code JComboBox}.
   *
   * @return the icon of the {@code JComboBox}
   */
  getComboIcon(): Icon {
    return this.comboIcon;
  }
  /**
   * If {@code isIconOnly} is {@code true} then only icon is painted.
   *
   * @param isIconOnly if {@code true} then only icon is painted
   */
  setIconOnly(isIconOnly: boolean): void {
    this.iconOnly = isIconOnly;
  }
  isFocusTraversable(): boolean {
    return false;
  }
  setEnabled(enabled: boolean): void {
    super.setEnabled(enabled);
    if (enabled) {
      this.setBackground(this.comboBox.getBackground());
      this.setForeground(this.comboBox.getForeground());
    } else {
      this.setBackground(UIManager.getColor$Object('ComboBox.disabledBackground'));
      this.setForeground(UIManager.getColor$Object('ComboBox.disabledForeground'));
    }
  }
  paintComponent(g: Graphics): void {
    let leftToRight = MetalUtils.isLeftToRight(this.comboBox);
    super.paintComponent(g);
    let insets = this.getInsets$();
    let width = (this.getWidth() - (insets.left + insets.right)) | 0;
    let height = (this.getHeight() - (insets.top + insets.bottom)) | 0;
    if (height <= 0 || width <= 0) {
      return;
    }
    let left = insets.left;
    let top = insets.top;
    let right = (left + (width - 1)) | 0;
    let bottom = (top + (height - 1)) | 0;
    let iconWidth = 0;
    let iconLeft = (leftToRight) ? right : left;
    if (this.comboIcon != null) {
      iconWidth = this.comboIcon.getIconWidth();
      let iconHeight = this.comboIcon.getIconHeight();
      let iconTop = 0;
      if (this.iconOnly) {
        iconLeft = (($J.idiv(this.getWidth(), 2)) - ($J.idiv(iconWidth, 2))) | 0;
        iconTop = (($J.idiv(this.getHeight(), 2)) - ($J.idiv(iconHeight, 2))) | 0;
      } else {
        if (leftToRight) {
          iconLeft = (left + (width - 1) - iconWidth) | 0;
        } else {
          iconLeft = left;
        }
        iconTop = (top + ($J.idiv(((bottom - top) | 0), 2)) - ($J.idiv(iconHeight, 2))) | 0;
      }
      this.comboIcon.paintIcon(this, g, iconLeft, iconTop);
      if (this.comboBox.hasFocus() && (!MetalLookAndFeel.usingOcean() || this.comboBox.isEditable())) {
        g.setColor(MetalLookAndFeel.getFocusColor());
        g.drawRect((left - 1) | 0, (top - 1) | 0, (width + 3) | 0, (height + 1) | 0);
      }
    }
    if (MetalLookAndFeel.usingOcean()) {
      return;
    }
    if (!this.iconOnly && this.comboBox != null) {
      let renderer = this.comboBox.getRenderer();
      let c: Component;
      let renderPressed = this.getModel().isPressed();
      c = renderer.getListCellRendererComponent(this.listBox, this.comboBox.getSelectedItem(), -1, renderPressed, false);
      c.setFont(this.rendererPane.getFont());
      if (this.model.isArmed() && this.model.isPressed()) {
        if (this.isOpaque()) {
          c.setBackground(UIManager.getColor$Object('Button.select'));
        }
        c.setForeground(this.comboBox.getForeground());
      } else if (!this.comboBox.isEnabled()) {
        if (this.isOpaque()) {
          c.setBackground(UIManager.getColor$Object('ComboBox.disabledBackground'));
        }
        c.setForeground(UIManager.getColor$Object('ComboBox.disabledForeground'));
      } else {
        c.setForeground(this.comboBox.getForeground());
        c.setBackground(this.comboBox.getBackground());
      }
      let cWidth = (width - (insets.right + iconWidth)) | 0;
      let shouldValidate = false;
      if (c instanceof JPanel) {
        shouldValidate = true;
      }
      if (leftToRight) {
        this.rendererPane.paintComponent$Graphics$Component$Container$int$int$int$int$boolean(g, c, this, left, top, cWidth, height, shouldValidate);
      } else {
        this.rendererPane.paintComponent$Graphics$Component$Container$int$int$int$int$boolean(g, c, this, (left + iconWidth) | 0, top, cWidth, height, shouldValidate);
      }
      this.rendererPane.remove$Component(c);
    }
  }
  getMinimumSize$(): Dimension {
    let ret = new Dimension()._Dimension$();
    let insets = this.getInsets$();
    ret.width_ = (insets.left + this.getComboIcon().getIconWidth() + insets.right) | 0;
    ret.height_ = (insets.bottom + this.getComboIcon().getIconHeight() + insets.top) | 0;
    return ret;
  }
}

let $MetalComboBoxButton$1: any = null;
/** An anonymous class (MetalComboBoxButton.java:123). */
function MetalComboBoxButton$1(): any {
  return $MetalComboBoxButton$1 ??= $J.local(class extends DefaultButtonModel {
    setArmed(armed: boolean): void {
      super.setArmed(this.isPressed() ? true : armed);
    }
  }, 'javax.swing.plaf.metal.MetalComboBoxButton$1', []);
}

$J.define(MetalComboBoxButton, 'javax.swing.plaf.metal.MetalComboBoxButton', { kind: 'class', sup: 'javax.swing.JButton', ctors: { 'javax.swing.JComboBox,javax.swing.Icon,boolean,javax.swing.CellRendererPane,javax.swing.JList': '_MetalComboBoxButton$JComboBox$Icon$boolean$CellRendererPane$JList', 'javax.swing.JComboBox,javax.swing.Icon,javax.swing.CellRendererPane,javax.swing.JList': '_MetalComboBoxButton$JComboBox$Icon$CellRendererPane$JList', '': '_MetalComboBoxButton$' }, meths: { 'getMinimumSize()': 'getMinimumSize$' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  DefaultButtonModel = $J.load('javax.swing.DefaultButtonModel');
  JPanel = $J.load('javax.swing.JPanel');
  UIManager = $J.load('javax.swing.UIManager');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
});
