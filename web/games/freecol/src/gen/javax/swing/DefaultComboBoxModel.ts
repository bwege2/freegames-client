// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DefaultComboBoxModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Vector } from '../../../jre/index.ts';
import { AbstractListModel } from './AbstractListModel.ts';

/**
 * The default model for combo boxes.
 *
 * @param <E> the type of the elements of this model
 *
 * @author Arnaud Weber
 * @author Tom Santos
 * @since 1.2
 */
export class DefaultComboBoxModel<E> extends AbstractListModel {
  objects: Vector<E> = null;
  selectedObject: any = null;
  /**
   * Constructs an empty DefaultComboBoxModel object.
   */
  _DefaultComboBoxModel$(): this {
    this._AbstractListModel();
    this.objects = new Vector();
    return this;
  }
  /**
   * Constructs a DefaultComboBoxModel object initialized with
   * an array of objects.
   *
   * @param items  an array of Object objects
   */
  _DefaultComboBoxModel$ObjectArr(items: E[]): this {
    this._AbstractListModel();
    this.objects = new Vector(items.length);
    let i: number;
    let c: number;
    for (i = 0, c = items.length; i < c; i++) {
      this.objects.addElement(items[i]);
    }
    if (this.getSize() > 0) {
      this.selectedObject = this.getElementAt(0);
    }
    return this;
  }
  /**
   * Constructs a DefaultComboBoxModel object initialized with
   * a vector.
   *
   * @param v  a Vector object ...
   */
  _DefaultComboBoxModel$Vector(v: Vector<E>): this {
    this._AbstractListModel();
    this.objects = v;
    if (this.getSize() > 0) {
      this.selectedObject = this.getElementAt(0);
    }
    return this;
  }
  /**
   * Set the value of the selected item. The selected item may be null.
   *
   * @param anObject The combo box value or null for no selection.
   */
  setSelectedItem(anObject: any): void {
    if ((this.selectedObject != null && !$J.equals(this.selectedObject, anObject)) || this.selectedObject == null && anObject != null) {
      this.selectedObject = anObject;
      this.fireContentsChanged$Object$int$int(this, -1, -1);
    }
  }
  getSelectedItem(): any {
    return this.selectedObject;
  }
  getSize(): number {
    return this.objects.size();
  }
  getElementAt(index: number): E {
    if (index >= 0 && index < this.objects.size()) {
      return this.objects.elementAt(index);
    } else {
      return null;
    }
  }
  addElement(anObject: E): void {
    this.objects.addElement(anObject);
    this.fireIntervalAdded(this, (this.objects.size() - 1) | 0, (this.objects.size() - 1) | 0);
    if (this.objects.size() === 1 && this.selectedObject == null && anObject != null) {
      this.setSelectedItem(anObject);
    }
  }
  removeElementAt(index: number): void {
    if (this.getElementAt(index) === this.selectedObject) {
      if (index === 0) {
        this.setSelectedItem(this.getSize() === 1 ? null : this.getElementAt((index + 1) | 0));
      } else {
        this.setSelectedItem(this.getElementAt((index - 1) | 0));
      }
    }
    this.objects.removeElementAt(index);
    this.fireIntervalRemoved(this, index, index);
  }
  removeElement(anObject: any): void {
    let index = this.objects.indexOf(anObject);
    if (index !== -1) {
      this.removeElementAt(index);
    }
  }
  /**
   * Empties the list.
   */
  removeAllElements(): void {
    if (this.objects.size() > 0) {
      let firstIndex = 0;
      let lastIndex = (this.objects.size() - 1) | 0;
      this.objects.removeAllElements();
      this.selectedObject = null;
      this.fireIntervalRemoved(this, firstIndex, lastIndex);
    } else {
      this.selectedObject = null;
    }
  }
}

$J.define(DefaultComboBoxModel, 'javax.swing.DefaultComboBoxModel', { kind: 'class', ifaces: ['javax.swing.MutableComboBoxModel', 'java.io.Serializable'], sup: 'javax.swing.AbstractListModel', ctors: { 'java.util.Vector': '_DefaultComboBoxModel$Vector', 'java.lang.Object[]': '_DefaultComboBoxModel$ObjectArr', '': '_DefaultComboBoxModel$' }, meths: { 'addAll(int,java.util.Collection)': 'addAll$int$Collection', 'addAll(java.util.Collection)': 'addAll$Collection' } });
