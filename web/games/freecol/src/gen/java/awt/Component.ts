// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Component.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AccessController, AppContext, Applet, ClassCastException, Collections, CompositionArea, ContainerPeer, ExtendedBufferCapabilities, ExtendedBufferCapabilities_VSyncType, FontDesignMetrics, GetPropertyAction, HashSet, IllegalArgumentException, IllegalStateException, InputContext, JEnum, JObject, LightweightPeer, NoSuchMethodException, NullPointerException, Objects, PlatformLogger, PlatformLogger_Level, Region, SecurityException, SunDropTargetEvent, SunToolkit, Thread, Toolkit, VSyncedBSManager, WeakHashMap } from '../../../jre/index.ts';
import { BufferStrategy } from './image/BufferStrategy.ts';
import { AccessibleContext } from '../../javax/accessibility/AccessibleContext.ts';

let AWTError, AWTEvent, AWTEventMulticaster, AWTException, BufferCapabilities$FlipContents, Canvas, ComponentOrientation, Container, Cursor, Dimension, Event, EventQueue, GraphicsCallback$PeerPrintCallback, GraphicsEnvironment, HeadlessException, IllegalComponentStateException, Insets, KeyboardFocusManager, MouseInfo, Point, Rectangle, Window, ActionEvent, AdjustmentEvent, ComponentEvent, ComponentListener, FocusEvent, FocusEvent$Cause, FocusListener, HierarchyBoundsListener, HierarchyEvent, HierarchyListener, InputEvent, InputMethodEvent, InputMethodListener, ItemEvent, KeyEvent, KeyListener, MouseEvent, MouseListener, MouseMotionListener, MouseWheelEvent, MouseWheelListener, PaintEvent, TextEvent, VolatileImage, PropertyChangeListener, PropertyChangeSupport, Accessible, AccessibleState, AccessibleStateSet, AWTAccessor, ComponentFactory, ConstrainableGraphics, EmbeddedFrame, SunGraphicsCallback;

/**
 * A <em>component</em> is an object having a graphical representation
 * that can be displayed on the screen and that can interact with the
 * user. Examples of components are the buttons, checkboxes, and scrollbars
 * of a typical graphical user interface. <p>
 * The {@code Component} class is the abstract superclass of
 * the nonmenu-related Abstract Window Toolkit components. Class
 * {@code Component} can also be extended directly to create a
 * lightweight component. A lightweight component is a component that is
 * not associated with a native window. On the contrary, a heavyweight
 * component is associated with a native window. The {@link #isLightweight()}
 * method may be used to distinguish between the two kinds of the components.
 * <p>
 * Lightweight and heavyweight components may be mixed in a single component
 * hierarchy. However, for correct operating of such a mixed hierarchy of
 * components, the whole hierarchy must be valid. When the hierarchy gets
 * invalidated, like after changing the bounds of components, or
 * adding/removing components to/from containers, the whole hierarchy must be
 * validated afterwards by means of the {@link Container#validate()} method
 * invoked on the top-most invalid container of the hierarchy.
 *
 * <h2>Serialization</h2>
 * It is important to note that only AWT listeners which conform
 * to the {@code Serializable} protocol will be saved when
 * the object is stored.  If an AWT object has listeners that
 * aren't marked serializable, they will be dropped at
 * {@code writeObject} time.  Developers will need, as always,
 * to consider the implications of making an object serializable.
 * One situation to watch out for is this:
 * <pre>
 *    import java.awt.*;
 *    import java.awt.event.*;
 *    import java.io.Serializable;
 *
 *    class MyApp implements ActionListener, Serializable
 *    {
 *        BigObjectThatShouldNotBeSerializedWithAButton bigOne;
 *        Button aButton = new Button();
 *
 *        MyApp()
 *        {
 *            // Oops, now aButton has a listener with a reference
 *            // to bigOne!
 *            aButton.addActionListener(this);
 *        }
 *
 *        public void actionPerformed(ActionEvent e)
 *        {
 *            System.out.println("Hello There");
 *        }
 *    }
 * </pre>
 * In this example, serializing {@code aButton} by itself
 * will cause {@code MyApp} and everything it refers to
 * to be serialized as well.  The problem is that the listener
 * is serializable by coincidence, not by design.  To separate
 * the decisions about {@code MyApp} and the
 * {@code ActionListener} being serializable one can use a
 * nested class, as in the following example:
 * <pre>
 *    import java.awt.*;
 *    import java.awt.event.*;
 *    import java.io.Serializable;
 *
 *    class MyApp implements java.io.Serializable
 *    {
 *         BigObjectThatShouldNotBeSerializedWithAButton bigOne;
 *         Button aButton = new Button();
 *
 *         static class MyActionListener implements ActionListener
 *         {
 *             public void actionPerformed(ActionEvent e)
 *             {
 *                 System.out.println("Hello There");
 *             }
 *         }
 *
 *         MyApp()
 *         {
 *             aButton.addActionListener(new MyActionListener());
 *         }
 *    }
 * </pre>
 * <p>
 * <b>Note</b>: For more information on the paint mechanisms utilized
 * by AWT and Swing, including information on how to write the most
 * efficient painting code, see
 * <a href="http://www.oracle.com/technetwork/java/painting-140037.html">Painting in AWT and Swing</a>.
 * <p>
 * For details on the focus subsystem, see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
 * How to Use the Focus Subsystem</a>,
 * a section in <em>The Java Tutorial</em>, and the
 * <a href="doc-files/FocusSpec.html">Focus Specification</a>
 * for more information.
 *
 * @author      Arthur van Hoff
 * @author      Sami Shaio
 */
export class Component extends JObject {
  static log: PlatformLogger = null;
  static eventLog: PlatformLogger = null;
  static focusLog: PlatformLogger = null;
  static mixingLog: PlatformLogger = null;
  /**
   * The peer of the component. The peer implements the component's
   * behavior. The peer is set when the {@code Component} is
   * added to a container that also is a peer.
   * @see #addNotify
   * @see #removeNotify
   */
  peer: ComponentPeer = null;
  /**
   * The parent of the object. It may be {@code null}
   * for top-level components.
   * @see #getParent
   */
  parent: Container = null;
  /**
   * The {@code AppContext} of the component. Applets/Plugin may
   * change the AppContext.
   */
  appContext: AppContext = null;
  /**
   * The x position of the component in the parent's coordinate system.
   *
   * @serial
   * @see #getLocation
   */
  x_: number = 0;
  /**
   * The y position of the component in the parent's coordinate system.
   *
   * @serial
   * @see #getLocation
   */
  y_: number = 0;
  /**
   * The width of the component.
   *
   * @serial
   * @see #getSize
   */
  width_: number = 0;
  /**
   * The height of the component.
   *
   * @serial
   * @see #getSize
   */
  height_: number = 0;
  /**
   * The foreground color for this component.
   * {@code foreground} can be {@code null}.
   *
   * @serial
   * @see #getForeground
   * @see #setForeground
   */
  foreground: Color = null;
  /**
   * The background color for this component.
   * {@code background} can be {@code null}.
   *
   * @serial
   * @see #getBackground
   * @see #setBackground
   */
  background: Color = null;
  /**
   * The font used by this component.
   * The {@code font} can be {@code null}.
   *
   * @serial
   * @see #getFont
   * @see #setFont
   */
  font: Font = null;
  /**
   * The font which the peer is currently using.
   * ({@code null} if no peer exists.)
   */
  peerFont: Font = null;
  /**
   * The cursor displayed when pointer is over this component.
   * This value can be {@code null}.
   *
   * @serial
   * @see #getCursor
   * @see #setCursor
   */
  cursor: Cursor = null;
  /**
   * The locale for the component.
   *
   * @serial
   * @see #getLocale
   * @see #setLocale
   */
  locale: Locale = null;
  /**
   * A reference to a {@code GraphicsConfiguration} object
   * used to describe the characteristics of a graphics
   * destination.
   * This value can be {@code null}.
   *
   * @since 1.3
   * @serial
   * @see GraphicsConfiguration
   * @see #getGraphicsConfiguration
   */
  graphicsConfig: GraphicsConfiguration = null;
  /**
   * A reference to a {@code BufferStrategy} object
   * used to manipulate the buffers on this component.
   *
   * @since 1.4
   * @see java.awt.image.BufferStrategy
   * @see #getBufferStrategy()
   */
  bufferStrategy: BufferStrategy = null;
  /**
   * True when the object should ignore all repaint events.
   *
   * @since 1.4
   * @serial
   * @see #setIgnoreRepaint
   * @see #getIgnoreRepaint
   */
  ignoreRepaint: boolean = false;
  /**
   * True when the object is visible. An object that is not
   * visible is not drawn on the screen.
   *
   * @serial
   * @see #isVisible
   * @see #setVisible
   */
  visible: boolean = false;
  /**
   * True when the object is enabled. An object that is not
   * enabled does not interact with the user.
   *
   * @serial
   * @see #isEnabled
   * @see #setEnabled
   */
  enabled: boolean = false;
  /**
   * True when the object is valid. An invalid object needs to
   * be laid out. This flag is set to false when the object
   * size is changed.
   *
   * @serial
   * @see #isValid
   * @see #validate
   * @see #invalidate
   */
  valid: boolean = false;
  /**
   * The {@code DropTarget} associated with this component.
   *
   * @since 1.2
   * @serial
   * @see #setDropTarget
   * @see #getDropTarget
   */
  dropTarget: DropTarget = null;
  /**
   * @serial
   * @see #add
   */
  popups: Vector<PopupMenu> = null;
  /**
   * A component's name.
   * This field can be {@code null}.
   *
   * @serial
   * @see #getName
   * @see #setName(String)
   */
  name: string = null;
  /**
   * A bool to determine whether the name has
   * been set explicitly. {@code nameExplicitlySet} will
   * be false if the name has not been set and
   * true if it has.
   *
   * @serial
   * @see #getName
   * @see #setName(String)
   */
  nameExplicitlySet: boolean = false;
  /**
   * Indicates whether this Component can be focused.
   *
   * @serial
   * @see #setFocusable
   * @see #isFocusable
   * @since 1.4
   */
  focusable: boolean = false;
  static readonly FOCUS_TRAVERSABLE_UNKNOWN: number = 0;
  static readonly FOCUS_TRAVERSABLE_DEFAULT: number = 1;
  static readonly FOCUS_TRAVERSABLE_SET: number = 2;
  /**
   * Tracks whether this Component is relying on default focus traversability.
   *
   * @serial
   * @since 1.4
   */
  isFocusTraversableOverridden_: number = 0;
  /**
   * The focus traversal keys. These keys will generate focus traversal
   * behavior for Components for which focus traversal keys are enabled. If a
   * value of null is specified for a traversal key, this Component inherits
   * that traversal key from its parent. If all ancestors of this Component
   * have null specified for that traversal key, then the current
   * KeyboardFocusManager's default traversal key is used.
   *
   * @serial
   * @see #setFocusTraversalKeys
   * @see #getFocusTraversalKeys
   * @since 1.4
   */
  focusTraversalKeys: JSet<AWTKeyStroke>[] = null;
  static focusTraversalKeyPropertyNames: string[] = null;
  /**
   * Indicates whether focus traversal keys are enabled for this Component.
   * Components for which focus traversal keys are disabled receive key
   * events for focus traversal keys. Components for which focus traversal
   * keys are enabled do not see these events; instead, the events are
   * automatically converted to traversal operations.
   *
   * @serial
   * @see #setFocusTraversalKeysEnabled
   * @see #getFocusTraversalKeysEnabled
   * @since 1.4
   */
  focusTraversalKeysEnabled: boolean = false;
  /**
   * The locking object for AWT component-tree and layout operations.
   *
   * @see #getTreeLock
   */
  static LOCK: any = null;
  acc: AccessControlContext = null;
  /**
   * Minimum size.
   * (This field perhaps should have been transient).
   *
   * @serial
   */
  minSize: Dimension = null;
  /**
   * Whether or not setMinimumSize has been invoked with a non-null value.
   */
  minSizeSet: boolean = false;
  /**
   * Preferred size.
   * (This field perhaps should have been transient).
   *
   * @serial
   */
  prefSize: Dimension = null;
  /**
   * Whether or not setPreferredSize has been invoked with a non-null value.
   */
  prefSizeSet: boolean = false;
  /**
   * Maximum size
   *
   * @serial
   */
  maxSize: Dimension = null;
  /**
   * Whether or not setMaximumSize has been invoked with a non-null value.
   */
  maxSizeSet: boolean = false;
  /**
   * The orientation for this component.
   * @see #getComponentOrientation
   * @see #setComponentOrientation
   */
  componentOrientation: ComponentOrientation = null;
  /**
   * {@code newEventsOnly} will be true if the event is
   * one of the event types enabled for the component.
   * It will then allow for normal processing to
   * continue.  If it is false the event is passed
   * to the component's parent and up the ancestor
   * tree until the event has been consumed.
   *
   * @serial
   * @see #dispatchEvent
   */
  newEventsOnly: boolean = false;
  componentListener: ComponentListener = null;
  focusListener: FocusListener = null;
  hierarchyListener: HierarchyListener = null;
  hierarchyBoundsListener: HierarchyBoundsListener = null;
  keyListener: KeyListener = null;
  mouseListener: MouseListener = null;
  mouseMotionListener: MouseMotionListener = null;
  mouseWheelListener: MouseWheelListener = null;
  inputMethodListener: InputMethodListener = null;
  /**
   * Internal, constants for serialization
   */
  static readonly actionListenerK: string = 'actionL';
  static readonly adjustmentListenerK: string = 'adjustmentL';
  static readonly componentListenerK: string = 'componentL';
  static readonly containerListenerK: string = 'containerL';
  static readonly focusListenerK: string = 'focusL';
  static readonly itemListenerK: string = 'itemL';
  static readonly keyListenerK: string = 'keyL';
  static readonly mouseListenerK: string = 'mouseL';
  static readonly mouseMotionListenerK: string = 'mouseMotionL';
  static readonly mouseWheelListenerK: string = 'mouseWheelL';
  static readonly textListenerK: string = 'textL';
  static readonly ownedWindowK: string = 'ownedL';
  static readonly windowListenerK: string = 'windowL';
  static readonly inputMethodListenerK: string = 'inputMethodL';
  static readonly hierarchyListenerK: string = 'hierarchyL';
  static readonly hierarchyBoundsListenerK: string = 'hierarchyBoundsL';
  static readonly windowStateListenerK: string = 'windowStateL';
  static readonly windowFocusListenerK: string = 'windowFocusL';
  /**
   * The {@code eventMask} is ONLY set by subclasses via
   * {@code enableEvents}.
   * The mask should NOT be set when listeners are registered
   * so that we can distinguish the difference between when
   * listeners request events and subclasses request them.
   * One bit is used to indicate whether input methods are
   * enabled; this bit is set by {@code enableInputMethods} and is
   * on by default.
   *
   * @serial
   * @see #enableInputMethods
   * @see AWTEvent
   */
  eventMask: number = 0;
  /**
   * Static properties for incremental drawing.
   * @see #imageUpdate
   */
  static isInc: boolean = false;
  static incRate: number = 0;
  /**
   * Ease-of-use constant for {@code getAlignmentY()}.
   * Specifies an alignment to the top of the component.
   * @see     #getAlignmentY
   */
  static readonly TOP_ALIGNMENT: number = 0;
  /**
   * Ease-of-use constant for {@code getAlignmentY} and
   * {@code getAlignmentX}. Specifies an alignment to
   * the center of the component
   * @see     #getAlignmentX
   * @see     #getAlignmentY
   */
  static readonly CENTER_ALIGNMENT: number = 0.5;
  /**
   * Ease-of-use constant for {@code getAlignmentY}.
   * Specifies an alignment to the bottom of the component.
   * @see     #getAlignmentY
   */
  static readonly BOTTOM_ALIGNMENT: number = 1;
  /**
   * Ease-of-use constant for {@code getAlignmentX}.
   * Specifies an alignment to the left side of the component.
   * @see     #getAlignmentX
   */
  static readonly LEFT_ALIGNMENT: number = 0;
  /**
   * Ease-of-use constant for {@code getAlignmentX}.
   * Specifies an alignment to the right side of the component.
   * @see     #getAlignmentX
   */
  static readonly RIGHT_ALIGNMENT: number = 1;
  /**
   * If any {@code PropertyChangeListeners} have been registered,
   * the {@code changeSupport} field describes them.
   *
   * @serial
   * @since 1.2
   * @see #addPropertyChangeListener
   * @see #removePropertyChangeListener
   * @see #firePropertyChange
   */
  changeSupport: PropertyChangeSupport = null;
  objectLock: any = null;
  /**
   * Whether the component is packed or not;
   */
  isPacked: boolean = false;
  /**
   * Pseudoparameter for direct Geometry API (setLocation, setBounds setSize
   * to signal setBounds what's changing. Should be used under TreeLock.
   * This is only needed due to the inability to change the cross-calling
   * order of public and deprecated methods.
   */
  boundsOp: number = 0;
  compoundShape: Region = null;
  mixingCutoutRegion: Region = null;
  isAddNotifyComplete: boolean = false;
  backgroundEraseDisabled: boolean = false;
  eventCache: EventQueueItem[] = null;
  /**
   * @see #isCoalescingEnabled
   * @see #checkCoalescing
   */
  coalescingEnabled: boolean = false;
  /**
   * Weak map of known coalesceEvent overriders.
   * Value indicates whether overridden.
   * Bootstrap classes are not included.
   */
  static coalesceMap: JMap<JClass<any>, boolean> = null;
  /**
   * Parameter types of coalesceEvents(AWTEvent,AWTEVent).
   */
  static coalesceEventsParams: JClass<any>[] = null;
  static requestFocusController: RequestFocusController = null;
  /**
   * Used to disallow auto-focus-transfer on disposal of the focus owner
   * in the process of disposing its parent container.
   */
  autoFocusTransferOnDisposal: boolean = false;
  /**
   * Component Serialized Data Version.
   *
   * @serial
   */
  componentSerializedDataVersion: number = 0;
  /**
   * The {@code AccessibleContext} associated with this {@code Component}.
   */
  accessibleContext: AccessibleContext = null;
  /**
   * Constructs a new component. Class {@code Component} can be
   * extended directly to create a lightweight component that does not
   * utilize an opaque native window. A lightweight component must be
   * hosted by a native container somewhere higher up in the component
   * tree (for example, by a {@code Frame} object).
   */
  _Component(): this {
    this.bufferStrategy = null;
    this.ignoreRepaint = false;
    this.visible = true;
    this.enabled = true;
    this.nameExplicitlySet = false;
    this.focusable = true;
    this.isFocusTraversableOverridden_ = Component.FOCUS_TRAVERSABLE_UNKNOWN;
    this.focusTraversalKeysEnabled = true;
    this.acc = AccessController.getContext();
    this.componentOrientation = ComponentOrientation.UNKNOWN;
    this.newEventsOnly = false;
    this.eventMask = AWTEvent.INPUT_METHODS_ENABLED_MASK;
    this.objectLock = new JObject();
    this.isPacked = false;
    this.boundsOp = 3;
    this.compoundShape = null;
    this.mixingCutoutRegion = null;
    this.isAddNotifyComplete = false;
    this.coalescingEnabled = this.checkCoalescing();
    this.autoFocusTransferOnDisposal = true;
    this.componentSerializedDataVersion = 4;
    this.accessibleContext = null;
    this.appContext = AppContext.getAppContext();
    return this;
  }
  getObjectLock(): any {
    return this.objectLock;
  }
  getAccessControlContext(): AccessControlContext {
    if (this.acc == null) {
      throw new SecurityException('Component is missing AccessControlContext');
    }
    return this.acc;
  }
  /**
   * Should only be used in subclass getBounds to check that part of bounds
   * is actually changing
   */
  getBoundsOp(): number {
    // assert Thread.holdsLock(getTreeLock())
    return this.boundsOp;
  }
  setBoundsOp(op: number): void {
    // assert Thread.holdsLock(getTreeLock())
    if (op === 5) {
      this.boundsOp = 3;
    } else if (this.boundsOp === 3) {
      this.boundsOp = op;
    }
  }
  initializeFocusTraversalKeys(): void {
    this.focusTraversalKeys = $J.newArray(3, null);
  }
  /**
   * Constructs a name for this component.  Called by {@code getName}
   * when the name is {@code null}.
   */
  constructComponentName(): string {
    return null;
  }
  /**
   * Gets the name of the component.
   * @return this component's name
   * @see    #setName
   * @since 1.1
   */
  getName$(): string {
    if (this.name == null && !this.nameExplicitlySet) {
      {
        if (this.name == null && !this.nameExplicitlySet) {
          this.name = this.constructComponentName();
        }
      }
    }
    return this.name;
  }
  /**
   * Sets the name of the component to the specified string.
   * @param name  the string that is to be this
   *           component's name
   * @see #getName
   * @since 1.1
   */
  setName(name: string): void {
    let oldName: string;
    {
      oldName = this.name;
      this.name = name;
      this.nameExplicitlySet = true;
    }
    this.firePropertyChange$String$Object$Object('name', oldName, name);
  }
  /**
   * Gets the parent of this component.
   * @return the parent container of this component
   * @since 1.0
   */
  getParent(): Container {
    return this.getParent_NoClientCode();
  }
  getParent_NoClientCode(): Container {
    return this.parent;
  }
  getContainer(): Container {
    return this.getParent_NoClientCode();
  }
  /**
   * Associate a {@code DropTarget} with this component.
   * The {@code Component} will receive drops only if it
   * is enabled.
   *
   * @see #isEnabled
   * @param dt The DropTarget
   */
  setDropTarget(dt: DropTarget): void {
    if (dt === this.dropTarget || (this.dropTarget != null && this.dropTarget.equals(dt))) {
      return;
    }
    let old: DropTarget;
    if ((old = this.dropTarget) != null) {
      this.dropTarget.removeNotify();
      let t = this.dropTarget;
      this.dropTarget = null;
      try {
        t.setComponent(null);
      } catch ($e0) {
        if ($J.isa($e0, IllegalArgumentException)) {
          let iae = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    if ((this.dropTarget = dt) != null) {
      try {
        this.dropTarget.setComponent(this);
        this.dropTarget.addNotify();
      } catch ($e1) {
        if ($J.isa($e1, IllegalArgumentException)) {
          let iae = $J.exc($e1);
          if (old != null) {
            try {
              old.setComponent(this);
              this.dropTarget.addNotify();
            } catch ($e2) {
              if ($J.isa($e2, IllegalArgumentException)) {
                let iae1 = $J.exc($e2);
              } else {
                throw $e2;
              }
            }
          }
        } else {
          throw $e1;
        }
      }
    }
  }
  /**
   * Gets the {@code DropTarget} associated with this
   * {@code Component}.
   *
   * @return the drop target
   */
  getDropTarget(): DropTarget {
    return this.dropTarget;
  }
  /**
   * Gets the {@code GraphicsConfiguration} associated with this
   * {@code Component}.
   * If the {@code Component} has not been assigned a specific
   * {@code GraphicsConfiguration},
   * the {@code GraphicsConfiguration} of the
   * {@code Component} object's top-level container is
   * returned.
   * If the {@code Component} has been created, but not yet added
   * to a {@code Container}, this method returns {@code null}.
   *
   * @return the {@code GraphicsConfiguration} used by this
   *          {@code Component} or {@code null}
   * @since 1.3
   */
  getGraphicsConfiguration(): GraphicsConfiguration {
    return this.getGraphicsConfiguration_NoClientCode();
  }
  getGraphicsConfiguration_NoClientCode(): GraphicsConfiguration {
    return this.graphicsConfig;
  }
  setGraphicsConfiguration(gc: GraphicsConfiguration): void {
    {
      if (this.updateGraphicsData(gc)) {
        this.removeNotify();
        this.addNotify();
      }
    }
  }
  updateGraphicsData(gc: GraphicsConfiguration): boolean {
    let oldConfig = this.graphicsConfig;
    let ret = this.updateSelfGraphicsData(gc);
    ret = !!(ret | this.updateChildGraphicsData(gc));
    if (oldConfig !== gc) {
      this.firePropertyChange$String$Object$Object('graphicsConfiguration', oldConfig, gc);
    }
    return ret;
  }
  updateSelfGraphicsData(gc: GraphicsConfiguration): boolean {
    this.checkTreeLock();
    if (this.graphicsConfig === gc) {
      return false;
    }
    this.graphicsConfig = gc;
    let peer = this.peer;
    if (peer != null) {
      return peer.updateGraphicsData(gc);
    }
    return false;
  }
  updateChildGraphicsData(gc: GraphicsConfiguration): boolean {
    return false;
  }
  /**
   * Checks that this component's {@code GraphicsDevice}
   * {@code idString} matches the string argument.
   */
  checkGD(stringID: string): void {
    if (this.graphicsConfig != null) {
      if (!$J.equals(this.graphicsConfig.getDevice().getIDstring(), stringID)) {
        throw new IllegalArgumentException('adding a container to a container on a different GraphicsDevice');
      }
    }
  }
  /**
   * Gets this component's locking object (the object that owns the thread
   * synchronization monitor) for AWT component-tree and layout
   * operations.
   * @return this component's locking object
   */
  getTreeLock(): any {
    return Component.LOCK;
  }
  checkTreeLock(): void {
    if (!Thread.holdsLock(this.getTreeLock())) {
      throw new IllegalStateException('This function should be called while holding treeLock');
    }
  }
  /**
   * Gets the toolkit of this component. Note that
   * the frame that contains a component controls which
   * toolkit is used by that component. Therefore if the component
   * is moved from one frame to another, the toolkit it uses may change.
   * @return  the toolkit of this component
   * @since 1.0
   */
  getToolkit(): Toolkit {
    return this.getToolkitImpl();
  }
  getToolkitImpl(): Toolkit {
    let parent = this.parent;
    if (parent != null) {
      return parent.getToolkitImpl();
    }
    return Toolkit.getDefaultToolkit();
  }
  getComponentFactory(): ComponentFactory {
    let toolkit = this.getToolkit();
    if ($J.isa(toolkit, ComponentFactory)) {
      return toolkit;
    }
    throw new AWTError()._AWTError('UI components are unsupported by: ' + $J.str(toolkit));
  }
  /**
   * Determines whether this component is valid. A component is valid
   * when it is correctly sized and positioned within its parent
   * container and all its children are also valid.
   * In order to account for peers' size requirements, components are invalidated
   * before they are first shown on the screen. By the time the parent container
   * is fully realized, all its components will be valid.
   * @return {@code true} if the component is valid, {@code false}
   * otherwise
   * @see #validate
   * @see #invalidate
   * @since 1.0
   */
  isValid(): boolean {
    return (this.peer != null) && this.valid;
  }
  /**
   * Determines whether this component is displayable. A component is
   * displayable when it is connected to a native screen resource.
   * <p>
   * A component is made displayable either when it is added to
   * a displayable containment hierarchy or when its containment
   * hierarchy is made displayable.
   * A containment hierarchy is made displayable when its ancestor
   * window is either packed or made visible.
   * <p>
   * A component is made undisplayable either when it is removed from
   * a displayable containment hierarchy or when its containment hierarchy
   * is made undisplayable.  A containment hierarchy is made
   * undisplayable when its ancestor window is disposed.
   *
   * @return {@code true} if the component is displayable,
   * {@code false} otherwise
   * @see Container#add(Component)
   * @see Window#pack
   * @see Window#show
   * @see Container#remove(Component)
   * @see Window#dispose
   * @since 1.2
   */
  isDisplayable(): boolean {
    return this.peer != null;
  }
  /**
   * Determines whether this component should be visible when its
   * parent is visible. Components are
   * initially visible, with the exception of top level components such
   * as {@code Frame} objects.
   * @return {@code true} if the component is visible,
   * {@code false} otherwise
   * @see #setVisible
   * @since 1.0
   */
  isVisible$(): boolean {
    return this.isVisible_NoClientCode();
  }
  isVisible_NoClientCode(): boolean {
    return this.visible;
  }
  /**
   * Determines whether this component will be displayed on the screen.
   * @return {@code true} if the component and all of its ancestors
   *          until a toplevel window or null parent are visible,
   *          {@code false} otherwise
   */
  isRecursivelyVisible(): boolean {
    return this.visible && (this.parent == null || this.parent.isRecursivelyVisible());
  }
  /**
   * Determines the bounds of a visible part of the component relative to its
   * parent.
   *
   * @return the visible part of bounds
   */
  getRecursivelyVisibleBounds(): Rectangle {
    let container = this.getContainer();
    let bounds = this.getBounds$();
    if (container == null) {
      return bounds;
    }
    let parentsBounds = container.getRecursivelyVisibleBounds();
    parentsBounds.setLocation$int$int(0, 0);
    return parentsBounds.intersection(bounds);
  }
  /**
   * Translates absolute coordinates into coordinates in the coordinate
   * space of this component.
   */
  pointRelativeToComponent(absolute: Point): Point {
    let compCoords = this.getLocationOnScreen();
    return new Point()._Point$int$int((absolute.x_ - compCoords.x_) | 0, (absolute.y_ - compCoords.y_) | 0);
  }
  /**
   * Assuming that mouse location is stored in PointerInfo passed
   * to this method, it finds a Component that is in the same
   * Window as this Component and is located under the mouse pointer.
   * If no such Component exists, null is returned.
   * NOTE: this method should be called under the protection of
   * tree lock, as it is done in Component.getMousePosition() and
   * Container.getMousePosition(boolean).
   */
  findUnderMouseInWindow(pi: PointerInfo): Component {
    if (!this.isShowing()) {
      return null;
    }
    let win = this.getContainingWindow();
    let toolkit = Toolkit.getDefaultToolkit();
    if (!($J.isa(toolkit, ComponentFactory))) {
      return null;
    }
    if (!(toolkit).getMouseInfoPeer().isWindowUnderMouse(win)) {
      return null;
    }
    let INCLUDE_DISABLED = true;
    let relativeToWindow = win.pointRelativeToComponent(pi.getLocation());
    let inTheSameWindow = win.findComponentAt$int$int$boolean(relativeToWindow.x_, relativeToWindow.y_, INCLUDE_DISABLED);
    return inTheSameWindow;
  }
  /**
   * Returns the position of the mouse pointer in this {@code Component}'s
   * coordinate space if the {@code Component} is directly under the mouse
   * pointer, otherwise returns {@code null}.
   * If the {@code Component} is not showing on the screen, this method
   * returns {@code null} even if the mouse pointer is above the area
   * where the {@code Component} would be displayed.
   * If the {@code Component} is partially or fully obscured by other
   * {@code Component}s or native windows, this method returns a non-null
   * value only if the mouse pointer is located above the unobscured part of the
   * {@code Component}.
   * <p>
   * For {@code Container}s it returns a non-null value if the mouse is
   * above the {@code Container} itself or above any of its descendants.
   * Use {@link Container#getMousePosition(boolean)} if you need to exclude children.
   * <p>
   * Sometimes the exact mouse coordinates are not important, and the only thing
   * that matters is whether a specific {@code Component} is under the mouse
   * pointer. If the return value of this method is {@code null}, mouse
   * pointer is not directly above the {@code Component}.
   *
   * @throws HeadlessException if GraphicsEnvironment.isHeadless() returns true
   * @see       #isShowing
   * @see       Container#getMousePosition
   * @return    mouse coordinates relative to this {@code Component}, or null
   * @since     1.5
   */
  getMousePosition$(): Point {
    if (GraphicsEnvironment.isHeadless()) {
      throw new HeadlessException()._HeadlessException$();
    }
    let pi = AccessController.doPrivileged(new (Component$2())().$o(this));
    {
      let inTheSameWindow = this.findUnderMouseInWindow(pi);
      if (!this.isSameOrAncestorOf(inTheSameWindow, true)) {
        return null;
      }
      return this.pointRelativeToComponent(pi.getLocation());
    }
  }
  /**
   * Overridden in Container. Must be called under TreeLock.
   */
  isSameOrAncestorOf(comp: Component, allowChildren: boolean): boolean {
    return comp === this;
  }
  /**
   * Determines whether this component is showing on screen. This means
   * that the component must be visible, and it must be in a container
   * that is visible and showing.
   * <p>
   * <strong>Note:</strong> sometimes there is no way to detect whether the
   * {@code Component} is actually visible to the user.  This can happen when:
   * <ul>
   * <li>the component has been added to a visible {@code ScrollPane} but
   * the {@code Component} is not currently in the scroll pane's view port.
   * <li>the {@code Component} is obscured by another {@code Component} or
   * {@code Container}.
   * </ul>
   * @return {@code true} if the component is showing,
   *          {@code false} otherwise
   * @see #setVisible
   * @since 1.0
   */
  isShowing(): boolean {
    if (this.visible && (this.peer != null)) {
      let parent = this.parent;
      return (parent == null) || parent.isShowing();
    }
    return false;
  }
  /**
   * Determines whether this component is enabled. An enabled component
   * can respond to user input and generate events. Components are
   * enabled initially by default. A component may be enabled or disabled by
   * calling its {@code setEnabled} method.
   * @return {@code true} if the component is enabled,
   *          {@code false} otherwise
   * @see #setEnabled
   * @since 1.0
   */
  isEnabled(): boolean {
    return this.isEnabledImpl();
  }
  isEnabledImpl(): boolean {
    return this.enabled;
  }
  /**
   * Enables or disables this component, depending on the value of the
   * parameter {@code b}. An enabled component can respond to user
   * input and generate events. Components are enabled initially by default.
   *
   * <p>Note: Disabling a lightweight component does not prevent it from
   * receiving MouseEvents.
   * <p>Note: Disabling a heavyweight container prevents all components
   * in this container from receiving any input events.  But disabling a
   * lightweight container affects only this container.
   *
   * @param     b   If {@code true}, this component is
   *            enabled; otherwise this component is disabled
   * @see #isEnabled
   * @see #isLightweight
   * @since 1.1
   */
  setEnabled(b: boolean): void {
    this.enable$boolean(b);
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setEnabled(boolean)}.
   */
  enable$(): void {
    if (!this.enabled) {
      {
        this.enabled = true;
        let peer = this.peer;
        if (peer != null) {
          peer.setEnabled(true);
          if (this.visible && !this.getRecursivelyVisibleBounds().isEmpty()) {
            this.updateCursorImmediately();
          }
        }
      }
      if (this.accessibleContext != null) {
        this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.ENABLED);
      }
    }
  }
  /**
   * Enables or disables this component.
   *
   * @param  b {@code true} to enable this component;
   *         otherwise {@code false}
   *
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setEnabled(boolean)}.
   */
  enable$boolean(b: boolean): void {
    if (b) {
      this.enable$();
    } else {
      this.disable();
    }
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setEnabled(boolean)}.
   */
  disable(): void {
    if (this.enabled) {
      KeyboardFocusManager.clearMostRecentFocusOwner(this);
      {
        this.enabled = false;
        if ((this.isFocusOwner() || (this.containsFocus() && !this.isLightweight())) && KeyboardFocusManager.isAutoFocusTransferEnabled()) {
          this.transferFocus$boolean(false);
        }
        let peer = this.peer;
        if (peer != null) {
          peer.setEnabled(false);
          if (this.visible && !this.getRecursivelyVisibleBounds().isEmpty()) {
            this.updateCursorImmediately();
          }
        }
      }
      if (this.accessibleContext != null) {
        this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.ENABLED);
      }
    }
  }
  /**
   * Enables or disables input method support for this component. If input
   * method support is enabled and the component also processes key events,
   * incoming events are offered to
   * the current input method and will only be processed by the component or
   * dispatched to its listeners if the input method does not consume them.
   * By default, input method support is enabled.
   *
   * @param enable true to enable, false to disable
   * @see #processKeyEvent
   * @since 1.2
   */
  enableInputMethods(enable: boolean): void {
    if (enable) {
      if (($J.land(this.eventMask, AWTEvent.INPUT_METHODS_ENABLED_MASK)) !== 0) {
        return;
      }
      if (this.isFocusOwner()) {
        let inputContext = this.getInputContext();
        if (inputContext != null) {
          let focusGainedEvent = new FocusEvent()._FocusEvent$Component$int(this, FocusEvent.FOCUS_GAINED);
          inputContext.dispatchEvent(focusGainedEvent);
        }
      }
      this.eventMask = $J.lor(this.eventMask, AWTEvent.INPUT_METHODS_ENABLED_MASK);
    } else {
      if (($J.land(this.eventMask, AWTEvent.INPUT_METHODS_ENABLED_MASK)) !== 0) {
        let inputContext = this.getInputContext();
        if (inputContext != null) {
          inputContext.endComposition();
          inputContext.removeNotify(this);
        }
      }
      this.eventMask = $J.land(this.eventMask, ~AWTEvent.INPUT_METHODS_ENABLED_MASK);
    }
  }
  /**
   * Shows or hides this component depending on the value of parameter
   * {@code b}.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param b  if {@code true}, shows this component;
   * otherwise, hides this component
   * @see #isVisible
   * @see #invalidate
   * @since 1.1
   */
  setVisible(b: boolean): void {
    this.show$boolean(b);
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setVisible(boolean)}.
   */
  show$(): void {
    if (!this.visible) {
      {
        this.visible = true;
        this.mixOnShowing();
        let peer = this.peer;
        if (peer != null) {
          peer.setVisible(true);
          this.createHierarchyEvents(HierarchyEvent.HIERARCHY_CHANGED, this, this.parent, HierarchyEvent.SHOWING_CHANGED, Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_EVENT_MASK));
          if ($J.isa(peer, LightweightPeer)) {
            this.repaint$();
          }
          this.updateCursorImmediately();
        }
        if (this.componentListener != null || ($J.land(this.eventMask, AWTEvent.COMPONENT_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.COMPONENT_EVENT_MASK)) {
          let e = new ComponentEvent()._ComponentEvent(this, ComponentEvent.COMPONENT_SHOWN);
          Toolkit.getEventQueue().postEvent$AWTEvent(e);
        }
      }
      let parent = this.parent;
      if (parent != null) {
        parent.invalidate();
      }
    }
  }
  /**
   * Makes this component visible or invisible.
   *
   * @param  b {@code true} to make this component visible;
   *         otherwise {@code false}
   *
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setVisible(boolean)}.
   */
  show$boolean(b: boolean): void {
    if (b) {
      this.show$();
    } else {
      this.hide();
    }
  }
  containsFocus(): boolean {
    return this.isFocusOwner();
  }
  clearMostRecentFocusOwnerOnHide(): void {
    KeyboardFocusManager.clearMostRecentFocusOwner(this);
  }
  clearCurrentFocusCycleRootOnHide(): void {
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setVisible(boolean)}.
   */
  hide(): void {
    this.isPacked = false;
    if (this.visible) {
      this.clearCurrentFocusCycleRootOnHide();
      this.clearMostRecentFocusOwnerOnHide();
      {
        this.visible = false;
        this.mixOnHiding(this.isLightweight());
        if (this.containsFocus() && KeyboardFocusManager.isAutoFocusTransferEnabled()) {
          this.transferFocus$boolean(true);
        }
        let peer = this.peer;
        if (peer != null) {
          peer.setVisible(false);
          this.createHierarchyEvents(HierarchyEvent.HIERARCHY_CHANGED, this, this.parent, HierarchyEvent.SHOWING_CHANGED, Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_EVENT_MASK));
          if ($J.isa(peer, LightweightPeer)) {
            this.repaint$();
          }
          this.updateCursorImmediately();
        }
        if (this.componentListener != null || ($J.land(this.eventMask, AWTEvent.COMPONENT_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.COMPONENT_EVENT_MASK)) {
          let e = new ComponentEvent()._ComponentEvent(this, ComponentEvent.COMPONENT_HIDDEN);
          Toolkit.getEventQueue().postEvent$AWTEvent(e);
        }
      }
      let parent = this.parent;
      if (parent != null) {
        parent.invalidate();
      }
    }
  }
  /**
   * Gets the foreground color of this component.
   * @return this component's foreground color; if this component does
   * not have a foreground color, the foreground color of its parent
   * is returned
   * @see #setForeground
   * @since 1.0
   */
  getForeground(): Color {
    let foreground = this.foreground;
    if (foreground != null) {
      return foreground;
    }
    let parent = this.parent;
    return (parent != null) ? parent.getForeground() : null;
  }
  /**
   * Sets the foreground color of this component.
   * @param c the color to become this component's
   *          foreground color; if this parameter is {@code null}
   *          then this component will inherit
   *          the foreground color of its parent
   * @see #getForeground
   * @since 1.0
   */
  setForeground(c: Color): void {
    let oldColor = this.foreground;
    let peer = this.peer;
    this.foreground = c;
    if (peer != null) {
      c = this.getForeground();
      if (c != null) {
        peer.setForeground(c);
      }
    }
    this.firePropertyChange$String$Object$Object('foreground', oldColor, c);
  }
  /**
   * Gets the background color of this component.
   * @return this component's background color; if this component does
   *          not have a background color,
   *          the background color of its parent is returned
   * @see #setBackground
   * @since 1.0
   */
  getBackground(): Color {
    let background = this.background;
    if (background != null) {
      return background;
    }
    let parent = this.parent;
    return (parent != null) ? parent.getBackground() : null;
  }
  /**
   * Sets the background color of this component.
   * <p>
   * The background color affects each component differently and the
   * parts of the component that are affected by the background color
   * may differ between operating systems.
   *
   * @param c the color to become this component's color;
   *          if this parameter is {@code null}, then this
   *          component will inherit the background color of its parent
   * @see #getBackground
   * @since 1.0
   */
  setBackground(c: Color): void {
    let oldColor = this.background;
    let peer = this.peer;
    this.background = c;
    if (peer != null) {
      c = this.getBackground();
      if (c != null) {
        peer.setBackground(c);
      }
    }
    this.firePropertyChange$String$Object$Object('background', oldColor, c);
  }
  /**
   * Gets the font of this component.
   * @return this component's font; if a font has not been set
   * for this component, the font of its parent is returned
   * @see #setFont
   * @since 1.0
   */
  getFont(): Font {
    return this.getFont_NoClientCode();
  }
  getFont_NoClientCode(): Font {
    let font = this.font;
    if (font != null) {
      return font;
    }
    let parent = this.parent;
    return (parent != null) ? parent.getFont_NoClientCode() : null;
  }
  /**
   * Sets the font of this component.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param f the font to become this component's font;
   *          if this parameter is {@code null} then this
   *          component will inherit the font of its parent
   * @see #getFont
   * @see #invalidate
   * @since 1.0
   */
  setFont(f: Font): void {
    let oldFont: Font;
    let newFont: Font;
    {
      oldFont = this.font;
      newFont = this.font = f;
      let peer = this.peer;
      if (peer != null) {
        f = this.getFont();
        if (f != null) {
          peer.setFont(f);
          this.peerFont = f;
        }
      }
    }
    this.firePropertyChange$String$Object$Object('font', oldFont, newFont);
    if (f !== oldFont && (oldFont == null || !oldFont.equals(f))) {
      this.invalidateIfValid();
    }
  }
  /**
   * Gets the locale of this component.
   * @return this component's locale; if this component does not
   *          have a locale, the locale of its parent is returned
   * @see #setLocale
   * @throws IllegalComponentStateException if the {@code Component}
   *          does not have its own locale and has not yet been added to
   *          a containment hierarchy such that the locale can be determined
   *          from the containing parent
   * @since  1.1
   */
  getLocale$(): Locale {
    let locale = this.locale;
    if (locale != null) {
      return locale;
    }
    let parent = this.parent;
    if (parent == null) {
      throw new IllegalComponentStateException()._IllegalComponentStateException$String('This component must have a parent in order to determine its locale');
    } else {
      return parent.getLocale$();
    }
  }
  /**
   * Sets the locale of this component.  This is a bound property.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param l the locale to become this component's locale
   * @see #getLocale
   * @see #invalidate
   * @since 1.1
   */
  setLocale(l: Locale): void {
    let oldValue = this.locale;
    this.locale = l;
    this.firePropertyChange$String$Object$Object('locale', oldValue, l);
    this.invalidateIfValid();
  }
  /**
   * Gets the location of this component in the form of a
   * point specifying the component's top-left corner.
   * The location will be relative to the parent's coordinate space.
   * <p>
   * Due to the asynchronous nature of native event handling, this
   * method can return outdated values (for instance, after several calls
   * of {@code setLocation()} in rapid succession).  For this
   * reason, the recommended method of obtaining a component's position is
   * within {@code java.awt.event.ComponentListener.componentMoved()},
   * which is called after the operating system has finished moving the
   * component.
   * </p>
   * @return an instance of {@code Point} representing
   *          the top-left corner of the component's bounds in
   *          the coordinate space of the component's parent
   * @see #setLocation
   * @see #getLocationOnScreen
   * @since 1.1
   */
  getLocation$(): Point {
    return this.location();
  }
  /**
   * Gets the location of this component in the form of a point
   * specifying the component's top-left corner in the screen's
   * coordinate space.
   * @return an instance of {@code Point} representing
   *          the top-left corner of the component's bounds in the
   *          coordinate space of the screen
   * @throws IllegalComponentStateException if the
   *          component is not showing on the screen
   * @see #setLocation
   * @see #getLocation
   */
  getLocationOnScreen(): Point {
    {
      return this.getLocationOnScreen_NoTreeLock();
    }
  }
  getLocationOnScreen_NoTreeLock(): Point {
    let peer = this.peer;
    if (peer != null && this.isShowing()) {
      if ($J.isa(peer, LightweightPeer)) {
        let host = this.getNativeContainer();
        let pt = host.peer.getLocationOnScreen();
        for (let c = this; c !== host; c = c.getContainer()) {
          pt.x_ = (pt.x_ + c.x_) | 0;
          pt.y_ = (pt.y_ + c.y_) | 0;
        }
        return pt;
      } else {
        let pt = peer.getLocationOnScreen();
        return pt;
      }
    } else {
      throw new IllegalComponentStateException()._IllegalComponentStateException$String('component must be showing on the screen to determine its location');
    }
  }
  /**
   * Returns the location of this component's top left corner.
   *
   * @return the location of this component's top left corner
   * @deprecated As of JDK version 1.1,
   * replaced by {@code getLocation()}.
   */
  location(): Point {
    return this.location_NoClientCode();
  }
  location_NoClientCode(): Point {
    return new Point()._Point$int$int(this.x_, this.y_);
  }
  /**
   * Moves this component to a new location. The top-left corner of
   * the new location is specified by the {@code x} and {@code y}
   * parameters in the coordinate space of this component's parent.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param x the <i>x</i>-coordinate of the new location's
   *          top-left corner in the parent's coordinate space
   * @param y the <i>y</i>-coordinate of the new location's
   *          top-left corner in the parent's coordinate space
   * @see #getLocation
   * @see #setBounds
   * @see #invalidate
   * @since 1.1
   */
  setLocation$int$int(x: number, y: number): void {
    this.move(x, y);
  }
  /**
   * Moves this component to a new location.
   *
   * @param  x the <i>x</i>-coordinate of the new location's
   *           top-left corner in the parent's coordinate space
   * @param  y the <i>y</i>-coordinate of the new location's
   *           top-left corner in the parent's coordinate space
   *
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setLocation(int, int)}.
   */
  move(x: number, y: number): void {
    {
      this.setBoundsOp(1);
      this.setBounds$int$int$int$int(x, y, this.width_, this.height_);
    }
  }
  /**
   * Moves this component to a new location. The top-left corner of
   * the new location is specified by point {@code p}. Point
   * {@code p} is given in the parent's coordinate space.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param p the point defining the top-left corner
   *          of the new location, given in the coordinate space of this
   *          component's parent
   * @see #getLocation
   * @see #setBounds
   * @see #invalidate
   * @since 1.1
   */
  setLocation$Point(p: Point): void {
    this.setLocation$int$int(p.x_, p.y_);
  }
  /**
   * Returns the size of this component in the form of a
   * {@code Dimension} object. The {@code height}
   * field of the {@code Dimension} object contains
   * this component's height, and the {@code width}
   * field of the {@code Dimension} object contains
   * this component's width.
   * @return a {@code Dimension} object that indicates the
   *          size of this component
   * @see #setSize
   * @since 1.1
   */
  getSize$(): Dimension {
    return this.size();
  }
  /**
   * Returns the size of this component in the form of a
   * {@code Dimension} object.
   *
   * @return the {@code Dimension} object that indicates the
   *         size of this component
   * @deprecated As of JDK version 1.1,
   * replaced by {@code getSize()}.
   */
  size(): Dimension {
    return new Dimension()._Dimension$int$int(this.width_, this.height_);
  }
  /**
   * Resizes this component so that it has width {@code width}
   * and height {@code height}.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param width the new width of this component in pixels
   * @param height the new height of this component in pixels
   * @see #getSize
   * @see #setBounds
   * @see #invalidate
   * @since 1.1
   */
  setSize$int$int(width: number, height: number): void {
    this.resize$int$int(width, height);
  }
  /**
   * Resizes this component.
   *
   * @param  width the new width of the component
   * @param  height the new height of the component
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setSize(int, int)}.
   */
  resize$int$int(width: number, height: number): void {
    {
      this.setBoundsOp(2);
      this.setBounds$int$int$int$int(this.x_, this.y_, width, height);
    }
  }
  /**
   * Resizes this component so that it has width {@code d.width}
   * and height {@code d.height}.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param d the dimension specifying the new size
   *          of this component
   * @throws NullPointerException if {@code d} is {@code null}
   * @see #setSize(int, int)
   * @see #getSize
   * @see #setBounds
   * @see #invalidate
   * @since 1.1
   */
  setSize$Dimension(d: Dimension): void {
    this.resize$Dimension(d);
  }
  /**
   * Resizes this component so that it has width {@code d.width}
   * and height {@code d.height}.
   *
   * @param  d the new size of this component
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setSize(Dimension)}.
   */
  resize$Dimension(d: Dimension): void {
    this.setSize$int$int(d.width_, d.height_);
  }
  /**
   * Gets the bounds of this component in the form of a
   * {@code Rectangle} object. The bounds specify this
   * component's width, height, and location relative to
   * its parent.
   * @return a rectangle indicating this component's bounds
   * @see #setBounds
   * @see #getLocation
   * @see #getSize
   */
  getBounds$(): Rectangle {
    return this.bounds();
  }
  /**
   * Returns the bounding rectangle of this component.
   *
   * @return the bounding rectangle for this component
   * @deprecated As of JDK version 1.1,
   * replaced by {@code getBounds()}.
   */
  bounds(): Rectangle {
    return new Rectangle()._Rectangle$int$int$int$int(this.x_, this.y_, this.width_, this.height_);
  }
  /**
   * Moves and resizes this component. The new location of the top-left
   * corner is specified by {@code x} and {@code y}, and the
   * new size is specified by {@code width} and {@code height}.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param x the new <i>x</i>-coordinate of this component
   * @param y the new <i>y</i>-coordinate of this component
   * @param width the new {@code width} of this component
   * @param height the new {@code height} of this
   *          component
   * @see #getBounds
   * @see #setLocation(int, int)
   * @see #setLocation(Point)
   * @see #setSize(int, int)
   * @see #setSize(Dimension)
   * @see #invalidate
   * @since 1.1
   */
  setBounds$int$int$int$int(x: number, y: number, width: number, height: number): void {
    this.reshape(x, y, width, height);
  }
  /**
   * Reshapes the bounding rectangle for this component.
   *
   * @param  x the <i>x</i> coordinate of the upper left corner of the rectangle
   * @param  y the <i>y</i> coordinate of the upper left corner of the rectangle
   * @param  width the width of the rectangle
   * @param  height the height of the rectangle
   *
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setBounds(int, int, int, int)}.
   */
  reshape(x: number, y: number, width: number, height: number): void {
    {
      try {
        this.setBoundsOp(3);
        let resized = (this.width_ !== width) || (this.height_ !== height);
        let moved = (this.x_ !== x) || (this.y_ !== y);
        if (!resized && !moved) {
          return;
        }
        let oldX = this.x_;
        let oldY = this.y_;
        let oldWidth = this.width_;
        let oldHeight = this.height_;
        this.x_ = x;
        this.y_ = y;
        this.width_ = width;
        this.height_ = height;
        if (resized) {
          this.isPacked = false;
        }
        let needNotify = true;
        this.mixOnReshaping();
        if (this.peer != null) {
          if (!($J.isa(this.peer, LightweightPeer))) {
            this.reshapeNativePeer(x, y, width, height, this.getBoundsOp());
            resized = (oldWidth !== this.width_) || (oldHeight !== this.height_);
            moved = (oldX !== this.x_) || (oldY !== this.y_);
            if (this instanceof Window) {
              needNotify = false;
            }
          }
          if (resized) {
            this.invalidate();
          }
          if (this.parent != null) {
            this.parent.invalidateIfValid();
          }
        }
        if (needNotify) {
          this.notifyNewBounds(resized, moved);
        }
        this.repaintParentIfNeeded(oldX, oldY, oldWidth, oldHeight);
      } finally {
        this.setBoundsOp(5);
      }
    }
  }
  repaintParentIfNeeded(oldX: number, oldY: number, oldWidth: number, oldHeight: number): void {
    if (this.parent != null && $J.isa(this.peer, LightweightPeer) && this.isShowing()) {
      this.parent.repaint$int$int$int$int(oldX, oldY, oldWidth, oldHeight);
      this.repaint$();
    }
  }
  reshapeNativePeer(x: number, y: number, width: number, height: number, op: number): void {
    let nativeX = x;
    let nativeY = y;
    for (let c = this.parent; (c != null) && ($J.isa(c.peer, LightweightPeer)); c = c.parent) {
      nativeX = (nativeX + c.x_) | 0;
      nativeY = (nativeY + c.y_) | 0;
    }
    this.peer.setBounds(nativeX, nativeY, width, height, op);
  }
  notifyNewBounds(resized: boolean, moved: boolean): void {
    if (this.componentListener != null || ($J.land(this.eventMask, AWTEvent.COMPONENT_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.COMPONENT_EVENT_MASK)) {
      if (resized) {
        let e = new ComponentEvent()._ComponentEvent(this, ComponentEvent.COMPONENT_RESIZED);
        Toolkit.getEventQueue().postEvent$AWTEvent(e);
      }
      if (moved) {
        let e = new ComponentEvent()._ComponentEvent(this, ComponentEvent.COMPONENT_MOVED);
        Toolkit.getEventQueue().postEvent$AWTEvent(e);
      }
    } else {
      if (this instanceof Container && (this).countComponents() > 0) {
        let enabledOnToolkit = Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK);
        if (resized) {
          (this).createChildHierarchyEvents(HierarchyEvent.ANCESTOR_RESIZED, 0, enabledOnToolkit);
        }
        if (moved) {
          (this).createChildHierarchyEvents(HierarchyEvent.ANCESTOR_MOVED, 0, enabledOnToolkit);
        }
      }
    }
  }
  /**
   * Moves and resizes this component to conform to the new
   * bounding rectangle {@code r}. This component's new
   * position is specified by {@code r.x} and {@code r.y},
   * and its new size is specified by {@code r.width} and
   * {@code r.height}
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param r the new bounding rectangle for this component
   * @throws NullPointerException if {@code r} is {@code null}
   * @see       #getBounds
   * @see       #setLocation(int, int)
   * @see       #setLocation(Point)
   * @see       #setSize(int, int)
   * @see       #setSize(Dimension)
   * @see #invalidate
   * @since     1.1
   */
  setBounds$Rectangle(r: Rectangle): void {
    this.setBounds$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
  }
  /**
   * Returns the current x coordinate of the components origin.
   * This method is preferable to writing
   * {@code component.getBounds().x},
   * or {@code component.getLocation().x} because it doesn't
   * cause any heap allocations.
   *
   * @return the current x coordinate of the components origin
   * @since 1.2
   */
  getX(): number {
    return this.x_;
  }
  /**
   * Returns the current y coordinate of the components origin.
   * This method is preferable to writing
   * {@code component.getBounds().y},
   * or {@code component.getLocation().y} because it
   * doesn't cause any heap allocations.
   *
   * @return the current y coordinate of the components origin
   * @since 1.2
   */
  getY(): number {
    return this.y_;
  }
  /**
   * Returns the current width of this component.
   * This method is preferable to writing
   * {@code component.getBounds().width},
   * or {@code component.getSize().width} because it
   * doesn't cause any heap allocations.
   *
   * @return the current width of this component
   * @since 1.2
   */
  getWidth(): number {
    return this.width_;
  }
  /**
   * Returns the current height of this component.
   * This method is preferable to writing
   * {@code component.getBounds().height},
   * or {@code component.getSize().height} because it
   * doesn't cause any heap allocations.
   *
   * @return the current height of this component
   * @since 1.2
   */
  getHeight(): number {
    return this.height_;
  }
  /**
   * Stores the bounds of this component into "return value" <b>rv</b> and
   * return <b>rv</b>.  If rv is {@code null} a new
   * {@code Rectangle} is allocated.
   * This version of {@code getBounds} is useful if the caller
   * wants to avoid allocating a new {@code Rectangle} object
   * on the heap.
   *
   * @param rv the return value, modified to the components bounds
   * @return rv
   */
  getBounds$Rectangle(rv: Rectangle): Rectangle {
    if (rv == null) {
      return new Rectangle()._Rectangle$int$int$int$int(this.getX(), this.getY(), this.getWidth(), this.getHeight());
    } else {
      rv.setBounds$int$int$int$int(this.getX(), this.getY(), this.getWidth(), this.getHeight());
      return rv;
    }
  }
  /**
   * Returns true if this component is completely opaque, returns
   * false by default.
   * <p>
   * An opaque component paints every pixel within its
   * rectangular region. A non-opaque component paints only some of
   * its pixels, allowing the pixels underneath it to "show through".
   * A component that does not fully paint its pixels therefore
   * provides a degree of transparency.
   * <p>
   * Subclasses that guarantee to always completely paint their
   * contents should override this method and return true.
   *
   * @return true if this component is completely opaque
   * @see #isLightweight
   * @since 1.2
   */
  isOpaque(): boolean {
    if (this.peer == null) {
      return false;
    } else {
      return !this.isLightweight();
    }
  }
  /**
   * A lightweight component doesn't have a native toolkit peer.
   * Subclasses of {@code Component} and {@code Container},
   * other than the ones defined in this package like {@code Button}
   * or {@code Scrollbar}, are lightweight.
   * All of the Swing components are lightweights.
   * <p>
   * This method will always return {@code false} if this component
   * is not displayable because it is impossible to determine the
   * weight of an undisplayable component.
   *
   * @return true if this component has a lightweight peer; false if
   *         it has a native peer or no peer
   * @see #isDisplayable
   * @since 1.2
   */
  isLightweight(): boolean {
    return $J.isa(this.peer, LightweightPeer);
  }
  /**
   * Sets the preferred size of this component to a constant
   * value.  Subsequent calls to {@code getPreferredSize} will always
   * return this value.  Setting the preferred size to {@code null}
   * restores the default behavior.
   *
   * @param preferredSize The new preferred size, or null
   * @see #getPreferredSize
   * @see #isPreferredSizeSet
   * @since 1.5
   */
  setPreferredSize(preferredSize: Dimension): void {
    let old: Dimension;
    if (this.prefSizeSet) {
      old = this.prefSize;
    } else {
      old = null;
    }
    this.prefSize = preferredSize;
    this.prefSizeSet = (preferredSize != null);
    this.firePropertyChange$String$Object$Object('preferredSize', old, preferredSize);
  }
  /**
   * Returns true if the preferred size has been set to a
   * non-{@code null} value otherwise returns false.
   *
   * @return true if {@code setPreferredSize} has been invoked
   *         with a non-null value.
   * @since 1.5
   */
  isPreferredSizeSet(): boolean {
    return this.prefSizeSet;
  }
  /**
   * Gets the preferred size of this component.
   * @return a dimension object indicating this component's preferred size
   * @see #getMinimumSize
   * @see LayoutManager
   */
  getPreferredSize$(): Dimension {
    return this.preferredSize$();
  }
  /**
   * Returns the component's preferred size.
   *
   * @return the component's preferred size
   * @deprecated As of JDK version 1.1,
   * replaced by {@code getPreferredSize()}.
   */
  preferredSize$(): Dimension {
    let dim = this.prefSize;
    if (dim == null || !(this.isPreferredSizeSet() || this.isValid())) {
      {
        this.prefSize = (this.peer != null) ? this.peer.getPreferredSize() : this.getMinimumSize$();
        dim = this.prefSize;
      }
    }
    return new Dimension()._Dimension$Dimension(dim);
  }
  /**
   * Sets the minimum size of this component to a constant
   * value.  Subsequent calls to {@code getMinimumSize} will always
   * return this value.  Setting the minimum size to {@code null}
   * restores the default behavior.
   *
   * @param minimumSize the new minimum size of this component
   * @see #getMinimumSize
   * @see #isMinimumSizeSet
   * @since 1.5
   */
  setMinimumSize(minimumSize: Dimension): void {
    let old: Dimension;
    if (this.minSizeSet) {
      old = this.minSize;
    } else {
      old = null;
    }
    this.minSize = minimumSize;
    this.minSizeSet = (minimumSize != null);
    this.firePropertyChange$String$Object$Object('minimumSize', old, minimumSize);
  }
  /**
   * Returns whether or not {@code setMinimumSize} has been
   * invoked with a non-null value.
   *
   * @return true if {@code setMinimumSize} has been invoked with a
   *              non-null value.
   * @since 1.5
   */
  isMinimumSizeSet(): boolean {
    return this.minSizeSet;
  }
  /**
   * Gets the minimum size of this component.
   * @return a dimension object indicating this component's minimum size
   * @see #getPreferredSize
   * @see LayoutManager
   */
  getMinimumSize$(): Dimension {
    return this.minimumSize$();
  }
  /**
   * Returns the minimum size of this component.
   *
   * @return the minimum size of this component
   * @deprecated As of JDK version 1.1,
   * replaced by {@code getMinimumSize()}.
   */
  minimumSize$(): Dimension {
    let dim = this.minSize;
    if (dim == null || !(this.isMinimumSizeSet() || this.isValid())) {
      {
        this.minSize = (this.peer != null) ? this.peer.getMinimumSize() : this.size();
        dim = this.minSize;
      }
    }
    return new Dimension()._Dimension$Dimension(dim);
  }
  /**
   * Sets the maximum size of this component to a constant
   * value.  Subsequent calls to {@code getMaximumSize} will always
   * return this value.  Setting the maximum size to {@code null}
   * restores the default behavior.
   *
   * @param maximumSize a {@code Dimension} containing the
   *          desired maximum allowable size
   * @see #getMaximumSize
   * @see #isMaximumSizeSet
   * @since 1.5
   */
  setMaximumSize(maximumSize: Dimension): void {
    let old: Dimension;
    if (this.maxSizeSet) {
      old = this.maxSize;
    } else {
      old = null;
    }
    this.maxSize = maximumSize;
    this.maxSizeSet = (maximumSize != null);
    this.firePropertyChange$String$Object$Object('maximumSize', old, maximumSize);
  }
  /**
   * Returns true if the maximum size has been set to a non-{@code null}
   * value otherwise returns false.
   *
   * @return true if {@code maximumSize} is non-{@code null},
   *          false otherwise
   * @since 1.5
   */
  isMaximumSizeSet(): boolean {
    return this.maxSizeSet;
  }
  /**
   * Gets the maximum size of this component.
   * @return a dimension object indicating this component's maximum size
   * @see #getMinimumSize
   * @see #getPreferredSize
   * @see LayoutManager
   */
  getMaximumSize(): Dimension {
    if (this.isMaximumSizeSet()) {
      return new Dimension()._Dimension$Dimension(this.maxSize);
    }
    return new Dimension()._Dimension$int$int(32767, 32767);
  }
  /**
   * Returns the alignment along the x axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   *
   * @return the horizontal alignment of this component
   */
  getAlignmentX(): number {
    return Component.CENTER_ALIGNMENT;
  }
  /**
   * Returns the alignment along the y axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   *
   * @return the vertical alignment of this component
   */
  getAlignmentY(): number {
    return Component.CENTER_ALIGNMENT;
  }
  /**
   * Returns the baseline.  The baseline is measured from the top of
   * the component.  This method is primarily meant for
   * {@code LayoutManager}s to align components along their
   * baseline.  A return value less than 0 indicates this component
   * does not have a reasonable baseline and that
   * {@code LayoutManager}s should not align this component on
   * its baseline.
   * <p>
   * The default implementation returns -1.  Subclasses that support
   * baseline should override appropriately.  If a value &gt;= 0 is
   * returned, then the component has a valid baseline for any
   * size &gt;= the minimum size and {@code getBaselineResizeBehavior}
   * can be used to determine how the baseline changes with size.
   *
   * @param width the width to get the baseline for
   * @param height the height to get the baseline for
   * @return the baseline or &lt; 0 indicating there is no reasonable
   *         baseline
   * @throws IllegalArgumentException if width or height is &lt; 0
   * @see #getBaselineResizeBehavior
   * @see java.awt.FontMetrics
   * @since 1.6
   */
  getBaseline(width: number, height: number): number {
    if (width < 0 || height < 0) {
      throw new IllegalArgumentException('Width and height must be >= 0');
    }
    return -1;
  }
  /**
   * Returns an enum indicating how the baseline of the component
   * changes as the size changes.  This method is primarily meant for
   * layout managers and GUI builders.
   * <p>
   * The default implementation returns
   * {@code BaselineResizeBehavior.OTHER}.  Subclasses that have a
   * baseline should override appropriately.  Subclasses should
   * never return {@code null}; if the baseline can not be
   * calculated return {@code BaselineResizeBehavior.OTHER}.  Callers
   * should first ask for the baseline using
   * {@code getBaseline} and if a value &gt;= 0 is returned use
   * this method.  It is acceptable for this method to return a
   * value other than {@code BaselineResizeBehavior.OTHER} even if
   * {@code getBaseline} returns a value less than 0.
   *
   * @return an enum indicating how the baseline changes as the component
   *         size changes
   * @see #getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(): Component$BaselineResizeBehavior {
    return Component$BaselineResizeBehavior.OTHER;
  }
  /**
   * Validates this component.
   * <p>
   * The meaning of the term <i>validating</i> is defined by the ancestors of
   * this class. See {@link Container#validate} for more details.
   *
   * @see       #invalidate
   * @see       #doLayout()
   * @see       LayoutManager
   * @see       Container#validate
   * @since     1.0
   */
  validate(): void {
    {
      let peer = this.peer;
      let wasValid = this.isValid();
      if (!wasValid && peer != null) {
        let newfont = this.getFont();
        let oldfont = this.peerFont;
        if (newfont != null && !Objects.equals(oldfont, newfont)) {
          peer.setFont(newfont);
          this.peerFont = newfont;
        }
        peer.layout();
      }
      this.valid = true;
      if (!wasValid) {
        this.mixOnValidating();
      }
    }
  }
  /**
   * Invalidates this component and its ancestors.
   * <p>
   * By default, all the ancestors of the component up to the top-most
   * container of the hierarchy are marked invalid. If the {@code
   * java.awt.smartInvalidate} system property is set to {@code true},
   * invalidation stops on the nearest validate root of this component.
   * Marking a container <i>invalid</i> indicates that the container needs to
   * be laid out.
   * <p>
   * This method is called automatically when any layout-related information
   * changes (e.g. setting the bounds of the component, or adding the
   * component to a container).
   * <p>
   * This method might be called often, so it should work fast.
   *
   * @see       #validate
   * @see       #doLayout
   * @see       LayoutManager
   * @see       java.awt.Container#isValidateRoot
   * @since     1.0
   */
  invalidate(): void {
    {
      this.valid = false;
      if (!this.isPreferredSizeSet()) {
        this.prefSize = null;
      }
      if (!this.isMinimumSizeSet()) {
        this.minSize = null;
      }
      if (!this.isMaximumSizeSet()) {
        this.maxSize = null;
      }
      this.invalidateParent();
    }
  }
  /**
   * Invalidates the parent of this component if any.
   *
   * This method MUST BE invoked under the TreeLock.
   */
  invalidateParent(): void {
    if (this.parent != null) {
      this.parent.invalidateIfValid();
    }
  }
  /**
   * Invalidates the component unless it is already invalid.
   */
  invalidateIfValid(): void {
    if (this.isValid()) {
      this.invalidate();
    }
  }
  /**
   * Revalidates the component hierarchy up to the nearest validate root.
   * <p>
   * This method first invalidates the component hierarchy starting from this
   * component up to the nearest validate root. Afterwards, the component
   * hierarchy is validated starting from the nearest validate root.
   * <p>
   * This is a convenience method supposed to help application developers
   * avoid looking for validate roots manually. Basically, it's equivalent to
   * first calling the {@link #invalidate()} method on this component, and
   * then calling the {@link #validate()} method on the nearest validate
   * root.
   *
   * @see Container#isValidateRoot
   * @since 1.7
   */
  revalidate(): void {
    this.revalidateSynchronously();
  }
  /**
   * Revalidates the component synchronously.
   */
  revalidateSynchronously(): void {
    {
      this.invalidate();
      let root = this.getContainer();
      if (root == null) {
        this.validate();
      } else {
        while (!root.isValidateRoot$()) {
          if (root.getContainer() == null) {
            break;
          }
          root = root.getContainer();
        }
        root.validate();
      }
    }
  }
  /**
   * Creates a graphics context for this component. This method will
   * return {@code null} if this component is currently not
   * displayable.
   * @return a graphics context for this component, or {@code null}
   *             if it has none
   * @see       #paint
   * @since     1.0
   */
  getGraphics(): Graphics {
    if ($J.isa(this.peer, LightweightPeer)) {
      if (this.parent == null) {
        return null;
      }
      let g = this.parent.getGraphics();
      if (g == null) {
        return null;
      }
      if ($J.isa(g, ConstrainableGraphics)) {
        (g).constrain(this.x_, this.y_, this.width_, this.height_);
      } else {
        g.translate$int$int(this.x_, this.y_);
        g.setClip$int$int$int$int(0, 0, this.width_, this.height_);
      }
      g.setFont(this.getFont());
      return g;
    } else {
      let peer = this.peer;
      return (peer != null) ? peer.getGraphics() : null;
    }
  }
  getGraphics_NoClientCode(): Graphics {
    let peer = this.peer;
    if ($J.isa(peer, LightweightPeer)) {
      let parent = this.parent;
      if (parent == null) {
        return null;
      }
      let g = parent.getGraphics_NoClientCode();
      if (g == null) {
        return null;
      }
      if ($J.isa(g, ConstrainableGraphics)) {
        (g).constrain(this.x_, this.y_, this.width_, this.height_);
      } else {
        g.translate$int$int(this.x_, this.y_);
        g.setClip$int$int$int$int(0, 0, this.width_, this.height_);
      }
      g.setFont(this.getFont_NoClientCode());
      return g;
    } else {
      return (peer != null) ? peer.getGraphics() : null;
    }
  }
  /**
   * Gets the font metrics for the specified font.
   * Warning: Since Font metrics are affected by the
   * {@link java.awt.font.FontRenderContext FontRenderContext} and
   * this method does not provide one, it can return only metrics for
   * the default render context which may not match that used when
   * rendering on the Component if {@link Graphics2D} functionality is being
   * used. Instead metrics can be obtained at rendering time by calling
   * {@link Graphics#getFontMetrics()} or text measurement APIs on the
   * {@link Font Font} class.
   * @param font the font for which font metrics is to be
   *          obtained
   * @return the font metrics for {@code font}
   * @see       #getFont
   * @see       java.awt.peer.ComponentPeer#getFontMetrics(Font)
   * @see       Toolkit#getFontMetrics(Font)
   * @since     1.0
   */
  getFontMetrics(font: Font): FontMetrics {
    return FontDesignMetrics.getMetrics(font);
  }
  /**
   * Sets the cursor image to the specified cursor.  This cursor
   * image is displayed when the {@code contains} method for
   * this component returns true for the current cursor location, and
   * this Component is visible, displayable, and enabled. Setting the
   * cursor of a {@code Container} causes that cursor to be displayed
   * within all of the container's subcomponents, except for those
   * that have a non-{@code null} cursor.
   * <p>
   * The method may have no visual effect if the Java platform
   * implementation and/or the native system do not support
   * changing the mouse cursor shape.
   * @param cursor One of the constants defined
   *          by the {@code Cursor} class;
   *          if this parameter is {@code null}
   *          then this component will inherit
   *          the cursor of its parent
   * @see       #isEnabled
   * @see       #isShowing
   * @see       #getCursor
   * @see       #contains
   * @see       Toolkit#createCustomCursor
   * @see       Cursor
   * @since     1.1
   */
  setCursor$Cursor(cursor: Cursor): void {
    this.cursor = cursor;
    this.updateCursorImmediately();
  }
  /**
   * Updates the cursor.  May not be invoked from the native
   * message pump.
   */
  updateCursorImmediately(): void {
    if ($J.isa(this.peer, LightweightPeer)) {
      let nativeContainer = this.getNativeContainer();
      if (nativeContainer == null) {
        return;
      }
      let cPeer = nativeContainer.peer;
      if (cPeer != null) {
        cPeer.updateCursorImmediately();
      }
    } else if (this.peer != null) {
      this.peer.updateCursorImmediately();
    }
  }
  /**
   * Gets the cursor set in the component. If the component does
   * not have a cursor set, the cursor of its parent is returned.
   * If no cursor is set in the entire hierarchy,
   * {@code Cursor.DEFAULT_CURSOR} is returned.
   *
   * @return the cursor for this component
   * @see #setCursor
   * @since 1.1
   */
  getCursor(): Cursor {
    return this.getCursor_NoClientCode();
  }
  getCursor_NoClientCode(): Cursor {
    let cursor = this.cursor;
    if (cursor != null) {
      return cursor;
    }
    let parent = this.parent;
    if (parent != null) {
      return parent.getCursor_NoClientCode();
    } else {
      return Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR);
    }
  }
  /**
   * Returns whether the cursor has been explicitly set for this Component.
   * If this method returns {@code false}, this Component is inheriting
   * its cursor from an ancestor.
   *
   * @return {@code true} if the cursor has been explicitly set for this
   *         Component; {@code false} otherwise.
   * @since 1.4
   */
  isCursorSet(): boolean {
    return (this.cursor != null);
  }
  /**
   * Paints this component.
   * <p>
   * This method is called when the contents of the component should
   * be painted; such as when the component is first being shown or
   * is damaged and in need of repair.  The clip rectangle in the
   * {@code Graphics} parameter is set to the area
   * which needs to be painted.
   * Subclasses of {@code Component} that override this
   * method need not call {@code super.paint(g)}.
   * <p>
   * For performance reasons, {@code Component}s with zero width
   * or height aren't considered to need painting when they are first shown,
   * and also aren't considered to need repair.
   * <p>
   * <b>Note</b>: For more information on the paint mechanisms utilitized
   * by AWT and Swing, including information on how to write the most
   * efficient painting code, see
   * <a href="http://www.oracle.com/technetwork/java/painting-140037.html">Painting in AWT and Swing</a>.
   *
   * @param g the graphics context to use for painting
   * @see       #update
   * @since     1.0
   */
  paint(g: Graphics): void {
  }
  /**
   * Repaints this component.
   * <p>
   * If this component is a lightweight component, this method
   * causes a call to this component's {@code paint}
   * method as soon as possible.  Otherwise, this method causes
   * a call to this component's {@code update} method as soon
   * as possible.
   * <p>
   * <b>Note</b>: For more information on the paint mechanisms utilitized
   * by AWT and Swing, including information on how to write the most
   * efficient painting code, see
   * <a href="http://www.oracle.com/technetwork/java/painting-140037.html">Painting in AWT and Swing</a>.
   *
   *
   * @see       #update(Graphics)
   * @since     1.0
   */
  repaint$(): void {
    this.repaint$long$int$int$int$int(0, 0, 0, this.width_, this.height_);
  }
  /**
   * Repaints the specified rectangle of this component.
   * <p>
   * If this component is a lightweight component, this method
   * causes a call to this component's {@code paint} method
   * as soon as possible.  Otherwise, this method causes a call to
   * this component's {@code update} method as soon as possible.
   * <p>
   * <b>Note</b>: For more information on the paint mechanisms utilitized
   * by AWT and Swing, including information on how to write the most
   * efficient painting code, see
   * <a href="http://www.oracle.com/technetwork/java/painting-140037.html">Painting in AWT and Swing</a>.
   *
   * @param     x   the <i>x</i> coordinate
   * @param     y   the <i>y</i> coordinate
   * @param     width   the width
   * @param     height  the height
   * @see       #update(Graphics)
   * @since     1.0
   */
  repaint$int$int$int$int(x: number, y: number, width: number, height: number): void {
    this.repaint$long$int$int$int$int(0, x, y, width, height);
  }
  /**
   * Repaints the specified rectangle of this component within
   * {@code tm} milliseconds.
   * <p>
   * If this component is a lightweight component, this method causes
   * a call to this component's {@code paint} method.
   * Otherwise, this method causes a call to this component's
   * {@code update} method.
   * <p>
   * <b>Note</b>: For more information on the paint mechanisms utilitized
   * by AWT and Swing, including information on how to write the most
   * efficient painting code, see
   * <a href="http://www.oracle.com/technetwork/java/painting-140037.html">Painting in AWT and Swing</a>.
   *
   * @param     tm   maximum time in milliseconds before update
   * @param     x    the <i>x</i> coordinate
   * @param     y    the <i>y</i> coordinate
   * @param     width    the width
   * @param     height   the height
   * @see       #update(Graphics)
   * @since     1.0
   */
  repaint$long$int$int$int$int(tm: number, x: number, y: number, width: number, height: number): void {
    if ($J.isa(this.peer, LightweightPeer)) {
      if (this.parent != null) {
        if (x < 0) {
          width = (width + x) | 0;
          x = 0;
        }
        if (y < 0) {
          height = (height + y) | 0;
          y = 0;
        }
        let pwidth = (width > this.width_) ? this.width_ : width;
        let pheight = (height > this.height_) ? this.height_ : height;
        if (pwidth <= 0 || pheight <= 0) {
          return;
        }
        let px = (this.x_ + x) | 0;
        let py = (this.y_ + y) | 0;
        this.parent.repaint$long$int$int$int$int(tm, px, py, pwidth, pheight);
      }
    } else {
      if (this.isVisible$() && (this.peer != null) && (width > 0) && (height > 0)) {
        let e = new PaintEvent()._PaintEvent(this, PaintEvent.UPDATE, new Rectangle()._Rectangle$int$int$int$int(x, y, width, height));
        SunToolkit.postEvent(SunToolkit.targetToAppContext(this), e);
      }
    }
  }
  /**
   * Prints this component. Applications should override this method
   * for components that must do special processing before being
   * printed or should be printed differently than they are painted.
   * <p>
   * The default implementation of this method calls the
   * {@code paint} method.
   * <p>
   * The origin of the graphics context, its
   * ({@code 0},&nbsp;{@code 0}) coordinate point, is the
   * top-left corner of this component. The clipping region of the
   * graphics context is the bounding rectangle of this component.
   * @param     g   the graphics context to use for printing
   * @see       #paint(Graphics)
   * @since     1.0
   */
  print$Graphics(g: Graphics): void {
    this.paint(g);
  }
  /**
   * Prints this component and all of its subcomponents.
   * <p>
   * The origin of the graphics context, its
   * ({@code 0},&nbsp;{@code 0}) coordinate point, is the
   * top-left corner of this component. The clipping region of the
   * graphics context is the bounding rectangle of this component.
   * @param     g   the graphics context to use for printing
   * @see       #print(Graphics)
   * @since     1.0
   */
  printAll(g: Graphics): void {
    if (this.isShowing()) {
      GraphicsCallback$PeerPrintCallback.getInstance().runOneComponent(this, new Rectangle()._Rectangle$int$int$int$int(0, 0, this.width_, this.height_), g, g.getClip(), SunGraphicsCallback.LIGHTWEIGHTS | SunGraphicsCallback.HEAVYWEIGHTS);
    }
  }
  /**
   * Simulates the peer callbacks into java.awt for printing of
   * lightweight Components.
   * @param     g   the graphics context to use for printing
   * @see       #printAll
   */
  lightweightPrint(g: Graphics): void {
    this.print$Graphics(g);
  }
  /**
   * Prints all the heavyweight subcomponents.
   */
  printHeavyweightComponents(g: Graphics): void {
  }
  getInsets_NoClientCode(): Insets {
    let peer = this.peer;
    if ($J.isa(peer, ContainerPeer)) {
      return (peer).getInsets().clone();
    }
    return new Insets()._Insets(0, 0, 0, 0);
  }
  /**
   * Creates an image from the specified image producer.
   * @param     producer  the image producer
   * @return    the image produced
   * @since     1.0
   */
  createImage$ImageProducer(producer: ImageProducer): Image {
    return this.getToolkit().createImage(producer);
  }
  /**
   * Creates an off-screen drawable image to be used for double buffering.
   *
   * @param  width the specified width
   * @param  height the specified height
   * @return an off-screen drawable image, which can be used for double
   *         buffering. The {@code null} value if the component is not
   *         displayable or {@code GraphicsEnvironment.isHeadless()} returns
   *         {@code true}.
   * @see #isDisplayable
   * @see GraphicsEnvironment#isHeadless
   * @since 1.0
   */
  createImage$int$int(width: number, height: number): Image {
    let peer = this.peer;
    if ($J.isa(peer, LightweightPeer)) {
      if (this.parent != null) {
        return this.parent.createImage$int$int(width, height);
      } else {
        return null;
      }
    } else {
      return (peer != null) ? peer.createImage(width, height) : null;
    }
  }
  /**
   * Creates a volatile off-screen drawable image to be used for double
   * buffering.
   *
   * @param  width the specified width
   * @param  height the specified height
   * @return an off-screen drawable image, which can be used for double
   *         buffering. The {@code null} value if the component is not
   *         displayable or {@code GraphicsEnvironment.isHeadless()} returns
   *         {@code true}.
   * @see java.awt.image.VolatileImage
   * @see #isDisplayable
   * @see GraphicsEnvironment#isHeadless
   * @since 1.4
   */
  createVolatileImage$int$int(width: number, height: number): VolatileImage {
    let peer = this.peer;
    if ($J.isa(peer, LightweightPeer)) {
      if (this.parent != null) {
        return this.parent.createVolatileImage$int$int(width, height);
      } else {
        return null;
      }
    } else {
      return (peer != null) ? peer.createVolatileImage(width, height) : null;
    }
  }
  /**
   * Prepares an image for rendering on this component at the
   * specified width and height.
   * <p>
   * The image data is downloaded asynchronously in another thread,
   * and an appropriately scaled screen representation of the image is
   * generated.
   * @param     image    the instance of {@code Image}
   *            for which to prepare a screen representation
   * @param     width    the width of the desired screen representation
   * @param     height   the height of the desired screen representation
   * @param     observer   the {@code ImageObserver} object
   *            to be notified as the image is being prepared
   * @return    {@code true} if the image has already been fully
   *          prepared; {@code false} otherwise
   * @see       java.awt.image.ImageObserver
   * @since     1.0
   */
  prepareImage$Image$int$int$ImageObserver(image: Image, width: number, height: number, observer: ImageObserver): boolean {
    return this.getToolkit().prepareImage(image, width, height, observer);
  }
  /**
   * Returns the status of the construction of a screen representation
   * of the specified image.
   * <p>
   * This method does not cause the image to begin loading. An
   * application must use the {@code prepareImage} method
   * to force the loading of an image.
   * <p>
   * The {@code checkImage} method of {@code Component}
   * calls its peer's {@code checkImage} method to calculate
   * the flags. If this component does not yet have a peer, the
   * component's toolkit's {@code checkImage} method is called
   * instead.
   * <p>
   * Information on the flags returned by this method can be found
   * with the discussion of the {@code ImageObserver} interface.
   * @param     image   the {@code Image} object whose status
   *                    is being checked
   * @param     width   the width of the scaled version
   *                    whose status is to be checked
   * @param     height  the height of the scaled version
   *                    whose status is to be checked
   * @param     observer   the {@code ImageObserver} object
   *                    to be notified as the image is being prepared
   * @return    the bitwise inclusive <b>OR</b> of
   *            {@code ImageObserver} flags indicating what
   *            information about the image is currently available
   * @see      #prepareImage(Image, int, int, java.awt.image.ImageObserver)
   * @see      Toolkit#checkImage(Image, int, int, java.awt.image.ImageObserver)
   * @see      java.awt.image.ImageObserver
   * @since    1.0
   */
  checkImage$Image$int$int$ImageObserver(image: Image, width: number, height: number, observer: ImageObserver): number {
    return this.getToolkit().checkImage(image, width, height, observer);
  }
  /**
   * Creates a new strategy for multi-buffering on this component with the
   * required buffer capabilities.  This is useful, for example, if only
   * accelerated memory or page flipping is desired (as specified by the
   * buffer capabilities).
   * <p>
   * Each time this method
   * is called, {@code dispose} will be invoked on the existing
   * {@code BufferStrategy}.
   * @param numBuffers number of buffers to create
   * @param caps the required capabilities for creating the buffer strategy;
   * cannot be {@code null}
   * @throws AWTException if the capabilities supplied could not be
   * supported or met; this may happen, for example, if there is not enough
   * accelerated memory currently available, or if page flipping is specified
   * but not possible.
   * @throws IllegalArgumentException if numBuffers is less than 1, or if
   * caps is {@code null}
   * @see Window#getBufferStrategy()
   * @see Canvas#getBufferStrategy()
   * @since 1.4
   */
  createBufferStrategy$int$BufferCapabilities(numBuffers: number, caps: BufferCapabilities): void {
    if (numBuffers < 1) {
      throw new IllegalArgumentException('Number of buffers must be at least 1');
    }
    if (caps == null) {
      throw new IllegalArgumentException('No capabilities specified');
    }
    if (this.bufferStrategy != null) {
      this.bufferStrategy.dispose();
    }
    if (numBuffers === 1) {
      this.bufferStrategy = new Component$SingleBufferStrategy().$o(this)._Component$SingleBufferStrategy(caps);
    } else {
      let sge = GraphicsEnvironment.getLocalGraphicsEnvironment();
      if (!caps.isPageFlipping$() && sge.isFlipStrategyPreferred(this.peer)) {
        caps = new Component$ProxyCapabilities()._Component$ProxyCapabilities(caps);
      }
      if (caps.isPageFlipping$()) {
        this.bufferStrategy = new Component$FlipSubRegionBufferStrategy().$o(this)._Component$FlipSubRegionBufferStrategy(numBuffers, caps);
      } else {
        this.bufferStrategy = new Component$BltSubRegionBufferStrategy().$o(this)._Component$BltSubRegionBufferStrategy(numBuffers, caps);
      }
    }
  }
  /**
   * @return the buffer strategy used by this component
   * @see Window#createBufferStrategy
   * @see Canvas#createBufferStrategy
   * @since 1.4
   */
  getBufferStrategy(): BufferStrategy {
    return this.bufferStrategy;
  }
  /**
   * Checks whether this component "contains" the specified point,
   * where {@code x} and {@code y} are defined to be
   * relative to the coordinate system of this component.
   *
   * @param     x   the <i>x</i> coordinate of the point
   * @param     y   the <i>y</i> coordinate of the point
   * @return {@code true} if the point is within the component;
   *         otherwise {@code false}
   * @see       #getComponentAt(int, int)
   * @since     1.1
   */
  contains$int$int(x: number, y: number): boolean {
    return this.inside(x, y);
  }
  /**
   * Checks whether the point is inside of this component.
   *
   * @param  x the <i>x</i> coordinate of the point
   * @param  y the <i>y</i> coordinate of the point
   * @return {@code true} if the point is within the component;
   *         otherwise {@code false}
   * @deprecated As of JDK version 1.1,
   * replaced by contains(int, int).
   */
  inside(x: number, y: number): boolean {
    return (x >= 0) && (x < this.width_) && (y >= 0) && (y < this.height_);
  }
  /**
   * Checks whether this component "contains" the specified point,
   * where the point's <i>x</i> and <i>y</i> coordinates are defined
   * to be relative to the coordinate system of this component.
   *
   * @param     p     the point
   * @return {@code true} if the point is within the component;
   *         otherwise {@code false}
   * @throws    NullPointerException if {@code p} is {@code null}
   * @see       #getComponentAt(Point)
   * @since     1.1
   */
  contains$Point(p: Point): boolean {
    return this.contains$int$int(p.x_, p.y_);
  }
  /**
   * Determines if this component or one of its immediate
   * subcomponents contains the (<i>x</i>,&nbsp;<i>y</i>) location,
   * and if so, returns the containing component. This method only
   * looks one level deep. If the point (<i>x</i>,&nbsp;<i>y</i>) is
   * inside a subcomponent that itself has subcomponents, it does not
   * go looking down the subcomponent tree.
   * <p>
   * The {@code locate} method of {@code Component} simply
   * returns the component itself if the (<i>x</i>,&nbsp;<i>y</i>)
   * coordinate location is inside its bounding box, and {@code null}
   * otherwise.
   * @param     x   the <i>x</i> coordinate
   * @param     y   the <i>y</i> coordinate
   * @return    the component or subcomponent that contains the
   *                (<i>x</i>,&nbsp;<i>y</i>) location;
   *                {@code null} if the location
   *                is outside this component
   * @see       #contains(int, int)
   * @since     1.0
   */
  getComponentAt$int$int(x: number, y: number): Component {
    return this.locate(x, y);
  }
  /**
   * Returns the component occupying the position specified (this component,
   * or immediate child component, or null if neither
   * of the first two occupies the location).
   *
   * @param  x the <i>x</i> coordinate to search for components at
   * @param  y the <i>y</i> coordinate to search for components at
   * @return the component at the specified location or {@code null}
   * @deprecated As of JDK version 1.1,
   * replaced by getComponentAt(int, int).
   */
  locate(x: number, y: number): Component {
    return this.contains$int$int(x, y) ? this : null;
  }
  /**
   * Dispatches an event to this component or one of its sub components.
   * Calls {@code processEvent} before returning for 1.1-style
   * events which have been enabled for the {@code Component}.
   * @param e the event
   */
  dispatchEvent(e: AWTEvent): void {
    this.dispatchEventImpl(e);
  }
  dispatchEventImpl(e: AWTEvent): void {
    let id = e.getID();
    let compContext = this.appContext;
    if (compContext != null && !$J.equals(compContext, AppContext.getAppContext())) {
      if (Component.eventLog.isLoggable(PlatformLogger_Level.FINE)) {
        Component.eventLog.fine('Event ' + $J.str(e) + ' is being dispatched on the wrong AppContext');
      }
    }
    if (Component.eventLog.isLoggable(PlatformLogger_Level.FINEST)) {
      Component.eventLog.finest('{0}', e);
    }
    if (!(e instanceof KeyEvent)) {
      EventQueue.setCurrentEventAndMostRecentTime(e);
    }
    if ($J.isa(e, SunDropTargetEvent)) {
      (e).dispatch();
      return;
    }
    if (!e.focusManagerIsDispatching) {
      if (e.isPosted) {
        e = KeyboardFocusManager.retargetFocusEvent(e);
        e.isPosted = true;
      }
      if (KeyboardFocusManager.getCurrentKeyboardFocusManager$().dispatchEvent(e)) {
        return;
      }
    }
    if ((e instanceof FocusEvent) && Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
      Component.focusLog.finest('' + $J.str(e));
    }
    if (id === MouseEvent.MOUSE_WHEEL && (!this.eventTypeEnabled(id)) && (this.peer != null && !this.peer.handlesWheelScrolling()) && (this.dispatchMouseWheelToAncestor(e))) {
      return;
    }
    let toolkit = Toolkit.getDefaultToolkit();
    toolkit.notifyAWTEventListeners(e);
    if (!e.isConsumed()) {
      if (e instanceof KeyEvent) {
        KeyboardFocusManager.getCurrentKeyboardFocusManager$().processKeyEvent(this, e);
        if (e.isConsumed()) {
          return;
        }
      }
    }
    var ctx;
    if (this.areInputMethodsEnabled()) {
      if (((e instanceof InputMethodEvent) && !($J.isa(this, CompositionArea))) || (e instanceof InputEvent) || (e instanceof FocusEvent)) {
        let inputContext = this.getInputContext();
        if (inputContext != null) {
          inputContext.dispatchEvent(e);
          if (e.isConsumed()) {
            if ((e instanceof FocusEvent) && Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
              Component.focusLog.finest('3579: Skipping ' + $J.str(e));
            }
            return;
          }
        }
      }
    } else {
      var ctx;
      if (id === FocusEvent.FOCUS_GAINED) {
        let inputContext = this.getInputContext();
        var ctx;
        if ($J.isa((ctx = inputContext), InputContext)) {
          ctx.disableNativeIM();
        }
      }
    }
    {
      let p: Container;
      switch (id) {
        case KeyEvent.KEY_PRESSED:
        case KeyEvent.KEY_RELEASED:
          p = ((this instanceof Container) ? this : this.parent);
          if (p != null) {
            p.preProcessKeyEvent(e);
            if (e.isConsumed()) {
              if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
                Component.focusLog.finest('Pre-process consumed event');
              }
              return;
            }
          }
          break;
        default:
          break;
      }
    }
    if (this.newEventsOnly) {
      if (this.eventEnabled(e)) {
        this.processEvent(e);
      }
    } else if (id === MouseEvent.MOUSE_WHEEL) {
      this.autoProcessMouseWheel(e);
    } else if (!(e instanceof MouseEvent && !this.postsOldMouseEvents())) {
      let olde = e.convertToOld();
      if (olde != null) {
        let key = olde.key;
        let modifiers = olde.modifiers;
        this.postEvent(olde);
        if (olde.isConsumed()) {
          e.consume();
        }
        switch (olde.id_) {
          case Event.KEY_PRESS:
          case Event.KEY_RELEASE:
          case Event.KEY_ACTION:
          case Event.KEY_ACTION_RELEASE:
            if (olde.key !== key) {
              (e).setKeyChar(olde.getKeyEventChar());
            }
            if (olde.modifiers !== modifiers) {
              (e).setModifiers(olde.modifiers);
            }
            break;
          default:
            break;
        }
      }
    }
    if (!(e instanceof KeyEvent)) {
      let tpeer = this.peer;
      if (e instanceof FocusEvent && (tpeer == null || $J.isa(tpeer, LightweightPeer))) {
        let source = e.getSource();
        if (source != null) {
          let target = source.getNativeContainer();
          if (target != null) {
            tpeer = target.peer;
          }
        }
      }
      if (tpeer != null) {
        tpeer.handleEvent(e);
      }
    }
    if (SunToolkit.isTouchKeyboardAutoShowEnabled() && ($J.isa(toolkit, SunToolkit)) && ((e instanceof MouseEvent) || (e instanceof FocusEvent))) {
      (toolkit).showOrHideTouchKeyboard(this, e);
    }
  }
  autoProcessMouseWheel(e: MouseWheelEvent): void {
  }
  dispatchMouseWheelToAncestor(e: MouseWheelEvent): boolean {
    let newX: number;
    let newY: number;
    newX = (e.getX() + this.getX()) | 0;
    newY = (e.getY() + this.getY()) | 0;
    let newMWE: MouseWheelEvent;
    if (Component.eventLog.isLoggable(PlatformLogger_Level.FINEST)) {
      Component.eventLog.finest('dispatchMouseWheelToAncestor');
      Component.eventLog.finest('orig event src is of ' + $J.str($J.getClass(e.getSource())));
    }
    {
      let anc = this.getParent();
      while (anc != null && !anc.eventEnabled(e)) {
        newX = (newX + anc.getX()) | 0;
        newY = (newY + anc.getY()) | 0;
        if (!(anc instanceof Window)) {
          anc = anc.getParent();
        } else {
          break;
        }
      }
      if (Component.eventLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.eventLog.finest('new event src is ' + $J.str(anc.getClass()));
      }
      if (anc != null && anc.eventEnabled(e)) {
        newMWE = new MouseWheelEvent()._MouseWheelEvent$Component$int$long$int$int$int$int$int$int$boolean$int$int$int$double(anc, e.getID(), e.getWhen(), e.getModifiers(), newX, newY, e.getXOnScreen(), e.getYOnScreen(), e.getClickCount(), e.isPopupTrigger(), e.getScrollType(), e.getScrollAmount(), e.getWheelRotation(), e.getPreciseWheelRotation());
        (e).copyPrivateDataInto(newMWE);
        anc.dispatchEventToSelf(newMWE);
        if (newMWE.isConsumed()) {
          e.consume();
        }
        return true;
      }
    }
    return false;
  }
  areInputMethodsEnabled(): boolean {
    return (($J.land(this.eventMask, AWTEvent.INPUT_METHODS_ENABLED_MASK)) !== 0) && (($J.land(this.eventMask, AWTEvent.KEY_EVENT_MASK)) !== 0 || this.keyListener != null);
  }
  eventEnabled(e: AWTEvent): boolean {
    return this.eventTypeEnabled(e.id_);
  }
  eventTypeEnabled(type$: number): boolean {
    switch (type$) {
      case ComponentEvent.COMPONENT_MOVED:
      case ComponentEvent.COMPONENT_RESIZED:
      case ComponentEvent.COMPONENT_SHOWN:
      case ComponentEvent.COMPONENT_HIDDEN:
        if (($J.land(this.eventMask, AWTEvent.COMPONENT_EVENT_MASK)) !== 0 || this.componentListener != null) {
          return true;
        }
        break;
      case FocusEvent.FOCUS_GAINED:
      case FocusEvent.FOCUS_LOST:
        if (($J.land(this.eventMask, AWTEvent.FOCUS_EVENT_MASK)) !== 0 || this.focusListener != null) {
          return true;
        }
        break;
      case KeyEvent.KEY_PRESSED:
      case KeyEvent.KEY_RELEASED:
      case KeyEvent.KEY_TYPED:
        if (($J.land(this.eventMask, AWTEvent.KEY_EVENT_MASK)) !== 0 || this.keyListener != null) {
          return true;
        }
        break;
      case MouseEvent.MOUSE_PRESSED:
      case MouseEvent.MOUSE_RELEASED:
      case MouseEvent.MOUSE_ENTERED:
      case MouseEvent.MOUSE_EXITED:
      case MouseEvent.MOUSE_CLICKED:
        if (($J.land(this.eventMask, AWTEvent.MOUSE_EVENT_MASK)) !== 0 || this.mouseListener != null) {
          return true;
        }
        break;
      case MouseEvent.MOUSE_MOVED:
      case MouseEvent.MOUSE_DRAGGED:
        if (($J.land(this.eventMask, AWTEvent.MOUSE_MOTION_EVENT_MASK)) !== 0 || this.mouseMotionListener != null) {
          return true;
        }
        break;
      case MouseEvent.MOUSE_WHEEL:
        if (($J.land(this.eventMask, AWTEvent.MOUSE_WHEEL_EVENT_MASK)) !== 0 || this.mouseWheelListener != null) {
          return true;
        }
        break;
      case InputMethodEvent.INPUT_METHOD_TEXT_CHANGED:
      case InputMethodEvent.CARET_POSITION_CHANGED:
        if (($J.land(this.eventMask, AWTEvent.INPUT_METHOD_EVENT_MASK)) !== 0 || this.inputMethodListener != null) {
          return true;
        }
        break;
      case HierarchyEvent.HIERARCHY_CHANGED:
        if (($J.land(this.eventMask, AWTEvent.HIERARCHY_EVENT_MASK)) !== 0 || this.hierarchyListener != null) {
          return true;
        }
        break;
      case HierarchyEvent.ANCESTOR_MOVED:
      case HierarchyEvent.ANCESTOR_RESIZED:
        if (($J.land(this.eventMask, AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK)) !== 0 || this.hierarchyBoundsListener != null) {
          return true;
        }
        break;
      case ActionEvent.ACTION_PERFORMED:
        if (($J.land(this.eventMask, AWTEvent.ACTION_EVENT_MASK)) !== 0) {
          return true;
        }
        break;
      case TextEvent.TEXT_VALUE_CHANGED:
        if (($J.land(this.eventMask, AWTEvent.TEXT_EVENT_MASK)) !== 0) {
          return true;
        }
        break;
      case ItemEvent.ITEM_STATE_CHANGED:
        if (($J.land(this.eventMask, AWTEvent.ITEM_EVENT_MASK)) !== 0) {
          return true;
        }
        break;
      case AdjustmentEvent.ADJUSTMENT_VALUE_CHANGED:
        if (($J.land(this.eventMask, AWTEvent.ADJUSTMENT_EVENT_MASK)) !== 0) {
          return true;
        }
        break;
      default:
        break;
    }
    if (type$ > AWTEvent.RESERVED_ID_MAX) {
      return true;
    }
    return false;
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by dispatchEvent(AWTEvent).
   */
  postEvent(e: Event): boolean {
    let peer = this.peer;
    if (this.handleEvent(e)) {
      e.consume();
      return true;
    }
    let parent = this.parent;
    let eventx = e.x_;
    let eventy = e.y_;
    if (parent != null) {
      e.translate(this.x_, this.y_);
      if (parent.postEvent(e)) {
        e.consume();
        return true;
      }
      e.x_ = eventx;
      e.y_ = eventy;
    }
    return false;
  }
  /**
   * Adds the specified component listener to receive component events from
   * this component.
   * If listener {@code l} is {@code null},
   * no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the component listener
   * @see      java.awt.event.ComponentEvent
   * @see      java.awt.event.ComponentListener
   * @see      #removeComponentListener
   * @see      #getComponentListeners
   * @since    1.1
   */
  addComponentListener(l: ComponentListener): void {
    if (l == null) {
      return;
    }
    this.componentListener = AWTEventMulticaster.add$ComponentListener$ComponentListener(this.componentListener, l);
    this.newEventsOnly = true;
  }
  /**
   * Removes the specified component listener so that it no longer
   * receives component events from this component. This method performs
   * no function, nor does it throw an exception, if the listener
   * specified by the argument was not previously added to this component.
   * If listener {@code l} is {@code null},
   * no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   * @param    l   the component listener
   * @see      java.awt.event.ComponentEvent
   * @see      java.awt.event.ComponentListener
   * @see      #addComponentListener
   * @see      #getComponentListeners
   * @since    1.1
   */
  removeComponentListener(l: ComponentListener): void {
    if (l == null) {
      return;
    }
    this.componentListener = AWTEventMulticaster.remove$ComponentListener$ComponentListener(this.componentListener, l);
  }
  /**
   * Adds the specified focus listener to receive focus events from
   * this component when this component gains input focus.
   * If listener {@code l} is {@code null},
   * no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the focus listener
   * @see      java.awt.event.FocusEvent
   * @see      java.awt.event.FocusListener
   * @see      #removeFocusListener
   * @see      #getFocusListeners
   * @since    1.1
   */
  addFocusListener(l: FocusListener): void {
    if (l == null) {
      return;
    }
    this.focusListener = AWTEventMulticaster.add$FocusListener$FocusListener(this.focusListener, l);
    this.newEventsOnly = true;
    if ($J.isa(this.peer, LightweightPeer)) {
      this.parent.proxyEnableEvents(AWTEvent.FOCUS_EVENT_MASK);
    }
  }
  /**
   * Removes the specified focus listener so that it no longer
   * receives focus events from this component. This method performs
   * no function, nor does it throw an exception, if the listener
   * specified by the argument was not previously added to this component.
   * If listener {@code l} is {@code null},
   * no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the focus listener
   * @see      java.awt.event.FocusEvent
   * @see      java.awt.event.FocusListener
   * @see      #addFocusListener
   * @see      #getFocusListeners
   * @since    1.1
   */
  removeFocusListener(l: FocusListener): void {
    if (l == null) {
      return;
    }
    this.focusListener = AWTEventMulticaster.remove$FocusListener$FocusListener(this.focusListener, l);
  }
  /**
   * Adds the specified hierarchy listener to receive hierarchy changed
   * events from this component when the hierarchy to which this container
   * belongs changes.
   * If listener {@code l} is {@code null},
   * no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the hierarchy listener
   * @see      java.awt.event.HierarchyEvent
   * @see      java.awt.event.HierarchyListener
   * @see      #removeHierarchyListener
   * @see      #getHierarchyListeners
   * @since    1.3
   */
  addHierarchyListener(l: HierarchyListener): void {
    if (l == null) {
      return;
    }
    let notifyAncestors: boolean;
    {
      notifyAncestors = (this.hierarchyListener == null && ($J.land(this.eventMask, AWTEvent.HIERARCHY_EVENT_MASK)) === 0);
      this.hierarchyListener = AWTEventMulticaster.add$HierarchyListener$HierarchyListener(this.hierarchyListener, l);
      notifyAncestors = (notifyAncestors && this.hierarchyListener != null);
      this.newEventsOnly = true;
    }
    if (notifyAncestors) {
      {
        this.adjustListeningChildrenOnParent(AWTEvent.HIERARCHY_EVENT_MASK, 1);
      }
    }
  }
  /**
   * Removes the specified hierarchy listener so that it no longer
   * receives hierarchy changed events from this component. This method
   * performs no function, nor does it throw an exception, if the listener
   * specified by the argument was not previously added to this component.
   * If listener {@code l} is {@code null},
   * no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the hierarchy listener
   * @see      java.awt.event.HierarchyEvent
   * @see      java.awt.event.HierarchyListener
   * @see      #addHierarchyListener
   * @see      #getHierarchyListeners
   * @since    1.3
   */
  removeHierarchyListener(l: HierarchyListener): void {
    if (l == null) {
      return;
    }
    let notifyAncestors: boolean;
    {
      notifyAncestors = (this.hierarchyListener != null && ($J.land(this.eventMask, AWTEvent.HIERARCHY_EVENT_MASK)) === 0);
      this.hierarchyListener = AWTEventMulticaster.remove$HierarchyListener$HierarchyListener(this.hierarchyListener, l);
      notifyAncestors = (notifyAncestors && this.hierarchyListener == null);
    }
    if (notifyAncestors) {
      {
        this.adjustListeningChildrenOnParent(AWTEvent.HIERARCHY_EVENT_MASK, -1);
      }
    }
  }
  numListening(mask: number): number {
    if (Component.eventLog.isLoggable(PlatformLogger_Level.FINE)) {
      if ((mask !== AWTEvent.HIERARCHY_EVENT_MASK) && (mask !== AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK)) {
        Component.eventLog.fine('Assertion failed');
      }
    }
    if ((mask === AWTEvent.HIERARCHY_EVENT_MASK && (this.hierarchyListener != null || ($J.land(this.eventMask, AWTEvent.HIERARCHY_EVENT_MASK)) !== 0)) || (mask === AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK && (this.hierarchyBoundsListener != null || ($J.land(this.eventMask, AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK)) !== 0))) {
      return 1;
    } else {
      return 0;
    }
  }
  countHierarchyMembers(): number {
    return 1;
  }
  createHierarchyEvents(id: number, changed: Component, changedParent: Container, changeFlags: number, enabledOnToolkit: boolean): number {
    switch (id) {
      case HierarchyEvent.HIERARCHY_CHANGED:
        if (this.hierarchyListener != null || ($J.land(this.eventMask, AWTEvent.HIERARCHY_EVENT_MASK)) !== 0 || enabledOnToolkit) {
          let e = new HierarchyEvent()._HierarchyEvent$Component$int$Component$Container$long(this, id, changed, changedParent, changeFlags);
          this.dispatchEvent(e);
          return 1;
        }
        break;
      case HierarchyEvent.ANCESTOR_MOVED:
      case HierarchyEvent.ANCESTOR_RESIZED:
        if (Component.eventLog.isLoggable(PlatformLogger_Level.FINE)) {
          if (changeFlags !== 0) {
            Component.eventLog.fine('Assertion (changeFlags == 0) failed');
          }
        }
        if (this.hierarchyBoundsListener != null || ($J.land(this.eventMask, AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK)) !== 0 || enabledOnToolkit) {
          let e = new HierarchyEvent()._HierarchyEvent$Component$int$Component$Container(this, id, changed, changedParent);
          this.dispatchEvent(e);
          return 1;
        }
        break;
      default:
        if (Component.eventLog.isLoggable(PlatformLogger_Level.FINE)) {
          Component.eventLog.fine('This code must never be reached');
        }
        break;
    }
    return 0;
  }
  adjustListeningChildrenOnParent(mask: number, num: number): void {
    if (this.parent != null) {
      this.parent.adjustListeningChildren(mask, num);
    }
  }
  /**
   * Adds the specified key listener to receive key events from
   * this component.
   * If l is null, no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the key listener.
   * @see      java.awt.event.KeyEvent
   * @see      java.awt.event.KeyListener
   * @see      #removeKeyListener
   * @see      #getKeyListeners
   * @since    1.1
   */
  addKeyListener(l: KeyListener): void {
    if (l == null) {
      return;
    }
    this.keyListener = AWTEventMulticaster.add$KeyListener$KeyListener(this.keyListener, l);
    this.newEventsOnly = true;
    if ($J.isa(this.peer, LightweightPeer)) {
      this.parent.proxyEnableEvents(AWTEvent.KEY_EVENT_MASK);
    }
  }
  /**
   * Removes the specified key listener so that it no longer
   * receives key events from this component. This method performs
   * no function, nor does it throw an exception, if the listener
   * specified by the argument was not previously added to this component.
   * If listener {@code l} is {@code null},
   * no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the key listener
   * @see      java.awt.event.KeyEvent
   * @see      java.awt.event.KeyListener
   * @see      #addKeyListener
   * @see      #getKeyListeners
   * @since    1.1
   */
  removeKeyListener(l: KeyListener): void {
    if (l == null) {
      return;
    }
    this.keyListener = AWTEventMulticaster.remove$KeyListener$KeyListener(this.keyListener, l);
  }
  /**
   * Returns an array of all the key listeners
   * registered on this component.
   *
   * @return all of this component's {@code KeyListener}s
   *         or an empty array if no key
   *         listeners are currently registered
   *
   * @see      #addKeyListener
   * @see      #removeKeyListener
   * @since    1.4
   */
  getKeyListeners(): KeyListener[] {
    return this.getListeners($J.cls(KeyListener));
  }
  /**
   * Adds the specified mouse listener to receive mouse events from
   * this component.
   * If listener {@code l} is {@code null},
   * no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the mouse listener
   * @see      java.awt.event.MouseEvent
   * @see      java.awt.event.MouseListener
   * @see      #removeMouseListener
   * @see      #getMouseListeners
   * @since    1.1
   */
  addMouseListener(l: MouseListener): void {
    if (l == null) {
      return;
    }
    this.mouseListener = AWTEventMulticaster.add$MouseListener$MouseListener(this.mouseListener, l);
    this.newEventsOnly = true;
    if ($J.isa(this.peer, LightweightPeer)) {
      this.parent.proxyEnableEvents(AWTEvent.MOUSE_EVENT_MASK);
    }
  }
  /**
   * Removes the specified mouse listener so that it no longer
   * receives mouse events from this component. This method performs
   * no function, nor does it throw an exception, if the listener
   * specified by the argument was not previously added to this component.
   * If listener {@code l} is {@code null},
   * no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the mouse listener
   * @see      java.awt.event.MouseEvent
   * @see      java.awt.event.MouseListener
   * @see      #addMouseListener
   * @see      #getMouseListeners
   * @since    1.1
   */
  removeMouseListener(l: MouseListener): void {
    if (l == null) {
      return;
    }
    this.mouseListener = AWTEventMulticaster.remove$MouseListener$MouseListener(this.mouseListener, l);
  }
  /**
   * Returns an array of all the mouse listeners
   * registered on this component.
   *
   * @return all of this component's {@code MouseListener}s
   *         or an empty array if no mouse
   *         listeners are currently registered
   *
   * @see      #addMouseListener
   * @see      #removeMouseListener
   * @since    1.4
   */
  getMouseListeners(): MouseListener[] {
    return this.getListeners($J.cls(MouseListener));
  }
  /**
   * Adds the specified mouse motion listener to receive mouse motion
   * events from this component.
   * If listener {@code l} is {@code null},
   * no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the mouse motion listener
   * @see      java.awt.event.MouseEvent
   * @see      java.awt.event.MouseMotionListener
   * @see      #removeMouseMotionListener
   * @see      #getMouseMotionListeners
   * @since    1.1
   */
  addMouseMotionListener(l: MouseMotionListener): void {
    if (l == null) {
      return;
    }
    this.mouseMotionListener = AWTEventMulticaster.add$MouseMotionListener$MouseMotionListener(this.mouseMotionListener, l);
    this.newEventsOnly = true;
    if ($J.isa(this.peer, LightweightPeer)) {
      this.parent.proxyEnableEvents(AWTEvent.MOUSE_MOTION_EVENT_MASK);
    }
  }
  /**
   * Removes the specified mouse motion listener so that it no longer
   * receives mouse motion events from this component. This method performs
   * no function, nor does it throw an exception, if the listener
   * specified by the argument was not previously added to this component.
   * If listener {@code l} is {@code null},
   * no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the mouse motion listener
   * @see      java.awt.event.MouseEvent
   * @see      java.awt.event.MouseMotionListener
   * @see      #addMouseMotionListener
   * @see      #getMouseMotionListeners
   * @since    1.1
   */
  removeMouseMotionListener(l: MouseMotionListener): void {
    if (l == null) {
      return;
    }
    this.mouseMotionListener = AWTEventMulticaster.remove$MouseMotionListener$MouseMotionListener(this.mouseMotionListener, l);
  }
  /**
   * Returns an array of all the mouse motion listeners
   * registered on this component.
   *
   * @return all of this component's {@code MouseMotionListener}s
   *         or an empty array if no mouse motion
   *         listeners are currently registered
   *
   * @see      #addMouseMotionListener
   * @see      #removeMouseMotionListener
   * @since    1.4
   */
  getMouseMotionListeners(): MouseMotionListener[] {
    return this.getListeners($J.cls(MouseMotionListener));
  }
  /**
   * Adds the specified mouse wheel listener to receive mouse wheel events
   * from this component.  Containers also receive mouse wheel events from
   * sub-components.
   * <p>
   * For information on how mouse wheel events are dispatched, see
   * the class description for {@link MouseWheelEvent}.
   * <p>
   * If l is {@code null}, no exception is thrown and no
   * action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the mouse wheel listener
   * @see      java.awt.event.MouseWheelEvent
   * @see      java.awt.event.MouseWheelListener
   * @see      #removeMouseWheelListener
   * @see      #getMouseWheelListeners
   * @since    1.4
   */
  addMouseWheelListener(l: MouseWheelListener): void {
    if (l == null) {
      return;
    }
    this.mouseWheelListener = AWTEventMulticaster.add$MouseWheelListener$MouseWheelListener(this.mouseWheelListener, l);
    this.newEventsOnly = true;
    if ($J.isa(this.peer, LightweightPeer)) {
      this.parent.proxyEnableEvents(AWTEvent.MOUSE_WHEEL_EVENT_MASK);
    }
  }
  /**
   * Removes the specified mouse wheel listener so that it no longer
   * receives mouse wheel events from this component. This method performs
   * no function, nor does it throw an exception, if the listener
   * specified by the argument was not previously added to this component.
   * If l is null, no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param    l   the mouse wheel listener.
   * @see      java.awt.event.MouseWheelEvent
   * @see      java.awt.event.MouseWheelListener
   * @see      #addMouseWheelListener
   * @see      #getMouseWheelListeners
   * @since    1.4
   */
  removeMouseWheelListener(l: MouseWheelListener): void {
    if (l == null) {
      return;
    }
    this.mouseWheelListener = AWTEventMulticaster.remove$MouseWheelListener$MouseWheelListener(this.mouseWheelListener, l);
  }
  /**
   * Returns an array of all the objects currently registered
   * as <code><em>Foo</em>Listener</code>s
   * upon this {@code Component}.
   * <code><em>Foo</em>Listener</code>s are registered using the
   * <code>add<em>Foo</em>Listener</code> method.
   *
   * <p>
   * You can specify the {@code listenerType} argument
   * with a class literal, such as
   * <code><em>Foo</em>Listener.class</code>.
   * For example, you can query a
   * {@code Component c}
   * for its mouse listeners with the following code:
   *
   * <pre>MouseListener[] mls = (MouseListener[])(c.getListeners(MouseListener.class));</pre>
   *
   * If no such listeners exist, this method returns an empty array.
   *
   * @param <T> the type of the listeners
   * @param listenerType the type of listeners requested; this parameter
   *          should specify an interface that descends from
   *          {@code java.util.EventListener}
   * @return an array of all objects registered as
   *          <code><em>Foo</em>Listener</code>s on this component,
   *          or an empty array if no such listeners have been added
   * @throws ClassCastException if {@code listenerType}
   *          doesn't specify a class or interface that implements
   *          {@code java.util.EventListener}
   * @throws NullPointerException if {@code listenerType} is {@code null}
   * @see #getComponentListeners
   * @see #getFocusListeners
   * @see #getHierarchyListeners
   * @see #getHierarchyBoundsListeners
   * @see #getKeyListeners
   * @see #getMouseListeners
   * @see #getMouseMotionListeners
   * @see #getMouseWheelListeners
   * @see #getInputMethodListeners
   * @see #getPropertyChangeListeners
   *
   * @since 1.3
   */
  getListeners<T>(listenerType: JClass<T>): T[] {
    let l = null;
    if (listenerType === $J.cls(ComponentListener)) {
      l = this.componentListener;
    } else if (listenerType === $J.cls(FocusListener)) {
      l = this.focusListener;
    } else if (listenerType === $J.cls(HierarchyListener)) {
      l = this.hierarchyListener;
    } else if (listenerType === $J.cls(HierarchyBoundsListener)) {
      l = this.hierarchyBoundsListener;
    } else if (listenerType === $J.cls(KeyListener)) {
      l = this.keyListener;
    } else if (listenerType === $J.cls(MouseListener)) {
      l = this.mouseListener;
    } else if (listenerType === $J.cls(MouseMotionListener)) {
      l = this.mouseMotionListener;
    } else if (listenerType === $J.cls(MouseWheelListener)) {
      l = this.mouseWheelListener;
    } else if (listenerType === $J.cls(InputMethodListener)) {
      l = this.inputMethodListener;
    } else if (listenerType === $J.cls(PropertyChangeListener)) {
      return this.getPropertyChangeListeners$();
    }
    return AWTEventMulticaster.getListeners(l, listenerType);
  }
  /**
   * Gets the input context used by this component for handling
   * the communication with input methods when text is entered
   * in this component. By default, the input context used for
   * the parent component is returned. Components may
   * override this to return a private input context.
   *
   * @return the input context used by this component;
   *          {@code null} if no context can be determined
   * @since 1.2
   */
  getInputContext(): InputContext {
    let parent = this.parent;
    if (parent == null) {
      return null;
    } else {
      return parent.getInputContext();
    }
  }
  /**
   * Enables the events defined by the specified event mask parameter
   * to be delivered to this component.
   * <p>
   * Event types are automatically enabled when a listener for
   * that event type is added to the component.
   * <p>
   * This method only needs to be invoked by subclasses of
   * {@code Component} which desire to have the specified event
   * types delivered to {@code processEvent} regardless of whether
   * or not a listener is registered.
   * @param      eventsToEnable   the event mask defining the event types
   * @see        #processEvent
   * @see        #disableEvents
   * @see        AWTEvent
   * @since      1.1
   */
  enableEvents(eventsToEnable: number): void {
    let notifyAncestors = 0;
    {
      if (($J.land(eventsToEnable, AWTEvent.HIERARCHY_EVENT_MASK)) !== 0 && this.hierarchyListener == null && ($J.land(this.eventMask, AWTEvent.HIERARCHY_EVENT_MASK)) === 0) {
        notifyAncestors = $J.lor(notifyAncestors, AWTEvent.HIERARCHY_EVENT_MASK);
      }
      if (($J.land(eventsToEnable, AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK)) !== 0 && this.hierarchyBoundsListener == null && ($J.land(this.eventMask, AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK)) === 0) {
        notifyAncestors = $J.lor(notifyAncestors, AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK);
      }
      this.eventMask = $J.lor(this.eventMask, eventsToEnable);
      this.newEventsOnly = true;
    }
    if ($J.isa(this.peer, LightweightPeer)) {
      this.parent.proxyEnableEvents(this.eventMask);
    }
    if (notifyAncestors !== 0) {
      {
        this.adjustListeningChildrenOnParent(notifyAncestors, 1);
      }
    }
  }
  /**
   * Indicates whether this class overrides coalesceEvents.
   * It is assumed that all classes that are loaded from the bootstrap
   *   do not.
   * The bootstrap class loader is assumed to be represented by null.
   * We do not check that the method really overrides
   *   (it might be static, private or package private).
   */
  checkCoalescing(): boolean {
    if ($J.getClass(this).getClassLoader() == null) {
      return false;
    }
    let clazz = $J.getClass(this);
    {
      let value = Component.coalesceMap.get(clazz);
      if (value != null) {
        return value;
      }
      let enabled = AccessController.doPrivileged(new (Component$3())().$o(this).$c(clazz));
      Component.coalesceMap.put(clazz, enabled);
      return enabled;
    }
  }
  /**
   * Indicates whether a class or its superclasses override coalesceEvents.
   * Must be called with lock on coalesceMap and privileged.
   * @see #checkCoalescing
   */
  static isCoalesceEventsOverriden(clazz: JClass<any>): boolean {
    // assert Thread.holdsLock(coalesceMap)
    let superclass = clazz.getSuperclass();
    if (superclass == null) {
      return false;
    }
    if (superclass.getClassLoader() != null) {
      let value = Component.coalesceMap.get(superclass);
      if (value == null) {
        if (Component.isCoalesceEventsOverriden(superclass)) {
          Component.coalesceMap.put(superclass, true);
          return true;
        }
      } else if (value) {
        return true;
      }
    }
    try {
      clazz.getDeclaredMethod('coalesceEvents', ...Component.coalesceEventsParams);
      return true;
    } catch ($e3) {
      if ($J.isa($e3, NoSuchMethodException)) {
        let e = $J.exc($e3);
        return false;
      } else {
        throw $e3;
      }
    }
  }
  /**
   * Indicates whether coalesceEvents may do something.
   */
  isCoalescingEnabled(): boolean {
    return this.coalescingEnabled;
  }
  /**
   * Potentially coalesce an event being posted with an existing
   * event.  This method is called by {@code EventQueue.postEvent}
   * if an event with the same ID as the event to be posted is found in
   * the queue (both events must have this component as their source).
   * This method either returns a coalesced event which replaces
   * the existing event (and the new event is then discarded), or
   * {@code null} to indicate that no combining should be done
   * (add the second event to the end of the queue).  Either event
   * parameter may be modified and returned, as the other one is discarded
   * unless {@code null} is returned.
   * <p>
   * This implementation of {@code coalesceEvents} coalesces
   * two event types: mouse move (and drag) events,
   * and paint (and update) events.
   * For mouse move events the last event is always returned, causing
   * intermediate moves to be discarded.  For paint events, the new
   * event is coalesced into a complex {@code RepaintArea} in the peer.
   * The new {@code AWTEvent} is always returned.
   *
   * @param  existingEvent  the event already on the {@code EventQueue}
   * @param  newEvent       the event being posted to the
   *          {@code EventQueue}
   * @return a coalesced event, or {@code null} indicating that no
   *          coalescing was done
   */
  coalesceEvents(existingEvent: AWTEvent, newEvent: AWTEvent): AWTEvent {
    return null;
  }
  /**
   * Processes events occurring on this component. By default this
   * method calls the appropriate
   * <code>process&lt;event&nbsp;type&gt;Event</code>
   * method for the given class of event.
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param     e the event
   * @see       #processComponentEvent
   * @see       #processFocusEvent
   * @see       #processKeyEvent
   * @see       #processMouseEvent
   * @see       #processMouseMotionEvent
   * @see       #processInputMethodEvent
   * @see       #processHierarchyEvent
   * @see       #processMouseWheelEvent
   * @since     1.1
   */
  processEvent(e: AWTEvent): void {
    if (e instanceof FocusEvent) {
      this.processFocusEvent(e);
    } else if (e instanceof MouseEvent) {
      switch (e.getID()) {
        case MouseEvent.MOUSE_PRESSED:
        case MouseEvent.MOUSE_RELEASED:
        case MouseEvent.MOUSE_CLICKED:
        case MouseEvent.MOUSE_ENTERED:
        case MouseEvent.MOUSE_EXITED:
          this.processMouseEvent$MouseEvent(e);
          break;
        case MouseEvent.MOUSE_MOVED:
        case MouseEvent.MOUSE_DRAGGED:
          this.processMouseMotionEvent(e);
          break;
        case MouseEvent.MOUSE_WHEEL:
          this.processMouseWheelEvent(e);
          break;
      }
    } else if (e instanceof KeyEvent) {
      this.processKeyEvent$KeyEvent(e);
    } else if (e instanceof ComponentEvent) {
      this.processComponentEvent(e);
    } else if (e instanceof InputMethodEvent) {
      this.processInputMethodEvent(e);
    } else if (e instanceof HierarchyEvent) {
      switch (e.getID()) {
        case HierarchyEvent.HIERARCHY_CHANGED:
          this.processHierarchyEvent(e);
          break;
        case HierarchyEvent.ANCESTOR_MOVED:
        case HierarchyEvent.ANCESTOR_RESIZED:
          this.processHierarchyBoundsEvent(e);
          break;
      }
    }
  }
  /**
   * Processes component events occurring on this component by
   * dispatching them to any registered
   * {@code ComponentListener} objects.
   * <p>
   * This method is not called unless component events are
   * enabled for this component. Component events are enabled
   * when one of the following occurs:
   * <ul>
   * <li>A {@code ComponentListener} object is registered
   * via {@code addComponentListener}.
   * <li>Component events are enabled via {@code enableEvents}.
   * </ul>
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param       e the component event
   * @see         java.awt.event.ComponentEvent
   * @see         java.awt.event.ComponentListener
   * @see         #addComponentListener
   * @see         #enableEvents
   * @since       1.1
   */
  processComponentEvent(e: ComponentEvent): void {
    let listener = this.componentListener;
    if (listener != null) {
      let id = e.getID();
      switch (id) {
        case ComponentEvent.COMPONENT_RESIZED:
          listener.componentResized(e);
          break;
        case ComponentEvent.COMPONENT_MOVED:
          listener.componentMoved(e);
          break;
        case ComponentEvent.COMPONENT_SHOWN:
          listener.componentShown(e);
          break;
        case ComponentEvent.COMPONENT_HIDDEN:
          listener.componentHidden(e);
          break;
      }
    }
  }
  /**
   * Processes focus events occurring on this component by
   * dispatching them to any registered
   * {@code FocusListener} objects.
   * <p>
   * This method is not called unless focus events are
   * enabled for this component. Focus events are enabled
   * when one of the following occurs:
   * <ul>
   * <li>A {@code FocusListener} object is registered
   * via {@code addFocusListener}.
   * <li>Focus events are enabled via {@code enableEvents}.
   * </ul>
   * <p>
   * If focus events are enabled for a {@code Component},
   * the current {@code KeyboardFocusManager} determines
   * whether or not a focus event should be dispatched to
   * registered {@code FocusListener} objects.  If the
   * events are to be dispatched, the {@code KeyboardFocusManager}
   * calls the {@code Component}'s {@code dispatchEvent}
   * method, which results in a call to the {@code Component}'s
   * {@code processFocusEvent} method.
   * <p>
   * If focus events are enabled for a {@code Component}, calling
   * the {@code Component}'s {@code dispatchEvent} method
   * with a {@code FocusEvent} as the argument will result in a
   * call to the {@code Component}'s {@code processFocusEvent}
   * method regardless of the current {@code KeyboardFocusManager}.
   *
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param       e the focus event
   * @see         java.awt.event.FocusEvent
   * @see         java.awt.event.FocusListener
   * @see         java.awt.KeyboardFocusManager
   * @see         #addFocusListener
   * @see         #enableEvents
   * @see         #dispatchEvent
   * @since       1.1
   */
  processFocusEvent(e: FocusEvent): void {
    let listener = this.focusListener;
    if (listener != null) {
      let id = e.getID();
      switch (id) {
        case FocusEvent.FOCUS_GAINED:
          listener.focusGained(e);
          break;
        case FocusEvent.FOCUS_LOST:
          listener.focusLost(e);
          break;
      }
    }
  }
  /**
   * Processes key events occurring on this component by
   * dispatching them to any registered
   * {@code KeyListener} objects.
   * <p>
   * This method is not called unless key events are
   * enabled for this component. Key events are enabled
   * when one of the following occurs:
   * <ul>
   * <li>A {@code KeyListener} object is registered
   * via {@code addKeyListener}.
   * <li>Key events are enabled via {@code enableEvents}.
   * </ul>
   *
   * <p>
   * If key events are enabled for a {@code Component},
   * the current {@code KeyboardFocusManager} determines
   * whether or not a key event should be dispatched to
   * registered {@code KeyListener} objects.  The
   * {@code DefaultKeyboardFocusManager} will not dispatch
   * key events to a {@code Component} that is not the focus
   * owner or is not showing.
   * <p>
   * As of J2SE 1.4, {@code KeyEvent}s are redirected to
   * the focus owner. Please see the
   * <a href="doc-files/FocusSpec.html">Focus Specification</a>
   * for further information.
   * <p>
   * Calling a {@code Component}'s {@code dispatchEvent}
   * method with a {@code KeyEvent} as the argument will
   * result in a call to the {@code Component}'s
   * {@code processKeyEvent} method regardless of the
   * current {@code KeyboardFocusManager} as long as the
   * component is showing, focused, and enabled, and key events
   * are enabled on it.
   * <p>If the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param       e the key event
   * @see         java.awt.event.KeyEvent
   * @see         java.awt.event.KeyListener
   * @see         java.awt.KeyboardFocusManager
   * @see         java.awt.DefaultKeyboardFocusManager
   * @see         #processEvent
   * @see         #dispatchEvent
   * @see         #addKeyListener
   * @see         #enableEvents
   * @see         #isShowing
   * @since       1.1
   */
  processKeyEvent$KeyEvent(e: KeyEvent): void {
    let listener = this.keyListener;
    if (listener != null) {
      let id = e.getID();
      switch (id) {
        case KeyEvent.KEY_TYPED:
          listener.keyTyped(e);
          break;
        case KeyEvent.KEY_PRESSED:
          listener.keyPressed(e);
          break;
        case KeyEvent.KEY_RELEASED:
          listener.keyReleased(e);
          break;
      }
    }
  }
  /**
   * Processes mouse events occurring on this component by
   * dispatching them to any registered
   * {@code MouseListener} objects.
   * <p>
   * This method is not called unless mouse events are
   * enabled for this component. Mouse events are enabled
   * when one of the following occurs:
   * <ul>
   * <li>A {@code MouseListener} object is registered
   * via {@code addMouseListener}.
   * <li>Mouse events are enabled via {@code enableEvents}.
   * </ul>
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param       e the mouse event
   * @see         java.awt.event.MouseEvent
   * @see         java.awt.event.MouseListener
   * @see         #addMouseListener
   * @see         #enableEvents
   * @since       1.1
   */
  processMouseEvent$MouseEvent(e: MouseEvent): void {
    let listener = this.mouseListener;
    if (listener != null) {
      let id = e.getID();
      switch (id) {
        case MouseEvent.MOUSE_PRESSED:
          listener.mousePressed(e);
          break;
        case MouseEvent.MOUSE_RELEASED:
          listener.mouseReleased(e);
          break;
        case MouseEvent.MOUSE_CLICKED:
          listener.mouseClicked(e);
          break;
        case MouseEvent.MOUSE_EXITED:
          listener.mouseExited(e);
          break;
        case MouseEvent.MOUSE_ENTERED:
          listener.mouseEntered(e);
          break;
      }
    }
  }
  /**
   * Processes mouse motion events occurring on this component by
   * dispatching them to any registered
   * {@code MouseMotionListener} objects.
   * <p>
   * This method is not called unless mouse motion events are
   * enabled for this component. Mouse motion events are enabled
   * when one of the following occurs:
   * <ul>
   * <li>A {@code MouseMotionListener} object is registered
   * via {@code addMouseMotionListener}.
   * <li>Mouse motion events are enabled via {@code enableEvents}.
   * </ul>
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param       e the mouse motion event
   * @see         java.awt.event.MouseEvent
   * @see         java.awt.event.MouseMotionListener
   * @see         #addMouseMotionListener
   * @see         #enableEvents
   * @since       1.1
   */
  processMouseMotionEvent(e: MouseEvent): void {
    let listener = this.mouseMotionListener;
    if (listener != null) {
      let id = e.getID();
      switch (id) {
        case MouseEvent.MOUSE_MOVED:
          listener.mouseMoved(e);
          break;
        case MouseEvent.MOUSE_DRAGGED:
          listener.mouseDragged(e);
          break;
      }
    }
  }
  /**
   * Processes mouse wheel events occurring on this component by
   * dispatching them to any registered
   * {@code MouseWheelListener} objects.
   * <p>
   * This method is not called unless mouse wheel events are
   * enabled for this component. Mouse wheel events are enabled
   * when one of the following occurs:
   * <ul>
   * <li>A {@code MouseWheelListener} object is registered
   * via {@code addMouseWheelListener}.
   * <li>Mouse wheel events are enabled via {@code enableEvents}.
   * </ul>
   * <p>
   * For information on how mouse wheel events are dispatched, see
   * the class description for {@link MouseWheelEvent}.
   * <p>
   * Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param       e the mouse wheel event
   * @see         java.awt.event.MouseWheelEvent
   * @see         java.awt.event.MouseWheelListener
   * @see         #addMouseWheelListener
   * @see         #enableEvents
   * @since       1.4
   */
  processMouseWheelEvent(e: MouseWheelEvent): void {
    let listener = this.mouseWheelListener;
    if (listener != null) {
      let id = e.getID();
      switch (id) {
        case MouseEvent.MOUSE_WHEEL:
          listener.mouseWheelMoved(e);
          break;
      }
    }
  }
  postsOldMouseEvents(): boolean {
    return false;
  }
  /**
   * Processes input method events occurring on this component by
   * dispatching them to any registered
   * {@code InputMethodListener} objects.
   * <p>
   * This method is not called unless input method events
   * are enabled for this component. Input method events are enabled
   * when one of the following occurs:
   * <ul>
   * <li>An {@code InputMethodListener} object is registered
   * via {@code addInputMethodListener}.
   * <li>Input method events are enabled via {@code enableEvents}.
   * </ul>
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param       e the input method event
   * @see         java.awt.event.InputMethodEvent
   * @see         java.awt.event.InputMethodListener
   * @see         #addInputMethodListener
   * @see         #enableEvents
   * @since       1.2
   */
  processInputMethodEvent(e: InputMethodEvent): void {
    let listener = this.inputMethodListener;
    if (listener != null) {
      let id = e.getID();
      switch (id) {
        case InputMethodEvent.INPUT_METHOD_TEXT_CHANGED:
          listener.inputMethodTextChanged(e);
          break;
        case InputMethodEvent.CARET_POSITION_CHANGED:
          listener.caretPositionChanged(e);
          break;
      }
    }
  }
  /**
   * Processes hierarchy events occurring on this component by
   * dispatching them to any registered
   * {@code HierarchyListener} objects.
   * <p>
   * This method is not called unless hierarchy events
   * are enabled for this component. Hierarchy events are enabled
   * when one of the following occurs:
   * <ul>
   * <li>An {@code HierarchyListener} object is registered
   * via {@code addHierarchyListener}.
   * <li>Hierarchy events are enabled via {@code enableEvents}.
   * </ul>
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param       e the hierarchy event
   * @see         java.awt.event.HierarchyEvent
   * @see         java.awt.event.HierarchyListener
   * @see         #addHierarchyListener
   * @see         #enableEvents
   * @since       1.3
   */
  processHierarchyEvent(e: HierarchyEvent): void {
    let listener = this.hierarchyListener;
    if (listener != null) {
      let id = e.getID();
      switch (id) {
        case HierarchyEvent.HIERARCHY_CHANGED:
          $J.fn(listener, 'hierarchyChanged')(e);
          break;
      }
    }
  }
  /**
   * Processes hierarchy bounds events occurring on this component by
   * dispatching them to any registered
   * {@code HierarchyBoundsListener} objects.
   * <p>
   * This method is not called unless hierarchy bounds events
   * are enabled for this component. Hierarchy bounds events are enabled
   * when one of the following occurs:
   * <ul>
   * <li>An {@code HierarchyBoundsListener} object is registered
   * via {@code addHierarchyBoundsListener}.
   * <li>Hierarchy bounds events are enabled via {@code enableEvents}.
   * </ul>
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param       e the hierarchy event
   * @see         java.awt.event.HierarchyEvent
   * @see         java.awt.event.HierarchyBoundsListener
   * @see         #addHierarchyBoundsListener
   * @see         #enableEvents
   * @since       1.3
   */
  processHierarchyBoundsEvent(e: HierarchyEvent): void {
    let listener = this.hierarchyBoundsListener;
    if (listener != null) {
      let id = e.getID();
      switch (id) {
        case HierarchyEvent.ANCESTOR_MOVED:
          listener.ancestorMoved(e);
          break;
        case HierarchyEvent.ANCESTOR_RESIZED:
          listener.ancestorResized(e);
          break;
      }
    }
  }
  /**
   * @param  evt the event to handle
   * @return {@code true} if the event was handled, {@code false} otherwise
   * @deprecated As of JDK version 1.1
   * replaced by processEvent(AWTEvent).
   */
  handleEvent(evt: Event): boolean {
    switch (evt.id_) {
      case Event.MOUSE_ENTER:
        return this.mouseEnter(evt, evt.x_, evt.y_);
      case Event.MOUSE_EXIT:
        return this.mouseExit(evt, evt.x_, evt.y_);
      case Event.MOUSE_MOVE:
        return this.mouseMove(evt, evt.x_, evt.y_);
      case Event.MOUSE_DOWN:
        return this.mouseDown(evt, evt.x_, evt.y_);
      case Event.MOUSE_DRAG:
        return this.mouseDrag(evt, evt.x_, evt.y_);
      case Event.MOUSE_UP:
        return this.mouseUp(evt, evt.x_, evt.y_);
      case Event.KEY_PRESS:
      case Event.KEY_ACTION:
        return this.keyDown(evt, evt.key);
      case Event.KEY_RELEASE:
      case Event.KEY_ACTION_RELEASE:
        return this.keyUp(evt, evt.key);
      case Event.ACTION_EVENT:
        return this.action(evt, evt.arg);
      case Event.GOT_FOCUS:
        return this.gotFocus(evt, evt.arg);
      case Event.LOST_FOCUS:
        return this.lostFocus(evt, evt.arg);
    }
    return false;
  }
  /**
   * @param  evt the event to handle
   * @param  x the x coordinate
   * @param  y the y coordinate
   * @return {@code false}
   * @deprecated As of JDK version 1.1,
   * replaced by processMouseEvent(MouseEvent).
   */
  mouseDown(evt: Event, x: number, y: number): boolean {
    return false;
  }
  /**
   * @param  evt the event to handle
   * @param  x the x coordinate
   * @param  y the y coordinate
   * @return {@code false}
   * @deprecated As of JDK version 1.1,
   * replaced by processMouseMotionEvent(MouseEvent).
   */
  mouseDrag(evt: Event, x: number, y: number): boolean {
    return false;
  }
  /**
   * @param  evt the event to handle
   * @param  x the x coordinate
   * @param  y the y coordinate
   * @return {@code false}
   * @deprecated As of JDK version 1.1,
   * replaced by processMouseEvent(MouseEvent).
   */
  mouseUp(evt: Event, x: number, y: number): boolean {
    return false;
  }
  /**
   * @param  evt the event to handle
   * @param  x the x coordinate
   * @param  y the y coordinate
   * @return {@code false}
   * @deprecated As of JDK version 1.1,
   * replaced by processMouseMotionEvent(MouseEvent).
   */
  mouseMove(evt: Event, x: number, y: number): boolean {
    return false;
  }
  /**
   * @param  evt the event to handle
   * @param  x the x coordinate
   * @param  y the y coordinate
   * @return {@code false}
   * @deprecated As of JDK version 1.1,
   * replaced by processMouseEvent(MouseEvent).
   */
  mouseEnter(evt: Event, x: number, y: number): boolean {
    return false;
  }
  /**
   * @param  evt the event to handle
   * @param  x the x coordinate
   * @param  y the y coordinate
   * @return {@code false}
   * @deprecated As of JDK version 1.1,
   * replaced by processMouseEvent(MouseEvent).
   */
  mouseExit(evt: Event, x: number, y: number): boolean {
    return false;
  }
  /**
   * @param  evt the event to handle
   * @param  key the key pressed
   * @return {@code false}
   * @deprecated As of JDK version 1.1,
   * replaced by processKeyEvent(KeyEvent).
   */
  keyDown(evt: Event, key: number): boolean {
    return false;
  }
  /**
   * @param  evt the event to handle
   * @param  key the key pressed
   * @return {@code false}
   * @deprecated As of JDK version 1.1,
   * replaced by processKeyEvent(KeyEvent).
   */
  keyUp(evt: Event, key: number): boolean {
    return false;
  }
  /**
   * @param  evt the event to handle
   * @param  what the object acted on
   * @return {@code false}
   * @deprecated As of JDK version 1.1,
   * should register this component as ActionListener on component
   * which fires action events.
   */
  action(evt: Event, what: any): boolean {
    return false;
  }
  /**
   * Makes this {@code Component} displayable by connecting it to a
   * native screen resource.
   * This method is called internally by the toolkit and should
   * not be called directly by programs.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @see       #isDisplayable
   * @see       #removeNotify
   * @see #invalidate
   * @since 1.0
   */
  addNotify(): void {
    {
      let peer = this.peer;
      if (peer == null || $J.isa(peer, LightweightPeer)) {
        if (peer == null) {
          this.peer = peer = this.getComponentFactory().createComponent(this);
        }
        if (this.parent != null) {
          let mask = 0;
          if ((this.mouseListener != null) || (($J.land(this.eventMask, AWTEvent.MOUSE_EVENT_MASK)) !== 0)) {
            mask = $J.lor(mask, AWTEvent.MOUSE_EVENT_MASK);
          }
          if ((this.mouseMotionListener != null) || (($J.land(this.eventMask, AWTEvent.MOUSE_MOTION_EVENT_MASK)) !== 0)) {
            mask = $J.lor(mask, AWTEvent.MOUSE_MOTION_EVENT_MASK);
          }
          if ((this.mouseWheelListener != null) || (($J.land(this.eventMask, AWTEvent.MOUSE_WHEEL_EVENT_MASK)) !== 0)) {
            mask = $J.lor(mask, AWTEvent.MOUSE_WHEEL_EVENT_MASK);
          }
          if (this.focusListener != null || ($J.land(this.eventMask, AWTEvent.FOCUS_EVENT_MASK)) !== 0) {
            mask = $J.lor(mask, AWTEvent.FOCUS_EVENT_MASK);
          }
          if (this.keyListener != null || ($J.land(this.eventMask, AWTEvent.KEY_EVENT_MASK)) !== 0) {
            mask = $J.lor(mask, AWTEvent.KEY_EVENT_MASK);
          }
          if (mask !== 0) {
            this.parent.proxyEnableEvents(mask);
          }
        }
      } else {
        let parent = this.getContainer();
        if (parent != null && parent.isLightweight()) {
          this.relocateComponent();
          if (!parent.isRecursivelyVisibleUpToHeavyweightContainer()) {
            peer.setVisible(false);
          }
        }
      }
      this.invalidate();
      let npopups = (this.popups != null ? this.popups.size() : 0);
      for (let i = 0; i < npopups; i++) {
        let popup = this.popups.elementAt(i);
        popup.addNotify();
      }
      if (this.dropTarget != null) {
        this.dropTarget.addNotify();
      }
      this.peerFont = this.getFont();
      if (this.getContainer() != null && !this.isAddNotifyComplete) {
        this.getContainer().increaseComponentCount(this);
      }
      this.updateZOrder();
      if (!this.isAddNotifyComplete) {
        this.mixOnShowing();
      }
      this.isAddNotifyComplete = true;
      if (this.hierarchyListener != null || ($J.land(this.eventMask, AWTEvent.HIERARCHY_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_EVENT_MASK)) {
        let e = new HierarchyEvent()._HierarchyEvent$Component$int$Component$Container$long(this, HierarchyEvent.HIERARCHY_CHANGED, this, this.parent, HierarchyEvent.DISPLAYABILITY_CHANGED | ((this.isRecursivelyVisible()) ? HierarchyEvent.SHOWING_CHANGED : 0));
        this.dispatchEvent(e);
      }
    }
  }
  /**
   * Makes this {@code Component} undisplayable by destroying it native
   * screen resource.
   * <p>
   * This method is called by the toolkit internally and should
   * not be called directly by programs. Code overriding
   * this method should call {@code super.removeNotify} as
   * the first line of the overriding method.
   *
   * @see       #isDisplayable
   * @see       #addNotify
   * @since 1.0
   */
  removeNotify(): void {
    KeyboardFocusManager.clearMostRecentFocusOwner(this);
    if (KeyboardFocusManager.getCurrentKeyboardFocusManager$().getPermanentFocusOwner() === this) {
      KeyboardFocusManager.getCurrentKeyboardFocusManager$().setGlobalPermanentFocusOwner(null);
    }
    {
      if (this.isFocusOwner() && KeyboardFocusManager.isAutoFocusTransferEnabledFor(this)) {
        this.transferFocus$boolean(true);
      }
      if (this.getContainer() != null && this.isAddNotifyComplete) {
        this.getContainer().decreaseComponentCount(this);
      }
      let npopups = (this.popups != null ? this.popups.size() : 0);
      for (let i = 0; i < npopups; i++) {
        let popup = this.popups.elementAt(i);
        popup.removeNotify();
      }
      if (($J.land(this.eventMask, AWTEvent.INPUT_METHODS_ENABLED_MASK)) !== 0) {
        let inputContext = this.getInputContext();
        if (inputContext != null) {
          inputContext.removeNotify(this);
        }
      }
      let p = this.peer;
      if (p != null) {
        let isLightweight = this.isLightweight();
        if (this.bufferStrategy instanceof Component$FlipBufferStrategy) {
          (this.bufferStrategy).invalidate();
        }
        if (this.dropTarget != null) {
          this.dropTarget.removeNotify();
        }
        if (this.visible) {
          p.setVisible(false);
        }
        this.peer = null;
        this.peerFont = null;
        Toolkit.getEventQueue().removeSourceEvents(this, false);
        KeyboardFocusManager.getCurrentKeyboardFocusManager$().discardKeyEvents(this);
        p.dispose();
        this.mixOnHiding(isLightweight);
        this.isAddNotifyComplete = false;
        this.compoundShape = null;
      }
      if (this.hierarchyListener != null || ($J.land(this.eventMask, AWTEvent.HIERARCHY_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_EVENT_MASK)) {
        let e = new HierarchyEvent()._HierarchyEvent$Component$int$Component$Container$long(this, HierarchyEvent.HIERARCHY_CHANGED, this, this.parent, HierarchyEvent.DISPLAYABILITY_CHANGED | ((this.isRecursivelyVisible()) ? HierarchyEvent.SHOWING_CHANGED : 0));
        this.dispatchEvent(e);
      }
    }
  }
  /**
   * @param  evt the event to handle
   * @param  what the object focused
   * @return  {@code false}
   * @deprecated As of JDK version 1.1,
   * replaced by processFocusEvent(FocusEvent).
   */
  gotFocus(evt: Event, what: any): boolean {
    return false;
  }
  /**
   * @param evt  the event to handle
   * @param what the object focused
   * @return  {@code false}
   * @deprecated As of JDK version 1.1,
   * replaced by processFocusEvent(FocusEvent).
   */
  lostFocus(evt: Event, what: any): boolean {
    return false;
  }
  /**
   * Returns whether this {@code Component} can become the focus
   * owner.
   *
   * @return {@code true} if this {@code Component} is
   * focusable; {@code false} otherwise
   * @see #setFocusable
   * @since 1.1
   * @deprecated As of 1.4, replaced by {@code isFocusable()}.
   */
  isFocusTraversable(): boolean {
    if (this.isFocusTraversableOverridden_ === Component.FOCUS_TRAVERSABLE_UNKNOWN) {
      this.isFocusTraversableOverridden_ = Component.FOCUS_TRAVERSABLE_DEFAULT;
    }
    return this.focusable;
  }
  /**
   * Returns whether this Component can be focused.
   *
   * @return {@code true} if this Component is focusable;
   *         {@code false} otherwise.
   * @see #setFocusable
   * @since 1.4
   */
  isFocusable(): boolean {
    return this.isFocusTraversable();
  }
  /**
   * Sets the focusable state of this Component to the specified value. This
   * value overrides the Component's default focusability.
   *
   * @param focusable indicates whether this Component is focusable
   * @see #isFocusable
   * @since 1.4
   */
  setFocusable(focusable: boolean): void {
    let oldFocusable: boolean;
    {
      oldFocusable = this.focusable;
      this.focusable = focusable;
    }
    this.isFocusTraversableOverridden_ = Component.FOCUS_TRAVERSABLE_SET;
    this.firePropertyChange$String$boolean$boolean('focusable', oldFocusable, focusable);
    if (oldFocusable && !focusable) {
      if (this.isFocusOwner() && KeyboardFocusManager.isAutoFocusTransferEnabled()) {
        this.transferFocus$boolean(true);
      }
      KeyboardFocusManager.clearMostRecentFocusOwner(this);
    }
  }
  isFocusTraversableOverridden(): boolean {
    return (this.isFocusTraversableOverridden_ !== Component.FOCUS_TRAVERSABLE_DEFAULT);
  }
  /**
   * Returns the Set of focus traversal keys for a given traversal operation
   * for this Component. (See
   * {@code setFocusTraversalKeys} for a full description of each key.)
   * <p>
   * If a Set of traversal keys has not been explicitly defined for this
   * Component, then this Component's parent's Set is returned. If no Set
   * has been explicitly defined for any of this Component's ancestors, then
   * the current KeyboardFocusManager's default Set is returned.
   *
   * @param id one of KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS,
   *        KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS, or
   *        KeyboardFocusManager.UP_CYCLE_TRAVERSAL_KEYS
   * @return the Set of AWTKeyStrokes for the specified operation. The Set
   *         will be unmodifiable, and may be empty. null will never be
   *         returned.
   * @see #setFocusTraversalKeys
   * @see KeyboardFocusManager#FORWARD_TRAVERSAL_KEYS
   * @see KeyboardFocusManager#BACKWARD_TRAVERSAL_KEYS
   * @see KeyboardFocusManager#UP_CYCLE_TRAVERSAL_KEYS
   * @throws IllegalArgumentException if id is not one of
   *         KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS,
   *         KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS, or
   *         KeyboardFocusManager.UP_CYCLE_TRAVERSAL_KEYS
   * @since 1.4
   */
  getFocusTraversalKeys(id: number): JSet<AWTKeyStroke> {
    if (id < 0 || id >= ((KeyboardFocusManager.TRAVERSAL_KEY_LENGTH - 1) | 0)) {
      throw new IllegalArgumentException('invalid focus traversal key identifier');
    }
    return this.getFocusTraversalKeys_NoIDCheck(id);
  }
  setFocusTraversalKeys_NoIDCheck(id: number, keystrokes: JSet<AWTKeyStroke>): void {
    let oldKeys: JSet<AWTKeyStroke>;
    {
      if (this.focusTraversalKeys == null) {
        this.initializeFocusTraversalKeys();
      }
      if (keystrokes != null) {
        for (const $it4 = keystrokes.iterator(); $it4.hasNext(); ) {
          let keystroke = $it4.next();
          if (keystroke == null) {
            throw new IllegalArgumentException('cannot set null focus traversal key');
          }
          if (keystroke.getKeyChar() !== KeyEvent.CHAR_UNDEFINED) {
            throw new IllegalArgumentException('focus traversal keys cannot map to KEY_TYPED events');
          }
          for (let i = 0; i < this.focusTraversalKeys.length; i++) {
            if (i === id) {
              continue;
            }
            if (this.getFocusTraversalKeys_NoIDCheck(i).contains(keystroke)) {
              throw new IllegalArgumentException('focus traversal keys must be unique for a Component');
            }
          }
        }
      }
      oldKeys = this.focusTraversalKeys[id];
      this.focusTraversalKeys[id] = (keystrokes != null) ? Collections.unmodifiableSet(new HashSet(keystrokes)) : null;
    }
    this.firePropertyChange$String$Object$Object(Component.focusTraversalKeyPropertyNames[id], oldKeys, keystrokes);
  }
  getFocusTraversalKeys_NoIDCheck(id: number): JSet<AWTKeyStroke> {
    let keystrokes = (this.focusTraversalKeys != null) ? this.focusTraversalKeys[id] : null;
    if (keystrokes != null) {
      return keystrokes;
    } else {
      let parent = this.parent;
      if (parent != null) {
        return parent.getFocusTraversalKeys(id);
      } else {
        return KeyboardFocusManager.getCurrentKeyboardFocusManager$().getDefaultFocusTraversalKeys(id);
      }
    }
  }
  /**
   * Sets whether focus traversal keys are enabled for this Component.
   * Components for which focus traversal keys are disabled receive key
   * events for focus traversal keys. Components for which focus traversal
   * keys are enabled do not see these events; instead, the events are
   * automatically converted to traversal operations.
   *
   * @param focusTraversalKeysEnabled whether focus traversal keys are
   *        enabled for this Component
   * @see #getFocusTraversalKeysEnabled
   * @see #setFocusTraversalKeys
   * @see #getFocusTraversalKeys
   * @since 1.4
   */
  setFocusTraversalKeysEnabled(focusTraversalKeysEnabled: boolean): void {
    let oldFocusTraversalKeysEnabled: boolean;
    {
      oldFocusTraversalKeysEnabled = this.focusTraversalKeysEnabled;
      this.focusTraversalKeysEnabled = focusTraversalKeysEnabled;
    }
    this.firePropertyChange$String$boolean$boolean('focusTraversalKeysEnabled', oldFocusTraversalKeysEnabled, focusTraversalKeysEnabled);
  }
  /**
   * Returns whether focus traversal keys are enabled for this Component.
   * Components for which focus traversal keys are disabled receive key
   * events for focus traversal keys. Components for which focus traversal
   * keys are enabled do not see these events; instead, the events are
   * automatically converted to traversal operations.
   *
   * @return whether focus traversal keys are enabled for this Component
   * @see #setFocusTraversalKeysEnabled
   * @see #setFocusTraversalKeys
   * @see #getFocusTraversalKeys
   * @since 1.4
   */
  getFocusTraversalKeysEnabled(): boolean {
    return this.focusTraversalKeysEnabled;
  }
  /**
   * Requests that this Component get the input focus, and that this
   * Component's top-level ancestor become the focused Window. This
   * component must be displayable, focusable, visible and all of
   * its ancestors (with the exception of the top-level Window) must
   * be visible for the request to be granted. Every effort will be
   * made to honor the request; however, in some cases it may be
   * impossible to do so. Developers must never assume that this
   * Component is the focus owner until this Component receives a
   * FOCUS_GAINED event. If this request is denied because this
   * Component's top-level Window cannot become the focused Window,
   * the request will be remembered and will be granted when the
   * Window is later focused by the user.
   * <p>
   * This method cannot be used to set the focus owner to no Component at
   * all. Use {@code KeyboardFocusManager.clearGlobalFocusOwner()}
   * instead.
   * <p>
   * Because the focus behavior of this method is platform-dependent,
   * developers are strongly encouraged to use
   * {@code requestFocusInWindow} when possible.
   *
   * <p>Note: Not all focus transfers result from invoking this method. As
   * such, a component may receive focus without this or any of the other
   * {@code requestFocus} methods of {@code Component} being invoked.
   *
   * @see #requestFocusInWindow
   * @see java.awt.event.FocusEvent
   * @see #addFocusListener
   * @see #isFocusable
   * @see #isDisplayable
   * @see KeyboardFocusManager#clearGlobalFocusOwner
   * @since 1.0
   */
  requestFocus$(): void {
    this.requestFocusHelper$boolean$boolean(false, true);
  }
  /**
   * Requests by the reason of {@code cause} that this Component get the input
   * focus, and that this Component's top-level ancestor become the
   * focused Window. This component must be displayable, focusable, visible
   * and all of its ancestors (with the exception of the top-level Window)
   * must be visible for the request to be granted. Every effort will be
   * made to honor the request; however, in some cases it may be
   * impossible to do so. Developers must never assume that this
   * Component is the focus owner until this Component receives a
   * FOCUS_GAINED event.
   * <p>
   * The focus request effect may also depend on the provided
   * cause value. If this request is succeed the {@code FocusEvent}
   * generated in the result will receive the cause value specified as the
   * argument of method. If this request is denied because this Component's
   * top-level Window cannot become the focused Window, the request will be
   * remembered and will be granted when the Window is later focused by the
   * user.
   * <p>
   * This method cannot be used to set the focus owner to no Component at
   * all. Use {@code KeyboardFocusManager.clearGlobalFocusOwner()}
   * instead.
   * <p>
   * Because the focus behavior of this method is platform-dependent,
   * developers are strongly encouraged to use
   * {@code requestFocusInWindow(FocusEvent.Cause)} when possible.
   *
   * <p>Note: Not all focus transfers result from invoking this method. As
   * such, a component may receive focus without this or any of the other
   * {@code requestFocus} methods of {@code Component} being invoked.
   *
   * @param  cause the cause why the focus is requested
   * @see FocusEvent
   * @see FocusEvent.Cause
   * @see #requestFocusInWindow(FocusEvent.Cause)
   * @see java.awt.event.FocusEvent
   * @see #addFocusListener
   * @see #isFocusable
   * @see #isDisplayable
   * @see KeyboardFocusManager#clearGlobalFocusOwner
   * @since 9
   */
  requestFocus$Cause(cause: FocusEvent$Cause): void {
    this.requestFocusHelper$boolean$boolean$Cause(false, true, cause);
  }
  /**
   * Requests that this {@code Component} get the input focus,
   * and that this {@code Component}'s top-level ancestor
   * become the focused {@code Window}. This component must be
   * displayable, focusable, visible and all of its ancestors (with
   * the exception of the top-level Window) must be visible for the
   * request to be granted. Every effort will be made to honor the
   * request; however, in some cases it may be impossible to do
   * so. Developers must never assume that this component is the
   * focus owner until this component receives a FOCUS_GAINED
   * event. If this request is denied because this component's
   * top-level window cannot become the focused window, the request
   * will be remembered and will be granted when the window is later
   * focused by the user.
   * <p>
   * This method returns a boolean value. If {@code false} is returned,
   * the request is <b>guaranteed to fail</b>. If {@code true} is
   * returned, the request will succeed <b>unless</b> it is vetoed, or an
   * extraordinary event, such as disposal of the component's peer, occurs
   * before the request can be granted by the native windowing system. Again,
   * while a return value of {@code true} indicates that the request is
   * likely to succeed, developers must never assume that this component is
   * the focus owner until this component receives a FOCUS_GAINED event.
   * <p>
   * This method cannot be used to set the focus owner to no component at
   * all. Use {@code KeyboardFocusManager.clearGlobalFocusOwner}
   * instead.
   * <p>
   * Because the focus behavior of this method is platform-dependent,
   * developers are strongly encouraged to use
   * {@code requestFocusInWindow} when possible.
   * <p>
   * Every effort will be made to ensure that {@code FocusEvent}s
   * generated as a
   * result of this request will have the specified temporary value. However,
   * because specifying an arbitrary temporary state may not be implementable
   * on all native windowing systems, correct behavior for this method can be
   * guaranteed only for lightweight {@code Component}s.
   * This method is not intended
   * for general use, but exists instead as a hook for lightweight component
   * libraries, such as Swing.
   *
   * <p>Note: Not all focus transfers result from invoking this method. As
   * such, a component may receive focus without this or any of the other
   * {@code requestFocus} methods of {@code Component} being invoked.
   *
   * @param temporary true if the focus change is temporary,
   *        such as when the window loses the focus; for
   *        more information on temporary focus changes see the
   * <a href="doc-files/FocusSpec.html">Focus Specification</a>
   * @return {@code false} if the focus change request is guaranteed to
   *         fail; {@code true} if it is likely to succeed
   * @see java.awt.event.FocusEvent
   * @see #addFocusListener
   * @see #isFocusable
   * @see #isDisplayable
   * @see KeyboardFocusManager#clearGlobalFocusOwner
   * @since 1.4
   */
  requestFocus$boolean(temporary: boolean): boolean {
    return this.requestFocusHelper$boolean$boolean(temporary, true);
  }
  /**
   * Requests by the reason of {@code cause} that this {@code Component} get
   * the input focus, and that this {@code Component}'s top-level ancestor
   * become the focused {@code Window}. This component must be
   * displayable, focusable, visible and all of its ancestors (with
   * the exception of the top-level Window) must be visible for the
   * request to be granted. Every effort will be made to honor the
   * request; however, in some cases it may be impossible to do
   * so. Developers must never assume that this component is the
   * focus owner until this component receives a FOCUS_GAINED
   * event. If this request is denied because this component's
   * top-level window cannot become the focused window, the request
   * will be remembered and will be granted when the window is later
   * focused by the user.
   * <p>
   * This method returns a boolean value. If {@code false} is returned,
   * the request is <b>guaranteed to fail</b>. If {@code true} is
   * returned, the request will succeed <b>unless</b> it is vetoed, or an
   * extraordinary event, such as disposal of the component's peer, occurs
   * before the request can be granted by the native windowing system. Again,
   * while a return value of {@code true} indicates that the request is
   * likely to succeed, developers must never assume that this component is
   * the focus owner until this component receives a FOCUS_GAINED event.
   * <p>
   * The focus request effect may also depend on the provided
   * cause value. If this request is succeed the {FocusEvent}
   * generated in the result will receive the cause value specified as the
   * argument of the method.
   * <p>
   * This method cannot be used to set the focus owner to no component at
   * all. Use {@code KeyboardFocusManager.clearGlobalFocusOwner}
   * instead.
   * <p>
   * Because the focus behavior of this method is platform-dependent,
   * developers are strongly encouraged to use
   * {@code requestFocusInWindow} when possible.
   * <p>
   * Every effort will be made to ensure that {@code FocusEvent}s
   * generated as a
   * result of this request will have the specified temporary value. However,
   * because specifying an arbitrary temporary state may not be implementable
   * on all native windowing systems, correct behavior for this method can be
   * guaranteed only for lightweight {@code Component}s.
   * This method is not intended
   * for general use, but exists instead as a hook for lightweight component
   * libraries, such as Swing.
   * <p>
   * Note: Not all focus transfers result from invoking this method. As
   * such, a component may receive focus without this or any of the other
   * {@code requestFocus} methods of {@code Component} being invoked.
   *
   * @param temporary true if the focus change is temporary,
   *        such as when the window loses the focus; for
   *        more information on temporary focus changes see the
   * <a href="doc-files/FocusSpec.html">Focus Specification</a>
   *
   * @param  cause the cause why the focus is requested
   * @return {@code false} if the focus change request is guaranteed to
   *         fail; {@code true} if it is likely to succeed
   * @see FocusEvent
   * @see FocusEvent.Cause
   * @see #addFocusListener
   * @see #isFocusable
   * @see #isDisplayable
   * @see KeyboardFocusManager#clearGlobalFocusOwner
   * @since 9
   */
  requestFocus$boolean$Cause(temporary: boolean, cause: FocusEvent$Cause): boolean {
    return this.requestFocusHelper$boolean$boolean$Cause(temporary, true, cause);
  }
  /**
   * Requests that this Component get the input focus, if this
   * Component's top-level ancestor is already the focused
   * Window. This component must be displayable, focusable, visible
   * and all of its ancestors (with the exception of the top-level
   * Window) must be visible for the request to be granted. Every
   * effort will be made to honor the request; however, in some
   * cases it may be impossible to do so. Developers must never
   * assume that this Component is the focus owner until this
   * Component receives a FOCUS_GAINED event.
   * <p>
   * This method returns a boolean value. If {@code false} is returned,
   * the request is <b>guaranteed to fail</b>. If {@code true} is
   * returned, the request will succeed <b>unless</b> it is vetoed, or an
   * extraordinary event, such as disposal of the Component's peer, occurs
   * before the request can be granted by the native windowing system. Again,
   * while a return value of {@code true} indicates that the request is
   * likely to succeed, developers must never assume that this Component is
   * the focus owner until this Component receives a FOCUS_GAINED event.
   * <p>
   * This method cannot be used to set the focus owner to no Component at
   * all. Use {@code KeyboardFocusManager.clearGlobalFocusOwner()}
   * instead.
   * <p>
   * The focus behavior of this method can be implemented uniformly across
   * platforms, and thus developers are strongly encouraged to use this
   * method over {@code requestFocus} when possible. Code which relies
   * on {@code requestFocus} may exhibit different focus behavior on
   * different platforms.
   *
   * <p>Note: Not all focus transfers result from invoking this method. As
   * such, a component may receive focus without this or any of the other
   * {@code requestFocus} methods of {@code Component} being invoked.
   *
   * @return {@code false} if the focus change request is guaranteed to
   *         fail; {@code true} if it is likely to succeed
   * @see #requestFocus
   * @see java.awt.event.FocusEvent
   * @see #addFocusListener
   * @see #isFocusable
   * @see #isDisplayable
   * @see KeyboardFocusManager#clearGlobalFocusOwner
   * @since 1.4
   */
  requestFocusInWindow$(): boolean {
    return this.requestFocusHelper$boolean$boolean(false, false);
  }
  /**
   * Requests by the reason of {@code cause} that this Component get the input
   * focus, if this Component's top-level ancestor is already the focused
   * Window. This component must be displayable, focusable, visible
   * and all of its ancestors (with the exception of the top-level
   * Window) must be visible for the request to be granted. Every
   * effort will be made to honor the request; however, in some
   * cases it may be impossible to do so. Developers must never
   * assume that this Component is the focus owner until this
   * Component receives a FOCUS_GAINED event.
   * <p>
   * This method returns a boolean value. If {@code false} is returned,
   * the request is <b>guaranteed to fail</b>. If {@code true} is
   * returned, the request will succeed <b>unless</b> it is vetoed, or an
   * extraordinary event, such as disposal of the Component's peer, occurs
   * before the request can be granted by the native windowing system. Again,
   * while a return value of {@code true} indicates that the request is
   * likely to succeed, developers must never assume that this Component is
   * the focus owner until this Component receives a FOCUS_GAINED event.
   * <p>
   * The focus request effect may also depend on the provided
   * cause value. If this request is succeed the {@code FocusEvent}
   * generated in the result will receive the cause value specified as the
   * argument of the method.
   * <p>
   * This method cannot be used to set the focus owner to no Component at
   * all. Use {@code KeyboardFocusManager.clearGlobalFocusOwner()}
   * instead.
   * <p>
   * The focus behavior of this method can be implemented uniformly across
   * platforms, and thus developers are strongly encouraged to use this
   * method over {@code requestFocus(FocusEvent.Cause)} when possible.
   * Code which relies on {@code requestFocus(FocusEvent.Cause)} may exhibit
   * different focus behavior on different platforms.
   *
   * <p>Note: Not all focus transfers result from invoking this method. As
   * such, a component may receive focus without this or any of the other
   * {@code requestFocus} methods of {@code Component} being invoked.
   *
   * @param  cause the cause why the focus is requested
   * @return {@code false} if the focus change request is guaranteed to
   *         fail; {@code true} if it is likely to succeed
   * @see #requestFocus(FocusEvent.Cause)
   * @see FocusEvent
   * @see FocusEvent.Cause
   * @see java.awt.event.FocusEvent
   * @see #addFocusListener
   * @see #isFocusable
   * @see #isDisplayable
   * @see KeyboardFocusManager#clearGlobalFocusOwner
   * @since 9
   */
  requestFocusInWindow$Cause(cause: FocusEvent$Cause): boolean {
    return this.requestFocusHelper$boolean$boolean$Cause(false, false, cause);
  }
  requestFocusHelper$boolean$boolean(temporary: boolean, focusedWindowChangeAllowed: boolean): boolean {
    return this.requestFocusHelper$boolean$boolean$Cause(temporary, focusedWindowChangeAllowed, FocusEvent$Cause.UNKNOWN);
  }
  requestFocusHelper$boolean$boolean$Cause(temporary: boolean, focusedWindowChangeAllowed: boolean, cause: FocusEvent$Cause): boolean {
    let currentEvent = EventQueue.getCurrentEvent();
    if (currentEvent instanceof MouseEvent && SunToolkit.isSystemGenerated(currentEvent)) {
      let source = (currentEvent).getComponent();
      if (source == null || source.getContainingWindow() === this.getContainingWindow()) {
        Component.focusLog.finest('requesting focus by mouse event "in window"');
        focusedWindowChangeAllowed = false;
      }
    }
    if (!this.isRequestFocusAccepted(temporary, focusedWindowChangeAllowed, cause)) {
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.focusLog.finest('requestFocus is not accepted');
      }
      return false;
    }
    KeyboardFocusManager.setMostRecentFocusOwner$Component(this);
    let window = this;
    while ((window != null) && !(window instanceof Window)) {
      if (!window.isVisible$()) {
        if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
          Component.focusLog.finest('component is recursively invisible');
        }
        return false;
      }
      window = window.parent;
    }
    let peer = this.peer;
    let heavyweight = ($J.isa(peer, LightweightPeer)) ? this.getNativeContainer() : this;
    if (heavyweight == null || !heavyweight.isVisible$()) {
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.focusLog.finest('Component is not a part of visible hierarchy');
      }
      return false;
    }
    peer = heavyweight.peer;
    if (peer == null) {
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.focusLog.finest('Peer is null');
      }
      return false;
    }
    let time = 0;
    if (EventQueue.isDispatchThread()) {
      time = Toolkit.getEventQueue().getMostRecentKeyEventTime();
    } else {
      time = $J.system_currentTimeMillis();
    }
    let success = peer.requestFocus(this, temporary, focusedWindowChangeAllowed, time, cause);
    if (!success) {
      KeyboardFocusManager.getCurrentKeyboardFocusManager$AppContext(this.appContext).dequeueKeyEvents(time, this);
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.focusLog.finest('Peer request failed');
      }
    } else {
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.focusLog.finest('Pass for ' + $J.str(this));
      }
    }
    return success;
  }
  isRequestFocusAccepted(temporary: boolean, focusedWindowChangeAllowed: boolean, cause: FocusEvent$Cause): boolean {
    if (!this.isFocusable() || !this.isVisible$()) {
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.focusLog.finest('Not focusable or not visible');
      }
      return false;
    }
    let peer = this.peer;
    if (peer == null) {
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.focusLog.finest('peer is null');
      }
      return false;
    }
    let window = this.getContainingWindow();
    if (window == null || !window.isFocusableWindow()) {
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.focusLog.finest('Component doesn\'t have toplevel');
      }
      return false;
    }
    let focusOwner = KeyboardFocusManager.getMostRecentFocusOwner(window);
    if (focusOwner == null) {
      focusOwner = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner();
      if (focusOwner != null && focusOwner.getContainingWindow() !== window) {
        focusOwner = null;
      }
    }
    if (focusOwner === this || focusOwner == null) {
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.focusLog.finest('focus owner is null or this');
      }
      return true;
    }
    if (FocusEvent$Cause.ACTIVATION === cause) {
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.focusLog.finest('cause is activation');
      }
      return true;
    }
    let ret = Component.requestFocusController.acceptRequestFocus(focusOwner, this, temporary, focusedWindowChangeAllowed, cause);
    if (Component.focusLog.isLoggable(PlatformLogger_Level.FINEST)) {
      Component.focusLog.finest('RequestFocusController returns {0}', ret);
    }
    return ret;
  }
  static setRequestFocusController(requestController: RequestFocusController): void {
    if (requestController == null) {
      Component.requestFocusController = new Component$DummyRequestFocusController()._Component$DummyRequestFocusController();
    } else {
      Component.requestFocusController = requestController;
    }
  }
  /**
   * Returns the Container which is the focus cycle root of this Component's
   * focus traversal cycle. Each focus traversal cycle has only a single
   * focus cycle root and each Component which is not a Container belongs to
   * only a single focus traversal cycle. Containers which are focus cycle
   * roots belong to two cycles: one rooted at the Container itself, and one
   * rooted at the Container's nearest focus-cycle-root ancestor. For such
   * Containers, this method will return the Container's nearest focus-cycle-
   * root ancestor.
   *
   * @return this Component's nearest focus-cycle-root ancestor
   * @see Container#isFocusCycleRoot()
   * @since 1.4
   */
  getFocusCycleRootAncestor(): Container {
    let rootAncestor = this.parent;
    while (rootAncestor != null && !rootAncestor.isFocusCycleRoot$()) {
      rootAncestor = rootAncestor.parent;
    }
    return rootAncestor;
  }
  /**
   * Returns whether the specified Container is the focus cycle root of this
   * Component's focus traversal cycle. Each focus traversal cycle has only
   * a single focus cycle root and each Component which is not a Container
   * belongs to only a single focus traversal cycle.
   *
   * @param container the Container to be tested
   * @return {@code true} if the specified Container is a focus-cycle-
   *         root of this Component; {@code false} otherwise
   * @see Container#isFocusCycleRoot()
   * @since 1.4
   */
  isFocusCycleRoot$Container(container: Container): boolean {
    let rootAncestor = this.getFocusCycleRootAncestor();
    return (rootAncestor === container);
  }
  getTraversalRoot(): Container {
    return this.getFocusCycleRootAncestor();
  }
  /**
   * Transfers the focus to the next component, as though this Component were
   * the focus owner.
   * @see       #requestFocus()
   * @since     1.1
   */
  transferFocus$(): void {
    this.nextFocus();
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by transferFocus().
   */
  nextFocus(): void {
    this.transferFocus$boolean(false);
  }
  transferFocus$boolean(clearOnFailure: boolean): boolean {
    if (Component.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
      Component.focusLog.finer('clearOnFailure = ' + clearOnFailure);
    }
    let toFocus = this.getNextFocusCandidate();
    let res = false;
    if (toFocus != null && !toFocus.isFocusOwner() && toFocus !== this) {
      res = toFocus.requestFocusInWindow$Cause(FocusEvent$Cause.TRAVERSAL_FORWARD);
    }
    if (clearOnFailure && !res) {
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
        Component.focusLog.finer('clear global focus owner');
      }
      KeyboardFocusManager.getCurrentKeyboardFocusManager$().clearGlobalFocusOwnerPriv();
    }
    if (Component.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
      Component.focusLog.finer('returning result: ' + res);
    }
    return res;
  }
  getNextFocusCandidate(): Component {
    let rootAncestor = this.getTraversalRoot();
    let comp = this;
    while (rootAncestor != null && !(rootAncestor.isShowing() && rootAncestor.canBeFocusOwner())) {
      comp = rootAncestor;
      rootAncestor = comp.getFocusCycleRootAncestor();
    }
    if (Component.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
      Component.focusLog.finer('comp = ' + $J.str(comp) + ', root = ' + $J.str(rootAncestor));
    }
    let candidate = null;
    if (rootAncestor != null) {
      let policy = rootAncestor.getFocusTraversalPolicy();
      let toFocus = policy.getComponentAfter(rootAncestor, comp);
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
        Component.focusLog.finer('component after is ' + $J.str(toFocus));
      }
      if (toFocus == null) {
        toFocus = policy.getDefaultComponent(rootAncestor);
        if (Component.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
          Component.focusLog.finer('default component is ' + $J.str(toFocus));
        }
      }
      if (toFocus == null) {
        let applet = EmbeddedFrame.getAppletIfAncestorOf(this);
        if (applet != null) {
          toFocus = applet;
        }
      }
      candidate = toFocus;
    }
    if (Component.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
      Component.focusLog.finer('Focus transfer candidate: ' + $J.str(candidate));
    }
    return candidate;
  }
  /**
   * Transfers the focus to the previous component, as though this Component
   * were the focus owner.
   * @see       #requestFocus()
   * @since     1.4
   */
  transferFocusBackward$(): void {
    this.transferFocusBackward$boolean(false);
  }
  transferFocusBackward$boolean(clearOnFailure: boolean): boolean {
    let rootAncestor = this.getTraversalRoot();
    let comp = this;
    while (rootAncestor != null && !(rootAncestor.isShowing() && rootAncestor.canBeFocusOwner())) {
      comp = rootAncestor;
      rootAncestor = comp.getFocusCycleRootAncestor();
    }
    let res = false;
    if (rootAncestor != null) {
      let policy = rootAncestor.getFocusTraversalPolicy();
      let toFocus = policy.getComponentBefore(rootAncestor, comp);
      if (toFocus == null) {
        toFocus = policy.getDefaultComponent(rootAncestor);
      }
      if (toFocus != null) {
        res = toFocus.requestFocusInWindow$Cause(FocusEvent$Cause.TRAVERSAL_BACKWARD);
      }
    }
    if (clearOnFailure && !res) {
      if (Component.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
        Component.focusLog.finer('clear global focus owner');
      }
      KeyboardFocusManager.getCurrentKeyboardFocusManager$().clearGlobalFocusOwnerPriv();
    }
    if (Component.focusLog.isLoggable(PlatformLogger_Level.FINER)) {
      Component.focusLog.finer('returning result: ' + res);
    }
    return res;
  }
  /**
   * Transfers the focus up one focus traversal cycle. Typically, the focus
   * owner is set to this Component's focus cycle root, and the current focus
   * cycle root is set to the new focus owner's focus cycle root. If,
   * however, this Component's focus cycle root is a Window, then the focus
   * owner is set to the focus cycle root's default Component to focus, and
   * the current focus cycle root is unchanged.
   *
   * @see       #requestFocus()
   * @see       Container#isFocusCycleRoot()
   * @see       Container#setFocusCycleRoot(boolean)
   * @since     1.4
   */
  transferFocusUpCycle(): void {
    let rootAncestor: Container;
    for (rootAncestor = this.getFocusCycleRootAncestor(); rootAncestor != null && !(rootAncestor.isShowing() && rootAncestor.isFocusable() && rootAncestor.isEnabled()); rootAncestor = rootAncestor.getFocusCycleRootAncestor()) {
    }
    if (rootAncestor != null) {
      let rootAncestorRootAncestor = rootAncestor.getFocusCycleRootAncestor();
      let fcr = (rootAncestorRootAncestor != null) ? rootAncestorRootAncestor : rootAncestor;
      KeyboardFocusManager.getCurrentKeyboardFocusManager$().setGlobalCurrentFocusCycleRootPriv(fcr);
      rootAncestor.requestFocus$Cause(FocusEvent$Cause.TRAVERSAL_UP);
    } else {
      let window = this.getContainingWindow();
      if (window != null) {
        let toFocus = window.getFocusTraversalPolicy().getDefaultComponent(window);
        if (toFocus != null) {
          KeyboardFocusManager.getCurrentKeyboardFocusManager$().setGlobalCurrentFocusCycleRootPriv(window);
          toFocus.requestFocus$Cause(FocusEvent$Cause.TRAVERSAL_UP);
        }
      }
    }
  }
  /**
   * Returns {@code true} if this {@code Component} is the
   * focus owner.  This method is obsolete, and has been replaced by
   * {@code isFocusOwner()}.
   *
   * @return {@code true} if this {@code Component} is the
   *         focus owner; {@code false} otherwise
   * @since 1.2
   */
  hasFocus(): boolean {
    return (KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner() === this);
  }
  /**
   * Returns {@code true} if this {@code Component} is the
   *    focus owner.
   *
   * @return {@code true} if this {@code Component} is the
   *     focus owner; {@code false} otherwise
   * @since 1.4
   */
  isFocusOwner(): boolean {
    return this.hasFocus();
  }
  setAutoFocusTransferOnDisposal(value: boolean): void {
    this.autoFocusTransferOnDisposal = value;
  }
  isAutoFocusTransferOnDisposal(): boolean {
    return this.autoFocusTransferOnDisposal;
  }
  /**
   * Returns a string representing the state of this component. This
   * method is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not be
   * {@code null}.
   *
   * @return  a string representation of this component's state
   * @since     1.0
   */
  paramString(): string {
    let thisName = Objects.toString(this.getName$(), '');
    let invalid = this.isValid() ? '' : ',invalid';
    let hidden = this.visible ? '' : ',hidden';
    let disabled = this.enabled ? '' : ',disabled';
    return thisName + String.fromCharCode(44 /* ',' */) + this.x_ + String.fromCharCode(44 /* ',' */) + this.y_ + String.fromCharCode(44 /* ',' */) + this.width_ + String.fromCharCode(120 /* 'x' */) + this.height_ + invalid + hidden + disabled;
  }
  /**
   * Returns a string representation of this component and its values.
   * @return    a string representation of this component
   * @since     1.0
   */
  toString(): string {
    return $J.getClass(this).getName() + String.fromCharCode(91 /* '[' */) + this.paramString() + String.fromCharCode(93 /* ']' */);
  }
  /**
   * Prints out a list, starting at the specified indentation, to the
   * specified print stream.
   * @param     out      a print stream
   * @param     indent   number of spaces to indent
   * @see       java.io.PrintStream#println(java.lang.Object)
   * @throws    NullPointerException if {@code out} is {@code null}
   * @since     1.0
   */
  list$PrintStream$int(out: PrintStream, indent: number): void {
    for (let i = 0; i < indent; i++) {
      out.print(' ');
    }
    out.println($J.str(this));
  }
  getNativeContainer(): Container {
    let p = this.getContainer();
    while (p != null && $J.isa(p.peer, LightweightPeer)) {
      p = p.getContainer();
    }
    return p;
  }
  /**
   * Adds a PropertyChangeListener to the listener list. The listener is
   * registered for all bound properties of this class, including the
   * following:
   * <ul>
   *    <li>this Component's font ("font")</li>
   *    <li>this Component's background color ("background")</li>
   *    <li>this Component's foreground color ("foreground")</li>
   *    <li>this Component's focusability ("focusable")</li>
   *    <li>this Component's focus traversal keys enabled state
   *        ("focusTraversalKeysEnabled")</li>
   *    <li>this Component's Set of FORWARD_TRAVERSAL_KEYS
   *        ("forwardFocusTraversalKeys")</li>
   *    <li>this Component's Set of BACKWARD_TRAVERSAL_KEYS
   *        ("backwardFocusTraversalKeys")</li>
   *    <li>this Component's Set of UP_CYCLE_TRAVERSAL_KEYS
   *        ("upCycleFocusTraversalKeys")</li>
   *    <li>this Component's preferred size ("preferredSize")</li>
   *    <li>this Component's minimum size ("minimumSize")</li>
   *    <li>this Component's maximum size ("maximumSize")</li>
   *    <li>this Component's name ("name")</li>
   * </ul>
   * Note that if this {@code Component} is inheriting a bound property, then no
   * event will be fired in response to a change in the inherited property.
   * <p>
   * If {@code listener} is {@code null},
   * no exception is thrown and no action is performed.
   *
   * @param    listener  the property change listener to be added
   *
   * @see #removePropertyChangeListener
   * @see #getPropertyChangeListeners
   * @see #addPropertyChangeListener(java.lang.String, java.beans.PropertyChangeListener)
   */
  addPropertyChangeListener$PropertyChangeListener(listener: PropertyChangeListener): void {
    {
      if (listener == null) {
        return;
      }
      if (this.changeSupport == null) {
        this.changeSupport = new PropertyChangeSupport()._PropertyChangeSupport(this);
      }
      this.changeSupport.addPropertyChangeListener$PropertyChangeListener(listener);
    }
  }
  /**
   * Removes a PropertyChangeListener from the listener list. This method
   * should be used to remove PropertyChangeListeners that were registered
   * for all bound properties of this class.
   * <p>
   * If listener is null, no exception is thrown and no action is performed.
   *
   * @param listener the PropertyChangeListener to be removed
   *
   * @see #addPropertyChangeListener
   * @see #getPropertyChangeListeners
   * @see #removePropertyChangeListener(java.lang.String, java.beans.PropertyChangeListener)
   */
  removePropertyChangeListener$PropertyChangeListener(listener: PropertyChangeListener): void {
    {
      if (listener == null || this.changeSupport == null) {
        return;
      }
      this.changeSupport.removePropertyChangeListener$PropertyChangeListener(listener);
    }
  }
  /**
   * Returns an array of all the property change listeners
   * registered on this component.
   *
   * @return all of this component's {@code PropertyChangeListener}s
   *         or an empty array if no property change
   *         listeners are currently registered
   *
   * @see      #addPropertyChangeListener
   * @see      #removePropertyChangeListener
   * @see      #getPropertyChangeListeners(java.lang.String)
   * @see      java.beans.PropertyChangeSupport#getPropertyChangeListeners
   * @since    1.4
   */
  getPropertyChangeListeners$(): PropertyChangeListener[] {
    {
      if (this.changeSupport == null) {
        return $J.newArray(0, null);
      }
      return this.changeSupport.getPropertyChangeListeners$();
    }
  }
  /**
   * Adds a PropertyChangeListener to the listener list for a specific
   * property. The specified property may be user-defined, or one of the
   * following:
   * <ul>
   *    <li>this Component's font ("font")</li>
   *    <li>this Component's background color ("background")</li>
   *    <li>this Component's foreground color ("foreground")</li>
   *    <li>this Component's focusability ("focusable")</li>
   *    <li>this Component's focus traversal keys enabled state
   *        ("focusTraversalKeysEnabled")</li>
   *    <li>this Component's Set of FORWARD_TRAVERSAL_KEYS
   *        ("forwardFocusTraversalKeys")</li>
   *    <li>this Component's Set of BACKWARD_TRAVERSAL_KEYS
   *        ("backwardFocusTraversalKeys")</li>
   *    <li>this Component's Set of UP_CYCLE_TRAVERSAL_KEYS
   *        ("upCycleFocusTraversalKeys")</li>
   * </ul>
   * Note that if this {@code Component} is inheriting a bound property, then no
   * event will be fired in response to a change in the inherited property.
   * <p>
   * If {@code propertyName} or {@code listener} is {@code null},
   * no exception is thrown and no action is taken.
   *
   * @param propertyName one of the property names listed above
   * @param listener the property change listener to be added
   *
   * @see #removePropertyChangeListener(java.lang.String, java.beans.PropertyChangeListener)
   * @see #getPropertyChangeListeners(java.lang.String)
   * @see #addPropertyChangeListener(java.beans.PropertyChangeListener)
   */
  addPropertyChangeListener$String$PropertyChangeListener(propertyName: string, listener: PropertyChangeListener): void {
    {
      if (listener == null) {
        return;
      }
      if (this.changeSupport == null) {
        this.changeSupport = new PropertyChangeSupport()._PropertyChangeSupport(this);
      }
      this.changeSupport.addPropertyChangeListener$String$PropertyChangeListener(propertyName, listener);
    }
  }
  /**
   * Removes a {@code PropertyChangeListener} from the listener
   * list for a specific property. This method should be used to remove
   * {@code PropertyChangeListener}s
   * that were registered for a specific bound property.
   * <p>
   * If {@code propertyName} or {@code listener} is {@code null},
   * no exception is thrown and no action is taken.
   *
   * @param propertyName a valid property name
   * @param listener the PropertyChangeListener to be removed
   *
   * @see #addPropertyChangeListener(java.lang.String, java.beans.PropertyChangeListener)
   * @see #getPropertyChangeListeners(java.lang.String)
   * @see #removePropertyChangeListener(java.beans.PropertyChangeListener)
   */
  removePropertyChangeListener$String$PropertyChangeListener(propertyName: string, listener: PropertyChangeListener): void {
    {
      if (listener == null || this.changeSupport == null) {
        return;
      }
      this.changeSupport.removePropertyChangeListener$String$PropertyChangeListener(propertyName, listener);
    }
  }
  /**
   * Support for reporting bound property changes for Object properties.
   * This method can be called when a bound property has changed and it will
   * send the appropriate PropertyChangeEvent to any registered
   * PropertyChangeListeners.
   *
   * @param propertyName the property whose value has changed
   * @param oldValue the property's previous value
   * @param newValue the property's new value
   */
  firePropertyChange$String$Object$Object(propertyName: string, oldValue: any, newValue: any): void {
    let changeSupport: PropertyChangeSupport;
    {
      changeSupport = this.changeSupport;
    }
    if (changeSupport == null || (oldValue != null && newValue != null && $J.equals(oldValue, newValue))) {
      return;
    }
    changeSupport.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
  }
  /**
   * Support for reporting bound property changes for boolean properties.
   * This method can be called when a bound property has changed and it will
   * send the appropriate PropertyChangeEvent to any registered
   * PropertyChangeListeners.
   *
   * @param propertyName the property whose value has changed
   * @param oldValue the property's previous value
   * @param newValue the property's new value
   * @since 1.4
   */
  firePropertyChange$String$boolean$boolean(propertyName: string, oldValue: boolean, newValue: boolean): void {
    let changeSupport = this.changeSupport;
    if (changeSupport == null || oldValue === newValue) {
      return;
    }
    changeSupport.firePropertyChange$String$boolean$boolean(propertyName, oldValue, newValue);
  }
  /**
   * Support for reporting bound property changes for integer properties.
   * This method can be called when a bound property has changed and it will
   * send the appropriate PropertyChangeEvent to any registered
   * PropertyChangeListeners.
   *
   * @param propertyName the property whose value has changed
   * @param oldValue the property's previous value
   * @param newValue the property's new value
   * @since 1.4
   */
  firePropertyChange$String$int$int(propertyName: string, oldValue: number, newValue: number): void {
    let changeSupport = this.changeSupport;
    if (changeSupport == null || oldValue === newValue) {
      return;
    }
    changeSupport.firePropertyChange$String$int$int(propertyName, oldValue, newValue);
  }
  /**
   * Sets the language-sensitive orientation that is to be used to order
   * the elements or text within this component.  Language-sensitive
   * {@code LayoutManager} and {@code Component}
   * subclasses will use this property to
   * determine how to lay out and draw components.
   * <p>
   * At construction time, a component's orientation is set to
   * {@code ComponentOrientation.UNKNOWN},
   * indicating that it has not been specified
   * explicitly.  The UNKNOWN orientation behaves the same as
   * {@code ComponentOrientation.LEFT_TO_RIGHT}.
   * <p>
   * To set the orientation of a single component, use this method.
   * To set the orientation of an entire component
   * hierarchy, use
   * {@link #applyComponentOrientation applyComponentOrientation}.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   * @param  o the orientation to be set
   *
   * @see ComponentOrientation
   * @see #invalidate
   *
   * @author Laura Werner, IBM
   */
  setComponentOrientation(o: ComponentOrientation): void {
    let oldValue = this.componentOrientation;
    this.componentOrientation = o;
    this.firePropertyChange$String$Object$Object('componentOrientation', oldValue, o);
    this.invalidateIfValid();
  }
  /**
   * Retrieves the language-sensitive orientation that is to be used to order
   * the elements or text within this component.  {@code LayoutManager}
   * and {@code Component}
   * subclasses that wish to respect orientation should call this method to
   * get the component's orientation before performing layout or drawing.
   *
   * @return the orientation to order the elements or text
   * @see ComponentOrientation
   *
   * @author Laura Werner, IBM
   */
  getComponentOrientation(): ComponentOrientation {
    return this.componentOrientation;
  }
  /**
   * Sets the {@code ComponentOrientation} property of this component
   * and all components contained within it.
   * <p>
   * This method changes layout-related information, and therefore,
   * invalidates the component hierarchy.
   *
   *
   * @param orientation the new component orientation of this component and
   *        the components contained within it.
   * @throws NullPointerException if {@code orientation} is null.
   * @see #setComponentOrientation
   * @see #getComponentOrientation
   * @see #invalidate
   * @since 1.4
   */
  applyComponentOrientation(orientation: ComponentOrientation): void {
    if (orientation == null) {
      throw new NullPointerException();
    }
    this.setComponentOrientation(orientation);
  }
  canBeFocusOwner(): boolean {
    if (this.isEnabled() && this.isDisplayable() && this.isVisible$() && this.isFocusable()) {
      return true;
    }
    return false;
  }
  /**
   * Checks that this component meets the prerequisites to be focus owner:
   * - it is enabled, visible, focusable
   * - it's parents are all enabled and showing
   * - top-level window is focusable
   * - if focus cycle root has DefaultFocusTraversalPolicy then it also checks that this policy accepts
   * this component as focus owner
   * @since 1.5
   */
  canBeFocusOwnerRecursively(): boolean {
    if (!this.canBeFocusOwner()) {
      return false;
    }
    {
      if (this.parent != null) {
        return this.parent.canContainFocusOwner(this);
      }
    }
    return true;
  }
  /**
   * Fix the location of the HW component in a LW container hierarchy.
   */
  relocateComponent(): void {
    {
      if (this.peer == null) {
        return;
      }
      let nativeX = this.x_;
      let nativeY = this.y_;
      for (let cont = this.getContainer(); cont != null && cont.isLightweight(); cont = cont.getContainer()) {
        nativeX = (nativeX + cont.x_) | 0;
        nativeY = (nativeY + cont.y_) | 0;
      }
      this.peer.setBounds(nativeX, nativeY, this.width_, this.height_, 1);
    }
  }
  /**
   * Returns the {@code Window} ancestor of the component.
   * @return Window ancestor of the component or component by itself if it is Window;
   *         null, if component is not a part of window hierarchy
   */
  getContainingWindow(): Window {
    return SunToolkit.getContainingWindow(this);
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Component', 'initIDs', this, $a);
  }
  /**
   * Gets the {@code AccessibleContext} associated
   * with this {@code Component}.
   * The method implemented by this base
   * class returns null.  Classes that extend {@code Component}
   * should implement this method to return the
   * {@code AccessibleContext} associated with the subclass.
   *
   *
   * @return the {@code AccessibleContext} of this
   *    {@code Component}
   * @since 1.3
   */
  getAccessibleContext(): AccessibleContext {
    return this.accessibleContext;
  }
  /**
   * Gets the index of this object in its accessible parent.
   * If this object does not have an accessible parent, returns
   * -1.
   *
   * @return the index of this object in its accessible parent
   */
  getAccessibleIndexInParent(): number {
    {
      let accContext = this.getAccessibleContext();
      if (accContext == null) {
        return -1;
      }
      let parent = accContext.getAccessibleParent();
      if (parent == null) {
        return -1;
      }
      accContext = parent.getAccessibleContext();
      for (let i = 0; i < accContext.getAccessibleChildrenCount(); i++) {
        if (this.equals(accContext.getAccessibleChild(i))) {
          return i;
        }
      }
      return -1;
    }
  }
  /**
   * Gets the current state set of this object.
   *
   * @return an instance of {@code AccessibleStateSet}
   *    containing the current state set of the object
   * @see AccessibleState
   */
  getAccessibleStateSet(): AccessibleStateSet {
    {
      let states = new AccessibleStateSet()._AccessibleStateSet$();
      if (this.isEnabled()) {
        states.add(AccessibleState.ENABLED);
      }
      if (this.isFocusTraversable()) {
        states.add(AccessibleState.FOCUSABLE);
      }
      if (this.isVisible$()) {
        states.add(AccessibleState.VISIBLE);
      }
      if (this.isShowing()) {
        states.add(AccessibleState.SHOWING);
      }
      if (this.isFocusOwner()) {
        states.add(AccessibleState.FOCUSED);
      }
      if ($J.isa(this, Accessible)) {
        let ac = (this).getAccessibleContext();
        if (ac != null) {
          let ap = ac.getAccessibleParent();
          if (ap != null) {
            let pac = ap.getAccessibleContext();
            if (pac != null) {
              let as$ = pac.getAccessibleSelection$();
              if (as$ != null) {
                states.add(AccessibleState.SELECTABLE);
                let i = ac.getAccessibleIndexInParent();
                if (i >= 0) {
                  if (as$.isAccessibleChildSelected(i)) {
                    states.add(AccessibleState.SELECTED);
                  }
                }
              }
            }
          }
        }
      }
      if (Component.isInstanceOf(this, 'javax.swing.JComponent')) {
        if ((this).isOpaque()) {
          states.add(AccessibleState.OPAQUE);
        }
      }
      return states;
    }
  }
  /**
   * Checks that the given object is instance of the given class.
   * @param obj Object to be checked
   * @param className The name of the class. Must be fully-qualified class name.
   * @return true, if this object is instanceof given class,
   *         false, otherwise, or if obj or className is null
   */
  static isInstanceOf(obj: any, className: string): boolean {
    if (obj == null) {
      return false;
    }
    if (className == null) {
      return false;
    }
    let cls = $J.getClass(obj);
    while (cls != null) {
      if ($J.equals(cls.getName(), className)) {
        return true;
      }
      cls = cls.getSuperclass();
    }
    return false;
  }
  /**
   * Check whether we can trust the current bounds of the component.
   * The return value of false indicates that the container of the
   * component is invalid, and therefore needs to be laid out, which would
   * probably mean changing the bounds of its children.
   * Null-layout of the container or absence of the container mean
   * the bounds of the component are final and can be trusted.
   */
  areBoundsValid(): boolean {
    let cont = this.getContainer();
    return cont == null || cont.isValid() || cont.getLayout() == null;
  }
  /**
   * Applies the shape to the component
   * @param shape Shape to be applied to the component
   */
  applyCompoundShape(shape: Region): void {
    this.checkTreeLock();
    if (!this.areBoundsValid()) {
      if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Component.mixingLog.fine('this = ' + $J.str(this) + '; areBoundsValid = ' + this.areBoundsValid());
      }
      return;
    }
    if (!this.isLightweight()) {
      let peer = this.peer;
      if (peer != null) {
        if (shape.isEmpty()) {
          shape = Region.EMPTY_REGION;
        }
        if (shape.equals(this.getNormalShape())) {
          if (this.compoundShape == null) {
            return;
          }
          this.compoundShape = null;
          peer.applyShape(null);
        } else {
          if (shape.equals(this.getAppliedShape())) {
            return;
          }
          this.compoundShape = shape;
          let compAbsolute = this.getLocationOnWindow();
          if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINER)) {
            Component.mixingLog.fine('this = ' + $J.str(this) + '; compAbsolute=' + $J.str(compAbsolute) + '; shape=' + $J.str(shape));
          }
          peer.applyShape(shape.getTranslatedRegion(-compAbsolute.x_, -compAbsolute.y_));
        }
      }
    }
  }
  /**
   * Returns the shape previously set with applyCompoundShape().
   * If the component is LW or no shape was applied yet,
   * the method returns the normal shape.
   */
  getAppliedShape(): Region {
    this.checkTreeLock();
    return (this.compoundShape == null || this.isLightweight()) ? this.getNormalShape() : this.compoundShape;
  }
  getLocationOnWindow(): Point {
    this.checkTreeLock();
    let curLocation = this.getLocation$();
    for (let parent = this.getContainer(); parent != null && !(parent instanceof Window); parent = parent.getContainer()) {
      curLocation.x_ = (curLocation.x_ + parent.getX()) | 0;
      curLocation.y_ = (curLocation.y_ + parent.getY()) | 0;
    }
    return curLocation;
  }
  /**
   * Returns the full shape of the component located in window coordinates
   */
  getNormalShape(): Region {
    this.checkTreeLock();
    let compAbsolute = this.getLocationOnWindow();
    return Region.getInstanceXYWH(compAbsolute.x_, compAbsolute.y_, this.getWidth(), this.getHeight());
  }
  /**
   * Returns the "opaque shape" of the component.
   *
   * The opaque shape of a lightweight components is the actual shape that
   * needs to be cut off of the heavyweight components in order to mix this
   * lightweight component correctly with them.
   *
   * The method is overridden in the java.awt.Container to handle non-opaque
   * containers containing opaque children.
   *
   * See 6637655 for details.
   */
  getOpaqueShape(): Region {
    this.checkTreeLock();
    if (this.mixingCutoutRegion != null) {
      return this.mixingCutoutRegion;
    } else {
      return this.getNormalShape();
    }
  }
  getSiblingIndexAbove(): number {
    this.checkTreeLock();
    let parent = this.getContainer();
    if (parent == null) {
      return -1;
    }
    let nextAbove = (parent.getComponentZOrder(this) - 1) | 0;
    return nextAbove < 0 ? -1 : nextAbove;
  }
  getHWPeerAboveMe(): ComponentPeer {
    this.checkTreeLock();
    let cont = this.getContainer();
    let indexAbove = this.getSiblingIndexAbove();
    while (cont != null) {
      for (let i = indexAbove; i > -1; i--) {
        let comp = cont.getComponent$int(i);
        if (comp != null && comp.isDisplayable() && !comp.isLightweight()) {
          return comp.peer;
        }
      }
      if (!cont.isLightweight()) {
        break;
      }
      indexAbove = cont.getSiblingIndexAbove();
      cont = cont.getContainer();
    }
    return null;
  }
  getSiblingIndexBelow(): number {
    this.checkTreeLock();
    let parent = this.getContainer();
    if (parent == null) {
      return -1;
    }
    let nextBelow = (parent.getComponentZOrder(this) + 1) | 0;
    return nextBelow >= parent.getComponentCount() ? -1 : nextBelow;
  }
  isNonOpaqueForMixing(): boolean {
    return this.mixingCutoutRegion != null && this.mixingCutoutRegion.isEmpty();
  }
  calculateCurrentShape(): Region {
    this.checkTreeLock();
    let s = this.getNormalShape();
    if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
      Component.mixingLog.fine('this = ' + $J.str(this) + '; normalShape=' + $J.str(s));
    }
    if (this.getContainer() != null) {
      let comp = this;
      let cont = comp.getContainer();
      while (cont != null) {
        for (let index = comp.getSiblingIndexAbove(); index !== -1; --index) {
          let c = cont.getComponent$int(index);
          if (c.isLightweight() && c.isShowing()) {
            s = s.getDifference(c.getOpaqueShape());
          }
        }
        if (cont.isLightweight()) {
          s = s.getIntersection(cont.getNormalShape());
        } else {
          break;
        }
        comp = cont;
        cont = cont.getContainer();
      }
    }
    if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
      Component.mixingLog.fine('currentShape=' + $J.str(s));
    }
    return s;
  }
  applyCurrentShape(): void {
    this.checkTreeLock();
    if (!this.areBoundsValid()) {
      if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Component.mixingLog.fine('this = ' + $J.str(this) + '; areBoundsValid = ' + this.areBoundsValid());
      }
      return;
    }
    if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
      Component.mixingLog.fine('this = ' + $J.str(this));
    }
    this.applyCompoundShape(this.calculateCurrentShape());
  }
  subtractAndApplyShape(s: Region): void {
    this.checkTreeLock();
    if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
      Component.mixingLog.fine('this = ' + $J.str(this) + '; s=' + $J.str(s));
    }
    this.applyCompoundShape(this.getAppliedShape().getDifference(s));
  }
  applyCurrentShapeBelowMe(): void {
    this.checkTreeLock();
    let parent = this.getContainer();
    if (parent != null && parent.isShowing()) {
      parent.recursiveApplyCurrentShape$int(this.getSiblingIndexBelow());
      let parent2 = parent.getContainer();
      while (!parent.isOpaque() && parent2 != null) {
        parent2.recursiveApplyCurrentShape$int(parent.getSiblingIndexBelow());
        parent = parent2;
        parent2 = parent.getContainer();
      }
    }
  }
  subtractAndApplyShapeBelowMe(): void {
    this.checkTreeLock();
    let parent = this.getContainer();
    if (parent != null && this.isShowing()) {
      let opaqueShape = this.getOpaqueShape();
      parent.recursiveSubtractAndApplyShape$Region$int(opaqueShape, this.getSiblingIndexBelow());
      let parent2 = parent.getContainer();
      while (!parent.isOpaque() && parent2 != null) {
        parent2.recursiveSubtractAndApplyShape$Region$int(opaqueShape, parent.getSiblingIndexBelow());
        parent = parent2;
        parent2 = parent.getContainer();
      }
    }
  }
  mixOnShowing(): void {
    {
      if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Component.mixingLog.fine('this = ' + $J.str(this));
      }
      if (!this.isMixingNeeded()) {
        return;
      }
      if (this.isLightweight()) {
        this.subtractAndApplyShapeBelowMe();
      } else {
        this.applyCurrentShape();
      }
    }
  }
  mixOnHiding(isLightweight: boolean): void {
    {
      if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Component.mixingLog.fine('this = ' + $J.str(this) + '; isLightweight = ' + isLightweight);
      }
      if (!this.isMixingNeeded()) {
        return;
      }
      if (isLightweight) {
        this.applyCurrentShapeBelowMe();
      }
    }
  }
  mixOnReshaping(): void {
    {
      if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Component.mixingLog.fine('this = ' + $J.str(this));
      }
      if (!this.isMixingNeeded()) {
        return;
      }
      if (this.isLightweight()) {
        this.applyCurrentShapeBelowMe();
      } else {
        this.applyCurrentShape();
      }
    }
  }
  mixOnZOrderChanging(oldZorder: number, newZorder: number): void {
    {
      let becameHigher = newZorder < oldZorder;
      let parent = this.getContainer();
      if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Component.mixingLog.fine('this = ' + $J.str(this) + '; oldZorder=' + oldZorder + '; newZorder=' + newZorder + '; parent=' + $J.str(parent));
      }
      if (!this.isMixingNeeded()) {
        return;
      }
      if (this.isLightweight()) {
        if (becameHigher) {
          if (parent != null && this.isShowing()) {
            parent.recursiveSubtractAndApplyShape$Region$int$int(this.getOpaqueShape(), this.getSiblingIndexBelow(), oldZorder);
          }
        } else {
          if (parent != null) {
            parent.recursiveApplyCurrentShape$int$int(oldZorder, newZorder);
          }
        }
      } else {
        if (becameHigher) {
          this.applyCurrentShape();
        } else {
          if (parent != null) {
            let shape = this.getAppliedShape();
            for (let index = oldZorder; index < newZorder; index++) {
              let c = parent.getComponent$int(index);
              if (c.isLightweight() && c.isShowing()) {
                shape = shape.getDifference(c.getOpaqueShape());
              }
            }
            this.applyCompoundShape(shape);
          }
        }
      }
    }
  }
  mixOnValidating(): void {
  }
  isMixingNeeded(): boolean {
    if (SunToolkit.getSunAwtDisableMixing()) {
      if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINEST)) {
        Component.mixingLog.finest('this = ' + $J.str(this) + '; Mixing disabled via sun.awt.disableMixing');
      }
      return false;
    }
    if (!this.areBoundsValid()) {
      if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Component.mixingLog.fine('this = ' + $J.str(this) + '; areBoundsValid = ' + this.areBoundsValid());
      }
      return false;
    }
    let window = this.getContainingWindow();
    if (window != null) {
      if (!window.hasHeavyweightDescendants() || !window.hasLightweightDescendants() || window.isDisposing()) {
        if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
          Component.mixingLog.fine('containing window = ' + $J.str(window) + '; has h/w descendants = ' + window.hasHeavyweightDescendants() + '; has l/w descendants = ' + window.hasLightweightDescendants() + '; disposing = ' + window.isDisposing());
        }
        return false;
      }
    } else {
      if (Component.mixingLog.isLoggable(PlatformLogger_Level.FINE)) {
        Component.mixingLog.fine('this = ' + $J.str(this) + '; containing window is null');
      }
      return false;
    }
    return true;
  }
  /**
   * Sets a 'mixing-cutout' shape for this lightweight component.
   *
   * This method is used exclusively for the purposes of the
   * Heavyweight/Lightweight Components Mixing feature and will
   * have no effect if applied to a heavyweight component.
   *
   * By default a lightweight component is treated as an opaque rectangle for
   * the purposes of the Heavyweight/Lightweight Components Mixing feature.
   * This method enables developers to set an arbitrary shape to be cut out
   * from heavyweight components positioned underneath the lightweight
   * component in the z-order.
   * <p>
   * The {@code shape} argument may have the following values:
   * <ul>
   * <li>{@code null} - reverts the default cutout shape (the rectangle equal
   * to the component's {@code getBounds()})
   * <li><i>empty-shape</i> - does not cut out anything from heavyweight
   * components. This makes this lightweight component effectively
   * transparent. Note that descendants of the lightweight component still
   * affect the shapes of heavyweight components.  An example of an
   * <i>empty-shape</i> is {@code new Rectangle()}.
   * <li><i>non-empty-shape</i> - the given shape will be cut out from
   * heavyweight components.
   * </ul>
   * <p>
   * The most common example when the 'mixing-cutout' shape is needed is a
   * glass pane component. The {@link JRootPane#setGlassPane} method
   * automatically sets the <i>empty-shape</i> as the 'mixing-cutout' shape
   * for the given glass pane component.  If a developer needs some other
   * 'mixing-cutout' shape for the glass pane (which is rare), this must be
   * changed manually after installing the glass pane to the root pane.
   *
   * @param shape the new 'mixing-cutout' shape
   * @since 9
   */
  setMixingCutoutShape(shape: Shape): void {
    let region = shape == null ? null : Region.getInstance(shape, null);
    {
      let needShowing = false;
      let needHiding = false;
      if (!this.isNonOpaqueForMixing()) {
        needHiding = true;
      }
      this.mixingCutoutRegion = region;
      if (!this.isNonOpaqueForMixing()) {
        needShowing = true;
      }
      if (this.isMixingNeeded()) {
        if (needHiding) {
          this.mixOnHiding(this.isLightweight());
        }
        if (needShowing) {
          this.mixOnShowing();
        }
      }
    }
  }
  updateZOrder(): void {
    this.peer.setZOrder(this.getHWPeerAboveMe());
  }
  static $clinit() {
    Component.log = PlatformLogger.getLogger('java.awt.Component');
    Component.eventLog = PlatformLogger.getLogger('java.awt.event.Component');
    Component.focusLog = PlatformLogger.getLogger('java.awt.focus.Component');
    Component.mixingLog = PlatformLogger.getLogger('java.awt.mixing.Component');
    Component.focusTraversalKeyPropertyNames = ['forwardFocusTraversalKeys', 'backwardFocusTraversalKeys', 'upCycleFocusTraversalKeys', 'downCycleFocusTraversalKeys'];
    Component.LOCK = new Component$AWTTreeLock()._Component$AWTTreeLock();
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      Component.initIDs();
    }
    let s = AccessController.doPrivileged(new GetPropertyAction('awt.image.incrementaldraw'));
    Component.isInc = (s == null || $J.equals(s, 'true'));
    let s2 = AccessController.doPrivileged(new GetPropertyAction('awt.image.redrawrate'));
    Component.incRate = (s2 != null) ? $J.parseInt(s2) : 100;
    AWTAccessor.setComponentAccessor(new (Component$1())());
    Component.coalesceMap = new WeakHashMap();
    Component.coalesceEventsParams = [$J.cls(AWTEvent), $J.cls(AWTEvent)];
    Component.requestFocusController = new Component$DummyRequestFocusController()._Component$DummyRequestFocusController();
  }
}

export class Component$AWTTreeLock extends JObject {
  _Component$AWTTreeLock(): this {
    return this;
  }
}

/**
 * Enumeration of the common ways the baseline of a component can
 * change as the size changes.  The baseline resize behavior is
 * primarily for layout managers that need to know how the
 * position of the baseline changes as the component size changes.
 * In general the baseline resize behavior will be valid for sizes
 * greater than or equal to the minimum size (the actual minimum
 * size; not a developer specified minimum size).  For sizes
 * smaller than the minimum size the baseline may change in a way
 * other than the baseline resize behavior indicates.  Similarly,
 * as the size approaches {@code Integer.MAX_VALUE} and/or
 * {@code Short.MAX_VALUE} the baseline may change in a way
 * other than the baseline resize behavior indicates.
 *
 * @see #getBaselineResizeBehavior
 * @see #getBaseline(int,int)
 * @since 1.6
 */
export class Component$BaselineResizeBehavior extends JEnum {
  static CONSTANT_ASCENT: Component$BaselineResizeBehavior = null;
  static CONSTANT_DESCENT: Component$BaselineResizeBehavior = null;
  static CENTER_OFFSET: Component$BaselineResizeBehavior = null;
  static OTHER: Component$BaselineResizeBehavior = null;
  static $VALUES: Component$BaselineResizeBehavior[] = null;
  _Component$BaselineResizeBehavior($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Component$BaselineResizeBehavior[] { return Component$BaselineResizeBehavior.$VALUES.slice(); }
  static valueOf(name: string): Component$BaselineResizeBehavior { return $J.enumValueOf(Component$BaselineResizeBehavior, name); }
  static $clinit() {
    Component$BaselineResizeBehavior.CONSTANT_ASCENT = new Component$BaselineResizeBehavior()._Component$BaselineResizeBehavior('CONSTANT_ASCENT', 0);
    Component$BaselineResizeBehavior.CONSTANT_DESCENT = new Component$BaselineResizeBehavior()._Component$BaselineResizeBehavior('CONSTANT_DESCENT', 1);
    Component$BaselineResizeBehavior.CENTER_OFFSET = new Component$BaselineResizeBehavior()._Component$BaselineResizeBehavior('CENTER_OFFSET', 2);
    Component$BaselineResizeBehavior.OTHER = new Component$BaselineResizeBehavior()._Component$BaselineResizeBehavior('OTHER', 3);
    Component$BaselineResizeBehavior.$VALUES = [Component$BaselineResizeBehavior.CONSTANT_ASCENT, Component$BaselineResizeBehavior.CONSTANT_DESCENT, Component$BaselineResizeBehavior.CENTER_OFFSET, Component$BaselineResizeBehavior.OTHER];
  }
}

/**
 * This is a proxy capabilities class used when a FlipBufferStrategy
 * is created instead of the requested Blit strategy.
 *
 * @see sun.java2d.SunGraphicsEnvironment#isFlipStrategyPreferred(ComponentPeer)
 */
export class Component$ProxyCapabilities extends ExtendedBufferCapabilities {
  orig: BufferCapabilities = null;
  _Component$ProxyCapabilities(orig: BufferCapabilities): this {
    this._ExtendedBufferCapabilities(orig.getFrontBufferCapabilities(), orig.getBackBufferCapabilities(), orig.getFlipContents() === BufferCapabilities$FlipContents.BACKGROUND ? BufferCapabilities$FlipContents.BACKGROUND : BufferCapabilities$FlipContents.COPIED);
    this.orig = orig;
    return this;
  }
}

/**
 * Inner class for flipping buffers on a component.  That component must
 * be a {@code Canvas} or {@code Window} or {@code Applet}.
 * @see Canvas
 * @see Window
 * @see Applet
 * @see java.awt.image.BufferStrategy
 * @author Michael Martak
 * @since 1.4
 */
export class Component$FlipBufferStrategy extends BufferStrategy {
  /**
   * The number of buffers
   */
  numBuffers: number = 0;
  /**
   * The buffering capabilities
   */
  caps: BufferCapabilities = null;
  /**
   * The drawing buffer
   */
  drawBuffer: Image = null;
  /**
   * The drawing buffer as a volatile image
   */
  drawVBuffer: VolatileImage = null;
  /**
   * Whether or not the drawing buffer has been recently restored from
   * a lost state.
   */
  validatedContents: boolean = false;
  /**
   * The width of the back buffers
   */
  width_: number = 0;
  /**
   * The height of the back buffers
   */
  height_: number = 0;
  /**
   * Creates a new flipping buffer strategy for this component.
   * The component must be a {@code Canvas} or {@code Window} or
   * {@code Applet}.
   * @see Canvas
   * @see Window
   * @see Applet
   * @param numBuffers the number of buffers
   * @param caps the capabilities of the buffers
   * @throws AWTException if the capabilities supplied could not be
   * supported or met
   * @throws ClassCastException if the component is not a canvas or
   * window.
   * @throws IllegalStateException if the component has no peer
   * @throws IllegalArgumentException if {@code numBuffers} is less than two,
   * or if {@code BufferCapabilities.isPageFlipping} is not
   * {@code true}.
   * @see #createBuffers(int, BufferCapabilities)
   */
  _Component$FlipBufferStrategy(numBuffers: number, caps: BufferCapabilities): this {
    this._BufferStrategy();
    if (!(this.$outer instanceof Window) && !(this.$outer instanceof Canvas) && !($J.isa(this.$outer, Applet))) {
      throw new ClassCastException('Component must be a Canvas or Window or Applet');
    }
    this.numBuffers = numBuffers;
    this.caps = caps;
    this.createBuffers(numBuffers, caps);
    return this;
  }
  /**
   * Creates one or more complex, flipping buffers with the given
   * capabilities.
   * @param numBuffers number of buffers to create; must be greater than
   * one
   * @param caps the capabilities of the buffers.
   * {@code BufferCapabilities.isPageFlipping} must be
   * {@code true}.
   * @throws AWTException if the capabilities supplied could not be
   * supported or met
   * @throws IllegalStateException if the component has no peer
   * @throws IllegalArgumentException if numBuffers is less than two,
   * or if {@code BufferCapabilities.isPageFlipping} is not
   * {@code true}.
   * @see java.awt.BufferCapabilities#isPageFlipping()
   */
  createBuffers(numBuffers: number, caps: BufferCapabilities): void {
    if (numBuffers < 2) {
      throw new IllegalArgumentException('Number of buffers cannot be less than two');
    } else if (this.$outer.peer == null) {
      throw new IllegalStateException('Component must have a valid peer');
    } else if (caps == null || !caps.isPageFlipping$()) {
      throw new IllegalArgumentException('Page flipping capabilities must be specified');
    }
    this.width_ = this.$outer.getWidth();
    this.height_ = this.$outer.getHeight();
    if (this.drawBuffer != null) {
      this.invalidate();
    }
    if ($J.isa(caps, ExtendedBufferCapabilities)) {
      let ebc = caps;
      if (ebc.getVSync() === ExtendedBufferCapabilities_VSyncType.VSYNC_ON) {
        if (!VSyncedBSManager.vsyncAllowed(this)) {
          caps = ebc.derive(ExtendedBufferCapabilities_VSyncType.VSYNC_DEFAULT);
        }
      }
    }
    this.$outer.peer.createBuffers(numBuffers, caps);
    this.updateInternalBuffers();
  }
  /**
   * Updates internal buffers (both volatile and non-volatile)
   * by requesting the back-buffer from the peer.
   */
  updateInternalBuffers(): void {
    this.drawBuffer = this.getBackBuffer();
    if (this.drawBuffer instanceof VolatileImage) {
      this.drawVBuffer = this.drawBuffer;
    } else {
      this.drawVBuffer = null;
    }
  }
  /**
   * Provides direct access to the back buffer as an image.
   *
   * @return the back buffer as an image
   * @throws IllegalStateException if the buffers have not yet
   * been created
   */
  getBackBuffer(): Image {
    if (this.$outer.peer != null) {
      return this.$outer.peer.getBackBuffer();
    } else {
      throw new IllegalStateException('Component must have a valid peer');
    }
  }
  flipSubRegion(x1: number, y1: number, x2: number, y2: number, flipAction: BufferCapabilities$FlipContents): void {
    if (this.$outer.peer != null) {
      this.$outer.peer.flip(x1, y1, x2, y2, flipAction);
    } else {
      throw new IllegalStateException('Component must have a valid peer');
    }
  }
  /**
   * Destroys the buffers and invalidates the state of FlipBufferStrategy.
   */
  invalidate(): void {
    this.drawBuffer = null;
    this.drawVBuffer = null;
    this.destroyBuffers();
  }
  /**
   * Destroys the buffers created through this object
   */
  destroyBuffers(): void {
    VSyncedBSManager.releaseVsync(this);
    if (this.$outer.peer != null) {
      this.$outer.peer.destroyBuffers();
    } else {
      throw new IllegalStateException('Component must have a valid peer');
    }
  }
  /**
   * @return the graphics on the drawing buffer.  This method may not
   * be synchronized for performance reasons; use of this method by multiple
   * threads should be handled at the application level.  Disposal of the
   * graphics object must be handled by the application.
   */
  getDrawGraphics(): Graphics {
    this.revalidate();
    return this.drawBuffer.getGraphics();
  }
  /**
   * Restore the drawing buffer if it has been lost
   */
  revalidate(): void {
    this.validatedContents = false;
    if (this.$outer.getWidth() !== this.width_ || this.$outer.getHeight() !== this.height_ || this.drawBuffer == null) {
      try {
        this.createBuffers(this.numBuffers, this.caps);
      } catch ($e5) {
        if ($J.isa($e5, AWTException)) {
          let e = $J.exc($e5);
        } else {
          throw $e5;
        }
      }
      this.validatedContents = true;
    }
    this.updateInternalBuffers();
    if (this.drawVBuffer != null) {
      let gc = this.$outer.getGraphicsConfiguration_NoClientCode();
      let returnCode = this.drawVBuffer.validate(gc);
      if (returnCode === VolatileImage.IMAGE_INCOMPATIBLE) {
        try {
          this.createBuffers(this.numBuffers, this.caps);
        } catch ($e6) {
          if ($J.isa($e6, AWTException)) {
            let e = $J.exc($e6);
          } else {
            throw $e6;
          }
        }
        if (this.drawVBuffer != null) {
          this.drawVBuffer.validate(gc);
        }
        this.validatedContents = true;
      } else if (returnCode === VolatileImage.IMAGE_RESTORED) {
        this.validatedContents = true;
      }
    }
  }
  /**
   * @return whether the drawing buffer was lost since the last call to
   * {@code getDrawGraphics}
   */
  contentsLost(): boolean {
    if (this.drawVBuffer == null) {
      return false;
    }
    return this.drawVBuffer.contentsLost();
  }
  /**
   * @return whether the drawing buffer was recently restored from a lost
   * state and reinitialized to the default background color (white)
   */
  contentsRestored(): boolean {
    return this.validatedContents;
  }
  /**
   * Makes specified region of the next available buffer visible
   * by either blitting or flipping.
   */
  showSubRegion(x1: number, y1: number, x2: number, y2: number): void {
    this.flipSubRegion(x1, y1, x2, y2, this.caps.getFlipContents());
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  dispose(): void {
    if (this.$outer.bufferStrategy === this) {
      this.$outer.bufferStrategy = null;
      if (this.$outer.peer != null) {
        this.invalidate();
      }
    }
  }
}

/**
 * Inner class for blitting offscreen surfaces to a component.
 *
 * @author Michael Martak
 * @since 1.4
 */
export class Component$BltBufferStrategy extends BufferStrategy {
  /**
   * The buffering capabilities
   */
  caps: BufferCapabilities = null;
  /**
   * The back buffers
   */
  backBuffers: VolatileImage[] = null;
  /**
   * Whether or not the drawing buffer has been recently restored from
   * a lost state.
   */
  validatedContents: boolean = false;
  /**
   * Width of the back buffers
   */
  width_: number = 0;
  /**
   * Height of the back buffers
   */
  height_: number = 0;
  /**
   * Insets for the hosting Component.  The size of the back buffer
   * is constrained by these.
   */
  insets_: Insets = null;
  /**
   * Creates a new blt buffer strategy around a component
   * @param numBuffers number of buffers to create, including the
   * front buffer
   * @param caps the capabilities of the buffers
   */
  _Component$BltBufferStrategy(numBuffers: number, caps: BufferCapabilities): this {
    this._BufferStrategy();
    this.caps = caps;
    this.createBackBuffers((numBuffers - 1) | 0);
    return this;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  dispose(): void {
    if (this.backBuffers != null) {
      for (let counter = (this.backBuffers.length - 1) | 0; counter >= 0; counter--) {
        if (this.backBuffers[counter] != null) {
          this.backBuffers[counter].flush();
          this.backBuffers[counter] = null;
        }
      }
    }
    if (this.$outer.bufferStrategy === this) {
      this.$outer.bufferStrategy = null;
    }
  }
  /**
   * Creates the back buffers
   *
   * @param numBuffers the number of buffers to create
   */
  createBackBuffers(numBuffers: number): void {
    if (numBuffers === 0) {
      this.backBuffers = null;
    } else {
      this.width_ = this.$outer.getWidth();
      this.height_ = this.$outer.getHeight();
      this.insets_ = this.$outer.getInsets_NoClientCode();
      let iWidth = (this.width_ - this.insets_.left - this.insets_.right) | 0;
      let iHeight = (this.height_ - this.insets_.top - this.insets_.bottom) | 0;
      iWidth = Math.max(1, iWidth);
      iHeight = Math.max(1, iHeight);
      if (this.backBuffers == null) {
        this.backBuffers = $J.newArray(numBuffers, null);
      } else {
        for (let i = 0; i < numBuffers; i++) {
          if (this.backBuffers[i] != null) {
            this.backBuffers[i].flush();
            this.backBuffers[i] = null;
          }
        }
      }
      for (let i = 0; i < numBuffers; i++) {
        this.backBuffers[i] = this.$outer.createVolatileImage$int$int(iWidth, iHeight);
      }
    }
  }
  /**
   * @return the draw graphics
   */
  getDrawGraphics(): Graphics {
    this.revalidate$();
    let backBuffer = this.getBackBuffer();
    if (backBuffer == null) {
      return this.$outer.getGraphics();
    }
    let g = backBuffer.getGraphics();
    g.constrain(-this.insets_.left, -this.insets_.top, (backBuffer.getWidth$ImageObserver(null) + this.insets_.left) | 0, (backBuffer.getHeight$ImageObserver(null) + this.insets_.top) | 0);
    return g;
  }
  /**
   * @return direct access to the back buffer, as an image.
   * If there is no back buffer, returns null.
   */
  getBackBuffer(): Image {
    if (this.backBuffers != null) {
      return this.backBuffers[(this.backBuffers.length - 1) | 0];
    } else {
      return null;
    }
  }
  /**
   * Package-private method to present a specific rectangular area
   * of this buffer.  This class currently shows only the entire
   * buffer, by calling showSubRegion() with the full dimensions of
   * the buffer.  Subclasses (e.g., BltSubRegionBufferStrategy
   * and FlipSubRegionBufferStrategy) may have region-specific show
   * methods that call this method with actual sub regions of the
   * buffer.
   */
  showSubRegion(x1: number, y1: number, x2: number, y2: number): void {
    if (this.backBuffers == null) {
      return;
    }
    x1 = (x1 - this.insets_.left) | 0;
    x2 = (x2 - this.insets_.left) | 0;
    y1 = (y1 - this.insets_.top) | 0;
    y2 = (y2 - this.insets_.top) | 0;
    let g = this.$outer.getGraphics_NoClientCode();
    if (g == null) {
      return;
    }
    try {
      g.translate$int$int(this.insets_.left, this.insets_.top);
      for (let i = 0; i < this.backBuffers.length; i++) {
        g.drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(this.backBuffers[i], x1, y1, x2, y2, x1, y1, x2, y2, null);
        g.dispose();
        g = null;
        g = this.backBuffers[i].getGraphics();
      }
    } finally {
      if (g != null) {
        g.dispose();
      }
    }
  }
  /**
   * Restore the drawing buffer if it has been lost
   */
  revalidate$(): void {
    this.revalidate$boolean(true);
  }
  revalidate$boolean(checkSize: boolean): void {
    this.validatedContents = false;
    if (this.backBuffers == null) {
      return;
    }
    if (checkSize) {
      let insets = this.$outer.getInsets_NoClientCode();
      if (this.$outer.getWidth() !== this.width_ || this.$outer.getHeight() !== this.height_ || !insets.equals(this.insets_)) {
        this.createBackBuffers(this.backBuffers.length);
        this.validatedContents = true;
      }
    }
    let gc = this.$outer.getGraphicsConfiguration_NoClientCode();
    let returnCode = (this.backBuffers[(this.backBuffers.length - 1) | 0]).validate(gc);
    if (returnCode === VolatileImage.IMAGE_INCOMPATIBLE) {
      if (checkSize) {
        this.createBackBuffers(this.backBuffers.length);
        (this.backBuffers[(this.backBuffers.length - 1) | 0]).validate(gc);
      }
      this.validatedContents = true;
    } else if (returnCode === VolatileImage.IMAGE_RESTORED) {
      this.validatedContents = true;
    }
  }
  /**
   * @return whether the drawing buffer was lost since the last call to
   * {@code getDrawGraphics}
   */
  contentsLost(): boolean {
    if (this.backBuffers == null) {
      return false;
    } else {
      return (this.backBuffers[(this.backBuffers.length - 1) | 0]).contentsLost();
    }
  }
  /**
   * @return whether the drawing buffer was recently restored from a lost
   * state and reinitialized to the default background color (white)
   */
  contentsRestored(): boolean {
    return this.validatedContents;
  }
}

/**
 * Private class to perform sub-region flipping.
 */
export class Component$FlipSubRegionBufferStrategy extends Component$FlipBufferStrategy {
  _Component$FlipSubRegionBufferStrategy(numBuffers: number, caps: BufferCapabilities): this {
    this._Component$FlipBufferStrategy(numBuffers, caps);
    return this;
  }
  show$int$int$int$int(x1: number, y1: number, x2: number, y2: number): void {
    this.showSubRegion(x1, y1, x2, y2);
  }
  showIfNotLost(x1: number, y1: number, x2: number, y2: number): boolean {
    if (!this.contentsLost()) {
      this.showSubRegion(x1, y1, x2, y2);
      return !this.contentsLost();
    }
    return false;
  }
}

/**
 * Private class to perform sub-region blitting.  Swing will use
 * this subclass via the SubRegionShowable interface in order to
 * copy only the area changed during a repaint.
 * See javax.swing.BufferStrategyPaintManager.
 */
export class Component$BltSubRegionBufferStrategy extends Component$BltBufferStrategy {
  _Component$BltSubRegionBufferStrategy(numBuffers: number, caps: BufferCapabilities): this {
    this._Component$BltBufferStrategy(numBuffers, caps);
    return this;
  }
  show$int$int$int$int(x1: number, y1: number, x2: number, y2: number): void {
    this.showSubRegion(x1, y1, x2, y2);
  }
  showIfNotLost(x1: number, y1: number, x2: number, y2: number): boolean {
    if (!this.contentsLost()) {
      this.showSubRegion(x1, y1, x2, y2);
      return !this.contentsLost();
    }
    return false;
  }
}

/**
 * Inner class for flipping buffers on a component.  That component must
 * be a {@code Canvas} or {@code Window}.
 * @see Canvas
 * @see Window
 * @see java.awt.image.BufferStrategy
 * @author Michael Martak
 * @since 1.4
 */
export class Component$SingleBufferStrategy extends BufferStrategy {
  caps: BufferCapabilities = null;
  _Component$SingleBufferStrategy(caps: BufferCapabilities): this {
    this._BufferStrategy();
    this.caps = caps;
    return this;
  }
  getDrawGraphics(): Graphics {
    return this.$outer.getGraphics();
  }
  contentsLost(): boolean {
    return false;
  }
  contentsRestored(): boolean {
    return false;
  }
}

export class Component$DummyRequestFocusController extends JObject {
  _Component$DummyRequestFocusController(): this {
    return this;
  }
  acceptRequestFocus(from: Component, to: Component, temporary: boolean, focusedWindowChangeAllowed: boolean, cause: FocusEvent$Cause): boolean {
    return true;
  }
}

/**
 * Inner class of Component used to provide default support for
 * accessibility.  This class is not meant to be used directly by
 * application developers, but is instead meant only to be
 * subclassed by component developers.
 * <p>
 * The class used to obtain the accessible role for this object.
 * @since 1.3
 */
export class Component$AccessibleAWTComponent extends AccessibleContext {
  /**
   * Number of PropertyChangeListener objects registered. It's used
   * to add/remove ComponentListener and FocusListener to track
   * target Component's state.
   */
  propertyListenersCount: number = 0;
  /**
   * A component listener to track show/hide/resize events
   * and convert them to PropertyChange events.
   */
  accessibleAWTComponentHandler: ComponentListener = null;
  /**
   * A listener to track focus events
   * and convert them to PropertyChange events.
   */
  accessibleAWTFocusHandler: FocusListener = null;
  /**
   * Though the class is abstract, this should be called by
   * all sub-classes.
   */
  _Component$AccessibleAWTComponent(): this {
    this._AccessibleContext();
    this.accessibleAWTComponentHandler = null;
    this.accessibleAWTFocusHandler = null;
    return this;
  }
  /**
   * Gets the accessible name of this object.  This should almost never
   * return {@code java.awt.Component.getName()},
   * as that generally isn't a localized name,
   * and doesn't have meaning for the user.  If the
   * object is fundamentally a text object (e.g. a menu item), the
   * accessible name should be the text of the object (e.g. "save").
   * If the object has a tooltip, the tooltip text may also be an
   * appropriate String to return.
   *
   * @return the localized name of the object -- can be
   *         {@code null} if this
   *         object does not have a name
   * @see javax.accessibility.AccessibleContext#setAccessibleName
   */
  getAccessibleName(): string {
    return this.accessibleName;
  }
  /**
   * Gets the accessible description of this object.  This should be
   * a concise, localized description of what this object is - what
   * is its meaning to the user.  If the object has a tooltip, the
   * tooltip text may be an appropriate string to return, assuming
   * it contains a concise description of the object (instead of just
   * the name of the object - e.g. a "Save" icon on a toolbar that
   * had "save" as the tooltip text shouldn't return the tooltip
   * text as the description, but something like "Saves the current
   * text document" instead).
   *
   * @return the localized description of the object -- can be
   *        {@code null} if this object does not have a description
   * @see javax.accessibility.AccessibleContext#setAccessibleDescription
   */
  getAccessibleDescription(): string {
    return this.accessibleDescription;
  }
  /**
   * Gets the state of this object.
   *
   * @return an instance of {@code AccessibleStateSet}
   *       containing the current state set of the object
   * @see javax.accessibility.AccessibleState
   */
  getAccessibleStateSet$(): AccessibleStateSet {
    return this.$outer.getAccessibleStateSet();
  }
  /**
   * Gets the {@code Accessible} parent of this object.
   * If the parent of this object implements {@code Accessible},
   * this method should simply return {@code getParent}.
   *
   * @return the {@code Accessible} parent of this
   *      object -- can be {@code null} if this
   *      object does not have an {@code Accessible} parent
   */
  getAccessibleParent(): Accessible {
    if (this.accessibleParent != null) {
      return this.accessibleParent;
    } else {
      let parent = this.$outer.getParent();
      if ($J.isa(parent, Accessible)) {
        return parent;
      }
    }
    return null;
  }
  /**
   * Gets the index of this object in its accessible parent.
   *
   * @return the index of this object in its parent; or -1 if this
   *    object does not have an accessible parent
   * @see #getAccessibleParent
   */
  getAccessibleIndexInParent(): number {
    return this.$outer.getAccessibleIndexInParent();
  }
  /**
   * Returns the number of accessible children in the object.  If all
   * of the children of this object implement {@code Accessible},
   * then this method should return the number of children of this object.
   *
   * @return the number of accessible children in the object
   */
  getAccessibleChildrenCount(): number {
    return 0;
  }
  /**
   * Returns the nth {@code Accessible} child of the object.
   *
   * @param i zero-based index of child
   * @return the nth {@code Accessible} child of the object
   */
  getAccessibleChild(i: number): Accessible {
    return null;
  }
  /**
   * Returns the location of the object on the screen.
   *
   * @return location of object on screen -- can be
   *    {@code null} if this object is not on the screen
   */
  getLocationOnScreen(): Point {
    {
      if (this.$outer.isShowing()) {
        return this.$outer.getLocationOnScreen();
      } else {
        return null;
      }
    }
  }
}

let $Component$2: any = null;
/** An anonymous class (Component.java:1436). */
function Component$2(): any {
  return $Component$2 ??= $J.local(class extends JObject {
    run(): PointerInfo {
      return MouseInfo.getPointerInfo();
    }
  }, 'java.awt.Component$2', ['java.security.PrivilegedAction']);
}

let $Component$3: any = null;
/** An anonymous class (Component.java:6258). */
function Component$3(): any {
  return $Component$3 ??= $J.local(class extends JObject {
    run(): boolean {
      return Component.isCoalesceEventsOverriden(this.$cv_clazz);
    }
    $c($clazz): this {
      this.$cv_clazz = $clazz;
      return this;
    }
  }, 'java.awt.Component$3', ['java.security.PrivilegedAction']);
}

let $Component$1: any = null;
/** An anonymous class (Component.java:877). */
function Component$1(): any {
  return $Component$1 ??= $J.local(class extends JObject {
    requestFocus(comp: Component, cause: FocusEvent$Cause): void {
      comp.requestFocus$Cause(cause);
    }
    canBeFocusOwner(comp: Component): boolean {
      return comp.canBeFocusOwner();
    }
    setRequestFocusController(requestController: RequestFocusController): void {
      Component.setRequestFocusController(requestController);
    }
    setAppContext(comp: Component, appContext: AppContext): void {
      comp.appContext = appContext;
    }
    getPeer<T>(comp: Component): T {
      return comp.peer;
    }
    isLightweight(comp: Component): boolean {
      return ($J.isa(comp.peer, LightweightPeer));
    }
    getAccessControlContext(comp: Component): AccessControlContext {
      return comp.getAccessControlContext();
    }
    revalidateSynchronously(comp: Component): void {
      comp.revalidateSynchronously();
    }
    createBufferStrategy(comp: Component, numBuffers: number, caps: BufferCapabilities): void {
      comp.createBufferStrategy$int$BufferCapabilities(numBuffers, caps);
    }
    getBufferStrategy(comp: Component): BufferStrategy {
      return comp.getBufferStrategy();
    }
  }, 'java.awt.Component$1', ['sun.awt.AWTAccessor$ComponentAccessor']);
}

$J.define(Component, 'java.awt.Component', { kind: 'class', ifaces: ['java.awt.image.ImageObserver', 'java.awt.MenuContainer', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_Component' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Component', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$Component', 'firePropertyChange(java.lang.String,double,double)': 'firePropertyChange$String$double$double', 'firePropertyChange(java.lang.String,float,float)': 'firePropertyChange$String$float$float', 'firePropertyChange(java.lang.String,long,long)': 'firePropertyChange$String$long$long', 'firePropertyChange(java.lang.String,short,short)': 'firePropertyChange$String$short$short', 'firePropertyChange(java.lang.String,char,char)': 'firePropertyChange$String$char$char', 'firePropertyChange(java.lang.String,byte,byte)': 'firePropertyChange$String$byte$byte', 'firePropertyChange(java.lang.String,int,int)': 'firePropertyChange$String$int$int', 'firePropertyChange(java.lang.String,boolean,boolean)': 'firePropertyChange$String$boolean$boolean', 'firePropertyChange(java.lang.String,java.lang.Object,java.lang.Object)': 'firePropertyChange$String$Object$Object', 'getPropertyChangeListeners(java.lang.String)': 'getPropertyChangeListeners$String', 'removePropertyChangeListener(java.lang.String,java.beans.PropertyChangeListener)': 'removePropertyChangeListener$String$PropertyChangeListener', 'addPropertyChangeListener(java.lang.String,java.beans.PropertyChangeListener)': 'addPropertyChangeListener$String$PropertyChangeListener', 'getPropertyChangeListeners()': 'getPropertyChangeListeners$', 'removePropertyChangeListener(java.beans.PropertyChangeListener)': 'removePropertyChangeListener$PropertyChangeListener', 'addPropertyChangeListener(java.beans.PropertyChangeListener)': 'addPropertyChangeListener$PropertyChangeListener', 'list(java.io.PrintWriter,int)': 'list$PrintWriter$int', 'list(java.io.PrintWriter)': 'list$PrintWriter', 'list(java.io.PrintStream,int)': 'list$PrintStream$int', 'list(java.io.PrintStream)': 'list$PrintStream', 'list()': 'list$', 'remove(java.awt.MenuComponent)': 'remove$MenuComponent', 'add(java.awt.PopupMenu)': 'add$PopupMenu', 'transferFocusBackward(boolean)': 'transferFocusBackward$boolean', 'transferFocusBackward()': 'transferFocusBackward$', 'transferFocus(boolean)': 'transferFocus$boolean', 'transferFocus()': 'transferFocus$', 'isFocusCycleRoot(java.awt.Container)': 'isFocusCycleRoot$Container', 'requestFocusHelper(boolean,boolean,java.awt.event.FocusEvent$Cause)': 'requestFocusHelper$boolean$boolean$Cause', 'requestFocusHelper(boolean,boolean)': 'requestFocusHelper$boolean$boolean', 'requestFocusInWindow(boolean,java.awt.event.FocusEvent$Cause)': 'requestFocusInWindow$boolean$Cause', 'requestFocusInWindow(boolean)': 'requestFocusInWindow$boolean', 'requestFocusInWindow(java.awt.event.FocusEvent$Cause)': 'requestFocusInWindow$Cause', 'requestFocusInWindow()': 'requestFocusInWindow$', 'requestFocus(boolean,java.awt.event.FocusEvent$Cause)': 'requestFocus$boolean$Cause', 'requestFocus(boolean)': 'requestFocus$boolean', 'requestFocus(java.awt.event.FocusEvent$Cause)': 'requestFocus$Cause', 'requestFocus()': 'requestFocus$', 'processMouseEvent(java.awt.event.MouseEvent)': 'processMouseEvent$MouseEvent', 'processKeyEvent(java.awt.event.KeyEvent)': 'processKeyEvent$KeyEvent', 'getComponentAt(java.awt.Point)': 'getComponentAt$Point', 'getComponentAt(int,int)': 'getComponentAt$int$int', 'contains(java.awt.Point)': 'contains$Point', 'contains(int,int)': 'contains$int$int', 'createBufferStrategy(int,java.awt.BufferCapabilities)': 'createBufferStrategy$int$BufferCapabilities', 'createBufferStrategy(int)': 'createBufferStrategy$int', 'checkImage(java.awt.Image,int,int,java.awt.image.ImageObserver)': 'checkImage$Image$int$int$ImageObserver', 'checkImage(java.awt.Image,java.awt.image.ImageObserver)': 'checkImage$Image$ImageObserver', 'prepareImage(java.awt.Image,int,int,java.awt.image.ImageObserver)': 'prepareImage$Image$int$int$ImageObserver', 'prepareImage(java.awt.Image,java.awt.image.ImageObserver)': 'prepareImage$Image$ImageObserver', 'createVolatileImage(int,int,java.awt.ImageCapabilities)': 'createVolatileImage$int$int$ImageCapabilities', 'createVolatileImage(int,int)': 'createVolatileImage$int$int', 'createImage(int,int)': 'createImage$int$int', 'createImage(java.awt.image.ImageProducer)': 'createImage$ImageProducer', 'print(java.awt.Graphics)': 'print$Graphics', 'repaint(long,int,int,int,int)': 'repaint$long$int$int$int$int', 'repaint(int,int,int,int)': 'repaint$int$int$int$int', 'repaint(long)': 'repaint$long', 'repaint()': 'repaint$', 'update(java.awt.Graphics)': 'update$Graphics', 'setCursor(java.awt.Cursor)': 'setCursor$Cursor', 'minimumSize()': 'minimumSize$', 'getMinimumSize()': 'getMinimumSize$', 'preferredSize()': 'preferredSize$', 'getPreferredSize()': 'getPreferredSize$', 'getLocation(java.awt.Point)': 'getLocation$Point', 'getSize(java.awt.Dimension)': 'getSize$Dimension', 'getBounds(java.awt.Rectangle)': 'getBounds$Rectangle', 'setBounds(java.awt.Rectangle)': 'setBounds$Rectangle', 'setBounds(int,int,int,int)': 'setBounds$int$int$int$int', 'getBounds()': 'getBounds$', 'resize(java.awt.Dimension)': 'resize$Dimension', 'setSize(java.awt.Dimension)': 'setSize$Dimension', 'resize(int,int)': 'resize$int$int', 'setSize(int,int)': 'setSize$int$int', 'getSize()': 'getSize$', 'setLocation(java.awt.Point)': 'setLocation$Point', 'setLocation(int,int)': 'setLocation$int$int', 'getLocation()': 'getLocation$', 'getLocale()': 'getLocale$', 'show(boolean)': 'show$boolean', 'show()': 'show$', 'enable(boolean)': 'enable$boolean', 'enable()': 'enable$', 'getMousePosition()': 'getMousePosition$', 'isVisible()': 'isVisible$', 'getName()': 'getName$' }, clinit: true, lazy: ['log', 'eventLog', 'focusLog', 'mixingLog', 'focusTraversalKeyPropertyNames', 'LOCK', 'isInc', 'incRate', 'coalesceMap', 'coalesceEventsParams', 'requestFocusController'] });
$J.define(Component$AWTTreeLock, 'java.awt.Component$AWTTreeLock', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Component$AWTTreeLock' } });
$J.define(Component$BaselineResizeBehavior, 'java.awt.Component$BaselineResizeBehavior', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Component$BaselineResizeBehavior' }, clinit: true, lazy: ['$VALUES', 'CONSTANT_ASCENT', 'CONSTANT_DESCENT', 'CENTER_OFFSET', 'OTHER'] });
$J.define(Component$ProxyCapabilities, 'java.awt.Component$ProxyCapabilities', { kind: 'class', sup: 'sun.java2d.pipe.hw.ExtendedBufferCapabilities', ctors: { 'java.awt.BufferCapabilities': '_Component$ProxyCapabilities' } });
$J.define(Component$FlipBufferStrategy, 'java.awt.Component$FlipBufferStrategy', { kind: 'class', sup: 'java.awt.image.BufferStrategy', ctors: { 'int,java.awt.BufferCapabilities': '_Component$FlipBufferStrategy' }, meths: { 'show()': 'show$' }, inner: true });
$J.define(Component$BltBufferStrategy, 'java.awt.Component$BltBufferStrategy', { kind: 'class', sup: 'java.awt.image.BufferStrategy', ctors: { 'int,java.awt.BufferCapabilities': '_Component$BltBufferStrategy' }, meths: { 'revalidate(boolean)': 'revalidate$boolean', 'revalidate()': 'revalidate$', 'show()': 'show$' }, inner: true });
$J.define(Component$FlipSubRegionBufferStrategy, 'java.awt.Component$FlipSubRegionBufferStrategy', { kind: 'class', ifaces: ['sun.awt.SubRegionShowable'], sup: 'java.awt.Component$FlipBufferStrategy', ctors: { 'int,java.awt.BufferCapabilities': '_Component$FlipSubRegionBufferStrategy' }, meths: { 'show(int,int,int,int)': 'show$int$int$int$int' }, inner: true });
$J.define(Component$BltSubRegionBufferStrategy, 'java.awt.Component$BltSubRegionBufferStrategy', { kind: 'class', ifaces: ['sun.awt.SubRegionShowable'], sup: 'java.awt.Component$BltBufferStrategy', ctors: { 'int,java.awt.BufferCapabilities': '_Component$BltSubRegionBufferStrategy' }, meths: { 'show(int,int,int,int)': 'show$int$int$int$int' }, inner: true });
$J.define(Component$SingleBufferStrategy, 'java.awt.Component$SingleBufferStrategy', { kind: 'class', sup: 'java.awt.image.BufferStrategy', ctors: { 'java.awt.BufferCapabilities': '_Component$SingleBufferStrategy' }, meths: { 'show()': 'show$' }, inner: true });
$J.define(Component$DummyRequestFocusController, 'java.awt.Component$DummyRequestFocusController', { kind: 'class', ifaces: ['sun.awt.RequestFocusController'], sup: 'java.lang.Object', ctors: { '': '_Component$DummyRequestFocusController' } });
$J.define(Component$AccessibleAWTComponent, 'java.awt.Component$AccessibleAWTComponent', { kind: 'class', ifaces: ['java.io.Serializable', 'javax.accessibility.AccessibleComponent'], sup: 'javax.accessibility.AccessibleContext', ctors: { '': '_Component$AccessibleAWTComponent' }, meths: { 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point', 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  AWTError = $J.load('java.awt.AWTError');
  AWTEvent = $J.load('java.awt.AWTEvent');
  AWTEventMulticaster = $J.load('java.awt.AWTEventMulticaster');
  AWTException = $J.load('java.awt.AWTException');
  BufferCapabilities$FlipContents = $J.load('java.awt.BufferCapabilities$FlipContents');
  Canvas = $J.load('java.awt.Canvas');
  ComponentOrientation = $J.load('java.awt.ComponentOrientation');
  Container = $J.load('java.awt.Container');
  Cursor = $J.load('java.awt.Cursor');
  Dimension = $J.load('java.awt.Dimension');
  Event = $J.load('java.awt.Event');
  EventQueue = $J.load('java.awt.EventQueue');
  GraphicsCallback$PeerPrintCallback = $J.load('java.awt.GraphicsCallback$PeerPrintCallback');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  HeadlessException = $J.load('java.awt.HeadlessException');
  IllegalComponentStateException = $J.load('java.awt.IllegalComponentStateException');
  Insets = $J.load('java.awt.Insets');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  MouseInfo = $J.load('java.awt.MouseInfo');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  Window = $J.load('java.awt.Window');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  AdjustmentEvent = $J.load('java.awt.event.AdjustmentEvent');
  ComponentEvent = $J.load('java.awt.event.ComponentEvent');
  ComponentListener = $J.load('java.awt.event.ComponentListener');
  FocusEvent = $J.load('java.awt.event.FocusEvent');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  FocusListener = $J.load('java.awt.event.FocusListener');
  HierarchyBoundsListener = $J.load('java.awt.event.HierarchyBoundsListener');
  HierarchyEvent = $J.load('java.awt.event.HierarchyEvent');
  HierarchyListener = $J.load('java.awt.event.HierarchyListener');
  InputEvent = $J.load('java.awt.event.InputEvent');
  InputMethodEvent = $J.load('java.awt.event.InputMethodEvent');
  InputMethodListener = $J.load('java.awt.event.InputMethodListener');
  ItemEvent = $J.load('java.awt.event.ItemEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  KeyListener = $J.load('java.awt.event.KeyListener');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  MouseListener = $J.load('java.awt.event.MouseListener');
  MouseMotionListener = $J.load('java.awt.event.MouseMotionListener');
  MouseWheelEvent = $J.load('java.awt.event.MouseWheelEvent');
  MouseWheelListener = $J.load('java.awt.event.MouseWheelListener');
  PaintEvent = $J.load('java.awt.event.PaintEvent');
  TextEvent = $J.load('java.awt.event.TextEvent');
  VolatileImage = $J.load('java.awt.image.VolatileImage');
  PropertyChangeListener = $J.load('java.beans.PropertyChangeListener');
  PropertyChangeSupport = $J.load('java.beans.PropertyChangeSupport');
  Accessible = $J.load('javax.accessibility.Accessible');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  AccessibleStateSet = $J.load('javax.accessibility.AccessibleStateSet');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  ComponentFactory = $J.load('sun.awt.ComponentFactory');
  ConstrainableGraphics = $J.load('sun.awt.ConstrainableGraphics');
  EmbeddedFrame = $J.load('sun.awt.EmbeddedFrame');
  SunGraphicsCallback = $J.load('sun.awt.SunGraphicsCallback');
});
