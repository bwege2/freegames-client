// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/KeyboardManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Applet, Hashtable, JObject, Thread, Vector } from '../../../jre/index.ts';

let Window, KeyEvent, JComponent, JInternalFrame, JMenuBar, KeyStroke, EmbeddedFrame;

/**
 * The KeyboardManager class is used to help dispatch keyboard actions for the
 * WHEN_IN_FOCUSED_WINDOW style actions.  Actions with other conditions are handled
 * directly in JComponent.
 *
 * Here's a description of the semantics of how keyboard dispatching should work
 * at least as I understand it.
 *
 * KeyEvents are dispatched to the focused component.  The focus manager gets first
 * crack at processing this event.  If the focus manager doesn't want it, then
 * the JComponent calls super.processKeyEvent() this allows listeners a chance
 * to process the event.
 *
 * If none of the listeners "consumes" the event then the keybindings get a shot.
 * This is where things start to get interesting.  First, KeyStrokes defined with the
 * WHEN_FOCUSED condition get a chance.  If none of these want the event, then the component
 * walks though it's parents looked for actions of type WHEN_ANCESTOR_OF_FOCUSED_COMPONENT.
 *
 * If no one has taken it yet, then it winds up here.  We then look for components registered
 * for WHEN_IN_FOCUSED_WINDOW events and fire to them.  Note that if none of those are found
 * then we pass the event to the menubars and let them have a crack at it.  They're handled differently.
 *
 * Lastly, we check if we're looking at an internal frame.  If we are and no one wanted the event
 * then we move up to the InternalFrame's creator and see if anyone wants the event (and so on and so on).
 *
 *
 * @see InputMap
 */
export class KeyboardManager extends JObject {
  static currentManager: KeyboardManager = null;
  /**
   * maps top-level containers to a sub-hashtable full of keystrokes
   */
  containerMap: Hashtable<Container, Hashtable<any, any>> = null;
  /**
   * Maps component/keystroke pairs to a topLevel container
   * This is mainly used for fast unregister operations
   */
  componentKeyStrokeMap: Hashtable<KeyboardManager$ComponentKeyStrokePair, Container> = null;
  _KeyboardManager(): this {
    this.containerMap = new Hashtable();
    this.componentKeyStrokeMap = new Hashtable();
    return this;
  }
  static getCurrentManager(): KeyboardManager {
    return KeyboardManager.currentManager;
  }
  /**
   * register keystrokes here which are for the WHEN_IN_FOCUSED_WINDOW
   * case.
   * Other types of keystrokes will be handled by walking the hierarchy
   * That simplifies some potentially hairy stuff.
   */
  registerKeyStroke(k: KeyStroke, c: JComponent): void {
    let topContainer = KeyboardManager.getTopAncestor(c);
    if (topContainer == null) {
      return;
    }
    let keyMap = this.containerMap.get(topContainer);
    if (keyMap == null) {
      keyMap = this.registerNewTopContainer(topContainer);
    }
    let tmp = keyMap.get(k);
    if (tmp == null) {
      keyMap.put(k, c);
    } else if ($J.isa(tmp, Vector)) {
      let v = tmp;
      if (!v.contains(c)) {
        v.addElement(c);
      }
    } else if (tmp instanceof JComponent) {
      if (tmp !== c) {
        let v = new Vector();
        v.addElement(tmp);
        v.addElement(c);
        keyMap.put(k, v);
      }
    } else {
      $J.out.println('Unexpected condition in registerKeyStroke');
      Thread.dumpStack();
    }
    this.componentKeyStrokeMap.put(new KeyboardManager$ComponentKeyStrokePair()._KeyboardManager$ComponentKeyStrokePair(c, k), topContainer);
    if (topContainer instanceof EmbeddedFrame) {
      (topContainer).registerAccelerator(k);
    }
  }
  /**
   * Find the top focusable Window, Applet, or InternalFrame
   */
  static getTopAncestor(c: JComponent): Container {
    for (let p = c.getParent(); p != null; p = p.getParent()) {
      if (p instanceof Window && (p).isFocusableWindow() || $J.isa(p, Applet) || p instanceof JInternalFrame) {
        return p;
      }
    }
    return null;
  }
  unregisterKeyStroke(ks: KeyStroke, c: JComponent): void {
    let ckp = new KeyboardManager$ComponentKeyStrokePair()._KeyboardManager$ComponentKeyStrokePair(c, ks);
    let topContainer = this.componentKeyStrokeMap.get(ckp);
    if (topContainer == null) {
      return;
    }
    let keyMap = this.containerMap.get(topContainer);
    if (keyMap == null) {
      Thread.dumpStack();
      return;
    }
    let tmp = keyMap.get(ks);
    if (tmp == null) {
      Thread.dumpStack();
      return;
    }
    if (tmp instanceof JComponent && tmp === c) {
      keyMap.remove(ks);
    } else if ($J.isa(tmp, Vector)) {
      let v = tmp;
      v.removeElement(c);
      if (v.isEmpty()) {
        keyMap.remove(ks);
      }
    }
    if (keyMap.isEmpty()) {
      this.containerMap.remove(topContainer);
    }
    this.componentKeyStrokeMap.remove(ckp);
    if (topContainer instanceof EmbeddedFrame) {
      (topContainer).unregisterAccelerator(ks);
    }
  }
  /**
   * This method is called when the focused component (and none of
   * its ancestors) want the key event.  This will look up the keystroke
   * to see if any children (or subchildren) of the specified container
   * want a crack at the event.
   * If one of them wants it, then it will "DO-THE-RIGHT-THING"
   */
  fireKeyboardAction(e: KeyEvent, pressed: boolean, topAncestor: Container): boolean {
    if (e.isConsumed()) {
      $J.out.println('Acquired pre-used event!');
      Thread.dumpStack();
    }
    let ks: KeyStroke;
    let ksE = null;
    if (e.getID() === KeyEvent.KEY_TYPED) {
      ks = KeyStroke.getKeyStroke$char(e.getKeyChar());
    } else {
      if (e.getKeyCode() !== e.getExtendedKeyCode()) {
        ksE = KeyStroke.getKeyStroke$int$int$boolean(e.getExtendedKeyCode(), e.getModifiers(), !pressed);
      }
      ks = KeyStroke.getKeyStroke$int$int$boolean(e.getKeyCode(), e.getModifiers(), !pressed);
    }
    let keyMap = this.containerMap.get(topAncestor);
    if (keyMap != null) {
      let tmp = null;
      if (ksE != null) {
        tmp = keyMap.get(ksE);
        if (tmp != null) {
          ks = ksE;
        }
      }
      if (tmp == null) {
        tmp = keyMap.get(ks);
      }
      if (tmp == null) {
      } else if (tmp instanceof JComponent) {
        let c = tmp;
        if (c.isShowing() && c.isEnabled()) {
          this.fireBinding(c, ks, e, pressed);
        }
      } else if ($J.isa(tmp, Vector)) {
        let v = tmp;
        for (let counter = (v.size() - 1) | 0; counter >= 0; counter--) {
          let c = v.elementAt(counter);
          if (c.isShowing() && c.isEnabled()) {
            this.fireBinding(c, ks, e, pressed);
            if (e.isConsumed()) {
              return true;
            }
          }
        }
      } else {
        $J.out.println('Unexpected condition in fireKeyboardAction ' + $J.str(tmp));
        Thread.dumpStack();
      }
    }
    if (e.isConsumed()) {
      return true;
    }
    if (keyMap != null) {
      let v = keyMap.get($J.cls(JMenuBar));
      if (v != null) {
        let iter = v.elements();
        while (iter.hasMoreElements()) {
          let mb = iter.nextElement();
          if (mb.isShowing() && mb.isEnabled()) {
            let extended = (ksE != null) && !ksE.equals(ks);
            if (extended) {
              this.fireBinding(mb, ksE, e, pressed);
            }
            if (!extended || !e.isConsumed()) {
              this.fireBinding(mb, ks, e, pressed);
            }
            if (e.isConsumed()) {
              return true;
            }
          }
        }
      }
    }
    return e.isConsumed();
  }
  fireBinding(c: JComponent, ks: KeyStroke, e: KeyEvent, pressed: boolean): void {
    if (c.processKeyBinding(ks, e, JComponent.WHEN_IN_FOCUSED_WINDOW, pressed)) {
      e.consume();
    }
  }
  registerMenuBar(mb: JMenuBar): void {
    let top = KeyboardManager.getTopAncestor(mb);
    if (top == null) {
      return;
    }
    let keyMap = this.containerMap.get(top);
    if (keyMap == null) {
      keyMap = this.registerNewTopContainer(top);
    }
    let menuBars = keyMap.get($J.cls(JMenuBar));
    if (menuBars == null) {
      menuBars = new Vector();
      keyMap.put($J.cls(JMenuBar), menuBars);
    }
    if (!menuBars.contains(mb)) {
      menuBars.addElement(mb);
    }
  }
  unregisterMenuBar(mb: JMenuBar): void {
    let topContainer = KeyboardManager.getTopAncestor(mb);
    if (topContainer == null) {
      return;
    }
    let keyMap = this.containerMap.get(topContainer);
    if (keyMap != null) {
      let v = keyMap.get($J.cls(JMenuBar));
      if (v != null) {
        v.removeElement(mb);
        if (v.isEmpty()) {
          keyMap.remove($J.cls(JMenuBar));
          if (keyMap.isEmpty()) {
            this.containerMap.remove(topContainer);
          }
        }
      }
    }
  }
  registerNewTopContainer(topContainer: Container): Hashtable<any, any> {
    let keyMap = new Hashtable();
    this.containerMap.put(topContainer, keyMap);
    return keyMap;
  }
  static $clinit() {
    KeyboardManager.currentManager = new KeyboardManager()._KeyboardManager();
  }
}

/**
 * This class is used to create keys for a hashtable
 * which looks up topContainers based on component, keystroke pairs
 * This is used to make unregistering KeyStrokes fast
 */
export class KeyboardManager$ComponentKeyStrokePair extends JObject {
  component: any = null;
  keyStroke: any = null;
  _KeyboardManager$ComponentKeyStrokePair(comp: any, key: any): this {
    this.component = comp;
    this.keyStroke = key;
    return this;
  }
  equals(o: any): boolean {
    if (!(o instanceof KeyboardManager$ComponentKeyStrokePair)) {
      return false;
    }
    let ckp = o;
    return (($J.equals(this.component, ckp.component)) && ($J.equals(this.keyStroke, ckp.keyStroke)));
  }
  hashCode(): number {
    return Math.imul($J.hashCode(this.component), $J.hashCode(this.keyStroke));
  }
}

$J.define(KeyboardManager, 'javax.swing.KeyboardManager', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_KeyboardManager' }, clinit: true, lazy: ['currentManager'] });
$J.define(KeyboardManager$ComponentKeyStrokePair, 'javax.swing.KeyboardManager$ComponentKeyStrokePair', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.Object,java.lang.Object': '_KeyboardManager$ComponentKeyStrokePair' } });
$J.module(() => {
  Window = $J.load('java.awt.Window');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  JComponent = $J.load('javax.swing.JComponent');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  JMenuBar = $J.load('javax.swing.JMenuBar');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  EmbeddedFrame = $J.load('sun.awt.EmbeddedFrame');
});
