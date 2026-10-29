// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/pathfinding/GoalDecider.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';

/**
 * Used by {@link net.sf.freecol.common.model.Map#search} in order to
 * determine a goal.
 *
 * The method {@link #check(Unit, PathNode)} will be called by {@link
 * net.sf.freecol.common.model.Map#search} until:
 *
 * <ol>
 *   <li>The method returns {@code true} and there is
 *       {@link #hasSubGoals() no sub goals}.</li>
 *   <li>The maximum distance of the search has been reached.</li>
 * </ol>
 *
 * The method {@link #getGoal()} will get called after this.
 */
export class GoalDecider {
}

$J.define(GoalDecider, 'net.sf.freecol.common.model.pathfinding.GoalDecider', { kind: 'interface', returns: { 'hasSubGoals': 'boolean', 'getGoal': 'net.sf.freecol.common.model.PathNode' } });
