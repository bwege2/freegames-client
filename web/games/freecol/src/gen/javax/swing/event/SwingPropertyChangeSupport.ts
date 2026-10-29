// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/event/SwingPropertyChangeSupport.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, NullPointerException } from '../../../../jre/index.ts';
import { PropertyChangeSupport } from '../../../java/beans/PropertyChangeSupport.ts';

let SwingUtilities;

/**
 * This subclass of {@code java.beans.PropertyChangeSupport} is almost
 * identical in functionality. The only difference is if constructed with
 * {@code SwingPropertyChangeSupport(sourceBean, true)} it ensures
 * listeners are only ever notified on the <i>Event Dispatch Thread</i>.
 *
 * @author Igor Kushnirskiy
 */
export class SwingPropertyChangeSupport extends PropertyChangeSupport {
  /**
   * whether to notify listeners on EDT
   *
   * @serial
   * @since 1.6
   */
  notifyOnEDT: boolean = false;
  /**
   * Constructs a SwingPropertyChangeSupport object.
   *
   * @param sourceBean  The bean to be given as the source for any
   *        events.
   * @throws NullPointerException if {@code sourceBean} is
   *         {@code null}
   */
  _SwingPropertyChangeSupport$Object(sourceBean: any): this {
    this._SwingPropertyChangeSupport$Object$boolean(sourceBean, false);
    return this;
  }
  /**
   * Constructs a SwingPropertyChangeSupport object.
   *
   * @param sourceBean the bean to be given as the source for any events
   * @param notifyOnEDT whether to notify listeners on the <i>Event
   *        Dispatch Thread</i> only
   *
   * @throws NullPointerException if {@code sourceBean} is
   *         {@code null}
   * @since 1.6
   */
  _SwingPropertyChangeSupport$Object$boolean(sourceBean: any, notifyOnEDT: boolean): this {
    this._PropertyChangeSupport(sourceBean);
    this.notifyOnEDT = notifyOnEDT;
    return this;
  }
  /**
   * {@inheritDoc}
   *
   * <p>
   * If {@link #isNotifyOnEDT} is {@code true} and called off the
   * <i>Event Dispatch Thread</i> this implementation uses
   * {@code SwingUtilities.invokeLater} to send out the notification
   * on the <i>Event Dispatch Thread</i>. This ensures  listeners
   * are only ever notified on the <i>Event Dispatch Thread</i>.
   *
   * @throws NullPointerException if {@code evt} is
   *         {@code null}
   * @since 1.6
   */
  firePropertyChange$PropertyChangeEvent(evt: PropertyChangeEvent): void {
    if (evt == null) {
      throw new NullPointerException();
    }
    if (!this.isNotifyOnEDT() || SwingUtilities.isEventDispatchThread()) {
      super.firePropertyChange$PropertyChangeEvent(evt);
    } else {
      SwingUtilities.invokeLater(() => {
        this.firePropertyChange$PropertyChangeEvent(evt);
      });
    }
  }
  /**
   * Returns {@code notifyOnEDT} property.
   *
   * @return {@code notifyOnEDT} property
   * @see #SwingPropertyChangeSupport(Object sourceBean, boolean notifyOnEDT)
   * @since 1.6
   */
  isNotifyOnEDT(): boolean {
    return this.notifyOnEDT;
  }
}

$J.define(SwingPropertyChangeSupport, 'javax.swing.event.SwingPropertyChangeSupport', { kind: 'class', sup: 'java.beans.PropertyChangeSupport', ctors: { 'java.lang.Object,boolean': '_SwingPropertyChangeSupport$Object$boolean', 'java.lang.Object': '_SwingPropertyChangeSupport$Object' }, meths: { 'firePropertyChange(java.beans.PropertyChangeEvent)': 'firePropertyChange$PropertyChangeEvent' } });
$J.module(() => {
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
});
