// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/ServerGame.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Exception, HashSet, JDate, JString, Level, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { Game } from '../../common/model/Game.ts';

let NameCache, Europe, GoodsLocation, HighSeas, HistoryEvent, HistoryEvent$HistoryEventType, ModelMessage, ModelMessage$MessageType, NationOptions, Ownable, Player$PlayerType, Stance, Unit$UnitState, ChangeSet, ChangeSet$See, NewTurnMessage, GameOptions, CollectionUtils, Utils, ServerPlayer, Session;

/**
 * The server representation of the game.
 */
export class ServerGame extends Game {
  static logger: Logger = null;
  /**
   * Timestamp of last move, if any.  Do not serialize.
   */
  lastTime: number = 0;
  $init_ServerGame() {
    this.lastTime = -1;
  }
  /**
   * Creates a new game model.
   *
   * Public for the test suite.
   *
   * @param specification The {@code Specification} to use in this game.
   */
  _ServerGame$Specification(specification: Specification): this {
    this._Game$Specification(specification);
    this.$init_ServerGame();
    return this;
  }
  /**
   * Creates a new game model.
   *
   * Called from the FreeColServer constructor to create a
   * completely new game.
   *
   * @param specification The {@code Specification} to use in this game.
   * @param random A pseudo-random number source.
   */
  _ServerGame$Specification$Random(specification: Specification, random: Random): this {
    this._ServerGame$Specification(specification);
    this.setNationOptions(new NationOptions()._NationOptions$Specification(specification));
    this.randomize(random);
    this.establishUnknownEnemy();
    return this;
  }
  /**
   * Initiate a new {@code ServerGame} with information from a
   * saved game.
   *
   * Called from FreeColServer.readGame when restoring a saved game.
   *
   * @param specification The {@code Specification} to use in this game.
   * @param xr The input stream containing the XML.
   * @exception XMLStreamException if an error occurred during parsing.
   */
  _ServerGame$Specification$FreeColXMLReader(specification: Specification, xr: FreeColXMLReader): this {
    this._ServerGame$Specification(specification);
    this.readFromXML(xr);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getNextId(): number {
    let ret = this.nextId;
    this.nextId++;
    return ret;
  }
  /**
   * Get a list of connected players, optionally excluding supplied ones.
   *
   * Do *not* restrict this only to live players, dead players still
   * need to be communicated with (e.g. to tell them they are dead,
   * or to revive them).
   *
   * @param players The {@code Player}s to exclude.
   * @return A list of all connected players, with exclusions.
   */
  getConnectedPlayers(players: Player[]): List<Player> {
    let connPred = (p) => p.isConnected() && CollectionUtils.none$ObjectArr$Predicate(players, CollectionUtils.matchKey$Object(p));
    {
      return CollectionUtils.transform$Collection$Predicate(this.players, connPred);
    }
  }
  /**
   * Send a change set to all live players.
   *
   * @param cs The {@code ChangeSet} to send.
   */
  sendToAll(cs: ChangeSet): void {
    this.sendToList(this.getConnectedPlayers([]), cs);
  }
  /**
   * Send a change set to all players, optionally excluding one.
   *
   * @param player A {@code Player} to exclude.
   * @param cs The {@code ChangeSet} encapsulating the update.
   */
  sendToOthers(player: Player, cs: ChangeSet): void {
    this.sendToList(this.getConnectedPlayers([player]), cs);
  }
  /**
   * Send a change set to a list of players.
   *
   * @param players The list of {@code Player}s to send to.
   * @param cs The {@code ChangeSet} to send.
   */
  sendToList(players: List<Player>, cs: ChangeSet): void {
    for (const $it0 = players.iterator(); $it0.hasNext(); ) {
      let p = $it0.next();
      this.sendTo(p, cs);
    }
  }
  /**
   * Send a change set to one player.
   *
   * @param player The {@code Player} to send to.
   * @param cs The {@code ChangeSet} to send.
   * @return True if the change was sent.
   */
  sendTo(player: Player, cs: ChangeSet): boolean {
    try {
      return player.send(cs);
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        ServerGame.logger.log(Level.WARNING, 'sendTo(' + player.getId() + ',' + $J.str(cs) + ') failed', e);
      } else {
        throw $e1;
      }
    }
    return false;
  }
  /**
   * Establish the unknown enemy player.
   *
   * @return The new unknown enemy {@code Player}.
   */
  establishUnknownEnemy(): Player {
    let ret = this.getUnknownEnemy();
    if (ret != null) {
      return ret;
    }
    let enemy = new ServerPlayer()._ServerPlayer$Game$boolean$Nation(this, false, this.getSpecification().getUnknownEnemyNation());
    this.setUnknownEnemy(enemy);
    return enemy;
  }
  /**
   * Update the players.
   *
   * @param players A list of new {@code Player}s.
   */
  updatePlayers(players: List<Player>): void {
    if (!players.isEmpty()) {
      this.sendToAll(new ChangeSet()._ChangeSet$().addPlayers(players));
    }
  }
  /**
   * Change the AI state of a player.
   *
   * @param player The {@code Player} to change.
   * @param ai The new AI state.
   */
  changeAI(player: Player, ai: boolean): void {
    player.setAI(ai);
    this.sendToAll(ChangeSet.aiChange(player, ai));
  }
  /**
   * Randomize a new game.
   *
   * @param random A pseudo-random number source.
   */
  randomize(random: Random): void {
    if (random != null) {
      NameCache.requireCitiesOfCibola(random);
    }
  }
  /**
   * Checks if anybody has won this game.
   *
   * @return The {@code ServerPlayer} who has won the game or null if none.
   */
  checkForWinner(): ServerPlayer {
    let spec = this.getSpecification();
    if (spec.getBoolean(GameOptions.VICTORY_DEFEAT_REF)) {
      let winner = CollectionUtils.find$Stream$Predicate(this.getLiveEuropeanPlayers([]), (p) => p.getPlayerType() === Player$PlayerType.INDEPENDENT);
      if (winner != null) {
        return winner;
      }
    }
    if (spec.getBoolean(GameOptions.VICTORY_DEFEAT_EUROPEANS)) {
      let winners = CollectionUtils.transform$Stream$Predicate(this.getLiveEuropeanPlayers([]), (p) => !p.isREF());
      if (winners.size() === 1) {
        return winners.get(0);
      }
    }
    if (spec.getBoolean(GameOptions.VICTORY_DEFEAT_HUMANS)) {
      let winners = CollectionUtils.transform$Stream$Predicate(this.getLiveEuropeanPlayers([]), (p) => !p.isAI());
      if (winners.size() === 1) {
        return winners.get(0);
      }
    }
    return null;
  }
  /**
   * Is the next player in a new turn?
   *
   * @return True if the next turn is due.
   */
  isNextPlayerInNewTurn(): boolean {
    let nextPlayer = this.getNextPlayer();
    return this.players.indexOf(this.currentPlayer) > this.players.indexOf(nextPlayer) || this.currentPlayer === nextPlayer;
  }
  /**
   * Change to the next turn for this game.
   *
   * @param cs A {@code ChangeSet} to update.
   */
  csNextTurn(cs: ChangeSet): void {
    let duration = null;
    let now = new JDate().getTime();
    if (this.lastTime >= 0) {
      duration = ', previous turn duration = ' + (now - this.lastTime) + 'ms';
    }
    this.lastTime = now;
    Session.completeAll(cs);
    this.setTurn(this.getTurn().next());
    ServerGame.logger.finest('Turn is now ' + $J.str(this.getTurn()) + '/' + duration);
    cs.add$See$Message(ChangeSet$See.all(), new NewTurnMessage()._NewTurnMessage$Turn(this.getTurn()));
  }
  /**
   * Is it time for the Spanish Succession settlement?
   *
   * @param event The Spanish Succession {@code Event}.
   * @param players A list to fill with the strongest and weakest AIs.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if the Spanish Succession can proceed.
   */
  spanishSuccessionReady(event: Event, players: List<Player>, lb: LogBuilder): boolean {
    let yearLimit = event.getLimit('model.limit.spanishSuccession.year');
    if (!yearLimit.evaluate$Game(this)) {
      return false;
    }
    let weakLimit = event.getLimit('model.limit.spanishSuccession.weakestPlayer');
    let strongLimit = event.getLimit('model.limit.spanishSuccession.strongestPlayer');
    let weakAI = null;
    let strongAI = null;
    let weakScore = 2147483647;
    let strongScore = -2147483648;
    let ready = false;
    lb.add(['Spanish succession scores[']);
    let sep = ', ';
    for (const $it2 = (CollectionUtils.transform$Stream$Predicate(this.getLiveEuropeanPlayers([]), (p) => !p.isREF())).iterator(); $it2.hasNext(); ) {
      let player = $it2.next();
      let ok = strongLimit.evaluate$Player(player);
      ready = !!(ready | ok);
      lb.add([player.getName(), '(', ok, ')']);
      if (!player.isAI()) {
        continue;
      }
      let score = player.getSpanishSuccessionScore();
      lb.add(['=', score, sep]);
      if (strongAI == null || strongScore < score) {
        strongScore = score;
        strongAI = player;
      }
      if (weakLimit.evaluate$Player(player) && (weakAI == null || weakScore > score)) {
        weakScore = score;
        weakAI = player;
      }
    }
    lb.truncate((lb.size() - sep.length) | 0);
    lb.add([']']);
    players.add(weakAI);
    players.add(0, strongAI);
    return ready;
  }
  /**
   * Checks for and if necessary performs the War of Spanish
   * Succession changes.
   *
   * Visibility changes for the winner, loser is killed/irrelevant.
   *
   * @param cs A {@code ChangeSet} to update.
   * @param lb A {@code LogBuilder} to log to.
   * @param event The Spanish Succession {@code Event}.
   * @return The {@code ServerPlayer} that is eliminated if
   *     any, or null if none found.
   */
  csSpanishSuccession(cs: ChangeSet, lb: LogBuilder, event: Event): ServerPlayer {
    let ail = new ArrayList();
    if (!this.spanishSuccessionReady(event, ail, lb)) {
      return null;
    }
    let strongAI = ail.get(0);
    let weakAI = ail.get(1);
    if (weakAI == null || strongAI == null || weakAI === strongAI) {
      return null;
    }
    lb.add([' => ', weakAI.getName(), ' cedes ', strongAI.getName(), ':']);
    let tiles = new ArrayList();
    let updated = new HashSet();
    let strongest = strongAI;
    let weakest = weakAI;
    CollectionUtils.forEach$Stream$Consumer(CollectionUtils.flatten$Stream$Function(this.getLiveNativePlayers([]), (p) => p.getIndianSettlementsWithMissionary(weakest)), (is$) => {
      lb.add([' ', is$.getName(), '(mission)']);
      is$.getTile$().cacheUnseen$Player(strongest);
      tiles.add(is$.getTile$());
      is$.setContacted(strongAI);
      let missionary = is$.getMissionary();
      if (weakest.csChangeOwner(missionary, strongAI, null, null, cs)) {
        is$.getTile$().updateIndianSettlement(strongAI);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(strongAI), [is$]);
      }
    });
    let cl = weakAI.getColonyList();
    let contacts = new HashSet(cl.size());
    for (const $it3 = cl.iterator(); $it3.hasNext(); ) {
      let c = $it3.next();
      updated.addAll(c.getOwnedTiles());
      (c).csChangeOwner(strongAI, false, null, cs);
      lb.add([' ', c.getName()]);
      contacts.add(c.getFirstUnit());
    }
    for (const $it4 = weakAI.getUnitSet().iterator(); $it4.hasNext(); ) {
      let unit = $it4.next();
      lb.add([' ', unit.getId()]);
      if (unit.isOnCarrier()) {
      } else if (!weakest.csChangeOwner(unit, strongAI, null, null, cs)) {
        ServerGame.logger.warning('Owner change failed for ' + $J.str(unit));
      } else {
        unit.setMovesLeft(0);
        unit.setState(Unit$UnitState.ACTIVE);
        if (unit.getLocation() instanceof Europe) {
          unit.setLocation(strongAI.getEurope());
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(strongAI), [unit]);
        } else if (unit.getLocation() instanceof HighSeas) {
          unit.setLocation(strongAI.getHighSeas());
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(strongAI), [unit]);
        } else if (unit.isOnTile()) {
          let tile = unit.getTile$();
          if (!tiles.contains(tile)) {
            tiles.add(tile);
          }
        }
        contacts.add(unit);
      }
    }
    for (const $it5 = contacts.iterator(); $it5.hasNext(); ) {
      let u = $it5.next();
      if (u.hasTile()) {
        (u).csNewContactCheck(u.getTile$(), false, cs);
      }
    }
    let loser = weakAI.getNationLabel();
    let winner = strongAI.getNationLabel();
    this.setSpanishSuccession(true);
    cs.addPartial(ChangeSet$See.all(), this, ['spanishSuccession', $J.str(true)]);
    tiles.removeAll(updated);
    cs.add$See$Collection(ChangeSet$See.perhaps(), tiles);
    weakest.csWithdraw(cs, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'model.game.spanishSuccession', strongAI).addStringTemplate$String$StringTemplate('%loserNation%', loser).addStringTemplate$String$StringTemplate('%nation%', winner), new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(this.getTurn(), HistoryEvent$HistoryEventType.SPANISH_SUCCESSION, null).addStringTemplate$String$StringTemplate('%loserNation%', loser).addStringTemplate$String$StringTemplate('%nation%', winner));
    strongAI.invalidateCanSeeTiles();
    for (const $it6 = this.getFreeColGameObjectList().iterator(); $it6.hasNext(); ) {
      let fcgo = $it6.next();
      if ($J.isa(fcgo, Ownable) && (fcgo).getOwner() === weakAI) {
        throw new RuntimeException('Lurking ' + weakAI.getId() + ' fcgo: ' + $J.str(fcgo));
      }
    }
    return weakest;
  }
  /**
   * Accept a diplomatic trade.  Handles the transfers of TradeItems.
   *
   * Note that first contact contexts may not necessarily have a settlement,
   * but this is ok because first contact trade can only include stance
   * and gold trade items.
   *
   * @param agreement The {@code DiplomacyTrade} agreement.
   * @param unit The {@code Unit} that is trading.
   * @param settlement The {@code Settlement} that is trading.
   * @param cs A {@code ChangeSet} to update.
   * @return True if the trade was completed successfully.
   */
  csAcceptTrade(agreement: DiplomaticTrade, unit: Unit, settlement: Settlement, cs: ChangeSet): boolean {
    let srcPlayer = agreement.getSender();
    let dstPlayer = agreement.getRecipient();
    let visibilityChange = false;
    let fail = false;
    for (const $it7 = agreement.getItems().iterator(); $it7.hasNext(); ) {
      let tradeItem = $it7.next();
      let source = tradeItem.getSource();
      let dest = tradeItem.getDestination();
      if (!tradeItem.isValid()) {
        ServerGame.logger.warning('Trade with invalid tradeItem: ' + $J.str(tradeItem));
        fail = true;
        continue;
      }
      if (source !== srcPlayer && source !== dstPlayer) {
        ServerGame.logger.warning('Trade with invalid source: ' + ((source == null) ? 'null' : source.getId()));
        fail = true;
        continue;
      }
      if (dest !== srcPlayer && dest !== dstPlayer) {
        ServerGame.logger.warning('Trade with invalid destination: ' + ((dest == null) ? 'null' : dest.getId()));
        fail = true;
        continue;
      }
      let colony = tradeItem.getColony(this.getGame());
      if (colony != null && !source.owns(colony)) {
        ServerGame.logger.warning('Trade with invalid source owner: ' + $J.str(colony));
        fail = true;
        continue;
      }
      let gold = tradeItem.getGold();
      if (gold > 0 && !source.checkGold(gold)) {
        ServerGame.logger.warning('Trade with invalid gold: ' + gold);
        fail = true;
        continue;
      }
      let goods = tradeItem.getGoods();
      if (goods != null) {
        let loc = goods.getLocation();
        if ($J.isa(loc, Ownable) && !source.owns(loc)) {
          ServerGame.logger.warning('Trade with invalid source owner: ' + $J.str(loc));
          fail = true;
        } else if (!(loc instanceof GoodsLocation && loc.contains(goods))) {
          ServerGame.logger.warning('Trade of unavailable goods ' + $J.str(goods) + ' at ' + $J.str(loc));
          fail = true;
        } else if (dest.owns(unit) && !unit.couldCarry$Goods(goods)) {
          ServerGame.logger.warning('Trade unit can not carry traded goods: ' + $J.str(goods));
          fail = true;
        }
      }
      let u = tradeItem.getUnit();
      if (u != null) {
        if (!source.owns(u)) {
          ServerGame.logger.warning('Trade with invalid source owner: ' + $J.str(u));
          fail = true;
          continue;
        } else if (dest.owns(unit) && !unit.couldCarry$Unit(u)) {
          ServerGame.logger.warning('Trade unit can not carry traded unit: ' + $J.str(u));
          fail = true;
        }
      }
    }
    if (fail) {
      return false;
    }
    for (const $it8 = agreement.getItems().iterator(); $it8.hasNext(); ) {
      let tradeItem = $it8.next();
      let source = tradeItem.getSource();
      let dest = tradeItem.getDestination();
      let stance = tradeItem.getStance();
      if (stance != null && source.getStance(dest) !== stance && !(source).csChangeStance(stance, dest, true, cs)) {
        ServerGame.logger.warning('Stance trade failure: ' + $J.str(stance));
      }
      let colony = tradeItem.getColony(this.getGame());
      if (colony != null) {
        (colony).csChangeOwner(dest, false, null, cs);
        visibilityChange = true;
      }
      let gold = tradeItem.getGold();
      if (gold > 0) {
        source.modifyGold(-gold);
        dest.modifyGold(gold);
        cs.addPartial(ChangeSet$See.only(source), source, ['gold', String(source.getGold()), 'score', String(source.getScore())]);
        cs.addPartial(ChangeSet$See.only(dest), dest, ['gold', String(dest.getGold()), 'score', String(dest.getScore())]);
      }
      let goods = tradeItem.getGoods();
      if (goods != null && settlement != null) {
        if (dest.owns(settlement)) {
          goods.setLocation(unit);
          GoodsLocation.moveGoods(unit, goods.getType(), goods.getAmount(), settlement);
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(source), [unit]);
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(dest), [settlement.getGoodsContainer()]);
        } else {
          goods.setLocation(settlement);
          GoodsLocation.moveGoods(settlement, goods.getType(), goods.getAmount(), unit);
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(dest), [unit]);
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(source), [settlement.getGoodsContainer()]);
        }
      }
      let victim = tradeItem.getVictim();
      if (victim != null) {
        if ((source).csChangeStance(Stance.WAR, victim, true, cs)) {
          cs.addStance(ChangeSet$See.only(dest), source, Stance.WAR, victim);
          cs.addMessage(dest, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, Stance.WAR.getOtherStanceChangeKey(), source).addStringTemplate$String$StringTemplate('%attacker%', source.getNationLabel()).addStringTemplate$String$StringTemplate('%defender%', victim.getNationLabel()));
        } else {
          ServerGame.logger.warning('Incite trade failure: ' + $J.str(victim));
        }
      }
      let newUnit = tradeItem.getUnit();
      if (newUnit != null && settlement != null) {
        let former = newUnit.getOwner();
        let oldTile = newUnit.getTile$();
        let newLoc: Location;
        if (unit.isOnCarrier()) {
          let carrier = unit.getCarrier();
          if (!carrier.couldCarry$Unit(newUnit)) {
            ServerGame.logger.warning('Can not add ' + $J.str(newUnit) + ' to ' + $J.str(carrier));
            continue;
          }
          newLoc = carrier;
        } else if (dest === unit.getOwner()) {
          newLoc = unit.getTile$();
        } else {
          newLoc = settlement.getTile$();
        }
        if ((source).csChangeOwner(newUnit, dest, null, newLoc, cs)) {
          newUnit.setMovesLeft(0);
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(former), [oldTile]);
        }
        visibilityChange = true;
      }
    }
    if (visibilityChange) {
      srcPlayer.invalidateCanSeeTiles();
      dstPlayer.invalidateCanSeeTiles();
    }
    return true;
  }
  /**
   * Build the updates for a new turn for all the players in this game.
   *
   * @param random A {@code Random} number source.
   * @param lb A {@code LogBuilder} to log to.
   * @param cs A {@code ChangeSet} to update.
   */
  csNewTurn(random: Random, lb: LogBuilder, cs: ChangeSet): void {
    lb.add(['GAME ', this.getId(), ', ']);
    for (const $it9 = this.getLivePlayerList([]).iterator(); $it9.hasNext(); ) {
      let player = $it9.next();
      (player).csNewTurn(random, lb, cs);
    }
    let spec = this.getSpecification();
    let succession = spec.getEvent('model.event.spanishSuccession');
    if (succession != null && !this.getSpanishSuccession()) {
      let loser = this.csSpanishSuccession(cs, lb, succession);
    }
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
    ServerGame.logger = Logger.getLogger($J.cls(ServerGame).getName());
  }
}

$J.define(ServerGame, 'net.sf.freecol.server.model.ServerGame', { kind: 'class', ifaces: ['net.sf.freecol.server.model.TurnTaker'], sup: 'net.sf.freecol.common.model.Game', ctors: { 'net.sf.freecol.common.model.Specification,net.sf.freecol.common.io.FreeColXMLReader': '_ServerGame$Specification$FreeColXMLReader', 'net.sf.freecol.common.model.Specification,java.util.Random': '_ServerGame$Specification$Random', 'net.sf.freecol.common.model.Specification': '_ServerGame$Specification' }, returns: { 'hashCode': 'int', 'isNextPlayerInNewTurn': 'boolean', 'getNextId': 'int' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  NameCache = $J.load('net.sf.freecol.common.i18n.NameCache');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  GoodsLocation = $J.load('net.sf.freecol.common.model.GoodsLocation');
  HighSeas = $J.load('net.sf.freecol.common.model.HighSeas');
  HistoryEvent = $J.load('net.sf.freecol.common.model.HistoryEvent');
  HistoryEvent$HistoryEventType = $J.load('net.sf.freecol.common.model.HistoryEvent$HistoryEventType');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  NationOptions = $J.load('net.sf.freecol.common.model.NationOptions');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  Player$PlayerType = $J.load('net.sf.freecol.common.model.Player$PlayerType');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  ChangeSet = $J.load('net.sf.freecol.common.networking.ChangeSet');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  NewTurnMessage = $J.load('net.sf.freecol.common.networking.NewTurnMessage');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  ServerPlayer = $J.load('net.sf.freecol.server.model.ServerPlayer');
  Session = $J.load('net.sf.freecol.server.model.Session');
});
