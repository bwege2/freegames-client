// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/accessibility/AccessibleRelationSet.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Vector } from '../../../jre/index.ts';

/**
 * Class {@code AccessibleRelationSet} determines a component's relation set.
 * The relation set of a component is a set of {@code AccessibleRelation}
 * objects that describe the component's relationships with other components.
 *
 * @author Lynn Monsanto
 * @see AccessibleRelation
 * @since 1.3
 */
export class AccessibleRelationSet extends JObject {
  /**
   * Each entry in the {@code Vector} represents an
   * {@code AccessibleRelation}.
   *
   * @see #add
   * @see #addAll
   * @see #remove
   * @see #contains
   * @see #get
   * @see #size
   * @see #toArray
   * @see #clear
   */
  relations: Vector<AccessibleRelation> = null;
  $init_AccessibleRelationSet() {
    this.relations = null;
  }
  /**
   * Creates a new empty relation set.
   */
  _AccessibleRelationSet$(): this {
    this.$init_AccessibleRelationSet();
    this.relations = null;
    return this;
  }
  /**
   * Adds a new relation to the current relation set. If the relation is
   * already in the relation set, the target(s) of the specified relation is
   * merged with the target(s) of the existing relation. Otherwise, the new
   * relation is added to the relation set.
   *
   * @param  relation the relation to add to the relation set
   * @return {@code true} if relation is added to the relation set;
   *         {@code false} if the relation set is unchanged
   */
  add(relation: AccessibleRelation): boolean {
    if (this.relations == null) {
      this.relations = new Vector();
    }
    let existingRelation = this.get(relation.getKey());
    if (existingRelation == null) {
      this.relations.addElement(relation);
      return true;
    } else {
      let existingTarget = existingRelation.getTarget();
      let newTarget = relation.getTarget();
      let mergedLength = (existingTarget.length + newTarget.length) | 0;
      let mergedTarget = $J.newArray(mergedLength, null);
      for (let i = 0; i < existingTarget.length; i++) {
        mergedTarget[i] = existingTarget[i];
      }
      for (let i = existingTarget.length, j = 0; i < mergedLength; i++, j++) {
        mergedTarget[i] = newTarget[j];
      }
      existingRelation.setTarget$ObjectArr(mergedTarget);
    }
    return true;
  }
  /**
   * Returns whether the relation set contains a relation that matches the
   * specified key.
   *
   * @param  key the {@code AccessibleRelation} key
   * @return {@code true} if the relation is in the relation set; otherwise
   *         {@code false}
   */
  contains(key: string): boolean {
    return this.get(key) != null;
  }
  /**
   * Returns the relation that matches the specified key.
   *
   * @param  key the {@code AccessibleRelation} key
   * @return the relation, if one exists, that matches the specified key.
   *         Otherwise, {@code null} is returned.
   */
  get(key: string): AccessibleRelation {
    if (this.relations == null) {
      return null;
    } else {
      let len = this.relations.size();
      for (let i = 0; i < len; i++) {
        let relation = this.relations.elementAt(i);
        if (relation != null && $J.equals(relation.getKey(), key)) {
          return relation;
        }
      }
      return null;
    }
  }
  /**
   * Creates a localized string representing all the relations in the set
   * using the default locale.
   *
   * @return comma separated localized string
   * @see AccessibleBundle#toDisplayString
   */
  toString(): string {
    let ret = '';
    if ((this.relations != null) && (this.relations.size() > 0)) {
      ret = (this.relations.elementAt(0)).toDisplayString$();
      for (let i = 1; i < this.relations.size(); i++) {
        ret = ret + ',' + (this.relations.elementAt(i)).toDisplayString$();
      }
    }
    return ret;
  }
}

$J.define(AccessibleRelationSet, 'javax.accessibility.AccessibleRelationSet', { kind: 'class', sup: 'java.lang.Object', ctors: { 'javax.accessibility.AccessibleRelation[]': '_AccessibleRelationSet$AccessibleRelationArr', '': '_AccessibleRelationSet$' } });
