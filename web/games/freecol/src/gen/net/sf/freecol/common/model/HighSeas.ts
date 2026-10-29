// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/HighSeas.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger } from '../../../../../../jre/index.ts';
import { UnitLocation } from './UnitLocation.ts';

let FreeColObject, Location, StringTemplate, Unit, UnitLocation$NoAddReason, CollectionUtils, StringUtils;

/**
 * An object representing the high seas between continents.
 */
export class HighSeas extends UnitLocation {
  static logger: Logger = null;
  static readonly TAG: string = 'highSeas';
  /**
   * The destinations this HighSeas object connects.
   */
  destinations: List<Location> = null;
  static readonly DESTINATION_TAG: string = 'destination';
  $init_HighSeas() {
    this.destinations = new ArrayList();
  }
  /**
   * Simple constructor.
   *
   * @param game The enclosing {@code Game}.
   */
  _HighSeas$Game(game: Game): this {
    this._UnitLocation$Game(game);
    this.$init_HighSeas();
    return this;
  }
  /**
   * Create a new high seas.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _HighSeas$Game$String(game: Game, id: string): this {
    this._UnitLocation$Game$String(game, id);
    this.$init_HighSeas();
    return this;
  }
  /**
   * Get the destinations connected by these seas.
   *
   * @return A list of {@code Location}s.
   */
  getDestinations(): List<Location> {
    return this.destinations;
  }
  /**
   * Convenience debug function to collect the destination ids.
   *
   * @return A string representation of the destination identifiers.
   */
  destinationsToString(): string {
    return StringUtils.join$String$Collection(',', CollectionUtils.transform$Collection$Predicate$Function(this.destinations, CollectionUtils.alwaysTrue(), ($p0) => $p0.getId()));
  }
  /**
   * Set the destination list.
   *
   * @param destinations The new list of destination {@code Location}s.
   */
  setDestinations(destinations: List<Location>): void {
    this.destinations.clear();
    this.destinations.addAll(destinations);
  }
  /**
   * Add a single destination to this HighSeas instance.
   *
   * @param destination A destination {@code Location}.
   */
  addDestination(destination: Location): void {
    if (destination != null) {
      if (!this.destinations.contains(destination)) {
        this.destinations.add(destination);
      }
    } else {
      HighSeas.logger.warning('Tried to add null destination to ' + this.getId());
    }
  }
  /**
   * Remove a single destination from this HighSeas instance.
   *
   * @param destination A destination {@code Location}.
   */
  removeDestination(destination: Location): void {
    this.destinations.remove(destination);
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabel(): StringTemplate {
    return StringTemplate.key$String('model.tile.highSeas.name');
  }
  /**
   * {@inheritDoc}
   */
  up(): Location {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getRank(): number {
    return Location.LOCATION_RANK_HIGHSEAS;
  }
  /**
   * {@inheritDoc}
   */
  toShortString(): string {
    return 'HighSeas';
  }
  /**
   * {@inheritDoc}
   */
  getNoAddReason(locatable: Locatable): UnitLocation$NoAddReason {
    return (locatable instanceof Unit && (locatable).isNaval()) ? UnitLocation$NoAddReason.NONE : UnitLocation$NoAddReason.WRONG_TYPE;
  }
  /**
   * {@inheritDoc}
   */
  getLinkTarget(player: Player): FreeColGameObject {
    return player.getEurope();
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(HighSeas));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.destinations.clear();
    for (const $it0 = o.getDestinations().iterator(); $it0.hasNext(); ) {
      let loc = $it0.next();
      this.destinations.add(game.updateLocationRef(loc));
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it1 = CollectionUtils.transform$Collection$Predicate(this.destinations, CollectionUtils.isNotNull$()).iterator(); $it1.hasNext(); ) {
      let loc = $it1.next();
      xw.writeStartElement(HighSeas.DESTINATION_TAG);
      xw.writeLocationAttribute(FreeColObject.ID_ATTRIBUTE_TAG, loc);
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.destinations.clear();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let game = this.getGame();
    let tag = xr.getLocalName();
    if ($J.equals(HighSeas.DESTINATION_TAG, tag)) {
      this.addDestination(xr.getLocationAttribute(game, FreeColObject.ID_ATTRIBUTE_TAG, true));
      xr.closeTag$String(HighSeas.DESTINATION_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return HighSeas.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.getId();
  }
  static $clinit() {
    HighSeas.logger = Logger.getLogger($J.cls(HighSeas).getName());
  }
}

$J.define(HighSeas, 'net.sf.freecol.common.model.HighSeas', { kind: 'class', sup: 'net.sf.freecol.common.model.UnitLocation', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_HighSeas$Game$String', 'net.sf.freecol.common.model.Game': '_HighSeas$Game' }, returns: { 'getXMLTagName': 'java.lang.String', 'getRank': 'int', 'getLocationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getDestinations': 'java.util.List' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Location = $J.load('net.sf.freecol.common.model.Location');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
