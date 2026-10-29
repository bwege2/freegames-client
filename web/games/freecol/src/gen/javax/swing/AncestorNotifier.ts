// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/AncestorNotifier.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2012, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

let Window, JComponent, AncestorEvent, AncestorListener, EventListenerList;

/**
 * @author Dave Moore
 */
export class AncestorNotifier extends JObject {
  firstInvisibleAncestor: Component = null;
  listenerList: EventListenerList = null;
  root: JComponent = null;
  _AncestorNotifier(root: JComponent): this {
    this.listenerList = new EventListenerList()._EventListenerList();
    this.root = root;
    this.addListeners(root, true);
    return this;
  }
  addAncestorListener(l: AncestorListener): void {
    this.listenerList.add($J.cls(AncestorListener), l);
  }
  getAncestorListeners(): AncestorListener[] {
    return this.listenerList.getListeners($J.cls(AncestorListener));
  }
  /**
   * Notify all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   * @see EventListenerList
   */
  fireAncestorAdded(source: JComponent, id: number, ancestor: Container, ancestorParent: Container): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(AncestorListener)) {
        let ancestorEvent = new AncestorEvent()._AncestorEvent(source, id, ancestor, ancestorParent);
        (listeners[(i + 1) | 0]).ancestorAdded(ancestorEvent);
      }
    }
  }
  /**
   * Notify all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   * @see EventListenerList
   */
  fireAncestorRemoved(source: JComponent, id: number, ancestor: Container, ancestorParent: Container): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(AncestorListener)) {
        let ancestorEvent = new AncestorEvent()._AncestorEvent(source, id, ancestor, ancestorParent);
        (listeners[(i + 1) | 0]).ancestorRemoved(ancestorEvent);
      }
    }
  }
  /**
   * Notify all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   * @see EventListenerList
   */
  fireAncestorMoved(source: JComponent, id: number, ancestor: Container, ancestorParent: Container): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(AncestorListener)) {
        let ancestorEvent = new AncestorEvent()._AncestorEvent(source, id, ancestor, ancestorParent);
        (listeners[(i + 1) | 0]).ancestorMoved(ancestorEvent);
      }
    }
  }
  addListeners(ancestor: Component, addToFirst: boolean): void {
    let a: Component;
    this.firstInvisibleAncestor = null;
    for (a = ancestor; this.firstInvisibleAncestor == null; a = a.getParent()) {
      if (addToFirst || a !== ancestor) {
        a.addComponentListener(this);
        if (a instanceof JComponent) {
          let jAncestor = a;
          jAncestor.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
        }
      }
      if (!a.isVisible$() || a.getParent() == null || a instanceof Window) {
        this.firstInvisibleAncestor = a;
      }
    }
    if (this.firstInvisibleAncestor instanceof Window && this.firstInvisibleAncestor.isVisible$()) {
      this.firstInvisibleAncestor = null;
    }
  }
  removeListeners(ancestor: Component): void {
    let a: Component;
    for (a = ancestor; a != null; a = a.getParent()) {
      a.removeComponentListener(this);
      if (a instanceof JComponent) {
        let jAncestor = a;
        jAncestor.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      }
      if (a === this.firstInvisibleAncestor || a instanceof Window) {
        break;
      }
    }
  }
  componentResized(e: ComponentEvent): void {
  }
  componentMoved(e: ComponentEvent): void {
    let source = e.getComponent();
    this.fireAncestorMoved(this.root, AncestorEvent.ANCESTOR_MOVED, source, source.getParent());
  }
  componentShown(e: ComponentEvent): void {
    let ancestor = e.getComponent();
    if (ancestor === this.firstInvisibleAncestor) {
      this.addListeners(ancestor, false);
      if (this.firstInvisibleAncestor == null) {
        this.fireAncestorAdded(this.root, AncestorEvent.ANCESTOR_ADDED, ancestor, ancestor.getParent());
      }
    }
  }
  componentHidden(e: ComponentEvent): void {
    let ancestor = e.getComponent();
    let needsNotify = this.firstInvisibleAncestor == null;
    if (!(ancestor instanceof Window)) {
      this.removeListeners(ancestor.getParent());
    }
    this.firstInvisibleAncestor = ancestor;
    if (needsNotify) {
      this.fireAncestorRemoved(this.root, AncestorEvent.ANCESTOR_REMOVED, ancestor, ancestor.getParent());
    }
  }
  propertyChange(evt: PropertyChangeEvent): void {
    let s = evt.getPropertyName();
    if (s != null && ($J.equals(s, 'parent') || $J.equals(s, 'ancestor'))) {
      let component = evt.getSource();
      if (evt.getNewValue() != null) {
        if (component === this.firstInvisibleAncestor) {
          this.addListeners(component, false);
          if (this.firstInvisibleAncestor == null) {
            this.fireAncestorAdded(this.root, AncestorEvent.ANCESTOR_ADDED, component, component.getParent());
          }
        }
      } else {
        let needsNotify = this.firstInvisibleAncestor == null;
        let oldParent = evt.getOldValue();
        this.removeListeners(oldParent);
        this.firstInvisibleAncestor = component;
        if (needsNotify) {
          this.fireAncestorRemoved(this.root, AncestorEvent.ANCESTOR_REMOVED, component, oldParent);
        }
      }
    }
  }
}

$J.define(AncestorNotifier, 'javax.swing.AncestorNotifier', { kind: 'class', ifaces: ['java.awt.event.ComponentListener', 'java.beans.PropertyChangeListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'javax.swing.JComponent': '_AncestorNotifier' } });
$J.module(() => {
  Window = $J.load('java.awt.Window');
  JComponent = $J.load('javax.swing.JComponent');
  AncestorEvent = $J.load('javax.swing.event.AncestorEvent');
  AncestorListener = $J.load('javax.swing.event.AncestorListener');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
});
