// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/SPDAction.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Exception, IOException, LinkedHashMap } from '../../../../jre/index.ts';
import { GameAction } from '../../watabou/input/GameAction.ts';

let ControllerHandler, KeyBindings, KeyEvent, Game, Bundle, FileUtils;

export class SPDAction extends GameAction {
  static NONE: GameAction = null;
  static BACK: GameAction = null;
  static LEFT_CLICK: GameAction = null;
  static RIGHT_CLICK: GameAction = null;
  static MIDDLE_CLICK: GameAction = null;
  static N: GameAction = null;
  static W: GameAction = null;
  static S: GameAction = null;
  static E: GameAction = null;
  static NW: GameAction = null;
  static NE: GameAction = null;
  static SW: GameAction = null;
  static SE: GameAction = null;
  static WAIT_OR_PICKUP: GameAction = null;
  static INVENTORY: GameAction = null;
  static INVENTORY_SELECTOR: GameAction = null;
  static QUICKSLOT_SELECTOR: GameAction = null;
  static QUICKSLOT_1: GameAction = null;
  static QUICKSLOT_2: GameAction = null;
  static QUICKSLOT_3: GameAction = null;
  static QUICKSLOT_4: GameAction = null;
  static QUICKSLOT_5: GameAction = null;
  static QUICKSLOT_6: GameAction = null;
  static BAG_1: GameAction = null;
  static BAG_2: GameAction = null;
  static BAG_3: GameAction = null;
  static BAG_4: GameAction = null;
  static BAG_5: GameAction = null;
  static EXAMINE: GameAction = null;
  static WAIT: GameAction = null;
  static REST: GameAction = null;
  static TAG_ATTACK: GameAction = null;
  static TAG_ACTION: GameAction = null;
  static TAG_LOOT: GameAction = null;
  static TAG_RESUME: GameAction = null;
  static CYCLE: GameAction = null;
  static HERO_INFO: GameAction = null;
  static JOURNAL: GameAction = null;
  static ZOOM_IN: GameAction = null;
  static ZOOM_OUT: GameAction = null;
  static defaultBindings: LinkedHashMap<number, GameAction> = null;
  static defaultControllerBindings: LinkedHashMap<number, GameAction> = null;
  static readonly BINDINGS_FILE: string = 'keybinds.dat';
  _SPDAction(name: string): this {
    this._GameAction(name);
    return this;
  }
  static getDefaults(): LinkedHashMap<number, GameAction> {
    return new LinkedHashMap(SPDAction.defaultBindings);
  }
  static getControllerDefaults(): LinkedHashMap<number, GameAction> {
    return new LinkedHashMap(SPDAction.defaultControllerBindings);
  }
  static loadBindings(): void {
    if (!KeyBindings.getAllBindings().isEmpty()) {
      return;
    }
    try {
      let b = FileUtils.bundleFromFile(SPDAction.BINDINGS_FILE);
      let firstKeys = b.getBundle('first_keys');
      let secondKeys = b.getBundle('second_keys');
      let thirdKeys = b.getBundle('third_keys');
      let defaults = SPDAction.getDefaults();
      let merged = new LinkedHashMap();
      for (const $it0 = GameAction.allActions().iterator(); $it0.hasNext(); ) {
        let a = $it0.next();
        if (firstKeys.contains(a.name()) && KeyEvent.isKeyboardKey(firstKeys.getInt(a.name()))) {
          if (firstKeys.getInt(a.name()) === 0) {
            continue;
          } else {
            merged.put(firstKeys.getInt(a.name()), a);
            for (const $it1 = defaults.keySet().iterator(); $it1.hasNext(); ) {
              let i = $it1.next();
              if (defaults.get(i) === a) {
                defaults.remove(i);
                break;
              }
            }
          }
        } else {
          for (const $it2 = defaults.keySet().iterator(); $it2.hasNext(); ) {
            let i = $it2.next();
            if (defaults.get(i) === a) {
              merged.put(i, defaults.remove(i));
              break;
            }
          }
        }
        if (secondKeys.contains(a.name()) && KeyEvent.isKeyboardKey(secondKeys.getInt(a.name()))) {
          if (secondKeys.getInt(a.name()) === 0) {
            continue;
          } else {
            merged.put(secondKeys.getInt(a.name()), a);
            for (const $it3 = defaults.keySet().iterator(); $it3.hasNext(); ) {
              let i = $it3.next();
              if (defaults.get(i) === a) {
                defaults.remove(i);
                break;
              }
            }
          }
        } else {
          for (const $it4 = defaults.keySet().iterator(); $it4.hasNext(); ) {
            let i = $it4.next();
            if (defaults.get(i) === a) {
              merged.put(i, defaults.remove(i));
              break;
            }
          }
        }
        if (thirdKeys.contains(a.name()) && KeyEvent.isKeyboardKey(thirdKeys.getInt(a.name()))) {
          if (thirdKeys.getInt(a.name()) === 0) {
            continue;
          } else {
            merged.put(thirdKeys.getInt(a.name()), a);
            for (const $it5 = defaults.keySet().iterator(); $it5.hasNext(); ) {
              let i = $it5.next();
              if (defaults.get(i) === a) {
                defaults.remove(i);
                break;
              }
            }
          }
        } else {
          for (const $it6 = defaults.keySet().iterator(); $it6.hasNext(); ) {
            let i = $it6.next();
            if (defaults.get(i) === a) {
              merged.put(i, defaults.remove(i));
              break;
            }
          }
        }
      }
      KeyBindings.setAllBindings(merged);
      defaults = SPDAction.getControllerDefaults();
      merged.clear();
      let firstButtons = b.getBundle('first_keys_controller');
      let secondButtons = b.getBundle('second_keys_controller');
      let thirdButtons = b.getBundle('third_keys_controller');
      for (const $it7 = GameAction.allActions().iterator(); $it7.hasNext(); ) {
        let a = $it7.next();
        if (firstButtons.contains(a.name()) && ControllerHandler.icControllerKey(firstButtons.getInt(a.name()))) {
          if (firstButtons.getInt(a.name()) === 0) {
            continue;
          } else {
            merged.put(firstButtons.getInt(a.name()), a);
            for (const $it8 = defaults.keySet().iterator(); $it8.hasNext(); ) {
              let i = $it8.next();
              if (defaults.get(i) === a) {
                defaults.remove(i);
                break;
              }
            }
          }
        } else {
          for (const $it9 = defaults.keySet().iterator(); $it9.hasNext(); ) {
            let i = $it9.next();
            if (defaults.get(i) === a) {
              merged.put(i, defaults.remove(i));
              break;
            }
          }
        }
        if (secondButtons.contains(a.name()) && ControllerHandler.icControllerKey(secondButtons.getInt(a.name()))) {
          if (secondButtons.getInt(a.name()) === 0) {
            continue;
          } else {
            merged.put(secondButtons.getInt(a.name()), a);
            for (const $it10 = defaults.keySet().iterator(); $it10.hasNext(); ) {
              let i = $it10.next();
              if (defaults.get(i) === a) {
                defaults.remove(i);
                break;
              }
            }
          }
        } else {
          for (const $it11 = defaults.keySet().iterator(); $it11.hasNext(); ) {
            let i = $it11.next();
            if (defaults.get(i) === a) {
              merged.put(i, defaults.remove(i));
              break;
            }
          }
        }
        if (thirdButtons.contains(a.name()) && ControllerHandler.icControllerKey(thirdButtons.getInt(a.name()))) {
          if (thirdButtons.getInt(a.name()) === 0) {
            continue;
          } else {
            merged.put(thirdButtons.getInt(a.name()), a);
            for (const $it12 = defaults.keySet().iterator(); $it12.hasNext(); ) {
              let i = $it12.next();
              if (defaults.get(i) === a) {
                defaults.remove(i);
                break;
              }
            }
          }
        } else {
          for (const $it13 = defaults.keySet().iterator(); $it13.hasNext(); ) {
            let i = $it13.next();
            if (defaults.get(i) === a) {
              merged.put(i, defaults.remove(i));
              break;
            }
          }
        }
      }
      KeyBindings.setAllControllerBindings(merged);
    } catch ($e14) {
      if ($J.isa($e14, Exception)) {
        let e = $J.exc($e14);
        KeyBindings.setAllBindings(SPDAction.getDefaults());
        KeyBindings.setAllControllerBindings(SPDAction.getControllerDefaults());
      } else {
        throw $e14;
      }
    }
  }
  static saveBindings(): void {
    let b = new Bundle()._Bundle$();
    let firstKeys = new Bundle()._Bundle$();
    let secondKeys = new Bundle()._Bundle$();
    let thirdKeys = new Bundle()._Bundle$();
    for (const $it15 = GameAction.allActions().iterator(); $it15.hasNext(); ) {
      let a = $it15.next();
      let firstCur = 0;
      let secondCur = 0;
      let thirdCur = 0;
      let firstDef = 0;
      let secondDef = 0;
      let thirdDef = 0;
      for (const $it16 = SPDAction.defaultBindings.keySet().iterator(); $it16.hasNext(); ) {
        let i = $it16.next();
        if (SPDAction.defaultBindings.get(i) === a) {
          if (firstDef === 0) {
            firstDef = i;
          } else if (secondDef === 0) {
            secondDef = i;
          } else {
            thirdDef = i;
          }
        }
      }
      let curBindings = KeyBindings.getAllBindings();
      for (const $it17 = curBindings.keySet().iterator(); $it17.hasNext(); ) {
        let i = $it17.next();
        if (curBindings.get(i) === a) {
          if (firstCur === 0) {
            firstCur = i;
          } else if (secondCur === 0) {
            secondCur = i;
          } else {
            thirdCur = i;
          }
        }
      }
      if (firstCur !== firstDef) {
        firstKeys.put$String$int(a.name(), firstCur);
      }
      if (secondCur !== secondDef) {
        secondKeys.put$String$int(a.name(), secondCur);
      }
      if (thirdCur !== thirdDef) {
        thirdKeys.put$String$int(a.name(), thirdCur);
      }
    }
    b.put$String$Bundle('first_keys', firstKeys);
    b.put$String$Bundle('second_keys', secondKeys);
    b.put$String$Bundle('third_keys', thirdKeys);
    let firstButtons = new Bundle()._Bundle$();
    let secondButtons = new Bundle()._Bundle$();
    let thirdButtons = new Bundle()._Bundle$();
    for (const $it18 = GameAction.allActions().iterator(); $it18.hasNext(); ) {
      let a = $it18.next();
      let firstCur = 0;
      let secondCur = 0;
      let thirdCur = 0;
      let firstDef = 0;
      let secondDef = 0;
      let thirdDef = 0;
      for (const $it19 = SPDAction.defaultControllerBindings.keySet().iterator(); $it19.hasNext(); ) {
        let i = $it19.next();
        if (SPDAction.defaultControllerBindings.get(i) === a) {
          if (firstDef === 0) {
            firstDef = i;
          } else if (secondDef === 0) {
            secondDef = i;
          } else {
            thirdDef = i;
          }
        }
      }
      let curBindings = KeyBindings.getAllControllerBindings();
      for (const $it20 = curBindings.keySet().iterator(); $it20.hasNext(); ) {
        let i = $it20.next();
        if (curBindings.get(i) === a) {
          if (firstCur === 0) {
            firstCur = i;
          } else if (secondCur === 0) {
            secondCur = i;
          } else {
            thirdCur = i;
          }
        }
      }
      if (firstCur !== firstDef) {
        firstButtons.put$String$int(a.name(), firstCur);
      }
      if (secondCur !== secondDef) {
        secondButtons.put$String$int(a.name(), secondCur);
      }
      if (thirdCur !== thirdDef) {
        thirdButtons.put$String$int(a.name(), thirdCur);
      }
    }
    b.put$String$Bundle('first_keys_controller', firstButtons);
    b.put$String$Bundle('second_keys_controller', secondButtons);
    b.put$String$Bundle('third_keys_controller', thirdButtons);
    try {
      FileUtils.bundleToFile(SPDAction.BINDINGS_FILE, b);
    } catch ($e21) {
      if ($J.isa($e21, IOException)) {
        let e = $J.exc($e21);
        Game.reportException(e);
      } else {
        throw $e21;
      }
    }
  }
  static $clinit() {
    SPDAction.NONE = GameAction.NONE;
    SPDAction.BACK = GameAction.BACK;
    SPDAction.LEFT_CLICK = GameAction.LEFT_CLICK;
    SPDAction.RIGHT_CLICK = GameAction.RIGHT_CLICK;
    SPDAction.MIDDLE_CLICK = GameAction.MIDDLE_CLICK;
    SPDAction.N = new SPDAction()._SPDAction('n');
    SPDAction.W = new SPDAction()._SPDAction('w');
    SPDAction.S = new SPDAction()._SPDAction('s');
    SPDAction.E = new SPDAction()._SPDAction('e');
    SPDAction.NW = new SPDAction()._SPDAction('nw');
    SPDAction.NE = new SPDAction()._SPDAction('ne');
    SPDAction.SW = new SPDAction()._SPDAction('sw');
    SPDAction.SE = new SPDAction()._SPDAction('se');
    SPDAction.WAIT_OR_PICKUP = new SPDAction()._SPDAction('wait_or_pickup');
    SPDAction.INVENTORY = new SPDAction()._SPDAction('inventory');
    SPDAction.INVENTORY_SELECTOR = new SPDAction()._SPDAction('inventory_selector');
    SPDAction.QUICKSLOT_SELECTOR = new SPDAction()._SPDAction('quickslot_selector');
    SPDAction.QUICKSLOT_1 = new SPDAction()._SPDAction('quickslot_1');
    SPDAction.QUICKSLOT_2 = new SPDAction()._SPDAction('quickslot_2');
    SPDAction.QUICKSLOT_3 = new SPDAction()._SPDAction('quickslot_3');
    SPDAction.QUICKSLOT_4 = new SPDAction()._SPDAction('quickslot_4');
    SPDAction.QUICKSLOT_5 = new SPDAction()._SPDAction('quickslot_5');
    SPDAction.QUICKSLOT_6 = new SPDAction()._SPDAction('quickslot_6');
    SPDAction.BAG_1 = new SPDAction()._SPDAction('bag_1');
    SPDAction.BAG_2 = new SPDAction()._SPDAction('bag_2');
    SPDAction.BAG_3 = new SPDAction()._SPDAction('bag_3');
    SPDAction.BAG_4 = new SPDAction()._SPDAction('bag_4');
    SPDAction.BAG_5 = new SPDAction()._SPDAction('bag_5');
    SPDAction.EXAMINE = new SPDAction()._SPDAction('examine');
    SPDAction.WAIT = new SPDAction()._SPDAction('wait');
    SPDAction.REST = new SPDAction()._SPDAction('rest');
    SPDAction.TAG_ATTACK = new SPDAction()._SPDAction('tag_attack');
    SPDAction.TAG_ACTION = new SPDAction()._SPDAction('tag_action');
    SPDAction.TAG_LOOT = new SPDAction()._SPDAction('tag_loot');
    SPDAction.TAG_RESUME = new SPDAction()._SPDAction('tag_resume');
    SPDAction.CYCLE = new SPDAction()._SPDAction('cycle');
    SPDAction.HERO_INFO = new SPDAction()._SPDAction('hero_info');
    SPDAction.JOURNAL = new SPDAction()._SPDAction('journal');
    SPDAction.ZOOM_IN = new SPDAction()._SPDAction('zoom_in');
    SPDAction.ZOOM_OUT = new SPDAction()._SPDAction('zoom_out');
    SPDAction.defaultBindings = new LinkedHashMap();
    SPDAction.defaultBindings.put(111, SPDAction.BACK);
    SPDAction.defaultBindings.put(67, SPDAction.BACK);
    SPDAction.defaultBindings.put(51, SPDAction.N);
    SPDAction.defaultBindings.put(29, SPDAction.W);
    SPDAction.defaultBindings.put(47, SPDAction.S);
    SPDAction.defaultBindings.put(32, SPDAction.E);
    SPDAction.defaultBindings.put(62, SPDAction.WAIT_OR_PICKUP);
    SPDAction.defaultBindings.put(19, SPDAction.N);
    SPDAction.defaultBindings.put(21, SPDAction.W);
    SPDAction.defaultBindings.put(20, SPDAction.S);
    SPDAction.defaultBindings.put(22, SPDAction.E);
    SPDAction.defaultBindings.put(152, SPDAction.N);
    SPDAction.defaultBindings.put(148, SPDAction.W);
    SPDAction.defaultBindings.put(146, SPDAction.S);
    SPDAction.defaultBindings.put(150, SPDAction.E);
    SPDAction.defaultBindings.put(151, SPDAction.NW);
    SPDAction.defaultBindings.put(153, SPDAction.NE);
    SPDAction.defaultBindings.put(145, SPDAction.SW);
    SPDAction.defaultBindings.put(147, SPDAction.SE);
    SPDAction.defaultBindings.put(149, SPDAction.WAIT_OR_PICKUP);
    SPDAction.defaultBindings.put(34, SPDAction.INVENTORY);
    SPDAction.defaultBindings.put(37, SPDAction.INVENTORY);
    SPDAction.defaultBindings.put(8, SPDAction.QUICKSLOT_1);
    SPDAction.defaultBindings.put(9, SPDAction.QUICKSLOT_2);
    SPDAction.defaultBindings.put(10, SPDAction.QUICKSLOT_3);
    SPDAction.defaultBindings.put(11, SPDAction.QUICKSLOT_4);
    SPDAction.defaultBindings.put(12, SPDAction.QUICKSLOT_5);
    SPDAction.defaultBindings.put(13, SPDAction.QUICKSLOT_6);
    SPDAction.defaultBindings.put(131, SPDAction.BAG_1);
    SPDAction.defaultBindings.put(132, SPDAction.BAG_2);
    SPDAction.defaultBindings.put(133, SPDAction.BAG_3);
    SPDAction.defaultBindings.put(134, SPDAction.BAG_4);
    SPDAction.defaultBindings.put(135, SPDAction.BAG_5);
    SPDAction.defaultBindings.put(33, SPDAction.EXAMINE);
    SPDAction.defaultBindings.put(54, SPDAction.REST);
    SPDAction.defaultBindings.put(45, SPDAction.TAG_ATTACK);
    SPDAction.defaultBindings.put(61, SPDAction.CYCLE);
    SPDAction.defaultBindings.put(52, SPDAction.TAG_ACTION);
    SPDAction.defaultBindings.put(31, SPDAction.TAG_LOOT);
    SPDAction.defaultBindings.put(66, SPDAction.TAG_LOOT);
    SPDAction.defaultBindings.put(46, SPDAction.TAG_RESUME);
    SPDAction.defaultBindings.put(36, SPDAction.HERO_INFO);
    SPDAction.defaultBindings.put(38, SPDAction.JOURNAL);
    SPDAction.defaultBindings.put(81, SPDAction.ZOOM_IN);
    SPDAction.defaultBindings.put(70, SPDAction.ZOOM_IN);
    SPDAction.defaultBindings.put(69, SPDAction.ZOOM_OUT);
    SPDAction.defaultControllerBindings = new LinkedHashMap();
    SPDAction.defaultControllerBindings.put(108, SPDAction.BACK);
    SPDAction.defaultControllerBindings.put(109, SPDAction.JOURNAL);
    SPDAction.defaultControllerBindings.put(105, SPDAction.LEFT_CLICK);
    SPDAction.defaultControllerBindings.put(107, SPDAction.LEFT_CLICK);
    SPDAction.defaultControllerBindings.put(104, SPDAction.RIGHT_CLICK);
    SPDAction.defaultControllerBindings.put((19 + 1000) | 0, SPDAction.TAG_ACTION);
    SPDAction.defaultControllerBindings.put((21 + 1000) | 0, SPDAction.TAG_LOOT);
    SPDAction.defaultControllerBindings.put((20 + 1000) | 0, SPDAction.TAG_RESUME);
    SPDAction.defaultControllerBindings.put((22 + 1000) | 0, SPDAction.CYCLE);
    SPDAction.defaultControllerBindings.put(106, SPDAction.WAIT_OR_PICKUP);
    SPDAction.defaultControllerBindings.put(103, SPDAction.ZOOM_IN);
    SPDAction.defaultControllerBindings.put(102, SPDAction.ZOOM_OUT);
    SPDAction.defaultControllerBindings.put(96, SPDAction.TAG_ATTACK);
    SPDAction.defaultControllerBindings.put(97, SPDAction.EXAMINE);
    SPDAction.defaultControllerBindings.put(99, SPDAction.QUICKSLOT_SELECTOR);
    SPDAction.defaultControllerBindings.put(100, SPDAction.INVENTORY_SELECTOR);
    KeyBindings.addHardBinding(4, SPDAction.BACK);
    KeyBindings.addHardBinding(82, SPDAction.INVENTORY);
    KeyBindings.addHardBinding(58, SPDAction.NONE);
    KeyBindings.addHardBinding(66, SPDAction.NONE);
  }
}

$J.define(SPDAction, 'com.shatteredpixel.shatteredpixeldungeon.SPDAction', { kind: 'class', sup: 'com.watabou.input.GameAction', ctors: { 'java.lang.String': '_SPDAction' }, clinit: true, lazy: ['NONE', 'BACK', 'LEFT_CLICK', 'RIGHT_CLICK', 'MIDDLE_CLICK', 'N', 'W', 'S', 'E', 'NW', 'NE', 'SW', 'SE', 'WAIT_OR_PICKUP', 'INVENTORY', 'INVENTORY_SELECTOR', 'QUICKSLOT_SELECTOR', 'QUICKSLOT_1', 'QUICKSLOT_2', 'QUICKSLOT_3', 'QUICKSLOT_4', 'QUICKSLOT_5', 'QUICKSLOT_6', 'BAG_1', 'BAG_2', 'BAG_3', 'BAG_4', 'BAG_5', 'EXAMINE', 'WAIT', 'REST', 'TAG_ATTACK', 'TAG_ACTION', 'TAG_LOOT', 'TAG_RESUME', 'CYCLE', 'HERO_INFO', 'JOURNAL', 'ZOOM_IN', 'ZOOM_OUT', 'defaultBindings', 'defaultControllerBindings'] });
$J.module(() => {
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  Game = $J.load('com.watabou.noosa.Game');
  Bundle = $J.load('com.watabou.utils.Bundle');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
});
