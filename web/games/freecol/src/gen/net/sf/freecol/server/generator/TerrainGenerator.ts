// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/generator/TerrainGenerator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, EnumMap, HashMap, JObject, Logger, RuntimeException } from '../../../../../../jre/index.ts';

let Area, Direction, Map_, Map$Layer, Region$RegionType, Resource, Tile, TileImprovement, TileType$RangeType, MapGeneratorOptions, CollectionUtils, RandomChoice, RandomUtils, RandomUtils$RandomIntCache, River, ServerRegion;

/**
 * Class for making a {@code Map} based upon a land map.
 *
 * FIXME: dynamic lakes, mountains and hills
 */
export class TerrainGenerator extends JObject {
  static logger: Logger = null;
  static readonly LAND_REGIONS_SCORE_VALUE: number = 1000;
  static readonly LAND_REGION_MIN_SCORE: number = 5;
  static readonly LAND_REGION_MAX_SIZE: number = 75;
  /**
   * The pseudo random number generator.
   */
  random: Random = null;
  /**
   * A cached random integer source.
   */
  cache: RandomUtils$RandomIntCache = null;
  /**
   * The cached land and ocean tile types.
   */
  landTileTypes: List<TileType> = null;
  oceanTileTypes: List<TileType> = null;
  /**
   * Creates a new {@code TerrainGenerator}.
   *
   * FIXME: cache or randomizer???
   *
   * @param random A pseudo-random number source.
   * @see #generateMap
   */
  _TerrainGenerator(random: Random): this {
    this.landTileTypes = null;
    this.oceanTileTypes = null;
    this.random = random;
    this.cache = new RandomUtils$RandomIntCache()._RandomUtils$RandomIntCache(TerrainGenerator.logger, 'terrain', random, 1 << 16, 512);
    return this;
  }
  limitToRange(value: number, lower: number, upper: number): number {
    return Math.max(lower, Math.min(value, upper));
  }
  /**
   * Gets the approximate number of land tiles.
   *
   * @param game The {@code Game} to generate for.
   * @return The approximate number of land tiles
   */
  getApproximateLandCount(game: Game): number {
    let mapOptions = game.getMapGeneratorOptions();
    return $J.idiv(Math.imul(Math.imul(mapOptions.getInteger(MapGeneratorOptions.MAP_WIDTH), mapOptions.getInteger(MapGeneratorOptions.MAP_HEIGHT)), mapOptions.getInteger(MapGeneratorOptions.LAND_MASS)), 100);
  }
  /**
   * Gets a random land tile type based on the latitude.
   *
   * @param game The {@code Game} to generate for.
   * @param latitude The location of the tile relative to the north/south
   *     poles and equator:
   *     0 is the mid-section of the map (equator)
   *     +/-90 is on the bottom/top of the map (poles).
   * @return A suitable random land tile type.
   */
  getRandomLandTileType(game: Game, latitude: number): TileType {
    let spec = game.getSpecification();
    if (this.landTileTypes == null) {
      this.landTileTypes = CollectionUtils.transform$Collection$Predicate(spec.getTileTypeList(), (t) => !t.isElevation() && !t.isWater());
    }
    return this.getRandomTileType(game, this.landTileTypes, latitude);
  }
  /**
   * Gets a random ocean tile type.
   *
   * @param game The {@code Game} to generate for.
   * @param latitude The latitude of the proposed tile.
   * @return A suitable random ocean tile type.
   */
  getRandomOceanTileType(game: Game, latitude: number): TileType {
    let spec = game.getSpecification();
    if (this.oceanTileTypes == null) {
      this.oceanTileTypes = CollectionUtils.transform$Collection$Predicate(spec.getTileTypeList(), (t) => t.isWater() && t.isHighSeasConnected() && !t.isDirectlyHighSeasConnected());
    }
    return this.getRandomTileType(game, this.oceanTileTypes, latitude);
  }
  /**
   * Gets a tile type fitted to the regional requirements.
   *
   * FIXME: Can be used for rivers too.
   *
   * @param game The {@code Game} to generate for.
   * @param candidates A list of {@code TileType}s to use for
   *     calculations.
   * @param latitude The tile latitude.
   * @return A suitable {@code TileType}.
   */
  getRandomTileType(game: Game, candidates: List<TileType>, latitude: number): TileType {
    let mapOptions = game.getMapGeneratorOptions();
    let spec = game.getSpecification();
    let forestChance = mapOptions.getRange(MapGeneratorOptions.FOREST_NUMBER);
    let temperaturePreference = mapOptions.getRange(MapGeneratorOptions.TEMPERATURE);
    let poleTemperature = -20;
    let equatorTemperature = 40;
    switch (temperaturePreference) {
      case MapGeneratorOptions.TEMPERATURE_COLD:
        poleTemperature = -20;
        equatorTemperature = 25;
        break;
      case MapGeneratorOptions.TEMPERATURE_CHILLY:
        poleTemperature = -20;
        equatorTemperature = 30;
        break;
      case MapGeneratorOptions.TEMPERATURE_TEMPERATE:
        poleTemperature = -10;
        equatorTemperature = 35;
        break;
      case MapGeneratorOptions.TEMPERATURE_WARM:
        poleTemperature = -5;
        equatorTemperature = 40;
        break;
      case MapGeneratorOptions.TEMPERATURE_HOT:
        poleTemperature = 0;
        equatorTemperature = 40;
        break;
      default:
        break;
    }
    let temperatureRange = (equatorTemperature - poleTemperature) | 0;
    let localeTemperature = (poleTemperature + $J.idiv(Math.imul(((90 - Math.abs(latitude)) | 0), temperatureRange), 90)) | 0;
    let temperatureDeviation = 7;
    localeTemperature = (localeTemperature + (this.cache.nextInt$int(Math.imul(temperatureDeviation, 2)) - temperatureDeviation)) | 0;
    localeTemperature = this.limitToRange(localeTemperature, -20, 40);
    let localeHumidity = spec.getRange(MapGeneratorOptions.HUMIDITY);
    let humidityDeviation = 20;
    localeHumidity = (localeHumidity + (this.cache.nextInt$int(Math.imul(humidityDeviation, 2)) - humidityDeviation)) | 0;
    localeHumidity = this.limitToRange(localeHumidity, 0, 100);
    let candidateTileTypes = new ArrayList(candidates);
    let i = 0;
    while (i < candidateTileTypes.size()) {
      let type$ = candidateTileTypes.get(i);
      if (!type$.withinRange(TileType$RangeType.TEMPERATURE, localeTemperature)) {
        candidateTileTypes.removeAt(i);
        continue;
      }
      i++;
    }
    switch (candidateTileTypes.size()) {
      case 0:
        throw new RuntimeException('No TileType for temperature==' + localeTemperature);
      case 1:
        return CollectionUtils.first$Collection(candidateTileTypes);
      default:
        break;
    }
    i = 0;
    while (i < candidateTileTypes.size()) {
      let type$ = candidateTileTypes.get(i);
      if (!type$.withinRange(TileType$RangeType.HUMIDITY, localeHumidity)) {
        candidateTileTypes.removeAt(i);
        continue;
      }
      i++;
    }
    switch (candidateTileTypes.size()) {
      case 0:
        throw new RuntimeException('No TileType for humidity==' + localeHumidity);
      case 1:
        return CollectionUtils.first$Collection(candidateTileTypes);
      default:
        break;
    }
    let forested = this.cache.nextInt$int(100) < forestChance && (CollectionUtils.any$Collection$Predicate(candidateTileTypes, ($p0) => $p0.isForested()));
    i = 0;
    while (i < candidateTileTypes.size()) {
      let type$ = candidateTileTypes.get(i);
      if (type$.isForested() !== forested) {
        candidateTileTypes.removeAt(i);
        continue;
      }
      i++;
    }
    switch (i = candidateTileTypes.size()) {
      case 0:
        throw new RuntimeException('No TileType for forested==' + forested);
      case 1:
        return CollectionUtils.first$Collection(candidateTileTypes);
      default:
        return candidateTileTypes.get(this.cache.nextInt$int(i));
    }
  }
  /**
   * Creates land map regions in the given Map.
   *
   * First, the arctic/antarctic regions are defined, based on
   * {@code Map.POLAR_HEIGHT}.
   *
   * For the remaining land tiles, one region per contiguous
   * landmass is created.
   *
   * @param map The {@code Map} to work on.
   * @param lb A {@code LogBuilder} to log to.
   * @return A list of created {@code ServerRegion}s.
   */
  createLandRegions(map: Map_, lb: LogBuilder): List<ServerRegion> {
    let game = map.getGame();
    let continents = 0;
    let landmap = $J.newArrayN([map.getWidth(), map.getHeight()], false);
    let continentmap = $J.newArrayN([map.getWidth(), map.getHeight()], 0);
    let landsize = 0;
    for (let x = 0; x < map.getWidth(); x++) {
      for (let y = 0; y < map.getHeight(); y++) {
        continentmap[x][y] = 0;
        landmap[x][y] = false;
        if (map.isValid$int$int(x, y)) {
          let tile = map.getTile$int$int(x, y);
          landmap[x][y] = tile.isLand() && tile.getRegion() == null;
          if (tile.isLand()) {
            landsize++;
          }
        }
      }
    }
    for (let y = 0; y < map.getHeight(); y++) {
      for (let x = 0; x < map.getWidth(); x++) {
        if (landmap[x][y]) {
          continents++;
          let continent = Map_.floodFillBool$booleanArrArr$int$int(landmap, x, y);
          for (let yy = 0; yy < map.getHeight(); yy++) {
            for (let xx = 0; xx < map.getWidth(); xx++) {
              if (continent[xx][yy]) {
                continentmap[xx][yy] = continents;
                landmap[xx][yy] = false;
              }
            }
          }
        }
      }
    }
    lb.add(['Number of individual landmasses is ', continents, '\n']);
    let continentsize = $J.newArray((continents + 1) | 0, 0);
    for (let y = 0; y < map.getHeight(); y++) {
      for (let x = 0; x < map.getWidth(); x++) {
        continentsize[continentmap[x][y]]++;
      }
    }
    let oldcontinents = continents;
    for (let c = 1; c <= oldcontinents; c++) {
      if (continentsize[c] > TerrainGenerator.LAND_REGION_MAX_SIZE) {
        let splitcontinent = $J.newArrayN([map.getWidth(), map.getHeight()], false);
        let splitX = 0;
        let splitY = 0;
        for (let x = 0; x < map.getWidth(); x++) {
          for (let y = 0; y < map.getHeight(); y++) {
            if (continentmap[x][y] === c) {
              splitcontinent[x][y] = true;
              splitX = x;
              splitY = y;
            } else {
              splitcontinent[x][y] = false;
            }
          }
        }
        while (continentsize[c] > TerrainGenerator.LAND_REGION_MAX_SIZE) {
          let targetsize = TerrainGenerator.LAND_REGION_MAX_SIZE;
          if (continentsize[c] < Math.imul(2, TerrainGenerator.LAND_REGION_MAX_SIZE)) {
            targetsize = $J.idiv(continentsize[c], 2);
          }
          continents++;
          let newregion = Map_.floodFillBool$booleanArrArr$int$int$int(splitcontinent, splitX, splitY, targetsize);
          for (let x = 0; x < map.getWidth(); x++) {
            for (let y = 0; y < map.getHeight(); y++) {
              if (newregion[x][y]) {
                continentmap[x][y] = continents;
                splitcontinent[x][y] = false;
                continentsize[c]--;
              }
              if (splitcontinent[x][y]) {
                splitX = x;
                splitY = y;
              }
            }
          }
        }
      }
    }
    lb.add(['Number of land regions being created: ', continents, '\n']);
    let landregions = $J.newArray((continents + 1) | 0, null);
    let landIndex = 1;
    for (let c = 1; c <= continents; c++) {
      landregions[c] = new ServerRegion()._ServerRegion$Game$RegionType(game, Region$RegionType.LAND);
    }
    for (let y = 0; y < map.getHeight(); y++) {
      for (let x = 0; x < map.getWidth(); x++) {
        if (continentmap[x][y] > 0) {
          let tile = map.getTile$int$int(x, y);
          landregions[continentmap[x][y]].addTile(tile);
        }
      }
    }
    for (let c = 1; c <= continents; c++) {
      let sr = landregions[c];
      let score = Math.max($J.d2i((Math.fround((Math.fround(Math.fround(sr.getSize()) / landsize)) * TerrainGenerator.LAND_REGIONS_SCORE_VALUE))), TerrainGenerator.LAND_REGION_MIN_SCORE);
      sr.setScoreValue(score);
      lb.add(['Created land region ', sr.toString(), ' (size ', sr.getSize(), ', score ', sr.getScoreValue(), ', parent ', ((sr.getParent() == null) ? '(null)' : sr.getParent().toString()), ')\n']);
    }
    return Arrays.asList(...Arrays.copyOfRange(landregions, 1, (continents + 1) | 0));
  }
  /**
   * Creates mountain ranges on the given map.  The number and size
   * of mountain ranges depends on the map size.
   *
   * @param map The map to use.
   * @param lb A {@code LogBuilder} to log to.
   * @return A list of created {@code ServerRegion}s.
   */
  createMountains(map: Map_, lb: LogBuilder): List<ServerRegion> {
    let game = map.getGame();
    let spec = game.getSpecification();
    let mapOptions = game.getMapGeneratorOptions();
    let randomHillsRatio = 0.5;
    let maximumLength = $J.idiv(Math.max(mapOptions.getInteger(MapGeneratorOptions.MAP_WIDTH), mapOptions.getInteger(MapGeneratorOptions.MAP_HEIGHT)), 10);
    let number$ = $J.roundf(Math.fround((Math.fround(1 - randomHillsRatio)) * (Math.fround(Math.fround(this.getApproximateLandCount(game)) / mapOptions.getRange(MapGeneratorOptions.MOUNTAIN_NUMBER)))));
    lb.add(['Number of mountain tiles is ', number$, '\n', 'Maximum length of mountain ranges is ', maximumLength, '\n']);
    let result = new ArrayList(number$);
    let tiles = new ArrayList();
    map.forEachTile$Predicate$Consumer((t) => t.isGoodMountainTile(), (t) => tiles.add(t));
    RandomUtils.randomShuffle(TerrainGenerator.logger, 'Randomize mountain tiles', tiles, this.random);
    let counter = 0;
    for (const $it0 = tiles.iterator(); $it0.hasNext(); ) {
      let startTile = $it0.next();
      if (!startTile.isGoodMountainTile()) {
        continue;
      }
      let mountainRegion = new ServerRegion()._ServerRegion$Game$RegionType(game, Region$RegionType.MOUNTAIN);
      let direction = Direction.getRandomDirection('getLand', TerrainGenerator.logger, this.random);
      let length = (maximumLength - this.cache.nextInt$int($J.idiv(maximumLength, 2))) | 0;
      let tile = startTile;
      for (let index = 0; index < length; index++) {
        if (!tile.getType().isMountains()) {
          let mountains = this.getRandomTileType(game, spec.getMountainsTileTypeList(), map.getLatitude(tile.getY()));
          if (mountains == null) {
            continue;
          }
          tile.setType(mountains);
          mountainRegion.addTile(tile);
          counter++;
        }
        for (const $it1 = tile.getSurroundingTiles$int(1).iterator(); $it1.hasNext(); ) {
          let t = $it1.next();
          if (!t.isGoodHillTile() || t.getType().isMountains()) {
            continue;
          }
          let r = this.cache.nextInt$int(8);
          if (r < 2) {
            let mountains = this.getRandomTileType(game, spec.getMountainsTileTypeList(), map.getLatitude(t.getY()));
            if (mountains == null) {
              continue;
            }
            t.setType(mountains);
            mountainRegion.addTile(t);
            counter++;
          } else if (r < 7) {
            let hills = this.getRandomTileType(game, spec.getHillsTileTypeList(), map.getLatitude(t.getY()));
            if (hills == null) {
              continue;
            }
            t.setType(hills);
            mountainRegion.addTile(t);
          }
        }
        tile = tile.getNeighbourOrNull(direction);
        if (tile == null || !tile.isLand()) {
          break;
        }
      }
      let scoreValue = Math.imul(2, mountainRegion.getSize());
      mountainRegion.setScoreValue(scoreValue);
      result.add(mountainRegion);
      lb.add(['Created mountain region (direction ', direction, ', length ', length, ', size ', mountainRegion.getSize(), ', score value ', scoreValue, ').\n']);
      if (counter >= number$) {
        break;
      }
    }
    lb.add(['Added ', counter, ' mountain range tiles.\n']);
    tiles.clear();
    map.forEachTile$Predicate$Consumer(($p0) => $p0.isGoodHillTile(), (t) => tiles.add(t));
    RandomUtils.randomShuffle(TerrainGenerator.logger, 'Randomize hill tiles', tiles, this.random);
    number$ = $J.idiv($J.d2i((Math.fround(this.getApproximateLandCount(game) * randomHillsRatio))), mapOptions.getRange(MapGeneratorOptions.MOUNTAIN_NUMBER));
    counter = 0;
    for (const $it2 = tiles.iterator(); $it2.hasNext(); ) {
      let t = $it2.next();
      let mountains = this.getRandomTileType(game, spec.getMountainsTileTypeList(), map.getLatitude(t.getY()));
      let hills = this.getRandomTileType(game, spec.getHillsTileTypeList(), map.getLatitude(t.getY()));
      if (mountains == null || hills == null) {
        continue;
      }
      let m = this.cache.nextInt$int(4) === 0;
      t.setType((m) ? mountains : hills);
      if (++counter >= number$) {
        break;
      }
    }
    lb.add(['Added ', counter, ' random hilly tiles.\n']);
    return result;
  }
  /**
   * Creates rivers on the given map. The number of rivers depends
   * on the map size.
   *
   * @param map The {@code Map} to create rivers on.
   * @param lb A {@code LogBuilder} to log to.
   * @return A list of created {@code ServerRegion}s.
   */
  createRivers(map: Map_, lb: LogBuilder): List<ServerRegion> {
    let game = map.getGame();
    let spec = game.getSpecification();
    let mapOptions = game.getMapGeneratorOptions();
    let result = new ArrayList();
    let riverType = spec.getTileImprovementType('model.improvement.river');
    let riverMap = new HashMap();
    let rivers = new ArrayList();
    let tiles = new ArrayList();
    map.forEachTile$Predicate$Consumer((t) => t.isGoodRiverTile(riverType), (t) => tiles.add(t));
    RandomUtils.randomShuffle(TerrainGenerator.logger, 'Randomize river tiles', tiles, this.random);
    let absoluteMaximumRiverTiles = map.getTileList((t) => riverType.isTileTypeAllowed(t.getType())).size();
    let softMaximumRiverTiles = $J.idiv((Math.imul(absoluteMaximumRiverTiles, mapOptions.getRange(MapGeneratorOptions.RIVER_NUMBER))), 100);
    let counter = 0;
    for (const $it3 = tiles.iterator(); $it3.hasNext(); ) {
      let tile = $it3.next();
      if (riverMap.get(tile) != null) {
        continue;
      }
      if (riverMap.size() > softMaximumRiverTiles) {
        break;
      }
      let riverRegion = new ServerRegion()._ServerRegion$Game$RegionType(game, Region$RegionType.RIVER);
      let river = new River()._River(map, riverMap, riverRegion, this.random);
      if (river.flowFromSource(tile)) {
        lb.add(['Created new river with length ', river.getLength(), '\n']);
        result.add(riverRegion);
        rivers.add(river);
      } else {
        lb.add(['Failed to generate river at ' + $J.str(tile) + '.\n']);
      }
    }
    lb.add(['Created ', counter, ' rivers of maximum ', softMaximumRiverTiles, '\n']);
    for (const $it4 = rivers.iterator(); $it4.hasNext(); ) {
      let river = $it4.next();
      let region = river.getRegion();
      let score = Math.imul(2, CollectionUtils.sum$Collection$ToIntFunction(river.getSections(), ($p0) => $p0.getSize()));
      region.setScoreValue(score);
      lb.add(['Created river region (length ', river.getLength(), ', score value ', score, ').\n']);
    }
    return result;
  }
  /**
   * Finds all the lake regions.
   *
   * @param map The {@code Map} to work on.
   * @param lb A {@code LogBuilder} to log to.
   * @return A list of created {@code ServerRegion}s.
   */
  createLakeRegions(map: Map_, lb: LogBuilder): List<ServerRegion> {
    let lakes = new ArrayList();
    lb.add(['Lakes at:']);
    for (let y = 0; y < map.getHeight(); y++) {
      for (let x = 0; x < map.getWidth(); x++) {
        let tile: Tile;
        if (map.isValid$int$int(x, y) && !(tile = map.getTile$int$int(x, y)).isLand() && map.getTile$int$int(x, y).getRegion() == null) {
          lakes.add(tile);
          lb.add([' ', x, ',', y]);
        }
      }
    }
    lb.add(['\n']);
    return this.makeLakes(map, lakes);
  }
  /**
   * Make lake regions from unassigned lake tiles.
   *
   * @param map The {@code Map} to add to.
   * @param lakes A list of lake {@code Tile}s.
   * @return A list of new {@code ServerRegion}s.
   */
  makeLakes(map: Map_, lakes: List<Tile>): List<ServerRegion> {
    let game = map.getGame();
    let lakeType = map.getSpecification().getTileType('model.tile.lake');
    let todo = new ArrayList($J.idiv(lakes.size(), 10));
    let result = new ArrayList($J.idiv(lakes.size(), 10));
    let lakeCount = 0;
    while (!lakes.isEmpty()) {
      let tile = CollectionUtils.first$Collection(lakes);
      if (tile.getRegion() != null) {
        continue;
      }
      let lakeRegion = new ServerRegion()._ServerRegion$Game$RegionType(game, Region$RegionType.LAKE);
      todo.clear();
      todo.add(tile);
      while (!todo.isEmpty()) {
        let t = todo.removeAt(0);
        if (lakes.contains(t)) {
          t.setRegion(lakeRegion);
          t.setType(lakeType);
          lakes.remove(t);
          for (const $it5 = Direction.allDirections.iterator(); $it5.hasNext(); ) {
            let d = $it5.next();
            let t0 = map.getAdjacentTile$Tile$Direction(t, d);
            if (t0 != null) {
              todo.add(t0);
            }
          }
        }
      }
      result.add(lakeRegion);
    }
    return result;
  }
  /**
   * Adds a terrain bonus with a probability determined by the
   * {@code MapGeneratorOptions}.
   *
   * @param t The {@code Tile} to add bonuses to.
   * @param generateBonus Generate the bonus or not.
   */
  perhapsAddBonus(t: Tile, generateBonus: boolean): void {
    let game = t.getGame();
    let mapOptions = game.getMapGeneratorOptions();
    let spec = game.getSpecification();
    let fishBonusLandType = spec.getTileImprovementType('model.improvement.fishBonusLand');
    let fishBonusRiverType = spec.getTileImprovementType('model.improvement.fishBonusRiver');
    let bonusNumber = mapOptions.getRange(MapGeneratorOptions.BONUS_NUMBER);
    if (t.isLand()) {
      if (generateBonus && this.cache.nextInt$int(100) < bonusNumber) {
        t.addResource(this.createResource(t));
      }
    } else {
      let adjacentLand = 0;
      let adjacentRiver = false;
      for (let direction of Direction.values()) {
        let otherTile = t.getNeighbourOrNull(direction);
        if (otherTile != null && otherTile.isLand()) {
          adjacentLand++;
          if (otherTile.hasRiver()) {
            adjacentRiver = true;
          }
        }
      }
      if (adjacentLand > 2) {
        t.add(new TileImprovement()._TileImprovement$Game$Tile$TileImprovementType$TileImprovementStyle(game, t, fishBonusLandType, null));
      }
      if (adjacentRiver && !t.hasRiver()) {
        t.add(new TileImprovement()._TileImprovement$Game$Tile$TileImprovementType$TileImprovementStyle(game, t, fishBonusRiverType, null));
      }
      if (t.getType().isHighSeasConnected()) {
        if (generateBonus && adjacentLand > 1 && this.cache.nextInt$int((10 - adjacentLand) | 0) === 0) {
          t.addResource(this.createResource(t));
        }
      } else {
        if (this.cache.nextInt$int(100) < bonusNumber) {
          t.addResource(this.createResource(t));
        }
      }
    }
  }
  /**
   * Create a random resource on a tile.
   *
   * @param tile The {@code Tile} to create the resource on.
   * @return The created resource, or null if it is not possible.
   */
  createResource(tile: Tile): Resource {
    if (tile == null) {
      return null;
    }
    let resourceType = RandomChoice.getWeightedRandom$Logger$String$Collection$Random(null, null, tile.getType().getResourceTypes(), this.random);
    if (resourceType == null) {
      return null;
    }
    let minValue = resourceType.getMinValue();
    let maxValue = resourceType.getMaxValue();
    let quantity = (minValue === maxValue) ? maxValue : ((minValue + this.cache.nextInt$int((maxValue - minValue + 1) | 0)) | 0);
    return new Resource()._Resource$Game$Tile$ResourceType$int(tile.getGame(), tile, resourceType, quantity);
  }
  /**
   * Sets the style of the tiles.
   * Only relevant to water tiles for now.
   * Public because it is used in the river generator.
   *
   * @param tile The {@code Tile} to set the style of.
   */
  static encodeStyle(tile: Tile): void {
    let connections = new EnumMap($J.cls(Direction));
    for (const $it6 = Direction.corners.iterator(); $it6.hasNext(); ) {
      let d = $it6.next();
      let t = tile.getNeighbourOrNull(d);
      connections.put(d, t != null && t.isLand());
    }
    for (const $it7 = Direction.longSides.iterator(); $it7.hasNext(); ) {
      let d = $it7.next();
      let t = tile.getNeighbourOrNull(d);
      if (t != null && t.isLand()) {
        connections.put(d, true);
        connections.put(d.getNextDirection(), false);
        connections.put(d.getPreviousDirection(), false);
      } else {
        connections.put(d, false);
      }
    }
    let result = 0;
    let index = 0;
    for (const $it8 = Direction.corners.iterator(); $it8.hasNext(); ) {
      let d = $it8.next();
      if (connections.get(d)) {
        result = (result + $J.d2i($J.pow(2, index))) | 0;
      }
      index++;
    }
    for (const $it9 = Direction.longSides.iterator(); $it9.hasNext(); ) {
      let d = $it9.next();
      if (connections.get(d)) {
        result = (result + $J.d2i($J.pow(2, index))) | 0;
      }
      index++;
    }
    tile.setStyle(result);
  }
  /**
   * Make a {@code Map}.
   *
   * @param game The {@code Game} to generate a map for.
   * @param importMap An optional {@code Map} to import.
   * @param landMap The {@code LandMap} to use as a template.
   * @param lb A {@code LogBuilder} to log to.
   * @return The new {@code Map}.
   */
  generateMap(game: Game, importMap: Map_, landMap: LandMap, lb: LogBuilder): Map_ {
    let mapOptions = game.getMapGeneratorOptions();
    let width = landMap.getWidth();
    let height = landMap.getHeight();
    let importBonuses = (importMap != null) && mapOptions.getBoolean(MapGeneratorOptions.IMPORT_BONUSES);
    let importRumours = (importMap != null) && mapOptions.getBoolean(MapGeneratorOptions.IMPORT_RUMOURS);
    let importTerrain = (importMap != null) && mapOptions.getBoolean(MapGeneratorOptions.IMPORT_TERRAIN);
    let map = new Map_()._Map$Game$int$int(game, width, height);
    game.changeMap(map);
    let minimumLatitude = mapOptions.getInteger(MapGeneratorOptions.MINIMUM_LATITUDE);
    let maximumLatitude = mapOptions.getInteger(MapGeneratorOptions.MAXIMUM_LATITUDE);
    minimumLatitude = this.limitToRange(minimumLatitude, -90, 90);
    maximumLatitude = this.limitToRange(maximumLatitude, -90, 90);
    map.setMinimumLatitude(Math.min(minimumLatitude, maximumLatitude));
    map.setMaximumLatitude(Math.max(minimumLatitude, maximumLatitude));
    let regionMap = new HashMap();
    if (importTerrain) {
      lb.add(['Imported regions: ']);
      for (const $it10 = importMap.getRegions().iterator(); $it10.hasNext(); ) {
        let r = $it10.next();
        let region = new ServerRegion()._ServerRegion$Game$Region(game, r);
        map.addRegion(region);
        regionMap.put(r.getId(), region);
        lb.add([' ', region.toString()]);
      }
      for (const $it11 = importMap.getRegions().iterator(); $it11.hasNext(); ) {
        let r = $it11.next();
        let region = regionMap.get(r.getId());
        let x = r.getParent();
        if (x != null) {
          x = regionMap.get(x.getId());
        }
        region.setParent(x);
        for (const $it12 = r.getChildren().iterator(); $it12.hasNext(); ) {
          let c = $it12.next();
          x = regionMap.get(c.getId());
          if (x != null) {
            region.addChild(x);
          }
        }
      }
      lb.add(['\n']);
    }
    let layer = (importRumours) ? Map$Layer.RUMOURS : (importBonuses) ? Map$Layer.RESOURCES : Map$Layer.RIVERS;
    let fixRegions = new ArrayList();
    map.populateTiles((x, y) => {
      let t: Tile;
      let otherTile = null;
      if (importTerrain && importMap.isValid$int$int(x, y) && (otherTile = importMap.getTile$int$int(x, y)) != null && otherTile.isLand() === landMap.isLand(x, y)) {
        t = map.importTile(otherTile, x, y, layer);
        let r = otherTile.getRegion();
        if (r == null) {
          fixRegions.add(t);
        } else {
          let ours = regionMap.get(r.getId());
          if (ours == null) {
            lb.add(['Could not set tile region ', r.getId(), ' for tile: ', t, '\n']);
            fixRegions.add(t);
          } else {
            ours.addTile(t);
          }
        }
      } else {
        let latitude = map.getLatitude(y);
        let tt = (landMap.isLand(x, y)) ? this.getRandomLandTileType(game, latitude) : this.getRandomOceanTileType(game, latitude);
        t = new Tile()._Tile$Game$TileType$int$int(game, tt, x, y);
      }
      return t;
    });
    let fixed = ServerRegion.requireFixedRegions(map, lb);
    let newRegions = new ArrayList();
    if (importTerrain) {
      if (!fixRegions.isEmpty()) {
        newRegions.addAll(this.createLakeRegions(map, lb));
        newRegions.addAll(this.createLandRegions(map, lb));
      }
    } else {
      map.resetHighSeas(mapOptions.getInteger(MapGeneratorOptions.DISTANCE_TO_HIGH_SEA), mapOptions.getInteger(MapGeneratorOptions.MAXIMUM_DISTANCE_TO_EDGE));
      if (landMap.hasLand()) {
        newRegions.addAll(this.createMountains(map, lb));
        newRegions.addAll(this.createRivers(map, lb));
        newRegions.addAll(this.createLakeRegions(map, lb));
        newRegions.addAll(this.createLandRegions(map, lb));
      }
    }
    lb.shrink('\n');
    let geographic = CollectionUtils.transform$Collection$Predicate(fixed, ($p0) => $p0.isGeographic());
    for (const $it13 = newRegions.iterator(); $it13.hasNext(); ) {
      let sr = $it13.next();
      let gr = CollectionUtils.find$Collection$Predicate(geographic, (g) => g.containsCenter(sr));
      if (gr != null) {
        sr.setParent(gr);
        gr.addChild(sr);
        gr.setSize((gr.getSize() + sr.getSize()) | 0);
      }
      map.addRegion(sr);
    }
    map.fixupRegions();
    if (importMap != null) {
      for (const $it14 = importMap.getGame().getAreas().iterator(); $it14.hasNext(); ) {
        let importMapArea = $it14.next();
        game.addArea(new Area()._Area$Game$Area(game, importMapArea));
      }
    }
    game.generateDefaultAreas();
    map.forEachTile$Consumer((t) => {
      this.perhapsAddBonus(t, !importBonuses);
      if (!t.isLand()) {
        TerrainGenerator.encodeStyle(t);
      }
    });
    map.resetContiguity();
    map.resetHighSeasCount();
    return map;
  }
  static $clinit() {
    TerrainGenerator.logger = Logger.getLogger($J.cls(TerrainGenerator).getName());
  }
}

$J.define(TerrainGenerator, 'net.sf.freecol.server.generator.TerrainGenerator', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.util.Random': '_TerrainGenerator' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Area = $J.load('net.sf.freecol.common.model.Area');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Map$Layer = $J.load('net.sf.freecol.common.model.Map$Layer');
  Region$RegionType = $J.load('net.sf.freecol.common.model.Region$RegionType');
  Resource = $J.load('net.sf.freecol.common.model.Resource');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
  TileType$RangeType = $J.load('net.sf.freecol.common.model.TileType$RangeType');
  MapGeneratorOptions = $J.load('net.sf.freecol.common.option.MapGeneratorOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  RandomUtils$RandomIntCache = $J.load('net.sf.freecol.common.util.RandomUtils$RandomIntCache');
  River = $J.load('net.sf.freecol.server.generator.River');
  ServerRegion = $J.load('net.sf.freecol.server.model.ServerRegion');
});
