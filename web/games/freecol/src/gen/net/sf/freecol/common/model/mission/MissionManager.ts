// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/mission/MissionManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, HashMap, JObject, Level, Logger, NoSuchMethodException } from '../../../../../../../jre/index.ts';

let FreeColXMLReader, Game, CompoundMission, GoToMission, ImprovementMission;

/**
 * The MissionManager keeps track of all missions defined.
 *
 * @see net.sf.freecol.client.gui.action.ActionManager
 */
export class MissionManager extends JObject {
  static logger: Logger = null;
  static missionMap: JMap<string, Constructor<Mission>> = null;
  _MissionManager(): this {
    return this;
  }
  /**
   * Returns true if the given String is a known mission tag.
   *
   * @param tag a {@code String} value
   * @return a {@code boolean} value
   */
  static isMissionTag(tag: string): boolean {
    return MissionManager.missionMap.containsKey(tag);
  }
  /**
   * Returns a new Mission read from the input stream if possible,
   * and null if not.
   *
   * @param game a {@code Game} value
   * @param xr a {@code FreeColXMLReader} value
   * @return a {@code Mission} value
   * @exception XMLStreamException if an error occurs
   */
  static getMission(game: Game, xr: FreeColXMLReader): Mission {
    let tag = xr.getLocalName();
    let c = MissionManager.missionMap.get(tag);
    if (c == null) {
      MissionManager.logger.warning('Unknown type of mission: \'' + tag + '\'.');
      xr.nextTag();
      return null;
    } else {
      try {
        return c.newInstance(game, xr);
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let e = $J.exc($e0);
          MissionManager.logger.log(Level.WARNING, 'Failed to instatiate mission with tag: ' + tag, e);
          return null;
        } else {
          throw $e0;
        }
      }
    }
  }
  static $clinit() {
    MissionManager.logger = Logger.getLogger($J.cls(MissionManager).getName());
    MissionManager.missionMap = new HashMap();
    try {
      MissionManager.missionMap.put(CompoundMission.TAG, $J.cls(CompoundMission).getConstructor($J.cls(Game), $J.cls(FreeColXMLReader)));
      MissionManager.missionMap.put(GoToMission.TAG, $J.cls(GoToMission).getConstructor($J.cls(Game), $J.cls(FreeColXMLReader)));
      MissionManager.missionMap.put(ImprovementMission.TAG, $J.cls(ImprovementMission).getConstructor($J.cls(Game), $J.cls(FreeColXMLReader)));
    } catch ($e1) {
      if ($J.isa($e1, NoSuchMethodException)) {
        let e = $J.exc($e1);
        MissionManager.logger.log(Level.WARNING, 'Missing constructor', e);
      } else {
        throw $e1;
      }
    }
  }
}

$J.define(MissionManager, 'net.sf.freecol.common.model.mission.MissionManager', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MissionManager' }, clinit: true, lazy: ['logger', 'missionMap'] });
$J.module(() => {
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
  Game = $J.load('net.sf.freecol.common.model.Game');
  CompoundMission = $J.load('net.sf.freecol.common.model.mission.CompoundMission');
  GoToMission = $J.load('net.sf.freecol.common.model.mission.GoToMission');
  ImprovementMission = $J.load('net.sf.freecol.common.model.mission.ImprovementMission');
});
