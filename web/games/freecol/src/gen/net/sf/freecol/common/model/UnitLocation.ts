// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/UnitLocation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JEnum, Logger } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let FreeColException, Messages, Colony, Goods, IndianSettlement, StringTemplate, Unit, CollectionUtils, StringUtils;

/**
 * The {@code UnitLocation} is a place where a {@code Unit}
 * can be put.  The UnitLocation can not store any other Locatables,
 * such as {@link Goods}, or {@link TileItem}s.
 *
 * Be *very* careful with use of the units list for low level routines
 * as distinct from use of getUnits()/getUnitList()/getUnitCount()
 * etc.  Beware that Colony is a UnitLocation, but it does *not* store
 * its units in the unit list, they live in its WorkLocations.
 * Therefore Colony overrides several such routines to do the right thing,
 * which can lead to confusion especially when debugging.
 *
 * @see Locatable
 */
export class UnitLocation extends FreeColGameObject {
  static logger: Logger = null;
  /**
   * The Units present in this Location.
   */
  units: List<Unit> = null;
  $init_UnitLocation() {
    this.units = new ArrayList();
  }
  /**
   * Creates a new {@code UnitLocation} instance.
   *
   * @param game The enclosing {@code Game}.
   */
  _UnitLocation$Game(game: Game): this {
    this._FreeColGameObject$Game(game);
    this.$init_UnitLocation();
    return this;
  }
  /**
   * Creates a new {@code UnitLocation} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _UnitLocation$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_UnitLocation();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  intern(): void {
    super.intern();
    for (const $it0 = this.units.iterator(); $it0.hasNext(); ) {
      let u = $it0.next();
      u.intern();
    }
  }
  /**
   * Internal addition of a unit to this location.
   *
   * @param u The {@code Unit} to add.
   * @return True if the unit is added.
   */
  addUnit(u: Unit): boolean {
    if (u == null) {
      return false;
    }
    let ret = false;
    u.setLocationNoUpdate(this);
    {
      ret = this.units.add(u);
    }
    return ret;
  }
  /**
   * Is this unit location empty?
   *
   * @return a {@code boolean} value
   */
  isEmpty(): boolean {
    return this.getUnitCount() === 0;
  }
  /**
   * Is this unit location full?
   *
   * @return True if this location is full.
   */
  isFull(): boolean {
    return this.getUnitCount() >= this.getUnitCapacity();
  }
  /**
   * Gets the first Unit at this unit location.
   *
   * @return The first {@code Unit}.
   */
  getFirstUnit(): Unit {
    return CollectionUtils.first$Stream(this.getUnits());
  }
  /**
   * Gets the last Unit at this unit location.
   *
   * @return The last {@code Unit}.
   */
  getLastUnit(): Unit {
    if (this.isEmpty()) {
      return null;
    }
    let units = this.getUnitList();
    return units.get((units.size() - 1) | 0);
  }
  /**
   * Gets the total amount of Units at this Location, including
   * units on a carrier.
   *
   * @return The total number of {@code Unit}s at this
   *     {@code Location}.
   */
  getTotalUnitCount(): number {
    return CollectionUtils.sum$Stream$ToIntFunction(this.getUnits(), (u) => (1 + u.getUnitCount()) | 0);
  }
  /**
   * Checks if there is a useable carrier unit with a specified
   * minimum amount of space available in this location.
   *
   * @param space The amount of space to require.
   * @return True if there is a suitable unit present.
   * @see Unit#isCarrier
   */
  hasCarrierWithSpace(space: number): boolean {
    return CollectionUtils.any$Stream$Predicate(this.getUnits(), (u) => u.isCarrier() && !u.isDamagedAndUnderForcedRepair() && u.getSpaceLeft() >= space);
  }
  /**
   * Gets a list of all naval units here.
   *
   * @return A list of naval {@code Unit}s present.
   */
  getNavalUnits(): List<Unit> {
    return CollectionUtils.transform$Stream$Predicate(this.getUnits(), ($p0) => $p0.isNaval());
  }
  /**
   * Gets a carrier for the supplied unit, if one exists.
   *
   * @param unit The {@code Unit} to carry.
   * @return A suitable carrier or null if none found.
   */
  getCarrierForUnit(unit: Unit): Unit {
    return CollectionUtils.find$Stream$Predicate(this.getUnits(), (u) => u.couldCarry$Unit(unit));
  }
  /**
   * {@inheritDoc}
   */
  getDisposables(): Stream<FreeColGameObject> {
    {
      return CollectionUtils.concat(CollectionUtils.flatten$Collection$Function(this.units, ($p0) => $p0.getDisposables()), [super.getDisposables()]);
    }
  }
  /**
   * {@inheritDoc}
   */
  disposeResources(): void {
    {
      this.units.clear();
    }
    super.disposeResources();
  }
  /**
   * {@inheritDoc}
   */
  getTile$(): Tile {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabel(): StringTemplate {
    return StringTemplate.key$String(this.getId());
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabelFor(player: Player): StringTemplate {
    return this.getLocationLabel();
  }
  /**
   * {@inheritDoc}
   */
  add(locatable: Locatable): boolean {
    if (locatable instanceof Unit) {
      let unit = locatable;
      if (this.contains(unit)) {
        return true;
      } else if (this.canAdd(unit)) {
        return this.addUnit(unit);
      }
    } else if (locatable instanceof Goods) {
      locatable.setLocation(null);
      UnitLocation.logger.finest('Dumped ' + $J.str(locatable) + ' in UnitLocation with id ' + this.getId());
      return true;
    } else {
      UnitLocation.logger.warning('Tried to add Locatable ' + $J.str(locatable) + ' to UnitLocation with id ' + this.getId() + '.');
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  remove(locatable: Locatable): boolean {
    if (locatable instanceof Unit) {
      let unit = locatable;
      {
        if (!this.units.remove(unit)) {
          return false;
        }
      }
      unit.setLocationNoUpdate(null);
      return true;
    } else {
      UnitLocation.logger.warning('Tried to remove non-Unit ' + $J.str(locatable) + ' from UnitLocation: ' + this.getId());
      return false;
    }
  }
  /**
   * {@inheritDoc}
   */
  contains(locatable: Locatable): boolean {
    if (!(locatable instanceof Unit)) {
      return false;
    }
    {
      return this.units.contains(locatable);
    }
  }
  /**
   * {@inheritDoc}
   */
  canAdd(locatable: Locatable): boolean {
    return this.getNoAddReason(locatable) === UnitLocation$NoAddReason.NONE;
  }
  /**
   * {@inheritDoc}
   */
  getUnitCount(): number {
    {
      return this.units.size();
    }
  }
  /**
   * {@inheritDoc}
   */
  getUnits(): Stream<Unit> {
    {
      return this.units.stream();
    }
  }
  /**
   * {@inheritDoc}
   */
  getUnitList(): List<Unit> {
    {
      return (this.units.isEmpty()) ? Collections.emptyList() : new ArrayList(this.units);
    }
  }
  /**
   * {@inheritDoc}
   */
  getGoodsContainer(): GoodsContainer {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getSettlement(): Settlement {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getColony(): Colony {
    let settlement = this.getSettlement();
    return (settlement instanceof Colony) ? settlement : null;
  }
  /**
   * {@inheritDoc}
   */
  getIndianSettlement(): IndianSettlement {
    let settlement = this.getSettlement();
    return (settlement instanceof IndianSettlement) ? settlement : null;
  }
  /**
   * Gets the current space taken by the units in this location.
   *
   * Note that Units are also unit locations, but their space taken is
   * derived from the spec, so this routine must be overrideable.
   *
   * @return The sum of the space taken by the units in this location.
   */
  getSpaceTaken(): number {
    return CollectionUtils.sum$Stream$ToIntFunction(this.getUnits(), ($p0) => $p0.getSpaceTaken());
  }
  /**
   * Move the given unit to the front of the units list.
   *
   * @param u The {@code Unit} to move to the front.
   */
  moveToFront(u: Unit): void {
    {
      if (this.units.remove(u)) {
        this.units.add(0, u);
      }
    }
  }
  /**
   * Clear the units from this container.
   */
  clearUnitList(): void {
    {
      this.units.clear();
    }
  }
  /**
   * Gets the reason why a given {@code Locatable} can not be
   * added to this Location.
   *
   * Be careful to test for unit presence last before success
   * (NoAddReason.NONE) except perhaps for the capacity test, so
   * that we can treat ALREADY_PRESENT as success in some cases
   * (e.g. if the unit changes type --- does it still have a
   * required skill?)
   *
   * FIXME: consider moving this up to Location?
   *
   * @param locatable The {@code Locatable} to test.
   * @return The reason why adding would fail.
   */
  getNoAddReason(locatable: Locatable): UnitLocation$NoAddReason {
    let unit = (locatable instanceof Unit) ? locatable : null;
    return (unit == null) ? UnitLocation$NoAddReason.WRONG_TYPE : (!this.isEmpty() && this.getFirstUnit().getOwner() !== unit.getOwner()) ? UnitLocation$NoAddReason.OCCUPIED_BY_ENEMY : (this.contains(unit)) ? UnitLocation$NoAddReason.ALREADY_PRESENT : (((unit.getSpaceTaken() + this.getSpaceTaken()) | 0) > this.getUnitCapacity()) ? UnitLocation$NoAddReason.CAPACITY_EXCEEDED : UnitLocation$NoAddReason.NONE;
  }
  /**
   * Gets the maximum number of {@code Units} this Location
   * can hold.  To be overridden by subclasses.
   *
   * @return Integer.MAX_VALUE, denoting no effective limit.
   */
  getUnitCapacity(): number {
    return 2147483647;
  }
  /**
   * What would the price be for a collection of goods at this location?
   *
   * @param goods The list of {@code AbstractGoods} to check for.
   * @return The net cost of acquiring the goods at this location.
   * @exception FreeColException if the goods are unavailable for any reason.
   */
  priceGoods(goods: List<AbstractGoods>): number {
    if (goods.isEmpty()) {
      return 0;
    }
    throw new FreeColException()._FreeColException$String('Not available: ' + $J.str(goods.get(0)));
  }
  /**
   * Equip a unit for a role using resources at this location.
   *
   * @param unit The {@code Unit} to equip.
   * @param role The {@code Role} to build for.
   * @param roleCount The role count.
   * @return True if the equipping succeeded.
   */
  equipForRole(unit: Unit, role: Role, roleCount: number): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(UnitLocation));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.clearUnitList();
    for (const $it1 = o.units.iterator(); $it1.hasNext(); ) {
      let u = $it1.next();
      let nu = game.update$FreeColGameObject$boolean(u, true);
      this.addUnit(nu);
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    {
      for (const $it2 = this.units.iterator(); $it2.hasNext(); ) {
        let unit = $it2.next();
        if (unit.getLocation() !== this) {
          UnitLocation.logger.warning('UnitLocation ' + $J.str(this) + ' contains unit ' + $J.str(unit) + ' with bogus location ' + $J.str(unit.getLocation()) + ', fixing.');
          unit.setLocationNoUpdate(this);
        }
        unit.toXML$FreeColXMLWriter(xw);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.clearUnitList();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(Unit.TAG, tag)) {
      this.addUnit(xr.readFreeColObject$Game$Class(this.getGame(), $J.cls(Unit)));
    } else {
      super.readChild(xr);
    }
  }
  static $clinit() {
    UnitLocation.logger = Logger.getLogger($J.cls(UnitLocation).getName());
  }
}

export class UnitLocation$NoAddReason extends JEnum {
  static NONE: UnitLocation$NoAddReason = null;
  static ALREADY_PRESENT: UnitLocation$NoAddReason = null;
  static WRONG_TYPE: UnitLocation$NoAddReason = null;
  static CAPACITY_EXCEEDED: UnitLocation$NoAddReason = null;
  static OCCUPIED_BY_ENEMY: UnitLocation$NoAddReason = null;
  static OWNED_BY_ENEMY: UnitLocation$NoAddReason = null;
  static ANOTHER_COLONY: UnitLocation$NoAddReason = null;
  static COLONY_CENTER: UnitLocation$NoAddReason = null;
  static MISSING_ABILITY: UnitLocation$NoAddReason = null;
  static MISSING_SKILL: UnitLocation$NoAddReason = null;
  static MINIMUM_SKILL: UnitLocation$NoAddReason = null;
  static MAXIMUM_SKILL: UnitLocation$NoAddReason = null;
  static CLAIM_REQUIRED: UnitLocation$NoAddReason = null;
  static WORKER_DAMAGED: UnitLocation$NoAddReason = null;
  static $VALUES: UnitLocation$NoAddReason[] = null;
  _UnitLocation$NoAddReason($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Get a message key describing this reason.
   *
   * @return A message key.
   */
  getKey(): string {
    return 'noAddReason.' + StringUtils.getEnumKey(this);
  }
  /**
   * Get the description key.
   *
   * @return The description key.
   */
  getDescriptionKey(): string {
    return Messages.descriptionKey$String('model.' + this.getKey());
  }
  static values(): UnitLocation$NoAddReason[] { return UnitLocation$NoAddReason.$VALUES.slice(); }
  static valueOf(name: string): UnitLocation$NoAddReason { return $J.enumValueOf(UnitLocation$NoAddReason, name); }
  static $clinit() {
    UnitLocation$NoAddReason.NONE = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('NONE', 0);
    UnitLocation$NoAddReason.ALREADY_PRESENT = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('ALREADY_PRESENT', 1);
    UnitLocation$NoAddReason.WRONG_TYPE = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('WRONG_TYPE', 2);
    UnitLocation$NoAddReason.CAPACITY_EXCEEDED = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('CAPACITY_EXCEEDED', 3);
    UnitLocation$NoAddReason.OCCUPIED_BY_ENEMY = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('OCCUPIED_BY_ENEMY', 4);
    UnitLocation$NoAddReason.OWNED_BY_ENEMY = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('OWNED_BY_ENEMY', 5);
    UnitLocation$NoAddReason.ANOTHER_COLONY = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('ANOTHER_COLONY', 6);
    UnitLocation$NoAddReason.COLONY_CENTER = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('COLONY_CENTER', 7);
    UnitLocation$NoAddReason.MISSING_ABILITY = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('MISSING_ABILITY', 8);
    UnitLocation$NoAddReason.MISSING_SKILL = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('MISSING_SKILL', 9);
    UnitLocation$NoAddReason.MINIMUM_SKILL = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('MINIMUM_SKILL', 10);
    UnitLocation$NoAddReason.MAXIMUM_SKILL = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('MAXIMUM_SKILL', 11);
    UnitLocation$NoAddReason.CLAIM_REQUIRED = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('CLAIM_REQUIRED', 12);
    UnitLocation$NoAddReason.WORKER_DAMAGED = new UnitLocation$NoAddReason()._UnitLocation$NoAddReason('WORKER_DAMAGED', 13);
    UnitLocation$NoAddReason.$VALUES = [UnitLocation$NoAddReason.NONE, UnitLocation$NoAddReason.ALREADY_PRESENT, UnitLocation$NoAddReason.WRONG_TYPE, UnitLocation$NoAddReason.CAPACITY_EXCEEDED, UnitLocation$NoAddReason.OCCUPIED_BY_ENEMY, UnitLocation$NoAddReason.OWNED_BY_ENEMY, UnitLocation$NoAddReason.ANOTHER_COLONY, UnitLocation$NoAddReason.COLONY_CENTER, UnitLocation$NoAddReason.MISSING_ABILITY, UnitLocation$NoAddReason.MISSING_SKILL, UnitLocation$NoAddReason.MINIMUM_SKILL, UnitLocation$NoAddReason.MAXIMUM_SKILL, UnitLocation$NoAddReason.CLAIM_REQUIRED, UnitLocation$NoAddReason.WORKER_DAMAGED];
  }
}

$J.define(UnitLocation, 'net.sf.freecol.common.model.UnitLocation', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Location'], sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_UnitLocation$Game$String', 'net.sf.freecol.common.model.Game': '_UnitLocation$Game' }, returns: { 'getUnitCapacity': 'int', 'getSpaceTaken': 'int', 'getIndianSettlement': 'net.sf.freecol.common.model.IndianSettlement', 'getColony': 'net.sf.freecol.common.model.Colony', 'getSettlement': 'net.sf.freecol.common.model.Settlement', 'getGoodsContainer': 'net.sf.freecol.common.model.GoodsContainer', 'getUnitList': 'java.util.List', 'getUnits': 'java.util.stream.Stream', 'getUnitCount': 'int', 'getLocationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getTile$': 'net.sf.freecol.common.model.Tile', 'getDisposables': 'java.util.stream.Stream', 'getNavalUnits': 'java.util.List', 'getTotalUnitCount': 'int', 'getLastUnit': 'net.sf.freecol.common.model.Unit', 'getFirstUnit': 'net.sf.freecol.common.model.Unit', 'isFull': 'boolean', 'isEmpty': 'boolean' }, meths: { 'getTile()': 'getTile$' }, clinit: true, lazy: ['logger'] });
$J.define(UnitLocation$NoAddReason, 'net.sf.freecol.common.model.UnitLocation$NoAddReason', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_UnitLocation$NoAddReason' }, returns: { 'getDescriptionKey': 'java.lang.String', 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'NONE', 'ALREADY_PRESENT', 'WRONG_TYPE', 'CAPACITY_EXCEEDED', 'OCCUPIED_BY_ENEMY', 'OWNED_BY_ENEMY', 'ANOTHER_COLONY', 'COLONY_CENTER', 'MISSING_ABILITY', 'MISSING_SKILL', 'MINIMUM_SKILL', 'MAXIMUM_SKILL', 'CLAIM_REQUIRED', 'WORKER_DAMAGED'] });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
