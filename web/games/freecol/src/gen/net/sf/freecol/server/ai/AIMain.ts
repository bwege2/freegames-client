// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/AIMain.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, ClassCastException, Collectors, Exception, HashMap, JFunction, Level, Logger, NullPointerException, RuntimeException, XMLStreamException } from '../../../../../../jre/index.ts';
import { FreeColObject } from '../../common/model/FreeColObject.ts';

let Colony, Constants$IntegrityType, Player, Unit, CollectionUtils, LogBuilder, RandomUtils, StringUtils, AIColony, AIGoods, AIPlayer, AIUnit, EuropeanAIPlayer, GoodsWish, NativeAIPlayer, REFAIPlayer, TileImprovementPlan, Wish, WorkerWish;

/**
 * The main AI-class.
 * Keeps references to all other AI-classes.
 */
export class AIMain extends FreeColObject {
  static logger: Logger = null;
  static readonly TAG: string = 'aiMain';
  /**
   * The server that this AI is operating within.
   */
  freeColServer: FreeColServer = null;
  /**
   * The next AI identifier index.
   */
  nextId: number = 0;
  /**
   * Contains mappings between {@code FreeColGameObject}s
   * and {@code AIObject}s.
   */
  aiObjects: JMap<string, AIObject> = null;
  static readonly NEXT_ID_TAG: string = 'nextId';
  static readonly OLD_GOODS_WISH_TAG: string = 'GoodsWish';
  static readonly OLD_TILE_IMPROVEMENT_PLAN_TAG: string = 'tileimprovementplan';
  $init_AIMain() {
    this.nextId = 1;
    this.aiObjects = new HashMap();
  }
  /**
   * Creates a new {@code AIMain} and searches the current
   * game for {@code FreeColGameObject}s.
   *
   * @param freeColServer The main controller object for the server.
   */
  _AIMain$FreeColServer(freeColServer: FreeColServer): this {
    this._FreeColObject();
    this.$init_AIMain();
    this.freeColServer = freeColServer;
    return this;
  }
  /**
   * Creates a new {@code AIMain} from a reader.
   *
   * @param freeColServer The main controller object for the
   *     server.
   * @param xr The input stream containing the XML.
   * @exception XMLStreamException if a problem was encountered
   *     during parsing.
   */
  _AIMain$FreeColServer$FreeColXMLReader(freeColServer: FreeColServer, xr: FreeColXMLReader): this {
    this._AIMain$FreeColServer(freeColServer);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Gets the main controller object for the server.
   *
   * @return The {@code FreeColServer}-object.
   */
  getFreeColServer(): FreeColServer {
    return this.freeColServer;
  }
  /**
   * Convenience accessor for the Game.
   *
   * @return The {@code Game} this AI is operating in.
   */
  getGame(): Game {
    return this.freeColServer.getGame();
  }
  /**
   * Gets a unique identifier for an {@code AIObject}.
   *
   * @return A unique identifier.
   */
  getNextId(): string {
    let id = String(this.nextId);
    this.nextId++;
    return id;
  }
  /**
   * Gets a random value from the server to use for individual AI player
   * PRNG seeds.
   *
   * @param logMe A logging string.
   * @return A random seed.
   */
  getRandomSeed(logMe: string): number {
    return RandomUtils.randomInt(AIMain.logger, logMe, this.freeColServer.getServerRandom(), 2147483647);
  }
  /**
   * Should a {@code FreeColGameObject} have a corresponding AI
   * object?
   *
   * Strictly true only for AI players and their units and colonies
   * (not (yet) for native settlements).  However object
   * initialization is not necessarily complete when we arrive here,
   * which means we can not yet use the Colony or Unit owner fields.
   * So the actual test implemented here is somewhat sloppy.
   *
   * @param fcgo The {@code FreeColGameObject} to test.
   * @return True if a corresponding AI object is needed.
   */
  shouldHaveAIObject(fcgo: FreeColGameObject): boolean {
    return (fcgo instanceof Colony) ? true : (fcgo instanceof Player) ? (fcgo).isAI() : (fcgo instanceof Unit) ? true : false;
  }
  /**
   * Searches for new {@link FreeColGameObject FreeColGameObjects}.
   * An AI-object is created for each new object.
   *
   * @param overwrite Determines wether any old {@code AIObject}
   *     should be overwritten or not.
   */
  findNewObjects(overwrite: boolean): void {
    for (const $it0 = this.freeColServer.getGame().getFreeColGameObjectList().iterator(); $it0.hasNext(); ) {
      let fcgo = $it0.next();
      if (!this.shouldHaveAIObject(fcgo)) {
        continue;
      }
      if (overwrite || this.getAIObject$FreeColGameObject$AIMain(fcgo) == null) {
        this.setFreeColGameObject(fcgo.getId(), fcgo);
      }
    }
  }
  /**
   * Gets the {@code AIObject} for the given
   * {@code FreeColGameObject}.
   *
   * @param fcgo The {@code FreeColGameObject} to find the
   *     {@code AIObject} for.
   * @see #getAIObject(String)
   * @return The {@code AIObject}.
   */
  getAIObject$FreeColGameObject$AIMain(fcgo: FreeColGameObject): AIObject {
    return this.getAIObject$String(fcgo.getId());
  }
  /**
   * Gets the {@code AIObject} for a given object identifier.
   *
   * @param id The object identifier.
   * @see #getAIObject(FreeColGameObject)
   * @return The {@code AIObject}.
   */
  getAIObject$String(id: string): AIObject {
    {
      return this.aiObjects.get(id);
    }
  }
  /**
   * Adds a reference to the given {@code AIObject}.
   *
   * Note: this is called only for new AI objects, thus it is an
   * error for the object to already be present in the aiObjects
   * map.
   *
   * @param id The object identifier.
   * @param aiObject The {@code AIObject} to store a reference
   *        for.
   */
  addAIObject(id: string, aiObject: AIObject): void {
    if (aiObject == null) {
      throw new NullPointerException('aiObject == null: ' + $J.str(this));
    }
    let present: boolean;
    {
      present = this.aiObjects.containsKey(id);
      if (!present) {
        this.aiObjects.put(id, aiObject);
      }
    }
    if (present) {
      throw new RuntimeException('AIObject already created: ' + id);
    }
  }
  /**
   * Removes a reference to the given {@code AIObject}.
   *
   * @param id The object identifier.
   * @return True if an object for the identifier is removed.
   */
  removeAIObject(id: string): boolean {
    let result: boolean;
    {
      result = this.aiObjects.remove(id) != null;
    }
    if (result) {
      AIMain.logger.finest('Removed AI object: ' + id);
    }
    return result;
  }
  /**
   * Get a copy of the list of all AI objects.
   *
   * @return A list of {@code AIObject}s.
   */
  getAIObjects(): List<AIObject> {
    {
      return new ArrayList(this.aiObjects.values());
    }
  }
  /**
   * Gets the {@code AIObject} with the specified object
   * identifier and class.
   *
   * @param <T> The actual return type.
   * @param id The object identifier.
   * @param returnClass The expected class of the object.
   * @return The {@code AIObject} found, or null if not.
   */
  getAIObject$String$Class<T>(id: string, returnClass: JClass<T>): T {
    let aio = this.getAIObject$String(id);
    try {
      return returnClass.cast(aio);
    } catch ($e1) {
      if ($J.isa($e1, ClassCastException)) {
        let e = $J.exc($e1);
        return null;
      } else {
        throw $e1;
      }
    }
  }
  /**
   * Gets the AI colony corresponding to a given colony.
   *
   * @param colony The {@code Colony} to look up.
   * @return The corresponding AI colony, or null if not found.
   */
  getAIColony(colony: Colony): AIColony {
    return this.getAIObject$String$Class(colony.getId(), $J.cls(AIColony));
  }
  /**
   * Gets the AI player corresponding to a given player.
   *
   * @param player The {@code Player} to look up.
   * @return The corresponding AI player, or null if not found.
   */
  getAIPlayer(player: Player): AIPlayer {
    return this.getAIObject$String$Class(player.getId(), $J.cls(AIPlayer));
  }
  /**
   * Gets the AI unit corresponding to a given unit.
   *
   * @param unit The {@code Unit} to look up.
   * @return The corresponding AI unit, or null if not found.
   */
  getAIUnit(unit: Unit): AIUnit {
    return this.getAIObject$String$Class(unit.getId(), $J.cls(AIUnit));
  }
  /**
   * Computes how many objects of each class have been created, to
   * track memory leaks over time
   *
   * @return A map of AI statistics.
   */
  getAIStatistics(): JMap<string, string> {
    let stats = new HashMap();
    for (const $it2 = this.getAIObjects().iterator(); $it2.hasNext(); ) {
      let aio = $it2.next();
      let className = aio.getClass().getSimpleName();
      let count = stats.get(className);
      if (count == null) {
        stats.put(className, 1);
      } else {
        stats.put(className, count + 1);
      }
    }
    return CollectionUtils.transform$Collection$Predicate$Function$Collector(stats.entrySet(), CollectionUtils.alwaysTrue(), JFunction.identity(), Collectors.toMap(($p0) => $p0.getKey(), (e) => String(e.getValue())));
  }
  /**
   * Check sort consistency.
   *
   * @return A string describing sort consistency failures, or null
   *     on success.
   */
  checkSortConsistency(): string {
    let lb = new LogBuilder()._LogBuilder(256);
    lb.add(['AI object sort inconsistencies']);
    lb.mark();
    let objects = $J.toArrayInto(this.getAIObjects().toArray(), $J.newArray(0, null));
    for (let i0 = 0; i0 < objects.length; i0++) {
      for (let i1 = (i0 + 1) | 0; i1 < objects.length; i1++) {
        let c0 = objects[i0].compareTo(objects[i1]);
        let c1 = objects[i1].compareTo(objects[i0]);
        if (c0 === 0 && c1 === 0) {
          continue;
        }
        if (c0 === -1 && c1 === 1) {
          continue;
        }
        if (c0 === 1 && c1 === -1) {
          continue;
        }
        lb.add(['\n  ', objects[i0], ' ', objects[i1], ' = ', c0, '/', c1]);
      }
    }
    return (lb.grew([])) ? lb.toString() : null;
  }
  /**
   * Check the AI integrity too.
   *
   * @param fix If true, fix problems if possible.
   * @param lb A {@code LogBuilder} to log to.
   * @return -1 if there are problems remaining, zero if problems
   *     were fixed, +1 if no problems found at all.
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = Constants$IntegrityType.INTEGRITY_GOOD;
    for (const $it3 = this.getAIObjects().iterator(); $it3.hasNext(); ) {
      let aio = $it3.next();
      let integ = aio.checkIntegrity$boolean$LogBuilder(fix, lb);
      if (!integ.safe()) {
        if (fix) {
          lb.add(['\n  Invalid AIObject dropped: ', aio.getId(), '(', StringUtils.lastPart(aio.getClass().getName(), '.'), ')']);
          this.removeAIObject(aio.getId());
          aio.dispose();
          result = result.fix();
        } else {
          lb.add(['\n  Invalid AIObject: ', aio.getId(), '(', StringUtils.lastPart(aio.getClass().getName(), '.'), ')']);
          result = result.fail();
        }
      }
    }
    for (const $it4 = this.getGame().getFreeColGameObjectList().iterator(); $it4.hasNext(); ) {
      let fcgo = $it4.next();
      if (this.shouldHaveAIObject(fcgo) && this.getAIObject$String(fcgo.getId()) == null) {
        if (fix) {
          lb.add(['\n  Missing AIObject added: ', fcgo.getId()]);
          this.setFreeColGameObject(fcgo.getId(), fcgo);
          result = result.fix();
        } else {
          lb.add(['\n  Missing AIObject: ', fcgo.getId()]);
          result = result.fail();
        }
      }
    }
    return result;
  }
  /**
   * Creates a new {@code AIObject} for a given
   * {@code FreeColGameObject}. This method gets called
   * whenever a new object gets added to the {@link Game}.
   *
   * @param id The object identifier.
   * @param fcgo The {@code FreeColGameObject} to add.
   * @see AIObject
   * @see FreeColGameObject
   * @see FreeColGameObject#getId
   */
  setFreeColGameObject(id: string, fcgo: FreeColGameObject): void {
    if (this.getAIObject$String(id) != null || !this.shouldHaveAIObject(fcgo)) {
      return;
    }
    if (!$J.equals(id, fcgo.getId())) {
      throw new RuntimeException('!id.equals(fcgo.getId()): ' + id);
    }
    let aio = null;
    if (fcgo instanceof Colony) {
      aio = new AIColony()._AIColony$AIMain$Colony(this, fcgo);
    } else if (fcgo instanceof Player) {
      let player = fcgo;
      if (player.getPlayerType() == null) {
        AIMain.logger.info('Temporarily ignoring incomplete AI player: ' + fcgo.getId());
      } else if (player.isIndian()) {
        aio = new NativeAIPlayer()._NativeAIPlayer$AIMain$Player(this, player);
      } else if (player.isREF()) {
        aio = new REFAIPlayer()._REFAIPlayer$AIMain$Player(this, player);
      } else if (player.isEuropean()) {
        aio = new EuropeanAIPlayer()._EuropeanAIPlayer$AIMain$Player(this, player);
      } else {
        throw new RuntimeException('Bogus player: ' + $J.str(player));
      }
    } else if (fcgo instanceof Unit) {
      aio = new AIUnit()._AIUnit$AIMain$Unit(this, fcgo);
    }
    if (aio == null) {
      throw new RuntimeException('Bogus non-AI FCGO: ' + $J.str(fcgo));
    }
  }
  /**
   * Removes the {@code AIObject} for a given AI identifier.
   * Needed for interface FreeColGameObjectListener.
   *
   * @param id The object identifier.
   */
  removeFreeColGameObject(id: string): void {
    let o = this.getAIObject$String(id);
    if (o != null) {
      o.dispose();
    }
    this.removeAIObject(id);
  }
  /**
   * Replaces the AI object when ownership changes.
   *
   * @param source The {@code FreeColGameObject} that has changed.
   * @param oldOwner The old owning {@code Player}.
   * @param newOwner The new owning {@code Player}.
   */
  ownerChanged(source: FreeColGameObject, oldOwner: Player, newOwner: Player): void {
    let ao = this.getAIObject$FreeColGameObject$AIMain(source);
    if (ao == null) {
      return;
    }
    AIMain.logger.finest('Owner changed for ' + source.getId() + ' with AI object: ' + $J.str(ao));
    let oldAIOwner = this.getAIPlayer(oldOwner);
    if (oldAIOwner != null) {
      oldAIOwner.removeAIObject(ao);
    }
    ao.dispose();
    this.setFreeColGameObject(source.getId(), source);
  }
  /**
   * {@inheritDoc}
   */
  getSpecification(): Specification {
    return this.getGame().getSpecification();
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(AIMain));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.nextId = o.nextId;
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    xw.writeAttribute$String$int(AIMain.NEXT_ID_TAG, this.nextId);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it5 = CollectionUtils.sort$Collection(this.getAIObjects()).iterator(); $it5.hasNext(); ) {
      let aio = $it5.next();
      if (!aio.checkIntegrity$boolean(false).safe()) {
        aio.dispose();
        continue;
      }
      if (aio instanceof Wish) {
        if (!(aio).shouldBeStored()) {
          continue;
        }
      }
      try {
        if (aio.getId() == null) {
          AIMain.logger.warning('Null AI identifier for: ' + aio.getClass().getName());
        } else {
          aio.toXML$FreeColXMLWriter(xw);
        }
      } catch ($e6) {
        if ($J.isa($e6, Exception)) {
          let e = $J.exc($e6);
          AIMain.logger.log(Level.WARNING, 'Failed to write AI object: ' + $J.str(aio), e);
        } else {
          throw $e6;
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    this.nextId = xr.getAttribute$String$int(AIMain.NEXT_ID_TAG, -1);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.aiObjects.clear();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    let oid = xr.readId();
    try {
      let aio = null;
      let indirect = false;
      if (oid != null && (aio = this.getAIObject$String(oid)) != null) {
        aio.readFromXML(xr);
        aio.setInitialized();
      } else if ($J.equals(AIColony.TAG, tag)) {
        aio = new AIColony()._AIColony$AIMain$FreeColXMLReader(this, xr);
      } else if ($J.equals(AIGoods.TAG, tag)) {
        aio = new AIGoods()._AIGoods$AIMain$FreeColXMLReader(this, xr);
      } else if ($J.equals(AIPlayer.TAG, tag)) {
        let p = this.getGame().getFreeColGameObject$String$Class(oid, $J.cls(Player));
        if (p != null) {
          if (p.isIndian()) {
            aio = new NativeAIPlayer()._NativeAIPlayer$AIMain$FreeColXMLReader(this, xr);
          } else if (p.isREF()) {
            aio = new REFAIPlayer()._REFAIPlayer$AIMain$FreeColXMLReader(this, xr);
          } else if (p.isEuropean()) {
            aio = new EuropeanAIPlayer()._EuropeanAIPlayer$AIMain$FreeColXMLReader(this, xr);
          } else {
            throw new XMLStreamException('Bogus AIPlayer: ' + $J.str(p));
          }
        }
      } else if ($J.equals(AIUnit.TAG, tag)) {
        aio = new AIUnit()._AIUnit$AIMain$FreeColXMLReader(this, xr);
      } else if ($J.equals(GoodsWish.TAG, tag) || $J.equals(AIMain.OLD_GOODS_WISH_TAG, tag)) {
        aio = new GoodsWish()._GoodsWish$AIMain$FreeColXMLReader(this, xr);
      } else if ($J.equals(TileImprovementPlan.TAG, tag) || $J.equals(AIMain.OLD_TILE_IMPROVEMENT_PLAN_TAG, tag)) {
        aio = new TileImprovementPlan()._TileImprovementPlan$AIMain$FreeColXMLReader(this, xr);
      } else if ($J.equals(WorkerWish.TAG, tag)) {
        aio = new WorkerWish()._WorkerWish$AIMain$FreeColXMLReader(this, xr);
      } else {
        $J.err.println('AT ' + tag + ' with ' + oid);
        indirect = true;
        super.readChild(xr);
      }
      if (aio == null && !indirect) {
        throw new XMLStreamException('Bad AI object at ' + tag + ' with ' + oid);
      }
    } catch ($e7) {
      if ($J.isa($e7, XMLStreamException)) {
        let xse = $J.exc($e7);
        throw xse;
      } else if ($J.isa($e7, Exception)) {
        let e = $J.exc($e7);
        AIMain.logger.log(Level.WARNING, 'Exception reading AIObject: ' + tag + ', id=' + oid, e);
        let mainTag = AIMain.TAG;
        while (xr.moreTags() || !(xr.atTag(tag) || xr.atTag(mainTag))) {
        }
      } else {
        throw $e7;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return AIMain.TAG;
  }
  static $clinit() {
    AIMain.logger = Logger.getLogger($J.cls(AIMain).getName());
  }
}

$J.define(AIMain, 'net.sf.freecol.server.ai.AIMain', { kind: 'class', ifaces: ['net.sf.freecol.common.model.FreeColGameObjectListener'], sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.server.FreeColServer,net.sf.freecol.common.io.FreeColXMLReader': '_AIMain$FreeColServer$FreeColXMLReader', 'net.sf.freecol.server.FreeColServer': '_AIMain$FreeColServer' }, returns: { 'getXMLTagName': 'java.lang.String', 'getSpecification': 'net.sf.freecol.common.model.Specification', 'getAIStatistics': 'java.util.Map', 'getAIObjects': 'java.util.List', 'getNextId': 'java.lang.String', 'getGame': 'net.sf.freecol.common.model.Game', 'getFreeColServer': 'net.sf.freecol.server.FreeColServer' }, meths: { 'getAIObject(java.lang.String,java.lang.Class)': 'getAIObject$String$Class', 'getAIObject(java.lang.String)': 'getAIObject$String', 'getAIObject(net.sf.freecol.common.model.FreeColGameObject)': 'getAIObject$FreeColGameObject$AIMain' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Constants$IntegrityType = $J.load('net.sf.freecol.common.model.Constants$IntegrityType');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  AIColony = $J.load('net.sf.freecol.server.ai.AIColony');
  AIGoods = $J.load('net.sf.freecol.server.ai.AIGoods');
  AIPlayer = $J.load('net.sf.freecol.server.ai.AIPlayer');
  AIUnit = $J.load('net.sf.freecol.server.ai.AIUnit');
  EuropeanAIPlayer = $J.load('net.sf.freecol.server.ai.EuropeanAIPlayer');
  GoodsWish = $J.load('net.sf.freecol.server.ai.GoodsWish');
  NativeAIPlayer = $J.load('net.sf.freecol.server.ai.NativeAIPlayer');
  REFAIPlayer = $J.load('net.sf.freecol.server.ai.REFAIPlayer');
  TileImprovementPlan = $J.load('net.sf.freecol.server.ai.TileImprovementPlan');
  Wish = $J.load('net.sf.freecol.server.ai.Wish');
  WorkerWish = $J.load('net.sf.freecol.server.ai.WorkerWish');
});
