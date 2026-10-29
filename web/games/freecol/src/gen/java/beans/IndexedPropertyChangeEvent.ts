// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/IndexedPropertyChangeEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2003, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { PropertyChangeEvent } from './PropertyChangeEvent.ts';

/**
 * An "IndexedPropertyChange" event gets delivered whenever a component that
 * conforms to the JavaBeans specification (a "bean") changes a bound
 * indexed property. This class is an extension of {@code PropertyChangeEvent}
 * but contains the index of the property that has changed.
 * <P>
 * Null values may be provided for the old and the new values if their
 * true values are not known.
 * <P>
 * An event source may send a null object as the name to indicate that an
 * arbitrary set of if its properties have changed.  In this case the
 * old and new values should also be null.
 *
 * @since 1.5
 * @author Mark Davidson
 */
export class IndexedPropertyChangeEvent extends PropertyChangeEvent {
  /**
   * The index of the property element that was changed.
   */
  index_: number = 0;
  /**
   * Constructs a new {@code IndexedPropertyChangeEvent} object.
   *
   * @param source  The bean that fired the event.
   * @param propertyName  The programmatic name of the property that
   *             was changed.
   * @param oldValue      The old value of the property.
   * @param newValue      The new value of the property.
   * @param index index of the property element that was changed.
   */
  _IndexedPropertyChangeEvent(source: any, propertyName: string, oldValue: any, newValue: any, index: number): this {
    this._PropertyChangeEvent(source, propertyName, oldValue, newValue);
    this.index_ = index;
    return this;
  }
  /**
   * Gets the index of the property that was changed.
   *
   * @return The index specifying the property element that was
   *         changed.
   */
  getIndex(): number {
    return this.index_;
  }
  appendTo(sb: StringBuilder): void {
    sb.append('; index=').append(String(this.getIndex()));
  }
}

$J.define(IndexedPropertyChangeEvent, 'java.beans.IndexedPropertyChangeEvent', { kind: 'class', sup: 'java.beans.PropertyChangeEvent', ctors: { 'java.lang.Object,java.lang.String,java.lang.Object,java.lang.Object,int': '_IndexedPropertyChangeEvent' } });
