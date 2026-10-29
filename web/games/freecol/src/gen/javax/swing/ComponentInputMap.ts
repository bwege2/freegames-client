// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/ComponentInputMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException } from '../../../jre/index.ts';
import { InputMap } from './InputMap.ts';

/**
 * A <code>ComponentInputMap</code> is an <code>InputMap</code>
 * associated with a particular <code>JComponent</code>.
 * The component is automatically notified whenever
 * the <code>ComponentInputMap</code> changes.
 * <code>ComponentInputMap</code>s are used for
 * <code>WHEN_IN_FOCUSED_WINDOW</code> bindings.
 *
 * @author Scott Violet
 * @since 1.3
 */
export class ComponentInputMap extends InputMap {
  /**
   * Component binding is created for.
   */
  component: JComponent = null;
  /**
   * Creates a <code>ComponentInputMap</code> associated with the
   * specified component.
   *
   * @param component  a non-null <code>JComponent</code>
   * @throws IllegalArgumentException  if <code>component</code> is null
   */
  _ComponentInputMap(component: JComponent): this {
    this._InputMap();
    this.component = component;
    if (component == null) {
      throw new IllegalArgumentException('ComponentInputMaps must be associated with a non-null JComponent');
    }
    return this;
  }
  /**
   * Sets the parent, which must be a <code>ComponentInputMap</code>
   * associated with the same component as this
   * <code>ComponentInputMap</code>.
   *
   * @param map  a <code>ComponentInputMap</code>
   *
   * @throws IllegalArgumentException  if <code>map</code>
   *         is not a <code>ComponentInputMap</code>
   *         or is not associated with the same component
   */
  setParent(map: InputMap): void {
    if (this.getParent() === map) {
      return;
    }
    if (map != null && (!(map instanceof ComponentInputMap) || (map).getComponent() !== this.getComponent())) {
      throw new IllegalArgumentException('ComponentInputMaps must have a parent ComponentInputMap associated with the same component');
    }
    super.setParent(map);
    this.getComponent().componentInputMapChanged(this);
  }
  /**
   * Returns the component the {@code InputMap} was created for.
   *
   * @return the component the {@code InputMap} was created for.
   */
  getComponent(): JComponent {
    return this.component;
  }
  /**
   * Adds a binding for <code>keyStroke</code> to <code>actionMapKey</code>.
   * If <code>actionMapKey</code> is null, this removes the current binding
   * for <code>keyStroke</code>.
   */
  put(keyStroke: KeyStroke, actionMapKey: any): void {
    super.put(keyStroke, actionMapKey);
    if (this.getComponent() != null) {
      this.getComponent().componentInputMapChanged(this);
    }
  }
  /**
   * Removes the binding for <code>key</code> from this object.
   */
  remove(key: KeyStroke): void {
    super.remove(key);
    if (this.getComponent() != null) {
      this.getComponent().componentInputMapChanged(this);
    }
  }
  /**
   * Removes all the mappings from this object.
   */
  clear(): void {
    let oldSize = this.size();
    super.clear();
    if (oldSize > 0 && this.getComponent() != null) {
      this.getComponent().componentInputMapChanged(this);
    }
  }
}

$J.define(ComponentInputMap, 'javax.swing.ComponentInputMap', { kind: 'class', sup: 'javax.swing.InputMap', ctors: { 'javax.swing.JComponent': '_ComponentInputMap' } });
