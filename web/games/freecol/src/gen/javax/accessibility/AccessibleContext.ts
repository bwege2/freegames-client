// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/accessibility/AccessibleContext.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

let PropertyChangeEvent, AccessibleRelationSet, AWTAccessor;

/**
 * {@code AccessibleContext} represents the minimum information all accessible
 * objects return. This information includes the accessible name, description,
 * role, and state of the object, as well as information about its parent and
 * children. {@code AccessibleContext} also contains methods for obtaining more
 * specific accessibility information about a component. If the component
 * supports them, these methods will return an object that implements one or
 * more of the following interfaces:
 * <ul>
 *   <li>{@link AccessibleAction} - the object can perform one or more actions.
 *   This interface provides the standard mechanism for an assistive technology
 *   to determine what those actions are and tell the object to perform them.
 *   Any object that can be manipulated should support this interface.
 *   <li>{@link AccessibleComponent} - the object has a graphical
 *   representation. This interface provides the standard mechanism for an
 *   assistive technology to determine and set the graphical representation of
 *   the object. Any object that is rendered on the screen should support this
 *   interface.
 *   <li>{@link AccessibleSelection} - the object allows its children to be
 *   selected. This interface provides the standard mechanism for an assistive
 *   technology to determine the currently selected children of the object as
 *   well as modify its selection set. Any object that has children that can be
 *   selected should support this interface.
 *   <li>{@link AccessibleText} - the object presents editable textual
 *   information on the display. This interface provides the standard mechanism
 *   for an assistive technology to access that text via its content,
 *   attributes, and spatial location. Any object that contains editable text
 *   should support this interface.
 *   <li>{@link AccessibleValue} - the object supports a numerical value. This
 *   interface provides the standard mechanism for an assistive technology to
 *   determine and set the current value of the object, as well as obtain its
 *   minimum and maximum values. Any object that supports a numerical value
 *   should support this interface.
 * </ul>
 *
 * @author Peter Korn
 * @author Hans Muller
 * @author Willie Walker
 * @author Lynn Monsanto
 */
export class AccessibleContext extends JObject {
  /**
   * The {@code AppContext} that should be used to dispatch events for this
   * {@code AccessibleContext}.
   */
  targetAppContext: AppContext = null;
  /**
   * Constant used to determine when the {@link #accessibleName} property has
   * changed. The old value in the {@code PropertyChangeEvent} will be the old
   * {@code accessibleName} and the new value will be the new
   * {@code accessibleName}.
   *
   * @see #getAccessibleName
   * @see #addPropertyChangeListener
   */
  static readonly ACCESSIBLE_NAME_PROPERTY: string = 'AccessibleName';
  /**
   * Constant used to determine when the {@link #accessibleDescription}
   * property has changed. The old value in the {@code PropertyChangeEvent}
   * will be the old {@code accessibleDescription} and the new value will be
   * the new {@code accessibleDescription}.
   *
   * @see #getAccessibleDescription
   * @see #addPropertyChangeListener
   */
  static readonly ACCESSIBLE_DESCRIPTION_PROPERTY: string = 'AccessibleDescription';
  /**
   * Constant used to determine when the {@code accessibleStateSet} property
   * has changed. The old value will be the old {@code AccessibleState} and
   * the new value will be the new {@code AccessibleState} in the
   * {@code accessibleStateSet}. For example, if a component that supports the
   * vertical and horizontal states changes its orientation from vertical to
   * horizontal, the old value will be {@code AccessibleState.VERTICAL} and
   * the new value will be {@code AccessibleState.HORIZONTAL}. Please note
   * that either value can also be {@code null}. For example, when a component
   * changes from being enabled to disabled, the old value will be
   * {@code AccessibleState.ENABLED} and the new value will be {@code null}.
   *
   * @see #getAccessibleStateSet
   * @see AccessibleState
   * @see AccessibleStateSet
   * @see #addPropertyChangeListener
   */
  static readonly ACCESSIBLE_STATE_PROPERTY: string = 'AccessibleState';
  /**
   * Constant used to determine when the {@code accessibleValue} property has
   * changed. The old value in the {@code PropertyChangeEvent} will be a
   * {@code Number} representing the old value and the new value will be a
   * {@code Number} representing the new value.
   *
   * @see #getAccessibleValue
   * @see #addPropertyChangeListener
   */
  static readonly ACCESSIBLE_VALUE_PROPERTY: string = 'AccessibleValue';
  /**
   * Constant used to determine when the {@code accessibleSelection} has
   * changed. The old and new values in the {@code PropertyChangeEvent} are
   * currently reserved for future use.
   *
   * @see #getAccessibleSelection
   * @see #addPropertyChangeListener
   */
  static readonly ACCESSIBLE_SELECTION_PROPERTY: string = 'AccessibleSelection';
  /**
   * Constant used to determine when the {@code accessibleText} caret has
   * changed. The old value in the {@code PropertyChangeEvent} will be an
   * integer representing the old caret position, and the new value will be an
   * integer representing the new/current caret position.
   *
   * @see #addPropertyChangeListener
   */
  static readonly ACCESSIBLE_CARET_PROPERTY: string = 'AccessibleCaret';
  /**
   * Constant used to determine when the visual appearance of the object has
   * changed. The old and new values in the {@code PropertyChangeEvent} are
   * currently reserved for future use.
   *
   * @see #addPropertyChangeListener
   */
  static readonly ACCESSIBLE_VISIBLE_DATA_PROPERTY: string = 'AccessibleVisibleData';
  /**
   * Constant used to determine when {@code Accessible} children are
   * added/removed from the object. If an {@code Accessible} child is being
   * added, the old value will be {@code null} and the new value will be the
   * {@code Accessible} child. If an {@code Accessible} child is being
   * removed, the old value will be the {@code Accessible} child, and the new
   * value will be {@code null}.
   *
   * @see #addPropertyChangeListener
   */
  static readonly ACCESSIBLE_CHILD_PROPERTY: string = 'AccessibleChild';
  /**
   * Constant used to determine when the active descendant of a component has
   * changed. The active descendant is used for objects such as list, tree,
   * and table, which may have transient children. When the active descendant
   * has changed, the old value of the property change event will be the
   * {@code Accessible} representing the previous active child, and the new
   * value will be the {@code Accessible} representing the current active
   * child.
   *
   * @see #addPropertyChangeListener
   */
  static readonly ACCESSIBLE_ACTIVE_DESCENDANT_PROPERTY: string = 'AccessibleActiveDescendant';
  /**
   * Constant used to indicate that the table caption has changed. The old
   * value in the {@code PropertyChangeEvent} will be an {@code Accessible}
   * representing the previous table caption and the new value will be an
   * {@code Accessible} representing the new table caption.
   *
   * @see Accessible
   * @see AccessibleTable
   */
  static readonly ACCESSIBLE_TABLE_CAPTION_CHANGED: string = 'accessibleTableCaptionChanged';
  /**
   * Constant used to indicate that the table summary has changed. The old
   * value in the {@code PropertyChangeEvent} will be an {@code Accessible}
   * representing the previous table summary and the new value will be an
   * {@code Accessible} representing the new table summary.
   *
   * @see Accessible
   * @see AccessibleTable
   */
  static readonly ACCESSIBLE_TABLE_SUMMARY_CHANGED: string = 'accessibleTableSummaryChanged';
  /**
   * Constant used to indicate that table data has changed. The old value in
   * the {@code PropertyChangeEvent} will be {@code null} and the new value
   * will be an {@code AccessibleTableModelChange} representing the table
   * change.
   *
   * @see AccessibleTable
   * @see AccessibleTableModelChange
   */
  static readonly ACCESSIBLE_TABLE_MODEL_CHANGED: string = 'accessibleTableModelChanged';
  /**
   * Constant used to indicate that the row header has changed. The old value
   * in the {@code PropertyChangeEvent} will be {@code null} and the new value
   * will be an {@code AccessibleTableModelChange} representing the header
   * change.
   *
   * @see AccessibleTable
   * @see AccessibleTableModelChange
   */
  static readonly ACCESSIBLE_TABLE_ROW_HEADER_CHANGED: string = 'accessibleTableRowHeaderChanged';
  /**
   * Constant used to indicate that the row description has changed. The old
   * value in the {@code PropertyChangeEvent} will be {@code null} and the new
   * value will be an {@code Integer} representing the row index.
   *
   * @see AccessibleTable
   */
  static readonly ACCESSIBLE_TABLE_ROW_DESCRIPTION_CHANGED: string = 'accessibleTableRowDescriptionChanged';
  /**
   * Constant used to indicate that the column header has changed. The old
   * value in the {@code PropertyChangeEvent} will be {@code null} and the new
   * value will be an {@code AccessibleTableModelChange} representing the
   * header change.
   *
   * @see AccessibleTable
   * @see AccessibleTableModelChange
   */
  static readonly ACCESSIBLE_TABLE_COLUMN_HEADER_CHANGED: string = 'accessibleTableColumnHeaderChanged';
  /**
   * Constant used to indicate that the column description has changed. The
   * old value in the {@code PropertyChangeEvent} will be {@code null} and the
   * new value will be an {@code Integer} representing the column index.
   *
   * @see AccessibleTable
   */
  static readonly ACCESSIBLE_TABLE_COLUMN_DESCRIPTION_CHANGED: string = 'accessibleTableColumnDescriptionChanged';
  /**
   * Constant used to indicate that the supported set of actions has changed.
   * The old value in the {@code PropertyChangeEvent} will be an
   * {@code Integer} representing the old number of actions supported and the
   * new value will be an {@code Integer} representing the new number of
   * actions supported.
   *
   * @see AccessibleAction
   */
  static readonly ACCESSIBLE_ACTION_PROPERTY: string = 'accessibleActionProperty';
  /**
   * Constant used to indicate that a hypertext element has received focus.
   * The old value in the {@code PropertyChangeEvent} will be an
   * {@code Integer} representing the start index in the document of the
   * previous element that had focus and the new value will be an
   * {@code Integer} representing the start index in the document of the
   * current element that has focus. A value of -1 indicates that an element
   * does not or did not have focus.
   *
   * @see AccessibleHyperlink
   */
  static readonly ACCESSIBLE_HYPERTEXT_OFFSET: string = 'AccessibleHypertextOffset';
  /**
   * {@code PropertyChangeEvent} which indicates that text has changed.
   * <br>
   * For text insertion, the {@code oldValue} is {@code null} and the
   * {@code newValue} is an {@code AccessibleTextSequence} specifying the text
   * that was inserted.
   * <br>
   * For text deletion, the {@code oldValue} is an
   * {@code AccessibleTextSequence} specifying the text that was deleted and
   * the {@code newValue} is {@code null}.
   * <br>
   * For text replacement, the {@code oldValue} is an
   * {@code AccessibleTextSequence} specifying the old text and the
   * {@code newValue} is an {@code AccessibleTextSequence} specifying the new
   * text.
   *
   * @see #getAccessibleText
   * @see #addPropertyChangeListener
   * @see AccessibleTextSequence
   */
  static readonly ACCESSIBLE_TEXT_PROPERTY: string = 'AccessibleText';
  /**
   * {@code PropertyChangeEvent} which indicates that a significant change has
   * occurred to the children of a component like a tree or text. This change
   * notifies the event listener that it needs to reacquire the state of the
   * subcomponents. The {@code oldValue} is {@code null} and the
   * {@code newValue} is the component whose children have become invalid.
   *
   * @see #getAccessibleText
   * @see #addPropertyChangeListener
   * @see AccessibleTextSequence
   * @since 1.5
   */
  static readonly ACCESSIBLE_INVALIDATE_CHILDREN: string = 'accessibleInvalidateChildren';
  /**
   * {@code PropertyChangeEvent} which indicates that text attributes have
   * changed.
   * <br>
   * For attribute insertion, the {@code oldValue} is {@code null} and the
   * {@code newValue} is an {@code AccessibleAttributeSequence} specifying the
   * attributes that were inserted.
   * <br>
   * For attribute deletion, the {@code oldValue} is an
   * {@code AccessibleAttributeSequence} specifying the attributes that were
   * deleted and the {@code newValue} is {@code null}.
   * <br>
   * For attribute replacement, the {@code oldValue} is an
   * {@code AccessibleAttributeSequence} specifying the old attributes and the
   * {@code newValue} is an {@code AccessibleAttributeSequence} specifying the
   * new attributes.
   *
   * @see #getAccessibleText
   * @see #addPropertyChangeListener
   * @see AccessibleAttributeSequence
   * @since 1.5
   */
  static readonly ACCESSIBLE_TEXT_ATTRIBUTES_CHANGED: string = 'accessibleTextAttributesChanged';
  /**
   * {@code PropertyChangeEvent} which indicates that a change has occurred in
   * a component's bounds. The {@code oldValue} is the old component bounds
   * and the {@code newValue} is the new component bounds.
   *
   * @see #addPropertyChangeListener
   * @since 1.5
   */
  static readonly ACCESSIBLE_COMPONENT_BOUNDS_CHANGED: string = 'accessibleComponentBoundsChanged';
  /**
   * The accessible parent of this object.
   *
   * @see #getAccessibleParent
   * @see #setAccessibleParent
   */
  accessibleParent: Accessible = null;
  /**
   * A localized String containing the name of the object.
   *
   * @see #getAccessibleName
   * @see #setAccessibleName
   */
  accessibleName: string = null;
  /**
   * A localized String containing the description of the object.
   *
   * @see #getAccessibleDescription
   * @see #setAccessibleDescription
   */
  accessibleDescription: string = null;
  /**
   * Used to handle the listener list for property change events.
   *
   * @see #addPropertyChangeListener
   * @see #removePropertyChangeListener
   * @see #firePropertyChange
   */
  accessibleChangeSupport: PropertyChangeSupport = null;
  /**
   * Used to represent the context's relation set.
   *
   * @see #getAccessibleRelationSet
   */
  relationSet: AccessibleRelationSet = null;
  nativeAXResource: any = null;
  /**
   * Constructor for subclasses to call.
   */
  _AccessibleContext(): this {
    this.accessibleParent = null;
    this.accessibleName = null;
    this.accessibleDescription = null;
    this.accessibleChangeSupport = null;
    this.relationSet = new AccessibleRelationSet()._AccessibleRelationSet$();
    return this;
  }
  /**
   * Gets the {@code accessibleName} property of this object. The
   * {@code accessibleName} property of an object is a localized
   * {@code String} that designates the purpose of the object. For example,
   * the {@code accessibleName} property of a label or button might be the
   * text of the label or button itself. In the case of an object that doesn't
   * display its name, the {@code accessibleName} should still be set. For
   * example, in the case of a text field used to enter the name of a city,
   * the {@code accessibleName} for the {@code en_US} locale could be 'city.'
   *
   * @return the localized name of the object; {@code null} if this object
   *         does not have a name
   * @see #setAccessibleName
   */
  getAccessibleName(): string {
    return this.accessibleName;
  }
  /**
   * Sets the localized accessible name of this object. Changing the name will
   * cause a {@code PropertyChangeEvent} to be fired for the
   * {@code ACCESSIBLE_NAME_PROPERTY} property.
   *
   * @param  s the new localized name of the object
   * @see #getAccessibleName
   * @see #addPropertyChangeListener
   */
  setAccessibleName(s: string): void {
    let oldName = this.accessibleName;
    this.accessibleName = s;
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, oldName, this.accessibleName);
  }
  /**
   * Gets the {@code accessibleDescription} property of this object. The
   * {@code accessibleDescription} property of this object is a short
   * localized phrase describing the purpose of the object. For example, in
   * the case of a 'Cancel' button, the {@code accessibleDescription} could be
   * 'Ignore changes and close dialog box.'
   *
   * @return the localized description of the object; {@code null} if this
   *         object does not have a description
   * @see #setAccessibleDescription
   */
  getAccessibleDescription(): string {
    return this.accessibleDescription;
  }
  /**
   * Sets the accessible description of this object. Changing the name will
   * cause a {@code PropertyChangeEvent} to be fired for the
   * {@code ACCESSIBLE_DESCRIPTION_PROPERTY} property.
   *
   * @param  s the new localized description of the object
   * @see #setAccessibleName
   * @see #addPropertyChangeListener
   */
  setAccessibleDescription(s: string): void {
    let oldDescription = this.accessibleDescription;
    this.accessibleDescription = s;
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_DESCRIPTION_PROPERTY, oldDescription, this.accessibleDescription);
  }
  /**
   * Gets the {@code Accessible} parent of this object.
   *
   * @return the {@code Accessible} parent of this object; {@code null} if
   *         this object does not have an {@code Accessible} parent
   */
  getAccessibleParent(): Accessible {
    return this.accessibleParent;
  }
  /**
   * Sets the {@code Accessible} parent of this object. This is meant to be
   * used only in the situations where the actual component's parent should
   * not be treated as the component's accessible parent and is a method that
   * should only be called by the parent of the accessible child.
   *
   * @param  a {@code Accessible} to be set as the parent
   */
  setAccessibleParent(a: Accessible): void {
    this.accessibleParent = a;
  }
  /**
   * Gets the {@code AccessibleSelection} associated with this object which
   * allows its {@code Accessible} children to be selected.
   *
   * @return {@code AccessibleSelection} if supported by object; else return
   *         {@code null}
   * @see AccessibleSelection
   */
  getAccessibleSelection$(): AccessibleSelection {
    return null;
  }
  /**
   * Gets the {@code AccessibleRelationSet} associated with an object.
   *
   * @return an {@code AccessibleRelationSet} if supported by object;
   *         otherwise return {@code null}
   * @see AccessibleRelationSet
   * @since 1.3
   */
  getAccessibleRelationSet(): AccessibleRelationSet {
    return this.relationSet;
  }
  /**
   * Support for reporting bound property changes. If {@code oldValue} and
   * {@code newValue} are not equal and the {@code PropertyChangeEvent}
   * listener list is not empty, then fire a {@code PropertyChange} event to
   * each listener. In general, this is for use by the {@code Accessible}
   * objects themselves and should not be called by an application program.
   *
   * @param  propertyName The programmatic name of the property that was
   *         changed
   * @param  oldValue The old value of the property
   * @param  newValue The new value of the property
   * @see PropertyChangeSupport
   * @see #addPropertyChangeListener
   * @see #removePropertyChangeListener
   * @see #ACCESSIBLE_NAME_PROPERTY
   * @see #ACCESSIBLE_DESCRIPTION_PROPERTY
   * @see #ACCESSIBLE_STATE_PROPERTY
   * @see #ACCESSIBLE_VALUE_PROPERTY
   * @see #ACCESSIBLE_SELECTION_PROPERTY
   * @see #ACCESSIBLE_TEXT_PROPERTY
   * @see #ACCESSIBLE_VISIBLE_DATA_PROPERTY
   */
  firePropertyChange(propertyName: string, oldValue: any, newValue: any): void {
    if (this.accessibleChangeSupport != null) {
      if (newValue instanceof PropertyChangeEvent) {
        let pce = newValue;
        this.accessibleChangeSupport.firePropertyChange$PropertyChangeEvent(pce);
      } else {
        this.accessibleChangeSupport.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
      }
    }
  }
  static $clinit() {
    AWTAccessor.setAccessibleContextAccessor(new (AccessibleContext$1())());
  }
}

let $AccessibleContext$1: any = null;
/** An anonymous class (AccessibleContext.java:94). */
function AccessibleContext$1(): any {
  return $AccessibleContext$1 ??= $J.local(class extends JObject {
  }, 'javax.accessibility.AccessibleContext$1', ['sun.awt.AWTAccessor$AccessibleContextAccessor']);
}

$J.define(AccessibleContext, 'javax.accessibility.AccessibleContext', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_AccessibleContext' }, meths: { 'getAccessibleSelection()': 'getAccessibleSelection$', 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, clinit: true, lazy: [] });
$J.module(() => {
  PropertyChangeEvent = $J.load('java.beans.PropertyChangeEvent');
  AccessibleRelationSet = $J.load('javax.accessibility.AccessibleRelationSet');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
