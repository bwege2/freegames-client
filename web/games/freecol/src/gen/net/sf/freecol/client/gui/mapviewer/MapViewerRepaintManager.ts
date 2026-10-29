// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/MapViewerRepaintManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, HashSet, JObject, Objects } from '../../../../../../../jre/index.ts';

let Rectangle, Transparency, Area, Utils;

/**
 * Internal class that handles buffers and dirty state of {@link MapViewer}.
 *
 * Methods in this class should only be used by {@link SwingGUI}, {@link Canvas}
 * or {@link MapViewer}.
 */
export class MapViewerRepaintManager extends JObject {
  backBufferImage: VolatileImage = null;
  nonAnimationBufferImage: BufferedImage = null;
  dirtyRegion: Rectangle = null;
  focus: Tile = null;
  focusPoint: Point = null;
  repaintsBlocked: boolean = false;
  dirtyTiles: JSet<Tile> = null;
  _MapViewerRepaintManager(): this {
    this.backBufferImage = null;
    this.nonAnimationBufferImage = null;
    this.dirtyRegion = new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
    this.focus = null;
    this.focusPoint = null;
    this.repaintsBlocked = false;
    this.dirtyTiles = new HashSet();
    return this;
  }
  /**
   * Prepares buffers for rendering.
   *
   * @param mapViewerBounds The bounds used when determining the size of the
   *      buffers, and also for checking if the focus has changed.
   * @param focus A new {@code Tile} to focus on.
   * @return {@code true} if the buffers have been reset -- meaning
   *      prior content has been lost.
   */
  prepareBuffers(mapViewerBounds: MapViewerBounds, focus: Tile): boolean {
    // assert SwingUtilities.isEventDispatchThread()
    let size = mapViewerBounds.getSize();
    let oldFocus = this.focus;
    let oldFocusPoint = this.focusPoint;
    this.focus = focus;
    this.focusPoint = mapViewerBounds.tileToPoint(focus);
    this.repaintsBlocked = false;
    if (this.isBuffersUninitialized(size)) {
      this.initializeBuffers(size);
      this.markAsDirty$();
      this.dirtyTiles.clear();
      return true;
    }
    if (this.isAllDirty()) {
      this.dirtyTiles.clear();
      return false;
    }
    if (oldFocus == null) {
      this.markAsDirty$();
      this.dirtyTiles.clear();
      return false;
    }
    this.updateDirtyRegionWithDirtyTiles(mapViewerBounds);
    this.reuseNonDirtyAreasIfPossible(mapViewerBounds, oldFocus, oldFocusPoint);
    return false;
  }
  initializeBuffers(size: Dimension): void {
    this.backBufferImage = Utils.getGoodGraphicsDevice().getDefaultConfiguration().createCompatibleVolatileImage$int$int$int(size.width_, size.height_, Transparency.OPAQUE);
    this.nonAnimationBufferImage = Utils.getGoodGraphicsDevice().getDefaultConfiguration().createCompatibleImage$int$int$int(size.width_, size.height_, Transparency.TRANSLUCENT);
  }
  /**
   * Gets the clip bounds that should be fully redrawn.
   *
   * @return The region to redraw.
   */
  getDirtyClipBounds(): Rectangle {
    // assert SwingUtilities.isEventDispatchThread()
    return this.dirtyRegion;
  }
  /**
   * Check if the buffers for the entire map viewer is dirty.
   *
   * @return {@code true} if no part of the buffer can be reused the next
   *      time the map gets painted.
   */
  isAllDirty(): boolean {
    // assert SwingUtilities.isEventDispatchThread()
    return this.backBufferImage == null || this.dirtyRegion != null && this.dirtyRegion.x_ === 0 && this.dirtyRegion.y_ === 0 && this.dirtyRegion.width_ === this.backBufferImage.getWidth$() && this.dirtyRegion.height_ === this.backBufferImage.getHeight$();
  }
  /**
   * Marks the given area as dirty for all layers.
   *
   * This method should only be used if {@link paintImmediately}
   * is called both before and after.
   *
   * @param bounds The bounds that should be marked dirty.
   */
  markAsDirty$Rectangle(bounds: Rectangle): void {
    // assert SwingUtilities.isEventDispatchThread()
    if (this.dirtyRegion.isEmpty()) {
      this.dirtyRegion = bounds;
    } else {
      this.dirtyRegion = this.dirtyRegion.union(bounds);
    }
  }
  /**
   * Marks the given {@code Tile} as dirty for all layers.
   *
   * @param dirtyTile The {@code Tile} that should be repainted.
   */
  markAsDirty$Tile(dirtyTile: Tile): void {
    // assert SwingUtilities.isEventDispatchThread()
    Objects.requireNonNull(dirtyTile, 'dirtyTile');
    this.dirtyTiles.add(dirtyTile);
  }
  /**
   * Marks the given {@code Tile}s as dirty for all layers.
   *
   * @param dirtyTiles The {@code Tile}s that should be repainted.
   */
  markAsDirty$Collection(dirtyTiles: Collection<Tile>): void {
    // assert SwingUtilities.isEventDispatchThread()
    this.dirtyTiles.addAll(dirtyTiles);
  }
  /**
   * Marks the entire area of all buffers as dirty. Please avoid calling this
   * method as it causes full repaints.
   */
  markAsDirty$(): void {
    // assert SwingUtilities.isEventDispatchThread()
    if (this.backBufferImage == null) {
      this.dirtyRegion = null;
      return;
    }
    this.dirtyRegion = new Rectangle()._Rectangle$int$int$int$int(0, 0, this.backBufferImage.getWidth$(), this.backBufferImage.getHeight$());
  }
  /**
   * Marks every buffer as clean.
   *
   * WARNING: This method should only be called from {@code MapViewer} after painting
   *          has completed.
   */
  markAsClean(): void {
    // assert SwingUtilities.isEventDispatchThread()
    this.dirtyRegion = new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
  }
  /**
   * If available, a buffer that contains the entire map.
   *
   * @return The map buffer.
   */
  getBackBufferImage(): VolatileImage {
    // assert SwingUtilities.isEventDispatchThread()
    return this.backBufferImage;
  }
  /**
   * If available, a buffer that contains the non-animated parts
   * of the map.
   *
   * @return The static map buffer.
   */
  getNonAnimationBufferImage(): BufferedImage {
    // assert SwingUtilities.isEventDispatchThread()
    return this.nonAnimationBufferImage;
  }
  /**
   * Stops the map viewer from being updated in the user interface
   * by using the backbuffer for repaint requests.
   *
   * WARNING: Always secure that this value is set back to
   *          {@code false}, in reasonable time, and repaint the
   *          entire map after doing so.
   *
   * Please note that a resized frame will still force a repaint.
   *
   * @param repaintsBlocked {@code true} blocks new repaints while
   *      {@code false} allows repaints to be made again.
   */
  setRepaintsBlocked(repaintsBlocked: boolean): void {
    // assert SwingUtilities.isEventDispatchThread()
    this.repaintsBlocked = repaintsBlocked;
  }
  /**
   * Checks if repaints are temporarily served using only the
   * back buffer.
   *
   * @see #setRepaintsBlocked(boolean)
   *
   * @param size A size to check for initialized buffers.
   * @return True if repaints are blocked.
   */
  isRepaintsBlocked(size: Dimension): boolean {
    // assert SwingUtilities.isEventDispatchThread()
    return this.repaintsBlocked && !this.isBuffersUninitialized(size);
  }
  isBuffersUninitialized(size: Dimension): boolean {
    return this.backBufferImage == null || this.backBufferImage.getWidth$() !== size.width_ || this.backBufferImage.getHeight$() !== size.height_;
  }
  /**
   * Moves the contents of the buffers to a new location
   * after changing focus tile.
   *
   * @param mapViewerBounds The bounds defining the focus.
   * @param oldFocus The previous focus {@code Tile}.
   * @param oldFocusPoint The previous focus {@code Point}.
   */
  reuseNonDirtyAreasIfPossible(mapViewerBounds: MapViewerBounds, oldFocus: Tile, oldFocusPoint: Point): void {
    let repositionedOldFocusPoint = mapViewerBounds.tileToPoint(oldFocus);
    let dx = (repositionedOldFocusPoint.x_ - oldFocusPoint.x_) | 0;
    let dy = (repositionedOldFocusPoint.y_ - oldFocusPoint.y_) | 0;
    this.updateDirtyRegion(mapViewerBounds, dx, dy);
    if (!this.isAllDirty()) {
      MapViewerRepaintManager.moveContents(this.backBufferImage, dx, dy);
      this.nonAnimationBufferImage = MapViewerRepaintManager.moveContentsAndRecreateImage(this.nonAnimationBufferImage, dx, dy);
    }
  }
  /**
   * Updates the dirty region by moving it in the specified direction.
   *
   * @param mapViewerBounds The bounds defining the focus.
   * @param dx The number of pixels to move the contents of the buffers
   *      for the x coordinate. The value can be negative.
   * @param dy The number of pixels to move the contents of the buffers
   *      for the y coordinate. The value can be negative.
   */
  updateDirtyRegion(mapViewerBounds: MapViewerBounds, dx: number, dy: number): void {
    let size = mapViewerBounds.getSize();
    let alreadyPaintedBounds = new Rectangle()._Rectangle$int$int$int$int(0, 0, size.width_, size.height_);
    alreadyPaintedBounds.translate(dx, dy);
    let dirtyArea = new Area()._Area$Shape(new Rectangle()._Rectangle$int$int$int$int(0, 0, size.width_, size.height_));
    dirtyArea.subtract(new Area()._Area$Shape(alreadyPaintedBounds));
    let newDirtyBounds = dirtyArea.getBounds();
    if (this.dirtyRegion != null && !this.dirtyRegion.isEmpty()) {
      this.dirtyRegion = this.dirtyRegion.union(newDirtyBounds);
    } else {
      this.dirtyRegion = newDirtyBounds;
    }
    this.dirtyRegion = this.dirtyRegion.intersection(new Rectangle()._Rectangle$int$int$int$int(0, 0, size.width_, size.height_));
  }
  /**
   * Move the content of an opaque {@code Image}.
   *
   * @param image The {@code Image} to move.
   * @param dx The x-coordinate change.
   * @param dy The y-coordinate change.
   */
  static moveContents(image: Image, dx: number, dy: number): void {
    let g2d = image.getGraphics();
    g2d.copyArea(0, 0, image.getWidth$ImageObserver(null), image.getHeight$ImageObserver(null), dx, dy);
    g2d.dispose();
  }
  /**
   * Move the content of a transparent {@code BufferedImage} by creating a
   * new image.
   *
   * Please use the more efficient {@link #moveContents(Image, int, int)}
   * for opaque images.
   *
   * @param image The {@code Image} to move.
   * @param dx The x-coordinate change.
   * @param dy The y-coordinate change.
   * @return The new image.
   */
  static moveContentsAndRecreateImage(image: BufferedImage, dx: number, dy: number): BufferedImage {
    let result = Utils.getGoodGraphicsDevice().getDefaultConfiguration().createCompatibleImage$int$int$int(image.getWidth(), image.getHeight(), Transparency.TRANSLUCENT);
    let g2d = result.createGraphics();
    g2d.drawImage$Image$int$int$ImageObserver(image, dx, dy, null);
    g2d.dispose();
    return result;
  }
  updateDirtyRegionWithDirtyTiles(mapViewerBounds: MapViewerBounds): void {
    for (const $it0 = this.dirtyTiles.iterator(); $it0.hasNext(); ) {
      let dirtyTile = $it0.next();
      let dirtyTileBounds = mapViewerBounds.calculateDrawnTileBounds(dirtyTile);
      if (this.dirtyRegion.isEmpty()) {
        this.dirtyRegion = dirtyTileBounds;
      } else {
        this.dirtyRegion = this.dirtyRegion.union(dirtyTileBounds);
      }
    }
    this.dirtyTiles.clear();
  }
}

$J.define(MapViewerRepaintManager, 'net.sf.freecol.client.gui.mapviewer.MapViewerRepaintManager', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MapViewerRepaintManager' }, returns: { 'getNonAnimationBufferImage': 'java.awt.image.BufferedImage', 'getBackBufferImage': 'java.awt.image.VolatileImage', 'isAllDirty': 'boolean', 'getDirtyClipBounds': 'java.awt.Rectangle' }, meths: { 'markAsDirty()': 'markAsDirty$', 'markAsDirty(java.util.Collection)': 'markAsDirty$Collection', 'markAsDirty(net.sf.freecol.common.model.Tile)': 'markAsDirty$Tile', 'markAsDirty(java.awt.Rectangle)': 'markAsDirty$Rectangle' } });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  Transparency = $J.load('java.awt.Transparency');
  Area = $J.load('java.awt.geom.Area');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
