// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/Scrolling.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, JObject } from '../../../../../../jre/index.ts';
import { FreeColClientHolder } from '../control/FreeColClientHolder.ts';

let SwingUtilities, ClientOptions, ScrollThread, MemoryManager, Direction;

/**
 * Handles scrolling on the main map.
 */
export class Scrolling extends FreeColClientHolder {
  /**
   * Space to auto-scroll.
   */
  static readonly AUTO_SCROLL_SPACE: number = 6;
  /**
   * Space to drag-scroll.
   */
  static readonly DRAG_SCROLL_SPACE: number = 100;
  canvas: Canvas = null;
  /**
   * The scroll thread itself.
   */
  scrollThread: ScrollThread = null;
  scrollThreadLock: any = null;
  _Scrolling(freeColClient: FreeColClient, canvas: Canvas): this {
    this._FreeColClientHolder(freeColClient);
    this.scrollThread = null;
    this.scrollThreadLock = new JObject();
    this.canvas = canvas;
    return this;
  }
  /**
   * Auto-scroll to a mouse position if necessary.
   *
   * @param e The {@code MouseEvent} initiating the scroll.
   */
  performAutoScrollIfActive(e: MouseEvent): void {
    if (e.getComponent().isEnabled() && this.getClientOptions().getBoolean(ClientOptions.AUTO_SCROLL)) {
      let autoScrollSpace = this.getGUI().getFixedImageLibrary().scaleInt(Scrolling.AUTO_SCROLL_SPACE);
      this.scroll(e, autoScrollSpace);
    } else {
      this.stopScrollIfScrollIsActive();
    }
  }
  /**
   * Drag-scroll to a mouse position if necessary.
   *
   * @param e The {@code MouseEvent} initiating the scroll.
   */
  performDragScrollIfActive(e: MouseEvent): void {
    if (e.getComponent().isEnabled() && this.getClientOptions().getBoolean(ClientOptions.MAP_SCROLL_ON_DRAG)) {
      let dragScrollSpace = this.getGUI().getFixedImageLibrary().scaleInt(Scrolling.DRAG_SCROLL_SPACE);
      this.scroll(e, dragScrollSpace);
    } else {
      this.stopScrollIfScrollIsActive();
    }
  }
  /**
   * Stop scrolling.
   */
  stopScrollIfScrollIsActive(): void {
    if (this.scrollThread != null) {
      {
        if (this.scrollThread != null) {
          this.scrollThread.abort();
        }
        this.scrollThread = null;
      }
    }
    this.getGUI().stopMapAsyncPainter();
  }
  /**
   * Scroll the map if the given (x,y) coordinate is close to an edge.
   *
   * @param e The {@code MouseEvent} initiating the scroll.
   * @param scrollSpace The clearance from the relevant edge
   */
  scroll(e: MouseEvent, scrollSpace: number): void {
    let panePoint = SwingUtilities.convertPoint$Component$Point$Component(e.getSource(), e.getPoint(), this.getRootComponent());
    let direction = this.getScrollDirection(panePoint.x_, panePoint.y_, scrollSpace);
    if (direction == null) {
      this.stopScrollIfScrollIsActive();
      return;
    }
    if (this.getMap() == null) {
      return;
    }
    if (this.isAsyncPainterEnabled()) {
      let mapAsyncPainter = this.getGUI().useMapAsyncPainter();
      mapAsyncPainter.setScrollDirection(direction);
      return;
    }
    {
      if (this.scrollThread != null && !this.scrollThread.isAborted()) {
        this.scrollThread.setDirection(direction);
        return;
      }
      this.stopScrollIfScrollIsActive();
      this.scrollThread = new ScrollThread()._ScrollThread(this.getFreeColClient());
      this.scrollThread.setDirection(direction);
      this.scrollThread.start();
    }
  }
  isAsyncPainterEnabled(): boolean {
    return MemoryManager.isSmoothScrollingEnabled();
  }
  /**
   * Work out what direction to scroll the map if a coordinate is close
   * to an edge.
   *
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param scrollSpace The clearance from the relevant edge
   * @return The {@code Direction} to scroll, or null if not.
   */
  getScrollDirection(x: number, y: number, scrollSpace: number): Direction {
    let ret: Direction;
    let size = this.getRootComponent().getSize$();
    if (x < scrollSpace && y < scrollSpace) {
      ret = Direction.NW;
    } else if (x >= ((size.width_ - scrollSpace) | 0) && y < scrollSpace) {
      ret = Direction.NE;
    } else if (x >= ((size.width_ - scrollSpace) | 0) && y >= ((size.height_ - scrollSpace) | 0)) {
      ret = Direction.SE;
    } else if (x < scrollSpace && y >= ((size.height_ - scrollSpace) | 0)) {
      ret = Direction.SW;
    } else if (y < scrollSpace) {
      ret = Direction.N;
    } else if (x >= ((size.width_ - scrollSpace) | 0)) {
      ret = Direction.E;
    } else if (y >= ((size.height_ - scrollSpace) | 0)) {
      ret = Direction.S;
    } else if (x < scrollSpace) {
      ret = Direction.W;
    } else {
      ret = null;
    }
    return ret;
  }
  getRootComponent(): Component {
    return this.canvas.getParentFrame().getRootPane();
  }
}

$J.define(Scrolling, 'net.sf.freecol.client.gui.Scrolling', { kind: 'class', sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.Canvas': '_Scrolling' }, returns: { 'getRootComponent': 'java.awt.Component', 'isAsyncPainterEnabled': 'boolean' } });
$J.module(() => {
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  ScrollThread = $J.load('net.sf.freecol.client.gui.ScrollThread');
  MemoryManager = $J.load('net.sf.freecol.common.MemoryManager');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
});
