// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Europe.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, JEnum, Logger, RuntimeException, Stream, UnsupportedOperationException } from '../../../../../../jre/index.ts';
import { UnitLocation } from './UnitLocation.ts';

let ImageLibrary, Utility, FreeColException, Ability, AbstractUnit, FeatureContainer, Goods, GoodsContainer, Location, Modifier, Player, Role, StringTemplate, Unit, Unit$UnitState, UnitType, GameOptions, CollectionUtils;

/**
 * Represents Europe in the game.  Each {@code Player} has it's
 * own {@code Europe}.
 *
 * In Europe, you can recruit, train and purchase new units.  You can
 * also equip units, as well as sell and buy goods.
 */
export class Europe extends UnitLocation {
  static logger: Logger = null;
  /**
   * Class index for Europe.
   */
  static readonly EUROPE_CLASS_INDEX: number = 30;
  static readonly TAG: string = 'europe';
  /**
   * The initial recruit price.
   */
  static readonly RECRUIT_PRICE_INITIAL: number = 200;
  /**
   * The initial lower bound on recruitment price.
   */
  static readonly LOWER_CAP_INITIAL: number = 80;
  static readonly UNIT_CHANGE: string = 'unitChange';
  static ABILITY_DRESS_MISSIONARY: Ability = null;
  /**
   * This list represents the types of the units that can be
   * recruited in Europe.
   */
  recruitables: List<AbstractUnit> = null;
  /**
   * Prices for trainable or purchasable units.
   */
  unitPrices: JMap<UnitType, number> = null;
  /**
   * Current price to recruit a unit.
   */
  baseRecruitPrice: number = 0;
  /**
   * The lower bound on recruitment price.
   */
  recruitLowerCap: number = 0;
  /**
   * The owner of this instance of Europe.
   */
  owner: Player = null;
  /**
   * A feature container for this Europe's special features.
   */
  featureContainer: FeatureContainer = null;
  static readonly OWNER_TAG: string = 'owner';
  static readonly PRICE_TAG: string = 'price';
  static readonly RECRUIT_LOWER_CAP_TAG: string = 'recruitLowerCap';
  static readonly RECRUIT_NUMBER_TAG: string = 'number';
  static readonly RECRUIT_PRICE_TAG: string = 'recruitPrice';
  static readonly RECRUIT_ROLE_TAG: string = 'role';
  static readonly RECRUIT_TAG: string = 'recruit';
  static readonly RECRUIT_TYPE_TAG: string = 'type';
  static readonly UNIT_PRICE_TAG: string = 'unitPrice';
  static readonly UNIT_TYPE_TAG: string = 'unitType';
  static readonly RECRUIT_ID_TAG: string = 'id';
  $init_Europe() {
    this.recruitables = new ArrayList();
    this.unitPrices = new HashMap();
    this.featureContainer = new FeatureContainer()._FeatureContainer();
  }
  /**
   * Constructor for ServerEurope.
   *
   * @param game The enclosing {@code Game}.
   * @param owner The owning {@code Player}.
   */
  _Europe$Game$Player(game: Game, owner: Player): this {
    this._UnitLocation$Game(game);
    this.$init_Europe();
    this.owner = owner;
    this.baseRecruitPrice = Europe.RECRUIT_PRICE_INITIAL;
    this.recruitLowerCap = Europe.LOWER_CAP_INITIAL;
    return this;
  }
  /**
   * Creates a new {@code Europe} with the given identifier.
   *     (
   * The object should be initialized later.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _Europe$Game$String(game: Game, id: string): this {
    this._UnitLocation$Game$String(game, id);
    this.$init_Europe();
    return this;
  }
  /**
   * Get a list of the current recruitables.
   *
   * @return A list of recruitable {@code AbstractUnit}s.
   */
  getRecruitables(): List<AbstractUnit> {
    return this.recruitables;
  }
  /**
   * Get an expanded list of recruitable abstract units, with single counts
   * and limited to valid indices.
   *
   * @param full If true, return the full list, otherwise limit to the
   *     standard number of migrants.
   * @return A list of {@code AbstractUnit}s.
   */
  getExpandedRecruitables(full: boolean): List<AbstractUnit> {
    let spec = this.getSpecification();
    let ret = new ArrayList();
    let c = 0;
    for (const $it0 = this.recruitables.iterator(); $it0.hasNext(); ) {
      let au = $it0.next();
      for (let n = au.getNumber(); n > 0; n--) {
        if (!full && c >= Europe$MigrationType.MIGRANT_COUNT) {
          break;
        }
        ret.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(au.getType(spec), au.getRoleId(), 1));
        c++;
      }
    }
    return ret;
  }
  /**
   * Set the recruitables list.
   *
   * @param recruitables The new list of recruitables {@code AbstractUnit}s.
   */
  setRecruitables(recruitables: List<AbstractUnit>): void {
    this.recruitables.clear();
    this.recruitables.addAll(recruitables);
  }
  /**
   * Add a recruitable abstract unit.
   *
   * @param au The recruitable {@code AbstractUnit} to add.
   * @param force If true, add beyond the standard limit.
   * @return True if the recruitable was added.
   */
  addRecruitable$AbstractUnit$boolean(au: AbstractUnit, force: boolean): boolean {
    if (force || this.recruitables.size() < Europe$MigrationType.MIGRANT_COUNT) {
      this.recruitables.add(au);
      return true;
    }
    return false;
  }
  /**
   * Add a recruitable unit type.
   *
   * @param unitType The recruitable {@code UnitType} to add.
   * @param force If true, add beyond the standard limit.
   * @return True if the recruitable was added.
   */
  addRecruitable$UnitType$boolean(unitType: UnitType, force: boolean): boolean {
    let role = unitType.getDefaultRole();
    if (role == null) {
      role = this.getSpecification().getDefaultRole();
    }
    return this.addRecruitable$AbstractUnit$boolean(new AbstractUnit()._AbstractUnit$UnitType$String$int(unitType, role.getId(), 1), force);
  }
  /**
   * Get the unit price map.
   *
   * @return The map of {@code UnitType} to its price.
   */
  getUnitPrices(): JMap<UnitType, number> {
    return this.unitPrices;
  }
  /**
   * Set the unit price map.
   *
   * @param unitPrices The new map of {@code UnitType}s to price.
   */
  setUnitPrices(unitPrices: JMap<UnitType, number>): void {
    this.unitPrices.clear();
    this.unitPrices.putAll(unitPrices);
  }
  /**
   * Gets the price of a unit in Europe.
   *
   * @param unitType The {@code UnitType} to price.
   * @return The price of this unit when trained/purchased in Europe,
   *     or UNDEFINED on failure.
   */
  getUnitPrice(unitType: UnitType): number {
    let price = this.unitPrices.get(unitType);
    return (price != null) ? price : unitType.getPrice();
  }
  /**
   * Get the base recruit price.
   *
   * @return The base recruit price.
   */
  getBaseRecruitPrice(): number {
    return this.baseRecruitPrice;
  }
  /**
   * Gets the current price for a recruit.
   *
   * @return The current price of the recruit in this {@code Europe}.
   */
  getCurrentRecruitPrice(): number {
    if (!this.owner.isColonial()) {
      return -1;
    }
    let required = this.owner.getImmigrationRequired();
    let immigration = this.owner.getImmigration();
    let difference = Math.max((required - immigration) | 0, 0);
    return Math.max($J.idiv((Math.imul(this.getBaseRecruitPrice(), difference)), required), this.recruitLowerCap);
  }
  /**
   * Get the recruit lower cap price.
   *
   * @return The lower cap on the recruit price.
   */
  getRecruitLowerCap(): number {
    return this.recruitLowerCap;
  }
  /**
   * Get any immigration produced in Europe.
   *
   * Col1 penalizes immigration by -4 per unit in Europe per turn,
   * but there is a +2 player bonus, which we might as well add
   * here.  Total immigration per turn can not be negative, but that
   * is handled in ServerPlayer.
   *
   * @param production The current total colony production.
   * @return Immigration produced this turn in Europe.
   */
  getImmigration(production: number): number {
    let spec = this.getSpecification();
    let n = CollectionUtils.count$Stream$Predicate(this.getUnits(), ($p0) => $p0.isPerson());
    n = Math.imul(n, spec.getInteger(GameOptions.EUROPEAN_UNIT_IMMIGRATION_PENALTY));
    n = (n + spec.getInteger(GameOptions.PLAYER_IMMIGRATION_BONUS)) | 0;
    if (((n + production) | 0) < 0) {
      n = -production;
    }
    return n;
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabel(): StringTemplate {
    return StringTemplate.key$Named(this);
  }
  /**
   * {@inheritDoc}
   */
  add(locatable: Locatable): boolean {
    let result = super.add(locatable);
    if (result && locatable instanceof Unit) {
      let unit = locatable;
      unit.setState((unit.canCarryUnits()) ? Unit$UnitState.ACTIVE : Unit$UnitState.SENTRY);
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  canAdd(locatable: Locatable): boolean {
    if (locatable instanceof Goods) {
      return true;
    }
    return super.canAdd(locatable);
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
    return Location.LOCATION_RANK_EUROPE;
  }
  /**
   * {@inheritDoc}
   */
  toShortString(): string {
    return 'Europe';
  }
  /**
   * {@inheritDoc}
   */
  getLocationImageKey(): string {
    return ImageLibrary.getNationKey(this.getOwner().getNation());
  }
  /**
   * {@inheritDoc}
   */
  priceGoods(goods: List<AbstractGoods>): number {
    let player = this.getOwner();
    let market = player.getMarket();
    let price = 0;
    for (const $it1 = goods.iterator(); $it1.hasNext(); ) {
      let ag = $it1.next();
      let goodsType = ag.getType();
      if (!player.canTrade$GoodsType(goodsType)) {
        throw new FreeColException()._FreeColException$String('Can not trade ' + $J.str(goodsType));
      }
      if (ag.getAmount() > 0) {
        price = (price + market.getBidPrice(goodsType, ag.getAmount())) | 0;
      } else {
        price = (price + market.getSalePrice$GoodsType$int(goodsType, ag.getAmount())) | 0;
      }
    }
    return price;
  }
  /**
   * {@inheritDoc}
   */
  equipForRole(unit: Unit, role: Role, roleCount: number): boolean {
    throw new RuntimeException('Only valid in the server: ' + $J.str(this));
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return this.getOwner().getEuropeNameKey();
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
  setOwner(p: Player): void {
    throw new UnsupportedOperationException();
  }
  /**
   * {@inheritDoc}
   */
  getAvailableGoodsCount(goodsType: GoodsType): number {
    return GoodsContainer.HUGE_CARGO_SIZE;
  }
  /**
   * {@inheritDoc}
   */
  getExportAmount(goodsType: GoodsType, turns: number): number {
    return (this.getOwner().canTrade$GoodsType(goodsType)) ? GoodsContainer.HUGE_CARGO_SIZE : 0;
  }
  /**
   * {@inheritDoc}
   */
  getImportAmount(goodsType: GoodsType, turns: number): number {
    return (this.getOwner().canTrade$GoodsType(goodsType)) ? GoodsContainer.HUGE_CARGO_SIZE : 0;
  }
  /**
   * {@inheritDoc}
   */
  getLocationName(tradeLocation: TradeLocation): string {
    return (tradeLocation).getNameKey();
  }
  /**
   * {@inheritDoc}
   */
  getNameAsJlabel(): JLabel {
    return Utility.localizedLabel$String(this.getLocationName(this));
  }
  /**
   * {@inheritDoc}
   */
  canBeInput(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  disposeResources(): void {
    let owner = this.getOwner();
    if (owner != null) {
      owner.setEurope(null);
      let highSeas = owner.getHighSeas();
      if (highSeas != null) {
        highSeas.removeDestination(this);
      }
    }
    super.disposeResources();
  }
  /**
   * {@inheritDoc}
   */
  getLinkTarget(player: Player): FreeColGameObject {
    return (this.getOwner() === player) ? this : null;
  }
  /**
   * {@inheritDoc}
   */
  getFeatureContainer(): FeatureContainer {
    return this.featureContainer;
  }
  /**
   * {@inheritDoc}
   */
  getAbilities$String$FreeColSpecObjectType$Turn(id: string, fcgot: FreeColSpecObjectType, turn: Turn): Stream<Ability> {
    return CollectionUtils.concat(super.getAbilities$String$FreeColSpecObjectType$Turn(id, fcgot, turn), [((id == null || $J.equals(Ability.DRESS_MISSIONARY, id)) ? Stream.of(Europe.ABILITY_DRESS_MISSIONARY) : Stream.empty())]);
  }
  /**
   * {@inheritDoc}
   */
  getClassIndex(): number {
    return Europe.EUROPE_CLASS_INDEX;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Europe));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.setRecruitables(o.getRecruitables());
    this.setUnitPrices(o.getUnitPrices());
    this.baseRecruitPrice = o.getBaseRecruitPrice();
    this.recruitLowerCap = o.getRecruitLowerCap();
    this.owner = game.updateRef$FreeColGameObject(o.getOwner());
    this.featureContainer.copy(o.getFeatureContainer());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (xw.validFor(this.getOwner())) {
      xw.writeAttribute$String$int(Europe.RECRUIT_PRICE_TAG, this.baseRecruitPrice);
      xw.writeAttribute$String$int(Europe.RECRUIT_LOWER_CAP_TAG, this.recruitLowerCap);
      xw.writeAttribute$String$FreeColObject(Europe.OWNER_TAG, this.owner);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (xw.validFor(this.getOwner())) {
      for (const $it2 = this.getSortedAbilities().iterator(); $it2.hasNext(); ) {
        let ability = $it2.next();
        ability.toXML$FreeColXMLWriter(xw);
      }
      for (const $it3 = this.getSortedModifiers().iterator(); $it3.hasNext(); ) {
        let modifier = $it3.next();
        modifier.toXML$FreeColXMLWriter(xw);
      }
      for (const $it4 = CollectionUtils.sort$Collection(this.unitPrices.keySet()).iterator(); $it4.hasNext(); ) {
        let unitType = $it4.next();
        xw.writeStartElement(Europe.UNIT_PRICE_TAG);
        xw.writeAttribute$String$FreeColObject(Europe.UNIT_TYPE_TAG, unitType);
        xw.writeAttribute$String$int(Europe.PRICE_TAG, (+this.unitPrices.get(unitType)));
        xw.writeEndElement();
      }
      for (const $it5 = this.recruitables.iterator(); $it5.hasNext(); ) {
        let au = $it5.next();
        xw.writeStartElement(Europe.RECRUIT_TAG);
        xw.writeAttribute(Europe.RECRUIT_ID_TAG, au.getId());
        xw.writeAttribute(Europe.RECRUIT_ROLE_TAG, au.getRoleId());
        xw.writeAttribute$String$int(Europe.RECRUIT_NUMBER_TAG, au.getNumber());
        xw.writeEndElement();
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.owner = xr.findFreeColGameObject(this.getGame(), Europe.OWNER_TAG, $J.cls(Player), null, true);
    this.baseRecruitPrice = xr.getAttribute$String$int(Europe.RECRUIT_PRICE_TAG, Europe.RECRUIT_PRICE_INITIAL);
    this.recruitLowerCap = xr.getAttribute$String$int(Europe.RECRUIT_LOWER_CAP_TAG, Europe.LOWER_CAP_INITIAL);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.unitPrices.clear();
    this.featureContainer.clear();
    this.recruitables.clear();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(Ability.TAG, tag)) {
      this.addAbility(new Ability()._Ability$FreeColXMLReader$Specification(xr, spec));
    } else if ($J.equals(Modifier.TAG, tag)) {
      this.addModifier(new Modifier()._Modifier$FreeColXMLReader$Specification(xr, spec));
    } else if ($J.equals(Europe.RECRUIT_TAG, tag)) {
      let unitType = xr.getType(spec, Europe.RECRUIT_TYPE_TAG, $J.cls(UnitType), null);
      if (unitType == null) {
        unitType = xr.getType(spec, Europe.RECRUIT_ID_TAG, $J.cls(UnitType), null);
      }
      if (unitType != null) {
        let role = xr.getType(spec, Europe.RECRUIT_ROLE_TAG, $J.cls(Role), unitType.getDefaultRole());
        let n = xr.getAttribute$String$int(Europe.RECRUIT_NUMBER_TAG, 1);
        this.addRecruitable$AbstractUnit$boolean(new AbstractUnit()._AbstractUnit$UnitType$String$int(unitType, role.getId(), n), true);
      }
      xr.closeTag$String(Europe.RECRUIT_TAG);
    } else if ($J.equals(Europe.UNIT_PRICE_TAG, tag)) {
      let unitType = xr.getType(spec, Europe.UNIT_TYPE_TAG, $J.cls(UnitType), null);
      let price = xr.getAttribute$String$int(Europe.PRICE_TAG, -1);
      this.unitPrices.put(unitType, price);
      xr.closeTag$String(Europe.UNIT_PRICE_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Europe.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return 'Europe';
  }
  static $clinit() {
    Europe.logger = Logger.getLogger($J.cls(Europe).getName());
    Europe.ABILITY_DRESS_MISSIONARY = new Ability()._Ability$String$boolean(Ability.DRESS_MISSIONARY, true);
  }
}

/**
 * Migration handling.
 *
 * Migration routines operate on:
 * - "indexes" which refer to a valid member of the recruitables
 *   list, and must be [0, RECRUIT_COUNT)
 * - "slots", where slot zero means "pick a random migrant" and the
 *   other slots in [1, RECRUIT_COUNT] refer to the index == slot-1
 * The following constant should be used when the random choice
 * behaviour is desired.
 */
export class Europe$MigrationType extends JEnum {
  /**
   * The number of recruitable unit types.
   */
  static readonly MIGRANT_COUNT: number = 3;
  /**
   * The unspecific migrant slot to use to denote a random
   * choice between specific slots.
   */
  static readonly CHOOSE_MIGRANT_SLOT: number = 0;
  /**
   * The migrant slot to use when there is no reason to choose
   * between them.
   */
  static readonly DEFAULT_MIGRANT_SLOT: number = 1;
  static NORMAL: Europe$MigrationType = null;
  static RECRUIT: Europe$MigrationType = null;
  static FOUNTAIN: Europe$MigrationType = null;
  static SURVIVAL: Europe$MigrationType = null;
  static $VALUES: Europe$MigrationType[] = null;
  _Europe$MigrationType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static getMigrantCount(): number {
    return Europe$MigrationType.MIGRANT_COUNT;
  }
  static getUnspecificSlot(): number {
    return Europe$MigrationType.CHOOSE_MIGRANT_SLOT;
  }
  static getDefaultSlot(): number {
    return Europe$MigrationType.DEFAULT_MIGRANT_SLOT;
  }
  static validMigrantIndex(x: number): boolean {
    return 0 <= x && x < Europe$MigrationType.MIGRANT_COUNT;
  }
  static migrantIndexToSlot(x: number): number {
    return (x + 1) | 0;
  }
  static migrantSlotToIndex(x: number): number {
    return (x - 1) | 0;
  }
  static convertToMigrantSlot(i: number): number {
    return (i == null || !Europe$MigrationType.validMigrantSlot(i)) ? Europe$MigrationType.CHOOSE_MIGRANT_SLOT : i;
  }
  static validMigrantSlot(x: number): boolean {
    return 0 <= x && x <= Europe$MigrationType.MIGRANT_COUNT;
  }
  static specificMigrantSlot(x: number): boolean {
    return 1 <= x && x <= Europe$MigrationType.MIGRANT_COUNT;
  }
  static unspecificMigrantSlot(x: number): boolean {
    return Europe$MigrationType.CHOOSE_MIGRANT_SLOT === x;
  }
  static values(): Europe$MigrationType[] { return Europe$MigrationType.$VALUES.slice(); }
  static valueOf(name: string): Europe$MigrationType { return $J.enumValueOf(Europe$MigrationType, name); }
  static $clinit() {
    Europe$MigrationType.NORMAL = new Europe$MigrationType()._Europe$MigrationType('NORMAL', 0);
    Europe$MigrationType.RECRUIT = new Europe$MigrationType()._Europe$MigrationType('RECRUIT', 1);
    Europe$MigrationType.FOUNTAIN = new Europe$MigrationType()._Europe$MigrationType('FOUNTAIN', 2);
    Europe$MigrationType.SURVIVAL = new Europe$MigrationType()._Europe$MigrationType('SURVIVAL', 3);
    Europe$MigrationType.$VALUES = [Europe$MigrationType.NORMAL, Europe$MigrationType.RECRUIT, Europe$MigrationType.FOUNTAIN, Europe$MigrationType.SURVIVAL];
  }
}

$J.define(Europe, 'net.sf.freecol.common.model.Europe', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Ownable', 'net.sf.freecol.common.model.Named', 'net.sf.freecol.common.model.TradeLocation'], sup: 'net.sf.freecol.common.model.UnitLocation', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_Europe$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player': '_Europe$Game$Player' }, returns: { 'getXMLTagName': 'java.lang.String', 'getClassIndex': 'int', 'getFeatureContainer': 'net.sf.freecol.common.model.FeatureContainer', 'getNameAsJlabel': 'javax.swing.JLabel', 'getOwner': 'net.sf.freecol.common.model.Player', 'getNameKey': 'java.lang.String', 'getLocationImageKey': 'java.lang.String', 'getRank': 'int', 'getLocationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getRecruitLowerCap': 'int', 'getCurrentRecruitPrice': 'int', 'getBaseRecruitPrice': 'int', 'getUnitPrices': 'java.util.Map', 'getRecruitables': 'java.util.List' }, meths: { 'getAbilities(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType,net.sf.freecol.common.model.Turn)': 'getAbilities$String$FreeColSpecObjectType$Turn', 'addRecruitable(net.sf.freecol.common.model.UnitType,boolean)': 'addRecruitable$UnitType$boolean', 'addRecruitable(net.sf.freecol.common.model.AbstractUnit,boolean)': 'addRecruitable$AbstractUnit$boolean' }, clinit: true, lazy: ['logger', 'ABILITY_DRESS_MISSIONARY'] });
$J.define(Europe$MigrationType, 'net.sf.freecol.common.model.Europe$MigrationType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Europe$MigrationType' }, clinit: true, lazy: ['$VALUES', 'NORMAL', 'RECRUIT', 'FOUNTAIN', 'SURVIVAL'] });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Role = $J.load('net.sf.freecol.common.model.Role');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
