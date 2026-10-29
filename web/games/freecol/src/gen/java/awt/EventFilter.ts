// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/EventFilter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2013, Oracle and/or its affiliates. All rights reserved.
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

export class EventFilter {
}

/**
 * Enumeration for possible values for {@code acceptEvent(AWTEvent ev)} method.
 * @see EventDispatchThread#pumpEventsForFilter
 */
export class EventFilter$FilterAction extends JEnum {
  static ACCEPT: EventFilter$FilterAction = null;
  static REJECT: EventFilter$FilterAction = null;
  static ACCEPT_IMMEDIATELY: EventFilter$FilterAction = null;
  static $VALUES: EventFilter$FilterAction[] = null;
  _EventFilter$FilterAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): EventFilter$FilterAction[] { return EventFilter$FilterAction.$VALUES.slice(); }
  static valueOf(name: string): EventFilter$FilterAction { return $J.enumValueOf(EventFilter$FilterAction, name); }
  static $clinit() {
    EventFilter$FilterAction.ACCEPT = new EventFilter$FilterAction()._EventFilter$FilterAction('ACCEPT', 0);
    EventFilter$FilterAction.REJECT = new EventFilter$FilterAction()._EventFilter$FilterAction('REJECT', 1);
    EventFilter$FilterAction.ACCEPT_IMMEDIATELY = new EventFilter$FilterAction()._EventFilter$FilterAction('ACCEPT_IMMEDIATELY', 2);
    EventFilter$FilterAction.$VALUES = [EventFilter$FilterAction.ACCEPT, EventFilter$FilterAction.REJECT, EventFilter$FilterAction.ACCEPT_IMMEDIATELY];
  }
}

$J.define(EventFilter, 'java.awt.EventFilter', { kind: 'interface' });
$J.define(EventFilter$FilterAction, 'java.awt.EventFilter$FilterAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_EventFilter$FilterAction' }, clinit: true, lazy: ['$VALUES', 'ACCEPT', 'REJECT', 'ACCEPT_IMMEDIATELY'] });
