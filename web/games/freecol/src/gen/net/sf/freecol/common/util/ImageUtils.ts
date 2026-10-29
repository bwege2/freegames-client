// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/util/ImageUtils.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ColorSpace, JObject } from '../../../../../../jre/index.ts';

let AlphaComposite, Dimension, GraphicsEnvironment, Rectangle, RenderingHints, TexturePaint, Transparency, ColorConvertOp, RescaleOp, ImageResource;

/**
 * Collection of static image manipulation utilities.
 * Only generic routines belong here, anything specific to FreeCol
 * belongs in ImageLibrary or ImageResource.
 */
export class ImageUtils extends JObject {
  _ImageUtils(): this {
    return this;
  }
  /**
   * Creates a buffered image from an input {@code Image}.
   *
   * @param image The {@code Image}.
   * @return The new {@code BufferedImage}.
   */
  static createBufferedImage$Image(image: Image): BufferedImage {
    if (image == null) {
      return null;
    }
    let result = ImageUtils.createBufferedImage$int$int(image.getWidth$ImageObserver(null), image.getHeight$ImageObserver(null));
    let g2d = result.createGraphics();
    g2d.drawImage$Image$int$int$ImageObserver(image, 0, 0, null);
    g2d.dispose();
    return result;
  }
  /**
   * Creates a buffered image with the given size.
   *
   * @param width The desired width.
   * @param height The desired height.
   * @return The new {@code BufferedImage}.
   */
  static createBufferedImage$int$int(width: number, height: number): BufferedImage {
    let dc = GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDefaultConfiguration();
    if (ImageResource.isForceLowestQuality()) {
      return dc.createCompatibleImage$int$int$int(width, height, Transparency.BITMASK);
    } else {
      return dc.createCompatibleImage$int$int$int(width, height, Transparency.TRANSLUCENT);
    }
  }
  /**
   * Create a grayscale buffered image version of an input {@code Image}.
   *
   * @param image The {@code Image}.
   * @return The new halved {@code BufferedImage}.
   */
  static createGrayscaleImage(image: Image): BufferedImage {
    if (image == null) {
      return null;
    }
    let width = image.getWidth$ImageObserver(null);
    let height = image.getHeight$ImageObserver(null);
    let result = ImageUtils.createBufferedImage$int$int(width, height);
    let g2d = result.createGraphics();
    g2d.drawImage$Image$int$int$ImageObserver(image, 0, 0, null);
    g2d.dispose();
    let filter = new ColorConvertOp()._ColorConvertOp$ColorSpace$RenderingHints(ColorSpace.getInstance(1003), null);
    return filter.filter$BufferedImage$BufferedImage(result, null);
  }
  /**
   * Create a buffered image that is roughly half the size in both
   * dimensions of an input {@code Image}.
   *
   * Note: perhaps this should be createQuarteredImage?
   *
   * @param image The {@code Image}.
   * @return The new halved {@code BufferedImage}.
   */
  static createHalvedImage(image: Image): BufferedImage {
    if (image == null) {
      return null;
    }
    let width = image.getWidth$ImageObserver(null);
    let height = image.getHeight$ImageObserver(null);
    let w = $J.idiv(((width + 1) | 0), 2);
    let h = $J.idiv(((height + 1) | 0), 2);
    let result = ImageUtils.createBufferedImage$int$int(w, h);
    let g2d = result.createGraphics();
    g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
    g2d.drawImage$Image$int$int$int$int$ImageObserver(image, 0, 0, w, h, null);
    g2d.dispose();
    return result;
  }
  /**
   * Create a buffered image that mirrors an input {@code Image}.
   *
   * @param image The {@code Image} object.
   * @return The new mirrored {@code BufferedImage} object.
   */
  static createMirroredImage(image: Image): BufferedImage {
    if (image == null) {
      return null;
    }
    let width = image.getWidth$ImageObserver(null);
    let height = image.getHeight$ImageObserver(null);
    let result = ImageUtils.createBufferedImage$int$int(width, height);
    let g2d = result.createGraphics();
    g2d.drawImage$Image$int$int$int$int$ImageObserver(image, width, 0, -width, height, null);
    g2d.dispose();
    return result;
  }
  /**
   * Create a buffered image resized from a plain {@code Image}.
   *
   * Note that while the result will fit in width x height, it
   * tends to retain its original aspect ratio.
   *
   * @param image The {@code Image} object.
   * @param width The desired width.
   * @param height The desired height.
   * @return The new resized {@code BufferedImage} object.
   */
  static createResizedImage$Image$int$int(image: Image, width: number, height: number): BufferedImage {
    return ImageUtils.createResizedImage$Image$int$int$boolean(image, width, height, false);
  }
  /**
   * Create a buffered image resized from a plain {@code Image}.
   *
   * Note that while the result will fit in width x height, it
   * tends to retain its original aspect ratio.
   *
   * @param image The {@code Image} object.
   * @param width The desired width.
   * @param height The desired height.
   * @param interpolation Use interpolation while resizing.
   * @return The new resized {@code BufferedImage} object.
   */
  static createResizedImage$Image$int$int$boolean(image: Image, width: number, height: number, interpolation: boolean): BufferedImage {
    let result = ImageUtils.createBufferedImage$int$int(width, height);
    let g2d = result.createGraphics();
    if (interpolation) {
      g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
    }
    g2d.drawImage$Image$int$int$int$int$ImageObserver(image, 0, 0, width, height, null);
    g2d.dispose();
    return result;
  }
  /**
   * Draw a (usually small) background image into a (usually larger)
   * space specified by a component, tiling the image to fill up the
   * space.
   *
   * @param image A {@code BufferedImage} to tile with (null fills with
   *     background color).
   * @param g The {@code Graphics} to draw to.
   * @param c The {@code JComponent} that defines the space.
   * @param insets Optional {@code Insets} to apply.
   */
  static drawTiledImage(image: BufferedImage, g: Graphics, c: JComponent, insets: Insets): void {
    let width = c.getWidth();
    let height = c.getHeight();
    let xmin: number;
    let ymin: number;
    if (insets == null) {
      xmin = 0;
      ymin = 0;
    } else {
      xmin = insets.left;
      ymin = insets.top;
      width = (width - (insets.left + insets.right)) | 0;
      height = (height - (insets.top + insets.bottom)) | 0;
    }
    if (image != null) {
      let dx = image.getWidth();
      let dy = image.getHeight();
      let xmax = (xmin + width) | 0;
      let ymax = (ymin + height) | 0;
      for (let x = xmin; x < xmax; x = (x + dx) | 0) {
        for (let y = ymin; y < ymax; y = (y + dy) | 0) {
          g.drawImage$Image$int$int$ImageObserver(image, x, y, null);
        }
      }
    } else {
      g.setColor(c.getBackground());
      g.fillRect(xmin, ymin, width, height);
    }
  }
  /**
   * Fill a rectangle with a texture image.
   *
   * @param g2d The {@code Graphics2D} used for painting the border.
   * @param img The {@code BufferedImage} to fill the texture.
   * @param x The x-component of the offset to start filling at.
   * @param y The y-component of the offset to start filling at.
   * @param width The width of the rectangle.
   * @param height The height of the rectangle.
   */
  static fillTexture(g2d: Graphics2D, img: BufferedImage, x: number, y: number, width: number, height: number): void {
    let anchor = new Rectangle()._Rectangle$int$int$int$int(x, y, img.getWidth(), img.getHeight());
    let oldPaint = g2d.getPaint();
    let paint = new TexturePaint()._TexturePaint(img, anchor);
    g2d.setPaint(paint);
    g2d.fillRect(x, y, width, height);
    g2d.setPaint(oldPaint);
  }
  /**
   * Creates a new image of the given size with the provided image centered.
   *
   * @param image The image to be drawn in the center (both vertically and horizontally) of
   *      the new image. 
   * @param size The size of the new image.
   * @return A new image.
   */
  static createCenteredImage$BufferedImage$Dimension(image: BufferedImage, size: Dimension): BufferedImage {
    return ImageUtils.createCenteredImage$BufferedImage$int$int(image, size.width_, size.height_);
  }
  /**
   * Creates a new image of the given size with the provided image centered.
   *
   * @param image The image to be drawn in the center (both vertically and horizontally) of
   *      the new image. 
   * @param width The width of the new image.
   * @param height The height of the new image.
   * @return A new image.
   */
  static createCenteredImage$BufferedImage$int$int(image: BufferedImage, width: number, height: number): BufferedImage {
    let x = $J.idiv(((width - image.getWidth(null)) | 0), 2);
    let y = $J.idiv(((height - image.getHeight(null)) | 0), 2);
    let centeredImage = ImageUtils.createBufferedImage$int$int(width, height);
    let g = centeredImage.createGraphics();
    g.drawImage$Image$int$int$ImageObserver(image, x, y, null);
    g.dispose();
    return centeredImage;
  }
  /**
   * Given a dimension with potential wildcard (non-positive) parts,
   * and a nominal dimension, use the nominal dimension to remove
   * any wildcard parts.
   *
   * @param d The {@code Dimension} to consider.
   * @param nominal The nominal {@code Dimension}.
   * @return The conformning wildcard-free {@code Dimension}.
   */
  static wildcardDimension(d: Dimension, nominal: Dimension): Dimension {
    let w = nominal.width_;
    let h = nominal.height_;
    let wNew = d.width_;
    let hNew = d.height_;
    if (wNew <= 0 && hNew <= 0) {
      return nominal;
    }
    if (wNew <= 0 || (hNew > 0 && Math.imul(wNew, h) > Math.imul(hNew, w))) {
      wNew = $J.idiv(((Math.imul(Math.imul(2, w), hNew) + (h + 1)) | 0), (Math.imul(2, h)));
    } else if (hNew <= 0 || Math.imul(wNew, h) < Math.imul(hNew, w)) {
      hNew = $J.idiv(((Math.imul(Math.imul(2, h), wNew) + (w + 1)) | 0), (Math.imul(2, w)));
    }
    return new Dimension()._Dimension$int$int(wNew, hNew);
  }
  /**
   * Create a faded version of an image.
   *
   * @param img The {@code Image} to fade.
   * @param fade The amount of fading.
   * @param target The offset.
   * @return The faded image.
   */
  static fadeImage(img: Image, fade: number, target: number): BufferedImage {
    let w = img.getWidth$ImageObserver(null);
    let h = img.getHeight$ImageObserver(null);
    let bi = ImageUtils.createBufferedImage$int$int(w, h);
    let g = bi.createGraphics();
    g.drawImage$Image$int$int$ImageObserver(img, 0, 0, null);
    let offset = Math.fround(target * (Math.fround(1 - fade)));
    let scales = [fade, fade, fade, 1];
    let offsets = [offset, offset, offset, 0];
    let rop = new RescaleOp()._RescaleOp$floatArr$floatArr$RenderingHints(scales, offsets, null);
    g.drawImage$BufferedImage$BufferedImageOp$int$int(bi, rop, 0, 0);
    g.dispose();
    return bi;
  }
  /**
   * Returns the result where the given mask has been applied to the given image.
   *
   * @param image The image.
   * @param mask The mask. Only the alpha channel from the mask is used.
   * @return An image with the opacity from the mask.
   */
  static imageWithAlphaFromMask(image: BufferedImage, mask: BufferedImage): BufferedImage {
    let result = ImageUtils.createBufferedImage$int$int(image.getWidth(), image.getHeight());
    let g2d = result.createGraphics();
    g2d.drawImage$Image$int$int$ImageObserver(image, 0, 0, null);
    g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.DST_IN, 1));
    g2d.drawImage$Image$int$int$ImageObserver(mask, 0, 0, null);
    g2d.dispose();
    return result;
  }
}

$J.define(ImageUtils, 'net.sf.freecol.common.util.ImageUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ImageUtils' }, meths: { 'createCenteredImage(java.awt.image.BufferedImage,int,int)': 'createCenteredImage$BufferedImage$int$int', 'createCenteredImage(java.awt.image.BufferedImage,java.awt.Dimension)': 'createCenteredImage$BufferedImage$Dimension', 'createResizedImage(java.awt.Image,int,int,boolean)': 'createResizedImage$Image$int$int$boolean', 'createResizedImage(java.awt.Image,int,int)': 'createResizedImage$Image$int$int', 'createBufferedImage(int,int)': 'createBufferedImage$int$int', 'createBufferedImage(java.awt.Image)': 'createBufferedImage$Image' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Dimension = $J.load('java.awt.Dimension');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Rectangle = $J.load('java.awt.Rectangle');
  RenderingHints = $J.load('java.awt.RenderingHints');
  TexturePaint = $J.load('java.awt.TexturePaint');
  Transparency = $J.load('java.awt.Transparency');
  ColorConvertOp = $J.load('java.awt.image.ColorConvertOp');
  RescaleOp = $J.load('java.awt.image.RescaleOp');
  ImageResource = $J.load('net.sf.freecol.common.resources.ImageResource');
});
