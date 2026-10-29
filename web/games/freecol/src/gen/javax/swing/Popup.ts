// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/Popup.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, SecurityException } from '../../../jre/index.ts';
import { JWindow } from './JWindow.ts';
import { Frame } from '../../java/awt/Frame.ts';

let BorderLayout, GraphicsEnvironment, Window, Window$Type, SwingUtilities;

/**
 * Popups are used to display a <code>Component</code> to the user, typically
 * on top of all the other <code>Component</code>s in a particular containment
 * hierarchy. <code>Popup</code>s have a very small life cycle. Once you
 * have obtained a <code>Popup</code>, and hidden it (invoked the
 * <code>hide</code> method), you should no longer
 * invoke any methods on it. This allows the <code>PopupFactory</code> to cache
 * <code>Popup</code>s for later use.
 * <p>
 * The general contract is that if you need to change the size of the
 * <code>Component</code>, or location of the <code>Popup</code>, you should
 * obtain a new <code>Popup</code>.
 * <p>
 * <code>Popup</code> does not descend from <code>Component</code>, rather
 * implementations of <code>Popup</code> are responsible for creating
 * and maintaining their own <code>Component</code>s to render the
 * requested <code>Component</code> to the user.
 * <p>
 * You typically do not explicitly create an instance of <code>Popup</code>,
 * instead obtain one from a <code>PopupFactory</code>.
 *
 * @see PopupFactory
 *
 * @since 1.4
 */
export class Popup extends JObject {
  /**
   * The Component representing the Popup.
   */
  component: Component = null;
  /**
   * Creates a <code>Popup</code>. This is provided for subclasses.
   */
  _Popup$(): this {
    return this;
  }
  /**
   * Makes the <code>Popup</code> visible. If the <code>Popup</code> is
   * currently visible, this has no effect.
   */
  show(): void {
    let component = this.getComponent();
    if (component != null) {
      component.show$();
    }
  }
  /**
   * Hides and disposes of the <code>Popup</code>. Once a <code>Popup</code>
   * has been disposed you should no longer invoke methods on it. A
   * <code>dispose</code>d <code>Popup</code> may be reclaimed and later used
   * based on the <code>PopupFactory</code>. As such, if you invoke methods
   * on a <code>disposed</code> <code>Popup</code>, indeterminate
   * behavior will result.
   */
  hide(): void {
    let component = this.getComponent();
    if (component instanceof JWindow) {
      component.hide();
      (component).getContentPane().removeAll();
    }
    this.dispose();
  }
  /**
   * Frees any resources the <code>Popup</code> may be holding onto.
   */
  dispose(): void {
    let component = this.getComponent();
    let window = SwingUtilities.getWindowAncestor(component);
    if (component instanceof JWindow) {
      (component).dispose();
      component = null;
    }
    if (window instanceof Popup$DefaultFrame) {
      window.dispose();
    }
  }
  /**
   * Resets the <code>Popup</code> to an initial state.
   */
  reset(owner: Component, contents: Component, ownerX: number, ownerY: number): void {
    if (this.getComponent() == null) {
      this.component = this.createComponent(owner);
    }
    let c = this.getComponent();
    if (c instanceof JWindow) {
      let component = this.getComponent();
      component.setBounds$int$int$int$int(ownerX, ownerY, 1, 1);
      component.getContentPane().add$Component$Object(contents, BorderLayout.CENTER);
      component.invalidate();
      component.validate();
      if (component.isVisible$()) {
        this.pack();
      }
    }
  }
  /**
   * Causes the <code>Popup</code> to be sized to fit the preferred size
   * of the <code>Component</code> it contains.
   */
  pack(): void {
    let component = this.getComponent();
    if (component instanceof Window) {
      (component).pack();
    }
  }
  /**
   * Returns the <code>Window</code> to use as the parent of the
   * <code>Window</code> created for the <code>Popup</code>. This creates
   * a new <code>DefaultFrame</code>, if necessary.
   */
  getParentWindow(owner: Component): Window {
    let window = null;
    if (owner instanceof Window) {
      window = owner;
    } else if (owner != null) {
      window = SwingUtilities.getWindowAncestor(owner);
    }
    if (window == null) {
      window = new Popup$DefaultFrame()._Popup$DefaultFrame();
    }
    return window;
  }
  /**
   * Creates the Component to use as the parent of the <code>Popup</code>.
   * The default implementation creates a <code>Window</code>, subclasses
   * should override.
   */
  createComponent(owner: Component): Component {
    if (GraphicsEnvironment.isHeadless()) {
      return null;
    }
    return new Popup$HeavyWeightWindow()._Popup$HeavyWeightWindow(this.getParentWindow(owner));
  }
  /**
   * Returns the <code>Component</code> returned from
   * <code>createComponent</code> that will hold the <code>Popup</code>.
   */
  getComponent(): Component {
    return this.component;
  }
}

/**
 * Component used to house window.
 */
export class Popup$HeavyWeightWindow extends JWindow {
  _Popup$HeavyWeightWindow(parent: Window): this {
    this._JWindow$Window(parent);
    this.setFocusableWindowState(false);
    this.setType(Window$Type.POPUP);
    this.getRootPane().setUseTrueDoubleBuffering(false);
    try {
      this.setAlwaysOnTop(true);
    } catch ($e0) {
      if ($J.isa($e0, SecurityException)) {
        let se = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
    return this;
  }
  show$(): void {
    this.pack();
    if (this.getWidth() > 0 && this.getHeight() > 0) {
      super.show$();
    }
  }
}

/**
 * Used if no valid Window ancestor of the supplied owner is found.
 * <p>
 * PopupFactory uses this as a way to know when the Popup shouldn't
 * be cached based on the Window.
 */
export class Popup$DefaultFrame extends Frame {
  _Popup$DefaultFrame(): this {
    this._Frame$();
    return this;
  }
}

$J.define(Popup, 'javax.swing.Popup', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Popup$', 'java.awt.Component,java.awt.Component,int,int': '_Popup$Component$Component$int$int' } });
$J.define(Popup$HeavyWeightWindow, 'javax.swing.Popup$HeavyWeightWindow', { kind: 'class', ifaces: ['sun.awt.ModalExclude'], sup: 'javax.swing.JWindow', ctors: { 'java.awt.Window': '_Popup$HeavyWeightWindow' }, meths: { 'show()': 'show$', 'update(java.awt.Graphics)': 'update$Graphics' } });
$J.define(Popup$DefaultFrame, 'javax.swing.Popup$DefaultFrame', { kind: 'class', sup: 'java.awt.Frame', ctors: { '': '_Popup$DefaultFrame' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Window = $J.load('java.awt.Window');
  Window$Type = $J.load('java.awt.Window$Type');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
});
