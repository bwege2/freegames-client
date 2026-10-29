// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/DefaultMenuLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BoxLayout } from '../../BoxLayout.ts';

let Dimension, JPopupMenu, MenuItemLayoutHelper;

/**
 * The default layout manager for Popup menus and menubars.  This
 * class is an extension of BoxLayout which adds the UIResource tag
 * so that pluggable L&amp;Fs can distinguish it from user-installed
 * layout managers on menus.
 *
 * @author Georges Saab
 */
export class DefaultMenuLayout extends BoxLayout {
  /**
   * Constructs a new instance of {@code DefaultMenuLayout}.
   *
   * @param target the container that needs to be laid out
   * @param axis the axis to lay out components along. Can be one of:
   *              {@code BoxLayout.X_AXIS},
   *              {@code BoxLayout.Y_AXIS},
   *              {@code BoxLayout.LINE_AXIS} or
   *              {@code BoxLayout.PAGE_AXIS}
   */
  _DefaultMenuLayout(target: Container, axis: number): this {
    this._BoxLayout$Container$int(target, axis);
    return this;
  }
  preferredLayoutSize(target: Container): Dimension {
    if (target instanceof JPopupMenu) {
      let popupMenu = target;
      MenuItemLayoutHelper.clearUsedClientProperties(popupMenu);
      if (popupMenu.getComponentCount() === 0) {
        return new Dimension()._Dimension$int$int(0, 0);
      }
    }
    super.invalidateLayout(target);
    return super.preferredLayoutSize(target);
  }
}

$J.define(DefaultMenuLayout, 'javax.swing.plaf.basic.DefaultMenuLayout', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.BoxLayout', ctors: { 'java.awt.Container,int': '_DefaultMenuLayout' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  JPopupMenu = $J.load('javax.swing.JPopupMenu');
  MenuItemLayoutHelper = $J.load('sun.swing.MenuItemLayoutHelper');
});
