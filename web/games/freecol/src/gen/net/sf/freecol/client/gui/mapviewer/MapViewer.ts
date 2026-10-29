// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/MapViewer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, ArrayList, Collectors, JEnum, JObject, JString, Level, List, Logger, StringBuilder, TextLayout } from '../../../../../../../jre/index.ts';
import { FreeColClientHolder } from '../../control/FreeColClientHolder.ts';

let AlphaComposite, BasicStroke, Color, Dimension, Point, Rectangle, RenderingHints, Ellipse2D$Double, GeneralPath, Path2D, RoundRectangle2D$Float, RescaleOp, ClientOptions, GUI$ViewMode, ImageLibrary, ChatDisplay, MapAsyncPainter, MapViewerBounds, MapViewerRepaintManager, MapViewerScaledUtils, MapViewerState, TileBounds, TileViewer, UnitAnimator, FreeColDebugger, FreeColDebugger$DebugMode, Messages, Ability, Colony, Direction, IndianSettlement, Map$Position, Turn, Unit$UnitState, GameOptions, ImageUtils, Utils, EuropeanAIPlayer, DefensiveMap;

/**
 * MapViewer is a private helper class of Canvas and SwingGUI.
 *
 * This class is used by {@link CanvasMapViewer} for drawing the map on the {@link Canvas}.
 *
 * The method {@link #displayMap(Graphics2D, Dimension)} renders the entire map, or just parts
 * of it depending on clip bounds and the dirty state controlled by
 * {@link MapViewerRepaintManager}.
 *    
 * Unit animations are still handled {@link UnitAnimator separately}, but will probably be moved
 * into {@code displayMap} in the future.
 *
 * @see MapViewerBounds
 */
export class MapViewer extends FreeColClientHolder {
  static logger: Logger = null;
  /**
   * Calculates what part of the {@link Map} is visible on screen. This includes handling
   * the size, scaling and focus of the map.
   *
   * Please note that when repainting the Map, it is only necessary to paint the
   * requested area given by {@link Graphics2D#getClipBounds}. Translating the
   * the clip bounds into tiles is performed by {@link TileClippingBounds}.
   */
  mapViewerBounds: MapViewerBounds = null;
  /**
   * Holds state that is not part of the Game/Map state, but is still used when drawing
   * the map. For example the current active unit.
   */
  mapViewerState: MapViewerState = null;
  /**
   * The internal scaled tile viewer to use.
   */
  tv: TileViewer = null;
  /**
   * Holds buffers and determines the dirty state when drawing.
   */
  rpm: MapViewerRepaintManager = null;
  /**
   * Utility functions that considers the current map size and scale.
   */
  mapViewerScaledUtils: MapViewerScaledUtils = null;
  /**
   * Scaled image library to use only for map operations.
   */
  lib: ImageLibrary = null;
  /**
   * Bounds of the tiles to be rendered. These bounds are scaled according to the
   * zoom level of the map.
   */
  tileBounds: TileBounds = null;
  fullyRepaintedAreas: List<Rectangle> = null;
  /**
   * An asynchronous painter. If enabled (not null), then the {@code asyncPainter} will be
   * used when painting this {@code MapViewer}.
   */
  asyncPainter: MapAsyncPainter = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param lib An {@code ImageLibrary} to use for drawing to the map
   *     (and this is subject to the map scaling).
   * @param al An {@code ActionListener} for the cursor.
   */
  _MapViewer(freeColClient: FreeColClient, lib: ImageLibrary, al: ActionListener): this {
    this._FreeColClientHolder(freeColClient);
    this.mapViewerBounds = new MapViewerBounds()._MapViewerBounds();
    this.tileBounds = new TileBounds()._TileBounds(new Dimension()._Dimension$int$int(0, 0), 1);
    this.fullyRepaintedAreas = new ArrayList();
    this.asyncPainter = null;
    this.lib = lib;
    this.tv = new TileViewer()._TileViewer(freeColClient, lib);
    let chatDisplay = new ChatDisplay()._ChatDisplay(freeColClient);
    let unitAnimator = new UnitAnimator()._UnitAnimator(freeColClient, this, lib);
    this.mapViewerState = new MapViewerState()._MapViewerState(chatDisplay, unitAnimator, al);
    this.mapViewerScaledUtils = new MapViewerScaledUtils()._MapViewerScaledUtils();
    this.rpm = new MapViewerRepaintManager()._MapViewerRepaintManager();
    this.updateScaledVariables();
    return this;
  }
  /**
   * Change the scale of the map.
   *
   * @param newScale The new map scale.
   */
  changeScale(newScale: number): void {
    this.lib.changeScaleFactor(newScale);
    this.tv.updateScaledVariables();
    this.updateScaledVariables();
    this.mapViewerBounds.positionMap();
    this.rpm.markAsDirty$();
  }
  /**
   * Update the variables that depend on the image library scale.
   */
  updateScaledVariables(): void {
    this.tileBounds = new TileBounds()._TileBounds(this.lib.getTileSize(), this.lib.getScaleFactor());
    this.mapViewerBounds.updateSizeVariables(this.tileBounds);
    this.mapViewerScaledUtils.updateScaledVariables(this.lib);
  }
  /**
   * Change the displayed map size.
   *
   * @param size The new map size.
   */
  changeSize(size: Dimension): void {
    this.tileBounds = new TileBounds()._TileBounds(this.lib.getTileSize(), this.lib.getScaleFactor());
    this.mapViewerBounds.changeSize(size, this.tileBounds);
    this.rpm.markAsDirty$();
  }
  /**
   * Converts the given screen coordinates to Map coordinates.
   * It checks to see to which Tile the given pixel 'belongs'.
   *
   * @param x The x-coordinate in pixels.
   * @param y The y-coordinate in pixels.
   * @return The {@code Tile} that is located at the given position
   *     on the screen.
   */
  convertToMapTile(x: number, y: number): Tile {
    return this.mapViewerBounds.convertToMapTile(this.getMap(), x, y);
  }
  /**
   * This method should only be called using {@link GUI#useMapAsyncPainter()}.
   */
  useMapAsyncPainter(): MapAsyncPainter {
    // assert SwingUtilities.isEventDispatchThread()
    if (this.asyncPainter != null && !this.asyncPainter.isStopped()) {
      return this.asyncPainter;
    }
    this.asyncPainter = new MapAsyncPainter()._MapAsyncPainter(this);
    return this.asyncPainter;
  }
  /**
   * This method should only be called using {@link GUI#stopMapAsyncPainter()}.
   */
  stopMapAsyncPainter(): void {
    // assert SwingUtilities.isEventDispatchThread()
    let theAsyncPainter = this.asyncPainter;
    if (theAsyncPainter != null) {
      theAsyncPainter.stop();
    }
    this.asyncPainter = null;
  }
  /**
   * Displays the Map.
   *
   * @param g2d The {@code Graphics2D} object on which to draw the Map.
   * @param size The size of the map.
   * @return {@code true} if the entire map has been repainted.
   */
  displayMap(g2d: Graphics2D, size: Dimension): boolean {
    let thePainter = this.asyncPainter;
    if (thePainter != null) {
      let backBufferImage = thePainter.getBackBufferImage();
      if (backBufferImage == null) {
        this.rpm.markAsDirty$();
        return this.paintMap$Graphics2D$Dimension$MapViewerBounds$boolean$MapViewer(g2d, size, this.mapViewerBounds, true);
      }
      g2d.setColor(Color.BLACK);
      g2d.drawImage$Image$int$int$ImageObserver(backBufferImage, 0, 0, null);
      this.mapViewerState.getChatDisplay().display(g2d, this.mapViewerBounds.getSize());
      return false;
    }
    if (this.rpm.isRepaintsBlocked(size)) {
      let backBufferImage = this.rpm.getBackBufferImage();
      g2d.setColor(Color.black);
      g2d.fillRect(0, 0, size.width_, size.height_);
      g2d.drawImage$Image$int$int$ImageObserver(backBufferImage, 0, 0, null);
      this.mapViewerState.getChatDisplay().display(g2d, this.mapViewerBounds.getSize());
      return false;
    }
    return this.paintMap$Graphics2D$Dimension$MapViewerBounds$boolean$MapViewer(g2d, size, this.mapViewerBounds, true);
  }
  /**
   * Displays the Map.
   *
   * @param g2d The {@code Graphics2D} object on which to draw the Map.
   * @param size The size of the map.
   * @param mapViewerBounds The bounds to be used when drawing the map. This can be
   *      a different object than {@link #getMapViewerBounds()} when painting to
   *      buffers etc.
   *
   * @return {@code true} if the entire map has been repainted.
   */
  paintMap$Graphics2D$Dimension$MapViewerBounds(g2d: Graphics2D, size: Dimension, mapViewerBounds: MapViewerBounds): boolean {
    return this.paintMap$Graphics2D$Dimension$MapViewerBounds$boolean$MapViewer(g2d, size, mapViewerBounds, false);
  }
  paintMap$Graphics2D$Dimension$MapViewerBounds$boolean$MapViewer(g2d: Graphics2D, size: Dimension, mapViewerBounds: MapViewerBounds, useBuffers: boolean): boolean {
    let startMs = Utils.now();
    let clipBounds = (useBuffers) ? g2d.getClipBounds$() : new Rectangle()._Rectangle$int$int$int$int(0, 0, size.width_, size.height_);
    if (mapViewerBounds.getFocus() == null) {
      if (g2d != null) {
        this.paintBlackBackground(g2d, clipBounds);
      }
      return false;
    }
    let dirtyClipBounds: Rectangle;
    let fullMapRenderedWithoutUsingBackBuffer: boolean;
    if (useBuffers) {
      fullMapRenderedWithoutUsingBackBuffer = this.rpm.prepareBuffers(mapViewerBounds, mapViewerBounds.getFocus());
      dirtyClipBounds = this.rpm.getDirtyClipBounds();
      if (this.rpm.isAllDirty()) {
        fullMapRenderedWithoutUsingBackBuffer = true;
      }
    } else {
      dirtyClipBounds = clipBounds;
      fullMapRenderedWithoutUsingBackBuffer = true;
    }
    let backBufferImage: VolatileImage;
    let nonAnimationBufferImage: BufferedImage;
    let backBufferG2d: Graphics2D;
    let nonAnimationG2d: Graphics2D;
    if (useBuffers) {
      backBufferImage = this.rpm.getBackBufferImage();
      nonAnimationBufferImage = this.rpm.getNonAnimationBufferImage();
      backBufferG2d = backBufferImage.createGraphics();
      nonAnimationG2d = nonAnimationBufferImage.createGraphics();
    } else {
      backBufferImage = null;
      nonAnimationBufferImage = null;
      backBufferG2d = g2d;
      nonAnimationG2d = g2d;
    }
    this.applyRenderingHints(g2d);
    this.applyRenderingHints(backBufferG2d);
    this.applyRenderingHints(nonAnimationG2d);
    let backBufferOriginTransform = backBufferG2d.getTransform();
    let map = this.getMap();
    let allRenderingClipBounds: Rectangle;
    if (dirtyClipBounds.isEmpty()) {
      allRenderingClipBounds = clipBounds;
    } else {
      allRenderingClipBounds = clipBounds.union(dirtyClipBounds);
    }
    if (!this.getClientOptions().isTerrainAnimationsEnabled()) {
      allRenderingClipBounds = dirtyClipBounds;
    }
    this.paintBlackBackground(backBufferG2d, allRenderingClipBounds);
    let animatedBaseTileTcb = new MapViewer$TileClippingBounds()._MapViewer$TileClippingBounds(mapViewerBounds, map, allRenderingClipBounds);
    let initMs = Utils.now();
    if (useBuffers) {
      backBufferG2d.setClip$Shape(allRenderingClipBounds);
    }
    backBufferG2d.translate$int$int(animatedBaseTileTcb.clipLeftX, animatedBaseTileTcb.clipTopY);
    this.paintEachTile$Graphics2D$TileClippingBounds$TileRenderingCallback$MapViewer(backBufferG2d, animatedBaseTileTcb, (tileG2d, tile) => this.tv.displayAnimatedBaseTiles(tileG2d, tile, false));
    if (!useBuffers) {
      backBufferG2d.translate$int$int(-animatedBaseTileTcb.clipLeftX, -animatedBaseTileTcb.clipTopY);
    }
    let animatedBaseMs = Utils.now();
    if (!dirtyClipBounds.isEmpty()) {
      this.displayToNonAnimationBufferImage(mapViewerBounds, dirtyClipBounds, nonAnimationG2d, map, useBuffers);
    }
    if (useBuffers) {
      nonAnimationG2d.dispose();
    }
    let nonAnimatedMs = Utils.now();
    if (useBuffers) {
      backBufferG2d.setTransform(backBufferOriginTransform);
      backBufferG2d.setClip$Shape(allRenderingClipBounds);
      backBufferG2d.drawImage$Image$int$int$ImageObserver(nonAnimationBufferImage, 0, 0, null);
      backBufferG2d.dispose();
      g2d.drawImage$Image$int$int$ImageObserver(backBufferImage, 0, 0, null);
    }
    let useBuffersMs = Utils.now();
    let cursorTile = this.getVisibleCursorTile(mapViewerBounds);
    if (cursorTile != null && this.mapViewerState.getCursor().isActive() && !this.mapViewerState.getUnitAnimator().isUnitsOutForAnimation()) {
      let p = mapViewerBounds.calculateTilePosition(cursorTile, false);
      let key = this.mapViewerState.getViewMode() === GUI$ViewMode.MOVE_UNITS ? ImageLibrary.UNIT_SELECT : ImageLibrary.TILE_SELECT;
      let image = this.lib.getScaledImage(key);
      g2d.drawImage$Image$int$int$ImageObserver(image, (p.x_ - $J.idiv(((image.getWidth() - this.tileBounds.getWidth()) | 0), 2)) | 0, (p.y_ - $J.idiv(((image.getHeight() - this.tileBounds.getHeight()) | 0), 2)) | 0, null);
    }
    let cursorTileMs = Utils.now();
    if (this.mapViewerState.getGotoPath() != null) {
      this.displayPath(g2d, this.mapViewerState.getGotoPath(), mapViewerBounds);
    } else if (this.mapViewerState.getUnitPath() != null) {
      this.displayPath(g2d, this.mapViewerState.getUnitPath(), mapViewerBounds);
    }
    let gotoPathMs = Utils.now();
    if (this.mapViewerState.isRangedAttackMode() && this.mapViewerState.getActiveUnit() != null && this.mapViewerState.getActiveUnit().getTile$() != null) {
      let rangedTarget = this.lib.getRangedTargetCrosshair();
      let possibleTargets = map.getCircleTiles(this.mapViewerState.getActiveUnit().getTile$(), true, this.mapViewerState.getActiveUnit().getType().getAttackRange());
      for (const $it0 = possibleTargets.iterator(); $it0.hasNext(); ) {
        let t = $it0.next();
        if (this.mapViewerState.getActiveUnit().canAttackRanged(t)) {
          let point = mapViewerBounds.calculateTilePosition(t, false);
          if (point == null) {
            continue;
          }
          g2d.drawImage$Image$int$int$ImageObserver(rangedTarget, (point.x_ + $J.idiv(((this.tileBounds.getWidth() - rangedTarget.getWidth()) | 0), 2)) | 0, (point.y_ + $J.idiv(((this.tileBounds.getHeight() - rangedTarget.getHeight()) | 0), 2)) | 0, null);
        }
      }
    }
    this.mapViewerState.getChatDisplay().display(g2d, mapViewerBounds.getSize());
    let chatMs = Utils.now();
    if (FreeColDebugger.debugRendering()) {
      this.fullyRepaintedAreas.add(dirtyClipBounds);
      g2d.setColor(new Color()._Color$int$int$int$int(255, 0, 0, 100));
      for (const $it1 = this.fullyRepaintedAreas.iterator(); $it1.hasNext(); ) {
        let r = $it1.next();
        g2d.fill(r);
      }
      this.fullyRepaintedAreas.clear();
    }
    if (useBuffers) {
      this.verifyAndMarkAsClean(size, clipBounds);
    }
    if (fullMapRenderedWithoutUsingBackBuffer && MapViewer.logger.isLoggable(Level.FINEST)) {
      let endMs = Utils.now();
      let gap = endMs - startMs;
      let sb = new StringBuilder(128);
      sb.append('displayMap fullRendering=').append(String(fullMapRenderedWithoutUsingBackBuffer)).append(' time= ').append(String(gap)).append(' init=').append(String(initMs - startMs)).append(' animated=').append(String(animatedBaseMs - initMs)).append(' displayNonAnimationImages=').append(String(nonAnimatedMs - animatedBaseMs)).append(' buffers=').append(String(useBuffersMs - nonAnimatedMs)).append(' cursorTile=').append(String(cursorTileMs - useBuffersMs)).append(' goto=').append(String(gotoPathMs - cursorTileMs)).append(' chat=').append(String(chatMs - gotoPathMs)).append(' finish=').append(String(endMs - chatMs));
      MapViewer.logger.finest(sb.toString());
    }
    return fullMapRenderedWithoutUsingBackBuffer;
  }
  applyRenderingHints(g2d: Graphics2D): void {
    if (this.getClientOptions().getRange(ClientOptions.GRAPHICS_QUALITY) === ClientOptions.GRAPHICS_QUALITY_LOWEST) {
      g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_OFF);
      g2d.setRenderingHint(RenderingHints.KEY_ALPHA_INTERPOLATION, RenderingHints.VALUE_ALPHA_INTERPOLATION_SPEED);
      g2d.setRenderingHint(RenderingHints.KEY_COLOR_RENDERING, RenderingHints.VALUE_COLOR_RENDER_SPEED);
      g2d.setRenderingHint(RenderingHints.KEY_DITHERING, RenderingHints.VALUE_DITHER_DISABLE);
      g2d.setRenderingHint(RenderingHints.KEY_FRACTIONALMETRICS, RenderingHints.VALUE_FRACTIONALMETRICS_OFF);
      g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR);
      g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_SPEED);
      g2d.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_DEFAULT);
      g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_OFF);
    }
  }
  /**
   * Paints the dirty tiles to the buffers. The screen will
   * be updated the next time {@link #displayMap(Graphics2D, Dimension)}
   * gets called.
   *
   * This is used for handling several small dirty areas that would otherwise
   * force a full repaint since the bounding box covers the entire screen.
   * An example of this is diagonal scrolling.
   */
  paintImmediatelyToBuffersOnly(): void {
    if (this.mapViewerBounds.getFocus() == null || this.rpm.isRepaintsBlocked(this.mapViewerBounds.getSize())) {
      return;
    }
    this.rpm.prepareBuffers(this.mapViewerBounds, this.mapViewerBounds.getFocus());
    let dirtyClipBounds = this.rpm.getDirtyClipBounds();
    if (dirtyClipBounds.isEmpty()) {
      return;
    }
    let nonAnimationBufferImage = this.rpm.getNonAnimationBufferImage();
    let map = this.getMap();
    let nonAnimationG2d = nonAnimationBufferImage.createGraphics();
    this.displayToNonAnimationBufferImage(this.mapViewerBounds, dirtyClipBounds, nonAnimationG2d, map, true);
    nonAnimationG2d.dispose();
    if (FreeColDebugger.debugRendering()) {
      this.fullyRepaintedAreas.add(dirtyClipBounds);
    }
    this.rpm.markAsClean();
  }
  displayToNonAnimationBufferImage(mapViewerBounds: MapViewerBounds, dirtyClipBounds: Rectangle, nonAnimationG2d: Graphics2D, map: Map_, useBuffers: boolean): void {
    let tcb = new MapViewer$TileClippingBounds()._MapViewer$TileClippingBounds(mapViewerBounds, map, dirtyClipBounds);
    this.displayNonAnimationImages(nonAnimationG2d, dirtyClipBounds, tcb, useBuffers);
  }
  displayNonAnimationImages(nonAnimationG2d: Graphics2D, clipBounds: Rectangle, tcb: MapViewer$TileClippingBounds, useBuffers: boolean): void {
    let t0 = Utils.now();
    let player = this.getMyPlayer();
    let options = this.getClientOptions();
    if (useBuffers) {
      nonAnimationG2d.setComposite(AlphaComposite.Clear);
      nonAnimationG2d.fill(clipBounds);
      nonAnimationG2d.setComposite(AlphaComposite.SrcOver);
      nonAnimationG2d.setClip$Shape(clipBounds);
    }
    nonAnimationG2d.translate$int$int(tcb.clipLeftX, tcb.clipTopY);
    let t1 = Utils.now();
    this.paintEachTile$Graphics2D$TileClippingBounds$TileRenderingCallback$MapViewer(nonAnimationG2d, tcb, (tileG2d, tile) => this.tv.displayTileWithBeach(tileG2d, tile));
    nonAnimationG2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    let t2 = Utils.now();
    this.paintEachTile$Graphics2D$TileClippingBounds$TileRenderingCallback$MapViewer(nonAnimationG2d, tcb, (tileG2d, tile) => {
      if (this.getClientOptions().isRiverAnimationEnabled() && (tile.hasRiver() || this.tv.hasRiverDelta(tile))) {
        return;
      }
      this.tv.drawBaseTileTransitions(tileG2d, tile);
    });
    let t3 = Utils.now();
    this.displayGrid(nonAnimationG2d, options, tcb);
    let t4 = Utils.now();
    if (options.getInteger(ClientOptions.DISPLAY_TILE_TEXT) === ClientOptions.DISPLAY_TILE_TEXT_REGIONS) {
      this.paintEachTileWithExtendedImageSize(nonAnimationG2d, tcb, (tileG2d, tile) => this.displayTerritorialBorders(tileG2d, tile, MapViewer$BorderType.REGION, true));
    }
    let t5 = Utils.now();
    if (options.getBoolean(ClientOptions.DISPLAY_BORDERS)) {
      this.paintEachTileWithExtendedImageSize(nonAnimationG2d, tcb, (tileG2d, tile) => this.displayTerritorialBorders(tileG2d, tile, MapViewer$BorderType.COUNTRY, true));
    }
    let t6 = Utils.now();
    nonAnimationG2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_OFF);
    let fow: RescaleOp;
    if (this.shouldFogOfWarBeDisplayed(player, options)) {
      fow = new RescaleOp()._RescaleOp$floatArr$floatArr$RenderingHints([Math.fround(0.8), Math.fround(0.8), Math.fround(0.8), 1], [0, 0, 0, 0], null);
      let oldComposite = nonAnimationG2d.getComposite();
      nonAnimationG2d.setColor(Color.BLACK);
      nonAnimationG2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, Math.fround(0.2)));
      this.paintEachTile$Graphics2D$TileClippingBounds$TileRenderingCallback$MapViewer(nonAnimationG2d, tcb, (tileG2d, tile) => {
        if (!tile.isExplored() || player.canSee(tile)) {
          return;
        }
        tileG2d.fill(this.mapViewerScaledUtils.getFog());
      });
      nonAnimationG2d.setComposite(oldComposite);
    } else {
      fow = null;
    }
    let t7 = Utils.now();
    this.paintEachTile$Graphics2D$TileClippingBounds$TileRenderingCallback$MapViewer(nonAnimationG2d, tcb, (tileG2d, tile) => this.tv.displayUnknownTileBorder(tileG2d, tile));
    let t8 = Utils.now();
    let colonyLabels = options.getInteger(ClientOptions.DISPLAY_COLONY_LABELS);
    let withNumbers = (colonyLabels === ClientOptions.COLONY_LABELS_CLASSIC);
    this.paintEachTileWithExtendedImageSize(nonAnimationG2d, tcb, (tileG2d, tile) => {
      if (!tile.isExplored()) {
        return;
      }
      let overlayImage = this.lib.getScaledOverlayImage(tile);
      let rop = (player == null || player.canSee(tile)) ? null : fow;
      this.tv.displayTileItems(tileG2d, tile, rop, overlayImage);
      this.tv.displaySettlementWithChipsOrPopulationNumber(tileG2d, tile, withNumbers, rop);
      this.tv.displayOptionalTileText(tileG2d, tile);
    });
    let t9 = Utils.now();
    nonAnimationG2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    if (options.getInteger(ClientOptions.DISPLAY_TILE_TEXT) === ClientOptions.DISPLAY_TILE_TEXT_REGIONS) {
      this.paintEachTileWithExtendedImageSize(nonAnimationG2d, tcb, (tileG2d, tile) => this.displayTerritorialBorders(tileG2d, tile, MapViewer$BorderType.REGION, false));
    }
    let t10 = Utils.now();
    if (options.getBoolean(ClientOptions.DISPLAY_BORDERS)) {
      this.paintEachTileWithExtendedImageSize(nonAnimationG2d, tcb, (tileG2d, tile) => this.displayTerritorialBorders(tileG2d, tile, MapViewer$BorderType.COUNTRY, false));
    }
    let t12 = Utils.now();
    nonAnimationG2d.setColor(Color.BLACK);
    let revengeMode = this.getGame().isInRevengeMode();
    if (!revengeMode) {
      this.paintEachTile$Graphics2D$Position$List$TileRenderingCallback$MapViewer(nonAnimationG2d, tcb.getTopLeftDirtyTile(), tcb.getUnitTiles(), (tileG2d, tile) => {
        let unit = this.mapViewerState.findUnitInFront(tile);
        if (unit == null || this.mapViewerState.getUnitAnimator().isOutForAnimation(unit)) {
          return;
        }
        this.displayUnit(tileG2d, unit);
      });
    } else {
      let darkness = this.lib.getScaledImage(ImageLibrary.DARKNESS);
      this.paintEachTileWithSuperExtendedImageSize(nonAnimationG2d, tcb, (tileG2d, tile) => {
        let unit = this.mapViewerState.findUnitInFront(tile);
        if (unit == null || this.mapViewerState.getUnitAnimator().isOutForAnimation(unit)) {
          return;
        }
        if (unit.isUndead()) {
          this.tv.displayCenteredImage$Graphics2D$BufferedImage(tileG2d, darkness);
        }
        this.displayUnit(tileG2d, unit);
      });
    }
    let t13 = Utils.now();
    this.paintEachTileWithExtendedImageSize(nonAnimationG2d, tcb, (tileG2d, tile) => {
      if (!tile.isExplored()) {
        return;
      }
      let overlayImage = this.lib.getScaledAboveTileImage(tile);
      if (overlayImage != null) {
        tileG2d.drawImage$Image$int$int$ImageObserver(overlayImage, $J.idiv(((this.tileBounds.getWidth() - overlayImage.getWidth()) | 0), 2), $J.idiv(((this.tileBounds.getHeight() - overlayImage.getHeight()) | 0), 2), null);
      }
    });
    this.displayDebugAiDefensiveMap(nonAnimationG2d, tcb);
    this.displayAreasInMapEditor(nonAnimationG2d, tcb);
    let t14 = Utils.now();
    if (colonyLabels !== ClientOptions.COLONY_LABELS_NONE) {
      this.paintEachTileWithExtendedImageSize(nonAnimationG2d, tcb, (tileG2d, tile) => {
        let settlement = tile.getSettlement();
        if (settlement == null) {
          return;
        }
        let rop = (player == null || player.canSee(tile)) ? null : fow;
        this.displaySettlementLabels(tileG2d, settlement, player, colonyLabels, rop);
      });
    }
    let t15 = Utils.now();
    if (!useBuffers) {
      nonAnimationG2d.translate$int$int(-tcb.clipLeftX, -tcb.clipTopY);
    }
    if (MapViewer.logger.isLoggable(Level.FINEST)) {
      let gap = Utils.now() - t0;
      let bottomRight = tcb.getBottomRightDirtyTile();
      let topLeft = tcb.getTopLeftDirtyTile();
      let avg = (gap) / (Math.imul(((bottomRight.getX() - topLeft.getX()) | 0), ((bottomRight.getY() - topLeft.getY()) | 0)));
      let sb = new StringBuilder(128);
      sb.append('displayNonAnimationImages time = ').append(String(gap)).append(' for ').append($J.str(tcb.getTopLeftDirtyTile())).append(' to ').append($J.str(tcb.getBottomRightDirtyTile())).append(' average ').append($J.dstr(avg)).append(' t1=').append(String(t1 - t0)).append(' t2=').append(String(t2 - t1)).append(' t3=').append(String(t3 - t2)).append(' t4=').append(String(t4 - t3)).append(' t5=').append(String(t5 - t4)).append(' t6=').append(String(t6 - t5)).append(' t7=').append(String(t7 - t6)).append(' t8=').append(String(t8 - t7)).append(' t9=').append(String(t9 - t8)).append(' t10=').append(String(t10 - t9)).append(' t12=').append(String(t12 - t10)).append(' t13=').append(String(t13 - t12)).append(' t14=').append(String(t14 - t13)).append(' t15=').append(String(t15 - t14));
      MapViewer.logger.finest(sb.toString());
    }
  }
  displayAreasInMapEditor(nonAnimationG2d: Graphics2D, tcb: MapViewer$TileClippingBounds): void {
    if (!this.getFreeColClient().isMapEditor()) {
      return;
    }
    let mec = this.getFreeColClient().getMapEditorController();
    if (!mec.isDisplayAreas()) {
      return;
    }
    let oldAntialiasingHint = nonAnimationG2d.getRenderingHint(RenderingHints.KEY_ANTIALIASING);
    nonAnimationG2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_OFF);
    let oldComposite = nonAnimationG2d.getComposite();
    nonAnimationG2d.setColor(Color.BLACK);
    nonAnimationG2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, 0.5));
    let oldColor = nonAnimationG2d.getColor();
    let baseTileOutline = this.mapViewerScaledUtils.getBaseTileOutline();
    this.paintEachTile$Graphics2D$TileClippingBounds$TileRenderingCallback$MapViewer(nonAnimationG2d, tcb, (tileG2d, tile) => {
      let areas = this.getGame().getAreas().stream().filter((a) => a.containsTile(tile)).filter((a) => mec.isAreaVisible(a)).collect(Collectors.toList());
      if (areas.isEmpty()) {
        return;
      }
      if (areas.size() === 1) {
        let area = areas.get(0);
        tileG2d.setColor(area.getColor());
        tileG2d.fill(baseTileOutline);
        return;
      }
      let oldClip = tileG2d.getClip();
      let oldStroke = tileG2d.getStroke();
      tileG2d.setClip$Shape(baseTileOutline);
      let stepSize = this.lib.scaleInt(4);
      tileG2d.setStroke(new BasicStroke()._BasicStroke$float(Math.fround(stepSize)));
      let step = 0;
      let index = 0;
      while (Math.imul(step, stepSize) < this.tileBounds.getHeight()) {
        let area = areas.get(index);
        tileG2d.setColor(area.getColor());
        tileG2d.drawLine(0, Math.imul(step, stepSize), this.tileBounds.getWidth(), Math.imul(step, stepSize));
        step++;
        index++;
        if (index === areas.size()) {
          index = 0;
        }
      }
      tileG2d.setClip$Shape(oldClip);
      tileG2d.setStroke(oldStroke);
    });
    nonAnimationG2d.setColor(oldColor);
    nonAnimationG2d.setComposite(oldComposite);
    nonAnimationG2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, oldAntialiasingHint);
  }
  displayDebugAiDefensiveMap(nonAnimationG2d: Graphics2D, tcb: MapViewer$TileClippingBounds): void {
    if (FreeColDebugger.debugShowDefenceMapForPlayer() != null && this.getFreeColServer() != null && this.getFreeColServer().getAIMain() != null) {
      let aiObject = this.getFreeColServer().getAIMain().getAIObject$String(FreeColDebugger.debugShowDefenceMapForPlayer().getId());
      if (aiObject != null && aiObject instanceof EuropeanAIPlayer) {
        let eap = aiObject;
        let defensiveMap = DefensiveMap.createDefensiveMap(eap);
        this.paintEachTile$Graphics2D$Position$List$TileRenderingCallback$MapViewer(nonAnimationG2d, tcb.getTopLeftDirtyTile(), tcb.getBaseTiles(), (tileG2d, tile) => {
          let defensiveZone = defensiveMap.getDefensiveZone(tile);
          if (defensiveZone == null) {
            return;
          }
          if (defensiveZone.getNumberOfMilitaryEnemies() > 0) {
            tileG2d.setColor(new Color()._Color$int$int$int$int(255, 0, 0, 150));
          } else if (defensiveZone.isEnemiesInNeighbour()) {
            tileG2d.setColor(new Color()._Color$int$int$int$int(255, 100, 100, 150));
          } else if (defensiveZone.isExposed()) {
            tileG2d.setColor(new Color()._Color$int$int$int$int(255, 255, 0, 150));
          } else {
            tileG2d.setColor(new Color()._Color$int$int$int$int(0, 255, 0, 150));
          }
          tileG2d.fill(this.mapViewerScaledUtils.getFog());
        });
      }
    }
  }
  shouldFogOfWarBeDisplayed(player: Player, options: ClientOptions): boolean {
    return player != null && this.getSpecification().getBoolean(GameOptions.FOG_OF_WAR) && options.getBoolean(ClientOptions.DISPLAY_FOG_OF_WAR);
  }
  displayGrid(g2d: Graphics2D, options: ClientOptions, tcb: MapViewer$TileClippingBounds): void {
    if (options.getBoolean(ClientOptions.DISPLAY_GRID)) {
      let baseTransform = g2d.getTransform();
      let gridPath = new GeneralPath()._GeneralPath$();
      gridPath.moveTo$float$float(0, 0);
      let nextX = this.tileBounds.getHalfWidth();
      let nextY = -this.tileBounds.getHalfHeight();
      for (let i = 0; i <= ((Math.imul(((tcb.getBottomRightDirtyTile().getX() - tcb.getTopLeftDirtyTile().getX()) | 0), 2) + 1) | 0); i++) {
        gridPath.lineTo$float$float(Math.fround(nextX), Math.fround(nextY));
        nextX = (nextX + this.tileBounds.getHalfWidth()) | 0;
        nextY = (nextY === 0) ? -this.tileBounds.getHalfHeight() : 0;
      }
      g2d.setStroke(this.mapViewerScaledUtils.getGridStroke());
      g2d.setColor(Color.BLACK);
      for (let row = tcb.getTopLeftDirtyTile().getY(); row <= tcb.getBottomRightDirtyTile().getY(); row++) {
        g2d.translate$int$int(0, this.tileBounds.getHalfHeight());
        let rowTransform = g2d.getTransform();
        if ((row & 1) === 1) {
          g2d.translate$int$int(this.tileBounds.getHalfWidth(), 0);
        }
        g2d.draw(gridPath);
        g2d.setTransform(rowTransform);
      }
      g2d.setTransform(baseTransform);
    }
  }
  paintBlackBackground(g2d: Graphics2D, rectangle: Rectangle): void {
    g2d.setColor(Color.black);
    g2d.fillRect(rectangle.x_, rectangle.y_, rectangle.width_, rectangle.height_);
  }
  displaySettlementLabels(g2d: Graphics2D, settlement: Settlement, player: Player, colonyLabels: number, rop: RescaleOp): void {
    if (settlement.isDisposed()) {
      MapViewer.logger.warning('Settlement display race detected: ' + settlement.getName());
      return;
    }
    let name = Messages.message$StringTemplate(settlement.getLocationLabelFor(player));
    if (name == null) {
      return;
    }
    let backgroundColor = settlement.getOwner().getNationColor();
    if (backgroundColor == null) {
      backgroundColor = Color.WHITE;
    }
    let yOffset = this.tileBounds.getHeight();
    {
      let img: BufferedImage, specs: MapViewer$TextSpecification[], nameImage: BufferedImage, spacing: number, leftImage: BufferedImage, rightImage: BufferedImage, xOffset: number;
      switch (colonyLabels) {
        case ClientOptions.COLONY_LABELS_CLASSIC:
          img = this.lib.getStringImage(g2d, name, backgroundColor, this.mapViewerScaledUtils.getFontNormal());
          g2d.drawImage$BufferedImage$BufferedImageOp$int$int(img, rop, ($J.idiv(((this.tileBounds.getWidth() - img.getWidth()) | 0), 2) + 1) | 0, yOffset);
          break;
        case ClientOptions.COLONY_LABELS_MODERN:
        default:
          backgroundColor = new Color()._Color$int$int$int$int(backgroundColor.getRed(), backgroundColor.getGreen(), backgroundColor.getBlue(), 128);
          specs = $J.newArray(1, null);
          if (settlement instanceof Colony && settlement.getOwner() === player) {
            let colony = settlement;
            let buildable = colony.getCurrentlyBuilding();
            if (buildable != null && this.mapViewerScaledUtils.getFontProduction() != null) {
              specs = $J.newArray(2, null);
              let t = Messages.getName$Named(buildable) + ' ' + Turn.getTurnsText(colony.getTurnsToComplete$BuildableType(buildable));
              specs[1] = new MapViewer$TextSpecification()._MapViewer$TextSpecification(t, this.mapViewerScaledUtils.getFontProduction());
            }
          }
          specs[0] = new MapViewer$TextSpecification()._MapViewer$TextSpecification(name, this.mapViewerScaledUtils.getFontNormal());
          nameImage = MapViewer.createLabel$Graphics2D$TextSpecificationArr$Color(g2d, specs, backgroundColor);
          spacing = this.lib.scaleInt(3);
          leftImage = null;
          rightImage = null;
          if (settlement instanceof Colony) {
            let colony = settlement;
            let string$ = String(colony.getApparentUnitCount());
            leftImage = MapViewer.createLabel$Graphics2D$String$Font$Color(g2d, string$, ((colony.getPreferredSizeChange() > 0) ? this.mapViewerScaledUtils.getFontItalic() : this.mapViewerScaledUtils.getFontNormal()), backgroundColor);
            if (player.owns(settlement)) {
              let bonusProduction = colony.getProductionBonus();
              if (bonusProduction !== 0) {
                let bonus = (bonusProduction > 0) ? '+' + bonusProduction : String(bonusProduction);
                rightImage = MapViewer.createLabel$Graphics2D$String$Font$Color(g2d, bonus, this.mapViewerScaledUtils.getFontNormal(), backgroundColor);
              }
            }
          } else if (settlement instanceof IndianSettlement) {
            let is$ = settlement;
            if (is$.getType().isCapital()) {
              leftImage = MapViewer.createCapitalLabel(nameImage.getHeight(), 5, backgroundColor);
            }
            let missionary = is$.getMissionary();
            if (missionary != null) {
              let expert = missionary.hasAbility$String(Ability.EXPERT_MISSIONARY);
              backgroundColor = missionary.getOwner().getNationColor();
              backgroundColor = new Color()._Color$int$int$int$int(backgroundColor.getRed(), backgroundColor.getGreen(), backgroundColor.getBlue(), 128);
              rightImage = MapViewer.createReligiousMissionLabel(nameImage.getHeight(), 5, backgroundColor, expert);
            }
          }
          xOffset = ($J.idiv(this.tileBounds.getWidth(), 2) - $J.idiv(nameImage.getWidth(), 2) - ((leftImage == null) ? 0 : (leftImage.getWidth() + spacing) | 0)) | 0;
          yOffset = (yOffset - $J.idiv(nameImage.getHeight(), 2)) | 0;
          if (leftImage != null) {
            g2d.drawImage$BufferedImage$BufferedImageOp$int$int(leftImage, rop, xOffset, yOffset);
            xOffset = (xOffset + (leftImage.getWidth() + spacing)) | 0;
          }
          g2d.drawImage$BufferedImage$BufferedImageOp$int$int(nameImage, rop, xOffset, yOffset);
          if (rightImage != null) {
            xOffset = (xOffset + (nameImage.getWidth() + spacing)) | 0;
            g2d.drawImage$BufferedImage$BufferedImageOp$int$int(rightImage, rop, xOffset, yOffset);
          }
          break;
      }
    }
  }
  /**
   * Draws the pentagram indicating a native capital.
   *
   * @param extent The nominal height of the image.
   * @param padding Padding to add around the image.
   * @param backgroundColor The image background color.
   * @return A suitable {@code BufferedImage}.
   */
  static createCapitalLabel(extent: number, padding: number, backgroundColor: Color): BufferedImage {
    let deg2rad = 3.141592653589793 / 180;
    let angle = -90 * deg2rad;
    let offset = extent * 0.5;
    let size1 = ((extent - padding - padding) | 0) * 0.5;
    let path = new GeneralPath()._GeneralPath$();
    path.moveTo$double$double(Math.cos(angle) * size1 + offset, Math.sin(angle) * size1 + offset);
    for (let i = 0; i < 4; i++) {
      angle += 144 * deg2rad;
      path.lineTo$double$double(Math.cos(angle) * size1 + offset, Math.sin(angle) * size1 + offset);
    }
    path.closePath();
    let bi = ImageUtils.createBufferedImage$int$int(extent, extent);
    let g2d = bi.createGraphics();
    g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
    g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    g2d.setColor(backgroundColor);
    g2d.fill(new RoundRectangle2D$Float()._RoundRectangle2D$Float$float$float$float$float$float$float(0, 0, Math.fround(extent), Math.fround(extent), Math.fround(padding), Math.fround(padding)));
    g2d.setColor(Color.BLACK);
    g2d.setStroke(new BasicStroke()._BasicStroke$float$int$int(Math.fround(2.4), BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
    g2d.draw(path);
    g2d.setColor(Color.WHITE);
    g2d.fill(path);
    g2d.dispose();
    return bi;
  }
  /**
   * Creates an BufferedImage that shows the given text centred on a
   * translucent rounded rectangle with the given color.
   *
   * @param g2d a {@code Graphics2D}
   * @param text a {@code String}
   * @param font a {@code Font}
   * @param backgroundColor a {@code Color}
   * @return an {@code BufferedImage}
   */
  static createLabel$Graphics2D$String$Font$Color(g2d: Graphics2D, text: string, font: Font, backgroundColor: Color): BufferedImage {
    let specs = $J.newArray(1, null);
    specs[0] = new MapViewer$TextSpecification()._MapViewer$TextSpecification(text, font);
    return MapViewer.createLabel$Graphics2D$TextSpecificationArr$Color(g2d, specs, backgroundColor);
  }
  /**
   * Creates an BufferedImage that shows the given text centred on a
   * translucent rounded rectangle with the given color.
   *
   * @param g2d a {@code Graphics2D}
   * @param textSpecs a {@code TextSpecification} array
   * @param backgroundColor a {@code Color}
   * @return a {@code BufferedImage}
   */
  static createLabel$Graphics2D$TextSpecificationArr$Color(g2d: Graphics2D, textSpecs: MapViewer$TextSpecification[], backgroundColor: Color): BufferedImage {
    let hPadding = 15;
    let vPadding = 10;
    let linePadding = 5;
    let width = 0;
    let height = vPadding;
    let i: number;
    let spec: MapViewer$TextSpecification;
    let labels = $J.newArray(textSpecs.length, null);
    let label: TextLayout;
    for (i = 0; i < textSpecs.length; i++) {
      spec = textSpecs[i];
      label = new TextLayout(spec.text_, spec.font, g2d.getFontRenderContext());
      labels[i] = label;
      let textRectangle = label.getPixelBounds(null, 0, 0);
      width = Math.max(width, (textRectangle.width_ + hPadding) | 0);
      if (i > 0) {
        height = (height + linePadding) | 0;
      }
      height = (height + $J.d2i((Math.fround(label.getAscent() + label.getDescent())))) | 0;
    }
    let radius = Math.min(hPadding, vPadding);
    let bi = ImageUtils.createBufferedImage$int$int(width, height);
    let g2 = bi.createGraphics();
    g2.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
    g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    g2.setRenderingHint(RenderingHints.KEY_FRACTIONALMETRICS, RenderingHints.VALUE_FRACTIONALMETRICS_ON);
    g2.setColor(backgroundColor);
    g2.fill(new RoundRectangle2D$Float()._RoundRectangle2D$Float$float$float$float$float$float$float(0, 0, Math.fround(width), Math.fround(height), Math.fround(radius), Math.fround(radius)));
    g2.setColor(ImageLibrary.makeForegroundColor(backgroundColor));
    let y = Math.fround(vPadding / 2);
    for (i = 0; i < labels.length; i++) {
      let textRectangle = labels[i].getPixelBounds(null, 0, 0);
      let x = Math.fround(((width - textRectangle.width_) | 0) / 2);
      y = Math.fround(y + labels[i].getAscent());
      labels[i].draw(g2, x, y);
      y = Math.fround(y + Math.fround(labels[i].getDescent() + linePadding));
    }
    g2.dispose();
    return bi;
  }
  /**
   * Draws a cross indicating a religious mission is present in the
   * native village.
   *
   * @param extent The nominal height of the image.
   * @param padding Padding to add around the image.
   * @param backgroundColor The image background color.
   * @param expertMissionary True if the label should show expertise.
   * @return A suitable {@code BufferedImage}.
   */
  static createReligiousMissionLabel(extent: number, padding: number, backgroundColor: Color, expertMissionary: boolean): BufferedImage {
    let offset = extent * 0.5;
    let size1 = (extent - padding - padding) | 0;
    let bar = size1 / 3;
    let inset = 0;
    let kludge = 0;
    let circle = new GeneralPath()._GeneralPath$();
    let cross = new GeneralPath()._GeneralPath$();
    if (expertMissionary) {
      circle.append$Shape$boolean(new Ellipse2D$Double()._Ellipse2D$Double$double$double$double$double((padding - 1) | 0, (padding - 1) | 0, size1 + 1, size1 + 1), false);
      inset = 4;
      bar = (size1 - inset - inset) / 3;
      kludge = 1;
    }
    offset -= 1;
    cross.moveTo$double$double(offset, padding + inset - kludge);
    cross.lineTo$double$double(offset, ((extent - padding) | 0) - inset);
    cross.moveTo$double$double(offset - bar, padding + bar + inset);
    cross.lineTo$double$double(offset + bar + 1, padding + bar + inset);
    let bi = ImageUtils.createBufferedImage$int$int(extent, extent);
    let g2d = bi.createGraphics();
    g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
    g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    g2d.setColor(backgroundColor);
    g2d.fill(new RoundRectangle2D$Float()._RoundRectangle2D$Float$float$float$float$float$float$float(0, 0, Math.fround(extent), Math.fround(extent), Math.fround(padding), Math.fround(padding)));
    g2d.setColor(ImageLibrary.makeForegroundColor(backgroundColor));
    if (expertMissionary) {
      g2d.setStroke(new BasicStroke()._BasicStroke$float$int$int(2, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
      g2d.draw(circle);
      g2d.setStroke(new BasicStroke()._BasicStroke$float$int$int(Math.fround(1.6), BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
    } else {
      g2d.setStroke(new BasicStroke()._BasicStroke$float$int$int(Math.fround(2.4), BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
    }
    g2d.draw(cross);
    g2d.dispose();
    return bi;
  }
  /**
   * Display a path.
   *
   * @param g2d The {@code Graphics2D} to display on.
   * @param path The {@code PathNode} to display.
   */
  displayPath(g2d: Graphics2D, path: PathNode, mapViewerBounds: MapViewerBounds): void {
    if (path == null || path.next_ == null) {
      return;
    }
    let defaultStroke = g2d.getStroke();
    let oldColor = g2d.getColor();
    let oldFont = g2d.getFont();
    g2d.setStroke(new BasicStroke()._BasicStroke$float$int$int(Math.fround(this.lib.scaleInt(5)), BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
    g2d.setFont(this.mapViewerScaledUtils.getFontNormal());
    let previousPoint = null;
    for (let p = path; p != null; p = p.next_) {
      let newTile = p.getTile();
      if (newTile == null) {
        previousPoint = null;
        continue;
      }
      let nextPoint = mapViewerBounds.calculateCenterTilePosition(newTile);
      if (nextPoint == null) {
        previousPoint = null;
        continue;
      }
      let pathLineColor = (p.getTurns() > 0) ? new Color()._Color$int$int$int$int(255, 255, 0, 128) : new Color()._Color$int$int$int$int(0, 255, 0, 128);
      g2d.setColor(pathLineColor);
      if (previousPoint != null) {
        g2d.drawLine(previousPoint.x_, previousPoint.y_, nextPoint.x_, nextPoint.y_);
      }
      previousPoint = nextPoint;
    }
    g2d.setStroke(new BasicStroke()._BasicStroke$float(Math.fround(this.lib.scaleInt(2))));
    let fm = g2d.getFontMetrics$();
    let fontCenterY = $J.idiv(((fm.getAscent() - fm.getDescent() - fm.getLeading()) | 0), 2);
    for (let p = path; p != null; p = p.next_) {
      let newTile = p.getTile();
      if (newTile == null) {
        continue;
      }
      let newP = mapViewerBounds.calculateCenterTilePosition(newTile);
      if (newP == null) {
        continue;
      }
      let r = this.lib.scaleInt(20);
      let pathBgColor = (p.getTurns() > 0) ? new Color()._Color$int$int$int$int(255, 255, 0, 255) : new Color()._Color$int$int$int$int(0, 255, 0, 255);
      g2d.setColor(pathBgColor);
      g2d.fillOval((newP.x_ - $J.idiv(r, 2)) | 0, (newP.y_ - $J.idiv(r, 2)) | 0, r, r);
      g2d.setColor(new Color()._Color$int$int$int$int(0, 0, 0, 128));
      g2d.drawOval((newP.x_ - $J.idiv(r, 2)) | 0, (newP.y_ - $J.idiv(r, 2)) | 0, r, r);
      if (this.mapViewerScaledUtils.getFontTiny() != null && p.getTurns() > 0) {
        let text = String(p.getTurns());
        let bounds = fm.getStringBounds$String$Graphics(text, g2d);
        g2d.setColor(new Color()._Color$int$int$int(0, 0, 0));
        g2d.drawString$String$int$int(text, (newP.x_ - $J.idiv($J.d2i(bounds.getWidth()), 2)) | 0, (newP.y_ + fontCenterY) | 0);
      }
    }
    g2d.setStroke(defaultStroke);
    g2d.setColor(oldColor);
    g2d.setFont(oldFont);
  }
  /**
   * Displays the given Unit onto the given Graphics2D object at the
   * location specified by the coordinates.
   *
   * @param g2d The Graphics2D object on which to draw the Unit.
   * @param unit The Unit to draw.
   */
  displayUnit(g2d: Graphics2D, unit: Unit): void {
    let player = this.getMyPlayer();
    let fade = (unit.getState() === Unit$UnitState.SENTRY) || (unit.hasTile() && player != null && !player.canSee(unit.getTile$()));
    let image = this.lib.getScaledUnitImage$Unit$boolean(unit, fade);
    let p = this.calculateUnitImagePositionInTile(image);
    g2d.drawImage$Image$int$int$ImageObserver(image, p.x_, p.y_, null);
    let text = Messages.message$StringTemplate(unit.getOccupationLabel(player, false));
    g2d.drawImage$Image$int$int$ImageObserver(this.lib.getOccupationIndicatorChip(g2d, unit, text), this.lib.scaleInt(TileViewer.STATE_OFFSET_X), 0, null);
    let unitsOnTile = 0;
    if (unit.hasTile()) {
      unitsOnTile = unit.getTile$().getTotalUnitCount();
    }
    if (unitsOnTile > 1) {
      g2d.setColor(Color.WHITE);
      let unitLinesY = TileBounds.OTHER_UNITS_OFFSET_Y;
      let x1 = this.lib.scaleInt((TileViewer.STATE_OFFSET_X + TileBounds.OTHER_UNITS_OFFSET_X) | 0);
      let x2 = this.lib.scaleInt((TileViewer.STATE_OFFSET_X + TileBounds.OTHER_UNITS_OFFSET_X + TileBounds.OTHER_UNITS_WIDTH) | 0);
      for (let i = 0; i < unitsOnTile && i < TileBounds.MAX_OTHER_UNITS; i++) {
        g2d.drawLine(x1, unitLinesY, x2, unitLinesY);
        unitLinesY = (unitLinesY + 2) | 0;
      }
    }
    if (unit.getHitPoints() >= 0 && unit.getHitPoints() < unit.getMaximumHitPoints()) {
      let offsetX = this.lib.scaleInt(8);
      let hitpointsBarWidth = this.lib.scaleInt(5);
      let hitpointsBarMargin = this.lib.scaleInt(5);
      let fullHeight = (this.tileBounds.getHeight() - Math.imul(2, hitpointsBarMargin)) | 0;
      let filledHeight = $J.d2i((Math.fround(fullHeight * (Math.fround((Math.fround(unit.getHitPoints())) / unit.getMaximumHitPoints())))));
      g2d.setColor(new Color()._Color$int$int$int$int(0, 255, 0, 255));
      g2d.fillRect((hitpointsBarMargin + hitpointsBarWidth + offsetX) | 0, (hitpointsBarMargin - this.lib.scaleInt(TileBounds.UNIT_OFFSET) + fullHeight - filledHeight) | 0, hitpointsBarWidth, filledHeight);
      let defaultStroke = g2d.getStroke();
      g2d.setStroke(new BasicStroke()._BasicStroke$float(Math.fround(this.lib.scaleInt(1))));
      g2d.setColor(Color.BLACK);
      g2d.drawRect((hitpointsBarMargin + hitpointsBarWidth + offsetX) | 0, (hitpointsBarMargin - this.lib.scaleInt(TileBounds.UNIT_OFFSET)) | 0, hitpointsBarWidth, fullHeight);
      g2d.setStroke(defaultStroke);
    }
    let au: AIUnit;
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS) && player != null && !player.owns(unit) && unit.getOwner().isAI() && this.getFreeColServer() != null && this.getFreeColServer().getAIMain() != null && (au = this.getFreeColServer().getAIMain().getAIUnit(unit)) != null) {
      if (FreeColDebugger.debugShowMission()) {
        let missionString = (!au.hasMission$()) ? 'No mission' : JString.replaceAll(au.getMission$().getClass().getSimpleName(), 'Mission$', '');
        let origFont = g2d.getFont();
        if (FreeColDebugger.debugShowMissionInfo() && au.hasMission$()) {
          missionString += '\n' + au.getMission$().toStringForDebugExtraMissionInfo();
          g2d.setFont(origFont.deriveFont$float(Math.fround(Math.fround(origFont.getSize2D() * 2) / 3)));
        }
        this.drawCenteredMultilineDebugText(g2d, missionString, 0, 0);
        g2d.setFont(origFont);
      }
    }
  }
  drawCenteredMultilineDebugText(g2d: Graphics2D, text: string, x: number, y: number): void {
    let fm = g2d.getFontMetrics$();
    let lines = JString.split(text, '\n');
    let lineTextBoundingBoxes = $J.newArray(lines.length, null);
    let allTextBoundingBox = new Dimension()._Dimension$int$int(0, 0);
    let backgroundOffsetY = 0;
    for (let i = 0; i < lines.length; i++) {
      let lineTextBoundingBox = fm.getStringBounds$String$Graphics(lines[i], g2d);
      lineTextBoundingBoxes[i] = lineTextBoundingBox;
      allTextBoundingBox = new Dimension()._Dimension$int$int($J.d2i(Math.max(allTextBoundingBox.width_, lineTextBoundingBox.getWidth())), $J.d2i((allTextBoundingBox.height_ + lineTextBoundingBox.getHeight())));
      if ($J.d2i(lineTextBoundingBox.getY()) < backgroundOffsetY) {
        backgroundOffsetY = $J.d2i(lineTextBoundingBox.getY());
      }
    }
    let tileCenterX = $J.idiv(((this.tileBounds.getWidth() - allTextBoundingBox.width_) | 0), 2);
    g2d.setColor(new Color()._Color$int$int$int$int(0, 0, 0, 128));
    g2d.fillRect((x + tileCenterX) | 0, (y + backgroundOffsetY) | 0, allTextBoundingBox.width_, allTextBoundingBox.height_);
    let offsetY = 0;
    for (let i = 0; i < lines.length; i++) {
      g2d.setColor(Color.WHITE);
      let centerX = $J.idiv($J.d2i((allTextBoundingBox.getWidth() - lineTextBoundingBoxes[i].getWidth())), 2);
      g2d.drawString$String$int$int(lines[i], (x + centerX + tileCenterX) | 0, (y + offsetY) | 0);
      offsetY = (offsetY + $J.d2i(lineTextBoundingBoxes[i].getHeight())) | 0;
    }
  }
  /**
   * Gets the coordinates to draw a unit in a given tile.
   *
   * @param unitImage The unit's image
   * @return The coordinates where the unit should be drawn on screen
   */
  calculateUnitImagePositionInTile(unitImage: BufferedImage): Point {
    let unitX = $J.idiv(((this.tileBounds.getWidth() - unitImage.getWidth()) | 0), 2);
    let unitY = ($J.idiv(((this.tileBounds.getHeight() - unitImage.getHeight()) | 0), 2) - this.lib.scaleInt(TileBounds.UNIT_OFFSET)) | 0;
    return new Point()._Point$int$int(unitX, unitY);
  }
  /**
   * Draws the borders of a territory on the given Tile. The
   * territory is either a country or a region.
   *
   * @param g2d a {@code Graphics2D}
   * @param tile a {@code Tile}
   * @param type a {@code BorderType}
   * @param opaque a {@code boolean}
   */
  displayTerritorialBorders(g2d: Graphics2D, tile: Tile, type$: MapViewer$BorderType, opaque: boolean): void {
    let owner = tile.getOwner();
    let region = tile.getRegion();
    if ((type$ === MapViewer$BorderType.COUNTRY && owner != null) || (type$ === MapViewer$BorderType.REGION && region != null)) {
      let oldStroke = g2d.getStroke();
      g2d.setStroke(this.mapViewerScaledUtils.getBorderStroke());
      let oldColor = g2d.getColor();
      let c = null;
      if (type$ === MapViewer$BorderType.COUNTRY) {
        c = owner.getNationColor();
      }
      if (c == null) {
        c = Color.WHITE;
      }
      let newColor = new Color()._Color$int$int$int$int(c.getRed(), c.getGreen(), c.getBlue(), (opaque) ? 255 : 100);
      g2d.setColor(newColor);
      let path = new GeneralPath()._GeneralPath$int(Path2D.WIND_EVEN_ODD);
      let borderPoints = this.mapViewerScaledUtils.getBorderPoints();
      let controlPoints = this.mapViewerScaledUtils.getControlPoints();
      path.moveTo$float$float(borderPoints.get(Direction.longSides.get(0)).x_, borderPoints.get(Direction.longSides.get(0)).y_);
      for (const $it2 = Direction.longSides.iterator(); $it2.hasNext(); ) {
        let d = $it2.next();
        let otherTile = tile.getNeighbourOrNull(d);
        let next = d.getNextDirection();
        let next2 = next.getNextDirection();
        if (otherTile == null || (type$ === MapViewer$BorderType.COUNTRY && !owner.owns(otherTile)) || (type$ === MapViewer$BorderType.REGION && otherTile.getRegion() !== region)) {
          let tile1 = tile.getNeighbourOrNull(next);
          let tile2 = tile.getNeighbourOrNull(next2);
          if (tile2 == null || (type$ === MapViewer$BorderType.COUNTRY && !owner.owns(tile2)) || (type$ === MapViewer$BorderType.REGION && tile2.getRegion() !== region)) {
            path.lineTo$float$float(borderPoints.get(next).x_, borderPoints.get(next).y_);
            path.quadTo$float$float$float$float(controlPoints.get(next).x_, controlPoints.get(next).y_, borderPoints.get(next2).x_, borderPoints.get(next2).y_);
          } else {
            let dx = 0;
            let dy = 0;
            switch (d) {
              case Direction.NW:
                dx = this.tileBounds.getHalfWidth();
                dy = -this.tileBounds.getHalfHeight();
                break;
              case Direction.NE:
                dx = this.tileBounds.getHalfWidth();
                dy = this.tileBounds.getHalfHeight();
                break;
              case Direction.SE:
                dx = -this.tileBounds.getHalfWidth();
                dy = this.tileBounds.getHalfHeight();
                break;
              case Direction.SW:
                dx = -this.tileBounds.getHalfWidth();
                dy = -this.tileBounds.getHalfHeight();
                break;
              default:
                break;
            }
            if (tile1 != null && ((type$ === MapViewer$BorderType.COUNTRY && owner.owns(tile1)) || (type$ === MapViewer$BorderType.REGION && tile1.getRegion() === region))) {
              path.lineTo$float$float(borderPoints.get(next).x_, borderPoints.get(next).y_);
              let previous = d.getPreviousDirection();
              let previous2 = previous.getPreviousDirection();
              let ddx = 0;
              let ddy = 0;
              switch (d) {
                case Direction.NW:
                  ddy = -this.tileBounds.getHeight();
                  break;
                case Direction.NE:
                  ddx = this.tileBounds.getWidth();
                  break;
                case Direction.SE:
                  ddy = this.tileBounds.getHeight();
                  break;
                case Direction.SW:
                  ddx = -this.tileBounds.getWidth();
                  break;
                default:
                  break;
              }
              path.quadTo$float$float$float$float(Math.fround(controlPoints.get(previous).x_ + dx), Math.fround(controlPoints.get(previous).y_ + dy), Math.fround(borderPoints.get(previous2).x_ + ddx), Math.fround(borderPoints.get(previous2).y_ + ddy));
            } else {
              path.lineTo$float$float(Math.fround(borderPoints.get(d).x_ + dx), Math.fround(borderPoints.get(d).y_ + dy));
            }
          }
        } else {
          path.moveTo$float$float(borderPoints.get(next2).x_, borderPoints.get(next2).y_);
        }
      }
      g2d.draw(path);
      g2d.setColor(oldColor);
      g2d.setStroke(oldStroke);
    }
  }
  verifyAndMarkAsClean(size: Dimension, clipBounds: Rectangle): void {
    let entireScreen = new Rectangle()._Rectangle$int$int$int$int(0, 0, size.width_, size.height_);
    let relevantDirtyClipBounds = this.rpm.getDirtyClipBounds().intersection(entireScreen);
    if (relevantDirtyClipBounds.isEmpty() || clipBounds.contains$Rectangle(relevantDirtyClipBounds)) {
      this.rpm.markAsClean();
    } else {
      MapViewer.logger.info('Repaint has been called for a smaller area than what is dirty. Have you forgotten to call repaint() after marking stuff as dirty? The only known OK instance of this happening is when the GUI is starting up. Bounds: ' + $J.str(clipBounds) + ' ==> ' + $J.str(relevantDirtyClipBounds));
    }
  }
  /**
   * Get either the tile with the active unit or the selected tile,
   * but only if it is visible.
   *
   * Used to determine where to display the cursor, for displayMap and
   * and the cursor action listener.
   *
   * @return The {@code Tile} found or null.
   */
  getVisibleCursorTile(mapViewerBounds: MapViewerBounds): Tile {
    let ret = this.mapViewerState.getCursorTile();
    return (mapViewerBounds.isTileVisible(ret)) ? ret : null;
  }
  /**
   * Internal class for the {@link MapViewer} that handles what part of the
   * {@link Map} is visible on screen
   *
   * Methods in this class should only be used by {@link SwingGUI},
   * {@link Canvas} or {@link MapViewer}.
   *
   * @return The visible map bounds.
   */
  getMapViewerBounds(): MapViewerBounds {
    return this.mapViewerBounds;
  }
  /**
   * Bounds of the tiles to be rendered. These bounds are scaled
   * according to the zoom level of the map.
   *
   * @return The tile bounds.
   */
  getTileBounds(): TileBounds {
    return this.tileBounds;
  }
  /**
   * Internal state for the {@link MapViewer}.
   *
   * Methods in this class should only be used by {@link SwingGUI},
   * {@link Canvas} or {@link MapViewer}.
   *
   * @return The {@code MapViewerState}.
   */
  getMapViewerState(): MapViewerState {
    return this.mapViewerState;
  }
  /**
   * Gets the internal class that handles buffers and dirty state of
   * {@link MapViewer}.
   *
   * Methods in this class should only be used by {@link SwingGUI},
   * {@link Canvas} or {@link MapViewer}
   *
   * @return The repaint manager.
   */
  getMapViewerRepaintManager(): MapViewerRepaintManager {
    return this.rpm;
  }
  /**
   * Paints a single tile using the provided callback.
   *
   * @param g2d The {@code Graphics2D} that is used for rendering.
   * @param tcb The bounds used for clipping the area to be rendered.
   * @param tile The {@code Tile} to be rendered.
   * @param c A callback that should render the tile. The coordinates for the
   *      {@code Graphics2D}, that's provided by the, callback will be
   *      translated so that position (0, 0) is the upper left corner of the
   *      tile image (that is, outside of the tile diamond itself).
   */
  paintSingleTile(g2d: Graphics2D, tcb: MapViewer$TileClippingBounds, tile: Tile, c: MapViewer$TileRenderingCallback): void {
    this.paintEachTile$Graphics2D$Position$List$TileRenderingCallback$MapViewer(g2d, tcb.getTopLeftDirtyTile(), List.of(tile), c);
  }
  /**
   * Paints all "dirty" tiles.
   *
   * @param g2d The {@code Graphics2D} that is used for rendering.
   * @param tcb The bounds used for clipping the area to be rendered.
   * @param c A callback that should render the tile. The coordinates for the
   *      {@code Graphics2D}, that's provided by the, callback will be
   *      translated so that position (0, 0) is the upper left corner of the
   *      tile image (that is, outside of the tile diamond itself).
   */
  paintEachTile$Graphics2D$TileClippingBounds$TileRenderingCallback$MapViewer(g2d: Graphics2D, tcb: MapViewer$TileClippingBounds, c: MapViewer$TileRenderingCallback): void {
    this.paintEachTile$Graphics2D$Position$List$TileRenderingCallback$MapViewer(g2d, tcb.getTopLeftDirtyTile(), tcb.getBaseTiles(), c);
  }
  /**
   * Paints all "dirty" tiles and includes
   * {@link TileClippingBounds#getExtendedTiles() extra tiles} to be rendered.
   *
   * This method should only be used if the rendered graphics can go beyond
   * the tile size.
   *
   * @param g2d The {@code Graphics2D} that is used for rendering.
   * @param tcb The bounds used for clipping the area to be rendered.
   * @param c A callback that should render the tile. The coordinates for the
   *      {@code Graphics2D}, that's provided by the, callback will be
   *      translated so that position (0, 0) is the upper left corner of the
   *      tile image (that is, outside of the tile diamond itself).
   */
  paintEachTileWithExtendedImageSize(g2d: Graphics2D, tcb: MapViewer$TileClippingBounds, c: MapViewer$TileRenderingCallback): void {
    this.paintEachTile$Graphics2D$Position$List$TileRenderingCallback$MapViewer(g2d, tcb.getTopLeftDirtyTile(), tcb.getExtendedTiles(), c);
  }
  /**
   * Paints all "dirty" tiles and includes
   * {@link TileClippingBounds#getSuperExtendedTiles() many extra tiles} to be rendered.
   *
   * This method should only be used if the rendered graphics can go way
   * beyond the tile size.
   *
   * @param g2d The {@code Graphics2D} that is used for rendering.
   * @param tcb The bounds used for clipping the area to be rendered.
   * @param c A callback that should render the tile. The coordinates for the
   *      {@code Graphics2D}, that's provided by the, callback will be
   *      translated so that position (0, 0) is the upper left corner of the
   *      tile image (that is, outside of the tile diamond itself).
   */
  paintEachTileWithSuperExtendedImageSize(g2d: Graphics2D, tcb: MapViewer$TileClippingBounds, c: MapViewer$TileRenderingCallback): void {
    this.paintEachTile$Graphics2D$Position$List$TileRenderingCallback$MapViewer(g2d, tcb.getTopLeftDirtyTile(), tcb.getSuperExtendedTiles(), c);
  }
  paintEachTile$Graphics2D$Position$List$TileRenderingCallback$MapViewer(g2d: Graphics2D, firstTile: Map$Position, tiles: List<Tile>, c: MapViewer$TileRenderingCallback): void {
    if (tiles.isEmpty()) {
      return;
    }
    let x0 = firstTile.getX();
    let y0 = firstTile.getY();
    let xt0 = 0;
    let yt0 = 0;
    for (const $it3 = tiles.iterator(); $it3.hasNext(); ) {
      let t = $it3.next();
      let x = t.getX();
      let y = t.getY();
      let xt = (Math.imul(((x - x0) | 0), this.tileBounds.getWidth()) + Math.imul((y & 1), this.tileBounds.getHalfWidth())) | 0;
      let yt = Math.imul(((y - y0) | 0), this.tileBounds.getHalfHeight());
      g2d.translate$int$int((xt - xt0) | 0, (yt - yt0) | 0);
      xt0 = xt;
      yt0 = yt;
      $J.fn(c, 'render')(g2d, t);
    }
    g2d.translate$int$int(-xt0, -yt0);
  }
  static $clinit() {
    MapViewer.logger = Logger.getLogger($J.cls(MapViewer).getName());
  }
}

export class MapViewer$BorderType extends JEnum {
  static COUNTRY: MapViewer$BorderType = null;
  static REGION: MapViewer$BorderType = null;
  static $VALUES: MapViewer$BorderType[] = null;
  _MapViewer$BorderType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): MapViewer$BorderType[] { return MapViewer$BorderType.$VALUES.slice(); }
  static valueOf(name: string): MapViewer$BorderType { return $J.enumValueOf(MapViewer$BorderType, name); }
  static $clinit() {
    MapViewer$BorderType.COUNTRY = new MapViewer$BorderType()._MapViewer$BorderType('COUNTRY', 0);
    MapViewer$BorderType.REGION = new MapViewer$BorderType()._MapViewer$BorderType('REGION', 1);
    MapViewer$BorderType.$VALUES = [MapViewer$BorderType.COUNTRY, MapViewer$BorderType.REGION];
  }
}

/**
 * Calculates the tile clipping bounds from a Graphics' clipBounds.
 *
 * The tiles to be redrawn is the area defined by the {@code topLeftDirtyTile}
 * (the upper left corner of the area to be repainted)
 * and {@code bottomRightDirtyTile}
 * (the lower right corner of the area to be repainted).
 *
 * The list of tiles to be repainted depends on the possible image sizes
 * that can be drawn on a tile: {@link #getBaseTiles() baseTiles},
 * {@link #getExtendedTiles() extendedTiles} and
 * {@link #getSuperExtendedTiles() superExtendedTiles}.
 */
export class MapViewer$TileClippingBounds extends JObject {
  topLeftDirtyTile: Map$Position = null;
  bottomRightDirtyTile: Map$Position = null;
  clipLeftX: number = 0;
  clipTopY: number = 0;
  baseTiles: List<Tile> = null;
  unitTiles: List<Tile> = null;
  extendedTiles: List<Tile> = null;
  superExtendedTiles: List<Tile> = null;
  _MapViewer$TileClippingBounds(mapViewerBounds: MapViewerBounds, map: Map_, clipBounds: Rectangle): this {
    let tileBounds = mapViewerBounds.getTileBounds();
    let firstRowTiles = ($J.idiv(((clipBounds.y_ - mapViewerBounds.getTopLeftVisibleTilePoint().y_) | 0), tileBounds.getHalfHeight()) - 1) | 0;
    this.clipTopY = (mapViewerBounds.getTopLeftVisibleTilePoint().y_ + Math.imul(firstRowTiles, tileBounds.getHalfHeight())) | 0;
    let firstRow = (mapViewerBounds.getTopLeftVisibleTile().getY() + firstRowTiles) | 0;
    let firstColumnTiles = ($J.idiv(((clipBounds.x_ - mapViewerBounds.getTopLeftVisibleTilePoint().x_) | 0), tileBounds.getWidth()) - 1) | 0;
    this.clipLeftX = (mapViewerBounds.getTopLeftVisibleTilePoint().x_ + Math.imul(firstColumnTiles, tileBounds.getWidth())) | 0;
    let firstColumn = (mapViewerBounds.getTopLeftVisibleTile().getX() + firstColumnTiles) | 0;
    let lastRowTiles = $J.idiv(((clipBounds.y_ + clipBounds.height_ - mapViewerBounds.getTopLeftVisibleTilePoint().y_) | 0), tileBounds.getHalfHeight());
    let lastRow = (mapViewerBounds.getTopLeftVisibleTile().getY() + lastRowTiles) | 0;
    let lastColumnTiles = $J.idiv(((clipBounds.x_ + clipBounds.width_ - mapViewerBounds.getTopLeftVisibleTilePoint().x_) | 0), tileBounds.getWidth());
    let lastColumn = (mapViewerBounds.getTopLeftVisibleTile().getX() + lastColumnTiles) | 0;
    this.topLeftDirtyTile = new Map$Position()._Map$Position$int$int(firstColumn, firstRow);
    this.bottomRightDirtyTile = new Map$Position()._Map$Position$int$int(lastColumn, lastRow);
    let subMapWidth = (this.bottomRightDirtyTile.getX() - this.topLeftDirtyTile.getX() + 1) | 0;
    let subMapHeight = (this.bottomRightDirtyTile.getY() - this.topLeftDirtyTile.getY() + 1) | 0;
    this.baseTiles = map.subMap(this.topLeftDirtyTile.getX(), this.topLeftDirtyTile.getY(), subMapWidth, subMapHeight);
    this.unitTiles = map.subMap(this.topLeftDirtyTile.getX(), this.topLeftDirtyTile.getY(), subMapWidth, (subMapHeight + 1) | 0);
    this.extendedTiles = map.subMap(this.topLeftDirtyTile.getX(), (this.topLeftDirtyTile.getY() - 1) | 0, subMapWidth, (subMapHeight + 2) | 0);
    this.superExtendedTiles = map.subMap((this.topLeftDirtyTile.getX() - 2) | 0, (this.topLeftDirtyTile.getY() - 4) | 0, (subMapWidth + 4) | 0, (subMapHeight + 8) | 0);
    return this;
  }
  getTopLeftDirtyTile(): Map$Position {
    return this.topLeftDirtyTile;
  }
  getBottomRightDirtyTile(): Map$Position {
    return this.bottomRightDirtyTile;
  }
  /**
   * The tiles to be repainted for graphics that does not extend
   * beyond the tile size.
   *
   * @return The list of tiles to repaint.
   */
  getBaseTiles(): List<Tile> {
    return this.baseTiles;
  }
  /**
   * The tiles to be repainted for unit graphics that might extend
   * up to half a tile in height above the base tile.
   *
   * @return The list of tiles to repaint.
   */
  getUnitTiles(): List<Tile> {
    return this.unitTiles;
  }
  /**
   * The tiles to be repainted for graphics that might have
   * double height compared to the tile size.
   *
   * @return The list of potential double height tiles.
   */
  getExtendedTiles(): List<Tile> {
    return this.extendedTiles;
  }
  /**
   * The tiles to be repainted for graphics that might extend
   * far into other tiles in every direction (typically halos,
   * like in revenge mode).
   *
   * @return The list of potentially haloed tiles.
   */
  getSuperExtendedTiles(): List<Tile> {
    return this.superExtendedTiles;
  }
}

/**
 * A callback for rendering a single tile.
 */
export class MapViewer$TileRenderingCallback {
}

export class MapViewer$TextSpecification extends JObject {
  text_: string = null;
  font: Font = null;
  _MapViewer$TextSpecification(newText: string, newFont: Font): this {
    this.text_ = newText;
    this.font = newFont;
    return this;
  }
}

$J.define(MapViewer, 'net.sf.freecol.client.gui.mapviewer.MapViewer', { kind: 'class', sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.ImageLibrary,java.awt.event.ActionListener': '_MapViewer' }, returns: { 'getMapViewerRepaintManager': 'net.sf.freecol.client.gui.mapviewer.MapViewerRepaintManager', 'getMapViewerState': 'net.sf.freecol.client.gui.mapviewer.MapViewerState', 'getTileBounds': 'net.sf.freecol.client.gui.mapviewer.TileBounds', 'getMapViewerBounds': 'net.sf.freecol.client.gui.mapviewer.MapViewerBounds' }, meths: { 'paintEachTile(java.awt.Graphics2D,net.sf.freecol.common.model.Map$Position,java.util.List,net.sf.freecol.client.gui.mapviewer.MapViewer$TileRenderingCallback)': 'paintEachTile$Graphics2D$Position$List$TileRenderingCallback$MapViewer', 'paintEachTile(java.awt.Graphics2D,net.sf.freecol.client.gui.mapviewer.MapViewer$TileClippingBounds,net.sf.freecol.client.gui.mapviewer.MapViewer$TileRenderingCallback)': 'paintEachTile$Graphics2D$TileClippingBounds$TileRenderingCallback$MapViewer', 'createLabel(java.awt.Graphics2D,net.sf.freecol.client.gui.mapviewer.MapViewer.TextSpecification[],java.awt.Color)': 'createLabel$Graphics2D$TextSpecificationArr$Color', 'createLabel(java.awt.Graphics2D,java.lang.String,java.awt.Font,java.awt.Color)': 'createLabel$Graphics2D$String$Font$Color', 'paintMap(java.awt.Graphics2D,java.awt.Dimension,net.sf.freecol.client.gui.mapviewer.MapViewerBounds,boolean)': 'paintMap$Graphics2D$Dimension$MapViewerBounds$boolean$MapViewer', 'paintMap(java.awt.Graphics2D,java.awt.Dimension,net.sf.freecol.client.gui.mapviewer.MapViewerBounds)': 'paintMap$Graphics2D$Dimension$MapViewerBounds' }, clinit: true, lazy: ['logger'] });
$J.define(MapViewer$BorderType, 'net.sf.freecol.client.gui.mapviewer.MapViewer$BorderType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_MapViewer$BorderType' }, clinit: true, lazy: ['$VALUES', 'COUNTRY', 'REGION'] });
$J.define(MapViewer$TileClippingBounds, 'net.sf.freecol.client.gui.mapviewer.MapViewer$TileClippingBounds', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.mapviewer.MapViewerBounds,net.sf.freecol.common.model.Map,java.awt.Rectangle': '_MapViewer$TileClippingBounds' }, returns: { 'getSuperExtendedTiles': 'java.util.List', 'getExtendedTiles': 'java.util.List', 'getUnitTiles': 'java.util.List', 'getBaseTiles': 'java.util.List', 'getBottomRightDirtyTile': 'net.sf.freecol.common.model.Map$Position', 'getTopLeftDirtyTile': 'net.sf.freecol.common.model.Map$Position' } });
$J.define(MapViewer$TileRenderingCallback, 'net.sf.freecol.client.gui.mapviewer.MapViewer$TileRenderingCallback', { kind: 'interface' });
$J.define(MapViewer$TextSpecification, 'net.sf.freecol.client.gui.mapviewer.MapViewer$TextSpecification', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String,java.awt.Font': '_MapViewer$TextSpecification' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  BasicStroke = $J.load('java.awt.BasicStroke');
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  RenderingHints = $J.load('java.awt.RenderingHints');
  Ellipse2D$Double = $J.load('java.awt.geom.Ellipse2D$Double');
  GeneralPath = $J.load('java.awt.geom.GeneralPath');
  Path2D = $J.load('java.awt.geom.Path2D');
  RoundRectangle2D$Float = $J.load('java.awt.geom.RoundRectangle2D$Float');
  RescaleOp = $J.load('java.awt.image.RescaleOp');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  GUI$ViewMode = $J.load('net.sf.freecol.client.gui.GUI$ViewMode');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  ChatDisplay = $J.load('net.sf.freecol.client.gui.mapviewer.ChatDisplay');
  MapAsyncPainter = $J.load('net.sf.freecol.client.gui.mapviewer.MapAsyncPainter');
  MapViewerBounds = $J.load('net.sf.freecol.client.gui.mapviewer.MapViewerBounds');
  MapViewerRepaintManager = $J.load('net.sf.freecol.client.gui.mapviewer.MapViewerRepaintManager');
  MapViewerScaledUtils = $J.load('net.sf.freecol.client.gui.mapviewer.MapViewerScaledUtils');
  MapViewerState = $J.load('net.sf.freecol.client.gui.mapviewer.MapViewerState');
  TileBounds = $J.load('net.sf.freecol.client.gui.mapviewer.TileBounds');
  TileViewer = $J.load('net.sf.freecol.client.gui.mapviewer.TileViewer');
  UnitAnimator = $J.load('net.sf.freecol.client.gui.mapviewer.UnitAnimator');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Map$Position = $J.load('net.sf.freecol.common.model.Map$Position');
  Turn = $J.load('net.sf.freecol.common.model.Turn');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  EuropeanAIPlayer = $J.load('net.sf.freecol.server.ai.EuropeanAIPlayer');
  DefensiveMap = $J.load('net.sf.freecol.server.ai.military.DefensiveMap');
});
