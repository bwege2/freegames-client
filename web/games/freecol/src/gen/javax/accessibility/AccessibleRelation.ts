// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/accessibility/AccessibleRelation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JString } from '../../../jre/index.ts';
import { AccessibleBundle } from './AccessibleBundle.ts';

/**
 * Class {@code AccessibleRelation} describes a relation between the object that
 * implements the {@code AccessibleRelation} and one or more other objects. The
 * actual relations that an object has with other objects are defined as an
 * {@code AccessibleRelationSet}, which is a composed set of
 * {@code AccessibleRelations}.
 * <p>
 * The {@link #toDisplayString()} method allows you to obtain the localized
 * string for a locale independent key from a predefined {@code ResourceBundle}
 * for the keys defined in this class.
 * <p>
 * The constants in this class present a strongly typed enumeration of common
 * object roles. If the constants in this class are not sufficient to describe
 * the role of an object, a subclass should be generated from this class and it
 * should provide constants in a similar manner.
 *
 * @author Lynn Monsanto
 * @since 1.3
 */
export class AccessibleRelation extends AccessibleBundle {
  /**
   * The group of objects that participate in the relation. The relation may
   * be one-to-one or one-to-many. For example, in the case of a
   * {@code LABEL_FOR} relation, the target vector would contain a list of
   * objects labeled by the object that implements this
   * {@code AccessibleRelation}. In the case of a {@code MEMBER_OF} relation,
   * the target vector would contain all of the components that are members of
   * the same group as the object that implements this
   * {@code AccessibleRelation}.
   */
  target: any[] = null;
  /**
   * Indicates an object is a label for one or more target objects.
   *
   * @see #getTarget
   * @see #CONTROLLER_FOR
   * @see #CONTROLLED_BY
   * @see #LABELED_BY
   * @see #MEMBER_OF
   */
  static LABEL_FOR: string = null;
  /**
   * Indicates an object is labeled by one or more target objects.
   *
   * @see #getTarget
   * @see #CONTROLLER_FOR
   * @see #CONTROLLED_BY
   * @see #LABEL_FOR
   * @see #MEMBER_OF
   */
  static LABELED_BY: string = null;
  /**
   * Indicates an object is a member of a group of one or more target objects.
   *
   * @see #getTarget
   * @see #CONTROLLER_FOR
   * @see #CONTROLLED_BY
   * @see #LABEL_FOR
   * @see #LABELED_BY
   */
  static MEMBER_OF: string = null;
  /**
   * Indicates an object is a controller for one or more target objects.
   *
   * @see #getTarget
   * @see #CONTROLLED_BY
   * @see #LABEL_FOR
   * @see #LABELED_BY
   * @see #MEMBER_OF
   */
  static CONTROLLER_FOR: string = null;
  /**
   * Indicates an object is controlled by one or more target objects.
   *
   * @see #getTarget
   * @see #CONTROLLER_FOR
   * @see #LABEL_FOR
   * @see #LABELED_BY
   * @see #MEMBER_OF
   */
  static CONTROLLED_BY: string = null;
  /**
   * Indicates an object is logically contiguous with a second object where
   * the second object occurs after the object. An example is a paragraph of
   * text that runs to the end of a page and continues on the next page with
   * an intervening text footer and/or text header. The two parts of the
   * paragraph are separate text elements but are related in that the second
   * element is a continuation of the first element. In other words, the first
   * element "flows to" the second element.
   *
   * @since 1.5
   */
  static readonly FLOWS_TO: string = 'flowsTo';
  /**
   * Indicates an object is logically contiguous with a second object where
   * the second object occurs before the object. An example is a paragraph of
   * text that runs to the end of a page and continues on the next page with
   * an intervening text footer and/or text header. The two parts of the
   * paragraph are separate text elements but are related in that the second
   * element is a continuation of the first element. In other words, the
   * second element "flows from" the second element.
   *
   * @since 1.5
   */
  static readonly FLOWS_FROM: string = 'flowsFrom';
  /**
   * Indicates that an object is a subwindow of one or more objects.
   *
   * @since 1.5
   */
  static readonly SUBWINDOW_OF: string = 'subwindowOf';
  /**
   * Indicates that an object is a parent window of one or more objects.
   *
   * @since 1.5
   */
  static readonly PARENT_WINDOW_OF: string = 'parentWindowOf';
  /**
   * Indicates that an object has one or more objects embedded in it.
   *
   * @since 1.5
   */
  static readonly EMBEDS: string = 'embeds';
  /**
   * Indicates that an object is embedded in one or more objects.
   *
   * @since 1.5
   */
  static readonly EMBEDDED_BY: string = 'embeddedBy';
  /**
   * Indicates that an object is a child node of one or more objects.
   *
   * @since 1.5
   */
  static readonly CHILD_NODE_OF: string = 'childNodeOf';
  /**
   * Identifies that the target group for a label has changed.
   */
  static readonly LABEL_FOR_PROPERTY: string = 'labelForProperty';
  /**
   * Identifies that the objects that are doing the labeling have changed.
   */
  static readonly LABELED_BY_PROPERTY: string = 'labeledByProperty';
  /**
   * Identifies that group membership has changed.
   */
  static readonly MEMBER_OF_PROPERTY: string = 'memberOfProperty';
  /**
   * Identifies that the controller for the target object has changed.
   */
  static readonly CONTROLLER_FOR_PROPERTY: string = 'controllerForProperty';
  /**
   * Identifies that the target object that is doing the controlling has
   * changed.
   */
  static readonly CONTROLLED_BY_PROPERTY: string = 'controlledByProperty';
  /**
   * Indicates the {@code FLOWS_TO} relation between two objects has changed.
   *
   * @since 1.5
   */
  static readonly FLOWS_TO_PROPERTY: string = 'flowsToProperty';
  /**
   * Indicates the {@code FLOWS_FROM} relation between two objects has
   * changed.
   *
   * @since 1.5
   */
  static readonly FLOWS_FROM_PROPERTY: string = 'flowsFromProperty';
  /**
   * Indicates the {@code SUBWINDOW_OF} relation between two or more objects
   * has changed.
   *
   * @since 1.5
   */
  static readonly SUBWINDOW_OF_PROPERTY: string = 'subwindowOfProperty';
  /**
   * Indicates the {@code PARENT_WINDOW_OF} relation between two or more
   * objects has changed.
   *
   * @since 1.5
   */
  static readonly PARENT_WINDOW_OF_PROPERTY: string = 'parentWindowOfProperty';
  /**
   * Indicates the {@code EMBEDS} relation between two or more objects has
   * changed.
   *
   * @since 1.5
   */
  static readonly EMBEDS_PROPERTY: string = 'embedsProperty';
  /**
   * Indicates the {@code EMBEDDED_BY} relation between two or more objects
   * has changed.
   *
   * @since 1.5
   */
  static readonly EMBEDDED_BY_PROPERTY: string = 'embeddedByProperty';
  /**
   * Indicates the {@code CHILD_NODE_OF} relation between two or more objects
   * has changed.
   *
   * @since 1.5
   */
  static readonly CHILD_NODE_OF_PROPERTY: string = 'childNodeOfProperty';
  $init_AccessibleRelation() {
    this.target = $J.newArray(0, null);
  }
  /**
   * Create a new {@code AccessibleRelation} using the given locale
   * independent key. The key {@code String} should be a locale independent
   * key for the relation. It is not intended to be used as the actual
   * {@code String} to display to the user. To get the localized string, use
   * {@link #toDisplayString()}.
   *
   * @param  key the locale independent name of the relation
   * @see AccessibleBundle#toDisplayString
   */
  _AccessibleRelation$String(key: string): this {
    this._AccessibleBundle();
    this.$init_AccessibleRelation();
    this.key = key;
    this.target = null;
    return this;
  }
  /**
   * Creates a new {@code AccessibleRelation} using the given locale
   * independent key. The key {@code String} should be a locale independent
   * key for the relation. It is not intended to be used as the actual
   * {@code String} to display to the user. To get the localized string, use
   * {@link #toDisplayString()}.
   *
   * @param  key the locale independent name of the relation
   * @param  target the target object for this relation
   * @see AccessibleBundle#toDisplayString
   */
  _AccessibleRelation$String$Object(key: string, target: any): this {
    this._AccessibleBundle();
    this.$init_AccessibleRelation();
    this.key = key;
    this.target = $J.newArray(1, null);
    this.target[0] = target;
    return this;
  }
  /**
   * Returns the key for this relation.
   *
   * @return the key for this relation
   * @see #CONTROLLER_FOR
   * @see #CONTROLLED_BY
   * @see #LABEL_FOR
   * @see #LABELED_BY
   * @see #MEMBER_OF
   */
  getKey(): string {
    return this.key;
  }
  /**
   * Returns the target objects for this relation.
   *
   * @return an array containing the target objects for this relation
   */
  getTarget(): any[] {
    if (this.target == null) {
      this.target = $J.newArray(0, null);
    }
    let retval = $J.newArray(this.target.length, null);
    for (let i = 0; i < this.target.length; i++) {
      retval[i] = this.target[i];
    }
    return retval;
  }
  /**
   * Sets the target object for this relation.
   *
   * @param  target the target object for this relation
   */
  setTarget$Object(target: any): void {
    this.target = $J.newArray(1, null);
    this.target[0] = target;
  }
  /**
   * Sets the target objects for this relation.
   *
   * @param  target an array containing the target objects for this relation
   */
  setTarget$ObjectArr(target: any[]): void {
    this.target = target;
  }
  static $clinit() {
    AccessibleRelation.LABEL_FOR = JString.newString('labelFor');
    AccessibleRelation.LABELED_BY = JString.newString('labeledBy');
    AccessibleRelation.MEMBER_OF = JString.newString('memberOf');
    AccessibleRelation.CONTROLLER_FOR = JString.newString('controllerFor');
    AccessibleRelation.CONTROLLED_BY = JString.newString('controlledBy');
  }
}

$J.define(AccessibleRelation, 'javax.accessibility.AccessibleRelation', { kind: 'class', sup: 'javax.accessibility.AccessibleBundle', ctors: { 'java.lang.String,java.lang.Object[]': '_AccessibleRelation$String$ObjectArr', 'java.lang.String,java.lang.Object': '_AccessibleRelation$String$Object', 'java.lang.String': '_AccessibleRelation$String' }, meths: { 'setTarget(java.lang.Object[])': 'setTarget$ObjectArr', 'setTarget(java.lang.Object)': 'setTarget$Object' }, clinit: true, lazy: ['LABEL_FOR', 'LABELED_BY', 'MEMBER_OF', 'CONTROLLER_FOR', 'CONTROLLED_BY'] });
