// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/FeatureChangeMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JString } from '../../../../../../jre/index.ts';
import { ObjectMessage } from './ObjectMessage.ts';

let FreeColXMLReader$ReadScope, Ability, HistoryEvent, LastSale, ModelMessage, Modifier, Message, Message$MessagePriority;

/**
 * The message sent when to add or remove a feature.
 */
export class FeatureChangeMessage extends ObjectMessage {
  static readonly TAG: string = 'featureChange';
  static readonly ADD_TAG: string = 'add';
  static readonly ID_TAG: string = 'id';
  /**
   * Create a new {@code FeatureChangeMessage} for the game object
   * and feature.
   *
   * @param fcgo The parent {@code FreeColGameObject} to manipulate.
   * @param fco The {@code FreeColObject} to add or remove.
   * @param add If true the object is added.
   */
  _FeatureChangeMessage$FreeColGameObject$FreeColObject$boolean(fcgo: FreeColGameObject, fco: FreeColObject, add: boolean): this {
    this._ObjectMessage$String$StringArr(FeatureChangeMessage.TAG, [FeatureChangeMessage.ID_TAG, fcgo.getId(), FeatureChangeMessage.ADD_TAG, String(add)]);
    this.appendChild(fco);
    return this;
  }
  /**
   * Create a new {@code FeatureChangeMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _FeatureChangeMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(FeatureChangeMessage.TAG, xr, [FeatureChangeMessage.ID_TAG, FeatureChangeMessage.ADD_TAG]);
    let fcos = new ArrayList();
    let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
    try {
      while (xr.moreTags()) {
        let tag = xr.getLocalName();
        let fco = null;
        if ($J.equals(Ability.TAG, tag)) {
          fco = new Ability()._Ability$Specification(game.getSpecification());
          fco.readFromXML(xr);
        } else if ($J.equals(Modifier.TAG, tag)) {
          fco = new Modifier()._Modifier$Specification(game.getSpecification());
          fco.readFromXML(xr);
        } else if ($J.equals(HistoryEvent.TAG, tag)) {
          fco = new HistoryEvent()._HistoryEvent$();
          fco.readFromXML(xr);
        } else if ($J.equals(LastSale.TAG, tag)) {
          fco = new LastSale()._LastSale$();
          fco.readFromXML(xr);
        } else if ($J.equals(ModelMessage.TAG, tag)) {
          fco = new ModelMessage()._ModelMessage$();
          fco.readFromXML(xr);
        } else {
          this.expected('Feature', tag);
        }
        fcos.add(fco);
        xr.expectTag(tag);
      }
      xr.expectTag(FeatureChangeMessage.TAG);
      this.setChildren(fcos);
    } finally {
      xr.replaceScope(rs);
    }
    return this;
  }
  /**
   * Get the parent object identifier.
   *
   * @return The parent identifier.
   */
  getParentId(): string {
    return this.getStringAttribute(FeatureChangeMessage.ID_TAG);
  }
  /**
   * Get the parent object to add/remove to.
   *
   * @param game The {@code Game} to look in.
   * @return The parent {@code FreeColGameObject}.
   */
  getParent(game: Game): FreeColGameObject {
    return game.getFreeColGameObject$String(this.getParentId());
  }
  /**
   * Get the add/remove state.
   *
   * @return True if the child object should be added to the parent.
   */
  getAdd(): boolean {
    return this.getBooleanAttribute(FeatureChangeMessage.ADD_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.OWNED;
  }
  /**
   * {@inheritDoc}
   */
  merge(message: Message): boolean {
    if (message instanceof FeatureChangeMessage) {
      let other = message;
      if ($J.equals(this.getParentId(), other.getParentId()) && this.getAdd() === other.getAdd()) {
        this.appendChildren(other.getChildren$());
        return true;
      }
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let parent = this.getParent(game);
    let children = this.getChildren$();
    let add = this.getAdd();
    if (parent == null) {
      Message.logger.warning('featureChange with null parent.');
      return;
    }
    if (children.isEmpty()) {
      Message.logger.warning('featureChange with no children.');
      return;
    }
    this.igc$FreeColClient(freeColClient).featureChangeHandler(parent, children, add);
    this.clientGeneric(freeColClient);
  }
}

$J.define(FeatureChangeMessage, 'net.sf.freecol.common.networking.FeatureChangeMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_FeatureChangeMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColObject,boolean': '_FeatureChangeMessage$FreeColGameObject$FreeColObject$boolean' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getAdd': 'boolean', 'getParentId': 'java.lang.String' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  HistoryEvent = $J.load('net.sf.freecol.common.model.HistoryEvent');
  LastSale = $J.load('net.sf.freecol.common.model.LastSale');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
