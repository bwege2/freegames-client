// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/GUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JEnum, JString, Logger } from '../../../../../../jre/index.ts';
import { FreeColClientHolder } from '../control/FreeColClientHolder.ts';

let ImageIcon, FreeCol, ClientOptions, ChoiceItem, FreeColDebugger, Messages, Ability, Constants$ArmedUnitSettlementAction, Constants$BoycottAction, Constants$ClaimAction, Constants$MissionaryAction, Constants$ScoutColonyAction, Constants$ScoutIndianSettlementAction, Constants$TradeAction, Constants$TradeBuyAction, Constants$TradeSellAction, Stance, StringTemplate, Tension$Level, Unit$UnitLabelType, ResourceManager;

/**
 * The API and common reusable functionality for the overall GUI.
 */
export class GUI extends FreeColClientHolder {
  static logger: Logger = null;
  /**
   * Levels (danger, finance) for confirmEuropeanTribute().
   */
  static levels: string[] = null;
  /**
   * Create the GUI.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _GUI(freeColClient: FreeColClient): this {
    this._FreeColClientHolder(freeColClient);
    return this;
  }
  /**
   * Simple modal confirmation dialog.
   *
   * @param textKey A string to use as the message key.
   * @param okKey A key for the message on the "ok" button.
   * @param cancelKey A key for the message on the "cancel" button.
   * @return True if the "ok" button was selected.
   */
  confirm$String$String$String(textKey: string, okKey: string, cancelKey: string): boolean {
    return this.confirm$Tile$StringTemplate$ImageIcon$String$String(null, StringTemplate.key$String(textKey), null, okKey, cancelKey);
  }
  /**
   * Primitive modal confirmation dialog.
   *
   * @param template The {@code StringTemplate} explaining the choice.
   * @param okKey A key for the "ok" button.
   * @param cancelKey A key for the "cancel" button.
   * @return True if the "ok" button was selected.
   */
  confirm$StringTemplate$String$String(template: StringTemplate, okKey: string, cancelKey: string): boolean {
    return this.confirm$Tile$StringTemplate$ImageIcon$String$String(null, template, null, okKey, cancelKey);
  }
  /**
   * GoodsType-specific modal confirmation dialog.
   *
   * @param tile An optional {@code Tile} to expose.
   * @param template The {@code StringTemplate} explaining the choice.
   * @param goodsType A goods type to make an icon for the dialog from.
   * @param okKey A key for the "ok" button.
   * @param cancelKey A key for the "cancel" button.
   * @return True if the "ok" button was selected.
   */
  confirm$Tile$StringTemplate$GoodsType$String$String(tile: Tile, template: StringTemplate, goodsType: GoodsType, okKey: string, cancelKey: string): boolean {
    let icon = new ImageIcon()._ImageIcon$Image(this.getFixedImageLibrary().getScaledGoodsTypeImage(goodsType));
    return this.confirm$Tile$StringTemplate$ImageIcon$String$String(tile, template, icon, okKey, cancelKey);
  }
  /**
   * Settlement-specific modal confirmation dialog.
   *
   * @param tile An optional {@code Tile} to expose.
   * @param template The {@code StringTemplate} explaining the choice.
   * @param settlement A settlement to make an icon for the dialog from.
   * @param okKey A key for the "ok" button.
   * @param cancelKey A key for the "cancel" button.
   * @return True if the "ok" button was selected.
   */
  confirm$Tile$StringTemplate$Settlement$String$String(tile: Tile, template: StringTemplate, settlement: Settlement, okKey: string, cancelKey: string): boolean {
    let icon = new ImageIcon()._ImageIcon$Image(this.getFixedImageLibrary().getScaledSettlementImage(settlement));
    return this.confirm$Tile$StringTemplate$ImageIcon$String$String(tile, template, icon, okKey, cancelKey);
  }
  /**
   * Unit-specific modal confirmation dialog.
   *
   * @param tile An optional {@code Tile} to expose.
   * @param template The {@code StringTemplate} explaining the choice.
   * @param unit A unit to make an icon for the dialog from.
   * @param okKey A key for the "ok" button.
   * @param cancelKey A key for the "cancel" button.
   * @return True if the "ok" button was selected.
   */
  confirm$Tile$StringTemplate$Unit$String$String(tile: Tile, template: StringTemplate, unit: Unit, okKey: string, cancelKey: string): boolean {
    let icon = new ImageIcon()._ImageIcon$Image(this.getFixedImageLibrary().getScaledUnitImage$Unit(unit));
    return this.confirm$Tile$StringTemplate$ImageIcon$String$String(tile, template, icon, okKey, cancelKey);
  }
  /**
   * Confirm that a unit should abandon its educational activity.
   *
   * @param unit The {@code Unit} to check.
   * @param leaveColony True if the unit is about to leave the colony,
   *     not just the education building.
   * @return True if the unit can proceed.
   */
  confirmAbandonEducation(unit: Unit, leaveColony: boolean): boolean {
    if (!unit.isInColony()) {
      return true;
    }
    let teacher = unit.getStudent() != null;
    let student = leaveColony && unit.getTeacher() != null;
    if (!teacher && !student) {
      return true;
    }
    let school = ((teacher) ? unit.getLocation() : unit.getTeacher().getLocation());
    let label = unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL);
    let template = (leaveColony) ? StringTemplate.template$String('abandonEducation.text').addStringTemplate$String$StringTemplate('%unit%', label).addName$String$String('%colony%', school.getColony().getName()).addNamed$String$Named('%building%', school).addStringTemplate$String$StringTemplate('%action%', (teacher) ? StringTemplate.key$String('abandonEducation.action.teaching') : StringTemplate.key$String('abandonEducation.action.studying')) : (teacher) ? StringTemplate.template$String('abandonTeaching.text').addStringTemplate$String$StringTemplate('%unit%', label).addNamed$String$Named('%building%', school) : null;
    return template == null || this.confirm$Tile$StringTemplate$Unit$String$String(unit.getTile$(), template, unit, 'abandonEducation.yes', 'abandonEducation.no');
  }
  /**
   * If a unit has a trade route, get confirmation that it is
   * ok to clear it and set a destination.
   *
   * @param unit The {@code Unit} to check.
   * @return Whether it is acceptable to set a destination for this unit.
   */
  confirmClearTradeRoute(unit: Unit): boolean {
    let tr = unit.getTradeRoute();
    if (tr == null) {
      return true;
    }
    let template = StringTemplate.template$String('clearTradeRoute.text').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addName$String$String('%route%', tr.getName());
    return this.confirm$Tile$StringTemplate$Unit$String$String(unit.getTile$(), template, unit, 'yes', 'no');
  }
  /**
   * Confirm whether the player wants to demand tribute from a colony.
   *
   * @param attacker The potential attacking {@code Unit}.
   * @param colony The target {@code Colony}.
   * @param ns A {@code NationSummary} of the other nation.
   * @return The amount of tribute to demand, positive if the demand
   *     should proceed.
   */
  confirmEuropeanTribute(attacker: Unit, colony: Colony, ns: NationSummary): number {
    let player = attacker.getOwner();
    let other = colony.getOwner();
    let strength = player.calculateStrength(false);
    let otherStrength = (ns == null) ? strength : ns.getMilitaryStrength();
    let mil = (otherStrength <= 1 || Math.imul(otherStrength, 5) < strength) ? 0 : (strength === 0 || Math.imul(strength, 5) < otherStrength) ? 2 : 1;
    let t: StringTemplate;
    let gold = (ns == null) ? 0 : ns.getGold();
    if (gold === 0) {
      t = StringTemplate.template$String('confirmTribute.broke').addStringTemplate$String$StringTemplate('%nation%', other.getNationLabel());
      this.showInformationPanel$StringTemplate(t);
      return -1;
    }
    let fin = (gold <= 100) ? 0 : (gold <= 1000) ? 1 : 2;
    t = StringTemplate.template$String('confirmTribute.european').addStringTemplate$String$StringTemplate('%nation%', other.getNationLabel()).addStringTemplate$String$StringTemplate('%danger%', StringTemplate.template$String('danger.' + GUI.levels[mil])).addStringTemplate$String$StringTemplate('%finance%', StringTemplate.template$String('finance.' + GUI.levels[fin]));
    return this.showSelectTributeAmountDialog(t, gold);
  }
  /**
   * Check if an attack results in a transition from peace or cease fire to
   * war and, if so, warn the player.
   *
   * @param attacker The potential attacking {@code Unit}.
   * @param target The target {@code Tile}.
   * @return True to attack, false to abort.
   */
  confirmHostileAction(attacker: Unit, target: Tile): boolean {
    if (attacker.hasAbility$String(Ability.PIRACY)) {
      return true;
    }
    let enemy: Player;
    if (target.hasSettlement()) {
      enemy = target.getSettlement().getOwner();
    } else if (target === attacker.getTile$()) {
      enemy = target.getOwner();
      if (enemy == null) {
        return true;
      }
    } else {
      let defender = target.getDefendingUnit(attacker);
      if (defender == null) {
        GUI.logger.warning('Attacking, but no defender - will try!');
        return true;
      }
      if (defender.hasAbility$String(Ability.PIRACY)) {
        return true;
      }
      enemy = defender.getOwner();
    }
    let messageId: string;
    switch (attacker.getOwner().getStance(enemy)) {
      case Stance.WAR:
        GUI.logger.finest('Player at war, no confirmation needed');
        return true;
      case Stance.CEASE_FIRE:
        messageId = 'confirmHostile.ceaseFire';
        break;
      case Stance.ALLIANCE:
        messageId = 'confirmHostile.alliance';
        break;
      case Stance.UNCONTACTED:
      case Stance.PEACE:
      default:
        messageId = 'confirmHostile.peace';
        break;
    }
    let t = StringTemplate.template$String(messageId).addStringTemplate$String$StringTemplate('%nation%', enemy.getNationLabel());
    return this.confirm$Tile$StringTemplate$Unit$String$String(attacker.getTile$(), t, attacker, 'confirmHostile.yes', 'cancel');
  }
  /**
   * Confirm that a unit can leave its colony.
   * - Check for population limit.
   * - Query if education should be abandoned.
   *
   * @param unit The {@code Unit} that is leaving the colony.
   * @return True if the unit is allowed to leave.
   */
  confirmLeaveColony(unit: Unit): boolean {
    let colony = unit.getColony();
    let message = colony.getReducePopulationMessage();
    if (message != null) {
      this.showInformationPanel$StringTemplate(message);
      return false;
    }
    return this.confirmAbandonEducation(unit, true);
  }
  /**
   * Confirm whether the player wants to demand tribute from a native
   * settlement.
   *
   * @param attacker The potential attacking {@code Unit}.
   * @param is The target {@code IndianSettlement}.
   * @return The amount of tribute to demand, positive if the demand
   *     should proceed.
   */
  confirmNativeTribute(attacker: Unit, is$: IndianSettlement): number {
    let player = attacker.getOwner();
    let other = is$.getOwner();
    let strength = player.calculateStrength(false);
    let messageId = (other.getSettlementCount() >= strength) ? 'confirmTribute.unwise' : (other.getStance(player) === Stance.CEASE_FIRE) ? 'confirmTribute.warLikely' : (is$.getAlarm$Player(player).getLevel() === Tension$Level.HAPPY) ? 'confirmTribute.happy' : 'confirmTribute.normal';
    let t = StringTemplate.template$String(messageId).addStringTemplate$String$StringTemplate('%settlement%', is$.getLocationLabelFor(player)).addStringTemplate$String$StringTemplate('%nation%', other.getNationLabel());
    return (this.confirm$Tile$StringTemplate$Unit$String$String(is$.getTile$(), t, attacker, 'confirmTribute.yes', 'confirmTribute.no')) ? 1 : -1;
  }
  /**
   * Shows the pre-combat dialog if enabled, allowing the user to
   * view the odds and possibly cancel the attack.
   *
   * @param attacker The attacking {@code Unit}.
   * @param tile The target {@code Tile}.
   * @return True to attack, false to abort.
   */
  confirmPreCombat(attacker: Unit, tile: Tile): boolean {
    if (this.getClientOptions().getBoolean(ClientOptions.SHOW_PRECOMBAT)) {
      let settlement = tile.getSettlement();
      let defender = (settlement != null) ? settlement : tile.getDefendingUnit(attacker);
      return this.showPreCombatDialog(attacker, defender, tile);
    }
    return true;
  }
  /**
   * Confirm whether to stop the current game.
   *
   * @return True if confirmation was given.
   */
  confirmStopGame(): boolean {
    return this.confirm$String$String$String('stopCurrentGame.text', 'stopCurrentGame.yes', 'stopCurrentGame.no');
  }
  /**
   * Get the choice of what a user wants to do with an armed unit at
   * a foreign settlement.
   *
   * @param settlement The {@code Settlement} to consider.
   * @return The chosen action, tribute, attack or cancel.
   */
  getArmedUnitSettlementChoice(settlement: Settlement): Constants$ArmedUnitSettlementAction {
    let player = this.getMyPlayer();
    let choices = new ArrayList();
    let msg = Messages.message$String('armedUnitSettlement.tribute');
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(msg, Constants$ArmedUnitSettlementAction.SETTLEMENT_TRIBUTE));
    msg = Messages.message$String('armedUnitSettlement.attack');
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(msg, Constants$ArmedUnitSettlementAction.SETTLEMENT_ATTACK));
    return this.getChoice$Tile$StringTemplate$Settlement$String$List(settlement.getTile$(), settlement.getAlarmLevelLabel(player), settlement, 'cancel', choices);
  }
  /**
   * Get the user choice of whether to pay arrears for boycotted
   * goods or to dump them instead.
   *
   * @param goods The {@code Goods} to possibly dump.
   * @param europe The player {@code Europe} where the boycott is in force.
   * @return The chosen {@code BoycottAction}.
   */
  getBoycottChoice(goods: Goods, europe: Europe): Constants$BoycottAction {
    let arrears = europe.getOwner().getArrears(goods.getType());
    let template = StringTemplate.template$String('boycottedGoods.text').addNamed$String$Named('%goods%', goods).addNamed$String$Named('%europe%', europe).addAmount('%amount%', arrears);
    let choices = new ArrayList();
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('payArrears'), Constants$BoycottAction.BOYCOTT_PAY_ARREARS));
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('boycottedGoods.dumpGoods'), Constants$BoycottAction.BOYCOTT_DUMP_CARGO));
    return this.getChoice$Tile$StringTemplate$GoodsType$String$List$GUI(null, template, goods.getType(), 'cancel', choices);
  }
  /**
   * Gets the user choice when negotiating a purchase from a settlement.
   *
   * @param unit The {@code Unit} that is buying.
   * @param settlement The {@code Settlement} to buy from.
   * @param goods The {@code Goods} to buy.
   * @param gold The current negotiated price.
   * @param canBuy True if buy is a valid option.
   * @return The chosen action, buy, haggle, or cancel.
   */
  getBuyChoice(unit: Unit, settlement: Settlement, goods: Goods, gold: number, canBuy: boolean): Constants$TradeBuyAction {
    let euroPrice = unit.getOwner().getMarket().getBidPrice(goods.getType(), goods.getAmount());
    let nation = settlement.getOwner().getNationLabel();
    let template = StringTemplate.template$String('buy.text').addStringTemplate$String$StringTemplate('%nation%', nation).addStringTemplate$String$StringTemplate('%goods%', goods.getLabel$boolean(true)).addAmount('%gold%', gold).addAmount('%euprice%', euroPrice);
    let choices = new ArrayList();
    choices.add(new ChoiceItem()._ChoiceItem$String$Object$boolean(Messages.message$String('buy.takeOffer'), Constants$TradeBuyAction.BUY, canBuy));
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('buy.moreGold'), Constants$TradeBuyAction.HAGGLE));
    return this.getChoice$Tile$StringTemplate$GoodsType$String$List$GUI(unit.getTile$(), template, goods.getType(), 'cancel', choices);
  }
  /**
   * General modal choice dialog.
   *
   * @param <T> The choice type.
   * @param explain A {@code StringTemplate} explaining the choice.
   * @param cancelKey A key for the "cancel" button.
   * @param choices A list a {@code ChoiceItem}s to choose from.
   * @return The selected value of the selected {@code ChoiceItem},
   *     or null if cancelled.
   */
  getChoice$StringTemplate$String$List<T>(explain: StringTemplate, cancelKey: string, choices: List<ChoiceItem<T>>): T {
    let icon = new ImageIcon()._ImageIcon$Image(this.getFixedImageLibrary().getPlaceholderImage());
    return this.getChoice$Tile$StringTemplate$ImageIcon$String$List(null, explain, icon, cancelKey, choices);
  }
  /**
   * Goods-specific modal choice dialog.
   *
   * @param <T> The choice type.
   * @param tile An optional {@code Tile} to expose.
   * @param template A {@code StringTemplate} explaining the choice.
   * @param goodsType A {@code GoodsType} to display in dialog.
   * @param cancelKey A key for the "cancel" button.
   * @param choices A list a {@code ChoiceItem}s to choose from.
   * @return The selected value of the selected {@code ChoiceItem},
   *     or null if cancelled.
   */
  getChoice$Tile$StringTemplate$GoodsType$String$List$GUI<T>(tile: Tile, template: StringTemplate, goodsType: GoodsType, cancelKey: string, choices: List<ChoiceItem<T>>): T {
    let icon = new ImageIcon()._ImageIcon$Image(this.getFixedImageLibrary().getScaledGoodsTypeImage(goodsType));
    return this.getChoice$Tile$StringTemplate$ImageIcon$String$List(tile, template, icon, cancelKey, choices);
  }
  /**
   * Nation-specific modal choice dialog.
   *
   * @param <T> The choice type.
   * @param tile An optional {@code Tile} to expose.
   * @param template A {@code StringTemplate} explaining the choice.
   * @param nation A {@code Nation} to display in dialog.
   * @param cancelKey A key for the "cancel" button.
   * @param choices A list a {@code ChoiceItem}s to choose from.
   * @return The selected value of the selected {@code ChoiceItem},
   *     or null if cancelled.
   */
  getChoice$Tile$StringTemplate$Nation$String$List$GUI<T>(tile: Tile, template: StringTemplate, nation: Nation, cancelKey: string, choices: List<ChoiceItem<T>>): T {
    let icon = new ImageIcon()._ImageIcon$Image(this.getFixedImageLibrary().getScaledNationImage(nation));
    return this.getChoice$Tile$StringTemplate$ImageIcon$String$List(tile, template, icon, cancelKey, choices);
  }
  /**
   * Settlement-specific modal choice dialog.
   *
   * @param <T> The choice type.
   * @param tile An optional {@code Tile} to expose.
   * @param template A {@code StringTemplate} explaining the choice.
   * @param settlement A {@code Settlement} to display in dialog.
   * @param cancelKey A key for the "cancel" button.
   * @param choices A list a {@code ChoiceItem}s to choose from.
   * @return The selected value of the selected {@code ChoiceItem},
   *     or null if cancelled.
   */
  getChoice$Tile$StringTemplate$Settlement$String$List<T>(tile: Tile, template: StringTemplate, settlement: Settlement, cancelKey: string, choices: List<ChoiceItem<T>>): T {
    let icon = new ImageIcon()._ImageIcon$Image(this.getFixedImageLibrary().getScaledSettlementImage(settlement));
    return this.getChoice$Tile$StringTemplate$ImageIcon$String$List(tile, template, icon, cancelKey, choices);
  }
  /**
   * Unit-specific modal choice dialog.
   *
   * @param <T> The choice type.
   * @param tile An optional {@code Tile} to expose.
   * @param template A {@code StringTemplate} explaining the choice.
   * @param unit A {@code Unit} to display in dialog.
   * @param cancelKey A key for the "cancel" button.
   * @param choices A list a {@code ChoiceItem}s to choose from.
   * @return The selected value of the selected {@code ChoiceItem},
   *     or null if cancelled.
   */
  getChoice$Tile$StringTemplate$Unit$String$List<T>(tile: Tile, template: StringTemplate, unit: Unit, cancelKey: string, choices: List<ChoiceItem<T>>): T {
    let icon = new ImageIcon()._ImageIcon$Image(this.getFixedImageLibrary().getScaledUnitImage$Unit(unit));
    return this.getChoice$Tile$StringTemplate$ImageIcon$String$List(tile, template, icon, cancelKey, choices);
  }
  /**
   * Gets the user choice for claiming a tile.
   *
   * @param tile The {@code Tile} to claim.
   * @param player The {@code Player} that is claiming.
   * @param price An asking price, if any.
   * @param owner The {@code Player} that owns the land.
   * @return The chosen action, accept, steal or cancel.
   */
  getClaimChoice(tile: Tile, player: Player, price: number, owner: Player): Constants$ClaimAction {
    let choices = new ArrayList();
    let template: StringTemplate;
    if (owner.hasContacted(player)) {
      template = StringTemplate.template$String('indianLand.text').addStringTemplate$String$StringTemplate('%player%', owner.getNationLabel());
      let pay = StringTemplate.template$String('indianLand.pay').addAmount('%amount%', price);
      choices.add(new ChoiceItem()._ChoiceItem$String$Object$boolean(Messages.message$StringTemplate(pay), Constants$ClaimAction.CLAIM_ACCEPT, player.checkGold(price)));
    } else {
      template = StringTemplate.template$String('indianLand.unknown');
    }
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('indianLand.take'), Constants$ClaimAction.CLAIM_STEAL));
    return this.getChoice$Tile$StringTemplate$Nation$String$List$GUI(tile, template, owner.getNation(), 'indianLand.cancel', choices);
  }
  /**
   * Get the user choice when trading with a native settlement.
   *
   * @param settlement The native settlement to trade with.
   * @param template A {@code StringTemplate} containing the message
   *     to display.
   * @param canBuy Show a "buy" option.
   * @param canSell Show a "sell" option.
   * @param canGift Show a "gift" option.
   * @return The chosen action, buy, sell, gift or cancel.
   */
  getIndianSettlementTradeChoice(settlement: Settlement, template: StringTemplate, canBuy: boolean, canSell: boolean, canGift: boolean): Constants$TradeAction {
    let msg: string;
    let choices = new ArrayList();
    if (canBuy) {
      msg = Messages.message$String('tradeProposition.toBuy');
      choices.add(new ChoiceItem()._ChoiceItem$String$Object$boolean(msg, Constants$TradeAction.BUY, canBuy));
    }
    if (canSell) {
      msg = Messages.message$String('tradeProposition.toSell');
      choices.add(new ChoiceItem()._ChoiceItem$String$Object$boolean(msg, Constants$TradeAction.SELL, canSell));
    }
    if (canGift) {
      msg = Messages.message$String('tradeProposition.toGift');
      choices.add(new ChoiceItem()._ChoiceItem$String$Object$boolean(msg, Constants$TradeAction.GIFT, canGift));
    }
    if (choices.isEmpty()) {
      return null;
    }
    return this.getChoice$Tile$StringTemplate$Settlement$String$List(settlement.getTile$(), template, settlement, 'cancel', choices);
  }
  /**
   * Get the user choice of what to do with a missionary at a native
   * settlement.
   *
   * @param unit The {@code Unit} speaking to the settlement.
   * @param is The {@code IndianSettlement} being visited.
   * @param canEstablish Is establish a valid option.
   * @param canDenounce Is denounce a valid option.
   * @return The chosen action, establish mission, denounce, incite
   *     or cancel.
   */
  getMissionaryChoice(unit: Unit, is$: IndianSettlement, canEstablish: boolean, canDenounce: boolean): Constants$MissionaryAction {
    let template: StringTemplate;
    if (is$.hasContacted(unit.getOwner())) {
      let q = StringTemplate.template$String('missionarySettlement.question').addStringTemplate$String$StringTemplate('%settlement%', is$.getLocationLabelFor(unit.getOwner()));
      template = StringTemplate.label('\n\n').addStringTemplate$StringTemplate(is$.getAlarmLevelLabel(unit.getOwner())).addStringTemplate$StringTemplate(q);
    } else {
      template = StringTemplate.template$String('missionarySettlement.questionUncontacted');
    }
    let choices = new ArrayList();
    let msg: string;
    if (canEstablish) {
      msg = Messages.message$String('missionarySettlement.establish');
      choices.add(new ChoiceItem()._ChoiceItem$String$Object$boolean(msg, Constants$MissionaryAction.MISSIONARY_ESTABLISH_MISSION, canEstablish));
    }
    if (canDenounce) {
      msg = Messages.message$String('missionarySettlement.heresy');
      choices.add(new ChoiceItem()._ChoiceItem$String$Object$boolean(msg, Constants$MissionaryAction.MISSIONARY_DENOUNCE_HERESY, canDenounce));
    }
    msg = Messages.message$String('missionarySettlement.incite');
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(msg, Constants$MissionaryAction.MISSIONARY_INCITE_INDIANS));
    return this.getChoice$Tile$StringTemplate$Settlement$String$List(unit.getTile$(), template, is$, 'cancel', choices);
  }
  /**
   * Get a name for a new colony for a player.
   *
   * @param player The {@code Player} to get the colony name for.
   * @param tile The {@code Tile} for the new colony.
   * @return A colony name, or null if the user has reconsidered.
   */
  getNewColonyName(player: Player, tile: Tile): string {
    let suggested = player.getSettlementName(null);
    let t = StringTemplate.template$String('nameColony.text');
    let name = this.getInput(tile, t, suggested, 'accept', 'cancel');
    if (name == null) {
    } else if ((name.length === 0)) {
      this.showInformationPanel$String('enterSomeText');
    } else if (player.getSettlementByName(name) != null) {
      this.showInformationPanel$FreeColObject$StringTemplate(tile, StringTemplate.template$String('nameColony.notUnique').addName$String$String('%name%', name));
    } else {
      return name;
    }
    player.putSettlementName(suggested);
    return null;
  }
  /**
   * Get the user choice for what to do with a scout at a foreign colony.
   *
   * @param colony The {@code Colony} to be scouted.
   * @param unit The {@code Unit} that is scouting.
   * @param neg True if negotation is a valid choice.
   * @return The selected action, either negotiate, spy, attack or cancel.
   */
  getScoutForeignColonyChoice(colony: Colony, unit: Unit, neg: boolean): Constants$ScoutColonyAction {
    let u = unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL);
    let template = StringTemplate.template$String('scoutColony.text').addStringTemplate$String$StringTemplate('%unit%', u).addName$String$String('%colony%', colony.getName());
    let choices = new ArrayList();
    choices.add(new ChoiceItem()._ChoiceItem$String$Object$boolean(Messages.message$String('scoutColony.negotiate'), Constants$ScoutColonyAction.SCOUT_COLONY_NEGOTIATE, neg));
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('scoutColony.spy'), Constants$ScoutColonyAction.SCOUT_COLONY_SPY));
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('scoutColony.attack'), Constants$ScoutColonyAction.SCOUT_COLONY_ATTACK));
    return this.getChoice$Tile$StringTemplate$Settlement$String$List(unit.getTile$(), template, colony, 'cancel', choices);
  }
  /**
   * Get the user choice for what to do at a native settlement.
   *
   * @param is The {@code IndianSettlement} to be scouted.
   * @param numberString The number of settlements in the settlement
   *     owner nation.
   * @return The chosen action, speak, tribute, attack or cancel.
   */
  getScoutIndianSettlementChoice(is$: IndianSettlement, numberString: string): Constants$ScoutIndianSettlementAction {
    let player = this.getMyPlayer();
    let owner = is$.getOwner();
    let template: StringTemplate;
    if (is$.hasContacted(player)) {
      let skillPart = (is$.getLearnableSkill() != null) ? StringTemplate.template$String('scoutSettlement.skill').addNamed$String$Named('%skill%', is$.getLearnableSkill()) : StringTemplate.name_(' ');
      let goodsPart: StringTemplate;
      let present = is$.getWantedGoodsCount();
      if (present > 0) {
        goodsPart = StringTemplate.template$String('scoutSettlement.trade.' + String(present));
        for (let i = 0; i < present; i++) {
          let tradeKey = '%goods' + (String((i + 1) | 0)) + '%';
          goodsPart.addNamed$String$Named(tradeKey, is$.getWantedGoods$int(i));
        }
      } else {
        goodsPart = StringTemplate.name_(' ');
      }
      let nt = owner.getNationType();
      let l = is$.getLocationLabelFor(player);
      template = StringTemplate.template$String('scoutSettlement.greetings').addStringTemplate$String$StringTemplate('%alarmPart%', is$.getAlarmLevelLabel(player)).addStringTemplate$String$StringTemplate('%nation%', owner.getNationLabel()).addStringTemplate$String$StringTemplate('%settlement%', l).addName$String$String('%number%', numberString).add$String$String('%settlementType%', nt.getSettlementTypeKey(true)).addStringTemplate$String$StringTemplate('%skillPart%', skillPart).addStringTemplate$String$StringTemplate('%goodsPart%', goodsPart);
    } else {
      template = StringTemplate.template$String('scoutSettlement.greetUncontacted').addStringTemplate$String$StringTemplate('%nation%', owner.getNationLabel());
    }
    let choices = new ArrayList();
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('scoutSettlement.speak'), Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_SPEAK));
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('scoutSettlement.tribute'), Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_TRIBUTE));
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('scoutSettlement.attack'), Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_ATTACK));
    return this.getChoice$Tile$StringTemplate$Settlement$String$List(is$.getTile$(), template, is$, 'cancel', choices);
  }
  /**
   * Get the user choice for negotiating a sale to a settlement.
   *
   * @param unit The {@code Unit} that is selling.
   * @param settlement The {@code Settlement} to sell to.
   * @param goods The {@code Goods} to sell.
   * @param gold The current negotiated price.
   * @return The chosen action, sell, gift or haggle, or null.
   */
  getSellChoice(unit: Unit, settlement: Settlement, goods: Goods, gold: number): Constants$TradeSellAction {
    let euroPrice = unit.getOwner().getMarket().getSalePrice$GoodsType$int(goods.getType(), goods.getAmount());
    let goodsTemplate = goods.getLabel$boolean(true);
    let nation = settlement.getOwner().getNationLabel();
    let template = StringTemplate.template$String('sell.text').addStringTemplate$String$StringTemplate('%nation%', nation).addStringTemplate$String$StringTemplate('%goods%', goodsTemplate).addAmount('%gold%', gold).addAmount('%euprice%', euroPrice);
    let choices = new ArrayList();
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('sell.takeOffer'), Constants$TradeSellAction.SELL));
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('sell.moreGold'), Constants$TradeSellAction.HAGGLE));
    choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$StringTemplate(StringTemplate.template$String('sell.gift').addStringTemplate$String$StringTemplate('%goods%', goodsTemplate)), Constants$TradeSellAction.GIFT));
    return this.getChoice$Tile$StringTemplate$GoodsType$String$List$GUI(unit.getTile$(), template, goods.getType(), 'cancel', choices);
  }
  /**
   * Shows the current difficulty as an uneditable dialog.
   */
  showDifficultyDialog$(): void {
    let spec = this.getSpecification();
    this.showDifficultyDialog$Specification$OptionGroup$boolean$DialogHandler(spec, spec.getDifficultyOptionGroup$(), false, null);
  }
  /**
   * Show an i18n compliant error message derived from a template.
   *
   * @param template The {@code StringTemplate} containing the message.
   * @return The panel shown.
   */
  showErrorPanel$StringTemplate(template: StringTemplate): FreeColPanel {
    return this.showErrorPanel$StringTemplate$String(template, null);
  }
  /**
   * Show an i18n compliant error message derived from a template,
   * with optional extra debug information.
   *
   * @param template The {@code StringTemplate} containing the message.
   * @param message Optional extra debug information.
   * @return The panel shown.
   */
  showErrorPanel$StringTemplate$String(template: StringTemplate, message: string): FreeColPanel {
    return this.showErrorPanel$StringTemplate$String$Runnable(template, message, null);
  }
  /**
   * Show an i18n compliant error message derived from a template,
   * with optional extra debug information and an optional callback.
   *
   * @param template The {@code StringTemplate} containing the message.
   * @param message Optional extra debug information.
   * @param callback Optional routine to run when the error panel is closed.
   * @return The panel shown.
   */
  showErrorPanel$StringTemplate$String$Runnable(template: StringTemplate, message: string, callback: Runnable): FreeColPanel {
    let display = Messages.message$StringTemplate(template);
    if (message != null && FreeColDebugger.isInDebugMode$()) {
      display += '/' + message + '/';
    }
    return this.showErrorPanel$String$Runnable(display, callback);
  }
  /**
   * Show a serious error message with an exception and return
   * to the main panel when done.  This time, do not return the panel
   * as we have already defined a callback.
   *
   * @param ex An optional {@code Exception} to display.
   * @param template A {@code StringTemplate} for the message.
   */
  showErrorPanel$Exception$StringTemplate(ex: Exception, template: StringTemplate): void {
    let t = (ex == null) ? template : FreeCol.errorFromException$Exception$StringTemplate(ex, template);
    this.invokeNowOrLater(() => this.showErrorPanel$StringTemplate$String$Runnable(t, null, () => {
      this.closeMenus();
      this.showMainPanel(null);
    }));
  }
  /**
   * Show an information message.
   *
   * @param messageId The message key.
   * @return The panel shown.
   */
  showInformationPanel$String(messageId: string): FreeColPanel {
    return this.showInformationPanel$StringTemplate(StringTemplate.key$String(messageId));
  }
  /**
   * Show an information message.
   *
   * @param template The message template.
   * @return The panel shown.
   */
  showInformationPanel$StringTemplate(template: StringTemplate): FreeColPanel {
    return this.showInformationPanel$FreeColObject$StringTemplate(null, template);
  }
  /**
   * Show an information message.
   *
   * @param displayObject An optional object to display as an icon.
   * @param messageId The message key.
   * @return The panel shown.
   */
  showInformationPanel$FreeColObject$String(displayObject: FreeColObject, messageId: string): FreeColPanel {
    return this.showInformationPanel$FreeColObject$StringTemplate(displayObject, StringTemplate.key$String(messageId));
  }
  /**
   * Show a save file dialog, selecting one to load.
   *
   * @param root The root directory to look in.
   * @param extension The file extensions to look for.
   * @return The {@code File} selected, or null on error.
   */
  showLoadSaveFileDialog(root: File, extension: string[]): File {
    let file = this.showLoadDialog(root, extension);
    if (file != null && !file.isFile()) {
      this.showErrorPanel$StringTemplate(FreeCol.badFile('error.noSuchFile', file));
      file = null;
    }
    return file;
  }
  /**
   * Show the NewPanel.
   */
  showNewPanel$(): void {
    this.showNewPanel$Specification(null);
  }
  /**
   * Play a sound.
   *
   * @param sound The sound resource to play, or if null stop playing.
   */
  playSound(sound: string): void {
    if (sound != null && $J.equals(ResourceManager.getString$String$String(sound + '.type', ''), 'music')) {
      this.getFreeColClient().getSoundController().playMusic(sound);
    } else {
      this.getFreeColClient().getSoundController().playSound(sound);
    }
  }
  /**
   * Get the label text for the sound player mixer.
   *
   * Used by: AudioMixerOptionUI
   *
   * @return The text.
   */
  getSoundMixerLabelText(): string {
    return this.getFreeColClient().getSoundController().getSoundMixerLabelText();
  }
  /**
   * Get the fixed image library for use on panels.
   *
   * Used by: ColonyPanel, ConstructionPanel, InfoPanel, certain UnitLabels.
   *
   * @return Null here, real implementations will override.
   */
  getFixedImageLibrary(): ImageLibrary {
    return null;
  }
  /**
   * Get the scaled image library for use on the map.
   *
   * @return Null here, real implementations will override.
   */
  getScaledImageLibrary(): ImageLibrary {
    return null;
  }
  /**
   * Is this GUI in windowed mode?
   *
   * Used by: DragListener for a nasty workaround that should go away
   *
   * @return True by default, real implementations will override.
   */
  isWindowed(): boolean {
    return true;
  }
  /**
   * Run in the EDT, either immediately if in it or later when it wakes up.
   *
   * @param runnable A {@code Runnable} to run.
   */
  invokeNowOrLater(runnable: Runnable): void {
  }
  /**
   * Run in the EDT, either immediately or wait for it.
   *
   * @param runnable A {@code Runnable} to run.
   */
  invokeNowOrWait(runnable: Runnable): void {
  }
  /**
   * Change the windowed mode (really a toggle).
   *
   * Used by: ChangeWindowedModeAction
   */
  changeWindowedMode(): void {
  }
  /**
   * Swing system and look-and-feel initialization.
   *
   * Used by: FreeColClient
   *
   * @param fontName An optional font name to be used.
   * @exception FreeColException if the LAF is incompatible with the GUI.
   */
  installLookAndFeel(fontName: string): void {
  }
  /**
   * Quit the GUI.  All that is required is to exit the full screen.
   *
   * Used by: FreeColClient.quit
   */
  quitGUI(): void {
  }
  /**
   * Reset the GUI on reconnect.
   *
   * Used by: FreeColClient.restoreGUI
   *
   * @param active An optional active {@code Unit}.
   * @param tile An optional {@code Tile} to focus on if there is no
   *     active unit.
   */
  reconnectGUI(active: Unit, tile: Tile): void {
  }
  /**
   * Remove all in-game components (i.e. all the Listeners).
   *
   * Used by: ContinueAction, ConnectController.{mainTitle,newGame}
   *     InGameController.loadGame, MapEditorController.newMap, StartMapAction
   */
  removeInGameComponents(): void {
  }
  /**
   * Shows the {@code VideoPanel}.
   *
   * Used by: FreeColClient
   *
   * @param userMsg An optional user message.
   * @param callback A {@code Runnable} to run when the video completes.
   */
  showOpeningVideo(userMsg: string, callback: Runnable): void {
  }
  /**
   * Starts the GUI by creating and displaying the GUI-objects.
   *
   * Used by: FreeColClient
   *
   * @param desiredWindowSize The desired size of the GUI window.
   */
  startGUI(desiredWindowSize: Dimension): void {
    GUI.logger.info('It seems that the GraphicsEnvironment is headless!');
  }
  getMapViewDimension(): Dimension {
    return null;
  }
  /**
   * Start the GUI for the map editor.
   *
   * Used by: NewPanel
   */
  startMapEditorGUI(): void {
  }
  /**
   * Shows the map editor toolbox panel.
   */
  enableEditorToolboxPanel(shouldDisplayPanel: boolean): void {
  }
  /**
   * Checks if the map editor toolbox panel is being displayed.
   */
  isShowingMapEditorToolboxPanel(): boolean {
    return false;
  }
  /**
   * Shows the map editor transform panel.
   */
  enableEditorTransformPanel(shouldDisplayPanel: boolean): void {
  }
  /**
   * Checks if the map editor transform panel is being displayed.
   */
  isShowingMapEditorTransformPanel(): boolean {
    return false;
  }
  /**
   * Animate a unit attack.
   *
   * Used by: client InGameController
   *
   * @param attacker The attacking {@code Unit}.
   * @param defender The defending {@code Unit}.
   * @param attackerTile The {@code Tile} to show the attacker on.
   * @param defenderTile The {@code Tile} to show the defender on.
   * @param success Did the attack succeed?
   */
  animateUnitAttack(attacker: Unit, defender: Unit, attackerTile: Tile, defenderTile: Tile, success: boolean): void {
  }
  /**
   * Animate a unit move.
   *
   * Used by: client InGameController
   *
   * @param unit The {@code Unit} that is moving.
   * @param srcTile The {@code Tile} the unit starts at.
   * @param dstTile The {@code Tile} the unit moves to.
   */
  animateUnitMove(unit: Unit, srcTile: Tile, dstTile: Tile): void {
  }
  /**
   * General modal confirmation dialog.
   *
   * @param tile An optional {@code Tile} to expose.
   * @param template The {@code StringTemplate} explaining the choice.
   * @param icon An {@code ImageIcon} to display in dialog.
   * @param okKey A key for the message on the "ok" button.
   * @param cancelKey A key for the message on the "cancel" button.
   * @return True if the "ok" button was selected.
   */
  confirm$Tile$StringTemplate$ImageIcon$String$String(tile: Tile, template: StringTemplate, icon: ImageIcon, okKey: string, cancelKey: string): boolean {
    return false;
  }
  /**
   * General modal choice dialog.
   *
   * @param <T> The choice type.
   * @param tile An optional {@code Tile} to expose.
   * @param template A {@code StringTemplate} explaining the choice.
   * @param icon An optional {@code ImageIcon} to display in dialog.
   * @param cancelKey A key for the message on the "cancel" button.
   * @param choices A list a {@code ChoiceItem}s to choose from.
   * @return The selected value of the selected {@code ChoiceItem},
   *     or null if cancelled.
   */
  getChoice$Tile$StringTemplate$ImageIcon$String$List<T>(tile: Tile, template: StringTemplate, icon: ImageIcon, cancelKey: string, choices: List<ChoiceItem<T>>): T {
    return null;
  }
  /**
   * General modal string input dialog.
   *
   * @param tile An optional {@code Tile} to expose.
   * @param template A {@code StringTemplate} explaining the choice.
   * @param defaultValue The default value to show initially.
   * @param okKey A key for the message on the "ok" button.
   * @param cancelKey A key for the message on the "cancel" button.
   * @return The chosen value.
   */
  getInput(tile: Tile, template: StringTemplate, defaultValue: string, okKey: string, cancelKey: string): string {
    return null;
  }
  /**
   * Get the current focus tile.
   *
   * Used by: MiniMap.paintMap
   *
   * @return The focus {@code Tile}.
   */
  getFocus(): Tile {
    return null;
  }
  /**
   * Gets the current focus of the visible map given in pixels.
   *
   * @return The current focus map point that is between {@code 0}
   *   and <code>map.getWidth() * tileBounds.getWidth()</code>.
   */
  getFocusMapPoint(): Point {
    return null;
  }
  /**
   * Set the current focus tile.
   *
   * Used by: CanvasMapEditorMouseListener, CenterAction,
   *   FindSettlementPanel, InfoPanel, MiniMap.focus, MapEditorController,
   *   SelectDestinationDialog.recenter
   *
   * @param tile The new focus {@code Tile}.
   */
  setFocus(tile: Tile): void {
  }
  /**
   * The current focus of the visible map given in pixels.
   *
   * The maximum width of the map in pixels is:
   * <code>map.getWidth() * tileBounds.getWidth()</code>.
   *
   * @param pointToFocus The new focus point.
   */
  setFocusMapPoint(pointToFocus: Point): void {
  }
  /**
   * Set the path for the active unit.
   *
   * Used by: TilePopup
   *
   * @param path The new unit path.
   */
  setUnitPath(path: PathNode): void {
  }
  /**
   * Start/stop the goto path display.
   *
   * Used by: GotoTileAction
   */
  activateGotoPath(): void {
  }
  /**
   * Stop the goto path display.
   *
   * Used by: client InGameController.askClearGotoOrders
   */
  clearGotoPath(): void {
  }
  /**
   * Check if the user has  GoTo mode enabled.
   *
   * Used by: CanvasMouseListener
   *
   * @return True if the user has toggled GoTo mode.
   */
  isGotoStarted(): boolean {
    return false;
  }
  /**
   * Perform an immediate goto to a tile with the active unit.
   *
   * Used by: TilePopup
   *
   * @param tile The {@code Tile} to go to.
   */
  performGoto$Tile(tile: Tile): void {
  }
  /**
   * Perform an immediate goto to a point on the map.
   *
   * Used by: CanvasMouseListener
   *
   * @param x The x coordinate of the goto destination (pixels).
   * @param y The x coordinate of the goto destination (pixels).
   */
  performGoto$int$int(x: number, y: number): void {
  }
  /**
   * Send the active unit along the current goto path as far as possible.
   *
   * Used by: CanvasMouseListener
   */
  traverseGotoPath(): void {
  }
  /**
   * Update the goto path to a new position on the map.
   *
   * Used by: CanvasMouseMotionListener
   *
   * @param x The x coordinate for the new goto path destination (pixels).
   * @param y The y coordinate for the new goto path destination (pixels).
   * @param start If true start a new goto if one is not underway.
   */
  updateGoto(x: number, y: number, start: boolean): void {
  }
  /**
   * Prepare a drag from the given coordinates.  This may turn into
   * a goto if further drag motion is detected.
   *
   * Used by: CanvasMouseListener
   *
   * @param x Drag x coordinate (pixels).
   * @param y Drag x coordinate (pixels).
   */
  prepareDrag(x: number, y: number): void {
  }
  /**
   * Is the map able to zoom in further?
   *
   * Used by: MiniMapZoomInAction
   *
   * @return True if the map can zoom in.
   */
  canZoomInMapControls(): boolean {
    return false;
  }
  /**
   * Is the map able to zoom out further?
   *
   * Used by: MiniMapZoomOutAction
   *
   * @return True if the map can zoom out.
   */
  canZoomOutMapControls(): boolean {
    return false;
  }
  /**
   * Enable the map controls.
   *
   * Used by: MapControlsAction.
   *
   * @param enable If true then enable.
   */
  enableMapControls(enable: boolean): void {
  }
  /**
   * Toggle the fog of war control.
   *
   * Used by: MiniMapToggleFogOfWarAction
   */
  miniMapToggleFogOfWarControls(): void {
  }
  /**
   * Toggle the view control.
   *
   * Used by: MiniMapToggleFogOfWarAction
   */
  miniMapToggleViewControls(): void {
  }
  /**
   * Update the map controls, including the InfoPanel according to
   * the view mode.
   *
   * Used by: client InGameController.updateGUI, MapEditorController
   */
  updateMapControls(): void {
  }
  /**
   * Zoom in the map controls.
   *
   * Used by: MiniMapZoomInAction
   */
  zoomInMapControls(): void {
  }
  /**
   * Zoom out the map controls.
   *
   * Used by: MiniMapZoomOutAction
   */
  zoomOutMapControls(): void {
  }
  /**
   * Close any open menus.
   *
   * Used by: FreeColClient.skipTurns,
   *   client InGameController.{endTurn,setCurrentPlayer}
   *   MapEditorController, PreGameController
   */
  closeMenus(): void {
  }
  /**
   * Resets the map controls in order to properly reference any
   * newly recreated action.
   */
  resetMapControls(): void {
  }
  /**
   * Resets the menu bar in order to properly reference any
   * newly recreated action.
   */
  resetMenuBar(): void {
  }
  /**
   * Update the menu bar.
   *
   * Used by: InGameController.updateGUI, MapEditorController,
   *   NewEmptyMapAction
   */
  updateMenuBar(): void {
  }
  /**
   * Display a popup menu.
   *
   * Used by: ColonyPanel, DragListener
   *
   * @param menu The {@code JPopupMenu} to display.
   * @param x The menu x coordinate.
   * @param y The menu y coordinate.
   */
  showPopupMenu(menu: JPopupMenu, x: number, y: number): void {
  }
  /**
   * Work out what direction to scroll the map if a coordinate is close
   * to an edge.
   *
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param scrollSpace The clearance from the relevant edge
   * @param ignoreTop If the top should be ignored
   * @return The {@code Direction} to scroll, or null if not.
   */
  getScrollDirection(x: number, y: number, scrollSpace: number, ignoreTop: boolean): Direction {
    return null;
  }
  /**
   * Scroll the map in a given direction.
   *
   * @param direction The {@code Direction} to scroll.
   * @param performRepaints If {@code true}, then repaints are performed
   *      after scrolling.
   * @return True if scrolling can continue.
   */
  scrollMap(direction: Direction, performRepaints: boolean): boolean {
    return false;
  }
  /**
   * Sets the scroll speed back to the initial value. This is needed
   * when the scrolling stops, since the scrolling accelerates.
   */
  resetScrollSpeed(): void {
  }
  /**
   * Paint the whole canvas now.
   *
   * This should only be called for very special cases, like animations.
   * Normally, use {@link #repaint()} instead.
   */
  paintImmediately(): void {
  }
  /**
   * Enables asynchronous painting. That is, the painting of the
   * {@link MapViewer} is performed in a thread other than the EDT
   * (normal GUI thread).
   *
   * This allows better performance and lower latency, but will sometimes
   * produce visual artifacts when the game state changes during painting.
   *    
   * @see #stopMapAsyncPainter()
   */
  useMapAsyncPainter(): MapAsyncPainter {
    return null;
  }
  /**
   * Stops asynchronous painting.
   *
   * @see #useMapAsyncPainter()
   */
  stopMapAsyncPainter(): void {
  }
  createTileImageWithBeachBorderAndItems(tile: Tile): BufferedImage {
    return null;
  }
  createTileImage(tile: Tile, player: Player): BufferedImage {
    return null;
  }
  createColonyTileImage(tile: Tile, colony: Colony): BufferedImage {
    return null;
  }
  /**
   * Display the ColonyTiles of a Colony.
   *
   * Used by: ColonyPanel.TilesPanel
   *
   * @param g2d A {@code Graphics2D} to draw to.
   * @param tiles The {@code Tile}s to display.
   * @param colony The enclosing {@code Colony}.
   */
  displayColonyTiles(g2d: Graphics2D, tiles: Tile[][], colony: Colony): void {
  }
  /**
   * Get the current view mode.
   *
   * Used by: MoveAction, ToggleViewModeAction
   *
   * @return One of the view mode constants, or negative on error.
   */
  getViewMode(): GUI$ViewMode {
    return GUI$ViewMode.END_TURN;
  }
  /**
   * Get the active unit.
   *
   * Used by: many
   *
   * @return The current active {@code Unit}.
   */
  getActiveUnit(): Unit {
    return null;
  }
  /**
   * Get the selected tile.
   *
   * Used by: MoveAction, TilePopupAction, ToggleViewModeAction
   *
   * @return The selected {@code Tile}.
   */
  getSelectedTile(): Tile {
    return null;
  }
  /**
   * Change to terrain mode and select a tile.
   *
   * Used by: CanvasMapEditorMouseListener,
   *   client InGameController.{updateActiveUnit,moveTileCursor}
   *
   * @param tile The {@code Tile} to select.
   */
  changeView$Tile(tile: Tile): void {
  }
  /**
   * Change to move units mode, and select a unit.
   *
   * Used by: ChangeAction, DebugUtils, EndTurnDialog,
   *   client InGameController (several)
   *   MapEditorController, TilePopup, QuickActionMenu, UnitLabel
   *
   * @param unit The {@code Unit} to select.
   * @param force Set true if the unit is the same, but *has*
   *     changed in some way (e.g. moves left).
   */
  changeView$Unit$boolean(unit: Unit, force: boolean): void {
  }
  /**
   * Change to map transform mode, and select a transform.
   *
   * Used by: MapEditorController
   *
   * @param transform The {@code MapTransform} to select.
   */
  changeView$MapTransform(transform: MapTransform): void {
  }
  /**
   * Change to end turn mode.
   *
   * Used by: client InGameController.updateActiveUnit
   */
  changeView$(): void {
  }
  /**
   * Sets if ranged attack mode should be activated.
   *
   * @param rangedAttackMode If {@code true}, then display tiles reachable
   *      by ranged attack and allow the attack to be performed by clicking.
   */
  setRangedAttackMode(rangedAttackMode: boolean): void {
  }
  /**
   * Toggles if ranged attack mode should be activated.
   *
   * @see #setRangedAttackMode(boolean)
   */
  toggleRangedAttackMode(): void {
  }
  /**
   * Can the map be zoomed in?
   *
   * Used by: ZoomInAction
   *
   * @return True if the map can zoom in.
   */
  canZoomInMap(): boolean {
    return false;
  }
  /**
   * Can the map be zoomed out?
   *
   * Used by: ZoomOutAction
   *
   * @return True if the map can zoom out.
   */
  canZoomOutMap(): boolean {
    return false;
  }
  /**
   * Zoom the map in.
   *
   * Used by: ZoomInAction
   */
  zoomInMap(): void {
  }
  /**
   * Zoom the map out.
   *
   * Used by: ZoomOutAction
   */
  zoomOutMap(): void {
  }
  /**
   * Handle a click on the canvas.
   *
   * Used by: CanvasMouseListener
   *
   * @param count The click count.
   * @param x The x coordinate of the click.
   * @param y The y coordinate of the click.
   */
  clickAt(count: number, x: number, y: number): void {
  }
  /**
   * Close a panel.
   *
   * Used by: client InGameController.closehandler
   *
   * @param panel The identifier for the panel to close.
   */
  closePanel(panel: string): void {
  }
  /**
   * Close the main panel if present.
   *
   * Used by: MapEditorController, PreGameController
   */
  closeMainPanel(): void {
  }
  /**
   * Close the status panel if present.
   *
   * Used by: FreeColClient, MapEditorController, client InGameController, 
   *   PreGameController
   */
  closeStatusPanel(): void {
  }
  /**
   * Update with a new chat message.
   *
   * Used by: client InGameController.{chat,chatHandler}
   *
   * @param sender The message sender.
   * @param message The chat message.
   * @param color The message color.
   * @param privateChat True if the message is private.
   */
  displayChat(sender: string, message: string, color: Color, privateChat: boolean): void {
  }
  /**
   * Show the appropriate panel for an object.
   *
   * @param fco The {@code FreeColObject} to display.
   */
  displayObject(fco: FreeColObject): void {
  }
  /**
   * A chat message was received during the pre-game setup.
   *
   * Used by: PreGameController.chatHandler
   *
   * @param sender The player who sent the chat message.
   * @param message The chat message.
   * @param privateChat True if the message is private.
   */
  displayStartChat(sender: string, message: string, privateChat: boolean): void {
  }
  /**
   * Checks if a client options dialog is present.
   *
   * Used by: FreeColAction.shouldBeEnabled
   *
   * @return True if the client options are showing.
   */
  isClientOptionsDialogShowing(): boolean {
    return false;
  }
  /**
   * Is another panel being displayed.
   *
   * Used by: many Actions
   *
   * @return True if there is another panel present.
   */
  isPanelShowing(): boolean {
    return false;
  }
  /**
   * Refresh the whole GUI.
   *
   * This is done by invalidating any cached rendering and then repainting the
   * entire screen. Please use only when the entire map should be fully updated.
   *
   * Please use {@link MapViewerRepaintManager#markAsDirty(Tile)}
   * and {@link #repaint()} instead, if only parts of the map need to be updated.
   */
  refresh(): void {
  }
  /**
   * Repaints the entire screen, but uses image caches to avoid unnecessary
   * painting of the map.
   *
   * Please use {@link MapViewerRepaintManager#markAsDirty(Tile)} in order to
   * invalidate the caches for a given tile.
   *
   * @see #refresh()
   */
  repaint(): void {
  }
  refreshTile(tile: Tile): void {
  }
  /**
   * Refresh the players table in the StartGamePanel.
   *
   * Used by: SetNationMessage.clientHandler
   */
  refreshPlayersTable(): void {
  }
  /**
   * Remove a component from the GUI.
   *
   * Used by: Many panels to close themselves. TODO: is this right?
   *
   * @param component The {@code Component} to remove.
   */
  removeComponent(component: Component): void {
  }
  /**
   * Remove a dialog from the GUI.
   *
   * Used by: FreeColDialog.removeNotify
   *
   * @param fcd The {@code FreeColDialog} to remove.
   */
  removeDialog(fcd: FreeColDialog<any>): void {
  }
  /**
   * Remove a trade route panel and associated input on an associated
   * TradeRouteInputPanel.
   *
   * Used by: TradeRoutePanel
   *
   * @param panel The {@code FreeColPanel} to remove.
   */
  removeTradeRoutePanel(panel: FreeColPanel): void {
  }
  /**
   * Set dialog preferred size to saved size or to the given
   * {@code Dimension} if no saved size was found.
   *
   * Call this method in the constructor of a FreeColPanel in order
   * to remember its size and position.
   *
   * Used by: *Panel
   *
   * @param comp The {@code Component} to use.
   * @param d The {@code Dimension} to use as default.
   */
  restoreSavedSize(comp: Component, d: Dimension): void {
  }
  /**
   * Shows a tile popup for a given tile.
   *
   * @param tile The {@code Tile} where the popup occurred.
   */
  showTilePopup(tile: Tile): void {
  }
  /**
   * Get the tile at given coordinate.
   *
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @return The {@code Tile} found.
   */
  tileAt(x: number, y: number): Tile {
    return null;
  }
  /**
   * Update all panels derived from the EuropePanel.
   *
   * Used by: NewUnitPanel, RecruitUnitPanel
   */
  updateEuropeanSubpanels(): void {
  }
  /**
   * Show the AboutPanel.
   *
   * @return The panel shown.
   */
  showAboutPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the build queue for a colony.
   *
   * @param colony The {@code Colony} to show a panel for.
   * @return The build queue panel.
   */
  showBuildQueuePanel(colony: Colony): FreeColPanel {
    return null;
  }
  /**
   * Show the dialog to select captured goods.
   *
   * @param unit The {@code Unit} capturing goods.
   * @param gl The list of {@code Goods} to choose from.
   * @param handler A {@code DialogHandler} for the dialog response.
   */
  showCaptureGoodsDialog(unit: Unit, gl: List<Goods>, handler: DialogHandler<List<Goods>>): void {
  }
  /**
   * Show the chat panel.
   *
   * @return The panel shown.
   */
  showChatPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the founding father choice panel.
   *
   * @param ffs The list of {@code FoundingFather}s to choose from.
   * @param handler The callback to pass the choice to.
   */
  showChooseFoundingFatherDialog(ffs: List<FoundingFather>, handler: DialogHandler<FoundingFather>): void {
  }
  /**
   * Show the client options dialog.
   */
  showClientOptionsDialog(): void {
  }
  /**
   * Refreshes the GUI with settings from the client options.
   */
  refreshGuiUsingClientOptions(): void {
  }
  /**
   * Show the colony panel
   *
   * @param colony The {@code Colony} to display.
   * @param unit An optional {@code Unit} to select within the panel.
   * @return The panel shown.
   */
  showColonyPanel(colony: Colony, unit: Unit): FreeColPanel {
    return null;
  }
  /**
   * Displays a {@code FreeColPanel} at a generalized position.
   *
   * @param panel {@code FreeColPanel}, panel to show
   * @param toolBox Should be set to true if the resulting frame is
   *     used as a toolbox (that is: it should not be counted as a
   *     frame).
   * @param popupPosition {@code PopupPosition} The generalized
   *     position to place the panel.
   * @param resizable Should the panel be resizable?
   */
  showFreeColPanel(panel: FreeColPanel, toolBox: boolean, popupPosition: SwingGUI$PopupPosition, resizable: boolean): void {
  }
  /**
   * Show a colopedia panel.
   *
   * @param nodeId The identifier for the colopedia node to show.
   * @return The panel shown.
   */
  showColopediaPanel(nodeId: string): FreeColPanel {
    return null;
  }
  /**
   * Show a color chooser panel.
   *
   * @param al An {@code ActionListener} to handle panel button presses.
   * @return The panel shown.
   */
  showColorChooserPanel(al: ActionListener): FreeColPanel {
    return null;
  }
  /**
   * Show the compact labour report panel.
   *
   * @return The panel shown.
   */
  showCompactLabourReport$(): FreeColPanel {
    return null;
  }
  /**
   * Show the compact labour report for the specified unit data.
   *
   * @param unitData The {@code UnitData} to display.
   * @return The panel shown.
   */
  showCompactLabourReport$UnitData(unitData: LabourData$UnitData): FreeColPanel {
    return null;
  }
  /**
   * Confirm declaration of independence.
   *
   * @return A list of new nation and country names.
   */
  showConfirmDeclarationDialog(): List<string> {
    return Collections.emptyList();
  }
  /**
   * Show the declaration panel with the declaration of independence and
   * an animated signature.
   *
   * @param afterClosing A callback that is executed after the panel closes.
   */
  showDeclarationPanel(afterClosing: Runnable): void {
  }
  /**
   * Show a dialog for a difficulty option group.
   *
   * @param spec The enclosing {@code Specification}.
   * @param group The {@code OptionGroup} to show.
   * @param editable If true, the option group can be edited.
   * @return The (possibly modified) {@code OptionGroup}.
   */
  showDifficultyDialog$Specification$OptionGroup$boolean$DialogHandler(spec: Specification, group: OptionGroup, editable: boolean, dialogHandler: DialogHandler<OptionGroup>): void {
  }
  /**
   * Show a dialog to choose what goods to dump.
   *
   * @param unit The {@code Unit} that is dumping goods.
   * @param handler A callback to pass the dumped goods list to.
   */
  showDumpCargoDialog(unit: Unit, handler: DialogHandler<List<Goods>>): void {
  }
  /**
   * Show a dialog for editing an individual option.
   *
   * @param option The {@code Option} to edit.
   * @return True if the option edit was accepted.
   */
  showEditOptionDialog(option: Option): boolean {
    return false;
  }
  /**
   * Show a dialog for editing a settlmeent.
   *
   * @param is The {@code IndianSettlement} to edit.
   * @return The settlement post-edit.
   */
  showEditSettlementDialog(is$: IndianSettlement): IndianSettlement {
    return null;
  }
  /**
   * Show a dialog to handle emigration.
   *
   * @param player The {@code Player} whose emigration state needs work.
   * @param fountainOfYouth True if a Fountain of Youth event occurred.
   * @param handler A callback to pass a selected emigration index to.
   */
  showEmigrationDialog(player: Player, fountainOfYouth: boolean, handler: DialogHandler<number>): void {
  }
  /**
   * Show a dialog for the end of turn.
   *
   * @param units A list of {@code Unit}s that can still move.
   * @param handler A callback to handle the user selected end turn state.
   */
  showEndTurnDialog(units: List<Unit>, handler: DialogHandler<boolean>): void {
  }
  /**
   * Show an error panel.
   *
   * @param message The error message to display.
   * @param callback An optional {@code Runnable} to run on close.
   * @return The panel shown.
   */
  showErrorPanel$String$Runnable(message: string, callback: Runnable): FreeColPanel {
    return null;
  }
  /**
   * Show the Europe panel.
   *
   * @return The panel shown.
   */
  showEuropePanel(): FreeColPanel {
    return null;
  }
  /**
   * Show an event panel.
   *
   * @param header The title.
   * @param image A resource key for the image to display.
   * @param footer Optional footer text.
   * @return The panel shown.
   */
  showEventPanel(header: string, image: string, footer: string): FreeColPanel {
    return null;
  }
  /**
   * Show the FindSettlement panel.
   *
   * @return The panel shown.
   */
  showFindSettlementPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show a first contact dialog.
   *
   * @param player The {@code Player} making contact.
   * @param other The {@code Player} being contacted.
   * @param tile The {@code Tile} where the contact occurs.
   * @param settlementCount A count of settlements described by the
   *     other player.
   * @param handler A callback to handle the player decision to be friendly.
   */
  showFirstContactDialog(player: Player, other: Player, tile: Tile, settlementCount: number, handler: DialogHandler<boolean>): void {
  }
  /**
   * Show the Game options dialog.
   *
   * @param editable True if the options can be edited.
   * @param dialogHandler A callback for handling the closing of the dialog.
   */
  showGameOptionsDialog(editable: boolean, dialogHandler: DialogHandler<OptionGroup>): void {
  }
  /**
   * Show the high scores panel.
   *
   * @param messageId The message identifier.
   * @param scores The {@code HighScore}s to display.
   * @return The panel shown.
   */
  showHighScoresPanel(messageId: string, scores: List<HighScore>): FreeColPanel {
    return null;
  }
  /**
   * Show a panel for a native settlement.
   *
   * @param is The {@code IndianSettlement} to display.
   * @return The panel shown.
   */
  showIndianSettlementPanel(is$: IndianSettlement): FreeColPanel {
    return null;
  }
  /**
   * Show an information message.
   *
   * @param displayObject Optional object for displaying as an icon.
   * @param template The {@code StringTemplate} to display.
   * @return The panel shown.
   */
  showInformationPanel$FreeColObject$StringTemplate(displayObject: FreeColObject, template: StringTemplate): FreeColPanel {
    return null;
  }
  /**
   * Show a dialog where the user may choose a file.
   *
   * @param directory The directory containing the files.
   * @param extension An extension to select with.
   * @return The selected {@code File}.
   */
  showLoadDialog(directory: File, extension: string[]): File {
    return null;
  }
  /**
   * Show the LoadingSavegameDialog.
   *
   * @param publicServer FIXME
   * @param singlePlayer FIXME
   * @return The {@code LoadingSavegameInfo} from the dialog.
   */
  showLoadingSavegameDialog(publicServer: boolean, singlePlayer: boolean): LoadingSavegameInfo {
    return null;
  }
  /**
   * Show the log file panel.
   *
   * @return The panel shown.
   */
  showLogFilePanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the main panel.
   *
   * @param userMsg An optional user message to display.
   * @return The panel shown.
   */
  showMainPanel(userMsg: string): FreeColPanel {
    return null;
  }
  /**
   * Complete reset back to the main panel.
   */
  showMainTitle(): void {
  }
  /**
   * Show the map generator options.
   *
   * @param editable If true, allow edits.
   */
  showMapGeneratorOptionsDialog(editable: boolean, dialogHandler: DialogHandler<OptionGroup>): void {
  }
  /**
   * Show the map size dialog.
   *
   * @return The selected map size as a {@code Dimension}.
   */
  showMapSizeDialog(): Dimension {
    return null;
  }
  /**
   * Show model messages.
   *
   * @param modelMessages A list of {@code ModelMessage}s to display.
   * @return The panel shown.
   */
  showModelMessages(modelMessages: List<ModelMessage>): FreeColPanel {
    return null;
  }
  /**
   * Show the monarch dialog.
   *
   * @param action The action the monarch is taking.
   * @param template A message template.
   * @param monarchKey The identifier for the monarch.
   * @param handler A callback to handle the user response to the
   *     monarch action.
   */
  showMonarchDialog(action: Monarch$MonarchAction, template: StringTemplate, monarchKey: string, handler: DialogHandler<boolean>): void {
  }
  /**
   * Show the naming dialog.
   *
   * @param template A message template.
   * @param defaultName The default name for the object.
   * @param unit The {@code Unit} that is naming.
   * @param handler A callback to handle the user response.
   */
  showNamingDialog(template: StringTemplate, defaultName: string, unit: Unit, handler: DialogHandler<string>): void {
  }
  /**
   * Show the native demand dialog.
   *
   * @param unit The demanding {@code Unit}.
   * @param colony The {@code Colony} being demanded of.
   * @param type The {@code GoodsType} demanded (null for gold).
   * @param amount The amount of goods or gold demanded.
   * @param handler A callback to handle the user response.
   */
  showNativeDemandDialog(unit: Unit, colony: Colony, type$: GoodsType, amount: number, handler: DialogHandler<boolean>): void {
  }
  /**
   * Show the negotiation dialog.
   *
   * @param our Our {@code FreeColGameObject} that is negotiating.
   * @param other The other {@code FreeColGameObject}.
   * @param agreement The current {@code DiplomaticTrade} agreement.
   * @param comment An optional {@code StringTemplate} containing a
   *     commentary message.
   * @return The negotiated {@code DiplomaticTrade} agreement.
   */
  showNegotiationDialog(our: FreeColGameObject, other: FreeColGameObject, agreement: DiplomaticTrade, comment: StringTemplate): DiplomaticTrade {
    return null;
  }
  /**
   * Show the NewPanel.
   *
   * @param spec The {@code Specification} to use.
   * @return The panel shown.
   */
  showNewPanel$Specification(spec: Specification): FreeColPanel {
    return null;
  }
  /**
   * Show the parameter choice dialog.
   *
   * @return The chosen parameters.
   */
  showParametersDialog(): Parameters {
    return null;
  }
  /**
   * Show the pre-combat dialog.
   *
   * @param attacker The {@code Unit} that is attacking.
   * @param defender The {@code FreeColObject} that is defending.
   * @param tile The {@code Tile} where the attack occurs.
   * @return True if the player decided to attack.
   */
  showPreCombatDialog(attacker: Unit, defender: FreeColGameObject, tile: Tile): boolean {
    return false;
  }
  /**
   * Displays the purchase panel.
   *
   * @return The panel shown.
   */
  showPurchasePanel(): FreeColPanel {
    return null;
  }
  /**
   * Displays the recruit panel.
   *
   * @return The panel shown.
   */
  showRecruitPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Cargo Report.
   *
   * @return The panel shown.
   */
  showReportCargoPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Colony Report.
   *
   * @return The panel shown.
   */
  showReportColonyPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Continental Congress Report.
   *
   * @return The panel shown.
   */
  showReportContinentalCongressPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Education Report.
   *
   * @return The panel shown.
   */
  showReportEducationPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Exploration Report.
   *
   * @return The panel shown.
   */
  showReportExplorationPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Foreign Affairs Report.
   *
   * @return The panel shown.
   */
  showReportForeignAffairPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the History Report.
   *
   * @return The panel shown.
   */
  showReportHistoryPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Native Affairs Report.
   *
   * @return The panel shown.
   */
  showReportIndianPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Labour Report.
   *
   * @return The panel shown.
   */
  showReportLabourPanel(): FreeColPanel {
    return null;
  }
  /**
   * Display the labour detail panel.
   *
   * @param unitType The {@code UnitType} to display.
   * @param data The labour data.
   * @param unitCount A map of unit distribution.
   * @param colonies The list of player {@code Colony}s.
   * @return The panel shown.
   */
  showReportLabourDetailPanel(unitType: UnitType, data: JMap<UnitType, JMap<Location, number>>, unitCount: TypeCountMap<UnitType>, colonies: List<Colony>): FreeColPanel {
    return null;
  }
  /**
   * Show the Military Report.
   *
   * @return The panel shown.
   */
  showReportMilitaryPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Naval Report.
   *
   * @return The panel shown.
   */
  showReportNavalPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Production Report.
   *
   * @return The panel shown.
   */
  showReportProductionPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Religion Report.
   *
   * @return The panel shown.
   */
  showReportReligiousPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Requirements Report.
   *
   * @return The panel shown.
   */
  showReportRequirementsPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Trade Report.
   *
   * @return The panel shown.
   */
  showReportTradePanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the Turn Report.
   *
   * @param messages The {@code ModelMessage}s that make up the report.
   * @return The panel shown.
   */
  showReportTurnPanel(messages: List<ModelMessage>): FreeColPanel {
    return null;
  }
  /**
   * Show the river style dialog.
   *
   * @param styles The river styles a choice is made from.
   * @return The response returned by the dialog.
   */
  showRiverStyleDialog(styles: List<string>): string {
    return null;
  }
  /**
   * Show the save dialog.
   *
   * @param directory The directory containing the files.
   * @param defaultName The default game to save.
   * @return The selected file.
   */
  showSaveDialog(directory: File, defaultName: string): File {
    return null;
  }
  /**
   * Show the map scale dialog.
   *
   * @return The map scale as a {@code Dimension}.
   */
  showScaleMapSizeDialog(): Dimension {
    return null;
  }
  /**
   * Show a dialog allowing selecting an amount of goods.
   *
   * @param goodsType The {@code GoodsType} to select an amount of.
   * @param available The amount of goods available.
   * @param defaultAmount The amount to select to start with.
   * @param needToPay If true, check the player has sufficient funds.
   * @return The amount selected.
   */
  showSelectAmountDialog(goodsType: GoodsType, available: number, defaultAmount: number, needToPay: boolean): number {
    return -1;
  }
  /**
   * Show a dialog allowing the user to select a destination for
   * a given unit.
   *
   * @param unit The {@code Unit} to select a destination for.
   * @return A destination for the unit, or null.
   */
  showSelectDestinationDialog(unit: Unit): Location {
    return null;
  }
  /**
   * Show the select-tribute-amount dialog.
   *
   * @param question a {@code StringTemplate} describing the
   *     amount of tribute to demand.
   * @param maximum The maximum amount available.
   * @return The amount selected.
   */
  showSelectTributeAmountDialog(question: StringTemplate, maximum: number): number {
    return -1;
  }
  /**
   * Show the {@code ServerListPanel}.
   *
   * @param serverList The list containing the servers retrieved from the
   *     metaserver.
   * @return The panel shown.
   */
  showServerListPanel(serverList: List<ServerInfo>): FreeColPanel {
    return null;
  }
  /**
   * Show the StartGamePanel.
   *
   * @param game The {@code Game} that is about to start.
   * @param player The {@code Player} using this client.
   * @param singlePlayerMode True to start a single player game.
   * @return The panel shown.
   */
  showStartGamePanel(game: Game, player: Player, singlePlayerMode: boolean): FreeColPanel {
    return null;
  }
  /**
   * Show the statistics panel.
   *
   * @param serverStats A map of server statistics key,value pairs.
   * @param clientStats A map of client statistics key,value pairs.
   * @return The panel shown.
   */
  showStatisticsPanel(serverStats: JMap<string, string>, clientStats: JMap<string, string>): FreeColPanel {
    return null;
  }
  /**
   * Shows a status message which goes away when a new component is added.
   *
   * @param message The text message to display on the status panel.
   * @return The panel shown.
   */
  showStatusPanel(message: string): FreeColPanel {
    return null;
  }
  /**
   * Show the tile panel for a given tile.
   *
   * @param tile The {@code Tile} to display.
   * @return The panel shown.
   */
  showTilePanel(tile: Tile): FreeColPanel {
    return null;
  }
  /**
   * Show the trade route input panel for a given trade route.
   *
   * @param tr The {@code TradeRoute} to display.
   * @return The panel shown.
   */
  showTradeRouteInputPanel(tr: TradeRoute): FreeColPanel {
    return null;
  }
  /**
   * Show a panel to select a trade route for a unit.
   *
   * @param unit An optional {@code Unit} to select a trade route for.
   * @return The panel shown.
   */
  showTradeRoutePanel(unit: Unit): FreeColPanel {
    return null;
  }
  /**
   * Show the training panel.
   *
   * @return The panel shown.
   */
  showTrainPanel(): FreeColPanel {
    return null;
  }
  /**
   * Show the victory dialog.
   *
   * @param handler A callback to handle the continuation decision.
   */
  showVictoryDialog(handler: DialogHandler<boolean>): void {
  }
  /**
   * Show the warehouse dialog for a colony.
   *
   * Run out of ColonyPanel, so the tile is already displayed.
   *
   * @param colony The {@code Colony} to display.
   * @param dialogHandler A {@code DialogHandler} for the dialog response.
   */
  showWarehouseDialog(colony: Colony, dialogHandler: DialogHandler<boolean>): void {
  }
  /**
   * Show the production of a unit.
   *
   * @param unit The {@code Unit} to display.
   * @return The panel shown.
   */
  showWorkProductionPanel(unit: Unit): FreeColPanel {
    return null;
  }
  /**
   * Reloads all images managed by {@code ResourceManager}.
   */
  reloadResources(): void {
  }
  /**
   * Prepares showing the main menu by removing almost everything from the view.
   */
  prepareShowingMainMenu(): void {
  }
  /**
   * Checks if mods with a specification can be added now.
   */
  canGameChangingModsBeAdded(): boolean {
    return true;
  }
  /**
   * A method to be called only on serious Errors in order
   * to ensure sufficient memory for displaying an error
   * message.
   */
  emergencyPurge(): void {
  }
  /**
   * Updates the scaleFactor, if necessary, after the window has been resized.
   */
  refreshScaleFactorIfNecessary(): void {
  }
  static $clinit() {
    GUI.logger = Logger.getLogger($J.cls(GUI).getName());
    GUI.levels = ['low', 'normal', 'high'];
  }
}

/**
 * View modes.
 */
export class GUI$ViewMode extends JEnum {
  static MOVE_UNITS: GUI$ViewMode = null;
  static TERRAIN: GUI$ViewMode = null;
  static MAP_TRANSFORM: GUI$ViewMode = null;
  static END_TURN: GUI$ViewMode = null;
  static $VALUES: GUI$ViewMode[] = null;
  _GUI$ViewMode($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): GUI$ViewMode[] { return GUI$ViewMode.$VALUES.slice(); }
  static valueOf(name: string): GUI$ViewMode { return $J.enumValueOf(GUI$ViewMode, name); }
  static $clinit() {
    GUI$ViewMode.MOVE_UNITS = new GUI$ViewMode()._GUI$ViewMode('MOVE_UNITS', 0);
    GUI$ViewMode.TERRAIN = new GUI$ViewMode()._GUI$ViewMode('TERRAIN', 1);
    GUI$ViewMode.MAP_TRANSFORM = new GUI$ViewMode()._GUI$ViewMode('MAP_TRANSFORM', 2);
    GUI$ViewMode.END_TURN = new GUI$ViewMode()._GUI$ViewMode('END_TURN', 3);
    GUI$ViewMode.$VALUES = [GUI$ViewMode.MOVE_UNITS, GUI$ViewMode.TERRAIN, GUI$ViewMode.MAP_TRANSFORM, GUI$ViewMode.END_TURN];
  }
}

$J.define(GUI, 'net.sf.freecol.client.gui.GUI', { kind: 'class', sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient': '_GUI' }, returns: { 'isPanelShowing': 'boolean', 'isClientOptionsDialogShowing': 'boolean', 'getSelectedTile': 'net.sf.freecol.common.model.Tile', 'getActiveUnit': 'net.sf.freecol.common.model.Unit', 'getViewMode': 'net.sf.freecol.client.gui.GUI$ViewMode', 'isGotoStarted': 'boolean', 'getFocusMapPoint': 'java.awt.Point', 'getFocus': 'net.sf.freecol.common.model.Tile', 'isShowingMapEditorTransformPanel': 'boolean', 'isShowingMapEditorToolboxPanel': 'boolean', 'getMapViewDimension': 'java.awt.Dimension', 'isWindowed': 'boolean', 'getScaledImageLibrary': 'net.sf.freecol.client.gui.ImageLibrary', 'getFixedImageLibrary': 'net.sf.freecol.client.gui.ImageLibrary', 'getSoundMixerLabelText': 'java.lang.String' }, meths: { 'showNewPanel(net.sf.freecol.common.model.Specification)': 'showNewPanel$Specification', 'showInformationPanel(net.sf.freecol.common.model.FreeColObject,net.sf.freecol.common.model.StringTemplate)': 'showInformationPanel$FreeColObject$StringTemplate', 'showErrorPanel(java.lang.String,java.lang.Runnable)': 'showErrorPanel$String$Runnable', 'showDifficultyDialog(net.sf.freecol.common.model.Specification,net.sf.freecol.common.option.OptionGroup,boolean,net.sf.freecol.client.gui.DialogHandler)': 'showDifficultyDialog$Specification$OptionGroup$boolean$DialogHandler', 'showCompactLabourReport(net.sf.freecol.client.gui.panel.report.LabourData$UnitData)': 'showCompactLabourReport$UnitData', 'showCompactLabourReport()': 'showCompactLabourReport$', 'changeView()': 'changeView$', 'changeView(net.sf.freecol.client.control.MapTransform)': 'changeView$MapTransform', 'changeView(net.sf.freecol.common.model.Unit,boolean)': 'changeView$Unit$boolean', 'changeView(net.sf.freecol.common.model.Tile)': 'changeView$Tile', 'performGoto(int,int)': 'performGoto$int$int', 'performGoto(net.sf.freecol.common.model.Tile)': 'performGoto$Tile', 'getChoice(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.StringTemplate,javax.swing.ImageIcon,java.lang.String,java.util.List)': 'getChoice$Tile$StringTemplate$ImageIcon$String$List', 'confirm(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.StringTemplate,javax.swing.ImageIcon,java.lang.String,java.lang.String)': 'confirm$Tile$StringTemplate$ImageIcon$String$String', 'showNewPanel()': 'showNewPanel$', 'showInformationPanel(net.sf.freecol.common.model.FreeColObject,java.lang.String)': 'showInformationPanel$FreeColObject$String', 'showInformationPanel(net.sf.freecol.common.model.StringTemplate)': 'showInformationPanel$StringTemplate', 'showInformationPanel(java.lang.String)': 'showInformationPanel$String', 'showErrorPanel(java.lang.Exception,net.sf.freecol.common.model.StringTemplate)': 'showErrorPanel$Exception$StringTemplate', 'showErrorPanel(net.sf.freecol.common.model.StringTemplate,java.lang.String,java.lang.Runnable)': 'showErrorPanel$StringTemplate$String$Runnable', 'showErrorPanel(net.sf.freecol.common.model.StringTemplate,java.lang.String)': 'showErrorPanel$StringTemplate$String', 'showErrorPanel(net.sf.freecol.common.model.StringTemplate)': 'showErrorPanel$StringTemplate', 'showDifficultyDialog()': 'showDifficultyDialog$', 'getChoice(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.StringTemplate,net.sf.freecol.common.model.Unit,java.lang.String,java.util.List)': 'getChoice$Tile$StringTemplate$Unit$String$List', 'getChoice(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.StringTemplate,net.sf.freecol.common.model.Settlement,java.lang.String,java.util.List)': 'getChoice$Tile$StringTemplate$Settlement$String$List', 'getChoice(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.StringTemplate,net.sf.freecol.common.model.Nation,java.lang.String,java.util.List)': 'getChoice$Tile$StringTemplate$Nation$String$List$GUI', 'getChoice(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.StringTemplate,net.sf.freecol.common.model.GoodsType,java.lang.String,java.util.List)': 'getChoice$Tile$StringTemplate$GoodsType$String$List$GUI', 'getChoice(net.sf.freecol.common.model.StringTemplate,java.lang.String,java.util.List)': 'getChoice$StringTemplate$String$List', 'confirm(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.StringTemplate,net.sf.freecol.common.model.Unit,java.lang.String,java.lang.String)': 'confirm$Tile$StringTemplate$Unit$String$String', 'confirm(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.StringTemplate,net.sf.freecol.common.model.Settlement,java.lang.String,java.lang.String)': 'confirm$Tile$StringTemplate$Settlement$String$String', 'confirm(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.StringTemplate,net.sf.freecol.common.model.GoodsType,java.lang.String,java.lang.String)': 'confirm$Tile$StringTemplate$GoodsType$String$String', 'confirm(net.sf.freecol.common.model.StringTemplate,java.lang.String,java.lang.String)': 'confirm$StringTemplate$String$String', 'confirm(java.lang.String,java.lang.String,java.lang.String)': 'confirm$String$String$String' }, clinit: true, lazy: ['logger', 'levels'] });
$J.define(GUI$ViewMode, 'net.sf.freecol.client.gui.GUI$ViewMode', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_GUI$ViewMode' }, clinit: true, lazy: ['$VALUES', 'MOVE_UNITS', 'TERRAIN', 'MAP_TRANSFORM', 'END_TURN'] });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Constants$ArmedUnitSettlementAction = $J.load('net.sf.freecol.common.model.Constants$ArmedUnitSettlementAction');
  Constants$BoycottAction = $J.load('net.sf.freecol.common.model.Constants$BoycottAction');
  Constants$ClaimAction = $J.load('net.sf.freecol.common.model.Constants$ClaimAction');
  Constants$MissionaryAction = $J.load('net.sf.freecol.common.model.Constants$MissionaryAction');
  Constants$ScoutColonyAction = $J.load('net.sf.freecol.common.model.Constants$ScoutColonyAction');
  Constants$ScoutIndianSettlementAction = $J.load('net.sf.freecol.common.model.Constants$ScoutIndianSettlementAction');
  Constants$TradeAction = $J.load('net.sf.freecol.common.model.Constants$TradeAction');
  Constants$TradeBuyAction = $J.load('net.sf.freecol.common.model.Constants$TradeBuyAction');
  Constants$TradeSellAction = $J.load('net.sf.freecol.common.model.Constants$TradeSellAction');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
});
