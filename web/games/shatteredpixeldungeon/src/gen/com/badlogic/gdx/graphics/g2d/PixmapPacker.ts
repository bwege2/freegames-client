// @ts-nocheck
// PixmapPacker.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*******************************************************************************
 * Copyright 2011 See AUTHORS file.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
import { $J, Arrays, Gdx, GdxRuntimeException, JObject, JString, Pattern, Pixmap, PixmapTextureData, Pixmap_Blending, Texture as Texture$lib } from '../../../../../../jre/index.ts';

let Color, TextureRegion, Array_, OrderedMap;

/**
 * Packs {@link Pixmap pixmaps} into one or more {@link Page pages} to generate an atlas of pixmap instances. Provides means to
 * directly convert the pixmap atlas to a {@link TextureAtlas}. The packer supports padding and border pixel duplication,
 * specified during construction. The packer supports incremental inserts and updates of TextureAtlases generated with this class.
 * How bin packing is performed can be customized via {@link PackStrategy}.
 * <p>
 * All methods can be called from any thread unless otherwise noted.
 * <p>
 * One-off usage:
 *
 * <pre>
 * // 512x512 pixel pages, RGB565 format, 2 pixels of padding, border duplication
 * PixmapPacker packer = new PixmapPacker(512, 512, Format.RGB565, 2, true);
 * packer.pack(&quot;First Pixmap&quot;, pixmap1);
 * packer.pack(&quot;Second Pixmap&quot;, pixmap2);
 * TextureAtlas atlas = packer.generateTextureAtlas(TextureFilter.Nearest, TextureFilter.Nearest, false);
 * packer.dispose();
 * // ...
 * atlas.dispose();
 * </pre>
 *
 * With this usage pattern, disposing the packer will not dispose any pixmaps used by the texture atlas. The texture atlas must
 * also be disposed when no longer needed.
 *
 * Incremental texture atlas usage:
 *
 * <pre>
 * // 512x512 pixel pages, RGB565 format, 2 pixels of padding, no border duplication
 * PixmapPacker packer = new PixmapPacker(512, 512, Format.RGB565, 2, false);
 * TextureAtlas atlas = new TextureAtlas();
 *
 * // potentially on a separate thread, e.g. downloading thumbnails
 * packer.pack(&quot;thumbnail&quot;, thumbnail);
 *
 * // on the rendering thread, every frame
 * packer.updateTextureAtlas(atlas, TextureFilter.Linear, TextureFilter.Linear, false);
 *
 * // once the atlas is no longer needed, make sure you get the final additions. This might
 * // be more elaborate depending on your threading model.
 * packer.updateTextureAtlas(atlas, TextureFilter.Linear, TextureFilter.Linear, false);
 * // ...
 * atlas.dispose();
 * </pre>
 *
 * Pixmap-only usage:
 *
 * <pre>
 * PixmapPacker packer = new PixmapPacker(512, 512, Format.RGB565, 2, true);
 * packer.pack(&quot;First Pixmap&quot;, pixmap1);
 * packer.pack(&quot;Second Pixmap&quot;, pixmap2);
 *
 * // do something interesting with the resulting pages
 * for (Page page : packer.getPages()) {
 * 	// ...
 * }
 *
 * packer.dispose();
 * </pre>
 *
 * @author mzechner
 * @author Nathan Sweet
 * @author Rob Rendell
 */
export class PixmapPacker extends JObject {
  packToTexture: boolean = false;
  disposed: boolean = false;
  pageWidth: number = 0;
  pageHeight: number = 0;
  pageFormat: Pixmap_Format = null;
  padding_: number = 0;
  duplicateBorder: boolean = false;
  stripWhitespaceX: boolean = false;
  stripWhitespaceY: boolean = false;
  alphaThreshold: number = 0;
  transparentColor: Color = null;
  pages: Array_<PixmapPacker$Page> = null;
  packStrategy: PixmapPacker$PackStrategy = null;
  static indexPattern: Pattern = null;
  c: Color = null;
  $init_PixmapPacker() {
    this.transparentColor = new Color()._Color$float$float$float$float(0, 0, 0, 0);
    this.pages = new Array_()._Array$();
    this.c = new Color()._Color$();
  }
  /**
   * Uses {@link GuillotineStrategy}.
   * @see PixmapPacker#PixmapPacker(int, int, Format, int, boolean, boolean, boolean, PackStrategy)
   */
  _PixmapPacker$int$int$Format$int$boolean(pageWidth: number, pageHeight: number, pageFormat: Pixmap_Format, padding: number, duplicateBorder: boolean): this {
    this._PixmapPacker$int$int$Format$int$boolean$boolean$boolean$PackStrategy(pageWidth, pageHeight, pageFormat, padding, duplicateBorder, false, false, new PixmapPacker$GuillotineStrategy()._PixmapPacker$GuillotineStrategy());
    return this;
  }
  /**
   * Uses {@link GuillotineStrategy}.
   * @see PixmapPacker#PixmapPacker(int, int, Format, int, boolean, boolean, boolean, PackStrategy)
   */
  _PixmapPacker$int$int$Format$int$boolean$PackStrategy(pageWidth: number, pageHeight: number, pageFormat: Pixmap_Format, padding: number, duplicateBorder: boolean, packStrategy: PixmapPacker$PackStrategy): this {
    this._PixmapPacker$int$int$Format$int$boolean$boolean$boolean$PackStrategy(pageWidth, pageHeight, pageFormat, padding, duplicateBorder, false, false, packStrategy);
    return this;
  }
  /**
   * Creates a new PixmapPacker which will insert all supplied pixmaps into one or more <code>pageWidth</code> by
   * <code>pageHeight</code> pixmaps using the specified strategy.
   * @param padding the number of blank pixels to insert between pixmaps.
   * @param duplicateBorder duplicate the border pixels of the inserted images to avoid seams when rendering with bi-linear
   *           filtering on.
   * @param stripWhitespaceX strip whitespace in x axis
   * @param stripWhitespaceY strip whitespace in y axis
   */
  _PixmapPacker$int$int$Format$int$boolean$boolean$boolean$PackStrategy(pageWidth: number, pageHeight: number, pageFormat: Pixmap_Format, padding: number, duplicateBorder: boolean, stripWhitespaceX: boolean, stripWhitespaceY: boolean, packStrategy: PixmapPacker$PackStrategy): this {
    this.$init_PixmapPacker();
    this.pageWidth = pageWidth;
    this.pageHeight = pageHeight;
    this.pageFormat = pageFormat;
    this.padding_ = padding;
    this.duplicateBorder = duplicateBorder;
    this.stripWhitespaceX = stripWhitespaceX;
    this.stripWhitespaceY = stripWhitespaceY;
    this.packStrategy = packStrategy;
    return this;
  }
  /**
   * Inserts the pixmap without a name. It cannot be looked up by name.
   * @see #pack(String, Pixmap)
   */
  pack$Pixmap(image: Pixmap): PixmapPacker$PixmapPackerRectangle {
    return this.pack$String$Pixmap(null, image);
  }
  /**
   * Inserts the pixmap. If name was not null, you can later retrieve the image's position in the output image via
   * {@link #getRect(String)}.
   * @param name If null, the image cannot be looked up by name.
   * @return Rectangle describing the area the pixmap was rendered to.
   * @throws GdxRuntimeException in case the image did not fit due to the page size being too small or providing a duplicate
   *            name.
   */
  pack$String$Pixmap(name: string, image: Pixmap): PixmapPacker$PixmapPackerRectangle {
    if (this.disposed) {
      return null;
    }
    if (name != null && this.getRect(name) != null) {
      throw new GdxRuntimeException('Pixmap has already been packed with name: ' + name);
    }
    let rect: PixmapPacker$PixmapPackerRectangle;
    let pixmapToDispose = null;
    if (name != null && name.endsWith('.9')) {
      rect = new PixmapPacker$PixmapPackerRectangle()._PixmapPacker$PixmapPackerRectangle$int$int$int$int(0, 0, (image.getWidth() - 2) | 0, (image.getHeight() - 2) | 0);
      pixmapToDispose = new Pixmap((image.getWidth() - 2) | 0, (image.getHeight() - 2) | 0, image.getFormat());
      pixmapToDispose.setBlending(Pixmap_Blending.None);
      rect.splits = this.getSplits(image);
      rect.pads = this.getPads(image, rect.splits);
      pixmapToDispose.drawPixmap(image, 0, 0, 1, 1, (image.getWidth() - 1) | 0, (image.getHeight() - 1) | 0);
      image = pixmapToDispose;
      name = JString.split(name, '\\.')[0];
    } else {
      if (this.stripWhitespaceX || this.stripWhitespaceY) {
        let originalWidth = image.getWidth();
        let originalHeight = image.getHeight();
        let top = 0;
        let bottom = image.getHeight();
        if (this.stripWhitespaceY) {
          outer:
          for (let y = 0; y < image.getHeight(); y++) {
            for (let x = 0; x < image.getWidth(); x++) {
              let pixel = image.getPixel(x, y);
              let alpha = ((pixel & 255));
              if (alpha > this.alphaThreshold) {
                break outer;
              }
            }
            top++;
          }
          outer:
          for (let y = image.getHeight(); --y >= top; ) {
            for (let x = 0; x < image.getWidth(); x++) {
              let pixel = image.getPixel(x, y);
              let alpha = ((pixel & 255));
              if (alpha > this.alphaThreshold) {
                break outer;
              }
            }
            bottom--;
          }
        }
        let left = 0;
        let right = image.getWidth();
        if (this.stripWhitespaceX) {
          outer:
          for (let x = 0; x < image.getWidth(); x++) {
            for (let y = top; y < bottom; y++) {
              let pixel = image.getPixel(x, y);
              let alpha = ((pixel & 255));
              if (alpha > this.alphaThreshold) {
                break outer;
              }
            }
            left++;
          }
          outer:
          for (let x = image.getWidth(); --x >= left; ) {
            for (let y = top; y < bottom; y++) {
              let pixel = image.getPixel(x, y);
              let alpha = ((pixel & 255));
              if (alpha > this.alphaThreshold) {
                break outer;
              }
            }
            right--;
          }
        }
        let newWidth = (right - left) | 0;
        let newHeight = (bottom - top) | 0;
        pixmapToDispose = new Pixmap(newWidth, newHeight, image.getFormat());
        pixmapToDispose.setBlending(Pixmap_Blending.None);
        pixmapToDispose.drawPixmap(image, 0, 0, left, top, newWidth, newHeight);
        image = pixmapToDispose;
        rect = new PixmapPacker$PixmapPackerRectangle()._PixmapPacker$PixmapPackerRectangle$int$int$int$int$int$int$int$int(0, 0, newWidth, newHeight, left, top, originalWidth, originalHeight);
      } else {
        rect = new PixmapPacker$PixmapPackerRectangle()._PixmapPacker$PixmapPackerRectangle$int$int$int$int(0, 0, image.getWidth(), image.getHeight());
      }
    }
    if (rect.getWidth() > this.pageWidth || rect.getHeight() > this.pageHeight) {
      if (name == null) {
        throw new GdxRuntimeException('Page size too small for pixmap.');
      }
      throw new GdxRuntimeException('Page size too small for pixmap: ' + name);
    }
    let page = this.packStrategy.pack(this, name, rect.bounds);
    if (name != null) {
      page.rects.put(name, rect);
      page.addedRects.add$Object(name);
    }
    let rectX = rect.getX();
    let rectY = rect.getY();
    let rectWidth = rect.getWidth();
    let rectHeight = rect.getHeight();
    if (this.packToTexture && !this.duplicateBorder && page.texture_ != null && !page.dirty) {
      page.texture_.bind();
      Gdx.gl.glTexSubImage2D(page.texture_.glTarget, 0, rectX, rectY, rectWidth, rectHeight, image.getGLFormat(), image.getGLType(), image.getPixels());
    } else {
      page.dirty = true;
    }
    page.image_.drawPixmap(image, rectX, rectY);
    if (this.duplicateBorder) {
      let imageWidth = image.getWidth();
      let imageHeight = image.getHeight();
      page.image_.drawPixmap(image, 0, 0, 1, 1, (rectX - 1) | 0, (rectY - 1) | 0, 1, 1);
      page.image_.drawPixmap(image, (imageWidth - 1) | 0, 0, 1, 1, (rectX + rectWidth) | 0, (rectY - 1) | 0, 1, 1);
      page.image_.drawPixmap(image, 0, (imageHeight - 1) | 0, 1, 1, (rectX - 1) | 0, (rectY + rectHeight) | 0, 1, 1);
      page.image_.drawPixmap(image, (imageWidth - 1) | 0, (imageHeight - 1) | 0, 1, 1, (rectX + rectWidth) | 0, (rectY + rectHeight) | 0, 1, 1);
      page.image_.drawPixmap(image, 0, 0, imageWidth, 1, rectX, (rectY - 1) | 0, rectWidth, 1);
      page.image_.drawPixmap(image, 0, (imageHeight - 1) | 0, imageWidth, 1, rectX, (rectY + rectHeight) | 0, rectWidth, 1);
      page.image_.drawPixmap(image, 0, 0, 1, imageHeight, (rectX - 1) | 0, rectY, 1, rectHeight);
      page.image_.drawPixmap(image, (imageWidth - 1) | 0, 0, 1, imageHeight, (rectX + rectWidth) | 0, rectY, 1, rectHeight);
    }
    if (pixmapToDispose != null) {
      pixmapToDispose.dispose();
    }
    rect.page = page;
    return rect;
  }
  /**
   * @return the {@link Page} instances created so far. If multiple threads are accessing the packer, iterating over the pages
   *         must be done only after synchronizing on the packer.
   */
  getPages(): Array_<PixmapPacker$Page> {
    return this.pages;
  }
  /**
   * @param name the name of the image
   * @return the rectangle for the image in the page it's stored in or null
   */
  getRect(name: string): PixmapPacker$PixmapPackerRectangle {
    for (const $it0 = this.pages.iterator(); $it0.hasNext(); ) {
      let page = $it0.next();
      let rect = page.rects.get$Object(name);
      if (rect != null) {
        return rect;
      }
    }
    return null;
  }
  /**
   * Disposes any pixmap pages which don't have a texture. Page pixmaps that have a texture will not be disposed until their
   * texture is disposed.
   */
  dispose(): void {
    for (const $it1 = this.pages.iterator(); $it1.hasNext(); ) {
      let page = $it1.next();
      if (page.texture_ == null) {
        page.image_.dispose();
      }
    }
    this.disposed = true;
  }
  /**
   * Calls {@link Page#updateTexture(TextureFilter, TextureFilter, boolean) updateTexture} for each page and adds a region to
   * the specified array for each page texture.
   */
  updateTextureRegions(regions: Array_<TextureRegion>, minFilter: Texture_TextureFilter, magFilter: Texture_TextureFilter, useMipMaps: boolean): void {
    this.updatePageTextures(minFilter, magFilter, useMipMaps);
    while (regions.size_ < this.pages.size_) {
      regions.add$Object(new TextureRegion()._TextureRegion$Texture(this.pages.get(regions.size_).texture_));
    }
  }
  /**
   * Calls {@link Page#updateTexture(TextureFilter, TextureFilter, boolean) updateTexture} for each page.
   */
  updatePageTextures(minFilter: Texture_TextureFilter, magFilter: Texture_TextureFilter, useMipMaps: boolean): void {
    for (const $it2 = this.pages.iterator(); $it2.hasNext(); ) {
      let page = $it2.next();
      page.updateTexture(minFilter, magFilter, useMipMaps);
    }
  }
  /**
   * If true, when a pixmap is packed to a page that has a texture, the portion of the texture where the pixmap was packed is
   * updated using glTexSubImage2D. Note if packing many pixmaps, this may be slower than reuploading the whole texture. This
   * setting is ignored if {@link #getDuplicateBorder()} is true.
   */
  setPackToTexture(packToTexture: boolean): void {
    this.packToTexture = packToTexture;
  }
  /**
   * @see PixmapPacker#setTransparentColor(Color color)
   */
  getTransparentColor(): Color {
    return this.transparentColor;
  }
  /**
   * Sets the default <code>color</code> of the whole {@link PixmapPacker.Page} when a new one created. Helps to avoid texture
   * bleeding or to highlight the page for debugging.
   * @see Page#Page(PixmapPacker packer)
   */
  setTransparentColor(color: Color): void {
    this.transparentColor.set$Color(color);
  }
  getSplits(raster: Pixmap): number[] {
    let startX = this.getSplitPoint(raster, 1, 0, true, true);
    let endX = this.getSplitPoint(raster, startX, 0, false, true);
    let startY = this.getSplitPoint(raster, 0, 1, true, false);
    let endY = this.getSplitPoint(raster, 0, startY, false, false);
    this.getSplitPoint(raster, (endX + 1) | 0, 0, true, true);
    this.getSplitPoint(raster, 0, (endY + 1) | 0, true, false);
    if (startX === 0 && endX === 0 && startY === 0 && endY === 0) {
      return null;
    }
    if (startX !== 0) {
      startX--;
      endX = (raster.getWidth() - 2 - (endX - 1)) | 0;
    } else {
      endX = (raster.getWidth() - 2) | 0;
    }
    if (startY !== 0) {
      startY--;
      endY = (raster.getHeight() - 2 - (endY - 1)) | 0;
    } else {
      endY = (raster.getHeight() - 2) | 0;
    }
    return [startX, endX, startY, endY];
  }
  getPads(raster: Pixmap, splits: number[]): number[] {
    let bottom = (raster.getHeight() - 1) | 0;
    let right = (raster.getWidth() - 1) | 0;
    let startX = this.getSplitPoint(raster, 1, bottom, true, true);
    let startY = this.getSplitPoint(raster, right, 1, true, false);
    let endX = 0;
    let endY = 0;
    if (startX !== 0) {
      endX = this.getSplitPoint(raster, (startX + 1) | 0, bottom, false, true);
    }
    if (startY !== 0) {
      endY = this.getSplitPoint(raster, right, (startY + 1) | 0, false, false);
    }
    this.getSplitPoint(raster, (endX + 1) | 0, bottom, true, true);
    this.getSplitPoint(raster, right, (endY + 1) | 0, true, false);
    if (startX === 0 && endX === 0 && startY === 0 && endY === 0) {
      return null;
    }
    if (startX === 0 && endX === 0) {
      startX = -1;
      endX = -1;
    } else {
      if (startX > 0) {
        startX--;
        endX = (raster.getWidth() - 2 - (endX - 1)) | 0;
      } else {
        endX = (raster.getWidth() - 2) | 0;
      }
    }
    if (startY === 0 && endY === 0) {
      startY = -1;
      endY = -1;
    } else {
      if (startY > 0) {
        startY--;
        endY = (raster.getHeight() - 2 - (endY - 1)) | 0;
      } else {
        endY = (raster.getHeight() - 2) | 0;
      }
    }
    let pads = [startX, endX, startY, endY];
    if (splits != null && Arrays.equals(pads, splits)) {
      return null;
    }
    return pads;
  }
  getSplitPoint(raster: Pixmap, startX: number, startY: number, startPoint: boolean, xAxis: boolean): number {
    let rgba = $J.newArray(4, 0);
    let next = xAxis ? startX : startY;
    let end = xAxis ? raster.getWidth() : raster.getHeight();
    let breakA = startPoint ? 255 : 0;
    let x = startX;
    let y = startY;
    while (next !== end) {
      if (xAxis) {
        x = next;
      } else {
        y = next;
      }
      let colint = raster.getPixel(x, y);
      this.c.set$int(colint);
      rgba[0] = $J.d2i((Math.fround(this.c.r * 255)));
      rgba[1] = $J.d2i((Math.fround(this.c.g * 255)));
      rgba[2] = $J.d2i((Math.fround(this.c.b * 255)));
      rgba[3] = $J.d2i((Math.fround(this.c.a * 255)));
      if (rgba[3] === breakA) {
        return next;
      }
      if (!startPoint && (rgba[0] !== 0 || rgba[1] !== 0 || rgba[2] !== 0 || rgba[3] !== 255)) {
        $J.out.println(x + '  ' + y + ' ' + $J.str(rgba) + ' ');
      }
      next++;
    }
    return 0;
  }
  static $clinit() {
    PixmapPacker.indexPattern = Pattern.compile('(.+)_(\\d+)$');
  }
}

/**
 * @author mzechner
 * @author Nathan Sweet
 * @author Rob Rendell
 */
export class PixmapPacker$Page extends JObject {
  rects: OrderedMap<string, PixmapPacker$PixmapPackerRectangle> = null;
  image_: Pixmap = null;
  texture_: Texture = null;
  addedRects: Array_<string> = null;
  dirty: boolean = false;
  /**
   * Creates a new page filled with the color provided by the {@link PixmapPacker#getTransparentColor()}
   */
  _PixmapPacker$Page(packer: PixmapPacker): this {
    this.rects = new OrderedMap()._OrderedMap$();
    this.addedRects = new Array_()._Array$();
    this.image_ = new Pixmap(packer.pageWidth, packer.pageHeight, packer.pageFormat);
    this.image_.setBlending(Pixmap_Blending.None);
    this.image_.setColor(packer.getTransparentColor());
    this.image_.fill();
    return this;
  }
  /**
   * Returns the texture for this page, or null if the texture has not been created.
   * @see #updateTexture(TextureFilter, TextureFilter, boolean)
   */
  getTexture(): Texture {
    return this.texture_;
  }
  /**
   * Creates the texture if it has not been created, else reuploads the entire page pixmap to the texture if the pixmap has
   * changed since this method was last called.
   * @return true if the texture was created or reuploaded.
   */
  updateTexture(minFilter: Texture_TextureFilter, magFilter: Texture_TextureFilter, useMipMaps: boolean): boolean {
    if (this.texture_ != null) {
      if (!this.dirty) {
        return false;
      }
      this.texture_.load(this.texture_.getTextureData());
    } else {
      this.texture_ = new (PixmapPacker$Page$1())().$o(this)._Texture(new PixmapTextureData(this.image_, this.image_.getFormat(), useMipMaps, false, true));
      this.texture_.setFilter(minFilter, magFilter);
    }
    this.dirty = false;
    return true;
  }
}

/**
 * Choose the page and location for each rectangle.
 * @author Nathan Sweet
 */
export class PixmapPacker$PackStrategy {
}

/**
 * Does bin packing by inserting to the right or below previously packed rectangles. This is good at packing arbitrarily sized
 * images.
 * @author mzechner
 * @author Nathan Sweet
 * @author Rob Rendell
 */
export class PixmapPacker$GuillotineStrategy extends JObject {
  comparator: Comparator<Pixmap> = null;
  _PixmapPacker$GuillotineStrategy(): this {
    return this;
  }
  pack(packer: PixmapPacker, name: string, bounds: PixmapPacker$Bounds): PixmapPacker$Page {
    let page: PixmapPacker$GuillotineStrategy$GuillotinePage;
    if (packer.pages.size_ === 0) {
      page = new PixmapPacker$GuillotineStrategy$GuillotinePage()._PixmapPacker$GuillotineStrategy$GuillotinePage(packer);
      packer.pages.add$Object(page);
    } else {
      page = packer.pages.peek();
    }
    let padding = packer.padding_;
    bounds.width_ = (bounds.width_ + padding) | 0;
    bounds.height_ = (bounds.height_ + padding) | 0;
    let node = this.insert(page.root, bounds);
    if (node == null) {
      page = new PixmapPacker$GuillotineStrategy$GuillotinePage()._PixmapPacker$GuillotineStrategy$GuillotinePage(packer);
      packer.pages.add$Object(page);
      node = this.insert(page.root, bounds);
    }
    node.full = true;
    bounds.set(node.rect.x, node.rect.y, (node.rect.width_ - padding) | 0, (node.rect.height_ - padding) | 0);
    return page;
  }
  insert(node: PixmapPacker$GuillotineStrategy$Node, rect: PixmapPacker$Bounds): PixmapPacker$GuillotineStrategy$Node {
    if (!node.full && node.leftChild != null && node.rightChild != null) {
      let newNode = this.insert(node.leftChild, rect);
      if (newNode == null) {
        newNode = this.insert(node.rightChild, rect);
      }
      return newNode;
    } else {
      if (node.full) {
        return null;
      }
      if (node.rect.width_ === rect.width_ && node.rect.height_ === rect.height_) {
        return node;
      }
      if (node.rect.width_ < rect.width_ || node.rect.height_ < rect.height_) {
        return null;
      }
      node.leftChild = new PixmapPacker$GuillotineStrategy$Node()._PixmapPacker$GuillotineStrategy$Node();
      node.rightChild = new PixmapPacker$GuillotineStrategy$Node()._PixmapPacker$GuillotineStrategy$Node();
      let deltaWidth = (node.rect.width_ - rect.width_) | 0;
      let deltaHeight = (node.rect.height_ - rect.height_) | 0;
      if (deltaWidth > deltaHeight) {
        node.leftChild.rect.x = node.rect.x;
        node.leftChild.rect.y = node.rect.y;
        node.leftChild.rect.width_ = rect.width_;
        node.leftChild.rect.height_ = node.rect.height_;
        node.rightChild.rect.x = (node.rect.x + rect.width_) | 0;
        node.rightChild.rect.y = node.rect.y;
        node.rightChild.rect.width_ = (node.rect.width_ - rect.width_) | 0;
        node.rightChild.rect.height_ = node.rect.height_;
      } else {
        node.leftChild.rect.x = node.rect.x;
        node.leftChild.rect.y = node.rect.y;
        node.leftChild.rect.width_ = node.rect.width_;
        node.leftChild.rect.height_ = rect.height_;
        node.rightChild.rect.x = node.rect.x;
        node.rightChild.rect.y = (node.rect.y + rect.height_) | 0;
        node.rightChild.rect.width_ = node.rect.width_;
        node.rightChild.rect.height_ = (node.rect.height_ - rect.height_) | 0;
      }
      return this.insert(node.leftChild, rect);
    }
  }
}

export class PixmapPacker$GuillotineStrategy$Node extends JObject {
  leftChild: PixmapPacker$GuillotineStrategy$Node = null;
  rightChild: PixmapPacker$GuillotineStrategy$Node = null;
  rect: PixmapPacker$Bounds = null;
  full: boolean = false;
  _PixmapPacker$GuillotineStrategy$Node(): this {
    this.rect = new PixmapPacker$Bounds()._PixmapPacker$Bounds$();
    return this;
  }
}

export class PixmapPacker$GuillotineStrategy$GuillotinePage extends PixmapPacker$Page {
  root: PixmapPacker$GuillotineStrategy$Node = null;
  _PixmapPacker$GuillotineStrategy$GuillotinePage(packer: PixmapPacker): this {
    this._PixmapPacker$Page(packer);
    this.root = new PixmapPacker$GuillotineStrategy$Node()._PixmapPacker$GuillotineStrategy$Node();
    this.root.rect.x = packer.padding_;
    this.root.rect.y = packer.padding_;
    this.root.rect.width_ = (packer.pageWidth - Math.imul(packer.padding_, 2)) | 0;
    this.root.rect.height_ = (packer.pageHeight - Math.imul(packer.padding_, 2)) | 0;
    return this;
  }
}

/**
 * Does bin packing by inserting in rows. This is good at packing images that have similar heights.
 * @author Nathan Sweet
 */
export class PixmapPacker$SkylineStrategy extends JObject {
  comparator: Comparator<Pixmap> = null;
  _PixmapPacker$SkylineStrategy(): this {
    return this;
  }
  pack(packer: PixmapPacker, name: string, rect: PixmapPacker$Bounds): PixmapPacker$Page {
    let padding = packer.padding_;
    let pageWidth = (packer.pageWidth - Math.imul(padding, 2)) | 0;
    let pageHeight = (packer.pageHeight - Math.imul(padding, 2)) | 0;
    let rectWidth = (rect.width_ + padding) | 0;
    let rectHeight = (rect.height_ + padding) | 0;
    for (let i = 0, n = packer.pages.size_; i < n; i++) {
      let page = packer.pages.get(i);
      let bestRow = null;
      for (let ii = 0, nn = (page.rows.size_ - 1) | 0; ii < nn; ii++) {
        let row = page.rows.get(ii);
        if (((row.x + rectWidth) | 0) >= pageWidth) {
          continue;
        }
        if (((row.y + rectHeight) | 0) >= pageHeight) {
          continue;
        }
        if (rectHeight > row.height_) {
          continue;
        }
        if (bestRow == null || row.height_ < bestRow.height_) {
          bestRow = row;
        }
      }
      if (bestRow == null) {
        let row = page.rows.peek();
        if (((row.y + rectHeight) | 0) >= pageHeight) {
          continue;
        }
        if (((row.x + rectWidth) | 0) < pageWidth) {
          row.height_ = Math.max(row.height_, rectHeight);
          bestRow = row;
        } else if (((row.y + row.height_ + rectHeight) | 0) < pageHeight) {
          bestRow = new PixmapPacker$SkylineStrategy$SkylinePage$Row()._PixmapPacker$SkylineStrategy$SkylinePage$Row();
          bestRow.y = (row.y + row.height_) | 0;
          bestRow.height_ = rectHeight;
          page.rows.add$Object(bestRow);
        }
      }
      if (bestRow != null) {
        rect.x = bestRow.x;
        rect.y = bestRow.y;
        bestRow.x = (bestRow.x + rectWidth) | 0;
        return page;
      }
    }
    let page = new PixmapPacker$SkylineStrategy$SkylinePage()._PixmapPacker$SkylineStrategy$SkylinePage(packer);
    packer.pages.add$Object(page);
    let row = new PixmapPacker$SkylineStrategy$SkylinePage$Row()._PixmapPacker$SkylineStrategy$SkylinePage$Row();
    row.x = (padding + rectWidth) | 0;
    row.y = padding;
    row.height_ = rectHeight;
    page.rows.add$Object(row);
    rect.x = padding;
    rect.y = padding;
    return page;
  }
}

export class PixmapPacker$SkylineStrategy$SkylinePage extends PixmapPacker$Page {
  rows: Array_<PixmapPacker$SkylineStrategy$SkylinePage$Row> = null;
  _PixmapPacker$SkylineStrategy$SkylinePage(packer: PixmapPacker): this {
    this._PixmapPacker$Page(packer);
    this.rows = new Array_()._Array$();
    return this;
  }
}

export class PixmapPacker$SkylineStrategy$SkylinePage$Row extends JObject {
  x: number = 0;
  y: number = 0;
  height_: number = 0;
  _PixmapPacker$SkylineStrategy$SkylinePage$Row(): this {
    return this;
  }
}

export class PixmapPacker$Bounds extends JObject {
  x: number = 0;
  y: number = 0;
  width_: number = 0;
  height_: number = 0;
  _PixmapPacker$Bounds$(): this {
    return this;
  }
  _PixmapPacker$Bounds$int$int$int$int(x: number, y: number, width: number, height: number): this {
    this.x = x;
    this.y = y;
    this.width_ = width;
    this.height_ = height;
    return this;
  }
  set(x: number, y: number, width: number, height: number): void {
    this.x = x;
    this.y = y;
    this.width_ = width;
    this.height_ = height;
  }
}

export class PixmapPacker$PixmapPackerRectangle extends JObject {
  page: PixmapPacker$Page = null;
  splits: number[] = null;
  pads: number[] = null;
  offsetX_: number = 0;
  offsetY_: number = 0;
  originalWidth: number = 0;
  originalHeight: number = 0;
  bounds: PixmapPacker$Bounds = null;
  _PixmapPacker$PixmapPackerRectangle$int$int$int$int(x: number, y: number, width: number, height: number): this {
    this.bounds = new PixmapPacker$Bounds()._PixmapPacker$Bounds$int$int$int$int(x, y, width, height);
    this.offsetX_ = 0;
    this.offsetY_ = 0;
    this.originalWidth = width;
    this.originalHeight = height;
    return this;
  }
  _PixmapPacker$PixmapPackerRectangle$int$int$int$int$int$int$int$int(x: number, y: number, width: number, height: number, left: number, top: number, originalWidth: number, originalHeight: number): this {
    this.bounds = new PixmapPacker$Bounds()._PixmapPacker$Bounds$int$int$int$int(x, y, width, height);
    this.offsetX_ = left;
    this.offsetY_ = top;
    this.originalWidth = originalWidth;
    this.originalHeight = originalHeight;
    return this;
  }
  getX(): number {
    return this.bounds.x;
  }
  getY(): number {
    return this.bounds.y;
  }
  getWidth(): number {
    return this.bounds.width_;
  }
  getHeight(): number {
    return this.bounds.height_;
  }
}

let $PixmapPacker$Page$1: any = null;
/** An anonymous class (PixmapPacker.java:502). */
function PixmapPacker$Page$1(): any {
  return $PixmapPacker$Page$1 ??= $J.local(class extends Texture$lib {
    dispose(): void {
      super.dispose();
      this.$outer.image_.dispose();
    }
  }, 'com.badlogic.gdx.graphics.g2d.PixmapPacker$Page$1', []);
}

$J.define(PixmapPacker, 'com.badlogic.gdx.graphics.g2d.PixmapPacker', { kind: 'class', ifaces: ['com.badlogic.gdx.utils.Disposable'], sup: 'java.lang.Object', ctors: { 'int,int,com.badlogic.gdx.graphics.Pixmap$Format,int,boolean,boolean,boolean,com.badlogic.gdx.graphics.g2d.PixmapPacker$PackStrategy': '_PixmapPacker$int$int$Format$int$boolean$boolean$boolean$PackStrategy', 'int,int,com.badlogic.gdx.graphics.Pixmap$Format,int,boolean,com.badlogic.gdx.graphics.g2d.PixmapPacker$PackStrategy': '_PixmapPacker$int$int$Format$int$boolean$PackStrategy', 'int,int,com.badlogic.gdx.graphics.Pixmap$Format,int,boolean': '_PixmapPacker$int$int$Format$int$boolean' }, meths: { 'updateTextureAtlas(com.badlogic.gdx.graphics.g2d.TextureAtlas,com.badlogic.gdx.graphics.Texture$TextureFilter,com.badlogic.gdx.graphics.Texture$TextureFilter,boolean,boolean)': 'updateTextureAtlas$TextureAtlas$TextureFilter$TextureFilter$boolean$boolean', 'updateTextureAtlas(com.badlogic.gdx.graphics.g2d.TextureAtlas,com.badlogic.gdx.graphics.Texture$TextureFilter,com.badlogic.gdx.graphics.Texture$TextureFilter,boolean)': 'updateTextureAtlas$TextureAtlas$TextureFilter$TextureFilter$boolean', 'pack(java.lang.String,com.badlogic.gdx.graphics.Pixmap)': 'pack$String$Pixmap', 'pack(com.badlogic.gdx.graphics.Pixmap)': 'pack$Pixmap' }, clinit: true, lazy: ['indexPattern'] });
$J.define(PixmapPacker$Page, 'com.badlogic.gdx.graphics.g2d.PixmapPacker$Page', { kind: 'class', sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.graphics.g2d.PixmapPacker': '_PixmapPacker$Page' } });
$J.define(PixmapPacker$PackStrategy, 'com.badlogic.gdx.graphics.g2d.PixmapPacker$PackStrategy', { kind: 'interface' });
$J.define(PixmapPacker$GuillotineStrategy, 'com.badlogic.gdx.graphics.g2d.PixmapPacker$GuillotineStrategy', { kind: 'class', ifaces: ['com.badlogic.gdx.graphics.g2d.PixmapPacker$PackStrategy'], sup: 'java.lang.Object', ctors: { '': '_PixmapPacker$GuillotineStrategy' } });
$J.define(PixmapPacker$GuillotineStrategy$Node, 'com.badlogic.gdx.graphics.g2d.PixmapPacker$GuillotineStrategy$Node', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_PixmapPacker$GuillotineStrategy$Node' } });
$J.define(PixmapPacker$GuillotineStrategy$GuillotinePage, 'com.badlogic.gdx.graphics.g2d.PixmapPacker$GuillotineStrategy$GuillotinePage', { kind: 'class', sup: 'com.badlogic.gdx.graphics.g2d.PixmapPacker$Page', ctors: { 'com.badlogic.gdx.graphics.g2d.PixmapPacker': '_PixmapPacker$GuillotineStrategy$GuillotinePage' } });
$J.define(PixmapPacker$SkylineStrategy, 'com.badlogic.gdx.graphics.g2d.PixmapPacker$SkylineStrategy', { kind: 'class', ifaces: ['com.badlogic.gdx.graphics.g2d.PixmapPacker$PackStrategy'], sup: 'java.lang.Object', ctors: { '': '_PixmapPacker$SkylineStrategy' } });
$J.define(PixmapPacker$SkylineStrategy$SkylinePage, 'com.badlogic.gdx.graphics.g2d.PixmapPacker$SkylineStrategy$SkylinePage', { kind: 'class', sup: 'com.badlogic.gdx.graphics.g2d.PixmapPacker$Page', ctors: { 'com.badlogic.gdx.graphics.g2d.PixmapPacker': '_PixmapPacker$SkylineStrategy$SkylinePage' } });
$J.define(PixmapPacker$SkylineStrategy$SkylinePage$Row, 'com.badlogic.gdx.graphics.g2d.PixmapPacker$SkylineStrategy$SkylinePage$Row', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_PixmapPacker$SkylineStrategy$SkylinePage$Row' } });
$J.define(PixmapPacker$Bounds, 'com.badlogic.gdx.graphics.g2d.PixmapPacker$Bounds', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int,int,int': '_PixmapPacker$Bounds$int$int$int$int', '': '_PixmapPacker$Bounds$' } });
$J.define(PixmapPacker$PixmapPackerRectangle, 'com.badlogic.gdx.graphics.g2d.PixmapPacker$PixmapPackerRectangle', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int,int,int,int,int,int,int': '_PixmapPacker$PixmapPackerRectangle$int$int$int$int$int$int$int$int', 'int,int,int,int': '_PixmapPacker$PixmapPackerRectangle$int$int$int$int' } });
$J.module(() => {
  Color = $J.load('com.badlogic.gdx.graphics.Color');
  TextureRegion = $J.load('com.badlogic.gdx.graphics.g2d.TextureRegion');
  Array_ = $J.load('com.badlogic.gdx.utils.Array');
  OrderedMap = $J.load('com.badlogic.gdx.utils.OrderedMap');
});
