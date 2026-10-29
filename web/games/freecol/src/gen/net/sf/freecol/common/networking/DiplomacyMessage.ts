// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/DiplomacyMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { ObjectMessage } from './ObjectMessage.ts';

let FreeColXMLReader$ReadScope, Ability, Colony, DiplomaticTrade, DiplomaticTrade$TradeContext, Unit, Message, Message$MessagePriority;

/**
 * The message sent when executing a diplomatic trade.
 */
export class DiplomacyMessage extends ObjectMessage {
  static readonly TAG: string = 'diplomacy';
  static readonly OTHER_ID_TAG: string = 'otherId';
  static readonly OUR_ID_TAG: string = 'ourId';
  /**
   * Create a new {@code DiplomacyMessage}.
   *
   * @param our Our {@code FreeColGameObject} that is negotiating.
   * @param other The other {@code FreeColGameObject} to negotiate with.
   * @param agreement The {@code DiplomaticTrade} to make.
   */
  _DiplomacyMessage$FreeColGameObject$FreeColGameObject$DiplomaticTrade(our: FreeColGameObject, other: FreeColGameObject, agreement: DiplomaticTrade): this {
    this._ObjectMessage$String$StringArr(DiplomacyMessage.TAG, [DiplomacyMessage.OUR_ID_TAG, our.getId(), DiplomacyMessage.OTHER_ID_TAG, other.getId()]);
    this.appendChild(agreement);
    return this;
  }
  /**
   * Create a new {@code DiplomacyMessage}.
   *
   * @param unit The {@code Unit} that is negotiating.
   * @param otherUnit The other {@code Unit} to negotiate with.
   * @param agreement The {@code DiplomaticTrade} to make.
   */
  _DiplomacyMessage$Unit$Unit$DiplomaticTrade(unit: Unit, otherUnit: Unit, agreement: DiplomaticTrade): this {
    this._DiplomacyMessage$FreeColGameObject$FreeColGameObject$DiplomaticTrade(unit, otherUnit, agreement);
    return this;
  }
  /**
   * Create a new {@code DiplomacyMessage}.
   *
   * @param unit The {@code Unit} that is negotiating.
   * @param colony The {@code Colony} to negotiate with.
   * @param agreement The {@code DiplomaticTrade} to make.
   */
  _DiplomacyMessage$Unit$Colony$DiplomaticTrade(unit: Unit, colony: Colony, agreement: DiplomaticTrade): this {
    this._DiplomacyMessage$FreeColGameObject$FreeColGameObject$DiplomaticTrade(unit, colony, agreement);
    return this;
  }
  /**
   * Create a new {@code DiplomacyMessage}.
   *
   * @param colony The {@code Colony} that is negotiating.
   * @param unit The {@code Unit} that to negotiate with.
   * @param agreement The {@code DiplomaticTrade} to make.
   */
  _DiplomacyMessage$Colony$Unit$DiplomaticTrade(colony: Colony, unit: Unit, agreement: DiplomaticTrade): this {
    this._DiplomacyMessage$FreeColGameObject$FreeColGameObject$DiplomaticTrade(colony, unit, agreement);
    return this;
  }
  /**
   * Create a new {@code DiplomacyMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException on stream error.
   */
  _DiplomacyMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(DiplomacyMessage.TAG, xr, [DiplomacyMessage.OUR_ID_TAG, DiplomacyMessage.OTHER_ID_TAG]);
    let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
    let agreement = null;
    let extraUnit = null;
    try {
      while (xr.moreTags()) {
        let tag = xr.getLocalName();
        if ($J.equals(DiplomaticTrade.TAG, tag)) {
          if (agreement == null) {
            agreement = xr.readFreeColObject$Game$Class(game, $J.cls(DiplomaticTrade));
          } else {
            this.expected(DiplomacyMessage.TAG, tag);
          }
        } else if ($J.equals(Unit.TAG, tag)) {
          if (extraUnit == null) {
            extraUnit = xr.readFreeColObject$Game$Class(game, $J.cls(Unit));
          } else {
            this.expected(DiplomacyMessage.TAG, tag);
          }
        } else {
          this.expected((agreement == null) ? DiplomaticTrade.TAG : Unit.TAG, tag);
        }
        xr.expectTag(tag);
      }
      xr.expectTag(DiplomacyMessage.TAG);
    } finally {
      xr.replaceScope(rs);
    }
    this.appendChild(agreement);
    this.appendChild(extraUnit);
    return this;
  }
  /**
   * Get our FCGO.
   *
   * @param game The {@code Game} to extract the FCGO from.
   * @return Our {@code FreeColGameObject}.
   */
  getOurFCGO(game: Game): FreeColGameObject {
    return game.getFreeColGameObject$String(this.getStringAttribute(DiplomacyMessage.OUR_ID_TAG));
  }
  /**
   * Get the other FCGO.
   *
   * @param game The {@code Game} to extract the FCGO from.
   * @return The other {@code FreeColGameObject}.
   */
  getOtherFCGO(game: Game): FreeColGameObject {
    return game.getFreeColGameObject$String(this.getStringAttribute(DiplomacyMessage.OTHER_ID_TAG));
  }
  /**
   * Get the agreement (a {@code DiplomaticTrade}) in this message.
   *
   * @return The agreement in this message.
   */
  getAgreement(): DiplomaticTrade {
    return this.getChild(0, $J.cls(DiplomaticTrade));
  }
  /**
   * Get the extra {@code Unit}.
   *
   * @return The extra {@code Unit}, or null if none.
   */
  getExtraUnit(): Unit {
    return this.getChild(1, $J.cls(Unit));
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.LATE;
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
    let game = freeColServer.getGame();
    let our = this.getOurFCGO(game);
    let other = this.getOtherFCGO(game);
    let agreement = this.getAgreement();
    aiPlayer.diplomacyHandler(our, other, agreement);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let agreement = this.getAgreement();
    let our = this.getOurFCGO(game);
    let other = this.getOtherFCGO(game);
    let extraUnit = this.getExtraUnit();
    if (our == null) {
      Message.logger.warning('Our FCGO omitted from diplomacy message.');
      return;
    }
    if (other == null) {
      Message.logger.warning('Other FCGO omitted from diplomacy message.');
      return;
    }
    if (extraUnit != null) {
      extraUnit.intern();
    }
    this.igc$FreeColClient(freeColClient).diplomacyHandler(our, other, agreement);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let game = freeColServer.getGame();
    let agreement = this.getAgreement();
    if (agreement == null) {
      return serverPlayer.clientError$String('Null diplomatic agreement');
    }
    let ourUnit = null;
    let ourColony = null;
    let our = this.getOurFCGO(game);
    let cs = null;
    let ourId = this.getStringAttribute(DiplomacyMessage.OUR_ID_TAG);
    let otherId = this.getStringAttribute(DiplomacyMessage.OTHER_ID_TAG);
    if (our == null) {
      cs = serverPlayer.clientError$String('Missing our object: ' + ourId);
    } else if (our instanceof Unit) {
      ourUnit = our;
      if (!serverPlayer.owns(ourUnit)) {
        cs = serverPlayer.clientError$String('Not our unit: ' + ourId);
      } else if (!ourUnit.hasTile()) {
        cs = serverPlayer.clientError$String('Our unit is not on the map: ' + ourId);
      }
    } else if (our instanceof Colony) {
      ourColony = our;
      if (!serverPlayer.owns(ourColony)) {
        cs = serverPlayer.clientError$String('Not our settlement: ' + ourId);
      }
    } else {
      cs = serverPlayer.clientError$String('Our object is bogus: ' + $J.str(our));
    }
    if (cs != null) {
      return cs;
    }
    let otherUnit = null;
    let otherColony = null;
    let otherPlayer = null;
    let other = this.getOtherFCGO(game);
    if (other == null) {
      cs = serverPlayer.clientError$String('Missing other object: ' + otherId);
    } else if (other instanceof Unit) {
      otherUnit = other;
      if (serverPlayer.owns(otherUnit)) {
        cs = serverPlayer.clientError$String('Contacting our unit? ' + otherId);
      } else if (!otherUnit.hasTile()) {
        cs = serverPlayer.clientError$String('Other unit is not on the map: ' + otherId);
      } else if (ourUnit != null && !ourUnit.getTile$().isAdjacent(otherUnit.getTile$())) {
        cs = serverPlayer.clientError$String('Our unit ' + ourId + ' is not adjacent to other unit ' + otherId);
      } else if (ourColony != null && !ourColony.getTile$().isAdjacent(otherUnit.getTile$())) {
        cs = serverPlayer.clientError$String('Our colony ' + ourId + ' is not adjacent to other unit ' + otherId);
      } else {
        otherPlayer = otherUnit.getOwner();
      }
    } else if (other instanceof Colony) {
      otherColony = other;
      if (serverPlayer.owns(otherColony)) {
        cs = serverPlayer.clientError$String('Contacting our colony? ' + otherId);
      } else if (ourUnit != null && !ourUnit.getTile$().isAdjacent(otherColony.getTile$())) {
        cs = serverPlayer.clientError$String('Our unit ' + ourId + ' is not adjacent to other colony ' + otherId);
      } else if (ourColony != null && !ourColony.getTile$().isAdjacent(otherColony.getTile$())) {
        cs = serverPlayer.clientError$String('Our colony ' + ourId + ' is not adjacent to other colony ' + otherId);
      } else {
        otherPlayer = otherColony.getOwner();
      }
    } else {
      cs = serverPlayer.clientError$String('Other object is bogus: ' + $J.str(other));
    }
    if (cs != null) {
      return cs;
    }
    if (ourUnit == null && otherUnit == null) {
      return serverPlayer.clientError$String('Both units null');
    }
    let senderPlayer = agreement.getSender();
    let recipientPlayer = agreement.getRecipient();
    if (senderPlayer == null) {
      cs = serverPlayer.clientError$String('Null sender in agreement.');
    } else if (recipientPlayer == null) {
      cs = serverPlayer.clientError$String('Null recipient in agreement.');
    } else if (senderPlayer.isREF() || recipientPlayer.isREF()) {
      cs = serverPlayer.clientError$String('The REF does not negotiate');
    }
    if (cs != null) {
      return cs;
    }
    let igc = freeColServer.getInGameController();
    switch (agreement.getContext()) {
      case DiplomaticTrade$TradeContext.CONTACT:
        cs = igc.europeanFirstContact(serverPlayer, ourUnit, ourColony, otherUnit, otherColony, agreement);
        break;
      case DiplomaticTrade$TradeContext.DIPLOMATIC:
        cs = (ourUnit != null) ? ((!ourUnit.hasAbility$String(Ability.NEGOTIATE)) ? serverPlayer.clientError$String('Unit lacks ability to negotiate: ' + $J.str(ourUnit)) : (otherColony == null) ? serverPlayer.clientError$String('Null other settlement') : igc.diplomacy$ServerPlayer$Unit$Colony$DiplomaticTrade(serverPlayer, ourUnit, otherColony, agreement)) : ((!otherUnit.hasAbility$String(Ability.NEGOTIATE)) ? serverPlayer.clientError$String('Unit lacks ability to negotiate: ' + $J.str(otherUnit)) : igc.diplomacy$ServerPlayer$Colony$Unit$DiplomaticTrade(serverPlayer, ourColony, otherUnit, agreement));
        break;
      case DiplomaticTrade$TradeContext.TRADE:
        cs = (ourUnit != null) ? ((!ourUnit.isCarrier()) ? serverPlayer.clientError$String('Unit is not a carrier: ' + $J.str(ourUnit)) : (!serverPlayer.hasAbility$String(Ability.TRADE_WITH_FOREIGN_COLONIES)) ? serverPlayer.clientError$String('Player lacks ability to trade with other Europeans: ' + $J.str(serverPlayer)) : (otherColony == null) ? serverPlayer.clientError$String('Null other settlement') : igc.diplomacy$ServerPlayer$Unit$Colony$DiplomaticTrade(serverPlayer, ourUnit, otherColony, agreement)) : ((!otherUnit.isCarrier()) ? serverPlayer.clientError$String('Unit is not a carrier: ' + $J.str(otherUnit)) : (!otherPlayer.hasAbility$String(Ability.TRADE_WITH_FOREIGN_COLONIES)) ? serverPlayer.clientError$String('Player lacks ability to trade with other Europeans: ' + $J.str(otherPlayer)) : igc.diplomacy$ServerPlayer$Colony$Unit$DiplomaticTrade(serverPlayer, ourColony, otherUnit, agreement));
        break;
      case DiplomaticTrade$TradeContext.TRIBUTE:
        cs = (ourUnit != null) ? ((!ourUnit.isOffensiveUnit() || ourUnit.isNaval()) ? serverPlayer.clientError$String('Unit is not an offensive land unit: ' + $J.str(ourUnit)) : (otherColony == null) ? serverPlayer.clientError$String('Null other settlement') : igc.diplomacy$ServerPlayer$Unit$Colony$DiplomaticTrade(serverPlayer, ourUnit, otherColony, agreement)) : ((!otherUnit.isOffensiveUnit() || otherUnit.isNaval()) ? serverPlayer.clientError$String('Unit is not an offensive land unit: ' + $J.str(otherUnit)) : igc.diplomacy$ServerPlayer$Colony$Unit$DiplomaticTrade(serverPlayer, ourColony, otherUnit, agreement));
        break;
      default:
        break;
    }
    if (cs == null) {
      cs = serverPlayer.clientError$String('Invalid diplomacy for ' + $J.str(agreement.getContext()));
    }
    return cs;
  }
}

$J.define(DiplomacyMessage, 'net.sf.freecol.common.networking.DiplomacyMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_DiplomacyMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.DiplomaticTrade': '_DiplomacyMessage$Colony$Unit$DiplomaticTrade', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.DiplomaticTrade': '_DiplomacyMessage$Unit$Colony$DiplomaticTrade', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.DiplomaticTrade': '_DiplomacyMessage$Unit$Unit$DiplomaticTrade', 'net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.DiplomaticTrade': '_DiplomacyMessage$FreeColGameObject$FreeColGameObject$DiplomaticTrade' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getExtraUnit': 'net.sf.freecol.common.model.Unit', 'getAgreement': 'net.sf.freecol.common.model.DiplomaticTrade' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  DiplomaticTrade = $J.load('net.sf.freecol.common.model.DiplomaticTrade');
  DiplomaticTrade$TradeContext = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeContext');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
