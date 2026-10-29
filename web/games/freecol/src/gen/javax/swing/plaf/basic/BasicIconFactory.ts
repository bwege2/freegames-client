// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicIconFactory.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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

let Polygon;

/**
 * Factory object that can vend Icons appropriate for the basic L &amp; F.
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
 * @author David Kloba
 * @author Georges Saab
 */
export class BasicIconFactory extends JObject {
  static frame_icon: Icon = null;
  static checkBoxIcon: Icon = null;
  static radioButtonIcon: Icon = null;
  static checkBoxMenuItemIcon: Icon = null;
  static radioButtonMenuItemIcon: Icon = null;
  static menuItemCheckIcon: Icon = null;
  static menuItemArrowIcon: Icon = null;
  static menuArrowIcon: Icon = null;
  /**
   * Returns a menu item check icon.
   *
   * @return a menu item check icon
   */
  static getMenuItemCheckIcon(): Icon {
    if (BasicIconFactory.menuItemCheckIcon == null) {
      BasicIconFactory.menuItemCheckIcon = new BasicIconFactory$MenuItemCheckIcon()._BasicIconFactory$MenuItemCheckIcon();
    }
    return BasicIconFactory.menuItemCheckIcon;
  }
  /**
   * Returns a menu item arrow icon.
   *
   * @return a menu item arrow icon
   */
  static getMenuItemArrowIcon(): Icon {
    if (BasicIconFactory.menuItemArrowIcon == null) {
      BasicIconFactory.menuItemArrowIcon = new BasicIconFactory$MenuItemArrowIcon()._BasicIconFactory$MenuItemArrowIcon();
    }
    return BasicIconFactory.menuItemArrowIcon;
  }
  /**
   * Returns a menu arrow icon.
   *
   * @return a menu arrow icon
   */
  static getMenuArrowIcon(): Icon {
    if (BasicIconFactory.menuArrowIcon == null) {
      BasicIconFactory.menuArrowIcon = new BasicIconFactory$MenuArrowIcon()._BasicIconFactory$MenuArrowIcon();
    }
    return BasicIconFactory.menuArrowIcon;
  }
  /**
   * Returns a check box icon.
   *
   * @return a check box icon
   */
  static getCheckBoxIcon(): Icon {
    if (BasicIconFactory.checkBoxIcon == null) {
      BasicIconFactory.checkBoxIcon = new BasicIconFactory$CheckBoxIcon()._BasicIconFactory$CheckBoxIcon();
    }
    return BasicIconFactory.checkBoxIcon;
  }
  /**
   * Returns a radio button icon.
   *
   * @return a radio button icon
   */
  static getRadioButtonIcon(): Icon {
    if (BasicIconFactory.radioButtonIcon == null) {
      BasicIconFactory.radioButtonIcon = new BasicIconFactory$RadioButtonIcon()._BasicIconFactory$RadioButtonIcon();
    }
    return BasicIconFactory.radioButtonIcon;
  }
  /**
   * Returns a check box menu item icon.
   *
   * @return a check box menu item icon
   */
  static getCheckBoxMenuItemIcon(): Icon {
    if (BasicIconFactory.checkBoxMenuItemIcon == null) {
      BasicIconFactory.checkBoxMenuItemIcon = new BasicIconFactory$CheckBoxMenuItemIcon()._BasicIconFactory$CheckBoxMenuItemIcon();
    }
    return BasicIconFactory.checkBoxMenuItemIcon;
  }
  /**
   * Returns a radio button menu item icon.
   *
   * @return a radio button menu item icon
   */
  static getRadioButtonMenuItemIcon(): Icon {
    if (BasicIconFactory.radioButtonMenuItemIcon == null) {
      BasicIconFactory.radioButtonMenuItemIcon = new BasicIconFactory$RadioButtonMenuItemIcon()._BasicIconFactory$RadioButtonMenuItemIcon();
    }
    return BasicIconFactory.radioButtonMenuItemIcon;
  }
  /**
   * Returns an empty frame icon.
   *
   * @return an empty frame icon
   */
  static createEmptyFrameIcon(): Icon {
    if (BasicIconFactory.frame_icon == null) {
      BasicIconFactory.frame_icon = new BasicIconFactory$EmptyFrameIcon()._BasicIconFactory$EmptyFrameIcon();
    }
    return BasicIconFactory.frame_icon;
  }
}

export class BasicIconFactory$EmptyFrameIcon extends JObject {
  height_: number = 0;
  width_: number = 0;
  _BasicIconFactory$EmptyFrameIcon(): this {
    this.height_ = 16;
    this.width_ = 14;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
  }
  getIconWidth(): number {
    return this.width_;
  }
  getIconHeight(): number {
    return this.height_;
  }
}

export class BasicIconFactory$CheckBoxIcon extends JObject {
  static readonly csize: number = 13;
  _BasicIconFactory$CheckBoxIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
  }
  getIconWidth(): number {
    return BasicIconFactory$CheckBoxIcon.csize;
  }
  getIconHeight(): number {
    return BasicIconFactory$CheckBoxIcon.csize;
  }
}

export class BasicIconFactory$RadioButtonIcon extends JObject {
  _BasicIconFactory$RadioButtonIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
  }
  getIconWidth(): number {
    return 13;
  }
  getIconHeight(): number {
    return 13;
  }
}

export class BasicIconFactory$CheckBoxMenuItemIcon extends JObject {
  _BasicIconFactory$CheckBoxMenuItemIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let b = c;
    let model = b.getModel();
    let isSelected = model.isSelected();
    if (isSelected) {
      g.drawLine((x + 7) | 0, (y + 1) | 0, (x + 7) | 0, (y + 3) | 0);
      g.drawLine((x + 6) | 0, (y + 2) | 0, (x + 6) | 0, (y + 4) | 0);
      g.drawLine((x + 5) | 0, (y + 3) | 0, (x + 5) | 0, (y + 5) | 0);
      g.drawLine((x + 4) | 0, (y + 4) | 0, (x + 4) | 0, (y + 6) | 0);
      g.drawLine((x + 3) | 0, (y + 5) | 0, (x + 3) | 0, (y + 7) | 0);
      g.drawLine((x + 2) | 0, (y + 4) | 0, (x + 2) | 0, (y + 6) | 0);
      g.drawLine((x + 1) | 0, (y + 3) | 0, (x + 1) | 0, (y + 5) | 0);
    }
  }
  getIconWidth(): number {
    return 9;
  }
  getIconHeight(): number {
    return 9;
  }
}

export class BasicIconFactory$RadioButtonMenuItemIcon extends JObject {
  _BasicIconFactory$RadioButtonMenuItemIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let b = c;
    let model = b.getModel();
    if (b.isSelected() === true) {
      g.fillOval((x + 1) | 0, (y + 1) | 0, this.getIconWidth(), this.getIconHeight());
    }
  }
  getIconWidth(): number {
    return 6;
  }
  getIconHeight(): number {
    return 6;
  }
}

export class BasicIconFactory$MenuItemCheckIcon extends JObject {
  _BasicIconFactory$MenuItemCheckIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
  }
  getIconWidth(): number {
    return 9;
  }
  getIconHeight(): number {
    return 9;
  }
}

export class BasicIconFactory$MenuItemArrowIcon extends JObject {
  _BasicIconFactory$MenuItemArrowIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
  }
  getIconWidth(): number {
    return 4;
  }
  getIconHeight(): number {
    return 8;
  }
}

export class BasicIconFactory$MenuArrowIcon extends JObject {
  _BasicIconFactory$MenuArrowIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let p = new Polygon()._Polygon$();
    p.addPoint(x, y);
    p.addPoint((x + this.getIconWidth()) | 0, (y + $J.idiv(this.getIconHeight(), 2)) | 0);
    p.addPoint(x, (y + this.getIconHeight()) | 0);
    g.fillPolygon$Polygon(p);
  }
  getIconWidth(): number {
    return 4;
  }
  getIconHeight(): number {
    return 8;
  }
}

$J.define(BasicIconFactory, 'javax.swing.plaf.basic.BasicIconFactory', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_BasicIconFactory' } });
$J.define(BasicIconFactory$EmptyFrameIcon, 'javax.swing.plaf.basic.BasicIconFactory$EmptyFrameIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_BasicIconFactory$EmptyFrameIcon' } });
$J.define(BasicIconFactory$CheckBoxIcon, 'javax.swing.plaf.basic.BasicIconFactory$CheckBoxIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_BasicIconFactory$CheckBoxIcon' } });
$J.define(BasicIconFactory$RadioButtonIcon, 'javax.swing.plaf.basic.BasicIconFactory$RadioButtonIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_BasicIconFactory$RadioButtonIcon' } });
$J.define(BasicIconFactory$CheckBoxMenuItemIcon, 'javax.swing.plaf.basic.BasicIconFactory$CheckBoxMenuItemIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_BasicIconFactory$CheckBoxMenuItemIcon' } });
$J.define(BasicIconFactory$RadioButtonMenuItemIcon, 'javax.swing.plaf.basic.BasicIconFactory$RadioButtonMenuItemIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_BasicIconFactory$RadioButtonMenuItemIcon' } });
$J.define(BasicIconFactory$MenuItemCheckIcon, 'javax.swing.plaf.basic.BasicIconFactory$MenuItemCheckIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_BasicIconFactory$MenuItemCheckIcon' } });
$J.define(BasicIconFactory$MenuItemArrowIcon, 'javax.swing.plaf.basic.BasicIconFactory$MenuItemArrowIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_BasicIconFactory$MenuItemArrowIcon' } });
$J.define(BasicIconFactory$MenuArrowIcon, 'javax.swing.plaf.basic.BasicIconFactory$MenuArrowIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_BasicIconFactory$MenuArrowIcon' } });
$J.module(() => {
  Polygon = $J.load('java.awt.Polygon');
});
