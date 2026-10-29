// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/generator/EuropeanStartingPositionsGenerator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, ArrayList, Collections, Collectors, Comparator, HashMap, HashSet, IllegalStateException, JObject, Logger, RuntimeException, StreamSupport } from '../../../../../../jre/index.ts';

let FreeColDebugger, FreeColDebugger$DebugMode, Messages, Constants, Goods, TileImprovement, Unit$UnitState, GameOptions, CollectionUtils, RandomUtils, ServerBuilding, ServerColony, ServerUnit;

/**
 * Handles the starting placement of European units.
 */
export class EuropeanStartingPositionsGenerator extends JObject {
  static logger: Logger = null;
  random: Random = null;
  _EuropeanStartingPositionsGenerator(random: Random): this {
    this.random = random;
    return this;
  }
  /**
   * Creates and places the European units as determined by the map settings.
   *
   * The non-naval are placed on land if there are no starting naval unit able to
   * carry them, and in Europe if there's a starting naval unit but no more room.
   *
   * Naval units are placed in Europe if non-naval units are placed on land.
   *
   * @param map The {@code Map} to place the european units on.
   * @param players The players in the game. Starting units are still only created
   *      for non-REF European players.
   */
  createEuropeanUnits(map: Map_, players: List<Player>): void {
    let europeanPlayers = players.stream().filter((p) => p.isEuropean() && !p.isREF()).collect(Collectors.toList());
    if (europeanPlayers.isEmpty()) {
      throw new RuntimeException('No players to generate units for!');
    }
    Collections.shuffle(europeanPlayers, this.random);
    let playerStartingUnits = this.determineStartingUnits(europeanPlayers);
    let playerStartingTiles = this.determineStartingTiles(map, europeanPlayers, playerStartingUnits);
    for (const $it0 = europeanPlayers.iterator(); $it0.hasNext(); ) {
      let player = $it0.next();
      let start = playerStartingTiles.get(player);
      let startingUnits = playerStartingUnits.get(player);
      this.placeUnitsAtStartingLocation(player, start, startingUnits);
    }
  }
  determineStartingUnits(europeanPlayers: List<Player>): JMap<Player, EuropeanStartingPositionsGenerator$StartingUnits> {
    let playerStartingUnits = new HashMap();
    for (const $it1 = europeanPlayers.iterator(); $it1.hasNext(); ) {
      let player = $it1.next();
      playerStartingUnits.put(player, new EuropeanStartingPositionsGenerator$StartingUnits()._EuropeanStartingPositionsGenerator$StartingUnits(player, this.random));
    }
    return playerStartingUnits;
  }
  determineStartingTiles(map: Map_, europeanPlayers: List<Player>, playerStartingUnits: JMap<Player, EuropeanStartingPositionsGenerator$StartingUnits>): JMap<Player, Tile> {
    let spec = map.getSpecification();
    let game = map.getGame();
    let mapDefinedStartingPositionsAvailable = this.isMapDefinedStartingPositionsAvailableFor(europeanPlayers, game);
    if (!mapDefinedStartingPositionsAvailable) {
      return this.determineStartingTilesWithoutUsingPredeterminedPositions(map, europeanPlayers, playerStartingUnits);
    }
    let startingPositions = this.determineStartingTilesUsingMapDefinedPositions(europeanPlayers, playerStartingUnits, game);
    if (startingPositions.size() < playerStartingUnits.size()) {
      EuropeanStartingPositionsGenerator.logger.info('Unable to use map defined starting positions - possibly caused by overlapping nation areas.');
      return this.determineStartingTilesWithoutUsingPredeterminedPositions(map, europeanPlayers, playerStartingUnits);
    }
    return startingPositions;
  }
  determineStartingTilesUsingMapDefinedPositions(europeanPlayers: List<Player>, playerStartingUnits: JMap<Player, EuropeanStartingPositionsGenerator$StartingUnits>, game: Game): JMap<Player, Tile> {
    let spec = game.getSpecification();
    let positionType = spec.getInteger(GameOptions.STARTING_POSITIONS);
    switch (positionType) {
      case GameOptions.STARTING_POSITIONS_CLASSIC:
        return this.playerMapStartingAreaAndEnsureDistance(europeanPlayers, playerStartingUnits, game);
      case GameOptions.STARTING_POSITIONS_RANDOM:
        return this.randomMapStartingArea(europeanPlayers, playerStartingUnits, game);
      case GameOptions.STARTING_POSITIONS_HISTORICAL:
        return this.playerMapStartingArea(europeanPlayers, playerStartingUnits, game);
      default:
        throw new IllegalStateException('Unknown positionType=' + positionType);
    }
  }
  playerMapStartingAreaAndEnsureDistance(europeanPlayers: List<Player>, playerStartingUnits: JMap<Player, EuropeanStartingPositionsGenerator$StartingUnits>, game: Game): JMap<Player, Tile> {
    let MINIMUM_DISTANCE_BETWEEN_PLAYERS = 10;
    let MAX_TRIES = 10;
    for (let i = 0; i < MAX_TRIES; i++) {
      let startingTiles = this.playerMapStartingArea(europeanPlayers, playerStartingUnits, game);
      let satisfiesMinimumDistance = startingTiles.values().stream().noneMatch((t) => startingTiles.values().stream().anyMatch((t2) => t !== t2 && t.getDistanceTo(t2) < MINIMUM_DISTANCE_BETWEEN_PLAYERS));
      if (satisfiesMinimumDistance) {
        return startingTiles;
      }
    }
    EuropeanStartingPositionsGenerator.logger.info('Not able to secure minimum starting distance between European players.');
    return this.playerMapStartingArea(europeanPlayers, playerStartingUnits, game);
  }
  playerMapStartingArea(europeanPlayers: List<Player>, playerStartingUnits: JMap<Player, EuropeanStartingPositionsGenerator$StartingUnits>, game: Game): JMap<Player, Tile> {
    let startingTiles = new HashMap();
    for (const $it2 = europeanPlayers.iterator(); $it2.hasNext(); ) {
      let player = $it2.next();
      let startingUnits = playerStartingUnits.get(player);
      let prefersLand = startingUnits.getCarriers().isEmpty();
      let startingArea = game.getNationStartingArea(player.getNation());
      let possibleStartingTiles = startingArea.getTiles().stream().filter((t) => t.isLand() === prefersLand).collect(Collectors.toList());
      if (possibleStartingTiles.isEmpty()) {
        possibleStartingTiles = startingArea.getTiles();
      }
      while (!possibleStartingTiles.isEmpty()) {
        let randomIndex = this.random.nextInt(possibleStartingTiles.size());
        let startingTile = possibleStartingTiles.get(randomIndex);
        if (!startingTiles.values().contains(startingTile)) {
          startingTiles.put(player, startingTile);
          break;
        }
        possibleStartingTiles.removeAt(randomIndex);
      }
    }
    return startingTiles;
  }
  randomMapStartingArea(europeanPlayers: List<Player>, playerStartingUnits: JMap<Player, EuropeanStartingPositionsGenerator$StartingUnits>, game: Game): JMap<Player, Tile> {
    let startingTiles = new HashMap();
    let tilesToChooseFrom = new HashSet();
    for (const $it3 = europeanPlayers.iterator(); $it3.hasNext(); ) {
      let player = $it3.next();
      let startingArea = game.getNationStartingArea(player.getNation());
      if (startingArea != null) {
        tilesToChooseFrom.addAll(startingArea.getTiles());
      }
    }
    let randomLandTilesToChooseFrom = tilesToChooseFrom.stream().filter((t) => t.isLand()).collect(Collectors.toList());
    Collections.shuffle(randomLandTilesToChooseFrom, this.random);
    let indexLand = 0;
    let randomOceanTilesToChooseFrom = tilesToChooseFrom.stream().filter((t) => !t.isLand()).collect(Collectors.toList());
    Collections.shuffle(randomOceanTilesToChooseFrom, this.random);
    let indexOcean = 0;
    for (const $it4 = europeanPlayers.iterator(); $it4.hasNext(); ) {
      let player = $it4.next();
      let startingUnits = playerStartingUnits.get(player);
      let prefersLand = startingUnits.getCarriers().isEmpty();
      let startingTile: Tile;
      if (prefersLand && indexLand < randomLandTilesToChooseFrom.size()) {
        startingTile = randomLandTilesToChooseFrom.get(indexLand);
        indexLand++;
      } else if (!prefersLand && indexOcean < randomOceanTilesToChooseFrom.size()) {
        startingTile = randomOceanTilesToChooseFrom.get(indexOcean);
        indexOcean++;
      } else if (indexLand < randomLandTilesToChooseFrom.size()) {
        startingTile = randomLandTilesToChooseFrom.get(indexLand);
        indexLand++;
      } else {
        startingTile = randomOceanTilesToChooseFrom.get(indexOcean);
        indexOcean++;
      }
      startingTiles.put(player, startingTile);
    }
    return startingTiles;
  }
  isMapDefinedStartingPositionsAvailableFor(europeanPlayers: List<Player>, game: Game): boolean {
    let spec = game.getSpecification();
    let mapDefinedStartingPositions = spec.getBoolean(GameOptions.MAP_DEFINED_STARTING_POSITIONS);
    let positionType = spec.getInteger(GameOptions.STARTING_POSITIONS);
    let numAreas = 0;
    if (mapDefinedStartingPositions) {
      for (const $it5 = europeanPlayers.iterator(); $it5.hasNext(); ) {
        let player = $it5.next();
        let area = game.getNationStartingArea(player.getNation());
        if (area == null || area.getTiles().isEmpty()) {
          EuropeanStartingPositionsGenerator.logger.info('No map defined starting area for: ' + player.getNationId());
          if (positionType === GameOptions.STARTING_POSITIONS_CLASSIC || positionType === GameOptions.STARTING_POSITIONS_HISTORICAL) {
            break;
          }
          continue;
        }
        numAreas++;
      }
    }
    if (numAreas < europeanPlayers.size()) {
      mapDefinedStartingPositions = false;
    }
    return mapDefinedStartingPositions;
  }
  determineStartingTilesWithoutUsingPredeterminedPositions(map: Map_, europeanPlayers: List<Player>, playerStartingUnits: JMap<Player, EuropeanStartingPositionsGenerator$StartingUnits>): JMap<Player, Tile> {
    let spec = map.getSpecification();
    let positionType = spec.getInteger(GameOptions.STARTING_POSITIONS);
    let number$ = europeanPlayers.size();
    let eastTiles = new ArrayList();
    let westTiles = new ArrayList();
    let eastLandTiles = new ArrayList();
    let westLandTiles = new ArrayList();
    let eastSeaTiles = new ArrayList();
    let westSeaTiles = new ArrayList();
    map.collectStartingTiles(eastTiles, westTiles);
    for (const $it6 = eastTiles.iterator(); $it6.hasNext(); ) {
      let t = $it6.next();
      if (t.isLand()) {
        eastLandTiles.add(t);
      } else {
        eastSeaTiles.add(t);
      }
    }
    for (const $it7 = westTiles.iterator(); $it7.hasNext(); ) {
      let t = $it7.next();
      if (t.isLand()) {
        westLandTiles.add(t);
      } else {
        westSeaTiles.add(t);
      }
    }
    switch (positionType) {
      case GameOptions.STARTING_POSITIONS_CLASSIC:
        this.sampleTiles(eastLandTiles, number$);
        this.sampleTiles(eastSeaTiles, number$);
        this.sampleTiles(westLandTiles, number$);
        this.sampleTiles(westSeaTiles, number$);
        break;
      case GameOptions.STARTING_POSITIONS_RANDOM:
        eastLandTiles.addAll(westLandTiles);
        eastSeaTiles.addAll(westSeaTiles);
        this.sampleTiles(eastLandTiles, number$);
        this.sampleTiles(eastSeaTiles, number$);
        break;
      case GameOptions.STARTING_POSITIONS_HISTORICAL:
        break;
    }
    let playerStartingTiles = new HashMap();
    for (const $it8 = europeanPlayers.iterator(); $it8.hasNext(); ) {
      let player = $it8.next();
      let startEast = player.getNation().getStartsOnEastCoast();
      let startAtSea = !playerStartingUnits.get(player).getCarriers().isEmpty();
      let start = null;
      switch (positionType) {
        case GameOptions.STARTING_POSITIONS_CLASSIC:
          start = ((startAtSea) ? ((startEast) ? eastSeaTiles : westSeaTiles) : ((startEast) ? eastLandTiles : westLandTiles)).removeAt(0);
          break;
        case GameOptions.STARTING_POSITIONS_RANDOM:
          start = ((startAtSea) ? eastSeaTiles : eastLandTiles).removeAt(0);
          break;
        case GameOptions.STARTING_POSITIONS_HISTORICAL:
          start = (startAtSea) ? this.findHistoricalStartingPosition(player, map, eastSeaTiles, westSeaTiles) : this.findHistoricalStartingPosition(player, map, eastLandTiles, westLandTiles);
          break;
      }
      if (start == null) {
        throw new RuntimeException('Failed to find start tile ' + ((startAtSea) ? 'at sea' : 'on land') + ' for player ' + $J.str(player));
      }
      playerStartingTiles.put(player, start);
    }
    return playerStartingTiles;
  }
  placeUnitsAtStartingLocation(player: Player, start: Tile, startingUnits: EuropeanStartingPositionsGenerator$StartingUnits): void {
    let map = player.getGame().getMap();
    let spec = map.getSpecification();
    player.setEntryTile(start);
    let europe = player.getEurope();
    let serverPlayer = player;
    if (!start.isLand()) {
      for (const $it9 = startingUnits.getCarriers().iterator(); $it9.hasNext(); ) {
        let u = $it9.next();
        u.setLocation(start);
        serverPlayer.exploreForUnit(u);
      }
      passengers:
      for (const $it10 = startingUnits.getPassengers().iterator(); $it10.hasNext(); ) {
        let unit = $it10.next();
        for (const $it11 = startingUnits.getCarriers().iterator(); $it11.hasNext(); ) {
          let carrier = $it11.next();
          if (carrier.canAdd(unit)) {
            unit.setLocation(carrier);
            continue passengers;
          }
        }
        unit.setLocation(europe);
      }
      for (const $it12 = startingUnits.getOtherNaval().iterator(); $it12.hasNext(); ) {
        let u = $it12.next();
        u.setLocation(start);
        serverPlayer.exploreForUnit(u);
      }
    } else {
      for (const $it13 = startingUnits.getPassengers().iterator(); $it13.hasNext(); ) {
        let u = $it13.next();
        u.setLocation(start);
        serverPlayer.exploreForUnit(u);
      }
      for (const $it14 = startingUnits.getOtherNaval().iterator(); $it14.hasNext(); ) {
        let u = $it14.next();
        u.setLocation(europe);
      }
    }
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.INIT)) {
      this.createDebugUnits(map, player, start);
      spec.setInteger(GameOptions.STARTING_MONEY, 10000);
    }
    let ourREF = player.getREFPlayer();
    if (ourREF == null) {
      return;
    }
    let distance = 10;
    let refTiles = StreamSupport.stream(map.getCircleTiles(start, true, distance).spliterator(), false).filter((t) => !t.isLand()).collect(Collectors.toList());
    let startRef = RandomUtils.getRandomMember$Logger$String$List$Random(EuropeanStartingPositionsGenerator.logger, $J.str(ourREF) + ' start', refTiles, this.random);
    ourREF.setEntryTile(startRef);
  }
  /**
   * Find the best historical starting position for a player from lists
   * of tiles.
   *
   * @param player The {@code Player} to find a tile for.
   * @param map The {@code Map} to search.
   * @param east A list of starting {@code Tile}s on the east of the map.
   * @param west A list of starting {@code Tile}s on the west of the map.
   * @return The best {@code Tile} found, or null if none suitable.
   */
  findHistoricalStartingPosition(player: Player, map: Map_, east: List<Tile>, west: List<Tile>): Tile {
    let nation = player.getNation();
    let latY = map.getRow(nation.getPreferredLatitude());
    let tiles = (nation.getStartsOnEastCoast()) ? east : west;
    if (tiles.isEmpty()) {
      return null;
    }
    let dist = (t) => Math.abs((t.getY() - latY) | 0);
    let closest = Comparator.comparingInt(dist);
    let ret = CollectionUtils.minimize$Collection$Comparator(tiles, closest);
    tiles.remove(ret);
    return ret;
  }
  /**
   * Sample a list of tiles to pick spread out starting positions.
   * Shuffle the result or clear it if there were too few tiles.
   *
   * @param tiles The list of {@code Tile}s to sample.
   * @param number The number of players, which determines the spacing.
   * @return True if there were enough tiles in the list.
   */
  sampleTiles(tiles: List<Tile>, number$: number): boolean {
    let n = tiles.size();
    let step = $J.idiv(n, number$);
    if (step <= 1) {
      tiles.clear();
      return false;
    }
    let samples = new ArrayList();
    for (let i = $J.idiv(step, 2); i < n; i = (i + step) | 0) {
      samples.add(tiles.get(i));
    }
    tiles.clear();
    tiles.addAll(samples);
    RandomUtils.randomShuffle(EuropeanStartingPositionsGenerator.logger, 'Starting tiles', tiles, this.random);
    return true;
  }
  createDebugUnits(map: Map_, player: Player, startTile: Tile): List<Unit> {
    let game = map.getGame();
    let spec = game.getSpecification();
    let ret = new ArrayList(20);
    let unitType = spec.getUnitType('model.unit.galleon');
    let galleon = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, startTile, player, unitType);
    galleon.setName(player.getNameForUnit(unitType, this.random));
    ret.add(galleon);
    unitType = spec.getUnitType('model.unit.privateer');
    let privateer = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, startTile, player, unitType);
    ret.add(privateer);
    privateer.setName(player.getNameForUnit(unitType, this.random));
    (player).exploreForUnit(privateer);
    unitType = spec.getUnitType('model.unit.freeColonist');
    ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, galleon, player, unitType));
    unitType = spec.getUnitType('model.unit.veteranSoldier');
    ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, galleon, player, unitType));
    unitType = spec.getUnitType('model.unit.jesuitMissionary');
    ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, galleon, player, unitType));
    let colonyTile = null;
    for (const $it15 = map.getCircleTiles(startTile, true, Constants.INFINITY).iterator(); $it15.hasNext(); ) {
      let tempTile = $it15.next();
      if (tempTile.isPolar()) {
        continue;
      }
      if (player.canClaimToFoundSettlement(tempTile)) {
        colonyTile = tempTile;
        break;
      }
    }
    if (colonyTile == null) {
      return ret;
    }
    colonyTile.setType(CollectionUtils.find$Collection$Predicate(spec.getTileTypeList(), (t) => !t.isWater()));
    unitType = spec.getUnitType('model.unit.expertFarmer');
    let buildColonyUnit = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType);
    ret.add(buildColonyUnit);
    let colonyName = Messages.message$StringTemplate(player.getNationLabel()) + ' ' + Messages.message$String('Colony');
    let colony = new ServerColony()._ServerColony$Game$Player$String$Tile(game, player, colonyName, colonyTile);
    player.addSettlement(colony);
    colony.placeSettlement(true);
    for (const $it16 = (CollectionUtils.transform$Collection$Predicate(colonyTile.getSurroundingTiles$int$int(1, 1), (t) => (!t.hasSettlement() && (t.getOwner() == null || !t.getOwner().isEuropean())))).iterator(); $it16.hasNext(); ) {
      let tile = $it16.next();
      tile.changeOwnership(player, colony);
      if (tile.hasLostCityRumour()) {
        tile.removeLostCityRumour();
      }
    }
    buildColonyUnit.setLocation(colony);
    let ct = buildColonyUnit.getWorkTile();
    if (ct != null) {
      for (const $it17 = (CollectionUtils.transform$Collection$Predicate(spec.getTileTypeList(), (tt) => !tt.isWater())).iterator(); $it17.hasNext(); ) {
        let t = $it17.next();
        ct.setType(t);
        let plowType = map.getSpecification().getTileImprovementType('model.improvement.plow');
        let plow = new TileImprovement()._TileImprovement$Game$Tile$TileImprovementType$TileImprovementStyle(game, ct, plowType, null);
        plow.setTurnsToComplete(0);
        ct.add(plow);
        break;
      }
    }
    let schoolType = spec.getBuildingType('model.building.schoolhouse');
    let schoolhouse = new ServerBuilding()._ServerBuilding$Game$Colony$BuildingType(game, colony, schoolType);
    colony.addBuilding(schoolhouse);
    unitType = spec.getUnitType('model.unit.elderStatesman');
    let statesman = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType);
    ret.add(statesman);
    statesman.setLocation(colony.getWorkLocationFor$Unit$GoodsType(statesman, statesman.getType().getExpertProduction()));
    unitType = spec.getUnitType('model.unit.expertLumberJack');
    let lumberjack = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colony, player, unitType);
    ret.add(lumberjack);
    let lt = lumberjack.getWorkTile();
    if (lt != null) {
      let tt = CollectionUtils.find$Collection$Predicate(spec.getTileTypeList(), ($p0) => $p0.isForested());
      if (tt != null) {
        lt.setType(tt);
      }
      lumberjack.changeWorkType(lumberjack.getType().getExpertProduction());
    }
    unitType = spec.getUnitType('model.unit.masterCarpenter');
    ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colony, player, unitType));
    unitType = spec.getUnitType('model.unit.seasonedScout');
    let scout = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType);
    ret.add(scout);
    (player).exploreForUnit(scout);
    unitType = spec.getUnitType('model.unit.veteranSoldier');
    ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType));
    ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType));
    unitType = spec.getUnitType('model.unit.artillery');
    ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType));
    ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType));
    ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType));
    unitType = spec.getUnitType('model.unit.treasureTrain');
    let train = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType);
    ret.add(train);
    train.setTreasureAmount(10000);
    unitType = spec.getUnitType('model.unit.wagonTrain');
    let wagon = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType);
    ret.add(wagon);
    let cigarsType = spec.getGoodsType('model.goods.cigars');
    let cigards = new Goods()._Goods$Game$Location$GoodsType$int(game, wagon, cigarsType, 5);
    wagon.add(cigards);
    unitType = spec.getUnitType('model.unit.jesuitMissionary');
    ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType));
    ret.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, colonyTile, player, unitType));
    (player).exploreForSettlement(colony);
    return ret;
  }
  static $clinit() {
    EuropeanStartingPositionsGenerator.logger = Logger.getLogger($J.cls(EuropeanStartingPositionsGenerator).getName());
  }
}

export class EuropeanStartingPositionsGenerator$StartingUnits extends JObject {
  carriers: List<Unit> = null;
  passengers: List<Unit> = null;
  otherNaval: List<Unit> = null;
  _EuropeanStartingPositionsGenerator$StartingUnits(player: Player, random: Random): this {
    this.carriers = new ArrayList();
    this.passengers = new ArrayList();
    this.otherNaval = new ArrayList();
    let game = player.getGame();
    let spec = player.getSpecification();
    let unitList = (player.getNationType()).getStartingUnits$();
    for (const $it18 = unitList.iterator(); $it18.hasNext(); ) {
      let startingUnit = $it18.next();
      let type$ = startingUnit.getType(spec);
      let role = startingUnit.getRole(spec);
      let newUnit = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType$Role(game, null, player, type$, role);
      newUnit.setName(player.getNameForUnit(type$, random));
      if (newUnit.isNaval()) {
        if (newUnit.canCarryUnits()) {
          newUnit.setState(Unit$UnitState.ACTIVE);
          this.carriers.add(newUnit);
        } else {
          this.otherNaval.add(newUnit);
        }
      } else {
        newUnit.setState(Unit$UnitState.SENTRY);
        this.passengers.add(newUnit);
      }
    }
    return this;
  }
  getCarriers(): List<Unit> {
    return this.carriers;
  }
  getPassengers(): List<Unit> {
    return this.passengers;
  }
  getOtherNaval(): List<Unit> {
    return this.otherNaval;
  }
}

$J.define(EuropeanStartingPositionsGenerator, 'net.sf.freecol.server.generator.EuropeanStartingPositionsGenerator', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.util.Random': '_EuropeanStartingPositionsGenerator' }, clinit: true, lazy: ['logger'] });
$J.define(EuropeanStartingPositionsGenerator$StartingUnits, 'net.sf.freecol.server.generator.EuropeanStartingPositionsGenerator$StartingUnits', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Player,java.util.Random': '_EuropeanStartingPositionsGenerator$StartingUnits' }, returns: { 'getOtherNaval': 'java.util.List', 'getPassengers': 'java.util.List', 'getCarriers': 'java.util.List' } });
$J.module(() => {
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  ServerBuilding = $J.load('net.sf.freecol.server.model.ServerBuilding');
  ServerColony = $J.load('net.sf.freecol.server.model.ServerColony');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
