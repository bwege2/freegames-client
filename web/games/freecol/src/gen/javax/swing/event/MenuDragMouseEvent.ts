// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/event/MenuDragMouseEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { MouseEvent } from '../../../java/awt/event/MouseEvent.ts';

/**
 * MenuDragMouseEvent is used to notify interested parties that
 * the menu element has received a MouseEvent forwarded to it
 * under drag conditions.
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
 * @author Georges Saab
 */
export class MenuDragMouseEvent extends MouseEvent {
  path: MenuElement[] = null;
  manager: MenuSelectionManager = null;
  /**
   * Constructs a MenuDragMouseEvent object.
   * <p>Even if inconsistent values for relative and absolute coordinates are
   * passed to the constructor, the MenuDragMouseEvent instance is still
   * created.
   * @param source        the Component that originated the event
   *                      (typically <code>this</code>)
   * @param id            an int specifying the type of event, as defined
   *                      in {@link java.awt.event.MouseEvent}
   * @param when          a long identifying the time the event occurred
   * @param modifiers     an int specifying any modifier keys held down,
   *                      as specified in {@link java.awt.event.InputEvent}
   * @param x             an int specifying the horizontal position at which
   *                      the event occurred, in pixels
   * @param y             an int specifying the vertical position at which
   *                      the event occurred, in pixels
   * @param xAbs          an int specifying the horizontal absolute position at which
   *                      the event occurred, in pixels
   * @param yAbs          an int specifying the vertical absolute position at which
   *                      the event occurred, in pixels
   * @param clickCount    an int specifying the number of mouse-clicks
   * @param popupTrigger  a boolean -- true if the event {should?/did?}
   *                      trigger a popup
   * @param p             an array of MenuElement objects specifying a path
   *                        to a menu item affected by the drag
   * @param m             a MenuSelectionManager object that handles selections
   * @see MouseEvent#MouseEvent(java.awt.Component, int, long, int, int, int, int, int, int, boolean, int)
   * @since 1.6
   */
  _MenuDragMouseEvent$Component$int$long$int$int$int$int$int$int$boolean$MenuElementArr$MenuSelectionManager(source: Component, id: number, when: number, modifiers: number, x: number, y: number, xAbs: number, yAbs: number, clickCount: number, popupTrigger: boolean, p: MenuElement[], m: MenuSelectionManager): this {
    this._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(source, id, when, modifiers, x, y, xAbs, yAbs, clickCount, popupTrigger, MouseEvent.NOBUTTON);
    this.path = p;
    this.manager = m;
    return this;
  }
  /**
   * Returns the path to the selected menu item.
   *
   * @return an array of MenuElement objects representing the path value
   */
  getPath(): MenuElement[] {
    return this.path;
  }
  /**
   * Returns the current menu selection manager.
   *
   * @return a MenuSelectionManager object
   */
  getMenuSelectionManager(): MenuSelectionManager {
    return this.manager;
  }
}

$J.define(MenuDragMouseEvent, 'javax.swing.event.MenuDragMouseEvent', { kind: 'class', sup: 'java.awt.event.MouseEvent', ctors: { 'java.awt.Component,int,long,int,int,int,int,int,int,boolean,javax.swing.MenuElement[],javax.swing.MenuSelectionManager': '_MenuDragMouseEvent$Component$int$long$int$int$int$int$int$int$boolean$MenuElementArr$MenuSelectionManager', 'java.awt.Component,int,long,int,int,int,int,boolean,javax.swing.MenuElement[],javax.swing.MenuSelectionManager': '_MenuDragMouseEvent$Component$int$long$int$int$int$int$boolean$MenuElementArr$MenuSelectionManager' } });
