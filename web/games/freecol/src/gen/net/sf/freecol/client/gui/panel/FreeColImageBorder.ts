// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/FreeColImageBorder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { AbstractBorder } from '../../../../../../javax/swing/border/AbstractBorder.ts';

let Dimension, Insets, Rectangle, ResourceManager, ImageUtils;

/**
 * A border created from a set of images.
 */
export class FreeColImageBorder extends AbstractBorder {
  static borders: List<FreeColImageBorder> = null;
  static panelWithoutShadowBorder: FreeColImageBorder = null;
  static panelBorder: FreeColImageBorder = null;
  static buttonBorder: FreeColImageBorder = null;
  static simpleButtonBorder: FreeColImageBorder = null;
  static menuBarBorder: FreeColImageBorder = null;
  static woodenPanelBorder: FreeColImageBorder = null;
  static colonyWarehouseBorder: FreeColImageBorder = null;
  static colonyPanelBorder: FreeColImageBorder = null;
  static innerColonyPanelBorder: FreeColImageBorder = null;
  static outerColonyPanelBorder: FreeColImageBorder = null;
  static scaleFactor: number = 0;
  /**
   * The key used for getting the image resources.
   */
  baseKey: string = null;
  /**
   * If true, no scaling to the border is applied.
   */
  noScaling: boolean = false;
  initialized: boolean = false;
  /**
   * NW-corner
   */
  topLeftCornerImage: BufferedImage = null;
  /**
   * NNW
   */
  topStartImage: BufferedImage = null;
  /**
   * N-border
   */
  topImage: BufferedImage = null;
  /**
   * NNE
   */
  topEndImage: BufferedImage = null;
  /**
   * NE-corner
   */
  topRightCornerImage: BufferedImage = null;
  /**
   * ENE
   */
  rightStartImage: BufferedImage = null;
  /**
   * E-border
   */
  rightImage: BufferedImage = null;
  /**
   * ESE
   */
  rightEndImage: BufferedImage = null;
  /**
   * SE-corner
   */
  bottomRightCornerImage: BufferedImage = null;
  /**
   * SSE
   */
  bottomEndImage: BufferedImage = null;
  /**
   * S-border
   */
  bottomImage: BufferedImage = null;
  /**
   * SSW
   */
  bottomStartImage: BufferedImage = null;
  /**
   * SW-corner
   */
  bottomLeftCornerImage: BufferedImage = null;
  /**
   * WSW
   */
  leftEndImage: BufferedImage = null;
  /**
   * W-border
   */
  leftImage: BufferedImage = null;
  /**
   * WNW
   */
  leftStartImage: BufferedImage = null;
  $init_FreeColImageBorder() {
    this.initialized = false;
  }
  _FreeColImageBorder$String(baseKey: string): this {
    this._FreeColImageBorder$String$boolean(baseKey, false);
    return this;
  }
  _FreeColImageBorder$String$boolean(baseKey: string, noScaling: boolean): this {
    this._AbstractBorder();
    this.$init_FreeColImageBorder();
    this.baseKey = baseKey;
    this.noScaling = noScaling;
    this.loadImages$$FreeColImageBorder();
    FreeColImageBorder.borders.add(this);
    return this;
  }
  ensureInitialized(): void {
    if (!this.initialized) {
      this.loadImages$$FreeColImageBorder();
    }
  }
  loadImages$$FreeColImageBorder(): void {
    this.loadImages$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$FreeColImageBorder(this.getImage(this.baseKey + '.nw'), this.getImage(this.baseKey + '.nnw'), this.getImage(this.baseKey + '.n'), this.getImage(this.baseKey + '.nne'), this.getImage(this.baseKey + '.ne'), this.getImage(this.baseKey + '.ene'), this.getImage(this.baseKey + '.e'), this.getImage(this.baseKey + '.ese'), this.getImage(this.baseKey + '.se'), this.getImage(this.baseKey + '.sse'), this.getImage(this.baseKey + '.s'), this.getImage(this.baseKey + '.ssw'), this.getImage(this.baseKey + '.sw'), this.getImage(this.baseKey + '.wsw'), this.getImage(this.baseKey + '.w'), this.getImage(this.baseKey + '.wnw'));
    this.initialized = true;
  }
  /**
   * Loads the images for the border.
   *
   * @param topLeftCornerImage NW-corner
   * @param topImage N-border
   * @param topRightCornerImage NE-corner
   * @param rightImage E-border
   * @param bottomRightCornerImage SE-corner
   * @param bottomImage S-border
   * @param bottomLeftCornerImage SW-corner
   * @param leftImage W-border
   */
  loadImages$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$FreeColImageBorder(topLeftCornerImage: BufferedImage, topStartImage: BufferedImage, topImage: BufferedImage, topEndImage: BufferedImage, topRightCornerImage: BufferedImage, rightStartImage: BufferedImage, rightImage: BufferedImage, rightEndImage: BufferedImage, bottomRightCornerImage: BufferedImage, bottomEndImage: BufferedImage, bottomImage: BufferedImage, bottomStartImage: BufferedImage, bottomLeftCornerImage: BufferedImage, leftEndImage: BufferedImage, leftImage: BufferedImage, leftStartImage: BufferedImage): void {
    this.topLeftCornerImage = topLeftCornerImage;
    this.topStartImage = topStartImage;
    this.topImage = topImage;
    this.topEndImage = topEndImage;
    this.topRightCornerImage = topRightCornerImage;
    this.rightStartImage = rightStartImage;
    this.rightImage = rightImage;
    this.rightEndImage = rightEndImage;
    this.bottomRightCornerImage = bottomRightCornerImage;
    this.bottomEndImage = bottomEndImage;
    this.bottomImage = bottomImage;
    this.bottomStartImage = bottomStartImage;
    this.bottomLeftCornerImage = bottomLeftCornerImage;
    this.leftEndImage = leftEndImage;
    this.leftImage = leftImage;
    this.leftStartImage = leftStartImage;
  }
  static setScaleFactor(scaleFactor: number): void {
    FreeColImageBorder.scaleFactor = scaleFactor;
    FreeColImageBorder.reloadAllImages();
  }
  static reloadAllImages(): void {
    FreeColImageBorder.borders.stream().forEach(($p0) => $p0.loadImages$$FreeColImageBorder());
  }
  getImage(key: string): BufferedImage {
    let ir = ResourceManager.getImageResource(key, false);
    if (ir == null) {
      return null;
    }
    let image = ir.getImage$();
    if (this.noScaling) {
      return image;
    }
    let scaledDimensions = new Dimension()._Dimension$int$int($J.roundf(Math.fround(image.getWidth() * FreeColImageBorder.scaleFactor)), $J.roundf(Math.fround(image.getHeight() * FreeColImageBorder.scaleFactor)));
    return ir.getImage$Dimension$boolean(scaledDimensions, false);
  }
  /**
   * Gets the insets of this border around the given component.
   *
   * @param c The {@code Component} having the border.
   * @return The {@code Insets}.
   */
  getBorderInsets$Component(c: Component): Insets {
    this.ensureInitialized();
    return this.getBorderInsets$Component$Insets(c, null);
  }
  /**
   * Returns spaces that are open on this border.
   *
   * @param c The component having the border.
   * @return A list of areas that can be considered out-of-bounds for this border.
   */
  getOpenSpace(c: Component): List<Rectangle> {
    this.ensureInitialized();
    let openSpace = new ArrayList();
    if (this.topStartImage != null && this.topStartImage.getHeight() < this.max([FreeColImageBorder.getHeight(this.topImage), FreeColImageBorder.getHeight(this.topEndImage)])) {
      let openSpaceHeight = (this.max([FreeColImageBorder.getHeight(this.topImage), FreeColImageBorder.getHeight(this.topEndImage)]) - this.topStartImage.getHeight()) | 0;
      openSpace.add(new Rectangle()._Rectangle$int$int$int$int(0, 0, this.topStartImage.getWidth(), openSpaceHeight));
    }
    if (this.topImage != null && this.topImage.getHeight() < this.max([FreeColImageBorder.getHeight(this.topStartImage), FreeColImageBorder.getHeight(this.topEndImage)])) {
      let openSpaceHeight = (this.max([FreeColImageBorder.getHeight(this.topStartImage), FreeColImageBorder.getHeight(this.topEndImage)]) - this.topImage.getHeight()) | 0;
      let x = FreeColImageBorder.getWidth(this.topStartImage);
      let width = (c.getWidth() - FreeColImageBorder.getWidth(this.topStartImage) - FreeColImageBorder.getWidth(this.topEndImage)) | 0;
      openSpace.add(new Rectangle()._Rectangle$int$int$int$int(x, 0, width, openSpaceHeight));
    }
    if (this.topEndImage != null && this.topEndImage.getHeight() < this.max([FreeColImageBorder.getHeight(this.topStartImage), FreeColImageBorder.getHeight(this.topImage)])) {
      let openSpaceHeight = (this.max([FreeColImageBorder.getHeight(this.topStartImage), FreeColImageBorder.getHeight(this.topImage)]) - this.topEndImage.getHeight()) | 0;
      openSpace.add(new Rectangle()._Rectangle$int$int$int$int((c.getWidth() - this.topEndImage.getWidth()) | 0, 0, this.topEndImage.getWidth(), openSpaceHeight));
    }
    return openSpace;
  }
  /**
   * Determines the inset of the top left corner.
   */
  getTopLeftCornerInsetY(): number {
    let top = this.max([FreeColImageBorder.getHeight(this.topImage), FreeColImageBorder.getHeight(this.topStartImage), FreeColImageBorder.getHeight(this.topEndImage), FreeColImageBorder.getHeight(this.topLeftCornerImage), FreeColImageBorder.getHeight(this.topRightCornerImage)]);
    return (top - FreeColImageBorder.getHeight(this.topLeftCornerImage)) | 0;
  }
  /**
   * Gets the insets of this border around the given component.
   *
   * @param c The {@code Component} having the border.
   * @param insets An instance of {@code Insets} to be updated.
   * @return The given instance of {@code Insets} if not
   *      {@code null}, or a new instance otherwise.
   */
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    this.ensureInitialized();
    let top = this.max([FreeColImageBorder.getHeight(this.topImage), FreeColImageBorder.getHeight(this.topStartImage), FreeColImageBorder.getHeight(this.topEndImage), FreeColImageBorder.getHeight(this.topLeftCornerImage), FreeColImageBorder.getHeight(this.topRightCornerImage)]);
    let left = this.max([FreeColImageBorder.getWidth(this.leftImage), FreeColImageBorder.getWidth(this.leftStartImage), FreeColImageBorder.getWidth(this.leftEndImage), FreeColImageBorder.getWidth(this.topLeftCornerImage), FreeColImageBorder.getWidth(this.bottomLeftCornerImage)]);
    let bottom = this.max([FreeColImageBorder.getHeight(this.bottomImage), FreeColImageBorder.getHeight(this.bottomStartImage), FreeColImageBorder.getHeight(this.bottomEndImage), FreeColImageBorder.getHeight(this.bottomLeftCornerImage), FreeColImageBorder.getHeight(this.bottomRightCornerImage)]);
    let right = this.max([FreeColImageBorder.getWidth(this.rightImage), FreeColImageBorder.getWidth(this.rightStartImage), FreeColImageBorder.getWidth(this.rightEndImage), FreeColImageBorder.getWidth(this.topRightCornerImage), FreeColImageBorder.getWidth(this.bottomRightCornerImage)]);
    if (this.topImage == null) {
      top = 0;
    }
    if (this.leftImage == null) {
      left = 0;
    }
    if (this.bottomImage == null) {
      bottom = 0;
    }
    if (this.rightImage == null) {
      right = 0;
    }
    if (insets == null) {
      return new Insets()._Insets(top, left, bottom, right);
    } else {
      insets.top = top;
      insets.left = left;
      insets.bottom = bottom;
      insets.right = right;
      return insets;
    }
  }
  max(numbers: number[]): number {
    let highest = -2147483648;
    for (let i of numbers) {
      if (i > highest) {
        highest = i;
      }
    }
    return highest;
  }
  /**
   * Paints the border on the given component.
   *
   * @param c The {@code Component} to draw the border on.
   * @param g The {@code Graphics} used for painting the border.
   * @param x The x-component of the offset.
   * @param y The y-component of the offset.
   * @param width The width of the border.
   * @param height The height of the border.
   */
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    this.ensureInitialized();
    let insets = this.getBorderInsets$Component(c);
    let g2 = g;
    let topHeight = FreeColImageBorder.getHeight(this.topImage);
    let leftWidth = FreeColImageBorder.getWidth(this.leftImage);
    let bottomHeight = FreeColImageBorder.getHeight(this.bottomImage);
    let rightWidth = FreeColImageBorder.getWidth(this.rightImage);
    let topStartWidth = FreeColImageBorder.getWidth(this.topStartImage);
    let topStartHeight = FreeColImageBorder.getHeight(this.topStartImage);
    let topEndWidth = FreeColImageBorder.getWidth(this.topEndImage);
    let topEndHeight = FreeColImageBorder.getHeight(this.topEndImage);
    let leftStartWidth = FreeColImageBorder.getWidth(this.leftStartImage);
    let leftStartHeight = FreeColImageBorder.getHeight(this.leftStartImage);
    let leftEndWidth = FreeColImageBorder.getWidth(this.leftEndImage);
    let leftEndHeight = FreeColImageBorder.getHeight(this.leftEndImage);
    let bottomStartWidth = FreeColImageBorder.getWidth(this.bottomStartImage);
    let bottomStartHeight = FreeColImageBorder.getHeight(this.bottomStartImage);
    let bottomEndWidth = FreeColImageBorder.getWidth(this.bottomEndImage);
    let bottomEndHeight = FreeColImageBorder.getHeight(this.bottomEndImage);
    let rightStartWidth = FreeColImageBorder.getWidth(this.rightStartImage);
    let rightStartHeight = FreeColImageBorder.getHeight(this.rightStartImage);
    let rightEndWidth = FreeColImageBorder.getWidth(this.rightEndImage);
    let rightEndHeight = FreeColImageBorder.getHeight(this.rightEndImage);
    let topLeftCornerWidth = FreeColImageBorder.getWidth(this.topLeftCornerImage);
    let topLeftCornerHeight = FreeColImageBorder.getHeight(this.topLeftCornerImage);
    let topRightCornerWidth = FreeColImageBorder.getWidth(this.topRightCornerImage);
    let topRightCornerHeight = FreeColImageBorder.getHeight(this.topRightCornerImage);
    let bottomLeftCornerWidth = FreeColImageBorder.getWidth(this.bottomLeftCornerImage);
    let bottomLeftCornerHeight = FreeColImageBorder.getHeight(this.bottomLeftCornerImage);
    let bottomRightCornerWidth = FreeColImageBorder.getWidth(this.bottomRightCornerImage);
    let bottomRightCornerHeight = FreeColImageBorder.getHeight(this.bottomRightCornerImage);
    if (this.topStartImage != null) {
      let w = Math.min(topStartWidth, (width - topLeftCornerWidth - topRightCornerWidth) | 0);
      ImageUtils.fillTexture(g2, this.topStartImage, (x + topLeftCornerWidth) | 0, (y + insets.top - topStartHeight) | 0, w, topStartHeight);
    }
    if (this.topImage != null) {
      ImageUtils.fillTexture(g2, this.topImage, (x + topLeftCornerWidth + topStartWidth) | 0, (y + insets.top - topHeight) | 0, (width - topLeftCornerWidth - topRightCornerWidth - topStartWidth - topEndWidth) | 0, topHeight);
    }
    if (this.topEndImage != null) {
      let w = Math.min(topEndWidth, (width - topLeftCornerWidth - topRightCornerWidth - topStartWidth) | 0);
      ImageUtils.fillTexture(g2, this.topEndImage, (x + width - Math.max(insets.right, topRightCornerWidth) - w) | 0, (y + insets.top - topEndHeight) | 0, w, topEndHeight);
    }
    if (this.leftStartImage != null) {
      let h = Math.min(leftStartHeight, (height - Math.max(insets.top, topLeftCornerHeight) - bottomLeftCornerHeight) | 0);
      ImageUtils.fillTexture(g2, this.leftStartImage, (x + insets.left - leftStartWidth) | 0, (y + Math.max(insets.top, topLeftCornerHeight)) | 0, leftStartWidth, h);
    }
    if (this.leftImage != null) {
      ImageUtils.fillTexture(g2, this.leftImage, (x + insets.left - leftWidth) | 0, (y + Math.max(insets.top, topLeftCornerHeight) + leftStartHeight) | 0, leftWidth, (height - Math.max(insets.top, topLeftCornerHeight) - Math.max(insets.bottom, bottomLeftCornerHeight) - leftStartHeight - leftEndHeight) | 0);
    }
    if (this.leftEndImage != null) {
      let h = Math.min(leftEndHeight, (height - topLeftCornerHeight - bottomLeftCornerHeight - leftStartHeight) | 0);
      ImageUtils.fillTexture(g2, this.leftEndImage, (x + insets.left - leftEndWidth) | 0, (y + height - Math.max(insets.bottom, bottomLeftCornerHeight) - h) | 0, leftEndWidth, h);
    }
    if (this.bottomStartImage != null) {
      let w = Math.min(bottomStartWidth, (width - bottomLeftCornerWidth - bottomRightCornerWidth) | 0);
      ImageUtils.fillTexture(g2, this.bottomStartImage, (x + bottomLeftCornerWidth) | 0, (y + height - insets.bottom) | 0, w, bottomStartHeight);
    }
    if (this.bottomImage != null) {
      ImageUtils.fillTexture(g2, this.bottomImage, (x + bottomLeftCornerWidth + bottomStartWidth) | 0, (y + height - insets.bottom) | 0, (width - bottomLeftCornerWidth - bottomRightCornerWidth - bottomStartWidth - bottomEndWidth) | 0, bottomHeight);
    }
    if (this.bottomEndImage != null) {
      let w = Math.min(bottomEndWidth, (width - bottomLeftCornerWidth - bottomRightCornerWidth - bottomStartWidth) | 0);
      ImageUtils.fillTexture(g2, this.bottomEndImage, (x + width - Math.max(insets.right, bottomRightCornerWidth) - w) | 0, (y + height - insets.bottom) | 0, w, bottomEndHeight);
    }
    if (this.rightStartImage != null) {
      let h = Math.min(rightStartHeight, (height - Math.max(insets.top, topRightCornerHeight) - bottomRightCornerHeight) | 0);
      ImageUtils.fillTexture(g2, this.rightStartImage, (x + width - insets.right) | 0, (y + Math.max(insets.top, topRightCornerHeight)) | 0, rightStartWidth, h);
    }
    if (this.rightImage != null) {
      ImageUtils.fillTexture(g2, this.rightImage, (x + width - insets.right) | 0, (y + Math.max(insets.top, topRightCornerHeight) + rightStartHeight) | 0, rightWidth, (height - Math.max(insets.top, topRightCornerHeight) - bottomRightCornerHeight - rightStartHeight - rightEndHeight) | 0);
    }
    if (this.rightEndImage != null) {
      let h = Math.min(rightEndHeight, (height - topRightCornerHeight - bottomRightCornerHeight - rightStartHeight) | 0);
      ImageUtils.fillTexture(g2, this.rightEndImage, (x + width - insets.right) | 0, (y + height - Math.max(insets.bottom, bottomRightCornerHeight) - h) | 0, rightEndWidth, h);
    }
    if (this.topLeftCornerImage != null) {
      ImageUtils.fillTexture(g2, this.topLeftCornerImage, (x + Math.max(insets.left, topLeftCornerWidth) - topLeftCornerWidth) | 0, (y + Math.max(insets.top, topLeftCornerHeight) - topLeftCornerHeight) | 0, topLeftCornerWidth, topLeftCornerHeight);
    }
    if (this.topRightCornerImage != null) {
      ImageUtils.fillTexture(g2, this.topRightCornerImage, (x + width - Math.max(insets.right, topRightCornerWidth)) | 0, (y + Math.max(insets.top, topRightCornerHeight) - topRightCornerHeight) | 0, topRightCornerWidth, topRightCornerHeight);
    }
    if (this.bottomLeftCornerImage != null) {
      ImageUtils.fillTexture(g2, this.bottomLeftCornerImage, (x + Math.max(insets.left, bottomLeftCornerWidth) - bottomLeftCornerWidth) | 0, (y + height - Math.max(insets.bottom, bottomLeftCornerHeight)) | 0, bottomLeftCornerWidth, bottomLeftCornerHeight);
    }
    if (this.bottomRightCornerImage != null) {
      ImageUtils.fillTexture(g2, this.bottomRightCornerImage, (x + width - Math.max(insets.right, bottomRightCornerWidth)) | 0, (y + height - Math.max(insets.bottom, bottomRightCornerHeight)) | 0, bottomRightCornerWidth, bottomRightCornerHeight);
    }
  }
  /**
   * Get the height of an image. If image is null, return 0.
   * @param im The image.
   * @return The height of the image.
   */
  static getHeight(im: Image): number {
    return (im == null) ? 0 : im.getHeight$ImageObserver(null);
  }
  /**
   * Get the width of an image. If image is null, return 0.
   * @param im The image.
   * @return The width of the image.
   */
  static getWidth(im: Image): number {
    return (im == null) ? 0 : im.getWidth$ImageObserver(null);
  }
  static $clinit() {
    FreeColImageBorder.borders = new ArrayList();
    FreeColImageBorder.panelWithoutShadowBorder = new FreeColImageBorder()._FreeColImageBorder$String('image.border.panel.noshadow');
    FreeColImageBorder.panelBorder = new FreeColImageBorder()._FreeColImageBorder$String('image.border.panel');
    FreeColImageBorder.buttonBorder = new FreeColImageBorder()._FreeColImageBorder$String('image.border.button');
    FreeColImageBorder.simpleButtonBorder = new FreeColImageBorder()._FreeColImageBorder$String('image.border.button.simple');
    FreeColImageBorder.menuBarBorder = new FreeColImageBorder()._FreeColImageBorder$String('image.border.menu');
    FreeColImageBorder.woodenPanelBorder = new FreeColImageBorder()._FreeColImageBorder$String('image.border.wooden');
    FreeColImageBorder.colonyWarehouseBorder = new FreeColImageBorder()._FreeColImageBorder$String('image.border.colonyWarehouse');
    FreeColImageBorder.colonyPanelBorder = new FreeColImageBorder()._FreeColImageBorder$String('image.border.colony.panel');
    FreeColImageBorder.innerColonyPanelBorder = new FreeColImageBorder()._FreeColImageBorder$String('image.border.colony.panel.inner');
    FreeColImageBorder.outerColonyPanelBorder = new FreeColImageBorder()._FreeColImageBorder$String('image.border.colony.panel.outer');
    FreeColImageBorder.scaleFactor = 1;
  }
}

$J.define(FreeColImageBorder, 'net.sf.freecol.client.gui.panel.FreeColImageBorder', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.FreeColBorder'], sup: 'javax.swing.border.AbstractBorder', ctors: { 'java.lang.String,boolean': '_FreeColImageBorder$String$boolean', 'java.lang.String': '_FreeColImageBorder$String' }, returns: { 'getTopLeftCornerInsetY': 'int' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets', 'getBorderInsets(java.awt.Component)': 'getBorderInsets$Component', 'loadImages(java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage,java.awt.image.BufferedImage)': 'loadImages$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$BufferedImage$FreeColImageBorder', 'loadImages()': 'loadImages$$FreeColImageBorder' }, clinit: true, lazy: ['borders', 'panelWithoutShadowBorder', 'panelBorder', 'buttonBorder', 'simpleButtonBorder', 'menuBarBorder', 'woodenPanelBorder', 'colonyWarehouseBorder', 'colonyPanelBorder', 'innerColonyPanelBorder', 'outerColonyPanelBorder', 'scaleFactor'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Insets = $J.load('java.awt.Insets');
  Rectangle = $J.load('java.awt.Rectangle');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
