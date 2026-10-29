// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DebugGraphicsInfo.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2008, Oracle and/or its affiliates. All rights reserved.
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

let Color;

/**
 * Class used by DebugGraphics for maintaining information about how
 * to render graphics calls.
 *
 * @author Dave Karlton
 */
export class DebugGraphicsInfo extends JObject {
  flashColor: Color = null;
  flashTime: number = 0;
  flashCount: number = 0;
  componentToDebug: Hashtable<JComponent, number> = null;
  debugFrame: JFrame = null;
  stream: PrintStream = null;
  _DebugGraphicsInfo(): this {
    this.flashColor = Color.red;
    this.flashTime = 100;
    this.flashCount = 2;
    this.debugFrame = null;
    this.stream = $J.out;
    return this;
  }
  getDebugOptions(component: JComponent): number {
    if (this.componentToDebug == null) {
      return 0;
    } else {
      let integer = this.componentToDebug.get(component);
      return integer == null ? 0 : (+integer);
    }
  }
  log(string$: string): void {
    this.stream.println(string$);
  }
}

$J.define(DebugGraphicsInfo, 'javax.swing.DebugGraphicsInfo', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DebugGraphicsInfo' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
});
