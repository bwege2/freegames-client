// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/ScrollPane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { Container } from './Container.ts';

/**
 * A container class which implements automatic horizontal and/or
 * vertical scrolling for a single child component.  The display
 * policy for the scrollbars can be set to:
 * <OL>
 * <LI>as needed: scrollbars created and shown only when needed by scrollpane
 * <LI>always: scrollbars created and always shown by the scrollpane
 * <LI>never: scrollbars never created or shown by the scrollpane
 * </OL>
 * <P>
 * The state of the horizontal and vertical scrollbars is represented
 * by two {@code ScrollPaneAdjustable} objects (one for each
 * dimension) which implement the {@code Adjustable} interface.
 * The API provides methods to access those objects such that the
 * attributes on the Adjustable object (such as unitIncrement, value,
 * etc.) can be manipulated.
 * <P>
 * Certain adjustable properties (minimum, maximum, blockIncrement,
 * and visibleAmount) are set internally by the scrollpane in accordance
 * with the geometry of the scrollpane and its child and these should
 * not be set by programs using the scrollpane.
 * <P>
 * If the scrollbar display policy is defined as "never", then the
 * scrollpane can still be programmatically scrolled using the
 * setScrollPosition() method and the scrollpane will move and clip
 * the child's contents appropriately.  This policy is useful if the
 * program needs to create and manage its own adjustable controls.
 * <P>
 * The placement of the scrollbars is controlled by platform-specific
 * properties set by the user outside of the program.
 * <P>
 * The initial size of this container is set to 100x100, but can
 * be reset using setSize().
 * <P>
 * Scrolling with the wheel on a wheel-equipped mouse is enabled by default.
 * This can be disabled using {@code setWheelScrollingEnabled}.
 * Wheel scrolling can be customized by setting the block and
 * unit increment of the horizontal and vertical Adjustables.
 * For information on how mouse wheel events are dispatched, see
 * the class description for {@link MouseWheelEvent}.
 * <P>
 * Insets are used to define any space used by scrollbars and any
 * borders created by the scroll pane. getInsets() can be used
 * to get the current value for the insets.  If the value of
 * scrollbarsAlwaysVisible is false, then the value of the insets
 * will change dynamically depending on whether the scrollbars are
 * currently visible or not.
 *
 * @author      Tom Ball
 * @author      Amy Fowler
 * @author      Tim Prinzing
 */
export class ScrollPane extends Container {
  /**
   * Specifies that horizontal/vertical scrollbar should be shown
   * only when the size of the child exceeds the size of the scrollpane
   * in the horizontal/vertical dimension.
   */
  static readonly SCROLLBARS_AS_NEEDED: number = 0;
  /**
   * Specifies that horizontal/vertical scrollbars should always be
   * shown regardless of the respective sizes of the scrollpane and child.
   */
  static readonly SCROLLBARS_ALWAYS: number = 1;
  /**
   * Specifies that horizontal/vertical scrollbars should never be shown
   * regardless of the respective sizes of the scrollpane and child.
   */
  static readonly SCROLLBARS_NEVER: number = 2;
  /**
   * There are 3 ways in which a scroll bar can be displayed.
   * This integer will represent one of these 3 displays -
   * (SCROLLBARS_ALWAYS, SCROLLBARS_AS_NEEDED, SCROLLBARS_NEVER)
   *
   * @serial
   * @see #getScrollbarDisplayPolicy
   */
  scrollbarDisplayPolicy: number = 0;
  /**
   * An adjustable vertical scrollbar.
   * It is important to note that you must <em>NOT</em> call 3
   * {@code Adjustable} methods, namely:
   * {@code setMinimum()}, {@code setMaximum()},
   * {@code setVisibleAmount()}.
   *
   * @serial
   * @see #getVAdjustable
   */
  vAdjustable: ScrollPaneAdjustable = null;
  /**
   * An adjustable horizontal scrollbar.
   * It is important to note that you must <em>NOT</em> call 3
   * {@code Adjustable} methods, namely:
   * {@code setMinimum()}, {@code setMaximum()},
   * {@code setVisibleAmount()}.
   *
   * @serial
   * @see #getHAdjustable
   */
  hAdjustable: ScrollPaneAdjustable = null;
  static readonly base: string = 'scrollpane';
  static nameCounter: number = 0;
  static readonly defaultWheelScroll: boolean = true;
  /**
   * Indicates whether or not scrolling should take place when a
   * MouseWheelEvent is received.
   *
   * @serial
   * @since 1.4
   */
  wheelScrollingEnabled: boolean = false;
  $init_ScrollPane() {
    this.wheelScrollingEnabled = ScrollPane.defaultWheelScroll;
  }
}

$J.define(ScrollPane, 'java.awt.ScrollPane', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'java.awt.Container', ctors: { 'int': '_ScrollPane$int', '': '_ScrollPane$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$ScrollPane', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$ScrollPane', 'setScrollPosition(java.awt.Point)': 'setScrollPosition$Point', 'setScrollPosition(int,int)': 'setScrollPosition$int$int' } });
