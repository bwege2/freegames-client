// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/java2d/StateTrackableDelegate.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2007, Oracle and/or its affiliates. All rights reserved.
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
import { $J, InternalError, JObject } from '../../../jre/index.ts';

let StateTrackable$State;

/**
 * This class provides a basic pre-packaged implementation of the
 * complete {@link StateTrackable} interface with implementations
 * of the required methods in the interface and methods to manage
 * transitions in the state of the object.
 * Classes which wish to implement StateTrackable could create an
 * instance of this class and delegate all of their implementations
 * for {@code StateTrackable} methods to the corresponding methods
 * of this class.
 */
export class StateTrackableDelegate extends JObject {
  /**
   * The {@code UNTRACKABLE_DELEGATE} provides an implementation
   * of the StateTrackable interface that is permanently in the
   * {@link State#UNTRACKABLE UNTRACKABLE} state.
   */
  static UNTRACKABLE_DELEGATE: StateTrackableDelegate = null;
  /**
   * The {@code IMMUTABLE_DELEGATE} provides an implementation
   * of the StateTrackable interface that is permanently in the
   * {@link State#IMMUTABLE IMMUTABLE} state.
   */
  static IMMUTABLE_DELEGATE: StateTrackableDelegate = null;
  theState: StateTrackable$State = null;
  theTracker: StateTracker = null;
  numDynamicAgents: number = 0;
  /**
   * Constructs a StateTrackableDelegate object with the specified
   * initial State.
   */
  _StateTrackableDelegate(state: StateTrackable$State): this {
    this.theState = state;
    return this;
  }
  /**
   * Returns a {@code StateTrackableDelegate} instance with the
   * specified initial {@link State State}.
   * If the specified {@code State} is
   * {@link State#UNTRACKABLE UNTRACKABLE} or
   * {@link State#IMMUTABLE IMMUTABLE}
   * then the approprirate static instance
   * {@link #UNTRACKABLE_DELEGATE} or {@link #IMMUTABLE_DELEGATE}
   * is returned.
   */
  static createInstance(state: StateTrackable$State): StateTrackableDelegate {
    switch (state) {
      case StateTrackable$State.UNTRACKABLE:
        return StateTrackableDelegate.UNTRACKABLE_DELEGATE;
      case StateTrackable$State.STABLE:
        return new StateTrackableDelegate()._StateTrackableDelegate(StateTrackable$State.STABLE);
      case StateTrackable$State.DYNAMIC:
        return new StateTrackableDelegate()._StateTrackableDelegate(StateTrackable$State.DYNAMIC);
      case StateTrackable$State.IMMUTABLE:
        return StateTrackableDelegate.IMMUTABLE_DELEGATE;
      default:
        throw new InternalError('unknown state');
    }
  }
  /**
   * This method provides an easy way for delegating classes to
   * indicate that the contents have changed.
   * This method will invalidate outstanding StateTracker objects
   * so that any other agents which maintain cached information
   * about the pixels will know to refresh their cached copies.
   * This method should be called after every modification to
   * the data, such as any calls to any of the setElem methods.
   * <p>
   * Note that, for efficiency, this method does not check the
   * {@link State State} of the object to see if it is compatible
   * with being marked dirty
   * (i.e. not {@link State#IMMUTABLE IMMUTABLE}).
   * It is up to the callers to enforce the fact that an
   * {@code IMMUTABLE} delegate is never modified.
   * @since 1.7
   */
  markDirty(): void {
    this.theTracker = null;
  }
  static $clinit() {
    StateTrackableDelegate.UNTRACKABLE_DELEGATE = new StateTrackableDelegate()._StateTrackableDelegate(StateTrackable$State.UNTRACKABLE);
    StateTrackableDelegate.IMMUTABLE_DELEGATE = new StateTrackableDelegate()._StateTrackableDelegate(StateTrackable$State.IMMUTABLE);
  }
}

$J.define(StateTrackableDelegate, 'sun.java2d.StateTrackableDelegate', { kind: 'class', ifaces: ['sun.java2d.StateTrackable'], sup: 'java.lang.Object', ctors: { 'sun.java2d.StateTrackable$State': '_StateTrackableDelegate' }, clinit: true, lazy: ['UNTRACKABLE_DELEGATE', 'IMMUTABLE_DELEGATE'] });
$J.module(() => {
  StateTrackable$State = $J.load('sun.java2d.StateTrackable$State');
});
