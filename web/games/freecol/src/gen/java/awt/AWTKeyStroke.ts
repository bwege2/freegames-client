// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/AWTKeyStroke.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, Collections, HashMap, IllegalAccessException, IllegalArgumentException, JObject, JString, NoSuchFieldException, StringBuilder, StringTokenizer, Toolkit } from '../../../jre/index.ts';

let VKCollection, InputEvent, KeyEvent, SwingAccessor;

/**
 * An {@code AWTKeyStroke} represents a key action on the
 * keyboard, or equivalent input device. {@code AWTKeyStroke}s
 * can correspond to only a press or release of a
 * particular key, just as {@code KEY_PRESSED} and
 * {@code KEY_RELEASED KeyEvent}s do;
 * alternately, they can correspond to typing a specific Java character, just
 * as {@code KEY_TYPED KeyEvent}s do.
 * In all cases, {@code AWTKeyStroke}s can specify modifiers
 * (alt, shift, control, meta, altGraph, or a combination thereof) which must be present
 * during the action for an exact match.
 * <p>
 * {@code AWTKeyStrokes} are immutable, and are intended
 * to be unique. Client code should never create an
 * {@code AWTKeyStroke} on its own, but should instead use
 * a variant of {@code getAWTKeyStroke}. Client use of these factory
 * methods allows the {@code AWTKeyStroke} implementation
 * to cache and share instances efficiently.
 *
 * @see #getAWTKeyStroke
 *
 * @author Arnaud Weber
 * @author David Mendenhall
 * @since 1.4
 */
export class AWTKeyStroke extends JObject {
  static modifierKeywords: JMap<string, number> = null;
  /**
   * Associates VK_XXX (as a String) with code (as Integer). This is
   * done to avoid the overhead of the reflective call to find the
   * constant.
   */
  static vks: VKCollection = null;
  static APP_CONTEXT_CACHE_KEY: any = null;
  static APP_CONTEXT_KEYSTROKE_KEY: AWTKeyStroke = null;
  /**
   * The character value for a keyboard key.
   */
  keyChar: number = 0;
  /**
   * The key code for this {@code AWTKeyStroke}.
   */
  keyCode: number = 0;
  /**
   * The bitwise-ored combination of any modifiers.
   */
  modifiers: number = 0;
  /**
   * {@code true} if this {@code AWTKeyStroke} corresponds to a key release;
   * {@code false} otherwise.
   */
  onKeyRelease: boolean = false;
  $init_AWTKeyStroke() {
    this.keyChar = KeyEvent.CHAR_UNDEFINED;
    this.keyCode = KeyEvent.VK_UNDEFINED;
  }
  /**
   * Constructs an {@code AWTKeyStroke} with default values.
   * The default values used are:
   *
   * <table class="striped">
   * <caption>AWTKeyStroke default values</caption>
   * <thead>
   *   <tr>
   *     <th scope="col">Property
   *     <th scope="col">Default Value
   * </thead>
   * <tbody>
   *   <tr>
   *     <th scope="row">Key Char
   *     <td>{@code KeyEvent.CHAR_UNDEFINED}
   *   <tr>
   *     <th scope="row">Key Code
   *     <td>{@code KeyEvent.VK_UNDEFINED}
   *   <tr>
   *     <th scope="row">Modifiers
   *     <td>none
   *   <tr>
   *     <th scope="row">On key release?
   *     <td>{@code false}
   * </tbody>
   * </table>
   *
   * {@code AWTKeyStroke}s should not be constructed
   * by client code. Use a variant of {@code getAWTKeyStroke}
   * instead.
   *
   * @see #getAWTKeyStroke
   */
  _AWTKeyStroke$(): this {
    this.$init_AWTKeyStroke();
    return this;
  }
  static getCachedStroke(keyChar: number, keyCode: number, modifiers: number, onKeyRelease: boolean): AWTKeyStroke {
    let cache = AppContext.getAppContext().get(AWTKeyStroke.APP_CONTEXT_CACHE_KEY);
    let cacheKey = AppContext.getAppContext().get(AWTKeyStroke.APP_CONTEXT_KEYSTROKE_KEY);
    if (cache == null) {
      cache = new HashMap();
      AppContext.getAppContext().put(AWTKeyStroke.APP_CONTEXT_CACHE_KEY, cache);
    }
    if (cacheKey == null) {
      cacheKey = SwingAccessor.getKeyStrokeAccessor().create();
      AppContext.getAppContext().put(AWTKeyStroke.APP_CONTEXT_KEYSTROKE_KEY, cacheKey);
    }
    cacheKey.keyChar = keyChar;
    cacheKey.keyCode = keyCode;
    cacheKey.modifiers = AWTKeyStroke.mapNewModifiers(AWTKeyStroke.mapOldModifiers(modifiers));
    cacheKey.onKeyRelease = onKeyRelease;
    let stroke = cache.get(cacheKey);
    if (stroke == null) {
      stroke = cacheKey;
      cache.put(stroke, stroke);
      AppContext.getAppContext().remove(AWTKeyStroke.APP_CONTEXT_KEYSTROKE_KEY);
    }
    return stroke;
  }
  /**
   * Returns a shared instance of an {@code AWTKeyStroke}
   * that represents a {@code KEY_TYPED} event for the
   * specified character.
   *
   * @param keyChar the character value for a keyboard key
   * @return an {@code AWTKeyStroke} object for that key
   */
  static getAWTKeyStroke$char(keyChar: number): AWTKeyStroke {
    return AWTKeyStroke.getCachedStroke(keyChar, KeyEvent.VK_UNDEFINED, 0, false);
  }
  /**
   * Returns a shared instance of an {@code AWTKeyStroke},
   * given a numeric key code and a set of modifiers, specifying
   * whether the key is activated when it is pressed or released.
   * <p>
   * The "virtual key" constants defined in
   * {@code java.awt.event.KeyEvent} can be
   * used to specify the key code. For example:<ul>
   * <li>{@code java.awt.event.KeyEvent.VK_ENTER}
   * <li>{@code java.awt.event.KeyEvent.VK_TAB}
   * <li>{@code java.awt.event.KeyEvent.VK_SPACE}
   * </ul>
   * Alternatively, the key code may be obtained by calling
   * {@code java.awt.event.KeyEvent.getExtendedKeyCodeForChar}.
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
   * @param onKeyRelease {@code true} if the {@code AWTKeyStroke}
   *        should represent a key release; {@code false} otherwise
   * @return an AWTKeyStroke object for that key
   *
   * @see java.awt.event.KeyEvent
   * @see java.awt.event.InputEvent
   */
  static getAWTKeyStroke$int$int$boolean(keyCode: number, modifiers: number, onKeyRelease: boolean): AWTKeyStroke {
    return AWTKeyStroke.getCachedStroke(KeyEvent.CHAR_UNDEFINED, keyCode, modifiers, onKeyRelease);
  }
  /**
   * Returns a shared instance of an {@code AWTKeyStroke},
   * given a numeric key code and a set of modifiers. The returned
   * {@code AWTKeyStroke} will correspond to a key press.
   * <p>
   * The "virtual key" constants defined in
   * {@code java.awt.event.KeyEvent} can be
   * used to specify the key code. For example:<ul>
   * <li>{@code java.awt.event.KeyEvent.VK_ENTER}
   * <li>{@code java.awt.event.KeyEvent.VK_TAB}
   * <li>{@code java.awt.event.KeyEvent.VK_SPACE}
   * </ul>
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
   * @return an {@code AWTKeyStroke} object for that key
   *
   * @see java.awt.event.KeyEvent
   * @see java.awt.event.InputEvent
   */
  static getAWTKeyStroke$int$int(keyCode: number, modifiers: number): AWTKeyStroke {
    return AWTKeyStroke.getCachedStroke(KeyEvent.CHAR_UNDEFINED, keyCode, modifiers, false);
  }
  /**
   * Returns an {@code AWTKeyStroke} which represents the
   * stroke which generated a given {@code KeyEvent}.
   * <p>
   * This method obtains the keyChar from a {@code KeyTyped}
   * event, and the keyCode from a {@code KeyPressed} or
   * {@code KeyReleased} event. The {@code KeyEvent} modifiers are
   * obtained for all three types of {@code KeyEvent}.
   *
   * @param anEvent the {@code KeyEvent} from which to
   *      obtain the {@code AWTKeyStroke}
   * @throws NullPointerException if {@code anEvent} is null
   * @return the {@code AWTKeyStroke} that precipitated the event
   */
  static getAWTKeyStrokeForEvent(anEvent: KeyEvent): AWTKeyStroke {
    let id = anEvent.getID();
    switch (id) {
      case KeyEvent.KEY_PRESSED:
      case KeyEvent.KEY_RELEASED:
        return AWTKeyStroke.getCachedStroke(KeyEvent.CHAR_UNDEFINED, anEvent.getKeyCode(), anEvent.getModifiers(), (id === KeyEvent.KEY_RELEASED));
      case KeyEvent.KEY_TYPED:
        return AWTKeyStroke.getCachedStroke(anEvent.getKeyChar(), KeyEvent.VK_UNDEFINED, anEvent.getModifiers(), false);
      default:
        return null;
    }
  }
  /**
   * Parses a string and returns an {@code AWTKeyStroke}.
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
   *     "INSERT" =&gt; getAWTKeyStroke(KeyEvent.VK_INSERT, 0);
   *     "control DELETE" =&gt; getAWTKeyStroke(KeyEvent.VK_DELETE, InputEvent.CTRL_MASK);
   *     "alt shift X" =&gt; getAWTKeyStroke(KeyEvent.VK_X, InputEvent.ALT_MASK | InputEvent.SHIFT_MASK);
   *     "alt shift released X" =&gt; getAWTKeyStroke(KeyEvent.VK_X, InputEvent.ALT_MASK | InputEvent.SHIFT_MASK, true);
   *     "typed a" =&gt; getAWTKeyStroke('a');
   * </pre>
   *
   * @param s a String formatted as described above
   * @return an {@code AWTKeyStroke} object for that String
   * @throws IllegalArgumentException if {@code s} is {@code null},
   *        or is formatted incorrectly
   */
  static getAWTKeyStroke$String(s: string): AWTKeyStroke {
    if (s == null) {
      throw new IllegalArgumentException('String cannot be null');
    }
    let errmsg = 'String formatted incorrectly';
    let st = new StringTokenizer(s, ' ');
    let mask = 0;
    let released = false;
    let typed = false;
    let pressed = false;
    {
      if (AWTKeyStroke.modifierKeywords == null) {
        let uninitializedMap = new HashMap(8, 1);
        uninitializedMap.put('shift', InputEvent.SHIFT_DOWN_MASK | InputEvent.SHIFT_MASK);
        uninitializedMap.put('control', InputEvent.CTRL_DOWN_MASK | InputEvent.CTRL_MASK);
        uninitializedMap.put('ctrl', InputEvent.CTRL_DOWN_MASK | InputEvent.CTRL_MASK);
        uninitializedMap.put('meta', InputEvent.META_DOWN_MASK | InputEvent.META_MASK);
        uninitializedMap.put('alt', InputEvent.ALT_DOWN_MASK | InputEvent.ALT_MASK);
        uninitializedMap.put('altGraph', InputEvent.ALT_GRAPH_DOWN_MASK | InputEvent.ALT_GRAPH_MASK);
        uninitializedMap.put('button1', InputEvent.BUTTON1_DOWN_MASK);
        uninitializedMap.put('button2', InputEvent.BUTTON2_DOWN_MASK);
        uninitializedMap.put('button3', InputEvent.BUTTON3_DOWN_MASK);
        AWTKeyStroke.modifierKeywords = Collections.synchronizedMap(uninitializedMap);
      }
    }
    let count = st.countTokens();
    for (let i = 1; i <= count; i++) {
      let token = st.nextToken();
      if (typed) {
        if (token.length !== 1 || i !== count) {
          throw new IllegalArgumentException(errmsg);
        }
        return AWTKeyStroke.getCachedStroke(token.charCodeAt(0), KeyEvent.VK_UNDEFINED, mask, false);
      }
      if (pressed || released || i === count) {
        if (i !== count) {
          throw new IllegalArgumentException(errmsg);
        }
        let keyCodeName = 'VK_' + token;
        let keyCode = AWTKeyStroke.getVKValue(keyCodeName);
        return AWTKeyStroke.getCachedStroke(KeyEvent.CHAR_UNDEFINED, keyCode, mask, released);
      }
      if ($J.equals(token, 'released')) {
        released = true;
        continue;
      }
      if ($J.equals(token, 'pressed')) {
        pressed = true;
        continue;
      }
      if ($J.equals(token, 'typed')) {
        typed = true;
        continue;
      }
      let tokenMask = AWTKeyStroke.modifierKeywords.get(token);
      if (tokenMask != null) {
        mask |= (+tokenMask);
      } else {
        throw new IllegalArgumentException(errmsg);
      }
    }
    throw new IllegalArgumentException(errmsg);
  }
  static getVKCollection(): VKCollection {
    if (AWTKeyStroke.vks == null) {
      AWTKeyStroke.vks = new VKCollection()._VKCollection();
    }
    return AWTKeyStroke.vks;
  }
  /**
   * Returns the integer constant for the KeyEvent.VK field named
   * {@code key}. This will throw an
   * {@code IllegalArgumentException} if {@code key} is
   * not a valid constant.
   */
  static getVKValue(key: string): number {
    let vkCollect = AWTKeyStroke.getVKCollection();
    let value = vkCollect.findCode(key);
    if (value == null) {
      let keyCode = 0;
      let errmsg = 'String formatted incorrectly';
      try {
        keyCode = $J.cls(KeyEvent).getField(key).getInt($J.cls(KeyEvent));
      } catch ($e0) {
        if ($J.isa($e0, NoSuchFieldException) || $J.isa($e0, IllegalAccessException)) {
          let e = $J.exc($e0);
          throw new IllegalArgumentException(errmsg);
        } else {
          throw $e0;
        }
      }
      value = keyCode;
      vkCollect.put(key, value);
    }
    return (+value);
  }
  /**
   * Returns the character for this {@code AWTKeyStroke}.
   *
   * @return a char value
   * @see #getAWTKeyStroke(char)
   * @see KeyEvent#getKeyChar
   */
  getKeyChar(): number {
    return this.keyChar;
  }
  /**
   * Returns the numeric key code for this {@code AWTKeyStroke}.
   *
   * @return an int containing the key code value
   * @see #getAWTKeyStroke(int,int)
   * @see KeyEvent#getKeyCode
   */
  getKeyCode(): number {
    return this.keyCode;
  }
  /**
   * Returns the modifier keys for this {@code AWTKeyStroke}.
   *
   * @return an int containing the modifiers
   * @see #getAWTKeyStroke(int,int)
   */
  getModifiers(): number {
    return this.modifiers;
  }
  /**
   * Returns whether this {@code AWTKeyStroke} represents a key release.
   *
   * @return {@code true} if this {@code AWTKeyStroke}
   *          represents a key release; {@code false} otherwise
   * @see #getAWTKeyStroke(int,int,boolean)
   */
  isOnKeyRelease(): boolean {
    return this.onKeyRelease;
  }
  /**
   * Returns a numeric value for this object that is likely to be unique,
   * making it a good choice as the index value in a hash table.
   *
   * @return an int that represents this object
   */
  hashCode(): number {
    return (Math.imul(Math.imul((((this.keyChar) + 1) | 0), (Math.imul(2, ((this.keyCode + 1) | 0)))), ((this.modifiers + 1) | 0)) + (this.onKeyRelease ? 1 : 2)) | 0;
  }
  /**
   * Returns true if this object is identical to the specified object.
   *
   * @param anObject the Object to compare this object to
   * @return true if the objects are identical
   */
  equals(anObject: any): boolean {
    if (anObject instanceof AWTKeyStroke) {
      let ks = anObject;
      return (ks.keyChar === this.keyChar && ks.keyCode === this.keyCode && ks.onKeyRelease === this.onKeyRelease && ks.modifiers === this.modifiers);
    }
    return false;
  }
  /**
   * Returns a string that displays and identifies this object's properties.
   * The {@code String} returned by this method can be passed
   * as a parameter to {@code getAWTKeyStroke(String)} to produce
   * a key stroke equal to this key stroke.
   *
   * @return a String representation of this object
   * @see #getAWTKeyStroke(String)
   */
  toString(): string {
    if (this.keyCode === KeyEvent.VK_UNDEFINED) {
      return AWTKeyStroke.getModifiersText(this.modifiers) + 'typed ' + String.fromCharCode(this.keyChar);
    } else {
      return AWTKeyStroke.getModifiersText(this.modifiers) + (this.onKeyRelease ? 'released' : 'pressed') + ' ' + AWTKeyStroke.getVKText(this.keyCode);
    }
  }
  static getModifiersText(modifiers: number): string {
    let buf = new StringBuilder();
    if ((modifiers & InputEvent.SHIFT_DOWN_MASK) !== 0) {
      buf.append('shift ');
    }
    if ((modifiers & InputEvent.CTRL_DOWN_MASK) !== 0) {
      buf.append('ctrl ');
    }
    if ((modifiers & InputEvent.META_DOWN_MASK) !== 0) {
      buf.append('meta ');
    }
    if ((modifiers & InputEvent.ALT_DOWN_MASK) !== 0) {
      buf.append('alt ');
    }
    if ((modifiers & InputEvent.ALT_GRAPH_DOWN_MASK) !== 0) {
      buf.append('altGraph ');
    }
    if ((modifiers & InputEvent.BUTTON1_DOWN_MASK) !== 0) {
      buf.append('button1 ');
    }
    if ((modifiers & InputEvent.BUTTON2_DOWN_MASK) !== 0) {
      buf.append('button2 ');
    }
    if ((modifiers & InputEvent.BUTTON3_DOWN_MASK) !== 0) {
      buf.append('button3 ');
    }
    return buf.toString();
  }
  static getVKText(keyCode: number): string {
    let vkCollect = AWTKeyStroke.getVKCollection();
    let key = keyCode;
    let name = vkCollect.findName(key);
    if (name != null) {
      return name.substring(3);
    }
    let expected_modifiers = (1 | 8 | 16);
    let fields = $J.cls(KeyEvent).getDeclaredFields();
    for (let i = 0; i < fields.length; i++) {
      try {
        if (fields[i].getModifiers() === expected_modifiers && fields[i].getType() === $J.cls('int') && fields[i].getName().startsWith('VK_') && fields[i].getInt($J.cls(KeyEvent)) === keyCode) {
          name = fields[i].getName();
          vkCollect.put(name, key);
          return name.substring(3);
        }
      } catch ($e1) {
        if ($J.isa($e1, IllegalAccessException)) {
          let e = $J.exc($e1);
          // assert (false)
        } else {
          throw $e1;
        }
      }
    }
    return 'UNKNOWN';
  }
  static mapOldModifiers(modifiers: number): number {
    if ((modifiers & InputEvent.SHIFT_MASK) !== 0) {
      modifiers |= InputEvent.SHIFT_DOWN_MASK;
    }
    if ((modifiers & InputEvent.ALT_MASK) !== 0) {
      modifiers |= InputEvent.ALT_DOWN_MASK;
    }
    if ((modifiers & InputEvent.ALT_GRAPH_MASK) !== 0) {
      modifiers |= InputEvent.ALT_GRAPH_DOWN_MASK;
    }
    if ((modifiers & InputEvent.CTRL_MASK) !== 0) {
      modifiers |= InputEvent.CTRL_DOWN_MASK;
    }
    if ((modifiers & InputEvent.META_MASK) !== 0) {
      modifiers |= InputEvent.META_DOWN_MASK;
    }
    modifiers &= InputEvent.SHIFT_DOWN_MASK | InputEvent.ALT_DOWN_MASK | InputEvent.ALT_GRAPH_DOWN_MASK | InputEvent.CTRL_DOWN_MASK | InputEvent.META_DOWN_MASK | InputEvent.BUTTON1_DOWN_MASK | InputEvent.BUTTON2_DOWN_MASK | InputEvent.BUTTON3_DOWN_MASK;
    return modifiers;
  }
  static mapNewModifiers(modifiers: number): number {
    if ((modifiers & InputEvent.SHIFT_DOWN_MASK) !== 0) {
      modifiers |= InputEvent.SHIFT_MASK;
    }
    if ((modifiers & InputEvent.ALT_DOWN_MASK) !== 0) {
      modifiers |= InputEvent.ALT_MASK;
    }
    if ((modifiers & InputEvent.ALT_GRAPH_DOWN_MASK) !== 0) {
      modifiers |= InputEvent.ALT_GRAPH_MASK;
    }
    if ((modifiers & InputEvent.CTRL_DOWN_MASK) !== 0) {
      modifiers |= InputEvent.CTRL_MASK;
    }
    if ((modifiers & InputEvent.META_DOWN_MASK) !== 0) {
      modifiers |= InputEvent.META_MASK;
    }
    return modifiers;
  }
  static $clinit() {
    AWTKeyStroke.APP_CONTEXT_CACHE_KEY = new JObject();
    AWTKeyStroke.APP_CONTEXT_KEYSTROKE_KEY = new AWTKeyStroke()._AWTKeyStroke$();
    Toolkit.loadLibraries();
  }
}

$J.define(AWTKeyStroke, 'java.awt.AWTKeyStroke', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'char,int,int,boolean': '_AWTKeyStroke$char$int$int$boolean', '': '_AWTKeyStroke$' }, meths: { 'getAWTKeyStroke(java.lang.String)': 'getAWTKeyStroke$String', 'getAWTKeyStroke(int,int)': 'getAWTKeyStroke$int$int', 'getAWTKeyStroke(int,int,boolean)': 'getAWTKeyStroke$int$int$boolean', 'getAWTKeyStroke(java.lang.Character,int)': 'getAWTKeyStroke$Character$int', 'getAWTKeyStroke(char)': 'getAWTKeyStroke$char' }, clinit: true, lazy: ['modifierKeywords', 'vks', 'APP_CONTEXT_CACHE_KEY', 'APP_CONTEXT_KEYSTROKE_KEY'] });
$J.module(() => {
  VKCollection = $J.load('java.awt.VKCollection');
  InputEvent = $J.load('java.awt.event.InputEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
});
