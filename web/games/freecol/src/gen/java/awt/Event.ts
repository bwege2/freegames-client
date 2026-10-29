// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Event.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Toolkit } from '../../../jre/index.ts';

let GraphicsEnvironment, KeyEvent;

/**
 * <b>NOTE:</b> The {@code Event} class is obsolete and is
 * available only for backwards compatibility.  It has been replaced
 * by the {@code AWTEvent} class and its subclasses.
 * <p>
 * {@code Event} is a platform-independent class that
 * encapsulates events from the platform's Graphical User
 * Interface in the Java&nbsp;1.0 event model. In Java&nbsp;1.1
 * and later versions, the {@code Event} class is maintained
 * only for backwards compatibility. The information in this
 * class description is provided to assist programmers in
 * converting Java&nbsp;1.0 programs to the new event model.
 * <p>
 * In the Java&nbsp;1.0 event model, an event contains an
 * {@link Event#id} field
 * that indicates what type of event it is and which other
 * {@code Event} variables are relevant for the event.
 * <p>
 * For keyboard events, {@link Event#key}
 * contains a value indicating which key was activated, and
 * {@link Event#modifiers} contains the
 * modifiers for that event.  For the KEY_PRESS and KEY_RELEASE
 * event ids, the value of {@code key} is the unicode
 * character code for the key. For KEY_ACTION and
 * KEY_ACTION_RELEASE, the value of {@code key} is
 * one of the defined action-key identifiers in the
 * {@code Event} class ({@code PGUP},
 * {@code PGDN}, {@code F1}, {@code F2}, etc).
 *
 * @deprecated It is recommended that {@code AWTEvent} and its subclasses be
 *             used instead
 * @author     Sami Shaio
 * @since      1.0
 */
export class Event extends JObject {
  data: number = 0;
  /**
   * This flag indicates that the Shift key was down when the event
   * occurred.
   */
  static readonly SHIFT_MASK: number = 1;
  /**
   * This flag indicates that the Control key was down when the event
   * occurred.
   */
  static readonly CTRL_MASK: number = 2;
  /**
   * This flag indicates that the Meta key was down when the event
   * occurred. For mouse events, this flag indicates that the right
   * button was pressed or released.
   */
  static readonly META_MASK: number = 4;
  /**
   * This flag indicates that the Alt key was down when
   * the event occurred. For mouse events, this flag indicates that the
   * middle mouse button was pressed or released.
   */
  static readonly ALT_MASK: number = 8;
  /**
   * The Home key, a non-ASCII action key.
   */
  static readonly HOME: number = 1000;
  /**
   * The End key, a non-ASCII action key.
   */
  static readonly END: number = 1001;
  /**
   * The Page Up key, a non-ASCII action key.
   */
  static readonly PGUP: number = 1002;
  /**
   * The Page Down key, a non-ASCII action key.
   */
  static readonly PGDN: number = 1003;
  /**
   * The Up Arrow key, a non-ASCII action key.
   */
  static readonly UP: number = 1004;
  /**
   * The Down Arrow key, a non-ASCII action key.
   */
  static readonly DOWN: number = 1005;
  /**
   * The Left Arrow key, a non-ASCII action key.
   */
  static readonly LEFT: number = 1006;
  /**
   * The Right Arrow key, a non-ASCII action key.
   */
  static readonly RIGHT: number = 1007;
  /**
   * The F1 function key, a non-ASCII action key.
   */
  static readonly F1: number = 1008;
  /**
   * The F2 function key, a non-ASCII action key.
   */
  static readonly F2: number = 1009;
  /**
   * The F3 function key, a non-ASCII action key.
   */
  static readonly F3: number = 1010;
  /**
   * The F4 function key, a non-ASCII action key.
   */
  static readonly F4: number = 1011;
  /**
   * The F5 function key, a non-ASCII action key.
   */
  static readonly F5: number = 1012;
  /**
   * The F6 function key, a non-ASCII action key.
   */
  static readonly F6: number = 1013;
  /**
   * The F7 function key, a non-ASCII action key.
   */
  static readonly F7: number = 1014;
  /**
   * The F8 function key, a non-ASCII action key.
   */
  static readonly F8: number = 1015;
  /**
   * The F9 function key, a non-ASCII action key.
   */
  static readonly F9: number = 1016;
  /**
   * The F10 function key, a non-ASCII action key.
   */
  static readonly F10: number = 1017;
  /**
   * The F11 function key, a non-ASCII action key.
   */
  static readonly F11: number = 1018;
  /**
   * The F12 function key, a non-ASCII action key.
   */
  static readonly F12: number = 1019;
  /**
   * The Print Screen key, a non-ASCII action key.
   */
  static readonly PRINT_SCREEN: number = 1020;
  /**
   * The Scroll Lock key, a non-ASCII action key.
   */
  static readonly SCROLL_LOCK: number = 1021;
  /**
   * The Caps Lock key, a non-ASCII action key.
   */
  static readonly CAPS_LOCK: number = 1022;
  /**
   * The Num Lock key, a non-ASCII action key.
   */
  static readonly NUM_LOCK: number = 1023;
  /**
   * The Pause key, a non-ASCII action key.
   */
  static readonly PAUSE: number = 1024;
  /**
   * The Insert key, a non-ASCII action key.
   */
  static readonly INSERT: number = 1025;
  /**
   * The Enter key.
   */
  static readonly ENTER: number = 10;
  /**
   * The BackSpace key.
   */
  static readonly BACK_SPACE: number = 8;
  /**
   * The Tab key.
   */
  static readonly TAB: number = 9;
  /**
   * The Escape key.
   */
  static readonly ESCAPE: number = 27;
  /**
   * The Delete key.
   */
  static readonly DELETE: number = 127;
  static readonly WINDOW_EVENT: number = 200;
  /**
   * The user has asked the window manager to kill the window.
   */
  static readonly WINDOW_DESTROY: number = 201;
  /**
   * The user has asked the window manager to expose the window.
   */
  static readonly WINDOW_EXPOSE: number = 202;
  /**
   * The user has asked the window manager to iconify the window.
   */
  static readonly WINDOW_ICONIFY: number = 203;
  /**
   * The user has asked the window manager to de-iconify the window.
   */
  static readonly WINDOW_DEICONIFY: number = 204;
  /**
   * The user has asked the window manager to move the window.
   */
  static readonly WINDOW_MOVED: number = 205;
  static readonly KEY_EVENT: number = 400;
  /**
   * The user has pressed a normal key.
   */
  static readonly KEY_PRESS: number = 401;
  /**
   * The user has released a normal key.
   */
  static readonly KEY_RELEASE: number = 402;
  /**
   * The user has pressed a non-ASCII <em>action</em> key.
   * The {@code key} field contains a value that indicates
   * that the event occurred on one of the action keys, which
   * comprise the 12 function keys, the arrow (cursor) keys,
   * Page Up, Page Down, Home, End, Print Screen, Scroll Lock,
   * Caps Lock, Num Lock, Pause, and Insert.
   */
  static readonly KEY_ACTION: number = 403;
  /**
   * The user has released a non-ASCII <em>action</em> key.
   * The {@code key} field contains a value that indicates
   * that the event occurred on one of the action keys, which
   * comprise the 12 function keys, the arrow (cursor) keys,
   * Page Up, Page Down, Home, End, Print Screen, Scroll Lock,
   * Caps Lock, Num Lock, Pause, and Insert.
   */
  static readonly KEY_ACTION_RELEASE: number = 404;
  static readonly MOUSE_EVENT: number = 500;
  /**
   * The user has pressed the mouse button. The {@code ALT_MASK}
   * flag indicates that the middle button has been pressed.
   * The {@code META_MASK} flag indicates that the
   * right button has been pressed.
   * @see     java.awt.Event#ALT_MASK
   * @see     java.awt.Event#META_MASK
   */
  static readonly MOUSE_DOWN: number = 501;
  /**
   * The user has released the mouse button. The {@code ALT_MASK}
   * flag indicates that the middle button has been released.
   * The {@code META_MASK} flag indicates that the
   * right button has been released.
   * @see     java.awt.Event#ALT_MASK
   * @see     java.awt.Event#META_MASK
   */
  static readonly MOUSE_UP: number = 502;
  /**
   * The mouse has moved with no button pressed.
   */
  static readonly MOUSE_MOVE: number = 503;
  /**
   * The mouse has entered a component.
   */
  static readonly MOUSE_ENTER: number = 504;
  /**
   * The mouse has exited a component.
   */
  static readonly MOUSE_EXIT: number = 505;
  /**
   * The user has moved the mouse with a button pressed. The
   * {@code ALT_MASK} flag indicates that the middle
   * button is being pressed. The {@code META_MASK} flag indicates
   * that the right button is being pressed.
   * @see     java.awt.Event#ALT_MASK
   * @see     java.awt.Event#META_MASK
   */
  static readonly MOUSE_DRAG: number = 506;
  static readonly SCROLL_EVENT: number = 600;
  /**
   * The user has activated the <em>line up</em>
   * area of a scroll bar.
   */
  static readonly SCROLL_LINE_UP: number = 601;
  /**
   * The user has activated the <em>line down</em>
   * area of a scroll bar.
   */
  static readonly SCROLL_LINE_DOWN: number = 602;
  /**
   * The user has activated the <em>page up</em>
   * area of a scroll bar.
   */
  static readonly SCROLL_PAGE_UP: number = 603;
  /**
   * The user has activated the <em>page down</em>
   * area of a scroll bar.
   */
  static readonly SCROLL_PAGE_DOWN: number = 604;
  /**
   * The user has moved the bubble (thumb) in a scroll bar,
   * moving to an "absolute" position, rather than to
   * an offset from the last position.
   */
  static readonly SCROLL_ABSOLUTE: number = 605;
  /**
   * The scroll begin event.
   */
  static readonly SCROLL_BEGIN: number = 606;
  /**
   * The scroll end event.
   */
  static readonly SCROLL_END: number = 607;
  static readonly LIST_EVENT: number = 700;
  /**
   * An item in a list has been selected.
   */
  static readonly LIST_SELECT: number = 701;
  /**
   * An item in a list has been deselected.
   */
  static readonly LIST_DESELECT: number = 702;
  static readonly MISC_EVENT: number = 1000;
  /**
   * This event indicates that the user wants some action to occur.
   */
  static readonly ACTION_EVENT: number = 1001;
  /**
   * A file loading event.
   */
  static readonly LOAD_FILE: number = 1002;
  /**
   * A file saving event.
   */
  static readonly SAVE_FILE: number = 1003;
  /**
   * A component gained the focus.
   */
  static readonly GOT_FOCUS: number = 1004;
  /**
   * A component lost the focus.
   */
  static readonly LOST_FOCUS: number = 1005;
  /**
   * The target component. This indicates the component over which the
   * event occurred or with which the event is associated.
   * This object has been replaced by AWTEvent.getSource()
   *
   * @serial
   * @see java.awt.AWTEvent#getSource()
   */
  target: any = null;
  /**
   * The time stamp.
   * Replaced by InputEvent.getWhen().
   *
   * @serial
   * @see java.awt.event.InputEvent#getWhen()
   */
  when: number = 0;
  /**
   * Indicates which type of event the event is, and which
   * other {@code Event} variables are relevant for the event.
   * This has been replaced by AWTEvent.getID()
   *
   * @serial
   * @see java.awt.AWTEvent#getID()
   */
  id_: number = 0;
  /**
   * The <i>x</i> coordinate of the event.
   * Replaced by MouseEvent.getX()
   *
   * @serial
   * @see java.awt.event.MouseEvent#getX()
   */
  x_: number = 0;
  /**
   * The <i>y</i> coordinate of the event.
   * Replaced by MouseEvent.getY()
   *
   * @serial
   * @see java.awt.event.MouseEvent#getY()
   */
  y_: number = 0;
  /**
   * The key code of the key that was pressed in a keyboard event.
   * This has been replaced by KeyEvent.getKeyCode()
   *
   * @serial
   * @see java.awt.event.KeyEvent#getKeyCode()
   */
  key: number = 0;
  /**
   * The state of the modifier keys.
   * This is replaced with InputEvent.getModifiers()
   * In java 1.1 MouseEvent and KeyEvent are subclasses
   * of InputEvent.
   *
   * @serial
   * @see java.awt.event.InputEvent#getModifiers()
   */
  modifiers: number = 0;
  /**
   * For {@code MOUSE_DOWN} events, this field indicates the
   * number of consecutive clicks. For other events, its value is
   * {@code 0}.
   * This field has been replaced by MouseEvent.getClickCount().
   *
   * @serial
   * @see java.awt.event.MouseEvent#getClickCount()
   */
  clickCount: number = 0;
  /**
   * An arbitrary argument of the event. The value of this field
   * depends on the type of event.
   * {@code arg} has been replaced by event specific property.
   *
   * @serial
   */
  arg: any = null;
  /**
   * The next event. This field is set when putting events into a
   * linked list.
   * This has been replaced by EventQueue.
   *
   * @serial
   * @see java.awt.EventQueue
   */
  evt: Event = null;
  static actionKeyCodes: number[][] = null;
  /**
   * This field controls whether or not the event is sent back
   * down to the peer once the target has processed it -
   * false means it's sent to the peer, true means it's not.
   *
   * @serial
   * @see #isConsumed()
   */
  consumed: boolean = false;
  $init_Event() {
    this.consumed = false;
  }
  /**
   * <b>NOTE:</b> The {@code Event} class is obsolete and is
   * available only for backwards compatibility.  It has been replaced
   * by the {@code AWTEvent} class and its subclasses.
   * <p>
   * Creates an instance of {@code Event} with the specified target
   * component, time stamp, event type, <i>x</i> and <i>y</i>
   * coordinates, keyboard key, state of the modifier keys, and
   * argument.
   * @param     target     the target component.
   * @param     when       the time stamp.
   * @param     id         the event type.
   * @param     x          the <i>x</i> coordinate.
   * @param     y          the <i>y</i> coordinate.
   * @param     key        the key pressed in a keyboard event.
   * @param     modifiers  the state of the modifier keys.
   * @param     arg        the specified argument.
   */
  _Event$Object$long$int$int$int$int$int$Object(target: any, when: number, id: number, x: number, y: number, key: number, modifiers: number, arg: any): this {
    this.$init_Event();
    this.target = target;
    this.when = when;
    this.id_ = id;
    this.x_ = x;
    this.y_ = y;
    this.key = key;
    this.modifiers = modifiers;
    this.arg = arg;
    this.data = 0;
    this.clickCount = 0;
    switch (id) {
      case Event.ACTION_EVENT:
      case Event.WINDOW_DESTROY:
      case Event.WINDOW_ICONIFY:
      case Event.WINDOW_DEICONIFY:
      case Event.WINDOW_MOVED:
      case Event.SCROLL_LINE_UP:
      case Event.SCROLL_LINE_DOWN:
      case Event.SCROLL_PAGE_UP:
      case Event.SCROLL_PAGE_DOWN:
      case Event.SCROLL_ABSOLUTE:
      case Event.SCROLL_BEGIN:
      case Event.SCROLL_END:
      case Event.LIST_SELECT:
      case Event.LIST_DESELECT:
        this.consumed = true;
        break;
      default:
    }
    return this;
  }
  /**
   * <b>NOTE:</b> The {@code Event} class is obsolete and is
   * available only for backwards compatibility.  It has been replaced
   * by the {@code AWTEvent} class and its subclasses.
   * <p>
   * Creates an instance of {@code Event}, with the specified target
   * component, time stamp, event type, <i>x</i> and <i>y</i>
   * coordinates, keyboard key, state of the modifier keys, and an
   * argument set to {@code null}.
   * @param     target     the target component.
   * @param     when       the time stamp.
   * @param     id         the event type.
   * @param     x          the <i>x</i> coordinate.
   * @param     y          the <i>y</i> coordinate.
   * @param     key        the key pressed in a keyboard event.
   * @param     modifiers  the state of the modifier keys.
   */
  _Event$Object$long$int$int$int$int$int(target: any, when: number, id: number, x: number, y: number, key: number, modifiers: number): this {
    this._Event$Object$long$int$int$int$int$int$Object(target, when, id, x, y, key, modifiers, null);
    return this;
  }
  /**
   * <b>NOTE:</b> The {@code Event} class is obsolete and is
   * available only for backwards compatibility.  It has been replaced
   * by the {@code AWTEvent} class and its subclasses.
   * <p>
   * Creates an instance of {@code Event} with the specified
   * target component, event type, and argument.
   * @param     target     the target component.
   * @param     id         the event type.
   * @param     arg        the specified argument.
   */
  _Event$Object$int$Object(target: any, id: number, arg: any): this {
    this._Event$Object$long$int$int$int$int$int$Object(target, 0, id, 0, 0, 0, 0, arg);
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Event', 'initIDs', this, $a);
  }
  /**
   * <b>NOTE:</b> The {@code Event} class is obsolete and is
   * available only for backwards compatibility.  It has been replaced
   * by the {@code AWTEvent} class and its subclasses.
   * <p>
   * Translates this event so that its <i>x</i> and <i>y</i>
   * coordinates are increased by <i>dx</i> and <i>dy</i>,
   * respectively.
   * <p>
   * This method translates an event relative to the given component.
   * This involves, at a minimum, translating the coordinates into the
   * local coordinate system of the given component. It may also involve
   * translating a region in the case of an expose event.
   * @param     dx     the distance to translate the <i>x</i> coordinate.
   * @param     dy     the distance to translate the <i>y</i> coordinate.
   */
  translate(dx: number, dy: number): void {
    this.x_ = (this.x_ + dx) | 0;
    this.y_ = (this.y_ + dy) | 0;
  }
  /**
   * <b>NOTE:</b> The {@code Event} class is obsolete and is
   * available only for backwards compatibility.  It has been replaced
   * by the {@code AWTEvent} class and its subclasses.
   * <p>
   * Checks if the Shift key is down.
   * @return    {@code true} if the key is down;
   *            {@code false} otherwise.
   * @see       java.awt.Event#modifiers
   * @see       java.awt.Event#controlDown
   * @see       java.awt.Event#metaDown
   */
  shiftDown(): boolean {
    return (this.modifiers & Event.SHIFT_MASK) !== 0;
  }
  /**
   * <b>NOTE:</b> The {@code Event} class is obsolete and is
   * available only for backwards compatibility.  It has been replaced
   * by the {@code AWTEvent} class and its subclasses.
   * <p>
   * Checks if the Control key is down.
   * @return    {@code true} if the key is down;
   *            {@code false} otherwise.
   * @see       java.awt.Event#modifiers
   * @see       java.awt.Event#shiftDown
   * @see       java.awt.Event#metaDown
   */
  controlDown(): boolean {
    return (this.modifiers & Event.CTRL_MASK) !== 0;
  }
  /**
   * <b>NOTE:</b> The {@code Event} class is obsolete and is
   * available only for backwards compatibility.  It has been replaced
   * by the {@code AWTEvent} class and its subclasses.
   * <p>
   * Checks if the Meta key is down.
   *
   * @return    {@code true} if the key is down;
   *            {@code false} otherwise.
   * @see       java.awt.Event#modifiers
   * @see       java.awt.Event#shiftDown
   * @see       java.awt.Event#controlDown
   */
  metaDown(): boolean {
    return (this.modifiers & Event.META_MASK) !== 0;
  }
  /**
   * <b>NOTE:</b> The {@code Event} class is obsolete and is
   * available only for backwards compatibility.  It has been replaced
   * by the {@code AWTEvent} class and its subclasses.
   */
  consume(): void {
    switch (this.id_) {
      case Event.KEY_PRESS:
      case Event.KEY_RELEASE:
      case Event.KEY_ACTION:
      case Event.KEY_ACTION_RELEASE:
        this.consumed = true;
        break;
      default:
    }
  }
  /**
   * <b>NOTE:</b> The {@code Event} class is obsolete and is
   * available only for backwards compatibility.  It has been replaced
   * by the {@code AWTEvent} class and its subclasses.
   */
  isConsumed(): boolean {
    return this.consumed;
  }
  static getOldEventKey(e: KeyEvent): number {
    let keyCode = e.getKeyCode();
    for (let i = 0; i < Event.actionKeyCodes.length; i++) {
      if (Event.actionKeyCodes[i][0] === keyCode) {
        return Event.actionKeyCodes[i][1];
      }
    }
    return e.getKeyChar();
  }
  getKeyEventChar(): number {
    for (let i = 0; i < Event.actionKeyCodes.length; i++) {
      if (Event.actionKeyCodes[i][1] === this.key) {
        return KeyEvent.CHAR_UNDEFINED;
      }
    }
    return (this.key) & 0xffff;
  }
  /**
   * <b>NOTE:</b> The {@code Event} class is obsolete and is
   * available only for backwards compatibility.  It has been replaced
   * by the {@code AWTEvent} class and its subclasses.
   * <p>
   * Returns a string representing the state of this {@code Event}.
   * This method is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not be
   * {@code null}.
   *
   * @return    the parameter string of this event
   */
  paramString(): string {
    let str = 'id=' + this.id_ + ',x=' + this.x_ + ',y=' + this.y_;
    if (this.key !== 0) {
      str += ',key=' + this.key;
    }
    if (this.shiftDown()) {
      str += ',shift';
    }
    if (this.controlDown()) {
      str += ',control';
    }
    if (this.metaDown()) {
      str += ',meta';
    }
    if (this.target != null) {
      str += ',target=' + $J.str(this.target);
    }
    if (this.arg != null) {
      str += ',arg=' + $J.str(this.arg);
    }
    return str;
  }
  /**
   * <b>NOTE:</b> The {@code Event} class is obsolete and is
   * available only for backwards compatibility.  It has been replaced
   * by the {@code AWTEvent} class and its subclasses.
   * <p>
   * Returns a representation of this event's values as a string.
   * @return    a string that represents the event and the values
   *                 of its member fields.
   * @see       java.awt.Event#paramString
   * @since     1.1
   */
  toString(): string {
    return $J.getClass(this).getName() + '[' + this.paramString() + ']';
  }
  static $clinit() {
    Event.actionKeyCodes = [[KeyEvent.VK_HOME, Event.HOME], [KeyEvent.VK_END, Event.END], [KeyEvent.VK_PAGE_UP, Event.PGUP], [KeyEvent.VK_PAGE_DOWN, Event.PGDN], [KeyEvent.VK_UP, Event.UP], [KeyEvent.VK_DOWN, Event.DOWN], [KeyEvent.VK_LEFT, Event.LEFT], [KeyEvent.VK_RIGHT, Event.RIGHT], [KeyEvent.VK_F1, Event.F1], [KeyEvent.VK_F2, Event.F2], [KeyEvent.VK_F3, Event.F3], [KeyEvent.VK_F4, Event.F4], [KeyEvent.VK_F5, Event.F5], [KeyEvent.VK_F6, Event.F6], [KeyEvent.VK_F7, Event.F7], [KeyEvent.VK_F8, Event.F8], [KeyEvent.VK_F9, Event.F9], [KeyEvent.VK_F10, Event.F10], [KeyEvent.VK_F11, Event.F11], [KeyEvent.VK_F12, Event.F12], [KeyEvent.VK_PRINTSCREEN, Event.PRINT_SCREEN], [KeyEvent.VK_SCROLL_LOCK, Event.SCROLL_LOCK], [KeyEvent.VK_CAPS_LOCK, Event.CAPS_LOCK], [KeyEvent.VK_NUM_LOCK, Event.NUM_LOCK], [KeyEvent.VK_PAUSE, Event.PAUSE], [KeyEvent.VK_INSERT, Event.INSERT]];
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      Event.initIDs();
    }
  }
}

$J.define(Event, 'java.awt.Event', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.lang.Object,int,java.lang.Object': '_Event$Object$int$Object', 'java.lang.Object,long,int,int,int,int,int': '_Event$Object$long$int$int$int$int$int', 'java.lang.Object,long,int,int,int,int,int,java.lang.Object': '_Event$Object$long$int$int$int$int$int$Object' }, clinit: true, lazy: ['actionKeyCodes'] });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
});
