// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/SentEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, SunToolkit, Toolkit } from '../../../jre/index.ts';
import { AWTEvent } from './AWTEvent.ts';

/**
 * A wrapping tag for a nested AWTEvent which indicates that the event was
 * sent from another AppContext. The destination AppContext should handle the
 * event even if it is currently blocked waiting for a SequencedEvent or
 * another SentEvent to be handled.
 *
 * @author David Mendenhall
 */
export class SentEvent extends AWTEvent {
  static readonly ID: number = 1007;
  dispatched_: boolean = false;
  nested: AWTEvent = null;
  toNotify: AppContext = null;
  _SentEvent$(): this {
    this._SentEvent$AWTEvent(null);
    return this;
  }
  _SentEvent$AWTEvent(nested: AWTEvent): this {
    this._SentEvent$AWTEvent$AppContext(nested, null);
    return this;
  }
  _SentEvent$AWTEvent$AppContext(nested: AWTEvent, toNotify: AppContext): this {
    this._AWTEvent$Object$int((nested != null) ? nested.getSource() : Toolkit.getDefaultToolkit(), SentEvent.ID);
    this.nested = nested;
    this.toNotify = toNotify;
    return this;
  }
  dispatch(): void {
    try {
      if (this.nested != null) {
        Toolkit.getEventQueue().dispatchEvent(this.nested);
      }
    } finally {
      this.dispatched_ = true;
      if (this.toNotify != null) {
        SunToolkit.postEvent(this.toNotify, new SentEvent()._SentEvent$());
      }
      {
        $J.monitorNotify(this, true);
      }
    }
  }
  dispose(): void {
    this.dispatched_ = true;
    if (this.toNotify != null) {
      SunToolkit.postEvent(this.toNotify, new SentEvent()._SentEvent$());
    }
    {
      $J.monitorNotify(this, true);
    }
  }
}

$J.define(SentEvent, 'java.awt.SentEvent', { kind: 'class', ifaces: ['java.awt.ActiveEvent'], sup: 'java.awt.AWTEvent', ctors: { 'java.awt.AWTEvent,sun.awt.AppContext': '_SentEvent$AWTEvent$AppContext', 'java.awt.AWTEvent': '_SentEvent$AWTEvent', '': '_SentEvent$' } });
