// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/UIAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2003, Oracle and/or its affiliates. All rights reserved.
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

let Action;

/**
 * UIAction is the basis of all of basic's action classes that are used in
 * an ActionMap. Subclasses need to override <code>actionPerformed</code>.
 * <p>
 * A typical subclass will look like:
 * <pre>
 *    private static class Actions extends UIAction {
 *        Actions(String name) {
 *            super(name);
 *        }
 *
 *        public void actionPerformed(ActionEvent ae) {
 *            if (getName() == "selectAll") {
 *                selectAll();
 *            }
 *            else if (getName() == "cancelEditing") {
 *                cancelEditing();
 *            }
 *        }
 *    }
 * </pre>
 * <p>
 * Subclasses that wish to conditionalize the enabled state should override
 * <code>isEnabled(Component)</code>, and be aware that the passed in
 * <code>Component</code> may be null.
 *
 * @see javax.swing.Action
 * @author Scott Violet
 */
export class UIAction extends JObject {
  name: string = null;
  _UIAction(name: string): this {
    this.name = name;
    return this;
  }
  getName(): string {
    return this.name;
  }
  getValue$String(key: string): any {
    if (key === Action.NAME) {
      return this.name;
    }
    return null;
  }
  putValue(key: string, value: any): void {
  }
  setEnabled(b: boolean): void {
  }
  /**
   * Cover method for <code>isEnabled(null)</code>.
   */
  isEnabled(): boolean {
    return this.accept(null);
  }
  /**
   * Subclasses that need to conditionalize the enabled state should
   * override this. Be aware that <code>sender</code> may be null.
   *
   * @param sender Widget enabled state is being asked for, may be null.
   */
  accept(sender: any): boolean {
    return true;
  }
  addPropertyChangeListener(listener: PropertyChangeListener): void {
  }
  removePropertyChangeListener(listener: PropertyChangeListener): void {
  }
}

$J.define(UIAction, 'sun.swing.UIAction', { kind: 'class', ifaces: ['javax.swing.Action'], sup: 'java.lang.Object', ctors: { 'java.lang.String': '_UIAction' }, meths: { 'getValue(java.lang.String)': 'getValue$String' } });
$J.module(() => {
  Action = $J.load('javax.swing.Action');
});
