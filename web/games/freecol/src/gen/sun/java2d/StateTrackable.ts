// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/java2d/StateTrackable.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum } from '../../../jre/index.ts';

/**
 * This interface is implemented by classes which contain complex state
 * so that other objects can track whether or not their state has changed
 * since earlier interactions with the object.
 * <p>
 * The suggested usage pattern for code that manages some trackable data
 * is as follows:
 * <pre>
 * class Trackable implements StateTrackable {
 *     TrackedInfo data;
 *     State curState = STABLE;
 *     StateTracker curTracker = null;
 *     // Hypothetical method to return a static piece of our tracked data.
 *     // Assume that Datum is either a copy of some piece of the tracked
 *     // data or that it is itself immutable.
 *     public Datum getSomeDatum(int key) {
 *         // No need to modify the state for this type of "get" call.
 *         return data.getDatum(key);
 *     }
 *     // Hypothetical method to return a raw reference to our tracked data.
 *     public TrackedInfo getRawHandleToInfo() {
 *         // Since we are returning a raw reference to our tracked
 *         // data and since we can not track what the caller will
 *         // do with that reference, we can no longer track the
 *         // state of this data.
 *         synchronized (this) {
 *             // Note: modifying both curState and curTracker requires
 *             // synchronization against the getStateTracker method.
 *             curState = UNTRACKABLE;
 *             curTracker = null;
 *         }
 *         return data;
 *     }
 *     // Hypothetical method to set a single piece of data to some
 *     // new static value.
 *     public void setSomeDatum(int key, Datum datum) {
 *         data.setDatum(key, datum);
 *         // We do not need to change state for this, we simply
 *         // invalidate the outstanding StateTracker objects.
 *         // Note: setting curTracker to null requires no synchronization.
 *         curTracker = null;
 *     }
 *     // getStateTracker must be synchronized against any code that
 *     // changes the State.
 *     public synchronized StateTracker getStateTracker() {
 *         StateTracker st = curTracker;
 *         if (st == null) {
 *             switch (curState) {
 *                 case IMMUTABLE:   st = StateTracker.ALWAYS_CURRENT; break;
 *                 case STABLE:      st = new Tracker(this); break;
 *                 case DYNAMIC:     st = StateTracker.NEVER_CURRENT; break;
 *                 case UNTRACKABLE: st = StateTracker.NEVER_CURRENT; break;
 *             }
 *             curTracker = st;
 *         }
 *         return st;
 *     }
 *
 *     static class Tracker implements StateTracker {
 *         Trackable theTrackable;
 *         public Tracker(Trackable t) {
 *             theTrackable = t;
 *         }
 *         public boolean isCurrent() {
 *             return (theTrackable.curTracker == this);
 *         }
 *     }
 * }
 * </pre>
 * Note that the mechanism shown above for invalidating outstanding
 * StateTracker objects is not the most theoretically conservative
 * way to implement state tracking in a "set" method.
 * There is a small window of opportunity after the data has changed
 * before the outstanding StateTracker objects are invalidated and
 * where they will indicate that the data is still the same as when
 * they were instantiated.
 * While this is technically inaccurate, it is acceptable since the more
 * conservative approaches to state management are much more complex and
 * cost much more in terms of performance for a very small gain in
 * correctness.
 * For example:
 * <p>
 * The most conservative approach would be to synchronize all accesses
 * and all modifications to the data, including its State.
 * This would require synchronized blocks around some potentially large
 * bodies of code which would impact the multi-threaded scalability of
 * the implementation.
 * Further, if data is to be coordinated or transferred between two
 * trackable objects then both would need to be synchronized raising
 * the possibility of deadlock unless some strict rules of priority
 * for the locking of the objects were established and followed
 * religiously.
 * Either or both of these drawbacks makes such an implementation
 * infeasible.
 * <p>
 * A less conservative approach would be to change the state of the
 * trackable object to DYNAMIC during all modifications of the data
 * and then to change it back to STABLE after those modifications
 * are complete.
 * While this state transition more accurately reflects the temporary
 * loss of tracking during the modification phase, in reality the
 * time period of the modifications would be small in most cases
 * and the 2 changes of state would each require synchronization.
 * <p>
 * In comparison the act of setting the {@code curTracker}
 * reference to null in the usage pattern above effectively invalidates
 * all outstanding {@code Tracker} objects as soon as possible
 * after the change to the data and requires very little code and no
 * synchronization to implement.
 * <p>
 * In the end it is up to the implementor of a StateTrackable object
 * how fine the granularity of State updates should be managed based
 * on the frequency and atomicity of the modifications and the
 * consequences of returning an inaccurate State for a particularly
 * small window of opportunity.
 * Most implementations are likely to follow the liberal, but efficient
 * guidelines found in the usage pattern proposed above.
 *
 * @since 1.7
 */
export class StateTrackable {
}

/**
 * An enumeration describing the current state of a trackable
 * object.
 * These values describe how often the complex data contained
 * in a trackable object can be changed and whether or not it
 * makes sense to try to track the data in its current state.
 * @see StateTrackable#getState
 * @since 1.7
 */
export class StateTrackable$State extends JEnum {
  static IMMUTABLE: StateTrackable$State = null;
  static STABLE: StateTrackable$State = null;
  static DYNAMIC: StateTrackable$State = null;
  static UNTRACKABLE: StateTrackable$State = null;
  static $VALUES: StateTrackable$State[] = null;
  _StateTrackable$State($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): StateTrackable$State[] { return StateTrackable$State.$VALUES.slice(); }
  static valueOf(name: string): StateTrackable$State { return $J.enumValueOf(StateTrackable$State, name); }
  static $clinit() {
    StateTrackable$State.IMMUTABLE = new StateTrackable$State()._StateTrackable$State('IMMUTABLE', 0);
    StateTrackable$State.STABLE = new StateTrackable$State()._StateTrackable$State('STABLE', 1);
    StateTrackable$State.DYNAMIC = new StateTrackable$State()._StateTrackable$State('DYNAMIC', 2);
    StateTrackable$State.UNTRACKABLE = new StateTrackable$State()._StateTrackable$State('UNTRACKABLE', 3);
    StateTrackable$State.$VALUES = [StateTrackable$State.IMMUTABLE, StateTrackable$State.STABLE, StateTrackable$State.DYNAMIC, StateTrackable$State.UNTRACKABLE];
  }
}

$J.define(StateTrackable, 'sun.java2d.StateTrackable', { kind: 'interface' });
$J.define(StateTrackable$State, 'sun.java2d.StateTrackable$State', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_StateTrackable$State' }, clinit: true, lazy: ['$VALUES', 'IMMUTABLE', 'STABLE', 'DYNAMIC', 'UNTRACKABLE'] });
