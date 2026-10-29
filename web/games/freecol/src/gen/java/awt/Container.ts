// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Container.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, ArrayIndexOutOfBoundsException, ArrayList, ContainerPeer, GetBooleanAction, HashSet, IllegalArgumentException, IllegalStateException, IndexOutOfBoundsException, JObject, JString, LightweightPeer, PlatformLogger, PlatformLogger_Level, Region, Thread, Toolkit } from '../../../jre/index.ts';
import { Component } from './Component.ts';
import { Component$AccessibleAWTComponent } from './Component.ts';

let AWTEvent, AWTEventMulticaster, DefaultFocusTraversalPolicy, Dimension, GraphicsCallback$PaintCallback, GraphicsCallback$PrintCallback, GraphicsCallback$PrintHeavyweightComponentsCallback, GraphicsEnvironment, Insets, KeyboardFocusManager, LayoutManager2, LightweightDispatcher, Point, Window, ComponentEvent, ContainerEvent, ContainerListener, FocusEvent$Cause, HierarchyEvent, Accessible, AWTAccessor, SunGraphicsCallback;

/**
 * A generic Abstract Window Toolkit(AWT) container object is a component
 * that can contain other AWT components.
 * <p>
 * Components added to a container are tracked in a list.  The order
 * of the list will define the components' front-to-back stacking order
 * within the container.  If no index is specified when adding a
 * component to a container, it will be added to the end of the list
 * (and hence to the bottom of the stacking order).
 * <p>
 * <b>Note</b>: For details on the focus subsystem, see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
 * How to Use the Focus Subsystem</a>,
 * a section in <em>The Java Tutorial</em>, and the
 * <a href="doc-files/FocusSpec.html">Focus Specification</a>
 * for more information.
 *
 * @author      Arthur van Hoff
 * @author      Sami Shaio
 * @see       #add(java.awt.Component, int)
 * @see       #getComponent(int)
 * @see       LayoutManager
 * @since     1.0
 */
export class Container extends Component {
  static log: PlatformLogger = null;
  static eventLog: PlatformLogger = null;
  static EMPTY_ARRAY: Component[] = null;
  /**
   * The components in this container.
   * @see #add
   * @see #getComponents
   */
  component: List<Component> = null;
  /**
   * Layout manager for this container.
   * @see #doLayout
   * @see #setLayout
   * @see #getLayout
   */
  layoutMgr: LayoutManager = null;
  /**
   * Event router for lightweight components.  If this container
   * is native, this dispatcher takes care of forwarding and
   * retargeting the events to lightweight components contained
   * (if any).
   */
  dispatcher: LightweightDispatcher = null;
  /**
   * The focus traversal policy that will manage keyboard traversal of this
   * Container's children, if this Container is a focus cycle root. If the
   * value is null, this Container inherits its policy from its focus-cycle-
   * root ancestor. If all such ancestors of this Container have null
   * policies, then the current KeyboardFocusManager's default policy is
   * used. If the value is non-null, this policy will be inherited by all
   * focus-cycle-root children that have no keyboard-traversal policy of
   * their own (as will, recursively, their focus-cycle-root children).
   * <p>
   * If this Container is not a focus cycle root, the value will be
   * remembered, but will not be used or inherited by this or any other
   * Containers until this Container is made a focus cycle root.
   *
   * @see #setFocusTraversalPolicy
   * @see #getFocusTraversalPolicy
   * @since 1.4
   */
  focusTraversalPolicy: FocusTraversalPolicy = null;
  /**
   * Indicates whether this Component is the root of a focus traversal cycle.
   * Once focus enters a traversal cycle, typically it cannot leave it via
   * focus traversal unless one of the up- or down-cycle keys is pressed.
   * Normal traversal is limited to this Container, and all of this
   * Container's descendants that are not descendants of inferior focus cycle
   * roots.
   *
   * @see #setFocusCycleRoot
   * @see #isFocusCycleRoot
   * @since 1.4
   */
  focusCycleRoot: boolean = false;
  /**
   * Stores the value of focusTraversalPolicyProvider property.
   * @since 1.5
   * @see #setFocusTraversalPolicyProvider
   */
  focusTraversalPolicyProvider: boolean = false;
  printingThreads: JSet<Thread> = null;
  printing: boolean = false;
  containerListener: ContainerListener = null;
  listeningChildren: number = 0;
  listeningBoundsChildren: number = 0;
  descendantsCount: number = 0;
  preserveBackgroundColor: Color = null;
  /**
   * A constant which toggles one of the controllable behaviors
   * of {@code getMouseEventTarget}. It is used to specify whether
   * the method can return the Container on which it is originally called
   * in case if none of its children are the current mouse event targets.
   *
   * @see #getMouseEventTarget(int, int, boolean)
   */
  static readonly INCLUDE_SELF: boolean = true;
  /**
   * A constant which toggles one of the controllable behaviors
   * of {@code getMouseEventTarget}. It is used to specify whether
   * the method should search only lightweight components.
   *
   * @see #getMouseEventTarget(int, int, boolean)
   */
  static readonly SEARCH_HEAVYWEIGHTS: boolean = true;
  numOfHWComponents: number = 0;
  numOfLWComponents: number = 0;
  static mixingLog: PlatformLogger = null;
  static isJavaAwtSmartInvalidate: boolean = false;
  /**
   * Indicates whether valid containers should also traverse their
   * children and call the validateTree() method on them.
   *
   * Synchronization: TreeLock.
   *
   * The field is allowed to be static as long as the TreeLock itself is
   * static.
   *
   * @see #validateUnconditionally()
   */
  static descendUnconditionallyWhenValidating: boolean = false;
  modalComp: Component = null;
  modalAppContext: AppContext = null;
  /**
   * Container Serial Data Version.
   */
  containerSerializedDataVersion: number = 0;
  /**
   * Constructs a new Container. Containers can be extended directly,
   * but are lightweight in this case and must be contained by a parent
   * somewhere higher up in the component tree that is native.
   * (such as Frame for example).
   */
  _Container(): this {
    this._Component();
    this.component = new ArrayList();
    this.focusCycleRoot = false;
    this.printing = false;
    this.preserveBackgroundColor = null;
    this.numOfHWComponents = 0;
    this.numOfLWComponents = 0;
    this.containerSerializedDataVersion = 1;
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Container', 'initIDs', this, $a);
  }
  initializeFocusTraversalKeys(): void {
    this.focusTraversalKeys = $J.newArray(4, null);
  }
  /**
   * Gets the number of components in this panel.
   * <p>
   * Note: This method should be called under AWT tree lock.
   *
   * @return    the number of components in this panel.
   * @see       #getComponent
   * @since     1.1
   * @see Component#getTreeLock()
   */
  getComponentCount(): number {
    return this.countComponents();
  }
  /**
   * Returns the number of components in this container.
   *
   * @return the number of components in this container
   * @deprecated As of JDK version 1.1,
   * replaced by getComponentCount().
   */
  countComponents(): number {
    return this.component.size();
  }
  /**
   * Gets the nth component in this container.
   * <p>
   * Note: This method should be called under AWT tree lock.
   *
   * @param      n   the index of the component to get.
   * @return     the n<sup>th</sup> component in this container.
   * @throws  ArrayIndexOutOfBoundsException
   *                 if the n<sup>th</sup> value does not exist.
   * @see Component#getTreeLock()
   */
  getComponent$int(n: number): Component {
    try {
      return this.component.get(n);
    } catch ($e0) {
      if ($J.isa($e0, IndexOutOfBoundsException)) {
        let z = $J.exc($e0);
        throw new ArrayIndexOutOfBoundsException('No such child: ' + n);
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Gets all the components in this container.
   * <p>
   * Note: This method should be called under AWT tree lock.
   *
   * @return    an array of all the components in this container.
   * @see Component#getTreeLock()
   */
  getComponents(): Component[] {
    return this.getComponents_NoClientCode();
  }
  getComponents_NoClientCode(): Component[] {
    return $J.toArrayInto(this.component.toArray(), Container.EMPTY_ARRAY);
  }
  getComponentsSync(): Component[] {
    {
      return this.getComponents();
    }
  }
  /**
   * Determines the insets of this container, which indicate the size
   * of the container's border.
   * <p>
   * A {@code Frame} object, for example, has a top inset that
   * corresponds to the height of the frame's title bar.
   * @return    the insets of this container.
   * @see       Insets
   * @see       LayoutManager
   * @since     1.1
   */
  getInsets$(): Insets {
    return this.insets();
  }
  /**
   * Returns the insets for this container.
   *
   * @deprecated As of JDK version 1.1,
   * replaced by {@code getInsets()}.
   * @return the insets for this container
   */
  insets(): Insets {
    let peer = this.peer;
    if ($J.isa(peer, ContainerPeer)) {
      let cpeer = peer;
      return cpeer.getInsets().clone();
    }
    return new Insets()._Insets(0, 0, 0, 0);
  }
  /**
   * Appends the specified component to the end of this container.
   * This is a convenience method for {@link #addImpl}.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy. If the container has already been
   * displayed, the hierarchy must be validated thereafter in order to
   * display the added component.
   *
   * @param     comp   the component to be added
   * @throws NullPointerException if {@code comp} is {@code null}
   * @see #addImpl
   * @see #invalidate
   * @see #validate
   * @see javax.swing.JComponent#revalidate()
   * @return    the component argument
   */
  add$Component(comp: Component): Component {
    this.addImpl(comp, null, -1);
    return comp;
  }
  /**
   * Adds the specified component to this container.
   * This is a convenience method for {@link #addImpl}.
   * <p>
   * This method is obsolete as of 1.1.  Please use the
   * method {@code add(Component, Object)} instead.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy. If the container has already been
   * displayed, the hierarchy must be validated thereafter in order to
   * display the added component.
   *
   * @param  name the name of the component to be added
   * @param  comp the component to be added
   * @return the component added
   * @throws NullPointerException if {@code comp} is {@code null}
   * @see #add(Component, Object)
   * @see #invalidate
   */
  add$String$Component(name: string, comp: Component): Component {
    this.addImpl(comp, name, -1);
    return comp;
  }
  /**
   * Adds the specified component to this container at the given
   * position.
   * This is a convenience method for {@link #addImpl}.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy. If the container has already been
   * displayed, the hierarchy must be validated thereafter in order to
   * display the added component.
   *
   *
   * @param     comp   the component to be added
   * @param     index    the position at which to insert the component,
   *                   or {@code -1} to append the component to the end
   * @throws NullPointerException if {@code comp} is {@code null}
   * @throws IllegalArgumentException if {@code index} is invalid (see
   *            {@link #addImpl} for details)
   * @return    the component {@code comp}
   * @see #addImpl
   * @see #remove
   * @see #invalidate
   * @see #validate
   * @see javax.swing.JComponent#revalidate()
   */
  add$Component$int(comp: Component, index: number): Component {
    this.addImpl(comp, null, index);
    return comp;
  }
  /**
   * Checks that the component
   * isn't supposed to be added into itself.
   */
  checkAddToSelf(comp: Component): void {
    if (comp instanceof Container) {
      for (let cn = this; cn != null; cn = cn.parent) {
        if (cn === comp) {
          throw new IllegalArgumentException('adding container\'s parent to itself');
        }
      }
    }
  }
  /**
   * Checks that the component is not a Window instance.
   */
  checkNotAWindow(comp: Component): void {
    if (comp instanceof Window) {
      throw new IllegalArgumentException('adding a window to a container');
    }
  }
  /**
   * Checks that the component comp can be added to this container
   * Checks :  index in bounds of container's size,
   * comp is not one of this container's parents,
   * and comp is not a window.
   * Comp and container must be on the same GraphicsDevice.
   * if comp is container, all sub-components must be on
   * same GraphicsDevice.
   *
   * @since 1.5
   */
  checkAdding(comp: Component, index: number): void {
    this.checkTreeLock();
    let thisGC = this.getGraphicsConfiguration();
    if (index > this.component.size() || index < 0) {
      throw new IllegalArgumentException('illegal component position');
    }
    if (comp.parent === this) {
      if (index === this.component.size()) {
        throw new IllegalArgumentException('illegal component position ' + index + ' should be less than ' + this.component.size());
      }
    }
    this.checkAddToSelf(comp);
    this.checkNotAWindow(comp);
    let thisTopLevel = this.getContainingWindow();
    let compTopLevel = comp.getContainingWindow();
    if (thisTopLevel !== compTopLevel) {
      throw new IllegalArgumentException('component and container should be in the same top-level window');
    }
    if (thisGC != null) {
      comp.checkGD(thisGC.getDevice().getIDstring());
    }
  }
  /**
   * Removes component comp from this container without making unnecessary changes
   * and generating unnecessary events. This function intended to perform optimized
   * remove, for example, if newParent and current parent are the same it just changes
   * index without calling removeNotify.
   * Note: Should be called while holding treeLock
   * Returns whether removeNotify was invoked
   * @since: 1.5
   */
  removeDelicately(comp: Component, newParent: Container, newIndex: number): boolean {
    this.checkTreeLock();
    let index = this.getComponentZOrder(comp);
    let needRemoveNotify = Container.isRemoveNotifyNeeded(comp, this, newParent);
    if (needRemoveNotify) {
      comp.removeNotify();
    }
    if (newParent !== this) {
      if (this.layoutMgr != null) {
        this.layoutMgr.removeLayoutComponent(comp);
      }
      this.adjustListeningChildren(AWTEvent.HIERARCHY_EVENT_MASK, -comp.numListening(AWTEvent.HIERARCHY_EVENT_MASK));
      this.adjustListeningChildren(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK, -comp.numListening(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK));
      this.adjustDescendants(-(comp.countHierarchyMembers()));
      comp.parent = null;
      if (needRemoveNotify) {
        comp.setGraphicsConfiguration(null);
      }
      this.component.removeAt(index);
      this.invalidateIfValid();
    } else {
      this.component.removeAt(index);
      this.component.add(newIndex, comp);
    }
    if (comp.parent == null) {
      if (this.containerListener != null || ($J.land(this.eventMask, AWTEvent.CONTAINER_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.CONTAINER_EVENT_MASK)) {
        let e = new ContainerEvent()._ContainerEvent(this, ContainerEvent.COMPONENT_REMOVED, comp);
        this.dispatchEvent(e);
      }
      comp.createHierarchyEvents(HierarchyEvent.HIERARCHY_CHANGED, comp, this, HierarchyEvent.PARENT_CHANGED, Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_EVENT_MASK));
      if (this.peer != null && this.layoutMgr == null && this.isVisible$()) {
        this.updateCursorImmediately();
      }
    }
    return needRemoveNotify;
  }
  /**
   * Checks whether this container can contain component which is focus owner.
   * Verifies that container is enable and showing, and if it is focus cycle root
   * its FTP allows component to be focus owner
   * @since 1.5
   */
  canContainFocusOwner(focusOwnerCandidate: Component): boolean {
    if (!(this.isEnabled() && this.isDisplayable() && this.isVisible$() && this.isFocusable())) {
      return false;
    }
    if (this.isFocusCycleRoot$()) {
      let policy = this.getFocusTraversalPolicy();
      if (policy instanceof DefaultFocusTraversalPolicy) {
        if (!(policy).accept(focusOwnerCandidate)) {
          return false;
        }
      }
    }
    {
      if (this.parent != null) {
        return this.parent.canContainFocusOwner(focusOwnerCandidate);
      }
    }
    return true;
  }
  /**
   * Checks whether or not this container has heavyweight children.
   * Note: Should be called while holding tree lock
   * @return true if there is at least one heavyweight children in a container, false otherwise
   * @since 1.5
   */
  hasHeavyweightDescendants(): boolean {
    this.checkTreeLock();
    return this.numOfHWComponents > 0;
  }
  /**
   * Checks whether or not this container has lightweight children.
   * Note: Should be called while holding tree lock
   * @return true if there is at least one lightweight children in a container, false otherwise
   * @since 1.7
   */
  hasLightweightDescendants(): boolean {
    this.checkTreeLock();
    return this.numOfLWComponents > 0;
  }
  /**
   * Returns closest heavyweight component to this container. If this container is heavyweight
   * returns this.
   * @since 1.5
   */
  getHeavyweightContainer(): Container {
    this.checkTreeLock();
    if (this.peer != null && !($J.isa(this.peer, LightweightPeer))) {
      return this;
    } else {
      return this.getNativeContainer();
    }
  }
  /**
   * Detects whether or not remove from current parent and adding to new parent requires call of
   * removeNotify on the component. Since removeNotify destroys native window this might (not)
   * be required. For example, if new container and old containers are the same we don't need to
   * destroy native window.
   * @since: 1.5
   */
  static isRemoveNotifyNeeded(comp: Component, oldContainer: Container, newContainer: Container): boolean {
    if (oldContainer == null) {
      return false;
    }
    if (comp.peer == null) {
      return false;
    }
    if (newContainer.peer == null) {
      return true;
    }
    if (comp.isLightweight()) {
      let isContainer = comp instanceof Container;
      if (!isContainer || (isContainer && !(comp).hasHeavyweightDescendants())) {
        return false;
      }
    }
    let newNativeContainer = oldContainer.getHeavyweightContainer();
    let oldNativeContainer = newContainer.getHeavyweightContainer();
    if (newNativeContainer !== oldNativeContainer) {
      return !comp.peer.isReparentSupported();
    } else {
      return false;
    }
  }
  /**
   * Moves the specified component to the specified z-order index in
   * the container. The z-order determines the order that components
   * are painted; the component with the highest z-order paints first
   * and the component with the lowest z-order paints last.
   * Where components overlap, the component with the lower
   * z-order paints over the component with the higher z-order.
   * <p>
   * If the component is a child of some other container, it is
   * removed from that container before being added to this container.
   * The important difference between this method and
   * {@code java.awt.Container.add(Component, int)} is that this method
   * doesn't call {@code removeNotify} on the component while
   * removing it from its previous container unless necessary and when
   * allowed by the underlying native windowing system. This way, if the
   * component has the keyboard focus, it maintains the focus when
   * moved to the new position.
   * <p>
   * This property is guaranteed to apply only to lightweight
   * non-{@code Container} components.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   * <p>
   * <b>Note</b>: Not all platforms support changing the z-order of
   * heavyweight components from one container into another without
   * the call to {@code removeNotify}. There is no way to detect
   * whether a platform supports this, so developers shouldn't make
   * any assumptions.
   *
   * @param     comp the component to be moved
   * @param     index the position in the container's list to
   *            insert the component, where {@code getComponentCount()}
   *            appends to the end
   * @throws NullPointerException if {@code comp} is
   *            {@code null}
   * @throws IllegalArgumentException if {@code comp} is one of the
   *            container's parents
   * @throws IllegalArgumentException if {@code index} is not in
   *            the range {@code [0, getComponentCount()]} for moving
   *            between containers, or not in the range
   *            {@code [0, getComponentCount()-1]} for moving inside
   *            a container
   * @throws IllegalArgumentException if adding a container to itself
   * @throws IllegalArgumentException if adding a {@code Window}
   *            to a container
   * @see #getComponentZOrder(java.awt.Component)
   * @see #invalidate
   * @since 1.5
   */
  setComponentZOrder(comp: Component, index: number): void {
    {
      let curParent = comp.parent;
      let oldZindex = this.getComponentZOrder(comp);
      if (curParent === this && index === oldZindex) {
        return;
      }
      this.checkAdding(comp, index);
      let peerRecreated = (curParent != null) ? curParent.removeDelicately(comp, this, index) : false;
      this.addDelicately(comp, curParent, index);
      if (!peerRecreated && oldZindex !== -1) {
        comp.mixOnZOrderChanging(oldZindex, index);
      }
    }
  }
  /**
   * Traverses the tree of components and reparents children heavyweight component
   * to new heavyweight parent.
   * @since 1.5
   */
  reparentTraverse(parentPeer: ContainerPeer, child: Container): void {
    this.checkTreeLock();
    for (let i = 0; i < child.getComponentCount(); i++) {
      let comp = child.getComponent$int(i);
      if (comp.isLightweight()) {
        if (comp instanceof Container) {
          this.reparentTraverse(parentPeer, comp);
        }
      } else {
        comp.peer.reparent(parentPeer);
      }
    }
  }
  /**
   * Reparents child component peer to this container peer.
   * Container must be heavyweight.
   * @since 1.5
   */
  reparentChild(comp: Component): void {
    this.checkTreeLock();
    if (comp == null) {
      return;
    }
    if (comp.isLightweight()) {
      if (comp instanceof Container) {
        this.reparentTraverse(this.peer, comp);
      }
    } else {
      comp.peer.reparent(this.peer);
    }
  }
  /**
   * Adds component to this container. Tries to minimize side effects of this adding -
   * doesn't call remove notify if it is not required.
   * @since 1.5
   */
  addDelicately(comp: Component, curParent: Container, index: number): void {
    this.checkTreeLock();
    if (curParent !== this) {
      if (index === -1) {
        this.component.add(comp);
      } else {
        this.component.add(index, comp);
      }
      comp.parent = this;
      comp.setGraphicsConfiguration(this.getGraphicsConfiguration());
      this.adjustListeningChildren(AWTEvent.HIERARCHY_EVENT_MASK, comp.numListening(AWTEvent.HIERARCHY_EVENT_MASK));
      this.adjustListeningChildren(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK, comp.numListening(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK));
      this.adjustDescendants(comp.countHierarchyMembers());
    } else {
      if (index < this.component.size()) {
        this.component.set(index, comp);
      }
    }
    this.invalidateIfValid();
    if (this.peer != null) {
      if (comp.peer == null) {
        comp.addNotify();
      } else {
        let newNativeContainer = this.getHeavyweightContainer();
        let oldNativeContainer = curParent.getHeavyweightContainer();
        if (oldNativeContainer !== newNativeContainer) {
          newNativeContainer.reparentChild(comp);
        }
        comp.updateZOrder();
        if (!comp.isLightweight() && this.isLightweight()) {
          comp.relocateComponent();
        }
      }
    }
    if (curParent !== this) {
      if (this.layoutMgr != null) {
        if ($J.isa(this.layoutMgr, LayoutManager2)) {
          (this.layoutMgr).addLayoutComponent$Component$Object(comp, null);
        } else {
          this.layoutMgr.addLayoutComponent$String$Component(null, comp);
        }
      }
      if (this.containerListener != null || ($J.land(this.eventMask, AWTEvent.CONTAINER_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.CONTAINER_EVENT_MASK)) {
        let e = new ContainerEvent()._ContainerEvent(this, ContainerEvent.COMPONENT_ADDED, comp);
        this.dispatchEvent(e);
      }
      comp.createHierarchyEvents(HierarchyEvent.HIERARCHY_CHANGED, comp, this, HierarchyEvent.PARENT_CHANGED, Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_EVENT_MASK));
      if (comp.isFocusOwner() && !comp.canBeFocusOwnerRecursively()) {
        comp.transferFocus$();
      } else if (comp instanceof Container) {
        let focusOwner = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner();
        if (focusOwner != null && this.isParentOf(focusOwner) && !focusOwner.canBeFocusOwnerRecursively()) {
          focusOwner.transferFocus$();
        }
      }
    } else {
      comp.createHierarchyEvents(HierarchyEvent.HIERARCHY_CHANGED, comp, this, HierarchyEvent.HIERARCHY_CHANGED, Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_EVENT_MASK));
    }
    if (this.peer != null && this.layoutMgr == null && this.isVisible$()) {
      this.updateCursorImmediately();
    }
  }
  /**
   * Returns the z-order index of the component inside the container.
   * The higher a component is in the z-order hierarchy, the lower
   * its index.  The component with the lowest z-order index is
   * painted last, above all other child components.
   *
   * @param comp the component being queried
   * @return  the z-order index of the component; otherwise
   *          returns -1 if the component is {@code null}
   *          or doesn't belong to the container
   * @see #setComponentZOrder(java.awt.Component, int)
   * @since 1.5
   */
  getComponentZOrder(comp: Component): number {
    if (comp == null) {
      return -1;
    }
    {
      if (comp.parent !== this) {
        return -1;
      }
      return this.component.indexOf(comp);
    }
  }
  /**
   * Adds the specified component to the end of this container.
   * Also notifies the layout manager to add the component to
   * this container's layout using the specified constraints object.
   * This is a convenience method for {@link #addImpl}.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy. If the container has already been
   * displayed, the hierarchy must be validated thereafter in order to
   * display the added component.
   *
   *
   * @param     comp the component to be added
   * @param     constraints an object expressing
   *                  layout constraints for this component
   * @throws NullPointerException if {@code comp} is {@code null}
   * @see #addImpl
   * @see #invalidate
   * @see #validate
   * @see javax.swing.JComponent#revalidate()
   * @see       LayoutManager
   * @since     1.1
   */
  add$Component$Object(comp: Component, constraints: any): void {
    this.addImpl(comp, constraints, -1);
  }
  /**
   * Adds the specified component to this container with the specified
   * constraints at the specified index.  Also notifies the layout
   * manager to add the component to the this container's layout using
   * the specified constraints object.
   * This is a convenience method for {@link #addImpl}.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy. If the container has already been
   * displayed, the hierarchy must be validated thereafter in order to
   * display the added component.
   *
   *
   * @param comp the component to be added
   * @param constraints an object expressing layout constraints for this
   * @param index the position in the container's list at which to insert
   * the component; {@code -1} means insert at the end
   * component
   * @throws NullPointerException if {@code comp} is {@code null}
   * @throws IllegalArgumentException if {@code index} is invalid (see
   *            {@link #addImpl} for details)
   * @see #addImpl
   * @see #invalidate
   * @see #validate
   * @see javax.swing.JComponent#revalidate()
   * @see #remove
   * @see LayoutManager
   */
  add$Component$Object$int(comp: Component, constraints: any, index: number): void {
    this.addImpl(comp, constraints, index);
  }
  /**
   * Adds the specified component to this container at the specified
   * index. This method also notifies the layout manager to add
   * the component to this container's layout using the specified
   * constraints object via the {@code addLayoutComponent}
   * method.
   * <p>
   * The constraints are
   * defined by the particular layout manager being used.  For
   * example, the {@code BorderLayout} class defines five
   * constraints: {@code BorderLayout.NORTH},
   * {@code BorderLayout.SOUTH}, {@code BorderLayout.EAST},
   * {@code BorderLayout.WEST}, and {@code BorderLayout.CENTER}.
   * <p>
   * The {@code GridBagLayout} class requires a
   * {@code GridBagConstraints} object.  Failure to pass
   * the correct type of constraints object results in an
   * {@code IllegalArgumentException}.
   * <p>
   * If the current layout manager implements {@code LayoutManager2}, then
   * {@link LayoutManager2#addLayoutComponent(Component,Object)} is invoked on
   * it. If the current layout manager does not implement
   * {@code LayoutManager2}, and constraints is a {@code String}, then
   * {@link LayoutManager#addLayoutComponent(String,Component)} is invoked on it.
   * <p>
   * If the component is not an ancestor of this container and has a non-null
   * parent, it is removed from its current parent before it is added to this
   * container.
   * <p>
   * This is the method to override if a program needs to track
   * every add request to a container as all other add methods defer
   * to this one. An overriding method should
   * usually include a call to the superclass's version of the method:
   *
   * <blockquote>
   * {@code super.addImpl(comp, constraints, index)}
   * </blockquote>
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy. If the container has already been
   * displayed, the hierarchy must be validated thereafter in order to
   * display the added component.
   *
   * @param     comp       the component to be added
   * @param     constraints an object expressing layout constraints
   *                 for this component
   * @param     index the position in the container's list at which to
   *                 insert the component, where {@code -1}
   *                 means append to the end
   * @throws IllegalArgumentException if {@code index} is invalid;
   *            if {@code comp} is a child of this container, the valid
   *            range is {@code [-1, getComponentCount()-1]}; if component is
   *            not a child of this container, the valid range is
   *            {@code [-1, getComponentCount()]}
   *
   * @throws IllegalArgumentException if {@code comp} is an ancestor of
   *                                     this container
   * @throws IllegalArgumentException if adding a window to a container
   * @throws NullPointerException if {@code comp} is {@code null}
   * @see       #add(Component)
   * @see       #add(Component, int)
   * @see       #add(Component, java.lang.Object)
   * @see #invalidate
   * @see       LayoutManager
   * @see       LayoutManager2
   * @since     1.1
   */
  addImpl(comp: Component, constraints: any, index: number): void {
    {
      let thisGC = this.getGraphicsConfiguration();
      if (index > this.component.size() || (index < 0 && index !== -1)) {
        throw new IllegalArgumentException('illegal component position');
      }
      this.checkAddToSelf(comp);
      this.checkNotAWindow(comp);
      if (comp.parent != null) {
        comp.parent.remove$Component(comp);
        if (index > this.component.size()) {
          throw new IllegalArgumentException('illegal component position');
        }
      }
      if (thisGC != null) {
        comp.checkGD(thisGC.getDevice().getIDstring());
      }
      if (index === -1) {
        this.component.add(comp);
      } else {
        this.component.add(index, comp);
      }
      comp.parent = this;
      comp.setGraphicsConfiguration(thisGC);
      this.adjustListeningChildren(AWTEvent.HIERARCHY_EVENT_MASK, comp.numListening(AWTEvent.HIERARCHY_EVENT_MASK));
      this.adjustListeningChildren(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK, comp.numListening(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK));
      this.adjustDescendants(comp.countHierarchyMembers());
      this.invalidateIfValid();
      if (this.peer != null) {
        comp.addNotify();
      }
      if (this.layoutMgr != null) {
        if ($J.isa(this.layoutMgr, LayoutManager2)) {
          (this.layoutMgr).addLayoutComponent$Component$Object(comp, constraints);
        } else if ($J.isa(constraints, JString)) {
          this.layoutMgr.addLayoutComponent$String$Component(constraints, comp);
        }
      }
      if (this.containerListener != null || ($J.land(this.eventMask, AWTEvent.CONTAINER_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.CONTAINER_EVENT_MASK)) {
        let e = new ContainerEvent()._ContainerEvent(this, ContainerEvent.COMPONENT_ADDED, comp);
        this.dispatchEvent(e);
      }
      comp.createHierarchyEvents(HierarchyEvent.HIERARCHY_CHANGED, comp, this, HierarchyEvent.PARENT_CHANGED, Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_EVENT_MASK));
      if (this.peer != null && this.layoutMgr == null && this.isVisible$()) {
        this.updateCursorImmediately();
      }
    }
  }
  updateChildGraphicsData(gc: GraphicsConfiguration): boolean {
    this.checkTreeLock();
    let ret = false;
    for (const $it1 = this.component.iterator(); $it1.hasNext(); ) {
      let comp = $it1.next();
      if (comp != null) {
        ret = !!(ret | comp.updateGraphicsData(gc));
      }
    }
    return ret;
  }
  /**
   * Checks that all Components that this Container contains are on
   * the same GraphicsDevice as this Container.  If not, throws an
   * IllegalArgumentException.
   */
  checkGD(stringID: string): void {
    for (const $it2 = this.component.iterator(); $it2.hasNext(); ) {
      let comp = $it2.next();
      if (comp != null) {
        comp.checkGD(stringID);
      }
    }
  }
  /**
   * Removes the component, specified by {@code index},
   * from this container.
   * This method also notifies the layout manager to remove the
   * component from this container's layout via the
   * {@code removeLayoutComponent} method.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy. If the container has already been
   * displayed, the hierarchy must be validated thereafter in order to
   * reflect the changes.
   *
   *
   * @param     index   the index of the component to be removed
   * @throws ArrayIndexOutOfBoundsException if {@code index} is not in
   *         range {@code [0, getComponentCount()-1]}
   * @see #add
   * @see #invalidate
   * @see #validate
   * @see #getComponentCount
   * @since 1.1
   */
  remove$int(index: number): void {
    {
      if (index < 0 || index >= this.component.size()) {
        throw new ArrayIndexOutOfBoundsException(index);
      }
      let comp = this.component.get(index);
      if (this.peer != null) {
        comp.removeNotify();
      }
      if (this.layoutMgr != null) {
        this.layoutMgr.removeLayoutComponent(comp);
      }
      this.adjustListeningChildren(AWTEvent.HIERARCHY_EVENT_MASK, -comp.numListening(AWTEvent.HIERARCHY_EVENT_MASK));
      this.adjustListeningChildren(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK, -comp.numListening(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK));
      this.adjustDescendants(-(comp.countHierarchyMembers()));
      comp.parent = null;
      this.component.removeAt(index);
      comp.setGraphicsConfiguration(null);
      this.invalidateIfValid();
      if (this.containerListener != null || ($J.land(this.eventMask, AWTEvent.CONTAINER_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.CONTAINER_EVENT_MASK)) {
        let e = new ContainerEvent()._ContainerEvent(this, ContainerEvent.COMPONENT_REMOVED, comp);
        this.dispatchEvent(e);
      }
      comp.createHierarchyEvents(HierarchyEvent.HIERARCHY_CHANGED, comp, this, HierarchyEvent.PARENT_CHANGED, Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_EVENT_MASK));
      if (this.peer != null && this.layoutMgr == null && this.isVisible$()) {
        this.updateCursorImmediately();
      }
    }
  }
  /**
   * Removes the specified component from this container.
   * This method also notifies the layout manager to remove the
   * component from this container's layout via the
   * {@code removeLayoutComponent} method.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy. If the container has already been
   * displayed, the hierarchy must be validated thereafter in order to
   * reflect the changes.
   *
   * @param comp the component to be removed
   * @throws NullPointerException if {@code comp} is {@code null}
   * @see #add
   * @see #invalidate
   * @see #validate
   * @see #remove(int)
   */
  remove$Component(comp: Component): void {
    {
      if (comp.parent === this) {
        let index = this.component.indexOf(comp);
        if (index >= 0) {
          this.remove$int(index);
        }
      }
    }
  }
  /**
   * Removes all the components from this container.
   * This method also notifies the layout manager to remove the
   * components from this container's layout via the
   * {@code removeLayoutComponent} method.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy. If the container has already been
   * displayed, the hierarchy must be validated thereafter in order to
   * reflect the changes.
   *
   * @see #add
   * @see #remove
   * @see #invalidate
   */
  removeAll(): void {
    {
      this.adjustListeningChildren(AWTEvent.HIERARCHY_EVENT_MASK, -this.listeningChildren);
      this.adjustListeningChildren(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK, -this.listeningBoundsChildren);
      this.adjustDescendants(-this.descendantsCount);
      while (!this.component.isEmpty()) {
        let comp = this.component.removeAt((this.component.size() - 1) | 0);
        if (this.peer != null) {
          comp.removeNotify();
        }
        if (this.layoutMgr != null) {
          this.layoutMgr.removeLayoutComponent(comp);
        }
        comp.parent = null;
        comp.setGraphicsConfiguration(null);
        if (this.containerListener != null || ($J.land(this.eventMask, AWTEvent.CONTAINER_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.CONTAINER_EVENT_MASK)) {
          let e = new ContainerEvent()._ContainerEvent(this, ContainerEvent.COMPONENT_REMOVED, comp);
          this.dispatchEvent(e);
        }
        comp.createHierarchyEvents(HierarchyEvent.HIERARCHY_CHANGED, comp, this, HierarchyEvent.PARENT_CHANGED, Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_EVENT_MASK));
      }
      if (this.peer != null && this.layoutMgr == null && this.isVisible$()) {
        this.updateCursorImmediately();
      }
      this.invalidateIfValid();
    }
  }
  numListening(mask: number): number {
    let superListening = super.numListening(mask);
    if (mask === AWTEvent.HIERARCHY_EVENT_MASK) {
      if (Container.eventLog.isLoggable(PlatformLogger_Level.FINE)) {
        let sum = 0;
        for (const $it3 = this.component.iterator(); $it3.hasNext(); ) {
          let comp = $it3.next();
          sum = (sum + comp.numListening(mask)) | 0;
        }
        if (this.listeningChildren !== sum) {
          Container.eventLog.fine('Assertion (listeningChildren == sum) failed');
        }
      }
      return (this.listeningChildren + superListening) | 0;
    } else if (mask === AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK) {
      if (Container.eventLog.isLoggable(PlatformLogger_Level.FINE)) {
        let sum = 0;
        for (const $it4 = this.component.iterator(); $it4.hasNext(); ) {
          let comp = $it4.next();
          sum = (sum + comp.numListening(mask)) | 0;
        }
        if (this.listeningBoundsChildren !== sum) {
          Container.eventLog.fine('Assertion (listeningBoundsChildren == sum) failed');
        }
      }
      return (this.listeningBoundsChildren + superListening) | 0;
    } else {
      if (Container.eventLog.isLoggable(PlatformLogger_Level.FINE)) {
        Container.eventLog.fine('This code must never be reached');
      }
      return superListening;
    }
  }
  adjustListeningChildren(mask: number, num: number): void {
    if (Container.eventLog.isLoggable(PlatformLogger_Level.FINE)) {
      let toAssert = (mask === AWTEvent.HIERARCHY_EVENT_MASK || mask === AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK || mask === ($J.lor(AWTEvent.HIERARCHY_EVENT_MASK, AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK)));
      if (!toAssert) {
        Container.eventLog.fine('Assertion failed');
      }
    }
    if (num === 0) {
      return;
    }
    if (($J.land(mask, AWTEvent.HIERARCHY_EVENT_MASK)) !== 0) {
      this.listeningChildren = (this.listeningChildren + num) | 0;
    }
    if (($J.land(mask, AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK)) !== 0) {
      this.listeningBoundsChildren = (this.listeningBoundsChildren + num) | 0;
    }
    this.adjustListeningChildrenOnParent(mask, num);
  }
  adjustDescendants(num: number): void {
    if (num === 0) {
      return;
    }
    this.descendantsCount = (this.descendantsCount + num) | 0;
    this.adjustDescendantsOnParent(num);
  }
  adjustDescendantsOnParent(num: number): void {
    if (this.parent != null) {
      this.parent.adjustDescendants(num);
    }
  }
  countHierarchyMembers(): number {
    if (Container.log.isLoggable(PlatformLogger_Level.FINE)) {
      let sum = 0;
      for (const $it5 = this.component.iterator(); $it5.hasNext(); ) {
        let comp = $it5.next();
        sum = (sum + comp.countHierarchyMembers()) | 0;
      }
      if (this.descendantsCount !== sum) {
        Container.log.fine('Assertion (descendantsCount == sum) failed');
      }
    }
    return (this.descendantsCount + 1) | 0;
  }
  getListenersCount(id: number, enabledOnToolkit: boolean): number {
    this.checkTreeLock();
    if (enabledOnToolkit) {
      return this.descendantsCount;
    }
    switch (id) {
      case HierarchyEvent.HIERARCHY_CHANGED:
        return this.listeningChildren;
      case HierarchyEvent.ANCESTOR_MOVED:
      case HierarchyEvent.ANCESTOR_RESIZED:
        return this.listeningBoundsChildren;
      default:
        return 0;
    }
  }
  createHierarchyEvents(id: number, changed: Component, changedParent: Container, changeFlags: number, enabledOnToolkit: boolean): number {
    this.checkTreeLock();
    let listeners = this.getListenersCount(id, enabledOnToolkit);
    for (let count = listeners, i = 0; count > 0; i++) {
      count = (count - this.component.get(i).createHierarchyEvents(id, changed, changedParent, changeFlags, enabledOnToolkit)) | 0;
    }
    return (listeners + super.createHierarchyEvents(id, changed, changedParent, changeFlags, enabledOnToolkit)) | 0;
  }
  createChildHierarchyEvents(id: number, changeFlags: number, enabledOnToolkit: boolean): void {
    this.checkTreeLock();
    if (this.component.isEmpty()) {
      return;
    }
    let listeners = this.getListenersCount(id, enabledOnToolkit);
    for (let count = listeners, i = 0; count > 0; i++) {
      count = (count - this.component.get(i).createHierarchyEvents(id, this, this.parent, changeFlags, enabledOnToolkit)) | 0;
    }
  }
  /**
   * Gets the layout manager for this container.
   *
   * @see #doLayout
   * @see #setLayout
   * @return the current layout manager for this container
   */
  getLayout(): LayoutManager {
    return this.layoutMgr;
  }
  /**
   * Sets the layout manager for this container.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param mgr the specified layout manager
   * @see #doLayout
   * @see #getLayout
   * @see #invalidate
   */
  setLayout(mgr: LayoutManager): void {
    this.layoutMgr = mgr;
    this.invalidateIfValid();
  }
  /**
   * Causes this container to lay out its components.  Most programs
   * should not call this method directly, but should invoke
   * the {@code validate} method instead.
   * @see LayoutManager#layoutContainer
   * @see #setLayout
   * @see #validate
   * @since 1.1
   */
  doLayout(): void {
    this.layout();
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by {@code doLayout()}.
   */
  layout(): void {
    let layoutMgr = this.layoutMgr;
    if (layoutMgr != null) {
      layoutMgr.layoutContainer$Container(this);
    }
  }
  /**
   * Indicates if this container is a <i>validate root</i>.
   * <p>
   * Layout-related changes, such as bounds of the validate root descendants,
   * do not affect the layout of the validate root parent. This peculiarity
   * enables the {@code invalidate()} method to stop invalidating the
   * component hierarchy when the method encounters a validate root. However,
   * to preserve backward compatibility this new optimized behavior is
   * enabled only when the {@code java.awt.smartInvalidate} system property
   * value is set to {@code true}.
   * <p>
   * If a component hierarchy contains validate roots and the new optimized
   * {@code invalidate()} behavior is enabled, the {@code validate()} method
   * must be invoked on the validate root of a previously invalidated
   * component to restore the validity of the hierarchy later. Otherwise,
   * calling the {@code validate()} method on the top-level container (such
   * as a {@code Frame} object) should be used to restore the validity of the
   * component hierarchy.
   * <p>
   * The {@code Window} class and the {@code Applet} class are the validate
   * roots in AWT.  Swing introduces more validate roots.
   *
   * @return whether this container is a validate root
   * @see #invalidate
   * @see java.awt.Component#invalidate
   * @see javax.swing.JComponent#isValidateRoot
   * @see javax.swing.JComponent#revalidate
   * @since 1.7
   */
  isValidateRoot$(): boolean {
    return false;
  }
  /**
   * Invalidates the parent of the container unless the container
   * is a validate root.
   */
  invalidateParent(): void {
    if (!Container.isJavaAwtSmartInvalidate || !this.isValidateRoot$()) {
      super.invalidateParent();
    }
  }
  /**
   * Invalidates the container.
   * <p>
   * If the {@code LayoutManager} installed on this container is an instance
   * of the {@code LayoutManager2} interface, then
   * the {@link LayoutManager2#invalidateLayout(Container)} method is invoked
   * on it supplying this {@code Container} as the argument.
   * <p>
   * Afterwards this method marks this container invalid, and invalidates its
   * ancestors. See the {@link Component#invalidate} method for more details.
   *
   * @see #validate
   * @see #layout
   * @see LayoutManager2
   */
  invalidate(): void {
    let layoutMgr = this.layoutMgr;
    if ($J.isa(layoutMgr, LayoutManager2)) {
      let lm = layoutMgr;
      lm.invalidateLayout(this);
    }
    super.invalidate();
  }
  /**
   * Validates this container and all of its subcomponents.
   * <p>
   * Validating a container means laying out its subcomponents.
   * Layout-related changes, such as setting the bounds of a component, or
   * adding a component to the container, invalidate the container
   * automatically.  Note that the ancestors of the container may be
   * invalidated also (see {@link Component#invalidate} for details.)
   * Therefore, to restore the validity of the hierarchy, the {@code
   * validate()} method should be invoked on the top-most invalid
   * container of the hierarchy.
   * <p>
   * Validating the container may be a quite time-consuming operation. For
   * performance reasons a developer may postpone the validation of the
   * hierarchy till a set of layout-related operations completes, e.g. after
   * adding all the children to the container.
   * <p>
   * If this {@code Container} is not valid, this method invokes
   * the {@code validateTree} method and marks this {@code Container}
   * as valid. Otherwise, no action is performed.
   *
   * @see #add(java.awt.Component)
   * @see #invalidate
   * @see Container#isValidateRoot
   * @see javax.swing.JComponent#revalidate()
   * @see #validateTree
   */
  validate(): void {
    let updateCur = false;
    {
      if ((!this.isValid() || Container.descendUnconditionallyWhenValidating) && this.peer != null) {
        let p = null;
        if ($J.isa(this.peer, ContainerPeer)) {
          p = this.peer;
        }
        if (p != null) {
          p.beginValidate();
        }
        this.validateTree();
        if (p != null) {
          p.endValidate();
          if (!Container.descendUnconditionallyWhenValidating) {
            updateCur = this.isVisible$();
          }
        }
      }
    }
    if (updateCur) {
      this.updateCursorImmediately();
    }
  }
  /**
   * Unconditionally validate the component hierarchy.
   */
  validateUnconditionally(): void {
    let updateCur = false;
    {
      Container.descendUnconditionallyWhenValidating = true;
      this.validate();
      if ($J.isa(this.peer, ContainerPeer)) {
        updateCur = this.isVisible$();
      }
      Container.descendUnconditionallyWhenValidating = false;
    }
    if (updateCur) {
      this.updateCursorImmediately();
    }
  }
  /**
   * Recursively descends the container tree and recomputes the
   * layout for any subtrees marked as needing it (those marked as
   * invalid).  Synchronization should be provided by the method
   * that calls this one:  {@code validate}.
   *
   * @see #doLayout
   * @see #validate
   */
  validateTree(): void {
    this.checkTreeLock();
    if (!this.isValid() || Container.descendUnconditionallyWhenValidating) {
      if ($J.isa(this.peer, ContainerPeer)) {
        (this.peer).beginLayout();
      }
      if (!this.isValid()) {
        this.doLayout();
      }
      for (let i = 0; i < this.component.size(); i++) {
        let comp = this.component.get(i);
        if ((comp instanceof Container) && !(comp instanceof Window) && (!comp.isValid() || Container.descendUnconditionallyWhenValidating)) {
          (comp).validateTree();
        } else {
          comp.validate();
        }
      }
      if ($J.isa(this.peer, ContainerPeer)) {
        (this.peer).endLayout();
      }
    }
    super.validate();
  }
  /**
   * Recursively descends the container tree and invalidates all
   * contained components.
   */
  invalidateTree(): void {
    {
      for (let i = 0; i < this.component.size(); i++) {
        let comp = this.component.get(i);
        if (comp instanceof Container) {
          (comp).invalidateTree();
        } else {
          comp.invalidateIfValid();
        }
      }
      this.invalidateIfValid();
    }
  }
  /**
   * Sets the font of this container.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param f The font to become this container's font.
   * @see Component#getFont
   * @see #invalidate
   * @since 1.0
   */
  setFont(f: Font): void {
    let shouldinvalidate = false;
    let oldfont = this.getFont();
    super.setFont(f);
    let newfont = this.getFont();
    if (newfont !== oldfont && (oldfont == null || !oldfont.equals(newfont))) {
      this.invalidateTree();
    }
  }
  /**
   * Returns the preferred size of this container.  If the preferred size has
   * not been set explicitly by {@link Component#setPreferredSize(Dimension)}
   * and this {@code Container} has a {@code non-null} {@link LayoutManager},
   * then {@link LayoutManager#preferredLayoutSize(Container)}
   * is used to calculate the preferred size.
   *
   * <p>Note: some implementations may cache the value returned from the
   * {@code LayoutManager}.  Implementations that cache need not invoke
   * {@code preferredLayoutSize} on the {@code LayoutManager} every time
   * this method is invoked, rather the {@code LayoutManager} will only
   * be queried after the {@code Container} becomes invalid.
   *
   * @return    an instance of {@code Dimension} that represents
   *                the preferred size of this container.
   * @see       #getMinimumSize
   * @see       #getMaximumSize
   * @see       #getLayout
   * @see       LayoutManager#preferredLayoutSize(Container)
   * @see       Component#getPreferredSize
   */
  getPreferredSize$(): Dimension {
    return this.preferredSize$();
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by {@code getPreferredSize()}.
   */
  preferredSize$(): Dimension {
    let dim = this.prefSize;
    if (dim == null || !(this.isPreferredSizeSet() || this.isValid())) {
      {
        this.prefSize = (this.layoutMgr != null) ? this.layoutMgr.preferredLayoutSize(this) : super.preferredSize$();
        dim = this.prefSize;
      }
    }
    if (dim != null) {
      return new Dimension()._Dimension$Dimension(dim);
    } else {
      return dim;
    }
  }
  /**
   * Returns the minimum size of this container.  If the minimum size has
   * not been set explicitly by {@link Component#setMinimumSize(Dimension)}
   * and this {@code Container} has a {@code non-null} {@link LayoutManager},
   * then {@link LayoutManager#minimumLayoutSize(Container)}
   * is used to calculate the minimum size.
   *
   * <p>Note: some implementations may cache the value returned from the
   * {@code LayoutManager}.  Implementations that cache need not invoke
   * {@code minimumLayoutSize} on the {@code LayoutManager} every time
   * this method is invoked, rather the {@code LayoutManager} will only
   * be queried after the {@code Container} becomes invalid.
   *
   * @return    an instance of {@code Dimension} that represents
   *                the minimum size of this container.
   * @see       #getPreferredSize
   * @see       #getMaximumSize
   * @see       #getLayout
   * @see       LayoutManager#minimumLayoutSize(Container)
   * @see       Component#getMinimumSize
   * @since     1.1
   */
  getMinimumSize$(): Dimension {
    return this.minimumSize$();
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by {@code getMinimumSize()}.
   */
  minimumSize$(): Dimension {
    let dim = this.minSize;
    if (dim == null || !(this.isMinimumSizeSet() || this.isValid())) {
      {
        this.minSize = (this.layoutMgr != null) ? this.layoutMgr.minimumLayoutSize(this) : super.minimumSize$();
        dim = this.minSize;
      }
    }
    if (dim != null) {
      return new Dimension()._Dimension$Dimension(dim);
    } else {
      return dim;
    }
  }
  /**
   * Returns the maximum size of this container.  If the maximum size has
   * not been set explicitly by {@link Component#setMaximumSize(Dimension)}
   * and the {@link LayoutManager} installed on this {@code Container}
   * is an instance of {@link LayoutManager2}, then
   * {@link LayoutManager2#maximumLayoutSize(Container)}
   * is used to calculate the maximum size.
   *
   * <p>Note: some implementations may cache the value returned from the
   * {@code LayoutManager2}.  Implementations that cache need not invoke
   * {@code maximumLayoutSize} on the {@code LayoutManager2} every time
   * this method is invoked, rather the {@code LayoutManager2} will only
   * be queried after the {@code Container} becomes invalid.
   *
   * @return    an instance of {@code Dimension} that represents
   *                the maximum size of this container.
   * @see       #getPreferredSize
   * @see       #getMinimumSize
   * @see       #getLayout
   * @see       LayoutManager2#maximumLayoutSize(Container)
   * @see       Component#getMaximumSize
   */
  getMaximumSize(): Dimension {
    let dim = this.maxSize;
    if (dim == null || !(this.isMaximumSizeSet() || this.isValid())) {
      {
        if ($J.isa(this.layoutMgr, LayoutManager2)) {
          let lm = this.layoutMgr;
          this.maxSize = lm.maximumLayoutSize(this);
        } else {
          this.maxSize = super.getMaximumSize();
        }
        dim = this.maxSize;
      }
    }
    if (dim != null) {
      return new Dimension()._Dimension$Dimension(dim);
    } else {
      return dim;
    }
  }
  /**
   * Returns the alignment along the x axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   */
  getAlignmentX(): number {
    let xAlign: number;
    if ($J.isa(this.layoutMgr, LayoutManager2)) {
      {
        let lm = this.layoutMgr;
        xAlign = lm.getLayoutAlignmentX(this);
      }
    } else {
      xAlign = super.getAlignmentX();
    }
    return xAlign;
  }
  /**
   * Returns the alignment along the y axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   */
  getAlignmentY(): number {
    let yAlign: number;
    if ($J.isa(this.layoutMgr, LayoutManager2)) {
      {
        let lm = this.layoutMgr;
        yAlign = lm.getLayoutAlignmentY(this);
      }
    } else {
      yAlign = super.getAlignmentY();
    }
    return yAlign;
  }
  /**
   * Paints the container. This forwards the paint to any lightweight
   * components that are children of this container. If this method is
   * reimplemented, super.paint(g) should be called so that lightweight
   * components are properly rendered. If a child component is entirely
   * clipped by the current clipping setting in g, paint() will not be
   * forwarded to that child.
   *
   * @param g the specified Graphics window
   * @see   Component#update(Graphics)
   */
  paint(g: Graphics): void {
    if (this.isShowing()) {
      {
        if (this.printing) {
          if (this.printingThreads.contains(Thread.currentThread())) {
            return;
          }
        }
      }
      GraphicsCallback$PaintCallback.getInstance().runComponents(this.getComponentsSync(), g, SunGraphicsCallback.LIGHTWEIGHTS);
    }
  }
  /**
   * Prints the container. This forwards the print to any lightweight
   * components that are children of this container. If this method is
   * reimplemented, super.print(g) should be called so that lightweight
   * components are properly rendered. If a child component is entirely
   * clipped by the current clipping setting in g, print() will not be
   * forwarded to that child.
   *
   * @param g the specified Graphics window
   * @see   Component#update(Graphics)
   */
  print$Graphics(g: Graphics): void {
    if (this.isShowing()) {
      let t = Thread.currentThread();
      try {
        {
          if (this.printingThreads == null) {
            this.printingThreads = new HashSet();
          }
          this.printingThreads.add(t);
          this.printing = true;
        }
        super.print$Graphics(g);
      } finally {
        {
          this.printingThreads.remove(t);
          this.printing = !this.printingThreads.isEmpty();
        }
      }
      GraphicsCallback$PrintCallback.getInstance().runComponents(this.getComponentsSync(), g, SunGraphicsCallback.LIGHTWEIGHTS);
    }
  }
  /**
   * Simulates the peer callbacks into java.awt for printing of
   * lightweight Containers.
   * @param     g   the graphics context to use for printing.
   * @see       Component#printAll
   * @see       #printComponents
   */
  lightweightPrint(g: Graphics): void {
    super.lightweightPrint(g);
    this.printHeavyweightComponents(g);
  }
  /**
   * Prints all the heavyweight subcomponents.
   */
  printHeavyweightComponents(g: Graphics): void {
    if (this.isShowing()) {
      GraphicsCallback$PrintHeavyweightComponentsCallback.getInstance().runComponents(this.getComponentsSync(), g, SunGraphicsCallback.LIGHTWEIGHTS | SunGraphicsCallback.HEAVYWEIGHTS);
    }
  }
  /**
   * Adds the specified container listener to receive container events
   * from this container.
   * If l is null, no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l the container listener
   *
   * @see #removeContainerListener
   * @see #getContainerListeners
   */
  addContainerListener(l: ContainerListener): void {
    if (l == null) {
      return;
    }
    this.containerListener = AWTEventMulticaster.add$ContainerListener$ContainerListener(this.containerListener, l);
    this.newEventsOnly = true;
  }
  /**
   * Removes the specified container listener so it no longer receives
   * container events from this container.
   * If l is null, no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param   l the container listener
   *
   * @see #addContainerListener
   * @see #getContainerListeners
   */
  removeContainerListener(l: ContainerListener): void {
    if (l == null) {
      return;
    }
    this.containerListener = AWTEventMulticaster.remove$ContainerListener$ContainerListener(this.containerListener, l);
  }
  /**
   * Returns an array of all the objects currently registered
   * as <code><em>Foo</em>Listener</code>s
   * upon this {@code Container}.
   * <code><em>Foo</em>Listener</code>s are registered using the
   * <code>add<em>Foo</em>Listener</code> method.
   *
   * <p>
   * You can specify the {@code listenerType} argument
   * with a class literal, such as
   * <code><em>Foo</em>Listener.class</code>.
   * For example, you can query a
   * {@code Container c}
   * for its container listeners with the following code:
   *
   * <pre>ContainerListener[] cls = (ContainerListener[])(c.getListeners(ContainerListener.class));</pre>
   *
   * If no such listeners exist, this method returns an empty array.
   *
   * @param listenerType the type of listeners requested; this parameter
   *          should specify an interface that descends from
   *          {@code java.util.EventListener}
   * @return an array of all objects registered as
   *          <code><em>Foo</em>Listener</code>s on this container,
   *          or an empty array if no such listeners have been added
   * @throws ClassCastException if {@code listenerType}
   *          doesn't specify a class or interface that implements
   *          {@code java.util.EventListener}
   * @throws NullPointerException if {@code listenerType} is {@code null}
   *
   * @see #getContainerListeners
   *
   * @since 1.3
   */
  getListeners<T>(listenerType: JClass<T>): T[] {
    let l = null;
    if (listenerType === $J.cls(ContainerListener)) {
      l = this.containerListener;
    } else {
      return super.getListeners(listenerType);
    }
    return AWTEventMulticaster.getListeners(l, listenerType);
  }
  eventEnabled(e: AWTEvent): boolean {
    let id = e.getID();
    if (id === ContainerEvent.COMPONENT_ADDED || id === ContainerEvent.COMPONENT_REMOVED) {
      if (($J.land(this.eventMask, AWTEvent.CONTAINER_EVENT_MASK)) !== 0 || this.containerListener != null) {
        return true;
      }
      return false;
    }
    return super.eventEnabled(e);
  }
  /**
   * Processes events on this container. If the event is a
   * {@code ContainerEvent}, it invokes the
   * {@code processContainerEvent} method, else it invokes
   * its superclass's {@code processEvent}.
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param e the event
   */
  processEvent(e: AWTEvent): void {
    if (e instanceof ContainerEvent) {
      this.processContainerEvent(e);
      return;
    }
    super.processEvent(e);
  }
  /**
   * Processes container events occurring on this container by
   * dispatching them to any registered ContainerListener objects.
   * NOTE: This method will not be called unless container events
   * are enabled for this component; this happens when one of the
   * following occurs:
   * <ul>
   * <li>A ContainerListener object is registered via
   *     {@code addContainerListener}
   * <li>Container events are enabled via {@code enableEvents}
   * </ul>
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param e the container event
   * @see Component#enableEvents
   */
  processContainerEvent(e: ContainerEvent): void {
    let listener = this.containerListener;
    if (listener != null) {
      switch (e.getID()) {
        case ContainerEvent.COMPONENT_ADDED:
          listener.componentAdded(e);
          break;
        case ContainerEvent.COMPONENT_REMOVED:
          listener.componentRemoved(e);
          break;
      }
    }
  }
  dispatchEventImpl(e: AWTEvent): void {
    if ((this.dispatcher != null) && this.dispatcher.dispatchEvent(e)) {
      e.consume();
      if (this.peer != null) {
        this.peer.handleEvent(e);
      }
      return;
    }
    super.dispatchEventImpl(e);
    {
      switch (e.getID()) {
        case ComponentEvent.COMPONENT_RESIZED:
          this.createChildHierarchyEvents(HierarchyEvent.ANCESTOR_RESIZED, 0, Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK));
          break;
        case ComponentEvent.COMPONENT_MOVED:
          this.createChildHierarchyEvents(HierarchyEvent.ANCESTOR_MOVED, 0, Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK));
          break;
        default:
          break;
      }
    }
  }
  dispatchEventToSelf(e: AWTEvent): void {
    super.dispatchEventImpl(e);
  }
  /**
   * Fetches the top-most (deepest) lightweight component that is interested
   * in receiving mouse events.
   */
  getMouseEventTarget$int$int$boolean(x: number, y: number, includeSelf: boolean): Component {
    return this.getMouseEventTarget$int$int$boolean$EventTargetFilter$boolean$Container(x, y, includeSelf, Container$MouseEventTargetFilter.FILTER, !Container.SEARCH_HEAVYWEIGHTS);
  }
  /**
   * Fetches the top-most (deepest) component to receive SunDropTargetEvents.
   */
  getDropTargetEventTarget(x: number, y: number, includeSelf: boolean): Component {
    return this.getMouseEventTarget$int$int$boolean$EventTargetFilter$boolean$Container(x, y, includeSelf, Container$DropTargetEventTargetFilter.FILTER, Container.SEARCH_HEAVYWEIGHTS);
  }
  /**
   * A private version of getMouseEventTarget which has two additional
   * controllable behaviors. This method searches for the top-most
   * descendant of this container that contains the given coordinates
   * and is accepted by the given filter. The search will be constrained to
   * lightweight descendants if the last argument is {@code false}.
   *
   * @param filter EventTargetFilter instance to determine whether the
   *        given component is a valid target for this event.
   * @param searchHeavyweights if {@code false}, the method
   *        will bypass heavyweight components during the search.
   */
  getMouseEventTarget$int$int$boolean$EventTargetFilter$boolean$Container(x: number, y: number, includeSelf: boolean, filter: Container$EventTargetFilter, searchHeavyweights: boolean): Component {
    let comp = null;
    if (searchHeavyweights) {
      comp = this.getMouseEventTargetImpl(x, y, includeSelf, filter, Container.SEARCH_HEAVYWEIGHTS, searchHeavyweights);
    }
    if (comp == null || comp === this) {
      comp = this.getMouseEventTargetImpl(x, y, includeSelf, filter, !Container.SEARCH_HEAVYWEIGHTS, searchHeavyweights);
    }
    return comp;
  }
  /**
   * A private version of getMouseEventTarget which has three additional
   * controllable behaviors. This method searches for the top-most
   * descendant of this container that contains the given coordinates
   * and is accepted by the given filter. The search will be constrained to
   * descendants of only lightweight children or only heavyweight children
   * of this container depending on searchHeavyweightChildren. The search will
   * be constrained to only lightweight descendants of the searched children
   * of this container if searchHeavyweightDescendants is {@code false}.
   *
   * @param filter EventTargetFilter instance to determine whether the
   *        selected component is a valid target for this event.
   * @param searchHeavyweightChildren if {@code true}, the method
   *        will bypass immediate lightweight children during the search.
   *        If {@code false}, the methods will bypass immediate
   *        heavyweight children during the search.
   * @param searchHeavyweightDescendants if {@code false}, the method
   *        will bypass heavyweight descendants which are not immediate
   *        children during the search. If {@code true}, the method
   *        will traverse both lightweight and heavyweight descendants during
   *        the search.
   */
  getMouseEventTargetImpl(x: number, y: number, includeSelf: boolean, filter: Container$EventTargetFilter, searchHeavyweightChildren: boolean, searchHeavyweightDescendants: boolean): Component {
    {
      for (let i = 0; i < this.component.size(); i++) {
        let comp = this.component.get(i);
        if (comp != null && comp.visible && ((!searchHeavyweightChildren && $J.isa(comp.peer, LightweightPeer)) || (searchHeavyweightChildren && !($J.isa(comp.peer, LightweightPeer)))) && comp.contains$int$int((x - comp.x_) | 0, (y - comp.y_) | 0)) {
          if (comp instanceof Container) {
            let child = comp;
            let deeper = child.getMouseEventTarget$int$int$boolean$EventTargetFilter$boolean$Container((x - child.x_) | 0, (y - child.y_) | 0, includeSelf, filter, searchHeavyweightDescendants);
            if (deeper != null) {
              return deeper;
            }
          } else {
            if (filter.accept(comp)) {
              return comp;
            }
          }
        }
      }
      let isPeerOK: boolean;
      let isMouseOverMe: boolean;
      isPeerOK = ($J.isa(this.peer, LightweightPeer)) || includeSelf;
      isMouseOverMe = this.contains$int$int(x, y);
      if (isMouseOverMe && isPeerOK && filter.accept(this)) {
        return this;
      }
      return null;
    }
  }
  /**
   * This is called by lightweight components that want the containing
   * windowed parent to enable some kind of events on their behalf.
   * This is needed for events that are normally only dispatched to
   * windows to be accepted so that they can be forwarded downward to
   * the lightweight component that has enabled them.
   */
  proxyEnableEvents(events: number): void {
    if ($J.isa(this.peer, LightweightPeer)) {
      if (this.parent != null) {
        this.parent.proxyEnableEvents(events);
      }
    } else {
      if (this.dispatcher != null) {
        this.dispatcher.enableEvents(events);
      }
    }
  }
  /**
   * Locates the component that contains the x,y position.  The
   * top-most child component is returned in the case where there
   * is overlap in the components.  This is determined by finding
   * the component closest to the index 0 that claims to contain
   * the given point via Component.contains(), except that Components
   * which have native peers take precedence over those which do not
   * (i.e., lightweight Components).
   *
   * @param x the <i>x</i> coordinate
   * @param y the <i>y</i> coordinate
   * @return null if the component does not contain the position.
   * If there is no child component at the requested point and the
   * point is within the bounds of the container the container itself
   * is returned; otherwise the top-most child is returned.
   * @see Component#contains
   * @since 1.1
   */
  getComponentAt$int$int(x: number, y: number): Component {
    return this.locate(x, y);
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by {@code getComponentAt(int, int)}.
   */
  locate(x: number, y: number): Component {
    if (!this.contains$int$int(x, y)) {
      return null;
    }
    let lightweight = null;
    {
      for (const $it6 = this.component.iterator(); $it6.hasNext(); ) {
        let comp = $it6.next();
        if (comp.contains$int$int((x - comp.x_) | 0, (y - comp.y_) | 0)) {
          if (!comp.isLightweight()) {
            return comp;
          }
          if (lightweight == null) {
            lightweight = comp;
          }
        }
      }
    }
    return lightweight != null ? lightweight : this;
  }
  isSameOrAncestorOf(comp: Component, allowChildren: boolean): boolean {
    return this === comp || (allowChildren && this.isParentOf(comp));
  }
  /**
   * Private version of findComponentAt which has a controllable
   * behavior. Setting 'ignoreEnabled' to 'false' bypasses disabled
   * Components during the search. This behavior is used by the
   * lightweight cursor support in sun.awt.GlobalCursorManager.
   *
   * The addition of this feature is temporary, pending the
   * adoption of new, public API which exports this feature.
   */
  findComponentAt$int$int$boolean(x: number, y: number, ignoreEnabled: boolean): Component {
    {
      if (this.isRecursivelyVisible()) {
        return this.findComponentAtImpl(x, y, ignoreEnabled);
      }
    }
    return null;
  }
  findComponentAtImpl(x: number, y: number, ignoreEnabled: boolean): Component {
    if (!(this.contains$int$int(x, y) && this.visible && (ignoreEnabled || this.enabled))) {
      return null;
    }
    let lightweight = null;
    for (const $it7 = this.component.iterator(); $it7.hasNext(); ) {
      let comp = $it7.next();
      let x1 = (x - comp.x_) | 0;
      let y1 = (y - comp.y_) | 0;
      if (!comp.contains$int$int(x1, y1)) {
        continue;
      }
      if (!comp.isLightweight()) {
        let child = Container.getChildAt(comp, x1, y1, ignoreEnabled);
        if (child != null) {
          return child;
        }
      } else {
        if (lightweight == null) {
          lightweight = Container.getChildAt(comp, x1, y1, ignoreEnabled);
        }
      }
    }
    return lightweight != null ? lightweight : this;
  }
  /**
   * Helper method for findComponentAtImpl. Finds a child component using
   * findComponentAtImpl for Container and getComponentAt for Component.
   */
  static getChildAt(comp: Component, x: number, y: number, ignoreEnabled: boolean): Component {
    if (comp instanceof Container) {
      comp = (comp).findComponentAtImpl(x, y, ignoreEnabled);
    } else {
      comp = comp.getComponentAt$int$int(x, y);
    }
    if (comp != null && comp.visible && (ignoreEnabled || comp.enabled)) {
      return comp;
    }
    return null;
  }
  /**
   * Makes this Container displayable by connecting it to
   * a native screen resource.  Making a container displayable will
   * cause all of its children to be made displayable.
   * This method is called internally by the toolkit and should
   * not be called directly by programs.
   * @see Component#isDisplayable
   * @see #removeNotify
   */
  addNotify(): void {
    {
      super.addNotify();
      if (!($J.isa(this.peer, LightweightPeer))) {
        this.dispatcher = new LightweightDispatcher()._LightweightDispatcher(this);
      }
      for (let i = 0; i < this.component.size(); i++) {
        this.component.get(i).addNotify();
      }
    }
  }
  /**
   * Makes this Container undisplayable by removing its connection
   * to its native screen resource.  Making a container undisplayable
   * will cause all of its children to be made undisplayable.
   * This method is called by the toolkit internally and should
   * not be called directly by programs.
   * @see Component#isDisplayable
   * @see #addNotify
   */
  removeNotify(): void {
    {
      for (let i = (this.component.size() - 1) | 0; i >= 0; i--) {
        let comp = this.component.get(i);
        if (comp != null) {
          comp.setAutoFocusTransferOnDisposal(false);
          comp.removeNotify();
          comp.setAutoFocusTransferOnDisposal(true);
        }
      }
      if (this.containsFocus() && KeyboardFocusManager.isAutoFocusTransferEnabledFor(this)) {
        if (!this.transferFocus$boolean(false)) {
          this.transferFocusBackward$boolean(true);
        }
      }
      if (this.dispatcher != null) {
        this.dispatcher.dispose();
        this.dispatcher = null;
      }
      super.removeNotify();
    }
  }
  /**
   * Checks if the component is contained in the component hierarchy of
   * this container.
   * @param c the component
   * @return     {@code true} if it is an ancestor;
   *             {@code false} otherwise.
   * @since      1.1
   */
  isAncestorOf(c: Component): boolean {
    let p: Container;
    if (c == null || ((p = c.getParent()) == null)) {
      return false;
    }
    while (p != null) {
      if (p === this) {
        return true;
      }
      p = p.getParent();
    }
    return false;
  }
  /**
   * Returns a string representing the state of this {@code Container}.
   * This method is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not be
   * {@code null}.
   *
   * @return    the parameter string of this container
   */
  paramString(): string {
    let str = super.paramString();
    let layoutMgr = this.layoutMgr;
    if (layoutMgr != null) {
      str += ',layout=' + layoutMgr.getClass().getName();
    }
    return str;
  }
  /**
   * Prints a listing of this container to the specified output
   * stream. The listing starts at the specified indentation.
   * <p>
   * The immediate children of the container are printed with
   * an indentation of {@code indent+1}.  The children
   * of those children are printed at {@code indent+2}
   * and so on.
   *
   * @param    out      a print stream
   * @param    indent   the number of spaces to indent
   * @throws   NullPointerException if {@code out} is {@code null}
   * @see      Component#list(java.io.PrintStream, int)
   * @since    1.0
   */
  list$PrintStream$int(out: PrintStream, indent: number): void {
    super.list$PrintStream$int(out, indent);
    {
      for (let i = 0; i < this.component.size(); i++) {
        let comp = this.component.get(i);
        if (comp != null) {
          comp.list$PrintStream$int(out, (indent + 1) | 0);
        }
      }
    }
  }
  /**
   * Sets the focus traversal keys for a given traversal operation for this
   * Container.
   * <p>
   * The default values for a Container's focus traversal keys are
   * implementation-dependent. Sun recommends that all implementations for a
   * particular native platform use the same default values. The
   * recommendations for Windows and Unix are listed below. These
   * recommendations are used in the Sun AWT implementations.
   *
   * <table class="striped">
   * <caption>Recommended default values for a Container's focus traversal
   * keys</caption>
   * <thead>
   *   <tr>
   *     <th scope="col">Identifier
   *     <th scope="col">Meaning
   *     <th scope="col">Default
   * </thead>
   * <tbody>
   *   <tr>
   *     <th scope="row">KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS
   *     <td>Normal forward keyboard traversal
   *     <td>TAB on KEY_PRESSED, CTRL-TAB on KEY_PRESSED
   *   <tr>
   *     <th scope="row">KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS
   *     <td>Normal reverse keyboard traversal
   *     <td>SHIFT-TAB on KEY_PRESSED, CTRL-SHIFT-TAB on KEY_PRESSED
   *   <tr>
   *     <th scope="row">KeyboardFocusManager.UP_CYCLE_TRAVERSAL_KEYS
   *     <td>Go up one focus traversal cycle
   *     <td>none
   *   <tr>
   *     <th scope="row">KeyboardFocusManager.DOWN_CYCLE_TRAVERSAL_KEYS
   *     <td>Go down one focus traversal cycle
   *     <td>none
   * </tbody>
   * </table>
   *
   * To disable a traversal key, use an empty Set; Collections.EMPTY_SET is
   * recommended.
   * <p>
   * Using the AWTKeyStroke API, client code can specify on which of two
   * specific KeyEvents, KEY_PRESSED or KEY_RELEASED, the focus traversal
   * operation will occur. Regardless of which KeyEvent is specified,
   * however, all KeyEvents related to the focus traversal key, including the
   * associated KEY_TYPED event, will be consumed, and will not be dispatched
   * to any Container. It is a runtime error to specify a KEY_TYPED event as
   * mapping to a focus traversal operation, or to map the same event to
   * multiple default focus traversal operations.
   * <p>
   * If a value of null is specified for the Set, this Container inherits the
   * Set from its parent. If all ancestors of this Container have null
   * specified for the Set, then the current KeyboardFocusManager's default
   * Set is used.
   * <p>
   * This method may throw a {@code ClassCastException} if any {@code Object}
   * in {@code keystrokes} is not an {@code AWTKeyStroke}.
   *
   * @param id one of KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS,
   *        KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS,
   *        KeyboardFocusManager.UP_CYCLE_TRAVERSAL_KEYS, or
   *        KeyboardFocusManager.DOWN_CYCLE_TRAVERSAL_KEYS
   * @param keystrokes the Set of AWTKeyStroke for the specified operation
   * @see #getFocusTraversalKeys
   * @see KeyboardFocusManager#FORWARD_TRAVERSAL_KEYS
   * @see KeyboardFocusManager#BACKWARD_TRAVERSAL_KEYS
   * @see KeyboardFocusManager#UP_CYCLE_TRAVERSAL_KEYS
   * @see KeyboardFocusManager#DOWN_CYCLE_TRAVERSAL_KEYS
   * @throws IllegalArgumentException if id is not one of
   *         KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS,
   *         KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS,
   *         KeyboardFocusManager.UP_CYCLE_TRAVERSAL_KEYS, or
   *         KeyboardFocusManager.DOWN_CYCLE_TRAVERSAL_KEYS, or if keystrokes
   *         contains null, or if any keystroke represents a KEY_TYPED event,
   *         or if any keystroke already maps to another focus traversal
   *         operation for this Container
   * @since 1.4
   */
  setFocusTraversalKeys(id: number, keystrokes: JSet<AWTKeyStroke>): void {
    if (id < 0 || id >= KeyboardFocusManager.TRAVERSAL_KEY_LENGTH) {
      throw new IllegalArgumentException('invalid focus traversal key identifier');
    }
    this.setFocusTraversalKeys_NoIDCheck(id, keystrokes);
  }
  /**
   * Returns the Set of focus traversal keys for a given traversal operation
   * for this Container. (See
   * {@code setFocusTraversalKeys} for a full description of each key.)
   * <p>
   * If a Set of traversal keys has not been explicitly defined for this
   * Container, then this Container's parent's Set is returned. If no Set
   * has been explicitly defined for any of this Container's ancestors, then
   * the current KeyboardFocusManager's default Set is returned.
   *
   * @param id one of KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS,
   *        KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS,
   *        KeyboardFocusManager.UP_CYCLE_TRAVERSAL_KEYS, or
   *        KeyboardFocusManager.DOWN_CYCLE_TRAVERSAL_KEYS
   * @return the Set of AWTKeyStrokes for the specified operation. The Set
   *         will be unmodifiable, and may be empty. null will never be
   *         returned.
   * @see #setFocusTraversalKeys
   * @see KeyboardFocusManager#FORWARD_TRAVERSAL_KEYS
   * @see KeyboardFocusManager#BACKWARD_TRAVERSAL_KEYS
   * @see KeyboardFocusManager#UP_CYCLE_TRAVERSAL_KEYS
   * @see KeyboardFocusManager#DOWN_CYCLE_TRAVERSAL_KEYS
   * @throws IllegalArgumentException if id is not one of
   *         KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS,
   *         KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS,
   *         KeyboardFocusManager.UP_CYCLE_TRAVERSAL_KEYS, or
   *         KeyboardFocusManager.DOWN_CYCLE_TRAVERSAL_KEYS
   * @since 1.4
   */
  getFocusTraversalKeys(id: number): JSet<AWTKeyStroke> {
    if (id < 0 || id >= KeyboardFocusManager.TRAVERSAL_KEY_LENGTH) {
      throw new IllegalArgumentException('invalid focus traversal key identifier');
    }
    return this.getFocusTraversalKeys_NoIDCheck(id);
  }
  /**
   * Returns whether the specified Container is the focus cycle root of this
   * Container's focus traversal cycle. Each focus traversal cycle has only
   * a single focus cycle root and each Container which is not a focus cycle
   * root belongs to only a single focus traversal cycle. Containers which
   * are focus cycle roots belong to two cycles: one rooted at the Container
   * itself, and one rooted at the Container's nearest focus-cycle-root
   * ancestor. This method will return {@code true} for both such
   * Containers in this case.
   *
   * @param container the Container to be tested
   * @return {@code true} if the specified Container is a focus-cycle-
   *         root of this Container; {@code false} otherwise
   * @see #isFocusCycleRoot()
   * @since 1.4
   */
  isFocusCycleRoot$Container(container: Container): boolean {
    if (this.isFocusCycleRoot$() && container === this) {
      return true;
    } else {
      return super.isFocusCycleRoot$Container(container);
    }
  }
  findTraversalRoot(): Container {
    let currentFocusCycleRoot = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getCurrentFocusCycleRoot();
    let root: Container;
    if (currentFocusCycleRoot === this) {
      root = this;
    } else {
      root = this.getFocusCycleRootAncestor();
      if (root == null) {
        root = this;
      }
    }
    if (root !== currentFocusCycleRoot) {
      KeyboardFocusManager.getCurrentKeyboardFocusManager$().setGlobalCurrentFocusCycleRootPriv(root);
    }
    return root;
  }
  containsFocus(): boolean {
    let focusOwner = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner();
    return this.isParentOf(focusOwner);
  }
  /**
   * Check if this component is the child of this container or its children.
   * Note: this function acquires treeLock
   * Note: this function traverses children tree only in one Window.
   * @param comp a component in test, must not be null
   */
  isParentOf(comp: Component): boolean {
    {
      while (comp != null && comp !== this && !(comp instanceof Window)) {
        comp = comp.getParent();
      }
      return (comp === this);
    }
  }
  clearMostRecentFocusOwnerOnHide(): void {
    let reset = false;
    let window = null;
    {
      window = this.getContainingWindow();
      if (window != null) {
        let comp = KeyboardFocusManager.getMostRecentFocusOwner(window);
        reset = ((comp === this) || this.isParentOf(comp));
        {
          let storedComp = window.getTemporaryLostComponent();
          if (this.isParentOf(storedComp) || storedComp === this) {
            window.setTemporaryLostComponent(null);
          }
        }
      }
    }
    if (reset) {
      KeyboardFocusManager.setMostRecentFocusOwner$Window$Component(window, null);
    }
  }
  clearCurrentFocusCycleRootOnHide(): void {
    let kfm = KeyboardFocusManager.getCurrentKeyboardFocusManager$();
    let cont = kfm.getCurrentFocusCycleRoot();
    if (cont === this || this.isParentOf(cont)) {
      kfm.setGlobalCurrentFocusCycleRootPriv(null);
    }
  }
  getTraversalRoot(): Container {
    if (this.isFocusCycleRoot$()) {
      return this.findTraversalRoot();
    }
    return super.getTraversalRoot();
  }
  /**
   * Sets the focus traversal policy that will manage keyboard traversal of
   * this Container's children, if this Container is a focus cycle root. If
   * the argument is null, this Container inherits its policy from its focus-
   * cycle-root ancestor. If the argument is non-null, this policy will be
   * inherited by all focus-cycle-root children that have no keyboard-
   * traversal policy of their own (as will, recursively, their focus-cycle-
   * root children).
   * <p>
   * If this Container is not a focus cycle root, the policy will be
   * remembered, but will not be used or inherited by this or any other
   * Containers until this Container is made a focus cycle root.
   *
   * @param policy the new focus traversal policy for this Container
   * @see #getFocusTraversalPolicy
   * @see #setFocusCycleRoot
   * @see #isFocusCycleRoot
   * @since 1.4
   */
  setFocusTraversalPolicy(policy: FocusTraversalPolicy): void {
    let oldPolicy: FocusTraversalPolicy;
    {
      oldPolicy = this.focusTraversalPolicy;
      this.focusTraversalPolicy = policy;
    }
    this.firePropertyChange$String$Object$Object('focusTraversalPolicy', oldPolicy, policy);
  }
  /**
   * Returns the focus traversal policy that will manage keyboard traversal
   * of this Container's children, or null if this Container is not a focus
   * cycle root. If no traversal policy has been explicitly set for this
   * Container, then this Container's focus-cycle-root ancestor's policy is
   * returned.
   *
   * @return this Container's focus traversal policy, or null if this
   *         Container is not a focus cycle root.
   * @see #setFocusTraversalPolicy
   * @see #setFocusCycleRoot
   * @see #isFocusCycleRoot
   * @since 1.4
   */
  getFocusTraversalPolicy(): FocusTraversalPolicy {
    if (!this.isFocusTraversalPolicyProvider() && !this.isFocusCycleRoot$()) {
      return null;
    }
    let policy = this.focusTraversalPolicy;
    if (policy != null) {
      return policy;
    }
    let rootAncestor = this.getFocusCycleRootAncestor();
    if (rootAncestor != null) {
      return rootAncestor.getFocusTraversalPolicy();
    } else {
      return KeyboardFocusManager.getCurrentKeyboardFocusManager$().getDefaultFocusTraversalPolicy();
    }
  }
  /**
   * Sets whether this Container is the root of a focus traversal cycle. Once
   * focus enters a traversal cycle, typically it cannot leave it via focus
   * traversal unless one of the up- or down-cycle keys is pressed. Normal
   * traversal is limited to this Container, and all of this Container's
   * descendants that are not descendants of inferior focus cycle roots. Note
   * that a FocusTraversalPolicy may bend these restrictions, however. For
   * example, ContainerOrderFocusTraversalPolicy supports implicit down-cycle
   * traversal.
   * <p>
   * The alternative way to specify the traversal order of this Container's
   * children is to make this Container a
   * <a href="doc-files/FocusSpec.html#FocusTraversalPolicyProviders">focus traversal policy provider</a>.
   *
   * @param focusCycleRoot indicates whether this Container is the root of a
   *        focus traversal cycle
   * @see #isFocusCycleRoot()
   * @see #setFocusTraversalPolicy
   * @see #getFocusTraversalPolicy
   * @see ContainerOrderFocusTraversalPolicy
   * @see #setFocusTraversalPolicyProvider
   * @since 1.4
   */
  setFocusCycleRoot(focusCycleRoot: boolean): void {
    let oldFocusCycleRoot: boolean;
    {
      oldFocusCycleRoot = this.focusCycleRoot;
      this.focusCycleRoot = focusCycleRoot;
    }
    this.firePropertyChange$String$boolean$boolean('focusCycleRoot', oldFocusCycleRoot, focusCycleRoot);
  }
  /**
   * Returns whether this Container is the root of a focus traversal cycle.
   * Once focus enters a traversal cycle, typically it cannot leave it via
   * focus traversal unless one of the up- or down-cycle keys is pressed.
   * Normal traversal is limited to this Container, and all of this
   * Container's descendants that are not descendants of inferior focus
   * cycle roots. Note that a FocusTraversalPolicy may bend these
   * restrictions, however. For example, ContainerOrderFocusTraversalPolicy
   * supports implicit down-cycle traversal.
   *
   * @return whether this Container is the root of a focus traversal cycle
   * @see #setFocusCycleRoot
   * @see #setFocusTraversalPolicy
   * @see #getFocusTraversalPolicy
   * @see ContainerOrderFocusTraversalPolicy
   * @since 1.4
   */
  isFocusCycleRoot$(): boolean {
    return this.focusCycleRoot;
  }
  /**
   * Returns whether this container provides focus traversal
   * policy. If this property is set to {@code true} then when
   * keyboard focus manager searches container hierarchy for focus
   * traversal policy and encounters this container before any other
   * container with this property as true or focus cycle roots then
   * its focus traversal policy will be used instead of focus cycle
   * root's policy.
   * @see #setFocusTraversalPolicy
   * @see #getFocusTraversalPolicy
   * @see #setFocusCycleRoot
   * @see #setFocusTraversalPolicyProvider
   * @return {@code true} if this container provides focus traversal
   *         policy, {@code false} otherwise
   * @since 1.5
   */
  isFocusTraversalPolicyProvider(): boolean {
    return this.focusTraversalPolicyProvider;
  }
  /**
   * Transfers the focus down one focus traversal cycle. If this Container is
   * a focus cycle root, then the focus owner is set to this Container's
   * default Component to focus, and the current focus cycle root is set to
   * this Container. If this Container is not a focus cycle root, then no
   * focus traversal operation occurs.
   *
   * @see       Component#requestFocus()
   * @see       #isFocusCycleRoot
   * @see       #setFocusCycleRoot
   * @since     1.4
   */
  transferFocusDownCycle(): void {
    if (this.isFocusCycleRoot$()) {
      KeyboardFocusManager.getCurrentKeyboardFocusManager$().setGlobalCurrentFocusCycleRootPriv(this);
      let toFocus = this.getFocusTraversalPolicy().getDefaultComponent(this);
      if (toFocus != null) {
        toFocus.requestFocus$Cause(FocusEvent$Cause.TRAVERSAL_DOWN);
      }
    }
  }
  preProcessKeyEvent(e: KeyEvent): void {
    let parent = this.parent;
    if (parent != null) {
      parent.preProcessKeyEvent(e);
    }
  }
  postProcessKeyEvent(e: KeyEvent): void {
    let parent = this.parent;
    if (parent != null) {
      parent.postProcessKeyEvent(e);
    }
  }
  postsOldMouseEvents(): boolean {
    return true;
  }
  /**
   * Sets the {@code ComponentOrientation} property of this container
   * and all components contained within it.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param o the new component orientation of this container and
   *        the components contained within it.
   * @throws NullPointerException if {@code orientation} is null.
   * @see Component#setComponentOrientation
   * @see Component#getComponentOrientation
   * @see #invalidate
   * @since 1.4
   */
  applyComponentOrientation(o: ComponentOrientation): void {
    super.applyComponentOrientation(o);
    {
      for (let i = 0; i < this.component.size(); i++) {
        let comp = this.component.get(i);
        comp.applyComponentOrientation(o);
      }
    }
  }
  /**
   * Adds a PropertyChangeListener to the listener list. The listener is
   * registered for all bound properties of this class, including the
   * following:
   * <ul>
   *    <li>this Container's font ("font")</li>
   *    <li>this Container's background color ("background")</li>
   *    <li>this Container's foreground color ("foreground")</li>
   *    <li>this Container's focusability ("focusable")</li>
   *    <li>this Container's focus traversal keys enabled state
   *        ("focusTraversalKeysEnabled")</li>
   *    <li>this Container's Set of FORWARD_TRAVERSAL_KEYS
   *        ("forwardFocusTraversalKeys")</li>
   *    <li>this Container's Set of BACKWARD_TRAVERSAL_KEYS
   *        ("backwardFocusTraversalKeys")</li>
   *    <li>this Container's Set of UP_CYCLE_TRAVERSAL_KEYS
   *        ("upCycleFocusTraversalKeys")</li>
   *    <li>this Container's Set of DOWN_CYCLE_TRAVERSAL_KEYS
   *        ("downCycleFocusTraversalKeys")</li>
   *    <li>this Container's focus traversal policy ("focusTraversalPolicy")
   *        </li>
   *    <li>this Container's focus-cycle-root state ("focusCycleRoot")</li>
   * </ul>
   * Note that if this Container is inheriting a bound property, then no
   * event will be fired in response to a change in the inherited property.
   * <p>
   * If listener is null, no exception is thrown and no action is performed.
   *
   * @param    listener  the PropertyChangeListener to be added
   *
   * @see Component#removePropertyChangeListener
   * @see #addPropertyChangeListener(java.lang.String,java.beans.PropertyChangeListener)
   */
  addPropertyChangeListener$PropertyChangeListener(listener: PropertyChangeListener): void {
    super.addPropertyChangeListener$PropertyChangeListener(listener);
  }
  /**
   * Adds a PropertyChangeListener to the listener list for a specific
   * property. The specified property may be user-defined, or one of the
   * following defaults:
   * <ul>
   *    <li>this Container's font ("font")</li>
   *    <li>this Container's background color ("background")</li>
   *    <li>this Container's foreground color ("foreground")</li>
   *    <li>this Container's focusability ("focusable")</li>
   *    <li>this Container's focus traversal keys enabled state
   *        ("focusTraversalKeysEnabled")</li>
   *    <li>this Container's Set of FORWARD_TRAVERSAL_KEYS
   *        ("forwardFocusTraversalKeys")</li>
   *    <li>this Container's Set of BACKWARD_TRAVERSAL_KEYS
   *        ("backwardFocusTraversalKeys")</li>
   *    <li>this Container's Set of UP_CYCLE_TRAVERSAL_KEYS
   *        ("upCycleFocusTraversalKeys")</li>
   *    <li>this Container's Set of DOWN_CYCLE_TRAVERSAL_KEYS
   *        ("downCycleFocusTraversalKeys")</li>
   *    <li>this Container's focus traversal policy ("focusTraversalPolicy")
   *        </li>
   *    <li>this Container's focus-cycle-root state ("focusCycleRoot")</li>
   *    <li>this Container's focus-traversal-policy-provider state("focusTraversalPolicyProvider")</li>
   *    <li>this Container's focus-traversal-policy-provider state("focusTraversalPolicyProvider")</li>
   * </ul>
   * Note that if this Container is inheriting a bound property, then no
   * event will be fired in response to a change in the inherited property.
   * <p>
   * If listener is null, no exception is thrown and no action is performed.
   *
   * @param propertyName one of the property names listed above
   * @param listener the PropertyChangeListener to be added
   *
   * @see #addPropertyChangeListener(java.beans.PropertyChangeListener)
   * @see Component#removePropertyChangeListener
   */
  addPropertyChangeListener$String$PropertyChangeListener(propertyName: string, listener: PropertyChangeListener): void {
    super.addPropertyChangeListener$String$PropertyChangeListener(propertyName, listener);
  }
  /**
   * Returns the number of accessible children in the object.  If all
   * of the children of this object implement {@code Accessible},
   * then this method should return the number of children of this object.
   *
   * @return the number of accessible children in the object
   */
  getAccessibleChildrenCount(): number {
    {
      let count = 0;
      let children = this.getComponents();
      for (let i = 0; i < children.length; i++) {
        if ($J.isa(children[i], Accessible)) {
          count++;
        }
      }
      return count;
    }
  }
  /**
   * Returns the nth {@code Accessible} child of the object.
   *
   * @param i zero-based index of child
   * @return the nth {@code Accessible} child of the object
   */
  getAccessibleChild(i: number): Accessible {
    {
      let children = this.getComponents();
      let count = 0;
      for (let j = 0; j < children.length; j++) {
        if ($J.isa(children[j], Accessible)) {
          if (count === i) {
            return children[j];
          } else {
            count++;
          }
        }
      }
      return null;
    }
  }
  increaseComponentCount(c: Component): void {
    {
      if (!c.isDisplayable()) {
        throw new IllegalStateException('Peer does not exist while invoking the increaseComponentCount() method');
      }
      let addHW = 0;
      let addLW = 0;
      if (c instanceof Container) {
        addLW = (c).numOfLWComponents;
        addHW = (c).numOfHWComponents;
      }
      if (c.isLightweight()) {
        addLW++;
      } else {
        addHW++;
      }
      for (let cont = this; cont != null; cont = cont.getContainer()) {
        cont.numOfLWComponents = (cont.numOfLWComponents + addLW) | 0;
        cont.numOfHWComponents = (cont.numOfHWComponents + addHW) | 0;
      }
    }
  }
  decreaseComponentCount(c: Component): void {
    {
      if (!c.isDisplayable()) {
        throw new IllegalStateException('Peer does not exist while invoking the decreaseComponentCount() method');
      }
      let subHW = 0;
      let subLW = 0;
      if (c instanceof Container) {
        subLW = (c).numOfLWComponents;
        subHW = (c).numOfHWComponents;
      }
      if (c.isLightweight()) {
        subLW++;
      } else {
        subHW++;
      }
      for (let cont = this; cont != null; cont = cont.getContainer()) {
        cont.numOfLWComponents = (cont.numOfLWComponents - subLW) | 0;
        cont.numOfHWComponents = (cont.numOfHWComponents - subHW) | 0;
      }
    }
  }
  getTopmostComponentIndex(): number {
    this.checkTreeLock();
    if (this.getComponentCount() > 0) {
      return 0;
    }
    return -1;
  }
  getBottommostComponentIndex(): number {
    this.checkTreeLock();
    if (this.getComponentCount() > 0) {
      return (this.getComponentCount() - 1) | 0;
    }
    return -1;
  }
  getOpaqueShape(): Region {
    this.checkTreeLock();
    if (this.isLightweight() && this.isNonOpaqueForMixing() && this.hasLightweightDescendants()) {
      let s = Region.EMPTY_REGION;
      for (let index = 0; index < this.getComponentCount(); index++) {
        let c = this.getComponent$int(index);
        if (c.isLightweight() && c.isShowing()) {
          s = s.getUnion(c.getOpaqueShape());
        }
      }
      return s.getIntersection(this.getNormalShape());
    }
    return super.getOpaqueShape();
  }
  recursiveSubtractAndApplyShape$Region(shape: Region): void {
    this.recursiveSubtractAndApplyShape$Region$int$int(shape, this.getTopmostComponentIndex(), this.getBottommostComponentIndex());
  }
  recursiveSubtractAndApplyShape$Region$int(shape: Region, fromZorder: number): void {
    this.recursiveSubtractAndApplyShape$Region$int$int(shape, fromZorder, this.getBottommostComponentIndex());
  }
  recursiveSubtractAndApplyShape$Region$int$int(shape: Region, fromZorder: number, toZorder: number): void {
    this.checkTreeLock();
    if (Container.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
      Container.mixingLog.fine('this = ' + $J.str(this) + '; shape=' + $J.str(shape) + '; fromZ=' + fromZorder + '; toZ=' + toZorder);
    }
    if (fromZorder === -1) {
      return;
    }
    if (shape.isEmpty()) {
      return;
    }
    if (this.getLayout() != null && !this.isValid()) {
      return;
    }
    for (let index = fromZorder; index <= toZorder; index++) {
      let comp = this.getComponent$int(index);
      if (!comp.isLightweight()) {
        comp.subtractAndApplyShape(shape);
      } else if (comp instanceof Container && (comp).hasHeavyweightDescendants() && comp.isShowing()) {
        (comp).recursiveSubtractAndApplyShape$Region(shape);
      }
    }
  }
  recursiveApplyCurrentShape$(): void {
    this.recursiveApplyCurrentShape$int$int(this.getTopmostComponentIndex(), this.getBottommostComponentIndex());
  }
  recursiveApplyCurrentShape$int(fromZorder: number): void {
    this.recursiveApplyCurrentShape$int$int(fromZorder, this.getBottommostComponentIndex());
  }
  recursiveApplyCurrentShape$int$int(fromZorder: number, toZorder: number): void {
    this.checkTreeLock();
    if (Container.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
      Container.mixingLog.fine('this = ' + $J.str(this) + '; fromZ=' + fromZorder + '; toZ=' + toZorder);
    }
    if (fromZorder === -1) {
      return;
    }
    if (this.getLayout() != null && !this.isValid()) {
      return;
    }
    for (let index = fromZorder; index <= toZorder; index++) {
      let comp = this.getComponent$int(index);
      if (!comp.isLightweight()) {
        comp.applyCurrentShape();
      }
      if (comp instanceof Container && (comp).hasHeavyweightDescendants()) {
        (comp).recursiveApplyCurrentShape$();
      }
    }
  }
  recursiveShowHeavyweightChildren(): void {
    if (!this.hasHeavyweightDescendants() || !this.isVisible$()) {
      return;
    }
    for (let index = 0; index < this.getComponentCount(); index++) {
      let comp = this.getComponent$int(index);
      if (comp.isLightweight()) {
        if (comp instanceof Container) {
          (comp).recursiveShowHeavyweightChildren();
        }
      } else {
        if (comp.isVisible$()) {
          let peer = comp.peer;
          if (peer != null) {
            peer.setVisible(true);
          }
        }
      }
    }
  }
  recursiveHideHeavyweightChildren(): void {
    if (!this.hasHeavyweightDescendants()) {
      return;
    }
    for (let index = 0; index < this.getComponentCount(); index++) {
      let comp = this.getComponent$int(index);
      if (comp.isLightweight()) {
        if (comp instanceof Container) {
          (comp).recursiveHideHeavyweightChildren();
        }
      } else {
        if (comp.isVisible$()) {
          let peer = comp.peer;
          if (peer != null) {
            peer.setVisible(false);
          }
        }
      }
    }
  }
  recursiveRelocateHeavyweightChildren(origin: Point): void {
    for (let index = 0; index < this.getComponentCount(); index++) {
      let comp = this.getComponent$int(index);
      if (comp.isLightweight()) {
        if (comp instanceof Container && (comp).hasHeavyweightDescendants()) {
          let newOrigin = new Point()._Point$Point(origin);
          newOrigin.translate(comp.getX(), comp.getY());
          (comp).recursiveRelocateHeavyweightChildren(newOrigin);
        }
      } else {
        let peer = comp.peer;
        if (peer != null) {
          peer.setBounds((origin.x_ + comp.getX()) | 0, (origin.y_ + comp.getY()) | 0, comp.getWidth(), comp.getHeight(), 1);
        }
      }
    }
  }
  /**
   * Checks if the container and its direct lightweight containers are
   * visible.
   *
   * Consider the heavyweight container hides or shows the HW descendants
   * automatically. Therefore we care of LW containers' visibility only.
   *
   * This method MUST be invoked under the TreeLock.
   */
  isRecursivelyVisibleUpToHeavyweightContainer(): boolean {
    if (!this.isLightweight()) {
      return true;
    }
    for (let cont = this; cont != null && cont.isLightweight(); cont = cont.getContainer()) {
      if (!cont.isVisible$()) {
        return false;
      }
    }
    return true;
  }
  mixOnShowing(): void {
    {
      if (Container.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Container.mixingLog.fine('this = ' + $J.str(this));
      }
      let isLightweight = this.isLightweight();
      if (isLightweight && this.isRecursivelyVisibleUpToHeavyweightContainer()) {
        this.recursiveShowHeavyweightChildren();
      }
      if (!this.isMixingNeeded()) {
        return;
      }
      if (!isLightweight || (isLightweight && this.hasHeavyweightDescendants())) {
        this.recursiveApplyCurrentShape$();
      }
      super.mixOnShowing();
    }
  }
  mixOnHiding(isLightweight: boolean): void {
    {
      if (Container.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Container.mixingLog.fine('this = ' + $J.str(this) + '; isLightweight=' + isLightweight);
      }
      if (isLightweight) {
        this.recursiveHideHeavyweightChildren();
      }
      super.mixOnHiding(isLightweight);
    }
  }
  mixOnReshaping(): void {
    {
      if (Container.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Container.mixingLog.fine('this = ' + $J.str(this));
      }
      let isMixingNeeded = this.isMixingNeeded();
      if (this.isLightweight() && this.hasHeavyweightDescendants()) {
        let origin = new Point()._Point$int$int(this.getX(), this.getY());
        for (let cont = this.getContainer(); cont != null && cont.isLightweight(); cont = cont.getContainer()) {
          origin.translate(cont.getX(), cont.getY());
        }
        this.recursiveRelocateHeavyweightChildren(origin);
        if (!isMixingNeeded) {
          return;
        }
        this.recursiveApplyCurrentShape$();
      }
      if (!isMixingNeeded) {
        return;
      }
      super.mixOnReshaping();
    }
  }
  mixOnZOrderChanging(oldZorder: number, newZorder: number): void {
    {
      if (Container.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Container.mixingLog.fine('this = ' + $J.str(this) + '; oldZ=' + oldZorder + '; newZ=' + newZorder);
      }
      if (!this.isMixingNeeded()) {
        return;
      }
      let becameHigher = newZorder < oldZorder;
      if (becameHigher && this.isLightweight() && this.hasHeavyweightDescendants()) {
        this.recursiveApplyCurrentShape$();
      }
      super.mixOnZOrderChanging(oldZorder, newZorder);
    }
  }
  mixOnValidating(): void {
    {
      if (Container.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Container.mixingLog.fine('this = ' + $J.str(this));
      }
      if (!this.isMixingNeeded()) {
        return;
      }
      if (this.hasHeavyweightDescendants()) {
        this.recursiveApplyCurrentShape$();
      }
      if (this.isLightweight() && this.isNonOpaqueForMixing()) {
        this.subtractAndApplyShapeBelowMe();
      }
      super.mixOnValidating();
    }
  }
  static $clinit() {
    Container.log = PlatformLogger.getLogger('java.awt.Container');
    Container.eventLog = PlatformLogger.getLogger('java.awt.event.Container');
    Container.EMPTY_ARRAY = $J.newArray(0, null);
    Container.mixingLog = PlatformLogger.getLogger('java.awt.mixing.Container');
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      Container.initIDs();
    }
    AWTAccessor.setContainerAccessor(new (Container$1())());
    Container.isJavaAwtSmartInvalidate = AccessController.doPrivileged(new GetBooleanAction('java.awt.smartInvalidate'));
    Container.descendUnconditionallyWhenValidating = false;
  }
}

export class Container$EventTargetFilter {
}

export class Container$MouseEventTargetFilter extends JObject {
  static FILTER: Container$EventTargetFilter = null;
  _Container$MouseEventTargetFilter(): this {
    return this;
  }
  accept(comp: Component): boolean {
    return ($J.land(comp.eventMask, AWTEvent.MOUSE_MOTION_EVENT_MASK)) !== 0 || ($J.land(comp.eventMask, AWTEvent.MOUSE_EVENT_MASK)) !== 0 || ($J.land(comp.eventMask, AWTEvent.MOUSE_WHEEL_EVENT_MASK)) !== 0 || comp.mouseListener != null || comp.mouseMotionListener != null || comp.mouseWheelListener != null;
  }
  static $clinit() {
    Container$MouseEventTargetFilter.FILTER = new Container$MouseEventTargetFilter()._Container$MouseEventTargetFilter();
  }
}

export class Container$DropTargetEventTargetFilter extends JObject {
  static FILTER: Container$EventTargetFilter = null;
  _Container$DropTargetEventTargetFilter(): this {
    return this;
  }
  accept(comp: Component): boolean {
    let dt = comp.getDropTarget();
    return dt != null && dt.isActive();
  }
  static $clinit() {
    Container$DropTargetEventTargetFilter.FILTER = new Container$DropTargetEventTargetFilter()._Container$DropTargetEventTargetFilter();
  }
}

/**
 * Inner class of Container used to provide default support for
 * accessibility.  This class is not meant to be used directly by
 * application developers, but is instead meant only to be
 * subclassed by container developers.
 * <p>
 * The class used to obtain the accessible role for this object,
 * as well as implementing many of the methods in the
 * AccessibleContainer interface.
 * @since 1.3
 */
export class Container$AccessibleAWTContainer extends Component$AccessibleAWTComponent {
  /**
   * Number of PropertyChangeListener objects registered. It's used
   * to add/remove ContainerListener to track target Container's state.
   */
  propertyListenersCount$Container_AccessibleAWTContainer: number = 0;
  /**
   * The handler to fire {@code PropertyChange}
   * when children are added or removed
   */
  accessibleContainerHandler: ContainerListener = null;
  /**
   * Constructs an {@code AccessibleAWTContainer}.
   */
  _Container$AccessibleAWTContainer(): this {
    this._Component$AccessibleAWTComponent();
    this.accessibleContainerHandler = null;
    return this;
  }
  /**
   * Returns the number of accessible children in the object.  If all
   * of the children of this object implement {@code Accessible},
   * then this method should return the number of children of this object.
   *
   * @return the number of accessible children in the object
   */
  getAccessibleChildrenCount(): number {
    return this.$outer.getAccessibleChildrenCount();
  }
  /**
   * Returns the nth {@code Accessible} child of the object.
   *
   * @param i zero-based index of child
   * @return the nth {@code Accessible} child of the object
   */
  getAccessibleChild(i: number): Accessible {
    return this.$outer.getAccessibleChild(i);
  }
}

let $Container$1: any = null;
/** An anonymous class (Container.java:264). */
function Container$1(): any {
  return $Container$1 ??= $J.local(class extends JObject {
  }, 'java.awt.Container$1', ['sun.awt.AWTAccessor$ContainerAccessor']);
}

$J.define(Container, 'java.awt.Container', { kind: 'class', sup: 'java.awt.Component', ctors: { '': '_Container' }, meths: { 'recursiveApplyCurrentShape(int,int)': 'recursiveApplyCurrentShape$int$int', 'recursiveApplyCurrentShape(int)': 'recursiveApplyCurrentShape$int', 'recursiveApplyCurrentShape()': 'recursiveApplyCurrentShape$', 'recursiveSubtractAndApplyShape(sun.java2d.pipe.Region,int,int)': 'recursiveSubtractAndApplyShape$Region$int$int', 'recursiveSubtractAndApplyShape(sun.java2d.pipe.Region,int)': 'recursiveSubtractAndApplyShape$Region$int', 'recursiveSubtractAndApplyShape(sun.java2d.pipe.Region)': 'recursiveSubtractAndApplyShape$Region', 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Container', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$Container', 'addPropertyChangeListener(java.lang.String,java.beans.PropertyChangeListener)': 'addPropertyChangeListener$String$PropertyChangeListener', 'addPropertyChangeListener(java.beans.PropertyChangeListener)': 'addPropertyChangeListener$PropertyChangeListener', 'isFocusCycleRoot()': 'isFocusCycleRoot$', 'isFocusCycleRoot(java.awt.Container)': 'isFocusCycleRoot$Container', 'list(java.io.PrintWriter,int)': 'list$PrintWriter$int', 'list(java.io.PrintStream,int)': 'list$PrintStream$int', 'findComponentAt(java.awt.Point)': 'findComponentAt$Point', 'findComponentAt(int,int,boolean)': 'findComponentAt$int$int$boolean', 'findComponentAt(int,int)': 'findComponentAt$int$int', 'getMousePosition(boolean)': 'getMousePosition$boolean', 'getComponentAt(java.awt.Point)': 'getComponentAt$Point', 'getComponentAt(int,int)': 'getComponentAt$int$int', 'getMouseEventTarget(int,int,boolean,java.awt.Container$EventTargetFilter,boolean)': 'getMouseEventTarget$int$int$boolean$EventTargetFilter$boolean$Container', 'getMouseEventTarget(int,int,boolean)': 'getMouseEventTarget$int$int$boolean', 'print(java.awt.Graphics)': 'print$Graphics', 'update(java.awt.Graphics)': 'update$Graphics', 'minimumSize()': 'minimumSize$', 'getMinimumSize()': 'getMinimumSize$', 'preferredSize()': 'preferredSize$', 'getPreferredSize()': 'getPreferredSize$', 'isValidateRoot()': 'isValidateRoot$', 'remove(java.awt.Component)': 'remove$Component', 'remove(int)': 'remove$int', 'add(java.awt.Component,java.lang.Object,int)': 'add$Component$Object$int', 'add(java.awt.Component,java.lang.Object)': 'add$Component$Object', 'add(java.awt.Component,int)': 'add$Component$int', 'add(java.lang.String,java.awt.Component)': 'add$String$Component', 'add(java.awt.Component)': 'add$Component', 'getInsets()': 'getInsets$', 'getComponent(int)': 'getComponent$int' }, clinit: true, lazy: ['log', 'eventLog', 'EMPTY_ARRAY', 'mixingLog', 'serialPersistentFields', 'isJavaAwtSmartInvalidate', 'descendUnconditionallyWhenValidating'] });
$J.define(Container$EventTargetFilter, 'java.awt.Container$EventTargetFilter', { kind: 'interface' });
$J.define(Container$MouseEventTargetFilter, 'java.awt.Container$MouseEventTargetFilter', { kind: 'class', ifaces: ['java.awt.Container$EventTargetFilter'], sup: 'java.lang.Object', ctors: { '': '_Container$MouseEventTargetFilter' }, clinit: true, lazy: ['FILTER'] });
$J.define(Container$DropTargetEventTargetFilter, 'java.awt.Container$DropTargetEventTargetFilter', { kind: 'class', ifaces: ['java.awt.Container$EventTargetFilter'], sup: 'java.lang.Object', ctors: { '': '_Container$DropTargetEventTargetFilter' }, clinit: true, lazy: ['FILTER'] });
$J.define(Container$AccessibleAWTContainer, 'java.awt.Container$AccessibleAWTContainer', { kind: 'class', sup: 'java.awt.Component$AccessibleAWTComponent', ctors: { '': '_Container$AccessibleAWTContainer' }, meths: { 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point' }, inner: true });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  AWTEventMulticaster = $J.load('java.awt.AWTEventMulticaster');
  DefaultFocusTraversalPolicy = $J.load('java.awt.DefaultFocusTraversalPolicy');
  Dimension = $J.load('java.awt.Dimension');
  GraphicsCallback$PaintCallback = $J.load('java.awt.GraphicsCallback$PaintCallback');
  GraphicsCallback$PrintCallback = $J.load('java.awt.GraphicsCallback$PrintCallback');
  GraphicsCallback$PrintHeavyweightComponentsCallback = $J.load('java.awt.GraphicsCallback$PrintHeavyweightComponentsCallback');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Insets = $J.load('java.awt.Insets');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  LayoutManager2 = $J.load('java.awt.LayoutManager2');
  LightweightDispatcher = $J.load('java.awt.LightweightDispatcher');
  Point = $J.load('java.awt.Point');
  Window = $J.load('java.awt.Window');
  ComponentEvent = $J.load('java.awt.event.ComponentEvent');
  ContainerEvent = $J.load('java.awt.event.ContainerEvent');
  ContainerListener = $J.load('java.awt.event.ContainerListener');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  HierarchyEvent = $J.load('java.awt.event.HierarchyEvent');
  Accessible = $J.load('javax.accessibility.Accessible');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  SunGraphicsCallback = $J.load('sun.awt.SunGraphicsCallback');
});
