// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/GraphicsDevice.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, JEnum, JObject, SunToolkit, Toolkit, UnsupportedOperationException } from '../../../jre/index.ts';

let Color, DisplayMode;

/**
 * The {@code GraphicsDevice} class describes the graphics devices
 * that might be available in a particular graphics environment.  These
 * include screen and printer devices. Note that there can be many screens
 * and many printers in an instance of {@link GraphicsEnvironment}. Each
 * graphics device has one or more {@link GraphicsConfiguration} objects
 * associated with it.  These objects specify the different configurations
 * in which the {@code GraphicsDevice} can be used.
 * <p>
 * In a multi-screen environment, the {@code GraphicsConfiguration}
 * objects can be used to render components on multiple screens.  The
 * following code sample demonstrates how to create a {@code JFrame}
 * object for each {@code GraphicsConfiguration} on each screen
 * device in the {@code GraphicsEnvironment}:
 * <pre>{@code
 *   GraphicsEnvironment ge = GraphicsEnvironment.
 *   getLocalGraphicsEnvironment();
 *   GraphicsDevice[] gs = ge.getScreenDevices();
 *   for (int j = 0; j < gs.length; j++) {
 *      GraphicsDevice gd = gs[j];
 *      GraphicsConfiguration[] gc =
 *      gd.getConfigurations();
 *      for (int i=0; i < gc.length; i++) {
 *         JFrame f = new
 *         JFrame(gs[j].getDefaultConfiguration());
 *         Canvas c = new Canvas(gc[i]);
 *         Rectangle gcBounds = gc[i].getBounds();
 *         int xoffs = gcBounds.x;
 *         int yoffs = gcBounds.y;
 *         f.getContentPane().add(c);
 *         f.setLocation((i*50)+xoffs, (i*60)+yoffs);
 *         f.show();
 *      }
 *   }
 * }</pre>
 * <p>
 * For more information on full-screen exclusive mode API, see the
 * <a href="https://docs.oracle.com/javase/tutorial/extra/fullscreen/index.html">
 * Full-Screen Exclusive Mode API Tutorial</a>.
 *
 * @see GraphicsEnvironment
 * @see GraphicsConfiguration
 */
export class GraphicsDevice extends JObject {
  fullScreenWindow: Window = null;
  fullScreenAppContext: AppContext = null;
  fsAppContextLock: any = null;
  windowedModeBounds: Rectangle = null;
  /**
   * Device is a raster screen.
   */
  static readonly TYPE_RASTER_SCREEN: number = 0;
  /**
   * Device is a printer.
   */
  static readonly TYPE_PRINTER: number = 1;
  /**
   * Device is an image buffer.  This buffer can reside in device
   * or system memory but it is not physically viewable by the user.
   */
  static readonly TYPE_IMAGE_BUFFER: number = 2;
  /**
   * This is an abstract class that cannot be instantiated directly.
   * Instances must be obtained from a suitable factory or query method.
   * @see GraphicsEnvironment#getScreenDevices
   * @see GraphicsEnvironment#getDefaultScreenDevice
   * @see GraphicsConfiguration#getDevice
   */
  _GraphicsDevice(): this {
    this.fsAppContextLock = new JObject();
    return this;
  }
  /**
   * Returns the "best" configuration possible that passes the
   * criteria defined in the {@link GraphicsConfigTemplate}.
   * @param gct the {@code GraphicsConfigTemplate} object
   * used to obtain a valid {@code GraphicsConfiguration}
   * @return a {@code GraphicsConfiguration} that passes
   * the criteria defined in the specified
   * {@code GraphicsConfigTemplate}.
   * @see GraphicsConfigTemplate
   */
  getBestConfiguration(gct: GraphicsConfigTemplate): GraphicsConfiguration {
    let configs = this.getConfigurations();
    return gct.getBestConfiguration(configs);
  }
  /**
   * Returns {@code true} if this {@code GraphicsDevice}
   * supports full-screen exclusive mode.
   * If a SecurityManager is installed, its
   * {@code checkPermission} method will be called
   * with {@code AWTPermission("fullScreenExclusive")}.
   * {@code isFullScreenSupported} returns true only if
   * that permission is granted.
   * @return whether full-screen exclusive mode is available for
   * this graphics device
   * @see java.awt.AWTPermission
   * @since 1.4
   */
  isFullScreenSupported(): boolean {
    return false;
  }
  /**
   * Enter full-screen mode, or return to windowed mode.  The entered
   * full-screen mode may be either exclusive or simulated.  Exclusive
   * mode is only available if {@code isFullScreenSupported}
   * returns {@code true}.
   * <p>
   * Exclusive mode implies:
   * <ul>
   * <li>Windows cannot overlap the full-screen window.  All other application
   * windows will always appear beneath the full-screen window in the Z-order.
   * <li>There can be only one full-screen window on a device at any time,
   * so calling this method while there is an existing full-screen Window
   * will cause the existing full-screen window to
   * return to windowed mode.
   * <li>Input method windows are disabled.  It is advisable to call
   * {@code Component.enableInputMethods(false)} to make a component
   * a non-client of the input method framework.
   * </ul>
   * <p>
   * The simulated full-screen mode places and resizes the window to the maximum
   * possible visible area of the screen. However, the native windowing system
   * may modify the requested geometry-related data, so that the {@code Window} object
   * is placed and sized in a way that corresponds closely to the desktop settings.
   * <p>
   * When entering full-screen mode, if the window to be used as a
   * full-screen window is not visible, this method will make it visible.
   * It will remain visible when returning to windowed mode.
   * <p>
   * When entering full-screen mode, all the translucency effects are reset for
   * the window. Its shape is set to {@code null}, the opacity value is set to
   * 1.0f, and the background color alpha is set to 255 (completely opaque).
   * These values are not restored when returning to windowed mode.
   * <p>
   * It is unspecified and platform-dependent how decorated windows operate
   * in full-screen mode. For this reason, it is recommended to turn off
   * the decorations in a {@code Frame} or {@code Dialog} object by using the
   * {@code setUndecorated} method.
   * <p>
   * When returning to windowed mode from an exclusive full-screen window,
   * any display changes made by calling {@code setDisplayMode} are
   * automatically restored to their original state.
   *
   * @param w a window to use as the full-screen window; {@code null}
   * if returning to windowed mode.  Some platforms expect the
   * fullscreen window to be a top-level component (i.e., a {@code Frame});
   * therefore it is preferable to use a {@code Frame} here rather than a
   * {@code Window}.
   *
   * @see #isFullScreenSupported
   * @see #getFullScreenWindow
   * @see #setDisplayMode
   * @see Component#enableInputMethods
   * @see Component#setVisible
   * @see Frame#setUndecorated
   * @see Dialog#setUndecorated
   *
   * @since 1.4
   */
  setFullScreenWindow(w: Window): void {
    if (w != null) {
      if (w.getShape() != null) {
        w.setShape(null);
      }
      if (w.getOpacity() < 1) {
        w.setOpacity(1);
      }
      if (!w.isOpaque()) {
        let bgColor = w.getBackground();
        bgColor = new Color()._Color$int$int$int$int(bgColor.getRed(), bgColor.getGreen(), bgColor.getBlue(), 255);
        w.setBackground(bgColor);
      }
      let gc = w.getGraphicsConfiguration();
      if (gc != null && gc.getDevice() !== this && gc.getDevice().getFullScreenWindow() === w) {
        gc.getDevice().setFullScreenWindow(null);
      }
    }
    if (this.fullScreenWindow != null && this.windowedModeBounds != null) {
      if (this.windowedModeBounds.width_ === 0) {
        this.windowedModeBounds.width_ = 1;
      }
      if (this.windowedModeBounds.height_ === 0) {
        this.windowedModeBounds.height_ = 1;
      }
      this.fullScreenWindow.setBounds$Rectangle(this.windowedModeBounds);
    }
    {
      if (w == null) {
        this.fullScreenAppContext = null;
      } else {
        this.fullScreenAppContext = AppContext.getAppContext();
      }
      this.fullScreenWindow = w;
    }
    if (this.fullScreenWindow != null) {
      this.windowedModeBounds = this.fullScreenWindow.getBounds$();
      let gc = this.getDefaultConfiguration();
      let screenBounds = gc.getBounds();
      if (SunToolkit.isDispatchThreadForAppContext(this.fullScreenWindow)) {
        this.fullScreenWindow.setGraphicsConfiguration(gc);
      }
      this.fullScreenWindow.setBounds$int$int$int$int(screenBounds.x_, screenBounds.y_, screenBounds.width_, screenBounds.height_);
      this.fullScreenWindow.setVisible(true);
      this.fullScreenWindow.toFront();
    }
  }
  /**
   * Returns the {@code Window} object representing the
   * full-screen window if the device is in full-screen mode.
   *
   * @return the full-screen window, or {@code null} if the device is
   * not in full-screen mode.
   * @see #setFullScreenWindow(Window)
   * @since 1.4
   */
  getFullScreenWindow(): Window {
    let returnWindow = null;
    {
      if (this.fullScreenAppContext === AppContext.getAppContext()) {
        returnWindow = this.fullScreenWindow;
      }
    }
    return returnWindow;
  }
  /**
   * Returns {@code true} if this {@code GraphicsDevice}
   * supports low-level display changes.
   * On some platforms low-level display changes may only be allowed in
   * full-screen exclusive mode (i.e., if {@link #isFullScreenSupported()}
   * returns {@code true} and the application has already entered
   * full-screen mode using {@link #setFullScreenWindow}).
   * @return whether low-level display changes are supported for this
   * graphics device.
   * @see #isFullScreenSupported
   * @see #setDisplayMode
   * @see #setFullScreenWindow
   * @since 1.4
   */
  isDisplayChangeSupported(): boolean {
    return false;
  }
  /**
   * Sets the display mode of this graphics device. This is only allowed
   * if {@link #isDisplayChangeSupported()} returns {@code true} and may
   * require first entering full-screen exclusive mode using
   * {@link #setFullScreenWindow} providing that full-screen exclusive mode is
   * supported (i.e., {@link #isFullScreenSupported()} returns
   * {@code true}).
   * <p>
   *
   * The display mode must be one of the display modes returned by
   * {@link #getDisplayModes()}, with one exception: passing a display mode
   * with {@link DisplayMode#REFRESH_RATE_UNKNOWN} refresh rate will result in
   * selecting a display mode from the list of available display modes with
   * matching width, height and bit depth.
   * However, passing a display mode with {@link DisplayMode#BIT_DEPTH_MULTI}
   * for bit depth is only allowed if such mode exists in the list returned by
   * {@link #getDisplayModes()}.
   * <p>
   * Example code:
   * <pre><code>
   * Frame frame;
   * DisplayMode newDisplayMode;
   * GraphicsDevice gd;
   * // create a Frame, select desired DisplayMode from the list of modes
   * // returned by gd.getDisplayModes() ...
   *
   * if (gd.isFullScreenSupported()) {
   *     gd.setFullScreenWindow(frame);
   * } else {
   *    // proceed in non-full-screen mode
   *    frame.setSize(...);
   *    frame.setLocation(...);
   *    frame.setVisible(true);
   * }
   *
   * if (gd.isDisplayChangeSupported()) {
   *     gd.setDisplayMode(newDisplayMode);
   * }
   * </code></pre>
   *
   * @param dm The new display mode of this graphics device.
   * @throws IllegalArgumentException if the {@code DisplayMode}
   * supplied is {@code null}, or is not available in the array returned
   * by {@code getDisplayModes}
   * @throws UnsupportedOperationException if
   * {@code isDisplayChangeSupported} returns {@code false}
   * @see #getDisplayMode
   * @see #getDisplayModes
   * @see #isDisplayChangeSupported
   * @since 1.4
   */
  setDisplayMode(dm: DisplayMode): void {
    throw new UnsupportedOperationException('Cannot change display mode');
  }
  /**
   * Returns the current display mode of this
   * {@code GraphicsDevice}.
   * The returned display mode is allowed to have a refresh rate
   * {@link DisplayMode#REFRESH_RATE_UNKNOWN} if it is indeterminate.
   * Likewise, the returned display mode is allowed to have a bit depth
   * {@link DisplayMode#BIT_DEPTH_MULTI} if it is indeterminate or if multiple
   * bit depths are supported.
   * @return the current display mode of this graphics device.
   * @see #setDisplayMode(DisplayMode)
   * @since 1.4
   */
  getDisplayMode(): DisplayMode {
    let gc = this.getDefaultConfiguration();
    let r = gc.getBounds();
    let cm = gc.getColorModel$();
    return new DisplayMode()._DisplayMode(r.width_, r.height_, cm.getPixelSize(), 0);
  }
  /**
   * Returns all display modes available for this
   * {@code GraphicsDevice}.
   * The returned display modes are allowed to have a refresh rate
   * {@link DisplayMode#REFRESH_RATE_UNKNOWN} if it is indeterminate.
   * Likewise, the returned display modes are allowed to have a bit depth
   * {@link DisplayMode#BIT_DEPTH_MULTI} if it is indeterminate or if multiple
   * bit depths are supported.
   * @return all of the display modes available for this graphics device.
   * @since 1.4
   */
  getDisplayModes(): DisplayMode[] {
    return [this.getDisplayMode()];
  }
  /**
   * This method returns the number of bytes available in
   * accelerated memory on this device.
   * Some images are created or cached
   * in accelerated memory on a first-come,
   * first-served basis.  On some operating systems,
   * this memory is a finite resource.  Calling this method
   * and scheduling the creation and flushing of images carefully may
   * enable applications to make the most efficient use of
   * that finite resource.
   * <br>
   * Note that the number returned is a snapshot of how much
   * memory is available; some images may still have problems
   * being allocated into that memory.  For example, depending
   * on operating system, driver, memory configuration, and
   * thread situations, the full extent of the size reported
   * may not be available for a given image.  There are further
   * inquiry methods on the {@link ImageCapabilities} object
   * associated with a VolatileImage that can be used to determine
   * whether a particular VolatileImage has been created in accelerated
   * memory.
   * @return number of bytes available in accelerated memory.
   * A negative return value indicates that the amount of accelerated memory
   * on this GraphicsDevice is indeterminate.
   * @see java.awt.image.VolatileImage#flush
   * @see ImageCapabilities#isAccelerated
   * @since 1.4
   */
  getAvailableAcceleratedMemory(): number {
    return -1;
  }
  /**
   * Returns whether the given level of translucency is supported by
   * this graphics device.
   *
   * @param translucencyKind a kind of translucency support
   * @return whether the given translucency kind is supported
   *
   * @since 1.7
   */
  isWindowTranslucencySupported(translucencyKind: GraphicsDevice$WindowTranslucency): boolean {
    switch (translucencyKind) {
      case GraphicsDevice$WindowTranslucency.PERPIXEL_TRANSPARENT:
        return GraphicsDevice.isWindowShapingSupported();
      case GraphicsDevice$WindowTranslucency.TRANSLUCENT:
        return GraphicsDevice.isWindowOpacitySupported();
      case GraphicsDevice$WindowTranslucency.PERPIXEL_TRANSLUCENT:
        return this.isWindowPerpixelTranslucencySupported();
    }
    return false;
  }
  /**
   * Returns whether the windowing system supports changing the shape
   * of top-level windows.
   * Note that this method may sometimes return true, but the native
   * windowing system may still not support the concept of
   * shaping (due to the bugs in the windowing system).
   */
  static isWindowShapingSupported(): boolean {
    let curToolkit = Toolkit.getDefaultToolkit();
    if (!($J.isa(curToolkit, SunToolkit))) {
      return false;
    }
    return (curToolkit).isWindowShapingSupported();
  }
  /**
   * Returns whether the windowing system supports changing the opacity
   * value of top-level windows.
   * Note that this method may sometimes return true, but the native
   * windowing system may still not support the concept of
   * translucency (due to the bugs in the windowing system).
   */
  static isWindowOpacitySupported(): boolean {
    let curToolkit = Toolkit.getDefaultToolkit();
    if (!($J.isa(curToolkit, SunToolkit))) {
      return false;
    }
    return (curToolkit).isWindowOpacitySupported();
  }
  isWindowPerpixelTranslucencySupported(): boolean {
    let curToolkit = Toolkit.getDefaultToolkit();
    if (!($J.isa(curToolkit, SunToolkit))) {
      return false;
    }
    if (!(curToolkit).isWindowTranslucencySupported()) {
      return false;
    }
    return this.getTranslucencyCapableGC() != null;
  }
  getTranslucencyCapableGC(): GraphicsConfiguration {
    let defaultGC = this.getDefaultConfiguration();
    if (defaultGC.isTranslucencyCapable()) {
      return defaultGC;
    }
    let configs = this.getConfigurations();
    for (let j = 0; j < configs.length; j++) {
      if (configs[j].isTranslucencyCapable()) {
        return configs[j];
      }
    }
    return null;
  }
}

/**
 * Kinds of translucency supported by the underlying system.
 *
 * @see #isWindowTranslucencySupported
 *
 * @since 1.7
 */
export class GraphicsDevice$WindowTranslucency extends JEnum {
  static PERPIXEL_TRANSPARENT: GraphicsDevice$WindowTranslucency = null;
  static TRANSLUCENT: GraphicsDevice$WindowTranslucency = null;
  static PERPIXEL_TRANSLUCENT: GraphicsDevice$WindowTranslucency = null;
  static $VALUES: GraphicsDevice$WindowTranslucency[] = null;
  _GraphicsDevice$WindowTranslucency($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): GraphicsDevice$WindowTranslucency[] { return GraphicsDevice$WindowTranslucency.$VALUES.slice(); }
  static valueOf(name: string): GraphicsDevice$WindowTranslucency { return $J.enumValueOf(GraphicsDevice$WindowTranslucency, name); }
  static $clinit() {
    GraphicsDevice$WindowTranslucency.PERPIXEL_TRANSPARENT = new GraphicsDevice$WindowTranslucency()._GraphicsDevice$WindowTranslucency('PERPIXEL_TRANSPARENT', 0);
    GraphicsDevice$WindowTranslucency.TRANSLUCENT = new GraphicsDevice$WindowTranslucency()._GraphicsDevice$WindowTranslucency('TRANSLUCENT', 1);
    GraphicsDevice$WindowTranslucency.PERPIXEL_TRANSLUCENT = new GraphicsDevice$WindowTranslucency()._GraphicsDevice$WindowTranslucency('PERPIXEL_TRANSLUCENT', 2);
    GraphicsDevice$WindowTranslucency.$VALUES = [GraphicsDevice$WindowTranslucency.PERPIXEL_TRANSPARENT, GraphicsDevice$WindowTranslucency.TRANSLUCENT, GraphicsDevice$WindowTranslucency.PERPIXEL_TRANSLUCENT];
  }
}

$J.define(GraphicsDevice, 'java.awt.GraphicsDevice', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GraphicsDevice' } });
$J.define(GraphicsDevice$WindowTranslucency, 'java.awt.GraphicsDevice$WindowTranslucency', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_GraphicsDevice$WindowTranslucency' }, clinit: true, lazy: ['$VALUES', 'PERPIXEL_TRANSPARENT', 'TRANSLUCENT', 'PERPIXEL_TRANSLUCENT'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  DisplayMode = $J.load('java.awt.DisplayMode');
});
