// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/LegacyGlueFocusTraversalPolicy.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, HashMap, HashSet } from '../../../jre/index.ts';
import { FocusTraversalPolicy } from '../../java/awt/FocusTraversalPolicy.ts';

let Window;

/**
 * A FocusTraversalPolicy which provides support for legacy applications which
 * handle focus traversal via JComponent.setNextFocusableComponent or by
 * installing a custom DefaultFocusManager. If a specific traversal has not
 * been hard coded, then that traversal is provided either by the custom
 * DefaultFocusManager, or by a wrapped FocusTraversalPolicy instance.
 *
 * @author David Mendenhall
 */
export class LegacyGlueFocusTraversalPolicy extends FocusTraversalPolicy {
  delegatePolicy: FocusTraversalPolicy = null;
  delegateManager: DefaultFocusManager = null;
  forwardMap: HashMap<Component, Component> = null;
  backwardMap: HashMap<Component, Component> = null;
  $init_LegacyGlueFocusTraversalPolicy() {
    this.forwardMap = new HashMap();
    this.backwardMap = new HashMap();
  }
  _LegacyGlueFocusTraversalPolicy$FocusTraversalPolicy(delegatePolicy: FocusTraversalPolicy): this {
    this._FocusTraversalPolicy();
    this.$init_LegacyGlueFocusTraversalPolicy();
    this.delegatePolicy = delegatePolicy;
    return this;
  }
  setNextFocusableComponent(left: Component, right: Component): void {
    this.forwardMap.put(left, right);
    this.backwardMap.put(right, left);
  }
  unsetNextFocusableComponent(left: Component, right: Component): void {
    this.forwardMap.remove(left);
    this.backwardMap.remove(right);
  }
  getComponentAfter(focusCycleRoot: Container, aComponent: Component): Component {
    let hardCoded = aComponent;
    let prevHardCoded: Component;
    let sanity = new HashSet();
    do {
      prevHardCoded = hardCoded;
      hardCoded = this.forwardMap.get(hardCoded);
      if (hardCoded == null) {
        if (this.delegatePolicy != null && prevHardCoded.isFocusCycleRoot$Container(focusCycleRoot)) {
          return this.delegatePolicy.getComponentAfter(focusCycleRoot, prevHardCoded);
        } else if (this.delegateManager != null) {
          return this.delegateManager.getComponentAfter(focusCycleRoot, aComponent);
        } else {
          return null;
        }
      }
      if (sanity.contains(hardCoded)) {
        return null;
      }
      sanity.add(hardCoded);
    } while (!this.accept(hardCoded));
    return hardCoded;
  }
  getComponentBefore(focusCycleRoot: Container, aComponent: Component): Component {
    let hardCoded = aComponent;
    let prevHardCoded: Component;
    let sanity = new HashSet();
    do {
      prevHardCoded = hardCoded;
      hardCoded = this.backwardMap.get(hardCoded);
      if (hardCoded == null) {
        if (this.delegatePolicy != null && prevHardCoded.isFocusCycleRoot$Container(focusCycleRoot)) {
          return this.delegatePolicy.getComponentBefore(focusCycleRoot, prevHardCoded);
        } else if (this.delegateManager != null) {
          return this.delegateManager.getComponentBefore(focusCycleRoot, aComponent);
        } else {
          return null;
        }
      }
      if (sanity.contains(hardCoded)) {
        return null;
      }
      sanity.add(hardCoded);
    } while (!this.accept(hardCoded));
    return hardCoded;
  }
  getFirstComponent(focusCycleRoot: Container): Component {
    if (this.delegatePolicy != null) {
      return this.delegatePolicy.getFirstComponent(focusCycleRoot);
    } else if (this.delegateManager != null) {
      return this.delegateManager.getFirstComponent(focusCycleRoot);
    } else {
      return null;
    }
  }
  getLastComponent(focusCycleRoot: Container): Component {
    if (this.delegatePolicy != null) {
      return this.delegatePolicy.getLastComponent(focusCycleRoot);
    } else if (this.delegateManager != null) {
      return this.delegateManager.getLastComponent(focusCycleRoot);
    } else {
      return null;
    }
  }
  getDefaultComponent(focusCycleRoot: Container): Component {
    if (this.delegatePolicy != null) {
      return this.delegatePolicy.getDefaultComponent(focusCycleRoot);
    } else {
      return this.getFirstComponent(focusCycleRoot);
    }
  }
  accept(aComponent: Component): boolean {
    if (!(aComponent.isVisible$() && aComponent.isDisplayable() && aComponent.isFocusable() && aComponent.isEnabled())) {
      return false;
    }
    if (!(aComponent instanceof Window)) {
      for (let enableTest = aComponent.getParent(); enableTest != null; enableTest = enableTest.getParent()) {
        if (!(enableTest.isEnabled() || enableTest.isLightweight())) {
          return false;
        }
        if (enableTest instanceof Window) {
          break;
        }
      }
    }
    return true;
  }
}

$J.define(LegacyGlueFocusTraversalPolicy, 'javax.swing.LegacyGlueFocusTraversalPolicy', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.FocusTraversalPolicy', ctors: { 'javax.swing.DefaultFocusManager': '_LegacyGlueFocusTraversalPolicy$DefaultFocusManager', 'java.awt.FocusTraversalPolicy': '_LegacyGlueFocusTraversalPolicy$FocusTraversalPolicy' } });
$J.module(() => {
  Window = $J.load('java.awt.Window');
});
