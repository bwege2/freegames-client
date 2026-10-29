// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/DefaultLookup.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2003, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, JBoolean, JNumber, JObject, StringBuffer, Thread } from '../../../jre/index.ts';

let Color, Insets, Icon, UIManager, Border;

/**
 * DefaultLookup provides a way to customize the lookup done by the
 * UIManager. The default implementation of DefaultLookup forwards
 * the call to the UIManager.
 * <p>
 * <b>WARNING:</b> While this class is public, it should not be treated as
 * public API and its API may change in incompatible ways between dot dot
 * releases and even patch releases. You should not rely on this class even
 * existing.
 *
 * @author Scott Violet
 */
export class DefaultLookup extends JObject {
  /**
   * Key used to store DefaultLookup for AppContext.
   */
  static DEFAULT_LOOKUP_KEY: any = null;
  /**
   * Thread that last asked for a default.
   */
  static currentDefaultThread: Thread = null;
  /**
   * DefaultLookup for last thread.
   */
  static currentDefaultLookup: DefaultLookup = null;
  /**
   * If true, a custom DefaultLookup has been set.
   */
  static isLookupSet: boolean = false;
  _DefaultLookup(): this {
    return this;
  }
  /**
   * Sets the DefaultLookup instance to use for the current
   * <code>AppContext</code>. Null implies the UIManager should be
   * used.
   */
  static setDefaultLookup(lookup: DefaultLookup): void {
    {
      if (!DefaultLookup.isLookupSet && lookup == null) {
        return;
      } else if (lookup == null) {
        lookup = new DefaultLookup()._DefaultLookup();
      }
      DefaultLookup.isLookupSet = true;
      AppContext.getAppContext().put(DefaultLookup.DEFAULT_LOOKUP_KEY, lookup);
      DefaultLookup.currentDefaultThread = Thread.currentThread();
      DefaultLookup.currentDefaultLookup = lookup;
    }
  }
  static get(c: JComponent, ui: ComponentUI, key: string): any {
    let lookupSet: boolean;
    {
      lookupSet = DefaultLookup.isLookupSet;
    }
    if (!lookupSet) {
      return UIManager.get$Object$Locale(key, c.getLocale$());
    }
    let thisThread = Thread.currentThread();
    let lookup: DefaultLookup;
    {
      if (thisThread === DefaultLookup.currentDefaultThread) {
        lookup = DefaultLookup.currentDefaultLookup;
      } else {
        lookup = AppContext.getAppContext().get(DefaultLookup.DEFAULT_LOOKUP_KEY);
        if (lookup == null) {
          lookup = new DefaultLookup()._DefaultLookup();
          AppContext.getAppContext().put(DefaultLookup.DEFAULT_LOOKUP_KEY, lookup);
        }
        DefaultLookup.currentDefaultThread = thisThread;
        DefaultLookup.currentDefaultLookup = lookup;
      }
    }
    return lookup.getDefault(c, ui, key);
  }
  static getInt$JComponent$ComponentUI$String$int(c: JComponent, ui: ComponentUI, key: string, defaultValue: number): number {
    let iValue = DefaultLookup.get(c, ui, key);
    var number$;
    if ($J.isa((number$ = iValue), JNumber)) {
      return $J.d2i(+number$);
    }
    return defaultValue;
  }
  static getInsets$JComponent$ComponentUI$String$Insets(c: JComponent, ui: ComponentUI, key: string, defaultValue: Insets): Insets {
    let iValue = DefaultLookup.get(c, ui, key);
    var insets;
    if ((insets = iValue) instanceof Insets) {
      return insets;
    }
    return defaultValue;
  }
  static getInsets$JComponent$ComponentUI$String(c: JComponent, ui: ComponentUI, key: string): Insets {
    return DefaultLookup.getInsets$JComponent$ComponentUI$String$Insets(c, ui, key, null);
  }
  static getBoolean$JComponent$ComponentUI$String$boolean(c: JComponent, ui: ComponentUI, key: string, defaultValue: boolean): boolean {
    let iValue = DefaultLookup.get(c, ui, key);
    var b;
    if ($J.isa((b = iValue), JBoolean)) {
      return b;
    }
    return defaultValue;
  }
  static getColor$JComponent$ComponentUI$String$Color(c: JComponent, ui: ComponentUI, key: string, defaultValue: Color): Color {
    let iValue = DefaultLookup.get(c, ui, key);
    var color;
    if ((color = iValue) instanceof Color) {
      return color;
    }
    return defaultValue;
  }
  static getColor$JComponent$ComponentUI$String(c: JComponent, ui: ComponentUI, key: string): Color {
    return DefaultLookup.getColor$JComponent$ComponentUI$String$Color(c, ui, key, null);
  }
  static getIcon$JComponent$ComponentUI$String$Icon(c: JComponent, ui: ComponentUI, key: string, defaultValue: Icon): Icon {
    let iValue = DefaultLookup.get(c, ui, key);
    var icon;
    if ($J.isa((icon = iValue), Icon)) {
      return icon;
    }
    return defaultValue;
  }
  static getIcon$JComponent$ComponentUI$String(c: JComponent, ui: ComponentUI, key: string): Icon {
    return DefaultLookup.getIcon$JComponent$ComponentUI$String$Icon(c, ui, key, null);
  }
  static getBorder$JComponent$ComponentUI$String$Border(c: JComponent, ui: ComponentUI, key: string, defaultValue: Border): Border {
    let iValue = DefaultLookup.get(c, ui, key);
    var border;
    if ($J.isa((border = iValue), Border)) {
      return border;
    }
    return defaultValue;
  }
  static getBorder$JComponent$ComponentUI$String(c: JComponent, ui: ComponentUI, key: string): Border {
    return DefaultLookup.getBorder$JComponent$ComponentUI$String$Border(c, ui, key, null);
  }
  getDefault(c: JComponent, ui: ComponentUI, key: string): any {
    return UIManager.get$Object$Locale(key, c.getLocale$());
  }
  static $clinit() {
    DefaultLookup.DEFAULT_LOOKUP_KEY = new StringBuffer('DefaultLookup');
  }
}

$J.define(DefaultLookup, 'sun.swing.DefaultLookup', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DefaultLookup' }, meths: { 'getBorder(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String)': 'getBorder$JComponent$ComponentUI$String', 'getBorder(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String,javax.swing.border.Border)': 'getBorder$JComponent$ComponentUI$String$Border', 'getIcon(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String)': 'getIcon$JComponent$ComponentUI$String', 'getIcon(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String,javax.swing.Icon)': 'getIcon$JComponent$ComponentUI$String$Icon', 'getColor(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String)': 'getColor$JComponent$ComponentUI$String', 'getColor(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String,java.awt.Color)': 'getColor$JComponent$ComponentUI$String$Color', 'getBoolean(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String)': 'getBoolean$JComponent$ComponentUI$String', 'getBoolean(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String,boolean)': 'getBoolean$JComponent$ComponentUI$String$boolean', 'getInsets(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String)': 'getInsets$JComponent$ComponentUI$String', 'getInsets(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String,java.awt.Insets)': 'getInsets$JComponent$ComponentUI$String$Insets', 'getInt(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String)': 'getInt$JComponent$ComponentUI$String', 'getInt(javax.swing.JComponent,javax.swing.plaf.ComponentUI,java.lang.String,int)': 'getInt$JComponent$ComponentUI$String$int' }, clinit: true, lazy: ['DEFAULT_LOOKUP_KEY', 'currentDefaultThread', 'currentDefaultLookup', 'isLookupSet'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Insets = $J.load('java.awt.Insets');
  Icon = $J.load('javax.swing.Icon');
  UIManager = $J.load('javax.swing.UIManager');
  Border = $J.load('javax.swing.border.Border');
});
