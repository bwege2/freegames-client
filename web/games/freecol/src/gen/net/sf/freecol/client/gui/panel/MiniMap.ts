// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/MiniMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, LockSupport, Logger, Thread } from '../../../../../../../jre/index.ts';
import { JPanel } from '../../../../../../javax/swing/JPanel.ts';

let BasicStroke, Color, Dimension, Point, RenderingHints, Transparency, AffineTransform, GeneralPath, ClientOptions, ImageLibrary, Utils;

/**
 * This component draws a small version of the map.  It allows us to
 * see a larger part of the map and to relocate the viewport by
 * clicking on it.  Pity its not a FreeColClientHolder.
 */
export class MiniMap extends JPanel {
  static logger: Logger = null;
  static readonly MAX_TILE_SIZE: number = 24;
  static readonly MIN_TILE_SIZE: number = 4;
  static readonly SCALE_STEP: number = 4;
  freeColClient: FreeColClient = null;
  /**
   * tileSize is the size (in pixels) that each tile will take up on
   * the mini map
   */
  tileSize: number = 0;
  /**
   * An image to contain the painted minimap. This is necessary in order to
   * reduce rendering time when scrolling or animating.
   */
  prerenderedMinimap: MiniMap$PrerenderedMinimap = null;
  dirty: boolean = false;
  minimapPainterThread: MiniMap$MinimapPainterThread = null;
  /**
   * The constructor that will initialize this component.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _MiniMap(freeColClient: FreeColClient): this {
    this._JPanel$();
    this.prerenderedMinimap = null;
    this.dirty = true;
    this.minimapPainterThread = new MiniMap$MinimapPainterThread().$o(this)._MiniMap$MinimapPainterThread();
    this.freeColClient = freeColClient;
    this.setLayout(null);
    this.tileSize = Math.imul(4, freeColClient.getClientOptions().getInteger(ClientOptions.DEFAULT_ZOOM_LEVEL));
    this.addMouseListener(this);
    this.addMouseMotionListener(this);
    this.minimapPainterThread.start();
    this.minimapPainterThread.setPriority((5 - 1) | 0);
    this.setOpaque(false);
    return this;
  }
  /**
   * Internal GUI accessor.
   *
   * @return The {@code GUI}.
   */
  getGUI(): GUI {
    return this.freeColClient.getGUI();
  }
  /**
   * Internal game accessor.
   *
   * @return The {@code Game}.
   */
  getGame(): Game {
    return this.freeColClient.getGame();
  }
  /**
   * Internal Map accessor.
   *
   * @return The {@code Map}.
   */
  getMap(): Map_ {
    let game = this.getGame();
    return (game == null) ? null : game.getMap();
  }
  /**
   * Set the DEFAULT_ZOOM_LEVEL option on the basis of a tile size.
   *
   * @param tileSize The tile size to check.
   */
  setZoomOption(tileSize: number): void {
    let zoom = $J.idiv(tileSize, 4);
    this.freeColClient.getClientOptions().setInteger(ClientOptions.DEFAULT_ZOOM_LEVEL, zoom);
  }
  /**
   * Set the map focus from a mouse click location.
   *
   * @param e The {@code MouseEvent} containing the location.
   */
  setFocus(e: MouseEvent): void {
    if (!e.getComponent().isEnabled()) {
      return;
    }
    let map = this.getMap();
    if (map == null) {
      return;
    }
    let x = e.getX();
    let y = e.getY();
    let size = this.getSize$();
    let focusPoint = this.getGUI().getFocusMapPoint();
    let mapTileSize = this.getGUI().getScaledImageLibrary().scale$Dimension(ImageLibrary.TILE_SIZE);
    let mapPointX = (focusPoint.x_ + $J.idiv((Math.imul(mapTileSize.width_, ((x - $J.idiv(size.width_, 2)) | 0))), this.tileSize)) | 0;
    let mapPointY = (focusPoint.y_ + $J.idiv((Math.imul(mapTileSize.height_, ((y - $J.idiv(size.height_, 2)) | 0))), ($J.idiv(this.tileSize, 2)))) | 0;
    this.getGUI().setFocusMapPoint(new Point()._Point$int$int(mapPointX, mapPointY));
  }
  recreateBufferImage(): void {
    let map = this.getMap();
    if (map == null) {
      this.prerenderedMinimap = null;
      return;
    }
    let theTileSize = this.tileSize;
    let size = new Dimension()._Dimension$int$int((Math.imul(theTileSize, map.getWidth()) + $J.idiv(theTileSize, 2)) | 0, ($J.idiv(Math.imul(theTileSize, map.getHeight()), 2) + $J.idiv(theTileSize, 4)) | 0);
    let nextPaintedMinimapImage = Utils.getGoodGraphicsDevice().getDefaultConfiguration().createCompatibleImage$int$int$int(size.width_, size.height_, Transparency.OPAQUE);
    let g2d = nextPaintedMinimapImage.createGraphics();
    this.paintEntireMinimap(g2d, theTileSize, size);
    g2d.dispose();
    this.prerenderedMinimap = new MiniMap$PrerenderedMinimap()._MiniMap$PrerenderedMinimap(nextPaintedMinimapImage, theTileSize);
  }
  /**
   * Updates the cached minimap image.
   */
  updateCachedMinimap(): void {
    this.dirty = true;
    LockSupport.unpark(this.minimapPainterThread);
  }
  /**
   * Zooms in the mini map.
   */
  zoomIn(): void {
    this.tileSize = Math.min((this.tileSize + MiniMap.SCALE_STEP) | 0, MiniMap.MAX_TILE_SIZE);
    this.setZoomOption(this.tileSize);
    this.updateCachedMinimap();
  }
  /**
   * Zooms out the mini map.
   */
  zoomOut(): void {
    this.tileSize = Math.max((this.tileSize - MiniMap.SCALE_STEP) | 0, MiniMap.MIN_TILE_SIZE);
    this.setZoomOption(this.tileSize);
    this.updateCachedMinimap();
  }
  /**
   * Return true if tile size can be decreased.
   *
   * @return a {@code boolean} value
   */
  canZoomIn(): boolean {
    return this.tileSize < MiniMap.MAX_TILE_SIZE && this.getMap() != null;
  }
  /**
   * Return true if tile size can be increased.
   *
   * @return a {@code boolean} value
   */
  canZoomOut(): boolean {
    return this.tileSize > MiniMap.MIN_TILE_SIZE && this.getMap() != null;
  }
  /**
   * Set tile size to the given value, or the minimum or maximum
   * bound of the tile size.
   *
   * FIXME: Public for MapEditorController.createMiniMapThumbnail.
   *
   * @param size an {@code int} value
   */
  setTileSize(size: number): void {
    this.tileSize = Math.max(Math.min(size, MiniMap.MAX_TILE_SIZE), MiniMap.MIN_TILE_SIZE);
    this.setZoomOption(this.tileSize);
    this.repaint$();
  }
  /**
   * Paints a representation of the mapboard onto this component.
   *
   * FIXME: Public for MapEditorController.createMiniMapThumbnail.
   *
   * @param graphics The {@code Graphics} context within which to draw.
   */
  paintMap(g2d: Graphics2D): void {
    if (this.getMap() == null) {
      return;
    }
    let focusPoint = this.getGUI().getFocusMapPoint();
    if (focusPoint == null) {
      return;
    }
    let size = this.getSize$();
    g2d.setColor(ImageLibrary.getMinimapBackgroundColor());
    g2d.fillRect(0, 0, size.width_, size.height_);
    let thePrerenderedMinimap = this.prerenderedMinimap;
    if (thePrerenderedMinimap == null) {
      return;
    }
    let theTileSize = thePrerenderedMinimap.tileSize;
    let mapTileSize = this.getGUI().getScaledImageLibrary().scale$Dimension(ImageLibrary.TILE_SIZE);
    let x = ($J.idiv(Math.imul(-focusPoint.x_, theTileSize), mapTileSize.width_) + $J.idiv(size.width_, 2)) | 0;
    let y = ($J.idiv(Math.imul(-focusPoint.y_, ($J.idiv(theTileSize, 2))), mapTileSize.height_) + $J.idiv(size.height_, 2)) | 0;
    g2d.drawImage$Image$int$int$ImageObserver(thePrerenderedMinimap.paintedMinimapImage, x, y, null);
    this.paintMarkerForVisibleAreaOnMainMap(g2d, size, theTileSize, mapTileSize);
  }
  paintMarkerForVisibleAreaOnMainMap(g2d: Graphics2D, size: Dimension, tileSize: number, mapTileSize: Dimension): void {
    let actualMapViewDimension = this.getGUI().getMapViewDimension();
    if (actualMapViewDimension == null) {
      return;
    }
    let whiteRectangleWidth = Math.imul((($J.idiv(actualMapViewDimension.width_, mapTileSize.width_) + 1) | 0), tileSize);
    let whiteRectangleHeight = $J.idiv(Math.imul((($J.idiv(actualMapViewDimension.height_, mapTileSize.height_) + 1) | 0), tileSize), 2);
    g2d.setColor(ImageLibrary.getMinimapBorderColor());
    g2d.drawRect(($J.idiv(size.width_, 2) - $J.idiv(whiteRectangleWidth, 2)) | 0, ($J.idiv(size.height_, 2) - $J.idiv(whiteRectangleHeight, 2)) | 0, whiteRectangleWidth, whiteRectangleHeight);
  }
  /**
   * Paints a representation of the mapboard onto this component.
   *
   * FIXME: Public for MapEditorController.createMiniMapThumbnail.
   *
   * @param graphics The {@code Graphics} context within which to draw.
   */
  paintEntireMinimap(graphics: Graphics, tileSize: number, size: Dimension): void {
    let g = graphics;
    g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
    let minimapWidth = size.width_;
    let minimapHeight = size.height_;
    g.setColor(ImageLibrary.getMinimapBackgroundColor());
    g.fillRect(0, 0, minimapWidth, minimapHeight);
    let map = this.getMap();
    let tileWidth = tileSize;
    let tileHeight = $J.idiv(tileSize, 2);
    let halfWidth = $J.idiv(tileSize, 2);
    let halfHeight = $J.idiv(tileSize, 4);
    let tilePath = new GeneralPath()._GeneralPath$();
    tilePath.moveTo$float$float(Math.fround(halfWidth), 0);
    tilePath.lineTo$float$float(Math.fround(tileWidth), Math.fround(halfHeight));
    tilePath.lineTo$float$float(Math.fround(halfWidth), Math.fround(tileHeight));
    tilePath.lineTo$float$float(0, Math.fround(halfHeight));
    tilePath.closePath();
    let settlementPath = new GeneralPath()._GeneralPath$Shape(tilePath);
    settlementPath.transform(AffineTransform.getScaleInstance(0.7, 0.7));
    settlementPath.transform(AffineTransform.getTranslateInstance(0.15 * tileWidth, 0.15 * tileHeight));
    let unitPath = new GeneralPath()._GeneralPath$Shape(tilePath);
    unitPath.transform(AffineTransform.getScaleInstance(0.5, 0.5));
    unitPath.transform(AffineTransform.getTranslateInstance(0.25 * tileWidth, 0.25 * tileHeight));
    let paintFull = new GeneralPath()._GeneralPath$Shape(tilePath);
    paintFull.transform(AffineTransform.getScaleInstance(1, 1));
    g.setStroke(new BasicStroke()._BasicStroke$float(1));
    let clientOptions = this.freeColClient.getClientOptions();
    let subMap = map.subMap(0, 0, map.getWidth(), map.getHeight());
    let firstTile = subMap.get(0);
    MiniMap.paintEachTile(g, firstTile, tileSize, subMap, (tileG2d, tile) => {
      if (tile.isExplored()) {
        if (clientOptions.getBoolean(ClientOptions.MINIMAP_TOGGLE_BORDERS)) {
          g.setColor(ImageLibrary.getMinimapPoliticsColor(tile.getType()));
          g.fill(tilePath);
          if (tile.getOwner() != null) {
            let nationOwner = tile.getOwner().getNationColor();
            let colorTransparent = new Color()._Color$int$int$int$int(nationOwner.getRed(), nationOwner.getGreen(), nationOwner.getBlue(), 100);
            g.setColor(colorTransparent);
            g.fill(paintFull);
          }
        } else {
          g.setColor(ImageLibrary.getMinimapEconomicColor(tile.getType()));
          g.fill(tilePath);
        }
        if (!tile.hasSettlement()) {
          let unit = tile.getFirstUnit();
          if (unit != null) {
            g.setColor(Color.BLACK);
            g.draw(unitPath);
            g.setColor(unit.getOwner().getNationColor());
            g.fill(unitPath);
          }
        } else {
          g.setColor(Color.BLACK);
          g.draw(settlementPath);
          g.setColor(tile.getSettlement().getOwner().getNationColor());
          g.fill(settlementPath);
        }
        if (!this.freeColClient.isMapEditor() && this.freeColClient.getMyPlayer() != null && !this.freeColClient.getMyPlayer().canSee(tile) && clientOptions.getBoolean(ClientOptions.MINIMAP_TOGGLE_FOG_OF_WAR)) {
          let blackTransparent = new Color()._Color$int$int$int$int(0, 0, 0, 100);
          g.setColor(blackTransparent);
          g.fill(paintFull);
        }
      }
    });
  }
  static paintEachTile(g2d: Graphics2D, firstTile: Tile, tileSize: number, tiles: List<Tile>, c: MiniMap$TileRenderingCallback): void {
    if (tiles.isEmpty()) {
      return;
    }
    let x0 = firstTile.getX();
    let y0 = firstTile.getY();
    let width = tileSize;
    let halfWidth = $J.idiv(tileSize, 2);
    let halfHeight = $J.idiv(tileSize, 4);
    let xt0 = 0;
    let yt0 = 0;
    for (const $it0 = tiles.iterator(); $it0.hasNext(); ) {
      let t = $it0.next();
      let x = t.getX();
      let y = t.getY();
      let xt = (Math.imul(((x - x0) | 0), width) + Math.imul((y & 1), halfWidth)) | 0;
      let yt = Math.imul(((y - y0) | 0), halfHeight);
      g2d.translate$int$int((xt - xt0) | 0, (yt - yt0) | 0);
      xt0 = xt;
      yt0 = yt;
      $J.fn(c, 'render')(g2d, t);
    }
    g2d.translate$int$int(-xt0, -yt0);
  }
  /**
   * {@inheritDoc}
   */
  mouseClicked(e: MouseEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  mousePressed(e: MouseEvent): void {
    this.setFocus(e);
  }
  /**
   * {@inheritDoc}
   */
  mouseReleased(e: MouseEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  mouseEntered(e: MouseEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  mouseExited(e: MouseEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  mouseDragged(e: MouseEvent): void {
    this.setFocus(e);
  }
  /**
   * {@inheritDoc}
   */
  mouseMoved(e: MouseEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(graphics: Graphics): void {
    if (this.getMap() == null) {
      return;
    }
    graphics.drawImage$Image$int$int$ImageObserver(ImageLibrary.getMiniMapBackground(), 0, 0, null);
    this.paintMap(graphics);
  }
  static $clinit() {
    MiniMap.logger = Logger.getLogger($J.cls(MiniMap).getName());
  }
}

/**
 * A callback for rendering a single tile.
 */
export class MiniMap$TileRenderingCallback {
}

export class MiniMap$PrerenderedMinimap extends JObject {
  /**
   * An image to contain the painted minimap. This is necessary in order to
   * reduce rendering time when scrolling or animating.
   */
  paintedMinimapImage: BufferedImage = null;
  tileSize: number = 0;
  _MiniMap$PrerenderedMinimap(paintedMinimapImage: BufferedImage, tileSize: number): this {
    this.paintedMinimapImage = paintedMinimapImage;
    this.tileSize = tileSize;
    return this;
  }
}

export class MiniMap$MinimapPainterThread extends Thread {
  _MiniMap$MinimapPainterThread(): this {
    this._Thread();
    return this;
  }
  run(): void {
    while (true) {
      this.$outer.recreateBufferImage();
      this.$outer.dirty = false;
      while (!this.$outer.dirty) {
        LockSupport.park();
      }
    }
  }
}

$J.define(MiniMap, 'net.sf.freecol.client.gui.panel.MiniMap', { kind: 'class', ifaces: ['javax.swing.event.MouseInputListener'], sup: 'javax.swing.JPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_MiniMap' }, returns: { 'getMap': 'net.sf.freecol.common.model.Map', 'getGame': 'net.sf.freecol.common.model.Game', 'getGUI': 'net.sf.freecol.client.gui.GUI' }, clinit: true, lazy: ['logger'] });
$J.define(MiniMap$TileRenderingCallback, 'net.sf.freecol.client.gui.panel.MiniMap$TileRenderingCallback', { kind: 'interface' });
$J.define(MiniMap$PrerenderedMinimap, 'net.sf.freecol.client.gui.panel.MiniMap$PrerenderedMinimap', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.image.BufferedImage,int': '_MiniMap$PrerenderedMinimap' } });
$J.define(MiniMap$MinimapPainterThread, 'net.sf.freecol.client.gui.panel.MiniMap$MinimapPainterThread', { kind: 'class', sup: 'java.lang.Thread', ctors: { '': '_MiniMap$MinimapPainterThread' }, inner: true });
$J.module(() => {
  BasicStroke = $J.load('java.awt.BasicStroke');
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  RenderingHints = $J.load('java.awt.RenderingHints');
  Transparency = $J.load('java.awt.Transparency');
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
  GeneralPath = $J.load('java.awt.geom.GeneralPath');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
