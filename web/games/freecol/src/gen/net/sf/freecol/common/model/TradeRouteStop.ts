// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TradeRouteStop.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let AbstractGoods, FreeColObject, GoodsContainer, GoodsType, Ownable, StringTemplate, TradeLocation, CollectionUtils;

/**
 * A stop along a trade route.
 */
export class TradeRouteStop extends FreeColGameObject {
  static logger: Logger = null;
  static readonly TAG: string = 'tradeRouteStop';
  /**
   * The trade location of the stop.
   */
  location_: Location = null;
  /**
   * The cargo expected to be on board on leaving the stop.
   */
  cargo: List<GoodsType> = null;
  static readonly CARGO_TAG: string = 'cargo';
  static readonly LOCATION_TAG: string = 'location';
  $init_TradeRouteStop() {
    this.cargo = new ArrayList();
  }
  /**
   * Create an empty trade route stop.
   *
   * @param game The enclosing {@code Game}.
   */
  _TradeRouteStop$Game(game: Game): this {
    this._FreeColGameObject$Game$String(game, '');
    this.$init_TradeRouteStop();
    return this;
  }
  /**
   * Create a stop for the given location from a stream.
   *
   * @param game The enclosing {@code Game}.
   * @param location The {@code Location} of this stop.
   */
  _TradeRouteStop$Game$Location(game: Game, location: Location): this {
    this._TradeRouteStop$Game(game);
    this.location_ = location;
    this.cargo.clear();
    return this;
  }
  /**
   * Copy constructor.  Creates a stop based on the given one.
   *
   * @param other The other {@code TradeRouteStop}.
   */
  _TradeRouteStop$TradeRouteStop(other: TradeRouteStop): this {
    this._TradeRouteStop$Game$Location(other.getGame(), other.location_);
    this.setCargo(other.cargo);
    return this;
  }
  /**
   * Create a new {@code TradeRouteStop} from a stream.
   *
   * @param game The enclosing {@code Game}.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _TradeRouteStop$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._TradeRouteStop$Game(game);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the location of this stop.
   *
   * @return The {@code Location} of this stop.
   */
  getLocation(): Location {
    return this.location_;
  }
  /**
   * Get the location of this stop as a TradeLocation.
   *
   * @return The {@code TradeLocation} for this stop.
   */
  getTradeLocation(): TradeLocation {
    return this.location_;
  }
  /**
   * Is this stop valid?
   *
   * @param player The {@code Player} that owns this route.
   * @return True if the stop is valid.
   */
  isValid(player: Player): boolean {
    return ($J.isa(this.location_, TradeLocation)) && !(this.location_).isDisposed() && (this.location_).isInitialized() && (($J.isa(this.location_, Ownable)) && player.owns(this.location_));
  }
  /**
   * Get the current cargo for this stop.
   *
   * @return A list of cargo {@code GoodsType}s.
   */
  getCargo(): List<GoodsType> {
    return this.cargo;
  }
  /**
   * Set the cargo value.
   *
   * @param newCargo A list of {@code GoodsType} defining the cargo.
   */
  setCargo(newCargo: List<GoodsType>): void {
    this.cargo.clear();
    this.cargo.addAll(newCargo);
  }
  /**
   * Add cargo to this stop.
   *
   * @param newCargo The {@code GoodsType} to add.
   */
  addCargo(newCargo: GoodsType): void {
    this.cargo.add(newCargo);
  }
  /**
   * Get a list of the maximum abstract goods that could be loaded
   * at this stop.  That is, a list of all the cargo goods types
   * normally with amount equal to one CARGO_SIZE, but with
   * duplicates removed and amounts accumulated.
   *
   * @return A list of {@code AbstractGoods} to load.
   */
  getCompactCargo(): List<AbstractGoods> {
    let result = new ArrayList();
    for (const $it0 = this.getCargo().iterator(); $it0.hasNext(); ) {
      let type$ = $it0.next();
      let ag = CollectionUtils.find$Collection$Predicate(result, AbstractGoods.matches(type$));
      if (ag != null) {
        ag.setAmount((ag.getAmount() + GoodsContainer.CARGO_SIZE) | 0);
      } else {
        result.add(new AbstractGoods()._AbstractGoods$GoodsType$int(type$, GoodsContainer.CARGO_SIZE));
      }
    }
    return result;
  }
  /**
   * Create a template for this trade route stop.
   *
   * @param key A message key.
   * @param player The {@code Player} who will see the message.
   * @return A {@code StringTemplate} for this stop.
   */
  getLabelFor(key: string, player: Player): StringTemplate {
    return StringTemplate.template$String(key).addStringTemplate$String$StringTemplate('%location%', this.getLocation().getLocationLabelFor(player));
  }
  /**
   * Create an invalid trade route stop label.
   *
   * @param player The {@code Player} who will see the message.
   * @return A {@code StringTemplate} for this stop.
   */
  invalidStopLabel(player: Player): StringTemplate {
    return this.getLabelFor('model.tradeRoute.invalidStop', player);
  }
  /**
   * Is there work for a unit to do at this stop?
   *
   * @param unit The {@code Unit} to test.
   * @param turns Account for production from this many turns.
   * @return True if this unit should load or unload cargo at the stop.
   */
  hasWork(unit: Unit, turns: number): boolean {
    let stopGoods = this.getCompactCargo();
    let loadPred = (ag) => unit.getGoodsCount(ag.getType()) < ag.getAmount() && this.getExportAmount(ag.getType(), turns) > 0;
    if (CollectionUtils.any$Collection$Predicate(stopGoods, loadPred)) {
      return true;
    }
    let unloadPred = (g) => !CollectionUtils.any$Collection$Predicate(stopGoods, AbstractGoods.matches(g.getType())) && this.getImportAmount(g.getType(), turns) > 0;
    if (CollectionUtils.any$Collection$Predicate(unit.getCompactGoodsList(), unloadPred)) {
      return true;
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  getAvailableGoodsCount(goodsType: GoodsType): number {
    return ($J.isa(this.location_, TradeLocation)) ? (this.location_).getAvailableGoodsCount(goodsType) : 0;
  }
  /**
   * {@inheritDoc}
   */
  getExportAmount(goodsType: GoodsType, turns: number): number {
    return ($J.isa(this.location_, TradeLocation)) ? (this.location_).getExportAmount(goodsType, turns) : 0;
  }
  /**
   * {@inheritDoc}
   */
  getImportAmount(goodsType: GoodsType, turns: number): number {
    return ($J.isa(this.location_, TradeLocation)) ? (this.location_).getImportAmount(goodsType, turns) : 0;
  }
  /**
   * {@inheritDoc}
   */
  getLocationName(tradeLocation: TradeLocation): string {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  isInternable(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(TradeRouteStop));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.location_ = game.updateLocationRef(o.getLocation());
    this.setCargo(o.getCargo());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    xw.writeLocationAttribute(TradeRouteStop.LOCATION_TAG, this.location_);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    for (const $it1 = this.cargo.iterator(); $it1.hasNext(); ) {
      let cargoType = $it1.next();
      xw.writeStartElement(TradeRouteStop.CARGO_TAG);
      xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, cargoType);
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    this.location_ = xr.getLocationAttribute(this.getGame(), TradeRouteStop.LOCATION_TAG, true);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.cargo.clear();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(TradeRouteStop.CARGO_TAG, tag)) {
      this.cargo.add(xr.getType(spec, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(GoodsType), null));
      xr.closeTag$String(TradeRouteStop.CARGO_TAG);
    } else {
      super.readChild(xr);
    }
  }
  equals(o: any): boolean {
    return o === this;
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return TradeRouteStop.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append(this.getLocation().getId());
    for (const $it2 = this.getCargo().iterator(); $it2.hasNext(); ) {
      let goodsType = $it2.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(goodsType));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    TradeRouteStop.logger = Logger.getLogger($J.cls(TradeRouteStop).getName());
  }
}

$J.define(TradeRouteStop, 'net.sf.freecol.common.model.TradeRouteStop', { kind: 'class', ifaces: ['net.sf.freecol.common.model.TradeLocation'], sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_TradeRouteStop$Game$FreeColXMLReader', 'net.sf.freecol.common.model.TradeRouteStop': '_TradeRouteStop$TradeRouteStop', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Location': '_TradeRouteStop$Game$Location', 'net.sf.freecol.common.model.Game': '_TradeRouteStop$Game' }, returns: { 'getXMLTagName': 'java.lang.String', 'isInternable': 'boolean', 'getCompactCargo': 'java.util.List', 'getCargo': 'java.util.List', 'getTradeLocation': 'net.sf.freecol.common.model.TradeLocation', 'getLocation': 'net.sf.freecol.common.model.Location' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  TradeLocation = $J.load('net.sf.freecol.common.model.TradeLocation');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
