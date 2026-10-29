// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/RepaintManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, Applet, ArrayList, AtomicInteger, GetPropertyAction, HashMap, HashSet, IdentityHashMap, JObject, Region, SharedSecrets, StringBuilder, SunGraphics2D, SunGraphicsEnvironment, SunToolkit, Thread, Toolkit } from '../../../jre/index.ts';

let SwingUtilities3, AlphaComposite, Dimension, Frame, Graphics2D, GraphicsEnvironment, HeadlessException, Rectangle, Transparency, Window, InvocationEvent, AffineTransform, VolatileImage, BufferStrategyPaintManager, JComponent, SwingUtilities, AWTAccessor, SwingAccessor, SwingUtilities2;

/**
 * This class manages repaint requests, allowing the number
 * of repaints to be minimized, for example by collapsing multiple
 * requests into a single repaint for members of a component tree.
 * <p>
 * As of 1.6 <code>RepaintManager</code> handles repaint requests
 * for Swing's top level components (<code>JApplet</code>,
 * <code>JWindow</code>, <code>JFrame</code> and <code>JDialog</code>).
 * Any calls to <code>repaint</code> on one of these will call into the
 * appropriate <code>addDirtyRegion</code> method.
 *
 * @author Arnaud Weber
 * @since 1.2
 */
export class RepaintManager extends JObject {
  /**
   * Whether or not the RepaintManager should handle paint requests
   * for top levels.
   */
  static HANDLE_TOP_LEVEL_PAINT: boolean = false;
  static readonly BUFFER_STRATEGY_NOT_SPECIFIED: number = 0;
  static readonly BUFFER_STRATEGY_SPECIFIED_ON: number = 1;
  static readonly BUFFER_STRATEGY_SPECIFIED_OFF: number = 2;
  static BUFFER_STRATEGY_TYPE: number = 0;
  /**
   * Maps from GraphicsConfiguration to VolatileImage.
   */
  volatileMap: JMap<GraphicsConfiguration, VolatileImage> = null;
  hwDirtyComponents: JMap<Container, Rectangle> = null;
  dirtyComponents: JMap<Component, Rectangle> = null;
  tmpDirtyComponents: JMap<Component, Rectangle> = null;
  invalidComponents: List<Component> = null;
  runnableList: List<Runnable> = null;
  doubleBufferingEnabled: boolean = false;
  doubleBufferMaxSize: Dimension = null;
  isCustomMaxBufferSizeSet: boolean = false;
  standardDoubleBuffer: RepaintManager$DoubleBufferInfo = null;
  /**
   * Object responsible for handling core paint functionality.
   */
  paintManager: RepaintManager$PaintManager = null;
  static repaintManagerKey: any = null;
  static volatileImageBufferEnabled: boolean = false;
  /**
   * Type of VolatileImage which should be used for double-buffered
   * painting.
   */
  static volatileBufferType: number = 0;
  /**
   * Value of the system property awt.nativeDoubleBuffering.
   */
  static nativeDoubleBuffering: boolean = false;
  static readonly VOLATILE_LOOP_MAX: number = 2;
  /**
   * Number of <code>beginPaint</code> that have been invoked.
   */
  paintDepth: number = 0;
  /**
   * Type of buffer strategy to use.  Will be one of the BUFFER_STRATEGY_
   * constants.
   */
  bufferStrategyType: number = 0;
  /**
   * True if we're in the process of painting the dirty regions.  This is
   * set to true in <code>paintDirtyRegions</code>.
   */
  painting: boolean = false;
  /**
   * If the PaintManager calls into repaintRoot during painting this field
   * will be set to the root.
   */
  repaintRoot_: JComponent = null;
  /**
   * The Thread that has initiated painting.  If null it
   * indicates painting is not currently in progress.
   */
  paintThread: Thread = null;
  /**
   * Runnable used to process all repaint/revalidate requests.
   */
  processingRunnable: RepaintManager$ProcessingRunnable = null;
  static javaSecurityAccess: JavaSecurityAccess = null;
  /**
   * Listener installed to detect display changes. When display changes,
   * schedules a callback to notify all RepaintManagers of the display
   * changes.
   */
  static displayChangedHandler: DisplayChangedListener = null;
  tmp: Rectangle = null;
  repaintListeners: List<SwingUtilities2$RepaintListener> = null;
  $init_RepaintManager() {
    this.volatileMap = new HashMap(1);
    this.doubleBufferingEnabled = true;
    this.isCustomMaxBufferSizeSet = false;
    this.paintDepth = 0;
    this.tmp = new Rectangle()._Rectangle$();
    this.repaintListeners = new ArrayList(1);
  }
  _RepaintManager$short(bufferStrategyType: number): this {
    this.$init_RepaintManager();
    this.doubleBufferingEnabled = !RepaintManager.nativeDoubleBuffering;
    {
      this.dirtyComponents = new IdentityHashMap();
      this.tmpDirtyComponents = new IdentityHashMap();
      this.bufferStrategyType = bufferStrategyType;
      this.hwDirtyComponents = new IdentityHashMap();
    }
    this.processingRunnable = new RepaintManager$ProcessingRunnable().$o(this)._RepaintManager$ProcessingRunnable();
    return this;
  }
  /**
   * Return the RepaintManager for the calling thread given a Component.
   *
   * @param c a Component -- unused in the default implementation, but could
   *          be used by an overridden version to return a different RepaintManager
   *          depending on the Component
   * @return the RepaintManager object
   */
  static currentManager$Component(c: Component): RepaintManager {
    return RepaintManager.currentManager$AppContext(AppContext.getAppContext());
  }
  /**
   * Returns the RepaintManager for the specified AppContext.  If
   * a RepaintManager has not been created for the specified
   * AppContext this will return null.
   */
  static currentManager$AppContext(appContext: AppContext): RepaintManager {
    let rm = appContext.get(RepaintManager.repaintManagerKey);
    if (rm == null) {
      rm = new RepaintManager()._RepaintManager$short(RepaintManager.BUFFER_STRATEGY_TYPE);
      appContext.put(RepaintManager.repaintManagerKey, rm);
    }
    return rm;
  }
  /**
   * Return the RepaintManager for the calling thread given a JComponent.
   * <p>
   * Note: This method exists for backward binary compatibility with earlier
   * versions of the Swing library. It simply returns the result returned by
   * {@link #currentManager(Component)}.
   *
   * @param c a JComponent -- unused
   * @return the RepaintManager object
   */
  static currentManager$JComponent(c: JComponent): RepaintManager {
    return RepaintManager.currentManager$Component(c);
  }
  /**
   * Mark the component as in need of layout and queue a runnable
   * for the event dispatching thread that will validate the components
   * first isValidateRoot() ancestor.
   *
   * @param invalidComponent a component
   * @see JComponent#isValidateRoot
   * @see #removeInvalidComponent
   */
  addInvalidComponent(invalidComponent: JComponent): void {
    let delegate = this.getDelegate(invalidComponent);
    if (delegate != null) {
      delegate.addInvalidComponent(invalidComponent);
      return;
    }
    let validateRoot = SwingUtilities.getValidateRoot(invalidComponent, true);
    if (validateRoot == null) {
      return;
    }
    if (this.invalidComponents == null) {
      this.invalidComponents = new ArrayList();
    } else {
      let n = this.invalidComponents.size();
      for (let i = 0; i < n; i++) {
        if (validateRoot === this.invalidComponents.get(i)) {
          return;
        }
      }
    }
    this.invalidComponents.add(validateRoot);
    this.scheduleProcessingRunnable(SunToolkit.targetToAppContext(invalidComponent));
  }
  /**
   * Remove a component from the list of invalid components.
   *
   * @param component a component
   * @see #addInvalidComponent
   */
  removeInvalidComponent(component: JComponent): void {
    let delegate = this.getDelegate(component);
    if (delegate != null) {
      delegate.removeInvalidComponent(component);
      return;
    }
    if (this.invalidComponents != null) {
      let index = this.invalidComponents.indexOf(component);
      if (index !== -1) {
        this.invalidComponents.removeAt(index);
      }
    }
  }
  /**
   * Add a component in the list of components that should be refreshed.
   * If <i>c</i> already has a dirty region, the rectangle <i>(x,y,w,h)</i>
   * will be unioned with the region that should be redrawn.
   *
   * @see JComponent#repaint
   */
  addDirtyRegion0(c: Container, x: number, y: number, w: number, h: number): void {
    if ((w <= 0) || (h <= 0) || (c == null)) {
      return;
    }
    if ((c.getWidth() <= 0) || (c.getHeight() <= 0)) {
      return;
    }
    if (this.extendDirtyRegion(c, x, y, w, h)) {
      return;
    }
    let root = null;
    for (let p = c; p != null; p = p.getParent()) {
      if (!p.isVisible$() || !p.isDisplayable()) {
        return;
      }
      if ((p instanceof Window) || ($J.isa(p, Applet))) {
        if (p instanceof Frame && ((p).getExtendedState() & Frame.ICONIFIED) === Frame.ICONIFIED) {
          return;
        }
        root = p;
        break;
      }
    }
    if (root == null) {
      return;
    }
    {
      if (this.extendDirtyRegion(c, x, y, w, h)) {
        return;
      }
      this.dirtyComponents.put(c, new Rectangle()._Rectangle$int$int$int$int(x, y, w, h));
    }
    this.scheduleProcessingRunnable(SunToolkit.targetToAppContext(c));
  }
  /**
   * Add a component in the list of components that should be refreshed.
   * If <i>c</i> already has a dirty region, the rectangle <i>(x,y,w,h)</i>
   * will be unioned with the region that should be redrawn.
   *
   * @param c Component to repaint, null results in nothing happening.
   * @param x X coordinate of the region to repaint
   * @param y Y coordinate of the region to repaint
   * @param w Width of the region to repaint
   * @param h Height of the region to repaint
   * @see JComponent#repaint
   */
  addDirtyRegion$JComponent$int$int$int$int(c: JComponent, x: number, y: number, w: number, h: number): void {
    let delegate = this.getDelegate(c);
    if (delegate != null) {
      delegate.addDirtyRegion$JComponent$int$int$int$int(c, x, y, w, h);
      return;
    }
    this.addDirtyRegion0(c, x, y, w, h);
  }
  /**
   * Adds <code>window</code> to the list of <code>Component</code>s that
   * need to be repainted.
   *
   * @param window Window to repaint, null results in nothing happening.
   * @param x X coordinate of the region to repaint
   * @param y Y coordinate of the region to repaint
   * @param w Width of the region to repaint
   * @param h Height of the region to repaint
   * @see JFrame#repaint
   * @see JWindow#repaint
   * @see JDialog#repaint
   * @since 1.6
   */
  addDirtyRegion$Window$int$int$int$int(window: Window, x: number, y: number, w: number, h: number): void {
    this.addDirtyRegion0(window, x, y, w, h);
  }
  /**
   * Adds <code>applet</code> to the list of <code>Component</code>s that
   * need to be repainted.
   *
   * @param applet Applet to repaint, null results in nothing happening.
   * @param x X coordinate of the region to repaint
   * @param y Y coordinate of the region to repaint
   * @param w Width of the region to repaint
   * @param h Height of the region to repaint
   * @see JApplet#repaint
   * @since 1.6
   *
   * @deprecated The Applet API is deprecated. See the
   * <a href="../../java/applet/package-summary.html"> java.applet package
   * documentation</a> for further information.
   */
  addDirtyRegion$Applet$int$int$int$int(applet: Applet, x: number, y: number, w: number, h: number): void {
    this.addDirtyRegion0(applet, x, y, w, h);
  }
  scheduleHeavyWeightPaints(): void {
    let hws: JMap<Container, Rectangle>;
    {
      if (this.hwDirtyComponents.size() === 0) {
        return;
      }
      hws = this.hwDirtyComponents;
      this.hwDirtyComponents = new IdentityHashMap();
    }
    for (const $it0 = hws.keySet().iterator(); $it0.hasNext(); ) {
      let hw = $it0.next();
      let dirty = hws.get(hw);
      if (hw instanceof Window) {
        this.addDirtyRegion$Window$int$int$int$int(hw, dirty.x_, dirty.y_, dirty.width_, dirty.height_);
      } else if ($J.isa(hw, Applet)) {
        this.addDirtyRegion$Applet$int$int$int$int(hw, dirty.x_, dirty.y_, dirty.width_, dirty.height_);
      } else {
        this.addDirtyRegion0(hw, dirty.x_, dirty.y_, dirty.width_, dirty.height_);
      }
    }
  }
  nativeAddDirtyRegion(appContext: AppContext, c: Container, x: number, y: number, w: number, h: number): void {
    if (w > 0 && h > 0) {
      {
        let dirty = this.hwDirtyComponents.get(c);
        if (dirty == null) {
          this.hwDirtyComponents.put(c, new Rectangle()._Rectangle$int$int$int$int(x, y, w, h));
        } else {
          this.hwDirtyComponents.put(c, SwingUtilities.computeUnion(x, y, w, h, dirty));
        }
      }
      this.scheduleProcessingRunnable(appContext);
    }
  }
  /**
   * Extends the dirty region for the specified component to include
   * the new region.
   *
   * @return false if <code>c</code> is not yet marked dirty.
   */
  extendDirtyRegion(c: Component, x: number, y: number, w: number, h: number): boolean {
    let r = this.dirtyComponents.get(c);
    if (r != null) {
      SwingUtilities.computeUnion(x, y, w, h, r);
      return true;
    }
    return false;
  }
  /**
   * Return the current dirty region for a component.
   * Return an empty rectangle if the component is not
   * dirty.
   *
   * @param aComponent a component
   * @return the region
   */
  getDirtyRegion(aComponent: JComponent): Rectangle {
    let delegate = this.getDelegate(aComponent);
    if (delegate != null) {
      return delegate.getDirtyRegion(aComponent);
    }
    let r: Rectangle;
    {
      r = this.dirtyComponents.get(aComponent);
    }
    if (r == null) {
      return new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
    } else {
      return new Rectangle()._Rectangle$Rectangle(r);
    }
  }
  /**
   * Mark a component completely clean. <b>aComponent</b> will not
   * get painted during the next paintDirtyRegions() call.
   *
   * @param aComponent a component
   */
  markCompletelyClean(aComponent: JComponent): void {
    let delegate = this.getDelegate(aComponent);
    if (delegate != null) {
      delegate.markCompletelyClean(aComponent);
      return;
    }
    {
      this.dirtyComponents.remove(aComponent);
    }
  }
  /**
   * Validate all of the components that have been marked invalid.
   * @see #addInvalidComponent
   */
  validateInvalidComponents(): void {
    let ic: List<Component>;
    {
      if (this.invalidComponents == null) {
        return;
      }
      ic = this.invalidComponents;
      this.invalidComponents = null;
    }
    let n = ic.size();
    for (let i = 0; i < n; i++) {
      let c = ic.get(i);
      let stack = AccessController.getContext();
      let acc = AWTAccessor.getComponentAccessor().getAccessControlContext(c);
      RepaintManager.javaSecurityAccess.doIntersectionPrivilege(new (RepaintManager$3())().$o(this).$c(c), stack, acc);
    }
  }
  /**
   * This is invoked to process paint requests.  It's needed
   * for backward compatibility in so far as RepaintManager would previously
   * not see paint requests for top levels, so, we have to make sure
   * a subclass correctly paints any dirty top levels.
   */
  prePaintDirtyRegions(): void {
    let dirtyComponents: JMap<Component, Rectangle>;
    let runnableList: List<Runnable>;
    {
      dirtyComponents = this.dirtyComponents;
      runnableList = this.runnableList;
      this.runnableList = null;
    }
    if (runnableList != null) {
      for (const $it1 = runnableList.iterator(); $it1.hasNext(); ) {
        let runnable = $it1.next();
        runnable();
      }
    }
    this.paintDirtyRegions$();
    if (dirtyComponents.size() > 0) {
      this.paintDirtyRegions$Map$RepaintManager(dirtyComponents);
    }
  }
  updateWindows(dirtyComponents: JMap<Component, Rectangle>): void {
    let toolkit = Toolkit.getDefaultToolkit();
    if (!($J.isa(toolkit, SunToolkit) && (toolkit).needUpdateWindow())) {
      return;
    }
    let windows = new HashSet();
    let dirtyComps = dirtyComponents.keySet();
    for (const $it2 = dirtyComps.iterator(); $it2.hasNext(); ) {
      let dirty = $it2.next();
      let window = dirty instanceof Window ? dirty : SwingUtilities.getWindowAncestor(dirty);
      if (window != null && !window.isOpaque()) {
        windows.add(window);
      }
    }
    for (const $it3 = windows.iterator(); $it3.hasNext(); ) {
      let window = $it3.next();
      AWTAccessor.getWindowAccessor().updateWindow(window);
    }
  }
  isPainting(): boolean {
    return this.painting;
  }
  /**
   * Paint all of the components that have been marked dirty.
   *
   * @see #addDirtyRegion
   */
  paintDirtyRegions$(): void {
    {
      let tmp = this.tmpDirtyComponents;
      this.tmpDirtyComponents = this.dirtyComponents;
      this.dirtyComponents = tmp;
      this.dirtyComponents.clear();
    }
    this.paintDirtyRegions$Map$RepaintManager(this.tmpDirtyComponents);
  }
  paintDirtyRegions$Map$RepaintManager(tmpDirtyComponents: JMap<Component, Rectangle>): void {
    if (tmpDirtyComponents.isEmpty()) {
      return;
    }
    let roots = new ArrayList(tmpDirtyComponents.size());
    for (const $it4 = tmpDirtyComponents.keySet().iterator(); $it4.hasNext(); ) {
      let dirty = $it4.next();
      this.collectDirtyComponents(tmpDirtyComponents, dirty, roots);
    }
    let count = new AtomicInteger(roots.size());
    this.painting = true;
    try {
      for (let j = 0; j < count.get(); j++) {
        let i = j;
        let dirtyComponent = roots.get(j);
        let stack = AccessController.getContext();
        let acc = AWTAccessor.getComponentAccessor().getAccessControlContext(dirtyComponent);
        RepaintManager.javaSecurityAccess.doIntersectionPrivilege(new (RepaintManager$4())().$o(this).$c(tmpDirtyComponents, dirtyComponent, roots, i, count), stack, acc);
      }
    } finally {
      this.painting = false;
    }
    this.updateWindows(tmpDirtyComponents);
    tmpDirtyComponents.clear();
  }
  /**
   * Removes any components from roots that are children of
   * root.
   */
  adjustRoots(root: JComponent, roots: List<Component>, index: number): void {
    for (let i = (roots.size() - 1) | 0; i >= index; i--) {
      let c = roots.get(i);
      for (; ; ) {
        if (c === root || !(c instanceof JComponent)) {
          break;
        }
        c = c.getParent();
      }
      if (c === root) {
        roots.removeAt(i);
      }
    }
  }
  collectDirtyComponents(dirtyComponents: JMap<Component, Rectangle>, dirtyComponent: Component, roots: List<Component>): void {
    let dx: number;
    let dy: number;
    let rootDx: number;
    let rootDy: number;
    let component: Component;
    let rootDirtyComponent: Component;
    let parent: Component;
    let cBounds: Rectangle;
    component = rootDirtyComponent = dirtyComponent;
    let x = dirtyComponent.getX();
    let y = dirtyComponent.getY();
    let w = dirtyComponent.getWidth();
    let h = dirtyComponent.getHeight();
    dx = rootDx = 0;
    dy = rootDy = 0;
    this.tmp.setBounds$Rectangle(dirtyComponents.get(dirtyComponent));
    SwingUtilities.computeIntersection(0, 0, w, h, this.tmp);
    if (this.tmp.isEmpty()) {
      return;
    }
    for (; ; ) {
      if (!(component instanceof JComponent)) {
        break;
      }
      parent = component.getParent();
      if (parent == null) {
        break;
      }
      component = parent;
      dx = (dx + x) | 0;
      dy = (dy + y) | 0;
      this.tmp.setLocation$int$int((this.tmp.x_ + x) | 0, (this.tmp.y_ + y) | 0);
      x = component.getX();
      y = component.getY();
      w = component.getWidth();
      h = component.getHeight();
      this.tmp = SwingUtilities.computeIntersection(0, 0, w, h, this.tmp);
      if (this.tmp.isEmpty()) {
        return;
      }
      if (dirtyComponents.get(component) != null) {
        rootDirtyComponent = component;
        rootDx = dx;
        rootDy = dy;
      }
    }
    if (dirtyComponent !== rootDirtyComponent) {
      let r: Rectangle;
      this.tmp.setLocation$int$int((this.tmp.x_ + rootDx - dx) | 0, (this.tmp.y_ + rootDy - dy) | 0);
      r = dirtyComponents.get(rootDirtyComponent);
      SwingUtilities.computeUnion(this.tmp.x_, this.tmp.y_, this.tmp.width_, this.tmp.height_, r);
    }
    if (!roots.contains(rootDirtyComponent)) {
      roots.add(rootDirtyComponent);
    }
  }
  /**
   * Returns a string that displays and identifies this
   * object's properties.
   *
   * @return a String representation of this object
   */
  toString(): string {
    let sb = new StringBuilder();
    if (this.dirtyComponents != null) {
      sb.append('' + $J.str(this.dirtyComponents));
    }
    return sb.toString();
  }
  /**
   * Return the offscreen buffer that should be used as a double buffer with
   * the component <code>c</code>.
   * By default there is a double buffer per RepaintManager.
   * The buffer might be smaller than <code>(proposedWidth,proposedHeight)</code>
   * This happens when the maximum double buffer size as been set for the receiving
   * repaint manager.
   *
   * @param c the component
   * @param proposedWidth the width of the buffer
   * @param proposedHeight the height of the buffer
   *
   * @return the image
   */
  getOffscreenBuffer(c: Component, proposedWidth: number, proposedHeight: number): Image {
    let delegate = this.getDelegate(c);
    if (delegate != null) {
      return delegate.getOffscreenBuffer(c, proposedWidth, proposedHeight);
    }
    return this._getOffscreenBuffer(c, proposedWidth, proposedHeight);
  }
  /**
   * Return a volatile offscreen buffer that should be used as a
   * double buffer with the specified component <code>c</code>.
   * The image returned will be an instance of VolatileImage, or null
   * if a VolatileImage object could not be instantiated.
   * This buffer might be smaller than <code>(proposedWidth,proposedHeight)</code>.
   * This happens when the maximum double buffer size has been set for this
   * repaint manager.
   *
   * @param c the component
   * @param proposedWidth the width of the buffer
   * @param proposedHeight the height of the buffer
   *
   * @return the volatile image
   * @see java.awt.image.VolatileImage
   * @since 1.4
   */
  getVolatileOffscreenBuffer(c: Component, proposedWidth: number, proposedHeight: number): Image {
    let delegate = this.getDelegate(c);
    if (delegate != null) {
      return delegate.getVolatileOffscreenBuffer(c, proposedWidth, proposedHeight);
    }
    let w = (c instanceof Window) ? c : SwingUtilities.getWindowAncestor(c);
    if (w != null && !w.isOpaque()) {
      let tk = Toolkit.getDefaultToolkit();
      if (($J.isa(tk, SunToolkit)) && ((tk).needUpdateWindow())) {
        return null;
      }
    }
    let config = c.getGraphicsConfiguration();
    if (config == null) {
      config = GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDefaultConfiguration();
    }
    let maxSize = this.getDoubleBufferMaximumSize();
    let width = proposedWidth < 1 ? 1 : (proposedWidth > maxSize.width_ ? maxSize.width_ : proposedWidth);
    let height = proposedHeight < 1 ? 1 : (proposedHeight > maxSize.height_ ? maxSize.height_ : proposedHeight);
    let image = this.volatileMap.get(config);
    if (image == null || image.getWidth$() < width || image.getHeight$() < height) {
      if (image != null) {
        image.flush();
      }
      image = config.createCompatibleVolatileImage$int$int$int(width, height, RepaintManager.volatileBufferType);
      this.volatileMap.put(config, image);
    }
    return image;
  }
  _getOffscreenBuffer(c: Component, proposedWidth: number, proposedHeight: number): Image {
    let maxSize = this.getDoubleBufferMaximumSize();
    let doubleBuffer: RepaintManager$DoubleBufferInfo;
    let width: number;
    let height: number;
    let w = (c instanceof Window) ? c : SwingUtilities.getWindowAncestor(c);
    if (!w.isOpaque()) {
      let tk = Toolkit.getDefaultToolkit();
      if (($J.isa(tk, SunToolkit)) && ((tk).needUpdateWindow())) {
        return null;
      }
    }
    if (this.standardDoubleBuffer == null) {
      this.standardDoubleBuffer = new RepaintManager$DoubleBufferInfo()._RepaintManager$DoubleBufferInfo();
    }
    doubleBuffer = this.standardDoubleBuffer;
    width = proposedWidth < 1 ? 1 : (proposedWidth > maxSize.width_ ? maxSize.width_ : proposedWidth);
    height = proposedHeight < 1 ? 1 : (proposedHeight > maxSize.height_ ? maxSize.height_ : proposedHeight);
    if (doubleBuffer.needsReset || (doubleBuffer.image != null && (doubleBuffer.size_.width_ < width || doubleBuffer.size_.height_ < height))) {
      doubleBuffer.needsReset = false;
      if (doubleBuffer.image != null) {
        doubleBuffer.image.flush();
        doubleBuffer.image = null;
      }
      width = Math.max(doubleBuffer.size_.width_, width);
      height = Math.max(doubleBuffer.size_.height_, height);
    }
    let result = doubleBuffer.image;
    if (doubleBuffer.image == null) {
      result = c.createImage$int$int(width, height);
      doubleBuffer.size_ = new Dimension()._Dimension$int$int(width, height);
      if (c instanceof JComponent) {
        (c).setCreatedDoubleBuffer(true);
        doubleBuffer.image = result;
      }
    }
    return result;
  }
  /**
   * Returns the maximum double buffer size.
   *
   * @return a Dimension object representing the maximum size
   */
  getDoubleBufferMaximumSize(): Dimension {
    if (this.doubleBufferMaxSize == null) {
      try {
        let virtualBounds = new Rectangle()._Rectangle$();
        let ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
        for (let gd of ge.getScreenDevices()) {
          let gc = gd.getDefaultConfiguration();
          virtualBounds = virtualBounds.union(gc.getBounds());
        }
        this.doubleBufferMaxSize = new Dimension()._Dimension$int$int(virtualBounds.width_, virtualBounds.height_);
      } catch ($e5) {
        if ($J.isa($e5, HeadlessException)) {
          let e = $J.exc($e5);
          this.doubleBufferMaxSize = new Dimension()._Dimension$int$int(2147483647, 2147483647);
        } else {
          throw $e5;
        }
      }
    }
    return this.doubleBufferMaxSize;
  }
  /**
   * Returns true if this RepaintManager is double buffered.
   * The default value for this property may vary from platform
   * to platform.  On platforms where native double buffering
   * is supported in the AWT, the default value will be <code>false</code>
   * to avoid unnecessary buffering in Swing.
   * On platforms where native double buffering is not supported,
   * the default value will be <code>true</code>.
   *
   * @return true if this object is double buffered
   */
  isDoubleBufferingEnabled(): boolean {
    return this.doubleBufferingEnabled;
  }
  /**
   * This resets the double buffer. Actually, it marks the double buffer
   * as invalid, the double buffer will then be recreated on the next
   * invocation of getOffscreenBuffer.
   */
  resetDoubleBuffer(): void {
    if (this.standardDoubleBuffer != null) {
      this.standardDoubleBuffer.needsReset = true;
    }
  }
  /**
   * This resets the volatile double buffer.
   */
  resetVolatileDoubleBuffer(gc: GraphicsConfiguration): void {
    let image = this.volatileMap.remove(gc);
    if (image != null) {
      image.flush();
    }
  }
  /**
   * Returns true if we should use the <code>Image</code> returned
   * from <code>getVolatileOffscreenBuffer</code> to do double buffering.
   */
  useVolatileDoubleBuffer(): boolean {
    return RepaintManager.volatileImageBufferEnabled;
  }
  /**
   * Returns true if the current thread is the thread painting.  This
   * will return false if no threads are painting.
   */
  isPaintingThread(): boolean {
    return (Thread.currentThread() === this.paintThread);
  }
  /**
   * Paints a region of a component
   *
   * @param paintingComponent Component to paint
   * @param bufferComponent Component to obtain buffer for
   * @param g Graphics to paint to
   * @param x X-coordinate
   * @param y Y-coordinate
   * @param w Width
   * @param h Height
   */
  paint(paintingComponent: JComponent, bufferComponent: JComponent, g: Graphics, x: number, y: number, w: number, h: number): void {
    let paintManager = this.getPaintManager();
    if (!this.isPaintingThread()) {
      if (paintManager.getClass() !== $J.cls(RepaintManager$PaintManager)) {
        paintManager = new RepaintManager$PaintManager()._RepaintManager$PaintManager();
        paintManager.repaintManager = this;
      }
    }
    if (!paintManager.paint(paintingComponent, bufferComponent, g, x, y, w, h)) {
      g.setClip$int$int$int$int(x, y, w, h);
      paintingComponent.paintToOffscreen(g, x, y, w, h, (x + w) | 0, (y + h) | 0);
    }
  }
  /**
   * Does a copy area on the specified region.
   *
   * @param clip Whether or not the copyArea needs to be clipped to the
   *             Component's bounds.
   */
  copyArea(c: JComponent, g: Graphics, x: number, y: number, w: number, h: number, deltaX: number, deltaY: number, clip: boolean): void {
    this.getPaintManager().copyArea(c, g, x, y, w, h, deltaX, deltaY, clip);
  }
  /**
   * Notify the attached repaint listeners that an area of the {@code c} component
   * has been immediately repainted, that is without scheduling a repaint runnable,
   * due to performing a "blit" (via calling the {@code copyArea} method).
   *
   * @param c the component
   * @param x the x coordinate of the area
   * @param y the y coordinate of the area
   * @param w the width of the area
   * @param h the height of the area
   */
  notifyRepaintPerformed(c: JComponent, x: number, y: number, w: number, h: number): void {
    for (const $it6 = this.repaintListeners.iterator(); $it6.hasNext(); ) {
      let l = $it6.next();
      $J.fn(l, 'repaintPerformed')(c, x, y, w, h);
    }
  }
  /**
   * Invoked prior to any paint/copyArea method calls.  This will
   * be followed by an invocation of <code>endPaint</code>.
   * <b>WARNING</b>: Callers of this method need to wrap the call
   * in a <code>try/finally</code>, otherwise if an exception is thrown
   * during the course of painting the RepaintManager may
   * be left in a state in which the screen is not updated, eg:
   * <pre>
   * repaintManager.beginPaint();
   * try {
   *   repaintManager.paint(...);
   * } finally {
   *   repaintManager.endPaint();
   * }
   * </pre>
   */
  beginPaint(): void {
    let multiThreadedPaint = false;
    let paintDepth: number;
    let currentThread = Thread.currentThread();
    {
      paintDepth = this.paintDepth;
      if (this.paintThread == null || currentThread === this.paintThread) {
        this.paintThread = currentThread;
        this.paintDepth++;
      } else {
        multiThreadedPaint = true;
      }
    }
    if (!multiThreadedPaint && paintDepth === 0) {
      this.getPaintManager().beginPaint();
    }
  }
  /**
   * Invoked after <code>beginPaint</code> has been invoked.
   */
  endPaint(): void {
    if (this.isPaintingThread()) {
      let paintManager = null;
      {
        if (--this.paintDepth === 0) {
          paintManager = this.getPaintManager();
        }
      }
      if (paintManager != null) {
        paintManager.endPaint();
        {
          this.paintThread = null;
        }
      }
    }
  }
  /**
   * If possible this will show a previously rendered portion of
   * a Component.  If successful, this will return true, otherwise false.
   * <p>
   * WARNING: This method is invoked from the native toolkit thread, be
   * very careful as to what methods this invokes!
   */
  show(c: Container, x: number, y: number, w: number, h: number): boolean {
    return this.getPaintManager().show(c, x, y, w, h);
  }
  /**
   * Invoked when the doubleBuffered or useTrueDoubleBuffering
   * properties of a JRootPane change.  This may come in on any thread.
   */
  doubleBufferingChanged(rootPane: JRootPane): void {
    this.getPaintManager().doubleBufferingChanged(rootPane);
  }
  /**
   * Sets the <code>PaintManager</code> that is used to handle all
   * double buffered painting.
   *
   * @param paintManager The PaintManager to use.  Passing in null indicates
   *        the fallback PaintManager should be used.
   */
  setPaintManager(paintManager: RepaintManager$PaintManager): void {
    if (paintManager == null) {
      paintManager = new RepaintManager$PaintManager()._RepaintManager$PaintManager();
    }
    let oldPaintManager: RepaintManager$PaintManager;
    {
      oldPaintManager = this.paintManager;
      this.paintManager = paintManager;
      paintManager.repaintManager = this;
    }
    if (oldPaintManager != null) {
      oldPaintManager.dispose$();
    }
  }
  getPaintManager(): RepaintManager$PaintManager {
    if (this.paintManager == null) {
      let paintManager = null;
      if (this.doubleBufferingEnabled && !RepaintManager.nativeDoubleBuffering) {
        {
          let tk: Toolkit;
          switch (this.bufferStrategyType) {
            case RepaintManager.BUFFER_STRATEGY_NOT_SPECIFIED:
              tk = Toolkit.getDefaultToolkit();
              if ($J.isa(tk, SunToolkit)) {
                let stk = tk;
                if (stk.useBufferPerWindow()) {
                  paintManager = new BufferStrategyPaintManager()._BufferStrategyPaintManager();
                }
              }
              break;
            case RepaintManager.BUFFER_STRATEGY_SPECIFIED_ON:
              paintManager = new BufferStrategyPaintManager()._BufferStrategyPaintManager();
              break;
            default:
              break;
          }
        }
      }
      this.setPaintManager(paintManager);
    }
    return this.paintManager;
  }
  scheduleProcessingRunnable(context: AppContext): void {
    if (this.processingRunnable.markPending()) {
      let tk = Toolkit.getDefaultToolkit();
      if ($J.isa(tk, SunToolkit)) {
        SunToolkit.getSystemEventQueueImplPP(context).postEvent$AWTEvent(new InvocationEvent()._InvocationEvent$Object$Runnable(Toolkit.getDefaultToolkit(), $J.fn(this.processingRunnable, 'run')));
      } else {
        Toolkit.getDefaultToolkit().getSystemEventQueue().postEvent$AWTEvent(new InvocationEvent()._InvocationEvent$Object$Runnable(Toolkit.getDefaultToolkit(), $J.fn(this.processingRunnable, 'run')));
      }
    }
  }
  getDelegate(c: Component): RepaintManager {
    let delegate = SwingUtilities3.getDelegateRepaintManager(c);
    if (this === delegate) {
      delegate = null;
    }
    return delegate;
  }
  static $clinit() {
    RepaintManager.repaintManagerKey = $J.cls(RepaintManager);
    RepaintManager.volatileImageBufferEnabled = true;
    RepaintManager.javaSecurityAccess = SharedSecrets.getJavaSecurityAccess();
    RepaintManager.displayChangedHandler = new RepaintManager$DisplayChangedHandler()._RepaintManager$DisplayChangedHandler();
    SwingAccessor.setRepaintManagerAccessor(new (RepaintManager$1())());
    let t1 = $J.equals('true', AccessController.doPrivileged(new GetPropertyAction('swing.volatileImageBufferEnabled', 'true')));
    RepaintManager.volatileImageBufferEnabled = t1;
    let headless = GraphicsEnvironment.isHeadless();
    if (RepaintManager.volatileImageBufferEnabled && headless) {
      RepaintManager.volatileImageBufferEnabled = false;
    }
    let t2 = $J.equals('true', AccessController.doPrivileged(new GetPropertyAction('awt.nativeDoubleBuffering')));
    RepaintManager.nativeDoubleBuffering = t2;
    let bs = AccessController.doPrivileged(new GetPropertyAction('swing.bufferPerWindow'));
    if (headless) {
      RepaintManager.BUFFER_STRATEGY_TYPE = RepaintManager.BUFFER_STRATEGY_SPECIFIED_OFF;
    } else if (bs == null) {
      RepaintManager.BUFFER_STRATEGY_TYPE = RepaintManager.BUFFER_STRATEGY_NOT_SPECIFIED;
    } else if ($J.equals('true', bs)) {
      RepaintManager.BUFFER_STRATEGY_TYPE = RepaintManager.BUFFER_STRATEGY_SPECIFIED_ON;
    } else {
      RepaintManager.BUFFER_STRATEGY_TYPE = RepaintManager.BUFFER_STRATEGY_SPECIFIED_OFF;
    }
    let t3 = $J.equals('true', AccessController.doPrivileged(new GetPropertyAction('swing.handleTopLevelPaint', 'true')));
    RepaintManager.HANDLE_TOP_LEVEL_PAINT = t3;
    let ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
    if ($J.isa(ge, SunGraphicsEnvironment)) {
      (ge).addDisplayChangedListener(RepaintManager.displayChangedHandler);
    }
    let tk = Toolkit.getDefaultToolkit();
    if (($J.isa(tk, SunToolkit)) && (tk).isSwingBackbufferTranslucencySupported()) {
      RepaintManager.volatileBufferType = Transparency.TRANSLUCENT;
    } else {
      RepaintManager.volatileBufferType = Transparency.OPAQUE;
    }
  }
}

/**
 * PaintManager is used to handle all double buffered painting for
 * Swing.  Subclasses should call back into the JComponent method
 * <code>paintToOffscreen</code> to handle the actual painting.
 */
export class RepaintManager$PaintManager extends JObject {
  /**
   * RepaintManager the PaintManager has been installed on.
   */
  repaintManager: RepaintManager = null;
  isRepaintingRoot_: boolean = false;
  _RepaintManager$PaintManager(): this {
    return this;
  }
  /**
   * Paints a region of a component
   *
   * @param paintingComponent Component to paint
   * @param bufferComponent Component to obtain buffer for
   * @param g Graphics to paint to
   * @param x X-coordinate
   * @param y Y-coordinate
   * @param w Width
   * @param h Height
   * @return true if painting was successful.
   */
  paint(paintingComponent: JComponent, bufferComponent: JComponent, g: Graphics, x: number, y: number, w: number, h: number): boolean {
    let paintCompleted = false;
    let offscreen: Image;
    let sw = (w + 1) | 0;
    let sh = (h + 1) | 0;
    if (this.repaintManager.useVolatileDoubleBuffer() && (offscreen = this.getValidImage(this.repaintManager.getVolatileOffscreenBuffer(bufferComponent, sw, sh))) != null) {
      let vImage = offscreen;
      let gc = bufferComponent.getGraphicsConfiguration();
      for (let i = 0; !paintCompleted && i < RepaintManager.VOLATILE_LOOP_MAX; i++) {
        if (vImage.validate(gc) === VolatileImage.IMAGE_INCOMPATIBLE) {
          this.repaintManager.resetVolatileDoubleBuffer(gc);
          offscreen = this.repaintManager.getVolatileOffscreenBuffer(bufferComponent, sw, sh);
          vImage = offscreen;
        }
        this.paintDoubleBuffered(paintingComponent, vImage, g, x, y, w, h);
        paintCompleted = !vImage.contentsLost();
      }
    }
    if (!paintCompleted && (offscreen = this.getValidImage(this.repaintManager.getOffscreenBuffer(bufferComponent, w, h))) != null) {
      this.paintDoubleBuffered(paintingComponent, offscreen, g, x, y, w, h);
      paintCompleted = true;
    }
    return paintCompleted;
  }
  /**
   * Does a copy area on the specified region.
   */
  copyArea(c: JComponent, g: Graphics, x: number, y: number, w: number, h: number, deltaX: number, deltaY: number, clip: boolean): void {
    g.copyArea(x, y, w, h, deltaX, deltaY);
  }
  /**
   * Invoked prior to any calls to paint or copyArea.
   */
  beginPaint(): void {
  }
  /**
   * Invoked to indicate painting has been completed.
   */
  endPaint(): void {
  }
  /**
   * Shows a region of a previously rendered component.  This
   * will return true if successful, false otherwise.  The default
   * implementation returns false.
   */
  show(c: Container, x: number, y: number, w: number, h: number): boolean {
    return false;
  }
  /**
   * Invoked when the doubleBuffered or useTrueDoubleBuffering
   * properties of a JRootPane change.  This may come in on any thread.
   */
  doubleBufferingChanged(rootPane: JRootPane): void {
  }
  /**
   * Paints a portion of a component to an offscreen buffer.
   */
  paintDoubleBuffered(c: JComponent, image: Image, g: Graphics, clipX: number, clipY: number, clipW: number, clipH: number): void {
    if (image instanceof VolatileImage && this.isPixelsCopying(c, g)) {
      this.paintDoubleBufferedFPScales(c, image, g, clipX, clipY, clipW, clipH);
    } else {
      this.paintDoubleBufferedImpl(c, image, g, clipX, clipY, clipW, clipH);
    }
  }
  paintDoubleBufferedImpl(c: JComponent, image: Image, g: Graphics, clipX: number, clipY: number, clipW: number, clipH: number): void {
    let osg = image.getGraphics();
    let bw = Math.min(clipW, image.getWidth$ImageObserver(null));
    let bh = Math.min(clipH, image.getHeight$ImageObserver(null));
    let x: number;
    let y: number;
    let maxx: number;
    let maxy: number;
    try {
      for (x = clipX, maxx = (clipX + clipW) | 0; x < maxx; x = (x + bw) | 0) {
        for (y = clipY, maxy = (clipY + clipH) | 0; y < maxy; y = (y + bh) | 0) {
          osg.translate$int$int(-x, -y);
          osg.setClip$int$int$int$int(x, y, bw, bh);
          if (RepaintManager.volatileBufferType !== Transparency.OPAQUE && osg instanceof Graphics2D) {
            let g2d = osg;
            let oldBg = g2d.getBackground();
            g2d.setBackground(c.getBackground());
            g2d.clearRect(x, y, bw, bh);
            g2d.setBackground(oldBg);
          }
          c.paintToOffscreen(osg, x, y, bw, bh, maxx, maxy);
          g.setClip$int$int$int$int(x, y, bw, bh);
          if (RepaintManager.volatileBufferType !== Transparency.OPAQUE && g instanceof Graphics2D) {
            let g2d = g;
            let oldComposite = g2d.getComposite();
            g2d.setComposite(AlphaComposite.Src);
            g2d.drawImage$Image$int$int$ImageObserver(image, x, y, c);
            g2d.setComposite(oldComposite);
          } else {
            g.drawImage$Image$int$int$ImageObserver(image, x, y, c);
          }
          osg.translate$int$int(x, y);
        }
      }
    } finally {
      osg.dispose();
    }
  }
  paintDoubleBufferedFPScales(c: JComponent, image: Image, g: Graphics, clipX: number, clipY: number, clipW: number, clipH: number): void {
    let osg = image.getGraphics();
    let g2d = g;
    let osg2d = osg;
    let identity = new AffineTransform()._AffineTransform$();
    let bw = Math.min(clipW, image.getWidth$ImageObserver(null));
    let bh = Math.min(clipH, image.getHeight$ImageObserver(null));
    let x: number;
    let y: number;
    let maxx: number;
    let maxy: number;
    let tx = g2d.getTransform();
    let scaleX = tx.getScaleX();
    let scaleY = tx.getScaleY();
    let trX = tx.getTranslateX();
    let trY = tx.getTranslateY();
    let translucent = RepaintManager.volatileBufferType !== Transparency.OPAQUE;
    let oldComposite = g2d.getComposite();
    try {
      for (x = clipX, maxx = (clipX + clipW) | 0; x < maxx; x = (x + bw) | 0) {
        for (y = clipY, maxy = (clipY + clipH) | 0; y < maxy; y = (y + bh) | 0) {
          let pixelx1 = Region.clipRound(x * scaleX + trX);
          let pixely1 = Region.clipRound(y * scaleY + trY);
          let pixelx2 = Region.clipRound(((x + bw) | 0) * scaleX + trX);
          let pixely2 = Region.clipRound(((y + bh) | 0) * scaleY + trY);
          let pixelw = (pixelx2 - pixelx1) | 0;
          let pixelh = (pixely2 - pixely1) | 0;
          osg2d.setTransform(identity);
          if (translucent) {
            let oldBg = g2d.getBackground();
            g2d.setBackground(c.getBackground());
            g2d.clearRect(pixelx1, pixely1, pixelw, pixelh);
            g2d.setBackground(oldBg);
          }
          osg2d.setClip$int$int$int$int(0, 0, pixelw, pixelh);
          osg2d.translate$double$double(trX - pixelx1, trY - pixely1);
          osg2d.scale(scaleX, scaleY);
          c.paintToOffscreen(osg, x, y, bw, bh, maxx, maxy);
          g2d.setTransform(identity);
          g2d.setClip$int$int$int$int(pixelx1, pixely1, pixelw, pixelh);
          let stx = new AffineTransform()._AffineTransform$();
          stx.translate(pixelx1, pixely1);
          stx.scale(scaleX, scaleY);
          g2d.setTransform(stx);
          if (translucent) {
            g2d.setComposite(AlphaComposite.Src);
          }
          g2d.drawImage$Image$int$int$ImageObserver(image, 0, 0, c);
          if (translucent) {
            g2d.setComposite(oldComposite);
          }
          g2d.setTransform(tx);
        }
      }
    } finally {
      osg.dispose();
    }
  }
  /**
   * If <code>image</code> is non-null with a positive size it
   * is returned, otherwise null is returned.
   */
  getValidImage(image: Image): Image {
    if (image != null && image.getWidth$ImageObserver(null) > 0 && image.getHeight$ImageObserver(null) > 0) {
      return image;
    }
    return null;
  }
  /**
   * Schedules a repaint for the specified component.  This differs
   * from <code>root.repaint</code> in that if the RepaintManager is
   * currently processing paint requests it'll process this request
   * with the current set of requests.
   */
  repaintRoot(root: JComponent): void {
    // assert (repaintManager.repaintRoot == null)
    if (this.repaintManager.painting) {
      this.repaintManager.repaintRoot_ = root;
    } else {
      root.repaint$();
    }
  }
  /**
   * Returns true if the component being painted is the root component
   * that was previously passed to <code>repaintRoot</code>.
   */
  isRepaintingRoot(): boolean {
    return this.isRepaintingRoot_;
  }
  /**
   * Cleans up any state.  After invoked the PaintManager will no
   * longer be used anymore.
   */
  dispose$(): void {
  }
  isPixelsCopying(c: JComponent, g: Graphics): boolean {
    let tx = RepaintManager$PaintManager.getTransform(g);
    let gc = c.getGraphicsConfiguration();
    if (tx == null || gc == null || !SwingUtilities2.isFloatingPointScale(tx)) {
      return false;
    }
    let gcTx = gc.getDefaultTransform();
    return gcTx.getScaleX() === tx.getScaleX() && gcTx.getScaleY() === tx.getScaleY();
  }
  static getTransform(g: Graphics): AffineTransform {
    if ($J.isa(g, SunGraphics2D)) {
      return (g).transform;
    } else if (g instanceof Graphics2D) {
      return (g).getTransform();
    }
    return null;
  }
}

export class RepaintManager$DoubleBufferInfo extends JObject {
  image: Image = null;
  size_: Dimension = null;
  needsReset: boolean = false;
  _RepaintManager$DoubleBufferInfo(): this {
    this.needsReset = false;
    return this;
  }
}

/**
 * Listener installed to detect display changes. When display changes,
 * schedules a callback to notify all RepaintManagers of the display
 * changes. Only one DisplayChangedHandler is ever installed. The
 * singleton instance will schedule notification for all AppContexts.
 */
export class RepaintManager$DisplayChangedHandler extends JObject {
  _RepaintManager$DisplayChangedHandler(): this {
    return this;
  }
}

/**
 * Runnable used to process all repaint/revalidate requests.
 */
export class RepaintManager$ProcessingRunnable extends JObject {
  pending: boolean = false;
  _RepaintManager$ProcessingRunnable(): this {
    return this;
  }
  /**
   * Marks this processing runnable as pending. If this was not
   * already marked as pending, true is returned.
   */
  markPending(): boolean {
    if (!this.pending) {
      this.pending = true;
      return true;
    }
    return false;
  }
  run(): void {
    {
      this.pending = false;
    }
    this.$outer.scheduleHeavyWeightPaints();
    this.$outer.validateInvalidComponents();
    this.$outer.prePaintDirtyRegions();
  }
}

let $RepaintManager$3: any = null;
/** An anonymous class (RepaintManager.java:755). */
function RepaintManager$3(): any {
  return $RepaintManager$3 ??= $J.local(class extends JObject {
    run(): Void {
      this.$cv_c.validate();
      return null;
    }
    $c($c): this {
      this.$cv_c = $c;
      return this;
    }
  }, 'javax.swing.RepaintManager$3', ['java.security.PrivilegedAction']);
}

let $RepaintManager$4: any = null;
/** An anonymous class (RepaintManager.java:861). */
function RepaintManager$4(): any {
  return $RepaintManager$4 ??= $J.local(class extends JObject {
    run(): Void {
      let rect = this.$cv_tmpDirtyComponents.get(this.$cv_dirtyComponent);
      if (rect == null) {
        return null;
      }
      let localBoundsH = this.$cv_dirtyComponent.getHeight();
      let localBoundsW = this.$cv_dirtyComponent.getWidth();
      SwingUtilities.computeIntersection(0, 0, localBoundsW, localBoundsH, rect);
      if (this.$cv_dirtyComponent instanceof JComponent) {
        (this.$cv_dirtyComponent).paintImmediately$int$int$int$int(rect.x_, rect.y_, rect.width_, rect.height_);
      } else if (this.$cv_dirtyComponent.isShowing()) {
        let g = JComponent.safelyGetGraphics$Component$Component(this.$cv_dirtyComponent, this.$cv_dirtyComponent);
        if (g != null) {
          g.setClip$int$int$int$int(rect.x_, rect.y_, rect.width_, rect.height_);
          try {
            this.$cv_dirtyComponent.paint(g);
          } finally {
            g.dispose();
          }
        }
      }
      if (this.$outer.repaintRoot_ != null) {
        this.$outer.adjustRoots(this.$outer.repaintRoot_, this.$cv_roots, (this.$cv_i + 1) | 0);
        this.$cv_count.set(this.$cv_roots.size());
        this.$outer.paintManager.isRepaintingRoot_ = true;
        this.$outer.repaintRoot_.paintImmediately$int$int$int$int(0, 0, this.$outer.repaintRoot_.getWidth(), this.$outer.repaintRoot_.getHeight());
        this.$outer.paintManager.isRepaintingRoot_ = false;
        this.$outer.repaintRoot_ = null;
      }
      return null;
    }
    $c($tmpDirtyComponents, $dirtyComponent, $roots, $i, $count): this {
      this.$cv_tmpDirtyComponents = $tmpDirtyComponents; this.$cv_dirtyComponent = $dirtyComponent; this.$cv_roots = $roots; this.$cv_i = $i; this.$cv_count = $count;
      return this;
    }
  }, 'javax.swing.RepaintManager$4', ['java.security.PrivilegedAction']);
}

let $RepaintManager$1: any = null;
/** An anonymous class (RepaintManager.java:203). */
function RepaintManager$1(): any {
  return $RepaintManager$1 ??= $J.local(class extends JObject {
  }, 'javax.swing.RepaintManager$1', ['sun.swing.SwingAccessor$RepaintManagerAccessor']);
}

$J.define(RepaintManager, 'javax.swing.RepaintManager', { kind: 'class', sup: 'java.lang.Object', ctors: { 'short': '_RepaintManager$short', '': '_RepaintManager$' }, meths: { 'clearImages(int,int)': 'clearImages$int$int$RepaintManager', 'clearImages()': 'clearImages$$RepaintManager', 'paintDirtyRegions(java.util.Map)': 'paintDirtyRegions$Map$RepaintManager', 'paintDirtyRegions()': 'paintDirtyRegions$', 'addDirtyRegion(java.applet.Applet,int,int,int,int)': 'addDirtyRegion$Applet$int$int$int$int', 'addDirtyRegion(java.awt.Window,int,int,int,int)': 'addDirtyRegion$Window$int$int$int$int', 'addDirtyRegion(javax.swing.JComponent,int,int,int,int)': 'addDirtyRegion$JComponent$int$int$int$int', 'currentManager(javax.swing.JComponent)': 'currentManager$JComponent', 'currentManager(sun.awt.AppContext)': 'currentManager$AppContext', 'currentManager(java.awt.Component)': 'currentManager$Component' }, clinit: true, lazy: ['HANDLE_TOP_LEVEL_PAINT', 'BUFFER_STRATEGY_TYPE', 'repaintManagerKey', 'volatileImageBufferEnabled', 'volatileBufferType', 'nativeDoubleBuffering', 'javaSecurityAccess', 'displayChangedHandler'] });
$J.define(RepaintManager$PaintManager, 'javax.swing.RepaintManager$PaintManager', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_RepaintManager$PaintManager' }, meths: { 'dispose()': 'dispose$' } });
$J.define(RepaintManager$DoubleBufferInfo, 'javax.swing.RepaintManager$DoubleBufferInfo', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_RepaintManager$DoubleBufferInfo' } });
$J.define(RepaintManager$DisplayChangedHandler, 'javax.swing.RepaintManager$DisplayChangedHandler', { kind: 'class', ifaces: ['sun.awt.DisplayChangedListener'], sup: 'java.lang.Object', ctors: { '': '_RepaintManager$DisplayChangedHandler' } });
$J.define(RepaintManager$ProcessingRunnable, 'javax.swing.RepaintManager$ProcessingRunnable', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { '': '_RepaintManager$ProcessingRunnable' }, inner: true });
$J.module(() => {
  SwingUtilities3 = $J.load('com.sun.java.swing.SwingUtilities3');
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Dimension = $J.load('java.awt.Dimension');
  Frame = $J.load('java.awt.Frame');
  Graphics2D = $J.load('java.awt.Graphics2D');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  HeadlessException = $J.load('java.awt.HeadlessException');
  Rectangle = $J.load('java.awt.Rectangle');
  Transparency = $J.load('java.awt.Transparency');
  Window = $J.load('java.awt.Window');
  InvocationEvent = $J.load('java.awt.event.InvocationEvent');
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
  VolatileImage = $J.load('java.awt.image.VolatileImage');
  BufferStrategyPaintManager = $J.load('javax.swing.BufferStrategyPaintManager');
  JComponent = $J.load('javax.swing.JComponent');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
