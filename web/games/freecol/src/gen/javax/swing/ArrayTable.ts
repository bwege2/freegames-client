// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/ArrayTable.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2003, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Hashtable, JObject } from '../../../jre/index.ts';

export class ArrayTable extends JObject {
  table: any = null;
  static readonly ARRAY_BOUNDARY: number = 8;
  _ArrayTable(): this {
    this.table = null;
    return this;
  }
  put(key: any, value: any): void {
    if (this.table == null) {
      this.table = [key, value];
    } else {
      let size = this.size();
      if (size < ArrayTable.ARRAY_BOUNDARY) {
        if (this.containsKey(key)) {
          let tmp = this.table;
          for (let i = 0; i < ((tmp.length - 1) | 0); i = (i + 2) | 0) {
            if ($J.equals(tmp[i], key)) {
              (tmp[(i + 1) | 0]) = value;
              break;
            }
          }
        } else {
          let array = this.table;
          let i = array.length;
          let tmp = $J.newArray((i + 2) | 0, null);
          $J.system_arraycopy(array, 0, tmp, 0, i);
          tmp[i] = key;
          (tmp[(i + 1) | 0]) = value;
          this.table = tmp;
        }
      } else {
        if ((size === ArrayTable.ARRAY_BOUNDARY) && this.isArray()) {
          this.grow();
        }
        let tmp = this.table;
        tmp.put(key, value);
      }
    }
  }
  get(key: any): any {
    let value = null;
    if (this.table != null) {
      if (this.isArray()) {
        let array = this.table;
        for (let i = 0; i < ((array.length - 1) | 0); i = (i + 2) | 0) {
          if ($J.equals(array[i], key)) {
            value = array[(i + 1) | 0];
            break;
          }
        }
      } else {
        value = (this.table).get(key);
      }
    }
    return value;
  }
  size(): number {
    let size: number;
    if (this.table == null) {
      return 0;
    }
    if (this.isArray()) {
      size = $J.idiv((this.table).length, 2);
    } else {
      size = (this.table).size();
    }
    return size;
  }
  containsKey(key: any): boolean {
    let contains = false;
    if (this.table != null) {
      if (this.isArray()) {
        let array = this.table;
        for (let i = 0; i < ((array.length - 1) | 0); i = (i + 2) | 0) {
          if ($J.equals(array[i], key)) {
            contains = true;
            break;
          }
        }
      } else {
        contains = (this.table).containsKey(key);
      }
    }
    return contains;
  }
  remove(key: any): any {
    let value = null;
    if (key == null) {
      return null;
    }
    if (this.table != null) {
      if (this.isArray()) {
        let index = -1;
        let array = this.table;
        for (let i = (array.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
          if ($J.equals(array[i], key)) {
            index = i;
            value = array[(i + 1) | 0];
            break;
          }
        }
        if (index !== -1) {
          let tmp = $J.newArray((array.length - 2) | 0, null);
          $J.system_arraycopy(array, 0, tmp, 0, index);
          if (index < tmp.length) {
            $J.system_arraycopy(array, (index + 2) | 0, tmp, index, (tmp.length - index) | 0);
          }
          this.table = (tmp.length === 0) ? null : tmp;
        }
      } else {
        value = (this.table).remove(key);
      }
      if (this.size() === ((ArrayTable.ARRAY_BOUNDARY - 1) | 0) && !this.isArray()) {
        this.shrink();
      }
    }
    return value;
  }
  /**
   * Removes all the mappings.
   */
  clear(): void {
    this.table = null;
  }
  clone(): any {
    let newArrayTable = new ArrayTable()._ArrayTable();
    if (this.table != null) {
      if (this.isArray()) {
        let array = this.table;
        for (let i = 0; i < ((array.length - 1) | 0); i = (i + 2) | 0) {
          newArrayTable.put(array[i], array[(i + 1) | 0]);
        }
      } else {
        let tmp = this.table;
        let keys = tmp.keys();
        while (keys.hasMoreElements()) {
          let o = keys.nextElement();
          newArrayTable.put(o, tmp.get(o));
        }
      }
    }
    return newArrayTable;
  }
  /**
   * Returns the keys of the table, or <code>null</code> if there
   * are currently no bindings.
   * @param keys  array of keys
   * @return an array of bindings
   */
  getKeys(keys: any[]): any[] {
    if (this.table == null) {
      return null;
    }
    if (this.isArray()) {
      let array = this.table;
      if (keys == null) {
        keys = $J.newArray($J.idiv(array.length, 2), null);
      }
      for (let i = 0, index = 0; i < ((array.length - 1) | 0); i = (i + 2) | 0, index++) {
        keys[index] = array[i];
      }
    } else {
      let tmp = this.table;
      let enum_ = tmp.keys();
      let counter = tmp.size();
      if (keys == null) {
        keys = $J.newArray(counter, null);
      }
      while (counter > 0) {
        keys[--counter] = enum_.nextElement();
      }
    }
    return keys;
  }
  isArray(): boolean {
    return (Array.isArray(this.table));
  }
  grow(): void {
    let array = this.table;
    let tmp = new Hashtable($J.idiv(array.length, 2));
    for (let i = 0; i < array.length; i = (i + 2) | 0) {
      tmp.put(array[i], array[(i + 1) | 0]);
    }
    this.table = tmp;
  }
  shrink(): void {
    let tmp = this.table;
    let array = $J.newArray(Math.imul(tmp.size(), 2), null);
    let keys = tmp.keys();
    let j = 0;
    while (keys.hasMoreElements()) {
      let o = keys.nextElement();
      array[j] = o;
      (array[(j + 1) | 0]) = tmp.get(o);
      j = (j + 2) | 0;
    }
    this.table = array;
  }
}

$J.define(ArrayTable, 'javax.swing.ArrayTable', { kind: 'class', ifaces: ['java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { '': '_ArrayTable' } });
