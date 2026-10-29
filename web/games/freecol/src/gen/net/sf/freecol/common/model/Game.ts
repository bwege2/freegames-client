// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Game.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, ClassCastException, Exception, HashMap, IllegalArgumentException, JEnum, JObject, JString, Level, Logger, NoSuchElementException, Runtime, RuntimeException, StringReader, UUID, WeakReference, XMLStreamException } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let FreeColDebugger, NameCache, FreeColXMLReader, Ability, Area, Building, Colony, ColonyTile, Europe, FreeColObject, FreeColSpecObject, HighSeas, HitpointsCombatModel, IndianSettlement, Location, Map_, NationOptions, NationOptions$NationState, Player, Region, SimpleCombatModel, Specification, Tile, Turn, Unit, CollectionUtils, Introspector, Introspector$IntrospectorException, StringUtils, Utils, ServerBuilding, ServerColony, ServerColonyTile, ServerEurope, ServerGame, ServerIndianSettlement, ServerPlayer, ServerRegion, ServerUnit;

/**
 * The main component of the game model.
 */
export class Game extends FreeColGameObject {
  static logger: Logger = null;
  static readonly TAG: string = 'game';
  /**
   * Map of all classes with corresponding server classes.
   */
  static serverClasses: JMap<JClass<FreeColObject>, JClass<FreeColObject>> = null;
  /**
   * Map of class name to class for the location classes, to speed
   * up game loading.
   */
  static locationClasses: JMap<string, JClass<FreeColGameObject>> = null;
  /**
   * The Specification this game uses.
   */
  specification: Specification = null;
  /**
   * The next available identifier that can be given to a new
   * {@code FreeColGameObject}.
   */
  nextId: number = 0;
  /**
   * Game UUID, persistent in savegame files
   */
  uuid: UUID = null;
  /**
   * The client player name, null in the server.
   */
  clientUserName: string = null;
  /**
   * All the players in the game.
   */
  players: List<Player> = null;
  /**
   * A virtual player to use for enemy privateers.
   */
  unknownEnemy: Player = null;
  /**
   * The map of the New World.
   */
  map_: Map_ = null;
  /**
   * Areas are collections of tiles that can be identified using the
   * area's ID. Areas may overlap.
   */
  areas: JMap<string, Area> = null;
  /**
   * The current nation options.  Mainly used to see if a player
   * nation is available.
   */
  nationOptions: NationOptions = null;
  /**
   * The player whose turn it is.
   */
  currentPlayer: Player = null;
  /**
   * The current turn.
   */
  turn: Turn = null;
  /**
   * Whether the War of Spanish Succession has already taken place.
   */
  spanishSuccession: boolean = false;
  /**
   * Initial active unit identifier.
   */
  initialActiveUnitId: string = null;
  /**
   * References to all objects created in this game.
   * Serialization is not needed directly as these must be completely
   * within { players, unknownEnemy, map } which are directly serialized.
   */
  freeColGameObjects: HashMap<string, WeakReference<FreeColGameObject>> = null;
  /**
   * The number of removed FCGOs that should trigger a cache clean.
   */
  static readonly REMOVE_GC_THRESHOLD: number = 64;
  /**
   * The number of FCGOs removed since last cache clean.
   */
  removeCount: number = 0;
  /**
   * A FreeColGameObjectListener to watch the objects in the game.
   * Usually this is the AIMain instance.
   * FIXME: is this better done with a property change listener?
   */
  freeColGameObjectListener: FreeColGameObjectListener = null;
  static readonly AREAS_TAG: string = 'areas';
  static readonly CIBOLA_TAG: string = 'cibola';
  static readonly CLIENT_USER_NAME_TAG: string = 'clientUserName';
  static readonly CURRENT_PLAYER_TAG: string = 'currentPlayer';
  static readonly INITIAL_ACTIVE_UNIT_ID: string = 'initialActiveUnitId';
  static readonly NEXT_ID_TAG: string = 'nextId';
  static readonly SPANISH_SUCCESSION_TAG: string = 'spanishSuccession';
  static readonly TURN_TAG: string = 'turn';
  static readonly UUID_TAG: string = 'UUID';
  $init_Game() {
    this.specification = null;
    this.nextId = 1;
    this.uuid = UUID.randomUUID();
    this.players = new ArrayList();
    this.unknownEnemy = null;
    this.map_ = null;
    this.areas = new HashMap();
    this.nationOptions = null;
    this.currentPlayer = null;
    this.turn = new Turn()._Turn(1);
    this.spanishSuccession = false;
    this.initialActiveUnitId = null;
    this.removeCount = 0;
    this.freeColGameObjectListener = null;
  }
  /**
   * Root constructor for games.
   *
   * Game.newInstance uses this so it must be public.
   */
  _Game$(): this {
    this._FreeColGameObject$();
    this.$init_Game();
    this.freeColGameObjects = new HashMap(10000);
    this.internId('0');
    this.clientUserName = null;
    this.players.clear();
    this.unknownEnemy = null;
    this.map_ = null;
    this.nationOptions = null;
    this.currentPlayer = null;
    this.spanishSuccession = false;
    this.initialActiveUnitId = null;
    this.specification = null;
    this.removeCount = 0;
    this.initialized = true;
    return this;
  }
  /**
   * Constructor used by the ServerGame constructor.
   *
   * @param specification The {@code Specification} for this game.
   */
  _Game$Specification(specification: Specification): this {
    this._Game$();
    this.setSpecification(specification);
    return this;
  }
  /**
   * Creates a new {@code Game} instance from a stream.
   *
   * @param game A base {@code Game} (not used here, this is a very
   *     special case).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if an error occurs
   */
  _Game$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._Game$();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Special update handler for the pre-game update.
   *
   * When starting a new game the server sends an update that
   * contains the game map.  This must be synchronized so that the
   * client does not race ahead and launch into the game before the
   * update completes.
   *
   * We used to check integrity here, but 1) the server has already
   * done that and 2) the unexplored Tiles have no type which makes
   * a lot of integrity failures.
   *
   * @param game The update for this {@code Game}.
   * @return True if the update succeeds.
   */
  preGameUpdate(game: Game): boolean {
    return this.copyIn(game);
  }
  /**
   * Instantiate an uninitialized FreeColGameObject within a game.
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to instantiate in.
   * @param returnClass The required {@code FreeColObject} class.
   * @param server Create a server object if possible.
   * @return The new uninitialized object, or null on error.
   */
  static newInstance<T>(game: Game, returnClass: JClass<T>, server: boolean): T {
    if (server) {
      let sc = Game.serverClasses.get(returnClass);
      if (sc != null) {
        returnClass = sc;
      }
    }
    try {
      return Introspector.instantiate$Class$ClassArr$ObjectArr(returnClass, [$J.cls(Game), $J.cls(JString)], [game, null]);
    } catch ($e0) {
      if ($J.isa($e0, Introspector$IntrospectorException)) {
        let ex = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
    if (game != null && $J.cls(FreeColSpecObject).isAssignableFrom(returnClass)) {
      try {
        return Introspector.instantiate$Class$ClassArr$ObjectArr(returnClass, [$J.cls(Specification)], [game.getSpecification()]);
      } catch ($e1) {
        if ($J.isa($e1, Introspector$IntrospectorException)) {
          let ex = $J.exc($e1);
          Game.logger.log(Level.WARNING, 'newInstance(spec) fail for: ' + returnClass.getName(), ex);
        } else {
          throw $e1;
        }
      }
    } else {
      try {
        return Introspector.instantiate$Class$ClassArr$ObjectArr(returnClass, [], []);
      } catch ($e2) {
        if ($J.isa($e2, Introspector$IntrospectorException)) {
          let ex = $J.exc($e2);
          Game.logger.log(Level.WARNING, 'newInstance(trivial) fail for: ' + returnClass.getName(), ex);
        } else {
          throw $e2;
        }
      }
    }
    return null;
  }
  /**
   * Get the difficulty level of this game.
   *
   * @return An {@code OptionGroup} containing the difficulty settings.
   */
  getDifficultyOptionGroup(): OptionGroup {
    return this.specification.getDifficultyOptionGroup$();
  }
  /**
   * Gets the game options associated with this game.
   *
   * @return An {@code OptionGroup} containing the game options.
   */
  getGameOptions(): OptionGroup {
    return this.specification.getGameOptions();
  }
  /**
   * Sets the game options associated with this game.
   *
   * @param go An {@code OptionGroup} containing the game options.
   */
  setGameOptions(go: OptionGroup): void {
    this.specification.setGameOptions(go);
  }
  /**
   * Gets the map generator options associated with this game.
   *
   * @return An {@code OptionGroup} containing the map
   *     generator options.
   */
  getMapGeneratorOptions(): OptionGroup {
    return this.specification.getMapGeneratorOptions();
  }
  /**
   * Sets the map generator options associated with this game.
   *
   * @param mgo An {@code OptionGroup} containing the map
   *     generator options.
   */
  setMapGeneratorOptions(mgo: OptionGroup): void {
    this.specification.setMapGeneratorOptions(mgo);
  }
  /**
   * Stub for routine only meaningful in the server.
   *
   * @return Nothing.
   */
  getNextId(): number {
    throw new RuntimeException('game.getNextId not implemented: ' + $J.str(this));
  }
  /**
   * Gets the {@code FreeColGameObject} with the given identifier.
   *
   * @param id The object identifier.
   * @return The game object, or null if not found.
   */
  getFreeColGameObject$String(id: string): FreeColGameObject {
    if (id == null || (id.length === 0)) {
      return null;
    }
    let ro: WeakReference<FreeColGameObject>;
    {
      ro = this.freeColGameObjects.get(id);
    }
    if (ro == null) {
      return null;
    }
    let o = ro.get();
    if (o == null) {
      this.removeFreeColGameObject(id, 'missed');
      return null;
    }
    return o;
  }
  /**
   * Gets the {@code FreeColGameObject} with the specified
   * identifier and class.
   *
   * @param <T> The actual return type.
   * @param id The object identifier.
   * @param returnClass The expected class of the object.
   * @return The game object, or null if not found.
   */
  getFreeColGameObject$String$Class<T>(id: string, returnClass: JClass<T>): T {
    let fcgo = this.getFreeColGameObject$String(id);
    try {
      return returnClass.cast(fcgo);
    } catch ($e3) {
      if ($J.isa($e3, ClassCastException)) {
        let e = $J.exc($e3);
        return null;
      } else {
        throw $e3;
      }
    }
  }
  /**
   * Set the mapping between object identifier and object.
   *
   * @param id The object identifier.
   * @param fcgo The {@code FreeColGameObject} to add to this {@code Game}.
   */
  setFreeColGameObject(id: string, fcgo: FreeColGameObject): void {
    if (id == null || (id.length === 0)) {
      throw new RuntimeException('Null/empty identifier: ' + $J.str(this));
    } else if (fcgo == null) {
      throw new RuntimeException('Null FreeColGameObject: ' + id);
    }
    let wr = new WeakReference(fcgo);
    {
      this.freeColGameObjects.put(id, wr);
    }
  }
  /**
   * Add a new {@code FreeColGameObject} with a given identifier.
   *
   * @param id The object identifier.
   * @param fcgo The {@code FreeColGameObject} to add to this {@code Game}.
   */
  addFreeColGameObject(id: string, fcgo: FreeColGameObject): void {
    if (id == null || (id.length === 0)) {
      throw new RuntimeException('Null/empty identifier: ' + $J.str(this));
    } else if (fcgo == null) {
      throw new RuntimeException('Null FreeColGameObject: ' + id);
    }
    let old = this.getFreeColGameObject$String(id);
    if (old != null) {
      throw new RuntimeException('Tried to replace FCGO ' + id + ' : ' + $J.str(old.getClass()) + ' with ' + fcgo.getId() + ' : ' + $J.str(fcgo.getClass()));
    }
    this.setFreeColGameObject(id, fcgo);
    this.notifySetFreeColGameObject(id, fcgo);
  }
  /**
   * Removes the {@code FreeColGameObject} with the specified
   * identifier.
   *
   * @param id The object identifier.
   * @param reason A reason to remove the object.
   * @exception IllegalArgumentException If the identifier is null or empty.
   */
  removeFreeColGameObject(id: string, reason: string): void {
    if (id == null || (id.length === 0)) {
      throw new RuntimeException('Null/empty identifier: ' + $J.str(this));
    }
    Game.logger.finest('removeFCGO/' + reason + ': ' + id);
    this.notifyRemoveFreeColGameObject(id);
    {
      this.freeColGameObjects.remove(id);
    }
    if (++this.removeCount > Game.REMOVE_GC_THRESHOLD) {
      {
        let iter = this.getFreeColGameObjectIterator();
        while (iter.hasNext()) {
          iter.next();
        }
      }
      this.removeCount = 0;
    }
  }
  /**
   * Update a {@code FreeColGameObject} from another.
   *
   * @param <T> The type of object to update.
   * @param other The other object.
   * @param create If true, create the object if it is missing.
   * @return The resulting object after update.
   */
  update$FreeColGameObject$boolean<T>(other: T, create: boolean): T {
    return (other == null) ? null : this.update$FreeColGameObject$Class$boolean$Game(other, other.getFreeColObjectClass(), create);
  }
  /**
   * Update a {@code FreeColGameObject} from another, optionally allowing
   * missing objects to be created.
   *
   * @param <T> The type of object to update.
   * @param other The other object.
   * @param returnClass The expected class of the object.
   * @param create If true, create missing objects.
   * @return The resulting object after update.
   */
  update$FreeColGameObject$Class$boolean$Game<T>(other: T, returnClass: JClass<T>, create: boolean): T {
    if (other == null) {
      return null;
    }
    let id = other.getId();
    let fcgo = this.getFreeColGameObject$String(id);
    if (fcgo == null) {
      if (create) {
        fcgo = Game.newInstance(this, returnClass, false);
        fcgo.setId(id);
      } else {
        Game.logger.warning('Update of missing object: ' + id + '\n' + FreeColDebugger.stackTraceToString$());
        return null;
      }
    }
    let t: T;
    try {
      t = returnClass.cast(fcgo);
    } catch ($e4) {
      if ($J.isa($e4, ClassCastException)) {
        let cce = $J.exc($e4);
        throw new RuntimeException('Update class clash: ' + $J.str(fcgo.getClass()) + ' / ' + $J.str(returnClass), cce);
      } else {
        throw $e4;
      }
    }
    if (!t.copyIn(other)) {
      throw new RuntimeException('Update copy failed: ' + id + ' onto ' + $J.str(t));
    }
    if (create) {
      t.internId(id);
    }
    return t;
  }
  /**
   * Convenience wrapper to update several {@code FreeColGameObject}s.
   *
   * @param <T> The type of object to update.
   * @param other The collection of objects to update.
   * @param create If true, create missing objects.
   * @return The resulting list of updated objects.
   */
  update$Collection$boolean<T>(other: Collection<T>, create: boolean): List<T> {
    if (other == null) {
      return null;
    }
    let ret = new ArrayList();
    for (const $it5 = other.iterator(); $it5.hasNext(); ) {
      let t = $it5.next();
      let nt = this.update$FreeColGameObject$boolean(t, create);
      if (nt != null) {
        ret.add(nt);
      }
    }
    return ret;
  }
  /**
   * Update a {@code FreeColGameObject} from a reference to it in an update.
   *
   * @param <T> The type of object to update.
   * @param other The other object.
   * @return The resulting object after update.
   */
  updateRef$FreeColGameObject<T>(other: T): T {
    return (other == null) ? null : this.updateRef$FreeColGameObject$Class$Game(other, other.getFreeColObjectClass());
  }
  /**
   * Update a {@code FreeColGameObject} from a reference to it in an update.
   *
   * @param <T> The type of object to update.
   * @param other The other object.
   * @param returnClass The expected class of the object.
   * @return The resulting object after update.
   */
  updateRef$FreeColGameObject$Class$Game<T>(other: T, returnClass: JClass<T>): T {
    if (other == null) {
      return null;
    }
    let id = other.getId();
    return this.getFreeColGameObject$String$Class(id, returnClass);
  }
  /**
   * Update several {@code FreeColGameObject}s from a list of
   * references to it in an update.
   *
   * @param <T> The type of object to update.
   * @param other The other object.
   * @return The resulting object after update.
   */
  updateRef$Collection<T>(other: Collection<T>): List<T> {
    if (other == null) {
      return null;
    }
    let ret = new ArrayList();
    for (const $it6 = other.iterator(); $it6.hasNext(); ) {
      let t = $it6.next();
      let nt = this.updateRef$FreeColGameObject(t);
      if (nt != null) {
        ret.add(nt);
      }
    }
    return ret;
  }
  /**
   * Update a {@code Location} from a reference to it in an update.
   *
   * @param loc The {@code Location}.
   * @return The resulting location after update.
   */
  updateLocationRef(loc: Location): Location {
    return (loc == null) ? null : this.findFreeColLocation(loc.getId());
  }
  /**
   * Convenience wrapper to find a location (which is an interface,
   * precluding using the typed version of getFreeColGameObject())
   * by identifier.
   *
   * Use this routine when the object should already be present in the game.
   *
   * @param id The object identifier.
   * @return The {@code Location} if any.
   */
  findFreeColLocation(id: string): Location {
    let fcgo = this.getFreeColGameObject$String(id);
    return ($J.isa(fcgo, Location)) ? fcgo : null;
  }
  /**
   * Gets an {@code Iterator} over every registered
   * {@code FreeColGameObject}.
   *
   * This {@code Iterator} should be iterated once in a while
   * since it cleans the {@code FreeColGameObject} cache.  Very
   * few routines call this any more, so there is a thresholded call
   * in removeFreeColGameObject to ensure the cache is still
   * cleaned.  Reconsider this if the situation changes.
   *
   * Lock freeColGameObjects when using this.
   *
   * @return An {@code Iterator} containing every registered
   *     {@code FreeColGameObject}.
   */
  getFreeColGameObjectIterator(): Iterator<FreeColGameObject> {
    return new (Game$1())().$o(this).$init_anon();
  }
  /**
   * Get a list of all the {@code FreeColGameObjects}.
   *
   * @return A suitable list.
   */
  getFreeColGameObjectList(): List<FreeColGameObject> {
    let ret = new ArrayList();
    {
      let iter = this.getFreeColGameObjectIterator();
      while (iter.hasNext()) {
        ret.add(iter.next());
      }
    }
    return ret;
  }
  /**
   * Gets the unique identifier for this game. 
   * A game UUID persists in save game files.
   *
   * @return The game {@code UUID}.
   */
  getUUID(): UUID {
    return this.uuid;
  }
  /**
   * Get players in the game.
   *
   * @param predicate A {@code Predicate} to select suitable players with.
   * @return A list of {@code Player}s.
   */
  getPlayerList(predicate: Predicate<any>): List<Player> {
    {
      return CollectionUtils.transform$Collection$Predicate(this.players, predicate);
    }
  }
  /**
   * Get players in the game.
   *
   * @param predicate A {@code Predicate} to select suitable players with.
   * @return The stream of {@code Player}s.
   */
  getPlayers(predicate: Predicate<any>): Stream<Player> {
    {
      return this.getPlayerList(predicate).stream();
    }
  }
  /**
   * Get a particular player in the game by a predicate.
   *
   * @param predicate A {@code Predicate} to select suitable players with.
   * @return The {@code Player} found or null if not present.
   */
  getPlayer(predicate: Predicate<any>): Player {
    {
      return CollectionUtils.find$Collection$Predicate(this.players, predicate);
    }
  }
  /**
   * Set the players in the game.
   *
   * @param players The new {@code Player}s to add.
   */
  setPlayers(players: List<Player>): void {
    {
      this.players.clear();
      if (players != null) {
        this.players.addAll(players);
      }
    }
  }
  /**
   * Gets the live player after the given player.
   *
   * @param beforePlayer The {@code Player} before the
   *     {@code Player} to be returned.
   * @return The {@code Player} after the {@code beforePlayer}
   *     in the list which determines the order each player becomes the
   *     current player.
   * @see #getNextPlayer
   */
  getPlayerAfter(beforePlayer: Player): Player {
    {
      if (this.players.isEmpty()) {
        return null;
      }
      let start = this.players.indexOf(beforePlayer);
      let index = start;
      do {
        if (++index >= this.players.size()) {
          index = 0;
        }
        let player = this.players.get(index);
        if (!player.isUnknownEnemy() && !player.isDead()) {
          return player;
        }
      } while (index !== start);
    }
    return null;
  }
  /**
   * Adds the specified player to the game.
   *
   * @param player The {@code Player} to add.
   */
  addPlayer(player: Player): void {
    {
      if (!this.players.contains(player)) {
        this.players.add(player);
      }
    }
    let nation = this.getSpecification().getNation(player.getNationId());
    this.nationOptions.getNations().put(nation, NationOptions$NationState.NOT_AVAILABLE);
  }
  /**
   * Removes the specified player from the game.
   *
   * We do not really remove the full FCGO from the game, just from the
   * active players list.
   *
   * @param player The {@code Player} to remove.
   * @return True if the player was removed.
   */
  removePlayer(player: Player): boolean {
    let newCurrent = (this.currentPlayer !== player) ? null : this.getPlayerAfter(this.currentPlayer);
    {
      if (!this.players.remove(player)) {
        return false;
      }
    }
    let nation = this.getSpecification().getNation(player.getNationId());
    this.nationOptions.getNations().put(nation, NationOptions$NationState.AVAILABLE);
    player.dispose();
    if (newCurrent != null) {
      this.currentPlayer = newCurrent;
    }
    return true;
  }
  /**
   * Get the first player in this game.
   *
   * @return The first player, or null if none present.
   */
  getFirstPlayer(): Player {
    {
      return CollectionUtils.first$Collection(this.players);
    }
  }
  /**
   * Sort the players list.
   *
   * @param comparator The {@code Comparator} to sort with.
   */
  sortPlayers(comparator: Comparator<Player>): void {
    {
      this.players.sort(comparator);
    }
  }
  /**
   * Gets a player specified by a name.
   *
   * @param name The name identifying the {@code Player}.
   * @return The {@code Player} or null if none found.
   */
  getPlayerByName(name: string): Player {
    return this.getPlayer(CollectionUtils.matchKeyEquals$Object$Function(name, ($p0) => $p0.getName()));
  }
  /**
   * Get a {@code Player} identified by its nation.
   *
   * @param nation The {@code Nation} to search for.
   * @return The {@code Player} of the given nation, or null if
   *     not found.
   */
  getPlayerByNation(nation: Nation): Player {
    return this.getPlayerByNationId(nation.getId());
  }
  /**
   * Get a {@code Player} identified by its nation identifier.
   *
   * @param nationId The nation identifier to search for.
   * @return The {@code Player} of the given nation, or null if
   *     not found.
   */
  getPlayerByNationId(nationId: string): Player {
    return this.getPlayer(CollectionUtils.matchKeyEquals$Object$Function(nationId, ($p0) => $p0.getNationId()));
  }
  /**
   * Get a list of the live players in the game, optionally
   * excluding supplied ones.
   *
   * @param exclude The {@code Player}s to exclude.
   * @return A list of live {@code Player}s, without the excluded ones.
   */
  getLivePlayerList(exclude: Player[]): List<Player> {
    let livePred = (p) => !p.isUnknownEnemy() && !p.isDead() && !CollectionUtils.any$ObjectArr$Predicate(exclude, CollectionUtils.matchKey$Object(p));
    return this.getPlayerList(livePred);
  }
  /**
   * Get a stream of the live players in the game, optionally excluding
   * supplied ones.
   *
   * @param exclude The {@code Player}s to exclude.
   * @return A stream of live {@code Player}s, without the
   *     excluded ones.
   */
  getLivePlayers(exclude: Player[]): Stream<Player> {
    return this.getLivePlayerList(exclude).stream();
  }
  /**
   * Get a list of the live European players in this game.
   *
   * @param exclude {@code Player}s to exclude.
   * @return A list of live European {@code Player}s in this game,
   *     without the excluded ones.
   */
  getLiveEuropeanPlayerList(exclude: Player[]): List<Player> {
    let europeanPred = (p) => !p.isUnknownEnemy() && !p.isDead() && p.isEuropean() && !CollectionUtils.any$ObjectArr$Predicate(exclude, CollectionUtils.matchKey$Object(p));
    return this.getPlayerList(europeanPred);
  }
  /**
   * Get a stream of the live European players in this game.
   *
   * @param exclude {@code Player}s to exclude.
   * @return A stream of live European {@code Player}s in this game,
   *     without the excluded ones.
   */
  getLiveEuropeanPlayers(exclude: Player[]): Stream<Player> {
    return this.getLiveEuropeanPlayerList(exclude).stream();
  }
  /**
   * Get a list of the live native players in this game.
   *
   * @param exclude {@code Player}s to exclude.
   * @return A list of live native {@code Player}s in this game.
   */
  getLiveNativePlayerList(exclude: Player[]): List<Player> {
    let nativePred = (p) => !p.isUnknownEnemy() && !p.isDead() && p.isIndian() && !CollectionUtils.any$ObjectArr$Predicate(exclude, CollectionUtils.matchKey$Object(p));
    return this.getPlayerList(nativePred);
  }
  /**
   * Get a stream of the live native players in this game.
   *
   * @param exclude {@code Player}s to exclude.
   * @return A stream of live native {@code Player}s in this game.
   */
  getLiveNativePlayers(exclude: Player[]): Stream<Player> {
    return this.getLiveNativePlayerList(exclude).stream();
  }
  /**
   * Gets the next current player.
   *
   * @return The {@code Player} whose turn follows the current player.
   */
  getNextPlayer(): Player {
    return this.getPlayerAfter(this.currentPlayer);
  }
  /**
   * Add a list of players to this game.
   *
   * Called from the pre and in-game controllers when players change.
   * ATM we never remove players, even dead ones.  Must tolerate player
   * being both present and not present.
   *
   * @param players The list of {@code players} to add.
   */
  addPlayers(players: List<Player>): void {
    let valid = new ArrayList();
    for (const $it7 = players.iterator(); $it7.hasNext(); ) {
      let p = $it7.next();
      let fcgo = this.getFreeColGameObject$String(p.getId());
      if (fcgo == null) {
        if ((fcgo = this.update$FreeColGameObject$Class$boolean$Game(p, $J.cls(Player), true)) != null) {
          this.addPlayer(fcgo);
          Game.logger.finest('addPlayers added new: ' + $J.str(fcgo));
        } else {
          Game.logger.warning('addPlayers create new fail: ' + $J.str(p));
        }
      } else if (fcgo instanceof Player) {
        if (fcgo.copyIn(p)) {
          Game.logger.finest('addPlayers copied in: ' + $J.str(fcgo));
        } else {
          Game.logger.warning('addPlayers copyIn existing fail: ' + $J.str(p));
        }
      } else {
        Game.logger.warning('addPlayers onto non-player: ' + $J.str(fcgo));
      }
    }
  }
  /**
   * Gets the unknown enemy player, which is used for privateers.
   *
   * @return The unknown enemy {@code Player}.
   */
  getUnknownEnemy(): Player {
    return this.unknownEnemy;
  }
  /**
   * Sets the unknown enemy player.
   *
   * @param player The {@code Player} to serve as the unknown enemy.
   */
  setUnknownEnemy(player: Player): void {
    this.unknownEnemy = player;
  }
  /**
   * Get the client user name.
   *
   * @return The client user name.
   */
  getClientUserName(): string {
    return this.clientUserName;
  }
  /**
   * Are we executing in a client?
   *
   * @return True in a client.
   */
  isInClient(): boolean {
    return this.clientUserName != null;
  }
  /**
   * Are we executing in the server?
   *
   * @return True in the server.
   */
  isInServer(): boolean {
    return this.clientUserName == null;
  }
  /**
   * Get the client player this thread is operating for.  If in the server
   * there will be none.
   *
   * @return The client {@code Player}.
   */
  getClientPlayer(): Player {
    return (this.clientUserName == null) ? null : this.getPlayerByName(this.clientUserName);
  }
  /**
   * Is this game in revenge mode?
   *
   * @return True if an undead player is present.
   */
  isInRevengeMode(): boolean {
    return (this.getPlayer(($p0) => $p0.isUndead())) != null;
  }
  /**
   * Gets the current player.
   *
   * @return The current player.
   */
  getCurrentPlayer(): Player {
    return this.currentPlayer;
  }
  /**
   * Sets the current player.
   *
   * @param newCurrentPlayer The new current {@code Player}.
   */
  setCurrentPlayer(newCurrentPlayer: Player): void {
    this.currentPlayer = newCurrentPlayer;
  }
  /**
   * Gets the map that is being used in this game.
   *
   * @return The game {@code Map}.
   */
  getMap(): Map_ {
    return this.map_;
  }
  /**
   * Sets the game map.
   *
   * @param newMap The new {@code Map} to use.
   * @return The old {@code Map}.
   */
  setMap(newMap: Map_): Map_ {
    let oldMap = this.map_;
    this.map_ = newMap;
    return oldMap;
  }
  /**
   * Change the map in this game, fixing player destinations.
   *
   * @param newMap The new {@code Map} to use.
   */
  changeMap(newMap: Map_): void {
    let oldMap = this.setMap(newMap);
    if (newMap !== oldMap) {
      for (const $it8 = CollectionUtils.transform$Stream$Predicate$Function$Collector(this.getLivePlayers([]), CollectionUtils.alwaysTrue(), ($p0) => $p0.getHighSeas(), CollectionUtils.toListNoNulls()).iterator(); $it8.hasNext(); ) {
        let hs = $it8.next();
        hs.removeDestination(oldMap);
        hs.addDestination(newMap);
      }
    }
  }
  /**
   * Get the current nation options.
   *
   * @return The current {@code NationOptions}.
   */
  getNationOptions(): NationOptions {
    return this.nationOptions;
  }
  /**
   * Set the current nation options.
   *
   * Public for the test suite.
   *
   * @param newNationOptions The new {@code NationOptions} value.
   */
  setNationOptions(newNationOptions: NationOptions): void {
    this.nationOptions = newNationOptions;
  }
  /**
   * Find an available (i.e. vacant) nation.
   *
   * @return A vacant {@code Nation} or null if none found.
   */
  getVacantNation(): Nation {
    let entry = CollectionUtils.find$Collection$Predicate(this.nationOptions.getNations().entrySet(), CollectionUtils.matchKey$Object$Function(NationOptions$NationState.AVAILABLE, ($p0) => $p0.getValue()));
    return (entry == null) ? null : entry.getKey();
  }
  /**
   * Get the currently available nations.
   *
   * @return A list of available {@code Nation}s.
   */
  getVacantNations(): List<Nation> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.nationOptions.getNations().entrySet(), CollectionUtils.matchKey$Object$Function(NationOptions$NationState.AVAILABLE, ($p0) => $p0.getValue()), ($p0) => $p0.getKey());
  }
  /**
   * Can a new player be added to this game?
   *
   * @return True if a new player can be added.
   */
  canAddNewPlayer(): boolean {
    return this.getVacantNation() != null;
  }
  /**
   * Gets the current turn in this game.
   *
   * @return The current {@code Turn}.
   */
  getTurn(): Turn {
    return this.turn;
  }
  /**
   * Sets the current turn in this game.
   *
   * @param newTurn The new {@code Turn} to set.
   */
  setTurn(newTurn: Turn): void {
    this.turn = newTurn;
  }
  /**
   * Get the age for the current turn.
   *
   * @return The age (0-2).
   */
  getAge(): number {
    return this.getSpecification().getAge(this.turn);
  }
  /**
   * Get the combat model in this game.
   *
   * @return The {@code CombatModel}.
   */
  getCombatModel(): CombatModel {
    if (this.specification.hasAbility(Ability.HITPOINTS_COMBAT_MODEL)) {
      return new HitpointsCombatModel()._HitpointsCombatModel();
    } else {
      return new SimpleCombatModel()._SimpleCombatModel();
    }
  }
  /**
   * Has the Spanish Succession event occured?
   *
   * @return True if the Spanish Succession has occurred.
   */
  getSpanishSuccession(): boolean {
    return this.spanishSuccession;
  }
  /**
   * Set the Spanish Succession value.
   *
   * @param spanishSuccession The new Spanish Succession value.
   */
  setSpanishSuccession(spanishSuccession: boolean): void {
    this.spanishSuccession = spanishSuccession;
  }
  /**
   * Get the identifier for the initial active unit.
   *
   * @return The active unit identifier, if any.
   */
  getInitialActiveUnitId(): string {
    return this.initialActiveUnitId;
  }
  /**
   * Get the initial active unit.
   *
   * @return The initial active {@code Unit} or null if none.
   */
  getInitialActiveUnit(): Unit {
    return (this.initialActiveUnitId == null) ? null : this.getFreeColGameObject$String$Class(this.initialActiveUnitId, $J.cls(Unit));
  }
  /**
   * Set the identifier for the initial active unit.
   *
   * @param initialActiveUnitId The identifier for the current active unit.
   */
  setInitialActiveUnitId(initialActiveUnitId: string): void {
    this.initialActiveUnitId = initialActiveUnitId;
  }
  /**
   * Sets the {@code FreeColGameObjectListener} attached to this game.
   *
   * @param fcgol The new {@code FreeColGameObjectListener}.
   */
  setFreeColGameObjectListener(fcgol: FreeColGameObjectListener): void {
    this.freeColGameObjectListener = fcgol;
  }
  /**
   * Notify a listener (if any) of a new game object.
   *
   * @param id The object identifier.
   * @param fcgo The new {@code FreeColGameObject}.
   */
  notifySetFreeColGameObject(id: string, fcgo: FreeColGameObject): void {
    if (this.freeColGameObjectListener != null) {
      this.freeColGameObjectListener.setFreeColGameObject(id, fcgo);
    }
  }
  /**
   * Notify a listener (if any) of that a game object has gone.
   *
   * @param id The object identifier.
   */
  notifyRemoveFreeColGameObject(id: string): void {
    if (this.freeColGameObjectListener != null) {
      this.freeColGameObjectListener.removeFreeColGameObject(id);
    }
  }
  /**
   * Notify a listener (if any) of that a game object has changed owner.
   *
   * @param source The {@code FreeColGameObject} that changed owner.
   * @param oldOwner The old owning {@code Player}.
   * @param newOwner The new owning {@code Player}.
   */
  notifyOwnerChanged(source: FreeColGameObject, oldOwner: Player, newOwner: Player): void {
    if (this.freeColGameObjectListener != null) {
      this.freeColGameObjectListener.ownerChanged(source, oldOwner, newOwner);
    }
  }
  /**
   * Maintain the player containers for certain ownables.
   * Mainly useful in the client, informing the player that it has
   * gained or lost an ownable.
   *
   * @param o The {@code Ownable} that may have changed.
   * @param oldOwner The previous (possible unchanged) owning
   *     {@code Player}.
   */
  checkOwners(o: Ownable, oldOwner: Player): void {
    let newOwner = o.getOwner();
    if (oldOwner === newOwner) {
      return;
    }
    if (oldOwner != null && oldOwner.removeOwnable(o)) {
      oldOwner.invalidateCanSeeTiles();
    }
    if (newOwner != null && newOwner.addOwnable(o)) {
      newOwner.invalidateCanSeeTiles();
    }
  }
  /**
   * Checks if all players are ready to launch.
   *
   * @return True if all players are ready to launch.
   */
  allPlayersReadyToLaunch(): boolean {
    return CollectionUtils.all$Collection$Predicate(this.getLiveEuropeanPlayerList([]), ($p0) => $p0.isReady());
  }
  /**
   * Get all the colonies in the game.
   *
   * @param player An optional {@code Player} to omit.
   * @return A stream of all the {@code Colony}s in the game.
   */
  getAllColonies(player: Player): Stream<Colony> {
    return CollectionUtils.flatten$Collection$Function(this.getLiveEuropeanPlayerList([player]), ($p0) => $p0.getColonies());
  }
  /**
   * Get a list of all the colonies in the game.
   *
   * @param player An optional {@code Player} to omit.
   * @return A list of all the {@code Colony}s in the game.
   */
  getAllColoniesList(player: Player): List<Colony> {
    return CollectionUtils.toList$Stream(this.getAllColonies(player));
  }
  /**
   * Finds a settlement by name.
   *
   * @param name The name of the {@code Settlement}.
   * @return The {@code Settlement} found, or {@code null}
   *     if there is no known {@code Settlement} with the
   *     specified name (the settlement might not be visible to a client).
   */
  getSettlementByName(name: string): Settlement {
    return CollectionUtils.find$Stream$Predicate(CollectionUtils.flatten$Stream$Function(this.getLivePlayers([]), ($p0) => $p0.getSettlements()), CollectionUtils.matchKeyEquals$Object$Function(name, ($p0) => $p0.getName()));
  }
  /**
   * Helper function to get the source object of a message in this game.
   *
   * @param message The {@code ModelMessage} to find the object in.
   * @return The source object.
   */
  getMessageSource(message: ModelMessage): FreeColGameObject {
    return this.getFreeColGameObject$String(message.getSourceId());
  }
  /**
   * Helper function to get the object to display with a message in
   * this game.
   *
   * @param message The {@code ModelMessage} to find the object in.
   * @return An object to display.
   */
  getMessageDisplay(message: ModelMessage): FreeColObject {
    let id = message.getDisplayId();
    if (id == null) {
      id = message.getSourceId();
    }
    let o = this.getFreeColGameObject$String(id);
    if (o == null) {
      try {
        o = this.getSpecification().getType(id);
      } catch ($e9) {
        if ($J.isa($e9, Exception)) {
          let e = $J.exc($e9);
          o = null;
        } else {
          throw $e9;
        }
      }
    }
    return o;
  }
  /**
   * Gets the statistics of this game.
   *
   * @return A {@code Map} of the statistics.
   */
  getStatistics(): JMap<string, string> {
    let stats = new HashMap();
    Utils.garbageCollect();
    let free = $J.ldiv(Runtime.getRuntime().freeMemory(), (Math.imul(1024, 1024)));
    let total = $J.ldiv(Runtime.getRuntime().totalMemory(), (Math.imul(1024, 1024)));
    let max = $J.ldiv(Runtime.getRuntime().maxMemory(), (Math.imul(1024, 1024)));
    stats.put('freeMemory', String(free));
    stats.put('totalMemory', String(total));
    stats.put('maxMemory', String(max));
    let objStats = new HashMap();
    let disposed = 0;
    for (const $it10 = this.getFreeColGameObjectList().iterator(); $it10.hasNext(); ) {
      let fcgo = $it10.next();
      let className = fcgo.getClass().getSimpleName();
      let count = objStats.get(className);
      if (count != null) {
        count++;
        objStats.put(className, count);
      } else {
        objStats.put(className, 1);
      }
      if (fcgo.isDisposed()) {
        disposed++;
      }
    }
    stats.put('disposed', String(disposed));
    CollectionUtils.forEachMapEntry$Map$Consumer(objStats, (e) => stats.put(e.getKey(), String(e.getValue())));
    return stats;
  }
  /**
   * Get a location class from an identifier.
   *
   * @param id The identifier to dissect.
   * @return The location class.
   */
  static getLocationClass(id: string): JClass<FreeColGameObject> {
    return Game.locationClasses.get(StringUtils.capitalize$String(FreeColObject.getIdTypeByName(id)));
  }
  /**
   * Unserialize from XML to a FreeColObject in this game.
   *
   * @param <T> The actual return type.
   * @param xml The xml serialized version of an object.
   * @param returnClass The expected object class.
   * @return The unserialized object.
   * @exception XMLStreamException if there are any problems reading from
   *     the stream.
   */
  unserialize<T>(xml: string, returnClass: JClass<T>): T {
    try {
      let xr = new FreeColXMLReader()._FreeColXMLReader$Reader(new StringReader(xml));
      xr.nextTag();
      let ret = Game.newInstance(this, returnClass, false);
      ret.readFromXML(xr);
      return ret;
    } catch ($e11) {
      if ($J.isa($e11, Exception)) {
        let ex = $J.exc($e11);
        throw new XMLStreamException(ex);
      } else {
        throw $e11;
      }
    }
  }
  /**
   * Generates empty areas that should be made available in the map editor.
   */
  generateDefaultAreas(): void {
    for (const $it12 = this.getSpecification().getNations().iterator(); $it12.hasNext(); ) {
      let nation = $it12.next();
      if (nation.isUnknownEnemy()) {
        continue;
      }
      if (nation.getType().isREF()) {
        continue;
      }
      let nationAreaId = Area.PREFIX_PLAYER_STARTING_POSITION + nation.getId();
      if (!this.areas.containsKey(nationAreaId)) {
        this.addArea(new Area()._Area$Game$String$String(this, nationAreaId, nation.getNameKey()));
      }
    }
  }
  /**
   * Gets the starting area for the given nation.
   *
   * @param nation The nation to get the area for.
   * @return The {@code Area}, if it has been defined on the map. It not,
   *      then just {@code null}.
   */
  getNationStartingArea(nation: Nation): Area {
    let nationAreaId = Area.PREFIX_PLAYER_STARTING_POSITION + nation.getId();
    return this.areas.get(nationAreaId);
  }
  /**
   * Gets a list of all areas in this game.
   */
  getAreas(): List<Area> {
    return new ArrayList(this.areas.values());
  }
  /**
   * Adds a new {@code Area} to the game.
   * @param area The {@code Area} to be added.
   */
  addArea(area: Area): void {
    this.areas.put(area.getId(), area);
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    lb.mark();
    {
      let iterator = this.getFreeColGameObjectIterator();
      while (iterator.hasNext()) {
        let fcgo = iterator.next();
        if (fcgo == null) {
          lb.add([' null-fcgo']);
        } else if (!fcgo.isInitialized()) {
          lb.add([' ', fcgo.getId(), '(', StringUtils.lastPart(fcgo.getClass().getName(), '.'), ')']);
        } else {
          continue;
        }
        if (fix) {
          iterator.remove();
          result = result.fix();
        } else {
          result = result.fail();
        }
      }
    }
    if (lb.grew(['\n  Uninitialized game ids: '])) {
      if (fix) {
        lb.add([' (dropped)']);
      }
    }
    let map = this.getMap();
    if (map != null) {
      result = result.combine(map.checkIntegrity(fix, lb));
    }
    {
      for (const $it13 = this.players.iterator(); $it13.hasNext(); ) {
        let p = $it13.next();
        result = result.combine(p.checkIntegrity(fix, lb));
      }
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getSpecification(): Specification {
    return this.specification;
  }
  /**
   * {@inheritDoc}
   */
  setSpecification(specification: Specification): void {
    this.specification = specification;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Game));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.specification = o.getSpecification();
    this.uuid = o.getUUID();
    this.clientUserName = o.getClientUserName();
    this.addPlayers(o.players);
    this.changeMap(this.update$FreeColGameObject$Class$boolean$Game(o.getMap(), $J.cls(Map_), true));
    this.setNationOptions(o.getNationOptions());
    this.unknownEnemy = this.update$FreeColGameObject$boolean(o.getUnknownEnemy(), false);
    this.currentPlayer = this.updateRef$FreeColGameObject$Class$Game(o.getCurrentPlayer(), $J.cls(Player));
    this.turn = o.getTurn();
    this.spanishSuccession = o.getSpanishSuccession();
    this.initialActiveUnitId = o.getInitialActiveUnitId();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (xw.validForSave()) {
      xw.writeAttribute$String$int(Game.NEXT_ID_TAG, this.nextId);
    } else {
      let client = xw.getClientPlayer();
      if (client != null) {
        xw.writeAttribute(Game.CLIENT_USER_NAME_TAG, client.getName());
      }
    }
    xw.writeAttribute$String$Object(Game.UUID_TAG, this.getUUID());
    xw.writeAttribute$String$int(Game.TURN_TAG, this.getTurn().getNumber());
    xw.writeAttribute$String$boolean(Game.SPANISH_SUCCESSION_TAG, this.spanishSuccession);
    if (this.initialActiveUnitId != null) {
      xw.writeAttribute(Game.INITIAL_ACTIVE_UNIT_ID, this.initialActiveUnitId);
    }
    if (this.currentPlayer != null) {
      xw.writeAttribute$String$FreeColObject(Game.CURRENT_PLAYER_TAG, this.currentPlayer);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.specification != null) {
      {
        this.specification.toXML(xw);
      }
    }
    for (const $it14 = NameCache.getCitiesOfCibola().iterator(); $it14.hasNext(); ) {
      let cityName = $it14.next();
      xw.writeStartElement(Game.CIBOLA_TAG);
      xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, cityName);
      xw.writeEndElement();
    }
    {
      this.nationOptions.toXML$FreeColXMLWriter(xw);
    }
    {
      for (const $it15 = this.players.iterator(); $it15.hasNext(); ) {
        let p = $it15.next();
        p.toXML$FreeColXMLWriter(xw);
      }
    }
    let unknown$ = this.getUnknownEnemy();
    if (unknown$ != null) {
      unknown$.toXML$FreeColXMLWriter(xw);
    }
    let map = this.getMap();
    if (map != null) {
      map.toXML$FreeColXMLWriter(xw);
    }
    xw.writeStartElement(Game.AREAS_TAG);
    for (const $it16 = this.areas.values().iterator(); $it16.hasNext(); ) {
      let a = $it16.next();
      a.toXML$FreeColXMLWriter(xw);
    }
    xw.writeEndElement();
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.nextId = xr.getAttribute$String$int(Game.NEXT_ID_TAG, -1);
    this.clientUserName = xr.getAttribute$String$String(Game.CLIENT_USER_NAME_TAG, null);
    let str = xr.getAttribute$String$String(Game.UUID_TAG, null);
    if (str == null) {
      this.uuid = UUID.randomUUID();
    } else {
      try {
        let u = UUID.fromString(str);
        this.uuid = u;
      } catch ($e17) {
        if ($J.isa($e17, IllegalArgumentException)) {
          let iae = $J.exc($e17);
        } else {
          throw $e17;
        }
      }
    }
    this.turn = new Turn()._Turn(xr.getAttribute$String$int(Game.TURN_TAG, 1));
    this.spanishSuccession = xr.getAttribute$String$boolean(Game.SPANISH_SUCCESSION_TAG, false);
    this.initialActiveUnitId = xr.getAttribute$String$String(Game.INITIAL_ACTIVE_UNIT_ID, null);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    NameCache.clearCitiesOfCibola();
    this.players.clear();
    this.unknownEnemy = null;
    let current = xr.getAttribute$String$String(Game.CURRENT_PLAYER_TAG, null);
    super.readChildren(xr);
    this.currentPlayer = xr.lookup$Game$String$Class(this, current, $J.cls(Player));
    for (const $it18 = this.getAllColoniesList(null).iterator(); $it18.hasNext(); ) {
      let c = $it18.next();
      c.updateProductionTypes();
    }
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let game = this.getGame();
    let tag = xr.getLocalName();
    if ($J.equals(Game.CIBOLA_TAG, tag)) {
      let cibola = xr.readId();
      let oldPrefix = 'lostCityRumour.cityName';
      if (cibola.startsWith(oldPrefix)) {
        cibola = 'nameCache.' + cibola;
      }
      NameCache.addCityOfCibola(cibola);
      xr.closeTag$String(Game.CIBOLA_TAG);
    } else if ($J.equals(Map_.TAG, tag)) {
      if (this.specification == null) {
        throw new XMLStreamException('Tried to read ' + tag + ' with null specification');
      }
      this.changeMap(xr.readFreeColObject$Game$Class(game, $J.cls(Map_)));
    } else if ($J.equals(NationOptions.TAG, tag)) {
      if (this.specification == null) {
        throw new XMLStreamException('Tried to read ' + tag + ' with null specification');
      }
      this.setNationOptions(new NationOptions()._NationOptions$FreeColXMLReader$Specification(xr, this.specification));
    } else if ($J.equals(Player.TAG, tag)) {
      if (this.specification == null) {
        throw new XMLStreamException('Tried to read ' + tag + ' with null specification');
      }
      let player = xr.readFreeColObject$Game$Class(game, $J.cls(Player));
      if (player.isUnknownEnemy()) {
        this.setUnknownEnemy(player);
      } else {
        this.players.add(player);
      }
    } else if ($J.equals(Specification.TAG, tag)) {
      this.setSpecification(new Specification()._Specification$FreeColXMLReader(xr));
    } else if ($J.equals(Game.AREAS_TAG, tag)) {
      try {
        while (xr.moreTags()) {
          let area = xr.readFreeColObject$Game$Class(game, $J.cls(Area));
          this.areas.put(area.getId(), area);
        }
      } catch ($e19) {
        if ($J.isa($e19, XMLStreamException)) {
          let xse = $J.exc($e19);
          Game.logger.log(Level.SEVERE, 'nextTag failed at ' + tag, xse);
        } else {
          throw $e19;
        }
      }
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Game.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    return this === o;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    return Utils.hashCode(this.getId());
  }
  static $clinit() {
    Game.logger = Logger.getLogger($J.cls(Game).getName());
    Game.serverClasses = new HashMap();
    Game.serverClasses.put($J.cls(Building), $J.cls(ServerBuilding));
    Game.serverClasses.put($J.cls(Colony), $J.cls(ServerColony));
    Game.serverClasses.put($J.cls(ColonyTile), $J.cls(ServerColonyTile));
    Game.serverClasses.put($J.cls(Europe), $J.cls(ServerEurope));
    Game.serverClasses.put($J.cls(Game), $J.cls(ServerGame));
    Game.serverClasses.put($J.cls(IndianSettlement), $J.cls(ServerIndianSettlement));
    Game.serverClasses.put($J.cls(Region), $J.cls(ServerRegion));
    Game.serverClasses.put($J.cls(Player), $J.cls(ServerPlayer));
    Game.serverClasses.put($J.cls(Unit), $J.cls(ServerUnit));
    Game.locationClasses = new HashMap();
    Game.locationClasses.put('Building', $J.cls(Building));
    Game.locationClasses.put('Colony', $J.cls(Colony));
    Game.locationClasses.put('ColonyTile', $J.cls(ColonyTile));
    Game.locationClasses.put('Europe', $J.cls(Europe));
    Game.locationClasses.put('HighSeas', $J.cls(HighSeas));
    Game.locationClasses.put('IndianSettlement', $J.cls(IndianSettlement));
    Game.locationClasses.put('Map', $J.cls(Map_));
    Game.locationClasses.put('Tile', $J.cls(Tile));
    Game.locationClasses.put('Unit', $J.cls(Unit));
  }
}

/**
 * Reasons for logging out.
 */
export class Game$LogoutReason extends JEnum {
  static DEFEATED: Game$LogoutReason = null;
  static LOGIN: Game$LogoutReason = null;
  static LOGOUT: Game$LogoutReason = null;
  static MAIN_TITLE: Game$LogoutReason = null;
  static NEW_GAME: Game$LogoutReason = null;
  static QUIT: Game$LogoutReason = null;
  static RECONNECT: Game$LogoutReason = null;
  static $VALUES: Game$LogoutReason[] = null;
  _Game$LogoutReason($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Game$LogoutReason[] { return Game$LogoutReason.$VALUES.slice(); }
  static valueOf(name: string): Game$LogoutReason { return $J.enumValueOf(Game$LogoutReason, name); }
  static $clinit() {
    Game$LogoutReason.DEFEATED = new Game$LogoutReason()._Game$LogoutReason('DEFEATED', 0);
    Game$LogoutReason.LOGIN = new Game$LogoutReason()._Game$LogoutReason('LOGIN', 1);
    Game$LogoutReason.LOGOUT = new Game$LogoutReason()._Game$LogoutReason('LOGOUT', 2);
    Game$LogoutReason.MAIN_TITLE = new Game$LogoutReason()._Game$LogoutReason('MAIN_TITLE', 3);
    Game$LogoutReason.NEW_GAME = new Game$LogoutReason()._Game$LogoutReason('NEW_GAME', 4);
    Game$LogoutReason.QUIT = new Game$LogoutReason()._Game$LogoutReason('QUIT', 5);
    Game$LogoutReason.RECONNECT = new Game$LogoutReason()._Game$LogoutReason('RECONNECT', 6);
    Game$LogoutReason.$VALUES = [Game$LogoutReason.DEFEATED, Game$LogoutReason.LOGIN, Game$LogoutReason.LOGOUT, Game$LogoutReason.MAIN_TITLE, Game$LogoutReason.NEW_GAME, Game$LogoutReason.QUIT, Game$LogoutReason.RECONNECT];
  }
}

/**
 * State for the FCGO iterator, out here because it has to be static.
 */
export class Game$FcgoState extends JEnum {
  static INVALID: Game$FcgoState = null;
  static VALID: Game$FcgoState = null;
  static CONSUMED: Game$FcgoState = null;
  static $VALUES: Game$FcgoState[] = null;
  _Game$FcgoState($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Game$FcgoState[] { return Game$FcgoState.$VALUES.slice(); }
  static valueOf(name: string): Game$FcgoState { return $J.enumValueOf(Game$FcgoState, name); }
  static $clinit() {
    Game$FcgoState.INVALID = new Game$FcgoState()._Game$FcgoState('INVALID', 0);
    Game$FcgoState.VALID = new Game$FcgoState()._Game$FcgoState('VALID', 1);
    Game$FcgoState.CONSUMED = new Game$FcgoState()._Game$FcgoState('CONSUMED', 2);
    Game$FcgoState.$VALUES = [Game$FcgoState.INVALID, Game$FcgoState.VALID, Game$FcgoState.CONSUMED];
  }
}

let $Game$1: any = null;
/** An anonymous class (Game.java:671). */
function Game$1(): any {
  return $Game$1 ??= $J.local(class extends JObject {
    /**
     * An iterator over the freeColGameObjects map.
     */
    it: Iterator<Map_Entry<string, WeakReference<FreeColGameObject>>> = null;
    /**
     * Read ahead to this next entry.
     */
    readAhead: Map_Entry<string, WeakReference<FreeColGameObject>> = null;
    /**
     * State of the readahead value.
     */
    fcgoState: Game$FcgoState = null;
    $init_anon() {
      this.it = this.$outer.freeColGameObjects.entrySet().iterator();
      this.readAhead = null;
      this.fcgoState = Game$FcgoState.INVALID;
      return this;
    }
    hasNext(): boolean {
      if (this.fcgoState === Game$FcgoState.VALID) {
        return true;
      }
      while (this.it.hasNext()) {
        this.readAhead = this.it.next();
        if (this.readAhead.getValue().get() != null) {
          this.fcgoState = Game$FcgoState.VALID;
          return true;
        }
        this.fcgoState = Game$FcgoState.CONSUMED;
        this.remove();
      }
      return false;
    }
    next(): FreeColGameObject {
      if (!this.hasNext()) {
        throw new NoSuchElementException();
      }
      let fcgo = this.readAhead.getValue().get();
      this.fcgoState = Game$FcgoState.CONSUMED;
      return fcgo;
    }
    remove(): void {
      if (this.fcgoState === Game$FcgoState.INVALID) {
        throw new RuntimeException('No current entry: ' + $J.str(this.fcgoState));
      }
      let key = this.readAhead.getKey();
      this.fcgoState = Game$FcgoState.INVALID;
      this.it.remove();
      Game.logger.finest('removeFCGO/expire: ' + key);
      this.$outer.notifyRemoveFreeColGameObject(key);
    }
  }, 'net.sf.freecol.common.model.Game$1', ['java.util.Iterator']);
}

$J.define(Game, 'net.sf.freecol.common.model.Game', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_Game$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Specification': '_Game$Specification', '': '_Game$' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getSpecification': 'net.sf.freecol.common.model.Specification', 'getAreas': 'java.util.List', 'getStatistics': 'java.util.Map', 'getInitialActiveUnit': 'net.sf.freecol.common.model.Unit', 'getInitialActiveUnitId': 'java.lang.String', 'getSpanishSuccession': 'boolean', 'getCombatModel': 'net.sf.freecol.common.model.CombatModel', 'getAge': 'int', 'getTurn': 'net.sf.freecol.common.model.Turn', 'getVacantNations': 'java.util.List', 'getVacantNation': 'net.sf.freecol.common.model.Nation', 'getNationOptions': 'net.sf.freecol.common.model.NationOptions', 'getMap': 'net.sf.freecol.common.model.Map', 'getCurrentPlayer': 'net.sf.freecol.common.model.Player', 'isInRevengeMode': 'boolean', 'getClientPlayer': 'net.sf.freecol.common.model.Player', 'isInServer': 'boolean', 'isInClient': 'boolean', 'getClientUserName': 'java.lang.String', 'getUnknownEnemy': 'net.sf.freecol.common.model.Player', 'getNextPlayer': 'net.sf.freecol.common.model.Player', 'getFirstPlayer': 'net.sf.freecol.common.model.Player', 'getUUID': 'java.util.UUID', 'getFreeColGameObjectList': 'java.util.List', 'getFreeColGameObjectIterator': 'java.util.Iterator', 'getNextId': 'int', 'getMapGeneratorOptions': 'net.sf.freecol.common.option.OptionGroup', 'getGameOptions': 'net.sf.freecol.common.option.OptionGroup', 'getDifficultyOptionGroup': 'net.sf.freecol.common.option.OptionGroup' }, meths: { 'updateRef(java.util.Collection)': 'updateRef$Collection', 'updateRef(net.sf.freecol.common.model.FreeColGameObject,java.lang.Class)': 'updateRef$FreeColGameObject$Class$Game', 'updateRef(net.sf.freecol.common.model.FreeColGameObject)': 'updateRef$FreeColGameObject', 'update(java.util.Collection,boolean)': 'update$Collection$boolean', 'update(net.sf.freecol.common.model.FreeColGameObject,java.lang.Class,boolean)': 'update$FreeColGameObject$Class$boolean$Game', 'update(net.sf.freecol.common.model.FreeColGameObject,boolean)': 'update$FreeColGameObject$boolean', 'getFreeColGameObject(java.lang.String,java.lang.Class)': 'getFreeColGameObject$String$Class', 'getFreeColGameObject(java.lang.String)': 'getFreeColGameObject$String' }, clinit: true, lazy: ['logger', 'serverClasses', 'locationClasses'] });
$J.define(Game$LogoutReason, 'net.sf.freecol.common.model.Game$LogoutReason', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Game$LogoutReason' }, clinit: true, lazy: ['$VALUES', 'DEFEATED', 'LOGIN', 'LOGOUT', 'MAIN_TITLE', 'NEW_GAME', 'QUIT', 'RECONNECT'] });
$J.define(Game$FcgoState, 'net.sf.freecol.common.model.Game$FcgoState', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Game$FcgoState' }, clinit: true, lazy: ['$VALUES', 'INVALID', 'VALID', 'CONSUMED'] });
$J.module(() => {
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  NameCache = $J.load('net.sf.freecol.common.i18n.NameCache');
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Area = $J.load('net.sf.freecol.common.model.Area');
  Building = $J.load('net.sf.freecol.common.model.Building');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  ColonyTile = $J.load('net.sf.freecol.common.model.ColonyTile');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  FreeColSpecObject = $J.load('net.sf.freecol.common.model.FreeColSpecObject');
  HighSeas = $J.load('net.sf.freecol.common.model.HighSeas');
  HitpointsCombatModel = $J.load('net.sf.freecol.common.model.HitpointsCombatModel');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  NationOptions = $J.load('net.sf.freecol.common.model.NationOptions');
  NationOptions$NationState = $J.load('net.sf.freecol.common.model.NationOptions$NationState');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Region = $J.load('net.sf.freecol.common.model.Region');
  SimpleCombatModel = $J.load('net.sf.freecol.common.model.SimpleCombatModel');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Turn = $J.load('net.sf.freecol.common.model.Turn');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Introspector = $J.load('net.sf.freecol.common.util.Introspector');
  Introspector$IntrospectorException = $J.load('net.sf.freecol.common.util.Introspector$IntrospectorException');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  ServerBuilding = $J.load('net.sf.freecol.server.model.ServerBuilding');
  ServerColony = $J.load('net.sf.freecol.server.model.ServerColony');
  ServerColonyTile = $J.load('net.sf.freecol.server.model.ServerColonyTile');
  ServerEurope = $J.load('net.sf.freecol.server.model.ServerEurope');
  ServerGame = $J.load('net.sf.freecol.server.model.ServerGame');
  ServerIndianSettlement = $J.load('net.sf.freecol.server.model.ServerIndianSettlement');
  ServerPlayer = $J.load('net.sf.freecol.server.model.ServerPlayer');
  ServerRegion = $J.load('net.sf.freecol.server.model.ServerRegion');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
