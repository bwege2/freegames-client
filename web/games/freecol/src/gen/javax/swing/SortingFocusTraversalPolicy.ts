// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/SortingFocusTraversalPolicy.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AccessController, ArrayList, ClassCastException, Collections, GetPropertyAction, IllegalArgumentException, PlatformLogger, PlatformLogger_Level } from '../../../jre/index.ts';
import { InternalFrameFocusTraversalPolicy } from './InternalFrameFocusTraversalPolicy.ts';

let Container, JComponent, SwingContainerOrderFocusTraversalPolicy;

/**
 * A FocusTraversalPolicy that determines traversal order by sorting the
 * Components of a focus traversal cycle based on a given Comparator. Portions
 * of the Component hierarchy that are not visible and displayable will not be
 * included.
 * <p>
 * By default, SortingFocusTraversalPolicy implicitly transfers focus down-
 * cycle. That is, during normal focus traversal, the Component
 * traversed after a focus cycle root will be the focus-cycle-root's default
 * Component to focus. This behavior can be disabled using the
 * <code>setImplicitDownCycleTraversal</code> method.
 * <p>
 * By default, methods of this class with return a Component only if it is
 * visible, displayable, enabled, and focusable. Subclasses can modify this
 * behavior by overriding the <code>accept</code> method.
 * <p>
 * This policy takes into account <a
 * href="../../java/awt/doc-files/FocusSpec.html#FocusTraversalPolicyProviders">focus traversal
 * policy providers</a>.  When searching for first/last/next/previous Component,
 * if a focus traversal policy provider is encountered, its focus traversal
 * policy is used to perform the search operation.
 *
 * @author David Mendenhall
 *
 * @see java.util.Comparator
 * @since 1.4
 */
export class SortingFocusTraversalPolicy extends InternalFrameFocusTraversalPolicy {
  comparator: Comparator<any> = null;
  implicitDownCycleTraversal: boolean = false;
  log_: PlatformLogger = null;
  /**
   * Used by getComponentAfter and getComponentBefore for efficiency. In
   * order to maintain compliance with the specification of
   * FocusTraversalPolicy, if traversal wraps, we should invoke
   * getFirstComponent or getLastComponent. These methods may be overridden in
   * subclasses to behave in a non-generic way. However, in the generic case,
   * these methods will simply return the first or last Components of the
   * sorted list, respectively. Since getComponentAfter and
   * getComponentBefore have already built the sorted list before determining
   * that they need to invoke getFirstComponent or getLastComponent, the
   * sorted list should be reused if possible.
   */
  cachedRoot: Container = null;
  cachedCycle: List<Component> = null;
  static fitnessTestPolicy: SwingContainerOrderFocusTraversalPolicy = null;
  FORWARD_TRAVERSAL: number = 0;
  BACKWARD_TRAVERSAL: number = 0;
  static legacySortingFTPEnabled: boolean = false;
  $init_SortingFocusTraversalPolicy() {
    this.implicitDownCycleTraversal = true;
    this.log_ = PlatformLogger.getLogger('javax.swing.SortingFocusTraversalPolicy');
    this.FORWARD_TRAVERSAL = 0;
    this.BACKWARD_TRAVERSAL = 1;
  }
  /**
   * Constructs a SortingFocusTraversalPolicy without a Comparator.
   * Subclasses must set the Comparator using <code>setComparator</code>
   * before installing this FocusTraversalPolicy on a focus cycle root or
   * KeyboardFocusManager.
   */
  _SortingFocusTraversalPolicy$(): this {
    this._InternalFrameFocusTraversalPolicy();
    this.$init_SortingFocusTraversalPolicy();
    return this;
  }
  /**
   * Constructs a SortingFocusTraversalPolicy with the specified Comparator.
   *
   * @param comparator the {@code Comparator} to sort by
   */
  _SortingFocusTraversalPolicy$Comparator(comparator: Comparator<any>): this {
    this._InternalFrameFocusTraversalPolicy();
    this.$init_SortingFocusTraversalPolicy();
    this.comparator = comparator;
    return this;
  }
  getFocusTraversalCycle(aContainer: Container): List<Component> {
    let cycle = new ArrayList();
    this.enumerateAndSortCycle(aContainer, cycle);
    return cycle;
  }
  getComponentIndex(cycle: List<Component>, aComponent: Component): number {
    let index: number;
    try {
      index = Collections.binarySearch(cycle, aComponent, this.comparator);
    } catch ($e0) {
      if ($J.isa($e0, ClassCastException)) {
        let e = $J.exc($e0);
        if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
          this.log_.fine('### During the binary search for ' + $J.str(aComponent) + ' the exception occurred: ', e);
        }
        return -1;
      } else {
        throw $e0;
      }
    }
    if (index < 0) {
      index = cycle.indexOf(aComponent);
    }
    return index;
  }
  enumerateAndSortCycle(focusCycleRoot: Container, cycle: List<Component>): void {
    if (focusCycleRoot.isShowing()) {
      this.enumerateCycle(focusCycleRoot, cycle);
      if (SortingFocusTraversalPolicy.legacySortingFTPEnabled) {
        this.legacySort(cycle, this.comparator);
      } else {
        cycle.sort(this.comparator);
      }
    }
  }
  legacySort(l: List<Component>, c: Comparator<any>): void {
    if (c != null && l.size() > 1) {
      let a = $J.toArrayInto(l.toArray(), $J.newArray(l.size(), null));
      this.mergeSort(a.slice(), a, 0, a.length, 0, c);
      let i = l.listIterator();
      for (let e of a) {
        i.next();
        i.set(e);
      }
    }
  }
  enumerateCycle(container: Container, cycle: List<Component>): void {
    if (!(container.isVisible$() && container.isDisplayable())) {
      return;
    }
    cycle.add(container);
    let components = container.getComponents();
    for (let comp of components) {
      if (comp instanceof Container) {
        let cont = comp;
        if (!cont.isFocusCycleRoot$() && !cont.isFocusTraversalPolicyProvider() && !((cont instanceof JComponent) && (cont).isManagingFocus())) {
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
          if (retComp != null && this.log_.isLoggable(PlatformLogger_Level.FINE)) {
            this.log_.fine('### Transferred focus down-cycle to ' + $J.str(retComp) + ' in the focus cycle root ' + $J.str(cont));
          }
        } else {
          return null;
        }
      } else if (cont.isFocusTraversalPolicyProvider()) {
        retComp = (traversalDirection === this.FORWARD_TRAVERSAL ? cont.getFocusTraversalPolicy().getDefaultComponent(cont) : cont.getFocusTraversalPolicy().getLastComponent(cont));
        if (retComp != null && this.log_.isLoggable(PlatformLogger_Level.FINE)) {
          this.log_.fine('### Transferred focus to ' + $J.str(retComp) + ' in the FTP provider ' + $J.str(cont));
        }
      }
    }
    return retComp;
  }
  /**
   * Returns the Component that should receive the focus after aComponent.
   * aContainer must be a focus cycle root of aComponent or a focus traversal policy provider.
   * <p>
   * By default, SortingFocusTraversalPolicy implicitly transfers focus down-
   * cycle. That is, during normal focus traversal, the Component
   * traversed after a focus cycle root will be the focus-cycle-root's
   * default Component to focus. This behavior can be disabled using the
   * <code>setImplicitDownCycleTraversal</code> method.
   * <p>
   * If aContainer is <a href="../../java/awt/doc-files/FocusSpec.html#FocusTraversalPolicyProviders">focus
   * traversal policy provider</a>, the focus is always transferred down-cycle.
   *
   * @param aContainer a focus cycle root of aComponent or a focus traversal policy provider
   * @param aComponent a (possibly indirect) child of aContainer, or
   *        aContainer itself
   * @return the Component that should receive the focus after aComponent, or
   *         null if no suitable Component can be found
   * @throws IllegalArgumentException if aContainer is not a focus cycle
   *         root of aComponent or a focus traversal policy provider, or if either aContainer or
   *         aComponent is null
   */
  getComponentAfter(aContainer: Container, aComponent: Component): Component {
    if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
      this.log_.fine('### Searching in ' + $J.str(aContainer) + ' for component after ' + $J.str(aComponent));
    }
    if (aContainer == null || aComponent == null) {
      throw new IllegalArgumentException('aContainer and aComponent cannot be null');
    }
    if (!aContainer.isFocusTraversalPolicyProvider() && !aContainer.isFocusCycleRoot$()) {
      throw new IllegalArgumentException('aContainer should be focus cycle root or focus traversal policy provider');
    } else if (aContainer.isFocusCycleRoot$() && !aComponent.isFocusCycleRoot$Container(aContainer)) {
      throw new IllegalArgumentException('aContainer is not a focus cycle root of aComponent');
    }
    let comp = this.getComponentDownCycle(aComponent, this.FORWARD_TRAVERSAL);
    if (comp != null) {
      return comp;
    }
    let provider = this.getTopmostProvider(aContainer, aComponent);
    if (provider != null) {
      if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
        this.log_.fine('### Asking FTP ' + $J.str(provider) + ' for component after ' + $J.str(aComponent));
      }
      let policy = provider.getFocusTraversalPolicy();
      let afterComp = policy.getComponentAfter(provider, aComponent);
      if (afterComp != null) {
        if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
          this.log_.fine('### FTP returned ' + $J.str(afterComp));
        }
        return afterComp;
      }
      aComponent = provider;
    }
    let cycle = this.getFocusTraversalCycle(aContainer);
    if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
      this.log_.fine('### Cycle is ' + $J.str(cycle) + ', component is ' + $J.str(aComponent));
    }
    let index = this.getComponentIndex(cycle, aComponent);
    if (index < 0) {
      if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
        this.log_.fine('### Didn\'t find component ' + $J.str(aComponent) + ' in a cycle ' + $J.str(aContainer));
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
    return null;
  }
  /**
   * Returns the Component that should receive the focus before aComponent.
   * aContainer must be a focus cycle root of aComponent or a focus traversal policy provider.
   * <p>
   * By default, SortingFocusTraversalPolicy implicitly transfers focus down-
   * cycle. That is, during normal focus traversal, the Component
   * traversed after a focus cycle root will be the focus-cycle-root's
   * default Component to focus. This behavior can be disabled using the
   * <code>setImplicitDownCycleTraversal</code> method.
   * <p>
   * If aContainer is <a href="../../java/awt/doc-files/FocusSpec.html#FocusTraversalPolicyProviders">focus
   * traversal policy provider</a>, the focus is always transferred down-cycle.
   *
   * @param aContainer a focus cycle root of aComponent or a focus traversal policy provider
   * @param aComponent a (possibly indirect) child of aContainer, or
   *        aContainer itself
   * @return the Component that should receive the focus before aComponent,
   *         or null if no suitable Component can be found
   * @throws IllegalArgumentException if aContainer is not a focus cycle
   *         root of aComponent or a focus traversal policy provider, or if either aContainer or
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
    let provider = this.getTopmostProvider(aContainer, aComponent);
    if (provider != null) {
      if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
        this.log_.fine('### Asking FTP ' + $J.str(provider) + ' for component after ' + $J.str(aComponent));
      }
      let policy = provider.getFocusTraversalPolicy();
      let beforeComp = policy.getComponentBefore(provider, aComponent);
      if (beforeComp != null) {
        if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
          this.log_.fine('### FTP returned ' + $J.str(beforeComp));
        }
        return beforeComp;
      }
      aComponent = provider;
      if (this.accept(aComponent)) {
        return aComponent;
      }
    }
    let cycle = this.getFocusTraversalCycle(aContainer);
    if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
      this.log_.fine('### Cycle is ' + $J.str(cycle) + ', component is ' + $J.str(aComponent));
    }
    let index = this.getComponentIndex(cycle, aComponent);
    if (index < 0) {
      if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
        this.log_.fine('### Didn\'t find component ' + $J.str(aComponent) + ' in a cycle ' + $J.str(aContainer));
      }
      return this.getLastComponent(aContainer);
    }
    let comp: Component;
    let tryComp: Component;
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
    return null;
  }
  /**
   * Returns the first Component in the traversal cycle. This method is used
   * to determine the next Component to focus when traversal wraps in the
   * forward direction.
   *
   * @param aContainer a focus cycle root of aComponent or a focus traversal policy provider whose
   *        first Component is to be returned
   * @return the first Component in the traversal cycle of aContainer,
   *         or null if no suitable Component can be found
   * @throws IllegalArgumentException if aContainer is null
   */
  getFirstComponent(aContainer: Container): Component {
    let cycle: List<Component>;
    if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
      this.log_.fine('### Getting first component in ' + $J.str(aContainer));
    }
    if (aContainer == null) {
      throw new IllegalArgumentException('aContainer cannot be null');
    }
    if (this.cachedRoot === aContainer) {
      cycle = this.cachedCycle;
    } else {
      cycle = this.getFocusTraversalCycle(aContainer);
    }
    if (cycle.size() === 0) {
      if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
        this.log_.fine('### Cycle is empty');
      }
      return null;
    }
    if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
      this.log_.fine('### Cycle is ' + $J.str(cycle));
    }
    for (const $it1 = cycle.iterator(); $it1.hasNext(); ) {
      let comp = $it1.next();
      if (this.accept(comp)) {
        return comp;
      } else if (comp !== aContainer && (comp = this.getComponentDownCycle(comp, this.FORWARD_TRAVERSAL)) != null) {
        return comp;
      }
    }
    return null;
  }
  /**
   * Returns the last Component in the traversal cycle. This method is used
   * to determine the next Component to focus when traversal wraps in the
   * reverse direction.
   *
   * @param aContainer a focus cycle root of aComponent or a focus traversal policy provider whose
   *        last Component is to be returned
   * @return the last Component in the traversal cycle of aContainer,
   *         or null if no suitable Component can be found
   * @throws IllegalArgumentException if aContainer is null
   */
  getLastComponent(aContainer: Container): Component {
    let cycle: List<Component>;
    if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
      this.log_.fine('### Getting last component in ' + $J.str(aContainer));
    }
    if (aContainer == null) {
      throw new IllegalArgumentException('aContainer cannot be null');
    }
    if (this.cachedRoot === aContainer) {
      cycle = this.cachedCycle;
    } else {
      cycle = this.getFocusTraversalCycle(aContainer);
    }
    if (cycle.size() === 0) {
      if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
        this.log_.fine('### Cycle is empty');
      }
      return null;
    }
    if (this.log_.isLoggable(PlatformLogger_Level.FINE)) {
      this.log_.fine('### Cycle is ' + $J.str(cycle));
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
    return null;
  }
  /**
   * Returns the default Component to focus. This Component will be the first
   * to receive focus when traversing down into a new focus traversal cycle
   * rooted at aContainer. The default implementation of this method
   * returns the same Component as <code>getFirstComponent</code>.
   *
   * @param aContainer a focus cycle root of aComponent or a focus traversal policy provider whose
   *        default Component is to be returned
   * @return the default Component in the traversal cycle of aContainer,
   *         or null if no suitable Component can be found
   * @see #getFirstComponent
   * @throws IllegalArgumentException if aContainer is null
   */
  getDefaultComponent(aContainer: Container): Component {
    return this.getFirstComponent(aContainer);
  }
  /**
   * Sets whether this SortingFocusTraversalPolicy transfers focus down-cycle
   * implicitly. If <code>true</code>, during normal focus traversal,
   * the Component traversed after a focus cycle root will be the focus-
   * cycle-root's default Component to focus. If <code>false</code>, the
   * next Component in the focus traversal cycle rooted at the specified
   * focus cycle root will be traversed instead. The default value for this
   * property is <code>true</code>.
   *
   * @param implicitDownCycleTraversal whether this
   *        SortingFocusTraversalPolicy transfers focus down-cycle implicitly
   * @see #getImplicitDownCycleTraversal
   * @see #getFirstComponent
   */
  setImplicitDownCycleTraversal(implicitDownCycleTraversal: boolean): void {
    this.implicitDownCycleTraversal = implicitDownCycleTraversal;
  }
  /**
   * Returns whether this SortingFocusTraversalPolicy transfers focus down-
   * cycle implicitly. If <code>true</code>, during normal focus
   * traversal, the Component traversed after a focus cycle root will be the
   * focus-cycle-root's default Component to focus. If <code>false</code>,
   * the next Component in the focus traversal cycle rooted at the specified
   * focus cycle root will be traversed instead.
   *
   * @return whether this SortingFocusTraversalPolicy transfers focus down-
   *         cycle implicitly
   * @see #setImplicitDownCycleTraversal
   * @see #getFirstComponent
   */
  getImplicitDownCycleTraversal(): boolean {
    return this.implicitDownCycleTraversal;
  }
  /**
   * Returns the Comparator which will be used to sort the Components in a
   * focus traversal cycle.
   *
   * @return the Comparator which will be used for sorting
   */
  getComparator(): Comparator<any> {
    return this.comparator;
  }
  /**
   * Determines whether a Component is an acceptable choice as the new
   * focus owner. By default, this method will accept a Component if and
   * only if it is visible, displayable, enabled, and focusable.
   *
   * @param aComponent the Component whose fitness as a focus owner is to
   *        be tested
   * @return <code>true</code> if aComponent is visible, displayable,
   *         enabled, and focusable; <code>false</code> otherwise
   */
  accept(aComponent: Component): boolean {
    return SortingFocusTraversalPolicy.fitnessTestPolicy.accept(aComponent);
  }
  mergeSort<T>(src: T[], dest: T[], low: number, high: number, off: number, c: Comparator<any>): void {
    let length = (high - low) | 0;
    if (length < 7) {
      for (let i = low; i < high; i++) {
        for (let j = i; j > low && c(dest[(j - 1) | 0], dest[j]) > 0; j--) {
          let t = dest[j];
          dest[j] = dest[(j - 1) | 0];
          (dest[(j - 1) | 0]) = t;
        }
      }
      return;
    }
    let destLow = low;
    let destHigh = high;
    low = (low + off) | 0;
    high = (high + off) | 0;
    let mid = ((low + high) | 0) >>> 1;
    this.mergeSort(dest, src, low, mid, -off, c);
    this.mergeSort(dest, src, mid, high, -off, c);
    if (c(src[(mid - 1) | 0], src[mid]) <= 0) {
      $J.system_arraycopy(src, low, dest, destLow, length);
      return;
    }
    for (let i = destLow, p = low, q = mid; i < destHigh; i++) {
      if (q >= high || p < mid && c(src[p], src[q]) <= 0) {
        dest[i] = src[p++];
      } else {
        dest[i] = src[q++];
      }
    }
  }
  static $clinit() {
    SortingFocusTraversalPolicy.fitnessTestPolicy = new SwingContainerOrderFocusTraversalPolicy()._SwingContainerOrderFocusTraversalPolicy();
    SortingFocusTraversalPolicy.legacySortingFTPEnabled = $J.equals('true', AccessController.doPrivileged(new GetPropertyAction('swing.legacySortingFTPEnabled', 'true')));
  }
}

$J.define(SortingFocusTraversalPolicy, 'javax.swing.SortingFocusTraversalPolicy', { kind: 'class', sup: 'javax.swing.InternalFrameFocusTraversalPolicy', ctors: { 'java.util.Comparator': '_SortingFocusTraversalPolicy$Comparator', '': '_SortingFocusTraversalPolicy$' }, clinit: true, lazy: ['fitnessTestPolicy', 'legacySortingFTPEnabled'] });
$J.module(() => {
  Container = $J.load('java.awt.Container');
  JComponent = $J.load('javax.swing.JComponent');
  SwingContainerOrderFocusTraversalPolicy = $J.load('javax.swing.SwingContainerOrderFocusTraversalPolicy');
});
