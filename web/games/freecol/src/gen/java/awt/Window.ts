// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Window.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AccessController, AppContext, ArrayList, Arrays, AtomicBoolean, Disposer, GetPropertyAction, IllegalArgumentException, InputContext, InterruptedException, InvocationTargetException, JEnum, JObject, Locale, PlatformLogger, PlatformLogger_Level, Region, SecurityException, SunToolkit, Toolkit, UnsupportedOperationException, Vector, WeakReference } from '../../../jre/index.ts';
import { Container } from './Container.ts';
import { Container$AccessibleAWTContainer } from './Container.ts';

let AWTEvent, AWTEventMulticaster, AlphaComposite, BorderLayout, Cursor, Dialog, Dialog$ModalExclusionType, EventQueue, Frame, Graphics2D, GraphicsDevice, GraphicsDevice$WindowTranslucency, GraphicsEnvironment, IllegalComponentStateException, KeyboardFocusManager, Point, SplashScreen, ComponentEvent, FocusEvent$Cause, KeyEvent, WindowEvent, WindowFocusListener, WindowListener, WindowStateListener, Path2D$Float, JComponent, RootPaneContainer, AWTAccessor, AWTPermissions, DebugSettings, IdentityArrayList;

/**
 * A {@code Window} object is a top-level window with no borders and no
 * menubar.
 * The default layout for a window is {@code BorderLayout}.
 * <p>
 * A window must have either a frame, dialog, or another window defined as its
 * owner when it's constructed.
 * <p>
 * In a multi-screen environment, you can create a {@code Window}
 * on a different screen device by constructing the {@code Window}
 * with {@link #Window(Window, GraphicsConfiguration)}.  The
 * {@code GraphicsConfiguration} object is one of the
 * {@code GraphicsConfiguration} objects of the target screen device.
 * <p>
 * In a virtual device multi-screen environment in which the desktop
 * area could span multiple physical screen devices, the bounds of all
 * configurations are relative to the virtual device coordinate system.
 * The origin of the virtual-coordinate system is at the upper left-hand
 * corner of the primary physical screen.  Depending on the location of
 * the primary screen in the virtual device, negative coordinates are
 * possible, as shown in the following figure.
 * <p>
 * <img src="doc-files/MultiScreen.gif"
 * alt="Diagram shows virtual device containing 4 physical screens. Primary
 * physical screen shows coords (0,0), other screen shows (-80,-100)."
 * style="margin: 7px 10px;">
 * <p>
 * In such an environment, when calling {@code setLocation},
 * you must pass a virtual coordinate to this method.  Similarly,
 * calling {@code getLocationOnScreen} on a {@code Window} returns
 * virtual device coordinates.  Call the {@code getBounds} method
 * of a {@code GraphicsConfiguration} to find its origin in the virtual
 * coordinate system.
 * <p>
 * The following code sets the location of a {@code Window}
 * at (10, 10) relative to the origin of the physical screen
 * of the corresponding {@code GraphicsConfiguration}.  If the
 * bounds of the {@code GraphicsConfiguration} is not taken
 * into account, the {@code Window} location would be set
 * at (10, 10) relative to the virtual-coordinate system and would appear
 * on the primary physical screen, which might be different from the
 * physical screen of the specified {@code GraphicsConfiguration}.
 *
 * <pre>
 *      Window w = new Window(Window owner, GraphicsConfiguration gc);
 *      Rectangle bounds = gc.getBounds();
 *      w.setLocation(10 + bounds.x, 10 + bounds.y);
 * </pre>
 *
 * <p>
 * Note: the location and size of top-level windows (including
 * {@code Window}s, {@code Frame}s, and {@code Dialog}s)
 * are under the control of the desktop's window management system.
 * Calls to {@code setLocation}, {@code setSize}, and
 * {@code setBounds} are requests (not directives) which are
 * forwarded to the window management system.  Every effort will be
 * made to honor such requests.  However, in some cases the window
 * management system may ignore such requests, or modify the requested
 * geometry in order to place and size the {@code Window} in a way
 * that more closely matches the desktop settings.
 * <p>
 * Visual effects such as halos, shadows, motion effects and animations may be
 * applied to the window by the desktop window management system. These are
 * outside the knowledge and control of the AWT and so for the purposes of this
 * specification are not considered part of the top-level window.
 * <p>
 * Due to the asynchronous nature of native event handling, the results
 * returned by {@code getBounds}, {@code getLocation},
 * {@code getLocationOnScreen}, and {@code getSize} might not
 * reflect the actual geometry of the Window on screen until the last
 * request has been processed.  During the processing of subsequent
 * requests these values might change accordingly while the window
 * management system fulfills the requests.
 * <p>
 * An application may set the size and location of an invisible
 * {@code Window} arbitrarily, but the window management system may
 * subsequently change its size and/or location when the
 * {@code Window} is made visible. One or more {@code ComponentEvent}s
 * will be generated to indicate the new geometry.
 * <p>
 * Windows are capable of generating the following WindowEvents:
 * WindowOpened, WindowClosed, WindowGainedFocus, WindowLostFocus.
 *
 * @author      Sami Shaio
 * @author      Arthur van Hoff
 * @see WindowEvent
 * @see #addWindowListener
 * @see java.awt.BorderLayout
 * @since       1.0
 */
export class Window extends Container {
  /**
   * This represents the warning message that is
   * to be displayed in a non secure window. ie :
   * a window that has a security manager installed that denies
   * {@code AWTPermission("showWindowWithoutWarningBanner")}.
   * This message can be displayed anywhere in the window.
   *
   * @serial
   * @see #getWarningString
   */
  warningString: string = null;
  /**
   * {@code icons} is the graphical way we can
   * represent the frames and dialogs.
   * {@code Window} can't display icon but it's
   * being inherited by owned {@code Dialog}s.
   *
   * @serial
   * @see #getIconImages
   * @see #setIconImages
   */
  icons: List<Image> = null;
  /**
   * Holds the reference to the component which last had focus in this window
   * before it lost focus.
   */
  temporaryLostComponent: Component = null;
  static systemSyncLWRequests: boolean = false;
  /**
   * Focus transfers should be synchronous for lightweight component requests.
   */
  syncLWRequests: boolean = false;
  beforeFirstShow: boolean = false;
  disposing: boolean = false;
  disposerRecord: Window$WindowDisposerRecord = null;
  static readonly OPENED: number = 1;
  /**
   * An Integer value representing the Window State.
   *
   * @serial
   * @since 1.2
   * @see #show
   */
  state: number = 0;
  /**
   * A boolean value representing Window always-on-top state
   * @since 1.5
   * @serial
   * @see #setAlwaysOnTop
   * @see #isAlwaysOnTop
   */
  alwaysOnTop_: boolean = false;
  /**
   * Contains all the windows that have a peer object associated,
   * i. e. between addNotify() and removeNotify() calls. The list
   * of all Window instances can be obtained from AppContext object.
   *
   * @since 1.6
   */
  static allWindows: IdentityArrayList<Window> = null;
  /**
   * A vector containing all the windows this
   * window currently owns.
   * @since 1.2
   * @see #getOwnedWindows
   */
  ownedWindowList: Vector<WeakReference<Window>> = null;
  weakThis: WeakReference<Window> = null;
  showWithParent: boolean = false;
  /**
   * Contains the modal dialog that blocks this window, or null
   * if the window is unblocked.
   *
   * @since 1.6
   */
  modalBlocker: Dialog = null;
  /**
   * @serial
   *
   * @see java.awt.Dialog.ModalExclusionType
   * @see #getModalExclusionType
   * @see #setModalExclusionType
   *
   * @since 1.6
   */
  modalExclusionType: Dialog$ModalExclusionType = null;
  windowListener: WindowListener = null;
  windowStateListener: WindowStateListener = null;
  windowFocusListener: WindowFocusListener = null;
  inputContext: InputContext = null;
  inputContextLock: any = null;
  /**
   * Unused. Maintained for serialization backward-compatibility.
   *
   * @serial
   * @since 1.2
   */
  focusMgr: FocusManager = null;
  /**
   * Indicates whether this Window can become the focused Window.
   *
   * @serial
   * @see #getFocusableWindowState
   * @see #setFocusableWindowState
   * @since 1.4
   */
  focusableWindowState: boolean = false;
  /**
   * Indicates whether this window should receive focus on
   * subsequently being shown (with a call to {@code setVisible(true)}), or
   * being moved to the front (with a call to {@code toFront()}).
   *
   * @serial
   * @see #setAutoRequestFocus
   * @see #isAutoRequestFocus
   * @since 1.7
   */
  autoRequestFocus: boolean = false;
  isInShow: boolean = false;
  /**
   * The opacity level of the window
   *
   * @serial
   * @see #setOpacity(float)
   * @see #getOpacity()
   * @since 1.7
   */
  opacity: number = 0;
  /**
   * The shape assigned to this window. This field is set to {@code null} if
   * no shape is set (rectangular window).
   *
   * @serial
   * @see #getShape()
   * @see #setShape(Shape)
   * @since 1.7
   */
  shape_: Shape = null;
  static readonly base: string = 'win';
  static nameCounter: number = 0;
  static log: PlatformLogger = null;
  static locationByPlatformProp: boolean = false;
  isTrayIconWindow_: boolean = false;
  /**
   * These fields are initialized in the native peer code
   * or via AWTAccessor's WindowAccessor.
   */
  securityWarningWidth: number = 0;
  securityWarningHeight: number = 0;
  anchor: any = null;
  static beforeFirstWindowShown: AtomicBoolean = null;
  /**
   * Window type.
   *
   * Synchronization: ObjectLock
   */
  type: Window$Type = null;
  /**
   * The window serialized data version.
   *
   * @serial
   */
  windowSerializedDataVersion: number = 0;
  /**
   * {@code true} if this Window should appear at the default location,
   * {@code false} if at the current location.
   */
  locationByPlatform: boolean = false;
  $init_Window() {
    this.syncLWRequests = false;
    this.beforeFirstShow = true;
    this.disposing = false;
    this.disposerRecord = null;
    this.ownedWindowList = new Vector();
    this.inputContextLock = new JObject();
    this.focusableWindowState = true;
    this.autoRequestFocus = true;
    this.isInShow = false;
    this.opacity = 1;
    this.shape_ = null;
    this.isTrayIconWindow_ = false;
    this.anchor = new JObject();
    this.type = Window$Type.NORMAL;
    this.windowSerializedDataVersion = 2;
    this.locationByPlatform = Window.locationByPlatformProp;
  }
  /**
   * Constructs a new, initially invisible window in default size with the
   * specified {@code GraphicsConfiguration}.
   * <p>
   * If there is a security manager, then it is invoked to check
   * {@code AWTPermission("showWindowWithoutWarningBanner")}
   * to determine whether or not the window must be displayed with
   * a warning banner.
   *
   * @param gc the {@code GraphicsConfiguration} of the target screen
   *     device. If {@code gc} is {@code null}, the system default
   *     {@code GraphicsConfiguration} is assumed
   * @throws IllegalArgumentException if {@code gc}
   *    is not from a screen device
   * @throws HeadlessException when
   *     {@code GraphicsEnvironment.isHeadless()} returns {@code true}
   *
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  _Window$GraphicsConfiguration(gc: GraphicsConfiguration): this {
    this._Container();
    this.$init_Window();
    this.init$GraphicsConfiguration$Window(gc);
    return this;
  }
  /**
   * Constructs a new, initially invisible window in the default size.
   * <p>
   * If there is a security manager set, it is invoked to check
   * {@code AWTPermission("showWindowWithoutWarningBanner")}.
   * If that check fails with a {@code SecurityException} then a warning
   * banner is created.
   *
   * @throws HeadlessException when
   *     {@code GraphicsEnvironment.isHeadless()} returns {@code true}
   *
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  _Window$(): this {
    this._Container();
    this.$init_Window();
    GraphicsEnvironment.checkHeadless();
    this.init$GraphicsConfiguration$Window(null);
    return this;
  }
  /**
   * Constructs a new, initially invisible window with the specified
   * {@code Frame} as its owner. The window will not be focusable
   * unless its owner is showing on the screen.
   * <p>
   * If there is a security manager set, it is invoked to check
   * {@code AWTPermission("showWindowWithoutWarningBanner")}.
   * If that check fails with a {@code SecurityException} then a warning
   * banner is created.
   *
   * @param owner the {@code Frame} to act as owner or {@code null}
   *    if this window has no owner
   * @throws IllegalArgumentException if the {@code owner}'s
   *    {@code GraphicsConfiguration} is not from a screen device
   * @throws HeadlessException when
   *    {@code GraphicsEnvironment.isHeadless} returns {@code true}
   *
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see #isShowing
   */
  _Window$Frame(owner: Frame): this {
    this._Window$GraphicsConfiguration(owner == null ? null : owner.getGraphicsConfiguration());
    this.ownedInit(owner);
    return this;
  }
  /**
   * Constructs a new, initially invisible window with the specified
   * {@code Window} as its owner. This window will not be focusable
   * unless its nearest owning {@code Frame} or {@code Dialog}
   * is showing on the screen.
   * <p>
   * If there is a security manager set, it is invoked to check
   * {@code AWTPermission("showWindowWithoutWarningBanner")}.
   * If that check fails with a {@code SecurityException} then a
   * warning banner is created.
   *
   * @param owner the {@code Window} to act as owner or
   *     {@code null} if this window has no owner
   * @throws IllegalArgumentException if the {@code owner}'s
   *     {@code GraphicsConfiguration} is not from a screen device
   * @throws HeadlessException when
   *     {@code GraphicsEnvironment.isHeadless()} returns
   *     {@code true}
   *
   * @see       java.awt.GraphicsEnvironment#isHeadless
   * @see       #isShowing
   *
   * @since     1.2
   */
  _Window$Window(owner: Window): this {
    this._Window$GraphicsConfiguration(owner == null ? null : owner.getGraphicsConfiguration());
    this.ownedInit(owner);
    return this;
  }
  /**
   * Constructs a new, initially invisible window with the specified owner
   * {@code Window} and a {@code GraphicsConfiguration}
   * of a screen device. The Window will not be focusable unless
   * its nearest owning {@code Frame} or {@code Dialog}
   * is showing on the screen.
   * <p>
   * If there is a security manager set, it is invoked to check
   * {@code AWTPermission("showWindowWithoutWarningBanner")}. If that
   * check fails with a {@code SecurityException} then a warning banner
   * is created.
   *
   * @param owner the window to act as owner or {@code null}
   *     if this window has no owner
   * @param gc the {@code GraphicsConfiguration} of the target
   *     screen device; if {@code gc} is {@code null},
   *     the system default {@code GraphicsConfiguration} is assumed
   * @throws IllegalArgumentException if {@code gc}
   *     is not from a screen device
   * @throws HeadlessException when
   *     {@code GraphicsEnvironment.isHeadless()} returns
   *     {@code true}
   *
   * @see       java.awt.GraphicsEnvironment#isHeadless
   * @see       GraphicsConfiguration#getBounds
   * @see       #isShowing
   * @since     1.3
   */
  _Window$Window$GraphicsConfiguration(owner: Window, gc: GraphicsConfiguration): this {
    this._Window$GraphicsConfiguration(gc);
    this.ownedInit(owner);
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Window', 'initIDs', this, $a);
  }
  initGC(gc: GraphicsConfiguration): GraphicsConfiguration {
    GraphicsEnvironment.checkHeadless();
    if (gc == null) {
      gc = GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDefaultConfiguration();
    }
    this.setGraphicsConfiguration(gc);
    return gc;
  }
  init$GraphicsConfiguration$Window(gc: GraphicsConfiguration): void {
    GraphicsEnvironment.checkHeadless();
    this.syncLWRequests = Window.systemSyncLWRequests;
    this.weakThis = new WeakReference(this);
    this.addToWindowList();
    this.setWarningString();
    this.cursor = Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR);
    this.visible = false;
    gc = this.initGC(gc);
    if (gc.getDevice().getType() !== GraphicsDevice.TYPE_RASTER_SCREEN) {
      throw new IllegalArgumentException('not a screen device');
    }
    this.setLayout(new BorderLayout()._BorderLayout$());
    let screenBounds = gc.getBounds();
    let screenInsets = this.getToolkit().getScreenInsets(gc);
    let x = (this.getX() + screenBounds.x_ + screenInsets.left) | 0;
    let y = (this.getY() + screenBounds.y_ + screenInsets.top) | 0;
    if (x !== this.x_ || y !== this.y_) {
      this.setLocation$int$int(x, y);
      this.setLocationByPlatform(Window.locationByPlatformProp);
    }
    this.modalExclusionType = Dialog$ModalExclusionType.NO_EXCLUDE;
    this.disposerRecord = new Window$WindowDisposerRecord()._Window$WindowDisposerRecord(this.appContext, this);
    Disposer.addRecord(this.anchor, this.disposerRecord);
    SunToolkit.checkAndSetPolicy(this);
  }
  ownedInit(owner: Window): void {
    this.parent = owner;
    if (owner != null) {
      owner.addOwnedWindow(this.weakThis);
      if (owner.isAlwaysOnTop()) {
        try {
          this.setAlwaysOnTop(true);
        } catch ($e0) {
          if ($J.isa($e0, SecurityException)) {
            let ignore = $J.exc($e0);
          } else {
            throw $e0;
          }
        }
      }
    }
    this.disposerRecord.updateOwner();
  }
  /**
   * Construct a name for this component.  Called by getName() when the
   * name is null.
   */
  constructComponentName(): string {
    {
      return Window.base + Window.nameCounter++;
    }
  }
  /**
   * Returns the sequence of images to be displayed as the icon for this window.
   * <p>
   * This method returns a copy of the internally stored list, so all operations
   * on the returned object will not affect the window's behavior.
   *
   * @return    the copy of icon images' list for this window, or
   *            empty list if this window doesn't have icon images.
   * @see       #setIconImages
   * @see       #setIconImage(Image)
   * @since     1.6
   */
  getIconImages(): List<Image> {
    let icons = this.icons;
    if (icons == null || icons.size() === 0) {
      return new ArrayList();
    }
    return new ArrayList(icons);
  }
  /**
   * Sets the sequence of images to be displayed as the icon
   * for this window. Subsequent calls to {@code getIconImages} will
   * always return a copy of the {@code icons} list.
   * <p>
   * Depending on the platform capabilities one or several images
   * of different dimensions will be used as the window's icon.
   * <p>
   * The {@code icons} list can contain {@code MultiResolutionImage} images also.
   * Suitable image depending on screen resolution is extracted from
   * base {@code MultiResolutionImage} image and added to the icons list
   * while base resolution image is removed from list.
   * The {@code icons} list is scanned for the images of most
   * appropriate dimensions from the beginning. If the list contains
   * several images of the same size, the first will be used.
   * <p>
   * Ownerless windows with no icon specified use platform-default icon.
   * The icon of an owned window may be inherited from the owner
   * unless explicitly overridden.
   * Setting the icon to {@code null} or empty list restores
   * the default behavior.
   * <p>
   * Note : Native windowing systems may use different images of differing
   * dimensions to represent a window, depending on the context (e.g.
   * window decoration, window list, taskbar, etc.). They could also use
   * just a single image for all contexts or no image at all.
   *
   * @param     icons the list of icon images to be displayed.
   * @see       #getIconImages()
   * @see       #setIconImage(Image)
   * @since     1.6
   */
  setIconImages(icons: List<Image>): void {
    this.icons = (icons == null) ? new ArrayList() : new ArrayList(icons);
    let peer = this.peer;
    if (peer != null) {
      peer.updateIconImages();
    }
    this.firePropertyChange$String$Object$Object('iconImage', null, null);
  }
  /**
   * Sets the image to be displayed as the icon for this window.
   * <p>
   * This method can be used instead of {@link #setIconImages setIconImages()}
   * to specify a single image as a window's icon.
   * <p>
   * The following statement:
   * <pre>
   *     setIconImage(image);
   * </pre>
   * is equivalent to:
   * <pre>
   *     ArrayList&lt;Image&gt; imageList = new ArrayList&lt;Image&gt;();
   *     imageList.add(image);
   *     setIconImages(imageList);
   * </pre>
   * <p>
   * Note : Native windowing systems may use different images of differing
   * dimensions to represent a window, depending on the context (e.g.
   * window decoration, window list, taskbar, etc.). They could also use
   * just a single image for all contexts or no image at all.
   *
   * @param     image the icon image to be displayed.
   * @see       #setIconImages
   * @see       #getIconImages()
   * @since     1.6
   */
  setIconImage(image: Image): void {
    let imageList = new ArrayList();
    if (image != null) {
      imageList.add(image);
    }
    this.setIconImages(imageList);
  }
  /**
   * Makes this Window displayable by creating the connection to its
   * native screen resource.
   * This method is called internally by the toolkit and should
   * not be called directly by programs.
   * @see Component#isDisplayable
   * @see Container#removeNotify
   * @since 1.0
   */
  addNotify(): void {
    {
      let parent = this.parent;
      if (parent != null && parent.peer == null) {
        parent.addNotify();
      }
      if (this.peer == null) {
        this.peer = this.getComponentFactory().createWindow(this);
      }
      {
        Window.allWindows.add(this);
      }
      super.addNotify();
    }
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    {
      {
        Window.allWindows.remove(this);
      }
      super.removeNotify();
    }
  }
  /**
   * Causes this Window to be sized to fit the preferred size
   * and layouts of its subcomponents. The resulting width and
   * height of the window are automatically enlarged if either
   * of dimensions is less than the minimum size as specified
   * by the previous call to the {@code setMinimumSize} method.
   * <p>
   * If the window and/or its owner are not displayable yet,
   * both of them are made displayable before calculating
   * the preferred size. The Window is validated after its
   * size is being calculated.
   *
   * @see Component#isDisplayable
   * @see #setMinimumSize
   */
  pack(): void {
    let parent = this.parent;
    if (parent != null && parent.peer == null) {
      parent.addNotify();
    }
    if (this.peer == null) {
      this.addNotify();
    }
    let newSize = this.getPreferredSize$();
    if (this.peer != null) {
      this.setClientSize(newSize.width_, newSize.height_);
    }
    if (this.beforeFirstShow) {
      this.isPacked = true;
    }
    this.validateUnconditionally();
  }
  /**
   * Sets the minimum size of this window to a constant
   * value.  Subsequent calls to {@code getMinimumSize}
   * will always return this value. If current window's
   * size is less than {@code minimumSize} the size of the
   * window is automatically enlarged to honor the minimum size.
   * <p>
   * If the {@code setSize} or {@code setBounds} methods
   * are called afterwards with a width or height less than
   * that was specified by the {@code setMinimumSize} method
   * the window is automatically enlarged to meet
   * the {@code minimumSize} value. The {@code minimumSize}
   * value also affects the behaviour of the {@code pack} method.
   * <p>
   * The default behavior is restored by setting the minimum size
   * parameter to the {@code null} value.
   * <p>
   * Resizing operation may be restricted if the user tries
   * to resize window below the {@code minimumSize} value.
   * This behaviour is platform-dependent.
   *
   * @param minimumSize the new minimum size of this window
   * @see Component#setMinimumSize
   * @see #getMinimumSize
   * @see #isMinimumSizeSet
   * @see #setSize(Dimension)
   * @see #pack
   * @since 1.6
   */
  setMinimumSize(minimumSize: Dimension): void {
    {
      super.setMinimumSize(minimumSize);
      let size = this.getSize$();
      if (this.isMinimumSizeSet()) {
        if (size.width_ < minimumSize.width_ || size.height_ < minimumSize.height_) {
          let nw = Math.max(this.width_, minimumSize.width_);
          let nh = Math.max(this.height_, minimumSize.height_);
          this.setSize$int$int(nw, nh);
        }
      }
      if (this.peer != null) {
        (this.peer).updateMinimumSize();
      }
    }
  }
  /**
   * {@inheritDoc}
   * <p>
   * The {@code d.width} and {@code d.height} values
   * are automatically enlarged if either is less than
   * the minimum size as specified by previous call to
   * {@code setMinimumSize}.
   * <p>
   * The method changes the geometry-related data. Therefore,
   * the native windowing system may ignore such requests, or it may modify
   * the requested data, so that the {@code Window} object is placed and sized
   * in a way that corresponds closely to the desktop settings.
   *
   * @see #getSize
   * @see #setBounds
   * @see #setMinimumSize
   * @since 1.6
   */
  setSize$Dimension(d: Dimension): void {
    super.setSize$Dimension(d);
  }
  /**
   * {@inheritDoc}
   * <p>
   * The {@code width} and {@code height} values
   * are automatically enlarged if either is less than
   * the minimum size as specified by previous call to
   * {@code setMinimumSize}.
   * <p>
   * The method changes the geometry-related data. Therefore,
   * the native windowing system may ignore such requests, or it may modify
   * the requested data, so that the {@code Window} object is placed and sized
   * in a way that corresponds closely to the desktop settings.
   *
   * @see #getSize
   * @see #setBounds
   * @see #setMinimumSize
   * @since 1.6
   */
  setSize$int$int(width: number, height: number): void {
    super.setSize$int$int(width, height);
  }
  /**
   * {@inheritDoc}
   * <p>
   * The method changes the geometry-related data. Therefore,
   * the native windowing system may ignore such requests, or it may modify
   * the requested data, so that the {@code Window} object is placed and sized
   * in a way that corresponds closely to the desktop settings.
   */
  setLocation$int$int(x: number, y: number): void {
    super.setLocation$int$int(x, y);
  }
  /**
   * {@inheritDoc}
   * <p>
   * The method changes the geometry-related data. Therefore,
   * the native windowing system may ignore such requests, or it may modify
   * the requested data, so that the {@code Window} object is placed and sized
   * in a way that corresponds closely to the desktop settings.
   */
  setLocation$Point(p: Point): void {
    super.setLocation$Point(p);
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setBounds(int, int, int, int)}.
   */
  reshape(x: number, y: number, width: number, height: number): void {
    if (this.isMinimumSizeSet()) {
      let minSize = this.getMinimumSize$();
      if (width < minSize.width_) {
        width = minSize.width_;
      }
      if (height < minSize.height_) {
        height = minSize.height_;
      }
    }
    super.reshape(x, y, width, height);
  }
  setClientSize(w: number, h: number): void {
    {
      this.setBoundsOp(4);
      this.setBounds$int$int$int$int(this.x_, this.y_, w, h);
    }
  }
  closeSplashScreen(): void {
    if (this.isTrayIconWindow_) {
      return;
    }
    if (Window.beforeFirstWindowShown.getAndSet(false)) {
      SunToolkit.closeSplashScreen();
      SplashScreen.markClosed();
    }
  }
  /**
   * Shows or hides this {@code Window} depending on the value of parameter
   * {@code b}.
   * <p>
   * If the method shows the window then the window is also made
   * focused under the following conditions:
   * <ul>
   * <li> The {@code Window} meets the requirements outlined in the
   *      {@link #isFocusableWindow} method.
   * <li> The {@code Window}'s {@code autoRequestFocus} property is of the {@code true} value.
   * <li> Native windowing system allows the {@code Window} to get focused.
   * </ul>
   * There is an exception for the second condition (the value of the
   * {@code autoRequestFocus} property). The property is not taken into account if the
   * window is a modal dialog, which blocks the currently focused window.
   * <p>
   * Developers must never assume that the window is the focused or active window
   * until it receives a WINDOW_GAINED_FOCUS or WINDOW_ACTIVATED event.
   * @param b  if {@code true}, makes the {@code Window} visible,
   * otherwise hides the {@code Window}.
   * If the {@code Window} and/or its owner
   * are not yet displayable, both are made displayable.  The
   * {@code Window} will be validated prior to being made visible.
   * If the {@code Window} is already visible, this will bring the
   * {@code Window} to the front.<p>
   * If {@code false}, hides this {@code Window}, its subcomponents, and all
   * of its owned children.
   * The {@code Window} and its subcomponents can be made visible again
   * with a call to {@code #setVisible(true)}.
   * @see java.awt.Component#isDisplayable
   * @see java.awt.Component#setVisible
   * @see java.awt.Window#toFront
   * @see java.awt.Window#dispose
   * @see java.awt.Window#setAutoRequestFocus
   * @see java.awt.Window#isFocusableWindow
   */
  setVisible(b: boolean): void {
    super.setVisible(b);
  }
  /**
   * Makes the Window visible. If the Window and/or its owner
   * are not yet displayable, both are made displayable.  The
   * Window will be validated prior to being made visible.
   * If the Window is already visible, this will bring the Window
   * to the front.
   * @see       Component#isDisplayable
   * @see       #toFront
   * @deprecated As of JDK version 1.5, replaced by
   * {@link #setVisible(boolean)}.
   */
  show$(): void {
    if (this.peer == null) {
      this.addNotify();
    }
    this.validateUnconditionally();
    this.isInShow = true;
    if (this.visible) {
      this.toFront();
    } else {
      this.beforeFirstShow = false;
      this.closeSplashScreen();
      Dialog.checkShouldBeBlocked(this);
      super.show$();
      this.locationByPlatform = false;
      for (let i = 0; i < this.ownedWindowList.size(); i++) {
        let child = this.ownedWindowList.elementAt(i).get();
        if ((child != null) && child.showWithParent) {
          child.show$();
          child.showWithParent = false;
        }
      }
      if (!this.isModalBlocked()) {
        this.updateChildrenBlocking();
      } else {
        this.modalBlocker.toFront_NoClientCode();
      }
      if (this instanceof Frame || this instanceof Dialog) {
        Window.updateChildFocusableWindowState(this);
      }
    }
    this.isInShow = false;
    if ((this.state & Window.OPENED) === 0) {
      this.postWindowEvent(WindowEvent.WINDOW_OPENED);
      this.state |= Window.OPENED;
    }
  }
  static updateChildFocusableWindowState(w: Window): void {
    if (w.peer != null && w.isShowing()) {
      (w.peer).updateFocusableWindowState();
    }
    for (let i = 0; i < w.ownedWindowList.size(); i++) {
      let child = w.ownedWindowList.elementAt(i).get();
      if (child != null) {
        Window.updateChildFocusableWindowState(child);
      }
    }
  }
  postWindowEvent(id: number): void {
    if (this.windowListener != null || ($J.land(this.eventMask, AWTEvent.WINDOW_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.WINDOW_EVENT_MASK)) {
      let e = new WindowEvent()._WindowEvent$Window$int(this, id);
      Toolkit.getEventQueue().postEvent$AWTEvent(e);
    }
  }
  /**
   * Hide this Window, its subcomponents, and all of its owned children.
   * The Window and its subcomponents can be made visible again
   * with a call to {@code show}.
   * @see #show
   * @see #dispose
   * @deprecated As of JDK version 1.5, replaced by
   * {@link #setVisible(boolean)}.
   */
  hide(): void {
    {
      for (let i = 0; i < this.ownedWindowList.size(); i++) {
        let child = this.ownedWindowList.elementAt(i).get();
        if ((child != null) && child.visible) {
          child.hide();
          child.showWithParent = true;
        }
      }
    }
    if (this.isModalBlocked()) {
      this.modalBlocker.unblockWindow(this);
    }
    super.hide();
    this.locationByPlatform = false;
  }
  clearMostRecentFocusOwnerOnHide(): void {
  }
  /**
   * Releases all of the native screen resources used by this
   * {@code Window}, its subcomponents, and all of its owned
   * children. That is, the resources for these {@code Component}s
   * will be destroyed, any memory they consume will be returned to the
   * OS, and they will be marked as undisplayable.
   * <p>
   * The {@code Window} and its subcomponents can be made displayable
   * again by rebuilding the native resources with a subsequent call to
   * {@code pack} or {@code show}. The states of the recreated
   * {@code Window} and its subcomponents will be identical to the
   * states of these objects at the point where the {@code Window}
   * was disposed (not accounting for additional modifications between
   * those actions).
   * <p>
   * <b>Note</b>: When the last displayable window
   * within the Java virtual machine (VM) is disposed of, the VM may
   * terminate.  See <a href="doc-files/AWTThreadIssues.html#Autoshutdown">
   * AWT Threading Issues</a> for more information.
   * @see Component#isDisplayable
   * @see #pack
   * @see #show
   */
  dispose(): void {
    this.doDispose();
  }
  disposeImpl(): void {
    this.dispose();
    if (this.peer != null) {
      this.doDispose();
    }
  }
  doDispose(): void {
    // class DisposeAction: Window$1DisposeAction(), below
    let fireWindowClosedEvent = this.isDisplayable();
    let action = new (Window$1DisposeAction())().$o(this)._DisposeAction();
    if (EventQueue.isDispatchThread()) {
      action.run();
    } else {
      try {
        EventQueue.invokeAndWait$Object$Runnable(this, $J.fn(action, 'run'));
      } catch ($e1) {
        if ($J.isa($e1, InterruptedException)) {
          let e = $J.exc($e1);
          $J.err.println('Disposal was interrupted:');
          e.printStackTrace();
        } else if ($J.isa($e1, InvocationTargetException)) {
          let e = $J.exc($e1);
          $J.err.println('Exception during disposal:');
          e.printStackTrace();
        } else {
          throw $e1;
        }
      }
    }
    if (fireWindowClosedEvent) {
      this.postWindowEvent(WindowEvent.WINDOW_CLOSED);
    }
  }
  adjustListeningChildrenOnParent(mask: number, num: number): void {
  }
  adjustDescendantsOnParent(num: number): void {
  }
  /**
   * If this Window is visible, brings this Window to the front and may make
   * it the focused Window.
   * <p>
   * Places this Window at the top of the stacking order and shows it in
   * front of any other Windows in this VM. No action will take place if this
   * Window is not visible. Some platforms do not allow Windows which own
   * other Windows to appear on top of those owned Windows. Some platforms
   * may not permit this VM to place its Windows above windows of native
   * applications, or Windows of other VMs. This permission may depend on
   * whether a Window in this VM is already focused. Every attempt will be
   * made to move this Window as high as possible in the stacking order;
   * however, developers should not assume that this method will move this
   * Window above all other windows in every situation.
   * <p>
   * Developers must never assume that this Window is the focused or active
   * Window until this Window receives a WINDOW_GAINED_FOCUS or WINDOW_ACTIVATED
   * event. On platforms where the top-most window is the focused window, this
   * method will <b>probably</b> focus this Window (if it is not already focused)
   * under the following conditions:
   * <ul>
   * <li> The window meets the requirements outlined in the
   *      {@link #isFocusableWindow} method.
   * <li> The window's property {@code autoRequestFocus} is of the
   *      {@code true} value.
   * <li> Native windowing system allows the window to get focused.
   * </ul>
   * On platforms where the stacking order does not typically affect the focused
   * window, this method will <b>probably</b> leave the focused and active
   * Windows unchanged.
   * <p>
   * If this method causes this Window to be focused, and this Window is a
   * Frame or a Dialog, it will also become activated. If this Window is
   * focused, but it is not a Frame or a Dialog, then the first Frame or
   * Dialog that is an owner of this Window will be activated.
   * <p>
   * If this window is blocked by modal dialog, then the blocking dialog
   * is brought to the front and remains above the blocked window.
   *
   * @see       #toBack
   * @see       #setAutoRequestFocus
   * @see       #isFocusableWindow
   */
  toFront(): void {
    this.toFront_NoClientCode();
  }
  toFront_NoClientCode(): void {
    if (this.visible) {
      let peer = this.peer;
      if (peer != null) {
        peer.toFront();
      }
      if (this.isModalBlocked()) {
        this.modalBlocker.toFront_NoClientCode();
      }
    }
  }
  /**
   * Returns the toolkit of this frame.
   * @return    the toolkit of this window.
   * @see       Toolkit
   * @see       Toolkit#getDefaultToolkit
   * @see       Component#getToolkit
   */
  getToolkit(): Toolkit {
    return Toolkit.getDefaultToolkit();
  }
  setWarningString(): void {
    this.warningString = null;
    let sm = $J.system_getSecurityManager();
    if (sm != null) {
      try {
        sm.checkPermission(AWTPermissions.TOPLEVEL_WINDOW_PERMISSION);
      } catch ($e2) {
        if ($J.isa($e2, SecurityException)) {
          let se = $J.exc($e2);
          this.warningString = AccessController.doPrivileged(new GetPropertyAction('awt.appletWarning', 'Java Applet Window'));
        } else {
          throw $e2;
        }
      }
    }
  }
  /**
   * Gets the {@code Locale} object that is associated
   * with this window, if the locale has been set.
   * If no locale has been set, then the default locale
   * is returned.
   * @return    the locale that is set for this window.
   * @see       java.util.Locale
   * @since     1.1
   */
  getLocale$(): Locale {
    if (this.locale == null) {
      return Locale.getDefault();
    }
    return this.locale;
  }
  /**
   * Gets the input context for this window. A window always has an input context,
   * which is shared by subcomponents unless they create and set their own.
   * @see Component#getInputContext
   * @since 1.2
   */
  getInputContext(): InputContext {
    {
      if (this.inputContext == null) {
        this.inputContext = InputContext.getInstance();
      }
    }
    return this.inputContext;
  }
  /**
   * Set the cursor image to a specified cursor.
   * <p>
   * The method may have no visual effect if the Java platform
   * implementation and/or the native system do not support
   * changing the mouse cursor shape.
   * @param     cursor One of the constants defined
   *            by the {@code Cursor} class. If this parameter is null
   *            then the cursor for this window will be set to the type
   *            Cursor.DEFAULT_CURSOR.
   * @see       Component#getCursor
   * @see       Cursor
   * @since     1.1
   */
  setCursor$Cursor(cursor: Cursor): void {
    if (cursor == null) {
      cursor = Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR);
    }
    super.setCursor$Cursor(cursor);
  }
  /**
   * Returns the owner of this window.
   *
   * @return the owner of this window
   * @since 1.2
   */
  getOwner(): Window {
    return this.getOwner_NoClientCode();
  }
  getOwner_NoClientCode(): Window {
    return this.parent;
  }
  /**
   * Return an array containing all the windows this
   * window currently owns.
   *
   * @return the array of all the owned windows
   * @since 1.2
   */
  getOwnedWindows(): Window[] {
    return this.getOwnedWindows_NoClientCode();
  }
  getOwnedWindows_NoClientCode(): Window[] {
    let realCopy: Window[];
    {
      let fullSize = this.ownedWindowList.size();
      let realSize = 0;
      let fullCopy = $J.newArray(fullSize, null);
      for (let i = 0; i < fullSize; i++) {
        fullCopy[realSize] = this.ownedWindowList.elementAt(i).get();
        if (fullCopy[realSize] != null) {
          realSize++;
        }
      }
      if (fullSize !== realSize) {
        realCopy = Arrays.copyOf(fullCopy, realSize);
      } else {
        realCopy = fullCopy;
      }
    }
    return realCopy;
  }
  isModalBlocked(): boolean {
    return this.modalBlocker != null;
  }
  setModalBlocked(blocker: Dialog, blocked: boolean, peerCall: boolean): void {
    this.modalBlocker = blocked ? blocker : null;
    if (peerCall) {
      let peer = this.peer;
      if (peer != null) {
        peer.setModalBlocked(blocker, blocked);
      }
    }
  }
  getModalBlocker(): Dialog {
    return this.modalBlocker;
  }
  static getAllWindows(): IdentityArrayList<Window> {
    {
      let v = new IdentityArrayList()._IdentityArrayList$();
      v.addAll(Window.allWindows);
      return v;
    }
  }
  static getAllUnblockedWindows(): IdentityArrayList<Window> {
    {
      let unblocked = new IdentityArrayList()._IdentityArrayList$();
      for (let i = 0; i < Window.allWindows.size(); i++) {
        let w = Window.allWindows.get(i);
        if (!w.isModalBlocked()) {
          unblocked.add(w);
        }
      }
      return unblocked;
    }
  }
  static getWindows$AppContext(appContext: AppContext): Window[] {
    {
      let realCopy: Window[];
      let windowList = appContext.get($J.cls(Window));
      if (windowList != null) {
        let fullSize = windowList.size();
        let realSize = 0;
        let fullCopy = $J.newArray(fullSize, null);
        for (let i = 0; i < fullSize; i++) {
          let w = windowList.get(i).get();
          if (w != null) {
            fullCopy[realSize++] = w;
          }
        }
        if (fullSize !== realSize) {
          realCopy = Arrays.copyOf(fullCopy, realSize);
        } else {
          realCopy = fullCopy;
        }
      } else {
        realCopy = $J.newArray(0, null);
      }
      return realCopy;
    }
  }
  /**
   * Returns an array of all {@code Window}s, both owned and ownerless,
   * created by this application.
   * If called from an applet, the array includes only the {@code Window}s
   * accessible by that applet.
   * <p>
   * <b>Warning:</b> this method may return system created windows, such
   * as a print dialog. Applications should not assume the existence of
   * these dialogs, nor should an application assume anything about these
   * dialogs such as component positions, {@code LayoutManager}s
   * or serialization.
   *
   * @return the array of all the {@code Window}s created by the application
   * @see Frame#getFrames
   * @see Window#getOwnerlessWindows
   *
   * @since 1.6
   */
  static getWindows$(): Window[] {
    return Window.getWindows$AppContext(AppContext.getAppContext());
  }
  /**
   * Returns an array of all {@code Window}s created by this application
   * that have no owner. They include {@code Frame}s and ownerless
   * {@code Dialog}s and {@code Window}s.
   * If called from an applet, the array includes only the {@code Window}s
   * accessible by that applet.
   * <p>
   * <b>Warning:</b> this method may return system created windows, such
   * as a print dialog. Applications should not assume the existence of
   * these dialogs, nor should an application assume anything about these
   * dialogs such as component positions, {@code LayoutManager}s
   * or serialization.
   *
   * @return the array of all the ownerless {@code Window}s
   *         created by this application
   * @see Frame#getFrames
   * @see Window#getWindows()
   *
   * @since 1.6
   */
  static getOwnerlessWindows(): Window[] {
    let allWindows = Window.getWindows$();
    let ownerlessCount = 0;
    for (let w of allWindows) {
      if (w.getOwner() == null) {
        ownerlessCount++;
      }
    }
    let ownerless = $J.newArray(ownerlessCount, null);
    let c = 0;
    for (let w of allWindows) {
      if (w.getOwner() == null) {
        ownerless[c++] = w;
      }
    }
    return ownerless;
  }
  getDocumentRoot(): Window {
    {
      let w = this;
      while (w.getOwner() != null) {
        w = w.getOwner();
      }
      return w;
    }
  }
  isModalExcluded(exclusionType: Dialog$ModalExclusionType): boolean {
    if ((this.modalExclusionType != null) && this.modalExclusionType.compareTo(exclusionType) >= 0) {
      return true;
    }
    let owner = this.getOwner_NoClientCode();
    return (owner != null) && owner.isModalExcluded(exclusionType);
  }
  updateChildrenBlocking(): void {
    let childHierarchy = new ArrayList();
    let ownedWindows = this.getOwnedWindows();
    for (let i = 0; i < ownedWindows.length; i++) {
      childHierarchy.add(ownedWindows[i]);
    }
    let k = 0;
    while (k < childHierarchy.size()) {
      let w = childHierarchy.get(k);
      if (w.isVisible$()) {
        if (w.isModalBlocked()) {
          let blocker = w.getModalBlocker();
          blocker.unblockWindow(w);
        }
        Dialog.checkShouldBeBlocked(w);
        let wOwned = w.getOwnedWindows();
        for (let j = 0; j < wOwned.length; j++) {
          childHierarchy.add(wOwned[j]);
        }
      }
      k++;
    }
  }
  /**
   * Adds the specified window listener to receive window events from
   * this window.
   * If l is null, no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param   l the window listener
   * @see #removeWindowListener
   * @see #getWindowListeners
   */
  addWindowListener(l: WindowListener): void {
    if (l == null) {
      return;
    }
    this.newEventsOnly = true;
    this.windowListener = AWTEventMulticaster.add$WindowListener$WindowListener(this.windowListener, l);
  }
  /**
   * Adds the specified window focus listener to receive window events
   * from this window.
   * If l is null, no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param   l the window focus listener
   * @see #removeWindowFocusListener
   * @see #getWindowFocusListeners
   * @since 1.4
   */
  addWindowFocusListener(l: WindowFocusListener): void {
    if (l == null) {
      return;
    }
    this.windowFocusListener = AWTEventMulticaster.add$WindowFocusListener$WindowFocusListener(this.windowFocusListener, l);
    this.newEventsOnly = true;
  }
  /**
   * Removes the specified window listener so that it no longer
   * receives window events from this window.
   * If l is null, no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param   l the window listener
   * @see #addWindowListener
   * @see #getWindowListeners
   */
  removeWindowListener(l: WindowListener): void {
    if (l == null) {
      return;
    }
    this.windowListener = AWTEventMulticaster.remove$WindowListener$WindowListener(this.windowListener, l);
  }
  /**
   * Removes the specified window focus listener so that it no longer
   * receives window events from this window.
   * If l is null, no exception is thrown and no action is performed.
   * <p>Refer to <a href="doc-files/AWTThreadIssues.html#ListenersThreads"
   * >AWT Threading Issues</a> for details on AWT's threading model.
   *
   * @param   l the window focus listener
   * @see #addWindowFocusListener
   * @see #getWindowFocusListeners
   * @since 1.4
   */
  removeWindowFocusListener(l: WindowFocusListener): void {
    if (l == null) {
      return;
    }
    this.windowFocusListener = AWTEventMulticaster.remove$WindowFocusListener$WindowFocusListener(this.windowFocusListener, l);
  }
  /**
   * Returns an array of all the objects currently registered
   * as <code><em>Foo</em>Listener</code>s
   * upon this {@code Window}.
   * <code><em>Foo</em>Listener</code>s are registered using the
   * <code>add<em>Foo</em>Listener</code> method.
   *
   * <p>
   *
   * You can specify the {@code listenerType} argument
   * with a class literal, such as
   * <code><em>Foo</em>Listener.class</code>.
   * For example, you can query a
   * {@code Window w}
   * for its window listeners with the following code:
   *
   * <pre>WindowListener[] wls = (WindowListener[])(w.getListeners(WindowListener.class));</pre>
   *
   * If no such listeners exist, this method returns an empty array.
   *
   * @param listenerType the type of listeners requested; this parameter
   *          should specify an interface that descends from
   *          {@code java.util.EventListener}
   * @return an array of all objects registered as
   *          <code><em>Foo</em>Listener</code>s on this window,
   *          or an empty array if no such
   *          listeners have been added
   * @throws ClassCastException if {@code listenerType}
   *          doesn't specify a class or interface that implements
   *          {@code java.util.EventListener}
   * @throws NullPointerException if {@code listenerType} is {@code null}
   *
   * @see #getWindowListeners
   * @since 1.3
   */
  getListeners<T>(listenerType: JClass<T>): T[] {
    let l = null;
    if (listenerType === $J.cls(WindowFocusListener)) {
      l = this.windowFocusListener;
    } else if (listenerType === $J.cls(WindowStateListener)) {
      l = this.windowStateListener;
    } else if (listenerType === $J.cls(WindowListener)) {
      l = this.windowListener;
    } else {
      return super.getListeners(listenerType);
    }
    return AWTEventMulticaster.getListeners(l, listenerType);
  }
  eventEnabled(e: AWTEvent): boolean {
    switch (e.id_) {
      case WindowEvent.WINDOW_OPENED:
      case WindowEvent.WINDOW_CLOSING:
      case WindowEvent.WINDOW_CLOSED:
      case WindowEvent.WINDOW_ICONIFIED:
      case WindowEvent.WINDOW_DEICONIFIED:
      case WindowEvent.WINDOW_ACTIVATED:
      case WindowEvent.WINDOW_DEACTIVATED:
        if (($J.land(this.eventMask, AWTEvent.WINDOW_EVENT_MASK)) !== 0 || this.windowListener != null) {
          return true;
        }
        return false;
      case WindowEvent.WINDOW_GAINED_FOCUS:
      case WindowEvent.WINDOW_LOST_FOCUS:
        if (($J.land(this.eventMask, AWTEvent.WINDOW_FOCUS_EVENT_MASK)) !== 0 || this.windowFocusListener != null) {
          return true;
        }
        return false;
      case WindowEvent.WINDOW_STATE_CHANGED:
        if (($J.land(this.eventMask, AWTEvent.WINDOW_STATE_EVENT_MASK)) !== 0 || this.windowStateListener != null) {
          return true;
        }
        return false;
      default:
        break;
    }
    return super.eventEnabled(e);
  }
  /**
   * Processes events on this window. If the event is an
   * {@code WindowEvent}, it invokes the
   * {@code processWindowEvent} method, else it invokes its
   * superclass's {@code processEvent}.
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param e the event
   */
  processEvent(e: AWTEvent): void {
    if (e instanceof WindowEvent) {
      switch (e.getID()) {
        case WindowEvent.WINDOW_OPENED:
        case WindowEvent.WINDOW_CLOSING:
        case WindowEvent.WINDOW_CLOSED:
        case WindowEvent.WINDOW_ICONIFIED:
        case WindowEvent.WINDOW_DEICONIFIED:
        case WindowEvent.WINDOW_ACTIVATED:
        case WindowEvent.WINDOW_DEACTIVATED:
          this.processWindowEvent(e);
          break;
        case WindowEvent.WINDOW_GAINED_FOCUS:
        case WindowEvent.WINDOW_LOST_FOCUS:
          this.processWindowFocusEvent(e);
          break;
        case WindowEvent.WINDOW_STATE_CHANGED:
          this.processWindowStateEvent(e);
          break;
      }
      return;
    }
    super.processEvent(e);
  }
  /**
   * Processes window events occurring on this window by
   * dispatching them to any registered WindowListener objects.
   * NOTE: This method will not be called unless window events
   * are enabled for this component; this happens when one of the
   * following occurs:
   * <ul>
   * <li>A WindowListener object is registered via
   *     {@code addWindowListener}
   * <li>Window events are enabled via {@code enableEvents}
   * </ul>
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param e the window event
   * @see Component#enableEvents
   */
  processWindowEvent(e: WindowEvent): void {
    let listener = this.windowListener;
    if (listener != null) {
      switch (e.getID()) {
        case WindowEvent.WINDOW_OPENED:
          listener.windowOpened(e);
          break;
        case WindowEvent.WINDOW_CLOSING:
          listener.windowClosing(e);
          break;
        case WindowEvent.WINDOW_CLOSED:
          listener.windowClosed(e);
          break;
        case WindowEvent.WINDOW_ICONIFIED:
          listener.windowIconified(e);
          break;
        case WindowEvent.WINDOW_DEICONIFIED:
          listener.windowDeiconified(e);
          break;
        case WindowEvent.WINDOW_ACTIVATED:
          listener.windowActivated(e);
          break;
        case WindowEvent.WINDOW_DEACTIVATED:
          listener.windowDeactivated(e);
          break;
        default:
          break;
      }
    }
  }
  /**
   * Processes window focus event occurring on this window by
   * dispatching them to any registered WindowFocusListener objects.
   * NOTE: this method will not be called unless window focus events
   * are enabled for this window. This happens when one of the
   * following occurs:
   * <ul>
   * <li>a WindowFocusListener is registered via
   *     {@code addWindowFocusListener}
   * <li>Window focus events are enabled via {@code enableEvents}
   * </ul>
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param e the window focus event
   * @see Component#enableEvents
   * @since 1.4
   */
  processWindowFocusEvent(e: WindowEvent): void {
    let listener = this.windowFocusListener;
    if (listener != null) {
      switch (e.getID()) {
        case WindowEvent.WINDOW_GAINED_FOCUS:
          listener.windowGainedFocus(e);
          break;
        case WindowEvent.WINDOW_LOST_FOCUS:
          listener.windowLostFocus(e);
          break;
        default:
          break;
      }
    }
  }
  /**
   * Processes window state event occurring on this window by
   * dispatching them to any registered {@code WindowStateListener}
   * objects.
   * NOTE: this method will not be called unless window state events
   * are enabled for this window.  This happens when one of the
   * following occurs:
   * <ul>
   * <li>a {@code WindowStateListener} is registered via
   *    {@code addWindowStateListener}
   * <li>window state events are enabled via {@code enableEvents}
   * </ul>
   * <p>Note that if the event parameter is {@code null}
   * the behavior is unspecified and may result in an
   * exception.
   *
   * @param e the window state event
   * @see java.awt.Component#enableEvents
   * @since 1.4
   */
  processWindowStateEvent(e: WindowEvent): void {
    let listener = this.windowStateListener;
    if (listener != null) {
      switch (e.getID()) {
        case WindowEvent.WINDOW_STATE_CHANGED:
          listener.windowStateChanged(e);
          break;
        default:
          break;
      }
    }
  }
  /**
   * Implements a debugging hook -- checks to see if
   * the user has typed <i>control-shift-F1</i>.  If so,
   * the list of child windows is dumped to {@code System.out}.
   * @param e  the keyboard event
   */
  preProcessKeyEvent(e: KeyEvent): void {
    if (DebugSettings.getInstance().getBoolean('on', false)) {
      if (e.isActionKey() && e.getKeyCode() === KeyEvent.VK_F1 && e.isControlDown() && e.isShiftDown() && e.getID() === KeyEvent.KEY_PRESSED) {
        this.list$PrintStream$int($J.out, 0);
      }
    }
  }
  postProcessKeyEvent(e: KeyEvent): void {
  }
  /**
   * Sets whether this window should always be above other windows.  If
   * there are multiple always-on-top windows, their relative order is
   * unspecified and platform dependent.
   * <p>
   * If some other window is already always-on-top then the
   * relative order between these windows is unspecified (depends on
   * platform).  No window can be brought to be over the always-on-top
   * window except maybe another always-on-top window.
   * <p>
   * All windows owned by an always-on-top window inherit this state and
   * automatically become always-on-top.  If a window ceases to be
   * always-on-top, the windows that it owns will no longer be
   * always-on-top.  When an always-on-top window is sent {@link #toBack
   * toBack}, its always-on-top state is set to {@code false}.
   *
   * <p> When this method is called on a window with a value of
   * {@code true}, and the window is visible and the platform
   * supports always-on-top for this window, the window is immediately
   * brought forward, "sticking" it in the top-most position. If the
   * window isn`t currently visible, this method sets the always-on-top
   * state to {@code true} but does not bring the window forward.
   * When the window is later shown, it will be always-on-top.
   *
   * <p> When this method is called on a window with a value of
   * {@code false} the always-on-top state is set to normal. It may also
   * cause an unspecified, platform-dependent change in the z-order of
   * top-level windows, but other always-on-top windows will remain in
   * top-most position. Calling this method with a value of {@code false}
   * on a window that has a normal state has no effect.
   *
   * <p><b>Note</b>: some platforms might not support always-on-top
   * windows.  To detect if always-on-top windows are supported by the
   * current platform, use {@link Toolkit#isAlwaysOnTopSupported()} and
   * {@link Window#isAlwaysOnTopSupported()}.  If always-on-top mode
   * isn't supported for this window or this window's toolkit does not
   * support always-on-top windows, calling this method has no effect.
   * <p>
   * If a SecurityManager is installed, the calling thread must be
   * granted the AWTPermission "setWindowAlwaysOnTop" in
   * order to set the value of this property. If this
   * permission is not granted, this method will throw a
   * SecurityException, and the current value of the property will
   * be left unchanged.
   *
   * @param alwaysOnTop true if the window should always be above other
   *        windows
   * @throws SecurityException if the calling thread does not have
   *         permission to set the value of always-on-top property
   *
   * @see #isAlwaysOnTop
   * @see #toFront
   * @see #toBack
   * @see AWTPermission
   * @see #isAlwaysOnTopSupported
   * @see #getToolkit
   * @see Toolkit#isAlwaysOnTopSupported
   * @since 1.5
   */
  setAlwaysOnTop(alwaysOnTop: boolean): void {
    let security = $J.system_getSecurityManager();
    if (security != null) {
      security.checkPermission(AWTPermissions.SET_WINDOW_ALWAYS_ON_TOP_PERMISSION);
    }
    let oldAlwaysOnTop: boolean;
    {
      oldAlwaysOnTop = this.alwaysOnTop_;
      this.alwaysOnTop_ = alwaysOnTop;
    }
    if (oldAlwaysOnTop !== alwaysOnTop) {
      if (this.isAlwaysOnTopSupported()) {
        let peer = this.peer;
        {
          if (peer != null) {
            peer.updateAlwaysOnTopState();
          }
        }
      }
      this.firePropertyChange$String$boolean$boolean('alwaysOnTop', oldAlwaysOnTop, alwaysOnTop);
    }
    this.setOwnedWindowsAlwaysOnTop(alwaysOnTop);
  }
  setOwnedWindowsAlwaysOnTop(alwaysOnTop: boolean): void {
    let ownedWindowArray: WeakReference<Window>[];
    {
      ownedWindowArray = $J.newArray(this.ownedWindowList.size(), null);
      this.ownedWindowList.copyInto(ownedWindowArray);
    }
    for (let ref of ownedWindowArray) {
      let window = ref.get();
      if (window != null) {
        try {
          window.setAlwaysOnTop(alwaysOnTop);
        } catch ($e3) {
          if ($J.isa($e3, SecurityException)) {
            let ignore = $J.exc($e3);
          } else {
            throw $e3;
          }
        }
      }
    }
  }
  /**
   * Returns whether the always-on-top mode is supported for this
   * window. Some platforms may not support always-on-top windows, some
   * may support only some kinds of top-level windows; for example,
   * a platform may not support always-on-top modal dialogs.
   *
   * @return {@code true}, if the always-on-top mode is supported for
   *         this window and this window's toolkit supports always-on-top windows,
   *         {@code false} otherwise
   *
   * @see #setAlwaysOnTop(boolean)
   * @see #getToolkit
   * @see Toolkit#isAlwaysOnTopSupported
   * @since 1.6
   */
  isAlwaysOnTopSupported(): boolean {
    return Toolkit.getDefaultToolkit().isAlwaysOnTopSupported();
  }
  /**
   * Returns whether this window is an always-on-top window.
   * @return {@code true}, if the window is in always-on-top state,
   *         {@code false} otherwise
   * @see #setAlwaysOnTop
   * @since 1.5
   */
  isAlwaysOnTop(): boolean {
    return this.alwaysOnTop_;
  }
  /**
   * Returns the child Component of this Window that has focus if this Window
   * is focused; returns null otherwise.
   *
   * @return the child Component with focus, or null if this Window is not
   *         focused
   * @see #getMostRecentFocusOwner
   * @see #isFocused
   */
  getFocusOwner(): Component {
    return (this.isFocused()) ? KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner() : null;
  }
  /**
   * Returns the child Component of this Window that will receive the focus
   * when this Window is focused. If this Window is currently focused, this
   * method returns the same Component as {@code getFocusOwner()}. If
   * this Window is not focused, then the child Component that most recently
   * requested focus will be returned. If no child Component has ever
   * requested focus, and this is a focusable Window, then this Window's
   * initial focusable Component is returned. If no child Component has ever
   * requested focus, and this is a non-focusable Window, null is returned.
   *
   * @return the child Component that will receive focus when this Window is
   *         focused
   * @see #getFocusOwner
   * @see #isFocused
   * @see #isFocusableWindow
   * @since 1.4
   */
  getMostRecentFocusOwner(): Component {
    if (this.isFocused()) {
      return this.getFocusOwner();
    } else {
      let mostRecent = KeyboardFocusManager.getMostRecentFocusOwner(this);
      if (mostRecent != null) {
        return mostRecent;
      } else {
        return (this.isFocusableWindow()) ? this.getFocusTraversalPolicy().getInitialComponent$Window(this) : null;
      }
    }
  }
  /**
   * Returns whether this Window is active. Only a Frame or a Dialog may be
   * active. The native windowing system may denote the active Window or its
   * children with special decorations, such as a highlighted title bar. The
   * active Window is always either the focused Window, or the first Frame or
   * Dialog that is an owner of the focused Window.
   *
   * @return whether this is the active Window.
   * @see #isFocused
   * @since 1.4
   */
  isActive(): boolean {
    return (KeyboardFocusManager.getCurrentKeyboardFocusManager$().getActiveWindow() === this);
  }
  /**
   * Returns whether this Window is focused. If there exists a focus owner,
   * the focused Window is the Window that is, or contains, that focus owner.
   * If there is no focus owner, then no Window is focused.
   * <p>
   * If the focused Window is a Frame or a Dialog it is also the active
   * Window. Otherwise, the active Window is the first Frame or Dialog that
   * is an owner of the focused Window.
   *
   * @return whether this is the focused Window.
   * @see #isActive
   * @since 1.4
   */
  isFocused(): boolean {
    return (KeyboardFocusManager.getCurrentKeyboardFocusManager$().getGlobalFocusedWindow() === this);
  }
  /**
   * Gets a focus traversal key for this Window. (See {@code
   * setFocusTraversalKeys} for a full description of each key.)
   * <p>
   * If the traversal key has not been explicitly set for this Window,
   * then this Window's parent's traversal key is returned. If the
   * traversal key has not been explicitly set for any of this Window's
   * ancestors, then the current KeyboardFocusManager's default traversal key
   * is returned.
   *
   * @param id one of KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS,
   *         KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS,
   *         KeyboardFocusManager.UP_CYCLE_TRAVERSAL_KEYS, or
   *         KeyboardFocusManager.DOWN_CYCLE_TRAVERSAL_KEYS
   * @return the AWTKeyStroke for the specified key
   * @see Container#setFocusTraversalKeys
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
    let keystrokes = (this.focusTraversalKeys != null) ? this.focusTraversalKeys[id] : null;
    if (keystrokes != null) {
      return keystrokes;
    } else {
      return KeyboardFocusManager.getCurrentKeyboardFocusManager$().getDefaultFocusTraversalKeys(id);
    }
  }
  /**
   * Does nothing because Windows must always be roots of a focus traversal
   * cycle. The passed-in value is ignored.
   *
   * @param focusCycleRoot this value is ignored
   * @see #isFocusCycleRoot
   * @see Container#setFocusTraversalPolicy
   * @see Container#getFocusTraversalPolicy
   * @since 1.4
   */
  setFocusCycleRoot(focusCycleRoot: boolean): void {
  }
  /**
   * Always returns {@code true} because all Windows must be roots of a
   * focus traversal cycle.
   *
   * @return {@code true}
   * @see #setFocusCycleRoot
   * @see Container#setFocusTraversalPolicy
   * @see Container#getFocusTraversalPolicy
   * @since 1.4
   */
  isFocusCycleRoot$(): boolean {
    return true;
  }
  /**
   * Always returns {@code null} because Windows have no ancestors; they
   * represent the top of the Component hierarchy.
   *
   * @return {@code null}
   * @see Container#isFocusCycleRoot()
   * @since 1.4
   */
  getFocusCycleRootAncestor(): Container {
    return null;
  }
  /**
   * Returns whether this Window can become the focused Window, that is,
   * whether this Window or any of its subcomponents can become the focus
   * owner. For a Frame or Dialog to be focusable, its focusable Window state
   * must be set to {@code true}. For a Window which is not a Frame or
   * Dialog to be focusable, its focusable Window state must be set to
   * {@code true}, its nearest owning Frame or Dialog must be
   * showing on the screen, and it must contain at least one Component in
   * its focus traversal cycle. If any of these conditions is not met, then
   * neither this Window nor any of its subcomponents can become the focus
   * owner.
   *
   * @return {@code true} if this Window can be the focused Window;
   *         {@code false} otherwise
   * @see #getFocusableWindowState
   * @see #setFocusableWindowState
   * @see #isShowing
   * @see Component#isFocusable
   * @since 1.4
   */
  isFocusableWindow(): boolean {
    if (!this.getFocusableWindowState()) {
      return false;
    }
    if (this instanceof Frame || this instanceof Dialog) {
      return true;
    }
    if (this.getFocusTraversalPolicy().getDefaultComponent(this) == null) {
      return false;
    }
    for (let owner = this.getOwner(); owner != null; owner = owner.getOwner()) {
      if (owner instanceof Frame || owner instanceof Dialog) {
        return owner.isShowing();
      }
    }
    return false;
  }
  /**
   * Returns whether this Window can become the focused Window if it meets
   * the other requirements outlined in {@code isFocusableWindow}. If
   * this method returns {@code false}, then
   * {@code isFocusableWindow} will return {@code false} as well.
   * If this method returns {@code true}, then
   * {@code isFocusableWindow} may return {@code true} or
   * {@code false} depending upon the other requirements which must be
   * met in order for a Window to be focusable.
   * <p>
   * By default, all Windows have a focusable Window state of
   * {@code true}.
   *
   * @return whether this Window can be the focused Window
   * @see #isFocusableWindow
   * @see #setFocusableWindowState
   * @see #isShowing
   * @see Component#setFocusable
   * @since 1.4
   */
  getFocusableWindowState(): boolean {
    return this.focusableWindowState;
  }
  /**
   * Sets whether this Window can become the focused Window if it meets
   * the other requirements outlined in {@code isFocusableWindow}. If
   * this Window's focusable Window state is set to {@code false}, then
   * {@code isFocusableWindow} will return {@code false}. If this
   * Window's focusable Window state is set to {@code true}, then
   * {@code isFocusableWindow} may return {@code true} or
   * {@code false} depending upon the other requirements which must be
   * met in order for a Window to be focusable.
   * <p>
   * Setting a Window's focusability state to {@code false} is the
   * standard mechanism for an application to identify to the AWT a Window
   * which will be used as a floating palette or toolbar, and thus should be
   * a non-focusable Window.
   *
   * Setting the focusability state on a visible {@code Window}
   * can have a delayed effect on some platforms &#8212; the actual
   * change may happen only when the {@code Window} becomes
   * hidden and then visible again.  To ensure consistent behavior
   * across platforms, set the {@code Window}'s focusable state
   * when the {@code Window} is invisible and then show it.
   *
   * @param focusableWindowState whether this Window can be the focused
   *        Window
   * @see #isFocusableWindow
   * @see #getFocusableWindowState
   * @see #isShowing
   * @see Component#setFocusable
   * @since 1.4
   */
  setFocusableWindowState(focusableWindowState: boolean): void {
    let oldFocusableWindowState: boolean;
    {
      oldFocusableWindowState = this.focusableWindowState;
      this.focusableWindowState = focusableWindowState;
    }
    let peer = this.peer;
    if (peer != null) {
      peer.updateFocusableWindowState();
    }
    this.firePropertyChange$String$boolean$boolean('focusableWindowState', oldFocusableWindowState, focusableWindowState);
    if (oldFocusableWindowState && !focusableWindowState && this.isFocused()) {
      for (let owner = this.getOwner(); owner != null; owner = owner.getOwner()) {
        let toFocus = KeyboardFocusManager.getMostRecentFocusOwner(owner);
        if (toFocus != null && toFocus.requestFocus$boolean$Cause(false, FocusEvent$Cause.ACTIVATION)) {
          return;
        }
      }
      KeyboardFocusManager.getCurrentKeyboardFocusManager$().clearGlobalFocusOwnerPriv();
    }
  }
  /**
   * Adds a PropertyChangeListener to the listener list. The listener is
   * registered for all bound properties of this class, including the
   * following:
   * <ul>
   *    <li>this Window's font ("font")</li>
   *    <li>this Window's background color ("background")</li>
   *    <li>this Window's foreground color ("foreground")</li>
   *    <li>this Window's focusability ("focusable")</li>
   *    <li>this Window's focus traversal keys enabled state
   *        ("focusTraversalKeysEnabled")</li>
   *    <li>this Window's Set of FORWARD_TRAVERSAL_KEYS
   *        ("forwardFocusTraversalKeys")</li>
   *    <li>this Window's Set of BACKWARD_TRAVERSAL_KEYS
   *        ("backwardFocusTraversalKeys")</li>
   *    <li>this Window's Set of UP_CYCLE_TRAVERSAL_KEYS
   *        ("upCycleFocusTraversalKeys")</li>
   *    <li>this Window's Set of DOWN_CYCLE_TRAVERSAL_KEYS
   *        ("downCycleFocusTraversalKeys")</li>
   *    <li>this Window's focus traversal policy ("focusTraversalPolicy")
   *        </li>
   *    <li>this Window's focusable Window state ("focusableWindowState")
   *        </li>
   *    <li>this Window's always-on-top state("alwaysOnTop")</li>
   * </ul>
   * Note that if this Window is inheriting a bound property, then no
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
   * following:
   * <ul>
   *    <li>this Window's font ("font")</li>
   *    <li>this Window's background color ("background")</li>
   *    <li>this Window's foreground color ("foreground")</li>
   *    <li>this Window's focusability ("focusable")</li>
   *    <li>this Window's focus traversal keys enabled state
   *        ("focusTraversalKeysEnabled")</li>
   *    <li>this Window's Set of FORWARD_TRAVERSAL_KEYS
   *        ("forwardFocusTraversalKeys")</li>
   *    <li>this Window's Set of BACKWARD_TRAVERSAL_KEYS
   *        ("backwardFocusTraversalKeys")</li>
   *    <li>this Window's Set of UP_CYCLE_TRAVERSAL_KEYS
   *        ("upCycleFocusTraversalKeys")</li>
   *    <li>this Window's Set of DOWN_CYCLE_TRAVERSAL_KEYS
   *        ("downCycleFocusTraversalKeys")</li>
   *    <li>this Window's focus traversal policy ("focusTraversalPolicy")
   *        </li>
   *    <li>this Window's focusable Window state ("focusableWindowState")
   *        </li>
   *    <li>this Window's always-on-top state("alwaysOnTop")</li>
   * </ul>
   * Note that if this Window is inheriting a bound property, then no
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
   * Indicates if this container is a validate root.
   * <p>
   * {@code Window} objects are the validate roots, and, therefore, they
   * override this method to return {@code true}.
   *
   * @return {@code true}
   * @since 1.7
   * @see java.awt.Container#isValidateRoot
   */
  isValidateRoot$(): boolean {
    return true;
  }
  /**
   * Dispatches an event to this window or one of its sub components.
   * @param e the event
   */
  dispatchEventImpl(e: AWTEvent): void {
    if (e.getID() === ComponentEvent.COMPONENT_RESIZED) {
      this.invalidate();
      this.validate();
    }
    super.dispatchEventImpl(e);
  }
  /**
   * @deprecated As of JDK version 1.1
   * replaced by {@code dispatchEvent(AWTEvent)}.
   */
  postEvent(e: Event): boolean {
    if (this.handleEvent(e)) {
      e.consume();
      return true;
    }
    return false;
  }
  /**
   * Checks if this Window is showing on screen.
   * @see Component#setVisible
   */
  isShowing(): boolean {
    return this.visible;
  }
  isDisposing(): boolean {
    return this.disposing;
  }
  addOwnedWindow(weakWindow: WeakReference<Window>): void {
    if (weakWindow != null) {
      {
        if (!this.ownedWindowList.contains(weakWindow)) {
          this.ownedWindowList.addElement(weakWindow);
        }
      }
    }
  }
  removeOwnedWindow(weakWindow: WeakReference<Window>): void {
    if (weakWindow != null) {
      this.ownedWindowList.removeElement(weakWindow);
    }
  }
  addToWindowList(): void {
    {
      let windowList = this.appContext.get($J.cls(Window));
      if (windowList == null) {
        windowList = new Vector();
        this.appContext.put($J.cls(Window), windowList);
      }
      windowList.add(this.weakThis);
    }
  }
  static removeFromWindowList(context: AppContext, weakThis: WeakReference<Window>): void {
    {
      let windowList = context.get($J.cls(Window));
      if (windowList != null) {
        windowList.remove(weakThis);
      }
    }
  }
  /**
   * Sets the type of the window.
   *
   * This method can only be called while the window is not displayable.
   *
   * @param  type the window type
   * @throws IllegalComponentStateException if the window
   *         is displayable.
   * @throws IllegalArgumentException if the type is {@code null}
   * @see    Component#isDisplayable
   * @see    #getType
   * @since 1.7
   */
  setType(type$: Window$Type): void {
    if (type$ == null) {
      throw new IllegalArgumentException('type should not be null.');
    }
    {
      if (this.isDisplayable()) {
        throw new IllegalComponentStateException()._IllegalComponentStateException$String('The window is displayable.');
      }
      {
        this.type = type$;
      }
    }
  }
  /**
   * Gets the AccessibleContext associated with this Window.
   * For windows, the AccessibleContext takes the form of an
   * AccessibleAWTWindow.
   * A new AccessibleAWTWindow instance is created if necessary.
   *
   * @return an AccessibleAWTWindow that serves as the
   *         AccessibleContext of this Window
   * @since 1.3
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new Window$AccessibleAWTWindow().$o(this)._Window$AccessibleAWTWindow();
    }
    return this.accessibleContext;
  }
  setGraphicsConfiguration(gc: GraphicsConfiguration): void {
    if (gc == null) {
      gc = GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDefaultConfiguration();
    }
    {
      super.setGraphicsConfiguration(gc);
      if (Window.log.isLoggable(PlatformLogger_Level.FINER)) {
        Window.log.finer('+ Window.setGraphicsConfiguration(): new GC is \n+ ' + $J.str(this.getGraphicsConfiguration_NoClientCode()) + '\n+ this is ' + $J.str(this));
      }
    }
  }
  /**
   * Sets the location of the window relative to the specified
   * component according to the following scenarios.
   * <p>
   * The target screen mentioned below is a screen to which
   * the window should be placed after the setLocationRelativeTo
   * method is called.
   * <ul>
   * <li>If the component is {@code null}, or the {@code
   * GraphicsConfiguration} associated with this component is
   * {@code null}, the window is placed in the center of the
   * screen. The center point can be obtained with the {@link
   * GraphicsEnvironment#getCenterPoint
   * GraphicsEnvironment.getCenterPoint} method.
   * <li>If the component is not {@code null}, but it is not
   * currently showing, the window is placed in the center of
   * the target screen defined by the {@code
   * GraphicsConfiguration} associated with this component.
   * <li>If the component is not {@code null} and is shown on
   * the screen, then the window is located in such a way that
   * the center of the window coincides with the center of the
   * component.
   * </ul>
   * <p>
   * If the screens configuration does not allow the window to
   * be moved from one screen to another, then the window is
   * only placed at the location determined according to the
   * above conditions and its {@code GraphicsConfiguration} is
   * not changed.
   * <p>
   * <b>Note</b>: If the lower edge of the window is out of the screen,
   * then the window is placed to the side of the {@code Component}
   * that is closest to the center of the screen. So if the
   * component is on the right part of the screen, the window
   * is placed to its left, and vice versa.
   * <p>
   * If after the window location has been calculated, the upper,
   * left, or right edge of the window is out of the screen,
   * then the window is located in such a way that the upper,
   * left, or right edge of the window coincides with the
   * corresponding edge of the screen. If both left and right
   * edges of the window are out of the screen, the window is
   * placed at the left side of the screen. The similar placement
   * will occur if both top and bottom edges are out of the screen.
   * In that case, the window is placed at the top side of the screen.
   * <p>
   * The method changes the geometry-related data. Therefore,
   * the native windowing system may ignore such requests, or it may modify
   * the requested data, so that the {@code Window} object is placed and sized
   * in a way that corresponds closely to the desktop settings.
   *
   * @param c  the component in relation to which the window's location
   *           is determined
   * @see java.awt.GraphicsEnvironment#getCenterPoint
   * @since 1.4
   */
  setLocationRelativeTo(c: Component): void {
    let dx = 0;
    let dy = 0;
    let gc = this.getGraphicsConfiguration_NoClientCode();
    let gcBounds = gc.getBounds();
    let windowSize = this.getSize$();
    let componentWindow = SunToolkit.getContainingWindow(c);
    if ((c == null) || (componentWindow == null)) {
      let ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
      gc = ge.getDefaultScreenDevice().getDefaultConfiguration();
      gcBounds = gc.getBounds();
      let centerPoint = ge.getCenterPoint();
      dx = (centerPoint.x_ - $J.idiv(windowSize.width_, 2)) | 0;
      dy = (centerPoint.y_ - $J.idiv(windowSize.height_, 2)) | 0;
    } else if (!c.isShowing()) {
      gc = componentWindow.getGraphicsConfiguration();
      gcBounds = gc.getBounds();
      dx = (gcBounds.x_ + $J.idiv(((gcBounds.width_ - windowSize.width_) | 0), 2)) | 0;
      dy = (gcBounds.y_ + $J.idiv(((gcBounds.height_ - windowSize.height_) | 0), 2)) | 0;
    } else {
      gc = componentWindow.getGraphicsConfiguration();
      gcBounds = gc.getBounds();
      let compSize = c.getSize$();
      let compLocation = c.getLocationOnScreen();
      dx = (compLocation.x_ + ($J.idiv(((compSize.width_ - windowSize.width_) | 0), 2))) | 0;
      dy = (compLocation.y_ + ($J.idiv(((compSize.height_ - windowSize.height_) | 0), 2))) | 0;
      if (((dy + windowSize.height_) | 0) > ((gcBounds.y_ + gcBounds.height_) | 0)) {
        dy = (gcBounds.y_ + gcBounds.height_ - windowSize.height_) | 0;
        if (((compLocation.x_ - gcBounds.x_ + $J.idiv(compSize.width_, 2)) | 0) < $J.idiv(gcBounds.width_, 2)) {
          dx = (compLocation.x_ + compSize.width_) | 0;
        } else {
          dx = (compLocation.x_ - windowSize.width_) | 0;
        }
      }
    }
    if (((dy + windowSize.height_) | 0) > ((gcBounds.y_ + gcBounds.height_) | 0)) {
      dy = (gcBounds.y_ + gcBounds.height_ - windowSize.height_) | 0;
    }
    if (dy < gcBounds.y_) {
      dy = gcBounds.y_;
    }
    if (((dx + windowSize.width_) | 0) > ((gcBounds.x_ + gcBounds.width_) | 0)) {
      dx = (gcBounds.x_ + gcBounds.width_ - windowSize.width_) | 0;
    }
    if (dx < gcBounds.x_) {
      dx = gcBounds.x_;
    }
    this.setLocation$int$int(dx, dy);
  }
  /**
   * Overridden from Component.  Top-level Windows don't dispatch to ancestors
   */
  dispatchMouseWheelToAncestor(e: MouseWheelEvent): boolean {
    return false;
  }
  /**
   * Creates a new strategy for multi-buffering on this component with the
   * required buffer capabilities.  This is useful, for example, if only
   * accelerated memory or page flipping is desired (as specified by the
   * buffer capabilities).
   * <p>
   * Each time this method
   * is called, the existing buffer strategy for this component is discarded.
   * @param numBuffers number of buffers to create, including the front buffer
   * @param caps the required capabilities for creating the buffer strategy;
   * cannot be {@code null}
   * @throws AWTException if the capabilities supplied could not be
   * supported or met; this may happen, for example, if there is not enough
   * accelerated memory currently available, or if page flipping is specified
   * but not possible.
   * @throws IllegalArgumentException if numBuffers is less than 1, or if
   * caps is {@code null}
   * @see #getBufferStrategy
   * @since 1.4
   */
  createBufferStrategy$int$BufferCapabilities(numBuffers: number, caps: BufferCapabilities): void {
    super.createBufferStrategy$int$BufferCapabilities(numBuffers, caps);
  }
  /**
   * Returns the {@code BufferStrategy} used by this component.  This
   * method will return null if a {@code BufferStrategy} has not yet
   * been created or has been disposed.
   *
   * @return the buffer strategy used by this component
   * @see #createBufferStrategy
   * @since 1.4
   */
  getBufferStrategy(): BufferStrategy {
    return super.getBufferStrategy();
  }
  getTemporaryLostComponent(): Component {
    return this.temporaryLostComponent;
  }
  setTemporaryLostComponent(component: Component): Component {
    let previousComp = this.temporaryLostComponent;
    if (component == null || component.canBeFocusOwner()) {
      this.temporaryLostComponent = component;
    } else {
      this.temporaryLostComponent = null;
    }
    return previousComp;
  }
  /**
   * Checks whether this window can contain focus owner.
   * Verifies that it is focusable and as container it can container focus owner.
   * @since 1.5
   */
  canContainFocusOwner(focusOwnerCandidate: Component): boolean {
    return super.canContainFocusOwner(focusOwnerCandidate) && this.isFocusableWindow();
  }
  /**
   * Sets whether this Window should appear at the default location for the
   * native windowing system or at the current location (returned by
   * {@code getLocation}) the next time the Window is made visible.
   * This behavior resembles a native window shown without programmatically
   * setting its location.  Most windowing systems cascade windows if their
   * locations are not explicitly set. The actual location is determined once the
   * window is shown on the screen.
   * <p>
   * This behavior can also be enabled by setting the System Property
   * "java.awt.Window.locationByPlatform" to "true", though calls to this method
   * take precedence.
   * <p>
   * Calls to {@code setVisible}, {@code setLocation} and
   * {@code setBounds} after calling {@code setLocationByPlatform} clear
   * this property of the Window.
   * <p>
   * For example, after the following code is executed:
   * <pre>
   * setLocationByPlatform(true);
   * setVisible(true);
   * boolean flag = isLocationByPlatform();
   * </pre>
   * The window will be shown at platform's default location and
   * {@code flag} will be {@code false}.
   * <p>
   * In the following sample:
   * <pre>
   * setLocationByPlatform(true);
   * setLocation(10, 10);
   * boolean flag = isLocationByPlatform();
   * setVisible(true);
   * </pre>
   * The window will be shown at (10, 10) and {@code flag} will be
   * {@code false}.
   *
   * @param locationByPlatform {@code true} if this Window should appear
   *        at the default location, {@code false} if at the current location
   * @throws IllegalComponentStateException if the window
   *         is showing on screen and locationByPlatform is {@code true}.
   * @see #setLocation
   * @see #isShowing
   * @see #setVisible
   * @see #isLocationByPlatform
   * @see java.lang.System#getProperty(String)
   * @since 1.5
   */
  setLocationByPlatform(locationByPlatform: boolean): void {
    {
      if (locationByPlatform && this.isShowing()) {
        throw new IllegalComponentStateException()._IllegalComponentStateException$String('The window is showing on screen.');
      }
      this.locationByPlatform = locationByPlatform;
    }
  }
  /**
   * {@inheritDoc}
   * <p>
   * The {@code width} or {@code height} values
   * are automatically enlarged if either is less than
   * the minimum size as specified by previous call to
   * {@code setMinimumSize}.
   * <p>
   * The method changes the geometry-related data. Therefore,
   * the native windowing system may ignore such requests, or it may modify
   * the requested data, so that the {@code Window} object is placed and sized
   * in a way that corresponds closely to the desktop settings.
   *
   * @see #getBounds
   * @see #setLocation(int, int)
   * @see #setLocation(Point)
   * @see #setSize(int, int)
   * @see #setSize(Dimension)
   * @see #setMinimumSize
   * @see #setLocationByPlatform
   * @see #isLocationByPlatform
   * @since 1.6
   */
  setBounds$int$int$int$int(x: number, y: number, width: number, height: number): void {
    {
      if (this.getBoundsOp() === 1 || this.getBoundsOp() === 3) {
        this.locationByPlatform = false;
      }
      super.setBounds$int$int$int$int(x, y, width, height);
    }
  }
  /**
   * {@inheritDoc}
   * <p>
   * The {@code r.width} or {@code r.height} values
   * will be automatically enlarged if either is less than
   * the minimum size as specified by previous call to
   * {@code setMinimumSize}.
   * <p>
   * The method changes the geometry-related data. Therefore,
   * the native windowing system may ignore such requests, or it may modify
   * the requested data, so that the {@code Window} object is placed and sized
   * in a way that corresponds closely to the desktop settings.
   *
   * @see #getBounds
   * @see #setLocation(int, int)
   * @see #setLocation(Point)
   * @see #setSize(int, int)
   * @see #setSize(Dimension)
   * @see #setMinimumSize
   * @see #setLocationByPlatform
   * @see #isLocationByPlatform
   * @since 1.6
   */
  setBounds$Rectangle(r: Rectangle): void {
    this.setBounds$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
  }
  /**
   * Determines whether this component will be displayed on the screen.
   * @return {@code true} if the component and all of its ancestors
   *          until a toplevel window are visible, {@code false} otherwise
   */
  isRecursivelyVisible(): boolean {
    return this.visible;
  }
  /**
   * Returns the opacity of the window.
   *
   * @return the opacity of the window
   *
   * @see Window#setOpacity(float)
   * @see GraphicsDevice.WindowTranslucency
   *
   * @since 1.7
   */
  getOpacity(): number {
    return this.opacity;
  }
  /**
   * Sets the opacity of the window.
   * <p>
   * The opacity value is in the range [0..1]. Note that setting the opacity
   * level of 0 may or may not disable the mouse event handling on this
   * window. This is a platform-dependent behavior.
   * <p>
   * The following conditions must be met in order to set the opacity value
   * less than {@code 1.0f}:
   * <ul>
   * <li>The {@link GraphicsDevice.WindowTranslucency#TRANSLUCENT TRANSLUCENT}
   * translucency must be supported by the underlying system
   * <li>The window must be undecorated (see {@link Frame#setUndecorated}
   * and {@link Dialog#setUndecorated})
   * <li>The window must not be in full-screen mode (see {@link
   * GraphicsDevice#setFullScreenWindow(Window)})
   * </ul>
   * <p>
   * If the requested opacity value is less than {@code 1.0f}, and any of the
   * above conditions are not met, the window opacity will not change,
   * and the {@code IllegalComponentStateException} will be thrown.
   * <p>
   * The translucency levels of individual pixels may also be effected by the
   * alpha component of their color (see {@link Window#setBackground(Color)}) and the
   * current shape of this window (see {@link #setShape(Shape)}).
   *
   * @param opacity the opacity level to set to the window
   *
   * @throws IllegalArgumentException if the opacity is out of the range
   *     [0..1]
   * @throws IllegalComponentStateException if the window is decorated and
   *     the opacity is less than {@code 1.0f}
   * @throws IllegalComponentStateException if the window is in full screen
   *     mode, and the opacity is less than {@code 1.0f}
   * @throws UnsupportedOperationException if the {@code
   *     GraphicsDevice.WindowTranslucency#TRANSLUCENT TRANSLUCENT}
   *     translucency is not supported and the opacity is less than
   *     {@code 1.0f}
   *
   * @see Window#getOpacity
   * @see Window#setBackground(Color)
   * @see Window#setShape(Shape)
   * @see Frame#isUndecorated
   * @see Dialog#isUndecorated
   * @see GraphicsDevice.WindowTranslucency
   * @see GraphicsDevice#isWindowTranslucencySupported(GraphicsDevice.WindowTranslucency)
   *
   * @since 1.7
   */
  setOpacity(opacity: number): void {
    {
      if (opacity < 0 || opacity > 1) {
        throw new IllegalArgumentException('The value of opacity should be in the range [0.0f .. 1.0f].');
      }
      if (opacity < 1) {
        let gc = this.getGraphicsConfiguration();
        let gd = gc.getDevice();
        if (gc.getDevice().getFullScreenWindow() === this) {
          throw new IllegalComponentStateException()._IllegalComponentStateException$String('Setting opacity for full-screen window is not supported.');
        }
        if (!gd.isWindowTranslucencySupported(GraphicsDevice$WindowTranslucency.TRANSLUCENT)) {
          throw new UnsupportedOperationException('TRANSLUCENT translucency is not supported.');
        }
      }
      this.opacity = opacity;
      let peer = this.peer;
      if (peer != null) {
        peer.setOpacity(opacity);
      }
    }
  }
  /**
   * Returns the shape of the window.
   *
   * The value returned by this method may not be the same as
   * previously set with {@code setShape(shape)}, but it is guaranteed
   * to represent the same shape.
   *
   * @return the shape of the window or {@code null} if no
   *     shape is specified for the window
   *
   * @see Window#setShape(Shape)
   * @see GraphicsDevice.WindowTranslucency
   *
   * @since 1.7
   */
  getShape(): Shape {
    {
      return this.shape_ == null ? null : new Path2D$Float()._Path2D$Float$Shape(this.shape_);
    }
  }
  /**
   * Sets the shape of the window.
   * <p>
   * Setting a shape cuts off some parts of the window. Only the parts that
   * belong to the given {@link Shape} remain visible and clickable. If
   * the shape argument is {@code null}, this method restores the default
   * shape, making the window rectangular on most platforms.
   * <p>
   * The following conditions must be met to set a non-null shape:
   * <ul>
   * <li>The {@link GraphicsDevice.WindowTranslucency#PERPIXEL_TRANSPARENT
   * PERPIXEL_TRANSPARENT} translucency must be supported by the
   * underlying system
   * <li>The window must be undecorated (see {@link Frame#setUndecorated}
   * and {@link Dialog#setUndecorated})
   * <li>The window must not be in full-screen mode (see {@link
   * GraphicsDevice#setFullScreenWindow(Window)})
   * </ul>
   * <p>
   * If the requested shape is not {@code null}, and any of the above
   * conditions are not met, the shape of this window will not change,
   * and either the {@code UnsupportedOperationException} or {@code
   * IllegalComponentStateException} will be thrown.
   * <p>
   * The translucency levels of individual pixels may also be effected by the
   * alpha component of their color (see {@link Window#setBackground(Color)}) and the
   * opacity value (see {@link #setOpacity(float)}). See {@link
   * GraphicsDevice.WindowTranslucency} for more details.
   *
   * @param shape the shape to set to the window
   *
   * @throws IllegalComponentStateException if the shape is not {@code
   *     null} and the window is decorated
   * @throws IllegalComponentStateException if the shape is not {@code
   *     null} and the window is in full-screen mode
   * @throws UnsupportedOperationException if the shape is not {@code
   *     null} and {@link GraphicsDevice.WindowTranslucency#PERPIXEL_TRANSPARENT
   *     PERPIXEL_TRANSPARENT} translucency is not supported
   *
   * @see Window#getShape()
   * @see Window#setBackground(Color)
   * @see Window#setOpacity(float)
   * @see Frame#isUndecorated
   * @see Dialog#isUndecorated
   * @see GraphicsDevice.WindowTranslucency
   * @see GraphicsDevice#isWindowTranslucencySupported(GraphicsDevice.WindowTranslucency)
   *
   * @since 1.7
   */
  setShape(shape: Shape): void {
    {
      if (shape != null) {
        let gc = this.getGraphicsConfiguration();
        let gd = gc.getDevice();
        if (gc.getDevice().getFullScreenWindow() === this) {
          throw new IllegalComponentStateException()._IllegalComponentStateException$String('Setting shape for full-screen window is not supported.');
        }
        if (!gd.isWindowTranslucencySupported(GraphicsDevice$WindowTranslucency.PERPIXEL_TRANSPARENT)) {
          throw new UnsupportedOperationException('PERPIXEL_TRANSPARENT translucency is not supported.');
        }
      }
      this.shape_ = (shape == null) ? null : new Path2D$Float()._Path2D$Float$Shape(shape);
      let peer = this.peer;
      if (peer != null) {
        peer.applyShape(shape == null ? null : Region.getInstance(shape, null));
      }
    }
  }
  /**
   * Gets the background color of this window.
   * <p>
   * Note that the alpha component of the returned color indicates whether
   * the window is in the non-opaque (per-pixel translucent) mode.
   *
   * @return this component's background color
   *
   * @see Window#setBackground(Color)
   * @see Window#isOpaque
   * @see GraphicsDevice.WindowTranslucency
   */
  getBackground(): Color {
    return super.getBackground();
  }
  /**
   * Sets the background color of this window.
   * <p>
   * If the windowing system supports the {@link
   * GraphicsDevice.WindowTranslucency#PERPIXEL_TRANSLUCENT PERPIXEL_TRANSLUCENT}
   * translucency, the alpha component of the given background color
   * may effect the mode of operation for this window: it indicates whether
   * this window must be opaque (alpha equals {@code 1.0f}) or per-pixel translucent
   * (alpha is less than {@code 1.0f}). If the given background color is
   * {@code null}, the window is considered completely opaque.
   * <p>
   * All the following conditions must be met to enable the per-pixel
   * transparency mode for this window:
   * <ul>
   * <li>The {@link GraphicsDevice.WindowTranslucency#PERPIXEL_TRANSLUCENT
   * PERPIXEL_TRANSLUCENT} translucency must be supported by the graphics
   * device where this window is located
   * <li>The window must be undecorated (see {@link Frame#setUndecorated}
   * and {@link Dialog#setUndecorated})
   * <li>The window must not be in full-screen mode (see {@link
   * GraphicsDevice#setFullScreenWindow(Window)})
   * </ul>
   * <p>
   * If the alpha component of the requested background color is less than
   * {@code 1.0f}, and any of the above conditions are not met, the background
   * color of this window will not change, the alpha component of the given
   * background color will not affect the mode of operation for this window,
   * and either the {@code UnsupportedOperationException} or {@code
   * IllegalComponentStateException} will be thrown.
   * <p>
   * When the window is per-pixel translucent, the drawing sub-system
   * respects the alpha value of each individual pixel. If a pixel gets
   * painted with the alpha color component equal to zero, it becomes
   * visually transparent. If the alpha of the pixel is equal to 1.0f, the
   * pixel is fully opaque. Interim values of the alpha color component make
   * the pixel semi-transparent. In this mode, the background of the window
   * gets painted with the alpha value of the given background color. If the
   * alpha value of the argument of this method is equal to {@code 0}, the
   * background is not painted at all.
   * <p>
   * The actual level of translucency of a given pixel also depends on window
   * opacity (see {@link #setOpacity(float)}), as well as the current shape of
   * this window (see {@link #setShape(Shape)}).
   * <p>
   * Note that painting a pixel with the alpha value of {@code 0} may or may
   * not disable the mouse event handling on this pixel. This is a
   * platform-dependent behavior. To make sure the mouse events do not get
   * dispatched to a particular pixel, the pixel must be excluded from the
   * shape of the window.
   * <p>
   * Enabling the per-pixel translucency mode may change the graphics
   * configuration of this window due to the native platform requirements.
   *
   * @param bgColor the color to become this window's background color.
   *
   * @throws IllegalComponentStateException if the alpha value of the given
   *     background color is less than {@code 1.0f} and the window is decorated
   * @throws IllegalComponentStateException if the alpha value of the given
   *     background color is less than {@code 1.0f} and the window is in
   *     full-screen mode
   * @throws UnsupportedOperationException if the alpha value of the given
   *     background color is less than {@code 1.0f} and {@link
   *     GraphicsDevice.WindowTranslucency#PERPIXEL_TRANSLUCENT
   *     PERPIXEL_TRANSLUCENT} translucency is not supported
   *
   * @see Window#getBackground
   * @see Window#isOpaque
   * @see Window#setOpacity(float)
   * @see Window#setShape(Shape)
   * @see Frame#isUndecorated
   * @see Dialog#isUndecorated
   * @see GraphicsDevice.WindowTranslucency
   * @see GraphicsDevice#isWindowTranslucencySupported(GraphicsDevice.WindowTranslucency)
   * @see GraphicsConfiguration#isTranslucencyCapable()
   */
  setBackground(bgColor: Color): void {
    let oldBg = this.getBackground();
    super.setBackground(bgColor);
    if (oldBg != null && oldBg.equals(bgColor)) {
      return;
    }
    let oldAlpha = oldBg != null ? oldBg.getAlpha() : 255;
    let alpha = bgColor != null ? bgColor.getAlpha() : 255;
    if ((oldAlpha === 255) && (alpha < 255)) {
      let gc = this.getGraphicsConfiguration();
      let gd = gc.getDevice();
      if (gc.getDevice().getFullScreenWindow() === this) {
        throw new IllegalComponentStateException()._IllegalComponentStateException$String('Making full-screen window non opaque is not supported.');
      }
      if (!gc.isTranslucencyCapable()) {
        let capableGC = gd.getTranslucencyCapableGC();
        if (capableGC == null) {
          throw new UnsupportedOperationException('PERPIXEL_TRANSLUCENT translucency is not supported');
        }
        this.setGraphicsConfiguration(capableGC);
      }
      Window.setLayersOpaque(this, false);
    } else if ((oldAlpha < 255) && (alpha === 255)) {
      Window.setLayersOpaque(this, true);
    }
    let peer = this.peer;
    if (peer != null) {
      peer.setOpaque(alpha === 255);
    }
  }
  /**
   * Indicates if the window is currently opaque.
   * <p>
   * The method returns {@code false} if the background color of the window
   * is not {@code null} and the alpha component of the color is less than
   * {@code 1.0f}. The method returns {@code true} otherwise.
   *
   * @return {@code true} if the window is opaque, {@code false} otherwise
   *
   * @see Window#getBackground
   * @see Window#setBackground(Color)
   * @since 1.7
   */
  isOpaque(): boolean {
    let bg = this.getBackground();
    return bg != null ? bg.getAlpha() === 255 : true;
  }
  updateWindow(): void {
    {
      let peer = this.peer;
      if (peer != null) {
        peer.updateWindow();
      }
    }
  }
  /**
   * {@inheritDoc}
   *
   * @since 1.7
   */
  paint(g: Graphics): void {
    if (!this.isOpaque()) {
      let gg = g.create$();
      try {
        if (gg instanceof Graphics2D) {
          gg.setColor(this.getBackground());
          (gg).setComposite(AlphaComposite.getInstance$int(AlphaComposite.SRC));
          gg.fillRect(0, 0, this.getWidth(), this.getHeight());
        }
      } finally {
        gg.dispose();
      }
    }
    super.paint(g);
  }
  static setLayersOpaque(component: Component, isOpaque: boolean): void {
    if (SunToolkit.isInstanceOf(component, 'javax.swing.RootPaneContainer')) {
      let rpc = component;
      let root = rpc.getRootPane();
      let lp = root.getLayeredPane();
      let c = root.getContentPane();
      let content = (c instanceof JComponent) ? c : null;
      lp.setOpaque(isOpaque);
      root.setOpaque(isOpaque);
      if (content != null) {
        content.setOpaque(isOpaque);
        let numChildren = content.getComponentCount();
        if (numChildren > 0) {
          let child = content.getComponent$int(0);
          if ($J.isa(child, RootPaneContainer)) {
            Window.setLayersOpaque(child, isOpaque);
          }
        }
      }
    }
  }
  getContainer(): Container {
    return null;
  }
  /**
   * Applies the shape to the component
   * @param shape Shape to be applied to the component
   */
  applyCompoundShape(shape: Region): void {
  }
  applyCurrentShape(): void {
  }
  mixOnReshaping(): void {
  }
  getLocationOnWindow(): Point {
    return new Point()._Point$int$int(0, 0);
  }
  /**
   * Limit the given double value with the given range.
   */
  static limit(value: number, min: number, max: number): number {
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value;
  }
  updateZOrder(): void {
  }
  static $clinit() {
    Window.systemSyncLWRequests = false;
    Window.allWindows = new IdentityArrayList()._IdentityArrayList$();
    Window.nameCounter = 0;
    Window.log = PlatformLogger.getLogger('java.awt.Window');
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      Window.initIDs();
    }
    let s = AccessController.doPrivileged(new GetPropertyAction('java.awt.syncLWRequests'));
    Window.systemSyncLWRequests = $J.equals('true', s);
    let s2 = AccessController.doPrivileged(new GetPropertyAction('java.awt.Window.locationByPlatform'));
    Window.locationByPlatformProp = $J.equals('true', s2);
    Window.beforeFirstWindowShown = new AtomicBoolean(true);
    AWTAccessor.setWindowAccessor(new (Window$1())());
  }
}

/**
 * Enumeration of available <i>window types</i>.
 *
 * A window type defines the generic visual appearance and behavior of a
 * top-level window. For example, the type may affect the kind of
 * decorations of a decorated {@code Frame} or {@code Dialog} instance.
 * <p>
 * Some platforms may not fully support a certain window type. Depending on
 * the level of support, some properties of the window type may be
 * disobeyed.
 *
 * @see   #getType
 * @see   #setType
 * @since 1.7
 */
export class Window$Type extends JEnum {
  static NORMAL: Window$Type = null;
  static UTILITY: Window$Type = null;
  static POPUP: Window$Type = null;
  static $VALUES: Window$Type[] = null;
  _Window$Type($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Window$Type[] { return Window$Type.$VALUES.slice(); }
  static valueOf(name: string): Window$Type { return $J.enumValueOf(Window$Type, name); }
  static $clinit() {
    Window$Type.NORMAL = new Window$Type()._Window$Type('NORMAL', 0);
    Window$Type.UTILITY = new Window$Type()._Window$Type('UTILITY', 1);
    Window$Type.POPUP = new Window$Type()._Window$Type('POPUP', 2);
    Window$Type.$VALUES = [Window$Type.NORMAL, Window$Type.UTILITY, Window$Type.POPUP];
  }
}

export class Window$WindowDisposerRecord extends JObject {
  owner: WeakReference<Window> = null;
  weakThis: WeakReference<Window> = null;
  context: WeakReference<AppContext> = null;
  _Window$WindowDisposerRecord(context: AppContext, victim: Window): this {
    this.weakThis = victim.weakThis;
    this.context = new WeakReference(context);
    return this;
  }
  updateOwner(): void {
    let victim = this.weakThis.get();
    this.owner = (victim == null) ? null : new WeakReference(victim.getOwner());
  }
  dispose(): void {
    if (this.owner != null) {
      let parent = this.owner.get();
      if (parent != null) {
        parent.removeOwnedWindow(this.weakThis);
      }
    }
    let ac = this.context.get();
    if (null != ac) {
      Window.removeFromWindowList(ac, this.weakThis);
    }
  }
}

/**
 * This class implements accessibility support for the
 * {@code Window} class.  It provides an implementation of the
 * Java Accessibility API appropriate to window user-interface elements.
 * @since 1.3
 */
export class Window$AccessibleAWTWindow extends Container$AccessibleAWTContainer {
  /**
   * Constructs an {@code AccessibleAWTWindow}.
   */
  _Window$AccessibleAWTWindow(): this {
    this._Container$AccessibleAWTContainer();
    return this;
  }
}

let $Window$1DisposeAction: any = null;
/** The local class DisposeAction (Window.java:1186). */
function Window$1DisposeAction(): any {
  return $Window$1DisposeAction ??= $J.local(class extends JObject {
    _DisposeAction(): this {
      return this;
    }
    run(): void {
      this.$outer.disposing = true;
      try {
        let gd = this.$outer.getGraphicsConfiguration().getDevice();
        if (gd.getFullScreenWindow() === this.$outer) {
          gd.setFullScreenWindow(null);
        }
        let ownedWindowArray: any[];
        {
          ownedWindowArray = $J.newArray(this.$outer.ownedWindowList.size(), null);
          this.$outer.ownedWindowList.copyInto(ownedWindowArray);
        }
        for (let i = 0; i < ownedWindowArray.length; i++) {
          let child = (((ownedWindowArray[i])).get());
          if (child != null) {
            child.disposeImpl();
          }
        }
        this.$outer.hide();
        this.$outer.beforeFirstShow = true;
        this.$outer.removeNotify();
        {
          if (this.$outer.inputContext != null) {
            this.$outer.inputContext.dispose();
            this.$outer.inputContext = null;
          }
        }
        this.$outer.clearCurrentFocusCycleRootOnHide();
      } finally {
        this.$outer.disposing = false;
      }
    }
  }, 'java.awt.Window$1DisposeAction', ['java.lang.Runnable']);
}

let $Window$1: any = null;
/** An anonymous class (Window.java:4085). */
function Window$1(): any {
  return $Window$1 ??= $J.local(class extends JObject {
    updateWindow(window: Window): void {
      window.updateWindow();
    }
  }, 'java.awt.Window$1', ['sun.awt.AWTAccessor$WindowAccessor']);
}

$J.define(Window, 'java.awt.Window', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'java.awt.Container', ctors: { 'java.awt.Window,java.awt.GraphicsConfiguration': '_Window$Window$GraphicsConfiguration', 'java.awt.Window': '_Window$Window', 'java.awt.Frame': '_Window$Frame', '': '_Window$', 'java.awt.GraphicsConfiguration': '_Window$GraphicsConfiguration' }, meths: { 'setBounds(java.awt.Rectangle)': 'setBounds$Rectangle', 'setBounds(int,int,int,int)': 'setBounds$int$int$int$int', 'createBufferStrategy(int,java.awt.BufferCapabilities)': 'createBufferStrategy$int$BufferCapabilities', 'createBufferStrategy(int)': 'createBufferStrategy$int', 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Window', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$Window', 'applyResourceBundle(java.lang.String)': 'applyResourceBundle$String', 'applyResourceBundle(java.util.ResourceBundle)': 'applyResourceBundle$ResourceBundle', 'isValidateRoot()': 'isValidateRoot$', 'addPropertyChangeListener(java.lang.String,java.beans.PropertyChangeListener)': 'addPropertyChangeListener$String$PropertyChangeListener', 'addPropertyChangeListener(java.beans.PropertyChangeListener)': 'addPropertyChangeListener$PropertyChangeListener', 'isFocusCycleRoot()': 'isFocusCycleRoot$', 'getWindows()': 'getWindows$', 'getWindows(sun.awt.AppContext)': 'getWindows$AppContext', 'setCursor(java.awt.Cursor)': 'setCursor$Cursor', 'getLocale()': 'getLocale$', 'show()': 'show$', 'setLocation(java.awt.Point)': 'setLocation$Point', 'setLocation(int,int)': 'setLocation$int$int', 'setSize(int,int)': 'setSize$int$int', 'setSize(java.awt.Dimension)': 'setSize$Dimension', 'init(java.awt.GraphicsConfiguration)': 'init$GraphicsConfiguration$Window' }, clinit: true, lazy: ['systemSyncLWRequests', 'allWindows', 'nameCounter', 'log', 'locationByPlatformProp', 'beforeFirstWindowShown'] });
$J.define(Window$Type, 'java.awt.Window$Type', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Window$Type' }, clinit: true, lazy: ['$VALUES', 'NORMAL', 'UTILITY', 'POPUP'] });
$J.define(Window$WindowDisposerRecord, 'java.awt.Window$WindowDisposerRecord', { kind: 'class', ifaces: ['sun.java2d.DisposerRecord'], sup: 'java.lang.Object', ctors: { 'sun.awt.AppContext,java.awt.Window': '_Window$WindowDisposerRecord' } });
$J.define(Window$AccessibleAWTWindow, 'java.awt.Window$AccessibleAWTWindow', { kind: 'class', sup: 'java.awt.Container$AccessibleAWTContainer', ctors: { '': '_Window$AccessibleAWTWindow' }, meths: { 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  AWTEventMulticaster = $J.load('java.awt.AWTEventMulticaster');
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  BorderLayout = $J.load('java.awt.BorderLayout');
  Cursor = $J.load('java.awt.Cursor');
  Dialog = $J.load('java.awt.Dialog');
  Dialog$ModalExclusionType = $J.load('java.awt.Dialog$ModalExclusionType');
  EventQueue = $J.load('java.awt.EventQueue');
  Frame = $J.load('java.awt.Frame');
  Graphics2D = $J.load('java.awt.Graphics2D');
  GraphicsDevice = $J.load('java.awt.GraphicsDevice');
  GraphicsDevice$WindowTranslucency = $J.load('java.awt.GraphicsDevice$WindowTranslucency');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  IllegalComponentStateException = $J.load('java.awt.IllegalComponentStateException');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Point = $J.load('java.awt.Point');
  SplashScreen = $J.load('java.awt.SplashScreen');
  ComponentEvent = $J.load('java.awt.event.ComponentEvent');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  WindowEvent = $J.load('java.awt.event.WindowEvent');
  WindowFocusListener = $J.load('java.awt.event.WindowFocusListener');
  WindowListener = $J.load('java.awt.event.WindowListener');
  WindowStateListener = $J.load('java.awt.event.WindowStateListener');
  Path2D$Float = $J.load('java.awt.geom.Path2D$Float');
  JComponent = $J.load('javax.swing.JComponent');
  RootPaneContainer = $J.load('javax.swing.RootPaneContainer');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  AWTPermissions = $J.load('sun.awt.AWTPermissions');
  DebugSettings = $J.load('sun.awt.DebugSettings');
  IdentityArrayList = $J.load('sun.awt.util.IdentityArrayList');
});
