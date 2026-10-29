// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/AIPlayer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator, Exception, IOException, IllegalStateException, JString, Level, Logger, Random, StringBuilder, Thread } from '../../../../../../jre/index.ts';
import { AIObject } from './AIObject.ts';

let FreeCol, Messages, Constants$IndianDemandAction, DiplomaticTrade$TradeStatus, FreeColObject, Monarch$MonarchAction, Unit, CollectionUtils, Utils, AIMessage, AIServerAPI, ServerPlayer;

/**
 * Objects of this class contains AI-information for a single {@link
 * Player} and is used for controlling this player.
 *
 * The method {@link #startWorking} gets called by the
 * {@link AIInGameInputHandler} when it is this player's turn.
 */
export class AIPlayer extends AIObject {
  static logger: Logger = null;
  static readonly TAG: string = 'aiPlayer';
  /**
   * Do nothing!
   */
  static nullRunnable: Runnable = null;
  /**
   * A comparator to sort AI units by location.
   */
  static aiUnitLocationComparator: Comparator<AIUnit> = null;
  /**
   * The FreeColGameObject this AIObject contains AI-information for.
   */
  player: Player = null;
  /**
   * The PRNG to use for this AI player.
   */
  aiRandom: Random = null;
  /**
   * The wrapper for the server.
   */
  serverAPI: AIServerAPI = null;
  static readonly RANDOM_STATE_TAG: string = 'randomState';
  /**
   * Creates a new AI player.
   *
   * @param aiMain The {@code AIMain} the player exists within.
   * @param player The {@code Player} to associate this AI player with.
   */
  _AIPlayer$AIMain$Player(aiMain: AIMain, player: Player): this {
    this._AIObject$AIMain$String(aiMain, player.getId());
    this.player = player;
    this.aiRandom = new Random(aiMain.getRandomSeed('Seed for ' + this.getId()));
    this.serverAPI = new AIServerAPI()._AIServerAPI(this);
    this.setInitialized();
    return this;
  }
  /**
   * Creates a new {@code AIPlayer} from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @exception XMLStreamException if a problem was encountered
   *     during parsing.
   */
  _AIPlayer$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._AIObject$AIMain$FreeColXMLReader(aiMain, xr);
    this.serverAPI = new AIServerAPI()._AIServerAPI(this);
    this.setInitialized();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setInitialized(): void {
    this.initialized = this.getPlayer() != null;
  }
  /**
   * Gets the {@code Player} this {@code AIPlayer} is
   * controlling.
   *
   * @return The {@code Player}.
   */
  getPlayer(): Player {
    return this.player;
  }
  /**
   * Gets the PRNG to use for this player.
   *
   * @return A {@code Random} to use for this player.
   */
  getAIRandom(): Random {
    return this.aiRandom;
  }
  /**
   * Gets the advantage of this AI player from the nation type.
   *
   * @return A short string stating the national advantage.
   */
  getAIAdvantage(): string {
    let prefix = 'model.nationType.';
    let id = (this.player == null || this.player.getNationType() == null) ? '' : this.player.getNationType().getId();
    return (id.startsWith(prefix)) ? id.substring(prefix.length) : '';
  }
  /**
   * Gets the connection to the server.
   *
   * @return The connection that can be used when communication with the
   *     server.
   */
  getConnection(): Connection {
    return (this.player.getConnection()).getOtherConnection();
  }
  /**
   * Meaningfully named access to the server API.
   *
   * @return The {@code AIServerAPI} wrapper.
   */
  askServer(): AIServerAPI {
    return this.serverAPI;
  }
  /**
   * Remove one of our owned objects.
   *
   * Subclasses to override.
   *
   * @param ao The {@code AIObject} to remove.
   */
  removeAIObject(ao: AIObject): void {
  }
  /**
   * Gets the AI colony corresponding to a given colony, if any.
   *
   * @param colony The {@code Colony} to look up.
   * @return The corresponding AI colony or null if not found.
   */
  getAIColony(colony: Colony): AIColony {
    return this.getAIMain().getAIColony(colony);
  }
  /**
   * Gets a list of the players AI colonies.
   *
   * @return A list of AI colonies.
   */
  getAIColonies(): List<AIColony> {
    let aiMain = this.getAIMain();
    return CollectionUtils.transform$Stream$Predicate$Function$Collector(this.getPlayer().getColonies(), CollectionUtils.alwaysTrue(), (c) => aiMain.getAIColony(c), CollectionUtils.toListNoNulls());
  }
  /**
   * Gets the AI unit corresponding to a given unit, if any.
   *
   * @param unit The {@code Unit} to look up.
   * @return The corresponding AI unit or null if not found.
   */
  getAIUnit(unit: Unit): AIUnit {
    return this.getAIMain().getAIUnit(unit);
  }
  /**
   * Gets a list of AIUnits for the player.
   *
   * @return A list of AIUnits.
   */
  getAIUnits(): List<AIUnit> {
    let aiUnits = new ArrayList();
    for (const $it0 = this.getPlayer().getUnitSet().iterator(); $it0.hasNext(); ) {
      let u = $it0.next();
      if (u.isDisposed()) {
        AIPlayer.logger.warning('getAIUnits ignoring: ' + u.getId());
        continue;
      }
      let a = this.getAIUnit(u);
      if (a != null) {
        if (a.getUnit() !== u) {
          throw new IllegalStateException('getAIUnits fail: ' + $J.str(u) + '/' + $J.str(a));
        }
        aiUnits.add(a);
      } else {
        AIPlayer.logger.warning('Could not find the AIUnit for: ' + $J.str(u) + ' (' + u.getId() + ')');
      }
    }
    return aiUnits;
  }
  /**
   * Standard stance change determination.
   *
   * @param other The {@code Player} wrt consider stance.
   * @return The new {@code Stance}.
   */
  determineStance(other: Player): Stance {
    return this.player.getStance(other).getStanceFromTension(this.player.getTension$Player(other));
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity$boolean$LogBuilder(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity$boolean$LogBuilder(fix, lb);
    if (this.player == null || this.player.isDisposed()) {
      lb.add(['\n  AIPlayer without underlying player: ', this.getId()]);
      result = result.fail();
    } else if (!this.player.isAI()) {
      lb.add(['\n  AIPlayer that is not an AI: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * Do some work in a subthread.
   *
   * @param runnable The {@code Runnable} work to do.
   */
  invoke(runnable: Runnable): void {
    let thread = new Thread(runnable, FreeCol.SERVER_THREAD + 'AIPlayer(' + this.getPlayer().getName() + ')');
    thread.start();
    AIPlayer.logger.finest('Started ' + $J.str(thread));
  }
  /**
   * Choose a founding father.
   *
   * @param fathers A list of {@code FoundingFather}s to choose from.
   */
  chooseFoundingFatherHandler(fathers: List<FoundingFather>): void {
    let ff = this.selectFoundingFather(fathers);
    if (ff == null) {
      return;
    }
    AIPlayer.logger.finest(this.getId() + ' chose founding father: ' + $J.str(ff));
    this.invoke(() => {
      AIMessage.askChooseFoundingFather(this, fathers, ff);
    });
  }
  /**
   * Handle a diplomacy message.
   *
   * @param our Our {@code FreeColGameObject}.
   * @param other Their {@code FreeColGameObject}.
   * @param agreement The {@code DiplomaticTrade} being negotiated.
   */
  diplomacyHandler(our: FreeColGameObject, other: FreeColGameObject, agreement: DiplomaticTrade): void {
    let sb = new StringBuilder(256);
    sb.append('AI Diplomacy: ').append($J.str(agreement));
    switch (agreement.getStatus()) {
      case DiplomaticTrade$TradeStatus.PROPOSE_TRADE:
        agreement.setStatus(this.acceptDiplomaticTrade(agreement));
        sb.append(' -> ').append($J.str(agreement));
        AIPlayer.logger.fine(sb.toString());
        break;
      default:
        sb.append(' -> ignoring ').append($J.str(agreement.getStatus()));
        AIPlayer.logger.fine(sb.toString());
        return;
    }
    this.invoke(() => {
      AIMessage.askDiplomacy(this, our, other, agreement);
    });
  }
  /**
   * Handle a first contact.
   *
   * @param contactor The contacting {@code Player}.
   * @param contactee The contacted {@code Player}.
   * @param tile The {@code Tile} where contact occurs.
   */
  firstContactHandler(contactor: Player, contactee: Player, tile: Tile): void {
    this.invoke(() => {
      AIMessage.askFirstContact(this, contactor, contactee, tile, true);
    });
  }
  /**
   * Handle a fountain of youth.
   *
   * @param n The number of emigrating units.
   */
  fountainOfYouthHandler(n: number): void {
    this.invoke(() => {
      for (let i = 0; i < n; i++) {
        AIMessage.askEmigrate(this, 0);
      }
    });
  }
  /**
   * Handle a native demand.
   *
   * @param unit The {@code Unit} making demands.
   * @param colony The {@code Colony} where demands are being made.
   * @param type The {@code GoodsType} demanded.
   * @param amount The amount of gold demanded.
   * @param initial The acceptance state of the demand.
   */
  indianDemandHandler(unit: Unit, colony: Colony, type$: GoodsType, amount: number, initial: Constants$IndianDemandAction): void {
    let result = this.indianDemand(unit, colony, type$, amount, initial);
    AIPlayer.logger.finest('AI handling native demand by ' + $J.str(unit) + ' at ' + $J.str(colony) + ' result: ' + $J.str(initial) + ' -> ' + $J.str(result));
    if (result !== Constants$IndianDemandAction.INDIAN_DEMAND_DONE) {
      this.invoke(() => {
        AIMessage.askIndianDemand(this, unit, colony, type$, amount, result);
      });
    }
  }
  /**
   * Handle a looting.
   *
   * @param unit The looting {@code Unit}.
   * @param initialGoods A list of {@code Goods} to choose from.
   * @param defenderId The identifier for the defending unit (may be gone!).
   */
  lootCargoHandler(unit: Unit, initialGoods: List<Goods>, defenderId: string): void {
    let market = this.getPlayer().getMarket();
    let goods = CollectionUtils.sort$Collection$Comparator(initialGoods, market.getSalePriceComparator());
    let loot = new ArrayList();
    let space = unit.getSpaceLeft();
    while (space > 0 && !goods.isEmpty()) {
      let g = goods.removeAt(0);
      if (g.getSpaceTaken() > space) {
        continue;
      }
      loot.add(g);
      space = (space - g.getSpaceTaken()) | 0;
    }
    this.invoke(() => {
      AIMessage.askLoot(this.getAIUnit(unit), defenderId, loot);
    });
  }
  /**
   * Handle the monarch.
   *
   * @param action The {@code MonarchAction} to respond to.
   * @param tax The tax change if any.
   */
  monarchActionHandler(action: Monarch$MonarchAction, tax: number): void {
    let accept: boolean;
    switch (action) {
      case Monarch$MonarchAction.RAISE_TAX_WAR:
      case Monarch$MonarchAction.RAISE_TAX_ACT:
        accept = this.acceptTax(tax);
        break;
      case Monarch$MonarchAction.MONARCH_MERCENARIES:
      case Monarch$MonarchAction.HESSIAN_MERCENARIES:
        accept = this.acceptMercenaries();
        break;
      default:
        AIPlayer.logger.finest('AI player ignoring monarch action ' + $J.str(action));
        return;
    }
    AIPlayer.logger.finest('AI player monarch action ' + $J.str(action) + ' = ' + accept);
    this.invoke(() => {
      AIMessage.askMonarchAction(this, action, accept);
    });
  }
  /**
   * Handle an incoming nation summary.
   *
   * @param other The {@code Player} the summary applies to.
   * @param ns The {@code NationSummary} itself.
   */
  nationSummaryHandler(other: Player, ns: NationSummary): void {
    this.getPlayer().putNationSummary(other, ns);
    AIPlayer.logger.info('Updated nation summary of ' + other.getSuffix$() + ' for AI ' + this.player.getSuffix$());
  }
  /**
   * Handle a native trade.
   *
   * @param action The {@code NativeTradeAction} to perform.
   * @param nt The {@code NativeTrade} itself.
   */
  nativeTradeHandler(action: NativeTrade$NativeTradeAction, nt: NativeTrade): void {
    this.invoke(() => {
      let result = this.handleTrade(action, nt);
      AIMessage.askNativeTrade(this, result, nt);
    });
  }
  /**
   * Handle a new land name.
   *
   * @param unit The {@code Unit} discovering the new world.
   * @param name The default name.
   */
  newLandNameHandler(unit: Unit, name: string): void {
    this.invoke(() => {
      AIMessage.askNewLandName(this, unit, name);
    });
  }
  /**
   * Handle a new region naming.
   *
   * @param region The {@code Region} to name.
   * @param tile The {@code Tile} the tile where the region was found.
   * @param unit The {@code Unit} that discovers the region.
   * @param name The default name.
   */
  newRegionNameHandler(region: Region, tile: Tile, unit: Unit, name: string): void {
    this.invoke(() => {
      AIMessage.askNewRegionName(this, region, tile, unit, name);
    });
  }
  /**
   * Handle reconnect.
   */
  reconnectHandler(): void {
    AIPlayer.logger.warning('Reconnect');
  }
  /**
   * Handle setting the AI state of a player.
   *
   * @param player The {@code Player} to set.
   * @param ai The new AI state.
   */
  setAIHandler(player: Player, ai: boolean): void {
    player.setAI(ai);
  }
  /**
   * Handle a current player setting.
   *
   * @param currentPlayer The new current {@code Player}.
   */
  setCurrentPlayerHandler(currentPlayer: Player): void {
    if ($J.equals(this.getPlayer().getId(), currentPlayer.getId())) {
      this.invoke(() => {
        try {
          this.startWorking();
        } catch ($e1) {
          if ($J.isa($e1, Exception)) {
            let e = $J.exc($e1);
            AIPlayer.logger.log(Level.SEVERE, 'Unhandled exception from the AI. The AI\'s turn has been ended prematurely.', e);
            this.askServer().chat(currentPlayer, Messages.message$String('ai.chat.stoppedWorking'));
          } else {
            throw $e1;
          }
        }
        AIMessage.askEndTurn(this);
      });
    }
  }
  /**
   * Decide whether to accept an Indian demand, or not.  Or for native
   * players, return the result of the demand.
   *
   * @param unit The {@code Unit} making demands.
   * @param colony The {@code Colony} where demands are being made.
   * @param type The {@code GoodsType} demanded.
   * @param amount The amount of gold demanded.
   * @param accept The acceptance state of the demand.
   * @return The result of the demand.
   */
  indianDemand(unit: Unit, colony: Colony, type$: GoodsType, amount: number, accept: Constants$IndianDemandAction): Constants$IndianDemandAction {
    return Constants$IndianDemandAction.INDIAN_DEMAND_REJECT;
  }
  /**
   * Resolves a diplomatic trade offer.
   *
   * @param agreement The proposed {@code DiplomaticTrade}.
   * @return The {@code TradeStatus} to apply to the agreement.
   */
  acceptDiplomaticTrade(agreement: DiplomaticTrade): DiplomaticTrade$TradeStatus {
    return DiplomaticTrade$TradeStatus.REJECT_TRADE;
  }
  /**
   * Decides to accept a tax raise or not.
   * Overridden by the European player.
   *
   * @param tax The tax raise.
   * @return True if the raise is accepted.
   */
  acceptTax(tax: number): boolean {
    return false;
  }
  /**
   * Decides to accept an offer of mercenaries or not.
   * Overridden by the European player.
   *
   * @return True if the mercenaries are accepted.
   */
  acceptMercenaries(): boolean {
    return false;
  }
  /**
   * Selects the most useful founding father offered.
   * Overridden by EuropeanAIPlayers.
   *
   * @param ffs The founding fathers on offer.
   * @return The founding father selected.
   */
  selectFoundingFather(ffs: List<FoundingFather>): FoundingFather {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    let rs: string;
    try {
      rs = Utils.getRandomState(this.aiRandom);
    } catch ($e2) {
      if ($J.isa($e2, IOException)) {
        let ioe = $J.exc($e2);
        AIPlayer.logger.log(Level.WARNING, 'Could not get random state', ioe);
        return;
      } else {
        throw $e2;
      }
    }
    xw.writeAttribute(AIPlayer.RANDOM_STATE_TAG, rs);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let aiMain = this.getAIMain();
    this.player = xr.findFreeColGameObject(aiMain.getGame(), FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(ServerPlayer), null, true);
    let rnd = Utils.restoreRandomState(xr.getAttribute$String$String(AIPlayer.RANDOM_STATE_TAG, null));
    this.aiRandom = (rnd != null) ? rnd : new Random(aiMain.getRandomSeed('Seed for ' + this.getId()));
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return AIPlayer.TAG;
  }
  static $clinit() {
    AIPlayer.logger = Logger.getLogger($J.cls(AIPlayer).getName());
    AIPlayer.nullRunnable = () => {
    };
    AIPlayer.aiUnitLocationComparator = Comparator.comparing(($p0) => $p0.getUnit(), Unit.locComparator);
  }
}

$J.define(AIPlayer, 'net.sf.freecol.server.ai.AIPlayer', { kind: 'class', sup: 'net.sf.freecol.server.ai.AIObject', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_AIPlayer$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Player': '_AIPlayer$AIMain$Player' }, returns: { 'getXMLTagName': 'java.lang.String', 'getAIUnits': 'java.util.List', 'getAIColonies': 'java.util.List', 'getConnection': 'net.sf.freecol.common.networking.Connection', 'getAIAdvantage': 'java.lang.String', 'getAIRandom': 'java.util.Random', 'getPlayer': 'net.sf.freecol.common.model.Player' }, meths: { 'checkIntegrity(boolean,net.sf.freecol.common.util.LogBuilder)': 'checkIntegrity$boolean$LogBuilder' }, clinit: true, lazy: ['logger', 'nullRunnable', 'aiUnitLocationComparator'] });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Constants$IndianDemandAction = $J.load('net.sf.freecol.common.model.Constants$IndianDemandAction');
  DiplomaticTrade$TradeStatus = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeStatus');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Monarch$MonarchAction = $J.load('net.sf.freecol.common.model.Monarch$MonarchAction');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
  AIServerAPI = $J.load('net.sf.freecol.server.ai.AIServerAPI');
  ServerPlayer = $J.load('net.sf.freecol.server.model.ServerPlayer');
});
