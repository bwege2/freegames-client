// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalFontDesktopProperty.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2001, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Integer } from '../../../../../jre/index.ts';
import { DesktopProperty } from '../../../../sun/swing/plaf/DesktopProperty.ts';

let Font, DefaultMetalTheme;

/**
 * DesktopProperty that only uses font height in configuring font. This
 * is only used on Windows.
 */
export class MetalFontDesktopProperty extends DesktopProperty {
  /**
   * Maps from metal font theme type as defined in MetalTheme
   * to the corresponding desktop property name.
   */
  static propertyMapping: string[] = null;
  /**
   * Corresponds to a MetalTheme font type.
   */
  type: number = 0;
  /**
   * Creates a MetalFontDesktopProperty. The key used to lookup the
   * desktop property is determined from the type of font.
   *
   * @param type MetalTheme font type.
   */
  _MetalFontDesktopProperty$int(type$: number): this {
    this._MetalFontDesktopProperty$String$int(MetalFontDesktopProperty.propertyMapping[type$], type$);
    return this;
  }
  /**
   * Creates a MetalFontDesktopProperty.
   *
   * @param key Key used in looking up desktop value.
   * @param type Type of font being used, corresponds to MetalTheme font
   *        type.
   */
  _MetalFontDesktopProperty$String$int(key: string, type$: number): this {
    this._DesktopProperty(key, null);
    this.type = type$;
    return this;
  }
  /**
   * Overridden to create a Font with the size coming from the desktop
   * and the style and name coming from DefaultMetalTheme.
   */
  configureValue(value: any): any {
    if ($J.isa(value, Integer)) {
      value = new Font()._Font$String$int$int(DefaultMetalTheme.getDefaultFontName(this.type), DefaultMetalTheme.getDefaultFontStyle(this.type), (+(value)));
    }
    return super.configureValue(value);
  }
  /**
   * Returns the default font.
   */
  getDefaultValue(): any {
    return new Font()._Font$String$int$int(DefaultMetalTheme.getDefaultFontName(this.type), DefaultMetalTheme.getDefaultFontStyle(this.type), DefaultMetalTheme.getDefaultFontSize(this.type));
  }
  static $clinit() {
    MetalFontDesktopProperty.propertyMapping = ['win.ansiVar.font.height', 'win.tooltip.font.height', 'win.ansiVar.font.height', 'win.menu.font.height', 'win.frame.captionFont.height', 'win.menu.font.height'];
  }
}

$J.define(MetalFontDesktopProperty, 'javax.swing.plaf.metal.MetalFontDesktopProperty', { kind: 'class', sup: 'sun.swing.plaf.DesktopProperty', ctors: { 'java.lang.String,int': '_MetalFontDesktopProperty$String$int', 'int': '_MetalFontDesktopProperty$int' }, clinit: true, lazy: ['propertyMapping'] });
$J.module(() => {
  Font = $J.load('java.awt.Font');
  DefaultMetalTheme = $J.load('javax.swing.plaf.metal.DefaultMetalTheme');
});
