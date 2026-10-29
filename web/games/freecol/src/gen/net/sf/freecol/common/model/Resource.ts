// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Resource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, RuntimeException, Stream } from '../../../../../../jre/index.ts';
import { TileItem } from './TileItem.ts';

let FreeColObject, Map$Layer, ResourceType, Tile;

/**
 * Represents a production resource, such as prime tobacco, or an ore
 * vein, located on a Tile. A resource may be exhausted. In the
 * original game, only resources that produced silver were exhausted.
 */
export class Resource extends TileItem {
  static logger: Logger = null;
  static readonly TAG: string = 'resource';
  /**
   * Some resources are unlimited.
   */
  static readonly UNLIMITED: number = -1;
  /**
   * The type of resource.
   */
  type: ResourceType = null;
  /**
   * The amount of the resource present.
   */
  quantity: number = 0;
  static readonly QUANTITY_TAG: string = 'quantity';
  static readonly TILE_TAG: string = 'tile';
  static readonly TYPE_TAG: string = 'type';
  /**
   * Creates a standard {@code Resource}-instance.
   *
   * This constructor asserts that the game, tile and type are valid.
   *
   * @param game The enclosing {@code Game}.
   * @param tile The {@code Tile} on which this object sits.
   * @param type The {@code ResourceType} of this Resource.
   * @param quantity The quantity of resource.
   */
  _Resource$Game$Tile$ResourceType$int(game: Game, tile: Tile, type$: ResourceType, quantity: number): this {
    this._TileItem$Game$Tile(game, tile);
    if (type$ == null) {
      throw new RuntimeException('Type must not be null: ' + $J.str(this));
    }
    this.type = type$;
    this.quantity = quantity;
    return this;
  }
  /**
   * Creates a standard {@code Resource}-instance.
   *
   * This constructor asserts that the game, tile and type are valid.
   *
   * @param game The enclosing {@code Game}.
   * @param tile The {@code Tile} on which this object sits.
   * @param type The {@code ResourceType} of this Resource.
   */
  _Resource$Game$Tile$ResourceType(game: Game, tile: Tile, type$: ResourceType): this {
    this._Resource$Game$Tile$ResourceType$int(game, tile, type$, type$.getMaxValue());
    return this;
  }
  /**
   * Creates new {@code Resource}.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _Resource$Game$String(game: Game, id: string): this {
    this._TileItem$Game$String(game, id);
    return this;
  }
  /**
   * Get the type of this resource.
   *
   * @return The resource type.
   */
  getType(): ResourceType {
    return this.type;
  }
  /**
   * Is this an unlimited resource?
   *
   * @return True if this is an unlimited resource.
   */
  isUnlimited(): boolean {
    return this.quantity === Resource.UNLIMITED;
  }
  /**
   * Get the resource quantity.
   *
   * @return The resource quantity.
   */
  getQuantity(): number {
    return this.quantity;
  }
  /**
   * Set the resource quantity.
   *
   * @param newQuantity The new resource quantity.
   */
  setQuantity(newQuantity: number): void {
    this.quantity = newQuantity;
  }
  /**
   * Get the best goods type to produce here.
   *
   * @return The best goods type.
   */
  getBestGoodsType(): GoodsType {
    return this.type.getBestGoodsType();
  }
  /**
   * Reduce the available quantity by the bonus output of
   * {@code GoodsType}.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @param unitType The producing {@code UnitType}.
   * @param potential The base potential of the tile.
   * @return The new quantity of resource.
   */
  useQuantity$GoodsType$UnitType$int(goodsType: GoodsType, unitType: UnitType, potential: number): number {
    return this.useQuantity$int$Resource((this.applyBonus(goodsType, unitType, potential) - potential) | 0);
  }
  /**
   * Reduces the available quantity.
   *
   * @param usedQuantity The quantity that was used up.
   * @return The final value of quantity.
   */
  useQuantity$int$Resource(usedQuantity: number): number {
    if (this.quantity === Resource.UNLIMITED) {
    } else if (this.quantity >= usedQuantity) {
      this.quantity = (this.quantity - usedQuantity) | 0;
    } else {
      Resource.logger.severe('Insufficient quantity in ' + $J.str(this));
      this.quantity = 0;
    }
    return this.quantity;
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return this.getType().getNameKey();
  }
  /**
   * {@inheritDoc}
   */
  getZIndex(): number {
    return Tile.RESOURCE_ZINDEX;
  }
  /**
   * {@inheritDoc}
   */
  isTileTypeAllowed(tileType: TileType): boolean {
    return tileType.canHaveResourceType(this.getType());
  }
  /**
   * {@inheritDoc}
   */
  applyBonus(goodsType: GoodsType, unitType: UnitType, potential: number): number {
    let amount = (-potential + $J.d2i(FreeColObject.applyModifiers$float$Turn$Stream(Math.fround(potential), null, this.type.getModifiers$String$FreeColSpecObjectType(goodsType.getId(), unitType)))) | 0;
    return (potential + ((this.quantity === Resource.UNLIMITED || this.quantity > amount) ? amount : this.quantity)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  canProduce(goodsType: GoodsType, unitType: UnitType): boolean {
    if (goodsType == null) {
      return false;
    }
    return $J.d2i(FreeColObject.applyModifiers$float$Turn$Stream(0, this.getGame().getTurn(), this.getProductionModifiers(goodsType, unitType))) > 0;
  }
  /**
   * {@inheritDoc}
   */
  getProductionModifiers(goodsType: GoodsType, unitType: UnitType): Stream<Modifier> {
    return (goodsType == null) ? Stream.empty() : this.getType().getModifiers$String$FreeColSpecObjectType(goodsType.getId(), unitType);
  }
  /**
   * {@inheritDoc}
   */
  isNatural(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  isComplete(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getLayer(): Map$Layer {
    return Map$Layer.RESOURCES;
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    if (this.type == null) {
      lb.add(['\n  Resource without type: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Resource));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.type = o.getType();
    this.quantity = o.getQuantity();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(Resource.TILE_TAG, this.getTile$());
    xw.writeAttribute$String$FreeColObject(Resource.TYPE_TAG, this.getType());
    xw.writeAttribute$String$int(Resource.QUANTITY_TAG, this.quantity);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    super.readAttributes(xr);
    this.tile = xr.findFreeColGameObject(this.getGame(), Resource.TILE_TAG, $J.cls(Tile), null, true);
    this.type = xr.getType(spec, Resource.TYPE_TAG, $J.cls(ResourceType), null);
    this.quantity = xr.getAttribute$String$int(Resource.QUANTITY_TAG, 0);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Resource.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let ty = this.getType();
    let id = (ty == null) ? 'NOTYPE' : ty.getId();
    return (this.quantity === Resource.UNLIMITED) ? id : String(this.quantity) + ' ' + id;
  }
  static $clinit() {
    Resource.logger = Logger.getLogger($J.cls(Resource).getName());
  }
}

$J.define(Resource, 'net.sf.freecol.common.model.Resource', { kind: 'class', sup: 'net.sf.freecol.common.model.TileItem', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_Resource$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.ResourceType': '_Resource$Game$Tile$ResourceType', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.ResourceType,int': '_Resource$Game$Tile$ResourceType$int' }, returns: { 'getXMLTagName': 'java.lang.String', 'getLayer': 'net.sf.freecol.common.model.Map$Layer', 'isComplete': 'boolean', 'isNatural': 'boolean', 'getZIndex': 'int', 'getNameKey': 'java.lang.String', 'getBestGoodsType': 'net.sf.freecol.common.model.GoodsType', 'getQuantity': 'int', 'isUnlimited': 'boolean', 'getType': 'net.sf.freecol.common.model.ResourceType' }, meths: { 'useQuantity(int)': 'useQuantity$int$Resource', 'useQuantity(net.sf.freecol.common.model.GoodsType,net.sf.freecol.common.model.UnitType,int)': 'useQuantity$GoodsType$UnitType$int' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Map$Layer = $J.load('net.sf.freecol.common.model.Map$Layer');
  ResourceType = $J.load('net.sf.freecol.common.model.ResourceType');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
});
