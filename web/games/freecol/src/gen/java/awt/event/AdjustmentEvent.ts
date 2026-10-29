// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/event/AdjustmentEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { AWTEvent } from '../AWTEvent.ts';

/**
 * The adjustment event emitted by Adjustable objects like
 * {@link java.awt.Scrollbar} and {@link java.awt.ScrollPane}.
 * When the user changes the value of the scrolling component,
 * it receives an instance of {@code AdjustmentEvent}.
 * <p>
 * An unspecified behavior will be caused if the {@code id} parameter
 * of any particular {@code AdjustmentEvent} instance is not
 * in the range from {@code ADJUSTMENT_FIRST} to {@code ADJUSTMENT_LAST}.
 * <p>
 * The {@code type} of any {@code AdjustmentEvent} instance takes one of the following
 * values:
 *                     <ul>
 *                     <li> {@code UNIT_INCREMENT}
 *                     <li> {@code UNIT_DECREMENT}
 *                     <li> {@code BLOCK_INCREMENT}
 *                     <li> {@code BLOCK_DECREMENT}
 *                     <li> {@code TRACK}
 *                     </ul>
 * Assigning the value different from listed above will cause an unspecified behavior.
 * @see java.awt.Adjustable
 * @see AdjustmentListener
 *
 * @author Amy Fowler
 * @since 1.1
 */
export class AdjustmentEvent extends AWTEvent {
  /**
   * Marks the first integer id for the range of adjustment event ids.
   */
  static readonly ADJUSTMENT_FIRST: number = 601;
  /**
   * Marks the last integer id for the range of adjustment event ids.
   */
  static readonly ADJUSTMENT_LAST: number = 601;
  /**
   * The adjustment value changed event.
   */
  static readonly ADJUSTMENT_VALUE_CHANGED: number = 601;
  /**
   * The unit increment adjustment type.
   */
  static readonly UNIT_INCREMENT: number = 1;
  /**
   * The unit decrement adjustment type.
   */
  static readonly UNIT_DECREMENT: number = 2;
  /**
   * The block decrement adjustment type.
   */
  static readonly BLOCK_DECREMENT: number = 3;
  /**
   * The block increment adjustment type.
   */
  static readonly BLOCK_INCREMENT: number = 4;
  /**
   * The absolute tracking adjustment type.
   */
  static readonly TRACK: number = 5;
  /**
   * The adjustable object that fired the event.
   *
   * @serial
   * @see #getAdjustable
   */
  adjustable: Adjustable = null;
  /**
   * {@code value} will contain the new value of the
   * adjustable object.  This value will always be  in a
   * range associated adjustable object.
   *
   * @serial
   * @see #getValue
   */
  value_: number = 0;
  /**
   * The {@code adjustmentType} describes how the adjustable
   * object value has changed.
   * This value can be increased/decreased by a block or unit amount
   * where the block is associated with page increments/decrements,
   * and a unit is associated with line increments/decrements.
   *
   * @serial
   * @see #getAdjustmentType
   */
  adjustmentType: number = 0;
  /**
   * The {@code isAdjusting} is true if the event is one
   * of the series of multiple adjustment events.
   *
   * @since 1.4
   * @serial
   * @see #getValueIsAdjusting
   */
  isAdjusting: boolean = false;
  /**
   * Constructs an {@code AdjustmentEvent} object with the
   * specified Adjustable source, event type, adjustment type, and value.
   * <p> This method throws an
   * {@code IllegalArgumentException} if {@code source}
   * is {@code null}.
   *
   * @param source The {@code Adjustable} object where the
   *               event originated
   * @param id     An integer indicating the type of event.
   *                     For information on allowable values, see
   *                     the class description for {@link AdjustmentEvent}
   * @param type   An integer indicating the adjustment type.
   *                     For information on allowable values, see
   *                     the class description for {@link AdjustmentEvent}
   * @param value  The current value of the adjustment
   * @param isAdjusting A boolean that equals {@code true} if the event is one
   *               of a series of multiple adjusting events,
   *               otherwise {@code false}
   * @throws IllegalArgumentException if {@code source} is null
   * @since 1.4
   * @see #getSource()
   * @see #getID()
   * @see #getAdjustmentType()
   * @see #getValue()
   * @see #getValueIsAdjusting()
   */
  _AdjustmentEvent$Adjustable$int$int$int$boolean(source: Adjustable, id: number, type$: number, value: number, isAdjusting: boolean): this {
    this._AWTEvent$Object$int(source, id);
    this.adjustable = source;
    this.adjustmentType = type$;
    this.value_ = value;
    this.isAdjusting = isAdjusting;
    return this;
  }
  /**
   * Returns the current value in the adjustment event.
   *
   * @return the current value in the adjustment event
   */
  getValue(): number {
    return this.value_;
  }
  /**
   * Returns the type of adjustment which caused the value changed
   * event.  It will have one of the following values:
   * <ul>
   * <li>{@link #UNIT_INCREMENT}
   * <li>{@link #UNIT_DECREMENT}
   * <li>{@link #BLOCK_INCREMENT}
   * <li>{@link #BLOCK_DECREMENT}
   * <li>{@link #TRACK}
   * </ul>
   * @return one of the adjustment values listed above
   */
  getAdjustmentType(): number {
    return this.adjustmentType;
  }
  /**
   * Returns {@code true} if this is one of multiple
   * adjustment events.
   *
   * @return {@code true} if this is one of multiple
   *         adjustment events, otherwise returns {@code false}
   * @since 1.4
   */
  getValueIsAdjusting(): boolean {
    return this.isAdjusting;
  }
  paramString(): string {
    let typeStr: string;
    switch (this.id_) {
      case AdjustmentEvent.ADJUSTMENT_VALUE_CHANGED:
        typeStr = 'ADJUSTMENT_VALUE_CHANGED';
        break;
      default:
        typeStr = 'unknown type';
    }
    let adjTypeStr: string;
    switch (this.adjustmentType) {
      case AdjustmentEvent.UNIT_INCREMENT:
        adjTypeStr = 'UNIT_INCREMENT';
        break;
      case AdjustmentEvent.UNIT_DECREMENT:
        adjTypeStr = 'UNIT_DECREMENT';
        break;
      case AdjustmentEvent.BLOCK_INCREMENT:
        adjTypeStr = 'BLOCK_INCREMENT';
        break;
      case AdjustmentEvent.BLOCK_DECREMENT:
        adjTypeStr = 'BLOCK_DECREMENT';
        break;
      case AdjustmentEvent.TRACK:
        adjTypeStr = 'TRACK';
        break;
      default:
        adjTypeStr = 'unknown type';
    }
    return typeStr + ',adjType=' + adjTypeStr + ',value=' + this.value_ + ',isAdjusting=' + this.isAdjusting;
  }
}

$J.define(AdjustmentEvent, 'java.awt.event.AdjustmentEvent', { kind: 'class', sup: 'java.awt.AWTEvent', ctors: { 'java.awt.Adjustable,int,int,int,boolean': '_AdjustmentEvent$Adjustable$int$int$int$boolean', 'java.awt.Adjustable,int,int,int': '_AdjustmentEvent$Adjustable$int$int$int' } });
