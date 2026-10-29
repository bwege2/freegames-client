// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/i18n/NameCache.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, HashMap, JObject, JString, Logger } from '../../../../../../jre/index.ts';

let Messages, Region$RegionType, StringTemplate, RandomUtils, StringUtils;

/**
 * A cache of proper names of various types.
 *
 * Most of these collections auto-initialize when the public accessor
 * is called, but the cities of Cibola are different because they are
 * saved in the Game, and hence requireCitiesOfCibola has to public
 * for generating a new game, and there are clear/add/get routines to
 * allow the the collection to be serialized.
 */
export class NameCache extends JObject {
  static logger: Logger = null;
  /**
   * Default season names to use if nameCache.season.* not found.
   */
  static DEFAULT_SEASON_IDS: string[] = null;
  static readonly CIBOLA_PREFIX: string = 'nameCache.lostCityRumour.cityName.';
  /**
   * Cities of Cibola.
   */
  static cibolaKeys: List<string> = null;
  static cibolaLock: any = null;
  /**
   * Mercenary leaders.
   */
  static mercenaryLeaders: List<string> = null;
  static mercenaryLock: any = null;
  /**
   * Region names and index.
   */
  static regionNames: JMap<string, List<string>> = null;
  static regionNameLock: any = null;
  static regionIndex: JMap<string, number> = null;
  /**
   * Extra river names.
   */
  static riverNames: List<string> = null;
  static riverNameLock: any = null;
  /**
   * Extra rumour names.
   */
  static rumourNothingLock: any = null;
  static rumourNothingKeys: List<string> = null;
  /**
   * Season names.
   */
  static seasonNames: List<string> = null;
  static seasonNamesLock: any = null;
  static seasonNumber: number = 0;
  /**
   * Settlement names.
   */
  static capitalNames: JMap<Player, string> = null;
  static settlementNames: JMap<Player, List<string>> = null;
  static settlementNameLock: any = null;
  /**
   * Ship names.
   */
  static shipNames: JMap<Player, List<string>> = null;
  static shipNameLock: any = null;
  _NameCache(): this {
    return this;
  }
  /**
   * Collects all the names with a given prefix.
   *
   * Note: some collections start at 0, some at 1.
   *
   * @param prefix The prefix to check.
   * @param names A list to fill with the names found.
   */
  static collectNames(prefix: string, names: List<string>): void {
    let name: string;
    if (Messages.containsKey(name = prefix + '0')) {
      names.add(Messages.message$String(name));
    }
    let i = 1;
    while (Messages.containsKey(name = prefix + String(i))) {
      names.add(Messages.message$String(name));
      i++;
    }
  }
  /**
   * Collects all the keys with a given prefix.
   *
   * @param prefix The prefix to check.
   * @param keys A list to fill with the keys found.
   * @param suffix A suffix to add.
   */
  static collectKeys(prefix: string, keys: List<string>, suffix: string): void {
    let key: string;
    for (let i = 0; Messages.containsKey(key = prefix + String(i) + suffix); i++) {
      keys.add(key);
    }
  }
  /**
   * Initialize the cities of Cibola collection.
   *
   * Public for FreeColServer to initialize with a new game.
   *
   * @param random A pseudo-random number source.
   */
  static requireCitiesOfCibola(random: Random): void {
    {
      if (NameCache.cibolaKeys == null) {
        NameCache.cibolaKeys = new ArrayList();
        NameCache.collectNames(NameCache.CIBOLA_PREFIX, NameCache.cibolaKeys);
        let count = NameCache.cibolaKeys.size();
        NameCache.cibolaKeys.clear();
        for (let i = 0; i < count; i++) {
          NameCache.cibolaKeys.add(NameCache.CIBOLA_PREFIX + i);
        }
        RandomUtils.randomShuffle(NameCache.logger, 'Cibola', NameCache.cibolaKeys, random);
      }
    }
  }
  /**
   * Initialize the mercenary leaders collection.
   */
  static requireMercenaryLeaders(): void {
    {
      if (NameCache.mercenaryLeaders == null) {
        NameCache.mercenaryLeaders = new ArrayList();
        NameCache.collectNames('nameCache.mercenaries.', NameCache.mercenaryLeaders);
      }
    }
  }
  /**
   * Make a key for a player and region type.
   *
   * @param player The {@code Player} to install region names for.
   * @param type The {@code RegionType} to get names of.
   * @return A key for the player and region type.
   */
  static makeRegionKey(player: Player, type$: Region$RegionType): string {
    return player.getNationId() + '.region.' + StringUtils.lastPart(type$.getKey(), '.') + '.';
  }
  /**
   * Initialize the region names for a player.
   *
   * @param player The {@code Player} to install region names for.
   * @param type The {@code RegionType} to get names of.
   */
  static requireRegionNames(player: Player, type$: Region$RegionType): void {
    {
      let prefix = NameCache.makeRegionKey(player, type$);
      let names = NameCache.regionNames.get(prefix);
      if (names == null) {
        names = new ArrayList();
        NameCache.collectNames(prefix, names);
        NameCache.regionNames.put(prefix, names);
      }
      let index = NameCache.regionIndex.get(prefix);
      if (index == null) {
        NameCache.regionIndex.put(prefix, (names.size() + 1) | 0);
      }
    }
  }
  /**
   * Initialize the rumourNothing collection.
   */
  static requireRumourNothingKeys(): void {
    {
      if (NameCache.rumourNothingKeys == null) {
        NameCache.rumourNothingKeys = new ArrayList();
        NameCache.collectKeys('model.lostCityRumour.nothing.', NameCache.rumourNothingKeys, Messages.DESCRIPTION_SUFFIX);
      }
    }
  }
  /**
   * Initialize the riverNames collection.
   */
  static requireRiverNames(): void {
    {
      if (NameCache.riverNames == null) {
        NameCache.riverNames = new ArrayList();
        NameCache.collectNames('model.other.region.river.', NameCache.riverNames);
        Collections.shuffle(NameCache.riverNames);
      }
    }
  }
  /**
   * Initialize the seasonNames collection.
   *
   * @return The number of seasons.
   */
  static requireSeasonNames(): number {
    {
      if (NameCache.seasonNames == null) {
        NameCache.seasonNames = new ArrayList();
        NameCache.collectNames('nameCache.season.', NameCache.seasonNames);
        NameCache.seasonNumber = NameCache.seasonNames.size();
        if (NameCache.seasonNumber < 2) {
          NameCache.seasonNames.clear();
          for (let s of NameCache.DEFAULT_SEASON_IDS) {
            NameCache.seasonNames.add(Messages.message$String(s));
          }
          NameCache.seasonNumber = NameCache.seasonNames.size();
        }
      }
      return NameCache.seasonNumber;
    }
  }
  /**
   * Get the nth season name.
   *
   * @param index The index to look up.
   * @return The season name, or null on failure.
   */
  static getSeasonName(index: number): string {
    NameCache.requireSeasonNames();
    if (index >= 0 && index < NameCache.seasonNumber) {
      return NameCache.seasonNames.get(index);
    }
    return Messages.message$StringTemplate(StringTemplate.template$String('nameCache.season.default').addAmount('%number%', (index + 1) | 0));
  }
  /**
   * Initialize the settlement names for a player.
   *
   * @param player The {@code Player} to install names for.
   * @param random A pseudo-random number source.
   */
  static requireSettlementNames(player: Player, random: Random): void {
    {
      if (NameCache.settlementNames.get(player) == null) {
        let names = new ArrayList();
        if (player.isEuropean()) {
          let specId = player.getSpecification().getId();
          let cacheId = player.getNationId() + '.settlementName.' + specId + '.';
          NameCache.collectNames(cacheId, names);
          cacheId = player.getNationId() + '.settlementName.';
          NameCache.collectNames(cacheId, names);
          if (names.isEmpty() && !$J.equals('freecol', specId)) {
            cacheId = player.getNationId() + '.settlementName.freecol.';
            NameCache.collectNames(cacheId, names);
          }
        } else {
          NameCache.collectNames(player.getNationId() + '.settlementName.', names);
          if (!names.isEmpty()) {
            NameCache.capitalNames.put(player, names.removeAt(0));
            if (random != null) {
              RandomUtils.randomShuffle(NameCache.logger, 'Native settlement names', names, random);
            }
          }
        }
        NameCache.settlementNames.put(player, names);
        NameCache.logger.fine('Loaded ' + names.size() + ' settlement names for ' + player.getId());
      }
    }
  }
  /**
   * Initialize the ship names for a player.
   *
   * @param player The {@code Player} to install names for.
   * @param random A pseudo-random number source.
   */
  static requireShipNames(player: Player, random: Random): void {
    {
      let names = NameCache.shipNames.get(player);
      if (names == null) {
        let prefix = player.getNationId() + '.ship.';
        names = new ArrayList();
        NameCache.collectNames(prefix, names);
        if (random != null) {
          RandomUtils.randomShuffle(NameCache.logger, 'Ship names', names, random);
        }
        NameCache.shipNames.put(player, names);
      }
    }
  }
  /**
   * Get the next name for a city of Cibola, removing it from the
   * list of available names.
   *
   * @return A name for a city of Cibola, or null if exhausted.
   */
  static getNextCityOfCibola(): string {
    {
      return (NameCache.cibolaKeys == null || NameCache.cibolaKeys.isEmpty()) ? null : Messages.message$String(NameCache.cibolaKeys.removeAt(0));
    }
  }
  /**
   * Get the current list of available cities of Cibola keys.
   *
   * @return A list of city names.
   */
  static getCitiesOfCibola(): List<string> {
    {
      return (NameCache.cibolaKeys == null) ? Collections.emptyList() : NameCache.cibolaKeys;
    }
  }
  /**
   * Clear the city of Cibola cache.
   */
  static clearCitiesOfCibola(): void {
    {
      if (NameCache.cibolaKeys != null) {
        NameCache.cibolaKeys.clear();
      }
    }
  }
  /**
   * Add a key for a city of Cibola.
   *
   * @param key The key to add.
   */
  static addCityOfCibola(key: string): void {
    {
      if (NameCache.cibolaKeys == null) {
        NameCache.cibolaKeys = new ArrayList();
      }
      NameCache.cibolaKeys.add(key);
    }
  }
  /**
   * Get a random mercenary leader index.
   *
   * @param random A pseudo-random number source.
   * @return The index of a random mercenary leader.
   */
  static getMercenaryLeaderIndex(random: Random): number {
    NameCache.requireMercenaryLeaders();
    let n: number;
    {
      n = NameCache.mercenaryLeaders.size();
    }
    return RandomUtils.randomInt(NameCache.logger, 'Mercenary leader', random, n);
  }
  /**
   * Get a mercenary leader name by index.
   *
   * @param index The index to look up.
   * @return The mercenary leader name.
   */
  static getMercenaryLeaderName(index: number): string {
    NameCache.requireMercenaryLeaders();
    {
      return NameCache.mercenaryLeaders.get(index);
    }
  }
  /**
   * Get the new land name for a player.
   *
   * @param player The {@code Player} to query.
   * @return The new land name of a player.
   */
  static getNewLandName(player: Player): string {
    return (player.getNewLandName() == null) ? Messages.message$String(player.getNationId() + '.newLandName') : player.getNewLandName();
  }
  /**
   * Creates a unique region name for a player by fetching a new
   * name from the list of default names if possible.
   *
   * @param player The {@code Player} to find a region name for.
   * @param region The {@code Region} to name.
   * @return A suitable name.
   */
  static getRegionName(player: Player, region: Region): string {
    if (region.hasName()) {
      return Messages.message$StringTemplate(region.getLabel());
    }
    let map = player.getGame().getMap();
    let name: string;
    let index: number;
    let prefix = NameCache.makeRegionKey(player, region.getType());
    NameCache.requireRegionNames(player, region.getType());
    {
      let names = NameCache.regionNames.get(prefix);
      while (!names.isEmpty()) {
        name = names.removeAt(0);
        if (map.getRegionByName(name) == null) {
          return name;
        }
      }
    }
    if (region.getType() === Region$RegionType.RIVER) {
      NameCache.requireRiverNames();
      {
        while (!NameCache.riverNames.isEmpty()) {
          name = NameCache.riverNames.removeAt(0);
          if (map.getRegionByName(name) == null) {
            return name;
          }
        }
      }
    }
    {
      index = NameCache.regionIndex.get(prefix);
    }
    let nn = player.getNationLabel();
    do {
      name = Messages.message$StringTemplate(StringTemplate.label(' ').addStringTemplate$StringTemplate(nn).addNamed$Named(region.getType()).addName$String(String(index)));
      index++;
    } while (map.getRegionByName(name) != null);
    {
      NameCache.regionIndex.put(prefix, index);
    }
    return name;
  }
  /**
   * Get a random "nothing" rumour key.
   *
   * @param random A pseudo-random number source.
   * @return A suitable message key.
   */
  static getRumourNothingKey(random: Random): string {
    NameCache.requireRumourNothingKeys();
    {
      return RandomUtils.getRandomMember$Logger$String$List$Random(NameCache.logger, 'nothingKey', NameCache.rumourNothingKeys, random);
    }
  }
  /**
   * Get a fallback settlement name for a player.
   *
   * @param player The {@code Player} to get a fallback
   *     settlement name for.
   * @return A unique fallback settlement name for the player.
   */
  static getFallbackSettlementName(player: Player): string {
    return (Messages.message$String((player.isEuropean()) ? 'nameCache.base.colony' : 'nameCache.base.settlement')) + '-';
  }
  /**
   * Get the name of this players capital.  Only meaningful to natives.
   *
   * @param player The {@code Player} to get a capital name for.
   * @param random An optional pseudo-random number source.
   * @return The name of this players capital.
   */
  static getCapitalName(player: Player, random: Random): string {
    NameCache.requireSettlementNames(player, random);
    {
      return NameCache.capitalNames.get(player);
    }
  }
  /**
   * Get a settlement name suitable for a player.
   *
   * @param player The {@code Player} to get a settlement name for.
   * @param random An optional pseudo-random number source.
   * @return A new settlement name.
   */
  static getSettlementName(player: Player, random: Random): string {
    NameCache.requireSettlementNames(player, random);
    let game = player.getGame();
    {
      let names = NameCache.settlementNames.get(player);
      while (!names.isEmpty()) {
        let name = names.removeAt(0);
        if (game.getSettlementByName(name) == null) {
          return name;
        }
      }
    }
    let base = NameCache.getFallbackSettlementName(player);
    let i = (player.getSettlementCount() + 1) | 0;
    let name = null;
    while (game.getSettlementByName(name = base + i++) != null) {
    }
    return name;
  }
  /**
   * Puts a suggested settlement name back into the pool.
   *
   * @param player The {@code Player} returning the settlement name.
   * @param name A formerly suggested settlement name.
   */
  static putSettlementName(player: Player, name: string): void {
    if (!name.startsWith(NameCache.getFallbackSettlementName(player))) {
      NameCache.requireSettlementNames(player, null);
      {
        let names = NameCache.settlementNames.get(player);
        names.add(name);
      }
    }
  }
  /**
   * Get a new default trade route name for a player.
   *
   * @param player The {@code Player} to get the name for.
   * @return A new trade route name.
   */
  static getTradeRouteName(player: Player): string {
    let base = Messages.message$String('nameCache.base.tradeRoute');
    if (player.getTradeRouteByName(base, null) == null) {
      return base;
    }
    let name: string;
    let i = 1;
    while (player.getTradeRouteByName(name = base + i++, null) != null) {
    }
    return name;
  }
  /**
   * Gets a new name for a unit.
   *
   * Currently only names naval units, not specific to type.
   * REF ships should not be named.
   * FIXME: specific names for types.
   *
   * @param player The {@code Player} who will own the unit.
   * @param type The {@code UnitType} to choose a name for.
   * @param random A pseudo-random number source.
   * @return A name for the unit, or null if not available.
   */
  static getUnitName(player: Player, type$: UnitType, random: Random): string {
    if (!type$.isNaval() || player.isREF()) {
      return null;
    }
    let name: string;
    NameCache.requireShipNames(player, random);
    {
      let names = NameCache.shipNames.get(player);
      while (!names.isEmpty()) {
        name = names.removeAt(0);
        if (player.getUnitByName(name) == null) {
          return name;
        }
      }
    }
    let base = Messages.message$String('nameCache.base.ship') + '-';
    let i = 1;
    while (player.getUnitByName(name = base + i++) != null) {
    }
    return name;
  }
  static $clinit() {
    NameCache.logger = Logger.getLogger($J.cls(NameCache).getName());
    NameCache.DEFAULT_SEASON_IDS = ['model.season.spring.name', 'model.season.autumn.name'];
    NameCache.cibolaKeys = null;
    NameCache.cibolaLock = new JObject();
    NameCache.mercenaryLeaders = null;
    NameCache.mercenaryLock = new JObject();
    NameCache.regionNames = new HashMap();
    NameCache.regionNameLock = new JObject();
    NameCache.regionIndex = new HashMap();
    NameCache.riverNames = null;
    NameCache.riverNameLock = new JObject();
    NameCache.rumourNothingLock = new JObject();
    NameCache.rumourNothingKeys = null;
    NameCache.seasonNames = null;
    NameCache.seasonNamesLock = new JObject();
    NameCache.seasonNumber = 0;
    NameCache.capitalNames = new HashMap();
    NameCache.settlementNames = new HashMap();
    NameCache.settlementNameLock = new JObject();
    NameCache.shipNames = new HashMap();
    NameCache.shipNameLock = new JObject();
  }
}

$J.define(NameCache, 'net.sf.freecol.common.i18n.NameCache', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_NameCache' }, clinit: true, lazy: ['logger', 'DEFAULT_SEASON_IDS', 'cibolaKeys', 'cibolaLock', 'mercenaryLeaders', 'mercenaryLock', 'regionNames', 'regionNameLock', 'regionIndex', 'riverNames', 'riverNameLock', 'rumourNothingLock', 'rumourNothingKeys', 'seasonNames', 'seasonNamesLock', 'seasonNumber', 'capitalNames', 'settlementNames', 'settlementNameLock', 'shipNames', 'shipNameLock'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Region$RegionType = $J.load('net.sf.freecol.common.model.Region$RegionType');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
