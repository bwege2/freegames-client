// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/MediaTracker.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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

export class MediaEntry extends JObject {
  tracker: MediaTracker = null;
  ID: number = 0;
  next_: MediaEntry = null;
  status_: number = 0;
  cancelled: boolean = false;
  static readonly LOADING: number = 1;
  static readonly ABORTED: number = 2;
  static readonly ERRORED: number = 4;
  static readonly COMPLETE: number = 8;
  static readonly LOADSTARTED: number = 13;
  static readonly DONE: number = 14;
  _MediaEntry(mt: MediaTracker, id: number): this {
    this.tracker = mt;
    this.ID = id;
    return this;
  }
  static insert(head: MediaEntry, me: MediaEntry): MediaEntry {
    let cur = head;
    let prev = null;
    while (cur != null) {
      if (cur.ID > me.ID) {
        break;
      }
      prev = cur;
      cur = cur.next_;
    }
    me.next_ = cur;
    if (prev == null) {
      head = me;
    } else {
      prev.next_ = me;
    }
    return head;
  }
  getID(): number {
    return this.ID;
  }
  cancel(): void {
    this.cancelled = true;
  }
  getStatus(doLoad: boolean, doVerify: boolean): number {
    if (doLoad && ((this.status_ & MediaEntry.LOADSTARTED) === 0)) {
      this.status_ = (this.status_ & ~MediaEntry.ABORTED) | MediaEntry.LOADING;
      this.startLoad();
    }
    return this.status_;
  }
  setStatus(flag: number): void {
    {
      this.status_ = flag;
    }
    this.tracker.setDone();
  }
}

$J.define(MediaEntry, 'java.awt.MediaEntry', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.MediaTracker,int': '_MediaEntry' } });
