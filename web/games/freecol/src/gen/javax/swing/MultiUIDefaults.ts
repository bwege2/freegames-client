// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/MultiUIDefaults.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, HashSet, JEnum, JObject, StringBuilder } from '../../../jre/index.ts';
import { UIDefaults } from './UIDefaults.ts';

/**
 * @author Hans Muller
 */
export class MultiUIDefaults extends UIDefaults {
  tables: UIDefaults[] = null;
  _MultiUIDefaults$UIDefaultsArr(defaults: UIDefaults[]): this {
    this._UIDefaults$();
    this.tables = defaults;
    return this;
  }
  get(key: any): any {
    let value = super.get(key);
    if (value != null) {
      return value;
    }
    for (let table of this.tables) {
      value = (table != null) ? table.get(key) : null;
      if (value != null) {
        return value;
      }
    }
    return null;
  }
  get$Object$Locale(key: any, l: Locale): any {
    let value = super.get$Object$Locale(key, l);
    if (value != null) {
      return value;
    }
    for (let table of this.tables) {
      value = (table != null) ? table.get$Object$Locale(key, l) : null;
      if (value != null) {
        return value;
      }
    }
    return null;
  }
  size(): number {
    return this.entrySet().size();
  }
  isEmpty(): boolean {
    return this.size() === 0;
  }
  keys(): Enumeration<any> {
    return new MultiUIDefaults$MultiUIDefaultsEnumerator()._MultiUIDefaults$MultiUIDefaultsEnumerator(MultiUIDefaults$MultiUIDefaultsEnumerator$Type.KEYS, this.entrySet());
  }
  keySet(): JSet<any> {
    let set$ = new HashSet();
    for (let i = (this.tables.length - 1) | 0; i >= 0; i--) {
      if (this.tables[i] != null) {
        set$.addAll(this.tables[i].keySet());
      }
    }
    set$.addAll(super.keySet());
    return set$;
  }
  elements(): Enumeration<any> {
    return new MultiUIDefaults$MultiUIDefaultsEnumerator()._MultiUIDefaults$MultiUIDefaultsEnumerator(MultiUIDefaults$MultiUIDefaultsEnumerator$Type.ELEMENTS, this.entrySet());
  }
  entrySet(): JSet<Map_Entry<any, any>> {
    let set$ = new HashSet();
    for (let i = (this.tables.length - 1) | 0; i >= 0; i--) {
      if (this.tables[i] != null) {
        set$.addAll(this.tables[i].entrySet());
      }
    }
    set$.addAll(super.entrySet());
    return set$;
  }
  getUIError(msg: string): void {
    if (this.tables != null && this.tables.length > 0 && this.tables[0] != null) {
      this.tables[0].getUIError(msg);
    } else {
      super.getUIError(msg);
    }
  }
  remove(key: any): any {
    let value = null;
    for (let i = (this.tables.length - 1) | 0; i >= 0; i--) {
      if (this.tables[i] != null) {
        let v = this.tables[i].remove(key);
        if (v != null) {
          value = v;
        }
      }
    }
    let v = super.remove(key);
    if (v != null) {
      value = v;
    }
    return value;
  }
  clear(): void {
    super.clear();
    for (let table of this.tables) {
      if (table != null) {
        table.clear();
      }
    }
  }
  toString(): string {
    let sb = new StringBuilder();
    sb.append('{');
    let keys = this.keys();
    while (keys.hasMoreElements()) {
      let key = keys.nextElement();
      sb.append($J.str(key) + '=' + $J.str(this.get(key)) + ', ');
    }
    let length = sb.length();
    if (length > 1) {
      sb.delete((length - 2) | 0, length);
    }
    sb.append('}');
    return sb.toString();
  }
}

export class MultiUIDefaults$MultiUIDefaultsEnumerator extends JObject {
  iterator_: Iterator<Map_Entry<any, any>> = null;
  type: MultiUIDefaults$MultiUIDefaultsEnumerator$Type = null;
  _MultiUIDefaults$MultiUIDefaultsEnumerator(type$: MultiUIDefaults$MultiUIDefaultsEnumerator$Type, entries: JSet<Map_Entry<any, any>>): this {
    this.type = type$;
    this.iterator_ = entries.iterator();
    return this;
  }
  hasMoreElements(): boolean {
    return this.iterator_.hasNext();
  }
  nextElement(): any {
    switch (this.type) {
      case MultiUIDefaults$MultiUIDefaultsEnumerator$Type.KEYS:
        return this.iterator_.next().getKey();
      case MultiUIDefaults$MultiUIDefaultsEnumerator$Type.ELEMENTS:
        return this.iterator_.next().getValue();
      default:
        return null;
    }
  }
}

export class MultiUIDefaults$MultiUIDefaultsEnumerator$Type extends JEnum {
  static KEYS: MultiUIDefaults$MultiUIDefaultsEnumerator$Type = null;
  static ELEMENTS: MultiUIDefaults$MultiUIDefaultsEnumerator$Type = null;
  static $VALUES: MultiUIDefaults$MultiUIDefaultsEnumerator$Type[] = null;
  _MultiUIDefaults$MultiUIDefaultsEnumerator$Type($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): MultiUIDefaults$MultiUIDefaultsEnumerator$Type[] { return MultiUIDefaults$MultiUIDefaultsEnumerator$Type.$VALUES.slice(); }
  static valueOf(name: string): MultiUIDefaults$MultiUIDefaultsEnumerator$Type { return $J.enumValueOf(MultiUIDefaults$MultiUIDefaultsEnumerator$Type, name); }
  static $clinit() {
    MultiUIDefaults$MultiUIDefaultsEnumerator$Type.KEYS = new MultiUIDefaults$MultiUIDefaultsEnumerator$Type()._MultiUIDefaults$MultiUIDefaultsEnumerator$Type('KEYS', 0);
    MultiUIDefaults$MultiUIDefaultsEnumerator$Type.ELEMENTS = new MultiUIDefaults$MultiUIDefaultsEnumerator$Type()._MultiUIDefaults$MultiUIDefaultsEnumerator$Type('ELEMENTS', 1);
    MultiUIDefaults$MultiUIDefaultsEnumerator$Type.$VALUES = [MultiUIDefaults$MultiUIDefaultsEnumerator$Type.KEYS, MultiUIDefaults$MultiUIDefaultsEnumerator$Type.ELEMENTS];
  }
}

$J.define(MultiUIDefaults, 'javax.swing.MultiUIDefaults', { kind: 'class', sup: 'javax.swing.UIDefaults', ctors: { '': '_MultiUIDefaults$', 'javax.swing.UIDefaults[]': '_MultiUIDefaults$UIDefaultsArr' }, meths: { 'get(java.lang.Object,java.util.Locale)': 'get$Object$Locale' } });
$J.define(MultiUIDefaults$MultiUIDefaultsEnumerator, 'javax.swing.MultiUIDefaults$MultiUIDefaultsEnumerator', { kind: 'class', ifaces: ['java.util.Enumeration'], sup: 'java.lang.Object', ctors: { 'javax.swing.MultiUIDefaults$MultiUIDefaultsEnumerator$Type,java.util.Set': '_MultiUIDefaults$MultiUIDefaultsEnumerator' } });
$J.define(MultiUIDefaults$MultiUIDefaultsEnumerator$Type, 'javax.swing.MultiUIDefaults$MultiUIDefaultsEnumerator$Type', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_MultiUIDefaults$MultiUIDefaultsEnumerator$Type' }, clinit: true, lazy: ['$VALUES', 'KEYS', 'ELEMENTS'] });
