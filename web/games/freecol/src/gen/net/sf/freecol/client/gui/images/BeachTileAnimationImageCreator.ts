// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/images/BeachTileAnimationImageCreator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, IllegalArgumentException, JObject, JString } from '../../../../../../../jre/index.ts';

let AlphaComposite, ImageLibrary, Direction, ImageCache, ImageUtils;

/**
 * Class for generating the combined animated image for ocean and beach
 * based on ocean image masks.
 */
export class BeachTileAnimationImageCreator extends JObject {
  lib: ImageLibrary = null;
  imageCache: ImageCache = null;
  _BeachTileAnimationImageCreator(lib: ImageLibrary, imageCache: ImageCache): this {
    this.lib = lib;
    this.imageCache = imageCache;
    return this;
  }
  /**
   * Gets the combined animated image for ocean and beach.
   *
   * @param type The tile type.
   * @param directionsWithLand All directions where there are neighbouring land tiles. 
   * @param ticks The number of ticks to get the correct animation frame.
   * @return A cached, genereated image.
   */
  getAnimatedScaledWaterAndBeachTerrainImage(type$: TileType, directionsWithLand: List<Direction>, ticks: number): BufferedImage {
    let beachCenterImageResource = ImageLibrary.getBeachCenterImageResource();
    if (beachCenterImageResource == null) {
      return null;
    }
    let beachVariationKey = this.determineDirectionCombinationKey(directionsWithLand);
    let oceanImageResource = ImageCache.getImageResource(ImageLibrary.getTerrainImageKey(type$));
    let oceanVariationNumber = oceanImageResource.getVariationNumberForTick(ticks);
    let generatedKey = oceanImageResource.getCachingKey() + '.beach.' + beachVariationKey + '$gen';
    let result = this.imageCache.getCachedImageOrGenerate(generatedKey, this.lib.getTileSize(), false, oceanVariationNumber, () => {
      let oceanImage = this.lib.getAnimatedScaledTerrainImage(type$, ticks);
      let beachMaskKey = 'image.mask.beach.' + beachVariationKey;
      let beachMaskImage = this.imageCache.getSizedImage$String$Dimension$boolean(beachMaskKey, this.lib.getTileSize(), false);
      let beachImage = beachCenterImageResource.getImage$Dimension$boolean(this.lib.getTileSize(), false);
      let tileMask = this.lib.getTerrainMask(null);
      return BeachTileAnimationImageCreator.generateImage(beachImage, oceanImage, oceanVariationNumber, beachMaskImage, tileMask);
    });
    return result;
  }
  /**
   * Generates the image.
   *
   * @param beachImage The beach center tile image.
   * @param oceanImage The ocean image to use.
   * @param oceanImageVariationNumber The variation number of the
   *      ocean image given above.
   * @param beachMaskImage A mask to be applied to the ocean image in
   *      order to make the beach visible below the ocean.
   * @param tileMask A center tile mask. This is used to ensure that
   *      no pixels are out of bounds of the base tile.
   * @return A base tile image fitting inside the standard "diamond".
   */
  static generateImage(beachImage: BufferedImage, oceanImage: BufferedImage, oceanImageVariationNumber: number, beachMaskImage: BufferedImage, tileMask: BufferedImage): BufferedImage {
    let width = oceanImage.getWidth();
    let height = oceanImage.getHeight();
    if (beachImage.getWidth() !== width || beachImage.getHeight() !== height) {
      throw new IllegalArgumentException('All images should be of the same size.');
    }
    if (beachMaskImage.getWidth() !== width || beachMaskImage.getHeight() !== height) {
      throw new IllegalArgumentException('All images should be of the same size.');
    }
    if (tileMask.getWidth() !== width || tileMask.getHeight() !== height) {
      throw new IllegalArgumentException('All images should be of the same size.');
    }
    let maskedInputImage = ImageUtils.imageWithAlphaFromMask(oceanImage, beachMaskImage);
    let extraOcean = Math.fround(0.05);
    let alpha: number;
    if (oceanImageVariationNumber <= 10) {
      alpha = Math.fround(extraOcean * oceanImageVariationNumber);
    } else {
      alpha = Math.fround(Math.fround(extraOcean * 10) - Math.fround(extraOcean * ((oceanImageVariationNumber - 10) | 0)));
    }
    let resultImage = ImageUtils.createBufferedImage$int$int(width, height);
    let g2d = resultImage.createGraphics();
    g2d.drawImage$Image$int$int$ImageObserver(beachImage, 0, 0, null);
    g2d.drawImage$Image$int$int$ImageObserver(maskedInputImage, 0, 0, null);
    g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, alpha));
    g2d.drawImage$Image$int$int$ImageObserver(maskedInputImage, 0, 0, null);
    g2d.dispose();
    return ImageUtils.imageWithAlphaFromMask(resultImage, tileMask);
  }
  /**
   * Returns a string representing the {@code directions} given.
   * @param directions The directions that should be included
   * @return The directions in lowercase, ordered alphabetically and
   *      combined with "_". Corners that are a part of a longSide is
   *      not included in the returned {@code String}.
   */
  determineDirectionCombinationKey(directions: List<Direction>): string {
    let neighboursPre = directions.stream().filter((d) => Direction.longSides.contains(d)).map((d) => d.toString().toLowerCase()).sorted().reduce((a, b) => a + '_' + b);
    let beachVariationKey = directions.stream().filter((d) => Direction.longSides.contains(d) || neighboursPre.isEmpty() || !neighboursPre.get().includes(d.toString().toLowerCase())).map((d) => d.toString().toLowerCase()).sorted().reduce((a, b) => a + '_' + b).get();
    return beachVariationKey;
  }
}

$J.define(BeachTileAnimationImageCreator, 'net.sf.freecol.client.gui.images.BeachTileAnimationImageCreator', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.ImageLibrary,net.sf.freecol.common.resources.ImageCache': '_BeachTileAnimationImageCreator' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  ImageCache = $J.load('net.sf.freecol.common.resources.ImageCache');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
