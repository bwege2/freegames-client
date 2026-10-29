// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/generator/SimpleMapGenerator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2024   The FreeCol Team
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
import { $J, ArrayList, Collections, Collectors, HashMap, HashSet, JFunction, JObject, LinkedHashSet, Logger } from '../../../../../../jre/index.ts';

let Ability, Direction, LandMap, LostCityRumour, LostCityRumour$RumourType, GameOptions, MapGeneratorOptions, CollectionUtils, RandomChoice, RandomUtils, RandomUtils$RandomIntCache, EuropeanStartingPositionsGenerator, TerrainGenerator, ServerIndianSettlement, ServerPlayer, ServerUnit;

/**
 * Creates random maps and sets the starting locations for the players.
 *
 * No visibility implications here as this all happens pre-game,
 * so no +/-vis annotations are needed.
 */
export class SimpleMapGenerator extends JObject {
  static logger: Logger = null;
  /**
   * To avoid starting positions too close to the poles, this
   * percentage indicating how much of the half map close to the
   * pole cannot be spawned on.
   */
  static readonly MIN_DISTANCE_FROM_POLE: number = Math.fround(0.3);
  /**
   * The random number source.
   */
  random: Random = null;
  /**
   * A cached random integer source.
   */
  cache: RandomUtils$RandomIntCache = null;
  /**
   * Creates a {@code MapGenerator}
   *
   * @param random The {@code Random} number source to use.
   * @see #generateMap
   */
  _SimpleMapGenerator(random: Random): this {
    this.random = random;
    this.cache = new RandomUtils$RandomIntCache()._RandomUtils$RandomIntCache(SimpleMapGenerator.logger, 'simpleMap', random, 1 << 16, 512);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  generateEmptyMap(game: Game, width: number, height: number, lb: LogBuilder): Map_ {
    let landMap = new LandMap()._LandMap$int$int$RandomIntCache(width, height, this.cache);
    return new TerrainGenerator()._TerrainGenerator(this.random).generateMap(game, null, landMap, lb);
  }
  /**
   * {@inheritDoc}
   */
  generateMap(game: Game, importMap: Map_, generateEuropeanPlayerUnits: boolean, lb: LogBuilder): Map_ {
    let landMap = (importMap != null) ? new LandMap()._LandMap$Map$RandomIntCache(importMap, this.cache) : new LandMap()._LandMap$OptionGroup$RandomIntCache(game.getMapGeneratorOptions(), this.cache);
    let map = new TerrainGenerator()._TerrainGenerator(this.random).generateMap(game, importMap, landMap, lb);
    this.makeNativeSettlements(map, importMap, lb);
    this.makeLostCityRumours(map, importMap, lb);
    if (generateEuropeanPlayerUnits) {
      this.createEuropeanUnits(map, game.getLiveEuropeanPlayerList([]));
    }
    lb.shrink('\n');
    return map;
  }
  /**
   * Gets the approximate number of land tiles.
   *
   * @param game The {@code Game} to look up options in.
   * @return The approximate number of land tiles
   */
  getApproximateLandCount(game: Game): number {
    let mapOptions = game.getMapGeneratorOptions();
    return $J.idiv(Math.imul(Math.imul(mapOptions.getInteger(MapGeneratorOptions.MAP_WIDTH), mapOptions.getInteger(MapGeneratorOptions.MAP_HEIGHT)), mapOptions.getInteger(MapGeneratorOptions.LAND_MASS)), 100);
  }
  /**
   * Make lost city rumours on the given map.
   *
   * The number of rumours depends on the map size.
   *
   * @param map The {@code Map} to use.
   * @param importMap An optional {@code Map} to import from.
   * @param lb A {@code LogBuilder} to log to.
   */
  makeLostCityRumours(map: Map_, importMap: Map_, lb: LogBuilder): void {
    let game = map.getGame();
    let importRumours = game.getMapGeneratorOptions().getBoolean(MapGeneratorOptions.IMPORT_RUMOURS);
    if (importMap != null && importRumours) {
      return;
    }
    let rumourNumber = game.getMapGeneratorOptions().getRange(MapGeneratorOptions.RUMOUR_NUMBER);
    let number$ = $J.idiv(this.getApproximateLandCount(game), rumourNumber);
    let counter = 0;
    if (importMap != null) {
      number$ = $J.idiv(Math.imul(Math.imul(map.getWidth(), map.getHeight()), 25), (Math.imul(100, 35)));
    }
    for (let i = 0; i < number$; i++) {
      for (let tries = 0; tries < 100; tries++) {
        let t = map.getRandomLandTile(this.random);
        if (t.isPolar()) {
          continue;
        }
        if (t.isLand() && !t.hasLostCityRumour() && !t.hasSettlement() && t.getUnitCount() === 0) {
          let r = new LostCityRumour()._LostCityRumour$Game$Tile(t.getGame(), t);
          if (r.chooseType(null, this.random) === LostCityRumour$RumourType.MOUNDS && t.getOwningSettlement() != null) {
            r.setType(LostCityRumour$RumourType.MOUNDS);
          }
          t.addLostCityRumour(r);
          counter++;
          break;
        }
      }
    }
    lb.add(['Created ', counter, ' lost city rumours of maximum ', number$, '.\n']);
  }
  /**
   * Import the native settlements from a game.
   *
   * @param map The {@code Map} to import settlements to.
   * @param importMap The {@code Map} to import from.
   * @param lb The {@code LogBuilder} to log to.
   * @return True if the settlements were imported.
   */
  importIndianSettlements(map: Map_, importMap: Map_, lb: LogBuilder): boolean {
    let game = map.getGame();
    let spec = game.getSpecification();
    for (const $it0 = importMap.getGame().getLiveNativePlayerList([]).iterator(); $it0.hasNext(); ) {
      let iPlayer = $it0.next();
      let indian = game.getPlayerByNationId(iPlayer.getNationId());
      if (indian == null) {
        let nation = spec.getNation(iPlayer.getNationId());
        if (nation == null) {
          lb.add(['Native nation ', iPlayer.getNationId(), ' not found in spec.\n']);
        } else {
          indian = new ServerPlayer()._ServerPlayer$Game$boolean$Nation(game, false, nation);
          lb.add(['Imported new native nation ', iPlayer.getNationId(), ': ', indian.getId(), '\n']);
          game.addPlayer(indian);
        }
      } else {
        lb.add(['Found native nation ', iPlayer.getNationId(), ' for import: ', indian.getId(), '\n']);
      }
    }
    let iTiles = importMap.getTileList(CollectionUtils.isNotNull$Function(($p0) => $p0.getIndianSettlement()));
    let newSettlements = new HashSet(iTiles.size());
    for (const $it1 = iTiles.iterator(); $it1.hasNext(); ) {
      let iTile = $it1.next();
      let is$ = iTile.getIndianSettlement();
      if (is$.getOwner() == null) {
        continue;
      }
      let owner = game.getPlayerByNationId(is$.getOwner().getNationId());
      if (owner == null) {
        continue;
      }
      let iSkill = is$.getLearnableSkill();
      let sis = new ServerIndianSettlement()._ServerIndianSettlement$Game$Player$String$Tile$boolean$UnitType$Unit(game, owner, is$.getName(), map.getTile$int$int(iTile.getX(), iTile.getY()), is$.isCapital(), ((iSkill == null) ? null : spec.getUnitType(iSkill.getId())), null);
      sis.placeSettlement(false);
      for (const $it2 = is$.getOwnedTiles().iterator(); $it2.hasNext(); ) {
        let it = $it2.next();
        map.getTile$int$int(it.getX(), it.getY()).changeOwnership(owner, sis);
      }
      let iUnits = is$.getUnitList();
      if (iUnits.isEmpty()) {
        sis.addUnits$Random(this.random);
      } else {
        for (const $it3 = iUnits.iterator(); $it3.hasNext(); ) {
          let iu = $it3.next();
          let it = spec.getUnitType(iu.getType().getId());
          if (it != null) {
            let su = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, sis, owner, it);
            sis.add(su);
            sis.addOwnedUnit(su);
          }
        }
      }
      let iGoods = is$.getCompactGoodsList();
      if (iGoods.isEmpty()) {
        sis.addRandomGoods(this.random);
      } else {
        for (const $it4 = iGoods.iterator(); $it4.hasNext(); ) {
          let ig = $it4.next();
          let it = spec.getGoodsType(ig.getType().getId());
          if (it != null) {
            sis.addGoods$GoodsType$int(it, ig.getAmount());
          }
        }
      }
      sis.setWantedGoods$List(CollectionUtils.transform$Collection$Predicate$Function$Collector(is$.getWantedGoods$(), CollectionUtils.alwaysTrue(), (ig) => (ig == null) ? null : spec.getGoodsType(ig.getId()), CollectionUtils.toListNoNulls()));
      owner.addSettlement(sis);
      newSettlements.add(sis);
    }
    lb.add(['Imported ', newSettlements.size(), ' native settlements.\n']);
    return !newSettlements.isEmpty();
  }
  /**
   * Make the native settlements, at least a capital for every
   * nation and random numbers of other settlements.
   *
   * @param map The {@code Map} to place the indian settlements on.
   * @param importMap An optional {@code Map} to import from.
   * @param lb A {@code LogBuilder} to log to.
   */
  makeNativeSettlements(map: Map_, importMap: Map_, lb: LogBuilder): void {
    let game = map.getGame();
    let spec = game.getSpecification();
    let importSettlements = game.getMapGeneratorOptions().getBoolean(MapGeneratorOptions.IMPORT_SETTLEMENTS);
    if (importSettlements && importMap != null && this.importIndianSettlements(map, importMap, lb)) {
      return;
    }
    let settlements = new ArrayList();
    let nativePlayers = game.getLiveNativePlayerList([]);
    if (nativePlayers.isEmpty()) {
      return;
    }
    let allTiles = map.getShuffledTiles(this.random);
    let minDistance = spec.getRange(GameOptions.SETTLEMENT_NUMBER);
    let settlementTiles = new LinkedHashSet();
    for (const $it5 = allTiles.iterator(); $it5.hasNext(); ) {
      let tile = $it5.next();
      if (tile.isPolar()) {
        continue;
      }
      if (!this.suitableForNativeSettlement(tile)) {
        continue;
      }
      if (CollectionUtils.any$Collection$Predicate(settlementTiles, (t) => t.getDistanceTo(tile) < minDistance)) {
        continue;
      }
      settlementTiles.add(tile);
    }
    let designatedArea = new HashMap();
    for (const $it6 = nativePlayers.iterator(); $it6.hasNext(); ) {
      let player = $it6.next();
      let area = map.getGame().getNationStartingArea(player.getNation());
      if (area != null && !area.isEmpty()) {
        let settlementTilesForNation = area.getTiles().stream().filter((t) => settlementTiles.contains(t)).collect(Collectors.toCollection(() => new LinkedHashSet()));
        if (settlementTilesForNation.isEmpty()) {
          SimpleMapGenerator.logger.warning('No settlements for nationType=' + player.getNationId());
        }
        designatedArea.put(player, settlementTilesForNation);
      }
    }
    for (const $it7 = nativePlayers.iterator(); $it7.hasNext(); ) {
      let player = $it7.next();
      if (designatedArea.containsKey(player)) {
        continue;
      }
      let indianNationType = player.getNationType();
      let otherRegions = indianNationType.getRegions().stream().map((key) => (map.getRegionByKey(key)).getBounds()).filter((bounds) => !bounds.isEmpty()).collect(Collectors.toList());
      if (otherRegions.isEmpty()) {
        SimpleMapGenerator.logger.warning('No area or regions found for nationType=' + player.getNationId());
        continue;
      }
      let settlementTilesForNation = settlementTiles.stream().filter((t) => otherRegions.stream().anyMatch((bounds) => bounds.contains$int$int(t.getX(), t.getY()))).collect(Collectors.toCollection(() => new LinkedHashSet()));
      if (settlementTilesForNation.isEmpty()) {
        SimpleMapGenerator.logger.warning('No settlements in region for nationType=' + player.getNationId());
      }
      designatedArea.put(player, settlementTilesForNation);
    }
    for (const $it8 = nativePlayers.iterator(); $it8.hasNext(); ) {
      let player = $it8.next();
      let allowedPlacements = designatedArea.get(player);
      if (allowedPlacements == null) {
        continue;
      }
      for (const $it9 = new ArrayList(settlementTiles).iterator(); $it9.hasNext(); ) {
        let settlementTile = $it9.next();
        if (!allowedPlacements.contains(settlementTile)) {
          continue;
        }
        let capital = this.placeIndianSettlement(player, true, settlementTile, map, lb);
        settlements.add(capital);
        settlementTiles.remove(settlementTile);
        break;
      }
    }
    for (const $it10 = settlementTiles.iterator(); $it10.hasNext(); ) {
      let settlementTile = $it10.next();
      let players = new ArrayList(designatedArea.keySet());
      Collections.shuffle(players, this.random);
      let owner = players.stream().filter((p) => {
        let tiles = designatedArea.get(p);
        if (tiles == null) {
          return false;
        }
        return tiles.contains(settlementTile);
      }).findFirst().orElse(null);
      if (owner == null) {
        continue;
      }
      let settlement = this.placeIndianSettlement(owner, false, settlementTile, map, lb);
      settlements.add(settlement);
    }
    let skills = new HashMap();
    RandomUtils.randomShuffle(SimpleMapGenerator.logger, 'Settlements', settlements, this.random);
    for (const $it11 = settlements.iterator(); $it11.hasNext(); ) {
      let is$ = $it11.next();
      let tiles = CollectionUtils.transform$Collection$Predicate(is$.getOwnedTiles(), (t) => CollectionUtils.any$Collection$Predicate(t.getSurroundingTiles$int$int(1, 1), CollectionUtils.isNull$Function(($p0) => $p0.getOwningSettlement())));
      RandomUtils.randomShuffle(SimpleMapGenerator.logger, 'Settlement tiles', tiles, this.random);
      let minGrow = is$.getType().getMinimumGrowth();
      let maxGrow = is$.getType().getMaximumGrowth();
      if (maxGrow > minGrow) {
        for (let i = ((RandomUtils.randomInt(SimpleMapGenerator.logger, 'Gdiff', this.random, (maxGrow - minGrow) | 0)) + minGrow) | 0; i > 0; i--) {
          let tile = this.findFreeNeighbouringTile(is$, tiles);
          if (tile == null) {
            break;
          }
          tile.changeOwnership(is$.getOwner(), is$);
          tiles.add(tile);
        }
      }
      let skill = is$.getLearnableSkill();
      let isList = skills.get(skill);
      if (isList == null) {
        isList = new ArrayList();
        isList.add(is$);
        skills.put(skill, isList);
      } else {
        isList.add(is$);
      }
    }
    let expertsNeeded = new ArrayList();
    for (const $it12 = spec.getNewWorldGoodsTypeList().iterator(); $it12.hasNext(); ) {
      let goodsType = $it12.next();
      let expert = spec.getExpertForProducing(goodsType);
      if (!skills.containsKey(expert)) {
        expertsNeeded.add(expert);
      }
    }
    let isList = new ArrayList(skills.values());
    while (!expertsNeeded.isEmpty()) {
      let neededSkill = expertsNeeded.removeAt(0);
      isList.sort(CollectionUtils.descendingListLengthComparator);
      let extras = isList.removeAt(0);
      let extraSkill = extras.get(0).getLearnableSkill();
      let choices = new ArrayList();
      for (const $it13 = extras.iterator(); $it13.hasNext(); ) {
        let is$ = $it13.next();
        let nation = is$.getOwner().getNationType();
        let cm = (is$.isCapital()) ? 2 : 1;
        let rc = CollectionUtils.find$Collection$Predicate(nation.generateSkillsForTile(is$.getTile$()), CollectionUtils.matchKeyEquals$Object$Function(neededSkill, ($p0) => $p0.getObject()));
        choices.add(new RandomChoice()._RandomChoice(is$, (rc == null) ? 1 : Math.imul(rc.getProbability(), cm)));
      }
      if (!choices.isEmpty()) {
        let chose = RandomChoice.getWeightedRandom$Logger$String$Collection$Random(SimpleMapGenerator.logger, 'expert', choices, this.random);
        lb.add(['At ', chose.getName(), ' replaced ', extraSkill, ' (one of ', extras.size(), ')', ' by missing ', neededSkill, '\n']);
        chose.setLearnableSkill(neededSkill);
        extras.remove(chose);
        isList.add(0, extras);
        let neededList = new ArrayList();
        neededList.add(chose);
        isList.add(neededList);
      } else {
        lb.add(['Game is missing skill: ', neededSkill, '\n']);
      }
    }
    lb.add(['Settlement skills:']);
    for (const $it14 = isList.iterator(); $it14.hasNext(); ) {
      let iss = $it14.next();
      if (iss.isEmpty()) {
        lb.add(['  0 x <none>']);
      } else {
        lb.add(['  ', iss.size(), ' x ', iss.get(0).getLearnableSkill().getSuffix$()]);
      }
    }
  }
  /**
   * Is a tile suitable for a native settlement?
   * Require the tile be settleable, and at least half its neighbours
   * also be settleable.
   *
   * FIXME: degrade the second test to usability, but wait until the
   * natives-use-water situation is sorted.
   *
   * @param tile The {@code Tile} to examine.
   * @return True if this tile is suitable.
   */
  suitableForNativeSettlement(tile: Tile): boolean {
    if (!tile.getType().canSettle()) {
      return false;
    }
    let good = 0;
    let n = 0;
    for (const $it15 = tile.getSurroundingTiles$int(1).iterator(); $it15.hasNext(); ) {
      let t = $it15.next();
      if (t.getType().canSettle()) {
        good++;
      }
      n++;
    }
    return good >= $J.idiv(n, 2);
  }
  /**
   * Find a free neighbouring tile to a settlement from a list of choices.
   *
   * @param is The {@code IndianSettlement} that might claim the tile.
   * @param tiles A list of {@code Tile}s to start searching from.
   * @return The first suitable tile found, or null if none present.
   */
  findFreeNeighbouringTile(is$: IndianSettlement, tiles: List<Tile>): Tile {
    let owner = is$.getOwner();
    let freeTilePred = (t) => t != null && t.getOwningSettlement() == null && owner.canClaimForSettlement(t);
    let dirns = Direction.getRandomDirections('freeTile', SimpleMapGenerator.logger, this.random);
    for (const $it16 = tiles.iterator(); $it16.hasNext(); ) {
      let t = $it16.next();
      let ret = CollectionUtils.find$Stream$Predicate(CollectionUtils.map$ObjectArr$Function(dirns, (d) => t.getNeighbourOrNull(d)), freeTilePred);
      if (ret != null) {
        return ret;
      }
    }
    return null;
  }
  /**
   * Builds a {@code IndianSettlement} at the given position.
   *
   * @param player The player owning the new settlement.
   * @param capital {@code true} if the settlement should be a
   *      {@link IndianSettlement#isCapital() capital}.
   * @param tile The {@code Tile} to place the settlement.
   * @param map The map that should get a new settlement.
   * @param lb A {@code LogBuilder} to log to.
   * @return The {@code IndianSettlement} just being placed
   *      on the map.
   */
  placeIndianSettlement(player: Player, capital: boolean, tile: Tile, map: Map_, lb: LogBuilder): IndianSettlement {
    let name = (capital) ? player.getCapitalName(this.random) : player.getSettlementName(this.random);
    let skill = this.generateSkillForLocation(map, tile, player.getNationType());
    let sis = new ServerIndianSettlement()._ServerIndianSettlement$Game$Player$String$Tile$boolean$UnitType$Unit(map.getGame(), player, name, tile, capital, skill, null);
    player.addSettlement(sis);
    lb.add(['Generated skill for ', sis.getName(), ': ', sis.getLearnableSkill().getSuffix$(), '\n']);
    sis.placeSettlement(true);
    sis.addRandomGoods(this.random);
    sis.addUnits$Random(this.random);
    return sis;
  }
  /**
   * Generates a skill that could be taught from a settlement on the
   * given tile.
   *
   * @param map The {@code Map}.
   * @param tile The {@code Tile} where the settlement will be located.
   * @param nationType The {@code NationType} to generate a skill for.
   * @return A skill that can be taught to Europeans.
   */
  generateSkillForLocation(map: Map_, tile: Tile, nationType: NationType): UnitType {
    let skills = (nationType).getSkills();
    let scale = CollectionUtils.transform$Collection$Predicate$Function$Collector(skills, CollectionUtils.alwaysTrue(), JFunction.identity(), Collectors.toMap((rc) => rc.getObject().getExpertProduction(), (rc) => 1));
    for (const $it17 = tile.getSurroundingTiles$int(1).iterator(); $it17.hasNext(); ) {
      let t = $it17.next();
      CollectionUtils.forEachMapEntry$Map$Consumer(scale, (e) => {
        let goodsType = e.getKey();
        scale.put(goodsType, (e.getValue() + t.getPotentialProduction(goodsType, null)) | 0);
      });
    }
    let mapper = (rc) => {
      let unitType = rc.getObject();
      return new RandomChoice()._RandomChoice(unitType, Math.imul(rc.getProbability(), scale.get(unitType.getExpertProduction())));
    };
    let skill = RandomChoice.getWeightedRandom$Logger$String$Collection$Random(null, null, CollectionUtils.transform$Collection$Predicate$Function(skills, CollectionUtils.alwaysTrue(), mapper), this.random);
    let spec = map.getSpecification();
    return (skill != null) ? skill : RandomUtils.getRandomMember$Logger$String$List$Random(SimpleMapGenerator.logger, 'Scout', spec.getUnitTypesWithAbility([Ability.EXPERT_SCOUT]), this.random);
  }
  createEuropeanUnits(map: Map_, liveEuropeanPlayerList: List<Player>): void {
    let startPosGenerator = new EuropeanStartingPositionsGenerator()._EuropeanStartingPositionsGenerator(this.random);
    startPosGenerator.createEuropeanUnits(map, liveEuropeanPlayerList);
  }
  static $clinit() {
    SimpleMapGenerator.logger = Logger.getLogger($J.cls(SimpleMapGenerator).getName());
  }
}

$J.define(SimpleMapGenerator, 'net.sf.freecol.server.generator.SimpleMapGenerator', { kind: 'class', ifaces: ['net.sf.freecol.server.generator.MapGenerator'], sup: 'java.lang.Object', ctors: { 'java.util.Random': '_SimpleMapGenerator' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  LandMap = $J.load('net.sf.freecol.common.model.LandMap');
  LostCityRumour = $J.load('net.sf.freecol.common.model.LostCityRumour');
  LostCityRumour$RumourType = $J.load('net.sf.freecol.common.model.LostCityRumour$RumourType');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  MapGeneratorOptions = $J.load('net.sf.freecol.common.option.MapGeneratorOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  RandomUtils$RandomIntCache = $J.load('net.sf.freecol.common.util.RandomUtils$RandomIntCache');
  EuropeanStartingPositionsGenerator = $J.load('net.sf.freecol.server.generator.EuropeanStartingPositionsGenerator');
  TerrainGenerator = $J.load('net.sf.freecol.server.generator.TerrainGenerator');
  ServerIndianSettlement = $J.load('net.sf.freecol.server.model.ServerIndianSettlement');
  ServerPlayer = $J.load('net.sf.freecol.server.model.ServerPlayer');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
