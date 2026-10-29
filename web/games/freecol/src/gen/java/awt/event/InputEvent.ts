// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/event/InputEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Arrays, IllegalArgumentException, JObject, PlatformLogger, PlatformLogger_Level, SecurityException, StringBuilder, Toolkit } from '../../../../jre/index.ts';
import { ComponentEvent } from './ComponentEvent.ts';

let GraphicsEnvironment, NativeLibLoader, AWTAccessor, AWTPermissions;

/**
 * The root event class for all component-level input events.
 *
 * Input events are delivered to listeners before they are
 * processed normally by the source where they originated.
 * This allows listeners and component subclasses to "consume"
 * the event so that the source will not process them in their
 * default manner.  For example, consuming mousePressed events
 * on a Button component will prevent the Button from being
 * activated.
 *
 * @author Carl Quinn
 *
 * @see KeyEvent
 * @see KeyAdapter
 * @see MouseEvent
 * @see MouseAdapter
 * @see MouseMotionAdapter
 *
 * @since 1.1
 * @sealedGraph
 */
export class InputEvent extends ComponentEvent {
  static logger: PlatformLogger = null;
  /**
   * The Shift key modifier constant.
   *
   * @deprecated It is recommended that SHIFT_DOWN_MASK and
   *             {@link #getModifiersEx()} be used instead
   */
  static readonly SHIFT_MASK: number = 1;
  /**
   * The Control key modifier constant.
   *
   * @deprecated It is recommended that CTRL_DOWN_MASK and
   *             {@link #getModifiersEx()} be used instead
   */
  static readonly CTRL_MASK: number = 2;
  /**
   * The Meta key modifier constant.
   *
   * @deprecated It is recommended that META_DOWN_MASK and
   *             {@link #getModifiersEx()} be used instead
   */
  static readonly META_MASK: number = 4;
  /**
   * The Alt key modifier constant.
   *
   * @deprecated It is recommended that ALT_DOWN_MASK and
   *             {@link #getModifiersEx()} be used instead
   */
  static readonly ALT_MASK: number = 8;
  /**
   * The AltGraph key modifier constant.
   *
   * @deprecated It is recommended that ALT_GRAPH_DOWN_MASK and
   *             {@link #getModifiersEx()} be used instead
   */
  static readonly ALT_GRAPH_MASK: number = 32;
  /**
   * The Mouse Button1 modifier constant.
   *
   * @deprecated It is recommended that BUTTON1_DOWN_MASK and
   *             {@link #getModifiersEx()} be used instead
   */
  static readonly BUTTON1_MASK: number = 16;
  /**
   * The Mouse Button2 modifier constant.
   *
   * @deprecated It is recommended that BUTTON2_DOWN_MASK and
   *             {@link #getModifiersEx()} be used instead. Note that
   *             BUTTON2_MASK has the same value as ALT_MASK.
   */
  static readonly BUTTON2_MASK: number = 8;
  /**
   * The Mouse Button3 modifier constant.
   *
   * @deprecated It is recommended that BUTTON3_DOWN_MASK and
   *             {@link #getModifiersEx()} be used instead. Note that
   *             BUTTON3_MASK has the same value as META_MASK.
   */
  static readonly BUTTON3_MASK: number = 4;
  /**
   * The Shift key extended modifier constant.
   * @since 1.4
   */
  static readonly SHIFT_DOWN_MASK: number = 64;
  /**
   * The Control key extended modifier constant.
   * @since 1.4
   */
  static readonly CTRL_DOWN_MASK: number = 128;
  /**
   * The Meta key extended modifier constant.
   * @since 1.4
   */
  static readonly META_DOWN_MASK: number = 256;
  /**
   * The Alt key extended modifier constant.
   * @since 1.4
   */
  static readonly ALT_DOWN_MASK: number = 512;
  /**
   * The Mouse Button1 extended modifier constant.
   * @since 1.4
   */
  static readonly BUTTON1_DOWN_MASK: number = 1024;
  /**
   * The Mouse Button2 extended modifier constant.
   * @since 1.4
   */
  static readonly BUTTON2_DOWN_MASK: number = 2048;
  /**
   * The Mouse Button3 extended modifier constant.
   * @since 1.4
   */
  static readonly BUTTON3_DOWN_MASK: number = 4096;
  /**
   * The AltGraph key extended modifier constant.
   * @since 1.4
   */
  static readonly ALT_GRAPH_DOWN_MASK: number = 8192;
  /**
   * An array of extended modifiers for additional buttons.
   * @see #getButtonDownMasks()
   * There are twenty buttons fit into 4byte space.
   * one more bit is reserved for FIRST_HIGH_BIT.
   * @since 1.7
   */
  static BUTTON_DOWN_MASK: number[] = null;
  static readonly FIRST_HIGH_BIT: number = -2147483648;
  static readonly JDK_1_3_MODIFIERS: number = 63;
  static readonly HIGH_MODIFIERS: number = -2147483648;
  /**
   * The input event's Time stamp in UTC format.  The time stamp
   * indicates when the input event was created.
   *
   * @serial
   * @see #getWhen()
   */
  when: number = 0;
  /**
   * The state of the modifier mask at the time the input
   * event was fired.
   *
   * @serial
   * @see #getModifiers()
   * @see #getModifiersEx()
   * @see java.awt.event.KeyEvent
   * @see java.awt.event.MouseEvent
   */
  modifiers: number = 0;
  canAccessSystemClipboard_: boolean = false;
  /**
   * Constructs an InputEvent object with the specified source component,
   * modifiers, and type.
   * <p> This method throws an
   * {@code IllegalArgumentException} if {@code source}
   * is {@code null}.
   *
   * @param source the object where the event originated
   * @param id           the integer that identifies the event type.
   *                     It is allowed to pass as parameter any value that
   *                     allowed for some subclass of {@code InputEvent} class.
   *                     Passing in the value different from those values result
   *                     in unspecified behavior
   * @param when         a long int that gives the time the event occurred.
   *                     Passing negative or zero value
   *                     is not recommended
   * @param modifiers    a modifier mask describing the modifier keys and mouse
   *                     buttons (for example, shift, ctrl, alt, and meta) that
   *                     are down during the event.
   *                     Only extended modifiers are allowed to be used as a
   *                     value for this parameter (see the {@link InputEvent#getModifiersEx}
   *                     class for the description of extended modifiers).
   *                     Passing negative parameter
   *                     is not recommended.
   *                     Zero value means that no modifiers were passed
   * @throws IllegalArgumentException if {@code source} is null
   * @see #getSource()
   * @see #getID()
   * @see #getWhen()
   * @see #getModifiers()
   */
  _InputEvent(source: Component, id: number, when: number, modifiers: number): this {
    this._ComponentEvent(source, id);
    this.when = when;
    this.modifiers = modifiers;
    this.canAccessSystemClipboard_ = this.canAccessSystemClipboard();
    return this;
  }
  /**
   * A method to access an array of extended modifiers for additional buttons.
   * @since 1.7
   */
  static getButtonDownMasks(): number[] {
    return Arrays.copyOf(InputEvent.BUTTON_DOWN_MASK, InputEvent.BUTTON_DOWN_MASK.length);
  }
  /**
   * A method to obtain a mask for any existing mouse button.
   * The returned mask may be used for different purposes. Following are some of them:
   * <ul>
   * <li> {@link java.awt.Robot#mousePress(int) mousePress(buttons)} and
   *      {@link java.awt.Robot#mouseRelease(int) mouseRelease(buttons)}
   * <li> as a {@code modifiers} parameter when creating a new {@link MouseEvent} instance
   * <li> to check {@link MouseEvent#getModifiersEx() modifiersEx} of existing {@code MouseEvent}
   * </ul>
   * @param button is a number to represent a button starting from 1.
   * For example,
   * <pre>
   * int button = InputEvent.getMaskForButton(1);
   * </pre>
   * will have the same meaning as
   * <pre>
   * int button = InputEvent.getMaskForButton(MouseEvent.BUTTON1);
   * </pre>
   * because {@link MouseEvent#BUTTON1 MouseEvent.BUTTON1} equals to 1.
   * If a mouse has three enabled buttons(see {@link java.awt.MouseInfo#getNumberOfButtons() MouseInfo.getNumberOfButtons()})
   * then the values from the left column passed into the method will return
   * corresponding values from the right column:
   * <PRE>
   *    <b>button </b>   <b>returned mask</b>
   *    {@link MouseEvent#BUTTON1 BUTTON1}  {@link MouseEvent#BUTTON1_DOWN_MASK BUTTON1_DOWN_MASK}
   *    {@link MouseEvent#BUTTON2 BUTTON2}  {@link MouseEvent#BUTTON2_DOWN_MASK BUTTON2_DOWN_MASK}
   *    {@link MouseEvent#BUTTON3 BUTTON3}  {@link MouseEvent#BUTTON3_DOWN_MASK BUTTON3_DOWN_MASK}
   * </PRE>
   * If a mouse has more than three enabled buttons then more values
   * are admissible (4, 5, etc.). There is no assigned constants for these extended buttons.
   * The button masks for the extra buttons returned by this method have no assigned names like the
   * first three button masks.
   * <p>
   * This method has the following implementation restriction.
   * It returns masks for a limited number of buttons only. The maximum number is
   * implementation dependent and may vary.
   * This limit is defined by the relevant number
   * of buttons that may hypothetically exist on the mouse but it is greater than the
   * {@link java.awt.MouseInfo#getNumberOfButtons() MouseInfo.getNumberOfButtons()}.
   *
   * @return a mask for an existing mouse button.
   * @throws IllegalArgumentException if {@code button} is less than zero or greater than the number
   *         of button masks reserved for buttons
   * @since 1.7
   * @see java.awt.MouseInfo#getNumberOfButtons()
   * @see Toolkit#areExtraMouseButtonsEnabled()
   * @see MouseEvent#getModifiers()
   * @see MouseEvent#getModifiersEx()
   */
  static getMaskForButton(button: number): number {
    if (button <= 0 || button > InputEvent.BUTTON_DOWN_MASK.length) {
      throw new IllegalArgumentException('button doesn\'t exist ' + button);
    }
    return InputEvent.BUTTON_DOWN_MASK[(button - 1) | 0];
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.event.InputEvent', 'initIDs', this, $a);
  }
  canAccessSystemClipboard(): boolean {
    let b = false;
    if (!GraphicsEnvironment.isHeadless()) {
      let sm = $J.system_getSecurityManager();
      if (sm != null) {
        try {
          sm.checkPermission(AWTPermissions.ACCESS_CLIPBOARD_PERMISSION);
          b = true;
        } catch ($e0) {
          if ($J.isa($e0, SecurityException)) {
            let se = $J.exc($e0);
            if (InputEvent.logger.isLoggable(PlatformLogger_Level.FINE)) {
              InputEvent.logger.fine('InputEvent.canAccessSystemClipboard() got SecurityException ', se);
            }
          } else {
            throw $e0;
          }
        }
      } else {
        b = true;
      }
    }
    return b;
  }
  /**
   * Returns whether or not the Shift modifier is down on this event.
   * @return whether or not the Shift modifier is down on this event
   */
  isShiftDown(): boolean {
    return (this.modifiers & InputEvent.SHIFT_DOWN_MASK) !== 0;
  }
  /**
   * Returns whether or not the Control modifier is down on this event.
   * @return whether or not the Control modifier is down on this event
   */
  isControlDown(): boolean {
    return (this.modifiers & InputEvent.CTRL_DOWN_MASK) !== 0;
  }
  /**
   * Returns whether or not the Meta modifier is down on this event.
   * @return whether or not the Meta modifier is down on this event
   */
  isMetaDown(): boolean {
    return (this.modifiers & InputEvent.META_DOWN_MASK) !== 0;
  }
  /**
   * Returns whether or not the Alt modifier is down on this event.
   * @return whether or not the Alt modifier is down on this event
   */
  isAltDown(): boolean {
    return (this.modifiers & InputEvent.ALT_DOWN_MASK) !== 0;
  }
  /**
   * Returns the difference in milliseconds between the timestamp of when this event occurred and
   * midnight, January 1, 1970 UTC.
   * @return the difference in milliseconds between the timestamp and midnight, January 1, 1970 UTC
   */
  getWhen(): number {
    return this.when;
  }
  /**
   * Returns the modifier mask for this event.
   *
   * @return the modifier mask for this event
   * @deprecated It is recommended that extended modifier keys and
   *             {@link #getModifiersEx()} be used instead
   */
  getModifiers(): number {
    return this.modifiers & (InputEvent.JDK_1_3_MODIFIERS | InputEvent.HIGH_MODIFIERS);
  }
  /**
   * Returns the extended modifier mask for this event.
   * <P>
   * Extended modifiers are the modifiers that ends with the _DOWN_MASK suffix,
   * such as ALT_DOWN_MASK, BUTTON1_DOWN_MASK, and others.
   * <P>
   * Extended modifiers represent the state of all modal keys,
   * such as ALT, CTRL, META, and the mouse buttons just after
   * the event occurred.
   * <P>
   * For example, if the user presses <b>button 1</b> followed by
   * <b>button 2</b>, and then releases them in the same order,
   * the following sequence of events is generated:
   * <PRE>
   *    {@code MOUSE_PRESSED}:  {@code BUTTON1_DOWN_MASK}
   *    {@code MOUSE_PRESSED}:  {@code BUTTON1_DOWN_MASK | BUTTON2_DOWN_MASK}
   *    {@code MOUSE_RELEASED}: {@code BUTTON2_DOWN_MASK}
   *    {@code MOUSE_CLICKED}:  {@code BUTTON2_DOWN_MASK}
   *    {@code MOUSE_RELEASED}:
   *    {@code MOUSE_CLICKED}:
   * </PRE>
   * <P>
   * It is not recommended to compare the return value of this method
   * using {@code ==} because new modifiers can be added in the future.
   * For example, the appropriate way to check that SHIFT and BUTTON1 are
   * down, but CTRL is up is demonstrated by the following code:
   * <PRE>
   *    int onmask = SHIFT_DOWN_MASK | BUTTON1_DOWN_MASK;
   *    int offmask = CTRL_DOWN_MASK;
   *    if ((event.getModifiersEx() &amp; (onmask | offmask)) == onmask) {
   *        ...
   *    }
   * </PRE>
   * The above code will work even if new modifiers are added.
   *
   * @return the extended modifier mask for this event
   * @since 1.4
   */
  getModifiersEx(): number {
    return this.modifiers & ~InputEvent.JDK_1_3_MODIFIERS;
  }
  /**
   * Consumes this event so that it will not be processed
   * in the default manner by the source which originated it.
   */
  consume(): void {
    this.consumed = true;
  }
  /**
   * Returns whether or not this event has been consumed.
   * @return whether or not this event has been consumed
   * @see #consume
   */
  isConsumed(): boolean {
    return this.consumed;
  }
  /**
   * Returns a String describing the extended modifier keys and
   * mouse buttons, such as "Shift", "Button1", or "Ctrl+Shift".
   * These strings can be localized by changing the
   * {@code awt.properties} file.
   * <p>
   * Note that passing negative parameter is incorrect,
   * and will cause the returning an unspecified string.
   * Zero parameter means that no modifiers were passed and will
   * cause the returning an empty string.
   *
   * @param modifiers a modifier mask describing the extended
   *                modifier keys and mouse buttons for the event
   * @return a text description of the combination of extended
   *         modifier keys and mouse buttons that were held down
   *         during the event.
   * @since 1.4
   */
  static getModifiersExText(modifiers: number): string {
    let buf = new StringBuilder();
    if ((modifiers & InputEvent.META_DOWN_MASK) !== 0) {
      buf.append(Toolkit.getProperty('AWT.meta', 'Meta'));
      buf.append('+');
    }
    if ((modifiers & InputEvent.CTRL_DOWN_MASK) !== 0) {
      buf.append(Toolkit.getProperty('AWT.control', 'Ctrl'));
      buf.append('+');
    }
    if ((modifiers & InputEvent.ALT_DOWN_MASK) !== 0) {
      buf.append(Toolkit.getProperty('AWT.alt', 'Alt'));
      buf.append('+');
    }
    if ((modifiers & InputEvent.SHIFT_DOWN_MASK) !== 0) {
      buf.append(Toolkit.getProperty('AWT.shift', 'Shift'));
      buf.append('+');
    }
    if ((modifiers & InputEvent.ALT_GRAPH_DOWN_MASK) !== 0) {
      buf.append(Toolkit.getProperty('AWT.altGraph', 'Alt Graph'));
      buf.append('+');
    }
    let buttonNumber = 1;
    for (let mask of InputEvent.BUTTON_DOWN_MASK) {
      if ((modifiers & mask) !== 0) {
        buf.append(Toolkit.getProperty('AWT.button' + buttonNumber, 'Button' + buttonNumber));
        buf.append('+');
      }
      buttonNumber++;
    }
    if (buf.length() > 0) {
      buf.setLength((buf.length() - 1) | 0);
    }
    return buf.toString();
  }
  static $clinit() {
    InputEvent.logger = PlatformLogger.getLogger('java.awt.event.InputEvent');
    InputEvent.BUTTON_DOWN_MASK = [InputEvent.BUTTON1_DOWN_MASK, InputEvent.BUTTON2_DOWN_MASK, InputEvent.BUTTON3_DOWN_MASK, 1 << 14, 1 << 15, 1 << 16, 1 << 17, 1 << 18, 1 << 19, 1 << 20, 1 << 21, 1 << 22, 1 << 23, 1 << 24, 1 << 25, 1 << 26, 1 << 27, 1 << 28, 1 << 29, 1 << 30];
    NativeLibLoader.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      InputEvent.initIDs();
    }
    AWTAccessor.setInputEventAccessor(new (InputEvent$1())());
  }
}

let $InputEvent$1: any = null;
/** An anonymous class (InputEvent.java:326). */
function InputEvent$1(): any {
  return $InputEvent$1 ??= $J.local(class extends JObject {
    getButtonDownMasks(): number[] {
      return InputEvent.getButtonDownMasks();
    }
    canAccessSystemClipboard(event: InputEvent): boolean {
      return event.canAccessSystemClipboard_;
    }
    setCanAccessSystemClipboard(event: InputEvent, canAccessSystemClipboard: boolean): void {
      event.canAccessSystemClipboard_ = canAccessSystemClipboard;
    }
  }, 'java.awt.event.InputEvent$1', ['sun.awt.AWTAccessor$InputEventAccessor']);
}

$J.define(InputEvent, 'java.awt.event.InputEvent', { kind: 'class', sup: 'java.awt.event.ComponentEvent', ctors: { 'java.awt.Component,int,long,int': '_InputEvent' }, clinit: true, lazy: ['logger', 'BUTTON_DOWN_MASK'] });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  NativeLibLoader = $J.load('java.awt.event.NativeLibLoader');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  AWTPermissions = $J.load('sun.awt.AWTPermissions');
});
