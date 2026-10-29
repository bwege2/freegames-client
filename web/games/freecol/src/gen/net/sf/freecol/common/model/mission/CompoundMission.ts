// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/mission/CompoundMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 *  MERCHANTLIMIT or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J } from '../../../../../../../jre/index.ts';
import { AbstractMission } from './AbstractMission.ts';

let Mission$MissionState, MissionManager, CollectionUtils;

/**
 * The CompoundMission provides a wrapper for several more basic
 * Missions that will be carried out in order.
 */
export class CompoundMission extends AbstractMission {
  static readonly TAG: string = 'compoundMission';
  /**
   * The individual missions this CompoundMission wraps.
   */
  missions: List<Mission> = null;
  /**
   * The index of the current mission.
   */
  index_: number = 0;
  static readonly INDEX_TAG: string = 'index';
  /**
   * Creates a new {@code CompoundMission} instance.
   *
   * @param game a {@code Game} value
   */
  _CompoundMission$Game(game: Game): this {
    this._AbstractMission$Game(game);
    return this;
  }
  /**
   * Creates a new {@code CompoundMission} instance.
   *
   * @param game a {@code Game} value
   * @param xr a {@code FreeColXMLReader} value
   */
  _CompoundMission$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AbstractMission$Game$FreeColXMLReader(game, xr);
    return this;
  }
  /**
   * Creates a new {@code CompoundMission} instance.
   *
   * @param game a {@code Game} value
   * @param id The object identifier.
   */
  _CompoundMission$Game$String(game: Game, id: string): this {
    this._AbstractMission$Game$String(game, id);
    return this;
  }
  /**
   * Get the {@code Missions} value.
   *
   * @return A list of {@code Mission}s.
   */
  getMissions(): List<Mission> {
    return this.missions;
  }
  /**
   * Set the {@code Missions} value.
   *
   * @param newMissions The new Missions value.
   */
  setMissions(newMissions: List<Mission>): void {
    this.missions = newMissions;
  }
  /**
   * Get the {@code Index} value.
   *
   * @return an {@code int} value
   */
  getIndex(): number {
    return this.index_;
  }
  /**
   * Set the {@code Index} value.
   *
   * @param newIndex The new Index value.
   */
  setIndex(newIndex: number): void {
    this.index_ = newIndex;
  }
  /**
   * Returns true if the mission is valid.
   *
   * @return a {@code boolean} value
   */
  isValid(): boolean {
    return (super.isValid() && !this.missions.isEmpty()) ? (CollectionUtils.all$Collection$Predicate(this.missions, ($p0) => $p0.isValid())) : false;
  }
  /**
   * {@inheritDoc}
   */
  doMission(): Mission$MissionState {
    while (true) {
      let state = this.missions.get(this.index_).doMission();
      if (state === Mission$MissionState.COMPLETED) {
        this.index_++;
        if (this.index_ === this.missions.size()) {
          this.setRepeatCount((this.getRepeatCount() - 1) | 0);
          if (this.getRepeatCount() > 0) {
            this.index_ = 0;
          } else {
            return Mission$MissionState.COMPLETED;
          }
        }
        if (this.getUnit().getMovesLeft() > 0) {
          continue;
        }
      }
      return state;
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(CompoundMission.INDEX_TAG, this.index_);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it0 = this.missions.iterator(); $it0.hasNext(); ) {
      let mission = $it0.next();
      mission.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.index_ = xr.getAttribute$String$int(CompoundMission.INDEX_TAG, 0);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.missions.clear();
    while (xr.moreTags()) {
      let mission = MissionManager.getMission(this.getGame(), xr);
      if (mission != null) {
        this.missions.add(mission);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return CompoundMission.TAG;
  }
}

$J.define(CompoundMission, 'net.sf.freecol.common.model.mission.CompoundMission', { kind: 'class', sup: 'net.sf.freecol.common.model.mission.AbstractMission', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_CompoundMission$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_CompoundMission$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game': '_CompoundMission$Game' }, returns: { 'getXMLTagName': 'java.lang.String', 'isValid': 'boolean', 'getIndex': 'int', 'getMissions': 'java.util.List' } });
$J.module(() => {
  Mission$MissionState = $J.load('net.sf.freecol.common.model.mission.Mission$MissionState');
  MissionManager = $J.load('net.sf.freecol.common.model.mission.MissionManager');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
