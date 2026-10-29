// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/PropertyChangeEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, EventObject, StringBuilder } from '../../../jre/index.ts';

/**
 * A "PropertyChange" event gets delivered whenever a bean changes a "bound"
 * or "constrained" property.  A PropertyChangeEvent object is sent as an
 * argument to the PropertyChangeListener and VetoableChangeListener methods.
 * <P>
 * Normally PropertyChangeEvents are accompanied by the name and the old
 * and new value of the changed property.  If the new value is a primitive
 * type (such as int or boolean) it must be wrapped as the
 * corresponding java.lang.* Object type (such as Integer or Boolean).
 * <P>
 * Null values may be provided for the old and the new values if their
 * true values are not known.
 * <P>
 * An event source may send a null object as the name to indicate that an
 * arbitrary set of if its properties have changed.  In this case the
 * old and new values should also be null.
 *
 * @since 1.1
 */
export class PropertyChangeEvent extends EventObject {
  /**
   * name of the property that changed.  May be null, if not known.
   * @serial
   */
  propertyName: string = null;
  /**
   * New value for property.  May be null if not known.
   * @serial
   */
  newValue: any = null;
  /**
   * Previous value for property.  May be null if not known.
   * @serial
   */
  oldValue: any = null;
  /**
   * Propagation ID.  May be null.
   * @serial
   * @see #getPropagationId
   */
  propagationId: any = null;
  /**
   * Constructs a new {@code PropertyChangeEvent}.
   *
   * @param source        the bean that fired the event
   * @param propertyName  the programmatic name of the property that was changed
   * @param oldValue      the old value of the property
   * @param newValue      the new value of the property
   *
   * @throws IllegalArgumentException if {@code source} is {@code null}
   */
  _PropertyChangeEvent(source: any, propertyName: string, oldValue: any, newValue: any): this {
    this._EventObject(source);
    this.propertyName = propertyName;
    this.newValue = newValue;
    this.oldValue = oldValue;
    return this;
  }
  /**
   * Gets the programmatic name of the property that was changed.
   *
   * @return  The programmatic name of the property that was changed.
   *          May be null if multiple properties have changed.
   */
  getPropertyName(): string {
    return this.propertyName;
  }
  /**
   * Gets the new value for the property, expressed as an Object.
   *
   * @return  The new value for the property, expressed as an Object.
   *          May be null if multiple properties have changed.
   */
  getNewValue(): any {
    return this.newValue;
  }
  /**
   * Gets the old value for the property, expressed as an Object.
   *
   * @return  The old value for the property, expressed as an Object.
   *          May be null if multiple properties have changed.
   */
  getOldValue(): any {
    return this.oldValue;
  }
  /**
   * The "propagationId" field is reserved for future use.  In Beans 1.0
   * the sole requirement is that if a listener catches a PropertyChangeEvent
   * and then fires a PropertyChangeEvent of its own, then it should
   * make sure that it propagates the propagationId field from its
   * incoming event to its outgoing event.
   *
   * @return the propagationId object associated with a bound/constrained
   *          property update.
   */
  getPropagationId(): any {
    return this.propagationId;
  }
  /**
   * Returns a string representation of the object.
   *
   * @return a string representation of the object
   *
   * @since 1.7
   */
  toString(): string {
    let sb = new StringBuilder($J.getClass(this).getName());
    sb.append('[propertyName=').append(this.getPropertyName());
    this.appendTo(sb);
    sb.append('; oldValue=').append($J.str(this.getOldValue()));
    sb.append('; newValue=').append($J.str(this.getNewValue()));
    sb.append('; propagationId=').append($J.str(this.getPropagationId()));
    sb.append('; source=').append($J.str(this.getSource()));
    return sb.append(']').toString();
  }
  appendTo(sb: StringBuilder): void {
  }
}

$J.define(PropertyChangeEvent, 'java.beans.PropertyChangeEvent', { kind: 'class', sup: 'java.util.EventObject', ctors: { 'java.lang.Object,java.lang.String,java.lang.Object,java.lang.Object': '_PropertyChangeEvent' } });
