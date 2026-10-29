// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/LinkHandler.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * License (BSD):
 * ==============
 *
 * Copyright (c) 2004, Mikael Grev, MiG InfoCom AB. (miglayout (at) miginfocom (dot) com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this list
 * of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 * Neither the name of the MiG InfoCom AB nor the names of its contributors may be
 * used to endorse or promote products derived from this software without specific
 * prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE.
 *
 * @version 1.0
 * @author Mikael Grev, MiG InfoCom AB
 *         Date: 2006-sep-08
 */
import { $J, HashMap, JObject, WeakHashMap } from '../../../../jre/index.ts';

let LayoutUtil;

export class LinkHandler extends JObject {
  static readonly X: number = 0;
  static readonly Y: number = 1;
  static readonly WIDTH: number = 2;
  static readonly HEIGHT: number = 3;
  static readonly X2: number = 4;
  static readonly Y2: number = 5;
  static readonly VALUES: number = 0;
  static readonly VALUES_TEMP: number = 1;
  static LAYOUTS: WeakHashMap<any, HashMap<string, number[]>[]> = null;
  _LinkHandler(): this {
    return this;
  }
  static getValue(layout: any, key: string, type$: number): number {
    let ret = null;
    let layoutValues = LinkHandler.LAYOUTS.get(layout);
    if (layoutValues != null) {
      let rect = layoutValues[LinkHandler.VALUES_TEMP].get(key);
      if (rect != null && rect[type$] !== LayoutUtil.NOT_SET) {
        ret = rect[type$];
      } else {
        rect = layoutValues[LinkHandler.VALUES].get(key);
        ret = (rect != null && rect[type$] !== LayoutUtil.NOT_SET) ? rect[type$] : null;
      }
    }
    return ret;
  }
  /**
   * Sets a key that can be linked to from any component.
   * @param layout The MigLayout instance
   * @param key The key to link to. This is the same as the ID in a component constraint.
   * @param x x
   * @param y y
   * @param width Width
   * @param height Height
   * @return If the value was changed
   */
  static setBounds$Object$String$int$int$int$int(layout: any, key: string, x: number, y: number, width: number, height: number): boolean {
    return LinkHandler.setBounds$Object$String$int$int$int$int$boolean$boolean(layout, key, x, y, width, height, false, false);
  }
  static setBounds$Object$String$int$int$int$int$boolean$boolean(layout: any, key: string, x: number, y: number, width: number, height: number, temporary: boolean, incCur: boolean): boolean {
    let layoutValues = LinkHandler.LAYOUTS.get(layout);
    if (layoutValues != null) {
      let map = layoutValues[temporary ? LinkHandler.VALUES_TEMP : LinkHandler.VALUES];
      let old = map.get(key);
      if (old == null || old[LinkHandler.X] !== x || old[LinkHandler.Y] !== y || old[LinkHandler.WIDTH] !== width || old[LinkHandler.HEIGHT] !== height) {
        if (old == null || incCur === false) {
          map.put(key, [x, y, width, height, (x + width) | 0, (y + height) | 0]);
          return true;
        } else {
          let changed = false;
          if (x !== LayoutUtil.NOT_SET) {
            if (old[LinkHandler.X] === LayoutUtil.NOT_SET || x < old[LinkHandler.X]) {
              old[LinkHandler.X] = x;
              old[LinkHandler.WIDTH] = (old[LinkHandler.X2] - x) | 0;
              changed = true;
            }
            if (width !== LayoutUtil.NOT_SET) {
              let x2 = (x + width) | 0;
              if (old[LinkHandler.X2] === LayoutUtil.NOT_SET || x2 > old[LinkHandler.X2]) {
                old[LinkHandler.X2] = x2;
                old[LinkHandler.WIDTH] = (x2 - old[LinkHandler.X]) | 0;
                changed = true;
              }
            }
          }
          if (y !== LayoutUtil.NOT_SET) {
            if (old[LinkHandler.Y] === LayoutUtil.NOT_SET || y < old[LinkHandler.Y]) {
              old[LinkHandler.Y] = y;
              old[LinkHandler.HEIGHT] = (old[LinkHandler.Y2] - y) | 0;
              changed = true;
            }
            if (height !== LayoutUtil.NOT_SET) {
              let y2 = (y + height) | 0;
              if (old[LinkHandler.Y2] === LayoutUtil.NOT_SET || y2 > old[LinkHandler.Y2]) {
                old[LinkHandler.Y2] = y2;
                old[LinkHandler.HEIGHT] = (y2 - old[LinkHandler.Y]) | 0;
                changed = true;
              }
            }
          }
          return changed;
        }
      }
      return false;
    }
    let bounds = [x, y, width, height, (x + width) | 0, (y + height) | 0];
    let values_temp = new HashMap(4);
    if (temporary) {
      values_temp.put(key, bounds);
    }
    let values = new HashMap(4);
    if (temporary === false) {
      values.put(key, bounds);
    }
    LinkHandler.LAYOUTS.put(layout, [values, values_temp]);
    return true;
  }
  /**
   * This method clear any weak references right away instead of waiting for the GC. This might be advantageous
   * if lots of layout are created and disposed of quickly to keep memory consumption down.
   * @since 3.7.4
   */
  static clearWeakReferencesNow(): void {
    LinkHandler.LAYOUTS.clear();
  }
  static clearBounds(layout: any, key: string): boolean {
    let layoutValues = LinkHandler.LAYOUTS.get(layout);
    if (layoutValues != null) {
      return layoutValues[LinkHandler.VALUES].remove(key) != null;
    }
    return false;
  }
  static clearTemporaryBounds(layout: any): void {
    let layoutValues = LinkHandler.LAYOUTS.get(layout);
    if (layoutValues != null) {
      layoutValues[LinkHandler.VALUES_TEMP].clear();
    }
  }
  static $clinit() {
    LinkHandler.LAYOUTS = new WeakHashMap();
  }
}

$J.define(LinkHandler, 'net.miginfocom.layout.LinkHandler', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_LinkHandler' }, meths: { 'setBounds(java.lang.Object,java.lang.String,int,int,int,int,boolean,boolean)': 'setBounds$Object$String$int$int$int$int$boolean$boolean', 'setBounds(java.lang.Object,java.lang.String,int,int,int,int)': 'setBounds$Object$String$int$int$int$int' }, clinit: true, lazy: ['LAYOUTS'] });
$J.module(() => {
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
});
