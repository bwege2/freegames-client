// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/ColorModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2008, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Integer, JObject, JString, NumberFormatException } from '../../../../jre/index.ts';

let UIManager;

export class ColorModel extends JObject {
  prefix: string = null;
  labels: string[] = null;
  _ColorModel$String$StringArr(name: string, labels: string[]): this {
    this.prefix = 'ColorChooser.' + name;
    this.labels = labels;
    return this;
  }
  _ColorModel$(): this {
    this._ColorModel$String$StringArr('rgb', ['Red', 'Green', 'Blue', 'Alpha']);
    return this;
  }
  setColor(color: number, model: number[]): void {
    model[0] = ColorModel.normalize(color >> 16);
    model[1] = ColorModel.normalize(color >> 8);
    model[2] = ColorModel.normalize(color);
    model[3] = ColorModel.normalize(color >> 24);
  }
  getColor(model: number[]): number {
    return ColorModel.to8bit(model[2]) | (ColorModel.to8bit(model[1]) << 8) | (ColorModel.to8bit(model[0]) << 16) | (ColorModel.to8bit(model[3]) << 24);
  }
  getCount(): number {
    return this.labels.length;
  }
  getMinimum(index: number): number {
    return 0;
  }
  getMaximum(index: number): number {
    return 255;
  }
  getDefault(index: number): number {
    return 0;
  }
  getLabel(component: Component, index: number): string {
    return this.getText(component, this.labels[index]);
  }
  static normalize(value: number): number {
    return Math.fround(Math.fround((value & 255)) / 255);
  }
  static to8bit(value: number): number {
    return $J.d2i((Math.fround(255 * value)));
  }
  getText(component: Component, suffix: string): string {
    return UIManager.getString$Object$Locale(this.prefix + suffix + 'Text', component.getLocale$());
  }
  getInteger(component: Component, suffix: string): number {
    let value = UIManager.get$Object$Locale(this.prefix + suffix, component.getLocale$());
    if ($J.isa(value, Integer)) {
      return value;
    }
    if ($J.isa(value, JString)) {
      try {
        return $J.parseInt(value);
      } catch ($e0) {
        if ($J.isa($e0, NumberFormatException)) {
          let exception = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    return -1;
  }
}

$J.define(ColorModel, 'javax.swing.colorchooser.ColorModel', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ColorModel$', 'java.lang.String,java.lang.String[]': '_ColorModel$String$StringArr' } });
$J.module(() => {
  UIManager = $J.load('javax.swing.UIManager');
});
