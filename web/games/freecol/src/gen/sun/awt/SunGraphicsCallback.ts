// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/SunGraphicsCallback.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, PlatformLogger, PlatformLogger_Level } from '../../../jre/index.ts';

let Graphics2D, ConstrainableGraphics;

export class SunGraphicsCallback extends JObject {
  static readonly HEAVYWEIGHTS: number = 1;
  static readonly LIGHTWEIGHTS: number = 2;
  static readonly TWO_PASSES: number = 4;
  static log: PlatformLogger = null;
  _SunGraphicsCallback(): this {
    return this;
  }
  constrainGraphics(g: Graphics, bounds: Rectangle): void {
    if ($J.isa(g, ConstrainableGraphics)) {
      (g).constrain(bounds.x_, bounds.y_, bounds.width_, bounds.height_);
    } else {
      g.translate$int$int(bounds.x_, bounds.y_);
    }
    g.clipRect(0, 0, bounds.width_, bounds.height_);
  }
  runOneComponent(comp: Component, bounds: Rectangle, g: Graphics, clip: Shape, weightFlags: number): void {
    if (comp == null || !comp.isDisplayable() || !comp.isVisible$()) {
      return;
    }
    let lightweight = comp.isLightweight();
    if ((lightweight && (weightFlags & SunGraphicsCallback.LIGHTWEIGHTS) === 0) || (!lightweight && (weightFlags & SunGraphicsCallback.HEAVYWEIGHTS) === 0)) {
      return;
    }
    if (bounds == null) {
      bounds = comp.getBounds$();
    }
    if (clip == null || clip.intersects$Rectangle2D(bounds)) {
      let cg = g.create$();
      try {
        this.constrainGraphics(cg, bounds);
        cg.setFont(comp.getFont());
        cg.setColor(comp.getForeground());
        if (cg instanceof Graphics2D) {
          (cg).setBackground(comp.getBackground());
        }
        this.run(comp, cg);
      } finally {
        cg.dispose();
      }
    }
  }
  runComponents(comps: Component[], g: Graphics, weightFlags: number): void {
    let ncomponents = comps.length;
    let clip = g.getClip();
    if (SunGraphicsCallback.log.isLoggable(PlatformLogger_Level.FINER) && (clip != null)) {
      let newrect = clip.getBounds();
      SunGraphicsCallback.log.finer('x = ' + newrect.x_ + ', y = ' + newrect.y_ + ', width = ' + newrect.width_ + ', height = ' + newrect.height_);
    }
    if ((weightFlags & SunGraphicsCallback.TWO_PASSES) !== 0) {
      for (let i = (ncomponents - 1) | 0; i >= 0; i--) {
        this.runOneComponent(comps[i], null, g, clip, SunGraphicsCallback.LIGHTWEIGHTS);
      }
      for (let i = (ncomponents - 1) | 0; i >= 0; i--) {
        this.runOneComponent(comps[i], null, g, clip, SunGraphicsCallback.HEAVYWEIGHTS);
      }
    } else {
      for (let i = (ncomponents - 1) | 0; i >= 0; i--) {
        this.runOneComponent(comps[i], null, g, clip, weightFlags);
      }
    }
  }
  static $clinit() {
    SunGraphicsCallback.log = PlatformLogger.getLogger('sun.awt.SunGraphicsCallback');
  }
}

$J.define(SunGraphicsCallback, 'sun.awt.SunGraphicsCallback', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_SunGraphicsCallback' }, clinit: true, lazy: ['log'] });
$J.module(() => {
  Graphics2D = $J.load('java.awt.Graphics2D');
  ConstrainableGraphics = $J.load('sun.awt.ConstrainableGraphics');
});
