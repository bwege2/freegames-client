// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/TileViewer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, Collections, Collectors, JString, Logger } from '../../../../../../../jre/index.ts';
import { FreeColClientHolder } from '../../control/FreeColClientHolder.ts';

let Color, RescaleOp, ClientOptions, ImageLibrary, RoadPainter, DebugUtils, FreeColDebugger, FreeColDebugger$DebugMode, Messages, Ability, Colony, Direction, IndianSettlement, LostCityRumour, Resource, Tile, TileImprovement, UnitLocation$NoAddReason, ImageUtils, StringUtils;

/**
 * TileViewer is a private helper class of MapViewer and SwingGUI.
 *
 * This class is responsible for drawing map tiles
 * for MapViewer and some GUI-panels.
 *
 * It needs to be a FreeColClientHolder so it can check the client options.
 *
 * create*() routines return a newly created BufferedImage, drawn with
 * a Graphics2D object that is created and disposed within.
 * display*() routines use a Graphics2D object passed as a parameter to
 * draw to, which is neither created or disposed by the routine, just used.
 */
export class TileViewer extends FreeColClientHolder {
  static logger: Logger = null;
  /**
   * Standard rescaling used in displayTile.
   */
  static standardRescale: RescaleOp = null;
  /**
   * The offset to paint the occupation indicator (in pixels).
   */
  static readonly STATE_OFFSET_X: number = 25;
  /**
   * The offset to paint the occupation indicator (in pixels).
   */
  static readonly STATE_OFFSET_Y: number = 10;
  /**
   * The image library derived from the parent map viewer.
   * Beware that while it is final, its scale can change and this
   * should be handled by calling updateScaledVariables().
   */
  lib: ImageLibrary = null;
  /**
   * Scaled road painter.
   */
  rp: RoadPainter = null;
  /**
   * Helper variables for displaying tiles.
   */
  tileHeight: number = 0;
  /**
   * Helper variables for displaying tiles.
   */
  tileWidth: number = 0;
  /**
   * Helper variables for displaying tiles.
   */
  halfHeight: number = 0;
  /**
   * Font for tile text.
   */
  tinyFont: Font = null;
  /**
   * Fonts for the colony population chip.
   */
  emphFont: Font = null;
  /**
   * Fonts for the colony population chip.
   */
  normFont: Font = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param lib The (appropriately scaled) {@code ImageLibrary} to use.
   */
  _TileViewer(freeColClient: FreeColClient, lib: ImageLibrary): this {
    this._FreeColClientHolder(freeColClient);
    this.lib = lib;
    this.updateScaledVariables();
    return this;
  }
  /**
   * Update all the variables dependent on the library scale factor.
   */
  updateScaledVariables(): void {
    let tileSize = this.lib.getTileSize();
    this.rp = new RoadPainter()._RoadPainter(tileSize);
    this.tileHeight = tileSize.height_;
    this.tileWidth = tileSize.width_;
    this.halfHeight = $J.idiv(this.tileHeight, 2);
    this.tinyFont = this.lib.getScaledFont('normal-plain-tiny', null);
    this.emphFont = this.lib.getScaledFont('simple-bold+italic-smaller', null);
    this.normFont = this.lib.getScaledFont('simple-bold-tiny', null);
  }
  /**
   * Create a {@code BufferedImage} and draw a {@code Tile} on it.
   * Draws the terrain and improvements.
   *
   * Public for {@link GUI#createTileImageWithBeachBorderAndItems}.
   *
   * @param tile The Tile to draw.
   * @return The image.
   */
  createTileImageWithBeachBorderAndItems(tile: Tile): BufferedImage {
    if (!tile.isExplored()) {
      return this.lib.getScaledTerrainImage(null, tile.getX(), tile.getY());
    }
    let tileType = tile.getType();
    let overlayImage = this.lib.getScaledOverlayImage(tile);
    let compoundHeight = (overlayImage != null) ? overlayImage.getHeight() : (tileType.isForested()) ? this.lib.getForestedTileSize().height_ : this.tileHeight;
    let image = ImageUtils.createBufferedImage$int$int(this.tileWidth, compoundHeight);
    let g2d = image.createGraphics();
    g2d.translate$int$int(0, (compoundHeight - this.tileHeight) | 0);
    this.displayAnimatedBaseTiles(g2d, tile, false);
    this.displayTileWithBeach(g2d, tile);
    this.displayTileItems(g2d, tile, null, overlayImage);
    g2d.dispose();
    return image;
  }
  /**
   * Create a {@code BufferedImage} and draw a {@code Tile} on it.
   *
   * Public for {@link GUI#createTileImage}.
   *
   * @param tile The {@code Tile} to draw.
   * @param player The {@code Player} to draw for.
   * @return The image.
   */
  createTileImage(tile: Tile, player: Player): BufferedImage {
    let tileType = tile.getType();
    let overlayImage = this.lib.getScaledOverlayImage(tile);
    let compoundHeight = (overlayImage != null) ? overlayImage.getHeight() : (tileType.isForested()) ? this.lib.getForestedTileSize().height_ : this.tileHeight;
    let image = ImageUtils.createBufferedImage$int$int(this.tileWidth, compoundHeight);
    let g2d = image.createGraphics();
    g2d.translate$int$int(0, (compoundHeight - this.tileHeight) | 0);
    this.displayTile(g2d, tile, player, overlayImage);
    g2d.dispose();
    return image;
  }
  /**
   * Create a {@code BufferedImage} and draw a {@code Tile} on it.
   * The visualization of the {@code Tile} also includes information
   * from the corresponding {@code ColonyTile} of the given
   * {@code Colony}.
   *
   * Public for {@link GUI#createColonyTileImage}.
   *
   * @param tile The {@code Tile} to draw.
   * @param colony The {@code Colony} to create the visualization
   *      of the {@code Tile} for. This object is also used to
   *      get the {@code ColonyTile} for the given {@code Tile}.
   * @return The image.
   */
  createColonyTileImage(tile: Tile, colony: Colony): BufferedImage {
    let tileType = tile.getType();
    let overlayImage = this.lib.getScaledOverlayImage(tile);
    let compoundHeight = (overlayImage != null) ? overlayImage.getHeight() : ((tileType.isForested()) ? this.lib.getForestedTileSize().height_ : this.tileHeight);
    let image = ImageUtils.createBufferedImage$int$int(this.tileWidth, compoundHeight);
    let g2d = image.createGraphics();
    g2d.translate$int$int(0, (compoundHeight - this.tileHeight) | 0);
    this.displayColonyTile(g2d, tile, colony, overlayImage);
    g2d.dispose();
    return image;
  }
  /**
   * Displays the 3x3 tiles for the TilesPanel in ColonyPanel.
   *
   * Public for {@link GUI#displayColonyTiles}.
   *
   * @param g2d The {@code Graphics2D} object on which to draw
   *      the {@code Tile}.
   * @param tiles The array containing the {@code Tile} objects to draw.
   * @param colony The {@code Colony} to create the visualization
   *      of the {@code Tile} objects for.
   */
  displayColonyTiles(g2d: Graphics2D, tiles: Tile[][], colony: Colony): void {
    for (let x = 0; x < tiles.length; x++) {
      for (let y = 0; y < tiles[x].length; y++) {
        if (tiles[x][y] != null) {
          let xx = $J.idiv((Math.imul(((tiles.length - 1 - x + y) | 0), this.tileWidth)), 2);
          let yy = $J.idiv((Math.imul(((x + y) | 0), this.tileHeight)), 2);
          g2d.translate$int$int(xx, yy);
          let overlayImage = this.lib.getScaledOverlayImage(tiles[x][y]);
          this.displayColonyTile(g2d, tiles[x][y], colony, overlayImage);
          g2d.translate$int$int(-xx, -yy);
        }
      }
    }
  }
  /**
   * Displays the given colony tile.
   *
   * The visualization of the {@code Tile} also includes information
   * from the corresponding {@code ColonyTile} from the given
   * {@code Colony}.
   *
   * @param g2d The {@code Graphics2D} on which to draw.
   * @param tile The {@code Tile} to draw.
   * @param colony The {@code Colony} to create the visualization
   *      of the {@code Tile} for. This object is also used to
   *      get the {@code ColonyTile} for the given {@code Tile}.
   * @param overlayImage The BufferedImage of the tile overlay.
   */
  displayColonyTile(g2d: Graphics2D, tile: Tile, colony: Colony, overlayImage: BufferedImage): void {
    this.displayTile(g2d, tile, colony.getOwner(), overlayImage);
    let colonyTile = colony.getColonyTile(tile);
    if (colonyTile == null) {
      return;
    }
    switch (colonyTile.getNoWorkReason()) {
      case UnitLocation$NoAddReason.NONE:
      case UnitLocation$NoAddReason.COLONY_CENTER:
      case UnitLocation$NoAddReason.CLAIM_REQUIRED:
        break;
      default:
        g2d.drawImage$Image$int$int$ImageObserver(this.lib.getScaledImage(ImageLibrary.TILE_TAKEN), 0, 0, null);
    }
    let price = colony.getOwner().getLandPrice(tile);
    if (price > 0 && !tile.hasSettlement()) {
      this.displayCenteredImage$Graphics2D$BufferedImage(g2d, this.lib.getScaledImage(ImageLibrary.TILE_OWNED_BY_INDIANS));
    }
    let unit = colonyTile.getOccupyingUnit();
    if (unit != null) {
      let image = this.lib.getSmallerUnitImage(unit);
      g2d.drawImage$Image$int$int$ImageObserver(image, ($J.idiv(this.tileWidth, 4) - $J.idiv(image.getWidth(), 2)) | 0, (this.halfHeight - $J.idiv(image.getHeight(), 2)) | 0, null);
      let owner = this.getMyPlayer();
      let text = Messages.message$StringTemplate(unit.getOccupationLabel(owner, false));
      g2d.drawImage$Image$int$int$ImageObserver(this.lib.getOccupationIndicatorChip(g2d, unit, text), this.lib.scaleInt(TileViewer.STATE_OFFSET_X), 0, null);
    }
  }
  /**
   * Displays the given {@code Tile}.
   *
   * @param g2d The {@code Graphics2D} on which to draw the tile.
   * @param tile The {@code Tile} to draw.
   * @param player The {@code Player} to draw for.
   * @param overlayImage The BufferedImage for the tile overlay.
   */
  displayTile(g2d: Graphics2D, tile: Tile, player: Player, overlayImage: BufferedImage): void {
    this.displayAnimatedBaseTiles(g2d, tile, false);
    this.displayTileWithBeach(g2d, tile);
    if (!tile.isExplored()) {
      return;
    }
    if (!this.getClientOptions().isRiverAnimationEnabled() || !tile.hasRiver() && !this.hasRiverDelta(tile)) {
      this.drawBaseTileTransitions(g2d, tile);
    }
    let rop = (player.canSee(tile)) ? null : TileViewer.standardRescale;
    this.displayTileItems(g2d, tile, rop, overlayImage);
    this.displaySettlementWithChipsOrPopulationNumber(g2d, tile, false, rop);
    this.displayOptionalTileText(g2d, tile);
  }
  /**
   * Centers the given Image on the tile.
   *
   * @param g2d The {@code Graphics2D} on which to draw.
   * @param image The {@code BufferedImage} to draw.
   */
  displayCenteredImage$Graphics2D$BufferedImage(g2d: Graphics2D, image: BufferedImage): void {
    this.displayCenteredImage$Graphics2D$BufferedImage$RescaleOp(g2d, image, null);
  }
  /**
   * Centers the given Image on the tile.
   *
   * @param g2d The {@code Graphics2D} on which to draw.
   * @param image The {@code BufferedImage} to draw.
   * @param rop An optional {@code RescaleOp} for fog of war.
   */
  displayCenteredImage$Graphics2D$BufferedImage$RescaleOp(g2d: Graphics2D, image: BufferedImage, rop: RescaleOp): void {
    g2d.drawImage$BufferedImage$BufferedImageOp$int$int(image, rop, $J.idiv(((this.tileWidth - image.getWidth()) | 0), 2), $J.idiv(((this.tileHeight - image.getHeight()) | 0), 2));
  }
  /**
   * Centers the given Image on the tile, ensuring it is not drawing
   * over tiles south of it.
   *
   * @param g2d The {@code Graphics2D} on which to draw.
   * @param image The {@code BufferedImage} to draw.
   * @param rop An optional {@code RescaleOp} for fog of war.
   */
  displayLargeCenteredImage(g2d: Graphics2D, image: BufferedImage, rop: RescaleOp): void {
    let x = $J.idiv(((this.tileWidth - image.getWidth()) | 0), 2);
    let y = (this.tileHeight - image.getHeight()) | 0;
    if (y > 0) {
      y = $J.idiv(y, 2);
    }
    g2d.drawImage$BufferedImage$BufferedImageOp$int$int(image, rop, x, y);
  }
  /**
   * Draw animated ocean.
   *
   * @param g2d The {@code Graphics2D} object on which to draw the tile.
   * @param tile The {@code Tile} to draw if it is ocean.
   * @param freezeAnimation The animation is paused if set to {@code true}.
   */
  displayAnimatedBaseTiles(g2d: Graphics2D, tile: Tile, freezeAnimation: boolean): void {
    let tileType = tile.getType();
    if (tileType == null) {
      return;
    }
    let ticks: number;
    if (freezeAnimation || !this.getClientOptions().isTerrainAnimationsEnabled()) {
      ticks = 0;
    } else {
      ticks = $J.ldiv($J.system_currentTimeMillis(), 125);
    }
    if (tileType.isWater()) {
      let directionsWithLand = this.allDirectionsWithLand(tile);
      if (directionsWithLand.isEmpty()) {
        g2d.drawImage$Image$int$int$ImageObserver(this.lib.getAnimatedScaledTerrainImage(tileType, ticks), 0, 0, null);
      } else {
        g2d.drawImage$Image$int$int$ImageObserver(this.lib.getAnimatedScaledWaterAndBeachTerrainImage(tileType, directionsWithLand, ticks), 0, 0, null);
      }
      if (this.getClientOptions().isRiverAnimationEnabled() && this.hasRiverDelta(tile)) {
        this.drawBaseTileTransitions(g2d, tile);
        this.drawRiverMouth(g2d, tile, ticks);
      }
    } else if (this.getClientOptions().isRiverAnimationEnabled() && tile.hasRiver()) {
      g2d.drawImage$Image$int$int$ImageObserver(this.lib.getScaledTerrainImage(tileType, tile.getX(), tile.getY()), 0, 0, null);
      this.drawBaseTileTransitions(g2d, tile);
      let img = this.lib.getAnimatedScaledRiverTerrainImage(tile, ticks);
      if (img != null) {
        g2d.drawImage$Image$int$int$ImageObserver(img, 0, 0, null);
      }
    }
  }
  allDirectionsWithLand(tile: Tile): List<Direction> {
    let directionsWithLand = Arrays.asList(...Direction.values()).stream().filter((d) => {
      let neighbour = tile.getNeighbourOrNull(d);
      return neighbour != null && neighbour.isLand();
    }).collect(Collectors.toList());
    return directionsWithLand;
  }
  /**
   * Displays the given Tile onto the given Graphics2D object at the
   * location specified by the coordinates. Only base terrain will be drawn.
   *
   * @param g2d The {@code Graphics2D} object on which to draw the tile.
   * @param tile The {@code Tile} to draw.
   */
  displayTileWithBeach(g2d: Graphics2D, tile: Tile): void {
    let tileType = tile.getType();
    let x = tile.getX();
    let y = tile.getY();
    let outForBaseTileAnimation = (tileType != null) && (tileType.isWater() || this.getClientOptions().isRiverAnimationEnabled() && tile.hasRiver());
    if (!outForBaseTileAnimation) {
      g2d.drawImage$Image$int$int$ImageObserver(this.lib.getScaledTerrainImage(tileType, x, y), 0, 0, null);
    }
    if (!tile.isExplored()) {
      return;
    }
  }
  drawBaseTileTransitions(g2d: Graphics2D, tile: Tile): void {
    if (this.getClientOptions().getRange(ClientOptions.GRAPHICS_QUALITY) === ClientOptions.GRAPHICS_QUALITY_LOWEST) {
      return;
    }
    this.drawBaseTileTransitionAtDirection(g2d, tile, Direction.NE);
    this.drawBaseTileTransitionAtDirection(g2d, tile, Direction.SW);
    this.drawBaseTileTransitionAtDirection(g2d, tile, Direction.NW);
    this.drawBaseTileTransitionAtDirection(g2d, tile, Direction.SE);
    if (!this.getClientOptions().isRiverAnimationEnabled()) {
      this.drawRiverMouth(g2d, tile, 0);
    }
  }
  drawBaseTileTransitionAtDirection(g2d: Graphics2D, tile: Tile, direction: Direction): void {
    let useNiceCorners = this.getClientOptions().getRange(ClientOptions.GRAPHICS_QUALITY) >= ClientOptions.GRAPHICS_QUALITY_NORMAL;
    let useVariations = this.getClientOptions().getRange(ClientOptions.GRAPHICS_QUALITY) >= ClientOptions.GRAPHICS_QUALITY_HIGH;
    let transitionImage = this.lib.getBaseTileTransitionImage(tile, direction, useNiceCorners, useVariations);
    if (transitionImage != null) {
      g2d.drawImage$Image$int$int$ImageObserver(transitionImage, 0, 0, null);
    }
  }
  hasRiverDelta(tile: Tile): boolean {
    for (const $it0 = Direction.longSides.iterator(); $it0.hasNext(); ) {
      let direction = $it0.next();
      let borderingTile = tile.getNeighbourOrNull(direction);
      if (borderingTile == null || tile.isLand() || !borderingTile.isLand() || !tile.isExplored()) {
        continue;
      }
      let river = borderingTile.getRiver();
      if (river == null) {
        continue;
      }
      let reverseDirection = direction.getReverseDirection();
      let magnitude = river.getRiverConnection(reverseDirection);
      if (magnitude <= 0) {
        continue;
      }
      return true;
    }
    return false;
  }
  drawRiverMouth(g2d: Graphics2D, tile: Tile, ticks: number): void {
    for (const $it1 = Direction.longSides.iterator(); $it1.hasNext(); ) {
      let direction = $it1.next();
      let borderingTile = tile.getNeighbourOrNull(direction);
      if (borderingTile == null || tile.isLand() || !borderingTile.isLand() || !tile.isExplored()) {
        continue;
      }
      let river = borderingTile.getRiver();
      if (river == null) {
        continue;
      }
      let reverseDirection = direction.getReverseDirection();
      let magnitude = river.getRiverConnection(reverseDirection);
      if (magnitude <= 0) {
        continue;
      }
      let riverDelta = this.lib.getAnimatedScaledRiverDeltaTerrainImage(direction, ticks);
      g2d.drawImage$Image$int$int$ImageObserver(riverDelta, 0, 0, null);
    }
  }
  displayUnknownTileBorder(g2d: Graphics2D, tile: Tile): void {
    if (!tile.isExplored()) {
      return;
    }
    for (let direction of Direction.values()) {
      let borderingTile = tile.getNeighbourOrNull(direction);
      if (borderingTile != null && !borderingTile.isExplored()) {
        g2d.drawImage$Image$int$int$ImageObserver(this.lib.getBorderImage(null, direction, tile.getX(), tile.getY()), 0, 0, null);
      }
    }
  }
  /**
   * Displays the Tile text for a Tile.
   * Shows tile names, coordinates and colony values.
   *
   * @param g2d The {@code Graphics2D} object on which the text gets drawn.
   * @param tile The {@code Tile} to draw the text on.
   */
  displayOptionalTileText(g2d: Graphics2D, tile: Tile): void {
    if (this.tinyFont == null) {
      return;
    }
    let text = null;
    let op = this.getClientOptions().getInteger(ClientOptions.DISPLAY_TILE_TEXT);
    switch (op) {
      case ClientOptions.DISPLAY_TILE_TEXT_NAMES:
        text = Messages.getName$Named(tile);
        break;
      case ClientOptions.DISPLAY_TILE_TEXT_OWNERS:
        if (tile.getOwner() != null) {
          text = Messages.message$StringTemplate(tile.getOwner().getNationLabel());
        }
        break;
      case ClientOptions.DISPLAY_TILE_TEXT_REGIONS:
        if (tile.getRegion() != null) {
          if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS) && tile.getRegion().getName() == null) {
            text = tile.getRegion().getSuffix$();
          } else {
            text = Messages.message$StringTemplate(tile.getRegion().getLabel());
          }
        }
        break;
      case ClientOptions.DISPLAY_TILE_TEXT_EMPTY:
        break;
      default:
        TileViewer.logger.warning('displayTileText option ' + op + ' out of range');
        break;
    }
    let fm = g2d.getFontMetrics$();
    g2d.setColor(Color.BLACK);
    g2d.setFont(this.tinyFont);
    if (text != null) {
      let b = StringUtils.getBreakingPoint$String(text);
      if (b === -1) {
        g2d.drawString$String$int$int(text, $J.idiv(((this.tileWidth - fm.stringWidth(text)) | 0), 2), $J.idiv(((this.tileHeight - fm.getAscent()) | 0), 2));
      } else {
        g2d.drawString$String$int$int(text.substring(0, b), $J.idiv(((this.tileWidth - fm.stringWidth(text.substring(0, b))) | 0), 2), (this.halfHeight - $J.idiv((Math.imul(fm.getAscent(), 2)), 3)) | 0);
        g2d.drawString$String$int$int(text.substring((b + 1) | 0), $J.idiv(((this.tileWidth - fm.stringWidth(text.substring((b + 1) | 0))) | 0), 2), (this.halfHeight + $J.idiv((Math.imul(fm.getAscent(), 2)), 3)) | 0);
      }
    }
    if (FreeColDebugger.debugDisplayCoordinates()) {
      let posString = tile.getX() + ', ' + tile.getY();
      if (tile.getHighSeasCount() >= 0) {
        posString += '/' + String(tile.getHighSeasCount());
      }
      g2d.drawString$String$int$int(posString, $J.idiv(((this.tileWidth - fm.stringWidth(posString)) | 0), 2), $J.idiv(((this.tileHeight - fm.getAscent()) | 0), 2));
    }
    let value = DebugUtils.getColonyValue(tile);
    if (value != null) {
      g2d.drawString$String$int$int(value, $J.idiv(((this.tileWidth - fm.stringWidth(value)) | 0), 2), $J.idiv(((this.tileHeight - fm.getAscent()) | 0), 2));
    }
  }
  /**
   * Displays the given Tile onto the given Graphics2D object at the
   * location specified by the coordinates. Settlements and Lost
   * City Rumours will be shown.
   *
   * @param g2d The Graphics2D object on which to draw the Tile.
   * @param tile The Tile to draw.
   * @param withNumber Whether to display the number of units present.
   * @param rop An optional RescaleOp for fog of war.
   */
  displaySettlementWithChipsOrPopulationNumber(g2d: Graphics2D, tile: Tile, withNumber: boolean, rop: RescaleOp): void {
    let player = this.getMyPlayer();
    let settlement = tile.getSettlement();
    if (settlement == null) {
      return;
    }
    let sImage = this.lib.getScaledSettlementImage(settlement);
    this.displayLargeCenteredImage(g2d, sImage, rop);
    if (settlement instanceof Colony) {
      let colony = settlement;
      if (withNumber) {
        let font = (colony.getPreferredSizeChange() > 0) ? this.emphFont : this.normFont;
        if (font != null) {
          let populationString = String(colony.getApparentUnitCount());
          let colorString = 'color.map.productionBonus.' + colony.getProductionBonus();
          let stringImage = this.lib.getStringImage(g2d, populationString, ImageLibrary.getColor$String(colorString), font);
          this.displayCenteredImage$Graphics2D$BufferedImage$RescaleOp(g2d, stringImage, rop);
        }
      }
    } else if (settlement instanceof IndianSettlement) {
      let is$ = settlement;
      let chip: BufferedImage;
      let xOffset = Math.fround(this.lib.scaleInt(TileViewer.STATE_OFFSET_X));
      let yOffset = Math.fround(this.lib.scaleInt(TileViewer.STATE_OFFSET_Y));
      let colonyLabels = this.getClientOptions().getInteger(ClientOptions.DISPLAY_COLONY_LABELS);
      if (colonyLabels !== ClientOptions.COLONY_LABELS_MODERN) {
        chip = this.lib.getIndianSettlementChip(g2d, is$);
        let cWidth = chip.getWidth();
        g2d.drawImage$BufferedImage$BufferedImageOp$int$int(chip, rop, $J.d2i(xOffset), $J.d2i(yOffset));
        xOffset = Math.fround(xOffset + ((cWidth + 2) | 0));
        let missionary = is$.getMissionary();
        if (missionary != null) {
          let expert = missionary.hasAbility$String(Ability.EXPERT_MISSIONARY);
          g2d.drawImage$BufferedImage$BufferedImageOp$int$int(this.lib.getMissionChip(g2d, missionary.getOwner(), expert), rop, $J.d2i(xOffset), $J.d2i(yOffset));
          xOffset = Math.fround(xOffset + ((cWidth + 2) | 0));
        }
      }
      if ((chip = this.lib.getAlarmChip(g2d, is$, player)) != null) {
        g2d.drawImage$BufferedImage$BufferedImageOp$int$int(chip, rop, $J.d2i(xOffset), $J.d2i(yOffset));
      }
    } else {
      TileViewer.logger.warning('Bogus settlement: ' + $J.str(settlement));
    }
  }
  /**
   * Displays the given tile's items onto the given Graphics2D object.
   * Additions and improvements to Tile will be drawn.
   * Only works for explored tiles.
   *
   * @param g2d The Graphics2D object on which to draw the Tile.
   * @param tile The Tile to draw.
   * @param rop An optional RescaleOp for fog of war.
   * @param overlayImage The BufferedImage for the tile overlay.
   */
  displayTileItems(g2d: Graphics2D, tile: Tile, rop: RescaleOp, overlayImage: BufferedImage): void {
    let tileItems = new ArrayList(tile.getCompleteItems());
    Collections.sort(tileItems, (a, b) => {
      return $J.compareTo(a.getZIndex(), b.getZIndex());
    });
    let startIndex = 0;
    for (let index = startIndex; index < tileItems.size(); index++) {
      if (tileItems.get(index).getZIndex() < Tile.OVERLAY_ZINDEX) {
        this.displayTileItem(g2d, tile, rop, tileItems.get(index));
        startIndex = (index + 1) | 0;
      } else {
        startIndex = index;
        break;
      }
    }
    if (overlayImage != null) {
      g2d.drawImage$BufferedImage$BufferedImageOp$int$int(overlayImage, rop, 0, ((this.tileHeight - overlayImage.getHeight()) | 0));
    }
    for (let index = startIndex; index < tileItems.size(); index++) {
      if (tileItems.get(index).getZIndex() < Tile.FOREST_ZINDEX) {
        this.displayTileItem(g2d, tile, rop, tileItems.get(index));
        startIndex = (index + 1) | 0;
      } else {
        startIndex = index;
        break;
      }
    }
    if (tile.isForested()) {
      let forestImage = this.lib.getScaledForestImage$TileType$TileImprovementStyle(tile.getType(), tile.getRiverStyle());
      g2d.drawImage$BufferedImage$BufferedImageOp$int$int(forestImage, rop, 0, ((this.tileHeight - forestImage.getHeight()) | 0));
    } else if (this.getClientOptions().getRange(ClientOptions.GRAPHICS_QUALITY) >= ClientOptions.GRAPHICS_QUALITY_HIGH) {
      this.drawForestCornerImages(tile, g2d);
    }
    for (const $it2 = tileItems.subList(startIndex, tileItems.size()).iterator(); $it2.hasNext(); ) {
      let ti = $it2.next();
      this.displayTileItem(g2d, tile, rop, ti);
    }
  }
  drawForestCornerImages(tile: Tile, g1: Graphics2D): void {
    this.drawForestCornerImageFor(tile, g1, Direction.NW, Direction.NE, Direction.N);
    this.drawForestCornerImageFor(tile, g1, Direction.SW, Direction.SE, Direction.S);
    this.drawForestCornerImageFor(tile, g1, Direction.NE, Direction.SE, Direction.E);
    this.drawForestCornerImageFor(tile, g1, Direction.NW, Direction.SW, Direction.W);
  }
  drawForestCornerImageFor(tile: Tile, g1: Graphics2D, d1: Direction, d2: Direction, d3: Direction): void {
    if (tile.hasRiver()) {
      return;
    }
    let tile1 = tile.getNeighbourOrNull(d1);
    if (tile1 == null || !tile1.isForested()) {
      return;
    }
    let tile2 = tile.getNeighbourOrNull(d2);
    if (this.hasSameForestedTileType(tile1, tile2)) {
      let forestCornerImage = this.lib.getForestCornerImage(tile1.getType(), d3);
      if (forestCornerImage != null) {
        g1.drawImage$Image$int$int$ImageObserver(forestCornerImage, 0, ((this.tileHeight - forestCornerImage.getHeight()) | 0), null);
      }
    }
  }
  hasSameForestedTileType(t1: Tile, t2: Tile): boolean {
    return t1 != null && t2 != null && t1.isForested() && t1.getType() === t2.getType();
  }
  /**
   * Draws the given TileItem on the given Tile.
   *
   * @param g2d The {@code Graphics} to draw to.
   * @param tile The {@code Tile} to draw from.
   * @param rop An optional RescaleOp for fog of war.
   * @param item The {@code TileItem} to draw.
   */
  displayTileItem(g2d: Graphics2D, tile: Tile, rop: RescaleOp, item: TileItem): void {
    if (item instanceof TileImprovement) {
      let ti = item;
      if (!ti.isComplete()) {
        return;
      }
      if (ti.isRoad()) {
        this.rp.displayRoad(g2d, tile, rop);
      } else if (ti.isRiver()) {
        if (this.getClientOptions().isRiverAnimationEnabled()) {
          return;
        }
        let img = this.lib.getAnimatedScaledRiverTerrainImage(tile, 0);
        if (img != null) {
          g2d.drawImage$BufferedImage$BufferedImageOp$int$int(img, rop, 0, 0);
        }
      } else {
        let img = this.lib.getTileImprovementImage(ti.getType().getId());
        if (img != null) {
          g2d.drawImage$BufferedImage$BufferedImageOp$int$int(img, rop, 0, 0);
        }
      }
    } else if (item instanceof LostCityRumour) {
      this.displayCenteredImage$Graphics2D$BufferedImage$RescaleOp(g2d, this.lib.getScaledImage(ImageLibrary.LOST_CITY_RUMOUR), rop);
    } else if (item instanceof Resource) {
      this.displayCenteredImage$Graphics2D$BufferedImage$RescaleOp(g2d, this.lib.getScaledResourceImage(item), rop);
    }
  }
  static $clinit() {
    TileViewer.logger = Logger.getLogger($J.cls(TileViewer).getName());
    TileViewer.standardRescale = new RescaleOp()._RescaleOp$floatArr$floatArr$RenderingHints([Math.fround(0.8), Math.fround(0.8), Math.fround(0.8), 1], [0, 0, 0, 0], null);
  }
}

$J.define(TileViewer, 'net.sf.freecol.client.gui.mapviewer.TileViewer', { kind: 'class', sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.ImageLibrary': '_TileViewer' }, meths: { 'displayCenteredImage(java.awt.Graphics2D,java.awt.image.BufferedImage,java.awt.image.RescaleOp)': 'displayCenteredImage$Graphics2D$BufferedImage$RescaleOp', 'displayCenteredImage(java.awt.Graphics2D,java.awt.image.BufferedImage)': 'displayCenteredImage$Graphics2D$BufferedImage' }, clinit: true, lazy: ['logger', 'standardRescale'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  RescaleOp = $J.load('java.awt.image.RescaleOp');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  RoadPainter = $J.load('net.sf.freecol.client.gui.mapviewer.RoadPainter');
  DebugUtils = $J.load('net.sf.freecol.common.debug.DebugUtils');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  LostCityRumour = $J.load('net.sf.freecol.common.model.LostCityRumour');
  Resource = $J.load('net.sf.freecol.common.model.Resource');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
