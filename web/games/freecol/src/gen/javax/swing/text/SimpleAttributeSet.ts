// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/SimpleAttributeSet.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, CloneNotSupportedException, Collections, JObject, LinkedHashMap } from '../../../../jre/index.ts';

let AttributeSet, StyleConstants;

/**
 * A straightforward implementation of MutableAttributeSet using a
 * hash table.
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
 * @author Tim Prinzing
 */
export class SimpleAttributeSet extends JObject {
  /**
   * An empty attribute set.
   */
  static EMPTY: AttributeSet = null;
  table: LinkedHashMap<any, any> = null;
  $init_SimpleAttributeSet() {
    this.table = new LinkedHashMap(3);
  }
  /**
   * Creates a new attribute set.
   */
  _SimpleAttributeSet$(): this {
    this.$init_SimpleAttributeSet();
    return this;
  }
  /**
   * Creates a new attribute set based on a supplied set of attributes.
   *
   * @param source the set of attributes
   */
  _SimpleAttributeSet$AttributeSet(source: AttributeSet): this {
    this.$init_SimpleAttributeSet();
    this.addAttributes(source);
    return this;
  }
  /**
   * Gets a count of the number of attributes.
   *
   * @return the count
   */
  getAttributeCount(): number {
    return this.table.size();
  }
  /**
   * Tells whether a given attribute is defined.
   *
   * @param attrName the attribute name
   * @return true if the attribute is defined
   */
  isDefined(attrName: any): boolean {
    return this.table.containsKey(attrName);
  }
  /**
   * Compares two attribute sets.
   *
   * @param attr the second attribute set
   * @return true if the sets are equal, false otherwise
   */
  isEqual(attr: AttributeSet): boolean {
    return ((this.getAttributeCount() === attr.getAttributeCount()) && this.containsAttributes(attr));
  }
  /**
   * Makes a copy of the attributes.
   *
   * @return the copy
   */
  copyAttributes(): AttributeSet {
    return this.clone();
  }
  /**
   * Gets the names of the attributes in the set.
   *
   * @return the names as an <code>Enumeration</code>
   */
  getAttributeNames(): Enumeration<any> {
    return Collections.enumeration(this.table.keySet());
  }
  /**
   * Gets the value of an attribute.
   *
   * @param name the attribute name
   * @return the value
   */
  getAttribute(name: any): any {
    let value = this.table.get(name);
    if (value == null) {
      let parent = this.getResolveParent();
      if (parent != null) {
        value = parent.getAttribute(name);
      }
    }
    return value;
  }
  /**
   * Checks whether the attribute list contains all the
   * specified name/value pairs.
   *
   * @param attributes the attribute list
   * @return true if the list contains all the name/value pairs
   */
  containsAttributes(attributes: AttributeSet): boolean {
    let result = true;
    let names = attributes.getAttributeNames();
    while (result && names.hasMoreElements()) {
      let name = names.nextElement();
      result = $J.equals(attributes.getAttribute(name), this.getAttribute(name));
    }
    return result;
  }
  /**
   * Adds an attribute to the list.
   *
   * @param name the attribute name
   * @param value the attribute value
   */
  addAttribute(name: any, value: any): void {
    this.table.put(name, value);
  }
  /**
   * Adds a set of attributes to the list.
   *
   * @param attributes the set of attributes to add
   */
  addAttributes(attributes: AttributeSet): void {
    let names = attributes.getAttributeNames();
    while (names.hasMoreElements()) {
      let name = names.nextElement();
      this.addAttribute(name, attributes.getAttribute(name));
    }
  }
  /**
   * Removes an attribute from the list.
   *
   * @param name the attribute name
   */
  removeAttribute(name: any): void {
    this.table.remove(name);
  }
  /**
   * Removes a set of attributes from the list.
   *
   * @param attributes the set of attributes to remove
   */
  removeAttributes$AttributeSet(attributes: AttributeSet): void {
    if (attributes === this) {
      this.table.clear();
    } else {
      let names = attributes.getAttributeNames();
      while (names.hasMoreElements()) {
        let name = names.nextElement();
        let value = attributes.getAttribute(name);
        if ($J.equals(value, this.getAttribute(name))) {
          this.removeAttribute(name);
        }
      }
    }
  }
  /**
   * Gets the resolving parent.  This is the set
   * of attributes to resolve through if an attribute
   * isn't defined locally.  This is null if there
   * are no other sets of attributes to resolve
   * through.
   *
   * @return the parent
   */
  getResolveParent(): AttributeSet {
    return this.table.get(StyleConstants.ResolveAttribute);
  }
  /**
   * Clones a set of attributes.
   *
   * @return the new set of attributes
   */
  clone(): any {
    let attr: SimpleAttributeSet;
    try {
      attr = super.clone();
      attr.table = this.table.clone();
    } catch ($e0) {
      if ($J.isa($e0, CloneNotSupportedException)) {
        let cnse = $J.exc($e0);
        attr = null;
      } else {
        throw $e0;
      }
    }
    return attr;
  }
  /**
   * Returns a hashcode for this set of attributes.
   * @return     a hashcode value for this set of attributes.
   */
  hashCode(): number {
    return this.table.hashCode();
  }
  /**
   * Compares this object to the specified object.
   * The result is <code>true</code> if the object is an equivalent
   * set of attributes.
   * @param     obj   the object to compare this attribute set with
   * @return    <code>true</code> if the objects are equal;
   *            <code>false</code> otherwise
   */
  equals(obj: any): boolean {
    if (this === obj) {
      return true;
    }
    if ($J.isa(obj, AttributeSet)) {
      let attrs = obj;
      return this.isEqual(attrs);
    }
    return false;
  }
  /**
   * Converts the attribute set to a String.
   *
   * @return the string
   */
  toString(): string {
    let s = '';
    let names = this.getAttributeNames();
    while (names.hasMoreElements()) {
      let key = names.nextElement();
      let value = this.getAttribute(key);
      if ($J.isa(value, AttributeSet)) {
        s = s + $J.str(key) + '=**AttributeSet** ';
      } else {
        s = s + $J.str(key) + '=' + $J.str(value) + ' ';
      }
    }
    return s;
  }
  static $clinit() {
    SimpleAttributeSet.EMPTY = new SimpleAttributeSet$EmptyAttributeSet()._SimpleAttributeSet$EmptyAttributeSet();
  }
}

/**
 * An AttributeSet that is always empty.
 */
export class SimpleAttributeSet$EmptyAttributeSet extends JObject {
  _SimpleAttributeSet$EmptyAttributeSet(): this {
    return this;
  }
  getAttributeCount(): number {
    return 0;
  }
  isDefined(attrName: any): boolean {
    return false;
  }
  isEqual(attr: AttributeSet): boolean {
    return (attr.getAttributeCount() === 0);
  }
  copyAttributes(): AttributeSet {
    return this;
  }
  getAttribute(key: any): any {
    return null;
  }
  getAttributeNames(): Enumeration<any> {
    return Collections.emptyEnumeration();
  }
  getResolveParent(): AttributeSet {
    return null;
  }
  equals(obj: any): boolean {
    if (this === obj) {
      return true;
    }
    return (($J.isa(obj, AttributeSet)) && ((obj).getAttributeCount() === 0));
  }
  hashCode(): number {
    return 0;
  }
}

$J.define(SimpleAttributeSet, 'javax.swing.text.SimpleAttributeSet', { kind: 'class', ifaces: ['javax.swing.text.MutableAttributeSet', 'java.io.Serializable', 'java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { 'javax.swing.text.AttributeSet': '_SimpleAttributeSet$AttributeSet', '': '_SimpleAttributeSet$' }, meths: { 'removeAttributes(javax.swing.text.AttributeSet)': 'removeAttributes$AttributeSet', 'removeAttributes(java.util.Enumeration)': 'removeAttributes$Enumeration' }, clinit: true, lazy: ['EMPTY'] });
$J.define(SimpleAttributeSet$EmptyAttributeSet, 'javax.swing.text.SimpleAttributeSet$EmptyAttributeSet', { kind: 'class', ifaces: ['javax.swing.text.AttributeSet', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_SimpleAttributeSet$EmptyAttributeSet' } });
$J.module(() => {
  AttributeSet = $J.load('javax.swing.text.AttributeSet');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
});
