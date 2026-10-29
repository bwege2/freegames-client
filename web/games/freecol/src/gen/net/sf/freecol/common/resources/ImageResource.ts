// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/ImageResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator, IOException, ImageIO, JString, Level, Logger, Random } from '../../../../../../jre/index.ts';
import { Resource } from './Resource.ts';

let Dimension, GraphicsEnvironment, Transparency, CollectionUtils, ImageUtils;

/**
 * A {@code Resource} wrapping an {@code Image}.
 * @see Resource
 */
export class ImageResource extends Resource {
  static logger: Logger = null;
  /**
   * Comparator to compare buffered images by ascending size.
   */
  static biComp: Comparator<BufferedImage> = null;
  /**
   * Experimental flag for forcing lowest quality (for now using bitmask instead of
   * full transparency ... later perhaps also fewer colors.
   *
   * We should make a separate class for image configurations if we keep this
   * longterm.
   */
  static forceLowestQuality_: boolean = false;
  image: BufferedImage = null;
  alternativeLocators: List<URI> = null;
  loadedImages: List<BufferedImage> = null;
  variations: List<ImageResource> = null;
  /**
   * Do not use directly.
   *
   * @param cachingKey The caching key.
   * @param resourceLocator The {@code URI} used when loading this resource.
   */
  _ImageResource(cachingKey: string, resourceLocator: URI): this {
    this._Resource$String$URI(cachingKey, resourceLocator);
    this.image = null;
    this.alternativeLocators = null;
    this.loadedImages = null;
    this.variations = new ArrayList();
    return this;
  }
  /**
   * Adds another URI for loading a differently sized version of the image.
   * Only use before preload got called!
   *
   * @param uri The {@code URI} used when loading.
   */
  addAlternativeResourceLocator(uri: URI): void {
    if (this.alternativeLocators == null) {
      this.alternativeLocators = new ArrayList();
    }
    this.alternativeLocators.add(uri);
  }
  addVariation(imageResource: ImageResource): void {
    this.variations.add(imageResource);
  }
  /**
   * Adds another URIs for loading a differently sized version of the image.
   * Only use before preload got called!
   *
   * @param uris A {@code List} of {@code URI}s used when loading.
   */
  addAlternativeResourceLocators(uris: List<URI>): void {
    if (this.alternativeLocators == null) {
      this.alternativeLocators = new ArrayList();
    }
    this.alternativeLocators.addAll(uris);
  }
  /**
   * Gets the {@code Image} represented by this resource.
   *
   * @return The image in its original size and color.
   */
  getImage$(): BufferedImage {
    if (this.image == null) {
      ImageResource.logger.finest('Preload not ready for ' + $J.str(this.getResourceLocator()));
      this.preload();
    }
    return this.image;
  }
  getVariationNumberForSeed(seed: number): number {
    return new Random(seed).nextInt((this.variations.size() + 1) | 0);
  }
  getVariationNumberForTick(ticks: number): number {
    return ((ticks % ((this.variations.size() + 1) | 0))) | 0;
  }
  getNumberOfVariations(): number {
    return (this.variations.size() + 1) | 0;
  }
  getVariation(variationNumber: number): ImageResource {
    if (this.variations.isEmpty()) {
      return this;
    }
    if (variationNumber >= this.variations.size()) {
      return this;
    }
    return this.variations.get(variationNumber);
  }
  /**
   * Gets the image using the specified dimension and choice of grayscale.
   *
   * @param variation The image variation.
   * @param d The {@code Dimension} of the requested image.
   * @param grayscale If true return a grayscale image.
   * @return The scaled {@code BufferedImage}.
   */
  getImage$int$Dimension$boolean(variation: number, d: Dimension, grayscale: boolean): BufferedImage {
    return (grayscale) ? this.getVariation(variation).getGrayscaleImage(d) : this.getVariation(variation).getColorImage(d);
  }
  /**
   * Gets the image using the specified dimension and choice of grayscale.
   *
   * @param d The {@code Dimension} of the requested image.
   * @param grayscale If true return a grayscale image.
   * @return The scaled {@code BufferedImage}.
   */
  getImage$Dimension$boolean(d: Dimension, grayscale: boolean): BufferedImage {
    return (grayscale) ? this.getGrayscaleImage(d) : this.getColorImage(d);
  }
  /**
   * Find the loaded image that satisfies a predicate.
   *
   * @param pred The <code>Predicate</code> to satisfy.
   * @return The <code>BufferedImage</code> found, or if not found, the
   *     one at the end of the loaded images list.
   */
  findLoadedImage(pred: Predicate<BufferedImage>): BufferedImage {
    let oim = CollectionUtils.find$Collection$Predicate(this.loadedImages, pred);
    return (oim != null) ? oim : this.loadedImages.get((this.loadedImages.size() - 1) | 0);
  }
  haveAlternatives(): boolean {
    return this.loadedImages != null;
  }
  /**
   * Returns an image that has been forcefully scaled to the given size.
   *
   * @param size The {@code Dimension} of the requested image.
   * @return The {@code BufferedImage} with the exact dimension. When there
   *      are alternative sizes, the image with the closest aspect ratio is
   *      chosen to get the least amount distortion possible.
   */
  getSizedImageIgnoringProportions(size: Dimension): BufferedImage {
    let img = this.getImage$();
    if (img == null) {
      return null;
    }
    if (size.width_ === img.getWidth() && size.height_ === img.getHeight()) {
      return img;
    }
    if (this.loadedImages == null || this.loadedImages.isEmpty()) {
      return ImageUtils.createResizedImage$Image$int$int$boolean(img, size.width_, size.height_, true);
    }
    let targetAspectRatio = (size.width_) / size.height_;
    let img2 = this.loadedImages.stream().min((a, b) => {
      let aspectDiffA = targetAspectRatio - (a.getWidth()) / a.getHeight();
      let aspectDiffB = targetAspectRatio - (b.getWidth()) / b.getHeight();
      if (Math.abs(aspectDiffA) > Math.abs(aspectDiffB)) {
        return 1;
      } else {
        return -1;
      }
    }).orElseThrow();
    return ImageUtils.createResizedImage$Image$int$int$boolean(img2, size.width_, size.height_, true);
  }
  /**
   * Gets the image using the specified dimension.
   *
   * Rescaling will be performed if necessary.
   *
   * @param siz The {@code Dimension} of the requested image.
   * @return The {@code BufferedImage} with the required dimension.
   */
  getColorImage(siz: Dimension): BufferedImage {
    let img = this.getImage$();
    if (img == null) {
      return null;
    }
    let w = img.getWidth();
    let h = img.getHeight();
    let dNew = ImageUtils.wildcardDimension(siz, new Dimension()._Dimension$int$int(w, h));
    let wNew = dNew.width_;
    let hNew = dNew.height_;
    if (wNew === w && hNew === h) {
      return img;
    }
    if (this.haveAlternatives()) {
      let fwNew = wNew;
      let fhNew = hNew;
      let sizePred = (i) => i.getWidth() >= fwNew && i.getHeight() >= fhNew;
      img = this.findLoadedImage(sizePred);
      w = img.getWidth();
      h = img.getHeight();
      dNew = ImageUtils.wildcardDimension(siz, new Dimension()._Dimension$int$int(w, h));
      wNew = dNew.width_;
      hNew = dNew.height_;
      if (wNew === w && hNew === h) {
        return img;
      }
    }
    if (wNew !== w || hNew !== h) {
      img = ImageUtils.createResizedImage$Image$int$int(img, wNew, hNew);
    }
    return img;
  }
  /**
   * Gets a grayscale version of the image of the given size.
   *
   * @param siz The {@code Dimension} of the requested image.
   * @return The {@code BufferedImage}.
   */
  getGrayscaleImage(siz: Dimension): BufferedImage {
    let img = this.getColorImage(siz);
    return ImageUtils.createGrayscaleImage(img);
  }
  /**
   * {@inheritDoc}
   */
  preload(): void {
    if (this.image == null) {
      this.image = ImageResource.loadImage(this.getResourceLocator());
      if (this.alternativeLocators != null) {
        this.loadedImages = new ArrayList();
        if (this.image != null) {
          this.loadedImages.add(this.image);
        }
        for (const $it0 = this.alternativeLocators.iterator(); $it0.hasNext(); ) {
          let uri = $it0.next();
          let image = ImageResource.loadImage(uri);
          if (image != null) {
            this.loadedImages.add(image);
          }
        }
        this.loadedImages.sort(ImageResource.biComp);
        if (this.image == null && !this.loadedImages.isEmpty()) {
          this.image = CollectionUtils.first$Collection(this.loadedImages);
        }
      }
      for (const $it1 = this.variations.iterator(); $it1.hasNext(); ) {
        let variation = $it1.next();
        variation.preload();
      }
    }
  }
  /**
   * Load an image from a URI.
   *
   * @param uri The {@code URI} to load from.
   * @return The loaded {@code BufferedImage}, or null on error.
   */
  static loadImage(uri: URI): BufferedImage {
    try {
      let url = uri.toURL();
      let image = ImageIO.read(url);
      if (image == null) {
        ImageResource.logger.log(Level.WARNING, 'Failed to read image from: ' + $J.str(uri));
        return null;
      }
      if (ImageResource.canUseBitmask(uri)) {
        let compatibleImage = GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDefaultConfiguration().createCompatibleImage$int$int$int(image.getWidth(), image.getHeight(), Transparency.BITMASK);
        let g = compatibleImage.createGraphics();
        g.drawImage$Image$int$int$ImageObserver(image, 0, 0, null);
        g.dispose();
        return compatibleImage;
      } else {
        return image;
      }
    } catch ($e2) {
      if ($J.isa($e2, IOException)) {
        let ioe = $J.exc($e2);
        ImageResource.logger.log(Level.WARNING, 'Exception to loading image from: ' + $J.str(uri), ioe);
      } else {
        throw $e2;
      }
    }
    return null;
  }
  clean(): void {
    this.image = null;
    if (this.loadedImages != null) {
      this.loadedImages.clear();
    }
    if (this.variations != null) {
      this.variations.stream().forEach((v) => v.clean());
    }
  }
  static canUseBitmask(uri: URI): boolean {
    return ImageResource.forceLowestQuality_ || uri.toString().includes('center') && !uri.toString().includes('mask');
  }
  static forceLowestQuality(forceLowestQuality: boolean): void {
  }
  static isForceLowestQuality(): boolean {
    return ImageResource.forceLowestQuality_;
  }
  static $clinit() {
    ImageResource.logger = Logger.getLogger($J.cls(ImageResource).getName());
    ImageResource.biComp = Comparator.comparingInt((bi) => Math.imul(bi.getWidth(), bi.getHeight()));
    ImageResource.forceLowestQuality_ = false;
  }
}

$J.define(ImageResource, 'net.sf.freecol.common.resources.ImageResource', { kind: 'class', ifaces: ['net.sf.freecol.common.resources.Resource$Cleanable'], sup: 'net.sf.freecol.common.resources.Resource', ctors: { 'java.lang.String,java.net.URI': '_ImageResource' }, returns: { 'getNumberOfVariations': 'int', 'getImage$': 'java.awt.image.BufferedImage' }, meths: { 'getImage(java.awt.Dimension,boolean)': 'getImage$Dimension$boolean', 'getImage(int,java.awt.Dimension,boolean)': 'getImage$int$Dimension$boolean', 'getImage()': 'getImage$' }, clinit: true, lazy: ['logger', 'biComp', 'forceLowestQuality_'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Transparency = $J.load('java.awt.Transparency');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
