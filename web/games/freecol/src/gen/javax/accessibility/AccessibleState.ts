// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/accessibility/AccessibleState.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { AccessibleBundle } from './AccessibleBundle.ts';

/**
 * Class {@code AccessibleState} describes a component's particular state. The
 * actual state of the component is defined as an {@code AccessibleStateSet},
 * which is a composed set of {@code AccessibleStates}.
 * <p>
 * The {@link #toDisplayString()} method allows you to obtain the localized
 * string for a locale independent key from a predefined {@code ResourceBundle}
 * for the keys defined in this class.
 * <p>
 * The constants in this class present a strongly typed enumeration of common
 * object roles. A public constructor for this class has been purposely omitted
 * and applications should use one of the constants from this class. If the
 * constants in this class are not sufficient to describe the role of an object,
 * a subclass should be generated from this class and it should provide
 * constants in a similar manner.
 *
 * @author Willie Walker
 * @author Peter Korn
 */
export class AccessibleState extends AccessibleBundle {
  /**
   * Indicates a window is currently the active window. This includes windows,
   * dialogs, frames, etc. In addition, this state is used to indicate the
   * currently active child of a component such as a list, table, or tree. For
   * example, the active child of a list is the child that is drawn with a
   * rectangle around it.
   *
   * @see AccessibleRole#WINDOW
   * @see AccessibleRole#FRAME
   * @see AccessibleRole#DIALOG
   */
  static ACTIVE: AccessibleState = null;
  /**
   * Indicates this object is currently pressed. This is usually associated
   * with buttons and indicates the user has pressed a mouse button while the
   * pointer was over the button and has not yet released the mouse button.
   *
   * @see AccessibleRole#PUSH_BUTTON
   */
  static PRESSED: AccessibleState = null;
  /**
   * Indicates that the object is armed. This is usually used on buttons that
   * have been pressed but not yet released, and the mouse pointer is still
   * over the button.
   *
   * @see AccessibleRole#PUSH_BUTTON
   */
  static ARMED: AccessibleState = null;
  /**
   * Indicates the current object is busy. This is usually used on objects
   * such as progress bars, sliders, or scroll bars to indicate they are in a
   * state of transition.
   *
   * @see AccessibleRole#PROGRESS_BAR
   * @see AccessibleRole#SCROLL_BAR
   * @see AccessibleRole#SLIDER
   */
  static BUSY: AccessibleState = null;
  /**
   * Indicates this object is currently checked. This is usually used on
   * objects such as toggle buttons, radio buttons, and check boxes.
   *
   * @see AccessibleRole#TOGGLE_BUTTON
   * @see AccessibleRole#RADIO_BUTTON
   * @see AccessibleRole#CHECK_BOX
   */
  static CHECKED: AccessibleState = null;
  /**
   * Indicates the user can change the contents of this object. This is
   * usually used primarily for objects that allow the user to enter text.
   * Other objects, such as scroll bars and sliders, are automatically
   * editable if they are enabled.
   *
   * @see #ENABLED
   */
  static EDITABLE: AccessibleState = null;
  /**
   * Indicates this object allows progressive disclosure of its children. This
   * is usually used with hierarchical objects such as trees and is often
   * paired with the {@code EXPANDED} or {@code COLLAPSED} states.
   *
   * @see #EXPANDED
   * @see #COLLAPSED
   * @see AccessibleRole#TREE
   */
  static EXPANDABLE: AccessibleState = null;
  /**
   * Indicates this object is collapsed. This is usually paired with the
   * {@code EXPANDABLE} state and is used on objects that provide progressive
   * disclosure such as trees.
   *
   * @see #EXPANDABLE
   * @see #EXPANDED
   * @see AccessibleRole#TREE
   */
  static COLLAPSED: AccessibleState = null;
  /**
   * Indicates this object is expanded. This is usually paired with the
   * {@code EXPANDABLE} state and is used on objects that provide progressive
   * disclosure such as trees.
   *
   * @see #EXPANDABLE
   * @see #COLLAPSED
   * @see AccessibleRole#TREE
   */
  static EXPANDED: AccessibleState = null;
  /**
   * Indicates this object is enabled. The absence of this state from an
   * object's state set indicates this object is not enabled. An object that
   * is not enabled cannot be manipulated by the user. In a graphical display,
   * it is usually grayed out.
   */
  static ENABLED: AccessibleState = null;
  /**
   * Indicates this object can accept keyboard focus, which means all events
   * resulting from typing on the keyboard will normally be passed to it when
   * it has focus.
   *
   * @see #FOCUSED
   */
  static FOCUSABLE: AccessibleState = null;
  /**
   * Indicates this object currently has the keyboard focus.
   *
   * @see #FOCUSABLE
   */
  static FOCUSED: AccessibleState = null;
  /**
   * Indicates this object is minimized and is represented only by an icon.
   * This is usually only associated with frames and internal frames.
   *
   * @see AccessibleRole#FRAME
   * @see AccessibleRole#INTERNAL_FRAME
   */
  static ICONIFIED: AccessibleState = null;
  /**
   * Indicates something must be done with this object before the user can
   * interact with an object in a different window. This is usually associated
   * only with dialogs.
   *
   * @see AccessibleRole#DIALOG
   */
  static MODAL: AccessibleState = null;
  /**
   * Indicates this object paints every pixel within its rectangular region. A
   * non-opaque component paints only some of its pixels, allowing the pixels
   * underneath it to "show through". A component that does not fully paint
   * its pixels therefore provides a degree of transparency.
   *
   * @see Accessible#getAccessibleContext
   * @see AccessibleContext#getAccessibleComponent
   * @see AccessibleComponent#getBounds
   */
  static OPAQUE: AccessibleState = null;
  /**
   * Indicates the size of this object is not fixed.
   *
   * @see Accessible#getAccessibleContext
   * @see AccessibleContext#getAccessibleComponent
   * @see AccessibleComponent#getSize
   * @see AccessibleComponent#setSize
   */
  static RESIZABLE: AccessibleState = null;
  /**
   * Indicates this object allows more than one of its children to be selected
   * at the same time.
   *
   * @see Accessible#getAccessibleContext
   * @see AccessibleContext#getAccessibleSelection
   * @see AccessibleSelection
   */
  static MULTISELECTABLE: AccessibleState = null;
  /**
   * Indicates this object is the child of an object that allows its children
   * to be selected, and that this child is one of those children that can be
   * selected.
   *
   * @see #SELECTED
   * @see Accessible#getAccessibleContext
   * @see AccessibleContext#getAccessibleSelection
   * @see AccessibleSelection
   */
  static SELECTABLE: AccessibleState = null;
  /**
   * Indicates this object is the child of an object that allows its children
   * to be selected, and that this child is one of those children that has
   * been selected.
   *
   * @see #SELECTABLE
   * @see Accessible#getAccessibleContext
   * @see AccessibleContext#getAccessibleSelection
   * @see AccessibleSelection
   */
  static SELECTED: AccessibleState = null;
  /**
   * Indicates this object, the object's parent, the object's parent's parent,
   * and so on, are all visible. Note that this does not necessarily mean the
   * object is painted on the screen. It might be occluded by some other
   * showing object.
   *
   * @see #VISIBLE
   */
  static SHOWING: AccessibleState = null;
  /**
   * Indicates this object is visible. Note: this means that the object
   * intends to be visible; however, it may not in fact be showing on the
   * screen because one of the objects that this object is contained by is not
   * visible.
   *
   * @see #SHOWING
   */
  static VISIBLE: AccessibleState = null;
  /**
   * Indicates the orientation of this object is vertical. This is usually
   * associated with objects such as scrollbars, sliders, and progress bars.
   *
   * @see #HORIZONTAL
   * @see AccessibleRole#SCROLL_BAR
   * @see AccessibleRole#SLIDER
   * @see AccessibleRole#PROGRESS_BAR
   */
  static VERTICAL: AccessibleState = null;
  /**
   * Indicates the orientation of this object is horizontal. This is usually
   * associated with objects such as scrollbars, sliders, and progress bars.
   *
   * @see #VERTICAL
   * @see AccessibleRole#SCROLL_BAR
   * @see AccessibleRole#SLIDER
   * @see AccessibleRole#PROGRESS_BAR
   */
  static HORIZONTAL: AccessibleState = null;
  /**
   * Indicates this (text) object can contain only a single line of text.
   */
  static SINGLE_LINE: AccessibleState = null;
  /**
   * Indicates this (text) object can contain multiple lines of text.
   */
  static MULTI_LINE: AccessibleState = null;
  /**
   * Indicates this object is transient. An assistive technology should not
   * add a {@code PropertyChange} listener to an object with transient state,
   * as that object will never generate any events. Transient objects are
   * typically created to answer Java Accessibility method queries, but
   * otherwise do not remain linked to the underlying object (for example,
   * those objects underneath lists, tables, and trees in Swing, where only
   * one actual {@code UI Component} does shared rendering duty for all of the
   * data objects underneath the actual list/table/tree elements).
   *
   * @since 1.5
   */
  static TRANSIENT: AccessibleState = null;
  /**
   * Indicates this object is responsible for managing its subcomponents. This
   * is typically used for trees and tables that have a large number of
   * subcomponents and where the objects are created only when needed and
   * otherwise remain virtual. The application should not manage the
   * subcomponents directly.
   *
   * @since 1.5
   */
  static MANAGES_DESCENDANTS: AccessibleState = null;
  /**
   * Indicates that the object state is indeterminate. An example is selected
   * text that is partially bold and partially not bold. In this case the
   * attributes associated with the selected text are indeterminate.
   *
   * @since 1.5
   */
  static INDETERMINATE: AccessibleState = null;
  /**
   * A state indicating that text is truncated by a bounding rectangle and
   * that some of the text is not displayed on the screen. An example is text
   * in a spreadsheet cell that is truncated by the bounds of the cell.
   *
   * @since 1.5
   */
  static TRUNCATED: AccessibleState = null;
  /**
   * Creates a new {@code AccessibleState} using the given locale independent
   * key. This should not be a public method. Instead, it is used to create
   * the constants in this file to make it a strongly typed enumeration.
   * Subclasses of this class should enforce similar policy.
   * <p>
   * The key {@code String} should be a locale independent key for the state.
   * It is not intended to be used as the actual {@code String} to display to
   * the user. To get the localized string, use {@link #toDisplayString()}.
   *
   * @param  key the locale independent name of the state
   * @see AccessibleBundle#toDisplayString
   */
  _AccessibleState(key: string): this {
    this._AccessibleBundle();
    this.key = key;
    return this;
  }
  static $clinit() {
    AccessibleState.ACTIVE = new AccessibleState()._AccessibleState('active');
    AccessibleState.PRESSED = new AccessibleState()._AccessibleState('pressed');
    AccessibleState.ARMED = new AccessibleState()._AccessibleState('armed');
    AccessibleState.BUSY = new AccessibleState()._AccessibleState('busy');
    AccessibleState.CHECKED = new AccessibleState()._AccessibleState('checked');
    AccessibleState.EDITABLE = new AccessibleState()._AccessibleState('editable');
    AccessibleState.EXPANDABLE = new AccessibleState()._AccessibleState('expandable');
    AccessibleState.COLLAPSED = new AccessibleState()._AccessibleState('collapsed');
    AccessibleState.EXPANDED = new AccessibleState()._AccessibleState('expanded');
    AccessibleState.ENABLED = new AccessibleState()._AccessibleState('enabled');
    AccessibleState.FOCUSABLE = new AccessibleState()._AccessibleState('focusable');
    AccessibleState.FOCUSED = new AccessibleState()._AccessibleState('focused');
    AccessibleState.ICONIFIED = new AccessibleState()._AccessibleState('iconified');
    AccessibleState.MODAL = new AccessibleState()._AccessibleState('modal');
    AccessibleState.OPAQUE = new AccessibleState()._AccessibleState('opaque');
    AccessibleState.RESIZABLE = new AccessibleState()._AccessibleState('resizable');
    AccessibleState.MULTISELECTABLE = new AccessibleState()._AccessibleState('multiselectable');
    AccessibleState.SELECTABLE = new AccessibleState()._AccessibleState('selectable');
    AccessibleState.SELECTED = new AccessibleState()._AccessibleState('selected');
    AccessibleState.SHOWING = new AccessibleState()._AccessibleState('showing');
    AccessibleState.VISIBLE = new AccessibleState()._AccessibleState('visible');
    AccessibleState.VERTICAL = new AccessibleState()._AccessibleState('vertical');
    AccessibleState.HORIZONTAL = new AccessibleState()._AccessibleState('horizontal');
    AccessibleState.SINGLE_LINE = new AccessibleState()._AccessibleState('singleline');
    AccessibleState.MULTI_LINE = new AccessibleState()._AccessibleState('multiline');
    AccessibleState.TRANSIENT = new AccessibleState()._AccessibleState('transient');
    AccessibleState.MANAGES_DESCENDANTS = new AccessibleState()._AccessibleState('managesDescendants');
    AccessibleState.INDETERMINATE = new AccessibleState()._AccessibleState('indeterminate');
    AccessibleState.TRUNCATED = new AccessibleState()._AccessibleState('truncated');
  }
}

$J.define(AccessibleState, 'javax.accessibility.AccessibleState', { kind: 'class', sup: 'javax.accessibility.AccessibleBundle', ctors: { 'java.lang.String': '_AccessibleState' }, clinit: true, lazy: ['ACTIVE', 'PRESSED', 'ARMED', 'BUSY', 'CHECKED', 'EDITABLE', 'EXPANDABLE', 'COLLAPSED', 'EXPANDED', 'ENABLED', 'FOCUSABLE', 'FOCUSED', 'ICONIFIED', 'MODAL', 'OPAQUE', 'RESIZABLE', 'MULTISELECTABLE', 'SELECTABLE', 'SELECTED', 'SHOWING', 'VISIBLE', 'VERTICAL', 'HORIZONTAL', 'SINGLE_LINE', 'MULTI_LINE', 'TRANSIENT', 'MANAGES_DESCENDANTS', 'INDETERMINATE', 'TRUNCATED'] });
