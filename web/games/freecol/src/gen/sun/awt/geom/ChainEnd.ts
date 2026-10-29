// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/geom/ChainEnd.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, Oracle and/or its affiliates. All rights reserved.
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
import { $J, InternalError, JObject } from '../../../../jre/index.ts';

let AreaOp;

export class ChainEnd extends JObject {
  head: CurveLink = null;
  tail: CurveLink = null;
  partner: ChainEnd = null;
  etag: number = 0;
  _ChainEnd(first: CurveLink, partner: ChainEnd): this {
    this.head = first;
    this.tail = first;
    this.partner = partner;
    this.etag = first.getEdgeTag();
    return this;
  }
  setOtherEnd(partner: ChainEnd): void {
    this.partner = partner;
  }
  linkTo(that: ChainEnd): CurveLink {
    if (this.etag === AreaOp.ETAG_IGNORE || that.etag === AreaOp.ETAG_IGNORE) {
      throw new InternalError('ChainEnd linked more than once!');
    }
    if (this.etag === that.etag) {
      throw new InternalError('Linking chains of the same type!');
    }
    let enter: ChainEnd;
    let exit: ChainEnd;
    if (this.etag === AreaOp.ETAG_ENTER) {
      enter = this;
      exit = that;
    } else {
      enter = that;
      exit = this;
    }
    this.etag = AreaOp.ETAG_IGNORE;
    that.etag = AreaOp.ETAG_IGNORE;
    enter.tail.setNext(exit.head);
    enter.tail = exit.tail;
    if (this.partner === that) {
      return enter.head;
    }
    let otherenter = exit.partner;
    let otherexit = enter.partner;
    otherenter.partner = otherexit;
    otherexit.partner = otherenter;
    if (enter.head.getYTop() < otherenter.head.getYTop()) {
      enter.tail.setNext(otherenter.head);
      otherenter.head = enter.head;
    } else {
      otherexit.tail.setNext(enter.head);
      otherexit.tail = enter.tail;
    }
    return null;
  }
  addLink(newlink: CurveLink): void {
    if (this.etag === AreaOp.ETAG_ENTER) {
      this.tail.setNext(newlink);
      this.tail = newlink;
    } else {
      newlink.setNext(this.head);
      this.head = newlink;
    }
  }
  getX(): number {
    if (this.etag === AreaOp.ETAG_ENTER) {
      return this.tail.getXBot();
    } else {
      return this.head.getXBot();
    }
  }
}

$J.define(ChainEnd, 'sun.awt.geom.ChainEnd', { kind: 'class', sup: 'java.lang.Object', ctors: { 'sun.awt.geom.CurveLink,sun.awt.geom.ChainEnd': '_ChainEnd' } });
$J.module(() => {
  AreaOp = $J.load('sun.awt.geom.AreaOp');
});
