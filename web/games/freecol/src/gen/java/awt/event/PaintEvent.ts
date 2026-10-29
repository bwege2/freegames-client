// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/event/PaintEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { ComponentEvent } from './ComponentEvent.ts';

/**
 * The component-level paint event.
 * This event is a special type which is used to ensure that
 * paint/update method calls are serialized along with the other
 * events delivered from the event queue.  This event is not
 * designed to be used with the Event Listener model; programs
 * should continue to override paint/update methods in order
 * render themselves properly.
 * <p>
 * An unspecified behavior will be caused if the {@code id} parameter
 * of any particular {@code PaintEvent} instance is not
 * in the range from {@code PAINT_FIRST} to {@code PAINT_LAST}.
 *
 * @author Amy Fowler
 * @since 1.1
 */
export class PaintEvent extends ComponentEvent {
  /**
   * Marks the first integer id for the range of paint event ids.
   */
  static readonly PAINT_FIRST: number = 800;
  /**
   * Marks the last integer id for the range of paint event ids.
   */
  static readonly PAINT_LAST: number = 801;
  /**
   * The paint event type.
   */
  static readonly PAINT: number = 800;
  /**
   * The update event type.
   */
  static readonly UPDATE: number = 801;
  /**
   * This is the rectangle that represents the area on the source
   * component that requires a repaint.
   * This rectangle should be non null.
   *
   * @serial
   * @see java.awt.Rectangle
   * @see #setUpdateRect(Rectangle)
   * @see #getUpdateRect()
   */
  updateRect: Rectangle = null;
  /**
   * Constructs a {@code PaintEvent} object with the specified
   * source component and type.
   * <p> This method throws an
   * {@code IllegalArgumentException} if {@code source}
   * is {@code null}.
   *
   * @param source     The object where the event originated
   * @param id           The integer that identifies the event type.
   *                     For information on allowable values, see
   *                     the class description for {@link PaintEvent}
   * @param updateRect The rectangle area which needs to be repainted
   * @throws IllegalArgumentException if {@code source} is null
   * @see #getSource()
   * @see #getID()
   * @see #getUpdateRect()
   */
  _PaintEvent(source: Component, id: number, updateRect: Rectangle): this {
    this._ComponentEvent(source, id);
    this.updateRect = updateRect;
    return this;
  }
  /**
   * Returns the rectangle representing the area which needs to be
   * repainted in response to this event.
   * @return the rectangle representing the area which needs to be
   * repainted in response to this event
   */
  getUpdateRect(): Rectangle {
    return this.updateRect;
  }
  paramString(): string {
    let typeStr: string;
    switch (this.id_) {
      case PaintEvent.PAINT:
        typeStr = 'PAINT';
        break;
      case PaintEvent.UPDATE:
        typeStr = 'UPDATE';
        break;
      default:
        typeStr = 'unknown type';
    }
    return typeStr + ',updateRect=' + (this.updateRect != null ? this.updateRect.toString() : 'null');
  }
}

$J.define(PaintEvent, 'java.awt.event.PaintEvent', { kind: 'class', sup: 'java.awt.event.ComponentEvent', ctors: { 'java.awt.Component,int,java.awt.Rectangle': '_PaintEvent' } });
