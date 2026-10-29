// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TradeRoute.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashSet, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let Messages, Map_, Player, StringTemplate, TradeRouteStop, GameOptions, CollectionUtils;

/**
 * A TradeRoute holds all information for a unit to follow along a trade route.
 */
export class TradeRoute extends FreeColGameObject {
  static logger: Logger = null;
  static readonly TAG: string = 'tradeRoute';
  /**
   * The name of this trade route.
   */
  name: string = null;
  /**
   * The {@code Player} who owns this trade route.  This is
   * necessary to ensure that malicious clients can not modify the
   * trade routes of other players.
   */
  owner: Player = null;
  /**
   * A list of stops.
   */
  stops: List<TradeRouteStop> = null;
  /**
   * Silence the messaging for this trade route.
   */
  silent: boolean = false;
  static readonly NAME_TAG: string = 'name';
  static readonly OWNER_TAG: string = 'owner';
  static readonly SILENT_TAG: string = 'silent';
  $init_TradeRoute() {
    this.stops = new ArrayList();
    this.silent = false;
  }
  /**
   * Creates a new {@code TradeRoute} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param name The name of the trade route.
   * @param player The owner {@code Player}.
   */
  _TradeRoute$Game$String$Player(game: Game, name: string, player: Player): this {
    this._FreeColGameObject$Game(game);
    this.$init_TradeRoute();
    this.name = name;
    this.owner = player;
    this.silent = false;
    return this;
  }
  /**
   * Creates a new {@code TradeRoute} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _TradeRoute$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_TradeRoute();
    return this;
  }
  /**
   * Does this trade route generate no messages to the player?
   *
   * @return True if this trade route is silent.
   */
  isSilent(): boolean {
    return this.silent;
  }
  /**
   * Set the silence status of this trade route.
   *
   * @param silent The new silence status of this trade route.
   */
  setSilent(silent: boolean): void {
    this.silent = silent;
  }
  /**
   * Get the number of stops in this trade route.
   *
   * @return The number of stops, or negative on error.
   */
  getStopCount(): number {
    {
      return this.stops.size();
    }
  }
  /**
   * Get a stop in the trade route by index.
   *
   * @param index The index to look up.
   * @return The {@code TradeRouteStop} found, or null if the index
   *     is invalid.
   */
  getStop(index: number): TradeRouteStop {
    {
      return (index >= 0 && index < this.stops.size()) ? this.stops.get(index) : null;
    }
  }
  /**
   * Get the stops in this trade route.
   *
   * @return A list of {@code TradeRouteStop}s.
   */
  getStopList(): List<TradeRouteStop> {
    {
      return new ArrayList(this.stops);
    }
  }
  /**
   * Get a list of the trade route stops in this trade route, starting
   * at a given stop (inclusive) and a final stop (exclusive).
   *
   * @param start The starting {@code TradeRouteStop}.
   * @param end The end {@code TradeRouteStop}.
   * @return A list of stops, or null on error.
   */
  getStopSublist(start: TradeRouteStop, end: TradeRouteStop): List<TradeRouteStop> {
    let i0 = this.getIndex(start);
    let in$ = this.getIndex(end);
    if (i0 < 0 || in$ < 0) {
      return null;
    }
    let result = new ArrayList();
    {
      while (i0 !== in$) {
        result.add(this.stops.get(i0));
        if (++i0 >= this.stops.size()) {
          i0 = 0;
        }
      }
    }
    return result;
  }
  /**
   * Add a new {@code TradeRouteStop} to this trade route.
   *
   * @param stop The {@code TradeRouteStop} to add.
   */
  addStop(stop: TradeRouteStop): void {
    {
      this.stops.add(stop);
    }
  }
  /**
   * Remove a {@code TradeRouteStop} from this trade route.
   *
   * @param stop The {@code TradeRouteStop} to remove.
   */
  removeStop(stop: TradeRouteStop): void {
    {
      this.stops.remove(stop);
    }
  }
  /**
   * Remove any stops matching a given location.
   *
   * @param loc The {@code Location} to match.
   * @return True if any stop was removed.
   */
  removeMatchingStops(loc: Location): boolean {
    {
      return CollectionUtils.removeInPlace$Collection$Predicate(this.stops, (trs) => Map_.isSameLocation(trs.getLocation(), loc));
    }
  }
  /**
   * Get the index of a stop in this trade route.
   *
   * @param stop The {@code TradeRouteStop} to look for.
   * @return The index of the given stop, or negative on failure.
   */
  getIndex(stop: TradeRouteStop): number {
    {
      let i = 0;
      for (const $it0 = this.stops.iterator(); $it0.hasNext(); ) {
        let trs = $it0.next();
        if (trs === stop) {
          return i;
        }
        i++;
      }
    }
    return -1;
  }
  /**
   * Clear the stops in this trade route.
   */
  clearStops(): void {
    {
      this.stops.clear();
    }
  }
  /**
   * Get the units assigned to this route.
   *
   * @return A list of assigned {@code Unit}s.
   */
  getAssignedUnits(): List<Unit> {
    return CollectionUtils.transform$Stream$Predicate(this.getOwner().getUnits(), CollectionUtils.matchKey$Object$Function(this, ($p0) => $p0.getTradeRoute()));
  }
  /**
   * Is a stop valid for a given unit?
   *
   * @param unit The {@code Unit} to check.
   * @param stop The {@code TradeRouteStop} to check.
   * @return True if the stop is valid.
   */
  static isStopValid$Unit$TradeRouteStop(unit: Unit, stop: TradeRouteStop): boolean {
    return TradeRoute.isStopValid$Player$TradeRouteStop(unit.getOwner(), stop);
  }
  /**
   * Is a stop valid for a given player?
   *
   * @param player The {@code Player} to check.
   * @param stop The {@code TradeRouteStop} to check.
   * @return True if the stop is valid.
   */
  static isStopValid$Player$TradeRouteStop(player: Player, stop: TradeRouteStop): boolean {
    return (stop == null) ? false : stop.isValid(player);
  }
  /**
   * Check the uniqueness of the trade route name.
   *
   * @return Null if the name is unique, or a {@code StringTemplate}
   *     containing an error message if not.
   */
  verifyUniqueName(): StringTemplate {
    return (this.getOwner().getTradeRouteByName(this.name, this) != null) ? StringTemplate.template$String('model.tradeRoute.duplicateName').addName$String$String('%name%', this.name) : null;
  }
  /**
   * Check that the trade route is valid.
   *
   * @return Null if the route is valid, or a {@code StringTemplate}
   *     explaining the problem if invalid.
   */
  verify(): StringTemplate {
    if (this.name == null) {
      return StringTemplate.template$String('model.tradeRoute.nullName');
    }
    if (this.owner == null) {
      return StringTemplate.template$String('model.tradeRoute.nullOwner');
    }
    if (this.getStopCount() < 2) {
      return StringTemplate.template$String('model.tradeRoute.notEnoughStops');
    }
    let always = new HashSet(this.getStop(0).getCargo());
    let empty = true;
    let n = this.getStopCount();
    for (let i = 0; i < n; i++) {
      let stop = this.getStop(i);
      if (!TradeRoute.isStopValid$Player$TradeRouteStop(this.owner, stop)) {
        return stop.invalidStopLabel(this.owner);
      }
      if (!stop.getCargo().isEmpty()) {
        empty = false;
      }
      always.retainAll(stop.getCargo());
    }
    let enhancedTradeRoutes = this.getSpecification().getBoolean(GameOptions.ENHANCED_TRADE_ROUTES);
    return (empty) ? StringTemplate.template$String('model.tradeRoute.allEmpty') : (!enhancedTradeRoutes && !always.isEmpty()) ? StringTemplate.template$String('model.tradeRoute.alwaysPresent').addNamed$String$Named('%goodsType%', CollectionUtils.first$Collection(always)) : null;
  }
  /**
   * {@inheritDoc}
   */
  getName(): string {
    return this.name;
  }
  /**
   * {@inheritDoc}
   */
  setName(newName: string): void {
    this.name = newName;
  }
  /**
   * {@inheritDoc}
   */
  getOwner(): Player {
    return this.owner;
  }
  /**
   * {@inheritDoc}
   */
  setOwner(newOwner: Player): void {
    this.owner = newOwner;
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    let ver = this.verify();
    if (ver != null) {
      lb.add(['\n  In ', this.getId(), ' ', Messages.message$StringTemplate(ver)]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(TradeRoute));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.name = o.getName();
    this.owner = o.getOwner();
    this.clearStops();
    for (const $it1 = o.getStopList().iterator(); $it1.hasNext(); ) {
      let trs = $it1.next();
      this.addStop(new TradeRouteStop()._TradeRouteStop$TradeRouteStop(trs));
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute(TradeRoute.NAME_TAG, this.getName());
    xw.writeAttribute$String$FreeColObject(TradeRoute.OWNER_TAG, this.getOwner());
    xw.writeAttribute$String$boolean(TradeRoute.SILENT_TAG, this.isSilent());
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it2 = this.stops.iterator(); $it2.hasNext(); ) {
      let stop = $it2.next();
      stop.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.name = xr.getAttribute$String$String(TradeRoute.NAME_TAG, null);
    this.owner = xr.findFreeColGameObject(this.getGame(), TradeRoute.OWNER_TAG, $J.cls(Player), null, true);
    this.silent = xr.getAttribute$String$boolean(TradeRoute.SILENT_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.clearStops();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(TradeRouteStop.TAG, tag)) {
      this.addStop(new TradeRouteStop()._TradeRouteStop$Game$FreeColXMLReader(this.getGame(), xr));
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return TradeRoute.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' "').append(this.name).append(String.fromCharCode(34 /* '"' */));
    if (this.owner != null) {
      sb.append(' owner=').append(this.owner.getId());
    }
    sb.append(' silent=').append(String(this.silent));
    for (const $it3 = this.getStopList().iterator(); $it3.hasNext(); ) {
      let stop = $it3.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(stop));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    TradeRoute.logger = Logger.getLogger($J.cls(TradeRoute).getName());
  }
}

$J.define(TradeRoute, 'net.sf.freecol.common.model.TradeRoute', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Nameable', 'net.sf.freecol.common.model.Ownable'], sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_TradeRoute$Game$String', 'net.sf.freecol.common.model.Game,java.lang.String,net.sf.freecol.common.model.Player': '_TradeRoute$Game$String$Player' }, returns: { 'getXMLTagName': 'java.lang.String', 'getOwner': 'net.sf.freecol.common.model.Player', 'getName': 'java.lang.String', 'getAssignedUnits': 'java.util.List', 'getStopList': 'java.util.List', 'getStopCount': 'int', 'isSilent': 'boolean' }, meths: { 'isStopValid(net.sf.freecol.common.model.Player,net.sf.freecol.common.model.TradeRouteStop)': 'isStopValid$Player$TradeRouteStop', 'isStopValid(net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.TradeRouteStop)': 'isStopValid$Unit$TradeRouteStop' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Player = $J.load('net.sf.freecol.common.model.Player');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  TradeRouteStop = $J.load('net.sf.freecol.common.model.TradeRouteStop');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
