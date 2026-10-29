// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TileType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum, Stream } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let Ability, Disaster, FreeColObject, GoodsType, ProductionType, ResourceType, GameOptions, CollectionUtils, RandomChoice;

/**
 * The types of tiles.
 */
export class TileType extends FreeColSpecObjectType {
  static readonly TAG: string = 'tile-type';
  static readonly HILLS_ALTITUDE: number = 15;
  static readonly MOUNTAINS_ALTITUDE: number = 25;
  /**
   * Use these tile types only for "land maps", i.e. maps that only
   * distinguish water and land.
   */
  static WATER: TileType = null;
  static LAND: TileType = null;
  /**
   * Is this a forested tile?
   */
  forest: boolean = false;
  /**
   * Is this a water tile?
   */
  water: boolean = false;
  /**
   * Can this tile be settled?
   */
  canSettle_: boolean = false;
  /**
   * Whether this TileType is connected to Europe.
   */
  connected: boolean = false;
  /**
   * Is this elevated terrain?
   */
  elevation: boolean = false;
  /**
   * The base movement cost for this tile type.
   */
  basicMoveCost: number = 0;
  /**
   * The base work turns for this tile type.
   */
  basicWorkTurns: number = 0;
  /**
   * The humidity range for this tile type.
   */
  humidity: number[] = null;
  /**
   * The temperature range for this tile type.
   */
  temperature: number[] = null;
  /**
   * The altitude range for this tile type.
   */
  altitude: number[] = null;
  /**
   * The resource types that are valid for this tile type.
   */
  resourceTypes: List<RandomChoice<ResourceType>> = null;
  /**
   * The disasters that may strike this type of tile.
   */
  disasters: List<RandomChoice<Disaster>> = null;
  /**
   * The possible production types of this tile type.  This includes
   * the production types available if a tile of this type is a
   * colony center tile.
   */
  productionTypes: List<ProductionType> = null;
  static readonly ALTITUDE_MIN_TAG: string = 'altitude-minimum';
  static readonly ALTITUDE_MAX_TAG: string = 'altitude-maximum';
  static readonly BASIC_MOVE_COST_TAG: string = 'basic-move-cost';
  static readonly BASIC_WORK_TURNS_TAG: string = 'basic-work-turns';
  static readonly CAN_SETTLE_TAG: string = 'can-settle';
  static readonly DISASTER_TAG: string = 'disaster';
  static readonly GEN_TAG: string = 'gen';
  static readonly GOODS_TYPE_TAG: string = 'goods-type';
  static readonly HUMIDITY_MIN_TAG: string = 'humidity-minimum';
  static readonly HUMIDITY_MAX_TAG: string = 'humidity-maximum';
  static readonly IS_CONNECTED_TAG: string = 'is-connected';
  static readonly IS_ELEVATION_TAG: string = 'is-elevation';
  static readonly IS_FOREST_TAG: string = 'is-forest';
  static readonly IS_WATER_TAG: string = 'is-water';
  static readonly PROBABILITY_TAG: string = 'probability';
  static readonly PRODUCTION_TAG: string = 'production';
  static readonly RESOURCE_TAG: string = 'resource';
  static readonly TEMPERATURE_MIN_TAG: string = 'temperature-minimum';
  static readonly TEMPERATURE_MAX_TAG: string = 'temperature-maximum';
  static readonly TYPE_TAG: string = 'type';
  static readonly PRIMARY_PRODUCTION_TAG: string = 'primary-production';
  static readonly SECONDARY_PRODUCTION_TAG: string = 'secondary-production';
  static readonly OLD_ALTITUDE_MIN_TAG: string = 'altitudeMin';
  static readonly OLD_ALTITUDE_MAX_TAG: string = 'altitudeMax';
  static readonly OLD_HUMIDITY_MIN_TAG: string = 'humidityMin';
  static readonly OLD_HUMIDITY_MAX_TAG: string = 'humidityMax';
  static readonly OLD_TEMPERATURE_MIN_TAG: string = 'temperatureMin';
  static readonly OLD_TEMPERATURE_MAX_TAG: string = 'temperatureMax';
  $init_TileType() {
    this.humidity = $J.newArray(2, 0);
    this.temperature = $J.newArray(2, 0);
    this.altitude = $J.newArray(2, 0);
    this.resourceTypes = null;
    this.disasters = null;
    this.productionTypes = new ArrayList();
  }
  /**
   * Create a new tile type.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _TileType$String$Specification(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    this.$init_TileType();
    return this;
  }
  /**
   * Creates a new {@code TileType} instance. This constructor
   * is used to create the "virtual" tile types {@code LAND}
   * and {@code WATER}, which are intended to simplify map
   * loading.
   *
   * @param id The object identifier.
   * @param water True if this is a water tile.
   */
  _TileType$String$boolean(id: string, water: boolean): this {
    this._FreeColSpecObjectType$String$Specification(id, null);
    this.$init_TileType();
    this.water = water;
    return this;
  }
  /**
   * Is this tile type forested?
   *
   * @return True if this is a forested tile type.
   */
  isForested(): boolean {
    return this.forest;
  }
  /**
   * Is this a water tile type?
   *
   * @return True if this is a water tile type.
   */
  isWater(): boolean {
    return this.water;
  }
  /**
   * Can this tile type be settled?
   *
   * @return True if this is a settleable tile type.
   */
  canSettle(): boolean {
    return this.canSettle_;
  }
  /**
   * Is this tile type connected to the high seas, by definition.
   *
   * @return True if the tile type is inherently connected to the
   *     high seas.
   */
  isHighSeasConnected(): boolean {
    return this.connected;
  }
  /**
   * Is this tile type directly connected to the high seas, that is,
   * a unit on a tile of this type can move immediately to the high
   * seas.
   *
   * @return True if the tile type is directly connected.
   */
  isDirectlyHighSeasConnected(): boolean {
    return this.hasAbility$String(Ability.MOVE_TO_EUROPE);
  }
  /**
   * Is this an elevated tile type?
   *
   * @return True if this is an elevated tile type.
   */
  isElevation(): boolean {
    return this.elevation;
  }
  /**
   * Gets the basic movement cost through this tile type.
   *
   * @return The basic movement cost.
   */
  getBasicMoveCost(): number {
    return this.basicMoveCost;
  }
  /**
   * Checks if this {@code TileType} should be considered a hill when
   * generating the map.
   */
  isHills(): boolean {
    return this.altitude[0] <= TileType.HILLS_ALTITUDE && this.altitude[1] >= TileType.HILLS_ALTITUDE;
  }
  /**
   * Checks if this {@code TileType} should be considered a mountain when
   * generating the map.
   */
  isMountains(): boolean {
    return this.altitude[0] <= TileType.MOUNTAINS_ALTITUDE && this.altitude[1] >= TileType.MOUNTAINS_ALTITUDE;
  }
  /**
   * Gets the basic work turns to build an improvement on this tile type.
   *
   * @return The basic work turns.
   */
  getBasicWorkTurns(): number {
    return this.basicWorkTurns;
  }
  getHumidity(i: number): number {
    return this.humidity[i];
  }
  setHumidity(i: number, value: number): void {
    this.humidity[i] = value;
  }
  getTemperature(i: number): number {
    return this.temperature[i];
  }
  setTemperature(i: number, value: number): void {
    this.temperature[i] = value;
  }
  getAltitude(i: number): number {
    return this.altitude[i];
  }
  setAltitude(i: number, value: number): void {
    this.altitude[i] = value;
  }
  /**
   * Is this tile type suitable for a given range type value.
   *
   * @param rangeType The {@code RangeType} to test.
   * @param value The value to check.
   * @return True if the tile type meets the range limits.
   */
  withinRange(rangeType: TileType$RangeType, value: number): boolean {
    switch (rangeType) {
      case TileType$RangeType.HUMIDITY:
        return this.humidity[0] <= value && value <= this.humidity[1];
      case TileType$RangeType.TEMPERATURE:
        return this.temperature[0] <= value && value <= this.temperature[1];
      case TileType$RangeType.ALTITUDE:
        return this.altitude[0] <= value && value <= this.altitude[1];
      default:
        break;
    }
    return false;
  }
  /**
   * Gets the resources that can be placed on this tile type.
   *
   * @return A weighted list of resource types.
   */
  getResourceTypes(): List<RandomChoice<ResourceType>> {
    if (this.resourceTypes == null) {
      this.resourceTypes = new ArrayList();
    }
    return this.resourceTypes;
  }
  /**
   * Set the resource types list.
   *
   * @param resourceTypes The list of resource type choices.
   */
  setResourceTypes(resourceTypes: List<RandomChoice<ResourceType>>): void {
    if (this.resourceTypes == null) {
      this.resourceTypes = new ArrayList();
    } else {
      this.resourceTypes.clear();
    }
    this.resourceTypes.addAll(resourceTypes);
  }
  /**
   * Gets the resource types that can be found on this tile type.
   *
   * @return A list of {@code ResourceType}s.
   */
  getResourceTypeValues(): List<ResourceType> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.getResourceTypes(), CollectionUtils.alwaysTrue(), ($p0) => $p0.getObject());
  }
  /**
   * Add a resource type.
   *
   * @param type The {@code ResourceType} to add.
   * @param prob The percentage probability of the resource being
   *     present.
   */
  addResourceType(type$: ResourceType, prob: number): void {
    if (this.resourceTypes == null) {
      this.resourceTypes = new ArrayList();
    }
    this.resourceTypes.add(new RandomChoice()._RandomChoice(type$, prob));
  }
  /**
   * Can this tile type contain a specified resource type?
   *
   * @param resourceType The {@code ResourceType} to test.
   * @return True if the {@code ResourceType} is compatible.
   */
  canHaveResourceType(resourceType: ResourceType): boolean {
    return this.getResourceTypeValues().contains(resourceType);
  }
  /**
   * Get the disaster choices.
   *
   * @return A list of {@code Disaster} choices.
   */
  getDisasters(): List<RandomChoice<Disaster>> {
    return this.disasters;
  }
  /**
   * Set the disaster choices.
   *
   * @param disasters The new {@code Disaster} choice list.
   */
  setDisasters(disasters: List<RandomChoice<Disaster>>): void {
    if (this.disasters == null) {
      this.disasters = new ArrayList();
    } else {
      this.disasters.clear();
    }
    this.disasters.addAll(disasters);
  }
  /**
   * Gets the natural disasters than can strike this tile type.
   *
   * @return A stream of {@code Disaster} choices.
   */
  getDisasterChoices(): Stream<RandomChoice<Disaster>> {
    return (this.disasters == null) ? Stream.empty() : this.disasters.stream();
  }
  /**
   * Add a disaster.
   *
   * @param disaster The {@code Disaster} to add.
   * @param probability The probability of the disaster.
   */
  addDisaster(disaster: Disaster, probability: number): void {
    if (this.disasters == null) {
      this.disasters = new ArrayList();
    }
    this.disasters.add(new RandomChoice()._RandomChoice(disaster, probability));
  }
  /**
   * Get the production type list.
   *
   * @return The {@code ProductionType} list.
   */
  getProductionTypes(): List<ProductionType> {
    return this.productionTypes;
  }
  /**
   * Set the production type list.
   *
   * @param productionTypes The new {@code ProductionType} list.
   */
  setProductionTypes(productionTypes: List<ProductionType>): void {
    this.productionTypes.clear();
    this.productionTypes.addAll(productionTypes);
  }
  /**
   * Gets the production types available at the current difficulty
   * level.
   *
   * @param unattended Whether the production is unattended.
   * @return A list of {@code ProductionType}s.
   */
  getAvailableProductionTypes$boolean(unattended: boolean): List<ProductionType> {
    return this.getAvailableProductionTypes$boolean$String(unattended, this.getSpecification().getString(GameOptions.TILE_PRODUCTION));
  }
  /**
   * Gets the production types available for the given combination
   * of colony center tile and production level.  If the production
   * level is null, all production levels will be returned.
   *
   * Public for the test suite.
   *
   * @param unattended Whether the production is unattended.
   * @param level The production level.
   * @return A list of {@code ProductionType}s.
   */
  getAvailableProductionTypes$boolean$String(unattended: boolean, level: string): List<ProductionType> {
    let good = new ArrayList();
    let better = new ArrayList();
    for (const $it0 = (CollectionUtils.transform$Collection$Predicate(this.productionTypes, CollectionUtils.matchKey$Object$Function(unattended, ($p0) => $p0.getUnattended()))).iterator(); $it0.hasNext(); ) {
      let productionType = $it0.next();
      if (productionType.appliesExactly(level)) {
        better.add(productionType);
      } else if (productionType.appliesTo(level)) {
        good.add(productionType);
      }
    }
    return (!better.isEmpty()) ? better : good;
  }
  /**
   * Can a tile of this type produce a given goods type?
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType An optional {@code UnitType} that is to do
   *     the work, if null the unattended production is considered.
   * @return True if this tile type produces the goods.
   */
  canProduce(goodsType: GoodsType, unitType: UnitType): boolean {
    return goodsType != null && ProductionType.canProduce(goodsType, this.getAvailableProductionTypes$boolean(unitType == null));
  }
  /**
   * Get the amount of goods of given goods type the given unit type
   * could produce on a tile of this tile type.
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType An optional {@code UnitType} that is to do
   *     the work, if null the unattended production is considered.
   * @return The amount of goods produced.
   */
  getPotentialProduction(goodsType: GoodsType, unitType: UnitType): number {
    if (goodsType == null) {
      return 0;
    }
    let amount = this.getBaseProduction(null, goodsType, unitType);
    if (unitType != null) {
      amount = $J.d2i(unitType.apply$float$Turn$String$FreeColSpecObjectType(Math.fround(amount), null, goodsType.getId(), unitType));
    } else {
      amount = $J.d2i(this.apply$float$Turn$String$FreeColSpecObjectType(Math.fround(amount), null, goodsType.getId(), unitType));
    }
    return (amount < 0) ? 0 : amount;
  }
  /**
   * Get all possible goods produced at a tile of this type.
   *
   * Used by static tile type displays that just list unattended
   * production values.  Planning and production routines should use
   * {@link #getPotentialProduction(GoodsType, UnitType)}
   *
   * @param unattended Select unattended production.
   * @return A stream of produced {@code AbstractGoods}.
   */
  getPossibleProduction(unattended: boolean): Stream<AbstractGoods> {
    return CollectionUtils.flatten$Collection$Function(this.getAvailableProductionTypes$boolean(unattended), ($p0) => $p0.getOutputs());
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(TileType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.forest = o.isForested();
    this.water = o.isWater();
    this.canSettle_ = o.canSettle();
    this.connected = o.isHighSeasConnected();
    this.elevation = o.isElevation();
    this.basicMoveCost = o.getBasicMoveCost();
    this.basicWorkTurns = o.getBasicWorkTurns();
    for (let i = 0; i < this.humidity.length; i++) {
      this.setHumidity(i, o.getHumidity(i));
    }
    for (let i = 0; i < this.temperature.length; i++) {
      this.setTemperature(i, o.getTemperature(i));
    }
    for (let i = 0; i < this.altitude.length; i++) {
      this.setAltitude(i, o.getAltitude(i));
    }
    this.setResourceTypes(o.getResourceTypes());
    this.setDisasters(o.getDisasters());
    this.setProductionTypes(o.getProductionTypes());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(TileType.BASIC_MOVE_COST_TAG, this.basicMoveCost);
    xw.writeAttribute$String$int(TileType.BASIC_WORK_TURNS_TAG, this.basicWorkTurns);
    xw.writeAttribute$String$boolean(TileType.IS_FOREST_TAG, this.forest);
    xw.writeAttribute$String$boolean(TileType.IS_WATER_TAG, this.water);
    xw.writeAttribute$String$boolean(TileType.IS_ELEVATION_TAG, this.elevation);
    xw.writeAttribute$String$boolean(TileType.IS_CONNECTED_TAG, this.connected);
    xw.writeAttribute$String$boolean(TileType.CAN_SETTLE_TAG, this.canSettle_);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    xw.writeStartElement(TileType.GEN_TAG);
    xw.writeAttribute$String$int(TileType.HUMIDITY_MIN_TAG, this.humidity[0]);
    xw.writeAttribute$String$int(TileType.HUMIDITY_MAX_TAG, this.humidity[1]);
    xw.writeAttribute$String$int(TileType.TEMPERATURE_MIN_TAG, this.temperature[0]);
    xw.writeAttribute$String$int(TileType.TEMPERATURE_MAX_TAG, this.temperature[1]);
    xw.writeAttribute$String$int(TileType.ALTITUDE_MIN_TAG, this.altitude[0]);
    xw.writeAttribute$String$int(TileType.ALTITUDE_MAX_TAG, this.altitude[1]);
    xw.writeEndElement();
    for (const $it1 = this.productionTypes.iterator(); $it1.hasNext(); ) {
      let productionType = $it1.next();
      productionType.toXML$FreeColXMLWriter(xw);
    }
    if (this.resourceTypes != null) {
      for (const $it2 = this.resourceTypes.iterator(); $it2.hasNext(); ) {
        let choice = $it2.next();
        xw.writeStartElement(TileType.RESOURCE_TAG);
        xw.writeAttribute$String$FreeColObject(TileType.TYPE_TAG, choice.getObject());
        xw.writeAttribute$String$int(TileType.PROBABILITY_TAG, choice.getProbability());
        xw.writeEndElement();
      }
    }
    for (const $it3 = CollectionUtils.iterable(this.getDisasterChoices()).iterator(); $it3.hasNext(); ) {
      let choice = $it3.next();
      xw.writeStartElement(TileType.DISASTER_TAG);
      xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, choice.getObject());
      xw.writeAttribute$String$int(TileType.PROBABILITY_TAG, choice.getProbability());
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.basicMoveCost = xr.getAttribute$String$int(TileType.BASIC_MOVE_COST_TAG, 1);
    this.basicWorkTurns = xr.getAttribute$String$int(TileType.BASIC_WORK_TURNS_TAG, 1);
    this.forest = xr.getAttribute$String$boolean(TileType.IS_FOREST_TAG, false);
    this.water = xr.getAttribute$String$boolean(TileType.IS_WATER_TAG, false);
    this.elevation = xr.getAttribute$String$boolean(TileType.IS_ELEVATION_TAG, false);
    this.canSettle_ = xr.getAttribute$String$boolean(TileType.CAN_SETTLE_TAG, !this.water);
    this.connected = xr.getAttribute$String$boolean(TileType.IS_CONNECTED_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.disasters = null;
    this.resourceTypes = null;
    this.productionTypes.clear();
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(TileType.DISASTER_TAG, tag)) {
      let d = xr.getType(spec, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(Disaster), null);
      if (d != null) {
        this.addDisaster(d, xr.getAttribute$String$int(TileType.PROBABILITY_TAG, 100));
      }
      xr.closeTag$String(TileType.DISASTER_TAG);
    } else if ($J.equals(TileType.GEN_TAG, tag)) {
      this.humidity[0] = xr.getAttribute$String$int(TileType.HUMIDITY_MIN_TAG, 0);
      this.humidity[1] = xr.getAttribute$String$int(TileType.HUMIDITY_MAX_TAG, 100);
      this.temperature[0] = xr.getAttribute$String$int(TileType.TEMPERATURE_MIN_TAG, -20);
      this.temperature[1] = xr.getAttribute$String$int(TileType.TEMPERATURE_MAX_TAG, 40);
      this.altitude[0] = xr.getAttribute$String$int(TileType.ALTITUDE_MIN_TAG, 0);
      this.altitude[1] = xr.getAttribute$String$int(TileType.ALTITUDE_MAX_TAG, 0);
      if (xr.hasAttribute(TileType.OLD_HUMIDITY_MIN_TAG)) {
        this.humidity[0] = xr.getAttribute$String$int(TileType.OLD_HUMIDITY_MIN_TAG, 0);
      }
      if (xr.hasAttribute(TileType.OLD_HUMIDITY_MAX_TAG)) {
        this.humidity[1] = xr.getAttribute$String$int(TileType.OLD_HUMIDITY_MAX_TAG, 100);
      }
      if (xr.hasAttribute(TileType.OLD_TEMPERATURE_MIN_TAG)) {
        this.temperature[0] = xr.getAttribute$String$int(TileType.OLD_TEMPERATURE_MIN_TAG, -20);
      }
      if (xr.hasAttribute(TileType.OLD_TEMPERATURE_MAX_TAG)) {
        this.temperature[1] = xr.getAttribute$String$int(TileType.OLD_TEMPERATURE_MAX_TAG, 40);
      }
      if (xr.hasAttribute(TileType.OLD_ALTITUDE_MIN_TAG)) {
        this.altitude[0] = xr.getAttribute$String$int(TileType.OLD_ALTITUDE_MIN_TAG, 0);
      }
      if (xr.hasAttribute(TileType.OLD_ALTITUDE_MAX_TAG)) {
        this.altitude[1] = xr.getAttribute$String$int(TileType.OLD_ALTITUDE_MAX_TAG, 0);
      }
      xr.closeTag$String(TileType.GEN_TAG);
    } else if ($J.equals(TileType.PRODUCTION_TAG, tag) && xr.getAttribute$String$boolean(FreeColSpecObjectType.DELETE_TAG, false)) {
      this.productionTypes.clear();
      xr.closeTag$String(TileType.PRODUCTION_TAG);
    } else if ($J.equals(TileType.PRODUCTION_TAG, tag)) {
      this.productionTypes.add(new ProductionType()._ProductionType$FreeColXMLReader$Specification(xr, spec));
    } else if ($J.equals(TileType.RESOURCE_TAG, tag)) {
      this.addResourceType(xr.getType(spec, TileType.TYPE_TAG, $J.cls(ResourceType), null), xr.getAttribute$String$int(TileType.PROBABILITY_TAG, 100));
      xr.closeTag$String(TileType.RESOURCE_TAG);
    } else if ($J.equals(TileType.PRIMARY_PRODUCTION_TAG, tag) || $J.equals(TileType.SECONDARY_PRODUCTION_TAG, tag)) {
      let type$ = xr.getType(spec, TileType.GOODS_TYPE_TAG, $J.cls(GoodsType), null);
      let amount = xr.getAttribute$String$int(FreeColObject.VALUE_TAG, 0);
      let pt = new ProductionType()._ProductionType$GoodsType$GoodsType$int(null, type$, amount);
      pt.setUnattended(true);
      this.productionTypes.add(pt);
      xr.closeTag$String(tag);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return TileType.TAG;
  }
  static $clinit() {
    TileType.WATER = new TileType()._TileType$String$boolean('WATER', true);
    TileType.LAND = new TileType()._TileType$String$boolean('LAND', false);
  }
}

export class TileType$RangeType extends JEnum {
  static HUMIDITY: TileType$RangeType = null;
  static TEMPERATURE: TileType$RangeType = null;
  static ALTITUDE: TileType$RangeType = null;
  static $VALUES: TileType$RangeType[] = null;
  _TileType$RangeType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): TileType$RangeType[] { return TileType$RangeType.$VALUES.slice(); }
  static valueOf(name: string): TileType$RangeType { return $J.enumValueOf(TileType$RangeType, name); }
  static $clinit() {
    TileType$RangeType.HUMIDITY = new TileType$RangeType()._TileType$RangeType('HUMIDITY', 0);
    TileType$RangeType.TEMPERATURE = new TileType$RangeType()._TileType$RangeType('TEMPERATURE', 1);
    TileType$RangeType.ALTITUDE = new TileType$RangeType()._TileType$RangeType('ALTITUDE', 2);
    TileType$RangeType.$VALUES = [TileType$RangeType.HUMIDITY, TileType$RangeType.TEMPERATURE, TileType$RangeType.ALTITUDE];
  }
}

$J.define(TileType, 'net.sf.freecol.common.model.TileType', { kind: 'class', ifaces: ['net.sf.freecol.common.model.BaseProduction'], sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'java.lang.String,boolean': '_TileType$String$boolean', 'java.lang.String,net.sf.freecol.common.model.Specification': '_TileType$String$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'getProductionTypes': 'java.util.List', 'getDisasterChoices': 'java.util.stream.Stream', 'getDisasters': 'java.util.List', 'getResourceTypeValues': 'java.util.List', 'getResourceTypes': 'java.util.List', 'getBasicWorkTurns': 'int', 'isMountains': 'boolean', 'isHills': 'boolean', 'getBasicMoveCost': 'int', 'isElevation': 'boolean', 'isDirectlyHighSeasConnected': 'boolean', 'isHighSeasConnected': 'boolean', 'isWater': 'boolean', 'isForested': 'boolean' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader', 'getAvailableProductionTypes(boolean,java.lang.String)': 'getAvailableProductionTypes$boolean$String', 'getAvailableProductionTypes(boolean)': 'getAvailableProductionTypes$boolean' }, clinit: true, lazy: ['WATER', 'LAND'] });
$J.define(TileType$RangeType, 'net.sf.freecol.common.model.TileType$RangeType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_TileType$RangeType' }, clinit: true, lazy: ['$VALUES', 'HUMIDITY', 'TEMPERATURE', 'ALTITUDE'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Disaster = $J.load('net.sf.freecol.common.model.Disaster');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  ProductionType = $J.load('net.sf.freecol.common.model.ProductionType');
  ResourceType = $J.load('net.sf.freecol.common.model.ResourceType');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
});
