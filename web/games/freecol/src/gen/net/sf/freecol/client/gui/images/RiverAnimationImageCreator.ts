// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/images/RiverAnimationImageCreator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, Collectors, IllegalArgumentException, JObject, JString, List } from '../../../../../../../jre/index.ts';

let AlphaComposite, RenderingHints, Direction, ImageCache, ImageUtils;

/**
 * Class for generating the combined animated images for rivers.
 */
export class RiverAnimationImageCreator extends JObject {
  lib: ImageLibrary = null;
  imageCache: ImageCache = null;
  _RiverAnimationImageCreator(lib: ImageLibrary, imageCache: ImageCache): this {
    this.lib = lib;
    this.imageCache = imageCache;
    return this;
  }
  /**
   * Gets the combined animated image for river
   *
   * @param tile The tile. 
   * @param ticks The number of ticks to get the correct animation frame.
   * @return A cached, generated image.
   */
  getAnimatedScaledRiverTerrainImage(tile: Tile, ticks: number): BufferedImage {
    let riverPebblesImageResource = RiverAnimationImageCreator.getRiverPebblesImageResource();
    if (riverPebblesImageResource == null) {
      return null;
    }
    let riverTransitions = this.determineRiverTransitionsUsingStyle(tile);
    let riverVariationKey = this.directionsToString(riverTransitions);
    let riverWaterImageResource = ImageCache.getImageResource('image.tile.river.water');
    let riverVariationNumber = riverWaterImageResource.getVariationNumberForTick(ticks);
    let magnitude = tile.getRiver().getMagnitude();
    let minorString = (magnitude <= 1) ? '.minor' : '';
    let minorToMajorTransitions = this.determineMinorToMajorRiverTransitions(tile, riverTransitions);
    let generatedKey = riverWaterImageResource.getCachingKey() + '.river.' + minorString + this.directionsToString(minorToMajorTransitions) + '.' + riverVariationKey + '$gen';
    let result = this.imageCache.getCachedImageOrGenerate(generatedKey, this.lib.getTileSize(), false, riverVariationNumber, () => {
      let riverPebblesImage = riverPebblesImageResource.getImage$Dimension$boolean(this.lib.getTileSize(), false);
      let riverWaterImage = riverWaterImageResource.getVariation(riverVariationNumber).getImage$Dimension$boolean(this.lib.getTileSize(), false);
      let riverMaskKey = 'image.mask.river' + minorString + ((riverVariationKey.length === 0) ? '' : '.' + riverVariationKey);
      let baseMaskImage = this.imageCache.getSizedImage$String$Dimension$boolean(riverMaskKey, this.lib.getTileSize(), false);
      let maskImage = this.createRiverMaskImageWithTransitions(baseMaskImage, minorToMajorTransitions);
      let baseTileMask = this.lib.getTerrainMask(null);
      return RiverAnimationImageCreator.generateImage(riverPebblesImage, riverWaterImage, riverVariationNumber, maskImage, baseTileMask);
    });
    return result;
  }
  static getRiverPebblesImageResource(): ImageResource {
    let key = 'image.tile.river.pebbles';
    return ImageCache.getImageResource(key);
  }
  createRiverMaskImageWithTransitions(baseMaskImage: BufferedImage, minorToMajorTransitions: List<Direction>): BufferedImage {
    if (minorToMajorTransitions.isEmpty()) {
      return baseMaskImage;
    }
    let resultImage = ImageUtils.createBufferedImage$int$int(baseMaskImage.getWidth(), baseMaskImage.getHeight());
    let g2d = resultImage.createGraphics();
    g2d.drawImage$Image$int$int$ImageObserver(baseMaskImage, 0, 0, null);
    for (const $it0 = minorToMajorTransitions.iterator(); $it0.hasNext(); ) {
      let d = $it0.next();
      let riverMaskKey = 'image.mask.river.to_major.' + d.toString().toLowerCase();
      let maskImage = this.imageCache.getSizedImage$String$Dimension$boolean(riverMaskKey, this.lib.getTileSize(), false);
      g2d.drawImage$Image$int$int$ImageObserver(maskImage, 0, 0, null);
    }
    g2d.dispose();
    return resultImage;
  }
  determineMinorToMajorRiverTransitions(tile: Tile, riverTransitions: List<Direction>): List<Direction> {
    if (tile.getRiver().getMagnitude() > 1) {
      return List.of();
    }
    let directionsWithRiverTransitions = riverTransitions.stream().filter((d) => {
      let neighbour = tile.getNeighbourOrNull(d);
      return neighbour != null && (neighbour.hasRiver() && neighbour.getRiver().getMagnitude() > 1 || tile.isLand() && !neighbour.isLand());
    }).collect(Collectors.toList());
    return directionsWithRiverTransitions;
  }
  determineRiverCombinations(tile: Tile): List<Direction> {
    let directionsWithRiver = Direction.longSides.stream().filter((d) => {
      let neighbour = tile.getNeighbourOrNull(d);
      return neighbour != null && (neighbour.hasRiver() || tile.isLand() && !neighbour.isLand());
    }).collect(Collectors.toList());
    return directionsWithRiver;
  }
  determineRiverTransitionsUsingStyle(tile: Tile): List<Direction> {
    let river = tile.getRiver();
    if (river == null) {
      return List.of();
    }
    return river.getConnections().entrySet().stream().filter((e) => e.getValue() > 0).map((e) => e.getKey()).collect(Collectors.toList());
  }
  directionsToString(directions: List<Direction>): string {
    return directions.stream().map((d) => d.toString().toLowerCase()).sorted().reduce((a, b) => a + '_' + b).orElse('');
  }
  /**
   * Generates the image.
   *
   * @param pebblesImage The pebbles image. That is, the graphics the water is drawn upon.
   * @param waterImage The water to be drawn.
   * @param riverImageVariationNumber The variation number of the
   *      water image given above.
   * @param riverMaskImage A mask to be applied to the water image in
   *      order to make the pebbles visible below the water. In addition, an
   *      enlarged (and less transparent) version of this mask is used for
   *      masking the pebbles.
   * @param tileMask A center tile mask. This is used to ensure that
   *      no pixels are out of bounds of the base tile.
   * @return A base tile image fitting inside the standard "diamond".
   */
  static generateImage(pebblesImage: BufferedImage, waterImage: BufferedImage, riverImageVariationNumber: number, riverMaskImage: BufferedImage, tileMask: BufferedImage): BufferedImage {
    let width = waterImage.getWidth();
    let height = waterImage.getHeight();
    if (pebblesImage.getWidth() !== width || pebblesImage.getHeight() !== height) {
      throw new IllegalArgumentException('All images should be of the same size.');
    }
    if (riverMaskImage.getWidth() !== width || riverMaskImage.getHeight() !== height) {
      throw new IllegalArgumentException('All images should be of the same size.');
    }
    if (tileMask.getWidth() !== width || tileMask.getHeight() !== height) {
      throw new IllegalArgumentException('All images should be of the same size.');
    }
    let maskedInputImage = ImageUtils.imageWithAlphaFromMask(waterImage, riverMaskImage);
    let riverAndPebblesImage = ImageUtils.createBufferedImage$int$int(width, height);
    let g2d = riverAndPebblesImage.createGraphics();
    g2d.drawImage$Image$int$int$ImageObserver(pebblesImage, 0, 0, null);
    g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, Math.fround(0.9)));
    g2d.drawImage$Image$int$int$ImageObserver(maskedInputImage, 0, 0, null);
    g2d.dispose();
    let largerRiverMaskImage = RiverAnimationImageCreator.toLargerMaskWithLessTransparency(riverMaskImage, width, height);
    let resultImage = ImageUtils.imageWithAlphaFromMask(riverAndPebblesImage, largerRiverMaskImage);
    return ImageUtils.imageWithAlphaFromMask(resultImage, tileMask);
  }
  static toLargerMaskWithLessTransparency(riverMaskImage: BufferedImage, origWidth: number, origHeight: number): BufferedImage {
    let largerWidth = $J.d2i((Math.fround(origWidth * 1.25)));
    let largerHeight = $J.d2i((Math.fround(origHeight * 1.25)));
    let expandedRiverMaskImage = ImageUtils.createBufferedImage$int$int(largerWidth, largerHeight);
    let expandedRiverMaskImageG2d = expandedRiverMaskImage.createGraphics();
    expandedRiverMaskImageG2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
    expandedRiverMaskImageG2d.drawImage$Image$int$int$int$int$ImageObserver(riverMaskImage, 0, 0, largerWidth, largerHeight, null);
    let x = $J.idiv(((largerWidth - origWidth) | 0), 2);
    let y = $J.idiv(((largerHeight - origHeight) | 0), 2);
    expandedRiverMaskImageG2d.drawImage$Image$int$int$int$int$ImageObserver(riverMaskImage, x, y, origWidth, origHeight, null);
    expandedRiverMaskImageG2d.dispose();
    return expandedRiverMaskImage.getSubimage(x, y, origWidth, origHeight);
  }
}

$J.define(RiverAnimationImageCreator, 'net.sf.freecol.client.gui.images.RiverAnimationImageCreator', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.ImageLibrary,net.sf.freecol.common.resources.ImageCache': '_RiverAnimationImageCreator' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  RenderingHints = $J.load('java.awt.RenderingHints');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  ImageCache = $J.load('net.sf.freecol.common.resources.ImageCache');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
