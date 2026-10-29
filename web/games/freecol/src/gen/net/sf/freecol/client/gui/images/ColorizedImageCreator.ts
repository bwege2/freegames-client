// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/images/ColorizedImageCreator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2024   The FreeCol Team
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
import { $J, BufferedImage, JObject } from '../../../../../../../jre/index.ts';

let Color, Dimension;

/**
 * Colorizes an image.
 */
export class ColorizedImageCreator extends JObject {
  imageCache: ImageCache = null;
  _ColorizedImageCreator(imageCache: ImageCache): this {
    this.imageCache = imageCache;
    return this;
  }
  /**
   * Returns a colorized version of an image with the given key.
   *
   * @param key The image key;
   * @param scalingFactor The scalingFactor for the image.
   * @param color The color used when colorizing.
   * @return A new image with the hue of the given color applied.
   */
  getColorizedImage(key: string, scalingFactor: number, color: Color): BufferedImage {
    let compositeKey = 'colorized##' + key + '##' + $J.Integer_toHexString(color.getRGB());
    let image = this.imageCache.getScaledImage(key, scalingFactor, false);
    return this.imageCache.getCachedImageOrGenerate(compositeKey, new Dimension()._Dimension$int$int(image.getWidth(), image.getHeight()), false, 0, () => {
      return this.colorize(image, color);
    });
  }
  colorize(image: BufferedImage, colorizeColor: Color): BufferedImage {
    let hsbColorize = Color.RGBtoHSB(colorizeColor.getRed(), colorizeColor.getGreen(), colorizeColor.getBlue(), null);
    let width = image.getWidth();
    let height = image.getHeight();
    let image1Pixels = image.getRGB(0, 0, width, height, null, 0, width);
    let hsb = $J.newArray(3, 0);
    for (let i = 0; i < image1Pixels.length; i++) {
      let argba = image1Pixels[i];
      let a = (argba & -16777216) >>> 24;
      let r = (argba & 16711680) >>> 16;
      let g = (argba & 65280) >>> 8;
      let b = (argba & 255);
      Color.RGBtoHSB(r, g, b, hsb);
      hsb[0] = hsbColorize[0];
      let rgb = Color.HSBtoRGB(hsb[0], hsb[1], hsb[2]);
      let argb = rgb & 16777215 | (a << 24);
      image1Pixels[i] = argb;
    }
    let newImage = new BufferedImage(width, height, 2);
    newImage.setRGB(0, 0, width, height, image1Pixels, 0, width);
    return newImage;
  }
}

$J.define(ColorizedImageCreator, 'net.sf.freecol.client.gui.images.ColorizedImageCreator', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.resources.ImageCache': '_ColorizedImageCreator' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
});
