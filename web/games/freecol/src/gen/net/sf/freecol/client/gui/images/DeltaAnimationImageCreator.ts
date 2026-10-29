// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/images/DeltaAnimationImageCreator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, IllegalArgumentException, JObject, JString } from '../../../../../../../jre/index.ts';

let AlphaComposite, ImageCache, ImageUtils;

/**
 * Class for generating the combined animated images for river deltas.
 */
export class DeltaAnimationImageCreator extends JObject {
  lib: ImageLibrary = null;
  imageCache: ImageCache = null;
  _DeltaAnimationImageCreator(lib: ImageLibrary, imageCache: ImageCache): this {
    this.lib = lib;
    this.imageCache = imageCache;
    return this;
  }
  /**
   * Gets the combined animated image for the river delta.
   *
   * @param direction The direction to where the river is coming from.
   * @param ticks The number of ticks to get the correct animation frame.
   * @return A cached, generated image.
   */
  getAnimatedScaledRiverDeltaTerrainImage(direction: Direction, ticks: number): BufferedImage {
    let riverPebblesImageResource = DeltaAnimationImageCreator.getRiverPebblesImageResource();
    if (riverPebblesImageResource == null) {
      return null;
    }
    let waterImageResource = ImageCache.getImageResource('image.tile.river.water');
    let waterVariationNumber = waterImageResource.getVariationNumberForTick(ticks);
    let generatedKey = waterImageResource.getCachingKey() + '.riverDelta.' + $J.str(direction) + '.' + waterVariationNumber + '$gen';
    let result = this.imageCache.getCachedImageOrGenerate(generatedKey, this.lib.getTileSize(), false, waterVariationNumber, () => {
      let riverPebblesImage = riverPebblesImageResource.getImage$Dimension$boolean(this.lib.getTileSize(), false);
      let waterImage = waterImageResource.getVariation(waterVariationNumber).getImage$Dimension$boolean(this.lib.getTileSize(), false);
      let riverWaterMaskKey = 'image.mask.river.delta.' + direction.toString().toLowerCase();
      let riverWaterMaskImage = this.imageCache.getSizedImage$String$Dimension$boolean(riverWaterMaskKey, this.lib.getTileSize(), false);
      let riverPebblesMaskKey = 'image.mask.river.delta.pebbles.' + direction.toString().toLowerCase();
      let riverPebblesMaskImage = this.imageCache.getSizedImage$String$Dimension$boolean(riverPebblesMaskKey, this.lib.getTileSize(), false);
      let baseTileMask = this.lib.getTerrainMask(null);
      return DeltaAnimationImageCreator.generateImage(riverPebblesImage, waterImage, waterVariationNumber, riverWaterMaskImage, riverPebblesMaskImage, baseTileMask);
    });
    return result;
  }
  static getRiverPebblesImageResource(): ImageResource {
    let key = 'image.tile.river.pebbles';
    return ImageCache.getImageResource(key);
  }
  /**
   * Generates the image.
   *
   * @param pebblesImage The pebbles image. That is, the graphics the water is drawn upon.
   * @param waterImage The water to be drawn.
   * @param waterImageVariationNumber The variation number of the
   *      water image given above.
   * @param riverWaterMaskImage A mask to be applied to the water image in
   *      order to make the pebbles visible below the water.
   * @param riverPebblesMaskImage A mask to be applied to the pebbles image in
   *      order to make the resulting image properly fade out.
   * @param tileMask A center tile mask. This is used to ensure that
   *      no pixels are out of bounds of the base tile.
   * @return A base tile image fitting inside the standard "diamond".
   */
  static generateImage(pebblesImage: BufferedImage, waterImage: BufferedImage, waterImageVariationNumber: number, riverWaterMaskImage: BufferedImage, riverPebblesMaskImage: BufferedImage, tileMask: BufferedImage): BufferedImage {
    let width = waterImage.getWidth();
    let height = waterImage.getHeight();
    if (pebblesImage.getWidth() !== width || pebblesImage.getHeight() !== height) {
      throw new IllegalArgumentException('All images should be of the same size.');
    }
    if (riverWaterMaskImage.getWidth() !== width || riverWaterMaskImage.getHeight() !== height) {
      throw new IllegalArgumentException('All images should be of the same size.');
    }
    if (riverPebblesMaskImage.getWidth() !== width || riverPebblesMaskImage.getHeight() !== height) {
      throw new IllegalArgumentException('All images should be of the same size.');
    }
    if (tileMask.getWidth() !== width || tileMask.getHeight() !== height) {
      throw new IllegalArgumentException('All images should be of the same size.');
    }
    let maskedPebblesImage = ImageUtils.imageWithAlphaFromMask(pebblesImage, riverPebblesMaskImage);
    let maskedWaterImage = ImageUtils.imageWithAlphaFromMask(waterImage, riverWaterMaskImage);
    let riverAndPebblesImage = ImageUtils.createBufferedImage$int$int(width, height);
    let g2d = riverAndPebblesImage.createGraphics();
    g2d.drawImage$Image$int$int$ImageObserver(maskedPebblesImage, 0, 0, null);
    g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, Math.fround(0.9)));
    g2d.drawImage$Image$int$int$ImageObserver(maskedWaterImage, 0, 0, null);
    g2d.dispose();
    return ImageUtils.imageWithAlphaFromMask(riverAndPebblesImage, tileMask);
  }
}

$J.define(DeltaAnimationImageCreator, 'net.sf.freecol.client.gui.images.DeltaAnimationImageCreator', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.ImageLibrary,net.sf.freecol.common.resources.ImageCache': '_DeltaAnimationImageCreator' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  ImageCache = $J.load('net.sf.freecol.common.resources.ImageCache');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
