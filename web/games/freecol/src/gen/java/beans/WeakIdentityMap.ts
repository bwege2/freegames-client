// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/WeakIdentityMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2013, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, ReferenceQueue, WeakReference } from '../../../jre/index.ts';

/**
 * Hash table based mapping, which uses weak references to store keys
 * and reference-equality in place of object-equality to compare them.
 * An entry will automatically be removed when its key is no longer
 * in ordinary use.  Both null values and the null key are supported.
 * This class does not require additional synchronization.
 * A thread-safety is provided by a fragile combination
 * of synchronized blocks and volatile fields.
 * Be very careful during editing!
 *
 * @see java.util.IdentityHashMap
 * @see java.util.WeakHashMap
 */
export class WeakIdentityMap<T> extends JObject {
  static readonly MAXIMUM_CAPACITY: number = 1073741824;
  static NULL: any = null;
  queue: ReferenceQueue<any> = null;
  table: WeakIdentityMap$Entry<T>[] = null;
  threshold: number = 0;
  size_: number = 0;
  _WeakIdentityMap(): this {
    this.queue = new ReferenceQueue();
    this.table = this.newTable(1 << 3);
    this.threshold = 6;
    this.size_ = 0;
    return this;
  }
  get(key: any): T {
    this.removeStaleEntries();
    if (key == null) {
      key = WeakIdentityMap.NULL;
    }
    let hash = $J.hashCode(key);
    let table = this.table;
    let index = WeakIdentityMap.getIndex(table, hash);
    for (let entry = table[index]; entry != null; entry = entry.next_) {
      if (entry.isMatched(key, hash)) {
        return entry.value_;
      }
    }
    {
      index = WeakIdentityMap.getIndex(this.table, hash);
      for (let entry = this.table[index]; entry != null; entry = entry.next_) {
        if (entry.isMatched(key, hash)) {
          return entry.value_;
        }
      }
      let value = this.create(key);
      this.table[index] = new WeakIdentityMap$Entry()._WeakIdentityMap$Entry(key, hash, value, this.queue, this.table[index]);
      if (++this.size_ >= this.threshold) {
        if (this.table.length === WeakIdentityMap.MAXIMUM_CAPACITY) {
          this.threshold = 2147483647;
        } else {
          this.removeStaleEntries();
          table = this.newTable(Math.imul(this.table.length, 2));
          this.transfer(this.table, table);
          if (this.size_ >= $J.idiv(this.threshold, 2)) {
            this.table = table;
            this.threshold = Math.imul(this.threshold, 2);
          } else {
            this.transfer(table, this.table);
          }
        }
      }
      return value;
    }
  }
  removeStaleEntries(): void {
    let ref = this.queue.poll();
    if (ref != null) {
      {
        do {
          let entry = ref;
          let index = WeakIdentityMap.getIndex(this.table, entry.hash);
          let prev = this.table[index];
          let current = prev;
          while (current != null) {
            let next = current.next_;
            if (current === entry) {
              if (prev === entry) {
                this.table[index] = next;
              } else {
                prev.next_ = next;
              }
              entry.value_ = null;
              entry.next_ = null;
              this.size_--;
              break;
            }
            prev = current;
            current = next;
          }
          ref = this.queue.poll();
        } while (ref != null);
      }
    }
  }
  transfer(oldTable: WeakIdentityMap$Entry<T>[], newTable: WeakIdentityMap$Entry<T>[]): void {
    for (let i = 0; i < oldTable.length; i++) {
      let entry = oldTable[i];
      oldTable[i] = null;
      while (entry != null) {
        let next = entry.next_;
        let key = entry.get();
        if (key == null) {
          entry.value_ = null;
          entry.next_ = null;
          this.size_--;
        } else {
          let index = WeakIdentityMap.getIndex(newTable, entry.hash);
          entry.next_ = newTable[index];
          newTable[index] = entry;
        }
        entry = next;
      }
    }
  }
  newTable(length: number): WeakIdentityMap$Entry<T>[] {
    return $J.newArray(length, null);
  }
  static getIndex(table: WeakIdentityMap$Entry<any>[], hash: number): number {
    return hash & ((table.length - 1) | 0);
  }
  static $clinit() {
    WeakIdentityMap.NULL = new JObject();
  }
}

export class WeakIdentityMap$Entry<T> extends WeakReference {
  hash: number = 0;
  value_: T = null;
  next_: WeakIdentityMap$Entry<T> = null;
  _WeakIdentityMap$Entry(key: any, hash: number, value: T, queue: ReferenceQueue<any>, next: WeakIdentityMap$Entry<T>): this {
    this._WeakReference(key, queue);
    this.hash = hash;
    this.value_ = value;
    this.next_ = next;
    return this;
  }
  isMatched(key: any, hash: number): boolean {
    return (this.hash === hash) && (key === this.get());
  }
}

$J.define(WeakIdentityMap, 'java.beans.WeakIdentityMap', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_WeakIdentityMap' }, clinit: true, lazy: ['NULL'] });
$J.define(WeakIdentityMap$Entry, 'java.beans.WeakIdentityMap$Entry', { kind: 'class', sup: 'java.lang.ref.WeakReference', ctors: { 'java.lang.Object,int,java.lang.Object,java.lang.ref.ReferenceQueue,java.beans.WeakIdentityMap$Entry': '_WeakIdentityMap$Entry' } });
