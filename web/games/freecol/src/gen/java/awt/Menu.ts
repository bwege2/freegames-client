// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Menu.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Vector } from '../../../jre/index.ts';
import { MenuItem } from './MenuItem.ts';

/**
 * A {@code Menu} object is a pull-down menu component
 * that is deployed from a menu bar.
 * <p>
 * A menu can optionally be a <i>tear-off</i> menu. A tear-off menu
 * can be opened and dragged away from its parent menu bar or menu.
 * It remains on the screen after the mouse button has been released.
 * The mechanism for tearing off a menu is platform dependent, since
 * the look and feel of the tear-off menu is determined by its peer.
 * On platforms that do not support tear-off menus, the tear-off
 * property is ignored.
 * <p>
 * Each item in a menu must belong to the {@code MenuItem}
 * class. It can be an instance of {@code MenuItem}, a submenu
 * (an instance of {@code Menu}), or a check box (an instance of
 * {@code CheckboxMenuItem}).
 *
 * @author Sami Shaio
 * @see     java.awt.MenuItem
 * @see     java.awt.CheckboxMenuItem
 * @since   1.0
 */
export class Menu extends MenuItem {
  /**
   * A vector of the items that will be part of the Menu.
   *
   * @serial
   * @see #countItems()
   */
  items: Vector<MenuItem> = null;
  /**
   * This field indicates whether the menu has the
   * tear of property or not.  It will be set to
   * {@code true} if the menu has the tear off
   * property and it will be set to {@code false}
   * if it does not.
   * A torn off menu can be deleted by a user when
   * it is no longer needed.
   *
   * @serial
   * @see #isTearOff()
   */
  tearOff: boolean = false;
  /**
   * This field will be set to {@code true}
   * if the Menu in question is actually a help
   * menu.  Otherwise it will be set to
   * {@code false}.
   *
   * @serial
   */
  isHelpMenu: boolean = false;
  static readonly base: string = 'menu';
  static nameCounter: number = 0;
  /**
   * The menu serialized Data Version.
   *
   * @serial
   */
  menuSerializedDataVersion: number = 0;
  $init_Menu() {
    this.items = new Vector();
    this.menuSerializedDataVersion = 1;
  }
}

$J.define(Menu, 'java.awt.Menu', { kind: 'class', ifaces: ['java.awt.MenuContainer', 'javax.accessibility.Accessible'], sup: 'java.awt.MenuItem', ctors: { 'java.lang.String,boolean': '_Menu$String$boolean', 'java.lang.String': '_Menu$String', '': '_Menu$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Menu', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$Menu', 'deleteShortcut(java.awt.MenuShortcut)': 'deleteShortcut$MenuShortcut', 'remove(java.awt.MenuComponent)': 'remove$MenuComponent', 'remove(int)': 'remove$int', 'insert(java.lang.String,int)': 'insert$String$int', 'insert(java.awt.MenuItem,int)': 'insert$MenuItem$int', 'add(java.lang.String)': 'add$String', 'add(java.awt.MenuItem)': 'add$MenuItem' } });
