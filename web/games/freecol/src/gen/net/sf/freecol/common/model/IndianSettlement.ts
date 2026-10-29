// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/IndianSettlement.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collectors, Comparator, HashMap, JEnum, JFunction, Logger, RuntimeException, StringBuilder } from '../../../../../../jre/index.ts';
import { Settlement } from './Settlement.ts';

let Messages, AbstractGoods, FreeColObject, Goods, GoodsContainer, GoodsType, Modifier, Player, Role, StringTemplate, Tension, Unit, UnitType, GameOptions, CollectionUtils, RandomUtils;

/**
 * Represents an Indian settlement.
 */
export class IndianSettlement extends Settlement {
  static logger: Logger = null;
  static readonly TAG: string = 'indianSettlement';
  /**
   * The production fudge factor.
   */
  static readonly NATIVE_PRODUCTION_EFFICIENCY: number = 0.67;
  /**
   * The maximum number of wanted goods.
   */
  static readonly WANTED_GOODS_COUNT: number = 3;
  /**
   * Radius of native tales map reveal.
   */
  static readonly TALES_RADIUS: number = 6;
  /**
   * Do not sell less than this amount of goods.
   */
  static readonly TRADE_MINIMUM_SIZE: number = 20;
  /**
   * Do not buy goods when the price is this low.
   */
  static readonly TRADE_MINIMUM_PRICE: number = 3;
  static readonly GOODS_BASE_PRICE: number = 12;
  /**
   * The amount of raw material that should be available before
   * producing manufactured goods.
   */
  static readonly KEEP_RAW_MATERIAL: number = 50;
  /**
   * Generate gifts from goods that exceed KEEP_RAW_MATERIAL +
   * GIFT_THRESHOLD.
   */
  static readonly GIFT_THRESHOLD: number = 25;
  /**
   * The minimum gift amount.
   */
  static readonly GIFT_MINIMUM: number = 10;
  /**
   * The maximum gift amount.
   */
  static readonly GIFT_MAXIMUM: number = 80;
  /**
   * This is the skill that can be learned by Europeans at this
   * settlement.  At the server side its value will be null when the
   * skill has already been taught to a European.  At the client
   * side the value null is also possible in case the player hasn't
   * checked out the settlement yet.
   */
  learnableSkill: UnitType = null;
  /**
   * The goods this settlement wants.
   */
  wantedGoods: List<GoodsType> = null;
  /**
   * A map that tells if a player has spoken to the chief of this settlement.
   *
   * At the client side, only the information regarding the player
   * on that client should be included.
   */
  contactLevels: JMap<Player, IndianSettlement$ContactLevel> = null;
  /**
   * Units that belong to this settlement.
   */
  ownedUnits: List<Unit> = null;
  /**
   * The missionary at this settlement.
   */
  missionary_: Unit = null;
  /**
   * Used for monitoring the progress towards creating a convert.
   */
  convertProgress: number = 0;
  /**
   * The number of the turn during which the last tribute was paid.
   */
  lastTribute: number = 0;
  /**
   * The most hated nation.
   */
  mostHated: Player = null;
  /**
   * Stores the alarm levels. <b>Only used by AI.</b>
   * "Alarm" means: Tension with respect to a player from an
   *      IndianSettlement.
   * Alarm is overloaded with the concept of "contact".  If a settlement
   * has never been contacted by a player, alarm.get(player) will be null.
   * Acts causing contact initialize this variable.
   */
  alarm: JMap<Player, Tension> = null;
  /**
   * Cache of goods offered for sale.  Do not serialize.
   */
  forSale: List<Goods> = null;
  static readonly ALARM_TAG: string = 'alarm';
  static readonly CONTACT_LEVEL_TAG: string = 'contactLevel';
  static readonly CONVERT_PROGRESS_TAG: string = 'convertProgress';
  static readonly LAST_TRIBUTE_TAG: string = 'lastTribute';
  static readonly LEVEL_TAG: string = 'level';
  static readonly MISSIONARY_TAG: string = 'missionary';
  static readonly MOST_HATED_TAG: string = 'mostHated';
  static readonly NAME_TAG: string = 'name';
  static readonly OWNED_UNITS_TAG: string = 'ownedUnits';
  static readonly PLAYER_TAG: string = 'player';
  static readonly LEARNABLE_SKILL_TAG: string = 'learnableSkill';
  static readonly WANTED_GOODS_TAG: string = 'wantedGoods';
  $init_IndianSettlement() {
    this.learnableSkill = null;
    this.wantedGoods = IndianSettlement.emptyWantedGoods();
    this.contactLevels = new HashMap();
    this.ownedUnits = new ArrayList();
    this.missionary_ = null;
    this.convertProgress = 0;
    this.lastTribute = 0;
    this.mostHated = null;
    this.alarm = new HashMap();
    this.forSale = new ArrayList();
  }
  /**
   * Constructor for ServerIndianSettlement.
   *
   * @param game The enclosing {@code Game}.
   * @param owner The {@code Player} owning this settlement.
   * @param name The name for this settlement.
   * @param tile The containing {@code Tile}.
   */
  _IndianSettlement$Game$Player$String$Tile(game: Game, owner: Player, name: string, tile: Tile): this {
    this._Settlement$Game$Player$String$Tile(game, owner, name, tile);
    this.$init_IndianSettlement();
    return this;
  }
  /**
   * Creates a new {@code IndianSettlement} with the given
   * identifier.  The object should later be initialized by calling either
   * {@link #readFromXML(FreeColXMLReader)}.
   *
   * @param game The {@code Game} in which this object belong.
   * @param id The object identifier.
   */
  _IndianSettlement$Game$String(game: Game, id: string): this {
    this._Settlement$Game$String(game, id);
    this.$init_IndianSettlement();
    return this;
  }
  /**
   * Create an empty wanted goods list.
   *
   * @return A list of null wanted goods.
   */
  static emptyWantedGoods(): List<GoodsType> {
    let ret = new ArrayList(IndianSettlement.WANTED_GOODS_COUNT);
    for (let i = 0; i < IndianSettlement.WANTED_GOODS_COUNT; i++) {
      ret.add(null);
    }
    return ret;
  }
  /**
   * Gets a list of the units native to this settlement.
   *
   * @return The list of units native to this settlement.
   */
  getOwnedUnitList(): List<Unit> {
    {
      return new ArrayList(this.ownedUnits);
    }
  }
  /**
   * Set the owned units list.
   *
   * @param ownedUnits The new owned {@code Unit} list.
   */
  setOwnedUnitList(ownedUnits: List<Unit>): void {
    this.clearOwnedUnits();
    this.ownedUnits.addAll(ownedUnits);
  }
  /**
   * Adds the given {@code Unit} to the list of units that
   * belongs to this {@code IndianSettlement}.
   *
   * @param unit The {@code Unit} to be added.
   */
  addOwnedUnit(unit: Unit): void {
    {
      if (!this.ownedUnits.contains(unit)) {
        this.ownedUnits.add(unit);
      }
    }
  }
  /**
   * Clear the owned units.
   */
  clearOwnedUnits(): void {
    {
      this.ownedUnits.clear();
    }
  }
  /**
   * Removes the given {@code Unit} to the list of units that
   * belongs to this {@code IndianSettlement}. Returns true if
   * the Unit was removed.
   *
   * @param unit The {@code Unit} to be removed from the
   *     list of the units this {@code IndianSettlement} owns.
   * @return a {@code boolean} value
   */
  removeOwnedUnit(unit: Unit): boolean {
    {
      return this.ownedUnits.remove(unit);
    }
  }
  /**
   * Get the year of the last tribute.
   *
   * @return The year of the last tribute.
   */
  getLastTribute(): number {
    return this.lastTribute;
  }
  /**
   * Set the year of the last tribute.
   *
   * @param lastTribute The new last tribute year.
   */
  setLastTribute(lastTribute: number): void {
    this.lastTribute = lastTribute;
  }
  /**
   * Gets the skill that can be learned at this settlement.
   *
   * @return The skill that can be learned at this settlement.
   */
  getLearnableSkill(): UnitType {
    return this.learnableSkill;
  }
  /**
   * Sets the learnable skill for this Indian settlement.
   *
   * @param skill The new learnable skill for this Indian settlement.
   */
  setLearnableSkill(skill: UnitType): void {
    this.learnableSkill = skill;
  }
  /**
   * Get a label appropriate to the current learnable skill
   * and whether the requestor has visited this settlement.
   *
   * @param visited The visiting status.
   * @return A {@code StringTemplate} describing the perceived skill.
   */
  getLearnableSkillLabel(visited: boolean): StringTemplate {
    return StringTemplate.key$String((visited) ? ((this.learnableSkill == null) ? 'model.indianSettlement.skillNone' : this.learnableSkill.getNameKey()) : 'model.indianSettlement.skillUnknown');
  }
  /**
   * Gets the missionary from this settlement.
   *
   * @return The missionary at this settlement, or null if there is none.
   */
  getMissionary(): Unit {
    return this.missionary_;
  }
  /**
   * Does this settlement have a missionary?
   *
   * @return True if there is a missionary at this settlement.
   */
  hasMissionary$(): boolean {
    return this.missionary_ != null;
  }
  /**
   * Does this settlement have a missionary from the given player?
   *
   * @param player The {@code Player} to test.
   * @return True if there is a suitable missionary present.
   */
  hasMissionary$Player(player: Player): boolean {
    return this.missionary_ != null && player != null && player.owns(this.missionary_);
  }
  /**
   * Sets the missionary for this settlement.
   *
   * -vis: This routine has visibility implications when enhanced
   * missionaries are enabled.
   * -til: This changes the tile appearance.
   *
   * @param missionary The missionary for this settlement.
   */
  setMissionary(missionary: Unit): void {
    this.missionary_ = missionary;
  }
  /**
   * Get the line of sight used by a missionary at this settlement.
   *
   * @return The missionary line of sight.
   */
  getMissionaryLineOfSight(): number {
    let enhanced = this.getSpecification().getBoolean(GameOptions.ENHANCED_MISSIONARIES);
    return (enhanced) ? this.getLineOfSight() : 1;
  }
  /**
   * Get a stream of tiles that should be visible to a missionary at
   * this settlement.
   *
   * @return A list of {@code Tile}s.
   */
  getMissionaryVisibleTiles(): List<Tile> {
    return this.getTile$().getSurroundingTiles$int$int(0, this.getMissionaryLineOfSight());
  }
  /**
   * Gets the convert progress status for this settlement.
   *
   * @return The convert progress status.
   */
  getConvertProgress(): number {
    return this.convertProgress;
  }
  /**
   * Sets the convert progress status for this settlement.
   *
   * @param progress The new convert progress status.
   */
  setConvertProgress(progress: number): void {
    this.convertProgress = progress;
  }
  /**
   * Is a given index with the range of normal wanted goods.
   *
   * @param index The index to test.
   * @return True if the index is in range.
   */
  validWantedGoodsIndex(index: number): boolean {
    return 0 <= index && index < IndianSettlement.WANTED_GOODS_COUNT;
  }
  /**
   * Gets the goods wanted by this settlement.
   *
   * @return The wanted goods list.
   */
  getWantedGoods$(): List<GoodsType> {
    return this.wantedGoods;
  }
  /**
   * Gets one of the goods wanted by this settlement.
   *
   * @param index Which of the goods to get.
   * @return The wanted {@code GoodsType} or null if not present or
   *     the index is out of range.
   */
  getWantedGoods$int(index: number): GoodsType {
    return (this.validWantedGoodsIndex(index)) ? this.wantedGoods.get(index) : null;
  }
  /**
   * Sets the goods wanted by this Settlement.
   *
   * @param wanted The new wanted {@code GoodsType} list.
   */
  setWantedGoods$List(wanted: List<GoodsType>): void {
    let n = wanted.size();
    for (let i = 0; i < IndianSettlement.WANTED_GOODS_COUNT; i++) {
      this.wantedGoods.set(i, ((i < n) ? wanted.get(i) : null));
    }
  }
  /**
   * Sets the goods wanted by this settlement.
   *
   * @param index Which of the (usually 3) goods to set.
   * @param type The {@code GoodsType} wanted.
   */
  setWantedGoods$int$GoodsType(index: number, type$: GoodsType): void {
    if (this.validWantedGoodsIndex(index)) {
      this.wantedGoods.set(index, type$);
    }
  }
  /**
   * Get the number of wanted goods.  If any members of the array
   * are null, we assume that subsequent ones are too.
   *
   * @return The number of wanted goods.
   */
  getWantedGoodsCount(): number {
    return CollectionUtils.count$Collection$Predicate(this.wantedGoods, CollectionUtils.isNotNull$());
  }
  /**
   * Get a label for one of the wanted goods.
   *
   * @param index The index into the wanted goods.
   * @param player The requesting {@code Player}.
   * @return A list of a {@code StringTemplate} for the label, and
   *     optionally one for a tool tip.
   */
  getWantedGoodsLabel(index: number, player: Player): List<StringTemplate> {
    let lab = null;
    let tip = null;
    let gt: GoodsType;
    if (this.hasVisited(player)) {
      if ((gt = this.getWantedGoods$int(index)) != null) {
        lab = StringTemplate.label('').add$String(Messages.nameKey$ObjectWithId(gt));
        let sale = player.getLastSaleString(this, gt);
        if (sale != null) {
          lab.addName$String(' ' + sale);
          tip = player.getLastSaleTip(this, gt);
        }
      }
      if (lab == null) {
        lab = StringTemplate.key$String('model.indianSettlement.wantedGoodsNone');
      }
    } else {
      lab = StringTemplate.name_('');
    }
    let ret = new ArrayList();
    ret.add(lab);
    if (tip != null) {
      ret.add(tip);
    }
    return ret;
  }
  /**
   * Gets the most hated nation of this settlement.
   *
   * @return The most hated nation.
   */
  getMostHated(): Player {
    return this.mostHated;
  }
  /**
   * Sets the most hated nation of this settlement.
   *
   * -til: Changes the tile appearance.
   *
   * @param mostHated The new most hated nation.
   */
  setMostHated(mostHated: Player): void {
    this.mostHated = mostHated;
  }
  /**
   * Get a template for the current most hated nation, depending
   * whether the requestor has contacted this settlement.
   *
   * @param contacted The contact status.
   * @return A {@code StringTemplate} describing the perceived
   *     most hated nation.
   */
  getMostHatedLabel(contacted: boolean): StringTemplate {
    return (contacted) ? ((this.mostHated == null) ? StringTemplate.key$String('model.indianSettlement.mostHatedNone') : this.mostHated.getCountryLabel()) : StringTemplate.key$String('model.indianSettlement.mostHatedUnknown');
  }
  /**
   * Set the contact levels.
   *
   * @param contactLevels The new contact level map.
   */
  setContactLevels(contactLevels: JMap<Player, IndianSettlement$ContactLevel>): void {
    {
      this.contactLevels.clear();
      this.contactLevels.putAll(contactLevels);
    }
  }
  /**
   * Clear the contact levels.
   */
  clearContactLevels(): void {
    {
      this.contactLevels.clear();
    }
  }
  /**
   * Gets the contact level between this settlement and a player.
   *
   * @param player The {@code Player} to check.
   * @return The contact level.
   */
  getContactLevel(player: Player): IndianSettlement$ContactLevel {
    {
      let cl = this.contactLevels.get(player);
      return (cl == null) ? IndianSettlement$ContactLevel.UNCONTACTED : cl;
    }
  }
  /**
   * Sets a contact level between this settlement and a player.
   *
   * @param player The contacted {@code Player}.
   * @param level The new {@code ContactLevel}.
   */
  setContactLevel(player: Player, level: IndianSettlement$ContactLevel): void {
    {
      this.contactLevels.put(player, level);
    }
  }
  /**
   * Make contact with this settlement (if it has not been
   * previously contacted).  Initialize tension level to the general
   * level with respect to the contacting player--- effectively the
   * average reputation of this player with the overall tribe.
   *
   * @param player The {@code Player} making contact.
   * @return True if this was indeed the first contact between settlement
   *     and player.
   */
  setContacted(player: Player): boolean {
    if (!this.hasContacted(player)) {
      this.setContactLevel(player, IndianSettlement$ContactLevel.CONTACTED);
      this.initializeAlarm(player);
      return true;
    }
    return false;
  }
  /**
   * Has a player visited this settlement?
   *
   * @param player The {@code Player} to check.
   * @return True if the player has contacted this settlement.
   */
  hasVisited(player: Player): boolean {
    return this.getContactLevel(player).ordinal() >= IndianSettlement$ContactLevel.VISITED.ordinal();
  }
  /**
   * Sets the contact level of this settlement to indicate
   * that a European player has visited the settlement.
   *
   * @param player The visiting {@code Player}.
   * @return True if this was the first time the settlement was visited
   *     by the player.
   */
  setVisited(player: Player): boolean {
    if (!this.hasVisited(player)) {
      if (!this.hasContacted(player)) {
        this.initializeAlarm(player);
      }
      this.setContactLevel(player, IndianSettlement$ContactLevel.VISITED);
      return true;
    }
    return false;
  }
  /**
   * Has a player has spoken with the chief of this settlement.
   *
   * @param player The {@code Player} to check.
   * @return True if the player has visited this settlement to speak
   *     with the chief.
   */
  hasScouted(player: Player): boolean {
    return this.getContactLevel(player) === IndianSettlement$ContactLevel.SCOUTED;
  }
  /**
   * Sets the contact level of this settlement to indicate
   * that a European player has had a chat with the chief.
   *
   * @param player The visiting {@code Player}.
   * @return True if this was the first time the settlement was scouted
   *     by the player.
   */
  setScouted(player: Player): boolean {
    if (!this.hasScouted(player)) {
      if (!this.hasContacted(player)) {
        this.initializeAlarm(player);
      }
      this.setContactLevel(player, IndianSettlement$ContactLevel.SCOUTED);
      return true;
    }
    return false;
  }
  /**
   * Has any European player spoken with the chief of this settlement.
   *
   * @return True if any European player has spoken with the chief.
   */
  hasAnyScouted(): boolean {
    {
      return CollectionUtils.any$Collection$Predicate(this.contactLevels.keySet(), (p) => this.hasScouted(p));
    }
  }
  /**
   * Is this settlement worth scouting?
   * That is, has it been contacted, but not scouted already, or
   * visited when the "Chief contact" option is set.
   *
   * @param player The {@code Player} contemplating scouting.
   * @return Whether it might be worth the player scouting this settlement.
   */
  worthScouting(player: Player): boolean {
    let cl = this.getContactLevel(player);
    switch (cl) {
      case IndianSettlement$ContactLevel.CONTACTED:
        return true;
      case IndianSettlement$ContactLevel.VISITED:
        return !this.getSpecification().getBoolean(GameOptions.SETTLEMENT_ACTIONS_CONTACT_CHIEF);
      case IndianSettlement$ContactLevel.UNCONTACTED:
      case IndianSettlement$ContactLevel.SCOUTED:
      default:
        break;
    }
    return false;
  }
  /**
   * Get the alarm map.
   *
   * @return The map of player to tension.
   */
  getAlarm$(): JMap<Player, Tension> {
    return this.alarm;
  }
  /**
   * Set the alarm map.
   *
   * @param alarm The new map of {@code Player} to {@code Tension}.
   */
  setAlarm$Map(alarm: JMap<Player, Tension>): void {
    this.clearAlarm();
    {
      this.alarm.putAll(alarm);
    }
  }
  /**
   * Gets the alarm level towards the given player.
   *
   * @param player The {@code Player} to get the alarm level for.
   * @return The current alarm level or null if the settlement has not
   *     encoutered the player.
   */
  getAlarm$Player(player: Player): Tension {
    {
      return this.alarm.get(player);
    }
  }
  /**
   * Sets alarm towards the given player.
   *
   * -til: Might change tile appearance through most hated state
   *
   * @param player The {@code Player} to set the alarm level for.
   * @param newAlarm The new alarm value.
   */
  setAlarm$Player$Tension(player: Player, newAlarm: Tension): void {
    {
      this.alarm.put(player, newAlarm);
    }
  }
  /**
   * Clear the alarm levels.
   */
  clearAlarm(): void {
    {
      this.alarm.clear();
    }
  }
  /**
   * Initialize the alarm at this settlement with respect to a
   * player with the current national tension.
   *
   * @param player The {@code Player} to set the alarm level for.
   */
  initializeAlarm(player: Player): void {
    let tension = this.owner.getTension$Player(player);
    this.setAlarm$Player$Tension(player, new Tension()._Tension$int(tension.getValue()));
  }
  /**
   * Gets a message key for a short alarm message associated with the
   * alarm level of this player.
   *
   * @param player The other {@code Player}.
   * @return The alarm message key.
   */
  getAlarmLevelKey(player: Player): string {
    return (!player.hasContacted(this.owner)) ? 'model.indianSettlement.tension.wary' : (!this.hasContacted(player)) ? 'model.indianSettlement.tension.unknown' : this.getAlarm$Player(player).getNameKey();
  }
  /**
   * Get the current goods offered for sale.
   *
   * @return A list of {@code Goods} for sale.
   */
  getGoodsForSale(): List<Goods> {
    return this.forSale;
  }
  /**
   * Set the current goods offered for sale.
   *
   * @param forSale A new list of {@code Goods} for sale.
   */
  setGoodsForSale(forSale: List<Goods>): void {
    this.forSale.clear();
    this.forSale.addAll(forSale);
  }
  /**
   * Is a unit permitted to make contact with this settlement?
   * The unit must be from a nation that has already made contact,
   * or in the first instance, must be arriving by land, with the
   * exception of trading ships.
   *
   * @param unit The {@code Unit} that proposes to contact this
   *             settlement.
   * @return True if the settlement accepts such contact.
   */
  allowContact(unit: Unit): boolean {
    return unit.getOwner().hasContacted(this.owner) || !unit.isNaval() || unit.hasGoodsCargo();
  }
  /**
   * Gets the amount of gold this {@code IndianSettlment}
   * is willing to pay for the given {@code Goods}.
   *
   * It is only meaningful to call this method from the
   * server, since the settlement's {@link GoodsContainer}
   * is hidden from the clients.
   *
   * @param <T> The base type of the goods.
   * @param goods The goods to price.
   * @return The price.
   */
  getPriceToBuy$AbstractGoods<T>(goods: T): number {
    return this.getPriceToBuy$GoodsType$int(goods.getType(), goods.getAmount());
  }
  /**
   * Gets the amount of gold this {@code IndianSettlment}
   * is willing to pay for the given {@code Goods}.
   *
   * It is only meaningful to call this method from the server,
   * since the settlement's {@link GoodsContainer} is hidden from
   * the clients.  The AI uses it though so it stays here for now.
   * Note that it takes no account of whether the native player
   * actually has the gold.
   *
   * FIXME: this is rancid with magic numbers.
   *
   * @param type The type of {@code Goods} to price.
   * @param amount The amount of {@code Goods} to price.
   * @return The price.
   */
  getPriceToBuy$GoodsType$int(type$: GoodsType, amount: number): number {
    if (amount > GoodsContainer.CARGO_SIZE) {
      throw new RuntimeException('Amount ' + amount + ' > ' + GoodsContainer.CARGO_SIZE);
    }
    let price = 0;
    if (type$.getMilitary()) {
      price = this.getMilitaryGoodsPriceToBuy(type$, amount);
    }
    if (price === 0) {
      price = this.getNormalGoodsPriceToBuy(type$, amount);
    }
    let wantedBase = 100;
    let wantedBonus = (type$ === this.getWantedGoods$int(0)) ? 150 : (type$ === this.getWantedGoods$int(1)) ? 125 : (type$ === this.getWantedGoods$int(2)) ? 110 : 100;
    price = $J.idiv(Math.imul(wantedBonus, price), wantedBase);
    IndianSettlement.logger.finest('Full price(' + amount + ' ' + $J.str(type$) + ') -> ' + price);
    return price;
  }
  /**
   * Price some goods according to the amount present in the settlement.
   *
   * @param type The type of goods for sale.
   * @param amount The amount of goods for sale.
   * @return A price for the goods.
   */
  getNormalGoodsPriceToBuy(type$: GoodsType, amount: number): number {
    let tradeGoodsAdd = 20;
    let capacity = this.getGoodsCapacity();
    let current = this.getGoodsCount(type$);
    let rawType = type$.getInputType();
    if (rawType != null) {
      let rawProduction = this.getMaximumProduction(rawType);
      let fakeProduction = (rawProduction < 5) ? Math.imul(10, rawProduction) : (rawProduction < 10) ? (Math.imul(5, rawProduction) + 25) | 0 : (rawProduction < 20) ? (Math.imul(2, rawProduction) + 55) | 0 : 100;
      fakeProduction = $J.idiv(fakeProduction, 2);
      current = (current + $J.idiv(Math.imul(fakeProduction, Math.max(0, (capacity - current) | 0)), capacity)) | 0;
    } else if (type$.isTradeGoods()) {
      current = (current + tradeGoodsAdd) | 0;
    }
    let retain = Math.min(this.getWantedGoodsAmount(type$), capacity);
    let valued = (retain <= current) ? 0 : Math.min(amount, (retain - current) | 0);
    let unitPrice = $J.idiv(Math.imul(((IndianSettlement.GOODS_BASE_PRICE + this.getType().getTradeBonus()) | 0), Math.max(0, (capacity - current) | 0)), capacity);
    if (type$.isFarmed() || type$.isRawBuildingMaterial()) {
      unitPrice = $J.idiv(unitPrice, 2);
    }
    return (unitPrice < 0) ? 0 : Math.imul(valued, unitPrice);
  }
  /**
   * Calculates how much of the given goods type this settlement
   * wants and should retain.
   *
   * @param type The {@code GoodsType}.
   * @return The amount of goods wanted.
   */
  getWantedGoodsAmount(type$: GoodsType): number {
    if (this.getUnitCount() <= 0) {
      return 0;
    }
    let spec = this.getSpecification();
    let unitType = this.getFirstUnit().getType();
    let militaryRoles = Role.getAvailableRoles(this.getOwner(), unitType, spec.getMilitaryRolesList());
    if (type$.getMilitary()) {
      return CollectionUtils.sum$Collection$Predicate$ToIntFunction(this.getOwnedUnitList(), (u) => !militaryRoles.contains(u.getRole()), (u) => AbstractGoods.getCount(type$, u.getGoodsDifference(CollectionUtils.first$Collection(militaryRoles), 1)));
    }
    let consumption = this.getConsumptionOf$GoodsType(type$);
    if (type$ === spec.getPrimaryFoodType()) {
      return Math.max(40, Math.imul(consumption, 3));
    }
    if (type$.isTradeGoods() || type$.isNewWorldLuxuryType() || type$.isRefined()) {
      return Math.max(80, Math.imul(consumption, 20));
    }
    return Math.imul(2, this.getUnitCount());
  }
  /**
   * Price some goods that have military value to the settlement.
   *
   * @param type The type of goods for sale.
   * @param amount The amount of goods for sale.
   * @return A price for the goods.
   */
  getMilitaryGoodsPriceToBuy(type$: GoodsType, amount: number): number {
    let full = (IndianSettlement.GOODS_BASE_PRICE + this.getType().getTradeBonus()) | 0;
    let required = this.getWantedGoodsAmount(type$);
    if (required === 0) {
      return 0;
    }
    let valued = Math.max(0, (required - this.getGoodsCount(type$)) | 0);
    let price = (valued > $J.idiv(amount, 2)) ? Math.imul(full, amount) : (Math.imul(valued, full) + (this.getNormalGoodsPriceToBuy(type$, (amount - valued) | 0))) | 0;
    IndianSettlement.logger.finest('Military price(' + amount + ' ' + $J.str(type$) + ') valued=' + valued + ' -> ' + price);
    return price;
  }
  /**
   * Gets the amount of gold this {@code IndianSettlment}
   * is willing to sell the given {@code Goods} for.
   *
   * It is only meaningful to call this method from the
   * server, since the settlement's {@link GoodsContainer}
   * is hidden from the clients.
   *
   * @param <T> The base type of the goods.
   * @param goods The goods to price.
   * @return The price.
   */
  getPriceToSell$AbstractGoods<T>(goods: T): number {
    return this.getPriceToSell$GoodsType$int(goods.getType(), goods.getAmount());
  }
  /**
   * Gets the amount of gold this {@code IndianSettlment}
   * is willing to sell the given {@code Goods} for.
   *
   * It is only meaningful to call this method from the
   * server, since the settlement's {@link GoodsContainer}
   * is hidden from the clients.
   *
   * @param type The type of {@code Goods} to price.
   * @param amount The amount of {@code Goods} to price.
   * @return The price.
   */
  getPriceToSell$GoodsType$int(type$: GoodsType, amount: number): number {
    if (amount > GoodsContainer.CARGO_SIZE) {
      throw new RuntimeException('Amount ' + amount + ' > ' + GoodsContainer.CARGO_SIZE);
    }
    let full = (IndianSettlement.GOODS_BASE_PRICE + this.getType().getTradeBonus()) | 0;
    let price = (amount + Math.max(0, $J.idiv(Math.imul(11, this.getPriceToBuy$GoodsType$int(type$, amount)), 10))) | 0;
    if (type$.getMilitary()) {
      price = Math.max(price, Math.imul(Math.imul(amount, full), 2));
    } else if (type$.isTradeGoods()) {
      price = Math.max(price, $J.idiv(Math.imul(Math.imul(150, amount), full), 100));
    } else {
      let raw = type$.getInputType();
      if (raw != null && this.getMaximumProduction(raw) === 0) {
        price = (price + amount) | 0;
      }
    }
    return price;
  }
  /**
   * Will this settlement sell a type of goods.
   * Placeholder until we have a spec-configured blacklist.
   *
   * @param type The {@code GoodsType} to consider.
   * @return True if the settlement would sell the goods.
   */
  willSell(type$: GoodsType): boolean {
    return !type$.isTradeGoods();
  }
  /**
   * Gets the goods this settlement is willing to sell.
   *
   * Sell new world goods first, then by decreasing price, then
   * decreasing amount.
   *
   * @param unit An optional {@code Unit} that is trading.
   * @return A list of goods to sell.
   */
  getSellGoods(unit: Unit): List<Goods> {
    let sellGoods = CollectionUtils.transform$Collection$Predicate(this.getCompactGoodsList(), (g2) => this.willSell(g2.getType()));
    let result = new ArrayList(sellGoods.size());
    for (const $it0 = sellGoods.iterator(); $it0.hasNext(); ) {
      let g = $it0.next();
      let amount = g.getAmount();
      let retain = this.getWantedGoodsAmount(g.getType());
      if (retain >= amount) {
        continue;
      }
      amount = (amount - retain) | 0;
      if (unit != null) {
        amount = $J.roundf(FreeColObject.applyModifiers$float$Turn$Stream(Math.fround(amount), this.getGame().getTurn(), unit.getModifiers$String(Modifier.TRADE_VOLUME_PENALTY)));
      }
      if (amount < IndianSettlement.TRADE_MINIMUM_SIZE) {
        continue;
      }
      if (amount > GoodsContainer.CARGO_SIZE) {
        amount = GoodsContainer.CARGO_SIZE;
      }
      result.add(new Goods()._Goods$Game$Location$GoodsType$int(this.getGame(), this, g.getType(), amount));
    }
    let salePriceComparator = Comparator.reversed((Comparator.comparingInt((g) => this.getPriceToSell$GoodsType$int(g.getType(), g.getAmount()))));
    let exportGoodsComparator = Comparator.thenComparing(Comparator.thenComparing((Comparator.comparingInt((g) => (g.getType().isNewWorldGoodsType()) ? 0 : 1)), salePriceComparator), AbstractGoods.descendingAmountComparator);
    return CollectionUtils.sort$Collection$Comparator(result, exportGoodsComparator);
  }
  /**
   * Allows spread of horses and arms between settlements
   *
   * @param is The other {@code IndianSettlement} to trade with.
   */
  tradeGoodsWithSettlement(is$: IndianSettlement): void {
    let spec = this.getSpecification();
    for (const $it1 = (CollectionUtils.transform$Collection$Predicate(spec.getGoodsTypeList(), ($p0) => $p0.getMilitary())).iterator(); $it1.hasNext(); ) {
      let gt = $it1.next();
      let goodsInStock = this.getGoodsCount(gt);
      if (goodsInStock <= 50) {
        continue;
      }
      let goodsTraded = $J.idiv(goodsInStock, 2);
      is$.addGoods$GoodsType$int(gt, goodsTraded);
      this.removeGoods$GoodsType$int(gt, goodsTraded);
    }
  }
  /**
   * Gets the maximum possible production of the given type of goods.
   *
   * @param goodsType The type of goods to check.
   * @return The maximum amount, of the given type of goods, that can
   *         be produced in one turn.
   */
  getMaximumProduction(goodsType: GoodsType): number {
    return CollectionUtils.sum$Collection$Predicate$ToIntFunction(this.getTile$().getSurroundingTiles$int$int(0, this.getRadius()), (t) => t.getOwningSettlement() == null || t.getOwningSettlement() === this, (t) => t.getPotentialProduction(goodsType, null));
  }
  /**
   * Updates the goods wanted by this settlement.
   *
   * It is only meaningful to call this method from the
   * server, since the settlement's {@link GoodsContainer}
   * is hidden from the clients.
   */
  updateWantedGoods(): void {
    let spec = this.getSpecification();
    let identity = JFunction.identity();
    let prices = CollectionUtils.transform$Collection$Predicate$Function$Collector(spec.getGoodsTypeList(), (gt) => !gt.getMilitary() && gt.isStorable(), identity, Collectors.toMap(identity, (gt) => this.getNormalGoodsPriceToBuy(gt, GoodsContainer.CARGO_SIZE)));
    let wantedIndex = 0;
    for (const $it2 = CollectionUtils.mapEntriesByValue$Map$Comparator(prices, CollectionUtils.descendingIntegerComparator).iterator(); $it2.hasNext(); ) {
      let e = $it2.next();
      if (!this.validWantedGoodsIndex(wantedIndex)) {
        break;
      }
      if (e.getValue() <= Math.imul(GoodsContainer.CARGO_SIZE, IndianSettlement.TRADE_MINIMUM_PRICE)) {
        break;
      }
      this.setWantedGoods$int$GoodsType(wantedIndex, e.getKey());
      wantedIndex++;
    }
    for (; wantedIndex < IndianSettlement.WANTED_GOODS_COUNT; wantedIndex++) {
      this.setWantedGoods$int$GoodsType(wantedIndex, null);
    }
  }
  /**
   * Chooses a type of goods for some of the natives in a settlement
   * to manufacture.
   * Simple rule: choose the refined goods that is the greatest shortage
   * for which there is a surplus of the raw material.
   *
   * @return A {@code GoodsType} to manufacture, or null if
   *      none suitable.
   */
  goodsToMake(): GoodsType {
    let deficit = CollectionUtils.cacheInt((gt) => (this.getWantedGoodsAmount(gt) - this.getGoodsCount(gt)) | 0);
    let goodsPred = (gt) => gt.isRawMaterial() && gt.getOutputType() != null && !gt.getOutputType().isBreedable() && gt.getOutputType().isStorable() && deficit(gt) < 0 && deficit(gt.getOutputType()) > 0;
    let comp = Comparator.comparingInt(deficit);
    return CollectionUtils.maximize$Collection$Predicate$Comparator(this.getSpecification().getGoodsTypeList(), goodsPred, comp);
  }
  /**
   * Gets a random goods gift from this settlement.
   *
   * @param random A pseudo random number source.
   * @return A random goods gift, or null if none found.
   */
  getRandomGift(random: Random): Goods {
    let spec = this.getSpecification();
    let goodsPred = (gt) => this.getGoodsCount(gt) >= ((IndianSettlement.GIFT_THRESHOLD + IndianSettlement.KEEP_RAW_MATERIAL) | 0);
    let newGoodsMapper = (gt) => new Goods()._Goods$Game$Location$GoodsType$int(this.getGame(), this, gt, Math.min(((RandomUtils.randomInt(IndianSettlement.logger, 'Gift amount', random, (this.getGoodsCount(gt) - IndianSettlement.KEEP_RAW_MATERIAL - IndianSettlement.GIFT_MINIMUM) | 0)) + IndianSettlement.GIFT_MINIMUM) | 0, IndianSettlement.GIFT_MAXIMUM));
    return RandomUtils.getRandomMember$Logger$String$List$Random(IndianSettlement.logger, 'Gift type', CollectionUtils.transform$Collection$Predicate$Function(spec.getNewWorldGoodsTypeList(), goodsPred, newGoodsMapper), random);
  }
  /**
   * Add some initial goods to a newly generated settlement.
   * After all, they have been here for some time.
   *
   * @param random A pseudo-random number source.
   */
  addRandomGoods(random: Random): void {
    let goodsMap = new HashMap();
    for (const $it3 = (CollectionUtils.iterable(CollectionUtils.flatten$Collection$Function(this.getOwnedTiles(), (t) => t.getSortedAutoPotential().stream()))).iterator(); $it3.hasNext(); ) {
      let ag = $it3.next();
      CollectionUtils.accumulateToMap(goodsMap, ag.getType().getStoredAs(), ag.getAmount(), (a, b) => (a + b) | 0);
    }
    let d = RandomUtils.randomInt(IndianSettlement.logger, 'Goods at ' + this.getName(), random, 10) * 0.1 + 1;
    CollectionUtils.forEachMapEntry$Map$Consumer(goodsMap, (e) => {
      let i = e.getValue();
      if (!e.getKey().isFoodType()) {
        i = ($J.round(d * e.getValue())) | 0;
      }
      i = Math.min(i, GoodsContainer.CARGO_SIZE);
      if (i > 0) {
        this.addGoods$GoodsType$int(e.getKey(), i);
      }
    });
  }
  /**
   * Get the number of braves expected to be present for the settlement
   * not to be "badly defended".
   *
   * @return The required defender number.
   */
  getRequiredDefenders(): number {
    return (this.getType().getMinimumSize() - 1) | 0;
  }
  /**
   * {@inheritDoc}
   */
  disposeResources(): void {
    while (!this.ownedUnits.isEmpty()) {
      this.ownedUnits.removeAt(0).changeHomeIndianSettlement(null);
    }
    super.disposeResources();
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabelFor(player: Player): StringTemplate {
    return (player == null || this.hasContacted(player)) ? StringTemplate.name_(this.getName()) : StringTemplate.key$String('model.indianSettlement.nameUnknown');
  }
  /**
   * {@inheritDoc}
   */
  add(locatable: Locatable): boolean {
    let result = super.add(locatable);
    if (result && locatable instanceof Unit) {
      let indian = locatable;
      if (indian.getHomeIndianSettlement() == null) {
        indian.changeHomeIndianSettlement(this);
      }
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getIndianSettlement(): IndianSettlement {
    return this;
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
  toShortString(): string {
    return this.getName();
  }
  /**
   * {@inheritDoc}
   */
  invalidateCache(): void {
  }
  /**
   * {@inheritDoc}
   */
  getGoodsCapacity(): number {
    return this.getType().getWarehouseCapacity();
  }
  /**
   * {@inheritDoc}
   */
  getDefendingUnit(attacker: Unit): Unit {
    let defender = null;
    let defencePower = -1;
    for (const $it4 = this.getUnitList().iterator(); $it4.hasNext(); ) {
      let nextUnit = $it4.next();
      let unitPower = attacker.getGame().getCombatModel().getDefencePower$FreeColGameObject$FreeColGameObject(attacker, nextUnit);
      if (Unit.betterDefender(defender, defencePower, nextUnit, unitPower)) {
        defender = nextUnit;
        defencePower = unitPower;
      }
    }
    return defender;
  }
  /**
   * {@inheritDoc}
   */
  getDefenceRatio(): number {
    return this.getUnitCount() * 2 / ((this.getType().getMinimumSize() + this.getType().getMaximumSize()) | 0);
  }
  /**
   * {@inheritDoc}
   */
  isBadlyDefended(): boolean {
    return this.getUnitCount() < this.getRequiredDefenders();
  }
  /**
   * {@inheritDoc}
   */
  getPlunderRange(attacker: Unit): RandomRange {
    return this.getType().getPlunderRange(attacker);
  }
  /**
   * {@inheritDoc}
   */
  getSonsOfLiberty(): number {
    return 0;
  }
  /**
   * {@inheritDoc}
   */
  getUpkeep(): number {
    return 0;
  }
  /**
   * {@inheritDoc}
   */
  getTotalProductionOf(type$: GoodsType): number {
    if (type$.isRefined()) {
      if (type$ !== this.goodsToMake()) {
        return 0;
      }
      return this.getUnitCount();
    }
    let tiles = 0;
    let potential = 0;
    for (const $it5 = (CollectionUtils.transform$Collection$Predicate(this.getOwnedTiles(), (t) => t !== this.getTile$() && !t.isOccupied())).iterator(); $it5.hasNext(); ) {
      let wt = $it5.next();
      potential = (potential + wt.getPotentialProduction(type$, null)) | 0;
      tiles++;
    }
    if (tiles > this.getUnitCount()) {
      potential = $J.d2i((potential * this.getUnitCount() / tiles));
    }
    if (!type$.isFoodType()) {
      potential = ($J.round(potential * IndianSettlement.NATIVE_PRODUCTION_EFFICIENCY)) | 0;
    }
    potential = (potential + this.getTile$().getPotentialProduction(type$, null)) | 0;
    return potential;
  }
  /**
   * {@inheritDoc}
   */
  hasContacted(player: Player): boolean {
    return player != null && (player.isIndian() || this.getContactLevel(player) !== IndianSettlement$ContactLevel.UNCONTACTED);
  }
  /**
   * {@inheritDoc}
   */
  getAlarmLevelLabel(player: Player): StringTemplate {
    let key = (!player.hasContacted(this.owner)) ? 'model.indianSettlement.tension.wary' : (!this.hasContacted(player)) ? 'model.indianSettlement.tension.unknown' : 'model.indianSettlement.' + this.getAlarm$Player(player).getKey();
    return StringTemplate.template$String(key).addStringTemplate$String$StringTemplate('%nation%', this.getOwner().getNationLabel());
  }
  /**
   * Determines the value of a potential attack on a {@code IndianSettlement}
   *
   * @param value The previously calculated input value from
   *     {@link net.sf.freecol.server.ai.mission.UnitSeekAndDestroyMission
   *            #scoreSettlementPath(AIUnit, PathNode, Settlement)}
   * @param unit The {@code AIUnit} to check
   * @return The calculated value
   */
  calculateSettlementValue(value: number, unit: Unit): number {
    let tension = this.getAlarm$Player(unit.getOwner());
    if (tension != null) {
      value = (value + $J.idiv(tension.getValue(), 2)) | 0;
    }
    return value;
  }
  /**
   * {@inheritDoc}
   */
  getAvailableGoodsCount(goodsType: GoodsType): number {
    return this.getGoodsCount(goodsType);
  }
  /**
   * {@inheritDoc}
   */
  getExportAmount(goodsType: GoodsType, turns: number): number {
    let present = Math.max(0, (this.getGoodsCount(goodsType) + Math.imul(turns, this.getTotalProductionOf(goodsType))) | 0);
    let wanted = this.getWantedGoodsAmount(goodsType);
    return (present - wanted) | 0;
  }
  /**
   * {@inheritDoc}
   */
  getImportAmount(goodsType: GoodsType, turns: number): number {
    if (goodsType.limitIgnored()) {
      return 2147483647;
    }
    let present = Math.max(0, (this.getGoodsCount(goodsType) - Math.imul(turns, this.getTotalProductionOf(goodsType))) | 0);
    let capacity = this.getWarehouseCapacity();
    return (capacity - present) | 0;
  }
  /**
   * {@inheritDoc}
   */
  getLocationName(tradeLocation: TradeLocation): string {
    return (tradeLocation).getName();
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    let owner = this.getOwner();
    if (owner != null) {
      for (const $it6 = this.getOwnedUnitList().iterator(); $it6.hasNext(); ) {
        let u = $it6.next();
        if (u.getOwner() !== owner) {
          if (fix) {
            lb.add(['\n  Owned unit with wrong owner reassigned: ', u.getId()]);
            result = result.fix();
          } else {
            lb.add(['\n  Owned unit with wrong owner: ', u.getId()]);
            result = result.fail();
          }
        }
      }
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(IndianSettlement));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.learnableSkill = o.getLearnableSkill();
    this.setWantedGoods$List(o.getWantedGoods$());
    {
      this.contactLevels.clear();
      for (const $it7 = o.contactLevels.entrySet().iterator(); $it7.hasNext(); ) {
        let e = $it7.next();
        this.contactLevels.put(game.updateRef$FreeColGameObject(e.getKey()), e.getValue());
      }
    }
    this.setOwnedUnitList(game.updateRef$Collection(o.getOwnedUnitList()));
    this.missionary_ = game.update$FreeColGameObject$boolean(o.getMissionary(), false);
    this.convertProgress = o.getConvertProgress();
    this.lastTribute = o.getLastTribute();
    this.mostHated = o.getMostHated();
    this.setAlarm$Map(o.getAlarm$());
    this.setGoodsForSale(o.getGoodsForSale());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    let cl = this.getContactLevel(xw.getClientPlayer());
    let full = xw.validFor(this.getOwner());
    let name = this.getName();
    if (name != null) {
      xw.writeAttribute(IndianSettlement.NAME_TAG, name);
    }
    if (full) {
      xw.writeAttribute$String$int(IndianSettlement.LAST_TRIBUTE_TAG, this.lastTribute);
      xw.writeAttribute$String$int(IndianSettlement.CONVERT_PROGRESS_TAG, this.convertProgress);
    }
    if (full || cl === IndianSettlement$ContactLevel.SCOUTED || cl === IndianSettlement$ContactLevel.VISITED) {
      if (this.learnableSkill != null) {
        xw.writeAttribute$String$FreeColObject(IndianSettlement.LEARNABLE_SKILL_TAG, this.learnableSkill);
      }
      for (let i = 0; i < IndianSettlement.WANTED_GOODS_COUNT; i++) {
        let gt = this.getWantedGoods$int(i);
        if (gt != null) {
          xw.writeAttribute$String$FreeColObject(IndianSettlement.WANTED_GOODS_TAG + i, gt);
        }
      }
      let hated = this.getMostHated();
      if (hated != null) {
        xw.writeAttribute$String$FreeColObject(IndianSettlement.MOST_HATED_TAG, hated);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.missionary_ != null) {
      xw.writeStartElement(IndianSettlement.MISSIONARY_TAG);
      this.missionary_.toXML$FreeColXMLWriter(xw);
      xw.writeEndElement();
    }
    if (xw.validFor(this.getOwner())) {
      for (const $it8 = CollectionUtils.sort$Collection(this.contactLevels.keySet()).iterator(); $it8.hasNext(); ) {
        let p = $it8.next();
        xw.writeStartElement(IndianSettlement.CONTACT_LEVEL_TAG);
        xw.writeAttribute$String$Enum(IndianSettlement.LEVEL_TAG, this.contactLevels.get(p));
        xw.writeAttribute$String$FreeColObject(IndianSettlement.PLAYER_TAG, p);
        xw.writeEndElement();
      }
      for (const $it9 = CollectionUtils.sort$Collection(this.alarm.keySet()).iterator(); $it9.hasNext(); ) {
        let p = $it9.next();
        xw.writeStartElement(IndianSettlement.ALARM_TAG);
        xw.writeAttribute$String$FreeColObject(IndianSettlement.PLAYER_TAG, p);
        xw.writeAttribute$String$int(FreeColObject.VALUE_TAG, this.getAlarm$Player(p).getValue());
        xw.writeEndElement();
      }
      for (const $it10 = CollectionUtils.sort$Collection(this.ownedUnits).iterator(); $it10.hasNext(); ) {
        let unit = $it10.next();
        xw.writeStartElement(IndianSettlement.OWNED_UNITS_TAG);
        xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, unit);
        xw.writeEndElement();
      }
    } else {
      let client = xw.getClientPlayer();
      let cl = this.getContactLevel(client);
      if (cl != null) {
        xw.writeStartElement(IndianSettlement.CONTACT_LEVEL_TAG);
        xw.writeAttribute$String$Enum(IndianSettlement.LEVEL_TAG, cl);
        xw.writeAttribute$String$FreeColObject(IndianSettlement.PLAYER_TAG, client);
        xw.writeEndElement();
      }
      let alarm = this.getAlarm$Player(client);
      if (alarm != null) {
        xw.writeStartElement(IndianSettlement.ALARM_TAG);
        xw.writeAttribute$String$FreeColObject(IndianSettlement.PLAYER_TAG, client);
        xw.writeAttribute$String$int(FreeColObject.VALUE_TAG, alarm.getValue());
        xw.writeEndElement();
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    this.lastTribute = xr.getAttribute$String$int(IndianSettlement.LAST_TRIBUTE_TAG, 0);
    this.convertProgress = xr.getAttribute$String$int(IndianSettlement.CONVERT_PROGRESS_TAG, 0);
    this.learnableSkill = xr.getType(spec, IndianSettlement.LEARNABLE_SKILL_TAG, $J.cls(UnitType), null);
    this.mostHated = xr.findFreeColGameObject(this.getGame(), IndianSettlement.MOST_HATED_TAG, $J.cls(Player), null, false);
    for (let i = 0; i < IndianSettlement.WANTED_GOODS_COUNT; i++) {
      this.setWantedGoods$int$GoodsType(i, xr.getType(spec, IndianSettlement.WANTED_GOODS_TAG + i, $J.cls(GoodsType), null));
    }
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.clearContactLevels();
    this.clearAlarm();
    this.missionary_ = null;
    this.clearOwnedUnits();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let game = this.getGame();
    let tag = xr.getLocalName();
    if ($J.equals(IndianSettlement.ALARM_TAG, tag)) {
      let player = xr.findFreeColGameObject(game, IndianSettlement.PLAYER_TAG, $J.cls(Player), null, true);
      this.setAlarm$Player$Tension(player, new Tension()._Tension$int(xr.getAttribute$String$int(FreeColObject.VALUE_TAG, 0)));
      xr.closeTag$String(IndianSettlement.ALARM_TAG);
    } else if ($J.equals(IndianSettlement.CONTACT_LEVEL_TAG, tag)) {
      let cl = xr.getAttribute$String$Class$Enum(IndianSettlement.LEVEL_TAG, $J.cls(IndianSettlement$ContactLevel), IndianSettlement$ContactLevel.UNCONTACTED);
      let player = xr.findFreeColGameObject(game, IndianSettlement.PLAYER_TAG, $J.cls(Player), null, true);
      this.setContactLevel(player, cl);
      xr.closeTag$String(IndianSettlement.CONTACT_LEVEL_TAG);
    } else if ($J.equals(IndianSettlement.MISSIONARY_TAG, tag)) {
      xr.nextTag();
      this.missionary_ = xr.readFreeColObject$Game$Class(game, $J.cls(Unit));
      this.missionary_.setLocationNoUpdate(this);
      xr.closeTag$String(IndianSettlement.MISSIONARY_TAG);
    } else if ($J.equals(IndianSettlement.OWNED_UNITS_TAG, tag)) {
      let unit = xr.makeFreeColObject(game, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(Unit), true);
      this.addOwnedUnit(unit);
      xr.closeTag$String(IndianSettlement.OWNED_UNITS_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return IndianSettlement.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    let name = this.getName();
    sb.append((name == null) ? 'NONAME' : name);
    let tile = this.getTile$();
    if (tile != null) {
      sb.append(' at (').append(String(tile.getX())).append(String.fromCharCode(44 /* ',' */)).append(String(tile.getY())).append(String.fromCharCode(41 /* ')' */));
    }
    return sb.toString();
  }
  static $clinit() {
    IndianSettlement.logger = Logger.getLogger($J.cls(IndianSettlement).getName());
  }
}

/**
 * The level of contact between a player and this settlement.
 */
export class IndianSettlement$ContactLevel extends JEnum {
  static UNCONTACTED: IndianSettlement$ContactLevel = null;
  static CONTACTED: IndianSettlement$ContactLevel = null;
  static VISITED: IndianSettlement$ContactLevel = null;
  static SCOUTED: IndianSettlement$ContactLevel = null;
  static $VALUES: IndianSettlement$ContactLevel[] = null;
  _IndianSettlement$ContactLevel($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): IndianSettlement$ContactLevel[] { return IndianSettlement$ContactLevel.$VALUES.slice(); }
  static valueOf(name: string): IndianSettlement$ContactLevel { return $J.enumValueOf(IndianSettlement$ContactLevel, name); }
  static $clinit() {
    IndianSettlement$ContactLevel.UNCONTACTED = new IndianSettlement$ContactLevel()._IndianSettlement$ContactLevel('UNCONTACTED', 0);
    IndianSettlement$ContactLevel.CONTACTED = new IndianSettlement$ContactLevel()._IndianSettlement$ContactLevel('CONTACTED', 1);
    IndianSettlement$ContactLevel.VISITED = new IndianSettlement$ContactLevel()._IndianSettlement$ContactLevel('VISITED', 2);
    IndianSettlement$ContactLevel.SCOUTED = new IndianSettlement$ContactLevel()._IndianSettlement$ContactLevel('SCOUTED', 3);
    IndianSettlement$ContactLevel.$VALUES = [IndianSettlement$ContactLevel.UNCONTACTED, IndianSettlement$ContactLevel.CONTACTED, IndianSettlement$ContactLevel.VISITED, IndianSettlement$ContactLevel.SCOUTED];
  }
}

$J.define(IndianSettlement, 'net.sf.freecol.common.model.IndianSettlement', { kind: 'class', ifaces: ['net.sf.freecol.common.model.TradeLocation'], sup: 'net.sf.freecol.common.model.Settlement', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_IndianSettlement$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,java.lang.String,net.sf.freecol.common.model.Tile': '_IndianSettlement$Game$Player$String$Tile' }, returns: { 'getXMLTagName': 'java.lang.String', 'getUpkeep': 'int', 'getSonsOfLiberty': 'int', 'isBadlyDefended': 'boolean', 'getDefenceRatio': 'double', 'getGoodsCapacity': 'int', 'getIndianSettlement': 'net.sf.freecol.common.model.IndianSettlement', 'getRequiredDefenders': 'int', 'getGoodsForSale': 'java.util.List', 'getAlarm$': 'java.util.Map', 'hasAnyScouted': 'boolean', 'getMostHated': 'net.sf.freecol.common.model.Player', 'getWantedGoodsCount': 'int', 'getWantedGoods$': 'java.util.List', 'getConvertProgress': 'int', 'getMissionaryVisibleTiles': 'java.util.List', 'getMissionaryLineOfSight': 'int', 'hasMissionary$': 'boolean', 'getMissionary': 'net.sf.freecol.common.model.Unit', 'getLearnableSkill': 'net.sf.freecol.common.model.UnitType', 'getLastTribute': 'int', 'getOwnedUnitList': 'java.util.List' }, meths: { 'getPriceToSell(net.sf.freecol.common.model.GoodsType,int)': 'getPriceToSell$GoodsType$int', 'getPriceToSell(net.sf.freecol.common.model.AbstractGoods)': 'getPriceToSell$AbstractGoods', 'getPriceToBuy(net.sf.freecol.common.model.GoodsType,int)': 'getPriceToBuy$GoodsType$int', 'getPriceToBuy(net.sf.freecol.common.model.AbstractGoods)': 'getPriceToBuy$AbstractGoods', 'setAlarm(net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Tension)': 'setAlarm$Player$Tension', 'getAlarm(net.sf.freecol.common.model.Player)': 'getAlarm$Player', 'setAlarm(java.util.Map)': 'setAlarm$Map', 'getAlarm()': 'getAlarm$', 'setWantedGoods(int,net.sf.freecol.common.model.GoodsType)': 'setWantedGoods$int$GoodsType', 'setWantedGoods(java.util.List)': 'setWantedGoods$List', 'getWantedGoods(int)': 'getWantedGoods$int', 'getWantedGoods()': 'getWantedGoods$', 'hasMissionary(net.sf.freecol.common.model.Player)': 'hasMissionary$Player', 'hasMissionary()': 'hasMissionary$' }, clinit: true, lazy: ['logger'] });
$J.define(IndianSettlement$ContactLevel, 'net.sf.freecol.common.model.IndianSettlement$ContactLevel', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_IndianSettlement$ContactLevel' }, clinit: true, lazy: ['$VALUES', 'UNCONTACTED', 'CONTACTED', 'VISITED', 'SCOUTED'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Role = $J.load('net.sf.freecol.common.model.Role');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tension = $J.load('net.sf.freecol.common.model.Tension');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
});
