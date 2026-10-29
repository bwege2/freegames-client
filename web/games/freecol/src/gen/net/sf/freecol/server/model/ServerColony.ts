// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/ServerColony.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, IllegalStateException, JString, Logger } from '../../../../../../jre/index.ts';
import { Colony } from '../../common/model/Colony.ts';

let Messages, Ability, AbstractGoods, BuildQueue$CompletionAction, BuildingType, Colony$NoBuildReason, GoodsContainer, Market$Access, ModelMessage, ModelMessage$MessageType, StringTemplate, Unit$UnitState, UnitChangeType, UnitType, ChangeSet$See, CollectionUtils, LogBuilder, RandomUtils, ServerBuilding, ServerColonyTile, ServerUnit, TurnTaker;

/**
 * The server version of a colony.
 */
export class ServerColony extends Colony {
  static logger: Logger = null;
  /**
   * Trivial constructor for Game.newInstance.
   *
   * @param game The {@code Game} in which this object belongs.
   * @param id The object identifier.
   */
  _ServerColony$Game$String(game: Game, id: string): this {
    this._Colony$Game$String(game, id);
    return this;
  }
  /**
   * Creates a new ServerColony.
   *
   * @param game The {@code Game} in which this object belongs.
   * @param owner The {@code Player} owning this {@code Colony}.
   * @param name The name of the new {@code Colony}.
   * @param tile The location of the {@code Colony}.
   */
  _ServerColony$Game$Player$String$Tile(game: Game, owner: Player, name: string, tile: Tile): this {
    this._Colony$Game$Player$String$Tile(game, owner, name, tile);
    let spec = this.getSpecification();
    this.setGoodsContainer(new GoodsContainer()._GoodsContainer$Game$Location(game, this));
    this.sonsOfLiberty = 0;
    this.oldSonsOfLiberty = 0;
    this.established = game.getTurn();
    let colonyTile = new ServerColonyTile()._ServerColonyTile$Game$Colony$Tile(game, this, tile);
    this.colonyTiles.add(colonyTile);
    for (const $it0 = tile.getSurroundingTiles$int(this.getRadius()).iterator(); $it0.hasNext(); ) {
      let t = $it0.next();
      this.colonyTiles.add(new ServerColonyTile()._ServerColonyTile$Game$Colony$Tile(game, this, t));
    }
    let building: Building;
    let buildingTypes = spec.getBuildingTypeList();
    for (const $it1 = (CollectionUtils.transform$Collection$Predicate(buildingTypes, (bt) => bt.isAutomaticBuild() || this.isAutomaticBuild(bt))).iterator(); $it1.hasNext(); ) {
      let buildingType = $it1.next();
      this.addBuilding(new ServerBuilding()._ServerBuilding$Game$Colony$BuildingType(this.getGame(), this, buildingType));
    }
    if (this.isLandLocked()) {
      this.buildQueue.add(spec.getBuildingType('model.building.warehouse'));
    } else {
      this.buildQueue.add(spec.getBuildingType('model.building.docks'));
      this.addPortAbility();
    }
    for (const $it2 = (CollectionUtils.transform$Collection$Predicate(spec.getUnitTypesWithAbility([Ability.BORN_IN_COLONY]), ($p0) => $p0.needsGoodsToBuild())).iterator(); $it2.hasNext(); ) {
      let unitType = $it2.next();
      this.populationQueue.add(unitType);
    }
    return this;
  }
  /**
   * Is a goods type needed for a buildable that this colony could
   * be building.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return True if the goods could be used to build something.
   */
  neededForBuildableType(goodsType: GoodsType): boolean {
    let spec = this.getSpecification();
    let buildables = new ArrayList();
    buildables.addAll(spec.getBuildingTypeList());
    buildables.addAll(spec.getUnitTypesWithoutAbility([Ability.PERSON]));
    return CollectionUtils.any$Collection$Predicate(buildables, (bt) => this.canBuild$BuildableType(bt) && CollectionUtils.any$Stream$Predicate(bt.getRequiredGoods$(), AbstractGoods.matches(goodsType)));
  }
  /**
   * Build a unit from a build queue.
   *
   * @param buildQueue The {@code BuildQueue} to find the unit in.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   * @return The unit that was built.
   */
  csBuildUnit(buildQueue: BuildQueue<BuildableType>, random: Random, cs: ChangeSet): Unit {
    let type$ = buildQueue.getCurrentlyBuilding();
    let unit = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(this.getGame(), this.getTile$(), this.owner, type$);
    unit.setName(this.owner.getNameForUnit(type$, random));
    if (unit.hasAbility$String(Ability.BORN_IN_COLONY)) {
      cs.addMessage(this.owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.UNIT_ADDED, 'model.colony.newColonist', this, unit).addName$String$String('%colony%', this.getName()));
    } else {
      unit.setName(this.owner.getNameForUnit(type$, random));
      cs.addMessage(this.owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.UNIT_ADDED, 'model.colony.unitReady', this, unit).addName$String$String('%colony%', this.getName()).addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$()));
    }
    ServerColony.logger.info('New unit in ' + this.getName() + ': ' + type$.getSuffix$());
    return unit;
  }
  /**
   * Eject units to any available work location.
   *
   * Called on building type changes, see below and
   * @see ServerPlayer#csDamageBuilding
   *
   * -til: Might change the visible colony size.
   *
   * @param workLocation The {@code WorkLocation} to eject from.
   * @param units A list of {@code Unit}s to eject.
   * @return True if units were ejected.
   */
  ejectUnits(workLocation: WorkLocation, units: List<Unit>): boolean {
    if (units == null || units.isEmpty()) {
      return false;
    }
    unit:
    for (const $it3 = units.iterator(); $it3.hasNext(); ) {
      let u = $it3.next();
      for (const $it4 = (CollectionUtils.transform$Stream$Predicate(this.getAvailableWorkLocations(), (w) => w !== workLocation && w.canAdd(u))).iterator(); $it4.hasNext(); ) {
        let wl = $it4.next();
        u.setLocation(wl);
        continue unit;
      }
      u.setLocation(this.getTile$());
    }
    if (this.getOwner().isAI()) {
      this.firePropertyChange$String$boolean$boolean(Colony.REARRANGE_COLONY, true, false);
    }
    return true;
  }
  /**
   * Builds a building from a build queue.
   *
   * @param buildQueue The {@code BuildQueue} to build from.
   * @param cs A {@code ChangeSet} to update.
   * @return True if the build succeeded.
   */
  csBuildBuilding(buildQueue: BuildQueue<BuildableType>, cs: ChangeSet): boolean {
    let type$ = buildQueue.getCurrentlyBuilding();
    let copied = this.getTile$().getTileToCache();
    let from = type$.getUpgradesFrom();
    let success: boolean;
    if (from == null) {
      success = this.buildBuilding(new ServerBuilding()._ServerBuilding$Game$Colony$BuildingType(this.getGame(), this, type$));
    } else {
      let building = this.getBuilding(from);
      let eject = building.upgrade();
      success = eject != null;
      if (success) {
        this.ejectUnits(building, eject);
        if (!eject.isEmpty()) {
          this.getTile$().cacheUnseen$Tile(copied);
        }
      } else {
        cs.addMessage(this.owner, this.getUnbuildableMessage(type$));
      }
    }
    if (success) {
      cs.addMessage(this.owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.BUILDING_COMPLETED, 'model.colony.buildingReady', this).addName$String$String('%colony%', this.getName()).addNamed$String$Named('%building%', type$));
      if (this.owner.isAI()) {
        this.firePropertyChange$String$boolean$boolean(Colony.REARRANGE_COLONY, true, false);
      }
      ServerColony.logger.info('New building in ' + this.getName() + ': ' + type$.getSuffix$());
    }
    return success;
  }
  /**
   * Removes a buildable from a build queue, and updates the queue so that
   * a valid buildable is now being built if possible.
   *
   * @param queue The {@code BuildQueue} to update.
   * @param cs A {@code ChangeSet} to update.
   * @return The next buildable that can be built, or null if nothing.
   */
  csNextBuildable(queue: BuildQueue<BuildableType>, cs: ChangeSet): BuildableType {
    let spec = this.getSpecification();
    let owner = this.getOwner();
    let buildable: BuildableType;
    let invalidate = false;
    let notBuildingPred = (gt) => gt.isBuildingMaterial() && !gt.isStorable() && this.getTotalProductionOf(gt) > 0;
    while ((buildable = queue.getCurrentlyBuilding()) != null) {
      switch (this.getNoBuildReason(buildable, null)) {
        case Colony$NoBuildReason.LIMIT_EXCEEDED:
          break;
        case Colony$NoBuildReason.NONE:
          return buildable;
        case Colony$NoBuildReason.NOT_BUILDING:
          if (CollectionUtils.any$Collection$Predicate(spec.getGoodsTypeList(), notBuildingPred)) {
            cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.WARNING, 'model.colony.cannotBuild', this).addName$String$String('%colony%', this.getName()));
          }
          return null;
        case Colony$NoBuildReason.POPULATION_TOO_SMALL:
          cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.WARNING, 'model.colony.buildNeedPop', this).addName$String$String('%colony%', this.getName()).addNamed$String$Named('%building%', buildable));
          break;
        default:
          ServerColony.logger.warning('Unexpected build failure at ' + this.getName() + ' for ' + $J.str(buildable) + ': ' + $J.str(this.getNoBuildReason(buildable, null)));
          cs.addMessage(owner, this.getUnbuildableMessage(buildable));
          break;
      }
      queue.remove(0);
      invalidate = true;
    }
    if (invalidate) {
      this.invalidateCache();
    }
    return null;
  }
  /**
   * Evict the users from a tile used by this colony, due to military
   * action from another unit.
   *
   * @param enemyUnit The {@code Unit} that has moved in.
   * @param cs A {@code ChangeSet} to update.
   */
  csEvictUsers(enemyUnit: Unit, cs: ChangeSet): void {
    let player = this.getOwner();
    let tile = enemyUnit.getTile$();
    let ct = this.getColonyTile(tile);
    if (ct == null) {
      return;
    }
    let colonyTile = ct.getColony().getTile$();
    let copied = colonyTile.getTileToCache();
    if (!this.ejectUnits(ct, ct.getUnitList())) {
      return;
    }
    colonyTile.cacheUnseen$Tile(copied);
    cs.addMessage(player, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.WARNING, 'model.colony.workersEvicted', this, this).addName$String$String('%colony%', this.getName()).addStringTemplate$String$StringTemplate('%location%', tile.getLocationLabel()).addStringTemplate$String$StringTemplate('%enemyUnit%', enemyUnit.getLabel$()));
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(player), [ct]);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [this.getTile$()]);
  }
  /**
   * Change the owner of this colony.
   *
   * -vis: Owner and new owner
   *
   * @param newOwner The new owning {@code Player}.
   * @param reassign If true, reassign the colony tiles.
   * @param change An optional accompanying change type for the units.
   * @param cs A {@code ChangeSet} to update.
   */
  csChangeOwner(newOwner: Player, reassign: boolean, change: string, cs: ChangeSet): void {
    let oldOwner = this.getOwner();
    let tile = this.getTile$();
    let owned = this.getOwnedTiles();
    let unseen = (newOwner).collectNewTiles$Collection(this.getVisibleTileSet());
    for (const $it5 = owned.iterator(); $it5.hasNext(); ) {
      let t = $it5.next();
      t.cacheUnseen$Player(newOwner);
    }
    this.changeOwner(newOwner);
    let units = this.getAllUnitsList();
    for (const $it6 = units.iterator(); $it6.hasNext(); ) {
      let u = $it6.next();
      (oldOwner).csChangeOwner(u, newOwner, change, null, cs);
    }
    cs.addRemoves(ChangeSet$See.only(oldOwner), this, units);
    for (const $it7 = this.exportData.values().iterator(); $it7.hasNext(); ) {
      let exportDatum = $it7.next();
      exportDatum.setExported(false);
    }
    this.buildQueue.clear();
    this.updateSoL();
    this.updateProductionBonus();
    if (reassign) {
      owned.remove(tile);
      (oldOwner).reassignTiles(owned, this);
      owned.add(tile);
      for (const $it8 = (CollectionUtils.transform$Collection$Predicate(owned, (t2) => t2.getOwningSettlement() !== this)).iterator(); $it8.hasNext(); ) {
        let t = $it8.next();
        let ct = this.getColonyTile(t);
        this.ejectUnits(ct, ct.getUnitList());
      }
    }
    unseen.addAll(owned);
    cs.add$See$Collection(ChangeSet$See.only(newOwner), unseen);
    cs.add$See$Collection(ChangeSet$See.perhaps().always(oldOwner).except(newOwner), owned);
  }
  /**
   * Add a free building to this colony.
   *
   * Triggered directly by election of laSalle, or at end of turn.
   *
   * @param type The {@code BuildingType} to add.
   * @param cs A {@code ChangeSet} to update.
   */
  csFreeBuilding(type$: BuildingType, cs: ChangeSet): void {
    if (!this.canBuild$BuildableType(type$)) {
      return;
    }
    let found = this.getBuilding(type$);
    let present = (found == null) ? Collections.emptyList() : found.getUnitList();
    let owner = this.getOwner();
    let build = new ServerBuilding()._ServerBuilding$Game$Colony$BuildingType(this.getGame(), this, type$);
    this.buildBuilding(build);
    this.checkBuildQueueIntegrity(true, null);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [this]);
    if (owner.isAI()) {
      this.firePropertyChange$String$boolean$boolean(Colony.REARRANGE_COLONY, true, false);
    }
    for (const $it9 = present.iterator(); $it9.hasNext(); ) {
      let u = $it9.next();
      u.setLocation(build);
    }
  }
  /**
   * Build a new building in this colony.
   *
   * @param building The {@code Building} to build.
   * @return True if the building was built.
   */
  buildBuilding(building: Building): boolean {
    let copied = (building.getType().isDefenceType()) ? this.getTile$().getTileToCache() : null;
    if (!this.addBuilding(building)) {
      return false;
    }
    this.getTile$().cacheUnseen$Tile(copied);
    this.invalidateCache();
    return true;
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
      if (unit.isOnCarrier()) {
        unit.setMovesLeft(0);
      }
      let tile = this.getTile$();
      tile.cacheUnseen$();
      unit.setLocation(tile);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [tile]);
    }
    return ret;
  }
  /**
   * Add a new convert to this colony.
   *
   * @param brave The convert {@code Unit}.
   * @param cs A {@code ChangeSet} to update.
   */
  csAddConvert(brave: Unit, cs: ChangeSet): void {
    if (brave == null) {
      return;
    }
    let newOwner = this.getOwner();
    let oldOwner = brave.getOwner();
    if (oldOwner.csChangeOwner(brave, newOwner, UnitChangeType.CONVERSION, this.getTile$(), cs)) {
      brave.changeRole(this.getSpecification().getDefaultRole(), 0);
      for (const $it10 = brave.getCompactGoodsList().iterator(); $it10.hasNext(); ) {
        let g = $it10.next();
        brave.removeGoods$AbstractGoods(g);
      }
      brave.setMovesLeft(0);
      brave.setState(Unit$UnitState.ACTIVE);
      cs.addDisappear(newOwner, this.tile, brave);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(newOwner), [this.getTile$()]);
      let nation = oldOwner.getNationLabel();
      cs.addMessage(newOwner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.UNIT_ADDED, 'model.colony.newConvert', brave).addStringTemplate$String$StringTemplate('%nation%', nation).addName$String$String('%colony%', this.getName()));
      newOwner.invalidateCanSeeTiles();
      ServerColony.logger.fine('Convert at ' + this.getName() + ' for ' + this.getName());
    }
  }
  /**
   * Destroy an existing building in this colony.
   *
   * @param building The {@code Building} to destroy.
   * @return True if the building was destroyed.
   */
  destroyBuilding(building: Building): boolean {
    let copied = (building.getType().isDefenceType()) ? this.getTile$().getTileToCache() : null;
    if (!this.removeBuilding(building)) {
      return false;
    }
    this.getTile$().cacheUnseen$Tile(copied);
    this.invalidateCache();
    this.checkBuildQueueIntegrity(true, null);
    return true;
  }
  /**
   * Do the checks for user warnings that must wait for all player
   * settlements, units and whatever to stabilize.  Along the way,
   * throw away excess goods.
   *
   * For example, a pioneer might clear a colony tile and change the
   * lumber amount.
   *
   * @param random A {@code Random} number source.
   * @param lb A {@code LogBuilder} to log to.
   * @param cs A {@code ChangeSet} to update.
   */
  csNewTurnWarnings(random: Random, lb: LogBuilder, cs: ChangeSet): void {
    let spec = this.getSpecification();
    let queues = [this.buildQueue, this.populationQueue];
    let container = this.getGoodsContainer();
    for (const $it11 = this.getCurrentWorkLocationsList().iterator(); $it11.hasNext(); ) {
      let wl = $it11.next();
      if (wl instanceof ServerBuilding) {
        (wl).csCheckMissingInput(this.getProductionInfo(wl), cs);
      }
    }
    for (let queue of queues) {
      let info = this.getProductionInfo(queue);
      if (info == null) {
        continue;
      }
      if (info.getConsumption().isEmpty()) {
        let build = queue.getCurrentlyBuilding();
        if (build != null) {
          let needed = new AbstractGoods()._AbstractGoods$();
          let complete = this.getTurnsToComplete$BuildableType$AbstractGoods(build, needed);
          if (complete === -2 || complete === -1) {
            cs.addMessage(this.owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.MISSING_GOODS, 'model.colony.buildableNeedsGoods', this, build).addName$String$String('%colony%', this.getName()).addNamed$String$Named('%buildable%', build).addAmount('%amount%', needed.getAmount()).addNamed$String$Named('%goodsType%', needed.getType()));
          }
        }
      }
    }
    let limit = this.getWarehouseCapacity();
    let adjustment = $J.idiv(limit, GoodsContainer.CARGO_SIZE);
    for (const $it12 = (CollectionUtils.transform$Collection$Predicate(this.getCompactGoodsList(), ($p0) => $p0.isStorable())).iterator(); $it12.hasNext(); ) {
      let goods = $it12.next();
      let type$ = goods.getType();
      let exportData = this.getExportData$GoodsType(type$);
      let low = Math.imul(exportData.getLowLevel(), adjustment);
      let high = Math.imul(exportData.getHighLevel(), adjustment);
      let amount = goods.getAmount();
      let oldAmount = container.getOldGoodsCount(type$);
      if (amount < low && oldAmount >= low && type$ !== spec.getPrimaryFoodType()) {
        cs.addMessage(this.owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.WAREHOUSE_CAPACITY, 'model.colony.warehouseEmpty', this, type$).addNamed$String$Named('%goods%', type$).addAmount('%level%', low).addName$String$String('%colony%', this.getName()));
        continue;
      }
      if (type$.limitIgnored()) {
        continue;
      }
      let messageId = null;
      let waste = 0;
      if (amount > limit) {
        waste = (amount - limit) | 0;
        container.removeGoods$GoodsType$int(type$, waste);
        messageId = 'model.colony.warehouseWaste';
      } else if (amount === limit && oldAmount < limit) {
        messageId = 'model.colony.warehouseOverfull';
      } else if (amount > high && oldAmount <= high) {
        messageId = 'model.colony.warehouseFull';
      }
      if (messageId != null) {
        cs.addMessage(this.owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.WAREHOUSE_CAPACITY, messageId, this, type$).addNamed$String$Named('%goods%', type$).addAmount('%waste%', waste).addAmount('%level%', high).addName$String$String('%colony%', this.getName()));
      }
      if (!(exportData.getExported() && this.hasAbility$String(Ability.EXPORT) && this.owner.canTrade$GoodsType$Access(type$, Market$Access.CUSTOM_HOUSE)) && amount <= limit) {
        let loss = (amount + this.getNetProductionOf(type$) - limit) | 0;
        if (loss > 0) {
          cs.addMessage(this.owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.WAREHOUSE_CAPACITY, 'model.colony.warehouseSoonFull', this, type$).addNamed$String$Named('%goods%', goods).addName$String$String('%colony%', this.getName()).addAmount('%amount%', loss));
        }
      }
    }
    if ((CollectionUtils.any$ObjectArr$Predicate(queues, ($p0) => $p0.isEmpty())) && (CollectionUtils.any$Collection$Predicate(spec.getGoodsTypeList(), (g) => (g.isBuildingMaterial() && !g.isRawMaterial() && !g.isBreedable() && this.getAdjustedNetProductionOf(g) > 0 && this.neededForBuildableType(g))))) {
      cs.addMessage(this.owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.BUILDING_COMPLETED, 'model.colony.notBuildingAnything', this).addName$String$String('%colony%', this.getName()));
    }
  }
  /**
   * New turn for this colony.
   * Try to find out if the colony is going to survive (last colonist does
   * not starve) before generating lots of production-related messages.
   *
   * @param random A {@code Random} number source.
   * @param lb A {@code LogBuilder} to log to.
   * @param cs A {@code ChangeSet} to update.
   */
  csNewTurn(random: Random, lb: LogBuilder, cs: ChangeSet): void {
    lb.add(['COLONY ', this]);
    let spec = this.getSpecification();
    let owner = this.getOwner();
    let queues = [this.buildQueue, this.populationQueue];
    let tile = this.getTile$();
    if (this.getUnitCount() <= 0) {
      lb.add([' 0-unit DISPOSING, ']);
      owner.csDisposeSettlement(this, cs);
      return;
    }
    let tileDirty = false;
    let newUnitBorn = false;
    let container = this.getGoodsContainer();
    container.saveState();
    this.invalidateCache();
    for (const $it13 = this.getCurrentWorkLocationsList().iterator(); $it13.hasNext(); ) {
      let wl = $it13.next();
      if ($J.isa(wl, TurnTaker)) {
        (wl).csNewTurn(random, lb, cs);
      }
      let productionInfo = this.getProductionInfo(wl);
      if (productionInfo == null) {
        continue;
      }
      if (!wl.isEmpty()) {
        for (const $it14 = productionInfo.getProduction().iterator(); $it14.hasNext(); ) {
          let goods = $it14.next();
          let expert = spec.getExpertForProducing(goods.getType());
          let experience = $J.idiv(goods.getAmount(), wl.getUnitCount());
          for (const $it15 = (CollectionUtils.transform$Stream$Predicate(wl.getUnits(), (u) => u.getUnitChange$String$UnitType(UnitChangeType.EXPERIENCE, expert) != null)).iterator(); $it15.hasNext(); ) {
            let unit = $it15.next();
            unit.changeExperienceType(goods.getType());
            unit.setExperience((unit.getExperience() + experience) | 0);
            cs.addPartial(ChangeSet$See.only(owner), unit, ['experience', String(unit.getExperience())]);
          }
        }
      }
    }
    let productionMap = this.getProductionMap();
    let built = new ArrayList();
    for (let queue of queues) {
      let info = this.getProductionInfo(queue);
      if (info == null) {
        continue;
      }
      if (!info.getConsumption().isEmpty()) {
        let buildable = this.csNextBuildable(queue, cs);
        if (buildable == null) {
        } else if (buildable instanceof UnitType) {
          let newUnit = this.csBuildUnit(queue, random, cs);
          if (newUnit.hasAbility$String(Ability.BORN_IN_COLONY)) {
            newUnitBorn = true;
          }
          built.add(queue);
        } else if (buildable instanceof BuildingType) {
          let unitCount = this.getUnitCount();
          if (this.csBuildBuilding(queue, cs)) {
            built.add(queue);
            tileDirty = (buildable).isDefenceType() || unitCount !== this.getUnitCount();
          }
        } else {
          throw new IllegalStateException('Bogus buildable: ' + $J.str(buildable));
        }
      }
    }
    for (const $it16 = productionMap.keySet().iterator(); $it16.hasNext(); ) {
      let goodsType = $it16.next();
      let net = productionMap.getCount(goodsType);
      let stored = this.getGoodsCount(goodsType);
      if (((net + stored) | 0) <= 0) {
        this.removeGoods$GoodsType$int(goodsType, stored);
      } else {
        this.addGoods$GoodsType$int(goodsType, net);
      }
      if (goodsType === spec.getPrimaryFoodType()) {
        if (((net + stored) | 0) < 0) {
          if (this.getUnitCount() > 1) {
            let victim = RandomUtils.getRandomMember$Logger$String$Stream$Random(ServerColony.logger, 'Starver', this.getUnits(), random);
            (victim).csRemove(ChangeSet$See.only(owner), null, cs);
            cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.UNIT_LOST, 'model.colony.colonistStarved', this).addName$String$String('%colony%', this.getName()));
          } else {
            cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.UNIT_LOST, 'model.colony.colonyStarved', this).addName$String$String('%colony%', this.getName()));
            owner.csDisposeSettlement(this, cs);
            return;
          }
        } else if (net < 0) {
          let turns = $J.idiv(stored, -net);
          if (turns <= Colony.FAMINE_TURNS && !newUnitBorn) {
            cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.WARNING, 'model.colony.famineFeared', this).addName$String$String('%colony%', this.getName()).addAmount('%number%', turns));
            lb.add([' famine in ', turns, ' food=', stored, ' production=', net]);
          }
        }
      }
    }
    this.invalidateCache();
    if (!built.isEmpty()) {
      for (const $it17 = built.iterator(); $it17.hasNext(); ) {
        let queue = $it17.next();
        switch (queue.getCompletionAction()) {
          case BuildQueue$CompletionAction.SHUFFLE:
            if (queue.size() > 1) {
              RandomUtils.randomShuffle(ServerColony.logger, 'Build queue', queue.getValues(), random);
            }
            break;
          case BuildQueue$CompletionAction.REMOVE_EXCEPT_LAST:
            if (queue.size() === 1 && queue.getCurrentlyBuilding() instanceof UnitType) {
              break;
            }
          case BuildQueue$CompletionAction.REMOVE:
          default:
            queue.remove(0);
            break;
        }
        this.csNextBuildable(queue, cs);
      }
      tileDirty = true;
    }
    if (this.hasAbility$String(Ability.EXPORT)) {
      let lb2 = new LogBuilder()._LogBuilder(64);
      lb2.add([' ']);
      lb2.mark();
      for (const $it18 = this.getCompactGoodsList().iterator(); $it18.hasNext(); ) {
        let goods = $it18.next();
        let type$ = goods.getType();
        let data = this.getExportData$GoodsType(type$);
        if (!data.getExported() || !owner.canTrade$GoodsType$Access(goods.getType(), Market$Access.CUSTOM_HOUSE)) {
          continue;
        }
        let amount = (goods.getAmount() - data.getExportLevel()) | 0;
        if (amount <= 0) {
          continue;
        }
        let oldGold = owner.getGold();
        let marketAmount = owner.sellInEurope(random, container, type$, amount);
        if (marketAmount > 0) {
          owner.addExtraTrade(new AbstractGoods()._AbstractGoods$GoodsType$int(type$, marketAmount));
        }
        let st = StringTemplate.template$String('model.colony.customs.saleData').addAmount('%amount%', amount).addNamed$String$Named('%goods%', type$).addAmount('%gold%', ((owner.getGold() - oldGold) | 0));
        lb2.add([Messages.message$StringTemplate(st), ', ']);
      }
      if (lb2.grew([])) {
        lb2.shrink(', ');
        cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.GOODS_MOVEMENT, 'model.colony.customs.sale', this).addName$String$String('%colony%', this.getName()).addName$String$String('%data%', lb2.toString()));
        cs.addPartial(ChangeSet$See.only(owner), owner, ['gold', String(owner.getGold())]);
        lb.add([lb2.toString()]);
      }
    }
    for (const $it19 = (CollectionUtils.transform$Collection$Predicate(spec.getBuildingTypeList(), (bt) => this.isAutomaticBuild(bt))).iterator(); $it19.hasNext(); ) {
      let buildingType = $it19.next();
      this.buildBuilding(new ServerBuilding()._ServerBuilding$Game$Colony$BuildingType(this.getGame(), this, buildingType));
    }
    this.checkBuildQueueIntegrity(true, null);
    this.updateSoL();
    if ($J.idiv(this.sonsOfLiberty, 10) !== $J.idiv(this.oldSonsOfLiberty, 10)) {
      cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.SONS_OF_LIBERTY, ((this.sonsOfLiberty > this.oldSonsOfLiberty) ? 'model.colony.soLIncrease' : 'model.colony.soLDecrease'), this, spec.getGoodsType('model.goods.bells')).addAmount('%oldSoL%', this.oldSonsOfLiberty).addAmount('%newSoL%', this.sonsOfLiberty).addName$String$String('%colony%', this.getName()));
      let govMgtMessage = this.checkForGovMgtChangeMessage();
      if (govMgtMessage != null) {
        cs.addMessage(owner, govMgtMessage);
      }
    }
    this.updateProductionBonus();
    for (const $it20 = (CollectionUtils.transform$Stream$Predicate(this.getCurrentWorkLocations(), ($p0) => $p0.canTeach())).iterator(); $it20.hasNext(); ) {
      let wl = $it20.next();
      let building = wl;
      for (const $it21 = building.getUnitList().iterator(); $it21.hasNext(); ) {
        let teacher = $it21.next();
        building.csCheckTeach(teacher, cs);
      }
    }
    for (const $it22 = (CollectionUtils.transform$Stream$Predicate(this.getTile$().getUnits(), (u) => !u.isNaval() && u.isDamaged())).iterator(); $it22.hasNext(); ) {
      let unit = $it22.next();
      (unit).csRepairUnit(cs);
    }
    if (tileDirty) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [tile]);
    } else {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [this]);
    }
    lb.add([', ']);
  }
  static $clinit() {
    ServerColony.logger = Logger.getLogger($J.cls(ServerColony).getName());
  }
}

$J.define(ServerColony, 'net.sf.freecol.server.model.ServerColony', { kind: 'class', ifaces: ['net.sf.freecol.server.model.TurnTaker'], sup: 'net.sf.freecol.common.model.Colony', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,java.lang.String,net.sf.freecol.common.model.Tile': '_ServerColony$Game$Player$String$Tile', 'net.sf.freecol.common.model.Game,java.lang.String': '_ServerColony$Game$String' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  BuildQueue$CompletionAction = $J.load('net.sf.freecol.common.model.BuildQueue$CompletionAction');
  BuildingType = $J.load('net.sf.freecol.common.model.BuildingType');
  Colony$NoBuildReason = $J.load('net.sf.freecol.common.model.Colony$NoBuildReason');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  Market$Access = $J.load('net.sf.freecol.common.model.Market$Access');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  ServerBuilding = $J.load('net.sf.freecol.server.model.ServerBuilding');
  ServerColonyTile = $J.load('net.sf.freecol.server.model.ServerColonyTile');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
  TurnTaker = $J.load('net.sf.freecol.server.model.TurnTaker');
});
