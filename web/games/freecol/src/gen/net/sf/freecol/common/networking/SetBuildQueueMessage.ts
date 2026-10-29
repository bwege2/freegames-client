// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetBuildQueueMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Colony, Message$MessagePriority, CollectionUtils;

/**
 * The message sent when setting the build queue.
 */
export class SetBuildQueueMessage extends AttributeMessage {
  static readonly TAG: string = 'setBuildQueue';
  static readonly COLONY_TAG: string = 'colony';
  /**
   * Create a new {@code SetBuildQueueMessage} for the
   * supplied colony and queue.
   *
   * @param colony The {@code Colony} where the queue is.
   * @param queue A list of {@code BuildableType}s to build.
   */
  _SetBuildQueueMessage$Colony$List(colony: Colony, queue: List<BuildableType>): this {
    this._AttributeMessage$String$StringArr(SetBuildQueueMessage.TAG, [SetBuildQueueMessage.COLONY_TAG, colony.getId()]);
    this.setArrayAttributes$List(CollectionUtils.transform$Collection$Predicate$Function(queue, CollectionUtils.alwaysTrue(), ($p0) => $p0.getId()));
    return this;
  }
  /**
   * Create a new {@code SetAvailableMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException is the stream is corrupt.
   */
  _SetBuildQueueMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$Map(SetBuildQueueMessage.TAG, SetBuildQueueMessage.getAttributeMap(xr));
    xr.closeTag$String(SetBuildQueueMessage.TAG);
    return this;
  }
  /**
   * Get a map of attributes from the reader.
   *
   * @param xr The {@code FreeColXMLReader} to query.
   * @return A map of attributes.
   */
  static getAttributeMap(xr: FreeColXMLReader): JMap<string, string> {
    let ret = xr.getArrayAttributeMap();
    ret.put(SetBuildQueueMessage.COLONY_TAG, xr.getAttribute$String$String(SetBuildQueueMessage.COLONY_TAG, null));
    return ret;
  }
  /**
   * Get the colony that is building.
   *
   * @param player The {@code Player} that owns the colony.
   * @return The colony.
   */
  getColony(player: Player): Colony {
    return player.getOurFreeColGameObject(this.getStringAttribute(SetBuildQueueMessage.COLONY_TAG), $J.cls(Colony));
  }
  /**
   * Get the list of buildables defined by the array attributes.
   *
   * @param spec A {@code Specification} to use to make the buildable.
   * @return A list of {@code BuildableType}s.
   */
  getQueue(spec: Specification): List<BuildableType> {
    return CollectionUtils.transform$Collection$Predicate$Function$Collector(this.getArrayAttributes(), CollectionUtils.alwaysTrue(), (id) => spec.getBuildableType(id), CollectionUtils.toListNoNulls());
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
    return Message$MessagePriority.NORMAL;
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let game = freeColServer.getGame();
    let spec = game.getSpecification();
    let colony: Colony;
    try {
      colony = this.getColony(serverPlayer);
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    let buildQueue: List<BuildableType>;
    try {
      buildQueue = this.getQueue(spec);
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e1;
      }
    }
    return this.igc$FreeColServer(freeColServer).setBuildQueue(serverPlayer, colony, buildQueue);
  }
}

$J.define(SetBuildQueueMessage, 'net.sf.freecol.common.networking.SetBuildQueueMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetBuildQueueMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Colony,java.util.List': '_SetBuildQueueMessage$Colony$List' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
