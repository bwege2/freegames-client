// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/ServerUnit.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashSet, JString, Logger } from '../../../../../../jre/index.ts';
import { Unit } from '../../common/model/Unit.ts';

let Messages, NameCache, Ability, GoodsContainer, HighSeas, HistoryEvent, HistoryEvent$HistoryEventType, IndianSettlement, Location, LostCityRumour$RumourType, Map_, ModelMessage, ModelMessage$MessageType, Modifier, Resource, Stance, Tension$Level, Tile, Unit$UnitLabelType, Unit$UnitState, UnitChangeType, WorkLocation, ChangeSet$See, FountainOfYouthMessage, NewLandNameMessage, NewRegionNameMessage, GameOptions, CollectionUtils, RandomChoice, RandomUtils;

/**
 * Server version of a unit.
 */
export class ServerUnit extends Unit {
  static logger: Logger = null;
  /**
   * Trivial constructor for Game.newInstance.
   *
   * @param game The {@code Game} in which this unit belongs.
   * @param id The object identifier.
   */
  _ServerUnit$Game$String(game: Game, id: string): this {
    this._Unit$Game$String(game, id);
    return this;
  }
  /**
   * Creates a new ServerUnit.
   *
   * -vis: Visibility issues depending on location.
   * -til: Changes appearance if unit goes into a colony.
   *
   * @param game The {@code Game} in which this unit belongs.
   * @param location The {@code Location} to place this at.
   * @param owner The {@code Player} owning this unit.
   * @param type The type of the unit.
   */
  _ServerUnit$Game$Location$Player$UnitType(game: Game, location: Location, owner: Player, type$: UnitType): this {
    this._ServerUnit$Game$Location$Player$UnitType$Role(game, location, owner, type$, type$.getDefaultRole());
    return this;
  }
  /**
   * Create a new ServerUnit from a template.
   *
   * Note all FCGOTs are looked up in the specification by id,
   * allowing the template to derive from a different specification
   * as might happen when loading a scenario map.
   *
   * -vis: Visibility issues depending on location.
   * -til: Changes appearance if unit goes into a colony.
   *
   * @param game The {@code Game} in which this unit belongs.
   * @param location The {@code Location} to place this at.
   * @param template A {@code Unit} to copy from.
   */
  _ServerUnit$Game$Location$Unit(game: Game, location: Location, template: Unit): this {
    this._ServerUnit$Game$Location$Player$UnitType$Role(game, location, game.getPlayerByNationId(template.getOwner().getNationId()), game.getSpecification().getUnitType(template.getType().getId()), game.getSpecification().getDefaultRole());
    let spec = this.getSpecification();
    if (template.getName() != null) {
      this.setName(template.getName());
    }
    this.setNationality(template.getNationality());
    this.setEthnicity(template.getEthnicity());
    this.workLeft = template.getWorkLeft();
    this.workType = spec.getGoodsType(template.getWorkType().getId());
    this.movesLeft = template.getMovesLeft();
    this.hitPoints = template.getType().getHitPoints();
    this.changeRole(spec.getRole(template.getRole().getId()), template.getRoleCount());
    this.setStateUnchecked(template.getState());
    if (this.getType().canCarryGoods()) {
      this.setGoodsContainer(new GoodsContainer()._GoodsContainer$Game$Location(game, this));
    }
    this.visibleGoodsCount = -1;
    return this;
  }
  /**
   * Creates a new ServerUnit.
   *
   * -vis: Visibility issues depending on location.
   * -til: Changes appearance if unit goes into a colony.
   *
   * @param game The {@code Game} in which this unit belongs.
   * @param location The {@code Location} to place this at.
   * @param owner The {@code Player} owning this unit.
   * @param type The type of the unit.
   * @param role The role of the unit.
   */
  _ServerUnit$Game$Location$Player$UnitType$Role(game: Game, location: Location, owner: Player, type$: UnitType, role: Role): this {
    this._Unit$Game(game);
    this.owner = owner;
    this.type = type$;
    this.state = Unit$UnitState.ACTIVE;
    this.role = this.getSpecification().getDefaultRole();
    this.location_ = null;
    this.entryLocation = null;
    this.workLeft = -1;
    this.workType = null;
    this.movesLeft = this.getInitialMovesLeft();
    this.experienceType = null;
    this.experience = 0;
    this.workImprovement = null;
    this.student = this.teacher = null;
    this.turnsOfTraining = 0;
    this.indianSettlement = null;
    this.destination = null;
    this.tradeRoute = null;
    this.currentStop = -1;
    this.treasureAmount = 0;
    this.attrition = 0;
    this.visibleGoodsCount = -1;
    let uc = this.getUnitChange$String(UnitChangeType.CREATION);
    if (uc != null) {
      this.type = uc.to;
    }
    if (this.type.hasAbility$String(Ability.PERSON)) {
      this.nationality = owner.getNationId();
      this.ethnicity = this.nationality;
    } else {
      this.nationality = null;
      this.ethnicity = null;
    }
    this.hitPoints = this.type.getHitPoints();
    this.changeRole(role, role.getMaximumCount());
    this.setStateUnchecked(this.state);
    this.setLocation(location);
    if (this.getType().canCarryGoods()) {
      this.setGoodsContainer(new GoodsContainer()._GoodsContainer$Game$Location(game, this));
    }
    this.owner.addUnit(this);
    return this;
  }
  /**
   * Completes a tile improvement.
   *
   * +til: Resolves the change of appearance.
   *
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csImproveTile(random: Random, cs: ChangeSet): void {
    let tile = this.getTile$();
    tile.cacheUnseen$();
    let deliver = this.getWorkImprovement().getType().getProduction(tile.getType());
    if (deliver != null) {
      let turn = this.getGame().getTurn();
      let amount = deliver.getAmount();
      amount = $J.d2i(this.apply$float$Turn$String$FreeColSpecObjectType(Math.fround(amount), turn, Modifier.TILE_TYPE_CHANGE_PRODUCTION, deliver.getType()));
      let settlement = tile.getOwningSettlement();
      if (settlement != null && this.owner.owns(settlement)) {
        amount = $J.d2i(settlement.apply$float$Turn$String$FreeColSpecObjectType(Math.fround(amount), turn, Modifier.TILE_TYPE_CHANGE_PRODUCTION, deliver.getType()));
        settlement.addGoods$GoodsType$int(deliver.getType(), amount);
      }
    }
    let ti = this.getWorkImprovement();
    let changeType = ti.getChange(tile.getType());
    if (changeType != null) {
      tile.changeType(changeType);
    }
    let tileImprovementType = ti.getType();
    let exposeResource = tileImprovementType.getExposeResourcePercent();
    if (exposeResource > 0 && !tile.hasResource()) {
      if (RandomUtils.randomInt(ServerUnit.logger, 'Expose resource', random, 100) < exposeResource) {
        let resType = RandomChoice.getWeightedRandom$Logger$String$Collection$Random(ServerUnit.logger, 'Resource type', tile.getType().getResourceTypes(), random);
        let minValue = resType.getMinValue();
        let maxValue = resType.getMaxValue();
        let value = (minValue + ((minValue === maxValue) ? 0 : RandomUtils.randomInt(ServerUnit.logger, 'Resource quantity', random, (maxValue - minValue + 1) | 0))) | 0;
        tile.addResource(new Resource()._Resource$Game$Tile$ResourceType$int(this.getGame(), tile, resType, value));
      }
    }
    if (this.changeRoleCount(-ti.getType().getExpendedAmount())) {
      let owner = this.getOwner();
      let locName = this.getLocation().getLocationLabelFor(owner);
      let messageId = $J.str(this.getType()) + '.noMoreTools';
      if (!Messages.containsKey(messageId)) {
        messageId = 'model.unit.noMoreTools';
      }
      cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.WARNING, messageId, this).addStringTemplate$String$StringTemplate('%unit%', this.getLabel$()).addStringTemplate$String$StringTemplate('%location%', locName));
    }
    for (const $it0 = (CollectionUtils.transform$Stream$Predicate(tile.getUnits(), (u) => (u.getWorkImprovement() != null && u.getWorkImprovement().getType() === ti.getType() && u.getState() === Unit$UnitState.IMPROVING))).iterator(); $it0.hasNext(); ) {
      let unit = $it0.next();
      unit.setWorkLeft(-1);
      unit.setWorkImprovement(null);
      unit.setState(Unit$UnitState.ACTIVE);
      unit.setMovesLeft(0);
    }
  }
  /**
   * Embark a unit.
   *
   * @param carrier The {@code Unit} to embark on.
   * @param cs A {@code ChangeSet} to update.
   */
  csEmbark(carrier: Unit, cs: ChangeSet): void {
    let owner = this.getOwner();
    let oldLocation = this.getLocation();
    let colony = (oldLocation instanceof WorkLocation) ? this.getColony() : null;
    if (colony != null) {
      oldLocation.getTile$().cacheUnseen$();
    }
    this.setLocation(carrier);
    this.setMovesLeft(0);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [(colony != null) ? colony : oldLocation]);
    if (carrier.getLocation() !== oldLocation) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [carrier]);
    }
    if (oldLocation instanceof Tile) {
      let tile = carrier.getTile$();
      if (tile !== oldLocation) {
        cs.addMove(ChangeSet$See.only(owner), this, oldLocation, tile);
        owner.invalidateCanSeeTiles();
      }
      cs.addDisappear(owner, oldLocation, this);
    }
  }
  /**
   * Repair a unit.
   *
   * @param cs A {@code ChangeSet} to update.
   */
  csRepairUnit(cs: ChangeSet): void {
    let owner = this.getOwner();
    this.setHitPoints((this.getHitPoints() + 1) | 0);
    if (!this.isDamaged()) {
      let loc = Location.upLoc(this.getLocation());
      cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.UNIT_REPAIRED, 'model.unit.unitRepaired', this, loc).addStringTemplate$String$StringTemplate('%unit%', this.getLabel$()).addStringTemplate$String$StringTemplate('%repairLocation%', loc.getLocationLabelFor(owner)));
      this.setState(Unit$UnitState.ACTIVE);
    }
    cs.addPartial(ChangeSet$See.only(owner), this, ['hitPoints', String(this.getHitPoints())]);
  }
  /**
   * If a unit moves, check if an opposing naval unit slows it down.
   * Note that the unit moves are reduced here.
   *
   * @param newTile The {@code Tile} the unit is moving to.
   * @param random A pseudo-random number source.
   * @return Either an enemy unit that causes a slowdown, or null if none.
   */
  getSlowedBy(newTile: Tile, random: Random): Unit {
    let player = this.getOwner();
    let game = this.getGame();
    let combatModel = game.getCombatModel();
    let pirate = this.hasAbility$String(Ability.PIRACY);
    let attacker = null;
    let attackPower = 0;
    let totalAttackPower = 0;
    if (!this.isNaval() || this.getMovesLeft() <= 0) {
      return null;
    }
    for (const $it1 = newTile.getSurroundingTiles$int(1).iterator(); $it1.hasNext(); ) {
      let tile = $it1.next();
      let enemy: Player;
      if (tile.isLand() || tile.getColony() != null || tile.getFirstUnit() == null || (enemy = tile.getFirstUnit().getOwner()) === player) {
        continue;
      }
      for (const $it2 = (CollectionUtils.transform$Stream$Predicate(tile.getUnits(), (u) => (u.isNaval() && (pirate || u.hasAbility$String(Ability.PIRACY) || (u.isOffensiveUnit() && player.atWarWith(enemy)))))).iterator(); $it2.hasNext(); ) {
        let enemyUnit = $it2.next();
        let power = combatModel.getOffencePower$FreeColGameObject$FreeColGameObject(enemyUnit, this);
        totalAttackPower += power;
        if (power > attackPower) {
          attacker = enemyUnit;
          attackPower = power;
        }
      }
    }
    if (attacker != null) {
      let defencePower = combatModel.getDefencePower$FreeColGameObject$FreeColGameObject(attacker, this);
      let totalProbability = totalAttackPower + defencePower;
      if ((RandomUtils.randomInt(ServerUnit.logger, 'Slowed', random, ($J.round(totalProbability + 1)) | 0)) < totalAttackPower) {
        let diff = Math.max(0, ($J.round(totalAttackPower - defencePower)) | 0);
        let moves = Math.min(9, (3 + $J.idiv(diff, 3)) | 0);
        this.setMovesLeft((this.getMovesLeft() - moves) | 0);
        ServerUnit.logger.info(this.getId() + ' slowed by ' + attacker.getId() + ' by ' + String(moves) + ' moves.');
      } else {
        attacker = null;
      }
    }
    return attacker;
  }
  /**
   * Explores a lost city, finding a native burial ground.
   *
   * @param cs A {@code ChangeSet} to add changes to.
   */
  csNativeBurialGround(cs: ChangeSet): void {
    let owner = this.getOwner();
    let tile = this.getTile$();
    let indianPlayer = tile.getOwner();
    (owner).csContact(indianPlayer, cs);
    (indianPlayer).csModifyTension$Player$int$ChangeSet(owner, Tension$Level.HATEFUL.getLimit(), cs);
    (owner).csChangeStance(Stance.WAR, indianPlayer, true, cs);
    cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, LostCityRumour$RumourType.BURIAL_GROUND.getDescriptionKey(), owner, this).addStringTemplate$String$StringTemplate('%nation%', indianPlayer.getNationLabel()));
  }
  /**
   * Explore a lost city.
   *
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to add changes to.
   * @return True if the unit survives.
   */
  csExploreLostCityRumour(random: Random, cs: ChangeSet): boolean {
    let owner = this.getOwner();
    let tile = this.getTile$();
    let lostCity = tile.getLostCityRumour();
    if (lostCity == null) {
      return true;
    }
    let game = this.getGame();
    let spec = game.getSpecification();
    let difficulty = spec.getInteger(GameOptions.RUMOUR_DIFFICULTY);
    let dx = (10 - difficulty) | 0;
    let unitType: UnitType;
    let newUnit = null;
    let treasureUnitTypes = spec.getUnitTypesWithAbility([Ability.CARRY_TREASURE]);
    let rumour = lostCity.getType();
    if (rumour == null) {
      rumour = lostCity.chooseType(this, random);
    }
    switch (rumour) {
      case LostCityRumour$RumourType.BURIAL_GROUND:
      case LostCityRumour$RumourType.MOUNDS:
        if (tile.getOwner() == null || !tile.getOwner().isIndian()) {
          rumour = LostCityRumour$RumourType.NOTHING;
        }
        break;
      case LostCityRumour$RumourType.LEARN:
        if (this.getUnitChange$String(UnitChangeType.LOST_CITY) != null) {
          rumour = LostCityRumour$RumourType.NOTHING;
        }
        break;
      default:
        break;
    }
    let mounds = rumour === LostCityRumour$RumourType.MOUNDS;
    if (mounds) {
      let done = false;
      let nothing = false;
      while (!done) {
        rumour = lostCity.chooseType(this, random);
        switch (rumour) {
          case LostCityRumour$RumourType.NOTHING:
            if (nothing) {
              done = true;
            } else {
              nothing = true;
            }
            break;
          case LostCityRumour$RumourType.EXPEDITION_VANISHES:
          case LostCityRumour$RumourType.TRIBAL_CHIEF:
            done = true;
            break;
          case LostCityRumour$RumourType.RUINS:
            done = true;
            if (RandomUtils.randomInt(ServerUnit.logger, 'Ruins+Burial', random, 100) >= spec.getPercentage(GameOptions.BAD_RUMOUR)) {
              break;
            }
          case LostCityRumour$RumourType.BURIAL_GROUND:
            done = tile.getOwner() != null && tile.getOwner().isIndian();
            break;
          default:
        }
      }
    }
    ServerUnit.logger.info('Unit ' + this.getId() + ' is exploring rumour ' + $J.str(rumour));
    let result = true;
    let key = rumour.getDescriptionKey();
    {
      let oldName: StringTemplate, uc: UnitTypeChange, chiefAmount: number, foundTypes: List<UnitType>, cityName: string, ruinsAmount: number, europe: ServerEurope;
      switch (rumour) {
        case LostCityRumour$RumourType.BURIAL_GROUND:
          this.csNativeBurialGround(cs);
          break;
        case LostCityRumour$RumourType.EXPEDITION_VANISHES:
          cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, key, owner));
          result = false;
          break;
        case LostCityRumour$RumourType.NOTHING:
          cs.addMessage(owner, lostCity.getNothingMessage(owner, mounds, random));
          break;
        case LostCityRumour$RumourType.LEARN:
          oldName = this.getLabel$();
          uc = RandomUtils.getRandomMember$Logger$String$List$Random(ServerUnit.logger, 'Choose learn', spec.getUnitChanges(UnitChangeType.LOST_CITY, this.getType()), random);
          this.changeType(uc.to);
          owner.invalidateCanSeeTiles();
          cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, key, owner, this).addStringTemplate$String$StringTemplate('%unit%', oldName).addNamed$String$Named('%type%', this.getType()));
          break;
        case LostCityRumour$RumourType.TRIBAL_CHIEF:
          chiefAmount = (RandomUtils.randomInt(ServerUnit.logger, 'Chief base amount', random, Math.imul(dx, 10)) + Math.imul(dx, 5)) | 0;
          owner.modifyGold(chiefAmount);
          cs.addPartial(ChangeSet$See.only(owner), owner, ['gold', String(owner.getGold()), 'score', String(owner.getScore())]);
          if (mounds) {
            key = rumour.getAlternateDescriptionKey('mounds');
          }
          cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, key, owner, this).addAmount('%money%', chiefAmount));
          owner.invalidateCanSeeTiles();
          break;
        case LostCityRumour$RumourType.COLONIST:
          foundTypes = spec.getUnitTypesWithAbility([Ability.FOUND_IN_LOST_CITY]);
          unitType = RandomUtils.getRandomMember$Logger$String$List$Random(ServerUnit.logger, 'Choose found', foundTypes, random);
          newUnit = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, tile, owner, unitType);
          cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, key, owner, newUnit));
          break;
        case LostCityRumour$RumourType.CIBOLA:
          cityName = NameCache.getNextCityOfCibola();
          if (cityName != null) {
            let treasureAmount = (RandomUtils.randomInt(ServerUnit.logger, 'Base treasure amount', random, Math.imul(dx, 600)) + Math.imul(dx, 300)) | 0;
            unitType = RandomUtils.getRandomMember$Logger$String$List$Random(ServerUnit.logger, 'Choose train', treasureUnitTypes, random);
            newUnit = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, tile, owner, unitType);
            newUnit.setTreasureAmount(treasureAmount);
            cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, key, owner, newUnit).addName$String$String('%city%', cityName).addAmount('%money%', treasureAmount));
            cs.addGlobalHistory(game, new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(game.getTurn(), HistoryEvent$HistoryEventType.CITY_OF_GOLD, owner).addStringTemplate$String$StringTemplate('%nation%', owner.getNationLabel()).addName$String$String('%city%', cityName).addAmount('%treasure%', treasureAmount));
            break;
          }
        case LostCityRumour$RumourType.RUINS:
          ruinsAmount = (Math.imul(RandomUtils.randomInt(ServerUnit.logger, 'Base ruins amount', random, Math.imul(dx, 2)), 300) + 50) | 0;
          if (ruinsAmount < 500) {
            owner.modifyGold(ruinsAmount);
            cs.addPartial(ChangeSet$See.only(owner), owner, ['gold', String(owner.getGold()), 'score', String(owner.getScore())]);
          } else {
            unitType = RandomUtils.getRandomMember$Logger$String$List$Random(ServerUnit.logger, 'Choose train', treasureUnitTypes, random);
            newUnit = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, tile, owner, unitType);
            newUnit.setTreasureAmount(ruinsAmount);
          }
          if (mounds) {
            key = rumour.getAlternateDescriptionKey('mounds');
          }
          cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, key, owner, ((newUnit != null) ? newUnit : this)).addAmount('%money%', ruinsAmount));
          break;
        case LostCityRumour$RumourType.FOUNTAIN_OF_YOUTH:
          europe = owner.getEurope();
          if (europe == null) {
            cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, rumour.getAlternateDescriptionKey('noEurope'), owner, this));
          } else {
            if (owner.isAI()) {
              europe.generateFountainRecruits(dx, random);
              cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [europe]);
            } else {
              (owner).setRemainingEmigrants(dx);
              cs.add$See$Message(ChangeSet$See.only(owner), new FountainOfYouthMessage()._FountainOfYouthMessage$int(dx));
            }
            cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.LOST_CITY_RUMOUR, key, owner, this));
            cs.addAttribute(ChangeSet$See.only(owner), 'sound', 'sound.event.fountainOfYouth');
          }
          break;
        case LostCityRumour$RumourType.NO_SUCH_RUMOUR:
        case LostCityRumour$RumourType.MOUNDS:
        default:
          ServerUnit.logger.warning('Bogus rumour type: ' + $J.str(rumour));
          break;
      }
    }
    tile.cacheUnseen$();
    tile.removeLostCityRumour();
    return result;
  }
  /**
   * Check for new contacts at a tile.
   *
   * @param newTile The {@code Tile} to check.
   * @param firstLanding True if this is the special "first landing"
   * @param cs A {@code ChangeSet} to update.
   */
  csNewContactCheck(newTile: Tile, firstLanding: boolean, cs: ChangeSet): void {
    let owner = this.getOwner();
    let pending = new HashSet();
    for (const $it3 = (CollectionUtils.transform$Collection$Predicate(newTile.getSurroundingTiles$int$int(1, 1), (nt) => nt != null && nt.isLand())).iterator(); $it3.hasNext(); ) {
      let t = $it3.next();
      let settlement = t.getSettlement();
      let unit = null;
      let other = (settlement != null) ? settlement.getOwner() : ((unit = t.getFirstUnit()) != null) ? unit.getOwner() : null;
      if (other == null || other === owner || pending.contains(other)) {
        continue;
      }
      if ((owner).csContact(other, cs)) {
        pending.add(other);
        if (owner.isEuropean()) {
          if (other.isIndian()) {
            let offer = (firstLanding && other.owns(newTile)) ? newTile : null;
            (owner).csNativeFirstContact(other, offer, cs);
          } else {
            (owner).csEuropeanFirstContact(this, settlement, unit, cs);
          }
        } else {
          if (other.isIndian()) {
          } else {
            other.csNativeFirstContact(owner, null, cs);
          }
        }
      }
      let contactPlayer = owner;
      let is$ = (settlement instanceof IndianSettlement) ? settlement : null;
      if (is$ != null || (unit != null && (is$ = unit.getHomeIndianSettlement()) != null) || (unit != null && (contactPlayer = unit.getOwner()).isEuropean() && (is$ = this.getHomeIndianSettlement()) != null && is$.getTile$() != null)) {
        let copied = is$.getTile$().getTileToCache();
        if (contactPlayer.hasExplored(is$.getTile$()) && is$.setContacted(contactPlayer)) {
          is$.getTile$().cacheUnseen$Tile(copied);
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(contactPlayer), [is$]);
          let nation = is$.getOwner().getNationLabel();
          cs.addMessage(contactPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'model.unit.nativeSettlementContact', this, is$).addStringTemplate$String$StringTemplate('%nation%', nation).addName$String$String('%settlement%', is$.getName()));
          ServerUnit.logger.finest('First contact between ' + contactPlayer.getId() + ' and ' + $J.str(is$) + ' at ' + $J.str(newTile));
        }
      }
      this.csActivateSentries(t, cs);
    }
  }
  /**
   * Activate sentried units on a tile.
   *
   * @param tile The {@code Tile} to activate sentries on.
   * @param cs A {@code ChangeSet} to update.
   */
  csActivateSentries(tile: Tile, cs: ChangeSet): void {
    for (const $it4 = (CollectionUtils.transform$Stream$Predicate(tile.getUnits(), CollectionUtils.matchKey$Object$Function(Unit$UnitState.SENTRY, ($p0) => $p0.getState()))).iterator(); $it4.hasNext(); ) {
      let u = $it4.next();
      u.setState(Unit$UnitState.ACTIVE);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [u]);
    }
  }
  /**
   * Move a unit.
   *
   * @param newTile The {@code Tile} to move to.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csMove(newTile: Tile, random: Random, cs: ChangeSet): void {
    let owner = this.getOwner();
    let oldLocation = this.getLocation();
    if (oldLocation == null) {
      ServerUnit.logger.warning('Unit with null location: ' + this.toString());
      return;
    }
    let oldTiles = this.getVisibleTileSet();
    let newTiles = (owner).collectNewTiles$Tile$int(newTile, this.getLineOfSight());
    this.setState(Unit$UnitState.ACTIVE);
    this.setStateToAllChildren(Unit$UnitState.SENTRY);
    if (oldLocation instanceof HighSeas) {
    } else if (oldLocation instanceof Unit) {
      this.setMovesLeft(0);
    } else {
      if (this.getMoveCost$Tile(newTile) <= 0) {
        ServerUnit.logger.warning('Move of unit: ' + this.getId() + ' from: ' + oldLocation.getTile$().getId() + ' to: ' + newTile.getId() + ' has bogus cost: ' + this.getMoveCost$Tile(newTile));
        this.setMovesLeft(0);
      }
      this.setMovesLeft((this.getMovesLeft() - this.getMoveCost$Tile(newTile)) | 0);
    }
    if (oldLocation instanceof WorkLocation) {
      oldLocation.getTile$().cacheUnseen$();
    }
    this.setLocation(newTile);
    if (newTile.hasLostCityRumour() && owner.isEuropean() && !this.csExploreLostCityRumour(random, cs)) {
      this.csRemove(ChangeSet$See.perhaps().always(owner), oldLocation, cs);
    }
    owner.invalidateCanSeeTiles();
    CollectionUtils.removeInPlace$Collection$Predicate(oldTiles, (t) => owner.canSee(t));
    if (!oldTiles.isEmpty()) {
      cs.add$See$Collection(ChangeSet$See.only(owner), oldTiles);
    }
    if (oldLocation.getTile$() != null) {
      cs.addMove(ChangeSet$See.perhaps().always(owner), this, oldLocation, newTile);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(owner), [oldLocation]);
    } else {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [oldLocation]);
    }
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(owner), [newTile]);
    if (this.isDisposed()) {
      return;
    }
    (owner).csSeeNewTiles(newTiles, cs);
    if (newTile.isLand()) {
      let settlement: Settlement;
      let unit = null;
      let d: number;
      if ((newTile.getOwner() == null || (newTile.getOwner().isEuropean() && newTile.getOwningSettlement() == null)) && owner.isIndian() && (settlement = this.getHomeIndianSettlement()) != null && ((d = newTile.getDistanceTo(settlement.getTile$())) < ((settlement.getRadius() + settlement.getType().getExtraClaimableRadius()) | 0)) && (RandomUtils.randomInt(ServerUnit.logger, 'Claim tribal land', random, (d + 1) | 0)) === 0) {
        newTile.cacheUnseen$();
        newTile.changeOwnership(owner, settlement);
      }
      let newLand = null;
      let firstLanding = !owner.isNewLandNamed();
      if (firstLanding && owner.isEuropean()) {
        newLand = owner.getNameForNewLand();
        owner.setNewLandName(newLand);
        cs.add$See$Message(ChangeSet$See.only(owner), new NewLandNameMessage()._NewLandNameMessage$Unit$String(this, newLand));
        ServerUnit.logger.finest('First landing for ' + $J.str(owner) + ' at ' + $J.str(newTile) + ' with ' + $J.str(this));
      }
      this.csNewContactCheck(newTile, firstLanding, cs);
    } else {
      for (const $it5 = (CollectionUtils.transform$Collection$Predicate(newTile.getSurroundingTiles$int$int(1, 1), (nt) => (nt != null && !nt.isLand() && nt.getFirstUnit() != null && nt.getFirstUnit().getOwner() !== owner))).iterator(); $it5.hasNext(); ) {
        let t = $it5.next();
        this.csActivateSentries(t, cs);
      }
    }
    if (this.isCarrier() && !this.isEmpty() && newTile.getColony() != null && this.getSpecification().getBoolean(GameOptions.DISEMBARK_IN_COLONY)) {
      for (const $it6 = this.getUnitList().iterator(); $it6.hasNext(); ) {
        let u = $it6.next();
        (u).csMove(newTile, random, cs);
      }
      this.setMovesLeft(0);
    }
    let slowedBy = this.getSlowedBy(newTile, random);
    if (slowedBy != null) {
      let enemy = slowedBy.getApparentOwnerName();
      cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'model.unit.slowed', this, slowedBy).addStringTemplate$String$StringTemplate('%unit%', this.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addStringTemplate$String$StringTemplate('%enemyUnit%', slowedBy.getLabel$UnitLabelType(Unit$UnitLabelType.PLAIN)).addStringTemplate$String$StringTemplate('%enemyNation%', enemy));
    }
    this.csCheckDiscoverRegion(newTile, cs);
  }
  /**
   * Check for a new region.
   *
   * @param tile The {@code Tile} to check at.
   * @param cs A {@code ChangeSet} to update.
   */
  csCheckDiscoverRegion(tile: Tile, cs: ChangeSet): void {
    let region = tile.getDiscoverableRegion();
    let owner = this.getOwner();
    if (region != null && owner.isEuropean() && region.checkDiscover(this)) {
      cs.add$See$Message(ChangeSet$See.only(owner), new NewRegionNameMessage()._NewRegionNameMessage$Region$Tile$Unit$String(region, tile, this, owner.getNameForRegion(region)));
    }
  }
  /**
   * Visits a native settlement, possibly scouting it fully if
   * as a result of a scout actually asking to speak to the chief,
   * or for other settlement-contacting events such as missionary
   * actions, demanding tribute, learning skills and trading if the
   * settlementActionsContactChief game option is enabled.  It is
   * still unclear what Col1 did here.
   *
   * @param serverPlayer The {@code ServerPlayer} that is contacting
   *     the settlement.
   * @param is The {@code IndianSettlement} to contact.
   * @param scout Positive if this contact is due to a scout asking to
   *     speak to the chief, zero if it is another unit, negative if
   *     this is from the greeting dialog generation.
   * @param cs A {@code ChangeSet} to update.
   */
  csVisit(serverPlayer: ServerPlayer, is$: IndianSettlement, scout: number, cs: ChangeSet): void {
    let owner = is$.getOwner();
    if (serverPlayer.csContact(owner, cs)) {
      serverPlayer.csNativeFirstContact(owner, null, cs);
    }
    is$.setVisited(serverPlayer);
    if (scout > 0 || (scout === 0 && this.getGame().getSpecification().getBoolean(GameOptions.SETTLEMENT_ACTIONS_CONTACT_CHIEF))) {
      is$.setScouted(serverPlayer);
    }
    let tile = is$.getTile$();
    tile.seeTile$Player(serverPlayer);
    this.csCheckDiscoverRegion(tile, cs);
  }
  /**
   * Remove this unit from the game.
   *
   * @param see The visibility of the change.
   * @param loc The {@code Location} of the change.
   * @param cs A {@code ChangeSet} to update.
   */
  csRemove(see: ChangeSet$See, loc: Location, cs: ChangeSet): void {
    let is$ = this.changeHomeIndianSettlement(null);
    if (is$ != null) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this.getOwner()), [is$]);
    }
    cs.addRemove(see, loc, this);
    this.dispose();
  }
  /**
   * New turn for this unit.
   *
   * @param random A {@code Random} number source.
   * @param lb A {@code LogBuilder} to log to.
   * @param cs A {@code ChangeSet} to update.
   */
  csNewTurn(random: Random, lb: LogBuilder, cs: ChangeSet): void {
    let spec = this.getSpecification();
    let owner = this.getOwner();
    let loc = this.getLocation();
    let locDirty = false;
    let unitDirty = false;
    lb.add([this]);
    if (this.getType().hasMaximumAttrition() && loc instanceof Tile && !(loc).hasSettlement()) {
      let attrition = (this.getAttrition() + 1) | 0;
      this.setAttrition(attrition);
      if (attrition > this.getType().getMaximumAttrition()) {
        cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.UNIT_LOST, 'model.unit.attrition', this).addStringTemplate$String$StringTemplate('%unit%', this.getLabel$()).addStringTemplate$String$StringTemplate('%location%', loc.getLocationLabelFor(owner)));
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [loc]);
        this.csRemove(ChangeSet$See.perhaps().always(owner), loc, cs);
        owner.invalidateCanSeeTiles();
        lb.add([', ']);
        return;
      }
    } else {
      this.setAttrition(0);
    }
    let produce: GoodsType;
    let learn: UnitType;
    let uc: UnitTypeChange;
    if (this.isInColony() && (produce = this.getWorkType()) != null && (learn = spec.getExpertForProducing(produce)) != null && learn !== this.getType() && (uc = this.getUnitChange$String$UnitType(UnitChangeType.EXPERIENCE, learn)) != null && uc.probability > 0) {
      let maximumExperience = this.getType().getMaximumExperience();
      let maxValue = $J.idiv((Math.imul(100, maximumExperience)), uc.probability);
      if (maxValue > 0 && RandomUtils.randomInt(ServerUnit.logger, 'Experience', random, maxValue) < Math.min(this.getExperience(), maximumExperience)) {
        let oldName = this.getLabel$();
        this.changeType(learn);
        cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.UNIT_IMPROVED, 'model.unit.experience', this.getColony(), this).addStringTemplate$String$StringTemplate('%oldName%', oldName).addStringTemplate$String$StringTemplate('%unit%', this.getLabel$()).addName$String$String('%colony%', this.getColony().getName()));
        lb.add([' experience upgrade to ', this.getType()]);
        unitDirty = true;
      }
    }
    if (this.isInMission()) {
      this.getTile$().updateIndianSettlement(owner);
      this.setMovesLeft(0);
    } else if (this.isDamagedAndUnderForcedRepair()) {
      this.setMovesLeft(0);
    } else {
      this.setMovesLeft(this.getInitialMovesLeft());
    }
    if (this.getWorkLeft() > 0) {
      unitDirty = true;
      {
        let ti: TileImprovement;
        switch (this.getState()) {
          case Unit$UnitState.IMPROVING:
            ti = this.getWorkImprovement();
            if (ti == null || ti.isComplete()) {
              this.setState(Unit$UnitState.ACTIVE);
              this.setWorkLeft(-1);
            } else {
              let amount = (this.getType().hasAbility$String(Ability.EXPERT_PIONEER)) ? 2 : 1;
              let turns = ti.getTurnsToComplete();
              if ((turns = (turns - amount) | 0) < 0) {
                turns = 0;
              }
              ti.setTurnsToComplete(turns);
              this.setWorkLeft(turns);
              if (ti.isRoad() && ti.isComplete()) {
                ti.updateRoadConnections(true);
                for (const $it7 = (CollectionUtils.transform$Collection$Predicate(loc.getTile$().getSurroundingTiles$int$int(1, 1), ($p0) => $p0.hasRoad())).iterator(); $it7.hasNext(); ) {
                  let t = $it7.next();
                  cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [t]);
                }
                locDirty = true;
              }
            }
            break;
          default:
            this.setWorkLeft((this.getWorkLeft() - 1) | 0);
            break;
        }
      }
      if (loc instanceof HighSeas && this.getOwner().isREF()) {
        this.setWorkLeft(0);
      }
    }
    if (this.getState() === Unit$UnitState.SKIPPED) {
      this.setState(Unit$UnitState.ACTIVE);
      unitDirty = true;
    }
    if (this.getWorkLeft() <= 0) {
      if (this.getLocation() instanceof HighSeas) {
        let europe = owner.getEurope();
        let dst = this.getDestination();
        let result = this.resolveDestination();
        if (result === europe) {
          lb.add([' arrives in Europe']);
          if (this.getTradeRoute() == null) {
            this.setDestination(null);
            cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.UNIT_ARRIVED, 'model.unit.arriveInEurope', europe, this).addNamed$String$Named('%europe%', europe));
          }
          this.setState(Unit$UnitState.ACTIVE);
          this.setLocation(europe);
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [owner.getHighSeas()]);
          locDirty = true;
        } else {
          if (!(result instanceof Tile)) {
            ServerUnit.logger.warning('Unit has unsupported destination: ' + $J.str(dst) + ' -> ' + $J.str(result));
            result = this.getFullEntryLocation();
          }
          let tile = result.getTile$().getSafeTile(owner, random);
          lb.add([' arrives in America at ', tile]);
          if (dst != null) {
            lb.add([' sailing for ', dst]);
            if (dst instanceof Map_) {
              this.setDestination(null);
            }
          }
          this.csMove(tile, random, cs);
          locDirty = unitDirty = false;
        }
      } else {
        switch (this.getState()) {
          case Unit$UnitState.ACTIVE:
          case Unit$UnitState.FORTIFIED:
          case Unit$UnitState.SENTRY:
          case Unit$UnitState.IN_COLONY:
            break;
          case Unit$UnitState.IMPROVING:
            this.csImproveTile(random, cs);
            this.setWorkImprovement(null);
            locDirty = true;
            break;
          case Unit$UnitState.FORTIFYING:
            this.setState(Unit$UnitState.FORTIFIED);
            unitDirty = true;
            break;
          case Unit$UnitState.SKIPPED:
          default:
            lb.add([' work completed, bad state: ', this.getState()]);
            this.setState(Unit$UnitState.ACTIVE);
            unitDirty = true;
            break;
        }
      }
    }
    if (locDirty) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [this.getLocation()]);
    } else if (unitDirty) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [this]);
    } else {
      cs.addPartial(ChangeSet$See.only(owner), this, ['movesLeft', String(this.getMovesLeft())]);
    }
    lb.add([', ']);
  }
  static $clinit() {
    ServerUnit.logger = Logger.getLogger($J.cls(ServerUnit).getName());
  }
}

$J.define(ServerUnit, 'net.sf.freecol.server.model.ServerUnit', { kind: 'class', ifaces: ['net.sf.freecol.server.model.TurnTaker'], sup: 'net.sf.freecol.common.model.Unit', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Role': '_ServerUnit$Game$Location$Player$UnitType$Role', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Unit': '_ServerUnit$Game$Location$Unit', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.UnitType': '_ServerUnit$Game$Location$Player$UnitType', 'net.sf.freecol.common.model.Game,java.lang.String': '_ServerUnit$Game$String' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  NameCache = $J.load('net.sf.freecol.common.i18n.NameCache');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  HighSeas = $J.load('net.sf.freecol.common.model.HighSeas');
  HistoryEvent = $J.load('net.sf.freecol.common.model.HistoryEvent');
  HistoryEvent$HistoryEventType = $J.load('net.sf.freecol.common.model.HistoryEvent$HistoryEventType');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Location = $J.load('net.sf.freecol.common.model.Location');
  LostCityRumour$RumourType = $J.load('net.sf.freecol.common.model.LostCityRumour$RumourType');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Resource = $J.load('net.sf.freecol.common.model.Resource');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  WorkLocation = $J.load('net.sf.freecol.common.model.WorkLocation');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  FountainOfYouthMessage = $J.load('net.sf.freecol.common.networking.FountainOfYouthMessage');
  NewLandNameMessage = $J.load('net.sf.freecol.common.networking.NewLandNameMessage');
  NewRegionNameMessage = $J.load('net.sf.freecol.common.networking.NewRegionNameMessage');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
});
