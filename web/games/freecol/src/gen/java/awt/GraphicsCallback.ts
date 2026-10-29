// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/GraphicsCallback.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2000, Oracle and/or its affiliates. All rights reserved.
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
import { $J, LightweightPeer } from '../../../jre/index.ts';
import { SunGraphicsCallback } from '../../sun/awt/SunGraphicsCallback.ts';

export class GraphicsCallback extends SunGraphicsCallback {
  _GraphicsCallback(): this {
    this._SunGraphicsCallback();
    return this;
  }
}

export class GraphicsCallback$PaintCallback extends GraphicsCallback {
  static instance: GraphicsCallback$PaintCallback = null;
  _GraphicsCallback$PaintCallback(): this {
    this._GraphicsCallback();
    return this;
  }
  run(comp: Component, cg: Graphics): void {
    comp.paint(cg);
  }
  static getInstance(): GraphicsCallback$PaintCallback {
    return GraphicsCallback$PaintCallback.instance;
  }
  static $clinit() {
    GraphicsCallback$PaintCallback.instance = new GraphicsCallback$PaintCallback()._GraphicsCallback$PaintCallback();
  }
}

export class GraphicsCallback$PrintCallback extends GraphicsCallback {
  static instance: GraphicsCallback$PrintCallback = null;
  _GraphicsCallback$PrintCallback(): this {
    this._GraphicsCallback();
    return this;
  }
  run(comp: Component, cg: Graphics): void {
    comp.print$Graphics(cg);
  }
  static getInstance(): GraphicsCallback$PrintCallback {
    return GraphicsCallback$PrintCallback.instance;
  }
  static $clinit() {
    GraphicsCallback$PrintCallback.instance = new GraphicsCallback$PrintCallback()._GraphicsCallback$PrintCallback();
  }
}

export class GraphicsCallback$PeerPrintCallback extends GraphicsCallback {
  static instance: GraphicsCallback$PeerPrintCallback = null;
  _GraphicsCallback$PeerPrintCallback(): this {
    this._GraphicsCallback();
    return this;
  }
  run(comp: Component, cg: Graphics): void {
    comp.validate();
    if ($J.isa(comp.peer, LightweightPeer)) {
      comp.lightweightPrint(cg);
    } else {
      comp.peer.print(cg);
    }
  }
  static getInstance(): GraphicsCallback$PeerPrintCallback {
    return GraphicsCallback$PeerPrintCallback.instance;
  }
  static $clinit() {
    GraphicsCallback$PeerPrintCallback.instance = new GraphicsCallback$PeerPrintCallback()._GraphicsCallback$PeerPrintCallback();
  }
}

export class GraphicsCallback$PrintHeavyweightComponentsCallback extends GraphicsCallback {
  static instance: GraphicsCallback$PrintHeavyweightComponentsCallback = null;
  _GraphicsCallback$PrintHeavyweightComponentsCallback(): this {
    this._GraphicsCallback();
    return this;
  }
  run(comp: Component, cg: Graphics): void {
    if ($J.isa(comp.peer, LightweightPeer)) {
      comp.printHeavyweightComponents(cg);
    } else {
      comp.printAll(cg);
    }
  }
  static getInstance(): GraphicsCallback$PrintHeavyweightComponentsCallback {
    return GraphicsCallback$PrintHeavyweightComponentsCallback.instance;
  }
  static $clinit() {
    GraphicsCallback$PrintHeavyweightComponentsCallback.instance = new GraphicsCallback$PrintHeavyweightComponentsCallback()._GraphicsCallback$PrintHeavyweightComponentsCallback();
  }
}

$J.define(GraphicsCallback, 'java.awt.GraphicsCallback', { kind: 'class', sup: 'sun.awt.SunGraphicsCallback', ctors: { '': '_GraphicsCallback' } });
$J.define(GraphicsCallback$PaintCallback, 'java.awt.GraphicsCallback$PaintCallback', { kind: 'class', sup: 'java.awt.GraphicsCallback', ctors: { '': '_GraphicsCallback$PaintCallback' }, clinit: true, lazy: ['instance'] });
$J.define(GraphicsCallback$PrintCallback, 'java.awt.GraphicsCallback$PrintCallback', { kind: 'class', sup: 'java.awt.GraphicsCallback', ctors: { '': '_GraphicsCallback$PrintCallback' }, clinit: true, lazy: ['instance'] });
$J.define(GraphicsCallback$PeerPrintCallback, 'java.awt.GraphicsCallback$PeerPrintCallback', { kind: 'class', sup: 'java.awt.GraphicsCallback', ctors: { '': '_GraphicsCallback$PeerPrintCallback' }, clinit: true, lazy: ['instance'] });
$J.define(GraphicsCallback$PrintHeavyweightComponentsCallback, 'java.awt.GraphicsCallback$PrintHeavyweightComponentsCallback', { kind: 'class', sup: 'java.awt.GraphicsCallback', ctors: { '': '_GraphicsCallback$PrintHeavyweightComponentsCallback' }, clinit: true, lazy: ['instance'] });
