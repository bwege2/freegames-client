// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/BufferStrategyPaintManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, ExtendedBufferCapabilities, ExtendedBufferCapabilities_VSyncType, InterruptedException, PlatformLogger, PlatformLogger_Level, RuntimeException, SunGraphics2D, SunToolkit, WeakReference } from '../../../jre/index.ts';
import { RepaintManager$PaintManager } from './RepaintManager.ts';
import { ComponentAdapter } from '../../java/awt/event/ComponentAdapter.ts';

let SwingUtilities3, AWTException, BufferCapabilities, BufferCapabilities$FlipContents, ImageCapabilities, Window, JComponent, JRootPane, RootPaneContainer, SwingUtilities, AWTAccessor, SubRegionShowable;

/**
 * A PaintManager implementation that uses a BufferStrategy for
 * rendering.
 *
 * @author Scott Violet
 */
export class BufferStrategyPaintManager extends RepaintManager$PaintManager {
  static LOGGER: PlatformLogger = null;
  /**
   * List of BufferInfos.  We don't use a Map primarily because
   * there are typically only a handful of top level components making
   * a Map overkill.
   */
  bufferInfos: ArrayList<BufferStrategyPaintManager$BufferInfo> = null;
  /**
   * Indicates <code>beginPaint</code> has been invoked.  This is
   * set to true for the life of beginPaint/endPaint pair.
   */
  painting: boolean = false;
  /**
   * Indicates we're in the process of showing.  All painting, on the EDT,
   * is blocked while this is true.
   */
  showing: boolean = false;
  accumulatedX: number = 0;
  accumulatedY: number = 0;
  accumulatedMaxX: number = 0;
  accumulatedMaxY: number = 0;
  /**
   * Farthest JComponent ancestor for the current paint/copyArea.
   */
  rootJ: JComponent = null;
  /**
   * Location of component being painted relative to root.
   */
  xOffset: number = 0;
  /**
   * Location of component being painted relative to root.
   */
  yOffset: number = 0;
  /**
   * Graphics from the BufferStrategy.
   */
  bsg: Graphics = null;
  /**
   * BufferStrategy currently being used.
   */
  bufferStrategy: BufferStrategy = null;
  /**
   * BufferInfo corresponding to root.
   */
  bufferInfo: BufferStrategyPaintManager$BufferInfo = null;
  /**
   * Set to true if the bufferInfo needs to be disposed when current
   * paint loop is done.
   */
  disposeBufferOnEnd: boolean = false;
  _BufferStrategyPaintManager(): this {
    this._RepaintManager$PaintManager();
    this.bufferInfos = new ArrayList(1);
    return this;
  }
  /**
   * Cleans up any created BufferStrategies.
   */
  dispose$(): void {
    SwingUtilities.invokeLater(() => {
      let bufferInfos: List<BufferStrategyPaintManager$BufferInfo>;
      {
        while (this.showing) {
          try {
            this.wait();
          } catch ($e0) {
            if ($J.isa($e0, InterruptedException)) {
              let ie = $J.exc($e0);
            } else {
              throw $e0;
            }
          }
        }
        bufferInfos = this.bufferInfos;
        this.bufferInfos = null;
      }
      this.dispose$List$BufferStrategyPaintManager(bufferInfos);
    });
  }
  dispose$List$BufferStrategyPaintManager(bufferInfos: List<BufferStrategyPaintManager$BufferInfo>): void {
    if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
      BufferStrategyPaintManager.LOGGER.finer('BufferStrategyPaintManager disposed', new RuntimeException());
    }
    if (bufferInfos != null) {
      for (const $it1 = bufferInfos.iterator(); $it1.hasNext(); ) {
        let bufferInfo = $it1.next();
        bufferInfo.dispose();
      }
    }
  }
  /**
   * Shows the specified region of the back buffer.  This will return
   * true if successful, false otherwise.  This is invoked on the
   * toolkit thread in response to an expose event.
   */
  show(c: Container, x: number, y: number, w: number, h: number): boolean {
    {
      if (this.painting) {
        return false;
      }
      this.showing = true;
    }
    try {
      let info = this.getBufferInfo(c);
      let bufferStrategy: BufferStrategy;
      if (info != null && info.isInSync() && (bufferStrategy = info.getBufferStrategy(false)) != null) {
        let bsSubRegion = bufferStrategy;
        let paintAllOnExpose = info.getPaintAllOnExpose();
        info.setPaintAllOnExpose(false);
        if (bsSubRegion.showIfNotLost(x, y, ((x + w) | 0), ((y + h) | 0))) {
          return !paintAllOnExpose;
        }
        this.bufferInfo.setContentsLostDuringExpose(true);
      }
    } finally {
      {
        this.showing = false;
        $J.monitorNotify(this, true);
      }
    }
    return false;
  }
  paint(paintingComponent: JComponent, bufferComponent: JComponent, g: Graphics, x: number, y: number, w: number, h: number): boolean {
    let root = this.fetchRoot(paintingComponent);
    if (this.prepare(paintingComponent, root, true, x, y, w, h)) {
      if (($J.isa(g, SunGraphics2D)) && (g).getDestination() === root) {
        let cx = (this.bsg).constrainX;
        let cy = (this.bsg).constrainY;
        if (cx !== 0 || cy !== 0) {
          this.bsg.translate$int$int(-cx, -cy);
        }
        (this.bsg).constrain((this.xOffset + cx) | 0, (this.yOffset + cy) | 0, (x + w) | 0, (y + h) | 0);
        this.bsg.setClip$int$int$int$int(x, y, w, h);
        if (!bufferComponent.isOpaque()) {
          let g2d = this.bsg;
          let oldBg = g2d.getBackground();
          g2d.setBackground(paintingComponent.getBackground());
          g2d.clearRect(x, y, w, h);
          g2d.setBackground(oldBg);
        }
        paintingComponent.paintToOffscreen(this.bsg, x, y, w, h, (x + w) | 0, (y + h) | 0);
        this.accumulate((this.xOffset + x) | 0, (this.yOffset + y) | 0, w, h);
        return true;
      } else {
        this.bufferInfo.setInSync(false);
      }
    }
    if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
      BufferStrategyPaintManager.LOGGER.finer('prepare failed');
    }
    return super.paint(paintingComponent, bufferComponent, g, x, y, w, h);
  }
  copyArea(c: JComponent, g: Graphics, x: number, y: number, w: number, h: number, deltaX: number, deltaY: number, clip: boolean): void {
    let root = this.fetchRoot(c);
    if (this.prepare(c, root, false, 0, 0, 0, 0) && this.bufferInfo.isInSync()) {
      if (clip) {
        let cBounds = c.getVisibleRect();
        let relX = (this.xOffset + x) | 0;
        let relY = (this.yOffset + y) | 0;
        this.bsg.clipRect((this.xOffset + cBounds.x_) | 0, (this.yOffset + cBounds.y_) | 0, cBounds.width_, cBounds.height_);
        this.bsg.copyArea(relX, relY, w, h, deltaX, deltaY);
      } else {
        this.bsg.copyArea((this.xOffset + x) | 0, (this.yOffset + y) | 0, w, h, deltaX, deltaY);
      }
      this.accumulate((x + this.xOffset + deltaX) | 0, (y + this.yOffset + deltaY) | 0, w, h);
    } else {
      if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
        BufferStrategyPaintManager.LOGGER.finer('copyArea: prepare failed or not in sync');
      }
      if (!this.flushAccumulatedRegion()) {
        this.rootJ.repaint$();
      } else {
        super.copyArea(c, g, x, y, w, h, deltaX, deltaY, clip);
      }
    }
  }
  beginPaint(): void {
    {
      this.painting = true;
      while (this.showing) {
        try {
          $J.monitorWait(this);
        } catch ($e2) {
          if ($J.isa($e2, InterruptedException)) {
            let ie = $J.exc($e2);
          } else {
            throw $e2;
          }
        }
      }
    }
    if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINEST)) {
      BufferStrategyPaintManager.LOGGER.finest('beginPaint');
    }
    this.resetAccumulated();
  }
  endPaint(): void {
    if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINEST)) {
      BufferStrategyPaintManager.LOGGER.finest('endPaint: region ' + this.accumulatedX + ' ' + this.accumulatedY + ' ' + this.accumulatedMaxX + ' ' + this.accumulatedMaxY);
    }
    if (this.painting) {
      if (!this.flushAccumulatedRegion()) {
        if (!this.isRepaintingRoot()) {
          this.repaintRoot(this.rootJ);
        } else {
          this.resetDoubleBufferPerWindow();
          this.rootJ.repaint$();
        }
      }
    }
    let toDispose = null;
    {
      this.painting = false;
      if (this.disposeBufferOnEnd) {
        this.disposeBufferOnEnd = false;
        toDispose = this.bufferInfo;
        this.bufferInfos.remove(toDispose);
      }
    }
    if (toDispose != null) {
      toDispose.dispose();
    }
  }
  /**
   * Renders the BufferStrategy to the screen.
   *
   * @return true if successful, false otherwise.
   */
  flushAccumulatedRegion(): boolean {
    let success = true;
    if (this.accumulatedX !== 2147483647) {
      let bsSubRegion = this.bufferStrategy;
      let contentsLost = this.bufferStrategy.contentsLost();
      if (!contentsLost) {
        bsSubRegion.show$int$int$int$int(this.accumulatedX, this.accumulatedY, this.accumulatedMaxX, this.accumulatedMaxY);
        contentsLost = this.bufferStrategy.contentsLost();
      }
      if (contentsLost) {
        if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
          BufferStrategyPaintManager.LOGGER.finer('endPaint: contents lost');
        }
        this.bufferInfo.setInSync(false);
        success = false;
      }
    }
    this.resetAccumulated();
    return success;
  }
  resetAccumulated(): void {
    this.accumulatedX = 2147483647;
    this.accumulatedY = 2147483647;
    this.accumulatedMaxX = 0;
    this.accumulatedMaxY = 0;
  }
  /**
   * Invoked when the double buffering or useTrueDoubleBuffering
   * changes for a JRootPane.  If the rootpane is not double
   * buffered, or true double buffering changes we throw out any
   * cache we may have.
   */
  doubleBufferingChanged(rootPane: JRootPane): void {
    if ((!rootPane.isDoubleBuffered() || !rootPane.getUseTrueDoubleBuffering()) && rootPane.getParent() != null) {
      if (!SwingUtilities.isEventDispatchThread()) {
        let updater = () => {
          this.doubleBufferingChanged0(rootPane);
        };
        SwingUtilities.invokeLater(updater);
      } else {
        this.doubleBufferingChanged0(rootPane);
      }
    }
  }
  /**
   * Does the work for doubleBufferingChanged.
   */
  doubleBufferingChanged0(rootPane: JRootPane): void {
    let info: BufferStrategyPaintManager$BufferInfo;
    {
      while (this.showing) {
        try {
          $J.monitorWait(this);
        } catch ($e3) {
          if ($J.isa($e3, InterruptedException)) {
            let ie = $J.exc($e3);
          } else {
            throw $e3;
          }
        }
      }
      info = this.getBufferInfo(rootPane.getParent());
      if (this.painting && this.bufferInfo === info) {
        this.disposeBufferOnEnd = true;
        info = null;
      } else if (info != null) {
        this.bufferInfos.remove(info);
      }
    }
    if (info != null) {
      info.dispose();
    }
  }
  /**
   * Calculates information common to paint/copyArea.
   *
   * @return true if should use buffering per window in painting.
   */
  prepare(c: JComponent, root: Container, isPaint: boolean, x: number, y: number, w: number, h: number): boolean {
    if (this.bsg != null) {
      this.bsg.dispose();
      this.bsg = null;
    }
    this.bufferStrategy = null;
    if (root != null) {
      let contentsLost = false;
      let bufferInfo = this.getBufferInfo(root);
      if (bufferInfo == null) {
        contentsLost = true;
        bufferInfo = new BufferStrategyPaintManager$BufferInfo().$o(this)._BufferStrategyPaintManager$BufferInfo(root);
        this.bufferInfos.add(bufferInfo);
        if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
          BufferStrategyPaintManager.LOGGER.finer('prepare: new BufferInfo: ' + $J.str(root));
        }
      }
      this.bufferInfo = bufferInfo;
      if (!bufferInfo.hasBufferStrategyChanged()) {
        this.bufferStrategy = bufferInfo.getBufferStrategy(true);
        if (this.bufferStrategy != null) {
          this.bsg = this.bufferStrategy.getDrawGraphics();
          if (this.bufferStrategy.contentsRestored()) {
            contentsLost = true;
            if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
              BufferStrategyPaintManager.LOGGER.finer('prepare: contents restored in prepare');
            }
          }
        } else {
          return false;
        }
        if (bufferInfo.getContentsLostDuringExpose()) {
          contentsLost = true;
          bufferInfo.setContentsLostDuringExpose(false);
          if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
            BufferStrategyPaintManager.LOGGER.finer('prepare: contents lost on expose');
          }
        }
        if (isPaint && c === this.rootJ && x === 0 && y === 0 && c.getWidth() === w && c.getHeight() === h) {
          bufferInfo.setInSync(true);
        } else if (contentsLost) {
          bufferInfo.setInSync(false);
          if (!this.isRepaintingRoot()) {
            this.repaintRoot(this.rootJ);
          } else {
            this.resetDoubleBufferPerWindow();
          }
        }
        return (this.bufferInfos != null);
      }
    }
    return false;
  }
  fetchRoot(c: JComponent): Container {
    let encounteredHW = false;
    this.rootJ = c;
    let root = c;
    this.xOffset = this.yOffset = 0;
    while (root != null && (!(root instanceof Window) && !SunToolkit.isInstanceOf(root, 'java.applet.Applet'))) {
      this.xOffset = (this.xOffset + root.getX()) | 0;
      this.yOffset = (this.yOffset + root.getY()) | 0;
      root = root.getParent();
      if (root != null) {
        if (root instanceof JComponent) {
          this.rootJ = root;
        } else if (!root.isLightweight()) {
          if (!encounteredHW) {
            encounteredHW = true;
          } else {
            return null;
          }
        }
      }
    }
    if (($J.isa(root, RootPaneContainer)) && (this.rootJ instanceof JRootPane)) {
      if (this.rootJ.isDoubleBuffered() && (this.rootJ).getUseTrueDoubleBuffering()) {
        return root;
      }
    }
    return null;
  }
  /**
   * Turns off double buffering per window.
   */
  resetDoubleBufferPerWindow(): void {
    if (this.bufferInfos != null) {
      this.dispose$List$BufferStrategyPaintManager(this.bufferInfos);
      this.bufferInfos = null;
      this.repaintManager.setPaintManager(null);
    }
  }
  /**
   * Returns the BufferInfo for the specified root or null if one
   * hasn't been created yet.
   */
  getBufferInfo(root: Container): BufferStrategyPaintManager$BufferInfo {
    for (let counter = (this.bufferInfos.size() - 1) | 0; counter >= 0; counter--) {
      let bufferInfo = this.bufferInfos.get(counter);
      let biRoot = bufferInfo.getRoot();
      if (biRoot == null) {
        this.bufferInfos.removeAt(counter);
        if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
          BufferStrategyPaintManager.LOGGER.finer('BufferInfo pruned, root null');
        }
      } else if (biRoot === root) {
        return bufferInfo;
      }
    }
    return null;
  }
  accumulate(x: number, y: number, w: number, h: number): void {
    this.accumulatedX = Math.min(x, this.accumulatedX);
    this.accumulatedY = Math.min(y, this.accumulatedY);
    this.accumulatedMaxX = Math.max(this.accumulatedMaxX, (x + w) | 0);
    this.accumulatedMaxY = Math.max(this.accumulatedMaxY, (y + h) | 0);
  }
  static $clinit() {
    BufferStrategyPaintManager.LOGGER = PlatformLogger.getLogger('javax.swing.BufferStrategyPaintManager');
  }
}

/**
 * BufferInfo is used to track the BufferStrategy being used for
 * a particular Component.  In addition to tracking the BufferStrategy
 * it will install a WindowListener and ComponentListener.  When the
 * component is hidden/iconified the buffer is marked as needing to be
 * completely repainted.
 */
export class BufferStrategyPaintManager$BufferInfo extends ComponentAdapter {
  weakBS: WeakReference<BufferStrategy> = null;
  root: WeakReference<Container> = null;
  inSync: boolean = false;
  contentsLostDuringExpose: boolean = false;
  paintAllOnExpose: boolean = false;
  _BufferStrategyPaintManager$BufferInfo(root: Container): this {
    this._ComponentAdapter();
    this.root = new WeakReference(root);
    root.addComponentListener(this);
    if (root instanceof Window) {
      (root).addWindowListener(this);
    }
    return this;
  }
  setPaintAllOnExpose(paintAllOnExpose: boolean): void {
    this.paintAllOnExpose = paintAllOnExpose;
  }
  getPaintAllOnExpose(): boolean {
    return this.paintAllOnExpose;
  }
  setContentsLostDuringExpose(value: boolean): void {
    this.contentsLostDuringExpose = value;
  }
  getContentsLostDuringExpose(): boolean {
    return this.contentsLostDuringExpose;
  }
  setInSync(inSync: boolean): void {
    this.inSync = inSync;
  }
  /**
   * Whether or not the contents of the buffer strategy
   * is in sync with the window.  This is set to true when the root
   * pane paints all, and false when contents are lost/restored.
   */
  isInSync(): boolean {
    return this.inSync;
  }
  /**
   * Returns the Root (Window or Applet) that this BufferInfo references.
   */
  getRoot(): Container {
    return (this.root == null) ? null : this.root.get();
  }
  /**
   * Returns the BufferStartegy.  This will return null if
   * the BufferStartegy hasn't been created and <code>create</code> is
   * false, or if there is a problem in creating the
   * <code>BufferStartegy</code>.
   *
   * @param create If true, and the BufferStartegy is currently null,
   *               one will be created.
   */
  getBufferStrategy(create: boolean): BufferStrategy {
    let bs = (this.weakBS == null) ? null : this.weakBS.get();
    if (bs == null && create) {
      bs = this.createBufferStrategy$$BufferStrategyPaintManager_BufferInfo();
      if (bs != null) {
        this.weakBS = new WeakReference(bs);
      }
      if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
        BufferStrategyPaintManager.LOGGER.finer('getBufferStrategy: created bs: ' + $J.str(bs));
      }
    }
    return bs;
  }
  /**
   * Returns true if the buffer strategy of the component differs
   * from current buffer strategy.
   */
  hasBufferStrategyChanged(): boolean {
    let root = this.getRoot();
    if (root != null) {
      let ourBS = null;
      let componentBS = null;
      ourBS = this.getBufferStrategy(false);
      if (root instanceof Window) {
        componentBS = (root).getBufferStrategy();
      } else {
        componentBS = AWTAccessor.getComponentAccessor().getBufferStrategy(root);
      }
      if (componentBS !== ourBS) {
        if (ourBS != null) {
          ourBS.dispose();
        }
        this.weakBS = null;
        return true;
      }
    }
    return false;
  }
  /**
   * Creates the BufferStrategy.  If the appropriate system property
   * has been set we'll try for flip first and then we'll try for
   * blit.
   */
  createBufferStrategy$$BufferStrategyPaintManager_BufferInfo(): BufferStrategy {
    let root = this.getRoot();
    if (root == null) {
      return null;
    }
    let bs = null;
    if (SwingUtilities3.isVsyncRequested(root)) {
      bs = this.createBufferStrategy$Container$boolean$BufferStrategyPaintManager_BufferInfo(root, true);
      if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
        BufferStrategyPaintManager.LOGGER.finer('createBufferStrategy: using vsynced strategy');
      }
    }
    if (bs == null) {
      bs = this.createBufferStrategy$Container$boolean$BufferStrategyPaintManager_BufferInfo(root, false);
    }
    if (!($J.isa(bs, SubRegionShowable))) {
      bs = null;
    }
    return bs;
  }
  createBufferStrategy$Container$boolean$BufferStrategyPaintManager_BufferInfo(root: Container, isVsynced: boolean): BufferStrategy {
    let caps: BufferCapabilities;
    if (isVsynced) {
      caps = new ExtendedBufferCapabilities(new ImageCapabilities()._ImageCapabilities(true), new ImageCapabilities()._ImageCapabilities(true), BufferCapabilities$FlipContents.COPIED, ExtendedBufferCapabilities_VSyncType.VSYNC_ON);
    } else {
      caps = new BufferCapabilities()._BufferCapabilities(new ImageCapabilities()._ImageCapabilities(true), new ImageCapabilities()._ImageCapabilities(true), null);
    }
    let bs = null;
    if (SunToolkit.isInstanceOf(root, 'java.applet.Applet')) {
      try {
        let componentAccessor = AWTAccessor.getComponentAccessor();
        componentAccessor.createBufferStrategy(root, 2, caps);
        bs = componentAccessor.getBufferStrategy(root);
      } catch ($e4) {
        if ($J.isa($e4, AWTException)) {
          let e = $J.exc($e4);
          if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
            BufferStrategyPaintManager.LOGGER.finer('createBufferStratety failed', e);
          }
        } else {
          throw $e4;
        }
      }
    } else {
      try {
        (root).createBufferStrategy$int$BufferCapabilities(2, caps);
        bs = (root).getBufferStrategy();
      } catch ($e5) {
        if ($J.isa($e5, AWTException)) {
          let e = $J.exc($e5);
          if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
            BufferStrategyPaintManager.LOGGER.finer('createBufferStratety failed', e);
          }
        } else {
          throw $e5;
        }
      }
    }
    return bs;
  }
  /**
   * Cleans up and removes any references.
   */
  dispose(): void {
    let root = this.getRoot();
    if (BufferStrategyPaintManager.LOGGER.isLoggable(PlatformLogger_Level.FINER)) {
      BufferStrategyPaintManager.LOGGER.finer('disposed BufferInfo for: ' + $J.str(root));
    }
    if (root != null) {
      root.removeComponentListener(this);
      if (root instanceof Window) {
        (root).removeWindowListener(this);
      }
      let bs = this.getBufferStrategy(false);
      if (bs != null) {
        bs.dispose();
      }
    }
    this.root = null;
    this.weakBS = null;
  }
  componentHidden(e: ComponentEvent): void {
    let root = this.getRoot();
    if (root != null && root.isVisible$()) {
      root.repaint$();
    } else {
      this.setPaintAllOnExpose(true);
    }
  }
  windowIconified(e: WindowEvent): void {
    this.setPaintAllOnExpose(true);
  }
  windowClosed(e: WindowEvent): void {
    {
      while (this.$outer.showing) {
        try {
          this.$outer.wait();
        } catch ($e6) {
          if ($J.isa($e6, InterruptedException)) {
            let ie = $J.exc($e6);
          } else {
            throw $e6;
          }
        }
      }
      this.$outer.bufferInfos.remove(this);
    }
    this.dispose();
  }
  windowOpened(e: WindowEvent): void {
  }
  windowClosing(e: WindowEvent): void {
  }
  windowDeiconified(e: WindowEvent): void {
  }
  windowActivated(e: WindowEvent): void {
  }
  windowDeactivated(e: WindowEvent): void {
  }
}

$J.define(BufferStrategyPaintManager, 'javax.swing.BufferStrategyPaintManager', { kind: 'class', sup: 'javax.swing.RepaintManager$PaintManager', ctors: { '': '_BufferStrategyPaintManager' }, meths: { 'dispose(java.util.List)': 'dispose$List$BufferStrategyPaintManager', 'dispose()': 'dispose$' }, clinit: true, lazy: ['LOGGER'] });
$J.define(BufferStrategyPaintManager$BufferInfo, 'javax.swing.BufferStrategyPaintManager$BufferInfo', { kind: 'class', ifaces: ['java.awt.event.WindowListener'], sup: 'java.awt.event.ComponentAdapter', ctors: { 'java.awt.Container': '_BufferStrategyPaintManager$BufferInfo' }, meths: { 'createBufferStrategy(java.awt.Container,boolean)': 'createBufferStrategy$Container$boolean$BufferStrategyPaintManager_BufferInfo', 'createBufferStrategy()': 'createBufferStrategy$$BufferStrategyPaintManager_BufferInfo' }, inner: true });
$J.module(() => {
  SwingUtilities3 = $J.load('com.sun.java.swing.SwingUtilities3');
  AWTException = $J.load('java.awt.AWTException');
  BufferCapabilities = $J.load('java.awt.BufferCapabilities');
  BufferCapabilities$FlipContents = $J.load('java.awt.BufferCapabilities$FlipContents');
  ImageCapabilities = $J.load('java.awt.ImageCapabilities');
  Window = $J.load('java.awt.Window');
  JComponent = $J.load('javax.swing.JComponent');
  JRootPane = $J.load('javax.swing.JRootPane');
  RootPaneContainer = $J.load('javax.swing.RootPaneContainer');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  SubRegionShowable = $J.load('sun.awt.SubRegionShowable');
});
