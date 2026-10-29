// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/PopupMenuUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { ComponentUI } from './ComponentUI.ts';

let PopupFactory;

/**
 * Pluggable look and feel interface for JPopupMenu.
 *
 * @author Georges Saab
 * @author David Karlton
 */
export class PopupMenuUI extends ComponentUI {
  /**
   * Constructor for subclasses to call.
   */
  _PopupMenuUI(): this {
    this._ComponentUI();
    return this;
  }
  /**
   * Returns the <code>Popup</code> that will be responsible for
   * displaying the <code>JPopupMenu</code>.
   *
   * @param popup JPopupMenu requesting Popup
   * @param x     Screen x location Popup is to be shown at
   * @param y     Screen y location Popup is to be shown at.
   * @return Popup that will show the JPopupMenu
   * @since 1.4
   */
  getPopup(popup: JPopupMenu, x: number, y: number): Popup {
    let popupFactory = PopupFactory.getSharedInstance();
    return popupFactory.getPopup$Component$Component$int$int(popup.getInvoker(), popup, x, y);
  }
}

$J.define(PopupMenuUI, 'javax.swing.plaf.PopupMenuUI', { kind: 'class', sup: 'javax.swing.plaf.ComponentUI', ctors: { '': '_PopupMenuUI' } });
$J.module(() => {
  PopupFactory = $J.load('javax.swing.PopupFactory');
});
