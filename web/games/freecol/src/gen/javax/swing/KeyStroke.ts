// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/KeyStroke.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, JObject, JString } from '../../../jre/index.ts';
import { AWTKeyStroke } from '../../java/awt/AWTKeyStroke.ts';

let SwingAccessor;

/**
 * A KeyStroke represents a key action on the keyboard, or equivalent input
 * device. KeyStrokes can correspond to only a press or release of a particular
 * key, just as KEY_PRESSED and KEY_RELEASED KeyEvents do; alternately, they
 * can correspond to typing a specific Java character, just as KEY_TYPED
 * KeyEvents do. In all cases, KeyStrokes can specify modifiers (alt, shift,
 * control, meta, altGraph, or a combination thereof) which must be present during the
 * action for an exact match.
 * <p>
 * KeyStrokes are used to define high-level (semantic) action events. Instead
 * of trapping every keystroke and throwing away the ones you are not
 * interested in, those keystrokes you care about automatically initiate
 * actions on the Components with which they are registered.
 * <p>
 * KeyStrokes are immutable, and are intended to be unique. Client code cannot
 * create a KeyStroke; a variant of <code>getKeyStroke</code> must be used
 * instead. These factory methods allow the KeyStroke implementation to cache
 * and share instances efficiently.
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
 * @see javax.swing.text.Keymap
 * @see #getKeyStroke
 *
 * @author Arnaud Weber
 * @author David Mendenhall
 * @since 1.2
 */
export class KeyStroke extends AWTKeyStroke {
  _KeyStroke$(): this {
    this._AWTKeyStroke$();
    return this;
  }
  /**
   * Returns a shared instance of a <code>KeyStroke</code>
   * that represents a <code>KEY_TYPED</code> event for the
   * specified character.
   *
   * @param keyChar the character value for a keyboard key
   * @return a KeyStroke object for that key
   */
  static getKeyStroke$char(keyChar: number): KeyStroke {
    {
      return AWTKeyStroke.getAWTKeyStroke$char(keyChar);
    }
  }
  /**
   * Returns a shared instance of a KeyStroke, given a numeric key code and a
   * set of modifiers, specifying whether the key is activated when it is
   * pressed or released.
   * <p>
   * The "virtual key" constants defined in java.awt.event.KeyEvent can be
   * used to specify the key code. For example:<ul>
   * <li>java.awt.event.KeyEvent.VK_ENTER
   * <li>java.awt.event.KeyEvent.VK_TAB
   * <li>java.awt.event.KeyEvent.VK_SPACE
   * </ul>
   * Alternatively, the key code may be obtained by calling
   * <code>java.awt.event.KeyEvent.getExtendedKeyCodeForChar</code>.
   *
   * The modifiers consist of any combination of:<ul>
   * <li>java.awt.event.InputEvent.SHIFT_DOWN_MASK
   * <li>java.awt.event.InputEvent.CTRL_DOWN_MASK
   * <li>java.awt.event.InputEvent.META_DOWN_MASK
   * <li>java.awt.event.InputEvent.ALT_DOWN_MASK
   * <li>java.awt.event.InputEvent.ALT_GRAPH_DOWN_MASK
   * </ul>
   * The old modifiers <ul>
   * <li>java.awt.event.InputEvent.SHIFT_MASK
   * <li>java.awt.event.InputEvent.CTRL_MASK
   * <li>java.awt.event.InputEvent.META_MASK
   * <li>java.awt.event.InputEvent.ALT_MASK
   * <li>java.awt.event.InputEvent.ALT_GRAPH_MASK
   * </ul>
   * also can be used, but they are mapped to _DOWN_ modifiers.
   *
   * Since these numbers are all different powers of two, any combination of
   * them is an integer in which each bit represents a different modifier
   * key. Use 0 to specify no modifiers.
   *
   * @param keyCode an int specifying the numeric code for a keyboard key
   * @param modifiers a bitwise-ored combination of any modifiers
   * @param onKeyRelease <code>true</code> if the KeyStroke should represent
   *        a key release; <code>false</code> otherwise.
   * @return a KeyStroke object for that key
   *
   * @see java.awt.event.KeyEvent
   * @see java.awt.event.InputEvent
   */
  static getKeyStroke$int$int$boolean(keyCode: number, modifiers: number, onKeyRelease: boolean): KeyStroke {
    {
      return AWTKeyStroke.getAWTKeyStroke$int$int$boolean(keyCode, modifiers, onKeyRelease);
    }
  }
  /**
   * Returns a shared instance of a KeyStroke, given a numeric key code and a
   * set of modifiers. The returned KeyStroke will correspond to a key press.
   * <p>
   * The "virtual key" constants defined in java.awt.event.KeyEvent can be
   * used to specify the key code. For example:<ul>
   * <li>java.awt.event.KeyEvent.VK_ENTER
   * <li>java.awt.event.KeyEvent.VK_TAB
   * <li>java.awt.event.KeyEvent.VK_SPACE
   * </ul>
   * Alternatively, the key code may be obtained by calling
   * <code>java.awt.event.KeyEvent.getExtendedKeyCodeForChar</code>.
   *
   * The modifiers consist of any combination of:<ul>
   * <li>java.awt.event.InputEvent.SHIFT_DOWN_MASK
   * <li>java.awt.event.InputEvent.CTRL_DOWN_MASK
   * <li>java.awt.event.InputEvent.META_DOWN_MASK
   * <li>java.awt.event.InputEvent.ALT_DOWN_MASK
   * <li>java.awt.event.InputEvent.ALT_GRAPH_DOWN_MASK
   * </ul>
   * The old modifiers <ul>
   * <li>java.awt.event.InputEvent.SHIFT_MASK
   * <li>java.awt.event.InputEvent.CTRL_MASK
   * <li>java.awt.event.InputEvent.META_MASK
   * <li>java.awt.event.InputEvent.ALT_MASK
   * <li>java.awt.event.InputEvent.ALT_GRAPH_MASK
   * </ul>
   * also can be used, but they are mapped to _DOWN_ modifiers.
   *
   * Since these numbers are all different powers of two, any combination of
   * them is an integer in which each bit represents a different modifier
   * key. Use 0 to specify no modifiers.
   *
   * @param keyCode an int specifying the numeric code for a keyboard key
   * @param modifiers a bitwise-ored combination of any modifiers
   * @return a KeyStroke object for that key
   *
   * @see java.awt.event.KeyEvent
   * @see java.awt.event.InputEvent
   */
  static getKeyStroke$int$int(keyCode: number, modifiers: number): KeyStroke {
    {
      return AWTKeyStroke.getAWTKeyStroke$int$int(keyCode, modifiers);
    }
  }
  /**
   * Returns a KeyStroke which represents the stroke which generated a given
   * KeyEvent.
   * <p>
   * This method obtains the keyChar from a KeyTyped event, and the keyCode
   * from a KeyPressed or KeyReleased event. The KeyEvent modifiers are
   * obtained for all three types of KeyEvent.
   *
   * @param anEvent the KeyEvent from which to obtain the KeyStroke
   * @throws NullPointerException if <code>anEvent</code> is null
   * @return the KeyStroke that precipitated the event
   */
  static getKeyStrokeForEvent(anEvent: KeyEvent): KeyStroke {
    {
      return AWTKeyStroke.getAWTKeyStrokeForEvent(anEvent);
    }
  }
  /**
   * Parses a string and returns a <code>KeyStroke</code>.
   * The string must have the following syntax:
   * <pre>
   *    &lt;modifiers&gt;* (&lt;typedID&gt; | &lt;pressedReleasedID&gt;)
   *
   *    modifiers := shift | control | ctrl | meta | alt | altGraph
   *    typedID := typed &lt;typedKey&gt;
   *    typedKey := string of length 1 giving Unicode character.
   *    pressedReleasedID := (pressed | released) key
   *    key := KeyEvent key code name, i.e. the name following "VK_".
   * </pre>
   * If typed, pressed or released is not specified, pressed is assumed. Here
   * are some examples:
   * <pre>
   *     "INSERT" =&gt; getKeyStroke(KeyEvent.VK_INSERT, 0);
   *     "control DELETE" =&gt; getKeyStroke(KeyEvent.VK_DELETE, InputEvent.CTRL_MASK);
   *     "alt shift X" =&gt; getKeyStroke(KeyEvent.VK_X, InputEvent.ALT_MASK | InputEvent.SHIFT_MASK);
   *     "alt shift released X" =&gt; getKeyStroke(KeyEvent.VK_X, InputEvent.ALT_MASK | InputEvent.SHIFT_MASK, true);
   *     "typed a" =&gt; getKeyStroke('a');
   * </pre>
   *
   * In order to maintain backward-compatibility, specifying a null String,
   * or a String which is formatted incorrectly, returns null.
   *
   * @param s a String formatted as described above
   * @return a KeyStroke object for that String, or null if the specified
   *         String is null, or is formatted incorrectly
   *
   * @see java.awt.event.KeyEvent
   */
  static getKeyStroke$String(s: string): KeyStroke {
    if (s == null || s.length === 0) {
      return null;
    }
    {
      try {
        return AWTKeyStroke.getAWTKeyStroke$String(s);
      } catch ($e0) {
        if ($J.isa($e0, IllegalArgumentException)) {
          let e = $J.exc($e0);
          return null;
        } else {
          throw $e0;
        }
      }
    }
  }
  static $clinit() {
    SwingAccessor.setKeyStrokeAccessor(new (KeyStroke$1())());
  }
}

let $KeyStroke$1: any = null;
/** An anonymous class (KeyStroke.java:79). */
function KeyStroke$1(): any {
  return $KeyStroke$1 ??= $J.local(class extends JObject {
    create(): KeyStroke {
      return new KeyStroke()._KeyStroke$();
    }
  }, 'javax.swing.KeyStroke$1', ['sun.swing.SwingAccessor$KeyStrokeAccessor']);
}

$J.define(KeyStroke, 'javax.swing.KeyStroke', { kind: 'class', sup: 'java.awt.AWTKeyStroke', ctors: { 'char,int,int,boolean': '_KeyStroke$char$int$int$boolean', '': '_KeyStroke$' }, meths: { 'getKeyStroke(java.lang.String)': 'getKeyStroke$String', 'getKeyStroke(int,int)': 'getKeyStroke$int$int', 'getKeyStroke(int,int,boolean)': 'getKeyStroke$int$int$boolean', 'getKeyStroke(java.lang.Character,int)': 'getKeyStroke$Character$int', 'getKeyStroke(char,boolean)': 'getKeyStroke$char$boolean', 'getKeyStroke(char)': 'getKeyStroke$char' }, clinit: true, lazy: [] });
$J.module(() => {
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
});
