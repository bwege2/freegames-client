// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/MenuBar.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../jre/index.ts';
import { MenuComponent } from './MenuComponent.ts';

/**
 * The {@code MenuBar} class encapsulates the platform's
 * concept of a menu bar bound to a frame. In order to associate
 * the menu bar with a {@code Frame} object, call the
 * frame's {@code setMenuBar} method.
 * <p>
 * <a id="mbexample"></a><!-- target for cross references -->
 * This is what a menu bar might look like:
 * <p>
 * <img src="doc-files/MenuBar-1.gif"
 * alt="Diagram of MenuBar containing 2 menus: Examples and Options. Examples
 * menu is expanded showing items: Basic, Simple, Check, and More Examples."
 * style="margin: 7px 10px;">
 * <p>
 * A menu bar handles keyboard shortcuts for menu items, passing them
 * along to its child menus.
 * (Keyboard shortcuts, which are optional, provide the user with
 * an alternative to the mouse for invoking a menu item and the
 * action that is associated with it.)
 * Each menu item can maintain an instance of {@code MenuShortcut}.
 * The {@code MenuBar} class defines several methods,
 * {@link MenuBar#shortcuts} and
 * {@link MenuBar#getShortcutMenuItem}
 * that retrieve information about the shortcuts a given
 * menu bar is managing.
 *
 * @author Sami Shaio
 * @see        java.awt.Frame
 * @see        java.awt.Frame#setMenuBar(java.awt.MenuBar)
 * @see        java.awt.Menu
 * @see        java.awt.MenuItem
 * @see        java.awt.MenuShortcut
 * @since      1.0
 */
export class MenuBar extends MenuComponent {
  /**
   * This field represents a vector of the
   * actual menus that will be part of the MenuBar.
   *
   * @serial
   * @see #countMenus()
   */
  menus: Vector<Menu> = null;
  /**
   * This menu is a special menu dedicated to
   * help.  The one thing to note about this menu
   * is that on some platforms it appears at the
   * right edge of the menubar.
   *
   * @serial
   * @see #getHelpMenu()
   * @see #setHelpMenu(Menu)
   */
  helpMenu: Menu = null;
  static readonly base: string = 'menubar';
  static nameCounter: number = 0;
  /**
   * The MenuBar's serialized data version.
   *
   * @serial
   */
  menuBarSerializedDataVersion: number = 0;
}

$J.define(MenuBar, 'java.awt.MenuBar', { kind: 'class', ifaces: ['java.awt.MenuContainer', 'javax.accessibility.Accessible'], sup: 'java.awt.MenuComponent', ctors: { '': '_MenuBar' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$MenuBar', 'remove(java.awt.MenuComponent)': 'remove$MenuComponent', 'remove(int)': 'remove$int' } });
