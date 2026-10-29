// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/font/AttributeMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2004, 2005, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AbstractMap, HashMap, Thread } from '../../../jre/index.ts';

export class AttributeMap extends AbstractMap {
  values_: AttributeValues = null;
  delegateMap: JMap<TextAttribute, any> = null;
  static first: boolean = false;
  _AttributeMap(values: AttributeValues): this {
    this._AbstractMap();
    this.values_ = values;
    return this;
  }
  entrySet(): JSet<Map_Entry<TextAttribute, any>> {
    return this.delegate().entrySet();
  }
  put(key: TextAttribute, value: any): any {
    return this.delegate().put(key, value);
  }
  getValues(): AttributeValues {
    return this.values_;
  }
  delegate(): JMap<TextAttribute, any> {
    if (this.delegateMap == null) {
      if (AttributeMap.first) {
        AttributeMap.first = false;
        Thread.dumpStack();
      }
      this.delegateMap = this.values_.toMap(new HashMap(27));
      this.values_ = null;
    }
    return this.delegateMap;
  }
  toString(): string {
    if (this.values_ != null) {
      return 'map of ' + this.values_.toString();
    }
    return super.toString();
  }
  static $clinit() {
    AttributeMap.first = false;
  }
}

$J.define(AttributeMap, 'sun.font.AttributeMap', { kind: 'class', sup: 'java.util.AbstractMap', ctors: { 'sun.font.AttributeValues': '_AttributeMap' }, clinit: true, lazy: ['first'] });
