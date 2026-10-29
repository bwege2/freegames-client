// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/WhitespaceBasedBreakIterator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2006, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Arrays, BreakIterator, Character, JString, StringCharacterIterator } from '../../../../jre/index.ts';

/**
 * A simple whitespace-based BreakIterator implementation.
 *
 * @author Sergey Groznyh
 */
export class WhitespaceBasedBreakIterator extends BreakIterator {
  text_: number[] = null;
  breaks: number[] = null;
  pos: number = 0;
  _WhitespaceBasedBreakIterator(): this {
    this._BreakIterator();
    this.text_ = $J.newArray(0, 0);
    this.breaks = [0];
    this.pos = 0;
    return this;
  }
  /**
   * Calculate break positions eagerly parallel to reading text.
   */
  setText(ci: CharacterIterator): void {
    let begin = ci.getBeginIndex();
    this.text_ = $J.newArray((ci.getEndIndex() - begin) | 0, 0);
    let breaks0 = $J.newArray((this.text_.length + 1) | 0, 0);
    let brIx = 0;
    breaks0[brIx++] = begin;
    let charIx = 0;
    let inWs = false;
    for (let c = ci.first(); c !== 65535 /* \uffff */; c = ci.next()) {
      this.text_[charIx] = c;
      let ws = Character.isWhitespace(c);
      if (inWs && !ws) {
        breaks0[brIx++] = (charIx + begin) | 0;
      }
      inWs = ws;
      charIx++;
    }
    if (this.text_.length > 0) {
      breaks0[brIx++] = (this.text_.length + begin) | 0;
    }
    $J.system_arraycopy(breaks0, 0, this.breaks = $J.newArray(brIx, 0), 0, brIx);
  }
  getText(): CharacterIterator {
    return new StringCharacterIterator(JString.newString(this.text_));
  }
  first(): number {
    return this.breaks[this.pos = 0];
  }
  last(): number {
    return this.breaks[this.pos = (this.breaks.length - 1) | 0];
  }
  current(): number {
    return this.breaks[this.pos];
  }
  next$(): number {
    return (this.pos === ((this.breaks.length - 1) | 0) ? -1 : this.breaks[++this.pos]);
  }
  previous(): number {
    return (this.pos === 0 ? -1 : this.breaks[--this.pos]);
  }
  next$int(n: number): number {
    return this.checkhit((this.pos + n) | 0);
  }
  following(n: number): number {
    return this.adjacent(n, 1);
  }
  preceding(n: number): number {
    return this.adjacent(n, -1);
  }
  checkhit(hit: number): number {
    if ((hit < 0) || (hit >= this.breaks.length)) {
      return -1;
    } else {
      return this.breaks[this.pos = hit];
    }
  }
  adjacent(n: number, bias: number): number {
    let hit = Arrays.binarySearch(this.breaks, n);
    let offset = (hit < 0 ? (bias < 0 ? -1 : -2) : 0);
    return this.checkhit((Math.abs(hit) + bias + offset) | 0);
  }
  next(...a: any[]): any {
    if (a.length === 0) return this.next$(...a);
    if (a.length === 1 && typeof a[0] === 'number') return this.next$int(...a);
    return super.next(...a);
  }
}

$J.define(WhitespaceBasedBreakIterator, 'javax.swing.text.WhitespaceBasedBreakIterator', { kind: 'class', sup: 'java.text.BreakIterator', ctors: { '': '_WhitespaceBasedBreakIterator' }, meths: { 'next(int)': 'next$int', 'next()': 'next$' } });
