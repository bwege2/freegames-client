// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/ServerIndianSettlement.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Comparator, Logger } from '../../../../../../jre/index.ts';
import { IndianSettlement } from '../../common/model/IndianSettlement.ts';

let Messages, Ability, GoodsContainer, ModelMessage, ModelMessage$MessageType, Modifier, Settlement, Tension, Tension$Level, ChangeSet$See, CollectionUtils, RandomUtils, ServerUnit;

/**
 * The server version of an Indian Settlement.
 */
export class ServerIndianSettlement extends IndianSettlement {
  static logger: Logger = null;
  /**
   * Alarm added when a new missionary is added.
   */
  static readonly ALARM_NEW_MISSIONARY: number = -100;
  /**
   * How far to search for a colony to add an Indian convert to.
   */
  static readonly MAX_CONVERT_DISTANCE: number = 10;
  static readonly MAX_HORSES_PER_TURN: number = 2;
  /**
   * Trivial constructor for Game.newInstance.
   *
   * @param game The {@code Game} in which this object belong.
   * @param id The object identifier.
   */
  _ServerIndianSettlement$Game$String(game: Game, id: string): this {
    this._IndianSettlement$Game$String(game, id);
    return this;
  }
  /**
   * Creates a new ServerIndianSettlement.
   *
   * @param game The {@code Game} in which this object belong.
   * @param owner The {@code Player} owning this settlement.
   * @param name The name for this settlement.
   * @param tile The location of the {@code IndianSettlement}.
   * @param isCapital True if settlement is tribe's capital
   * @param learnableSkill The skill that can be learned by
   *     Europeans at this settlement.
   * @param missionary The missionary in this settlement (or null).
   */
  _ServerIndianSettlement$Game$Player$String$Tile$boolean$UnitType$Unit(game: Game, owner: Player, name: string, tile: Tile, isCapital: boolean, learnableSkill: UnitType, missionary: Unit): this {
    this._IndianSettlement$Game$Player$String$Tile(game, owner, name, tile);
    this.setGoodsContainer(new GoodsContainer()._GoodsContainer$Game$Location(game, this));
    this.learnableSkill = learnableSkill;
    this.setCapital(isCapital);
    this.missionary_ = missionary;
    this.convertProgress = 0;
    this.updateWantedGoods();
    return this;
  }
  /**
   * Creates a new ServerIndianSettlement from a template.
   *
   * @param game The {@code Game} in which this object belong.
   * @param owner The {@code Player} owning this settlement.
   * @param tile The location of the {@code IndianSettlement}.
   * @param template The template {@code IndianSettlement} to copy.
   */
  _ServerIndianSettlement$Game$Player$Tile$IndianSettlement(game: Game, owner: Player, tile: Tile, template: IndianSettlement): this {
    this._IndianSettlement$Game$Player$String$Tile(game, owner, template.getName(), tile);
    this.setLearnableSkill(template.getLearnableSkill());
    this.setCapital(template.isCapital());
    for (const $it0 = template.getUnitList().iterator(); $it0.hasNext(); ) {
      let unit = $it0.next();
      let newUnit = new ServerUnit()._ServerUnit$Game$Location$Unit(game, this, unit);
      this.add(newUnit);
      this.addOwnedUnit(newUnit);
    }
    let missionary = template.getMissionary();
    if (missionary != null) {
      this.missionary_ = new ServerUnit()._ServerUnit$Game$Location$Unit(game, this, missionary);
    }
    this.setConvertProgress(template.getConvertProgress());
    this.setLastTribute(template.getLastTribute());
    this.setGoodsContainer(new GoodsContainer()._GoodsContainer$Game$Location(game, this));
    let spec = this.getSpecification();
    for (const $it1 = template.getCompactGoodsList().iterator(); $it1.hasNext(); ) {
      let goods = $it1.next();
      let type$ = spec.getGoodsType(goods.getType().getId());
      this.addGoods$GoodsType$int(type$, goods.getAmount());
    }
    this.setWantedGoods$List(template.getWantedGoods$());
    return this;
  }
  /**
   * Starts a new turn for a player.
   *
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csStartTurn(random: Random, cs: ChangeSet): void {
    let missionary = this.getMissionary();
    if (missionary == null) {
      return;
    }
    let other = missionary.getOwner();
    let tile = this.getTile$();
    let turn = this.getGame().getTurn();
    let convert = Math.fround(this.getConvertProgress());
    let cMiss = missionary.apply$float$Turn$String(Math.fround(missionary.getType().getSkill()), turn, Modifier.CONVERSION_SKILL);
    let alarm = Math.min(this.getAlarm$Player(other).getValue(), Tension.TENSION_MAX);
    let cAlarm = missionary.apply$float$Turn$String(Math.fround(alarm), turn, Modifier.CONVERSION_ALARM_RATE);
    convert = Math.fround(convert + Math.fround(cMiss + (Math.fround(cAlarm - alarm))));
    ServerIndianSettlement.logger.finest('Conversion at ' + this.getName() + ' alarm=' + alarm + ' ' + $J.fstr(convert) + ' = ' + this.getConvertProgress() + ' + ' + $J.fstr(cMiss) + ' + ' + $J.fstr(cAlarm));
    let colony = tile.getNearestSettlement(other, ServerIndianSettlement.MAX_CONVERT_DISTANCE, true);
    if (convert < Math.fround(this.getType().getConvertThreshold()) || ((this.getUnitCount() + tile.getUnitCount()) | 0) <= 2 || colony == null) {
      this.setConvertProgress($J.d2i(Math.floor(convert)));
    } else {
      this.setConvertProgress(0);
      let brave = RandomUtils.getRandomMember$Logger$String$List$Random(ServerIndianSettlement.logger, 'Convert', this.getAllUnitsList(), random);
      colony.csAddConvert(brave, cs);
    }
  }
  /**
   * Add a standard number of units to this settlement and tile.  If
   * a pseudo-random number source is provided use it to pick a
   * random number of units within the ranges provided by the
   * settlement type, otherwise use the average.
   *
   * @param random An optional pseudo-random number source.
   */
  addUnits$Random(random: Random): void {
    let low = this.getType().getMinimumSize();
    let high = this.getType().getMaximumSize();
    let count = (random == null) ? $J.idiv(((high + low) | 0), 2) : ((RandomUtils.randomInt(ServerIndianSettlement.logger, 'Units at ' + this.getName(), random, (high - low + 1) | 0)) + low) | 0;
    this.addUnits$int(count);
  }
  /**
   * Add a given number of units to the settlement.
   *
   * @param count The number of units to add.
   */
  addUnits$int(count: number): void {
    let spec = this.getSpecification();
    let game = this.getGame();
    let brave = spec.getDefaultUnitType$Player(this.getOwner());
    for (let i = 0; i < count; i++) {
      let unit = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType$Role(game, this, this.getOwner(), brave, brave.getDefaultRole());
      unit.changeHomeIndianSettlement(this);
      unit.setLocation(this);
    }
  }
  /**
   * Convenience function to remove an amount of goods.
   *
   * @param type The {@code GoodsType} to remove.
   * @param amount The amount of goods to remove.
   */
  consumeGoods(type$: GoodsType, amount: number): void {
    if (this.getGoodsCount(type$) > 0) {
      amount = Math.min(amount, this.getGoodsCount(type$));
      this.removeGoods$GoodsType$int(type$, amount);
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
    if (player != null && player !== this.owner) {
      super.setAlarm$Player$Tension(player, newAlarm);
      this.updateMostHated();
    }
  }
  /**
   * Removes all alarm towards the given player.  Used the a player leaves
   * the game.
   *
   * -til: Might change tile appearance through most hated state
   *
   * @param player The {@code Player} to remove the alarm for.
   */
  removeAlarm(player: Player): void {
    if (player != null) {
      this.alarm.remove(player);
      this.updateMostHated();
    }
  }
  /**
   * Updates the most hated nation of this settlement.
   * Needs to be public so it can be set by backwards compatibility code
   * in FreeColServer.loadGame.
   *
   * -til: This might change the tile appearance.
   *
   * @return True if the most hated nation changed.
   */
  updateMostHated(): boolean {
    let old = this.mostHated;
    let hatedPred = (p) => {
      let alarm = this.getAlarm$Player(p);
      return alarm != null && alarm.getLevel() !== Tension$Level.HAPPY;
    };
    let mostHatedComp = Comparator.comparingInt((p) => this.getAlarm$Player(p).getValue());
    this.mostHated = CollectionUtils.maximize$Stream$Predicate$Comparator(this.getGame().getLiveEuropeanPlayers([]), hatedPred, mostHatedComp);
    return this.mostHated !== old;
  }
  /**
   * Change the alarm level of this settlement by a given amount.
   *
   * -til: Might change tile appearance through most hated state
   *
   * @param player The {@code Player} the alarm level changes wrt.
   * @param amount The amount to change the alarm by.
   * @return True if the {@code Tension.Level} of the
   *     settlement alarm changes as a result of this change.
   */
  changeAlarm(player: Player, amount: number): boolean {
    let alarm = this.getAlarm$Player(player);
    if (alarm == null) {
      this.initializeAlarm(player);
      alarm = this.getAlarm$Player(player);
    }
    let oldLevel = alarm.getLevel();
    alarm.modify(amount);
    let change = this.updateMostHated();
    return change || oldLevel !== alarm.getLevel();
  }
  /**
   * Modifies the alarm level towards the given player due to an event
   * at this settlement, and propagate the alarm upwards through the
   * tribe.
   *
   * -til: Might change tile appearance through most hated state
   *
   * @param player The {@code Player} to modify alarm for.
   * @param add The amount to add to the current alarm level.
   * @param propagate If true, propagate the alarm change upward to the
   *     owning player.
   * @param cs A {@code ChangeSet} to update.
   * @return True if the alarm changed.
   */
  csChangeAlarm(player: Player, add: number, propagate: boolean, cs: ChangeSet): boolean {
    let change = this.changeAlarm(player, add);
    if (propagate) {
      (this.getOwner()).csModifyTension$Player$int$Settlement$ChangeSet(player, ((this.isCapital()) ? add : $J.idiv(add, 2)), this, cs);
    }
    ServerIndianSettlement.logger.finest('Alarm at ' + this.getName() + ' toward ' + player.getName() + ' modified by ' + add + ' now = ' + this.getAlarm$Player(player).getValue());
    return change;
  }
  /**
   * Modifies the alarm level towards the given player due to an event
   * at this settlement, and propagate the alarm upwards through the
   * tribe.
   *
   * +til: Handles tile visibility changes.
   *
   * @param player The {@code Player} to modify alarm for.
   * @param add The amount to add to the current alarm level.
   * @param propagate If true, propagate the alarm change upward to the
   *     owning player.
   * @param cs A {@code ChangeSet} to update.
   * @return True if the alarm changed and the tile added.
   */
  csModifyAlarm(player: Player, add: number, propagate: boolean, cs: ChangeSet): boolean {
    let copied = this.getTile$().getTileToCache();
    let change = this.csChangeAlarm(player, add, propagate, cs);
    if (change) {
      this.getTile$().cacheUnseen$Tile(copied);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [this]);
    }
    return change;
  }
  /**
   * Changes the missionary for this settlement and updates other players.
   *
   * +vis: Handles the visibility implications.
   * +til: Handles the tile appearance change.
   *
   * @param missionary The new missionary for this settlement.
   * @param cs A {@code ChangeSet} to update.
   */
  csChangeMissionary(missionary: Unit, cs: ChangeSet): void {
    let old = this.getMissionary();
    if (missionary === old) {
      return;
    }
    let tile = this.getTile$();
    let newOwner = (missionary == null) ? null : missionary.getOwner();
    tile.cacheUnseen$Player(newOwner);
    if (old != null) {
      let oldOwner = old.getOwner();
      this.setMissionary(null);
      tile.updateIndianSettlement(oldOwner);
      (old).csRemove(ChangeSet$See.only(oldOwner), null, cs);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(oldOwner), [tile]);
      oldOwner.invalidateCanSeeTiles();
    }
    if (missionary != null) {
      this.setMissionary(missionary);
      missionary.setLocation(null);
      missionary.setLocationNoUpdate(this);
      missionary.setMovesLeft(0);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(newOwner), [missionary]);
      this.setConvertProgress(0);
      this.csChangeAlarm(newOwner, ServerIndianSettlement.ALARM_NEW_MISSIONARY, true, cs);
      tile.updateIndianSettlement(newOwner);
      cs.add$See$Collection(ChangeSet$See.only(newOwner), (newOwner).collectNewTiles$Collection(this.getMissionaryVisibleTiles()));
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(newOwner), [tile]);
      newOwner.invalidateCanSeeTiles();
    }
  }
  /**
   * Kills the missionary at this settlement.
   *
   * @param destroy If true, the settlement is destroyed, if false the
   *     missionary is denounced, if null do not generate a message.
   * @param cs A {@code ChangeSet} to update.
   */
  csKillMissionary(destroy: boolean, cs: ChangeSet): void {
    let missionary = this.getMissionary();
    if (missionary == null) {
      return;
    }
    this.csChangeMissionary(null, cs);
    let missionaryOwner = missionary.getOwner();
    if (destroy != null) {
      if (destroy) {
        cs.addMessage(missionaryOwner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.UNIT_LOST, 'model.indianSettlement.mission.destroyed', this).addStringTemplate$String$StringTemplate('%settlement%', this.getLocationLabelFor(missionaryOwner)));
      } else {
        cs.addMessage(missionaryOwner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'model.indianSettlement.mission.denounced', this).addStringTemplate$String$StringTemplate('%settlement%', this.getLocationLabelFor(missionaryOwner)));
      }
    }
  }
  /**
   * Equip a unit for a specific role.
   *
   * @param unit The {@code Unit} to equip.
   * @param role The {@code Role} to equip for.
   * @param roleCount The role count.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   * @return True if the equipping succeeds.
   */
  csEquipForRole(unit: Unit, role: Role, roleCount: number, random: Random, cs: ChangeSet): boolean {
    let ret = this.equipForRole(unit, role, roleCount);
    if (ret) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this.getOwner()), [this.getTile$()]);
    }
    return ret;
  }
  /**
   * Check if tension has increased with respect to an enemy.
   *
   * @param enemy The enemy {@code Player}.
   * @param oldLevel The previous tension {@code Level}.
   * @param cs A {@code ChangeSet} to update.
   */
  csCheckTension(enemy: Player, oldLevel: Tension$Level, cs: ChangeSet): void {
    let newTension = this.getAlarm$Player(enemy);
    let newLevel = (newTension == null) ? null : newTension.getLevel();
    if (oldLevel == null || oldLevel === newLevel || !this.hasContacted(enemy) || !enemy.hasExplored(this.getTile$())) {
      return;
    }
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(null).perhapsOnly(enemy), [this]);
    if (newLevel == null || oldLevel.getLimit() > newLevel.getLimit()) {
      return;
    }
    let key = 'model.player.alarmIncrease.' + this.getAlarm$Player(enemy).getKey();
    if (!Messages.containsKey(key)) {
      return;
    }
    cs.addMessage(enemy, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, key, this).addStringTemplate$String$StringTemplate('%nation%', this.getOwner().getNationLabel()).addStringTemplate$String$StringTemplate('%enemy%', enemy.getNationLabel()).addName$String$String('%settlement%', this.getName()));
  }
  /**
   * New turn for this native settlement.
   *
   * @param random A {@code Random} number source.
   * @param lb A {@code LogBuilder} to log to.
   * @param cs A {@code ChangeSet} to update.
   */
  csNewTurn(random: Random, lb: LogBuilder, cs: ChangeSet): void {
    let spec = this.getSpecification();
    let owner = this.getOwner();
    lb.add([this]);
    let goodsList = spec.getGoodsTypeList();
    for (const $it2 = goodsList.iterator(); $it2.hasNext(); ) {
      let g = $it2.next();
      this.addGoods$GoodsType$int(g.getStoredAs(), this.getTotalProductionOf(g));
    }
    for (const $it3 = goodsList.iterator(); $it3.hasNext(); ) {
      let g = $it3.next();
      this.consumeGoods(g, this.getConsumptionOf$GoodsType(g));
    }
    let storedFood = this.getGoodsCount(spec.getPrimaryFoodType());
    if (storedFood <= 0 && this.getUnitCount() > 0) {
    }
    if (this.getUnitCount() <= 0) {
      if (this.tile.isEmpty()) {
        lb.add([' COLLAPSED, ']);
        (owner).csDisposeSettlement(this, cs);
        return;
      }
      this.tile.getFirstUnit().setLocation(this);
    }
    let foodType = spec.getPrimaryFoodType();
    let rumType = spec.getGoodsType('model.goods.rum');
    let unitTypes = spec.getUnitTypesWithAbility([Ability.BORN_IN_INDIAN_SETTLEMENT]);
    if (!unitTypes.isEmpty() && (((this.getGoodsCount(foodType) + Math.imul(4, this.getGoodsCount(rumType))) | 0) > ((Settlement.FOOD_PER_COLONIST + IndianSettlement.KEEP_RAW_MATERIAL) | 0))) {
      if (this.ownedUnits.size() <= this.getType().getMaximumSize()) {
        let type$ = RandomUtils.getRandomMember$Logger$String$List$Random(ServerIndianSettlement.logger, 'Choose birth', unitTypes, random);
        let unit = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(this.getGame(), this.getTile$(), owner, type$);
        this.consumeGoods(rumType, $J.idiv(Settlement.FOOD_PER_COLONIST, 4));
        this.addOwnedUnit(unit);
        unit.changeHomeIndianSettlement(this);
        lb.add([' new ', unit]);
      }
      this.consumeGoods(foodType, Settlement.FOOD_PER_COLONIST);
    }
    let horsesType = spec.getGoodsType('model.goods.horses');
    let grainType = spec.getGoodsType('model.goods.grain');
    let foodProdAvail = (this.getTotalProductionOf(grainType) - this.getFoodConsumption()) | 0;
    if (foodProdAvail > 0 && this.getGoodsCount(horsesType) >= horsesType.getBreedingNumber()) {
      let nHorses = Math.min(ServerIndianSettlement.MAX_HORSES_PER_TURN, foodProdAvail);
      this.addGoods$GoodsType$int(horsesType, nHorses);
      lb.add([' bred ', nHorses, ' horses']);
    }
    this.getGoodsContainer().removeAbove(this.getWarehouseCapacity());
    this.updateWantedGoods();
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [this]);
    lb.add([', ']);
  }
  static $clinit() {
    ServerIndianSettlement.logger = Logger.getLogger($J.cls(ServerIndianSettlement).getName());
  }
}

$J.define(ServerIndianSettlement, 'net.sf.freecol.server.model.ServerIndianSettlement', { kind: 'class', ifaces: ['net.sf.freecol.server.model.TurnTaker'], sup: 'net.sf.freecol.common.model.IndianSettlement', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.IndianSettlement': '_ServerIndianSettlement$Game$Player$Tile$IndianSettlement', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,java.lang.String,net.sf.freecol.common.model.Tile,boolean,net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Unit': '_ServerIndianSettlement$Game$Player$String$Tile$boolean$UnitType$Unit', 'net.sf.freecol.common.model.Game,java.lang.String': '_ServerIndianSettlement$Game$String' }, meths: { 'setAlarm(net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Tension)': 'setAlarm$Player$Tension', 'addUnits(int)': 'addUnits$int', 'addUnits(java.util.Random)': 'addUnits$Random' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Tension = $J.load('net.sf.freecol.common.model.Tension');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
