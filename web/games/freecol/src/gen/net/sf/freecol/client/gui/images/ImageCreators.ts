// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/images/ImageCreators.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, JObject } from '../../../../../../../jre/index.ts';

let BaseTileTransitionImageCreator, BeachTileAnimationImageCreator, ColorizedImageCreator, DeltaAnimationImageCreator, RiverAnimationImageCreator;

/**
 * Lists the image creators that can be used by {@link ImageLibrary} to
 * dynamically generate images.
 */
export class ImageCreators extends JObject {
  baseTileTransitionImageCreator: BaseTileTransitionImageCreator = null;
  beachTileAnimationImageCreator: BeachTileAnimationImageCreator = null;
  riverAnimationImageCreator: RiverAnimationImageCreator = null;
  deltaAnimationImageCreator: DeltaAnimationImageCreator = null;
  colorizedImageCreator: ColorizedImageCreator = null;
  _ImageCreators(lib: ImageLibrary, imageCache: ImageCache): this {
    this.baseTileTransitionImageCreator = new BaseTileTransitionImageCreator()._BaseTileTransitionImageCreator(lib, imageCache);
    this.beachTileAnimationImageCreator = new BeachTileAnimationImageCreator()._BeachTileAnimationImageCreator(lib, imageCache);
    this.riverAnimationImageCreator = new RiverAnimationImageCreator()._RiverAnimationImageCreator(lib, imageCache);
    this.deltaAnimationImageCreator = new DeltaAnimationImageCreator()._DeltaAnimationImageCreator(lib, imageCache);
    this.colorizedImageCreator = new ColorizedImageCreator()._ColorizedImageCreator(imageCache);
    return this;
  }
  getBaseTileTransitionImageCreator(): BaseTileTransitionImageCreator {
    return this.baseTileTransitionImageCreator;
  }
  getBeachTileAnimationImageCreator(): BeachTileAnimationImageCreator {
    return this.beachTileAnimationImageCreator;
  }
  getRiverAnimationImageCreator(): RiverAnimationImageCreator {
    return this.riverAnimationImageCreator;
  }
  getDeltaAnimationImageCreator(): DeltaAnimationImageCreator {
    return this.deltaAnimationImageCreator;
  }
  getColorizedImageCreator(): ColorizedImageCreator {
    return this.colorizedImageCreator;
  }
}

$J.define(ImageCreators, 'net.sf.freecol.client.gui.images.ImageCreators', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.ImageLibrary,net.sf.freecol.common.resources.ImageCache': '_ImageCreators' }, returns: { 'getColorizedImageCreator': 'net.sf.freecol.client.gui.images.ColorizedImageCreator', 'getDeltaAnimationImageCreator': 'net.sf.freecol.client.gui.images.DeltaAnimationImageCreator', 'getRiverAnimationImageCreator': 'net.sf.freecol.client.gui.images.RiverAnimationImageCreator', 'getBeachTileAnimationImageCreator': 'net.sf.freecol.client.gui.images.BeachTileAnimationImageCreator', 'getBaseTileTransitionImageCreator': 'net.sf.freecol.client.gui.images.BaseTileTransitionImageCreator' } });
$J.module(() => {
  BaseTileTransitionImageCreator = $J.load('net.sf.freecol.client.gui.images.BaseTileTransitionImageCreator');
  BeachTileAnimationImageCreator = $J.load('net.sf.freecol.client.gui.images.BeachTileAnimationImageCreator');
  ColorizedImageCreator = $J.load('net.sf.freecol.client.gui.images.ColorizedImageCreator');
  DeltaAnimationImageCreator = $J.load('net.sf.freecol.client.gui.images.DeltaAnimationImageCreator');
  RiverAnimationImageCreator = $J.load('net.sf.freecol.client.gui.images.RiverAnimationImageCreator');
});
