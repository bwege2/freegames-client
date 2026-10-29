// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ChooseFoundingFatherMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collections, Collectors, HashMap, JFunction } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let FoundingFather$FoundingFatherType, Message$MessagePriority, CollectionUtils;

/**
 * The message sent to choose a founding father.
 */
export class ChooseFoundingFatherMessage extends AttributeMessage {
  static readonly TAG: string = 'chooseFoundingFather';
  static readonly FOUNDING_FATHER_TAG: string = 'foundingFather';
  static fatherKeys: List<string> = null;
  /**
   * Create a new {@code ChooseFoundingFatherMessage} with the specified
   * fathers.
   *
   * @param fathers The {@code FoundingFather}s to choose from.
   * @param ff The {@code FoundingFather} to select.
   */
  _ChooseFoundingFatherMessage$List$FoundingFather(fathers: List<FoundingFather>, ff: FoundingFather): this {
    this._AttributeMessage$String(ChooseFoundingFatherMessage.TAG);
    this.setFatherAttributes(fathers);
    if (ff != null) {
      this.setStringAttribute(ChooseFoundingFatherMessage.FOUNDING_FATHER_TAG, ff.getId());
    }
    return this;
  }
  /**
   * Create a new {@code ChooseFoundingFatherMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _ChooseFoundingFatherMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$Map(ChooseFoundingFatherMessage.TAG, ChooseFoundingFatherMessage.getAttributeMap(xr));
    xr.closeTag$String(ChooseFoundingFatherMessage.TAG);
    return this;
  }
  /**
   * Set the attributes arising from a list of founding fathers.
   *
   * @param fathers A list of {@code FoundingFather}.
   */
  setFatherAttributes(fathers: List<FoundingFather>): void {
    this.setStringAttributeMap(CollectionUtils.transform$Collection$Predicate$Function$Collector(fathers, CollectionUtils.alwaysTrue(), JFunction.identity(), Collectors.toMap((ff) => ff.getType().getKey(), ($p0) => $p0.getId())));
  }
  /**
   * Get a map of attributes from the reader.
   *
   * @param xr The {@code FreeColXMLReader} to query.
   * @return A map of attributes.
   */
  static getAttributeMap(xr: FreeColXMLReader): JMap<string, string> {
    let ret = new HashMap(ChooseFoundingFatherMessage.fatherKeys.size());
    for (const $it0 = ChooseFoundingFatherMessage.fatherKeys.iterator(); $it0.hasNext(); ) {
      let key = $it0.next();
      let val = xr.getAttribute$String$String(key, null);
      ret.put(key, val);
    }
    let ffk = xr.getAttribute$String$String(ChooseFoundingFatherMessage.FOUNDING_FATHER_TAG, null);
    if (ffk != null) {
      ret.put(ChooseFoundingFatherMessage.FOUNDING_FATHER_TAG, ffk);
    }
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  currentPlayerMessage(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.EARLY;
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
    let game = freeColServer.getGame();
    let fathers = this.getFathers(game);
    aiPlayer.chooseFoundingFatherHandler(fathers);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let fathers = this.getFathers(game);
    this.igc$FreeColClient(freeColClient).chooseFoundingFatherHandler(fathers);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let game = freeColServer.getGame();
    let ff = this.getFather(game);
    if (ff == null) {
      return serverPlayer.clientError$String('No founding father selected');
    }
    return this.igc$FreeColServer(freeColServer).chooseFoundingFather(serverPlayer, ff);
  }
  /**
   * Get the chosen father.
   *
   * @param game The {@code Game} to lookup the father in.
   * @return The chosen {@code FoundingFather}, or null if none set.
   */
  getFather(game: Game): FoundingFather {
    let id = this.getStringAttribute(ChooseFoundingFatherMessage.FOUNDING_FATHER_TAG);
    return (id == null) ? null : game.getSpecification().getFoundingFather(id);
  }
  /**
   * Sets the chosen father.
   *
   * @param ff The {@code FoundingFather} to choose.
   * @return This message.
   */
  setFather(ff: FoundingFather): ChooseFoundingFatherMessage {
    this.setStringAttribute(ChooseFoundingFatherMessage.FOUNDING_FATHER_TAG, (ff == null) ? null : ff.getId());
    return this;
  }
  /**
   * Get the list of offered fathers.
   *
   * @param game The FreeCol game being played.
   * @return The offered {@code FoundingFather}s.
   */
  getFathers(game: Game): List<FoundingFather> {
    let spec = game.getSpecification();
    return CollectionUtils.transform$Collection$Predicate$Function(ChooseFoundingFatherMessage.fatherKeys, (tid) => this.hasAttribute(tid), (tid) => spec.getFoundingFather(this.getStringAttribute(tid)));
  }
  static $clinit() {
    ChooseFoundingFatherMessage.fatherKeys = Collections.unmodifiableList(CollectionUtils.transform$ObjectArr$Predicate$Function(FoundingFather$FoundingFatherType.values(), CollectionUtils.alwaysTrue(), ($p0) => $p0.getKey()));
  }
}

$J.define(ChooseFoundingFatherMessage, 'net.sf.freecol.common.networking.ChooseFoundingFatherMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ChooseFoundingFatherMessage$Game$FreeColXMLReader', 'java.util.List,net.sf.freecol.common.model.FoundingFather': '_ChooseFoundingFatherMessage$List$FoundingFather' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' }, clinit: true, lazy: ['fatherKeys'] });
$J.module(() => {
  FoundingFather$FoundingFatherType = $J.load('net.sf.freecol.common.model.FoundingFather$FoundingFatherType');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
