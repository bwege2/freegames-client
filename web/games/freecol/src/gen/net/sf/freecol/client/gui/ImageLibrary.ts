// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/ImageLibrary.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collectors, Exception, HashMap, JEnum, JObject, JString, Logger, Toolkit } from '../../../../../../jre/index.ts';

let Color, Cursor, Dimension, Point, RenderingHints, ImageIcon, JLabel, FontLibrary, ImageCreators, Ability, BuildingType, Colony, GoodsType, IndianSettlement, LostCityRumour, Nation, ResourceType, Role, Settlement, TileType, Unit$UnitState, UnitType, ImageCache, ResourceManager, CollectionUtils, ImageUtils, StringUtils;

/**
 * Holds various images that can be called upon by others in order to display
 * certain things.
 */
export class ImageLibrary extends JObject {
  static logger: Logger = null;
  /**
   * Canonical sizes of images GUI elements and map are expecting
   * and current image files have.
   * ICON_SIZE, TILE_SIZE, TILE_OVERLAY_SIZE and TILE_FOREST_SIZE constants
   * are used in this way already, allowing them to tolerate changing sizes
   * in the files.
   * Most other images are currently still shown in a size of image size
   * times scaling factor times requested size.
   */
  static ICON_SIZE: Dimension = null;
  /**
   * Canonical sizes of images GUI elements and map are expecting
   * and current image files have.
   * ICON_SIZE, TILE_SIZE, TILE_OVERLAY_SIZE and TILE_FOREST_SIZE constants
   * are used in this way already, allowing them to tolerate changing sizes
   * in the files.
   * Most other images are currently still shown in a size of image size
   * times scaling factor times requested size.
   */
  static BUILDING_SIZE: Dimension = null;
  /**
   * Canonical sizes of images GUI elements and map are expecting
   * and current image files have.
   * ICON_SIZE, TILE_SIZE, TILE_OVERLAY_SIZE and TILE_FOREST_SIZE constants
   * are used in this way already, allowing them to tolerate changing sizes
   * in the files.
   * Most other images are currently still shown in a size of image size
   * times scaling factor times requested size.
   */
  static TILE_SIZE: Dimension = null;
  /**
   * Canonical sizes of images GUI elements and map are expecting
   * and current image files have.
   * ICON_SIZE, TILE_SIZE, TILE_OVERLAY_SIZE and TILE_FOREST_SIZE constants
   * are used in this way already, allowing them to tolerate changing sizes
   * in the files.
   * Most other images are currently still shown in a size of image size
   * times scaling factor times requested size.
   */
  static TILE_OVERLAY_SIZE: Dimension = null;
  /**
   * Canonical sizes of images GUI elements and map are expecting
   * and current image files have.
   * ICON_SIZE, TILE_SIZE, TILE_OVERLAY_SIZE and TILE_FOREST_SIZE constants
   * are used in this way already, allowing them to tolerate changing sizes
   * in the files.
   * Most other images are currently still shown in a size of image size
   * times scaling factor times requested size.
   */
  static TILE_FOREST_SIZE: Dimension = null;
  /**
   * Constants for the current "named" scales (tiny, smaller, small) plus
   * a trivial value for unscaled.
   */
  static readonly TINY_SCALE: number = 0.25;
  /**
   * Constants for the current "named" scales (tiny, smaller, small) plus
   * a trivial value for unscaled.
   */
  static readonly SMALLER_SCALE: number = 0.5;
  /**
   * Constants for the current "named" scales (tiny, smaller, small) plus
   * a trivial value for unscaled.
   */
  static readonly SMALL_SCALE: number = 0.75;
  /**
   * Constants for the current "named" scales (tiny, smaller, small) plus
   * a trivial value for unscaled.
   */
  static readonly NORMAL_SCALE: number = 1;
  /**
   * Constants for the current "named" scales (tiny, smaller, small) plus
   * a trivial value for unscaled.
   */
  static readonly MIN_SCALE: number = 0.25;
  /**
   * Constants for the current "named" scales (tiny, smaller, small) plus
   * a trivial value for unscaled.
   */
  static readonly MAX_SCALE: number = 4;
  /**
   * Constants for the current "named" scales (tiny, smaller, small) plus
   * a trivial value for unscaled.
   */
  static readonly SCALE_STEP: number = 0.25;
  static readonly DELETE: string = 'image.miscicon.delete';
  static readonly PLOWED: string = 'image.tile.model.improvement.plow';
  static readonly UNIT_SELECT: string = 'image.tile.unitSelect';
  static readonly TILE_SELECT: string = 'image.tile.tileSelect';
  static readonly TILE_TAKEN: string = 'image.tile.tileTaken';
  static readonly TILE_OWNED_BY_INDIANS: string = 'image.tileitem.nativeLand';
  static readonly LOST_CITY_RUMOUR: string = 'image.tileitem.lostCityRumour';
  static readonly DARKNESS: string = 'image.halo.dark';
  static readonly ICON_LOCK: string = 'image.icon.lock';
  static readonly ICON_COIN: string = 'image.icon.coin';
  static readonly BELLS: string = 'image.icon.model.goods.bells';
  static RIVER_STYLE_PREFIX: string = null;
  /**
   * The action button key prefixes.
   */
  static buttonKeys: List<string> = null;
  /**
   * The scale factor used when creating this library.  The value
   * {@code 1} is used if this object is not a result of a scaling
   * operation.
   */
  scaleFactor: number = 0;
  /**
   * Fixed tile dimensions.
   */
  tileSize: Dimension = null;
  /**
   * Fixed tile dimensions.
   */
  tileOverlaySize: Dimension = null;
  /**
   * Fixed tile dimensions.
   */
  tileForestSize: Dimension = null;
  /**
   * Cache for images.
   */
  imageCache: ImageCache = null;
  /**
   * Cache for the string images.
   */
  stringImageCache: JMap<string, BufferedImage> = null;
  imageCreators: ImageCreators = null;
  /**
   * The constructor to use for an unscaled {@code ImageLibrary}.
   *
   * @param imageCache An {@code ImageCache} to hold images..
   */
  _ImageLibrary$ImageCache(imageCache: ImageCache): this {
    this._ImageLibrary$float$ImageCache(ImageLibrary.NORMAL_SCALE, imageCache);
    return this;
  }
  /**
   * The constructor to use for a scaled {@code ImageLibrary}.
   *
   * Please avoid using too many different scaling factors, as this will
   * lead to wasted memory for caching images in ResourceManager!
   * Currently, 0.25, 0.5, ..., 2.0 are used for the map. Colony tiles and
   * the GUI use 1.0 here (maybe also 1.25, 1.5, 1.75 and 2.0 in future),
   * but this gets multiplied for tiny 0.25(rarely, candidate for removal),
   * smaller 0.5, small 0.75 and normal 1.0 image retrieval methods.
   *
   * @param scaleFactor The factor used when scaling. 2 is twice
   *      the size of the original images and 0.5 is half
   * @param imageCache An {@code ImageCache} to hold images..
   */
  _ImageLibrary$float$ImageCache(scaleFactor: number, imageCache: ImageCache): this {
    this.changeScaleFactor(scaleFactor);
    this.imageCache = imageCache;
    this.imageCreators = new ImageCreators()._ImageCreators(this, imageCache);
    return this;
  }
  /**
   * Get the scaling factor used when creating this {@code ImageLibrary}.
   *
   * It is 1f if the constructor without scaling factor was used to create
   * this object.
   *
   * @return The scaling factor of this ImageLibrary.
   */
  getScaleFactor(): number {
    return this.scaleFactor;
  }
  /**
   * Change the scale factor for this image library.
   *
   * All the other variables depend on the scale factor.
   *
   * @param scaleFactor The factor used when scaling. 2 is twice
   */
  changeScaleFactor(scaleFactor: number): void {
    this.scaleFactor = scaleFactor;
    this.tileSize = this.scale$Dimension(ImageLibrary.TILE_SIZE);
    this.tileOverlaySize = this.scale$Dimension(ImageLibrary.TILE_OVERLAY_SIZE);
    this.tileForestSize = this.scale$Dimension(ImageLibrary.TILE_FOREST_SIZE);
    this.stringImageCache = new HashMap();
  }
  /**
   * Scale a pixel distance the current internal scale.
   *
   * @param n The pixels to scale.
   * @return The scaled pixels.
   */
  scaleInt(n: number): number {
    return $J.d2i((Math.fround(n * this.scaleFactor)));
  }
  /**
   * Scale a dimension with the current internal scale.
   *
   * @param size The {@code Dimension} to scale.
   * @return The scaled {@code Dimension}.
   */
  scale$Dimension(size: Dimension): Dimension {
    return ImageLibrary.scaleDimension(size, this.scaleFactor);
  }
  /**
   * Scale a dimension with the current internal scale and an extra override.
   *
   * @param size The {@code Dimension} to scale.
   * @param extraFactor An extra scaling.
   * @return The scaled {@code Dimension}.
   */
  scale$Dimension$float(size: Dimension, extraFactor: number): Dimension {
    return ImageLibrary.scaleDimension(size, Math.fround(this.scaleFactor * extraFactor));
  }
  /**
   * Absolute dimenion scaling helper routine.
   *
   * @param size The {@code Dimension} to scale.
   * @param scaleFactor The scale to use.
   * @return The scaled {@code Dimension}.
   */
  static scaleDimension(size: Dimension, scaleFactor: number): Dimension {
    return new Dimension()._Dimension$int$int($J.roundf(Math.fround(size.width_ * scaleFactor)), $J.roundf(Math.fround(size.height_ * scaleFactor)));
  }
  /**
   * Get the scaled size of a tile.
   *
   * @return The tile size.
   */
  getTileSize(): Dimension {
    return this.tileSize;
  }
  /**
   * Get the scaled size of a forested tile.
   *
   * @return The forested tile size.
   */
  getForestedTileSize(): Dimension {
    return this.tileForestSize;
  }
  /**
   * Calculates a seed for reliably generating the same "random" number.
   *
   * This is useful to select different images for the same tile
   * type in order to prevent big stripes or a checker-board effect.
   *
   * @param x The tile x coordinate.
   * @param y The tile y coordinate.
   * @return The seed.
   */
  static variationSeedUsing(x: number, y: number): number {
    return (Math.imul(x, 6841) + Math.imul(y, 7919)) | 0;
  }
  static getSZA(key: string, scale: number): SimpleZippedAnimation {
    return (ResourceManager.getSZAResource(key, false) == null) ? null : ResourceManager.getSZA$String$float(key, scale);
  }
  /**
   * Derive a suitable foreground color from a background color.
   *
   * Our eyes have different sensitivity towards red, green and
   * blue.  We want a foreground color with the inverse brightness.
   *
   * @param background The background {@code Color} to complement.
   * @return A suitable foreground {@code Color}.
   */
  static makeForegroundColor(background: Color): Color {
    return (background == null || (background.getRed() * 0.3 + background.getGreen() * 0.59 + background.getBlue() * 0.11 >= 126)) ? Color.BLACK : Color.WHITE;
  }
  /**
   * Derive a string border color from the string color.  Black
   * unless the color of the string is really dark.
   *
   * @param color The {@code Color} to complement.
   * @return A suitable border {@code Color}.
   */
  static makeStringBorderColor(color: Color): Color {
    return (color.getRed() * 0.3 + color.getGreen() * 0.59 + color.getBlue() * 0.11 < 10) ? Color.WHITE : Color.BLACK;
  }
  /**
   * Get a color.
   *
   * @param key The color name.
   * @return The {@code Color} found by the resource manager.
   */
  static getColor$String(key: string): Color {
    return ImageLibrary.getColor$String$Color(key, null);
  }
  /**
   * Get a color.
   *
   * @param key The color name.
   * @param replacement A replacement {@code Color} to use if the named color
   *     can not be found by the resource manager.
   * @return The {@code Color} found by the resource manager.
   */
  static getColor$String$Color(key: string, replacement: Color): Color {
    return ResourceManager.getColor(key, replacement);
  }
  /**
   * Get a foreground color for a given goods type and amount in a
   * given location.
   *
   * @param goodsType The {@code GoodsType} to use.
   * @param amount The amount of goods.
   * @param location The {@code Location} for the goods.
   * @param whiteForeground If the color should be white (or bright) so that
   *     it works on a black background.
   * @return A suitable {@code Color}.
   */
  static getGoodsColor(goodsType: GoodsType, amount: number, location: Location, whiteForeground: boolean): Color {
    let foreground = (whiteForeground) ? 'whiteForeground' : 'foreground';
    let prefix = 'color.' + foreground + '.GoodsLabel.';
    let key = (!goodsType.limitIgnored() && location instanceof Colony && (location).getWarehouseCapacity() < amount) ? prefix + 'capacityExceeded' : (location instanceof Colony && goodsType.isStorable() && (location).getExportData$GoodsType(goodsType).getExported()) ? prefix + 'exported' : (amount === 0) ? prefix + 'zeroAmount' : (amount < 0) ? prefix + 'negativeAmount' : prefix + 'positiveAmount';
    if (whiteForeground) {
      return ImageLibrary.getColor$String$Color(key, Color.WHITE);
    }
    return ImageLibrary.getColor$String$Color(key, Color.BLACK);
  }
  static getMinimapBackgroundColor(): Color {
    return ImageLibrary.getColor$String('color.background.MiniMap');
  }
  static getMinimapBorderColor(): Color {
    return ImageLibrary.getColor$String('color.border.MiniMap');
  }
  static getMinimapEconomicColor(type$: TileType): Color {
    let key = 'color.economic.MiniMap.' + type$.getId();
    return ImageLibrary.getColor$String(key);
  }
  static getMinimapPoliticsColor(type$: TileType): Color {
    let key = 'color.politics.MiniMap.' + type$.getId();
    return ImageLibrary.getColor$String(key);
  }
  /**
   * Get the road color.
   *
   * @return The road color.
   */
  static getRoadColor(): Color {
    return ImageLibrary.getColor$String('color.map.road');
  }
  /**
   * Get a scaled font with a simple text specification.
   *
   * The <code>Font</code> is scaled with the scaleFactor from this
   * <code>ImageLibrary</code> instead of the global scaleFactor in
   * {@link FontLibrary}.
   *
   * This method is meant to be used for font that should scale
   * perfectly with the graphics, for example text on the map.
   *
   * @param spec The font specification.
   * @param text Optional text that the font must be able to represent.
   * @return The {@code Font} found.
   */
  getScaledFont(spec: string, text: string): Font {
    return FontLibrary.getScaledFont$String$float$String(spec, this.scaleFactor, text);
  }
  /**
   * Just get an image without any scaling.
   *
   * Note, that this routine and its callers can be static, but anything
   * that is scaled or sized goes through the image cache and thus can
   * not be static.
   *
   * @param key The image key.
   * @return The image found.
   */
  static getUnscaledImage(key: string): BufferedImage {
    return ResourceManager.getImage$String(key);
  }
  /**
   * Get the image for the given identifier, using the current scaling.
   *
   * @param key The image key.
   * @return The {@code BufferedImage} found by the {@code ResourceManager}.
   */
  getScaledImage(key: string): BufferedImage {
    return this.imageCache.getScaledImage(key, this.scaleFactor, false);
  }
  getRangedTargetCrosshair(): BufferedImage {
    return this.getScaledImage('image.rangedTarget');
  }
  /**
   * Get the image for the given identifier, using a given size.
   *
   * @param key The image key.
   * @param size The image size required.
   * @return The {@code BufferedImage} found by the {@code ResourceManager}.
   */
  getSizedImage(key: string, size: Dimension): BufferedImage {
    return this.imageCache.getSizedImage$String$Dimension$boolean(key, size, false);
  }
  static getButtonBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColButton');
  }
  /**
   * Get the button images for a given key.
   *
   * @param key The key to look up.
   * @return The list of button images found.
   */
  getButtonImages(key: string): List<BufferedImage> {
    let ret = new ArrayList();
    for (const $it0 = ImageLibrary.buttonKeys.iterator(); $it0.hasNext(); ) {
      let base = $it0.next();
      let k = base + key;
      let image = this.imageCache.getScaledImage(k, this.scaleFactor, false);
      if (image != null) {
        ret.add(image);
      }
    }
    return ret;
  }
  static getBrightPanelBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColBrightPanel');
  }
  static getCanvasBackgroundImage(): BufferedImage {
    let key = 'image.flavor.Canvas.map';
    return (ResourceManager.getImageResource(key, false) == null) ? null : ImageLibrary.getUnscaledImage(key);
  }
  getColopediaCellImage(expanded: boolean): BufferedImage {
    let key = 'image.icon.Colopedia.' + ((expanded) ? 'open' : 'closed') + 'Section';
    return this.getScaledImage(key);
  }
  getColopediaConceptImage(): BufferedImage {
    return this.getScaledImage('image.icon.Colopedia.idea');
  }
  static getColorCellRendererBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.ColorCellRenderer');
  }
  getCompassRose(): JLabel {
    return new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(this.getScaledImage('image.skin.compass')));
  }
  /**
   * Get the standard cursor.
   *
   * @return A suitable default {@code Cursor}.
   */
  static getCursor(): Cursor {
    let key = 'image.icon.cursor.go';
    if (ResourceManager.getImageResource(key, false) != null) {
      let im = ImageLibrary.getUnscaledImage(key);
      return Toolkit.getDefaultToolkit().createCustomCursor(im, new Point()._Point$int$int($J.idiv(im.getWidth$ImageObserver(null), 2), $J.idiv(im.getHeight$ImageObserver(null), 2)), 'go');
    }
    return Cursor.getPredefinedCursor(Cursor.HAND_CURSOR);
  }
  /**
   * Returns the portrait of this Founding Father.
   *
   * @param father The {@code FoundingFather} to look for.
   * @param grayscale True if the image should be grayscale.
   * @return The {@code BufferedImage} found.
   */
  getFoundingFatherImage(father: FoundingFather, grayscale: boolean): BufferedImage {
    let key = 'image.flavor.' + father.getId();
    return this.imageCache.getScaledImage(key, this.scaleFactor, grayscale);
  }
  getInformationPanelSkin(player: Player): BufferedImage {
    let key = this.determineInformationPanelSkinKey(player);
    return this.getScaledImage(key);
  }
  determineInformationPanelSkinKey(player: Player): string {
    let key = (player == null) ? 'image.skin.InformationPanel' : (player.isRebel()) ? 'image.skin.InformationPanel.rebel' : 'image.skin.InformationPanel.' + player.getNationResourceKey();
    if (ResourceManager.getImageResource(key, false) == null) {
      key = 'image.skin.InformationPanel';
    }
    return key;
  }
  getInformationPanelSkinTopInset(player: Player): number {
    let key = this.determineInformationPanelSkinKey(player) + '.insets.top';
    let s = ResourceManager.getStringResource(key, false);
    return (s != null) ? $J.parseInt(s.getString()) : 0;
  }
  getLCRImage(size: Dimension): BufferedImage {
    return this.imageCache.getSizedImage$String$Dimension$boolean(ImageLibrary.LOST_CITY_RUMOUR, size, false);
  }
  getLibertyImage(): BufferedImage {
    return this.imageCache.getSizedImage$String$Dimension$boolean(ImageLibrary.BELLS, this.scale$Dimension(ImageLibrary.ICON_SIZE), false);
  }
  static getListBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColList');
  }
  getLockLabel(): JLabel {
    let img = this.imageCache.getScaledImage(ImageLibrary.ICON_LOCK, Math.fround(this.scaleFactor * ImageLibrary.SMALLER_SCALE), false);
    return new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(img));
  }
  static getMeetingImage(meet: Player): BufferedImage {
    let base = 'image.flavor.event.meeting.';
    let key = base + meet.getNationResourceKey();
    if (ResourceManager.getImageResource(key, false) == null) {
      key = base + 'natives';
    }
    return ImageLibrary.getUnscaledImage(key);
  }
  static getMenuBarBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColMenuBar');
  }
  static getMenuBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColMenu');
  }
  static getMiniMapBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.MiniMap');
  }
  getMiniMapSkin(): BufferedImage {
    let key = 'image.skin.MiniMap';
    return this.imageCache.getScaledImage(key, this.scaleFactor, false);
  }
  /**
   * Get the appropriate BufferedImage for a FreeColObject.
   *
   * @param display The {@code FreeColObject} to display.
   * @param size The image size.
   * @return The appropriate {@code BufferedImage}.
   */
  getObjectImageInternal(display: FreeColObject, size: Dimension): BufferedImage {
    let derived = display.getDisplayObject();
    let image = (derived instanceof BuildingType) ? this.getBuildingTypeImage$BuildingType$Dimension(derived, size) : (derived instanceof GoodsType) ? this.getGoodsTypeImage(derived, size) : (derived instanceof LostCityRumour) ? this.getLCRImage(size) : (derived instanceof Nation) ? this.getNationImage$Nation$Dimension(derived, size) : (derived instanceof ResourceType) ? this.getResourceTypeImage$ResourceType$Dimension$boolean(derived, size, false) : (derived instanceof Settlement) ? this.getSettlementImage$Settlement$Dimension(derived, size) : (derived instanceof TileType) ? this.getTerrainImage(derived, 0, 0, size) : (derived instanceof UnitType) ? this.getUnitTypeImage$UnitType$Dimension$ImageLibrary(derived, size) : null;
    if (image == null) {
      ImageLibrary.logger.warning('Could not find image for ' + $J.str(display));
      return null;
    }
    return image;
  }
  /**
   * Get the appropriate BufferedImage for a FreeColObject.
   *
   * Please use a more specific method!
   *
   * @param display The {@code FreeColObject} to display.
   * @return The appropriate {@code BufferedImage}.
   */
  getObjectImage$FreeColObject(display: FreeColObject): BufferedImage {
    return this.getObjectImageInternal(display, this.scale$Dimension(ImageLibrary.ICON_SIZE));
  }
  /**
   * Get the appropriate BufferedImage for a FreeColObject.
   *
   * Please use a more specific method!
   *
   * @param display The {@code FreeColObject} to display.
   * @param size The image size.
   * @return The appropriate {@code BufferedImage}.
   */
  getObjectImage$FreeColObject$Dimension(display: FreeColObject, size: Dimension): BufferedImage {
    return this.getObjectImageInternal(display, size);
  }
  /**
   * Get an ImageIcon for a FreeColObject.
   *
   * @param display The {@code FreeColObject} to find an icon for.
   * @return The {@code ImageIcon} found.
   */
  getObjectImageIcon(display: FreeColObject): ImageIcon {
    if (display == null) {
      return null;
    }
    let image = this.getObjectImage$FreeColObject$Dimension(display, this.scale$Dimension$float(ImageLibrary.ICON_SIZE, 2));
    return (image == null) ? null : new ImageIcon()._ImageIcon$Image(image);
  }
  static getOptionPaneBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColOptionPane');
  }
  /**
   * Gets the default background for panels (dialogs/windows).
   * @return The default background image.
   * @see #getPanelBackground(Class)
   */
  static getPanelBackground$(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColPanel');
  }
  /**
   * Gets the background for the given panel.
   *
   * @param clazz The {@code Class} of the panel.
   * @return The background for the given panel, or the first matching
   *      superclass.
   */
  static getPanelBackground$Class(clazz: JClass<any>): BufferedImage {
    while (clazz != null) {
      let ir = ResourceManager.getImageResource('image.background.' + clazz.getSimpleName(), false);
      if (ir != null) {
        return ir.getImage$();
      }
      clazz = clazz.getSuperclass();
      if (!clazz.getName().startsWith('net.sf.freecol')) {
        clazz = null;
      }
    }
    return ImageLibrary.getPanelBackground$();
  }
  /**
   * Get the generic placeholder image.
   *
   * @return The placeholder {@code BufferedImage}.
   */
  getPlaceholderImage(): BufferedImage {
    return this.imageCache.getSizedImage$String$Dimension$boolean('image.unit.placeholder', ImageLibrary.ICON_SIZE, false);
  }
  static getPopupMenuBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColPopupMenu');
  }
  static getProgressBarBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColProgressBar');
  }
  static getTextAreaBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColTextArea');
  }
  static getTextFieldBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColTextField');
  }
  static getToolTipBackground(): BufferedImage {
    return ImageLibrary.getUnscaledImage('image.background.FreeColToolTip');
  }
  static getBuildingTypeKey(buildingType: BuildingType): string {
    return 'image.buildingicon.' + buildingType.getId();
  }
  getBuildableTypeImage$BuildableType$Dimension(buildable: BuildableType, size: Dimension): BufferedImage {
    return (buildable instanceof BuildingType) ? this.getBuildingTypeImage$BuildingType$Dimension(buildable, size) : this.getUnitTypeImage$UnitType$Dimension$ImageLibrary(buildable, size);
  }
  getBuildableTypeImage$BuildableType$Player$Dimension(buildable: BuildableType, player: Player, size: Dimension): BufferedImage {
    return (buildable instanceof BuildingType) ? this.getBuildingTypeImage$BuildingType$Player$Dimension$ImageLibrary(buildable, player, size) : this.getUnitTypeImage$UnitType$Dimension$ImageLibrary(buildable, size);
  }
  getSmallBuildableTypeImage(buildable: BuildableType, player: Player): BufferedImage {
    let scale = Math.fround(this.scaleFactor * ImageLibrary.SMALL_SCALE);
    return (buildable instanceof BuildingType) ? this.getScaledBuildingTypeImage$BuildingType$Player$float$ImageLibrary(buildable, player, scale) : this.getUnitTypeImage$UnitType$float$ImageLibrary(buildable, scale);
  }
  getSmallBuildableTypeImageWithWithSize(buildable: BuildableType, player: Player, maxSize: Dimension): BufferedImage {
    let image = this.getSmallBuildableTypeImageWithMaxSize(buildable, player, maxSize);
    return ImageUtils.createCenteredImage$BufferedImage$Dimension(image, maxSize);
  }
  getSmallBuildableTypeImageWithMaxSize(buildable: BuildableType, player: Player, maxSize: Dimension): BufferedImage {
    let image = this.getSmallBuildableTypeImage(buildable, player);
    let widthProportion = $J.idiv(image.getWidth(), maxSize.width_);
    let heightProportion = $J.idiv(image.getHeight(), maxSize.height_);
    if (widthProportion >= heightProportion) {
      if (image.getWidth() > maxSize.width_) {
        return this.getBuildableTypeImage$BuildableType$Player$Dimension(buildable, player, new Dimension()._Dimension$int$int(maxSize.width_, 0));
      } else {
        return image;
      }
    } else {
      if (image.getHeight() > maxSize.height_) {
        return this.getBuildableTypeImage$BuildableType$Player$Dimension(buildable, player, new Dimension()._Dimension$int$int(0, maxSize.height_));
      } else {
        return image;
      }
    }
  }
  getBuildingTypeImage$BuildingType$Player$Dimension$ImageLibrary(buildingType: BuildingType, player: Player, size: Dimension): BufferedImage {
    let key = ImageLibrary.getBuildingTypeKey(buildingType);
    let extraKey = key + '.' + player.getNationResourceKey();
    if (ResourceManager.getImageResource(extraKey, false) != null) {
      key = extraKey;
    }
    return this.imageCache.getSizedImage$String$Dimension$boolean(key, size, false);
  }
  getBuildingTypeImage$BuildingType$Dimension(buildingType: BuildingType, size: Dimension): BufferedImage {
    let key = ImageLibrary.getBuildingTypeKey(buildingType);
    return this.imageCache.getSizedImage$String$Dimension$boolean(key, size, false);
  }
  getScaledBuildingTypeImage$BuildingType$float(buildingType: BuildingType, scale: number): BufferedImage {
    let key = ImageLibrary.getBuildingTypeKey(buildingType);
    return this.imageCache.getScaledImage(key, scale, false);
  }
  getScaledBuildingTypeImage$BuildingType$Player$float$ImageLibrary(buildingType: BuildingType, player: Player, scale: number): BufferedImage {
    let key = ImageLibrary.getBuildingTypeKey(buildingType);
    let extraKey = key + '.' + player.getNationResourceKey();
    if (ResourceManager.getImageResource(extraKey, false) != null) {
      key = extraKey;
    }
    return this.imageCache.getScaledImage(key, scale, false);
  }
  determineMaxSizeUsingSizeFromAllLevels(buildingType: BuildingType, player: Player): Dimension {
    let maxWidth = 0;
    let maxHeight = 0;
    while (buildingType.getUpgradesFrom() != null) {
      buildingType = buildingType.getUpgradesFrom();
    }
    do {
      let buildingImage = this.getScaledBuildingTypeImage$BuildingType$Player$float$ImageLibrary(buildingType, player, this.getScaleFactor());
      if (buildingImage.getWidth$ImageObserver(null) > maxWidth) {
        maxWidth = buildingImage.getWidth$ImageObserver(null);
      }
      if (buildingImage.getHeight$ImageObserver(null) > maxHeight) {
        maxHeight = buildingImage.getHeight$ImageObserver(null);
      }
      buildingType = buildingType.getUpgradesTo();
    } while (buildingType != null);
    return new Dimension()._Dimension$int$int(maxWidth, maxHeight);
  }
  getScaledBuildingImage(building: Building): BufferedImage {
    if (building == null) {
      return null;
    }
    return this.getScaledBuildingTypeImage$BuildingType$Player$float$ImageLibrary(building.getType(), building.getOwner(), this.scaleFactor);
  }
  getSmallBuildingImage(building: Building): BufferedImage {
    if (building == null) {
      return null;
    }
    return this.getScaledBuildingTypeImage$BuildingType$Player$float$ImageLibrary(building.getType(), building.getOwner(), Math.fround(this.scaleFactor * ImageLibrary.SMALL_SCALE));
  }
  getScaledBuildingEmptyLandImage(): BufferedImage {
    let key = 'image.buildingicon.model.building.BuildingSite';
    return this.imageCache.getScaledImage(key, this.scaleFactor, false);
  }
  /**
   * Gets an UNCACHED image of the "outside colony"-background based on the given defensive building.
   *
   * The result have to be cached by the caller of this method as long as the image is needed.
   *
   * @param defensiveBuilding The building to get the graphics for.
   * @param nation The nation (if a nation specific iamge is available).
   * @param size The size of the background.
   * @return The image, resized to the given {@code size} without honoring the aspect ratio.
   */
  static getUncachedOutsideColonyBackground(defensiveBuilding: BuildingType, nation: string, size: Dimension): BufferedImage {
    let key: string;
    if (defensiveBuilding == null) {
      key = 'image.buildingOutside.background.default';
    } else {
      key = 'image.buildingOutside.background.' + defensiveBuilding.getId();
    }
    let ir = ResourceManager.getImageResource(key + '.' + nation, false);
    if (ir == null) {
      ir = ResourceManager.getImageResource(key, false);
    }
    if (ir == null) {
      return null;
    }
    return ir.getSizedImageIgnoringProportions(size);
  }
  getScaledCargoHold(available: boolean): BufferedImage {
    let key = 'image.cargohold.' + (available ? 'available' : 'unavailable');
    return this.imageCache.getScaledImage(key, this.scaleFactor, false);
  }
  getColonyDocksBackground(): BufferedImage {
    let key = 'image.colony.docks.background';
    return this.imageCache.getScaledImage(key, this.scaleFactor, false);
  }
  getColonyDocksSkyBackground(): BufferedImage {
    let key = 'image.colony.docks.sky.background';
    return this.imageCache.getScaledImage(key, this.scaleFactor, false);
  }
  getColonyUpperRightBackground(): BufferedImage {
    let key = 'image.colony.upperRight.background';
    return this.imageCache.getScaledImage(key, this.scaleFactor, false);
  }
  getColonyWarehouseBackground(): BufferedImage {
    let key = 'image.colony.warehouse.background';
    return this.imageCache.getScaledImage(key, this.scaleFactor, false);
  }
  createColonyTitleImage(g2d: Graphics2D, title: string, owner: Player, poles: boolean): BufferedImage {
    let backgroundColor = owner.getNationColor();
    let foregroundColor = ImageLibrary.makeForegroundColor(backgroundColor);
    let font = FontLibrary.getScaledFont$String$String('header-plain-large', title);
    let fm = g2d.getFontMetrics$Font(font);
    let textWidth = fm.stringWidth(title);
    let textHeight = (fm.getMaxAscent() + fm.getMaxDescent()) | 0;
    let cic = this.imageCreators.getColorizedImageCreator();
    let bannerScaleFactor = Math.fround(FontLibrary.getFontScaling() / 2);
    let westImage = cic.getColorizedImage('image.colony.banner.w', bannerScaleFactor, backgroundColor);
    let centerImage = cic.getColorizedImage('image.colony.banner.center', bannerScaleFactor, backgroundColor);
    let eastImage = cic.getColorizedImage('image.colony.banner.e', bannerScaleFactor, backgroundColor);
    let poleLeft = this.imageCache.getScaledImage('image.colony.banner.pole.w', bannerScaleFactor, false);
    let poleRight = this.imageCache.getScaledImage('image.colony.banner.pole.e', bannerScaleFactor, false);
    let imageWidth = (westImage != null) ? westImage.getWidth() : 0;
    imageWidth = (imageWidth + ((eastImage != null) ? eastImage.getWidth() : 0)) | 0;
    let numCenterImages = Math.max(0, $J.d2i(Math.ceil(((textWidth - $J.idiv(imageWidth, 2)) | 0) / (centerImage.getWidth()))));
    imageWidth = (imageWidth + Math.imul(centerImage.getWidth(), numCenterImages)) | 0;
    let imageHeight: number;
    let y: number;
    if (poles) {
      imageHeight = poleLeft.getHeight();
      y = $J.idiv(((poleLeft.getHeight() - centerImage.getHeight()) | 0), 2);
    } else {
      imageHeight = centerImage.getHeight();
      y = 0;
    }
    let result = ImageUtils.createBufferedImage$int$int(imageWidth, imageHeight);
    let resultG2D = result.createGraphics();
    try {
      resultG2D.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
      resultG2D.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
      resultG2D.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
      resultG2D.setRenderingHint(RenderingHints.KEY_ALPHA_INTERPOLATION, RenderingHints.VALUE_ALPHA_INTERPOLATION_QUALITY);
      resultG2D.setRenderingHint(RenderingHints.KEY_COLOR_RENDERING, RenderingHints.VALUE_COLOR_RENDER_QUALITY);
      resultG2D.setRenderingHint(RenderingHints.KEY_DITHERING, RenderingHints.VALUE_DITHER_ENABLE);
      resultG2D.setRenderingHint(RenderingHints.KEY_FRACTIONALMETRICS, RenderingHints.VALUE_FRACTIONALMETRICS_ON);
      resultG2D.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
      resultG2D.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
      let x = 0;
      if (westImage != null) {
        resultG2D.drawImage$Image$int$int$ImageObserver(westImage, x, y, null);
        if (poles && poleLeft != null) {
          resultG2D.drawImage$Image$int$int$ImageObserver(poleLeft, x, 0, null);
        }
        x = (x + westImage.getWidth()) | 0;
      }
      for (let i = 0; i < numCenterImages; i++) {
        resultG2D.drawImage$Image$int$int$ImageObserver(centerImage, x, y, null);
        x = (x + centerImage.getWidth()) | 0;
      }
      if (eastImage != null) {
        resultG2D.drawImage$Image$int$int$ImageObserver(eastImage, x, y, null);
        if (poles && poleRight != null) {
          resultG2D.drawImage$Image$int$int$ImageObserver(poleRight, x, 0, null);
        }
        x = (x + eastImage.getWidth()) | 0;
      }
      x = $J.idiv(((imageWidth - textWidth) | 0), 2);
      let textY = (y + $J.idiv(((centerImage.getHeight() - textHeight) | 0), 2) + fm.getAscent()) | 0;
      resultG2D.setFont(font);
      resultG2D.setColor(foregroundColor);
      resultG2D.drawString$String$int$int(title, x, textY);
    } finally {
      resultG2D.dispose();
    }
    return result;
  }
  static getGoodsTypeKey(gt: GoodsType): string {
    return 'image.icon.' + gt.getId();
  }
  getGoodsTypeImage(gt: GoodsType, size: Dimension): BufferedImage {
    return this.imageCache.getSizedImage$String$Dimension$boolean(ImageLibrary.getGoodsTypeKey(gt), size, false);
  }
  getScaledGoodsTypeImage(gt: GoodsType): BufferedImage {
    return this.getGoodsTypeImage(gt, this.scale$Dimension(ImageLibrary.ICON_SIZE));
  }
  getSmallGoodsTypeImage(gt: GoodsType): BufferedImage {
    return this.getGoodsTypeImage(gt, this.scale$Dimension$float(ImageLibrary.ICON_SIZE, ImageLibrary.SMALL_SCALE));
  }
  getSmallerGoodsTypeImage(gt: GoodsType): BufferedImage {
    return this.getGoodsTypeImage(gt, this.scale$Dimension$float(ImageLibrary.ICON_SIZE, ImageLibrary.SMALLER_SCALE));
  }
  static getMercenaryLeaderKey(n: number): string {
    return 'image.flavor.model.mercenaries.' + n;
  }
  static getMonarchKey(nationId: string): string {
    return 'image.flavor.monarch.' + nationId;
  }
  /**
   * Returns the monarch-image for the given tile.
   *
   * @param nation The nation this monarch rules.
   * @return the monarch-image for the given nation.
   */
  static getMonarchImage$Nation(nation: Nation): BufferedImage {
    let key = ImageLibrary.getMonarchKey(nation.getId());
    return ImageLibrary.getUnscaledImage(key);
  }
  /**
   * Get the "monarch" image from a key.
   *
   * The key may be a nation identifier, or if an integer it is a
   * mercenary leader.
   *
   * @param monarchKey The key to examine.
   * @return A suitable {@code BufferedImage}.
   */
  static getMonarchImage$String(monarchKey: string): BufferedImage {
    let key: string;
    try {
      let n = $J.parseInt(monarchKey);
      key = ImageLibrary.getMercenaryLeaderKey(n);
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        key = ImageLibrary.getMonarchKey(monarchKey);
      } else {
        throw $e1;
      }
    }
    return ImageLibrary.getUnscaledImage(key);
  }
  static getNationKey(nation: Nation): string {
    return 'image.miscicon.' + nation.getId();
  }
  getNationImage$Nation$Dimension(nation: Nation, size: Dimension): BufferedImage {
    return this.imageCache.getSizedImage$String$Dimension$boolean(ImageLibrary.getNationKey(nation), size, false);
  }
  getNationImage$Nation$float(nation: Nation, scale: number): BufferedImage {
    return this.imageCache.getScaledImage(ImageLibrary.getNationKey(nation), scale, false);
  }
  getScaledNationImage(nation: Nation): BufferedImage {
    return this.getNationImage$Nation$float(nation, this.scaleFactor);
  }
  getSmallNationImage(nation: Nation): BufferedImage {
    return this.getNationImage$Nation$float(nation, Math.fround(this.scaleFactor * ImageLibrary.SMALL_SCALE));
  }
  getSmallerNationImage(nation: Nation): BufferedImage {
    return this.getNationImage$Nation$float(nation, Math.fround(this.scaleFactor * ImageLibrary.SMALLER_SCALE));
  }
  getUnscaledSmallerNationImage(nation: Nation): BufferedImage {
    return this.getNationImage$Nation$float(nation, ImageLibrary.SMALLER_SCALE);
  }
  /**
   * Gets an image to represent the path of given path type.
   *
   * @param pt The {@code PathType}
   * @return The {@code BufferedImage}.
   */
  getPathImage$PathType(pt: ImageLibrary$PathType): BufferedImage {
    return (pt == null) ? null : this.imageCache.getScaledImage(pt.getImageKey(), this.scaleFactor, false);
  }
  /**
   * Gets an image to represent the path of the given {@code Unit}.
   *
   * @param u The {@code Unit}
   * @return The {@code BufferedImage}.
   */
  getPathImage$Unit(u: Unit): BufferedImage {
    return (u == null) ? null : this.getPathImage$PathType(ImageLibrary$PathType.getPathType(u));
  }
  /**
   * Gets an image to represent the path of the given {@code Unit}.
   *
   * @param pt The {@code PathType}
   * @return The {@code BufferedImage}.
   */
  getPathNextTurnImage$PathType$ImageLibrary(pt: ImageLibrary$PathType): BufferedImage {
    return (pt == null) ? null : this.imageCache.getScaledImage(pt.getNextTurnImageKey(), this.scaleFactor, false);
  }
  /**
   * Gets an image to represent the path of the given {@code Unit}.
   *
   * @param u The {@code Unit}
   * @return The {@code BufferedImage}.
   */
  getPathNextTurnImage$Unit(u: Unit): BufferedImage {
    return (u == null) ? null : this.getPathNextTurnImage$PathType$ImageLibrary(ImageLibrary$PathType.getPathType(u));
  }
  /**
   * Returns the beach corner image at the given index.
   *
   * @param index The index of the image to return.
   * @param x an {@code int} value
   * @param y an {@code int} value
   * @return The image at the given index.
   */
  getBeachCornerImage(index: number, x: number, y: number): BufferedImage {
    let key = 'image.tile.model.tile.beach.corner' + index;
    return this.imageCache.getSizedImage$String$Dimension$boolean$int(key, this.tileSize, false, ImageLibrary.variationSeedUsing(x, y));
  }
  /**
   * Returns the beach edge image at the given index.
   *
   * @param index The index of the image to return.
   * @param x an {@code int} value
   * @param y an {@code int} value
   * @return The image at the given index.
   */
  getBeachEdgeImage(index: number, x: number, y: number): BufferedImage {
    let key = 'image.tile.model.tile.beach.edge' + index;
    return this.imageCache.getSizedImage$String$Dimension$boolean$int(key, this.tileSize, false, ImageLibrary.variationSeedUsing(x, y));
  }
  static getBeachCenterImageResource(): ImageResource {
    let key = 'image.tile.model.tile.beach';
    return ImageCache.getImageResource(key);
  }
  /**
   * Returns a transparent image for making a transition between
   * the given tiles.
   *  
   * @param tile The tile that should get a transition.
   * @param direction The direction to get the bordering tile from..
   * @param useNiceCorners Determines if the corners of the base transitions
   *      should be rendered nicely (takes more time).
   * @param useVariations Uses variations of the transition. 
   * @return The image, or {@code null} if there is no transition that
   *      should be drawn.
   */
  getBaseTileTransitionImage(tile: Tile, direction: Direction, useNiceCorners: boolean, useVariations: boolean): BufferedImage {
    return this.imageCreators.getBaseTileTransitionImageCreator().getBaseTileTransitionImage(tile, direction, useNiceCorners, useVariations);
  }
  /**
   * Returns the border terrain-image for the given type.
   *
   * @param type The type of the terrain-image to return.
   * @param direction a {@code Direction} value
   * @param x The x-coordinate of the tile that is being drawn.
   * @param y The x-coordinate of the tile that is being drawn.
   * @return The terrain-image at the given index.
   */
  getBorderImage(type$: TileType, direction: Direction, x: number, y: number): BufferedImage {
    let key = 'image.tile.' + ((type$ == null) ? 'model.tile.unexplored' : type$.getId()) + '.border.' + $J.str(direction);
    return this.imageCache.getSizedImage$String$Dimension$boolean$int(key, this.tileSize, false, ImageLibrary.variationSeedUsing(x, y));
  }
  /**
   * Get the forest image for a terrain type.
   *
   * @param type The type of the terrain-image to return.
   * @param riverStyle An optional river style to apply.
   * @param size The image size.
   * @return The image at the given index.
   */
  getForestImageInternal(type$: TileType, riverStyle: TileImprovementStyle, size: Dimension): BufferedImage {
    let key: string;
    if (riverStyle != null) {
      let mask = riverStyle.getMask();
      key = 'image.tileforest.' + type$.getId() + '.s' + (($J.equals('0000', mask)) ? '0100' : mask);
      if (ResourceManager.getImageResource(key, false) != null) {
        return this.imageCache.getSizedImage$String$Dimension$boolean(key, size, false);
      }
    }
    key = 'image.tileforest.' + type$.getId();
    return this.imageCache.getSizedImage$String$Dimension$boolean(key, size, false);
  }
  getForestImage(type$: TileType, size: Dimension): BufferedImage {
    return this.getForestImageInternal(type$, null, size);
  }
  getScaledForestImage$TileType(type$: TileType): BufferedImage {
    return this.getForestImageInternal(type$, null, this.tileForestSize);
  }
  getScaledForestImage$TileType$TileImprovementStyle(type$: TileType, riverStyle: TileImprovementStyle): BufferedImage {
    return this.getForestImageInternal(type$, riverStyle, this.tileForestSize);
  }
  getForestCornerImage(type$: TileType, corner: Direction): BufferedImage {
    let key = 'image.tileforest.' + type$.getId() + '.' + corner.toString().toLowerCase();
    let ir = ResourceManager.getImageResource(key, false);
    if (ir == null) {
      return null;
    }
    return this.imageCache.getSizedImage$String$Dimension$boolean$int(key, this.tileForestSize, false, 0);
  }
  /**
   * Get the overlay-image for the given type and scale.
   *
   * @param type The type of the terrain-image to return.
   * @param seed A seed for the tile instance that needs a random image.
   * @param size The size of the image to return.
   * @return A stable (with respect to id) random overlay image.
   */
  getOverlayImageInternal(type$: TileType, seed: number, size: Dimension): BufferedImage {
    let key = 'image.tileoverlay.' + type$.getId();
    let ir = ResourceManager.getImageResource(key, false);
    if (ir == null) {
      return null;
    }
    return this.imageCache.getSizedImage$String$Dimension$boolean$int(key, size, false, seed);
  }
  /**
   * Get the overlay-image for the given type and scale. To be
   * placed above units.
   *
   * @param type The type of the terrain-image to return.
   * @param seed A seed for the tile instance that needs a random image.
   * @param size The size of the image to return.
   * @return A stable (with respect to id) random overlay image.
   */
  getAboveTileImageInternal(type$: TileType, seed: number, size: Dimension): BufferedImage {
    let key = 'image.abovetile.' + type$.getId();
    let ir = ResourceManager.getImageResource(key, false);
    if (ir == null) {
      return null;
    }
    return this.imageCache.getSizedImage$String$Dimension$boolean$int(key, size, false, seed);
  }
  getScaledOverlayImage(tile: Tile): BufferedImage {
    return this.getOverlayImageInternal(tile.getType(), ImageLibrary.variationSeedUsing(tile.getX(), tile.getY()), this.tileOverlaySize);
  }
  getScaledAboveTileImage(tile: Tile): BufferedImage {
    return this.getAboveTileImageInternal(tile.getType(), ImageLibrary.variationSeedUsing(tile.getX(), tile.getY()), this.tileOverlaySize);
  }
  getSizedOverlayImage(type$: TileType, size: Dimension): BufferedImage {
    return this.getOverlayImageInternal(type$, $J.hashCode(type$.getId()), size);
  }
  static getResourceTypeKey(rt: ResourceType): string {
    return 'image.tileitem.' + rt.getId();
  }
  getResourceTypeImage$ResourceType$Dimension$boolean(rt: ResourceType, size: Dimension, grayscale: boolean): BufferedImage {
    return this.imageCache.getSizedImage$String$Dimension$boolean(ImageLibrary.getResourceTypeKey(rt), size, grayscale);
  }
  getResourceTypeImage$ResourceType$float$boolean$ImageLibrary(rt: ResourceType, scale: number, grayscale: boolean): BufferedImage {
    return this.imageCache.getScaledImage(ImageLibrary.getResourceTypeKey(rt), scale, grayscale);
  }
  getScaledResourceTypeImage(rt: ResourceType): BufferedImage {
    return this.getResourceTypeImage$ResourceType$float$boolean$ImageLibrary(rt, this.scaleFactor, false);
  }
  getSmallResourceTypeImage(rt: ResourceType): BufferedImage {
    return this.getResourceTypeImage$ResourceType$float$boolean$ImageLibrary(rt, Math.fround(this.scaleFactor * ImageLibrary.SMALL_SCALE), false);
  }
  getScaledResourceImage(resource: Resource): BufferedImage {
    return this.getResourceTypeImage$ResourceType$float$boolean$ImageLibrary(resource.getType(), this.scaleFactor, false);
  }
  static getRiverStyleKey(style: string): string {
    return ImageLibrary.RIVER_STYLE_PREFIX + style;
  }
  /**
   * Returns the river image with the given style.
   *
   * @param style the style code
   * @param size the image size
   * @return The image with the given style.
   */
  getRiverImageInternal(style: string, size: Dimension): BufferedImage {
    return this.imageCache.getSizedImage$String$Dimension$boolean(ImageLibrary.getRiverStyleKey(style), size, false);
  }
  getRiverImage(style: string, size: Dimension): BufferedImage {
    return this.getRiverImageInternal(style, size);
  }
  /**
   * Returns the river image with the given style and scale.
   *
   * @param style The improvement style identifier.
   * @param scale A scale factor.
   * @return The image with the given style.
   */
  getScaledRiverImage$String$float$ImageLibrary(style: string, scale: number): BufferedImage {
    return this.getRiverImageInternal(style, ImageLibrary.scaleDimension(this.tileSize, scale));
  }
  /**
   * Returns the river image with the given style.
   *
   * @param style a {@code TileImprovementStyle} value
   * @return The image with the given style.
   */
  getScaledRiverImage$TileImprovementStyle(style: TileImprovementStyle): BufferedImage {
    return this.getRiverImageInternal(style.getString(), this.tileSize);
  }
  getScaledRiverImage$String(style: string): BufferedImage {
    return this.getScaledRiverImage$String$float$ImageLibrary(style, this.scaleFactor);
  }
  getSmallerRiverImage(style: string): BufferedImage {
    return this.getScaledRiverImage$String$float$ImageLibrary(style, Math.fround(this.scaleFactor * ImageLibrary.SMALLER_SCALE));
  }
  /**
   * Returns the river mouth terrain-image for the direction and magnitude.
   *
   * @param direction a {@code Direction} value
   * @param magnitude an {@code int} value
   * @param x The x-coordinate of the location of the tile that is being
   *            drawn (ignored).
   * @param y The x-coordinate of the location of the tile that is being
   *            drawn (ignored).
   * @return The terrain-image at the given index.
   */
  getRiverMouthImage(direction: Direction, magnitude: number, x: number, y: number): BufferedImage {
    let key = 'image.tile.model.tile.delta.' + $J.str(direction) + ((magnitude === 1) ? '.small' : '.large');
    return this.imageCache.getSizedImage$String$Dimension$boolean(key, this.tileSize, false);
  }
  /**
   * Get a list of river style image keys.
   *
   * @param all If true accept all non-0000 keys.
   * @return A list of river style image keys.
   */
  static getRiverStyleKeys(all: boolean): List<string> {
    return ResourceManager.getImageKeys(ImageLibrary.RIVER_STYLE_PREFIX).stream().map((key) => key.substring(ImageLibrary.RIVER_STYLE_PREFIX.length)).filter((style) => (all || !style.includes('1')) && !$J.equals('0000', style)).sorted().collect(Collectors.toList());
  }
  static getSettlementTypeKey(settlementType: SettlementType): string {
    return 'image.tileitem.' + settlementType.getId();
  }
  getSettlementTypeImage$SettlementType$float$ImageLibrary(settlementType: SettlementType, scale: number): BufferedImage {
    let key = ImageLibrary.getSettlementTypeKey(settlementType);
    return this.imageCache.getScaledImage(key, scale, false);
  }
  getSettlementTypeImage$SettlementType$Dimension(settlementType: SettlementType, size: Dimension): BufferedImage {
    let key = ImageLibrary.getSettlementTypeKey(settlementType);
    return this.imageCache.getSizedImage$String$Dimension$boolean(key, size, false);
  }
  /**
   * Returns the graphics that will represent the given settlement.
   *
   * @param settlementType The type of settlement whose graphics
   *     type is needed.
   * @return The graphics that will represent the given settlement.
   */
  getScaledSettlementTypeImage(settlementType: SettlementType): BufferedImage {
    return this.getSettlementTypeImage$SettlementType$float$ImageLibrary(settlementType, this.scaleFactor);
  }
  getSmallerSettlementTypeImage(settlementType: SettlementType): BufferedImage {
    return this.getSettlementTypeImage$SettlementType$float$ImageLibrary(settlementType, Math.fround(this.scaleFactor * ImageLibrary.SMALLER_SCALE));
  }
  /**
   * Get an image key for a settlement.
   *
   * @param settlement The {@code Settlement} to examine.
   * @return An image key.
   */
  static getSettlementKey(settlement: Settlement): string {
    let key = ImageLibrary.getSettlementTypeKey(settlement.getType());
    if (settlement instanceof Colony) {
      let colony = settlement;
      if (colony.isUndead()) {
        key += '.undead';
      } else {
        let count = colony.getApparentUnitCount();
        key += (count <= 3) ? '.small' : (count <= 7) ? '.medium' : '.large';
        let stockade = colony.getStockadeKey();
        if (stockade != null) {
          key += '.' + stockade;
        }
      }
      let extraKey = key + '.' + settlement.getOwner().getNationResourceKey();
      if (ResourceManager.getImageResource(extraKey, false) != null) {
        key = extraKey;
      }
    } else if (settlement instanceof IndianSettlement) {
      let is$ = settlement;
      if (is$.hasMissionary$()) {
        key += '.mission';
      }
    }
    return key;
  }
  /**
   * Returns the graphics that will represent the given settlement.
   *
   * @param settlement The settlement whose graphics type is needed.
   * @param scale a {@code double} value
   * @return The graphics that will represent the given settlement.
   */
  getSettlementImage$Settlement$float(settlement: Settlement, scale: number): BufferedImage {
    return this.imageCache.getScaledImage(ImageLibrary.getSettlementKey(settlement), scale, false);
  }
  getSettlementImage$Settlement$Dimension(settlement: Settlement, size: Dimension): BufferedImage {
    return this.imageCache.getSizedImage$String$Dimension$boolean(ImageLibrary.getSettlementKey(settlement), size, false);
  }
  /**
   * Returns the graphics that will represent the given settlement.
   *
   * @param settlement The settlement whose graphics type is needed.
   * @return The graphics that will represent the given settlement.
   */
  getScaledSettlementImage(settlement: Settlement): BufferedImage {
    return this.getSettlementImage$Settlement$float(settlement, this.scaleFactor);
  }
  getSmallSettlementImage(settlement: Settlement): BufferedImage {
    return this.getSettlementImage$Settlement$float(settlement, Math.fround(this.scaleFactor * ImageLibrary.SMALL_SCALE));
  }
  getSmallerSettlementImage(settlement: Settlement): BufferedImage {
    return this.getSettlementImage$Settlement$float(settlement, Math.fround(this.scaleFactor * ImageLibrary.SMALLER_SCALE));
  }
  static getTerrainImageKey(type$: TileType): string {
    return 'image.tile.' + ((type$ == null) ? 'model.tile.unexplored' : type$.getId()) + '.center';
  }
  /**
   * Gets the terrain-image for the given type.
   *
   * @param type The type of the terrain-image to return.
   * @param x The x-coordinate of the location of the tile that is being
   *            drawn.
   * @param y The x-coordinate of the location of the tile that is being
   *            drawn.
   * @param size The image size.
   * @return The terrain-image at the given index.
   */
  getTerrainImageInternal(type$: TileType, x: number, y: number, size: Dimension): BufferedImage {
    return this.imageCache.getSizedImage$String$Dimension$boolean$int(ImageLibrary.getTerrainImageKey(type$), size, false, ImageLibrary.variationSeedUsing(x, y));
  }
  getTerrainMaskResource(direction: Direction): ImageResource {
    return ResourceManager.getImageResource(this.getTerrainMaskKey(direction), true);
  }
  getTerrainMask(direction: Direction): BufferedImage {
    let key = this.getTerrainMaskKey(direction);
    return this.imageCache.getSizedImage$String$Dimension$boolean(key, this.tileSize, false);
  }
  getTerrainMaskKey(direction: Direction): string {
    return (direction != null) ? 'image.mask.' + direction.toString().toLowerCase() : 'image.mask';
  }
  getTerrainImage(type$: TileType, x: number, y: number, size: Dimension): BufferedImage {
    return this.getTerrainImageInternal(type$, x, y, size);
  }
  getScaledTerrainImage(type$: TileType, x: number, y: number): BufferedImage {
    return this.getTerrainImageInternal(type$, x, y, this.tileSize);
  }
  getAnimatedScaledTerrainImage(type$: TileType, ticks: number): BufferedImage {
    let imageResource = ImageCache.getImageResource(ImageLibrary.getTerrainImageKey(type$));
    if (imageResource == null) {
      return null;
    }
    return this.imageCache.getCachedImage(imageResource, this.tileSize, false, imageResource.getVariationNumberForTick(ticks));
  }
  /**
   * Gets the combined animated image for river
   *
   * @param tile The tile. 
   * @param ticks The number of ticks to get the correct animation frame.
   * @return A cached, generated image.
   */
  getAnimatedScaledRiverTerrainImage(tile: Tile, ticks: number): BufferedImage {
    return this.imageCreators.getRiverAnimationImageCreator().getAnimatedScaledRiverTerrainImage(tile, ticks);
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
    return this.imageCreators.getBeachTileAnimationImageCreator().getAnimatedScaledWaterAndBeachTerrainImage(type$, directionsWithLand, ticks);
  }
  /**
   * Gets the combined animated image for the river delta.
   *
   * @param direction The direction to where the river is coming from. 
   * @param ticks The number of ticks to get the correct animation frame.
   * @return A cached, genereated image.
   */
  getAnimatedScaledRiverDeltaTerrainImage(direction: Direction, ticks: number): BufferedImage {
    return this.imageCreators.getDeltaAnimationImageCreator().getAnimatedScaledRiverDeltaTerrainImage(direction, ticks);
  }
  /**
   * Get the tile improvement image with for a given identifier.
   *
   * @param id The tile improvement identifier.
   * @return The image found, or null if it does not exist.
   */
  getTileImprovementImage(id: string): BufferedImage {
    let key = 'image.tile.' + id;
    return (ResourceManager.getImageResource(key, false) == null) ? null : this.imageCache.getSizedImage$String$Dimension$boolean(key, this.tileSize, false);
  }
  /**
   * Get a scaled terrain-image for a terrain type (and position 0, 0).
   *
   * Called from MapeEditorTransformPanel.buildList
   *
   * @param type The type of the terrain-image to return.
   * @param size The maximum size of the terrain image to return.
   * @return The terrain-image
   */
  getTileImageWithOverlayAndForest(type$: TileType, size: Dimension): BufferedImage {
    let width = (size.width_ > 0) ? size.width_ : ($J.idiv(((Math.imul(Math.imul(2, ImageLibrary.TILE_SIZE.width_), size.height_) + (ImageLibrary.TILE_OVERLAY_SIZE.height_ + 1)) | 0), (Math.imul(2, ImageLibrary.TILE_OVERLAY_SIZE.height_))));
    let size2 = new Dimension()._Dimension$int$int(width, -1);
    let terrainImage = this.getTerrainImage(type$, 0, 0, size2);
    let overlayImage = this.getSizedOverlayImage(type$, size2);
    let forestImage = (type$.isForested()) ? this.getForestImage(type$, size2) : null;
    if (overlayImage == null && forestImage == null) {
      return terrainImage;
    }
    width = terrainImage.getWidth();
    let height = terrainImage.getHeight();
    if (overlayImage != null) {
      height = Math.max(height, overlayImage.getHeight());
    }
    if (forestImage != null) {
      height = Math.max(height, forestImage.getHeight());
    }
    let compositeImage = ImageUtils.createBufferedImage$int$int(width, height);
    let g = compositeImage.createGraphics();
    g.drawImage$Image$int$int$ImageObserver(terrainImage, 0, (height - terrainImage.getHeight()) | 0, null);
    if (overlayImage != null) {
      g.drawImage$Image$int$int$ImageObserver(overlayImage, 0, (height - overlayImage.getHeight()) | 0, null);
    }
    if (forestImage != null) {
      g.drawImage$Image$int$int$ImageObserver(forestImage, 0, (height - forestImage.getHeight()) | 0, null);
    }
    g.dispose();
    return compositeImage;
  }
  /**
   * Get the unit image key for the given parameters.
   *
   * @param unitType The type of unit to be represented.
   * @param owner An optional owning {@code Player}.
   * @param roleId The id of the unit role.
   * @param nativeEthnicity If true the unit is a former native.
   * @return A suitable key.
   */
  static getUnitTypeImageKey(unitType: UnitType, owner: Player, roleId: string, nativeEthnicity: boolean): string {
    if (nativeEthnicity && unitType.hasAbility$String(Ability.BORN_IN_INDIAN_SETTLEMENT)) {
      nativeEthnicity = false;
    }
    let roleQual = (Role.isDefaultRoleId(roleId)) ? '' : '.' + Role.getRoleIdSuffix(roleId);
    let key = 'image.unit.' + unitType.getId() + roleQual + ((nativeEthnicity) ? '.native' : '');
    if (nativeEthnicity && ResourceManager.getImageResource(key, false) == null) {
      key = 'image.unit.' + unitType.getId() + roleQual;
    }
    if (owner != null) {
      let extraKey = key + '.' + owner.getNationResourceKey();
      if (ResourceManager.getImageResource(extraKey, false) != null) {
        key = extraKey;
      }
    }
    return key;
  }
  /**
   * Fundamental unit image accessor.
   *
   * @param unitType The type of unit to be represented.
   * @param owner An optional owning {@code Player}.
   * @param roleId The id of the unit role.
   * @param nativeEthnicity If true the unit is a former native.
   * @param grayscale If true draw in inactive/disabled-looking state.
   * @param scale How much the image is scaled.
   * @return A suitable {@code BufferedImage}.
   */
  getUnitTypeImage$UnitType$Player$String$boolean$boolean$float$ImageLibrary(unitType: UnitType, owner: Player, roleId: string, nativeEthnicity: boolean, grayscale: boolean, scale: number): BufferedImage {
    let key = ImageLibrary.getUnitTypeImageKey(unitType, owner, roleId, nativeEthnicity);
    return this.imageCache.getScaledImage(key, scale, grayscale);
  }
  getUnitTypeImage$UnitType$float$ImageLibrary(unitType: UnitType, scale: number): BufferedImage {
    return this.getUnitTypeImage$UnitType$Player$String$boolean$boolean$float$ImageLibrary(unitType, null, unitType.getDisplayRoleId(), false, false, scale);
  }
  getUnitTypeImage$UnitType$String$boolean$Dimension$ImageLibrary(unitType: UnitType, roleId: string, nativeEthnicity: boolean, size: Dimension): BufferedImage {
    let key = ImageLibrary.getUnitTypeImageKey(unitType, null, roleId, nativeEthnicity);
    return this.imageCache.getSizedImage$String$Dimension$boolean(key, size, false);
  }
  getUnitTypeImage$UnitType$Dimension$ImageLibrary(unitType: UnitType, size: Dimension): BufferedImage {
    return this.getUnitTypeImage$UnitType$String$boolean$Dimension$ImageLibrary(unitType, unitType.getDisplayRoleId(), false, size);
  }
  getScaledUnitTypeImage(unitType: UnitType): BufferedImage {
    return this.getUnitTypeImage$UnitType$Player$String$boolean$boolean$float$ImageLibrary(unitType, null, unitType.getDisplayRoleId(), false, false, this.scaleFactor);
  }
  getSmallUnitTypeImage$UnitType$String$boolean(unitType: UnitType, roleId: string, grayscale: boolean): BufferedImage {
    return this.getUnitTypeImage$UnitType$Player$String$boolean$boolean$float$ImageLibrary(unitType, null, roleId, false, grayscale, Math.fround(this.scaleFactor * ImageLibrary.SMALL_SCALE));
  }
  getSmallUnitTypeImage$UnitType$boolean(unitType: UnitType, grayscale: boolean): BufferedImage {
    return this.getSmallUnitTypeImage$UnitType$String$boolean(unitType, unitType.getDisplayRoleId(), grayscale);
  }
  getSmallUnitTypeImage$UnitType(unitType: UnitType): BufferedImage {
    return this.getSmallUnitTypeImage$UnitType$String$boolean(unitType, unitType.getDisplayRoleId(), false);
  }
  getSmallerUnitTypeImage(unitType: UnitType): BufferedImage {
    return this.getUnitTypeImage$UnitType$Player$String$boolean$boolean$float$ImageLibrary(unitType, null, unitType.getDisplayRoleId(), false, false, Math.fround(this.scaleFactor * ImageLibrary.SMALLER_SCALE));
  }
  getTinyUnitTypeImage$UnitType$boolean(unitType: UnitType, grayscale: boolean): BufferedImage {
    return this.getUnitTypeImage$UnitType$Player$String$boolean$boolean$float$ImageLibrary(unitType, null, unitType.getDisplayRoleId(), false, grayscale, Math.fround(this.scaleFactor * ImageLibrary.TINY_SCALE));
  }
  getTinyUnitTypeImage$UnitType(unitType: UnitType): BufferedImage {
    return this.getTinyUnitTypeImage$UnitType$boolean(unitType, false);
  }
  getUnitImage(unit: Unit, grayscale: boolean, scale: number): BufferedImage {
    return this.getUnitTypeImage$UnitType$Player$String$boolean$boolean$float$ImageLibrary(unit.getType(), unit.getOwner(), unit.getRole().getId(), unit.hasNativeEthnicity(), grayscale, scale);
  }
  getScaledUnitImage$Unit$boolean(unit: Unit, grayscale: boolean): BufferedImage {
    return this.getUnitImage(unit, grayscale, this.scaleFactor);
  }
  getScaledUnitImage$Unit(unit: Unit): BufferedImage {
    return this.getScaledUnitImage$Unit$boolean(unit, false);
  }
  getSmallUnitImage$Unit$boolean(unit: Unit, grayscale: boolean): BufferedImage {
    return this.getUnitImage(unit, grayscale, Math.fround(this.scaleFactor * ImageLibrary.SMALL_SCALE));
  }
  getSmallUnitImage$Unit(unit: Unit): BufferedImage {
    return this.getSmallUnitImage$Unit$boolean(unit, false);
  }
  getSmallerUnitImage(unit: Unit): BufferedImage {
    return this.getUnitImage(unit, false, Math.fround(this.scaleFactor * ImageLibrary.SMALLER_SCALE));
  }
  getTinyUnitImage(unit: Unit): BufferedImage {
    return this.getUnitImage(unit, false, Math.fround(this.scaleFactor * ImageLibrary.TINY_SCALE));
  }
  /**
   * Gets a chip image for the alarm at an Indian settlement.
   * The background is either the native owner's, or that of the
   * most-hatednation, if any.
   *
   * @param g Graphics2D for getting the FontMetrics.
   * @param is The {@code IndianSettlement} to check.
   * @param player The observing {@code Player}.
   * @return An alarm chip, or null if none suitable.
   */
  getAlarmChip(g: Graphics2D, is$: IndianSettlement, player: Player): BufferedImage {
    if (player == null || !is$.hasContacted(player)) {
      return null;
    }
    let ownerColor = is$.getOwner().getNationColor();
    let enemy = is$.getMostHated();
    let enemyColor = (enemy == null) ? Nation.UNKNOWN_NATION_COLOR : enemy.getNationColor();
    let amount = 4;
    if (enemy == null) {
      amount = 0;
    } else if (player === enemy) {
      let alarm = is$.getAlarm$Player(enemy);
      amount = (alarm == null) ? 4 : alarm.getLevel().ordinal();
      if (amount === 0) {
        amount = 1;
      }
    }
    let foreground = ImageLibrary.makeForegroundColor(enemyColor);
    let text = ResourceManager.getString$String((is$.worthScouting(player)) ? 'indianAlarmChip.contacted' : 'indianAlarmChip.scouted');
    return this.createChip(g, text, Color.BLACK, ownerColor, amount / 4, enemyColor, foreground, true);
  }
  /**
   * Gets the owner chip for the settlement.
   *
   * @param g Graphics2D for getting the FontMetrics.
   * @param is The {@code IndianSettlement} to check.
   * @return A chip.
   */
  getIndianSettlementChip(g: Graphics2D, is$: IndianSettlement): BufferedImage {
    let key = ResourceManager.getString$String('indianSettlementChip.' + ((is$.getType().isCapital()) ? 'capital' : 'normal'));
    let background = is$.getOwner().getNationColor();
    return this.createChip(g, key, Color.BLACK, background, 0, Color.BLACK, ImageLibrary.makeForegroundColor(background), true);
  }
  /**
   * Gets the mission chip for a native settlement.
   *
   * @param g Graphics2D for getting the FontMetrics.
   * @param owner The player that owns the mission.
   * @param expert True if the unit is an expert.
   * @return A suitable chip, or null if no mission is present.
   */
  getMissionChip(g: Graphics2D, owner: Player, expert: boolean): BufferedImage {
    let background = owner.getNationColor();
    let key = 'color.foreground.mission.' + ((expert) ? 'expert' : 'normal');
    let foreground = ImageLibrary.getColor$String$Color(key, (expert) ? Color.BLACK : Color.GRAY);
    return this.createChip(g, ResourceManager.getString$String('cross'), Color.BLACK, background, 0, Color.BLACK, foreground, true);
  }
  /**
   * Gets a chip for an occupation indicator, i.e. a small image with a
   * single letter or symbol that indicates the Unit's state.
   *
   * @param g Graphics2D for getting the FontMetrics.
   * @param unit The {@code Unit} with the occupation.
   * @param text The text for the chip.
   * @return A suitable chip.
   */
  getOccupationIndicatorChip(g: Graphics2D, unit: Unit, text: string): BufferedImage {
    let background = unit.getOwner().getNationColor();
    let foreground = (unit.getState() === Unit$UnitState.FORTIFIED) ? Color.GRAY : ImageLibrary.makeForegroundColor(background);
    return this.createChip(g, text, Color.BLACK, background, 0, Color.BLACK, foreground, true);
  }
  /**
   * Create a "chip" with the given text and colors.
   *
   * @param g Graphics2D for getting the FontMetrics.
   * @param text The text to display.
   * @param border The border {@code Color}.
   * @param background The background {@code Color}.
   * @param amount How much to fill the chip with the fill color
   * @param fill The fill {@code Color}.
   * @param foreground The foreground {@code Color}.
   * @param filled Whether the chip is filled or not
   * @return A chip.
   */
  createChip(g: Graphics2D, text: string, border: Color, background: Color, amount: number, fill: Color, foreground: Color, filled: boolean): BufferedImage {
    let font = this.getScaledFont('simple-bold-tiny', null);
    let fm = g.getFontMetrics$Font(font);
    let padding = this.scaleInt(6);
    let width = (fm.stringWidth(text) + padding) | 0;
    let height = (fm.getMaxAscent() + fm.getMaxDescent() + padding) | 0;
    let bi = ImageUtils.createBufferedImage$int$int(width, height);
    let g2 = bi.createGraphics();
    g2.setFont(font);
    g2.setColor(border);
    g2.fillRect(0, 0, width, height);
    g2.setColor(background);
    g2.fillRect(1, 1, (width - 2) | 0, (height - 2) | 0);
    if (!filled) {
      if (amount > 0 && amount <= 1) {
        g2.setColor(fill);
        g2.fillRect(1, 1, (width - 2) | 0, $J.d2i((((height - 2) | 0) * amount)));
      }
    }
    g2.setColor(foreground);
    g2.drawString$String$int$int(text, $J.idiv(padding, 2), (fm.getMaxAscent() + $J.idiv(padding, 2)) | 0);
    g2.dispose();
    return bi;
  }
  /**
   * Gets an image with a string of a given color and with
   * a black border around the glyphs.
   *
   * @param g A {@code Graphics}-object for getting the font metrics.
   * @param text The {@code String} to make an image of.
   * @param color The {@code Color} to use for the text.
   * @param font The {@code Font} to display the text with.
   * @return The {@code BufferedImage} found or created.
   */
  getStringImage(g: Graphics, text: string, color: Color, font: Font): BufferedImage {
    if (color == null) {
      ImageLibrary.logger.warning('getStringImage(' + text + ') called with color null');
      color = Color.WHITE;
    }
    let key = text + '.' + JString.replaceChar(font.getFontName$(), 32 /* ' ' */, 45 /* '-' */) + '.' + String(font.getSize()) + '.' + $J.Integer_toHexString(color.getRGB());
    let img = this.stringImageCache.get(key);
    if (img != null) {
      return img;
    }
    img = this.createStringImage(text, color, font, g.getFontMetrics$Font(font));
    this.stringImageCache.put(key, img);
    return img;
  }
  /**
   * Create a string image.
   *
   * @param text The {@code String} to make an image of.
   * @param color The {@code Color} to use for the text.
   * @param font The {@code Font} to display the text with.
   * @param fm The {@code FontMetrics} to use with the font.
   * @return The image that was created.
   */
  createStringImage(text: string, color: Color, font: Font, fm: FontMetrics): BufferedImage {
    let width = (fm.stringWidth(text) + 4) | 0;
    let height = (fm.getMaxAscent() + fm.getMaxDescent()) | 0;
    if (width <= 0 || height <= 0) {
      return ImageUtils.createBufferedImage$int$int(1, 1);
    }
    let img = ImageUtils.createBufferedImage$int$int(width, height);
    let g = img.createGraphics();
    g.setColor(ImageLibrary.makeStringBorderColor(color));
    g.setFont(font);
    g.drawString$String$int$int(text, 2, fm.getMaxAscent());
    let borderWidth = 1;
    let borderColor = ImageLibrary.makeStringBorderColor(color).getRGB();
    let srcRGB: number;
    let dstRGB: number;
    let srcA: number;
    for (let biY = 0; biY < height; biY++) {
      for (let biX = borderWidth; biX < ((width - borderWidth) | 0); biX++) {
        let biXI = (width - biX - 1) | 0;
        for (let d = 1; d <= borderWidth; d++) {
          srcRGB = img.getRGB(biX, biY);
          srcA = (srcRGB >> 24) & 255;
          dstRGB = img.getRGB((biX - d) | 0, biY);
          if (dstRGB !== borderColor) {
            if (srcA > 0) {
              img.setRGB(biX, biY, borderColor);
              img.setRGB((biX - d) | 0, biY, srcRGB);
            }
          }
          srcRGB = img.getRGB(biXI, biY);
          srcA = (srcRGB >> 24) & 255;
          dstRGB = img.getRGB((biXI + d) | 0, biY);
          if (dstRGB !== borderColor) {
            if (srcA > 0) {
              img.setRGB(biXI, biY, borderColor);
              img.setRGB((biXI + d) | 0, biY, srcRGB);
            }
          }
        }
      }
    }
    for (let biX = 0; biX < width; biX++) {
      for (let biY = borderWidth; biY < ((height - borderWidth) | 0); biY++) {
        let biYI = (height - biY - 1) | 0;
        for (let d = 1; d <= borderWidth; d++) {
          srcRGB = img.getRGB(biX, biY);
          srcA = (srcRGB >> 24) & 255;
          dstRGB = img.getRGB(biX, (biY - d) | 0);
          if (dstRGB !== borderColor) {
            if (srcA > 0) {
              img.setRGB(biX, biY, borderColor);
              img.setRGB(biX, (biY - d) | 0, srcRGB);
            }
          }
          srcRGB = img.getRGB(biX, biYI);
          srcA = (srcRGB >> 24) & 255;
          dstRGB = img.getRGB(biX, (biYI + d) | 0);
          if (dstRGB !== borderColor) {
            if (srcA > 0) {
              img.setRGB(biX, biYI, borderColor);
              img.setRGB(biX, (biYI + d) | 0, srcRGB);
            }
          }
        }
      }
    }
    g.setColor(color);
    g.drawString$String$int$int(text, 2, fm.getMaxAscent());
    g.dispose();
    return img;
  }
  static getVideo(key: string): Video {
    return ResourceManager.getVideo(key);
  }
  static $clinit() {
    ImageLibrary.logger = Logger.getLogger($J.cls(ImageLibrary).getName());
    ImageLibrary.ICON_SIZE = new Dimension()._Dimension$int$int(32, 32);
    ImageLibrary.BUILDING_SIZE = new Dimension()._Dimension$int$int(128, 96);
    ImageLibrary.TILE_SIZE = new Dimension()._Dimension$int$int(128, 64);
    ImageLibrary.TILE_OVERLAY_SIZE = new Dimension()._Dimension$int$int(128, 96);
    ImageLibrary.TILE_FOREST_SIZE = new Dimension()._Dimension$int$int(128, 84);
    ImageLibrary.RIVER_STYLE_PREFIX = 'image.tile.model.improvement.river.s';
    ImageLibrary.buttonKeys = CollectionUtils.makeUnmodifiableList(['image.miscicon.button.normal.', 'image.miscicon.button.highlighted.', 'image.miscicon.button.pressed.', 'image.miscicon.button.disabled.']);
  }
}

/**
 * Helper to distinguish different types of paths.
 */
export class ImageLibrary$PathType extends JEnum {
  static NAVAL: ImageLibrary$PathType = null;
  static WAGON: ImageLibrary$PathType = null;
  static HORSE: ImageLibrary$PathType = null;
  static FOOT: ImageLibrary$PathType = null;
  static $VALUES: ImageLibrary$PathType[] = null;
  _ImageLibrary$PathType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Get a key for this path type.
   *
   * @return A key.
   */
  getKey(): string {
    return StringUtils.getEnumKey(this);
  }
  getImageKey(): string {
    return 'image.tileitem.path.' + this.getKey();
  }
  getNextTurnImageKey(): string {
    return 'image.tileitem.path.' + this.getKey() + '.nextTurn';
  }
  /**
   * Get the broad class of image to show along unit paths.
   *
   * @param u A {@code Unit} to classify.
   * @return A suitable {@code PathType}.
   */
  static getPathType(u: Unit): ImageLibrary$PathType {
    return (u == null) ? ImageLibrary$PathType.FOOT : (u.isNaval()) ? ImageLibrary$PathType.NAVAL : (u.isMounted()) ? ImageLibrary$PathType.HORSE : (u.isPerson()) ? ImageLibrary$PathType.FOOT : ImageLibrary$PathType.WAGON;
  }
  static values(): ImageLibrary$PathType[] { return ImageLibrary$PathType.$VALUES.slice(); }
  static valueOf(name: string): ImageLibrary$PathType { return $J.enumValueOf(ImageLibrary$PathType, name); }
  static $clinit() {
    ImageLibrary$PathType.NAVAL = new ImageLibrary$PathType()._ImageLibrary$PathType('NAVAL', 0);
    ImageLibrary$PathType.WAGON = new ImageLibrary$PathType()._ImageLibrary$PathType('WAGON', 1);
    ImageLibrary$PathType.HORSE = new ImageLibrary$PathType()._ImageLibrary$PathType('HORSE', 2);
    ImageLibrary$PathType.FOOT = new ImageLibrary$PathType()._ImageLibrary$PathType('FOOT', 3);
    ImageLibrary$PathType.$VALUES = [ImageLibrary$PathType.NAVAL, ImageLibrary$PathType.WAGON, ImageLibrary$PathType.HORSE, ImageLibrary$PathType.FOOT];
  }
}

$J.define(ImageLibrary, 'net.sf.freecol.client.gui.ImageLibrary', { kind: 'class', sup: 'java.lang.Object', ctors: { 'float,net.sf.freecol.common.resources.ImageCache': '_ImageLibrary$float$ImageCache', 'net.sf.freecol.common.resources.ImageCache': '_ImageLibrary$ImageCache' }, returns: { 'getColonyWarehouseBackground': 'java.awt.image.BufferedImage', 'getColonyUpperRightBackground': 'java.awt.image.BufferedImage', 'getColonyDocksSkyBackground': 'java.awt.image.BufferedImage', 'getColonyDocksBackground': 'java.awt.image.BufferedImage', 'getScaledBuildingEmptyLandImage': 'java.awt.image.BufferedImage', 'getPlaceholderImage': 'java.awt.image.BufferedImage', 'getMiniMapSkin': 'java.awt.image.BufferedImage', 'getLockLabel': 'javax.swing.JLabel', 'getLibertyImage': 'java.awt.image.BufferedImage', 'getCompassRose': 'javax.swing.JLabel', 'getColopediaConceptImage': 'java.awt.image.BufferedImage', 'getRangedTargetCrosshair': 'java.awt.image.BufferedImage', 'getForestedTileSize': 'java.awt.Dimension', 'getTileSize': 'java.awt.Dimension', 'getScaleFactor': 'float' }, meths: { 'getSmallUnitImage(net.sf.freecol.common.model.Unit)': 'getSmallUnitImage$Unit', 'getSmallUnitImage(net.sf.freecol.common.model.Unit,boolean)': 'getSmallUnitImage$Unit$boolean', 'getScaledUnitImage(net.sf.freecol.common.model.Unit)': 'getScaledUnitImage$Unit', 'getScaledUnitImage(net.sf.freecol.common.model.Unit,boolean)': 'getScaledUnitImage$Unit$boolean', 'getTinyUnitTypeImage(net.sf.freecol.common.model.UnitType)': 'getTinyUnitTypeImage$UnitType', 'getTinyUnitTypeImage(net.sf.freecol.common.model.UnitType,boolean)': 'getTinyUnitTypeImage$UnitType$boolean', 'getSmallUnitTypeImage(net.sf.freecol.common.model.UnitType)': 'getSmallUnitTypeImage$UnitType', 'getSmallUnitTypeImage(net.sf.freecol.common.model.UnitType,boolean)': 'getSmallUnitTypeImage$UnitType$boolean', 'getSmallUnitTypeImage(net.sf.freecol.common.model.UnitType,java.lang.String,boolean)': 'getSmallUnitTypeImage$UnitType$String$boolean', 'getUnitTypeImage(net.sf.freecol.common.model.UnitType,java.awt.Dimension)': 'getUnitTypeImage$UnitType$Dimension$ImageLibrary', 'getUnitTypeImage(net.sf.freecol.common.model.UnitType,java.lang.String,boolean,java.awt.Dimension)': 'getUnitTypeImage$UnitType$String$boolean$Dimension$ImageLibrary', 'getUnitTypeImage(net.sf.freecol.common.model.UnitType,float)': 'getUnitTypeImage$UnitType$float$ImageLibrary', 'getUnitTypeImage(net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Player,java.lang.String,boolean,boolean,float)': 'getUnitTypeImage$UnitType$Player$String$boolean$boolean$float$ImageLibrary', 'getSettlementImage(net.sf.freecol.common.model.Settlement,java.awt.Dimension)': 'getSettlementImage$Settlement$Dimension', 'getSettlementImage(net.sf.freecol.common.model.Settlement,float)': 'getSettlementImage$Settlement$float', 'getSettlementTypeImage(net.sf.freecol.common.model.SettlementType,java.awt.Dimension)': 'getSettlementTypeImage$SettlementType$Dimension', 'getSettlementTypeImage(net.sf.freecol.common.model.SettlementType,float)': 'getSettlementTypeImage$SettlementType$float$ImageLibrary', 'getScaledRiverImage(java.lang.String)': 'getScaledRiverImage$String', 'getScaledRiverImage(net.sf.freecol.common.model.TileImprovementStyle)': 'getScaledRiverImage$TileImprovementStyle', 'getScaledRiverImage(java.lang.String,float)': 'getScaledRiverImage$String$float$ImageLibrary', 'getResourceTypeImage(net.sf.freecol.common.model.ResourceType,float,boolean)': 'getResourceTypeImage$ResourceType$float$boolean$ImageLibrary', 'getResourceTypeImage(net.sf.freecol.common.model.ResourceType,java.awt.Dimension,boolean)': 'getResourceTypeImage$ResourceType$Dimension$boolean', 'getScaledForestImage(net.sf.freecol.common.model.TileType,net.sf.freecol.common.model.TileImprovementStyle)': 'getScaledForestImage$TileType$TileImprovementStyle', 'getScaledForestImage(net.sf.freecol.common.model.TileType)': 'getScaledForestImage$TileType', 'getPathNextTurnImage(net.sf.freecol.common.model.Unit)': 'getPathNextTurnImage$Unit', 'getPathNextTurnImage(net.sf.freecol.client.gui.ImageLibrary$PathType)': 'getPathNextTurnImage$PathType$ImageLibrary', 'getPathImage(net.sf.freecol.common.model.Unit)': 'getPathImage$Unit', 'getPathImage(net.sf.freecol.client.gui.ImageLibrary$PathType)': 'getPathImage$PathType', 'getNationImage(net.sf.freecol.common.model.Nation,float)': 'getNationImage$Nation$float', 'getNationImage(net.sf.freecol.common.model.Nation,java.awt.Dimension)': 'getNationImage$Nation$Dimension', 'getMonarchImage(java.lang.String)': 'getMonarchImage$String', 'getMonarchImage(net.sf.freecol.common.model.Nation)': 'getMonarchImage$Nation', 'getScaledBuildingTypeImage(net.sf.freecol.common.model.BuildingType,net.sf.freecol.common.model.Player,float)': 'getScaledBuildingTypeImage$BuildingType$Player$float$ImageLibrary', 'getScaledBuildingTypeImage(net.sf.freecol.common.model.BuildingType,float)': 'getScaledBuildingTypeImage$BuildingType$float', 'getBuildingTypeImage(net.sf.freecol.common.model.BuildingType,java.awt.Dimension)': 'getBuildingTypeImage$BuildingType$Dimension', 'getBuildingTypeImage(net.sf.freecol.common.model.BuildingType,net.sf.freecol.common.model.Player,java.awt.Dimension)': 'getBuildingTypeImage$BuildingType$Player$Dimension$ImageLibrary', 'getBuildableTypeImage(net.sf.freecol.common.model.BuildableType,net.sf.freecol.common.model.Player,java.awt.Dimension)': 'getBuildableTypeImage$BuildableType$Player$Dimension', 'getBuildableTypeImage(net.sf.freecol.common.model.BuildableType,java.awt.Dimension)': 'getBuildableTypeImage$BuildableType$Dimension', 'getPanelBackground(java.lang.Class)': 'getPanelBackground$Class', 'getPanelBackground()': 'getPanelBackground$', 'getObjectImage(net.sf.freecol.common.model.FreeColObject,java.awt.Dimension)': 'getObjectImage$FreeColObject$Dimension', 'getObjectImage(net.sf.freecol.common.model.FreeColObject)': 'getObjectImage$FreeColObject', 'getColor(java.lang.String,java.awt.Color)': 'getColor$String$Color', 'getColor(java.lang.String)': 'getColor$String', 'scale(java.awt.Dimension,float)': 'scale$Dimension$float', 'scale(java.awt.Dimension)': 'scale$Dimension' }, clinit: true, lazy: ['logger', 'ICON_SIZE', 'BUILDING_SIZE', 'TILE_SIZE', 'TILE_OVERLAY_SIZE', 'TILE_FOREST_SIZE', 'RIVER_STYLE_PREFIX', 'buttonKeys'] });
$J.define(ImageLibrary$PathType, 'net.sf.freecol.client.gui.ImageLibrary$PathType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_ImageLibrary$PathType' }, returns: { 'getNextTurnImageKey': 'java.lang.String', 'getImageKey': 'java.lang.String', 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'NAVAL', 'WAGON', 'HORSE', 'FOOT'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Cursor = $J.load('java.awt.Cursor');
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  RenderingHints = $J.load('java.awt.RenderingHints');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ImageCreators = $J.load('net.sf.freecol.client.gui.images.ImageCreators');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  BuildingType = $J.load('net.sf.freecol.common.model.BuildingType');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  LostCityRumour = $J.load('net.sf.freecol.common.model.LostCityRumour');
  Nation = $J.load('net.sf.freecol.common.model.Nation');
  ResourceType = $J.load('net.sf.freecol.common.model.ResourceType');
  Role = $J.load('net.sf.freecol.common.model.Role');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  TileType = $J.load('net.sf.freecol.common.model.TileType');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
  ImageCache = $J.load('net.sf.freecol.common.resources.ImageCache');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
