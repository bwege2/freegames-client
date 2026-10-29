// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Scrollbar.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { Component } from './Component.ts';

/**
 * The {@code Scrollbar} class embodies a scroll bar, a
 * familiar user-interface object. A scroll bar provides a
 * convenient means for allowing a user to select from a
 * range of values. The following three vertical
 * scroll bars could be used as slider controls to pick
 * the red, green, and blue components of a color:
 * <p>
 * <img src="doc-files/Scrollbar-1.gif" alt="Image shows 3 vertical sliders,
 * side-by-side." style="margin: 7px 10px;">
 * <p>
 * Each scroll bar in this example could be created with
 * code similar to the following:
 *
 * <hr><blockquote><pre>
 * redSlider=new Scrollbar(Scrollbar.VERTICAL, 0, 1, 0, 255);
 * add(redSlider);
 * </pre></blockquote><hr>
 * <p>
 * Alternatively, a scroll bar can represent a range of values. For
 * example, if a scroll bar is used for scrolling through text, the
 * width of the "bubble" (also called the "thumb" or "scroll box")
 * can be used to represent the amount of text that is visible.
 * Here is an example of a scroll bar that represents a range:
 * <p>
 * <img src="doc-files/Scrollbar-2.gif"
 * alt="Image shows horizontal slider with starting range of 0 and ending range
 * of 300. The slider thumb is labeled 60." style="margin: 7px 10px;">
 * <p>
 * The value range represented by the bubble in this example
 * is the <em>visible amount</em>. The horizontal scroll bar
 * in this example could be created with code like the following:
 *
 * <hr><blockquote><pre>
 * ranger = new Scrollbar(Scrollbar.HORIZONTAL, 0, 60, 0, 300);
 * add(ranger);
 * </pre></blockquote><hr>
 * <p>
 * Note that the actual maximum value of the scroll bar is the
 * {@code maximum} minus the {@code visible amount}.
 * In the previous example, because the {@code maximum} is
 * 300 and the {@code visible amount} is 60, the actual maximum
 * value is 240.  The range of the scrollbar track is 0 - 300.
 * The left side of the bubble indicates the value of the
 * scroll bar.
 * <p>
 * Normally, the user changes the value of the scroll bar by
 * making a gesture with the mouse. For example, the user can
 * drag the scroll bar's bubble up and down, or click in the
 * scroll bar's unit increment or block increment areas. Keyboard
 * gestures can also be mapped to the scroll bar. By convention,
 * the <b>Page&nbsp;Up</b> and <b>Page&nbsp;Down</b>
 * keys are equivalent to clicking in the scroll bar's block
 * increment and block decrement areas.
 * <p>
 * When the user changes the value of the scroll bar, the scroll bar
 * receives an instance of {@code AdjustmentEvent}.
 * The scroll bar processes this event, passing it along to
 * any registered listeners.
 * <p>
 * Any object that wishes to be notified of changes to the
 * scroll bar's value should implement
 * {@code AdjustmentListener}, an interface defined in
 * the package {@code java.awt.event}.
 * Listeners can be added and removed dynamically by calling
 * the methods {@code addAdjustmentListener} and
 * {@code removeAdjustmentListener}.
 * <p>
 * The {@code AdjustmentEvent} class defines five types
 * of adjustment event, listed here:
 *
 * <ul>
 * <li>{@code AdjustmentEvent.TRACK} is sent out when the
 * user drags the scroll bar's bubble.
 * <li>{@code AdjustmentEvent.UNIT_INCREMENT} is sent out
 * when the user clicks in the left arrow of a horizontal scroll
 * bar, or the top arrow of a vertical scroll bar, or makes the
 * equivalent gesture from the keyboard.
 * <li>{@code AdjustmentEvent.UNIT_DECREMENT} is sent out
 * when the user clicks in the right arrow of a horizontal scroll
 * bar, or the bottom arrow of a vertical scroll bar, or makes the
 * equivalent gesture from the keyboard.
 * <li>{@code AdjustmentEvent.BLOCK_INCREMENT} is sent out
 * when the user clicks in the track, to the left of the bubble
 * on a horizontal scroll bar, or above the bubble on a vertical
 * scroll bar. By convention, the <b>Page&nbsp;Up</b>
 * key is equivalent, if the user is using a keyboard that
 * defines a <b>Page&nbsp;Up</b> key.
 * <li>{@code AdjustmentEvent.BLOCK_DECREMENT} is sent out
 * when the user clicks in the track, to the right of the bubble
 * on a horizontal scroll bar, or below the bubble on a vertical
 * scroll bar. By convention, the <b>Page&nbsp;Down</b>
 * key is equivalent, if the user is using a keyboard that
 * defines a <b>Page&nbsp;Down</b> key.
 * </ul>
 * <p>
 * The JDK&nbsp;1.0 event system is supported for backwards
 * compatibility, but its use with newer versions of the platform is
 * discouraged. The five types of adjustment events introduced
 * with JDK&nbsp;1.1 correspond to the five event types
 * that are associated with scroll bars in previous platform versions.
 * The following list gives the adjustment event type,
 * and the corresponding JDK&nbsp;1.0 event type it replaces.
 *
 * <ul>
 * <li>{@code AdjustmentEvent.TRACK} replaces
 * {@code Event.SCROLL_ABSOLUTE}
 * <li>{@code AdjustmentEvent.UNIT_INCREMENT} replaces
 * {@code Event.SCROLL_LINE_UP}
 * <li>{@code AdjustmentEvent.UNIT_DECREMENT} replaces
 * {@code Event.SCROLL_LINE_DOWN}
 * <li>{@code AdjustmentEvent.BLOCK_INCREMENT} replaces
 * {@code Event.SCROLL_PAGE_UP}
 * <li>{@code AdjustmentEvent.BLOCK_DECREMENT} replaces
 * {@code Event.SCROLL_PAGE_DOWN}
 * </ul>
 * <p>
 * <b>Note</b>: We recommend using a {@code Scrollbar}
 * for value selection only.  If you want to implement
 * a scrollable component inside a container, we recommend you use
 * a {@link ScrollPane ScrollPane}. If you use a
 * {@code Scrollbar} for this purpose, you are likely to
 * encounter issues with painting, key handling, sizing and
 * positioning.
 *
 * @author      Sami Shaio
 * @see         java.awt.event.AdjustmentEvent
 * @see         java.awt.event.AdjustmentListener
 * @since       1.0
 */
export class Scrollbar extends Component {
  /**
   * A constant that indicates a horizontal scroll bar.
   */
  static readonly HORIZONTAL: number = 0;
  /**
   * A constant that indicates a vertical scroll bar.
   */
  static readonly VERTICAL: number = 1;
  /**
   * The value of the {@code Scrollbar}.
   * This property must be greater than or equal to {@code minimum}
   * and less than or equal to
   * {@code maximum - visibleAmount}
   *
   * @serial
   * @see #getValue
   * @see #setValue
   */
  value_: number = 0;
  /**
   * The maximum value of the {@code Scrollbar}.
   * This value must be greater than the {@code minimum}
   * value.<br>
   *
   * @serial
   * @see #getMaximum
   * @see #setMaximum
   */
  maximum: number = 0;
  /**
   * The minimum value of the {@code Scrollbar}.
   * This value must be less than the {@code maximum}
   * value.<br>
   *
   * @serial
   * @see #getMinimum
   * @see #setMinimum
   */
  minimum: number = 0;
  /**
   * The size of the {@code Scrollbar}'s bubble.
   * When a scroll bar is used to select a range of values,
   * the visibleAmount represents the size of this range.
   * Depending on platform, this may be visually indicated
   * by the size of the bubble.
   *
   * @serial
   * @see #getVisibleAmount
   * @see #setVisibleAmount
   */
  visibleAmount: number = 0;
  /**
   * The {@code Scrollbar}'s orientation--being either horizontal
   * or vertical.
   * This value should be specified when the scrollbar is created.<BR>
   * orientation can be either : {@code VERTICAL} or
   * {@code HORIZONTAL} only.
   *
   * @serial
   * @see #getOrientation
   * @see #setOrientation
   */
  orientation: number = 0;
  /**
   * The amount by which the scrollbar value will change when going
   * up or down by a line.
   * This value must be greater than zero.
   *
   * @serial
   * @see #getLineIncrement
   * @see #setLineIncrement
   */
  lineIncrement: number = 0;
  /**
   * The amount by which the scrollbar value will change when going
   * up or down by a page.
   * This value must be greater than zero.
   *
   * @serial
   * @see #getPageIncrement
   * @see #setPageIncrement
   */
  pageIncrement: number = 0;
  /**
   * The adjusting status of the {@code Scrollbar}.
   * True if the value is in the process of changing as a result of
   * actions being taken by the user.
   *
   * @see #getValueIsAdjusting
   * @see #setValueIsAdjusting
   * @since 1.4
   */
  isAdjusting: boolean = false;
  adjustmentListener: AdjustmentListener = null;
  static readonly base: string = 'scrollbar';
  static nameCounter: number = 0;
  /**
   * The scroll bar's serialized Data Version.
   *
   * @serial
   */
  scrollbarSerializedDataVersion: number = 0;
  $init_Scrollbar() {
    this.lineIncrement = 1;
    this.pageIncrement = 10;
    this.scrollbarSerializedDataVersion = 1;
  }
}

$J.define(Scrollbar, 'java.awt.Scrollbar', { kind: 'class', ifaces: ['java.awt.Adjustable', 'javax.accessibility.Accessible'], sup: 'java.awt.Component', ctors: { 'int,int,int,int,int': '_Scrollbar$int$int$int$int$int', 'int': '_Scrollbar$int', '': '_Scrollbar$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Scrollbar', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$Scrollbar', 'getBlockIncrement()': 'getBlockIncrement$', 'getUnitIncrement()': 'getUnitIncrement$' } });
