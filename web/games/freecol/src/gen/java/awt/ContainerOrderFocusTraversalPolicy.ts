// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/ContainerOrderFocusTraversalPolicy.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, IllegalArgumentException, PlatformLogger, PlatformLogger_Level } from '../../../jre/index.ts';
import { FocusTraversalPolicy } from './FocusTraversalPolicy.ts';

let Container, Window;

/**
 * A FocusTraversalPolicy that determines traversal order based on the order
 * of child Components in a Container. From a particular focus cycle root, the
 * policy makes a pre-order traversal of the Component hierarchy, and traverses
 * a Container's children according to the ordering of the array returned by
 * {@code Container.getComponents()}. Portions of the hierarchy that are
 * not visible and displayable will not be searched.
 * <p>
 * By default, ContainerOrderFocusTraversalPolicy implicitly transfers focus
 * down-cycle. That is, during normal forward focus traversal, the Component
 * traversed after a focus cycle root will be the focus-cycle-root's default
 * Component to focus. This behavior can be disabled using the
 * {@code setImplicitDownCycleTraversal} method.
 * <p>
 * By default, methods of this class will return a Component only if it is
 * visible, displayable, enabled, and focusable. Subclasses can modify this
 * behavior by overriding the {@code accept} method.
 * <p>
 * This policy takes into account <a
 * href="doc-files/FocusSpec.html#FocusTraversalPolicyProviders">focus traversal
 * policy providers</a>.  When searching for first/last/next/previous Component,
 * if a focus traversal policy provider is encountered, its focus traversal
 * policy is used to perform the search operation.
 *
 * @author David Mendenhall
 *
 * @see Container#getComponents
 * @since 1.4
 */
export class ContainerOrderFocusTraversalPolicy extends FocusTraversalPolicy {
  static log: PlatformLogger = null;
  /**
   * This constant is used when the forward focus traversal order is active.
   */
  FORWARD_TRAVERSAL: number = 0;
  /**
   * This constant is used when the backward focus traversal order is active.
   */
  BACKWARD_TRAVERSAL: number = 0;
  /**
   * Whether this {@code ContainerOrderFocusTraversalPolicy} transfers focus
   * down-cycle implicitly.
   */
  implicitDownCycleTraversal: boolean = false;
  /**
   * Used by getComponentAfter and getComponentBefore for efficiency. In
   * order to maintain compliance with the specification of
   * FocusTraversalPolicy, if traversal wraps, we should invoke
   * getFirstComponent or getLastComponent. These methods may be overridden in
   * subclasses to behave in a non-generic way. However, in the generic case,
   * these methods will simply return the first or last Components of the
   * sorted list, respectively. Since getComponentAfter and
   * getComponentBefore have already built the list before determining
   * that they need to invoke getFirstComponent or getLastComponent, the
   * list should be reused if possible.
   */
  cachedRoot: Container = null;
  cachedCycle: List<Component> = null;
  /**
   * Constructs a {@code ContainerOrderFocusTraversalPolicy}.
   */
  _ContainerOrderFocusTraversalPolicy(): this {
    this._FocusTraversalPolicy();
    this.FORWARD_TRAVERSAL = 0;
    this.BACKWARD_TRAVERSAL = 1;
    this.implicitDownCycleTraversal = true;
    return this;
  }
  getFocusTraversalCycle(aContainer: Container): List<Component> {
    let cycle = new ArrayList();
    this.enumerateCycle(aContainer, cycle);
    return cycle;
  }
  getComponentIndex(cycle: List<Component>, aComponent: Component): number {
    return cycle.indexOf(aComponent);
  }
  enumerateCycle(container: Container, cycle: List<Component>): void {
    if (!(container.isVisible$() && container.isDisplayable())) {
      return;
    }
    cycle.add(container);
    let components = container.getComponents();
    for (let i = 0; i < components.length; i++) {
      let comp = components[i];
      if (comp instanceof Container) {
        let cont = comp;
        if (!cont.isFocusCycleRoot$() && !cont.isFocusTraversalPolicyProvider()) {
          this.enumerateCycle(cont, cycle);
          continue;
        }
      }
      cycle.add(comp);
    }
  }
  getTopmostProvider(focusCycleRoot: Container, aComponent: Component): Container {
    let aCont = aComponent.getParent();
    let ftp = null;
    while (aCont !== focusCycleRoot && aCont != null) {
      if (aCont.isFocusTraversalPolicyProvider()) {
        ftp = aCont;
      }
      aCont = aCont.getParent();
    }
    if (aCont == null) {
      return null;
    }
    return ftp;
  }
  getComponentDownCycle(comp: Component, traversalDirection: number): Component {
    let retComp = null;
    if (comp instanceof Container) {
      let cont = comp;
      if (cont.isFocusCycleRoot$()) {
        if (this.getImplicitDownCycleTraversal()) {
          retComp = cont.getFocusTraversalPolicy().getDefaultComponent(cont);
          if (retComp != null && ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
            ContainerOrderFocusTraversalPolicy.log.fine('### Transferred focus down-cycle to ' + $J.str(retComp) + ' in the focus cycle root ' + $J.str(cont));
          }
        } else {
          return null;
        }
      } else if (cont.isFocusTraversalPolicyProvider()) {
        retComp = (traversalDirection === this.FORWARD_TRAVERSAL ? cont.getFocusTraversalPolicy().getDefaultComponent(cont) : cont.getFocusTraversalPolicy().getLastComponent(cont));
        if (retComp != null && ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
          ContainerOrderFocusTraversalPolicy.log.fine('### Transferred focus to ' + $J.str(retComp) + ' in the FTP provider ' + $J.str(cont));
        }
      }
    }
    return retComp;
  }
  /**
   * Returns the Component that should receive the focus after aComponent.
   * aContainer must be a focus cycle root of aComponent or a focus traversal policy provider.
   * <p>
   * By default, ContainerOrderFocusTraversalPolicy implicitly transfers
   * focus down-cycle. That is, during normal forward focus traversal, the
   * Component traversed after a focus cycle root will be the focus-cycle-
   * root's default Component to focus. This behavior can be disabled using
   * the {@code setImplicitDownCycleTraversal} method.
   * <p>
   * If aContainer is <a href="doc-files/FocusSpec.html#FocusTraversalPolicyProviders">focus
   * traversal policy provider</a>, the focus is always transferred down-cycle.
   *
   * @param aContainer a focus cycle root of aComponent or a focus traversal policy provider
   * @param aComponent a (possibly indirect) child of aContainer, or
   *        aContainer itself
   * @return the Component that should receive the focus after aComponent, or
   *         null if no suitable Component can be found
   * @throws IllegalArgumentException if aContainer is not a focus cycle
   *         root of aComponent or focus traversal policy provider, or if either aContainer or
   *         aComponent is null
   */
  getComponentAfter(aContainer: Container, aComponent: Component): Component {
    if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
      ContainerOrderFocusTraversalPolicy.log.fine('### Searching in ' + $J.str(aContainer) + ' for component after ' + $J.str(aComponent));
    }
    if (aContainer == null || aComponent == null) {
      throw new IllegalArgumentException('aContainer and aComponent cannot be null');
    }
    if (!aContainer.isFocusTraversalPolicyProvider() && !aContainer.isFocusCycleRoot$()) {
      throw new IllegalArgumentException('aContainer should be focus cycle root or focus traversal policy provider');
    } else if (aContainer.isFocusCycleRoot$() && !aComponent.isFocusCycleRoot$Container(aContainer)) {
      throw new IllegalArgumentException('aContainer is not a focus cycle root of aComponent');
    }
    {
      if (!(aContainer.isVisible$() && aContainer.isDisplayable())) {
        return null;
      }
      let comp = this.getComponentDownCycle(aComponent, this.FORWARD_TRAVERSAL);
      if (comp != null && comp !== aComponent) {
        return comp;
      }
      let provider = this.getTopmostProvider(aContainer, aComponent);
      if (provider != null) {
        if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
          ContainerOrderFocusTraversalPolicy.log.fine('### Asking FTP ' + $J.str(provider) + ' for component after ' + $J.str(aComponent));
        }
        let policy = provider.getFocusTraversalPolicy();
        let afterComp = policy.getComponentAfter(provider, aComponent);
        if (afterComp != null) {
          if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
            ContainerOrderFocusTraversalPolicy.log.fine('### FTP returned ' + $J.str(afterComp));
          }
          return afterComp;
        }
        aComponent = provider;
      }
      let cycle = this.getFocusTraversalCycle(aContainer);
      if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
        ContainerOrderFocusTraversalPolicy.log.fine('### Cycle is ' + $J.str(cycle) + ', component is ' + $J.str(aComponent));
      }
      let index = this.getComponentIndex(cycle, aComponent);
      if (index < 0) {
        if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
          ContainerOrderFocusTraversalPolicy.log.fine('### Didn\'t find component ' + $J.str(aComponent) + ' in a cycle ' + $J.str(aContainer));
        }
        return this.getFirstComponent(aContainer);
      }
      for (index++; index < cycle.size(); index++) {
        comp = cycle.get(index);
        if (this.accept(comp)) {
          return comp;
        } else if ((comp = this.getComponentDownCycle(comp, this.FORWARD_TRAVERSAL)) != null) {
          return comp;
        }
      }
      if (aContainer.isFocusCycleRoot$()) {
        this.cachedRoot = aContainer;
        this.cachedCycle = cycle;
        comp = this.getFirstComponent(aContainer);
        this.cachedRoot = null;
        this.cachedCycle = null;
        return comp;
      }
    }
    return null;
  }
  /**
   * Returns the Component that should receive the focus before aComponent.
   * aContainer must be a focus cycle root of aComponent or a <a
   * href="doc-files/FocusSpec.html#FocusTraversalPolicyProviders">focus traversal policy
   * provider</a>.
   *
   * @param aContainer a focus cycle root of aComponent or focus traversal policy provider
   * @param aComponent a (possibly indirect) child of aContainer, or
   *        aContainer itself
   * @return the Component that should receive the focus before aComponent,
   *         or null if no suitable Component can be found
   * @throws IllegalArgumentException if aContainer is not a focus cycle
   *         root of aComponent or focus traversal policy provider, or if either aContainer or
   *         aComponent is null
   */
  getComponentBefore(aContainer: Container, aComponent: Component): Component {
    if (aContainer == null || aComponent == null) {
      throw new IllegalArgumentException('aContainer and aComponent cannot be null');
    }
    if (!aContainer.isFocusTraversalPolicyProvider() && !aContainer.isFocusCycleRoot$()) {
      throw new IllegalArgumentException('aContainer should be focus cycle root or focus traversal policy provider');
    } else if (aContainer.isFocusCycleRoot$() && !aComponent.isFocusCycleRoot$Container(aContainer)) {
      throw new IllegalArgumentException('aContainer is not a focus cycle root of aComponent');
    }
    {
      if (!(aContainer.isVisible$() && aContainer.isDisplayable())) {
        return null;
      }
      let provider = this.getTopmostProvider(aContainer, aComponent);
      if (provider != null) {
        if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
          ContainerOrderFocusTraversalPolicy.log.fine('### Asking FTP ' + $J.str(provider) + ' for component after ' + $J.str(aComponent));
        }
        let policy = provider.getFocusTraversalPolicy();
        let beforeComp = policy.getComponentBefore(provider, aComponent);
        if (beforeComp != null) {
          if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
            ContainerOrderFocusTraversalPolicy.log.fine('### FTP returned ' + $J.str(beforeComp));
          }
          return beforeComp;
        }
        aComponent = provider;
        if (this.accept(aComponent)) {
          return aComponent;
        }
      }
      let cycle = this.getFocusTraversalCycle(aContainer);
      if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
        ContainerOrderFocusTraversalPolicy.log.fine('### Cycle is ' + $J.str(cycle) + ', component is ' + $J.str(aComponent));
      }
      let index = this.getComponentIndex(cycle, aComponent);
      if (index < 0) {
        if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
          ContainerOrderFocusTraversalPolicy.log.fine('### Didn\'t find component ' + $J.str(aComponent) + ' in a cycle ' + $J.str(aContainer));
        }
        return this.getLastComponent(aContainer);
      }
      let comp = null;
      let tryComp = null;
      for (index--; index >= 0; index--) {
        comp = cycle.get(index);
        if (comp !== aContainer && (tryComp = this.getComponentDownCycle(comp, this.BACKWARD_TRAVERSAL)) != null) {
          return tryComp;
        } else if (this.accept(comp)) {
          return comp;
        }
      }
      if (aContainer.isFocusCycleRoot$()) {
        this.cachedRoot = aContainer;
        this.cachedCycle = cycle;
        comp = this.getLastComponent(aContainer);
        this.cachedRoot = null;
        this.cachedCycle = null;
        return comp;
      }
    }
    return null;
  }
  /**
   * Returns the first Component in the traversal cycle. This method is used
   * to determine the next Component to focus when traversal wraps in the
   * forward direction.
   *
   * @param aContainer the focus cycle root or focus traversal policy provider whose first
   *        Component is to be returned
   * @return the first Component in the traversal cycle of aContainer,
   *         or null if no suitable Component can be found
   * @throws IllegalArgumentException if aContainer is null
   */
  getFirstComponent(aContainer: Container): Component {
    let cycle: List<Component>;
    if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
      ContainerOrderFocusTraversalPolicy.log.fine('### Getting first component in ' + $J.str(aContainer));
    }
    if (aContainer == null) {
      throw new IllegalArgumentException('aContainer cannot be null');
    }
    {
      if (!(aContainer.isVisible$() && aContainer.isDisplayable())) {
        return null;
      }
      if (this.cachedRoot === aContainer) {
        cycle = this.cachedCycle;
      } else {
        cycle = this.getFocusTraversalCycle(aContainer);
      }
      if (cycle.size() === 0) {
        if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
          ContainerOrderFocusTraversalPolicy.log.fine('### Cycle is empty');
        }
        return null;
      }
      if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
        ContainerOrderFocusTraversalPolicy.log.fine('### Cycle is ' + $J.str(cycle));
      }
      for (const $it0 = cycle.iterator(); $it0.hasNext(); ) {
        let comp = $it0.next();
        if (this.accept(comp)) {
          return comp;
        } else if (comp !== aContainer && (comp = this.getComponentDownCycle(comp, this.FORWARD_TRAVERSAL)) != null) {
          return comp;
        }
      }
    }
    return null;
  }
  /**
   * Returns the last Component in the traversal cycle. This method is used
   * to determine the next Component to focus when traversal wraps in the
   * reverse direction.
   *
   * @param aContainer the focus cycle root or focus traversal policy provider whose last
   *        Component is to be returned
   * @return the last Component in the traversal cycle of aContainer,
   *         or null if no suitable Component can be found
   * @throws IllegalArgumentException if aContainer is null
   */
  getLastComponent(aContainer: Container): Component {
    let cycle: List<Component>;
    if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
      ContainerOrderFocusTraversalPolicy.log.fine('### Getting last component in ' + $J.str(aContainer));
    }
    if (aContainer == null) {
      throw new IllegalArgumentException('aContainer cannot be null');
    }
    {
      if (!(aContainer.isVisible$() && aContainer.isDisplayable())) {
        return null;
      }
      if (this.cachedRoot === aContainer) {
        cycle = this.cachedCycle;
      } else {
        cycle = this.getFocusTraversalCycle(aContainer);
      }
      if (cycle.size() === 0) {
        if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
          ContainerOrderFocusTraversalPolicy.log.fine('### Cycle is empty');
        }
        return null;
      }
      if (ContainerOrderFocusTraversalPolicy.log.isLoggable(PlatformLogger_Level.FINE)) {
        ContainerOrderFocusTraversalPolicy.log.fine('### Cycle is ' + $J.str(cycle));
      }
      for (let i = (cycle.size() - 1) | 0; i >= 0; i--) {
        let comp = cycle.get(i);
        if (this.accept(comp)) {
          return comp;
        } else if (comp instanceof Container && comp !== aContainer) {
          let cont = comp;
          if (cont.isFocusTraversalPolicyProvider()) {
            let retComp = cont.getFocusTraversalPolicy().getLastComponent(cont);
            if (retComp != null) {
              return retComp;
            }
          }
        }
      }
    }
    return null;
  }
  /**
   * Returns the default Component to focus. This Component will be the first
   * to receive focus when traversing down into a new focus traversal cycle
   * rooted at aContainer. The default implementation of this method
   * returns the same Component as {@code getFirstComponent}.
   *
   * @param aContainer the focus cycle root or focus traversal policy provider whose default
   *        Component is to be returned
   * @return the default Component in the traversal cycle of aContainer,
   *         or null if no suitable Component can be found
   * @see #getFirstComponent
   * @throws IllegalArgumentException if aContainer is null
   */
  getDefaultComponent(aContainer: Container): Component {
    return this.getFirstComponent(aContainer);
  }
  /**
   * Returns whether this ContainerOrderFocusTraversalPolicy transfers focus
   * down-cycle implicitly. If {@code true}, during normal forward focus
   * traversal, the Component traversed after a focus cycle root will be the
   * focus-cycle-root's default Component to focus. If {@code false},
   * the next Component in the focus traversal cycle rooted at the specified
   * focus cycle root will be traversed instead.
   *
   * @return whether this ContainerOrderFocusTraversalPolicy transfers focus
   *         down-cycle implicitly
   * @see #setImplicitDownCycleTraversal
   * @see #getFirstComponent
   */
  getImplicitDownCycleTraversal(): boolean {
    return this.implicitDownCycleTraversal;
  }
  /**
   * Determines whether a Component is an acceptable choice as the new
   * focus owner. By default, this method will accept a Component if and
   * only if it is visible, displayable, enabled, and focusable.
   *
   * @param aComponent the Component whose fitness as a focus owner is to
   *        be tested
   * @return {@code true} if aComponent is visible, displayable,
   *         enabled, and focusable; {@code false} otherwise
   */
  accept(aComponent: Component): boolean {
    if (!aComponent.canBeFocusOwner()) {
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
  static $clinit() {
    ContainerOrderFocusTraversalPolicy.log = PlatformLogger.getLogger('java.awt.ContainerOrderFocusTraversalPolicy');
  }
}

$J.define(ContainerOrderFocusTraversalPolicy, 'java.awt.ContainerOrderFocusTraversalPolicy', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.FocusTraversalPolicy', ctors: { '': '_ContainerOrderFocusTraversalPolicy' }, clinit: true, lazy: ['log'] });
$J.module(() => {
  Container = $J.load('java.awt.Container');
  Window = $J.load('java.awt.Window');
});
