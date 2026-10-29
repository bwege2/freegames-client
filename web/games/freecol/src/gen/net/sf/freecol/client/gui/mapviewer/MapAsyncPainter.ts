// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/MapAsyncPainter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, Exception, IllegalStateException, InterruptedException, JObject, Level, LockSupport, Logger, Objects, Thread } from '../../../../../../../jre/index.ts';

let Dimension, Point, Transparency, MapViewerBounds, Direction, Utils;

/**
 * Supports asynchronous painting to a buffer. This allows frames to be rendered
 * in parallel with the GUI thread (that is, the "EDT" - Event Dispatching Thread).
 *
 * Asynchronous painting is needed for smooth scrolling, but it can in the future
 * also be used if we start getting lots of animated content on the map.
 */
export class MapAsyncPainter extends JObject {
  static logger: Logger = null;
  /**
   * Activates debug output to STDOUT explaining how prerendered images
   * are produced and consumed.
   */
  static readonly DEBUG_ASYNC_EVENTS_TO_STDOUT: boolean = false;
  /**
   * The {@code MapViewer} this painter is servicing.
   */
  mapViewer: MapViewer = null;
  /**
   * The current direction scrolling direction.
   *
   * Volatile since it's modified from the EDT and read from the MapRendererThread
   */
  scrollDirection: Direction = null;
  mapRendererThread: MapAsyncPainter$MapRendererThread = null;
  consumptionLock: any = null;
  aborted: boolean = false;
  consumed: boolean = false;
  consumerIgnoresOldBuffer: boolean = false;
  lastRenderTimestamp: number = 0;
  used: boolean = false;
  mapFocusPointBackBuffer: Point = null;
  backBufferImage: BufferedImage = null;
  nextBackBufferImage: BufferedImage = null;
  size_: Dimension = null;
  origSize: Dimension = null;
  scrollBufferSizeInPixels: number = 0;
  keepScrollPixelsForChangingDirection: number = 0;
  _MapAsyncPainter(mapViewer: MapViewer): this {
    this.scrollDirection = null;
    this.consumptionLock = new JObject();
    this.aborted = false;
    this.consumed = true;
    this.consumerIgnoresOldBuffer = true;
    this.lastRenderTimestamp = $J.system_currentTimeMillis();
    this.used = false;
    let mvb = mapViewer.getMapViewerBounds();
    let tb = mvb.getTileBounds();
    this.mapViewer = mapViewer;
    this.origSize = mvb.getSize();
    this.scrollBufferSizeInPixels = Math.imul(tb.getWidth(), 2);
    this.size_ = new Dimension()._Dimension$int$int((this.origSize.width_ + Math.imul(this.scrollBufferSizeInPixels, 2)) | 0, (this.origSize.height_ + Math.imul(this.scrollBufferSizeInPixels, 2)) | 0);
    this.keepScrollPixelsForChangingDirection = tb.getWidth();
    this.mapFocusPointBackBuffer = mvb.getFocusMapPoint();
    this.backBufferImage = Utils.getGoodGraphicsDevice().getDefaultConfiguration().createCompatibleImage$int$int$int(this.size_.width_, this.size_.height_, Transparency.OPAQUE);
    this.nextBackBufferImage = Utils.getGoodGraphicsDevice().getDefaultConfiguration().createCompatibleImage$int$int$int(this.size_.width_, this.size_.height_, Transparency.OPAQUE);
    this.mapRendererThread = new MapAsyncPainter$MapRendererThread().$o(this)._MapAsyncPainter$MapRendererThread(this.size_, tb, mvb.getFocus(), this.mapFocusPointBackBuffer);
    return this;
  }
  /**
   * Gets the next image to be rendered. This operation blocks until the image is ready.
   *
   * @return A {@code BufferedImage} containing the entire map view to be displayed.
   */
  getBackBufferImage(): BufferedImage {
    while (true) {
      {
        try {
          while (this.consumed) {
            if (this.aborted) {
              return null;
            }
            $J.monitorWait(this.consumptionLock);
          }
        } catch ($e0) {
          if ($J.isa($e0, InterruptedException)) {
            let e = $J.exc($e0);
          } else {
            throw $e0;
          }
        }
      }
      if (this.aborted) {
        return null;
      }
      let now = $J.system_currentTimeMillis();
      let newFocus = this.getNewFocusPoint(now);
      let xDiff = (newFocus.x_ - this.mapFocusPointBackBuffer.x_) | 0;
      let yDiff = (newFocus.y_ - this.mapFocusPointBackBuffer.y_) | 0;
      let focusInBufferX = ($J.idiv(this.size_.width_, 2) + xDiff) | 0;
      let focusInBufferY = ($J.idiv(this.size_.height_, 2) + yDiff) | 0;
      let x = (focusInBufferX - $J.idiv(this.origSize.width_, 2)) | 0;
      let y = (focusInBufferY - $J.idiv(this.origSize.height_, 2)) | 0;
      if (x >= 0 && y >= 0 && ((x + this.origSize.width_) | 0) <= this.size_.width_ && ((y + this.origSize.height_) | 0) <= this.size_.height_) {
        this.used = true;
        this.lastRenderTimestamp = now;
        this.mapViewer.getMapViewerBounds().setFocusMapPoint(newFocus);
        if (MapAsyncPainter.DEBUG_ASYNC_EVENTS_TO_STDOUT) {
          $J.out.print('.');
        }
        this.consumerIgnoresOldBuffer = false;
        return this.backBufferImage.getSubimage(x, y, this.origSize.width_, this.origSize.height_);
      }
      if (MapAsyncPainter.DEBUG_ASYNC_EVENTS_TO_STDOUT) {
        $J.out.print('!');
      }
      if (!this.used) {
        if (MapAsyncPainter.DEBUG_ASYNC_EVENTS_TO_STDOUT) {
          $J.out.println('\n\nWARNING: PRERENDERED IMAGE COMPLETELY UNUSED\nCoordinates: x1=' + x + ', y1=' + y + ', x2' + ((x + this.origSize.width_) | 0) + ', y2' + ((y + this.origSize.height_) | 0) + ' \nOut-of-bounds in buffer: ' + $J.str(this.size_) + '\n');
        }
        this.consumerIgnoresOldBuffer = true;
      }
      this.consumed = true;
      LockSupport.unpark(this.mapRendererThread);
    }
  }
  /**
   * Updates the scrolling direction on the map.
   *
   * @param scrollDirection The direction the map should be scrolled in.
   */
  setScrollDirection(scrollDirection: Direction): void {
    Objects.requireNonNull(scrollDirection, 'scrollDirection');
    let initialized = (this.scrollDirection != null);
    this.scrollDirection = scrollDirection;
    if (!initialized) {
      this.mapRendererThread.start();
    }
    LockSupport.unpark(this.mapRendererThread);
  }
  /**
   * Stops this async painter.
   */
  stop(): void {
    this.aborted = true;
    LockSupport.unpark(this.mapRendererThread);
    {
      $J.monitorNotify(this.consumptionLock, true);
    }
  }
  /**
   * Checks if this async painter has been stopped.
   * @return {@code true} if this painter has been stopped.
   */
  isStopped(): boolean {
    return this.aborted;
  }
  getNewFocusPoint(now: number): Point {
    let newFocus: Point;
    if (this.consumerIgnoresOldBuffer) {
      newFocus = this.mapViewer.getMapViewerBounds().getFocusMapPoint();
    } else {
      newFocus = this.determineMapFocusPointOnRender(now);
    }
    return newFocus;
  }
  static plusOffsets(point: Point, direction: Direction, offsetX: number, offsetY: number): Point {
    switch (direction) {
      case Direction.N:
        return new Point()._Point$int$int(point.x_, (point.y_ - offsetY) | 0);
      case Direction.S:
        return new Point()._Point$int$int(point.x_, (point.y_ + offsetY) | 0);
      case Direction.E:
        return new Point()._Point$int$int((point.x_ + offsetX) | 0, point.y_);
      case Direction.W:
        return new Point()._Point$int$int((point.x_ - offsetX) | 0, point.y_);
      case Direction.NW:
        return new Point()._Point$int$int((point.x_ - offsetX) | 0, (point.y_ - offsetY) | 0);
      case Direction.NE:
        return new Point()._Point$int$int((point.x_ + offsetX) | 0, (point.y_ - offsetY) | 0);
      case Direction.SW:
        return new Point()._Point$int$int((point.x_ - offsetX) | 0, (point.y_ + offsetY) | 0);
      case Direction.SE:
        return new Point()._Point$int$int((point.x_ + offsetX) | 0, (point.y_ + offsetY) | 0);
      default:
        throw new IllegalStateException('Unknown direction: ' + $J.str(direction));
    }
  }
  scrollFocusOnOriginalSize(point: Point, direction: Direction): Point {
    let offset = (this.scrollBufferSizeInPixels - 1 - $J.idiv(this.keepScrollPixelsForChangingDirection, 2)) | 0;
    return MapAsyncPainter.plusOffsets(point, direction, offset, offset);
  }
  scrollFocusOnBufferSize(point: Point, direction: Direction): Point {
    let offset = (Math.imul(this.scrollBufferSizeInPixels, 2) - 2 - this.keepScrollPixelsForChangingDirection) | 0;
    return MapAsyncPainter.plusOffsets(point, direction, offset, offset);
  }
  determineMapFocusPointOnRender(now: number): Point {
    let timeElapsed = now - this.lastRenderTimestamp;
    let divisor = 2;
    let pixelsMoved = (((($J.ldiv(timeElapsed, divisor))) | 0) + ((timeElapsed % divisor >= $J.idiv(divisor, 2)) ? 1 : 0)) | 0;
    let newFocus = MapAsyncPainter.plusOffsets(this.mapViewer.getMapViewerBounds().getFocusMapPoint(), this.scrollDirection, pixelsMoved, pixelsMoved);
    return newFocus;
  }
  static $clinit() {
    MapAsyncPainter.logger = Logger.getLogger($J.cls(MapAsyncPainter).getName());
    if (MapAsyncPainter.DEBUG_ASYNC_EVENTS_TO_STDOUT) {
      $J.out.println();
      $J.out.println('Map Async Debug enabled:');
      $J.out.println('p\tPrerendering started');
      $J.out.println('123\tTime taken prerendering');
      $J.out.println('P\tPrerendered image delivered for consumption');
      $J.out.println('#\tPrerendered image invalidated and dropped');
      $J.out.println('.\tPrerendered image used');
      $J.out.println('.\tPrerendered image used');
      $J.out.println('!\tNew prerendered image needed immediately');
      $J.out.println();
    }
  }
}

/**
 * The thread producing images for {@link #getBackBufferImage}.
 */
export class MapAsyncPainter$MapRendererThread extends Thread {
  internalRenderMapViewerBounds: MapViewerBounds = null;
  ignoreOldBuffer: boolean = false;
  _MapAsyncPainter$MapRendererThread(size: Dimension, tileBounds: TileBounds, focusTile: Tile, initialFocus: Point): this {
    this._Thread();
    this.ignoreOldBuffer = false;
    this.internalRenderMapViewerBounds = new MapViewerBounds()._MapViewerBounds();
    this.internalRenderMapViewerBounds.changeSize(size, tileBounds);
    this.internalRenderMapViewerBounds.setFocus(focusTile);
    this.internalRenderMapViewerBounds.setFocusMapPoint(initialFocus);
    return this;
  }
  run(): void {
    let MAX_EXCEPTIONS = 100;
    let reportedExceptions = 0;
    while (!this.$outer.aborted) {
      try {
        this.paint();
      } catch ($e1) {
        if ($J.isa($e1, Exception)) {
          let e = $J.exc($e1);
          if (reportedExceptions < MAX_EXCEPTIONS) {
            MapAsyncPainter.logger.log(Level.WARNING, 'Unhandled exception while painting.', e);
            reportedExceptions++;
            if (reportedExceptions === MAX_EXCEPTIONS) {
              MapAsyncPainter.logger.severe('Stopped logging exceptions from the async painting thread since there have been produced too many.');
            }
          }
          try {
            Thread.sleep(MAX_EXCEPTIONS);
          } catch ($e2) {
            if ($J.isa($e2, InterruptedException)) {
              let e1 = $J.exc($e2);
            } else {
              throw $e2;
            }
          }
        } else {
          throw $e1;
        }
      }
    }
  }
  paint(): void {
    if (this.$outer.aborted) {
      return;
    }
    if (MapAsyncPainter.DEBUG_ASYNC_EVENTS_TO_STDOUT) {
      $J.out.print('p');
    }
    let now = $J.system_currentTimeMillis();
    let newFocus = this.$outer.getNewFocusPoint(now);
    let direction = this.$outer.scrollDirection;
    let nextMapFocusPointBackBuffer = this.produceRenderedImage(newFocus, direction);
    this.ignoreOldBuffer = false;
    if (MapAsyncPainter.DEBUG_ASYNC_EVENTS_TO_STDOUT) {
      $J.out.print(' ' + ($J.system_currentTimeMillis() - now) + ' ');
    }
    while (!this.$outer.consumed && !this.$outer.aborted) {
      if (direction !== this.$outer.scrollDirection) {
        if (MapAsyncPainter.DEBUG_ASYNC_EVENTS_TO_STDOUT) {
          $J.out.print('#');
        }
        this.ignoreOldBuffer = true;
        return;
      }
      LockSupport.park();
    }
    if (this.$outer.aborted) {
      return;
    }
    this.deliverRenderedImage(nextMapFocusPointBackBuffer);
  }
  produceRenderedImage(newFocus: Point, direction: Direction): Point {
    let nextMapFocusPointBackBuffer: Point;
    let g2d = this.$outer.nextBackBufferImage.createGraphics();
    try {
      if (this.$outer.consumerIgnoresOldBuffer || this.ignoreOldBuffer || this.$outer.consumed) {
        nextMapFocusPointBackBuffer = this.$outer.scrollFocusOnOriginalSize(newFocus, direction);
      } else {
        nextMapFocusPointBackBuffer = this.$outer.scrollFocusOnBufferSize(this.$outer.mapFocusPointBackBuffer, direction);
      }
      this.internalRenderMapViewerBounds.setFocusMapPoint(nextMapFocusPointBackBuffer);
      this.$outer.mapViewer.paintMap$Graphics2D$Dimension$MapViewerBounds(g2d, this.$outer.size_, this.internalRenderMapViewerBounds);
    } finally {
      g2d.dispose();
    }
    return nextMapFocusPointBackBuffer;
  }
  deliverRenderedImage(nextMapFocusPointBackBuffer: Point): void {
    let next = this.$outer.backBufferImage;
    this.$outer.backBufferImage = this.$outer.nextBackBufferImage;
    this.$outer.nextBackBufferImage = next;
    this.$outer.mapFocusPointBackBuffer = nextMapFocusPointBackBuffer;
    if (MapAsyncPainter.DEBUG_ASYNC_EVENTS_TO_STDOUT) {
      $J.out.println('P');
    }
    {
      this.ignoreOldBuffer = false;
      this.$outer.used = false;
      this.$outer.consumed = false;
      $J.monitorNotify(this.$outer.consumptionLock, true);
    }
  }
}

$J.define(MapAsyncPainter, 'net.sf.freecol.client.gui.mapviewer.MapAsyncPainter', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.mapviewer.MapViewer': '_MapAsyncPainter' }, returns: { 'isStopped': 'boolean', 'getBackBufferImage': 'java.awt.image.BufferedImage' }, clinit: true, lazy: ['logger'] });
$J.define(MapAsyncPainter$MapRendererThread, 'net.sf.freecol.client.gui.mapviewer.MapAsyncPainter$MapRendererThread', { kind: 'class', sup: 'java.lang.Thread', ctors: { 'java.awt.Dimension,net.sf.freecol.client.gui.mapviewer.TileBounds,net.sf.freecol.common.model.Tile,java.awt.Point': '_MapAsyncPainter$MapRendererThread' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  Transparency = $J.load('java.awt.Transparency');
  MapViewerBounds = $J.load('net.sf.freecol.client.gui.mapviewer.MapViewerBounds');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
