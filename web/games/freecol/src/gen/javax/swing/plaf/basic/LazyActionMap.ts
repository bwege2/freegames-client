// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/LazyActionMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2002, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalAccessException, IllegalArgumentException, InvocationTargetException, NoSuchMethodException } from '../../../../../jre/index.ts';
import { ActionMapUIResource } from '../ActionMapUIResource.ts';

let Action, SwingUtilities, UIManager;

/**
 * An ActionMap that populates its contents as necessary. The
 * contents are populated by invoking the <code>loadActionMap</code>
 * method on the passed in Object.
 *
 * @author Scott Violet
 */
export class LazyActionMap extends ActionMapUIResource {
  /**
   * Object to invoke <code>loadActionMap</code> on. This may be
   * a Class object.
   */
  _loader: any = null;
  _LazyActionMap(loader: JClass<any>): this {
    this._ActionMapUIResource();
    this._loader = loader;
    return this;
  }
  /**
   * Installs an ActionMap that will be populated by invoking the
   * <code>loadActionMap</code> method on the specified Class
   * when necessary.
   * <p>
   * This should be used if the ActionMap can be shared.
   *
   * @param c JComponent to install the ActionMap on.
   * @param loaderClass Class object that gets loadActionMap invoked
   *                    on.
   * @param defaultsKey Key to use to defaults table to check for
   *        existing map and what resulting Map will be registered on.
   */
  static installLazyActionMap(c: JComponent, loaderClass: JClass<any>, defaultsKey: string): void {
    let map = UIManager.get$Object(defaultsKey);
    if (map == null) {
      map = new LazyActionMap()._LazyActionMap(loaderClass);
      UIManager.getLookAndFeelDefaults().put(defaultsKey, map);
    }
    SwingUtilities.replaceUIActionMap(c, map);
  }
  /**
   * Returns an ActionMap that will be populated by invoking the
   * <code>loadActionMap</code> method on the specified Class
   * when necessary.
   * <p>
   * This should be used if the ActionMap can be shared.
   *
   * @param loaderClass Class object that gets loadActionMap invoked
   *                    on.
   * @param defaultsKey Key to use to defaults table to check for
   *        existing map and what resulting Map will be registered on.
   */
  static getActionMap(loaderClass: JClass<any>, defaultsKey: string): ActionMap {
    let map = UIManager.get$Object(defaultsKey);
    if (map == null) {
      map = new LazyActionMap()._LazyActionMap(loaderClass);
      UIManager.getLookAndFeelDefaults().put(defaultsKey, map);
    }
    return map;
  }
  put$Action(action: Action): void {
    this.put$Object$Action(action.getValue$String(Action.NAME), action);
  }
  put$Object$Action(key: any, action: Action): void {
    this.loadIfNecessary();
    super.put$Object$Action(key, action);
  }
  get(key: any): Action {
    this.loadIfNecessary();
    return super.get(key);
  }
  remove(key: any): void {
    this.loadIfNecessary();
    super.remove(key);
  }
  clear(): void {
    this.loadIfNecessary();
    super.clear();
  }
  setParent(map: ActionMap): void {
    this.loadIfNecessary();
    super.setParent(map);
  }
  loadIfNecessary(): void {
    if (this._loader != null) {
      let loader = this._loader;
      this._loader = null;
      let klass = loader;
      try {
        let method = klass.getDeclaredMethod('loadActionMap', ...[$J.cls(LazyActionMap)]);
        method.invoke(klass, ...[this]);
      } catch ($e0) {
        if ($J.isa($e0, NoSuchMethodException)) {
          let nsme = $J.exc($e0);
          // assert false
        } else if ($J.isa($e0, IllegalAccessException) || $J.isa($e0, IllegalArgumentException) || $J.isa($e0, InvocationTargetException)) {
          let e = $J.exc($e0);
          // assert false
        } else {
          throw $e0;
        }
      }
    }
  }
}

$J.define(LazyActionMap, 'javax.swing.plaf.basic.LazyActionMap', { kind: 'class', sup: 'javax.swing.plaf.ActionMapUIResource', ctors: { 'java.lang.Class': '_LazyActionMap' }, meths: { 'put(java.lang.Object,javax.swing.Action)': 'put$Object$Action', 'put(javax.swing.Action)': 'put$Action' } });
$J.module(() => {
  Action = $J.load('javax.swing.Action');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
});
