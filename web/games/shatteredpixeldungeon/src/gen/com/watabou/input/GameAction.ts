// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/input/GameAction.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, ArrayList, JObject } from '../../../../jre/index.ts';

export class GameAction extends JObject {
  static ALL_ACTIONS: ArrayList<GameAction> = null;
  code_: number = 0;
  name_: string = null;
  static NONE: GameAction = null;
  static BACK: GameAction = null;
  static LEFT_CLICK: GameAction = null;
  static RIGHT_CLICK: GameAction = null;
  static MIDDLE_CLICK: GameAction = null;
  _GameAction(name: string): this {
    this.code_ = GameAction.ALL_ACTIONS.size();
    this.name_ = name;
    GameAction.ALL_ACTIONS.add(this);
    return this;
  }
  code(): number {
    return this.code_;
  }
  name(): string {
    return this.name_;
  }
  equals(o: any): boolean {
    return o instanceof GameAction && (o).code_ === this.code_;
  }
  static allActions(): ArrayList<GameAction> {
    return new ArrayList(GameAction.ALL_ACTIONS);
  }
  static totalActions(): number {
    return GameAction.ALL_ACTIONS.size();
  }
  static $clinit() {
    GameAction.ALL_ACTIONS = new ArrayList();
    GameAction.NONE = new GameAction()._GameAction('none');
    GameAction.BACK = new GameAction()._GameAction('back');
    GameAction.LEFT_CLICK = new GameAction()._GameAction('left_click');
    GameAction.RIGHT_CLICK = new GameAction()._GameAction('right_click');
    GameAction.MIDDLE_CLICK = new GameAction()._GameAction('middle_click');
  }
}

$J.define(GameAction, 'com.watabou.input.GameAction', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String': '_GameAction' }, clinit: true, lazy: ['ALL_ACTIONS', 'NONE', 'BACK', 'LEFT_CLICK', 'RIGHT_CLICK', 'MIDDLE_CLICK'] });
