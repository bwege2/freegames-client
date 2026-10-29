// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/event/ListDataEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2013, Oracle and/or its affiliates. All rights reserved.
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
import { $J, EventObject } from '../../../../jre/index.ts';

/**
 * Defines an event that encapsulates changes to a list.
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
 * @author Hans Muller
 */
export class ListDataEvent extends EventObject {
  /**
   * Identifies one or more changes in the lists contents.
   */
  static readonly CONTENTS_CHANGED: number = 0;
  /**
   * Identifies the addition of one or more contiguous items to the list
   */
  static readonly INTERVAL_ADDED: number = 1;
  /**
   * Identifies the removal of one or more contiguous items from the list
   */
  static readonly INTERVAL_REMOVED: number = 2;
  type: number = 0;
  index0: number = 0;
  index1: number = 0;
  /**
   * Constructs a ListDataEvent object. If index0 is &gt;
   * index1, index0 and index1 will be swapped such that
   * index0 will always be &lt;= index1.
   *
   * @param source  the source Object (typically <code>this</code>)
   * @param type    an int specifying {@link #CONTENTS_CHANGED},
   *                {@link #INTERVAL_ADDED}, or {@link #INTERVAL_REMOVED}
   * @param index0  one end of the new interval
   * @param index1  the other end of the new interval
   */
  _ListDataEvent(source: any, type$: number, index0: number, index1: number): this {
    this._EventObject(source);
    this.type = type$;
    this.index0 = Math.min(index0, index1);
    this.index1 = Math.max(index0, index1);
    return this;
  }
  /**
   * Returns the lower index of the range. For a single
   * element, this value is the same as that returned by {@link #getIndex1}.
   *
   *
   * @return an int representing the lower index value
   */
  getIndex0(): number {
    return this.index0;
  }
  /**
   * Returns the upper index of the range. For a single
   * element, this value is the same as that returned by {@link #getIndex0}.
   *
   * @return an int representing the upper index value
   */
  getIndex1(): number {
    return this.index1;
  }
  /**
   * Returns a string representation of this ListDataEvent. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @since 1.4
   * @return  a string representation of this ListDataEvent.
   */
  toString(): string {
    return $J.getClass(this).getName() + '[type=' + this.type + ',index0=' + this.index0 + ',index1=' + this.index1 + ']';
  }
}

$J.define(ListDataEvent, 'javax.swing.event.ListDataEvent', { kind: 'class', sup: 'java.util.EventObject', ctors: { 'java.lang.Object,int,int,int': '_ListDataEvent' } });
