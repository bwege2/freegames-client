// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/images/BaseTileTransitionImageCreator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, JObject, JString, Random } from '../../../../../../../jre/index.ts';

let ImageLibrary, Direction, ImageCache, ImageUtils;

/**
 * Creates a transition between base tiles. For example, this transition will make the prairie graphics blend into the grassland graphics.
 */
export class BaseTileTransitionImageCreator extends JObject {
  lib: ImageLibrary = null;
  imageCache: ImageCache = null;
  _BaseTileTransitionImageCreator(lib: ImageLibrary, imageCache: ImageCache): this {
    this.lib = lib;
    this.imageCache = imageCache;
    return this;
  }
  /**
   * Returns a transparent image for making a transition between
   * the given tiles.
   *  
   * @param tile The tile that should get a transition.
   * @param direction The direction to get the bordering tile from.
   * @param useNiceCorners Determines if the corners of the base transitions
   *      should be rendered nicely (takes more time).
   * @param useVariations Uses variations of the transition.
   * @return The image, or {@code null} if there is no transition that
   *      should be drawn.
   */
  getBaseTileTransitionImage(tile: Tile, direction: Direction, useNiceCorners: boolean, useVariations: boolean): BufferedImage {
    let borderingTile = tile.getNeighbourOrNull(direction);
    let renderSpecialTransition = useNiceCorners && (direction === Direction.NW || direction === Direction.SE);
    if (borderingTile == null || !borderingTile.isExplored() || !tile.isExplored()) {
      return null;
    }
    if (tile.getType() === borderingTile.getType() && !renderSpecialTransition) {
      return null;
    }
    let terrainImageResource = this.getTerrainOrBeachImageResource(tile, borderingTile);
    if (terrainImageResource == null) {
      return null;
    }
    let tileImageResource = ImageCache.getImageResource(ImageLibrary.getTerrainImageKey(tile.getType()));
    if (tileImageResource == null) {
      return null;
    }
    if ($J.equals(terrainImageResource.getCachingKey(), tileImageResource.getCachingKey()) && !renderSpecialTransition) {
      return null;
    }
    let beachTransitionNe: boolean;
    let beachTransitionSw: boolean;
    if (renderSpecialTransition) {
      beachTransitionNe = this.shouldIncludeSpecialBeachTransitionInDirection(tile, borderingTile, Direction.NE);
      beachTransitionSw = this.shouldIncludeSpecialBeachTransitionInDirection(tile, borderingTile, Direction.SW);
    } else {
      beachTransitionNe = false;
      beachTransitionSw = false;
    }
    let terrainMaskResource = this.lib.getTerrainMaskResource(direction);
    let maskVariationNumber: number;
    if (useVariations && terrainMaskResource.getNumberOfVariations() > 1) {
      let transitionSeedTile = (direction === Direction.NW || direction === Direction.NE) ? tile : borderingTile;
      let seed = ImageLibrary.variationSeedUsing(transitionSeedTile.getX(), transitionSeedTile.getY());
      maskVariationNumber = new Random(seed).nextInt((terrainMaskResource.getNumberOfVariations() - 1) | 0);
    } else {
      maskVariationNumber = (terrainMaskResource.getNumberOfVariations() - 1) | 0;
    }
    let transitionKey: string;
    if (renderSpecialTransition) {
      let neBorderingTile = borderingTile.getNeighbourOrNull(Direction.NE);
      let swBorderingTile = borderingTile.getNeighbourOrNull(Direction.SW);
      transitionKey = terrainImageResource.getCachingKey() + ',' + (neBorderingTile != null && neBorderingTile.getType() != null ? neBorderingTile.getType().getId() : 'null') + ',' + (swBorderingTile != null && swBorderingTile.getType() != null ? swBorderingTile.getType().getId() : 'null') + ',' + maskVariationNumber + ',' + beachTransitionNe + beachTransitionSw + '$baseTransition$gen';
    } else {
      transitionKey = terrainImageResource.getCachingKey() + ',' + maskVariationNumber + '$baseTransition$gen';
    }
    let transitionImage = this.imageCache.getCachedImageOrGenerate(transitionKey, this.lib.getTileSize(), false, direction.ordinal(), () => {
      let terrainImage = this.imageCache.getCachedImage(terrainImageResource, this.lib.getTileSize(), false, 0);
      let transitionTileImage: BufferedImage;
      if (!renderSpecialTransition) {
        transitionTileImage = terrainImage;
      } else {
        transitionTileImage = ImageUtils.createBufferedImage$int$int(terrainImage.getWidth(), terrainImage.getHeight());
        let tranitionG2d = transitionTileImage.createGraphics();
        if (tile.isLand() || borderingTile.isLand()) {
          tranitionG2d.drawImage$Image$int$int$ImageObserver(terrainImage, 0, 0, null);
        } else {
          if (beachTransitionNe) {
            tranitionG2d.drawImage$Image$int$int$ImageObserver(this.getSpecialBeachBaseTileTransitionImage(Direction.NE), 0, 0, null);
          }
          if (beachTransitionSw) {
            tranitionG2d.drawImage$Image$int$int$ImageObserver(this.getSpecialBeachBaseTileTransitionImage(Direction.SW), 0, 0, null);
          }
        }
        let transitionImage2 = this.getBaseTileTransitionImage(borderingTile, Direction.NE, false, false);
        if (transitionImage2 != null) {
          tranitionG2d.drawImage$Image$int$int$ImageObserver(transitionImage2, 0, 0, null);
        }
        let transitionImage3 = this.getBaseTileTransitionImage(borderingTile, Direction.SW, false, false);
        if (transitionImage3 != null) {
          tranitionG2d.drawImage$Image$int$int$ImageObserver(transitionImage3, 0, 0, null);
        }
        tranitionG2d.dispose();
      }
      let terrainMaskImage = this.imageCache.getCachedImage(terrainMaskResource, this.lib.getTileSize(), false, maskVariationNumber);
      return ImageUtils.imageWithAlphaFromMask(transitionTileImage, terrainMaskImage);
    });
    return transitionImage;
  }
  /**
   * Checks if the beach should be included when making the transition for a corner.
   *
   * @param tile The tile that should get a transition.
   * @param borderingTile The main tile used for making the transition (the neighboring tiles
   *      are used as well when making corners).
   * @param direction The direction to the neighboring tile that should be checked in order to
   *      determine if a beach corner transition is needed.
   * @return {@code true} if the beach should be rendered at the corner, and {@code false} otherwise.
   */
  shouldIncludeSpecialBeachTransitionInDirection(tile: Tile, borderingTile: Tile, direction: Direction): boolean {
    if (tile.isLand() || borderingTile.isLand()) {
      return false;
    }
    let tileNeighbour = tile.getNeighbourOrNull(direction);
    let borderingTileNeighbour = borderingTile.getNeighbourOrNull(direction);
    return tileNeighbour != null && tileNeighbour.isLand() || borderingTileNeighbour != null && borderingTileNeighbour.isLand();
  }
  /**
   * Gets the beach overlay to use when making base tile transitions with beach.
   */
  getSpecialBeachBaseTileTransitionImage(direction: Direction): BufferedImage {
    let transitionKey = 'specialBeachTransition.' + direction.toString() + '$gen';
    let resultImage = this.imageCache.getCachedImageOrGenerate(transitionKey, this.lib.getTileSize(), false, direction.ordinal(), () => {
      let beachImage = this.imageCache.getCachedImage(ImageLibrary.getBeachCenterImageResource(), this.lib.getTileSize(), false, 0);
      return ImageUtils.imageWithAlphaFromMask(beachImage, this.getSpecialBeachBaseTileTransitionMask(direction));
    });
    return resultImage;
  }
  getSpecialBeachBaseTileTransitionMask(direction: Direction): BufferedImage {
    let key = 'image.mask.special.beach.' + direction.toString().toLowerCase();
    return this.imageCache.getSizedImage$String$Dimension$boolean(key, this.lib.getTileSize(), false);
  }
  /**
   * Gets the terrain image resource, or the beach, in order to create transitions.
   */
  getTerrainOrBeachImageResource(tile: Tile, borderingTile: Tile): ImageResource {
    if (borderingTile == null) {
      return null;
    }
    let terrainImageResource: ImageResource;
    let notABeachTransition = borderingTile.isLand() || !borderingTile.isLand() && !tile.isLand();
    if (notABeachTransition) {
      terrainImageResource = ImageCache.getImageResource(ImageLibrary.getTerrainImageKey(borderingTile.getType()));
    } else {
      terrainImageResource = ImageLibrary.getBeachCenterImageResource();
    }
    return terrainImageResource;
  }
}

$J.define(BaseTileTransitionImageCreator, 'net.sf.freecol.client.gui.images.BaseTileTransitionImageCreator', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.ImageLibrary,net.sf.freecol.common.resources.ImageCache': '_BaseTileTransitionImageCreator' } });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  ImageCache = $J.load('net.sf.freecol.common.resources.ImageCache');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
