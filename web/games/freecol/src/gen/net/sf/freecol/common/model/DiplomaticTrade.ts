// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/DiplomaticTrade.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let ColonyTradeItem, GoldTradeItem, GoodsTradeItem, InciteTradeItem, Player, Stance, StanceTradeItem, StringTemplate, UnitTradeItem, CollectionUtils, StringUtils;

/**
 * The class {@code DiplomaticTrade} represents an offer one
 * player can make another.
 *
 * This has to be a FCGO so that it can be serialized, but instances are not
 * interned.
 */
export class DiplomaticTrade extends FreeColGameObject {
  static readonly TAG: string = 'diplomaticTrade';
  /**
   * The context of this agreement.
   */
  context: DiplomaticTrade$TradeContext = null;
  /**
   * The status of this agreement.
   */
  status_: DiplomaticTrade$TradeStatus = null;
  /**
   * The player who proposed agreement.
   */
  sender: Player = null;
  /**
   * The player who is to accept this agreement.
   */
  recipient: Player = null;
  /**
   * The individual items the trade consists of.
   */
  items: List<TradeItem> = null;
  /**
   * Counter for the number of iterations on this attempt to agree.
   */
  version: number = 0;
  static readonly CONTEXT_TAG: string = 'context';
  static readonly RECIPIENT_TAG: string = 'recipient';
  static readonly SENDER_TAG: string = 'sender';
  static readonly STATUS_TAG: string = 'status';
  static readonly VERSION_TAG: string = 'version';
  $init_DiplomaticTrade() {
    this.items = new ArrayList();
  }
  /**
   * Simple constructor, used in Game.newInstance.
   *
   * @param game The enclosing {@code Game}.
   * @param id The identifier (ignored).
   */
  _DiplomaticTrade$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, '');
    this.$init_DiplomaticTrade();
    return this;
  }
  /**
   * Creates a new {@code DiplomaticTrade} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param context The {@code TradeContext} for this agreement.
   * @param sender The sending {@code Player}.
   * @param recipient The recipient {@code Player}.
   * @param items A list of items to trade.
   * @param version The trade version number.
   */
  _DiplomaticTrade$Game$TradeContext$Player$Player$List$int(game: Game, context: DiplomaticTrade$TradeContext, sender: Player, recipient: Player, items: List<TradeItem>, version: number): this {
    this._DiplomaticTrade$Game$String(game, '');
    this.context = context;
    this.sender = sender;
    this.recipient = recipient;
    this.status_ = DiplomaticTrade$TradeStatus.PROPOSE_TRADE;
    this.items.clear();
    if (items != null) {
      this.items.addAll(items);
    }
    this.version = version;
    return this;
  }
  /**
   * Make a new diplomatic trade for a given context that establishes
   * peace between two given players.
   *
   * @param context The {@code TradeContext} the peace arises in.
   * @param sender The sending {@code Player}.
   * @param recipient The recipient {@code Player}.
   * @return A suitable {@code DiplomaticTrade}.
   */
  static makePeaceTreaty(context: DiplomaticTrade$TradeContext, sender: Player, recipient: Player): DiplomaticTrade {
    let game = sender.getGame();
    let dt = new DiplomaticTrade()._DiplomaticTrade$Game$TradeContext$Player$Player$List$int(game, context, sender, recipient, null, 0);
    dt.add(new StanceTradeItem()._StanceTradeItem$Game$Player$Player$Stance(game, sender, recipient, Stance.PEACE));
    dt.add(new StanceTradeItem()._StanceTradeItem$Game$Player$Player$Stance(game, recipient, sender, Stance.PEACE));
    return dt;
  }
  /**
   * Get the trade context.
   *
   * @return The context of this agreement.
   */
  getContext(): DiplomaticTrade$TradeContext {
    return this.context;
  }
  /**
   * Get the trade status.
   *
   * @return The status of this agreement.
   */
  getStatus(): DiplomaticTrade$TradeStatus {
    return this.status_;
  }
  /**
   * Set the trade status.
   *
   * @param status The new {@code TradeStatus} for this agreement.
   */
  setStatus(status: DiplomaticTrade$TradeStatus): void {
    this.status_ = status;
  }
  /**
   * Get the sending player.
   *
   * @return The sending {@code Player}.
   */
  getSender(): Player {
    return this.sender;
  }
  /**
   * Set the sending player.
   *
   * @param newSender The new sending {@code Player}.
   */
  setSender(newSender: Player): void {
    this.sender = newSender;
  }
  /**
   * Get the recipient player.
   *
   * @return The recipient {@code Player}.
   */
  getRecipient(): Player {
    return this.recipient;
  }
  /**
   * Set the recieving player.
   *
   * @param newRecipient The new recipient {@code Player}.
   */
  setRecipient(newRecipient: Player): void {
    this.recipient = newRecipient;
  }
  /**
   * Get the other player in a trade.
   *
   * @param player The known {@code Player}.
   * @return The other player, not the supplied known one.
   */
  getOtherPlayer(player: Player): Player {
    return (this.sender === player) ? this.recipient : this.sender;
  }
  /**
   * Handy utility to get the message associated with sending this
   * agreement from a player to a settlement owner.
   *
   * @param player The sending {@code Player}.
   * @param settlement The {@code Settlement} to send to.
   * @return A {@code StringTemplate} for the message.
   */
  getSendMessage(player: Player, settlement: Settlement): StringTemplate {
    return (StringTemplate.template$String('model.diplomaticTrade.send.' + this.getContext().getKey())).addStringTemplate$String$StringTemplate('%nation%', settlement.getOwner().getCountryLabel()).addStringTemplate$String$StringTemplate('%settlement%', settlement.getLocationLabelFor(player));
  }
  /**
   * Handy utility to get the message associated with sending this
   * agreement from a player to a settlement owner.
   *
   * @param player The {@code Player} the offer came from.
   * @return A {@code StringTemplate} for the message.
   */
  getReceiveMessage(player: Player): StringTemplate {
    return (StringTemplate.template$String('model.diplomaticTrade.receive.' + this.getContext().getKey())).addStringTemplate$String$StringTemplate('%nation%', player.getCountryLabel());
  }
  /**
   * Add to the DiplomaticTrade.
   *
   * @param newItem The {@code TradeItem} to add.
   */
  add(newItem: TradeItem): void {
    if (newItem.isUnique()) {
      this.removeType(newItem.getClass());
    }
    this.items.add(newItem);
  }
  /**
   * Remove a from the DiplomaticTrade.
   *
   * @param newItem The {@code TradeItem} to remove.
   */
  remove$TradeItem(newItem: TradeItem): void {
    this.items.remove(newItem);
  }
  /**
   * Remove from the DiplomaticTrade.
   *
   * @param index The index of the {@code TradeItem} to remove
   */
  remove$int(index: number): void {
    this.items.removeAt(index);
  }
  /**
   * Removes all trade items of the same class as the given argument.
   *
   * @param itemClass The {@code Class} of
   *     {@code TradeItem} to remove.
   */
  removeType(itemClass: JClass<TradeItem>): void {
    CollectionUtils.removeInPlace$Collection$Predicate(this.items, CollectionUtils.matchKey$Object$Function(itemClass, ($p0) => $p0.getClass()));
  }
  /**
   * Remove all trade items from this agreement.
   */
  clear(): void {
    this.items.clear();
  }
  /**
   * Get a list of all items to trade.
   *
   * @return A list of all the {@code TradeItems}.
   */
  getItems(): List<TradeItem> {
    return this.items;
  }
  /**
   * Are there no trade items present?
   *
   * @return True if there are no trade items present.
   */
  isEmpty(): boolean {
    return this.items.isEmpty();
  }
  /**
   * Get the items offered by a particular player.
   *
   * @param player The {@code Player} to check.
   * @return A list of {@code TradeItem}s offered by the player.
   */
  getItemsGivenBy(player: Player): List<TradeItem> {
    return CollectionUtils.transform$Collection$Predicate(this.items, CollectionUtils.matchKey$Object$Function(player, ($p0) => $p0.getSource()));
  }
  /**
   * Get the stance being offered.
   *
   * @return The {@code Stance} offered in this trade, or null if none.
   */
  getStance(): Stance {
    let ti = CollectionUtils.find$Collection$Predicate(this.items, (i) => i instanceof StanceTradeItem);
    return (ti == null) ? null : ti.getStance();
  }
  /**
   * Get a list of colonies offered in this trade.
   *
   * @param player The {@code Player} offering the colonies.
   * @return A list of {@code Colony}s offered in this trade.
   */
  getColoniesGivenBy(player: Player): List<Colony> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.items, (ti) => ti instanceof ColonyTradeItem && ti.getSource() === player, (ti) => ti.getColony(player.getGame()));
  }
  /**
   * Get the gold offered in this trade by a given player.
   *
   * @param player The {@code Player} to check.
   * @return The gold offered in this trade.
   */
  getGoldGivenBy(player: Player): number {
    let ti = CollectionUtils.find$Collection$Predicate(this.items, (i) => i instanceof GoldTradeItem && player === i.getSource());
    return (ti == null) ? -1 : ti.getGold();
  }
  /**
   * Get the goods being offered.
   *
   * @param player The {@code Player} offering the goods.
   * @return A list of {@code Goods} offered in this trade.
   */
  getGoodsGivenBy(player: Player): List<Goods> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.items, (ti) => ti instanceof GoodsTradeItem && ti.getSource() === player, ($p0) => $p0.getGoods());
  }
  /**
   * Get the player being incited against.
   *
   * @return The {@code Player} to be incited against.
   */
  getVictim(): Player {
    let ti = CollectionUtils.find$Collection$Predicate(this.items, (i) => i instanceof InciteTradeItem);
    return (ti == null) ? null : ti.getVictim();
  }
  /**
   * Get a list of units offered in this trade.
   *
   * @param player The {@code Player} offering the units.
   * @return A list of {@code Unit}s offered in this trade.
   */
  getUnitsGivenBy(player: Player): List<Unit> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.items, (ti) => ti instanceof UnitTradeItem && ti.getSource() === player, ($p0) => $p0.getUnit());
  }
  /**
   * Gets the version of this agreement.
   *
   * @return The version number.
   */
  getVersion(): number {
    return this.version;
  }
  /**
   * Increment the version of this agreement.
   */
  incrementVersion(): void {
    this.version++;
  }
  /**
   * {@inheritDoc}
   */
  isInternable(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(DiplomaticTrade));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.context = o.getContext();
    this.status_ = o.getStatus();
    this.sender = game.updateRef$FreeColGameObject(o.getSender());
    this.recipient = game.updateRef$FreeColGameObject(o.getRecipient());
    this.items.clear();
    this.items.addAll(game.updateRef$Collection(o.getItems()));
    this.version = o.getVersion();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$Enum(DiplomaticTrade.CONTEXT_TAG, this.context);
    xw.writeAttribute$String$FreeColObject(DiplomaticTrade.SENDER_TAG, this.sender);
    xw.writeAttribute$String$FreeColObject(DiplomaticTrade.RECIPIENT_TAG, this.recipient);
    xw.writeAttribute$String$Enum(DiplomaticTrade.STATUS_TAG, this.status_);
    xw.writeAttribute$String$int(DiplomaticTrade.VERSION_TAG, this.version);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it0 = this.items.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      item.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.context = xr.getAttribute$String$Class$Enum(DiplomaticTrade.CONTEXT_TAG, $J.cls(DiplomaticTrade$TradeContext), null);
    this.sender = xr.getAttribute$Game$String$Class$FreeColObject(this.getGame(), DiplomaticTrade.SENDER_TAG, $J.cls(Player), null);
    this.recipient = xr.getAttribute$Game$String$Class$FreeColObject(this.getGame(), DiplomaticTrade.RECIPIENT_TAG, $J.cls(Player), null);
    this.status_ = xr.getAttribute$String$Class$Enum(DiplomaticTrade.STATUS_TAG, $J.cls(DiplomaticTrade$TradeStatus), DiplomaticTrade$TradeStatus.REJECT_TRADE);
    this.version = xr.getAttribute$String$int(DiplomaticTrade.VERSION_TAG, 0);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.items.clear();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(ColonyTradeItem.TAG, tag)) {
      this.add(new ColonyTradeItem()._ColonyTradeItem$Game$FreeColXMLReader(this.getGame(), xr));
    } else if ($J.equals(GoldTradeItem.TAG, tag)) {
      this.add(new GoldTradeItem()._GoldTradeItem$Game$FreeColXMLReader(this.getGame(), xr));
    } else if ($J.equals(GoodsTradeItem.TAG, tag)) {
      this.add(new GoodsTradeItem()._GoodsTradeItem$Game$FreeColXMLReader(this.getGame(), xr));
    } else if ($J.equals(InciteTradeItem.TAG, tag)) {
      this.add(new InciteTradeItem()._InciteTradeItem$Game$FreeColXMLReader(this.getGame(), xr));
    } else if ($J.equals(StanceTradeItem.TAG, tag)) {
      this.add(new StanceTradeItem()._StanceTradeItem$Game$FreeColXMLReader(this.getGame(), xr));
    } else if ($J.equals(UnitTradeItem.TAG, tag)) {
      this.add(new UnitTradeItem()._UnitTradeItem$Game$FreeColXMLReader(this.getGame(), xr));
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return DiplomaticTrade.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(128);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.getContext())).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.getStatus())).append(' from=').append(this.getSender().getId()).append(' to=').append(this.getRecipient().getId()).append(' version=').append(String(this.getVersion())).append(' [');
    for (const $it1 = this.getItems().iterator(); $it1.hasNext(); ) {
      let item = $it1.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(item));
    }
    sb.append(' ]]');
    return sb.toString();
  }
}

/**
 * A context for the trade.
 */
export class DiplomaticTrade$TradeContext extends JEnum {
  static CONTACT: DiplomaticTrade$TradeContext = null;
  static DIPLOMATIC: DiplomaticTrade$TradeContext = null;
  static TRADE: DiplomaticTrade$TradeContext = null;
  static TRIBUTE: DiplomaticTrade$TradeContext = null;
  static $VALUES: DiplomaticTrade$TradeContext[] = null;
  _DiplomaticTrade$TradeContext($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Get a message key for this trade context.
   *
   * @return A message key.
   */
  getKey(): string {
    return StringUtils.getEnumKey(this);
  }
  static values(): DiplomaticTrade$TradeContext[] { return DiplomaticTrade$TradeContext.$VALUES.slice(); }
  static valueOf(name: string): DiplomaticTrade$TradeContext { return $J.enumValueOf(DiplomaticTrade$TradeContext, name); }
  static $clinit() {
    DiplomaticTrade$TradeContext.CONTACT = new DiplomaticTrade$TradeContext()._DiplomaticTrade$TradeContext('CONTACT', 0);
    DiplomaticTrade$TradeContext.DIPLOMATIC = new DiplomaticTrade$TradeContext()._DiplomaticTrade$TradeContext('DIPLOMATIC', 1);
    DiplomaticTrade$TradeContext.TRADE = new DiplomaticTrade$TradeContext()._DiplomaticTrade$TradeContext('TRADE', 2);
    DiplomaticTrade$TradeContext.TRIBUTE = new DiplomaticTrade$TradeContext()._DiplomaticTrade$TradeContext('TRIBUTE', 3);
    DiplomaticTrade$TradeContext.$VALUES = [DiplomaticTrade$TradeContext.CONTACT, DiplomaticTrade$TradeContext.DIPLOMATIC, DiplomaticTrade$TradeContext.TRADE, DiplomaticTrade$TradeContext.TRIBUTE];
  }
}

/**
 * A type for the trade status.
 */
export class DiplomaticTrade$TradeStatus extends JEnum {
  static PROPOSE_TRADE: DiplomaticTrade$TradeStatus = null;
  static ACCEPT_TRADE: DiplomaticTrade$TradeStatus = null;
  static REJECT_TRADE: DiplomaticTrade$TradeStatus = null;
  static $VALUES: DiplomaticTrade$TradeStatus[] = null;
  _DiplomaticTrade$TradeStatus($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): DiplomaticTrade$TradeStatus[] { return DiplomaticTrade$TradeStatus.$VALUES.slice(); }
  static valueOf(name: string): DiplomaticTrade$TradeStatus { return $J.enumValueOf(DiplomaticTrade$TradeStatus, name); }
  static $clinit() {
    DiplomaticTrade$TradeStatus.PROPOSE_TRADE = new DiplomaticTrade$TradeStatus()._DiplomaticTrade$TradeStatus('PROPOSE_TRADE', 0);
    DiplomaticTrade$TradeStatus.ACCEPT_TRADE = new DiplomaticTrade$TradeStatus()._DiplomaticTrade$TradeStatus('ACCEPT_TRADE', 1);
    DiplomaticTrade$TradeStatus.REJECT_TRADE = new DiplomaticTrade$TradeStatus()._DiplomaticTrade$TradeStatus('REJECT_TRADE', 2);
    DiplomaticTrade$TradeStatus.$VALUES = [DiplomaticTrade$TradeStatus.PROPOSE_TRADE, DiplomaticTrade$TradeStatus.ACCEPT_TRADE, DiplomaticTrade$TradeStatus.REJECT_TRADE];
  }
}

$J.define(DiplomaticTrade, 'net.sf.freecol.common.model.DiplomaticTrade', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.DiplomaticTrade$TradeContext,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player,java.util.List,int': '_DiplomaticTrade$Game$TradeContext$Player$Player$List$int', 'net.sf.freecol.common.model.Game,java.lang.String': '_DiplomaticTrade$Game$String' }, returns: { 'getXMLTagName': 'java.lang.String', 'isInternable': 'boolean', 'getVersion': 'int', 'getVictim': 'net.sf.freecol.common.model.Player', 'getStance': 'net.sf.freecol.common.model.Stance', 'isEmpty': 'boolean', 'getItems': 'java.util.List', 'getRecipient': 'net.sf.freecol.common.model.Player', 'getSender': 'net.sf.freecol.common.model.Player', 'getStatus': 'net.sf.freecol.common.model.DiplomaticTrade$TradeStatus', 'getContext': 'net.sf.freecol.common.model.DiplomaticTrade$TradeContext' }, meths: { 'remove(int)': 'remove$int', 'remove(net.sf.freecol.common.model.TradeItem)': 'remove$TradeItem' } });
$J.define(DiplomaticTrade$TradeContext, 'net.sf.freecol.common.model.DiplomaticTrade$TradeContext', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_DiplomaticTrade$TradeContext' }, returns: { 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'CONTACT', 'DIPLOMATIC', 'TRADE', 'TRIBUTE'] });
$J.define(DiplomaticTrade$TradeStatus, 'net.sf.freecol.common.model.DiplomaticTrade$TradeStatus', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_DiplomaticTrade$TradeStatus' }, clinit: true, lazy: ['$VALUES', 'PROPOSE_TRADE', 'ACCEPT_TRADE', 'REJECT_TRADE'] });
$J.module(() => {
  ColonyTradeItem = $J.load('net.sf.freecol.common.model.ColonyTradeItem');
  GoldTradeItem = $J.load('net.sf.freecol.common.model.GoldTradeItem');
  GoodsTradeItem = $J.load('net.sf.freecol.common.model.GoodsTradeItem');
  InciteTradeItem = $J.load('net.sf.freecol.common.model.InciteTradeItem');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  StanceTradeItem = $J.load('net.sf.freecol.common.model.StanceTradeItem');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  UnitTradeItem = $J.load('net.sf.freecol.common.model.UnitTradeItem');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
