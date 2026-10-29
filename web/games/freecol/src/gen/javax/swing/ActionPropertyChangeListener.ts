// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/ActionPropertyChangeListener.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, ReferenceQueue, WeakReference } from '../../../jre/index.ts';

/**
 * A package-private PropertyChangeListener which listens for
 * property changes on an Action and updates the properties
 * of an ActionEvent source.
 * <p>
 * Subclasses must override the actionPropertyChanged method,
 * which is invoked from the propertyChange method as long as
 * the target is still valid.
 * </p>
 * <p>
 * WARNING WARNING WARNING WARNING WARNING WARNING:<br>
 * Do NOT create an anonymous inner class that extends this!  If you do,
 * a strong reference will be held to the containing class, which in most
 * cases defeats the purpose of this class.
 *
 * @param <T> the type of JComponent the underlying Action is attached to
 *
 * @author Georges Saab
 * @see AbstractButton
 */
export class ActionPropertyChangeListener<T> extends JObject {
  static queue: ReferenceQueue<JComponent> = null;
  target: ActionPropertyChangeListener$OwnedWeakReference<T> = null;
  action_: Action = null;
  _ActionPropertyChangeListener(c: T, a: Action): this {
    this.setTarget(c);
    this.action_ = a;
    return this;
  }
  static getQueue(): ReferenceQueue<JComponent> {
    {
      if (ActionPropertyChangeListener.queue == null) {
        ActionPropertyChangeListener.queue = new ReferenceQueue();
      }
    }
    return ActionPropertyChangeListener.queue;
  }
  /**
   * PropertyChangeListener method.  If the target has been gc'ed this
   * will remove the <code>PropertyChangeListener</code> from the Action,
   * otherwise this will invoke actionPropertyChanged.
   */
  propertyChange(e: PropertyChangeEvent): void {
    let target = this.getTarget();
    if (target == null) {
      this.getAction().removePropertyChangeListener($J.fn(this, 'propertyChange'));
    } else {
      this.actionPropertyChanged(target, this.getAction(), e);
    }
  }
  setTarget(c: T): void {
    let queue = ActionPropertyChangeListener.getQueue();
    let r: ActionPropertyChangeListener$OwnedWeakReference<any>;
    while ((r = queue.poll()) != null) {
      let oldPCL = r.getOwner();
      let oldAction = oldPCL.getAction();
      if (oldAction != null) {
        oldAction.removePropertyChangeListener($J.fn(oldPCL, 'propertyChange'));
      }
    }
    this.target = new ActionPropertyChangeListener$OwnedWeakReference()._ActionPropertyChangeListener$OwnedWeakReference(c, queue, this);
  }
  getTarget(): T {
    if (this.target == null) {
      return null;
    }
    return this.target.get();
  }
  getAction(): Action {
    return this.action_;
  }
}

export class ActionPropertyChangeListener$OwnedWeakReference<U> extends WeakReference {
  owner: ActionPropertyChangeListener<any> = null;
  _ActionPropertyChangeListener$OwnedWeakReference(target: U, queue: ReferenceQueue<any>, owner: ActionPropertyChangeListener<any>): this {
    this._WeakReference(target, queue);
    this.owner = owner;
    return this;
  }
  getOwner(): ActionPropertyChangeListener<any> {
    return this.owner;
  }
}

$J.define(ActionPropertyChangeListener, 'javax.swing.ActionPropertyChangeListener', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'javax.swing.JComponent,javax.swing.Action': '_ActionPropertyChangeListener' } });
$J.define(ActionPropertyChangeListener$OwnedWeakReference, 'javax.swing.ActionPropertyChangeListener$OwnedWeakReference', { kind: 'class', sup: 'java.lang.ref.WeakReference', ctors: { 'javax.swing.JComponent,java.lang.ref.ReferenceQueue,javax.swing.ActionPropertyChangeListener': '_ActionPropertyChangeListener$OwnedWeakReference' } });
